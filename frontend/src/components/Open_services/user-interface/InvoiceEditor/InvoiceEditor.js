// import {memo, useState} from 'react'
// import {DialogComponent} from '../../../shared/DialogComponent'
// import {InputText} from 'primereact/inputtext'
// import ButtonComponent from '../../../shared/ButtonComponent'
// import {InputSwitch} from 'primereact/inputswitch'
// import {useAppDispatch, useAppSelector} from '../../../../hooks'

// import _ from 'lodash'

// import {
//   createOrUpdateCostumer,
//   getSelectedCostumer,
//   setSelectedCostumer,
// } from '../../slice/costumer.slice'

// function CostumerEditor() {
//   // const visible = useAppSelector(getEditCostumer)
//   const selectedCostumer = useAppSelector(getSelectedCostumer)
//   const dispatch = useAppDispatch()
//   const [inputs, setInputs] = useState({})

//   // const onHide = () => {
//   //   dispatch(setEditCostumer(false))
//   // }

//   // const onInputChange = (e) => {
//   //   let old = _.cloneDeep(selectedCostumer)
//   //   old = {...old, [e.target.name]: e.target.value}
//   //   setInputs(old)
//   //   dispatch(setSelectedCostumer(old))
//   // }

//   // const save = () => {
//   //   dispatch(createOrUpdateCostumer()).then((res) => {
//   //     if (res.payload) dispatch(setEditCostumer(false))
//   //   })
//   // }

//   const footer = (
//     <div>
//       <ButtonComponent label='Annuler' className='p-button-danger' />
//       <ButtonComponent label='Enregistrer' />
//     </div>
//   )

//   return (
//     <div>
//       <DialogComponent visible={visible} footer={footer} header='Nouveau Invoice' onHide={onHide}>
//         <div>
//           <label>Nom</label>
//           <InputText
//             name='code'
//             className='w-full'
//             onChange={onInputChange}
//             value={selectedInvoice?.code}
//           />
//         </div>
//         <div className='my-3'>
//           <label>Log</label>
//           <InputText
//             name='log'
//             className='w-full'
//             onChange={onInputChange}
//             value={selectedInvoice?.log}
//           />
//         </div>
//         <div className='my-3'>
//           <label>Adresse</label>
//           <InputText
//             name='adresse'
//             className='w-full'
//             onChange={onInputChange}
//             value={selectedInvoice?.adresse}
//           />
//         </div>
//         <div className='my-3 flex align-items-center gap-2'>
//           <label>Active</label>
//           <InputSwitch
//             name='active'
//             checked={selectedInvoice?.active === 1 ? true : false}
//             onChange={onInputChange}
//           />
//         </div>
//       </DialogComponent>
//     </div>
//   )
// }

// export default memo(InvoiceEditor)
