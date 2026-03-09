import {createAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {FACTURATION as name} from '../../../store/slices/config'
import {
  _fetchEtatList,
  _fetchMatriceItemsList,
  _fetchMatriceList,
  _fetchNiveauSrcDataList,
  _fetchParametersList,
  _fetchParamsList,
  _fetchPrestationList,
  _fetchTarifList,
  _removeMatrice,
  _saveMatrix,
  _saveMatrixDetails,
  _savePrixMatrix,
  _saveTarif,
  _fetchTarifGet,
  _removeTarif,
  _fetchFactureValidation,
  _facturedDropDownAuto,
  _updateService,
  _updateMultiPrice,
  _updateStatusService,
  _fetchArchivedClient,
  _getPercentage,
  _fetchDetailClient,
  _updatePriceCou,
  _fetchClientFac,
} from '../api'
import _ from 'lodash'
import moment from 'moment'
import {setToastParams} from '../../../store/slices/ui.slice'

export const fetchMatrices = createAsyncThunk(
  `${name}/fetchMatrices`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchMatriceList()
    if (response.status === 200) dispatch(setMatrices(response.data))
  }
)
export const getTarif = createAsyncThunk(
  `${name}/getTarif`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTarifGet(_args)
    if (response.status === 200) dispatch(setGetTarifs(response.data))
  }
)
export const fetchMatriceItems = createAsyncThunk(
  `${name}/fetchMatriceItems`,
  async (id, {getState, dispatch}) => {
    let response = await _fetchMatriceItemsList(id)
    if (response.status === 200) dispatch(setMatriceItems(response.data))
    else dispatch(setMatriceItems([]))
  }
)

export const fetchCustomersFac = createAsyncThunk(
  `${name}/fetchCustomersFac`,
  async (id, {getState, dispatch}) => {
    let response = await _fetchClientFac(id)
    if (!response.error) {
      dispatch(setClientFac(response.data))
    }
  }
)

export const fetchTarifs = createAsyncThunk(
  `${name}/fetchTarifs`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTarifList()
    if (response.status === 200) dispatch(setTarifs(response.data))
  }
)

export const fetchParamsNiveau = createAsyncThunk(
  `${name}/fetchParamsNiveau`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchParamsList()
    if (response.status === 200) dispatch(setParamsNiveau(response.data))
  }
)

export const fetchParameters = createAsyncThunk(
  `${name}/fetchParameters`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchParametersList()
    if (response.status === 200) dispatch(setParametersList(response.data))
  }
)

export const fetchNiveauSrcData = createAsyncThunk(
  `${name}/fetchNiveauSrcData`,
  async (IdParam, {getState, dispatch}) => {
    let response = await _fetchNiveauSrcDataList(IdParam)
    if (response.status === 200) dispatch(setNiveauSrcData(response.data))
  }
)

export const fetchPrestation = createAsyncThunk(
  `${name}/fetchPrestation`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchPrestationList()
    if (response.status === 200) dispatch(setPrestationList(response.data))
  }
)

export const fetchEtat = createAsyncThunk(
  `${name}/fetchPrestation`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchEtatList()
    if (response.status === 200) dispatch(setEtatList(response.data))
  }
)

export const updateServicePrice = createAsyncThunk(
  `${name}/updateServicePrice`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _updateService(_args)
    } catch (e) {
      console.warn('error updateServicePrice:', e.message)
    }
  }
)

export const updateServicePriceCou = createAsyncThunk(
  `${name}/updateServicePriceCou`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _updatePriceCou(_args)
    } catch (e) {
      console.warn('error updateServicePriceCou:', e.message)
    }
  }
)

export const fetchDetailClient = createAsyncThunk(
  `${name}/fetchDetailClient`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchDetailClient(_args)
      if (!response.error) {
        dispatch(setDetailClient(response?.data))
      }
    } catch (e) {
      console.warn('error fetchDetailClient:', e.message)
    }
  }
)

