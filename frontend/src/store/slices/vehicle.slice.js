import { createSlice , createAsyncThunk , createAction } from "@reduxjs/toolkit";
import { VEHICLE as name } from './config'
import { _fetchVehicles } from '../../api/index'
import randomcolor from 'randomcolor'

export const fetchVehicles = createAsyncThunk(`${name}/fetchVehicles` , async (_args , {getState , dispatch})=> {
    let response = await _fetchVehicles()

    if(!response.error) dispatch(setVehicles(response.result))

})

export const setVehicles =  createAction(`${name}/fetchVehicles`)
export const setSelectedVehicle =  createAction(`${name}/setSelectedVehicle`)

export const getVehicles =  state => state[name].vehicles
export const getSelectedVehicle =  state => state[name].selectedVehicle

const vehicleslice = createSlice({
    name,
    initialState: {
        vehicles: Array.from({length: 10} , (i ,c)=> {
            return {
                id: c,
                label: `VH. ${c}`,
                percent: 0.6*100/c,
                matricule: `MAT. 10${c}`,
                color: randomcolor()
            }
        }),
        selectedVehicle: null
    },
    reducers: {
        
    },
    extraReducers: {
        [setVehicles]: (state , {payload})=> {
            state.vehicles = payload
        },
        [setSelectedVehicle]: (state , {payload})=> {
            state.selectedVehicle = payload
        }
    }
})

export default vehicleslice.reducer
