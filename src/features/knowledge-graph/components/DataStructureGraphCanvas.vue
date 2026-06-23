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

// 渐进式展开：点击一级知识点后在其周围生成二级节点并顺时针环绕旋转
let expandedGroup = null        // 挂到 scene 的顶层组，整体绕 Y 轴旋转
let orbitGroup = null           // 当前展开 chapter 对应的轨道组（expandedGroup 的子节点）
const expandedChapterId = shallowRef(null) // 当前展开的 chapter id（互斥）
const ORBIT_RADIUS = 4.8        // 二级节点环绕半径
const ORBIT_SPEED = 0.32        // 顺时针角速度（rad/s）
const _orbitWorldVec = new THREE.Vector3() // 复用临时向量，避免每帧 new

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
  course: 1.6, chapter: 2.45, concept: 2.8,
  structure: 2.5, algorithm: 2.1, operation: 1.7, exercise: 1.2
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
  if (!m || m.level === 'unstarted') return 0.28
  if (m.level === 'good') return 0.42
  if (m.level === 'weak') return 0.14
  return 0.28
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
  const course = nodes.find(node => node.type === 'course') || nodes[0]
  const chapters = nodes
    .filter(node => node.type === 'chapter')
    .sort((a, b) => {
      const orderA = Number(a.properties?.order || 0)
      const orderB = Number(b.properties?.order || 0)
      return orderA - orderB || String(a.label).localeCompare(String(b.label), 'zh-Hans-CN')
    })

  // 锚点：course 居中，chapters 均匀分布在外圈（锚定，保持宏观结构稳定）
  // 二级节点不再静态布局，改在点击一级知识点时按轨道动态生成
  const positions = new Map()
  if (course) {
    const yOffset = (TYPE_Y_OFFSET[course.type] || 0) + masteryYOffset(course)
    positions.set(course.id, new THREE.Vector3(0, yOffset, 0))
  }
  const chapterRadius = chapters.length > 5 ? 15.5 : 13
  chapters.forEach((chapter, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(chapters.length, 1)
    const yOffset = (TYPE_Y_OFFSET[chapter.type] || 0) + masteryYOffset(chapter)
    positions.set(chapter.id, new THREE.Vector3(Math.cos(angle) * chapterRadius, yOffset, Math.sin(angle) * chapterRadius))
  })

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
    clearcoat: 0.4,
    clearcoatRoughness: 0.35,
    sheen: 0.15,
    sheenColor: baseColor.clone(),
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
  // 浅底用 NormalBlending 保留彩色光晕（AdditiveBlending 在暖米底上会泛白）
  const glowColor = isWeak ? '#ef4444' : isGood ? '#fbbf24' : meta.color
  const glowMaterial = new THREE.SpriteMaterial({
    map: getGlowTexture(glowColor),
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    opacity: isWeak ? 0.28 : isGood ? (selected ? 0.7 : 0.45) : (selected ? 0.6 : 0.34)
  })
  const glow = new THREE.Sprite(glowMaterial)
  glow.scale.setScalar(size * (isGood ? (selected ? 5.4 : 4.2) : isWeak ? 3.2 : (selected ? 4.6 : 3.6)))
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
// 初始视图只画 course↔chapter 的关系边；chapter→二级 的边在展开时由 orbitGroup 单独绘制
function buildEdges() {
  const nodeById = new Map((props.nodes || []).map(node => [node.id, node]))
  const byType = new Map()
  for (const relation of props.relations || []) {
    const s = nodePositionById.get(relation.source)
    const t = nodePositionById.get(relation.target)
    if (!s || !t || relation.source === relation.target) continue
    // 仅保留两端都已静态布局（course/chapter）的边，跳过二级节点相关边
    const srcNode = nodeById.get(relation.source)
    const tgtNode = nodeById.get(relation.target)
    if (srcNode?.type !== 'course' && srcNode?.type !== 'chapter') continue
    if (tgtNode?.type !== 'course' && tgtNode?.type !== 'chapter') continue
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
  // 浅色暖米底：贴合全局 UI 主题；节点饱和色在暖底上对比度充足
  scene.background = new THREE.Color('#faf6ef')
  scene.fog = new THREE.Fog('#faf6ef', 58, 130)

  camera = new THREE.PerspectiveCamera(46, 1, 0.1, 240)
  initialCameraPosition = new THREE.Vector3(0, 26, 38)
  initialControlTarget = new THREE.Vector3(0, 1.6, 0)
  camera.position.copy(initialCameraPosition)

  const { width, height } = getContainerSize()
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
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
  expandedGroup = new THREE.Group()
  hoverRing = createSelectionRing('#94a3b8')
  selectRing = createSelectionRing('#38bdf8')
  scene.add(edgeGroup, nodeGroup, expandedGroup, hoverRing, selectRing)
}

function setupLights() {
  const ambient = new THREE.HemisphereLight('#fff7ec', '#e8dfcf', 0.72)
  scene.add(ambient)

  // 单一关键光投影（仅 course/chapter 接收 castShadow），shadow map 降到 1024 控成本
  const keyLight = new THREE.DirectionalLight('#fffaf2', 1.3)
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

  const rim = new THREE.DirectionalLight('#e8a87c', 0.5)
  rim.position.set(-22, 14, -18)
  scene.add(rim)
}

function setupGround() {
  const grid = new THREE.GridHelper(80, 40, '#d4c5ad', '#e8dfcf')
  grid.position.y = -2.6
  grid.material.transparent = true
  grid.material.opacity = 0.55
  scene.add(grid)
}

function setupComposer(width, height) {
  composer = new EffectComposer(renderer)
  renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)
  bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.16, 0.5, 0.95)
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
  collapseChapter()
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
  // 初始视图只创建 course + chapter 节点；二级节点在点击一级知识点时按轨道动态生成
  for (const node of props.nodes || []) {
    if (node.type === 'course' || node.type === 'chapter') {
      nodeGroup.add(createNodeObject(node))
    }
  }
  // 入场动画：缩放从 0 弹入
  appearAnimations = nodeObjects.map((mesh, i) => ({ mesh, delay: i * 0.012, t: 0 }))
  updateSelectionState()
  rebuildSubmissionSatellites()
  requestRender()
}

