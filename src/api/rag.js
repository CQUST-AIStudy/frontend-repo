import { getTapToken } from '../constants/auth'
import { buildRagApiUrl } from '../config/runtime'

function authHeaders(extra = {}) {
  const token = getTapToken()
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

async function readErrorMessage(response, fallback) {
  try {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const payload = await response.json()
      return payload?.message || payload?.detail || fallback
    }
    if (!contentType.includes('text/plain') && !contentType.includes('text/html')) {
      return fallback
    }
    const text = await response.text()
    return normalizeReadableErrorText(text) || fallback
  } catch {
    return fallback
  }
}

function normalizeReadableErrorText(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim()
  if (!value) return ''
  if (value.length > 240) return ''
  if (/^<(!doctype|html)/i.test(value)) return ''
  if (/(\uFFFD|�PNG|%PDF-|IDAT|IEND|JFIF|Exif)/i.test(value)) return ''
  return value
}

async function request(path, options = {}) {
  const response = await fetch(buildRagApiUrl(path), {
    credentials: 'include',
    ...options,
    headers: authHeaders(options.headers || {})
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `RAG 请求失败 (${response.status})`))
  }
  const payload = await response.json()
  if (payload?.code && payload.code !== 200) {
    throw new Error(payload.message || 'RAG 请求失败')
  }
  return payload?.data ?? payload
}

function jsonRequest(path, method, body) {
  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export function retrieveRag(payload) {
  return jsonRequest('/retrieve', 'POST', payload)
}

export function chatRag(payload) {
  return jsonRequest('/chat', 'POST', payload)
}

export function getKnowledgeBases(courseId = '') {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : ''
  return request(`/knowledge-base/list${query}`)
}

export const getCourseSpaces = getKnowledgeBases

export function createKnowledgeBase(data) {
  return jsonRequest('/knowledge-base', 'POST', normalizeKnowledgeBasePayload(data))
}

export const createCourseSpace = createKnowledgeBase

export function updateKnowledgeBase(id, data) {
  return jsonRequest(`/knowledge-base/${encodeURIComponent(id)}`, 'PUT', normalizeKnowledgeBasePayload(data))
}

export const updateCourseSpace = updateKnowledgeBase

export function deleteKnowledgeBase(id) {
  return request(`/knowledge-base/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export const deleteCourseSpace = deleteKnowledgeBase

export function getKnowledgeBaseDocuments(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/documents`)
}

export const getCourseSpaceDocuments = getKnowledgeBaseDocuments

export function getKnowledgeBaseDocumentStatusSummary(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/documents/status-summary`)
}

export const getCourseSpaceDocumentStatusSummary = getKnowledgeBaseDocumentStatusSummary

export function uploadKnowledgeBaseDocument(knowledgeBaseId, file, docType = 'textbook') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('docType', docType)
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/documents`, {
    method: 'POST',
    body: formData
  })
}

export const uploadCourseSpaceDocument = uploadKnowledgeBaseDocument

export function getKnowledgeBaseDocumentStatus(documentId) {
  return request(`/document/${encodeURIComponent(documentId)}/status`)
}

export const getCourseSpaceDocumentStatus = getKnowledgeBaseDocumentStatus

export function deleteKnowledgeBaseDocument(documentId) {
  return request(`/document/${encodeURIComponent(documentId)}`, { method: 'DELETE' })
}

export const deleteCourseSpaceDocument = deleteKnowledgeBaseDocument

export function reprocessAllKnowledgeBaseDocuments(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/documents/reprocess`, { method: 'POST' })
}

export const reprocessAllCourseSpaceDocuments = reprocessAllKnowledgeBaseDocuments

export function reprocessKnowledgeBaseDocument(knowledgeBaseId, documentId) {
  return request(
    `/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/documents/${encodeURIComponent(documentId)}/reprocess`,
    { method: 'POST' }
  )
}

export const reprocessCourseSpaceDocument = reprocessKnowledgeBaseDocument

export function rebuildKnowledgeBaseIndex(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/rebuild-bm25`, { method: 'POST' })
}

export const rebuildCourseSpaceBm25 = rebuildKnowledgeBaseIndex

export function getKnowledgeBaseChunks(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/chunks`)
}

export const getCourseSpaceChunks = getKnowledgeBaseChunks

export function createAnnotation(knowledgeBaseId, data) {
  return jsonRequest(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/annotations`, 'POST', data)
}

export function getAnnotations(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/annotations`)
}

export function deleteAnnotation(annotationId) {
  return request(`/annotations/${encodeURIComponent(annotationId)}`, { method: 'DELETE' })
}

export function submitRagFeedback(qaLogId, feedback) {
  return jsonRequest('/feedback', 'POST', { qaLogId, feedback })
}

export function getRagAnalytics(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/analytics`)
}

