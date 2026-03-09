import React, {useState} from 'react'
import {Button} from 'primereact/button'
import {Dialog} from 'primereact/dialog'
import {useSelector} from 'react-redux'
import {getAlertError, setAlertError} from '../../../store/slices/alert.slice'
import {useDispatch} from 'react-redux'
import {OlangItem} from '../Olang/user-interface/OlangItem/OlangItem'

export default function AlertErrorComponent() {
  const alertError = useSelector(getAlertError)
  const dispatch = useDispatch()
  const headerElement = (
    <div className='inline-flex align-items-center justify-content-center gap-2'>
      <i className={`pi ${alertError.icon} text-3xl text-red-500`}></i>
      <span className='font-bold white-space-nowrap'>{alertError.header}</span>
    </div>
  )

  const footerContent = (
    <div>
      <Button
        label='Ok'
        icon='pi pi-check'
        onClick={alertError.accept}
        autoFocus
        severity='danger'
      />
    </div>
  )

  return (
    <div className='card flex justify-content-center'>
      <Dialog
        visible={alertError.visible}
        modal
        header={headerElement}
        footer={footerContent}
        style={{width: '400px'}}
        onHide={() => dispatch(setAlertError({visible: false}))}
      >
        <div className='text-xl'>
          <strong className='text-gray-800 text-xl'>{alertError?.message || ''}</strong>
          {alertError?.strongMsg && (
            <strong className='text-red-500 text-2xl font-bold'>{alertError.strongMsg}</strong>
          )}
        </div>
      </Dialog>
    </div>
  )
}
