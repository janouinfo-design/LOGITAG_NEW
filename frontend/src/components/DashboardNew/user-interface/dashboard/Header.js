import React from 'react'
import {classNames} from 'primereact/utils'
import {Button} from 'primereact/button'
import {InputText} from 'primereact/inputtext'
import {Avatar} from 'primereact/avatar'
import {Menu} from 'primereact/menu'

const Header = ({sidebarExpanded, onSidebarToggle, title = 'Dashboard'}) => {
  // const { theme, setTheme } = useTheme();
  const theme = 'light'
  const userMenuRef = React.useRef(null)

  const userMenuItems = [
    {
      label: 'Profil',
      icon: 'pi pi-user',
    },
    {
      label: 'Paramètres',
      icon: 'pi pi-cog',
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
    },
    {
      separator: true,
    },
    {
      label: 'Déconnexion',
      icon: 'pi pi-sign-out',
      className: 'text-red-500',
    },
  ]

  return (
    <header
      className={classNames(
        'h-16 fixed top-0 border-bottom-1 bg-surface z-5 transition-all duration-300 flex align-items-center',
        sidebarExpanded ? 'left-64 right-0' : 'left-16 right-0'
      )}
    >
      <div className='px-4 flex align-items-center justify-content-between w-full'>
        <div className='flex align-items-center'>
          <Button
            icon={sidebarExpanded ? 'pi pi-chevron-left' : 'pi pi-chevron-right'}
            onClick={onSidebarToggle}
            className='mr-3 p-button-text p-button-rounded'
            size='small'
          />

          <div className='flex align-items-center'>
            <i className='pi pi-th-large mr-2 text-primary'></i>
            <h1 className='text-xl font-semibold text-gradient'>{title}</h1>
          </div>
        </div>

        <div className='flex align-items-center gap-3'>
          <div className='relative hidden md:block'>
            <span className='p-input-icon-left'>
              <i className='pi pi-search' />
              <InputText
                type='search'
                placeholder='Rechercher...'
                className='p-inputtext-sm w-full md:w-20rem'
              />
            </span>
          </div>

          <Button icon='pi pi-bell' rounded text className='p-button-text' />

          <Button
            icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
            rounded
            text
          />

          <div>
            <Avatar
              image='/avatar.jpg'
              shape='circle'
              className='cursor-pointer'
              onClick={(e) => userMenuRef.current.toggle(e)}
            />
            <Menu model={userMenuItems} popup ref={userMenuRef} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
