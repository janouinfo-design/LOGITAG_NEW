import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {SITE as name} from '../../../store/slices/config'
import {
  _saveSite,
  _removeSite,
  _fetchCustomers,
  _fetchSitesByCodeClient,
  _fetchSites,
  _fetchGeoForSite,
  _fetchAddressPsCore,
} from '../api/api'
import _ from 'lodash'
import {_relationAdd} from '../../Tag/api/api'
import {fetchSitesClient} from '../../../store/slices/customer.slice'
import {_fetchGeofencings} from '../../shared/MapComponent/api/geofence'

export const fetchAddresses = createAsyncThunk(
  `${name}/fetchAddresses`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchAddressPsCore()

    if (!response.error) dispatch(setAddresses(response.data))
  }
)

export const fetchSites = createAsyncThunk(
  `${name}/fetchSites`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchSites({IDCustomer: _args || 0})
      if (!response.error) {
        let data = response?.data?.filter((x) => x.type === 'Worksite' || x.type === 'Deposit')
        dispatch(setSites(data))
      }
    } catch (e) {}
  }
)
export const fetchGeoForSite = createAsyncThunk(
  `${name}/fetchGeoForSite`,
  async (id, {getState, dispatch}) => {
    let response = await _fetchGeoForSite(id)
    if (!response.error) {
      dispatch(setGeoSite(response.data))
    }
  }
)

export const fetchAllGeo = createAsyncThunk(
  `${name}/fetchAllGeo`,
  async (id, {getState, dispatch}) => {
    let response = await _fetchGeofencings()
    if (!response.error) {
      dispatch(setListGeo(response.data))
      return response.data
    }
  }
)

export const createOrUpdateSite = createAsyncThunk(
  `${name}/createOrUpdateSite`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedSite} = getState()[name]

      let data = _args?.label ? _args : _.cloneDeep(selectedSite)

      data.customerID = data?.customerID || data?.Customerid
      if (!isNaN(_args) && _args) {
        data.customerID = _args
      }

      let reqType = data.reqType
      delete data.reqType

      let obj = {
        ...data,
        active: data.active ? 1 : 0,
      }

      let res = null

      // return obj
      res = await _saveSite(obj)

      if (reqType == 'potential_delivered_process') return res
      if (Array.isArray(res.data) && (res.data || [])[0]?.msg == 'Ok') {
        dispatch(fetchSitesClient(data?.Customerid))
        dispatch(setSelectedSite(JSON.parse(res.data[0].worksite)[0]))
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Already exist') {
        dispatch(setExistItem(true))
      }

      return false
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)

export const removeSite = createAsyncThunk(`${name}/removeSite`, async (_arg, {dispatch}) => {
  let res = await _removeSite(_arg?.id)

  dispatch(fetchSitesClient(_arg.Customerid))
})
export const removeGeoFromSite = createAsyncThunk(
  `${name}/removeGeoFromSite`,
  async (_arg, {dispatch}) => {
    let res = await _removeSite(_arg?.id)

    dispatch(fetchSites())
  }
)

export const addGeoToSite = createAsyncThunk(
  `${name}/addGeoToSite`,
  async (_arg, {getState, dispatch}) => {
    try {
      let {selectedSite} = getState()[name]

      // let data = _.cloneDeep(selectedEnginTag)
      let obj = {
        src: 'worksite',
        srcId: selectedSite.id, //worksite
        objId: _arg.id, //geofence
        obj: 'geofence',
      }

      let res = null

      res = await _relationAdd(obj)

      if (Array.isArray(res.data) && (res.data || [])[0]?.result === 'Ok') {
        dispatch(fetchGeoForSite(selectedSite.id))
        return true
      }
      return false
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)

// export const removeGeoFromSite = createAsyncThunk(`${name}/removeSite`, async (_arg, {dispatch}) => {
//   let res = await _removeSite(_arg?.id)

//   dispatch(fetchSites())
// })

//Actions
export const setAddresses = createAction(`${name}/fetchAddresses`)
export const setEditAddress = createAction(`${name}/setEditAddress`)
export const setSites = createAction(`${name}/fetchSites`)
export const setSelectedSite = createAction(`${name}/setSelectedSite`)
export const setEditSite = createAction(`${name}/setEditSite`)
export const setExistItem = createAction(`${name}/setExistItem`)
export const setDetailSite = createAction(`${name}/setDetailSite`)
export const setLinkTo = createAction(`${name}/setLinkTo`)
export const setShowMap = createAction(`${name}/setShowMap`)
export const setListGeo = createAction(`${name}/setListGeo`)
export const setGeoSite = createAction(`${name}/setGeoSite`)
export const setGeoSiteSelectedSite = createAction(`${name}/setGeoSiteSelectedSite`)
export const setShowMapSite = createAction(`${name}/setShowMapSite`)
export const setSelectedGeoClient = createAction(`${name}/setSelectedGeoClient`)

const SiteSlice = createSlice({
  name,
  initialState: {
    addresses: [],
    editAddress: false,
    sites: [],
    listGeo: [],
    siteGeo: [],
    siteGeoSelected: [],
    selectedSite: null,
    selectedGeoEdit: null,
    showMap: false,
    showMapSite: false,
    editSite: false,
    detail: false,
    linkTo: false,
    alreadyExist: false,
  },
  reducers: {
    setSelectedGeoEdit(state, {payload}) {
      state.selectedGeoEdit = payload
    },
  },
  extraReducers: {
    [setAddresses]: (state, {payload}) => {
      state.addresses = payload
    },
    [setEditAddress]: (state, {payload}) => {
      state.editAddress = payload
    },
    [setSites]: (state, {payload}) => {
      state.sites = payload
    },
    [setSelectedSite]: (state, {payload}) => {
      state.selectedSite = payload
    },
    [setEditSite]: (state, {payload}) => {
      state.editSite = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.alreadyExist = payload
    },
    [setDetailSite]: (state, {payload}) => {
      state.detail = payload
    },
    [setLinkTo]: (state, {payload}) => {
      state.linkTo = payload
    },
    [setListGeo]: (state, {payload}) => {
      state.listGeo = payload
    },
    [setGeoSite]: (state, {payload}) => {
      state.siteGeo = payload
    },
    [setGeoSiteSelectedSite]: (state, {payload}) => {
      state.siteGeoSelected = payload
    },
    [setShowMapSite]: (state, {payload}) => {
      state.showMapSite = payload
    },
    [setShowMap]: (state, {payload}) => {
      state.showMap = payload
    },
  },
})

//selectors
export const getAddresses = (state) => state[name].addresses
export const getEditAddress = (state) => state[name].editAddress
export const getSites = (state) => state[name].sites
export const getSelectedSite = (state) => state[name].selectedSite
export const getEditSite = (state) => state[name].editSite
export const getShowMap = (state) => state[name].showMap
export const getAlreadyExist = (state) => state[name].alreadyExist
export const getDetailSite = (state) => state[name].detail
export const getLinkTo = (state) => state[name].linkTo
export const getListGeo = (state) => state[name].listGeo
export const getGeoSite = (state) => state[name].siteGeo
export const getGeoSiteSelectedSite = (state) => state[name].siteGeoSelected
export const getShowMapSite = (state) => state[name].showMapSite
export const getSelectedGeoEdit = (state) => state[name].selectedGeoEdit

export const {setSelectedGeoEdit} = SiteSlice.actions

export default SiteSlice.reducer
