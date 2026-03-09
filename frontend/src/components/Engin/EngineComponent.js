import React, {useEffect} from 'react'
import EnginList from './EnginList/EnginList'
import {EnginEditor} from './EnginEditor/EnginEditor'
import EnginDetail from './EnginDetail/EnginDetail'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {getShow, setSelectedEngine, setShow} from './slice/engin.slice'
import TypeEditor from './TypeEditor/TypeEditor'
import {useLocation} from 'react-router-dom'
import StatusHistoric from './StatusHistoric/StatusHistoric'

const EngineComponent = () => {
  let show = useAppSelector(getShow)

  const location = useLocation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (location.pathname !== '/view/engin/index') {
      dispatch(setShow(false))
      dispatch(setSelectedEngine(null))
    } else {
      dispatch(setShow(true))
    }
  }, [dispatch, location.pathname])

  return (
    <div>
      {show ? <EnginList /> : <EnginDetail />}
      <EnginEditor />
      <TypeEditor />
      <StatusHistoric />
    </div>
  )
}

export default EngineComponent
