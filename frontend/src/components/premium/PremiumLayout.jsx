import {useState, createContext, useContext} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import PremiumSidebar from './PremiumSidebar'
import PremiumBottomNav from './PremiumBottomNav'
import {Menu, X} from 'lucide-react'

const LayoutCtx = createContext({collapsed: false, toggle: () => {}})
export const useLayoutCtx = () => useContext(LayoutCtx)

const FULLSCREEN_PATHS = ['/tour/index']

const PremiumLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const location = useLocation()
  const isFullscreen = FULLSCREEN_PATHS.some((p) => location.pathname.includes(p))

  return (
    <LayoutCtx.Provider value={{collapsed, toggle: () => setCollapsed((p) => !p)}}>
      <div className="lt-premium-root" data-testid="premium-layout">
        {/* Normal sidebar for non-fullscreen pages */}
        {!isFullscreen && <PremiumSidebar />}

        {/* Overlay sidebar for fullscreen pages */}
        {isFullscreen && (
          <>
            <button
              className="lt-fs-menu-btn"
              onClick={() => setOverlayOpen(true)}
              data-testid="fullscreen-menu-btn"
            >
              <Menu size={20} />
            </button>
            {overlayOpen && (
              <div className="lt-fs-overlay" onClick={() => setOverlayOpen(false)} data-testid="fullscreen-overlay">
                <div className="lt-fs-sidebar" onClick={e => e.stopPropagation()}>
                  <button className="lt-fs-close" onClick={() => setOverlayOpen(false)}>
                    <X size={18} />
                  </button>
                  <PremiumSidebar />
                </div>
              </div>
            )}
          </>
        )}

        <main
          className="lt-premium-main"
          style={isFullscreen ? {marginLeft: 0, padding: 0} : {marginLeft: collapsed ? 72 : 260}}
          data-testid="premium-main"
        >
          <Outlet />
        </main>
        {!isFullscreen && <PremiumBottomNav />}
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

        /* Fullscreen menu button */
        .lt-fs-menu-btn {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 1100;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #FFF;
          color: #0F172A;
          box-shadow: 0 2px 12px rgba(0,0,0,.12);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all .15s;
        }
        .lt-fs-menu-btn:hover {
          background: #2563EB;
          color: #FFF;
          transform: scale(1.05);
        }

        /* Overlay */
        .lt-fs-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          background: rgba(15, 23, 42, .4);
          backdrop-filter: blur(4px);
          animation: ltFadeIn .2s ease;
        }
        @keyframes ltFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .lt-fs-sidebar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          animation: ltSlideIn .25s ease;
        }
        @keyframes ltSlideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        .lt-fs-close {
          position: absolute;
          top: 16px;
          right: -48px;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: #FFF;
          color: #0F172A;
          box-shadow: 0 2px 8px rgba(0,0,0,.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        .lt-fs-close:hover { background: #FEF2F2; color: #DC2626; }
      `}</style>
    </LayoutCtx.Provider>
  )
}

export default PremiumLayout
