import {request} from '../../../api'

export async function _fetchGateways(role) {
  return await request('device/list')
}

export async function _createOrUpdateGateway(data) {
  return await request(`device/save`, {
    method: 'post',
    data,
  })
}

export async function _gatewayLinkGeofence(data) {
  return await request(`device/link`, {
    method: 'post',
    data,
  })
}

export async function _removeGateway(data) {
  return await request(`device/remove`, {
    method: 'post',
    data,
  })
}

export async function _fetchGatewayType(data) {
  return await request(`types/typeItemsList`, {
    method: 'post',
    data,
  })
}

export async function _deleteGateway(data) {
  return await request(`device/delete`, {
    method: 'post',
    data,
  })
}

export async function _changeGatewayStatus(data) {
  return await request(`device/updateStatus`, {
    method: 'post',
    data,
  })
}
