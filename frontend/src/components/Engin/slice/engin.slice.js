import {createSlice, createAsyncThunk, createAction, current} from '@reduxjs/toolkit'
import {ENGINE as name} from '../../../store/slices/config'
import _ from 'lodash'
import {
  _activateEngine,
  _activateObject,
  _checkFileGenerate,
  _deleteEngine,
  _deleteObject,
  _fetchEnginListHistory,
  _fetchEnginListHistoryFromFlespi,
  _fetchEngines,
  _fetchEnginsModels,
  _fetchInactiveEngin,
  _fetchObjectsNoActive,
  _fetchPotentialDeliveredHistory,
  _fetchStatusList,
  _fetchStatusListHistory,
  _fetchTypeList,
  _generateFile,
  _getEngById,
  _getGeoByIdGeo,
  _modifyStatus,
  _removeEngine,
  _saveEngine,
  _tagPosition,
} from '../api/api'
import {socket} from '../../../socket/socket'
import {_getGeoByIdSite, _saveEngineTypes} from '../../../api'
import {setToastParams} from '../../../store/slices/ui.slice'

export const fetchEngines = createAsyncThunk(
  `${name}/fetchEngines`,
  async (_args, {getState, dispatch}) => {
    try {
      const {engines} = getState()[name]
      if (!_args)
        _args = {
          SortDirection: 'DESC',
          SortColumn: 'lastSeenAt',
          page: 1,
        }
      let response = await _fetchEngines(_args)
      if (!response.error) {
        let data = _.cloneDeep(response.data)
        // if (engines?.length > 0 && _args?.page > 1) {
        //   let mergeData = data.concat(engines)
        //   let uniqueData = _.uniqBy(mergeData, 'id')
        //   dispatch(setEngines(uniqueData))
        //   return response.data[data.length - 1].isLastPage == 1 ? true : false
        // } else {
        //   dispatch(setEngines(response?.data))
        // }
        dispatch(setEngines(data))
        return data
      } else {
        dispatch(setEngines([]))
      }
    } catch (error) {}
  }
)

export const fetchEngById = createAsyncThunk(
  `${name}/fetchEngById`,
  async (_args, {getState, dispatch}) => {
    try {
      const {engines} = getState()[name]
      if (!_args) _args = {}
      let response = await _getEngById(_args)
      if (!response.error) {
        let data = _.cloneDeep(response.data)
        const mergeData = [data[0], ...engines]
        const uniqueData = _.uniqBy(mergeData, 'id')
        dispatch(setEngines(uniqueData))
        return data
      }
      return []
    } catch (error) {return false}
  }
)

export const fetchEnginesMap = createAsyncThunk(
  `${name}/fetchEnginesMap`,
  async (_args, {getState, dispatch}) => {
    try {
      const {engines} = getState()[name]
      if (!_args) _args = {}
      let response = await _fetchEngines(_args)
      if (!response.error) {
        let data = _.cloneDeep(response.data)

        return data
      }
      return []
    } catch (error) {}
  }
)

export const modifyStatus = createAsyncThunk(
  `${name}/modifyStatus`,
  async (_args, {getState, dispatch}) => {
    try {
      const {selectedEngine} = getState()[name]

      let obj = {
        ..._args,
        id: selectedEngine?.id,
        locationObject: 'worksite',
        lat: _args.centerModify?.[0] || selectedEngine?.last_lat || 0,
        lng: _args.centerModify?.[1] || selectedEngine?.last_lng || 0,
      }
      let response = await _modifyStatus(obj)
      if (!response.error) {
        let objInfo = {
          srcId: selectedEngine?.id,
          srcObject: 'engin',
        }
        dispatch(fetchStatusHistoric(objInfo))
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Statut mis à jour',
            position: 'top-right',
          })
        )
        return true
      }
      return false
    } catch (error) {}
  }
)

export const fetchStatusList = createAsyncThunk(
  `${name}/fetchTypesList`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchStatusList('fr')
    if (!response.error) {
      dispatch(setStatusList(response.data))
      return
    }
    dispatch(setStatusList([]))
  }
)

export const getGeoByIdGeo = createAsyncThunk(
  `${name}/getGeoByIdGeo`,
  async (_args, {getState, dispatch}) => {
    let response = await _getGeoByIdGeo(_args)
    if (!response.error) {
      dispatch(setGeoByIdSite(response.data))
    }
  }
)

export const generateEngFile = createAsyncThunk(
  `${name}/generateEngFile`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _generateFile(_args)
      if (!response.error) {
        return response.data
      }
    } catch (e) {}
  }
)
export const checkGeneratedFile = createAsyncThunk(
  `${name}/checkGeneratedFile`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _checkFileGenerate(_args)
      if (!response.error) {
        return response.data
      }
    } catch (e) {}
  }
)

