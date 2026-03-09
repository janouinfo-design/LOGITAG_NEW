import {SplitButton} from 'primereact/splitbutton'
import { DatatableComponent } from '../shared/DatatableComponent/DataTableComponent'

const SommaireRFTagList = () => {
  const cols = [
    {header: 'Engine', field: 'engin', filter: true},
    {header: 'User', field: 'user', filter: true},
    {header: 'Tag ID', field: 'tagId'},
    {header: 'Connection Time', field: 'connectionTime'},
    {header: 'Address', field: 'adresse', filter: true},
    {header: 'Disconnection Time', field: 'desconnectionTime', filter: true},
    {header: 'Battery Level', field: 'battrie', filter: true},
  ]

  const _data = [
    {
      engin: 'Engine 1',
      user: 'User A',
      tagId: '1234',
      connectionTime: '2023-03-30T09:15:00Z',
      adresse: '123 Main St',
      desconnectionTime: '2023-03-30T17:30:00Z',
      battrie: '75%',
    },
    {
      engin: 'Engine 2',
      user: 'User B',
      tagId: '5678',
      connectionTime: '2023-03-30T08:45:00Z',
      adresse: '456 Elm St',
      desconnectionTime: '2023-03-30T18:00:00Z',
      battrie: '50%',
    },
    {
      engin: 'Engine 3',
      user: 'User C',
      tagId: '9012',
      connectionTime: '2023-03-30T10:30:00Z',
      adresse: '789 Oak St',
      desconnectionTime: '2023-03-30T16:45:00Z',
      battrie: '25%',
    },
    {
      engin: 'Engine 4',
      user: 'User D',
      tagId: '3456',
      connectionTime: '2023-03-30T11:00:00Z',
      adresse: '234 Maple Ave',
      desconnectionTime: '2023-03-30T19:15:00Z',
      battrie: '100%',
    },
    {
      engin: 'Engine 5',
      user: 'User E',
      tagId: '7890',
      connectionTime: '2023-03-30T07:45:00Z',
      adresse: '567 Pine St',
      desconnectionTime: '2023-03-30T21:00:00Z',
      battrie: '10%',
    },
    {
      engin: 'Engine 6',
      user: 'User F',
      tagId: '2468',
      connectionTime: '2023-03-30T08:00:00Z',
      adresse: '789 Main St',
      desconnectionTime: '2023-03-30T17:45:00Z',
      battrie: '85%',
    },
    {
      engin: 'Engine 7',
      user: 'User G',
      tagId: '1357',
      connectionTime: '2023-03-30T09:30:00Z',
      adresse: '456 Elm St',
      desconnectionTime: '2023-03-30T16:15:00Z',
      battrie: '30%',
    },
    {
      engin: 'Engine 8',
      user: 'User H',
      tagId: '8024',
      connectionTime: '2023-03-30T10:15:00Z',
      adresse: '123 Oak St',
      desconnectionTime: '2023-03-30T18:30:00Z',
      battrie: '70%',
    },
    {
      engin: 'Engine 9',
      user: 'User I',
      tagId: '3690',
      connectionTime: '2023-03-30T07:00:00Z',
      adresse: '234 Maple Ave',
      desconnectionTime: '2023-03-30T19:45:00Z',
      battrie: '95%',
    },
    {
      engin: 'Engine 10',
      user: 'User J',
      tagId: '7531',
      connectionTime: '2023-03-30T11:30:00Z',
      adresse: '567 Pine St',
      desconnectionTime: '2023-03-30T20:00:00Z',
      battrie: '40%',
    },
  ]

  const exportFields = [
    {label: 'Engine', column: 'engin'},
    {label: 'User', column: 'user'},
    {label: 'Tag ID', column: 'tagId'},
    {label: 'Connection Time', column: 'connectionTime'},
    {label: 'Address', column: 'adresse'},
    {label: 'Disconnection Time', column: 'desconnectionTime'},
    {label: 'Battery Level', column: 'battrie'},
  ]

  return (
    <>
      <h3 className='bg-primary p-2 card text-center'>Sommaire RFTag</h3>
      <DatatableComponent columns={cols} data={_data} exportFields={exportFields} />
    </>
  )
}

export default SommaireRFTagList
