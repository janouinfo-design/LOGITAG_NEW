import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {CONFIRM_DIALOG as name} from './config'
import _ from 'lodash'

export const handleConfirm = createAsyncThunk(
  `${name}/handleConfirm`,
  async (_args, {getState, dispatch}) => {
  }
)

export const setConfirm = createAction(`${name}/handleConfirm`)

const confirmdialogslice = createSlice({
  name,
  initialState: {
    selectedConfirm: null,
  },

  reducers: {
    [setConfirm]: (state, {payload}) => {
      state.selectedConfirm = payload
    },
  },
})

export const getSelectedConfirm = (state) => state[name].selectedConfirm

export default confirmdialogslice.reducer
