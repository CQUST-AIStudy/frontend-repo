<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 },
  color: { type: String, default: '#f59e0b' },
  title: { type: String, default: '知识点' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' }
})

function clamp(v, min, max) { return Math.min(Math.max(v, min), max) }
function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

const anim = computed(() => {
  const p = clamp(props.progress, 0, 1)
  return {
    intro: clamp(p / 0.12, 0, 1),
    title: ease(clamp((p - 0.08) / 0.2, 0, 1)),
    tag: ease(clamp((p - 0.2) / 0.2, 0, 1)),
    cards: [
      ease(clamp((p - 0.35) / 0.18, 0, 1)),
      ease(clamp((p - 0.5) / 0.18, 0, 1)),
      ease(clamp((p - 0.65) / 0.18, 0, 1))
    ],
    decor: ease(clamp((p - 0.8) / 0.2, 0, 1))
  }
})

const tags = computed(() => {
  return ['概念', '示例', '练习']
})
</script>

<template>
  <svg viewBox="0 0 1280 720" class="scene-svg" preserveAspectRatio="xMidYMid meet">
    <rect width="1280" height="720" fill="#faf6f0" />

    <!-- 装饰色块 -->
    <circle cx="180" cy="140" r="95" :fill="color" fill-opacity="0.10" />
    <circle cx="1120" cy="620" r="130" :fill="color" fill-opacity="0.08" />
    <circle cx="1050" cy="160" r="45" :fill="color" fill-opacity="0.14" />

    <!-- 标题 -->
    <g :transform="`translate(640, ${140 - (1 - anim.title) * 30})`" :opacity="anim.title">
      <text x="0" y="0" text-anchor="middle" fill="#3d2b1f" font-size="56" font-weight="800" font-family="NotoSerifSC, 'Noto Serif SC', serif">{{ title }}</text>
      <line x1="-90" y1="25" x2="90" y2="25" :stroke="color" stroke-width="5" stroke-linecap="round" />
    </g>

    <!-- 关键词标签 -->
    <g :opacity="anim.tag" :transform="`translate(640, 210)`">
      <g v-for="(tag, i) in tags" :key="i" :transform="`translate(${(i - 1) * 110}, 0)`">
        <rect x="-45" y="-18" width="90" height="36" rx="18" :fill="color" fill-opacity="0.12" :stroke="color" stroke-width="1.5" />
        <text x="0" y="6" text-anchor="middle" fill="#7c4a0f" font-size="16" font-weight="700">{{ tag }}</text>
      </g>
    </g>

    <!-- 要点卡片 -->
    <g :transform="`translate(640, 390)`">
      <g v-for="(tag, i) in tags" :key="i"
        :transform="`translate(${(i - 1) * 360}, ${(1 - anim.cards[i]) * 50})`"
        :opacity="anim.cards[i]"
      >
        <rect x="-150" y="-55" width="300" height="110" rx="20" fill="#fff" stroke="#e8dfd3" stroke-width="2" />
        <circle cx="-110" cy="0" r="10" :fill="color" />
        <text x="15" y="6" text-anchor="middle" fill="#4a3b2a" font-size="20" font-weight="600">{{ title }}</text>
      </g>
    </g>

    <!-- 底部装饰线 -->
    <path d="M340,580 Q640,620 940,580" fill="none" :stroke="color" stroke-width="3" stroke-linecap="round" stroke-dasharray="12 8" :opacity="anim.decor" />
  </svg>
</template>

<style scoped>
.scene-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
