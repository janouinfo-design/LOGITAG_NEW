import axios from 'axios'

export const navixy = axios.create({
  baseURL: 'https://login.logitrak.fr/api-v2/',
})
