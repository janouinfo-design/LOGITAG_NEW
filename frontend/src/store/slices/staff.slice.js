import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {STAFF as sliceName} from './config'
import {_fetchStaffs} from '../../api/index'
import _ from 'lodash'

export const fetchStaffs = createAsyncThunk(
  `${sliceName}/fetchStaffs`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchStaffs()

    if (!response.error) dispatch(setStaffs(response.result))
  }
)

const staffSlice = createSlice({
  name: sliceName,
  initialState: {
    staffs: [],
  },
  reducers: {
    setStaffs: (state, {payload}) => {
      state.staffs = payload
    },
  },
  extraReducers: {},
})

//selectors
export const selectStaffs = (state) => state[sliceName].staffs

export default staffSlice.reducer
export const {setStaffs} = staffSlice.actions
