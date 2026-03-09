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
import { Button } from 'primereact/button'
import { fetchEnginsModels, getEnginsModels } from '../../../Engin/slice/engin.slice'
import CustomerDashboard from './CustomerDashboard'
import moment from 'moment'

const DashboardContent = ({activeTab, setActiveTab, kpiData, isAIConfigured, errorMessage}) => {
  const [dataDisplay, setDataDisplay] = useState([])
  
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
      icon: 'fa-solid fa-down-to-bracket',
      backgroundColor: '#29bf12',
    },
    {
      label: 'Sortie',
      code: 'exit',
      icon: 'fa-solid fa-up-from-bracket',
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
    enginStatus: ''
  })

  const {dashboards, selectedDashboardId, setSelectedDashboardId, isLoading, refreshDashboards} =
    useCustomDashboards()

  const dispatch = useAppDispatch()
  const chartsData = useAppSelector(getGrafanaDashboards)
  const cardsData = useAppSelector(getStatisticDash)
  const models = useAppSelector(getEnginsModels)
  const [loading , setLoading] = useState(false)

  const periods = useMemo(()=>[
    {label: 'jour' , value: 'day'},
    {label: 'semaine' , value: 'week'} , 
    {label: 'mois' , value: 'month'} , 
    {label: 'année' , value: 'year'} 
  ],[])

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

  const getData = ()=>{
    console.log('filters:', filters)
    let _filters = { ...filters }
    if(filters?.periodType) {
      _filters.startDate = moment().startOf(filters?.periodType).format('YYYY-MM-DD')
      _filters.endDate = moment().endOf(filters?.periodType).format('YYYY-MM-DD')
    }
    setLoading(true)
    dispatch(fetchGrafanaDashboards(_filters)).then((res)=>{
      setLoading(false)
    })
    dispatch(fetchStatisticDash(_filters))
  }

  const filterTemplate = ()=>(
    <Card>
      <div className='flex flex-wrap gap-3'>
        <SelectButton
          value={filters.periodType}
          options={periods}
          optionValue='value'
          onChange={(e) => setFilters({...filters, periodType: e.value})}
        />
        <Dropdown
          value={filters.enginStatus}
          optionLabel='label'
          optionValue='code'
          options={etatData}
          onChange={(e) => setFilters({...filters, enginStatus: e.value})}
          placeholder='Etat Engin'
          itemTemplate={etatItemTemplate}
        />
        <Dropdown
          value={filters.enginFamily}
          optionLabel='label'
          optionValue='value'
          options={[{label: 'Tout' , value: ''}, ...(models || []).filter(({type})=> type == 'family').map(o =>({label: o.model , value:  o.model}))].filter(o => o.label)}
          onChange={(e) => setFilters({...filters, enginFamily: e.value})}
          placeholder='Famille'
        />
        <Dropdown
          value={filters.enginModel}
          // optionLabel='model'
          // optionValue='model'
          options={[{label: 'Tout' , value: ''}, ...(models || []).map(o =>({label: o.model , value:  o.model}))].filter(o => o.label)}
          onChange={(e) => setFilters({...filters, enginModel: e.value})}
          placeholder='Model'
        />

        <Button loading={loading} onClick={getData} size='small' severity='warning' icon="pi pi-filter" label='Filtrer'/>
      </div>
    </Card> 
  )

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

  useEffect(()=>{
    console.log('filters changed:', filters)
  },[filters])
  

  return (
    <TabView
      activeIndex={getActiveIndex()}
      onTabChange={handleTabChange}
      className='dashboard-tabs'
    >
      <TabPanel header='Principal'>
        {filterTemplate ()}
        {dataDisplay && (
          <div className='flex flex-col gap-4 mt-3'>
            <KPICardGrid cards={cardsData} />
            <ChartGrid
              charts={dataDisplay?.filter(
                (chart) =>
                  chart.code == 'rotation' ||
                  chart.code == 'residency'
              )}
            />
          </div>
        )}
      </TabPanel>


      <TabPanel header='Analytique'>
        {filterTemplate ()}
        <div className='mt-5 transition-shadow duration-300'>
          <ChartGrid
            charts={dataDisplay?.filter(
              (chart) =>
                chart.code === 'visit_frequency' ||
                chart.code === 'repartition'
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

      <TabPanel  className='hidden' header='IA & Prédictions'>
        <AIAnalysisSection isAIConfigured={isAIConfigured} errorMessage={errorMessage} />
      </TabPanel>
    </TabView>
  )
}

export default DashboardContent
