import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {RFENGINE as name} from '../../../store/slices/config'

export const setEngineTagged = createAction(`${name}/setEngineTagged`)
export const setEngineUntagged = createAction(`${name}/setEngineUntagged`)

const rfEngineSlice = createSlice({
  name,
  initialState: {
    engineTagged: [],
    engineUntagged: [],
  },
  reducers: {},
  extraReducers: {
    [setEngineTagged]: (state, {payload}) => {
      state.engineTagged = payload
    },
    [setEngineUntagged]: (state, {payload}) => {
      state.engineUntagged = payload
    },
  },
})

export const getEngineTagged = (state) => state[name].engineTagged
export const getEngineUntagged = (state) => state[name].engineUntagged

export default rfEngineSlice.reducer
