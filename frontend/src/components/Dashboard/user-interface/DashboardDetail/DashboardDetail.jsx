import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getCardSelected,
  getDashboardDetail,
  getSelectedDashboard,
  setSelectedDashboardDetail,
} from '../../slice/dashboard.slice'
import {Image} from 'primereact/image'
import {getSelectedEngine, setSelectedEngine} from '../../../Engin/slice/engin.slice'
import EnginMapLocation from '../../../Engin/EnginList/EnginMapLocation'
import {API_BASE_URL_IMAGE} from '../../../../api/config'

const DashboardDetail = () => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [mouvement, setMouvement] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const {src} = useAppSelector(getSelectedDashboard) || {}
  let selectedEngin = useAppSelector(getSelectedEngine)
  const selectedCard = useAppSelector(getCardSelected)
  const dispatch = useAppDispatch()
  const dashboardDataDetail = useAppSelector(getDashboardDetail)

  const isEngin = selectedCard?.src === 'engin' || src === 'engin'
  const data = Array.isArray(dashboardDataDetail) ? dashboardDataDetail : []

  const handleShowMap = (rowData) => {
    setMouvement('')
    dispatch(setSelectedEngine(rowData))
    setDialogVisible(true)
  }

  /* Filter data by search */
  const filtered = data.filter(item => {
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    const fields = [
      item.reference, item.label, item.vin, item.tagname, item.name,
      item.statuslabel, item.status, item.famille, item.LocationObjectname,
      item.enginAddress, item.tagAddress, item.brand, item.model,
    ]
    return fields.some(f => f && String(f).toLowerCase().includes(s))
  })

  return (
    <>
      <style>{DETAIL_STYLES}</style>
      <EnginMapLocation
        dialogVisible={dialogVisible}
        setDialogVisible={() => setDialogVisible(prev => !prev)}
        historySrc={{srcId: selectedEngin?.id, srcObject: 'engin', srcMovement: mouvement}}
      />

      {/* Search Bar */}
      <div className="dd-search-bar" data-testid="dd-search-bar">
        <i className="pi pi-search dd-search-icon"></i>
        <input
          className="dd-search-input"
          placeholder="Rechercher un asset..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          data-testid="dd-search-input"
        />
        <span className="dd-search-count">{filtered.length} résultats</span>
      </div>

      {/* Card List */}
      <div className="dd-card-list" data-testid="dd-card-list">
        {filtered.length === 0 ? (
          <div className="dd-empty" data-testid="dd-empty">
            <i className="pi pi-inbox" style={{fontSize: '2rem', color: '#CBD5E1'}}></i>
            <p className="dd-empty-title">Aucun résultat</p>
            <p className="dd-empty-desc">Essayez de modifier votre recherche</p>
          </div>
        ) : isEngin ? (
          filtered.map((item, i) => <EnginCard key={item.id || i} item={item} onShowMap={handleShowMap} />)
        ) : (
          filtered.map((item, i) => <TagCard key={item.id || i} item={item} />)
        )}
      </div>
    </>
  )
}