export const getPercentFile = createAsyncThunk(
  `${name}/getPercentFile`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _getPercentage(_args)
      if (!response.data || response.data.length === 0) return null
      const {waiting, done} = response.data[0]
      const total = waiting + done
      if (total === 0) dispatch(setPercentageFile({waiting: '0%', done: '0%'}))
      const data = {
        waiting: ((waiting / total) * 100).toFixed(2),
        done: ((done / total) * 100).toFixed(2),
      }
      dispatch(setPercentageFile(data))
    } catch (e) {
      console.warn('error getPercentFile:', e.message)
    }
  }
)

export const updateMultiPrice = createAsyncThunk(
  `${name}/updateMultiPrice`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _updateMultiPrice(_args)
    } catch (e) {
      console.warn('error updateServicePrice:', e.message)
    }
  }
)

export const fetchArchivedClient = createAsyncThunk(
  `${name}/fetchArchivedClient`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchArchivedClient(_args)
      if (!response.error) {
        dispatch(setArchivedClient(response?.data))
        return response.data
      }
    } catch (e) {
      console.warn('error fetchArchivedClient:', e.message)
    }
  }
)

export const updateServiceStatus = createAsyncThunk(
  `${name}/updateServiceStatus`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _updateStatusService(_args)
      if (response?.data?.[0].typeMsg === 'success') {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: response?.data?.[0].msg,
            position: 'top-right',
          })
        )
        return true
      }
    } catch (e) {
      console.warn('error updateServiceStatus:', e.message)
    }
  }
)

export const fetchFactureValidation = createAsyncThunk(
  `${name}/fetchFactureValidation`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchFactureValidation(_args)
      if (!response.error) {
        const data = response.data
        // const dataFormated = data?.map((item) => ({
        //   ...item,
        //   OrderDate: moment(item?.OrderDate, 'DD/MM/YYYY').toDate(), // Convert OrderDate
        //   creaDate: moment(item?.creaDate, 'DD/MM/YYYY').toDate(), // Convert creaDate
        // }))
        dispatch(setFactureValidation(data))
        return data
      }
    } catch (e) {
    }
  }
)

export const facturedDropDownAuto = createAsyncThunk(
  `${name}/facturedDropDownAuto`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _facturedDropDownAuto(_args)
      if (!response.error) dispatch(setDropClient(response.data))
    } catch (e) {
    }
  }
)

export const createOrUpdateMatrix = createAsyncThunk(
  `${name}/createOrUpdateMatrix`,
  async (data, {dispatch, getState}) => {
    try {
      let {selectedMatrix} = getState()[name]
      let matrix = _.cloneDeep(selectedMatrix)
      let obj = {
        id: selectedMatrix?.id || 0,
        code: selectedMatrix?.Code || matrix?.code,
        desc: selectedMatrix?.Description || matrix?.desc,
        xp: data?.selectedDimensV || selectedMatrix?.XFieldName,
        xu:
          data?.selectedDimensV === 'Volume prestation'
            ? 'm3'
            : data?.selectedDimensV === 'Poids prestation'
            ? 'kg'
            : data?.selectedDimensV === 'Prix du prestation'
            ? 'CHF'
            : 'zone',
      }

      if (data?.checkedDimension) {
        obj.yp = data?.selectedDimensH
        obj.yu =
          data?.selectedDimensH === 'Volume prestation'
            ? 'm3'
            : data?.selectedDimensH === 'Poids prestation'
            ? 'kg'
            : data?.selectedDimensH === 'Prix du prestation'
            ? 'CHF'
            : data?.selectedDimensH === 'Zone selon NP livraison'
            ? 'zone'
            : null
      }

      let res = null

      res = await _saveMatrix(obj)

      if (
        (Array.isArray(res.data) && res.data[0]?.msg === 'added') ||
        res.data[0]?.msg === 'updated'
      ) {
        dispatch(fetchMatrices())
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Matrice bien enregistré',
            position: 'top-right',
          })
        )
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'already exists') {
        //dispatch(setExistItem(true))
        dispatch(setLoadingMatr(false))
        dispatch(
          setToastParams({
            show: true,
            severity: 'error',
            summary: 'Error',
            detail: 'Matrice existe déjà',
            position: 'top-right',
          })
        )
        return false
      }
      dispatch(setLoadingMatr(false))
      return false
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)

