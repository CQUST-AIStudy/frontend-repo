<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 },
  color: { type: String, default: '#f59e0b' },
  title: { type: String, default: '参数传递' }
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
  const pass = seg(p, 0.5, 0.7)
  const calc = seg(p, 0.7, 0.88)
  const result = seg(p, 0.88, 1)
  return { intro, define, call, pass, calc, result }
})
</script>

<template>
  <svg viewBox="0 0 1280 720" class="scene-svg" preserveAspectRatio="xMidYMid meet">
    <rect width="1280" height="720" fill="#faf6f0" />

    <circle cx="140" cy="120" r="70" :fill="color" fill-opacity="0.10" />
    <circle cx="1150" cy="610" r="100" :fill="color" fill-opacity="0.08" />

    <text x="640" y="95" text-anchor="middle" fill="#3d2b1f" font-size="50" font-weight="800" font-family="NotoSerifSC, 'Noto Serif SC', serif" :opacity="anim.intro">
      {{ title }}
    </text>

    <!-- 函数定义 -->
    <g :opacity="anim.define" :transform="`translate(640, ${210 - (1 - anim.define) * 40})`">
      <rect x="-280" y="-55" width="560" height="110" rx="16" fill="#fff" stroke="#e8dfd3" stroke-width="2" />
      <text x="0" y="-18" text-anchor="middle" fill="#8c7b66" font-size="16" font-weight="600">定义</text>
      <text x="0" y="20" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="700" font-family="monospace">int add(int a, int b) { return a + b; }</text>
    </g>

    <!-- 调用 -->
    <g :opacity="anim.call" :transform="`translate(640, ${350 - (1 - anim.call) * 40})`">
      <rect x="-190" y="-38" width="380" height="76" rx="14" :fill="color" fill-opacity="0.12" :stroke="color" stroke-width="2" />
      <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="700" font-family="monospace">int sum = add(3, 5);</text>
    </g>

    <!-- 参数传递 -->
    <g :opacity="anim.pass" :transform="`translate(640, 480)`">
      <g :transform="`translate(-220, 0)`">
        <rect x="-45" y="-32" width="90" height="64" rx="10" fill="#fff" stroke="#d6c8b5" stroke-width="2" />
        <text x="0" y="6" text-anchor="middle" fill="#4a3b2a" font-size="22" font-weight="800">3</text>
      </g>
      <g :transform="`translate(-80, 0)`">
        <rect x="-45" y="-32" width="90" height="64" rx="10" fill="#fff" stroke="#d6c8b5" stroke-width="2" />
        <text x="0" y="6" text-anchor="middle" fill="#4a3b2a" font-size="22" font-weight="800">5</text>
      </g>

      <path d="M-175,-5 L-115,-5" fill="none" :stroke="color" stroke-width="3" marker-end="url(#param-arrowhead)" />
      <path d="M-35,-5 L25,-5" fill="none" :stroke="color" stroke-width="3" marker-end="url(#param-arrowhead)" />

      <g :transform="`translate(110, 0)`">
        <rect x="-45" y="-32" width="90" height="64" rx="10" :fill="color" fill-opacity="0.15" :stroke="color" stroke-width="2" />
        <text x="0" y="-8" text-anchor="middle" fill="#7c4a0f" font-size="13" font-weight="700">a</text>
        <text x="0" y="14" text-anchor="middle" fill="#4a3b2a" font-size="22" font-weight="800">3</text>
      </g>
      <g :transform="`translate(250, 0)`">
        <rect x="-45" y="-32" width="90" height="64" rx="10" :fill="color" fill-opacity="0.15" :stroke="color" stroke-width="2" />
        <text x="0" y="-8" text-anchor="middle" fill="#7c4a0f" font-size="13" font-weight="700">b</text>
        <text x="0" y="14" text-anchor="middle" fill="#4a3b2a" font-size="22" font-weight="800">5</text>
      </g>
    </g>

    <!-- 计算 -->
    <g :opacity="anim.calc" :transform="`translate(640, 480)`">
      <text x="380" y="6" text-anchor="middle" fill="#7c4a0f" font-size="22" font-weight="800">3 + 5 = 8</text>
    </g>

    <!-- 结果 -->
    <g :opacity="anim.result" :transform="`translate(640, 590)`">
      <rect x="-130" y="-30" width="260" height="60" rx="12" fill="#dcfce7" stroke="#22c55e" stroke-width="2" />
      <text x="0" y="8" text-anchor="middle" fill="#166534" font-size="24" font-weight="800" font-family="monospace">sum = 8</text>
    </g>

    <defs>
      <marker id="param-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
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
