import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {COMPANY as name} from '../../../store/slices/config'
import {
  _fetchCompany,
  _fetchCompanyAddresses,
  _getVersion,
  _saveAddress,
  _saveCompany,
} from '../api/api'
import _ from 'lodash'

export const fetchCompany = createAsyncThunk(
  `${name}/fetchCompany`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchCompany()
    if (!response.error) dispatch(setcompany(response.data))
  }
)
export const fetchCompanyAddresses = createAsyncThunk(
  `${name}/fetchCompanyAddresses`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchCompanyAddresses()
    if (!response.error) {
      dispatch(setCompanyAddresses(response.data))
      return response.data
    }
    return false
  }
)

export const fetchVersion = createAsyncThunk(
  `${name}/fetchVersion`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _getVersion({configName: _args})
      if (!response.error) {
        if (_args === 'version') {
          dispatch(setAndroidVersion(response.data))
        }
        return response.data
      }
      return false
    } catch (e) {
      return false
    }
  }
)
// export const fetchCostumerAddresses = createAsyncThunk(
//   `${name}/fetchCompanyAddresses`,
//   async (_args, {getState, dispatch}) => {
//     let response = await _fetchCompanyAddresses('costumer')
//     if (!response.error) dispatch(setCostumerAddresses(response.data))
//   }
// )
export const createOrUpdateAddress = createAsyncThunk(
  `${name}/createOrUpdateAddress`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedAddress} = getState()[name]

      let info = {
        ...selectedAddress,
        fax: selectedAddress.Fax,
        email: selectedAddress.Email,
        phone: selectedAddress.Phone,
        address: selectedAddress.Address,
        country: selectedAddress.Country,
        lat: `${_args.lat}`,
        lng: `${_args.lng}`,
      }

      // let data = _.cloneDeep(selectedAddress)
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
        dispatch(fetchCompanyAddresses())
        return true
      }

      return false
    } catch (e) {
      return {error: true, message: e.message}
    }
  }
)

export const createOrUpdateCompany = createAsyncThunk(
  `${name}/createOrUpdateCompany`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedCompany} = getState()[name]
      let {company} = getState()[name]
      let selected = selectedCompany == null ? company : selectedCompany

      let data = _.cloneDeep(_args)
      let obj = {
        ...data,
        gpsConfig: selected.gpsConfig ? '1' : '0',
      }

      let res = null

      // data.language = _args.Language.name || data.language
      // data.timezone = _args.timeZone.name || data.timeZone
      // data.volumeunit = _args.volumeUnit.name || data.volumeunit
      // data.temperatureunit = _args.temperatureUnit.name || data.temperatureunit
      // data.distanceunit = _args.distanceUnit.name || data.distanceunit

      res = await _saveCompany(obj)

      dispatch(setMsgType(res.data[0]?.typeMsg))

      if (Array.isArray(res.data) && (res.data || [])[0]?.typeMsg === 'success') {
        dispatch(fetchCompany())
        return true
      }

      return false
    } catch (e) {
      return {error: true, message: e.message}
    }
  }
)

//Actions
export const setcompany = createAction(`${name}/fetchCompany`)
export const setCompanyAddresses = createAction(`${name}/fetchCompanyAddresses`)
export const setCostumerAddresses = createAction(`${name}/fetchCostumerAddresses`)
export const setSelectedCompany = createAction(`${name}/setSelectedCompany`)
export const setSelectedAddress = createAction(`${name}/setSelectedAddress`)
export const setMsgType = createAction(`${name}/setMsgType`)
export const setEditAddress = createAction(`${name}/setEditAddress`)

const companySlice = createSlice({
  name,
  initialState: {
    company: [],
    companyAddresses: [],
    costumerAddresses: [],
    selectedCompany: null,
    selectedAddress: null,
    msgTypes: null,
    editAddress: false,
    androidVersion: '',
  },
  reducers: {
    setAndroidVersion: (state, {payload}) => {
      state.androidVersion = payload
    },
  },
  extraReducers: {
    [setcompany]: (state, {payload}) => {
      state.company = payload
      state.selectedCompany = payload[0]
    },
    [setSelectedCompany]: (state, {payload}) => {
      state.selectedCompany = payload
    },
    [setMsgType]: (state, {payload}) => {
      state.msgTypes = payload
    },
    [setCompanyAddresses]: (state, {payload}) => {
      state.companyAddresses = payload
    },
    [setCostumerAddresses]: (state, {payload}) => {
      state.costumerAddresses = payload
    },
    [setSelectedAddress]: (state, {payload}) => {
      state.selectedAddress = payload
    },
    [setEditAddress]: (state, {payload}) => {
      state.editAddress = payload
    },
  },
})

//selectors
export const getCompany = (state) => state[name].company
export const getCompanyAddresses = (state) => state[name].companyAddresses
export const getCostumerAddresses = (state) => state[name].costumerAddresses
export const getSelectedCompany = (state) => state[name].selectedCompany
export const getSelectedAddress = (state) => state[name].selectedAddress
export const getMsgType = (state) => state[name].msgTypes
export const getEditAddress = (state) => state[name].editAddress
export const getAndroidVersion = (state) => state[name].androidVersion

export const {setAndroidVersion} = companySlice.actions
export default companySlice.reducer
