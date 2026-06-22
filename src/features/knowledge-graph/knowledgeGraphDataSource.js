/**
 * 知识图谱后端数据源。
 *
 * 前端只调用后端 API，不直连数据库；MySQL 表结构、事务和持久化由后端负责。
 * 默认接口约定：
 * - GET  /api/knowledge-graphs/{graphCode}
 * - PUT  /api/knowledge-graphs/{graphCode}
 * - POST /api/knowledge-graphs/{graphCode}/seed
 */
import { tapClient } from '@/api/tap/client'
import logger from '@/utils/logger'
import {
  GRAPH_CODE,
  GRAPH_SOURCE,
  GRAPH_VERSION,
  rawGraph
} from './dataStructureGraph'
import { toGraphDbPayload, validateGraph } from './graphDatabaseAdapter'

const API_BASE = '/api/knowledge-graphs'

function unwrapApiPayload(response) {
  const body = response?.data ?? response
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data
  }
  return body
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (value == null) return []
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // keep single string value below
    }
    return value ? [value] : []
  }
  return Array.from(value)
}

function toStringArray(value) {
  return toArray(value).map(item => String(item)).filter(Boolean)
}

function toObject(value) {
  if (!value) return {}
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return typeof value === 'object' && !Array.isArray(value) ? { ...value } : {}
}

function mapBackendNode(node = {}) {
  const properties = toObject(node.properties ?? node.propertiesJson ?? node.properties_json)
  const summary = node.summary || properties.summary || ''
  const chapterId = node.chapterId ?? node.chapter_id ?? properties.chapterId ?? null
  return {
    id: String(node.id || node.nodeId || node.node_id || '').trim(),
    label: String(node.label || node.nodeLabel || node.node_label || node.name || '').trim(),
    type: String(node.type || node.nodeType || node.node_type || properties.type || 'concept').trim(),
    chapterId: chapterId ? String(chapterId) : null,
    summary,
    prerequisites: toStringArray(node.prerequisites ?? properties.prerequisites),
    related: toStringArray(node.related ?? properties.related),
    appliesTo: toStringArray(node.appliesTo ?? properties.appliesTo),
    targets: toStringArray(node.targets ?? properties.targets),
    properties: {
      definition: properties.definition || '',
      studyTip: properties.studyTip || '',
      keywords: toArray(properties.keywords),
      ...properties,
      summary
    }
  }
}

function mapBackendRelation(relation = {}) {
  const source = relation.source ?? relation.sourceNodeId ?? relation.source_node_id
  const target = relation.target ?? relation.targetNodeId ?? relation.target_node_id
  const type = relation.type ?? relation.relationType ?? relation.relation_type
  return {
    id: String(relation.id || `${source || ''}__${type || ''}__${target || ''}`),
    source: String(source || '').trim(),
    target: String(target || '').trim(),
    type: String(type || '').trim(),
    properties: toObject(relation.properties ?? relation.propertiesJson ?? relation.properties_json)
  }
}

function buildGraphFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return null

  const mappedNodes = Array.isArray(payload.nodes)
    ? payload.nodes.map(mapBackendNode).filter(node => node.id && node.label)
    : []
  const course = payload.course
    ? mapBackendNode(payload.course)
    : mappedNodes.find(node => node.type === 'course')

  if (!course?.id) return null

  const graph = {
    metadata: {
      ...(payload.metadata || {}),
      title: payload.metadata?.title || GRAPH_SOURCE.scenario,
      domain: payload.metadata?.domain || 'computer-science'
    },
    course,
    nodes: mappedNodes.filter(node => node.id !== course.id),
    relations: Array.isArray(payload.relations)
      ? payload.relations.map(mapBackendRelation).filter(relation => relation.source && relation.target && relation.type)
      : []
  }

  if (!graph.nodes.length) return null

  const validation = validateGraph(graph)
  if (!validation.valid) {
    logger.warn('[knowledge-graph] 后端图谱契约校验失败', validation.errors)
    return null
  }

  return graph
}

