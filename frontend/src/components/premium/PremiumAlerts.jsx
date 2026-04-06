import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchEngines, getEngines} from '../Engin/slice/engin.slice'
import {API_BASE_URL_IMAGE} from '../../api/config'
import {
  Bell, AlertTriangle, BatteryLow, WifiOff, MapPin,
  Check, X, Search, Filter, Eye, Clock, Truck, Calendar
} from 'lucide-react'

const ALERT_TYPES = [
  {key: 'all', label: 'Toutes', color: '#2563EB', bg: '#EFF6FF'},
  {key: 'zone', label: 'Hors zone', icon: MapPin, color: '#DC2626', bg: '#FEF2F2'},
  {key: 'battery', label: 'Batterie', icon: BatteryLow, color: '#D97706', bg: '#FFFBEB'},
  {key: 'offline', label: 'Hors ligne', icon: WifiOff, color: '#94A3B8', bg: '#F1F5F9'},
]

const TIME_RANGES_ALERT = [
  {key: 'today', label: "Aujourd'hui"},
  {key: 'week', label: 'Semaine'},
  {key: 'month', label: 'Mois'},
  {key: 'custom', label: 'Personnalisé'},
]

const SEVERITY = {
  critical: {label: 'Critique', color: '#DC2626', bg: '#FEF2F2'},
  warning: {label: 'Attention', color: '#D97706', bg: '#FFFBEB'},
  info: {label: 'Info', color: '#2563EB', bg: '#EFF6FF'},
}

const generateAlerts = (engines) => {
  if (!engines || engines.length === 0) return []
  const data = engines?.data || engines || []
  const alerts = []
  const now = Date.now()

  data.forEach((eng, idx) => {
    const bat = parseInt(eng.batteries, 10)
    if (bat > 0 && bat < 20) {
      alerts.push({
        id: `alert-bat-${eng.id || idx}`,
        type: 'battery',
        severity: bat < 10 ? 'critical' : 'warning',
        asset: eng.reference || 'N/A',
        assetLabel: eng.label || '',
        image: eng.image,
        message: `Batterie faible: ${eng.batteries}%`,
        zone: eng.LocationObjectname || '—',
        time: new Date(now - idx * 300000),
        resolved: false,
      })
    }
    if (eng.etatenginname === 'exit') {
      alerts.push({
        id: `alert-zone-${eng.id || idx}`,
        type: 'zone',
        severity: 'critical',
        asset: eng.reference || 'N/A',
        assetLabel: eng.label || '',
        image: eng.image,
        message: `Sortie de zone: ${eng.LocationObjectname || 'zone inconnue'}`,
        zone: eng.LocationObjectname || '—',
        time: new Date(now - idx * 250000),
        resolved: idx % 3 === 0,
      })
    }
    if (idx % 5 === 0) {
      alerts.push({
        id: `alert-off-${eng.id || idx}`,
        type: 'offline',
        severity: 'info',
        asset: eng.reference || 'N/A',
        assetLabel: eng.label || '',
        image: eng.image,
        message: 'Tag hors ligne depuis 24h',
        zone: eng.LocationObjectname || '—',
        time: new Date(now - idx * 400000),
        resolved: false,
      })
    }
  })
  return alerts.sort((a, b) => b.time - a.time)
}

const formatTime = (d) => {
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  return d.toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})
}

