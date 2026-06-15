<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 },
  color: { type: String, default: '#f59e0b' },
  title: { type: String, default: '变量与常量' }
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
  const varShow = seg(p, 0.1, 0.3)
  const constShow = seg(p, 0.3, 0.5)
  const varChange = seg(p, 0.5, 0.7)
  const constLock = seg(p, 0.7, 0.9)
  return { intro, varShow, constShow, varChange, constLock }
})
</script>

<template>
  <svg viewBox="0 0 1280 720" class="scene-svg" preserveAspectRatio="xMidYMid meet">
    <rect width="1280" height="720" fill="#faf6f0" />

    <circle cx="140" cy="130" r="70" :fill="color" fill-opacity="0.10" />
    <circle cx="1150" cy="610" r="100" :fill="color" fill-opacity="0.08" />

    <text x="640" y="95" text-anchor="middle" fill="#3d2b1f" font-size="50" font-weight="800" font-family="Georgia, 'Times New Roman', serif" :opacity="anim.intro">
      {{ title }}
    </text>

    <!-- 变量 -->
    <g :opacity="anim.varShow" :transform="`translate(360, ${330 - (1 - anim.varShow) * 40})`">
      <rect x="-150" y="-80" width="300" height="160" rx="18" fill="#fff" stroke="#e8dfd3" stroke-width="2" />
      <text x="0" y="-40" text-anchor="middle" fill="#8c7b66" font-size="18" font-weight="600">变量</text>
      <text x="0" y="5" text-anchor="middle" fill="#4a3b2a" font-size="24" font-weight="700" font-family="monospace">int age = 20;</text>
      <g :opacity="anim.varChange" :transform="`translate(0, ${50 - (1 - anim.varChange) * 20})`">
        <text x="0" y="0" text-anchor="middle" fill="#2563eb" font-size="20" font-weight="700" font-family="monospace">age = 21;</text>
        <text x="0" y="28" text-anchor="middle" fill="#16a34a" font-size="16" font-weight="700">✓ 可修改</text>
      </g>
    </g>

    <!-- 常量 -->
    <g :opacity="anim.constShow" :transform="`translate(920, ${330 - (1 - anim.constShow) * 40})`">
      <rect x="-150" y="-80" width="300" height="160" rx="18" fill="#fff" stroke="#e8dfd3" stroke-width="2" />
      <text x="0" y="-40" text-anchor="middle" fill="#8c7b66" font-size="18" font-weight="600">常量</text>
      <text x="0" y="5" text-anchor="middle" fill="#4a3b2a" font-size="22" font-weight="700" font-family="monospace">const int MAX = 100;</text>
      <g :opacity="anim.constLock" :transform="`translate(0, ${50 - (1 - anim.constLock) * 20})`">
        <text x="0" y="0" text-anchor="middle" fill="#dc2626" font-size="20" font-weight="700" font-family="monospace">MAX = 200;</text>
        <text x="0" y="28" text-anchor="middle" fill="#dc2626" font-size="16" font-weight="700">✗ 不可修改</text>
      </g>
    </g>

    <!-- 锁图标 -->
    <g :opacity="anim.constLock" :transform="`translate(920, 330)`">
      <g :transform="`scale(${0.8 + 0.2 * anim.constLock})`">
        <circle r="55" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="8 4" />
        <rect x="-10" y="-5" width="20" height="16" rx="2" fill="none" stroke="#dc2626" stroke-width="3" />
        <path d="M-10,-5 L-10,-12 A10,10 0 0 1 10,-12 L10,-5" fill="none" stroke="#dc2626" stroke-width="3" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.scene-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
