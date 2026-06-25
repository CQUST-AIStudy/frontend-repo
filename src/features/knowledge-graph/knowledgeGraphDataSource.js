import { GRAPH_CODE, GRAPH_SOURCE, GRAPH_VERSION } from './dataStructureGraph'

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

export async function fetchKnowledgeGraph() {
  return null
}

export async function loadKnowledgeGraph() {
  const graph = await fetchKnowledgeGraph()
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
