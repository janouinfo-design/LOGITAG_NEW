import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {LOGS as name} from '../../../store/slices/config'
import {
  _fetchEnginByTag,
  _fetchEnginesList,
  _fetchGeoById,
  _fetchLogList,
  _fetchStaffList,
} from '../api'
import _ from 'lodash'
import {setToastParams} from '../../../store/slices/ui.slice'
import moment from 'moment'
import {_fetchEngines} from '../../Engin/api/api'

export const fetchLogList = createAsyncThunk(
  `${name}/fetchLogList`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchLogList(_args)

      if (!response.error) {
        return response.response
      }
    } catch (error) {
    }

    return []
  }
)

export const fetchEnginList = createAsyncThunk(
  `${name}/fetchEnginList`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchEnginesList(_args)
      if (!response.error) {
        dispatch(setEnginList(response.data))
      }
    } catch (error) {
    }

    return []
  }
)

export const fetchStaffList = createAsyncThunk(
  `${name}/fetchStaffList`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchStaffList()
      if (!response.error) {
        dispatch(setStaffList(response.data))
        return true
      }
    } catch (error) {
      return false
    }
  }
)

export const fetchGeoLogById = createAsyncThunk(
  `${name}/fetchGeoLogById`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchGeoById(_args)
      if (!response.error) {
        dispatch(setGeoLogById(response.data))
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }
)

export const fetchEnginByTag = createAsyncThunk(
  `${name}/fetchEnginByTag`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchEnginByTag({tags: _args})
      if (!response.error && Array.isArray(response.data)) {
        let data = _.uniqBy(response.data, 'reference')
        dispatch(setEnginTagLogs(data))
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }
)

const logSlice = createSlice({
  name,
  initialState: {
    logs: [],
    listDetail: [],
    logList: [],
    enginTagLog: [],
    listTagLogs: [],
    staffList: [],
    geoLogById: null,
    showDetail: false,
    enginList: [],
    isFiltred: false,
  },
  reducers: {
    setLogs: (state, {payload}) => {
      let logs = [...state.logs]
      logs.unshift(payload)
      state.logs = logs
    },
    setShowDetail: (state, {payload}) => {
      state.showDetail = payload
    },
    setEnginList(state, {payload}) {
      state.enginList = payload
    },
    setListTagLogs: (state, {payload}) => {
      state.listTagLogs = payload
    },
    setIsFiltred: (state, {payload}) => {
      state.isFiltred = payload
    },
    setNewLogs(state, action) {
      const {payload} = action

      if (!state || !payload) return

      if (state.isFiltred && payload.flespi) return

      if (!Array.isArray(payload.data)) return

      const formattedData = payload.data.map((o) => ({
        ...o,
        dateFormated: o.dateFormated,
      }))

      state.logList = [...formattedData, ...state.logList]
    },
    setGeoLogById: (state, {payload}) => {
      state.geoLogById = payload
    },
    setLogList: (state, {payload}) => {
      state.logList = payload
    },
    setStaffList: (state, {payload}) => {
      state.staffList = payload
    },
    setListDetail: (state, {payload}) => {
      state.listDetail = payload
    },
    setEnginTagLogs: (state, {payload}) => {
      state.enginTagLog = payload
    },
  },
})

export const getLogsTrack = (state) => state[name].logs
export const getShowDetail = (state) => state[name].showDetail
export const getListDetail = (state) => state[name].listDetail
export const getLogList = (state) => state[name].logList
export const getEnginTagLogs = (state) => state[name].enginTagLog
export const getStaffList = (state) => state[name].staffList
export const getListTagLogs = (state) => state[name].listTagLogs
export const getGeoLogById = (state) => state[name].geoLogById
export const getEnginList = (state) => state[name].enginList
export const getIsFiltred = (state) => state[name].isFiltred

export const {
  setIsFiltred,
  setLogs,
  setShowDetail,
  setGeoLogById,
  setListDetail,
  setLogList,
  setEnginTagLogs,
  setStaffList,
  setListTagLogs,
  setNewLogs,
  setEnginList,
} = logSlice.actions
export default logSlice.reducer
