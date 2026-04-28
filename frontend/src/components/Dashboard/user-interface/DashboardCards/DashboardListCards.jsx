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
import KPIInfoPopover from './KPIInfoPopover'
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

/* ── Explanations (Navixy-style) for each KPI card.
   Mapped by index so it works regardless of backend card codes. ── */
const buildKpiInfo = (item, i, color) => {
  const label = item.quantityLabel || item.label || item.title || ''
  const quantity = item.quantity ?? 0
  const total = item.total ?? item.maxValue ?? '—'
  const pct = item.value ?? 0

  const baseInfos = [
    {
      // Card 0 — total engins
      title: `${label || 'Engins'} — Indicateur principal`,
      description: `Ce KPI représente le nombre total d'engins actuellement suivis dans votre flotte, avec un pourcentage de couverture basé sur l'activité récente.`,
      formula: `Quantité = Engins détectés\nPourcentage = (Actifs ÷ Total) × 100`,
      composition: [
        {color: color, label: 'Valeur actuelle', value: String(quantity), valueColor: color},
        {color: '#94A3B8', label: 'Total référentiel', value: String(total)},
        {color: '#22C55E', label: 'Taux de couverture', value: `${pct}%`, valueColor: '#16A34A'},
      ],
      thresholdNote: `Un taux > 70% indique une flotte saine. Entre 40-70% surveiller l'activité. Sous 40% action corrective recommandée.`,
    },
    {
      // Card 1 — alertes / anomalies
      title: `${label || 'Alertes'} — Engins en alerte`,
      description: `Nombre d'engins nécessitant une attention : batterie faible, immobilisation prolongée, perte de signal ou statut anormal.`,
      formula: `Alertes = Batterie < 20%\n        + Immobilisés > 30j\n        + Tags off > 14j\n        + Sous-utilisés`,
      composition: [
        {color: '#EF4444', label: 'Anomalies détectées', value: String(quantity), valueColor: '#DC2626'},
        {color: '#94A3B8', label: 'Total surveillé', value: String(total)},
        {color: pct > 20 ? '#EF4444' : '#F59E0B', label: 'Ratio', value: `${pct}%`, valueColor: pct > 20 ? '#DC2626' : '#D97706'},
      ],
      thresholdNote: `Un ratio < 5% est optimal. Entre 5-20% gérer les alertes en file. Au-dessus de 20% une revue est recommandée.`,
    },
    {
      // Card 2 — actifs/sur site
      title: `${label || 'Actifs'} — Engins sur site`,
      description: `Engins actuellement détectés sur un site client ou dépôt, avec signal récent et statut opérationnel.`,
      formula: `Sur site = Engins avec LocationID ≠ 0\n          ET dernier signal < 3j`,
      composition: [
        {color: '#22C55E', label: 'Engins sur site', value: String(quantity), valueColor: '#16A34A'},
        {color: '#94A3B8', label: 'Total flotte', value: String(total)},
        {color: '#3B82F6', label: 'Taux de présence', value: `${pct}%`, valueColor: '#2563EB'},
      ],
      thresholdNote: `Un taux de présence élevé (>80%) indique une flotte bien déployée et localisée.`,
    },
    {
      // Card 3 — tags
      title: `${label || 'Tags'} — Tags actifs`,
      description: `Tags IoT ayant émis un signal récemment. Indicateur clé de la santé du parc IoT et de la connectivité réseau.`,
      formula: `Tags actifs = Tags avec signal < 14j\nTaux = (Actifs ÷ Total Tags) × 100`,
      composition: [
        {color: '#8B5CF6', label: 'Tags actifs', value: String(quantity), valueColor: '#7C3AED'},
        {color: '#94A3B8', label: 'Total tags', value: String(total)},
        {color: pct > 80 ? '#22C55E' : '#F59E0B', label: 'Couverture', value: `${pct}%`, valueColor: pct > 80 ? '#16A34A' : '#D97706'},
      ],
      thresholdNote: `Couverture > 90% : excellent. 70-90% : à surveiller. < 70% : vérifier la connectivité réseau.`,
    },
  ]

  return baseInfos[i % baseInfos.length]
}

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
  const [kpiInfo, setKpiInfo] = useState(null) // {info, anchorRect}

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="dbn" data-testid="operations-monitor">
      <style>{STYLES}</style>

      {/* ══════ HERO SECTION ══════ */}
      <div className="dbn-content">
        <div className="dbn-hero">
          <div className="dbn-hero-left">
            <h1 className="dbn-hero-title">Tableau de bord</h1>
            <p className="dbn-hero-sub">
              {now.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
            </p>
          </div>
          <div className="dbn-hero-right">
            <div className="dbn-filter-bar" data-testid="om-period-filter">
              {[
                {key: 'all', label: 'Tout', icon: ''},
                {key: 'today', label: "Aujourd'hui", icon: ''},
                {key: '7d', label: '7 jours', icon: ''},
                {key: '30d', label: '30 jours', icon: ''},
                {key: 'custom', label: 'Dates', icon: 'pi pi-calendar'},
              ].map(p => (
                <button key={p.key} className={`dbn-filter ${periodFilter === p.key ? 'dbn-filter--on' : ''}`}
                  onClick={() => setPeriodFilter(p.key)} data-testid={`filter-${p.key}`}>
                  {p.icon && <i className={p.icon} style={{fontSize: '0.72rem'}}></i>}{p.label}
                </button>
              ))}
            </div>
            {periodFilter === 'custom' && (
              <div className="dbn-dates" data-testid="custom-range">
                <input type="date" value={customRange.from} onChange={e => setCustomRange(r => ({...r, from: e.target.value}))} data-testid="filter-date-from" />
                <span>-</span>
                <input type="date" value={customRange.to} onChange={e => setCustomRange(r => ({...r, to: e.target.value}))} data-testid="filter-date-to" />
              </div>
            )}
            <button className="dbn-refresh" onClick={handleRefresh} data-testid="om-refresh">
              <i className="pi pi-refresh"></i>Actualiser
            </button>
          </div>
        </div>

        {/* ══════ KPI CARDS ══════ */}
        <div className="dbn-kpi-row" data-testid="om-kpi-grid">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="dbn-kpi dbn-kpi--skel" data-testid={`kpi-skel-${i}`}>
                <div className="dbn-skel dbn-skel--sm" /><div className="dbn-skel dbn-skel--lg" /><div className="dbn-skel dbn-skel--md" /><div className="dbn-skel dbn-skel--bar" />
              </div>
            ))
          ) : dashboardData.map((item, i) => {
            const color = KPI_COLORS[i % KPI_COLORS.length]
            const icon = KPI_ICONS[i % KPI_ICONS.length]
            const isActive = selectedCard?.code === item.code
            const pct = item.value ?? 0
            return (
              <div key={item.code || i} className={`dbn-kpi ${isActive ? 'dbn-kpi--on' : ''}`}
                onClick={() => handleSelectCard(item)} style={{'--kc': color}} data-testid={`kpi-card-${i}`}>
                <div className="dbn-kpi-top">
                  <div className="dbn-kpi-ico" style={{background: `${color}12`, color}}><i className={icon}></i></div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                    {pct > 0 && <span className={`dbn-kpi-trend ${pct > 50 ? 'dbn-kpi-trend--up' : 'dbn-kpi-trend--dn'}`}>
                      <i className={`pi ${pct > 50 ? 'pi-arrow-up-right' : 'pi-arrow-down-right'}`}></i>{pct}%
                    </span>}
                    <button
                      type='button'
                      className='dbn-kpi-info-btn'
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        setKpiInfo({info: buildKpiInfo(item, i, color), anchorRect: rect})
                      }}
                      aria-label='Explication'
                      data-testid={`kpi-info-btn-${i}`}
                    >
                      <i className='pi pi-info-circle' />
                    </button>
                  </div>
                </div>
                <div className="dbn-kpi-val">{item.quantity ?? 0}</div>
                <div className="dbn-kpi-label">{item.quantityLabel || item.label || item.title}</div>
                <div className="dbn-kpi-bar"><div className="dbn-kpi-fill" style={{width: `${Math.min(pct, 100)}%`, background: color}} /></div>
                {isActive && <div className="dbn-kpi-accent" style={{background: color}} />}
                {isActive && loadingCard && <div className="dbn-kpi-spin"><div className="dbn-spin" style={{borderTopColor: color}} /></div>}
              </div>
            )
          })}
        </div>

        {/* Detail Panel */}
        {selectedCard && !loadingCard && (
          <div className="dbn-detail" data-testid="om-detail-panel">
            <div className="dbn-detail-head">
              <h2 className="dbn-detail-title"><i className="pi pi-list"></i>{selectedCard.titledetail || selectedCard.title}</h2>
              <button className="dbn-close" onClick={handleCloseDetail} data-testid="om-detail-close"><i className="pi pi-times"></i></button>
            </div>
            <div style={{padding: 4}}><DashboardDetail /></div>
          </div>
        )}
        {selectedCard && loadingCard && (
          <div className="dbn-detail" data-testid="om-detail-loading">
            <div className="dbn-detail-head"><h2 className="dbn-detail-title">{selectedCard.titledetail || selectedCard.title}</h2></div>
            <div style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 10}}>{[...Array(4)].map((_, i) => <div key={i} className="dbn-skel dbn-skel--row" style={{animationDelay: `${i*0.1}s`}} />)}</div>
          </div>
        )}

        {/* ══════ MAIN GRID: Map + Alerts ══════ */}
        <div className="dbn-grid-main" data-testid="om-analytics">
          {/* Map */}
          <div className="dbn-card dbn-card--map" data-testid="om-gps-widget">
            <div className="dbn-card-head">
              <h3 className="dbn-card-title"><i className="pi pi-map" style={{color: '#10B981'}}></i>Carte des assets en temps réel</h3>
              <span className="dbn-badge">{mapAssets.length} positionnés</span>
            </div>
            <div className="dbn-map-wrap" data-testid="om-gps-map">
              {isAnalyticsLoading ? <div className="dbn-skel dbn-skel--fill" /> : mapAssets.length === 0 ? (
                <div className="dbn-empty"><i className="pi pi-map-marker"></i>Aucune position GPS</div>
              ) : <DashboardMap assets={mapAssets} />}
            </div>
          </div>

          {/* Alert Center */}
          <div className="dbn-card" data-testid="om-alert-center">
            <div className="dbn-card-head">
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <div className="dbn-bell"><i className="pi pi-bell"></i>{totalAlerts > 0 && <span className="dbn-bell-dot">{totalAlerts}</span>}</div>
                <h3 className="dbn-card-title">Centre d'alertes</h3>
              </div>
              <button className="dbn-icon-btn" onClick={() => setShowAlertSettings(!showAlertSettings)} data-testid="alert-settings-btn"><i className="pi pi-cog"></i></button>
            </div>

            {showAlertSettings && (
              <div className="om-alert-settings" data-testid="alert-settings-panel">
                <div className="om-alert-setting-row"><label className="om-alert-setting-label"><i className="pi pi-clock" style={{color: '#EF4444'}}></i>Immobilisé (jours)</label><input type="number" className="om-alert-setting-input" value={alertThresholds.immobilized} onChange={e => setAlertThresholds(t => ({...t, immobilized: parseInt(e.target.value) || 1}))} min="1" max="365" data-testid="threshold-immobilized" /></div>
                <div className="om-alert-setting-row"><label className="om-alert-setting-label"><i className="pi pi-bolt" style={{color: '#F59E0B'}}></i>Batterie (%)</label><input type="number" className="om-alert-setting-input" value={alertThresholds.battery} onChange={e => setAlertThresholds(t => ({...t, battery: parseInt(e.target.value) || 1}))} min="1" max="100" data-testid="threshold-battery" /></div>
                <div className="om-alert-setting-row"><label className="om-alert-setting-label"><i className="pi pi-ban" style={{color: '#8B5CF6'}}></i>Sous-utilisé (jours)</label><input type="number" className="om-alert-setting-input" value={alertThresholds.inactive} onChange={e => setAlertThresholds(t => ({...t, inactive: parseInt(e.target.value) || 1}))} min="1" max="365" data-testid="threshold-inactive" /></div>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8}}><button className="om-alert-setting-cancel" onClick={() => setShowAlertSettings(false)}>Annuler</button><button className="om-alert-setting-save" onClick={() => saveThresholds(alertThresholds)} data-testid="save-thresholds"><i className="pi pi-check" style={{fontSize: '0.7rem'}}></i> OK</button></div>
              </div>
            )}

            <div className="dbn-alert-grid" data-testid="om-alert-cards">
              {[
                {key: 'immobilized', icon: 'pi pi-clock', color: '#EF4444', label: 'Immobilisés', count: alerts.immobilized.length, desc: `>${alertThresholds.immobilized}j`,
                  info: {
                    title: 'Immobilisés — Engins inactifs',
                    description: `Engins n'ayant émis aucun signal GPS ou balise sur une période prolongée. Peut indiquer : engin hors service, batterie morte, tag arraché, ou asset oublié sur site client.`,
                    formula: `Immobilisés = Engins avec\n  lastSeenAt > ${alertThresholds.immobilized} jours`,
                    composition: [
                      {color: '#EF4444', label: 'Immobilisés détectés', value: String(alerts.immobilized.length), valueColor: '#DC2626'},
                      {color: '#94A3B8', label: `Seuil d'alerte`, value: `> ${alertThresholds.immobilized} jours`},
                    ],
                    thresholdNote: `Vérifier physiquement les engins listés. Contacter le client si l'engin est resté sur site > 60j.`,
                  }},
                {key: 'lowBattery', icon: 'pi pi-bolt', color: '#F59E0B', label: 'Batterie', count: alerts.lowBattery.length, desc: `<${alertThresholds.battery}%`,
                  info: {
                    title: 'Batterie — Charge faible',
                    description: `Tags IoT dont la batterie est critique. Sans intervention, l'asset sera invisible dans les prochaines 24-72h.`,
                    formula: `Batterie faible = Tags avec\n  niveau batterie < ${alertThresholds.battery}%`,
                    composition: [
                      {color: '#F59E0B', label: 'Tags à remplacer', value: String(alerts.lowBattery.length), valueColor: '#D97706'},
                      {color: '#94A3B8', label: `Seuil d'alerte`, value: `< ${alertThresholds.battery}%`},
                    ],
                    thresholdNote: `Prévoir une tournée de remplacement batterie. Sous 10% la perte de signal est imminente.`,
                  }},
                {key: 'underUtilized', icon: 'pi pi-ban', color: '#8B5CF6', label: 'Sous-utilisés', count: alerts.underUtilized.length, desc: `>${alertThresholds.inactive}j`,
                  info: {
                    title: 'Sous-utilisés — Flotte dormante',
                    description: `Engins présents dans la flotte mais peu sollicités sur la période (peu de changements de position/statut). Optimisation possible.`,
                    formula: `Sous-utilisés = Engins avec\n  inactivité > ${alertThresholds.inactive} jours`,
                    composition: [
                      {color: '#8B5CF6', label: 'Engins dormants', value: String(alerts.underUtilized.length), valueColor: '#7C3AED'},
                      {color: '#94A3B8', label: `Seuil d'alerte`, value: `> ${alertThresholds.inactive} jours`},
                    ],
                    thresholdNote: `Envisager de redéployer ces engins sur d'autres sites ou de réduire la flotte.`,
                  }},
                {key: 'inactiveTags', icon: 'pi pi-wifi', color: '#64748B', label: 'Tags off', count: alerts.inactiveTags.length, desc: 'Inactifs',
                  info: {
                    title: 'Tags off — Connectivité perdue',
                    description: `Tags IoT n'ayant plus émis depuis une période anormalement longue. Causes possibles : panne matérielle, tag détruit, hors couverture réseau.`,
                    formula: `Tags off = Tags avec\n  dernière émission > 14j`,
                    composition: [
                      {color: '#64748B', label: 'Tags inactifs', value: String(alerts.inactiveTags.length), valueColor: '#475569'},
                      {color: '#94A3B8', label: `Seuil`, value: `> 14 jours`},
                    ],
                    thresholdNote: `Contrôler physiquement le tag. Couverture réseau ≠ batterie → vérifier les 2.`,
                  }},
              ].map(a => (
                <div key={a.key} className={`dbn-alert-item ${selectedAlert === a.key ? 'dbn-alert-item--on' : ''} ${a.count > 0 ? 'dbn-alert-item--warn' : ''}`}
                  style={{'--ac': a.color, position: 'relative'}} onClick={() => setSelectedAlert(selectedAlert === a.key ? null : a.key)} data-testid={`alert-card-${a.key}`}>
                  <button
                    type='button'
                    className='dbn-alert-info-btn'
                    onClick={(e) => {
                      e.stopPropagation()
                      const rect = e.currentTarget.getBoundingClientRect()
                      setKpiInfo({info: a.info, anchorRect: rect})
                    }}
                    aria-label='Explication'
                    data-testid={`alert-info-btn-${a.key}`}
                  >
                    <i className='pi pi-info-circle' />
                  </button>
                  <div className="dbn-alert-ico" style={{background: `${a.color}12`, color: a.color}}><i className={a.icon}></i></div>
                  <div className="dbn-alert-num" style={{color: a.count > 0 ? a.color : '#CBD5E1'}}>{a.count}</div>
                  <div className="dbn-alert-lbl">{a.label}</div>
                  <div className="dbn-alert-desc">{a.desc}</div>
                </div>
              ))}
            </div>

            {selectedAlert && (
              <div className="dbn-alert-list" data-testid="om-alert-detail">
                <div className="dbn-alert-list-head"><strong>{selectedAlert === 'immobilized' ? 'Immobilisés' : selectedAlert === 'lowBattery' ? 'Batterie critique' : selectedAlert === 'underUtilized' ? 'Sous-utilisés' : 'Tags inactifs'}</strong>
                  <button className="dbn-close-sm" onClick={() => setSelectedAlert(null)}><i className="pi pi-times"></i></button></div>
                <div className="dbn-alert-list-body">
                  {(alerts[selectedAlert] || []).length === 0 ? <div className="dbn-empty-sm"><i className="pi pi-check-circle" style={{color: '#22C55E'}}></i>RAS</div> :
                  (alerts[selectedAlert] || []).map((item, i) => (
                    <div key={i} className="dbn-alert-row">
                      <span className="dbn-alert-row-name">{item.reference || item.label || item.name || 'Asset'}</span>
                      <span className="dbn-alert-row-val">{selectedAlert === 'immobilized' ? `${item._daysSince}j` : selectedAlert === 'lowBattery' ? `${item._batteryLevel}%` : selectedAlert === 'underUtilized' ? `${item._daysSince}j` : 'Off'}</span>
                      <span className="dbn-alert-row-loc">{item.LocationObjectname || item.enginAddress || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!selectedAlert && analytics.batteryAlerts.length > 0 && (
              <div className="dbn-bat-section" data-testid="om-alert-panel">
                <div className="dbn-bat-head"><span className="dbn-bat-label"><i className="pi pi-exclamation-triangle" style={{color: '#EF4444', fontSize: '0.7rem'}}></i> Attention requise</span><span className="dbn-badge dbn-badge--red">{analytics.batteryAlerts.length}</span></div>
                <div className="dbn-bat-list" data-testid="om-alerts-table">
                  {analytics.batteryAlerts.slice(0, 5).map((item, i) => {
                    const bat = parseInt(item.batteries, 10) || 0
                    const batColor = bat >= 50 ? '#22C55E' : bat >= 20 ? '#F59E0B' : '#EF4444'
                    return (<div key={i} className="dbn-bat-row" data-testid={`alert-row-${i}`}><span className="dbn-bat-name">{item.reference || item.label || '-'}</span><div className="dbn-bat-bar-w"><div className="dbn-bat-bar"><div style={{width: `${Math.min(bat,100)}%`, height: '100%', borderRadius: 3, background: batColor}} /></div><span style={{color: batColor, fontSize: '0.7rem', fontWeight: 700}}>{bat}%</span></div></div>)
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════ ANALYTICS ROW ══════ */}
        <div className="dbn-grid-analytics">
          {/* Activity Feed */}
          <div className="dbn-card" data-testid="om-activity-feed">
            <div className="dbn-card-head"><h3 className="dbn-card-title"><i className="pi pi-clock"></i>Activité récente</h3><span className="dbn-badge">{analytics.activityFeed.length}</span></div>
            <div className="dbn-feed">
              {isAnalyticsLoading ? [...Array(5)].map((_, i) => <div key={i} className="dbn-skel dbn-skel--row" style={{animationDelay: `${i*0.08}s`}} />) :
              analytics.activityFeed.length === 0 ? <div className="dbn-empty"><i className="pi pi-inbox"></i>Aucune activité</div> :
              analytics.activityFeed.slice(0, 8).map((item, i) => {
                const isExit = item.etatenginname === 'exit'
                const isEntry = item.etatenginname === 'reception'
                const ec = isExit ? '#EF4444' : isEntry ? '#22C55E' : '#F59E0B'
                return (<div key={i} className="dbn-feed-row" data-testid={`feed-item-${i}`}>
                  <div className="dbn-feed-dot" style={{background: ec}} />
                  <div className="dbn-feed-info"><span className="dbn-feed-name">{item.reference || item.label || item.name || `#${i+1}`}</span><span className="dbn-feed-loc">{item.LocationObjectname || item.enginAddress || '-'}</span></div>
                </div>)
              })}
            </div>
          </div>

          {/* Etat Donut */}
          <div className="dbn-card" data-testid="om-etat-chart">
            <div className="dbn-card-head">
              <h3 className="dbn-card-title"><i className="pi pi-chart-pie"></i>État des assets</h3>
              <button
                type='button'
                className='dbn-card-info-btn'
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const total = analytics.etatData.reduce((s, d) => s + (Number(d.value) || 0), 0)
                  const comp = analytics.etatData.map((d, i) => ({
                    color: ['#22C55E', '#F59E0B', '#EF4444', '#94A3B8', '#8B5CF6'][i % 5],
                    label: d.label || d.name || `État ${i + 1}`,
                    value: `${d.value} (${total ? Math.round((d.value / total) * 100) : 0}%)`,
                  }))
                  setKpiInfo({info: {
                    title: 'État des assets — Santé globale du parc',
                    description: `Vue synthétique de l'état opérationnel du parc. Aide à identifier en un coup d'œil la part d'assets en bonne santé vs ceux nécessitant une intervention.`,
                    formula: `Répartition selon l'état physique actuel\n  de chaque engin (détecté, signalé,\n  maintenance, hors service, etc.)`,
                    composition: comp.length > 0 ? comp : [{color: '#94A3B8', label: 'Aucune donnée', value: '—'}],
                    thresholdNote: `Un parc en bon état a >70% d'engins actifs/détectés. Surveiller les catégories en alerte pour anticiper les interventions.`,
                  }, anchorRect: rect})
                }}
                aria-label='Explication'
                data-testid='widget-info-etat'
              ><i className='pi pi-info-circle' /></button>
            </div>
            <div className="dbn-chart-body">
              {isAnalyticsLoading ? <div className="dbn-skel dbn-skel--circle" /> : analytics.etatData.length > 0 ? <Chart options={etatChartOptions} series={analytics.etatData.map(d => d.value)} type="donut" height={210} /> : <div className="dbn-empty">Aucune donnée</div>}
            </div>
          </div>

          {/* Status Bar */}
          <div className="dbn-card" data-testid="om-status-chart">
            <div className="dbn-card-head">
              <h3 className="dbn-card-title"><i className="pi pi-chart-bar"></i>Distribution statuts</h3>
              <button
                type='button'
                className='dbn-card-info-btn'
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const sorted = [...analytics.statusData].sort((a, b) => (b.value || 0) - (a.value || 0))
                  const total = sorted.reduce((s, d) => s + (Number(d.value) || 0), 0)
                  const top = sorted[0]
                  const comp = sorted.slice(0, 6).map((d, i) => ({
                    color: ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#94A3B8'][i % 6],
                    label: d.label || d.name || `Statut ${i + 1}`,
                    value: `${d.value} (${total ? Math.round((d.value / total) * 100) : 0}%)`,
                  }))
                  setKpiInfo({info: {
                    title: 'Distribution statuts — Flux opérationnel',
                    description: `Répartition des engins selon leur statut opérationnel actuel. Permet de détecter des goulots d'étranglement (trop d'engins en panne, en maintenance ou réservés sans livraison).`,
                    formula: `Groupement par statut (Disponible,\n  Livré, Réservé, En panne,\n  Maintenance, etc.)`,
                    composition: comp.length > 0 ? comp : [{color: '#94A3B8', label: 'Aucune donnée', value: '—'}],
                    thresholdNote: top ? `Statut dominant : "${top.label || top.name}" (${top.value}). Un pic sur "En panne" ou "Maintenance" signale qu'une tournée d'intervention est recommandée.` : `Lecture : ratio Livré / Disponible reflète l'efficacité commerciale.`,
                  }, anchorRect: rect})
                }}
                aria-label='Explication'
                data-testid='widget-info-status'
              ><i className='pi pi-info-circle' /></button>
            </div>
            <div className="dbn-chart-body">
              {isAnalyticsLoading ? <div className="dbn-skel dbn-skel--circle" style={{borderRadius: 8, height: 140}} /> : analytics.statusData.length > 0 ? <Chart options={statusBarOptions} series={[{name: 'Assets', data: analytics.statusData.map(d => d.value)}]} type="bar" height={Math.max(140, analytics.statusData.length * 34)} width="100%" /> : <div className="dbn-empty">Aucune donnée</div>}
            </div>
          </div>

          {/* Famille Donut */}
          <div className="dbn-card" data-testid="om-famille-chart">
            <div className="dbn-card-head">
              <h3 className="dbn-card-title"><i className="pi pi-sitemap"></i>Familles</h3>
              <button
                type='button'
                className='dbn-card-info-btn'
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const sorted = [...analytics.familleData].sort((a, b) => (b.value || 0) - (a.value || 0))
                  const total = sorted.reduce((s, d) => s + (Number(d.value) || 0), 0)
                  const top = sorted[0]
                  const under = sorted[sorted.length - 1]
                  const comp = sorted.slice(0, 6).map((d, i) => ({
                    color: ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#64748B'][i % 6],
                    label: d.label || d.name || `Famille ${i + 1}`,
                    value: `${d.value} (${total ? Math.round((d.value / total) * 100) : 0}%)`,
                  }))
                  setKpiInfo({info: {
                    title: 'Familles — Répartition du parc par type',
                    description: `Distribution des engins par famille (Compacteur, Remorque, PC, Tag…). Permet d'évaluer la diversité du parc et d'identifier les familles sous-représentées pour un investissement futur.`,
                    formula: `Groupement par attribut "famille"\n  depuis le référentiel engins`,
                    composition: comp.length > 0 ? comp : [{color: '#94A3B8', label: 'Aucune donnée', value: '—'}],
                    thresholdNote: top && under && top !== under
                      ? `Top famille : "${top.label || top.name}" (${top.value}). Opportunité : la famille "${under.label || under.name}" est la moins représentée — si elle performe bien chez les clients actifs, envisager un upsell ciblé.`
                      : `Le parc est concentré sur peu de familles. Diversifier peut ouvrir de nouveaux segments clients.`,
                  }, anchorRect: rect})
                }}
                aria-label='Explication'
                data-testid='widget-info-famille'
              ><i className='pi pi-info-circle' /></button>
            </div>
            <div className="dbn-chart-body">
              {isAnalyticsLoading ? <div className="dbn-skel dbn-skel--circle" /> : analytics.familleData.length > 0 ? <Chart options={familleChartOptions} series={analytics.familleData.map(d => d.value)} type="donut" height={210} /> : <div className="dbn-empty">Aucune donnée</div>}
            </div>
          </div>
        </div>
      </div>
      <KPIInfoPopover
        open={!!kpiInfo}
        onClose={() => setKpiInfo(null)}
        anchorRect={kpiInfo?.anchorRect}
        title={kpiInfo?.info?.title}
        description={kpiInfo?.info?.description}
        formula={kpiInfo?.info?.formula}
        composition={kpiInfo?.info?.composition}
        thresholdNote={kpiInfo?.info?.thresholdNote}
      />
    </div>
  )
}

/* ══════════════ STYLES ══════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

/* KPI info button + popover (Navixy-style) */
.dbn-kpi-info-btn {
  width: 30px; height: 30px; border: 0; background: transparent;
  color: #94A3B8; border-radius: 8px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}
.dbn-kpi-info-btn:hover { background: #EFF6FF; color: #1D4ED8; }
.dbn-kpi-info-btn i { font-size: 1.05rem; }

.kpi-info-pop {
  position: fixed; z-index: 10000;
  width: 360px; max-width: calc(100vw - 24px);
  background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18), 0 4px 8px rgba(15, 23, 42, 0.05);
  padding: 16px 18px 14px;
  font-family: 'Inter', sans-serif;
  animation: kpi-info-pop-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes kpi-info-pop-in {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.kpi-info-pop-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; margin-bottom: 6px;
}
.kpi-info-pop-title {
  font-family: 'Manrope', sans-serif; font-size: 0.98rem;
  font-weight: 800; color: #0F172A; letter-spacing: -0.015em;
  line-height: 1.3; margin: 0; flex: 1;
}
.kpi-info-pop-close {
  width: 24px; height: 24px; border: 0; background: transparent;
  color: #64748B; border-radius: 6px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, color 0.15s ease; flex-shrink: 0;
}
.kpi-info-pop-close:hover { background: #F1F5F9; color: #0F172A; }
.kpi-info-pop-close i { font-size: 0.78rem; }

.kpi-info-pop-desc {
  font-size: 0.84rem; color: #475569; line-height: 1.5;
  margin: 0 0 12px;
}

.kpi-info-pop-section { margin-bottom: 10px; }
.kpi-info-pop-label {
  font-size: 0.66rem; color: #94A3B8; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px;
}
.kpi-info-pop-formula {
  font-family: 'JetBrains Mono', 'Menlo', 'Monaco', monospace;
  font-size: 0.78rem; color: #0F172A; background: #F8FAFC;
  border: 1px solid #E2E8F0; border-radius: 8px;
  padding: 10px 12px; margin: 0;
  white-space: pre-wrap; word-break: break-word; line-height: 1.5;
}

.kpi-info-pop-comp { list-style: none; margin: 0; padding: 0; }
.kpi-info-pop-comp-row {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 0; border-bottom: 1px solid #F1F5F9;
  font-size: 0.82rem;
}
.kpi-info-pop-comp-row:last-child { border-bottom: 0; }
.kpi-info-pop-comp-dot {
  width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.04);
}
.kpi-info-pop-comp-lbl { flex: 1; color: #334155; font-weight: 500; }
.kpi-info-pop-comp-val { font-weight: 700; color: #0F172A; font-variant-numeric: tabular-nums; }

.kpi-info-pop-note {
  display: flex; gap: 8px; align-items: flex-start;
  background: #EFF6FF; border: 1px solid #BFDBFE;
  color: #1E40AF; border-radius: 8px;
  padding: 10px 12px; margin-top: 12px;
  font-size: 0.78rem; line-height: 1.5;
}
.kpi-info-pop-note i { color: #2563EB; flex-shrink: 0; margin-top: 2px; font-size: 0.82rem; }

/* ── Base ── */
.dbn { font-family: 'Inter', -apple-system, sans-serif; background: #F1F5F9; min-height: 100vh; }

/* ══════ CONTENT ══════ */
.dbn-content { max-width: 1440px; margin: 0 auto; padding: 12px 20px 24px; }

/* ══════ HERO ══════ */
.dbn-hero { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 14px; gap: 12px; flex-wrap: wrap; }
.dbn-hero-title { font-family: 'Manrope', sans-serif; font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.02em; }
.dbn-hero-sub { font-size: 0.78rem; color: #64748B; margin: 2px 0 0; }
.dbn-hero-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dbn-filter-bar {
  display: inline-flex; gap: 2px;
  background: #F1F5F9;
  border-radius: 10px;
  padding: 4px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
}
.dbn-filter {
  padding: 7px 14px; border-radius: 8px; border: none; background: transparent;
  font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600; color: #64748B;
  cursor: pointer; transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  display: flex; align-items: center; gap: 5px; white-space: nowrap; letter-spacing: -0.005em;
}
.dbn-filter:hover:not(.dbn-filter--on) { color: #0F172A; background: rgba(255,255,255,0.65); }
.dbn-filter--on {
  background: #FFFFFF;
  color: #1D4ED8;
  box-shadow: 0 2px 6px rgba(29, 78, 216, 0.14), 0 0 0 1.5px rgba(29, 78, 216, 0.35);
  font-weight: 700;
}
.dbn-filter--on i { color: #1D4ED8; }
.dbn-dates {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 8px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  height: 38px;
}
.dbn-dates input {
  padding: 6px 10px; border-radius: 7px; border: 1px solid transparent;
  background: #F8FAFC;
  font-size: 0.78rem; font-family: 'Inter', sans-serif; color: #0F172A; font-weight: 500;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.dbn-dates input:hover { background: #F1F5F9; }
.dbn-dates input:focus { outline: none; border-color: #1D4ED8; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.10); }
.dbn-dates span { color: #94A3B8; font-size: 0.72rem; font-weight: 600; }
.dbn-refresh {
  display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 10px;
  border: 0; background: #1D4ED8; font-family: 'Inter', sans-serif;
  font-size: 0.8rem; font-weight: 600; color: #FFFFFF; cursor: pointer; height: 38px;
  box-shadow: 0 1px 3px rgba(29, 78, 216, 0.35), 0 1px 2px rgba(15, 23, 42, 0.06);
  transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  letter-spacing: -0.005em;
}
.dbn-refresh:hover { background: #1E40AF; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(29, 78, 216, 0.35), 0 1px 2px rgba(15, 23, 42, 0.06); }
.dbn-refresh:active { transform: translateY(0); }
.dbn-refresh i { font-size: 0.78rem; }

/* ══════ KPI ROW ══════ */
.dbn-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 14px; }
.dbn-kpi {
  background: #FFF; border-radius: 12px; padding: 16px 18px; cursor: pointer;
  transition: all 0.2s; position: relative; overflow: hidden;
  border: 1.5px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.dbn-kpi:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); transform: translateY(-2px); }
.dbn-kpi--on { border-color: var(--kc); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.dbn-kpi-accent { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }
.dbn-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.dbn-kpi-ico { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; }
.dbn-kpi-trend { font-size: 0.85rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; display: flex; align-items: center; gap: 4px; }
.dbn-kpi-trend--up { background: #F0FDF4; color: #166534; }
.dbn-kpi-trend--dn { background: #FEF2F2; color: #991B1B; }
.dbn-kpi-val { font-family: 'Manrope', sans-serif; font-size: 2rem; font-weight: 800; color: #0F172A; line-height: 1; letter-spacing: -0.03em; }
.dbn-kpi-label { font-size: 0.95rem; color: #475569; font-weight: 600; margin: 8px 0 14px; letter-spacing: -0.005em; }
.dbn-kpi-bar { height: 5px; border-radius: 3px; background: #F1F5F9; overflow: hidden; }
.dbn-kpi-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
.dbn-kpi-spin { position: absolute; top: 16px; right: 16px; }
.dbn-spin { width: 16px; height: 16px; border: 2.5px solid #E2E8F0; border-top-color: #3B82F6; border-radius: 50%; animation: dbnSpin 0.7s linear infinite; }
@keyframes dbnSpin { to { transform: rotate(360deg); } }

/* ── KPI Skeleton ── */
.dbn-kpi--skel { display: flex; flex-direction: column; gap: 10px; cursor: default; }
.dbn-skel { border-radius: 6px; background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%); background-size: 200% 100%; animation: dbnShim 1.5s infinite; }
.dbn-skel--sm { height: 10px; width: 50%; }
.dbn-skel--md { height: 10px; width: 80%; }
.dbn-skel--lg { height: 28px; width: 45%; }
.dbn-skel--bar { height: 5px; width: 100%; border-radius: 3px; }
.dbn-skel--row { height: 32px; border-radius: 8px; }
.dbn-skel--fill { width: 100%; height: 100%; }
.dbn-skel--circle { width: 140px; height: 140px; border-radius: 50%; margin: 20px auto; }
@keyframes dbnShim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ══════ DETAIL PANEL ══════ */
.dbn-detail { background: #FFF; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; animation: dbnSlide 0.25s ease; margin-bottom: 14px; }
@keyframes dbnSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.dbn-detail-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid #F1F5F9; }
.dbn-detail-title { font-family: 'Manrope', sans-serif; font-size: 0.95rem; font-weight: 800; color: #0F172A; margin: 0; display: flex; align-items: center; gap: 8px; }
.dbn-detail-title i { opacity: 0.4; font-size: 0.82rem; }
.dbn-close { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FAFBFC; display: flex; align-items: center; justify-content: center; color: #64748B; cursor: pointer; font-size: 0.75rem; }
.dbn-close:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }

/* ══════ MAIN GRID ══════ */
.dbn-grid-main { display: grid; grid-template-columns: 60fr 40fr; gap: 12px; margin-bottom: 14px; }

/* ══════ CARD ══════ */
.dbn-card { background: #FFF; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden; }
.dbn-card-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #F1F5F9; }
.dbn-card-title { font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 800; color: #0F172A; margin: 0; display: flex; align-items: center; gap: 7px; }
.dbn-card-title i { font-size: 0.88rem; color: #64748B; }
.dbn-card-info-btn {
  width: 28px; height: 28px; border: 0; background: transparent;
  color: #94A3B8; border-radius: 7px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}
.dbn-card-info-btn:hover { background: #EFF6FF; color: #1D4ED8; }
.dbn-card-info-btn i { font-size: 0.92rem; }
.dbn-badge { padding: 2px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; background: #F1F5F9; color: #475569; }
.dbn-badge--red { background: #FEF2F2; color: #DC2626; }

/* Map */
.dbn-card--map { min-height: 340px; }
.dbn-map-wrap { height: 340px; position: relative; }
.dbn-map-wrap .leaflet-container { border-radius: 0 0 12px 12px; }

/* Bell */
.dbn-bell { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg, #FEF3C7, #FDE68A); display: flex; align-items: center; justify-content: center; color: #D97706; font-size: 0.95rem; position: relative; }
.dbn-bell-dot { position: absolute; top: -3px; right: -3px; min-width: 16px; height: 16px; border-radius: 8px; background: #EF4444; color: #FFF; font-size: 0.5rem; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid #FFF; }
.dbn-icon-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFF; display: flex; align-items: center; justify-content: center; color: #94A3B8; cursor: pointer; font-size: 0.8rem; }
.dbn-icon-btn:hover { border-color: #CBD5E1; color: #475569; }

/* Alert Grid */
.dbn-alert-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; border-bottom: 1px solid #F1F5F9; }
.dbn-alert-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 8px; cursor: pointer; transition: all 0.12s; border-right: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9; text-align: center; }
.dbn-alert-item:nth-child(2n) { border-right: none; }
.dbn-alert-item:nth-child(n+3) { border-bottom: none; }
.dbn-alert-item:hover { background: #FAFBFC; }
.dbn-alert-item--on { background: #F8FAFC; }
.dbn-alert-item--on::after { content: ''; display: block; width: 24px; height: 2.5px; border-radius: 2px; background: var(--ac); margin-top: 2px; }
.dbn-alert-ico { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.dbn-alert-num { font-family: 'Manrope', sans-serif; font-size: 1.9rem; font-weight: 800; line-height: 1; letter-spacing: -0.03em; margin-top: 4px; }
.dbn-alert-lbl { font-size: 0.92rem; font-weight: 700; color: #0F172A; letter-spacing: -0.005em; margin-top: 4px; }
.dbn-alert-desc { font-size: 0.76rem; color: #64748B; font-weight: 500; }
.dbn-alert-item--warn .dbn-alert-ico { animation: dbnPulse 2.5s infinite; }
.dbn-alert-info-btn {
  position: absolute; top: 8px; right: 8px;
  width: 26px; height: 26px; border: 0; background: transparent;
  color: #CBD5E1; border-radius: 7px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
  z-index: 1;
}
.dbn-alert-info-btn:hover { background: #EFF6FF; color: #1D4ED8; }
.dbn-alert-info-btn i { font-size: 0.95rem; }
@keyframes dbnPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* Alert List */
.dbn-alert-list { animation: dbnSlide 0.2s ease; }
.dbn-alert-list-head { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: #F8FAFC; border-bottom: 1px solid #F1F5F9; font-size: 0.8rem; }
.dbn-close-sm { width: 24px; height: 24px; border-radius: 6px; border: 1px solid #E2E8F0; background: #FFF; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.65rem; color: #94A3B8; }
.dbn-alert-list-body { max-height: 200px; overflow-y: auto; }
.dbn-alert-row { display: flex; align-items: center; gap: 10px; padding: 8px 16px; border-bottom: 1px solid #FAFBFC; font-size: 0.75rem; }
.dbn-alert-row:hover { background: #FAFBFC; }
.dbn-alert-row-name { font-weight: 700; color: #0F172A; min-width: 100px; }
.dbn-alert-row-val { font-weight: 700; color: #EF4444; padding: 2px 8px; background: #FEF2F2; border-radius: 4px; font-size: 0.68rem; }
.dbn-alert-row-loc { color: #94A3B8; font-size: 0.68rem; flex: 1; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: capitalize; font-weight: 600; }
.dbn-empty-sm { display: flex; align-items: center; gap: 6px; justify-content: center; padding: 20px; font-size: 0.8rem; color: #94A3B8; }

/* Battery */
.dbn-bat-section { border-top: 1px solid #F1F5F9; }
.dbn-bat-head { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; font-size: 0.72rem; }
.dbn-bat-label { display: flex; align-items: center; gap: 5px; font-weight: 700; color: #475569; }
.dbn-bat-list { padding: 0 16px 10px; }
.dbn-bat-row { display: flex; align-items: center; gap: 10px; padding: 5px 0; font-size: 0.75rem; }
.dbn-bat-name { font-weight: 600; color: #0F172A; min-width: 80px; }
.dbn-bat-bar-w { display: flex; align-items: center; gap: 6px; flex: 1; }
.dbn-bat-bar { flex: 1; height: 6px; border-radius: 3px; background: #F1F5F9; overflow: hidden; }

/* ══════ ANALYTICS ROW ══════ */
.dbn-grid-analytics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.dbn-chart-body { padding: 12px 16px; display: flex; align-items: center; justify-content: center; min-height: 210px; }
.dbn-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 30px; color: #94A3B8; font-size: 0.78rem; }
.dbn-empty i { font-size: 1.3rem; }

/* Feed */
.dbn-feed { padding: 6px 0; max-height: 380px; overflow-y: auto; }
.dbn-feed-row { display: flex; align-items: center; gap: 10px; padding: 9px 18px; transition: background 0.1s; }
.dbn-feed-row:hover { background: #F8FAFC; }
.dbn-feed-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
.dbn-feed-info { flex: 1; min-width: 0; }
.dbn-feed-name { display: block; font-weight: 700; font-size: 0.78rem; color: #0F172A; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dbn-feed-loc { display: block; font-size: 0.68rem; color: #94A3B8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ══════ RESPONSIVE ══════ */
@media (max-width: 1200px) {
  .dbn-grid-analytics { grid-template-columns: repeat(2, 1fr); }
  .dbn-nav-search { display: none; }
}
@media (max-width: 900px) {
  .dbn-grid-main { grid-template-columns: 1fr; }
  .dbn-kpi-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .dbn-content { padding: 12px 14px 24px; }
  .dbn-hero { flex-direction: column; align-items: stretch; }
  .dbn-kpi-row { grid-template-columns: 1fr 1fr; }
  .dbn-grid-analytics { grid-template-columns: 1fr; }
}
`

export default DashboardListCards
