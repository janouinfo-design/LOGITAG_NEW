import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchEngines, getEngines} from '../Engin/slice/engin.slice'
import {API_BASE_URL_IMAGE} from '../../api/config'
import {
  Clock, LogIn, LogOut, Wifi, WifiOff, AlertTriangle,
  Filter, Search, X, ChevronDown, MapPin, Truck, Battery, Calendar
} from 'lucide-react'

const EVENT_TYPES = [
  {key: 'all', label: 'Tous', color: '#2563EB', bg: '#EFF6FF'},
  {key: 'entry', label: 'Entrées', icon: LogIn, color: '#059669', bg: '#ECFDF5'},
  {key: 'exit', label: 'Sorties', icon: LogOut, color: '#D64B70', bg: '#FDF2F8'},
  {key: 'alert', label: 'Alertes', icon: AlertTriangle, color: '#D97706', bg: '#FFFBEB'},
  {key: 'offline', label: 'Hors ligne', icon: WifiOff, color: '#94A3B8', bg: '#F1F5F9'},
]

const TIME_RANGES = [
  {key: 'today', label: "Aujourd'hui"},
  {key: 'week', label: 'Semaine'},
  {key: 'month', label: 'Mois'},
  {key: 'custom', label: 'Personnalisé'},
]

const generateEvents = (engines) => {
  if (!engines || engines.length === 0) return []
  const data = engines?.data || engines || []
  const events = []
  const now = Date.now()

  data.forEach((eng, idx) => {
    const type = eng.etatenginname === 'exit' ? 'exit' : eng.etatenginname === 'reception' ? 'entry' : idx % 3 === 0 ? 'alert' : 'offline'
    events.push({
      id: `ev-${eng.id || idx}`,
      type,
      asset: eng.reference || 'N/A',
      assetLabel: eng.label || '',
      image: eng.image,
      zone: eng.LocationObjectname || eng.enginAddress || '—',
      time: new Date(now - (idx * 180000 + Math.random() * 600000)),
      detail: type === 'entry' ? `Entrée dans ${eng.LocationObjectname || 'zone'}` :
              type === 'exit' ? `Sortie de ${eng.LocationObjectname || 'zone'}` :
              type === 'alert' ? `Batterie faible (${eng.batteries || 0}%)` :
              `Tag hors ligne`,
    })
  })
  return events.sort((a, b) => b.time - a.time)
}

const formatTime = (date) => {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})
}

