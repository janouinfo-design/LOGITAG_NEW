import {useState} from 'react'
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'
import L from 'leaflet'
import {
  ArrowLeft, MapPin, Battery, Radio, Clock, Box, Tag,
  Building2, Calendar, Signal, ChevronRight, Shield,
  Truck, CheckCircle, AlertTriangle, TrendingUp
} from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MOCK_ASSET = {
  name: 'Benne 35m3 Mobiliti',
  reference: 'BEN-35M3-001',
  tag: 'BLE-0042',
  family: 'Benne',
  status: 'Actif',
  client: 'Omniyat SA',
  site: 'Lausanne - Dépôt Central',
  created: '12/03/2024',
  lastSeen: 'Il y a 3 min',
  battery: 78,
  signal: -65,
  lat: 46.5197,
  lng: 6.6323,
  zone: 'Dépôt Central',
  zoneSince: '2h 15min',
}

const MOCK_TIMELINE = [
  {time: '10:45', date: "Aujourd'hui", type: 'enter', text: 'Entrée zone "Dépôt Central"', detail: 'Détecté par GW-873276'},
  {time: '09:32', date: "Aujourd'hui", type: 'exit', text: 'Sortie zone "Chantier Nord"', detail: 'Durée de présence: 4h 12min'},
  {time: '09:12', date: "Aujourd'hui", type: 'gateway', text: 'Détecté par Gateway "Pradervand"', detail: 'Signal: -58 dBm'},
  {time: '05:20', date: "Aujourd'hui", type: 'enter', text: 'Entrée zone "Chantier Nord"', detail: 'Détecté par GW-F0A882'},
  {time: '23:45', date: 'Hier', type: 'alert', text: 'Batterie faible détectée', detail: 'Niveau: 15% → Rechargé à 78%'},
  {time: '18:10', date: 'Hier', type: 'exit', text: 'Sortie zone "Dépôt Central"', detail: 'Transport vers Chantier Nord'},
  {time: '08:00', date: 'Hier', type: 'gateway', text: 'Scan matinal Gateway "Depot"', detail: '12 assets détectés'},
]

const typeConfig = {
  enter: {color: '#059669', bg: '#ECFDF5', icon: CheckCircle},
  exit: {color: '#D97706', bg: '#FFFBEB', icon: ArrowLeft},
  gateway: {color: '#2563EB', bg: '#EFF6FF', icon: Radio},
  alert: {color: '#DC2626', bg: '#FEF2F2', icon: AlertTriangle},
}

