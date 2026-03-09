import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {FACTUREFORNESSEUR as name} from '../../../store/slices/config'
import {
  _closeFacture,
  _fetchArchivedFr,
  _fetchDropDownFr,
  _fetchFactureFr,
  _fetchFactureList,
  _fetchFactureValidationFr,
  _fetchListFr,
  _fetchPendingFr,
  _getDetailFacture,
  _mergeInvoices,
  _saveStatusFac,
} from '../api'
import {_fetchStatusFacture} from '../../Facturation/api'
import {setToastParams} from '../../../store/slices/ui.slice'

export const fetchFactureListFr = createAsyncThunk(
  `${name}/fetchFactureListFr`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchFactureFr(_args)
      if (!response.error) {
        // if (!Array.isArray(response?.data) || response?.data?.length === 0) return
        dispatch(setFactureListFr(response?.invoices))
        dispatch(setStatFr(response?.statistic?.[0]))
      }
    } catch (e) {
    }
  }
)

export const mergeInvoices = createAsyncThunk(
  `${name}/mergeInvoices`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _mergeInvoices(_args)
      if (!response.error) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'MERGE',
            detail: 'Services mergees',
          })
        )
      }
    } catch (e) {
    }
  }
)

export const fetchArchivedFr = createAsyncThunk(
  `${name}/fetchArchivedFr`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchArchivedFr(_args)
      if (!response.error) {
        dispatch(setArchivedListFr(response.data))
        return response.data
      }
    } catch (e) {
    }
  }
)

export const fetchFacturePendingFr = createAsyncThunk(
  `${name}/fetchFacturePendingFr`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchPendingFr(_args)
      if (!response?.error) {
        if (!Array.isArray(response?.invoices)) return
        dispatch(setStatFr(response?.statistic?.[0]))
        dispatch(setFacPendingFr(response?.invoices))
      }
    } catch (e) {
    }
  }
)

export const fetchStatusFacture = createAsyncThunk(
  `${name}/fetchStatusFacture`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchStatusFacture({
        src: 'Orders',
      })
      if (response.status === 200) {
        dispatch(setStatusListFac(response.data))
      }
    } catch (e) {
    }
  }
)

export const saveStatusFac = createAsyncThunk(
  `${name}/saveStatusFac`,
  async (_args, {getState, dispatch}) => {
    try {
      let {selectedFrGlobal} = getState()[name]
      let response = await _saveStatusFac(_args)
      if (response.status === 200) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Status bien enregistré',
            position: 'top-right',
          })
        )
        return true
      }
      return false
    } catch (e) {
    }
  }
)
export const fetchFactureValidationFr = createAsyncThunk(
  `${name}/fetchFactureValidationFr`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchFactureValidationFr(_args)
      if (!response.error) {
        // if (!Array.isArray(response?.data) || response?.data?.length === 0) return
        // dispatch(setStatFr(response?.statistic?.[0]))
        dispatch(setValidationListFr(response.data))
        return response.data
      }
    } catch (e) {
    }
  }
)

export const fetchListFr = createAsyncThunk(
  `${name}/fetchListFr`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchListFr(_args)
      if (response.status === 200) {
        dispatch(setListFr(response.data))
      }
    } catch (e) {
    }
  }
)

export const facturedDropDownAutoFr = createAsyncThunk(
  `${name}/facturedDropDownAutoFr`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchDropDownFr(_args)
      if (!response.error) dispatch(setDropAutoFr(response.data))
    } catch (e) {
    }
  }
)

const factureFornisseurSlice = createSlice({
  name,
  initialState: {
    selectedFrGlobal: null,
    factureListFr: [],
    facturePendingFr: [],
    selectedInvoicesFr: [],
    elementFacturableFr: [],
    validationListFr: [],
    detailFacFr: [],
    listFr: [],
    dropAutoFr: [],
    listStatusFac: [],
    statFr: {},
    selectedDetail: [],
    archivedListFr: [],
    showDetailFacFr: false,
    detailVisibleValid: false,
    visibleArchivedFr: false,
  },
  reducers: {
    setVisibleArchivedFr: (state, {payload}) => {
      state.visibleArchivedFr = payload
    },
    setArchivedListFr: (state, {payload}) => {
      state.archivedListFr = payload
    },
    setStatFr: (state, {payload}) => {
      state.statFr = payload
    },
    setSelectedDetail: (state, {payload}) => {
      state.selectedDetail = payload
    },
    setSelectedFrGlobal(state, {payload}) {
      state.selectedFrGlobal = payload
    },
    setDetailVisibleValidFr(state, {payload}) {
      state.detailVisibleValid = payload
    },
    setFacPendingFr(state, {payload}) {
      state.facturePendingFr = payload
    },
    setFactureListFr(state, {payload}) {
      state.factureListFr = payload
    },
    setSelectedInvoicesFr(state, {payload}) {
      state.selectedInvoicesFr = payload
    },
    setElementFacturableFr(state, {payload}) {
      state.elementFacturableFr = payload
    },
    setValidationListFr(state, {payload}) {
      state.validationListFr = payload
    },
    setDetailFacFr(state, {payload}) {
      state.detailFacFr = payload
    },
    setShowDetailFacFr(state, {payload}) {
      state.showDetailFacFr = payload
    },
    setListFr(state, {payload}) {
      state.listFr = payload
    },
    setStatusListFac(state, {payload}) {
      state.listStatusFac = payload
    },
    setDropAutoFr(state, {payload}) {
      state.dropAutoFr = payload
    },
  },
})

export const getFactureListFr = (state) => state[name].factureListFr
export const getSelectedInvoicesFr = (state) => state[name].selectedInvoicesFr
export const getElementFacturableFr = (state) => state[name].elementFacturableFr
export const getValidationListFr = (state) => state[name].validationListFr
export const getDetailFacFr = (state) => state[name].detailFacFr
export const getShowDetailFacFr = (state) => state[name].showDetailFacFr
export const getListFr = (state) => state[name].listFr
export const getListStatusFac = (state) => state[name].listStatusFac
export const getFacturePendingFr = (state) => state[name].facturePendingFr
export const getDropAutoFr = (state) => state[name].dropAutoFr
export const getDetailVisibleValid = (state) => state[name].detailVisibleValid
export const getStatFr = (state) => state[name].statFr
export const getSelectedFrGlobal = (state) => state[name].selectedFrGlobal
export const getSelectedDetail = (state) => state[name].selectedDetail
export const getArchiveListFr = (state) => state[name].archivedListFr
export const getVisibleArchivedFr = (state) => state[name].visibleArchivedFr

export const {
  setArchivedListFr,
  setFactureListFr,
  setSelectedInvoicesFr,
  setElementFacturableFr,
  setValidationListFr,
  setDetailFacFr,
  setShowDetailFacFr,
  setListFr,
  setStatusListFac,
  setFacPendingFr,
  setDropAutoFr,
  setDetailVisibleValidFr,
  setStatFr,
  setSelectedFrGlobal,
  setSelectedDetail,
  setVisibleArchivedFr,
} = factureFornisseurSlice.actions
export default factureFornisseurSlice.reducer
