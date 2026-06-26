import { fetchGraph } from '../../api/knowledgeGraph'
import { GRAPH_CODE, GRAPH_SOURCE, GRAPH_VERSION } from './dataStructureGraph'
import logger from '@/utils/logger'

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

export async function fetchKnowledgeGraph(userId = '') {
  try {
    const data = await fetchGraph(GRAPH_CODE, { userId })
    if (data && (data.nodes || data.course)) {
      return data
    }
    return null
  } catch (err) {
    logger.warn('[knowledgeGraph] fetchKnowledgeGraph failed:', err?.message || err)
    return null
  }
}

export async function loadKnowledgeGraph(options = {}) {
  const graph = await fetchKnowledgeGraph(options.userId || '')
  if (graph) {
    return { source: 'backend', graph }
  }

  return {
    source: 'empty',
    graph: createEmptyKnowledgeGraph(),
    fallbackReason: '暂无可用知识图谱数据'
  }
}

export { GRAPH_CODE, GRAPH_VERSION, GRAPH_SOURCE }
