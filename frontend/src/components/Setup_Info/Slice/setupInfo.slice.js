import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {SETUPINFO as name} from '../../../store/slices/config'
import {_saveCompany} from '../../Company/api/api'
import {_saveSetupInfo} from '../api'
import _ from 'lodash'
import {fetchCompany} from '../../Company/slice/company.slice'

export const createOrUpdateSetupInfo = createAsyncThunk(
  `${name}/createOrUpdateCompany`,
  async (_args, {dispatch, getState}) => {
    try {

      let data = _.cloneDeep(_args.company)

      let obj = {
        language: _args.values.language?.name || data.language,
        timezone: _args.values.timezone?.name || data.timezone,
        distanceUnit: _args.values.distanceunit?.name || data.distanceUnit,
        volumeUnit: _args.values.volumeunit?.name || data.volumeUnit,
        temperatureUnit: _args.values.temperatureunit?.name || data.temperatureUnit,
      }


      let res = null

      res = await _saveSetupInfo(obj)


      // dispatch(setMsgType(res.data[0]?.typeMsg))

      if (Array.isArray(res.data) && (res.data || [])[0]?.typeMsg === 'success') {
        dispatch(fetchCompany())
        return true
      }

      // return false
    } catch (e) {
      return {error: true, message: e.message}
    }
  }
)

export const setSelectedCompany = createAction(`${name}/setSelectedCompany`)

const setupInfo = createSlice({
  name,
  initialState: {
    selectedCompany: null,
    error: null,
  },
  reducers: {},
  extraReducers: {},
})

export const getError = (state) => state[name].error
export const getSelectedCompany = (state) => state[name].selectedCompany

export default setupInfo.reducer
