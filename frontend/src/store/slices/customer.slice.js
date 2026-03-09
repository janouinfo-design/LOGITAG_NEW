import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {CUSTOMER as name} from './config'
import {
  _fetchCustomers,
  _createCustomer,
  _removeCustomer,
  _removeCustomerConfirm,
} from '../../api/index'
import _ from 'lodash'
import {_fetchCustomerAddresses} from '../../components/Company/api/api'
import {_fetchTagsForClient, _removeClientTag} from '../../components/Customer/api'
import {_fetchTagsFree, _relationAdd} from '../../components/Tag/api/api'
import {setTagsFree} from '../../components/Tag/slice/tag.slice'
import {_fetchSites, _fetchSitesClient} from '../../components/Site/api/api'
import {setToastParams} from './ui.slice'
import {setAlertParams} from './alert.slice'

export const fetchCustomers = createAsyncThunk(
  `${name}/fetchCustomers`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchCustomers()

    if (!response.error) dispatch(setCustomers(response.result))

  }
)
export const fetchCustomerAddress = createAsyncThunk(
  `${name}/fetchCustomerAddress`,
  async (_args, {getState, dispatch}) => {
    let {selectedCustomer} = getState()[name]
    let response = await _fetchCustomerAddresses(selectedCustomer.id)
    if (!response.error) dispatch(setCustomerAddress(response.data))
  }
)

export const fetchSitesClient = createAsyncThunk(
  `${name}/fetchSitesClient`,
  async (_args, {getState, dispatch}) => {
    let {selectedCustomer} = getState()[name]
    let response = await _fetchSitesClient(_args === undefined ? selectedCustomer.id : _args)
    if (!response.error) dispatch(setSelectedSiteClient(response.data))
  }
)

// export const fetchTagsFree = createAsyncThunk(
//   `${name}/fetchTagFree`,
//   async (_args, {getState, dispatch}) => {
//     let response = await _fetchTagsFree(0)
//     if (!response.error) dispatch(setTagsFree(response.data))
//   }
// )

export const fetchCustomerTags = createAsyncThunk(
  `${name}/fetchCustomerTags`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTagsForClient(_args)
    if (!response.error) dispatch(setCustomersTags(response.data))
  }
)
export const fetchCustomerTagsFree = createAsyncThunk(
  `${name}/fetchCustomerTags`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTagsForClient(_args)
    if (!response.error) dispatch(setCustomerTagsFree(response.data))
  }
)

export const createOrUpdateCustomer = createAsyncThunk(
  `${name}/createOrUpdateTask`,
  async (imageId, {dispatch, getState}) => {
    try {
      let {selectedCustomer} = getState()[name]

      let data = _.cloneDeep(selectedCustomer)


      // data.id = data.id || 0
      // data.codeClient = selectedCustomer.codeClient

      let obj = {
        ...selectedCustomer,
        NPA: selectedCustomer.NPA,
        id: data.id || 0,
        label: data.label,
        name: data.code,
        imageid: data.imageid || imageId,
      }
      let res = null
      res = await _createCustomer(obj)

      if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Ok') {
        dispatch(fetchCustomers())
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Already exist') {
        dispatch(setExistItem(true))
      }

      return false
    } catch (e) {
      return {error: true, message: e.message}
    }
  }
)

export const addTagToClient = createAsyncThunk(
  `${name}/addTagToClient`,
  async (_args, {getState, dispatch}) => {
    try {
      let {selectedCustomer} = getState()[name]

      // let data = _.cloneDeep(selectedEnginTag)

      let obj = {
        src: 'customer',
        srcId: +selectedCustomer.id,
        objId: +_args,
        obj: 'tag',
      }

      let res = null

      res = await _relationAdd(obj)


      if (Array.isArray(res.data) && (res.data || [])[0]?.result === 'Ok') {
        dispatch(fetchCustomerTags(+selectedCustomer.id))
        return true
      }
      return false
    } catch (e) {
      //   return { error: true, message: e.message }
      return false
    }
  }
)
export const removeClientTag = createAsyncThunk(
  `${name}/removeClientTag`,
  async (_arg, {getState, dispatch}) => {
    try {
      let {selectedCustomer} = getState()[name]
      let objId = {
        idCustomer: +selectedCustomer?.id,
        idTag: _arg.id,
      }
      let res = await _removeClientTag(objId)
      dispatch(fetchCustomerTags(+selectedCustomer?.id))
    } catch (err) {
    }
  }
)

export const removeCustomer = createAsyncThunk(
  `${name}/removeCustomer`,
  async (_arg, {dispatch}) => {
    try {
      let res = await _removeCustomer(_arg?.id)
      if (res.data[0].typeMsg === 'alert') {
        dispatch(
          setAlertParams({
            title: 'Supprimer',
            message: res.data[0].message,
            acceptClassName: 'p-button-danger',
            visible: true,
            accept: async () => {
              let resDelete = await _removeCustomerConfirm(res?.data?.[0]?.id)
              if (resDelete.data[0].typeMsg === 'Success') {
                dispatch(
                  setToastParams({
                    show: true,
                    severity: 'success',
                    summary: 'SUCCESS',
                    detail: resDelete.data[0].msg,
                    position: 'top-right',
                  })
                )
                dispatch(fetchCustomers())
              }
            },
          })
        )
      }
      if (res.data[0].typeMsg === 'success') {
        dispatch(fetchCustomers())
      }
    } catch (e) {
    }
  }
)

