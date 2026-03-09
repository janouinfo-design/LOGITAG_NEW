import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {FAMILLE as name} from '../../../store/slices/config'
import {_fetchFamilles, _fetchIcons, _fetchObject, _removeFamille, _saveFamille} from '../api'
import _ from 'lodash'
import {setToastParams} from '../../../store/slices/ui.slice'

export const fetchFamilles = createAsyncThunk(
  `${name}/fetchFamilles`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchFamilles(_args)
    if (!response.error) {
      dispatch(setFamilles(response.data))
      return response?.data || []
    }
    return true
  }
)

export const fetchObject = createAsyncThunk(
  `${name}/fetchObject`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchObject()
    if (!response.error) dispatch(setObject(response.data))
  }
)

export const fetchIcons = createAsyncThunk(
  `${name}/fetchIcons`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchIcons()
    if (!response.error) dispatch(setIcons(response.data))
  }
)

export const createOrUpdateFamille = createAsyncThunk(
  `${name}/createOrUpdateFamille`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedFamille} = getState()[name]
      let {selectedObject} = getState()[name]
      let data = _.cloneDeep(selectedFamille)

      let obj = {
        ..._args,
        name: _args?.label || data?.label,
        label: _args?.label || data?.label,
        // color: 'f8f9fa',
        bgColor: _args?.bgColor?.replace('#', '') || data?.bgColor.replace('#', ''),
        backgroundColor: _args?.bgColor.replace('#', '') || data?.bgColor.replace('#', ''),
        typeId: _args.typesId,
        id: _args?.id || data?.id || 0,
      }

      let res = null
      res = await _saveFamille(obj)
      if (
        (Array.isArray(res.data) && (res.data || [])[0]?.typeMsg === 'success') ||
        (res.data || [])[0]?.typeMsg === 'success'
      ) {
        dispatch(fetchFamilles(selectedObject?.name))
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Famille bien enregistré',
            position: 'top-right',
          })
        )
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'already exists') {
        dispatch(setExistItem(true))
      }

      return false
    } catch (error) {
      return false
    }
  }
)

export const removeFamille = createAsyncThunk(
  `${name}/removeFamille`,
  async ({currentFamille, type}, {dispatch}) => {
    let res = await _removeFamille(currentFamille?.id)
    if (!res.error) {
      dispatch(fetchFamilles({src: type}))
    }
  }
)

export const setFamilles = createAction(`${name}/setFamilles`)
export const setFamilleActive = createAction(`${name}/setFamilleActive`)
export const setFamilleInactive = createAction(`${name}/setFamilleInactive`)
export const setShow = createAction(`${name}/setShow`)
export const setSelectedFamille = createAction(`${name}/setSelectedFamille`)
export const setEditFamille = createAction(`${name}/setEditFamille`)
export const setObject = createAction(`${name}/setObject`)
export const setSelectedObject = createAction(`${name}/setSelectedObject`)
export const setIcons = createAction(`${name}/setIcons`)
export const setExistItem = createAction(`${name}/setExistItem`)

const familleSlice = createSlice({
  name,
  initialState: {
    familles: [],
    familleActive: [],
    familleInactive: [],
    show: true,
    selectedFamille: null,
    editFamille: false,
    objects: [],
    selectedObject: null,
    icons: [],
    existItem: false,
  },
  reducers: {},
  extraReducers: {
    [setFamilles]: (state, {payload}) => {
      state.familles = payload
    },
    [setFamilleActive]: (state, {payload}) => {
      state.familleActive = payload
    },
    [setFamilleInactive]: (state, {payload}) => {
      state.familleInactive = payload
    },
    [setShow]: (state, {payload}) => {
      state.show = payload
    },
    [setSelectedFamille]: (state, {payload}) => {
      state.selectedFamille = payload
    },
    [setEditFamille]: (state, {payload}) => {
      state.editFamille = payload
    },
    [setObject]: (state, {payload}) => {
      state.objects = payload
    },
    [setSelectedObject]: (state, {payload}) => {
      state.selectedObject = payload
    },
    [setIcons]: (state, {payload}) => {
      state.icons = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.existItem = payload
    },
  },
})

export const getFamilles = (state) => state[name].familles
export const getFamilleActive = (state) => state[name].familleActive
export const getFamilleInactive = (state) => state[name].familleInactive
export const getShow = (state) => state[name].show
export const getSelectedFamille = (state) => state[name].selectedFamille
export const getEditFamille = (state) => state[name].editFamille
export const getObject = (state) => state[name].objects
export const getSelectedObject = (state) => state[name].selectedObject
export const getIcons = (state) => state[name].icons
export const getExistItem = (state) => state[name].existItem

export default familleSlice.reducer
