export const GRAPH_CODE = 'data-structure-knowledge-graph'
export const GRAPH_VERSION = '1.3.0'
export const GRAPH_SOURCE = {
  system: 'frontend-repo',
  scenario: 'course-chapter-knowledge-graph',
  origin: 'backend-api'
}

export const NODE_TYPES = {
  course: {
    label: '课程',
    color: '#1270d8',
    softColor: '#f1d5c2',
    textColor: '#fff',
    icon: 'library'
  },
  chapter: {
    label: '章节',
    color: '#0f766e',
    softColor: '#ccfbf1',
    textColor: '#134e4a',
    icon: 'folder'
  },
  concept: {
    label: '概念',
    color: '#7c3aed',
    softColor: '#ede9fe',
    textColor: '#5b21b6',
    icon: 'tags'
  },
  structure: {
    label: '结构',
    color: '#ea580c',
    softColor: '#ffedd5',
    textColor: '#9a3412',
    icon: 'layout-grid'
  },
  algorithm: {
    label: '算法',
    color: '#0ea5e9',
    softColor: '#e0f2fe',
    textColor: '#075985',
    icon: 'sparkles'
  },
  operation: {
    label: '操作',
    color: '#f59e0b',
    softColor: '#fef3c7',
    textColor: '#92400e',
    icon: 'clipboard-check'
  },
  exercise: {
    label: '练习',
    color: '#ef4444',
    softColor: '#fee2e2',
    textColor: '#991b1b',
    icon: 'target'
  }
}

export const RELATION_TYPES = {
  CONTAINS: {
    label: '包含',
    color: '#94a3b8'
  },
  PREREQUISITE: {
    label: '前置',
    color: '#7c3aed'
  },
  RELATED_TO: {
    label: '相关',
    color: '#0ea5e9'
  },
  APPLIES_TO: {
    label: '应用于',
    color: '#ea580c'
  },
  TESTED_BY: {
    label: '考察于',
    color: '#ef4444'
  }
}

export const nodeTypeOptions = [
  { label: '全部类型', value: 'all' },
  ...Object.entries(NODE_TYPES).map(([value, meta]) => ({ value, label: meta.label }))
]

export const relationTypeOptions = [
  { label: '全部关系', value: 'all' },
  ...Object.entries(RELATION_TYPES).map(([value, meta]) => ({ value, label: meta.label }))
]

export function getNodeTypeMeta(type) {
  return NODE_TYPES[type] || {
    label: type || '未知',
    color: '#64748b',
    softColor: '#f1f5f9',
    textColor: '#334155',
    icon: 'circle'
  }
}

export function getRelationTypeMeta(type) {
  return RELATION_TYPES[type] || {
    label: type || '未知关系',
    color: '#94a3b8'
  }
}