export const setCustomers = createAction(`${name}/fetchCustomers`)
export const setCustomerTagsFree = createAction(`${name}/fetchCustomerTagsFree`)
export const setCustomersTags = createAction(`${name}/fetchCustomerTags`)
export const setCustomerAddress = createAction(`${name}/fetchCustomerAddress`)
export const setSelectedCustomer = createAction(`${name}/setSelectedCustomer`)
export const setSelectedSiteClient = createAction(`${name}/setSelectedSiteClient`)
export const setSelectedTagClient = createAction(`${name}/setSelectedTagClient`)
export const setEditCustomer = createAction(`${name}/setEditCustomer`)
export const setTag = createAction(`${name}/setTag`)
export const setDetailShow = createAction(`${name}/setDetailShow`)
export const setAddressDetail = createAction(`${name}/setAddressDetail`)
export const setDetailSiteClient = createAction(`${name}/setDetailSiteClient`)
export const setExistItem = createAction(`${name}/setExistItem`)
export const setEditTagClient = createAction(`${name}/setEditTagClient`)
export const setSelectedGeoClient = createAction(`${name}/setSelectedGeoClient`)
// export const setSelectedGeoClientSelectedSite = createAction(
//   `${name}/setSelectedGeoClientSelectedSite`
// )

const customerSlice = createSlice({
  name,
  initialState: {
    customers: [],
    customerTags: [],
    customerTagsFree: [],
    checkLinkGeo: false,
    selectedGeoClient: null,
    customerAddress: null,
    selectedCustomer: null,
    selectedSiteClient: null,
    selectedTagClient: null,
    editCustomer: false,
    tag: false,
    detailShow: false,
    addressDetail: false,
    detailSiteClient: false,
    editTagClient: false,
    alreadyExist: false,
    selectedGeoClientSelectedSite: null,
  },
  reducers: {
    setSelectedGeoClientSelectedSite: (state, {payload}) => {
      state.selectedGeoClientSelectedSite = payload
    },
    setCheckLinkGeo: (state, {payload}) => {
      state.checkLinkGeo = payload
    },
  },
  extraReducers: {
    [setCustomers]: (state, {payload}) => {
      state.customers = payload
    },
    [setCustomersTags]: (state, {payload}) => {
      state.customerTags = payload
    },
    [setCustomerAddress]: (state, {payload}) => {
      state.customerAddress = payload
    },
    [setSelectedCustomer]: (state, {payload}) => {
      state.selectedCustomer = payload
    },
    [setSelectedSiteClient]: (state, {payload}) => {
      state.selectedSiteClient = payload
    },
    [setEditCustomer]: (state, {payload}) => {
      state.editCustomer = payload
    },
    [setDetailShow]: (state, {payload}) => {
      state.detailShow = payload
    },
    [setEditTagClient]: (state, {payload}) => {
      state.editTagClient = payload
    },
    [setAddressDetail]: (state, {payload}) => {
      state.addressDetail = payload
    },
    [setTag]: (state, {payload}) => {
      state.tag = payload
    },
    [setDetailSiteClient]: (state, {payload}) => {
      state.detailSiteClient = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.alreadyExist = payload
    },
    [setCustomerTagsFree]: (state, {payload}) => {
      state.customerTagsFree = payload
    },
    [setSelectedTagClient]: (state, {payload}) => {
      state.selectedTagClient = payload
    },
    [setSelectedGeoClient]: (state, {payload}) => {
      state.selectedGeoClient = payload
    },
    // [setSelectedGeoClientSelectedSite]: (state, {payload}) => {
    //   state.selectedGeoClientSelectedSite = payload
    // },
  },
})

export const getCustomers = (state) => state[name].customers
export const getCustomerTags = (state) => state[name].customerTags
export const getCustomerAddress = (state) => state[name].customerAddress
export const getSelectedCustomer = (state) => state[name].selectedCustomer
export const getSelectedSiteClient = (state) => state[name].selectedSiteClient
export const getSelectedTagClient = (state) => state[name].selectedTagClient
export const getEditCustomer = (state) => state[name].editCustomer
export const getDetailShow = (state) => state[name].detailShow
export const getTag = (state) => state[name].tag
export const getDetailTagClient = (state) => state[name].editTagClient
export const getAddressDetail = (state) => state[name].addressDetail
export const getDetailSiteClient = (state) => state[name].detailSiteClient
export const getAlreadyExist = (state) => state[name].alreadyExist
export const getCustomerTagsFree = (state) => state[name].customerTagsFree
export const getSelectedGeoClient = (state) => state[name].selectedGeoClient
export const getSelectedGeoClientSelectedSite = (state) => state[name].selectedGeoClientSelectedSite
export const getCheckLinkGeo = (state) => state[name].checkLinkGeo

export const {setSelectedGeoClientSelectedSite, setCheckLinkGeo} = customerSlice.actions

export default customerSlice.reducer
