import {useEffect, useState, useCallback, useRef} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchEngines, getEngines, setSelectedEngine} from '../Engin/slice/engin.slice'
import {API_BASE_URL_IMAGE} from '../../api/config'
import {MapContainer, TileLayer, Marker, Popup, Tooltip, useMap} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import {
  Search, X, Filter, Layers, MapPin, Battery, Clock, Calendar,
  Crosshair, Truck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Navigation,
  Box, Tag, Shield, ArrowDownToLine, ArrowUpFromLine, Signal
} from 'lucide-react'
import {useNavigate} from 'react-router-dom'

/* Fix Leaflet default icon */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

/* Custom marker icons by status */
const createIcon = (color) => L.divIcon({
  className: 'ltmap-marker',
  html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;border-radius:50%;background:white;transform:rotate(45deg);"></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const ICONS = {
  active: createIcon('#10B981'),
  exit: createIcon('#D64B70'),
  reception: createIcon('#2563EB'),
  nonactive: createIcon('#94A3B8'),
  default: createIcon('#F59E0B'),
}

const getMarkerIcon = (item) => {
  if (item?.etatenginname === 'exit') return ICONS.exit
  if (item?.etatenginname === 'reception') return ICONS.reception
  if (item?.etatenginname === 'nonactive') return ICONS.nonactive
  return ICONS.active
}

/* Recenter map component */
const RecenterMap = ({center, zoom}) => {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 12, {duration: 1})
  }, [center, zoom, map])
  return null
}

