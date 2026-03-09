import React from 'react'
import AlertList from './List/List'
import { useAppSelector } from '../../../hooks'
import { getEditAlert } from '../slice/slice'
import AlertEditor from './Editor/Editor'

function AlertComponent() {
  let edit = useAppSelector(getEditAlert)
  return (
    <div>
      {!edit ? <AlertList /> : <AlertEditor />}
    </div>
  )
}

export default AlertComponent