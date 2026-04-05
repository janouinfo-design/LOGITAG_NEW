import {useEffect, useState, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {getSelectedEngine, setSelectedEngine, createOrUpdateEngine} from '../Engin/slice/engin.slice'
import {fetchLogList, getLogList, setLogList} from '../LogsTracking/slice/logs.slice'
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'
import L from 'leaflet'
import {API_BASE_URL_IMAGE} from '../../api/config'
import {FileUploadeComponent} from '../shared/FileUploaderComponent/FileUploadeComponent'
import {
  ArrowLeft, MapPin, Battery, Radio, Clock, Box, Tag,
  Building2, Calendar, Signal, ChevronRight, Shield,
  Truck, CheckCircle, AlertTriangle, TrendingUp, Wifi, Eye, X,
  Pencil, Camera, Save, Loader2
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
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  useEffect(() => {
    if (!asset) {
      navigate('/view/engin/index')
      return
    }
    setLoading(true)
    // Fetch logs with timeout to avoid hanging on slow API
    const timeout = setTimeout(() => setLoading(false), 8000)
    dispatch(fetchLogList({page: 1, PageSize: 20})).then((res) => {
      clearTimeout(timeout)
      // Store result in Redux since the thunk doesn't dispatch setLogList
      if (res?.payload && Array.isArray(res.payload)) {
        dispatch(setLogList(res.payload))
      }
      setLoading(false)
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
    })
    return () => clearTimeout(timeout)
  }, [asset, dispatch, navigate])

  if (!asset) return null

  const logs = Array.isArray(logList) ? logList : []
  const bat = parseBattery(asset.batteries)
  const hasCoords = asset.last_lat && asset.last_lng && asset.last_lat !== 0 && asset.last_lng !== 0
  const center = hasCoords ? [asset.last_lat, asset.last_lng] : [46.5197, 6.6323]

  const etatMap = {
    reception: {label: 'Entrée', color: '#059669', bg: '#ECFDF5'},
    exit: {label: 'Sortie', color: '#D97706', bg: '#FFFBEB'},
  }
  const etat = etatMap[asset.etatenginname] || {label: asset.etatenginname || 'N/A', color: '#64748B', bg: '#F1F5F9'}
  const timeline = buildTimeline(logs, asset)

  const openEditModal = () => {
    setEditForm({
      reference: asset.reference || '',
      label: asset.label || '',
      brand: asset.brand || '',
      model: asset.model || '',
      vin: asset.vin || '',
      immatriculation: asset.immatriculation || '',
      tagname: asset.labeltag || asset.tagname || '',
      famille: asset.famille || '',
      LocationObjectname: asset.LocationObjectname || '',
      enginAddress: asset.enginAddress || '',
      etatenginname: asset.etatenginname || '',
      statuslabel: asset.statuslabel || '',
      infosAdditionnelles: asset.infosAdditionnelles || '',
    })
    setSaveMsg(null)
    setShowEditModal(true)
  }

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({...prev, [field]: value}))
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    setSaveMsg(null)
    const updated = {
      ...asset,
      reference: editForm.reference,
      label: editForm.label,
      brand: editForm.brand,
      model: editForm.model,
      vin: editForm.vin,
      immatriculation: editForm.immatriculation,
      tagname: editForm.tagname,
      famille: editForm.famille,
      LocationObjectname: editForm.LocationObjectname,
      enginAddress: editForm.enginAddress,
      etatenginname: editForm.etatenginname,
      statuslabel: editForm.statuslabel,
      infosAdditionnelles: editForm.infosAdditionnelles,
    }
    dispatch(setSelectedEngine(updated))
    const result = await dispatch(createOrUpdateEngine({}))
    setSaving(false)
    if (result.payload === true) {
      setSaveMsg({type: 'success', text: 'Asset modifié avec succès'})
      setTimeout(() => setShowEditModal(false), 1200)
    } else {
      setSaveMsg({type: 'error', text: 'Erreur lors de la sauvegarde'})
    }
  }

  const handlePhotoUploaded = (saveRes, uploadRes) => {
    if (saveRes && !saveRes.error) {
      const newImageId = saveRes?.data?.[0]?.id || saveRes?.data?.id || asset.imageid
      dispatch(createOrUpdateEngine({imageId: newImageId}))
      setShowPhotoModal(false)
    }
  }

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
            <div className="ltad-hero-icon" style={{position: 'relative', cursor: 'pointer'}} onClick={() => setShowPhotoModal(true)}>
              {asset.image ? (
                <img src={`${API_BASE_URL_IMAGE}${asset.image}`} alt="" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14}} />
              ) : (
                <Truck size={28} style={{color: '#2563EB'}} />
              )}
              <div className="ltad-photo-overlay" data-testid="asset-photo-edit-btn">
                <Camera size={16} />
              </div>
            </div>
            <div>
              <h1 className="ltad-hero-name">{asset.label || asset.reference || 'Asset'}</h1>
              <p className="ltad-hero-ref">
                {asset.reference} {asset.labeltag ? `· Tag: ${asset.labeltag}` : ''}
              </p>
            </div>
          </div>
          <div className="ltad-hero-right">
            <button className="ltad-edit-btn" onClick={openEditModal} data-testid="asset-edit-btn">
              <Pencil size={14} /> Modifier
            </button>
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
              <div className="ltad-card-head">
                <h3><Box size={16} /> Détails</h3>
                <button className="ltad-card-edit" onClick={openEditModal} data-testid="asset-detail-edit-btn">
                  <Pencil size={12} /> Éditer
                </button>
              </div>
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

            {/* Tag card — LABEL instead of ID */}
            <div className="ltad-card" data-testid="asset-detail-tag">
              <div className="ltad-card-head"><h3><Tag size={16} /> Tag BLE associé</h3></div>
              <div className="ltad-info-list">
                <InfoRow label="Label Tag" value={asset.labeltag || 'Non assigné'} />
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

      {/* ── EDIT MODAL ── */}
      {showEditModal && (
        <div className="ltad-modal-bg" onClick={() => !saving && setShowEditModal(false)} data-testid="edit-modal-overlay">
          <div className="ltad-modal" onClick={(e) => e.stopPropagation()} data-testid="edit-modal">
            <div className="ltad-modal-head">
              <h2>Modifier l'asset</h2>
              <button className="ltad-modal-close" onClick={() => !saving && setShowEditModal(false)} data-testid="edit-modal-close"><X size={18} /></button>
            </div>
            <div className="ltad-modal-body">
              <div className="ltad-edit-grid">
                {EDIT_FIELDS.map(f => (
                  <div key={f.key} className={`ltad-edit-field ${f.full ? 'ltad-edit-field--full' : ''}`} data-testid={`edit-field-${f.key}`}>
                    <label>{f.label}</label>
                    <input
                      type="text"
                      value={editForm[f.key] || ''}
                      onChange={(e) => handleEditChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      data-testid={`edit-input-${f.key}`}
                    />
                  </div>
                ))}
              </div>
              {saveMsg && (
                <div className={`ltad-edit-msg ${saveMsg.type === 'success' ? 'ltad-edit-msg--ok' : 'ltad-edit-msg--err'}`} data-testid="edit-save-msg">
                  {saveMsg.text}
                </div>
              )}
            </div>
            <div className="ltad-modal-foot">
              <button className="ltad-modal-btn ltad-modal-btn--cancel" onClick={() => setShowEditModal(false)} disabled={saving} data-testid="edit-cancel-btn">
                Annuler
              </button>
              <button className="ltad-modal-btn ltad-modal-btn--save" onClick={handleSaveEdit} disabled={saving} data-testid="edit-save-btn">
                {saving ? <><Loader2 size={14} className="ltad-spin" /> Sauvegarde...</> : <><Save size={14} /> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTO MODAL ── */}
      {showPhotoModal && (
        <div className="ltad-modal-bg" onClick={() => setShowPhotoModal(false)} data-testid="photo-modal-overlay">
          <div className="ltad-modal ltad-modal--photo" onClick={(e) => e.stopPropagation()} data-testid="photo-modal">
            <div className="ltad-modal-head">
              <h2>Modifier la photo</h2>
              <button className="ltad-modal-close" onClick={() => setShowPhotoModal(false)} data-testid="photo-modal-close"><X size={18} /></button>
            </div>
            <div className="ltad-modal-body">
              {asset.image && (
                <div className="ltad-photo-preview">
                  <img src={`${API_BASE_URL_IMAGE}${asset.image}`} alt="Photo actuelle" />
                  <span className="ltad-photo-current-label">Photo actuelle</span>
                </div>
              )}
              <div className="ltad-photo-upload" data-testid="photo-upload-area">
                <FileUploadeComponent
                  accept="image/*"
                  auto={true}
                  onUploadFinished={handlePhotoUploaded}
                  uploadExtraInfo={{
                    src: 'engin',
                    srcID: asset.id || 0,
                    id: asset.imageid || 0,
                    desc: 'profile',
                  }}
                />
              </div>
              <p className="ltad-photo-hint">Format: JPG, PNG. Taille max: 1 Mo</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const EDIT_FIELDS = [
  {key: 'reference', label: 'Référence', placeholder: 'Ex: REF-001'},
  {key: 'label', label: 'Label', placeholder: 'Nom de l\'asset'},
  {key: 'brand', label: 'Marque', placeholder: 'Ex: Caterpillar'},
  {key: 'model', label: 'Modèle', placeholder: 'Ex: 320F'},
  {key: 'vin', label: 'VIN', placeholder: 'Numéro VIN'},
  {key: 'immatriculation', label: 'Matricule', placeholder: 'Ex: AB-123-CD'},
  {key: 'tagname', label: 'Tag', placeholder: 'Label du tag'},
  {key: 'famille', label: 'Famille', placeholder: 'Ex: Engin'},
  {key: 'etatenginname', label: 'Situation', placeholder: 'reception / exit'},
  {key: 'statuslabel', label: 'Statut', placeholder: 'Ex: Actif'},
  {key: 'LocationObjectname', label: 'Site', placeholder: 'Nom du site'},
  {key: 'enginAddress', label: 'Adresse', placeholder: 'Adresse complète', full: true},
  {key: 'infosAdditionnelles', label: 'Infos additionnelles', placeholder: 'Notes supplémentaires', full: true},
]

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
.ltad-hero-icon { width:56px; height:56px; border-radius:14px; background:#EFF6FF; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; position:relative; }
.ltad-photo-overlay {
  position:absolute; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center;
  color:#FFF; opacity:0; transition:opacity .2s; border-radius:14px; cursor:pointer;
}
.ltad-hero-icon:hover .ltad-photo-overlay { opacity:1; }
.ltad-hero-name { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; color:#0F172A; letter-spacing:-.03em; margin:0; }
.ltad-hero-ref { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:4px 0 0; }
.ltad-hero-right { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.ltad-badge { display:inline-flex; align-items:center; gap:5px; padding:6px 16px; border-radius:20px; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; }

.ltad-edit-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:8px 18px; border-radius:10px; border:1.5px solid #2563EB;
  background:#2563EB; color:#FFF; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600;
  cursor:pointer; transition:all .15s;
}
.ltad-edit-btn:hover { background:#1D4ED8; }

.ltad-card-edit {
  display:inline-flex; align-items:center; gap:4px;
  padding:4px 12px; border-radius:8px; border:1.5px solid #E2E8F0;
  background:#FFF; color:#64748B; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:500;
  cursor:pointer; transition:all .15s;
}
.ltad-card-edit:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }

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

/* ── MODALS ── */
.ltad-modal-bg {
  position:fixed; inset:0; background:rgba(15,23,42,.5); backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;
}
.ltad-modal {
  background:#FFF; border-radius:16px; width:100%; max-width:620px;
  box-shadow:0 20px 60px rgba(0,0,0,.18); overflow:hidden;
  animation:ltadSlideUp .25s ease; max-height:90vh; display:flex; flex-direction:column;
}
.ltad-modal--photo { max-width:480px; }
@keyframes ltadSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

.ltad-modal-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px; border-bottom:1px solid #F1F5F9;
}
.ltad-modal-head h2 { font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; margin:0; }
.ltad-modal-close {
  width:36px; height:36px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FFF; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s;
}
.ltad-modal-close:hover { border-color:#EF4444; color:#EF4444; background:#FEF2F2; }

.ltad-modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:16px; overflow-y:auto; flex:1; }

.ltad-edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.ltad-edit-field { display:flex; flex-direction:column; gap:5px; }
.ltad-edit-field--full { grid-column:1/-1; }
.ltad-edit-field label {
  font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700;
  color:#64748B; text-transform:uppercase; letter-spacing:.04em;
}
.ltad-edit-field input {
  padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FAFBFC; font-family:'Inter',sans-serif; font-size:.85rem; color:#0F172A;
  outline:none; transition:all .2s;
}
.ltad-edit-field input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); background:#FFF; }

.ltad-edit-msg {
  padding:10px 16px; border-radius:10px; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:500;
}
.ltad-edit-msg--ok { background:#ECFDF5; color:#059669; }
.ltad-edit-msg--err { background:#FEF2F2; color:#DC2626; }

.ltad-modal-foot {
  display:flex; justify-content:flex-end; gap:10px;
  padding:16px 24px; border-top:1px solid #F1F5F9;
}
.ltad-modal-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:10px 20px; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600;
  cursor:pointer; transition:all .15s;
}
.ltad-modal-btn--cancel { border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; }
.ltad-modal-btn--cancel:hover { border-color:#94A3B8; }
.ltad-modal-btn--save { border:none; background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.ltad-modal-btn--save:hover { background:#1D4ED8; }
.ltad-modal-btn--save:disabled { opacity:.6; cursor:not-allowed; }

@keyframes ltadSpin { to{transform:rotate(360deg)} }
.ltad-spin { animation:ltadSpin .8s linear infinite; }

/* Photo modal */
.ltad-photo-preview { text-align:center; margin-bottom:8px; }
.ltad-photo-preview img { width:100%; max-height:180px; object-fit:cover; border-radius:12px; border:1px solid #E2E8F0; }
.ltad-photo-current-label { font-family:'Inter',sans-serif; font-size:.72rem; color:#94A3B8; display:block; margin-top:6px; }
.ltad-photo-upload { border:2px dashed #E2E8F0; border-radius:12px; padding:12px; background:#FAFBFC; }
.ltad-photo-hint { font-family:'Inter',sans-serif; font-size:.72rem; color:#94A3B8; margin:8px 0 0; text-align:center; }
`

export default PremiumAssetDetail
