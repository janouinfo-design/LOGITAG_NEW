
import {FC, Fragment, useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {Languages} from './Languages'
import {toAbsoluteUrl} from '../../../helpers'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {getCurrentUser, logout} from '../../../../components/User/slice/user.slice'
import ButtonComponent from '../../../../components/shared/ButtonComponent/ButtonComponent'
import {setEditLang, getEditLang, setCurrentLang} from '../../../../components/shared/Olang/slice/olang.slice'
import {Divider} from 'primereact/divider'
import {InputSwitch} from 'primereact/inputswitch'
import {getEnableNotification, setEnableNotification} from '../drawer-messenger/slice/Chat.slice'
import {API_BASE_URL_IMAGE} from '../../../../api/config'
import {Dialog} from 'primereact/dialog'
import QrCodeApk from '../../../../components/QrCodeApk/user-interface/QrCodeApk'
import {OlangItem} from '../../../../components/shared/Olang/user-interface/OlangItem/OlangItem'
import { Avatar } from 'primereact/avatar'
import { Chip } from 'primereact/chip'
import { setLanguage, useLang } from '../../../i18n/Metronici18n'
import { OverlayPanel } from 'primereact/overlaypanel'
import clsx from 'clsx'
import { Button } from 'primereact/button'



const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: toAbsoluteUrl('/media/flags/united-states.svg'),
  },
  {
    lang: 'de',
    name: 'German',
    flag: toAbsoluteUrl('/media/flags/germany.svg'),
  },
  {
    lang: 'fr',
    name: 'French',
    flag: toAbsoluteUrl('/media/flags/france.svg'),
  },
]

