import {useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {
  getDetailChat,
  getDetailMessage,
  saveConversation,
  setDetailChat,
  setDetailMessage,
  userRead,
} from '../../slice/Chat.slice'
import {Divider} from 'primereact/divider'
import {Button} from 'primereact/button'
import {getCurrentUser} from '../../../../../../components/User/slice/user.slice'
import Message from './Message'
import {InputText} from 'primereact/inputtext'
import {InputTextarea} from 'primereact/inputtextarea'
import {useDispatch} from 'react-redux'
import {ScrollPanel} from 'primereact/scrollpanel'
import moment from 'moment'
import {_uploadFile} from '../../../../../../components/shared/FileUploaderComponent/api'
import {API_BASE_URL_IMAGE} from '../../../../../../api/config'
import {getSelectedEngine} from '../../../../../../components/Engin/slice/engin.slice'

const DetailMessage = () => {
  const [value, setValue] = useState('')
  const [focus, setFocus] = useState(false)
  const [recording, setRecording] = useState(false)
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const [pendingAudioUrl, setPendingAudioUrl] = useState(null)
  const [pendingAudioBlob, setPendingAudioBlob] = useState(null)

  const detailMsg = useSelector(getDetailMessage)
  const showMsg = useSelector(getDetailChat)
  const currentUser = useSelector(getCurrentUser)
  const selectedEngine = useSelector(getSelectedEngine)
  const dispatch = useDispatch()

  const messageContainerRef = useRef()

  const bottomRef = useRef()
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  function sendMessage(customMessage, audioUrl) {
    console.log(customMessage, value, 'sendMessage')
    console.log(customMessage, value, 'sendMessage')
    // return
    let text =
      [value, customMessage].find((str) => typeof str === 'string' && str.trim().length > 0) || ''

    console.log(text, 'text sendMessage')
    if (!text) return
    let currentDate = new Date()
    currentDate = moment(currentDate).format('LT')
    let obj = {
      id: Date.now().toString(),
      Object: detailMsg?.[0]?.Object || selectedEngine?.reference || '',
      message: text, // keep the actual text or media URL so renderer can detect
      audioUrl: !!audioUrl,
      to: '',
      from: currentUser.userName,
      subject: detailMsg?.[0]?.Object || selectedEngine?.reference || '',
      image: detailMsg?.[0]?.image || selectedEngine?.image || '',
      Read: 1,
      datecom: currentDate,
      srcId: detailMsg[0]?.srcId || selectedEngine?.id,
    }

    console.log(obj, 'obj sendMessage')

    dispatch(saveConversation(obj)).then(() => {
      if (showMsg) {
        let newMsg = {
          id: Date.now().toString(),
          Object: detailMsg?.[0]?.Object,
          message: obj.message,
          to: '',
          from: currentUser.userName,
          datecom: obj.datecom,
        }
        const newDetailMsg = [...detailMsg, newMsg]
        dispatch(setDetailMessage(newDetailMsg))
        setValue('')
      }
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true})
      const recorder = new MediaRecorder(stream, {mimeType: 'audio/webm'})
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      recorder.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, {type: 'audio/webm'})
          const localUrl = URL.createObjectURL(blob)
          setPendingAudioBlob(blob)
          setPendingAudioUrl(localUrl)
        } catch (e) {}
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch (e) {
      // Permission denied or no device
    }
  }

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      }
    } catch (e) {
    } finally {
      setRecording(false)
    }
  }

  const discardPendingAudio = () => {
    try {
      if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl)
    } catch (e) {}
    setPendingAudioUrl(null)
    setPendingAudioBlob(null)
  }

  const confirmSendPendingAudio = async () => {
    if (!pendingAudioBlob) return
    try {
      setIsUploadingAudio(true)
      const file = new File([pendingAudioBlob], `chat_audio_${Date.now()}.webm`, {
        type: 'audio/webm',
      })

      const fd = new FormData()
      fd.append('File', file)
      const uploadRes = await _uploadFile(fd, {name: file.name})
      if (uploadRes?.success && uploadRes.result?.result) {
        const path = uploadRes.result.result
        const audioUrl = `${API_BASE_URL_IMAGE}${path}`
        sendMessage(audioUrl, true)
        discardPendingAudio()
      }
    } catch (e) {
    } finally {
      setIsUploadingAudio(false)
    }
  }

  function onClose() {
    dispatch(userRead())
    dispatch(setDetailChat(false))
  }

  const onEnterPress = (e) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    if (messageContainerRef.current?.scrollHeight) {
      setTimeout(() => {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
      }, 1000)
    }
  }, [detailMsg, messageContainerRef.current?.scrollHeight])

  useEffect(() => {
    bottomRef.current.scrollIntoView()
  }, [detailMsg])

  return (
    <div className='w-full flex-1 relative'>
      <div className='w-full p-2 flex flex-row justify-content-between items-center'>
        <div className='text-2xl font-semibold'>
          {detailMsg?.[0]?.Object || selectedEngine?.reference}
        </div>
        <Button
          onClick={onClose}
          icon='pi pi-times'
          rounded
          text
          severity='danger'
          aria-label='Cancel'
        />
      </div>
      <Divider />
      <ScrollPanel ref={messageContainerRef} style={{width: '100%', height: '70vh'}}>
        <div className='flex flex-column flex-1 p-3'>
          {detailMsg?.map((msg) => (
            <Message in={currentUser.userName === msg.from} id={msg.id} {...msg} />
          ))}
        </div>
        <div ref={bottomRef} />
      </ScrollPanel>
      <div
        style={{
          bottom: '30px',
          position: 'absolute',
          width: '100%',
          backgroundColor: 'white',
          zIndex: '5',
        }}
      >
        <Divider />
        <div
          className={`flex border-round-xl shadow-2 flex-wrap p-2 w-100 flex-row justify-content-between align-items-center gap-2  w-full border-2 ${
            focus ? 'border-blue-400' : 'border-blue-100'
          }`}
        >
          {pendingAudioUrl && (
            <div className='flex align-items-center gap-2 w-12 p-2 border-round-sm bg-gray-50'>
              <audio controls src={pendingAudioUrl} style={{maxWidth: '100%'}} />
              <Button
                size='small'
                icon='pi pi-check'
                severity='success'
                onClick={confirmSendPendingAudio}
                disabled={isUploadingAudio}
                tooltip='Send audio'
              />
              <Button
                size='small'
                icon='pi pi-trash'
                severity='danger'
                onClick={discardPendingAudio}
                disabled={isUploadingAudio}
                tooltip='Delete audio'
              />
            </div>
          )}
          <div className='flex flex-row justify-between w-full'>
            <InputTextarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={focus ? 3 : 1}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder='Envoyer un message...'
              className='w-full'
              onKeyDown={onEnterPress}
            />
            <div className='flex gap-3 align-items-center justify-content-end px-2'>
              <Button
                size='small'
                icon={recording ? 'pi pi-stop' : 'pi pi-microphone'}
                // label={recording ? 'Stop' : 'Rec'}
                severity={recording ? 'danger' : 'secondary'}
                onClick={recording ? stopRecording : startRecording}
                disabled={isUploadingAudio}
              />
              {isUploadingAudio && <span className='text-sm text-blue-500'>Uploading...</span>}
              <Button size='small' icon='pi pi-send' severity='primary' onClick={sendMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailMessage
