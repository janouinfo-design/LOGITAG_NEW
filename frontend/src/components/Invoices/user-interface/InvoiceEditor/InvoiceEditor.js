import {memo, useEffect, useState} from 'react'
import {DialogComponent} from '../../../shared/DialogComponent'
import {InputText} from 'primereact/inputtext'
import ButtonComponent from '../../../shared/ButtonComponent.js'
import {InputSwitch} from 'primereact/inputswitch'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {InputMask} from 'primereact/inputmask'
import {Calendar} from 'primereact/calendar'

import _ from 'lodash'

import {
  createOrUpdateInvoice,
  fetchInvoices,
  fetchStatus,
  getAlreadyExist,
  getEditInvoice,
  getSelectedInvoice,
  getStatus,
  setDetailInvoice,
  setEditInvoice,
  setExistItem,
  setSelectedInvoice,
} from '../../slice/invoice.slice'
import {Dropdown} from 'primereact/dropdown'
import {fetchCustomers, getCustomers} from '../../../../store/slices/customer.slice'
import {Message} from 'primereact/message'
import moment from 'moment'

function InvoiceEditor() {
  const visible = useAppSelector(getEditInvoice)
  const selectedInvoice = useAppSelector(getSelectedInvoice)
  const dispatch = useAppDispatch()
  const [inputs, setInputs] = useState({})
  const [isValid, setIsValid] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customersOptions, setCustomersOptions] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)

  const existItem = useAppSelector(getAlreadyExist)

  let customers = useAppSelector(getCustomers)
  let status = useAppSelector(getStatus)

  const onHide = () => {
    dispatch(setEditInvoice(false))
    setSelectedOption(null)
  }

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedInvoice)

    old = {
      ...old,
      [e.target.name]: e.target.value,
    }
    setInputs(old)
    dispatch(setSelectedInvoice(old))
    setIsValid(true)
  }

  const save = () => {
    dispatch(setEditInvoice(false))
    dispatch(createOrUpdateInvoice({selectedCustomer, selectedOption})).then((res) => {
      if (res.payload) {
        dispatch(fetchInvoices)
        dispatch(setDetailInvoice(true))
        setSelectedOption(null)
      }
    })
  }
  const handleCustomerChange = (e) => {
    const _selectedCustomer = customers.find((customer) => customer.label === e.value)
    setSelectedCustomer(_selectedCustomer)
  }
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

  useEffect(() => {
    dispatch(fetchCustomers())
    dispatch(fetchStatus())
  }, [])

  useEffect(() => {
    setStatusOptions([
      {label: 'selectionner', value: 0},
      ...status.map((stat) => ({
        label: stat.label,
        value: stat.name,
      })),
    ])
  }, [status])

  const footer = (
    <div>
      <ButtonComponent label='Annuler' className='p-button-danger' onClick={onHide} />
      <ButtonComponent label='Enregistrer' onClick={save} disabled={!isValid} />
    </div>
  )

  return (
    <div>
      <DialogComponent
        visible={visible}
        footer={footer}
        header={`${selectedInvoice?.id ? 'Edit Invoice' : 'Create Invoice'}`}
        onHide={onHide}
      >
        <div className='flex justify-content-center'>
          {existItem && (
            <Message severity='error' text='The Invoice is Already Exist' className='w-6' />
          )}
        </div>
        <div div className='my-3'>
          <label>Customer</label>
          <Dropdown
            filter
            options={dropdownOptions}
            onChange={handleCustomerChange}
            optionValue='label'
            placeholder={
              selectedInvoice?.Customername ? `${selectedInvoice?.Customername}` : 'Select customer'
            }
            value={selectedCustomer ? selectedCustomer?.label : null}
            className='w-full'
          />
        </div>

        {/* <div className='my-3'>
          <label>Client</label>
          <Dropdown
            options={statusOptions}
            onChange={(e) => setSelectedOption(e.value)}
            optionValue='value'
            optionLabel='label'
            placeholder={selectedCustomer?.label ? `${selectedCustomer?.label}` : 'Select client'}
            value={selectedOption}
            className='w-full'
          />
        </div> */}

        <div className='my-3'>
          <label>Reference</label>
          <InputText
            name='reference'
            className='w-full'
            onChange={onInputChange}
            value={selectedInvoice?.reference}
          />
        </div>
        <div className='my-3'>
          <label>Description</label>
          <InputText
            name='description'
            className='w-full'
            onChange={onInputChange}
            value={selectedInvoice?.description}
          />
        </div>
        {/* <div className='my-3 flex flex-column'>
          <label>Create Date</label>
          <Calendar
            name='creaDate'
            className='w-full'
            onChange={onInputChange}
            placeholder={selectedInvoice?.creaDate ? `${selectedInvoice?.creaDate}` : 'dd/mm/yy'}
            dateFormat='dd/mm/yy'
            showIcon
            value={selectedInvoice?.creaDate}
          />
        </div> */}
        <div className='my-3'>
          <label>Order Date</label>
          <Calendar
            name='OrderDate'
            className='w-full'
            onChange={onInputChange}
            placeholder={selectedInvoice?.OrderDate ? `${selectedInvoice?.OrderDate}` : 'dd/mm/yy'}
            dateFormat='dd/mm/yy'
            showIcon
            value={selectedInvoice?.OrderDate}
          />
        </div>
        <div className='my-3'>
          <label>Lcation Price</label>
          <InputText
            name='locationPrice'
            className='w-full'
            onChange={onInputChange}
            value={selectedInvoice?.locationPrice}
          />
        </div>
        {selectedInvoice?.id && (
          <div className='my-3'>
            <label>Status</label>
            <Dropdown
              options={statusOptions}
              onChange={(e) => setSelectedOption(e.value)}
              optionValue='value'
              optionLabel='label'
              placeholder={selectedInvoice?.status ? `${selectedInvoice?.status}` : 'Select status'}
              value={selectedOption}
              className='w-full'
            />
          </div>
        )}
      </DialogComponent>
    </div>
  )
}

export default memo(InvoiceEditor)
