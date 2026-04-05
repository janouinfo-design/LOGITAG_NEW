import {useState} from 'react'
import {MapContainer, TileLayer, Polygon, Popup} from 'react-leaflet'
import L from 'leaflet'
import {
  MapPin, Plus, Edit3, Trash2, Search, Shield,
  AlertTriangle, LogIn, LogOut, X, ChevronRight, Eye, Truck
} from 'lucide-react'

/* Fix Leaflet icons */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MOCK_ZONES = [
  {
    id: 1, name: 'Chantier Nord', type: 'chantier',
    color: '#2563EB',
    polygon: [[46.82, 7.14], [46.83, 7.14], [46.83, 7.16], [46.82, 7.16]],
    rules: {alertEntry: true, alertExit: true},
    assetsCount: 12, lastActivity: 'il y a 15 min',
  },
  {
    id: 2, name: 'Dépôt Central', type: 'depot',
    color: '#059669',
    polygon: [[46.80, 7.12], [46.81, 7.12], [46.81, 7.14], [46.80, 7.14]],
    rules: {alertEntry: false, alertExit: true},
    assetsCount: 8, lastActivity: 'il y a 1h',
  },
  {
    id: 3, name: 'Zone Interdite', type: 'restricted',
    color: '#DC2626',
    polygon: [[46.84, 7.10], [46.85, 7.10], [46.85, 7.12], [46.84, 7.12]],
    rules: {alertEntry: true, alertExit: false},
    assetsCount: 0, lastActivity: '—',
  },
  {
    id: 4, name: 'Parking VL', type: 'parking',
    color: '#D97706',
    polygon: [[46.79, 7.15], [46.80, 7.15], [46.80, 7.17], [46.79, 7.17]],
    rules: {alertEntry: false, alertExit: false},
    assetsCount: 5, lastActivity: 'il y a 45 min',
  },
]

const ZONE_TYPES = {
  chantier: {label: 'Chantier', color: '#2563EB', bg: '#EFF6FF'},
  depot: {label: 'Dépôt', color: '#059669', bg: '#ECFDF5'},
  restricted: {label: 'Zone restreinte', color: '#DC2626', bg: '#FEF2F2'},
  parking: {label: 'Parking', color: '#D97706', bg: '#FFFBEB'},
}

