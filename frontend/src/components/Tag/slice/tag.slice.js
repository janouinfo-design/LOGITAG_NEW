import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {TAG as name} from '../../../store/slices/config'
import {
  _fetchTags,
  _saveTag,
  _removeTag,
  _fetchStatus,
  _relationAdd,
  _fetchTagsToEngin,
  _removeEnginTag,
  _fetchTagsFree,
  _fetchTagsByStatus,
  _fetchEnginsByStatus,
  _fetchTagHistory,
} from '../api/api'
import _ from 'lodash'
import {fetchCustomerTags} from '../../../store/slices/customer.slice'
import {setSelectedEngine} from '../../Engin/slice/engin.slice'
import {setToastParams} from '../../../store/slices/ui.slice'

export const fetchTags = createAsyncThunk(
  `${name}/fetchTags`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchTags(_args)
      if (!response.error) {
        dispatch(setTags(response.data))
        return response.data
      }
      return []
    } catch (e) {}
  }
)

export const fetchTagsByStatus = createAsyncThunk(
  `${name}/fetchTagsByStatus`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTagsByStatus(_args)
    if (!response.error) dispatch(setTagsByStatus(response.data))
  }
)

export const fetchTagHistory = createAsyncThunk(
  `${name}/fetchTagHistory`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTagHistory(_args)
    if (!response.error) dispatch(setTagHistory(response.data))
  }
)

export const fetchEnginsByStatus = createAsyncThunk(
  `${name}/fetchEnginsByStatus`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchEnginsByStatus(_args)
    if (!response.error) dispatch(setEnginsByStatus(response.data))
  }
)

export const fetchStatus = createAsyncThunk(
  `${name}/fetchStatus`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchStatus()
    console.log(response, 'fetchStatus st')
    if (!response.error) dispatch(setStatus(response.data))
  }
)

export const fetchTagsWithEngin = createAsyncThunk(
  `${name}/fetchTagsWithEngin`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTagsToEngin(_args)
    if (!response.error) dispatch(setEnginTags(response.data))
  }
)
export const fetchTagsFree = createAsyncThunk(
  `${name}/fetchTagFree`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTagsFree({id: 1})
    if (!response.error) dispatch(setTagsFree(response.data))
  }
)

export const createOrUpdateTag = createAsyncThunk(
  `${name}/createOrUpdateTag`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedTag} = getState()[name]
      // let stat
      // if (typeof selectedTag.status === 'undefined') {
      //   stat = data.statusid
      // } else {
      //   stat = statusClick
      // }

      let obj = {
        IDCustomer: _args?.IDCustomer ? _args?.IDCustomer : 0,
        active: _args?.active || _args?.active ? 1 : 0,
        brand: _args?.brand || '',
        id: _args?.id || 0,
        label: _args.label || '',
        status: _args?.statusid || 0,
        code: _args?.code || '',
        adresse: _args?.adresse || '',
        familleId: _args?.familleId || 0,
        batterylevel: _args?.batterylevel || 0,
        LocationObject: _args?.LocationObject || null,
        LocationID: _args?.LocationID || null,

        // code: _args.code || '',
      }
      let res = null

      res = await _saveTag(obj)

      if (Array.isArray(res.result) && (res.result || [])[0]?.typeMsg === 'success') {
        return true
      } else if (Array.isArray(res.result) && (res.result || [])[0]?.typeMsg === 'error') {
        dispatch(
          setToastParams({
            show: true,
            severity: 'error',
            summary: 'ERREUR',
            detail: res?.result[0]?.msg,
            position: 'top-right',
          })
        )
        return false
      }

      return false
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)

export const removeTag = createAsyncThunk(`${name}/removeTag`, async (_arg, {dispatch}) => {
  let res = await _removeTag(_arg?.id)

  dispatch(fetchTags())
})

export const removeEnginTag = createAsyncThunk(
  `${name}/removeEnginTag`,
  async (_arg, {getState, dispatch}) => {
    let {selectedEnginTag} = getState()[name]
    let objId = _arg.engintagged?.relationId

    let res = await _removeEnginTag(objId)

    dispatch(fetchTagsWithEngin(_arg.id))
  }
)

