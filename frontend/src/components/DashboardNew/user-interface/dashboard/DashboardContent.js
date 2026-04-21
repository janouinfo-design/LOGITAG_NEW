import React, {useState, useEffect, useMemo} from 'react'
import {TabView, TabPanel} from 'primereact/tabview'
import {Card} from 'primereact/card'
import ChartWidget from './widgets/ChartWidget'
import KPICardGrid from './widgets/KPICardGrid'
import ChartGrid from './widgets/ChartGrid'
import AIAnalysisSection from './AIAnalysisSection'
import CustomDashboard from './custom/CustomDashboard'
import DashboardSelector from './widgets/DashboardSelector'
import useCustomDashboards from '../../../../hooks/useCustomDashboards'
import {getDashboards} from '../../service/dashboardService'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {
  fetchGrafanaDashboards,
  fetchStatisticDash,
  getGrafanaDashboards,
  getStatisticDash,
} from '../../../Dashboard/slice/dashboard.slice'
import {fakeKpiDataDash} from './fakedataDash'
import {SelectButton} from 'primereact/selectbutton'
import {Dropdown} from 'primereact/dropdown'
import {Chip} from 'primereact/chip'
import {Button} from 'primereact/button'
import {fetchEnginsModels, getEnginsModels} from '../../../Engin/slice/engin.slice'
import CustomerDashboard from './CustomerDashboard'
import moment from 'moment'
import {getSites} from '../../../Site/slice/site.slice'

