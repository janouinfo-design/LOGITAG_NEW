import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {DASHBOARD as name} from '../../../store/slices/config'
import _ from 'lodash'
import {_fetchDashboard, _fetchDashboardDetail, _fetchEnginCountByLocation, _fetchStatisticDash} from '../api/index'
import {fetchAllDashboards} from '../../DashboardNew/service/dashboardService'

export const fetchDashboard = createAsyncThunk(
  `${name}/fetchDashboard`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchDashboard()
    if (!response.error) dispatch(setDashboard(response.data))
  }
)

export const fetchDashboardDetail = createAsyncThunk(
  `${name}/fetchDashboardDetail`,
  async (code, {getState, dispatch}) => {
    let response = await _fetchDashboardDetail(code)
    if (!response.error) {
      dispatch(setDashboardDetail(response.data))
      return true
    }
    return false
  }
)

export const fetchGrafanaDashboards = createAsyncThunk(
  `${name}/fetchGrafanaDashboards`,
  async (filter, {getState, dispatch}) => {
    try {
      let response = await fetchAllDashboards(filter)
      console.log(response, 'response fetchGrafanaDashboards')
      if (!response.error) {
        dispatch(setGrafanaDashboards(response?.response || []))
        return true
      }
      return false
    } catch (e) {
      console.warn('error fetchGrafanaDashboards:', e.message)
      return false
    }
  }
)

export const fetchStatisticDash = createAsyncThunk(
  `${name}/fetchStatisticDash`,
  async (filter, {getState, dispatch}) => {
    try {
      let response = await _fetchStatisticDash(filter)
      console.log(response, 'response fetchStatisticDash')
      if (!response.error) {
        dispatch(setStatisticDash(response?.data || []))
        return {success: true, response: "Succès"}
      }
      return {success: false, response: "Erreur inconnu"}
    } catch (e) {
      console.warn('error fetchStatisticDash:', e.message)
      return {success: false, response: e.message}
    }
  }
)

export const fetchEnginCountByLocation = createAsyncThunk(
  `${name}/fetchEnginCountByLocation`,
  async (filter, {getState, dispatch}) => {
    try {
      let response = await _fetchEnginCountByLocation(filter)
      console.log(response, 'response fetchEnginCountByLocation')
      if (!response.error) {
        dispatch(setEnginCountByLocation(response?.response || []))
        return true
      }
      return false
    } catch (e) {
      console.warn('error fetchEnginCountByLocation:', e.message)
      return false
    }
  }
)

//Actions
export const setDashboard = createAction(`${name}/fetchDashboard`)
export const setEditDashboard = createAction(`${name}/setEditDashboard`)
export const setSelectedDashboard = createAction(`${name}/setSelectedDashboard`)
export const setDashboardDetail = createAction(`${name}/fetchDashboardDetail`)
export const setSelectedDashboardDetail = createAction(`${name}/setSelectedDashboardDetail`)

const dashboardslice = createSlice({
  name,
  initialState: {
    dashboard: [],
    statisticDash: [],
    grafanaDashboards: [],
    editDashboard: false,
    selectedDashboard: null,
    dashboardDetail: [],
    selectedDashboardDetail: null,
    cardSelected: null,
    loadingCard: false,
    selectedMode: 'card',
    engin_count_by_location: []
  },
  reducers: {
    setStatisticDash: (state, {payload}) => {
      state.statisticDash = payload
    },
    setGrafanaDashboards: (state, {payload}) => {
      state.grafanaDashboards = payload
    },
    setCardSelected: (state, {payload}) => {
      state.cardSelected = payload
    },
    setLoadingCard: (state, {payload}) => {
      state.loadingCard = payload
    },
    setSelectedMode: (state, {payload}) => {
      state.selectedMode = payload
    },
    setEnginCountByLocation(state , { payload }){
      state.engin_count_by_location = payload
    }
  },
  extraReducers: {
    [setDashboard]: (state, {payload}) => {
      state.dashboard = payload
    },
    [setEditDashboard]: (state, {payload}) => {
      state.editDashboard = payload
    },
    [setSelectedDashboard]: (state, {payload}) => {
      state.selectedDashboard = payload
    },
    [setDashboardDetail]: (state, {payload}) => {
      state.dashboardDetail = payload
    },
    [setSelectedDashboardDetail]: (state, {payload}) => {
      state.selectedDashboardDetail = payload
    },
  },
})

//selectors
export const getDashboard = (state) => state[name].dashboard
export const getEditDashboard = (state) => state[name].editDashboard
export const getSelectedDashboard = (state) => state[name].selectedDashboard
export const getDashboardDetail = (state) => state[name].dashboardDetail
export const getSelectedDashboardDetail = (state) => state[name].selectedDashboardDetail
export const getCardSelected = (state) => state[name].cardSelected
export const getLoadingCard = (state) => state[name].loadingCard
export const getSelectedMode = (state) => state[name].selectedMode
export const getGrafanaDashboards = (state) => state[name].grafanaDashboards
export const getStatisticDash = (state) => state[name].statisticDash
export const getEnginCountByLocation = (state) => state[name].engin_count_by_location

export const {
  setCardSelected,
  setLoadingCard,
  setSelectedMode,
  setGrafanaDashboards,
  setStatisticDash,
  setEnginCountByLocation
} = dashboardslice.actions
export default dashboardslice.reducer
