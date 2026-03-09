import _axios from './axios'
import {request as orequest} from '../../../api/index.js'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _login(credentials) {
  return await request(`user/login`, {
    method: 'post',
    data: credentials,
  })
}

export async function _signin(credentials) {
  return await request(`user/signin`, {
    method: 'post',
    data: credentials,
  })
}

export async function _forgetPassword(data) {
  return await request(`staff/resetUser`, {
    method: 'post',
    data: data,
  })
}

export async function _logOut(userId) {
  return await request(`user/logout`)
}

export async function _checkUser(token) {
  return await request(`user/checkUserToken`, {
    method: 'post',
    data: {token},
  })
}

export async function _getPointAttachement(user) {
  return await request(`user/getPointAttachement`, {
    method: 'post',
    data: {user},
  })
}
export async function _saveNewPassword(data) {
  return await request(`staff/resetSave`, {
    method: 'post',
    data: data,
  })
}