const PremiumAssetDetailPreview = () => {
  const a = MOCK_ASSET

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltad" data-testid="asset-detail-preview">
        {/* Breadcrumb */}
        <div className="ltad-bread" data-testid="asset-detail-breadcrumb">
          <button className="ltad-back"><ArrowLeft size={16} /> Assets</button>
          <ChevronRight size={14} className="ltad-bread-sep" />
          <span className="ltad-bread-current">{a.reference}</span>
        </div>

        {/* Hero header */}
        <div className="ltad-hero" data-testid="asset-detail-hero">
          <div className="ltad-hero-left">
            <div className="ltad-hero-icon"><Truck size={28} style={{color: '#2563EB'}} /></div>
            <div>
              <h1 className="ltad-hero-name">{a.name}</h1>
              <p className="ltad-hero-ref">{a.reference} &middot; Tag: {a.tag}</p>
            </div>
          </div>
          <div className="ltad-hero-right">
            <span className="ltad-badge ltad-badge--active"><CheckCircle size={12} /> {a.status}</span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="ltad-grid">
          {/* Main column */}
          <div className="ltad-main">
            {/* Mini Map */}
            <div className="ltad-card" data-testid="asset-detail-map">
              <div className="ltad-card-head">
                <h3><MapPin size={16} /> Position actuelle</h3>
                <span className="ltad-card-sub">Dernière mise à jour: {a.lastSeen}</span>
              </div>
              <div className="ltad-map-wrap">
                <MapContainer center={[a.lat, a.lng]} zoom={14} style={{width: '100%', height: '100%'}} zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="CARTO" />
                  <Marker position={[a.lat, a.lng]}>
                    <Popup>{a.name}<br />{a.site}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="ltad-card" data-testid="asset-detail-timeline">
              <div className="ltad-card-head">
                <h3><Clock size={16} /> Journal d'activité</h3>
                <button className="ltad-card-action">Voir tout <ChevronRight size={13} /></button>
              </div>
              <div className="ltad-timeline">
                {MOCK_TIMELINE.map((evt, i) => {
                  const cfg = typeConfig[evt.type]
                  const Icon = cfg.icon
                  return (
                    <div key={i} className="ltad-tl-item" data-testid={`timeline-item-${i}`}>
                      <div className="ltad-tl-time">
                        <span className="ltad-tl-hour">{evt.time}</span>
                        <span className="ltad-tl-date">{evt.date}</span>
                      </div>
                      <div className="ltad-tl-dot-wrap">
                        <div className="ltad-tl-dot" style={{background: cfg.color}} />
                        {i < MOCK_TIMELINE.length - 1 && <div className="ltad-tl-line" />}
                      </div>
                      <div className="ltad-tl-content">
                        <div className="ltad-tl-badge" style={{background: cfg.bg, color: cfg.color}}>
                          <Icon size={12} /> {evt.text}
                        </div>
                        <span className="ltad-tl-detail">{evt.detail}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar column */}
          <div className="ltad-side">
            {/* Details card */}
            <div className="ltad-card" data-testid="asset-detail-info">
              <div className="ltad-card-head"><h3><Box size={16} /> Détails</h3></div>
              <div className="ltad-info-list">
                <InfoRow label="Référence" value={a.reference} />
                <InfoRow label="Famille" value={a.family} />
                <InfoRow label="Client" value={a.client} />
                <InfoRow label="Site" value={a.site} />
                <InfoRow label="Créé le" value={a.created} />
                <InfoRow label="Dernier signal" value={a.lastSeen} />
              </div>
            </div>

            {/* Battery card */}
            <div className="ltad-card" data-testid="asset-detail-battery">
              <div className="ltad-card-head"><h3><Battery size={16} /> Batterie</h3></div>
              <div className="ltad-battery">
                <div className="ltad-battery-val">{a.battery}%</div>
                <div className="ltad-battery-bar">
                  <div
                    className="ltad-battery-fill"
                    style={{
                      width: `${a.battery}%`,
                      background: a.battery > 50 ? '#059669' : a.battery > 20 ? '#D97706' : '#DC2626'
                    }}
                  />
                </div>
                <div className="ltad-battery-chart">
                  {[65, 70, 68, 55, 42, 30, 15, 78].map((v, i) => (
                    <div key={i} className="ltad-battery-bar-item" style={{height: `${v}%`, background: v > 50 ? '#DBEAFE' : v > 20 ? '#FEF3C7' : '#FEE2E2'}} />
                  ))}
                </div>
                <span className="ltad-battery-legend">7 derniers jours</span>
              </div>
            </div>

            {/* Tag card */}
            <div className="ltad-card" data-testid="asset-detail-tag">
              <div className="ltad-card-head"><h3><Tag size={16} /> Tag BLE associé</h3></div>
              <div className="ltad-info-list">
                <InfoRow label="ID Tag" value={a.tag} />
                <InfoRow label="Signal" value={`${a.signal} dBm`} />
                <InfoRow label="Dernière comm." value="10:45" />
                <InfoRow label="Type" value="BLE Beacon v3" />
              </div>
            </div>

            {/* Zone card */}
            <div className="ltad-card" data-testid="asset-detail-zone">
              <div className="ltad-card-head"><h3><Shield size={16} /> Zone actuelle</h3></div>
              <div className="ltad-zone">
                <div className="ltad-zone-name">{a.zone}</div>
                <div className="ltad-zone-since">
                  <Clock size={12} /> Présent depuis <strong>{a.zoneSince}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const InfoRow = ({label, value}) => (
  <div className="ltad-info-row">
    <span className="ltad-info-label">{label}</span>
    <span className="ltad-info-value">{value}</span>
  </div>
)

const STYLES = `
.ltad { max-width:1400px; }

/* Breadcrumb */
.ltad-bread { display:flex; align-items:center; gap:8px; margin-bottom:20px; }
.ltad-back { display:inline-flex; align-items:center; gap:6px; border:none; background:none; color:#2563EB; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; padding:0; }
.ltad-back:hover { text-decoration:underline; }
.ltad-bread-sep { color:#CBD5E1; }
.ltad-bread-current { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; }

/* Hero */
.ltad-hero { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; gap:16px; flex-wrap:wrap; }
.ltad-hero-left { display:flex; align-items:center; gap:16px; }
.ltad-hero-icon { width:56px; height:56px; border-radius:14px; background:#EFF6FF; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ltad-hero-name { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; color:#0F172A; letter-spacing:-.03em; margin:0; }
.ltad-hero-ref { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:4px 0 0; }
.ltad-badge { display:inline-flex; align-items:center; gap:5px; padding:6px 16px; border-radius:20px; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; }
.ltad-badge--active { background:#ECFDF5; color:#059669; }

/* Grid */
.ltad-grid { display:grid; grid-template-columns:1fr 360px; gap:24px; }
@media(max-width:1024px){ .ltad-grid{ grid-template-columns:1fr; } }
.ltad-main { display:flex; flex-direction:column; gap:20px; }
.ltad-side { display:flex; flex-direction:column; gap:16px; }

/* Card */
.ltad-card { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; }
.ltad-card-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #F1F5F9; }
.ltad-card-head h3 { display:flex; align-items:center; gap:8px; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; color:#0F172A; margin:0; }
.ltad-card-sub { font-family:'Inter',sans-serif; font-size:.7rem; color:#94A3B8; }
.ltad-card-action { display:inline-flex; align-items:center; gap:3px; border:none; background:none; color:#2563EB; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; cursor:pointer; }

/* Map */
.ltad-map-wrap { height:280px; }
.ltad-map-wrap .leaflet-container { border-radius:0 0 14px 14px; }

/* Timeline */
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

/* Info list */
.ltad-info-list { padding:4px 0; }
.ltad-info-row { display:flex; justify-content:space-between; align-items:center; padding:10px 20px; border-bottom:1px solid #F8FAFC; }
.ltad-info-row:last-child { border-bottom:none; }
.ltad-info-label { font-family:'Inter',sans-serif; font-size:.75rem; color:#94A3B8; }
.ltad-info-value { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; color:#0F172A; }

/* Battery */
.ltad-battery { padding:16px 20px; display:flex; flex-direction:column; gap:12px; align-items:center; }
.ltad-battery-val { font-family:'Manrope',sans-serif; font-size:2.2rem; font-weight:800; color:#059669; letter-spacing:-.04em; }
.ltad-battery-bar { width:100%; height:8px; background:#F1F5F9; border-radius:4px; overflow:hidden; }
.ltad-battery-fill { height:100%; border-radius:4px; transition:width .5s; }
.ltad-battery-chart { display:flex; align-items:flex-end; gap:4px; height:50px; width:100%; padding-top:8px; }
.ltad-battery-bar-item { flex:1; border-radius:3px 3px 0 0; transition:height .3s; min-height:4px; }
.ltad-battery-legend { font-family:'Inter',sans-serif; font-size:.65rem; color:#94A3B8; }

/* Zone */
.ltad-zone { padding:16px 20px; display:flex; flex-direction:column; gap:8px; }
.ltad-zone-name { font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; }
.ltad-zone-since { display:flex; align-items:center; gap:5px; font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; }
.ltad-zone-since strong { color:#2563EB; }
`

export default PremiumAssetDetailPreview
