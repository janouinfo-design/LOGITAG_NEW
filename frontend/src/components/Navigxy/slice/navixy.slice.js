import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {NAVIXY as name} from '../../../store/slices/config'
import _ from 'lodash'
import {
  _fetchCurrentPosOfTracker,
  _fetchPointGeo,
  _fetchTrackerList,
  _getUserAuth,
  _removeUserAuth,
  _savaUserAuth,
  getGeo,
  getUser,
} from '../api'
import {saveGeoFromNavixy} from '../../../store/slices/geofencing.slice'

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
  async (obj, {dispatch}) => {
    let response = await _fetchPointGeo(obj.hash, obj.geoId)
    if (response.status === 200) {
      return response.data.list
      // dispatch(setPointsGeo(response.data.list))
    }
  }
)
export const fetchTrackerList = createAsyncThunk(
  `${name}/fetchTrackerList`,
  async (hash, {getState, dispatch}) => {
    // let {hash} = getState()[name]
    let response = await _fetchTrackerList(hash)
    if (response.success && Array.isArray(response?.data)) {
      dispatch(setTrackerList(response?.data))
    }else{
      dispatch(setTrackerList([]))
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
    geofencingData: [],
    information: {email: '', password: ''},
    pointsGeo: [],
    trackerList: [],
    currentPointTracker: [],
    infoUser: [],
    selectedGeo: null,
    selectedTracker: null,
  },
  reducers: {
    updateTrackersState(state , { payload}){
        if(_.isPlainObject(payload) && Array.isArray(state.trackerList)){
          let list = _.cloneDeep(state.trackerList);
          list = list.map( o => {
            let state = payload[o.id];
            if(state){
                return { 
                    ...o,
                    state
                }
            }
            return o
          })
          state.trackerList = list
        }
    }
  },
  extraReducers: {
    [setHash]: (state, {payload}) => {
      state.hash = payload
    },
    [setGeofencingData]: (state, {payload}) => {
      state.geofencingData = payload
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
export const getGeoData = (state) => state[name].geofencingData
export const getPointGeo = (state) => state[name].pointsGeo
export const getSelectedGeo = (state) => state[name].selectedGeo
export const getTrackerList = (state) => state[name].trackerList
export const getSelectedTracker = (state) => state[name].selectedTracker
export const getCurrentPointTracker = (state) => state[name].currentPointTracker
export const getInfoForUser = (state) => state[name].infoUser

export const {
  updateTrackersState
} = navixySlice.actions
export default navixySlice.reducer
