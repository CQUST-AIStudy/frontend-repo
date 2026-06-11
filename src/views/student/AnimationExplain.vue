<template>
  <div class="ae-page [padding:24px] [max-width:1200px] [margin:0_auto]">
    <div class="ae-header [margin-bottom:24px]">
      <h1 class="[font-size:24px] [font-weight:600] [color:#202124] [margin:0_0_6px]">动画讲解</h1>
      <p class="[font-size:14px] [color:#5f6368] [margin:0]">输入知识点，AI 自动生成 HTML 动画分镜并配音讲解</p>
    </div>

    <div class="ae-create [background:#fff] [border:1px_solid_#dadce0] [border-radius:16px] [padding:20px] [margin-bottom:20px]">
      <div class="[display:flex] [flex-wrap:wrap] [gap:12px] [align-items:flex-end]">
        <div class="[flex:1] [min-width:240px]">
          <label class="[display:block] [font-size:13px] [color:#5f6368] [margin-bottom:6px]">讲解主题</label>
          <UiInput v-model="topic" placeholder="例如：什么是边缘检测？Canny 算法的原理" />
        </div>
        <div class="[width:180px]">
          <label class="[display:block] [font-size:13px] [color:#5f6368] [margin-bottom:6px]">视觉风格</label>
          <UiSelect v-model="styleId" style="width: 100%">
            <UiOption v-for="s in styles" :key="s.id" :value="s.id" :label="s.name" />
          </UiSelect>
        </div>
        <UiButton type="primary" :disabled="creating || !topic.trim()" @click="handleCreate">
          <LucideIcon v-if="creating" name="loader" :size="16" class="[animation:spin_1s_linear_infinite] [margin-right:6px]" />
          {{ creating ? '生成中…' : '开始生成' }}
        </UiButton>
      </div>
      <div v-if="activeTask" class="[margin-top:16px]">
        <div class="[display:flex] [justify-content:space-between] [font-size:13px] [color:#5f6368] [margin-bottom:6px]">
          <span>{{ activeTask.currentStep || activeTask.status }}</span>
          <span>{{ activeTask.progress || 0 }}%</span>
        </div>
        <UiProgress :percentage="activeTask.progress || 0" :show-text="false" />
      </div>
    </div>

    <div class="ae-body [display:grid] [grid-template-columns:280px_1fr] [gap:20px]">
      <div class="ae-history [background:#fff] [border:1px_solid_#dadce0] [border-radius:16px] [padding:16px]">
        <h3 class="[font-size:15px] [font-weight:600] [margin:0_0_12px]">历史记录</h3>
        <div v-if="!history.length" class="[font-size:13px] [color:#9aa0a6] [text-align:center] [padding:24px_0]">暂无记录</div>
        <button
          v-for="item in history"
          :key="item.id"
          type="button"
          class="ae-history-item [display:block] [width:100%] [text-align:left] [padding:10px_12px] [border-radius:10px] [border:none] [background:transparent] [cursor:pointer] [margin-bottom:4px] hover:[background:#f1f3f4]"
          :class="{ 'ae-history-item--active': selectedId === item.id }"
          @click="selectTask(item.id)"
        >
          <div class="[font-size:14px] [font-weight:500] [color:#202124] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
            {{ item.title || item.topic }}
          </div>
          <div class="[font-size:12px] [color:#9aa0a6] [margin-top:2px]">{{ statusLabel(item.status) }}</div>
        </button>
      </div>

      <div class="ae-player-wrap [background:#fff] [border:1px_solid_#dadce0] [border-radius:16px] [padding:16px]">
        <template v-if="currentFrame">
          <div class="ae-player [position:relative] [background:#0a0e1a] [border-radius:12px] [overflow:hidden] [aspect-ratio:16/9]">
            <iframe
              v-if="currentFrame.htmlCode"
              :key="`inline-${currentFrame.id}-${currentFrame.updatedAt || currentFrame.status}`"
              :srcdoc="currentFrame.htmlCode"
              class="[width:100%] [height:100%] [border:none]"
              sandbox="allow-scripts"
              title="动画分镜"
            />
            <iframe
              v-else-if="currentFrame.htmlUrl"
              :key="currentFrame.htmlUrl"
              :src="currentFrame.htmlUrl"
              class="[width:100%] [height:100%] [border:none]"
              sandbox="allow-scripts"
              title="动画分镜"
            />
            <div
              v-if="currentSubtitle"
              class="ae-subtitle [position:absolute] [bottom:16px] [left:50%] [transform:translateX(-50%)] [background:rgba(0,0,0,0.72)] [color:#fff] [padding:8px_20px] [border-radius:8px] [font-size:16px] [max-width:90%] [text-align:center] [pointer-events:none]"
            >
              {{ currentSubtitle }}
            </div>
          </div>

          <audio ref="audioRef" :src="currentFrame.audioUrl || undefined" @ended="onAudioEnded" @loadedmetadata="onAudioLoaded" />

          <div class="[display:flex] [align-items:center] [justify-content:space-between] [margin-top:12px]">
            <div class="[font-size:14px] [color:#202124]">
              分镜 {{ currentFrameIndex + 1 }} / {{ frames.length }}：{{ currentFrame.title }}
              <span class="[margin-left:8px] [font-size:12px] [color:#9aa0a6]">{{ statusLabel(currentFrame.status) }}</span>
            </div>
            <div class="[display:flex] [gap:8px]">
              <UiButton size="small" :disabled="currentFrameIndex <= 0" @click="prevFrame">上一镜</UiButton>
              <UiButton type="primary" size="small" @click="togglePlay">
                {{ playing ? '暂停' : '播放' }}
              </UiButton>
              <UiButton size="small" :disabled="currentFrameIndex >= frames.length - 1" @click="nextFrame">下一镜</UiButton>
            </div>
          </div>

          <div class="ae-strip [display:flex] [gap:8px] [margin-top:12px] [overflow-x:auto] [padding-bottom:4px]">
            <button
              v-for="(f, idx) in frames"
              :key="f.id"
              type="button"
              class="ae-thumb [flex-shrink:0] [width:120px] [padding:8px_10px] [border-radius:8px] [border:2px_solid_#dadce0] [background:#f8f9fa] [cursor:pointer] [text-align:left]"
              :class="{ 'ae-thumb--active': idx === currentFrameIndex }"
              @click="jumpFrame(idx)"
            >
              <div class="[font-size:12px] [font-weight:500]">{{ f.index }}. {{ f.title }}</div>
              <div class="[font-size:11px] [color:#9aa0a6] [margin-top:2px]">{{ hasFramePreview(f) ? '已生成' : statusLabel(f.status) }}</div>
            </button>
          </div>

          <details
            v-if="currentFrame.htmlCode"
            class="[margin-top:12px] [border:1px_solid_#e5e7eb] [border-radius:10px] [background:#f8fafc] [overflow:hidden]"
          >
            <summary class="[padding:10px_12px] [cursor:pointer] [font-size:13px] [font-weight:600] [color:#334155]">
              查看当前分镜 HTML 代码
            </summary>
            <pre class="[margin:0] [padding:12px] [max-height:260px] [overflow:auto] [font-size:12px] [line-height:1.6] [color:#0f172a] [background:#fff]">{{ currentFrame.htmlCode }}</pre>
          </details>
        </template>
        <div v-else class="[text-align:center] [padding:80px_20px] [color:#9aa0a6]">
          <p>选择或创建一个讲解任务</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'