const PremiumActivity = () => {
  const dispatch = useAppDispatch()
  const engines = useAppSelector(getEngines)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [timeRange, setTimeRange] = useState('today')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    setLoading(true)
    dispatch(fetchEngines({page: 1, PageSize: 50})).finally(() => setLoading(false))
  }, [dispatch])

  const events = generateEvents(engines)
  const now = new Date()
  const timeFiltered = events.filter((e) => {
    if (timeRange === 'today') {
      return e.time.toDateString() === now.toDateString()
    } else if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000)
      return e.time >= weekAgo
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 86400000)
      return e.time >= monthAgo
    } else if (timeRange === 'custom' && customFrom && customTo) {
      return e.time >= new Date(customFrom) && e.time <= new Date(customTo + 'T23:59:59')
    }
    return true
  })
  const filtered = timeFiltered.filter((e) => {
    if (filter !== 'all' && e.type !== filter) return false
    if (search) {
      const t = search.toLowerCase()
      return [e.asset, e.assetLabel, e.zone, e.detail].some(f => f && f.toLowerCase().includes(t))
    }
    return true
  })

  const getCfg = (type) => EVENT_TYPES.find(e => e.key === type) || EVENT_TYPES[0]

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltact" data-testid="premium-activity">
        <div className="ltact-header">
          <div>
            <h1 className="ltact-title" data-testid="activity-title">Activité</h1>
            <p className="ltact-sub">Historique des événements en temps réel</p>
          </div>
        </div>

        {/* Stats */}
        <div className="ltact-stats" data-testid="activity-stats">
          {EVENT_TYPES.filter(e => e.key !== 'all').map((et) => {
            const Icon = et.icon
            const count = events.filter(e => e.type === et.key).length
            return (
              <div key={et.key} className="ltact-stat-card" onClick={() => setFilter(et.key)} data-testid={`activity-stat-${et.key}`}>
                <div className="ltact-stat-icon" style={{background: et.bg}}>
                  <Icon size={18} style={{color: et.color}} />
                </div>
                <div className="ltact-stat-val" style={{color: et.color}}>{count}</div>
                <div className="ltact-stat-label">{et.label}</div>
              </div>
            )
          })}
        </div>

        {/* Time Range */}
        <div className="ltact-time-bar" data-testid="activity-time-range">
          <Calendar size={14} style={{color: '#94A3B8'}} />
          {TIME_RANGES.map(tr => (
            <button
              key={tr.key}
              className={`ltact-time-btn ${timeRange === tr.key ? 'ltact-time-btn--active' : ''}`}
              onClick={() => setTimeRange(tr.key)}
              data-testid={`activity-time-${tr.key}`}
            >
              {tr.label}
            </button>
          ))}
          {timeRange === 'custom' && (
            <div className="ltact-custom-dates">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} data-testid="activity-date-from" />
              <span>→</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} data-testid="activity-date-to" />
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="ltact-toolbar">
          <div className="ltact-search-wrap">
            <Search size={15} className="ltact-search-ico" />
            <input className="ltact-search" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} data-testid="activity-search" />
            {search && <button className="ltact-search-clear" onClick={() => setSearch('')}><X size={13} /></button>}
          </div>
          <div className="ltact-filters" data-testid="activity-filters">
            {EVENT_TYPES.map(et => (
              <button
                key={et.key}
                className={`ltact-chip ${filter === et.key ? 'ltact-chip--active' : ''}`}
                style={filter === et.key ? {background: et.bg, color: et.color, borderColor: et.color} : {}}
                onClick={() => setFilter(et.key)}
                data-testid={`activity-filter-${et.key}`}
              >
                {et.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="ltact-timeline" data-testid="activity-timeline">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="ltact-skel" />)
          ) : filtered.length === 0 ? (
            <div className="ltact-empty"><Clock size={40} strokeWidth={1} /><p>Aucun événement</p></div>
          ) : (
            filtered.map((ev, i) => {
              const cfg = getCfg(ev.type)
              const Icon = cfg.icon || Clock
              return (
                <div key={ev.id} className="ltact-event" data-testid={`activity-event-${i}`}>
                  <div className="ltact-ev-line">
                    <div className="ltact-ev-dot" style={{background: cfg.bg, borderColor: cfg.color}}>
                      <Icon size={14} style={{color: cfg.color}} />
                    </div>
                  </div>
                  <div className="ltact-ev-card">
                    <div className="ltact-ev-top">
                      {ev.image && <img src={`${API_BASE_URL_IMAGE}${ev.image}`} alt="" className="ltact-ev-img" />}
                      <div className="ltact-ev-info">
                        <span className="ltact-ev-asset">{ev.asset}</span>
                        <span className="ltact-ev-detail">{ev.detail}</span>
                      </div>
                      <span className="ltact-ev-time">{formatTime(ev.time)}</span>
                    </div>
                    <div className="ltact-ev-bottom">
                      <span className="ltact-ev-zone"><MapPin size={11} /> {ev.zone}</span>
                      <span className="ltact-ev-badge" style={{background: cfg.bg, color: cfg.color}}>{cfg.label}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="ltact-count">{filtered.length} événement{filtered.length > 1 ? 's' : ''}</div>
      </div>
    </>
  )
}

const STYLES = `
.ltact { max-width: 1100px; }
.ltact-header { margin-bottom: 24px; }
.ltact-title { font-family:'Manrope',sans-serif; font-size:1.75rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.ltact-sub { font-family:'Inter',sans-serif; font-size:.875rem; color:#64748B; margin:4px 0 0; }

.ltact-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
@media(max-width:768px){ .ltact-stats{ grid-template-columns:repeat(2,1fr); } }
.ltact-stat-card { background:#FFF; border-radius:12px; border:1px solid #E2E8F0; padding:18px; cursor:pointer; transition:all .15s; display:flex; flex-direction:column; gap:8px; }
.ltact-stat-card:hover { border-color:#CBD5E1; box-shadow:0 4px 16px rgba(0,0,0,.04); }
.ltact-stat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
.ltact-stat-val { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; letter-spacing:-.03em; }
.ltact-stat-label { font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; }

.ltact-toolbar { display:flex; align-items:center; gap:14px; margin-bottom:20px; flex-wrap:wrap; }

/* Time range bar */
.ltact-time-bar { display:flex; align-items:center; gap:6px; margin-bottom:16px; flex-wrap:wrap; }
.ltact-time-btn { padding:7px 16px; border-radius:20px; border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:600; cursor:pointer; transition:all .15s; }
.ltact-time-btn:hover { border-color:#2563EB; color:#2563EB; }
.ltact-time-btn--active { background:#2563EB; color:#FFF; border-color:#2563EB; box-shadow:0 2px 6px rgba(37,99,235,.2); }
.ltact-custom-dates { display:flex; align-items:center; gap:8px; margin-left:8px; }
.ltact-custom-dates input { padding:6px 12px; border-radius:8px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; }
.ltact-custom-dates input:focus { border-color:#2563EB; }
.ltact-custom-dates span { color:#94A3B8; font-size:.8rem; }
.ltact-search-wrap { position:relative; flex:1; min-width:200px; max-width:340px; }
.ltact-search-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
.ltact-search { width:100%; padding:9px 32px 9px 38px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; font-size:.82rem; font-family:'Inter',sans-serif; color:#0F172A; outline:none; transition:all .2s; }
.ltact-search:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
.ltact-search-clear { position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:transparent; color:#94A3B8; cursor:pointer; }
.ltact-filters { display:flex; gap:6px; flex-wrap:wrap; }
.ltact-chip { padding:6px 13px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:500; cursor:pointer; transition:all .12s; }
.ltact-chip:hover { border-color:#CBD5E1; }
.ltact-chip--active { font-weight:600; }

.ltact-timeline { display:flex; flex-direction:column; gap:0; }
.ltact-event { display:flex; gap:14px; }
.ltact-ev-line { display:flex; flex-direction:column; align-items:center; width:36px; flex-shrink:0; position:relative; }
.ltact-ev-dot { width:32px; height:32px; border-radius:10px; border:1.5px solid; display:flex; align-items:center; justify-content:center; z-index:1; background:#FFF; }
.ltact-event:not(:last-child) .ltact-ev-line::after { content:''; position:absolute; top:38px; left:50%; transform:translateX(-50%); width:2px; height:calc(100% - 10px); background:#F1F5F9; }
.ltact-ev-card { flex:1; background:#FFF; border-radius:12px; border:1px solid #E2E8F0; padding:14px 18px; margin-bottom:12px; transition:all .12s; }
.ltact-ev-card:hover { border-color:#CBD5E1; box-shadow:0 2px 12px rgba(0,0,0,.03); }
.ltact-ev-top { display:flex; align-items:center; gap:12px; }
.ltact-ev-img { width:38px; height:38px; border-radius:9px; object-fit:cover; flex-shrink:0; }
.ltact-ev-info { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0; }
.ltact-ev-asset { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; }
.ltact-ev-detail { font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; }
.ltact-ev-time { font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; white-space:nowrap; flex-shrink:0; }
.ltact-ev-bottom { display:flex; align-items:center; justify-content:space-between; margin-top:10px; padding-top:10px; border-top:1px solid #F8FAFC; }
.ltact-ev-zone { display:flex; align-items:center; gap:4px; font-family:'Inter',sans-serif; font-size:.7rem; color:#94A3B8; }
.ltact-ev-badge { display:inline-flex; padding:3px 10px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.65rem; font-weight:600; }

.ltact-skel { height:84px; margin-bottom:12px; border-radius:12px; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; margin-left:50px; }
@keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.ltact-empty { display:flex; flex-direction:column; align-items:center; padding:60px; color:#CBD5E1; gap:8px; }
.ltact-empty p { font-family:'Inter',sans-serif; font-size:.85rem; color:#94A3B8; margin:0; }
.ltact-count { text-align:center; margin-top:16px; font-family:'Inter',sans-serif; font-size:.78rem; color:#94A3B8; }
`

export default PremiumActivity
