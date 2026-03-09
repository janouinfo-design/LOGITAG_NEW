
import React, {FC} from 'react'
import {KTIcon} from '../../../helpers'
import {useAppSelector} from '../../../../hooks'
import {getCurrentUser} from '../../../../components/User/slice/user.slice'
import ChatMessage from './ChatMessage/ChatMessage'
import {getDetailChat} from './slice/Chat.slice'
import {ChatInner} from '../../chat/ChatInner'
import DetailMessage from './user-interface/DetailMsg/DetailMessage'

const DrawerMessenger: FC = () => {
  const userInfo = useAppSelector(getCurrentUser)
  const detailMessage = useAppSelector(getDetailChat)
  console.log('detailMessage', detailMessage)

  return (
    <div
      id='kt_drawer_chat'
      className='bg-body'
      data-kt-drawer='true'
      data-kt-drawer-name='chat'
      data-kt-drawer-activate='true'
      data-kt-drawer-overlay='true'
      data-kt-drawer-width="{default:'300px', 'md': '500px'}"
      data-kt-drawer-direction='end'
      data-kt-drawer-toggle='#kt_drawer_chat_toggle'
      data-kt-drawer-close='#kt_drawer_chat_close'
    >
      {/* <div className='card w-100 rounded-0' id='kt_drawer_chat_messenger'>
        <div className='card-header pe-5' id='kt_drawer_chat_messenger_header'>
          <div className='card-title'>
            <div className='d-flex justify-content-center flex-column me-3'>
              <a
                href='#'
                className='fs-4 fw-bolder text-gray-900 text-hover-primary me-1 mb-2 lh-1'
              >
                {userInfo?.userName || 'Anonyme'}
              </a>
              <div className='mb-0 lh-1'>
                <span className='badge badge-success badge-circle w-10px h-10px me-1'></span>
                <span className='fs-7 fw-bold text-gray-400'>Active</span>
              </div>
            </div>
          </div>

          <div className='card-toolbar'>
            <div className='me-2'>
              <button
                className='btn btn-sm btn-icon btn-active-light-primary'
                data-kt-menu-trigger='click'
                data-kt-menu-placement='bottom-end'
                data-kt-menu-flip='top-end'
              >
                <i className='bi bi-three-dots fs-3'></i>
              </button>
            </div>

            <div className='btn btn-sm btn-icon btn-active-light-primary' id='kt_drawer_chat_close'>
              <KTIcon iconName='cross' className='fs-2' />
            </div>
          </div>
        </div>

        <ChatInner isDrawer={true} />
      </div> */}
      <div className='p-3 w-full flex flex-1'>
        {detailMessage ? <DetailMessage /> : <ChatMessage />}
      </div>
    </div>
  )
}

export {DrawerMessenger}
