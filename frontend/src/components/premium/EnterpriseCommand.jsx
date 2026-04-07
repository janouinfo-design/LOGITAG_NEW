import {useState, useEffect, useCallback, useRef, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchEngines, getEngines} from '../Engin/slice/engin.slice'
import {fetchGateways, getGateways} from '../Gateway/slice/gateway.slice'
import {fetchDashboard, getDashboard} from '../Dashboard/slice/dashboard.slice'
import {useWebSocket} from '../../hooks/useWebSocket'
import {MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import {
  Search, X, Filter, Bell, ChevronDown, User, Settings, Box, Zap,
  MapPin, BatteryLow, AlertTriangle, Activity, Clock, Battery,
  LogIn, LogOut, Wifi, WifiOff, Truck, Radio, ChevronRight,
  ChevronLeft, Eye, Signal, BarChart3, Layers, Target, Menu,
  Calendar, Shield, FileBarChart, ChevronsDown, ChevronsUp,
  BatteryMedium, BatteryFull, BatteryCharging, Bluetooth, Loader2,
  Download, RefreshCw
} from 'lucide-react'

const API = process.env.REACT_APP_BACKEND_URL

/* ── Leaflet icon fix ── */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

/* ── Smart marker icons ── */
const mkIcon = (color, size = 28) => L.divIcon({
  className: '',
  html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);transition:transform .2s;"></div>`,
  iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2 - 4],
})
const STATUS_ICONS = {
  active: mkIcon('#10B981'), reception: mkIcon('#2563EB'),
  exit: mkIcon('#EF4444'), nonactive: mkIcon('#94A3B8'), default: mkIcon('#F59E0B'),
}
const getIcon = (item) => {
  if (item?.etatenginname === 'exit') return STATUS_ICONS.exit
  if (item?.etatenginname === 'reception') return STATUS_ICONS.reception
  if (item?.etatenginname === 'nonactive') return STATUS_ICONS.nonactive
  if (item?.etatenginname === 'active' || item?.active === 1) return STATUS_ICONS.active
  return STATUS_ICONS.default
}
const routerIcon = (on) => L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:6px;background:${on ? '#10B981' : '#94A3B8'};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M6.7 6.7a8 8 0 0 1 10.6 0"/></svg></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
})

/* ── Recenter ── */
const Recenter = ({center}) => { const m = useMap(); useEffect(() => { if (center) m.flyTo(center, 14, {duration: .8}) }, [center, m]); return null }

