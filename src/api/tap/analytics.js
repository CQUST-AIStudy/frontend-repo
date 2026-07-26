import { tapClient } from './client'

function normalizeScopeParams(scope = {}) {
  if (typeof scope === 'string') return scope ? { classPrefix: scope } : {}
  return Object.fromEntries(Object.entries(scope || {}).filter(([, value]) => (
    value !== null && value !== undefined && String(value).trim() !== ''
  )))
}

export function getAnalyticsExperiments(scope) {
  return tapClient.get('/api/analytics/experiments', {
    params: normalizeScopeParams(scope)
  })
}

export function getClassPrefixes(scope) {
  return tapClient.get('/api/analytics/class-prefixes', {
    params: normalizeScopeParams(scope)
  })
}

export function getExperimentAnalytics(experimentId, scope) {
  return tapClient.get(`/api/analytics/experiments/${experimentId}`, {
    params: normalizeScopeParams(scope)
  })
}

export function getExperimentComparison(scope) {
  return tapClient.get('/api/analytics/comparison', {
    params: normalizeScopeParams(scope)
  })
}

export function getStudentAnalyticsOverview(studentId) {
  return tapClient.get(`/api/analytics/student/${studentId}/overview`)
}

export function getStudentExperimentDetail(studentId, experimentId) {
  return tapClient.get(`/api/analytics/student/${studentId}/experiments/${experimentId}`)
}
