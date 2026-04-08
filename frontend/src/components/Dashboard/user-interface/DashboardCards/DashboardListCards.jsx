import {useEffect, useState} from 'react'
import {
  fetchDashboard,
  fetchDashboardDetail,
  getDashboard,
  getCardSelected,
  getLoadingCard,
  setCardSelected,
  setLoadingCard,
} from '../../slice/dashboard.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import DashboardDetail from '../DashboardDetail/DashboardDetail'

/* ── Color mapping for KPI cards ── */
const KPI_STYLES = {
  '#2196F3': {gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', light: '#EFF6FF', text: '#1E40AF', icon: '📦'},
  '#4CAF50': {gradient: 'linear-gradient(135deg, #22C55E, #15803D)', light: '#F0FDF4', text: '#166534', icon: '🏷'},
  '#FF9800': {gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', light: '#FFFBEB', text: '#92400E', icon: '📍'},
  '#f44336': {gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', light: '#FEF2F2', text: '#991B1B', icon: '🔧'},
}
const getKpiStyle = (bgColor) => KPI_STYLES[bgColor] || {gradient: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`, light: '#F8FAFC', text: '#334155', icon: '📊'}

const DashboardListCards = () => {
  const dashboardData = useAppSelector(getDashboard)
  const selectedCard = useAppSelector(getCardSelected)
  const loadingCard = useAppSelector(getLoadingCard)
  const dispatch = useAppDispatch()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    dispatch(fetchDashboard()).then(() => setLoaded(true))
  }, [dispatch])

  const handleSelectCard = (item) => {
    if (selectedCard?.code === item.code) {
      dispatch(setCardSelected(null))
      return
    }
    dispatch(setCardSelected({
      src: item.src,
      title: item.title,
      code: item.code,
      titledetail: item.titledetail,
    }))
    dispatch(setLoadingCard(true))
    dispatch(fetchDashboardDetail(item.code)).finally(() => {
      dispatch(setLoadingCard(false))
    })
  }

  const handleCloseDetail = () => dispatch(setCardSelected(null))

  const isLoading = !loaded && (!dashboardData || dashboardData.length === 0)

  return (
    <div className="ld-container" data-testid="premium-dashboard">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="ld-header">
        <div>
          <h1 className="ld-title" data-testid="dashboard-title">Dashboard</h1>
          <p className="ld-subtitle">Vue d'ensemble de vos assets et tags</p>
        </div>
        <div className="ld-header-actions">
          <button className="ld-refresh-btn" onClick={() => { setLoaded(false); dispatch(fetchDashboard()).then(() => setLoaded(true)) }} data-testid="refresh-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Actualiser
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="ld-kpi-grid" data-testid="kpi-grid">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="ld-kpi-skeleton" data-testid={`kpi-skeleton-${i}`}>
              <div className="ld-skel-icon" />
              <div className="ld-skel-lines">
                <div className="ld-skel-line ld-skel-line--short" />
                <div className="ld-skel-line ld-skel-line--long" />
              </div>
            </div>
          ))
        ) : dashboardData.length === 0 ? (
          <div className="ld-empty" data-testid="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <p>Aucune donnée disponible</p>
          </div>
        ) : (
          dashboardData.map((item, i) => {
            const style = getKpiStyle(item.bgColor)
            const isActive = selectedCard?.code === item.code
            return (
              <div
                key={item.code || i}
                className={`ld-kpi ${isActive ? 'ld-kpi--active' : ''}`}
                onClick={() => handleSelectCard(item)}
                data-testid={`kpi-card-${i}`}
              >
                <div className="ld-kpi-top">
                  <div className="ld-kpi-icon-wrap" style={{background: style.gradient}}>
                    <i className={`${item.icon} ld-kpi-icon-fa`} style={{color: '#FFF', fontSize: '1.2rem'}} />
                  </div>
                  <div className="ld-kpi-data">
                    <span className="ld-kpi-value">{item.quantity ?? 0}</span>
                    <span className="ld-kpi-label">{item.quantityLabel || item.label || item.title}</span>
                  </div>
                </div>
                <div className="ld-kpi-progress">
                  <div className="ld-kpi-bar-bg">
                    <div className="ld-kpi-bar-fill" style={{width: `${Math.min(item.value || 0, 100)}%`, background: style.gradient}} />
                  </div>
                  <span className="ld-kpi-pct" style={{color: style.text}}>{item.value ?? 0}%</span>
                </div>
                {isActive && loadingCard && (
                  <div className="ld-kpi-loading">
                    <div className="ld-spinner" />
                  </div>
                )}
                {isActive && <div className="ld-kpi-active-bar" style={{background: style.gradient}} />}
              </div>
            )
          })
        )}
      </div>

      {/* Detail Panel */}
      {selectedCard && !loadingCard && (
        <div className="ld-detail-panel" data-testid="detail-panel">
          <div className="ld-detail-header">
            <h2 className="ld-detail-title">
              {selectedCard.titledetail || selectedCard.title}
            </h2>
            <button className="ld-detail-close" onClick={handleCloseDetail} data-testid="detail-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="ld-detail-body">
            <DashboardDetail />
          </div>
        </div>
      )}

      {/* Loading detail skeleton */}
      {selectedCard && loadingCard && (
        <div className="ld-detail-panel ld-detail-panel--loading" data-testid="detail-loading">
          <div className="ld-detail-header">
            <h2 className="ld-detail-title">{selectedCard.titledetail || selectedCard.title}</h2>
          </div>
          <div className="ld-detail-skel-body">
            {[...Array(5)].map((_, i) => <div key={i} className="ld-detail-skel-row" style={{animationDelay: `${i * 0.1}s`}} />)}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Styles ── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap');

.ld-container {
  max-width: 1400px; margin: 0 auto; padding: 28px 32px;
  font-family: 'Inter', -apple-system, sans-serif;
  min-height: 100vh; background: #F8FAFC;
}

/* Header */
.ld-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 28px; flex-wrap: wrap; gap: 16px;
}
.ld-title {
  font-family: 'Manrope', sans-serif; font-size: 1.75rem; font-weight: 800;
  color: #0F172A; margin: 0; letter-spacing: -0.03em;
}
.ld-subtitle { font-size: 0.85rem; color: #64748B; margin: 4px 0 0; }
.ld-refresh-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 12px;
  border: 1.5px solid #E2E8F0; background: #FFF;
  font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 600;
  color: #475569; cursor: pointer; transition: all 0.15s;
}
.ld-refresh-btn:hover { border-color: #3B82F6; color: #3B82F6; background: #EFF6FF; }

/* KPI Grid */
.ld-kpi-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px; margin-bottom: 28px;
}

.ld-kpi {
  background: #FFFFFF; border-radius: 16px; padding: 22px 24px;
  border: 1.5px solid #E2E8F0; cursor: pointer;
  transition: all 0.2s ease; position: relative; overflow: hidden;
}
.ld-kpi:hover {
  border-color: #CBD5E1; box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  transform: translateY(-3px);
}
.ld-kpi--active {
  border-color: #3B82F6; box-shadow: 0 8px 24px rgba(59,130,246,0.12);
  transform: translateY(-3px);
}
.ld-kpi-active-bar {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
}
.ld-kpi-top { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.ld-kpi-icon-wrap {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.ld-kpi-icon-fa { text-shadow: 0 1px 2px rgba(0,0,0,0.15); }
.ld-kpi-data { flex: 1; min-width: 0; }
.ld-kpi-value {
  font-family: 'Manrope', sans-serif; font-size: 1.5rem; font-weight: 800;
  color: #0F172A; display: block; line-height: 1.1;
}
.ld-kpi-label {
  font-size: 0.72rem; color: #64748B; font-weight: 500;
  display: block; margin-top: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ld-kpi-progress { display: flex; align-items: center; gap: 10px; }
.ld-kpi-bar-bg {
  flex: 1; height: 6px; border-radius: 3px; background: #F1F5F9;
  overflow: hidden;
}
.ld-kpi-bar-fill {
  height: 100%; border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ld-kpi-pct { font-size: 0.7rem; font-weight: 700; white-space: nowrap; }
.ld-kpi-loading {
  position: absolute; top: 12px; right: 12px;
}
.ld-spinner {
  width: 20px; height: 20px; border: 2.5px solid #E2E8F0;
  border-top-color: #3B82F6; border-radius: 50%;
  animation: ldSpin 0.7s linear infinite;
}
@keyframes ldSpin { to { transform: rotate(360deg); } }

/* Skeleton */
.ld-kpi-skeleton {
  background: #FFF; border-radius: 16px; padding: 22px 24px;
  border: 1.5px solid #E2E8F0; display: flex; align-items: center; gap: 16px;
}
.ld-skel-icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: ldShimmer 1.5s infinite;
}
.ld-skel-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.ld-skel-line {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: ldShimmer 1.5s infinite;
}
.ld-skel-line--short { width: 40%; height: 20px; }
.ld-skel-line--long { width: 70%; }
@keyframes ldShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* Empty State */
.ld-empty {
  grid-column: 1 / -1; display: flex; flex-direction: column;
  align-items: center; gap: 12px; padding: 60px; text-align: center;
}
.ld-empty p { font-size: 0.88rem; color: #94A3B8; margin: 0; }

/* Detail Panel */
.ld-detail-panel {
  background: #FFF; border-radius: 16px; border: 1.5px solid #E2E8F0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04); overflow: hidden;
  animation: ldSlideUp 0.3s ease;
  margin-bottom: 24px;
}
@keyframes ldSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.ld-detail-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid #F1F5F9;
}
.ld-detail-title {
  font-family: 'Manrope', sans-serif; font-size: 1rem; font-weight: 800;
  color: #0F172A; margin: 0;
}
.ld-detail-close {
  width: 34px; height: 34px; border-radius: 10px;
  border: 1.5px solid #E2E8F0; background: #FAFBFC;
  display: flex; align-items: center; justify-content: center;
  color: #64748B; cursor: pointer; transition: all 0.12s;
}
.ld-detail-close:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }
.ld-detail-body { padding: 4px; }

/* Detail loading skeleton */
.ld-detail-skel-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.ld-detail-skel-row {
  height: 40px; border-radius: 10px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: ldShimmer 1.5s infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .ld-container { padding: 16px; }
  .ld-kpi-grid { grid-template-columns: 1fr; }
  .ld-title { font-size: 1.3rem; }
}
`

export default DashboardListCards
