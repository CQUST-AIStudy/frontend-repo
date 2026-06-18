import axios from 'axios'
import { message as uiMessage } from '@/services/feedback'
import {
  clearAuthStorage,
  clearTapAuth,
  getTapToken,
  getTapUser as readTapUser,
  setTapToken,
  setTapUser,
} from '../constants/auth'
import { API_BASE_URL } from '../config/runtime'
import { getMockTeachingClasses } from '../mock/teachingClasses'
import { createFriendlyError, getFriendlyErrorMessage } from '../utils/errorMessage'

const TAP_BASE = API_BASE_URL
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && process.env.VUE_APP_USE_MOCK_DATA === 'true'

const tapClient = axios.create({
  baseURL: TAP_BASE,
  timeout: 180000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

function normalizeAuthPayload(payload) {
  return payload?.data ?? payload
}

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

tapClient.interceptors.request.use(config => {
  const token = getTapToken()
  if (token) {
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
            username: getTapUser()?.username || null
          })
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`
          return tapClient(originalRequest)
        }
      } catch {
        // fall through to clear auth and surface the original 401
      }
      // TAP session truly expired → clear ALL auth (not just tap) to prevent
      // redirect loop: main token alone would cause router guard to redirect
      // back to /teacher/select-class, which would 401 again endlessly.
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

// ========== Auth ==========
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
  return readTapUser()
}

function extractProblemMessage(payload) {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  return payload.message || payload.detail || payload.error_description || payload.error || payload.title || ''
}

async function parseFetchPayload(res) {
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

function resolveFetchErrorMessage(res, payload, fallbackMessage) {
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

// ========== Documents ==========
export function getDocuments() {
  return tapClient.get('/api/documents')
}

export function deleteDocument(docId) {
  return tapClient.delete(`/api/documents/${docId}`)
}

export async function readFetchErrorMessage(res, fallbackMessage = `请求失败 (${res.status})`) {
  const payload = await parseFetchPayload(res)
  return resolveFetchErrorMessage(res, payload, fallbackMessage)
}

export function deleteAllDocuments() {
  return tapClient.delete('/api/documents')
}

export async function createFolder(folderName) {
  return tapClient.post('/api/uploads/folders', { folderName })
}

export async function uploadFiles(folderId, files, relativePaths = null) {
  const fd = new FormData()
  const paths = []
  files.forEach((f, idx) => {
    fd.append('files', f)
    const p = Array.isArray(relativePaths) && relativePaths[idx]
      ? relativePaths[idx]
      : (f.webkitRelativePath || f.name)
    paths.push(p)
  })
  fd.append('relativePaths', JSON.stringify(paths))
  const token = getTapToken()
  const res = await fetch(`${TAP_BASE}/api/uploads/folders/${folderId}/files`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd
  })
  const payload = await parseFetchPayload(res)
  if (!res.ok) throw new Error(resolveFetchErrorMessage(res, payload, '文件上传失败，请稍后重试'))
  return payload
}

export async function uploadZipFolder(folderName, file) {
  const fd = new FormData()
  if (folderName) fd.append('folderName', folderName)
  fd.append('file', file)
  const token = getTapToken()
  const res = await fetch(`${TAP_BASE}/api/uploads/folders/zip`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd
  })
  const payload = await parseFetchPayload(res)
  if (!res.ok) throw new Error(resolveFetchErrorMessage(res, payload, 'ZIP 上传失败，请稍后重试'))
  return payload
}

export async function submitZipOrganizeJob(file) {
  const fd = new FormData()
  fd.append('file', file)
  const token = getTapToken()
  const res = await fetch(`${TAP_BASE}/api/zip-organize/jobs`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd
  })
  const payload = await parseFetchPayload(res)
  if (!res.ok) throw new Error(resolveFetchErrorMessage(res, payload, 'ZIP 智能整理提交失败'))
  return payload
}

// ========== Translation ==========
export function translateDocument(docId, targetLang = 'ZH', force = false) {
  return tapClient.get(`/api/documents/${docId}/translate`, {
    params: { targetLang, force }
  })
}

// ========== Summary ==========
export function summarizeArxiv(arxivId, force = false) {
  return tapClient.get(`/api/papers/${encodeURIComponent(arxivId)}/summary`, {
    params: { force },
    timeout: 300000  // 5 min for arxiv (PDF download + AI processing)
  })
}

export function summarizeDoi(doi) {
  return tapClient.post('/api/papers/doi/summary', { doi })
}

export function summarizeFreeText(title, text) {
  return tapClient.post('/api/papers/freetext/summary', { title, text })
}

export function summarizeDocument(docId, force = false) {
  return tapClient.get(`/api/documents/${docId}/summary`, {
    params: { force }
  })
}

// ========== Chat ==========
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

// ========== Agent ==========
export function submitAgentJob(uploadFolderId) {
  return tapClient.post('/api/agent/jobs', { uploadFolderId: Number(uploadFolderId) })
}

export function listAgentJobs(limit = 20) {
  return tapClient.get('/api/agent/jobs', { params: { limit } })
}

export function queryAgentJob(jobId) {
  return tapClient.get(`/api/agent/jobs/${jobId}`)
}

export function retryAgentJob(jobId) {
  return tapClient.post(`/api/agent/jobs/${jobId}/retry`)
}

export function downloadAgentJobZip(jobId) {
  return tapClient.get(`/api/agent/jobs/${jobId}/download`, { responseType: 'blob', timeout: 300000 })
}

export function listZipOrganizeJobs(limit = 20) {
  return tapClient.get('/api/zip-organize/jobs', { params: { limit } })
}

export function queryZipOrganizeJob(jobId) {
  return tapClient.get(`/api/zip-organize/jobs/${jobId}`)
}

export function retryZipOrganizeJob(jobId) {
  return tapClient.post(`/api/zip-organize/jobs/${jobId}/retry`)
}

export function downloadZipOrganizeJobZip(jobId) {
  return tapClient.get(`/api/zip-organize/jobs/${jobId}/download`, { responseType: 'blob', timeout: 300000 })
}


// ========== Grading - Rubrics ==========
export function getRubrics(subject) {
  return tapClient.get('/api/grading/rubrics', { params: subject ? { subject } : {} })
}

export function normalizeRubricList(payload) {
  const root = payload?.data ?? payload
  const candidates = [
    root,
    root?.data,
    root?.content,
    root?.items,
    root?.records,
    root?.list,
    root?.data?.content,
    root?.data?.items,
    root?.data?.records,
    root?.data?.list
  ]
  const list = candidates.find(Array.isArray) || []
  return list.filter(Boolean)
}

export function createRubric(data) {
  return tapClient.post('/api/grading/rubrics', data)
}

export function updateRubric(id, data) {
  return tapClient.put(`/api/grading/rubrics/${id}`, data)
}

export function getRubricDetail(id) {
  return tapClient.get(`/api/grading/rubrics/${id}`)
}

export function draftRubricFromTemplate(file, extra = {}) {
  const fd = new FormData()
  fd.append('templateFile', file)
  if (extra?.subject) fd.append('subject', extra.subject)
  if (extra?.name) fd.append('name', extra.name)
  return tapClient.post('/api/grading/rubrics/draft', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000,
  })
}

// ========== Grading - Tasks ==========
export function createGradingTask(formData) {
  return tapClient.post('/api/grading/tasks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}

export function getGradingTasks(page = 0, size = 20, status) {
  return tapClient.get('/api/grading/tasks', { params: { page, size, ...(status ? { status } : {}) } })
}

export function getGradingTaskDetail(id) {
  return tapClient.get(`/api/grading/tasks/${id}`)
}

export function retryGradingTask(id) {
  return tapClient.post(`/api/grading/tasks/${id}/retry`)
}

export function deleteGradingTask(id) {
  return tapClient.delete(`/api/grading/tasks/${id}`)
}

export function updateGradingTaskSignature(id, teacherSignature) {
  return tapClient.post(`/api/grading/tasks/${id}/signature`, { teacherSignature })
}

// ========== Grading - Submissions ==========
export function getSubmissionDetail(id) {
  return tapClient.get(`/api/grading/submissions/${id}`)
}

export function overrideSubmissionScore(id, data) {
  return tapClient.put(`/api/grading/submissions/${id}/scores`, data)
}

export function retryGradingSubmission(id) {
  return tapClient.post(`/api/grading/submissions/${id}/retry`)
}

export function downloadSubmissionReport(id) {
  return tapClient.get(`/api/grading/reports/${id}`, { responseType: 'blob' })
}

// ========== Grading - Batches ==========
export function getGradingBatches() {
  return tapClient.get('/api/grading/batches')
}

export function exportGradingBatchExcel(batchId, includeComments = true) {
  return tapClient.post(`/api/grading/batches/${batchId}/export-excel`,
    { includeComments },
    { responseType: 'blob', timeout: 120000 })
}

export function exportMergedGradingExcel(taskIds, includeComments = true) {
  return tapClient.post('/api/grading/tasks/export-excel-merged',
    { taskIds, includeComments },
    { responseType: 'blob', timeout: 120000 })
}

// ========== Grading - Export ==========
export function exportGradingTask(id) {
  return tapClient.post(`/api/grading/tasks/${id}/export`, null, {
    responseType: 'blob',
    timeout: 600000
  })
}

export function exportGradingExcel(id, submissionIds, includeComments) {
  return tapClient.post(`/api/grading/tasks/${id}/export-excel`,
    { submissionIds, includeComments },
    { responseType: 'blob', timeout: 60000 })
}

export function batchGenerateAnnotatedReports(taskId) {
  return tapClient.post(`/api/grading/tasks/${taskId}/generate-annotated-reports`, null, { timeout: 300000 })
}

// ========== Grading - Batch Review ==========
export function getBatchReview(taskId) {
  return tapClient.get(`/api/grading/tasks/${taskId}/batch-review`)
}

export function triggerBatchReview(taskId) {
  return tapClient.post(`/api/grading/tasks/${taskId}/batch-review`, null, { timeout: 120000 })
}

// ========== Grading - Final Review ==========
export function generateFinalReview(submissionId) {
  return tapClient.post(`/api/grading/submissions/${submissionId}/generate-review`)
}

export function saveFinalReview(submissionId, finalReviewComment) {
  return tapClient.put(`/api/grading/submissions/${submissionId}/review`, { finalReviewComment })
}

export function publishSubmissionReport(submissionId) {
  return tapClient.post(`/api/grading/submissions/${submissionId}/publish-report`)
}


export function getTeachingClasses() {
  if (USE_MOCK_DATA) {
    return getMockTeachingClasses()
  }
  return tapClient.get('/api/classes')
}

export function createTeachingClass(data) {
  return tapClient.post('/api/classes', data)
}

export function updateTeachingClass(id, data) {
  return tapClient.put(`/api/classes/${id}`, data)
}

export function deleteTeachingClass(id) {
  return tapClient.delete(`/api/classes/${id}`)
}

export function getClassStudents(classId) {
  return tapClient.get(`/api/classes/${classId}/students`)
}

export function addClassStudent(classId, data) {
  return tapClient.post(`/api/classes/${classId}/students`, data)
}

export function removeClassStudent(classId, studentId) {
  return tapClient.delete(`/api/classes/${classId}/students/${studentId}`)
}

export function joinClass(data) {
  return tapClient.post('/api/classes/join', data)
}

export function updatePtaSyncConfig(classId, data) {
  return tapClient.put(`/api/classes/${classId}/pta-sync`, data)
}

export function triggerPtaSync(classId, data = {}) {
  return tapClient.post(`/api/classes/${classId}/pta-sync/trigger`, data)
}

export function importPtaStudents(classId) {
  return tapClient.post(`/api/classes/${classId}/pta-sync/import-students`)
}

export function getPtaSyncStatus(classId) {
  return tapClient.get(`/api/classes/${classId}/pta-sync/status`)
}


// ========== Experiment Analytics ==========
export function getAnalyticsExperiments(classPrefix) {
  return tapClient.get('/api/analytics/experiments', {
    params: classPrefix ? { classPrefix } : {}
  })
}

export function getClassPrefixes() {
  return tapClient.get('/api/analytics/class-prefixes')
}

export function getExperimentAnalytics(experimentId) {
  return tapClient.get(`/api/analytics/experiments/${experimentId}`)
}

export function getExperimentComparison(classPrefix) {
  const params = classPrefix ? { classPrefix } : {}
  return tapClient.get('/api/analytics/comparison', { params })
}

export function getStudentAnalyticsOverview(studentId) {
  return tapClient.get(`/api/analytics/student/${studentId}/overview`)
}

export function getStudentExperimentDetail(studentId, experimentId) {
  return tapClient.get(`/api/analytics/student/${studentId}/experiments/${experimentId}`)
}

// ========== Ability Profile ==========
export function getClassProfile() {
  return tapClient.get('/api/profile/class', { timeout: 30000 })
}

export function getStudentProfile(studentId) {
  return tapClient.get(`/api/profile/student/${encodeURIComponent(studentId)}`, { timeout: 30000 })
}

export function getPtaCookieStatus() {
  return tapClient.get('/api/pta-cookie/status')
}

export function submitPtaCookie(cookieJson) {
  return tapClient.post('/api/pta-cookie/update', { cookies: cookieJson })
}

export function getTeacherPtaCredentials() {
  return tapClient.get('/api/teachers/me/pta-credentials')
}

export function updateTeacherPtaCredentials(data) {
  return tapClient.put('/api/teachers/me/pta-credentials', data)
}

export function clearTeacherPtaCredentials() {
  return tapClient.delete('/api/teachers/me/pta-credentials')
}

// ========== Grading - Teacher Signatures ==========
export function getTeacherSignatures() {
  return tapClient.get('/api/grading/signatures')
}

export function addTeacherSignature(signature) {
  return tapClient.post('/api/grading/signatures', { signature })
}

export function deleteTeacherSignature(id) {
  return tapClient.delete(`/api/grading/signatures/${id}`)
}

export function normalizeSignatureList(payload) {
  const root = payload?.data ?? payload
  const candidates = [root, root?.data, root?.content, root?.items, root?.records, root?.list]
  const list = candidates.find(Array.isArray) || []
  return list.filter(Boolean)
}


