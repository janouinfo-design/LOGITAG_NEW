import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {RAPPORT as name} from '../../../store/slices/config'
import {_fetchEngines} from '../../Engin/api/api'
import {_fetchSites} from '../../Site/api/api'
import {
  _buildRapport,
  _deleteRapport,
  _fetchCalendarWork,
  _fetchDetailPresence,
  _fetchDetailsWeek,
  _fetchEnginesRapport,
  _fetchListRpt,
  _fetchStatusRapport,
  _fetchTimeStatus,
  _fetchUserHistoric,
  _fetchWeekTime,
  _generateReport,
  _generateReportCsv,
  _getListRpt,
  _updateTimeStatus,
} from '../api'
import moment from 'moment'
import {setToastParams} from '../../../store/slices/ui.slice'
import * as _ from 'lodash'
import {setAlertError} from '../../../store/slices/alert.slice'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchListRapport = createAsyncThunk(
  `${name}/fetchListRapport`,
  async (_args, {getState, dispatch}) => {
    dispatch(setListSelected([]))
    if (_args === 'engin') {
      let res = await _fetchEnginesRapport({IDCustomer: 0, displayMap: 1})
      if (!res.error) {
        dispatch(setListRapport(res.data))
        dispatch(setLoadingRpt(false))
      }
    } else {
      let res = await _fetchSites({IDCustomer: 0})
      if (!res.error) {
        dispatch(setListRapport(res.data))
        dispatch(setLoadingRpt(false))
      }
    }
  }
)

export const fetchCalendarWork = createAsyncThunk(
  `${name}/fetchCalendarWork`,
  async (_args, {getState, dispatch}) => {
    try {
      let res = await _fetchCalendarWork(_args)
      if (!res.error) {
        dispatch(setCalendarWork(res))
      }
    } catch (err) {}
  }
)

export const fetchListRpt = createAsyncThunk(
  `${name}/fetchListRpt`,
  async (_args, {getState, dispatch}) => {
    let res = await _fetchListRpt()
    if (!res.error) {
      dispatch(setListRpt(res.data))
    }
  }
)

export const fetchWeekTime = createAsyncThunk(
  `${name}/fetchWeekTime`,
  async (_args, {getState, dispatch}) => {
    try {
      let res = await _fetchWeekTime(_args)
      if (!res.error) {
        dispatch(setWeekTime(res.data))
      }
    } catch (err) {
      console.log('fetchWeekTime err', err)
    }
  }
)

export const fetchUserHistoric = createAsyncThunk(
  `${name}/fetchUserHistoric`,
  async (_args, {getState, dispatch}) => {
    try {
      let res = await _fetchUserHistoric(_args)
      if (!res.error) {
        if (res?.data?.length === 0) {
          dispatch(
            setToastParams({
              show: true,
              severity: 'warn',
              summary: 'WARNING',
              detail: 'Historique vide',
              position: 'top-right',
            })
          )
          return false
        }
        dispatch(setUserHistoric(res.data))
        return true
      }
      return false
    } catch (err) {
      console.log('fetchUserHistoric err', err)
    }
  }
)

export const fetchDetailWeek = createAsyncThunk(
  `${name}/fetchDetailWeek`,
  async (_args, {getState, dispatch}) => {
    try {
      let res = await _fetchDetailsWeek(_args)
      if (!res.error) {
        dispatch(setDetailWeek(res.data?.[0] || []))
      }
    } catch (err) {}
  }
)

export const fetchDetailPresence = createAsyncThunk(
  `${name}/fetchDetailPresence`,
  async (_args, {getState, dispatch}) => {
    try {
      let {selectedDataUser} = getState()[name]
      if (!_args) {
        console.log('selectedDataUser no args', selectedDataUser)
        _args = selectedDataUser
      }
      dispatch(setSelectedDataUser(_args))
      let res = await _fetchDetailPresence(_args)
      console.log('_fetchDetailPresence', res)
      if (!res.error) {
        dispatch(setDetailPresence(res?.data || []))
      }
    } catch (err) {}
  }
)

export const fetchTimeStatus = createAsyncThunk(
  `${name}/fetchTimeStatus`,
  async (_args, {getState, dispatch}) => {
    try {
      let res = await _fetchTimeStatus(_args)
      console.log('_fetchTimeStatus', res)
      if (!res.error) {
        let filteredData = res?.data?.filter((item) => item.name !== 'end')
        console.log('filteredData', filteredData)
        dispatch(setTimeStatus(filteredData))
      }
    } catch (err) {
      console.log('fetchTimeStatus err', err)
    }
  }
)

