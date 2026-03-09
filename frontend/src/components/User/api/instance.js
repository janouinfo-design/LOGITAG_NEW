import axios from 'axios'

const localhost = "http://twelve-office.fr:5000/api/"

const baseURL = localhost.replace('localhost', window.location.hostname) 

const instance = axios.create({
    baseURL,
})