export const fetchObjectsNonActive = createAsyncThunk(
  `${name}/fetchObjectsNonActive`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchObjectsNoActive()
      if (!response.error) {
        dispatch(setObjectsNoActive(response.data))
      }
    } catch (e) {
      alert(e)
    }
  }
)

export const fetchEnginListHistory = createAsyncThunk(
  `${name}/fetchEnginListHistory`,
  async (_args, {getState, dispatch}) => {
    let response = null
    try {
      if (_args.srcMouvement == 'pos') {
        let params = {
          reverse: 1,
          grouBy: 'dateFormated',
          fields:
            'locationName,LocationID,timestamp,address,dateFormated,lat,lng,userID,enginId,gateway,enginState,locationGeometry,nearestLocationName,macAddr,gateway,enginStateName,engin,user,userID',
        }
        if (_args?.srcId) params.enginId = `[${_args?.srcId}]`
        response = await _fetchEnginListHistoryFromFlespi(params) //_fetchEnginListHistory(_args)
        if (response) {
          // if (Array.isArray(response.response)) {
          //   response.response = response.response.map((o) => ({
          //     ...o,
          //     enginState: o.locationName ? 'reception' : 'exit',
          //     enginStateName: o.locationName ? 'Entrée' : 'Sortie',
          //   }))
          // } else {
          //   response.response = []
          // }

          // let list = groupePositionHistories(response.response)
          // dispatch(setEnginListHistory(list))

          dispatch(setEnginListHistory(response?.list || response))
          dispatch(setEnginHistoryRoute(response?.route?.route))
        }
      } else {
        response = await _fetchEnginListHistory(_args)
        if (!response.error) dispatch(setEnginListHistory(response.data))
      }
    } catch (error) {}

    return response
  }
)

export const fetchEnginesWorksite = createAsyncThunk(
  `${name}/fetchEnginesWorksite`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchEngines({
        LocationObject: _args.LocationObject,
        LocationID: _args.LocationID,
      })
      if (!response.error) dispatch(setEnginesWorksite(response.data))
    } catch (error) {}
  }
)

export const fetchTypesList = createAsyncThunk(
  `${name}/fetchTypesList`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchTypeList()
      if (!response.error) dispatch(setTypeList(response.data))
    } catch (error) {}
  }
)

export const getGeoByIdSite = createAsyncThunk(
  `${name}/getGeoByIdSite`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _getGeoByIdSite({worksiteID: _args})
      if (!response.error) {
        dispatch(setGeoByIdSite(response.data))
        return response.data
      }
    } catch (error) {}
  }
)

export const fetchPotentialDeliveredHistory = createAsyncThunk(
  `${name}/getGeoByIdSite`,
  async (_args, {getState, dispatch}) => {
    try {
      let response = await _fetchPotentialDeliveredHistory(_args)
      console.log(response, 'response _fetchPotentialDeliveredHistory')
      return response
    } catch (error) {
      return {success: false, response: error.message}
    }
  }
)

export const createOrUpdateEngine = createAsyncThunk(
  `${name}/createOrUpdateEngine`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedEngine} = getState()[name]
      let {typeFields} = getState()[name]

      let data = _.cloneDeep(selectedEngine)

      let filteredData = typeFields.filter((item) => item.type !== '')
      if (Array.isArray(filteredData) && filteredData.length === 0) {
        filteredData = ''
      }

      let obj = {
        // ...data,
        tagName: data?.tagname || '',
        id: data?.id || 0,
        label: data?.reference,
        typeid: data?.typeID || data?.typeid,
        imageid: _args?.imageId || data?.imageid || 0,
        types: filteredData,
        familleId: data?.familleId,
        vin: data?.vin || '',
        infosAdditionnelles: data?.infosAdditionnelles || '',
        model: data?.model || '',
        immatriculation: data?.immatriculation || '',
        brand: data?.brand || '',
        reference: data?.reference || '',
      }
      let res = null
      res = await _saveEngine(obj)

      if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'ok') {
        socket.emit('engin_status_changed', {
          obj,
        })
        dispatch(fetchEngines({}))
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Already exists!') {
        dispatch(setExistItem(true))
      }

      return false
    } catch (e) {
      return false
    }
  }
)

export const createOrUpdateEnginTypes = createAsyncThunk(
  `${name}/createOrUpdateEnginTypes`,
  async (_args, {dispatch, getState}) => {
    try {
      let res = null
      res = await _saveEngineTypes(_args)
      if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'ok') {
        dispatch(fetchEngines({}))
        return true
      }
      //else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Already exists!') {
      //   dispatch(setExistItem(true))
      // }
    } catch (e) {
      return false
    }
  }
)

