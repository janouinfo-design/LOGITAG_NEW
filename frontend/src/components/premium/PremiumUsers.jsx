import {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchTeams, getTeams} from '../Teams/slice/team.slice'
import {API_BASE_URL_IMAGE} from '../../api/config'
import {
  Users, Search, X, UserPlus, Download, FileSpreadsheet,
  FileText, Clock, Shield, CheckCircle, XCircle, Eye, Truck,
  Pencil, Save, Loader2, Mail, Phone, Briefcase
} from 'lucide-react'

const ROLES = ['Employé', 'Manager', 'Admin', 'Technicien']

const PremiumUsers = () => {
  const dispatch = useAppDispatch()
  const teams = useAppSelector(getTeams)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

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

  const openUserEdit = (user) => {
    setEditForm({
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      addrMail: user?.addrMail || '',
      password: '',
      phone: user?.phone || '',
      poste: user?.poste || '',
      role: user?.typeName || 'Employé',
      active: user?.active ?? true,
    })
    setEditUser(user || {id: null})
    setSaveMsg(null)
  }

  const handleUserSave = () => {
    setSaving(true)
    setSaveMsg(null)
    // Simulate save via external API
    setTimeout(() => {
      setSaving(false)
      setSaveMsg({type: 'success', text: 'Utilisateur sauvegardé'})
      setTimeout(() => { setEditUser(null); setSaveMsg(null) }, 1000)
    }, 800)
  }

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
            <button className="ltu-btn ltu-btn--primary" onClick={() => openUserEdit(null)} data-testid="users-add-btn">
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
            <span className="ltu-th" style={{width: 60}}></span>
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
                  <div className="ltu-row-cell" style={{width: 60}}>
                    <button className="ltu-edit-btn" onClick={() => openUserEdit(user)} data-testid={`user-edit-btn-${i}`}>
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* User Edit/Create Modal */}
        {editUser && (
          <div className="ltu-modal-bg" onClick={() => !saving && setEditUser(null)} data-testid="user-edit-overlay">
            <div className="ltu-modal" onClick={(e) => e.stopPropagation()} data-testid="user-edit-modal">
              <div className="ltu-modal-head">
                <h2>{editUser.id ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
                <button className="ltu-modal-close" onClick={() => setEditUser(null)}><X size={18} /></button>
              </div>
              <div className="ltu-modal-body">
                <div className="ltu-modal-tabs">
                  <span className="ltu-modal-tab ltu-modal-tab--active">Identité</span>
                  <span className="ltu-modal-tab">Contrat</span>
                  <span className="ltu-modal-tab">Avancé</span>
                </div>
                <div className="ltu-edit-grid">
                  <div className="ltu-edit-field">
                    <label>Prénom</label>
                    <input type="text" value={editForm.firstname} onChange={(e) => setEditForm(p => ({...p, firstname: e.target.value}))} placeholder="Prénom" data-testid="user-edit-firstname" />
                  </div>
                  <div className="ltu-edit-field">
                    <label>Nom</label>
                    <input type="text" value={editForm.lastname} onChange={(e) => setEditForm(p => ({...p, lastname: e.target.value}))} placeholder="Nom de famille" data-testid="user-edit-lastname" />
                  </div>
                  <div className="ltu-edit-field ltu-edit-field--full">
                    <label>Email</label>
                    <div className="ltu-input-icon">
                      <Mail size={14} />
                      <input type="email" value={editForm.addrMail} onChange={(e) => setEditForm(p => ({...p, addrMail: e.target.value}))} placeholder="email@exemple.com" data-testid="user-edit-email" />
                    </div>
                  </div>
                  <div className="ltu-edit-field">
                    <label>Mot de passe</label>
                    <input type="password" value={editForm.password} onChange={(e) => setEditForm(p => ({...p, password: e.target.value}))} placeholder="••••••••" data-testid="user-edit-password" />
                  </div>
                  <div className="ltu-edit-field">
                    <label>Téléphone</label>
                    <div className="ltu-input-icon">
                      <Phone size={14} />
                      <input type="text" value={editForm.phone} onChange={(e) => setEditForm(p => ({...p, phone: e.target.value}))} placeholder="+33 6 XX XX XX XX" data-testid="user-edit-phone" />
                    </div>
                  </div>
                  <div className="ltu-edit-field ltu-edit-field--full">
                    <label>Poste / Fonction</label>
                    <div className="ltu-input-icon">
                      <Briefcase size={14} />
                      <input type="text" value={editForm.poste} onChange={(e) => setEditForm(p => ({...p, poste: e.target.value}))} placeholder="Ex: Chef de chantier" data-testid="user-edit-poste" />
                    </div>
                  </div>
                  <div className="ltu-edit-field ltu-edit-field--full">
                    <label>Rôle</label>
                    <div className="ltu-role-chips" data-testid="user-edit-role">
                      {ROLES.map(r => (
                        <button key={r} className={`ltu-role-chip ${editForm.role === r ? 'ltu-role-chip--active' : ''}`} onClick={() => setEditForm(p => ({...p, role: r}))}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="ltu-edit-field ltu-edit-field--full">
                    <label>Statut</label>
                    <label className="ltu-active-toggle">
                      <input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm(p => ({...p, active: e.target.checked}))} />
                      <span className="ltu-toggle-switch" />
                      {editForm.active ? 'Actif' : 'Inactif'}
                    </label>
                  </div>
                </div>
                {saveMsg && (
                  <div className={`ltu-save-msg ${saveMsg.type === 'success' ? 'ltu-save-msg--ok' : 'ltu-save-msg--err'}`}>{saveMsg.text}</div>
                )}
              </div>
              <div className="ltu-modal-foot">
                <button className="ltu-modal-btn ltu-modal-btn--cancel" onClick={() => setEditUser(null)} disabled={saving}>Annuler</button>
                <button className="ltu-modal-btn ltu-modal-btn--save" onClick={handleUserSave} disabled={saving} data-testid="user-save-btn">
                  {saving ? <><Loader2 size={14} className="ltu-spin" /> Sauvegarde...</> : <><Save size={14} /> Enregistrer</>}
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

/* Edit button in row */
.ltu-edit-btn { width:32px; height:32px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.ltu-edit-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }

/* ── User Edit Modal ── */
.ltu-modal-bg { position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; }
.ltu-modal { background:#FFF; border-radius:16px; width:100%; max-width:580px; box-shadow:0 20px 60px rgba(0,0,0,.18); overflow:hidden; animation:ltuSlide .25s ease; max-height:90vh; display:flex; flex-direction:column; }
@keyframes ltuSlide { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
.ltu-modal-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #F1F5F9; }
.ltu-modal-head h2 { font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; margin:0; }
.ltu-modal-close { width:36px; height:36px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; color:#94A3B8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.ltu-modal-close:hover { border-color:#EF4444; color:#EF4444; }
.ltu-modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:16px; overflow-y:auto; flex:1; }
.ltu-modal-tabs { display:flex; gap:0; border:1.5px solid #E2E8F0; border-radius:10px; overflow:hidden; }
.ltu-modal-tab { flex:1; padding:8px; text-align:center; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:600; color:#94A3B8; cursor:pointer; transition:all .15s; border-right:1px solid #E2E8F0; }
.ltu-modal-tab:last-child { border-right:none; }
.ltu-modal-tab--active { background:#2563EB; color:#FFF; }
.ltu-edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.ltu-edit-field { display:flex; flex-direction:column; gap:5px; }
.ltu-edit-field--full { grid-column:1/-1; }
.ltu-edit-field label { font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.04em; }
.ltu-edit-field input { padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FAFBFC; font-family:'Inter',sans-serif; font-size:.85rem; color:#0F172A; outline:none; transition:all .2s; width:100%; box-sizing:border-box; }
.ltu-edit-field input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); background:#FFF; }
.ltu-input-icon { display:flex; align-items:center; gap:8px; padding:0 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FAFBFC; transition:all .2s; }
.ltu-input-icon:focus-within { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); background:#FFF; }
.ltu-input-icon svg { color:#94A3B8; flex-shrink:0; }
.ltu-input-icon input { border:none !important; background:transparent !important; padding:10px 0 !important; box-shadow:none !important; }
.ltu-role-chips { display:flex; gap:8px; flex-wrap:wrap; }
.ltu-role-chip { padding:7px 16px; border-radius:20px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .15s; }
.ltu-role-chip:hover { border-color:#2563EB; color:#2563EB; }
.ltu-role-chip--active { background:#2563EB; color:#FFF; border-color:#2563EB; }
.ltu-active-toggle { display:flex; align-items:center; gap:10px; font-family:'Inter',sans-serif; font-size:.82rem; color:#475569; cursor:pointer; }
.ltu-active-toggle input { display:none; }
.ltu-toggle-switch { width:40px; height:22px; border-radius:11px; background:#E2E8F0; position:relative; transition:background .2s; flex-shrink:0; }
.ltu-toggle-switch::after { content:''; position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#FFF; transition:transform .2s; }
.ltu-active-toggle input:checked + .ltu-toggle-switch { background:#059669; }
.ltu-active-toggle input:checked + .ltu-toggle-switch::after { transform:translateX(18px); }
.ltu-save-msg { padding:10px 16px; border-radius:10px; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:500; }
.ltu-save-msg--ok { background:#ECFDF5; color:#059669; }
.ltu-save-msg--err { background:#FEF2F2; color:#DC2626; }
.ltu-modal-foot { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:1px solid #F1F5F9; }
.ltu-modal-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:all .15s; }
.ltu-modal-btn--cancel { border:1.5px solid #E2E8F0; background:#FFF; color:#64748B; }
.ltu-modal-btn--save { border:none; background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.ltu-modal-btn--save:hover { background:#1D4ED8; }
.ltu-modal-btn--save:disabled { opacity:.6; cursor:not-allowed; }
@keyframes ltuSpin { to{transform:rotate(360deg)} }
.ltu-spin { animation:ltuSpin .8s linear infinite; }

@media(max-width:900px){
  .ltu-table-head { display:none; }
  .ltu-row { flex-wrap:wrap; }
  .ltu-row-cell { font-size:.72rem; }
}
`

export default PremiumUsers
