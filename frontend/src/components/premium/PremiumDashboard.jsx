import {useEffect, useState, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {
  fetchDashboard,
  getDashboard,
  setCardSelected,
  getCardSelected,
  getDashboardDetail,
  fetchDashboardDetail,
} from '../Dashboard/slice/dashboard.slice'
import {
  TrendingUp, TrendingDown, Box, Zap, MapPin,
  AlertTriangle, BatteryLow, ArrowRight, Clock,
  LogIn, LogOut as LogOutIcon, Wifi, WifiOff, Filter
} from 'lucide-react'
import DashboardTable from '../Dashboard/user-interface/DashboardTable/DashboardTable'

/* ── KPI Icon mapping ── */
const KPI_CONFIG = [
  {key: 0, icon: Box, gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', lightBg: '#EFF6FF', color: '#2563EB'},
  {key: 1, icon: Zap, gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', lightBg: '#ECFDF5', color: '#059669'},
  {key: 2, icon: MapPin, gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)', lightBg: '#FFFBEB', color: '#D97706'},
  {key: 3, icon: BatteryLow, gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)', lightBg: '#FEF2F2', color: '#DC2626'},
]

const ACTIVITY_ICONS = {
  entry: {icon: LogIn, color: '#059669', bg: '#ECFDF5'},
  exit: {icon: LogOutIcon, color: '#DC2626', bg: '#FEF2F2'},
  online: {icon: Wifi, color: '#2563EB', bg: '#EFF6FF'},
  offline: {icon: WifiOff, color: '#94A3B8', bg: '#F1F5F9'},
  alert: {icon: AlertTriangle, color: '#D97706', bg: '#FFFBEB'},
}

const PremiumDashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const dashboardList = useAppSelector(getDashboard)
  const selectedCard = useAppSelector(getCardSelected)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDashboard()).finally(() => setLoading(false))
  }, [dispatch])

  const handleCardClick = useCallback((card, index) => {
    const obj = {
      src: card.src,
      title: card.title,
      code: card.code,
      titledetail: card.titledetail,
    }
    dispatch(setCardSelected(obj))
    dispatch(fetchDashboardDetail(card.code))
  }, [dispatch])

  /* ── LOADING SKELETON ── */
  if (loading && (!dashboardList || dashboardList.length === 0)) {
    return (
      <div className="lt-dash" data-testid="premium-dashboard">
        <div className="lt-dash-header">
          <div className="lt-dash-skeleton" style={{width: 200, height: 32, borderRadius: 8}} />
          <div className="lt-dash-skeleton" style={{width: 120, height: 20, borderRadius: 6}} />
        </div>
        <div className="lt-dash-kpis">
          {[0,1,2,3].map(i => (
            <div key={i} className="lt-dash-skeleton lt-dash-kpi-skeleton" />
          ))}
        </div>
        <style>{DASHBOARD_STYLES}</style>
      </div>
    )
  }

  return (
    <div className="lt-dash" data-testid="premium-dashboard">
      <style>{DASHBOARD_STYLES}</style>

      {/* ── HEADER ── */}
      <div className="lt-dash-header">
        <div>
          <h1 className="lt-dash-title" data-testid="dashboard-title">Dashboard</h1>
          <p className="lt-dash-subtitle">Vue d'ensemble de vos assets en temps réel</p>
        </div>
        <div className="lt-dash-header-actions">
          <button className="lt-dash-filter-btn" data-testid="dashboard-filter-btn">
            <Filter size={16} /> Filtres
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="lt-dash-kpis" data-testid="kpi-cards-row">
        {dashboardList && dashboardList.map((card, index) => {
          const cfg = KPI_CONFIG[index] || KPI_CONFIG[0]
          const Icon = cfg.icon
          const isSelected = selectedCard?.code === card.code
          return (
            <div
              key={card.titledetail || index}
              className={`lt-kpi ${isSelected ? 'lt-kpi--selected' : ''}`}
              onClick={() => handleCardClick(card, index)}
              data-testid={`kpi-card-${index}`}
            >
              <div className="lt-kpi-top">
                <div className="lt-kpi-icon" style={{background: cfg.lightBg}}>
                  <Icon size={20} style={{color: cfg.color}} strokeWidth={2} />
                </div>
                <div className="lt-kpi-trend">
                  <TrendingUp size={14} />
                </div>
              </div>
              <div className="lt-kpi-value" style={{color: cfg.color}}>
                {card.quantity ?? '—'}
              </div>
              <div className="lt-kpi-label">{card.titledetail || card.title || 'N/A'}</div>
              <div className="lt-kpi-total">
                {card.quantityLabel || ''}
              </div>
              <div className="lt-kpi-bar-track">
                <div
                  className="lt-kpi-bar-fill"
                  style={{
                    width: `${Math.min(parseFloat(card.value) || 0, 100)}%`,
                    background: cfg.gradient
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── DETAIL VIEW (if KPI selected) ── */}
      {selectedCard && (
        <div className="lt-dash-detail-section" data-testid="dashboard-detail-section">
          <DashboardTable />
        </div>
      )}

      {/* ── BOTTOM GRID: Mini Map + Alerts + Activity ── */}
      {!selectedCard && (
        <div className="lt-dash-grid">
          {/* Mini Map */}
          <div className="lt-dash-map-widget" data-testid="mini-map-widget">
            <div className="lt-widget-header">
              <h3 className="lt-widget-title">
                <MapPin size={18} className="lt-widget-icon" /> Carte des assets
              </h3>
              <button className="lt-widget-action" onClick={() => navigate('/tour/index')}>
                Voir tout <ArrowRight size={14} />
              </button>
            </div>
            <div className="lt-map-placeholder">
              <MapPin size={48} strokeWidth={1} />
              <p>Carte interactive</p>
              <button
                className="lt-map-open-btn"
                onClick={() => navigate('/tour/index')}
                data-testid="open-map-btn"
              >
                Ouvrir la carte
              </button>
            </div>
          </div>

          {/* Alerts Feed */}
          <div className="lt-dash-alerts-widget" data-testid="alerts-feed-widget">
            <div className="lt-widget-header">
              <h3 className="lt-widget-title">
                <AlertTriangle size={18} className="lt-widget-icon lt-widget-icon--warning" />
                Alertes récentes
              </h3>
              <span className="lt-alert-badge">3</span>
            </div>
            <div className="lt-alerts-list">
              {[
                {type: 'alert', title: 'Asset hors zone', desc: 'CAT 320F - Chantier Nord', time: 'il y a 5 min'},
                {type: 'alert', title: 'Batterie faible', desc: 'BLE-0042 - 8%', time: 'il y a 12 min'},
                {type: 'exit', title: 'Sortie détectée', desc: 'Camion Benne - Dépôt Sud', time: 'il y a 28 min'},
              ].map((alert, i) => {
                const cfg = ACTIVITY_ICONS[alert.type] || ACTIVITY_ICONS.alert
                const AlertIcon = cfg.icon
                return (
                  <div key={i} className="lt-alert-item" data-testid={`alert-item-${i}`}>
                    <div className="lt-alert-icon" style={{background: cfg.bg}}>
                      <AlertIcon size={16} style={{color: cfg.color}} />
                    </div>
                    <div className="lt-alert-content">
                      <span className="lt-alert-title">{alert.title}</span>
                      <span className="lt-alert-desc">{alert.desc}</span>
                    </div>
                    <span className="lt-alert-time">{alert.time}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lt-dash-activity-widget" data-testid="activity-timeline-widget">
            <div className="lt-widget-header">
              <h3 className="lt-widget-title">
                <Clock size={18} className="lt-widget-icon" /> Activité récente
              </h3>
              <button className="lt-widget-action" onClick={() => navigate('/LOGS/index')}>
                Historique <ArrowRight size={14} />
              </button>
            </div>
            <div className="lt-timeline">
              {[
                {type: 'entry', title: 'Entrée zone', desc: 'Grue 45T → Chantier Est', time: '10:45'},
                {type: 'exit', title: 'Sortie zone', desc: 'Camion 12 → Dépôt Central', time: '10:32'},
                {type: 'online', title: 'Connexion tag', desc: 'BLE-0089 est en ligne', time: '10:15'},
                {type: 'offline', title: 'Tag hors ligne', desc: 'GPS-0034 - dernière position', time: '09:52'},
              ].map((event, i) => {
                const cfg = ACTIVITY_ICONS[event.type] || ACTIVITY_ICONS.online
                const EventIcon = cfg.icon
                return (
                  <div key={i} className="lt-timeline-item" data-testid={`timeline-item-${i}`}>
                    <div className="lt-timeline-line">
                      <div className="lt-timeline-dot" style={{background: cfg.bg, borderColor: cfg.color}}>
                        <EventIcon size={12} style={{color: cfg.color}} />
                      </div>
                    </div>
                    <div className="lt-timeline-content">
                      <span className="lt-timeline-title">{event.title}</span>
                      <span className="lt-timeline-desc">{event.desc}</span>
                    </div>
                    <span className="lt-timeline-time">{event.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   DASHBOARD STYLES
   ══════════════════════════════════════════ */
const DASHBOARD_STYLES = `
  .lt-dash { max-width: 1400px; }

  /* Skeleton */
  .lt-dash-skeleton {
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
    background-size: 200% 100%;
    animation: ltShimmer 1.5s infinite;
    border-radius: 12px;
  }
  .lt-dash-kpi-skeleton { height: 170px; }
  @keyframes ltShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Header */
  .lt-dash-header {
    display: flex; align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px; gap: 16px;
  }
  .lt-dash-title {
    font-family: 'Manrope', sans-serif;
    font-size: 1.75rem; font-weight: 800;
    color: #0F172A; letter-spacing: -0.04em;
    margin: 0; line-height: 1.2;
  }
  .lt-dash-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem; color: #64748B;
    margin: 4px 0 0; font-weight: 400;
  }
  .lt-dash-header-actions { display: flex; gap: 8px; align-items: center; }
  .lt-dash-filter-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px;
    border: 1.5px solid #E2E8F0; background: #FFF;
    color: #475569; font-family: 'Inter', sans-serif;
    font-size: 0.82rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s ease;
  }
  .lt-dash-filter-btn:hover { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }

  /* ── KPI Cards ── */
  .lt-dash-kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px; margin-bottom: 28px;
  }
  @media (max-width: 1100px) { .lt-dash-kpis { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .lt-dash-kpis { grid-template-columns: 1fr; } }

  .lt-kpi {
    background: #FFFFFF;
    border-radius: 14px;
    border: 1.5px solid #E2E8F0;
    padding: 22px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  .lt-kpi:hover {
    border-color: #CBD5E1;
    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }
  .lt-kpi--selected {
    border-color: #2563EB !important;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1), 0 8px 30px rgba(0,0,0,0.06) !important;
  }
  .lt-kpi-top {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .lt-kpi-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .lt-kpi-trend {
    color: #10B981; font-size: 0.75rem;
    display: flex; align-items: center; gap: 3px;
  }
  .lt-kpi-value {
    font-family: 'Manrope', sans-serif;
    font-size: 2rem; font-weight: 800;
    letter-spacing: -0.04em; line-height: 1;
    margin-bottom: 6px;
  }
  .lt-kpi-label {
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem; font-weight: 500;
    color: #475569; margin-bottom: 4px;
  }
  .lt-kpi-total {
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem; color: #94A3B8;
    margin-bottom: 14px;
  }
  .lt-kpi-bar-track {
    width: 100%; height: 4px;
    background: #F1F5F9; border-radius: 2px;
    overflow: hidden;
  }
  .lt-kpi-bar-fill {
    height: 100%; border-radius: 2px;
    transition: width 0.8s ease;
  }

  /* ── Detail Section ── */
  .lt-dash-detail-section {
    animation: ltFadeUp 0.3s ease-out;
  }
  @keyframes ltFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Bottom Grid ── */
  .lt-dash-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
  }
  @media (max-width: 900px) {
    .lt-dash-grid { grid-template-columns: 1fr; }
  }

  .lt-dash-map-widget {
    grid-column: 1; grid-row: 1 / 3;
    background: #FFF; border-radius: 14px;
    border: 1px solid #E2E8F0;
    overflow: hidden; display: flex; flex-direction: column;
    min-height: 380px;
  }
  @media (max-width: 900px) {
    .lt-dash-map-widget { grid-column: 1; grid-row: auto; min-height: 280px; }
  }

  .lt-dash-alerts-widget,
  .lt-dash-activity-widget {
    background: #FFF; border-radius: 14px;
    border: 1px solid #E2E8F0;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  /* Widget shared */
  .lt-widget-header {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 18px 22px 14px; border-bottom: 1px solid #F1F5F9;
  }
  .lt-widget-title {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Manrope', sans-serif;
    font-size: 0.92rem; font-weight: 700;
    color: #0F172A; margin: 0;
  }
  .lt-widget-icon { color: #2563EB; }
  .lt-widget-icon--warning { color: #D97706; }
  .lt-widget-action {
    display: inline-flex; align-items: center; gap: 4px;
    border: none; background: transparent;
    color: #2563EB; font-family: 'Inter', sans-serif;
    font-size: 0.78rem; font-weight: 500;
    cursor: pointer; transition: opacity 0.15s;
  }
  .lt-widget-action:hover { opacity: 0.7; }

  /* Map Placeholder */
  .lt-map-placeholder {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
    color: #94A3B8; gap: 8px;
  }
  .lt-map-placeholder p {
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem; color: #94A3B8; margin: 0;
  }
  .lt-map-open-btn {
    margin-top: 8px; padding: 8px 20px;
    border-radius: 10px; border: 1.5px solid #2563EB;
    background: transparent; color: #2563EB;
    font-family: 'Manrope', sans-serif;
    font-size: 0.82rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .lt-map-open-btn:hover { background: #2563EB; color: #FFF; }

  /* ── Alerts Feed ── */
  .lt-alert-badge {
    background: #FEF2F2; color: #DC2626;
    font-family: 'Manrope', sans-serif;
    font-size: 0.72rem; font-weight: 700;
    padding: 3px 10px; border-radius: 99px;
  }
  .lt-alerts-list {
    flex: 1; overflow-y: auto; padding: 4px 0;
  }
  .lt-alert-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 22px;
    border-bottom: 1px solid #F8FAFC;
    transition: background 0.1s;
    cursor: pointer;
  }
  .lt-alert-item:hover { background: #FAFBFC; }
  .lt-alert-item:last-child { border-bottom: none; }
  .lt-alert-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .lt-alert-content {
    flex: 1; display: flex; flex-direction: column; gap: 2px;
    min-width: 0;
  }
  .lt-alert-title {
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem; font-weight: 600; color: #0F172A;
  }
  .lt-alert-desc {
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem; color: #94A3B8;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .lt-alert-time {
    font-family: 'Inter', sans-serif;
    font-size: 0.68rem; color: #CBD5E1;
    white-space: nowrap; flex-shrink: 0;
  }

  /* ── Activity Timeline ── */
  .lt-timeline { padding: 16px 22px; display: flex; flex-direction: column; gap: 0; }
  .lt-timeline-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 10px 0; position: relative;
  }
  .lt-timeline-line {
    display: flex; flex-direction: column; align-items: center;
    position: relative; width: 28px; flex-shrink: 0;
  }
  .lt-timeline-dot {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid; z-index: 1;
  }
  .lt-timeline-item:not(:last-child) .lt-timeline-line::after {
    content: '';
    position: absolute; top: 34px; left: 50%;
    transform: translateX(-50%);
    width: 2px; height: calc(100% - 8px);
    background: #F1F5F9;
  }
  .lt-timeline-content {
    flex: 1; display: flex; flex-direction: column; gap: 2px;
    padding-top: 4px;
  }
  .lt-timeline-title {
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem; font-weight: 600; color: #0F172A;
  }
  .lt-timeline-desc {
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem; color: #94A3B8;
  }
  .lt-timeline-time {
    font-family: 'Inter', sans-serif;
    font-size: 0.68rem; color: #CBD5E1;
    padding-top: 6px; white-space: nowrap; flex-shrink: 0;
  }
`

export default PremiumDashboard
