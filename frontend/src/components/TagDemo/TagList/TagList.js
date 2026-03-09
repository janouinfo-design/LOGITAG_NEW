import {memo, useEffect} from 'react'

import {useAppDispatch, useAppSelector} from '../../../hooks'

import {SplitButton} from 'primereact/splitbutton'
import {
  fetchTags,
  getTags,
  removeTag,
  setEditTag,
  setSelectedTag,
} from '../../../store/slices/tag.slice'
import { DatatableComponent } from '../../shared/DatatableComponent/DataTableComponent'
import { fetchValidator } from '../../Inventory/slice/inventory.slice'

const TagList = () => {
  let tags = useAppSelector(getTags)
  const dispatch = useAppDispatch()

  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
        dispatch(removeTag({id: e.item.data.id}))
      },
    },
    {
      label: 'Modifier',
      icon: 'pi pi-bookmark-fill text-blue-500',
      command: (e) => {
        dispatch(setSelectedTag(e.item.data))
        dispatch(setEditTag(true))
      },
    },
    {
      label: 'Desactiver',
      icon: 'pi pi-check text-blue-500',
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
    {
      header: 'ACTION',
      body: actionTemplate,
    },
    {
      header: 'ID',
      field: 'id',
    },
    {
      header: 'NOM',
      field: 'code',
    },
    {
      header: 'ADRESSE',
      field: 'adresse',
    },
    {
      header: 'ACTIVE',
      field: 'active',
    },
  ]

  const exportFields = [
    {label: 'Nom', column: 'code'},
    {label: 'Adresse', column: 'adresse'},
  ]

  const create = () => {
    dispatch(setEditTag(true))
    dispatch(setSelectedTag(null))
    dispatch(fetchValidator('tagadd'))
  }

  useEffect(() => {
    dispatch(fetchTags())
  }, [])

  return (
    <div>
      <DatatableComponent
        tableId='tag-table'
        data={tags}
        columns={columns}
        exportFields={exportFields}
        onNew={create}
        
      />
    </div>
  )
}

export default memo(TagList)
