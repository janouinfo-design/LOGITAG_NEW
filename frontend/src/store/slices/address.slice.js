import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {ADDRESS as name} from './config'
import _ from 'lodash'
import {_fetchAddressPsCore} from '../../api'

export const fetchAddresses = createAsyncThunk(
  `${name}/fetchAddresses`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchAddressPsCore()

    if (!response.error) dispatch(setAddresses(response.data))

  }
)

export const setAddresses = createAction(`${name}/fetchAddresses`)
export const setEditAddress = createAction(`${name}/setEditAddress`)

export const getEditAddress = (state) => state.address.editAddress

const addresslice = createSlice({
  name,
  initialState: {
    addresses: [],
    editAddress: false,
    currentAddress: null,
  },
  reducers: {},
  extraReducers: {
    [setAddresses]: (state, {payload}) => {
      state.addresses = payload
    },
    [setEditAddress]: (state, {payload}) => {
      state.editAddress = payload
    },
  },
})

//selectors
export const getAddresses = (state) => state[name].addresses

export default addresslice.reducer
