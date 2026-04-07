import {useState, useEffect, createContext, useContext} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {fetchCustomers, getCustomers} from '../../store/slices/customer.slice'
import PremiumSidebar from './PremiumSidebar'
import PremiumBottomNav from './PremiumBottomNav'
import {Menu, X, Building2, ChevronDown, Globe} from 'lucide-react'

const LayoutCtx = createContext({collapsed: false, toggle: () => {}, tenant: null, setTenant: () => {}})
export const useLayoutCtx = () => useContext(LayoutCtx)

const FULLSCREEN_PATHS = ['/tour/index', '/command/center']

const PremiumLayout = () => {
  const dispatch = useAppDispatch()
  const customers = useAppSelector(getCustomers)
  const [collapsed, setCollapsed] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [tenant, setTenant] = useState(null)
  const [tenantOpen, setTenantOpen] = useState(false)
  const location = useLocation()
  const isFullscreen = FULLSCREEN_PATHS.some((p) => location.pathname.includes(p))

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [dispatch])

  const clientList = Array.isArray(customers) ? customers : []

  return (
    <LayoutCtx.Provider value={{collapsed, toggle: () => setCollapsed((p) => !p), tenant, setTenant}}>
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
          style={isFullscreen ? {marginLeft: 0, padding: 0} : {marginLeft: collapsed ? 64 : 240}}
          data-testid="premium-main"
        >
          {/* Tenant selector bar */}
          {!isFullscreen && (
            <div className="lt-tenant-bar" data-testid="tenant-bar">
              <div className="lt-tenant-current" onClick={() => setTenantOpen(!tenantOpen)} data-testid="tenant-selector">
                {tenant ? (
                  <><Building2 size={14} /><span className="lt-tenant-name">{tenant.name || tenant.label || tenant.codeClient}</span></>
                ) : (
                  <><Globe size={14} /><span className="lt-tenant-name">Tous les clients</span></>
                )}
                <ChevronDown size={13} className={`lt-tenant-chev ${tenantOpen ? 'lt-tenant-chev--open' : ''}`} />
              </div>
              {tenantOpen && (
                <>
                  <div className="lt-tenant-backdrop" onClick={() => setTenantOpen(false)} />
                  <div className="lt-tenant-dropdown" data-testid="tenant-dropdown">
                    <div
                      className={`lt-tenant-opt ${!tenant ? 'lt-tenant-opt--active' : ''}`}
                      onClick={() => { setTenant(null); setTenantOpen(false); }}
                      data-testid="tenant-all"
                    >
                      <Globe size={14} />
                      <span>Tous les clients</span>
                    </div>
                    {clientList.map((c, i) => (
                      <div
                        key={c.id || i}
                        className={`lt-tenant-opt ${tenant?.id === c.id ? 'lt-tenant-opt--active' : ''}`}
                        onClick={() => { setTenant(c); setTenantOpen(false); }}
                        data-testid={`tenant-opt-${i}`}
                      >
                        <Building2 size={14} />
                        <span>{c.name || c.label || c.codeClient || `Client ${i+1}`}</span>
                      </div>
                    ))}
                    {clientList.length === 0 && <div className="lt-tenant-empty">Aucun client</div>}
                  </div>
                </>
              )}
            </div>
          )}
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

        /* ── TENANT BAR ── */
        .lt-tenant-bar {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 22px;
          z-index: 50;
        }
        .lt-tenant-current {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #FFF;
          cursor: pointer;
          transition: all .15s;
          user-select: none;
        }
        .lt-tenant-current:hover { border-color: #2563EB; background: #EFF6FF; }
        .lt-tenant-current svg { color: #64748B; flex-shrink: 0; }
        .lt-tenant-name {
          font-family: 'Manrope', sans-serif;
          font-size: .82rem;
          font-weight: 700;
          color: #0F172A;
        }
        .lt-tenant-chev { color: #94A3B8; transition: transform .2s; }
        .lt-tenant-chev--open { transform: rotate(180deg); }
        .lt-tenant-backdrop {
          position: fixed;
          inset: 0;
          z-index: 49;
        }
        .lt-tenant-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: 260px;
          max-height: 340px;
          overflow-y: auto;
          background: #FFF;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 12px 32px rgba(0,0,0,.1);
          z-index: 50;
          padding: 6px;
          animation: ltTenantIn .15s ease;
        }
        @keyframes ltTenantIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .lt-tenant-opt {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: .8rem;
          color: #475569;
          transition: all .1s;
        }
        .lt-tenant-opt:hover { background: #F1F5F9; color: #0F172A; }
        .lt-tenant-opt--active { background: #EFF6FF; color: #2563EB; font-weight: 600; }
        .lt-tenant-opt svg { color: #94A3B8; flex-shrink: 0; }
        .lt-tenant-opt--active svg { color: #2563EB; }
        .lt-tenant-empty {
          padding: 20px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: .8rem;
          color: #94A3B8;
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .lt-tenant-bar { margin-bottom: 16px; }
          .lt-tenant-dropdown { min-width: 220px; left: 0; right: auto; }
        }
      `}</style>
    </LayoutCtx.Provider>
  )
}

export default PremiumLayout
