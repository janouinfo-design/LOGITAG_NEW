import React, {useState} from 'react'
import clsx from 'clsx'
import {useLocation} from 'react-router'
import {checkIsActive, KTIcon, WithChildren} from '../../../../../_metronic/helpers'
import {useLayout} from '../../../core'
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
  const {config} = useLayout()
  const {app} = config
  const [isHovered, setIsHovered] = useState<boolean>(false)

  console.log('icons from isActive', to)

  return (
    <div
      className={clsx('menu-item ', {'bg-gray-500': isActive}, 'menu-accordion')}
      data-kt-menu-trigger='click'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`menu-link border-round-md ${isHovered ? 'bg-gray-500' : ''}`}>
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {!fontIcon && icon && (
          <span className='menu-icon'>
            <KTIcon iconName={icon} className='fs-2' />
          </span>
        )}
        {fontIcon && (
          <i
            className={clsx(
              `font-bold text-3xl ${isHovered ? 'text-white' : 'text-gray-600'}`,
              fontIcon
            )}
            style={{marginRight: '0.8rem', marginLeft: '0.3rem'}}
          ></i>
        )}
        <span
          className={`menu-title text-base font-semibold ${isHovered ? 'text-white' : 'text-700'}`}
        >
          {olang ? <OlangItem olang={olang} /> : title}
        </span>
        <span className='menu-arrow'></span>
      </span>
      <div className={clsx('menu-sub menu-sub-accordion', {'menu-active-bg': isActive})}>
        {children}
      </div>
    </div>
  )
}

export {SidebarMenuItemWithSub}
