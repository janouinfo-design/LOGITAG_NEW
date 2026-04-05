import {useNavigate, useLocation} from 'react-router-dom'
import {useLayoutCtx} from './PremiumLayout'
import {
  LayoutDashboard, Map, Box, Activity, Bell, Settings,
  ChevronLeft, ChevronRight, MapPin, Users, LogOut,
  Radio, FileBarChart, UserCircle, CalendarDays
} from 'lucide-react'
import {useAppDispatch} from '../../hooks'
import {setCurrentUser} from '../User/slice/user.slice'

const NAV_ITEMS = [
  {id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/tagdashboard/index'},
  {id: 'map', label: 'Carte', icon: Map, path: '/tour/index'},
  {id: 'assets', label: 'Assets', icon: Box, path: '/view/engin/index'},
  {id: 'planning', label: 'Planning', icon: CalendarDays, path: '/timeline/index'},
  {id: 'zones', label: 'Zones', icon: MapPin, path: '/Geofence/index'},
  {id: 'activity', label: 'Activité', icon: Activity, path: '/LOGS/index'},
  {id: 'alerts', label: 'Alertes', icon: Bell, path: '/alert/index'},
  {id: 'users', label: 'Utilisateurs', icon: UserCircle, path: '/view/staff/index'},
  {id: 'gateway', label: 'Gateway', icon: Radio, path: '/gateway/index'},
  {id: 'reports', label: 'Rapports', icon: FileBarChart, path: '/rapport/index'},
  {id: 'clients', label: 'Clients', icon: Users, path: '/customer/index'},
  {id: 'settings', label: 'Paramètres', icon: Settings, path: '/menu/setup'},
]

const PremiumSidebar = () => {
  const {collapsed, toggle} = useLayoutCtx()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    dispatch(setCurrentUser(null))
    navigate('/auth')
  }

  return (
    <>
      <aside
        className={`lt-sidebar ${collapsed ? 'lt-sidebar--collapsed' : ''}`}
        data-testid="premium-sidebar"
      >
        {/* Logo */}
        <div className="lt-sidebar-logo" data-testid="sidebar-logo">
          <div className="lt-sidebar-logo-icon">L</div>
          {!collapsed && <span className="lt-sidebar-logo-text">LOGITAG</span>}
        </div>

        {/* Nav Items */}
        <nav className="lt-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.id}
                className={`lt-sidebar-item ${active ? 'lt-sidebar-item--active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                data-testid={`sidebar-nav-${item.id}`}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && <div className="lt-sidebar-active-dot" />}
              </button>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="lt-sidebar-bottom">
          <button
            className="lt-sidebar-item lt-sidebar-item--logout"
            onClick={handleLogout}
            title="Déconnexion"
            data-testid="sidebar-logout"
          >
            <LogOut size={20} strokeWidth={1.8} />
            {!collapsed && <span>Déconnexion</span>}
          </button>

          <button
            className="lt-sidebar-collapse-btn"
            onClick={toggle}
            data-testid="sidebar-toggle"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      <style>{`
        .lt-sidebar {
          position: fixed; top: 0; left: 0; z-index: 100;
          width: 260px; height: 100vh;
          background: #FFFFFF;
          border-right: 1px solid #E2E8F0;
          display: flex; flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .lt-sidebar--collapsed { width: 72px; }

        /* Logo */
        .lt-sidebar-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid #F1F5F9;
          min-height: 72px;
        }
        .lt-sidebar-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #2563EB;
          color: #FFF; font-family: 'Manrope', sans-serif;
          font-weight: 800; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lt-sidebar-logo-text {
          font-family: 'Manrope', sans-serif;
          font-weight: 800; font-size: 1.2rem;
          color: #0F172A; letter-spacing: -0.04em;
          white-space: nowrap;
        }

        /* Nav */
        .lt-sidebar-nav {
          flex: 1; padding: 12px 12px;
          display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto;
        }
        .lt-sidebar-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          border: none; background: transparent;
          color: #64748B; cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem; font-weight: 500;
          transition: all 0.15s ease;
          white-space: nowrap; position: relative;
          width: 100%; text-align: left;
        }
        .lt-sidebar-item:hover {
          background: #F8FAFC; color: #334155;
        }
        .lt-sidebar-item--active {
          background: #EFF6FF; color: #2563EB; font-weight: 600;
        }
        .lt-sidebar-item--active:hover { background: #DBEAFE; }
        .lt-sidebar-active-dot {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          width: 6px; height: 6px; border-radius: 50%;
          background: #2563EB;
        }
        .lt-sidebar-item--logout { color: #94A3B8; }
        .lt-sidebar-item--logout:hover { color: #EF4444; background: #FEF2F2; }

        /* Collapsed state centering */
        .lt-sidebar--collapsed .lt-sidebar-item {
          justify-content: center; padding: 10px;
        }
        .lt-sidebar--collapsed .lt-sidebar-logo {
          justify-content: center; padding: 24px 0 20px;
        }

        /* Bottom */
        .lt-sidebar-bottom {
          padding: 12px; border-top: 1px solid #F1F5F9;
          display: flex; flex-direction: column; gap: 4px;
        }
        .lt-sidebar-collapse-btn {
          display: flex; align-items: center; justify-content: center;
          width: 100%; padding: 8px; border-radius: 8px;
          border: 1px solid #E2E8F0; background: #FAFBFC;
          color: #94A3B8; cursor: pointer;
          transition: all 0.15s ease;
        }
        .lt-sidebar-collapse-btn:hover { background: #F1F5F9; color: #475569; }

        /* Mobile: hide sidebar */
        @media (max-width: 768px) {
          .lt-sidebar { display: none; }
        }
      `}</style>
    </>
  )
}

export default PremiumSidebar
