import {Chip} from 'primereact/chip'
import {DatatableComponent} from '../../shared/DatatableComponent/DataTableComponent'

const EnginTagged = ({tableId, data, actions}) => {
  const addresseeTemplate = ({addressName}) => {
    return (
      <div>
        {addressName ? (
          <Chip
            label={addressName}
            className='w-11rem m-1 flex justify-content-center align-items-center'
          />
        ) : (
          'No address found.'
        )}
      </div>
    )
  }
  const activeTemplate = (rowData) => (
    <Chip
      label={rowData?.active == 1 ? 'Actif' : 'Inactif'}
      icon={rowData?.active == 1 ? 'pi pi-check' : 'pi pi-times'}
      className={'text-white ' + (rowData?.active == 1 ? 'bg-green-500' : 'bg-red-500')}
    />
  )
  const columns = [
    {
      header: 'ID Tag',
      field: 'code',
      olang: 'ID.Tag',
    },
    {
      header: 'Creation Date',
      field: null,
      olang: 'Creation.Date',
      body: addresseeTemplate,
    },
    {
      header: 'ADRESSE',
      olang: 'ADRESSE',
      field: 'adresse',
    },
    {header: 'ACTIF', olang: 'ACTIF', body: activeTemplate},
  ]
  const exportFields = [
    {
      label: 'Référence',
      column: 'reference',
    },
    {
      label: 'Marque',
      column: 'brand',
    },
    {
      label: 'TagId',
      column: 'tagId',
    },
    {
      label: 'Label',
      column: 'label',
    },
    {
      label: 'Vin',
      column: 'vin',
    },
    {
      label: 'Etat',
      column: 'etatenginname',
    },
    {
      label: 'Tag',
      column: 'tagname',
    },
    {
      label: 'Status',
      column: 'statuslabel',
    },
    {
      label: 'Battery status',
      column: 'batteries',
    },
    {
      label: 'Famille',
      column: 'famille',
    },
    {
      label: 'IMMATRICULATION',
      column: 'immatriculation',
    },
    {
      label: 'Matricule',
      column: 'model',
    },

    {
      label: 'Worksite',
      column: 'LocationObjectname',
    },
  ]

  return (
    <div>
      <DatatableComponent
        tableId={tableId}
        data={data}
        columns={columns}
        // exportFields={exportFields}
        rowActions={actions}
        sortOrder={-1}
        sortField={'id'}
      />
    </div>
  )
}

export default EnginTagged
