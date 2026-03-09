import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {STATUS as name} from '../../../store/slices/config'
import {_fetchObject, _fetchStatus, _fetchTransitions, _updateStatus} from '../api/api'
import _ from 'lodash'
import {_fetchObjectFamilles} from '../../Famillies/api'
import {setToastParams} from '../../../store/slices/ui.slice'

export const fetchStatus = createAsyncThunk(
  `${name}/fetchStatus`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchStatus(_args)
    if (!response.error) dispatch(setStatus(response.data))
      return true
  }
)

export const saveStatus = createAsyncThunk(
  `${name}/saveStatus`,
  async (_args, {getState, dispatch}) => {
    try {
      const {selectedObject} = getState()[name]
      let response = await _updateStatus(_args)
      if (!response.error) {
        dispatch(fetchStatus(selectedObject))
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Status bien enregistré',
            position: 'top-right',
          })
        )
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }
)

export const fetchObject = createAsyncThunk(
  `${name}/fetchObject`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchObject()
    if (!response.error) dispatch(setObject(response.data))
  }
)

export const fetchObjectFamilles = createAsyncThunk(
  `${name}/fetchObjectFamilles`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchObjectFamilles()
    if (!response.error) dispatch(setObjectFamilles(response.data))
  }
)

export const fetchTransitions= createAsyncThunk(
  `${name}/fetchTransitions`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTransitions(_args)
    return response
  }
)

//Actions
export const setStatus = createAction(`${name}/setStatus`)
export const setShow = createAction(`${name}/setShow`)
export const setSelectedStatus = createAction(`${name}/setSelectedStatus`)
export const setEditStatus = createAction(`${name}/setEditStatus`)
export const setObject = createAction(`${name}/setObject`)
export const setObjectFamilles = createAction(`${name}/setObjectFamilles`)
export const setSelectedObject = createAction(`${name}/setSelectedObject`)

const statusslice = createSlice({
  name,
  initialState: {
    status: [],
    show: true,
    selectedStatus: null,
    editStatus: false,
    objects: [],
    objectFamilles: [],
    selectedObject: null,
  },
  reducers: {},
  extraReducers: {
    [setStatus]: (state, {payload}) => {
      state.status = payload
    },
    [setShow]: (state, {payload}) => {
      state.show = payload
    },
    [setSelectedStatus]: (state, {payload}) => {
      state.selectedStatus = payload
    },
    [setEditStatus]: (state, {payload}) => {
      state.editStatus = payload
    },
    [setObject]: (state, {payload}) => {
      state.objects = payload
    },
    [setObjectFamilles]: (state, {payload}) => {
      state.objectFamilles = payload
    },
    [setSelectedObject]: (state, {payload}) => {
      state.selectedObject = payload
    },
  },
})

//selectors
export const getStatus = (state) => state[name].status
export const getShow = (state) => state[name].show
export const getSelectedStatus = (state) => state[name].selectedStatus
export const getEditStatus = (state) => state[name].editStatus
export const getObject = (state) => state[name].objects
export const getObjectFamilles = (state) => state[name].objectFamilles
export const getSelectedObject = (state) => state[name].selectedObject

export default statusslice.reducer
