import { tapClient } from './client'

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
