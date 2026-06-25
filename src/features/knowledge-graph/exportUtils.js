import { saveAs } from 'file-saver'
import { toGraphDbPayload } from './graphDatabaseAdapter'

export function exportGraphJSON(graph, filename = 'data-structure-graph.json') {
  const payload = toGraphDbPayload(graph)
  const text = JSON.stringify(payload, null, 2)
  saveAs(new Blob([text], { type: 'application/json;charset=utf-8' }), filename)
  return { success: true, mode: 'file', filename }
}