export const addTagToEngin = createAsyncThunk(
  `${name}/addTagToEngin`,
  async (selectedTag, {getState, dispatch}) => {
    try {
      const {selectedEnginTag} = getState()[name]
      const {selectedEngine} = getState()['engine']

      let data = _.cloneDeep(selectedEnginTag)

      let obj = {
        src: 'engin',
        srcId: +selectedEngine?.id,
        objId: selectedTag,
        obj: 'tag',
      }

      let res = null

      res = await _relationAdd(obj)

      if (Array.isArray(res.data) && (res.data || [])[0]?.result === 'Ok') {
        let obj = {
          ...selectedEngine,
          relationId: res?.data?.[0]?.relationId,
        }
        dispatch(setSelectedEngine(obj))
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Engin bien ajouté à cette tag',
            position: 'top-right',
          })
        )
        return true
      }
      return false
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)

//Actions
export const setTagsByStatus = createAction(`${name}/fetchTagsByStatus`)
export const setEnginsByStatus = createAction(`${name}/fetchEnginsByStatus`)
export const setTags = createAction(`${name}/fetchTags`)
export const setTagsFree = createAction(`${name}/fetchTagsFree`)
export const setStatus = createAction(`${name}/setStatus`)
export const setSelectedTag = createAction(`${name}/setSelectedTag`)
export const setNewTag = createAction(`${name}/setNewTag`)
export const setEditTag = createAction(`${name}/setEditTag`)
export const setExistItem = createAction(`${name}/setExistItem`)
export const setShow = createAction(`${name}/setShow`)
export const setEnginTags = createAction(`${name}/fetchTagsWithEngin`)
export const setSelectedTagToEngin = createAction(`${name}/setSelectedTagToEngin`)

const tagslice = createSlice({
  name,
  initialState: {
    tagsByStatus: [],
    enginsByStatus: [],
    tags: [],
    tagsFree: [],
    status: [],
    enginTags: [],
    tagHistory: [],
    tagHistoryShow: false,
    selectedEnginTag: null,
    show: true,
    selectedTag: null,
    alreadyExist: false,
    editTag: false,
    tagLocationShow: false,
    tagLocation: null,
  },
  reducers: {
    setTagLocationShow: (state, {payload}) => {
      state.tagLocationShow = payload
    },
    setTagHistoryShow: (state, {payload}) => {
      state.tagHistoryShow = payload
    },
    setTagLocation: (state, {payload}) => {
      state.tagLocation = payload
    },
    setTagHistory: (state, {payload}) => {
      state.tagHistory = payload
    },
  },
  extraReducers: {
    [setTagsByStatus]: (state, {payload}) => {
      state.tagsByStatus = payload
    },
    [setEnginsByStatus]: (state, {payload}) => {
      state.enginsByStatus = payload
    },
    [setTags]: (state, {payload}) => {
      state.tags = payload
    },
    [setSelectedTag]: (state, {payload}) => {
      state.selectedTag = payload
    },
    [setEditTag]: (state, {payload}) => {
      state.editTag = payload
    },
    [setStatus]: (state, {payload}) => {
      state.status = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.alreadyExist = payload
    },
    [setShow]: (state, {payload}) => {
      state.show = payload
    },
    [setEnginTags]: (state, {payload}) => {
      state.enginTags = payload
    },
    [setSelectedTagToEngin]: (state, {payload}) => {
      state.selectedEnginTag = payload
    },
    [setTagsFree]: (state, {payload}) => {
      state.tagsFree = payload
    },
  },
})

//selectors
export const getTagsByStatus = (state) => state[name].tagsByStatus
export const getEnginsByStatus = (state) => state[name].enginsByStatus
export const getTags = (state) => state[name].tags
export const getTagsFree = (state) => state[name].tagsFree
export const getSelectedTag = (state) => state[name].selectedTag
export const getEditTag = (state) => state[name].editTag
export const getNewTag = (state) => state[name].newTag
export const getAlreadyExist = (state) => state[name].alreadyExist
export const getStatus = (state) => state[name].status
export const getShow = (state) => state[name].show
export const getEnginTags = (state) => state[name].enginTags
export const getSelectedTagEngin = (state) => state[name].selectedEnginTag
export const getTagLocationShow = (state) => state[name].tagLocationShow
export const getTagLocation = (state) => state[name].tagLocation
export const getTagHistory = (state) => state[name].tagHistory
export const getTagHistoryShow = (state) => state[name].tagHistoryShow

export const {setTagLocationShow, setTagLocation, setTagHistory, setTagHistoryShow} =
  tagslice.actions
export default tagslice.reducer
