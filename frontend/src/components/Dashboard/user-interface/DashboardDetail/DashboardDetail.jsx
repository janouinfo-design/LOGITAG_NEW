import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {
  fetchDashboardDetail,
  getCardSelected,
  getDashboardDetail,
  getSelectedDashboard,
  setEditDashboard,
  setSelectedDashboardDetail,
} from '../../slice/dashboard.slice'
import {Image} from 'primereact/image'
import {Chip} from 'primereact/chip'
import {Dialog} from 'primereact/dialog'
import {getSelectedEngine, setSelectedEngine} from '../../../Engin/slice/engin.slice'
import EnginMapLocation from '../../../Engin/EnginList/EnginMapLocation'
import {API_BASE_URL_IMAGE} from '../../../../api/config'

/* ───── helpers ───── */
const getBatteryInfo = (batteries) => {
  if (!batteries && batteries !== 0) return {icon: 'fas fa-battery-empty', color: '#94A3B8', label: 'N/A', pct: 0}
  const val = parseInt(batteries, 10)
  if (val >= 80) return {icon: 'fas fa-battery-full', color: '#10B981', label: `${batteries}%`, pct: val}
  if (val >= 50) return {icon: 'fas fa-battery-three-quarters', color: '#10B981', label: `${batteries}%`, pct: val}
  if (val >= 20) return {icon: 'fas fa-battery-half', color: '#F59E0B', label: `${batteries}%`, pct: val}
  if (val > 0) return {icon: 'fas fa-battery-quarter', color: '#EF4444', label: `${batteries}%`, pct: val}
  return {icon: 'fas fa-battery-empty', color: '#EF4444', label: '0%', pct: 0}
}

const getEtatInfo = (rowData) => {
  if (rowData?.etatenginname === 'exit') return {icon: 'fa-solid fa-up-from-bracket', color: '#D64B70', label: 'Sortie', key: 'exit'}
  if (rowData?.etatenginname === 'reception') return {icon: 'fa-solid fa-down-to-bracket', color: '#10B981', label: 'Réception', key: 'reception'}
  if (rowData?.etatenginname === 'nonactive') return {icon: 'fa-solid fa-octagon-exclamation', color: '#EF4444', label: 'Non actif', key: 'nonactive'}
  return {icon: 'fas fa-circle-question', color: '#94A3B8', label: rowData?.etatengin || 'Inconnu', key: 'unknown'}
}

