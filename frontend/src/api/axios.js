import axios from 'axios'
export default axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
})

export const psCore = axios.create({
  baseURL: process.env.REACT_APP_PSCORE_API,
})
