import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {DEPOSIT as sliceName} from './config'
import {_fetchDeposits} from '../../api/index'
import _ from 'lodash'

export const fetchDeposits = createAsyncThunk(
  `${sliceName}/fetchDeposits`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchDeposits()

    if (!response.error) dispatch(setDeposits(response.result))
  }
)

//actions
export const setDeposits = createAction(`${sliceName}/fetchDeposits`)
export const toggleActive = createAction(`${sliceName}/toggleActive`)

const depositSlice = createSlice({
  name: sliceName,
  initialState: {
    deposits: [],
  },
  reducers: {},
  extraReducers: {
    [setDeposits]: (state, {payload}) => {
      state.deposits = payload
    },
    [toggleActive]: (state, {payload}) => {
      const {id} = payload || {}
      const foundDeposit = state.deposits.find((d) => {
        return d.id === id
      })
      // foundDeposit.active = foundDeposit.active === 1 ? true : false
      // state.deposits = [...state.deposits, foundDeposit]
    },
  },
})

//selectors
export const selectDeposits = (state) => state[sliceName].deposits

export default depositSlice.reducer
