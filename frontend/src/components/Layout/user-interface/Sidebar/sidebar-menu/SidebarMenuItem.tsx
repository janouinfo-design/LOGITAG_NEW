import {FC} from 'react'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
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
  const iconClass = fontIcon || icon || 'fa-solid fa-circle-dot'

  return (
    <div
      className={clsx('menu-item lt-sidebar-item', {active: isActive})}
      data-testid={`sidebar-item-${(title || '').toLowerCase().replace(/\s+/g, '-')}`}
    >
      <Link
        className={clsx('menu-link lt-sidebar-link', {active: isActive})}
        to={to}
        title={title}
        data-tooltip={title}
      >
        {hasBullet ? (
          <span className='lt-sidebar-ico lt-sidebar-ico-bullet' aria-hidden='true'>
            <span className='lt-bullet' />
          </span>
        ) : (
          <span className='lt-sidebar-ico' aria-hidden='true'>
            <i className={iconClass}></i>
          </span>
        )}
        <span className='lt-sidebar-txt'>
          {olang ? <OlangItem olang={olang} /> : title}
        </span>
      </Link>
      {children}
    </div>
  )
}

export {SidebarMenuItem}
