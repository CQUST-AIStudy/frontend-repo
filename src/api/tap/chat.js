import { getTapToken } from '../../constants/auth'
import { TAP_BASE, tapClient } from './client'

export const CHAT_MESSAGE_MAX_LENGTH = 4000

const CHAT_HISTORY_ROLES = new Set(['system', 'user', 'assistant'])

export function normalizeChatMessage(message) {
  return typeof message === 'string'
    ? message.replace(/\r\n?/g, '\n').trim()
    : ''
}

export function validateChatMessage(message, options = {}) {
  const fieldName = options.fieldName || '消息'
  const maxLength = Number(options.maxLength || CHAT_MESSAGE_MAX_LENGTH)
  const value = normalizeChatMessage(message)

  if (!value) {
    return { valid: false, value: '', message: `${fieldName}不能为空` }
  }
  if (value.length > maxLength) {
    return {
      valid: false,
      value,
      message: `${fieldName}不能超过 ${maxLength} 个字符，当前为 ${value.length} 个字符`
    }
  }
  return { valid: true, value, message: '' }
}

function assertValidChatMessage(message, options = {}) {
  const result = validateChatMessage(message, options)
  if (!result.valid) {
    throw new Error(result.message)
  }
  return result.value
}

function normalizeChatHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .map(item => ({
      role: CHAT_HISTORY_ROLES.has(String(item?.role || '').trim()) ? String(item.role).trim() : '',
      content: normalizeChatMessage(item?.content)
    }))
    .filter(item => item.role && item.content)
}

export function buildStructuredPrompt({
  role = '',
  task = '',
  contextSections = [],
  instructions = [],
  outputRequirements = [],
}) {
  const lines = []

  if (role) {
    lines.push('# 角色', role.trim(), '')
  }
  if (task) {
    lines.push('# 任务', task.trim(), '')
  }

  const normalizedSections = Array.isArray(contextSections)
    ? contextSections.filter(section => section && (section.title || section.text || (Array.isArray(section.items) && section.items.length)))
    : []
  if (normalizedSections.length) {
    lines.push('# 已知信息')
    normalizedSections.forEach(section => {
      if (section.title) {
        lines.push(`## ${section.title}`)
      }
      if (section.text) {
        lines.push(String(section.text).trim())
      }
      const items = Array.isArray(section.items) ? section.items.filter(Boolean) : []
      items.forEach(item => lines.push(`- ${item}`))
      lines.push('')
    })
  }

  const normalizedInstructions = Array.isArray(instructions) ? instructions.filter(Boolean) : []
  if (normalizedInstructions.length) {
    lines.push('# 分析要求')
    normalizedInstructions.forEach((item, index) => lines.push(`${index + 1}. ${item}`))
    lines.push('')
  }

  const normalizedOutputRequirements = Array.isArray(outputRequirements) ? outputRequirements.filter(Boolean) : []
  if (normalizedOutputRequirements.length) {
    lines.push('# 输出要求')
    normalizedOutputRequirements.forEach(item => lines.push(`- ${item}`))
    lines.push('')
  }

  return lines.join('\n').trim()
}

export function chatSend(message, history = []) {
  const normalizedMessage = assertValidChatMessage(message, { fieldName: '消息' })
  return tapClient.post('/api/tap-chat', {
    message: normalizedMessage,
    history: normalizeChatHistory(history)
  })
}

export function chatStreamSend(message, history = [], options = {}) {
  const normalizedMessage = assertValidChatMessage(message, { fieldName: '消息' })
  const token = getTapToken()
  return fetch(`${TAP_BASE}/api/tap-chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message: normalizedMessage,
      history: normalizeChatHistory(history)
    }),
    signal: options?.signal,
  })
}
