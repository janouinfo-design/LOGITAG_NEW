import React from 'react'
import PlanningList from './PlanningList/PlanningList'
import {Outlet} from 'react-router-dom'

function PlanningComponent() {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default PlanningComponent