const CARD_STYLES = `
/* ═══════════════════════════════════════════
   LOGITAG Card Grid v2 – Car-rental style
   ═══════════════════════════════════════════ */

.lt-detail-wrapper { width: 100%; }

/* Search */
.lt-search-bar { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.lt-search-wrap { position:relative; flex:1; max-width:360px; }
.lt-search-wrap i { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94A3B8; font-size:.85rem; pointer-events:none; }
.lt-search-input {
  width:100%; padding:10px 16px 10px 40px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FFF; font-size:.875rem; font-family:'Inter',sans-serif; color:#0F172A;
  transition:all .2s ease; outline:none;
}
.lt-search-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
.lt-search-input::placeholder { color:#94A3B8; }
.lt-result-count { font-family:'Inter',sans-serif; font-size:.8rem; color:#94A3B8; white-space:nowrap; }

/* ── Grid: 5 cols desktop ── */
.lt-card-grid {
  display:grid;
  grid-template-columns: repeat(5, 1fr);
  gap:18px; width:100%;
}
@media(max-width:1400px){ .lt-card-grid{ grid-template-columns:repeat(4,1fr); } }
@media(max-width:1100px){ .lt-card-grid{ grid-template-columns:repeat(3,1fr); } }
@media(max-width:768px) { .lt-card-grid{ grid-template-columns:repeat(2,1fr); } }
@media(max-width:480px) { .lt-card-grid{ grid-template-columns:1fr; } }

/* ── Card ── */
.lt-card2 {
  background:#FFF; border-radius:14px; border:1px solid #E2E8F0;
  overflow:hidden; display:flex; flex-direction:column;
  transition:all .25s ease; animation:ltCardIn .35s ease-out backwards;
}
.lt-card2:nth-child(1){animation-delay:0s}
.lt-card2:nth-child(2){animation-delay:.03s}
.lt-card2:nth-child(3){animation-delay:.06s}
.lt-card2:nth-child(4){animation-delay:.09s}
.lt-card2:nth-child(5){animation-delay:.12s}
.lt-card2:nth-child(6){animation-delay:.15s}
.lt-card2:nth-child(7){animation-delay:.18s}
.lt-card2:nth-child(8){animation-delay:.21s}
.lt-card2:nth-child(9){animation-delay:.24s}
.lt-card2:nth-child(10){animation-delay:.27s}
@keyframes ltCardIn {
  from{opacity:0;transform:translateY(14px) scale(.97)}
  to{opacity:1;transform:translateY(0) scale(1)}
}
.lt-card2:hover { border-color:#CBD5E1; box-shadow:0 8px 28px rgba(0,0,0,.07); transform:translateY(-3px); }

/* Card header row */
.lt-c-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 14px 8px; gap:8px;
}
.lt-c-ref {
  font-family:'Manrope',sans-serif; font-size:.9rem; font-weight:700;
  color:#0F172A; letter-spacing:-.01em; white-space:nowrap;
  overflow:hidden; text-overflow:ellipsis;
}
.lt-c-details-btn {
  display:inline-flex; align-items:center; gap:4px;
  padding:5px 12px; border-radius:8px; border:none;
  background:#2563EB; color:#FFF;
  font-family:'Manrope',sans-serif; font-size:.7rem; font-weight:600;
  cursor:pointer; transition:all .2s ease; white-space:nowrap;
  box-shadow:0 2px 6px rgba(37,99,235,.2);
}
.lt-c-details-btn:hover { background:#1D4ED8; box-shadow:0 4px 12px rgba(37,99,235,.3); }
.lt-c-details-btn i { font-size:.65rem; }

/* Card image */
.lt-c-img-wrap {
  position:relative; width:100%; height:150px; overflow:hidden; background:#F1F5F9;
}
.lt-c-img { width:100%; height:100%; object-fit:cover; transition:transform .4s ease; }
.lt-card2:hover .lt-c-img { transform:scale(1.05); }
.lt-c-img-ph {
  width:100%; height:100%; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#F1F5F9 0%,#E2E8F0 100%);
}
.lt-c-img-ph i { font-size:2.2rem; color:#CBD5E1; }
.lt-c-status-dot {
  position:absolute; top:10px; right:10px; width:12px; height:12px;
  border-radius:50%; border:2px solid #FFF; box-shadow:0 1px 4px rgba(0,0,0,.2);
}

/* Card icon area (tags) */
.lt-c-icon-area {
  width:100%; height:90px; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#EFF6FF 0%,#F8FAFC 100%);
}
.lt-c-icon-area i { font-size:2.2rem; }

/* Card body */
.lt-c-body { padding:10px 14px 14px; display:flex; flex-direction:column; gap:6px; flex:1; }
.lt-c-famille {
  font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700;
  color:#2563EB; text-transform:uppercase; letter-spacing:.04em;
}
.lt-c-label {
  font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700;
  color:#0F172A; line-height:1.25; letter-spacing:-.01em;
}

/* Chips row */
.lt-c-chips { display:flex; flex-wrap:wrap; gap:5px; margin-top:4px; }
.lt-c-chip {
  display:inline-flex; align-items:center; gap:4px;
  padding:3px 9px; border-radius:6px; background:#F1F5F9;
  font-family:'Inter',sans-serif; font-size:.68rem; font-weight:500;
  color:#475569; white-space:nowrap;
}
.lt-c-chip i { font-size:.62rem; }
.lt-c-chip--green { background:#ECFDF5; color:#059669; }
.lt-c-chip--red { background:#FEF2F2; color:#DC2626; }
.lt-c-chip--orange { background:#FFF7ED; color:#EA580C; }
.lt-c-chip--blue { background:#EFF6FF; color:#2563EB; }
.lt-c-chip--purple { background:#F5F3FF; color:#7C3AED; }

/* Card footer */
.lt-c-footer {
  margin-top:auto; padding-top:8px; border-top:1px solid #F1F5F9;
  display:flex; align-items:center; gap:8px;
  font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8;
}
.lt-c-footer i { font-size:.65rem; color:#CBD5E1; flex-shrink:0; }
.lt-c-footer span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* Empty */
.lt-empty-state {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:60px 20px; background:#FFF; border-radius:16px; border:1px dashed #CBD5E1; width:100%;
}
.lt-empty-state i { font-size:2.5rem; color:#CBD5E1; margin-bottom:12px; }
.lt-empty-state p { font-family:'Inter',sans-serif; font-size:.925rem; color:#94A3B8; margin:0; }

/* ═══════════════════════════════════
   DETAIL MODAL – Car-rental style
   ═══════════════════════════════════ */
.lt-modal-overlay .p-dialog-header { display:none !important; }
.lt-modal-overlay .p-dialog-content { padding:0 !important; border-radius:16px !important; }
.lt-modal-overlay .p-dialog { border-radius:16px !important; box-shadow:0 20px 60px rgba(0,0,0,.18) !important; border:none !important; }

.lt-modal {
  width:100%; max-width:680px; padding:0;
  font-family:'Inter',sans-serif;
}
.lt-modal-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:24px 28px 16px; border-bottom:1px solid #F1F5F9;
}
.lt-modal-title {
  font-family:'Manrope',sans-serif; font-size:1.3rem; font-weight:800;
  color:#0F172A; letter-spacing:-.02em; margin:0;
}
.lt-modal-close {
  width:36px; height:36px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FFF; color:#94A3B8; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:all .2s; font-size:1rem;
}
.lt-modal-close:hover { border-color:#EF4444; color:#EF4444; background:#FEF2F2; }

/* Status selector */
.lt-modal-section { padding:16px 28px; }
.lt-modal-section-title {
  display:flex; align-items:center; gap:8px; margin-bottom:14px;
  font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700;
  color:#64748B; text-transform:uppercase; letter-spacing:.06em;
}
.lt-modal-section-title i { font-size:.9rem; color:#94A3B8; }

.lt-status-row { display:flex; gap:10px; flex-wrap:wrap; }
.lt-status-pill {
  display:inline-flex; align-items:center; gap:6px;
  padding:10px 20px; border-radius:10px;
  border:1.5px solid #E2E8F0; background:#FFF;
  font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600;
  color:#475569; cursor:default; transition:all .2s;
}
.lt-status-pill i { font-size:.9rem; }
.lt-status-pill--active {
  border-color:#10B981; background:#ECFDF5; color:#059669;
}
.lt-status-pill--exit {
  border-color:#D64B70; background:#FDF2F8; color:#D64B70;
}
.lt-status-pill--reception {
  border-color:#2563EB; background:#EFF6FF; color:#2563EB;
}
.lt-status-pill--nonactive {
  border-color:#EF4444; background:#FEF2F2; color:#EF4444;
}

/* Form fields grid */
.lt-modal-fields {
  display:grid; grid-template-columns:1fr 1fr; gap:14px;
  padding:0 28px 16px;
}
.lt-modal-field { display:flex; flex-direction:column; gap:4px; }
.lt-modal-field--full { grid-column:1/-1; }
.lt-modal-field-label {
  font-family:'Manrope',sans-serif; font-size:.7rem; font-weight:700;
  color:#64748B; text-transform:uppercase; letter-spacing:.06em;
}
.lt-modal-field-value {
  padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FAFBFC; font-size:.88rem; color:#0F172A;
  font-family:'Inter',sans-serif; min-height:42px;
  display:flex; align-items:center;
}
.lt-modal-field-value--empty { color:#CBD5E1; font-style:italic; }

/* Battery bar in modal */
.lt-modal-battery { display:flex; align-items:center; gap:10px; padding:0 28px 20px; }
.lt-modal-battery-bar {
  flex:1; height:8px; border-radius:4px; background:#F1F5F9; overflow:hidden;
}
.lt-modal-battery-fill { height:100%; border-radius:4px; transition:width .4s ease; }
.lt-modal-battery-label {
  font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; white-space:nowrap;
}
.lt-modal-battery-icon { font-size:1.2rem; }

/* Photo in modal */
.lt-modal-photo { width:100%; max-height:220px; object-fit:cover; }

/* Divider */
.lt-modal-divider { border:none; border-top:1px solid #F1F5F9; margin:0; }

/* Footer */
.lt-modal-footer {
  display:flex; align-items:center; justify-content:flex-end; gap:10px;
  padding:16px 28px; border-top:1px solid #F1F5F9;
}
.lt-modal-map-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:10px 22px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#FFF; color:#475569;
  font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600;
  cursor:pointer; transition:all .2s;
}
.lt-modal-map-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.lt-modal-close-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:10px 22px; border-radius:10px; border:none;
  background:#2563EB; color:#FFF;
  font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600;
  cursor:pointer; transition:all .2s;
  box-shadow:0 2px 8px rgba(37,99,235,.2);
}
.lt-modal-close-btn:hover { background:#1D4ED8; }

@media(max-width:600px){
  .lt-modal-fields { grid-template-columns:1fr; }
  .lt-status-row { flex-direction:column; }
}
`

