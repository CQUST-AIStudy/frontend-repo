import { tapClient, TAP_BASE } from './client'
import { getTapToken } from '../../constants/auth'

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

export function createGradingTask(formData, onProgress) {
  return tapClient.post('/api/grading/tasks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
    onUploadProgress: onProgress,
  })
}

export function getGradingTasks(page = 0, size = 20, status) {
  return tapClient.get('/api/grading/tasks', { params: { page, size, ...(status ? { status } : {}) } })
}

/**
 * 订阅某个批改任务的实时进度（SSE，fetch + Bearer，参考 rag.js 的流式读取）。
 * handlers: { onOpen, onProgress(submissionProgress), onTask(taskSnapshot), onError(err) }
 * 返回 { close } 用于关闭连接。
 */
export function streamGradingProgress(taskId, handlers = {}) {
  const controller = new AbortController()
  const token = getTapToken()

  const run = async () => {
    try {
      const resp = await fetch(`${TAP_BASE}/api/grading/tasks/${taskId}/progress/stream`, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        signal: controller.signal
      })
      if (!resp.ok || !resp.body) {
        throw new Error(`progress stream failed: ${resp.status}`)
      }
      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let done = false
      while (!done) {
        const chunk = await reader.read()
        done = chunk.done
        if (chunk.value) {
          buffer += decoder.decode(chunk.value, { stream: true })
          const parts = buffer.split(/\n\n/)
          buffer = parts.pop() || ''
          parts.forEach(part => dispatchGradingSse(part, handlers))
        }
      }
      if (buffer.trim()) dispatchGradingSse(buffer, handlers)
    } catch (e) {
      if (!controller.signal.aborted) handlers.onError?.(e)
    }
  }
  run()
  return { close: () => controller.abort() }
}

function dispatchGradingSse(block, handlers) {
  const lines = block.split(/\n/)
  const eventLine = lines.find(line => line.startsWith('event:'))
  const dataLines = lines.filter(line => line.startsWith('data:'))
  const event = eventLine ? eventLine.slice(6).trim() : 'message'
  const rawData = dataLines.map(line => line.slice(5).trim()).join('\n')
  let data = {}
  try {
    data = rawData ? JSON.parse(rawData) : {}
  } catch {
    data = {}
  }
  if (event === 'progress') handlers.onProgress?.(data)
  else if (event === 'task') handlers.onTask?.(data)
  else if (event === 'open') handlers.onOpen?.(data)
  else handlers.onMessage?.(event, data)
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

// 教师端：把批改任务正式绑定到某个实验（experimentId=null 表示解绑）。
export function bindGradingTaskExperiment(id, experimentId) {
  return tapClient.put(`/api/grading/tasks/${id}/experiment`, { experimentId })
}

// 教师端：可绑定的实验列表（legacy 实验，用于绑定下拉）。
export function getBindableExperiments(params = {}) {
  return tapClient.get('/api/teacher/experiments', { params })
}

export function getSubmissionDetail(id) {
  return tapClient.get(`/api/grading/submissions/${id}`)
}

export function getSubmissionErrorDemonstrations(id) {
  return tapClient.get(`/api/grading/submissions/${id}/error-demonstrations`)
}

export function overrideSubmissionScore(id, data) {
  return tapClient.put(`/api/grading/submissions/${id}/scores`, data)
}

export function retryGradingSubmission(id) {
  return tapClient.post(`/api/grading/submissions/${id}/retry`)
}

export function preGenerateSubmissionResources(id) {
  return tapClient.post(`/api/grading/submissions/${id}/pre-generate`)
}

export function downloadSubmissionReport(id) {
  return tapClient.get(`/api/grading/reports/${id}`, { responseType: 'blob' })
}

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

export function generateFinalReview(submissionId) {
  return tapClient.post(`/api/grading/submissions/${submissionId}/generate-review`)
}

export function saveFinalReview(submissionId, finalReviewComment) {
  return tapClient.put(`/api/grading/submissions/${submissionId}/review`, { finalReviewComment })
}

export function publishSubmissionReport(submissionId) {
  return tapClient.post(`/api/grading/submissions/${submissionId}/publish-report`)
}

export function getGradingMatchCandidates(taskId) {
  return tapClient.get(`/api/grading/tasks/${taskId}/match-candidates`)
}

export function confirmSubmissionStudent(submissionId, studentId) {
  return tapClient.put(`/api/grading/submissions/${submissionId}/student-match`, { studentId })
}

export function publishSubmission(submissionId) {
  return tapClient.post(`/api/grading/submissions/${submissionId}/publish`)
}

export function revokeSubmissionPublication(submissionId) {
  return tapClient.delete(`/api/grading/submissions/${submissionId}/publish`)
}

export function publishConfirmedTask(taskId) {
  return tapClient.post(`/api/grading/tasks/${taskId}/publish-confirmed`)
}

export function revokeTaskPublications(taskId) {
  return tapClient.delete(`/api/grading/tasks/${taskId}/publish`)
}

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

// ========== Grading - Batch Review ==========
export function getBatchReview(taskId) {
  return tapClient.get(`/api/grading/tasks/${taskId}/batch-review`)
}

export function triggerBatchReview(taskId) {
  return tapClient.post(`/api/grading/tasks/${taskId}/batch-review`, null, { timeout: 120000 })
}
