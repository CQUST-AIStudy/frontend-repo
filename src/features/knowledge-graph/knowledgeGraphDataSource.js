/**
 * 知识图谱前端本地数据源。
 *
 * 图谱本体数据保存在浏览器 localStorage 中，不依赖后端 /api/knowledge-graphs。
 * 学生画像、提交记录等个性化数据仍由各自真实接口提供。
 */
import logger from '@/utils/logger'
import {
  GRAPH_CODE,
  GRAPH_SOURCE,
  GRAPH_VERSION,
  rawGraph
} from './dataStructureGraph'
import { toGraphDbPayload, validateGraph } from './graphDatabaseAdapter'

const STORAGE_SCHEMA_VERSION = 1
const STATIC_GRAPH_FALLBACK_MESSAGE = '尚未保存本地图谱，已使用内置初始图谱'

export const USE_STATIC_GRAPH_FALLBACK = true

export function getStaticSeedGraph() {
  return rawGraph
}

export function createEmptyKnowledgeGraph() {
  return {
    metadata: {
      title: '数据结构课程知识图谱',
      description: '',
      domain: 'computer-science',
      architecture: 'course-chapter',
      audience: 'student-and-teacher'
    },
    course: null,
    nodes: [],
    relations: []
  }
}

function graphStorageKey(graphCode = GRAPH_CODE) {
  return `kg:${graphCode || GRAPH_CODE}:graph:v1`
}

function hasLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function unwrapLocalPayload(value) {
  if (!value || typeof value !== 'object') return null
  if (value.payload && typeof value.payload === 'object') return value.payload
  if (value.graph && typeof value.graph === 'object') return toGraphDbPayload(value.graph)
  return value
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
    logger.warn('[knowledge-graph] 本地图谱契约校验失败', validation.errors)
    return null
  }

  return graph
}

function buildStorageEnvelope(payload, graphCode = GRAPH_CODE) {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    graphCode,
    graphVersion: GRAPH_VERSION,
    source: 'localStorage',
    updatedAt: new Date().toISOString(),
    payload
  }
}

function getErrorMessage(error) {
  return error?.friendlyMessage || error?.message || String(error)
}

function getCounts(payload) {
  return {
    nodes: Array.isArray(payload?.nodes) ? payload.nodes.length : 0,
    relations: Array.isArray(payload?.relations) ? payload.relations.length : 0
  }
}

function readLocalPayload(graphCode = GRAPH_CODE) {
  if (!hasLocalStorage()) return null
  const text = window.localStorage.getItem(graphStorageKey(graphCode))
  if (!text) return null
  try {
    return unwrapLocalPayload(JSON.parse(text))
  } catch (error) {
    logger.warn('[knowledge-graph] 读取本地图谱缓存失败', error)
    return null
  }
}

function writeLocalPayload(payload, graphCode = GRAPH_CODE) {
  if (!hasLocalStorage()) {
    throw new Error('浏览器本地存储不可用')
  }
  window.localStorage.setItem(
    graphStorageKey(graphCode),
    JSON.stringify(buildStorageEnvelope(payload, graphCode))
  )
}

export async function fetchKnowledgeGraph(graphCode = GRAPH_CODE) {
  const payload = readLocalPayload(graphCode)
  if (!payload) return null

  const graph = buildGraphFromPayload(payload)
  if (!graph) {
    logger.warn('[knowledge-graph] 本地未返回可用图谱')
    return null
  }
  return graph
}

/**
 * 加载知识图谱：浏览器本地存储优先；本地无数据时使用内置初始图谱。
 * @returns {Promise<{ source: 'local'|'static'|'empty', graph: object, fallbackReason?: string }>}
 */
export async function loadKnowledgeGraph() {
  try {
    const graph = await fetchKnowledgeGraph()
    if (graph) {
      return { source: 'local', graph }
    }
    if (USE_STATIC_GRAPH_FALLBACK) {
      return {
        source: 'static',
        graph: rawGraph,
        fallbackReason: STATIC_GRAPH_FALLBACK_MESSAGE
      }
    }
  } catch (error) {
    logger.warn('[knowledge-graph] 加载本地图谱失败', error)
    return {
      source: 'empty',
      graph: createEmptyKnowledgeGraph(),
      fallbackReason: `加载本地图谱失败：${getErrorMessage(error)}`
    }
  }

  return {
    source: 'empty',
    graph: createEmptyKnowledgeGraph(),
    fallbackReason: '暂无可用知识图谱数据'
  }
}

export async function writeKnowledgeGraph(payload) {
  const graphCode = payload?.graphCode || GRAPH_CODE
  const graph = buildGraphFromPayload(payload)

  if (!graph) {
    return {
      success: false,
      mode: 'local',
      written: false,
      error: 'invalid graph payload',
      message: '保存到本地失败：图谱数据结构不完整或校验未通过'
    }
  }

  const normalizedPayload = toGraphDbPayload(graph)
  const counts = getCounts(normalizedPayload)

  try {
    writeLocalPayload(normalizedPayload, graphCode)
    return {
      success: true,
      mode: 'local',
      written: true,
      data: normalizedPayload,
      counts,
      message: `已保存到浏览器本地存储：${counts.nodes} 个节点、${counts.relations} 条关系。`
    }
  } catch (error) {
    logger.warn('[knowledge-graph] 保存到本地失败', error)
    return {
      success: false,
      mode: 'local',
      written: false,
      error: getErrorMessage(error),
      message: `保存到本地失败：${getErrorMessage(error)}`
    }
  }
}

export async function seedKnowledgeGraph(graph = getStaticSeedGraph()) {
  if (!graph) {
    return {
      success: false,
      mode: 'local',
      written: false,
      error: 'missing seed graph',
      message: '导入内置图谱失败：没有可用种子数据'
    }
  }
  const payload = toGraphDbPayload(graph)
  const graphCode = payload.graphCode || GRAPH_CODE
  const counts = getCounts(payload)

  try {
    writeLocalPayload(payload, graphCode)
    return {
      success: true,
      mode: 'local',
      written: true,
      data: payload,
      counts,
      message: `已导入内置图谱到本地：${counts.nodes} 个节点、${counts.relations} 条关系。`
    }
  } catch (error) {
    logger.warn('[knowledge-graph] 导入内置图谱到本地失败', error)
    return {
      success: false,
      mode: 'local',
      written: false,
      error: getErrorMessage(error),
      message: `导入内置图谱失败：${getErrorMessage(error)}`
    }
  }
}

export { GRAPH_CODE, GRAPH_VERSION, GRAPH_SOURCE }