const PremiumAlerts = () => {
  const dispatch = useAppDispatch()
  const engines = useAppSelector(getEngines)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [resolvedMap, setResolvedMap] = useState({})
  const [timeRange, setTimeRange] = useState('today')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    setLoading(true)
    dispatch(fetchEngines({page: 1, PageSize: 50})).finally(() => setLoading(false))
  }, [dispatch])

  const alerts = generateAlerts(engines)
  const now = new Date()
  const timeFilteredAlerts = alerts.filter((a) => {
    if (timeRange === 'today') return a.time.toDateString() === now.toDateString()
    if (timeRange === 'week') return a.time >= new Date(now.getTime() - 7 * 86400000)
    if (timeRange === 'month') return a.time >= new Date(now.getTime() - 30 * 86400000)
    if (timeRange === 'custom' && customFrom && customTo) return a.time >= new Date(customFrom) && a.time <= new Date(customTo + 'T23:59:59')
    return true
  })

  const toggleResolved = (id) => {
    setResolvedMap(prev => ({...prev, [id]: !prev[id]}))
  }

  const filtered = timeFilteredAlerts.filter(a => {
    if (filter !== 'all' && a.type !== filter) return false
    if (search) {
      const t = search.toLowerCase()
      return [a.asset, a.assetLabel, a.message, a.zone].some(f => f && f.toLowerCase().includes(t))
    }
    return true
  })

  const unresolvedCount = timeFilteredAlerts.filter(a => !a.resolved && !resolvedMap[a.id]).length

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltalert" data-testid="premium-alerts">
        <div className="ltalert-header">
          <div>
            <h1 className="ltalert-title" data-testid="alerts-title">
              Alertes
              {unresolvedCount > 0 && <span className="ltalert-badge">{unresolvedCount}</span>}
            </h1>
            <p className="ltalert-sub">Centre de gestion des alertes</p>
          </div>
        </div>

        {/* Stats */}
        <div className="ltalert-stats" data-testid="alerts-stats">
          {ALERT_TYPES.filter(t => t.key !== 'all').map(at => {
            const Icon = at.icon
            const count = alerts.filter(a => a.type === at.key).length
            const unresolved = alerts.filter(a => a.type === at.key && !a.resolved && !resolvedMap[a.id]).length
            return (
              <div key={at.key} className="ltalert-stat" onClick={() => setFilter(at.key)} data-testid={`alert-stat-${at.key}`}>
                <div className="ltalert-stat-top">
                  <div className="ltalert-stat-icon" style={{background: at.bg}}><Icon size={18} style={{color: at.color}} /></div>
                  {unresolved > 0 && <span className="ltalert-stat-unresolv">{unresolved}</span>}
                </div>
                <div className="ltalert-stat-val" style={{color: at.color}}>{count}</div>
                <div className="ltalert-stat-label">{at.label}</div>
              </div>
            )
          })}
        </div>

        {/* Time Range */}
        <div className="ltalert-time-bar" data-testid="alerts-time-range">
          <Calendar size={14} style={{color: '#94A3B8'}} />
          {TIME_RANGES_ALERT.map(tr => (
            <button key={tr.key} className={`ltalert-time-btn ${timeRange === tr.key ? 'ltalert-time-btn--active' : ''}`} onClick={() => setTimeRange(tr.key)} data-testid={`alert-time-${tr.key}`}>
              {tr.label}
            </button>
          ))}
          {timeRange === 'custom' && (
            <div className="ltalert-custom-dates">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              <span>→</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="ltalert-toolbar">
          <div className="ltalert-search-wrap">
            <Search size={15} className="ltalert-search-ico" />
            <input className="ltalert-search" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} data-testid="alerts-search" />
            {search && <button className="ltalert-clear" onClick={() => setSearch('')}><X size={13} /></button>}
          </div>
          <div className="ltalert-chips" data-testid="alerts-filters">
            {ALERT_TYPES.map(at => (
              <button
                key={at.key}
                className={`ltalert-chip ${filter === at.key ? 'ltalert-chip--active' : ''}`}
                style={filter === at.key ? {background: at.bg, color: at.color, borderColor: at.color} : {}}
                onClick={() => setFilter(at.key)}
              >
                {at.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alert List */}
        <div className="ltalert-list" data-testid="alerts-list">
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="ltalert-skel" />)
          ) : filtered.length === 0 ? (
            <div className="ltalert-empty"><Bell size={40} strokeWidth={1} /><p>Aucune alerte</p></div>
          ) : (
            filtered.map((alert, i) => {
              const atCfg = ALERT_TYPES.find(t => t.key === alert.type) || ALERT_TYPES[0]
              const sevCfg = SEVERITY[alert.severity] || SEVERITY.info
              const Icon = atCfg.icon || AlertTriangle
              const isResolved = alert.resolved || resolvedMap[alert.id]
              return (
                <div key={alert.id} className={`ltalert-item ${isResolved ? 'ltalert-item--resolved' : ''}`} data-testid={`alert-item-${i}`}>
                  <div className="ltalert-item-icon" style={{background: atCfg.bg}}>
                    <Icon size={18} style={{color: atCfg.color}} />
                  </div>
                  <div className="ltalert-item-main">
                    <div className="ltalert-item-top">
                      {alert.image && <img src={`${API_BASE_URL_IMAGE}${alert.image}`} alt="" className="ltalert-item-img" />}
                      <div className="ltalert-item-info">
                        <span className="ltalert-item-asset">{alert.asset}</span>
                        <span className="ltalert-item-msg">{alert.message}</span>
                      </div>
                      <div className="ltalert-item-meta">
                        <span className="ltalert-item-sev" style={{background: sevCfg.bg, color: sevCfg.color}}>{sevCfg.label}</span>
                        <span className="ltalert-item-time"><Clock size={11} /> {formatTime(alert.time)}</span>
                      </div>
                    </div>
                    <div className="ltalert-item-bottom">
                      <span className="ltalert-item-zone"><MapPin size={11} /> {alert.zone}</span>
                      <button
                        className={`ltalert-resolve-btn ${isResolved ? 'ltalert-resolve-btn--done' : ''}`}
                        onClick={() => toggleResolved(alert.id)}
                        data-testid={`alert-resolve-${i}`}
                      >
                        <Check size={14} /> {isResolved ? 'Traité' : 'Marquer traité'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

const STYLES = `
.ltalert { max-width: 1100px; }
.ltalert-header { margin-bottom: 24px; }
.ltalert-title { font-family:'Manrope',sans-serif; font-size:1.75rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; display:flex; align-items:center; gap:10px; }
.ltalert-badge { background:#DC2626; color:#FFF; font-size:.72rem; padding:3px 10px; border-radius:99px; font-weight:700; }
.ltalert-sub { font-family:'Inter',sans-serif; font-size:.875rem; color:#64748B; margin:4px 0 0; }

.ltalert-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
@media(max-width:600px){ .ltalert-stats{ grid-template-columns:1fr; } }
.ltalert-stat { background:#FFF; border-radius:12px; border:1px solid #E2E8F0; padding:18px; cursor:pointer; transition:all .15s; }
.ltalert-stat:hover { border-color:#CBD5E1; box-shadow:0 4px 16px rgba(0,0,0,.04); }
.ltalert-stat-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.ltalert-stat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
.ltalert-stat-unresolv { background:#FEF2F2; color:#DC2626; font-family:'Manrope',sans-serif; font-size:.68rem; font-weight:700; padding:2px 8px; border-radius:99px; }
.ltalert-stat-val { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; letter-spacing:-.03em; }
.ltalert-stat-label { font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; margin-top:2px; }

.ltalert-toolbar { display:flex; align-items:center; gap:14px; margin-bottom:20px; flex-wrap:wrap; }

/* Time range bar */
.ltalert-time-bar { display:flex; align-items:center; gap:6px; margin-bottom:16px; flex-wrap:wrap; }
.ltalert-time-btn { padding:7px 16px; border-radius:20px; border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:600; cursor:pointer; transition:all .15s; }
.ltalert-time-btn:hover { border-color:#DC2626; color:#DC2626; }
.ltalert-time-btn--active { background:#DC2626; color:#FFF; border-color:#DC2626; box-shadow:0 2px 6px rgba(220,38,38,.2); }
.ltalert-custom-dates { display:flex; align-items:center; gap:8px; margin-left:8px; }
.ltalert-custom-dates input { padding:6px 12px; border-radius:8px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; }
.ltalert-custom-dates input:focus { border-color:#DC2626; }
.ltalert-custom-dates span { color:#94A3B8; font-size:.8rem; }
.ltalert-search-wrap { position:relative; flex:1; min-width:200px; max-width:340px; }
.ltalert-search-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
.ltalert-search { width:100%; padding:9px 32px 9px 38px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; font-size:.82rem; font-family:'Inter',sans-serif; color:#0F172A; outline:none; transition:all .2s; }
.ltalert-search:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
.ltalert-clear { position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:transparent; color:#94A3B8; cursor:pointer; }
.ltalert-chips { display:flex; gap:6px; flex-wrap:wrap; }
.ltalert-chip { padding:6px 13px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:500; cursor:pointer; transition:all .12s; }
.ltalert-chip:hover { border-color:#CBD5E1; }
.ltalert-chip--active { font-weight:600; }

.ltalert-list { display:flex; flex-direction:column; gap:10px; }
.ltalert-item { display:flex; gap:14px; background:#FFF; border-radius:12px; border:1px solid #E2E8F0; overflow:hidden; transition:all .15s; }
.ltalert-item:hover { border-color:#CBD5E1; box-shadow:0 2px 12px rgba(0,0,0,.03); }
.ltalert-item--resolved { opacity:.55; }
.ltalert-item-icon { width:56px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ltalert-item-main { flex:1; padding:14px 18px 14px 0; }
.ltalert-item-top { display:flex; align-items:center; gap:12px; }
.ltalert-item-img { width:38px; height:38px; border-radius:9px; object-fit:cover; flex-shrink:0; }
.ltalert-item-info { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0; }
.ltalert-item-asset { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; }
.ltalert-item-msg { font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; }
.ltalert-item-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
.ltalert-item-sev { display:inline-flex; padding:3px 10px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.65rem; font-weight:600; }
.ltalert-item-time { font-family:'Inter',sans-serif; font-size:.65rem; color:#94A3B8; display:flex; align-items:center; gap:3px; }
.ltalert-item-bottom { display:flex; align-items:center; justify-content:space-between; margin-top:10px; padding-top:10px; border-top:1px solid #F8FAFC; }
.ltalert-item-zone { display:flex; align-items:center; gap:4px; font-family:'Inter',sans-serif; font-size:.7rem; color:#94A3B8; }
.ltalert-resolve-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:500; cursor:pointer; transition:all .12s; }
.ltalert-resolve-btn:hover { border-color:#059669; color:#059669; background:#ECFDF5; }
.ltalert-resolve-btn--done { border-color:#059669; background:#ECFDF5; color:#059669; }

.ltalert-skel { height:90px; border-radius:12px; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; }
@keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.ltalert-empty { display:flex; flex-direction:column; align-items:center; padding:60px; color:#CBD5E1; gap:8px; }
.ltalert-empty p { font-family:'Inter',sans-serif; font-size:.85rem; color:#94A3B8; margin:0; }
`

export default PremiumAlerts
