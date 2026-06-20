<script setup>
import * as THREE from 'three'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
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

const shellRef = ref(null)
const sceneRef = ref(null)
const hoveredNode = shallowRef(null)
const hoveredSubmission = shallowRef(null)
const isFullscreen = shallowRef(false)
const motionEnabled = ref(true)
const bloomEnabled = ref(true)
const hasGraphData = computed(() => props.nodes.length > 0)

const nodeTypeLegend = computed(() => {
  const typeSet = new Set(props.nodes.map(node => node.type).filter(Boolean))
  return Array.from(typeSet).map(type => ({ type, ...getNodeTypeMeta(type) }))
})

const relationTypeLegend = computed(() => {
  const typeSet = new Set(props.relations.map(relation => relation.type).filter(Boolean))
  return Array.from(typeSet).map(type => ({ type, ...getRelationTypeMeta(type) }))
})

// 悬浮卡片增强信息：类型 / 复杂度摘要 / 掌握度
const hoveredMeta = computed(() => hoveredNode.value ? getNodeTypeMeta(hoveredNode.value.type) : null)
const hoveredMastery = computed(() => {
  const id = hoveredNode.value?.id
  // 优先用画像 masteryMap
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
  // 降级 localStorage 手动标记
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
let scene = null
let camera = null
let renderer = null
let composer = null
let bloomPass = null
let renderPass = null
let labelRenderer = null
let controls = null
let clock = null
let animationId = 0
let resizeObserver = null
let nodeGroup = null
let edgeGroup = null
let hoverRing = null
let selectRing = null
let raycaster = null
let pointer = null
let needsRender = true
let elapsed = 0

// 共享资源：按类型缓存几何体与光晕贴图，避免每节点独立创建（性能）
const geometryByType = new Map()
const glowTextureByType = new Map()
const edgeMeshByType = new Map()

let nodeObjects = []
let nodeObjectById = new Map()
let nodePositionById = new Map()
let labelObjectById = new Map()
let appearAnimations = []
let initialCameraPosition = null
let initialControlTarget = null

// 3D 提交版本链卫星组
let submissionGroup = null
let submissionMeshes = [] // 卫星 mesh 数组，供 raycaster 拾取
const submissionGeometry = new THREE.SphereGeometry(0.26, 18, 14)

// 相机补间（自研轻量插值，不引第三方）
const cameraTween = {
  active: false,
  t: 0,
  duration: 0.62,
  fromPos: new THREE.Vector3(),
  toPos: new THREE.Vector3(),
  fromTarget: new THREE.Vector3(),
  toTarget: new THREE.Vector3()
}

const SIZE_BY_TYPE = {
  course: 2.8, chapter: 1.75, concept: 1.08,
  structure: 1.16, algorithm: 1.08, operation: 0.95, exercise: 0.86
}

const TYPE_Y_OFFSET = {
  course: 0, chapter: 0.85, concept: 1.2,
  structure: 0.9, algorithm: 0.5, operation: 0.1, exercise: -0.4
}
function makeColor(color, fallback = '#1270d8') {
  return new THREE.Color(color || fallback)
}

function isSelected(nodeId) {
  return nodeId && nodeId === props.selectedNodeId
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
  // 优先画像 masteryMap
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

// 掌握度驱动的 Y 轴浮空偏移：优势上浮、薄弱下沉
function masteryYOffset(node) {
  const m = props.masteryMap?.[node.id]
  if (!m || m.level === 'unstarted') return 0
  const score = typeof m.score === 'number' ? m.score : 50
  return ((score - 50) / 50) * 1.6
}

// 节点浮动幅度按掌握度调整：优势轻盈高飘，薄弱小幅度
function masteryFloatAmp(nodeId) {
  const m = props.masteryMap?.[nodeId]
  if (!m || m.level === 'unstarted') return 0.12
  if (m.level === 'good') return 0.2
  if (m.level === 'weak') return 0.06
  return 0.12
}

function getNodeSize(node) {
  return SIZE_BY_TYPE[node?.type] || SIZE_BY_TYPE.concept
}

function getContainerSize() {
  const rect = sceneRef.value?.getBoundingClientRect()
  return {
    width: Math.max(320, Math.floor(rect?.width || 0)),
    height: Math.max(360, Math.floor(rect?.height || 0))
  }
}

function requestRender() {
  needsRender = true
}

// 按类型共享球体几何（7 种），避免每节点独立 geometry
function getGeometryForType(type) {
  if (!geometryByType.has(type)) {
    const size = SIZE_BY_TYPE[type] || SIZE_BY_TYPE.concept
    geometryByType.set(type, new THREE.SphereGeometry(size, 36, 24))
  }
  return geometryByType.get(type)
}

// 按颜色共享光晕贴图（同色仅生成一张 CanvasTexture）
function getGlowTexture(color) {
  if (glowTextureByType.has(color)) return glowTextureByType.get(color)
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(64, 64, 5, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.28, `${color}99`)
  gradient.addColorStop(1, `${color}00`)
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  glowTextureByType.set(color, texture)
  return texture
}
// 力导向布局：章节按 order 在外圈锚定，章节内子节点用斥力+弹簧+章节引力收敛后冻结。
// 仅在构建时迭代若干步，结果固化为静态坐标，避免常驻松弛带来的漂移与持续渲染。
function buildNodeLayout() {
  const nodes = props.nodes || []
  const nodeMap = new Map(nodes.map(node => [node.id, node]))
  const course = nodes.find(node => node.type === 'course') || nodes[0]
  const chapters = nodes
    .filter(node => node.type === 'chapter')
    .sort((a, b) => {
      const orderA = Number(a.properties?.order || 0)
      const orderB = Number(b.properties?.order || 0)
      return orderA - orderB || String(a.label).localeCompare(String(b.label), 'zh-Hans-CN')
    })

  const relationChapterMap = new Map()
  for (const relation of props.relations || []) {
    const source = nodeMap.get(relation.source)
    const target = nodeMap.get(relation.target)
    if (source?.type === 'chapter' && target && !target.chapterId) relationChapterMap.set(target.id, source.id)
    if (target?.type === 'chapter' && source && !source.chapterId) relationChapterMap.set(source.id, target.id)
  }

  // 锚点：course 居中，chapters 均匀分布在外圈（锚定，保持宏观结构稳定）
  const anchor = new Map()
  const pinned = new Set()
  if (course) { anchor.set(course.id, new THREE.Vector2(0, 0)); pinned.add(course.id) }
  const chapterRadius = chapters.length > 5 ? 15.5 : 13
  chapters.forEach((chapter, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(chapters.length, 1)
    anchor.set(chapter.id, new THREE.Vector2(Math.cos(angle) * chapterRadius, Math.sin(angle) * chapterRadius))
    pinned.add(chapter.id)
  })

  // 每个自由节点归属的章节中心（用于章节引力）
  const homeChapter = new Map()
  const pos = new Map()
  const vel = new Map()
  let loose = 0
  for (const node of nodes) {
    if (pinned.has(node.id)) { pos.set(node.id, anchor.get(node.id).clone()); continue }
    const chapterId = node.chapterId || relationChapterMap.get(node.id)
    const center = anchor.get(chapterId)
    if (center) {
      const a = Math.random() * Math.PI * 2
      const r = 3 + Math.random() * 2.4
      pos.set(node.id, new THREE.Vector2(center.x + Math.cos(a) * r, center.y + Math.sin(a) * r))
      homeChapter.set(node.id, center)
    } else {
      const a = Math.PI / 5 + (Math.PI * 2 * loose) / 12
      loose += 1
      pos.set(node.id, new THREE.Vector2(Math.cos(a) * 20, Math.sin(a) * 20))
    }
    vel.set(node.id, new THREE.Vector2(0, 0))
  }
  /* @@LAYOUT2@@ */
  // 弹簧边：仅在自由节点之间或自由↔锚点之间建立，保持关联节点靠近
  const springs = []
  for (const relation of props.relations || []) {
    if (relation.source === relation.target) continue
    if (pos.has(relation.source) && pos.has(relation.target)) {
      const rest = relation.type === 'CONTAINS' ? 4.6 : 5.4
      springs.push({ a: relation.source, b: relation.target, rest })
    }
  }

  const freeIds = nodes.filter(node => !pinned.has(node.id)).map(node => node.id)
  const REPULSION = 26
  const SPRING_K = 0.045
  const GRAVITY_K = 0.022
  const DAMPING = 0.82
  const ITERATIONS = 220
  const tmp = new THREE.Vector2()

  for (let step = 0; step < ITERATIONS; step++) {
    // 斥力（库仑）：所有自由节点两两排斥，避免重叠
    for (let i = 0; i < freeIds.length; i++) {
      const pi = pos.get(freeIds[i])
      const fi = vel.get(freeIds[i])
      for (let j = i + 1; j < freeIds.length; j++) {
        const pj = pos.get(freeIds[j])
        tmp.copy(pi).sub(pj)
        let distSq = tmp.lengthSq()
        if (distSq < 0.01) { tmp.set(Math.random() - 0.5, Math.random() - 0.5); distSq = 0.25 }
        const force = REPULSION / distSq
        tmp.normalize().multiplyScalar(force)
        fi.add(tmp)
        vel.get(freeIds[j]).sub(tmp)
      }
    }
    // 弹簧（胡克）：关系两端按静止长度收拢/撑开
    for (const spring of springs) {
      const pa = pos.get(spring.a)
      const pb = pos.get(spring.b)
      tmp.copy(pb).sub(pa)
      const dist = tmp.length() || 0.01
      const force = (dist - spring.rest) * SPRING_K
      tmp.normalize().multiplyScalar(force)
      if (!pinned.has(spring.a)) vel.get(spring.a).add(tmp)
      if (!pinned.has(spring.b)) vel.get(spring.b).sub(tmp)
    }
    // 章节引力：子节点被拉向所属章节中心，强化分簇
    for (const id of freeIds) {
      const home = homeChapter.get(id)
      if (!home) continue
      tmp.copy(home).sub(pos.get(id)).multiplyScalar(GRAVITY_K)
      vel.get(id).add(tmp)
    }
    // 积分 + 阻尼
    const cooling = 1 - step / ITERATIONS
    for (const id of freeIds) {
      const v = vel.get(id)
      v.multiplyScalar(DAMPING)
      pos.get(id).add(tmp.copy(v).multiplyScalar(0.5 * cooling + 0.08))
    }
  }

  const positions = new Map()
  for (const node of nodes) {
    const p = pos.get(node.id) || new THREE.Vector2()
    const yOffset = (TYPE_Y_OFFSET[node.type] || 0) + masteryYOffset(node)
    positions.set(node.id, new THREE.Vector3(p.x, yOffset, p.y))
  }
  return positions
}
function createNodeLabel(node, meta, size) {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = `graph-node-label graph-node-label-${node.type || 'concept'}`
  element.textContent = node.label
  element.style.setProperty('--node-color', meta.color)
  element.style.setProperty('--node-soft-color', meta.softColor)
  element.title = node.summary || node.label

  if (node.type === 'chapter') {
    const count = props.chapterChildCounts?.[node.id] ?? 0
    if (count > 0) {
      const badge = document.createElement('span')
      badge.className = 'chapter-badge'
      badge.textContent = String(count)
      element.appendChild(badge)
    }
  }

  const label = new CSS2DObject(element)
  label.position.set(0, size + 0.48, 0)
  label.userData.node = node
  labelObjectById.set(node.id, label)
  return label
}

function createMasteryRing(size, color) {
  const geometry = new THREE.TorusGeometry(size + 0.34, 0.06, 10, 64)
  const material = new THREE.MeshBasicMaterial({
    color: color || '#22c55e', transparent: true, opacity: 0.92, depthWrite: false
  })
  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.x = -Math.PI / 2
  ring.visible = Boolean(color)
  return ring
}

function createNodeObject(node) {
  const meta = getNodeTypeMeta(node.type)
  const size = getNodeSize(node)
  const group = new THREE.Group()
  const m = props.masteryMap?.[node.id]
  const isWeak = m?.isWeak || m?.level === 'weak'
  const isGood = m?.level === 'good'
  const color = makeColor(meta.color)
  const selected = isSelected(node.id)

  // 几何共享、材质按节点克隆（color/emissive 独立，可单独高亮）
  const geometry = getGeometryForType(node.type)
  // 薄弱点压暗基色并偏红；优势点提亮
  let baseColor = color
  let emissiveColor = color
  let baseEmissive = 0.22
  if (isWeak) {
    baseColor = color.clone().lerp(new THREE.Color('#ef4444'), 0.45).multiplyScalar(0.7)
    emissiveColor = new THREE.Color('#ef4444')
    baseEmissive = 0.18
  } else if (isGood) {
    emissiveColor = color.clone().lerp(new THREE.Color('#fbbf24'), 0.35)
    baseEmissive = 0.32
  }
  const material = new THREE.MeshPhysicalMaterial({
    color: baseColor,
    roughness: 0.4,
    metalness: 0.12,
    clearcoat: 0.8,
    clearcoatRoughness: 0.25,
    sheen: 0.4,
    sheenColor: baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.5),
    emissive: emissiveColor,
    emissiveIntensity: selected ? 0.5 : baseEmissive
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = node.type === 'course' || node.type === 'chapter'
  mesh.receiveShadow = false
  mesh.userData.node = node
  mesh.userData.baseEmissiveIntensity = baseEmissive
  mesh.userData.isWeak = isWeak
  mesh.userData.isGood = isGood
  group.add(mesh)

  // 光晕：共享贴图，材质独立（控制透明度/缩放）
  // 薄弱点用红色光晕贴图，优势点用金色
  const glowColor = isWeak ? '#ef4444' : isGood ? '#fbbf24' : meta.color
  const glowMaterial = new THREE.SpriteMaterial({
    map: getGlowTexture(glowColor),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: isWeak ? 0.32 : isGood ? (selected ? 0.9 : 0.6) : (selected ? 0.85 : 0.5)
  })
  const glow = new THREE.Sprite(glowMaterial)
  glow.scale.setScalar(size * (isGood ? (selected ? 6 : 4.8) : isWeak ? 3.4 : (selected ? 5.3 : 4.1)))
  glow.position.set(0, -size * 0.18, 0)
  group.add(glow)

  const masteryRing = createMasteryRing(size, getMasteryColor(node.id))
  // 薄弱点圆环偏红破质感：降低分段制造"裂缝"
  if (isWeak) {
    masteryRing.geometry.dispose()
    masteryRing.geometry = new THREE.TorusGeometry(size + 0.34, 0.06, 8, 28)
  }
  group.add(masteryRing)

  group.add(createNodeLabel(node, meta, size))

  const position = nodePositionById.get(node.id) || new THREE.Vector3()
  group.position.copy(position)
  group.userData.node = node
  group.userData.mesh = mesh
  group.userData.glow = glow
  group.userData.masteryRing = masteryRing
  group.userData.baseY = position.y
  group.userData.floatPhase = Math.random() * Math.PI * 2
  group.userData.floatAmp = masteryFloatAmp(node.id)

  nodeObjects.push(mesh)
  nodeObjectById.set(node.id, group)
  return group
}
// 边曲线点：两节点间二次贝塞尔，按节点半径回退端点，CONTAINS 抬升较低
function curvePoints(source, target, type, sourceRadius, targetRadius, segments) {
  const dir = target.clone().sub(source).normalize()
  const start = source.clone().add(dir.clone().multiplyScalar(sourceRadius * 0.92))
  const end = target.clone().sub(dir.clone().multiplyScalar(targetRadius * 1.02))
  const mid = start.clone().add(end).multiplyScalar(0.5)
  const lift = type === 'CONTAINS' ? 0.5 : 1.4
  mid.y += lift + Math.min(start.distanceTo(end) * 0.05, 1.4)
  return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(segments)
}

// 同类型关系合并为单个 LineSegments（减少 draw call）；顶点色由暗到亮表示 source→target 方向
function buildEdges() {
  const nodeById = new Map((props.nodes || []).map(node => [node.id, node]))
  const byType = new Map()
  for (const relation of props.relations || []) {
    const s = nodePositionById.get(relation.source)
    const t = nodePositionById.get(relation.target)
    if (!s || !t || relation.source === relation.target) continue
    if (!byType.has(relation.type)) byType.set(relation.type, [])
    byType.get(relation.type).push({ relation, s, t })
  }

  for (const [type, items] of byType) {
    const baseColor = new THREE.Color(getRelationTypeMeta(type).color)
    const positions = []
    const colors = []
    const ranges = []
    const SEG = 22
    for (const { relation, s, t } of items) {
      const sr = getNodeSize(nodeById.get(relation.source))
      const tr = getNodeSize(nodeById.get(relation.target))
      const pts = curvePoints(s, t, type, sr, tr, SEG)
      const startVertex = positions.length / 3
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i]; const p1 = pts[i + 1]
        positions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z)
        const f0 = 0.4 + 0.6 * (i / (pts.length - 1))
        const f1 = 0.4 + 0.6 * ((i + 1) / (pts.length - 1))
        const c0 = baseColor.clone().multiplyScalar(f0)
        const c1 = baseColor.clone().multiplyScalar(f1)
        colors.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b)
      }
      ranges.push({ relation, start: startVertex, count: positions.length / 3 - startVertex })
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    const material = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: type === 'CONTAINS' ? 0.5 : 0.8
    })
    const mesh = new THREE.LineSegments(geometry, material)
    mesh.userData = { type, baseColors: Float32Array.from(colors), ranges }
    edgeGroup.add(mesh)
    edgeMeshByType.set(type, mesh)
  }
}
function createSelectionRing(color = '#1270d8') {
  const geometry = new THREE.TorusGeometry(1, 0.04, 10, 80)
  const material = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.95, depthWrite: false
  })
  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.x = Math.PI / 2
  ring.visible = false
  return ring
}

