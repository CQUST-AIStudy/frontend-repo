export const AUTH_STORAGE_KEYS = Object.freeze({
  SESSION_TOKEN: 'token',
  SESSION_STATE: 'auth_session_state',
  USER_INFO: 'userInfo',
  TAP_TOKEN: 'tap_token',
  TAP_USER: 'tap_user',
  PINIA_USER: 'user',
})

export const AUTH_STORAGE_CLEARED_EVENT = 'auth-storage-cleared'
export const USER_SCOPED_STORAGE_CLEARED_EVENT = 'user-scoped-storage-cleared'
export const AUTH_SESSION_STATES = Object.freeze({
  TOKEN: 'token',
  COOKIE: 'cookie',
})

const USER_SCOPED_STORAGE_KEYS = Object.freeze([
  'student_ai_chat',
  'teacher_ai_chat',
])

function notifyAuthStorageCleared(storage) {
  if (typeof window === 'undefined' || storage !== window.localStorage) return
  window.dispatchEvent(new CustomEvent(AUTH_STORAGE_CLEARED_EVENT))
}

function notifyUserScopedStorageCleared(storage) {
  if (typeof window === 'undefined' || storage !== window.localStorage) return
  window.dispatchEvent(new CustomEvent(USER_SCOPED_STORAGE_CLEARED_EVENT))
}

export function clearUserScopedStorage(storage = localStorage) {
  USER_SCOPED_STORAGE_KEYS.forEach((key) => storage.removeItem(key))
  notifyUserScopedStorageCleared(storage)
}

export function clearAuthStorage(storage = localStorage) {
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => storage.removeItem(key))
  clearUserScopedStorage(storage)
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

export function getSessionState(storage = localStorage) {
  const token = getSessionToken(storage)
  // 兼容旧版本曾写入的占位 token，但不再继续写入该值。
  if (token === 'legacy_session') return AUTH_SESSION_STATES.COOKIE
  if (token) return AUTH_SESSION_STATES.TOKEN
  const state = storage.getItem(AUTH_STORAGE_KEYS.SESSION_STATE)
  return state === AUTH_SESSION_STATES.COOKIE ? state : null
}

export function setSessionState(state, storage = localStorage) {
  if (!Object.values(AUTH_SESSION_STATES).includes(state)) {
    storage.removeItem(AUTH_STORAGE_KEYS.SESSION_STATE)
    return
  }
  storage.setItem(AUTH_STORAGE_KEYS.SESSION_STATE, state)
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
