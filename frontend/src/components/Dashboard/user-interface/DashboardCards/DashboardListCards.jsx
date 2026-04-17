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
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* Fix default marker icon */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

/* ── DashboardMap sub-component ── */
const DashboardMap = ({assets}) => {
  const bounds = assets.length > 0
    ? L.latLngBounds(assets.map(a => [a.lat, a.lng]))
    : L.latLngBounds([[30, -10], [50, 12]])

  const etatColors = {exit: '#EF4444', reception: '#22C55E', nonactive: '#F59E0B'}

  const createIcon = (color) => L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2.5px solid #FFF;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{padding: [30, 30]}}
      style={{width: '100%', height: '100%', borderRadius: '0 0 16px 16px'}}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; OSM'
      />
      {assets.map((a, i) => (
        <Marker key={i} position={[a.lat, a.lng]} icon={createIcon(etatColors[a.etat] || '#3B82F6')}>
          <Popup>
            <div style={{fontFamily: 'Inter, sans-serif', fontSize: '0.82rem'}}>
              <strong>{a.name}</strong><br/>
              <span style={{color: '#64748B'}}>{a.location || 'Position GPS'}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

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
  const [alertThresholds, setAlertThresholds] = useState(() => {
    const saved = localStorage.getItem('logitag_alert_thresholds')
    return saved ? JSON.parse(saved) : {immobilized: 30, battery: 10, inactive: 14}
  })
  const [showAlertSettings, setShowAlertSettings] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)

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

  /* ── Smart Alerts ── */
  const alerts = useMemo(() => {
    if (!allDetailData.length) return {immobilized: [], lowBattery: [], underUtilized: [], inactiveTags: []}
    const now = new Date()
    const immobilizedCutoff = new Date(now.getTime() - alertThresholds.immobilized * 24 * 60 * 60 * 1000)
    const inactiveCutoff = new Date(now.getTime() - alertThresholds.inactive * 24 * 60 * 60 * 1000)

    const immobilized = []
    const lowBattery = []
    const underUtilized = []
    const inactiveTags = []

    allDetailData.forEach(item => {
      const lastDate = new Date(item.locationDate || item.statusDate || item.tagDate || 0)

      /* Immobilized: no movement since threshold */
      if (item.etatenginname && lastDate < immobilizedCutoff && lastDate.getFullYear() > 2000) {
        const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
        immobilized.push({...item, _daysSince: daysSince})
      }

      /* Low battery */
      if (item.batteries !== undefined && item.batteries !== null && item.batteries !== '') {
        const bat = parseInt(item.batteries, 10)
        if (!isNaN(bat) && bat <= alertThresholds.battery && bat >= 0) {
          lowBattery.push({...item, _batteryLevel: bat})
        }
      }

      /* Under-utilized: had movement but very long duration on same site */
      if (item.etatenginname === 'nonactive' || item.etatenginname === 'exit') {
        if (lastDate < inactiveCutoff && lastDate.getFullYear() > 2000) {
          const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
          underUtilized.push({...item, _daysSince: daysSince})
        }
      }

      /* Inactive tags */
      if (item.active !== undefined && item.active == 0) {
        inactiveTags.push(item)
      }
    })

    return {
      immobilized: immobilized.sort((a, b) => b._daysSince - a._daysSince).slice(0, 50),
      lowBattery: lowBattery.sort((a, b) => a._batteryLevel - b._batteryLevel).slice(0, 50),
      underUtilized: underUtilized.sort((a, b) => b._daysSince - a._daysSince).slice(0, 50),
      inactiveTags: inactiveTags.slice(0, 50),
    }
  }, [allDetailData, alertThresholds])

  const saveThresholds = (newThresholds) => {
    setAlertThresholds(newThresholds)
    localStorage.setItem('logitag_alert_thresholds', JSON.stringify(newThresholds))
    setShowAlertSettings(false)
  }

  const totalAlerts = alerts.immobilized.length + alerts.lowBattery.length + alerts.underUtilized.length + alerts.inactiveTags.length

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

  /* ── Map Assets with GPS coords ── */
  const mapAssets = useMemo(() => {
    if (!filteredDetailData.length) return []
    return filteredDetailData
      .filter(item => {
        const lat = parseFloat(item.last_lat || item.lat)
        const lng = parseFloat(item.last_lng || item.lng)
        return lat && lng && lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)
      })
      .map(item => ({
        lat: parseFloat(item.last_lat || item.lat),
        lng: parseFloat(item.last_lng || item.lng),
        name: item.reference || item.label || item.name || 'Asset',
        etat: item.etatenginname || '',
        location: item.LocationObjectname || item.enginAddress || '',
      }))
      .slice(0, 200)
  }, [filteredDetailData])

  return (
    <div className="db" data-testid="operations-monitor">
      <style>{STYLES}</style>

      {/* ── Compact Header ── */}
      <header className="db-topbar" data-testid="om-header">
        <div className="db-topbar-left">
          <div className="db-logo-mark">
            <i className="pi pi-th-large"></i>
          </div>
          <span className="db-brand">IoT Asset Tracking</span>
        </div>
        <div className="db-topbar-center" data-testid="om-period-filter">
          {[
            {key: 'all', label: 'Tout'},
            {key: 'today', label: "Aujourd'hui"},
            {key: '7d', label: '7j'},
            {key: '30d', label: '30j'},
            {key: 'custom', label: 'Dates'},
          ].map(p => (
            <button key={p.key}
              className={`db-pill ${periodFilter === p.key ? 'db-pill--on' : ''}`}
              onClick={() => setPeriodFilter(p.key)}
              data-testid={`filter-${p.key}`}
            >{p.label}</button>
          ))}
          {periodFilter === 'custom' && (
            <div className="db-dates" data-testid="custom-range">
              <input type="date" className="db-date-input" value={customRange.from}
                onChange={e => setCustomRange(r => ({...r, from: e.target.value}))} data-testid="filter-date-from" />
              <span className="db-date-sep">-</span>
              <input type="date" className="db-date-input" value={customRange.to}
                onChange={e => setCustomRange(r => ({...r, to: e.target.value}))} data-testid="filter-date-to" />
            </div>
          )}
          {periodFilter !== 'all' && filteredDetailData.length > 0 && (
            <span className="db-count-badge"><strong>{filteredDetailData.length}</strong>/{allDetailData.length}</span>
          )}
        </div>
        <div className="db-topbar-right">
          <span className="db-datetime">
            {now.toLocaleDateString('fr-FR', {weekday: 'short', day: 'numeric', month: 'short'})}
            {' '}
            {now.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
          </span>
          <button className="db-refresh" onClick={handleRefresh} data-testid="om-refresh">
            <i className="pi pi-refresh"></i>
          </button>
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <div className="db-kpi-row" data-testid="om-kpi-grid">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="db-kpi db-kpi--skel" data-testid={`kpi-skel-${i}`}>
              <div className="db-skel-block db-skel-block--title" />
              <div className="db-skel-block db-skel-block--num" />
              <div className="db-skel-block db-skel-block--label" />
              <div className="db-skel-block db-skel-block--bar" />
            </div>
          ))
        ) : (
          dashboardData.map((item, i) => {
            const color = KPI_COLORS[i % KPI_COLORS.length]
            const icon = KPI_ICONS[i % KPI_ICONS.length]
            const isActive = selectedCard?.code === item.code
            const pct = item.value ?? 0
            return (
              <div key={item.code || i}
                className={`db-kpi ${isActive ? 'db-kpi--on' : ''}`}
                onClick={() => handleSelectCard(item)}
                style={{'--kc': color}}
                data-testid={`kpi-card-${i}`}
              >
                {isActive && loadingCard && (
                  <div className="db-kpi-spin"><div className="db-spin" style={{borderTopColor: color}} /></div>
                )}
                <div className="db-kpi-head">
                  <span className="db-kpi-title">{item.quantityLabel || item.label || item.title}</span>
                  <div className="db-kpi-icon" style={{background: `${color}14`, color}}><i className={icon}></i></div>
                </div>
                <div className="db-kpi-num">{item.quantity ?? 0}</div>
                <div className="db-kpi-sub">{item.quantityLabel || item.label || item.title}</div>
                <div className="db-kpi-track">
                  <div className="db-kpi-fill" style={{width: `${Math.min(pct, 100)}%`, background: color}} />
                </div>
                {pct > 0 && (
                  <span className={`db-kpi-pct ${pct > 50 ? 'db-kpi-pct--up' : 'db-kpi-pct--dn'}`}>
                    <i className={`pi ${pct > 50 ? 'pi-arrow-up-right' : 'pi-arrow-down-right'}`}></i>{pct}%
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Detail Panel ── */}
      {selectedCard && !loadingCard && (
        <div className="db-detail" data-testid="om-detail-panel">
          <div className="db-detail-head">
            <h2 className="db-detail-title"><i className="pi pi-list"></i>{selectedCard.titledetail || selectedCard.title}</h2>
            <button className="db-detail-close" onClick={handleCloseDetail} data-testid="om-detail-close"><i className="pi pi-times"></i></button>
          </div>
          <div className="db-detail-body"><DashboardDetail /></div>
        </div>
      )}
      {selectedCard && loadingCard && (
        <div className="db-detail db-detail--loading" data-testid="om-detail-loading">
          <div className="db-detail-head"><h2 className="db-detail-title">{selectedCard.titledetail || selectedCard.title}</h2></div>
          <div className="db-detail-skel">{[...Array(4)].map((_, i) => <div key={i} className="db-skel-row" style={{animationDelay: `${i * 0.1}s`}} />)}</div>
        </div>
      )}

      {/* ── Main Split: Map + Alert Center ── */}
      <div className="db-split" data-testid="om-analytics">
        {/* LEFT: GPS Map */}
        <div className="db-card db-map-card" data-testid="om-gps-widget">
          <div className="db-card-head">
            <h3 className="db-card-title"><i className="pi pi-map" style={{color: '#10B981'}}></i>Positions en temps réel</h3>
            <span className="db-badge">{mapAssets.length} assets</span>
          </div>
          <div className="db-map-body" data-testid="om-gps-map">
            {isAnalyticsLoading ? (
              <div className="db-skel-fill" />
            ) : mapAssets.length === 0 ? (
              <div className="db-empty"><i className="pi pi-map-marker"></i>Aucune position GPS</div>
            ) : (
              <DashboardMap assets={mapAssets} />
            )}
          </div>
        </div>

        {/* RIGHT: Alert Center */}
        <div className="db-card db-alert-card" data-testid="om-alert-center">
          <div className="db-card-head">
            <div className="db-alert-head-left">
              <div className="db-bell">
                <i className="pi pi-bell"></i>
                {totalAlerts > 0 && <span className="db-bell-badge">{totalAlerts}</span>}
              </div>
              <h3 className="db-card-title">Centre d'Alertes</h3>
            </div>
            <button className="db-settings-btn" onClick={() => setShowAlertSettings(!showAlertSettings)} data-testid="alert-settings-btn">
              <i className="pi pi-cog"></i>
            </button>
          </div>

          {showAlertSettings && (
            <div className="om-alert-settings" data-testid="alert-settings-panel">
              <div className="om-alert-setting-row">
                <label className="om-alert-setting-label"><i className="pi pi-clock" style={{color: '#EF4444'}}></i>Immobilisé (jours)</label>
                <input type="number" className="om-alert-setting-input" value={alertThresholds.immobilized}
                  onChange={e => setAlertThresholds(t => ({...t, immobilized: parseInt(e.target.value) || 1}))} min="1" max="365" data-testid="threshold-immobilized" />
              </div>
              <div className="om-alert-setting-row">
                <label className="om-alert-setting-label"><i className="pi pi-bolt" style={{color: '#F59E0B'}}></i>Batterie critique (%)</label>
                <input type="number" className="om-alert-setting-input" value={alertThresholds.battery}
                  onChange={e => setAlertThresholds(t => ({...t, battery: parseInt(e.target.value) || 1}))} min="1" max="100" data-testid="threshold-battery" />
              </div>
              <div className="om-alert-setting-row">
                <label className="om-alert-setting-label"><i className="pi pi-ban" style={{color: '#8B5CF6'}}></i>Sous-utilisé (jours)</label>
                <input type="number" className="om-alert-setting-input" value={alertThresholds.inactive}
                  onChange={e => setAlertThresholds(t => ({...t, inactive: parseInt(e.target.value) || 1}))} min="1" max="365" data-testid="threshold-inactive" />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8}}>
                <button className="om-alert-setting-cancel" onClick={() => setShowAlertSettings(false)}>Annuler</button>
                <button className="om-alert-setting-save" onClick={() => saveThresholds(alertThresholds)} data-testid="save-thresholds">
                  <i className="pi pi-check" style={{fontSize: '0.7rem'}}></i> OK
                </button>
              </div>
            </div>
          )}

          <div className="db-alert-grid" data-testid="om-alert-cards">
            {[
              {key: 'immobilized', icon: 'pi pi-clock', color: '#EF4444', label: 'Immobilisés', count: alerts.immobilized.length, desc: `>${alertThresholds.immobilized}j`},
              {key: 'lowBattery', icon: 'pi pi-bolt', color: '#F59E0B', label: 'Batterie', count: alerts.lowBattery.length, desc: `<${alertThresholds.battery}%`},
              {key: 'underUtilized', icon: 'pi pi-ban', color: '#8B5CF6', label: 'Sous-utilisés', count: alerts.underUtilized.length, desc: `>${alertThresholds.inactive}j`},
              {key: 'inactiveTags', icon: 'pi pi-wifi', color: '#64748B', label: 'Tags off', count: alerts.inactiveTags.length, desc: 'Inactifs'},
            ].map(a => (
              <div key={a.key}
                className={`db-alert-item ${selectedAlert === a.key ? 'db-alert-item--on' : ''} ${a.count > 0 ? 'db-alert-item--warn' : ''}`}
                style={{'--ac': a.color}}
                onClick={() => setSelectedAlert(selectedAlert === a.key ? null : a.key)}
                data-testid={`alert-card-${a.key}`}
              >
                <div className="db-alert-ico" style={{background: `${a.color}14`, color: a.color}}><i className={a.icon}></i></div>
                <div className="db-alert-num" style={{color: a.count > 0 ? a.color : '#94A3B8'}}>{a.count}</div>
                <div className="db-alert-lbl">{a.label}</div>
                <div className="db-alert-desc">{a.desc}</div>
              </div>
            ))}
          </div>

          {selectedAlert && (
            <div className="db-alert-list" data-testid="om-alert-detail">
              <div className="db-alert-list-head">
                <strong>{selectedAlert === 'immobilized' ? 'Matériel immobilisé' : selectedAlert === 'lowBattery' ? 'Batterie critique' : selectedAlert === 'underUtilized' ? 'Sous-utilisés' : 'Tags inactifs'}</strong>
                <button className="db-close-sm" onClick={() => setSelectedAlert(null)}><i className="pi pi-times"></i></button>
              </div>
              <div className="db-alert-list-body">
                {(alerts[selectedAlert] || []).length === 0 ? (
                  <div className="db-empty-sm"><i className="pi pi-check-circle" style={{color: '#22C55E'}}></i>Aucune alerte</div>
                ) : (alerts[selectedAlert] || []).map((item, i) => (
                  <div key={i} className="db-alert-row">
                    <span className="db-alert-row-name">{item.reference || item.label || item.name || 'Asset'}</span>
                    <span className="db-alert-row-val">
                      {selectedAlert === 'immobilized' && `${item._daysSince}j`}
                      {selectedAlert === 'lowBattery' && `${item._batteryLevel}%`}
                      {selectedAlert === 'underUtilized' && `${item._daysSince}j`}
                      {selectedAlert === 'inactiveTags' && 'Off'}
                    </span>
                    <span className="db-alert-row-loc">{item.LocationObjectname || item.enginAddress || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Battery Alerts Table (compact) */}
          {!selectedAlert && analytics.batteryAlerts.length > 0 && (
            <div className="db-bat-section" data-testid="om-alert-panel">
              <div className="db-bat-head">
                <span className="db-bat-label"><i className="pi pi-exclamation-triangle" style={{color: '#EF4444', fontSize: '0.7rem'}}></i> Attention requise</span>
                <span className="db-badge db-badge--red">{analytics.batteryAlerts.length}</span>
              </div>
              <div className="db-bat-list" data-testid="om-alerts-table">
                {analytics.batteryAlerts.slice(0, 5).map((item, i) => {
                  const bat = parseInt(item.batteries, 10) || 0
                  const batColor = bat >= 50 ? '#22C55E' : bat >= 20 ? '#F59E0B' : '#EF4444'
                  return (
                    <div key={i} className="db-bat-row" data-testid={`alert-row-${i}`}>
                      <span className="db-bat-name">{item.reference || item.label || '-'}</span>
                      <div className="db-bat-bar-wrap">
                        <div className="db-bat-bar"><div className="db-bat-fill" style={{width: `${Math.min(bat, 100)}%`, background: batColor}} /></div>
                        <span style={{color: batColor, fontSize: '0.7rem', fontWeight: 700}}>{bat}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Charts Row (4 columns) ── */}
      <div className="db-charts-row">
        {/* Activity Feed */}
        <div className="db-card" data-testid="om-activity-feed">
          <div className="db-card-head">
            <h3 className="db-card-title"><i className="pi pi-clock"></i>Activité</h3>
            <span className="db-badge">{analytics.activityFeed.length}</span>
          </div>
          <div className="db-feed-body">
            {isAnalyticsLoading ? (
              [...Array(5)].map((_, i) => <div key={i} className="db-skel-row" style={{animationDelay: `${i * 0.08}s`}} />)
            ) : analytics.activityFeed.length === 0 ? (
              <div className="db-empty"><i className="pi pi-inbox"></i>Aucune activité</div>
            ) : analytics.activityFeed.slice(0, 8).map((item, i) => {
              const isExit = item.etatenginname === 'exit'
              const isEntry = item.etatenginname === 'reception'
              const etatColor = isExit ? '#EF4444' : isEntry ? '#22C55E' : '#F59E0B'
              return (
                <div key={i} className="db-feed-row" data-testid={`feed-item-${i}`}>
                  <div className="db-feed-dot" style={{background: etatColor}} />
                  <div className="db-feed-info">
                    <span className="db-feed-name">{item.reference || item.label || item.name || `#${i+1}`}</span>
                    <span className="db-feed-loc">{item.LocationObjectname || item.enginAddress || '-'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Etat Donut */}
        <div className="db-card" data-testid="om-etat-chart">
          <div className="db-card-head">
            <h3 className="db-card-title"><i className="pi pi-chart-pie"></i>Répartition État</h3>
          </div>
          <div className="db-chart-body">
            {isAnalyticsLoading ? <div className="db-skel-circle" /> : analytics.etatData.length > 0 ? (
              <Chart options={etatChartOptions} series={analytics.etatData.map(d => d.value)} type="donut" height={200} />
            ) : <div className="db-empty">Aucune donnée</div>}
          </div>
        </div>

        {/* Status Bar */}
        <div className="db-card" data-testid="om-status-chart">
          <div className="db-card-head">
            <h3 className="db-card-title"><i className="pi pi-chart-bar"></i>Statuts</h3>
          </div>
          <div className="db-chart-body">
            {isAnalyticsLoading ? <div className="db-skel-circle" style={{borderRadius: 8, height: 140}} /> : analytics.statusData.length > 0 ? (
              <Chart options={statusBarOptions} series={[{name: 'Assets', data: analytics.statusData.map(d => d.value)}]}
                type="bar" height={Math.max(140, analytics.statusData.length * 34)} width="100%" />
            ) : <div className="db-empty">Aucune donnée</div>}
          </div>
        </div>

        {/* Famille Donut */}
        <div className="db-card" data-testid="om-famille-chart">
          <div className="db-card-head">
            <h3 className="db-card-title"><i className="pi pi-sitemap"></i>Familles</h3>
          </div>
          <div className="db-chart-body">
            {isAnalyticsLoading ? <div className="db-skel-circle" /> : analytics.familleData.length > 0 ? (
              <Chart options={familleChartOptions} series={analytics.familleData.map(d => d.value)} type="donut" height={200} />
            ) : <div className="db-empty">Aucune donnée</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════ STYLES ══════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap');

/* ── Dashboard Container ── */
.db {
  padding: 16px 20px;
  font-family: 'Inter', -apple-system, sans-serif;
  background: #EEF1F5;
  min-height: 100vh;
}

/* ── Top Bar ── */
.db-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: #FFF;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  gap: 12px;
  flex-wrap: wrap;
}
.db-topbar-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.db-logo-mark {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  display: flex; align-items: center; justify-content: center;
  color: #FFF; font-size: 0.95rem;
}
.db-brand {
  font-family: 'Manrope', sans-serif; font-size: 1.05rem; font-weight: 800;
  color: #0F172A; letter-spacing: -0.02em;
}
.db-topbar-center { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; flex: 1; justify-content: center; }
.db-pill {
  padding: 5px 14px; border-radius: 8px; border: 1.5px solid #E2E8F0;
  background: #FFF; font-family: 'Inter', sans-serif; font-size: 0.74rem;
  font-weight: 600; color: #64748B; cursor: pointer; transition: all 0.15s;
  white-space: nowrap;
}
.db-pill:hover { border-color: #CBD5E1; color: #475569; }
.db-pill--on { background: #0F172A; color: #FFF; border-color: #0F172A; }
.db-dates { display: flex; align-items: center; gap: 4px; }
.db-date-input {
  padding: 4px 8px; border-radius: 6px; border: 1.5px solid #E2E8F0;
  font-size: 0.72rem; font-family: 'Inter', sans-serif; color: #0F172A;
}
.db-date-sep { color: #94A3B8; font-size: 0.7rem; }
.db-count-badge {
  font-size: 0.68rem; font-weight: 700; color: #475569;
  background: #F1F5F9; padding: 3px 8px; border-radius: 6px;
}
.db-topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.db-datetime { font-size: 0.72rem; color: #64748B; font-weight: 500; white-space: nowrap; }
.db-refresh {
  width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid #E2E8F0;
  background: #FFF; display: flex; align-items: center; justify-content: center;
  color: #64748B; cursor: pointer; transition: all 0.15s; font-size: 0.85rem;
}
.db-refresh:hover { border-color: #3B82F6; color: #3B82F6; background: #EFF6FF; }

/* ── KPI Row ── */
.db-kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 16px;
}
.db-kpi {
  background: #FFF; border-radius: 16px; padding: 18px 20px;
  border: 1.5px solid transparent; cursor: pointer;
  transition: all 0.2s; position: relative; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.db-kpi:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.07); transform: translateY(-1px); }
.db-kpi--on { border-color: var(--kc); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.db-kpi--on::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; background: var(--kc);
}
.db-kpi-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.db-kpi-title {
  font-size: 0.72rem; font-weight: 600; color: #94A3B8;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.db-kpi-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 0.95rem;
}
.db-kpi-num {
  font-family: 'Manrope', sans-serif; font-size: 2rem; font-weight: 800;
  color: #0F172A; line-height: 1; margin-bottom: 4px;
}
.db-kpi-sub { font-size: 0.72rem; color: #94A3B8; font-weight: 500; margin-bottom: 12px; }
.db-kpi-track { height: 6px; border-radius: 3px; background: #F1F5F9; overflow: hidden; }
.db-kpi-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
.db-kpi-pct {
  position: absolute; top: 18px; right: 58px;
  font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 5px;
}
.db-kpi-pct--up { background: #F0FDF4; color: #166534; }
.db-kpi-pct--dn { background: #FEF2F2; color: #991B1B; }
.db-kpi-spin { position: absolute; top: 14px; right: 14px; }
.db-spin {
  width: 16px; height: 16px; border: 2.5px solid #E2E8F0;
  border-top-color: #3B82F6; border-radius: 50%;
  animation: dbSpin 0.7s linear infinite;
}
@keyframes dbSpin { to { transform: rotate(360deg); } }

/* ── KPI Skeleton ── */
.db-kpi--skel { display: flex; flex-direction: column; gap: 10px; cursor: default; }
.db-skel-block {
  border-radius: 6px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: dbShimmer 1.5s infinite;
}
.db-skel-block--title { height: 10px; width: 60%; }
.db-skel-block--num { height: 28px; width: 45%; }
.db-skel-block--label { height: 10px; width: 80%; }
.db-skel-block--bar { height: 6px; width: 100%; border-radius: 3px; }
@keyframes dbShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Detail Panel ── */
.db-detail {
  background: #FFF; border-radius: 16px; border: 1.5px solid #E2E8F0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04); overflow: hidden;
  animation: dbSlide 0.25s ease; margin-bottom: 16px;
}
@keyframes dbSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
.db-detail-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #F1F5F9;
}
.db-detail-title {
  font-family: 'Manrope', sans-serif; font-size: 0.92rem; font-weight: 800;
  color: #0F172A; margin: 0; display: flex; align-items: center; gap: 8px;
}
.db-detail-title i { opacity: 0.4; font-size: 0.85rem; }
.db-detail-close {
  width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #E2E8F0;
  background: #FAFBFC; display: flex; align-items: center; justify-content: center;
  color: #64748B; cursor: pointer; font-size: 0.75rem; transition: all 0.12s;
}
.db-detail-close:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }
.db-detail-body { padding: 4px; }
.db-detail-skel { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.db-skel-row {
  height: 32px; border-radius: 8px;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: dbShimmer 1.5s infinite;
}

/* ── Main Split ── */
.db-split {
  display: grid; grid-template-columns: 55fr 45fr;
  gap: 14px; margin-bottom: 16px;
}

/* ── Card (generic) ── */
.db-card {
  background: #FFF; border-radius: 16px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.db-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-bottom: 1px solid #F1F5F9;
}
.db-card-title {
  font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 800;
  color: #0F172A; margin: 0; display: flex; align-items: center; gap: 7px;
}
.db-card-title i { font-size: 0.85rem; color: #64748B; }
.db-badge {
  padding: 2px 9px; border-radius: 6px; font-size: 0.68rem; font-weight: 700;
  background: #F1F5F9; color: #475569;
}
.db-badge--red { background: #FEF2F2; color: #DC2626; }

/* ── Map Card ── */
.db-map-body { height: 380px; position: relative; }
.db-map-body .leaflet-container { border-radius: 0 0 16px 16px; }

/* ── Alert Center Card ── */
.db-alert-card { display: flex; flex-direction: column; }
.db-alert-head-left { display: flex; align-items: center; gap: 10px; }
.db-bell {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  display: flex; align-items: center; justify-content: center;
  color: #D97706; font-size: 0.95rem; position: relative;
}
.db-bell-badge {
  position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px;
  border-radius: 8px; background: #EF4444; color: #FFF; font-size: 0.55rem;
  font-weight: 800; display: flex; align-items: center; justify-content: center;
  padding: 0 3px; border: 2px solid #FFF;
}
.db-settings-btn {
  width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #E2E8F0;
  background: #FFF; display: flex; align-items: center; justify-content: center;
  color: #94A3B8; cursor: pointer; font-size: 0.8rem; transition: all 0.15s;
}
.db-settings-btn:hover { border-color: #CBD5E1; color: #475569; }

.db-alert-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 0;
  border-bottom: 1px solid #F1F5F9;
}
.db-alert-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 14px 8px; cursor: pointer; transition: all 0.15s;
  border-right: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9;
  text-align: center;
}
.db-alert-item:nth-child(2n) { border-right: none; }
.db-alert-item:nth-child(n+3) { border-bottom: none; }
.db-alert-item:hover { background: #FAFBFC; }
.db-alert-item--on { background: #F8FAFC; }
.db-alert-item--on::after {
  content: ''; display: block; width: 24px; height: 2.5px;
  border-radius: 2px; background: var(--ac); margin-top: 2px;
}
.db-alert-ico {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
}
.db-alert-num { font-family: 'Manrope', sans-serif; font-size: 1.4rem; font-weight: 800; line-height: 1; }
.db-alert-lbl { font-size: 0.7rem; font-weight: 700; color: #0F172A; }
.db-alert-desc { font-size: 0.6rem; color: #94A3B8; }
.db-alert-item--warn .db-alert-ico { animation: dbPulse 2.5s infinite; }
@keyframes dbPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* Alert Detail List */
.db-alert-list { animation: dbSlide 0.2s ease; }
.db-alert-list-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; background: #F8FAFC; border-bottom: 1px solid #F1F5F9;
  font-size: 0.8rem; color: #0F172A;
}
.db-close-sm {
  width: 24px; height: 24px; border-radius: 6px; border: 1px solid #E2E8F0;
  background: #FFF; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.65rem; color: #94A3B8;
}
.db-alert-list-body { max-height: 200px; overflow-y: auto; }
.db-alert-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 16px; border-bottom: 1px solid #FAFBFC; font-size: 0.75rem;
  transition: background 0.1s;
}
.db-alert-row:hover { background: #FAFBFC; }
.db-alert-row-name { font-weight: 700; color: #0F172A; min-width: 100px; }
.db-alert-row-val {
  font-weight: 700; color: #EF4444; padding: 2px 8px;
  background: #FEF2F2; border-radius: 4px; font-size: 0.68rem;
}
.db-alert-row-loc { color: #94A3B8; font-size: 0.68rem; flex: 1; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.db-empty-sm {
  display: flex; align-items: center; gap: 6px; justify-content: center;
  padding: 20px; font-size: 0.8rem; color: #94A3B8;
}

/* Battery section */
.db-bat-section { border-top: 1px solid #F1F5F9; }
.db-bat-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; font-size: 0.72rem;
}
.db-bat-label { display: flex; align-items: center; gap: 5px; font-weight: 700; color: #475569; }
.db-bat-list { padding: 0 16px 10px; }
.db-bat-row {
  display: flex; align-items: center; gap: 10px; padding: 5px 0;
  font-size: 0.75rem;
}
.db-bat-name { font-weight: 600; color: #0F172A; min-width: 80px; }
.db-bat-bar-wrap { display: flex; align-items: center; gap: 6px; flex: 1; }
.db-bat-bar { flex: 1; height: 6px; border-radius: 3px; background: #F1F5F9; overflow: hidden; }
.db-bat-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }

/* ── Bottom Charts Row ── */
.db-charts-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.db-chart-body { padding: 10px 14px; display: flex; align-items: center; justify-content: center; min-height: 200px; }
.db-skel-circle {
  width: 140px; height: 140px; border-radius: 50%;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: dbShimmer 1.5s infinite;
}
.db-skel-fill {
  width: 100%; height: 100%;
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
  background-size: 200% 100%; animation: dbShimmer 1.5s infinite;
}
.db-empty {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 30px; color: #94A3B8; font-size: 0.78rem;
}
.db-empty i { font-size: 1.3rem; }

/* ── Activity Feed ── */
.db-feed-body { padding: 6px 0; max-height: 350px; overflow-y: auto; }
.db-feed-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 18px; transition: background 0.1s; cursor: default;
}
.db-feed-row:hover { background: #F8FAFC; }
.db-feed-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
}
.db-feed-info { flex: 1; min-width: 0; }
.db-feed-name { display: block; font-weight: 700; font-size: 0.76rem; color: #0F172A; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-feed-loc { display: block; font-size: 0.66rem; color: #94A3B8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── Responsive ── */
@media (max-width: 1200px) {
  .db-charts-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .db-split { grid-template-columns: 1fr; }
  .db-kpi-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .db { padding: 10px 12px; }
  .db-topbar { flex-direction: column; align-items: stretch; }
  .db-topbar-center { justify-content: flex-start; }
  .db-kpi-row { grid-template-columns: 1fr 1fr; }
  .db-charts-row { grid-template-columns: 1fr; }
}
`

export default DashboardListCards
