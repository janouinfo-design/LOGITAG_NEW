import { useState, useEffect, useCallback } from 'react'
import {
  Shield, Users, Plus, X, Check, ChevronDown, Loader2, Search,
  Crown, UserCog, Briefcase, HardHat, Lock, Unlock, Trash2, Edit3
} from 'lucide-react'

const API = process.env.REACT_APP_BACKEND_URL

const ROLE_META = {
  super_admin: { label: 'Super Admin', icon: Crown, color: '#DC2626', bg: '#FEF2F2', desc: 'Accès total à toutes les fonctionnalités' },
  admin_client: { label: 'Admin Client', icon: UserCog, color: '#2563EB', bg: '#EFF6FF', desc: 'Gestion complète sauf super admin' },
  manager: { label: 'Manager', icon: Briefcase, color: '#D97706', bg: '#FFFBEB', desc: 'Réservations, rapports lecture, planning' },
  terrain: { label: 'Terrain', icon: HardHat, color: '#059669', bg: '#ECFDF5', desc: 'Check-in/out, lecture assets, réservations basiques' },
}

const PremiumRoles = () => {
  const [roles, setRoles] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssign, setShowAssign] = useState(false)
  const [assignForm, setAssignForm] = useState({ user_id: '', user_name: '', role: 'terrain' })
  const [assignLoading, setAssignLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [rolesRes, usersRes] = await Promise.all([
        fetch(`${API}/api/roles`),
        fetch(`${API}/api/roles/users`),
      ])
      const rolesData = await rolesRes.json()
      const usersData = await usersRes.json()
      setRoles(rolesData)
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAssign = async () => {
    if (!assignForm.user_id || !assignForm.user_name) return
    setAssignLoading(true)
    try {
      const res = await fetch(`${API}/api/roles/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm),
      })
      if (res.ok) {
        setShowAssign(false)
        setAssignForm({ user_id: '', user_name: '', role: 'terrain' })
        fetchData()
      }
    } catch {}
    setAssignLoading(false)
  }

  const filtered = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false
    if (search) {
      const t = search.toLowerCase()
      if (!u.user_name?.toLowerCase().includes(t) && !u.user_id?.toLowerCase().includes(t)) return false
    }
    return true
  })

  return (
    <>
      <style>{STYLES}</style>
      <div className="rl" data-testid="roles-page">
        <div className="rl-header">
          <div>
            <h1 className="rl-title" data-testid="roles-title"><Shield size={24} /> Rôles & Permissions</h1>
            <p className="rl-sub">{users.length} utilisateur{users.length !== 1 ? 's' : ''} avec rôle assigné</p>
          </div>
          <button className="rl-assign-btn" onClick={() => setShowAssign(true)} data-testid="assign-role-btn">
            <Plus size={16} /> Assigner un rôle
          </button>
        </div>

        {/* Roles Overview Cards */}
        <div className="rl-roles-grid" data-testid="roles-grid">
          {Object.entries(ROLE_META).map(([key, meta]) => {
            const Icon = meta.icon
            const count = users.filter(u => u.role === key).length
            return (
              <div key={key} className="rl-role-card" data-testid={`role-card-${key}`}>
                <div className="rl-role-icon" style={{ background: meta.bg }}>
                  <Icon size={22} style={{ color: meta.color }} />
                </div>
                <div className="rl-role-info">
                  <span className="rl-role-name" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="rl-role-desc">{meta.desc}</span>
                </div>
                <span className="rl-role-count" style={{ background: meta.bg, color: meta.color }}>{count}</span>
              </div>
            )
          })}
        </div>

        {/* Permissions Matrix */}
        {roles && (
          <div className="rl-matrix-panel" data-testid="permissions-matrix">
            <div className="rl-panel-head">
              <h2><Lock size={16} /> Matrice des permissions</h2>
            </div>
            <div className="rl-matrix-scroll">
              <table className="rl-matrix">
                <thead>
                  <tr>
                    <th>Permission</th>
                    {Object.keys(ROLE_META).map(r => (
                      <th key={r} style={{ color: ROLE_META[r].color }}>{ROLE_META[r].label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { perm: 'reservations.*', label: 'Réservations (CRUD)' },
                    { perm: 'reservations.read', label: 'Réservations (lecture)' },
                    { perm: 'reservations.create', label: 'Réservations (création)' },
                    { perm: 'reservations.checkout', label: 'Check-out' },
                    { perm: 'reservations.checkin', label: 'Check-in' },
                    { perm: 'assets.read', label: 'Assets (lecture)' },
                    { perm: 'assets.edit', label: 'Assets (édition)' },
                    { perm: 'users.read', label: 'Utilisateurs (lecture)' },
                    { perm: 'users.edit', label: 'Utilisateurs (édition)' },
                    { perm: 'reports.*', label: 'Rapports (tous)' },
                    { perm: 'reports.read', label: 'Rapports (lecture)' },
                    { perm: 'notifications.*', label: 'Notifications' },
                    { perm: 'planning.*', label: 'Planning (complet)' },
                    { perm: 'planning.read', label: 'Planning (lecture)' },
                    { perm: 'zones.read', label: 'Zones (lecture)' },
                  ].map(({ perm, label }) => (
                    <tr key={perm}>
                      <td className="rl-perm-label">{label}</td>
                      {Object.keys(ROLE_META).map(role => {
                        const perms = roles.permissions[role] || []
                        const has = perms.includes('*') || perms.includes(perm) ||
                          perms.some(p => p.endsWith('.*') && perm.startsWith(p.slice(0, -2)))
                        return (
                          <td key={role} className="rl-perm-cell">
                            {has ? (
                              <span className="rl-perm-yes" style={{ color: ROLE_META[role].color }}><Check size={16} /></span>
                            ) : (
                              <span className="rl-perm-no"><X size={14} /></span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users with roles */}
        <div className="rl-users-panel" data-testid="users-panel">
          <div className="rl-panel-head">
            <h2><Users size={16} /> Utilisateurs assignés</h2>
            <div className="rl-panel-tools">
              <div className="rl-search-box">
                <Search size={13} />
                <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} data-testid="roles-search" />
              </div>
              <select className="rl-filter" value={filterRole} onChange={e => setFilterRole(e.target.value)} data-testid="roles-filter">
                <option value="all">Tous les rôles</option>
                {Object.entries(ROLE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          {loading ? (
            <div className="rl-loading"><Loader2 size={24} className="rl-spin" /> Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="rl-empty">Aucun utilisateur trouvé</div>
          ) : (
            <div className="rl-users-list">
              {filtered.map((u, i) => {
                const meta = ROLE_META[u.role] || ROLE_META.terrain
                const Icon = meta.icon
                return (
                  <div key={u.user_id || i} className="rl-user-row" data-testid={`user-row-${i}`}>
                    <div className="rl-user-avatar" style={{ background: meta.bg, color: meta.color }}>
                      {u.user_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="rl-user-info">
                      <span className="rl-user-name">{u.user_name}</span>
                      <span className="rl-user-id">ID: {u.user_id}</span>
                    </div>
                    <span className="rl-user-badge" style={{ background: meta.bg, color: meta.color }}>
                      <Icon size={12} /> {meta.label}
                    </span>
                    <span className="rl-user-date">{u.assigned_at ? new Date(u.assigned_at).toLocaleDateString('fr-FR') : '—'}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Assign Modal */}
        {showAssign && (
          <div className="rl-modal-bg" onClick={() => setShowAssign(false)}>
            <div className="rl-modal" onClick={e => e.stopPropagation()} data-testid="assign-modal">
              <div className="rl-modal-head">
                <h2><Shield size={18} /> Assigner un rôle</h2>
                <button onClick={() => setShowAssign(false)}><X size={18} /></button>
              </div>
              <div className="rl-modal-body">
                <div className="rl-field">
                  <label>ID Utilisateur *</label>
                  <input value={assignForm.user_id} onChange={e => setAssignForm(f => ({ ...f, user_id: e.target.value }))} placeholder="ex: user-001" data-testid="assign-user-id" />
                </div>
                <div className="rl-field">
                  <label>Nom *</label>
                  <input value={assignForm.user_name} onChange={e => setAssignForm(f => ({ ...f, user_name: e.target.value }))} placeholder="Nom complet" data-testid="assign-user-name" />
                </div>
                <div className="rl-field">
                  <label>Rôle</label>
                  <div className="rl-role-selector">
                    {Object.entries(ROLE_META).map(([key, meta]) => {
                      const Icon = meta.icon
                      return (
                        <button key={key}
                          className={`rl-role-opt ${assignForm.role === key ? 'rl-role-opt--active' : ''}`}
                          style={assignForm.role === key ? { borderColor: meta.color, background: meta.bg } : {}}
                          onClick={() => setAssignForm(f => ({ ...f, role: key }))}
                          data-testid={`role-opt-${key}`}
                        >
                          <Icon size={16} style={{ color: meta.color }} />
                          <span style={assignForm.role === key ? { color: meta.color } : {}}>{meta.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="rl-modal-foot">
                <button className="rl-btn rl-btn--ghost" onClick={() => setShowAssign(false)}>Annuler</button>
                <button className="rl-btn rl-btn--primary" onClick={handleAssign} disabled={assignLoading || !assignForm.user_id || !assignForm.user_name} data-testid="assign-submit">
                  {assignLoading ? <Loader2 size={14} className="rl-spin" /> : <Check size={14} />} Assigner
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
.rl { max-width:100%; }
.rl-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
.rl-title { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:10px; }
.rl-sub { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:4px 0 0; }
.rl-assign-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:12px; border:none; background:linear-gradient(135deg,#2563EB,#1D4ED8); color:#FFF; font-family:'Manrope',sans-serif; font-size:.84rem; font-weight:700; cursor:pointer; box-shadow:0 4px 14px rgba(37,99,235,.25); transition:all .15s; }
.rl-assign-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,.3); }

/* Roles Grid */
.rl-roles-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; margin-bottom:24px; }
.rl-role-card { display:flex; align-items:center; gap:14px; padding:20px; background:#FFF; border-radius:14px; border:1px solid #E2E8F0; transition:all .15s; }
.rl-role-card:hover { border-color:#CBD5E1; box-shadow:0 4px 12px rgba(0,0,0,.04); }
.rl-role-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.rl-role-info { flex:1; min-width:0; }
.rl-role-name { display:block; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:800; }
.rl-role-desc { display:block; font-family:'Inter',sans-serif; font-size:.68rem; color:#64748B; margin-top:2px; }
.rl-role-count { display:inline-flex; align-items:center; justify-content:center; min-width:30px; height:30px; border-radius:10px; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:800; flex-shrink:0; }

/* Matrix */
.rl-matrix-panel { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; margin-bottom:24px; overflow:hidden; }
.rl-panel-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #F1F5F9; flex-wrap:wrap; gap:10px; }
.rl-panel-head h2 { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:8px; }
.rl-panel-tools { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.rl-matrix-scroll { overflow-x:auto; }
.rl-matrix { width:100%; border-collapse:collapse; }
.rl-matrix th { padding:12px 16px; font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.02em; text-align:center; background:#FAFBFC; border-bottom:1px solid #E2E8F0; }
.rl-matrix th:first-child { text-align:left; }
.rl-matrix td { padding:10px 16px; border-bottom:1px solid #F8FAFC; text-align:center; }
.rl-perm-label { font-family:'Inter',sans-serif; font-size:.78rem; color:#475569; text-align:left !important; white-space:nowrap; }
.rl-perm-cell { text-align:center; }
.rl-perm-yes { display:inline-flex; }
.rl-perm-no { display:inline-flex; color:#D1D5DB; }

/* Users */
.rl-users-panel { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; }
.rl-search-box { display:flex; align-items:center; gap:6px; padding:7px 12px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; }
.rl-search-box svg { color:#94A3B8; flex-shrink:0; }
.rl-search-box input { border:none; background:transparent; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; width:140px; }
.rl-filter { padding:7px 12px; border-radius:10px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.76rem; color:#475569; background:#FFF; cursor:pointer; }
.rl-loading { display:flex; align-items:center; justify-content:center; gap:10px; padding:50px; color:#64748B; }
.rl-empty { padding:50px; text-align:center; font-family:'Inter',sans-serif; color:#94A3B8; font-size:.82rem; }
.rl-spin { animation:rlSpin 1s linear infinite; }
.rl-users-list { }
.rl-user-row { display:flex; align-items:center; gap:14px; padding:14px 20px; border-bottom:1px solid #F8FAFC; transition:background .1s; }
.rl-user-row:hover { background:#FAFBFC; }
.rl-user-avatar { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:800; flex-shrink:0; }
.rl-user-info { flex:1; min-width:0; }
.rl-user-name { display:block; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; }
.rl-user-id { display:block; font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; }
.rl-user-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:700; flex-shrink:0; }
.rl-user-date { font-family:'Inter',sans-serif; font-size:.68rem; color:#94A3B8; flex-shrink:0; }

/* Modal */
.rl-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
.rl-modal { background:#FFF; border-radius:16px; width:100%; max-width:520px; box-shadow:0 24px 48px rgba(0,0,0,.15); animation:rlFadeIn .2s ease; }
.rl-modal-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #E2E8F0; }
.rl-modal-head h2 { font-family:'Manrope',sans-serif; font-size:1rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:8px; }
.rl-modal-head button { background:none; border:none; color:#94A3B8; cursor:pointer; }
.rl-modal-body { padding:24px; display:flex; flex-direction:column; gap:16px; }
.rl-modal-foot { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:1px solid #E2E8F0; }
.rl-field { display:flex; flex-direction:column; gap:6px; }
.rl-field label { font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:700; color:#475569; text-transform:uppercase; }
.rl-field input { padding:10px 14px; border-radius:10px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.82rem; color:#0F172A; outline:none; }
.rl-field input:focus { border-color:#2563EB; }
.rl-role-selector { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.rl-role-opt { display:flex; align-items:center; gap:8px; padding:12px 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; cursor:pointer; transition:all .15s; }
.rl-role-opt span { font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; color:#475569; }
.rl-role-opt:hover { border-color:#CBD5E1; }
.rl-role-opt--active { border-width:2px; }
.rl-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; border:none; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; transition:all .12s; }
.rl-btn--primary { background:#2563EB; color:#FFF; }
.rl-btn--primary:hover { background:#1D4ED8; }
.rl-btn--ghost { background:#F1F5F9; color:#475569; }
.rl-btn:disabled { opacity:.4; cursor:not-allowed; }

@keyframes rlSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes rlFadeIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
@media(max-width:768px) {
  .rl-roles-grid { grid-template-columns:1fr; }
  .rl-role-selector { grid-template-columns:1fr; }
  .rl-matrix-scroll { font-size:.7rem; }
  .rl-user-row { flex-wrap:wrap; }
}
`

export default PremiumRoles
