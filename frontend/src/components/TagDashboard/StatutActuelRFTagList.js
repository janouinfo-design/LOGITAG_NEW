import { DatatableComponent } from "../shared/DatatableComponent/DataTableComponent"

const StatutActuelRFTagList = () => {
  const cols = [
    {
      field: 'lastMag',
      header: 'Last Mag',
      filter: true,
    },
    {
      field: 'id',
      header: 'ID',
      filter: true,
    },
    {
      field: 'engin',
      header: 'Engine',
      filter: true,
    },
    {
      field: 'user',
      header: 'User',
      filter: true,
    },
    {
      field: 'adress',
      header: 'Address',
      filter: true,
    },
    {
      field: 'status',
      header: 'Status',
      filter: true,
    },
    {
      field: 'battlevel',
      header: 'Battery Level',
      filter: true,
    },
    {
      field: 'signal',
      header: 'Signal',
      filter: true,
    },
  ]

  const data = [
    {
      lastMag: '10:02:36',
      id: 1234,
      engin: 'REF001',
      user: 'John',
      adress: '123 Main St',
      status: 'Active',
      battlevel: '85%',
      signal: 4,
    },
    {
      lastMag: '09:14:20',
      id: 5678,
      engin: 'REF002',
      user: 'Sarah',
      adress: '456 Elm St',
      status: 'Inactive',
      battlevel: '70%',
      signal: 2,
    },
    {
      lastMag: '14:22:12',
      id: 9012,
      engin: 'REF003',
      user: 'Mike',
      adress: '789 Oak St',
      status: 'Active',
      battlevel: '90%',
      signal: 5,
    },
    {
      lastMag: '11:45:55',
      id: 3456,
      engin: 'REF004',
      user: 'Emily',
      adress: '321 Maple St',
      status: 'Inactive',
      battlevel: '65%',
      signal: 3,
    },
    {
      lastMag: '08:30:18',
      id: 7890,
      engin: 'REF001',
      user: 'David',
      adress: '654 Birch St',
      status: 'Active',
      battlevel: '80%',
      signal: 4,
    },
    {
      lastMag: '15:05:42',
      id: 2345,
      engin: 'REF001',
      user: 'Rachel',
      adress: '987 Cedar St',
      status: 'Inactive',
      battlevel: '75%',
      signal: 3,
    },
    {
      lastMag: '12:16:30',
      id: 6789,
      engin: 'REF001',
      user: 'Tom',
      adress: '456 Pine St',
      status: 'Active',
      battlevel: '85%',
      signal: 5,
    },
    {
      lastMag: '07:50:03',
      id: 1234,
      engin: 'REF002',
      user: 'Mary',
      adress: '789 Spruce St',
      status: 'Inactive',
      battlevel: '60%',
      signal: 2,
    },
    {
      lastMag: '16:39:22',
      id: 5678,
      engin: 'REF005',
      user: 'Bob',
      adress: '321 Oak St',
      status: 'Active',
      battlevel: '95%',
      signal: 5,
    },
    {
      lastMag: '13:00:50',
      id: 9012,
      engin: 'REF007',
      user: 'Kate',
      adress: '654 Walnut St',
      status: 'Inactive',
      battlevel: '70%',
      signal: 3,
    },
  ]

  const exportFields = [
    {label: 'Last Mag', column: 'lastMag'},
    {label: 'ID', column: 'id'},
    {label: 'Engine', column: 'engin'},
    {label: 'User', column: 'user'},
    {label: 'Address', column: 'adress'},
    {label: 'Status', column: 'status'},
    {label: 'Battery Level', column: 'battlevel'},
    {label: 'Signal', column: 'signal'},
  ]

  return (
    <>
      <h3 className='bg-primary p-2 card text-center'>Statut actuel RFTag</h3>
      <DatatableComponent columns={cols} data={data} exportFields={exportFields} />
    </>
  )
}

export default StatutActuelRFTagList
