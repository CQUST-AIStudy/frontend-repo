const DEFAULT_ERROR_MESSAGE = '操作失败，请稍后重试'

const STATUS_MESSAGES = {
  400: '提交内容有误，请检查后重试',
  401: '登录已过期，请重新登录',
  403: '当前账号没有权限执行此操作',
  404: '未找到相关数据，请刷新后重试',
  409: '相关数据已存在，请调整后重试',
  413: '上传文件过大，请压缩后重试',
  415: '文件格式不支持，请更换文件后重试',
  422: '提交内容格式不正确，请检查必填项和输入格式',
  429: '操作太频繁，请稍后再试'
}

const STANDALONE_MESSAGES = [
  '用户名或密码不正确',
  '登录已过期',
  '当前账号没有权限'
]

const GENERIC_FALLBACK_MESSAGES = new Set([
  DEFAULT_ERROR_MESSAGE,
  '操作失败，请稍后重试',
  '操作提醒，请稍后重试',
  '请求失败，请稍后重试'
])

const FRIENDLY_PATTERNS = [
  {
    pattern: /(invalid|incorrect|wrong|bad).*(username|password|credential)|user.*not.*found|account.*not.*found|password.*incorrect|用户名或密码|账号或密码|密码错误|用户不存在|账户不存在|账号不存在/i,
    message: '用户名或密码不正确，请检查后重试'
  },
  {
    pattern: /(unauthorized|token.*expired|jwt.*expired|session.*expired|not authenticated|登录.*过期|未登录|认证失败)/i,
    message: STATUS_MESSAGES[401]
  },
  {
    pattern: /(forbidden|permission denied|not allowed|access denied|无权限|权限不足|拒绝访问)/i,
    message: STATUS_MESSAGES[403]
  },
  {
    pattern: /(not found|no such|does not exist|不存在|未找到)/i,
    message: STATUS_MESSAGES[404]
  },
  {
    pattern: /(already exists|duplicate|unique constraint|integrityerror|重复|已存在|唯一约束)/i,
    message: STATUS_MESSAGES[409]
  },
  {
    pattern: /(request entity too large|payload too large|file too large|文件.*过大|上传.*过大)/i,
    message: STATUS_MESSAGES[413]
  },
  {
    pattern: /(unsupported media type|invalid file type|文件格式|格式不支持)/i,
    message: STATUS_MESSAGES[415]
  },
  {
    pattern: /(validation error|field required|value is not a valid|required field|missing required|unprocessable entity|pydantic|校验失败|参数错误|参数不合法|必填)/i,
    message: STATUS_MESSAGES[422]
  },
  {
    pattern: /(too many requests|rate limit|请求过于频繁|操作太频繁)/i,
    message: STATUS_MESSAGES[429]
  },
  {
    pattern: /(network error|failed to fetch|load failed|err_network|net::|enotfound|econnrefused|connection refused|连接失败|网络.*失败|服务不可达)/i,
    message: '网络连接失败，请检查网络后重试'
  },
  {
    pattern: /(timeout|timed out|econna?borted|超时)/i,
    message: '请求超时，请稍后重试'
  },
  {
    pattern: /(internal server error|server error|traceback|exception|database|sql|sqlite|mysql|postgres|服务器异常|数据库|后端异常)/i,
    message: '服务器暂时无法处理请求，请稍后重试'
  }
]

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function normalizeText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function extractFromDetail(detail) {
  if (!detail) return ''
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    if (!detail.length) return ''
    const messages = detail
      .map(item => {
        if (typeof item === 'string') return item
        if (!item || typeof item !== 'object') return ''
        return item.msg || item.message || item.detail || item.error || ''
      })
      .filter(Boolean)
    if (!messages.length) return STATUS_MESSAGES[422]
    if (messages.some(item => /field required|value is not|type error|validation/i.test(item))) {
      return STATUS_MESSAGES[422]
    }
    return messages.join('；')
  }
  if (typeof detail === 'object') {
    return detail.message || detail.msg || detail.error || detail.detail || ''
  }
  return ''
}

export function getErrorStatus(error) {
  if (!error) return null
  if (typeof error === 'number') return error
  return Number(
    error.status ||
    error.statusCode ||
    error.response?.status ||
    error.rawError?.response?.status ||
    error.rawError?.status ||
    0
  ) || null
}

export function extractErrorPayload(error) {
  if (!error || typeof error !== 'object') return null
  return (
    error.response?.data ||
    error.rawError?.response?.data ||
    error.data ||
    error.payload ||
    null
  )
}

export function extractErrorMessage(error) {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (typeof error === 'number') return STATUS_MESSAGES[error] || ''

  const payload = extractErrorPayload(error)
  if (payload) {
    if (typeof payload === 'string') return payload
    if (payload.detail) {
      const detailMessage = extractFromDetail(payload.detail)
      if (detailMessage) return detailMessage
    }
    const payloadMessage = payload.message || payload.msg || payload.error || payload.title || payload.error_description
    if (payloadMessage) return extractFromDetail(payloadMessage) || payloadMessage
  }

  return error.friendlyMessage || error.userMessage || error.message || error.statusText || ''
}

function hasChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text)
}

