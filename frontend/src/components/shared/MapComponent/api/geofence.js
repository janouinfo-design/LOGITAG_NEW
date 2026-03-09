import {request, psCoreRequest} from '../../../../api'
export async function _fetchGeofencings() {
  return await request('geofencing/list')
}

export async function _fetchListNavixyLink() {
  return await request('geofencing/list', {data: {geofenceType: 'navixy'}})
}
export async function _fetchGeoPointsLocal(point) {
  return await request(`${point}`)
}

export async function _saveGeofencing(data) {
  return await request('geofencing/save', {
    method: 'POST',
    data,
  })
}
export async function _saveGeoFromNavixy(data) {
  return await request('geofencing/saveNavixy', {
    method: 'POST',
    data,
  })
}

export async function _removeGeofencing(data) {
  return await request('geofencing/remove', {
    method: 'POST',
    data,
  })
}
export async function _removeGeoFromSite(objId) {
  return await request('relation/remove', {
    method: 'POST',
    data: {objId},
  })
}
