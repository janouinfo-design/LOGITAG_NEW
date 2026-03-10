import React, {useState, useEffect, useMemo} from 'react'
import KPICardGrid from './widgets/KPICardGrid'
import ChartGrid from './widgets/ChartGrid'
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
import {Chip} from 'primereact/chip'
import {fetchEnginsModels, getEnginsModels} from '../../../Engin/slice/engin.slice'
import CustomerDashboard from './CustomerDashboard'
import moment from 'moment'

const DashboardContent = ({activeTab, setActiveTab, kpiData, isAIConfigured, errorMessage}) => {
  const [dataDisplay, setDataDisplay] = useState([])

  const etatData = [
    { label: 'Tous', code: '', icon: 'pi pi-cog', backgroundColor: '#F97316' },
    { label: 'Entrée', code: 'reception', icon: 'pi pi-arrow-down', backgroundColor: '#10B981' },
    { label: 'Sortie', code: 'exit', icon: 'pi pi-arrow-up', backgroundColor: '#EF4444' },
  ]

  const [filters, setFilters] = useState({
    enginModel: '',
    periodType: 'year',
    enginStatus: '',
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
      {label: 'Jour', value: 'day', icon: 'pi pi-calendar'},
      {label: 'Semaine', value: 'week', icon: 'pi pi-calendar'},
      {label: 'Mois', value: 'month', icon: 'pi pi-calendar'},
      {label: 'Année', value: 'year', icon: 'pi pi-calendar'},
    ],
    []
  )

  const tabs = [
    {key: 'principal', label: 'Principal', icon: 'pi pi-th-large'},
    {key: 'analytique', label: 'Analytique', icon: 'pi pi-chart-bar'},
    {key: 'site', label: 'Engins par site', icon: 'pi pi-map-marker'},
  ]

  useEffect(() => {
    if (activeTab === 2 || activeTab === 'personnalise') refreshDashboards()
  }, [activeTab, refreshDashboards])

  const handleDeleteDashboard = (id) => {
    refreshDashboards()
    if (dashboards.length > 0) {
      const availableDashboards = getDashboards()
      if (availableDashboards.length > 0) setSelectedDashboardId(availableDashboards[0].id)
    }
  }

  const getData = () => {
    let _filters = {...filters}
    if (filters?.periodType) {
      _filters.startDate = moment().startOf(filters?.periodType).format('YYYY-MM-DD')
      _filters.endDate = moment().endOf(filters?.periodType).format('YYYY-MM-DD')
    }
    setLoading(true)
    dispatch(fetchGrafanaDashboards(_filters)).then(() => setLoading(false))
    dispatch(fetchStatisticDash(_filters))
  }

  useEffect(() => {
    getData()
    dispatch(fetchEnginsModels())
  }, [])

  useEffect(() => {
    if (Array.isArray(chartsData) && chartsData?.length > 0) {
      setDataDisplay(chartsData)
    } else {
      setDataDisplay(fakeKpiDataDash)
    }
  }, [chartsData])

  const currentTab = typeof activeTab === 'number'
    ? tabs[activeTab]?.key || 'principal'
    : activeTab || 'principal'

  return (
    <>
      <style>{`
        .lt-dash-container {
          min-height: calc(100vh - 120px);
        }
        .lt-dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .lt-dash-header-left h1 {
          font-family: 'Manrope', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 4px 0;
          letter-spacing: -0.03em;
        }
        .lt-dash-header-left p {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #94A3B8;
          margin: 0;
        }
        .lt-dash-tabs {
          display: flex;
          gap: 4px;
          background: #F1F5F9;
          padding: 4px;
          border-radius: 12px;
        }
        .lt-dash-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #64748B;
          font-family: 'Manrope', sans-serif;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lt-dash-tab:hover {
          color: #334155;
          background: rgba(255,255,255,0.5);
        }
        .lt-dash-tab.active {
          background: #FFFFFF;
          color: #2563EB;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .lt-dash-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: #FFFFFF;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
        }
        .lt-filter-group {
          display: flex;
          gap: 4px;
          background: #F1F5F9;
          padding: 3px;
          border-radius: 10px;
        }
        .lt-filter-btn {
          padding: 7px 14px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748B;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .lt-filter-btn:hover {
          color: #334155;
        }
        .lt-filter-btn.active {
          background: #FFFFFF;
          color: #2563EB;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .lt-filter-select {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #F8FAFC;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #334155;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 140px;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 32px;
        }
        .lt-filter-select:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }
        .lt-filter-apply {
          padding: 8px 20px;
          border-radius: 10px;
          border: none;
          background: #2563EB;
          color: #FFFFFF;
          font-family: 'Manrope', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }
        .lt-filter-apply:hover {
          background: #1D4ED8;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
        }
        .lt-filter-apply:disabled {
          background: #94A3B8;
          cursor: not-allowed;
          box-shadow: none;
        }
        @keyframes ltSpinSmall { to { transform: rotate(360deg); } }
        .lt-filter-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: ltSpinSmall 0.6s linear infinite;
        }
        .lt-dash-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .lt-section-title {
          font-family: 'Manrope', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #334155;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lt-section-title i {
          color: #2563EB;
          font-size: 1rem;
        }
        .lt-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px dashed #CBD5E1;
          color: #94A3B8;
          text-align: center;
        }
        .lt-empty-state i {
          font-size: 2.5rem;
          margin-bottom: 16px;
          color: #CBD5E1;
        }
        .lt-empty-state p {
          font-family: 'Inter', sans-serif;
          font-size: 0.925rem;
          margin: 0;
        }
      `}</style>

      <div className="lt-dash-container" data-testid="dashboard-content">
        {/* Header */}
        <div className="lt-dash-header">
          <div className="lt-dash-header-left">
            <h1 data-testid="dashboard-title">Tableau de bord</h1>
            <p>Vue d'ensemble de vos actifs et performances</p>
          </div>
          <div className="lt-dash-tabs" data-testid="dashboard-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`lt-dash-tab ${currentTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                data-testid={`tab-${tab.key}`}
              >
                <i className={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {(currentTab === 'principal' || currentTab === 'analytique') && (
          <div className="lt-dash-filters" data-testid="dashboard-filters">
            <div className="lt-filter-group">
              {periods.map((p) => (
                <button
                  key={p.value}
                  className={`lt-filter-btn ${filters.periodType === p.value ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, periodType: p.value})}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <select
              className="lt-filter-select"
              value={filters.enginStatus}
              onChange={(e) => setFilters({...filters, enginStatus: e.target.value})}
              data-testid="filter-status"
            >
              {etatData.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>

            {models && models.length > 0 && (
              <>
                <select
                  className="lt-filter-select"
                  value={filters.enginFamily || ''}
                  onChange={(e) => setFilters({...filters, enginFamily: e.target.value})}
                >
                  <option value="">Famille</option>
                  {models
                    .filter(({type}) => type === 'family')
                    .map((o) => (
                      <option key={o.model} value={o.model}>
                        {o.model}
                      </option>
                    ))}
                </select>

                <select
                  className="lt-filter-select"
                  value={filters.enginModel}
                  onChange={(e) => setFilters({...filters, enginModel: e.target.value})}
                  data-testid="filter-model"
                >
                  <option value="">Modèle</option>
                  {models.map((o) => (
                    <option key={o.model} value={o.model}>
                      {o.model}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              className="lt-filter-apply"
              onClick={getData}
              disabled={loading}
              data-testid="filter-apply-btn"
            >
              {loading ? (
                <div className="lt-filter-spinner" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              )}
              Filtrer
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="lt-dash-section">
          {currentTab === 'principal' && (
            <>
              <KPICardGrid cards={cardsData} />
              {dataDisplay && (
                <ChartGrid
                  charts={dataDisplay?.filter(
                    (chart) => chart.code === 'rotation' || chart.code === 'residency'
                  )}
                />
              )}
            </>
          )}

          {currentTab === 'analytique' && (
            <ChartGrid
              charts={dataDisplay?.filter(
                (chart) => chart.code === 'visit_frequency' || chart.code === 'repartition'
              )}
            />
          )}

          {currentTab === 'site' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
              <CustomerDashboard />
            </div>
          )}

          {currentTab === 'personnalise' && (
            <>
              {isLoading ? (
                <div className="lt-empty-state">
                  <div className="lt-filter-spinner" style={{ width: '28px', height: '28px', borderColor: '#CBD5E1', borderTopColor: '#2563EB' }} />
                  <p style={{ marginTop: '16px' }}>Chargement des tableaux de bord...</p>
                </div>
              ) : selectedDashboardId ? (
                <CustomDashboard
                  dashboardId={selectedDashboardId}
                  onDeleteDashboard={handleDeleteDashboard}
                />
              ) : (
                <div className="lt-empty-state">
                  <i className="pi pi-th-large" />
                  <p>Aucun tableau de bord personnalisé disponible.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default DashboardContent
