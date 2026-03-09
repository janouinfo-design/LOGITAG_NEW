import React from 'react'
import { Routes , Route } from 'react-router-dom'
import GatewayDetailComponent from './GatewayDetail/GatewayDetailComponent'
import { GatewayList } from './GatewayList/GatewayList'
import { GatewayComponent } from './GatewayComponent'
const root = "/admin/users"
const GatewayRoutes = () => {
  return (
    <Routes>
        <Route element={<GatewayComponent />}>
            <Route path="edit" element={<GatewayDetailComponent root={root}/>} />
            <Route index path="index" element={<GatewayList  root={root}/>} />
        </Route>
    </Routes>
  )
}

export default GatewayRoutes