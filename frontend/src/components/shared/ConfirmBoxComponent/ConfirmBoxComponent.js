import {ConfirmDialog} from 'primereact/confirmdialog'
import {useSelector, useDispatch} from 'react-redux'
import React, {useEffect} from 'react'
import {getAlertParams, setAlertParams} from '../../../store/slices/alert.slice'

export const ConfirmBoxComponent = () => {
  const alertOprions = useSelector(getAlertParams)
  const dispatch = useDispatch()
  const onHide = () => {
    dispatch(setAlertParams({visible: false}))
  }

  useEffect(() => {
  }, [alertOprions])

  return (
    <div>
      <ConfirmDialog
        {...alertOprions}
        header={alertOprions.title || 'Alert'}
        onHide={alertOprions.onHide || onHide}
        style={{minWidth: '400px', minHeight: '200px'}}
      />
    </div>
  )
}