function createSceneBase() {
  scene = new THREE.Scene()
  // 深色背景：让 Bloom 辉光更突出（白底会被泛白冲淡）；标签是 CSS 叠层，深底不影响可读性
  scene.background = new THREE.Color('#0a1124')
  scene.fog = new THREE.Fog('#0a1124', 46, 104)

  camera = new THREE.PerspectiveCamera(46, 1, 0.1, 240)
  initialCameraPosition = new THREE.Vector3(0, 26, 38)
  initialControlTarget = new THREE.Vector3(0, 0, 0)
  camera.position.copy(initialCameraPosition)

  const { width, height } = getContainerSize()
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  sceneRef.value.appendChild(renderer.domElement)

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(width, height)
  labelRenderer.domElement.className = 'graph-label-layer'
  sceneRef.value.appendChild(labelRenderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 12
  controls.maxDistance = 92
  controls.maxPolarAngle = Math.PI * 0.49
  controls.target.copy(initialControlTarget)
  controls.addEventListener('change', requestRender)

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  clock = new THREE.Clock()

  setupLights()
  setupGround()
  setupComposer(width, height)

  nodeGroup = new THREE.Group()
  edgeGroup = new THREE.Group()
  hoverRing = createSelectionRing('#94a3b8')
  selectRing = createSelectionRing('#38bdf8')
  scene.add(edgeGroup, nodeGroup, hoverRing, selectRing)
}
function setupLights() {
  const ambient = new THREE.HemisphereLight('#cfe6ff', '#0a1124', 1.15)
  scene.add(ambient)

  // 单一关键光投影（仅 course/chapter 接收 castShadow），shadow map 降到 1024 控成本
  const keyLight = new THREE.DirectionalLight('#ffffff', 2.0)
  keyLight.position.set(16, 30, 20)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.width = 1024
  keyLight.shadow.mapSize.height = 1024
  keyLight.shadow.camera.near = 1
  keyLight.shadow.camera.far = 90
  keyLight.shadow.camera.left = -40
  keyLight.shadow.camera.right = 40
  keyLight.shadow.camera.top = 40
  keyLight.shadow.camera.bottom = -40
  keyLight.shadow.bias = -0.0008
  scene.add(keyLight)

  const rim = new THREE.DirectionalLight('#60a5fa', 0.8)
  rim.position.set(-22, 14, -18)
  scene.add(rim)
}

function setupGround() {
  const grid = new THREE.GridHelper(64, 36, '#1e3a8a', '#162447')
  grid.position.y = -1.4
  grid.material.transparent = true
  grid.material.opacity = 0.5
  scene.add(grid)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(36, 80),
    new THREE.MeshStandardMaterial({ color: '#0d1730', transparent: true, opacity: 0.7, roughness: 0.9 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.44
  floor.receiveShadow = true
  scene.add(floor)
}

function setupComposer(width, height) {
  composer = new EffectComposer(renderer)
  renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)
  bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.62, 0.7, 0.82)
  composer.addPass(bloomPass)
  composer.addPass(new OutputPass())
  composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  composer.setSize(width, height)
  bloomPass.enabled = bloomEnabled.value
}
function isSharedGeometry(geometry) {
  for (const g of geometryByType.values()) if (g === geometry) return true
  return false
}

function isSharedTexture(texture) {
  for (const t of glowTextureByType.values()) if (t === texture) return true
  return false
}

function disposeMaterial(material) {
  if (Array.isArray(material)) { material.forEach(disposeMaterial); return }
  if (!material) return
  if (material.map && !isSharedTexture(material.map)) material.map.dispose()
  material.dispose?.()
}

// 释放对象自有资源，但保留按类型共享的几何体与光晕贴图（跨重建复用）
function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry && !isSharedGeometry(child.geometry)) child.geometry.dispose()
    if (child.material) disposeMaterial(child.material)
    if (child.element?.remove) child.element.remove()
  })
}