/* ── Engin Card ── */
const EnginCard = ({item, onShowMap}) => {
  const isExit = item.etatenginname === 'exit'
  const isEntry = item.etatenginname === 'reception'
  const etatLabel = isExit ? 'Sortie' : isEntry ? 'Entrée' : (item.etatenginname || 'Inactif')
  const etatColor = isExit ? '#EF4444' : isEntry ? '#22C55E' : '#F59E0B'
  const bat = parseInt(item.batteries, 10) || 0
  const batColor = bat >= 50 ? '#22C55E' : bat >= 20 ? '#F59E0B' : '#EF4444'
  const statusColor = item.statusbgColor || '#94A3B8'

  return (
    <div className="dd-card" data-testid={`dd-card-${item.id || item.reference}`}>
      {/* Left: Image */}
      <div className="dd-card-img">
        {item.image ? (
          <Image
            src={`${API_BASE_URL_IMAGE}${item.image}`}
            alt={item.reference || ''}
            width="56"
            height="56"
            preview
            imageStyle={{objectFit: 'cover', width: 56, height: 56, borderRadius: 10}}
          />
        ) : (
          <div className="dd-card-img-placeholder">
            <i className="pi pi-box"></i>
          </div>
        )}
      </div>

      {/* Center: Info */}
      <div className="dd-card-body">
        <div className="dd-card-row1">
          <span className="dd-card-name">{item.reference || item.label || '-'}</span>
          {item.vin && <span className="dd-card-vin">{item.vin}</span>}
        </div>
        <div className="dd-card-row2">
          {/* Etat Badge */}
          <span className="dd-badge" style={{background: `${etatColor}12`, color: etatColor}} data-testid="dd-etat-badge">
            <span className="dd-badge-dot" style={{background: etatColor}}></span>
            <i className={`pi ${isExit ? 'pi-arrow-up' : isEntry ? 'pi-arrow-down' : 'pi-exclamation-triangle'}`} style={{fontSize: '0.65rem'}}></i>
            {etatLabel}
          </span>
          {/* Status Badge */}
          <span className="dd-badge" style={{background: `${statusColor}12`, color: statusColor}} data-testid="dd-status-badge">
            <span className="dd-badge-dot" style={{background: statusColor}}></span>
            {item.statuslabel || '-'}
          </span>
          {/* Famille Badge */}
          {item.famille && (
            <span className="dd-famille-badge" style={{background: item.familleBgcolor || '#64748B'}} data-testid="dd-famille-badge">
              {item.familleIcon && <i className={item.familleIcon} style={{fontSize: '0.65rem'}}></i>}
              {item.famille}
            </span>
          )}
          {/* Tag */}
          {item.tagname && (
            <span className="dd-badge dd-badge-tag" data-testid="dd-tag-badge">
              <i className="pi pi-tag" style={{fontSize: '0.6rem'}}></i>
              {item.tagname}
            </span>
          )}
        </div>
        {/* Location */}
        {(item.LocationObjectname || item.enginAddress) && (
          <div className="dd-card-location">
            <i className="pi pi-map-marker" style={{fontSize: '0.7rem', color: '#94A3B8'}}></i>
            <span>{item.LocationObjectname || item.enginAddress}</span>
          </div>
        )}
      </div>

      {/* Right: Battery + Actions */}
      <div className="dd-card-right">
        <div className="dd-card-battery" data-testid="dd-battery">
          <div className="dd-bat-bar-outer">
            <div className="dd-bat-bar-fill" style={{width: `${Math.min(bat, 100)}%`, background: batColor}} />
          </div>
          <span className="dd-bat-pct" style={{color: batColor}}>
            {item.batteries != null && item.batteries !== '' ? `${bat}%` : 'N/A'}
          </span>
        </div>
        <button className="dd-map-btn" onClick={() => onShowMap(item)} data-testid="dd-map-btn">
          <i className="pi pi-map-marker"></i>
        </button>
        {item.locationDate && (
          <span className="dd-card-date">{item.locationDate}</span>
        )}
      </div>
    </div>
  )
}

