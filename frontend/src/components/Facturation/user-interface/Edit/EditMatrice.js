import React, {useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {useAppDispatch} from '../../../../hooks'
import {setEditMatrice} from '../../slice/facturation.slice'

const EditMatrice = ({visible, setVisible}) => {
  const dispatch = useAppDispatch()

  const footer = <div>test</div>

  const onHide = () => {
    dispatch(setEditMatrice(false))
  }

  return (
    <DialogComponent
      visible={visible}
      footer={footer}
      header='modife test'
      onHide={onHide}
    ></DialogComponent>
  )
}

export default EditMatrice