function clearGraphObjects() {
  disposeSubmissionSatellites()
  for (const group of [nodeGroup, edgeGroup]) {
    if (!group) continue
    while (group.children.length) {
      disposeObject(group.children.pop())
    }
  }
  nodeObjects = []
  nodeObjectById = new Map()
  nodePositionById = new Map()
  labelObjectById = new Map()
  edgeMeshByType.clear()
  appearAnimations = []
}

function buildGraphScene() {
  if (!scene || !nodeGroup || !edgeGroup || !hasGraphData.value) return
  clearGraphObjects()
  nodePositionById = buildNodeLayout()
  buildEdges()
  for (const node of props.nodes || []) {
    nodeGroup.add(createNodeObject(node))
  }
  // 入场动画：缩放从 0 弹入
  appearAnimations = nodeObjects.map((mesh, i) => ({ mesh, delay: i * 0.012, t: 0 }))
  updateSelectionState()
  rebuildSubmissionSatellites()
  requestRender()
}

// 提交状态 → 颜色
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

/**
 * 根据当前 submissionTrace（{ nodeId, submissions[] }）在选中节点周围构建提交卫星链。
 * 卫星按提交时间螺旋上升排布，相邻用细线连接，可拾取。
 */
function rebuildSubmissionSatellites() {
  // 清理上一组
  disposeSubmissionSatellites()
  if (!scene || !nodeGroup) return
  const trace = props.submissionTrace
  if (!trace || !Array.isArray(trace.submissions) || trace.submissions.length === 0) return

  const group = nodeObjectById.get(trace.nodeId)
  if (!group) return

  submissionGroup = new THREE.Group()
  submissionMeshes = []
  const center = group.position.clone()
  const subs = trace.submissions.slice().sort((a, b) => {
    const ta = new Date(a.submitTime || a.submittedAt || a.date || 0).getTime()
    const tb = new Date(b.submitTime || b.submittedAt || b.date || 0).getTime()
    return ta - tb
  })
  const count = Math.min(subs.length, 20) // 最多 20 颗卫星
  const radius = 2.4
  const lastPositions = []

  subs.slice(-count).forEach((sub, i) => {
    const angle = (i / Math.max(count, 1)) * Math.PI * 2 * 1.6
    const y = center.y + 1.4 + i * 0.34
    const x = center.x + Math.cos(angle) * radius
    const z = center.z + Math.sin(angle) * radius
    const color = new THREE.Color(submissionColor(sub))
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      roughness: 0.35,
      metalness: 0.2
    })
    const mesh = new THREE.Mesh(submissionGeometry, mat)
    mesh.position.set(x, y, z)
    mesh.userData.submission = sub
    mesh.userData.isSubmission = true
    submissionGroup.add(mesh)
    submissionMeshes.push(mesh)

    // 卫星光晕
    const glowMat = new THREE.SpriteMaterial({
      map: getGlowTexture(submissionColor(sub)),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.6
    })
    const glow = new THREE.Sprite(glowMat)
    glow.scale.setScalar(1.6)
    glow.position.copy(mesh.position)
    submissionGroup.add(glow)

    lastPositions.push(mesh.position.clone())
  })

  // 相邻卫星连线成演进链
  if (lastPositions.length > 1) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints(lastPositions)
    const lineMat = new THREE.LineBasicMaterial({
      color: '#7dd3fc',
      transparent: true,
      opacity: 0.55
    })
    const line = new THREE.Line(lineGeo, lineMat)
    submissionGroup.add(line)
  }

  nodeGroup.add(submissionGroup)
  requestRender()
}

