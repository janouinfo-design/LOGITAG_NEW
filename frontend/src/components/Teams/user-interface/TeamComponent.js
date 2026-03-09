import {useLocation} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {getShow, setShow} from '../slice/team.slice'
import TeamDetail from './TeamDetail/TeamDetail'
import TeamEditor from './TeamEditor/TeamEditor'
import TeamList from './TeamList/TeamList'
import {useEffect} from 'react'

function TeamComponent() {
  let show = useAppSelector(getShow)

  const location = useLocation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (location.pathname !== '/view/staff/index') {
      dispatch(setShow(false))
    } else {
      dispatch(setShow(true))
    }
  }, [dispatch, location.pathname])

  return (
    <div>
      {show ? <TeamList titleShow={true} /> : <TeamDetail />}
      <TeamEditor />
    </div>
  )
}

export default TeamComponent
