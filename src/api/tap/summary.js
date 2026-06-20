import { tapClient } from './client'

export function summarizeArxiv(arxivId, force = false) {
  return tapClient.get(`/api/papers/${encodeURIComponent(arxivId)}/summary`, {
    params: { force },
    timeout: 300000
  })
}

export function summarizeDoi(doi) {
  return tapClient.post('/api/papers/doi/summary', { doi })
}

export function summarizeFreeText(title, text) {
  return tapClient.post('/api/papers/freetext/summary', { title, text })
}

export function summarizeDocument(docId, force = false) {
  return tapClient.get(`/api/documents/${docId}/summary`, {
    params: { force }
  })
}
