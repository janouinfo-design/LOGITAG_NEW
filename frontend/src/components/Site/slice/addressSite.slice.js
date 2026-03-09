import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {ADDRESS_SITE as name} from '../../../store/slices/config'
import _ from 'lodash'
import {_fetchAddressPsCore} from '../api/api'
import {_saveAddress} from '../../Company/api/api'

export const fetchAddresses = createAsyncThunk(
  `${name}/fetchAddresses`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchAddressPsCore(_args)

    if (!response.error) dispatch(setAddressesSelectedSite(response.data))


    return response
  }
)

export const createOrUpdateAddress = createAsyncThunk(
  `${name}/createOrUpdateAddress`,
  async (_args, {dispatch, getState}) => {
    try {
      let info = {
        ..._args,
        fax: _args.Fax,
        email: _args.Email,
        phone: _args.Phone,
        address: _args.Address,
        country: _args.Country,
        lat: `${_args.lat}`,
        lng: `${_args.lng}`,
      }
      delete info.className
      let newObj = {}

      for (const key in info) {
        if (info.hasOwnProperty(key)) {
          if (key[0] !== key[0].toUpperCase()) {
            newObj[key] = info[key]
          }
        }
      }
      let res = null

      res = await _saveAddress(info)

      // dispatch(setMsgType(res.data[0]?.typeMsg))

      if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Ok') {
        return res.data
      }

      return false
    } catch (e) {
      return {error: true, message: e.message}
    }
  }
)

//export const setAddresses = createAction(`${name}/fetchAddresses`)
export const setAddressesSelectedSite = createAction(`${name}/fetchAddresses`)
export const setEditAddress = createAction(`${name}/setEditAddress`)
export const setSelectedAddress = createAction(`${name}/setSelectedAddress`)
export const setAddressDetail = createAction(`${name}/setAddressDetail`)

const addressSiteslice = createSlice({
  name,
  initialState: {
    //addresses: [],
    addressesSelectedSite: [],
    editAddress: false,
    selectedAddress: null,
    currentAddress: null,
    addressDetail: false,
  },
  reducers: {},
  extraReducers: {
    // [setAddresses]: (state, {payload}) => {
    //   state.addresses = payload
    // },
    [setAddressesSelectedSite]: (state, {payload}) => {
      state.addressesSelectedSite = payload
    },
    [setEditAddress]: (state, {payload}) => {
      state.editAddress = payload
    },
    [setSelectedAddress]: (state, {payload}) => {
      state.selectedAddress = payload
    },
    [setAddressDetail]: (state, {payload}) => {
      state.addressDetail = payload
    },
  },
})

//selectors
//export const getAddresses = (state) => state[name].addresses
export const getAddressesSelectedSite = (state) => state[name].addressesSelectedSite
export const getSelectedAddress = (state) => state[name].selectedAddress
export const getEditAddress = (state) => state[name].editAddress
export const getAddressDetail = (state) => state[name].addressDetail

export default addressSiteslice.reducer