function disposeSubmissionSatellites() {
  if (!submissionGroup) return
  submissionMeshes = []
  while (submissionGroup.children.length) {
    const child = submissionGroup.children.pop()
    if (child.geometry && child !== submissionGroup) {
      // 共享 submissionGeometry 不单独 dispose；Line 自有 geometry 需释放
      if (child.isLine) child.geometry.dispose()
    }
    if (child.material) disposeMaterial(child.material)
  }
  if (submissionGroup.parent) submissionGroup.parent.remove(submissionGroup)
  submissionGroup = null
}

function formatTime(sub) {
  const t = sub.submitTime || sub.submittedAt || sub.date
  if (!t) return '未知时间'
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return String(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function updateNodeVisual(group, options = {}) {
  const { selected = false, hovered = false } = options
  const mesh = group?.userData?.mesh
  const glow = group?.userData?.glow
  if (!mesh || !glow) return

  const nodeId = group.userData.node?.id
  const dimmed = hasHighlight() && !isNodeHighlighted(nodeId)
  group.userData.dimmed = dimmed
  group.userData.selected = selected
  const targetScale = dimmed ? 0.9 : selected ? 1.2 : hovered ? 1.1 : 1
  group.userData.targetScale = targetScale
  mesh.material.transparent = dimmed
  mesh.material.opacity = dimmed ? 0.16 : 1
  const baseEmissive = mesh.userData.baseEmissiveIntensity || 0.22
  mesh.userData.emissiveTarget = dimmed ? baseEmissive * 0.35 : selected ? 0.85 : hovered ? 0.5 : baseEmissive
  glow.material.opacity = dimmed ? 0.08 : selected ? 0.95 : hovered ? 0.72 : 0.5

  const label = labelObjectById.get(nodeId)
  if (label?.element) {
    label.element.style.opacity = dimmed ? '0.22' : ''
    label.element.classList.toggle('is-selected', selected)
  }
}

function updateRing(ring, nodeId, scaleOffset) {
  if (!ring) return
  const group = nodeObjectById.get(nodeId)
  if (!group) { ring.visible = false; return }
  const node = group.userData.node
  const meta = getNodeTypeMeta(node.type)
  const size = getNodeSize(node) + scaleOffset
  ring.position.copy(group.position)
  ring.position.y += 0.02
  ring.scale.setScalar(size)
  ring.material.color.set(meta.color)
  ring.visible = true
}

function updateSelectionState() {
  nodeObjectById.forEach((group, nodeId) => {
    updateNodeVisual(group, {
      selected: isSelected(nodeId),
      hovered: hoveredNode.value?.id === nodeId
    })
  })
  updateRing(selectRing, props.selectedNodeId, 0.34)
  updateRing(hoverRing, hoveredNode.value?.id, 0.2)
  updateEdgeHighlight()
  requestRender()
}
// 高亮：对每个合并边 mesh，按 relation 所在顶点区间缩放颜色（非高亮调暗）
function updateEdgeHighlight() {
  if (!edgeGroup) return
  const highlightOn = hasHighlight()
  edgeMeshByType.forEach((mesh) => {
    const { baseColors, ranges } = mesh.userData
    const attr = mesh.geometry.getAttribute('color')
    const arr = attr.array
    for (const range of ranges) {
      const factor = !highlightOn || isRelationHighlighted(range.relation) ? 1 : 0.14
      const begin = range.start * 3
      const stop = (range.start + range.count) * 3
      for (let i = begin; i < stop; i++) arr[i] = baseColors[i] * factor
    }
    attr.needsUpdate = true
    mesh.material.opacity = highlightOn ? (mesh.userData.type === 'CONTAINS' ? 0.4 : 0.7) : (mesh.userData.type === 'CONTAINS' ? 0.5 : 0.8)
  })
}

function updateLearningStateVisuals() {
  nodeObjectById.forEach((group, nodeId) => {
    const ring = group.userData.masteryRing
    if (!ring) return
    const color = getMasteryColor(nodeId)
    if (color) {
      ring.material.color.set(color)
      ring.visible = true
    } else {
      ring.visible = false
    }
  })
  requestRender()
}

function setPointerFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

function getIntersectedNode(event) {
  if (!raycaster || !camera || !renderer) return null
  setPointerFromEvent(event)
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(nodeObjects, false)
  return intersects[0]?.object?.userData?.node || null
}

// 拾取提交卫星，返回 submission 数据
function getIntersectedSubmission(event) {
  if (!raycaster || !camera || !renderer || submissionMeshes.length === 0) return null
  setPointerFromEvent(event)
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(submissionMeshes, false)
  return intersects[0]?.object?.userData?.submission || null
}

function handlePointerMove(event) {
  const node = getIntersectedNode(event)
  const sub = node ? null : getIntersectedSubmission(event)
  if (node?.id === hoveredNode.value?.id && !sub) {
    // 节点未变且无卫星悬停
  }
  hoveredNode.value = node || null
  hoveredSubmission.value = sub || null
  renderer.domElement.style.cursor = (node || sub) ? 'pointer' : 'grab'
  updateSelectionState()
}

function handlePointerLeave() {
  hoveredNode.value = null
  hoveredSubmission.value = null
  if (renderer?.domElement) renderer.domElement.style.cursor = 'grab'
  updateSelectionState()
}

function handleClick(event) {
  const node = getIntersectedNode(event)
  if (node) {
    emit('select-node', node)
    return
  }
  const sub = getIntersectedSubmission(event)
  if (sub) emit('select-submission', sub)
}

function handleDblClick(event) {
  const node = getIntersectedNode(event)
  if (!node) return
  emit('select-node', node)
  emit('trace-node', node)
  focusNode(node.id)
}
function resizeScene() {
  if (!camera || !renderer || !labelRenderer) return
  const { width, height } = getContainerSize()
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  labelRenderer.setSize(width, height)
  composer?.setSize(width, height)
  bloomPass?.setSize(width, height)
  requestRender()
}

// 自研相机补间：缓动插值 position 与 target，避免引第三方 tween
function startCameraTween(toPos, toTarget) {
  if (!camera || !controls) return
  cameraTween.fromPos.copy(camera.position)
  cameraTween.toPos.copy(toPos)
  cameraTween.fromTarget.copy(controls.target)
  cameraTween.toTarget.copy(toTarget)
  cameraTween.t = 0
  cameraTween.active = true
  requestRender()
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function advanceCameraTween(delta) {
  if (!cameraTween.active) return
  cameraTween.t = Math.min(1, cameraTween.t + delta / cameraTween.duration)
  const k = easeInOutCubic(cameraTween.t)
  camera.position.lerpVectors(cameraTween.fromPos, cameraTween.toPos, k)
  controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, k)
  if (cameraTween.t >= 1) cameraTween.active = false
}

// 入场弹入动画推进；返回是否仍在进行
function advanceAppear(delta) {
  if (!appearAnimations.length) return false
  let active = false
  for (const item of appearAnimations) {
    if (item.delay > 0) { item.delay -= delta; active = true; continue }
    if (item.t >= 1) continue
    item.t = Math.min(1, item.t + delta * 2.4)
    const k = 1 - Math.pow(1 - item.t, 3)
    item.mesh.parent.scale.setScalar(k)
    active = true
  }
  if (!active) appearAnimations = []
  return active
}

function animate() {
  animationId = window.requestAnimationFrame(animate)
  const delta = clock ? clock.getDelta() : 0.016
  elapsed += delta

  let dynamic = false
  if (motionEnabled.value && nodeGroup) {
    // 轻微浮动 + 选中节点发光脉冲；浮动幅度按掌握度（优势高飘、薄弱小幅度）
    nodeGroup.children.forEach((group) => {
      const baseY = group.userData.baseY ?? group.position.y
      const amp = group.userData.floatAmp ?? 0.12
      group.position.y = baseY + Math.sin(elapsed * 0.9 + group.userData.floatPhase) * amp
    })
    dynamic = true
  }
  // 发光强度向目标平滑过渡；薄弱点红色脉冲
  if (nodeGroup) {
    nodeGroup.children.forEach((group) => {
      const mesh = group.userData.mesh
      if (!mesh) return
      const isWeak = mesh.userData.isWeak
      const weakPulse = isWeak ? (Math.sin(elapsed * 2.4) * 0.5 + 0.5) * 0.35 : 0
      const target = (mesh.userData.emissiveTarget ?? mesh.material.emissiveIntensity)
        + (group.userData.selected ? Math.sin(elapsed * 3) * 0.18 : 0)
        + weakPulse
      const cur = mesh.material.emissiveIntensity
      if (Math.abs(cur - target) > 0.002) {
        mesh.material.emissiveIntensity = cur + (target - cur) * Math.min(1, delta * 8)
        dynamic = true
      }
      const ts = group.userData.targetScale ?? 1
      if (Math.abs(mesh.scale.x - ts) > 0.002) {
        mesh.scale.setScalar(mesh.scale.x + (ts - mesh.scale.x) * Math.min(1, delta * 10))
        dynamic = true
      }
    })
  }
  if (hoverRing?.visible) { hoverRing.rotation.z += delta * 0.8; dynamic = true }
  if (selectRing?.visible) { selectRing.rotation.z -= delta * 0.5; dynamic = true }
  if (advanceAppear(delta)) dynamic = true
  if (cameraTween.active) { advanceCameraTween(delta); dynamic = true }

  const controlsActive = controls?.update() || false

  // 按需渲染：仅在有动态/交互/显式请求时执行渲染，空闲时跳过 GPU 开销
  if (needsRender || dynamic || controlsActive) {
    if (bloomPass && bloomPass.enabled) {
      composer.render()
    } else {
      renderer.render(scene, camera)
    }
    labelRenderer.render(scene, camera)
    needsRender = false
  }
}
async function initScene() {
  await nextTick()
  if (!sceneRef.value || !hasGraphData.value || scene) return
  createSceneBase()
  buildGraphScene()
  resizeObserver = new ResizeObserver(resizeScene)
  resizeObserver.observe(sceneRef.value)
  renderer.domElement.style.cursor = 'grab'
  renderer.domElement.addEventListener('pointermove', handlePointerMove)
  renderer.domElement.addEventListener('pointerleave', handlePointerLeave)
  renderer.domElement.addEventListener('click', handleClick)
  renderer.domElement.addEventListener('dblclick', handleDblClick)
  animate()
}

function destroyScene() {
  window.cancelAnimationFrame(animationId)
  animationId = 0
  resizeObserver?.disconnect()
  resizeObserver = null

  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('pointermove', handlePointerMove)
    renderer.domElement.removeEventListener('pointerleave', handlePointerLeave)
    renderer.domElement.removeEventListener('click', handleClick)
    renderer.domElement.removeEventListener('dblclick', handleDblClick)
  }

  controls?.removeEventListener('change', requestRender)
  controls?.dispose()
  clearGraphObjects()

  if (scene) {
    scene.traverse((child) => {
      if (child === scene) return
      if (child.geometry) child.geometry.dispose()
      if (child.material) disposeMaterial(child.material)
    })
  }

  // 释放共享几何与贴图
  geometryByType.forEach(geometry => geometry.dispose())
  geometryByType.clear()
  glowTextureByType.forEach(texture => texture.dispose())
  glowTextureByType.clear()
  submissionGeometry.dispose()

  composer?.dispose?.()
  bloomPass?.dispose?.()
  renderer?.dispose()
  renderer?.forceContextLoss?.()
  renderer?.domElement?.remove()
  labelRenderer?.domElement?.remove()

  scene = camera = renderer = composer = bloomPass = renderPass = null
  labelRenderer = controls = clock = null
  nodeGroup = edgeGroup = hoverRing = selectRing = raycaster = pointer = null
  submissionGroup = null
  submissionMeshes = []
  hoveredNode.value = null
  hoveredSubmission.value = null
  cameraTween.active = false
}
function resetCamera() {
  if (!camera || !controls || !initialCameraPosition || !initialControlTarget) return
  startCameraTween(initialCameraPosition.clone(), initialControlTarget.clone())
}

function zoomCamera(direction) {
  if (!camera || !controls) return
  const target = controls.target.clone()
  const distance = camera.position.distanceTo(target)
  const nextDistance = THREE.MathUtils.clamp(
    distance * (direction === 'in' ? 0.82 : 1.18),
    controls.minDistance,
    controls.maxDistance
  )
  const vector = camera.position.clone().sub(target).normalize().multiplyScalar(nextDistance)
  startCameraTween(target.clone().add(vector), target)
}

function focusNode(nodeId) {
  const group = nodeObjectById.get(nodeId)
  if (!group || !camera || !controls) return
  const target = group.position.clone()
  const offset = new THREE.Vector3(7, 7.5, 10)
  startCameraTween(target.clone().add(offset), target)
}

function focusSelectedNode() {
  focusNode(props.selectedNodeId || hoveredNode.value?.id)
}

function toggleBloom() {
  bloomEnabled.value = !bloomEnabled.value
  if (bloomPass) bloomPass.enabled = bloomEnabled.value
  requestRender()
}

function toggleMotion() {
  motionEnabled.value = !motionEnabled.value
  requestRender()
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
  nextTick(resizeScene)
}
watch(
  () => [props.nodes, props.relations],
  async () => {
    if (!hasGraphData.value) {
      destroyScene()
      return
    }
    if (!scene) {
      await initScene()
      return
    }
    buildGraphScene()
  },
  { deep: true }
)

watch(() => props.selectedNodeId, () => updateSelectionState())
watch(() => props.highlightPaths, () => updateSelectionState())
watch(() => props.learningState, () => updateLearningStateVisuals(), { deep: true })
watch(
  () => props.chapterChildCounts,
  () => { if (scene) buildGraphScene() },
  { deep: true }
)
// 掌握度变化：重建场景以应用浮空Y轴与材质差异化
watch(
  () => props.masteryMap,
  () => { if (scene) buildGraphScene() },
  { deep: true }
)
// 提交版本链变化：仅重建卫星组
watch(
  () => props.submissionTrace,
  () => { if (scene) rebuildSubmissionSatellites() },
  { deep: true }
)

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  initScene()
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  destroyScene()
})
</script>

