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
    <div>
      <div className='mb-4'>
        <h1>
          <OlangItem olang={'Inventory'} />
        </h1>
      </div>

      {/* Filters */}
      <div className='mb-4'>
        <div className='flex'>
          <div className='p-col-6 p-md-4'>
            <label htmlFor='startDate'>
              <OlangItem olang='StartDate' />:
            </label>
            <Calendar
              placeholder='StartDate'
              className='mr-2 mx-2'
              dateFormat='dd-mm-yy'
              onChange={(e) => setSelectedStartDate(e.value)}
              value={new Date(selectedStartDate)}
            />
          </div>
          <div className='p-col-6 p-md-4'>
            <label htmlFor='endDate'>
              <OlangItem olang='EndDate' />:
            </label>
            <Calendar
              placeholder='End Date'
              className='mr-2 mx-2'
              dateFormat='dd-mm-yy'
              onChange={(e) => setSelectedEndDate(e.value)}
              value={new Date(selectedEndDate)}
            />
          </div>
        </div>
      </div>

      {/* Statistics Tiles */}
      <div className='mb-4'>
        <div className='row'>
          <div className='col-md-4'>
            <Card
              className='p-card-custom p-text-center p-p-3'
              style={{backgroundColor: inventories[0]?.createdInventoryBgColor || '#D64B70'}}
            >
              <h3 style={{color: '#ffffff'}}>
                <OlangItem olang={'createdInventory'} />
              </h3>
              <p className='p-mb-0 p-text-bold font-weight-bold h1' style={{color: '#ffffff'}}>
                {inventories[0]?.createdInventory}
              </p>
            </Card>
          </div>
          <div className='col-md-4'>
            <Card
              className='p-card-custom p-text-center p-p-3'
              style={{backgroundColor: inventories[0]?.confirmedInventoryBgColor || '#59408C'}}
            >
              <h3 style={{color: '#ffffff'}}>
                <OlangItem olang={'confirmedInventory'} />
              </h3>
              <p className='p-mb-0 p-text-bold font-weight-bold h1' style={{color: '#ffffff'}}>
                {inventories[0]?.confirmedInventory}
              </p>
            </Card>
          </div>
          <div className='col-md-4'>
            <Card
              className='p-card-custom p-text-center p-p-3'
              style={{backgroundColor: inventories[0]?.cloturedInventoryBgColor || '#2A2A3C'}}
            >
              <h3 style={{color: '#ffffff'}}>
                <OlangItem olang={'cloturedInventory'} />
              </h3>
              <p className='p-mb-0 p-text-bold font-weight-bold h1' style={{color: '#ffffff'}}>
                {inventories[0]?.cloturedInventory}
              </p>
            </Card>
          </div>
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
