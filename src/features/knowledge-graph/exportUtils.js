/**
 * 知识图谱导出 / 本地保存工具。
 * - 导出 JSON（复用 toGraphDbPayload）
 * - 保存到浏览器本地存储，不依赖后端知识图谱接口
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

export function saveGraphToLocal(graph) {
  const payload = toGraphDbPayload(graph)
  return writeKnowledgeGraph(payload)
}

export function seedGraphToLocal(graph) {
  return seedKnowledgeGraph(graph)
}

export function saveGraphToBackend(graph) {
  return saveGraphToLocal(graph)
}

export function seedGraphToBackend(graph) {
  return seedGraphToLocal(graph)
}
