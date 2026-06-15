<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 },
  color: { type: String, default: '#f59e0b' },
  title: { type: String, default: '函数' }
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
  const define = seg(p, 0.1, 0.3)
  const call = seg(p, 0.3, 0.5)
  const execute = seg(p, 0.5, 0.75)
  const returnVal = seg(p, 0.75, 1)
  return { intro, define, call, execute, returnVal }
})
</script>

<template>
  <svg viewBox="0 0 1280 720" class="scene-svg" preserveAspectRatio="xMidYMid meet">
    <rect width="1280" height="720" fill="#faf6f0" />

    <circle cx="130" cy="130" r="70" :fill="color" fill-opacity="0.10" />
    <circle cx="1160" cy="610" r="100" :fill="color" fill-opacity="0.08" />

    <text x="640" y="95" text-anchor="middle" fill="#3d2b1f" font-size="50" font-weight="800" font-family="Georgia, 'Times New Roman', serif" :opacity="anim.intro">
      {{ title }}
    </text>

    <!-- 函数定义 -->
    <g :opacity="anim.define" :transform="`translate(640, ${210 - (1 - anim.define) * 40})`">
      <rect x="-280" y="-60" width="560" height="120" rx="16" fill="#fff" stroke="#e8dfd3" stroke-width="2" />
      <text x="0" y="-22" text-anchor="middle" fill="#8c7b66" font-size="16" font-weight="600">定义</text>
      <text x="0" y="16" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="700" font-family="monospace">int add(int a, int b) { return a + b; }</text>
    </g>

    <!-- 调用 -->
    <g :opacity="anim.call" :transform="`translate(640, ${370 - (1 - anim.call) * 40})`">
      <rect x="-190" y="-40" width="380" height="80" rx="14" :fill="color" fill-opacity="0.12" :stroke="color" stroke-width="2" />
      <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="700" font-family="monospace">int sum = add(3, 5);</text>
    </g>

    <!-- 执行 -->
    <g :opacity="anim.execute" :transform="`translate(640, 370)`">
      <text x="0" y="-70" text-anchor="middle" fill="#7c4a0f" font-size="20" font-weight="800" font-family="monospace">a = 3, b = 5</text>
      <text x="0" y="75" text-anchor="middle" fill="#7c4a0f" font-size="20" font-weight="800" font-family="monospace">return 3 + 5 = 8</text>
    </g>

    <!-- 返回结果 -->
    <g :opacity="anim.returnVal" :transform="`translate(640, 520)`">
      <rect x="-120" y="-35" width="240" height="70" rx="12" fill="#dcfce7" stroke="#22c55e" stroke-width="2" />
      <text x="0" y="8" text-anchor="middle" fill="#166534" font-size="26" font-weight="800" font-family="monospace">sum = 8</text>
    </g>

    <!-- 流程箭头 -->
    <g :opacity="anim.call">
      <path d="M640,280 L640,310" stroke="#a89a88" stroke-width="3" marker-end="url(#fn-arrowhead)" />
    </g>
    <g :opacity="anim.returnVal">
      <path d="M780,520 L900,520" fill="none" stroke="#22c55e" stroke-width="4" marker-end="url(#fn-arrowhead)" />
    </g>

    <defs>
      <marker id="fn-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
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
