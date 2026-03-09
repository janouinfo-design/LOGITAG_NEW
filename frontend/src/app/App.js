import {Suspense, useEffect, useRef, useState} from 'react'
import {Outlet} from 'react-router-dom'
import {I18nProvider} from '../_metronic/i18n/i18nProvider'
import {LayoutProvider, LayoutSplashScreen} from '../_metronic/layout/core'
import {MasterInit} from '../_metronic/layout/MasterInit'
// import {AuthInit} from './modules/auth'
import OlangEditor from '../components/shared/Olang/user-interface/OlangEditor/OlangEditor'
import {ConfirmBoxComponent} from '../components/shared/ConfirmBoxComponent/ConfirmBoxComponent'
import {socket} from '../socket/socket'
import {bindEvents, unbindEvents} from '../socket/socket'
import {useDispatch} from 'react-redux'
import {useAppDispatch, useAppSelector} from '../hooks'
import {fetchMenus} from '../components/Layout/slice/layout.slice'
import {setConfirm} from '../store/slices/confirmDialog.slice'
import {getUserAuth} from '../components/Navigxy/slice/navixy.slice'
import AlertErrorComponent from '../components/shared/AlertErrorComponent/AlertErrorComponent'
// import { isCancelable } from 'react-query/types/core/retryer'
import audioUri from '../assets/audio/mixkit-bell-notification-933.mp3'
import {
  getNotify,
  setNotify,
  userRead,
} from '../_metronic/partials/layout/drawer-messenger/slice/Chat.slice'
import ToastComponent from '../components/shared/ToastComponent/ToastComponent'
const App = () => {
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const dispatch = useAppDispatch()
  const notify = useAppSelector(getNotify)
  const audioRef = useRef()

  useEffect(() => {
    if (isSocketConnected) return
    dispatch(getUserAuth())
    dispatch(fetchMenus())
    audioRef.current = new Audio(audioUri)
    let timer = setTimeout(() => {
      bindEvents(dispatch)
      setIsSocketConnected(true)
    }, 2000)

    return () => {
      unbindEvents()
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    dispatch(userRead())
  }, [])

  useEffect(() => {
    console.log('notify', notify)
    if (notify && typeof audioRef.current.play == 'function') {
      audioRef.current.play()
      dispatch(setNotify(false))
    }
  }, [notify])

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          {/* <AuthInit> */}
          <Outlet />
          <ConfirmBoxComponent />
          <AlertErrorComponent />
          <ToastComponent />
          <OlangEditor />
          <MasterInit />
          {/* </AuthInit> */}
          <audio style={{display: 'none'}} ref={audioRef} src={audioUri}></audio>
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
  )
}

export {App}