export const createMatrixDimension = createAsyncThunk(
  `${name}/createMatrixDimension`,
  async (data, {dispatch, getState}) => {
    try {
      let {selectedMatrix} = getState()[name]
      let obj = {
        id: 1,
        dim: '',
        max: '',
      }

      let res = null

      res = await _saveMatrixDetails(data)

      if ((Array.isArray(res.data) && (res.data || [])[0]?.msg === 'added') || 'updated') {
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Existe déjà ') {
        //dispatch(setExistItem(true))
      }

      return false
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)

export const UpdatePrixMatrice = createAsyncThunk(
  `${name}/UpdatePrixMatrice`,
  async (args, {dispatch, getState}) => {
    try {
      let {selectedDetailMatrix} = getState()[name]

      let res = null
      res = await _savePrixMatrix(selectedDetailMatrix)


      if (res.status === 200) {
        return true
      } else if (!res.success) {
        return false
      }
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)

export const createOrUpdateTarif = createAsyncThunk(
  `${name}/createOrUpdateTarif`,
  async (data, {dispatch, getState}) => {
    try {
      let {selectedTarif} = getState()[name]
      let obj = {
        ...data,
        id_tarif: selectedTarif?.id_tarif || 0,
        srcId: data?.customerId || 0,
      }
      let res = null
      res = await _saveTarif(obj)

      if (
        (Array.isArray(res.data) && res.data[0]?.msg === 'added') ||
        res.data[0]?.msg === 'updated'
      ) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Tarif bien enregistré',
            position: 'top-right',
          })
        )
        dispatch(setLoadingTar(false))
        dispatch(fetchTarifs())
        return true
      } else if (!res.success) {
        dispatch(setLoadingTar(false))
        return false
      }
    } catch (e) {
      dispatch(setLoadingTar(false))
      //   return { error: true, message: e.message }
      return false
    }
  }
)

export const removeTarif = createAsyncThunk(`${name}/removeTarif`, async (_arg, {dispatch}) => {
  try {
    let res = await _removeTarif({id: _arg})
    if (res.data[0]?.typeMsg === 'success') {
      dispatch(
        setToastParams({
          show: true,
          severity: 'success',
          summary: 'SUCCESS',
          detail: 'Tarif bien supprimé',
          position: 'top-right',
        })
      )
      dispatch(fetchTarifs())
      return true
    }
    dispatch(
      setToastParams({
        show: true,
        severity: 'error',
        summary: 'ERROR',
        detail: 'Tarif non supprimé',
        position: 'top-right',
      })
    )
  } catch (e) {
    return false
  }
})

export const removeMatrice = createAsyncThunk(`${name}/removeMatrice`, async (_arg, {dispatch}) => {
  let res = await _removeMatrice(_arg?.id)


  dispatch(fetchMatrices())
})

//Actions
export const setMatrices = createAction(`${name}/fetchMatrices`)
export const setGetTarifs = createAction(`${name}/getTarif`)
export const setTarifs = createAction(`${name}/fetchTarifs`)
export const setParamsNiveau = createAction(`${name}/fetchParamsNiveau`)
export const setParametersList = createAction(`${name}/fetchParameters`)
export const setPrestationList = createAction(`${name}/fetchPrestation`)
export const setEtatList = createAction(`${name}/fetchEtat`)
export const setNiveauSrcData = createAction(`${name}/fetchNiveauSrcData`)
export const setVisibleNew = createAction(`${name}/setVisibleNew`)
export const setSelectedMatrix = createAction(`${name}/selectedMatrix`)
export const setSelectedPrestation = createAction(`${name}/selectedPrestation`)
export const setSelectedEtat = createAction(`${name}/selectedEtat`)
export const setSelectedSrcData = createAction(`${name}/selectedSrcData`)
export const setMatriceDetail = createAction(`${name}/setMatriceDetail`)
export const setMatriceItems = createAction(`${name}/fetchMatriceItems`)
export const setIsNewDetail = createAction(`${name}/setIsNewDetail`)
export const setSelectedDetailMatrix = createAction(`${name}/setSelectedDetailMatrix`)
export const setSelectedParam = createAction(`${name}/setSelectedParam`)
export const setSelectedTarif = createAction(`${name}/setSelectedTarif`)
export const setFormuleCondition = createAction(`${name}/setFormuleCondition`)
export const setFormuleCalcul = createAction(`${name}/setFormuleCalcul`)
export const setVisibleCalcul = createAction(`${name}/setVisibleCalcul`)
export const setDataTarif = createAction(`${name}/setDataTarif`)
export const setEditMatrice = createAction(`${name}/setEditMatrice`)

const FacturationSlice = createSlice({
  name,
  initialState: {
    percentageFile: {},
    clientFac: [],
    matrices: [],
    dropClient: [],
    factureValudation: [],
    editMatrice: false,
    matriceDetail: false,
    matriceItems: [],
    isNewDetail: true,
    loadingMatr: false,
    loadingTar: false,
    tarifs: [],
    paramsNiveau: [],
    niveauSrcData: [],
    selectedSrcData: [],
    visibleNew: false,
    selectedMatrix: null,
    prestationList: [],
    selectedPrestation: null,
    etatList: [],
    selectedEtat: [],
    parametersList: [],
    selectedDetailMatrix: [],
    selectedParam: null,
    selectedTarif: [],
    formuleCondition: null,
    formuleCalcul: null,
    visibleCalcul: false,
    dataTarif: [],
    getTarif: [],
    detailValidVisible: false,
    selectedClientGl: null,
    archivedClient: [],
    visibleArchivedCl: false,
    detailClient: [],
    intervalFile: null,
  },
  reducers: {
    setClientFac: (state, {payload}) => {
      state.clientFac = payload
    },
    setIntervalFile: (state, {payload}) => {
      state.intervalFile = payload
    },
    setDetailClient: (state, {payload}) => {
      state.detailClient = payload
    },
    setPercentageFile: (state, {payload}) => {
      state.percentageFile = payload
    },
    setVisibelArchivedCl: (state, {payload}) => {
      state.visibleArchivedCl = payload
    },
    setArchivedClient: (state, {payload}) => {
      state.archivedClient = payload
    },
    setDetailVisibleValid: (state, {payload}) => {
      state.detailValidVisible = payload
    },
    setLoadingMatr: (state, {payload}) => {
      state.loadingMatr = payload
    },
    setLoadingTar: (state, {payload}) => {
      state.loadingTar = payload
    },
    setFactureValidation: (state, {payload}) => {
      state.factureValudation = payload
    },
    setDropClient: (state, {payload}) => {
      state.dropClient = payload
    },
    setSelectedClientGl: (state, {payload}) => {
      state.selectedClientGl = payload
    },
  },
  extraReducers: {
    [setMatrices]: (state, {payload}) => {
      state.matrices = payload
    },
    [setGetTarifs]: (state, {payload}) => {
      state.getTarif = payload
    },
    [setTarifs]: (state, {payload}) => {
      state.tarifs = payload
    },
    [setVisibleNew]: (state, {payload}) => {
      state.visibleNew = payload
    },
    [setSelectedMatrix]: (state, {payload}) => {
      state.selectedMatrix = payload
    },
    [setParamsNiveau]: (state, {payload}) => {
      state.paramsNiveau = payload
    },
    [setNiveauSrcData]: (state, {payload}) => {
      state.niveauSrcData = payload
    },
    [setPrestationList]: (state, {payload}) => {
      state.prestationList = payload
    },
    [setEtatList]: (state, {payload}) => {
      state.etatList = payload
    },
    [setParametersList]: (state, {payload}) => {
      state.parametersList = payload
    },
    [setSelectedPrestation]: (state, {payload}) => {
      state.selectedPrestation = payload
    },
    [setSelectedEtat]: (state, {payload}) => {
      state.selectedEtat = payload
    },
    [setSelectedSrcData]: (state, {payload}) => {
      state.selectedSrcData = payload
    },
    [setMatriceDetail]: (state, {payload}) => {
      state.matriceDetail = payload
    },
    [setMatriceItems]: (state, {payload}) => {
      state.matriceItems = payload
    },
    [setIsNewDetail]: (state, {payload}) => {
      state.isNewDetail = payload
    },
    [setSelectedDetailMatrix]: (state, {payload}) => {
      state.selectedDetailMatrix = payload
    },
    [setSelectedParam]: (state, {payload}) => {
      state.selectedParam = payload
    },
    [setSelectedTarif]: (state, {payload}) => {
      state.selectedTarif = payload
    },
    [setFormuleCondition]: (state, {payload}) => {
      state.formuleCondition = payload
    },
    [setVisibleCalcul]: (state, {payload}) => {
      state.visibleCalcul = payload
    },
    [setFormuleCalcul]: (state, {payload}) => {
      state.formuleCalcul = payload
    },
    [setDataTarif]: (state, {payload}) => {
      state.dataTarif = payload
    },
    [setEditMatrice]: (state, {payload}) => {
      state.editMatrice = payload
    },
  },
})

