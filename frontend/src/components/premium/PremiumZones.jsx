import {useState, useCallback, useEffect} from 'react'
import {MapContainer, TileLayer, Polygon, Circle, Popup, Marker, useMapEvents, useMap} from 'react-leaflet'
import L from 'leaflet'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchGateways, getGateways} from '../Gateway/slice/gateway.slice'
import {fetchEngines, getEngines} from '../Engin/slice/engin.slice'
import {useWebSocket} from '../../hooks/useWebSocket'
import {
  MapPin, Plus, Edit3, Trash2, Search, Circle as CircleIcon,
  LogIn, LogOut, X, ChevronRight, Truck, Hexagon, Target, Ruler,
  Pencil, Check, Loader2, Wifi, Radio, Signal, Activity, Bell,
  ToggleLeft, ToggleRight, Clock, Filter, Eye, Zap, Timer, Settings,
  ChevronDown, ArrowRight, AlertTriangle, Power, Bluetooth
} from 'lucide-react'

const API = process.env.REACT_APP_BACKEND_URL

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const routerIcon = (online) => L.divIcon({
  className: '',
  html: `<div style="width:30px;height:30px;border-radius:50%;background:${online ? '#10B981' : '#94A3B8'};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M6.7 6.7a8 8 0 0 1 10.6 0M3.5 3.5a13 13 0 0 1 17 0"/></svg>
  </div>`,
  iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -18],
})

const assetIcon = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#3B82F6;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,.2);"></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -14],
})

const ZONE_TYPES = {
  chantier: {label: 'Chantier', color: '#2563EB', bg: '#EFF6FF'},
  depot: {label: 'Dépôt', color: '#059669', bg: '#ECFDF5'},
  restricted: {label: 'Restreinte', color: '#DC2626', bg: '#FEF2F2'},
  parking: {label: 'Parking', color: '#D97706', bg: '#FFFBEB'},
}

const MODES = {
  entry: {label: 'Entrée', icon: LogIn, color: '#2563EB'},
  exit: {label: 'Sortie', icon: LogOut, color: '#D97706'},
  both: {label: 'Entrée + Sortie', icon: Activity, color: '#059669'},
}

const SHAPES = {
  circle: {label: 'Cercle', icon: CircleIcon, desc: 'Centre + rayon'},
  polygon: {label: 'Polygone', icon: Hexagon, desc: 'Points GPS'},
  ble: {label: 'Router BLE', icon: Bluetooth, desc: 'Signal RSSI'},
}

