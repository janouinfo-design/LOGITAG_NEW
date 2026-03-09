import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  _changeGatewayStatus,
  _createOrUpdateGateway,
  _deleteGateway,
  _fetchGateways,
  _fetchGatewayType,
  _gatewayLinkGeofence,
  _removeGateway,
} from '../api/index'
import _ from 'lodash'
import {_fetchSites} from '../../Site/api/api'
import {setToastParams} from '../../../store/slices/ui.slice'
import {setAlertParams} from '../../../store/slices/alert.slice'

const slice_name = 'gateway'
export const fetchGateways = createAsyncThunk(
  `${slice_name}/fetchGateways`,
  async (_args, {dispatch, getState}) => {
    const res = await _fetchGateways(_args?.role ? _args.role : '')
    if (Array.isArray(res.result)) dispatch(setGateways(res.result))
    return res.success ? res.data : []
  }
)

export const changeStatusGat = createAsyncThunk(
  `${slice_name}/changeStatusGat`,
  async (_args, {dispatch, getState}) => {
    try {
      const res = await _changeGatewayStatus(_args)
      if (!res.error) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: res?.data[0]?.msg,
            position: 'top-right',
          })
        )
        return true
      }
      return false
    } catch (e) {
      console.error('changeStatusGat:', e)
    }
  }
)

export const deleteGateway = createAsyncThunk(
  `${slice_name}/deleteGateway`,
  async (_args, {dispatch, getState}) => {
    const res = await _deleteGateway({id: _args})
    if (Array.isArray(res.result) && res?.success) {
      dispatch(fetchGateways())
      dispatch(
        setToastParams({
          show: true,
          severity: 'success',
          summary: 'Success',
          detail: 'Gateway deleted successfully',
        })
      )
    }
  }
)

export const fetchAllSites = createAsyncThunk(
  `${slice_name}/fetchAllSites`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchSites({IDCustomer: 0})
      if (!response.error) {
        let data = response?.data?.filter((x) => x.type !== 'Vehicule')
        dispatch(setAllSite(data))
      }
    } catch (e) {
    }
  }
)

export const createOrUpdateGateway = createAsyncThunk(
  `${slice_name}/createOrUpdateTask`,
  async (_args, {dispatch, getState}) => {
    try {
      if (!_args) return
      let {allSite} = getState()[slice_name]
      const findSiteSelected = allSite?.find((site) => site?.id == _args?.data?.locationId)

      let data = _.cloneDeep(_args.data)
      let obj = {
        ...data,
        locationLabel: findSiteSelected?.label || '',
        locationObject: findSiteSelected?.type || '',
        locationId: +data?.locationId || 0,
        exitLat: _args?.exitLatLng?.lat || data?.exitLat || 0,
        exitLng: _args?.exitLatLng?.lng || data?.exitLng || 0,
        id: +data?.id || 0,
      }


      let res = await _createOrUpdateGateway(obj)

      res.success = res.success || res.status
      if (res.status) dispatch(fetchGateways())

      return res
    } catch (e) {
      return {error: true, message: e.message}
    }
  }
)

export const removeGateway = createAsyncThunk(
  `${slice_name}/removeTask`,
  async (_args, {dispatch, getState}) => {
    const res = await _removeGateway(_args.id)
    if (res.success) dispatch(fetchGateways())
    return res
  }
)

export const gatewayLinkGeofence = createAsyncThunk(
  `${slice_name}/gatewayLinkGeofence`,
  async (_args, {dispatch, getState}) => {
    const res = await _gatewayLinkGeofence(_args.id)
    if (res.success) dispatch(fetchGateways())
    return res
  }
)

export const fetchGatewayTypes = createAsyncThunk(
  `${slice_name}/fetchGatewayType`,
  async (_args, {dispatch, getState}) => {
    let obj = {
      src: 'deviceType',
    }
    const res = await _fetchGatewayType(obj)
    if (res.success) {
      dispatch(setGatewayTypes(res.data))
      return true
    }
    return false
  }
)

export const fetchGatewayModes = createAsyncThunk(
  `${slice_name}/fetchGatewayModes`,
  async (_args, {dispatch, getState}) => {
    let obj = {
      src: 'deviceMode',
    }
    const res = await _fetchGatewayType(obj)
    if (res.success) {
      dispatch(setGatewayModes(res.data))
      return true
    }
    return false
  }
)

export const Gatewayslice = createSlice({
  initialState: {
    Gateways: [],
    allSite: [],
    gatewayModes: [],
    gatewayTypes: [],
    selectedGateway: null,
    editGateway: false,
    gatStatus: false,
    view: 'list',
  },
  name: slice_name,
  reducers: {
    setGateways: (state, {payload}) => {
      if (Array.isArray(payload)) {
        state.Gateways = payload.map((u) => ({
          ...u,
          pseudo: ((u.fname?.[0] || '') + (u.sname?.[0] || '')).toUpperCase(),
        }))
      } else {
        state.Gateways = payload
      }
    },
    setGatStatus: (state, {payload}) => {
      state.gatStatus = payload
    },
    setAllSite(state, {payload}) {
      state.allSite = payload
    },
    setSelectedGateway: (state, {payload}) => {
      state.selectedGateway = payload
    },
    setEditGateway: (state, {payload}) => {
      state.editGateway = payload
    },
    setGatewayTypes: (state, {payload}) => {
      state.gatewayTypes = payload
    },
    setGatewayModes: (state, {payload}) => {
      state.gatewayModes = payload
    },
  },
})

export const getSelectedGateway = (state) => state[slice_name].selectedGateway
export const getGateways = (state) => state[slice_name].Gateways
export const getGatewayView = (state) => state[slice_name].view
export const getEditGateway = (state) => state[slice_name].editGateway
export const getAllSite = (state) => state[slice_name].allSite
export const getGatewayTypes = (state) => state[slice_name].gatewayTypes
export const getGatewayModes = (state) => state[slice_name].gatewayModes
export const getGatStatus = (state) => state[slice_name].gatStatus

export const {
  setGateways,
  setSelectedGateway,
  setEditGateway,
  setGatewayView,
  setAllSite,
  setGatewayTypes,
  setGatewayModes,
  setGatStatus,
} = Gatewayslice.actions

export default Gatewayslice.reducer
