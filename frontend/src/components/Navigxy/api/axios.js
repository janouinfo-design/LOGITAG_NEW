import axios from 'axios'

export const navixy = axios.create({
  baseURL: 'https://login.logitrak.fr/api-v2/',
})

export default axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  
})
