import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _fetchObject() {
  return await request('types/typeItemsList', {data: {src: 'StatusTypes'}})
}

export async function _fetchStatus(args) {
  return await request('types/trcStatusList', {data: {id: 0, src: args.name}})
}

export async function _updateStatus(data) {
  return await request('status/save', {
    method: 'post',
    data,
  })
}

export async function _fetchTransitions(data) {
  return await request('status/transitions', {
    method: 'post',
    data,
  })
}

