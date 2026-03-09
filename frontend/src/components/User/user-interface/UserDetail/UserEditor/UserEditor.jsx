import React, {useEffect, useMemo} from 'react'
import {InputText} from 'primereact'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {createOrUpdateUser, getSelectedUser} from '../../../slice/user.slice'
import {setToastParams} from '../../../../../store/slices/ui.slice'
import {InputSwitch} from 'primereact/inputswitch'
import {Dropdown} from 'primereact/dropdown'
import ImageViewerComponent from '../../../../../components/Shared/ImageViewerComponent/ImageViewerComponent'
import ButtonComponent from '../../../../../components/Shared/ButtonComponent/ButtonComponent'
import {useNavigate} from 'react-router-dom'

const UserEditor = (props) => {
  const [inputs, setInputs] = useState({active: true})
  const [isValid, setIsValid] = useState(false)
  const selectedUser = useSelector(getSelectedUser)
  const navigate = useNavigate()
  const [roles] = useState([
    {label: 'Administrateur', value: 'admin'},
    {label: 'Utilisateur', value: 'user'},
  ])
  const dispatch = useDispatch()
  const onHide = () => {
    typeof props.onHide == 'function' && props.onHide()
    navigate(props.root + '/list')
  }

  let mandatories = useMemo(() => {
    return selectedUser?.id
      ? ['fname', 'sname', 'email', 'role']
      : ['fname', 'sname', 'email', 'pwd', 'role']
  }, [selectedUser?.id])

  const onInputChange = (e) => {
    setInputs((prev) => ({...prev, [e.target.name]: e.target.value}))
  }

  const onImage = (image) => {
    onInputChange({target: {name: 'photo', value: image}})
  }

  useEffect(() => {
    setInputs(selectedUser || {active: true})
  }, [selectedUser])

  useEffect(() => {
    if (inputs) {
      let valid = true

      if (!inputs?.id && inputs.pwd != inputs?.confPassword) valid = false
      else {
        for (const key of mandatories) {
          if (!inputs[key] || (Array.isArray(inputs[key]) && inputs[key].length == 0)) valid = false
        }
      }
      setIsValid(valid)
    } else {
      setIsValid(false)
    }
  }, [inputs, mandatories])

  const save = async () => {
    let data = {...inputs}
    delete data?.confPassword

    if (data?.active === undefined) data.active = true
    if (!data?.role) data.role = 'user'

    let res = (await dispatch(createOrUpdateUser(data))).payload

    if (!res.success)
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'ERREUR',
          detail: 'Opération échoué. Veuillez réessayer !!!',
        })
      )
    else {
      // dispatch(setToastParams({ show: true, severity: 'error', summary: "ERREUR", detail: "Opération échoué. Veuillez réessayer !!!" }))
      dispatch(setToastParams({show: true, severity: 'success'}))
      typeof props.onSave == 'function' && props.onSave()
      onHide()
    }
  }

  return (
    <div className='bg-white p-2 shadow-1'>
      <div className='p-2 lg:w-6 shadow-2'>
        <div>
          <div className='my-4 mt-5 flex justify-content-end' style={{height: '100px'}}>
            <ImageViewerComponent
              src={inputs?.photo || inputs?.image}
              onImage={onImage}
              className='shadow-1'
            />
          </div>
          <div className='my-4 mt-5 flex gap-2 align-items-center'>
            <label htmlFor='title' className='w-3  text-right'>
              Nom
            </label>
            <InputText
              name='fname'
              required={true}
              value={inputs.fname}
              onChange={onInputChange}
              className='w-9'
            />
          </div>
          <div className='my-4 mt-5 flex gap-2 align-items-center'>
            <label htmlFor='title' className='w-3  text-right'>
              Prénom
            </label>
            <InputText
              name='sname'
              required={true}
              value={inputs.sname}
              onChange={onInputChange}
              className='w-9'
            />
          </div>

          <div className='my-4 mt-5 flex gap-2 align-items-center'>
            <label htmlFor='title' className='w-3  text-right'>
              Email
            </label>
            <InputText
              name='email'
              type='email'
              required={true}
              value={inputs.email}
              onChange={onInputChange}
              className='w-9'
            />
          </div>
          {!inputs?.id && (
            <div>
              <div className='my-4 mt-5  flex gap-2 align-items-center'>
                <label htmlFor='title' className='w-3  text-right'>
                  Mot de passe
                </label>
                <InputText
                  name='pwd'
                  id='title'
                  type='pwd'
                  autoComplete=''
                  required={true}
                  value={inputs.pwd}
                  onChange={onInputChange}
                  className='w-9'
                />
              </div>
              <div className='my-4 mt-5 flex-wrap flex  align-items-center'>
                <label htmlFor='title' className='w-3 pr-2  text-right'>
                  Confirmer mot de passe
                </label>
                <InputText
                  name='confPassword'
                  className={`w-9`}
                  id='title'
                  type='password'
                  required={true}
                  disabled={!inputs?.pwd}
                  invalid
                  value={inputs.confPassword}
                  onChange={onInputChange}
                />
                {inputs?.confPassword && inputs?.pwd && inputs?.confPassword != inputs?.pwd && (
                  <div className='w-12 text-right text-red-400'> Incorrect </div>
                )}
              </div>
            </div>
          )}

          <div className='my-4  flex gap-2 align-items-center'>
            <label htmlFor='role' className='w-3  text-right'>
              Profile
            </label>
            <Dropdown
              name='role'
              value={inputs.role}
              onChange={onInputChange}
              filter
              options={roles /*.map( _i => ({label: _i.label , id: _i.id}))*/}
              className='w-9'
              display='chip'
            />
          </div>

          <div className='my-4  flex gap-2 align-items-center'>
            <label htmlFor='Roles' className='w-3  text-right'>
              Actif
            </label>
            <InputSwitch
              name='active'
              checked={inputs.active == 1}
              onChange={(e) => setInputs((prev) => ({...prev, active: e.checked ? 1 : 0}))}
            />
          </div>
        </div>
        <div className='flex gap-3 justify-content-end'>
          <ButtonComponent
            onClick={onHide}
            className=' p-button-danger'
            label={'Annuler'}
            icon='pi pi-times'
          />
          <ButtonComponent
            disabled={!isValid}
            onClick={save}
            label={'Sauvegarder'}
            icon='pi pi-check'
          />
        </div>
      </div>
    </div>
  )
}

export default UserEditor
