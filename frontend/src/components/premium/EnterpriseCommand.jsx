import {useState, useEffect, useCallback, useRef} from 'react'
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
  BatteryMedium, BatteryFull, BatteryCharging, Bluetooth, Loader2
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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const assetList = Array.isArray(engines) ? engines : []
  const routerList = Array.isArray(gateways) ? gateways : []
  const routersWithCoords = routerList.filter(r => r.lat && r.lng && r.lat !== 0)

  // Fetch data
  useEffect(() => {
    const load = async () => {
      dispatch(fetchEngines({page: 1, PageSize: 500}))
      dispatch(fetchGateways())
      dispatch(fetchDashboard())
      try {
        const [zRes, eRes, nRes] = await Promise.all([
          fetch(`${API}/api/zones`), fetch(`${API}/api/zones/events?limit=30`), fetch(`${API}/api/notifications/count`)
        ])
        if (zRes.ok) setZones(await zRes.json())
        if (eRes.ok) setEvents(await eRes.json())
        if (nRes.ok) { const d = await nRes.json(); setNotifCount(d.count || 0) }
      } catch {}
      setLoading(false)
    }
    load()
  }, [dispatch])

  // WebSocket
  const {connected} = useWebSocket(useCallback((msg) => {
    if (msg.type === 'zone_event') {
      fetch(`${API}/api/zones/events?limit=30`).then(r => r.json()).then(d => { if (Array.isArray(d)) setEvents(d) }).catch(() => {})
    }
    if (msg.type === 'notification') {
      fetch(`${API}/api/notifications/count`).then(r => r.json()).then(d => setNotifCount(d.count || 0)).catch(() => {})
    }
  }, []))

  // KPIs from dashboard data
  const kpis = Array.isArray(dashData) ? dashData : []
  const kpiConfigs = [
    {label: 'Assets actifs', icon: Box, color: '#2563EB', bg: '#EFF6FF', val: kpis[0]?.counter ?? assetList.filter(a => a.etatenginname === 'active' || a.active === 1).length},
    {label: 'Hors zone', icon: AlertTriangle, color: '#D97706', bg: '#FFFBEB', val: kpis[2]?.counter ?? 0},
    {label: 'Alertes', icon: Bell, color: '#DC2626', bg: '#FEF2F2', val: notifCount},
    {label: 'Batterie faible', icon: BatteryLow, color: '#8B5CF6', bg: '#F5F3FF', val: kpis[3]?.counter ?? assetList.filter(a => getBattery(a) < 20).length},
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
              {kpiConfigs.map((k, i) => {
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
              <input className="ec-search-input" placeholder="Rechercher un asset..." value={search} onChange={e => setSearch(e.target.value)} data-testid="assets-search" />
              {search && <button className="ec-search-clear" onClick={() => setSearch('')}><X size={12} /></button>}
            </div>
            <div className="ec-assets-filters" data-testid="assets-filters">
              {[{k:'all',l:'Tous'},{k:'active',l:'Actif'},{k:'exit',l:'Sorti'},{k:'nonactive',l:'Inactif'},{k:'lowbatt',l:'Batt.'}].map(f => (
                <button key={f.k} className={`ec-filter-chip ${statusFilter === f.k ? 'ec-filter-chip--active' : ''}`} onClick={() => setStatusFilter(f.k)} data-testid={`filter-${f.k}`}>{f.l}</button>
              ))}
            </div>
            <div className="ec-assets-list" data-testid="assets-list">
              {loading ? <div className="ec-loading"><Loader2 size={20} className="ec-spin" /></div> :
                filtered.length === 0 ? <div className="ec-empty">Aucun asset trouvé</div> :
                filtered.map((asset, i) => {
                  const bat = getBattery(asset)
                  const status = asset.etatenginname || 'active'
                  const isSelected = selectedAsset?.id === asset.id
                  return (
                    <div key={asset.id || i} className={`ec-asset-item ${isSelected ? 'ec-asset-item--selected' : ''}`} onClick={() => selectAsset(asset)} data-testid={`asset-item-${i}`}>
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
              <h3 className="ec-timeline-title"><Activity size={15} /> Événements récents</h3>
              <button className="ec-timeline-close" onClick={() => setTimelineOpen(false)}><ChevronsDown size={16} /></button>
            </div>
            <div className="ec-timeline-list">
              {events.length === 0 ? <span className="ec-timeline-empty">Aucun événement</span> :
                events.slice(0, 20).map((ev, i) => {
                  const meta = EVENT_META[ev.event_type] || {label: ev.event_type, icon: Activity, color: '#64748B'}
                  const Icon = meta.icon
                  return (
                    <div key={ev.id || i} className="ec-timeline-item" data-testid={`timeline-event-${i}`}>
                      <Icon size={14} style={{color: meta.color, flexShrink: 0}} />
                      <span className="ec-timeline-type" style={{color: meta.color}}>{meta.label}</span>
                      <span className="ec-timeline-desc">{ev.asset_name || ev.asset_id} {ev.zone_name ? `→ ${ev.zone_name}` : ''}</span>
                      <span className="ec-timeline-time">{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) : ''}</span>
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
@keyframes ecSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
.ec-empty { padding:40px 16px; text-align:center; font-family:'Inter',sans-serif; font-size:.78rem; color:#94A3B8; }
.ec-asset-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:all .12s; margin-bottom:1px; }
.ec-asset-item:hover { background:#F8FAFC; }
.ec-asset-item--selected { background:#EFF6FF; box-shadow:inset 0 0 0 1.5px #2563EB; }
.ec-asset-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.ec-asset-info { flex:1; min-width:0; }
.ec-asset-name { display:block; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ec-asset-location { display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.62rem; color:#94A3B8; margin-top:1px; }
.ec-asset-meta { display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0; }
.ec-asset-status { font-family:'Inter',sans-serif; font-size:.6rem; font-weight:700; }
.ec-asset-battery { display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.58rem; color:#64748B; }

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
.ec-timeline { background:#FFF; border-top:1px solid #E2E8F0; flex-shrink:0; animation:ecSlideUp .2s ease; max-height:200px; overflow:hidden; }
@keyframes ecSlideUp { from{max-height:0;opacity:0} to{max-height:200px;opacity:1} }
.ec-timeline-head { display:flex; align-items:center; justify-content:space-between; padding:10px 20px; border-bottom:1px solid #F1F5F9; }
.ec-timeline-title { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:7px; }
.ec-timeline-close { background:none; border:none; color:#94A3B8; cursor:pointer; }
.ec-timeline-list { display:flex; gap:0; overflow-x:auto; padding:10px 20px; scrollbar-width:thin; }
.ec-timeline-item { display:flex; align-items:center; gap:8px; padding:8px 14px; border-radius:8px; background:#FAFBFC; margin-right:8px; flex-shrink:0; min-width:200px; border:1px solid #F1F5F9; transition:all .12s; }
.ec-timeline-item:hover { border-color:#CBD5E1; }
.ec-timeline-type { font-family:'Inter',sans-serif; font-size:.65rem; font-weight:700; white-space:nowrap; }
.ec-timeline-desc { font-family:'Inter',sans-serif; font-size:.65rem; color:#475569; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; }
.ec-timeline-time { font-family:'Inter',sans-serif; font-size:.58rem; color:#94A3B8; margin-left:auto; flex-shrink:0; }
.ec-timeline-empty { font-family:'Inter',sans-serif; font-size:.75rem; color:#94A3B8; padding:10px; }

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
}
`

export default EnterpriseCommand