const PremiumMap = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const engines = useAppSelector(getEngines)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [mapCenter, setMapCenter] = useState([46.8, 7.15])
  const [mapZoom, setMapZoom] = useState(8)
  const [activeFilter, setActiveFilter] = useState('all')
  const [sbPage, setSbPage] = useState(1)
  const sbRows = 15
  const mapRef = useRef(null)
  const [detailItem, setDetailItem] = useState(null)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchEngines({page: 1, PageSize: 200})).finally(() => setLoading(false))
  }, [dispatch])

  const data = engines?.data || engines || []

  /* Filter assets with GPS coordinates */
  const assetsWithLocation = data.filter((a) => {
    const lat = parseFloat(a.last_lat || a.latitude || a.lat)
    const lng = parseFloat(a.last_lng || a.longitude || a.lng || a.lon)
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && lat !== -1 && lng !== -1
  })

  const filteredAssets = assetsWithLocation.filter((a) => {
    if (activeFilter !== 'all' && a.etatenginname !== activeFilter) return false
    if (search) {
      const term = search.toLowerCase()
      return [a.reference, a.label, a.LocationObjectname, a.famille]
        .some((f) => f && String(f).toLowerCase().includes(term))
    }
    return true
  })

  const allFilteredData = data.filter((a) => {
    if (activeFilter !== 'all' && a.etatenginname !== activeFilter) return false
    if (search) {
      const term = search.toLowerCase()
      return [a.reference, a.label, a.LocationObjectname, a.famille]
        .some((f) => f && String(f).toLowerCase().includes(term))
    }
    return true
  })

  const getCoords = (item) => [
    parseFloat(item.last_lat || item.latitude || item.lat),
    parseFloat(item.last_lng || item.longitude || item.lng || item.lon)
  ]

  const handleSelectAsset = (item) => {
    setSelectedAsset(item)
    const lat = parseFloat(item.last_lat || item.latitude || item.lat)
    const lng = parseFloat(item.last_lng || item.longitude || item.lng || item.lon)
    if (!isNaN(lat) && !isNaN(lng)) {
      setMapCenter([lat, lng])
      setMapZoom(15)
    }
  }

  const handleRecenter = () => {
    if (filteredAssets.length > 0) {
      const bounds = filteredAssets.map(getCoords)
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, {padding: [50, 50]})
      }
    } else {
      setMapCenter([46.8, 7.15])
      setMapZoom(8)
    }
  }

  const getBat = (b) => {
    if (!b && b !== 0) return {color: '#94A3B8', pct: 0, label: 'N/A'}
    const v = parseInt(b, 10)
    if (isNaN(v)) return {color: '#94A3B8', pct: 0, label: 'N/A'}
    if (v >= 50) return {color: '#059669', pct: v, label: `${v}%`}
    if (v >= 20) return {color: '#F59E0B', pct: v, label: `${v}%`}
    return {color: '#EF4444', pct: Math.max(v, 0), label: `${v}%`}
  }

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return null
      const now = new Date()
      const diffMs = now - d
      const mins = Math.floor(diffMs / 60000)
      if (mins < 1) return "A l'instant"
      if (mins < 60) return `Il y a ${mins}min`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `Il y a ${hrs}h${mins % 60 > 0 ? String(mins % 60).padStart(2, '0') : ''}`
      const days = Math.floor(hrs / 24)
      if (days < 30) return `Il y a ${days}j`
      return d.toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'})
    } catch { return null }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})
    } catch { return dateStr }
  }

  const getEtat = (item) => {
    if (item?.etatenginname === 'exit') return {label: 'Sortie', color: '#D64B70'}
    if (item?.etatenginname === 'reception') return {label: 'Réception', color: '#059669'}
    return {label: item?.etatengin || '—', color: '#94A3B8'}
  }

  const FILTERS = [
    {code: 'all', label: 'Tous', color: '#2563EB'},
    {code: 'reception', label: 'Entrée', color: '#059669'},
    {code: 'exit', label: 'Sortie', color: '#D64B70'},
  ]

  return (
    <>
      <style>{MAP_STYLES}</style>
      <div className="ltmap" data-testid="premium-map">
        {/* ── SIDEBAR ── */}
        <div className={`ltmap-sidebar ${sidebarOpen ? '' : 'ltmap-sidebar--closed'}`} data-testid="map-sidebar">
          <div className="ltmap-sb-header">
            <h2 className="ltmap-sb-title">Assets</h2>
            <span className="ltmap-sb-count">{allFilteredData.length} / {data.length}</span>
          </div>

          {/* Search */}
          <div className="ltmap-sb-search">
            <Search size={15} className="ltmap-sb-search-icon" />
            <input
              className="ltmap-sb-input"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSbPage(1); }}
              data-testid="map-search-input"
            />
            {search && <button className="ltmap-sb-clear" onClick={() => setSearch('')}><X size={13} /></button>}
          </div>

          {/* Filters */}
          <div className="ltmap-sb-filters" data-testid="map-filters">
            {FILTERS.map((f) => (
              <button
                key={f.code}
                className={`ltmap-sb-filter ${activeFilter === f.code ? 'ltmap-sb-filter--active' : ''}`}
                style={activeFilter === f.code ? {background: `${f.color}12`, color: f.color, borderColor: f.color} : {}}
                onClick={() => { setActiveFilter(f.code); setSbPage(1); }}
                data-testid={`map-filter-${f.code}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Asset List */}
          <div className="ltmap-sb-list" data-testid="map-asset-list">
            {loading ? (
              [...Array(6)].map((_, i) => <div key={i} className="ltmap-sb-skeleton" />)
            ) : allFilteredData.length === 0 ? (
              <div className="ltmap-sb-empty">Aucun asset</div>
            ) : (
              (() => {
                const sbTotalPages = Math.ceil(allFilteredData.length / sbRows)
                const safePage = Math.min(sbPage, sbTotalPages || 1)
                const paginatedItems = allFilteredData.slice((safePage - 1) * sbRows, safePage * sbRows)
                return (
                  <>
                    {paginatedItems.map((item, i) => {
                      const bat = getBat(item.batteries)
                      const etat = getEtat(item)
                      const isSelected = selectedAsset?.id === item.id
                      return (
                        <div
                          key={item.id || i}
                          className={`ltmap-sb-item ${isSelected ? 'ltmap-sb-item--active' : ''}`}
                          onClick={() => handleSelectAsset(item)}
                          data-testid={`map-asset-item-${i}`}
                        >
                          <div className="ltmap-sb-item-img">
                            {item.image ? (
                              <img src={`${API_BASE_URL_IMAGE}${item.image}`} alt="" />
                            ) : (
                              <div className="ltmap-sb-item-ph"><Truck size={14} /></div>
                            )}
                          </div>
                          <div className="ltmap-sb-item-info">
                            <span className="ltmap-sb-item-ref">{item.reference || 'N/A'}</span>
                            <span className="ltmap-sb-item-loc">
                              <MapPin size={10} /> {item.LocationObjectname || '—'}
                            </span>
                          </div>
                          <div className="ltmap-sb-item-right">
                            <span className="ltmap-sb-item-etat" style={{color: etat.color}}>{etat.label}</span>
                            <span className="ltmap-sb-item-bat" style={{color: bat.color}}>{bat.label}</span>
                          </div>
                        </div>
                      )
                    })}
                    {sbTotalPages > 1 && (
                      <div className="ltmap-sb-pagination" data-testid="map-pagination">
                        <button
                          className="ltmap-sb-pg-btn"
                          disabled={safePage <= 1}
                          onClick={() => setSbPage(p => Math.max(1, p - 1))}
                          data-testid="map-pg-prev"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="ltmap-sb-pg-info" data-testid="map-pg-info">
                          {safePage} / {sbTotalPages}
                        </span>
                        <button
                          className="ltmap-sb-pg-btn"
                          disabled={safePage >= sbTotalPages}
                          onClick={() => setSbPage(p => Math.min(sbTotalPages, p + 1))}
                          data-testid="map-pg-next"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )
              })()
            )}
          </div>
        </div>

        {/* Toggle sidebar */}
        <button
          className="ltmap-sb-toggle"
          style={{left: sidebarOpen ? 340 : 0}}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="map-sidebar-toggle"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* ── MAP ── */}
        <div className="ltmap-container" style={{left: sidebarOpen ? 350 : 0}} data-testid="map-container">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{width: '100%', height: '100%'}}
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
            />
            <RecenterMap center={mapCenter} zoom={mapZoom} />

            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={60}
              iconCreateFunction={(cluster) => {
                const count = cluster.getChildCount()
                return L.divIcon({
                  html: `<div class="ltmap-cluster">${count}</div>`,
                  className: 'ltmap-cluster-icon',
                  iconSize: [40, 40],
                })
              }}
            >
              {filteredAssets.map((item, i) => {
                const [lat, lng] = getCoords(item)
                const bat = getBat(item.batteries)
                const etat = getEtat(item)
                const displayName = item.label || item.reference || 'Asset'
                const shortName = displayName.length > 18 ? displayName.slice(0, 16) + '…' : displayName
                return (
                  <Marker
                    key={item.id || i}
                    position={[lat, lng]}
                    icon={getMarkerIcon(item)}
                    eventHandlers={{
                      click: () => setSelectedAsset(item),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -34]} className="ltmap-tooltip" permanent={false}>
                      <strong>{shortName}</strong>
                    </Tooltip>
                    <Popup className="ltmap-popup">
                      <div className="ltmap-popup-content">
                        {item.image && (
                          <img src={`${API_BASE_URL_IMAGE}${item.image}`} alt="" className="ltmap-popup-img" />
                        )}
                        <div className="ltmap-popup-header">
                          <div className="ltmap-popup-ref">{item.reference || 'N/A'}</div>
                          <span className="ltmap-popup-etat" style={{background: `${etat.color}15`, color: etat.color}}>{etat.label}</span>
                        </div>
                        {item.label && <div className="ltmap-popup-label">{item.label}</div>}

                        {/* Info rows */}
                        <div className="ltmap-popup-info">
                          {item.famille && (
                            <div className="ltmap-popup-row">
                              <span className="ltmap-popup-row-l">Famille</span>
                              <span className="ltmap-popup-row-v" style={{color: item.familleBgcolor || '#0F172A'}}>{item.famille}</span>
                            </div>
                          )}
                          {item.customername && (
                            <div className="ltmap-popup-row">
                              <span className="ltmap-popup-row-l">Client</span>
                              <span className="ltmap-popup-row-v">{item.customername}</span>
                            </div>
                          )}
                          {(item.labeltag || item.tagname) && (
                            <div className="ltmap-popup-row">
                              <span className="ltmap-popup-row-l">Tag</span>
                              <span className="ltmap-popup-row-v" style={{fontSize: '.7rem'}}>{item.labeltag || item.tagname}</span>
                            </div>
                          )}
                          {item.statuslabel && (
                            <div className="ltmap-popup-row">
                              <span className="ltmap-popup-row-l">Statut</span>
                              <span className="ltmap-popup-row-v" style={{color: item.statusbgColor || '#64748B'}}>{item.statuslabel}</span>
                            </div>
                          )}
                        </div>

                        {/* Battery bar */}
                        <div className="ltmap-popup-bat">
                          <Battery size={11} style={{color: bat.color}} />
                          <div className="ltmap-popup-bat-bar">
                            <div className="ltmap-popup-bat-fill" style={{width: `${bat.pct}%`, background: bat.color}} />
                          </div>
                          <span style={{color: bat.color, fontWeight: 700, fontSize: '.65rem'}}>{bat.label}</span>
                        </div>

                        {/* Location */}
                        <div className="ltmap-popup-loc">
                          <MapPin size={9} /> {item.LocationObjectname || item.enginAddress || '—'}
                        </div>

                        {/* Time info - MOST IMPORTANT */}
                        {item.lastSeenAt && (
                          <div className="ltmap-popup-time-section">
                            <div className="ltmap-popup-time-row">
                              <Clock size={9} />
                              <span className="ltmap-popup-time-label">Dernière activité</span>
                              <span className="ltmap-popup-time-val">{formatTimeAgo(item.lastSeenAt) || '—'}</span>
                            </div>
                            <div className="ltmap-popup-time-row">
                              <Calendar size={9} />
                              <span className="ltmap-popup-time-label">Arrivée</span>
                              <span className="ltmap-popup-time-val">{formatDateTime(item.lastSeenAt)}</span>
                            </div>
                          </div>
                        )}

                        {/* Coordinates */}
                        <div className="ltmap-popup-coords">
                          {lat.toFixed(5)}, {lng.toFixed(5)}
                        </div>

                        {/* Actions */}
                        <div className="ltmap-popup-actions">
                          <button onClick={() => setDetailItem(item)} className="ltmap-popup-btn">
                            <Eye size={11} /> Plus de détails
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MarkerClusterGroup>
          </MapContainer>

          {/* Floating Actions */}
          <div className="ltmap-fab-group" data-testid="map-fab-group">
            <button className="ltmap-fab" onClick={handleRecenter} title="Recentrer" data-testid="map-recenter-btn">
              <Crosshair size={18} />
            </button>
            <button className="ltmap-fab" title="Calques">
              <Layers size={18} />
            </button>
          </div>

          {/* Stats overlay */}
          <div className="ltmap-stats" data-testid="map-stats">
            <span className="ltmap-stat">
              <MapPin size={13} /> {filteredAssets.length} localisés
            </span>
            <span className="ltmap-stat-sep">|</span>
            <span className="ltmap-stat ltmap-stat--warn">
              {allFilteredData.length - filteredAssets.length} sans GPS
            </span>
          </div>
        </div>

        {/* ── DETAIL SLIDE-OVER PANEL ── */}
        {detailItem && (
          <div className="ltmap-detail-bg" onClick={() => setDetailItem(null)} data-testid="map-detail-overlay">
            <div className="ltmap-detail-panel" onClick={(e) => e.stopPropagation()} data-testid="map-detail-panel">
              {/* Header */}
              <div className="ltmap-detail-head">
                <div className="ltmap-detail-head-left">
                  <div className="ltmap-detail-avatar">
                    {detailItem.image ? (
                      <img src={`${API_BASE_URL_IMAGE}${detailItem.image}`} alt="" />
                    ) : (
                      <Truck size={22} />
                    )}
                  </div>
                  <div>
                    <h2 className="ltmap-detail-name">{detailItem.label || detailItem.reference || 'Asset'}</h2>
                    <span className="ltmap-detail-ref">{detailItem.reference}</span>
                  </div>
                </div>
                <button className="ltmap-detail-close" onClick={() => setDetailItem(null)} data-testid="map-detail-close">
                  <X size={18} />
                </button>
              </div>

              {/* Status chips */}
              <div className="ltmap-detail-chips">
                {detailItem.etatenginname && (
                  <span className={`ltmap-detail-chip ${detailItem.etatenginname === 'reception' ? 'ltmap-detail-chip--in' : 'ltmap-detail-chip--out'}`}>
                    {detailItem.etatenginname === 'reception' ? <><ArrowDownToLine size={12} /> Entrée</> : <><ArrowUpFromLine size={12} /> Sortie</>}
                  </span>
                )}
                {detailItem.statuslabel && (
                  <span className="ltmap-detail-chip" style={{borderColor: detailItem.statusbgColor || '#94A3B8', color: detailItem.statusbgColor || '#64748B'}}>
                    {detailItem.statuslabel}
                  </span>
                )}
              </div>

              {/* Mini Map */}
              {(() => {
                const lat = parseFloat(detailItem.last_lat || detailItem.latitude || 0)
                const lng = parseFloat(detailItem.last_lng || detailItem.longitude || 0)
                const hasCoords = lat !== 0 && lng !== 0
                return hasCoords ? (
                  <div className="ltmap-detail-minimap">
                    <MapContainer center={[lat, lng]} zoom={14} style={{width: '100%', height: '100%'}} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                      <Marker position={[lat, lng]} />
                    </MapContainer>
                    <div className="ltmap-detail-coords">
                      <MapPin size={11} /> {lat.toFixed(5)}, {lng.toFixed(5)}
                    </div>
                  </div>
                ) : null
              })()}

              {/* Info rows */}
              <div className="ltmap-detail-body">
                <DetailRow icon={Box} label="Famille" value={detailItem.famille} color={detailItem.familleBgcolor} />
                <DetailRow icon={Shield} label="Statut" value={detailItem.statuslabel} />
                <DetailRow icon={Battery} label="Batterie" value={detailItem.batteries ? `${detailItem.batteries}%` : 'N/A'} valueColor={parseInt(detailItem.batteries) >= 50 ? '#059669' : parseInt(detailItem.batteries) >= 20 ? '#F59E0B' : '#EF4444'} />
                <DetailRow icon={MapPin} label="Site" value={detailItem.LocationObjectname || detailItem.enginAddress} />
                <DetailRow icon={Tag} label="Tag" value={detailItem.labeltag || detailItem.tagname} />
                <DetailRow icon={Clock} label="Dernière activité" value={detailItem.last_date ? formatTimeAgo(detailItem.last_date) : detailItem.enginLastSeen || 'N/A'} />
                <DetailRow icon={Calendar} label="Arrivée" value={detailItem.last_date || detailItem.enginLastSeen || 'N/A'} />
                <DetailRow icon={Signal} label="Mouvement" value={detailItem.etatenginname === 'reception' ? 'Entrée zone' : detailItem.etatenginname === 'exit' ? 'Sortie zone' : detailItem.etatenginname || 'N/A'} />
                {detailItem.brand && <DetailRow icon={Truck} label="Marque" value={detailItem.brand} />}
                {detailItem.model && <DetailRow icon={Box} label="Modèle" value={detailItem.model} />}
                {detailItem.vin && <DetailRow icon={Tag} label="VIN" value={detailItem.vin} />}
              </div>

              {/* Action button */}
              <div className="ltmap-detail-footer">
                <button className="ltmap-detail-full-btn" onClick={() => { dispatch(setSelectedEngine(detailItem)); navigate('/asset/detail'); }} data-testid="map-detail-full-btn">
                  <Eye size={14} /> Voir la fiche complète
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const DetailRow = ({icon: Icon, label, value, color, valueColor}) => (
  <div className="ltmap-detail-row">
    <div className="ltmap-detail-row-left">
      <Icon size={14} className="ltmap-detail-row-icon" />
      <span className="ltmap-detail-row-label">{label}</span>
    </div>
    <span className="ltmap-detail-row-value" style={color ? {color} : valueColor ? {color: valueColor} : {}}>
      {value || '—'}
    </span>
  </div>
)

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'N/A'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

const MAP_STYLES = `
  .ltmap {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    display: flex; z-index: 50;
  }

  /* ── SIDEBAR ── */
  .ltmap-sidebar {
    width: 350px; height: 100vh; background: #FFFFFF;
    border-right: 1px solid #E2E8F0;
    display: flex; flex-direction: column;
    z-index: 60; flex-shrink: 0;
    transition: width 0.3s ease, opacity 0.3s ease;
  }
  .ltmap-sidebar--closed { width: 0; opacity: 0; overflow: hidden; }

  .ltmap-sb-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 20px 12px;
  }
  .ltmap-sb-title {
    font-family: 'Manrope', sans-serif; font-size: 1.15rem;
    font-weight: 800; color: #0F172A; margin: 0;
  }
  .ltmap-sb-count {
    font-family: 'Inter', sans-serif; font-size: .75rem;
    color: #94A3B8; background: #F1F5F9;
    padding: 3px 10px; border-radius: 6px;
  }

  .ltmap-sb-search {
    position: relative; margin: 0 16px 12px; 
  }
  .ltmap-sb-search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: #94A3B8; pointer-events: none;
  }
  .ltmap-sb-input {
    width: 100%; padding: 9px 32px 9px 36px; border-radius: 9px;
    border: 1.5px solid #E2E8F0; background: #FAFBFC;
    font-size: .82rem; font-family: 'Inter', sans-serif;
    color: #0F172A; outline: none; transition: all .2s;
  }
  .ltmap-sb-input:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,.08); }
  .ltmap-sb-clear {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    border: none; background: transparent; color: #94A3B8; cursor: pointer;
  }

  .ltmap-sb-filters {
    display: flex; gap: 6px; padding: 0 16px 12px;
  }
  .ltmap-sb-filter {
    flex: 1; padding: 6px; border-radius: 7px;
    border: 1.5px solid #E2E8F0; background: #FFF;
    color: #64748B; font-family: 'Inter', sans-serif;
    font-size: .72rem; font-weight: 500; cursor: pointer;
    transition: all .15s; text-align: center;
  }
  .ltmap-sb-filter:hover { border-color: #CBD5E1; }
  .ltmap-sb-filter--active { font-weight: 600; }

  .ltmap-sb-list {
    flex: 1; overflow-y: auto; padding: 0 8px;
  }

  .ltmap-sb-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    cursor: pointer; transition: background .1s;
    margin-bottom: 2px;
  }
  .ltmap-sb-item:hover { background: #F8FAFC; }
  .ltmap-sb-item--active { background: #EFF6FF; }

  .ltmap-sb-item-img {
    width: 38px; height: 38px; border-radius: 9px;
    overflow: hidden; flex-shrink: 0; background: #F1F5F9;
  }
  .ltmap-sb-item-img img { width: 100%; height: 100%; object-fit: cover; }
  .ltmap-sb-item-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #CBD5E1; }

  .ltmap-sb-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .ltmap-sb-item-ref { font-family: 'Manrope', sans-serif; font-size: .78rem; font-weight: 700; color: #0F172A; }
  .ltmap-sb-item-loc { font-family: 'Inter', sans-serif; font-size: .65rem; color: #94A3B8; display: flex; align-items: center; gap: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .ltmap-sb-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
  .ltmap-sb-item-etat { font-family: 'Inter', sans-serif; font-size: .65rem; font-weight: 600; }
  .ltmap-sb-item-bat { font-family: 'Manrope', sans-serif; font-size: .65rem; font-weight: 600; }

  .ltmap-sb-skeleton { height: 56px; margin: 4px 12px; border-radius: 10px; background: linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; }
  @keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .ltmap-sb-empty { padding: 40px; text-align: center; color: #94A3B8; font-family: 'Inter', sans-serif; font-size: .82rem; }

  /* Sidebar pagination */
  .ltmap-sb-pagination {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 12px 8px; border-top: 1px solid #F1F5F9;
    position: sticky; bottom: 0; background: #FFF; z-index: 2;
  }
  .ltmap-sb-pg-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px;
    border: 1.5px solid #E2E8F0; background: #FFF; color: #475569;
    cursor: pointer; transition: all .15s;
  }
  .ltmap-sb-pg-btn:hover:not(:disabled) { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }
  .ltmap-sb-pg-btn:disabled { opacity: .3; cursor: not-allowed; }
  .ltmap-sb-pg-info {
    font-family: 'Manrope', sans-serif; font-size: .78rem; font-weight: 700;
    color: #0F172A; min-width: 50px; text-align: center;
  }

  /* Toggle */
  .ltmap-sb-toggle {
    position: fixed; top: 50%; z-index: 65;
    transform: translateY(-50%);
    width: 24px; height: 48px; border-radius: 0 8px 8px 0;
    border: 1px solid #E2E8F0; border-left: none;
    background: #FFF; color: #64748B;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: left 0.3s ease;
    box-shadow: 2px 0 8px rgba(0,0,0,.05);
  }
  .ltmap-sb-toggle:hover { color: #2563EB; }

  /* ── MAP CONTAINER ── */
  .ltmap-container {
    position: fixed; top: 0; right: 0; bottom: 0;
    transition: left 0.3s ease;
    z-index: 55;
  }
  .leaflet-container { background: #F8FAFC; }

  /* Cluster icon */
  .ltmap-cluster-icon { background: none !important; border: none !important; }
  .ltmap-cluster {
    width: 40px; height: 40px; border-radius: 50%;
    background: #2563EB; color: #FFF;
    font-family: 'Manrope', sans-serif; font-weight: 700; font-size: .82rem;
    display: flex; align-items: center; justify-content: center;
    border: 3px solid white; box-shadow: 0 2px 12px rgba(37,99,235,.3);
  }

  /* Popup */
  .ltmap-popup .leaflet-popup-content-wrapper {
    border-radius: 12px !important; padding: 0 !important;
    box-shadow: 0 6px 20px rgba(0,0,0,.12) !important;
    border: 1px solid #E2E8F0;
  }
  .ltmap-popup .leaflet-popup-content { margin: 0 !important; width: 220px !important; }
  .ltmap-popup .leaflet-popup-tip { display: none; }
  .ltmap-popup-content { padding: 0; }
  .ltmap-popup-img { width: 100%; height: 80px; object-fit: cover; border-radius: 12px 12px 0 0; }
  .ltmap-popup-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px 0; gap: 6px; }
  .ltmap-popup-ref { font-family: 'Manrope', sans-serif; font-size: .78rem; font-weight: 800; color: #0F172A; }
  .ltmap-popup-etat { display: inline-flex; padding: 2px 7px; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: .58rem; font-weight: 700; flex-shrink: 0; }
  .ltmap-popup-label { font-family: 'Inter', sans-serif; font-size: .65rem; color: #64748B; padding: 1px 10px 0; }

  .ltmap-popup-info { padding: 4px 10px 2px; display: flex; flex-direction: column; gap: 0; }
  .ltmap-popup-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; border-bottom: 1px solid #F8FAFC; }
  .ltmap-popup-row:last-child { border-bottom: none; }
  .ltmap-popup-row-l { font-family: 'Inter', sans-serif; font-size: .62rem; color: #94A3B8; }
  .ltmap-popup-row-v { font-family: 'Manrope', sans-serif; font-size: .65rem; font-weight: 600; color: #0F172A; text-align: right; max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .ltmap-popup-bat { display: flex; align-items: center; gap: 6px; padding: 4px 10px 2px; }
  .ltmap-popup-bat-bar { flex: 1; height: 4px; background: #F1F5F9; border-radius: 2px; overflow: hidden; }
  .ltmap-popup-bat-fill { height: 100%; border-radius: 2px; transition: width .3s; }

  .ltmap-popup-loc { display: flex; align-items: center; gap: 3px; padding: 2px 10px; font-family: 'Inter', sans-serif; font-size: .62rem; color: #94A3B8; }
  .ltmap-popup-coords { padding: 0 10px 2px; font-family: monospace; font-size: .55rem; color: #CBD5E1; }

  .ltmap-popup-time-section { padding: 4px 10px; background: #F8FAFC; border-top: 1px solid #F1F5F9; }
  .ltmap-popup-time-row { display: flex; align-items: center; gap: 4px; padding: 2px 0; font-family: 'Inter', sans-serif; font-size: .62rem; color: #64748B; }
  .ltmap-popup-time-label { flex: 1; }
  .ltmap-popup-time-val { font-weight: 700; color: #0F172A; font-family: 'Manrope', sans-serif; font-size: .62rem; }

  .ltmap-popup-actions { padding: 6px 10px; border-top: 1px solid #F1F5F9; }
  .ltmap-popup-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 5px 12px; border-radius: 6px; border: none;
    background: #2563EB; color: #FFF;
    font-family: 'Inter', sans-serif; font-size: .65rem; font-weight: 600;
    cursor: pointer; transition: all .15s; width: 100%; justify-content: center;
  }
  .ltmap-popup-btn:hover { background: #1D4ED8; }

  /* Tooltip */
  .ltmap-tooltip {
    font-family: 'Manrope', sans-serif !important;
    font-size: .75rem !important;
    font-weight: 700 !important;
    background: rgba(15, 23, 42, .88) !important;
    color: #FFF !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 5px 10px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,.15) !important;
  }
  .ltmap-tooltip::before { border-top-color: rgba(15, 23, 42, .88) !important; }

  /* FAB */
  .ltmap-fab-group {
    position: absolute; right: 20px; bottom: 40px;
    display: flex; flex-direction: column; gap: 8px; z-index: 1000;
  }
  .ltmap-fab {
    width: 44px; height: 44px; border-radius: 12px;
    background: #FFF; border: 1.5px solid #E2E8F0;
    color: #475569; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,.08);
    transition: all .15s;
  }
  .ltmap-fab:hover { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }

  /* Stats overlay */
  .ltmap-stats {
    position: absolute; top: 16px; right: 16px;
    display: flex; gap: 8px; z-index: 1000;
  }
  .ltmap-stat {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 9px;
    background: rgba(255,255,255,.92); backdrop-filter: blur(8px);
    border: 1px solid #E2E8F0;
    font-family: 'Inter', sans-serif; font-size: .75rem;
    font-weight: 600; color: #059669;
    box-shadow: 0 2px 8px rgba(0,0,0,.05);
  }
  .ltmap-stat--warn { color: #D97706; }
  .ltmap-stat-sep { color: #CBD5E1; font-weight: 400; margin: 0 2px; }

  /* Responsive */
  @media (max-width: 768px) {
    .ltmap-sidebar { width: 100%; height: 45vh; position: fixed; bottom: 0; top: auto; border-right: none; border-top: 1px solid #E2E8F0; border-radius: 16px 16px 0 0; z-index: 70; }
    .ltmap-sidebar--closed { height: 0; }
    .ltmap-container { left: 0 !important; bottom: 45vh; }
    .ltmap-sb-toggle { display: none; }
  }

  /* ── DETAIL SLIDE-OVER PANEL ── */
  .ltmap-detail-bg {
    position: fixed; inset: 0; background: rgba(15,23,42,.35); backdrop-filter: blur(2px);
    z-index: 9999; display: flex; justify-content: flex-end;
  }
  .ltmap-detail-panel {
    width: 420px; max-width: 95vw; height: 100vh; background: #FFF;
    box-shadow: -12px 0 48px rgba(0,0,0,.15);
    display: flex; flex-direction: column;
    animation: ltmapSlideIn .25s ease;
  }
  @keyframes ltmapSlideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }

  .ltmap-detail-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid #F1F5F9; flex-shrink: 0;
  }
  .ltmap-detail-head-left { display: flex; align-items: center; gap: 14px; }
  .ltmap-detail-avatar {
    width: 52px; height: 52px; border-radius: 14px; overflow: hidden;
    background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border: 2px solid #E2E8F0;
    display: flex; align-items: center; justify-content: center; color: #2563EB; flex-shrink: 0;
  }
  .ltmap-detail-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .ltmap-detail-name { font-family: 'Manrope', sans-serif; font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -.02em; }
  .ltmap-detail-ref { font-family: 'Inter', sans-serif; font-size: .75rem; color: #94A3B8; }
  .ltmap-detail-close {
    width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid #E2E8F0;
    background: #FFF; color: #94A3B8; cursor: pointer; display: flex; align-items: center;
    justify-content: center; transition: all .15s; flex-shrink: 0;
  }
  .ltmap-detail-close:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }

  /* Chips */
  .ltmap-detail-chips {
    display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 24px; border-bottom: 1px solid #F1F5F9; flex-shrink: 0;
  }
  .ltmap-detail-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 14px; border-radius: 20px; border: 1.5px solid #E2E8F0;
    font-family: 'Inter', sans-serif; font-size: .75rem; font-weight: 600; color: #475569;
  }
  .ltmap-detail-chip--in { background: #ECFDF5; border-color: #A7F3D0; color: #059669; }
  .ltmap-detail-chip--out { background: #FEF2F2; border-color: #FECACA; color: #DC2626; }

  /* Mini map */
  .ltmap-detail-minimap {
    height: 180px; position: relative; flex-shrink: 0; border-bottom: 1px solid #F1F5F9;
  }
  .ltmap-detail-minimap .leaflet-container { height: 100%; border-radius: 0; }
  .ltmap-detail-coords {
    position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
    background: rgba(255,255,255,.92); backdrop-filter: blur(6px);
    padding: 4px 14px; border-radius: 20px; border: 1px solid #E2E8F0;
    font-family: 'Inter', sans-serif; font-size: .68rem; font-weight: 600; color: #475569;
    display: flex; align-items: center; gap: 5px; z-index: 500;
  }

  /* Info rows */
  .ltmap-detail-body { flex: 1; overflow-y: auto; padding: 0; }
  .ltmap-detail-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px; border-bottom: 1px solid #F8FAFC;
    transition: background .12s;
  }
  .ltmap-detail-row:hover { background: #FAFBFC; }
  .ltmap-detail-row-left { display: flex; align-items: center; gap: 10px; }
  .ltmap-detail-row-icon { color: #94A3B8; }
  .ltmap-detail-row-label { font-family: 'Inter', sans-serif; font-size: .78rem; color: #64748B; }
  .ltmap-detail-row-value { font-family: 'Manrope', sans-serif; font-size: .85rem; font-weight: 700; color: #0F172A; text-align: right; max-width: 55%; word-break: break-word; }

  /* Footer */
  .ltmap-detail-footer {
    padding: 16px 24px; border-top: 1px solid #F1F5F9; flex-shrink: 0;
  }
  .ltmap-detail-full-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px; border-radius: 12px; border: none;
    background: #2563EB; color: #FFF;
    font-family: 'Manrope', sans-serif; font-size: .88rem; font-weight: 700;
    cursor: pointer; transition: all .15s;
    box-shadow: 0 4px 12px rgba(37,99,235,.2);
  }
  .ltmap-detail-full-btn:hover { background: #1D4ED8; box-shadow: 0 6px 16px rgba(37,99,235,.3); }
`

export default PremiumMap
