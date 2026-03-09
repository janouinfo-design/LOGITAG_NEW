import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {TAG as name} from './config'
import {_fetchTags, _saveTag, _removeTag} from '../../api/index'
import _ from 'lodash'

export const fetchTags = createAsyncThunk(
  `${name}/fetchTags`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTags()

    if (!response.error) dispatch(setTags(response.result))

  }
)

export const createOrUpdateTag = createAsyncThunk(
  `${name}/createOrUpdateTag`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedTag} = getState()[name]

      let data = _.cloneDeep(selectedTag)

      data.active = data.active ? 1 : 0
      data.id = data.id || 0
      data.IDCustomer = 0
      // data.name = data.name || data.label || ''

      let res = null


      res = await _saveTag(data)

      if (Array.isArray(res.result) && (res.result || [])[0]?.typeMsg === 'success') {
        dispatch(fetchTags())
        return true
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

export const setTags = createAction(`${name}/fetchTags`)
export const setSelectedTag = createAction(`${name}/setSelectedTag`)
export const setEditTag = createAction(`${name}/setEditTag`)

export const getTags = (state) => state[name].tags
export const getSelectedTag = (state) => state[name].selectedTag
export const getEditTag = (state) => state[name].editTag

const tagslice = createSlice({
  name,
  initialState: {
    tags: [],
    selectedTag: null,
    editTag: false,
  },
  reducers: {},
  extraReducers: {
    [setTags]: (state, {payload}) => {
      state.tags = payload
    },
    [setSelectedTag]: (state, {payload}) => {
      state.selectedTag = payload
    },
    [setEditTag]: (state, {payload}) => {
      state.editTag = payload
    },
  },
})

export default tagslice.reducer
