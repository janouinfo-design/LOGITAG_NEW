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
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregistrer' onClick={formik.submitForm} />
    </div>
  )

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
        header={`${selectedTeam?.id ? 'Edit team' : 'Create team'}`}
        onHide={onHide}
      >
        <div className='flex justify-content-center'>
          {existItem && (
            <Message severity='error' text='This Member is already exist' className='w-6' />
          )}
        </div>
        <div className='my-3'>
          <label>
            <OlangItem olang='staff.firstname' />
            {firstnameValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
          </label>
          <InputText
            name='firstname'
            className={`w-full font-semibold text-lg ${
              formik.errors.firstname && formik.touched.firstname ? 'p-invalid' : ''
            }`}
            onChange={formik.handleChange}
            value={formik.values.firstname}
          />
          {formik.errors.firstname && formik.touched.firstname && (
            <div className='p-error'>{formik.errors.firstname}</div>
          )}
        </div>
        <div className='my-3'>
          <label>
            <OlangItem olang='staff.lastname' />
            {lastnameValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
          </label>
          <InputText
            name='lastname'
            className={`w-full font-semibold text-lg ${
              formik.errors.lastname && formik.touched.lastname ? 'p-invalid' : ''
            }`}
            onChange={formik.handleChange}
            value={formik.values.lastname}
          />
          {formik.errors.lastname && formik.touched.lastname && (
            <div className='p-error'>{formik.errors.lastname}</div>
          )}
        </div>
        <div className='my-3'>
          <label>
            <OlangItem olang='staff.fonction' />
            {typeNameValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
          </label>
          <Dropdown
            name='typeName'
            value={formik.values.typeName}
            options={statusOption}
            optionLabel='name'
            onChange={formik.handleChange}
            placeholder={'Select fonction'}
            className={`w-full font-semibold text-lg ${
              formik.errors.typeName && formik.touched.typeName ? 'p-invalid' : ''
            }`}
          />
          {formik.errors.typeName && formik.touched.typeName && (
            <div className='p-error'>{formik.errors.typeName}</div>
          )}
        </div>
        <div className='my-3 flex flex-column'>
          <label>Anniversaire</label>
          <Calendar
            name='birthday'
            showIcon
            className={`w-full font-semibold text-lg ${
              formik.errors.birthday && formik.touched.birthday ? 'p-invalid' : ''
            }`}
            dateFormat='dd/mm/yy'
            onChange={formik.handleChange}
            placeholder={'dd/mm/yy'}
            value={formik.values.birthday}
          />
          {formik.errors.birthday && formik.touched.birthday && (
            <div className='p-error'>{formik.errors.birthday}</div>
          )}
        </div>
        <div className='my-3 flex flex-column'>
          <label>
            <OlangItem olang='hireday' />
          </label>
          <Calendar
            name='hireday'
            showIcon
            className={`w-full font-semibold text-lg ${
              formik.errors.hireday && formik.touched.hireday ? 'p-invalid' : ''
            }`}
            dateFormat='dd/mm/yy'
            onChange={formik.handleChange}
            placeholder={'dd/mm/yy'}
            value={formik.values.hireday}
          />
          {formik.errors.hireday && formik.touched.hireday && (
            <div className='p-error'>{formik.errors.hireday}</div>
          )}
        </div>
        <div className='my-3 flex flex-column w-full'>
          <label>
            <OlangItem olang='exitday' />
          </label>
          <div className='flex flex-row w-full justify-content-between'>
            <Calendar
              style={{width: '95%'}}
              showIcon
              disabled={disabled}
              name='exitday'
              dateFormat='dd/mm/yy'
              className={` font-semibold text-lg ${
                formik.errors.exitday && formik.touched.exitday ? 'p-invalid' : ''
              }`}
              onChange={formik.handleChange}
              placeholder={'dd/mm/yy'}
              value={formik.values.exitday}
            />

            <Button
              icon={`${disabled ? 'pi pi-plus' : 'pi pi-times'}`}
              aria-label={`${disabled ? 'Filter' : 'Cancel'}`}
              severity={`${disabled ? 'success' : 'danger'}`}
              onClick={() => setDisabled(!disabled)}
            />
          </div>
          {formik.errors.exitday && formik.touched.exitday && (
            <div className='p-error'>{formik.errors.exitday}</div>
          )}
        </div>
        <div className='my-3 flex align-items-center gap-2'>
          <label>
            <OlangItem olang='active' />
          </label>
          <InputSwitch
            name='active'
            checked={formik.values.active}
            onChange={formik.handleChange}
          />
        </div>
      </DialogComponent>
    </div>
  )
}

export default TeamEditor