const DashboardDetail = ({viewMode = 'cards'}) => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [mouvement, setMouvement] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [detailItem, setDetailItem] = useState(null)

  const {title, code, src, titledetail} = useAppSelector(getSelectedDashboard) || {}
  let selectedEngin = useAppSelector(getSelectedEngine)
  const selectedCard = useAppSelector(getCardSelected)
  const dispatch = useAppDispatch()
  const dashboardDataDetail = useAppSelector(getDashboardDetail)

  const isEngin = selectedCard?.src === 'engin' || src === 'engin'

  /* ───── table templates (kept for table mode) ───── */
  const statusEnginTemplate = (rowData) => {
    if (rowData?.iconName) {
      return <i title={rowData?.statuslabel} className={`${rowData?.iconName} text-2xl rounded p-2`} style={{color: `${rowData.statusbgColor}`}} />
    }
    return <Chip label={rowData?.statuslabel} style={{background: `${rowData.statusbgColor}`, color: rowData.color ?? 'white'}} title={`${rowData?.statusDate}`} />
  }

  const statusTagTemplate = (rowData) => {
    if (rowData?.iconName) {
      return <i title={rowData?.status} className={`${rowData?.iconName} text-2xl rounded p-2`} style={{color: `${rowData.statusbgColor}`}} />
    }
    return <Chip label={rowData?.status} style={{background: `${rowData.statusbgColor}`, color: rowData.color ?? 'white'}} title={`${rowData?.statusDate}`} />
  }

  const imageTemplate = (rowData) => (
    <Image src={`${API_BASE_URL_IMAGE}${rowData?.image}`} alt='EngineImage' width='60' height='60' preview imageStyle={{objectFit: 'cover', borderRadius: '10px'}} />
  )

  const handleShowMap = (rowData, srcMouv = '') => {
    setMouvement(srcMouv)
    dispatch(setSelectedEngine(rowData))
    setDialogVisible(true)
  }

  const familleTagTemplate = (rowData) => (
    <Chip label={rowData.familleTag} icon={rowData.familleIconTag} style={{background: rowData.familleTagIconBgcolor, color: rowData.familleTagIconColor}} />
  )

  const tagTemplate = (rowData) => (
    <div className='flex flex-column'>
      <div className='flex justify-content-center'>
        {rowData.tagId ? familleTagTemplate(rowData) : <Chip label='Untagged' className='cursor-pointer' onClick={() => handleShowMap(rowData, '')} />}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Chip label={rowData?.labeltag || rowData?.tagname} className='m-2' style={{background: '#D64B70', color: 'white'}} />
      </div>
    </div>
  )

  const iconTemplate = (rowData) => {
    const e = getEtatInfo(rowData)
    return <i style={{color: e.color}} className={`${e.icon} text-2xl rounded p-2 cursor-pointer`} title={`${rowData?.etatengin} ${rowData?.locationDate ?? ''}`} onClick={() => handleShowMap(rowData)} />
  }

  const BatteryStatus = ({batteries, locationDate}) => {
    const b = getBatteryInfo(batteries)
    return (
      <div className='flex items-center justify-center'>
        <div className='p-4 rounded-lg text-center'>
          <i title={locationDate ?? 'No date'} className={`text-4xl ${b.icon}`} style={{color: b.color}} />
          <span className='block mt-2 font-bold text-lg' style={{color: b.color}}>{batteries}</span>
        </div>
      </div>
    )
  }

  const tagIdTemplate = ({tagId}) => (!tagId ? 'No Tag' : tagId)
  const familleTemplate = ({famille, familleIcon, familleBgcolor}) => <Chip label={famille} icon={familleIcon} style={{background: familleBgcolor, color: 'white'}} />
  const activeTemplate = (rowData) => <Chip label={rowData?.active == 1 ? 'Actif' : 'Inactif'} icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'} style={{backgroundColor: `${rowData?.activeColor}`, color: 'white'}} />
  const addresseeTemplate = (type, {enginAddress, tagAddress}) => <div>{enginAddress ? <Chip label={type === 'engin' ? enginAddress : tagAddress} /> : 'No address found.'}</div>

  const buildColumns = () => {
    if (isEngin) {
      return [
        {header:'Photo',field:'image',olang:'Photo',body:imageTemplate},
        {header:'Référence',field:'reference',olang:'Reference'},
        {header:'TagId',field:'tagId',olang:'tagId',body:tagIdTemplate},
        {header:'Label',field:'label',olang:'label'},
        {header:'Vin',field:'vin',olang:'vin'},
        {header:'Etat',field:'etatenginname',olang:'Etat',body:iconTemplate},
        {header:'Tag',field:'tagname',olang:'Tag',body:tagTemplate},
        {header:'Status',olang:'status',field:'statuslabel',body:statusEnginTemplate},
        {header:'Battery status',olang:'BatteryStatus',field:'batteries',body:BatteryStatus},
        {header:'Famille',field:'famille',olang:'Famille',visible:true,body:familleTemplate},
        {header:'Marque',field:'brand',olang:'marque'},
        {header:'IMMATRICULATION',field:'immatriculation',olang:'IMMATRICULATION'},
        {header:'Modèle',field:'model',olang:'Modele'},
        {header:'Worksite',field:'LocationObjectname',olang:'Worksite'},
        {header:'Addressee',olang:'Addressee',field:'addressee',body:(r)=>addresseeTemplate('engin',r)},
      ]
    }
    return [
      {header:'ID Tag',field:'name',olang:'ID Tag',filter:true},
      {header:'Label',field:'label',olang:'label'},
      {header:'Famille',field:'famille',olang:'Famille',visible:true,body:familleTemplate},
      {header:'ADRESSE',olang:'ADRESSE',field:'adresse',body:(r)=>addresseeTemplate('tag',r)},
      {header:'Satus',olang:'Status',field:'status',body:statusTagTemplate},
      {header:'ACTIF',olang:'ACTIF',body:activeTemplate},
    ]
  }

  const buildExportColumns = () => {
    if (isEngin) {
      return [
        {label:'Référence',column:'reference'},{label:'TagId',column:'tagId'},{label:'Label',column:'label'},
        {label:'Vin',column:'vin'},{label:'Etat',column:'etatengin'},{label:'Status',column:'status'},
        {label:'Battery status',column:'batteries'},{label:'Famille',column:'famille'},{label:'Marque',column:'brand'},
        {label:'IMMATRICULATION',column:'immatriculation'},{label:'Modèle',column:'model'},{label:'Worksite',column:'LocationObjectname'},
      ]
    }
    return [{label:'ID Tag',column:'name'},{label:'Label',column:'label'},{label:'Famille',column:'famille'},{label:'Status',column:'status'}]
  }

  const columns = buildColumns()
  const exportFields = buildExportColumns()

  const rowGroupTemplates = {
    reference:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.reference}/>,
    tagId:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.tagId}/>,
    field:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.field}/>,
    label:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.label}/>,
    vin:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.vin}/>,
    etatenginname:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.etatenginname}/>,
    tagname:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.tagname}/>,
    status:(r)=><Chip style={{backgroundColor:r.statusbgColor,color:'white'}} label={r?.status}/>,
    batteries:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.batteries}/>,
    famille:(r)=>familleTemplate(r),
    brand:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.brand}/>,
    immatriculation:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.immatriculation}/>,
    model:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.model}/>,
    LocationObjectname:(r)=><Chip style={{backgroundColor:'#D64B70',color:'white'}} label={r?.LocationObjectname}/>,
  }
  const allowedGroupFields = ['famille','status','LocationObjectname','etatenginname','tagname','batteries']

  /* ───── search filter ───── */
  const getFilteredData = () => {
    const arr = Array.isArray(dashboardDataDetail) ? dashboardDataDetail : []
    if (!arr.length || !searchTerm.trim()) return arr
    const term = searchTerm.toLowerCase()
    return arr.filter((item) => {
      const fields = [item.reference,item.label,item.tagname,item.labeltag,item.vin,item.famille,item.brand,item.model,item.immatriculation,item.LocationObjectname,item.name,item.status,item.statuslabel,item.enginAddress,item.tagAddress]
      return fields.some((f) => f && String(f).toLowerCase().includes(term))
    })
  }
  const filteredData = getFilteredData()

  /* ───── open detail modal ───── */
  const openDetail = (item, e) => {
    e.stopPropagation()
    setDetailItem(item)
  }

  /* ═══════ CARD RENDERERS ═══════ */
  const renderEnginCard = (item, index) => {
    const battery = getBatteryInfo(item.batteries)
    const etat = getEtatInfo(item)
    const statusColor = item.statusbgColor || (etat.color !== '#94A3B8' ? etat.color : '#10B981')
    return (
      <div className="lt-card2" key={item.id || index} data-testid={`engin-card-${index}`}>
        <div className="lt-c-header">
          <span className="lt-c-ref">{item.reference || 'N/A'}</span>
          <button className="lt-c-details-btn" onClick={(e) => openDetail(item, e)} data-testid={`details-btn-${index}`}>
            Détails <i className="pi pi-arrow-right" />
          </button>
        </div>
        <div className="lt-c-img-wrap">
          {item.image ? (
            <img src={`${API_BASE_URL_IMAGE}${item.image}`} alt={item.reference} className="lt-c-img" />
          ) : (
            <div className="lt-c-img-ph"><i className="fas fa-truck" /></div>
          )}
          <div className="lt-c-status-dot" style={{background: statusColor}} title={item.statuslabel || etat.label} />
        </div>
        <div className="lt-c-body">
          <div className="lt-c-famille" style={{color: item.familleBgcolor || '#2563EB'}}>{item.famille || 'Non classé'}</div>
          <div className="lt-c-label">{item.label || item.brand || ''} {item.model || ''}</div>
          <div className="lt-c-chips">
            <span className={`lt-c-chip ${etat.key === 'exit' ? 'lt-c-chip--orange' : etat.key === 'reception' ? 'lt-c-chip--green' : etat.key === 'nonactive' ? 'lt-c-chip--red' : ''}`}>
              <i className={etat.icon} /> {etat.label}
            </span>
            <span className="lt-c-chip" style={{color: battery.color, background: `${battery.color}12`}}>
              <i className={battery.icon} /> {battery.label}
            </span>
            {item.familleTag && (
              <span className="lt-c-chip lt-c-chip--blue">
                <i className={item.familleIconTag || 'fas fa-tag'} /> {item.familleTag}
              </span>
            )}
          </div>
          <div className="lt-c-footer">
            <i className="fas fa-map-marker-alt" />
            <span>{item.LocationObjectname || item.enginAddress || 'Aucun site'}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderTagCard = (item, index) => {
    return (
      <div className="lt-card2" key={item.id || index} data-testid={`tag-card-${index}`}>
        <div className="lt-c-header">
          <span className="lt-c-ref">{item.name || 'N/A'}</span>
          <button className="lt-c-details-btn" onClick={(e) => openDetail(item, e)} data-testid={`tag-details-btn-${index}`}>
            Détails <i className="pi pi-arrow-right" />
          </button>
        </div>
        <div className="lt-c-icon-area">
          <i className={item.familleIcon || 'fas fa-tag'} style={{color: item.familleColor || '#2563EB'}} />
        </div>
        <div className="lt-c-body">
          <div className="lt-c-famille" style={{color: item.familleBgcolor || '#2563EB'}}>{item.famille || 'Non classé'}</div>
          <div className="lt-c-label">{item.label || ''}</div>
          <div className="lt-c-chips">
            {item.status && (
              <span className="lt-c-chip" style={{background: item.statusbgColor || '#94A3B8', color: item.color || '#FFF'}}>
                {item.status}
              </span>
            )}
            <span className={`lt-c-chip ${item.active == 1 ? 'lt-c-chip--green' : 'lt-c-chip--red'}`}>
              <i className={item.active == 1 ? 'pi pi-check' : 'pi pi-times'} /> {item.active == 1 ? 'Actif' : 'Inactif'}
            </span>
          </div>
          {(item.tagAddress || item.adresse) && (
            <div className="lt-c-footer">
              <i className="fas fa-map-marker-alt" />
              <span>{item.tagAddress || item.adresse || ''}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ═══════ DETAIL MODAL ═══════ */
  const renderDetailModal = () => {
    if (!detailItem) return null
    const battery = getBatteryInfo(detailItem.batteries)
    const etat = getEtatInfo(detailItem)

    const Field = ({label, value, full}) => (
      <div className={`lt-modal-field ${full ? 'lt-modal-field--full' : ''}`}>
        <span className="lt-modal-field-label">{label}</span>
        <div className={`lt-modal-field-value ${!value ? 'lt-modal-field-value--empty' : ''}`}>
          {value || '—'}
        </div>
      </div>
    )

    const getStatusPillClass = () => {
      if (etat.key === 'exit') return 'lt-status-pill--exit'
      if (etat.key === 'reception') return 'lt-status-pill--reception'
      if (etat.key === 'nonactive') return 'lt-status-pill--nonactive'
      return 'lt-status-pill--active'
    }

    if (isEngin) {
      return (
        <div className="lt-modal">
          <div className="lt-modal-head">
            <h2 className="lt-modal-title" data-testid="modal-title">Détails de l'engin</h2>
            <button className="lt-modal-close" onClick={() => setDetailItem(null)} data-testid="modal-close-x"><i className="pi pi-times" /></button>
          </div>

          {detailItem.image && <img src={`${API_BASE_URL_IMAGE}${detailItem.image}`} alt="" className="lt-modal-photo" />}

          {/* STATUS */}
          <div className="lt-modal-section">
            <div className="lt-modal-section-title"><i className="fas fa-circle-info" /> STATUT</div>
            <div className="lt-status-row">
              <div className={`lt-status-pill ${etat.key === 'reception' ? 'lt-status-pill--reception' : ''}`}>
                <i className="fa-solid fa-down-to-bracket" /> Réception
              </div>
              <div className={`lt-status-pill ${etat.key === 'exit' ? 'lt-status-pill--exit' : ''}`}>
                <i className="fa-solid fa-up-from-bracket" /> Sortie
              </div>
              <div className={`lt-status-pill ${etat.key === 'nonactive' ? 'lt-status-pill--nonactive' : ''}`}>
                <i className="fa-solid fa-octagon-exclamation" /> Non actif
              </div>
            </div>
          </div>

          <hr className="lt-modal-divider" />

          {/* GENERAL */}
          <div className="lt-modal-fields">
            <Field label="Référence" value={detailItem.reference} />
            <Field label="Label" value={detailItem.label} />
            <Field label="Marque" value={detailItem.brand} />
            <Field label="Modèle" value={detailItem.model} />
            <Field label="VIN" value={detailItem.vin} />
            <Field label="Immatriculation" value={detailItem.immatriculation} />
          </div>

          <hr className="lt-modal-divider" />

          {/* IDENTIFICATION */}
          <div className="lt-modal-section">
            <div className="lt-modal-section-title"><i className="fas fa-id-card" /> IDENTIFICATION</div>
          </div>
          <div className="lt-modal-fields">
            <Field label="Tag ID" value={detailItem.tagId && detailItem.tagId !== 0 ? String(detailItem.tagId) : null} />
            <Field label="Tag Name" value={detailItem.labeltag || detailItem.tagname} />
            <Field label="Famille" value={detailItem.famille} />
            <Field label="Famille Tag" value={detailItem.familleTag} />
            <Field label="Worksite" value={detailItem.LocationObjectname} />
            <Field label="Adresse" value={detailItem.enginAddress} />
          </div>

          <hr className="lt-modal-divider" />

          {/* BATTERY */}
          <div className="lt-modal-section">
            <div className="lt-modal-section-title"><i className={battery.icon} style={{color: battery.color}} /> BATTERIE</div>
          </div>
          <div className="lt-modal-battery">
            <i className={`lt-modal-battery-icon ${battery.icon}`} style={{color: battery.color}} />
            <div className="lt-modal-battery-bar">
              <div className="lt-modal-battery-fill" style={{width: `${battery.pct}%`, background: battery.color}} />
            </div>
            <span className="lt-modal-battery-label" style={{color: battery.color}}>{battery.label}</span>
          </div>

          {/* FOOTER */}
          <div className="lt-modal-footer">
            <button className="lt-modal-map-btn" onClick={() => { handleShowMap(detailItem); setDetailItem(null); }} data-testid="modal-map-btn">
              <i className="fas fa-map-location-dot" /> Voir sur la carte
            </button>
            <button className="lt-modal-close-btn" onClick={() => setDetailItem(null)} data-testid="modal-close-btn">
              <i className="pi pi-check" /> Fermer
            </button>
          </div>
        </div>
      )
    }

    /* ── Tag modal ── */
    return (
      <div className="lt-modal">
        <div className="lt-modal-head">
          <h2 className="lt-modal-title" data-testid="modal-title">Détails du tag</h2>
          <button className="lt-modal-close" onClick={() => setDetailItem(null)} data-testid="modal-close-x"><i className="pi pi-times" /></button>
        </div>

        {/* STATUS */}
        <div className="lt-modal-section">
          <div className="lt-modal-section-title"><i className="fas fa-circle-info" /> STATUT</div>
          <div className="lt-status-row">
            <div className={`lt-status-pill ${detailItem.active == 1 ? 'lt-status-pill--active' : ''}`}>
              <i className="pi pi-check-circle" /> Actif
            </div>
            <div className={`lt-status-pill ${detailItem.active != 1 ? 'lt-status-pill--nonactive' : ''}`}>
              <i className="pi pi-times-circle" /> Inactif
            </div>
          </div>
        </div>

        <hr className="lt-modal-divider" />

        <div className="lt-modal-fields">
          <Field label="ID Tag" value={detailItem.name} />
          <Field label="Label" value={detailItem.label} />
          <Field label="Famille" value={detailItem.famille} />
          <Field label="Status" value={detailItem.status} />
          <Field label="Adresse" value={detailItem.tagAddress || detailItem.adresse} full />
        </div>

        <div className="lt-modal-footer">
          <button className="lt-modal-close-btn" onClick={() => setDetailItem(null)} data-testid="modal-close-btn">
            <i className="pi pi-check" /> Fermer
          </button>
        </div>
      </div>
    )
  }

  /* ═══════ CARD GRID ═══════ */
  const renderCardGrid = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      return (
        <div className="lt-empty-state" data-testid="empty-state">
          <i className={isEngin ? 'fas fa-truck' : 'fas fa-tags'} />
          <p>Aucun élément trouvé</p>
        </div>
      )
    }
    return (
      <div className="lt-card-grid" data-testid="card-grid">
        {filteredData.map((item, i) => isEngin ? renderEnginCard(item, i) : renderTagCard(item, i))}
      </div>
    )
  }

  /* ═══════ RENDER ═══════ */
  return (
    <>
      <style>{CARD_STYLES}</style>

      {selectedCard == null && (
        <div className='flex justify-content-between p-2'>
          <ButtonComponent label={<OlangItem olang={'btn.back'} />} onClick={() => dispatch(setEditDashboard(false))} />
          <p className='text-2xl font-bold text-gray-800'>{titledetail}</p>
        </div>
      )}

      <EnginMapLocation
        dialogVisible={dialogVisible}
        setDialogVisible={() => setDialogVisible((prev) => !prev)}
        historySrc={{srcId: selectedEngin?.id, srcObject: 'engin', srcMovement: mouvement}}
      />

      {/* Detail Modal */}
      <Dialog
        visible={detailItem !== null}
        onHide={() => setDetailItem(null)}
        modal
        dismissableMask
        className="lt-modal-overlay"
        style={{width: '680px', maxWidth: '95vw'}}
        data-testid="detail-modal"
      >
        {renderDetailModal()}
      </Dialog>

      <div className="lt-detail-wrapper" data-testid="dashboard-detail">
        <div className="lt-search-bar">
          <div className="lt-search-wrap">
            <i className="pi pi-search" />
            <input className="lt-search-input" type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} data-testid="detail-search-input" />
          </div>
          <span className="lt-result-count" data-testid="result-count">
            {filteredData?.length || 0} résultat{(filteredData?.length || 0) > 1 ? 's' : ''}
          </span>
        </div>

        {viewMode === 'cards' ? renderCardGrid() : (
          <DatatableComponent
            tableId='dashboard-detail-table'
            data={filteredData}
            columns={columns}
            exportFields={exportFields}
            rowGroupTemplates={rowGroupTemplates}
            allowedGroupFields={allowedGroupFields}
          />
        )}
      </div>
    </>
  )
}

export default DashboardDetail
