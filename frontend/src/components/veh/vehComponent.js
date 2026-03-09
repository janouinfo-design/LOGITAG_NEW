import {useLocation} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {useEffect} from 'react'
import VehList from './vehList'
import VehEditor from './vehEditor'
import VehDetail from './vehDetail'
import {getShow, setShow} from './slice/veh.slice'

const VehComponent = () => {
  let show = useAppSelector(getShow)
  const location = useLocation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (location.pathname !== '/vehicule/index') {
      dispatch(setShow(false))
    } else {
      dispatch(setShow(true))
    }
  }, [dispatch, location.pathname])

  return (
    <div>
      {show ? <VehList /> : <VehDetail />}
      <VehEditor />
    </div>
  )
}

export default VehComponent