const PremiumZones = () => {
  const [zones] = useState(MOCK_ZONES)
  const [selectedZone, setSelectedZone] = useState(null)
  const [search, setSearch] = useState('')
  const [showDetail, setShowDetail] = useState(false)

  const filtered = zones.filter(z => {
    if (!search) return true
    return z.name.toLowerCase().includes(search.toLowerCase())
  })

  const totalAssets = zones.reduce((s, z) => s + z.assetsCount, 0)

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltz" data-testid="premium-zones">
        {/* Header */}
        <div className="ltz-header">
          <div>
            <h1 className="ltz-title" data-testid="zones-title">Zones</h1>
            <p className="ltz-sub">{zones.length} zones configurées - {totalAssets} assets au total</p>
          </div>
          <button className="ltz-add-btn" data-testid="zones-add-btn">
            <Plus size={16} /> Nouvelle zone
          </button>
        </div>

        {/* Stats */}
        <div className="ltz-stats" data-testid="zones-stats">
          {Object.entries(ZONE_TYPES).map(([key, cfg]) => {
            const count = zones.filter(z => z.type === key).length
            return (
              <div key={key} className="ltz-stat">
                <div className="ltz-stat-dot" style={{background: cfg.color}} />
                <span className="ltz-stat-val">{count}</span>
                <span className="ltz-stat-label">{cfg.label}</span>
              </div>
            )
          })}
        </div>

        <div className="ltz-content">
          {/* Map */}
          <div className="ltz-map-wrap" data-testid="zones-map">
            <MapContainer
              center={[46.815, 7.14]}
              zoom={12}
              style={{width: '100%', height: '100%'}}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
              />
              {zones.map(zone => (
                <Polygon
                  key={zone.id}
                  positions={zone.polygon}
                  pathOptions={{color: zone.color, fillColor: zone.color, fillOpacity: 0.15, weight: 2}}
                  eventHandlers={{click: () => {setSelectedZone(zone); setShowDetail(true);}}}
                >
                  <Popup>
                    <div style={{fontFamily: 'Inter, sans-serif', fontSize: '.82rem'}}>
                      <strong>{zone.name}</strong><br />
                      <span style={{color: '#64748B', fontSize: '.72rem'}}>{zone.assetsCount} assets</span>
                    </div>
                  </Popup>
                </Polygon>
              ))}
            </MapContainer>
          </div>

          {/* Zone List */}
          <div className="ltz-panel" data-testid="zones-panel">
            <div className="ltz-panel-search">
              <Search size={14} className="ltz-panel-search-ico" />
              <input className="ltz-panel-input" placeholder="Filtrer zones..." value={search} onChange={e => setSearch(e.target.value)} data-testid="zones-search" />
            </div>

            <div className="ltz-zone-list" data-testid="zones-list">
              {filtered.map((zone, i) => {
                const typeCfg = ZONE_TYPES[zone.type] || ZONE_TYPES.chantier
                const isActive = selectedZone?.id === zone.id
                return (
                  <div
                    key={zone.id}
                    className={`ltz-zone-item ${isActive ? 'ltz-zone-item--active' : ''}`}
                    onClick={() => {setSelectedZone(zone); setShowDetail(true);}}
                    data-testid={`zone-item-${i}`}
                  >
                    <div className="ltz-zone-color" style={{background: zone.color}} />
                    <div className="ltz-zone-info">
                      <span className="ltz-zone-name">{zone.name}</span>
                      <span className="ltz-zone-type" style={{color: typeCfg.color, background: typeCfg.bg}}>{typeCfg.label}</span>
                    </div>
                    <div className="ltz-zone-meta">
                      <span className="ltz-zone-count"><Truck size={11} /> {zone.assetsCount}</span>
                      <span className="ltz-zone-time">{zone.lastActivity}</span>
                    </div>
                    <ChevronRight size={14} className="ltz-zone-chevron" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Zone Detail Drawer */}
        {showDetail && selectedZone && (
          <div className="ltz-drawer" data-testid="zone-detail-drawer">
            <div className="ltz-drawer-head">
              <h3 className="ltz-drawer-title">{selectedZone.name}</h3>
              <button className="ltz-drawer-close" onClick={() => setShowDetail(false)} data-testid="zone-detail-close"><X size={16} /></button>
            </div>
            <div className="ltz-drawer-body">
              <div className="ltz-drawer-section">
                <span className="ltz-drawer-label">TYPE</span>
                <span className="ltz-drawer-badge" style={{color: ZONE_TYPES[selectedZone.type]?.color, background: ZONE_TYPES[selectedZone.type]?.bg}}>
                  {ZONE_TYPES[selectedZone.type]?.label}
                </span>
              </div>
              <div className="ltz-drawer-section">
                <span className="ltz-drawer-label">ASSETS</span>
                <span className="ltz-drawer-val">{selectedZone.assetsCount} actifs dans cette zone</span>
              </div>
              <div className="ltz-drawer-section">
                <span className="ltz-drawer-label">DERNIÈRE ACTIVITÉ</span>
                <span className="ltz-drawer-val">{selectedZone.lastActivity}</span>
              </div>
              <div className="ltz-drawer-section">
                <span className="ltz-drawer-label">RÈGLES D'ALERTE</span>
                <div className="ltz-drawer-rules">
                  <div className={`ltz-rule ${selectedZone.rules.alertEntry ? 'ltz-rule--on' : ''}`}>
                    <LogIn size={14} /> Alerte entrée
                    <span className="ltz-rule-status">{selectedZone.rules.alertEntry ? 'Activé' : 'Désactivé'}</span>
                  </div>
                  <div className={`ltz-rule ${selectedZone.rules.alertExit ? 'ltz-rule--on' : ''}`}>
                    <LogOut size={14} /> Alerte sortie
                    <span className="ltz-rule-status">{selectedZone.rules.alertExit ? 'Activé' : 'Désactivé'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ltz-drawer-footer">
              <button className="ltz-drawer-btn ltz-drawer-btn--outline"><Edit3 size={14} /> Modifier</button>
              <button className="ltz-drawer-btn ltz-drawer-btn--danger"><Trash2 size={14} /> Supprimer</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const STYLES = `
.ltz { max-width: 1400px; }
.ltz-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; }
.ltz-title { font-family:'Manrope',sans-serif; font-size:1.75rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.ltz-sub { font-family:'Inter',sans-serif; font-size:.875rem; color:#64748B; margin:4px 0 0; }
.ltz-add-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; border:none; background:#2563EB; color:#FFF; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.ltz-add-btn:hover { background:#1D4ED8; }

.ltz-stats { display:flex; gap:20px; margin-bottom:20px; flex-wrap:wrap; }
.ltz-stat { display:flex; align-items:center; gap:8px; padding:10px 18px; background:#FFF; border-radius:10px; border:1px solid #E2E8F0; }
.ltz-stat-dot { width:10px; height:10px; border-radius:50%; }
.ltz-stat-val { font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; }
.ltz-stat-label { font-family:'Inter',sans-serif; font-size:.75rem; color:#64748B; }

.ltz-content { display:grid; grid-template-columns:1fr 360px; gap:20px; height:calc(100vh - 280px); min-height:400px; }
@media(max-width:900px){ .ltz-content{ grid-template-columns:1fr; height:auto; } }

.ltz-map-wrap { border-radius:14px; overflow:hidden; border:1px solid #E2E8F0; min-height:400px; }
.ltz-map-wrap .leaflet-container { border-radius:14px; }

.ltz-panel { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; display:flex; flex-direction:column; overflow:hidden; }
.ltz-panel-search { position:relative; padding:14px 14px 10px; }
.ltz-panel-search-ico { position:absolute; left:26px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
.ltz-panel-input { width:100%; padding:9px 12px 9px 36px; border-radius:9px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-size:.8rem; font-family:'Inter',sans-serif; color:#0F172A; outline:none; transition:all .2s; }
.ltz-panel-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }

.ltz-zone-list { flex:1; overflow-y:auto; padding:0 8px 8px; }
.ltz-zone-item { display:flex; align-items:center; gap:10px; padding:12px; border-radius:10px; cursor:pointer; transition:background .1s; margin-bottom:2px; }
.ltz-zone-item:hover { background:#F8FAFC; }
.ltz-zone-item--active { background:#EFF6FF; }
.ltz-zone-color { width:4px; height:36px; border-radius:2px; flex-shrink:0; }
.ltz-zone-info { flex:1; display:flex; flex-direction:column; gap:4px; min-width:0; }
.ltz-zone-name { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; }
.ltz-zone-type { display:inline-flex; width:fit-content; padding:2px 8px; border-radius:5px; font-family:'Inter',sans-serif; font-size:.62rem; font-weight:600; }
.ltz-zone-meta { display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0; }
.ltz-zone-count { display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.7rem; color:#475569; font-weight:600; }
.ltz-zone-time { font-family:'Inter',sans-serif; font-size:.62rem; color:#94A3B8; }
.ltz-zone-chevron { color:#CBD5E1; flex-shrink:0; }

/* Drawer */
.ltz-drawer { position:fixed; top:0; right:0; width:380px; height:100vh; background:#FFF; border-left:1px solid #E2E8F0; z-index:200; box-shadow:-8px 0 30px rgba(0,0,0,.08); display:flex; flex-direction:column; animation:ltSlideIn .25s ease-out; }
@keyframes ltSlideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
.ltz-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:24px 24px 16px; border-bottom:1px solid #F1F5F9; }
.ltz-drawer-title { font-family:'Manrope',sans-serif; font-size:1.15rem; font-weight:800; color:#0F172A; margin:0; }
.ltz-drawer-close { width:32px; height:32px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.ltz-drawer-close:hover { border-color:#EF4444; color:#EF4444; }
.ltz-drawer-body { flex:1; padding:20px 24px; overflow-y:auto; }
.ltz-drawer-section { margin-bottom:20px; }
.ltz-drawer-label { display:block; font-family:'Manrope',sans-serif; font-size:.68rem; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
.ltz-drawer-val { font-family:'Inter',sans-serif; font-size:.85rem; color:#0F172A; }
.ltz-drawer-badge { display:inline-flex; padding:4px 12px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; }
.ltz-drawer-rules { display:flex; flex-direction:column; gap:8px; }
.ltz-rule { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.8rem; color:#94A3B8; }
.ltz-rule--on { border-color:#059669; color:#059669; background:#ECFDF5; }
.ltz-rule-status { margin-left:auto; font-size:.7rem; font-weight:600; }
.ltz-drawer-footer { display:flex; gap:10px; padding:16px 24px; border-top:1px solid #F1F5F9; }
.ltz-drawer-btn { display:inline-flex; align-items:center; gap:5px; padding:8px 16px; border-radius:8px; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:500; cursor:pointer; transition:all .12s; }
.ltz-drawer-btn--outline { flex:1; border:1.5px solid #E2E8F0; background:#FFF; color:#475569; }
.ltz-drawer-btn--outline:hover { border-color:#2563EB; color:#2563EB; }
.ltz-drawer-btn--danger { border:1.5px solid #FEE2E2; background:#FEF2F2; color:#DC2626; }
.ltz-drawer-btn--danger:hover { background:#FEE2E2; }
`

export default PremiumZones
