import moment from 'moment'
import {Dialog} from 'primereact/dialog'
import {useEffect, useRef, useState} from 'react'
import _ from 'lodash'
import {Chip} from 'primereact/chip'
import {OverlayPanel} from 'primereact/overlaypanel'
import {Checkbox} from 'primereact/checkbox'
import {Divider} from 'primereact/divider'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {fetchTeams, getTeams} from '../../Teams/slice/team.slice'
import {MultiSelect} from 'primereact/multiselect'
import {fetchDetailWeek, fetchWeekTime, getDetailWeek, getWeekTime} from '../slice/rapports.slice'
import {ProgressSpinner} from 'primereact/progressspinner'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

let days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
let months = moment.monthsShort()
let uEvents = [
  {
    fullname: 'Dodji AKAKPO',
    badge: 'AD',
    date: '2024-08-19',
    weekPresence: {
      Lun: {
        start: '08:00',
        end: '18:00',
        events: [
          {from: '08:00', to: '13:30', label: 'Entrée', bgColor: 'orange'},
          {from: '13:30', to: '14:20', label: 'Sortie', bgColor: 'gray'},
          {from: '14:20', to: '17:30', label: 'Entrée', bgColor: 'blue'},
        ],
      },
      Mar: {
        start: '08:00',
        end: '18:00',
        events: [
          {from: '08:10', to: '12:00', label: 'Entrée', bgColor: 'red'},
          {from: '12:00', to: '14:40', label: 'Sortie', bgColor: 'green'},
          {from: '14:40', to: '18:00', label: 'Entrée', bgColor: 'teal'},
        ],
      },
      Mer: {
        start: '08:00',
        end: '18:00',
        events: [
          {from: '09:00', to: '12:30', label: 'Entrée', bgColor: 'orange'},
          {from: '12:30', to: '13:10', label: 'Sortie', bgColor: 'gray'},
          {from: '13:10', to: '18:30', label: 'Entrée', bgColor: 'indigo'},
        ],
      },
      Jeu: {
        start: '08:00',
        end: '18:00',
        events: [
          {from: '08:10', to: '12:20', label: 'Entrée', bgColor: 'red'},
          {from: '12:20', to: '13:00', label: 'Sortie', bgColor: 'green'},
          {from: '13:00', to: '17:00', label: 'Entrée', bgColor: 'teal'},
        ],
      },
      Ven: {
        start: '08:00',
        end: '18:00',
        events: [
          {from: '07:10', to: '11:00', label: 'Entrée', bgColor: 'orange'},
          {from: '11:00', to: '14:10', label: 'Sortie', bgColor: 'gray'},
          {from: '14:10', to: '17:30', label: 'Entrée', bgColor: 'indigo'},
        ],
      },
    },
  },
  {
    fullname: 'Dodji AKAKPO',
    badge: 'AD',
    date: '2024-08-26',
    weekPresence: {
      Lun: {
        start: '08:00',
        end: '18:00',
        events: [
          {from: '08:40', to: '09:00', label: 'Entrée', bgColor: 'orange'},
          // {from: '13:30' , to: '14:10' , label: 'Sortie' , bgColor: 'gray'},
          // {from: '14:10' , to: '17:10' , label: 'Entrée' , bgColor: 'blue'},
        ],
      },
    },
  },
  {fullname: 'Saad BENNANI', badge: 'SB', date: '2024-08-19'},
  {fullname: 'Zakaria RAHALI', badge: 'ZR', date: '2024-08-19'},
  {fullname: 'Rada SADIKI', badge: 'RD', date: '2024-08-19'},
]
let users = ['Dodji AKAKPO', 'Saad BENNANI', 'Zakaria RAHALI', 'Rada SADIKI']
const NewRepportComponent = () => {
  let [currentMoment, setCurrentMoment] = useState(moment().format('YYYY-MM-DD'))
  let [dateObject, setDateObject] = useState(null)
  let [showUserInfoFor, setShowUserInfoFor] = useState('')
  let [currentUsersEvents, setCurrentUsersEvents] = useState([])
  let [selectedStaffNames, setSelectedStaffNames] = useState(null)
  const [width, setWidth] = useState(window.innerWidth)
  const [loading, setLoading] = useState(false)
  let [usersEvents, setUsersEvents] = useState(uEvents)

  const dispatch = useAppDispatch()

  const teams = useAppSelector(getTeams)
  const weekTime = useAppSelector(getWeekTime)
  const weekDetail = useAppSelector(getDetailWeek)

  let usersRef = useRef()
  const goToWeek = (type) => {
    try {
      if (!['prev', 'next'].includes(type) || !isCurrentDateValid()) return
      if (showUserInfoFor) setShowUserInfoFor('')
      let current = moment(currentMoment)
        [type == 'prev' ? 'subtract' : 'add'](1, 'weeks')
        .format('YYYY-MM-DD')
      const debouncedUpdate = _.debounce(() => updateEvents(current), 300)

      debouncedUpdate()
      setCurrentMoment(current)
    } catch (e) {
    }
  }

  const isCurrentDateValid = () => {
    return currentMoment
  }

  const extractHours = (timeString) => {
    if (!timeString || timeString === '0') return 0 // Handle "0" or undefined
    const match = timeString.match(/^(\d+):/) // Regex to match the numeric part before ':'
    return match ? parseInt(match[1], 10) : 0 // Convert to integer
  }

  const getDetailWeekFc = (data) => {
    setLoading(true)
    const currentDate = moment(currentMoment)
    const startOfWeek = moment(currentDate).startOf('week').add(1, 'days')
    const endOfWeek = moment(currentDate).endOf('week')
    let obj = {
      StartDate: startOfWeek.format('DD-MM-YYYY'),
      EndDate: endOfWeek.add(1, 'days').format('DD-MM-YYYY'),
      srcId: data.uid,
    }
    dispatch(fetchDetailWeek(obj)).then(() => {
      setShowUserInfoFor(showUserInfoFor == data.fullname ? '' : data.fullname)
      setLoading(false)
    })
  }

  const itemTemplate = (data) => {
    // let dayPresence = data.weekPresence
    //   ? Object.entries(data.weekPresence).reduce((c, [day, evt]) => {
    //       c[day] = evt.events
    //         .filter((o) => o.label == 'Entrée')
    //         .reduce((_c, _evt) => {
    //           _c += moment(_evt.to, 'HH:mm').diff(moment(_evt.from, 'HH:mm'), 'minutes', true)
    //           return _c
    //         }, 0)

    //       let hours = Math.floor(c[day] / 60)
    //       c[day] = hours + ':' + (c[day] % 60)

    //       return c
    //     }, {})
    //   : {}

    const timeSpentByDay = data.weeklyData.reduce((acc, dayData) => {
      acc[dayData.DayOfWeek] = dayData.TotalTimeSpent
      return acc
    }, {})
    return (
      <div>
        <div className='flex border-top justify-content-between bg-gray-200'>
          <div
            onClick={
              () => getDetailWeekFc(data)
              // setShowUserInfoFor(showUserInfoFor == data.fullname ? '' : data.fullname)
            }
            style={{gap: 10, width: '25%'}}
            className='flex  p-2 align-items-center cursor-pointer hover:bg-blue-100 justify--center'
          >
            <div
              style={{width: '30px', height: '30px', borderRadius: '50%'}}
              className='bg-blue-400 text-white flex align-items-center justify-content-center'
            >
              {data.badge}
            </div>
            <div>{data.fullname}</div>
          </div>
          <div className='flex justify-content-between mt-3'>
            {days.map((day) => (
              <div
                key={day}
                style={{width: `${calculatedWidth}px`}}
                className='text-center text-sm'
              >
                <span
                  className={`${
                    extractHours(timeSpentByDay[day]) > 0 ? 'bg-green-300' : 'bg-red-200'
                  } text-lg p-2 border border-round-lg border-gray-300 font-semibold`}
                >
                  {extractHours(timeSpentByDay[day]) > 0 ? timeSpentByDay[day] : '0h'}
                </span>
              </div>
            ))}
          </div>
        </div>
        {showUserInfoFor == data.fullname && weekPresenceTemplate(weekDetail)}
      </div>
    )
  }

  const colorByPercent = (data) => {
    if (data.resultPercentage > 0 && data.resultPercentage < 30) {
      return '#e95555'
    }
    if (data.resultPercentage > 30 && data.resultPercentage < 60) {
      return '#ffba08'
    }
    if (data.resultPercentage > 60 && data.resultPercentage < 100) {
      return '#aacc00'
    }
  }

  const weekPresenceTemplate = (data) => {
    let weekPresence = data.weekPresence
    if (Array.isArray(weekPresence)) {
      // let events = Object.entries(weekPresence)
      // events = events.map(([day, ev]) => {
      //   let f = ev.events[0]
      //   let e = ev.events[ev.events.length - 1]
      //   let start = moment(f.from, 'HH:mm')
      //   let end = moment(e.to, 'HH:mm')
      //   let diff = end.diff(start, 'seconds', true)
      //   ev.events.forEach((_ev) => {
      //     let diff2 = moment(_ev.to, 'HH:mm').diff(moment(_ev.from, 'HH:mm'), 'seconds', true)
      //     _ev.percentWidth = (diff2 / diff) * 100
      //   })

      //   return [day, ev]
      // })

      return (
        <div className='flex justify-content-end mb-2'>
          <div style={{width: '70%', paddingLeft: '5px'}} className='shadow'>
            {weekPresence.map((wk) => (
              <div className='flex align-items-center justify-content-between border-top'>
                <div className='text-center w-3'>
                  <strong className='text-center text-xl'>{wk.DayOfWeek}</strong>
                </div>
                <div
                  style={{width: `${7 * calculatedWidth}px`, height: `${50}px`}}
                  className='bg-blue-200 flex align-items-center'
                >
                  {wk?.events && Array.isArray(wk?.events)
                    ? wk?.events?.map((o) => (
                        <div
                          title={`${o.time} -(${o.label})`}
                          className='p-2 text-white cursor-pointer text-center'
                          style={{
                            fontSize: '8px',
                            height: '100%',
                            overflow: 'hidden',
                            background: colorByPercent(o),
                            borderRight: '1px solid white',
                            width: `${o?.resultPercentage || 0}%`,
                          }}
                        >
                          <strong className='text-sm'>{o.time}</strong>
                          <div>{o.label}</div>
                        </div>
                      ))
                    : noWorkTemplate()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  const noWorkTemplate = () => {
    return (
      <div className='w-full flex flex-row justify-content-center align-items-center gap-2'>
        <strong>
          <OlangItem olang='noWork' />
        </strong>
        <i className='fas fa-solid fa-calendar-xmark text-lg text-red-400'></i>
      </div>
    )
  }

  const toggleOverlay = (ref, e) => {
    if (!ref?.current) return
    ref.current.toggle(e)
  }

  const toggleSelectUser = (id) => {
    setSelectedStaffNames((prev) => {
      let t = _.cloneDeep(prev)
      if (!Array.isArray(t)) t = []

      if (t.includes(id)) t = id == 'Tout' ? [] : t.filter((i) => i != id)
      else {
        if (id == 'Tout') t = ['Tout', ...users]
        else t.push(id)
      }

      return t
    })
  }

  const updateEvents = (day, teams) => {
    setLoading(true)
    const currentDate = moment(day)
    const startOfWeek = moment(currentDate).startOf('week').add(1, 'days')
    const endOfWeek = moment(currentDate).endOf('week')
    let obj = {
      StartDate: startOfWeek.format('DD-MM-YYYY'),
      EndDate: endOfWeek.add(1, 'days').format('DD-MM-YYYY'),
      staffList: selectedStaffNames || teams,
    }
    dispatch(fetchWeekTime(obj)).then(() => setLoading(false))
  }

  useEffect(() => {
    if (!isCurrentDateValid()) return
    let start = moment(currentMoment)
    let fWeek = start.clone().weekday(1)
    let eWeek = start.clone().weekday(6)
    let obj = days.reduce((c, v, idx) => {
      let date = start.clone().weekday(idx + 1)
      c[v] = {
        day: date.date(),
        moment: date,
        month: months[date.month()],
      }
      return c
    }, {})

    let eventFiltered = usersEvents.filter((usrEvt) => {
      return moment(usrEvt.date, 'YYYY-MM-DD').isBetween(fWeek, eWeek, 'day', '[]')
    })
    setDateObject(obj)
    setCurrentUsersEvents(eventFiltered)
  }, [currentMoment, usersEvents])

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // useEffect(() => {
  //   updateEvents(currentMoment)
  // }, [currentMoment])

  // useEffect(() => {
  //   let timer = setInterval(() => {
  //     updateEvents()
  //   }, 3000)
  //   return () => clearInterval()
  // }, [])

  useEffect(() => {
    dispatch(fetchTeams()).then(({payload}) => {
      if (payload) {
        let dataTeams = payload.map((o) => o.id)
        setSelectedStaffNames(dataTeams)

        updateEvents(moment(), dataTeams)
      }
    })
  }, [])

  const calculatedWidth =
    width > 1920 ? 130 : width > 1536 ? 100 : width > 1024 ? 100 : width > 768 ? 80 : 60

  return (
    <div>
      <div className='flex shadow p-3 justify-content-between align-items-center'>
        <div className='flex flex-row align-items-center gap-2'>
          <strong className='text-xl text-blue-400'>
            <OlangItem olang='rpt.staff' /> |
          </strong>
          {loading && (
            <ProgressSpinner
              style={{width: '40px', height: '40px'}}
              strokeWidth='4'
              fill='var(--surface-ground)'
              animationDuration='.5s'
            />
          )}
        </div>
        <div className='flex align-items-center' style={{gap: 10}}>
          {/* <div>
            <Chip
              icon={'pi pi-file'}
              label={'Exporter'}
              onClick={(e) => alert('Export')}
              className='cursor-pointer bg-orange-300 text hover:bg-blue-100 p-button-text text-sm bg-blue-50'
              style={{height: 'auto'}}
            />
          </div> */}
          <div>
            {/* <Chip
              icon={'pi pi-users'}
              label={
                selectedStaffNames.includes('Tout')
                  ? 'Tout'
                  : selectedStaffNames.join(',') || 'Agents'
              }
              onClick={(e) => toggleOverlay(usersRef, e)}
              className='cursor-pointer hover:bg-blue-100 p-button-text text-sm bg-blue-50'
              style={{height: 'auto'}}
            />
            <OverlayPanel ref={usersRef} className='p-0'>
              <div className='' style={{maxHeight: '300px', overflow: 'auto', minWidth: '150px'}}>
                {['Tout', ...users].map((s, i) => (
                  <div
                    key={s}
                    onClick={(e) => {
                      toggleSelectUser(s)
                      // toggleOverlay(usersRef , e)
                    }}
                    className={`p-2 flex gap-2 align-items-center hover:bg-blue-100 border-top-${
                      i != 0 && 1
                    } border-gray-200 cursor-pointer`}
                  >
                    <Checkbox checked={selectedStaffNames.includes(s)} />
                    <span> {s} </span>
                  </div>
                ))}
              </div>
            </OverlayPanel> */}
            <div className='flex flex-row align-items-center gap-2'>
              <MultiSelect
                value={selectedStaffNames}
                onChange={(e) => setSelectedStaffNames(e.value)}
                display='chip'
                options={teams}
                optionLabel='firstname'
                filter
                optionValue='id'
                placeholder='Select user'
                maxSelectedLabels={3}
                className='w-full md:w-20rem'
              />
              <ButtonComponent
                icon='pi pi-search'
                severity='success'
                aria-label='Search'
                onClick={() => {
                  updateEvents(currentMoment)
                }}
              />
            </div>
          </div>
          <Divider layout='vertical' />
          <div
            style={{width: '200px', border: '1px solid #eee', borderRadius: '3px'}}
            className='p-3 flex align-items-center justify-content-around'
          >
            <span onClick={() => goToWeek('prev')} className='fa-solid fa-arrow-left'></span>
            <strong>
              <span>
                {dateObject?.['Lun']?.day} {dateObject?.['Lun']?.month}
              </span>
              <span className='mx-2'>au</span>
              <span>
                {dateObject?.['Dim']?.day} {dateObject?.['Dim']?.month}
              </span>
            </strong>
            <span onClick={() => goToWeek('next')} className='fa-solid fa-arrow-right'></span>
          </div>
        </div>
      </div>
      <div className='mt-3 shadow p-2'>
        <div className='flex justify-content-between py-3 '>
          <strong className='ml-2'>
            <OlangItem olang='agents' />
          </strong>
          <div className='flex justify-content-between'>
            {days.map((l) => (
              <div
                style={{width: `${calculatedWidth}px`}}
                className='text-center bg-blue-400 text-white'
              >
                <strong className='text-base'>
                  {l} {dateObject?.[l]?.day}
                </strong>
              </div>
            ))}
          </div>
        </div>
        {Array.isArray(weekTime) && weekTime.length > 0 ? (
          weekTime.map(itemTemplate)
        ) : (
          <div className='pt-7 pb-2 flex justify-content-center'>
            {/* <span className='pi pi-tag'></span> */}
            <strong className='text-xl text-gray-500'>Aucun evenement de presence</strong>
          </div>
        )}
      </div>
      <div></div>
    </div>
  )
}

export default NewRepportComponent
