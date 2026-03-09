import {Toast} from 'primereact/toast'
import React, {useEffect, useRef} from 'react'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {getToastParams, setToastParams} from '../../../store/slices/ui.slice'

const ToastComponent = () => {
  const toast = useRef()
  const toastParams = useAppSelector(getToastParams)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (toastParams?.show) {
      toast.current.show(toastParams)
      dispatch(setToastParams({show: false}))
    }
  }, [toastParams?.show])

  return <Toast ref={toast} position='top-right' />
}

export default ToastComponent
