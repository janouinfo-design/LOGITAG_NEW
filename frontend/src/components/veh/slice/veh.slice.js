import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {VEHICULES as name} from '../../../store/slices/config'
import {_fetchTypes, _fetchVehiculesPSCore} from '../../../api'
import {_fetchVehicules, _removeVehicule, _saveVehicule} from '../api'
import _ from 'lodash'
import {socket} from '../../../socket/socket'
import {_fetchTrackerList} from '../../Navigxy/api'

export const fetchVehicules = createAsyncThunk(
  `${name}/fetchVehicules`,
  async (_args, {dispatch}) => {
    const response = await _fetchVehicules()
    if (!response.error) dispatch(setVehicules(response.data))
  }
)

export const fetchTrackerVeh = createAsyncThunk(
  `${name}/fetchTrackerVeh`,
  async (hash, {getState, dispatch}) => {
    try {
      let response = await _fetchTrackerList()
      if (response.success && Array.isArray(response?.data)) {
        let list = response?.data.map((item) => {
          return {
            label: item?.label,
            value: item?.id,
            model: item?.source?.model,
            creaDate: item?.source?.creation_date,
            deviceId: item?.source?.device_id,
          }
        })
        dispatch(setVehicules(list))
      } else {
        dispatch(setVehicules([]))
      }
    } catch (err) {
    }
  }
)

export const createOrUpdateVehicule = createAsyncThunk(
  `${name}/createOrUpdateVehicule`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedVehicule} = getState()[name]
      let {typeFields} = getState()[name]
      let data = _.cloneDeep(selectedVehicule)
      let filteredData = typeFields.filter((item) => item.type !== '')
      if (Array.isArray(filteredData) && filteredData.length === 0) {
        filteredData = ''
      }
      let obj = {
        ...data,
        id: data?.id || 0,
        fuelTypeId: _args.fuelId || data.fuelTypeId,
        fueltype: '',
        label: data?.name,
        active: 1, //*
        providerId: 0,
        departementId: 0,
        companyId: 0,
        fuelconsumption100km: 0,
        platelicense: data?.platelicense,
        nochassis: '',
        subtypeid: 0,
      }

      let res = null
      res = await _saveVehicule(obj)
      if (Array.isArray(res.data) && (res.data || [])[0]?.result === 'Ok') {
        // socket.emit('vehicule_status_changed', {
        //   obj,
        // })
        dispatch(fetchVehicules())
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.result === 'Already exists!') {
        dispatch(setExistItem(true))
      }

      return false
    } catch (error) {
      return false
    }
  }
)

export const removeVehicule = createAsyncThunk(
  `${name}/removeVehicule`,
  async (_args, {dispatch}) => {
    let res = await _removeVehicule(_args?.id)
    dispatch(fetchVehicules())
  }
)

export const fetchTypes = createAsyncThunk(
  `${name}/fetchTypes`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTypes(_args)
    if (!response.error) dispatch(setTypes(response.data))
  }
)

export const setVehicules = createAction(`${name}/setVehicules`)
export const setTypes = createAction(`${name}/setTypes`)
export const setEditVehicule = createAction(`${name}/setEditVehicule`)
export const setSelectedVehicule = createAction(`${name}/setSelectedVehicule`)
export const setTypeFields = createAction(`${name}/setTypeFields`)
export const setTypeEdit = createAction(`${name}/setTypeEdit`)
export const setShow = createAction(`${name}/setShow`)
export const setExistItem = createAction(`${name}/setExistItem`)

const vehSlice = createSlice({
  name,
  initialState: {
    vehicules: [],
    types: [],
    editVehicule: false,
    selectedVehicule: null,
    typeFields: [],
    typeEdit: null,
    show: true,
    existItem: false,
  },
  reducers: {},
  extraReducers: {
    [setVehicules]: (state, {payload}) => {
      state.vehicules = payload
    },
    [setTypes]: (state, {payload}) => {
      state.types = payload
    },
    [setEditVehicule]: (state, {payload}) => {
      state.editVehicule = payload
    },
    [setSelectedVehicule]: (state, {payload}) => {
      state.selectedVehicule = payload
    },
    [setTypeFields]: (state, {payload}) => {
      state.typeFields = payload
    },
    [setTypeEdit]: (state, {payload}) => {
      state.typeEdit = payload
    },
    [setShow]: (state, {payload}) => {
      state.show = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.existItem = payload
    },
  },
})

export const getVehicules = (state) => state[name].vehicules
export const getTypes = (state) => state[name].types
export const getEditVehicule = (state) => state[name].editVehicule
export const getSelectedVehicule = (state) => state[name].selectedVehicule
export const getTypeFields = (state) => state[name].typeFields
export const getTypeEdit = (state) => state[name].typeEdit
export const getShow = (state) => state[name].show
export const getExistItem = (state) => state[name].existItem

export default vehSlice.reducer
