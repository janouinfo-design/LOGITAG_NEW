import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchListRpt, getListRpt} from '../Repports/slice/rapports.slice'
import {
  FileBarChart, Search, X, Download, Calendar, Clock,
  FileText, Truck, MapPin, Plus, Eye, Trash2, ChevronRight
} from 'lucide-react'

const REPORT_TYPES = [
  {key: 'presence', label: 'Présence', icon: Clock, color: '#2563EB', bg: '#EFF6FF', desc: 'Rapports de présence des engins sur site'},
  {key: 'movement', label: 'Mouvement', icon: Truck, color: '#059669', bg: '#ECFDF5', desc: 'Historique des mouvements d\'assets'},
  {key: 'location', label: 'Localisation', icon: MapPin, color: '#D97706', bg: '#FFFBEB', desc: 'Rapports de position GPS'},
]

const PremiumReports = () => {
  const dispatch = useAppDispatch()
  const listRpt = useAppSelector(getListRpt)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    dispatch(fetchListRpt()).finally(() => setLoading(false))
  }, [dispatch])

  const reports = Array.isArray(listRpt) ? listRpt : []
  const filtered = reports.filter(r => {
    if (!search) return true
    const t = search.toLowerCase()
    return (r.title || r.name || '').toLowerCase().includes(t)
  })

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltr" data-testid="premium-reports">
        <div className="ltr-header">
          <div>
            <h1 className="ltr-title" data-testid="reports-title">Rapports</h1>
            <p className="ltr-sub">Générez et consultez vos rapports d'activité</p>
          </div>
          <button className="ltr-btn ltr-btn--primary" data-testid="reports-new-btn">
            <Plus size={15} /> Nouveau rapport
          </button>
        </div>

        {/* Report Type Cards */}
        <div className="ltr-types" data-testid="reports-types">
          {REPORT_TYPES.map(rt => {
            const Icon = rt.icon
            return (
              <div key={rt.key} className="ltr-type-card" data-testid={`report-type-${rt.key}`}>
                <div className="ltr-type-icon" style={{background: rt.bg}}>
                  <Icon size={22} style={{color: rt.color}} />
                </div>
                <div className="ltr-type-info">
                  <span className="ltr-type-name">{rt.label}</span>
                  <span className="ltr-type-desc">{rt.desc}</span>
                </div>
                <button className="ltr-type-action">
                  Générer <ChevronRight size={14} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Reports List */}
        <div className="ltr-section">
          <div className="ltr-section-head">
            <h3 className="ltr-section-title"><FileBarChart size={18} /> Rapports générés</h3>
            <div className="ltr-search-wrap">
              <Search size={14} className="ltr-search-ico" />
              <input className="ltr-search" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} data-testid="reports-search" />
              {search && <button className="ltr-search-clear" onClick={() => setSearch('')}><X size={12} /></button>}
            </div>
          </div>

          <div className="ltr-list" data-testid="reports-list">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="ltr-skel" />)
            ) : filtered.length === 0 ? (
              <div className="ltr-empty">
                <FileBarChart size={40} strokeWidth={1} />
                <p>Aucun rapport disponible</p>
                <span>Créez votre premier rapport en cliquant sur "Nouveau rapport"</span>
              </div>
            ) : (
              filtered.map((rpt, i) => (
                <div key={rpt.id || i} className="ltr-item" data-testid={`report-item-${i}`}>
                  <div className="ltr-item-icon">
                    <FileText size={18} style={{color: '#2563EB'}} />
                  </div>
                  <div className="ltr-item-info">
                    <span className="ltr-item-title">{rpt.title || rpt.name || `Rapport #${rpt.id || i + 1}`}</span>
                    <span className="ltr-item-meta">
                      <Calendar size={11} /> {rpt.begDate || rpt.created || '—'} - {rpt.endDate || ''}
                    </span>
                  </div>
                  <div className="ltr-item-status">
                    {rpt.filepath ? (
                      <span className="ltr-badge ltr-badge--done">Terminé</span>
                    ) : (
                      <span className="ltr-badge ltr-badge--pending">En attente</span>
                    )}
                  </div>
                  <div className="ltr-item-actions">
                    {rpt.filepath && (
                      <a href={rpt.filepath} target="_blank" rel="noopener noreferrer" className="ltr-act-btn" title="Télécharger">
                        <Download size={14} />
                      </a>
                    )}
                    <button className="ltr-act-btn" title="Voir"><Eye size={14} /></button>
                    <button className="ltr-act-btn ltr-act-btn--danger" title="Supprimer"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const STYLES = `
.ltr { max-width: 1100px; }
.ltr-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
.ltr-title { font-family:'Manrope',sans-serif; font-size:1.75rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.ltr-sub { font-family:'Inter',sans-serif; font-size:.875rem; color:#64748B; margin:4px 0 0; }
.ltr-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; }
.ltr-btn--primary { border:none; background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.ltr-btn--primary:hover { background:#1D4ED8; }

/* Type cards */
.ltr-types { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px; }
@media(max-width:900px){ .ltr-types{ grid-template-columns:1fr; } }
.ltr-type-card { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; padding:20px; display:flex; align-items:center; gap:16px; cursor:pointer; transition:all .15s; }
.ltr-type-card:hover { border-color:#CBD5E1; box-shadow:0 4px 16px rgba(0,0,0,.04); }
.ltr-type-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ltr-type-info { flex:1; display:flex; flex-direction:column; gap:4px; }
.ltr-type-name { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:700; color:#0F172A; }
.ltr-type-desc { font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; }
.ltr-type-action { display:inline-flex; align-items:center; gap:4px; border:none; background:transparent; color:#2563EB; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:600; cursor:pointer; transition:opacity .15s; flex-shrink:0; }
.ltr-type-action:hover { opacity:.7; }

/* Section */
.ltr-section { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; }
.ltr-section-head { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #F1F5F9; gap:12px; }
.ltr-section-title { display:flex; align-items:center; gap:8px; font-family:'Manrope',sans-serif; font-size:.92rem; font-weight:700; color:#0F172A; margin:0; }
.ltr-search-wrap { position:relative; min-width:180px; }
.ltr-search-ico { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
.ltr-search { width:100%; padding:7px 28px 7px 32px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; font-size:.78rem; font-family:'Inter',sans-serif; color:#0F172A; outline:none; transition:all .2s; }
.ltr-search:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
.ltr-search-clear { position:absolute; right:6px; top:50%; transform:translateY(-50%); border:none; background:transparent; color:#94A3B8; cursor:pointer; }

/* List */
.ltr-list { padding:4px 0; }
.ltr-item { display:flex; align-items:center; gap:14px; padding:14px 22px; border-bottom:1px solid #F8FAFC; transition:background .1s; cursor:pointer; }
.ltr-item:hover { background:#FAFBFC; }
.ltr-item:last-child { border-bottom:none; }
.ltr-item-icon { width:40px; height:40px; border-radius:10px; background:#EFF6FF; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ltr-item-info { flex:1; display:flex; flex-direction:column; gap:3px; min-width:0; }
.ltr-item-title { font-family:'Manrope',sans-serif; font-size:.85rem; font-weight:700; color:#0F172A; }
.ltr-item-meta { display:flex; align-items:center; gap:4px; font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; }
.ltr-item-status { flex-shrink:0; }
.ltr-badge { display:inline-flex; padding:4px 12px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600; }
.ltr-badge--done { background:#ECFDF5; color:#059669; }
.ltr-badge--pending { background:#FFFBEB; color:#D97706; }
.ltr-item-actions { display:flex; gap:6px; flex-shrink:0; }
.ltr-act-btn { width:32px; height:32px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .12s; text-decoration:none; }
.ltr-act-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.ltr-act-btn--danger:hover { border-color:#DC2626; color:#DC2626; background:#FEF2F2; }

/* Empty */
.ltr-empty { display:flex; flex-direction:column; align-items:center; padding:60px 20px; color:#CBD5E1; gap:6px; }
.ltr-empty p { font-family:'Inter',sans-serif; font-size:.88rem; color:#64748B; margin:4px 0 0; font-weight:600; }
.ltr-empty span { font-family:'Inter',sans-serif; font-size:.75rem; color:#94A3B8; }

.ltr-skel { height:68px; margin:0 22px 8px; border-radius:10px; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; }
@keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`

export default PremiumReports