<template>
  <div ref="shellRef" class="graph-canvas-shell" :class="{ fullscreen: isFullscreen }">
    <ui-empty v-if="!hasGraphData" description="暂无知识图谱数据" class="graph-empty" />

    <template v-else>
      <div class="graph-stage">
        <div ref="sceneRef" class="graph-scene" aria-label="数据结构 3D 知识图谱"></div>

        <div class="graph-tools" aria-label="图谱视角工具">
          <button type="button" class="graph-tool-button" title="重置视角" @click="resetCamera">
            <LucideIcon name="rotate-cw" :size="16" />
          </button>
          <button type="button" class="graph-tool-button" title="放大" @click="zoomCamera('in')">
            <LucideIcon name="zoom-in" :size="16" />
          </button>
          <button type="button" class="graph-tool-button" title="缩小" @click="zoomCamera('out')">
            <LucideIcon name="zoom-out" :size="16" />
          </button>
          <button type="button" class="graph-tool-button" title="聚焦选中节点" @click="focusSelectedNode">
            <LucideIcon name="crosshair" :size="16" />
          </button>
          <button
            type="button"
            class="graph-tool-button"
            :class="{ active: bloomEnabled }"
            title="辉光开关"
            @click="toggleBloom"
          >
            <LucideIcon name="sparkles" :size="16" />
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
          <span class="tooltip-type" style="background:#0f172a;color:#7dd3fc">
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
          拖拽旋转 · 滚轮缩放 · 单击查看 · 双击追溯提交
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
  border: 1px solid #1e293b;
  border-radius: 8px;
  background:
    radial-gradient(circle at 50% 16%, rgba(56, 189, 248, 0.16), transparent 42%),
    linear-gradient(180deg, #0b1226, #0a1020);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
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

.graph-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.graph-scene :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  outline: none;
}

