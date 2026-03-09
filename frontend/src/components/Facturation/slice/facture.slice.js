import {createAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {FACTURE as name} from '../../../store/slices/config'
import {_getInfoClient, _getInfoDepot, _invoiceSaveNd} from '../api'
import {fetchInvoices} from '../../Invoices/slice/invoice.slice'

export const invoiceSave = createAsyncThunk(
  `${name}/invoiceSave`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _invoiceSaveNd(_args)
      if (response?.data[0]?.typeMsg === 'success') {
        dispatch(fetchInvoices())
        return response.data?.[0].idinvoice
      }
      return false
    } catch (error) {
      return false
    }
  }
)
export const getInfoClient = createAsyncThunk(
  `${name}/getInfoClient`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _getInfoClient(_args)
      if (!response?.error) {
        dispatch(setInfoClient(response.data))
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }
)
export const getInfoDeposit = createAsyncThunk(
  `${name}/getInfoDeposit`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _getInfoDepot(_args)
      if (!response?.error) {
        dispatch(setInfoDeposit(response.data))
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }
)
export const setSelectedFacture = createAction(`${name}/setSelectedFacture`)
export const setFactures = createAction(`${name}/setFactures`)
export const setOptionsValid = createAction(`${name}/setOptionsValid`)
export const setSelectedOptionsValid = createAction(`${name}/setSelectedOptionsValid`)
export const setOptionsConfirmation = createAction(`${name}/setOptionsConfirmation`)
export const setElementsFacture = createAction(`${name}/setElementsFacture`)

const FactureSlice = createSlice({
  name,
  initialState: {
    factures: [
      {
        identifiant: 187,
        nTourne: 100,
        idClient: 1,
        prestation: 'Article001',
        changeAdr: 'Casablanca',
        livraisonAdr: 'Kenitra',
        formule: '____',
        tarif: '2000',
        date: '29/04/2023',
        status: 'confirmed',
        isValid: null,
        validationFournisseur: 'pas',
        comment: '',
        validationClient: 'non',
        codeStatus: null,
        color: '#eee',
        backgroundColor: null,
        CustomerId: 27,
      },
      {
        identifiant: 120,
        nTourne: 330,
        idClient: 2,
        prestation: 'Article002',
        changeAdr: 'Fes',
        livraisonAdr: 'Oujda',
        formule: '____',
        tarif: '2000',
        date: '04/08/2020',
        status: 'confirmed',
        isValid: null,
        validationFournisseur: 'pas',
        validationClient: 'non',
        comment: '',
        client: 'kk',
        codeStatus: null,
        color: '#eee',
        backgroundColor: null,
        CustomerId: 27,
      },
      {
        identifiant: 90,
        nTourne: 30,
        idClient: 2,
        prestation: 'Article002',
        changeAdr: 'Fes',
        livraisonAdr: 'Oujda',
        formule: '____',
        tarif: '2000',
        date: '04/08/2020',
        status: 'confirmed',
        isValid: false,
        validationFournisseur: true,
        validationClient: 'non',
        comment: 'remarque1',
        client: 'kk',
        codeStatus: null,
        color: '#eee',
        backgroundColor: null,
        CustomerId: 27,
      },
      {
        identifiant: 1780,
        nTourne: 50,
        idClient: 2,
        prestation: 'Article002',
        changeAdr: 'Fes',
        livraisonAdr: 'Oujda',
        formule: '____',
        tarif: '2000',
        date: '04/08/2020',
        status: 'confirmed',
        isValid: true,
        validationFournisseur: false,
        validationClient: 'non',
        comment: '',
        client: 'kk',
        codeStatus: null,
        color: '#eee',
        backgroundColor: null,
        CustomerId: 27,
      },
    ],
    elementsFacture: [],
    infoClient: null,
    infoDeposit: null,
    selectedFacture: [],
    selectedClientFc: null,
    optionsValid: [
      {
        id: 1,
        name: 'Valide',
        value: true,
      },
      {
        id: 0,
        name: 'Non Valide',
        value: false,
      },
    ],
    optionsConfirmation: [
      {
        id: 1,
        name: 'confirmed',
        value: true,
      },
      {
        id: 0,
        name: 'Non confirmed',
        value: false,
      },
    ],
    selectedOptionsValid: '',
  },
  reducers: {
    setSelectedClientFc: (state, {payload}) => {
      state.selectedClientFc = payload
    },
    setInfoClient: (state, {payload}) => {
      state.infoClient = payload
    },
    setInfoDeposit: (state, {payload}) => {
      state.infoDeposit = payload
    },
  },
  extraReducers: {
    [setFactures]: (state, {payload}) => {
      state.factures = payload
    },

    [setSelectedFacture]: (state, {payload}) => {
      state.selectedFacture = payload
    },

    [setOptionsValid]: (state, {payload}) => {
      state.optionsValid = payload
    },
    [setSelectedOptionsValid]: (state, {payload}) => {
      state.selectedOptionsValid = payload
    },
    [setOptionsConfirmation]: (state, {payload}) => {
      state.optionsValid = payload
    },
    [setElementsFacture]: (state, {payload}) => {
      state.elementsFacture = payload
    },
  },
})

//selectors

export const getFactures = (state) => state[name].factures
export const getSelectedFacture = (state) => state[name].selectedFacture
export const getOptionsValid = (state) => state[name].optionsValid
export const getSelectedOptionsValid = (state) => state[name].selectedOptionsValid
export const getOptionsConfirmation = (state) => state[name].optionsConfirmation
export const getElementsFacture = (state) => state[name].elementsFacture
export const getDataClient = (state) => state[name].infoClient
export const getSelectedClientFc = (state) => state[name].selectedClientFc

export const getDataDeposit = (state) => state[name].infoDeposit

export const {setSelectedClientFc, setInfoClient, setInfoDeposit} = FactureSlice.actions

export default FactureSlice.reducer
