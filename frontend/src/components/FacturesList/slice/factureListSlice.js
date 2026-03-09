import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {FACTURELIST as name} from '../../../store/slices/config'
import {
  _closeFacture,
  _fetchFactureList,
  _getDetailFacture,
  _getDetailService,
  _getHistoryFormule,
  _recalculateFormule,
  _removeService,
  _updateLine,
} from '../api'
import {setToastParams} from '../../../store/slices/ui.slice'
import moment from 'moment'
import {setStatClient} from '../../Facturation/slice/elementFacturable.slice'

export const fetchFactureList = createAsyncThunk(
  `${name}/fetchFactureList`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchFactureList(_args)
      if (!response.error) {
        dispatch(setFactureList(response?.invoices))
        dispatch(setStatClient(response?.statistic))
      }
    } catch (e) {
    }
  }
)

export const fetchDetailService = createAsyncThunk(
  `${name}/fetchDetailService`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _getDetailService(_args)
      if (response.status === 200) {
        dispatch(setDetailService(response.data))
      }
    } catch (e) {
    }
  }
)

export const recalculateFormule = createAsyncThunk(
  `${name}/recalculateFormule`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _recalculateFormule(_args)
      if (response.status === 200) {
        return true
      }
    } catch (e) {
    }
  }
)

export const removeService = createAsyncThunk(
  `${name}/removeService`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _removeService(_args)
      if (response.status === 200) {
        return true
      }
    } catch (e) {
    }
  }
)

export const fetchHistoryFormule = createAsyncThunk(
  `${name}/fetchHistoryFormule`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _getHistoryFormule(_args)
      if (Array.isArray(response?.data) && response?.data?.length === 0) {
        return false
      }
      if (!response.error) {
        dispatch(setHistoryFormule(response.data))
        return true
      }
      return false
    } catch (e) {
    }
  }
)

export const updateLineInvoice = createAsyncThunk(
  `${name}/updateLineInvoice`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _updateLine(_args)
      if (response.status === 200) {
        return true
      }
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'Error',
          detail: 'Facture non trouvée',
          position: 'top-right',
        })
      )
    } catch (e) {
    }
  }
)

export const closeFacture = createAsyncThunk(
  `${name}/closeFacture`,
  async (_args, {getState, dispatch}) => {
    try {
      const {selectedClientGl} = getState()['facturation']
      let response = await _closeFacture({ids: _args?.id})
      if (response.status === 200) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'Success',
            detail: 'Facture clotureé',
            position: 'top-right',
          })
        )
        return true
      }
    } catch (e) {
    }
  }
)

export const closeMultipleFacture = createAsyncThunk(
  `${name}/closeMultipleFacture`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _closeFacture(_args)
      if (response.status === 200) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'Success',
            detail: 'Facture clotureé',
            position: 'top-right',
          })
        )
        return true
      }
    } catch (e) {
    }
  }
)

export const fetchDetailFacture = createAsyncThunk(
  `${name}/fetchDetailFacture`,
  async (_args, {getState, dispatch}) => {
    try {
      const response = await _getDetailFacture({id: _args})
      if (!Array.isArray(response?.data) || response?.data?.length === 0) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'warn',
            summary: 'Warning',
            detail: 'Facture non trouvée',
            position: 'top-right',
          })
        )
        return false
      }
      if (!response.error) {
        let detail = response.data?.[0]
        detail = {
          ...detail,
          detailInvoice: JSON.parse(detail?.detailInvoice || '[]'),
        }
        dispatch(setDetailFacture(detail))
        return true
      }
      return false
    } catch (e) {
    }
  }
)

const factureListSlice = createSlice({
  name,
  initialState: {
    factureList: [],
    loadingPdfRows: [],
    detailFacture: [],
    detailService: [],
    formulHistory: [],
    visibleDetailFac: false,
  },
  reducers: {
    setHistoryFormule(state, {payload}) {
      state.formulHistory = payload
    },
    setDetailService(state, {payload}) {
      state.detailService = payload
    },
    setFactureList(state, {payload}) {
      state.factureList = payload
    },
    setLoadingPdfRows(state, {payload}) {
      state.loadingPdfRows = payload
    },
    setDetailFacture(state, {payload}) {
      state.detailFacture = payload
    },
    setVisibleDetailFac(state, {payload}) {
      state.visibleDetailFac = payload
    },
  },
})

export const getFactureList = (state) => state[name].factureList
export const getLoadingPdfRows = (state) => state[name].loadingPdfRows
export const getDetailFacture = (state) => state[name].detailFacture
export const getVisibleDetailFac = (state) => state[name].visibleDetailFac
export const getDetailService = (state) => state[name].detailService
export const getFormulHistory = (state) => state[name].formulHistory

export const {
  setFactureList,
  setLoadingPdfRows,
  setHistoryFormule,
  setDetailFacture,
  setVisibleDetailFac,
  setDetailService,
} = factureListSlice.actions
export default factureListSlice.reducer
