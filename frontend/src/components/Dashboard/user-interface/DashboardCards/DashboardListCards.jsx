import {useEffect, useState, useMemo, useCallback, useRef} from 'react'
import {
  fetchDashboard,
  fetchDashboardDetail,
  getDashboard,
  getDashboardDetail,
  getCardSelected,
  getLoadingCard,
  setCardSelected,
  setLoadingCard,
} from '../../slice/dashboard.slice'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import DashboardDetail from '../DashboardDetail/DashboardDetail'
import Chart from 'react-apexcharts'
import {_fetchDashboardDetail} from '../../api/index'

/* ── Helpers ── */
const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0))

const KPI_COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#8B5CF6']
const KPI_ICONS = ['pi pi-box', 'pi pi-exclamation-triangle', 'pi pi-check-circle', 'pi pi-tag']

const DashboardListCards = () => {
  const dashboardData = useAppSelector(getDashboard)
  const dashboardDetail = useAppSelector(getDashboardDetail)
  const selectedCard = useAppSelector(getCardSelected)
  const loadingCard = useAppSelector(getLoadingCard)
  const dispatch = useAppDispatch()
  const [loaded, setLoaded] = useState(false)
  const [allDetailData, setAllDetailData] = useState([])
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [now, setNow] = useState(new Date())
  const fetchedRef = useRef(false)
  const [periodFilter, setPeriodFilter] = useState('all')
  const [customRange, setCustomRange] = useState({from: '', to: ''})

  /* Clock */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  /* Fetch dashboard */
  useEffect(() => {
    dispatch(fetchDashboard()).then(() => setLoaded(true))
  }, [dispatch])

  /* Auto-fetch ALL card details for analytics (direct API, no Redux overwrite) */
  useEffect(() => {
    if (!loaded || !dashboardData?.length || fetchedRef.current) return
    fetchedRef.current = true

    const fetchAll = async () => {
      setAnalyticsLoading(true)
      const merged = []
      for (const card of dashboardData) {
        if (card?.code) {
          try {
            const res = await _fetchDashboardDetail(card.code)
            if (!res.error && Array.isArray(res.data)) {
              merged.push(...res.data.map(item => ({...item, _src: card.src})))
            }
          } catch (e) { /* ignore slow API */ }
        }
      }
      setAllDetailData(merged)
      setAnalyticsLoading(false)
    }
    fetchAll()
  }, [loaded, dashboardData])

  /* Handle card click for detail panel */
  const handleSelectCard = useCallback((item) => {
    if (selectedCard?.code === item.code) {
      dispatch(setCardSelected(null))
      return
    }
    dispatch(setCardSelected({
      src: item.src, title: item.title, code: item.code, titledetail: item.titledetail,
    }))
    dispatch(setLoadingCard(true))
    dispatch(fetchDashboardDetail(item.code)).finally(() => dispatch(setLoadingCard(false)))
  }, [selectedCard, dispatch])

  const handleCloseDetail = useCallback(() => dispatch(setCardSelected(null)), [dispatch])

  const handleRefresh = useCallback(() => {
    setLoaded(false)
    setAnalyticsLoading(true)
    fetchedRef.current = false
    dispatch(setCardSelected(null))
    dispatch(fetchDashboard()).then(() => setLoaded(true))
  }, [dispatch])

  /* ── Period filter logic ── */
  const filteredDetailData = useMemo(() => {
    if (periodFilter === 'all' || !allDetailData.length) return allDetailData
    const now = new Date()
    let cutoff = new Date()
    if (periodFilter === 'today') {
      cutoff.setHours(0, 0, 0, 0)
    } else if (periodFilter === '7d') {
      cutoff.setDate(now.getDate() - 7)
    } else if (periodFilter === '30d') {
      cutoff.setDate(now.getDate() - 30)
    } else if (periodFilter === 'custom') {
      const from = customRange.from ? new Date(customRange.from) : new Date(0)
      const to = customRange.to ? new Date(customRange.to + 'T23:59:59') : new Date()
      return allDetailData.filter(item => {
        const d = new Date(item.locationDate || item.statusDate || item.tagDate || 0)
        return d >= from && d <= to
      })
    }
    return allDetailData.filter(item => {
      const dateStr = item.locationDate || item.statusDate || item.tagDate
      if (!dateStr) return periodFilter === 'all'
      return new Date(dateStr) >= cutoff
    })
  }, [allDetailData, periodFilter, customRange])

  /* ── Analytics computed from filtered detail data ── */
  const analytics = useMemo(() => {
    if (!Array.isArray(filteredDetailData) || filteredDetailData.length === 0) {
      return {etatData: [], statusData: [], familleData: [], batteryAlerts: [], activityFeed: []}
    }

    const etatMap = {}
    const statusMap = {}
    const familleMap = {}
    const batteryAlerts = []
    const withDates = []

    filteredDetailData.forEach((item) => {
      /* Etat (engin-type) or Active status (tag-type) */
      if (item.etatenginname) {
        const etat = item.etatenginname
        etatMap[etat] = (etatMap[etat] || 0) + 1
      } else if (item.active !== undefined) {
        const etat = item.active == 1 ? 'actif' : 'inactif'
        etatMap[etat] = (etatMap[etat] || 0) + 1
      }

      /* Status */
      const status = item.statuslabel || item.status || 'N/A'
      const statusColor = item.statusbgColor || '#94A3B8'
      if (status && status !== 'N/A') {
        if (!statusMap[status]) statusMap[status] = {count: 0, color: statusColor}
        statusMap[status].count++
      }

      /* Famille */
      const fam = item.famille || item.familleTag || 'Autre'
      const famColor = item.familleBgcolor || item.familleTagIconBgcolor || '#64748B'
      if (!familleMap[fam]) familleMap[fam] = {count: 0, color: famColor}
      familleMap[fam].count++

      /* Battery alerts (engins only) */
      if (item.batteries !== undefined && item.batteries !== null && item.batteries !== '') {
        const bat = parseInt(item.batteries, 10)
        if (bat < 20 || isNaN(bat)) batteryAlerts.push(item)
      } else if (item.etatenginname === 'nonactive') {
        batteryAlerts.push(item)
      }

      /* Activity feed - also include items without dates as recent items */
      if (item.locationDate || item.statusDate) {
        withDates.push(item)
      } else {
        withDates.push(item) /* Include all items for feed when no dates available */
      }
    })

    const etatLabels = {'exit': 'Sortie', 'reception': 'Entrée', 'nonactive': 'Inactif', 'actif': 'Actif', 'inactif': 'Inactif'}
    const etatColors = {'exit': '#EF4444', 'reception': '#22C55E', 'nonactive': '#F59E0B', 'actif': '#22C55E', 'inactif': '#EF4444'}
    const etatData = Object.entries(etatMap).map(([k, v]) => ({
      label: etatLabels[k] || k, value: v, color: etatColors[k] || '#94A3B8',
    }))

    const statusData = Object.entries(statusMap)
      .map(([k, v]) => ({label: k, value: v.count, color: v.color}))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    const familleData = Object.entries(familleMap)
      .map(([k, v]) => ({label: k, value: v.count, color: v.color}))
      .sort((a, b) => b.value - a.value)

    const activityFeed = withDates
      .sort((a, b) => {
        const da = new Date(a.locationDate || a.statusDate || 0)
        const db = new Date(b.locationDate || b.statusDate || 0)
        return db - da
      })
      .slice(0, 12)

    return {etatData, statusData, familleData, batteryAlerts: batteryAlerts.slice(0, 8), activityFeed}
  }, [filteredDetailData])

  /* ── Chart Configs ── */
  const etatChartOptions = useMemo(() => ({
    chart: {type: 'donut', fontFamily: 'Inter, sans-serif'},
    labels: analytics.etatData.map((d) => d.label),
    colors: analytics.etatData.map((d) => d.color),
    legend: {position: 'bottom', fontSize: '12px', fontWeight: 600, markers: {radius: 4}},
    dataLabels: {enabled: true, formatter: (val) => `${val.toFixed(0)}%`, style: {fontSize: '12px', fontWeight: 700}},
    plotOptions: {pie: {donut: {size: '55%', labels: {show: true, total: {show: true, label: 'Total', fontSize: '13px', fontWeight: 800, color: '#0F172A'}}}}},
    stroke: {width: 3, colors: ['#fff']},
    tooltip: {y: {formatter: (val) => `${val} assets`}},
  }), [analytics.etatData])

  const familleChartOptions = useMemo(() => ({
    chart: {type: 'donut', fontFamily: 'Inter, sans-serif'},
    labels: analytics.familleData.map((d) => d.label),
    colors: analytics.familleData.map((d) => d.color),
    legend: {position: 'bottom', fontSize: '11px', fontWeight: 600, markers: {radius: 4}},
    dataLabels: {enabled: false},
    plotOptions: {pie: {donut: {size: '60%', labels: {show: true, total: {show: true, label: 'Familles', fontSize: '12px', fontWeight: 800, color: '#0F172A'}}}}},
    stroke: {width: 2, colors: ['#fff']},
    tooltip: {y: {formatter: (val) => `${val} assets`}},
  }), [analytics.familleData])

  const statusBarOptions = useMemo(() => ({
    chart: {type: 'bar', fontFamily: 'Inter, sans-serif', toolbar: {show: false}},
    plotOptions: {bar: {horizontal: true, borderRadius: 6, barHeight: '60%', distributed: true}},
    colors: analytics.statusData.map(d => d.color),
    xaxis: {categories: analytics.statusData.map(d => d.label), labels: {style: {fontSize: '11px', fontWeight: 600}}},
    yaxis: {labels: {style: {fontSize: '11px', fontWeight: 600, colors: ['#475569']}}},
    dataLabels: {enabled: true, formatter: (val) => val, style: {fontSize: '11px', fontWeight: 700}},
    legend: {show: false},
    grid: {borderColor: '#F1F5F9'},
    tooltip: {y: {formatter: (val) => `${val} assets`}},
  }), [analytics.statusData])

  const isLoading = !loaded
  const isAnalyticsLoading = analyticsLoading

  return (
    <div className="om-container" data-testid="operations-monitor">
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <header className="om-header" data-testid="om-header">
        <div className="om-header-left">
          <div className="om-header-icon">
            <i className="pi pi-th-large"></i>
          </div>
          <div>
            <h1 className="om-title">Operations Monitor</h1>
            <p className="om-subtitle">
              {now.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
              {' — '}
              {now.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
            </p>
          </div>
        </div>
        <div className="om-header-actions">
          <button className="om-refresh-btn" onClick={handleRefresh} data-testid="om-refresh">
            <i className="pi pi-refresh"></i>
            Actualiser
          </button>
        </div>
      </header>

      {/* ── Period Filter Bar ── */}
      <div className="om-filter-bar" data-testid="om-period-filter">
        <div className="om-filter-pills">
          {[
            {key: 'all', label: 'Tout'},
            {key: 'today', label: "Aujourd'hui"},
            {key: '7d', label: '7 jours'},
            {key: '30d', label: '30 jours'},
            {key: 'custom', label: 'Personnalisé'},
          ].map(p => (
            <button
              key={p.key}
              className={`om-filter-pill ${periodFilter === p.key ? 'om-filter-pill--active' : ''}`}
              onClick={() => setPeriodFilter(p.key)}
              data-testid={`filter-${p.key}`}
            >
              {p.key === 'custom' && <i className="pi pi-calendar" style={{fontSize: '0.75rem'}}></i>}
              {p.label}
            </button>
          ))}
        </div>
        {periodFilter === 'custom' && (
          <div className="om-filter-custom" data-testid="custom-range">
            <div className="om-filter-date-group">
              <label className="om-filter-date-label">De</label>
              <input
                type="date"
                className="om-filter-date-input"
                value={customRange.from}
                onChange={e => setCustomRange(r => ({...r, from: e.target.value}))}
                data-testid="filter-date-from"
              />
            </div>
            <div className="om-filter-date-group">
              <label className="om-filter-date-label">À</label>
              <input
                type="date"
                className="om-filter-date-input"
                value={customRange.to}
                onChange={e => setCustomRange(r => ({...r, to: e.target.value}))}
                data-testid="filter-date-to"
              />
            </div>
          </div>
        )}
        {periodFilter !== 'all' && filteredDetailData.length > 0 && (
          <span className="om-filter-result">
            <strong>{filteredDetailData.length}</strong> / {allDetailData.length} résultats
          </span>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="om-kpi-grid" data-testid="om-kpi-grid">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="om-kpi om-kpi-skeleton" data-testid={`kpi-skel-${i}`}>
              <div className="om-skel-icon" />
              <div className="om-skel-lines">
                <div className="om-skel-line om-skel-line--lg" />
                <div className="om-skel-line om-skel-line--sm" />
              </div>
            </div>
          ))
        ) : (
          dashboardData.map((item, i) => {
            const color = KPI_COLORS[i % KPI_COLORS.length]
            const icon = KPI_ICONS[i % KPI_ICONS.length]
            const isActive = selectedCard?.code === item.code
            const pct = item.value ?? 0
            return (
              <div
                key={item.code || i}
                className={`om-kpi ${isActive ? 'om-kpi--active' : ''}`}
                onClick={() => handleSelectCard(item)}
                style={{'--kpi-color': color}}
                data-testid={`kpi-card-${i}`}
              >
                <div className="om-kpi-header">
                  <div className="om-kpi-icon" style={{background: `${color}15`, color}}>
                    <i className={icon}></i>
                  </div>
                  {pct > 0 && (
                    <span className={`om-kpi-change ${pct > 50 ? 'om-kpi-change--up' : 'om-kpi-change--down'}`}>
                      <i className={`pi ${pct > 50 ? 'pi-arrow-up-right' : 'pi-arrow-down-right'}`}></i>
                      {pct}%
                    </span>
                  )}
                </div>
                <div className="om-kpi-value">{item.quantity ?? 0}</div>
                <div className="om-kpi-label">{item.quantityLabel || item.label || item.title}</div>
                <div className="om-kpi-bar">
                  <div className="om-kpi-bar-fill" style={{width: `${Math.min(pct, 100)}%`, background: color}} />
                </div>
                {isActive && <div className="om-kpi-active-line" style={{background: color}} />}
                {isActive && loadingCard && (
                  <div className="om-kpi-spinner">
                    <div className="om-spinner" style={{borderTopColor: color}} />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Detail Panel (when card is clicked) ── */}
      {selectedCard && !loadingCard && (
        <div className="om-detail-panel" data-testid="om-detail-panel">
          <div className="om-detail-head">
            <h2 className="om-detail-title">
              <i className="pi pi-list" style={{marginRight: 8, opacity: 0.5}}></i>
              {selectedCard.titledetail || selectedCard.title}
            </h2>
            <button className="om-detail-close" onClick={handleCloseDetail} data-testid="om-detail-close">
              <i className="pi pi-times"></i>
            </button>
          </div>
          <div className="om-detail-body">
            <DashboardDetail />
          </div>
        </div>
      )}
      {selectedCard && loadingCard && (
        <div className="om-detail-panel om-detail-panel--loading" data-testid="om-detail-loading">
          <div className="om-detail-head">
            <h2 className="om-detail-title">{selectedCard.titledetail || selectedCard.title}</h2>
          </div>
          <div className="om-detail-skel">
            {[...Array(4)].map((_, i) => <div key={i} className="om-detail-skel-row" style={{animationDelay: `${i * 0.1}s`}} />)}
          </div>
        </div>
      )}

      {/* ── Analytics Section ── */}
      <div className="om-analytics" data-testid="om-analytics">
        {/* LEFT: Activity Feed */}
        <div className="om-panel om-feed-panel" data-testid="om-activity-feed">
          <div className="om-panel-head">
            <h3 className="om-panel-title">
              <i className="pi pi-clock"></i>
              Dernière Activité
            </h3>
            <span className="om-panel-badge">{analytics.activityFeed.length} récents</span>
          </div>
          <div className="om-feed-list">
            {isAnalyticsLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="om-feed-item-skel" style={{animationDelay: `${i * 0.08}s`}}>
                  <div className="om-skel-dot" />
                  <div className="om-skel-lines" style={{flex: 1}}>
                    <div className="om-skel-line om-skel-line--sm" />
                    <div className="om-skel-line om-skel-line--lg" />
                  </div>
                </div>
              ))
            ) : analytics.activityFeed.length === 0 ? (
              <div className="om-feed-empty">
                <i className="pi pi-inbox" style={{fontSize: '1.5rem', color: '#CBD5E1'}}></i>
                <p>Aucune activité récente</p>
              </div>
            ) : (
              analytics.activityFeed.map((item, i) => {
                const isExit = item.etatenginname === 'exit'
                const isEntry = item.etatenginname === 'reception'
                const etatLabel = isExit ? 'Sortie' : isEntry ? 'Entrée' : (item.status || 'Actif')
                const etatColor = isExit ? '#EF4444' : isEntry ? '#22C55E' : '#F59E0B'
                const dateStr = item.locationDate || item.statusDate || ''
                return (
                  <div key={i} className="om-feed-item" data-testid={`feed-item-${i}`}>
                    <div className="om-feed-dot" style={{background: etatColor}} />
                    <div className="om-feed-content">
                      <div className="om-feed-top">
                        <span className="om-feed-name">{item.reference || item.label || item.name || `Asset #${i + 1}`}</span>
                        <span className="om-feed-badge" style={{background: `${etatColor}15`, color: etatColor}}>
                          {etatLabel}
                        </span>
                      </div>
                      <div className="om-feed-bottom">
                        <span className="om-feed-location">
                          <i className="pi pi-map-marker"></i>
                          {item.LocationObjectname || item.tagAddress || item.enginAddress || 'Localisation inconnue'}
                        </span>
                        <span className="om-feed-time">{dateStr}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* RIGHT: Charts */}
        <div className="om-charts-col" data-testid="om-charts">
          {/* Etat Pie Chart */}
          <div className="om-panel" data-testid="om-etat-chart">
            <div className="om-panel-head">
              <h3 className="om-panel-title">
                <i className="pi pi-chart-pie"></i>
                Répartition État
              </h3>
            </div>
            <div className="om-chart-body">
              {isAnalyticsLoading ? (
                <div className="om-chart-skel"><div className="om-skel-circle" /></div>
              ) : analytics.etatData.length > 0 ? (
                <Chart
                  options={etatChartOptions}
                  series={analytics.etatData.map((d) => d.value)}
                  type="donut"
                  height={220}
                />
              ) : (
                <div className="om-chart-empty">Aucune donnée</div>
              )}
            </div>
          </div>

          {/* Status Bar Chart */}
          <div className="om-panel" data-testid="om-status-chart">
            <div className="om-panel-head">
              <h3 className="om-panel-title">
                <i className="pi pi-chart-bar"></i>
                Distribution Statuts
              </h3>
            </div>
            <div className="om-chart-body">
              {isAnalyticsLoading ? (
                <div className="om-chart-skel"><div className="om-skel-circle" style={{borderRadius: 12, width: '100%', height: 150}} /></div>
              ) : analytics.statusData.length > 0 ? (
                <Chart
                  options={statusBarOptions}
                  series={[{name: 'Assets', data: analytics.statusData.map(d => d.value)}]}
                  type="bar"
                  height={Math.max(140, analytics.statusData.length * 38)}
                  width="100%"
                />
              ) : (
                <div className="om-chart-empty">Aucune donnée</div>
              )}
            </div>
          </div>

          {/* Famille Donut Chart */}
          <div className="om-panel" data-testid="om-famille-chart">
            <div className="om-panel-head">
              <h3 className="om-panel-title">
                <i className="pi pi-sitemap"></i>
                Assets par Famille
              </h3>
            </div>
            <div className="om-chart-body">
              {isAnalyticsLoading ? (
                <div className="om-chart-skel"><div className="om-skel-circle" /></div>
              ) : analytics.familleData.length > 0 ? (
                <Chart
                  options={familleChartOptions}
                  series={analytics.familleData.map((d) => d.value)}
                  type="donut"
                  height={220}
                />
              ) : (
                <div className="om-chart-empty">Aucune donnée</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Alert Panel ── */}
      <div className="om-panel om-alert-panel" data-testid="om-alert-panel">
        <div className="om-panel-head">
          <h3 className="om-panel-title">
            <i className="pi pi-exclamation-circle"></i>
            Assets nécessitant attention
          </h3>
          <span className="om-panel-badge om-panel-badge--danger">
            {analytics.batteryAlerts.length} alertes
          </span>
        </div>
        <div className="om-alert-table">
          {isAnalyticsLoading ? (
            <div className="om-alert-skel">
              {[...Array(3)].map((_, i) => <div key={i} className="om-detail-skel-row" style={{animationDelay: `${i * 0.1}s`}} />)}
            </div>
          ) : analytics.batteryAlerts.length === 0 ? (
            <div className="om-alert-empty" data-testid="om-no-alerts">
              <i className="pi pi-check-circle" style={{fontSize: '1.3rem', color: '#22C55E'}}></i>
              <span>Tous les assets fonctionnent normalement</span>
            </div>
          ) : (
            <table className="om-table" data-testid="om-alerts-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Batterie</th>
                  <th>État</th>
                  <th>Dernière activité</th>
                  <th>Localisation</th>
                </tr>
              </thead>
              <tbody>
                {analytics.batteryAlerts.map((item, i) => {
                  const bat = parseInt(item.batteries, 10) || 0
                  const batColor = bat >= 50 ? '#22C55E' : bat >= 20 ? '#F59E0B' : '#EF4444'
                  const isExit = item.etatenginname === 'exit'
                  const etatLabel = isExit ? 'Sortie' : item.etatenginname === 'reception' ? 'Entrée' : 'Inactif'
                  const etatColor = isExit ? '#EF4444' : item.etatenginname === 'reception' ? '#22C55E' : '#F59E0B'
                  return (
                    <tr key={i} data-testid={`alert-row-${i}`}>
                      <td>
                        <div className="om-alert-asset">
                          <span className="om-alert-name">{item.reference || item.label || item.name || '-'}</span>
                          {item.vin && <span className="om-alert-vin">{item.vin}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="om-alert-battery">
                          <div className="om-alert-bat-bar">
                            <div className="om-alert-bat-fill" style={{width: `${Math.min(bat, 100)}%`, background: batColor}} />
                          </div>
                          <span className="om-alert-bat-text" style={{color: batColor}}>
                            {item.batteries != null && item.batteries !== '' ? `${bat}%` : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="om-alert-etat" style={{background: `${etatColor}15`, color: etatColor}}>
                          {etatLabel}
                        </span>
                      </td>
                      <td className="om-alert-date">{item.locationDate || item.statusDate || '-'}</td>
                      <td className="om-alert-loc">{item.LocationObjectname || item.enginAddress || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════ STYLES ══════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap');

.om-container {
  max-width: 1440px; margin: 0 auto; padding: 24px 28px;
  font-family: 'Inter', -apple-system, sans-serif;
  min-height: 100vh; background: #F8FAFC;
}

/* ── Header ── */
.om-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
}
.om-header-left { display: flex; align-items: center; gap: 14px; }
.om-header-icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: linear-gradient(135deg, #0F172A, #334155);
  display: flex; align-items: center; justify-content: center;
  color: #FFF; font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(15,23,42,0.2);
}
.om-title {
  font-family: 'Manrope', sans-serif; font-size: 1.6rem; font-weight: 800;
  color: #0F172A; margin: 0; letter-spacing: -0.03em;
}
.om-subtitle { font-size: 0.8rem; color: #64748B; margin: 2px 0 0; font-weight: 500; }
.om-refresh-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 10px;
  border: 1.5px solid #E2E8F0; background: #FFF;
  font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 600;
  color: #475569; cursor: pointer; transition: all 0.15s;
}
.om-refresh-btn:hover { border-color: #3B82F6; color: #3B82F6; background: #EFF6FF; }

/* ── KPI Grid ── */
.om-kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; margin-bottom: 24px;
}
@media (max-width: 1024px) { .om-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .om-kpi-grid { grid-template-columns: 1fr; } }

.om-kpi {
  background: #FFF; border-radius: 16px; padding: 20px;
  border: 1.5px solid #E2E8F0; cursor: pointer;
  transition: all 0.2s; position: relative; overflow: hidden;
}
.om-kpi:hover { border-color: #CBD5E1; box-shadow: 0 8px 24px rgba(0,0,0,0.06); transform: translateY(-2px); }
.om-kpi--active { border-color: var(--kpi-color); box-shadow: 0 8px 24px rgba(59,130,246,0.1); transform: translateY(-2px); }
.om-kpi-active-line { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }

.om-kpi-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.om-kpi-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
}
.om-kpi-change {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 8px; border-radius: 6px;
  font-size: 0.7rem; font-weight: 700;
}
.om-kpi-change--up { background: #F0FDF4; color: #166534; }
.om-kpi-change--down { background: #FEF2F2; color: #991B1B; }

.om-kpi-value {
  font-family: 'Manrope', sans-serif; font-size: 1.8rem; font-weight: 800;
  color: #0F172A; line-height: 1.1;
}
.om-kpi-label {
  font-size: 0.75rem; color: #64748B; font-weight: 500;
  margin: 4px 0 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.om-kpi-bar { height: 5px; border-radius: 3px; background: #F1F5F9; overflow: hidden; }
.om-kpi-bar-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }

.om-kpi-spinner { position: absolute; top: 14px; right: 14px; }
.om-spinner {
  width: 18px; height: 18px; border: 2.5px solid #E2E8F0;
  border-top-color: #3B82F6; border-radius: 50%;
  animation: omSpin 0.7s linear infinite;
}
@keyframes omSpin { to { transform: rotate(360deg); } }

/* ── KPI Skeleton ── */
.om-kpi-skeleton { display: flex; align-items: center; gap: 14px; }
.om-skel-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: omShimmer 1.5s infinite; flex-shrink: 0;
}
.om-skel-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.om-skel-line {
  border-radius: 6px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: omShimmer 1.5s infinite;
}
.om-skel-line--lg { height: 24px; width: 50%; }
.om-skel-line--sm { height: 12px; width: 80%; }
.om-skel-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: omShimmer 1.5s infinite;
}
@keyframes omShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Detail Panel ── */
.om-detail-panel {
  background: #FFF; border-radius: 16px; border: 1.5px solid #E2E8F0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04); overflow: hidden;
  animation: omSlide 0.3s ease; margin-bottom: 24px;
}
@keyframes omSlide { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.om-detail-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px; border-bottom: 1px solid #F1F5F9;
}
.om-detail-title {
  font-family: 'Manrope', sans-serif; font-size: 1rem; font-weight: 800;
  color: #0F172A; margin: 0; display: flex; align-items: center;
}
.om-detail-close {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1.5px solid #E2E8F0; background: #FAFBFC;
  display: flex; align-items: center; justify-content: center;
  color: #64748B; cursor: pointer; transition: all 0.12s; font-size: 0.8rem;
}
.om-detail-close:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }
.om-detail-body { padding: 4px; }
.om-detail-skel { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.om-detail-skel-row {
  height: 36px; border-radius: 10px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: omShimmer 1.5s infinite;
}

/* ── Analytics 2-col ── */
.om-analytics {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 20px; margin-bottom: 24px;
}
@media (max-width: 900px) { .om-analytics { grid-template-columns: 1fr; } }

.om-panel {
  background: #FFF; border-radius: 16px; border: 1.5px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03); overflow: hidden;
}
.om-panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #F1F5F9;
}
.om-panel-title {
  font-family: 'Manrope', sans-serif; font-size: 0.88rem; font-weight: 800;
  color: #0F172A; margin: 0; display: flex; align-items: center; gap: 8px;
}
.om-panel-title i { color: #64748B; font-size: 0.9rem; }
.om-panel-badge {
  padding: 3px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;
  background: #F1F5F9; color: #475569;
}
.om-panel-badge--danger { background: #FEF2F2; color: #991B1B; }

/* ── Activity Feed ── */
.om-feed-panel { display: flex; flex-direction: column; }
.om-feed-list { padding: 8px 0; flex: 1; max-height: 480px; overflow-y: auto; }
.om-feed-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 20px; transition: background 0.12s; cursor: default;
}
.om-feed-item:hover { background: #F8FAFC; }
.om-feed-dot {
  width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}
.om-feed-content { flex: 1; min-width: 0; }
.om-feed-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.om-feed-name { font-weight: 700; font-size: 0.82rem; color: #0F172A; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.om-feed-badge {
  padding: 2px 8px; border-radius: 5px; font-size: 0.68rem; font-weight: 700;
  white-space: nowrap; flex-shrink: 0;
}
.om-feed-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.om-feed-location {
  font-size: 0.72rem; color: #64748B; display: flex; align-items: center; gap: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.om-feed-location i { font-size: 0.68rem; }
.om-feed-time { font-size: 0.68rem; color: #94A3B8; white-space: nowrap; flex-shrink: 0; }
.om-feed-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 40px 20px; color: #94A3B8; font-size: 0.82rem;
}
.om-feed-item-skel {
  display: flex; align-items: center; gap: 12px; padding: 12px 20px;
}

/* ── Charts Column ── */
.om-charts-col { display: flex; flex-direction: column; gap: 20px; }
.om-chart-body { padding: 12px 16px; display: flex; align-items: center; justify-content: center; min-height: 220px; }
.om-chart-skel { display: flex; align-items: center; justify-content: center; padding: 20px; }
.om-skel-circle {
  width: 160px; height: 160px; border-radius: 50%;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: omShimmer 1.5s infinite;
}
.om-chart-empty { color: #94A3B8; font-size: 0.82rem; padding: 40px; }

/* ── Alert Panel ── */
.om-alert-panel { margin-bottom: 24px; }
.om-alert-table { overflow-x: auto; }
.om-alert-skel { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.om-alert-empty {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 32px 20px; font-size: 0.85rem; color: #475569; font-weight: 600;
}

.om-table {
  width: 100%; border-collapse: collapse; font-size: 0.82rem;
}
.om-table thead th {
  text-align: left; padding: 12px 16px;
  font-size: 0.7rem; font-weight: 700; color: #94A3B8;
  text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid #F1F5F9;
}
.om-table tbody tr { transition: background 0.12s; }
.om-table tbody tr:hover { background: #F8FAFC; }
.om-table tbody td { padding: 12px 16px; border-bottom: 1px solid #F8FAFC; }

.om-alert-asset { display: flex; flex-direction: column; gap: 1px; }
.om-alert-name { font-weight: 700; color: #0F172A; font-size: 0.82rem; }
.om-alert-vin { font-size: 0.7rem; color: #94A3B8; }

.om-alert-battery { display: flex; align-items: center; gap: 8px; }
.om-alert-bat-bar {
  width: 50px; height: 8px; border-radius: 4px; background: #F1F5F9; overflow: hidden;
}
.om-alert-bat-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.om-alert-bat-text { font-size: 0.75rem; font-weight: 700; white-space: nowrap; }

.om-alert-etat {
  display: inline-flex; align-items: center; padding: 3px 10px;
  border-radius: 6px; font-size: 0.72rem; font-weight: 700; white-space: nowrap;
}
.om-alert-date { font-size: 0.75rem; color: #64748B; white-space: nowrap; }
.om-alert-loc { font-size: 0.75rem; color: #94A3B8; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .om-container { padding: 16px; }
  .om-title { font-size: 1.3rem; }
  .om-kpi-grid { grid-template-columns: 1fr 1fr; }
  .om-filter-bar { flex-direction: column; align-items: stretch; }
}

/* ── Period Filter Bar ── */
.om-filter-bar {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  padding: 14px 18px; margin-bottom: 20px;
  background: #FFF; border-radius: 14px; border: 1.5px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.om-filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.om-filter-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 16px; border-radius: 8px;
  border: 1.5px solid #E2E8F0; background: #FAFBFC;
  font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 600;
  color: #64748B; cursor: pointer; transition: all 0.15s;
  white-space: nowrap;
}
.om-filter-pill:hover { border-color: #CBD5E1; background: #F1F5F9; color: #475569; }
.om-filter-pill--active {
  background: #0F172A; color: #FFF; border-color: #0F172A;
  box-shadow: 0 2px 8px rgba(15,23,42,0.2);
}
.om-filter-pill--active:hover { background: #1E293B; border-color: #1E293B; }
.om-filter-custom {
  display: flex; gap: 10px; align-items: center;
  animation: omSlide 0.2s ease;
}
.om-filter-date-group { display: flex; align-items: center; gap: 6px; }
.om-filter-date-label {
  font-size: 0.72rem; font-weight: 700; color: #94A3B8;
  text-transform: uppercase; letter-spacing: 0.03em;
}
.om-filter-date-input {
  padding: 6px 12px; border-radius: 8px;
  border: 1.5px solid #E2E8F0; background: #FFF;
  font-family: 'Inter', sans-serif; font-size: 0.78rem;
  color: #0F172A; outline: none; transition: border-color 0.15s;
}
.om-filter-date-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
.om-filter-result {
  margin-left: auto; font-size: 0.72rem; font-weight: 600;
  color: #64748B; padding: 4px 12px; border-radius: 6px;
  background: #F1F5F9; white-space: nowrap;
}
.om-filter-result strong { color: #0F172A; }
`

export default DashboardListCards
