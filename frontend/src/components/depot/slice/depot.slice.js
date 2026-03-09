import {createAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {DEPOT as name} from '../../../store/slices/config'
import {_fetchDepots, _fetchGeoForDepot, _relationAdd, _removeDepot, _saveDepot} from '../api'
import _ from 'lodash'
import {_fetchGeofencings} from '../../shared/MapComponent/api/geofence'

export const fetchDepots = createAsyncThunk(
  `${name}/fetchDepots`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchDepots({IDCustomer: _args || 0})
    if (!response.error) dispatch(setDepots(response.data))
  }
)

export const createOrUpdateDepot = createAsyncThunk(
  `${name}/createOrUpdateDepot`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedDepot} = getState()[name]
      let data = _.cloneDeep(selectedDepot)
      if (data.id == null) {
        data.id = 0
      }
      if (data.active == null) {
        data.active = 1
      }

      let depotToSave = {
        ...data,
        name: data.code,
        active: data.active == true ? 1 : 0,
      }

      const saveResult = await _saveDepot(depotToSave)
      if (saveResult.data[0]?.result == 'Added') {
        dispatch(fetchDepots())
        dispatch(setEditDepot(false))
        dispatch(setSelectedDepot(null))
        return true
      } //Updated
      else if (saveResult.data[0]?.result === 'Updated') {
        dispatch(fetchDepots())
        // dispatch(setEditDepot(false))
        return true
      } else if (
        saveResult.success &&
        saveResult.data &&
        saveResult.data[0]?.result === 'Already exist'
      ) {
        dispatch(setExistItem(true))
      }

      return false
    } catch (e) {
      return false
    }
  }
)

export const removeDepot = createAsyncThunk(`${name}/removeDepot`, async (_arg, {dispatch}) => {
  let res = await _removeDepot(_arg?.id)
  dispatch(fetchDepots())
})

export const fetchAllGeo = createAsyncThunk(
  `${name}/fetchAllGeo`,
  async (id, {getState, dispatch}) => {
    let response = await _fetchGeofencings()
    if (!response.error) dispatch(setListGeo(response.data))
  }
)

export const fetchGeoForDepot = createAsyncThunk(
  `${name}/fetchGeoForDepot`,
  async (id, {getState, dispatch}) => {
    let response = await _fetchGeoForDepot(id, 'deposit')
    if (!response.error) {
      dispatch(setGeoDepot(response.data))
    }
  }
)

export const addGeoToDepot = createAsyncThunk(
  `${name}/addGeoToDepot`,
  async (_arg, {getState, dispatch}) => {
    try {
      let {selectedDepot} = getState()[name]

      let obj = {
        src: 'deposit',
        srcId: selectedDepot.id,
        objId: _arg.id,
        obj: 'geofence',
      }
      let res = null
      res = await _relationAdd(obj)
      if (Array.isArray(res.data) && (res.data || [])[0]?.result === 'Ok') {
        dispatch(fetchGeoForDepot(selectedDepot.id))
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }
)

export const setDepots = createAction(`${name}/setDepots`)
export const setListGeo = createAction(`${name}/setListGeo`)
export const setDetailDepot = createAction(`${name}/setDetailDepot`)
export const setSelectedDepot = createAction(`${name}/setSelectedDepot`)
export const setAddressDetail = createAction(`${name}/setAddressDetail`)
export const setEditAddress = createAction(`${name}/setEditAddress`)
export const setGeoDepot = createAction(`${name}/setGeoDepot`)
export const setGeoDepotSelectedDepot = createAction(`${name}/setGeoDepotSelectedDepot`)
export const setShowMapDepot = createAction(`${name}/setShowMapDepot`)
export const setEditDepot = createAction(`${name}/setEditDepot`)
export const setExistItem = createAction(`${name}/setExistItem`)

const DepotSlice = createSlice({
  name,
  initialState: {
    depots: [],
    detail: false,
    selectedDepot: null,
    addressDetail: false,
    editAddress: false,
    listGeo: [],
    depotGeo: [],
    depotGeoSelected: [],
    showMapDepot: false,
    editDepot: false,
    alreadyExist: false,
    selectedGeoEdit: null,
  },
  reducers: {
    setSelectedGeoEdit(state, {payload}) {
      state.selectedGeoEdit = payload
    },
  },
  extraReducers: {
    [setDepots]: (state, {payload}) => {
      state.depots = payload
    },
    [setDetailDepot]: (state, {payload}) => {
      state.detail = payload
    },
    [setSelectedDepot]: (state, {payload}) => {
      state.selectedDepot = payload
    },
    [setAddressDetail]: (state, {payload}) => {
      state.addressDetail = payload
    },
    [setEditAddress]: (state, {payload}) => {
      state.editAddress = payload
    },
    [setListGeo]: (state, {payload}) => {
      state.listGeo = payload
    },
    [setGeoDepot]: (state, {payload}) => {
      state.depotGeo = payload
    },
    [setGeoDepotSelectedDepot]: (state, {payload}) => {
      state.depotGeoSelected = payload
    },
    [setShowMapDepot]: (state, {payload}) => {
      state.showMapDepot = payload
    },
    [setEditDepot]: (state, {payload}) => {
      state.editDepot = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.alreadyExist = payload
    },
  },
})

export const getDepots = (state) => state[name].depots
export const getDetailDepot = (state) => state[name].detail
export const getSelectedDepot = (state) => state[name].selectedDepot
export const getAddressDetail = (state) => state[name].addressDetail
export const getEditAddress = (state) => state[name].editAddress
export const getListGeo = (state) => state[name].listGeo
export const getGeoDepot = (state) => state[name].depotGeo
export const getGeoDepotSelectedDepot = (state) => state[name].depotGeoSelected
export const getShowMapDepot = (state) => state[name].showMapDepot
export const getEditDepot = (state) => state[name].editDepot
export const getAlreadyExist = (state) => state[name].alreadyExist
export const getSelectedGeoEdit = (state) => state[name].selectedGeoEdit

export const {setSelectedGeoEdit} = DepotSlice.actions
export default DepotSlice.reducer
