// import {memo, useEffect} from 'react'
// import {DatatableComponent} from '../../../shared/DatatableComponent/DataTableComponent'
// import {useAppDispatch, useAppSelector} from '../../../../hooks'

// import {SplitButton} from 'primereact/splitbutton'
// import {
//   fetchInvoices,
//   getSelectedInvoice,
//   getInvoices,
//   setEditInvoice,
//   setSelectedInvoice,
//   removeInvoice,
// } from '../../slice/costumer.slice'
// import {Chip} from 'primereact/chip'

// const InvoiceList = () => {
//   let invoices = useAppSelector(getInvoices)
//   const dispatch = useAppDispatch()

//   let actions = [
//     {
//       label: 'Supprimer',
//       icon: 'pi pi-trash text-red-500',
//       confirm: 'test',
//       command: (e) => {
//         dispatch(setSelectedInvoice(e.item.data))
//         dispatch(removeInvoice(e.item.data))
//       },
//     },
//     {
//       label: 'Modifier',
//       icon: 'pi pi-bookmark-fill text-blue-500',
//       command: (e) => {
//         dispatch(setEditInvoice(true))
//         dispatch(setSelectedInvoice(e.item.data))
//       },
//     },
//     {
//       label: 'Desactiver',
//       icon: 'pi pi-check text-blue-500',
//       command: (e) => {},
//     },
//   ]
//   const actionTemplate = (rowData) => {
//     actions = actions.map((_i) => ({..._i, data: rowData}))
//     return (
//       <div>
//         <SplitButton
//           model={actions}
//           className='p-button-help p-button-raised  p-button-outlined p-button-sm'
//           icon='pi pi-cog'
//         />
//       </div>
//     )
//   }

//   const columns = [
//     {field: 'action', header: 'Action', body: actionTemplate},
//     {
//       header: 'Nom client',
//       field: 'label',
//       filter: true,
//     },
//     {
//       header: 'Chantier',
//       field: '-',
//     },
//     {
//       header: 'Référence',
//       field: 'code',
//     },
//     {
//       header: 'Description',
//       field: 'restriction',
//     },
//     {
//       header: 'ACTIVE',
//       field: 'restriction',
//     },
//   ]

//   const exportFields = [
//     {label: 'Nom', column: 'code'},
//     {label: 'Adresse', column: 'adresse'},
//   ]

//   const rowGroupTemplates = {
//     Nom: (rowData) => <Chip label={rowData?.code} />,
//   }

//   const fakeData = [
//     {
//       label: 'John Doe',
//       code: 'JD001',
//       restriction: 'None',
//     },
//     {
//       label: 'Jane Smith',
//       code: 'JS002',
//       restriction: 'Restricted',
//     },
//     {
//       label: 'Michael Johnson',
//       code: 'MJ003',
//       restriction: 'None',
//     },
//   ]

//   let create = () => {
//     dispatch(setEditInvoice(true))
//     dispatch(setSelectedInvoice(null))
//   }

//   useEffect(() => {
//     dispatch(fetchInvoices())
//   }, [])

//   return (
//     <div>
//       <DatatableComponent
//         tableId='invoice-table'
//         data={fakeData}
//         columns={columns}
//         exportFields={exportFields}
//         rowGroupTemplates={rowGroupTemplates}
//         onNew={create}
//         contextMenuModel={actions}
//       />
//     </div>
//   )
// }

// export default memo(InvoiceList)
