import _axios from './axios'
import {request as orequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _generatePresence(data) {
  return await request('engin/generationData', {
    method: 'POST',
    data,
  })
}
