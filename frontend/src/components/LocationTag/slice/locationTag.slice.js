import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {LOCATIONTAG as name} from '../../../store/slices/config'
import {_fetchStatByCode, _fetchStatDash} from '../api'

export const fetchStatDash = createAsyncThunk(
  `${name}/fetchStatDash`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchStatDash(_args)
    if (!response.error) {
      dispatch(setStatDash(response.data))
    }
  }
)

export const fetchStatDetail = createAsyncThunk(
  `${name}/fetchStatDetail`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchStatByCode(_args)
    if (!response.error) {
      dispatch(setStatDetail(response.data))
    }
  }
)

export const setEnginsInside = createAction(`${name}/setEnginsInside`)
export const setEnginsOutSide = createAction(`${name}/setEnginsOutSide`)
export const setTagInside = createAction(`${name}/setTagInside`)
export const setTagOutSide = createAction(`${name}/setTagOutSide`)

const locationTagSlice = createSlice({
  name,
  initialState: {
    statDash: [],
    statDetail: [],
    enginsInside: [],
    enginsOutSide: [],
    tagInside: [],
    tagOutSide: [],
  },
  reducers: {
    setStatDash: (state, {payload}) => {
      state.statDash = payload
    },
    setStatDetail: (state, {payload}) => {
      state.statDetail = payload
    },
  },
  extraReducers: {
    [setEnginsInside]: (state, {payload}) => {
      state.enginsInside = payload
    },
    [setEnginsOutSide]: (state, {payload}) => {
      state.enginsOutSide = payload
    },
    [setTagInside]: (state, {payload}) => {
      state.tagInside = payload
    },
    [setTagOutSide]: (state, {payload}) => {
      state.tagOutSide = payload
    },
  },
})

export const getEnginsInside = (state) => state[name].enginsInside
export const getEnginsOutSide = (state) => state[name].enginsOutSide
export const getTagInside = (state) => state[name].tagInside
export const getTagOutSide = (state) => state[name].tagOutSide
export const getStatDash = (state) => state[name].statDash
export const getStatDetail = (state) => state[name].statDetail

export const {setStatDash, setStatDetail} = locationTagSlice.actions

export default locationTagSlice.reducer