/* ── Draw Controller ── */
const DrawController = ({drawMode, drawShape, onCircleDrawn, onPolygonDrawn, onDrawProgress, previewColor}) => {
  const [circleCenter, setCircleCenter] = useState(null)
  const [polygonPoints, setPolygonPoints] = useState([])
  const map = useMap()

  useEffect(() => { if (!drawMode) { setCircleCenter(null); setPolygonPoints([]) } }, [drawMode])
  useEffect(() => {
    const c = map.getContainer()
    c.style.cursor = drawMode ? 'crosshair' : ''
    return () => { c.style.cursor = '' }
  }, [drawMode, map])

  useMapEvents({
    click(e) {
      if (!drawMode) return
      const {lat, lng} = e.latlng
      if (drawShape === 'circle') {
        if (!circleCenter) { setCircleCenter([lat, lng]); onDrawProgress?.({type: 'circle_center', center: [lat, lng]}) }
        else { onCircleDrawn({center: circleCenter, radius: Math.round(map.distance(L.latLng(circleCenter[0], circleCenter[1]), e.latlng))}); setCircleCenter(null) }
      } else if (drawShape === 'polygon') {
        const p = [...polygonPoints, [lat, lng]]
        setPolygonPoints(p); onDrawProgress?.({type: 'polygon_points', points: p})
      }
    },
    dblclick(e) {
      if (!drawMode || drawShape !== 'polygon') return
      if (polygonPoints.length >= 3) { onPolygonDrawn({points: [...polygonPoints]}); setPolygonPoints([]) }
    },
    mousemove(e) {
      if (!drawMode || drawShape !== 'circle' || !circleCenter) return
      onDrawProgress?.({type: 'circle_preview', center: circleCenter, radius: Math.round(map.distance(L.latLng(circleCenter[0], circleCenter[1]), e.latlng))})
    }
  })

  return <>
    {circleCenter && <Circle center={circleCenter} radius={10} pathOptions={{color: previewColor, fillColor: previewColor, fillOpacity: .3, weight: 2, dashArray: '6 3'}} />}
    {polygonPoints.length >= 2 && <Polygon positions={polygonPoints} pathOptions={{color: previewColor, fillColor: previewColor, fillOpacity: .15, weight: 2, dashArray: '6 3'}} />}
  </>
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const PremiumZones = () => {
  const dispatch = useAppDispatch()
  const gateways = useAppSelector(getGateways)
  const engines = useAppSelector(getEngines)

  const [zones, setZones] = useState([])
  const [events, setEvents] = useState([])
  const [alerts, setAlerts] = useState([])
  const [eventsStats, setEventsStats] = useState(null)
  const [selectedZone, setSelectedZone] = useState(null)
  const [search, setSearch] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [editZone, setEditZone] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('zones') // zones, events, alerts
  const [showRouters, setShowRouters] = useState(true)
  const [showAssets, setShowAssets] = useState(false)
  const [filterShape, setFilterShape] = useState('all')

  const [drawMode, setDrawMode] = useState(false)
  const [drawShape, setDrawShape] = useState('circle')
  const [drawPreview, setDrawPreview] = useState(null)

  // Alert modal
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertForm, setAlertForm] = useState({zone_id: '', alert_type: 'asset_enter', message_template: '', channels: ['in_app'], cooldown_minutes: 5, enabled: true})

  const routerList = Array.isArray(gateways) ? gateways : []
  const assetList = Array.isArray(engines) ? engines : []
  const routersWithCoords = routerList.filter(g => g.lat && g.lng && g.lat !== 0)
  const assetsWithCoords = assetList.filter(a => a.lat && a.lng && a.lat !== 0)

  const fetchZones = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/zones`)
      const data = await res.json()
      setZones(Array.isArray(data) ? data : [])
    } catch { setZones([]) }
    setLoading(false)
  }, [])

  const fetchEvents = useCallback(async () => {
    try {
      const [evRes, stRes] = await Promise.all([
        fetch(`${API}/api/zones/events?limit=50`),
        fetch(`${API}/api/zones/events/stats`)
      ])
      setEvents(await evRes.json())
      setEventsStats(await stRes.json())
    } catch {}
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/zones/alerts`)
      setAlerts(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    fetchZones()
    fetchEvents()
    fetchAlerts()
    dispatch(fetchGateways())
    dispatch(fetchEngines({page: 1, PageSize: 200}))
  }, [])

  const {connected} = useWebSocket(useCallback((msg) => {
    if (['zone_created', 'zone_updated', 'zone_deleted'].includes(msg.type)) fetchZones()
    if (msg.type === 'zone_event') { fetchEvents() }
  }, [fetchZones, fetchEvents]))

  const filtered = zones.filter(z => {
    if (filterShape !== 'all' && z.shape !== filterShape) return false
    if (search && !z.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const mapCenter = routersWithCoords.length > 0 ? [routersWithCoords[0].lat, routersWithCoords[0].lng] : [46.815, 7.14]

  const openEdit = (zone) => {
    setEditForm({
      name: zone?.name || '', type: zone?.type || 'chantier', shape: zone?.shape || 'circle',
      mode: zone?.mode || 'both', color: zone?.color || '#2563EB',
      alertEntry: zone?.alertEntry ?? false, alertExit: zone?.alertExit ?? false,
      active: zone?.active ?? true,
      center: zone?.center || null, radius: zone?.radius || 200, polygon: zone?.polygon || null,
      site_id: zone?.site_id || '', site_name: zone?.site_name || '',
      router_id: zone?.router_id || '', router_name: zone?.router_name || '',
      rssi_threshold: zone?.rssi_threshold ?? -70,
      debounce_seconds: zone?.debounce_seconds ?? 15,
      rssi_smoothing: zone?.rssi_smoothing ?? 3,
    })
    setEditZone(zone || {id: null})
    setDrawMode(false); setDrawPreview(null)
  }

  const startDrawOnMap = () => { setDrawMode(true); setDrawPreview(null); setEditZone(null) }
  const cancelDraw = () => { setDrawMode(false); setDrawPreview(null) }

  const handleCircleDrawn = ({center, radius}) => {
    setDrawMode(false); setDrawPreview(null)
    setEditForm(prev => ({...prev, center, radius, shape: 'circle'}))
    setEditZone({id: null})
  }
  const handlePolygonDrawn = ({points}) => {
    setDrawMode(false); setDrawPreview(null)
    setEditForm(prev => ({...prev, polygon: points, shape: 'polygon'}))
    setEditZone({id: null})
  }

  const saveZone = async () => {
    setSaving(true)
    const d = {...editForm}
    if (d.shape === 'circle') { d.center = d.center || [46.815, 7.14]; d.polygon = null }
    if (d.shape === 'polygon') { d.polygon = d.polygon || [[46.81, 7.13], [46.82, 7.13], [46.82, 7.15], [46.81, 7.15]]; d.center = null; d.radius = null }
    if (d.shape === 'ble') { d.center = null; d.radius = null; d.polygon = null }

    try {
      if (editZone.id) {
        await fetch(`${API}/api/zones/${editZone.id}`, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(d)})
      } else {
        await fetch(`${API}/api/zones`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(d)})
      }
      await fetchZones()
    } catch {}
    setSaving(false); setEditZone(null); setShowDetail(false)
  }

  const deleteZone = async (zoneId) => {
    try { await fetch(`${API}/api/zones/${zoneId}`, {method: 'DELETE'}); await fetchZones() } catch {}
    setShowDetail(false); setSelectedZone(null)
  }

  const saveAlert = async () => {
    try {
      await fetch(`${API}/api/zones/alerts`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(alertForm)})
      await fetchAlerts()
    } catch {}
    setShowAlertModal(false)
  }

  const deleteAlert = async (id) => {
    try { await fetch(`${API}/api/zones/alerts/${id}`, {method: 'DELETE'}); await fetchAlerts() } catch {}
  }

  const EVENT_LABELS = {
    asset_enter_zone: {label: 'Entrée zone', color: '#059669', bg: '#ECFDF5', icon: LogIn},
    asset_exit_zone: {label: 'Sortie zone', color: '#D97706', bg: '#FFFBEB', icon: LogOut},
    asset_stay_in_zone: {label: 'Séjour zone', color: '#2563EB', bg: '#EFF6FF', icon: Clock},
    asset_not_detected: {label: 'Non détecté', color: '#DC2626', bg: '#FEF2F2', icon: AlertTriangle},
    asset_detected_by_router: {label: 'Détecté BLE', color: '#8B5CF6', bg: '#F5F3FF', icon: Bluetooth},
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="gz" data-testid="premium-zones">
        {/* Header */}
        <div className="gz-header">
          <div>
            <h1 className="gz-title" data-testid="zones-title">Geofencing Avancé</h1>
            <p className="gz-sub">{zones.length} zone{zones.length !== 1 ? 's' : ''} - {routerList.length} router{routerList.length !== 1 ? 's' : ''} {connected && <span className="gz-live" data-testid="ws-indicator"><Wifi size={10} /> Live</span>}</p>
          </div>
          <div className="gz-header-actions">
            {!drawMode ? (
              <button className="gz-btn gz-btn--primary" onClick={() => openEdit(null)} data-testid="zones-add-btn"><Plus size={15} /> Nouvelle zone</button>
            ) : (
              <button className="gz-btn gz-btn--danger" onClick={cancelDraw} data-testid="cancel-draw-btn"><X size={15} /> Annuler dessin</button>
            )}
          </div>
        </div>

        {/* Draw Banner */}
        {drawMode && (
          <div className="gz-draw-banner" data-testid="draw-banner">
            <Target size={18} className="gz-draw-ico" />
            <div>
              <strong>Mode dessin actif</strong>
              <span>{drawShape === 'circle' ? 'Cliquez pour le centre, puis 2ème clic pour le rayon' : 'Cliquez pour ajouter des points. Double-clic pour terminer'}</span>
            </div>
            {drawPreview?.type === 'circle_preview' && <span className="gz-draw-badge"><Ruler size={12} /> {drawPreview.radius} m</span>}
          </div>
        )}

        {/* Tabs */}
        <div className="gz-tabs" data-testid="zones-tabs">
          <button className={`gz-tab ${tab === 'zones' ? 'gz-tab--active' : ''}`} onClick={() => setTab('zones')} data-testid="tab-zones">
            <MapPin size={14} /> Zones <span className="gz-tab-count">{zones.length}</span>
          </button>
          <button className={`gz-tab ${tab === 'events' ? 'gz-tab--active' : ''}`} onClick={() => setTab('events')} data-testid="tab-events">
            <Zap size={14} /> Événements <span className="gz-tab-count">{eventsStats?.recent_24h || 0}</span>
          </button>
          <button className={`gz-tab ${tab === 'alerts' ? 'gz-tab--active' : ''}`} onClick={() => setTab('alerts')} data-testid="tab-alerts">
            <Bell size={14} /> Alertes <span className="gz-tab-count">{alerts.length}</span>
          </button>
        </div>

        {/* ── ZONES TAB ── */}
        {tab === 'zones' && (
          <>
            {/* Stats */}
            <div className="gz-stats" data-testid="zones-stats">
              {Object.entries(SHAPES).map(([k, s]) => {
                const Icon = s.icon; const cnt = zones.filter(z => z.shape === k).length
                return <div key={k} className="gz-stat" onClick={() => setFilterShape(filterShape === k ? 'all' : k)} style={{cursor:'pointer', opacity: filterShape !== 'all' && filterShape !== k ? .4 : 1}}>
                  <Icon size={14} style={{color: k === 'circle' ? '#8B5CF6' : k === 'polygon' ? '#0EA5E9' : '#EC4899'}} /><span className="gz-stat-val">{cnt}</span><span className="gz-stat-label">{s.label}</span>
                </div>
              })}
              <div className="gz-stat-sep" />
              <div className="gz-stat"><Radio size={14} style={{color: '#10B981'}} /><span className="gz-stat-val">{routerList.filter(r => r.active === 1).length}</span><span className="gz-stat-label">Online</span></div>
              {eventsStats && <div className="gz-stat"><Zap size={14} style={{color: '#F59E0B'}} /><span className="gz-stat-val">{eventsStats.recent_24h}</span><span className="gz-stat-label">24h</span></div>}
            </div>

            {/* Map + Panel */}
            <div className="gz-content">
              <div className="gz-map-wrap" data-testid="zones-map">
                {/* Map layer toggles */}
                <div className="gz-map-controls">
                  <button className={`gz-map-toggle ${showRouters ? 'gz-map-toggle--on' : ''}`} onClick={() => setShowRouters(!showRouters)} data-testid="toggle-routers">
                    <Radio size={12} /> Routers
                  </button>
                  <button className={`gz-map-toggle ${showAssets ? 'gz-map-toggle--on' : ''}`} onClick={() => setShowAssets(!showAssets)} data-testid="toggle-assets">
                    <Truck size={12} /> Assets
                  </button>
                </div>
                <MapContainer center={mapCenter} zoom={12} style={{width: '100%', height: '100%'}} zoomControl={false} doubleClickZoom={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                  <DrawController drawMode={drawMode} drawShape={drawShape} onCircleDrawn={handleCircleDrawn} onPolygonDrawn={handlePolygonDrawn} onDrawProgress={setDrawPreview} previewColor={editForm.color || '#2563EB'} />

                  {/* Render zones */}
                  {zones.map(zone => {
                    if (zone.shape === 'circle' && zone.center) return (
                      <Circle key={zone.id} center={zone.center} radius={zone.radius || 200}
                        pathOptions={{color: zone.color, fillColor: zone.color, fillOpacity: zone.active === false ? .05 : .15, weight: 2, dashArray: zone.active === false ? '8 4' : undefined}}
                        eventHandlers={{click: () => {setSelectedZone(zone); setShowDetail(true)}}} >
                        <Popup><div style={{fontFamily:'Inter', fontSize:'.8rem'}}><strong>{zone.name}</strong><br/><small>{MODES[zone.mode]?.label || 'Entrée + Sortie'}</small></div></Popup>
                      </Circle>
                    )
                    if (zone.shape === 'polygon' && zone.polygon) return (
                      <Polygon key={zone.id} positions={zone.polygon}
                        pathOptions={{color: zone.color, fillColor: zone.color, fillOpacity: zone.active === false ? .05 : .15, weight: 2, dashArray: zone.active === false ? '8 4' : undefined}}
                        eventHandlers={{click: () => {setSelectedZone(zone); setShowDetail(true)}}} >
                        <Popup><div style={{fontFamily:'Inter', fontSize:'.8rem'}}><strong>{zone.name}</strong><br/><small>{MODES[zone.mode]?.label}</small></div></Popup>
                      </Polygon>
                    )
                    // BLE zones: render as a pulsing circle around router position
                    if (zone.shape === 'ble' && zone.router_id) {
                      const router = routerList.find(r => String(r.id) === zone.router_id || r.serialNumber === zone.router_id)
                      if (router?.lat && router?.lng) return (
                        <Circle key={zone.id} center={[router.lat, router.lng]} radius={50}
                          pathOptions={{color: zone.color || '#EC4899', fillColor: zone.color || '#EC4899', fillOpacity: .2, weight: 2, dashArray: '4 4'}}
                          eventHandlers={{click: () => {setSelectedZone(zone); setShowDetail(true)}}} >
                          <Popup><div style={{fontFamily:'Inter', fontSize:'.8rem'}}><strong>{zone.name}</strong><br/><small>BLE - RSSI: {zone.rssi_threshold}dBm</small></div></Popup>
                        </Circle>
                      )
                    }
                    return null
                  })}

                  {/* Routers overlay */}
                  {showRouters && routersWithCoords.map(gw => (
                    <Marker key={gw.id} position={[gw.lat, gw.lng]} icon={routerIcon(gw.active === 1)}>
                      <Popup><div style={{fontFamily:'Inter', fontSize:'.8rem'}}><strong>{gw.fname || gw.label}</strong><br/><small>{gw.locationLabel} - {gw.active === 1 ? 'En ligne' : 'Hors ligne'}</small></div></Popup>
                    </Marker>
                  ))}

                  {/* Assets overlay */}
                  {showAssets && assetsWithCoords.map(a => (
                    <Marker key={a.id || a.engin_id} position={[a.lat, a.lng]} icon={assetIcon}>
                      <Popup><div style={{fontFamily:'Inter', fontSize:'.8rem'}}><strong>{a.fname || a.label}</strong></div></Popup>
                    </Marker>
                  ))}

                  {drawPreview?.type === 'circle_preview' && <Circle center={drawPreview.center} radius={drawPreview.radius} pathOptions={{color: editForm.color || '#2563EB', fillOpacity: .2, weight: 2, dashArray: '8 4'}} />}
                </MapContainer>
              </div>

              {/* Side panel */}
              <div className="gz-panel" data-testid="zones-panel">
                <div className="gz-panel-search">
                  <Search size={14} className="gz-panel-search-ico" />
                  <input className="gz-panel-input" placeholder="Filtrer zones..." value={search} onChange={e => setSearch(e.target.value)} data-testid="zones-search" />
                </div>
                <div className="gz-zone-list" data-testid="zones-list">
                  {loading ? <div className="gz-loading"><Loader2 size={20} className="gz-spin" /></div> :
                    filtered.length === 0 ? <div className="gz-empty">Aucune zone</div> :
                    filtered.map((zone, i) => {
                      const ShapeIco = SHAPES[zone.shape]?.icon || CircleIcon
                      const modeM = MODES[zone.mode] || MODES.both
                      const typeCfg = ZONE_TYPES[zone.type] || ZONE_TYPES.chantier
                      return (
                        <div key={zone.id} className={`gz-zone-item ${selectedZone?.id === zone.id ? 'gz-zone-item--active' : ''} ${zone.active === false ? 'gz-zone-item--off' : ''}`}
                          onClick={() => {setSelectedZone(zone); setShowDetail(true)}} data-testid={`zone-item-${i}`}>
                          <div className="gz-zone-color" style={{background: zone.color}} />
                          <div className="gz-zone-info">
                            <div className="gz-zone-name-row">
                              <span className="gz-zone-name">{zone.name}</span>
                              <ShapeIco size={11} style={{color: zone.shape === 'ble' ? '#EC4899' : zone.shape === 'circle' ? '#8B5CF6' : '#0EA5E9', flexShrink: 0}} />
                              {zone.active === false && <Power size={10} style={{color: '#DC2626'}} />}
                            </div>
                            <div className="gz-zone-tags">
                              <span className="gz-zone-type" style={{color: typeCfg.color, background: typeCfg.bg}}>{typeCfg.label}</span>
                              <span className="gz-zone-mode" style={{color: modeM.color}}>{modeM.label}</span>
                            </div>
                          </div>
                          <ChevronRight size={13} className="gz-chevron" />
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── EVENTS TAB ── */}
        {tab === 'events' && (
          <div className="gz-events-wrap" data-testid="events-tab">
            {/* Event Stats */}
            {eventsStats && (
              <div className="gz-ev-stats">
                <div className="gz-ev-stat-card"><LogIn size={18} style={{color:'#059669'}} /><span className="gz-ev-stat-num">{eventsStats.entries}</span><span className="gz-ev-stat-lbl">Entrées</span></div>
                <div className="gz-ev-stat-card"><LogOut size={18} style={{color:'#D97706'}} /><span className="gz-ev-stat-num">{eventsStats.exits}</span><span className="gz-ev-stat-lbl">Sorties</span></div>
                <div className="gz-ev-stat-card"><AlertTriangle size={18} style={{color:'#DC2626'}} /><span className="gz-ev-stat-num">{eventsStats.not_detected}</span><span className="gz-ev-stat-lbl">Non détectés</span></div>
                <div className="gz-ev-stat-card"><Bluetooth size={18} style={{color:'#8B5CF6'}} /><span className="gz-ev-stat-num">{eventsStats.ble_detected}</span><span className="gz-ev-stat-lbl">Détections BLE</span></div>
                <div className="gz-ev-stat-card"><Zap size={18} style={{color:'#F59E0B'}} /><span className="gz-ev-stat-num">{eventsStats.recent_24h}</span><span className="gz-ev-stat-lbl">Dernières 24h</span></div>
              </div>
            )}
            {/* Most active zones */}
            {eventsStats?.most_active_zones?.length > 0 && (
              <div className="gz-active-zones">
                <h3 className="gz-section-title">Zones les plus actives</h3>
                <div className="gz-active-list">
                  {eventsStats.most_active_zones.map((z, i) => (
                    <div key={i} className="gz-active-item">
                      <span className="gz-active-rank">#{i + 1}</span>
                      <span className="gz-active-name">{z.zone}</span>
                      <span className="gz-active-count">{z.count} evt{z.count > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Event Timeline */}
            <div className="gz-ev-timeline">
              <h3 className="gz-section-title">Historique des événements</h3>
              {events.length === 0 ? <div className="gz-empty">Aucun événement enregistré</div> :
                events.map((ev, i) => {
                  const meta = EVENT_LABELS[ev.event_type] || {label: ev.event_type, color: '#64748B', bg: '#F8FAFC', icon: Activity}
                  const Icon = meta.icon
                  return (
                    <div key={ev.id || i} className="gz-ev-item" data-testid={`event-item-${i}`}>
                      <div className="gz-ev-icon" style={{background: meta.bg}}><Icon size={14} style={{color: meta.color}} /></div>
                      <div className="gz-ev-content">
                        <span className="gz-ev-type" style={{color: meta.color}}>{meta.label}</span>
                        <span className="gz-ev-desc">{ev.asset_name || ev.asset_id} {ev.zone_name ? `- ${ev.zone_name}` : ''}</span>
                        {ev.signal_strength && <span className="gz-ev-rssi"><Signal size={10} /> {ev.signal_strength} dBm</span>}
                      </div>
                      <span className="gz-ev-time">{ev.timestamp ? new Date(ev.timestamp).toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : ''}</span>
                    </div>
                  )
                })
              }
            </div>
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        {tab === 'alerts' && (
          <div className="gz-alerts-wrap" data-testid="alerts-tab">
            <div className="gz-alerts-header">
              <h3 className="gz-section-title">Règles d'alertes configurées</h3>
              <button className="gz-btn gz-btn--primary gz-btn--sm" onClick={() => { setAlertForm({zone_id: zones[0]?.id || '', zone_name: zones[0]?.name || '', alert_type: 'asset_enter', message_template: '', channels: ['in_app'], cooldown_minutes: 5, enabled: true}); setShowAlertModal(true) }} data-testid="add-alert-btn">
                <Plus size={14} /> Nouvelle alerte
              </button>
            </div>
            {alerts.length === 0 ? <div className="gz-empty">Aucune alerte configurée</div> :
              alerts.map((a, i) => {
                const meta = EVENT_LABELS[`${a.alert_type === 'asset_enter' ? 'asset_enter_zone' : a.alert_type === 'asset_exit' ? 'asset_exit_zone' : 'asset_not_detected'}`] || {}
                return (
                  <div key={a.id || i} className="gz-alert-card" data-testid={`alert-card-${i}`}>
                    <div className="gz-alert-status" style={{background: a.enabled ? '#059669' : '#94A3B8'}} />
                    <div className="gz-alert-info">
                      <span className="gz-alert-type" style={{color: meta.color}}>{meta.label || a.alert_type}</span>
                      <span className="gz-alert-zone">{a.zone_name || a.zone_id}</span>
                      {a.message_template && <span className="gz-alert-msg">{a.message_template}</span>}
                      <div className="gz-alert-meta">
                        <span><Timer size={10} /> Cooldown: {a.cooldown_minutes}min</span>
                        <span>{a.channels?.join(', ')}</span>
                      </div>
                    </div>
                    <button className="gz-alert-del" onClick={() => deleteAlert(a.id)} data-testid={`delete-alert-${i}`}><Trash2 size={13} /></button>
                  </div>
                )
              })
            }
          </div>
        )}

        {/* ── Zone Detail Drawer ── */}
        {showDetail && selectedZone && (
          <div className="gz-drawer" data-testid="zone-detail-drawer">
            <div className="gz-drawer-head">
              <h3 className="gz-drawer-title">{selectedZone.name}</h3>
              <button className="gz-drawer-close" onClick={() => setShowDetail(false)} data-testid="zone-detail-close"><X size={16} /></button>
            </div>
            <div className="gz-drawer-body">
              <div className="gz-drawer-section">
                <span className="gz-drawer-label">FORME & MODE</span>
                <div className="gz-drawer-badges">
                  <span className="gz-shape-badge">
                    {selectedZone.shape === 'circle' ? <><CircleIcon size={13} /> Cercle</> : selectedZone.shape === 'polygon' ? <><Hexagon size={13} /> Polygone</> : <><Bluetooth size={13} /> Router BLE</>}
                  </span>
                  <span className="gz-mode-badge" style={{color: MODES[selectedZone.mode]?.color}}>
                    {(() => { const M = MODES[selectedZone.mode]?.icon || Activity; return <M size={12} /> })()} {MODES[selectedZone.mode]?.label}
                  </span>
                  <span className={`gz-active-badge ${selectedZone.active !== false ? 'gz-active-badge--on' : ''}`}>
                    {selectedZone.active !== false ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              {selectedZone.shape === 'circle' && selectedZone.center && (
                <div className="gz-drawer-section">
                  <span className="gz-drawer-label">DIMENSIONS</span>
                  <div className="gz-dim-list"><div className="gz-dim"><Target size={12} /> Centre: {selectedZone.center[0].toFixed(4)}, {selectedZone.center[1].toFixed(4)}</div><div className="gz-dim"><Ruler size={12} /> Rayon: {selectedZone.radius} m</div></div>
                </div>
              )}
              {selectedZone.shape === 'ble' && (
                <div className="gz-drawer-section">
                  <span className="gz-drawer-label">PARAMÈTRES BLE</span>
                  <div className="gz-dim-list">
                    <div className="gz-dim"><Radio size={12} /> Router: {selectedZone.router_name || selectedZone.router_id || '—'}</div>
                    <div className="gz-dim"><Signal size={12} /> Seuil RSSI: {selectedZone.rssi_threshold} dBm</div>
                    <div className="gz-dim"><Timer size={12} /> Anti-bruit: {selectedZone.debounce_seconds}s</div>
                    <div className="gz-dim"><Activity size={12} /> Lissage: {selectedZone.rssi_smoothing} lectures</div>
                  </div>
                </div>
              )}
              <div className="gz-drawer-section">
                <span className="gz-drawer-label">TYPE</span>
                <span className="gz-type-badge" style={{color: ZONE_TYPES[selectedZone.type]?.color, background: ZONE_TYPES[selectedZone.type]?.bg}}>
                  {ZONE_TYPES[selectedZone.type]?.label}
                </span>
              </div>
              <div className="gz-drawer-section">
                <span className="gz-drawer-label">RÈGLES</span>
                <div className="gz-rules-list">
                  <div className={`gz-rule ${selectedZone.alertEntry ? 'gz-rule--on' : ''}`}><LogIn size={13} /> Entrée <span>{selectedZone.alertEntry ? 'ON' : 'OFF'}</span></div>
                  <div className={`gz-rule ${selectedZone.alertExit ? 'gz-rule--on' : ''}`}><LogOut size={13} /> Sortie <span>{selectedZone.alertExit ? 'ON' : 'OFF'}</span></div>
                </div>
              </div>
            </div>
            <div className="gz-drawer-footer">
              <button className="gz-btn gz-btn--outline" onClick={() => openEdit(selectedZone)} data-testid="zone-edit-btn"><Edit3 size={13} /> Modifier</button>
              <button className="gz-btn gz-btn--danger-outline" onClick={() => deleteZone(selectedZone.id)} data-testid="zone-delete-btn"><Trash2 size={13} /> Supprimer</button>
            </div>
          </div>
        )}

        {/* ── Zone Edit Modal ── */}
        {editZone && (
          <div className="gz-modal-bg" onClick={() => setEditZone(null)} data-testid="zone-edit-overlay">
            <div className="gz-modal" onClick={e => e.stopPropagation()} data-testid="zone-edit-modal">
              <div className="gz-modal-head"><h2>{editZone.id ? 'Modifier la zone' : 'Nouvelle zone'}</h2><button onClick={() => setEditZone(null)}><X size={18} /></button></div>
              <div className="gz-modal-body">
                <div className="gz-field"><label>Nom</label><input type="text" value={editForm.name} onChange={e => setEditForm(p => ({...p, name: e.target.value}))} placeholder="Ex: Dépôt Nord" data-testid="zone-edit-name" /></div>

                {/* Shape selector */}
                <div className="gz-field"><label>Forme</label>
                  <div className="gz-shape-sel" data-testid="zone-shape-selector">
                    {Object.entries(SHAPES).map(([k, s]) => { const I = s.icon; return (
                      <button key={k} className={`gz-shape-opt ${editForm.shape === k ? 'gz-shape-opt--active' : ''}`} onClick={() => setEditForm(p => ({...p, shape: k}))} data-testid={`shape-${k}-btn`}>
                        <I size={18} /><span>{s.label}</span><small>{s.desc}</small>
                      </button>
                    )})}
                  </div>
                </div>

                {/* Mode selector */}
                <div className="gz-field"><label>Mode de détection</label>
                  <div className="gz-mode-sel" data-testid="zone-mode-selector">
                    {Object.entries(MODES).map(([k, m]) => { const I = m.icon; return (
                      <button key={k} className={`gz-mode-opt ${editForm.mode === k ? 'gz-mode-opt--active' : ''}`} style={editForm.mode === k ? {borderColor: m.color, color: m.color} : {}} onClick={() => setEditForm(p => ({...p, mode: k}))} data-testid={`mode-${k}-btn`}>
                        <I size={14} /> {m.label}
                      </button>
                    )})}
                  </div>
                </div>

                {/* Circle: radius */}
                {editForm.shape === 'circle' && (
                  <div className="gz-field"><label>Rayon ({editForm.radius || 200}m)</label>
                    <input type="range" min="50" max="2000" step="10" value={editForm.radius || 200} onChange={e => setEditForm(p => ({...p, radius: parseInt(e.target.value)}))} className="gz-range" data-testid="zone-radius-slider" />
                    <div className="gz-range-labels"><span>50m</span><span>2000m</span></div>
                  </div>
                )}

                {/* BLE: router selector + RSSI */}
                {editForm.shape === 'ble' && (
                  <>
                    <div className="gz-field"><label>Router associé</label>
                      <select value={editForm.router_id} onChange={e => { const r = routerList.find(g => String(g.id) === e.target.value); setEditForm(p => ({...p, router_id: e.target.value, router_name: r?.fname || r?.label || ''})) }} data-testid="zone-router-select">
                        <option value="">Sélectionner un router...</option>
                        {routerList.map(g => <option key={g.id} value={g.id}>{g.fname || g.label || g.serialNumber} {g.locationLabel ? `(${g.locationLabel})` : ''}</option>)}
                      </select>
                    </div>
                    <div className="gz-field"><label>Seuil RSSI ({editForm.rssi_threshold} dBm)</label>
                      <input type="range" min="-100" max="-30" step="1" value={editForm.rssi_threshold || -70} onChange={e => setEditForm(p => ({...p, rssi_threshold: parseInt(e.target.value)}))} className="gz-range" data-testid="zone-rssi-slider" />
                      <div className="gz-range-labels"><span>-100 (loin)</span><span>-30 (proche)</span></div>
                    </div>
                    <div className="gz-ble-advanced">
                      <div className="gz-field gz-field--half"><label>Anti-bruit ({editForm.debounce_seconds}s)</label>
                        <input type="range" min="5" max="120" step="5" value={editForm.debounce_seconds || 15} onChange={e => setEditForm(p => ({...p, debounce_seconds: parseInt(e.target.value)}))} className="gz-range" data-testid="zone-debounce-slider" />
                      </div>
                      <div className="gz-field gz-field--half"><label>Lissage RSSI ({editForm.rssi_smoothing} lectures)</label>
                        <input type="range" min="1" max="10" step="1" value={editForm.rssi_smoothing || 3} onChange={e => setEditForm(p => ({...p, rssi_smoothing: parseInt(e.target.value)}))} className="gz-range" data-testid="zone-smoothing-slider" />
                      </div>
                    </div>
                  </>
                )}

                {/* Draw on map (circle/polygon only) */}
                {editForm.shape !== 'ble' && (
                  <div className="gz-field"><label>Dessiner sur la carte</label>
                    <button className="gz-draw-btn" onClick={() => { setDrawShape(editForm.shape); startDrawOnMap() }} data-testid="draw-on-map-btn"><Pencil size={15} /> {editForm.shape === 'circle' ? 'Dessiner le cercle' : 'Dessiner le polygone'}</button>
                    {editForm.center && editForm.shape === 'circle' && <div className="gz-draw-result"><Check size={12} style={{color:'#059669'}} /> Centre: {editForm.center[0].toFixed(4)}, {editForm.center[1].toFixed(4)} | Rayon: {editForm.radius}m</div>}
                    {editForm.polygon && editForm.shape === 'polygon' && <div className="gz-draw-result"><Check size={12} style={{color:'#059669'}} /> {editForm.polygon.length} points</div>}
                  </div>
                )}

                {/* Type + Color */}
                <div className="gz-field-row">
                  <div className="gz-field" style={{flex:1}}><label>Type</label>
                    <select value={editForm.type} onChange={e => setEditForm(p => ({...p, type: e.target.value}))} data-testid="zone-edit-type">
                      {Object.entries(ZONE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div className="gz-field" style={{flex:1}}><label>Couleur</label>
                    <div className="gz-colors">{['#2563EB','#059669','#DC2626','#D97706','#8B5CF6','#EC4899'].map(c => <button key={c} className={`gz-color ${editForm.color === c ? 'gz-color--active' : ''}`} style={{background: c}} onClick={() => setEditForm(p => ({...p, color: c}))} />)}</div>
                  </div>
                </div>

                {/* Active + Alerts */}
                <div className="gz-field"><label>Statut & alertes</label>
                  <div className="gz-toggles">
                    <label className="gz-toggle-label" data-testid="zone-active-toggle"><input type="checkbox" checked={editForm.active} onChange={e => setEditForm(p => ({...p, active: e.target.checked}))} /><span className="gz-toggle-sw" /><Power size={13} /> Zone active</label>
                    <label className="gz-toggle-label" data-testid="zone-edit-alert-entry"><input type="checkbox" checked={editForm.alertEntry} onChange={e => setEditForm(p => ({...p, alertEntry: e.target.checked}))} /><span className="gz-toggle-sw" /><LogIn size={13} /> Alerte entrée</label>
                    <label className="gz-toggle-label" data-testid="zone-edit-alert-exit"><input type="checkbox" checked={editForm.alertExit} onChange={e => setEditForm(p => ({...p, alertExit: e.target.checked}))} /><span className="gz-toggle-sw" /><LogOut size={13} /> Alerte sortie</label>
                  </div>
                </div>
              </div>
              <div className="gz-modal-foot">
                <button className="gz-btn gz-btn--ghost" onClick={() => setEditZone(null)}>Annuler</button>
                <button className="gz-btn gz-btn--primary" onClick={saveZone} disabled={saving || !editForm.name} data-testid="zone-save-btn">
                  {saving ? <><Loader2 size={14} className="gz-spin" /> Enregistrement...</> : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Alert Config Modal ── */}
        {showAlertModal && (
          <div className="gz-modal-bg" onClick={() => setShowAlertModal(false)}>
            <div className="gz-modal gz-modal--sm" onClick={e => e.stopPropagation()} data-testid="alert-modal">
              <div className="gz-modal-head"><h2>Configurer une alerte</h2><button onClick={() => setShowAlertModal(false)}><X size={18} /></button></div>
              <div className="gz-modal-body">
                <div className="gz-field"><label>Zone</label>
                  <select value={alertForm.zone_id} onChange={e => { const z = zones.find(zz => zz.id === e.target.value); setAlertForm(p => ({...p, zone_id: e.target.value, zone_name: z?.name || ''})) }} data-testid="alert-zone-select">
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <div className="gz-field"><label>Type d'alerte</label>
                  <select value={alertForm.alert_type} onChange={e => setAlertForm(p => ({...p, alert_type: e.target.value}))} data-testid="alert-type-select">
                    <option value="asset_enter">Asset entre dans la zone</option>
                    <option value="asset_exit">Asset quitte la zone</option>
                    <option value="asset_not_detected">Asset non détecté</option>
                    <option value="restricted_access">Accès zone restreinte</option>
                  </select>
                </div>
                <div className="gz-field"><label>Message personnalisé</label><input type="text" value={alertForm.message_template} onChange={e => setAlertForm(p => ({...p, message_template: e.target.value}))} placeholder="Ex: Chariot détecté en zone interdite" data-testid="alert-message" /></div>
                <div className="gz-field"><label>Cooldown ({alertForm.cooldown_minutes} min)</label>
                  <input type="range" min="1" max="60" value={alertForm.cooldown_minutes} onChange={e => setAlertForm(p => ({...p, cooldown_minutes: parseInt(e.target.value)}))} className="gz-range" data-testid="alert-cooldown" />
                </div>
              </div>
              <div className="gz-modal-foot">
                <button className="gz-btn gz-btn--ghost" onClick={() => setShowAlertModal(false)}>Annuler</button>
                <button className="gz-btn gz-btn--primary" onClick={saveAlert} data-testid="alert-save-btn">Créer l'alerte</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const STYLES = `
/* ── Layout ── */
.gz { max-width:1400px; }
.gz-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; gap:12px; flex-wrap:wrap; }
.gz-title { font-family:'Manrope',sans-serif; font-size:1.6rem; font-weight:800; color:#0F172A; letter-spacing:-.03em; margin:0; }
.gz-sub { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:3px 0 0; display:flex; align-items:center; gap:8px; }
.gz-live { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:10px; background:#ECFDF5; color:#059669; font-size:.62rem; font-weight:700; animation:gzPulse 2s ease infinite; }
@keyframes gzPulse { 0%,100%{opacity:1;} 50%{opacity:.6;} }

/* ── Buttons ── */
.gz-btn { display:inline-flex; align-items:center; gap:5px; padding:9px 16px; border-radius:10px; border:none; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; cursor:pointer; transition:all .15s; }
.gz-btn--primary { background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.gz-btn--primary:hover { background:#1D4ED8; }
.gz-btn--danger { background:#EF4444; color:#FFF; }
.gz-btn--outline { border:1.5px solid #E2E8F0; background:#FFF; color:#475569; flex:1; justify-content:center; }
.gz-btn--outline:hover { border-color:#2563EB; color:#2563EB; }
.gz-btn--danger-outline { border:1.5px solid #FEE2E2; background:#FEF2F2; color:#DC2626; }
.gz-btn--ghost { background:#F1F5F9; color:#64748B; }
.gz-btn--sm { padding:7px 12px; font-size:.72rem; }
.gz-btn:disabled { opacity:.4; cursor:not-allowed; }
.gz-spin { animation:gzSpin 1s linear infinite; }
@keyframes gzSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
.gz-header-actions { display:flex; gap:8px; }

/* ── Draw Banner ── */
.gz-draw-banner { display:flex; align-items:center; gap:14px; padding:12px 18px; margin-bottom:12px; background:linear-gradient(135deg,#EFF6FF,#DBEAFE); border:1.5px solid #93C5FD; border-radius:12px; }
.gz-draw-ico { color:#2563EB; flex-shrink:0; animation:gzSpin 3s linear infinite; }
.gz-draw-banner strong { display:block; font-family:'Manrope',sans-serif; font-size:.78rem; color:#1E40AF; }
.gz-draw-banner span { font-family:'Inter',sans-serif; font-size:.68rem; color:#3B82F6; }
.gz-draw-badge { display:inline-flex; align-items:center; gap:4px; padding:5px 12px; border-radius:8px; background:#2563EB; color:#FFF; font-family:'Manrope',sans-serif; font-size:.75rem; font-weight:700; flex-shrink:0; }

/* ── Tabs ── */
.gz-tabs { display:flex; gap:4px; margin-bottom:16px; background:#F1F5F9; border-radius:12px; padding:4px; }
.gz-tab { display:flex; align-items:center; gap:6px; padding:9px 16px; border-radius:10px; border:none; background:transparent; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .15s; }
.gz-tab--active { background:#FFF; color:#0F172A; box-shadow:0 1px 4px rgba(0,0,0,.06); }
.gz-tab-count { display:inline-flex; align-items:center; justify-content:center; min-width:20px; height:20px; border-radius:6px; background:#E2E8F0; font-size:.62rem; font-weight:700; color:#475569; padding:0 5px; }
.gz-tab--active .gz-tab-count { background:#2563EB; color:#FFF; }

/* ── Stats ── */
.gz-stats { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; align-items:center; }
.gz-stat { display:flex; align-items:center; gap:6px; padding:8px 14px; background:#FFF; border-radius:10px; border:1px solid #E2E8F0; transition:all .15s; }
.gz-stat:hover { border-color:#CBD5E1; }
.gz-stat-val { font-family:'Manrope',sans-serif; font-size:1rem; font-weight:800; color:#0F172A; }
.gz-stat-label { font-family:'Inter',sans-serif; font-size:.68rem; color:#64748B; }
.gz-stat-sep { width:1px; height:24px; background:#E2E8F0; }

/* ── Map + Panel ── */
.gz-content { display:grid; grid-template-columns:1fr 340px; gap:16px; height:calc(100vh - 380px); min-height:380px; }
@media(max-width:900px){ .gz-content{ grid-template-columns:1fr; height:auto; } }
.gz-map-wrap { border-radius:14px; overflow:hidden; border:1px solid #E2E8F0; position:relative; min-height:380px; }
.gz-map-wrap .leaflet-container { border-radius:14px; }
.gz-map-controls { position:absolute; top:12px; right:12px; z-index:500; display:flex; gap:6px; }
.gz-map-toggle { display:flex; align-items:center; gap:4px; padding:6px 10px; border-radius:8px; border:1.5px solid rgba(255,255,255,.9); background:rgba(255,255,255,.85); backdrop-filter:blur(8px); font-family:'Inter',sans-serif; font-size:.65rem; font-weight:600; color:#475569; cursor:pointer; transition:all .15s; }
.gz-map-toggle--on { background:rgba(37,99,235,.1); border-color:#2563EB; color:#2563EB; }

/* ── Panel ── */
.gz-panel { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; display:flex; flex-direction:column; overflow:hidden; }
.gz-panel-search { position:relative; padding:12px 12px 8px; }
.gz-panel-search-ico { position:absolute; left:24px; top:50%; transform:translateY(-50%); color:#94A3B8; }
.gz-panel-input { width:100%; padding:8px 10px 8px 32px; border-radius:9px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-size:.78rem; font-family:'Inter',sans-serif; color:#0F172A; outline:none; box-sizing:border-box; }
.gz-panel-input:focus { border-color:#2563EB; }
.gz-zone-list { flex:1; overflow-y:auto; padding:0 6px 6px; }
.gz-loading { display:flex; align-items:center; justify-content:center; padding:40px; color:#94A3B8; }
.gz-empty { padding:40px; text-align:center; font-family:'Inter',sans-serif; color:#94A3B8; font-size:.78rem; }
.gz-zone-item { display:flex; align-items:center; gap:10px; padding:10px; border-radius:10px; cursor:pointer; transition:background .1s; margin-bottom:1px; }
.gz-zone-item:hover { background:#F8FAFC; }
.gz-zone-item--active { background:#EFF6FF; }
.gz-zone-item--off { opacity:.5; }
.gz-zone-color { width:3px; height:32px; border-radius:2px; flex-shrink:0; }
.gz-zone-info { flex:1; min-width:0; }
.gz-zone-name-row { display:flex; align-items:center; gap:5px; }
.gz-zone-name { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.gz-zone-tags { display:flex; gap:6px; margin-top:3px; }
.gz-zone-type { padding:1px 6px; border-radius:4px; font-family:'Inter',sans-serif; font-size:.58rem; font-weight:600; }
.gz-zone-mode { font-family:'Inter',sans-serif; font-size:.58rem; font-weight:600; }
.gz-chevron { color:#CBD5E1; flex-shrink:0; }

/* ── Events ── */
.gz-events-wrap { }
.gz-ev-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; margin-bottom:20px; }
.gz-ev-stat-card { display:flex; flex-direction:column; align-items:center; gap:4px; padding:16px; background:#FFF; border-radius:12px; border:1px solid #E2E8F0; }
.gz-ev-stat-num { font-family:'Manrope',sans-serif; font-size:1.4rem; font-weight:800; color:#0F172A; }
.gz-ev-stat-lbl { font-family:'Inter',sans-serif; font-size:.68rem; color:#64748B; }
.gz-active-zones { margin-bottom:20px; }
.gz-section-title { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:800; color:#0F172A; margin:0 0 12px; }
.gz-active-list { display:flex; gap:10px; flex-wrap:wrap; }
.gz-active-item { display:flex; align-items:center; gap:8px; padding:8px 14px; background:#FFF; border-radius:10px; border:1px solid #E2E8F0; }
.gz-active-rank { font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:800; color:#2563EB; }
.gz-active-name { font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; font-weight:600; }
.gz-active-count { font-family:'Inter',sans-serif; font-size:.65rem; color:#64748B; }
.gz-ev-timeline { }
.gz-ev-item { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid #F1F5F9; }
.gz-ev-icon { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.gz-ev-content { flex:1; min-width:0; }
.gz-ev-type { display:block; font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; }
.gz-ev-desc { display:block; font-family:'Inter',sans-serif; font-size:.75rem; color:#475569; margin-top:1px; }
.gz-ev-rssi { display:inline-flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.62rem; color:#8B5CF6; margin-top:2px; }
.gz-ev-time { font-family:'Inter',sans-serif; font-size:.62rem; color:#94A3B8; flex-shrink:0; white-space:nowrap; }

/* ── Alerts ── */
.gz-alerts-wrap { }
.gz-alerts-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.gz-alert-card { display:flex; align-items:flex-start; gap:12px; padding:14px 16px; background:#FFF; border-radius:12px; border:1px solid #E2E8F0; margin-bottom:8px; }
.gz-alert-status { width:8px; height:8px; border-radius:50%; margin-top:5px; flex-shrink:0; }
.gz-alert-info { flex:1; min-width:0; }
.gz-alert-type { display:block; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; }
.gz-alert-zone { display:block; font-family:'Inter',sans-serif; font-size:.72rem; color:#475569; margin-top:1px; }
.gz-alert-msg { display:block; font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; font-style:italic; margin-top:2px; }
.gz-alert-meta { display:flex; gap:12px; margin-top:4px; }
.gz-alert-meta span { font-family:'Inter',sans-serif; font-size:.6rem; color:#94A3B8; display:flex; align-items:center; gap:3px; }
.gz-alert-del { background:none; border:none; color:#CBD5E1; cursor:pointer; padding:4px; }
.gz-alert-del:hover { color:#DC2626; }

/* ── Drawer ── */
.gz-drawer { position:fixed; top:0; right:0; width:360px; height:100vh; background:#FFF; border-left:1px solid #E2E8F0; z-index:200; box-shadow:-8px 0 30px rgba(0,0,0,.08); display:flex; flex-direction:column; animation:gzSlide .2s ease; }
@keyframes gzSlide { from{transform:translateX(100%)} to{transform:translateX(0)} }
.gz-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:20px 20px 14px; border-bottom:1px solid #F1F5F9; }
.gz-drawer-title { font-family:'Manrope',sans-serif; font-size:1.05rem; font-weight:800; color:#0F172A; margin:0; }
.gz-drawer-close { width:30px; height:30px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.gz-drawer-close:hover { border-color:#EF4444; color:#EF4444; }
.gz-drawer-body { flex:1; padding:16px 20px; overflow-y:auto; }
.gz-drawer-section { margin-bottom:16px; }
.gz-drawer-label { display:block; font-family:'Manrope',sans-serif; font-size:.62rem; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.04em; margin-bottom:5px; }
.gz-drawer-badges { display:flex; gap:6px; flex-wrap:wrap; }
.gz-shape-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:8px; background:#F1F5F9; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:600; color:#475569; }
.gz-mode-badge { display:inline-flex; align-items:center; gap:4px; padding:5px 12px; border-radius:8px; background:#F1F5F9; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; }
.gz-active-badge { display:inline-flex; padding:4px 10px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.65rem; font-weight:700; background:#FEF2F2; color:#DC2626; }
.gz-active-badge--on { background:#ECFDF5; color:#059669; }
.gz-type-badge { display:inline-flex; padding:4px 12px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:600; }
.gz-dim-list { display:flex; flex-direction:column; gap:5px; }
.gz-dim { display:flex; align-items:center; gap:7px; font-family:'Inter',sans-serif; font-size:.75rem; color:#475569; padding:5px 10px; background:#FAFBFC; border-radius:7px; }
.gz-rules-list { display:flex; flex-direction:column; gap:6px; }
.gz-rule { display:flex; align-items:center; gap:7px; padding:8px 12px; border-radius:9px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.75rem; color:#94A3B8; }
.gz-rule--on { border-color:#059669; color:#059669; background:#ECFDF5; }
.gz-rule span { margin-left:auto; font-size:.65rem; font-weight:700; }
.gz-drawer-footer { display:flex; gap:8px; padding:14px 20px; border-top:1px solid #F1F5F9; }

/* ── Modal ── */
.gz-modal-bg { position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:16px; }
.gz-modal { background:#FFF; border-radius:16px; width:100%; max-width:580px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.18); }
.gz-modal--sm { max-width:460px; }
.gz-modal-head { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #F1F5F9; }
.gz-modal-head h2 { font-family:'Manrope',sans-serif; font-size:1rem; font-weight:800; color:#0F172A; margin:0; }
.gz-modal-head button { background:none; border:none; color:#94A3B8; cursor:pointer; }
.gz-modal-body { padding:18px 22px; display:flex; flex-direction:column; gap:14px; }
.gz-modal-foot { display:flex; justify-content:flex-end; gap:8px; padding:14px 22px; border-top:1px solid #F1F5F9; }
.gz-field { display:flex; flex-direction:column; gap:4px; }
.gz-field label { font-family:'Manrope',sans-serif; font-size:.68rem; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.03em; }
.gz-field input[type="text"], .gz-field select { padding:9px 12px; border-radius:9px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-family:'Inter',sans-serif; font-size:.82rem; color:#0F172A; outline:none; transition:all .2s; }
.gz-field input:focus, .gz-field select:focus { border-color:#2563EB; background:#FFF; }
.gz-field-row { display:flex; gap:12px; }
.gz-field--half { flex:1; }
.gz-ble-advanced { display:flex; gap:12px; }

/* ── Shape selector ── */
.gz-shape-sel { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
.gz-shape-opt { display:flex; flex-direction:column; align-items:center; gap:3px; padding:14px 8px; border-radius:11px; border:2px solid #E2E8F0; background:#FAFBFC; cursor:pointer; transition:all .15s; }
.gz-shape-opt:hover { border-color:#CBD5E1; }
.gz-shape-opt--active { border-color:#2563EB; background:#EFF6FF; }
.gz-shape-opt svg { color:#64748B; }
.gz-shape-opt--active svg { color:#2563EB; }
.gz-shape-opt span { font-family:'Manrope',sans-serif; font-size:.75rem; font-weight:700; color:#0F172A; }
.gz-shape-opt small { font-family:'Inter',sans-serif; font-size:.58rem; color:#94A3B8; }

/* ── Mode selector ── */
.gz-mode-sel { display:flex; gap:6px; }
.gz-mode-opt { display:flex; align-items:center; gap:5px; padding:8px 12px; border-radius:9px; border:1.5px solid #E2E8F0; background:#FFF; cursor:pointer; transition:all .15s; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; color:#64748B; }
.gz-mode-opt:hover { border-color:#CBD5E1; }
.gz-mode-opt--active { border-width:2px; background:#F0F9FF; }

/* ── Range ── */
.gz-range { width:100%; height:5px; border-radius:3px; appearance:none; -webkit-appearance:none; background:linear-gradient(90deg,#DBEAFE 0%,#2563EB 100%); outline:none; }
.gz-range::-webkit-slider-thumb { appearance:none; -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:#2563EB; border:3px solid #FFF; box-shadow:0 2px 6px rgba(37,99,235,.3); cursor:pointer; }
.gz-range-labels { display:flex; justify-content:space-between; font-family:'Inter',sans-serif; font-size:.58rem; color:#94A3B8; margin-top:1px; }

/* ── Draw button ── */
.gz-draw-btn { display:flex; align-items:center; justify-content:center; gap:8px; padding:11px 14px; border-radius:10px; border:2px dashed #93C5FD; background:#EFF6FF; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:600; color:#2563EB; cursor:pointer; transition:all .15s; }
.gz-draw-btn:hover { background:#DBEAFE; border-color:#2563EB; }
.gz-draw-result { display:flex; align-items:center; gap:5px; padding:6px 10px; border-radius:7px; background:#ECFDF5; font-family:'Inter',sans-serif; font-size:.65rem; color:#059669; margin-top:5px; }

/* ── Colors ── */
.gz-colors { display:flex; gap:7px; margin-top:3px; }
.gz-color { width:26px; height:26px; border-radius:7px; border:2px solid transparent; cursor:pointer; transition:all .12s; }
.gz-color:hover { transform:scale(1.1); }
.gz-color--active { border-color:#0F172A; box-shadow:0 0 0 2px rgba(0,0,0,.1); }

/* ── Toggles ── */
.gz-toggles { display:flex; flex-direction:column; gap:8px; }
.gz-toggle-label { display:flex; align-items:center; gap:8px; font-family:'Inter',sans-serif; font-size:.78rem; color:#475569; cursor:pointer; }
.gz-toggle-label input { display:none; }
.gz-toggle-sw { width:34px; height:18px; border-radius:9px; background:#E2E8F0; position:relative; transition:background .2s; flex-shrink:0; }
.gz-toggle-sw::after { content:''; position:absolute; top:2px; left:2px; width:14px; height:14px; border-radius:50%; background:#FFF; transition:transform .2s; }
.gz-toggle-label input:checked + .gz-toggle-sw { background:#2563EB; }
.gz-toggle-label input:checked + .gz-toggle-sw::after { transform:translateX(16px); }
`

export default PremiumZones
