<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import LucideIcon from './LucideIcon.vue'
import LinkedListScene from './knowledge-scenes/LinkedListScene.vue'
import ArrayScene from './knowledge-scenes/ArrayScene.vue'
import PointerScene from './knowledge-scenes/PointerScene.vue'
import ParameterScene from './knowledge-scenes/ParameterScene.vue'
import FunctionScene from './knowledge-scenes/FunctionScene.vue'
import ControlFlowScene from './knowledge-scenes/ControlFlowScene.vue'
import VariablesScene from './knowledge-scenes/VariablesScene.vue'
import ConceptScene from './knowledge-scenes/ConceptScene.vue'
import { resolveSceneType, getSceneDuration } from './knowledge-scenes/sceneResolver'
import { KNOWLEDGE_STATUS } from '@/views/student/knowledgeLearningData'

const props = defineProps({
  node: { type: Object, default: null }
})

const DEFAULT_STATUS = KNOWLEDGE_STATUS.unlearned

const isPlaying = ref(false)
const currentTime = ref(0)
const rafId = ref(null)
const lastTs = ref(0)
const playerRef = ref(null)

const sceneType = computed(() => resolveSceneType(props.node?.id, props.node?.name))
const duration = computed(() => getSceneDuration(sceneType.value))
const progress = computed(() => (duration.value > 0 ? currentTime.value / duration.value : 0))

const status = computed(() => {
  if (!props.node?.status) return DEFAULT_STATUS
  return KNOWLEDGE_STATUS[props.node.status] || DEFAULT_STATUS
})

const color = computed(() => status.value.color || DEFAULT_STATUS.color)
const title = computed(() => props.node?.label || props.node?.name || '知识点')
const subtitle = computed(() => props.node?.parentName || '课程核心')

function formatTime(s) {
  const total = Math.max(0, s)
  const m = Math.floor(total / 60)
  const sec = Math.floor(total % 60)
  const ms = Math.floor((total % 1) * 10)
  return `${m}:${sec.toString().padStart(2, '0')}.${ms}`
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function stop() {
  isPlaying.value = false
  currentTime.value = 0
}

function seekToRatio(ratio) {
  currentTime.value = Math.max(0, Math.min(duration.value, ratio * duration.value))
}

function handleProgressClick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const ratio = Math.max(0, Math.min(1, x / rect.width))
  seekToRatio(ratio)
}

function tick(ts) {
  if (!lastTs.value) lastTs.value = ts
  const delta = (ts - lastTs.value) / 1000
  lastTs.value = ts

  if (isPlaying.value) {
    currentTime.value += delta
    if (currentTime.value >= duration.value) {
      currentTime.value = duration.value
      isPlaying.value = false
    }
  }

  rafId.value = requestAnimationFrame(tick)
}

function enterFullscreen() {
  const el = playerRef.value
  if (!el) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    el.requestFullscreen?.().catch(() => {})
  }
}

watch(() => props.node, () => {
  currentTime.value = 0
  isPlaying.value = true
})

onMounted(() => {
  isPlaying.value = true
  rafId.value = requestAnimationFrame(tick)
})

onUnmounted(() => {
  if (rafId.value) cancelAnimationFrame(rafId.value)
})
</script>

<template>
  <div ref="playerRef" class="knowledge-node-player">
    <div class="player-stage">
      <LinkedListScene v-if="sceneType === 'linked-list'" :progress="progress" :color="color" :title="title" />
      <ArrayScene v-else-if="sceneType === 'array'" :progress="progress" :color="color" :title="title" />
      <PointerScene v-else-if="sceneType === 'pointer'" :progress="progress" :color="color" :title="title" />
      <ParameterScene v-else-if="sceneType === 'parameter'" :progress="progress" :color="color" :title="title" />
      <FunctionScene v-else-if="sceneType === 'function'" :progress="progress" :color="color" :title="title" />
      <ControlFlowScene v-else-if="sceneType === 'control-flow'" :progress="progress" :color="color" :title="title" />
      <VariablesScene v-else-if="sceneType === 'variables'" :progress="progress" :color="color" :title="title" />
      <ConceptScene v-else :progress="progress" :color="color" :title="title" :subtitle="subtitle" :description="node?.description" />
    </div>

    <div class="player-bar">
      <button type="button" class="player-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
        <LucideIcon v-if="isPlaying" name="pause" :size="18" />
        <LucideIcon v-else name="play" :size="18" />
      </button>
      <button type="button" class="player-btn" title="停止" @click="stop">
        <LucideIcon name="square" :size="16" />
      </button>

      <div class="progress-track" @click="handleProgressClick">
        <div class="progress-fill" :style="{ width: `${progress * 100}%` }"></div>
      </div>

      <div class="time-display">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>

      <button type="button" class="player-btn" title="全屏" @click="enterFullscreen">
        <LucideIcon name="maximize" :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.knowledge-node-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  background: #faf6f0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8dfd3;
}

.player-stage {
  flex: 1;
  min-height: 0;
  position: relative;
}

.player-bar {
  flex-shrink: 0;
  height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  background: #fff;
  border-top: 1px solid #e8dfd3;
}

.player-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e8dfd3;
  background: #fff;
  color: #7c4a0f;
  cursor: pointer;
  transition: all 0.15s;
}

.player-btn:hover {
  background: #faf6f0;
  border-color: #f59e0b;
}

.progress-track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e8dfd3;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: #f59e0b;
  transition: width 0.05s linear;
}

.time-display {
  color: #7c4a0f;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .player-bar {
    gap: 8px;
    padding: 0 8px;
  }
  .time-display {
    font-size: 11px;
  }
}
</style>
