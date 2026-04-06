import {useState, useRef, useCallback, useEffect} from 'react'
import {MapContainer, TileLayer, Polygon, Circle, Popup, useMapEvents, useMap} from 'react-leaflet'
import L from 'leaflet'
import {useWebSocket} from '../../hooks/useWebSocket'
import {
  MapPin, Plus, Edit3, Trash2, Search, Shield, Circle as CircleIcon,
  AlertTriangle, LogIn, LogOut, X, ChevronRight, Eye, Truck,
  Hexagon, Move, Target, Ruler, Pencil, Check, RotateCcw, Loader2, Wifi
} from 'lucide-react'

const API = process.env.REACT_APP_BACKEND_URL

/* Fix Leaflet icons */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const ZONE_TYPES = {
  chantier: {label: 'Chantier', color: '#2563EB', bg: '#EFF6FF'},
  depot: {label: 'Dépôt', color: '#059669', bg: '#ECFDF5'},
  restricted: {label: 'Zone restreinte', color: '#DC2626', bg: '#FEF2F2'},
  parking: {label: 'Parking', color: '#D97706', bg: '#FFFBEB'},
}

const DEFAULT_ZONES = [
  {
    id: 'default-1', name: 'Chantier Nord', type: 'chantier', shape: 'polygon',
    color: '#2563EB',
    polygon: [[46.82, 7.14], [46.83, 7.14], [46.83, 7.16], [46.82, 7.16]],
    center: null, radius: null,
    alertEntry: true, alertExit: true,
    assetsCount: 12, lastActivity: 'il y a 15 min',
  },
  {
    id: 'default-2', name: 'Dépôt Central', type: 'depot', shape: 'circle',
    color: '#059669',
    polygon: null,
    center: [46.805, 7.13], radius: 350,
    alertEntry: false, alertExit: true,
    assetsCount: 8, lastActivity: 'il y a 1h',
  },
  {
    id: 'default-3', name: 'Zone Interdite', type: 'restricted', shape: 'polygon',
    color: '#DC2626',
    polygon: [[46.84, 7.10], [46.85, 7.10], [46.85, 7.12], [46.84, 7.12]],
    center: null, radius: null,
    alertEntry: true, alertExit: false,
    assetsCount: 0, lastActivity: '—',
  },
  {
    id: 'default-4', name: 'Parking VL', type: 'parking', shape: 'circle',
    color: '#D97706',
    polygon: null,
    center: [46.795, 7.155], radius: 200,
    alertEntry: false, alertExit: false,
    assetsCount: 5, lastActivity: 'il y a 45 min',
  },
]

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INTERACTIVE MAP DRAWING COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const DrawController = ({ drawMode, drawShape, onCircleDrawn, onPolygonDrawn, onDrawProgress, previewColor }) => {
  const [circleCenter, setCircleCenter] = useState(null)
  const [polygonPoints, setPolygonPoints] = useState([])
  const map = useMap()

  useEffect(() => {
    if (!drawMode) {
      setCircleCenter(null)
      setPolygonPoints([])
    }
  }, [drawMode])

  // Change cursor when drawing
  useEffect(() => {
    const container = map.getContainer()
    if (drawMode) {
      container.style.cursor = 'crosshair'
    } else {
      container.style.cursor = ''
    }
    return () => { container.style.cursor = '' }
  }, [drawMode, map])

  useMapEvents({
    click(e) {
      if (!drawMode) return
      const {lat, lng} = e.latlng

      if (drawShape === 'circle') {
        if (!circleCenter) {
          setCircleCenter([lat, lng])
          onDrawProgress?.({type: 'circle_center', center: [lat, lng]})
        } else {
          const dist = map.distance(L.latLng(circleCenter[0], circleCenter[1]), e.latlng)
          onCircleDrawn({center: circleCenter, radius: Math.round(dist)})
          setCircleCenter(null)
        }
      } else {
        // polygon
        const newPts = [...polygonPoints, [lat, lng]]
        setPolygonPoints(newPts)
        onDrawProgress?.({type: 'polygon_points', points: newPts})
      }
    },
    dblclick(e) {
      if (!drawMode || drawShape !== 'polygon') return
      if (polygonPoints.length >= 3) {
        onPolygonDrawn({points: [...polygonPoints]})
        setPolygonPoints([])
      }
    },
    mousemove(e) {
      if (!drawMode) return
      if (drawShape === 'circle' && circleCenter) {
        const dist = map.distance(L.latLng(circleCenter[0], circleCenter[1]), e.latlng)
        onDrawProgress?.({type: 'circle_preview', center: circleCenter, radius: Math.round(dist)})
      }
    }
  })

  return (
    <>
      {/* Preview circle while drawing */}
      {circleCenter && (
        <Circle
          center={circleCenter}
          radius={10}
          pathOptions={{color: previewColor, fillColor: previewColor, fillOpacity: 0.3, weight: 2, dashArray: '6 3'}}
        />
      )}
      {/* Preview polygon points */}
      {polygonPoints.length >= 2 && (
        <Polygon
          positions={polygonPoints}
          pathOptions={{color: previewColor, fillColor: previewColor, fillOpacity: 0.15, weight: 2, dashArray: '6 3'}}
        />
      )}
    </>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const PremiumZones = () => {
  const [zones, setZones] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)
  const [search, setSearch] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [editZone, setEditZone] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Draw mode state
  const [drawMode, setDrawMode] = useState(false)
  const [drawShape, setDrawShape] = useState('circle')
  const [drawPreview, setDrawPreview] = useState(null)

  // Fetch zones from API
  const fetchZones = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/zones`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setZones(data)
      } else if (Array.isArray(data) && data.length === 0 && !loading) {
        // DB empty, keep what we have
      } else {
        setZones(DEFAULT_ZONES)
      }
    } catch {
      setZones(DEFAULT_ZONES)
    }
    setLoading(false)
  }, [loading])

  useEffect(() => { fetchZones() }, [])

  // WebSocket real-time
  const {connected} = useWebSocket(useCallback((msg) => {
    if (['zone_created', 'zone_updated', 'zone_deleted'].includes(msg.type)) {
      fetchZones()
    }
  }, [fetchZones]))

  const filtered = zones.filter(z => {
    if (!search) return true
    return z.name.toLowerCase().includes(search.toLowerCase())
  })

  const totalAssets = zones.reduce((s, z) => s + z.assetsCount, 0)

  const openEdit = (zone) => {
    setEditForm({
      name: zone?.name || '',
      type: zone?.type || 'chantier',
      shape: zone?.shape || 'circle',
      color: zone?.color || '#2563EB',
      alertEntry: zone?.alertEntry ?? false,
      alertExit: zone?.alertExit ?? false,
      center: zone?.center || null,
      radius: zone?.radius || 200,
      polygon: zone?.polygon || null,
    })
    setEditZone(zone || {id: null})
    setDrawMode(false)
    setDrawPreview(null)
  }

  const startDrawOnMap = () => {
    setDrawMode(true)
    setDrawPreview(null)
    setEditZone(null) // close modal, let user draw on map
  }

  const cancelDraw = () => {
    setDrawMode(false)
    setDrawPreview(null)
  }

  const handleCircleDrawn = ({center, radius}) => {
    setDrawMode(false)
    setEditForm(prev => ({...prev, center, radius, shape: 'circle'}))
    // Reopen edit modal with data
    setEditZone(prev => prev || {id: null})
    setDrawPreview(null)
    // Open modal
    setEditZone({id: null})
  }

  const handlePolygonDrawn = ({points}) => {
    setDrawMode(false)
    setEditForm(prev => ({...prev, polygon: points, shape: 'polygon'}))
    setDrawPreview(null)
    setEditZone({id: null})
  }

  const saveZone = async () => {
    setSaving(true)
    const zoneData = {
      name: editForm.name,
      type: editForm.type,
      shape: editForm.shape,
      color: editForm.color,
      alertEntry: editForm.alertEntry,
      alertExit: editForm.alertExit,
      center: editForm.shape === 'circle' ? (editForm.center || [46.815, 7.14]) : null,
      radius: editForm.shape === 'circle' ? (editForm.radius || 200) : null,
      polygon: editForm.shape === 'polygon' ? (editForm.polygon || [[46.81, 7.13], [46.82, 7.13], [46.82, 7.15], [46.81, 7.15]]) : null,
    }

    try {
      if (editZone.id && !editZone.id.startsWith('default-')) {
        // Update existing zone
        await fetch(`${API}/api/zones/${editZone.id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(zoneData),
        })
      } else {
        // Create new zone
        await fetch(`${API}/api/zones`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(zoneData),
        })
      }
      await fetchZones()
    } catch (err) {
      // Fallback to local
      if (editZone.id) {
        setZones(prev => prev.map(z => z.id === editZone.id ? {...z, ...zoneData} : z))
      } else {
        setZones(prev => [...prev, {id: 'local-' + Date.now(), ...zoneData, assetsCount: 0, lastActivity: '—'}])
      }
    }
    setSaving(false)
    setEditZone(null)
    setShowDetail(false)
  }

  const deleteZone = async (zoneId) => {
    try {
      if (!zoneId.startsWith('default-')) {
        await fetch(`${API}/api/zones/${zoneId}`, {method: 'DELETE'})
      }
      await fetchZones()
    } catch {
      setZones(prev => prev.filter(z => z.id !== zoneId))
    }
    setShowDetail(false)
    setSelectedZone(null)
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltz" data-testid="premium-zones">
        {/* Header */}
        <div className="ltz-header">
          <div>
            <h1 className="ltz-title" data-testid="zones-title">Zones</h1>
            <p className="ltz-sub">{zones.length} zones configurées - {totalAssets} assets au total {connected && <span className="ltz-ws-live"><Wifi size={10} /> Live</span>}</p>
          </div>
          <div className="ltz-header-actions">
            {!drawMode ? (
              <button className="ltz-add-btn" onClick={() => openEdit(null)} data-testid="zones-add-btn">
                <Plus size={16} /> Nouvelle zone
              </button>
            ) : (
              <button className="ltz-cancel-draw-btn" onClick={cancelDraw} data-testid="cancel-draw-btn">
                <X size={16} /> Annuler le dessin
              </button>
            )}
          </div>
        </div>

        {/* Draw Mode Banner */}
        {drawMode && (
          <div className="ltz-draw-banner" data-testid="draw-banner">
            <Target size={18} className="ltz-draw-banner-ico" />
            <div className="ltz-draw-banner-text">
              <strong>Mode dessin actif</strong>
              {drawShape === 'circle' ? (
                <span>Cliquez sur la carte pour placer le centre, puis cliquez une 2ème fois pour définir le rayon</span>
              ) : (
                <span>Cliquez pour ajouter des points. Double-cliquez pour terminer (min. 3 points)</span>
              )}
            </div>
            {drawPreview?.type === 'circle_preview' && (
              <span className="ltz-draw-radius-badge">
                <Ruler size={12} /> {drawPreview.radius} m
              </span>
            )}
          </div>
        )}

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
          <div className="ltz-stat">
            <CircleIcon size={12} style={{color: '#8B5CF6'}} />
            <span className="ltz-stat-val">{zones.filter(z => z.shape === 'circle').length}</span>
            <span className="ltz-stat-label">Cercles</span>
          </div>
          <div className="ltz-stat">
            <Hexagon size={12} style={{color: '#0EA5E9'}} />
            <span className="ltz-stat-val">{zones.filter(z => z.shape === 'polygon').length}</span>
            <span className="ltz-stat-label">Polygones</span>
          </div>
        </div>

        <div className="ltz-content">
          {/* Map */}
          <div className="ltz-map-wrap" data-testid="zones-map">
            <MapContainer
              center={[46.815, 7.14]}
              zoom={12}
              style={{width: '100%', height: '100%'}}
              zoomControl={false}
              doubleClickZoom={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
              />

              {/* Draw Controller */}
              <DrawController
                drawMode={drawMode}
                drawShape={drawShape}
                onCircleDrawn={handleCircleDrawn}
                onPolygonDrawn={handlePolygonDrawn}
                onDrawProgress={setDrawPreview}
                previewColor={editForm.color || '#2563EB'}
              />

              {/* Render zones */}
              {zones.map(zone => {
                if (zone.shape === 'circle' && zone.center) {
                  return (
                    <Circle
                      key={zone.id}
                      center={zone.center}
                      radius={zone.radius || 200}
                      pathOptions={{color: zone.color, fillColor: zone.color, fillOpacity: 0.15, weight: 2}}
                      eventHandlers={{click: () => {setSelectedZone(zone); setShowDetail(true);}}}
                    >
                      <Popup>
                        <div style={{fontFamily: 'Inter, sans-serif', fontSize: '.82rem'}}>
                          <strong>{zone.name}</strong><br />
                          <span style={{color: '#64748B', fontSize: '.72rem'}}>{zone.assetsCount} assets - Rayon: {zone.radius}m</span>
                        </div>
                      </Popup>
                    </Circle>
                  )
                }
                if (zone.polygon) {
                  return (
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
                  )
                }
                return null
              })}

              {/* Preview while drawing */}
              {drawPreview?.type === 'circle_preview' && (
                <Circle
                  center={drawPreview.center}
                  radius={drawPreview.radius}
                  pathOptions={{color: editForm.color || '#2563EB', fillColor: editForm.color || '#2563EB', fillOpacity: 0.2, weight: 2, dashArray: '8 4'}}
                />
              )}
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
                      <div className="ltz-zone-name-row">
                        <span className="ltz-zone-name">{zone.name}</span>
                        {zone.shape === 'circle' ? (
                          <CircleIcon size={11} style={{color: '#8B5CF6', flexShrink: 0}} />
                        ) : (
                          <Hexagon size={11} style={{color: '#0EA5E9', flexShrink: 0}} />
                        )}
                      </div>
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
                <span className="ltz-drawer-label">FORME</span>
                <span className="ltz-drawer-shape-badge">
                  {selectedZone.shape === 'circle' ? <><CircleIcon size={14} /> Cercle</> : <><Hexagon size={14} /> Polygone</>}
                </span>
              </div>
              {selectedZone.shape === 'circle' && selectedZone.center && (
                <div className="ltz-drawer-section">
                  <span className="ltz-drawer-label">DIMENSIONS</span>
                  <div className="ltz-drawer-dims">
                    <div className="ltz-dim-item">
                      <Target size={13} />
                      <span>Centre: {selectedZone.center[0].toFixed(4)}, {selectedZone.center[1].toFixed(4)}</span>
                    </div>
                    <div className="ltz-dim-item">
                      <Ruler size={13} />
                      <span>Rayon: {selectedZone.radius} m</span>
                    </div>
                  </div>
                </div>
              )}
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
                  <div className={`ltz-rule ${selectedZone.alertEntry ? 'ltz-rule--on' : ''}`}>
                    <LogIn size={14} /> Alerte entrée
                    <span className="ltz-rule-status">{selectedZone.alertEntry ? 'Activé' : 'Désactivé'}</span>
                  </div>
                  <div className={`ltz-rule ${selectedZone.alertExit ? 'ltz-rule--on' : ''}`}>
                    <LogOut size={14} /> Alerte sortie
                    <span className="ltz-rule-status">{selectedZone.alertExit ? 'Activé' : 'Désactivé'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ltz-drawer-footer">
              <button className="ltz-drawer-btn ltz-drawer-btn--outline" onClick={() => openEdit(selectedZone)} data-testid="zone-edit-btn"><Edit3 size={14} /> Modifier</button>
              <button className="ltz-drawer-btn ltz-drawer-btn--danger" onClick={() => deleteZone(selectedZone.id)} data-testid="zone-delete-btn"><Trash2 size={14} /> Supprimer</button>
            </div>
          </div>
        )}

        {/* Zone Edit Modal */}
        {editZone && (
          <div className="ltz-modal-bg" onClick={() => setEditZone(null)} data-testid="zone-edit-overlay">
            <div className="ltz-modal" onClick={(e) => e.stopPropagation()} data-testid="zone-edit-modal">
              <div className="ltz-modal-head">
                <h2>{editZone.id ? 'Modifier la zone' : 'Nouvelle zone'}</h2>
                <button className="ltz-modal-close" onClick={() => setEditZone(null)}><X size={18} /></button>
              </div>
              <div className="ltz-modal-body">
                <div className="ltz-edit-field">
                  <label>Nom de la zone</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({...p, name: e.target.value}))} placeholder="Ex: Chantier Nord" data-testid="zone-edit-name" />
                </div>

                {/* Shape Selector */}
                <div className="ltz-edit-field">
                  <label>Forme de la zone</label>
                  <div className="ltz-shape-selector" data-testid="zone-shape-selector">
                    <button
                      className={`ltz-shape-opt ${editForm.shape === 'circle' ? 'ltz-shape-opt--active' : ''}`}
                      onClick={() => setEditForm(p => ({...p, shape: 'circle'}))}
                      data-testid="shape-circle-btn"
                    >
                      <CircleIcon size={20} />
                      <span>Cercle</span>
                      <small>Centre + rayon</small>
                    </button>
                    <button
                      className={`ltz-shape-opt ${editForm.shape === 'polygon' ? 'ltz-shape-opt--active' : ''}`}
                      onClick={() => setEditForm(p => ({...p, shape: 'polygon'}))}
                      data-testid="shape-polygon-btn"
                    >
                      <Hexagon size={20} />
                      <span>Polygone</span>
                      <small>Points personnalisés</small>
                    </button>
                  </div>
                </div>

                {/* Circle specific: radius slider */}
                {editForm.shape === 'circle' && (
                  <div className="ltz-edit-field">
                    <label>Rayon ({editForm.radius || 200} m)</label>
                    <input
                      type="range"
                      min="50"
                      max="2000"
                      step="10"
                      value={editForm.radius || 200}
                      onChange={(e) => setEditForm(p => ({...p, radius: parseInt(e.target.value)}))}
                      className="ltz-range"
                      data-testid="zone-radius-slider"
                    />
                    <div className="ltz-range-labels">
                      <span>50m</span>
                      <span>2000m</span>
                    </div>
                  </div>
                )}

                {/* Draw on map button */}
                <div className="ltz-edit-field">
                  <label>Dessiner sur la carte</label>
                  <button
                    className="ltz-draw-map-btn"
                    onClick={() => { setDrawShape(editForm.shape); startDrawOnMap(); }}
                    data-testid="draw-on-map-btn"
                  >
                    <Pencil size={16} />
                    {editForm.shape === 'circle'
                      ? 'Dessiner le cercle sur la carte'
                      : 'Dessiner le polygone sur la carte'}
                  </button>
                  {editForm.center && editForm.shape === 'circle' && (
                    <div className="ltz-draw-result">
                      <Check size={13} style={{color: '#059669'}} />
                      <span>Centre: {editForm.center[0].toFixed(4)}, {editForm.center[1].toFixed(4)} | Rayon: {editForm.radius}m</span>
                    </div>
                  )}
                  {editForm.polygon && editForm.shape === 'polygon' && (
                    <div className="ltz-draw-result">
                      <Check size={13} style={{color: '#059669'}} />
                      <span>Polygone: {editForm.polygon.length} points</span>
                    </div>
                  )}
                </div>

                <div className="ltz-edit-row">
                  <div className="ltz-edit-field" style={{flex: 1}}>
                    <label>Type</label>
                    <select value={editForm.type} onChange={(e) => setEditForm(p => ({...p, type: e.target.value}))} data-testid="zone-edit-type">
                      {Object.entries(ZONE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div className="ltz-edit-field" style={{flex: 1}}>
                    <label>Couleur</label>
                    <div className="ltz-color-row">
                      {['#2563EB', '#059669', '#DC2626', '#D97706', '#8B5CF6', '#EC4899'].map(c => (
                        <button key={c} className={`ltz-color-btn ${editForm.color === c ? 'ltz-color-btn--active' : ''}`} style={{background: c}} onClick={() => setEditForm(p => ({...p, color: c}))} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ltz-edit-field">
                  <label>Règles d'alerte</label>
                  <div className="ltz-toggle-row">
                    <label className="ltz-toggle-label" data-testid="zone-edit-alert-entry">
                      <input type="checkbox" checked={editForm.alertEntry} onChange={(e) => setEditForm(p => ({...p, alertEntry: e.target.checked}))} />
                      <span className="ltz-toggle-switch" />
                      <LogIn size={14} /> Alerte entrée
                    </label>
                    <label className="ltz-toggle-label" data-testid="zone-edit-alert-exit">
                      <input type="checkbox" checked={editForm.alertExit} onChange={(e) => setEditForm(p => ({...p, alertExit: e.target.checked}))} />
                      <span className="ltz-toggle-switch" />
                      <LogOut size={14} /> Alerte sortie
                    </label>
                  </div>
                </div>
              </div>
              <div className="ltz-modal-foot">
                <button className="ltz-modal-btn ltz-modal-btn--cancel" onClick={() => setEditZone(null)}>Annuler</button>
                <button className="ltz-modal-btn ltz-modal-btn--save" onClick={saveZone} disabled={saving} data-testid="zone-save-btn">
                  {saving ? <><Loader2 size={14} className="ltz-spin" /> Enregistrement...</> : 'Enregistrer'}
                </button>
              </div>
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
.ltz-header-actions { display:flex; gap:8px; }
.ltz-title { font-family:'Manrope',sans-serif; font-size:1.75rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.ltz-sub { font-family:'Inter',sans-serif; font-size:.875rem; color:#64748B; margin:4px 0 0; }
.ltz-add-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; border:none; background:#2563EB; color:#FFF; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.ltz-add-btn:hover { background:#1D4ED8; }
.ltz-ws-live { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:10px; background:#ECFDF5; color:#059669; font-size:.65rem; font-weight:700; animation:ltzLivePulse 2s ease infinite; }
@keyframes ltzLivePulse { 0%,100%{opacity:1;} 50%{opacity:.6;} }
.ltz-spin { animation:ltzSpinAnim 1s linear infinite; }
@keyframes ltzSpinAnim { from{transform:rotate(0)} to{transform:rotate(360deg)} }
.ltz-cancel-draw-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; border:none; background:#EF4444; color:#FFF; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; }
.ltz-cancel-draw-btn:hover { background:#DC2626; }

/* Draw Banner */
.ltz-draw-banner { display:flex; align-items:center; gap:14px; padding:14px 20px; margin-bottom:16px; background:linear-gradient(135deg,#EFF6FF,#DBEAFE); border:1.5px solid #93C5FD; border-radius:12px; animation:ltzPulse 2s ease infinite; }
@keyframes ltzPulse { 0%,100%{border-color:#93C5FD;} 50%{border-color:#2563EB;} }
.ltz-draw-banner-ico { color:#2563EB; flex-shrink:0; animation:ltzSpin 3s linear infinite; }
@keyframes ltzSpin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
.ltz-draw-banner-text { flex:1; }
.ltz-draw-banner-text strong { display:block; font-family:'Manrope',sans-serif; font-size:.82rem; color:#1E40AF; }
.ltz-draw-banner-text span { font-family:'Inter',sans-serif; font-size:.72rem; color:#3B82F6; }
.ltz-draw-radius-badge { display:inline-flex; align-items:center; gap:4px; padding:6px 14px; border-radius:8px; background:#2563EB; color:#FFF; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; flex-shrink:0; }

.ltz-stats { display:flex; gap:20px; margin-bottom:20px; flex-wrap:wrap; }
.ltz-stat { display:flex; align-items:center; gap:8px; padding:10px 18px; background:#FFF; border-radius:10px; border:1px solid #E2E8F0; }
.ltz-stat-dot { width:10px; height:10px; border-radius:50%; }
.ltz-stat-val { font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; }
.ltz-stat-label { font-family:'Inter',sans-serif; font-size:.75rem; color:#64748B; }

.ltz-content { display:grid; grid-template-columns:1fr 360px; gap:20px; height:calc(100vh - 320px); min-height:400px; }
@media(max-width:900px){ .ltz-content{ grid-template-columns:1fr; height:auto; } }

.ltz-map-wrap { border-radius:14px; overflow:hidden; border:1px solid #E2E8F0; min-height:400px; position:relative; }
.ltz-map-wrap .leaflet-container { border-radius:14px; }

.ltz-panel { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; display:flex; flex-direction:column; overflow:hidden; }
.ltz-panel-search { position:relative; padding:14px 14px 10px; }
.ltz-panel-search-ico { position:absolute; left:26px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
.ltz-panel-input { width:100%; padding:9px 12px 9px 36px; border-radius:9px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-size:.8rem; font-family:'Inter',sans-serif; color:#0F172A; outline:none; transition:all .2s; box-sizing:border-box; }
.ltz-panel-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }

.ltz-zone-list { flex:1; overflow-y:auto; padding:0 8px 8px; }
.ltz-zone-item { display:flex; align-items:center; gap:10px; padding:12px; border-radius:10px; cursor:pointer; transition:background .1s; margin-bottom:2px; }
.ltz-zone-item:hover { background:#F8FAFC; }
.ltz-zone-item--active { background:#EFF6FF; }
.ltz-zone-color { width:4px; height:36px; border-radius:2px; flex-shrink:0; }
.ltz-zone-info { flex:1; display:flex; flex-direction:column; gap:4px; min-width:0; }
.ltz-zone-name-row { display:flex; align-items:center; gap:6px; }
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
.ltz-drawer-shape-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:8px; background:#F1F5F9; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600; color:#475569; }
.ltz-drawer-dims { display:flex; flex-direction:column; gap:6px; }
.ltz-dim-item { display:flex; align-items:center; gap:8px; font-family:'Inter',sans-serif; font-size:.78rem; color:#475569; padding:6px 10px; background:#FAFBFC; border-radius:8px; }
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

/* ── Zone Edit Modal ── */
.ltz-modal-bg { position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; }
.ltz-modal { background:#FFF; border-radius:16px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.18); animation:ltSlideIn .2s ease; }
.ltz-modal-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #F1F5F9; }
.ltz-modal-head h2 { font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; margin:0; }
.ltz-modal-close { width:36px; height:36px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.ltz-modal-close:hover { border-color:#EF4444; color:#EF4444; }
.ltz-modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:16px; }
.ltz-edit-field { display:flex; flex-direction:column; gap:5px; }
.ltz-edit-field label { font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.04em; }
.ltz-edit-field input[type="text"], .ltz-edit-field select { padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-family:'Inter',sans-serif; font-size:.85rem; color:#0F172A; outline:none; transition:all .2s; }
.ltz-edit-field input:focus, .ltz-edit-field select:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); background:#FFF; }
.ltz-edit-row { display:flex; gap:14px; }

/* Shape selector */
.ltz-shape-selector { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.ltz-shape-opt { display:flex; flex-direction:column; align-items:center; gap:4px; padding:16px 12px; border-radius:12px; border:2px solid #E2E8F0; background:#FAFBFC; cursor:pointer; transition:all .2s; }
.ltz-shape-opt:hover { border-color:#CBD5E1; background:#FFF; }
.ltz-shape-opt--active { border-color:#2563EB; background:#EFF6FF; }
.ltz-shape-opt svg { color:#64748B; }
.ltz-shape-opt--active svg { color:#2563EB; }
.ltz-shape-opt span { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; }
.ltz-shape-opt small { font-family:'Inter',sans-serif; font-size:.65rem; color:#94A3B8; }

/* Range slider */
.ltz-range { width:100%; height:6px; border-radius:3px; appearance:none; -webkit-appearance:none; background:linear-gradient(90deg,#DBEAFE 0%,#2563EB 100%); outline:none; }
.ltz-range::-webkit-slider-thumb { appearance:none; -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:#2563EB; border:3px solid #FFF; box-shadow:0 2px 8px rgba(37,99,235,.3); cursor:pointer; }
.ltz-range::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:#2563EB; border:3px solid #FFF; box-shadow:0 2px 8px rgba(37,99,235,.3); cursor:pointer; }
.ltz-range-labels { display:flex; justify-content:space-between; font-family:'Inter',sans-serif; font-size:.62rem; color:#94A3B8; margin-top:2px; }

/* Draw on map button */
.ltz-draw-map-btn { display:flex; align-items:center; justify-content:center; gap:8px; padding:12px 16px; border-radius:10px; border:2px dashed #93C5FD; background:#EFF6FF; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; color:#2563EB; cursor:pointer; transition:all .15s; }
.ltz-draw-map-btn:hover { background:#DBEAFE; border-color:#2563EB; }
.ltz-draw-result { display:flex; align-items:center; gap:6px; padding:8px 12px; border-radius:8px; background:#ECFDF5; font-family:'Inter',sans-serif; font-size:.7rem; color:#059669; margin-top:6px; }

.ltz-color-row { display:flex; gap:8px; margin-top:4px; }
.ltz-color-btn { width:28px; height:28px; border-radius:8px; border:2px solid transparent; cursor:pointer; transition:all .12s; }
.ltz-color-btn:hover { transform:scale(1.1); }
.ltz-color-btn--active { border-color:#0F172A; box-shadow:0 0 0 3px rgba(0,0,0,.1); }
.ltz-toggle-row { display:flex; flex-direction:column; gap:10px; }
.ltz-toggle-label { display:flex; align-items:center; gap:10px; font-family:'Inter',sans-serif; font-size:.82rem; color:#475569; cursor:pointer; }
.ltz-toggle-label input { display:none; }
.ltz-toggle-switch { width:36px; height:20px; border-radius:10px; background:#E2E8F0; position:relative; transition:background .2s; flex-shrink:0; }
.ltz-toggle-switch::after { content:''; position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:#FFF; transition:transform .2s; }
.ltz-toggle-label input:checked + .ltz-toggle-switch { background:#2563EB; }
.ltz-toggle-label input:checked + .ltz-toggle-switch::after { transform:translateX(16px); }
.ltz-modal-foot { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:1px solid #F1F5F9; }
.ltz-modal-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; }
.ltz-modal-btn--cancel { border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; }
.ltz-modal-btn--save { border:none; background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.ltz-modal-btn--save:hover { background:#1D4ED8; }
`

export default PremiumZones
