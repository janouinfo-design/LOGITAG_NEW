import {useLocation} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../hooks'
import InventoryList from './InventoryList'
import {getShow, setShow} from './slice/inventory.slice'
import InventoryDetail from './InventoryDetail/InventoryDetail'
import InventoryEditor from './InventoryEditor'
import {useEffect} from 'react'

const InventoryComponent = () => {
  let show = useAppSelector(getShow)

  const location = useLocation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (location.pathname !== '/inventory/index') {
      dispatch(setShow(false))
    } else {
      dispatch(setShow(true))
    }
  }, [dispatch, location.pathname])

  return (
    <div>
      {show ? <InventoryList /> : <InventoryDetail />}
      <InventoryEditor />
      {/* <TypeEditor /> */}
    </div>
  )
}

export default InventoryComponent
