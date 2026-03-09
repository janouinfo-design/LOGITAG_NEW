import React from 'react'
import AddressList from './AddressList/AddressList'
//import {getEditAddress} from '../../../../../store/slices/address.slice'
import { getEditAddress } from '../../../slice/addressDepot.slice'
import { useAppSelector } from '../../../../../hooks'
import { AddressEditor } from './AddressEditor/AddressEditor'

export const AddressComponent = () => {
  const isEdit = useAppSelector(getEditAddress)
  return (
    <div>
      {!isEdit && <AddressList />}
      {isEdit && <AddressEditor />}
    </div>
  )
}
//test