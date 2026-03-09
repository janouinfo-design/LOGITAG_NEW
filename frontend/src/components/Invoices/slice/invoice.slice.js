import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {INVOICE as name} from '../../../store/slices/config'
import {
  _saveInvoice,
  _removeInvoice,
  _fetchCustomers,
  _fetchInvoicesByCodeClient,
  fetchInvoicesPs,
  fetchInvoiceDetailData,
  _fetchStatus,
  _fetchPdf,
} from '../api/api'
import _ from 'lodash'
import moment from 'moment'

export const fetchInvoices = createAsyncThunk(
  `${name}/fetchInvoices`,
  async (id, {getState, dispatch}) => {
    let test = getState()[name]
    let response = await fetchInvoicesPs()
    if (response.success) dispatch(setInvoices(response.data))
  }
)
export const fetchInvoiceDetail = createAsyncThunk(
  `${name}/fetchInvoiceDetail`,
  async (_args, {getState, dispatch}) => {
    let res = await fetchInvoiceDetailData()
    if (res.success) dispatch(setInvoiceDetail(res.data))
  }
)

export const fetchPdf = createAsyncThunk(
  `${name}/fetchPdf`,
  async (_args, {getState, dispatch}) => {
    let res = await _fetchPdf(_args)
    if (res.success) return res
  }
)

export const invoiceDetail = createAsyncThunk(
  `${name}/invoiceDetail`,
  async (_args, {getState, dispatch}) => {
    let res = await fetchInvoiceDetailData()
    if (res.success) dispatch(setInvoiceDetail(res.data))
  }
)
export const fetchInvoicesByCodeClient = createAsyncThunk(
  `${name}/fetchInvoicesByCodeClient`,
  async (id, {dispatch, rejectWithValue}) => {
    try {
      let response = await _fetchInvoicesByCodeClient(id)
      dispatch(setInvoicesByCustomer(response.data))
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchStatus = createAsyncThunk(
  `${name}/fetchStatus`,
  async (_args, {getState, dispatch}) => {
    let res = await _fetchStatus()
    if (res.status === 200) dispatch(setStatus(res.data))
  }
)

export const createOrUpdateInvoice = createAsyncThunk(
  `${name}/createOrUpdateInvoice`,
  async ({selectedOption, selectedCustomer}, {dispatch, getState}) => {
    try {
      let {selectedInvoice} = getState()[name]
      let data = _.cloneDeep(selectedInvoice)

      //let newCreatDate = moment(selectedInvoice.creaDate, 'DD/MM/YYYY').format('YYYY/MM/DD')
      let newOrderDate = moment(selectedInvoice.OrderDate, 'DD/MM/YYYY').format('YYYY/MM/DD')

      // const creaSwitchToDate = new Date(newCreatDate)
      // const orderSwitchToDate = new Date(newOrderDate)

      data.info = {
        description: data.description,
        reference: data.reference,
        //creaDate: newCreatDate,
        OrderDate: newOrderDate,
        locationPrice: data.locationPrice,
        clientID: selectedCustomer?.id,
        status: selectedOption ?? 'created',
      }


      data.id = data.id || 0
      data.type = 'Invoice'
      // if (data.status == null) {
      //   data = {...data, status: 'confirmed'}
      // } else {
      //   data.status = data.status
      // }
      let res = null

      res = await _saveInvoice(data)

      if ((Array.isArray(res.data) && (res.data || [])[0]?.msg === 'added') || 'updated') {
        dispatch(fetchInvoices())
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Existe déjà ') {
        dispatch(setExistItem(true))
      }

      return false
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)

export const removeInvoice = createAsyncThunk(`${name}/removeInvoice`, async (_arg, {dispatch}) => {
  let res = await _removeInvoice(_arg?.id)

  dispatch(setMsgType(res.data[0].Msg))

  dispatch(fetchInvoices())
})

//Actions
export const setInvoices = createAction(`${name}/fetchInvoices`)
export const setInvoiceDetail = createAction(`${name}/fetchInvoiceDetail`)
export const setInvoicesByCustomer = createAction(`${name}/fetchInvoicesByCodeClient`)
export const setSelectedInvoice = createAction(`${name}/setSelectedInvoice`)
export const setEditInvoice = createAction(`${name}/setEditInvoice`)
export const setStatus = createAction(`${name}/fetchStatus`)
export const setExistItem = createAction(`${name}/setExistItem`)
export const setDetailInvoice = createAction(`${name}/setDetailInvoice`)
export const setMsgType = createAction(`${name}/setMsgType`)

const InvoiceSlice = createSlice({
  name,
  initialState: {
    invoices: [],
    invoiceByCustomer: [],
    invoiceDetail: [],
    status: [],
    selectedInvoice: null,
    alreadyExist: false,
    msgType: null,
    detail: false,
    editInvoice: false,
  },
  reducers: {},
  extraReducers: {
    [setInvoices]: (state, {payload}) => {
      state.invoices = payload
    },
    [setInvoiceDetail]: (state, {payload}) => {
      state.invoiceDetail = payload
    },
    [setSelectedInvoice]: (state, {payload}) => {
      state.selectedInvoice = payload
    },
    [setEditInvoice]: (state, {payload}) => {
      state.editInvoice = payload
    },
    [setInvoicesByCustomer]: (state, {payload}) => {
      state.invoiceByCustomer = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.alreadyExist = payload
    },
    [setDetailInvoice]: (state, {payload}) => {
      state.detail = payload
    },
    [setStatus]: (state, {payload}) => {
      state.status = payload
    },
    [setMsgType]: (state, {payload}) => {
      state.msgType = payload
    },
  },
})

//selectors
export const getInvoices = (state) => state[name].invoices
export const getInvoiceDetail = (state) => state[name].invoiceDetail
export const getSelectedInvoice = (state) => state[name].selectedInvoice
export const getEditInvoice = (state) => state[name].editInvoice
export const getInvoiceByCustomer = (state) => state[name].invoiceByCustomer
export const getAlreadyExist = (state) => state[name].alreadyExist
export const getStatus = (state) => state[name].status
export const getDetailInvoice = (state) => state[name].detail
export const getMsgType = (state) => state[name].msgType

export default InvoiceSlice.reducer
