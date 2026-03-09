import {createAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {ELEMENTFACTURABLE as name} from '../../../store/slices/config'
import {
  _calculInvoice,
  _fetchInvoicePendingBilling,
  _generatePdf,
  _generatePdfGetStatus,
  _saveInvoicePendingBilling,
} from '../api'
import _ from 'lodash'
import {setLoadingPdfRows} from '../../FacturesList/slice/factureListSlice'
import moment from 'moment'

export const fetchInvoicePendingBilling = createAsyncThunk(
  `${name}/fetchInvoicePendingBilling`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchInvoicePendingBilling(_args)
    if (!response?.error) {
      if (!Array.isArray(response?.invoices)) return
      const newFormated = response?.invoices.map((item) => {
        return {
          ...item,
          OTDateLivraison: item?.OTDateLivraison ? new Date(item?.OTDateLivraison) : null,
          servicestatutDate: item?.servicestatutDate ? new Date(item?.servicestatutDate) : null,
        }
      })
      dispatch(setStatClient(response?.statistic?.[0]))
      dispatch(setInvoicePendingBilling(response?.invoices))
    }
  }
)

export const calculInvoice = createAsyncThunk(
  `${name}/calculInvoice`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _calculInvoice(_args)
      if (!response?.error) {
        dispatch(setSelectedFactureCalc(response))
      }
    } catch (e) {
    }
  }
)

export const generateCrtPdfFac = createAsyncThunk(
  `${name}/generateCrtPdfFac`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _generatePdf(_args)
      if (!response?.error) {
        let id = response?.data?.[0]?.ID
        dispatch(generateCrtPdfGetStatus({id: id}))
        return response.data
      }
    } catch (e) {
    }
  }
)
export const generateCrtPdfGetStatus = createAsyncThunk(
  `${name}/generateCrtPdfGetStatus`,
  async (_args, {getState, dispatch}) => {
    try {
      const intervalId = setInterval(async () => {
        const response = await _generatePdfGetStatus(_args)
        if (response.data?.[0]?.status === 1) {
          clearInterval(intervalId)
          dispatch(setLoadingPdfRows([]))
          window.open(response.data[0]?.filepath, '_blank')
        }
      }, 5000)
    } catch (e) {
    }
  }
)

export const createOrUpdatePendingBilling = createAsyncThunk(
  `${name}/createOrUpdatePendingBilling`,
  async (_, {dispatch, getState}) => {
    try {

      const selectedInvoices = getState()[name].selectedInvoices
      const factureId = getState()[name].factureId

      const successResponses = []

      for (const invoice of selectedInvoices) {
        const obj = {
          id: parseInt(invoice.id || invoice.uid),
          customerId: parseInt(invoice.customerId),
          invoiceId: factureId,
        }


        const res = await _saveInvoicePendingBilling(obj)

        if (
          (Array.isArray(res.data) && ['added', 'updated'].includes(res.data[0]?.msg)) ||
          (Array.isArray(res.data) && res.data[0]?.msg === 'Existe déjà ')
        ) {
          successResponses.push(res.data)
        }
      }

      // if (successResponses.length > 0) {
      //   dispatch(fetchInvoicePendingBilling())
      //   return true
      // }

      return false
    } catch (e) {
      return false
    }
  }
)

//Actions
export const setInvoicePendingBilling = createAction(`${name}/fetchInvoicePendingBilling`)
export const setSelectedInvoices = createAction(`${name}/setSelectedInvoices`)
export const setFactureId = createAction(`${name}/setFactureId`)

const ElementFacturableSlice = createSlice({
  name,
  initialState: {
    invoicePendingBilling: [],
    selectedFactureCalc: [],
    statClient: {},
    selectedInvoices: null,
    showCreateFac: false,
    factureId: null,
  },
  reducers: {
    setStatClient: (state, {payload}) => {
      state.statClient = payload
    },
    setShowCreateFac: (state, {payload}) => {
      state.showCreateFac = payload
    },
    setSelectedFactureCalc: (state, {payload}) => {
      state.selectedFactureCalc = payload
    },
  },
  extraReducers: {
    [setInvoicePendingBilling]: (state, {payload}) => {
      state.invoicePendingBilling = payload
    },
    [setSelectedInvoices]: (state, {payload}) => {
      state.selectedInvoices = payload
    },
    [setFactureId]: (state, {payload}) => {
      state.factureId = payload
    },
  },
})

export const getInvoicePendingBilling = (state) => state[name].invoicePendingBilling
export const getSelectedInvoices = (state) => state[name].selectedInvoices
export const getFactureId = (state) => state[name].factureId
export const getShowCreateFac = (state) => state[name].showCreateFac
export const getSelectedFactureCalc = (state) => state[name].selectedFactureCalc
export const getStatClient = (state) => state[name].statClient

export const {setShowCreateFac, setSelectedFactureCalc, setStatClient} =
  ElementFacturableSlice.actions
export default ElementFacturableSlice.reducer
