import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {_fetchHistoricalTag, _fetchVehicles} from '../api/api'
import randomcolor from 'randomcolor'
import {_fetchTagsFree} from '../../Tag/api/api'

const name = 'vehicle'

export const fetchVehicles = createAsyncThunk(
  `${name}/fetchVehicles`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTagsFree(1)


    if (!response.error) dispatch(setVehicles(response.data))
  }
)
export const fetchHistoricalTag = createAsyncThunk(
  `${name}/fetchHistoricalTag`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchHistoricalTag(_args)


    if (!response.error) {
      dispatch(setHistoryTag(response.data))
    }
    return response.data
  }
)

//actions
export const setHistoryTag = createAction(`${name}/setHistoryTag`)

const vehicleslice = createSlice({
  name,
  initialState: {
    vehicles: [],
    historyTag: [],
    selectedVehicle: null,
    selectedVehicleId: null,
    isLoading: false,
    newTags: [],
  },
  reducers: {
    setVehicles: (state, {payload}) => {
      state.vehicles = payload
    },
    setIsLoading: (state, {payload}) => {
      state.isLoading = payload
    },
    setSelectedVehicle: (state, {payload}) => {
      state.selectedVehicle = payload
    },
    setSelectedVehicleId: (state, {payload}) => {
      state.selectedVehicleId = payload
    },
    setNewTags: (state, {payload}) => {
      state.newTags = payload
    },
  },
  extraReducers: {
    [setHistoryTag]: (state, {payload}) => {
      state.historyTag = payload
    },
  },
})

export const {setVehicles, setSelectedVehicle, setSelectedVehicleId, setNewTags, setIsLoading} =
  vehicleslice.actions

export const getVehicles = (state) => state[name].vehicles
export const getSelectedVehicle = (state) => state[name].selectedVehicle
// state[name].newTags?.find(({id}) => id == state[name].selectedVehicleId)
export const getSelectedVehicleId = (state) => state[name].selectedVehicleId
export const getSelectedVehicleInfos = (state) => state[name].selectedVehicle
export const getNewTags = (state) => state[name].newTags
export const getHistoryTag = (state) => state[name].historyTag
export const getIsLoading = (state) => state[name].isLoading

export default vehicleslice.reducer

// Array.from({length: 10}, (i, c) => {
//   return {
//     id: c + 1,
//     label: `VH. ${c + 1}`,
//     percent: (0.6 * 100) / (c + 1),
//     matricule: `MAT. 10${c + 1}`,
//     color: randomcolor(),
//     lat: 48.86782856257236 + c / 5,
//     lng: 2.281636053534477 + c / 5,
//   }
// }),
