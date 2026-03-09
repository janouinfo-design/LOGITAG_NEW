import {SplitButton} from 'primereact/splitbutton'
import {DatatableComponent} from '../shared/DatatableComponent/DataTableComponent'

const WorkSiteList = () => {
  let actions = [
    {
      label: 'Supprimer',
      icon: 'pi pi-trash text-red-500',
      command: (e) => {
      },
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
  const cols = [
    {
      header: 'actions',
      body: actionTemplate,
    },
    {
      header: 'active',
      field: 'active',
    },
    {
      header: 'name',
      field: 'name',
    },
    {
      header: 'label',
      field: 'label',
    },
  ]

  const exportFields = [
    {
      label: 'Nom',
      column: 'name',
    },
  ]

  return (
    <>
      <h3 className='bg-primary p-2 card text-center'>Sites</h3>
      <DatatableComponent columns={cols} data={[]} exportFields={exportFields} />
    </>
  )
}

export default WorkSiteList