export const fetchInactiveEngin = createAsyncThunk(
  `${name}/fetchInactiveEngin`,
  async (_args, {dispatch, getState}) => {
    try {
      let res = null
      res = await _fetchInactiveEngin()
      if (!res.error) {
        dispatch(setInactiveEngin(res.data))
        return true
      }
    } catch (e) {
      return false
    }
  }
)

export const saveTagAddress = createAsyncThunk(
  `${name}/fetchDataDashboard`,
  async (_args, {getState, dispatch}) => {
    try {
      let newObj = {
        LocationID: +_args?.locationId,
        lat: +_args?.latitude,
        lng: +_args?.longitude,
        macAddr: _args?.macAddress,
      }
      let response = await _tagPosition({tags: newObj})
      if (response.success) {
        return true
      }
    } catch (error) {}
  }
)

export const removeEngine = createAsyncThunk(`${name}/removeEngine`, async (_arg, {dispatch}) => {
  try {
    let res = await _removeEngine(_arg?.data?.id)
    dispatch(fetchEngines({page: _arg.page, PageSize: _arg.pageSize}))
  } catch (error) {}
})

export const activateEngin = createAsyncThunk(`${name}/activateEngin`, async (_arg, {dispatch}) => {
  try {
    let res = await _activateEngine(_arg)
    if (!res.error) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'success',
          summary: 'SUCCESS',
          detail: res?.data[0]?.msg,
          position: 'top-right',
        })
      )
      dispatch(fetchInactiveEngin())
    }
  } catch (error) {}
})

export const activateObject = createAsyncThunk(
  `${name}/activateObject`,
  async (_arg, {dispatch}) => {
    try {
      let res = await _activateObject(_arg)
      if (!res.error) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: res?.data[0]?.msg,
            position: 'top-right',
          })
        )
        dispatch(fetchObjectsNonActive())
      }
    } catch (error) {}
  }
)

export const fetchStatusHistoric = createAsyncThunk(
  `${name}/fetchStatusHistoric`,
  async (_arg, {dispatch}) => {
    try {
      let res = await _fetchStatusListHistory(_arg)
      if (!res.error) {
        dispatch(setStatusListHistory(res.data))
      }
    } catch (error) {}
  }
)

export const deleteEngin = createAsyncThunk(`${name}/deleteEngin`, async (_arg, {dispatch}) => {
  try {
    let res = await _deleteObject(_arg)
    if (!res.error) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'success',
          summary: 'SUCCESS',
          detail: res?.data[0]?.msg,
          position: 'top-right',
        })
      )
      dispatch(fetchObjectsNonActive())
    }
  } catch (error) {}
})

export const fetchEnginsModels = createAsyncThunk(`${name}/fetchEnginsModels`, async (_arg, {dispatch}) => {
  try {
    let res = await _fetchEnginsModels(_arg)
    if (Array.isArray(res?.result)) {
      dispatch(setEnginsModels(res?.result))
    }
  } catch (error) {

  }
})

function groupePositionHistories(list) {
  try {
    let currentIndex = 0
    let currentLat = null
    let currentLng = null
    let currentLocation = null
    list.forEach((o, idx) => {
      if (
        (o.lat != currentLat || o.lng != currentLng) &&
        (o.LocationID == 0 || (o.LocationID != 0 && o.LocationID !== currentLocation))
      ) {
        currentIndex++
        o.locIndex = currentIndex
        currentLat = o.lat
        currentLng = o.lng
        currentLocation = o.LocationID
      } else {
        o.locIndex = currentIndex
      }
    })

    return _.uniqBy(list, 'locIndex')
  } catch (e) {
    return list
  }
}

//Actions
export const setEngines = createAction(`${name}/fetchEngines`)
export const setEnginListHistory = createAction(`${name}/fetchEnginListHistory`)
export const setEnginesWorksite = createAction(`${name}/fetchEnginesWorksite`)
export const setShow = createAction(`${name}/setShow`)
export const setTypeList = createAction(`${name}/setTypeList`)
export const setSelectedEngine = createAction(`${name}/setSelectedEngine`)
export const setSelectedTag = createAction(`${name}/setSelectedTag`)
export const setEditEngine = createAction(`${name}/setEditEngine`)
export const setEditTagEngin = createAction(`${name}/setEditTagEngin`)
export const setTypeEdit = createAction(`${name}/setTypeEdit`)
export const setTypeFields = createAction(`${name}/setTypeFields`)
export const seTagEdit = createAction(`${name}/seTagEdit`)
export const setExistItem = createAction(`${name}/setExistItem`)

