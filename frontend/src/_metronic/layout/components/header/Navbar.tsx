import clsx from 'clsx'
import {KTIcon, toAbsoluteUrl} from '../../../helpers'
import {HeaderUserMenu} from '../../../partials'
import {useLayout} from '../../core'
import {useAppSelector} from '../../../../hooks'
import {getCurrentUser} from '../../../../components/User/slice/user.slice'
import { API_BASE_URL_IMAGE } from '../../../../api/config'

const itemClass = 'ms-1 ms-lg-3'
const userAvatarClass = 'symbol-35px symbol-md-40px'
const btnIconClass = 'fs-1'

const Navbar = () => {
  const {config} = useLayout()

  const currentUser = useAppSelector(getCurrentUser)
  const IMAGE_BASE_URL = API_BASE_URL_IMAGE

  return (
    <div className='app-navbar flex-shrink-0'>
      <div className={clsx('app-navbar-item', itemClass)}>
        <div
          className={clsx('cursor-pointer symbol', userAvatarClass)}
          data-kt-menu-trigger="{default: 'click'}"
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
          title='Mon compte'
        >
          <img src={toAbsoluteUrl(IMAGE_BASE_URL + currentUser?.image)} alt='' />
        </div>
        <HeaderUserMenu />
      </div>

      {config.app?.header?.default?.menu?.display && (
        <div className='app-navbar-item d-none d-lg-none ms-2 me-n3' title='Show header menu'>
          <div
            className='btn btn-icon btn-active-color-primary w-35px h-35px'
            id='kt_app_header_menu_toggle'
          >
            <KTIcon iconName='text-align-left' className={btnIconClass} />
          </div>
        </div>
      )}
    </div>
  )
}

export {Navbar}
