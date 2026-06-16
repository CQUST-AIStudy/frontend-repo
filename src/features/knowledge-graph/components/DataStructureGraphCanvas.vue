<script setup>
import * as THREE from 'three'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'
import { getNodeTypeMeta, getRelationTypeMeta } from '../graphDatabaseAdapter'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  relations: {
    type: Array,
    default: () => []
  },
  selectedNodeId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select-node'])

const shellRef = ref(null)
const sceneRef = ref(null)
const hoveredNode = shallowRef(null)
const isFullscreen = shallowRef(false)
const hasGraphData = computed(() => props.nodes.length > 0)

const nodeTypeLegend = computed(() => {
  const typeSet = new Set(props.nodes.map(node => node.type).filter(Boolean))
  return Array.from(typeSet).map(type => ({
    type,
    ...getNodeTypeMeta(type)
  }))
})

const relationTypeLegend = computed(() => {
  const typeSet = new Set(props.relations.map(relation => relation.type).filter(Boolean))
  return Array.from(typeSet).map(type => ({
    type,
    ...getRelationTypeMeta(type)
  }))
})

let scene = null
let camera = null
let renderer = null
let labelRenderer = null
let controls = null
let animationId = 0
let resizeObserver = null
let nodeGroup = null
let edgeGroup = null
let labelGroup = null
let hoverRing = null
let selectRing = null
let raycaster = null
let pointer = null
let nodeObjects = []
let nodeObjectById = new Map()
let nodePositionById = new Map()
let labelObjectById = new Map()
let nodeBaseYById = new Map()
let initialCameraPosition = null
let initialControlTarget = null

const SIZE_BY_TYPE = {
  course: 2.8,
  chapter: 1.75,
  concept: 1.08,
  structure: 1.16,
  algorithm: 1.08,
  operation: 0.95,
  exercise: 0.86
}

const TYPE_Z_OFFSET = {
  course: 0,
  chapter: 1.6,
  concept: 2.7,
  structure: 2.2,
  algorithm: 1.1,
  operation: 0.1,
  exercise: -0.9
}

const DASH_BY_RELATION = {
  CONTAINS: null,
  PREREQUISITE: [0.72, 0.44],
  RELATED_TO: [0.32, 0.32],
  APPLIES_TO: [0.48, 0.34],
  TESTED_BY: [0.24, 0.28]
}

function makeColor(color, fallback = '#1270d8') {
  return new THREE.Color(color || fallback)
}

function isSelected(nodeId) {
  return nodeId && nodeId === props.selectedNodeId
}

function getNodeSize(node) {
  return SIZE_BY_TYPE[node.type] || SIZE_BY_TYPE.concept
}

function getGraphCenterPosition() {
  return new THREE.Vector3(0, 0.2, 0)
}