const engineSlice = createSlice({
  name,
  initialState: {
    engines: [],
    geoByIdSite: [],
    statusList: [],
    objectsNoActive: [],
    statusListHistory: [],
    paramCardHis: {
      showList: false,
      title: '',
    },
    enginesHistory: [],
    enginesWorksite: [],
    inactiveEngin: [],
    selectedHistory: null,
    srcMovement: null,
    socketEnterOrExit: null,
    socketStatusChange: null,
    showHistory: false,
    typesList: [],
    typeFields: [],
    selectedTag: null,
    editTag: false,
    show: true,
    selectedEngine: null,
    editEngine: false,
    editTagEngin: false,
    editType: false,
    selectedEnginMap: null,
    existItem: false,
    lastUpdates: [],
    statusVisible: false,
    history_route: null,
    models: [],
  },
  reducers: {
    setSocketEnterOrExit(state, {payload}) {
      state.socketEnterOrExit = payload
      const msg = payload.msg
      const id = payload?.data[0].enginId
      const findEngin = state.engines.find((item) => item.id === id)
      let newObj = {
        ...findEngin,
        etatengin: msg !== 'exit' ? 'Entrée' : 'Exit',
        etatenginname: msg !== 'exit' ? 'reception' : 'exit',
      }
      state.engines = state.engines.map((item) => {
        if (item.id === id) {
          return newObj
        }
        return item
      })
    },
    setEnginHistoryRoute(state, {payload}) {
      state.history_route = payload
    },
    setStatusVisible(state, {payload}) {
      state.statusVisible = payload
    },
    setStatusListHistory(state, {payload}) {
      state.statusListHistory = payload
    },
    setStatusList(state, {payload}) {
      state.statusList = payload
    },
    setGeoByIdSite(state, {payload}) {
      state.geoByIdSite = payload
    },
    setUpdatedEngin(state, {payload}) {
      if (Array.isArray(state.engines) && state.engines.length > 0) {
        const newEngines = state.engines.map((item) => {
          const updatedItem = payload.find(
            (element) => element.id == item.id || element.uid == item.uid
          )
          return updatedItem ? {...item, ...updatedItem} : item
        })
        state.engines = newEngines
      }
    },
    setObjectsNoActive(state, {payload}) {
      state.objectsNoActive = payload
    },
    setInactiveEngin(state, {payload}) {
      state.inactiveEngin = payload
    },
    setParamCadHis(state, {payload}) {
      state.paramCardHis = {...state.paramCardHis, ...payload}
    },
    setSrcMouvement(state, {payload}) {
      state.srcMovement = payload
    },
    setShowHistory(state, {payload}) {
      state.showHistory = payload
    },
    setSelectedHistory(state, {payload}) {
      state.selectedHistory = payload
    },
    setSelectedEnginMap(state, {payload}) {
      state.selectedEnginMap = payload
    },
    setSocketStatusChange(state, {payload}) {
      state.socketStatusChange = payload
      state.engines = state.engines.map((item) => {
        if (item.uid == payload?.newObj.uid) {
          return {...payload?.newObj, iconName: payload.icon, statusbgColor: payload.statusbgColor}
        }
        return item
      })
      return
      const msg = payload?.data[0].typeMsg
      const id = payload?.data[0].enginId
      const findEngin = state.engines.find((item) => item.id === id)
      let newObj = {
        ...findEngin,
        statuslabel: payload?.statuslabel,
        statusname: payload?.statusname,
        statusbgColor: payload?.statusbgColor,
      }
    },
    updateEnginLastSeen(state, {payload}) {
      let data = _.cloneDeep(payload)
      if (!Array.isArray(data) || data?.length == 0) return
      let list = _.cloneDeep(state.lastUpdates)
      let engines = _.cloneDeep(state.engines)

      for (let engin of payload) {
        let eng = list.find(({id}) => id == engin.engin)
        let eng2 = engines.find(({id}) => id == engin.engin)
        if (eng) eng.lastSeenAt = engin.lastSeen
        if (eng2) eng2.lastSeenAt = engin.lastSeen
      }
      state.lastUpdates = list
      state.engines = engines
    },
    setLastEnginUpdates(state, {payload}) {
      let oldState = _.cloneDeep(state.lastUpdates)
      let newState = _.cloneDeep(payload)
      let oldEngins = _.cloneDeep(state.engines)
      if (!Array.isArray(oldState)) oldState = []
      if (!Array.isArray(newState)) newState = []
      if (!Array.isArray(oldEngins)) oldEngins = []

      for (let engin of newState) {
        let eng = oldEngins.find(({id}) => id == engin.id)
        if (eng) {
          for (const [k, v] of Object.entries(engin)) {
            eng[k] = v
          }
          eng.locationDate = engin.lastUpdate
          // eng.lastSeenAt = engin.lastSeenAt
          // eng.lastUpdate = engin.lastUpdate
          // eng.LocationID = engin.LocationID
          // eng.etatenginname = engin.etatenginname
          // eng.etatengin = engin.etatengin
          //
        }
      }
      let list2 = oldEngins.map((t) => {
        let eng = newState.find(({id}) => id == t.id)
        if (eng) {
          for (const [k, v] of Object.entries(eng)) {
            t[k] = v
          }
          // t.locationDate = eng.lastUpdate
          // t.lastSeenAt = eng.lastSeenAt
          // t.lastUpdate = eng.lastUpdate
          // t.LocationID = eng.LocationID
          // t.etatenginname = eng.etatenginname
          // t.etatengin = eng.etatengin
          t.locationDate = eng.lastUpdate
        }
        return t
      })

      state.lastUpdates = newState
      state.engines = oldEngins
    },
    setEnginsModels(state , { payload }){
        state.models = payload
    },

  },
  extraReducers: {
    [setEngines]: (state, {payload}) => {
      state.engines = payload
    },
    [setEnginListHistory]: (state, {payload}) => {
      state.enginesHistory = payload
    },
    [setEnginesWorksite]: (state, {payload}) => {
      state.enginesWorksite = payload
    },
    [setSelectedEngine]: (state, {payload}) => {
      state.selectedEngine = payload
    },
    [setEditEngine]: (state, {payload}) => {
      state.editEngine = payload
    },
    [setTypeList]: (state, {payload}) => {
      state.typesList = payload
    },
    [setShow]: (state, {payload}) => {
      state.show = payload
    },
    [setEditTagEngin]: (state, {payload}) => {
      state.editTagEngin = payload
    },
    [setTypeEdit]: (state, {payload}) => {
      state.editType = payload
    },
    [setTypeFields]: (state, {payload}) => {
      state.typeFields = payload
    },
    [seTagEdit]: (state, {payload}) => {
      state.editTag = payload
    },
    [setSelectedTag]: (state, {payload}) => {
      state.selectedTag = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.existItem = payload
    },
  },
})

