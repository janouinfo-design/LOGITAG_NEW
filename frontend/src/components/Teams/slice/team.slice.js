import {createSlice, createAsyncThunk, createAction} from '@reduxjs/toolkit'
import {TEAM as name} from '../../../store/slices/config'
import _ from 'lodash'
import {
  _addTagTeam,
  _fetchTeams,
  _fetchTypeListStaff,
  _getTagTeam,
  _removeTagTeam,
  _removeTeam,
  _saveTeam,
  _saveUser,
} from '../api'
import moment from 'moment'
import {_relationAdd} from '../../Tag/api/api'
import {setToastParams} from '../../../store/slices/ui.slice'

export const fetchTeams = createAsyncThunk(
  `${name}/fetchTeams`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTeams(_args)
    if (!response.error) {
      dispatch(setTeams(response.data))
      return response?.data || []
    }
  }
)

export const fetchTypesStaff = createAsyncThunk(
  `${name}/fetchTypesStaff`,
  async (_args, {getState, dispatch}) => {
    let response = await _fetchTypeListStaff()
    if (!response.error) dispatch(setTypesStaff(response.data))
  }
)

export const fetchStaffTag = createAsyncThunk(
  `${name}/fetchStaffTag`,
  async (_args, {getState, dispatch}) => {
    let response = await _getTagTeam(_args)
    if (!response.error) dispatch(setStaffTag(response.data))
  }
)

export const removeTagTeam = createAsyncThunk(
  `${name}/removeTagTeam`,
  async (_args, {getState, dispatch}) => {
    const {selectedTeam} = getState()[name]

    let response = await _removeTagTeam(_args)
    if (!response.error) {
      let data = _.cloneDeep(selectedTeam)
      let newSelected = {
        ...data,
        relationId: 0,
      }
      dispatch(setSelectedTeamV(newSelected))
      dispatch(fetchTeams())
      dispatch(fetchStaffTag({id: selectedTeam?.id}))
      return true
    }

    return false
  }
)

export const addTagTeam = createAsyncThunk(
  `${name}/addTagTeam`,
  async (_args, {getState, dispatch}) => {
    const {selectedTeam} = getState()[name]
    let response = await _addTagTeam(_args)
    if (!response.error) {
      const data = _.cloneDeep(selectedTeam)
      let newSelected = {
        ...data,
        relationId: response?.data[0]?.relationId,
      }
      dispatch(setSelectedTeamV(newSelected))
      dispatch(fetchStaffTag({id: selectedTeam?.id}))
      dispatch(
        setToastParams({
          show: true,
          severity: response?.data[0]?.typeMsg == 'error' ? 'error' : 'success',
          summary: response?.data[0]?.typeMsg == 'error' ? 'Error' : 'SUCCESS',
          detail: response?.data[0]?.msg,
          position: 'top-right',
        })
      )
      dispatch(fetchTeams())
      return true
    }
  }
)

export const createOrUpdateTeam = createAsyncThunk(
  `${name}/createOrUpdateTeam`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedTeam} = getState()[name]

      let data = _.cloneDeep(selectedTeam)

      let birthday = selectedTeam.birthday
        ? moment(selectedTeam.birthday, 'DD/MM/YYYY').format('DD/MM/YYYY')
        : null
      let hireday = selectedTeam.hireday
        ? moment(selectedTeam.hireday, 'DD/MM/YYYY').format('DD/MM/YYYY')
        : null
      let exitday = selectedTeam.exitday
        ? moment(selectedTeam.exitday, 'DD/MM/YYYY').format('DD/MM/YYYY')
        : null

      let obj = {
        id: data?.id || 0,
        firstname: data?.firstname?.trim() || '',
        lastname: data?.lastname?.trim() || '',
        typeId: _args?.status || data?.typeId,
        active: data?.active == (true || 1) ? 1 : 0,
        hireday: hireday || null,
        birthday: birthday || null,
        exitday: exitday || null,
        imageid: data?.imageid || _args.imageId,
        companyId: data?.companyId || 1,
        departementId: data?.departementId || 0,
      }
      let res = null


      res = await _saveTeam(obj)

      if (Array.isArray(res.data) && (res.data || [])[0]?.typeMsg === 'success') {
        dispatch(fetchTeams())
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Already exist') {
        dispatch(setExistItem(true))
      }
      return false
    } catch (e) {
      return false
    }
  }
)

