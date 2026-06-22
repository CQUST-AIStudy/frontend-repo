/**
 * 知识图谱导出 / 保存工具。
 * - 导出 JSON（复用 toGraphDbPayload）
 * - 保存到后端 API，由后端落 MySQL
 */
import { saveAs } from 'file-saver'
import { toGraphDbPayload } from './graphDatabaseAdapter'
import { seedKnowledgeGraph, writeKnowledgeGraph } from './knowledgeGraphDataSource'

export function exportGraphJSON(graph, filename = 'data-structure-graph.json') {
  const payload = toGraphDbPayload(graph)
  const text = JSON.stringify(payload, null, 2)
  saveAs(new Blob([text], { type: 'application/json;charset=utf-8' }), filename)
  return { success: true, mode: 'file', filename }
}

export function saveGraphToBackend(graph) {
  const payload = toGraphDbPayload(graph)
  return writeKnowledgeGraph(payload)
}

export function seedGraphToBackend(graph) {
  return seedKnowledgeGraph(graph)
}
