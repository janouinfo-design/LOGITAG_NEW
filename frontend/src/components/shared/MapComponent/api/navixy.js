import {navixy} from './axios'
import {request, psCoreRequest} from '../../../../api'

export async function getUser(data) {
  return await navixy('user/auth', {
    method: 'POST',
    data,
  })
}

export async function getGeo(hash) {
  return await navixy(`zone/list?hash=${hash}`)
}

export async function _fetchPointGeo(obj) {
  return await navixy(`zone/point/list?hash=${obj.hash}&zone_id=${obj.geoId}`)
}
export async function _fetchTrackerList(hash) {
  return await navixy(`tracker/list?hash=${hash}`)
}
export async function _fetchCurrentPosOfTracker(hash, trackerId) {
  return await navixy(`/tracker/get_last_gps_point?hash=${hash}&tracker_id=${trackerId}`)
}

export async function _savaUserAuth(user) {
  return await request('User/savenavixy', {
    data: {usernavixy: user.email, passwordnavixy: user.password},
  })
}

export async function _getUserAuth() {
  return await request('User/listnavixy')
}
export async function _removeUserAuth(usernavixy) {
  return await request('User/removenavixy', {data: {usernavixy}})
}
