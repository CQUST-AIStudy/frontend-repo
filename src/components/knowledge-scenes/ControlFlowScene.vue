<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 },
  color: { type: String, default: '#f59e0b' },
  title: { type: String, default: '控制流' }
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
  const cond = seg(p, 0.1, 0.35)
  const trueBranch = seg(p, 0.35, 0.55)
  const loop = seg(p, 0.55, 0.8)
  return { intro, cond, trueBranch, loop }
})
</script>

<template>
  <svg viewBox="0 0 1280 720" class="scene-svg" preserveAspectRatio="xMidYMid meet">
    <rect width="1280" height="720" fill="#faf6f0" />

    <circle cx="150" cy="120" r="70" :fill="color" fill-opacity="0.10" />
    <circle cx="1140" cy="620" r="95" :fill="color" fill-opacity="0.08" />

    <text x="640" y="95" text-anchor="middle" fill="#3d2b1f" font-size="50" font-weight="800" font-family="Georgia, 'Times New Roman', serif" :opacity="anim.intro">
      {{ title }}
    </text>

    <!-- 判断菱形 -->
    <g :opacity="anim.cond" :transform="`translate(640, 260)`">
      <polygon points="0,-65 135,0 0,65 -135,0" fill="#fff" stroke="#d6c8b5" stroke-width="3" />
      <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="22" font-weight="700" font-family="monospace">score &gt;= 60</text>
    </g>

    <!-- True 分支 -->
    <g :opacity="anim.trueBranch" :transform="`translate(880, 420)`">
      <rect x="-80" y="-35" width="160" height="70" rx="12" :fill="color" fill-opacity="0.15" :stroke="color" stroke-width="2" />
      <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="22" font-weight="700">及格</text>
    </g>

    <!-- False 分支 -->
    <g :opacity="anim.trueBranch" :transform="`translate(400, 420)`">
      <rect x="-80" y="-35" width="160" height="70" rx="12" fill="#fee2e2" stroke="#ef4444" stroke-width="2" />
      <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="22" font-weight="700">不及格</text>
    </g>

    <!-- 分支标签 -->
    <g :opacity="anim.trueBranch">
      <text x="505" y="330" text-anchor="middle" fill="#ef4444" font-size="16" font-weight="700">false</text>
      <text x="775" y="330" text-anchor="middle" fill="#7c4a0f" font-size="16" font-weight="700">true</text>
    </g>

    <!-- 循环 -->
    <g :opacity="anim.loop" :transform="`translate(640, 560)`">
      <rect x="-170" y="-40" width="340" height="80" rx="14" fill="#fff" stroke="#e8dfd3" stroke-width="2" />
      <text x="0" y="-6" text-anchor="middle" fill="#4a3b2a" font-size="20" font-weight="700" font-family="monospace">for (i = 0; i &lt; 3; i++)</text>
      <text x="0" y="28" text-anchor="middle" :fill="color" font-size="24" font-weight="800">i = {{ Math.min(Math.floor(anim.loop * 3), 2) }}</text>
    </g>

    <!-- 流程箭头 -->
    <g :opacity="anim.cond">
      <path d="M640,170 L640,185" stroke="#a89a88" stroke-width="3" marker-end="url(#cf-arrowhead)" />
    </g>
    <g :opacity="anim.trueBranch">
      <path d="M740,280 L820,380" fill="none" :stroke="color" stroke-width="3" marker-end="url(#cf-arrowhead)" />
      <path d="M540,280 L460,380" fill="none" stroke="#ef4444" stroke-width="3" marker-end="url(#cf-arrowhead)" />
    </g>

    <defs>
      <marker id="cf-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
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
