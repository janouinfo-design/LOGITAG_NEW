import {useState, useEffect, useCallback, useMemo, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import {
  Calendar, ChevronLeft, ChevronRight, Clock, Truck, User, MapPin,
  Eye, CheckCircle2, XCircle, AlertTriangle, Loader2, ZoomIn, ZoomOut,
  Filter, Search, Shield, ArrowRight, Check, X as XIcon
} from 'lucide-react'

const API = process.env.REACT_APP_BACKEND_URL

const STATUS_COLORS = {
  requested: {bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', label: 'Demandé'},
  confirmed: {bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', label: 'Confirmé'},
  in_progress: {bg: '#D1FAE5', border: '#10B981', text: '#065F46', label: 'En cours'},
  completed: {bg: '#F1F5F9', border: '#94A3B8', text: '#475569', label: 'Terminé'},
  cancelled: {bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', label: 'Annulé'},
  rejected: {bg: '#FCE7F3', border: '#EC4899', text: '#9D174D', label: 'Rejeté'},
}

const PRIORITY_ICONS = {urgent: '!!', high: '!', normal: '', low: ''}

const PremiumGantt = () => {
  const navigate = useNavigate()
  const [ganttData, setGanttData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(14)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [hoveredRes, setHoveredRes] = useState(null)
  const [selectedRes, setSelectedRes] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const scrollRef = useRef(null)
  const [dayWidth, setDayWidth] = useState(80)

  const fetchGantt = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/reservations/gantt?days=${days}`)
      if (res.ok) setGanttData(await res.json())
    } catch {}
    setLoading(false)
  }, [days])

  useEffect(() => { fetchGantt() }, [fetchGantt])

  const rangeStart = ganttData ? new Date(ganttData.range_start) : new Date()
  const rangeEnd = ganttData ? new Date(ganttData.range_end) : new Date()
  const totalDays = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1
  const dateColumns = useMemo(() => {
    const cols = []
    const d = new Date(rangeStart)
    for (let i = 0; i < totalDays; i++) {
      cols.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return cols
  }, [rangeStart.toISOString(), totalDays])

  const isToday = (d) => {
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }

  const filteredAssets = useMemo(() => {
    if (!ganttData?.assets) return []
    return ganttData.assets.filter(a => {
      if (search && !a.asset_name.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all') {
        const hasStatus = a.reservations.some(r => r.status === statusFilter)
        if (!hasStatus) return false
      }
      return true
    })
  }, [ganttData, search, statusFilter])

  const getBarStyle = (res) => {
    const start = new Date(res.start_date)
    const end = new Date(res.end_date)
    const leftPx = ((start - rangeStart) / (1000 * 60 * 60 * 24)) * dayWidth
    const widthPx = Math.max(((end - start) / (1000 * 60 * 60 * 24)) * dayWidth, 24)
    const sc = STATUS_COLORS[res.status] || STATUS_COLORS.confirmed
    return {left: `${leftPx}px`, width: `${widthPx}px`, background: sc.bg, borderColor: sc.border, color: sc.text}
  }

  const handleApprove = async (id) => {
    setActionLoading(id)
    await fetch(`${API}/api/reservations/${id}/approve`, {method: 'POST'})
    setActionLoading(null)
    setSelectedRes(null)
    fetchGantt()
  }
  const handleReject = async (id) => {
    setActionLoading(id)
    await fetch(`${API}/api/reservations/${id}/reject`, {method: 'POST'})
    setActionLoading(null)
    setSelectedRes(null)
    fetchGantt()
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : '—'
  const fmtDay = (d) => d.toLocaleDateString('fr-FR', {weekday: 'short', day: '2-digit', month: '2-digit'})

  // Today marker position
  const todayOffset = ((new Date() - rangeStart) / (1000 * 60 * 60 * 24)) * dayWidth

  return (
    <div className="pg-page" data-testid="gantt-page">
      <style>{STYLES}</style>

      {/* TOOLBAR */}
      <div className="pg-toolbar">
        <div className="pg-toolbar-left">
          <h1 className="pg-title"><Calendar size={18} /> Planning Gantt</h1>
          <div className="pg-search">
            <Search size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un asset..." data-testid="gantt-search" />
          </div>
        </div>
        <div className="pg-toolbar-right">
          <select className="pg-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} data-testid="gantt-status-filter">
            <option value="all">Tous les statuts</option>
            <option value="requested">Demandé</option>
            <option value="confirmed">Confirmé</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
          <div className="pg-zoom">
            <button onClick={() => setDayWidth(w => Math.max(40, w - 20))} title="Réduire"><ZoomOut size={14} /></button>
            <span className="pg-zoom-val">{dayWidth}px</span>
            <button onClick={() => setDayWidth(w => Math.min(160, w + 20))} title="Agrandir"><ZoomIn size={14} /></button>
          </div>
          <select className="pg-select" value={days} onChange={e => setDays(+e.target.value)} data-testid="gantt-days">
            <option value={7}>7 jours</option>
            <option value={14}>14 jours</option>
            <option value={30}>30 jours</option>
          </select>
        </div>
      </div>

      {/* GANTT CHART */}
      {loading ? (
        <div className="pg-loading"><Loader2 size={24} className="pg-spin" /></div>
      ) : (
        <div className="pg-gantt-wrap">
          <div className="pg-gantt" ref={scrollRef}>
            {/* Header */}
            <div className="pg-header">
              <div className="pg-header-label">Asset</div>
              <div className="pg-header-dates" style={{width: totalDays * dayWidth}}>
                {dateColumns.map((d, i) => (
                  <div key={i} className={`pg-header-day ${isToday(d) ? 'pg-header-day--today' : ''}`} style={{width: dayWidth}}>
                    <span className="pg-day-name">{d.toLocaleDateString('fr-FR', {weekday: 'short'})}</span>
                    <span className="pg-day-num">{d.getDate()}/{d.getMonth()+1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {filteredAssets.length === 0 ? (
              <div className="pg-empty">Aucun asset avec réservation</div>
            ) : filteredAssets.map((asset, ai) => (
              <div key={asset.asset_id} className="pg-row" data-testid={`gantt-row-${ai}`}>
                <div className="pg-row-label">
                  <Truck size={13} />
                  <span className="pg-asset-name">{asset.asset_name}</span>
                  <span className="pg-res-count">{asset.reservations.length}</span>
                </div>
                <div className="pg-row-timeline" style={{width: totalDays * dayWidth}}>
                  {/* Grid lines */}
                  {dateColumns.map((d, i) => (
                    <div key={i} className={`pg-grid-cell ${isToday(d) ? 'pg-grid-cell--today' : ''} ${d.getDay() === 0 || d.getDay() === 6 ? 'pg-grid-cell--weekend' : ''}`} style={{left: i * dayWidth, width: dayWidth}} />
                  ))}
                  {/* Today marker */}
                  <div className="pg-today-line" style={{left: todayOffset}} />
                  {/* Reservation bars */}
                  {asset.reservations.map((res, ri) => {
                    const style = getBarStyle(res)
                    const sc = STATUS_COLORS[res.status] || STATUS_COLORS.confirmed
                    const isHovered = hoveredRes === res.id
                    const pri = PRIORITY_ICONS[res.priority] || ''
                    return (
                      <div key={res.id}
                        className={`pg-bar ${isHovered ? 'pg-bar--hover' : ''} ${res.status === 'requested' ? 'pg-bar--pending' : ''}`}
                        style={style}
                        onMouseEnter={() => setHoveredRes(res.id)}
                        onMouseLeave={() => setHoveredRes(null)}
                        onClick={() => setSelectedRes(res)}
                        data-testid={`gantt-bar-${ai}-${ri}`}
                        title={`${res.user_name} • ${sc.label} ${pri}`}
                      >
                        <span className="pg-bar-text">{res.user_name}{pri && <span className="pg-bar-pri">{pri}</span>}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAIL PANEL */}
      {selectedRes && (
        <div className="pg-detail-overlay" onClick={() => setSelectedRes(null)}>
          <div className="pg-detail" onClick={e => e.stopPropagation()} data-testid="gantt-detail">
            <div className="pg-detail-head">
              <h3>Détail de la réservation</h3>
              <button onClick={() => setSelectedRes(null)}><XIcon size={16} /></button>
            </div>
            <div className="pg-detail-body">
              <div className="pg-detail-row"><User size={13} /><label>Utilisateur</label><span>{selectedRes.user_name}</span></div>
              <div className="pg-detail-row"><Calendar size={13} /><label>Début</label><span>{fmtDate(selectedRes.start_date)}</span></div>
              <div className="pg-detail-row"><Calendar size={13} /><label>Fin</label><span>{fmtDate(selectedRes.end_date)}</span></div>
              <div className="pg-detail-row"><Shield size={13} /><label>Statut</label>
                <span className="pg-detail-status" style={{background: (STATUS_COLORS[selectedRes.status]||{}).bg, color: (STATUS_COLORS[selectedRes.status]||{}).text}}>
                  {(STATUS_COLORS[selectedRes.status]||{}).label}
                </span>
              </div>
              {selectedRes.site && <div className="pg-detail-row"><MapPin size={13} /><label>Site</label><span>{selectedRes.site}</span></div>}
              {selectedRes.address && <div className="pg-detail-row"><MapPin size={13} /><label>Adresse</label><span>{selectedRes.address}</span></div>}
              {selectedRes.project && <div className="pg-detail-row"><Truck size={13} /><label>Projet</label><span>{selectedRes.project}</span></div>}
              {selectedRes.note && <div className="pg-detail-row"><Eye size={13} /><label>Note</label><span>{selectedRes.note}</span></div>}
            </div>
            {selectedRes.status === 'requested' && (
              <div className="pg-detail-actions" data-testid="approval-actions">
                <button className="pg-approve-btn" onClick={() => handleApprove(selectedRes.id)} disabled={!!actionLoading} data-testid="approve-btn">
                  {actionLoading === selectedRes.id ? <Loader2 size={13} className="pg-spin" /> : <Check size={13} />} Approuver
                </button>
                <button className="pg-reject-btn" onClick={() => handleReject(selectedRes.id)} disabled={!!actionLoading} data-testid="reject-btn">
                  <XIcon size={13} /> Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const STYLES = `
.pg-page { padding:24px; font-family:'Inter',sans-serif; background:#F8FAFC; min-height:100vh; }
.pg-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
.pg-toolbar-left { display:flex; align-items:center; gap:16px; }
.pg-toolbar-right { display:flex; align-items:center; gap:10px; }
.pg-title { font-family:'Manrope',sans-serif; font-size:1.15rem; font-weight:800; color:#0F172A; display:flex; align-items:center; gap:8px; margin:0; }
.pg-search { display:flex; align-items:center; gap:6px; background:#FFF; border:1.5px solid #E2E8F0; border-radius:10px; padding:7px 12px; width:220px; }
.pg-search input { border:none; outline:none; font-family:'Inter',sans-serif; font-size:.78rem; flex:1; background:none; }
.pg-search svg { color:#94A3B8; flex-shrink:0; }
.pg-select { padding:7px 12px; border-radius:10px; border:1.5px solid #E2E8F0; font-family:'Inter',sans-serif; font-size:.75rem; background:#FFF; cursor:pointer; color:#334155; }
.pg-zoom { display:flex; align-items:center; gap:4px; background:#FFF; border:1.5px solid #E2E8F0; border-radius:10px; padding:3px 6px; }
.pg-zoom button { border:none; background:none; cursor:pointer; color:#64748B; padding:3px; border-radius:4px; display:flex; }
.pg-zoom button:hover { background:#F1F5F9; }
.pg-zoom-val { font-size:.62rem; color:#94A3B8; min-width:28px; text-align:center; }
.pg-loading { display:flex; align-items:center; justify-content:center; padding:80px; color:#94A3B8; }
.pg-spin { animation:pgSpin 1s linear infinite; }
@keyframes pgSpin { to{transform:rotate(360deg)} }
.pg-empty { padding:60px; text-align:center; color:#94A3B8; font-size:.85rem; }

/* Gantt Chart */
.pg-gantt-wrap { background:#FFF; border:1.5px solid #E2E8F0; border-radius:14px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.04); }
.pg-gantt { overflow-x:auto; overflow-y:auto; max-height:calc(100vh - 180px); }
.pg-header { display:flex; position:sticky; top:0; z-index:10; background:#FFF; border-bottom:2px solid #E2E8F0; }
.pg-header-label { width:200px; min-width:200px; padding:10px 16px; font-family:'Manrope',sans-serif; font-size:.72rem; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.5px; background:#FFF; position:sticky; left:0; z-index:11; border-right:1.5px solid #E2E8F0; }
.pg-header-dates { display:flex; }
.pg-header-day { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:6px 0; border-right:1px solid #F1F5F9; }
.pg-header-day--today { background:#EFF6FF; }
.pg-day-name { font-size:.55rem; font-weight:700; color:#94A3B8; text-transform:uppercase; }
.pg-day-num { font-size:.65rem; font-weight:700; color:#334155; }

/* Rows */
.pg-row { display:flex; border-bottom:1px solid #F8FAFC; min-height:44px; }
.pg-row:hover { background:#FAFBFC; }
.pg-row-label { width:200px; min-width:200px; padding:8px 12px; display:flex; align-items:center; gap:7px; font-size:.75rem; font-weight:600; color:#0F172A; position:sticky; left:0; z-index:5; background:inherit; border-right:1.5px solid #E2E8F0; }
.pg-asset-name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; }
.pg-res-count { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; border-radius:9px; background:#EFF6FF; color:#2563EB; font-size:.55rem; font-weight:700; padding:0 4px; }
.pg-row-timeline { position:relative; height:44px; }

/* Grid cells */
.pg-grid-cell { position:absolute; top:0; bottom:0; border-right:1px solid #F8FAFC; }
.pg-grid-cell--today { background:#EFF6FF08; }
.pg-grid-cell--weekend { background:#FFF7ED06; }

/* Today line */
.pg-today-line { position:absolute; top:0; bottom:0; width:2px; background:#DC2626; z-index:4; opacity:.6; }

/* Bars */
.pg-bar { position:absolute; top:8px; height:28px; border-radius:6px; border-left:3px solid; display:flex; align-items:center; padding:0 8px; cursor:pointer; transition:all .12s; z-index:3; overflow:hidden; }
.pg-bar:hover,.pg-bar--hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1); z-index:6; }
.pg-bar--pending { animation:pgPulse 2s ease infinite; }
@keyframes pgPulse { 0%,100%{opacity:1} 50%{opacity:.7} }
.pg-bar-text { font-size:.6rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pg-bar-pri { margin-left:3px; color:#DC2626; }

/* Detail Panel */
.pg-detail-overlay { position:fixed; inset:0; background:rgba(0,0,0,.3); backdrop-filter:blur(4px); z-index:1200; display:flex; align-items:center; justify-content:center; }
.pg-detail { background:#FFF; border-radius:16px; max-width:440px; width:92%; box-shadow:0 20px 48px rgba(0,0,0,.15); overflow:hidden; }
.pg-detail-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #F1F5F9; }
.pg-detail-head h3 { font-family:'Manrope',sans-serif; font-size:.95rem; font-weight:800; color:#0F172A; margin:0; }
.pg-detail-head button { border:none; background:none; color:#94A3B8; cursor:pointer; }
.pg-detail-body { padding:16px 20px; }
.pg-detail-row { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid #F8FAFC; font-size:.8rem; }
.pg-detail-row label { color:#94A3B8; font-weight:500; min-width:70px; }
.pg-detail-row span { color:#0F172A; font-weight:600; }
.pg-detail-row svg { color:#94A3B8; flex-shrink:0; }
.pg-detail-status { padding:3px 10px; border-radius:8px; font-size:.68rem; font-weight:700; }
.pg-detail-actions { display:flex; gap:10px; padding:16px 20px; border-top:1px solid #F1F5F9; }
.pg-approve-btn { flex:1; display:inline-flex; align-items:center; justify-content:center; gap:5px; padding:10px; border-radius:10px; border:none; background:#059669; color:#FFF; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; transition:background .12s; }
.pg-approve-btn:hover { background:#047857; }
.pg-approve-btn:disabled { opacity:.5; cursor:not-allowed; }
.pg-reject-btn { flex:1; display:inline-flex; align-items:center; justify-content:center; gap:5px; padding:10px; border-radius:10px; border:1.5px solid #FCA5A5; background:#FFF; color:#DC2626; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; transition:all .12s; }
.pg-reject-btn:hover { background:#FEF2F2; }
.pg-reject-btn:disabled { opacity:.5; cursor:not-allowed; }
`

export default PremiumGantt
