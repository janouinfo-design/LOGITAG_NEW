import {useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  getCardSelected,
  getDashboardDetail,
  getSelectedDashboard,
} from '../../slice/dashboard.slice'
import {Image} from 'primereact/image'
import {getSelectedEngine, setSelectedEngine} from '../../../Engin/slice/engin.slice'
import EnginMapLocation from '../../../Engin/EnginList/EnginMapLocation'
import {API_BASE_URL_IMAGE} from '../../../../api/config'

const DashboardDetail = () => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [mouvement, setMouvement] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')

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
      <EnginMapLocation
        dialogVisible={dialogVisible}
        setDialogVisible={() => setDialogVisible(prev => !prev)}
        historySrc={{srcId: selectedEngin?.id, srcObject: 'engin', srcMovement: mouvement}}
      />

      {/* Toolbar: Search + View Toggle */}
      <div className="dd-toolbar" data-testid="dd-toolbar">
        <div className="dd-search-wrap">
          <i className="pi pi-search dd-search-icon"></i>
          <input
            className="dd-search-input"
            placeholder="Rechercher un asset..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            data-testid="dd-search-input"
          />
        </div>
        <div className="lt-view-toggle" data-testid="dd-view-toggle">
          <button
            className={`lt-view-btn ${viewMode === 'grid' ? 'lt-view-btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vue vignettes"
            data-testid="dd-view-grid"
          >
            <i className="pi pi-th-large"></i>
          </button>
          <button
            className={`lt-view-btn ${viewMode === 'line' ? 'lt-view-btn--active' : ''}`}
            onClick={() => setViewMode('line')}
            title="Vue ligne"
            data-testid="dd-view-line"
          >
            <i className="pi pi-list"></i>
          </button>
        </div>
        <span className="dd-result-count">{filtered.length} résultats</span>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="dd-empty" data-testid="dd-empty">
          <i className="pi pi-inbox" style={{fontSize: '2rem', color: '#CBD5E1'}}></i>
          <p className="dd-empty-title">Aucun résultat</p>
          <p className="dd-empty-desc">Essayez de modifier votre recherche</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID / VIGNETTES ── */
        <div className="lt-vignette-grid" data-testid="dd-grid-view" style={{maxHeight: 520, overflowY: 'auto'}}>
          {filtered.map((item, i) =>
            isEngin
              ? <EnginVCard key={item.id || i} item={item} onShowMap={handleShowMap} />
              : <TagVCard key={item.id || i} item={item} />
          )}
        </div>
      ) : (
        /* ── LINE VIEW ── */
        <div className="dd-line-list" data-testid="dd-line-view" style={{maxHeight: 520, overflowY: 'auto'}}>
          {filtered.map((item, i) =>
            isEngin
              ? <EnginLineCard key={item.id || i} item={item} onShowMap={handleShowMap} />
              : <TagLineCard key={item.id || i} item={item} />
          )}
        </div>
      )}
    </>
  )
}

/* ══════ ENGIN VIGNETTE CARD (Square) ══════ */
const EnginVCard = ({item, onShowMap}) => {
  const isExit = item.etatenginname === 'exit'
  const isEntry = item.etatenginname === 'reception'
  const etatLabel = isExit ? 'Sortie' : isEntry ? 'Entrée' : (item.etatenginname || 'Inactif')
  const etatColor = isExit ? '#EF4444' : isEntry ? '#22C55E' : '#F59E0B'
  const bat = parseInt(item.batteries, 10) || 0
  const batColor = bat >= 50 ? '#22C55E' : bat >= 20 ? '#F59E0B' : '#EF4444'
  const statusColor = item.statusbgColor || '#94A3B8'

  return (
    <div className="lt-vcard" data-testid={`dd-vcard-${item.id || ''}`}>
      {/* Photo */}
      {item.image ? (
        <div className="lt-vcard-img">
          <Image
            src={`${API_BASE_URL_IMAGE}${item.image}`}
            alt={item.reference || ''}
            width="72" height="72" preview
            imageStyle={{objectFit: 'cover', width: 72, height: 72}}
          />
        </div>
      ) : (
        <div className="lt-vcard-img-ph" style={{background: '#F1F5F9', color: '#94A3B8'}}>
          <i className="pi pi-box"></i>
        </div>
      )}

      {/* Name */}
      <div className="lt-vcard-name">{item.reference || item.label || '-'}</div>
      {item.vin && <div className="lt-vcard-sub">{item.vin}</div>}

      {/* Badges */}
      <div className="lt-vcard-badges">
        <span className="lt-badge" style={{background: `${etatColor}15`, color: etatColor}}>
          <span className="lt-badge-dot" style={{background: etatColor}}></span>
          {etatLabel}
        </span>
        <span className="lt-badge" style={{background: `${statusColor}15`, color: statusColor}}>
          <span className="lt-badge-dot" style={{background: statusColor}}></span>
          {item.statuslabel || '-'}
        </span>
        {item.famille && (
          <span className="lt-famille-chip" style={{background: item.familleBgcolor || '#64748B', fontSize: '0.7rem', padding: '2px 8px'}}>
            {item.famille}
          </span>
        )}
      </div>

      {/* Geolocation button - CENTERED */}
      <button className="lt-vcard-geo" onClick={() => onShowMap(item)} data-testid="dd-vcard-geo">
        <i className="pi pi-map-marker"></i>
        Localiser
      </button>

      {/* Footer: Location + Battery */}
      <div className="lt-vcard-footer">
        <div className="lt-vcard-loc">
          <i className="pi pi-map-marker"></i>
          {item.LocationObjectname || item.enginAddress || '-'}
        </div>
        <div className="lt-battery" style={{gap: 5}}>
          <div className="lt-battery-bar-wrap" style={{width: 32, height: 16}}>
            <div className="lt-battery-bar-fill" style={{width: `${Math.min(bat, 100)}%`, background: batColor}} />
          </div>
          <span style={{fontSize: '0.72rem', fontWeight: 800, color: batColor}}>
            {item.batteries != null && item.batteries !== '' ? `${bat}%` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ══════ TAG VIGNETTE CARD (Square) ══════ */
const TagVCard = ({item}) => {
  const isActive = item.active == 1
  const statusColor = item.statusbgColor || '#94A3B8'

  return (
    <div className="lt-vcard" data-testid={`dd-vcard-${item.id || ''}`}>
      {/* Icon */}
      <div className="lt-vcard-img-ph" style={{background: item.familleBgcolor || '#6D28D9', color: '#FFF'}}>
        <i className={item.familleIcon || 'pi pi-tag'}></i>
      </div>

      {/* Name */}
      <div className="lt-vcard-name">{item.name || item.label || '-'}</div>

      {/* Badges */}
      <div className="lt-vcard-badges">
        {item.famille && (
          <span className="lt-famille-chip" style={{background: item.familleBgcolor || '#64748B', fontSize: '0.7rem', padding: '2px 8px'}}>
            {item.famille}
          </span>
        )}
        <span className="lt-badge" style={{background: `${statusColor}15`, color: statusColor}}>
          <span className="lt-badge-dot" style={{background: statusColor}}></span>
          {item.status || '-'}
        </span>
        <span className={`lt-badge ${isActive ? 'lt-badge-success' : 'lt-badge-danger'}`}>
          <span className={`lt-badge-dot ${isActive ? 'lt-badge-dot-success' : 'lt-badge-dot-danger'}`}></span>
          {isActive ? 'Actif' : 'Inactif'}
        </span>
      </div>

      {/* Footer */}
      {item.tagAddress && (
        <div className="lt-vcard-footer" style={{justifyContent: 'center'}}>
          <div className="lt-vcard-loc" style={{maxWidth: '100%'}}>
            <i className="pi pi-map-marker"></i>
            {item.tagAddress}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════ ENGIN LINE CARD (Horizontal) ══════ */
const EnginLineCard = ({item, onShowMap}) => {
  const isExit = item.etatenginname === 'exit'
  const isEntry = item.etatenginname === 'reception'
  const etatLabel = isExit ? 'Sortie' : isEntry ? 'Entrée' : (item.etatenginname || 'Inactif')
  const etatColor = isExit ? '#EF4444' : isEntry ? '#22C55E' : '#F59E0B'
  const bat = parseInt(item.batteries, 10) || 0
  const batColor = bat >= 50 ? '#22C55E' : bat >= 20 ? '#F59E0B' : '#EF4444'
  const statusColor = item.statusbgColor || '#94A3B8'

  return (
    <div className="dd-line-card" data-testid={`dd-line-${item.id || ''}`}>
      {item.image ? (
        <div className="lt-img-cell">
          <Image
            src={`${API_BASE_URL_IMAGE}${item.image}`} alt="" width="48" height="48" preview
            imageStyle={{objectFit: 'cover', width: 48, height: 48}}
          />
        </div>
      ) : (
        <div className="lt-vcard-img-ph" style={{width: 48, height: 48, borderRadius: 10, background: '#F1F5F9', color: '#94A3B8', fontSize: '1rem'}}>
          <i className="pi pi-box"></i>
        </div>
      )}
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontWeight: 700, fontSize: '0.85rem', color: '#0F172A'}}>{item.reference || item.label || '-'}</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4}}>
          <span className="lt-badge" style={{background: `${etatColor}15`, color: etatColor, fontSize: '0.68rem', padding: '2px 7px'}}>
            <span className="lt-badge-dot" style={{background: etatColor, width: 5, height: 5}}></span>{etatLabel}
          </span>
          <span className="lt-badge" style={{background: `${statusColor}15`, color: statusColor, fontSize: '0.68rem', padding: '2px 7px'}}>
            <span className="lt-badge-dot" style={{background: statusColor, width: 5, height: 5}}></span>{item.statuslabel || '-'}
          </span>
          {item.famille && (
            <span className="lt-famille-chip" style={{background: item.familleBgcolor || '#64748B', fontSize: '0.68rem', padding: '2px 7px'}}>{item.famille}</span>
          )}
        </div>
        {(item.LocationObjectname || item.enginAddress) && (
          <div style={{fontSize: '0.7rem', color: '#94A3B8', marginTop: 3, display: 'flex', gap: 3, alignItems: 'center'}}>
            <i className="pi pi-map-marker" style={{fontSize: '0.6rem'}}></i>
            {item.LocationObjectname || item.enginAddress}
          </div>
        )}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0}}>
        <div className="lt-battery" style={{gap: 5}}>
          <div className="lt-battery-bar-wrap" style={{width: 32, height: 16}}>
            <div className="lt-battery-bar-fill" style={{width: `${Math.min(bat, 100)}%`, background: batColor}} />
          </div>
          <span style={{fontSize: '0.72rem', fontWeight: 800, color: batColor}}>
            {item.batteries != null && item.batteries !== '' ? `${bat}%` : 'N/A'}
          </span>
        </div>
        <button className="dd-map-btn" onClick={() => onShowMap(item)} style={{width: 28, height: 28, borderRadius: 7, border: '1.5px solid #E2E8F0', background: '#FFF', color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'}}>
          <i className="pi pi-map-marker"></i>
        </button>
      </div>
    </div>
  )
}

/* ══════ TAG LINE CARD (Horizontal) ══════ */
const TagLineCard = ({item}) => {
  const isActive = item.active == 1
  const statusColor = item.statusbgColor || '#94A3B8'

  return (
    <div className="dd-line-card" data-testid={`dd-line-${item.id || ''}`}>
      <div className="lt-vcard-img-ph" style={{width: 48, height: 48, borderRadius: 10, background: item.familleBgcolor || '#6D28D9', color: '#FFF', fontSize: '1rem'}}>
        <i className={item.familleIcon || 'pi pi-tag'}></i>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontWeight: 700, fontSize: '0.85rem', color: '#0F172A'}}>{item.name || item.label || '-'}</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4}}>
          {item.famille && <span className="lt-famille-chip" style={{background: item.familleBgcolor || '#64748B', fontSize: '0.68rem', padding: '2px 7px'}}>{item.famille}</span>}
          <span className="lt-badge" style={{background: `${statusColor}15`, color: statusColor, fontSize: '0.68rem', padding: '2px 7px'}}>
            <span className="lt-badge-dot" style={{background: statusColor, width: 5, height: 5}}></span>{item.status || '-'}
          </span>
          <span className={`lt-badge ${isActive ? 'lt-badge-success' : 'lt-badge-danger'}`} style={{fontSize: '0.68rem', padding: '2px 7px'}}>
            <span className={`lt-badge-dot ${isActive ? 'lt-badge-dot-success' : 'lt-badge-dot-danger'}`} style={{width: 5, height: 5}}></span>
            {isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DashboardDetail
