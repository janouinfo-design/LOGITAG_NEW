import {SplitButton} from 'primereact/splitbutton'
import {fetchDeposits, toggleActive, selectDeposits} from '../../store/slices/deposit.slice'
import {useEffect} from 'react'
import {useAppDispatch, useAppSelector} from '../../hooks'
import {InputSwitch} from 'primereact/inputswitch'
import {_fetchDeposits} from '../../api'
import { DatatableComponent } from '../shared/DatatableComponent/DataTableComponent'

const DepositList = () => {
  const dispatch = useAppDispatch()
  const list = useAppSelector(selectDeposits)
  // const active = useAppSelector(selectActive)
  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {},
    },
    {
      label: 'Modifier',
      icon: 'pi pi-bookmark-fill text-blue-500',
      command: (e) => {},
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

  const changeActive = (v) => dispatch(toggleActive(v))
  const activeTemplate = (rowData) => {
    return (
      <div>
        <InputSwitch
          checked={rowData.active === 1 ? true : false}
          onChange={(e) => changeActive(rowData)}
        />
      </div>
    )
  }
  useEffect(() => {
    dispatch(fetchDeposits())
  }, [])

  const columns = [
    {field: 'action', header: 'Action', body: actionTemplate},
    {field: 'code', header: 'code', filter: true},
    {field: 'label', header: 'label', filter: true},
    {field: 'active', header: 'Active', body: activeTemplate},
  ]

  const exportFields = [
    {column: 'label', label: 'Label'},
    {column: 'code', label: 'code'},
  ]

  return (
    <div>
      <DatatableComponent columns={columns} data={list} exportFields={exportFields} />
    </div>
  )
}

export default DepositList
