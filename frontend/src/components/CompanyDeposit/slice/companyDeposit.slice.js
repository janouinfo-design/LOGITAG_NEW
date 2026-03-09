import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {COMPANYDEPOSITE as name} from '../../../store/slices/config'
import _ from 'lodash'

export const createOrUpdateCompanyDeposite = createAsyncThunk(
  `${name}/createOrUpdateCompanyDeposite`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedCompanyDeposite} = getState()[name]
      let data = _.cloneDeep(selectedCompanyDeposite)

      let obj = {}

      // let res = null
      // res = await _saveFamille(obj)
      // if (Array.isArray(res.data) && (res.data || [])[0]?.typeMsg === 'success' || (res.data || [])[0]?.typeMsg === 'success') {
      //   dispatch(fetchFamilles(selectedObject?.name))
      //   return true
      // } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'already exists') {
      //   dispatch(setExistItem(true))
      // }
      // return false
    } catch (error) {
      return false
    }
  }
)

export const setselectedCompanyDeposite = createAction(`${name}/setselectedCompanyDeposite`)
export const setExistItem = createAction(`${name}/setExistItem`)
const companyDepositSlice = createSlice({
  name,
  initialState: {
    selectedCompanyDeposite: null,
    existItem: false, 
  },
  reducers: {},
  extraReducers: {
    [setselectedCompanyDeposite]: (state, {payload}) => {
      state.selectedCompanyDeposite = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.existItem = payload
    },
  },
})

export const getSelectedCompanyDeposite = (state) => state[name].selectedCompanyDeposite
export const getExistItem = (state) => state[name].existItem

export default companyDepositSlice.reducer
