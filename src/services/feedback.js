import { reactive } from 'vue'
import { normalizeMessageOptions } from '../utils/errorMessage'

let toastSeed = 0

export const feedbackState = reactive({
  toasts: [],
  dialogs: [],
  loadingCount: 0,
  loadingText: ''
})

function readMessage(options, fallbackMessage = '') {
  const normalized = normalizeMessageOptions(options, fallbackMessage)
  if (typeof normalized === 'string') return normalized
  return normalized?.message || fallbackMessage || ''
}

function pushMessage(type, options) {
  const id = ++toastSeed
  const messageText = readMessage(options, type === 'error' ? '操作失败，请稍后重试' : '')
  const duration = typeof options === 'object' && options?.duration !== undefined ? options.duration : 3000
  feedbackState.toasts.push({ id, type, message: messageText })
  if (duration !== 0) {
    window.setTimeout(() => closeMessage(id), duration)
  }
  return { close: () => closeMessage(id) }
}

export function closeMessage(id) {
  const index = feedbackState.toasts.findIndex((toast) => toast.id === id)
  if (index >= 0) feedbackState.toasts.splice(index, 1)
}

export const message = Object.assign(
  (options) => pushMessage('info', options),
  {
    success: (options) => pushMessage('success', options),
    warning: (options) => pushMessage('warning', options),
    error: (options) => pushMessage('error', options),
    info: (options) => pushMessage('info', options)
  }
)

export function confirm(messageText, title = '提示', options = {}) {
  return new Promise((resolve, reject) => {
    feedbackState.dialogs.push({
      type: 'confirm',
      title,
      message: messageText,
      confirmButtonText: options.confirmButtonText || '确定',
      cancelButtonText: options.cancelButtonText || '取消',
      tone: options.type || 'warning',
      resolve,
      reject
    })
  })
}

export function alert(messageText, title = '提示', options = {}) {
  return new Promise((resolve) => {
    feedbackState.dialogs.push({
      type: 'alert',
      title,
      message: messageText,
      confirmButtonText: options.confirmButtonText || '确定',
      tone: options.type || 'info',
      resolve,
      reject: resolve,
      callback: options.callback
    })
  })
}

export function settleDialog(dialog, confirmed) {
  const index = feedbackState.dialogs.indexOf(dialog)
  if (index >= 0) feedbackState.dialogs.splice(index, 1)

  if (confirmed) {
    dialog.resolve?.('confirm')
    dialog.callback?.('confirm')
    return
  }

  dialog.callback?.('cancel')
  dialog.reject?.('cancel')
}

export const messageBox = {
  confirm,
  alert
}

export const loading = {
  open(options = {}) {
    feedbackState.loadingCount += 1
    feedbackState.loadingText = options.text || '加载中...'
    let closed = false
    return {
      close() {
        if (closed) return
        closed = true
        feedbackState.loadingCount = Math.max(0, feedbackState.loadingCount - 1)
        if (!feedbackState.loadingCount) feedbackState.loadingText = ''
      }
    }
  },
  service(options = {}) {
    return loading.open(options)
  },
  close() {
    feedbackState.loadingCount = 0
    feedbackState.loadingText = ''
  }
}

export function installFeedback(app) {
  app.config.globalProperties.$message = message
  app.config.globalProperties.$msgbox = messageBox
  app.config.globalProperties.$loading = loading.open
}