.graph-scene :deep(.graph-label-layer) {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
/* @@STYLE2@@ */

.graph-scene :deep(.graph-node-label) {
  max-width: 100px;
  min-height: 24px;
  padding: 3px 9px;
  overflow: hidden;
  border: 1px solid rgba(148, 197, 255, 0.28);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  box-shadow: 0 6px 16px rgba(2, 6, 23, 0.45);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(6px);
  pointer-events: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.graph-scene :deep(.graph-node-label.is-selected) {
  border-color: var(--node-color);
  box-shadow: 0 0 0 2px var(--node-color), 0 8px 20px rgba(2, 6, 23, 0.5);
}

.graph-scene :deep(.graph-node-label-course) {
  max-width: 140px;
  min-height: 30px;
  padding: 5px 13px;
  background: rgba(18, 112, 216, 0.94);
  border-color: rgba(125, 211, 252, 0.6);
  color: #fff;
  font-size: 14px;
}

.graph-scene :deep(.graph-node-label-chapter) {
  position: relative;
  max-width: 118px;
  color: #f1f5f9;
}

.graph-scene :deep(.chapter-badge) {
  position: absolute;
  top: -8px;
  right: -8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--node-color);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  box-shadow: 0 2px 6px rgba(2, 6, 23, 0.4);
}
/* @@STYLE3@@ */

.graph-tools {
  position: absolute;
  top: 22px;
  left: 18px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.72);
  box-shadow: 0 18px 36px rgba(2, 6, 23, 0.4);
  backdrop-filter: blur(12px);
}

.graph-tool-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.graph-tool-button:hover {
  background: rgba(56, 189, 248, 0.16);
  color: #7dd3fc;
  transform: translateY(-1px);
}

.graph-tool-button.active {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
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
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.82);
  box-shadow: 0 18px 36px rgba(2, 6, 23, 0.46);
  backdrop-filter: blur(12px);
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
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-tooltip .tooltip-summary {
  display: -webkit-box;
  overflow: hidden;
  color: #94a3b8;
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
  background: rgba(56, 189, 248, 0.14);
  color: #7dd3fc;
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
/* @@STYLE4@@ */

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
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.7);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(2, 6, 23, 0.35);
  backdrop-filter: blur(12px);
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
  border-top: 1px solid rgba(56, 189, 248, 0.16);
  background: rgba(11, 18, 38, 0.86);
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
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.legend-item i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(148, 197, 255, 0.1);
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
