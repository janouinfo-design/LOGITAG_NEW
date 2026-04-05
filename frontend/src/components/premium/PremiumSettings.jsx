import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {
  fetchFamilles as fetchFamillesFam, fetchObject as fetchObjectFam,
  getFamilles as getFamillesFam, getObject as getObjectFam,
} from '../Famillies/slice/famille.slice'
import {
  fetchFamilles as fetchStatuts, fetchObject as fetchObjectStat,
  getFamilles as getStatuts, getObject as getObjectStat,
} from '../Statut/slice/statut.slice'
import {fetchEngines, getEngines} from '../Engin/slice/engin.slice'
import {
  Settings, Building2, Tags, Palette, Trash2,
  Search, X, ChevronRight, Plus, Edit3, Truck
} from 'lucide-react'

const TABS = [
  {id: 'entreprise', label: 'Entreprise', icon: Building2},
  {id: 'famille', label: 'Familles', icon: Tags},
  {id: 'statut', label: 'Statuts', icon: Palette},
  {id: 'corbeille', label: 'Corbeille', icon: Trash2},
]

const PremiumSettings = () => {
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState('entreprise')
  const [loading, setLoading] = useState(true)

  const famillesFam = useAppSelector(getFamillesFam)
  const objectsFam = useAppSelector(getObjectFam)
  const statuts = useAppSelector(getStatuts)
  const objectsStat = useAppSelector(getObjectStat)
  const engines = useAppSelector(getEngines)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      dispatch(fetchObjectFam()),
      dispatch(fetchObjectStat()),
      dispatch(fetchFamillesFam('engin')),
      dispatch(fetchStatuts('engin')),
      dispatch(fetchEngines({page: 1, PageSize: 50, searchSituation: 'nonactive'})),
    ]).finally(() => setLoading(false))
  }, [dispatch])

  const handleFamilleFilter = (objName) => {
    dispatch(fetchFamillesFam(objName))
  }

  const handleStatutFilter = (objName) => {
    dispatch(fetchStatuts(objName))
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="lts" data-testid="premium-settings">
        <div className="lts-header">
          <div>
            <h1 className="lts-title" data-testid="settings-title">Paramètres</h1>
            <p className="lts-sub">Configuration et administration du système</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="lts-tabs" data-testid="settings-tabs">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`lts-tab ${activeTab === tab.id ? 'lts-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`settings-tab-${tab.id}`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="lts-content">
          {activeTab === 'entreprise' && <EntrepriseTab />}
          {activeTab === 'famille' && (
            <FamilleTab
              familles={Array.isArray(famillesFam) ? famillesFam : []}
              objects={Array.isArray(objectsFam) ? objectsFam : []}
              onFilter={handleFamilleFilter}
              loading={loading}
            />
          )}
          {activeTab === 'statut' && (
            <StatutTab
              statuts={Array.isArray(statuts) ? statuts : []}
              objects={Array.isArray(objectsStat) ? objectsStat : []}
              onFilter={handleStatutFilter}
              loading={loading}
            />
          )}
          {activeTab === 'corbeille' && (
            <CorbeilleTab engines={engines} loading={loading} />
          )}
        </div>
      </div>
    </>
  )
}

/* ── Entreprise Tab ── */
const EntrepriseTab = () => (
  <div className="lts-panel" data-testid="settings-entreprise">
    <div className="lts-panel-head">
      <h3 className="lts-panel-title"><Building2 size={18} /> Informations entreprise</h3>
    </div>
    <div className="lts-panel-body">
      <div className="lts-info-grid">
        <InfoField label="Nom" value="LOGITAG" />
        <InfoField label="Secteur" value="Tracking BLE / IoT" />
        <InfoField label="Contact" value="admin@logitag.ch" />
        <InfoField label="Adresse" value="Suisse" />
      </div>
    </div>
  </div>
)

const InfoField = ({label, value}) => (
  <div className="lts-field">
    <span className="lts-field-label">{label}</span>
    <div className="lts-field-value">{value || '—'}</div>
  </div>
)

/* ── Famille Tab ── */
const FamilleTab = ({familles, objects, onFilter, loading}) => {
  const [selectedObj, setSelectedObj] = useState('engin')
  const [search, setSearch] = useState('')

  const handleObjClick = (name) => {
    setSelectedObj(name)
    onFilter(name)
  }

  const filtered = familles.filter(f => {
    if (!search) return true
    return (f.label || f.name || '').toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="lts-panel" data-testid="settings-famille">
      <div className="lts-panel-head">
        <h3 className="lts-panel-title"><Tags size={18} /> Familles</h3>
        <button className="lts-panel-btn"><Plus size={14} /> Ajouter</button>
      </div>

      {/* Object filter chips */}
      <div className="lts-obj-chips" data-testid="famille-objects">
        {objects.map((obj, i) => (
          <button
            key={obj.name || i}
            className={`lts-obj-chip ${selectedObj === obj.name ? 'lts-obj-chip--active' : ''}`}
            onClick={() => handleObjClick(obj.name)}
          >
            {obj.label || obj.name}
          </button>
        ))}
        {objects.length === 0 && ['Tag', 'Engin', 'Utilisateur'].map(name => (
          <button
            key={name}
            className={`lts-obj-chip ${selectedObj === name.toLowerCase() ? 'lts-obj-chip--active' : ''}`}
            onClick={() => handleObjClick(name.toLowerCase())}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="lts-search-mini">
        <Search size={13} />
        <input placeholder="Filtrer..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="lts-list" data-testid="famille-list">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="lts-skel" />)
        ) : filtered.length === 0 ? (
          <div className="lts-empty-sm">Aucune famille trouvée</div>
        ) : (
          filtered.map((f, i) => (
            <div key={f.id || i} className="lts-list-item" data-testid={`famille-item-${i}`}>
              <div className="lts-item-color" style={{background: f.bgColor ? `#${f.bgColor}` : '#CBD5E1'}} />
              <div className="lts-item-info">
                <span className="lts-item-name">{f.label || f.name || 'N/A'}</span>
                <span className="lts-item-type">{selectedObj}</span>
              </div>
              <button className="lts-item-action"><Edit3 size={13} /></button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ── Statut Tab ── */
const StatutTab = ({statuts, objects, onFilter, loading}) => {
  const [selectedObj, setSelectedObj] = useState('engin')

  const handleObjClick = (name) => {
    setSelectedObj(name)
    onFilter(name)
  }

  return (
    <div className="lts-panel" data-testid="settings-statut">
      <div className="lts-panel-head">
        <h3 className="lts-panel-title"><Palette size={18} /> Statuts</h3>
        <button className="lts-panel-btn"><Plus size={14} /> Ajouter</button>
      </div>

      <div className="lts-obj-chips" data-testid="statut-objects">
        {objects.map((obj, i) => (
          <button
            key={obj.name || i}
            className={`lts-obj-chip ${selectedObj === obj.name ? 'lts-obj-chip--active' : ''}`}
            onClick={() => handleObjClick(obj.name)}
          >
            {obj.label || obj.name}
          </button>
        ))}
        {objects.length === 0 && (
          <button className="lts-obj-chip lts-obj-chip--active">Engin</button>
        )}
      </div>

      <div className="lts-table-mini">
        <div className="lts-tm-head">
          <span className="lts-tm-th" style={{flex: 3}}>Nom du statut</span>
          <span className="lts-tm-th">Couleur</span>
          <span className="lts-tm-th">Icône</span>
          <span className="lts-tm-th" style={{width: 60}}>Action</span>
        </div>
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="lts-skel" style={{height: 52}} />)
        ) : (Array.isArray(statuts) ? statuts : []).length === 0 ? (
          <div className="lts-empty-sm">Aucun statut trouvé</div>
        ) : (
          (Array.isArray(statuts) ? statuts : []).map((s, i) => (
            <div key={s.id || i} className="lts-tm-row" data-testid={`statut-item-${i}`}>
              <span className="lts-tm-cell" style={{flex: 3, fontWeight: 600}}>{s.label || s.name || 'N/A'}</span>
              <span className="lts-tm-cell">
                <span className="lts-color-dot" style={{background: s.bgColor ? `#${s.bgColor}` : s.color ? `#${s.color}` : '#CBD5E1'}} />
              </span>
              <span className="lts-tm-cell">
                {s.icon ? <i className={s.icon} style={{fontSize: '1rem', color: '#64748B'}} /> : '—'}
              </span>
              <span className="lts-tm-cell" style={{width: 60}}>
                <button className="lts-item-action"><Edit3 size={13} /></button>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ── Corbeille Tab ── */
const CorbeilleTab = ({engines, loading}) => {
  const data = (engines?.data || engines || []).filter(e =>
    e.etatenginname === 'nonactive' || e.active === 0
  )

  return (
    <div className="lts-panel" data-testid="settings-corbeille">
      <div className="lts-panel-head">
        <h3 className="lts-panel-title"><Trash2 size={18} /> Corbeille</h3>
      </div>

      <div className="lts-table-mini">
        <div className="lts-tm-head">
          <span className="lts-tm-th" style={{flex: 3}}>Nom à afficher</span>
          <span className="lts-tm-th">Source</span>
          <span className="lts-tm-th" style={{width: 60}}>Action</span>
        </div>
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="lts-skel" style={{height: 52}} />)
        ) : data.length === 0 ? (
          <div className="lts-empty-sm">Corbeille vide</div>
        ) : (
          data.map((item, i) => (
            <div key={item.id || i} className="lts-tm-row" data-testid={`corbeille-item-${i}`}>
              <span className="lts-tm-cell" style={{flex: 3, fontWeight: 600}}>{item.label || item.reference || 'N/A'}</span>
              <span className="lts-tm-cell">
                <span className="ltu-chip" style={{background: '#F1F5F9', color: '#64748B'}}>engin</span>
              </span>
              <span className="lts-tm-cell" style={{width: 60}}>
                <button className="lts-item-action" title="Restaurer"><ChevronRight size={13} /></button>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const STYLES = `
.lts { max-width: 1100px; }
.lts-header { margin-bottom: 24px; }
.lts-title { font-family:'Manrope',sans-serif; font-size:1.75rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.lts-sub { font-family:'Inter',sans-serif; font-size:.875rem; color:#64748B; margin:4px 0 0; }

/* Tabs */
.lts-tabs { display:flex; gap:4px; margin-bottom:24px; background:#F1F5F9; border-radius:12px; padding:4px; overflow-x:auto; }
.lts-tab { display:inline-flex; align-items:center; gap:6px; padding:10px 18px; border-radius:10px; border:none; background:transparent; color:#64748B; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:500; cursor:pointer; transition:all .15s; white-space:nowrap; }
.lts-tab:hover { color:#334155; }
.lts-tab--active { background:#FFF; color:#2563EB; font-weight:600; box-shadow:0 1px 4px rgba(0,0,0,.06); }

/* Panel */
.lts-panel { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; }
.lts-panel-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #F1F5F9; }
.lts-panel-title { display:flex; align-items:center; gap:8px; font-family:'Manrope',sans-serif; font-size:.95rem; font-weight:700; color:#0F172A; margin:0; }
.lts-panel-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 14px; border-radius:8px; border:1.5px solid #2563EB; background:transparent; color:#2563EB; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:600; cursor:pointer; transition:all .12s; }
.lts-panel-btn:hover { background:#EFF6FF; }
.lts-panel-body { padding:20px 24px; }

/* Info grid */
.lts-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
@media(max-width:600px){ .lts-info-grid{ grid-template-columns:1fr; } }
.lts-field { display:flex; flex-direction:column; gap:4px; }
.lts-field-label { font-family:'Manrope',sans-serif; font-size:.68rem; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.05em; }
.lts-field-value { padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-family:'Inter',sans-serif; font-size:.85rem; color:#0F172A; }

/* Object chips */
.lts-obj-chips { display:flex; gap:8px; padding:16px 24px 12px; flex-wrap:wrap; }
.lts-obj-chip { padding:8px 18px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:500; color:#64748B; cursor:pointer; transition:all .15s; }
.lts-obj-chip:hover { border-color:#CBD5E1; }
.lts-obj-chip--active { border-color:#2563EB; background:#EFF6FF; color:#2563EB; font-weight:600; }

/* Search mini */
.lts-search-mini { display:flex; align-items:center; gap:8px; margin:0 24px 12px; padding:8px 12px; border-radius:8px; border:1.5px solid #E2E8F0; color:#94A3B8; }
.lts-search-mini input { border:none; outline:none; flex:1; font-family:'Inter',sans-serif; font-size:.8rem; color:#0F172A; background:transparent; }

/* List */
.lts-list { padding:0 12px 12px; }
.lts-list-item { display:flex; align-items:center; gap:12px; padding:12px; border-radius:10px; transition:background .1s; cursor:pointer; }
.lts-list-item:hover { background:#F8FAFC; }
.lts-item-color { width:6px; height:32px; border-radius:3px; flex-shrink:0; }
.lts-item-info { flex:1; display:flex; flex-direction:column; gap:2px; }
.lts-item-name { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; }
.lts-item-type { font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; }
.lts-item-action { width:30px; height:30px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .12s; flex-shrink:0; }
.lts-item-action:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }

/* Table mini */
.lts-table-mini { padding:0 12px 12px; }
.lts-tm-head { display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid #F1F5F9; }
.lts-tm-th { flex:1; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:.04em; }
.lts-tm-row { display:flex; align-items:center; gap:8px; padding:12px; border-bottom:1px solid #F8FAFC; transition:background .1s; }
.lts-tm-row:hover { background:#FAFBFC; }
.lts-tm-row:last-child { border-bottom:none; }
.lts-tm-cell { flex:1; font-family:'Inter',sans-serif; font-size:.82rem; color:#0F172A; display:flex; align-items:center; gap:6px; }
.lts-color-dot { width:20px; height:20px; border-radius:6px; border:1px solid rgba(0,0,0,.08); }

/* Shared */
.lts-skel { height:48px; margin:8px 12px; border-radius:8px; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; }
@keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.lts-empty-sm { padding:40px; text-align:center; font-family:'Inter',sans-serif; font-size:.82rem; color:#94A3B8; }
`

export default PremiumSettings
