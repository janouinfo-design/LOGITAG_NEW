import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {ADDRESS_DEPOT as name} from '../../../store/slices/config'
import _ from 'lodash'
import {_fetchAddressPsCore} from '../api'
import {_saveAddress} from '../../Company/api/api'
// import {_fetchAddressPsCore} from '../api/api'
// import {_saveAddress} from '../../Company/api/api'

// export const fetchAddresses = createAsyncThunk(
//   `${name}/fetchAddresses`,
//   async (_args, {getState, dispatch}) => {
//     let response = await _fetchAddressPsCore(_args)
//     if (!response.error) dispatch(setAddressesSelectedDepot(response.data))

//   }
// )

export const fetchAddresses = createAsyncThunk(
  `${name}/fetchAddresses`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchAddressPsCore(_args)
    if (!response.error) dispatch(setAddresses(response.data))
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
export const setAddresses = createAction(`${name}/fetchAddresses`)
//export const setAddressesSelectedDepot = createAction(`${name}/fetchAddresses`)
export const setEditAddress = createAction(`${name}/setEditAddress`)
export const setSelectedAddress = createAction(`${name}/setSelectedAddress`)
export const setAddressDetail = createAction(`${name}/setAddressDetail`)

const addressDepotslice = createSlice({
  name,
  initialState: {
    //addresses: [],
    addresses: [],
    //addressesSelectedDepot: [],
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
    [setAddresses]: (state, {payload}) => {
      state.addresses = payload
    },
    // [setAddressesSelectedDepot]: (state, {payload}) => {
    //   state.addressesSelectedDepot = payload
    // },
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
export const getAddresses = (state) => state[name].addresses
//export const getAddressesSelectedDepot = (state) => state[name].addressesSelectedDepot
export const getSelectedAddress = (state) => state[name].selectedAddress
export const getEditAddress = (state) => state[name].editAddress
export const getAddressDetail = (state) => state[name].addressDetail

export default addressDepotslice.reducer
