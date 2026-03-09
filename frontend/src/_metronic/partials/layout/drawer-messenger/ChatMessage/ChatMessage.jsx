import {Divider} from 'primereact/divider'
import {Image} from 'primereact/image'
import React, {useEffect, useState} from 'react'
import {useAppDispatch} from '../../../../../hooks'
import _ from 'lodash'
import {
  fetchConversationList,
  fetchMessagesList,
  getMessageList,
  readMsg,
  setDetailChat,
  setSelectedChat,
  userRead,
} from '../slice/Chat.slice'
import {useSelector} from 'react-redux'
import MessageCountainer from '../user-interface/msgList/messageCountainer'
import {InputText} from 'primereact/inputtext'
import {setDetailMessage} from '../slice/Chat.slice'

const ChatMessage = () => {
  const dispatch = useAppDispatch()
  const [input, setInput] = useState('')
  let [messages, setMessages] = useState([])

  const messageList = useSelector(getMessageList)

  function showDetails(msg, index) {
    console.log(msg, 'showDetails')

    let obj = {
      srcId: msg.srcId,
      srcObject: 'Engin',
    }
    dispatch(readMsg({id: msg.id}))
    dispatch(setSelectedChat(msg))
    dispatch(fetchConversationList(obj)).then((res) => {
      dispatch(setDetailChat(true))
      dispatch(userRead())
    })

    // dispatch(setDetailChat(true))
  }

  const filterBySearch = (event) => {
    let query = event.target.value
    query = query.toLowerCase().trim()
    setInput(query)
  }

  useEffect(() => {
    dispatch(fetchMessagesList())
  }, [])

  useEffect(() => {
    if (Array.isArray(messageList)) {
      setMessages(_.cloneDeep(messageList))
    } else {
      setMessages([])
    }
  }, [messageList])

  return (
    <div className='w-full'>
      <div>
        <div className='text-2xl font-semibold'>Chat</div>
        <Divider />
      </div>
      <div className='mb-4 '>
        <span className='p-input-icon-left w-full'>
          <i className='pi pi-search' />
          <InputText
            placeholder='Search'
            value={input}
            onChange={filterBySearch}
            style={{width: '100%'}}
          />
        </span>
      </div>
      {(messages || [])
        ?.filter((item) => (item.Object || '').toLowerCase().includes(input))
        .map((item, index) => (
          <MessageCountainer onClick={() => showDetails(item, index)} id={item.id} {...item} />
        ))}
    </div>
  )
}

export default ChatMessage
