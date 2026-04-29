import FullCalendar from '@fullcalendar/react'
import timelineGridPlugin from '@fullcalendar/resource-timeline'
import frLocal from '@fullcalendar/core/locales/fr'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import './style.css'
import {
  fetchEngines,
  fetchEnginesWorksite,
  fetchStatusList,
  getEngines,
  getEnginesWorksite,
  getSelectedEngine,
  getStatusList,
  setEnginesWorksite,
  setSelectedEngine,
} from '../../../Engin/slice/engin.slice'
import {
  fetchEngineEvents,
  fetchEngineEventsWorksite,
  fetchSiteCalendar,
  getEngineEvents,
  getEngineEventsWorksite,
  getSitesCalendar,
  setSitesCalendar,
} from '../../slice/planing.slice'
import EnginMapLocation from '../../../Engin/EnginList/EnginMapLocation'
import {Dropdown} from 'primereact/dropdown'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {Image} from 'primereact/image'
import {fetchDepots, getDepots} from '../../../depot/slice/depot.slice'
import {Button} from 'primereact/button'
import {SplitButton} from 'primereact/splitbutton'
import {useLocalStorage} from 'primereact/hooks'
import {Tag} from 'primereact/tag'
import {Tooltip} from 'primereact/tooltip'
import moment from 'moment'
import {Paginator} from 'primereact/paginator'
import {classNames} from 'primereact/utils'
import {debounce} from 'lodash'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'

