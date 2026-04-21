import {useEffect, useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../../shared/ButtonComponent.js'
import {InputSwitch} from 'primereact/inputswitch'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import * as Yup from 'yup'
import _ from 'lodash'
import {
  createTeam,
  fetchTypesStaff,
  getAlreadyExist,
  getEditTeam,
  getSelectedTeam,
  getTypesStaff,
  setEditTeam,
  setExistItem,
  setSelectedTeam,
  setSelectedTeamV,
} from '../../slice/team.slice'
import {Calendar} from 'primereact/calendar'
import {Button} from 'primereact/button'
import {Message} from 'primereact/message'
import {Dropdown} from 'primereact/dropdown'
import {getValidator} from '../../../Inventory/slice/inventory.slice'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useFormik} from 'formik'

function TeamEditor() {
  const visible = useAppSelector(getEditTeam)
  const selectedTeam = useAppSelector(getSelectedTeam)
  const existItem = useAppSelector(getAlreadyExist)
  const dispatch = useAppDispatch()
  const [inputs, setInputs] = useState({})
  const [disabled, setDisabled] = useState(true)
  const [imageId, setImageId] = useState()
  const [imageChange, setImageChange] = useState(false)
  const [statusOption, setStatusOption] = useState([])
  const [statusClick, setStatusClick] = useState()
  const [isValid, setIsValid] = useState(true)
  const validators = useAppSelector(getValidator)
  const status = useAppSelector(getTypesStaff)
  const [inputValidity, setInputValidity] = useState({})
  const [isNotValid, setIsNotValid] = useState(true)

  const generateYupSchema = (validationArray) => {
    if (!Array.isArray(validationArray)) return
    let schema = {}
    validationArray.forEach((rule) => {
      const {id, label, isRequired, messageError, max, min, regExp} = rule
      if (isRequired === 1 && rule.active) {
        let yupChain = Yup.string().required(messageError || `${label} is required`)
        if (max > 0) {
          yupChain = yupChain.max(max, `Maximum length exceeded (max: ${max})`)
        }
        if (min > 0) {
          yupChain = yupChain.min(min, `Minimum length not met (min: ${min})`)
        }
        if (regExp) {
          yupChain = yupChain.matches(new RegExp(regExp), 'Invalid format')
        }
        schema[id] = yupChain
      }
    })

    return Yup.object().shape(schema)
  }

  const validationSchema = generateYupSchema(validators)

  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      active: true,
      typeName: '',
      birthday: '',
      hireday: '',
      exitday: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      dispatch(createTeam(values)).then((res) => {
        if (res.payload) {
          onHide()
        }
      })
    },
  })

  const validateFields = (validators, old) => {
    let isValid = true
    validators.forEach((validator) => {
      const _regExp = new RegExp(validator.regExp.slice(1, -1))
      if (validator.isRequired && _regExp.test(old[validator.id]) === false) {
        isValid = false
      }
    })
    return isValid
  }

  const onInputChange = (e) => {
    // let old = _.cloneDeep(selectedTeam)
    let old = {
      ...selectedTeam,
      active: selectedTeam ? selectedTeam?.active == 1 : true,
      typeName: selectedTeam?.typeName,
      [e.target.name]: e.target.value,
    }
    setInputs(old)
    dispatch(setSelectedTeamV(old))
    let isLabel = validateFields(validators, old)
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])
    setIsNotValid(!areAllRequiredFieldsFilled || !isLabel)
  }

  const save = () => {
    // if (isNotValid) {
    //   const requiredFieldsValidity = {}
    //   validators
    //     .filter((validator) => validator.isRequired)
    //     .forEach((validator) => {
    //       requiredFieldsValidity[validator.id] = !!selectedTeam?.[validator.id]
    //     })
    //   setInputValidity(requiredFieldsValidity)
    //   return
    // }
  }

  const onHide = () => {
    formik.resetForm()
    dispatch(setEditTeam(false))
    dispatch(setStatusClick(null))
    dispatch(setExistItem(false))
  }

  const footer = (
    <div className='lt-user-edit-foot' data-testid='team-edit-footer'>
      <button
        type='button'
        className='lt-user-edit-btn lt-user-edit-btn--ghost'
        onClick={onHide}
        data-testid='team-edit-cancel-btn'
      >
        Annuler
      </button>
      <button
        type='button'
        className='lt-user-edit-btn lt-user-edit-btn--primary'
        onClick={formik.submitForm}
        data-testid='team-edit-save-btn'
      >
        <i className='pi pi-check' /> Enregistrer
      </button>
    </div>
  )

  const dialogHeader = () => {
    const isEdit = !!selectedTeam?.id
    return (
      <div className='lt-user-edit-head' data-testid='team-edit-header'>
        <div className='lt-user-edit-head-ico'>
          <i className={`pi ${isEdit ? 'pi-user-edit' : 'pi-users'}`} />
        </div>
        <div className='lt-user-edit-head-txt'>
          <h2 className='lt-user-edit-head-title'>
            {isEdit ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
          </h2>
          <p className='lt-user-edit-head-sub'>
            {isEdit
              ? "Mettez à jour les informations de l'employé."
              : 'Créez une fiche employé avec identité, fonction et dates clés.'}
          </p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!selectedTeam?.id) {
      setImageChange(true)
    } else if (selectedTeam?.id) {
      setImageChange(false)
    }
  }, [selectedTeam])

  useEffect(() => {
    if (existItem) {
      setTimeout(() => {
        dispatch(setExistItem(false))
      }, 3000)
    }
  }, [existItem])
  useEffect(() => {
    dispatch(
      setSelectedTeam({
        active: 1,
      })
    )
    setStatusOption([
      {name: 'selectionner', value: 0},
      ...status?.map((st) => ({
        name: st.label,
        value: st.id,
      })),
    ])
  }, [status])

  useEffect(() => {
    dispatch(fetchTypesStaff())
  }, [])

  const lastnameValidator = validators?.find((field) => field.id === 'lastname')
  const firstnameValidator = validators?.find((field) => field.id === 'firstname')
  const typeNameValidator = validators?.find((field) => field.id === 'typeName')

  return (
    <div>
      <DialogComponent
        visible={visible}
        footer={footer}
        header={dialogHeader}
        onHide={onHide}
        className='lt-user-edit-dialog'
      >
        <div className='lt-user-edit-body' data-testid='team-edit-body'>
          {existItem && (
            <div style={{marginBottom: 14}}>
              <Message severity='error' text='Ce collaborateur existe déjà' className='w-full' />
            </div>
          )}

          <div className='lt-user-edit-grid'>
            <div className='lt-user-edit-field'>
              <label className='lt-user-edit-label' htmlFor='lt-te-firstname'>
                Prénom {firstnameValidator?.isRequired == 1 && <span className='lt-user-edit-req'>*</span>}
              </label>
              <InputText
                id='lt-te-firstname'
                name='firstname'
                placeholder='ex: Zakaria'
                className={`lt-user-edit-input ${
                  formik.errors.firstname && formik.touched.firstname ? 'p-invalid' : ''
                }`}
                onChange={formik.handleChange}
                value={formik.values.firstname || ''}
                data-testid='team-edit-firstname'
              />
              {formik.errors.firstname && formik.touched.firstname && (
                <span className='lt-user-edit-err'>{formik.errors.firstname}</span>
              )}
            </div>

            <div className='lt-user-edit-field'>
              <label className='lt-user-edit-label' htmlFor='lt-te-lastname'>
                Nom {lastnameValidator?.isRequired == 1 && <span className='lt-user-edit-req'>*</span>}
              </label>
              <InputText
                id='lt-te-lastname'
                name='lastname'
                placeholder='ex: Rahali'
                className={`lt-user-edit-input ${
                  formik.errors.lastname && formik.touched.lastname ? 'p-invalid' : ''
                }`}
                onChange={formik.handleChange}
                value={formik.values.lastname || ''}
                data-testid='team-edit-lastname'
              />
              {formik.errors.lastname && formik.touched.lastname && (
                <span className='lt-user-edit-err'>{formik.errors.lastname}</span>
              )}
            </div>
          </div>

          <div className='lt-user-edit-field' style={{marginTop: 16}}>
            <label className='lt-user-edit-label'>
              Fonction {typeNameValidator?.isRequired == 1 && <span className='lt-user-edit-req'>*</span>}
            </label>
            <Dropdown
              name='typeName'
              value={formik.values.typeName}
              options={statusOption}
              optionLabel='name'
              onChange={formik.handleChange}
              placeholder='Sélectionner une fonction'
              className={`lt-user-edit-dropdown ${
                formik.errors.typeName && formik.touched.typeName ? 'p-invalid' : ''
              }`}
              data-testid='team-edit-typeName'
            />
            {formik.errors.typeName && formik.touched.typeName && (
              <span className='lt-user-edit-err'>{formik.errors.typeName}</span>
            )}
          </div>

          <div className='lt-user-edit-divider'>
            <span>Dates clés</span>
          </div>

          <div className='lt-user-edit-grid'>
            <div className='lt-user-edit-field'>
              <label className='lt-user-edit-label'>Anniversaire</label>
              <Calendar
                name='birthday'
                showIcon
                className={`lt-user-edit-calendar ${
                  formik.errors.birthday && formik.touched.birthday ? 'p-invalid' : ''
                }`}
                dateFormat='dd/mm/yy'
                onChange={formik.handleChange}
                placeholder='JJ/MM/AAAA'
                value={formik.values.birthday}
                data-testid='team-edit-birthday'
              />
              {formik.errors.birthday && formik.touched.birthday && (
                <span className='lt-user-edit-err'>{formik.errors.birthday}</span>
              )}
            </div>

            <div className='lt-user-edit-field'>
              <label className='lt-user-edit-label'>Date d'embauche</label>
              <Calendar
                name='hireday'
                showIcon
                className={`lt-user-edit-calendar ${
                  formik.errors.hireday && formik.touched.hireday ? 'p-invalid' : ''
                }`}
                dateFormat='dd/mm/yy'
                onChange={formik.handleChange}
                placeholder='JJ/MM/AAAA'
                value={formik.values.hireday}
                data-testid='team-edit-hireday'
              />
              {formik.errors.hireday && formik.touched.hireday && (
                <span className='lt-user-edit-err'>{formik.errors.hireday}</span>
              )}
            </div>
          </div>

          <div className='lt-user-edit-field' style={{marginTop: 16}}>
            <label className='lt-user-edit-label'>Date de sortie</label>
            <div style={{display: 'flex', gap: 8, alignItems: 'stretch'}}>
              <div style={{flex: 1, minWidth: 0}}>
                <Calendar
                  showIcon
                  disabled={disabled}
                  name='exitday'
                  dateFormat='dd/mm/yy'
                  className={`lt-user-edit-calendar ${
                    formik.errors.exitday && formik.touched.exitday ? 'p-invalid' : ''
                  }`}
                  onChange={formik.handleChange}
                  placeholder={disabled ? 'Activer le champ →' : 'JJ/MM/AAAA'}
                  value={formik.values.exitday}
                  data-testid='team-edit-exitday'
                />
              </div>
              <button
                type='button'
                onClick={() => setDisabled(!disabled)}
                className={`lt-user-edit-icon-btn ${disabled ? 'is-add' : 'is-remove'}`}
                title={disabled ? 'Ajouter une date de sortie' : 'Retirer la date de sortie'}
                data-testid='team-edit-exitday-toggle'
              >
                <i className={`pi ${disabled ? 'pi-plus' : 'pi-times'}`} />
              </button>
            </div>
            {formik.errors.exitday && formik.touched.exitday && (
              <span className='lt-user-edit-err'>{formik.errors.exitday}</span>
            )}
          </div>

          <div className='lt-user-edit-divider'>
            <span>Statut</span>
          </div>

          <div className='lt-user-edit-toggle-row' data-testid='team-edit-active-row'>
            <div>
              <div className='lt-user-edit-toggle-title'>Collaborateur actif</div>
              <div className='lt-user-edit-toggle-sub'>
                Décochez pour archiver le collaborateur sans le supprimer.
              </div>
            </div>
            <InputSwitch
              name='active'
              checked={!!formik.values.active}
              onChange={formik.handleChange}
              data-testid='team-edit-active-switch'
            />
          </div>
        </div>
      </DialogComponent>
    </div>
  )
}

export default TeamEditor
