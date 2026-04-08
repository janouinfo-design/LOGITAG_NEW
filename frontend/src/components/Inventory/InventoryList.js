import {Chip} from 'primereact/chip'
import {DatatableComponent} from '../shared/DatatableComponent/DataTableComponent'
import {OlangItem} from '../shared/Olang/user-interface/OlangItem/OlangItem'
import InventoryStatisticsTiles from './InventoryStatisticsTiles'
import {Calendar} from 'primereact/calendar'
import {useEffect, useState} from 'react'
import {Dropdown} from 'primereact/dropdown'
import {Card} from 'primereact/card'
import {_fetchInventories} from './api'
import {
  closedInventory,
  fetchInventories,
  getInventories,
  removeInventory,
  setEditInventory,
  setSelectedInventory,
  setShow,
  setTypeFields,
} from './slice/inventory.slice'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {setAlertParams} from '../../store/slices/alert.slice'
import {Button} from 'primereact/button'
import moment from 'moment'
import {DialogComponent} from '../shared/DialogComponent/DialogComponent'

const InventoryList = () => {
  const dispatch = useAppDispatch()
  const inventories = useAppSelector(getInventories)

  const [actionsVisible, setActionsVisible] = useState(true)
  const [dialogAlertVisible, setDialogAlertVisible] = useState(false)

  let create = () => {
    dispatch(setEditInventory(true))
    dispatch(setSelectedInventory(null))
    dispatch(setTypeFields([]))
  }
  const statusTemplate = (rowData) => {
    if (rowData?.iconName) {
      return (
        <i
          title={rowData?.statusLabel}
          className={`${rowData?.iconName} text-2xl rounded p-2`}
          style={{color: `${rowData.color}`, background: `${rowData.backgroundColor || '#59408C'}`}}
        ></i>
      )
    }
    return (
      <Chip
        label={rowData?.statusLabel}
        style={{
          background: `${rowData.backgroundColor || '#59408C'}`,
          color: rowData.color ?? 'white',
        }}
        title={`${rowData?.statusDate}`}
      />
    )
  }

  const siteTemplate = (rowData) => {
    let sites = rowData?.worksite || []
    return (
      <>
        {Array.isArray(sites) && sites.length > 0 && (
          <>
            {sites?.slice(0, 2).map((site, index) => {
              return (
                <>
                  <Chip key={index} label={site?.worksiteLabel} className='ml-2' />
                </>
              )
            })}
            {sites?.length >= 3 ? (
              <Chip
                label='...'
                className='ml-2 cursor-pointer'
                title={sites?.map((s) => s?.worksiteLabel)}
              />
            ) : null}
          </>
        )}
      </>
    )
  }

  const depotTemplate = (rowData) => {
    let depots = rowData?.deposit || []
    return (
      <>
        {Array.isArray(depots) && depots.length > 0 && (
          <>
            {depots?.slice(0, 2).map((dp, index) => {
              return (
                <>
                  <Chip key={index} label={dp?.depositLabel} className='ml-2' />
                </>
              )
            })}
            {depots?.length >= 3 ? (
              <Chip
                label='...'
                className='ml-2 cursor-pointer'
                title={depots?.map((d) => d?.depositLabel)}
              />
            ) : null}
          </>
        )}
      </>
    )
  }

  const columns = [
    {header: 'Reference', field: 'reference', olang: 'Reference'},
    {header: 'Description', field: 'description', olang: 'Description'},
    {header: 'Worksite', field: 'worksite', olang: 'Worksite', body: siteTemplate},
    {header: 'Deposit', field: 'deposit', olang: 'Deposit', body: depotTemplate},
    {header: 'InventoryDate', field: 'inventoryDate', olang: 'InventoryDate'},
    {header: 'Status', field: 'statusLabel', olang: 'Status', body: statusTemplate},
  ]

  const exportFields = [
    {label: 'Reference', column: 'Reference'},
    {label: 'Description', column: 'Description'},
    {label: 'InventoryDate', column: 'inventoryDate'},
    {label: 'Status', column: 'statusLabel'},
  ]

  const rowGroupTemplates = {
    Reference: (data) => (
      <Chip label={data.reference} style={{background: '#59408C', color: 'white'}} />
    ),
    Description: (data) => (
      <Chip label={data.description} style={{background: '#59408C', color: 'white'}} />
    ),
    InventoryDate: (data) => (
      <Chip label={data.inventoryDate} style={{background: '#59408C', color: 'white'}} />
    ),
  }

  const actions = [
    {
      label: 'details',
      icon: 'pi pi-eye text-blue-500',
      // visible: (e) => e.statusName !== 'cloturer',
      command: (e) => {
        dispatch(setSelectedInventory(e.item.data))
        dispatch(setShow(false))
      },
    },

    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      visible: (e) => e.statusName !== 'cloturer',
      command: (e) => {
        dispatch(setSelectedInventory(e.item.data))
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimer ce inventaire?',
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeInventory(e.item.data))
            },
          })
        )
      },
    },
    // {
    //   label: 'Cloturer',
    //   icon: 'pi pi-check text-green-500',
    //   visible: (e) => e.statusName !== 'cloturer',
    //   command: (e) => {
    //     dispatch(setSelectedInventory(e.item.data))
    //     dispatch(
    //       setAlertParams({
    //         title: 'Cloturer',
    //         message: 'Voulez-vous vraiement Cloturer ce inventaire?',
    //         acceptClassName: 'p-button-success',
    //         visible: true,
    //         accept: () => {
    //           dispatch(closedInventory(e.item.data))
    //         },
    //       })
    //     )
    //   },
    // },
  ]

  // State for filter values
  const defaultStartDate = moment().subtract(3, 'months').format('YYYY-MM-DD')
  const defaultEndDate = moment().format('YYYY-MM-DD')
  const [selectedStartDate, setSelectedStartDate] = useState(defaultStartDate)
  const [selectedEndDate, setSelectedEndDate] = useState(defaultEndDate)
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)

  const search = () => {
    const formattedStartDate = moment(selectedStartDate).format('YYYY-MM-DD')
    const formattedEndDate = moment(selectedEndDate).format('YYYY-MM-DD')
    dispatch(fetchInventories({dateFrom: formattedStartDate, dateTo: formattedEndDate}))
  }

  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      const formattedStartDate = moment(selectedStartDate).format('YYYY-MM-DD')
      const formattedEndDate = moment(selectedEndDate).format('YYYY-MM-DD')
      dispatch(fetchInventories({dateFrom: formattedStartDate, dateTo: formattedEndDate}))
    }
  }, [selectedStartDate, selectedEndDate])

  return (
    <div className='lt-page' data-testid="inventory-page">
      <div className='lt-page-header' data-testid="inventory-page-header">
        <div className='lt-page-header-left'>
          <div className='lt-page-icon' style={{background: 'linear-gradient(135deg, #EC4899, #DB2777)'}}>
            <i className='pi pi-clipboard'></i>
          </div>
          <div>
            <h1 className='lt-page-title'><OlangItem olang={'Inventory'} /></h1>
            <p className='lt-page-subtitle'>Gestion et suivi des inventaires</p>
          </div>
        </div>
        <div className='lt-page-header-right'>
          {inventories[0]?.jsonResult?.length > 0 && (
            <div className='lt-count-badge' data-testid="inventory-count">
              <i className='pi pi-clipboard' style={{fontSize: '0.75rem'}}></i>
              <strong>{inventories[0].jsonResult.length}</strong> inventaires
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className='lt-table-wrap' style={{marginBottom: 16, padding: '14px 20px'}} data-testid="inventory-filters">
        <div style={{display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <label style={{fontSize: '0.78rem', fontWeight: 700, color: 'var(--lt-text-muted)', fontFamily: 'var(--lt-font)'}}>
              <OlangItem olang='StartDate' />
            </label>
            <Calendar
              placeholder='Date début'
              dateFormat='dd-mm-yy'
              onChange={(e) => setSelectedStartDate(e.value)}
              value={new Date(selectedStartDate)}
              style={{borderRadius: 10, fontSize: '0.82rem'}}
            />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <label style={{fontSize: '0.78rem', fontWeight: 700, color: 'var(--lt-text-muted)', fontFamily: 'var(--lt-font)'}}>
              <OlangItem olang='EndDate' />
            </label>
            <Calendar
              placeholder='Date fin'
              dateFormat='dd-mm-yy'
              onChange={(e) => setSelectedEndDate(e.value)}
              value={new Date(selectedEndDate)}
              style={{borderRadius: 10, fontSize: '0.82rem'}}
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='lt-inv-stats' data-testid="inventory-stats">
        <div className='lt-inv-stat-card' style={{borderLeft: `4px solid ${inventories[0]?.createdInventoryBgColor || '#D64B70'}`}}>
          <div className='lt-inv-stat-value' style={{color: inventories[0]?.createdInventoryBgColor || '#D64B70'}}>{inventories[0]?.createdInventory || 0}</div>
          <div className='lt-inv-stat-label'><OlangItem olang={'createdInventory'} /></div>
        </div>
        <div className='lt-inv-stat-card' style={{borderLeft: `4px solid ${inventories[0]?.confirmedInventoryBgColor || '#59408C'}`}}>
          <div className='lt-inv-stat-value' style={{color: inventories[0]?.confirmedInventoryBgColor || '#59408C'}}>{inventories[0]?.confirmedInventory || 0}</div>
          <div className='lt-inv-stat-label'><OlangItem olang={'confirmedInventory'} /></div>
        </div>
        <div className='lt-inv-stat-card' style={{borderLeft: `4px solid ${inventories[0]?.cloturedInventoryBgColor || '#2A2A3C'}`}}>
          <div className='lt-inv-stat-value' style={{color: inventories[0]?.cloturedInventoryBgColor || '#2A2A3C'}}>{inventories[0]?.cloturedInventory || 0}</div>
          <div className='lt-inv-stat-label'><OlangItem olang={'cloturedInventory'} /></div>
        </div>
      </div>

      <DatatableComponent
        title={<OlangItem olang={'inventory.list'} />}
        tableId={'inventory-table'}
        data={inventories[0]?.jsonResult || []}
        columns={columns}
        exportFields={exportFields}
        rowGroupTemplates={rowGroupTemplates}
        onNew={create}
        rowActions={actions}
      />
    </div>
  )
}

export default InventoryList
