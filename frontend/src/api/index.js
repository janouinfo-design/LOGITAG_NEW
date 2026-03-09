import _axios, {psCore} from './axios'
const defaultConfigs = {auth_key: '1234', app: 'PSWEB'}

export async function request(url, params, axiosInstance) {
  try {
    axiosInstance = axiosInstance || _axios
    params = Object.keys(params || {}).length > 0 ? params : {}
    params.method = params.method || 'get'
    // if(params.data) params.method = 'post'
    params.data = params.data || {}
    params.params = params.params || {}
    params.headers = params.headers || {}
    params.url = url

    let userInfos = {}
    if (localStorage.getItem('userID'))
      userInfos.userID =
        localStorage.getItem('userID') === 'undefined' ? null : localStorage.getItem('userID')
    if (localStorage.getItem('attachement'))
      userInfos.attachement = localStorage.getItem('attachement')

    const token = sessionStorage.getItem('token')
    params.params = {
      ...params.params,
      ...defaultConfigs,
      userInfos,
    }

    if (params.method?.toLowerCase() == 'get') {
      params.params.data = params.data
    }

    params.data = {...params.data, data: params.data, ...defaultConfigs, userInfos}

    params.headers['Authorization'] = 'Bearer ' + token
    params.headers['x-socket'] = localStorage.getItem('x-socket')
    params.headers.user_infos = JSON.stringify({
      userID:
        localStorage.getItem('userID') === 'undefined' ? null : localStorage.getItem('userID'),
      attachement:
        localStorage.getItem('attachement') === 'undefined'
          ? null
          : localStorage.getItem('attachement'),
    })
    let res = await axiosInstance(url, params)
    res = res || {data: {}}
    // let res = await baseQueryWithReauth(url, params)

    if (typeof res.data != 'string' && res.data) res.data.data = res.data.result

    if ((url.includes('auth/login') || url.includes('auth/verifyUser')) && res.data.success) {
      sessionStorage.setItem('token', res.data.data.accessToken)
    }
    return res.data //{error: false , data: res.data}
  } catch (e) {
    if (e.response.status === 403) {
      let res = await axiosInstance('auth/refresh')
      sessionStorage.setItem('token', res.data.result.accessToken)

      return await request(url, params)
    } else if (e.response.status == 203) {
      window.location = ''
    }
    return {success: false, data: e.message}
  }
}

export async function psCoreRequest(action, params) {
  try {
    params = Object.keys(params || {}).length > 0 ? params : {}
    params.method = params.method || 'get'
    params.data = params.data || {}
    params.params = params.params || {}
    params.url = action

    const token = localStorage.getItem('psCoreToken')
    params.params = {
      ...params.params,
      token: token,
      key: '1234',
      data: JSON.stringify(params.data),
    }

    delete params.data
    let res = await psCore(action, params)

    res = res || {data: {}}

    if (typeof res.data == 'string' && (res.data || '').includes('DOCTYPE'))
      throw new Error('redirection login')

    return {success: true, data: res.data}
  } catch (e) {
    if (e.message == 'redirection login') {
      const user = localStorage.getItem('user')
      const password = localStorage.getItem('password')
      let result = await psCoreRequest('user/auth', {
        data: {
          username: user,
          password: password,
        },
      })

      if (result.data[0].key) {
        localStorage.setItem('psCoreToken', result.data[0].key)
        return await psCoreRequest(action, params)
      }
    }
    return {success: false, data: e.message}
  }
}

/**
 * start customers api
 * @returns
 */
export async function _fetchCustomers(data) {
  return await request('customer/list', {
    method: 'post',
    data,
  })
}
export async function _removeCustomer(id) {
  return await request('customer/remove', {
    method: 'POST',
    data: {id},
  })
}
export async function _removeCustomerConfirm(id) {
  return await request('customer/removeWithWorksite', {
    method: 'POST',
    data: {id},
  })
}

export async function _createCustomer(data) {
  return await request('customer/save', {
    method: 'post',
    data,
  })
}

// end customers api

// start geofence api
export async function _fetchGeofencings() {
  return await request('geofencing/list')
}

export async function _fetchListNavixyLink() {
  return await request('geofencing/list', {data: {geofenceType: 'navixy'}})
}
export async function _fetchGeoPointsLocal(point) {
  return await request(`${point}`)
}

//geofencing/saveDepot?key=1234&data={id:0,label:'geo12',description:'',tags:'',path:'',type:'',depositId:52}
export async function _saveGeofencingDepot(data) {
  return await request('geofencing/saveDepot', {
    method: 'POST',
    data,
  })
}
export async function _saveGeofencing(data) {
  return await request('geofencing/save', {
    method: 'POST',
    data,
  })
}

export async function _getGeoByIdSite(data) {
  return await request('geofencing/GetGeofenceByWorksite', {
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

export async function _saveEngineTypes(data) {
  return await request('engin/saveTypes', {
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

// end geofence api

/**
 * start privder api
 * @returns
 */
export async function _fetchProviders() {
  return await request('provider/list')
}

export async function _createProvider(data) {
  return await request('provider/save', {
    data,
  })
}

// end provider api

export async function _fetchDeposits(data) {
  return await request('deposit/list', {
    method: 'POST',
    data,
  })
}

export async function _saveDeposit(data) {
  return await request('deposit/save', {
    method: 'POST',
    data,
  })
}

export async function _removeDeposit(id) {
  return await request('deposit/remove', {
    method: 'POST',
    data: {id},
  })
}

export async function _fetchStaffs(data) {
  return await request('staff/list', {
    method: 'POST',
    data,
  })
}

export async function _fetchTags() {
  return await request('tag/list', {data: {IDCustomer: 0}})
}

export async function _saveTag(data) {
  return await request('tag/save', {
    method: 'post',
    data,
  })
}

export async function _removeTag(id) {
  return await request('tag/remove', {
    method: 'POST',
    data: {id},
  })
}

// invoice
export async function _fetchInvoices() {
  return await request('invoice/list')
}

export async function _saveInvoice(data) {
  return await request('invoice/save', {
    method: 'post',
    data,
  })
}

export async function _removeInvoice(id) {
  return await request('invoice/remove', {
    method: 'POST',
    data: {id},
  })
}

//invoice fine

export async function _fetchAddressPsCore(src = 'Customer', srcID = 100) {
  return await request('address/list', {data: {src, srcID}})
}

export async function _fetchTagsPsCore() {
  return await request('tag/list', {data: {IDCustomer: 0}})
}

export async function _fetchVehicles() {
  return {}
}

export async function _fetchVehiculesPSCore(data) {
  return await request('vehicule/list', {
    method: 'POST',
    data,
  })
}

export async function _fetchTypes(src) {
  return await request('types/list', {data: {src, LocationObject: '', LocationID: 0}})
}

export async function _fetchValidator(name) {
  return await request('validator/list', {data: {name}})
}

// ;(async () => {
//   let result = await psCoreRequest('user/auth', {
//     data: {
//       username: 'rabi',
//       password: 'UF1ENxhKS48=',
//     },
//   })
// })()
