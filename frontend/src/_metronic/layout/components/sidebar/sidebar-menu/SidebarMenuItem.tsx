import {FC} from 'react'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useLocation} from 'react-router'
import {checkIsActive, KTIcon, WithChildren} from '../../../../helpers'
import {useLayout} from '../../../core'
import { OlangItem } from '../../../../../components/shared/Olang/user-interface/OlangItem/OlangItem'


type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean,
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

  return (
    <div className='menu-item'>
      <Link className={clsx('menu-link without-sub', {active: isActive})} to={to}>
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {!fontIcon && icon  && (
          <span className='menu-icon'>
            {' '}
            <KTIcon iconName={icon} className='fs-2' />
          </span>
        )}
        {fontIcon  && (
          <i className={clsx('bi fs-3', fontIcon)}  style={{marginRight: '0.8rem',marginLeft: '0.3rem'}}></i>
        )}
        <span className='menu-title'>
          {olang ? <OlangItem olang={olang} /> : title}
        </span>
      </Link>
      {children}
    </div>
  )
}
//&& app?.sidebar?.default?.menu?.iconType === 'font'
export {SidebarMenuItem}