// 构建 chapter→下属二级节点 的映射（优先 node.chapterId，关系兜底）
function buildChapterChildMap() {
  const nodes = props.nodes || []
  const nodeMap = new Map(nodes.map(node => [node.id, node]))
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

// 折叠当前展开的 chapter：dispose 轨道内对象并从全局注册表中移除二级节点
function collapseChapter() {
  if (!orbitGroup && !expandedChapterId.value) {
    expandedChapterId.value = null
    return
  }
  if (orbitGroup) {
    // 收集该轨道内的二级节点 id，从全局注册表移除
    const childIds = new Set()
    orbitGroup.children.forEach((child) => {
      const node = child.userData?.node
      if (node && child.isGroup) childIds.add(node.id)
    })
    for (const id of childIds) {
      nodeObjectById.delete(id)
      labelObjectById.delete(id)
      const mesh = nodeObjects.find(m => m.userData?.node?.id === id)
      if (mesh) nodeObjects = nodeObjects.filter(m => m !== mesh)
      nodePositionById.delete(id)
    }
    disposeObject(orbitGroup)
    if (orbitGroup.parent) orbitGroup.parent.remove(orbitGroup)
    orbitGroup = null
  }
  expandedChapterId.value = null
  // 移除已折叠二级节点的入场动画引用，避免对已 dispose 对象持续操作
  appearAnimations = appearAnimations.filter(item => nodeObjects.includes(item.mesh))
  // 移除选中态指向已折叠二级节点的引用，避免悬空 ring
  updateSelectionState()
  requestRender()
}

// 在 chapter 世界位置周围生成下属二级节点轨道并持续顺时针旋转
function expandChapter(chapterId) {
  if (!scene || !expandedGroup || !nodeObjectById.has(chapterId)) return
  // 互斥 + 再次点击折叠
  if (expandedChapterId.value === chapterId) { collapseChapter(); return }
  collapseChapter()

  const chapterGroup = nodeObjectById.get(chapterId)
  const worldPos = chapterGroup.getWorldPosition(new THREE.Vector3())
  const childMap = buildChapterChildMap()
  const children = childMap.get(chapterId) || []
  if (children.length === 0) return

  orbitGroup = new THREE.Group()
  orbitGroup.position.copy(worldPos)

  const count = children.length
  children.forEach((node, i) => {
    // 从正上方起顺时针均匀分布
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / count
    const yOffset = (TYPE_Y_OFFSET[node.type] || 0) + masteryYOffset(node)
    const localPos = new THREE.Vector3(
      Math.cos(angle) * ORBIT_RADIUS,
      yOffset,
      Math.sin(angle) * ORBIT_RADIUS
    )
    // createNodeObject 内部读取 nodePositionById 作为初始位置；存入世界坐标用于入场定位
    nodePositionById.set(node.id, worldPos.clone().add(localPos))
    const group = createNodeObject(node)
    // createNodeObject 已将其注册进 nodeObjects/nodeObjectById/labelObjectById
    // 改挂到轨道组：重置 group 位置为局部坐标
    group.position.copy(localPos)
    orbitGroup.add(group)
  })

  // 轨道边：在 orbitGroup 局部空间画 chapter(原点)→二级节点 的 CONTAINS 连线，随轨道旋转
  buildOrbitEdges(children, count)

  expandedGroup.add(orbitGroup)
  expandedChapterId.value = chapterId

  // 入场弹入
  const childMeshes = children
    .map(n => nodeObjectById.get(n.id)?.userData?.mesh)
    .filter(Boolean)
  appearAnimations.push(...childMeshes.map((mesh, i) => ({ mesh, delay: i * 0.03, t: 0 })))
  requestRender()
}

// 在 orbitGroup 局部空间绘制 chapter→二级 的连线（与轨道一同旋转）
function buildOrbitEdges(children, count) {
  if (!orbitGroup) return
  const meta = getRelationTypeMeta('CONTAINS')
  const baseColor = new THREE.Color(meta.color)
  const positions = []
  const colors = []
  const SEG = 14
  const origin = new THREE.Vector3(0, 0, 0)
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / count
    const end = new THREE.Vector3(
      Math.cos(angle) * ORBIT_RADIUS,
      (TYPE_Y_OFFSET[children[i].type] || 0) + masteryYOffset(children[i]),
      Math.sin(angle) * ORBIT_RADIUS
    )
    const lift = 0.5
    const mid = origin.clone().add(end).multiplyScalar(0.5)
    mid.y += lift + Math.min(origin.distanceTo(end) * 0.05, 1.0)
    const curve = new THREE.QuadraticBezierCurve3(origin.clone(), mid, end)
    const pts = curve.getPoints(SEG)
    for (let k = 0; k < pts.length - 1; k++) {
      const p0 = pts[k]; const p1 = pts[k + 1]
      positions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z)
      const f0 = 0.4 + 0.6 * (k / (pts.length - 1))
      const f1 = 0.4 + 0.6 * ((k + 1) / (pts.length - 1))
      const c0 = baseColor.clone().multiplyScalar(f0)
      const c1 = baseColor.clone().multiplyScalar(f1)
      colors.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const material = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.5
  })
  const mesh = new THREE.LineSegments(geometry, material)
  mesh.userData.isOrbitEdge = true
  orbitGroup.add(mesh)
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
  const center = group.getWorldPosition(new THREE.Vector3())
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
      color: '#c2703e',
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

  const dimmedByHighlight = hasHighlight() && !isNodeHighlighted(nodeId)
  group.userData.dimmed = dimmedByHighlight
  group.userData.selected = selected

  // 缩放
  const targetScale = dimmedByHighlight ? 0.9 : selected ? 1.2 : hovered ? 1.1 : 1
  group.userData.targetScale = targetScale

  // 透明度
  mesh.material.transparent = dimmedByHighlight
  mesh.material.opacity = dimmedByHighlight ? 0.16 : 1

  // emissive
  const baseEmissive = mesh.userData.baseEmissiveIntensity || 0.22
  mesh.userData.emissiveTarget = dimmedByHighlight
    ? baseEmissive * 0.35
    : selected ? 0.85 : hovered ? 0.5 : baseEmissive

  // 光晕
  glow.material.opacity = dimmedByHighlight ? 0.08 : selected ? 0.95 : hovered ? 0.72 : 0.5

  const label = labelObjectById.get(nodeId)
  if (label?.element) {
    label.element.style.opacity = dimmedByHighlight ? '0.22' : ''
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
  // 节点可能在旋转轨道内，取世界坐标定位 ring（ring 直接挂在 scene 下）
  group.getWorldPosition(_orbitWorldVec)
  ring.position.copy(_orbitWorldVec)
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
    mesh.material.opacity = highlightOn
      ? (mesh.userData.type === 'CONTAINS' ? 0.4 : 0.7)
      : (mesh.userData.type === 'CONTAINS' ? 0.5 : 0.8)
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
    // 点击一级知识点 → 互斥切换展开/折叠，同时联动右侧面板
    if (node.type === 'chapter') {
      if (expandedChapterId.value === node.id) collapseChapter()
      else expandChapter(node.id)
    }
    // 单击节点 → 仅选中并联动右侧面板（相机与节点位姿不变）
    emit('select-node', node)
    return
  }
  const sub = getIntersectedSubmission(event)
  if (sub) { emit('select-submission', sub) }
  // 单击空白：保持当前选中，不做任何处理
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
    // 仅 course/chapter 浮动；二级节点靠轨道旋转提供动态感
    nodeGroup.children.forEach((group) => {
      const baseY = group.userData.baseY ?? group.position.y
      const amp = group.userData.floatAmp ?? 0.28
      group.position.y = baseY + Math.sin(elapsed * 0.9 + group.userData.floatPhase) * amp
    })
    dynamic = true
  }
  // 轨道旋转：展开的二级节点整体绕一级知识点顺时针公转
  if (expandedGroup && orbitGroup && motionEnabled.value && expandedGroup.children.length) {
    orbitGroup.rotation.y -= delta * ORBIT_SPEED
    dynamic = true
  }
  // 发光强度向目标平滑过渡；薄弱点红色脉冲；覆盖全部节点（含旋转中的二级节点）
  if (nodeObjectById.size) {
    nodeObjectById.forEach((group) => {
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
  expandedGroup = null
  orbitGroup = null
  expandedChapterId.value = null
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
  // 节点可能在旋转轨道内，取世界坐标作为聚焦目标
  const target = group.getWorldPosition(new THREE.Vector3())
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
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.92);
  box-shadow: 0 4px 12px rgba(120, 90, 50, 0.14);
  color: var(--app-text);
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
  border-color: var(--app-primary);
  box-shadow: 0 0 0 2px var(--app-primary), 0 6px 16px rgba(194, 112, 62, 0.22);
}

.graph-scene :deep(.graph-node-label-course) {
  max-width: 140px;
  min-height: 30px;
  padding: 5px 13px;
  background: linear-gradient(180deg, #d48a55, #b56535);
  border-color: rgba(194, 112, 62, 0.6);
  color: #fff;
  font-size: 14px;
}

.graph-scene :deep(.graph-node-label-chapter) {
  position: relative;
  max-width: 118px;
  color: var(--app-text);
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
  box-shadow: 0 2px 6px rgba(120, 90, 50, 0.25);
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
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.88);
  color: var(--app-text-secondary);
  font-size: 12px;
  font-weight: 800;
  box-shadow: var(--app-shadow);
  backdrop-filter: blur(10px);
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
