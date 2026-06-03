import axios from 'axios'
import { authStorage } from '../utils/storage'

const DIRECT_API_BASE_URL = 'http://8.129.36.219:8081/archives-admin'
const SAME_ORIGIN_API_BASE_URL = '/api'
const LOGIN_PATH = '/login'

export const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL
  if (typeof window !== 'undefined') return SAME_ORIGIN_API_BASE_URL
  return DIRECT_API_BASE_URL
}

const redirectToLogin = () => {
  if (typeof window === 'undefined') return
  if (window.location.pathname.includes('/login')) return
  window.location.href = LOGIN_PATH
}

const http = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  config.baseURL = getBaseURL()
  config.headers['X-Requested-With'] = 'XMLHttpRequest'
  config.headers['Request-Start'] = String(Date.now())
  config.headers['Accept-Language'] = navigator.language || 'zh-CN'

  const token = authStorage.getToken()
  if (token) {
    config.headers.token = token
  }

  if (config.method?.toUpperCase() === 'GET') {
    config.params = { ...(config.params || {}), _t: Date.now() }
  }

  return config
})

http.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body == null || typeof body !== 'object' || !('code' in body)) {
      return body
    }
    if (body.code === 401) {
      authStorage.clearSession()
      redirectToLogin()
      return Promise.reject(new Error(body.msg || '登录已过期，请重新登录'))
    }
    if (body.code === 403) {
      return Promise.reject(new Error(body.msg || '权限不足，无法执行此操作'))
    }
    return body
  },
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clearSession()
      redirectToLogin()
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    if (error.response?.status === 403) {
      return Promise.reject(new Error('权限不足，无法执行此操作'))
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('接口请求超时，请检查后端服务是否正常'))
    }
    if (!error.response) {
      return Promise.reject(new Error('无法连接后端服务，请确认服务地址是否正确'))
    }
    const body = error.response.data
    const message = body?.msg || body?.message || error.message || '接口请求失败'
    return Promise.reject(new Error(message))
  }
)

export default http
