import {Card} from 'primereact/card'
import {useAppSelector} from '../../../../hooks'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../../shared/ButtonComponent'
import {InputSwitch} from 'primereact/inputswitch'
import _ from 'lodash'
import {
  createOrUpdateUser,
  getSelectedTeam,
  getselectedUser,
  getSelectedUser,
  setEditUser,
  setSelectedTeamV,
  setSelectedUser,
} from '../../slice/team.slice'
import {useDispatch} from 'react-redux'
import {useEffect, useState} from 'react'
import {fetchValidator, getValidator} from '../../../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'
import {Message} from 'primereact/message'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import {useFormik} from 'formik'
import {generateYupSchema} from '../../../../helpers/genereteYupValid'
import * as Yup from 'yup'

const UserEdit = ({dialogVisible, setDialogVisible}) => {
  const selectedUser = useAppSelector(getSelectedTeam)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const validators = useSelector(getValidator)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordConfirmationMessage, setPasswordConfirmationMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [disableMessage, setDisableMessage] = useState('')

  const validationSchema = Yup.object().shape({
    firstname: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Name is required'),
    addrMail: Yup.string()
      .email('Wrong email format')
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Email is required'),
    pass: Yup.string()
      .max(50, 'Maximum 50 symbols')
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
        'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character'
      ),
    pwd2: Yup.string()
      .max(50, 'Maximum 50 symbols')
      .required('Password is required')
      .oneOf([Yup.ref('pass')], "Password and Confirm Password didn't match"),
    active: Yup.boolean(),
  })

  const formik = useFormik({
    initialValues: {
      firstname: '',
      addrMail: '',
      pass: '',
      pwd2: '',
      active: true,
    },
    // validationSchema: validationSchema,
    onSubmit: (values) => {
      setLoading(true)
      dispatch(createOrUpdateUser(values)).then((res) => {
        setLoading(false)
        if (res.payload) {
          formik.resetForm()
          dispatch(setEditUser(false))
          dispatch(setSelectedUser(null))
          setDialogVisible(false)
        }
      })
    },
  })

  const reset = () => {
    setIsTyping(false)
    setDisableMessage('')
    setPasswordMessage('')
    setPasswordConfirmationMessage('')
  }

  const dialogTemplate = () => {
    return (
      <div className='flex'>
        <div>
          <p className='text-2xl'>{<OlangItem olang='user.edit' />}</p>
        </div>
      </div>
    )
  }

  const onHide = () => {
    formik.resetForm()
    dispatch(setEditUser(false))
    dispatch(setSelectedTeamV(null))
    setDialogVisible(false)
  }

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent loading={loading} label='Enregistrer' onClick={formik.submitForm} />
    </div>
  )

  useEffect(() => {
    dispatch(fetchValidator('user'))
  }, [])

  useEffect(() => {
    if (selectedUser) {
      formik.setValues({
        firstname: selectedUser?.firstname,
        addrMail: selectedUser?.addrMail || '',
        pass: selectedUser?.pass || '',
        active: selectedUser?.active == 1 ? true : false,
      })
    }
  }, [selectedUser])

  const _loginValidator = validators?.find((field) => field.id === 'login')
  const _addrMailValidator = validators?.find((field) => field.id === 'addrMail')
  const _passwordValidator = validators?.find((field) => field.id === 'pass')
  const _passwordValidator2 = validators?.find((field) => field.id === 'pwd2')

  return (
    <DialogComponent
      header={dialogTemplate}
      footer={footer}
      visible={dialogVisible}
      onHide={onHide}
      position='center'
    >
      <div className='my-4 mt-5'>
        <label>
          <OlangItem olang='user.username' />
          {_loginValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
        </label>
        <InputText
          name='firstname'
          value={formik.values.firstname}
          onChange={formik.handleChange}
          className={`w-full font-semibold text-lg ${
            formik.errors.firstname && formik.touched.firstname ? 'p-invalid' : ''
          }`}
        />
        {formik.errors.firstname && formik.touched.firstname && (
          <div className='p-error'>{formik.errors.firstname}</div>
        )}
      </div>
      <div className='my-4 mt-5'>
        <label>
          <OlangItem olang='user.email' />
          {_addrMailValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
        </label>
        <InputText
          name='addrMail'
          value={formik.values.addrMail}
          onChange={formik.handleChange}
          className={`w-full font-semibold text-lg ${
            formik.errors.addrMail && formik.touched.addrMail ? 'p-invalid' : ''
          }`}
        />
        {formik.errors.addrMail && formik.touched.addrMail && (
          <div className='p-error'>{formik.errors.addrMail}</div>
        )}
      </div>
      <div className='my-4 mt-5'>
        <label>
          <OlangItem olang='user.password' />
          {_passwordValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
        </label>
        <InputText
          type='password'
          name='pass'
          value={formik.values.pass}
          onChange={formik.handleChange}
          className={`w-full font-semibold text-lg ${
            formik.errors.pass && formik.touched.pass ? 'p-invalid' : ''
          }`}
        />
        {formik.errors.pass && formik.touched.pass && (
          <div className='p-error'>{formik.errors.pass}</div>
        )}
      </div>
      <div className='my-4 mt-5'>
        <label>
          <OlangItem olang='user.confirmation' />
          {_passwordValidator2?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
        </label>
        <InputText
          type='password'
          name='pwd2'
          id='pwd2'
          onChange={formik.handleChange}
          className={`w-full font-semibold text-lg ${
            formik.errors.pwd2 && formik.touched.pwd2 ? 'p-invalid' : ''
          }`}
          value={formik.values.pwd2}
        />
        {formik.errors.pwd2 && formik.touched.pwd2 && (
          <div className='p-error'>{formik.errors.pwd2}</div>
        )}
      </div>

      {/* <div className='my-5 flex align-items-center gap-2'>
        <label>
          <OlangItem olang='user.reset' />
        </label>
        <InputSwitch
          id='rest'
          name='rest'
          checked={selectedUser?.rest == 1 ? true : false}
          disabled={isTyping}
          onChange={onInputChange}
        />
        {disableMessage && <Message severity='info' text={disableMessage} />}
      </div> */}

      <div className='my-5 flex align-items-center gap-2'>
        <label>
          <OlangItem olang='user.active' />
        </label>
        <InputSwitch
          name='active'
          checked={formik.values.active == 1 ? true : false}
          onChange={formik.handleChange}
        />
      </div>
    </DialogComponent>
  )
}

export default UserEdit
