import {useState, useEffect, useRef} from 'react'
import {Toast} from 'primereact/toast'
import useDashboardData from '../../../hooks/useDashboardData'
// import useDashboardData from '@/hooks/useDashboardData'

/**
 * Controller for main dashboard functionality
 * Manages dashboard state and data fetching
 */
export const useDashboardController = () => {
  const [activeTab, setActiveTab] = useState('principal')
  const [selectedDashboard, setSelectedDashboard] = useState('duree-presence')
  const [isAIConfigured, setIsAIConfigured] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const toastRef = useRef(null)

  // Get dashboard data from custom hook
  const {dashboardTitle, kpiData} = useDashboardData(selectedDashboard)

  // Simulate AI config check or remove it entirely
  useEffect(() => {
    // Simulated: Assume AI is not configured just for toast demonstration
    const configured = false

    setIsAIConfigured(configured)
    if (!configured) {
      const message = "Veuillez configurer la clé API OpenAI pour utiliser les fonctionnalités d'IA"
      setErrorMessage(message)
      console.error(message)
    } else {
      setErrorMessage(null)
    }
  }, [])

  const handleDashboardChange = (dashboardId) => {
    setSelectedDashboard(dashboardId)
  }

  return {
    activeTab,
    setActiveTab,
    selectedDashboard,
    setSelectedDashboard,
    isAIConfigured,
    errorMessage,
    dashboardTitle,
    kpiData,
    handleDashboardChange,
  }
}
