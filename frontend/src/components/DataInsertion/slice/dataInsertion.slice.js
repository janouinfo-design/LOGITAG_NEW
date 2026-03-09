import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {DATAINSERTION as name} from '../../../store/slices/config'
import {_generatePresence} from '../api'

export const generatePresence = createAsyncThunk(
  `${name}/generatePresence`,
  async (_args, {getState, dispatch}) => {
    let response = await _generatePresence(_args)
    if (!response.error && Array.isArray(response?.res)) {
      window.open(response?.filepath, '_blank')
      return response?.res || []
    }
    return false
  }
)

const dataInsertionSlice = createSlice({
  name,
  initialState: {
    data: [],
  },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload
    },
  },
})

export const {setData} = dataInsertionSlice.actions
export default dataInsertionSlice.reducer
