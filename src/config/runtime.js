const DEFAULT_API_BASE_URL = ''
const DEFAULT_RAG_API_BASE_URL = '/rag'

export const API_BASE_URL = (process.env.VUE_APP_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')
export const API_BASE_URL_WITH_SLASH = `${API_BASE_URL}/`
export const RAG_API_BASE_URL = (process.env.VUE_APP_RAG_API_BASE_URL || DEFAULT_RAG_API_BASE_URL).replace(/\/$/, '')

export function buildApiUrl(path = '') {
  if (!path) return API_BASE_URL
  if (/^https?:\/\//.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export function buildRagApiUrl(path = '') {
  if (!path) return RAG_API_BASE_URL
  if (/^https?:\/\//.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${RAG_API_BASE_URL}${normalizedPath}`
}
