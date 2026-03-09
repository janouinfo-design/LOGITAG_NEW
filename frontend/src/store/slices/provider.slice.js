import { createSlice , createAction , createAsyncThunk}  from '@reduxjs/toolkit'
import { PROVIDER as slice_name } from './config'
import { _fetchProviders } from '../../api'

export const fetchProviders = createAsyncThunk(`${slice_name}/fetchProviders` , async ( args , { dispatch })=> {
      let providers = await _fetchProviders();
      

      if(providers.success) dispatch(setProviders(providers.data)) 
})

const setProviders = createAction(`${slice_name}/setProviders`)
const setSelectedProvider = createAction(`${slice_name}/setSelectedProvider`)

const providerSlice = createSlice({
    name: slice_name,
    initialState: {
        prodivers: [],
        selectedProvider: null
    },
    extraReducers: {
        [setProviders] : (state , { payload } )=> {
            state.prodivers = payload
        },
        [setSelectedProvider] : (state , { payload } )=> {
            state.selectedProvider = payload
        }
    }
})


export default providerSlice.reducer