const HeaderUserMenu: FC = () => {
  const [qrCodeVisible, setQrCodeVisible] = useState(false)
  const currentUser = useAppSelector(getCurrentUser)
  console.log('currentUser:', currentUser)
  const IMAGE_BASE_URL = API_BASE_URL_IMAGE
  const dispatch = useAppDispatch()
  const _logout = () => dispatch(logout())
  const edit = useAppSelector(getEditLang)
  const enableNotification = useAppSelector(getEnableNotification)

  const lang = useLang()
  const currentLanguage = languages.find((x) => x.lang === lang)

  const op = useRef<OverlayPanel | null>(null)
  const startEditing = () => {
    dispatch(setEditLang(!edit))
  }

  const onHide = () => {
    setQrCodeVisible(false)
  }

  useEffect(() => {
    console.log('enableNotification:', enableNotification)
  }, [enableNotification])

  return (
    <Fragment>
      <Dialog position='bottom' style={{width: '50vw'}} visible={qrCodeVisible} onHide={onHide}>
        <QrCodeApk />
      </Dialog>
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-400px'
        data-kt-menu='true'
      >
        <div className='menu-item px-3'>
          <div className='menu-content d-flex align-items-center px-3'>
            <div className='w-full flex flex-col'>

            <div className='flex flex-row items-center gap-2'>
              <Avatar shape='circle' image={toAbsoluteUrl(IMAGE_BASE_URL + currentUser?.image)} className="flex align-items-center justify-content-center mr-2" size="xlarge" />
              <div className='flex flex-col'>
                <strong className='text-lg'> {currentUser?.fName.toUpperCase() + ' ' + currentUser?.lName.toUpperCase()}</strong>
                <strong className='text-lg text-slate-500'>{currentUser?.email || 'Exemple@logitag.com'}</strong>
              </div>
            </div>
            </div>

            {/* <div className='d-flex flex-column'>
              <div className='fw-bolder d-flex align-items-center fs-5'>
                {currentUser?.first_name} {currentUser?.userName}
                <span className='badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2'>Pro</span>
              </div>
              <a href='#' className='fw-bold text-muted text-hover-primary fs-7'>
                {currentUser?.email}
              </a>
            </div> */}
          </div>
        </div>

        {/* <div className='separator my-2'></div> */}
        
        <Divider />

        <div className='flex items-center justify-between rounded-2xl  px-4 py-3'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-[40px] h-[40px] bg-gray-200 rounded-full'>
                <i className='fas fa-duotone fa-solid fa-message-pen text-2xl text-gray-800' />
              </div>
                <div className='text-lg font-medium text-slate-900'><OlangItem olang="edit.lg"/></div>
            </div>
            <ButtonComponent
              icon={edit ? 'pi pi-eye-slash' : 'pi pi-pencil'}
              className='p-button-rounded p-button-text text-slate-600 hover:bg-white'
              onClick={startEditing}
            />
          </div>

        <div className='flex items-center justify-between rounded-2xl px-4 py-3 mt-1'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-[40px] h-[40px] bg-gray-200 rounded-full'>
                <i className='fas fa-duotone fa-solid fa-language text-2xl text-gray-800' />
              </div>
                <div className='text-lg font-medium text-slate-900'> <OlangItem olang="language"/></div>
            </div>
            <Chip className='cursor-pointer'   onClick={(event) => op.current?.toggle(event)}
                  label={currentLanguage?.name} image={currentLanguage?.flag} />
              <OverlayPanel style={{width: "200px"}} ref={op}>
               {languages.map((l) => (
                 <div
                   className='menu-item px-3'
                   key={l.lang}
                   onClick={() => {
                     setLanguage(l.lang)
                     dispatch(setCurrentLang(l.lang))
                   }}
                 >
                   <a
                     href='#'
                     className={clsx('menu-link d-flex px-5', {active: l.lang === currentLanguage?.lang})}
                   >
                     <span className='symbol symbol-20px me-4'>
                       <img className='rounded-1' src={l.flag} alt='metronic' />
                     </span>
                     {l.name}
                   </a>
                 </div>
               ))}
            </OverlayPanel>
          </div>

          <div className='flex items-center justify-between rounded-2xl px-4 py-3 mt-1'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-[40px] h-[40px] bg-gray-200 rounded-full'>
                <i className='fas fa-duotone fa-solid fa-bell-ring text-2xl text-gray-800' />
              </div>
                <div className='text-lg font-medium text-slate-900'><OlangItem olang="notification" /></div>
            </div>
            <InputSwitch
              checked={enableNotification}
              onChange={(e) => {
                dispatch(setEnableNotification(e.value))
              }}
              className='scale-90'
            />
          </div>
          

          <Divider />

          <div className='w-full flex items-center justify-center'>
            <Button
              className='w-[90%] bg-green-200 hover:bg-green-400 border-0 flex flex-row items-center justify-center gap-2 rounded-3xl'
              onClick={() => setQrCodeVisible(true)}
            >
              <i className='fas fa-duotone fa-light fa-mobile text-gray-800 text-xl' />
              <span className='text-gray-800 text-xl font-medium'><OlangItem olang="app.mobile" /></span>
            </Button>
          </div>

          <Divider />

           <div className='w-full flex items-center justify-center'>
            <Button
              className='w-[90%] bg-red-200 hover:bg-red-400 border-0 flex flex-row items-center justify-center gap-2 rounded-3xl'
              onClick={() => _logout()}
            >
              <i className='fas fa-duotone fa-solid fa-sign-out-alt text-gray-800 text-xl' />
              <span className='text-gray-800 text-xl font-medium'><OlangItem olang="logout" /></span>
            </Button>
          </div>


          {/* <div className='menu-item px-5 d-none'>
          <Link to={'/crafted/pages/profile'} className='menu-link px-5'>
            Profil
          </Link>
        </div>

        <div className='separator my-2'></div>

        <div className='flex justify-content-between pr-2'>
          <div className='w-12'>
            <Languages />
          </div>
          <ButtonComponent
            icon={edit ? 'pi pi-eye-splash' : 'pi pi-pencil'}
            className={`pr-2 ${edit ? 'p-button-danger' : 'p-button-warning'}`}
            onClick={startEditing}
          />
        </div>

        <div className='menu-item px-5 my-1 d-none'>
          <Link to='/crafted/account/settings' className='menu-link px-5'>
            Parametre de compte
          </Link>
        </div>
        <Divider />
        <div className='px-3 flex align-items-center flex-row justify-content-between'>
          <div className='flex align-items-center flex-row gap-2'>
            <InputSwitch
              checked={enableNotification}
              onChange={(e) => {
                dispatch(setEnableNotification(e.value))
              }}
            />
            <span>Notifications</span>
          </div>
        </div>
        <Divider />
        <div className='w-full pl-3 menu-item'>
          <ButtonComponent
            onClick={() => setQrCodeVisible(true)}
            icon='fas fa-solid fa-mobile-screen-button'
            className='bg-green-400 gap-2 flex align-items-center'
          >
            <OlangItem olang='app.mobile' />
          </ButtonComponent>
        </div>

        <div className='menu-item px-2 mt-3'>
          <a onClick={_logout} className='menu-link px-5'>
            Deconnexion
          </a>
        </div> */}
      </div>
    </Fragment>
  )
}

export {HeaderUserMenu}
