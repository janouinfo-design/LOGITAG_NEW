import {useEffect, useState, useCallback, useRef, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {useLayoutCtx} from './PremiumLayout'
import {
  fetchEngines, getEngines, setSelectedEngine, setShow,
  fetchStatusList, getStatusList, createOrUpdateEngine,
} from '../Engin/slice/engin.slice'
import {fetchTagsWithEngin} from '../Tag/slice/tag.slice'
import {fetchValidator} from '../Inventory/slice/inventory.slice'
import {fetchSites, getSites} from '../Site/slice/site.slice'
import {fetchFamilles} from '../Famillies/slice/famille.slice'
import {API_BASE_URL_IMAGE} from '../../api/config'
import {Dialog} from 'primereact/dialog'
import EnginMapLocation from '../Engin/EnginList/EnginMapLocation'
import {
  Search, Filter, LayoutList, LayoutGrid, MapIcon, Download,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Battery, MapPin, Clock, Tag,
  Truck, X, Eye, Wifi, WifiOff, ArrowUpDown, Pencil, Save, Loader2, Columns3, CheckSquare, Square
} from 'lucide-react'

const COLUMN_DEFS = [
  {key: 'image', label: 'Photo', default: true, simple: false},
  {key: 'reference', label: 'Référence', default: true, simple: true},
  {key: 'label', label: 'Label', default: true, simple: true},
  {key: 'zone', label: 'Zone / Site', default: true, simple: true},
  {key: 'battery', label: 'Batterie', default: true, simple: false},
  {key: 'etat', label: 'État', default: true, simple: true},
  {key: 'status', label: 'Statut', default: true, simple: false},
  {key: 'lastSeen', label: 'Dernière vue', default: true, simple: false},
  {key: 'client', label: 'Client', default: false, simple: false},
  {key: 'famille', label: 'Famille', default: false, simple: false},
  {key: 'tag', label: 'Tag', default: false, simple: false},
  {key: 'vin', label: 'VIN', default: false, simple: false},
]

const PRESETS = [
  {key: 'complete', label: 'Vue complète', cols: COLUMN_DEFS.map(c => c.key)},
  {key: 'default', label: 'Vue standard', cols: COLUMN_DEFS.filter(c => c.default).map(c => c.key)},
  {key: 'simple', label: 'Vue simple', cols: COLUMN_DEFS.filter(c => c.simple).map(c => c.key)},
]

const loadSavedCols = () => {
  try {
    const saved = localStorage.getItem('lt-asset-cols')
    if (saved) return JSON.parse(saved)
  } catch {}
  return COLUMN_DEFS.filter(c => c.default).map(c => c.key)
}

/* Generate page numbers with ellipsis */
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

const PremiumAssets = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const engines = useAppSelector(getEngines)
  const sites = useAppSelector(getSites)
  const statusList = useAppSelector(getStatusList)
  const {tenant} = useLayoutCtx()

  const [viewMode, setViewMode] = useState('cards')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const rows = 15
  const [totalRecords, setTotalRecords] = useState(0)
  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState({etat: 'all', status: null})
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [mapDialogVisible, setMapDialogVisible] = useState(false)
  const [mouvement, setMouvement] = useState('')
  const [sortCol, setSortCol] = useState('reference')
  const [sortDir, setSortDir] = useState('asc')
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editSaving, setEditSaving] = useState(false)
  const [editMsg, setEditMsg] = useState(null)
  const searchRef = useRef(null)
  const [visibleCols, setVisibleCols] = useState(loadSavedCols)
  const [colPanelOpen, setColPanelOpen] = useState(false)
  const [activePreset, setActivePreset] = useState('default')

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const now = new Date()
      const diffMs = now - d
      const mins = Math.floor(diffMs / 60000)
      if (mins < 1) return "A l'instant"
      if (mins < 60) return `Il y a ${mins}min`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `Il y a ${hrs}h`
      const days = Math.floor(hrs / 24)
      if (days < 30) return `Il y a ${days}j`
      return d.toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})
    } catch { return dateStr }
  }

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
    setPage(1)
  }

  const toggleCol = (key) => {
    setVisibleCols(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      localStorage.setItem('lt-asset-cols', JSON.stringify(next))
      setActivePreset('custom')
      return next
    })
  }

  const applyPreset = (preset) => {
    setVisibleCols(preset.cols)
    localStorage.setItem('lt-asset-cols', JSON.stringify(preset.cols))
    setActivePreset(preset.key)
  }

  const isColVisible = (key) => visibleCols.includes(key)

  const getSortValue = (item, col) => {
    switch (col) {
      case 'reference': return (item.reference || item.label || '').toLowerCase()
      case 'zone': return (item.LocationObjectname || item.enginAddress || '').toLowerCase()
      case 'battery': return parseInt(item.batteries, 10) || 0
      case 'etat': return (item.etatenginname || '').toLowerCase()
      case 'status': return (item.statuslabel || '').toLowerCase()
      case 'lastSeen': return item.lastSeenAt ? new Date(item.lastSeenAt).getTime() : 0
      default: return ''
    }
  }

  const ETAT_OPTIONS = [
    {label: 'Tous', code: 'all', color: '#2563EB', bg: '#EFF6FF'},
    {label: 'Entrée', code: 'reception', color: '#059669', bg: '#ECFDF5', icon: 'fa-solid fa-down-to-bracket'},
    {label: 'Sortie', code: 'exit', color: '#D64B70', bg: '#FDF2F8', icon: 'fa-solid fa-up-from-bracket'},
  ]

  /* Fetch all data once */
  const loadData = useCallback((f = activeFilters) => {
    setLoading(true)
    const params = {
      page: 1,
      PageSize: 500,
      searchSituation: f.etat !== 'all' ? f.etat : '',
      searchStatus: f.status || '',
    }
    dispatch(fetchEngines(params)).then((res) => {
      const items = Array.isArray(res?.payload) ? res.payload : []
      setAllData(items)
      setTotalRecords(items.length)
      setLoading(false)
    })
  }, [dispatch, activeFilters])

  useEffect(() => {
    loadData()
    dispatch(fetchStatusList())
    dispatch(fetchSites())
  }, [])

  const handleSearch = (val) => {
    setSearch(val)
    setPage(1)
  }

  const handleFilterEtat = (code) => {
    const newFilters = {...activeFilters, etat: code}
    setActiveFilters(newFilters)
    setPage(1)
    loadData(newFilters)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({top: 0, behavior: 'smooth'})
  }

  /* Client-side search + sort + tenant filter */
  const filteredItems = allData.filter(item => {
    // Tenant filter
    if (tenant) {
      const cname = (item.customername || '').toLowerCase()
      const tname = (tenant.name || tenant.label || tenant.codeClient || '').toLowerCase()
      if (cname !== tname && item.IDCustomer !== tenant.id) return false
    }
    if (!search) return true
    const t = search.toLowerCase()
    return [item.reference, item.label, item.vin, item.brand, item.model, item.labeltag, item.tagname, item.LocationObjectname, item.customername]
      .some(f => f && f.toLowerCase().includes(t))
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    const valA = getSortValue(a, sortCol)
    const valB = getSortValue(b, sortCol)
    if (valA < valB) return -1 * dir
    if (valA > valB) return 1 * dir
    return 0
  })

  const totalFiltered = filteredItems.length
  const totalPages = Math.ceil(totalFiltered / rows)
  const data = filteredItems.slice((page - 1) * rows, page * rows)

  const handleViewDetail = (item) => {
    dispatch(fetchValidator('engin'))
    dispatch(setSelectedEngine(item))
    dispatch(setShow(false))
    dispatch(fetchTagsWithEngin(item.id))
    navigate('/asset/detail')
  }

  const handleShowMap = (item) => {
    dispatch(setSelectedEngine(item))
    setMapDialogVisible(true)
  }

  const openEdit = (item) => {
    setEditForm({
      reference: item.reference || '',
      label: item.label || '',
      brand: item.brand || '',
      model: item.model || '',
      vin: item.vin || '',
      immatriculation: item.immatriculation || '',
      tagname: item.labeltag || item.tagname || '',
      famille: item.famille || '',
      LocationObjectname: item.LocationObjectname || '',
      enginAddress: item.enginAddress || '',
      etatenginname: item.etatenginname || '',
      statuslabel: item.statuslabel || '',
      infosAdditionnelles: item.infosAdditionnelles || '',
    })
    setEditItem(item)
    setEditMsg(null)
  }

  const handleEditSave = async () => {
    setEditSaving(true)
    setEditMsg(null)
    const updated = {...editItem, ...editForm}
    dispatch(setSelectedEngine(updated))
    const result = await dispatch(createOrUpdateEngine({}))
    setEditSaving(false)
    if (result.payload === true) {
      setEditMsg({type: 'success', text: 'Modifié avec succès'})
      loadData()
      setTimeout(() => { setEditItem(null); setEditMsg(null) }, 1200)
    } else {
      setEditMsg({type: 'error', text: 'Erreur lors de la sauvegarde'})
    }
  }

  const getBattery = (b) => {
    if (!b && b !== 0) return {color: '#94A3B8', pct: 0, label: 'N/A'}
    const v = parseInt(b, 10)
    if (v >= 50) return {color: '#059669', pct: v, label: `${b}%`}
    if (v >= 20) return {color: '#F59E0B', pct: v, label: `${b}%`}
    return {color: '#EF4444', pct: v, label: `${b}%`}
  }

  const getEtat = (item) => {
    if (item?.etatenginname === 'exit') return {label: 'Sortie', color: '#D64B70', bg: '#FDF2F8', icon: 'fa-solid fa-up-from-bracket'}
    if (item?.etatenginname === 'reception') return {label: 'Réception', color: '#059669', bg: '#ECFDF5', icon: 'fa-solid fa-down-to-bracket'}
    return {label: item?.etatengin || 'Inconnu', color: '#94A3B8', bg: '#F1F5F9', icon: 'fas fa-circle-question'}
  }

  /* ── CARD VIEW ── */
  const renderCard = (item, i) => {
    const bat = getBattery(item.batteries)
    const etat = getEtat(item)
    return (
      <div className="lta-card" key={item.id || i} data-testid={`asset-card-${i}`}>
        <div className="lta-card-img">
          {item.image ? (
            <img src={`${API_BASE_URL_IMAGE}${item.image}`} alt="" />
          ) : (
            <div className="lta-card-img-ph"><Truck size={32} strokeWidth={1.2} /></div>
          )}
          <div className="lta-card-status-dot" style={{background: item.statusbgColor || etat.color}} title={item.statuslabel || etat.label} />
        </div>
        <div className="lta-card-body">
          <div className="lta-card-ref">{item.reference || 'N/A'}</div>
          <div className="lta-card-label">{item.label || ''}</div>
          <div className="lta-card-meta">
            {item.famille && (
              <span className="lta-chip" style={{background: item.familleBgcolor || '#EFF6FF', color: 'white'}}>
                {item.famille}
              </span>
            )}
            <span className="lta-chip" style={{background: etat.bg, color: etat.color}}>
              <i className={etat.icon} /> {etat.label}
            </span>
          </div>
          <div className="lta-card-bottom">
            <div className="lta-bat">
              <div className="lta-bat-bar"><div className="lta-bat-fill" style={{width: `${bat.pct}%`, background: bat.color}} /></div>
              <span style={{color: bat.color}}>{bat.label}</span>
            </div>
            <span className="lta-card-loc">
              <MapPin size={12} /> {item.LocationObjectname || item.enginAddress || '—'}
            </span>
          </div>
        </div>
        <div className="lta-card-actions">
          <button className="lta-act-btn" onClick={(e) => { e.stopPropagation(); handleViewDetail(item); }} title="Détails" data-testid={`asset-detail-btn-${i}`}>
            <Eye size={15} />
          </button>
          <button className="lta-act-btn" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Modifier" data-testid={`asset-edit-btn-${i}`}>
            <Pencil size={15} />
          </button>
          <button className="lta-act-btn" onClick={(e) => { e.stopPropagation(); handleShowMap(item); }} title="Carte">
            <MapIcon size={15} />
          </button>
        </div>
      </div>
    )
  }

  /* ── LIST VIEW ── */
  const renderListRow = (item, i) => {
    const bat = getBattery(item.batteries)
    const etat = getEtat(item)
    return (
      <div className="lta-row" key={item.id || i} data-testid={`asset-row-${i}`} onClick={() => handleViewDetail(item)}>
        {isColVisible('image') && <div className="lta-row-img">
          {item.image ? (
            <img src={`${API_BASE_URL_IMAGE}${item.image}`} alt="" />
          ) : (
            <div className="lta-row-img-ph"><Truck size={14} strokeWidth={1.5} /></div>
          )}
        </div>}
        {isColVisible('reference') && <div className="lta-row-main">
          <span className="lta-row-ref">{item.reference || 'N/A'}</span>
          <span className="lta-row-label">{item.label || ''}</span>
        </div>}
        {isColVisible('zone') && <div className="lta-row-zone">
          <MapPin size={11} />
          <span>{item.LocationObjectname || '—'}</span>
        </div>}
        {isColVisible('battery') && <div className="lta-row-bat">
          <div className="lta-bat-bar lta-bat-bar--sm"><div className="lta-bat-fill" style={{width: `${bat.pct}%`, background: bat.color}} /></div>
          <span style={{color: bat.color, fontSize: '.68rem', fontWeight: 600}}>{bat.label}</span>
        </div>}
        {isColVisible('etat') && <span className="lta-chip lta-chip--sm" style={{background: etat.bg, color: etat.color, fontSize: '.65rem', padding: '2px 8px'}}>
          {etat.label}
        </span>}
        {isColVisible('status') && <span className="lta-chip lta-chip--sm" style={{background: item.statusbgColor || '#94A3B8', color: item.color || '#FFF', fontSize: '.65rem', padding: '2px 8px'}}>
          {item.statuslabel || '—'}
        </span>}
        {isColVisible('lastSeen') && <span className="lta-row-lastseen">
          <Clock size={10} /> {formatTimeAgo(item.lastSeenAt)}
        </span>}
        {isColVisible('client') && <span className="lta-row-zone" style={{fontSize: '.72rem'}}>{item.customername || '—'}</span>}
        {isColVisible('famille') && <span className="lta-row-zone" style={{fontSize: '.72rem'}}>{item.famille || '—'}</span>}
        {isColVisible('tag') && <span className="lta-row-zone" style={{fontSize: '.72rem'}}>{item.labeltag || item.tagname || '—'}</span>}
        {isColVisible('vin') && <span className="lta-row-zone" style={{fontSize: '.72rem'}}>{item.vin || '—'}</span>}
      </div>
    )
  }

  /* ── DETAIL MODAL ── */
  const renderDetailModal = () => {
    if (!detailItem) return null
    const bat = getBattery(detailItem.batteries)
    const etat = getEtat(detailItem)
    const Field = ({label, value, full}) => (
      <div className={`ltm-field ${full ? 'ltm-field--full' : ''}`}>
        <span className="ltm-field-label">{label}</span>
        <div className={`ltm-field-value ${!value ? 'ltm-field-value--empty' : ''}`}>{value || '—'}</div>
      </div>
    )
    return (
      <div className="ltm">
        <div className="ltm-head">
          <h2 className="ltm-title">Détails de l'asset</h2>
          <button className="ltm-close" onClick={() => setDetailItem(null)}><X size={18} /></button>
        </div>
        {detailItem.image && <img src={`${API_BASE_URL_IMAGE}${detailItem.image}`} alt="" className="ltm-photo" />}
        <div className="ltm-section">
          <div className="ltm-section-title"><i className="fas fa-circle-info" /> STATUT</div>
          <div className="ltm-pills">
            {['reception', 'exit', 'nonactive'].map((k) => {
              const map = {reception: {l: 'Réception', c: '#059669'}, exit: {l: 'Sortie', c: '#D64B70'}, nonactive: {l: 'Non actif', c: '#EF4444'}}
              const m = map[k]
              return (
                <span key={k} className={`ltm-pill ${detailItem.etatenginname === k ? 'ltm-pill--active' : ''}`} style={detailItem.etatenginname === k ? {borderColor: m.c, background: `${m.c}10`, color: m.c} : {}}>
                  {m.l}
                </span>
              )
            })}
          </div>
        </div>
        <hr className="ltm-hr" />
        <div className="ltm-fields">
          <Field label="Référence" value={detailItem.reference} />
          <Field label="Label" value={detailItem.label} />
          <Field label="Marque" value={detailItem.brand} />
          <Field label="Modèle" value={detailItem.model} />
          <Field label="VIN" value={detailItem.vin} />
          <Field label="Immatriculation" value={detailItem.immatriculation} />
          <Field label="Famille" value={detailItem.famille} />
          <Field label="Tag" value={detailItem.labeltag || detailItem.label || '—'} />
          <Field label="Worksite" value={detailItem.LocationObjectname} />
          <Field label="Adresse" value={detailItem.enginAddress} full />
        </div>
        <hr className="ltm-hr" />
        <div className="ltm-section">
          <div className="ltm-section-title"><Battery size={16} style={{color: bat.color}} /> BATTERIE</div>
        </div>
        <div className="ltm-battery">
          <div className="ltm-bat-bar"><div className="ltm-bat-fill" style={{width: `${bat.pct}%`, background: bat.color}} /></div>
          <span style={{color: bat.color, fontWeight: 700, fontSize: '.85rem'}}>{bat.label}</span>
        </div>
        <div className="ltm-footer">
          <button className="ltm-btn ltm-btn--outline" onClick={() => {handleShowMap(detailItem); setDetailItem(null);}}>
            <MapIcon size={15} /> Voir sur la carte
          </button>
          <button className="ltm-btn ltm-btn--primary" onClick={() => {handleViewDetail(detailItem); setDetailItem(null);}}>
            <Eye size={15} /> Fiche complète
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{STYLES}</style>

      <EnginMapLocation
        dialogVisible={mapDialogVisible}
        setDialogVisible={() => setMapDialogVisible(false)}
        historySrc={{srcId: detailItem?.id, srcObject: 'engin', srcMovement: mouvement}}
      />

      <Dialog visible={!!detailItem} onHide={() => setDetailItem(null)} modal dismissableMask className="lta-modal-overlay" style={{width: '680px', maxWidth: '95vw'}}>
        {renderDetailModal()}
      </Dialog>

      <div className="lta" data-testid="premium-assets">
        {/* HEADER */}
        <div className="lta-header">
          <div>
            <h1 className="lta-title" data-testid="assets-title">Assets</h1>
            <p className="lta-subtitle">{totalFiltered} engin{totalFiltered > 1 ? 's' : ''}{search ? ` (recherche "${search}")` : ''}</p>
          </div>
          <div className="lta-header-right">
            <button className="lta-export-btn" data-testid="assets-export-btn">
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="lta-toolbar">
          <div className="lta-search-wrap">
            <Search size={16} className="lta-search-icon" />
            <input
              ref={searchRef}
              className="lta-search"
              type="text"
              placeholder="Rechercher par référence, label, VIN..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              data-testid="assets-search-input"
            />
            {search && <button className="lta-search-clear" onClick={() => handleSearch('')}><X size={14} /></button>}
          </div>
          <div className="lta-filter-chips" data-testid="assets-filter-chips">
            {ETAT_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                className={`lta-filter-chip ${activeFilters.etat === opt.code ? 'lta-filter-chip--active' : ''}`}
                style={activeFilters.etat === opt.code ? {background: opt.bg, color: opt.color, borderColor: opt.color} : {}}
                onClick={() => handleFilterEtat(opt.code)}
                data-testid={`filter-${opt.code}`}
              >
                {opt.icon && <i className={opt.icon} />}
                {opt.label}
              </button>
            ))}
          </div>
          <div className="lta-view-toggle" data-testid="assets-view-toggle">
            <button className={`lta-vt-btn ${viewMode === 'list' ? 'lta-vt-btn--active' : ''}`} onClick={() => setViewMode('list')} title="Liste">
              <LayoutList size={16} />
            </button>
            <button className={`lta-vt-btn ${viewMode === 'cards' ? 'lta-vt-btn--active' : ''}`} onClick={() => setViewMode('cards')} title="Cartes">
              <LayoutGrid size={16} />
            </button>
          </div>
          {/* Column config button */}
          <div className="lta-colcfg-wrap">
            <button className="lta-colcfg-btn" onClick={() => setColPanelOpen(!colPanelOpen)} data-testid="col-config-btn">
              <Columns3 size={15} /> Colonnes
            </button>
            {colPanelOpen && (
              <>
                <div className="lta-colcfg-backdrop" onClick={() => setColPanelOpen(false)} />
                <div className="lta-colcfg-panel" data-testid="col-config-panel">
                  <div className="lta-colcfg-head">
                    <span className="lta-colcfg-title">Configuration colonnes</span>
                    <button className="lta-colcfg-close" onClick={() => setColPanelOpen(false)}><X size={14} /></button>
                  </div>
                  <div className="lta-colcfg-presets">
                    {PRESETS.map(p => (
                      <button
                        key={p.key}
                        className={`lta-colcfg-preset ${activePreset === p.key ? 'lta-colcfg-preset--active' : ''}`}
                        onClick={() => applyPreset(p)}
                        data-testid={`col-preset-${p.key}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="lta-colcfg-list">
                    {COLUMN_DEFS.map(c => (
                      <div key={c.key} className="lta-colcfg-item" onClick={() => toggleCol(c.key)} data-testid={`col-toggle-${c.key}`}>
                        {visibleCols.includes(c.key) ? <CheckSquare size={15} className="lta-colcfg-check--on" /> : <Square size={15} className="lta-colcfg-check" />}
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CONTENT */}
        {loading && (!data || data.length === 0) ? (
          <div className="lta-loading" data-testid="assets-loading">
            {[...Array(8)].map((_, i) => <div key={i} className="lta-skeleton" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="lta-empty" data-testid="assets-empty">
            <Truck size={48} strokeWidth={1} />
            <p>Aucun asset trouvé</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="lta-grid" data-testid="assets-card-grid">
            {data.map((item, i) => renderCard(item, i))}
          </div>
        ) : (
          <div className="lta-list" data-testid="assets-list">
            <div className="lta-list-head">
              {isColVisible('image') && <span style={{width: 56}} />}
              {isColVisible('reference') && <span className="lta-lh-col lta-lh-col--main lta-lh-sort" onClick={() => handleSort('reference')} data-testid="sort-reference">
                Asset {sortCol === 'reference' && <ArrowUpDown size={11} className={sortDir === 'desc' ? 'lta-sort-desc' : ''} />}
              </span>}
              {isColVisible('zone') && <span className="lta-lh-col lta-lh-sort" onClick={() => handleSort('zone')} data-testid="sort-zone">
                Zone {sortCol === 'zone' && <ArrowUpDown size={11} className={sortDir === 'desc' ? 'lta-sort-desc' : ''} />}
              </span>}
              {isColVisible('battery') && <span className="lta-lh-col lta-lh-sort" onClick={() => handleSort('battery')} data-testid="sort-battery">
                Batterie {sortCol === 'battery' && <ArrowUpDown size={11} className={sortDir === 'desc' ? 'lta-sort-desc' : ''} />}
              </span>}
              {isColVisible('etat') && <span className="lta-lh-col lta-lh-sort" onClick={() => handleSort('etat')} data-testid="sort-etat">
                État {sortCol === 'etat' && <ArrowUpDown size={11} className={sortDir === 'desc' ? 'lta-sort-desc' : ''} />}
              </span>}
              {isColVisible('status') && <span className="lta-lh-col lta-lh-sort" onClick={() => handleSort('status')} data-testid="sort-status">
                Status {sortCol === 'status' && <ArrowUpDown size={11} className={sortDir === 'desc' ? 'lta-sort-desc' : ''} />}
              </span>}
              {isColVisible('lastSeen') && <span className="lta-lh-col lta-lh-sort" onClick={() => handleSort('lastSeen')} data-testid="sort-lastseen">
                Dernière vue {sortCol === 'lastSeen' && <ArrowUpDown size={11} className={sortDir === 'desc' ? 'lta-sort-desc' : ''} />}
              </span>}
              {isColVisible('client') && <span className="lta-lh-col">Client</span>}
              {isColVisible('famille') && <span className="lta-lh-col">Famille</span>}
              {isColVisible('tag') && <span className="lta-lh-col">Tag</span>}
              {isColVisible('vin') && <span className="lta-lh-col">VIN</span>}
            </div>
            {data.map((item, i) => renderListRow(item, i))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="lta-pagination" data-testid="assets-pagination">
            <div className="lta-pg-info-left">
              {((page - 1) * rows) + 1}–{Math.min(page * rows, totalFiltered)} sur {totalFiltered}
            </div>
            <div className="lta-pg-btns">
              <button className="lta-pg-btn" disabled={page <= 1} onClick={() => handlePageChange(1)} title="Première page" data-testid="pg-first">
                <ChevronsLeft size={15} />
              </button>
              <button className="lta-pg-btn" disabled={page <= 1} onClick={() => handlePageChange(page - 1)} title="Précédent" data-testid="pg-prev">
                <ChevronLeft size={15} />
              </button>
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`dot-${i}`} className="lta-pg-dots">...</span>
                ) : (
                  <button
                    key={p}
                    className={`lta-pg-num ${p === page ? 'lta-pg-num--active' : ''}`}
                    onClick={() => handlePageChange(p)}
                    data-testid={`pg-num-${p}`}
                  >
                    {p}
                  </button>
                )
              )}
              <button className="lta-pg-btn" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)} title="Suivant" data-testid="pg-next">
                <ChevronRight size={15} />
              </button>
              <button className="lta-pg-btn" disabled={page >= totalPages} onClick={() => handlePageChange(totalPages)} title="Dernière page" data-testid="pg-last">
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editItem && (
        <div className="lta-edit-bg" onClick={() => !editSaving && setEditItem(null)} data-testid="assets-edit-modal-overlay">
          <div className="lta-edit-modal" onClick={(e) => e.stopPropagation()} data-testid="assets-edit-modal">
            <div className="lta-edit-head">
              <h2 className="lta-edit-title">Modifier l'asset</h2>
              <button className="lta-edit-close" onClick={() => !editSaving && setEditItem(null)}><X size={18} /></button>
            </div>
            <div className="lta-edit-body">
              <div className="lta-edit-grid">
                {[
                  {key: 'reference', label: 'Référence'},
                  {key: 'label', label: 'Label'},
                  {key: 'brand', label: 'Marque'},
                  {key: 'model', label: 'Modèle'},
                  {key: 'vin', label: 'VIN'},
                  {key: 'immatriculation', label: 'Matricule'},
                  {key: 'tagname', label: 'Tag'},
                  {key: 'famille', label: 'Famille'},
                  {key: 'etatenginname', label: 'Situation'},
                  {key: 'statuslabel', label: 'Statut'},
                  {key: 'LocationObjectname', label: 'Site'},
                  {key: 'enginAddress', label: 'Adresse', full: true},
                  {key: 'infosAdditionnelles', label: 'Infos additionnelles', full: true},
                ].map(f => (
                  <div key={f.key} className={`lta-edit-field ${f.full ? 'lta-edit-field--full' : ''}`} data-testid={`assets-edit-field-${f.key}`}>
                    <label>{f.label}</label>
                    <input
                      type="text"
                      value={editForm[f.key] || ''}
                      onChange={(e) => setEditForm(prev => ({...prev, [f.key]: e.target.value}))}
                      data-testid={`assets-edit-input-${f.key}`}
                    />
                  </div>
                ))}
              </div>
              {editMsg && (
                <div className={`lta-edit-msg ${editMsg.type === 'success' ? 'lta-edit-msg--ok' : 'lta-edit-msg--err'}`}>
                  {editMsg.text}
                </div>
              )}
            </div>
            <div className="lta-edit-foot">
              <button className="lta-edit-btn lta-edit-btn--cancel" onClick={() => setEditItem(null)} disabled={editSaving}>Annuler</button>
              <button className="lta-edit-btn lta-edit-btn--save" onClick={handleEditSave} disabled={editSaving} data-testid="assets-edit-save-btn">
                {editSaving ? <><Loader2 size={14} className="lta-spin" /> Sauvegarde...</> : <><Save size={14} /> Enregistrer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const STYLES = `
.lta { max-width: 1400px; }

/* Header */
.lta-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; }
.lta-title { font-family:'Manrope',sans-serif; font-size:1.75rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.lta-subtitle { font-family:'Inter',sans-serif; font-size:.875rem; color:#64748B; margin:4px 0 0; }
.lta-header-right { display:flex; gap:8px; }
.lta-export-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:8px 18px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FFF; color:#475569; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:500;
  cursor:pointer; transition:all .15s;
}
.lta-export-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }

/* Toolbar */
.lta-toolbar { display:flex; align-items:center; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.lta-search-wrap {
  position:relative; flex:1; min-width:220px; max-width:400px;
}
.lta-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
.lta-search {
  width:100%; padding:10px 36px 10px 42px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FFF; font-size:.875rem; font-family:'Inter',sans-serif; color:#0F172A;
  outline:none; transition:all .2s;
}
.lta-search:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
.lta-search::placeholder { color:#94A3B8; }
.lta-search-clear {
  position:absolute; right:10px; top:50%; transform:translateY(-50%);
  border:none; background:transparent; color:#94A3B8; cursor:pointer; padding:4px;
}
.lta-search-clear:hover { color:#475569; }

.lta-filter-chips { display:flex; gap:6px; flex-wrap:wrap; }
.lta-filter-chip {
  display:inline-flex; align-items:center; gap:5px;
  padding:7px 14px; border-radius:8px; border:1.5px solid #E2E8F0;
  background:#FFF; color:#64748B; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:500;
  cursor:pointer; transition:all .15s; white-space:nowrap;
}
.lta-filter-chip i { font-size:.7rem; }
.lta-filter-chip:hover { border-color:#CBD5E1; }
.lta-filter-chip--active { font-weight:600; }

.lta-view-toggle { display:flex; background:#F1F5F9; border-radius:8px; padding:3px; gap:2px; }
.lta-vt-btn {
  display:flex; align-items:center; justify-content:center;
  padding:7px 12px; border-radius:6px; border:none; background:transparent;
  color:#94A3B8; cursor:pointer; transition:all .15s;
}
.lta-vt-btn--active { background:#2563EB; color:#FFF; box-shadow:0 2px 6px rgba(37,99,235,.2); }

/* Loading */
.lta-loading { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.lta-skeleton { height:240px; border-radius:14px; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; }
@keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* Empty */
.lta-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 20px; color:#CBD5E1; gap:12px; }
.lta-empty p { font-family:'Inter',sans-serif; font-size:.9rem; color:#94A3B8; margin:0; }

/* ── CARD GRID ── */
.lta-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
@media(max-width:1200px){ .lta-grid{ grid-template-columns:repeat(3,1fr); } }
@media(max-width:900px){ .lta-grid{ grid-template-columns:repeat(2,1fr); } }
@media(max-width:500px){ .lta-grid{ grid-template-columns:1fr; } }

.lta-card {
  background:#FFF; border-radius:14px; border:1px solid #E2E8F0;
  overflow:hidden; display:flex; flex-direction:column;
  transition:all .2s; cursor:pointer;
}
.lta-card:hover { border-color:#CBD5E1; box-shadow:0 8px 24px rgba(0,0,0,.06); transform:translateY(-2px); }

.lta-card-img { position:relative; width:100%; height:140px; overflow:hidden; background:#F1F5F9; }
.lta-card-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
.lta-card:hover .lta-card-img img { transform:scale(1.05); }
.lta-card-img-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#CBD5E1; background:linear-gradient(135deg,#F8FAFC,#EFF6FF); }
.lta-card-status-dot { position:absolute; top:10px; right:10px; width:10px; height:10px; border-radius:50%; border:2px solid #FFF; box-shadow:0 1px 4px rgba(0,0,0,.15); }

.lta-card-body { padding:14px 16px; display:flex; flex-direction:column; gap:6px; flex:1; }
.lta-card-ref { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; color:#0F172A; }
.lta-card-label { font-family:'Inter',sans-serif; font-size:.75rem; color:#64748B; }
.lta-card-meta { display:flex; flex-wrap:wrap; gap:5px; margin-top:2px; }
.lta-chip { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600; white-space:nowrap; }
.lta-chip i { font-size:.6rem; }
.lta-chip--sm { font-size:.65rem; padding:2px 8px; }

.lta-card-bottom { margin-top:auto; padding-top:10px; border-top:1px solid #F1F5F9; display:flex; align-items:center; justify-content:space-between; gap:8px; }
.lta-bat { display:flex; align-items:center; gap:6px; font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:600; }
.lta-bat-bar { width:50px; height:5px; border-radius:3px; background:#F1F5F9; overflow:hidden; }
.lta-bat-bar--sm { width:40px; height:4px; }
.lta-bat-fill { height:100%; border-radius:3px; transition:width .6s; }
.lta-card-loc { display:flex; align-items:center; gap:4px; font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:140px; }

.lta-card-actions { display:flex; border-top:1px solid #F1F5F9; }
.lta-act-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border:none; background:transparent; color:#64748B; cursor:pointer; transition:all .12s; font-size:.78rem; }
.lta-act-btn + .lta-act-btn { border-left:1px solid #F1F5F9; }
.lta-act-btn:hover { background:#EFF6FF; color:#2563EB; }

/* ── LIST VIEW ── */
.lta-list { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; }
.lta-list-head { display:flex; align-items:center; gap:8px; padding:8px 16px; background:#FAFBFC; border-bottom:1px solid #F1F5F9; }
.lta-lh-col { flex:1; font-family:'Inter',sans-serif; font-size:.65rem; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:.04em; }
.lta-lh-col--main { flex:2; }
.lta-lh-sort { cursor:pointer; display:flex; align-items:center; gap:4px; transition:color .15s; user-select:none; }
.lta-lh-sort:hover { color:#2563EB; }
.lta-sort-desc { transform:rotate(180deg); }

.lta-row { display:flex; align-items:center; gap:8px; padding:8px 16px; border-bottom:1px solid #F8FAFC; cursor:pointer; transition:background .1s; }
.lta-row:hover { background:#FAFBFC; }
.lta-row:last-child { border-bottom:none; }
.lta-row-img { width:32px; height:32px; border-radius:6px; overflow:hidden; flex-shrink:0; background:#F1F5F9; }
.lta-row-img img { width:100%; height:100%; object-fit:cover; }
.lta-row-img-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#CBD5E1; }
.lta-row-main { flex:2; display:flex; flex-direction:column; gap:1px; min-width:0; }
.lta-row-ref { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.lta-row-label { font-family:'Inter',sans-serif; font-size:.65rem; color:#94A3B8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.lta-row-zone { flex:1; display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; min-width:0; }
.lta-row-zone span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.lta-row-bat { flex:1; display:flex; align-items:center; gap:4px; }
.lta-row-lastseen { flex:1; display:flex; align-items:center; gap:3px; font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; white-space:nowrap; }

/* Pagination */
.lta-pagination { display:flex; align-items:center; justify-content:space-between; margin-top:28px; padding:16px 20px; background:#FFF; border-radius:12px; border:1px solid #E2E8F0; }
.lta-pg-info-left { font-family:'Inter',sans-serif; font-size:.78rem; color:#94A3B8; font-weight:500; }
.lta-pg-btns { display:flex; align-items:center; gap:4px; }
.lta-pg-btn { display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#475569; cursor:pointer; transition:all .15s; }
.lta-pg-btn:hover:not(:disabled) { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.lta-pg-btn:disabled { opacity:.3; cursor:not-allowed; }
.lta-pg-num { display:flex; align-items:center; justify-content:center; min-width:34px; height:34px; border-radius:8px; border:none; background:transparent; color:#64748B; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; padding:0 4px; }
.lta-pg-num:hover { background:#F1F5F9; color:#0F172A; }
.lta-pg-num--active { background:#2563EB !important; color:#FFF !important; box-shadow:0 2px 6px rgba(37,99,235,.25); }
.lta-pg-dots { font-family:'Inter',sans-serif; font-size:.82rem; color:#CBD5E1; padding:0 2px; }
@media(max-width:640px) { .lta-pg-info-left { display:none; } .lta-pagination { justify-content:center; } }

/* ── COLUMN CONFIG ── */
.lta-colcfg-wrap { position:relative; margin-left:auto; }
.lta-colcfg-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:8px 14px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FFF; color:#64748B; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600;
  cursor:pointer; transition:all .15s;
}
.lta-colcfg-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.lta-colcfg-backdrop { position:fixed; inset:0; z-index:49; }
.lta-colcfg-panel {
  position:absolute; top:calc(100% + 6px); right:0; z-index:50;
  width:280px; max-height:420px; overflow-y:auto;
  background:#FFF; border-radius:14px; border:1px solid #E2E8F0;
  box-shadow:0 12px 32px rgba(0,0,0,.12);
  animation:ltaColIn .15s ease;
}
@keyframes ltaColIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
.lta-colcfg-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 16px; border-bottom:1px solid #F1F5F9;
}
.lta-colcfg-title { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:800; color:#0F172A; }
.lta-colcfg-close {
  width:28px; height:28px; border-radius:8px; border:none; background:transparent;
  color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center;
}
.lta-colcfg-close:hover { background:#FEF2F2; color:#EF4444; }
.lta-colcfg-presets { display:flex; gap:6px; padding:12px 16px; border-bottom:1px solid #F1F5F9; }
.lta-colcfg-preset {
  flex:1; padding:7px; border-radius:8px; border:1.5px solid #E2E8F0;
  background:#FFF; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600;
  color:#64748B; cursor:pointer; text-align:center; transition:all .12s;
}
.lta-colcfg-preset:hover { border-color:#2563EB; color:#2563EB; }
.lta-colcfg-preset--active { background:#2563EB; color:#FFF; border-color:#2563EB; }
.lta-colcfg-list { padding:8px; }
.lta-colcfg-item {
  display:flex; align-items:center; gap:10px;
  padding:9px 12px; border-radius:8px; cursor:pointer;
  font-family:'Inter',sans-serif; font-size:.78rem; color:#475569;
  transition:background .1s;
}
.lta-colcfg-item:hover { background:#F8FAFC; }
.lta-colcfg-check { color:#CBD5E1; }
.lta-colcfg-check--on { color:#2563EB; }

/* ── DETAIL MODAL ── */
.lta-modal-overlay .p-dialog-header { display:none !important; }
.lta-modal-overlay .p-dialog-content { padding:0 !important; border-radius:16px !important; }
.lta-modal-overlay .p-dialog { border-radius:16px !important; box-shadow:0 20px 60px rgba(0,0,0,.18) !important; border:none !important; }

.ltm { font-family:'Inter',sans-serif; }
.ltm-head { display:flex; align-items:center; justify-content:space-between; padding:24px 28px 16px; border-bottom:1px solid #F1F5F9; }
.ltm-title { font-family:'Manrope',sans-serif; font-size:1.25rem; font-weight:800; color:#0F172A; margin:0; }
.ltm-close { width:36px; height:36px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.ltm-close:hover { border-color:#EF4444; color:#EF4444; background:#FEF2F2; }
.ltm-photo { width:100%; max-height:200px; object-fit:cover; }
.ltm-section { padding:16px 28px; }
.ltm-section-title { display:flex; align-items:center; gap:8px; font-family:'Manrope',sans-serif; font-size:.8rem; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.05em; margin-bottom:12px; }
.ltm-pills { display:flex; gap:8px; flex-wrap:wrap; }
.ltm-pill { padding:8px 18px; border-radius:10px; border:1.5px solid #E2E8F0; font-family:'Manrope',sans-serif; font-size:.8rem; font-weight:600; color:#94A3B8; }
.ltm-pill--active { font-weight:700; }
.ltm-hr { border:none; border-top:1px solid #F1F5F9; margin:0; }
.ltm-fields { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:16px 28px; }
.ltm-field { display:flex; flex-direction:column; gap:4px; }
.ltm-field--full { grid-column:1/-1; }
.ltm-field-label { font-family:'Manrope',sans-serif; font-size:.68rem; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.05em; }
.ltm-field-value { padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-size:.85rem; color:#0F172A; min-height:40px; display:flex; align-items:center; }
.ltm-field-value--empty { color:#CBD5E1; font-style:italic; }
.ltm-battery { display:flex; align-items:center; gap:12px; padding:0 28px 20px; }
.ltm-bat-bar { flex:1; height:8px; border-radius:4px; background:#F1F5F9; overflow:hidden; }
.ltm-bat-fill { height:100%; border-radius:4px; transition:width .4s; }
.ltm-footer { display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:16px 28px; border-top:1px solid #F1F5F9; }
.ltm-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; }
.ltm-btn--outline { border:1.5px solid #E2E8F0; background:#FFF; color:#475569; }
.ltm-btn--outline:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.ltm-btn--primary { border:none; background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.ltm-btn--primary:hover { background:#1D4ED8; }

@media(max-width:768px){
  .lta-toolbar { flex-direction:column; align-items:stretch; }
  .lta-search-wrap { max-width:100%; }
  .lta-view-toggle { margin-left:0; }
  .lta-loading { grid-template-columns:1fr; }
  .ltm-fields { grid-template-columns:1fr; }
  .lta-list-head { display:none; }
  .lta-row { flex-wrap:wrap; }
}

/* ── EDIT MODAL (Assets) ── */
.lta-edit-bg {
  position:fixed; inset:0; background:rgba(15,23,42,.5); backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;
}
.lta-edit-modal {
  background:#FFF; border-radius:16px; width:100%; max-width:620px;
  box-shadow:0 20px 60px rgba(0,0,0,.18); overflow:hidden;
  animation:ltaSlideUp .25s ease; max-height:90vh; display:flex; flex-direction:column;
}
@keyframes ltaSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
.lta-edit-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px; border-bottom:1px solid #F1F5F9;
}
.lta-edit-title { font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; margin:0; }
.lta-edit-close {
  width:36px; height:36px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FFF; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s;
}
.lta-edit-close:hover { border-color:#EF4444; color:#EF4444; background:#FEF2F2; }
.lta-edit-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; overflow-y:auto; flex:1; }
.lta-edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.lta-edit-field { display:flex; flex-direction:column; gap:4px; }
.lta-edit-field--full { grid-column:1/-1; }
.lta-edit-field label {
  font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700;
  color:#64748B; text-transform:uppercase; letter-spacing:.04em;
}
.lta-edit-field input {
  padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FAFBFC; font-family:'Inter',sans-serif; font-size:.85rem; color:#0F172A;
  outline:none; transition:all .2s;
}
.lta-edit-field input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); background:#FFF; }
.lta-edit-msg { padding:10px 16px; border-radius:10px; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:500; }
.lta-edit-msg--ok { background:#ECFDF5; color:#059669; }
.lta-edit-msg--err { background:#FEF2F2; color:#DC2626; }
.lta-edit-foot { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:1px solid #F1F5F9; }
.lta-edit-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:10px 20px; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600;
  cursor:pointer; transition:all .15s;
}
.lta-edit-btn--cancel { border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; }
.lta-edit-btn--cancel:hover { border-color:#94A3B8; }
.lta-edit-btn--save { border:none; background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.lta-edit-btn--save:hover { background:#1D4ED8; }
.lta-edit-btn--save:disabled { opacity:.6; cursor:not-allowed; }
@keyframes ltaSpin { to{transform:rotate(360deg)} }
.lta-spin { animation:ltaSpin .8s linear infinite; }
`

export default PremiumAssets
