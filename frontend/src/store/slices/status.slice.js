import { createSlice , createAsyncThunk , createAction } from "@reduxjs/toolkit";
import { STATUSE as name } from './config'
import { _fetchStatuses , _createStatuse  } from '../../api/index'
import _ from 'lodash'
export const fetchStatuses = createAsyncThunk(`${name}/fetchStatuses` , async (_args , {getState , dispatch})=> {
    let response = await _fetchStatuses()
    if(!response.error) dispatch(setStatuses(response.result))
})

export const createOrUpdateStatuse = createAsyncThunk(`${name}/createOrUpdateTask`, async (_args, { dispatch, getState }) => {
    try {
      let { selectedStatuse } = getState()[name]
  
      let data = _.cloneDeep(selectedStatuse)
  
      let res = null
  
      res = await _createStatuse(data)
      
  
      if (res.success) dispatch(fetchStatuses())
  
      return res
    } catch (e) {
      return { error: true, message: e.message }
    }
  })

export const setStatuses =  createAction(`${name}/fetchStatuses`)
export const setSelectedStatuse =  createAction(`${name}/setSelectedStatuse`)
export const setEditStatuse =  createAction(`${name}/setEditStatuse`)


export const getStatuses =  state => state[name].statuses
export const getSelectedStatuse =  state => state[name].selectedStatuse
export const getEditStatuse =  state => state[name].editStatuse

const statuseslice = createSlice({
    name,
    initialState: {
        statuses: [],
        selectedStatuse: null,
        editStatuse: false
    },
    reducers: {
        
    },
    extraReducers: {
        [setStatuses]: (state , {payload})=> {
            state.statuses = payload
        },
        [setSelectedStatuse]: (state , {payload})=> {
            state.selectedStatuse = payload
        },
        [setEditStatuse]: (state , {payload})=> {
            state.editStatuse = payload
        }
    }
})

export default statuseslice.reducer
