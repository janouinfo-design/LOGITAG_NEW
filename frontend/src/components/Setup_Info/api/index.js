import _axios from './axios'
import {request as orequest, psCoreRequest} from '../../../api'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

// start olang

export async function _saveSetupInfo(data) {
  return await request('company/savesetup', {
    method: 'POST',
    data,
  })
}