function getErrorMessage(error) {
  return error?.friendlyMessage || error?.message || String(error)
}

function getFailureMessage(response, fallback) {
  return response?.message || response?.error || fallback
}

export async function fetchKnowledgeGraph(graphCode = GRAPH_CODE) {
  try {
    const response = await tapClient.get(`${API_BASE}/${encodeURIComponent(graphCode)}`)
    const graph = buildGraphFromPayload(unwrapApiPayload(response))
    if (!graph) {
      logger.warn('[knowledge-graph] 后端未返回可用图谱，回退静态数据')
      return null
    }
    return graph
  } catch (error) {
    logger.warn('[knowledge-graph] 加载后端图谱失败，回退静态数据', error)
    return null
  }
}

/**
 * 加载知识图谱：后端 MySQL API 优先，失败/空/结构不合法时自动回退静态 rawGraph。
 * @returns {Promise<{ source: 'backend'|'static', graph: object, fallbackReason?: string }>}
 */
export async function loadKnowledgeGraph() {
  const graph = await fetchKnowledgeGraph()
  if (graph) {
    return { source: 'backend', graph }
  }
  return {
    source: 'static',
    graph: rawGraph,
    fallbackReason: '后端图谱数据不可用，已回退到内置静态图谱'
  }
}

export async function writeKnowledgeGraph(payload) {
  const graphCode = payload?.graphCode || GRAPH_CODE
  const nodes = Array.isArray(payload?.nodes) ? payload.nodes : []
  const relations = Array.isArray(payload?.relations) ? payload.relations : []

  try {
    const response = await tapClient.put(`${API_BASE}/${encodeURIComponent(graphCode)}`, payload)
    if (response?.success === false) {
      return {
        success: false,
        mode: 'backend',
        written: false,
        error: getFailureMessage(response, '后端返回保存失败'),
        message: `保存到后端失败：${getFailureMessage(response, '后端返回保存失败')}`
      }
    }
    const data = unwrapApiPayload(response)
    return {
      success: true,
      mode: 'backend',
      written: true,
      data,
      counts: data?.counts || { nodes: nodes.length, relations: relations.length },
      message: `已提交 ${nodes.length} 个节点、${relations.length} 条关系到后端。`
    }
  } catch (error) {
    logger.warn('[knowledge-graph] 保存到后端失败', error)
    return {
      success: false,
      mode: 'backend',
      written: false,
      error: getErrorMessage(error),
      message: `保存到后端失败：${getErrorMessage(error)}`
    }
  }
}

export async function seedKnowledgeGraph(graph = rawGraph) {
  const payload = toGraphDbPayload(graph)
  const graphCode = payload.graphCode || GRAPH_CODE
  const nodes = Array.isArray(payload.nodes) ? payload.nodes : []
  const relations = Array.isArray(payload.relations) ? payload.relations : []

  try {
    const response = await tapClient.post(`${API_BASE}/${encodeURIComponent(graphCode)}/seed`, payload)
    if (response?.success === false) {
      return {
        success: false,
        mode: 'backend',
        written: false,
        error: getFailureMessage(response, '后端返回导入失败'),
        message: `导入种子数据失败：${getFailureMessage(response, '后端返回导入失败')}`
      }
    }
    const data = unwrapApiPayload(response)
    return {
      success: true,
      mode: 'backend',
      written: true,
      data,
      counts: data?.counts || { nodes: nodes.length, relations: relations.length },
      message: `已提交种子图谱：${nodes.length} 个节点、${relations.length} 条关系。`
    }
  } catch (error) {
    logger.warn('[knowledge-graph] 导入种子图谱到后端失败', error)
    return {
      success: false,
      mode: 'backend',
      written: false,
      error: getErrorMessage(error),
      message: `导入种子数据失败：${getErrorMessage(error)}`
    }
  }
}

export { GRAPH_CODE, GRAPH_VERSION, GRAPH_SOURCE }