function getContainerSize() {
  const rect = sceneRef.value?.getBoundingClientRect()
  return {
    width: Math.max(320, Math.floor(rect?.width || 0)),
    height: Math.max(360, Math.floor(rect?.height || 0))
  }
}

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
    if (source?.type === 'chapter' && target && !target.chapterId) {
      relationChapterMap.set(target.id, source.id)
    }
    if (target?.type === 'chapter' && source && !source.chapterId) {
      relationChapterMap.set(source.id, target.id)
    }
  }

  const positions = new Map()
  if (course) positions.set(course.id, getGraphCenterPosition())

  const chapterRadius = chapters.length > 5 ? 14.8 : 12.8
  chapters.forEach((chapter, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(chapters.length, 1)
    positions.set(chapter.id, new THREE.Vector3(
      Math.cos(angle) * chapterRadius,
      0.85,
      Math.sin(angle) * chapterRadius
    ))
  })

  const nodesByChapter = new Map(chapters.map(chapter => [chapter.id, []]))
  const looseNodes = []

  for (const node of nodes) {
    if (node.type === 'course' || node.type === 'chapter') continue
    const chapterId = node.chapterId || relationChapterMap.get(node.id)
    if (chapterId && nodesByChapter.has(chapterId)) {
      nodesByChapter.get(chapterId).push(node)
    } else {
      looseNodes.push(node)
    }
  }

  chapters.forEach((chapter, chapterIndex) => {
    const chapterPosition = positions.get(chapter.id)
    const children = nodesByChapter.get(chapter.id) || []
    const clusterRadius = Math.max(4.2, Math.min(7.8, 3.4 + children.length * 0.34))
    const baseAngle = -Math.PI / 2 + (Math.PI * 2 * chapterIndex) / Math.max(chapters.length, 1)

    children.forEach((node, index) => {
      const childAngle = baseAngle - 0.98 + (1.96 * (index + 0.5)) / Math.max(children.length, 1)
      const ringOffset = index % 2 === 0 ? 0 : 1.25
      const radius = clusterRadius + ringOffset
      const yOffset = TYPE_Z_OFFSET[node.type] || 0
      positions.set(node.id, new THREE.Vector3(
        chapterPosition.x + Math.cos(childAngle) * radius,
        yOffset,
        chapterPosition.z + Math.sin(childAngle) * radius
      ))
    })
  })

  looseNodes.forEach((node, index) => {
    const angle = Math.PI / 5 + (Math.PI * 2 * index) / Math.max(looseNodes.length, 1)
    const radius = 19 + (index % 3) * 1.2
    positions.set(node.id, new THREE.Vector3(
      Math.cos(angle) * radius,
      TYPE_Z_OFFSET[node.type] || 0,
      Math.sin(angle) * radius
    ))
  })

  return positions
}

function createGlowSprite(color, scale) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(64, 64, 5, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(0.28, `${color}88`)
  gradient.addColorStop(1, `${color}00`)
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(scale, scale, 1)
  sprite.userData.disposableTexture = texture
  return sprite
}

function createNodeLabel(node, meta, size) {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = `graph-node-label graph-node-label-${node.type || 'concept'}`
  element.textContent = node.label
  element.style.setProperty('--node-color', meta.color)
  element.style.setProperty('--node-soft-color', meta.softColor)
  element.title = node.summary || node.label

  const label = new CSS2DObject(element)
  label.position.set(0, size + 0.48, 0)
  label.userData.node = node
  labelObjectById.set(node.id, label)
  return label
}

function createNodeObject(node) {
  const meta = getNodeTypeMeta(node.type)
  const size = getNodeSize(node)
  const group = new THREE.Group()
  const color = makeColor(meta.color)
  const selected = isSelected(node.id)

  const geometry = new THREE.SphereGeometry(size, 40, 28)
  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.46,
    metalness: 0.08,
    clearcoat: 0.7,
    clearcoatRoughness: 0.28,
    emissive: color,
    emissiveIntensity: selected ? 0.25 : 0.08
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.userData.node = node
  mesh.userData.baseScale = 1
  mesh.userData.baseEmissiveIntensity = material.emissiveIntensity
  group.add(mesh)

  const glow = createGlowSprite(meta.color, size * (selected ? 5.3 : 4.1))
  glow.position.set(0, -size * 0.22, 0)
  glow.material.opacity = selected ? 0.8 : 0.44
  glow.userData.node = node
  group.add(glow)

  const label = createNodeLabel(node, meta, size)
  group.add(label)

  const position = nodePositionById.get(node.id) || new THREE.Vector3()
  group.position.copy(position)
  group.userData.node = node
  group.userData.mesh = mesh
  group.userData.glow = glow
  nodeBaseYById.set(node.id, position.y)

  nodeObjects.push(mesh)
  nodeObjectById.set(node.id, group)
  return group
}

function createLineMaterial(relation) {
  const meta = getRelationTypeMeta(relation.type)
  const dash = DASH_BY_RELATION[relation.type]
  const params = {
    color: meta.color,
    transparent: true,
    opacity: relation.type === 'CONTAINS' ? 0.56 : 0.72,
    linewidth: 1
  }

  return dash
    ? new THREE.LineDashedMaterial({ ...params, dashSize: dash[0], gapSize: dash[1] })
    : new THREE.LineBasicMaterial(params)
}

