import {
  GRAPH_CODE,
  GRAPH_SOURCE,
  GRAPH_VERSION,
  RELATION_TYPES,
  getNodeTypeMeta,
  getRelationTypeMeta,
  rawGraph
} from './dataStructureGraph'

function cloneProperties(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? { ...value }
    : {}
}

function normalizeNode(node = {}) {
  const properties = cloneProperties(node.properties)
  const summary = node.summary || properties.summary || ''
  return {
    id: String(node.id || '').trim(),
    label: String(node.label || node.name || '').trim(),
    type: String(node.type || 'concept').trim(),
    chapterId: node.chapterId ? String(node.chapterId).trim() : null,
    summary,
    properties: {
      ...properties,
      summary,
      keywords: Array.isArray(properties.keywords) ? [...properties.keywords] : [],
      studyTip: properties.studyTip || '',
      definition: properties.definition || '',
      order: properties.order ?? null,
      difficulty: properties.difficulty || null,
      estimatedMinutes: properties.estimatedMinutes ?? null
    },
    prerequisites: Array.isArray(node.prerequisites) ? [...new Set(node.prerequisites.map(item => String(item).trim()).filter(Boolean))] : [],
    related: Array.isArray(node.related) ? [...new Set(node.related.map(item => String(item).trim()).filter(Boolean))] : [],
    appliesTo: Array.isArray(node.appliesTo) ? [...new Set(node.appliesTo.map(item => String(item).trim()).filter(Boolean))] : [],
    targets: Array.isArray(node.targets) ? [...new Set(node.targets.map(item => String(item).trim()).filter(Boolean))] : []
  }
}

function makeRelationId(source, target, type) {
  return `${source}__${type}__${target}`
}

function addRelation(list, seen, source, target, type, properties = {}) {
  const normalizedSource = String(source || '').trim()
  const normalizedTarget = String(target || '').trim()
  const normalizedType = String(type || '').trim()
  if (!normalizedSource || !normalizedTarget || !normalizedType) return
  const id = makeRelationId(normalizedSource, normalizedTarget, normalizedType)
  if (seen.has(id)) return
  seen.add(id)
  list.push({
    id,
    source: normalizedSource,
    target: normalizedTarget,
    type: normalizedType,
    properties: cloneProperties(properties)
  })
}

function buildRelations(nodes) {
  const relations = []
  const seen = new Set()
  const nodeMap = new Map(nodes.map(node => [node.id, node]))

  for (const node of nodes) {
    if (node.type === 'chapter' && node.id !== rawGraph.course.id) {
      addRelation(relations, seen, rawGraph.course.id, node.id, 'CONTAINS', {
        scope: 'course-chapter'
      })
    }

    if (node.chapterId && nodeMap.has(node.chapterId)) {
      addRelation(relations, seen, node.chapterId, node.id, 'CONTAINS', {
        scope: 'chapter-node'
      })
    }

    for (const prerequisite of node.prerequisites) {
      addRelation(relations, seen, prerequisite, node.id, 'PREREQUISITE', {
        kind: 'knowledge-order'
      })
    }

    for (const relatedId of node.related) {
      addRelation(relations, seen, node.id, relatedId, 'RELATED_TO', {
        kind: 'association'
      })
    }

    for (const appliedTarget of node.appliesTo) {
      addRelation(relations, seen, node.id, appliedTarget, 'APPLIES_TO', {
        kind: 'application'
      })
    }

    if (node.type === 'exercise') {
      for (const targetId of node.targets) {
        addRelation(relations, seen, targetId, node.id, 'TESTED_BY', {
          kind: 'exercise-link'
        })
      }
    }
  }

  return relations
}

export function normalizeGraph(graph = rawGraph) {
  const course = normalizeNode(graph.course || rawGraph.course)
  const nodes = [
    course,
    ...(Array.isArray(graph.nodes) ? graph.nodes : []).map(normalizeNode)
  ].filter(node => node.id && node.label)

  const relations = Array.isArray(graph.relations) && graph.relations.length > 0
    ? graph.relations.map(relation => ({
        id: String(relation.id || makeRelationId(relation.source, relation.target, relation.type)),
        source: String(relation.source || '').trim(),
        target: String(relation.target || '').trim(),
        type: String(relation.type || '').trim(),
        properties: cloneProperties(relation.properties)
      }))
    : buildRelations(nodes)

  const nodeMap = new Map(nodes.map(node => [node.id, node]))
  const outgoingByNodeId = new Map()
  const incomingByNodeId = new Map()

  for (const relation of relations) {
    if (!outgoingByNodeId.has(relation.source)) outgoingByNodeId.set(relation.source, [])
    if (!incomingByNodeId.has(relation.target)) incomingByNodeId.set(relation.target, [])
    outgoingByNodeId.get(relation.source).push(relation)
    incomingByNodeId.get(relation.target).push(relation)
  }

  return {
    metadata: cloneProperties(graph.metadata),
    course,
    nodes,
    relations,
    nodeMap,
    outgoingByNodeId,
    incomingByNodeId
  }
}

