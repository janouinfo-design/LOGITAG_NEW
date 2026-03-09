import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'

const VehiculesList = () => {
  const columns = [
    {field: 'name', olang: 'Name', header: 'Name'},
    {field: 'type', olang: 'Type', header: 'Type'},
    {field: 'model', olang: 'Model', header: 'Model'},
    {field: 'providerName', olang: 'ProviderName', header: 'Provider Name'},
    {field: 'matricule', olang: 'Matricule', header: 'Matricule'},
    {field: 'allowedSpeed', olang: 'AllowedSpeed', header: 'Allowed Speed'},
    {field: 'fuel', olang: 'Fuel', header: 'Fuel'},
    {field: 'reservoir', olang: 'Reservoir', header: 'Reservoir'},
    {field: 'capacity', olang: 'Capacity', header: 'Capacity'},
  ]
  const exportFields = [
    {label: 'Name', column: 'name'},
    {label: 'Type', column: 'type'},
    {label: 'Model', column: 'model'},
    {label: 'Provider Name', column: 'providerName'},
    {label: 'Matricule', column: 'matricule'},
    {label: 'AllowedSpeed', column: 'allowedSpeed'},
    {label: 'Fuel', column: 'fuel'},
    {label: 'Reservoir', column: 'reservoir'},
    {label: 'Capacity', column: 'capacity'},
  ]
  const data = [
    {
      id: 8115,
      name: 'V1',
      label: 'V1',
      active: 1,
      providerName: 'test223',
      providerId: 1,
      type: 'REMORQUE',
      model: 'MS',
      matricule: 'MT-854121',
      allowedSpeed: 100,
      fuel: 'DIESEL',
      reservoir: 422,
      capacity: 1500,
    },
  ]
  return (
    <div>
      <DatatableComponent
        tableId={'vehicules-table'}
        data={data}
        columns={columns}
        exportFields={exportFields}
      />
    </div>
  )
}

export default VehiculesList
