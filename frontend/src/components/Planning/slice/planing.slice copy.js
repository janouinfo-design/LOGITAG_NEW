import {createSlice} from '@reduxjs/toolkit'
import {MessageModel} from '../../../_metronic/helpers'
const name = 'planning'

const planningSlice = createSlice({
  name,
  initialState: {
    messages: [],
    userID: null,
  },
  reducers: {
    setMessages: (state, {payload}) => {
      state.messages = payload
    },
    setMessage: (state, {payload}) => {
      state.messages.push(payload)
    },
    setUserID: (state, {payload}) => {
      state.userID = payload
    },
  },
})

export const {setMessages, setMessage, setUserID} = planningSlice.actions

export const getMessages = (state) => state[name].messages
export const getUserID = (state) => state[name].userID

export default planningSlice.reducer