export const createTeam = createAsyncThunk(
  `${name}/createTeam`,
  async (_args, {dispatch, getState}) => {
    try {
      let birthday = _args.birthday
        ? moment(_args.birthday, 'DD/MM/YYYY').format('YYYY/MM/DD')
        : null
      let hireday = _args.hireday ? moment(_args.hireday, 'DD/MM/YYYY').format('DD/MM/YYYY') : null
      let exitday = _args.exitday ? moment(_args.exitday, 'DD/MM/YYYY').format('DD/MM/YYYY') : null
      let obj = {
        id: 0,
        firstname: _args?.firstname?.trim() || '',
        lastname: _args?.lastname?.trim() || '',
        typeId: _args?.typeName,
        active: _args?.active ? 1 : 0,
        hireday: hireday || null,
        birthday: birthday || null,
        exitday: exitday || null,
        companyId: _args?.companyId || 1,
        departementId: _args?.departementId || 0,
      }
      let res = null


      res = await _saveTeam(obj)

      if (Array.isArray(res.data) && (res.data || [])[0]?.typeMsg === 'success') {
        dispatch(fetchTeams())
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Already exist') {
        dispatch(setExistItem(true))
      }
      return false
    } catch (e) {
      return false
    }
  }
)

export const createOrUpdateUser = createAsyncThunk(
  `${name}/createOrUpdateUser`,
  async (_args, {dispatch, getState}) => {
    try {
      let {selectedTeam} = getState()[name]
      let data = _.cloneDeep(selectedTeam)
      let obj = {
        ...data,
        addrMail: _args?.addrMail?.trim() || data?.addrMail || '',
        login: _args?.firstname?.trim() || data?.firstname || '',
        pass: _args?.pass,
        id: data?.userID || 0,
        rest: _args?.rest ? 1 : 0,
        active: _args?.active ? 1 : 0,
      }
      let res = null


      res = await _saveUser(obj)

      if (Array.isArray(res.data) && (res.data || [])[0]?.typeMsg === 'success') {
        dispatch(fetchTeams())
        return true
      } else if (Array.isArray(res.data) && (res.data || [])[0]?.msg === 'Already exist') {
        dispatch(setExistItem(true))
      }
      return false
    } catch (e) {
      return false
    }
  }
)

export const removeTeam = createAsyncThunk(`${name}/removeTeam`, async (_arg, {dispatch}) => {
  let res = await _removeTeam(_arg?.id)


  dispatch(fetchTeams())
})

//Actions
export const setTeams = createAction(`${name}/fetchTeams`)
export const setTypesStaff = createAction(`${name}/fetchTypesStaff`)
export const setSelectedUser = createAction(`${name}/setSelectedUser`)
export const setEditTeam = createAction(`${name}/setEditTeam`)
export const setEditUser = createAction(`${name}/setEditUser`)
export const setExistItem = createAction(`${name}/setExistItem`)
export const setShow = createAction(`${name}/setShow`)

const teamslice = createSlice({
  name,
  initialState: {
    teams: [],
    staffTypes: [],
    tagStaff: [],
    selectedTeam: null,
    selectedUser: null,
    editTeam: false,
    editUser: false,
    alreadyExist: false,
    show: true,
    tagVisible: false,
  },
  reducers: {
    setStaffTag(state, {payload}) {
      state.tagStaff = payload
    },
    setSelectedTeam(state, {payload}) {
    },
    setSelectedTeamV(state, {payload}) {
      state.selectedTeam = payload
    },
    setTagVisible(state, {payload}) {
      state.tagVisible = payload
    },
  },
  extraReducers: {
    [setTeams]: (state, {payload}) => {
      state.teams = payload
    },

    [setSelectedUser]: (state, {payload}) => {
      state.selectedUser = payload
    },
    [setEditTeam]: (state, {payload}) => {
      state.editTeam = payload
    },
    [setEditUser]: (state, {payload}) => {
      state.editUser = payload
    },
    [setExistItem]: (state, {payload}) => {
      state.alreadyExist = payload
    },
    [setShow]: (state, {payload}) => {
      state.show = payload
    },
    [setTypesStaff]: (state, {payload}) => {
      state.staffTypes = payload
    },
  },
})

//selectors
export const getTeams = (state) => state[name].teams
export const getSelectedTeam = (state) => state[name].selectedTeam
export const getSelectedUser = (state) => state[name].selectedUser
export const getEditTeam = (state) => state[name].editTeam
export const getEditUser = (state) => state[name].editUser
export const getShow = (state) => state[name].show
export const getAlreadyExist = (state) => state[name].alreadyExist
export const getTypesStaff = (state) => state[name].staffTypes
export const getTagVisible = (state) => state[name].tagVisible
export const getTagStaff = (state) => state[name].tagStaff

export const {setSelectedTeam, setSelectedTeamV, setTagVisible, setStaffTag} = teamslice.actions

export default teamslice.reducer
