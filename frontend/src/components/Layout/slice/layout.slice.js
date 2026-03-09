import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {_fetchMenus} from '../api'

const name = 'layout'

export const fetchMenus = createAsyncThunk(
  `${name}/fetchMenus`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchMenus()
    let menus = response?.result?.[0]
    if(menus){
      if(typeof menus?.res == 'string') menus = JSON.parse(menus.res)
    }
    
    if (Array.isArray(menus)) {
      dispatch(setMenus(menus))
    }

    dispatch(setIsMenuReady(Array.isArray(menus)))
  }
)

const layoutslice = createSlice({
  name,
  initialState: {
    menus: [],
    selectedMenu: null,
    selectedMenuId: null,
    isMenuReady: false
  },
  reducers: {
    setMenus: (state, {payload}) => {
      state.menus = payload
    },
    setIsMenuReady(state , {payload}){
      state.isMenuReady = payload
    },
    setSelectedMenu: (state, {payload}) => {
      state.selectedMenu = payload
    },
    setSelectedMenuId: (state, {payload}) => {
      state.selectedMenuId = payload
    },
  },
})

export const {setMenus, setIsMenuReady , setSelectedMenu, setSelectedMenuId} = layoutslice.actions

export const getMenus = (state) => (Array.isArray(state[name].menus) ? state[name].menus : [])
export const getSelectedMenu = (state) =>
  state[name].menus.find(({id}) => id == state[name].selectedMenuId)
export const getSelectedMenuId = (state) => state[name].selectedMenuId
export const getSelectedMenuInfos = (state) => state[name].selectedMenu
export const getIsMenuReady = (state) => state[name].isMenuReady

export default layoutslice.reducer