//selectors
export const getMatrices = (state) => state[name].matrices
export const getTarifs = (state) => state[name].tarifs
export const getVisibleNew = (state) => state[name].visibleNew
export const getSelectedMatrix = (state) => state[name].selectedMatrix
export const getParamsNiveau = (state) => state[name].paramsNiveau
export const getNiveauSrcData = (state) => state[name].niveauSrcData
export const getPrestationList = (state) => state[name].prestationList
export const getEtatList = (state) => state[name].etatList
export const getParametersList = (state) => state[name].parametersList
export const getSelectedPrestation = (state) => state[name].selectedPrestation
export const getSelectedEtat = (state) => state[name].selectedEtat
export const getSelectedSrcData = (state) => state[name].selectedSrcData
export const getMatriceDetail = (state) => state[name].matriceDetail
export const getMatriceItems = (state) => state[name].matriceItems
export const getIsNewDetail = (state) => state[name].isNewDetail
export const getSelectedDetailMatrix = (state) => state[name].selectedDetailMatrix
export const getSelectedParam = (state) => state[name].selectedParam
export const getSelectedTarif = (state) => state[name].selectedTarif
export const getFormuleCondition = (state) => state[name].formuleCondition
export const getFormuleCalcul = (state) => state[name].formuleCalcul
export const getVisibleCalcul = (state) => state[name].visibleCalcul
export const getDataTarif = (state) => state[name].dataTarif
export const getEditMatrice = (state) => state[name].editMatrice
export const getLoadingMatr = (state) => state[name].loadingMatr
export const getLoadingTar = (state) => state[name].loadingTar
export const getFactureValidation = (state) => state[name].factureValudation
export const getDropClient = (state) => state[name].dropClient
export const getDetailValidVisible = (state) => state[name].detailValidVisible
export const getSelectedClientGl = (state) => state[name].selectedClientGl
export const getArchivedClient = (state) => state[name].archivedClient
export const getVisibleArchivedCl = (state) => state[name].visibleArchivedCl
export const getPercentageFileVar = (state) => state[name].percentageFile
export const getDetailClient = (state) => state[name].detailClient
export const getIntervalFile = (state) => state[name].intervalFile
export const getClientFac = (state) => state[name].clientFac

export const {
  setClientFac,
  setDetailClient,
  setArchivedClient,
  setLoadingMatr,
  setLoadingTar,
  setFactureValidation,
  setDropClient,
  setSelectedClientGl,
  setDetailVisibleValid,
  setVisibelArchivedCl,
  setPercentageFile,
  setIntervalFile,
} = FacturationSlice.actions
export default FacturationSlice.reducer
