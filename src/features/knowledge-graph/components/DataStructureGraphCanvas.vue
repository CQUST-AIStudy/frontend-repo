<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch, nextTick } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'
import { getNodeTypeMeta, getRelationTypeMeta } from '../graphDatabaseAdapter'
import { getMasteryMeta } from '../learningState'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  relations: { type: Array, default: () => [] },
  selectedNodeId: { type: String, default: '' },
  highlightPaths: { type: Object, default: null },
  chapterChildCounts: { type: Object, default: () => ({}) },
  learningState: { type: Object, default: () => ({}) },
  // 个人学习模式：nodeId → { level, score, isWeak, evidence, experimentId }
  masteryMap: { type: Object, default: () => ({}) },
  // 当前选中节点的提交版本链数据 { nodeId, submissions: [...] }
  submissionTrace: { type: Object, default: null }
})

const emit = defineEmits(['select-node', 'trace-node', 'select-submission'])

// ───────── 视图常量 ─────────
const VB_W = 1600
const VB_H = 1200
const VB_X = -VB_W / 2
const VB_Y = -VB_H / 2
const viewBoxStr = `${VB_X} ${VB_Y} ${VB_W} ${VB_H}`

// 节点半径（像素，对应原 3D 版的 SIZE_BY_TYPE×16 比例放大）
const RADIUS_BY_TYPE = {
  course: 46,
  chapter: 30,
  concept: 18,
  structure: 19,
  algorithm: 18,
  operation: 16,
  exercise: 15
}

const CHAPTER_RADIUS_DEFAULT = 400
const CHAPTER_RADIUS_LARGE = 460   // chapters.length > 5
const ORBIT_RADIUS_MIN = 140
const ORBIT_RADIUS_MAX = 240
const SCALE_MIN = 0.4
const SCALE_MAX = 3.0
const SCALE_STEP = 1.12
const DRAG_THRESHOLD = 4

// ───────── refs ─────────
const shellRef = ref(null)
const stageRef = ref(null)
const svgRef = ref(null)
const isFullscreen = ref(false)
const motionEnabled = ref(true)
const hoveredNode = shallowRef(null)
const hoveredSubmission = shallowRef(null)
const expandedChapterId = ref('')   // 当前展开的 chapter id（互斥单值）

const viewport = reactive({ x: 0, y: 0, scale: 1 })
const isDragging = ref(false)
const dragState = {
  startX: 0,
  startY: 0,
  vx: 0,
  vy: 0,
  moved: false
}

const hasGraphData = computed(() => props.nodes.length > 0)

// ───────── 图例 ─────────
const nodeTypeLegend = computed(() => {
  const typeSet = new Set(props.nodes.map((node) => node.type).filter(Boolean))
  return Array.from(typeSet).map((type) => ({ type, ...getNodeTypeMeta(type) }))
})

const relationTypeLegend = computed(() => {
  const typeSet = new Set(props.relations.map((relation) => relation.type).filter(Boolean))
  return Array.from(typeSet).map((type) => ({ type, ...getRelationTypeMeta(type) }))
})

// ───────── tooltip 计算属性（与原 3D 版一致） ─────────
const hoveredMeta = computed(() =>
  hoveredNode.value ? getNodeTypeMeta(hoveredNode.value.type) : null
)

const hoveredMastery = computed(() => {
  const id = hoveredNode.value?.id
  const m = id ? props.masteryMap?.[id] : null
  if (m) {
    return {
      value: m.level === 'good' ? 'mastered' : m.level === 'medium' ? 'learning' : m.level === 'weak' ? 'learning' : 'unstarted',
      label: m.level === 'good' ? '已掌握' : m.level === 'medium' ? '学习中' : m.level === 'weak' ? '薄弱' : '未学习',
      color: m.level === 'good' ? '#22c55e' : m.level === 'medium' ? '#f59e0b' : m.level === 'weak' ? '#ef4444' : '#94a3b8',
      score: m.score,
      isWeak: m.isWeak
    }
  }
  const state = id ? props.learningState?.[id] : null
  if (!state || !state.mastery || state.mastery === 'unstarted') return null
  return getMasteryMeta(state.mastery)
})

const hoveredComplexity = computed(() => {
  const c = hoveredNode.value?.properties?.complexity
  if (!c || typeof c !== 'object') return []
  return Object.entries(c)
    .filter(([, v]) => v != null && v !== '' && typeof v !== 'boolean')
    .slice(0, 3)
    .map(([k, v]) => `${k} ${v}`)
})

// ───────── 工具函数 ─────────
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getNodeRadius(node) {
  return RADIUS_BY_TYPE[node?.type] || RADIUS_BY_TYPE.concept
}

function hasHighlight() {
  const paths = props.highlightPaths
  return !!(paths && paths.nodeIds && paths.nodeIds.size > 0)
}

function isNodeHighlighted(nodeId) {
  const paths = props.highlightPaths
  return !hasHighlight() || (paths?.nodeIds?.has(nodeId) ?? false)
}

