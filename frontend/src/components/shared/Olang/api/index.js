import _axios  from './axios'
import { request as orequest} from '../../../../api';

async function request(url, params) {
    return await orequest(url , params , _axios)
}

// start olang

export async function  _fetchLangs(){
    return await request('list')
}

export async function _saveLang(data){
    return await request('save' , {
        method: 'POST',
        data
    })
}