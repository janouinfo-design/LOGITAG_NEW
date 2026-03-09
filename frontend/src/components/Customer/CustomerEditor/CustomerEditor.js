import React, {useEffect} from 'react'
import {InputNumber, InputText, InputTextarea} from 'primereact'
import {Button} from 'primereact'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  createOrUpdateCustomer,
  getAlreadyExist,
  getEditCustomer,
  getSelectedCustomer,
  setEditCustomer,
  setExistItem,
  setSelectedCustomer,
} from '../../../store/slices/customer.slice'
// import { getToastParams, setToastParams } from '../../../../store/slices/ui.slice'
import {DialogComponent} from '../../shared/DialogComponent/DialogComponent'
import {FileUploadeComponent} from '../../shared/FileUploaderComponent/FileUploadeComponent'
import _ from 'lodash'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {Image} from 'primereact/image'
import {Message} from 'primereact/message'
import {getValidator} from '../../Inventory/slice/inventory.slice'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'

export const CustomerEditor = (props) => {
  const [inputs, setInputs] = useState({})
  const [imageId, setImageId] = useState()
  const [isValid, setIsValid] = useState(false)
  const [imageChange, setImageChange] = useState(false)
  const [errors, setErrors] = useState({})
  const [inputValidity, setInputValidity] = useState({})
  const [isNotValid, setIsNotValid] = useState(true)
  const validators = useSelector(getValidator)

  const existItem = useAppSelector(getAlreadyExist)
  const selectedCustomer = useAppSelector(getSelectedCustomer)
  const editCustomer = useAppSelector(getEditCustomer)
  const dispatch = useAppDispatch()

  const onHide = () => {
    typeof props.onHide == 'function' && props.onHide()
    dispatch(setEditCustomer(false))
    dispatch(setExistItem(false))
    setIsNotValid(true)
    setInputValidity({})
  }

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedCustomer)
    old = {...old, [e.target.name]: e.target.value}
    dispatch(setSelectedCustomer(old))
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])
    setIsNotValid(!areAllRequiredFieldsFilled)
  }

  useEffect(() => {
    if (!selectedCustomer?.id) {
      setImageChange(true)
    } else if (selectedCustomer?.id) {
      setImageChange(false)
    }
  }, [selectedCustomer])

  useEffect(() => {
    if (existItem) {
      setTimeout(() => {
        dispatch(setExistItem(false))
      }, 3000)
    }
  }, [existItem])

  const onSave = async () => {
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedCustomer?.[validator.id]
        })
      setInputValidity(requiredFieldsValidity)
      return
    }
    dispatch(createOrUpdateCustomer(imageId)).then((res) => {
      if (res.payload) {
        onHide()
      }
    })
  }

  const footer = (
    <div className='flex gap-3 justify-content-end'>
      <Button onClick={onHide} className=' p-button-danger' label={'Annuler'} icon='pi pi-times' />
      <Button onClick={onSave} label={'Sauvegarder'} icon='pi pi-check' />
    </div>
  )
  const _codeValidator = validators.find((validator) => validator.id === 'code')
  const _labelValidator = validators.find((validator) => validator.id === 'label')
  return (
    <div>
      <DialogComponent
        visible={editCustomer}
        header={!inputs?.id ? 'Nouveau client' : 'Modification de client'}
        // style={{ width: '50vw' }}
        onHide={onHide}
        className='w-11 md:w-6'
        footer={footer}
      >
        <div className='flex justify-content-center'>
          {existItem && (
            <Message severity='error' text='The Customer is Already Exist' className='w-6' />
          )}
        </div>
        <div>
          <div className='my-4 mt-5'>
            <label htmlFor='code'>
              <OlangItem olang='Nom' />
              {_codeValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              name='code'
              id='code'
              value={selectedCustomer?.code}
              onChange={onInputChange}
              className={`w-full ${existItem ? 'p-invalid' : null} ${
                inputValidity['code'] == false ? 'p-invalid' : ''
              }`}
            />
          </div>
          <div>
            <label htmlFor='label'>
              <OlangItem olang='Label' />
              {_labelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
            </label>
            <InputText
              id='label'
              value={selectedCustomer?.label}
              onChange={onInputChange}
              name='label'
              className={`w-full ${existItem ? 'p-invalid' : null} ${
                inputValidity['label'] == false ? 'p-invalid' : ''
              }`}
            />
          </div>
        </div>
      </DialogComponent>
    </div>
  )
}
