import {useState, useEffect, useCallback} from 'react'
import {useWebSocket} from '../../hooks/useWebSocket'
import {
  BarChart3, CalendarDays, Truck, Clock, AlertTriangle, CheckCircle2, XCircle,
  ArrowUp, ArrowDown, TrendingUp, MapPin, Users, Bell, Eye, X, Loader2,
  LogIn, LogOut, FileText, Timer, RotateCcw, Wifi, Shield, ShieldAlert, Scan,
  CheckCircle, BellRing, Settings2, ChevronDown, ChevronUp
} from 'lucide-react'

const API = process.env.REACT_APP_BACKEND_URL

const PremiumReservationDashboard = () => {
  const [kpis, setKpis] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [recentRes, setRecentRes] = useState([])
  const [loading, setLoading] = useState(true)
  const [smartAlerts, setSmartAlerts] = useState([])
  const [alertStats, setAlertStats] = useState(null)
  const [alertRules, setAlertRules] = useState([])
  const [scanning, setScanning] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [tab, setTab] = useState('alerts')
  const [selectedKpi, setSelectedKpi] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [kpiRes, notifRes, resRes, alertRes, statsRes, rulesRes] = await Promise.all([
        fetch(`${API}/api/reservations/kpis`),
        fetch(`${API}/api/notifications`),
        fetch(`${API}/api/reservations`),
        fetch(`${API}/api/reservations/alerts?status=active`),
        fetch(`${API}/api/reservations/alerts/stats`),
        fetch(`${API}/api/reservations/alerts/rules`),
      ])
      setKpis(await kpiRes.json())
      const notifData = await notifRes.json()
      setNotifications(Array.isArray(notifData) ? notifData : [])
      const resData = await resRes.json()
      setRecentRes(Array.isArray(resData) ? resData : [])
      const aData = await alertRes.json()
      setSmartAlerts(Array.isArray(aData) ? aData : [])
      setAlertStats(await statsRes.json())
      const rData = await rulesRes.json()
      setAlertRules(Array.isArray(rData) ? rData : [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // WebSocket real-time
  const {connected} = useWebSocket(useCallback((msg) => {
    if (msg.type === 'notification' || msg.type?.startsWith('reservation_')) {
      fetchAll()
    }
  }, [fetchAll]))

  const markRead = async (id) => {
    await fetch(`${API}/api/notifications/${id}/read`, {method: 'PUT'})
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))
  }

  const markAllRead = async () => {
    await fetch(`${API}/api/notifications/read-all`, {method: 'PUT'})
    setNotifications(prev => prev.map(n => ({...n, read: true})))
  }

  const runScan = async () => {
    setScanning(true)
    try {
      await fetch(`${API}/api/reservations/alerts/scan`, {method: 'POST'})
      const [alertRes, statsRes] = await Promise.all([
        fetch(`${API}/api/reservations/alerts?status=active`),
        fetch(`${API}/api/reservations/alerts/stats`),
      ])
      setSmartAlerts(await alertRes.json())
      setAlertStats(await statsRes.json())
    } catch {}
    setScanning(false)
  }

  const resolveAlert = async (id) => {
    await fetch(`${API}/api/reservations/alerts/${id}/resolve`, {method: 'PUT'})
    setSmartAlerts(prev => prev.filter(a => a.id !== id))
  }

  const toggleRule = async (rule) => {
    const newEnabled = !rule.enabled
    await fetch(`${API}/api/reservations/alerts/rules/${rule.id}`, {
      method: 'PUT', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({enabled: newEnabled})
    })
    setAlertRules(prev => prev.map(r => r.id === rule.id ? {...r, enabled: newEnabled} : r))
  }

  const ALERT_TYPE_META = {
    overdue: {icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2', label: 'En retard'},
    upcoming: {icon: BellRing, color: '#D97706', bg: '#FFFBEB', label: 'Imminente'},
    no_checkout: {icon: LogOut, color: '#7C3AED', bg: '#F5F3FF', label: 'Pas de check-out'},
    long_usage: {icon: Timer, color: '#0EA5E9', bg: '#F0F9FF', label: 'Usage prolongé'},
    low_battery_reserved: {icon: AlertTriangle, color: '#EA580C', bg: '#FFF7ED', label: 'Batterie faible'},
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
    {label: 'Réservations totales', value: kpis?.total || 0, icon: CalendarDays, color: '#2563EB', bg: '#EFF6FF', filter: 'all'},
    {label: 'En cours', value: kpis?.active || 0, icon: Timer, color: '#D97706', bg: '#FFFBEB', filter: 'in_progress'},
    {label: 'Confirmées', value: kpis?.confirmed || 0, icon: CheckCircle2, color: '#059669', bg: '#ECFDF5', filter: 'confirmed'},
    {label: "Aujourd'hui", value: kpis?.today || 0, icon: CalendarDays, color: '#6366F1', bg: '#EEF2FF', filter: 'today'},
    {label: 'En retard', value: kpis?.overdue || 0, icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2', filter: 'overdue'},
    {label: 'Terminées', value: kpis?.completed || 0, icon: RotateCcw, color: '#475569', bg: '#F1F5F9', filter: 'completed'},
  ]

  // Filter reservations based on selected KPI
  const getFilteredReservations = () => {
    if (!selectedKpi) return []
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    switch (selectedKpi) {
      case 'all': return recentRes
      case 'in_progress': return recentRes.filter(r => r.status === 'in_progress')
      case 'confirmed': return recentRes.filter(r => r.status === 'confirmed')
      case 'today': return recentRes.filter(r => r.start_date?.slice(0, 10) === todayStr || r.end_date?.slice(0, 10) === todayStr)
      case 'overdue': return recentRes.filter(r => r.status === 'in_progress' && new Date(r.end_date) < now)
      case 'completed': return recentRes.filter(r => r.status === 'completed')
      default: return []
    }
  }
  const filteredKpiRes = getFilteredReservations()
  const selectedKpiCard = kpiCards.find(k => k.filter === selectedKpi)

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
          {connected && <span className="rdb-ws-live" data-testid="ws-indicator"><Wifi size={10} /> Live</span>}
        </div>

        {/* KPI Cards */}
        <div className="rdb-kpi-grid" data-testid="kpi-grid">
          {kpiCards.map((k, i) => {
            const Icon = k.icon
            const isSelected = selectedKpi === k.filter
            return (
              <div
                key={i}
                className={`rdb-kpi rdb-kpi--clickable ${isSelected ? 'rdb-kpi--selected' : ''}`}
                style={isSelected ? {borderColor: k.color, boxShadow: `0 4px 16px ${k.color}20`} : {}}
                onClick={() => setSelectedKpi(isSelected ? null : k.filter)}
                data-testid={`kpi-${i}`}
              >
                <div className="rdb-kpi-icon" style={{background: k.bg}}>
                  <Icon size={20} style={{color: k.color}} />
                </div>
                <div className="rdb-kpi-info">
                  <span className="rdb-kpi-val" style={{color: k.color}}>{k.value}</span>
                  <span className="rdb-kpi-label">{k.label}</span>
                </div>
                {isSelected && <ChevronUp size={14} style={{color: k.color, marginLeft: 'auto'}} />}
              </div>
            )
          })}
        </div>

        {/* KPI Detail Panel */}
        {selectedKpi && (
          <div className="rdb-kpi-detail" data-testid="kpi-detail-panel">
            <div className="rdb-kpi-detail-head">
              <h2 style={{color: selectedKpiCard?.color}}>
                {selectedKpiCard && <selectedKpiCard.icon size={16} />}
                {selectedKpiCard?.label} ({filteredKpiRes.length})
              </h2>
              <button className="rdb-kpi-detail-close" onClick={() => setSelectedKpi(null)} data-testid="kpi-detail-close">
                <X size={16} />
              </button>
            </div>
            {filteredKpiRes.length === 0 ? (
              <div className="rdb-kpi-detail-empty">Aucune réservation dans cette catégorie</div>
            ) : (
              <div className="rdb-kpi-detail-grid">
                {filteredKpiRes.map((r, i) => {
                  const st = STATUS_MAP[r.status] || STATUS_MAP.confirmed
                  const isOverdue = r.status === 'in_progress' && new Date(r.end_date) < new Date()
                  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'}) : '—'
                  return (
                    <div key={r.id || i} className={`rdb-kpi-card ${isOverdue ? 'rdb-kpi-card--overdue' : ''}`} data-testid={`kpi-res-${i}`}>
                      <div className="rdb-kpi-card-top">
                        <span className="rdb-kpi-card-asset">{r.asset_name}</span>
                        <span className="rdb-kpi-card-badge" style={{background: st.bg, color: st.color}}>{st.label}</span>
                      </div>
                      {(r.site || r.address) && (
                        <div className="rdb-kpi-card-row"><MapPin size={11} /> {r.site || r.address}</div>
                      )}
                      <div className="rdb-kpi-card-row"><CalendarDays size={11} /> {fmtDate(r.start_date)} → {fmtDate(r.end_date)}</div>
                      {r.note && <div className="rdb-kpi-card-row rdb-kpi-card-note">{r.note}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="rdb-two-cols">
          {/* SMART ALERTS + NOTIFICATIONS PANEL */}
          <div className="rdb-panel" data-testid="alerts-panel">
            <div className="rdb-panel-head">
              <div className="rdb-tabs">
                <button className={`rdb-tab ${tab === 'alerts' ? 'rdb-tab--active' : ''}`} onClick={() => setTab('alerts')} data-testid="tab-alerts">
                  <ShieldAlert size={14} /> Alertes Smart
                  {smartAlerts.length > 0 && <span className="rdb-notif-badge">{smartAlerts.length}</span>}
                </button>
                <button className={`rdb-tab ${tab === 'notifications' ? 'rdb-tab--active' : ''}`} onClick={() => setTab('notifications')} data-testid="tab-notifications">
                  <Bell size={14} /> Notifications
                  {unreadNotifs.length > 0 && <span className="rdb-notif-badge">{unreadNotifs.length}</span>}
                </button>
              </div>
              <div className="rdb-head-actions">
                {tab === 'alerts' && (
                  <>
                    <button className="rdb-scan-btn" onClick={runScan} disabled={scanning} data-testid="scan-alerts-btn">
                      {scanning ? <Loader2 size={13} className="rdb-spin-icon" /> : <Scan size={13} />}
                      {scanning ? 'Scan...' : 'Scanner'}
                    </button>
                    <button className="rdb-rules-btn" onClick={() => setRulesOpen(!rulesOpen)} data-testid="rules-toggle-btn">
                      <Settings2 size={13} /> Règles
                    </button>
                  </>
                )}
                {tab === 'notifications' && unreadNotifs.length > 0 && (
                  <button className="rdb-mark-all" onClick={markAllRead} data-testid="mark-all-read">Tout marquer lu</button>
                )}
              </div>
            </div>

            {/* Alert Rules */}
            {rulesOpen && tab === 'alerts' && (
              <div className="rdb-rules-panel" data-testid="alert-rules-panel">
                <h3 className="rdb-rules-title"><Shield size={14} /> Règles d'alertes</h3>
                {alertRules.map((rule, i) => {
                  const meta = ALERT_TYPE_META[rule.type] || {icon: Bell, color: '#64748B', bg: '#F8FAFC'}
                  const Icon = meta.icon
                  return (
                    <div key={rule.id} className="rdb-rule-item" data-testid={`rule-${i}`}>
                      <div className="rdb-rule-icon" style={{background: meta.bg}}>
                        <Icon size={14} style={{color: meta.color}} />
                      </div>
                      <div className="rdb-rule-info">
                        <span className="rdb-rule-label">{rule.label}</span>
                        <span className="rdb-rule-desc">{rule.description}</span>
                      </div>
                      <label className="rdb-rule-toggle" data-testid={`rule-toggle-${i}`}>
                        <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule)} />
                        <span className="rdb-toggle-switch" />
                      </label>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Alert Stats Bar */}
            {tab === 'alerts' && alertStats && alertStats.total_active > 0 && (
              <div className="rdb-alert-stats" data-testid="alert-stats">
                {Object.entries(alertStats.by_type || {}).map(([type, count]) => {
                  const meta = ALERT_TYPE_META[type] || {label: type, color: '#64748B', bg: '#F8FAFC'}
                  return (
                    <span key={type} className="rdb-stat-chip" style={{background: meta.bg, color: meta.color}}>
                      {meta.label}: {count}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Tab Content */}
            <div className="rdb-notif-list">
              {tab === 'alerts' ? (
                smartAlerts.length === 0 ? (
                  <div className="rdb-notif-empty"><CheckCircle size={24} style={{color: '#059669', marginBottom: 8}} /><br/>Aucune alerte active. Cliquez "Scanner" pour vérifier.</div>
                ) : smartAlerts.map((a, i) => {
                  const meta = ALERT_TYPE_META[a.type] || {icon: AlertTriangle, color: '#64748B', bg: '#F8FAFC', label: a.type}
                  const Icon = meta.icon
                  return (
                    <div key={a.id} className="rdb-notif rdb-notif--alert" data-testid={`smart-alert-${i}`}>
                      <div className="rdb-notif-icon" style={{background: meta.bg}}>
                        <Icon size={14} style={{color: meta.color}} />
                      </div>
                      <div className="rdb-notif-body">
                        <span className="rdb-notif-title">{a.title}</span>
                        <span className="rdb-notif-msg">{a.message}</span>
                        <div className="rdb-alert-meta">
                          <span className="rdb-alert-type" style={{background: meta.bg, color: meta.color}}>{meta.label}</span>
                          <span className={`rdb-alert-sev rdb-alert-sev--${a.severity}`}>{a.severity}</span>
                        </div>
                      </div>
                      <div className="rdb-notif-right">
                        <span className="rdb-notif-time">{timeAgo(a.created_at)}</span>
                        <button className="rdb-resolve-btn" onClick={() => resolveAlert(a.id)} title="Résoudre" data-testid={`resolve-alert-${i}`}><CheckCircle2 size={13} /></button>
                      </div>
                    </div>
                  )
                })
              ) : (
                notifications.length === 0 ? (
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
                })
              )}
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
                        <span className="rdb-recent-user">{r.site || r.address || '—'}</span>
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
.rdb-ws-live { display:inline-flex; align-items:center; gap:3px; padding:4px 10px; border-radius:10px; background:#ECFDF5; color:#059669; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:700; animation:rdbLivePulse 2s ease infinite; }
@keyframes rdbLivePulse { 0%,100%{opacity:1;} 50%{opacity:.6;} }

/* KPI Grid */
.rdb-kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:24px; }
.rdb-kpi { display:flex; align-items:center; gap:14px; padding:20px; background:#FFF; border-radius:14px; border:1.5px solid #E2E8F0; transition:all .2s; }
.rdb-kpi--clickable { cursor:pointer; }
.rdb-kpi--clickable:hover { border-color:#CBD5E1; box-shadow:0 6px 20px rgba(0,0,0,.06); transform:translateY(-2px); }
.rdb-kpi--selected { transform:translateY(-2px); }
.rdb-kpi-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.rdb-kpi-val { font-family:'Manrope',sans-serif; font-size:1.4rem; font-weight:800; display:block; }
.rdb-kpi-label { font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; }

/* KPI Detail Panel */
.rdb-kpi-detail {
  background:#FFF; border-radius:14px; border:1.5px solid #E2E8F0;
  margin-bottom:24px; animation:rdbSlideDown .25s ease;
  overflow:hidden;
}
@keyframes rdbSlideDown { from{opacity:0;max-height:0;margin-bottom:0} to{opacity:1;max-height:2000px;margin-bottom:24px} }
.rdb-kpi-detail-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 20px; border-bottom:1px solid #F1F5F9;
}
.rdb-kpi-detail-head h2 {
  font-family:'Manrope',sans-serif; font-size:.92rem; font-weight:800;
  margin:0; display:flex; align-items:center; gap:8px;
}
.rdb-kpi-detail-close {
  border:none; background:#F1F5F9; color:#64748B; border-radius:8px;
  width:30px; height:30px; display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .12s;
}
.rdb-kpi-detail-close:hover { background:#E2E8F0; color:#0F172A; }
.rdb-kpi-detail-empty {
  padding:40px; text-align:center; font-family:'Inter',sans-serif;
  color:#94A3B8; font-size:.82rem;
}
.rdb-kpi-detail-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:10px; padding:16px; max-height:400px; overflow-y:auto;
}
.rdb-kpi-card {
  padding:14px 16px; background:#FAFBFC; border-radius:10px;
  border:1px solid #F1F5F9; transition:all .12s;
}
.rdb-kpi-card:hover { border-color:#E2E8F0; background:#FFF; }
.rdb-kpi-card--overdue { border-left:3px solid #EF4444; }
.rdb-kpi-card-top {
  display:flex; align-items:center; justify-content:space-between;
  gap:8px; margin-bottom:6px;
}
.rdb-kpi-card-asset {
  font-family:'Manrope',sans-serif; font-size:.82rem; font-weight:800;
  color:#0F172A; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.rdb-kpi-card-badge {
  display:inline-flex; padding:2px 8px; border-radius:12px;
  font-family:'Inter',sans-serif; font-size:.58rem; font-weight:700; flex-shrink:0;
}
.rdb-kpi-card-row {
  display:flex; align-items:center; gap:5px;
  font-family:'Inter',sans-serif; font-size:.68rem; color:#64748B;
}
.rdb-kpi-card-row svg { color:#94A3B8; flex-shrink:0; }
.rdb-kpi-card-note {
  font-style:italic; color:#94A3B8; margin-top:2px;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}

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
.rdb-notif--alert:hover { background:#FFFBEB; }
.rdb-notif-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.rdb-notif-body { flex:1; min-width:0; }
.rdb-notif-title { display:block; font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:700; color:#0F172A; }
.rdb-notif-msg { display:block; font-family:'Inter',sans-serif; font-size:.72rem; color:#64748B; margin-top:2px; }
.rdb-notif-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
.rdb-notif-time { font-family:'Inter',sans-serif; font-size:.65rem; color:#94A3B8; }
.rdb-notif-mark { border:none; background:none; color:#94A3B8; cursor:pointer; padding:2px; }
.rdb-notif-mark:hover { color:#2563EB; }
.rdb-notif-empty { padding:40px; text-align:center; font-family:'Inter',sans-serif; color:#94A3B8; font-size:.82rem; }

/* Tabs */
.rdb-tabs { display:flex; gap:4px; }
.rdb-tab { display:inline-flex; align-items:center; gap:5px; padding:7px 14px; border-radius:8px; border:1.5px solid transparent; background:none; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:600; color:#64748B; cursor:pointer; transition:all .12s; }
.rdb-tab:hover { background:#F8FAFC; }
.rdb-tab--active { background:#EFF6FF; color:#2563EB; border-color:#BFDBFE; }
.rdb-head-actions { display:flex; gap:6px; align-items:center; }
.rdb-scan-btn { display:inline-flex; align-items:center; gap:4px; padding:6px 12px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600; color:#475569; cursor:pointer; transition:all .12s; }
.rdb-scan-btn:hover { border-color:#2563EB; color:#2563EB; }
.rdb-scan-btn:disabled { opacity:.5; cursor:not-allowed; }
.rdb-rules-btn { display:inline-flex; align-items:center; gap:4px; padding:6px 12px; border-radius:8px; border:1.5px solid #E2E8F0; background:#FFF; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600; color:#475569; cursor:pointer; transition:all .12s; }
.rdb-rules-btn:hover { border-color:#7C3AED; color:#7C3AED; }
.rdb-spin-icon { animation:rdbSpin 1s linear infinite; }
@keyframes rdbSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

/* Alert meta */
.rdb-alert-meta { display:flex; gap:6px; margin-top:4px; }
.rdb-alert-type { display:inline-flex; padding:2px 8px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.58rem; font-weight:700; }
.rdb-alert-sev { display:inline-flex; padding:2px 8px; border-radius:6px; font-family:'Inter',sans-serif; font-size:.58rem; font-weight:700; text-transform:uppercase; }
.rdb-alert-sev--critical { background:#FEE2E2; color:#DC2626; }
.rdb-alert-sev--warning { background:#FEF3C7; color:#D97706; }
.rdb-alert-sev--info { background:#DBEAFE; color:#2563EB; }
.rdb-resolve-btn { border:none; background:none; color:#059669; cursor:pointer; padding:4px; border-radius:6px; transition:background .1s; }
.rdb-resolve-btn:hover { background:#ECFDF5; }

/* Alert Stats */
.rdb-alert-stats { display:flex; gap:8px; padding:8px 16px; border-bottom:1px solid #F1F5F9; flex-wrap:wrap; }
.rdb-stat-chip { display:inline-flex; padding:4px 10px; border-radius:8px; font-family:'Inter',sans-serif; font-size:.62rem; font-weight:700; }

/* Rules Panel */
.rdb-rules-panel { padding:12px 16px; border-bottom:1px solid #F1F5F9; background:#FAFBFC; }
.rdb-rules-title { font-family:'Manrope',sans-serif; font-size:.78rem; font-weight:800; color:#0F172A; margin:0 0 10px; display:flex; align-items:center; gap:6px; }
.rdb-rule-item { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #F1F5F9; }
.rdb-rule-item:last-child { border-bottom:none; }
.rdb-rule-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.rdb-rule-info { flex:1; min-width:0; }
.rdb-rule-label { display:block; font-family:'Inter',sans-serif; font-size:.75rem; font-weight:700; color:#0F172A; }
.rdb-rule-desc { display:block; font-family:'Inter',sans-serif; font-size:.62rem; color:#94A3B8; }
.rdb-rule-toggle { position:relative; display:inline-flex; align-items:center; cursor:pointer; }
.rdb-rule-toggle input { display:none; }
.rdb-toggle-switch { width:36px; height:20px; border-radius:10px; background:#CBD5E1; position:relative; transition:background .2s; }
.rdb-toggle-switch::after { content:''; position:absolute; left:2px; top:2px; width:16px; height:16px; border-radius:8px; background:#FFF; transition:transform .2s; }
.rdb-rule-toggle input:checked + .rdb-toggle-switch { background:#2563EB; }
.rdb-rule-toggle input:checked + .rdb-toggle-switch::after { transform:translateX(16px); }

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
