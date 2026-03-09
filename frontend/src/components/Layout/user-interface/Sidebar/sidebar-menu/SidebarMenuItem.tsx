import {FC, useState} from 'react'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
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

const SidebarMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  olang,
  hasBullet = false,
}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const {config} = useLayout()
  const {app} = config
  const [isHovered, setIsHovered] = useState<boolean>(false)
  console.log('icons from sidebar', icon, fontIcon)

  return (
    <div className='menu-item p-2 border-round-md hover-elevate-up hover:bg-blue-100'>
      <Link
        className={clsx('menu-link without-sub', {'bg-blue-500': isActive})}
        to={to}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {!fontIcon && icon && (
          <span>
            <i className={fontIcon}></i>
          </span>
        )}
        {fontIcon && (
          <i
            className={clsx(`text-2xl ${isHovered ? 'text-blue-500' : 'text-700'}`, fontIcon, {
              'text-white': isActive,
            })}
            style={{marginRight: '0.8rem', marginLeft: '0.3rem'}}
          ></i>
        )}
        <span
          className={`menu-title text-base ${
            isHovered ? 'text-blue-500' : 'text-700'
          } font-semibold ${isActive ? 'text-white' : null}`}
        >
          {olang ? <OlangItem olang={olang} /> : title}
        </span>
      </Link>
      {children}
    </div>
  )
}
//&& app?.sidebar?.default?.menu?.iconType === 'font'
export {SidebarMenuItem}
