import { tapClient } from './client'

export function getTeachingClasses() {
  return tapClient.get('/api/classes')
}

export function getStudentClasses() {
  return tapClient.get('/api/student-classes')
}

export function createTeachingClass(data) {
  return tapClient.post('/api/classes', data)
}

export function updateTeachingClass(id, data) {
  return tapClient.put(`/api/classes/${id}`, data)
}

export function deleteTeachingClass(id, options = {}) {
  return tapClient.delete(`/api/classes/${id}`, {
    params: { force: options.force === true }
  })
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

export function resetStudentPassword(classId, studentId, data) {
  return tapClient.post(`/api/classes/${classId}/students/${studentId}/reset-password`, data)
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