/* ── Tag Card ── */
const TagCard = ({item}) => {
  const isActive = item.active == 1
  const statusColor = item.statusbgColor || '#94A3B8'

  return (
    <div className="dd-card" data-testid={`dd-card-${item.id || item.name}`}>
      {/* Left: Icon */}
      <div className="dd-card-img">
        <div className="dd-card-img-placeholder" style={{background: item.familleBgcolor || '#6D28D9', color: '#FFF'}}>
          <i className={item.familleIcon || 'pi pi-tag'}></i>
        </div>
      </div>

      {/* Center: Info */}
      <div className="dd-card-body">
        <div className="dd-card-row1">
          <span className="dd-card-name">{item.name || item.label || '-'}</span>
          {item.label && item.label !== item.name && <span className="dd-card-vin">{item.label}</span>}
        </div>
        <div className="dd-card-row2">
          {/* Famille Badge */}
          {item.famille && (
            <span className="dd-famille-badge" style={{background: item.familleBgcolor || '#64748B'}} data-testid="dd-tag-famille">
              {item.familleIcon && <i className={item.familleIcon} style={{fontSize: '0.65rem'}}></i>}
              {item.famille}
            </span>
          )}
          {/* Status Badge */}
          <span className="dd-badge" style={{background: `${statusColor}12`, color: statusColor}} data-testid="dd-tag-status">
            <span className="dd-badge-dot" style={{background: statusColor}}></span>
            {item.status || '-'}
          </span>
          {/* Active Badge */}
          <span className={`dd-badge ${isActive ? 'dd-badge-active' : 'dd-badge-inactive'}`} data-testid="dd-tag-active">
            <span className={`dd-badge-dot ${isActive ? 'dd-badge-dot-green' : 'dd-badge-dot-red'}`}></span>
            {isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>
        {item.tagAddress && (
          <div className="dd-card-location">
            <i className="pi pi-map-marker" style={{fontSize: '0.7rem', color: '#94A3B8'}}></i>
            <span>{item.tagAddress}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════ DETAIL STYLES ══════════════ */
const DETAIL_STYLES = `
.dd-search-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-bottom: 1px solid #F1F5F9;
  background: #FAFBFC; position: relative;
}
.dd-search-icon { color: #94A3B8; font-size: 0.9rem; }
.dd-search-input {
  flex: 1; border: none; background: transparent;
  font-family: 'Inter', sans-serif; font-size: 0.85rem;
  color: #0F172A; outline: none;
}
.dd-search-input::placeholder { color: #CBD5E1; }
.dd-search-count {
  font-size: 0.72rem; color: #94A3B8; font-weight: 600;
  white-space: nowrap; padding: 3px 10px; border-radius: 6px;
  background: #F1F5F9;
}

.dd-card-list {
  max-height: 500px; overflow-y: auto;
  padding: 8px 0;
}

.dd-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid #F8FAFC;
  transition: background 0.12s;
  cursor: default;
}
.dd-card:hover { background: #F8FAFC; }
.dd-card:last-child { border-bottom: none; }

.dd-card-img { flex-shrink: 0; }
.dd-card-img-placeholder {
  width: 56px; height: 56px; border-radius: 12px;
  background: #F1F5F9; display: flex; align-items: center;
  justify-content: center; font-size: 1.1rem; color: #94A3B8;
}

.dd-card-body { flex: 1; min-width: 0; }
.dd-card-row1 {
  display: flex; align-items: baseline; gap: 8px;
  margin-bottom: 6px;
}
.dd-card-name {
  font-weight: 700; font-size: 0.88rem; color: #0F172A;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dd-card-vin {
  font-size: 0.72rem; color: #94A3B8; font-weight: 500;
  flex-shrink: 0;
}

.dd-card-row2 {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-bottom: 4px;
}

.dd-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 6px;
  font-size: 0.7rem; font-weight: 700; white-space: nowrap;
}
.dd-badge-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.dd-badge-tag { background: #EFF6FF; color: #1E40AF; }
.dd-badge-active { background: #F0FDF4; color: #166534; }
.dd-badge-inactive { background: #FEF2F2; color: #991B1B; }
.dd-badge-dot-green { background: #22C55E; }
.dd-badge-dot-red { background: #EF4444; }

.dd-famille-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 6px;
  font-size: 0.7rem; font-weight: 700; color: #FFF;
  white-space: nowrap;
}

.dd-card-location {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.72rem; color: #64748B;
  margin-top: 2px;
}

.dd-card-right {
  display: flex; flex-direction: column; align-items: flex-end;
  gap: 6px; flex-shrink: 0;
}

.dd-card-battery {
  display: flex; align-items: center; gap: 6px;
}
.dd-bat-bar-outer {
  width: 40px; height: 16px; border-radius: 4px;
  border: 2px solid #CBD5E1; padding: 2px; background: #FFF;
  position: relative;
}
.dd-bat-bar-outer::after {
  content: ''; position: absolute; right: -4px; top: 50%;
  transform: translateY(-50%); width: 3px; height: 7px;
  border-radius: 0 2px 2px 0; background: #CBD5E1;
}
.dd-bat-bar-fill {
  height: 100%; border-radius: 2px;
  transition: width 0.4s ease;
}
.dd-bat-pct {
  font-size: 0.72rem; font-weight: 800; white-space: nowrap;
  min-width: 30px; text-align: right;
}

.dd-map-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1.5px solid #E2E8F0; background: #FFF;
  display: flex; align-items: center; justify-content: center;
  color: #3B82F6; cursor: pointer; transition: all 0.12s;
  font-size: 0.8rem;
}
.dd-map-btn:hover { background: #EFF6FF; border-color: #3B82F6; }

.dd-card-date {
  font-size: 0.65rem; color: #94A3B8; white-space: nowrap;
}

.dd-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 48px 20px; text-align: center;
}
.dd-empty-title {
  font-weight: 700; font-size: 0.95rem; color: #475569;
  margin: 8px 0 2px;
}
.dd-empty-desc { font-size: 0.8rem; color: #94A3B8; margin: 0; }
`

export default DashboardDetail