function createRelationObject(relation) {
  const source = nodePositionById.get(relation.source)
  const target = nodePositionById.get(relation.target)
  if (!source || !target) return null

  const sourceNode = props.nodes.find(node => node.id === relation.source)
  const targetNode = props.nodes.find(node => node.id === relation.target)
  const sourceRadius = getNodeSize(sourceNode || {})
  const targetRadius = getNodeSize(targetNode || {})
  const direction = target.clone().sub(source).normalize()
  const start = source.clone().add(direction.clone().multiplyScalar(sourceRadius * 0.92))
  const end = target.clone().sub(direction.clone().multiplyScalar(targetRadius * 1.02))
  const mid = start.clone().add(end).multiplyScalar(0.5)
  const curveLift = relation.type === 'CONTAINS' ? 0.4 : 1.2
  const control = mid.clone()
  control.y += curveLift + Math.min(start.distanceTo(end) * 0.05, 1.2)
  const curve = new THREE.QuadraticBezierCurve3(start, control, end)
  const points = curve.getPoints(36)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const line = new THREE.Line(geometry, createLineMaterial(relation))
  line.userData.relation = relation
  if (line.material.isLineDashedMaterial) line.computeLineDistances()

  const group = new THREE.Group()
  group.add(line)

  if (relation.type !== 'CONTAINS') {
    const meta = getRelationTypeMeta(relation.type)
    const arrowGeometry = new THREE.ConeGeometry(0.22, 0.64, 18)
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: meta.color,
      transparent: true,
      opacity: 0.78
    })
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
    const arrowPoint = points[points.length - 2]
    arrow.position.copy(end)
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(arrowPoint).normalize())
    group.add(arrow)
  }

  return group
}

function createSelectionRing(color = '#1270d8') {
  const geometry = new THREE.TorusGeometry(1, 0.035, 10, 96)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  })
  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.x = Math.PI / 2
  ring.visible = false
  return ring
}

function createSceneBase() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#f8fbff')
  scene.fog = new THREE.Fog('#f8fbff', 42, 92)

  camera = new THREE.PerspectiveCamera(46, 1, 0.1, 220)
  initialCameraPosition = new THREE.Vector3(0, 24, 36)
  initialControlTarget = new THREE.Vector3(0, 0, 0)
  camera.position.copy(initialCameraPosition)

  const { width, height } = getContainerSize()
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  sceneRef.value.appendChild(renderer.domElement)

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(width, height)
  labelRenderer.domElement.className = 'graph-label-layer'
  sceneRef.value.appendChild(labelRenderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  controls.minDistance = 12
  controls.maxDistance = 78
  controls.maxPolarAngle = Math.PI * 0.47
  controls.target.copy(initialControlTarget)

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  const ambient = new THREE.HemisphereLight('#ffffff', '#dbeafe', 1.35)
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight('#ffffff', 2.1)
  keyLight.position.set(14, 28, 18)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.width = 2048
  keyLight.shadow.mapSize.height = 2048
  keyLight.shadow.camera.near = 1
  keyLight.shadow.camera.far = 80
  keyLight.shadow.camera.left = -36
  keyLight.shadow.camera.right = 36
  keyLight.shadow.camera.top = 36
  keyLight.shadow.camera.bottom = -36
  scene.add(keyLight)

  const fillLight = new THREE.PointLight('#7dd3fc', 1.2, 70)
  fillLight.position.set(-20, 12, -16)
  scene.add(fillLight)

  const grid = new THREE.GridHelper(58, 34, '#dbeafe', '#edf2f7')
  grid.position.y = -1.36
  grid.material.transparent = true
  grid.material.opacity = 0.72
  scene.add(grid)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(34, 96),
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.62,
      roughness: 0.88
    })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.42
  floor.receiveShadow = true
  scene.add(floor)

  nodeGroup = new THREE.Group()
  edgeGroup = new THREE.Group()
  labelGroup = new THREE.Group()
  hoverRing = createSelectionRing('#334155')
  selectRing = createSelectionRing('#1270d8')
  scene.add(edgeGroup, nodeGroup, labelGroup, hoverRing, selectRing)
}

