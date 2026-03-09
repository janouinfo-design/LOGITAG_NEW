import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {INVENTORY as name} from '../../../store/slices/config'
import _ from 'lodash'
import {
  _closedInventory,
  _fecthInventoryDetail,
  _fetchInventories,
  _removeInventory,
  _saveInventory,
} from '../api'
import {socket} from '../../../socket/socket'
import moment from 'moment'
import {_fetchValidator} from '../../../api'
import {setToastParams} from '../../../store/slices/ui.slice'

export const fetchInventories = createAsyncThunk(
  `${name}/fetchInventories`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchInventories(_args)
    if (!response.error) dispatch(setInventories(response.data))
  }
)

export const fecthInventoryDetail = createAsyncThunk(
  `${name}/_fecthInventoryDetail`,
  async (_args, {dispatch}) => {
    let response = await _fecthInventoryDetail(_args)
    if (!response.error) {
      if (_args.type === 'nonscan') {
        dispatch(setInventoryDetailPasVu(response.data))
      } else if (_args.type === 'scan') {
        dispatch(setInventoryDetailVu(response.data))
      } else if (_args.type === 'scanplus') {
        dispatch(setInventoryDetailScanPlus(response.data))
      }
    }
  }
)

export const fetchValidator = createAsyncThunk(
  `${name}/fetchValidator`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchValidator(_args)
    if (!response.error) {
      dispatch(setValidator(response.data))
      return true
    }
  }
)

export const createOrUpdateInventory = createAsyncThunk(
  `${name}/createOrUpdateInventory`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedInventory} = getState()[name]
      let {typeFields} = getState()[name]
      // let data = _.cloneDeep(selectedInventory)
      // let filteredData = typeFields.filter((item) => item.type !== '')
      // if (Array.isArray(filteredData) && filteredData.length === 0) {
      //   filteredData = ''
      // }
      let orderDate = moment(selectedInventory?.inventoryDate).format('DD-MM-YYYY')

      let obj = {
        id: selectedInventory?.id || 0,
        scanAuth: selectedInventory?.familleAuth || [],
        depositId: selectedInventory?.depots || [],
        worksiteId: selectedInventory?.sites || [],
        info: {
          reference: selectedInventory?.reference || '',
          description: selectedInventory?.description || '',
          inventoryDate: orderDate,
          creaDate: moment().format('DD-MM-YYYY'),
          customerId: selectedInventory?.client || 0,
        },
      }

      let res = null
      res = await _saveInventory(obj)
      if (
        (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'added') ||
        (res.data || [])[0]?.msg === 'Updated'
      ) {
        socket.emit('inventory_status_changed', {
          obj,
        })
        dispatch(fetchInventories({}))
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Invontaire bien enregistré',
            position: 'top-right',
          })
        )
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.typeMsg === 'error') {
        dispatch(
          setToastParams({
            show: true,
            severity: 'error',
            summary: 'ERREUR',
            detail: res?.data[0]?.msg,
            position: 'top-right',
          })
        )
      }

      return false
    } catch (error) {
      return false
    }
  }
)

export const removeInventory = createAsyncThunk(
  `${name}/removeInventory`,
  async (_args, {dispatch}) => {
    let res = await _removeInventory(_args?.id)
    dispatch(fetchInventories({}))
  }
)

export const closedInventory = createAsyncThunk(
  `${name}/closedInventory`,
  async (_args, {dispatch}) => {
    let res = await _closedInventory(_args?.id)
    dispatch(fetchInventories({}))
  }
)

export const setInventories = createAction(`${name}/setInventories`)
export const setInventoryDetailVu = createAction(`${name}/setInventoryDetailVu`)
export const setInventoryDetailPasVu = createAction(`${name}/setInventoryDetailPasVu`)
export const setInventoryDetailScanPlus = createAction(`${name}/setInventoryDetailScanPlus`)
export const setValidator = createAction(`${name}/setValidator`)
export const setEditInventory = createAction(`${name}/setEditInventory`)
export const setSelectedInventory = createAction(`${name}/setSelectedInventory`)
export const setTypeFields = createAction(`${name}/setTypeFields`)
export const setShow = createAction(`${name}/setShow`)
export const setExistItem = createAction(`${name}/setExistItem`)
export const setTypes = createAction(`${name}/setTypes`)

const inventorySlice = createSlice({
  name,
  initialState: {
    inventories: [],
    inventoryDetailVu: [],
    inventoryDetailPasVu: [],
    inventoryDetailScanPlus: [],
    validator: [],
    editInventory: false,
    selectedInventory: null,
    typeFields: [],
    show: true,
    existItem: false,
    types: [],
  },
  reducers: {},
  extraReducers: {
    [setInventories]: (state, {payload}) => {
      state.inventories = payload
    },
    [setInventoryDetailVu]: (state, {payload}) => {
      state.inventoryDetailVu = payload
    },
    [setInventoryDetailPasVu]: (state, {payload}) => {
      state.inventoryDetailPasVu = payload
    },
    [setInventoryDetailScanPlus]: (state, {payload}) => {
      state.inventoryDetailScanPlus = payload
    },
    [setValidator]: (state, {payload}) => {
      state.validator = payload
    },
    [setEditInventory]: (state, {payload}) => {
      state.editInventory = payload
    },
    [setSelectedInventory]: (state, {payload}) => {
      state.selectedInventory = payload
    },
    [setTypeFields]: (state, {payload}) => {
      state.typeFields = payload
    },
    [setShow]: (state, {payload}) => {
      state.show = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.existItem = payload
    },
    [setTypes]: (state, {payload}) => {
      state.types = payload
    },
  },
})

export const getInventories = (state) => state[name].inventories
export const getInventoryDetailVu = (state) => state[name].inventoryDetailVu
export const getInventoryDetailPasVu = (state) => state[name].inventoryDetailPasVu
export const getInventoryDetailScanPlus = (state) => state[name].inventoryDetailScanPlus
export const getValidator = (state) => state[name].validator
export const getEditInventory = (state) => state[name].editInventory
export const getSelectedInventory = (state) => state[name].selectedInventory
export const getTypeFields = (state) => state[name].typeFields
export const getShow = (state) => state[name].show
export const getExistItem = (state) => state[name].existItem
export const getTypes = (state) => state[name].types

export default inventorySlice.reducer