export const updateTimeStatus = createAsyncThunk(
  `${name}/updateTimeStatus`,
  async (_args, {getState, dispatch}) => {
    try {
      let {updateTimeSt} = getState()[name]
      let res = await _updateTimeStatus(_args)
      console.log('_updateTimeStatus', res)
      if (res?.data?.[0]?.typeMsg === 'Error') {
        // dispatch(
        //   setToastParams({
        //     show: true,
        //     severity: 'error',
        //     summary: 'ERROR',
        //     detail: res?.data?.[0]?.msg,
        //     position: 'top-right',
        //   })
        // )
        dispatch(
          setAlertError({
            header: 'Alert',
            message: res?.data?.[0]?.msg,
            acceptClassName: 'p-button-success',
            icon: 'pi pi-exclamation-triangle',
            visible: true,
            accept: () => {
              dispatch(setAlertError({visible: false}))
            },
          })
        )
        return false
      }
      if (res?.data?.[0]?.typeMsg === 'Success') {
        dispatch(fetchDetailPresence())
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: res?.data?.[0]?.msg,
            position: 'top-right',
          })
        )
        return true
      }
    } catch (err) {
      console.log('updateTimeStatus err', err)
    }
  }
)

export const fetchListRptById = createAsyncThunk(
  `${name}/fetchListRptById`,
  async (_args, {getState, dispatch}) => {
    let res = await _getListRpt({id: _args})
    if (!res.error) {
      dispatch(setDataRapport(res || []))
      return true
    }
  }
)

export const generateRapportUser = createAsyncThunk(
  `${name}/generateRapportUser`,
  async (_args, {getState, dispatch}) => {
    try {
      const res = await _generateReport(_args)
      if (!res.error) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Rapport bien enregistré',
            position: 'top-right',
          })
        )
        let loading = true
        let rapportSat = null

        console.log('res generateRapportUser', res)

        while (loading) {
          rapportSat = await _fetchStatusRapport({id: res?.data?.[0]?.generatorId})
          if (rapportSat?.data?.[0]?.status === 1) {
            loading = false
            window.open(res?.data?.[0]?.filepath, '_blank')
            dispatch(setLoadingRptUser(false))
          } else {
            await delay(3000) // 3-second delay between requests
          }
        }
      } else {
        dispatch(
          setToastParams({
            show: true,
            severity: 'error',
            summary: 'ERROR',
            detail: 'Une erreur est survenue',
            position: 'top-right',
          })
        )
        dispatch(setLoadingRptUser(false))
      }
    } catch (err) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'ERROR',
          detail: 'Une erreur est survenue',
          position: 'top-right',
        })
      )
      dispatch(setLoadingRptUser(false))
    }
  }
)

export const generateRapportUserCsv = createAsyncThunk(
  `${name}/generateRapportUserCsv`,
  async (_args, {getState, dispatch}) => {
    try {
      const res = await _generateReportCsv(_args)
      if (!res.error) {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'SUCCESS',
            detail: 'Rapport bien enregistré',
            position: 'top-right',
          })
        )
        let loading = true
        let rapportSat = null

        console.log('res generateRapportUserCsv', res)

        while (loading) {
          rapportSat = await _fetchStatusRapport({id: res?.data?.[0]?.ID})
          if (rapportSat?.data?.[0]?.status === 1) {
            loading = false
            window.open(res?.data?.[0]?.path, '_blank')
            dispatch(setLoadingRptUser(false))
          } else {
            await delay(3000) // 3-second delay between requests
          }
        }
      } else {
        dispatch(
          setToastParams({
            show: true,
            severity: 'error',
            summary: 'ERROR',
            detail: 'Une erreur est survenue',
            position: 'top-right',
          })
        )
        dispatch(setLoadingRptUser(false))
      }
    } catch (err) {
      dispatch(
        setToastParams({
          show: true,
          severity: 'error',
          summary: 'ERROR',
          detail: 'Une erreur est survenue',
          position: 'top-right',
        })
      )
      dispatch(setLoadingRptUser(false))
    }
  }
)

export const deleteRapport = createAsyncThunk(
  `${name}/deleteRapport`,
  async (_args, {getState, dispatch}) => {
    let res = await _deleteRapport({id: _args})
    if (!res.error) {
      dispatch(fetchListRpt())
      return true
    }
  }
)

export const saveRapport = createAsyncThunk(
  `${name}/saveRapport`,
  async (_args, {getState, dispatch}) => {
    const {selectedRapport, listSelected} = getState()[name]
    let begDate = moment(_args.date[0]).format('YYYY-MM-DD')
    let endDate = moment(_args.date[1]).format('YYYY-MM-DD')

    let obj = {
      ref: listSelected,
      object: selectedRapport.decs,
      begDate: begDate,
      endDate: endDate,
      title: _args?.title,
    }
    const res = await _buildRapport(obj)

    dispatch(
      setToastParams({
        show: true,
        severity: 'success',
        summary: 'SUCCESS',
        detail: 'Rapport bien enregistré',
        position: 'top-right',
      })
    )

    if (!res.error) {
      dispatch(setLoadingRapport(true))
      dispatch(setChoseRapport(false))
      dispatch(setShowSettingRapport(false))
      dispatch(setDataRapport(res?.res || []))

      let loading = true
      let rapportSat = null

      while (loading) {
        rapportSat = await _fetchStatusRapport({id: res?.generatorId})
        if (rapportSat?.data?.[0]?.status === 1) {
          loading = false
          dispatch(setLoadingRapport(false))
          window.open(res?.filepath, '_blank')
        } else {
          await delay(3000) // 3-second delay between requests
        }
      }
    }
  }
)

