/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import clsx from 'clsx'
import {Link, NavLink, useLocation} from 'react-router-dom'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {useLayout} from '../../core'
import {Header} from './Header'
import {Navbar} from './Navbar'
import {useEffect} from 'react'

/* ── Quick action shortcuts in the header ── */
const QUICK_ACTIONS = [
  {to: '/view/engin/index', label: 'Engins', icon: 'fa-solid fa-truck-fast'},
  {to: '/tour/index', label: 'Map', icon: 'fa-solid fa-map-location-dot'},
  {to: '/reservations/index', label: 'Calendrier', icon: 'fa-solid fa-calendar-days'},
  {to: '/rapports/index', label: 'Rapports', icon: 'fa-solid fa-chart-column'},
]

const HeaderQuickActions = () => {
  const loc = useLocation()
  return (
    <div className='lt-header-quick' data-testid='header-quick-actions'>
      {QUICK_ACTIONS.map((a) => {
        const isActive = loc.pathname.startsWith(a.to)
        return (
          <NavLink
            key={a.to}
            to={a.to}
            className={`lt-header-quick-btn ${isActive ? 'is-active' : ''}`}
            data-testid={`header-quick-${a.label.toLowerCase()}`}
            title={a.label}
          >
            <i className={a.icon}></i>
            <span className='lt-header-quick-lbl'>{a.label}</span>
          </NavLink>
        )
      })}
    </div>
  )
}

export function HeaderWrapper() {
  const {config, classes} = useLayout()
  if (!config.app?.header?.display) {
    return null
  }

  const toggleSidebar = () => {
    const sidebar = document.querySelector('.app-header-menu')
    if (sidebar) {
      // sidebar.classList.toggle('active') // Ajoute ou retire la classe active
    }
  }

  useEffect(() => {
    // const toggleButton = document.getElementById('kt_app_sidebar_mobile_toggle')
    // if (toggleButton) {
    //   toggleButton.addEventListener('click', toggleSidebar)
    //   return () => toggleButton.removeEventListener('click', toggleSidebar)
    // }
  }, [])

  return (
    <div id='kt_app_header' className='app-header'>
      <div
        id='kt_app_header_container'
        className={clsx(
          'app-container flex-lg-grow-1 w-12',
          classes.headerContainer.join(' '),
          config.app?.header?.default?.containerClass
        )}
      >
        {config.app.sidebar?.display && (
          <>
            <div
              className='d-flex align-items-center d-lg-none ms-n2 me-2'
              title='Show sidebar menu'
            >
              <div
                className='btn btn-icon btn-active-color-primary w-35px h-35px'
                id='kt_app_sidebar_mobile_toggle'
                onClick={toggleSidebar}
              >
                <KTIcon iconName='abstract-14' className=' fs-1' />
              </div>
              <div className='d-none align-items-center flex-grow-1 flex-lg-grow-0'>
                <Link to='/dashboard' className='d-lg-none'>
                  <img
                    alt='Logo'
                    src={toAbsoluteUrl('/media/logos/default-small.svg')}
                    className='h-30px'
                  />
                </Link>
              </div>
            </div>
          </>
        )}

        {!(config.layoutType === 'dark-sidebar' || config.layoutType === 'light-sidebar') && (
          <div className='d-flex align-items-center flex-grow-1 flex-lg-grow-0 me-lg-15'>
            <Link to='/dashboard'>
              {config.layoutType !== 'dark-header' ? (
                <img
                  alt='Logo'
                  src={toAbsoluteUrl('/media/logos/default.svg')}
                  className='h-20px h-lg-30px app-sidebar-logo-default'
                />
              ) : (
                <>
                  <img
                    alt='Logo'
                    src={toAbsoluteUrl('/media/logos/default-dark.svg')}
                    className='h-20px h-lg-30px app-sidebar-logo-default theme-light-show'
                  />
                  <img
                    alt='Logo'
                    src={toAbsoluteUrl('/media/logos/default-small-dark.svg')}
                    className='h-20px h-lg-30px app-sidebar-logo-default theme-dark-show'
                  />
                </>
              )}
            </Link>
          </div>
        )}

        <div
          id='kt_app_header_wrapper'
          className='d-flex align-items-stretch justify-content-between flex-lg-grow-1'
        >
          {config.app.header.default?.content === 'menu' &&
            config.app.header.default.menu?.display && (
              <div
                className='app-header-menu app-header-mobile-drawer align-items-stretch'
                data-kt-drawer='true'
                data-kt-drawer-name='app-header-menu'
                data-kt-drawer-activate='{default: true, lg: false}'
                data-kt-drawer-overlay='true'
                data-kt-drawer-width='225px'
                data-kt-drawer-direction='end'
                data-kt-drawer-toggle='#kt_app_header_menu_toggle'
                data-kt-swapper='true'
                data-kt-swapper-mode="{default: 'append', lg: 'prepend'}"
                data-kt-swapper-parent="{default: '#kt_app_body', lg: '#kt_app_header_wrapper'}"
              >
                <Header />
              </div>
            )}
          <HeaderQuickActions />
          <Navbar />
        </div>
      </div>
    </div>
  )
}