//selectors
export const getEngines = (state) => state[name].engines
export const getEnginListHistory = (state) => state[name].enginesHistory
export const getEnginesWorksite = (state) => state[name].enginesWorksite
export const getSelectedEngine = (state) => state[name].selectedEngine
export const getEditEngine = (state) => state[name].editEngine
export const getTypeList = (state) => state[name].typesList
export const getEditTagEngin = (state) => state[name].editTagEngin
export const getShow = (state) => state[name].show
export const getEditType = (state) => state[name].editType
export const getTypeFields = (state) => state[name].typeFields
export const getTagEdit = (state) => state[name].editTag
export const getSelectedTag = (state) => state[name].selectedTag
export const getExistItem = (state) => state[name].existItem
export const getSelectedEnginMap = (state) => state[name].selectedEnginMap
export const getInactiveEngin = (state) => state[name].inactiveEngin
export const getShowHistory = (state) => state[name].showHistory
export const getSrcMouvement = (state) => state[name].srcMovement
export const getSelectedHistory = (state) => state[name].selectedHistory
export const getParamCardHis = (state) => state[name].paramCardHis
export const getGeoByIdPos = (state) => state[name].geoByIdSite
export const getLastEnginsUpdates = (state) => state[name].lastUpdates
export const getStatusList = (state) => state[name].statusList
export const getObjectsNoActive = (state) => state[name].objectsNoActive
export const getStatusVisible = (state) => state[name].statusVisible
export const getStatusListHistory = (state) => state[name].statusListHistory
export const getHistoryRoute = (state) => state[name].history_route
export const getEnginsModels = (state) => state[name].models

//actions
export const {
  setSocketEnterOrExit,
  setStatusListHistory,
  setSocketStatusChange,
  setParamCadHis,
  setUpdatedEngin,
  setSelectedEnginMap,
  setSrcMouvement,
  setSelectedHistory,
  setStatusList,
  setGeoByIdSite,
  setInactiveEngin,
  setShowHistory,
  updateEnginLastSeen,
  setLastEnginUpdates,
  setStatusVisible,
  setObjectsNoActive,
  setEnginHistoryRoute,
  setEnginsModels
} = engineSlice.actions

export default engineSlice.reducer