function isRelationHighlighted(relation) {
  if (!hasHighlight()) return true
  const keys = props.highlightPaths?.relationKeys
  if (!keys) return false
  return keys.has(relation.id) || keys.has(`${relation.source}__${relation.type}__${relation.target}`)
}

function getMasteryColor(nodeId) {
  const m = props.masteryMap?.[nodeId]
  if (m) {
    if (m.level === 'good') return '#22c55e'
    if (m.level === 'medium') return '#f59e0b'
    if (m.level === 'weak') return '#ef4444'
  }
  const state = props.learningState?.[nodeId]
  if (!state || !state.mastery || state.mastery === 'unstarted') return null
  return getMasteryMeta(state.mastery).color
}

function getMasteryScore(nodeId) {
  const m = props.masteryMap?.[nodeId]
  if (m && typeof m.score === 'number') return clamp(m.score, 0, 100)
  return null
}

function isWeakNode(nodeId) {
  const m = props.masteryMap?.[nodeId]
  return !!(m && (m.isWeak || m.level === 'weak'))
}

// ───────── 一级布局：course 居中 + chapters 环形 ─────────
function buildBasePositions() {
  const positions = new Map()
  const nodes = props.nodes || []
  if (nodes.length === 0) return positions

  const course = nodes.find((node) => node.type === 'course') || nodes[0]
  const chapters = nodes
    .filter((node) => node.type === 'chapter')
    .sort((a, b) => {
      const orderA = Number(a.properties?.order || 0)
      const orderB = Number(b.properties?.order || 0)
      return orderA - orderB || String(a.label).localeCompare(String(b.label), 'zh-Hans-CN')
    })

  if (course) positions.set(course.id, { x: 0, y: 0 })

  const radius = chapters.length > 5 ? CHAPTER_RADIUS_LARGE : CHAPTER_RADIUS_DEFAULT
  chapters.forEach((chapter, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(chapters.length, 1)
    positions.set(chapter.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    })
  })
  return positions
}

// chapter→下属二级节点 的映射（与原 3D 版逻辑一致）
function buildChapterChildMap() {
  const nodes = props.nodes || []
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const relationChapterMap = new Map()
  for (const relation of props.relations || []) {
    const source = nodeMap.get(relation.source)
    const target = nodeMap.get(relation.target)
    if (source?.type === 'chapter' && target && !target.chapterId) relationChapterMap.set(target.id, source.id)
    if (target?.type === 'chapter' && source && !source.chapterId) relationChapterMap.set(source.id, target.id)
  }
  const childMap = new Map()
  for (const node of nodes) {
    if (node.type === 'course' || node.type === 'chapter') continue
    const chapterId = node.chapterId || relationChapterMap.get(node.id)
    if (!chapterId) continue
    if (!childMap.has(chapterId)) childMap.set(chapterId, [])
    childMap.get(chapterId).push(node)
  }
  for (const list of childMap.values()) {
    list.sort((a, b) => {
      const orderA = Number(a.properties?.order || 0)
      const orderB = Number(b.properties?.order || 0)
      return orderA - orderB || String(a.label).localeCompare(String(b.label), 'zh-Hans-CN')
    })
  }
  return childMap
}

// ───────── 计算属性：布局缓存 ─────────
const basePositions = computed(() => buildBasePositions())
const chapterChildMap = computed(() => buildChapterChildMap())

const expandedChildren = computed(() => {
  if (!expandedChapterId.value) return []
  return chapterChildMap.value.get(expandedChapterId.value) || []
})

const expandedPositions = computed(() => {
  const m = new Map()
  if (!expandedChapterId.value) return m
  const parent = basePositions.value.get(expandedChapterId.value)
  if (!parent) return m
  const children = expandedChildren.value
  const n = children.length
  if (n === 0) return m
  const r = clamp(110 + 12 * n, ORBIT_RADIUS_MIN, ORBIT_RADIUS_MAX)
  children.forEach((child, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / n
    m.set(child.id, {
      x: parent.x + Math.cos(angle) * r,
      y: parent.y + Math.sin(angle) * r
    })
  })
  return m
})

const nodePositions = computed(() => {
  const m = new Map(basePositions.value)
  expandedPositions.value.forEach((p, id) => m.set(id, p))
  return m
})

// 一级节点（course + chapter）：始终可见，入场仅在首次挂载触发
const baseNodes = computed(() =>
  props.nodes.filter((node) => node.type === 'course' || node.type === 'chapter')
)

// 二级节点：仅当前展开 chapter 的子节点
const expandedNodes = computed(() => {
  if (!expandedChapterId.value) return []
  const ids = new Set(expandedPositions.value.keys())
  return props.nodes.filter((node) => ids.has(node.id))
})

// 一级关系边（两端都是 course/chapter）：始终可见，无入场延迟
const baseEdges = computed(() => {
  const baseIds = new Set(baseNodes.value.map((n) => n.id))
  return (props.relations || []).filter((r) => baseIds.has(r.source) && baseIds.has(r.target))
})

