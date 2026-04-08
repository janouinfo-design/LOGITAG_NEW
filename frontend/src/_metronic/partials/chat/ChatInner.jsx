/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC, useState} from 'react'
import clsx from 'clsx'
import {toAbsoluteUrl, defaultMessages, defaultUserInfos, messageFromClient} from '../../helpers'
import ButtonComponent from '../../../components/shared/ButtonComponent'
import {OlangItem} from '../../../components/shared/Olang/user-interface/OlangItem/OlangItem'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {
  getChatMessages,
  getDetailMessage,
  setDetailChat,
} from '../layout/drawer-messenger/slice/Chat.slice'
import moment from 'moment'
import {socket} from '../../../socket/socket'
import {useSelector} from 'react-redux'

const bufferMessages = defaultMessages

const ChatInner = ({isDrawer = false}) => {
  const [chatUpdateFlag, toggleChatUpdateFlat] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(bufferMessages)
  const [userInfos] = useState(defaultUserInfos)

  const dataMsgt = useAppSelector(getChatMessages)
  const messageDetail = useSelector(getDetailMessage)
  const dispatch = useAppDispatch()

  const sendMessage = () => {
    const date = new Date()
    const formateDate = moment(date).format('hh:mm A')

    const msg = {
      From: 'rabi',
      ID: 10016,
      Message: message,
      Object: 'DRIL001',
      Time: '14:33',
    }
    const newMessage = {
      user: 2,
      type: 'out',
      text: message,
      time: formateDate,
    }

    alert('oooo')
    // socket.emit('data_message', {
    //   msg,
    // })
    bufferMessages.push(newMessage)
    setMessages(bufferMessages)
    toggleChatUpdateFlat(!chatUpdateFlag)
    setMessage('')
    setTimeout(() => {
      bufferMessages.push(messageFromClient)
      setMessages(() => bufferMessages)
      toggleChatUpdateFlat((flag) => !flag)
    }, 1000)
  }

  const onEnterPress = (e) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault()
      sendMessage()
    }
  }

  function closeDetail() {
    dispatch(setDetailChat(false))
  }

  return (
    <div
      className='card-body'
      id={isDrawer ? 'kt_drawer_chat_messenger_body' : 'kt_chat_messenger_body'}
    >
      <ButtonComponent onClick={closeDetail} className='mb-4'>
        <i className='fa-solid fa-share fa-flip-horizontal text-white'></i>
        <div className='ml-2 text-base font-semibold'>
          <OlangItem olang='btn.back' />
        </div>
      </ButtonComponent>
      <div
        className={clsx('scroll-y me-n5 pe-5', {'h-300px h-lg-auto': !isDrawer})}
        data-kt-element='messages'
        data-kt-scroll='true'
        data-kt-scroll-activate='{default: false, lg: true}'
        data-kt-scroll-max-height='auto'
        data-kt-scroll-dependencies={
          isDrawer
            ? '#kt_drawer_chat_messenger_header, #kt_drawer_chat_messenger_footer'
            : '#kt_header, #kt_app_header, #kt_app_toolbar, #kt_toolbar, #kt_footer, #kt_app_footer, #kt_chat_messenger_header, #kt_chat_messenger_footer'
        }
        data-kt-scroll-wrappers={
          isDrawer
            ? '#kt_drawer_chat_messenger_body'
            : '#kt_content, #kt_app_content, #kt_chat_messenger_body'
        }
        data-kt-scroll-offset={isDrawer ? '0px' : '5px'}
      >
        {dataMsgt?.map((message, index) => {
          const userInfo = userInfos[message.user]
          const state = message.type === 'in' ? 'info' : 'primary'
          const templateAttr = {}
          if (message.template) {
            Object.defineProperty(templateAttr, 'data-kt-element', {
              value: `template-${message.type}`,
            })
          }
          const contentClass = `${isDrawer ? '' : 'd-flex'} justify-content-${
            message.type === 'in' ? 'start' : 'end'
          } mb-10`
          return (
            <div
              key={`message${index}`}
              className={clsx('d-flex', contentClass, 'mb-10', {'d-none': message.template})}
              {...templateAttr}
            >
              <div
                className={clsx(
                  'd-flex flex-column align-items',
                  `align-items-${message.type === 'in' ? 'start' : 'end'}`
                )}
              >
                <div className='d-flex align-items-center mb-2'>
                  {message.type === 'in' ? (
                    <>
                      <div className='symbol symbol-35px symbol-circle '>
                        <img
                          src={require('../layout/drawer-messenger/assets/Trax.jpg')}
                          alt='Image'
                        />
                      </div>
                      <div className='ms-3'>
                        <a
                          href='#'
                          className='fs-5 fw-bolder text-gray-900 text-hover-primary me-1'
                        >
                          {message.user}
                        </a>
                        <span className='text-muted fs-7 mb-1'>{message.time}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='me-3'>
                        <span className='text-muted fs-7 mb-1'>{message.time}</span>
                        <a
                          href='#'
                          className='fs-5 fw-bolder text-gray-900 text-hover-primary ms-1'
                        >
                          You
                        </a>
                      </div>
                      <div className='symbol symbol-35px symbol-circle '>
                        <img
                          src={require('../layout/drawer-messenger/assets/Trax.jpg')}
                          alt='Image'
                        />{' '}
                      </div>
                    </>
                  )}
                </div>

                <div
                  className={clsx(
                    'p-5 rounded',
                    `bg-light-${state}`,
                    'text-dark fw-bold mw-lg-400px',
                    `text-${message.type === 'in' ? 'start' : 'end'}`
                  )}
                  data-kt-element='message-text'
                  dangerouslySetInnerHTML={{__html: message.message}}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      <div
        className='card-footer pt-4'
        id={isDrawer ? 'kt_drawer_chat_messenger_footer' : 'kt_chat_messenger_footer'}
      >
        <textarea
          className='form-control form-control-flush mb-3'
          rows={1}
          data-kt-element='input'
          placeholder='Type a message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onEnterPress}
        ></textarea>

        <div className='d-flex flex-stack'>
          <div className='d-flex align-items-center me-2'>
            <button
              className='btn btn-sm btn-icon btn-active-light-primary me-1'
              type='button'
              data-bs-toggle='tooltip'
              title='Coming soon'
            >
              <i className='bi bi-paperclip fs-3'></i>
            </button>
            <button
              className='btn btn-sm btn-icon btn-active-light-primary me-1'
              type='button'
              data-bs-toggle='tooltip'
              title='Coming soon'
            >
              <i className='bi bi-upload fs-3'></i>
            </button>
          </div>
          <button
            className='btn btn-primary'
            type='button'
            data-kt-element='send'
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export {ChatInner}
