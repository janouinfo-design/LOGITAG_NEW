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
        header={selectedSite?.id ? 'Modifier le site' : 'Nouveau site'}
        onHide={onHide}
        style={{width: 560, maxWidth: '95vw'}}
      >
        {existItem && (
          <div style={{marginBottom: 14}}>
            <Message severity='error' text='Ce site existe déjà' style={{width: '100%'}} />
          </div>
        )}

        {selectedCLient ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: '#EEF2FF', color: '#4F46E5',
            fontSize: '0.85rem', fontWeight: 700, marginBottom: 18,
          }}>
            <i className='pi pi-briefcase' style={{fontSize: '0.8rem'}}></i>
            Client : {selectedCLient?.code || selectedCLient?.label}
          </div>
        ) : (
          <div style={{marginBottom: 16}}>
            <label>Client <span className='text-danger'>*</span></label>
            <Dropdown
              filter
              options={dropdownOptions}
              onChange={handleCustomerChange}
              optionLabel='label'
              placeholder='Sélectionner un client'
              value={selectedCustomer ? selectedCustomer?.label : null}
              className='w-full'
              data-testid='site-editor-customer'
            />
          </div>
        )}

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
          <div>
            <label htmlFor='label'>
              <OlangItem olang='Label' />
              {_labelValidator?.isRequired == 1 && <span className='text-danger'>*</span>}
            </label>
            <InputText
              id='label'
              name='label'
              onChange={onInputChange}
              value={selectedSite?.label || ''}
              placeholder='Nom du site'
              className={`w-full ${existItem || inputValidity['label'] == false ? 'p-invalid' : ''}`}
              data-testid='site-editor-label'
            />
            {inputValidity['label'] == false && <small className='p-error'>{_labelValidator?.messageError || 'Champ requis'}</small>}
          </div>

          <div>
            <label htmlFor='name'>
              <OlangItem olang='Name' />
              {_nameValidator?.isRequired == 1 && <span className='text-danger'>*</span>}
            </label>
            <InputText
              id='name'
              name='name'
              onChange={onInputChange}
              value={selectedSite?.name || ''}
              placeholder='Identifiant'
              className={`w-full ${existItem || inputValidity['name'] == false ? 'p-invalid' : ''}`}
              data-testid='site-editor-name'
            />
          </div>

          <div>
            <label htmlFor='code'>Code</label>
            <InputText
              id='code'
              name='code'
              onChange={onInputChange}
              value={selectedSite?.code || ''}
              placeholder='Code du site'
              className='w-full'
              data-testid='site-editor-code'
            />
          </div>

          <div>
            <label htmlFor='reference'>Référence</label>
            <InputText
              id='reference'
              name='reference'
              onChange={onInputChange}
              value={selectedSite?.reference || ''}
              placeholder='Référence interne'
              className='w-full'
              data-testid='site-editor-reference'
            />
          </div>

          <div style={{gridColumn: '1 / -1'}}>
            <label htmlFor='description'>Description</label>
            <InputText
              id='description'
              name='description'
              onChange={onInputChange}
              value={selectedSite?.description || ''}
              placeholder='Description optionnelle'
              className='w-full'
              data-testid='site-editor-description'
            />
          </div>

          <div style={{gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0'}}>
            <label htmlFor='active' style={{margin: 0, fontWeight: 600, flex: 1}}>Site actif</label>
            <InputSwitch
              inputId='active'
              name='active'
              checked={selectedSite?.active == null ? true : !!selectedSite?.active}
              onChange={onInputChange}
              data-testid='site-editor-active'
            />
          </div>
        </div>
      </DialogComponent>
    </div>
  )
}

export default memo(SiteEditor)