// chapter → 二级 的边：随二级节点同步淡入
const expandedEdges = computed(() => {
  if (!expandedChapterId.value) return []
  const expandedIds = new Set(expandedPositions.value.keys())
  const baseIds = new Set(baseNodes.value.map((n) => n.id))
  return (props.relations || []).filter((r) => {
    const sBase = baseIds.has(r.source)
    const tBase = baseIds.has(r.target)
    const sExp = expandedIds.has(r.source)
    const tExp = expandedIds.has(r.target)
    return (sBase && tExp) || (sExp && tBase) || (sExp && tExp)
  })
})

const viewportTransform = computed(
  () => `translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`
)

// ───────── 边路径 ─────────
function edgePath(rel) {
  const s = nodePositions.value.get(rel.source)
  const t = nodePositions.value.get(rel.target)
  if (!s || !t) return ''
  const dx = t.x - s.x
  const dy = t.y - s.y
  const dist = Math.hypot(dx, dy) || 1
  const ux = dx / dist
  const uy = dy / dist
  const sourceNode = props.nodes.find((n) => n.id === rel.source)
  const targetNode = props.nodes.find((n) => n.id === rel.target)
  const sr = sourceNode ? getNodeRadius(sourceNode) : 18
  const tr = targetNode ? getNodeRadius(targetNode) : 18
  const sx = s.x + ux * sr * 0.92
  const sy = s.y + uy * sr * 0.92
  const ex = t.x - ux * tr * 1.02
  const ey = t.y - uy * tr * 1.02
  const mx = (sx + ex) / 2
  const my = (sy + ey) / 2
  // SVG y 轴向下，"向上凸"取负 lift
  const lift = rel.type === 'CONTAINS' ? Math.min(dist * 0.05 + 16, 60) : Math.min(dist * 0.08 + 30, 100)
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} Q ${mx.toFixed(2)} ${(my - lift).toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`
}

function edgeColor(rel) {
  const meta = getRelationTypeMeta(rel.type)
  return meta?.color || '#94a3b8'
}

function edgeOpacity(rel) {
  if (hasHighlight()) {
    return isRelationHighlighted(rel)
      ? (rel.type === 'CONTAINS' ? 0.7 : 0.85)
      : 0.12
  }
  return rel.type === 'CONTAINS' ? 0.55 : 0.8
}

function edgeStrokeWidth(rel) {
  return rel.type === 'CONTAINS' ? 1.5 : 1.8
}

// ───────── 节点视觉计算 ─────────
function nodeMeta(node) {
  return getNodeTypeMeta(node.type)
}

function nodeBodyFill(node) {
  return nodeMeta(node).color
}

function nodeBodyStroke(node) {
  if (node.id === props.selectedNodeId) return 'var(--app-primary-strong)'
  if (isWeakNode(node.id)) return '#ef4444'
  return 'rgba(255, 255, 255, 0.7)'
}

function nodeBodyStrokeWidth(node) {
  if (node.id === props.selectedNodeId) return 3
  return 1.5
}

function nodeHaloFill(node) {
  if (isWeakNode(node.id)) return '#ef4444'
  return nodeMeta(node).color
}

// 掌握度环周长：基于节点半径的 1.18 倍
function masteryRingRadius(node) {
  return getNodeRadius(node) * 1.18
}

function masteryRingDasharray(node) {
  const score = getMasteryScore(node.id)
  if (score == null) return null
  const r = masteryRingRadius(node)
  const C = 2 * Math.PI * r
  const dash = (score / 100) * C
  return `${dash.toFixed(2)} ${(C - dash).toFixed(2)}`
}

function nodeOpacity(node) {
  if (hasHighlight() && !isNodeHighlighted(node.id)) return 0.22
  return 1
}

function nodeIsWeakClass(node) {
  return isWeakNode(node.id) ? 'is-weak' : ''
}

function nodeIsSelectedClass(node) {
  return node.id === props.selectedNodeId ? 'is-selected' : ''
}

// label 文本字号：随节点类型变化
function nodeLabelFontSize(node) {
  if (node.type === 'course') return 18
  if (node.type === 'chapter') return 14
  return 12
}

function nodeLabelOffsetY(node) {
  return getNodeRadius(node) + 18
}

// ───────── 提交版本链卫星 ─────────
function submissionColor(sub) {
  const status = String(sub.status || sub.judgeStatus || '').toLowerCase()
  const score = Number(sub.score)
  if (status.includes('ac') || status.includes('accept') || status.includes('completed') || status.includes('graded')) return '#22c55e'
  if (status.includes('ce') || status.includes('compile') || status.includes('error')) return '#ef4444'
  if (!Number.isNaN(score) && score >= 70) return '#22c55e'
  if (!Number.isNaN(score) && score >= 40) return '#f59e0b'
  if (status.includes('wa') || status.includes('wrong') || status.includes('reject')) return '#f59e0b'
  return '#94a3b8'
}

function formatTime(sub) {
  const t = sub.submitTime || sub.submittedAt || sub.date
  if (!t) return '未知时间'
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return String(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const satelliteLayout = computed(() => {
  const trace = props.submissionTrace
  if (!trace || !Array.isArray(trace.submissions) || trace.submissions.length === 0) {
    return { points: [], polyline: '' }
  }
  const center = nodePositions.value.get(trace.nodeId)
  if (!center) return { points: [], polyline: '' }

  const centerNode = props.nodes.find((n) => n.id === trace.nodeId)
  const baseR = centerNode ? getNodeRadius(centerNode) : 28
  // 卫星轨道半径 = 节点半径 × 1.8，并保证最小可视半径
  const orbitR = Math.max(baseR * 1.8, 56)

  const subs = trace.submissions.slice().sort((a, b) => {
    const ta = new Date(a.submitTime || a.submittedAt || a.date || 0).getTime()
    const tb = new Date(b.submitTime || b.submittedAt || b.date || 0).getTime()
    return ta - tb
  })
  const count = Math.min(subs.length, 20)
  const showSubs = subs.slice(-count)

  const points = []
  const linePts = []
  showSubs.forEach((sub, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / Math.max(count, 1)
    const cx = center.x + Math.cos(angle) * orbitR
    const cy = center.y + Math.sin(angle) * orbitR
    points.push({
      key: sub.id || sub.submissionId || `${sub.experimentId || ''}-${i}`,
      cx,
      cy,
      color: submissionColor(sub),
      submission: sub
    })
    linePts.push(`${cx.toFixed(2)},${cy.toFixed(2)}`)
  })

  return { points, polyline: linePts.join(' ') }
})

// ───────── 一级展开/折叠（核心交互） ─────────
function toggleChapter(chapterId) {
  expandedChapterId.value = expandedChapterId.value === chapterId ? '' : chapterId
}

// ───────── 节点交互 ─────────
function handleNodeClick(node) {
  if (dragState.moved) return   // 拖拽尾部不算点击
  if (node.type === 'chapter') {
    toggleChapter(node.id)
  }
  emit('select-node', node)
}

function handleNodeDblClick(node) {
  emit('select-node', node)
  emit('trace-node', node)
  focusNode(node.id)
}

function handleNodeEnter(node) {
  hoveredNode.value = node
  hoveredSubmission.value = null
}

function handleNodeLeave() {
  hoveredNode.value = null
}

function handleSatelliteClick(submission) {
  if (dragState.moved) return
  emit('select-submission', submission)
}

function handleSatelliteEnter(submission) {
  hoveredSubmission.value = submission
  hoveredNode.value = null
}

function handleSatelliteLeave() {
  hoveredSubmission.value = null
}

// ───────── viewport：拖拽与缩放 ─────────
function svgPointToWorld(clientX, clientY) {
  const svg = svgRef.value
  if (!svg) return { sx: 0, sy: 0, wx: 0, wy: 0 }
  const rect = svg.getBoundingClientRect()
  // DOM 像素 → SVG 用户坐标（viewBox 单位）
  const sx = ((clientX - rect.left) / rect.width) * VB_W + VB_X
  const sy = ((clientY - rect.top) / rect.height) * VB_H + VB_Y
  // viewport 逆变换：得到内容空间坐标
  const wx = (sx - viewport.x) / viewport.scale
  const wy = (sy - viewport.y) / viewport.scale
  return { sx, sy, wx, wy, rect }
}

function onSvgMousedown(event) {
  // 只响应左键
  if (event.button !== 0) return
  isDragging.value = true
  dragState.startX = event.clientX
  dragState.startY = event.clientY
  dragState.vx = viewport.x
  dragState.vy = viewport.y
  dragState.moved = false
}

function onSvgMousemove(event) {
  if (!isDragging.value) return
  const dxPx = event.clientX - dragState.startX
  const dyPx = event.clientY - dragState.startY
  if (!dragState.moved && Math.hypot(dxPx, dyPx) > DRAG_THRESHOLD) {
    dragState.moved = true
  }
  // 把屏幕像素增量换算到 SVG 用户坐标增量（与 viewBox 1:1 不依赖 scale，因为 translate 在 scale 外侧）
  const svg = svgRef.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const scaleX = VB_W / rect.width
  const scaleY = VB_H / rect.height
  viewport.x = dragState.vx + dxPx * scaleX
  viewport.y = dragState.vy + dyPx * scaleY
}

function onSvgMouseup() {
  isDragging.value = false
}

function onSvgMouseleave() {
  isDragging.value = false
}

function onSvgWheel(event) {
  if (!svgRef.value) return
  const { sx, sy, wx, wy } = svgPointToWorld(event.clientX, event.clientY)
  const factor = event.deltaY < 0 ? SCALE_STEP : 1 / SCALE_STEP
  const next = clamp(viewport.scale * factor, SCALE_MIN, SCALE_MAX)
  if (next === viewport.scale) return
  viewport.x = sx - wx * next
  viewport.y = sy - wy * next
  viewport.scale = next
}

// ───────── 工具栏 ─────────
function resetView() {
  viewport.x = 0
  viewport.y = 0
  viewport.scale = 1
}

function zoomBy(direction) {
  const factor = direction === 'in' ? SCALE_STEP : 1 / SCALE_STEP
  const next = clamp(viewport.scale * factor, SCALE_MIN, SCALE_MAX)
  if (next === viewport.scale) return
  // 以 SVG viewBox 中心 (0,0) 为锚点等比缩放：保持锚点对应的内容坐标不动
  const ratio = next / viewport.scale
  viewport.x *= ratio
  viewport.y *= ratio
  viewport.scale = next
}

function focusNode(nodeId) {
  const p = nodePositions.value.get(nodeId)
  if (!p) return
  // 让节点居中：viewport.x + p.x * scale = 0 → viewport.x = -p.x * scale
  viewport.x = -p.x * viewport.scale
  viewport.y = -p.y * viewport.scale
}

function focusSelectedNode() {
  const id = props.selectedNodeId || hoveredNode.value?.id
  if (id) focusNode(id)
}

function toggleMotion() {
  motionEnabled.value = !motionEnabled.value
}

async function toggleFullscreen() {
  const shell = shellRef.value
  if (!shell) return
  if (!document.fullscreenElement) {
    await shell.requestFullscreen?.()
  } else {
    await document.exitFullscreen?.()
  }
}

function handleFullscreenChange() {
  isFullscreen.value = document.fullscreenElement === shellRef.value
}

// ───────── 展开后自动平移到 chapter 居中（保持 scale） ─────────
watch(expandedChapterId, async (chapterId) => {
  if (!chapterId) return
  await nextTick()
  focusNode(chapterId)
})

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (document.fullscreenElement === shellRef.value) {
    document.exitFullscreen?.()
  }
})
</script>

<template>
  <div ref="shellRef" class="graph-canvas-shell" :class="{ fullscreen: isFullscreen }">
    <ui-empty v-if="!hasGraphData" description="暂无知识图谱数据" class="graph-empty" />

    <template v-else>
      <div ref="stageRef" class="graph-stage">
        <svg
          ref="svgRef"
          class="graph-svg"
          :class="{ paused: !motionEnabled, dragging: isDragging }"
          :viewBox="viewBoxStr"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="数据结构 2D 知识图谱"
          @mousedown="onSvgMousedown"
          @mousemove="onSvgMousemove"
          @mouseup="onSvgMouseup"
          @mouseleave="onSvgMouseleave"
          @wheel.prevent="onSvgWheel"
        >
          <defs>
            <filter id="kgNodeShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g class="viewport" :transform="viewportTransform">
            <!-- 一级关系边：course/chapter 之间 -->
            <g class="edges edges--base">
              <path
                v-for="rel in baseEdges"
                :key="rel.id"
                :d="edgePath(rel)"
                :stroke="edgeColor(rel)"
                :stroke-width="edgeStrokeWidth(rel)"
                :opacity="edgeOpacity(rel)"
                fill="none"
                stroke-linecap="round"
              />
            </g>

            <!-- 展开层：chapter→二级 边 + 二级节点，整体淡入；二级 idx 重新从 0 起 -->
            <g v-if="expandedChapterId" class="expanded-layer" :key="`exp-${expandedChapterId}`">
              <g class="edges edges--expanded">
                <path
                  v-for="(rel, i) in expandedEdges"
                  :key="rel.id"
                  class="edge-expanded"
                  :style="{ '--idx': i }"
                  :d="edgePath(rel)"
                  :stroke="edgeColor(rel)"
                  :stroke-width="edgeStrokeWidth(rel)"
                  :opacity="edgeOpacity(rel)"
                  fill="none"
                  stroke-linecap="round"
                />
              </g>
            </g>

            <!-- 卫星链：选中节点 + 提交版本 -->
            <g v-if="satelliteLayout.points.length" class="satellites" :key="`sat-${props.submissionTrace?.nodeId || ''}`">
              <polyline
                v-if="satelliteLayout.points.length > 1"
                :points="satelliteLayout.polyline"
                fill="none"
                stroke="#c2703e"
                stroke-opacity="0.55"
                stroke-width="1.4"
              />
              <g
                v-for="(p, i) in satelliteLayout.points"
                :key="p.key"
                class="satellite"
                :style="{ '--idx': i }"
                :transform="`translate(${p.cx},${p.cy})`"
                @click.stop="handleSatelliteClick(p.submission)"
                @mouseenter.stop="handleSatelliteEnter(p.submission)"
                @mouseleave.stop="handleSatelliteLeave"
              >
                <circle class="satellite-halo" r="9" :fill="p.color" />
                <circle class="satellite-body" r="5" :fill="p.color" stroke="#fff" stroke-width="1.2" />
              </g>
            </g>

            <!-- 一级节点层：course + chapter，始终在场 -->
            <g class="nodes nodes--base">
              <g
                v-for="(node, i) in baseNodes"
                :key="node.id"
                class="node node--base"
                :class="[
                  `node--${node.type}`,
                  nodeIsWeakClass(node),
                  nodeIsSelectedClass(node)
                ]"
                :style="{ '--idx': i }"
                :transform="`translate(${(nodePositions.get(node.id) || { x: 0, y: 0 }).x},${(nodePositions.get(node.id) || { x: 0, y: 0 }).y})`"
                :opacity="nodeOpacity(node)"
                @click.stop="handleNodeClick(node)"
                @dblclick.stop="handleNodeDblClick(node)"
                @mouseenter.stop="handleNodeEnter(node)"
                @mouseleave.stop="handleNodeLeave"
              >
                <circle
                  v-if="node.id === props.selectedNodeId"
                  class="select-ring"
                  :r="getNodeRadius(node) * 1.45"
                  fill="none"
                  stroke="var(--app-primary)"
                  stroke-width="2"
                  stroke-dasharray="4 6"
                />
                <circle
                  class="halo"
                  :r="getNodeRadius(node) * 1.55"
                  :fill="nodeHaloFill(node)"
                />
                <circle
                  class="body"
                  :r="getNodeRadius(node)"
                  :fill="nodeBodyFill(node)"
                  :stroke="nodeBodyStroke(node)"
                  :stroke-width="nodeBodyStrokeWidth(node)"
                  filter="url(#kgNodeShadow)"
                />
                <circle
                  v-if="masteryRingDasharray(node)"
                  class="mastery-ring"
                  :r="masteryRingRadius(node)"
                  fill="none"
                  :stroke="getMasteryColor(node.id) || '#22c55e'"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="masteryRingDasharray(node)"
                  transform="rotate(-90)"
                />
                <text
                  class="label"
                  text-anchor="middle"
                  :y="nodeLabelOffsetY(node)"
                  :font-size="nodeLabelFontSize(node)"
                >{{ node.label }}</text>
                <g
                  v-if="node.type === 'chapter' && (props.chapterChildCounts?.[node.id] ?? 0) > 0"
                  class="chapter-badge"
                  :transform="`translate(${getNodeRadius(node) * 0.78}, ${-getNodeRadius(node) * 0.78})`"
                >
                  <circle r="11" :fill="nodeMeta(node).color" stroke="#fff" stroke-width="1.5" />
                  <text text-anchor="middle" y="4" font-size="11" fill="#fff" font-weight="900">
                    {{ props.chapterChildCounts[node.id] }}
                  </text>
                </g>
              </g>
            </g>

            <!-- 二级节点层：与展开 chapter 同生命周期，idx 重新从 0 起 -->
            <g v-if="expandedChapterId" class="nodes nodes--expanded" :key="`exp-nodes-${expandedChapterId}`">
              <g
                v-for="(node, i) in expandedNodes"
                :key="node.id"
                class="node node--expanded"
                :class="[
                  `node--${node.type}`,
                  nodeIsWeakClass(node),
                  nodeIsSelectedClass(node)
                ]"
                :style="{ '--idx': i }"
                :transform="`translate(${(nodePositions.get(node.id) || { x: 0, y: 0 }).x},${(nodePositions.get(node.id) || { x: 0, y: 0 }).y})`"
                :opacity="nodeOpacity(node)"
                @click.stop="handleNodeClick(node)"
                @dblclick.stop="handleNodeDblClick(node)"
                @mouseenter.stop="handleNodeEnter(node)"
                @mouseleave.stop="handleNodeLeave"
              >
                <circle
                  v-if="node.id === props.selectedNodeId"
                  class="select-ring"
                  :r="getNodeRadius(node) * 1.45"
                  fill="none"
                  stroke="var(--app-primary)"
                  stroke-width="2"
                  stroke-dasharray="4 6"
                />
                <circle
                  class="halo"
                  :r="getNodeRadius(node) * 1.55"
                  :fill="nodeHaloFill(node)"
                />
                <circle
                  class="body"
                  :r="getNodeRadius(node)"
                  :fill="nodeBodyFill(node)"
                  :stroke="nodeBodyStroke(node)"
                  :stroke-width="nodeBodyStrokeWidth(node)"
                  filter="url(#kgNodeShadow)"
                />
                <circle
                  v-if="masteryRingDasharray(node)"
                  class="mastery-ring"
                  :r="masteryRingRadius(node)"
                  fill="none"
                  :stroke="getMasteryColor(node.id) || '#22c55e'"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="masteryRingDasharray(node)"
                  transform="rotate(-90)"
                />
                <text
                  class="label"
                  text-anchor="middle"
                  :y="nodeLabelOffsetY(node)"
                  :font-size="nodeLabelFontSize(node)"
                >{{ node.label }}</text>
              </g>
            </g>
          </g>
        </svg>

        <div class="graph-tools" aria-label="图谱视角工具">
          <button type="button" class="graph-tool-button" title="重置视角" @click="resetView">
            <LucideIcon name="rotate-cw" :size="16" />
          </button>
          <button type="button" class="graph-tool-button" title="放大" @click="zoomBy('in')">
            <LucideIcon name="zoom-in" :size="16" />
          </button>
          <button type="button" class="graph-tool-button" title="缩小" @click="zoomBy('out')">
            <LucideIcon name="zoom-out" :size="16" />
          </button>
          <button type="button" class="graph-tool-button" title="聚焦选中节点" @click="focusSelectedNode">
            <LucideIcon name="crosshair" :size="16" />
          </button>
          <button
            type="button"
            class="graph-tool-button"
            :class="{ active: motionEnabled }"
            title="动效开关"
            @click="toggleMotion"
          >
            <LucideIcon :name="motionEnabled ? 'pause' : 'play'" :size="16" />
          </button>
          <button type="button" class="graph-tool-button" title="全屏" @click="toggleFullscreen">
            <LucideIcon :name="isFullscreen ? 'minimize' : 'maximize'" :size="16" />
          </button>
        </div>

        <div v-if="hoveredNode" class="node-tooltip">
          <span v-if="hoveredMeta" class="tooltip-type" :style="{ backgroundColor: hoveredMeta.softColor, color: hoveredMeta.color }">
            {{ hoveredMeta.label }}
          </span>
          <strong>{{ hoveredNode.label }}</strong>
          <span class="tooltip-summary">{{ hoveredNode.summary || '暂无简介' }}</span>
          <div v-if="hoveredComplexity.length" class="tooltip-chips">
            <span v-for="item in hoveredComplexity" :key="item">{{ item }}</span>
          </div>
          <span v-if="hoveredMastery" class="tooltip-mastery" :style="{ color: hoveredMastery.color }">
            <LucideIcon name="bookmark" :size="12" />
            {{ hoveredMastery.label }}
          </span>
        </div>

        <div v-else-if="hoveredSubmission" class="node-tooltip">
          <span class="tooltip-type" style="background:var(--app-primary-soft);color:var(--app-primary-strong)">
            提交记录
          </span>
          <strong>{{ hoveredSubmission.experimentName || '提交' }}</strong>
          <span class="tooltip-summary">
            {{ formatTime(hoveredSubmission) }} · {{ hoveredSubmission.status || '已提交' }}
          </span>
          <span v-if="hoveredSubmission.score != null" class="tooltip-mastery" style="color:#22c55e">
            <LucideIcon name="award" :size="12" />
            得分 {{ hoveredSubmission.score }}
          </span>
        </div>

        <div class="graph-hint">
          <LucideIcon name="mouse-pointer-click" :size="14" />
          拖拽平移 · 滚轮缩放 · 单击查看 · 双击追溯提交
        </div>
      </div>

      <div class="graph-legend" aria-label="图谱图例">
        <div class="legend-group">
          <span v-for="item in nodeTypeLegend" :key="item.type" class="legend-item">
            <i :style="{ backgroundColor: item.color }"></i>
            {{ item.label }}
          </span>
        </div>
        <div class="legend-group relation-legend">
          <span v-for="item in relationTypeLegend" :key="item.type" class="legend-line-item">
            <i :style="{ backgroundColor: item.color }"></i>
            {{ item.label }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.graph-canvas-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 640px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  background:
    radial-gradient(circle at 50% 14%, rgba(194, 112, 62, 0.1), transparent 46%),
    linear-gradient(180deg, #fffcf7, #faf6ef);
  box-shadow: var(--app-shadow);
}

.graph-canvas-shell.fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

.graph-stage {
  position: relative;
  flex: 1;
  min-height: 620px;
}

/* SVG 主画布 */
.graph-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.graph-svg.dragging {
  cursor: grabbing;
}

/* viewport：所有内容在它内部 */
.viewport {
  transition: transform 0s; /* 拖拽实时；点击聚焦由外部覆盖 transition */
}

/* 边 */
.edges path {
  pointer-events: none;
  transition: opacity 0.25s ease;
}

/* 节点容器 */
.node {
  cursor: pointer;
  transform-origin: center;
  transform-box: fill-box;
  transition: opacity 0.25s ease;
}

/* 一级节点：首屏入场，按全局索引 30ms 错峰 */
.node--base {
  animation: nodePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: calc(var(--idx, 0) * 30ms);
}

/* 二级节点：与展开 chapter 同生命周期；idx 重新从 0 起，18ms 错峰，整体 240ms 内出齐 */
.node--expanded {
  animation: nodePop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: calc(var(--idx, 0) * 18ms);
}

/* chapter→二级 边：与节点同步淡入 + 描线生长，避免"线先到位、球后弹出"的卡顿观感 */
.edge-expanded {
  animation: edgeDraw 0.32s ease-out backwards;
  animation-delay: calc(var(--idx, 0) * 18ms);
}

/* 卫星：选中节点时按 idx 18ms 错峰淡入 */
.satellite {
  cursor: pointer;
  animation: satellitePop 0.24s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: calc(var(--idx, 0) * 18ms);
}

.node:hover .body {
  filter: drop-shadow(0 0 10px currentColor);
}

.node--course .body,
.node--chapter .body {
  font-weight: 900;
}

/* 节点主体悬停外发光（通过 stroke 颜色变化提示） */
.node:hover .body {
  stroke-width: 2.4;
}

/* 选中环 */
.select-ring {
  transform-origin: center;
  transform-box: fill-box;
  animation: selBreath 2.4s ease-in-out infinite;
}

/* 光晕 */
.halo {
  opacity: 0.16;
  transform-origin: center;
  transform-box: fill-box;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.node:hover .halo {
  opacity: 0.28;
}

.node.is-selected .halo {
  opacity: 0.36;
}

/* 薄弱点红色脉冲 */
.node.is-weak .halo {
  opacity: 0.32;
  animation: weakPulse 1.6s ease-in-out infinite;
}

/* 掌握度环 */
.mastery-ring {
  pointer-events: none;
  opacity: 0.92;
}

/* 标签 */
.label {
  fill: var(--app-text);
  font-family: inherit;
  font-weight: 800;
  pointer-events: none;
  paint-order: stroke;
  stroke: #fffcf7;
  stroke-width: 3.2;
  stroke-linejoin: round;
}

.node--course .label {
  font-weight: 900;
  fill: #b56535;
}

.node--chapter .label {
  font-weight: 900;
}

/* chapter 徽章 */
.chapter-badge {
  pointer-events: none;
}

.chapter-badge text {
  font-family: inherit;
}

/* 卫星 */
.satellite-halo {
  opacity: 0.22;
  pointer-events: none;
}

.satellite:hover .satellite-halo {
  opacity: 0.4;
}

.satellite-body {
  transition: transform 0.18s ease;
}

.satellite:hover .satellite-body {
  transform: scale(1.25);
}

/* 动画 */
@keyframes nodePop {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes satellitePop {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes edgeDraw {
  from {
    opacity: 0;
    stroke-dasharray: 1 240;
    stroke-dashoffset: 240;
  }
  to {
    opacity: 1;
    stroke-dasharray: 240 240;
    stroke-dashoffset: 0;
  }
}

@keyframes selBreath {
  0%, 100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@keyframes weakPulse {
  0%, 100% {
    opacity: 0.22;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.18);
  }
}

/* 动效暂停 */
.graph-svg.paused .node,
.graph-svg.paused .halo,
.graph-svg.paused .select-ring,
.graph-svg.paused .edge-expanded,
.graph-svg.paused .satellite {
  animation-play-state: paused;
}

.graph-tools {
  position: absolute;
  top: 22px;
  left: 18px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: rgba(255, 252, 247, 0.88);
  box-shadow: var(--app-shadow);
  backdrop-filter: blur(10px);
}

.graph-tool-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: var(--app-radius-sm);
  background: transparent;
  color: var(--app-text-secondary);
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.graph-tool-button:hover {
  background: rgba(194, 112, 62, 0.14);
  color: var(--app-primary);
  transform: translateY(-1px);
}

.graph-tool-button.active {
  background: rgba(194, 112, 62, 0.18);
  color: var(--app-primary-strong);
}

.node-tooltip {
  position: absolute;
  right: 18px;
  bottom: 74px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: min(290px, calc(100% - 36px));
  padding: 12px;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: rgba(255, 252, 247, 0.92);
  box-shadow: var(--app-shadow);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.node-tooltip .tooltip-type {
  align-self: flex-start;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 850;
}

.node-tooltip strong {
  overflow: hidden;
  color: var(--app-text);
  font-size: 14px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-tooltip .tooltip-summary {
  display: -webkit-box;
  overflow: hidden;
  color: var(--app-text-secondary);
  font-size: 12px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tooltip-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tooltip-chips span {
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--app-primary-soft);
  color: var(--app-primary-strong);
  font-size: 11px;
  font-weight: 700;
}

.tooltip-mastery {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 800;
}

.graph-hint {
  position: absolute;
  right: 18px;
  top: 18px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: calc(100% - 100px);
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.88);
  color: var(--app-text-secondary);
  font-size: 12px;
  font-weight: 800;
  box-shadow: var(--app-shadow);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.graph-legend {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px 16px;
  min-height: 52px;
  padding: 10px 16px;
  border-top: 1px solid var(--app-border);
  background: rgba(255, 252, 247, 0.9);
  backdrop-filter: blur(10px);
}

.legend-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px 12px;
  min-width: 0;
}

.legend-item,
.legend-line-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--app-text-secondary);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.legend-item i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(120, 90, 50, 0.1);
}

.legend-line-item i {
  width: 24px;
  height: 3px;
  border-radius: 999px;
}

.relation-legend {
  justify-content: flex-end;
}

.graph-empty {
  min-height: 520px;
}

@media (max-width: 960px) {
  .graph-canvas-shell { min-height: 540px; }
  .graph-stage { min-height: 520px; }
}

@media (max-width: 640px) {
  .graph-canvas-shell { min-height: 500px; }
  .graph-stage { min-height: 470px; }

  .graph-tools {
    top: 12px;
    left: 12px;
    gap: 6px;
    padding: 6px;
  }

  .graph-tool-button {
    width: 32px;
    height: 32px;
  }

  .graph-hint {
    right: 12px;
    top: 12px;
    max-width: calc(100% - 74px);
    padding: 0 10px;
    font-size: 11px;
  }

  .node-tooltip {
    right: 12px;
    bottom: 64px;
    width: min(240px, calc(100% - 24px));
  }

  .graph-legend {
    align-items: flex-start;
    flex-direction: column;
  }

  .relation-legend {
    justify-content: flex-start;
  }
}
</style>
