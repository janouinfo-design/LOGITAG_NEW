import {memo, useEffect, useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../../shared/ButtonComponent.js'
import {InputSwitch} from 'primereact/inputswitch'
import {useAppDispatch, useAppSelector} from '../../../../hooks'

import _ from 'lodash'

import {
  createOrUpdateSite,
  getAlreadyExist,
  getEditSite,
  getSelectedSite,
  setDetailSite,
  setEditSite,
  setExistItem,
  setSelectedSite,
} from '../../slice/site.slice'
import {Dropdown} from 'primereact/dropdown'
import {
  fetchCustomers,
  getCustomers,
  getSelectedCustomer,
  setSelectedCustomer,
} from '../../../../store/slices/customer.slice'
import {Message} from 'primereact/message'
import * as Yup from 'yup'
import {fetchValidator, getValidator} from '../../../Inventory/slice/inventory.slice'
import {useSelector} from 'react-redux'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'

function SiteEditor({selectedCLient, save}) {
  const visible = useAppSelector(getEditSite)
  const selectedSite = useAppSelector(getSelectedSite)
  const existItem = useAppSelector(getAlreadyExist)
  const [isValid, setIsValid] = useState(true)
  const [inputs, setInputs] = useState({})
  //const [selectedCustomer, setSelectedCustomer] = useState(null)//removed
  const selectedCustomer = useAppSelector(getSelectedCustomer) //added
  const [inputValidity, setInputValidity] = useState({})
  const [isNotValid, setIsNotValid] = useState(true)
  const validators = useSelector(getValidator)

  const dispatch = useAppDispatch()
  let customers = useAppSelector(getCustomers)

  const onHide = () => {
    dispatch(setEditSite(false))
    dispatch(setExistItem(false))
    setIsNotValid(true)
    setInputValidity({})
  }

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
    let old = _.cloneDeep(selectedSite)
    old = {...old, customerID: selectedCustomer?.codeClient, [e.target.name]: e.target.value}
    setInputs(old)
    dispatch(setSelectedSite(old))
    let isLabelValid = validateFields(validators, old)
    const areAllRequiredFieldsFilled = validators
      .filter((validator) => validator.isRequired)
      .every((validator) => !!old[validator.id])
    setIsNotValid(!areAllRequiredFieldsFilled || !isLabelValid)
  }

  const onSave = () => {
    if (isNotValid) {
      const requiredFieldsValidity = {}
      validators
        .filter((validator) => validator.isRequired)
        .forEach((validator) => {
          requiredFieldsValidity[validator.id] = !!selectedSite?.[validator.id]
        })
      setInputValidity(requiredFieldsValidity)
      return
    }
    dispatch(createOrUpdateSite(selectedCustomer?.id)).then((res) => {
      if (res.payload) {
        onHide()
      }
    })
  }

  const functionToUse = onSave
  const dropdownOptions = customers.map((customer) => ({
    label: customer.label,
    value: customer.label,
  }))
  useEffect(() => {
    if (existItem) {
      setTimeout(() => {
        dispatch(setExistItem(false))
      }, 3000)
    }
  }, [existItem])

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregistrer' onClick={functionToUse} />
    </div>
  )
  const handleCustomerChange = (e) => {
    const selectedCustomer = customers.find((customer) => customer.label === e.value)
    setSelectedCustomer(selectedCustomer)
  }

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [])

  const _nameValidator = validators?.find((field) => field.id === 'name')
  const _labelValidator = validators?.find((field) => field.id === 'label')

  return (
    <div>
      <DialogComponent
        visible={visible}
        footer={footer}
        header={`${selectedSite?.id ? 'Edit Site' : 'New Site'}`}
        onHide={onHide}
      >
        <div className='flex justify-content-center'>
          {existItem && (
            <Message severity='error' text='The WorkSite is Already Exist' className='w-6' />
          )}
        </div>
        {selectedCLient ? (
          <div className='text-2xl font-semibold text-center'>{selectedCLient?.code}</div>
        ) : (
          <div div className='my-3'>
            <label>Customer's</label>
            <Dropdown
              filter
              options={dropdownOptions}
              onChange={handleCustomerChange}
              optionLabel='label'
              placeholder='Select a Costumer'
              value={selectedCustomer ? selectedCustomer?.label : null}
              className='w-full'
            />
          </div>
        )}

        <div className='my-3'>
          <label htmlFor='Label'>
            <OlangItem olang='Label' />
            {_labelValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
          </label>
          <InputText
            id='label'
            name='label'
            onChange={onInputChange}
            value={selectedSite?.label}
            className={`w-full ${existItem ? 'p-invalid' : null} ${
              inputValidity['label'] == false ? 'p-invalid' : ''
            }`}
          />
          {_labelValidator?.isRequired == 1 && (
            <small className='p-error'>{_labelValidator?.messageError}</small>
          )}
        </div>
        <div className='my-3'>
          <label htmlFor='Name'>
            <OlangItem olang='Name' />
            {_nameValidator?.isRequired == 1 && <span className='h3 text-danger'>*</span>}
          </label>
          <InputText
            id='name'
            name='name'
            className={`w-full ${existItem ? 'p-invalid' : null} ${
              inputValidity['name'] == false ? 'p-invalid' : ''
            }`}
            onChange={onInputChange}
            value={selectedSite?.name}
          />
          {_labelValidator?.isRequired == 1 && (
            <small className='p-error'>{_labelValidator?.messageError}</small>
          )}
        </div>
        <div className='my-3 flex align-items-center gap-2'>
          <label>Active</label>
          <InputSwitch
            name='active'
            checked={
              selectedSite?.active ? true : false || selectedSite?.active == null ? true : null
            }
            onChange={onInputChange}
          />
        </div>
      </DialogComponent>
    </div>
  )
}

export default memo(SiteEditor)
