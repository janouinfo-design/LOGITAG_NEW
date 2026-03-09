import FullCalendar from '@fullcalendar/react'
import timelineGridPlugin from '@fullcalendar/resource-timeline'
import frLocal from '@fullcalendar/core/locales/fr'
import React, {useEffect, useRef, useState} from 'react'
import {fetchEngines, getEngines, getSelectedEngine, setSelectedEngine} from '../slice/engin.slice'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {fetchEngineEvents, getEngineEvents} from '../../Planning/slice/planing.slice'
import {Chip} from 'primereact/chip'
import EnginMapLocation from '../EnginList/EnginMapLocation'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {Image} from 'primereact/image'
import {Button} from 'primereact/button'
import {SplitButton} from 'primereact/splitbutton'
import {useLocalStorage} from 'primereact/hooks'
import moment from 'moment'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

function CalendarViewEngin() {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [daysDisplay, setDaysDisplay] = useLocalStorage(2, 'daysDisplay')
  const [currentDate, setCurrentDate] = useState({
    start: new Date(),
    end: new Date(),
  })
  const [slotDuration, setSlotDuration] = useState('00:30:00')

  const IMAGE_BASE_URL = API_BASE_URL_IMAGE
  const calendarRef = useRef(null)
  const enginesData = useAppSelector(getEngines)
  const selectedEngine = useAppSelector(getSelectedEngine)
  const dispatch = useAppDispatch()
  const engineEventsData = useAppSelector(getEngineEvents)


  const handleShowMap = (rowData) => {
    dispatch(setSelectedEngine(rowData))
    setDialogVisible(true)
  }

  const iconTemplate = (rowData) => {
    let icon = ''
    let color = ''
    if (rowData?.etatenginname === 'exit') {
      icon = 'fa-solid fa-up-from-bracket'
      color = '#D64B70'
    } else if (rowData?.etatenginname === 'reception') {
      icon = 'fa-solid fa-down-to-bracket'
      color = 'green'
    } else if (rowData?.etatenginname === 'nonactive') {
      icon = 'fa-solid fa-octagon-exclamation'
      color = 'red'
    }
    return (
      <div>
        <i
          style={{color}}
          className={`${icon} text-2xl rounded p-2 cursor-pointer`}
          title={`${rowData?.etatengin} ${rowData?.locationDate ?? '2023-06-22 10:30:00 Test '}`}
          alt={`${rowData?.etatengin} ${rowData?.locationDate ?? '2023-06-22 10:30:00  Test'}`}
          onClick={() => handleShowMap(rowData)}
        ></i>
      </div>
    )
  }
  const familleTagTemplate = (rowData) => {
    return (
      <Chip
        label={rowData.familleTag}
        title={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        alt={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
        icon={rowData.familleIconTag}
        style={{background: rowData.familleTagIconBgcolor, color: rowData.familleTagIconColor}}
        className='cursor-pointer'
        onClick={() => handleShowMap(rowData, '')}
      />
    )
  }
  const tagTemplate = (rowData) => {
    return (
      <div className='flex flex-column'>
        <div className='flex justify-content-center'>
          {rowData.tagId ? (
            familleTagTemplate(rowData)
          ) : (
            <Chip
              label='Untagged'
              className='cursor-pointer'
              onClick={() => handleShowMap(rowData, '')}
            />
          )}
        </div>
      </div>
    )
  }

  const statusTemplate = (rowData) => {
    if (rowData?.iconName) {
      return (
        <i
          title={rowData?.statuslabel}
          className={`${rowData?.iconName} text-2xl rounded p-2`}
          style={{color: `${rowData.statusbgColor}`}}
        ></i>
      )
    }
    return (
      <Chip
        label={rowData?.statuslabel}
        style={{background: `${rowData.statusbgColor}`, color: rowData.color ?? 'white'}}
        title={`${rowData?.statusDate}`}
      />
    )
  }

  const handlePrevClick = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.prev()
    getDisplayedDate()
  }

  const getDisplayedDate = () => {
    const calendarApi = calendarRef.current.getApi()
    const view = calendarApi.view
    const start = view.currentStart
    const end = view.currentEnd

    setCurrentDate({start: new Date(start), end: new Date(end)})
    // setCurrentRange({ start, end });
  }

  const goToToday = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.gotoDate(new Date())
    setCurrentDate(new Date())
  }

  const displayTheDay = (day) => {
    setDaysDisplay(day)
    setTimeout(() => {
      getDisplayedDate()
    }, 300)
  }

  const formatDuration = (minutes) => {
    const duration = moment.duration(minutes, 'minutes')
    return moment.utc(duration.asMilliseconds()).format('HH:mm:ss')
  }

  const decrementSlotDuration = () => {
    const currentSlotDuration = moment.duration(slotDuration).asMinutes()
    const newSlotDuration = currentSlotDuration - 5

    if (newSlotDuration >= 5) {
      setSlotDuration(formatDuration(newSlotDuration))
    }
  }
  const incrementSlotDuration = () => {
    const currentSlotDuration = moment.duration(slotDuration).asMinutes()
    const newSlotDuration = currentSlotDuration + 5

    if (newSlotDuration <= 1440) {
      setSlotDuration(formatDuration(newSlotDuration))
    }
  }

  const handleNextClick = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.next()
    getDisplayedDate()
  }

  const familleTemplate = ({famille, familleIcon, familleBgcolor, familleColor}) => {
    return (
      <Chip
        label={famille}
        icon={familleIcon}
        style={{background: familleBgcolor, color: 'white'}}
      />
    )
  }

  const renderRessources = [
    {
      field: 'title',
      headerContent: 'Engine List',
      cellContent: (r) => {
        const {image, tagId, label, reference, tagname, famille, familleIcon, familleBgcolor, vin} =
          r.resource._resource.extendedProps || {}

        return (
          <div className='p-2'>
            <div className='d-flex'>
              <div className=''>
                <Image
                  src={API_BASE_URL_IMAGE + image}
                  alt={r.fieldValue}
                  width='60'
                  height='60'
                  preview
                  imageStyle={{objectFit: 'cover', borderRadius: '10px'}}
                />
              </div>
              <div className=''>
                <div className='flex flex-column mx-2'>
                  <div className='event-title h5 font-medium'>{reference}</div>
                  {/* <div className='font-normal'>
                    {tagId == null || tagId === '' || tagId === undefined || tagId === 0
                      ? 'No Tag'
                      : tagId}
                  </div> */}
                  <div>{tagname}</div>
                  {/* <div className='font-normal'>{reference}</div> */}
                  <div>{familleTemplate({famille, familleIcon, familleBgcolor})}</div>
                  {/* <div className='font-normal'>{vin}</div> */}
                </div>
              </div>
            </div>
            <div className=''>
              <div className='flex flex-row mx-2'>
                <div className='engin-icon-content mx-1 p-1'>
                  {iconTemplate(r.resource._resource.extendedProps)}
                </div>
                <div className='tag-content mx-1 p-1'>
                  {tagTemplate(r.resource._resource.extendedProps)}
                </div>
                <div className='status-content mx-1 p-1'>
                  {statusTemplate(r.resource._resource.extendedProps)}
                </div>
              </div>
            </div>
          </div>
        )
      },
    },
  ]

  useEffect(() => {
    dispatch(fetchEngines({LocationObject: 'engin', LocationID: selectedEngine.id}))
    dispatch(fetchEngineEvents({LocationObject: 'engin', LocationID: selectedEngine.id}))
    setTimeout(() => {
      if (calendarRef.current) getDisplayedDate()
    }, 300)
  }, [])


  return (
    <>
      <div className='flex flex-column '>
        <div className='w-full flex flex-row align-items-center justify-content-between mb-4'>
          <div className='flex flex-row gap-2 align-items-center'>
            <Button onClick={goToToday} rounded className='text-lg font-semibold '>
              <OlangItem olang='today' />
            </Button>
            <SplitButton
              style={{height: '40px'}}
              icon='pi pi-calendar'
              label={daysDisplay}
              rounded
              className='ml-2'
              model={[
                {label: '1 jour', command: () => displayTheDay(1)},
                {label: '2 jours', command: () => displayTheDay(2)},
                {label: '5 jours', command: () => displayTheDay(5)},
                {label: '10 jours', command: () => displayTheDay(10)},
              ]}
              // onClick={() => setDaysDisplay(1)}
            ></SplitButton>
          </div>
          <div className='flex gap-2 flex-row align-items-center'>
            <Button
              // style={{height: '40px'}}
              icon='pi pi-angle-left'
              onClick={handlePrevClick}
              rounded
              outlined
            ></Button>
            <div className='border-2 border-blue-500 p-2 border-round-2xl text-center'>
              <strong className='text-xl'>
                {`${moment(currentDate.start).format('MMM D')} – ${moment(currentDate.end).format(
                  'D, YYYY'
                )}`}
              </strong>
            </div>
            <Button
              // style={{height: '40px'}}
              className='ml-2'
              icon='pi pi-angle-right'
              rounded
              outlined
              onClick={handleNextClick}
            ></Button>
          </div>
          <div className='flex flex-row align-items-center gap-2'>
            <Button
              // style={{height: '40px', width: '100px'}}
              icon='fas fa-solid fa-circle-minus'
              onClick={decrementSlotDuration}
              rounded
            ></Button>
            <Chip
              className='bg-blue-500 text-white text-lg font-semibold'
              label={slotDuration.slice(0, 5)}
              icon='pi pi-clock'
            />
            <Button
              // style={{height: '40px'}}
              icon='fas fa-solid fa-circle-plus'
              onClick={incrementSlotDuration}
              rounded
            ></Button>
          </div>
        </div>
      </div>
      <FullCalendar
        ref={calendarRef}
        eventBackgroundColor='#67529D'
        height={'800px'}
        eventBorderColor='#FFFFFF'
        plugins={[timelineGridPlugin]}
        initialView={'resourceTimelineTenDays'}
        views={{
          resourceTimelineTenDays: {
            type: 'resourceTimeline',
            duration: {days: daysDisplay},
            buttonText: `${daysDisplay} days`,
          },
        }}
        headerToolbar={false}
        resources={enginesData}
        resourceAreaWidth={'13.5%'}
        resourceAreaColumns={renderRessources}
        slotDuration={slotDuration}
        events={engineEventsData}
        eventContent={(r) => {
          return (
            <div
              style={{height: '30px'}}
              className='p-2 w-12 w-12 flex align-items-center justify-content-end  fc-event-title-container  shadow-2 bg-green-600 text-white text-end'
              title={r.event._def.title}
            >
              <span> {r.event._def.title}</span>
            </div>
          )
        }}
        locales={[frLocal]}
        locale='fr'
      />
      <EnginMapLocation
        dialogVisible={dialogVisible}
        setDialogVisible={() => setDialogVisible((prev) => !prev)}
      />
    </>
  )
}

export default CalendarViewEngin
