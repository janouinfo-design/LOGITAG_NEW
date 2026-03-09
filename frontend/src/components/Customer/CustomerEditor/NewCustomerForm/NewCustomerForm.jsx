// import {InputText} from 'primereact/inputtext'
// import {InputTextarea} from 'primereact/inputtextarea'

// import React, {useEffect, useState} from 'react'
// import {useAppDispatch, useAppSelector} from '../../../../hooks'
// import {selectSelectedCustomer, setSelectedCustomer} from '../../../../store/slices/customer.slice'
// import {useSelector} from 'react-redux'

// function NewCustomerForm() {
//   const dispatch = useAppDispatch()

//   const [inputs, setInputs] = useState({})
//   const selectedCustomer = useAppSelector(selectSelectedCustomer)

//   const mandatories = ['name', 'label']

//   const onInputChange = (e, key, val) => {
//     const data = {...inputs, [key || e.target.name]: val || e.target.value}
//      dispatch(setSelectedCustomer({...data, id:0})) //id:0 means that the customer is new
//   }

//   useEffect(() => {
//     setInputs(selectedCustomer || {})
//   }, [selectedCustomer])

//   return (
//     <div>
//       <div className='my-4 mt-5'>
//         <label htmlFor='name'>Client</label>
//         <InputText
//           name='name'
//           id='name'
//           required={true}
//           value={inputs.name  || ''}
//           onChange={onInputChange}
//           className='w-full'
//         />
//       </div>
//       <div className='my-4'>
//         <label htmlFor='label'>Label</label>
//         <InputText
//           name='label'
//           id='label'
//           rows={5}
//           value={inputs.label || ''}
//           onChange={onInputChange}
//           className='w-full'
//         />
//       </div>
//     </div>
//   )
// }

// export default NewCustomerForm