function CalendarView() {
  const [mouvement, setMouvement] = useState('')
  const [calendarKey, setCalendarKey] = useState(0) //new
  const [key, setKey] = useState(0)
  const [daysDisplay, setDaysDisplay] = useLocalStorage(2, 'daysDisplayFull')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [movementFilter, setMovementFilter] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [slotDuration, setSlotDuration] = useState('00:30:00')
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentDate, setCurrentDate] = useState({
    start: new Date(),
    end: new Date(),
  })
  const [engines, setEngines] = useState([])
  const [option, setOption] = useState('engin')
  const [dialogVisible, setDialogVisible] = useState(false)
  const [first, setFirst] = useState(0)
  const [rows, setRows] = useState(10)

  let selectedEngin = useAppSelector(getSelectedEngine)
  const enginesFromRedux = useAppSelector(getEngines) || []
  const IMAGE_BASE_URL = API_BASE_URL_IMAGE
  const calendarRef = useRef(null)
  const originSites = useRef([])

  const handleSetOption = (value) => {
    setOption(value)
  }
  const dispatch = useAppDispatch()

  // let engines = useAppSelector(getEngines)
  let worksites = useAppSelector(getEnginesWorksite)
  const sitesRes = useAppSelector(getSitesCalendar)
  let engineevents = useAppSelector(getEngineEvents)
  let engineeventsworksite = useAppSelector(getEngineEventsWorksite)
  const statusList = useAppSelector(getStatusList)
  const depots = useAppSelector(getDepots)

  worksites =
    Array.isArray(worksites) && worksites?.length > 0
      ? worksites?.filter((item) => item?.etatenginname !== 'nonactive')
      : [] //******

  const handleShowMap = (rowData, srcMouv = '') => {
    setMouvement(srcMouv)
    dispatch(setSelectedEngine(rowData))
    setDialogVisible(true)
  }

  const iconTemplate = (rowData) => {
    let icon = ''
    let color = ''
    if (rowData?.etatenginname === 'exit') {
      icon = 'pi pi-arrow-up'
      color = '#D64B70'
    } else if (rowData?.etatenginname === 'reception') {
      icon = 'pi pi-arrow-down'
      color = 'green'
    } else if (rowData?.etatenginname === 'nonactive') {
      icon = 'pi pi-exclamation-triangle'
      color = 'red'
    }
    return (
      <div>
        <i
          style={{color}}
          className={`${icon} text-base rounded p-2 cursor-pointer`}
          title={`${rowData?.etatengin}`}
          alt={`${rowData?.etatengin} `}
          onClick={() => handleShowMap(rowData, 'entry_exit')}
        ></i>
      </div>
    )
  }

  const familleTagTemplate = (rowData) => {
    return (
      <Tag
        // className='mr-2'
        icon={rowData.familleIconTag}
        value={rowData.familleTag}
        title={rowData.tagId != 0 ? `${rowData?.tagname}  ${rowData?.tagDate}` : 'No Tag'}
      ></Tag>
      // <Chip
      //   label={rowData.familleTag}
      //   title={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
      //   alt={rowData.tagId != 0 ? `Tagged  ${rowData?.tagDate}` : 'No Tag'}
      //   icon={rowData.familleIconTag}
      //   style={{background: rowData.familleTagIconBgcolor, color: rowData.familleTagIconColor}}
      //   className='cursor-pointer text-base'
      //   onClick={() => handleShowMap(rowData, '')}
      // />
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
          className={`${rowData?.iconName} text-base rounded p-2`}
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

  const worksitelistMap = worksites.reduce((acc, worksite) => {
    acc[worksite.id.toString()] = worksite
    return acc
  }, {})

  const updatedWorksiteListEvents = engineeventsworksite?.map((event) => ({
    ...event,
    image: worksitelistMap[event.resourceId]?.image,
    cost: worksitelistMap[event.resourceId]?.cost,
    tagId: worksitelistMap[event.resourceId]?.tagId,
    status: worksitelistMap[event.resourceId]?.statuslabel,
    statusColor: worksitelistMap[event.resourceId]?.statusColor,
    statusbgColor: worksitelistMap[event.resourceId]?.statusbgColor,
    currency: worksitelistMap[event.resourceId]?.currency,
    etatenginname: worksitelistMap[event.resourceId]?.etatenginname,
    label: worksitelistMap[event.resourceId]?.label,
    vin: worksitelistMap[event.resourceId]?.vin,
  }))

  let events = option === 'engin' ? engineevents : updatedWorksiteListEvents
  // Sync local engines from Redux when it updates (e.g. background refresh after navigating away)
  useEffect(() => {
    if (enginesFromRedux && enginesFromRedux.length > 0 && enginesFromRedux !== engines) {
      setEngines(enginesFromRedux)
      setTotalRecords(enginesFromRedux.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enginesFromRedux])

  let ressources = option === 'engin' ? engines : sitesRes

  // ── Computed mini-stats for premium Gantt header ──
  const calendarStats = (() => {
    const list = Array.isArray(events) ? events : []
    let enter = 0, exit = 0
    list.forEach((ev) => {
      const t = (ev?.extendedProps?.etatenginname || ev?.etatenginname || '').toLowerCase()
      if (t === 'reception' || t.includes('enter')) enter++
      else if (t === 'exit' || t.includes('sort')) exit++
    })
    const total = list.length
    const positions = Math.max(0, total - enter - exit)
    return {total, enter, exit, positions}
  })()

  const handlePrevClick = (wait) => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.prev()
    getDisplayedDate()
  }

  // Custom handler for the "next" button
  const handleNextClick = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.next()
    getDisplayedDate()
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.value)
    setFirst(0)
    setCalendarKey((k) => k + 1)
  }

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.value)
  }

  const handleMovementFilterChange = (e) => {
    setMovementFilter(e.value)
    setFirst(0)
    setCalendarKey((k) => k + 1)
  }

  const changeDateTimeline = () => {
    const calendarApi = calendarRef.current.getApi()
    const today = moment()
    const startDate = today.clone().subtract(daysDisplay - 1, 'days')
    const endDate = today

    // Update the calendar's visible range dynamically
    calendarApi.setOption('visibleRange', {
      start: startDate.format('YYYY-MM-DD'),
      end: endDate.format('YYYY-MM-DD'),
    })

    // Update current date state
    setCurrentDate({start: startDate.toDate(), end: endDate.toDate()})
  }

  const fetchFilteredEng = (searchTerm) => {
    // Client-side search on cached Redux engines (no server roundtrip).
    if (!searchTerm) {
      setEngines(enginesFromRedux || [])
      setTotalRecords((enginesFromRedux || []).length)
    } else {
      const q = searchTerm.toLowerCase()
      const filtered = (enginesFromRedux || []).filter((e) => {
        const ref = (e?.reference || '').toLowerCase()
        const name = (e?.nom || e?.name || '').toLowerCase()
        const tag = (e?.tagname || '').toLowerCase()
        return ref.includes(q) || name.includes(q) || tag.includes(q)
      })
      setEngines(filtered)
      setTotalRecords(filtered.length)
    }
    setFirst(0)
    setCalendarKey((prevKey) => prevKey + 1)
  }

  const filterSites = (searchTerm) => {
    if (searchTerm) {
      const filteredSite = sitesRes.filter((site) => {
        return site.title.toLowerCase().includes(searchTerm.toLowerCase())
      })
      dispatch(setSitesCalendar(filteredSite))
      setCalendarKey((prevKey) => prevKey + 1)
    } else {
      setCalendarKey((prevKey) => prevKey + 1)
      dispatch(setSitesCalendar(originSites.current))
    }
  }

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (option === 'engin') {
        fetchFilteredEng(searchTerm.trim())
      }
      if (option === 'worksite') {
        filterSites(searchTerm.trim())
      }
    }, 300),
    []
  )

  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
    debouncedSearch(e.target.value)
  }

  const filteredRessourcesAll =
    Array.isArray(ressources) &&
    ressources.length > 0 &&
    ressources?.filter((resource) => {
      const statusFilterMatch = statusFilter === 'all' || resource.sysStatus === statusFilter
      const typeFilterMatch = typeFilter === 'all' || resource.types === typeFilter
      const movementFilterMatch =
        movementFilter === 'all' || resource.etatenginname === movementFilter

      return statusFilterMatch && typeFilterMatch && movementFilterMatch
    })

  // Client-side pagination — feed FullCalendar only the current page (10-50 rows max),
  // not the full 5000 engins. Drastically reduces blank-page / freeze episodes.
  const filteredRessources = Array.isArray(filteredRessourcesAll)
    ? filteredRessourcesAll.slice(first, first + rows)
    : filteredRessourcesAll
  const filteredTotal = Array.isArray(filteredRessourcesAll) ? filteredRessourcesAll.length : 0

  const formatDuration = (minutes) => {
    const duration = moment.duration(minutes, 'minutes')
    return moment.utc(duration.asMilliseconds()).format('HH:mm:ss')
  }

  const goToToday = () => {
    const calendarApi = calendarRef.current.getApi()
    calendarApi.gotoDate(new Date())
    setCurrentDate(new Date())
  }

  const incrementSlotDuration = () => {
    const currentSlotDuration = moment.duration(slotDuration).asMinutes()
    const newSlotDuration = currentSlotDuration + 5

    // Ensure a sensible maximum slot duration, e.g., 24 hours (1440 minutes)
    if (newSlotDuration <= 1440) {
      setSlotDuration(formatDuration(newSlotDuration))
    }
  }

  const decrementSlotDuration = () => {
    const currentSlotDuration = moment.duration(slotDuration).asMinutes()
    const newSlotDuration = currentSlotDuration - 5

    if (newSlotDuration >= 5) {
      setSlotDuration(formatDuration(newSlotDuration))
    }
  }

  const onPageChange = (event) => {
    setFirst(event.first)
    setRows(event.rows)
    // Client-side pagination — no server refetch needed (engines already cached in Redux).
    // Just bump the calendar key so FullCalendar re-renders with the new slice.
    setCalendarKey((prevKey) => prevKey + 1)
  }

  const template = {
    layout: 'PrevPageLink PageLinks NextPageLink CurrentPageReport',
    PrevPageLink(options) {
      return (
        <Button className={options.className} onClick={options.onClick} disabled={options.disabled}>
          <span>
            {' '}
            <i className='pi pi-angle-left'></i>{' '}
          </span>
        </Button>
      )
    },
    PageLinks(options) {
      if (
        (options.view.startPage === options.page && options.view.startPage !== 0) ||
        (options.view.endPage === options.page && options.page + 1 !== options.totalPages)
      ) {
        const className = classNames(options.className, {'p-disabled': true})

        return (
          <span className={className} style={{userSelect: 'none'}}>
            ...
          </span>
        )
      }

      return (
        <span
          type='button'
          className={options.className}
          onClick={() => {
            onPageChange(options.page + 1)
            options.onClick(options.page + 1)
          }}
        >
          {options.page + 1}
        </span>
      )
    },
    NextPageLink(options) {
      return (
        <Button className={options.className} onClick={options.onClick} disabled={options.disabled}>
          <i className='pi pi-angle-right'></i>
        </Button>
      )
    },
    // RowsPerPageDropdown(options) {
    //   const dropOptions = [
    //     {label: 10, value: 10},
    //     {label: 20, value: 20},
    //     {label: 50, value: 50},
    //     // {label: 'All', value: options.totalRecords},
    //   ]

    //   return (
    //     <div className='mr-5'>
    //       <span className='mx-2' style={{userSelect: 'none'}}>
    //         éléments par table:
    //       </span>
    //       <Dropdown value={options.value} onChange={options.onChange} options={dropOptions} />
    //     </div>
    //   )
    // },
    CurrentPageReport(options) {
      return (
        <span className='mx-2'>
          {options.first} à {options.last} de {options.totalRecords} élément
        </span>
      )
    },
  }

  const renderEnginsRessources = [
    {
      field: 'title',
      headerContent: <OlangItem olang='engin.list' />,
      cellContent: (r) => {
        const {image, tagId, label, reference, tagname, famille, familleIcon, familleBgcolor, vin} =
          r.resource._resource.extendedProps || {}

        return (
          <>
            {window.innerWidth > 768 ? (
              <div className=''>
                <div className='d-flex'>
                  <div className=''>
                    <Image
                      src={`${IMAGE_BASE_URL}${image}`}
                      alt='EngineImage'
                      width='60'
                      height='60'
                      preview
                      imageStyle={{objectFit: 'cover', borderRadius: '10px'}}
                    />
                  </div>
                  <div className=''>
                    <div className='flex flex-column mx-2'>
                      <div className='event-title font-semibold text-lg font-medium'>
                        {reference}
                      </div>
                      <div className='text-xs'>{tagname}</div>
                      {/* Removed commented code */}
                      <div className='flex flex-column xl:flex-row lg:flex-row align-items-center'>
                        <div className='flex flex-wrap xl:flex-row lg:flex-row gap-1'>
                          {/* Uncomment and add your templates here if needed */}
                          <div className='engin-icon-content'>
                            {iconTemplate(r.resource._resource.extendedProps)}
                          </div>
                          <div className='status-content'>
                            {statusTemplate(r.resource._resource.extendedProps)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  maxWidth: '90%',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                <strong className='text-xs'>{reference}</strong>
              </div>
            )}
          </>
        )
      },
    },
  ]

  const renderWorksitesRessources = [
    {
      field: 'title',
      headerContent: (
        <p>
          <OlangItem olang='WorksiteList' />
        </p>
      ),
      cellContent: (r) => {
        return <strong>{r.fieldValue} </strong>
      },
    },
  ]

  const getDisplayedDate = () => {
    const calendarApi = calendarRef.current.getApi()
    const view = calendarApi.view
    const start = view.currentStart
    const end = view.currentEnd

    setCurrentDate({start: new Date(start), end: new Date(end)})
    // setCurrentRange({ start, end });
    dispatch(
      fetchEngineEvents({
        LocationObject: 'engin',
        LocationID: 0,
        dateFrom: moment(start).format('YYYY-MM-DD'),
        dateTo: moment(end).format('YYYY-MM-DD'),
      })
    )
    dispatch(
      fetchEngineEventsWorksite({
        LocationObject: 'worksite',
        LocationID: 0,
        dateFrom: moment(start).format('YYYY-MM-DD'),
        dateTo: moment(end).format('YYYY-MM-DD'),
      })
    )
  }

  const displayTheDay = (day) => {
    setDaysDisplay(day)
    setTimeout(() => {
      getDisplayedDate()
    }, 300)
  }

  const renderRessources = option === 'engin' ? renderEnginsRessources : renderWorksitesRessources

  useEffect(() => {
    setCalendarKey((prevKey) => prevKey + 1)
  }, [statusFilter, typeFilter, movementFilter, option])

  useEffect(() => {
    // Use cached engines from Redux if available (5000 records loaded on first dashboard visit, cached 60s backend).
    // Avoids a second 30s wait + 5000 records re-render on every Calendar mount.
    if (enginesFromRedux && enginesFromRedux.length > 0) {
      setTotalRecords(enginesFromRedux.length)
      setEngines(enginesFromRedux)
    } else {
      dispatch(fetchEngines({LocationID: 0, page: 1})).then(({payload}) => {
        setTotalRecords(payload?.[0]?.TotalEngins || (payload?.length || 0))
        setEngines(payload || [])
      })
    }
    dispatch(fetchStatusList())
    dispatch(fetchDepots())
    // dispatch(fetchEnginesWorksite({LocationObject: 'worksiteEvents', LocationID: 0})).then(
    //   () => (originSites.current = worksites)
    // )
    dispatch(fetchSiteCalendar()).then(({payload}) => {
      if (Array.isArray(payload) && payload) {
        originSites.current = payload
      }
    })
    dispatch(
      fetchEngineEvents({
        LocationObject: 'engin',
        LocationID: 0,
        dateFrom: moment(currentDate.start).format('YYYY-MM-DD'),
        dateTo: moment(currentDate.end).format('YYYY-MM-DD'),
      })
    )
    dispatch(
      fetchEngineEventsWorksite({
        LocationObject: 'worksite',
        LocationID: 0,
        dateFrom: moment(currentDate.start).format('YYYY-MM-DD'),
        dateTo: moment(currentDate.end).format('YYYY-MM-DD'),
      })
    )
    // if (calendarRef.current) handlePrevClick(true)
    setTimeout(() => {
      if (calendarRef.current) getDisplayedDate()
    }, 300)
  }, [])

  return (
    <div className="lt-page" data-testid="calendar-page">
      {/* SaaS Page Header */}
      <div className="lt-page-header" data-testid="calendar-page-header">
        <div className="lt-page-header-left">
          <div className="lt-page-icon" style={{background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'}}>
            <i className="pi pi-calendar"></i>
          </div>
          <div>
            <h1 className="lt-page-title"><OlangItem olang='timeline' /></h1>
            <p className="lt-page-subtitle">Planification et suivi des mouvements</p>
          </div>
        </div>
        <div className="lt-page-header-right">
          <div className="lt-cal-view-toggle" data-testid="calendar-view-toggle">
            <button
              className={`lt-cal-view-btn ${daysDisplay === 1 ? 'is-active' : ''}`}
              onClick={() => displayTheDay(1)}
              data-testid="calendar-view-day"
            >Jour</button>
            <button
              className={`lt-cal-view-btn ${daysDisplay === 5 ? 'is-active' : ''}`}
              onClick={() => displayTheDay(5)}
              data-testid="calendar-view-week"
            >Semaine</button>
            <button
              className={`lt-cal-view-btn ${daysDisplay === 10 ? 'is-active' : ''}`}
              onClick={() => displayTheDay(10)}
              data-testid="calendar-view-month"
            >10 jours</button>
          </div>
          {totalRecords > 0 && (
            <div className="lt-count-badge" data-testid="calendar-total-count">
              <i className="pi pi-box" style={{fontSize: '0.75rem'}}></i>
              <strong>{totalRecords}</strong> assets
            </div>
          )}
        </div>
      </div>

      {/* Premium mini-stats — Gantt style */}
      <div className="lt-cal-stats" data-testid="calendar-stats">
        <div className="lt-cal-stat">
          <span className="lt-cal-stat-ico lt-cal-stat-ico--blue"><i className="pi pi-map-marker"></i></span>
          <div>
            <div className="lt-cal-stat-val">{calendarStats.positions}</div>
            <div className="lt-cal-stat-lbl">Positions</div>
          </div>
        </div>
        <div className="lt-cal-stat">
          <span className="lt-cal-stat-ico lt-cal-stat-ico--red"><i className="pi pi-arrow-up-right"></i></span>
          <div>
            <div className="lt-cal-stat-val">{calendarStats.exit}</div>
            <div className="lt-cal-stat-lbl">Sorties</div>
          </div>
        </div>
        <div className="lt-cal-stat">
          <span className="lt-cal-stat-ico lt-cal-stat-ico--green"><i className="pi pi-arrow-down-left"></i></span>
          <div>
            <div className="lt-cal-stat-val">{calendarStats.enter}</div>
            <div className="lt-cal-stat-lbl">Entrées</div>
          </div>
        </div>
        <div className="lt-cal-stat">
          <span className="lt-cal-stat-ico lt-cal-stat-ico--amber"><i className="pi pi-clock"></i></span>
          <div>
            <div className="lt-cal-stat-val">{calendarStats.total}</div>
            <div className="lt-cal-stat-lbl">Événements ({daysDisplay}j)</div>
          </div>
        </div>
      </div>

      {/* Toolbar Card */}
      <div className="lt-table-wrap" style={{marginBottom: 20}} data-testid="calendar-toolbar">
        <div style={{padding: '16px 20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid var(--lt-border)'}}>
          {/* Source Toggle */}
          <div className="lt-view-toggle" style={{borderRadius: 10}} data-testid="calendar-source-toggle">
            <button
              className={`lt-view-btn ${option === 'engin' ? 'lt-view-btn--active' : ''}`}
              onClick={() => handleSetOption('engin')}
              style={{width: 'auto', padding: '0 14px', fontSize: '0.78rem', fontWeight: 600, gap: 6}}
              data-testid="calendar-toggle-engin"
            >
              <i className="pi pi-box" style={{fontSize: '0.75rem'}}></i> Engin
            </button>
            <button
              className={`lt-view-btn ${option === 'worksite' ? 'lt-view-btn--active' : ''}`}
              onClick={() => handleSetOption('worksite')}
              style={{width: 'auto', padding: '0 14px', fontSize: '0.78rem', fontWeight: 600, gap: 6}}
              data-testid="calendar-toggle-worksite"
            >
              <i className="pi pi-building" style={{fontSize: '0.75rem'}}></i> Worksite
            </button>
          </div>

          {/* Search */}
          <div style={{display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid var(--lt-border)', borderRadius: 10, padding: '6px 12px', flex: '0 1 220px'}}>
            <i className="pi pi-search" style={{color: 'var(--lt-text-muted)', fontSize: '0.8rem'}}></i>
            <input
              type="text"
              placeholder="Rechercher..."
              onChange={handleSearchTextChange}
              value={searchText}
              style={{border: 'none', background: 'transparent', fontFamily: 'var(--lt-font)', fontSize: '0.82rem', color: 'var(--lt-text-primary)', outline: 'none', width: '100%'}}
              data-testid="calendar-search"
            />
          </div>

          {option === 'engin' && (
            <>
              <Dropdown
                id='statusFilter'
                value={statusFilter}
                options={[
                  {label: 'Tous Status', value: 'all'},
                  ...(Array.isArray(statusList)
                    ? statusList.map((st) => ({label: st.label, value: st.status}))
                    : []),
                ]}
                onChange={handleStatusFilterChange}
                className='lt-calendar-filter'
                style={{minWidth: 140, borderRadius: 10, fontSize: '0.82rem'}}
              />
              <Dropdown
                id='movementFilter'
                value={movementFilter}
                options={[
                  {label: 'Tous Mouvements', value: 'all'},
                  {label: 'Entrée', value: 'reception'},
                  {label: 'Sortie', value: 'exit'},
                ]}
                onChange={handleMovementFilterChange}
                className='lt-calendar-filter'
                style={{minWidth: 140, borderRadius: 10, fontSize: '0.82rem'}}
              />
            </>
          )}
          {option === 'engin' && (
            <Paginator
              first={first}
              rows={rows}
              totalRecords={filteredTotal || totalRecords}
              rowsPerPageOptions={[10, 20, 30]}
              onPageChange={onPageChange}
              template={template}
              className='lt-calendar-paginator'
            />
          )}
          <div className="lt-cal-legend" data-testid="calendar-legend">
            <span className="lt-cal-legend-item"><span className="lt-cal-legend-dot" style={{background:'#EF4444'}} />Sortie</span>
            <span className="lt-cal-legend-item"><span className="lt-cal-legend-dot" style={{background:'#10B981'}} />Entrée</span>
            <span className="lt-cal-legend-item"><span className="lt-cal-legend-dot" style={{background:'#1D4ED8'}} />Position</span>
          </div>
        </div>

        {/* Navigation Row */}
        <div style={{padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--lt-border)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <button className="lt-grid-page-btn" onClick={goToToday} style={{width: 'auto', padding: '0 14px', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'var(--lt-font)'}} data-testid="calendar-today-btn">
              <OlangItem olang='today' />
            </button>
            <SplitButton
              style={{height: '34px'}}
              icon='pi pi-calendar'
              label={daysDisplay}
              rounded
              className='ml-1'
              model={[
                {label: '1 jour', command: () => displayTheDay(1)},
                {label: '2 jours', command: () => displayTheDay(2)},
                {label: '5 jours', command: () => displayTheDay(5)},
                {label: '10 jours', command: () => displayTheDay(10)},
              ]}
            />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <button className="lt-grid-page-btn" onClick={handlePrevClick} data-testid="calendar-prev-btn">
              <i className="pi pi-angle-left"></i>
            </button>
            <span style={{padding: '6px 16px', borderRadius: 10, border: '1.5px solid var(--lt-accent)', background: 'var(--lt-accent-light)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--lt-text-primary)', fontFamily: 'var(--lt-font-heading)'}}>
              {`${moment(currentDate.start).format('MMM D')} – ${moment(currentDate.end).format('D, YYYY')}`}
            </span>
            <button className="lt-grid-page-btn" onClick={handleNextClick} data-testid="calendar-next-btn">
              <i className="pi pi-angle-right"></i>
            </button>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <button className="lt-grid-page-btn" onClick={decrementSlotDuration} data-testid="calendar-slot-minus">
              <i className="pi pi-minus"></i>
            </button>
            <span style={{padding: '4px 12px', borderRadius: 8, background: 'var(--lt-accent)', color: '#FFF', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'var(--lt-font)'}}>
              <i className="pi pi-clock" style={{fontSize: '0.7rem', marginRight: 4}}></i>
              {slotDuration.slice(0, 5)}
            </span>
            <button className="lt-grid-page-btn" onClick={incrementSlotDuration} data-testid="calendar-slot-plus">
              <i className="pi pi-plus"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="lt-table-wrap" data-testid="calendar-wrap">
      <FullCalendar
        key={calendarKey}
        ref={calendarRef}
        height={'800px'}
        eventBackgroundColor='#F2F2F2'
        eventBorderColor='#67529D'
        eventTextColor='black'
        aspectRatio={3.5}
        plugins={[timelineGridPlugin, resourceTimelinePlugin]}
        headerToolbar={false}
        initialView={'resourceTimelineTenDays'}
        views={{
          resourceTimelineTenDays: {
            type: 'resourceTimeline',
            duration: {days: daysDisplay},
            buttonText: `${daysDisplay} days`,
          },
        }}
        // editable={true}
        // droppable={true}
        resources={filteredRessources}
        resourceAreaWidth={window.innerWidth < 768 ? '30%' : '20%'}
        resourceAreaColumns={renderRessources}
        eventMinWidth={5}
        events={events}
        eventContent={(r, idx) => {
          return (
            <div
              style={{height: '30px'}}
              className={`custom-${r.event._def.defId}-tooltip-btn custom-tooltip-btn p-2  w-12 flex align-items-center justify-content-end  fc-event-title-container  shadow-2 bg-blue-600 text-white text-end`}
              // title={r.event._def.title}

              // title={r.event._def.title}
            >
              <span> {r.event._def.title}</span>
              <Tooltip className='bg-white' target={`.custom-${r.event._def.defId}-tooltip-btn`}>
                <div style={{width: '200px'}} className='bg-gray-40 -m-2'>
                  <strong>
                    {r.event._def.title}({' '}
                    <i
                      className={`fa-solid fa-${
                        r.event._def.extendedProps.etatenginname == 'reception'
                          ? 'down-to'
                          : 'up-from'
                      }-bracket text-xl text-${
                        r.event.extendedProps.etatenginname == 'reception' ? 'green' : 'red'
                      }-300`}
                    ></i>{' '}
                    )
                  </strong>
                  {r.event._def.extendedProps.etatenginname == 'reception' && (
                    <strong className='text-orange-500 ml-2'>
                      {r.event._def.extendedProps.worksiteName}
                    </strong>
                    /*<div className='flex gap-2 align-items-center'>
                            <i className='pi pi-home text-orange-500'></i>
                           
                          </div>*/
                  )}

                  <div>
                    <strong>
                      {moment(r.event.startStr).format('DD/MM HH:mm')} -
                      {moment(r.event.endStr).format('DD/MM HH:mm')}
                    </strong>
                  </div>
                </div>
              </Tooltip>
            </div>
          )
        }}
        slotDuration={slotDuration}
        locales={[frLocal]}
        locale='fr'
      />
      </div>
      <EnginMapLocation
        dialogVisible={dialogVisible}
        setDialogVisible={() => setDialogVisible((prev) => !prev)}
        historySrc={{
          srcId: selectedEngin?.uid,
          srcObject: 'engin',
          srcMovement: mouvement,
        }}
      />
    </div>
  )
}

export default CalendarView
