export const AUTH_STORAGE_KEYS = Object.freeze({
  SESSION_TOKEN: 'token',
  USER_INFO: 'userInfo',
  TAP_TOKEN: 'tap_token',
  TAP_USER: 'tap_user',
  PINIA_USER: 'user',
})

export const AUTH_STORAGE_CLEARED_EVENT = 'auth-storage-cleared'

function notifyAuthStorageCleared(storage) {
  if (typeof window === 'undefined' || storage !== window.localStorage) return
  window.dispatchEvent(new CustomEvent(AUTH_STORAGE_CLEARED_EVENT))
}

export function clearAuthStorage(storage = localStorage) {
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => storage.removeItem(key))
  notifyAuthStorageCleared(storage)
}

export function getSessionToken(storage = localStorage) {
  return storage.getItem(AUTH_STORAGE_KEYS.SESSION_TOKEN)
}

export function setSessionToken(token, storage = localStorage) {
  if (!token) {
    storage.removeItem(AUTH_STORAGE_KEYS.SESSION_TOKEN)
    return
  }
  storage.setItem(AUTH_STORAGE_KEYS.SESSION_TOKEN, token)
}

export function getTapToken(storage = localStorage) {
  return storage.getItem(AUTH_STORAGE_KEYS.TAP_TOKEN)
}

export function setTapToken(token, storage = localStorage) {
  if (!token) {
    storage.removeItem(AUTH_STORAGE_KEYS.TAP_TOKEN)
    return
  }
  storage.setItem(AUTH_STORAGE_KEYS.TAP_TOKEN, token)
}

export function getUserInfo(storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(AUTH_STORAGE_KEYS.USER_INFO) || 'null')
  } catch {
    return null
  }
}

export function setUserInfo(userInfo, storage = localStorage) {
  if (!userInfo) {
    storage.removeItem(AUTH_STORAGE_KEYS.USER_INFO)
    return
  }
  storage.setItem(AUTH_STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
}

export function getTapUser(storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(AUTH_STORAGE_KEYS.TAP_USER) || 'null')
  } catch {
    return null
  }
}

export function setTapUser(userInfo, storage = localStorage) {
  if (!userInfo) {
    storage.removeItem(AUTH_STORAGE_KEYS.TAP_USER)
    return
  }
  storage.setItem(AUTH_STORAGE_KEYS.TAP_USER, JSON.stringify(userInfo))
}

export function clearTapAuth(storage = localStorage) {
  storage.removeItem(AUTH_STORAGE_KEYS.TAP_TOKEN)
  storage.removeItem(AUTH_STORAGE_KEYS.TAP_USER)
}

export function getCurrentStudentId(storage = localStorage) {
  const userInfo = getUserInfo(storage)
  const candidate = userInfo?.usernum
    ?? userInfo?.studentId
    ?? userInfo?.student_id
    ?? userInfo?.username
    ?? userInfo?.id
    ?? null
  const parsed = Number(candidate)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}
