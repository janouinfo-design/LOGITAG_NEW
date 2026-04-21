import {SidebarMenuMain} from './SidebarMenuMain'

const SidebarMenu = () => {
  return (
    <div className='app-sidebar-menu flex-column-fluid'>
      <div
        id='kt_app_sidebar_menu_wrapper'
        className='app-sidebar-wrapper'
      >
        <div
          className='menu menu-column menu-rounded menu-sub-indention'
          id='#kt_app_sidebar_menu'
          data-kt-menu='true'
          data-kt-menu-expand='false'
        >
          <SidebarMenuMain />
        </div>
      </div>
    </div>
  )
}

export {SidebarMenu}
