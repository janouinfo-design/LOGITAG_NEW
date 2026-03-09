import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

import {
  _fetchAlerts,
  _saveAlert,
} from '../api'

let name = 'alerts'
export const fetchAlerts= createAsyncThunk(
  `${name}/fetchAlerts`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchAlerts(_args)
      dispatch(setAlerts(response?.result))
    } catch (error) {
      console.log("error:",error)
      console.error(error)
    }

    return []
  }
)

export const saveAlert= createAsyncThunk(
  `${name}/saveAlert`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _saveAlert(_args)
      return response
    } catch (e) {
      console.log("error:",e)
      console.error(e)
      return {success: false , response: e.message || 'Erreur' }
    }

  }
)

const alertSlice = createSlice({
  name,
  initialState: {
    alerts:[],
    edit: false,
    selected: null
  },
  reducers: {
    setAlerts: (state, {payload}) => {
      state.alerts = payload
    },
    setSelectedAlert: (state, {payload}) => {
      state.selected = payload
    },
    setEditAlert: (state, {payload}) => {
      state.edit = payload
    }
  },
})

export const getAlerts = (state) => state[name].alerts
export const getSelectedAlert = (state) => state[name].selected
export const getEditAlert = (state) => state[name].edit

export const {
  setAlerts,
  setSelectedAlert,
  setEditAlert
} = alertSlice.actions
export default alertSlice.reducer
