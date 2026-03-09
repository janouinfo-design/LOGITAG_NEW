import {FC, useEffect} from 'react'
import {
  fetchCustomers,
  selectCustomers,
  setEditCustomer,
  setSelectedCustomer,
} from '../../../store/slices/customer.slice'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {SplitButton} from 'primereact/splitbutton'

import {CustomerEditor} from '../CustomerEditor/CustomerEditor'
import {MapComponent} from '../../shared/Map/MapComponent'
import ButtonComponent from '../../shared/ButtonComponent.js'
import { DatatableComponent } from '../../shared/DatatableComponent/DataTableComponent'
export const CustomerList = () => {
  const dispatch = useAppDispatch()
  const list = useAppSelector(selectCustomers)

  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        // dispatch(removeUser({ id: e.item.data.id })).then(res => {
        //   if (!res.payload.success)
        //     dispatch(setToastParams({ show: true, severity: 'error', summary: "ERREUR", detail: "Opération échoué. Veuillez réessayer !!!" }))
        //   else
        //     dispatch(setToastParams({ show: true, severity: 'success', detail: "Supprimé avec succès !!!" }))
        // })
      },
    },
    {
      label: 'Modifier',
      icon: 'pi pi-bookmark-fill text-blue-500',
      command: (e) => {
        // toast.current.show({severity: 'success', summary: "success", detail: "Supprimer avec success!!!"})
        // dispatch(setSelectedUser(e.item.data))
        // dispatch(setEditUser(true))
      },
    },
  ]

  const actionTemplate = (rowData) => {
    actions = actions.map((_i) => ({..._i, data: rowData}))
    return (
      <div>
        <SplitButton
          model={actions}
          className='p-button-help p-button-raised  p-button-outlined p-button-sm'
          icon='pi pi-cog'
        />
      </div>
    )
  }

  const columns = [
    {field: 'action', header: 'Action', body: actionTemplate},
    {field: 'label', header: 'Nom client', filter: true},
    {field: 'code', header: 'Code client', filter: true},
    {field: 'restriction', header: 'Restriction', filter: true},
  ]

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [])

  const create = () => {
    dispatch(setEditCustomer(true))
    dispatch(setSelectedCustomer(null))
  }

  return (
    <div>
      <DatatableComponent columns={columns} data={list} onNew={create} />
      <CustomerEditor />
    </div>
  )
}
