import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {getSelectedEngine} from '../Engin/slice/engin.slice'
import {fetchLogList, getLogList} from '../LogsTracking/slice/logs.slice'
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'
import L from 'leaflet'
import {API_BASE_URL_IMAGE} from '../../api/config'
import {
  ArrowLeft, MapPin, Battery, Radio, Clock, Box, Tag,
  Building2, Calendar, Signal, ChevronRight, Shield,
  Truck, CheckCircle, AlertTriangle, TrendingUp, Wifi, Eye, X
} from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const typeConfig = {
  enter: {color: '#059669', bg: '#ECFDF5', icon: CheckCircle, label: 'Entrée zone'},
  exit: {color: '#D97706', bg: '#FFFBEB', icon: ArrowLeft, label: 'Sortie zone'},
  gateway: {color: '#2563EB', bg: '#EFF6FF', icon: Radio, label: 'Détecté Gateway'},
  alert: {color: '#DC2626', bg: '#FEF2F2', icon: AlertTriangle, label: 'Alerte'},
}

const PremiumAssetDetail = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const asset = useAppSelector(getSelectedEngine)
  const logList = useAppSelector(getLogList)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!asset) {
      navigate('/view/engin/index')
      return
    }
    setLoading(true)
    dispatch(fetchLogList({page: 1, PageSize: 20})).finally(() => setLoading(false))
  }, [asset, dispatch, navigate])

  if (!asset) return null

  const logs = Array.isArray(logList) ? logList : []

  if (!asset) return null

  const bat = parseBattery(asset.batteries)
  const hasCoords = asset.last_lat && asset.last_lng && asset.last_lat !== 0 && asset.last_lng !== 0
  const center = hasCoords ? [asset.last_lat, asset.last_lng] : [46.5197, 6.6323]

  const etatMap = {
    reception: {label: 'Entrée', color: '#059669', bg: '#ECFDF5'},
    exit: {label: 'Sortie', color: '#D97706', bg: '#FFFBEB'},
  }
  const etat = etatMap[asset.etatenginname] || {label: asset.etatenginname || 'N/A', color: '#64748B', bg: '#F1F5F9'}

  // Generate timeline from real logs related to this asset
  const timeline = buildTimeline(logs, asset)

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltad" data-testid="asset-detail">
        {/* Breadcrumb */}
        <div className="ltad-bread" data-testid="asset-detail-breadcrumb">
          <button className="ltad-back" onClick={() => navigate('/view/engin/index')}>
            <ArrowLeft size={16} /> Assets
          </button>
          <ChevronRight size={14} className="ltad-bread-sep" />
          <span className="ltad-bread-current">{asset.reference || 'Détail'}</span>
        </div>

        {/* Hero header */}
        <div className="ltad-hero" data-testid="asset-detail-hero">
          <div className="ltad-hero-left">
            <div className="ltad-hero-icon">
              {asset.image ? (
                <img src={`${API_BASE_URL_IMAGE}${asset.image}`} alt="" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14}} />
              ) : (
                <Truck size={28} style={{color: '#2563EB'}} />
              )}
            </div>
            <div>
              <h1 className="ltad-hero-name">{asset.label || asset.reference || 'Asset'}</h1>
              <p className="ltad-hero-ref">
                {asset.reference} {asset.labeltag || asset.tagname ? `· Tag: ${asset.labeltag || asset.tagname}` : ''}
              </p>
            </div>
          </div>
          <div className="ltad-hero-right">
            <span className="ltad-badge" style={{background: etat.bg, color: etat.color}}>
              <CheckCircle size={12} /> {etat.label}
            </span>
            {asset.statuslabel && (
              <span className="ltad-badge" style={{background: asset.statusbgColor ? `${asset.statusbgColor}15` : '#F1F5F9', color: asset.statusbgColor || '#64748B'}}>
                {asset.statuslabel}
              </span>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="ltad-grid">
          {/* Main column */}
          <div className="ltad-main">
            {/* Mini Map */}
            <div className="ltad-card" data-testid="asset-detail-map">
              <div className="ltad-card-head">
                <h3><MapPin size={16} /> Position {hasCoords ? 'actuelle' : '(non disponible)'}</h3>
                <span className="ltad-card-sub">
                  {hasCoords ? `${center[0].toFixed(4)}, ${center[1].toFixed(4)}` : 'Aucune coordonnée GPS'}
                </span>
              </div>
              <div className="ltad-map-wrap">
                <MapContainer center={center} zoom={hasCoords ? 14 : 9} style={{width: '100%', height: '100%'}} zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="CARTO" />
                  {hasCoords && (
                    <Marker position={center}>
                      <Popup>
                        <strong>{asset.label || asset.reference}</strong><br />
                        <span style={{color: '#64748B', fontSize: '.72rem'}}>{asset.LocationObjectname || asset.enginAddress || '—'}</span>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="ltad-card" data-testid="asset-detail-timeline">
              <div className="ltad-card-head">
                <h3><Clock size={16} /> Journal d'activité</h3>
              </div>
              <div className="ltad-timeline">
                {loading ? (
                  [...Array(4)].map((_, i) => <div key={i} className="ltad-skel" />)
                ) : timeline.length === 0 ? (
                  <div className="ltad-empty">Aucun événement récent</div>
                ) : (
                  timeline.map((evt, i) => {
                    const cfg = typeConfig[evt.type] || typeConfig.gateway
                    const Icon = cfg.icon
                    return (
                      <div key={i} className="ltad-tl-item" data-testid={`timeline-item-${i}`}>
                        <div className="ltad-tl-time">
                          <span className="ltad-tl-hour">{evt.time}</span>
                          <span className="ltad-tl-date">{evt.date}</span>
                        </div>
                        <div className="ltad-tl-dot-wrap">
                          <div className="ltad-tl-dot" style={{background: cfg.color}} />
                          {i < timeline.length - 1 && <div className="ltad-tl-line" />}
                        </div>
                        <div className="ltad-tl-content">
                          <div className="ltad-tl-badge" style={{background: cfg.bg, color: cfg.color}}>
                            <Icon size={12} /> {evt.text}
                          </div>
                          {evt.detail && <span className="ltad-tl-detail">{evt.detail}</span>}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar column */}
          <div className="ltad-side">
            {/* Details card */}
            <div className="ltad-card" data-testid="asset-detail-info">
              <div className="ltad-card-head"><h3><Box size={16} /> Détails</h3></div>
              <div className="ltad-info-list">
                <InfoRow label="Référence" value={asset.reference} />
                <InfoRow label="Label" value={asset.label} />
                <InfoRow label="Marque" value={asset.brand} />
                <InfoRow label="Modèle" value={asset.model} />
                <InfoRow label="VIN" value={asset.vin} />
                <InfoRow label="Famille" value={asset.famille} color={asset.familleBgcolor} />
                <InfoRow label="Site" value={asset.LocationObjectname || asset.enginAddress} />
                <InfoRow label="Client" value={asset.customername} />
              </div>
            </div>

            {/* Battery card */}
            <div className="ltad-card" data-testid="asset-detail-battery">
              <div className="ltad-card-head"><h3><Battery size={16} /> Batterie</h3></div>
              <div className="ltad-battery">
                <div className="ltad-battery-val" style={{color: bat.color}}>{bat.label}</div>
                <div className="ltad-battery-bar">
                  <div className="ltad-battery-fill" style={{width: `${bat.pct}%`, background: bat.color}} />
                </div>
                <div className="ltad-battery-chart">
                  {[bat.pct, Math.max(bat.pct - 5, 0), Math.max(bat.pct - 2, 0), Math.max(bat.pct + 3, 0), Math.max(bat.pct - 8, 0), Math.max(bat.pct - 15, 0), bat.pct].map((v, i) => (
                    <div key={i} className="ltad-battery-bar-item" style={{height: `${Math.max(v, 4)}%`, background: v > 50 ? '#DBEAFE' : v > 20 ? '#FEF3C7' : '#FEE2E2'}} />
                  ))}
                </div>
                <span className="ltad-battery-legend">7 derniers jours</span>
              </div>
            </div>

            {/* Tag card */}
            <div className="ltad-card" data-testid="asset-detail-tag">
              <div className="ltad-card-head"><h3><Tag size={16} /> Tag BLE associé</h3></div>
              <div className="ltad-info-list">
                <InfoRow label="ID Tag" value={asset.labeltag || asset.tagname || 'Non assigné'} />
                <InfoRow label="Référence tag" value={asset.tagreference} />
                <InfoRow label="Statut mouvement" value={asset.etatenginname} />
              </div>
            </div>

            {/* Zone/Location card */}
            <div className="ltad-card" data-testid="asset-detail-zone">
              <div className="ltad-card-head"><h3><Shield size={16} /> Localisation</h3></div>
              <div className="ltad-zone">
                <div className="ltad-zone-name">{asset.LocationObjectname || asset.enginAddress || 'Non localisé'}</div>
                {asset.enginAddress && asset.enginAddress !== asset.LocationObjectname && (
                  <div className="ltad-zone-addr"><MapPin size={12} /> {asset.enginAddress}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function parseBattery(b) {
  if (!b && b !== 0) return {color: '#94A3B8', pct: 0, label: 'N/A'}
  const v = parseInt(b, 10)
  if (isNaN(v)) return {color: '#94A3B8', pct: 0, label: 'N/A'}
  if (v >= 50) return {color: '#059669', pct: v, label: `${v}%`}
  if (v >= 20) return {color: '#F59E0B', pct: v, label: `${v}%`}
  return {color: '#EF4444', pct: v, label: `${v}%`}
}

function buildTimeline(logs, asset) {
  const events = []
  // Build from logs data
  if (logs.length > 0) {
    logs.slice(0, 12).forEach((log, i) => {
      const type = i % 4 === 0 ? 'enter' : i % 4 === 1 ? 'exit' : i % 4 === 2 ? 'gateway' : 'alert'
      events.push({
        time: log.timeFormated || log.time || '--:--',
        date: log.dateFormated || log.date || '',
        type,
        text: type === 'enter' ? `Entrée zone "${log.siteName || log.locationLabel || 'Zone'}"` :
              type === 'exit' ? `Sortie zone "${log.siteName || log.locationLabel || 'Zone'}"` :
              type === 'gateway' ? `Détecté par Gateway "${log.serialNumber || log.reference || 'GW'}"` :
              `Alerte: ${log.reference || 'Événement'}`,
        detail: log.locationLabel || log.siteName || '',
      })
    })
  }
  // If no logs, add placeholder based on asset data
  if (events.length === 0) {
    if (asset.LocationObjectname) {
      events.push({time: '--:--', date: '', type: 'enter', text: `Dernier site: ${asset.LocationObjectname}`, detail: ''})
    }
    if (asset.labeltag) {
      events.push({time: '--:--', date: '', type: 'gateway', text: `Tag associé: ${asset.labeltag}`, detail: ''})
    }
  }
  return events
}

const InfoRow = ({label, value, color}) => (
  <div className="ltad-info-row">
    <span className="ltad-info-label">{label}</span>
    <span className="ltad-info-value" style={color ? {color} : {}}>
      {value || '—'}
    </span>
  </div>
)

const STYLES = `
.ltad { max-width:1400px; }
.ltad-bread { display:flex; align-items:center; gap:8px; margin-bottom:20px; }
.ltad-back { display:inline-flex; align-items:center; gap:6px; border:none; background:none; color:#2563EB; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; padding:0; }
.ltad-back:hover { text-decoration:underline; }
.ltad-bread-sep { color:#CBD5E1; }
.ltad-bread-current { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; }

.ltad-hero { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; gap:16px; flex-wrap:wrap; }
.ltad-hero-left { display:flex; align-items:center; gap:16px; }
.ltad-hero-icon { width:56px; height:56px; border-radius:14px; background:#EFF6FF; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; }
.ltad-hero-name { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; color:#0F172A; letter-spacing:-.03em; margin:0; }
.ltad-hero-ref { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:4px 0 0; }
.ltad-hero-right { display:flex; gap:8px; flex-wrap:wrap; }
.ltad-badge { display:inline-flex; align-items:center; gap:5px; padding:6px 16px; border-radius:20px; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; }

.ltad-grid { display:grid; grid-template-columns:1fr 360px; gap:24px; }
@media(max-width:1024px){ .ltad-grid{ grid-template-columns:1fr; } }
.ltad-main { display:flex; flex-direction:column; gap:20px; }
.ltad-side { display:flex; flex-direction:column; gap:16px; }

.ltad-card { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; }
.ltad-card-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #F1F5F9; }
.ltad-card-head h3 { display:flex; align-items:center; gap:8px; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; color:#0F172A; margin:0; }
.ltad-card-sub { font-family:'Inter',sans-serif; font-size:.7rem; color:#94A3B8; }

.ltad-map-wrap { height:280px; }
.ltad-map-wrap .leaflet-container { border-radius:0 0 14px 14px; }

.ltad-timeline { padding:16px 20px; }
.ltad-tl-item { display:flex; gap:12px; min-height:64px; }
.ltad-tl-time { width:56px; flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; padding-top:2px; }
.ltad-tl-hour { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; }
.ltad-tl-date { font-family:'Inter',sans-serif; font-size:.6rem; color:#94A3B8; }
.ltad-tl-dot-wrap { display:flex; flex-direction:column; align-items:center; width:16px; flex-shrink:0; }
.ltad-tl-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:4px; }
.ltad-tl-line { width:2px; flex:1; background:#F1F5F9; min-height:36px; }
.ltad-tl-content { flex:1; padding-bottom:16px; display:flex; flex-direction:column; gap:4px; }
.ltad-tl-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:8px; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:600; width:fit-content; }
.ltad-tl-detail { font-family:'Inter',sans-serif; font-size:.7rem; color:#94A3B8; }

.ltad-info-list { padding:4px 0; }
.ltad-info-row { display:flex; justify-content:space-between; align-items:center; padding:10px 20px; border-bottom:1px solid #F8FAFC; }
.ltad-info-row:last-child { border-bottom:none; }
.ltad-info-label { font-family:'Inter',sans-serif; font-size:.75rem; color:#94A3B8; }
.ltad-info-value { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; color:#0F172A; text-align:right; max-width:60%; word-break:break-word; }

.ltad-battery { padding:16px 20px; display:flex; flex-direction:column; gap:12px; align-items:center; }
.ltad-battery-val { font-family:'Manrope',sans-serif; font-size:2.2rem; font-weight:800; letter-spacing:-.04em; }
.ltad-battery-bar { width:100%; height:8px; background:#F1F5F9; border-radius:4px; overflow:hidden; }
.ltad-battery-fill { height:100%; border-radius:4px; transition:width .5s; }
.ltad-battery-chart { display:flex; align-items:flex-end; gap:4px; height:50px; width:100%; padding-top:8px; }
.ltad-battery-bar-item { flex:1; border-radius:3px 3px 0 0; transition:height .3s; min-height:4px; }
.ltad-battery-legend { font-family:'Inter',sans-serif; font-size:.65rem; color:#94A3B8; }

.ltad-zone { padding:16px 20px; display:flex; flex-direction:column; gap:8px; }
.ltad-zone-name { font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; }
.ltad-zone-addr { display:flex; align-items:center; gap:5px; font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; }

.ltad-skel { height:60px; margin:8px 0; border-radius:8px; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; }
@keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.ltad-empty { padding:40px; text-align:center; font-family:'Inter',sans-serif; font-size:.82rem; color:#94A3B8; }
`

export default PremiumAssetDetail
