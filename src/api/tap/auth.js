import axios from 'axios'
import {
  clearTapAuth,
  getTapToken,
  setTapToken,
  setTapUser,
} from '../../constants/auth'
import {
  getCurrentTapUser,
  normalizeAuthPayload,
  TAP_BASE,
  tapClient,
} from './client'

export async function tapLogin(username, password) {
  const res = await tapClient.post('/api/auth/login', { username, password })
  const data = normalizeAuthPayload(res)
  if (data?.accessToken) {
    setTapToken(data.accessToken)
    setTapUser({
      userId: data.userId,
      role: data.role,
      username
    })
  }
  return data
}

export async function restoreTapSession() {
  const res = await axios.post(`${TAP_BASE}/api/auth/session`, {}, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  })
  const data = normalizeAuthPayload(res.data)
  if (data?.accessToken) {
    setTapToken(data.accessToken)
    const currentTapUser = getTapUser()
    setTapUser({
      userId: data.userId,
      role: data.role,
      username: currentTapUser?.username || null
    })
  }
  return data
}

export function tapLogout() {
  clearTapAuth()
}

export function isTapLoggedIn() {
  return !!getTapToken()
}

export function getTapUser() {
  return getCurrentTapUser()
}
