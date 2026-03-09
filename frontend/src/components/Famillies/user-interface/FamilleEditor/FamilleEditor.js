import {memo, useEffect, useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../../shared/ButtonComponent.js'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {Message} from 'primereact/message'
import {ColorPicker} from 'primereact/colorpicker'

import _ from 'lodash'

import {useFormik} from 'formik'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import IconDropdown from '../../../shared/IconDropdown/IconDropdown'
import {
  fetchIcons,
  getExistItem,
  getFamilles,
  getIcons,
  setEditFamille,
  setExistItem,
  setSelectedFamille,
} from '../../slice/famille.slice'
import {fetchValidator, getValidator} from '../../../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'

function FamilleEditor({selectedFamille, visible, famille, onHide, onSubmitHandler}) {
  // const visible = useAppSelector(getEditTag)

  // const selectedFamille = useAppSelector(getselectedFamille)
  //const existItem = useAppSelector(getAlreadyExist)
  const dispatch = useAppDispatch()

  const [color, setColor] = useState('2C3E50')
  const icons = useAppSelector(getIcons)
  const _validators = useSelector(getValidator)
  const existItem = useAppSelector(getExistItem)

  const [isValid, setIsValid] = useState(true)

  const validators = [
    {
      id: 'label',
      label: 'label',
      isRequired: 1,
      active: 1,
      isEdit: 1,
      min: 0,
      max: 100,
      regExp: '^(?!\\s*$).+',
      messageError: 'required',
    },
  ]
  const [selectedIcon, setSelectedIcon] = useState('')
  let famillesData = useAppSelector(getFamilles)
  const formik = useFormik({
    initialValues: {
      label: '',
      icon: '',
      bgColor: '',
    },
    // validate: (data) => {
    //   let errors = {}
    //   validators.forEach((validator) => {
    //     const _regExp = new RegExp(validator.regExp.slice(1, -1))
    //     if (validator.isRequired) {
    //       if (!data[validator.id]) {
    //         errors[validator.id] = '*'
    //       }
    //       if (!_regExp.test(data[validator.id])) {
    //         errors[validator.id] = validator.messageError
    //       }
    //     }
    //   })
    //   setIsValid(Object.keys(errors).length === 0)

    //   return errors
    // },
    onSubmit: (values, {resetForm}) => {
      // values = {...values, icon: selectedIcon, color: color, typeId: famillesData[0]?.typeId}
      // const errors = formik.validateForm(values)
      // if (Object.keys(errors).length === 0) {
      onSubmitHandler(values)

      setTimeout(() => {
        resetForm()
      }, 6000)
      // }
    },
  })

  let areAllRequiredFieldsFilled = () => {
    const requiredFields = validators.filter((validator) => validator.isRequired)
    return requiredFields.every((field) => !!formik.values[field.id])
  }

  const handleFormChange = (e) => {
    formik.handleChange(e)
  }

  const _onHide = () => {
    dispatch(setEditFamille(false))
    dispatch(setSelectedFamille(null))
    dispatch(setExistItem(false))
    formik.resetForm()
  }

  useEffect(() => {
    if (existItem) {
      setTimeout(() => {
        dispatch(setExistItem(false))
      }, 3000)
    }
  }, [existItem])

  useEffect(() => {
    formik.setValues({
      ...selectedFamille,
    })
  }, [selectedFamille])

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={_onHide} />
      <ButtonComponent label='Enregistrer' onClick={formik.handleSubmit} />
    </div>
  )

  useEffect(() => {
    dispatch(fetchIcons())
    formik.setFieldValue('bgColor', '6a4bdb')
  }, [])

  const _labelValidator = validators?.find((field) => field.id === 'label')
  return (
    <div>
      <DialogComponent
        visible={visible}
        footer={footer}
        header={'Nouveau famille'}
        onHide={_onHide}
      >
        <div className='flex justify-content-center'>
          {existItem && (
            <Message severity='error' text='The Family is Already Exist' className='w-6' />
          )}
        </div>

        <div className='my-3'>
          <label>
            <OlangItem olang={'famille.label'} />{' '}
            {_labelValidator?.isRequired && <span className='h3 text-danger'>*</span>}
          </label>
          <InputText
            name='label'
            className={`w-full font-semibold text-lg ${
              formik.errors?.label && formik.submitCount > 0 ? 'p-invalid' : null
            }`}
            onChange={formik.handleChange}
            value={formik.values?.label}
          />
        </div>

        <div className='my-3'>
          <IconDropdown
            name={'icon'}
            filter={true}
            optionValue='name'
            filterBy={'name'}
            className={'w-full font-semibold text-lg'}
            data={icons}
            onChange={formik.handleChange}
            value={formik.values.icon}
          />
        </div>

        <div className='my-3'>
          <label>
            <OlangItem olang={'famille.color'} />{' '}
          </label>
          <div>
            <ColorPicker
              name='bgColor'
              defaultColor='#6a4bdb'
              value={formik.values.bgColor}
              size={10}
              onChange={formik.handleChange}
            />
          </div>
        </div>
      </DialogComponent>
    </div>
  )
}

export default memo(FamilleEditor)
