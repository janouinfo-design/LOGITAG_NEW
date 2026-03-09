import {FC, useEffect, useState} from 'react'

import {SplitButton} from 'primereact/splitbutton'

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

  const imageTemplate = (rowData) => (
    <img
      src={`${API_BASE_URL_IMAGE}${rowData?.image}`}
      alt='EngineImage'
      width='60'
      height='60'
      className='image-preview rounded'
      preview
    />
  )

  const columns = [
    {field: null, header: 'Image', olang: 'Image', body: imageTemplate},
    {field: 'label', header: 'Nom client', olang: 'Nom.client', filter: true},
    {field: 'code', header: 'Code client', olang: 'Code.client', filter: true},
    {field: 'enginNumber', header: "Nombre d'engin", olang: 'Nombre.engin', filter: true},
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
    <>
      <div className='py-3 flex flex-row align-items-center'>
        <h1 className='text-700'>
          <OlangItem olang={'customer.list'} />
        </h1>
      </div>
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
      <CustomerEditor />
    </>
  )
}
