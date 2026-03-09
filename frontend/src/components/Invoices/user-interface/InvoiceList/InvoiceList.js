import {memo, useEffect, useRef, useState} from 'react'
import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {Dropdown} from 'primereact/dropdown'

import {SplitButton} from 'primereact/splitbutton'
import {
  fetchInvoices,
  getInvoices,
  setEditInvoice,
  setSelectedInvoice,
  removeInvoice,
  createOrUpdateInvoice,
  getInvoiceByCustomer,
  fetchInvoicesByCodeClient,
  getStatus,
  fetchStatus,
  setDetailInvoice,
  getMsgType,
  setMsgType,
} from '../../slice/invoice.slice'
import {Chip} from 'primereact/chip'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {getCustomers, fetchCustomers} from '../../../../store/slices/customer.slice'
import {useNavigate} from 'react-router-dom'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Toast} from 'primereact/toast'

const InvoiceList = () => {
  const [msg, setMsg] = useState(false)
  const messagesRef = useRef(null)

  let customers = useAppSelector(getCustomers)
  let msgType = useAppSelector(getMsgType)

  let invoiceByCustomer = useAppSelector(getInvoiceByCustomer)

  let invoices = useAppSelector(getInvoices)

  const dispatch = useAppDispatch()
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(setSelectedInvoice(e.item.data))
        dispatch(removeInvoice(e.item.data))
      },
    },
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(setSelectedInvoice(e.item.data))
        dispatch(setDetailInvoice(false))
      },
    },
  ]

  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.status}
      // icon={rowData?.status === 'confirmed' ? 'pi pi-check' : 'pi pi-times'}
      style={{background: `${rowData.backgroundColor}`, color: 'white'}}
    />
  )

  const columns = [
    {
      header: 'Client',
      field: 'Customername',
      filter: true,
      olang: 'Client',
    },
    {
      header: 'Reference',
      field: 'reference',
      olang: 'Référence',
      filter: true,
    },
    {
      header: 'Create Date',
      field: 'creaDate',
      olang: 'Create.Date',
    },
    {
      header: 'Order.Date',
      field: 'OrderDate',
      olang: 'Order.Date',
    },
    {
      header: 'Description',
      field: 'description',
      olang: 'Description',
      filter: true,
    },
    {
      header: 'Status',
      olang: 'status',
      field: 'status',
      body: activeTemplate,
    },
  ]

  const exportFields = [
    {label: 'Client', column: 'Customername'},
    {label: 'Référence', column: 'reference'},
    {label: 'Create Date', column: 'creaDate'},
    {label: 'Order Date', column: 'OrderDate'},
    {label: 'Description', column: 'description'},
    {label: 'Status', column: 'status'},
  ]

  const rowGroupTemplates = {
    Nom: (rowData) => <Chip label={rowData?.code} />,
  }

  useEffect(() => {
    dispatch(fetchCustomers())
    dispatch(fetchInvoices())
  }, [])

  useEffect(() => {
    if (msgType === 'failed') {
      messagesRef.current.show({
        severity: 'error',
        summary: 'Error Message',
        detail: 'cannot remove invoice paid',
        life: 3000,
        closable: true,
      })
    }
    setTimeout(() => {
      dispatch(setMsgType(null))
    }, 2000)
  }, [msgType])

  const handleCustomerChange = (e) => {
    const selectedCustomer = customers.find((customer) => customer.label === e.value)

    dispatch(fetchInvoicesByCodeClient(selectedCustomer.id))

    setSelectedCustomer(selectedCustomer)
  }

  const dropdownOptions = customers.map((customer) => ({
    label: customer.label,
    value: customer.label,
  }))

  let create = () => {
    dispatch(setEditInvoice(true))
    dispatch(setSelectedInvoice(null))
  }

  const fetchAllInvoices = () => {
    dispatch(setSelectedCustomer(null))
  }

  return (
    <div>
      {/* <h3 className='card text-white bg-primary p-5 my-4'>
        <OlangItem className='card-title' olang='Factures.par.client' />
      </h3> */}
      <Toast ref={messagesRef} />
      <div className='flex align-items-center mb-1'>
        <Dropdown
          filter
          value={selectedCustomer ? selectedCustomer?.label : null}
          options={dropdownOptions}
          onChange={handleCustomerChange}
          placeholder='Select a Costumer'
          className='w-full md:w-14rem m-2'
        />
        <ButtonComponent onClick={fetchAllInvoices} className={'font-bold'}>
          <OlangItem olang='All' />
        </ButtonComponent>
      </div>
      <DatatableComponent
        tableId='invoice-table'
        data={selectedCustomer ? invoiceByCustomer : invoices}
        columns={columns}
        onNew={create}
        exportFields={exportFields}
        rowGroupTemplates={rowGroupTemplates}
        contextMenuModel={actions}
        rowActions={actions}
      />
    </div>
  )
}

export default memo(InvoiceList)
