import {createSlice, createAction} from '@reduxjs/toolkit'

import {ALERT as name} from './config.js'

export const setAlertParams = createAction(`${name}/setParams`)
export const getAlertParams = (state) => state.alert.params

export const alertSlice = createSlice({
  initialState: {
    params: {
      message: 'Message',
      visible: false,
      icon: 'pi pi-exclamation-triangle',
      title: 'Confirmation',
      onHide: null,
      onShow: null,
      rejectClassName: 'hidden bg-blue-500',
      accept: null,
      reject: null,
      className: 'text-red-400',
      acceptClassName: null,
    },
    errorParam: {
      message: 'Ok',
      header: 'Confirmation',
      icon: 'pi-exclamation-triangle',
    },
  },
  name,
  reducers: {
    setAlertError(state, {payload}) {
      state.errorParam = {
        ...state.errorParam,
        ...payload,
      }
    },
  },
  extraReducers: {
    [setAlertParams]: (state, {payload}) => {
      state.params = {...state.params, ...payload}

      if (payload.type == 'message') {
        state.params.rejectClassName = 'hidden'
        state.params.acceptLabel = 'OK'
        if (payload.action == 'success') {
          state.params.message = payload.message || 'Operation réussi !!!'
          state.params.title = payload.title || 'Succès'
        }
        if (payload.action == 'error') {
          state.params.message = payload.message || 'Operation échouée !!!'
          state.params.title = payload.title || 'Echec'
        }
      } else {
        delete state.params.rejectClassName
        state.params.message = state.params.message || 'Alert'
        state.params.title = state.params.title || 'Alert'
      }
    },
  },
})

export const getAlertError = (state) => state[name].errorParam

export const {setAlertError} = alertSlice.actions

export default alertSlice.reducer
