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
    <span className={`lt-depot-badge ${rowData?.active == 1 ? 'is-active' : 'is-inactive'}`}>
      <i className={`pi ${rowData?.active == 1 ? 'pi-check-circle' : 'pi-times-circle'}`} />
      {rowData?.active == 1 ? 'Actif' : 'Inactif'}
    </span>
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
      <div className='lt-depot-name'>
        <span className='lt-depot-name-ico'><i className='pi pi-building' /></span>
        <strong>{data}</strong>
      </div>
    )
  }

  const codeTemplate = (data) => (
    <span className='lt-depot-code'>{data}</span>
  )

  const columns = [
    {field: 'name', header: 'Nom du dépôt', body: (data) => labelTemplate(data.label || data.code)},
    {field: 'code', header: 'Code', body: (data) => codeTemplate(data.code)},
    {field: 'active', header: 'Statut', body: activeTemplate},
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

  const total = depots?.length || 0
  const actives = (depots || []).filter((d) => d?.active == 1).length
  const inactives = total - actives

  return (
    <div className='lt-page' data-testid='depot-page'>
      <div className='lt-page-header'>
        <div className='lt-page-header-left'>
          <div className='lt-page-icon' style={{background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'}}>
            <i className='pi pi-building' />
          </div>
          <div>
            <h1 className='lt-page-title'>Dépôts</h1>
            <p className='lt-page-subtitle'>Gérez vos dépôts, entrepôts et points de stockage.</p>
          </div>
        </div>
      </div>

      <div className='lt-depot-kpis' data-testid='depot-kpis'>
        <div className='lt-depot-kpi'>
          <span className='lt-depot-kpi-ico lt-depot-kpi-ico--blue'><i className='pi pi-building' /></span>
          <div>
            <div className='lt-depot-kpi-val'>{total}</div>
            <div className='lt-depot-kpi-lbl'>Dépôts au total</div>
          </div>
        </div>
        <div className='lt-depot-kpi'>
          <span className='lt-depot-kpi-ico lt-depot-kpi-ico--green'><i className='pi pi-check-circle' /></span>
          <div>
            <div className='lt-depot-kpi-val'>{actives}</div>
            <div className='lt-depot-kpi-lbl'>Actifs</div>
          </div>
        </div>
        <div className='lt-depot-kpi'>
          <span className='lt-depot-kpi-ico lt-depot-kpi-ico--amber'><i className='pi pi-pause' /></span>
          <div>
            <div className='lt-depot-kpi-val'>{inactives}</div>
            <div className='lt-depot-kpi-lbl'>Inactifs</div>
          </div>
        </div>
      </div>

      <div className='lt-table-wrap lt-depot-table'>
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
      </div>
    </div>
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
