<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 },
  color: { type: String, default: '#f59e0b' },
  title: { type: String, default: '链表' }
})

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

function segmentProgress(p, start, end) {
  if (p < start || p > end) return 0
  return (p - start) / (end - start)
}

function smoothSegment(p, start, end) {
  return easeInOutCubic(segmentProgress(p, start, end))
}

const anim = computed(() => {
  const p = clamp(props.progress, 0, 1)
  const intro = clamp(p / 0.1, 0, 1)
  const prepareInsert = smoothSegment(p, 0.1, 0.3)
  const insertMove = smoothSegment(p, 0.3, 0.5)
  const connectInsert = smoothSegment(p, 0.5, 0.6)
  const prepareDelete = smoothSegment(p, 0.6, 0.7)
  const deleteMove = smoothSegment(p, 0.7, 0.88)
  const finish = clamp((p - 0.88) / 0.12, 0, 1)

  const baseY = 360
  const nodeW = 100
  const nodeH = 54
  const gap = 150
  const startX = 310

  const A = { x: startX, y: baseY, label: 'A', opacity: intro }
  const B = { x: startX + gap, y: baseY, label: 'B', opacity: intro * (1 - deleteMove * 1), scale: 1 - prepareDelete * 0.1 }
  const C = { x: startX + gap * 2, y: baseY, label: 'C', opacity: intro }

  const X = {
    x: 480 + (startX + gap - 480) * insertMove,
    y: 200 + (baseY - 200) * insertMove,
    label: 'X',
    opacity: prepareInsert,
    scale: 0.7 + 0.3 * prepareInsert
  }

  B.y = baseY + deleteMove * 80
  B.opacity = Math.max(0, intro * (1 - deleteMove))

  const arrowAB = intro * (1 - insertMove)
  const arrowBC = intro * (1 - deleteMove)
  const arrowAX = connectInsert * (1 - deleteMove) + finish * 1
  const arrowXC = (connectInsert * (1 - deleteMove) + deleteMove)

  return {
    A, B, C, X,
    arrowAB, arrowBC, arrowAX, arrowXC,
    intro, finish
  }
})

function arrowPath(x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1) return ''
  const nx = dx / len
  const ny = dy / len
  const endX = x2 - 55 * nx
  const endY = y2 - 55 * ny
  return `M${x1 + 55 * nx},${y1 + 55 * ny} L${endX},${endY}`
}
</script>

<template>
  <svg viewBox="0 0 1280 720" class="scene-svg" preserveAspectRatio="xMidYMid meet">
    <rect width="1280" height="720" fill="#faf6f0" />

    <circle cx="150" cy="120" r="70" :fill="color" fill-opacity="0.10" />
    <circle cx="1160" cy="650" r="100" :fill="color" fill-opacity="0.08" />

    <text x="640" y="95" text-anchor="middle" fill="#3d2b1f" font-size="50" font-weight="800" font-family="Georgia, 'Times New Roman', serif" :opacity="anim.intro">
      {{ title }}
    </text>

    <!-- 节点 A -->
    <g :opacity="anim.A.opacity" :transform="`translate(${anim.A.x}, ${anim.A.y})`">
      <rect x="-45" y="-28" width="90" height="56" rx="14" fill="#fff" stroke="#d6c8b5" stroke-width="2" />
      <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="800">{{ anim.A.label }}</text>
    </g>

    <!-- 节点 B -->
    <g :opacity="anim.B.opacity" :transform="`translate(${anim.B.x}, ${anim.B.y}) scale(${anim.B.scale})`">
      <rect x="-45" y="-28" width="90" height="56" rx="14" fill="#fff" stroke="#ef4444" stroke-width="2" />
      <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="800">{{ anim.B.label }}</text>
    </g>

    <!-- 节点 C -->
    <g :opacity="anim.C.opacity" :transform="`translate(${anim.C.x}, ${anim.C.y})`">
      <rect x="-45" y="-28" width="90" height="56" rx="14" fill="#fff" stroke="#d6c8b5" stroke-width="2" />
      <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="800">{{ anim.C.label }}</text>
    </g>

    <!-- 新节点 X -->
    <g :opacity="anim.X.opacity" :transform="`translate(${anim.X.x}, ${anim.X.y}) scale(${anim.X.scale})`">
      <rect x="-45" y="-28" width="90" height="56" rx="14" :fill="color" fill-opacity="0.18" :stroke="color" stroke-width="3" />
      <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="800">{{ anim.X.label }}</text>
    </g>

    <path v-if="anim.arrowAB > 0" :d="arrowPath(anim.A.x, anim.A.y, anim.B.x, anim.B.y)" fill="none" stroke="#a89a88" stroke-width="3" marker-end="url(#ll-arrowhead)" :opacity="anim.arrowAB" />
    <path v-if="anim.arrowBC > 0" :d="arrowPath(anim.B.x, anim.B.y, anim.C.x, anim.C.y)" fill="none" stroke="#a89a88" stroke-width="3" marker-end="url(#ll-arrowhead)" :opacity="anim.arrowBC" />
    <path v-if="anim.arrowAX > 0" :d="arrowPath(anim.A.x, anim.A.y, anim.X.x, anim.X.y)" fill="none" :stroke="color" stroke-width="3" marker-end="url(#ll-arrowhead)" :opacity="anim.arrowAX" />
    <path v-if="anim.arrowXC > 0" :d="arrowPath(anim.X.x, anim.X.y, anim.C.x, anim.C.y)" fill="none" :stroke="color" stroke-width="3" marker-end="url(#ll-arrowhead)" :opacity="anim.arrowXC" />

    <defs>
      <marker id="ll-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" fill="#a89a88" />
      </marker>
    </defs>
  </svg>
</template>

<style scoped>
.scene-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