export function getHotQuestions(knowledgeBaseId, top = 20) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/analytics/hot-questions?top=${top}`)
}

export function getHitRate(knowledgeBaseId, threshold = 0.4) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/analytics/hit-rate?threshold=${threshold}`)
}

export function getCitationCoverage(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/analytics/citation-coverage`)
}

export function getWebTriggerRate(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/analytics/web-trigger-rate`)
}

export function getFeedbackStats(knowledgeBaseId) {
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/analytics/feedback-stats`)
}

export function getResourceGaps(knowledgeBaseId, coverageThreshold = 0.4, minFrequency = 3) {
  const params = new URLSearchParams({
    coverageThreshold: String(coverageThreshold),
    minFrequency: String(minFrequency)
  })
  return request(`/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/analytics/resource-gaps?${params}`)
}

export function getConversationHistory(conversationId) {
  return request(`/conversation/${encodeURIComponent(conversationId)}/history`)
}

export function deleteConversation(conversationId) {
  return request(`/conversation/${encodeURIComponent(conversationId)}`, { method: 'DELETE' })
}

export async function streamRagChat(payload, handlers = {}) {
  const response = await fetch(buildRagApiUrl('/chat/stream'), {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
    signal: handlers.signal
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `RAG 流式问答请求失败 (${response.status})`))
  }
  await readSse(response, handlers)
}

export async function ragChatStream(knowledgeBaseId, query, mode = 'strict', options = {}) {
  const response = await fetch(buildRagApiUrl('/chat/stream'), {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      query,
      knowledgeBaseIds: [String(knowledgeBaseId)],
      mode,
      options: {
        topK: options.topK || 10,
        rerankTopN: options.rerankTopN || 3,
        scoreThreshold: options.scoreThreshold ?? 0,
        enableRerank: options.enableRerank !== false,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens || 1024
      }
    }),
    signal: options.signal
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `RAG 流式问答请求失败 (${response.status})`))
  }
  return response
}

async function readSse(response, handlers = {}) {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('无法读取 RAG 流式响应')
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
      parts.forEach(part => dispatchSseEvent(part, handlers))
    }
  }
  if (buffer.trim()) dispatchSseEvent(buffer, handlers)
}

function dispatchSseEvent(block, handlers) {
  const lines = block.split(/\n/)
  const eventLine = lines.find(line => line.startsWith('event:'))
  const dataLines = lines.filter(line => line.startsWith('data:'))
  const event = eventLine ? eventLine.slice(6).trim() : 'message'
  const rawData = dataLines.map(line => line.slice(5).trim()).join('\n')
  let data = {}
  try {
    data = rawData ? JSON.parse(rawData) : {}
  } catch {
    data = { content: rawData }
  }
  if (event === 'retrieval') handlers.onRetrieval?.(data)
  else if (event === 'delta') handlers.onDelta?.(data)
  else if (event === 'done') handlers.onDone?.(data)
  else if (event === 'error') {
    const error = new Error(data.message || 'RAG 流式响应失败')
    handlers.onError?.(error, data)
    throw error
  } else {
    handlers.onMessage?.(event, data)
  }
}

export function normalizeSourcesForDisplay(sources = []) {
  return sources.map((source, index) => ({
    index: index + 1,
    docName: source.fileName || source.metadata?.title || source.documentId || '引用资料',
    chapterPath: source.metadata?.chapter || source.metadata?.chapterPath || '',
    pageRange: source.metadata?.page || source.metadata?.pageRange || '',
    score: source.rerankScore ?? source.score ?? 0,
    source: source.source || source.metadata?.source || 'knowledge_base',
    url: source.url || source.metadata?.url || '',
    content: source.chunkContent || source.content || ''
  }))
}

function normalizeKnowledgeBasePayload(data = {}) {
  return {
    name: data.name,
    description: data.description || '',
    courseId: data.courseId || '',
    courseName: data.courseName || '',
    term: data.term || '',
    embeddingModel: data.embeddingModel || 'text-embedding-v4',
    chunkSize: data.chunkSize || 512,
    chunkOverlap: data.chunkOverlap || 64,
    docVisibility: data.docVisibility || 'public',
    classIds: data.classIds || data.boundClassIds || [],
    defaultMode: data.defaultMode === 'open' ? 'open' : 'strict',
    allowWebSearch: !!data.allowWebSearch,
    requireCitation: data.requireCitation !== false
  }
}
