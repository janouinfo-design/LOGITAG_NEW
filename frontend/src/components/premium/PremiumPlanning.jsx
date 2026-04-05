import {useCallback, useEffect, useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {
  fetchEngines, getEngines, setSelectedEngine, getSelectedEngine,
  fetchStatusList, getStatusList,
} from '../Engin/slice/engin.slice'
import {
  fetchEngineEvents, fetchEngineEventsWorksite,
  fetchSiteCalendar, getEngineEvents, getEngineEventsWorksite,
  getSitesCalendar, setSitesCalendar,
} from '../Planning/slice/planing.slice'
import {API_BASE_URL_IMAGE} from '../../api/config'
import FullCalendar from '@fullcalendar/react'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import frLocal from '@fullcalendar/core/locales/fr'
import moment from 'moment'
import {debounce} from 'lodash'
import {
  Search, ChevronLeft, ChevronRight, Calendar, Clock,
  Truck, ZoomIn, ZoomOut, Filter, X, Minus, Plus,
  Activity, MapPin, ArrowDownToLine, ArrowUpFromLine, Loader2
} from 'lucide-react'

const PremiumPlanning = () => {
  const dispatch = useAppDispatch()
  const [option, setOption] = useState('engin')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [movementFilter, setMovementFilter] = useState('all')
  const [daysDisplay, setDaysDisplay] = useState(2)
  const [slotDuration, setSlotDuration] = useState('00:30:00')
  const [calendarKey, setCalendarKey] = useState(0)
  const [engines, setEnginesLocal] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState({start: new Date(), end: new Date()})
  const [daysOpen, setDaysOpen] = useState(false)
  const [activityAsset, setActivityAsset] = useState(null)
  const [activityEvents, setActivityEvents] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)
  const rows = 10

  const calendarRef = useRef(null)
  const originSites = useRef([])

  const engineEvents = useAppSelector(getEngineEvents)
  const engineEventsWorksite = useAppSelector(getEngineEventsWorksite)
  const sitesRes = useAppSelector(getSitesCalendar)
  const statusList = useAppSelector(getStatusList)

  const events = option === 'engin' ? engineEvents : engineEventsWorksite
  const ressources = option === 'engin' ? engines : sitesRes

  const filteredRessources = Array.isArray(ressources) ? ressources.filter((r) => {
    const statusMatch = statusFilter === 'all' || r.sysStatus === statusFilter
    const movMatch = movementFilter === 'all' || r.etatenginname === movementFilter
    return statusMatch && movMatch
  }) : []

  const totalPages = Math.ceil(totalRecords / rows)

  // Fetch events for current date range
  const fetchEvents = useCallback((start, end) => {
    const dateFrom = moment(start).format('YYYY-MM-DD')
    const dateTo = moment(end).format('YYYY-MM-DD')
    dispatch(fetchEngineEvents({LocationObject: 'engin', LocationID: 0, dateFrom, dateTo}))
    dispatch(fetchEngineEventsWorksite({LocationObject: 'worksite', LocationID: 0, dateFrom, dateTo}))
  }, [dispatch])

  const getDisplayedDate = useCallback(() => {
    if (!calendarRef.current) return
    const api = calendarRef.current.getApi()
    const start = api.view.currentStart
    const end = api.view.currentEnd
    setCurrentDate({start: new Date(start), end: new Date(end)})
    fetchEvents(start, end)
  }, [fetchEvents])

  const handlePrev = () => {
    calendarRef.current?.getApi()?.prev()
    getDisplayedDate()
  }

  const handleNext = () => {
    calendarRef.current?.getApi()?.next()
    getDisplayedDate()
  }

  const goToToday = () => {
    calendarRef.current?.getApi()?.gotoDate(new Date())
    setCurrentDate({start: new Date(), end: new Date()})
    setTimeout(getDisplayedDate, 200)
  }

  const changeDays = (d) => {
    setDaysDisplay(d)
    setDaysOpen(false)
    setTimeout(getDisplayedDate, 300)
  }

  const incrementSlot = () => {
    const mins = moment.duration(slotDuration).asMinutes()
    if (mins + 5 <= 1440) setSlotDuration(formatMins(mins + 5))
  }

  const decrementSlot = () => {
    const mins = moment.duration(slotDuration).asMinutes()
    if (mins - 5 >= 5) setSlotDuration(formatMins(mins - 5))
  }

  const formatMins = (m) => {
    const d = moment.duration(m, 'minutes')
    return moment.utc(d.asMilliseconds()).format('HH:mm:ss')
  }

  const loadEngines = useCallback((p, search) => {
    setLoading(true)
    dispatch(fetchEngines({page: p, search: search || undefined})).then(({payload}) => {
      if (payload) {
        setTotalRecords(payload[0]?.TotalEngins || 0)
        setEnginesLocal(payload)
        setCalendarKey(k => k + 1)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [dispatch])

  const debouncedSearch = useCallback(
    debounce((term) => {
      if (option === 'engin') {
        setPage(1)
        loadEngines(1, term.trim())
      } else {
        if (term) {
          const filtered = originSites.current.filter(s => s.title?.toLowerCase().includes(term.toLowerCase()))
          dispatch(setSitesCalendar(filtered))
        } else {
          dispatch(setSitesCalendar(originSites.current))
        }
        setCalendarKey(k => k + 1)
      }
    }, 300),
    [option, loadEngines, dispatch]
  )

  const handleSearch = (e) => {
    setSearchText(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    loadEngines(newPage, searchText)
  }

  // Init
  useEffect(() => {
    loadEngines(1)
    dispatch(fetchStatusList())
    dispatch(fetchSiteCalendar()).then(({payload}) => {
      if (Array.isArray(payload)) originSites.current = payload
    })
    const dateFrom = moment().format('YYYY-MM-DD')
    const dateTo = moment().format('YYYY-MM-DD')
    dispatch(fetchEngineEvents({LocationObject: 'engin', LocationID: 0, dateFrom, dateTo}))
    dispatch(fetchEngineEventsWorksite({LocationObject: 'worksite', LocationID: 0, dateFrom, dateTo}))
    setTimeout(() => {
      if (calendarRef.current) getDisplayedDate()
    }, 500)
  }, [])

  useEffect(() => {
    setCalendarKey(k => k + 1)
  }, [statusFilter, movementFilter, option])

  const openActivityModal = (assetProps) => {
    setActivityAsset(assetProps)
    setActivityLoading(true)
    // Filter events from engineEvents that belong to this asset
    const assetEvents = (Array.isArray(engineEvents) ? engineEvents : [])
      .filter(ev => String(ev.resourceId) === String(assetProps.id))
      .sort((a, b) => new Date(b.start) - new Date(a.start))
    setActivityEvents(assetEvents)
    setActivityLoading(false)
  }

  const renderResources = [{
    field: 'title',
    headerContent: option === 'engin' ? 'Engins' : 'Sites',
    cellContent: (r) => {
      const props = r.resource._resource.extendedProps || {}
      if (option !== 'engin') return <strong style={{fontSize: '.82rem'}}>{r.fieldValue}</strong>
      return (
        <div className="ltp-res-cell" data-testid={`planning-resource-${r.resource.id}`}>
          <div className="ltp-res-img">
            {props.image ? (
              <img src={`${API_BASE_URL_IMAGE}${props.image}`} alt="" />
            ) : (
              <div className="ltp-res-ph"><Truck size={14} /></div>
            )}
          </div>
          <div className="ltp-res-info">
            <span className="ltp-res-ref">{props.reference || r.fieldValue}</span>
            <span className="ltp-res-tag">{props.tagname || ''}</span>
            <div className="ltp-res-icons">
              {props.etatenginname === 'reception' && (
                <span className="ltp-res-badge ltp-res-badge--in ltp-res-badge--clickable" title="Voir journal d'activité" onClick={() => openActivityModal({...props, id: r.resource.id})}>
                  <ArrowDownToLine size={12} />
                </span>
              )}
              {props.etatenginname === 'exit' && (
                <span className="ltp-res-badge ltp-res-badge--out ltp-res-badge--clickable" title="Voir journal d'activité" onClick={() => openActivityModal({...props, id: r.resource.id})}>
                  <ArrowUpFromLine size={12} />
                </span>
              )}
              {props.statuslabel && (
                <span className="ltp-res-status ltp-res-status--clickable" style={{color: props.statusbgColor}} title={`${props.statuslabel} — Cliquer pour voir le journal`} onClick={() => openActivityModal({...props, id: r.resource.id})}>
                  {props.iconName ? <i className={props.iconName} /> : props.statuslabel}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    }
  }]

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltp" data-testid="premium-planning">
        {/* Top toolbar */}
        <div className="ltp-toolbar" data-testid="planning-toolbar">
          {/* Option toggle */}
          <div className="ltp-toggle" data-testid="planning-option-toggle">
            <button className={`ltp-toggle-btn ${option === 'engin' ? 'ltp-toggle-btn--active' : ''}`} onClick={() => setOption('engin')}>
              Engin
            </button>
            <button className={`ltp-toggle-btn ${option === 'worksite' ? 'ltp-toggle-btn--active' : ''}`} onClick={() => setOption('worksite')}>
              Worksite
            </button>
          </div>

          {/* Search */}
          <div className="ltp-search" data-testid="planning-search">
            <Search size={14} className="ltp-search-icon" />
            <input
              type="text"
              value={searchText}
              onChange={handleSearch}
              placeholder="Rechercher..."
              data-testid="planning-search-input"
            />
          </div>

          {/* Filters */}
          {option === 'engin' && (
            <div className="ltp-filters" data-testid="planning-filters">
              <div className="ltp-filter-group">
                <span className="ltp-filter-label">Statut</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} data-testid="planning-filter-status">
                  <option value="all">All</option>
                  {Array.isArray(statusList) && statusList.map((s, i) => (
                    <option key={i} value={s.status}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="ltp-filter-group">
                <span className="ltp-filter-label">Mouvement</span>
                <select value={movementFilter} onChange={(e) => setMovementFilter(e.target.value)} data-testid="planning-filter-movement">
                  <option value="all">All</option>
                  <option value="reception">Entrée</option>
                  <option value="exit">Sortie</option>
                </select>
              </div>
            </div>
          )}

          {/* Pagination */}
          {option === 'engin' && totalPages > 1 && (
            <div className="ltp-pagination" data-testid="planning-pagination">
              <button className="ltp-pg-btn" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                <ChevronLeft size={14} />
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const p = i + 1
                return (
                  <button key={p} className={`ltp-pg-num ${page === p ? 'ltp-pg-num--active' : ''}`} onClick={() => handlePageChange(p)}>
                    {p}
                  </button>
                )
              })}
              <button className="ltp-pg-btn" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
                <ChevronRight size={14} />
              </button>
              <span className="ltp-pg-info">{((page - 1) * rows) + 1} à {Math.min(page * rows, totalRecords)} de {totalRecords} élément</span>
            </div>
          )}
        </div>

        {/* Date controls */}
        <div className="ltp-datebar" data-testid="planning-datebar">
          <div className="ltp-datebar-left">
            <button className="ltp-today-btn" onClick={goToToday} data-testid="planning-today-btn">
              Aujourd'hui
            </button>
            <div className="ltp-days-picker" data-testid="planning-days-picker">
              <button className="ltp-days-btn" onClick={() => setDaysOpen(!daysOpen)}>
                <Calendar size={14} /> {daysDisplay}
                <ChevronLeft size={12} style={{transform: daysOpen ? 'rotate(90deg)' : 'rotate(-90deg)', transition: '.2s'}} />
              </button>
              {daysOpen && (
                <div className="ltp-days-dropdown">
                  {[1, 2, 5, 10].map(d => (
                    <button key={d} className={`ltp-days-opt ${daysDisplay === d ? 'ltp-days-opt--active' : ''}`} onClick={() => changeDays(d)}>
                      {d} jour{d > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ltp-datebar-center">
            <button className="ltp-nav-arrow" onClick={handlePrev} data-testid="planning-prev-btn">
              <ChevronLeft size={18} />
            </button>
            <div className="ltp-date-display" data-testid="planning-date-display">
              {moment(currentDate.start).format('MMM D')} – {moment(currentDate.end).format('D, YYYY')}
            </div>
            <button className="ltp-nav-arrow" onClick={handleNext} data-testid="planning-next-btn">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="ltp-datebar-right">
            <button className="ltp-zoom-btn" onClick={decrementSlot} data-testid="planning-zoom-out">
              <Minus size={14} />
            </button>
            <div className="ltp-slot-badge" data-testid="planning-slot-duration">
              <Clock size={12} /> {slotDuration.slice(0, 5)}
            </div>
            <button className="ltp-zoom-btn" onClick={incrementSlot} data-testid="planning-zoom-in">
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="ltp-calendar-wrap" data-testid="planning-calendar">
          <FullCalendar
            key={calendarKey}
            ref={calendarRef}
            height="auto"
            eventBackgroundColor="#EFF6FF"
            eventBorderColor="#2563EB"
            eventTextColor="#1E40AF"
            aspectRatio={3.5}
            plugins={[resourceTimelinePlugin]}
            headerToolbar={false}
            initialView="resourceTimelineDays"
            views={{
              resourceTimelineDays: {
                type: 'resourceTimeline',
                duration: {days: daysDisplay},
                buttonText: `${daysDisplay} days`,
              },
            }}
            resources={filteredRessources}
            resourceAreaWidth={window.innerWidth < 768 ? '35%' : '22%'}
            resourceAreaColumns={renderResources}
            eventMinWidth={5}
            events={events}
            eventContent={(r) => {
              const etat = r.event._def.extendedProps?.etatenginname
              const isIn = etat === 'reception'
              return (
                <div className={`ltp-event ${isIn ? 'ltp-event--in' : 'ltp-event--out'}`} title={`${r.event._def.title} (${moment(r.event.startStr).format('DD/MM HH:mm')} - ${moment(r.event.endStr).format('DD/MM HH:mm')})`}>
                  <span className="ltp-event-title">{r.event._def.title}</span>
                </div>
              )
            }}
            slotDuration={slotDuration}
            locales={[frLocal]}
            locale="fr"
          />
        </div>

        {/* Activity Journal Modal */}
        {activityAsset && (
          <div className="ltp-activity-bg" onClick={() => setActivityAsset(null)} data-testid="planning-activity-overlay">
            <div className="ltp-activity-panel" onClick={(e) => e.stopPropagation()} data-testid="planning-activity-panel">
              <div className="ltp-activity-head">
                <div className="ltp-activity-head-left">
                  <div className="ltp-activity-avatar">
                    {activityAsset.image ? (
                      <img src={`${API_BASE_URL_IMAGE}${activityAsset.image}`} alt="" />
                    ) : (
                      <Truck size={18} />
                    )}
                  </div>
                  <div>
                    <h2 className="ltp-activity-title">{activityAsset.reference || 'Asset'}</h2>
                    <span className="ltp-activity-sub">{activityAsset.tagname || ''} · Journal d'activité</span>
                  </div>
                </div>
                <button className="ltp-activity-close" onClick={() => setActivityAsset(null)} data-testid="planning-activity-close">
                  <X size={18} />
                </button>
              </div>

              <div className="ltp-activity-info">
                <div className="ltp-activity-chip">
                  <MapPin size={12} /> {activityAsset.LocationObjectname || activityAsset.enginAddress || 'N/A'}
                </div>
                {activityAsset.etatenginname && (
                  <div className={`ltp-activity-chip ${activityAsset.etatenginname === 'reception' ? 'ltp-activity-chip--in' : 'ltp-activity-chip--out'}`}>
                    {activityAsset.etatenginname === 'reception' ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}
                    {activityAsset.etatenginname === 'reception' ? 'Entrée' : 'Sortie'}
                  </div>
                )}
                {activityAsset.statuslabel && (
                  <div className="ltp-activity-chip" style={{color: activityAsset.statusbgColor, borderColor: activityAsset.statusbgColor}}>
                    {activityAsset.statuslabel}
                  </div>
                )}
              </div>

              <div className="ltp-activity-body">
                {activityLoading ? (
                  <div className="ltp-activity-loading"><Loader2 size={20} className="ltp-spin" /> Chargement...</div>
                ) : activityEvents.length === 0 ? (
                  <div className="ltp-activity-empty">
                    <Activity size={32} />
                    <p>Aucun événement trouvé pour la période affichée</p>
                    <span>Essayez d'élargir la plage de dates du planning</span>
                  </div>
                ) : (
                  <div className="ltp-activity-timeline">
                    {activityEvents.map((ev, i) => {
                      const isIn = ev.etatenginname === 'reception'
                      return (
                        <div key={i} className="ltp-activity-item" data-testid={`activity-item-${i}`}>
                          <div className="ltp-activity-dot-wrap">
                            <div className={`ltp-activity-dot ${isIn ? 'ltp-activity-dot--in' : 'ltp-activity-dot--out'}`} />
                            {i < activityEvents.length - 1 && <div className="ltp-activity-line" />}
                          </div>
                          <div className="ltp-activity-content">
                            <div className="ltp-activity-ev-header">
                              <span className={`ltp-activity-ev-badge ${isIn ? 'ltp-activity-ev-badge--in' : 'ltp-activity-ev-badge--out'}`}>
                                {isIn ? <ArrowDownToLine size={11} /> : <ArrowUpFromLine size={11} />}
                                {ev.title || (isIn ? 'Entrée' : 'Sortie')}
                              </span>
                              {ev.worksiteName && <span className="ltp-activity-ev-site">{ev.worksiteName}</span>}
                            </div>
                            <div className="ltp-activity-ev-time">
                              {moment(ev.start).format('DD/MM/YYYY HH:mm')}
                              {ev.end && ` → ${moment(ev.end).format('DD/MM HH:mm')}`}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const STYLES = `
.ltp { max-width: 100%; }

/* Toolbar */
.ltp-toolbar {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 0 0 16px; margin-bottom: 16px; border-bottom: 1px solid #F1F5F9;
}

.ltp-toggle {
  display: flex; background: #F1F5F9; border-radius: 10px; padding: 3px; gap: 2px;
}
.ltp-toggle-btn {
  padding: 7px 16px; border-radius: 8px; border: none; background: transparent;
  font-family: 'Manrope', sans-serif; font-size: .78rem; font-weight: 600; color: #64748B;
  cursor: pointer; transition: all .15s;
}
.ltp-toggle-btn--active { background: #2563EB; color: #FFF; box-shadow: 0 2px 6px rgba(37,99,235,.2); }

.ltp-search {
  display: flex; align-items: center; gap: 8px; background: #F8FAFC;
  border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 0 12px; max-width: 200px;
}
.ltp-search-icon { color: #94A3B8; flex-shrink: 0; }
.ltp-search input {
  border: none; background: transparent; padding: 8px 0; width: 100%;
  font-family: 'Inter', sans-serif; font-size: .82rem; color: #0F172A; outline: none;
}

.ltp-filters { display: flex; gap: 8px; }
.ltp-filter-group { display: flex; align-items: center; gap: 0; }
.ltp-filter-label {
  padding: 7px 12px; background: #F1F5F9; border: 1.5px solid #E2E8F0;
  border-right: none; border-radius: 10px 0 0 10px;
  font-family: 'Manrope', sans-serif; font-size: .72rem; font-weight: 700; color: #64748B;
}
.ltp-filter-group select {
  padding: 7px 12px; border: 1.5px solid #E2E8F0; border-radius: 0 10px 10px 0;
  font-family: 'Inter', sans-serif; font-size: .82rem; color: #0F172A;
  background: #FFF; outline: none; cursor: pointer;
}

.ltp-pagination { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.ltp-pg-btn {
  width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #E2E8F0;
  background: #FFF; color: #475569; cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: all .15s;
}
.ltp-pg-btn:hover:not(:disabled) { border-color: #2563EB; color: #2563EB; }
.ltp-pg-btn:disabled { opacity: .3; cursor: not-allowed; }
.ltp-pg-num {
  width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #E2E8F0;
  background: #FFF; font-family: 'Manrope', sans-serif; font-size: .78rem; font-weight: 700;
  color: #475569; cursor: pointer; transition: all .15s;
}
.ltp-pg-num--active { background: #2563EB; color: #FFF; border-color: #2563EB; }
.ltp-pg-info { font-family: 'Inter', sans-serif; font-size: .72rem; color: #94A3B8; margin-left: 8px; }

/* Date bar */
.ltp-datebar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 0 20px; gap: 16px; flex-wrap: wrap;
}

.ltp-datebar-left { display: flex; align-items: center; gap: 10px; }
.ltp-today-btn {
  padding: 8px 20px; border-radius: 20px; border: none; background: #2563EB; color: #FFF;
  font-family: 'Manrope', sans-serif; font-size: .82rem; font-weight: 700; cursor: pointer;
  transition: all .15s; box-shadow: 0 2px 6px rgba(37,99,235,.2);
}
.ltp-today-btn:hover { background: #1D4ED8; }

.ltp-days-picker { position: relative; }
.ltp-days-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 20px; border: 1.5px solid #E2E8F0;
  background: #FFF; font-family: 'Manrope', sans-serif; font-size: .82rem; font-weight: 700;
  color: #0F172A; cursor: pointer; transition: all .15s;
}
.ltp-days-btn:hover { border-color: #2563EB; }
.ltp-days-dropdown {
  position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 100;
  background: #FFF; border: 1.5px solid #E2E8F0; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.1); overflow: hidden; min-width: 120px;
}
.ltp-days-opt {
  display: block; width: 100%; padding: 10px 16px; border: none; background: transparent;
  font-family: 'Inter', sans-serif; font-size: .82rem; color: #0F172A; cursor: pointer;
  text-align: left; transition: background .12s;
}
.ltp-days-opt:hover { background: #EFF6FF; }
.ltp-days-opt--active { background: #EFF6FF; color: #2563EB; font-weight: 600; }

.ltp-datebar-center { display: flex; align-items: center; gap: 12px; }
.ltp-nav-arrow {
  width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #E2E8F0;
  background: #FFF; color: #475569; cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: all .15s;
}
.ltp-nav-arrow:hover { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }
.ltp-date-display {
  padding: 8px 20px; border: 2px solid #2563EB; border-radius: 14px;
  font-family: 'Manrope', sans-serif; font-size: 1rem; font-weight: 800;
  color: #0F172A; letter-spacing: -.02em; white-space: nowrap;
}

.ltp-datebar-right { display: flex; align-items: center; gap: 8px; }
.ltp-zoom-btn {
  width: 36px; height: 36px; border-radius: 50%; border: none;
  background: #2563EB; color: #FFF; cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: all .15s; box-shadow: 0 2px 6px rgba(37,99,235,.2);
}
.ltp-zoom-btn:hover { background: #1D4ED8; }
.ltp-slot-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 20px; background: #2563EB; color: #FFF;
  font-family: 'Manrope', sans-serif; font-size: .85rem; font-weight: 700;
}

/* Calendar wrap */
.ltp-calendar-wrap {
  background: #FFF; border-radius: 14px; border: 1px solid #E2E8F0; overflow: hidden;
}

/* Resource cell */
.ltp-res-cell { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.ltp-res-img { width: 48px; height: 48px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #F1F5F9; }
.ltp-res-img img { width: 100%; height: 100%; object-fit: cover; }
.ltp-res-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #94A3B8; }
.ltp-res-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ltp-res-ref { font-family: 'Manrope', sans-serif; font-size: .82rem; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ltp-res-tag { font-family: 'Inter', sans-serif; font-size: .65rem; color: #94A3B8; }
.ltp-res-icons { display: flex; gap: 4px; align-items: center; }
.ltp-res-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 6px; font-size: .7rem; font-weight: 700;
}
.ltp-res-badge--in { background: #ECFDF5; color: #059669; }
.ltp-res-badge--out { background: #FEF2F2; color: #DC2626; }
.ltp-res-status { font-family: 'Inter', sans-serif; font-size: .65rem; font-weight: 600; }

/* Events */
.ltp-event {
  padding: 2px 8px; border-radius: 6px; height: 100%; display: flex; align-items: center;
  font-family: 'Inter', sans-serif; font-size: .72rem; font-weight: 600;
}
.ltp-event--in { background: #DBEAFE; color: #1E40AF; }
.ltp-event--out { background: #FEE2E2; color: #991B1B; }
.ltp-event-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* FullCalendar overrides */
.ltp-calendar-wrap .fc { font-family: 'Inter', sans-serif; }
.ltp-calendar-wrap .fc-h-event { border: 0; }
.ltp-calendar-wrap .fc-scroller { scrollbar-width: thin; scrollbar-color: #2563EB #F1F5F9; }
.ltp-calendar-wrap .fc-scroller::-webkit-scrollbar { height: 8px; background: #F1F5F9; }
.ltp-calendar-wrap .fc-scroller::-webkit-scrollbar-thumb { background: #2563EB; border-radius: 4px; }
.ltp-calendar-wrap .fc-timeline-slot-label { font-size: .75rem; font-weight: 600; color: #2563EB; }
.ltp-calendar-wrap .fc-datagrid-cell-frame { padding: 4px 8px; }
.ltp-calendar-wrap .fc-resource-timeline .fc-resource { border-bottom: 1px solid #F1F5F9; }
.ltp-calendar-wrap .fc-col-header-cell { font-size: .78rem; font-weight: 600; color: #0F172A; }

@media(max-width: 768px) {
  .ltp-toolbar { flex-direction: column; align-items: stretch; }
  .ltp-datebar { flex-direction: column; align-items: stretch; gap: 12px; }
  .ltp-datebar-center { justify-content: center; }
  .ltp-datebar-right { justify-content: center; }
  .ltp-pagination { flex-wrap: wrap; margin-left: 0; }
}

/* Clickable badges */
.ltp-res-badge--clickable, .ltp-res-status--clickable { cursor: pointer; transition: transform .12s, box-shadow .12s; }
.ltp-res-badge--clickable:hover { transform: scale(1.15); box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.ltp-res-status--clickable:hover { text-decoration: underline; }

/* ── Activity Journal Modal ── */
.ltp-activity-bg {
  position: fixed; inset: 0; background: rgba(15,23,42,.45); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: flex-end; z-index: 9999;
}
.ltp-activity-panel {
  width: 440px; max-width: 95vw; height: 100vh; background: #FFF;
  box-shadow: -12px 0 40px rgba(0,0,0,.12); display: flex; flex-direction: column;
  animation: ltpSlideIn .25s ease;
}
@keyframes ltpSlideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }

.ltp-activity-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #F1F5F9;
}
.ltp-activity-head-left { display: flex; align-items: center; gap: 12px; }
.ltp-activity-avatar {
  width: 44px; height: 44px; border-radius: 12px; overflow: hidden;
  background: #EFF6FF; display: flex; align-items: center; justify-content: center;
  color: #2563EB; flex-shrink: 0;
}
.ltp-activity-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ltp-activity-title { font-family: 'Manrope', sans-serif; font-size: 1.1rem; font-weight: 800; color: #0F172A; margin: 0; }
.ltp-activity-sub { font-family: 'Inter', sans-serif; font-size: .72rem; color: #94A3B8; }
.ltp-activity-close {
  width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #E2E8F0;
  background: #FFF; color: #94A3B8; cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: all .15s;
}
.ltp-activity-close:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }

.ltp-activity-info {
  display: flex; flex-wrap: wrap; gap: 8px; padding: 16px 24px; border-bottom: 1px solid #F1F5F9;
}
.ltp-activity-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 14px; border-radius: 20px; border: 1.5px solid #E2E8F0;
  font-family: 'Inter', sans-serif; font-size: .75rem; font-weight: 600; color: #475569;
}
.ltp-activity-chip--in { background: #ECFDF5; border-color: #059669; color: #059669; }
.ltp-activity-chip--out { background: #FEF2F2; border-color: #DC2626; color: #DC2626; }

.ltp-activity-body { flex: 1; overflow-y: auto; padding: 20px 24px; }

.ltp-activity-loading {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  padding: 40px; font-family: 'Inter', sans-serif; font-size: .85rem; color: #64748B;
}
@keyframes ltpSpin { to { transform: rotate(360deg); } }
.ltp-spin { animation: ltpSpin .8s linear infinite; }

.ltp-activity-empty {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 60px 20px; text-align: center; color: #94A3B8;
}
.ltp-activity-empty p { font-family: 'Manrope', sans-serif; font-size: .92rem; font-weight: 700; color: #64748B; margin: 0; }
.ltp-activity-empty span { font-family: 'Inter', sans-serif; font-size: .78rem; }

.ltp-activity-timeline { display: flex; flex-direction: column; }
.ltp-activity-item { display: flex; gap: 14px; min-height: 60px; }
.ltp-activity-dot-wrap { display: flex; flex-direction: column; align-items: center; width: 16px; flex-shrink: 0; }
.ltp-activity-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
.ltp-activity-dot--in { background: #059669; }
.ltp-activity-dot--out { background: #DC2626; }
.ltp-activity-line { width: 2px; flex: 1; background: #F1F5F9; min-height: 30px; }
.ltp-activity-content { flex: 1; padding-bottom: 18px; display: flex; flex-direction: column; gap: 4px; }
.ltp-activity-ev-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ltp-activity-ev-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: .75rem; font-weight: 600;
}
.ltp-activity-ev-badge--in { background: #ECFDF5; color: #059669; }
.ltp-activity-ev-badge--out { background: #FEF2F2; color: #DC2626; }
.ltp-activity-ev-site { font-family: 'Inter', sans-serif; font-size: .72rem; color: #F59E0B; font-weight: 600; }
.ltp-activity-ev-time { font-family: 'Inter', sans-serif; font-size: .72rem; color: #94A3B8; }
`

export default PremiumPlanning
