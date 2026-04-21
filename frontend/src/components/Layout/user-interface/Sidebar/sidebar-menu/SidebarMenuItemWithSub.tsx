import React from 'react'
import clsx from 'clsx'
import {useLocation} from 'react-router'
import {checkIsActive, WithChildren} from '../../../../../_metronic/helpers'
import {OlangItem} from '../../../../../components/shared/Olang/user-interface/OlangItem/OlangItem'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  olang?: string
}

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  olang,
  fontIcon,
  hasBullet,
}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const iconClass = fontIcon || icon || 'fa-solid fa-folder'

  return (
    <div
      className={clsx('menu-item menu-accordion lt-sidebar-item lt-sidebar-item-sub', {
        active: isActive,
        here: isActive,
      })}
      data-kt-menu-trigger='click'
      data-testid={`sidebar-parent-${(title || '').toLowerCase().replace(/\s+/g, '-')}`}
    >
      <span className='menu-link lt-sidebar-link' title={title} data-tooltip={title}>
        <span className='lt-sidebar-ico' aria-hidden='true'>
          <i className={iconClass}></i>
        </span>
        <span className='lt-sidebar-txt'>
          {olang ? <OlangItem olang={olang} /> : title}
        </span>
        <span className='lt-sidebar-arrow' aria-hidden='true'>
          <i className='fa-solid fa-chevron-right'></i>
        </span>
      </span>
      <div className={clsx('menu-sub menu-sub-accordion lt-sidebar-sub', {'menu-active-bg': isActive})}>
        {children}
      </div>
    </div>
  )
}

export {SidebarMenuItemWithSub}
