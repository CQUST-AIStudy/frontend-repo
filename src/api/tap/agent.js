import { tapClient } from './client'

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
