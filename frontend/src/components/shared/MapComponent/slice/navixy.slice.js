import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'

import {
  _fetchCurrentPosOfTracker,
  _fetchPointGeo,
  _fetchTrackerList,
  _getUserAuth,
  _removeUserAuth,
  _savaUserAuth,
  getGeo,
  getUser,
} from '../api/navixy'

import {saveGeoFromNavixy} from './geofencing.slice'

const name = 'navixy'

export const getUserAuth = createAsyncThunk(
  `${name}/getUserAuth`,
  async (_args, {getState, dispatch}) => {

    let response = await _getUserAuth()
    if (response.success) {
      const info = {
        login: response.data[0].usernavixy,
        password: response.data[0].passwordnavixy,
      }
      dispatch(setInfoForUser(info))
      await getUser(info).then((res) => {
        dispatch(setHash(res.data.hash))
      })
    }
  }
)

export const saveUserAuth = createAsyncThunk(
  `${name}/saveUserAuth`,
  async (_args, {getState, dispatch}) => {

    let response = await _savaUserAuth(_args)
    if (response.data[0].success === 'Ok') {
      return true
    }
  }
)

export const removeUserAuth = createAsyncThunk(
  `${name}/removeUserAuth`,
  async (_args, {dispatch}) => {
    let response = await _removeUserAuth(_args)
    if (response.data[0].success === 'Ok') {
      dispatch(setHash(null))
      return true
    }
  }
)

export const getGeofencing = createAsyncThunk(
  `${name}/getGeofencing`,
  async (_args, {getState, dispatch}) => {
    let {hash} = getState()[name]
    let response = await getGeo(hash)
    if (response.status === 200) {
      try {
        let res = JSON.stringify(response.data.list)
        dispatch(saveGeoFromNavixy(res))
        dispatch(setGeofencingData(response.data))
      } catch (err) {
      }
    }
  }
)

export const getGeofencingSelectedSite = createAsyncThunk(
  `${name}/getGeofencing`,
  async (hash, {getState, dispatch}) => {
    // let {hash} = getState()[name]
    let response = await getGeo(hash)
    if (response.status === 200) {
      try {
        let res = JSON.stringify(response.data.list)
        dispatch(saveGeoFromNavixy(res))
        dispatch(setGeofencingData(response.data))
      } catch (err) {
      }
    }
  }
)

export const fetchPointsGeo = createAsyncThunk(
  `${name}/fetchPointsGeo`,
  async (_args, {getState, dispatch}) => {
    let {hash} = getState()[name]
    let response = await _fetchPointGeo({hash: hash, geoId: _args})
    if (response.status === 200) {
      dispatch(setPointsGeo(response.data.list))
      return response.data
    }
  }
)
export const fetchTrackerList = createAsyncThunk(
  `${name}/fetchTrackerList`,
  async (hash, {getState, dispatch}) => {
    // let {hash} = getState()[name]
    let response = await _fetchTrackerList(hash)
    if (response.status === 200) {
      dispatch(setTrackerList(response.data))
    }
  }
)
export const fetchCurrentPosOfTracker = createAsyncThunk(
  `${name}/fetchTrackerList`,
  async (_args, {getState, dispatch}) => {
    // let {hash} = getState()[name]
    let response = await _fetchCurrentPosOfTracker(_args.hash, _args.trackerId)
    if (response.status === 200) {
      dispatch(setCurrentPointTracker(response.data.value))
    }
  }
)

export const setHash = createAction(`${name}/getUserAuth`)
export const setGeofencingData = createAction(`${name}/setGeofencingData`)
export const setGeofencingDataSelectedSite = createAction(`${name}/setGeofencingDataSelectedSite`)
export const setPointsGeo = createAction(`${name}/setPointsGeo`)
export const setSelectedGeo = createAction(`${name}/setSelectedGeo`)
export const setInformation = createAction(`${name}/setInformation`)
export const setTrackerList = createAction(`${name}/fetchTrackerList`)
export const setSelectedTracker = createAction(`${name}/setSelectedTracker`)
export const setCurrentPointTracker = createAction(`${name}/fetchCurrentPosOfTracker`)
export const setInfoForUser = createAction(`${name}/setInfoForUser`)

const navixySlice = createSlice({
  name,
  initialState: {
    hash: null,
    hashSelectedSite: null,
    hashSelectedDepot: null,
    geofencingData: [],
    geofencingDataSelectedSite: [],
    information: {email: '', password: ''},
    pointsGeo: [],
    trackerList: [],
    currentPointTracker: [],
    infoUser: [],
    selectedGeo: null,
    selectedTracker: null,
  },
  reducers: {
    setHashSelectedSite: (state, {payload}) => {
      state.hashSelectedSite = payload
    },
    setHashSelectedDepot: (state, {payload}) => {
      state.hashSelectedDepot = payload
    }
  },
  extraReducers: {
    [setHash]: (state, {payload}) => {
      state.hash = payload
    },
    [setGeofencingData]: (state, {payload}) => {
      state.geofencingData = payload
    },
    [setGeofencingDataSelectedSite]: (state, {payload}) => {
      state.geofencingDataSelectedSite = payload
    },
    [setPointsGeo]: (state, {payload}) => {
      state.pointsGeo = payload
    },
    [setSelectedGeo]: (state, {payload}) => {
      state.selectedGeo = payload
    },
    [setTrackerList]: (state, {payload}) => {
      state.trackerList = payload
    },
    [setSelectedTracker]: (state, {payload}) => {
      state.selectedTracker = payload
    },
    [setCurrentPointTracker]: (state, {payload}) => {
      state.currentPointTracker = payload
    },
    [setInformation]: (state, {payload}) => {
      state.information = payload
    },
    [setInfoForUser]: (state, {payload}) => {
      state.infoUser = payload
    },
  },
})

export const getHashs = (state) => state[name].hash
export const getHashSelectedSite = (state) => state[name].hashSelectedSite
export const getHashSelectedDepot = (state) => state[name].hashSelectedDepot
export const getGeoData = (state) => state[name].geofencingData
export const getGeoDataSelectedSite = (state) => state[name].geofencingDataSelectedSite
export const getPointGeo = (state) => state[name].pointsGeo
export const getSelectedGeo = (state) => state[name].selectedGeo
export const getTrackerList = (state) => state[name].trackerList
export const getSelectedTracker = (state) => state[name].selectedTracker
export const getCurrentPointTracker = (state) => state[name].currentPointTracker
export const getInfoForUser = (state) => state[name].infoUser

export const {setHashSelectedSite} = navixySlice.actions

export default navixySlice.reducer