function disposeMaterial(material) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial)
    return
  }
  if (!material) return
  if (material.map) material.map.dispose()
  material.dispose?.()
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) disposeMaterial(child.material)
    if (child.userData?.disposableTexture) child.userData.disposableTexture.dispose()
    if (child.element?.remove) child.element.remove()
  })
}

function clearGraphObjects() {
  const graphGroups = [nodeGroup, edgeGroup, labelGroup]
  graphGroups.forEach((group) => {
    if (!group) return
    while (group.children.length) {
      const child = group.children.pop()
      disposeObject(child)
    }
  })
  nodeObjects = []
  nodeObjectById = new Map()
  nodePositionById = new Map()
  labelObjectById = new Map()
  nodeBaseYById = new Map()
}

function buildGraphScene() {
  if (!scene || !nodeGroup || !edgeGroup || !hasGraphData.value) return
  clearGraphObjects()
  nodePositionById = buildNodeLayout()

  for (const relation of props.relations || []) {
    const relationObject = createRelationObject(relation)
    if (relationObject) edgeGroup.add(relationObject)
  }

  for (const node of props.nodes || []) {
    const nodeObject = createNodeObject(node)
    nodeGroup.add(nodeObject)
  }

  updateSelectionState()
}

function updateNodeVisual(group, options = {}) {
  const { selected = false, hovered = false } = options
  const mesh = group?.userData?.mesh
  const glow = group?.userData?.glow
  if (!mesh || !glow) return

  const targetScale = selected ? 1.18 : hovered ? 1.1 : 1
  mesh.scale.setScalar(targetScale)
  mesh.material.emissiveIntensity = selected ? 0.3 : hovered ? 0.22 : mesh.userData.baseEmissiveIntensity || 0.08
  glow.material.opacity = selected ? 0.82 : hovered ? 0.68 : 0.44
}

function updateRing(ring, nodeId, scaleOffset) {
  if (!ring) return
  const group = nodeObjectById.get(nodeId)
  if (!group) {
    ring.visible = false
    return
  }
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

function handlePointerMove(event) {
  const node = getIntersectedNode(event)
  if (node?.id === hoveredNode.value?.id) return
  hoveredNode.value = node || null
  renderer.domElement.style.cursor = node ? 'pointer' : 'grab'
  updateSelectionState()
}

function handlePointerLeave() {
  hoveredNode.value = null
  if (renderer?.domElement) renderer.domElement.style.cursor = 'grab'
  updateSelectionState()
}

function handleClick(event) {
  const node = getIntersectedNode(event)
  if (!node) return
  emit('select-node', node)
}

function resizeScene() {
  if (!camera || !renderer || !labelRenderer) return
  const { width, height } = getContainerSize()
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  labelRenderer.setSize(width, height)
}

function animate() {
  animationId = window.requestAnimationFrame(animate)
  if (nodeGroup) {
    nodeGroup.children.forEach((child, index) => {
      const node = child.userData?.node
      if (!node) return
      const baseY = nodeBaseYById.get(node.id) ?? child.position.y
      child.position.y = baseY + Math.sin(Date.now() * 0.0009 + index * 0.7) * 0.12
    })
  }
  if (hoverRing?.visible) hoverRing.rotation.z += 0.012
  if (selectRing?.visible) selectRing.rotation.z -= 0.006
  controls?.update()
  renderer?.render(scene, camera)
  labelRenderer?.render(scene, camera)
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
  }

  controls?.dispose()
  clearGraphObjects()

  if (scene) {
    scene.traverse((child) => {
      if (child === scene) return
      if (child.geometry) child.geometry.dispose()
      if (child.material) disposeMaterial(child.material)
    })
  }

  renderer?.dispose()
  renderer?.forceContextLoss?.()
  renderer?.domElement?.remove()
  labelRenderer?.domElement?.remove()

  scene = null
  camera = null
  renderer = null
  labelRenderer = null
  controls = null
  nodeGroup = null
  edgeGroup = null
  labelGroup = null
  hoverRing = null
  selectRing = null
  raycaster = null
  pointer = null
  hoveredNode.value = null
  nodeBaseYById = new Map()
}

