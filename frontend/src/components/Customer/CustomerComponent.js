import {useEffect} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {
  getDetailShow,
  setAddressDetail,
  setDetailShow,
  setDetailSiteClient,
  setSelectedSiteClient,
} from '../../store/slices/customer.slice'
import {CustomerEditor} from './CustomerEditor/CustomerEditor'
import ClientDetail from './CustomerList/ClientDetail'
import {CustomerList} from './CustomerList/CustomerList'
import {useLocation} from 'react-router-dom'
import {setShowMapSite} from '../Site/slice/site.slice'

const CustomerComponent = () => {
  let show = useAppSelector(getDetailShow)
  const location = useLocation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setDetailShow(true))
    dispatch(setSelectedSiteClient(null))
    dispatch(setDetailSiteClient(false))
    dispatch(setAddressDetail(false))
    dispatch(setShowMapSite(false))
  }, [dispatch, location.pathname])

  return (
    <div>
      {show ? <CustomerList /> : <ClientDetail />}
      <CustomerEditor />
    </div>
  )
}

export default CustomerComponent
