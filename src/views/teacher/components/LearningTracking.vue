<template>
  <div class="flex flex-col gap-5">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-[3px] border-[#007aff]/20 border-t-[#007aff] rounded-full animate-spin"></div>
        <span class="text-sm text-[#6e6e73]">加载学情追踪数据...</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-16 gap-3">
      <svg class="w-10 h-10 text-[#ff3b30]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span class="text-sm text-[#6e6e73]">{{ error }}</span>
      <button @click="loadData" class="text-sm text-[#007aff] hover:underline cursor-pointer">重试</button>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <!-- ========== 练习时间线 ========== -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 max-[640px]:p-4">
        <h3 class="text-base font-semibold text-[#1d1d1f] mb-4">📅 练习时间线</h3>

        <!-- 筛选栏 -->
        <div class="flex items-center gap-2 mb-5 flex-wrap">
          <button v-for="f in filters" :key="f.key"
                  @click="setActiveFilter(f.key)"
                  class="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                  :class="activeFilter === f.key
                    ? 'bg-[#007aff] text-white shadow-[0_2px_8px_rgba(0,122,255,0.3)]'
                    : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed]'">
            {{ f.label }}
          </button>
          <span class="ml-auto text-xs text-[#aeaeb2]">{{ filteredTimeline.length }} 条记录</span>
        </div>

        <!-- 时间线 -->
        <div v-if="filteredTimeline.length > 0" class="relative">
          <div ref="timelineViewport"
               :class="timelineViewportClass">
            <!-- 竖线 -->
            <div class="absolute left-[10px] top-2 bottom-2 w-px bg-black/[0.06]"></div>

            <div v-for="(entry, idx) in filteredTimeline" :key="idx"
                 class="relative flex items-start gap-4 pb-5 last:pb-0">
              <!-- 圆点 -->
              <div class="relative z-10 mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                   :class="entry.source === 'pta'
                     ? 'bg-[#007aff] ring-2 ring-[#007aff]/20'
                     : 'bg-[#34c759] ring-2 ring-[#34c759]/20'">
              </div>

              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="text-xs text-[#aeaeb2]">{{ formatTime(entry.timestamp) }}</span>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                        :class="entry.source === 'pta'
                          ? 'bg-[#007aff]/10 text-[#007aff]'
                          : 'bg-[#34c759]/10 text-[#34c759]'">
                    {{ entry.sourceLabel }}
                  </span>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                        :class="getTimelineResultMeta(entry.result).badgeClass">
                    {{ getTimelineResultMeta(entry.result).label }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <a v-if="entry.problemUrl" :href="entry.problemUrl" target="_blank"
                     class="text-sm font-medium text-[#1d1d1f] hover:text-[#007aff] hover:underline transition-colors truncate"
                     :title="entry.title">
                    {{ entry.title }}
                  </a>
                  <span v-else class="text-sm font-medium text-[#1d1d1f] truncate" :title="entry.title">
                    {{ entry.title }}
                  </span>

                  <span v-if="entry.score != null" class="text-xs font-medium ml-auto flex-shrink-0"
                        :class="getTimelineScoreClass(entry.source, entry.result)">
                    {{ entry.source === 'leetcode' ? 'AI评分: ' : '得分: ' }}{{ entry.score }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="showTimelineToggle && !timelineExpanded"
               class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/90 to-white/0"></div>
        </div>

        <button v-if="showTimelineToggle"
                @click="toggleTimelineViewport"
                :aria-expanded="timelineExpanded ? 'true' : 'false'"
                class="mt-4 w-full rounded-xl border border-[#007aff]/15 bg-[#007aff]/5 px-3 py-2 text-sm font-medium text-[#007aff] transition-colors hover:bg-[#007aff]/10 cursor-pointer">
          {{ timelineToggleLabel }}
        </button>

        <div v-if="filteredTimeline.length === 0" class="flex flex-col items-center justify-center py-10 text-[#aeaeb2]">
          <svg class="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span class="text-sm">暂无练习记录</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../../api'
import {
  createTimelineViewportState,
  getTimelineResultMeta,
  getTimelineScoreClass,
  getTimelineToggleLabel,
  shouldCollapseTimeline
} from './learningTrackingPresentation.mjs'

const props = defineProps({
  studentId: { type: String, required: true },
  experimentId: { type: Number, required: true }
})

const loading = ref(true)
const error = ref(null)
const summary = ref({ ptaTotalSets: 0, ptaCompletedSets: 0, ptaPracticeSets: [], leetcode: null })
const timeline = ref([])
const activeFilter = ref('all')
const {
  expanded: timelineExpanded,
  container: timelineViewport,
  toggle: toggleTimelineViewport,
  reset: resetTimelineViewport
} = createTimelineViewportState()

const filters = [
  { key: 'all', label: '全部' },
  { key: 'pta', label: 'PTA' },
  { key: 'leetcode', label: '强化薄弱题集' }
]

const filteredTimeline = computed(() => {
  if (activeFilter.value === 'all') return timeline.value
  return timeline.value.filter(e => e.source === activeFilter.value)
})

const showTimelineToggle = computed(() => shouldCollapseTimeline(filteredTimeline.value.length))
const timelineViewportClass = computed(() => [
  'relative transition-[max-height] duration-200',
  showTimelineToggle.value && !timelineExpanded.value
    ? 'max-h-[500px] overflow-y-auto overscroll-contain pr-2'
    : 'overflow-visible'
])
const timelineToggleLabel = computed(() => getTimelineToggleLabel(timelineExpanded.value, filteredTimeline.value.length))

const submissionId = computed(() => `${props.studentId}-${props.experimentId}`)

function formatTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function setActiveFilter(filter) {
  activeFilter.value = filter
  resetTimelineViewport()
}

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const data = await api.getLearningTracking(submissionId.value)
    if (data && data.summary) {
      summary.value = data.summary
    }
    if (data && data.timeline) {
      timeline.value = data.timeline
    }
  } catch (e) {
    error.value = e?.message || e?.response?.data?.message || '加载学情追踪数据失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
