import {useNavigate, useLocation} from 'react-router-dom'
import {LayoutDashboard, Map, Box, Bell, Menu} from 'lucide-react'

const BOTTOM_ITEMS = [
  {id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/tagdashboard/index'},
  {id: 'map', label: 'Carte', icon: Map, path: '/tour/index'},
  {id: 'assets', label: 'Assets', icon: Box, path: '/view/engin/index'},
  {id: 'alerts', label: 'Alertes', icon: Bell, path: '/alert/index'},
  {id: 'menu', label: 'Menu', icon: Menu, path: '/menu/setup'},
]

const PremiumBottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <nav className="lt-bottomnav" data-testid="bottom-nav">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <button
              key={item.id}
              className={`lt-bottomnav-item ${active ? 'lt-bottomnav-item--active' : ''}`}
              onClick={() => navigate(item.path)}
              data-testid={`bottomnav-${item.id}`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <style>{`
        .lt-bottomnav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid #E2E8F0;
          padding: 6px 8px calc(env(safe-area-inset-bottom, 0px) + 6px);
          justify-content: space-around;
        }
        .lt-bottomnav-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 6px 12px; border-radius: 10px;
          border: none; background: transparent;
          color: #94A3B8; cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem; font-weight: 500;
          transition: all 0.15s ease;
        }
        .lt-bottomnav-item--active {
          color: #2563EB; font-weight: 600;
        }
        @media (max-width: 768px) {
          .lt-bottomnav { display: flex; }
        }
      `}</style>
    </>
  )
}

export default PremiumBottomNav
