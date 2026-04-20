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
    <div className='lt-page' data-testid="worksite-list-page">
      <div className='lt-page-header'>
        <div className='lt-page-header-left'>
          <div className='lt-page-icon' style={{background: 'linear-gradient(135deg, #F59E0B, #D97706)'}}>
            <i className='pi pi-map-marker'></i>
          </div>
          <div>
            <h1 className='lt-page-title'>Dépôts</h1>
            <p className='lt-page-subtitle'>Gestion des sites et dépôts</p>
          </div>
        </div>
      </div>
      <div className='lt-table-wrap'>
        <DatatableComponent columns={cols} data={[]} exportFields={exportFields} rowActions={actions} />
      </div>
    </div>
  )
}

export default WorkSiteList
