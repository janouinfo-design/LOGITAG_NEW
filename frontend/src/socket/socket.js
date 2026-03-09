import {io} from 'socket.io-client'
import {socketEvents} from './event'

let params = {}
if (process.env.REACT_APP_SOCKET_URL) {
  params.path = process.env.REACT_APP_SOCKET_ROOT
}
export const socket = io(process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL, params)

let isBind = false

export const bindEvents = (dispatch) => {
  try {
    console.log('socket:', socket)
    if (!socket.connected || isBind) return
    localStorage.setItem('x-socket', socket.id)
    for (let event in socketEvents) {
      socket.off(event, (dt) => socketEvents[event](dt, dispatch))
      socket.on(event, (dt) => socketEvents[event](dt, dispatch, socket.id))
    }

    isBind = true
  } catch (e) {
    console.error('error binding events:', e)
  }
}

export const unbindEvents = () => {
  try {
    if (typeof socket.off != 'function') return

    for (let event in socketEvents) {
      socket.off(event, socketEvents[event])
    }
    isBind = false
  } catch (e) {
    console.error('error unbinding events:', e)
  }
}
