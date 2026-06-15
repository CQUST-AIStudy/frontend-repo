<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 },
  color: { type: String, default: '#f59e0b' },
  title: { type: String, default: '数组' }
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
  const traverse = seg(p, 0.1, 0.35)
  const findMax = seg(p, 0.35, 0.55)
  const insert = seg(p, 0.55, 0.78)
  const sort = seg(p, 0.78, 1)

  const values = [10, 25, 8, 33, 17]
  const cellW = 90
  const startX = 330
  const baseY = 360

  const activeIndex = traverse < 0.33 ? 0 : traverse < 0.66 ? 1 : 2
  const maxIndex = 3
  const insertedValues = [10, 25, 20, 8, 33, 17]
  const sortedValues = [8, 10, 17, 20, 25, 33]

  return {
    intro, traverse, findMax, insert, sort,
    values, insertedValues, sortedValues,
    cellW, startX, baseY, activeIndex, maxIndex
  }
})
</script>

<template>
  <svg viewBox="0 0 1280 720" class="scene-svg" preserveAspectRatio="xMidYMid meet">
    <rect width="1280" height="720" fill="#faf6f0" />

    <circle cx="120" cy="150" r="80" :fill="color" fill-opacity="0.10" />
    <circle cx="1180" cy="600" r="110" :fill="color" fill-opacity="0.08" />

    <text x="640" y="95" text-anchor="middle" fill="#3d2b1f" font-size="50" font-weight="800" font-family="Georgia, 'Times New Roman', serif" :opacity="anim.intro">
      {{ title }}
    </text>

    <!-- 初始数组 -->
    <g v-if="anim.sort < 1" :opacity="1 - anim.sort">
      <g v-for="(v, i) in anim.values" :key="`init-${i}`"
        :transform="`translate(${anim.startX + i * anim.cellW}, ${anim.baseY})`"
      >
        <rect x="-38" y="-38" width="76" height="76" rx="14"
          :fill="anim.findMax > 0 && i === anim.maxIndex ? '#fef3c7' : (anim.traverse > 0 && i === anim.activeIndex ? color : '#fff')"
          :fill-opacity="anim.findMax > 0 && i === anim.maxIndex ? 1 : (anim.traverse > 0 && i === anim.activeIndex ? 0.15 : 1)"
          stroke="#d6c8b5"
          stroke-width="2"
          :transform="`scale(${1 + (anim.findMax > 0 && i === anim.maxIndex ? 0.1 * anim.findMax : 0)})`"
        />
        <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="26" font-weight="800">{{ v }}</text>
        <text x="0" y="58" text-anchor="middle" fill="#8c7b66" font-size="14" font-weight="600">{{ i }}</text>
      </g>
    </g>

    <!-- 插入过程 -->
    <g v-if="anim.insert > 0 && anim.sort < 1" :opacity="anim.insert">
      <g v-for="(v, i) in anim.insertedValues" :key="`ins-${i}`">
        <g :transform="
          i < 2 ? `translate(${anim.startX + i * anim.cellW}, ${anim.baseY})` :
          i === 2 ? `translate(${anim.startX + i * anim.cellW}, ${anim.baseY - 55 * (1 - anim.insert)})` :
          `translate(${anim.startX + (i - 1) * anim.cellW + 90 * anim.insert}, ${anim.baseY})`
        ">
          <rect x="-38" y="-38" width="76" height="76" rx="14"
            :fill="i === 2 ? color : '#fff'"
            :fill-opacity="i === 2 ? 0.2 : 1"
            stroke="#d6c8b5"
            stroke-width="2"
          />
          <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="26" font-weight="800">{{ v }}</text>
        </g>
      </g>
    </g>

    <!-- 排序后数组 -->
    <g v-if="anim.sort > 0" :opacity="anim.sort" :transform="`translate(${anim.startX - 45}, 0)`">
      <g v-for="(v, i) in anim.sortedValues" :key="`sort-${i}`"
        :transform="`translate(${i * anim.cellW}, ${anim.baseY})`"
      >
        <rect x="-38" y="-38" width="76" height="76" rx="14"
          :fill="i === 0 || i === anim.sortedValues.length - 1 ? color : '#fff'"
          :fill-opacity="i === 0 || i === anim.sortedValues.length - 1 ? 0.2 : 1"
          stroke="#d6c8b5"
          stroke-width="2"
        />
        <text x="0" y="8" text-anchor="middle" fill="#4a3b2a" font-size="26" font-weight="800">{{ v }}</text>
      </g>
    </g>

    <!-- 遍历指针 -->
    <g v-if="anim.traverse > 0 && anim.findMax === 0" :opacity="anim.traverse" :transform="`translate(${anim.startX + anim.activeIndex * anim.cellW}, ${anim.baseY - 90})`">
      <path d="M0,0 L0,28" stroke="#7c4a0f" stroke-width="3" marker-end="url(#array-arrowhead)" />
      <text x="0" y="-12" text-anchor="middle" fill="#7c4a0f" font-size="16" font-weight="700">i</text>
    </g>

    <!-- 最大值标注 -->
    <g v-if="anim.findMax > 0" :opacity="anim.findMax" :transform="`translate(${anim.startX + anim.maxIndex * anim.cellW}, ${anim.baseY - 110})`">
      <text x="0" y="0" text-anchor="middle" fill="#b45309" font-size="18" font-weight="800">max</text>
    </g>

    <defs>
      <marker id="array-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" fill="#7c4a0f" />
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
