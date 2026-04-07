import {useState, useEffect, useCallback} from 'react'
import {useWebSocket} from '../../hooks/useWebSocket'
import {
  CalendarDays, Search, X, Filter, Clock, User, MapPin, Truck, Eye,
  LogIn, LogOut, CheckCircle2, XCircle, AlertTriangle, Loader2, ChevronDown,
  FileText, ArrowRight, Download, Wifi, WifiOff
} from 'lucide-react'

const API = process.env.REACT_APP_BACKEND_URL

const STATUS_MAP = {
  confirmed: {label: 'Confirmé', bg: '#DBEAFE', color: '#2563EB'},
  in_progress: {label: 'En cours', bg: '#FEF3C7', color: '#D97706'},
  completed: {label: 'Terminé', bg: '#D1FAE5', color: '#059669'},
  cancelled: {label: 'Annulé', bg: '#FEE2E2', color: '#DC2626'},
  requested: {label: 'Demandé', bg: '#E0E7FF', color: '#4F46E5'},
  rejected: {label: 'Rejeté', bg: '#FCE7F3', color: '#BE185D'},
  expired: {label: 'Expiré', bg: '#F1F5F9', color: '#64748B'},
}
const PRIORITY_MAP = {
  low: {label: 'Basse', color: '#64748B', bg: '#F1F5F9'},
  normal: {label: 'Normal', color: '#2563EB', bg: '#EFF6FF'},
  high: {label: 'Haute', color: '#D97706', bg: '#FFFBEB'},
  urgent: {label: 'Urgent', color: '#DC2626', bg: '#FEF2F2'},
}

const PremiumMyReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')
  const [search, setSearch] = useState('')
  const [showDetail, setShowDetail] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Checkout/Checkin modal
  const [coModal, setCoModal] = useState(null)
  const [ciModal, setCiModal] = useState(null)
  const [coForm, setCoForm] = useState({user_name: '', location: '', condition: 'good', comment: ''})
  const [ciForm, setCiForm] = useState({user_name: '', condition: 'good', comment: ''})

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/reservations`)
      const data = await res.json()
      setReservations(Array.isArray(data) ? data : [])
    } catch { setReservations([]) }
    setLoading(false)
  }, [])

  // WebSocket real-time updates
  const {connected} = useWebSocket(useCallback((msg) => {
    if (['reservation_created', 'reservation_moved', 'reservation_checkout', 'reservation_checkin', 'reservation_cancelled'].includes(msg.type)) {
      fetchData()
    }
  }, [fetchData]))

  useEffect(() => { fetchData() }, [fetchData])

  // Export CSV
  const handleExportCSV = async (statusFilter) => {
    setExportLoading(true)
    try {
      const params = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const res = await fetch(`${API}/api/reservations/export/csv${params}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reservations${statusFilter && statusFilter !== 'all' ? '_' + statusFilter : ''}_${new Date().toISOString().slice(0,10)}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch {}
    setExportLoading(false)
  }

  const filtered = reservations.filter(r => {
    if (tab === 'active' && !['confirmed', 'in_progress', 'requested'].includes(r.status)) return false
    if (tab === 'past' && !['completed', 'cancelled', 'rejected', 'expired'].includes(r.status)) return false
    if (search) {
      const t = search.toLowerCase()
      if (![r.asset_name, r.site, r.address].some(f => f && f.toLowerCase().includes(t))) return false
    }
    return true
  }).sort((a, b) => new Date(b.start_date) - new Date(a.start_date))

  const handleCheckout = async () => {
    if (!coModal) return
    setActionLoading(true)
    try {
      await fetch(`${API}/api/reservations/${coModal.id}/checkout`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(coForm)
      })
      setCoModal(null)
      fetchData()
    } catch {}
    setActionLoading(false)
  }

  const handleCheckin = async () => {
    if (!ciModal) return
    setActionLoading(true)
    try {
      await fetch(`${API}/api/reservations/${ciModal.id}/checkin`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(ciForm)
      })
      setCiModal(null)
      fetchData()
    } catch {}
    setActionLoading(false)
  }

  const handleCancel = async (id) => {
    await fetch(`${API}/api/reservations/${id}/cancel`, {method: 'POST'})
    fetchData()
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'})
  const formatTime = (d) => new Date(d).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})

  return (
    <>
      <style>{STYLES}</style>
      <div className="mr" data-testid="my-reservations">
        <div className="mr-header">
          <div>
            <h1 className="mr-title" data-testid="myres-title">Mes Réservations</h1>
            <p className="mr-sub">{filtered.length} réservation{filtered.length !== 1 ? 's' : ''} {connected && <span className="mr-ws-live" data-testid="ws-indicator"><Wifi size={10} /> Live</span>}</p>
          </div>
          <div className="mr-header-actions">
            <button className="mr-export-btn" onClick={() => handleExportCSV(tab === 'active' ? null : null)} disabled={exportLoading} data-testid="export-csv-btn">
              {exportLoading ? <Loader2 size={14} className="mr-spin" /> : <Download size={14} />} Export CSV
            </button>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="mr-toolbar" data-testid="myres-toolbar">
          <div className="mr-tabs">
            <button className={`mr-tab ${tab === 'active' ? 'mr-tab--active' : ''}`} onClick={() => setTab('active')} data-testid="tab-active">
              Actives
            </button>
            <button className={`mr-tab ${tab === 'past' ? 'mr-tab--active' : ''}`} onClick={() => setTab('past')} data-testid="tab-past">
              Historique
            </button>
          </div>
          <div className="mr-search">
            <Search size={13} />
            <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} data-testid="myres-search" />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="mr-loading"><Loader2 size={28} className="mr-spin" /> Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="mr-empty"><FileText size={40} /><p>Aucune réservation {tab === 'active' ? 'active' : 'dans l\'historique'}</p></div>
        ) : (
          <div className="mr-grid" data-testid="myres-list">
            {filtered.map((r, i) => {
              const st = STATUS_MAP[r.status] || STATUS_MAP.confirmed
              const pr = PRIORITY_MAP[r.priority] || PRIORITY_MAP.normal
              const isOverdue = r.status === 'in_progress' && new Date(r.end_date) < new Date()
              return (
                <div key={r.id} className={`mr-vignette ${isOverdue ? 'mr-vignette--overdue' : ''}`} data-testid={`res-card-${i}`}>
                  <div className="mr-v-header">
                    <div className="mr-v-icon" style={{background: st.bg}}>
                      <Truck size={16} style={{color: st.color}} />
                    </div>
                    <div className="mr-v-badges">
                      <span className="mr-badge" style={{background: st.bg, color: st.color}}>{st.label}</span>
                      <span className="mr-badge" style={{background: pr.bg, color: pr.color}}>{pr.label}</span>
                      {isOverdue && <span className="mr-badge mr-badge--overdue"><AlertTriangle size={9} /> Retard</span>}
                    </div>
                  </div>
                  <h3 className="mr-v-asset">{r.asset_name}</h3>
                  <div className="mr-v-info">
                    {(r.site || r.address) && <div className="mr-v-row"><MapPin size={11} /> <span>{r.site || r.address}</span></div>}
                    <div className="mr-v-row"><CalendarDays size={11} /> <span>{formatDate(r.start_date)} {formatTime(r.start_date)}</span></div>
                    <div className="mr-v-row"><ArrowRight size={11} /> <span>{formatDate(r.end_date)} {formatTime(r.end_date)}</span></div>
                  </div>
                  <div className="mr-v-actions">
                    {r.status === 'confirmed' && (
                      <button className="mr-v-btn mr-v-btn--checkout" onClick={() => { setCoForm({user_name: '', location: r.site || '', condition: 'good', comment: ''}); setCoModal(r); }} data-testid={`checkout-btn-${i}`}>
                        <LogOut size={13} /> Sortie
                      </button>
                    )}
                    {r.status === 'in_progress' && (
                      <button className="mr-v-btn mr-v-btn--checkin" onClick={() => { setCiForm({user_name: '', condition: 'good', comment: ''}); setCiModal(r); }} data-testid={`checkin-btn-${i}`}>
                        <LogIn size={13} /> Retour
                      </button>
                    )}
                    {!['completed', 'cancelled', 'rejected'].includes(r.status) && (
                      <button className="mr-v-btn mr-v-btn--cancel" onClick={() => handleCancel(r.id)} data-testid={`cancel-btn-${i}`} title="Annuler">
                        <XCircle size={13} />
                      </button>
                    )}
                    <button className="mr-v-btn" onClick={() => setShowDetail(r)} data-testid={`detail-btn-${i}`} title="Détail">
                      <Eye size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Checkout Modal */}
        {coModal && (
          <div className="mr-modal-bg" onClick={() => setCoModal(null)}>
            <div className="mr-modal" onClick={e => e.stopPropagation()} data-testid="co-modal">
              <div className="mr-modal-head" style={{background: '#FFFBEB'}}><h2><LogOut size={16} /> Check-out — {coModal.asset_name}</h2><button onClick={() => setCoModal(null)}><X size={16} /></button></div>
              <div className="mr-modal-body">
                <div className="mr-field"><label>Responsable</label><input value={coForm.user_name} onChange={e => setCoForm(f => ({...f, user_name: e.target.value}))} data-testid="co-user" /></div>
                <div className="mr-field"><label>Lieu</label><input value={coForm.location} onChange={e => setCoForm(f => ({...f, location: e.target.value}))} /></div>
                <div className="mr-field"><label>État</label><select value={coForm.condition} onChange={e => setCoForm(f => ({...f, condition: e.target.value}))}><option value="good">Bon</option><option value="fair">Correct</option><option value="damaged">Endommagé</option></select></div>
                <div className="mr-field"><label>Commentaire</label><input value={coForm.comment} onChange={e => setCoForm(f => ({...f, comment: e.target.value}))} /></div>
              </div>
              <div className="mr-modal-foot"><button className="mr-btn mr-btn--ghost" onClick={() => setCoModal(null)}>Annuler</button><button className="mr-btn mr-btn--warning" onClick={handleCheckout} disabled={actionLoading} data-testid="co-submit">{actionLoading ? <Loader2 size={14} className="mr-spin" /> : <LogOut size={14} />} Sortie</button></div>
            </div>
          </div>
        )}

        {/* Checkin Modal */}
        {ciModal && (
          <div className="mr-modal-bg" onClick={() => setCiModal(null)}>
            <div className="mr-modal" onClick={e => e.stopPropagation()} data-testid="ci-modal">
              <div className="mr-modal-head" style={{background: '#ECFDF5'}}><h2><LogIn size={16} /> Check-in — {ciModal.asset_name}</h2><button onClick={() => setCiModal(null)}><X size={16} /></button></div>
              <div className="mr-modal-body">
                <div className="mr-field"><label>Responsable</label><input value={ciForm.user_name} onChange={e => setCiForm(f => ({...f, user_name: e.target.value}))} data-testid="ci-user" /></div>
                <div className="mr-field"><label>État retour</label><select value={ciForm.condition} onChange={e => setCiForm(f => ({...f, condition: e.target.value}))}><option value="good">Bon</option><option value="fair">Correct</option><option value="damaged">Endommagé</option></select></div>
                <div className="mr-field"><label>Commentaire</label><input value={ciForm.comment} onChange={e => setCiForm(f => ({...f, comment: e.target.value}))} /></div>
              </div>
              <div className="mr-modal-foot"><button className="mr-btn mr-btn--ghost" onClick={() => setCiModal(null)}>Annuler</button><button className="mr-btn mr-btn--success" onClick={handleCheckin} disabled={actionLoading} data-testid="ci-submit">{actionLoading ? <Loader2 size={14} className="mr-spin" /> : <LogIn size={14} />} Retour</button></div>
            </div>
          </div>
        )}

        {/* Detail Drawer */}
        {showDetail && (
          <div className="mr-modal-bg" onClick={() => setShowDetail(null)}>
            <div className="mr-drawer" onClick={e => e.stopPropagation()} data-testid="detail-drawer">
              <div className="mr-drawer-head"><h3>Détail</h3><button onClick={() => setShowDetail(null)}><X size={16} /></button></div>
              {(() => { const r = showDetail; const st = STATUS_MAP[r.status] || STATUS_MAP.confirmed; return (
                <div className="mr-drawer-body">
                  <div className="mr-drawer-badges"><span className="mr-badge" style={{background: st.bg, color: st.color}}>{st.label}</span></div>
                  <h2 className="mr-drawer-asset">{r.asset_name}</h2>
                  <div className="mr-drawer-grid">
                    <div className="mr-drow"><label>Site</label><span>{r.site || '—'}</span></div>
                    {r.address && <div className="mr-drow"><label>Adresse</label><span>{r.address}</span></div>}
                    <div className="mr-drow"><label>Début</label><span>{new Date(r.start_date).toLocaleString('fr-FR')}</span></div>
                    <div className="mr-drow"><label>Fin</label><span>{new Date(r.end_date).toLocaleString('fr-FR')}</span></div>
                    {r.note && <div className="mr-drow"><label>Note</label><span>{r.note}</span></div>}
                    {r.checkout_at && <><div className="mr-drow"><label>Sorti le</label><span>{new Date(r.checkout_at).toLocaleString('fr-FR')}</span></div><div className="mr-drow"><label>Sorti par</label><span>{r.checkout_by}</span></div></>}
                    {r.checkin_at && <><div className="mr-drow"><label>Retourné le</label><span>{new Date(r.checkin_at).toLocaleString('fr-FR')}</span></div><div className="mr-drow"><label>État retour</label><span>{r.checkin_condition}</span></div></>}
                  </div>
                </div>
              )})()}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const STYLES = `
.mr { max-width:100%; }
.mr-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
.mr-header-actions { display:flex; gap:8px; }
.mr-title { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; color:#0F172A; margin:0; }
.mr-sub { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:4px 0 0; display:flex; align-items:center; gap:8px; }
.mr-ws-live { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:10px; background:#ECFDF5; color:#059669; font-size:.65rem; font-weight:700; animation:mrPulse 2s ease infinite; }
@keyframes mrPulse { 0%,100%{opacity:1;} 50%{opacity:.6;} }
.mr-export-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; color:#475569; cursor:pointer; transition:all .15s; }
.mr-export-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.mr-export-btn:disabled { opacity:.4; cursor:not-allowed; }
.mr-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
.mr-tabs { display:flex; background:#F1F5F9; border-radius:10px; padding:3px; }
.mr-tab { padding:8px 20px; border-radius:8px; border:none; background:transparent; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#64748B; cursor:pointer; transition:all .12s; }
.mr-tab--active { background:#2563EB; color:#FFF; box-shadow:0 2px 8px rgba(37,99,235,.2); }
.mr-search { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; }
.mr-search svg { color:#94A3B8; }
.mr-search input { border:none; background:transparent; font-family:'Inter',sans-serif; font-size:.78rem; color:#0F172A; outline:none; width:180px; }
.mr-loading { display:flex; align-items:center; justify-content:center; gap:10px; padding:60px; color:#64748B; }
.mr-spin { animation:mrSpin 1s linear infinite; }
.mr-empty { display:flex; flex-direction:column; align-items:center; gap:12px; padding:60px; color:#94A3B8; }
.mr-empty p { font-family:'Inter',sans-serif; font-size:.88rem; }

/* ─── GRID VIGNETTES ─── */
.mr-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:14px; }
.mr-vignette {
  display:flex; flex-direction:column; padding:16px 18px; background:#FFF;
  border-radius:14px; border:1.5px solid #E2E8F0; transition:all .2s ease;
  position:relative; overflow:hidden;
}
.mr-vignette:hover { border-color:#CBD5E1; box-shadow:0 8px 24px rgba(0,0,0,.06); transform:translateY(-2px); }
.mr-vignette--overdue { border-color:#FCA5A5; }
.mr-vignette--overdue::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#EF4444,#F97316);
}
.mr-v-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.mr-v-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.mr-v-badges { display:flex; gap:5px; flex-wrap:wrap; }
.mr-badge { display:inline-flex; align-items:center; gap:3px; padding:3px 9px; border-radius:14px; font-family:'Inter',sans-serif; font-size:.6rem; font-weight:700; white-space:nowrap; }
.mr-badge--overdue { background:#FEF2F2; color:#DC2626; }
.mr-v-asset { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:800; color:#0F172A; margin:0 0 8px; line-height:1.2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.mr-v-info { display:flex; flex-direction:column; gap:4px; margin-bottom:12px; }
.mr-v-row { display:flex; align-items:center; gap:6px; font-family:'Inter',sans-serif; font-size:.7rem; color:#64748B; }
.mr-v-row svg { color:#94A3B8; flex-shrink:0; }
.mr-v-row span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.mr-v-actions { display:flex; gap:6px; margin-top:auto; padding-top:10px; border-top:1px solid #F1F5F9; flex-wrap:wrap; }
.mr-v-btn {
  display:inline-flex; align-items:center; gap:4px; padding:6px 10px;
  border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF;
  font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600; color:#475569;
  cursor:pointer; transition:all .12s; white-space:nowrap;
}
.mr-v-btn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.mr-v-btn--checkout { border-color:#F59E0B; color:#D97706; background:#FFFBEB; }
.mr-v-btn--checkout:hover { background:#FEF3C7; }
.mr-v-btn--checkin { border-color:#10B981; color:#059669; background:#ECFDF5; }
.mr-v-btn--checkin:hover { background:#D1FAE5; }
.mr-v-btn--cancel { border-color:#EF4444; color:#DC2626; }
.mr-v-btn--cancel:hover { background:#FEF2F2; }

/* Modal / Drawer */
.mr-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
.mr-modal { background:#FFF; border-radius:16px; width:100%; max-width:460px; box-shadow:0 24px 48px rgba(0,0,0,.15); animation:mrFadeIn .2s ease; }
.mr-modal-head { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #E2E8F0; border-radius:16px 16px 0 0; }
.mr-modal-head h2 { font-family:'Manrope',sans-serif; font-size:.92rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:8px; }
.mr-modal-head button { background:none; border:none; color:#94A3B8; cursor:pointer; }
.mr-modal-body { padding:22px; display:flex; flex-direction:column; gap:14px; }
.mr-modal-foot { display:flex; justify-content:flex-end; gap:8px; padding:14px 22px; border-top:1px solid #E2E8F0; }
.mr-field { display:flex; flex-direction:column; gap:5px; }
.mr-field label { font-family:'Manrope',sans-serif; font-size:.7rem; font-weight:700; color:#475569; text-transform:uppercase; }
.mr-field input,.mr-field select { padding:9px 13px; border-radius:10px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.82rem; color:#0F172A; outline:none; }
.mr-field input:focus,.mr-field select:focus { border-color:#2563EB; }
.mr-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; border:none; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; }
.mr-btn--ghost { background:#F1F5F9; color:#475569; }
.mr-btn--warning { background:#F59E0B; color:#FFF; }
.mr-btn--success { background:#10B981; color:#FFF; }
.mr-btn:disabled { opacity:.4; }

.mr-drawer { position:fixed; right:0; top:0; width:400px; max-width:100%; height:100%; background:#FFF; overflow-y:auto; box-shadow:-8px 0 24px rgba(0,0,0,.1); animation:mrSlideIn .25s ease; }
.mr-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:20px 22px; border-bottom:1px solid #E2E8F0; position:sticky; top:0; background:#FFF; z-index:1; }
.mr-drawer-head h3 { font-family:'Manrope',sans-serif; font-size:1rem; font-weight:800; color:#0F172A; margin:0; }
.mr-drawer-head button { background:none; border:none; color:#94A3B8; cursor:pointer; }
.mr-drawer-body { padding:22px; }
.mr-drawer-badges { display:flex; gap:8px; margin-bottom:14px; }
.mr-drawer-asset { font-family:'Manrope',sans-serif; font-size:1.1rem; font-weight:800; color:#0F172A; margin:0 0 18px; }
.mr-drawer-grid { display:flex; flex-direction:column; gap:4px; }
.mr-drow { display:flex; align-items:center; padding:10px 14px; border-radius:8px; background:#F8FAFC; }
.mr-drow label { font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; width:90px; flex-shrink:0; }
.mr-drow span { font-family:'Inter',sans-serif; font-size:.82rem; color:#0F172A; font-weight:600; }

@keyframes mrSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes mrFadeIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
@keyframes mrSlideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
@media(max-width:768px) {
  .mr-grid { grid-template-columns:1fr; }
  .mr-drawer { width:100%; }
}
@media(max-width:480px) {
  .mr-v-actions { flex-direction:column; }
}
`

export default PremiumMyReservations
