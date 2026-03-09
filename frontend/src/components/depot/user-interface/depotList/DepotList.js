import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {useMediaQuery} from 'react-responsive'
import {DataView} from 'primereact/dataview'
import './depot.css'
import {Chip} from 'primereact/chip'
import {
  fetchDepots,
  getDepots,
  removeDepot,
  setDetailDepot,
  setEditDepot,
  setSelectedDepot,
} from '../../slice/depot.slice'
import {memo, useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '../../../../hooks'
import {setAlertParams} from '../../../../store/slices/alert.slice'
import {fetchValidator} from '../../../Inventory/slice/inventory.slice'

const DepotList = () => {
  const isMobile = useMediaQuery({query: '(max-width: 767px)'})
  const dispatch = useAppDispatch()

  let depots = useAppSelector(getDepots)
  const [isLoadingButton, setIsLoadingButton] = useState(false)

  let create = () => {
    setIsLoadingButton(true)
    dispatch(fetchValidator('deposit'))
      .then(() => {
        dispatch(setEditDepot(true))
        //
      })
      .finally(() => setIsLoadingButton(false))
  }

  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      style={{backgroundColor: `${rowData?.activeColor}`, color: 'white'}}
    />
  )
  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(fetchValidator('deposit'))
        dispatch(setSelectedDepot(e.item.data))
        dispatch(setDetailDepot(true))
      },
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(setSelectedDepot(e.item.data))
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimer ce depot?',
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeDepot(e.item.data))
            },
          })
        )
      },
    },
  ]

  const labelTemplate = (data) => {
    return (
      <strong className='text-lg'>
        {data}
      </strong>
    )
  }



  const columns = [
    {field: 'label', header: 'Label', body: (data) => labelTemplate(data.label)},
    {field: 'code', olang: 'deposit.code', body: (data) => labelTemplate(data.code)},
    {field: 'active', header: <OlangItem olang='status.active' />, body: activeTemplate},
  ]

  const exportFields = [
    {label: 'NOM', column: 'label'},
    {label: 'CODE', column: 'code'},
    {label: 'ACTIF', column: 'active'},
  ]

  const rowGroupTemplates = {
    label: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.label} />
    ),
    code: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.code} />
    ),
    active: (rowData) => {
      return activeTemplate(rowData)
    },
  }

  const allowedGroupFields = ['label', 'code', 'active']

  useEffect(() => {
    dispatch(fetchDepots())
  }, [])

  return (
    <>
      <div className='py-3 flex flex-row align-items-center'>
        <h1 className='text-700'>
          <OlangItem olang={'depot.list'} />
        </h1>
      </div>
      <DatatableComponent
        tableId='depot-table'
        data={depots}
        columns={columns}
        exportFields={exportFields}
        rowGroupTemplates={rowGroupTemplates}
        allowedGroupFields={allowedGroupFields}
        rowActions={actions}
        onNew={create}
        isLoading={isLoadingButton}
      />
    </>
  )
}

const MobileDataTable = ({data, columns}) => {
  const itemTemplate = (item) => {
    return (
      <>
        <div className='mobile-data-item p-3 bg-gray-100'>
          <h3 className='mobile-data-label'>{item.label}</h3>
          <div>
            <span>Label:</span> <span>{item.label}</span>
          </div>
          <div>Code: {item.code}</div>
          <div>Active: {item.active ? 'Yes' : 'No'}</div>
          <div>Location: {item.location}</div>
          <div>Capacity: {item.capacity}</div>
          <div>Manager: {item.manager}</div>
          <div>Phone: {item.phone}</div>
          <div>Email: {item.email}</div>
        </div>
      </>
    )
  }
  return <DataView value={data} layout='list' itemTemplate={itemTemplate} />
}

export default memo(DepotList)
