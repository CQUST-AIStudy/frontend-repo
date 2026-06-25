import axios from 'axios'
import { message as uiMessage } from '@/services/feedback'
import {
  clearAuthStorage,
  clearTapAuth,
  getTapToken,
  getTapUser as readTapUser,
  setTapToken,
  setTapUser,
} from '../../constants/auth'
import { API_BASE_URL } from '../../config/runtime'
import { createFriendlyError } from '../../utils/errorMessage'

export const TAP_BASE = API_BASE_URL

export const tapClient = axios.create({
  baseURL: TAP_BASE,
  timeout: 180000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

export function normalizeAuthPayload(payload) {
  return payload?.data ?? payload
}

export function getCurrentTapUser() {
  return readTapUser()
}

tapClient.interceptors.request.use(config => {
  const token = getTapToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

tapClient.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config || {}
    const status = error.response?.status
    const requestUrl = originalRequest.url || ''
    const isAuthRequest = requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/session')

    if (status === 401 && !isAuthRequest && !originalRequest.__tapRetried) {
      originalRequest.__tapRetried = true
      try {
        const refreshed = await axios.post(`${TAP_BASE}/api/auth/session`, {}, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        })
        const authData = normalizeAuthPayload(refreshed.data)
        if (authData?.accessToken) {
          setTapToken(authData.accessToken)
          setTapUser({
            userId: authData.userId,
            role: authData.role,
            username: getCurrentTapUser()?.username || null
          })
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`
          return tapClient(originalRequest)
        }
      } catch {
        // fall through to clear auth and surface the original 401
      }
      // TAP session truly expired: clear all auth to avoid redirect loops.
      clearAuthStorage()
      uiMessage.warning('登录已过期，请重新登录')
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    } else if (status === 401 && isAuthRequest) {
      clearTapAuth()
    }
    const fallbackMessage = status === 401 && requestUrl.includes('/api/auth/login')
      ? '用户名或密码不正确，请检查后重试'
      : status === 401
        ? '登录已过期，请重新登录'
        : '请求失败，请稍后重试'
    const friendlyError = createFriendlyError(error, fallbackMessage)
    if (status === 401 && requestUrl.includes('/api/auth/login') && friendlyError.friendlyMessage === '登录已过期，请重新登录') {
      friendlyError.message = fallbackMessage
      friendlyError.friendlyMessage = fallbackMessage
    }
    return Promise.reject(friendlyError)
  }
)
