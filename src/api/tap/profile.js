import { tapClient } from './client'

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