function isTechnicalText(text) {
  if (!text) return false
  return /^(http\s*\d+|request failed|network error|failed to fetch|load failed|axioserror|typeerror|syntaxerror|internal server error|traceback|exception|undefined|null|\{|\[)/i.test(text) ||
    /(status code\s*\d+|err_|econn|enotfound|sql|database|stack trace|unexpected token|no response body reader)/i.test(text)
}

function normalizeRawMessage(message) {
  const text = normalizeText(message)
  if (!text) return ''
  if (/^<(!doctype|html)/i.test(text)) return ''
  return text
    .replace(/^Error:\s*/i, '')
    .replace(/^AxiosError:\s*/i, '')
    .replace(/^请求失败[:：]\s*/i, '')
    .trim()
}

function pickContextPrefix(text) {
  const match = text.match(/^([\u4e00-\u9fa5A-Za-z0-9 _-]{2,20}(?:失败|异常|错误|不可用|出错))[:：]\s*(.+)$/)
  return match ? match[1] : ''
}

function shouldStandAlone(message) {
  return STANDALONE_MESSAGES.some(item => message.includes(item))
}

function isGenericFallback(message) {
  return GENERIC_FALLBACK_MESSAGES.has(normalizeText(message))
}

function combineWithFallback(message, fallbackMessage) {
  const fallback = normalizeText(fallbackMessage)
  if (!fallback || isGenericFallback(fallback) || fallback === message) return message
  if (isTechnicalText(fallback) || shouldStandAlone(message)) return message
  if (fallback.includes(message) || message.includes(fallback)) return message
  return `${fallback}，${message}`
}

function shouldPreserveChineseBusinessMessage(raw, status) {
  if (!raw || !hasChinese(raw) || isTechnicalText(raw)) return false
  if (status >= 500) return false
  return !(
    /(用户名或密码|账号或密码|密码错误|用户不存在|账户不存在|账号不存在)/.test(raw) ||
    /(登录.*过期|未登录|认证失败|无权限|权限不足|拒绝访问)/.test(raw) ||
    /(文件.*过大|格式不支持|请求过于频繁|操作太频繁|超时)/.test(raw) ||
    /(网络.*失败|连接失败|服务不可达|服务器异常|数据库|后端异常)/.test(raw)
  )
}

function mapByStatus(status) {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status]
  if (status >= 500) return '服务器暂时无法处理请求，请稍后重试'
  return ''
}

function isLoginRequestError(error) {
  if (!error || typeof error !== 'object') return false
  const url = String(error.config?.url || error.rawError?.config?.url || '')
  return /\/api\/(?:auth\/)?login(?:\?|$|\/)/.test(url)
}

function mapRawMessage(rawMessage, status) {
  const raw = normalizeRawMessage(rawMessage)
  if (!raw && status) return mapByStatus(status)
  if (shouldPreserveChineseBusinessMessage(raw, status)) return raw
  for (const item of FRIENDLY_PATTERNS) {
    if (item.pattern.test(raw)) return item.message
  }
  if (/^http\s*\d+/i.test(raw) && status) return mapByStatus(status)
  if (status && isTechnicalText(raw)) return mapByStatus(status)
  if (raw && !isTechnicalText(raw)) return raw
  return mapByStatus(status)
}

export function getFriendlyErrorMessage(error, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  if (error && typeof error === 'object' && error.friendlyMessage) return error.friendlyMessage

  const status = getErrorStatus(error)
  const raw = normalizeRawMessage(extractErrorMessage(error))
  const fallback = normalizeText(fallbackMessage) || DEFAULT_ERROR_MESSAGE

  if (status === 401 && isLoginRequestError(error) && (!raw || isTechnicalText(raw) || raw === STATUS_MESSAGES[401])) {
    return fallback.includes('登录失败')
      ? fallback
      : '登录失败，请检查账号密码是否正确'
  }

  const mapped = mapRawMessage(raw, status)

  if (!mapped) return fallback
  if (raw && mapped !== raw) {
    const prefix = pickContextPrefix(raw)
    if (prefix && !shouldStandAlone(mapped)) return `${prefix}，${mapped}`
    return combineWithFallback(mapped, fallback)
  }
  if (hasChinese(mapped)) return mapped
  return fallback
}

export function createFriendlyError(error, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  const message = getFriendlyErrorMessage(error, fallbackMessage)
  const friendlyError = new Error(message)
  friendlyError.name = error?.name || 'FriendlyError'
  friendlyError.status = getErrorStatus(error)
  friendlyError.response = error?.response
  friendlyError.config = error?.config
  friendlyError.request = error?.request
  friendlyError.code = error?.code
  friendlyError.rawError = error
  friendlyError.rawMessage = extractErrorMessage(error)
  friendlyError.friendlyMessage = message
  return friendlyError
}

export function getFriendlyResponseMessage(response, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  return getFriendlyErrorMessage(
    {
      status: response?.status,
      data: response,
      response: {
        status: response?.status,
        data: response
      }
    },
    fallbackMessage
  )
}

export function normalizeMessageOptions(options, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  if (typeof options === 'string') {
    return getFriendlyErrorMessage(options, fallbackMessage)
  }
  if (isPlainObject(options) && typeof options.message === 'string') {
    return {
      ...options,
      message: getFriendlyErrorMessage(options.message, fallbackMessage)
    }
  }
  return options
}
