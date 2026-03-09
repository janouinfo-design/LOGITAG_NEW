import React, {useEffect} from 'react'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {getSelectedUser, setUserView} from '../../slice/user.slice'
import {Divider} from 'primereact/divider'
import {TabPanel, TabView} from 'primereact/tabview'
import UserEditor from './UserEditor/UserEditor'
import {IoArrowUndoOutline} from 'react-icons/io5'
import ButtonComponent from '../../../../components/Shared/ButtonComponent/ButtonComponent'
import {useNavigate} from 'react-router-dom'

const UserDetailComponent = (props) => {
  const [inputs, setInputs] = useState({})
  const selectedUser = useSelector(getSelectedUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const onHide = () => {
    typeof props.onHide == 'function' && props.onHide()
    dispatch(setUserView('list'))
    navigate(props.root + '/list')
  }

  useEffect(() => {
    setInputs(selectedUser || {})
  }, [selectedUser])

  return (
    <div className='bg-white p-2 shadow-1'>
      <div className='my-2 flex align-items-between'>
        <div className='flex gap-3 align-items-center'>
          <ButtonComponent onClick={onHide} className='button-sm text-white p-button-sm p-1'>
            <IoArrowUndoOutline color='#fff' size={20} />
            <span className='ml-2'>Retour</span>
          </ButtonComponent>
          {!inputs?.id ? (
            <strong>Nouvelle utilisateur</strong>
          ) : (
            <strong className='text-lg'>{inputs.fullname}</strong>
          )}
        </div>
      </div>
      <Divider type='dashed' />
      <TabView>
        <TabPanel header='Général'>
          <UserEditor root={props.root} />
        </TabPanel>
        {/* <TabPanel header="Ambauche">

                </TabPanel> */}
      </TabView>
    </div>
  )
}

export default UserDetailComponent
