/**
 * 学习状态管理（掌握度 / 收藏 / 笔记）
 *
 * 仅在前端 localStorage 中按 graphCode + nodeId 存储，叠加渲染，不污染原始图谱数据。
 * mastery 枚举：unstarted(未学习) | learning(学习中) | mastered(已掌握)
 */
import { ref } from 'vue'
import { GRAPH_CODE } from './dataStructureGraph'

export const MASTERY_LEVELS = [
  { value: 'unstarted', label: '未学习', color: '#94a3b8' },
  { value: 'learning', label: '学习中', color: '#f59e0b' },
  { value: 'mastered', label: '已掌握', color: '#22c55e' }
]

const MASTERY_MAP = new Map(MASTERY_LEVELS.map((item) => [item.value, item]))

export function getMasteryMeta(value) {
  return MASTERY_MAP.get(value) || MASTERY_MAP.get('unstarted')
}

function storageKey(graphCode) {
  return `kg:${graphCode || GRAPH_CODE}:state`
}

function safeParse(text) {
  if (!text) return {}
  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function readAll(graphCode) {
  if (typeof window === 'undefined' || !window.localStorage) return {}
  return safeParse(window.localStorage.getItem(storageKey(graphCode)))
}

function writeAll(graphCode, state) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.setItem(storageKey(graphCode), JSON.stringify(state))
  } catch {
    // 容量超限或隐私模式，静默失败
  }
}

const DEFAULT_NODE_STATE = {
  mastery: 'unstarted',
  favorite: false,
  note: '',
  updatedAt: 0
}

function normalizeNodeState(raw = {}) {
  return {
    ...DEFAULT_NODE_STATE,
    ...raw,
    mastery: MASTERY_MAP.has(raw.mastery) ? raw.mastery : 'unstarted',
    favorite: Boolean(raw.favorite),
    note: typeof raw.note === 'string' ? raw.note : ''
  }
}

export function getLearningState(graphCode = GRAPH_CODE) {
  const raw = readAll(graphCode)
  const result = {}
  for (const [nodeId, state] of Object.entries(raw)) {
    result[nodeId] = normalizeNodeState(state)
  }
  return result
}

export function getNodeState(graphCode, nodeId) {
  const code = graphCode || GRAPH_CODE
  const raw = readAll(code)
  return normalizeNodeState(raw[nodeId])
}

export function setNodeState(graphCode, nodeId, patch = {}) {
  const code = graphCode || GRAPH_CODE
  const state = readAll(code)
  const next = normalizeNodeState({ ...state[nodeId], ...patch, updatedAt: Date.now() })
  state[nodeId] = next
  writeAll(code, state)
  return next
}

export function clearAll(graphCode = GRAPH_CODE) {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.removeItem(storageKey(graphCode))
}

/**
 * 提供 graphCode 维度的响应式学习状态（ref + localStorage 同步）。
 * @param {string} graphCode
 */
export function useStateForGraph(graphCode = GRAPH_CODE) {
  const state = ref(getLearningState(graphCode))

  function reload() {
    state.value = getLearningState(graphCode)
  }

  function update(nodeId, patch) {
    const next = setNodeState(graphCode, nodeId, patch)
    state.value = { ...state.value, [nodeId]: next }
    return next
  }

  function clear() {
    clearAll(graphCode)
    state.value = {}
  }

  return { state, reload, update, clear }
}
