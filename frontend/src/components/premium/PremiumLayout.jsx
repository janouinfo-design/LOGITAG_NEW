import {useState, createContext, useContext} from 'react'
import {Outlet} from 'react-router-dom'
import PremiumSidebar from './PremiumSidebar'
import PremiumBottomNav from './PremiumBottomNav'

const LayoutCtx = createContext({collapsed: false, toggle: () => {}})
export const useLayoutCtx = () => useContext(LayoutCtx)

const PremiumLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <LayoutCtx.Provider value={{collapsed, toggle: () => setCollapsed((p) => !p)}}>
      <div className="lt-premium-root" data-testid="premium-layout">
        <PremiumSidebar />
        <main
          className="lt-premium-main"
          style={{marginLeft: collapsed ? 72 : 260}}
          data-testid="premium-main"
        >
          <Outlet />
        </main>
        <PremiumBottomNav />
      </div>

      <style>{`
        .lt-premium-root {
          min-height: 100vh;
          background: #F8FAFC;
        }
        .lt-premium-main {
          min-height: 100vh;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 28px 32px;
        }
        @media (max-width: 768px) {
          .lt-premium-main {
            margin-left: 0 !important;
            padding: 20px 16px 90px;
          }
        }
      `}</style>
    </LayoutCtx.Provider>
  )
}

export default PremiumLayout