function resetCamera() {
  if (!camera || !controls || !initialCameraPosition || !initialControlTarget) return
  camera.position.copy(initialCameraPosition)
  controls.target.copy(initialControlTarget)
  controls.update()
}

function zoomCamera(direction) {
  if (!camera || !controls) return
  const target = controls.target.clone()
  const distance = camera.position.distanceTo(target)
  const nextDistance = THREE.MathUtils.clamp(distance * (direction === 'in' ? 0.82 : 1.18), controls.minDistance, controls.maxDistance)
  const vector = camera.position.clone().sub(target).normalize().multiplyScalar(nextDistance)
  camera.position.copy(target.clone().add(vector))
  controls.update()
}

function focusSelectedNode() {
  const nodeId = props.selectedNodeId || hoveredNode.value?.id
  const group = nodeObjectById.get(nodeId)
  if (!group || !camera || !controls) return
  const target = group.position.clone()
  const offset = new THREE.Vector3(7, 7.5, 10)
  camera.position.copy(target.clone().add(offset))
  controls.target.copy(target)
  controls.update()
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

watch(
  () => props.selectedNodeId,
  () => {
    updateSelectionState()
  }
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
          <button type="button" class="graph-tool-button" title="全屏" @click="toggleFullscreen">
            <LucideIcon :name="isFullscreen ? 'minimize' : 'maximize'" :size="16" />
          </button>
        </div>

        <div v-if="hoveredNode" class="node-tooltip">
          <strong>{{ hoveredNode.label }}</strong>
          <span>{{ hoveredNode.summary || '暂无简介' }}</span>
        </div>

        <div class="graph-hint">
          <LucideIcon name="mouse-pointer-click" :size="14" />
          拖拽旋转 · 滚轮缩放 · 点击节点查看详情
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
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 251, 255, 0.96)),
    radial-gradient(circle at 50% 18%, rgba(59, 130, 246, 0.14), transparent 38%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
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

.graph-scene :deep(.graph-node-label) {
  max-width: 96px;
  min-height: 24px;
  padding: 3px 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  color: var(--node-color);
  font-size: 12px;
  font-weight: 850;
  line-height: 1.35;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  pointer-events: none;
}

.graph-scene :deep(.graph-node-label-course) {
  max-width: 132px;
  min-height: 30px;
  padding: 5px 12px;
  background: rgba(18, 112, 216, 0.92);
  color: #fff;
  font-size: 14px;
}

.graph-scene :deep(.graph-node-label-chapter) {
  max-width: 112px;
  background: var(--node-soft-color);
  color: var(--node-color);
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
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
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
  color: #475569;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.graph-tool-button:hover {
  background: #eff6ff;
  color: #1270d8;
  transform: translateY(-1px);
}

.node-tooltip {
  position: absolute;
  right: 18px;
  bottom: 74px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: min(280px, calc(100% - 36px));
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(12px);
}

.node-tooltip strong {
  overflow: hidden;
  color: #0f172a;
  font-size: 14px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-tooltip span {
  display: -webkit-box;
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
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
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
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
  border-top: 1px solid rgba(219, 234, 254, 0.9);
  background: rgba(255, 255, 255, 0.82);
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
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.legend-item i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.04);
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
  .graph-canvas-shell {
    min-height: 540px;
  }

  .graph-stage {
    min-height: 520px;
  }
}

@media (max-width: 640px) {
  .graph-canvas-shell {
    min-height: 500px;
  }

  .graph-stage {
    min-height: 470px;
  }

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