const DashboardContent = ({activeTab, setActiveTab, kpiData, isAIConfigured, errorMessage}) => {
  const [dataDisplay, setDataDisplay] = useState([])

  const sites = useAppSelector(getSites)

  console.log('sites', sites)
  const locations = [
    {label: 'tous', value: 'all'},
    {label: 'Site A', value: 'Site A'},
    {label: 'Site B', value: 'Site B'},
    {label: 'Site C', value: 'Site C'},
  ]
  const categories = [
    {label: 'tous', value: 'all'},
    {label: 'Poids lourd', value: 'Poids lourd'},
    {label: 'Véhicule léger', value: 'Véhicule léger'},
    {label: 'Spécial', value: 'Spécial'},
  ]
  const types = [
    {label: 'tous', value: 'all'},
    {label: 'Camion', value: 'Camion'},
    {label: 'Fourgonnette', value: 'Fourgonnette'},
    {label: 'Équipement', value: 'Équipement'},
  ]

  const etatData = [
    {
      label: 'Tous',
      code: '',
      icon: 'fa-solid fa-gear',
      backgroundColor: '#FFA500',
    },
    {
      label: 'Entrée',
      code: 'reception',
      icon: 'pi pi-arrow-down',
      backgroundColor: '#29bf12',
    },
    {
      label: 'Sortie',
      code: 'exit',
      icon: 'pi pi-arrow-up',
      backgroundColor: '#D64B70',
    },
  ]

  const [filters, setFilters] = useState({
    // period: 'mois',
    // location: 'all',
    // category: 'all',
    // type: 'all',
    // etat: 'all',
    enginModel: '',
    periodType: 'year',
    enginStatus: '',
    customerId: '',
  })

  const {dashboards, selectedDashboardId, setSelectedDashboardId, isLoading, refreshDashboards} =
    useCustomDashboards()

  const dispatch = useAppDispatch()
  const chartsData = useAppSelector(getGrafanaDashboards)
  const cardsData = useAppSelector(getStatisticDash)
  const models = useAppSelector(getEnginsModels)
  const [loading, setLoading] = useState(false)

  const periods = useMemo(
    () => [
      {label: 'jour', value: 'day'},
      {label: 'semaine', value: 'week'},
      {label: 'mois', value: 'month'},
      {label: 'année', value: 'year'},
    ],
    []
  )

  // Rafraîchir les dashboards lorsqu'on accède à l'onglet personnalisé
  useEffect(() => {
    if (activeTab === 2) {
      // personnalise tab index
      refreshDashboards()
    }
  }, [activeTab, refreshDashboards])

  const handleDeleteDashboard = (id) => {
    refreshDashboards()
    if (dashboards.length > 0) {
      // Sélectionner le premier tableau de bord disponible
      const availableDashboards = getDashboards()
      if (availableDashboards.length > 0) {
        setSelectedDashboardId(availableDashboards[0].id)
      }
    }
  }

  // Ensure the activeIndex is using the proper type (a number, not a string)
  const getActiveIndex = () => {
    if (activeTab === 'principal') return 0
    if (activeTab === 'analytique') return 1
    if (activeTab === 'personnalise') return 2
    if (activeTab === 'ia') return 3
    return 0 // Default to principal tab
  }

  // Handle tab change from TabView
  const handleTabChange = (e) => {
    const index = e.index
    let tabName = 'principal'

    if (index === 1) tabName = 'analytique'
    else if (index === 2) tabName = 'personnalise'
    else if (index === 3) tabName = 'ia'

    setActiveTab(tabName)
  }

  const etatItemTemplate = (option) => {
    return (
      <Chip
        className='cursor-pointer text-white'
        label={option?.label}
        style={{background: option?.backgroundColor}}
        icon={option?.icon}
      />
    )
  }

  const getData = () => {
    console.log('filters:', filters)
    let _filters = {...filters}
    if (filters?.periodType) {
      _filters.startDate = moment().startOf(filters?.periodType).format('YYYY-MM-DD')
      _filters.endDate = moment().endOf(filters?.periodType).format('YYYY-MM-DD')
    }
    setLoading(true)
    dispatch(fetchGrafanaDashboards(_filters)).then((res) => {
      setLoading(false)
    })
    dispatch(fetchStatisticDash(_filters))
  }

  // ─── Active filter chips (Proposition A) ───
  const activeChips = useMemo(() => {
    const chips = []
    if (filters.enginStatus) {
      const found = etatData.find((o) => o.code === filters.enginStatus)
      if (found && found.code) chips.push({key: 'enginStatus', label: `Etat : ${found.label}`})
    }
    if (filters.enginFamily) chips.push({key: 'enginFamily', label: `Famille : ${filters.enginFamily}`})
    if (filters.enginModel) chips.push({key: 'enginModel', label: `Modèle : ${filters.enginModel}`})
    if (filters.customerId) {
      const site = (sites || []).find((s) => s.id === filters.customerId)
      if (site) chips.push({key: 'customerId', label: `Client : ${site.name}`})
    }
    return chips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sites])

  const clearChip = (key) => {
    setFilters({...filters, [key]: key === 'customerId' ? '' : ''})
  }

  const filterTemplate = () => (
    <div className='lt-filter-bar-wrap' data-testid='dashboard-filter-bar'>
      <div className='lt-filter-bar'>
        {/* Segmented period */}
        <div className='lt-seg' role='tablist' aria-label='Période'>
          {periods.map((p) => (
            <button
              key={p.value}
              type='button'
              role='tab'
              aria-selected={filters.periodType === p.value}
              className={`lt-seg-btn ${filters.periodType === p.value ? 'is-active' : ''}`}
              onClick={() => setFilters({...filters, periodType: p.value})}
              data-testid={`period-${p.value}`}
            >
              {p.label.charAt(0).toUpperCase() + p.label.slice(1)}
            </button>
          ))}
        </div>

        <span className='lt-filter-divider' aria-hidden='true' />

        {/* Compact dropdowns */}
        <div className='lt-filter-dd'>
          <i className='pi pi-bolt lt-filter-dd-ic' />
          <span className='lt-filter-dd-label'>Etat</span>
          <Dropdown
            value={filters.enginStatus}
            optionLabel='label'
            optionValue='code'
            options={etatData}
            onChange={(e) => setFilters({...filters, enginStatus: e.value})}
            placeholder='Tous'
            itemTemplate={etatItemTemplate}
            className='lt-filter-dd-inner'
            panelClassName='lt-filter-dd-panel'
          />
        </div>

        <div className='lt-filter-dd'>
          <i className='pi pi-sitemap lt-filter-dd-ic' />
          <span className='lt-filter-dd-label'>Famille</span>
          <Dropdown
            value={filters.enginFamily}
            optionLabel='label'
            optionValue='value'
            options={[
              {label: 'Tous', value: ''},
              ...(models || [])
                .filter(({type}) => type == 'family')
                .map((o) => ({label: o.model, value: o.model})),
            ].filter((o) => o.label)}
            onChange={(e) => setFilters({...filters, enginFamily: e.value})}
            placeholder='Tous'
            className='lt-filter-dd-inner'
            panelClassName='lt-filter-dd-panel'
          />
        </div>

        <div className='lt-filter-dd'>
          <i className='pi pi-box lt-filter-dd-ic' />
          <span className='lt-filter-dd-label'>Modèle</span>
          <Dropdown
            value={filters.enginModel}
            options={[
              {label: 'Tous', value: ''},
              ...(models || []).map((o) => ({label: o.model, value: o.model})),
            ].filter((o) => o.label)}
            onChange={(e) => setFilters({...filters, enginModel: e.value})}
            placeholder='Tous'
            className='lt-filter-dd-inner'
            panelClassName='lt-filter-dd-panel'
          />
        </div>

        <div className='lt-filter-dd'>
          <i className='pi pi-users lt-filter-dd-ic' />
          <span className='lt-filter-dd-label'>Client</span>
          <Dropdown
            value={filters.customerId}
            optionLabel='label'
            optionValue='id'
            options={[
              {label: 'Tous', id: 0},
              ...(sites || []).map((o) => ({label: o.name, id: o.id})),
            ].filter((o) => o.label)}
            onChange={(e) => setFilters({...filters, customerId: e.value})}
            placeholder='Tous'
            filter
            className='lt-filter-dd-inner'
            panelClassName='lt-filter-dd-panel'
          />
        </div>

        <div className='lt-filter-spacer' />

        <button
          type='button'
          className='lt-filter-apply'
          onClick={getData}
          disabled={loading}
          data-testid='dashboard-filter-apply'
        >
          <i className={loading ? 'pi pi-spin pi-spinner' : 'pi pi-filter'} />
          Filtrer
        </button>
      </div>

      {activeChips.length > 0 && (
        <div className='lt-filter-chips' data-testid='dashboard-filter-chips'>
          {activeChips.map((c) => (
            <span key={c.key} className='lt-filter-chip'>
              {c.label}
              <button
                type='button'
                className='lt-filter-chip-x'
                onClick={() => clearChip(c.key)}
                aria-label={`Retirer ${c.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )

  // Build Hero + Insights from cardsData (Proposition A - Executive Dashboard)
  const heroInsights = useMemo(() => {
    if (!cardsData || !Array.isArray(cardsData) || cardsData.length === 0) return null
    const now = moment()
    const periodLabel = filters?.periodType
      ? ({day: "Aujourd'hui", week: 'Cette semaine', month: 'Ce mois', year: `Année ${now.format('YYYY')}`})[filters.periodType]
      : `Période analysée`

    let up = 0, down = 0
    cardsData.forEach((c) => {
      const s = String(c.change || '').trim()
      if (s.startsWith('-')) down++
      else if (/^\+?\d/.test(s)) up++
    })
    const globalTrend = up >= down ? 'up' : 'down'
    const globalPct = up + down > 0 ? Math.round(((Math.max(up, down) / (up + down)) - 0.5) * 200) : 0

    const insights = []
    const sortedDown = cardsData.filter((c) => String(c.change || '').startsWith('-'))
      .sort((a, b) => parseFloat(String(b.change).replace(/[+\-%]/g, '')) - parseFloat(String(a.change).replace(/[+\-%]/g, '')))
    const sortedUp = cardsData.filter((c) => /^\+?\d/.test(String(c.change || '')) && !String(c.change || '').startsWith('-'))
      .sort((a, b) => parseFloat(String(b.change).replace(/[+\-%]/g, '')) - parseFloat(String(a.change).replace(/[+\-%]/g, '')))

    if (sortedUp[0]) insights.push({
      icon: 'pi pi-arrow-up-right', bg: '#DCFCE7', color: '#16A34A',
      text: <><b>{sortedUp[0].title}</b> progresse de <b>{sortedUp[0].change}</b> — excellente performance.</>,
    })
    if (sortedDown[0]) insights.push({
      icon: 'pi pi-exclamation-triangle', bg: '#FEE2E2', color: '#DC2626',
      text: <><b>{sortedDown[0].title}</b> en baisse de <b>{sortedDown[0].change}</b>. À surveiller.</>,
    })
    if (insights.length < 3 && cardsData[0]) insights.push({
      icon: 'pi pi-lightbulb', bg: '#EEF2FF', color: '#6366F1',
      text: <><b>{cardsData[0].title}</b> affiche <b>{cardsData[0].value}</b> sur la période sélectionnée.</>,
    })

    return {periodLabel, globalTrend, globalPct, insights: insights.slice(0, 3)}
  }, [cardsData, filters])

  useEffect(() => {
    getData()
    dispatch(fetchEnginsModels())
    // if (process.env.REACT_APP_API_URL === 'https://app.logitag.ch:8443/logitag_node_alm/') {
    //   setDataDisplay(chartsData)
    // } else {
    //   setDataDisplay(fakeKpiDataDash)
    // }
  }, [])

  useEffect(() => {
    if (Array.isArray(chartsData) && chartsData?.length > 0) {
      setDataDisplay(chartsData)
    } else {
      setDataDisplay(fakeKpiDataDash)
    }
  }, [chartsData])

  useEffect(() => {
    console.log('filters changed:', filters)
  }, [filters])

  return (
    <TabView
      activeIndex={getActiveIndex()}
      onTabChange={handleTabChange}
      className='dashboard-tabs'
    >
      <TabPanel header='Principal'>
        {/* ── Executive Hero Header ── */}
        {heroInsights && (
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20, padding: '18px 20px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 14, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'}} data-testid='status-hero'>
            <div>
              <div style={{fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.02em'}}>
                Performance · {heroInsights.periodLabel}
              </div>
              <div style={{fontSize: '0.82rem', color: '#64748B', marginTop: 4}}>
                Comparé à la période précédente
              </div>
            </div>
            {heroInsights.globalPct > 0 && (
              <div style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: heroInsights.globalTrend === 'up' ? '#DCFCE7' : '#FEE2E2', color: heroInsights.globalTrend === 'up' ? '#16A34A' : '#DC2626', fontWeight: 700, fontSize: '0.85rem'}}>
                <i className={heroInsights.globalTrend === 'up' ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'} style={{fontSize: '0.8rem'}}></i>
                {heroInsights.globalTrend === 'up' ? '+' : '-'}{heroInsights.globalPct}% vs précédent
              </div>
            )}
          </div>
        )}
        {filterTemplate()}
        {dataDisplay && (
          <div className='flex flex-col gap-4 mt-3'>
            <KPICardGrid cards={cardsData} />
            <ChartGrid
              charts={dataDisplay?.filter(
                (chart) => chart.code == 'rotation' || chart.code == 'residency'
              )}
            />
            {/* ── Insights Section ── */}
            {heroInsights?.insights && heroInsights.insights.length > 0 && (
              <div data-testid='status-insights' style={{marginTop: 8}}>
                <div style={{fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6}}>
                  <i className='pi pi-sparkles' style={{color: '#2563EB'}}></i>
                  Insights automatiques
                </div>
                <div style={{display: 'grid', gridTemplateColumns: `repeat(${heroInsights.insights.length}, 1fr)`, gap: 12}}>
                  {heroInsights.insights.map((ins, i) => (
                    <div key={i} style={{background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'flex-start', gap: 10}}>
                      <div style={{width: 34, height: 34, borderRadius: 9, background: ins.bg, color: ins.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85rem'}}>
                        <i className={ins.icon}></i>
                      </div>
                      <div style={{fontSize: '0.82rem', color: '#334155', lineHeight: 1.45}}>{ins.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </TabPanel>

      <TabPanel header='Analytique'>
        {filterTemplate()}
        <div className='mt-5 transition-shadow duration-300'>
          <ChartGrid
            charts={dataDisplay?.filter(
              (chart) => chart.code === 'visit_frequency' || chart.code === 'repartition'
            )}
          />
        </div>
      </TabPanel>
      <TabPanel header='Engin par site'>
        <Card className='shadow-md hover:shadow-lg transition-shadow duration-300'>
          <CustomerDashboard />
        </Card>
      </TabPanel>
      <TabPanel className='hidden' header='Personnalisé'>
        <div className='flex justify-between items-center mb-4'>
          {!isLoading && dashboards.length > 0 && (
            <DashboardSelector
              dashboards={dashboards}
              selectedId={selectedDashboardId}
              onSelect={setSelectedDashboardId}
            />
          )}
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center h-64'>
            <p>Chargement des tableaux de bord...</p>
          </div>
        ) : selectedDashboardId ? (
          <CustomDashboard
            dashboardId={selectedDashboardId}
            onDeleteDashboard={handleDeleteDashboard}
          />
        ) : (
          <Card>
            <div className='p-card-body py-8 text-center'>
              <p>Aucun tableau de bord personnalisé disponible.</p>
            </div>
          </Card>
        )}
      </TabPanel>

      <TabPanel className='hidden' header='IA & Prédictions'>
        <AIAnalysisSection isAIConfigured={isAIConfigured} errorMessage={errorMessage} />
      </TabPanel>
    </TabView>
  )
}

export default DashboardContent
