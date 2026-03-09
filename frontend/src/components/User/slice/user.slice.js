import {createSlice, createAction, createAsyncThunk} from '@reduxjs/toolkit'
import {
  _checkUser,
  _login,
  _logOut,
  _signin,
  _getPointAttachement,
  _forgetPassword,
  _saveNewPassword,
} from '../api/index.js'
import {setAlertParams} from '../../../store/slices/alert.slice.js'
import {fetchCompanyAddresses} from '../../Company/slice/company.slice.js'
import {fetchMenus} from '../../Layout/slice/layout.slice.js'
import {setToastParams} from '../../../store/slices/ui.slice.js'

export const name = 'user'
// import { setLayoutParams } from "./layout.slice.js";

export const login = createAsyncThunk(`${name}/login`, async (_args, {dispatch, getState}) => {
  // //dispatch(setLayoutParams({ showLoader: true }))

  try {

    const res = await _login(_args)
    // //dispatch(setLayoutParams({ showLoader: false }))

    if (res?.result?.isError != 1 && res?.result?.key) {
      localStorage.setItem('user', _args.user)
      localStorage.setItem('password', _args.password)
      dispatch(setCurrentUser(res.result))
      localStorage.setItem('token', res?.result?.key)
      localStorage.setItem('psCoreToken', res?.result?.key)
      dispatch(fetchCompanyAddresses())
      dispatch(fetchMenus())
    } else {
      dispatch(
        setAlertParams({
          title: 'AUTHENTIFICATION',
          message: res?.error[0].error || 'Email/Mot de passe incorrect',
          visible: true,
          type: 'message',
        })
      )
    }
    // const cookie = new Cookies()
    return res
  } catch (ex) {
  }
})

export const signIn = createAsyncThunk(`${name}/signIn`, async (_args, {dispatch, getState}) => {
  //dispatch(setLayoutParams({ showLoader: true }))

  const res = await _signin(_args)

  //dispatch(setLayoutParams({ showLoader: false }))

  if (res.success) {
    dispatch(setCurrentUser(res.data))
  }
  // const cookie = new Cookies()
  return res
})

export const checkUser = createAsyncThunk(
  `${name}/checkUser`,
  async (_args, {dispatch, getState}) => {
    //dispatch(setLayoutParams({ showLoader: true }))

    const res = await _checkUser(localStorage.getItem('token'))

    //dispatch(setLayoutParams({ showLoader: false }))

    if (!res.error && res.data?.key) {
      dispatch(fetchMenus())
      dispatch(setCurrentUser(res.data))
      localStorage.setItem('token', res.data.key)
      dispatch(fetchCompanyAddresses())
    } else {
      dispatch(setCurrentUser(null))
    }
    return res
  }
)
export const logout = createAsyncThunk(`${name}/logout`, async (_args, {dispatch, getState}) => {
  try {
    const res = await _logOut()
    dispatch(setCurrentUser(null))
    localStorage.removeItem('token')
  } catch (e) {
    return {error: true, message: e.message}
  }
})

export const fetchUserPointAttachement = createAsyncThunk(
  `${name}/logout`,
  async (_args, {dispatch, getState}) => {
    try {
      const {userID} = getState()[name].currentUser
      let res = await _getPointAttachement(userID)
      res = Array.isArray(res?.result) ? res.result : []


      dispatch(setAttachements(res.map((r) => ({id: r.ID, label: r.Label}))))
    } catch (e) {
      return {error: true, message: e.message}
    }
  }
)

export const forgetPassword = createAsyncThunk(
  `${name}/forgetPassword`,
  async (_args, {dispatch, getState}) => {
    try {
      let res = await _forgetPassword(_args)
      if (!res.error) {
        let typeMsg = res?.data?.[0]?.msg === 'not found' ? 'warn' : 'success'
        dispatch(
          setToastParams({
            show: true,
            severity: typeMsg,
            summary: typeMsg,
            detail: res?.data?.[0]?.msg,
            position: 'top-right',
          })
        )
        return true
      }
    } catch (e) {
      return {error: true, message: e.message}
    }
  }
)
export const saveNewPassword = createAsyncThunk(
  `${name}/saveNewPassword`,
  async (_args, {dispatch, getState}) => {
    try {
      const {userNewPassword} = getState()[name]
      let res = await _saveNewPassword(userNewPassword)
      if (res?.data?.[0]?.msg === 'ok') {
        dispatch(
          setToastParams({
            show: true,
            severity: 'success',
            summary: 'success',
            detail: res?.data?.[0]?.msg || 'success',
            position: 'top-right',
          })
        )
        return true
      }
    } catch (e) {
      return {error: true, message: e.message}
    }
  }
)

export const getCurrentUser = (state) => state[name].currentUser
export const getIsAdmin = (state) => state[name].isAdmin
export const getUserToken = (state) => state[name].userToken
export const getUserAttachements = (state) => state[name].attachements
export const getUserCurrentAttachement = (state) => state[name].currentAttachement

export const userSlice = createSlice({
  initialState: {
    currentUser: null,
    userToken: null,
    isAdmin: false,
    attachements: [],
    currentAttachement: null,
    userNewPassword: null,
  },
  name: name,
  reducers: {
    setUserNewPassword: (state, {payload}) => {
      state.userNewPassword = payload
    },
    setAttachements: (state, {payload}) => {
      state.attachements = payload
    },
    setCurrentAttachement: (state, {payload}) => {
      state.currentAttachement = payload
      localStorage.setItem('attachement', payload?.id)
    },
    setCurrentUser: (state, {payload}) => {
      state.currentUser = payload
      localStorage.setItem('userID', payload?.userID)
    },
    setIsAdmin: (state, {payload}) => {
      state.isAdmin = payload
    },
  },
})

export const {
  setAttachements,
  setCurrentAttachement,
  setCurrentUser,
  setIsAdmin,
  setUserNewPassword,
} = userSlice.actions

export default userSlice.reducer
