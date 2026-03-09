import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {GEOFENCING as name} from './config'
import {
  _fetchGeoPointsLocal,
  _fetchGeofencings,
  _fetchListNavixyLink,
  _removeGeoFromSite,
  _removeGeofencing,
  _saveGeoFromNavixy,
  _saveGeofencing,
  _saveGeofencingDepot,
} from '../../api/index'

export const fetchGeofencings = createAsyncThunk(
  `${name}/fetchGeofencings`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchGeofencings()
    if (!response.error) {
      dispatch(setGeofences(response.result))
    }
    return response
  }
)

export const fetchListNavixyLink = createAsyncThunk(
  `${name}/fetchListNavixyLink`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchListNavixyLink()
    if (!response.error) {
      dispatch(setListGeoNavixyLink(response.result))
    }
    return response
  }
)

export const saveGeofencing = createAsyncThunk(
  `${name}/saveGeofencing`,
  async (_args, {getState, dispatch}) => {
    let response = await _saveGeofencing(_args)
    if (response.result === 'OK') {
      dispatch(fetchGeofencings())
      return true
    }

    return response
  }
)

export const saveGeofencingDepot = createAsyncThunk(
  `${name}/saveGeofencingDepot`,
  async (_args, {getState, dispatch}) => {
    let response = await _saveGeofencingDepot(_args)
    if (response.result === 'OK') {
      dispatch(fetchGeofencings())
      return true
    }
  }
)

export const fetchPointGeoLocal = createAsyncThunk(
  `${name}/fetchPointGeoLocal`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchGeoPointsLocal(_args)
    if (!response.error) dispatch(setGeoPointLocal(response.geometry))
  }
)
export const saveGeoFromNavixy = createAsyncThunk(
  `${name}/saveGeoFromNavixy`,
  async (_args, {getState, dispatch}) => {
    let response = await _saveGeoFromNavixy(_args)
  }
)

export const removeGeofencing = createAsyncThunk(
  `${name}/saveGeofencing`,
  async (_args, {getState, dispatch}) => {
    let response = await _removeGeofencing(_args)
    if (!response.error) dispatch(fetchGeofencings())
  }
)
export const removeGeoSite = createAsyncThunk(
  `${name}/removeGeoSite`,
  async (_arg, {getState, dispatch}) => {
    let objId = _arg.RelationID
    let res = await _removeGeoFromSite(objId)


    dispatch(fetchGeofencings())
  }
)

export const setGeofences = createAction(`${name}/setGeofences`)
export const setGeofencesSelectedSite = createAction(`${name}/setGeofences`)
export const setGeoPointLocal = createAction(`${name}/setGeoPointLocal`)
export const setSelectedGeofenceIds = createAction(`${name}/setSelectedGeofenceIds`)
export const setSelectedGeofencesIdsSelectedSite = createAction(
  `${name}/setSelectedGeofencesIdsSelectedSite`
)
export const setSelectedGeofenceId = createAction(`${name}/setSelectedGeofenceId`)
export const setSelectedGeofenceIdSelectedSite = createAction(
  `${name}/setSelectedGeofenceIdSelectedSite`
)
export const setEditionInfos = createAction(`${name}/setEditionInfos`)
export const setListGeoNavixyLink = createAction(`${name}/setListGeoNavixyLink`)

export const getGeofences = (state) => state[name].geofences
export const getGeofencesSelectedSite = (state) => state[name].geofencesSelectedSite

export const getSelectedGeofenceIdsSelectedSite = (state) =>
  state[name].selectedGeofenceIdsSelectedSite
export const getSelectedGeofenceIds = (state) => state[name].selectedGeofenceIds

export const getGeoPointLocal = (state) => state[name].geoPointLocal
export const getListGeoNavixyLink = (state) => state[name].geoPointLocal
export const getSelectedGeofenceId = (state) => state[name].selectedGeofenceId
export const getSelectedGeofenceIdSelectedSite = (state) =>
  state[name].selectedGeofenceIdSelectedSite
export const getEditionInfos = (state) => {
  return state[name].editionInfos
}

const geofencingSlice = createSlice({
  name,
  initialState: {
    geofences: [],
    geofencesSelectedSite: [],
    selectedGeofenceIds: [],
    selectedGeofenceIdsSelectedSite: [],
    geoPointLocal: [],
    listGeoNavixyLink: [],
    selectedGeofenceId: null,
    selectedGeofenceIdSelectedSite: null,
    editionInfos: {},
  },
  reducers: {},
  extraReducers: {
    [setGeofences]: (state, {payload}) => {
      state.geofences = payload
    },
    [setGeofencesSelectedSite]: (state, {payload}) => {
      state.geofencesSelectedSite = payload
    },
    [setSelectedGeofenceIds]: (state, {payload}) => {
      state.selectedGeofenceIds = payload
    },
    [setSelectedGeofenceId]: (state, {payload}) => {
      state.selectedGeofenceId = payload
    },
    [setSelectedGeofencesIdsSelectedSite]: (state, {payload}) => {
      state.selectedGeofenceIdsSelectedSite = payload
    },
    [setEditionInfos]: (state, {payload}) => {
      state.editionInfos = payload
    },
    [setGeoPointLocal]: (state, {payload}) => {
      state.geoPointLocal = payload
    },
  },
})

export default geofencingSlice.reducer
