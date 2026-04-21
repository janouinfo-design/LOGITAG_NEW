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
      sendCredentials: false,
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
    const isEdit = !!selectedUser?.id
    return (
      <div className='lt-user-edit-head' data-testid='user-edit-header'>
        <div className='lt-user-edit-head-ico'>
          <i className={`pi ${isEdit ? 'pi-user-edit' : 'pi-user-plus'}`} />
        </div>
        <div className='lt-user-edit-head-txt'>
          <h2 className='lt-user-edit-head-title'>
            {isEdit ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
          </h2>
          <p className='lt-user-edit-head-sub'>
            {isEdit
              ? 'Mettez à jour les informations et les accès de ce compte.'
              : 'Créez un compte avec identifiant, e-mail et mot de passe.'}
          </p>
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
    <div className='lt-user-edit-foot' data-testid='user-edit-footer'>
      <button
        type='button'
        className='lt-user-edit-btn lt-user-edit-btn--ghost'
        onClick={onHide}
        data-testid='user-edit-cancel-btn'
      >
        Annuler
      </button>
      <button
        type='button'
        className='lt-user-edit-btn lt-user-edit-btn--primary'
        onClick={formik.submitForm}
        disabled={loading}
        data-testid='user-edit-save-btn'
      >
        {loading ? (
          <span className='lt-user-edit-btn-loading'>
            <i className='pi pi-spin pi-spinner' /> Enregistrement…
          </span>
        ) : (
          <><i className='pi pi-check' /> Enregistrer</>
        )}
      </button>
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
      className='lt-user-edit-dialog'
    >
      <div className='lt-user-edit-body' data-testid='user-edit-body'>
        <div className='lt-user-edit-grid'>
          <div className='lt-user-edit-field'>
            <label className='lt-user-edit-label' htmlFor='lt-ue-firstname'>
              Identifiant {_loginValidator?.isRequired == 1 && <span className='lt-user-edit-req'>*</span>}
            </label>
            <InputText
              id='lt-ue-firstname'
              name='firstname'
              placeholder='ex: admin'
              value={formik.values.firstname || ''}
              onChange={formik.handleChange}
              className={`lt-user-edit-input ${
                formik.errors.firstname && formik.touched.firstname ? 'p-invalid' : ''
              }`}
              data-testid='user-edit-username'
            />
            {formik.errors.firstname && formik.touched.firstname && (
              <span className='lt-user-edit-err'>{formik.errors.firstname}</span>
            )}
          </div>

          <div className='lt-user-edit-field'>
            <label className='lt-user-edit-label' htmlFor='lt-ue-email'>
              Adresse e-mail {_addrMailValidator?.isRequired == 1 && <span className='lt-user-edit-req'>*</span>}
            </label>
            <InputText
              id='lt-ue-email'
              name='addrMail'
              type='email'
              placeholder='ex: admin@logitag.ch'
              value={formik.values.addrMail || ''}
              onChange={formik.handleChange}
              className={`lt-user-edit-input ${
                formik.errors.addrMail && formik.touched.addrMail ? 'p-invalid' : ''
              }`}
              data-testid='user-edit-email'
            />
            {formik.errors.addrMail && formik.touched.addrMail && (
              <span className='lt-user-edit-err'>{formik.errors.addrMail}</span>
            )}
          </div>
        </div>

        <div className='lt-user-edit-divider'>
          <span>Sécurité</span>
        </div>

        <div className='lt-user-edit-grid'>
          <div className='lt-user-edit-field'>
            <label className='lt-user-edit-label' htmlFor='lt-ue-pass'>
              Mot de passe {_passwordValidator?.isRequired == 1 && <span className='lt-user-edit-req'>*</span>}
            </label>
            <InputText
              id='lt-ue-pass'
              type='password'
              name='pass'
              placeholder='••••••••'
              value={formik.values.pass || ''}
              onChange={formik.handleChange}
              className={`lt-user-edit-input ${
                formik.errors.pass && formik.touched.pass ? 'p-invalid' : ''
              }`}
              data-testid='user-edit-password'
            />
            {formik.errors.pass && formik.touched.pass && (
              <span className='lt-user-edit-err'>{formik.errors.pass}</span>
            )}
          </div>

          <div className='lt-user-edit-field'>
            <label className='lt-user-edit-label' htmlFor='lt-ue-pwd2'>
              Confirmer le mot de passe {_passwordValidator2?.isRequired == 1 && <span className='lt-user-edit-req'>*</span>}
            </label>
            <InputText
              id='lt-ue-pwd2'
              type='password'
              name='pwd2'
              placeholder='••••••••'
              value={formik.values.pwd2 || ''}
              onChange={formik.handleChange}
              className={`lt-user-edit-input ${
                formik.errors.pwd2 && formik.touched.pwd2 ? 'p-invalid' : ''
              }`}
              data-testid='user-edit-pwd2'
            />
            {formik.errors.pwd2 && formik.touched.pwd2 && (
              <span className='lt-user-edit-err'>{formik.errors.pwd2}</span>
            )}
          </div>
        </div>

        <div className='lt-user-edit-divider'>
          <span>Statut</span>
        </div>

        <div className='lt-user-edit-toggle-row' data-testid='user-edit-active-row'>
          <div>
            <div className='lt-user-edit-toggle-title'>Compte actif</div>
            <div className='lt-user-edit-toggle-sub'>
              Si désactivé, l'utilisateur ne pourra plus se connecter.
            </div>
          </div>
          <InputSwitch
            name='active'
            checked={formik.values.active == 1 || formik.values.active === true}
            onChange={formik.handleChange}
            data-testid='user-edit-active-switch'
          />
        </div>

        <div
          className='lt-user-edit-check-row'
          data-testid='user-edit-sendmail-row'
          onClick={() => formik.setFieldValue('sendCredentials', !formik.values.sendCredentials)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '14px 16px',
            marginTop: 10,
            border: formik.values.sendCredentials ? '1px solid #1D4ED8' : '1px solid #E2E8F0',
            borderRadius: 12,
            background: formik.values.sendCredentials ? '#EFF6FF' : '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <input
            type='checkbox'
            name='sendCredentials'
            checked={!!formik.values.sendCredentials}
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
            className='lt-user-edit-check'
            data-testid='user-edit-sendmail-checkbox'
            style={{flexShrink: 0, marginTop: 3, width: 18, height: 18, accentColor: '#1D4ED8', cursor: 'pointer'}}
          />
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center'}}>
              <i className='pi pi-send' style={{marginRight: 7, color: '#1D4ED8', fontSize: '0.82rem'}} />
              Envoyer l'identifiant et le mot de passe par e-mail
            </div>
            <div style={{fontSize: '0.76rem', color: '#64748B', marginTop: 3, lineHeight: 1.4}}>
              L'utilisateur recevra ses accès sur l'adresse renseignée ci-dessus.
            </div>
          </div>
        </div>
      </div>
    </DialogComponent>
  )
}

export default UserEdit