import { UiButton, UiInput, UiOption, UiProgress, UiSelect } from '@/components/ui'
import {
  createAnimationExplain,
  getAnimationExplain,
  getAnimationStyles,
  listAnimationExplains,
} from '@/api/tap'
import { message as uiMessage } from '@/services/feedback'

const topic = ref('')
const styleId = ref('cyber-clean')
const styles = ref([])
const history = ref([])
const selectedId = ref(null)
const detail = ref(null)
const creating = ref(false)
const playing = ref(false)
const currentFrameIndex = ref(0)
const currentSubtitle = ref('')
const audioRef = ref(null)
let pollTimer = null
let subtitleTimer = null

const activeTask = computed(() => {
  if (!selectedId.value) return null
  return history.value.find(h => h.id === selectedId.value) || detail.value
})

const frames = computed(() => detail.value?.frames || [])
const currentFrame = computed(() => frames.value[currentFrameIndex.value] || null)

function statusLabel(status) {
  const map = { PENDING: '排队中', PROCESSING: '生成中', COMPLETED: '已完成', FAILED: '失败' }
  return map[status] || status
}

function isRunningStatus(status) {
  return status === 'PENDING' || status === 'PROCESSING'
}

function hasFramePreview(frame) {
  return Boolean(frame?.htmlCode || frame?.htmlUrl)
}

async function loadStyles() {
  try {
    const res = await getAnimationStyles()
    styles.value = res?.data || res || []
  } catch { /* optional */ }
}

async function loadHistory() {
  try {
    const res = await listAnimationExplains()
    history.value = res?.data || res || []
  } catch (e) {
    uiMessage.error(e?.message || '加载历史失败')
  }
}

async function loadDetail(id) {
  try {
    const res = await getAnimationExplain(id)
    detail.value = res?.data || res
    const item = history.value.find(h => h.id === id)
    if (item && detail.value) {
      Object.assign(item, {
        status: detail.value.status,
        progress: detail.value.progress,
        currentStep: detail.value.currentStep,
        title: detail.value.title,
      })
    }
    const playableIndex = frames.value.findIndex(hasFramePreview)
    if (playableIndex >= 0 && !hasFramePreview(currentFrame.value)) {
      currentFrameIndex.value = playableIndex
    } else if (currentFrameIndex.value >= frames.value.length) {
      currentFrameIndex.value = Math.max(0, frames.value.length - 1)
    }
  } catch (e) {
    uiMessage.error(e?.message || '加载详情失败')
  }
}

