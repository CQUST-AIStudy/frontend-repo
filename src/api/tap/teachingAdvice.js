import { tapClient } from './client'

export function getTeachingAdviceOptions() {
  return tapClient.get('/api/teacher/teaching-advice/options')
}

export function getTeachingAdviceContext(params) {
  return tapClient.get('/api/teacher/teaching-advice/context', { params })
}

export function generateTeachingAdvice(data) {
  return tapClient.post('/api/teacher/teaching-advice/reports', data)
}

export function getTeachingAdviceReports() {
  return tapClient.get('/api/teacher/teaching-advice/reports')
}

export function getTeachingAdviceReport(reportId) {
  return tapClient.get(`/api/teacher/teaching-advice/reports/${reportId}`)
}
