import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'

import {
  _fetchGeoPointsLocal,
  _fetchGeofencings,
  _fetchListNavixyLink,
  _removeGeoFromSite,
  _removeGeofencing,
  _saveGeoFromNavixy,
  _saveGeofencing,
} from '../api/geofence'
import {fetchGeoForSite} from '../../../Site/slice/site.slice'
import {_getEngById} from '../../../Engin/api/api'

const name = 'Geofence'
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

export const fetchGeofencingsSelectedSite = createAsyncThunk(
  `${name}/fetchGeofencingsSelectedSite`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchGeofencings()
    if (!response.error) {
      dispatch(setGeofencesSelectedSite(response.result))
    }
    return response
  }
)

export const fetchGeofencingsSelectedDepot = createAsyncThunk(
  `${name}/fetchGeofencingsSelectedDepot`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchGeofencings()
    if (!response.error) {
      dispatch(setGeofencesSelectedDepot(response.result))
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
    const {selectedSite} = getState()['site']
    let response = await _saveGeofencing(_args)
    if (!response.error) {
      dispatch(fetchGeoForSite(selectedSite?.id))
    }
  }
)

export const getEnginSelected = createAsyncThunk(
  `${name}/getEnginSelected`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _getEngById(_args)
      if (!response.error) {
        dispatch(setSelectedEngMap(response.data))
      }
    } catch (e) {
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
    if (response.status === 200) dispatch(fetchGeofencings())
  }
)

export const removeGeofencing = createAsyncThunk(
  `${name}/saveGeofencing`,
  async (_args, {getState, dispatch}) => {
    let {selectedSite} = getState()['site']
    let response = await _removeGeofencing(selectedSite.id)
    if (!response.error) {
      dispatch(fetchGeoForSite(_args))
    }
  }
)
export const removeGeoSite = createAsyncThunk(
  `${name}/removeGeoSite`,
  async (_arg, {getState, dispatch}) => {
    let {selectedSite} = getState()['site']
    let objId = _arg.RelationID
    let res = await _removeGeoFromSite(objId)
    if (!res.error) {
      dispatch(fetchGeoForSite(selectedSite?.id))
    }
  }
)

export const removeGeoDepot = createAsyncThunk(
  `${name}/removeGeoDepot`,
  async (_arg, {getState, dispatch}) => {
    let objId = _arg.RelationID
    let res = await _removeGeoFromSite(objId)


    dispatch(fetchGeofencings())
  }
)

export const setGeofences = createAction(`${name}/setGeofences`)
export const setGeofencesSelectedSite = createAction(`${name}/setGeofencesSelectedSite`)
export const setGeofencesSelectedDepot = createAction(`${name}/setGeofencesSelectedDepot`)
export const setGeoPointLocal = createAction(`${name}/setGeoPointLocal`)
export const setSelectedGeofences = createAction(`${name}/setSelectedGeofences`)
export const setSelectedGeofenceIds = createAction(`${name}/setSelectedGeofenceIds`)
export const setSelectedGeofenceId = createAction(`${name}/setSelectedGeofenceId`)
export const setSelectedGeofenceIdSelectedSite = createAction(
  `${name}/setSelectedGeofenceIdSelectedSite`
)
export const setSelectedGeoClientSelectedSite = createAction(
  `${name}/setSelectedGeoClientSelectedSite`
)
export const setEditionInfos = createAction(`${name}/setEditionInfos`)
export const setListGeoNavixyLink = createAction(`${name}/setListGeoNavixyLink`)

export const getEditionInfos = (state) => {
  return state[name].editionInfos
}

const geofencingSlice = createSlice({
  name,
  initialState: {
    geofences: [],
    geofencesSelectedSite: [],
    geofencesSelectedDepot: [],
    selectedGeofences: [],
    selectedGeofenceIds: [],
    selectedGeofenceIdsSelectedSite: [],
    selectedGeofenceIdsSelectedDepot: [],
    geoPointLocal: [],
    listGeoNavixyLink: [],
    selectedEngMap: null,
    selectedGeofenceId: null,
    selectedGeofenceIdSelectedSite: null,
    editionInfos: {},
    selectedGeoClient: null,
    selectedGeoClientSelectedSite: null,
  },
  reducers: {
    setSelectedEngMap: (state, {payload}) => {
      state.selectedEngMap = payload
    },
    setSelectedGeoClient: (state, {payload}) => {
      state.selectedGeoClient = payload
    },
    // setSelectedGeoClientSelectedSite: (state, {payload}) => {
    //   state.selectedGeoClientSelectedSite = payload
    // },
    // setSelectedGeofenceIdSelectedSite: (state, {payload}) => {
    //   state.selectedGeofenceIdSelectedSite = payload
    // },
    setSelectedGeofenceIdsSelectedSite: (state, {payload}) => {
      state.selectedGeofenceIdsSelectedSite = payload
    },
    setSelectedGeofenceIdsSelectedDepot: (state, {payload}) => {
      state.selectedGeofenceIdsSelectedDepot = payload
    },
  },
  extraReducers: {
    [setGeofences]: (state, {payload}) => {
      state.geofences = payload
    },
    [setSelectedGeofences]: (state, {payload}) => {
      state.selectedGeofences = payload
    },
    [setGeofencesSelectedSite]: (state, {payload}) => {
      state.geofencesSelectedSite = payload
    },
    [setGeofencesSelectedDepot]: (state, {payload}) => {
      state.geofencesSelectedDepot = payload
    },
    [setSelectedGeofenceIds]: (state, {payload}) => {
      state.selectedGeofenceIds = payload
    },
    [setSelectedGeofenceId]: (state, {payload}) => {
      state.selectedGeofenceId = payload
    },
    [setSelectedGeofenceIdSelectedSite]: (state, {payload}) => {
      state.selectedGeofenceIdSelectedSite = payload
    },
    [setSelectedGeoClientSelectedSite]: (state, {payload}) => {
      state.selectedGeoClientSelectedSite = payload
    },
    [setEditionInfos]: (state, {payload}) => {
      state.editionInfos = payload
    },
    [setGeoPointLocal]: (state, {payload}) => {
      state.geoPointLocal = payload
    },
  },
})

export const getGeofences = (state) => state[name].geofences
export const getGeofencesSelectedSite = (state) => state[name].geofencesSelectedSite
export const getGeofencesSelectedDepot = (state) => state[name].geofencesSelectedDepot
export const getSelectedGeofences = (state) => state[name].selectedGeofences
export const getSelectedGeofenceIds = (state) => state[name].selectedGeofenceIds
export const getSelectedGeofenceIdsSelectedSite = (state) =>
  state[name].selectedGeofenceIdsSelectedSite
export const getSelectedGeofenceIdsSelectedDepot = (state) =>
  state[name].selectedGeofenceIdsSelectedDepot
export const getGeoPointLocal = (state) => state[name].geoPointLocal
export const getListGeoNavixyLink = (state) => state[name].geoPointLocal
export const getSelectedGeofenceId = (state) => state[name].selectedGeofenceId
export const getSelectedGeofenceIdSelectedSite = (state) =>
  state[name].selectedGeofenceIdSelectedSite
export const getSelectedGeoClient = (state) => state[name].selectedGeoClient
export const getSelectedEngMap = (state) => state[name].selectedEngMap

export const {
  setSelectedGeoClient,
  //setSelectedGeofenceIdSelectedSite,
  setSelectedGeofenceIdsSelectedSite,
  setSelectedGeofenceIdsSelectedDepot,
  setSelectedEngMap,
  //setSelectedGeoClientSelectedSite,
} = geofencingSlice.actions
export default geofencingSlice.reducer
