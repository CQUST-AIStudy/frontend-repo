<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 },
  color: { type: String, default: '#f59e0b' },
  title: { type: String, default: '指针' }
})

function clamp(v, min, max) { return Math.min(Math.max(v, min), max) }
function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
function seg(p, start, end) {
  if (p < start || p > end) return 0
  return ease((p - start) / (end - start))
}

const anim = computed(() => {
  const p = clamp(props.progress, 0, 1)
  const intro = clamp(p / 0.1, 0, 1)
  const createPointer = seg(p, 0.1, 0.35)
  const point = seg(p, 0.35, 0.6)
  const deref = seg(p, 0.6, 0.85)
  const finish = seg(p, 0.85, 1)
  return { intro, createPointer, point, deref, finish }
})
</script>

<template>
  <svg viewBox="0 0 1280 720" class="scene-svg" preserveAspectRatio="xMidYMid meet">
    <rect width="1280" height="720" fill="#faf6f0" />

    <circle cx="140" cy="120" r="75" :fill="color" fill-opacity="0.10" />
    <circle cx="1150" cy="620" r="100" :fill="color" fill-opacity="0.08" />

    <text x="640" y="95" text-anchor="middle" fill="#3d2b1f" font-size="50" font-weight="800" font-family="NotoSerifSC, 'Noto Serif SC', serif" :opacity="anim.intro">
      {{ title }}
    </text>

    <!-- 内存区域 -->
    <rect x="250" y="240" width="300" height="220" rx="16" fill="#fff" stroke="#e8dfd3" stroke-width="2" />
    <text x="400" y="220" text-anchor="middle" fill="#8c7b66" font-size="16" font-weight="600">内存</text>

    <!-- 变量 a -->
    <g :transform="`translate(400, 350)`">
      <rect x="-80" y="-45" width="160" height="90" rx="12" fill="#fff" stroke="#d6c8b5" stroke-width="2" />
      <text x="0" y="-12" text-anchor="middle" fill="#8c7b66" font-size="15" font-weight="600">int a</text>
      <text x="0" y="20" text-anchor="middle" fill="#4a3b2a" font-size="30" font-weight="800">{{ anim.deref > 0 ? 20 : 10 }}</text>
      <text x="0" y="48" text-anchor="middle" fill="#a89a88" font-size="13" font-weight="600">0x1000</text>
    </g>

    <!-- 指针 p -->
    <g :opacity="anim.createPointer" :transform="`translate(880, ${350 + (1 - anim.createPointer) * 80})`">
      <rect x="-80" y="-45" width="160" height="90" rx="12" :fill="color" fill-opacity="0.15" :stroke="color" stroke-width="2" />
      <text x="0" y="-12" text-anchor="middle" fill="#7c4a0f" font-size="15" font-weight="600">int *p</text>
      <text x="0" y="20" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="800">0x1000</text>
      <text x="0" y="48" text-anchor="middle" fill="#a89a88" font-size="13" font-weight="600">0x2000</text>
    </g>

    <!-- 指向箭头 -->
    <g :opacity="anim.point">
      <path d="M800,350 Q680,350 560,350" fill="none" :stroke="color" stroke-width="4" stroke-dasharray="10 6" marker-end="url(#ptr-arrowhead)" />
    </g>

    <!-- 解引用效果 -->
    <g :opacity="anim.deref" :transform="`translate(400, 350)`">
      <circle r="65" fill="none" :stroke="color" stroke-width="4" :stroke-dasharray="`${anim.deref * 410} 410`" opacity="0.5" />
      <text x="0" y="-95" text-anchor="middle" :fill="color" font-size="22" font-weight="800" font-family="monospace">*p = 20</text>
    </g>

    <defs>
      <marker id="ptr-arrowhead" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <path d="M0,0 L0,12 L12,6 z" :fill="color" />
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
