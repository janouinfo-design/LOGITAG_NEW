import {psCoreRequest, request as orequest} from '../../../../api'
import _axios from './apiinstance'

async function request(url, params) {
  return await orequest(url, params, _axios)
}

export async function _uploadFile(data, options = {}) {
  try {
    let x = Math.floor(Math.random() * 10000000 + 1)
    let res = await _axios.post('file/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        model: options.model || 'upload',
        path: options.path || 'import/uploads',
        name: options?.name || options.srcID + options.desc + options.src + '_' + x + '.png',
      },
    })

    return {success: true, result: res?.data}
  } catch (e) {
    return {success: false, result: e.message}
  }
}

export async function _saveFile(options) {
  return await request('file/save', {
    data: options,
  })
}
