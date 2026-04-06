import {useState, useEffect, useCallback} from 'react'
import {
  BarChart3, CalendarDays, Truck, Clock, AlertTriangle, CheckCircle2, XCircle,
  ArrowUp, ArrowDown, TrendingUp, MapPin, Users, Bell, Eye, X, Loader2,
  LogIn, LogOut, FileText, Timer, RotateCcw
} from 'lucide-react'

const API = process.env.REACT_APP_BACKEND_URL

const PremiumReservationDashboard = () => {
  const [kpis, setKpis] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [recentRes, setRecentRes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [kpiRes, notifRes, resRes] = await Promise.all([
        fetch(`${API}/api/reservations/kpis`),
        fetch(`${API}/api/notifications`),
        fetch(`${API}/api/reservations`),
      ])
      const kpiData = await kpiRes.json()
      const notifData = await notifRes.json()
      const resData = await resRes.json()
      setKpis(kpiData)
      setNotifications(Array.isArray(notifData) ? notifData : [])
      setRecentRes(Array.isArray(resData) ? resData.slice(0, 10) : [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const markRead = async (id) => {
    await fetch(`${API}/api/notifications/${id}/read`, {method: 'PUT'})
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))
  }

  const markAllRead = async () => {
    await fetch(`${API}/api/notifications/read-all`, {method: 'PUT'})
    setNotifications(prev => prev.map(n => ({...n, read: true})))
  }

  const STATUS_MAP = {
    confirmed: {label: 'Confirmé', bg: '#DBEAFE', color: '#2563EB'},
    in_progress: {label: 'En cours', bg: '#FEF3C7', color: '#D97706'},
    completed: {label: 'Terminé', bg: '#D1FAE5', color: '#059669'},
    cancelled: {label: 'Annulé', bg: '#FEE2E2', color: '#DC2626'},
    requested: {label: 'Demandé', bg: '#E0E7FF', color: '#4F46E5'},
    rejected: {label: 'Rejeté', bg: '#FCE7F3', color: '#BE185D'},
  }

  const SEVERITY_MAP = {
    info: {icon: Bell, bg: '#EFF6FF', color: '#2563EB'},
    warning: {icon: AlertTriangle, bg: '#FFFBEB', color: '#D97706'},
    error: {icon: XCircle, bg: '#FEF2F2', color: '#DC2626'},
    success: {icon: CheckCircle2, bg: '#ECFDF5', color: '#059669'},
  }

  const timeAgo = (d) => {
    const diff = (new Date() - new Date(d)) / 1000
    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `${Math.floor(diff / 60)}min`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}j`
  }

  if (loading) return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: '#64748B'}}>
      <Loader2 size={28} className="rdb-spin" style={{animation: 'rdbSpin 1s linear infinite'}} /> Chargement...
      <style>{`@keyframes rdbSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )

  const kpiCards = [
    {label: 'Réservations totales', value: kpis?.total || 0, icon: CalendarDays, color: '#2563EB', bg: '#EFF6FF'},
    {label: 'En cours', value: kpis?.active || 0, icon: Timer, color: '#D97706', bg: '#FFFBEB'},
    {label: 'Confirmées', value: kpis?.confirmed || 0, icon: CheckCircle2, color: '#059669', bg: '#ECFDF5'},
    {label: "Aujourd'hui", value: kpis?.today || 0, icon: CalendarDays, color: '#6366F1', bg: '#EEF2FF'},
    {label: 'En retard', value: kpis?.overdue || 0, icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2'},
    {label: 'Terminées', value: kpis?.completed || 0, icon: RotateCcw, color: '#475569', bg: '#F1F5F9'},
  ]

  const unreadNotifs = notifications.filter(n => !n.read)

  return (
    <>
      <style>{STYLES}</style>
      <div className="rdb" data-testid="reservation-dashboard">
        <div className="rdb-header">
          <div>
            <h1 className="rdb-title" data-testid="rdb-title">Dashboard Réservations</h1>
            <p className="rdb-sub">Vue d'ensemble des réservations et alertes</p>
          </div>
          <button className="rdb-refresh" onClick={fetchAll}><RotateCcw size={14} /> Actualiser</button>
        </div>

        {/* KPI Cards */}
        <div className="rdb-kpi-grid" data-testid="kpi-grid">
          {kpiCards.map((k, i) => {
            const Icon = k.icon
            return (
              <div key={i} className="rdb-kpi" data-testid={`kpi-${i}`}>
                <div className="rdb-kpi-icon" style={{background: k.bg}}>
                  <Icon size={20} style={{color: k.color}} />
                </div>
                <div className="rdb-kpi-info">
                  <span className="rdb-kpi-val" style={{color: k.color}}>{k.value}</span>
                  <span className="rdb-kpi-label">{k.label}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="rdb-two-cols">
          {/* Notifications */}
          <div className="rdb-panel" data-testid="notifications-panel">
            <div className="rdb-panel-head">
              <h2><Bell size={16} /> Centre d'alertes <span className="rdb-notif-badge">{unreadNotifs.length}</span></h2>
              {unreadNotifs.length > 0 && <button className="rdb-mark-all" onClick={markAllRead} data-testid="mark-all-read">Tout marquer lu</button>}
            </div>
            <div className="rdb-notif-list">
              {notifications.length === 0 ? (
                <div className="rdb-notif-empty">Aucune notification</div>
              ) : notifications.slice(0, 15).map((n, i) => {
                const sev = SEVERITY_MAP[n.severity] || SEVERITY_MAP.info
                const Icon = sev.icon
                return (
                  <div key={n.id} className={`rdb-notif ${n.read ? 'rdb-notif--read' : ''}`} data-testid={`notif-${i}`}>
                    <div className="rdb-notif-icon" style={{background: sev.bg}}>
                      <Icon size={14} style={{color: sev.color}} />
                    </div>
                    <div className="rdb-notif-body">
                      <span className="rdb-notif-title">{n.title}</span>
                      <span className="rdb-notif-msg">{n.message}</span>
                    </div>
                    <div className="rdb-notif-right">
                      <span className="rdb-notif-time">{timeAgo(n.created_at)}</span>
                      {!n.read && <button className="rdb-notif-mark" onClick={() => markRead(n.id)} title="Marquer comme lu"><Eye size={12} /></button>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent reservations + Top Assets */}
          <div className="rdb-right-col">
            {/* Top Assets */}
            {kpis?.top_assets?.length > 0 && (
              <div className="rdb-panel rdb-panel--compact" data-testid="top-assets-panel">
                <div className="rdb-panel-head"><h2><TrendingUp size={16} /> Top assets réservés</h2></div>
                <div className="rdb-top-list">
                  {kpis.top_assets.map((a, i) => (
                    <div key={i} className="rdb-top-item" data-testid={`top-asset-${i}`}>
                      <span className="rdb-top-rank">#{i + 1}</span>
                      <Truck size={14} />
                      <span className="rdb-top-name">{a.name}</span>
                      <span className="rdb-top-count">{a.count} rés.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent */}
            <div className="rdb-panel rdb-panel--compact" data-testid="recent-panel">
              <div className="rdb-panel-head"><h2><FileText size={16} /> Réservations récentes</h2></div>
              <div className="rdb-recent-list">
                {recentRes.slice(0, 8).map((r, i) => {
                  const st = STATUS_MAP[r.status] || STATUS_MAP.confirmed
                  return (
                    <div key={r.id} className="rdb-recent-item" data-testid={`recent-${i}`}>
                      <div className="rdb-recent-left">
                        <span className="rdb-recent-asset">{r.asset_name}</span>
                        <span className="rdb-recent-user">{r.user_name} — {r.site || 'N/A'}</span>
                      </div>
                      <span className="rdb-recent-badge" style={{background: st.bg, color: st.color}}>{st.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const STYLES = `
.rdb { max-width:100%; }
.rdb-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; }
.rdb-title { font-family:'Manrope',sans-serif; font-size:1.5rem; font-weight:800; color:#0F172A; margin:0; }
.rdb-sub { font-family:'Inter',sans-serif; font-size:.82rem; color:#64748B; margin:4px 0 0; }
.rdb-refresh { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.78rem; font-weight:600; color:#475569; cursor:pointer; transition:all .15s; }
.rdb-refresh:hover { border-color:#2563EB; color:#2563EB; }

/* KPI Grid */
.rdb-kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:24px; }
.rdb-kpi { display:flex; align-items:center; gap:14px; padding:20px; background:#FFF; border-radius:14px; border:1px solid #E2E8F0; transition:all .15s; }
.rdb-kpi:hover { border-color:#CBD5E1; box-shadow:0 4px 12px rgba(0,0,0,.04); }
.rdb-kpi-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.rdb-kpi-val { font-family:'Manrope',sans-serif; font-size:1.4rem; font-weight:800; display:block; }
.rdb-kpi-label { font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; }

/* Two columns */
.rdb-two-cols { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
@media(max-width:1024px) { .rdb-two-cols { grid-template-columns:1fr; } }
.rdb-right-col { display:flex; flex-direction:column; gap:20px; }

/* Panel */
.rdb-panel { background:#FFF; border-radius:14px; border:1px solid #E2E8F0; overflow:hidden; }
.rdb-panel--compact { }
.rdb-panel-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #F1F5F9; }
.rdb-panel-head h2 { font-family:'Manrope',sans-serif; font-size:.88rem; font-weight:800; color:#0F172A; margin:0; display:flex; align-items:center; gap:8px; }
.rdb-notif-badge { display:inline-flex; align-items:center; justify-content:center; min-width:22px; height:22px; border-radius:11px; background:#EF4444; color:#FFF; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:700; padding:0 6px; }
.rdb-mark-all { border:none; background:none; color:#2563EB; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; cursor:pointer; }

/* Notifications */
.rdb-notif-list { max-height:500px; overflow-y:auto; }
.rdb-notif { display:flex; align-items:flex-start; gap:12px; padding:14px 20px; border-bottom:1px solid #F8FAFC; cursor:pointer; transition:background .1s; }
.rdb-notif:hover { background:#FAFBFC; }
.rdb-notif--read { opacity:.6; }
.rdb-notif-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.rdb-notif-body { flex:1; min-width:0; }
.rdb-notif-title { display:block; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; }
.rdb-notif-msg { display:block; font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; margin-top:2px; }
.rdb-notif-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
.rdb-notif-time { font-family:'Inter',sans-serif; font-size:.65rem; color:#94A3B8; }
.rdb-notif-mark { border:none; background:none; color:#94A3B8; cursor:pointer; padding:2px; }
.rdb-notif-mark:hover { color:#2563EB; }
.rdb-notif-empty { padding:40px; text-align:center; font-family:'Inter',sans-serif; color:#94A3B8; font-size:.82rem; }

/* Top Assets */
.rdb-top-list { padding:8px 12px; }
.rdb-top-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; transition:background .1s; }
.rdb-top-item:hover { background:#F8FAFC; }
.rdb-top-rank { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:800; color:#2563EB; width:28px; }
.rdb-top-item svg { color:#94A3B8; }
.rdb-top-name { flex:1; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600; color:#0F172A; }
.rdb-top-count { font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; font-weight:600; }

/* Recent */
.rdb-recent-list { padding:8px 12px; }
.rdb-recent-item { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 12px; border-radius:8px; border-bottom:1px solid #FAFBFC; }
.rdb-recent-item:hover { background:#F8FAFC; }
.rdb-recent-asset { display:block; font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:700; color:#0F172A; }
.rdb-recent-user { display:block; font-family:'Inter',sans-serif; font-size:.68rem; color:#64748B; }
.rdb-recent-badge { display:inline-flex; padding:3px 10px; border-radius:16px; font-family:'Inter',sans-serif; font-size:.65rem; font-weight:700; flex-shrink:0; }
`

export default PremiumReservationDashboard
