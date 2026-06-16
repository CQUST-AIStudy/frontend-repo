import { tapClient } from './client'

export function translateDocument(docId, targetLang = 'ZH', force = false) {
  return tapClient.get(`/api/documents/${docId}/translate`, {
    params: { targetLang, force }
  })
}
