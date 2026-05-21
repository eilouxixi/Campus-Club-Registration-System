import axios from 'axios'
import { message } from 'antd'

const request = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      message.error('登录已过期，请重新登录')
    } else {
      const errorMsg = error.response?.data?.detail || error.message || '请求失败'
      message.error(errorMsg)
    }
    return Promise.reject(error)
  }
)

export default request