/* ── Battery helpers ── */
const getBattery = (item) => {
  const v = parseFloat(item?.batteryLevelInPercent || item?.battery || 0)
  return isNaN(v) ? 0 : Math.min(100, Math.max(0, v))
}
const BatteryIcon = ({level}) => {
  if (level < 20) return <BatteryLow size={14} style={{color:'#EF4444'}} />
  if (level < 50) return <BatteryMedium size={14} style={{color:'#F59E0B'}} />
  return <BatteryFull size={14} style={{color:'#10B981'}} />
}
const getStatusColor = (s) => s === 'exit' ? '#EF4444' : s === 'reception' ? '#2563EB' : s === 'nonactive' ? '#94A3B8' : '#10B981'
const getStatusLabel = (s) => s === 'exit' ? 'Sorti' : s === 'reception' ? 'Réception' : s === 'nonactive' ? 'Inactif' : 'Actif'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ENTERPRISE COMMAND CENTER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const EnterpriseCommand = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const engines = useAppSelector(getEngines)
  const gateways = useAppSelector(getGateways)
  const dashData = useAppSelector(getDashboard)

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState(null)
  const [showRouters, setShowRouters] = useState(false)
  const [showZones, setShowZones] = useState(true)
  const [zones, setZones] = useState([])
  const [events, setEvents] = useState([])
  const [notifCount, setNotifCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [changedIds, setChangedIds] = useState(new Set())
  const [externalLogs, setExternalLogs] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [todaySummary, setTodaySummary] = useState(null)
  const [assetPage, setAssetPage] = useState(1)
  const ASSETS_PER_PAGE = 30
  const prevAssetsRef = useRef(null)
  const refreshInterval = useRef(null)

  const assetList = Array.isArray(engines) ? engines : []
  const routerList = Array.isArray(gateways) ? gateways : []
  const routersWithCoords = routerList.filter(r => r.lat && r.lng && r.lat !== 0)

  // Fetch data
  const refreshData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    dispatch(fetchEngines({page: 1, PageSize: 500}))
    dispatch(fetchGateways())
    dispatch(fetchDashboard())
    try {
      const [zRes, eRes, nRes, sumRes] = await Promise.all([
        fetch(`${API}/api/zones`), fetch(`${API}/api/zones/events?limit=50`), fetch(`${API}/api/notifications/count`),
        fetch(`${API}/api/reservations/today-summary`)
      ])
      if (zRes.ok) setZones(await zRes.json())
      if (eRes.ok) setEvents(await eRes.json())
      if (nRes.ok) { const d = await nRes.json(); setNotifCount(d.count || 0) }
      if (sumRes.ok) setTodaySummary(await sumRes.json())
    } catch {}
    setLastRefresh(new Date())
    if (!silent) setLoading(false)
    else setRefreshing(false)
    // Fetch external API logs in background (non-blocking)
    try {
      const logRes = await fetch(`${API}/api/proxy/logs/list`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({reverse: 1, limit: 50})
      })
      if (logRes.ok) {
        const logData = await logRes.json()
        if (logData.response && Array.isArray(logData.response)) setExternalLogs(logData.response)
      }
    } catch {}
  }, [dispatch])

  useEffect(() => {
    refreshData()
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => refreshData(true), 30000)
    return () => { if (refreshInterval.current) clearInterval(refreshInterval.current) }
  }, [refreshData])

  // Detect changed assets (position/status/battery)
  useEffect(() => {
    if (!prevAssetsRef.current || !assetList.length) {
      prevAssetsRef.current = assetList
      return
    }
    const changed = new Set()
    assetList.forEach(a => {
      const prev = prevAssetsRef.current.find(p => p.id === a.id)
      if (prev && (prev.lat !== a.lat || prev.lng !== a.lng || prev.etatenginname !== a.etatenginname || prev.batteryLevelInPercent !== a.batteryLevelInPercent)) {
        changed.add(a.id)
      }
    })
    if (changed.size > 0) {
      setChangedIds(changed)
      setTimeout(() => setChangedIds(new Set()), 4000)
    }
    prevAssetsRef.current = assetList
  }, [assetList])

  // WebSocket
  const {connected} = useWebSocket(useCallback((msg) => {
    if (msg.type === 'zone_event') {
      fetch(`${API}/api/zones/events?limit=30`).then(r => r.json()).then(d => { if (Array.isArray(d)) setEvents(d) }).catch(() => {})
    }
    if (msg.type === 'notification') {
      fetch(`${API}/api/notifications/count`).then(r => r.json()).then(d => setNotifCount(d.count || 0)).catch(() => {})
    }
    if (msg.type === 'asset_update' || msg.type === 'reservation_update') {
      refreshData(true)
    }
  }, [refreshData]))

  // KPIs from dashboard data
  const kpis = Array.isArray(dashData) ? dashData : []
  const kpiConfigs = [
    {label: 'Assets actifs', icon: Box, color: '#2563EB', bg: '#EFF6FF', val: kpis[0]?.counter ?? assetList.filter(a => a.etatenginname === 'active' || a.active === 1).length},
    {label: 'Réserv. actives', icon: Calendar, color: '#059669', bg: '#ECFDF5', val: todaySummary?.active_count || 0},
    {label: 'En attente', icon: Clock, color: '#D97706', bg: '#FFFBEB', val: todaySummary?.pending_count || 0},
    {label: 'En retard', icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2', val: todaySummary?.overdue_count || 0},
    {label: 'Alertes', icon: Shield, color: '#7C3AED', bg: '#F5F3FF', val: (todaySummary?.alert_count || 0) + notifCount},
    {label: 'Batt. faible', icon: BatteryLow, color: '#EA580C', bg: '#FFF7ED', val: kpis[3]?.counter ?? assetList.filter(a => getBattery(a) < 20).length},
  ]

  // Filtered assets
  const filtered = assetList.filter(a => {
    if (search) {
      const t = search.toLowerCase()
      if (!(a.fname || '').toLowerCase().includes(t) && !(a.label || '').toLowerCase().includes(t) && !(a.LocationObjectname || '').toLowerCase().includes(t)) return false
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && a.etatenginname !== 'active') return false
      if (statusFilter === 'exit' && a.etatenginname !== 'exit') return false
      if (statusFilter === 'nonactive' && a.etatenginname !== 'nonactive') return false
      if (statusFilter === 'lowbatt' && getBattery(a) >= 20) return false
    }
    return true
  })

  const assetsWithCoords = filtered.filter(a => a.lat && a.lng && a.lat !== 0)

  // Pagination for sidebar list
  const totalAssetPages = Math.ceil(filtered.length / ASSETS_PER_PAGE)
  const safeAssetPage = totalAssetPages > 0 && assetPage > totalAssetPages ? totalAssetPages : assetPage
  const paginatedAssets = filtered.slice((safeAssetPage - 1) * ASSETS_PER_PAGE, safeAssetPage * ASSETS_PER_PAGE)

  const selectAsset = (asset) => {
    setSelectedAsset(asset)
    setDetailOpen(true)
    if (asset.lat && asset.lng) setMapCenter([asset.lat, asset.lng])
  }

  const EVENT_META = {
    asset_enter_zone: {label: 'Entrée zone', icon: LogIn, color: '#059669'},
    asset_exit_zone: {label: 'Sortie zone', icon: LogOut, color: '#D97706'},
    asset_not_detected: {label: 'Non détecté', icon: AlertTriangle, color: '#DC2626'},
    asset_detected_by_router: {label: 'Détecté BLE', icon: Bluetooth, color: '#8B5CF6'},
  }

  // Build rich timeline entries: pair entry/exit, add duration, combine with external logs
  const richTimeline = useMemo(() => {
    const items = []
    // Process local zone events - pair enter/exit by asset+zone
    const sorted = [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    const paired = new Set()
    sorted.forEach(ev => {
      if (paired.has(ev.id)) return
      paired.add(ev.id)
      const item = {
        id: ev.id,
        type: ev.event_type,
        asset: ev.asset_name || ev.asset_id || '',
        zone: ev.zone_name || '',
        router: ev.router_id || null,
        rssi: ev.signal_strength,
        location: ev.location,
        entryDate: null,
        exitDate: null,
        duration: null,
        source: 'local',
      }
      if (ev.event_type === 'asset_enter_zone') {
        item.entryDate = ev.timestamp
        // Find matching exit for same asset+zone
        const exitEv = sorted.find(e => e.id !== ev.id && e.event_type === 'asset_exit_zone' && e.asset_id === ev.asset_id && e.zone_id === ev.zone_id && !paired.has(e.id))
        if (exitEv) {
          item.exitDate = exitEv.timestamp
          paired.add(exitEv.id)
          const ms = new Date(exitEv.timestamp) - new Date(ev.timestamp)
          item.duration = ms > 0 ? ms : Math.abs(ms)
        }
      } else if (ev.event_type === 'asset_exit_zone') {
        item.exitDate = ev.timestamp
        const enterEv = sorted.find(e => e.id !== ev.id && e.event_type === 'asset_enter_zone' && e.asset_id === ev.asset_id && e.zone_id === ev.zone_id && !paired.has(e.id))
        if (enterEv) {
          item.entryDate = enterEv.timestamp
          paired.add(enterEv.id)
          const ms = new Date(ev.timestamp) - new Date(enterEv.timestamp)
          item.duration = ms > 0 ? ms : Math.abs(ms)
        }
      } else {
        item.entryDate = ev.timestamp
      }
      // Try finding router info from gateways
      if (item.router) {
        const gw = routerList.find(r => String(r.id) === String(item.router))
        if (gw) item.routerName = gw.fname || gw.label || gw.serialNumber
      }
      items.push(item)
    })
    // Add external logs if available
    externalLogs.forEach((log, i) => {
      items.push({
        id: `ext-${i}`,
        type: log.statuslabel === 'Exit' || log.statuslabel === 'exit' ? 'asset_exit_zone' : 'asset_enter_zone',
        asset: log.engin || log.reference || '',
        zone: log.locationObjectname || log.locationLabel || '',
        router: log.deviceId || log.gateway || null,
        routerName: log.deviceId || log.gateway || null,
        rssi: log.rssi || log.RSSI || null,
        location: (log.lat && log.lng) ? [log.lat, log.lng] : null,
        entryDate: log.statusDate || log.dateFormated || null,
        exitDate: log.exitDate || null,
        duration: log.duration ? log.duration * 1000 : null,
        source: 'external',
        macAddr: log.macAddr,
      })
    })
    return items.sort((a, b) => {
      const da = new Date(a.exitDate || a.entryDate || 0)
      const db = new Date(b.exitDate || b.entryDate || 0)
      return db - da
    })
  }, [events, externalLogs, routerList])

  // Format duration helper
  const fmtDuration = (ms) => {
    if (!ms || ms <= 0) return null
    const s = Math.floor(ms / 1000)
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
    const parts = []
    if (d > 0) parts.push(`${d}j`)
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}min`)
    return parts.join(' ') || '< 1min'
  }
  const fmtDate = (d) => d ? new Date(d).toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : null
  const getRssiColor = (v) => !v ? '#94A3B8' : v > -60 ? '#10B981' : v > -80 ? '#F59E0B' : '#EF4444'

  // Export Timeline as CSV
  const exportTimelineCSV = useCallback(() => {
    if (!richTimeline.length) return
    const rows = [['Événement', 'Asset', 'Zone/Site', 'Entrée', 'Sortie', 'Durée', 'Routeur', 'RSSI']]
    richTimeline.forEach(item => {
      const meta = EVENT_META[item.type] || {label: item.type}
      rows.push([
        meta.label, item.asset, item.zone,
        item.entryDate ? new Date(item.entryDate).toLocaleString('fr-FR') : '',
        item.exitDate ? new Date(item.exitDate).toLocaleString('fr-FR') : '',
        fmtDuration(item.duration) || '',
        item.routerName || item.router || '',
        item.rssi != null ? String(item.rssi) : ''
      ])
    })
    const csv = rows.map(r => r.map(c => `"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `journal_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }, [richTimeline])

  const exportTimelinePDF = useCallback(async () => {
    if (!richTimeline.length) return
    const printWin = window.open('', '_blank')
    const rows = richTimeline.map(item => {
      const meta = EVENT_META[item.type] || {label: item.type}
      return `<tr><td>${meta.label}</td><td>${item.asset}</td><td>${item.zone}</td><td>${item.entryDate ? new Date(item.entryDate).toLocaleString('fr-FR') : ''}</td><td>${item.exitDate ? new Date(item.exitDate).toLocaleString('fr-FR') : ''}</td><td>${fmtDuration(item.duration) || ''}</td><td>${item.routerName || item.router || ''}</td><td>${item.rssi != null ? item.rssi : ''}</td></tr>`
    }).join('')
    printWin.document.write(`<!DOCTYPE html><html><head><title>Journal LOGITAG</title>
      <style>body{font-family:Inter,sans-serif;padding:24px;}h1{font-size:18px;margin-bottom:16px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #E2E8F0;padding:8px 12px;text-align:left;font-size:12px;}th{background:#F1F5F9;font-weight:700;}</style>
      </head><body><h1>Journal des événements - LOGITAG</h1><p style="color:#64748B;font-size:12px;">Exporté le ${new Date().toLocaleString('fr-FR')}</p>
      <table><thead><tr><th>Événement</th><th>Asset</th><th>Zone/Site</th><th>Entrée</th><th>Sortie</th><th>Durée</th><th>Routeur</th><th>RSSI</th></tr></thead><tbody>${rows}</tbody></table></body></html>`)
    printWin.document.close()
    setTimeout(() => printWin.print(), 500)
  }, [richTimeline])

  // Click event to locate on map
  const onEventClick = (item) => {
    setSelectedEvent(item)
    if (item.location && item.location[0] && item.location[1]) {
      setMapCenter([item.location[0], item.location[1]])
    }
    // Try to find and select the asset
    const asset = assetList.find(a => (a.fname || a.label || '').toLowerCase() === (item.asset || '').toLowerCase())
    if (asset) selectAsset(asset)
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="ec" data-testid="enterprise-command">
        {/* ═══ TOP BAR ═══ */}
        <header className="ec-topbar" data-testid="enterprise-topbar">
          <div className="ec-topbar-left">
            <button className="ec-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} data-testid="sidebar-toggle-btn">
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            <div className="ec-topbar-kpis" data-testid="topbar-kpis">
              {loading ? [...Array(4)].map((_, i) => (
                <div key={i} className="ec-kpi ec-kpi--skeleton" style={{animationDelay: `${i * 0.08}s`}}>
                  <div className="ec-skeleton-dot ec-skeleton-dot--kpi" />
                  <div style={{display:'flex', flexDirection:'column', gap: 3}}>
                    <div className="ec-skeleton-line" style={{width: 32, height: 14}} />
                    <div className="ec-skeleton-line" style={{width: 52, height: 8}} />
                  </div>
                </div>
              )) : kpiConfigs.map((k, i) => {
                const Icon = k.icon
                return (
                  <div key={i} className="ec-kpi" data-testid={`kpi-${i}`}>
                    <div className="ec-kpi-icon" style={{background: k.bg}}><Icon size={15} style={{color: k.color}} /></div>
                    <div className="ec-kpi-info">
                      <span className="ec-kpi-val">{k.val}</span>
                      <span className="ec-kpi-label">{k.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="ec-topbar-right">
            <span className="ec-refresh-time" data-testid="last-refresh"><Clock size={10} /> {lastRefresh ? lastRefresh.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) : '--:--:--'}</span>
            <button className={`ec-topbar-btn ${refreshing ? 'ec-refreshing' : ''}`} onClick={() => refreshData(true)} title="Rafraîchir" data-testid="manual-refresh">
              <RefreshCw size={15} />
            </button>
            {connected && <span className="ec-live-badge" data-testid="ws-live"><Wifi size={10} /> Live</span>}
            <button className="ec-topbar-btn ec-notif-btn" onClick={() => navigate('/alert/index')} data-testid="topbar-notif">
              <Bell size={17} />
              {notifCount > 0 && <span className="ec-notif-count">{notifCount > 9 ? '9+' : notifCount}</span>}
            </button>
            <button className="ec-topbar-btn" onClick={() => navigate('/menu/setup')} data-testid="topbar-settings"><Settings size={17} /></button>
          </div>
        </header>

        <div className="ec-body">
          {/* ═══ ASSETS SIDEBAR ═══ */}
          <aside className={`ec-assets ${sidebarOpen ? '' : 'ec-assets--closed'}`} data-testid="assets-sidebar">
            <div className="ec-assets-head">
              <h2 className="ec-assets-title">Assets <span className="ec-assets-count">{filtered.length}</span></h2>
            </div>
            <div className="ec-assets-search">
              <Search size={14} className="ec-search-ico" />
              <input className="ec-search-input" placeholder="Rechercher un asset..." value={search} onChange={e => { setSearch(e.target.value); setAssetPage(1); }} data-testid="assets-search" />
              {search && <button className="ec-search-clear" onClick={() => setSearch('')}><X size={12} /></button>}
            </div>
            <div className="ec-assets-filters" data-testid="assets-filters">
              {[{k:'all',l:'Tous'},{k:'active',l:'Actif'},{k:'exit',l:'Sorti'},{k:'nonactive',l:'Inactif'},{k:'lowbatt',l:'Batt.'}].map(f => (
                <button key={f.k} className={`ec-filter-chip ${statusFilter === f.k ? 'ec-filter-chip--active' : ''}`} onClick={() => { setStatusFilter(f.k); setAssetPage(1); }} data-testid={`filter-${f.k}`}>{f.l}</button>
              ))}
            </div>
            <div className="ec-assets-list" data-testid="assets-list">
              {loading ? (
                <div className="ec-skeleton-list">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="ec-skeleton-item" style={{animationDelay: `${i * 0.06}s`}}>
                      <div className="ec-skeleton-dot" />
                      <div className="ec-skeleton-text">
                        <div className="ec-skeleton-line ec-skeleton-line--name" />
                        <div className="ec-skeleton-line ec-skeleton-line--loc" />
                      </div>
                      <div className="ec-skeleton-meta">
                        <div className="ec-skeleton-line ec-skeleton-line--stat" />
                        <div className="ec-skeleton-line ec-skeleton-line--bat" />
                      </div>
                    </div>
                  ))}
                </div>
              ) :
                filtered.length === 0 ? <div className="ec-empty">{assetList.length === 0 ? <><Loader2 size={16} className="ec-spin" /> Chargement des assets...</> : 'Aucun asset trouvé'}</div> :
                paginatedAssets.map((asset, i) => {
                  const bat = getBattery(asset)
                  const status = asset.etatenginname || 'active'
                  const isSelected = selectedAsset?.id === asset.id
                  const isChanged = changedIds.has(asset.id)
                  return (
                    <div key={asset.id || i} className={`ec-asset-item ${isSelected ? 'ec-asset-item--selected' : ''} ${isChanged ? 'ec-asset-item--changed' : ''}`} onClick={() => selectAsset(asset)} style={{animationDelay: `${Math.min(i, 20) * 0.02}s`}} data-testid={`asset-item-${i}`}>
                      <div className="ec-asset-dot" style={{background: getStatusColor(status)}} />
                      <div className="ec-asset-info">
                        <span className="ec-asset-name">{asset.fname || asset.label || `Asset ${i + 1}`}</span>
                        <span className="ec-asset-location"><MapPin size={10} /> {asset.LocationObjectname || asset.locationLabel || '—'}</span>
                      </div>
                      <div className="ec-asset-meta">
                        <span className="ec-asset-status" style={{color: getStatusColor(status)}}>{getStatusLabel(status)}</span>
                        <span className="ec-asset-battery"><BatteryIcon level={bat} /> {bat}%</span>
                      </div>
                    </div>
                  )
                })
              }
            </div>
            {/* SIDEBAR PAGINATION */}
            {totalAssetPages > 1 && !loading && (
              <div className="ec-sidebar-pagination" data-testid="sidebar-pagination">
                <button className="ec-pg-btn" disabled={safeAssetPage <= 1} onClick={() => setAssetPage(safeAssetPage - 1)} data-testid="sidebar-pg-prev">
                  <ChevronLeft size={14} />
                </button>
                <span className="ec-pg-info" data-testid="sidebar-pg-info">
                  {((safeAssetPage - 1) * ASSETS_PER_PAGE) + 1}–{Math.min(safeAssetPage * ASSETS_PER_PAGE, filtered.length)} / {filtered.length}
                </span>
                <button className="ec-pg-btn" disabled={safeAssetPage >= totalAssetPages} onClick={() => setAssetPage(safeAssetPage + 1)} data-testid="sidebar-pg-next">
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </aside>

          {/* ═══ MAP ═══ */}
          <div className="ec-map-area" data-testid="enterprise-map">
            {/* Map controls */}
            <div className="ec-map-controls">
              <button className={`ec-map-ctrl ${showRouters ? 'ec-map-ctrl--on' : ''}`} onClick={() => setShowRouters(!showRouters)} data-testid="toggle-routers"><Radio size={13} /> Routers</button>
              <button className={`ec-map-ctrl ${showZones ? 'ec-map-ctrl--on' : ''}`} onClick={() => setShowZones(!showZones)} data-testid="toggle-zones"><Shield size={13} /> Zones</button>
              <button className="ec-map-ctrl" onClick={() => setTimelineOpen(!timelineOpen)} data-testid="toggle-timeline"><Activity size={13} /> Timeline</button>
            </div>

            <MapContainer center={[46.815, 7.14]} zoom={10} style={{width:'100%', height:'100%'}} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              {mapCenter && <Recenter center={mapCenter} />}

              {/* Asset markers with clustering */}
              <MarkerClusterGroup chunkedLoading maxClusterRadius={50}
                iconCreateFunction={(cluster) => L.divIcon({
                  className: '',
                  html: `<div style="width:36px;height:36px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 2px 10px rgba(37,99,235,.4);display:flex;align-items:center;justify-content:center;font-family:Manrope,sans-serif;font-size:.72rem;font-weight:800;color:white;">${cluster.getChildCount()}</div>`,
                  iconSize: [36, 36], iconAnchor: [18, 18],
                })}
              >
                {assetsWithCoords.map((asset, i) => (
                  <Marker key={asset.id || i} position={[asset.lat, asset.lng]} icon={getIcon(asset)}
                    eventHandlers={{click: () => selectAsset(asset)}}>
                    <Popup>
                      <div style={{fontFamily:'Inter', fontSize:'.78rem', minWidth: 160}}>
                        <strong style={{display:'block',marginBottom:3}}>{asset.fname || asset.label}</strong>
                        <span style={{color:'#64748B', fontSize:'.68rem'}}>{asset.LocationObjectname || '—'}</span><br/>
                        <span style={{color: getStatusColor(asset.etatenginname), fontWeight:600, fontSize:'.68rem'}}>{getStatusLabel(asset.etatenginname)}</span>
                        <span style={{marginLeft:8, fontSize:'.68rem', color:'#64748B'}}>Batt: {getBattery(asset)}%</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>

              {/* Routers */}
              {showRouters && routersWithCoords.map(gw => (
                <Marker key={gw.id} position={[gw.lat, gw.lng]} icon={routerIcon(gw.active === 1)}>
                  <Popup><div style={{fontFamily:'Inter', fontSize:'.78rem'}}><strong>{gw.fname || gw.label}</strong><br/><small style={{color:'#64748B'}}>{gw.locationLabel}</small></div></Popup>
                </Marker>
              ))}

              {/* Zones */}
              {showZones && zones.map(zone => {
                if (zone.shape === 'circle' && zone.center) return <Circle key={zone.id} center={zone.center} radius={zone.radius || 200} pathOptions={{color: zone.color, fillColor: zone.color, fillOpacity: .1, weight: 1.5}} />
                if (zone.shape === 'polygon' && zone.polygon) return <Polygon key={zone.id} positions={zone.polygon} pathOptions={{color: zone.color, fillColor: zone.color, fillOpacity: .1, weight: 1.5}} />
                return null
              })}
            </MapContainer>
          </div>

          {/* ═══ DETAIL PANEL ═══ */}
          {detailOpen && selectedAsset && (
            <div className="ec-detail" data-testid="asset-detail-panel">
              <div className="ec-detail-head">
                <h3 className="ec-detail-title">{selectedAsset.fname || selectedAsset.label}</h3>
                <button className="ec-detail-close" onClick={() => setDetailOpen(false)} data-testid="detail-close"><X size={16} /></button>
              </div>
              <div className="ec-detail-body">
                {/* Status */}
                <div className="ec-detail-status">
                  <div className="ec-detail-status-dot" style={{background: getStatusColor(selectedAsset.etatenginname)}} />
                  <span style={{color: getStatusColor(selectedAsset.etatenginname), fontWeight: 700}}>{getStatusLabel(selectedAsset.etatenginname)}</span>
                </div>

                {/* Battery gauge */}
                <div className="ec-detail-section">
                  <span className="ec-detail-label">BATTERIE</span>
                  <div className="ec-battery-gauge">
                    <svg viewBox="0 0 120 120" className="ec-battery-svg">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                      <circle cx="60" cy="60" r="52" fill="none"
                        stroke={getBattery(selectedAsset) < 20 ? '#EF4444' : getBattery(selectedAsset) < 50 ? '#F59E0B' : '#10B981'}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${getBattery(selectedAsset) * 3.27} 327`}
                        transform="rotate(-90 60 60)" />
                    </svg>
                    <span className="ec-battery-text">{getBattery(selectedAsset)}%</span>
                  </div>
                </div>

                {/* Location */}
                <div className="ec-detail-section">
                  <span className="ec-detail-label">LOCALISATION</span>
                  <div className="ec-detail-row"><MapPin size={13} /> {selectedAsset.LocationObjectname || selectedAsset.locationLabel || 'Inconnue'}</div>
                  {selectedAsset.lat && selectedAsset.lng && (
                    <div className="ec-detail-row ec-detail-row--sub"><Target size={11} /> {selectedAsset.lat.toFixed(5)}, {selectedAsset.lng.toFixed(5)}</div>
                  )}
                </div>

                {/* Info */}
                <div className="ec-detail-section">
                  <span className="ec-detail-label">INFORMATIONS</span>
                  {selectedAsset.serialNumber && <div className="ec-detail-row"><Signal size={12} /> SN: {selectedAsset.serialNumber}</div>}
                  {selectedAsset.lastConnectionDate && <div className="ec-detail-row"><Clock size={12} /> Dernière connexion: {new Date(selectedAsset.lastConnectionDate).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</div>}
                  {selectedAsset.type_name && <div className="ec-detail-row"><Box size={12} /> Type: {selectedAsset.type_name}</div>}
                </div>

                {/* Actions */}
                <div className="ec-detail-actions">
                  <button className="ec-action-btn" onClick={() => navigate('/view/engin/index')} data-testid="detail-view-all"><Eye size={13} /> Voir tous les assets</button>
                  <button className="ec-action-btn" onClick={() => navigate('/Geofence/index')} data-testid="detail-zones"><Shield size={13} /> Zones</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ TIMELINE ═══ */}
        {timelineOpen && (
          <div className="ec-timeline" data-testid="enterprise-timeline">
            <div className="ec-timeline-head">
              <h3 className="ec-timeline-title"><Activity size={15} /> Journal des événements</h3>
              <div className="ec-timeline-actions">
                <span className="ec-timeline-badge">{richTimeline.length}</span>
                <button className="ec-export-btn" onClick={exportTimelineCSV} title="Exporter CSV" data-testid="export-timeline-csv"><Download size={13} /> CSV</button>
                <button className="ec-export-btn" onClick={exportTimelinePDF} title="Exporter PDF" data-testid="export-timeline-pdf"><FileBarChart size={13} /> PDF</button>
                <button className="ec-timeline-close" onClick={() => setTimelineOpen(false)}><ChevronsDown size={16} /></button>
              </div>
            </div>
            <div className="ec-timeline-list">
              {richTimeline.length === 0 ? <span className="ec-timeline-empty">Aucun événement</span> :
                richTimeline.slice(0, 30).map((item, i) => {
                  const meta = EVENT_META[item.type] || {label: item.type, icon: Activity, color: '#64748B'}
                  const Icon = meta.icon
                  const isEntry = item.type === 'asset_enter_zone'
                  const isExit = item.type === 'asset_exit_zone'
                  const isActive = selectedEvent?.id === item.id
                  return (
                    <div key={item.id || i} className={`ec-tl-card ${isActive ? 'ec-tl-card--active' : ''}`} onClick={() => onEventClick(item)} data-testid={`timeline-event-${i}`}>
                      <div className="ec-tl-card-header">
                        <div className="ec-tl-card-type" style={{color: meta.color}}>
                          <Icon size={13} /> {meta.label}
                        </div>
                        <span className="ec-tl-card-asset">{item.asset}</span>
                      </div>
                      <div className="ec-tl-card-body">
                        {item.entryDate && (
                          <div className="ec-tl-row">
                            <LogIn size={11} style={{color: '#059669'}} />
                            <span className="ec-tl-lbl">Entrée:</span>
                            <span className="ec-tl-val">{fmtDate(item.entryDate)}</span>
                          </div>
                        )}
                        {item.exitDate && (
                          <div className="ec-tl-row">
                            <LogOut size={11} style={{color: '#D97706'}} />
                            <span className="ec-tl-lbl">Sortie:</span>
                            <span className="ec-tl-val">{fmtDate(item.exitDate)}</span>
                          </div>
                        )}
                        {item.duration && (
                          <div className="ec-tl-row">
                            <Clock size={11} style={{color: '#8B5CF6'}} />
                            <span className="ec-tl-lbl">Durée:</span>
                            <span className="ec-tl-val ec-tl-duration">{fmtDuration(item.duration)}</span>
                          </div>
                        )}
                        {item.zone && (
                          <div className="ec-tl-row">
                            <MapPin size={11} style={{color: '#2563EB'}} />
                            <span className="ec-tl-lbl">Site:</span>
                            <span className="ec-tl-val">{item.zone}</span>
                          </div>
                        )}
                      </div>
                      <div className="ec-tl-card-footer">
                        {(item.routerName || item.router) && (
                          <span className="ec-tl-router"><Radio size={10} /> {item.routerName || item.router}</span>
                        )}
                        {item.rssi != null && (
                          <span className="ec-tl-rssi" style={{background: getRssiColor(item.rssi) + '18', color: getRssiColor(item.rssi)}}>{item.rssi}</span>
                        )}
                        <div className="ec-tl-icons">
                          {isEntry && <span className="ec-tl-icon-circle ec-tl-icon--entry"><LogIn size={11} /></span>}
                          {isExit && <span className="ec-tl-icon-circle ec-tl-icon--exit"><LogOut size={11} /></span>}
                          {item.location && <span className="ec-tl-icon-circle ec-tl-icon--loc"><MapPin size={11} /></span>}
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const STYLES = `
/* ── ROOT ── */
.ec { display:flex; flex-direction:column; height:100vh; background:#F8FAFC; overflow:hidden; }

/* ── TOPBAR ── */
.ec-topbar { display:flex; align-items:center; justify-content:space-between; padding:0 20px 0 60px; height:54px; background:#FFF; border-bottom:1px solid #E2E8F0; flex-shrink:0; gap:12px; z-index:10; }
.ec-topbar-left { display:flex; align-items:center; gap:12px; flex:1; min-width:0; }
.ec-topbar-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.ec-sidebar-toggle { width:34px; height:34px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#475569; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .12s; flex-shrink:0; }
.ec-sidebar-toggle:hover { border-color:#2563EB; color:#2563EB; }

/* KPIs */
.ec-topbar-kpis { display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; }
.ec-topbar-kpis::-webkit-scrollbar { display:none; }
.ec-kpi { display:flex; align-items:center; gap:8px; padding:6px 12px; border-radius:10px; background:#FAFBFC; border:1px solid #F1F5F9; white-space:nowrap; flex-shrink:0; }
.ec-kpi-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ec-kpi-val { font-family:'Manrope',sans-serif; font-size:1.05rem; font-weight:800; color:#0F172A; display:block; line-height:1; }
.ec-kpi-label { font-family:'Inter',sans-serif; font-size:.58rem; color:#94A3B8; display:block; margin-top:1px; }

/* TopBar buttons */
.ec-topbar-btn { width:34px; height:34px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#475569; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .12s; position:relative; }
.ec-topbar-btn:hover { border-color:#2563EB; color:#2563EB; }
.ec-notif-btn { }
.ec-notif-count { position:absolute; top:-4px; right:-4px; min-width:16px; height:16px; border-radius:8px; background:#EF4444; color:#FFF; font-family:'Inter',sans-serif; font-size:.55rem; font-weight:700; display:flex; align-items:center; justify-content:center; padding:0 3px; }
.ec-live-badge { display:inline-flex; align-items:center; gap:3px; padding:3px 8px; border-radius:8px; background:#ECFDF5; color:#059669; font-family:'Inter',sans-serif; font-size:.6rem; font-weight:700; animation:ecPulse 2s ease infinite; }
@keyframes ecPulse { 0%,100%{opacity:1;} 50%{opacity:.5;} }
.ec-refresh-time { font-family:'Inter',sans-serif; font-size:.58rem; color:#94A3B8; display:inline-flex; align-items:center; gap:3px; white-space:nowrap; }
.ec-refreshing svg { animation:ecSpin 1s linear infinite; }
@keyframes ecSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

/* ── BODY ── */
.ec-body { display:flex; flex:1; overflow:hidden; position:relative; }

/* ── ASSETS SIDEBAR ── */
.ec-assets { width:320px; background:#FFF; border-right:1px solid #E2E8F0; display:flex; flex-direction:column; flex-shrink:0; transition:width .25s ease, margin .25s ease; overflow:hidden; z-index:5; }
.ec-assets--closed { width:0; border:none; }
.ec-assets-head { display:flex; align-items:center; justify-content:space-between; padding:14px 16px 8px; }
.ec-assets-title { font-family:'Manrope',sans-serif; font-size:.92rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:8px; }
.ec-assets-count { display:inline-flex; align-items:center; justify-content:center; min-width:24px; height:22px; border-radius:7px; background:#EFF6FF; color:#2563EB; font-size:.68rem; font-weight:800; padding:0 6px; }
.ec-assets-search { position:relative; padding:0 16px 8px; }
.ec-search-ico { position:absolute; left:28px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
.ec-search-input { width:100%; padding:8px 10px 8px 32px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; box-sizing:border-box; transition:border .15s; }
.ec-search-input:focus { border-color:#2563EB; }
.ec-search-clear { position:absolute; right:22px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94A3B8; cursor:pointer; padding:2px; }
.ec-assets-filters { display:flex; gap:4px; padding:0 16px 10px; overflow-x:auto; }
.ec-filter-chip { padding:5px 10px; border-radius:7px; border:1px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.65rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .12s; white-space:nowrap; }
.ec-filter-chip:hover { border-color:#CBD5E1; }
.ec-filter-chip--active { background:#2563EB; color:#FFF; border-color:#2563EB; }

/* Asset list */
.ec-assets-list { flex:1; overflow-y:auto; padding:0 8px 8px; }
.ec-loading { display:flex; align-items:center; justify-content:center; padding:40px; color:#94A3B8; }
.ec-spin { animation:ecSpin 1s linear infinite; }
.ec-empty { padding:40px 16px; text-align:center; font-family:'Inter',sans-serif; font-size:.78rem; color:#94A3B8; }
.ec-asset-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:all .12s; margin-bottom:1px; animation:ecFadeIn .25s ease both; }
@keyframes ecFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.ec-asset-item:hover { background:#F8FAFC; }
.ec-asset-item--selected { background:#EFF6FF; box-shadow:inset 0 0 0 1.5px #2563EB; }
.ec-asset-item--changed { animation:ecHighlight 2s ease; }
@keyframes ecHighlight { 0%{background:#FEF3C7;box-shadow:inset 0 0 0 1.5px #F59E0B} 100%{background:transparent;box-shadow:none} }
.ec-asset-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.ec-asset-info { flex:1; min-width:0; }
.ec-asset-name { display:block; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ec-asset-location { display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.62rem; color:#94A3B8; margin-top:1px; }
.ec-asset-meta { display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0; }
.ec-asset-status { font-family:'Inter',sans-serif; font-size:.6rem; font-weight:700; }
.ec-asset-battery { display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.58rem; color:#64748B; }

/* Sidebar Pagination */
.ec-sidebar-pagination {
  display:flex; align-items:center; justify-content:center; gap:8px;
  padding:10px 12px; border-top:1px solid #F1F5F9; flex-shrink:0;
}
.ec-pg-btn {
  display:flex; align-items:center; justify-content:center;
  width:28px; height:28px; border-radius:7px; border:1.5px solid #E2E8F0;
  background:#FFF; color:#475569; cursor:pointer; transition:all .15s;
}
.ec-pg-btn:hover:not(:disabled) { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.ec-pg-btn:disabled { opacity:.3; cursor:not-allowed; }
.ec-pg-info { font-family:'Inter',sans-serif; font-size:.7rem; font-weight:600; color:#64748B; white-space:nowrap; }

/* ── MAP AREA ── */
.ec-map-area { flex:1; position:relative; min-width:0; }
.ec-map-area .leaflet-container { width:100%; height:100%; }
.ec-map-controls { position:absolute; top:12px; right:12px; z-index:500; display:flex; gap:5px; }
.ec-map-ctrl { display:flex; align-items:center; gap:4px; padding:6px 10px; border-radius:8px; border:1.5px solid rgba(255,255,255,.9); background:rgba(255,255,255,.9); backdrop-filter:blur(8px); font-family:'Inter',sans-serif; font-size:.62rem; font-weight:600; color:#475569; cursor:pointer; transition:all .12s; box-shadow:0 1px 4px rgba(0,0,0,.08); }
.ec-map-ctrl:hover { background:#FFF; }
.ec-map-ctrl--on { background:rgba(37,99,235,.1); border-color:#2563EB; color:#2563EB; }

/* ── DETAIL PANEL ── */
.ec-detail { width:320px; background:#FFF; border-left:1px solid #E2E8F0; display:flex; flex-direction:column; overflow:hidden; flex-shrink:0; animation:ecSlideIn .2s ease; }
@keyframes ecSlideIn { from{width:0;opacity:0} to{width:320px;opacity:1} }
.ec-detail-head { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #F1F5F9; }
.ec-detail-title { font-family:'Manrope',sans-serif; font-size:.92rem; font-weight:800; color:#0F172A; margin:0; }
.ec-detail-close { width:28px; height:28px; border-radius:7px; border:1.5px solid #E2E8F0; background:#FFF; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.ec-detail-close:hover { border-color:#EF4444; color:#EF4444; }
.ec-detail-body { flex:1; padding:14px 16px; overflow-y:auto; }
.ec-detail-status { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:10px; background:#FAFBFC; margin-bottom:14px; font-family:'Inter',sans-serif; font-size:.82rem; }
.ec-detail-status-dot { width:10px; height:10px; border-radius:50%; }
.ec-detail-section { margin-bottom:16px; }
.ec-detail-label { display:block; font-family:'Manrope',sans-serif; font-size:.6rem; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.04em; margin-bottom:6px; }
.ec-detail-row { display:flex; align-items:center; gap:7px; font-family:'Inter',sans-serif; font-size:.78rem; color:#475569; padding:4px 0; }
.ec-detail-row--sub { font-size:.68rem; color:#94A3B8; padding-left:4px; }

/* Battery gauge */
.ec-battery-gauge { display:flex; align-items:center; justify-content:center; position:relative; width:90px; height:90px; margin:0 auto; }
.ec-battery-svg { width:90px; height:90px; }
.ec-battery-text { position:absolute; font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; }

/* Actions */
.ec-detail-actions { display:flex; flex-direction:column; gap:6px; margin-top:8px; }
.ec-action-btn { display:flex; align-items:center; gap:7px; padding:9px 12px; border-radius:9px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:600; color:#475569; cursor:pointer; transition:all .12s; }
.ec-action-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }

/* ── TIMELINE ── */
.ec-timeline { background:#FFF; border-top:1px solid #E2E8F0; flex-shrink:0; animation:ecSlideUp .2s ease; max-height:240px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 -4px 16px rgba(0,0,0,.05); }
@keyframes ecSlideUp { from{max-height:0;opacity:0} to{max-height:240px;opacity:1} }
.ec-timeline-head { display:flex; align-items:center; justify-content:space-between; padding:10px 20px; border-bottom:1px solid #F1F5F9; flex-shrink:0; }
.ec-timeline-title { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:7px; }
.ec-timeline-actions { display:flex; align-items:center; gap:6px; }
.ec-timeline-badge { display:inline-flex; align-items:center; justify-content:center; min-width:20px; height:20px; padding:0 6px; border-radius:10px; background:#2563EB; color:#FFF; font-family:'Inter',sans-serif; font-size:.58rem; font-weight:700; }
.ec-timeline-close { background:none; border:none; color:#94A3B8; cursor:pointer; }
.ec-export-btn { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:7px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.62rem; font-weight:600; color:#475569; cursor:pointer; transition:all .12s; }
.ec-export-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.ec-timeline-list { display:flex; gap:10px; overflow-x:auto; padding:12px 16px; flex:1; scrollbar-width:thin; }
.ec-timeline-empty { font-family:'Inter',sans-serif; font-size:.75rem; color:#94A3B8; padding:10px; }

/* Rich timeline cards */
.ec-tl-card { min-width:260px; max-width:310px; background:#FFF; border:1.5px solid #E2E8F0; border-radius:12px; padding:10px 12px; cursor:pointer; transition:all .15s; flex-shrink:0; display:flex; flex-direction:column; gap:5px; }
.ec-tl-card:hover { border-color:#CBD5E1; box-shadow:0 4px 12px rgba(0,0,0,.06); transform:translateY(-1px); }
.ec-tl-card--active { border-color:#2563EB; box-shadow:0 0 0 2px rgba(37,99,235,.12); }
.ec-tl-card-header { display:flex; align-items:center; justify-content:space-between; gap:6px; }
.ec-tl-card-type { display:flex; align-items:center; gap:4px; font-family:'Inter',sans-serif; font-size:.65rem; font-weight:700; }
.ec-tl-card-asset { font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; }
.ec-tl-card-body { display:flex; flex-direction:column; gap:3px; }
.ec-tl-row { display:flex; align-items:center; gap:5px; font-family:'Inter',sans-serif; font-size:.64rem; }
.ec-tl-lbl { color:#94A3B8; font-weight:500; min-width:38px; }
.ec-tl-val { color:#334155; font-weight:600; }
.ec-tl-duration { color:#8B5CF6; background:#F5F3FF; padding:1px 6px; border-radius:4px; }
.ec-tl-card-footer { display:flex; align-items:center; gap:6px; border-top:1px solid #F1F5F9; padding-top:5px; margin-top:2px; }
.ec-tl-router { display:inline-flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.58rem; color:#64748B; background:#F8FAFC; padding:2px 6px; border-radius:4px; }
.ec-tl-rssi { font-family:'Inter',sans-serif; font-size:.6rem; font-weight:800; padding:2px 7px; border-radius:6px; }
.ec-tl-icons { display:flex; align-items:center; gap:3px; margin-left:auto; }
.ec-tl-icon-circle { width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; }
.ec-tl-icon--entry { background:#ECFDF5; color:#059669; }
.ec-tl-icon--exit { background:#FEF3C7; color:#D97706; }
.ec-tl-icon--loc { background:#EFF6FF; color:#2563EB; }

/* ── RESPONSIVE ── */
@media(max-width:1024px) {
  .ec-assets { width:260px; }
  .ec-detail { width:280px; }
  .ec-topbar-kpis { gap:4px; }
  .ec-kpi { padding:4px 8px; }
}
@media(max-width:768px) {
  .ec-assets { position:absolute; left:0; top:0; bottom:0; z-index:20; width:280px; box-shadow:8px 0 20px rgba(0,0,0,.1); }
  .ec-assets--closed { width:0; }
  .ec-detail { position:absolute; right:0; top:0; bottom:0; z-index:20; box-shadow:-8px 0 20px rgba(0,0,0,.1); }
  .ec-topbar-kpis { display:none; }
  .ec-refresh-time { display:none; }
}

/* ── SKELETON LOADING ── */
.ec-skeleton-list { padding:0 8px; }
.ec-skeleton-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; margin-bottom:2px; animation:ecSkeletonFadeIn .4s ease both; }
@keyframes ecSkeletonFadeIn { from{opacity:0} to{opacity:1} }
.ec-skeleton-dot { width:8px; height:8px; border-radius:50%; background:#E2E8F0; animation:ecShimmer 1.5s ease-in-out infinite; }
.ec-skeleton-dot--kpi { width:30px; height:30px; border-radius:8px; background:#E2E8F0; animation:ecShimmer 1.5s ease-in-out infinite; }
.ec-skeleton-text { flex:1; display:flex; flex-direction:column; gap:4px; }
.ec-skeleton-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
.ec-skeleton-line { border-radius:4px; background:#E2E8F0; animation:ecShimmer 1.5s ease-in-out infinite; }
.ec-skeleton-line--name { width:65%; height:12px; }
.ec-skeleton-line--loc { width:45%; height:8px; }
.ec-skeleton-line--stat { width:36px; height:10px; }
.ec-skeleton-line--bat { width:28px; height:8px; }
.ec-kpi--skeleton { min-width:100px; }
@keyframes ecShimmer { 0%{opacity:.4} 50%{opacity:.8} 100%{opacity:.4} }
`

export default EnterpriseCommand