async function selectTask(id) {
  selectedId.value = id
  stopPlay()
  await loadDetail(id)
  if (isRunningStatus(detail.value?.status)) {
    startPolling()
  } else {
    stopPolling()
  }
}

async function handleCreate() {
  if (!topic.value.trim()) return
  creating.value = true
  try {
    const res = await createAnimationExplain(topic.value.trim(), styleId.value)
    const created = res?.data || res
    await loadHistory()
    if (created?.id) {
      selectedId.value = created.id
      await loadDetail(created.id)
      startPolling()
    }
    uiMessage.success('已开始生成动画讲解')
  } catch (e) {
    uiMessage.error(e?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(async () => {
    if (!selectedId.value) return
    await loadDetail(selectedId.value)
    await loadHistory()
    const status = detail.value?.status
    if (status === 'COMPLETED' || status === 'FAILED') {
      stopPolling()
      await loadHistory()
    }
  }, 2500)
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

function buildSubtitles(frame, duration) {
  const narration = frame?.narration || ''
  if (!narration || duration <= 0) return []
  const clean = narration.replace(/[。！？.!?]+\s*$/g, '').trim()
  const segments = clean.split(/(?<=[，,。！？!?；;：:])/).map(s => s.replace(/[,，。！？!?；;：:]+$/g, '').trim()).filter(Boolean)
  if (!segments.length) return [{ text: clean, start: 0, end: duration }]
  const total = segments.reduce((s, t) => s + t.length, 0)
  let acc = 0
  return segments.map(text => {
    const ratio = text.length / total
    const start = acc * duration
    acc += ratio
    return { text, start, end: Math.min(acc, 1) * duration }
  })
}

function startSubtitleSync() {
  stopSubtitleSync()
  const frame = currentFrame.value
  const audio = audioRef.value
  if (!frame || !audio) return
  const duration = audio.duration && Number.isFinite(audio.duration) ? audio.duration : (frame.estimatedDuration || 6)
  const cues = buildSubtitles(frame, duration)
  subtitleTimer = setInterval(() => {
    const t = audio.currentTime || 0
    const cue = cues.find(c => t >= c.start && t < c.end)
    currentSubtitle.value = cue?.text || ''
  }, 80)
}

function stopSubtitleSync() {
  if (subtitleTimer) { clearInterval(subtitleTimer); subtitleTimer = null }
  currentSubtitle.value = ''
}

function onAudioLoaded() {
  if (playing.value) startSubtitleSync()
}

async function togglePlay() {
  const audio = audioRef.value
  if (!audio || !currentFrame.value?.audioUrl) {
    uiMessage.info('当前分镜暂无配音，可切换分镜查看动画')
    return
  }
  if (playing.value) {
    audio.pause()
    playing.value = false
    stopSubtitleSync()
  } else {
    try {
      await audio.play()
      playing.value = true
      startSubtitleSync()
    } catch {
      uiMessage.error('音频播放失败')
    }
  }
}

function stopPlay() {
  const audio = audioRef.value
  if (audio) { audio.pause(); audio.currentTime = 0 }
  playing.value = false
  stopSubtitleSync()
}

function onAudioEnded() {
  playing.value = false
  stopSubtitleSync()
  if (currentFrameIndex.value < frames.value.length - 1) {
    nextFrame()
    setTimeout(() => togglePlay(), 400)
  }
}

function prevFrame() {
  if (currentFrameIndex.value > 0) {
    stopPlay()
    currentFrameIndex.value--
  }
}

function nextFrame() {
  if (currentFrameIndex.value < frames.value.length - 1) {
    stopPlay()
    currentFrameIndex.value++
  }
}

function jumpFrame(idx) {
  stopPlay()
  currentFrameIndex.value = idx
}

watch(currentFrameIndex, () => stopPlay())

onMounted(async () => {
  await Promise.all([loadStyles(), loadHistory()])
  const running = history.value.find(item => isRunningStatus(item.status))
  const first = running || history.value[0]
  if (first?.id) {
    await selectTask(first.id)
  }
})

onUnmounted(() => {
  stopPolling()
  stopPlay()
})
</script>

<style scoped>
.ae-history-item--active {
  background: #e8f0fe !important;
}
.ae-thumb--active {
  border-color: #1a73e8 !important;
  background: #e8f0fe !important;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@media (max-width: 900px) {
  .ae-body {
    grid-template-columns: 1fr !important;
  }
}
</style>
