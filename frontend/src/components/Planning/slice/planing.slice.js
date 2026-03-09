import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {PLANNING as name} from '../../../store/slices/config'
import _ from 'lodash'
import {_fetchEngineEvents} from '../api/api'
import {_fetchSites} from '../../Site/api/api'

export const fetchEngineEvents = createAsyncThunk(
  `${name}/fetchEngineEvents`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchEngineEvents(_args)
    if (!response.error) {
      dispatch(setEngineEvents(response.data))
      return true
    }
  }
)

export const fetchSiteCalendar = createAsyncThunk(
  `${name}/fetchSiteCalendar`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchSites({IDCustomer: 0})
      if (!response.error) {
        const resourcesSite = response.data.map((site) => {
          return {
            id: site.id,
            title: site.name,
            color: site.color,
          }
        })
        dispatch(setSitesCalendar(resourcesSite))
        return resourcesSite
      }
      return false
    } catch (e) {
    }
  }
)

export const fetchEngineEventsWorksite = createAsyncThunk(
  `${name}/fetchEngineEventsWorksite`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchEngineEvents(_args)
    if (!response.error) dispatch(setEngineEventsWorksite(response.data))
  }
)

//Actions
export const setEngineEvents = createAction(`${name}/fetchEngineEvents`)
export const setEngineEventsWorksite = createAction(`${name}/fetchEngineEventsWorksite`)

const planningSlice = createSlice({
  name,
  initialState: {
    engineEvents: [],
    engineEventsWorksite: [],
    messages: [],
    userID: null,
    sitesCalendar: [],
  },
  reducers: {
    setSitesCalendar: (state, {payload}) => {
      state.sitesCalendar = payload
    },
    setMessages: (state, {payload}) => {
      state.messages = payload
    },
    setMessage: (state, {payload}) => {
      state.messages.push(payload)
    },
    setUserID: (state, {payload}) => {
      state.userID = payload
    }
  },
  extraReducers: {
    [setEngineEvents]: (state, {payload}) => {
      state.engineEvents = payload
    },
    [setEngineEventsWorksite]: (state, {payload}) => {
      state.engineEventsWorksite = payload
    },
    
  },
})

//selectors
export const getEngineEvents = (state) => state[name].engineEvents
export const getEngineEventsWorksite = (state) => state[name].engineEventsWorksite
export const getMessages = (state) => state[name].messages
export const getUserID = (state) => state[name].userID
export const getSitesCalendar = (state) => state[name].sitesCalendar

export const {setMessages, setMessage, setUserID, setSitesCalendar} = planningSlice.actions
export default planningSlice.reducer
