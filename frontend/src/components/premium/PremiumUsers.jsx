import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchTeams, getTeams} from '../Teams/slice/team.slice'
import {API_BASE_URL_IMAGE} from '../../api/config'
import {
  Users, Search, X, UserPlus, Download, FileSpreadsheet,
  FileText, Clock, Shield, CheckCircle, XCircle, Eye, Truck
} from 'lucide-react'

const PremiumUsers = () => {
  const dispatch = useAppDispatch()
  const teams = useAppSelector(getTeams)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    dispatch(fetchTeams()).finally(() => setLoading(false))
  }, [dispatch])

  const data = Array.isArray(teams) ? teams : []
  const filtered = data.filter(u => {
    if (!search) return true
    const t = search.toLowerCase()
    return [u.firstname, u.lastname, u.login, u.typeName, u.addrMail]
      .some(f => f && f.toLowerCase().includes(t))
  })

  const activeCount = data.filter(u => u.active === 1 || u.active === true).length
  const inactiveCount = data.length - activeCount

  return (
    <>
      <style>{STYLES}</style>
      <div className="ltu" data-testid="premium-users">
        {/* Header */}
        <div className="ltu-header">
          <div>
            <h1 className="ltu-title" data-testid="users-title">Utilisateurs</h1>
            <p className="ltu-sub">{data.length} utilisateur{data.length > 1 ? 's' : ''} au total</p>
          </div>
          <div className="ltu-actions">
            <button className="ltu-btn ltu-btn--outline" data-testid="users-export-excel">
              <FileSpreadsheet size={15} /> Excel
            </button>
            <button className="ltu-btn ltu-btn--outline" data-testid="users-export-pdf">
              <FileText size={15} /> PDF
            </button>
            <button className="ltu-btn ltu-btn--primary" data-testid="users-add-btn">
              <UserPlus size={15} /> Nouveau
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="ltu-stats" data-testid="users-stats">
          <div className="ltu-stat">
            <div className="ltu-stat-icon" style={{background: '#EFF6FF'}}><Users size={18} style={{color: '#2563EB'}} /></div>
            <div className="ltu-stat-val" style={{color: '#2563EB'}}>{data.length}</div>
            <div className="ltu-stat-label">Total</div>
          </div>
          <div className="ltu-stat">
            <div className="ltu-stat-icon" style={{background: '#ECFDF5'}}><CheckCircle size={18} style={{color: '#059669'}} /></div>
            <div className="ltu-stat-val" style={{color: '#059669'}}>{activeCount}</div>
            <div className="ltu-stat-label">Actifs</div>
          </div>
          <div className="ltu-stat">
            <div className="ltu-stat-icon" style={{background: '#FEF2F2'}}><XCircle size={18} style={{color: '#DC2626'}} /></div>
            <div className="ltu-stat-val" style={{color: '#DC2626'}}>{inactiveCount}</div>
            <div className="ltu-stat-label">Inactifs</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ltu-toolbar">
          <div className="ltu-search-wrap">
            <Search size={15} className="ltu-search-ico" />
            <input className="ltu-search" placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)} data-testid="users-search" />
            {search && <button className="ltu-search-clear" onClick={() => setSearch('')}><X size={13} /></button>}
          </div>
        </div>

        {/* Table */}
        <div className="ltu-table-wrap" data-testid="users-table">
          <div className="ltu-table-head">
            <span className="ltu-th" style={{width: 56}}></span>
            <span className="ltu-th ltu-th--main">Nom employé</span>
            <span className="ltu-th">Login</span>
            <span className="ltu-th">Tag</span>
            <span className="ltu-th">Fonction</span>
            <span className="ltu-th">Date embauche</span>
            <span className="ltu-th">Date sortie</span>
            <span className="ltu-th" style={{width: 100}}>Statut</span>
          </div>

          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="ltu-skel" />)
          ) : filtered.length === 0 ? (
            <div className="ltu-empty"><Users size={40} strokeWidth={1} /><p>Aucun utilisateur trouvé</p></div>
          ) : (
            filtered.map((user, i) => {
              const isActive = user.active === 1 || user.active === true
              return (
                <div key={user.id || i} className="ltu-row" data-testid={`user-row-${i}`}>
                  <div className="ltu-row-avatar">
                    {user.image ? (
                      <img src={`${API_BASE_URL_IMAGE}${user.image}`} alt="" />
                    ) : (
                      <div className="ltu-avatar-ph">
                        {((user.firstname?.[0] || '') + (user.lastname?.[0] || '')).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="ltu-row-name">
                    <span className="ltu-name">{[user.firstname, user.lastname].filter(Boolean).join(' ') || user.login || 'N/A'}</span>
                    <span className="ltu-email">{user.addrMail || ''}</span>
                  </div>
                  <div className="ltu-row-cell">{user.login || '—'}</div>
                  <div className="ltu-row-cell">{user.labeltag || user.tagname || '—'}</div>
                  <div className="ltu-row-cell">
                    {user.typeName && (
                      <span className="ltu-chip" style={{background: '#EFF6FF', color: '#2563EB'}}>{user.typeName}</span>
                    )}
                    {!user.typeName && '—'}
                  </div>
                  <div className="ltu-row-cell">{user.hireday || '—'}</div>
                  <div className="ltu-row-cell">{user.exitday || '—'}</div>
                  <div className="ltu-row-cell" style={{width: 100}}>
                    <span className={`ltu-status ${isActive ? 'ltu-status--active' : 'ltu-status--inactive'}`}>
                      {isActive ? <><CheckCircle size={12} /> Actif</> : <><XCircle size={12} /> Inactif</>}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

const STYLES = `
.ltu { max-width: 1400px; }
.ltu-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
.ltu-title { font-family:'Manrope',sans-serif; font-size:1.75rem; font-weight:800; color:#0F172A; letter-spacing:-.04em; margin:0; }
.ltu-sub { font-family:'Inter',sans-serif; font-size:.875rem; color:#64748B; margin:4px 0 0; }
.ltu-actions { display:flex; gap:8px; flex-wrap:wrap; }
.ltu-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; }
.ltu-btn--outline { border:1.5px solid #E2E8F0; background:#FFF; color:#475569; }
.ltu-btn--outline:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.ltu-btn--primary { border:none; background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.ltu-btn--primary:hover { background:#1D4ED8; }

.ltu-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
@media(max-width:600px){ .ltu-stats{ grid-template-columns:1fr; } }
.ltu-stat { background:#FFF; border-radius:12px; border:1px solid #E2E8F0; padding:18px; display:flex; flex-direction:column; gap:8px; }
.ltu-stat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
.ltu-stat-val { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; letter-spacing:-.03em; }
.ltu-stat-label { font-family:'Inter',sans-serif; font-size:.78rem; color:#64748B; }

.ltu-toolbar { display:flex; align-items:center; gap:14px; margin-bottom:20px; }
.ltu-search-wrap { position:relative; flex:1; max-width:400px; }
.ltu-search-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
.ltu-search { width:100%; padding:9px 32px 9px 38px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; font-size:.82rem; font-family:'Inter',sans-serif; color:#0F172A; outline:none; transition:all .2s; }
.ltu-search:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
.ltu-search-clear { position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:transparent; color:#94A3B8; cursor:pointer; }

.ltu-table-wrap { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; }
.ltu-table-head { display:flex; align-items:center; gap:12px; padding:12px 20px; background:#FAFBFC; border-bottom:1px solid #F1F5F9; }
.ltu-th { flex:1; font-family:'Inter',sans-serif; font-size:.7rem; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:.04em; }
.ltu-th--main { flex:2; }

.ltu-row { display:flex; align-items:center; gap:12px; padding:14px 20px; border-bottom:1px solid #F8FAFC; transition:background .1s; cursor:pointer; }
.ltu-row:hover { background:#FAFBFC; }
.ltu-row:last-child { border-bottom:none; }
.ltu-row-avatar { width:44px; height:44px; border-radius:12px; overflow:hidden; flex-shrink:0; }
.ltu-row-avatar img { width:100%; height:100%; object-fit:cover; }
.ltu-avatar-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#EFF6FF,#DBEAFE); color:#2563EB; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; border-radius:12px; }
.ltu-row-name { flex:2; display:flex; flex-direction:column; gap:2px; min-width:0; }
.ltu-name { font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; }
.ltu-email { font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; }
.ltu-row-cell { flex:1; font-family:'Inter',sans-serif; font-size:.8rem; color:#475569; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.ltu-chip { display:inline-flex; padding:3px 10px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600; }
.ltu-status { display:inline-flex; align-items:center; gap:4px; padding:4px 12px; border-radius:8px; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; }
.ltu-status--active { background:#ECFDF5; color:#059669; }
.ltu-status--inactive { background:#FEF2F2; color:#DC2626; }

.ltu-skel { height:68px; margin:0 20px; border-bottom:1px solid #F8FAFC; background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%); background-size:200% 100%; animation:ltShimmer 1.5s infinite; }
@keyframes ltShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.ltu-empty { display:flex; flex-direction:column; align-items:center; padding:60px; color:#CBD5E1; gap:8px; }
.ltu-empty p { font-family:'Inter',sans-serif; font-size:.85rem; color:#94A3B8; margin:0; }

@media(max-width:900px){
  .ltu-table-head { display:none; }
  .ltu-row { flex-wrap:wrap; }
  .ltu-row-cell { font-size:.72rem; }
}
`

export default PremiumUsers
