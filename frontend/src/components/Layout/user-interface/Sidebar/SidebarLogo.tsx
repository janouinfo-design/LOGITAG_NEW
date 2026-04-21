import {Link} from 'react-router-dom'
import clsx from 'clsx'
import {KTIcon, toAbsoluteUrl} from '../../../../_metronic/helpers'
import {useLayout} from '../../core'
import {MutableRefObject, useEffect, useRef} from 'react'
import {ToggleComponent} from '../../../../_metronic/assets/ts/components'

type PropsType = {
  sidebarRef: MutableRefObject<HTMLDivElement | null>
}

const SidebarLogo = (props: PropsType) => {
  const {config} = useLayout()
  const toggleRef = useRef<HTMLDivElement>(null)

  const appSidebarDefaultMinimizeDesktopEnabled =
    config?.app?.sidebar?.default?.minimize?.desktop?.enabled
  const appSidebarDefaultCollapseDesktopEnabled =
    config?.app?.sidebar?.default?.collapse?.desktop?.enabled
  const toggleType = appSidebarDefaultCollapseDesktopEnabled
    ? 'collapse'
    : appSidebarDefaultMinimizeDesktopEnabled
    ? 'minimize'
    : ''
  const toggleState = appSidebarDefaultMinimizeDesktopEnabled ? 'active' : ''
  const appSidebarDefaultMinimizeDefault = config.app?.sidebar?.default?.minimize?.desktop?.default

  useEffect(() => {
    setTimeout(() => {
      const toggleObj = ToggleComponent.getInstance(toggleRef.current!) as ToggleComponent | null

      if (toggleObj === null) {
        return
      }

      // Add a class to prevent sidebar hover effect after toggle click
      toggleObj.on('kt.toggle.change', function () {
        // Set animation state
        props.sidebarRef.current!.classList.add('animating')

        // Wait till animation finishes
        setTimeout(function () {
          // Remove animation state
          props.sidebarRef.current!.classList.remove('animating')
        }, 300)
      })
    }, 600)
  }, [toggleRef, props.sidebarRef])

  return (
    <div
      style={{cursor: 'pointer', border: 'none'}}
      className='app-sidebar-logo px-6 pt-3'
      id='kt_app_sidebar_logo'
    >
      <Link to='/Company/index'>
        {config.layoutType === 'dark-sidebar' ? (
          // <img
          //   alt='Logo'
          //   src={toAbsoluteUrl('/media/logos/default-dark.svg')}
          //   className='h-25px app-sidebar-logo-default'
          // />
          <div className='lt-sidebar-brand'>
            <span className='lt-sidebar-brand-ico' aria-hidden='true'>
              <svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'>
                <path d='M32 4C20.4 4 11 13.4 11 25c0 12.6 15.2 29.2 19.3 33.5a2.4 2.4 0 0 0 3.4 0C37.8 54.2 53 37.6 53 25 53 13.4 43.6 4 32 4z' fill='currentColor' />
                <path d='M32 12c-3 0-5.8 1.2-7.9 3.2l2.5 2.5A7.5 7.5 0 0 1 32 15.5c2 0 3.9.8 5.3 2.2l2.6-2.5C37.8 13.2 35 12 32 12z' fill='#FFFFFF' />
                <path d='M32 18.5c-1.7 0-3.3.6-4.5 1.7l2.5 2.5a3 3 0 0 1 4 0l2.5-2.5A6.5 6.5 0 0 0 32 18.5z' fill='#FFFFFF' />
                <circle cx='32' cy='28' r='5' fill='#FFFFFF' />
              </svg>
            </span>
            <span className='lt-sidebar-brand-txt'>
              <span className='lt-sidebar-brand-name'>LOGITAG</span>
              <span className='lt-sidebar-brand-tag'>ASSETS TRACKING</span>
            </span>
          </div>
        ) : (
          <>
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/logos/default.svg')}
              className='h-25px app-sidebar-logo-default theme-light-show'
            />
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/logos/default-dark.svg')}
              className='h-25px app-sidebar-logo-default theme-dark-show'
            />
          </>
        )}

        <img
          alt='Logo'
          src={toAbsoluteUrl('/media/logos/default-small.svg')}
          className='d-none h-20px app-sidebar-logo-minimize'
        />
      </Link>

      {(appSidebarDefaultMinimizeDesktopEnabled || appSidebarDefaultCollapseDesktopEnabled) && (
        <div
          ref={toggleRef}
          id='kt_app_sidebar_toggle'
          className={clsx(
            'app-sidebar-toggle btn btn-icon btn-shadow btn-sm btn-color-muted btn-active-color-primary body-bg h-30px w-30px position-absolute top-50 start-100 translate-middle rotate',
            {active: appSidebarDefaultMinimizeDefault}
          )}
          data-kt-toggle='true'
          data-kt-toggle-state={toggleState}
          data-kt-toggle-target='body'
          data-kt-toggle-name={`app-sidebar-${toggleType}`}
          style={{display: 'none'}}
        >
          <KTIcon iconName='double-left' className='fs-2 rotate-180' />
        </div>
      )}
    </div>
  )
}

export {SidebarLogo}
