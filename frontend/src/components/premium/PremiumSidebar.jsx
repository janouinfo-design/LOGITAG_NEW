import {useState, useEffect} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {useLayoutCtx} from './PremiumLayout'
import {
  LayoutDashboard, Map, Box, Activity, Bell, Settings,
  ChevronLeft, ChevronRight, ChevronDown, MapPin, Users, LogOut,
  Radio, FileBarChart, UserCircle, CalendarDays, Moon, Sun,
  CalendarCheck, ClipboardList, BarChart3, Shield, Radar
} from 'lucide-react'
import {useAppDispatch} from '../../hooks'
import {setCurrentUser} from '../User/slice/user.slice'

const NAV_SECTIONS = [
  {
    id: 'overview', label: 'Tableau de bord',
    items: [
      {id: 'command', label: 'Carte', icon: Radar, path: '/command/center'},
      {id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/tagdashboard/index'},
    ]
  },
  {
    id: 'assets', label: 'Assets',
    items: [
      {id: 'assets', label: 'Liste Assets', icon: Box, path: '/view/engin/index'},
      {id: 'zones', label: 'Zones', icon: MapPin, path: '/Geofence/index'},
      {id: 'gateway', label: 'Gateway', icon: Radio, path: '/gateway/index'},
    ]
  },
  {
    id: 'reservations', label: 'Réservations',
    items: [
      {id: 'planning', label: 'Planning', icon: CalendarDays, path: '/timeline/index'},
      {id: 'gantt', label: 'Gantt', icon: BarChart3, path: '/reservation/gantt'},
      {id: 'res-planning', label: 'Calendrier', icon: CalendarCheck, path: '/reservation/planning'},
      {id: 'res-my', label: 'Mes réservations', icon: ClipboardList, path: '/reservation/myreservations'},
      {id: 'res-dash', label: 'KPI', icon: BarChart3, path: '/reservation/dashboard', hasNotif: true},
    ]
  },
  {
    id: 'monitoring', label: 'Suivi',
    items: [
      {id: 'activity', label: 'Activité', icon: Activity, path: '/LOGS/index'},
      {id: 'alerts', label: 'Alertes', icon: Bell, path: '/alert/index'},
      {id: 'reports', label: 'Rapports', icon: FileBarChart, path: '/rapport/index'},
    ]
  },
  {
    id: 'admin', label: 'Administration',
    items: [
      {id: 'users', label: 'Utilisateurs', icon: UserCircle, path: '/view/staff/index'},
      {id: 'roles', label: 'Rôles', icon: Shield, path: '/admin/roles'},
      {id: 'clients', label: 'Clients', icon: Users, path: '/customer/index'},
      {id: 'settings', label: 'Paramètres', icon: Settings, path: '/menu/setup'},
    ]
  },
]

const PremiumSidebar = () => {
  const {collapsed, toggle} = useLayoutCtx()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('lt-dark') === '1' } catch { return false }
  })
  const [notifCount, setNotifCount] = useState(0)

  // Which sections are open (stored by section id)
  const [openSections, setOpenSections] = useState(() => {
    // Open the section that contains the current active path
    const open = {}
    NAV_SECTIONS.forEach(s => {
      if (s.items.some(i => i.path === location.pathname)) open[s.id] = true
    })
    // Default: open overview
    if (Object.keys(open).length === 0) open.overview = true
    return open
  })

  const toggleSection = (sectionId) => {
    if (collapsed) return // Don't toggle when collapsed
    setOpenSections(prev => ({...prev, [sectionId]: !prev[sectionId]}))
  }

  useEffect(() => {
    if (dark) document.documentElement.classList.add('lt-dark')
    else document.documentElement.classList.remove('lt-dark')
    localStorage.setItem('lt-dark', dark ? '1' : '0')
  }, [dark])

  useEffect(() => {
    const API = process.env.REACT_APP_BACKEND_URL
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API}/api/notifications/count`)
        if (res.ok) { const d = await res.json(); setNotifCount(d.count || 0) }
      } catch {}
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-open section containing active item on route change
  useEffect(() => {
    NAV_SECTIONS.forEach(s => {
      if (s.items.some(i => i.path === location.pathname)) {
        setOpenSections(prev => ({...prev, [s.id]: true}))
      }
    })
  }, [location.pathname])

  const isActive = (path) => location.pathname === path
  const sectionHasActive = (section) => section.items.some(i => isActive(i.path))

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

        {/* Grouped Nav */}
        <nav className="lt-sidebar-nav">
          {NAV_SECTIONS.map((section) => {
            const isOpen = collapsed || openSections[section.id]
            const hasActive = sectionHasActive(section)
            return (
              <div key={section.id} className="lt-nav-section" data-testid={`nav-section-${section.id}`}>
                {!collapsed && (
                  <button
                    className={`lt-nav-section-header ${hasActive ? 'lt-nav-section-header--active' : ''}`}
                    onClick={() => toggleSection(section.id)}
                    data-testid={`section-toggle-${section.id}`}
                  >
                    <span className="lt-nav-section-label">{section.label}</span>
                    <ChevronDown size={14} className={`lt-nav-section-chevron ${isOpen ? 'lt-nav-section-chevron--open' : ''}`} />
                  </button>
                )}
                <div className={`lt-nav-section-items ${isOpen ? 'lt-nav-section-items--open' : ''}`} style={!collapsed && !isOpen ? {maxHeight: 0, opacity: 0, overflow: 'hidden'} : {}}>
                  {section.items.map((item) => {
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
                        <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                        {!collapsed && <span>{item.label}</span>}
                        {item.hasNotif && notifCount > 0 && (
                          <span className="lt-sidebar-notif-badge" data-testid="sidebar-notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>
                        )}
                        {active && !collapsed && <div className="lt-sidebar-active-dot" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="lt-sidebar-bottom">
          <button
            className="lt-sidebar-item lt-sidebar-item--theme"
            onClick={() => setDark(d => !d)}
            title={dark ? 'Mode clair' : 'Mode sombre'}
            data-testid="sidebar-dark-toggle"
          >
            {dark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
            {!collapsed && <span>{dark ? 'Mode clair' : 'Mode sombre'}</span>}
          </button>
          <button
            className="lt-sidebar-item lt-sidebar-item--logout"
            onClick={handleLogout}
            title="Déconnexion"
            data-testid="sidebar-logout"
          >
            <LogOut size={18} strokeWidth={1.8} />
            {!collapsed && <span>Déconnexion</span>}
          </button>

          <button
            className="lt-sidebar-collapse-btn"
            onClick={toggle}
            data-testid="sidebar-toggle"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      <style>{`
        .lt-sidebar {
          position: fixed; top: 0; left: 0; z-index: 100;
          width: 240px; height: 100vh;
          background: #FFFFFF;
          border-right: 1px solid #E2E8F0;
          display: flex; flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .lt-sidebar--collapsed { width: 64px; }

        /* Logo */
        .lt-sidebar-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid #F1F5F9;
          min-height: 64px;
        }
        .lt-sidebar-logo-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: #2563EB;
          color: #FFF; font-family: 'Manrope', sans-serif;
          font-weight: 800; font-size: 1rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lt-sidebar-logo-text {
          font-family: 'Manrope', sans-serif;
          font-weight: 800; font-size: 1.1rem;
          color: #0F172A; letter-spacing: -0.04em;
          white-space: nowrap;
        }

        /* Nav */
        .lt-sidebar-nav {
          flex: 1; padding: 8px 8px;
          display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto;
        }
        .lt-sidebar-nav::-webkit-scrollbar { width: 4px; }
        .lt-sidebar-nav::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 2px; }

        /* Section group */
        .lt-nav-section { margin-bottom: 2px; }

        .lt-nav-section-header {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 6px 10px; margin-bottom: 1px;
          border: none; background: transparent;
          font-family: 'Manrope', sans-serif; font-size: .65rem;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          color: #94A3B8; cursor: pointer;
          transition: color 0.15s;
        }
        .lt-nav-section-header:hover { color: #475569; }
        .lt-nav-section-header--active { color: #2563EB; }

        .lt-nav-section-chevron {
          transition: transform 0.2s ease;
        }
        .lt-nav-section-chevron--open { transform: rotate(180deg); }

        .lt-nav-section-items {
          transition: max-height 0.25s ease, opacity 0.2s ease;
          max-height: 500px; opacity: 1;
        }

        /* Nav item */
        .lt-sidebar-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 8px;
          border: none; background: transparent;
          color: #64748B; cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem; font-weight: 500;
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
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          width: 5px; height: 5px; border-radius: 50%;
          background: #2563EB;
        }
        .lt-sidebar-item--logout { color: #94A3B8; }
        .lt-sidebar-item--logout:hover { color: #EF4444; background: #FEF2F2; }
        .lt-sidebar-item--theme { color: #94A3B8; }
        .lt-sidebar-item--theme:hover { color: #F59E0B; background: #FFFBEB; }
        .lt-sidebar-notif-badge {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          min-width: 16px; height: 16px; border-radius: 8px;
          background: #EF4444; color: #FFF;
          font-family: 'Inter', sans-serif; font-size: .55rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          animation: ltNotifPulse 2s ease infinite;
        }
        @keyframes ltNotifPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.3); }
          50% { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
        }

        /* Collapsed: center items, hide section headers */
        .lt-sidebar--collapsed .lt-sidebar-item {
          justify-content: center; padding: 9px;
        }
        .lt-sidebar--collapsed .lt-sidebar-logo {
          justify-content: center; padding: 20px 0 16px;
        }
        .lt-sidebar--collapsed .lt-nav-section { margin-bottom: 0; }
        .lt-sidebar--collapsed .lt-nav-section + .lt-nav-section {
          border-top: 1px solid #F1F5F9; padding-top: 4px; margin-top: 4px;
        }

        /* Bottom */
        .lt-sidebar-bottom {
          padding: 8px; border-top: 1px solid #F1F5F9;
          display: flex; flex-direction: column; gap: 2px;
        }
        .lt-sidebar-collapse-btn {
          display: flex; align-items: center; justify-content: center;
          width: 100%; padding: 7px; border-radius: 8px;
          border: 1px solid #E2E8F0; background: #FAFBFC;
          color: #94A3B8; cursor: pointer;
          transition: all 0.15s ease;
        }
        .lt-sidebar-collapse-btn:hover { background: #F1F5F9; color: #475569; }

        @media (max-width: 768px) {
          .lt-sidebar { display: none; }
        }
      `}</style>
    </>
  )
}

export default PremiumSidebar
