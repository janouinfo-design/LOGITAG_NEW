import {useEffect, useState} from 'react'

import {Chip} from 'primereact/chip'
import {useNavigate} from 'react-router-dom'
import {
  fetchCustomers,
  getCustomers,
  getSelectedCustomer,
  removeCustomer,
  setDetailShow,
  setEditCustomer,
  setSelectedCustomer,
} from '../../../store/slices/customer.slice'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'
import {CustomerEditor} from '../CustomerEditor/CustomerEditor'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {Image} from 'primereact/image'
import {ConfirmBoxComponent} from '../../shared/ConfirmBoxComponent/ConfirmBoxComponent'
import ButtonComponent from '../../shared/ButtonComponent/ButtonComponent'
import {setAlertParams} from '../../../store/slices/alert.slice'
import {API_BASE_URL_IMAGE} from '../../../api/config'
import {fetchValidator} from '../../Inventory/slice/inventory.slice'

export const CustomerList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const list = useAppSelector(getCustomers)
  const selectedCustomer = useAppSelector(getSelectedCustomer)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingButton, setIsLoadingButton] = useState(false)

  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        setIsLoading(true)
        dispatch(fetchValidator('customer'))
        dispatch(setSelectedCustomer(e.item.data))
        dispatch(setDetailShow(false))
      },
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(setSelectedCustomer(e.item.data))
        dispatch(removeCustomer(e.item.data))
      },
    },
  ]

  const imageTemplate = (rowData) => {
    const hasImage = rowData?.image
    return (
      <div className="lt-user-cell">
        {hasImage ? (
          <img
            src={`${API_BASE_URL_IMAGE}${rowData.image}`}
            alt={rowData?.label || ''}
            className="lt-user-avatar"
            style={{objectFit: 'cover', border: '1.5px solid var(--lt-border)'}}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="lt-user-avatar" style={{background: '#EFF6FF', color: '#2563EB', border: '1.5px solid var(--lt-border)'}}>
            <i className="pi pi-building" style={{fontSize: '0.85rem'}}></i>
          </div>
        )}
        <div className="lt-user-info">
          <span className="lt-user-name">{rowData?.label || '-'}</span>
          <span className="lt-user-login">{rowData?.code || '-'}</span>
        </div>
      </div>
    )
  }

  const enginCountTemplate = (rowData) => {
    const count = rowData?.enginNumber || 0
    return (
      <span className="lt-badge lt-badge-info" data-testid="customer-engin-count">
        <i className="pi pi-box" style={{fontSize: '0.65rem'}}></i>
        {count} engins
      </span>
    )
  }

  const columns = [
    {field: 'label', header: 'Client', body: imageTemplate, filter: true},
    {field: 'code', header: 'Code', filter: true},
    {field: 'enginNumber', header: "Engins", body: enginCountTemplate, filter: true},
  ]

  const exportFields = [
    {label: 'Code client', column: 'code'},
    {label: 'NOM client', column: 'label'},
    {label: "Nombre d'engin", column: 'enginNumber'},
  ]
  const rowGroupTemplates = {
    Nom: (rowData) => <Chip label={rowData?.label} />,
    Code: (rowData) => <Chip label={rowData?.code} />,
    enginNumber: (rowData) => <Chip label={rowData?.enginNumber} />,
  }

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [])

  const create = () => {
    setIsLoadingButton(true)
    dispatch(fetchValidator('customer'))
      .then((res) => {
        if (res.payload) {
          dispatch(setSelectedCustomer(null))
          dispatch(setEditCustomer(true))
        }
      })
      .finally(() => {
        setIsLoadingButton(false)
      })
  }

  return (
    <div className='lt-page' data-testid="customer-list-page">
      <div className='lt-page-header'>
        <div className='lt-page-header-left'>
          <div className='lt-page-icon' style={{background: 'linear-gradient(135deg, #6366F1, #4F46E5)'}}>
            <i className='pi pi-building'></i>
          </div>
          <div>
            <h1 className='lt-page-title'>Clients</h1>
            <p className='lt-page-subtitle'>Gestion de votre portefeuille clients</p>
          </div>
        </div>
        <div className='lt-page-header-right'>
          {list && list.length > 0 && (
            <div className='lt-count-badge' data-testid="customer-total-count">
              <i className='pi pi-building' style={{fontSize: '0.75rem'}}></i>
              <strong>{list.length}</strong> clients
            </div>
          )}
        </div>
      </div>
      <div className='lt-table-wrap'>
        <DatatableComponent
          tableId='customer-table'
          data={list}
          columns={columns}
          onNew={create}
          isLoading={isLoadingButton}
          exportFields={exportFields}
          rowGroupTemplates={rowGroupTemplates}
          rowActions={actions}
        />
      </div>
      <CustomerEditor />
    </div>
  )
}
