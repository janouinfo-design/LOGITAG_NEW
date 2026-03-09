import React from 'react'
import {Outlet} from 'react-router-dom'
import {useAppSelector} from '../../../hooks'
import {getSelectedGateway} from '../slice/gateway.slice'
import GatewayDetailComponent from './GatewayDetail/GatewayDetailComponent'
import {GatewayList} from './GatewayList/GatewayList'
export const GatewayComponent = () => {
  let selectedGateway = useAppSelector(getSelectedGateway)
  return <div>{selectedGateway ? <GatewayDetailComponent /> : <GatewayList />}</div>
}
