import React from 'react'
import AddressList from './AddressList/AddressList'
import {AddressEditor} from './AddressEditor/AddressEditor'
import {useAppSelector} from '../../hooks'
import {getEditAddress} from '../../store/slices/address.slice'

export const AddressComponent = () => {
  const isEdit = useAppSelector(getEditAddress)
  return (
    <div>
      {!isEdit && <AddressList />}
      {isEdit && <AddressEditor />}
    </div>
  )
}