const initialState = {
  choseRapport: false,
  showSettingRapport: false,
  listRapport: [],
  listSelected: [],
  dataRapport: [],
  listRpt: [],
  weekTime: [],
  detailWeek: [],
  calendarWork: [],
  detailPresence: [],
  timeStatus: [],
  userHistoric: [],
  selectedDataUser: null,
  updateTimeSt: false,
  loadingRapport: false,
  loading: false,
  loadingRptUser: false,
  addTimeVisible: {
    visible: false,
    data: null,
  },
  selectedRapport: {
    title: '',
    icon: '',
    decs: '',
  },
  dataFilter: {},
}

const rapportsSlice = createSlice({
  name,
  initialState,
  reducers: {
    setSelectedDataUser: (state, {payload}) => {
      state.selectedDataUser = payload
    },
    setUserHistoric: (state, {payload}) => {
      state.userHistoric = payload
    },
    setDataFilter: (state, {payload}) => {
      state.dataFilter = payload
    },
    setChangeStaffStatus: (state, {payload}) => {
      if (!Array.isArray(state.calendarWork) || !Array.isArray(state.timeStatus)) return
      console.log('cccc payload', payload)
      let data = _.cloneDeep(state.calendarWork)
      console.log('cccc data', data)
      let finsSt = state.timeStatus.find((item) => item.name === payload.statusCode)
      console.log('cccc finsSt', finsSt)
      data.map((item) => {
        if (item.UserId == payload.staffId) {
          console.log('cccc item', item)
          item.statusColor = payload.statusColor
        }
      })
      state.calendarWork = data
    },
    setUpdateTimeSt: (state, {payload}) => {
      state.updateTimeSt = payload
    },
    setAddTimeVisible: (state, {payload}) => {
      state.addTimeVisible = {
        ...state.addTimeVisible,
        ...payload,
      }
    },
    setTimeStatus: (state, {payload}) => {
      state.timeStatus = payload
    },
    setLoadingRptUser: (state, {payload}) => {
      state.loadingRptUser = payload
    },
    setDetailPresence: (state, {payload}) => {
      state.detailPresence = payload
    },
    setChoseRapport: (state, {payload}) => {
      state.choseRapport = payload
    },
    setListSelected: (state, {payload}) => {
      state.listSelected = payload
    },
    setShowSettingRapport: (state, {payload}) => {
      state.showSettingRapport = payload
    },
    setDetailWeek: (state, {payload}) => {
      state.detailWeek = payload
    },
    setWeekTime: (state, {payload}) => {
      state.weekTime = payload
    },
    setCalendarWork: (state, {payload}) => {
      state.calendarWork = payload
    },
    setListRpt(state, {payload}) {
      state.listRpt = payload
    },
    setSelectedRapport: (state, {payload}) => {
      state.selectedRapport = {
        ...state.selectedRapport,
        ...payload,
      }
    },
    setListRapport: (state, {payload}) => {
      state.listRapport = payload
    },
    setDataRapport: (state, {payload}) => {
      state.dataRapport = payload
    },
    setLoadingRpt: (state, {payload}) => {
      state.loading = payload
    },
    setLoadingRapport: (state, {payload}) => {
      state.loadingRapport = payload
    },
  },
})

export const getChoseRapport = (state) => state[name].choseRapport
export const getShowSettingRapport = (state) => state[name].showSettingRapport
export const getSelectedRapport = (state) => state[name].selectedRapport
export const getListRapport = (state) => state[name].listRapport
export const getLoadingRpt = (state) => state[name].loading
export const getListSelected = (state) => state[name].listSelected
export const getDataRapport = (state) => state[name].dataRapport
export const getLoadingRapport = (state) => state[name].loadingRapport
export const getListRpt = (state) => state[name].listRpt
export const getWeekTime = (state) => state[name].weekTime
export const getDetailWeek = (state) => state[name].detailWeek
export const getCalendarWork = (state) => state[name].calendarWork
export const getDetailPresence = (state) => state[name].detailPresence
export const getLoadingRptUser = (state) => state[name].loadingRptUser
export const getTimeStatus = (state) => state[name].timeStatus
export const getUpdateTimeSt = (state) => state[name].updateTimeSt
export const getAddTimeVisible = (state) => state[name].addTimeVisible
export const getDataFilter = (state) => state[name].dataFilter
export const getUserHistoric = (state) => state[name].userHistoric
export const getSelectedDataUser = (state) => state[name].selectedDataUser

export const {
  setUserHistoric,
  setSelectedDataUser,
  setChangeStaffStatus,
  setChoseRapport,
  setDetailWeek,
  setCalendarWork,
  setShowSettingRapport,
  setSelectedRapport,
  setListRapport,
  setLoadingRapport,
  setDataFilter,
  setDataRapport,
  setLoadingRpt,
  setListSelected,
  setWeekTime,
  setListRpt,
  setDetailPresence,
  setLoadingRptUser,
  setTimeStatus,
  setUpdateTimeSt,
  setAddTimeVisible,
} = rapportsSlice.actions
export default rapportsSlice.reducer
