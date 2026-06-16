import { getFriendlyErrorMessage } from '../../utils/errorMessage'

function extractProblemMessage(payload) {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  return payload.message || payload.detail || payload.error_description || payload.error || payload.title || ''
}

export async function parseFetchPayload(res) {
  const contentType = res.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      return await res.json()
    }
    const text = await res.text()
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      return { message: text }
    }
  } catch {
    return null
  }
}

export function resolveFetchErrorMessage(res, payload, fallbackMessage) {
  return getFriendlyErrorMessage({
    status: res.status,
    data: payload,
    response: {
      status: res.status,
      data: payload
    },
    message: extractProblemMessage(payload)
  }, fallbackMessage)
}

export async function readFetchErrorMessage(res, fallbackMessage = `请求失败 (${res.status})`) {
  const payload = await parseFetchPayload(res)
  return resolveFetchErrorMessage(res, payload, fallbackMessage)
}