export function validateGraph(graph = rawGraph) {
  const normalized = normalizeGraph(graph)
  const errors = []
  const nodeIds = new Set()
  const relationIds = new Set()

  normalized.nodes.forEach((node) => {
    if (nodeIds.has(node.id)) {
      errors.push(`重复的节点 id: ${node.id}`)
      return
    }
    nodeIds.add(node.id)
  })

  normalized.relations.forEach((relation) => {
    if (relationIds.has(relation.id)) {
      errors.push(`重复的关系 id: ${relation.id}`)
      return
    }
    relationIds.add(relation.id)

    if (!nodeIds.has(relation.source)) {
      errors.push(`关系 ${relation.id} 的 source 不存在: ${relation.source}`)
    }
    if (!nodeIds.has(relation.target)) {
      errors.push(`关系 ${relation.id} 的 target 不存在: ${relation.target}`)
    }
    if (!RELATION_TYPES[relation.type]) {
      errors.push(`非法关系类型: ${relation.type}`)
    }
  })

  if (!nodeIds.has(normalized.course.id)) {
    errors.push('课程根节点不存在')
  }

  if (!normalized.nodes.some(node => node.type === 'chapter')) {
    errors.push('至少需要一个章节节点')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function getGraphStats(graph = rawGraph) {
  const normalized = normalizeGraph(graph)
  const nodeTypeCounts = normalized.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1
    return acc
  }, {})
  const relationTypeCounts = normalized.relations.reduce((acc, relation) => {
    acc[relation.type] = (acc[relation.type] || 0) + 1
    return acc
  }, {})

  return {
    totalNodes: normalized.nodes.length,
    totalRelations: normalized.relations.length,
    nodeTypeCounts,
    relationTypeCounts,
    chapterCount: nodeTypeCounts.chapter || 0,
    structureCount: nodeTypeCounts.structure || 0,
    algorithmCount: nodeTypeCounts.algorithm || 0,
    exerciseCount: nodeTypeCounts.exercise || 0
  }
}

export function getAncestorChain(graph = rawGraph, nodeId) {
  const normalized = normalizeGraph(graph)
  const node = normalized.nodeMap.get(nodeId)
  if (!node) return []

  if (node.type === 'course') return [node]
  if (node.type === 'chapter') {
    return [normalized.course, node].filter(Boolean)
  }

  const chapter = node.chapterId ? normalized.nodeMap.get(node.chapterId) : null
  return [normalized.course, chapter, node].filter(Boolean)
}

export function getNodeContext(graph = rawGraph, nodeId) {
  const normalized = normalizeGraph(graph)
  const node = normalized.nodeMap.get(nodeId)
  if (!node) return null

  const incoming = normalized.incomingByNodeId.get(node.id) || []
  const outgoing = normalized.outgoingByNodeId.get(node.id) || []
  const prerequisites = incoming
    .filter(relation => relation.type === 'PREREQUISITE')
    .map(relation => normalized.nodeMap.get(relation.source))
    .filter(Boolean)
  const nextNodes = outgoing
    .filter(relation => relation.type === 'PREREQUISITE')
    .map(relation => normalized.nodeMap.get(relation.target))
    .filter(Boolean)
  const relatedNodes = [
    ...incoming.filter(relation => relation.type === 'RELATED_TO').map(relation => normalized.nodeMap.get(relation.source)),
    ...outgoing.filter(relation => relation.type === 'RELATED_TO').map(relation => normalized.nodeMap.get(relation.target)),
    ...outgoing.filter(relation => relation.type === 'APPLIES_TO').map(relation => normalized.nodeMap.get(relation.target)),
    ...incoming.filter(relation => relation.type === 'APPLIES_TO').map(relation => normalized.nodeMap.get(relation.source))
  ].filter(Boolean)
  const exercises = outgoing
    .filter(relation => relation.type === 'TESTED_BY')
    .map(relation => normalized.nodeMap.get(relation.target))
    .filter(Boolean)

  return {
    node,
    ancestorChain: getAncestorChain(normalized, node.id),
    prerequisites,
    nextNodes,
    relatedNodes,
    exercises,
    incoming,
    outgoing
  }
}

export function toGraphDbPayload(graph = rawGraph) {
  const normalized = normalizeGraph(graph)
  return {
    graphCode: GRAPH_CODE,
    version: GRAPH_VERSION,
    source: GRAPH_SOURCE,
    metadata: normalized.metadata,
    nodes: normalized.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      type: node.type,
      properties: {
        ...cloneProperties(node.properties),
        summary: node.summary,
        chapterId: node.chapterId,
        prerequisites: [...node.prerequisites],
        related: [...node.related],
        appliesTo: [...node.appliesTo],
        targets: [...node.targets]
      }
    })),
    relations: normalized.relations.map((relation) => ({
      id: relation.id,
      source: relation.source,
      target: relation.target,
      type: relation.type,
      properties: cloneProperties(relation.properties)
    }))
  }
}

export async function saveKnowledgeGraph(payload) {
  // 前端只提交标准 payload，数据库持久化由后端 API 负责。
  const { writeKnowledgeGraph } = await import('./knowledgeGraphDataSource')
  return writeKnowledgeGraph(payload)
}

export { getNodeTypeMeta, getRelationTypeMeta }
