import {useEffect} from 'react'
import {useDashboardController} from '../controllers/DashboardController'
import DashboardContent from './dashboard/DashboardContent'
import {fetchGrafanaDashboards, fetchStatisticDash} from '../../Dashboard/slice/dashboard.slice'
import {useAppDispatch} from '../../../hooks'

const DashboardNewComponent = () => {
  const {
    activeTab,
    setActiveTab,
    selectedDashboard,
    isAIConfigured,
    errorMessage,
    dashboardTitle,
    kpiData,
    handleDashboardChange,
  } = useDashboardController()

  return (
    // <DashboardLayout>
    <div className='flex flex-col space-y-6'>
      {/* <DashboardHeader
        title={dashboardTitle}
        selectedDashboard={selectedDashboard}
        onDashboardChange={handleDashboardChange}
      /> */}

      <DashboardContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kpiData={kpiData}
        isAIConfigured={isAIConfigured}
        errorMessage={errorMessage}
      />
    </div>
    // </DashboardLayout>
  )
}

export default DashboardNewComponent
