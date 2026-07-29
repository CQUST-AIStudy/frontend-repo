import { apiClient } from './index'

/**
 * 错题本 (Wrong Answer Notebook) API client.
 * All endpoints are scoped to the current student session.
 */
export const wrongNotebookApi = {
  list(params = {}) {
    return apiClient.get('/api/student/wrong-questions', { params })
  },

  stats() {
    return apiClient.get('/api/student/wrong-questions/stats')
  },

  ptaErrors(params = {}) {
    return apiClient.get('/api/student/wrong-questions/pta-errors', { params })
  },

  detail(id) {
    return apiClient.get(`/api/student/wrong-questions/${id}`)
  },

  updateNote(id, note) {
    return apiClient.patch(`/api/student/wrong-questions/${id}`, { note })
  },

  remove(id) {
    return apiClient.delete(`/api/student/wrong-questions/${id}`)
  },

  retry(id, payload) {
    return apiClient.post(`/api/student/wrong-questions/${id}/retry`, payload)
  },

  record(payload) {
    return apiClient.post('/api/student/wrong-questions/record', payload)
  }
}

export default wrongNotebookApi
