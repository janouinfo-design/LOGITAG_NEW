import {useEffect} from 'react'
import {useDashboardController} from '../controllers/DashboardController'
import DashboardContent from './dashboard/DashboardContent'
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
    <div data-testid="dashboard-new" style={{ padding: '4px' }}>
      <DashboardContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kpiData={kpiData}
        isAIConfigured={isAIConfigured}
        errorMessage={errorMessage}
      />
    </div>
  )
}

export default DashboardNewComponent
