// import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
// import {CUSTOMER_SERVICE as name} from '../../../store/slices/config'
// import {_fetchCostumers, _saveCostumer, _removeCostumer} from '../api/api'
// import _ from 'lodash'

// export const fetchCostumers = createAsyncThunk(
//   `${name}/fetchCostumers`,
//   async (_args, {getState, dispatch}) => {
//     let response = await _fetchInvoices()
//     if (!response.error) dispatch(setCostumers(response.data))
//   }
// )

// export const createOrUpdateCostumer = createAsyncThunk(
//   `${name}/createOrUpdateCostumer`,
//   async (_args, {dispatch, getState}) => {
//     try {
//       let {selectedCostumer} = getState()[name]

//       let data = _.cloneDeep(selectedCostumer)

//       data.active = data.active ? 1 : 0
//       data.id = data.id || 0
//       data.IDCustomer = 0

//       let res = null


//       res = await _saveCostumer(data)

//       if (Array.isArray(res.result) && (res.result || [])[0]?.typeMsg === 'success') {
//         dispatch(fetchCostumers())
//         return true
//       }

//       return false
//     } catch (e) {
//       //   return { error: true, message: e.message }
//       return false
//     }
//   }
// )

// export const removeCostumer = createAsyncThunk(
//   `${name}/removeCostumer`,
//   async (_arg, {dispatch}) => {
//     let res = await _removeCostumer(_arg?.id)


//     dispatch(fetchCostumers())
//   }
// )

// //Actions
// export const setCostumers = createAction(`${name}/fetchCostumers`)
// export const setSelectedCostumer = createAction(`${name}/setSelectedCostumer`)
// // export const setEditInvoice = createAction(`${name}/setEditInvoice`)

// const CostumerSlice = createSlice({
//   name,
//   initialState: {
//     costumers: [],
//     selectedCostumer: null,
//     // editInvoice: false,
//   },
//   reducers: {},
//   extraReducers: {
//     [setCostumers]: (state, {payload}) => {
//       state.costumers = payload
//     },
//     [setSelectedCostumer]: (state, {payload}) => {
//       state.selectedCostumer = payload
//     },
//     // [setEditInvoice]: (state, {payload}) => {
//     //   state.editInvoice = payload
//     // },
//   },
// })

// //selectors
// export const getCostumers = (state) => state[name].invoices
// export const getSelectedCostumer = (state) => state[name].selectedInvoice
// // export const getEditInvoice = (state) => state[name].editInvoice

// export default CostumerSlice.reducer
