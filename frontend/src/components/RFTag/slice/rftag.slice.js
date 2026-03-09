import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {RFTAG as name} from '../../../store/slices/config'
import {_fetchObjectCount} from '../api'

export const fetchObjectCount = createAsyncThunk(
  `${name}/fetchObjectCount`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchObjectCount(_args.srcObject, _args.srcStatut)
    if (!response.error) dispatch(setObjectCount(response.data))
  }
)

export const setObjectCount = createAction(`${name}/setObjectCount`)
export const setTagActive = createAction(`${name}/setTagActive`)
export const setTagInactive = createAction(`${name}/setTagInactive`)
export const setTagAvailable = createAction(`${name}/setTagAvailable`)
export const setTagReserved = createAction(`${name}/setTagReserved`)
export const setTagDown = createAction(`${name}/setTagDown`)

const rfTagSlice = createSlice({
  name,
  initialState: {
    objectCount: 0,
    tagActive: [],
    tagInactive: [],
    tagAvailable: false,
    tagReserved: false,
    tagDown: false,
  },
  reducers: {},
  extraReducers: {
    [setObjectCount]: (state, {payload}) => {
      state.objectCount = payload
    },
    [setTagActive]: (state, {payload}) => {
      state.tagActive = payload
    },
    [setTagInactive]: (state, {payload}) => {
      state.tagInactive = payload
    },
    [setTagAvailable]: (state, {payload}) => {
      state.tagAvailable = payload
    },
    [setTagReserved]: (state, {payload}) => {
      state.tagReserved = payload
    },
    [setTagDown]: (state, {payload}) => {
      state.tagDown = payload
    },
  },
})

export const getObjectCount = (state) => state[name].objectCount
export const getTagActive = (state) => state[name].tagActive
export const getTagInactive = (state) => state[name].tagInactive
export const getTagAvailable = (state) => state[name].tagAvailable
export const getTagReserved = (state) => state[name].tagReserved
export const getTagDown = (state) => state[name].tagDown

export default rfTagSlice.reducer
