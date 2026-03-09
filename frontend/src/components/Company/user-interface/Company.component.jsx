import React, {useEffect} from 'react'
import CompanyList from './Comapnylist/CompanyList'
import {useLocation} from 'react-router-dom'
import {useAppDispatch} from '../../../hooks'
import {setEditAddress} from '../slice/company.slice'

const CompanyComponent = () => {
  const location = useLocation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (location.pathname !== '/Company/index') {
      dispatch(setEditAddress(true))
    } else {
      dispatch(setEditAddress(false))
    }
  }, [dispatch, location.pathname])

  return (
    <div>
      <CompanyList />
    </div>
  )
}

export default CompanyComponent
