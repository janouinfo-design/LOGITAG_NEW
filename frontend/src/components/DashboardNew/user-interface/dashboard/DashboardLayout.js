import React, {useState} from 'react'
// import Sidebar from './Sidebar';
import Header from './Header'

/**
 * Main dashboard layout component providing consistent structure for dashboard pages
 */
const DashboardLayout = ({children, title = 'Dashboard'}) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* <Sidebar expanded={sidebarExpanded} onToggle={toggleSidebar} /> */}

      <Header sidebarExpanded={sidebarExpanded} onSidebarToggle={toggleSidebar} title={title} />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarExpanded ? 'ml-64' : 'ml-16'
        }`}
      >
        <div className='p-6 fade-in'>
          <div className='animate-fade-in'>{children}</div>
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
