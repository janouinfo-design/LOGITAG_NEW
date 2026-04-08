import {Chip} from 'primereact/chip'
import {DatatableComponent} from '../shared/DatatableComponent/DataTableComponent'
import {OlangItem} from '../shared/Olang/user-interface/OlangItem/OlangItem'
import {useEffect, useState} from 'react'
import {
  fetchTrackerVeh,
  fetchVehicules,
  getVehicules,
  removeVehicule,
  setEditVehicule,
  setSelectedVehicule,
  setShow,
  setTypeFields,
} from './slice/veh.slice'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {setAlertParams} from '../../store/slices/alert.slice'
import {fetchValidator} from '../Inventory/slice/inventory.slice'

const VehList = () => {
  const dispatch = useAppDispatch()
  const vehicules = useAppSelector(getVehicules)
  const [isLoadingButton, setIsLoadingButton] = useState(false)

  let actions = [
    {
      label: 'Detail',
      icon: 'pi pi-eye text-blue-500',
      command: (e) => {
        dispatch(fetchValidator('vehicule'))
        dispatch(setSelectedVehicule(e.item.data))
        dispatch(setShow(false))
      },
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(setSelectedVehicule(e.item.data))
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: 'Voulez-vous vraiment supprimerce vehicule?',
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: () => {
              dispatch(removeVehicule(e.item.data))
            },
          })
        )
      },
    },
  ]

  const columns = [
    {
      header: 'label',
      field: 'label',
      olang: 'label',
      visible: true,
    },
    {
      header: 'model',
      field: 'model',
      olang: 'model',
      visible: true,
    },
    {
      header: 'creaDate',
      field: 'creaDate',
      olang: 'creaDate',
      visible: true,
    },

    {
      header: 'deviceId',
      field: 'deviceId',
      olang: 'deviceId',
      visible: true,
    },
  ]
  const exportFields = [
    {label: 'Label', column: 'label'},
    {label: 'Name', column: 'name'},
    {label: 'Model', column: 'model'},

    {label: 'Platelicense', column: 'platelicense'},
    {label: 'Max Speed', column: 'speedmax'},
    {label: 'Fuel', column: 'fueltype'},

    {label: 'Capacity', column: 'tankcapcityl'},
  ]

  let create = () => {
    setIsLoadingButton(true)
    dispatch(fetchValidator('vehicule'))
      .then(() => {
        dispatch(setEditVehicule(true))
        dispatch(setSelectedVehicule(null))
        dispatch(setTypeFields([]))
      })
      .finally(() => setIsLoadingButton(false))
  }
  const rowGroupTemplates = {
    name: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.name} />
    ),
    label: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.label} />
    ),
    model: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.model} />
    ),

    platelicense: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.platelicense} />
    ),
    speedmax: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.speedmax} />
    ),
    fuel: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.fuel} />
    ),
    reservoir: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.reservoir} />
    ),
    tankcapcityl: (rowData) => (
      <Chip style={{backgroundColor: '#D64B70', color: 'white'}} label={rowData?.tankcapcityl} />
    ),
  }

  useEffect(() => {
    dispatch(fetchTrackerVeh())
  }, [])

  return (
    <div>
      <div className='py-3 flex flex-row align-items-center'>
        <h1 className='text-700'>
          <OlangItem olang={'vehicule.list'} />
        </h1>
      </div>
      <DatatableComponent
        tableId={'veh-table'}
        data={vehicules}
        columns={columns}
        isLoading={isLoadingButton}
        exportFields={exportFields}
        rowGroupTemplates={rowGroupTemplates}
        onNew={create}
        rowActions={actions}
      />
    </div>
  )
}

export default VehList
