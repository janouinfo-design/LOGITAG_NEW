import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {DEPOSIT as name} from './config'
import {_fetchDeposits, _saveDeposit, _removeDeposit} from '../../api/index'
import _ from 'lodash'
export const fetchDeposits = createAsyncThunk(
  `${name}/fetchDeposits`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchDeposits()

    if (!response.error) dispatch(setDeposits(response.result))

  }
)

export const createOrUpdateDeposit = createAsyncThunk(
  `${name}/createOrUpdateDeposit`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedDeposit} = getState()[name]

      let data = _.cloneDeep(selectedDeposit)

      data.active = data.active ? 1 : 0
      data.id = data.id || 0
      data.name = data.name || data.label || ''

      let res = null


      res = await _saveDeposit(data)

      if (Array.isArray(res.result) && (res.result || [])[0]?.result == 'Ok') {
        dispatch(fetchDeposits())
        return true
      }

      return false
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)

export const removeDeposit = createAsyncThunk(`${name}/removeDeposit`, async (_arg, {dispatch}) => {
  let res = await _removeDeposit(_arg?.id)


  dispatch(fetchDeposits())
})

export const setDeposits = createAction(`${name}/fetchDeposits`)
export const setSelectedDeposit = createAction(`${name}/setSelectedDeposit`)
export const setEditDeposit = createAction(`${name}/setEditDeposit`)

export const getDeposits = (state) => state[name].deposits
export const getSelectedDeposit = (state) => state[name].selectedDeposit
export const getEditDeposit = (state) => state[name].editDeposit

const depositslice = createSlice({
  name,
  initialState: {
    deposits: [],
    selectedDeposit: null,
    editDeposit: false,
  },
  reducers: {},
  extraReducers: {
    [setDeposits]: (state, {payload}) => {
      state.deposits = payload
    },
    [setSelectedDeposit]: (state, {payload}) => {
      state.selectedDeposit = payload
    },
    [setEditDeposit]: (state, {payload}) => {
      state.editDeposit = payload
    },
  },
})

export default depositslice.reducer
