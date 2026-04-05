import {useEffect, useState, useRef} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchGateways, getGateways} from '../Gateway/slice/gateway.slice'
import {fetchLogList} from '../LogsTracking/slice/logs.slice'
import {MapContainer, TileLayer, Marker, Popup, useMap} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import {
  Radio, Search, X, Filter, MapPin, Clock, Truck,
  Wifi, WifiOff, ChevronRight, Eye, Settings, Signal
} from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const gatewayIcon = (color) => L.divIcon({
  className: 'ltgw-marker',
  html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M6.7 6.7a8 8 0 0 1 10.6 0M3.5 3.5a13 13 0 0 1 17 0"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
})

const ICONS = {
  online: gatewayIcon('#10B981'),
  offline: gatewayIcon('#94A3B8'),
  alert: gatewayIcon('#EF4444'),
}

const PremiumGateway = () => {
  const dispatch = useAppDispatch()
  const gateways = useAppSelector(getGateways)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGw, setSelectedGw] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    setLoading(true)
    dispatch(fetchGateways()).finally(() => setLoading(false))
    dispatch(fetchLogList({page: 1, PageSize: 30})).then(res => {
      if (res?.payload) setLogs(Array.isArray(res.payload) ? res.payload : [])
    })
  }, [dispatch])

  const data = Array.isArray(gateways) ? gateways : []
  const filtered = data.filter(gw => {
    if (!search) return true
    const t = search.toLowerCase()
    return [gw.fname, gw.sname, gw.label, gw.locationLabel, gw.serialNumber]
      .some(f => f && f.toLowerCase().includes(t))
  })

  const onlineCount = data.filter(g => g.active === 1 || g.active === true).length
  const withCoords = data.filter(g => g.lat && g.lng && g.lat !== 0 && g.lng !== 0)
  const mapCenter = withCoords.length > 0
    ? [withCoords[0].lat, withCoords[0].lng]
    : [46.8, 7.15]

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltgw" data-testid="premium-gateway">
        {/* Header */}
        <div className="ltgw-header">
          <div>
            <h1 className="ltgw-title" data-testid="gateway-title">Gateway</h1>
            <p className="ltgw-sub">{data.length} passerelle{data.length > 1 ? 's' : ''} configurées</p>
          </div>
        </div>

        {/* Stats */}
        <div className="ltgw-stats" data-testid="gateway-stats">
          <div className="ltgw-stat">
            <div className="ltgw-stat-icon" style={{background: '#EFF6FF'}}><Radio size={18} style={{color: '#2563EB'}} /></div>
            <div className="ltgw-stat-val" style={{color: '#2563EB'}}>{data.length}</div>
            <div className="ltgw-stat-label">Total</div>
          </div>
          <div className="ltgw-stat">
            <div className="ltgw-stat-icon" style={{background: '#ECFDF5'}}><Wifi size={18} style={{color: '#059669'}} /></div>
            <div className="ltgw-stat-val" style={{color: '#059669'}}>{onlineCount}</div>
            <div className="ltgw-stat-label">En ligne</div>
          </div>
          <div className="ltgw-stat">
            <div className="ltgw-stat-icon" style={{background: '#FEF2F2'}}><WifiOff size={18} style={{color: '#DC2626'}} /></div>
            <div className="ltgw-stat-val" style={{color: '#DC2626'}}>{data.length - onlineCount}</div>
            <div className="ltgw-stat-label">Hors ligne</div>
          </div>
        </div>

        {/* Content: Map + List */}
        <div className="ltgw-content">
          {/* Map */}
          <div className="ltgw-map-wrap" data-testid="gateway-map">
            <MapContainer center={mapCenter} zoom={9} style={{width: '100%', height: '100%'}} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              <MarkerClusterGroup chunkedLoading>
                {withCoords.map((gw, i) => (
                  <Marker
                    key={gw.id || i}
                    position={[gw.lat, gw.lng]}
                    icon={gw.active ? ICONS.online : ICONS.offline}
                    eventHandlers={{click: () => setSelectedGw(gw)}}
                  >
                    <Popup>
                      <div style={{fontFamily: 'Inter, sans-serif', fontSize: '.82rem'}}>
                        <strong>{gw.fname || gw.label || 'Gateway'}</strong><br />
                        <span style={{color: '#64748B', fontSize: '.72rem'}}>{gw.locationLabel || '—'}</span><br />
                        <span style={{color: gw.active ? '#059669' : '#DC2626', fontSize: '.72rem', fontWeight: 600}}>
                          {gw.active ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>

          {/* Gateway List */}
          <div className="ltgw-panel" data-testid="gateway-panel">
            <div className="ltgw-panel-search">
              <Search size={14} className="ltgw-panel-ico" />
              <input className="ltgw-panel-input" placeholder="Filtrer passerelles..." value={search} onChange={e => setSearch(e.target.value)} data-testid="gateway-search" />
            </div>

            <div className="ltgw-gw-list" data-testid="gateway-list">
              {loading ? (
                [...Array(5)].map((_, i) => <div key={i} className="ltgw-skel" />)
              ) : filtered.length === 0 ? (
                <div className="ltgw-empty"><Radio size={32} strokeWidth={1} /><p>Aucune passerelle</p></div>
              ) : (
                filtered.map((gw, i) => {
                  const isActive = gw.active === 1 || gw.active === true
                  const isSelected = selectedGw?.id === gw.id
                  return (
                    <div
                      key={gw.id || i}
                      className={`ltgw-gw-item ${isSelected ? 'ltgw-gw-item--active' : ''}`}
                      onClick={() => setSelectedGw(gw)}
                      data-testid={`gateway-item-${i}`}
                    >
                      <div className="ltgw-gw-status" style={{background: isActive ? '#10B981' : '#94A3B8'}} />
                      <div className="ltgw-gw-info">
                        <span className="ltgw-gw-name">{gw.fname || gw.label || `GW-${gw.id}`}</span>
                        <span className="ltgw-gw-loc"><MapPin size={10} /> {gw.locationLabel || '—'}</span>
                      </div>
                      <div className="ltgw-gw-meta">
                        <span className={`ltgw-gw-badge ${isActive ? 'ltgw-gw-badge--on' : ''}`}>
                          {isActive ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <ChevronRight size={14} className="ltgw-gw-chevron" />
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Logs Timeline */}
        {logs.length > 0 && (
          <div className="ltgw-logs" data-testid="gateway-logs">
            <h3 className="ltgw-logs-title"><Clock size={16} /> Derniers événements</h3>
            <div className="ltgw-logs-list">
              {logs.slice(0, 10).map((log, i) => (
                <div key={log.id || i} className="ltgw-log-item" data-testid={`gateway-log-${i}`}>
                  <div className="ltgw-log-time">
                    <span className="ltgw-log-date">{log.dateFormated || log.date || '—'}</span>
                    <span className="ltgw-log-hour">{log.timeFormated || log.time || ''}</span>
                  </div>
                  <div className="ltgw-log-dot" />
                  <div className="ltgw-log-body">
                    <span className="ltgw-log-id">{log.serialNumber || log.tagname || log.reference || `#${i + 1}`}</span>
                    <span className="ltgw-log-loc"><MapPin size={10} /> {log.locationLabel || log.siteName || '—'}</span>
                    {log.enginCount !== undefined && (
                      <span className="ltgw-log-count"><Truck size={10} /> {log.enginCount || 0} Engin(s)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const STYLES = `
.ltgw { max-width: 1400px; }
.ltgw-header { margin-bottom:24px; }
.ltgw-title { font-family:'Manrope',sans-serif; font-size:1.75rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.ltgw-sub { font-family:'Inter',sans-serif; font-size:.875rem; color:#64748B; margin:4px 0 0; }

.ltgw-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
@media(max-width:600px){ .ltgw-stats{ grid-template-columns:1fr; } }
.ltgw-stat { background:#FFF; border-radius:12px; border:1px solid #E2E8F0; padding:18px; display:flex; flex-direction:column; gap:8px; }
.ltgw-stat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
.ltgw-stat-val { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; letter-spacing:-.03em; }
.ltgw-stat-label { font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; }

.ltgw-content { display:grid; grid-template-columns:1fr 360px; gap:20px; height:calc(100vh - 340px); min-height:400px; margin-bottom:24px; }
@media(max-width:900px){ .ltgw-content{ grid-template-columns:1fr; height:auto; } }

.ltgw-map-wrap { border-radius:14px; overflow:hidden; border:1px solid #E2E8F0; min-height:400px; }
.ltgw-map-wrap .leaflet-container { border-radius:14px; }

.ltgw-panel { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; display:flex; flex-direction:column; overflow:hidden; }
.ltgw-panel-search { position:relative; padding:14px 14px 10px; }
.ltgw-panel-ico { position:absolute; left:26px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
.ltgw-panel-input { width:100%; padding:9px 12px 9px 36px; border-radius:9px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-size:.8rem; font-family:'Inter',sans-serif; color:#0F172A; outline:none; transition:all .2s; }
.ltgw-panel-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }

.ltgw-gw-list { flex:1; overflow-y:auto; padding:0 8px 8px; }
.ltgw-gw-item { display:flex; align-items:center; gap:10px; padding:12px; border-radius:10px; cursor:pointer; transition:background .1s; margin-bottom:2px; }
.ltgw-gw-item:hover { background:#F8FAFC; }
.ltgw-gw-item--active { background:#EFF6FF; }
.ltgw-gw-status { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.ltgw-gw-info { flex:1; display:flex; flex-direction:column; gap:3px; min-width:0; }
.ltgw-gw-name { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; }
.ltgw-gw-loc { display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.65rem; color:#94A3B8; }
.ltgw-gw-meta { flex-shrink:0; }
.ltgw-gw-badge { padding:3px 8px; border-radius:5px; font-family:'Inter',sans-serif; font-size:.62rem; font-weight:600; background:#F1F5F9; color:#94A3B8; }
.ltgw-gw-badge--on { background:#ECFDF5; color:#059669; }
.ltgw-gw-chevron { color:#CBD5E1; flex-shrink:0; }

/* Logs */
.ltgw-logs { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; padding:20px 24px; }
.ltgw-logs-title { display:flex; align-items:center; gap:8px; font-family:'Manrope',sans-serif; font-size:.92rem; font-weight:700; color:#0F172A; margin:0 0 16px; }
.ltgw-logs-list { display:flex; flex-direction:column; gap:0; }
.ltgw-log-item { display:flex; gap:12px; align-items:flex-start; padding:10px 0; position:relative; }
.ltgw-log-item:not(:last-child)::after { content:''; position:absolute; left:87px; top:36px; width:2px; height:calc(100% - 12px); background:#F1F5F9; }
.ltgw-log-time { width:70px; flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:1px; }
.ltgw-log-date { font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; color:#0F172A; }
.ltgw-log-hour { font-family:'Inter',sans-serif; font-size:.65rem; color:#D97706; font-weight:600; }
.ltgw-log-dot { width:10px; height:10px; border-radius:50%; background:#2563EB; border:2px solid #DBEAFE; flex-shrink:0; margin-top:4px; z-index:1; }
.ltgw-log-body { flex:1; display:flex; flex-direction:column; gap:3px; }
.ltgw-log-id { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; }
.ltgw-log-loc { display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.68rem; color:#D97706; }
.ltgw-log-count { display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.68rem; color:#64748B; }

.ltgw-skel { height:52px; margin:4px 8px; border-radius:8px; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; }
@keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.ltgw-empty { display:flex; flex-direction:column; align-items:center; padding:40px; color:#CBD5E1; gap:6px; }
.ltgw-empty p { font-family:'Inter',sans-serif; font-size:.82rem; color:#94A3B8; margin:0; }
`

export default PremiumGateway
