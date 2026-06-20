import { getTapToken } from '../../constants/auth'
import { TAP_BASE, tapClient } from './client'
import { parseFetchPayload, resolveFetchErrorMessage } from './fetchUtils'

export { readFetchErrorMessage } from './fetchUtils'

export function getDocuments() {
  return tapClient.get('/api/documents')
}

export function deleteDocument(docId) {
  return tapClient.delete(`/api/documents/${docId}`)
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
