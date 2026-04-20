import React, { useEffect, useMemo } from 'react'
import { DatatableComponent } from '../../../shared/DatatableComponent/DataTableComponent'
import { useAppDispatch, useAppSelector } from '../../../../hooks'
import { fetchAlerts, getAlerts, setAlerts, setEditAlert, setSelectedAlert } from '../../slice/slice'


function AlertList() {
  
  let list = useAppSelector(getAlerts);
  console.log('list alert', list)
  let dispatch = useAppDispatch();

  let columns = useMemo(() => [
    {
      field: "Code",
      header: "Nom de l'alerte",
      filter: true
    },
    {
      field: "srcObject",
      header: "Type d'entité",
      filter: true
    },
    {
      field: "macAddr",
      header: "Entité",
      body: (row) => row?.macAddr || row?.srcID,
      filter: true
    },
    {
      field: "description",
      header: "Description",
      filter: true
    },
    {
      field: "Message",
      header: "Message",
      filter: true
    },
    {
      field: "condition",
      header: "Condition",
      filter: true
    },
    
  ], [])

  const exportFields = useMemo(() => [
    {label: "Nom de l'alerte", column: 'Code'},
    {label: "Type d'entité", column: 'srcObject'},
    {label: 'Entité', column: 'macAddr'},
    {label: 'Description', column: 'description'},
    {label: 'Message', column: 'Message'},
    {label: 'Condition', column: 'condition'},
  ], [])

  let actions = useMemo(() => [
    {
      label: 'Editer',
      icon: 'pi pi-pencil text-blue-500',
      className: 'p-button-warning',
      command: (e) => {
        console.log('edit', e)
        dispatch(setSelectedAlert(e.item.data))
        dispatch(setEditAlert(true))
      }
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      className: 'p-button-danger',
      command: (e) => {
        let dt = e.rowData
        if(window.confirm("Confirmer la suppression de l'alerte "+dt.label)){
         
        }
      }
    }
  ], [])

  const create = ()=>{
    dispatch(setSelectedAlert(null))
    dispatch(setEditAlert(true))
  }
  useEffect(() => {
    dispatch(fetchAlerts())
  }, [])
  return (
    <div data-testid="alert-list-container">
        <DatatableComponent tableId="alert-list" exportFields={exportFields} rowActions={actions} onNew={create} data={list} columns={columns} />
    </div>
  )
}

export default AlertList