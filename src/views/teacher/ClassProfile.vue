<template>
  <div class="space-y-4">
    <UiPageHeader
      title="教学班级分析"
      description="基于当前教学班的真实 PTA 提交数据，分析能力维度、薄弱方向与学生分层。"
    />

    <div class="flex flex-wrap items-center gap-3 rounded-[14px] border border-black/[0.06] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <span class="text-[12px] font-semibold text-[#6e6e73]">分析班级</span>
      <UiSelect
        v-model="selectedClassId"
        class="h-10 min-w-[220px] rounded-[10px] bg-[#f5f5f7] px-3 text-sm"
        :disabled="loading || !classList.length"
        @change="handleClassChange"
      >
        <UiOption v-for="cls in classList" :key="cls.id" :value="cls.id">
          {{ cls.name }}<template v-if="cls.courseName"> · {{ cls.courseName }}</template>
        </UiOption>
      </UiSelect>
      <span v-if="selectedClass" class="text-[12px] text-[#6e6e73]">
        {{ selectedClass.courseName || '未设置课程' }} · 名册 {{ data.totalStudents || selectedClass.studentCount || 0 }} 人
        <template v-if="data.totalSubmissions"> · 有效提交 {{ data.totalSubmissions }} 次</template>
      </span>
      <UiButton
        class="ml-auto h-[34px] rounded-[9px] border border-black/[0.08] bg-[#f5f5f7] px-4 text-[12px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] disabled:opacity-50"
        :disabled="loading || !selectedClassId"
        @click="fetchData"
      >
        刷新数据
      </UiButton>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-[3px] border-black/10 border-t-[var(--app-primary)] rounded-full animate-spin"></div>
        <span class="text-[13px] text-[#6e6e73]">加载中...</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="errorMsg" class="rounded-[14px] bg-[#fff3cd] border border-[#ffecb5] p-4 flex items-center gap-3">
      <svg class="w-5 h-5 text-[#c49a3c] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
      <div class="min-w-0 flex-1">
        <div class="text-[13px] text-[#86650a]">{{ errorMsg }}</div>
        <div class="mt-1 text-[12px] text-[#9a7b1f]">如果后端画像计算耗时较长，可以稍后重试。</div>
      </div>
      <UiButton
        class="h-[32px] px-4 rounded-[8px] text-[12px] font-medium text-[#86650a] bg-[#fff8e1] hover:bg-[#ffefb8] active:scale-[0.96] transition-all cursor-pointer border border-[#ffecb5]"
        @click="fetchData"
      >
        重试
      </UiButton>
    </div>

    <template v-else-if="hasAnalysisData">
      <!-- Overview stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[14px] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div class="text-[24px] font-bold text-[var(--app-primary)] mb-1">{{ data.totalStudents }}</div>
          <div class="text-[12px] text-[#6e6e73] mt-2">班级人数</div>
        </div>
        <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[14px] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div class="text-[24px] font-bold text-[#5b78a6] mb-1">{{ data.analyzedStudents }}</div>
          <div class="text-[12px] text-[#6e6e73] mt-2">已分析学生</div>
        </div>
        <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[14px] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div class="text-[24px] font-bold text-[#6b8f6b] mb-1">{{ tierCount('A') }}</div>
          <div class="text-[12px] text-[#6e6e73] mt-2">优秀 (≥70)</div>
        </div>
        <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[14px] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div class="text-[24px] font-bold text-[#c49a3c] mb-1">{{ tierCount('B') }}</div>
          <div class="text-[12px] text-[#6e6e73] mt-2">中等 (40-69)</div>
        </div>
        <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[14px] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div class="text-[24px] font-bold text-[#c44b3f] mb-1">{{ tierCount('C') }}</div>
          <div class="text-[12px] text-[#6e6e73] mt-2">需关注 (&lt;40)</div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Bar chart card -->
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <h3 class="text-[15px] font-semibold text-[#1d1d1f] mb-4">班级各维度平均分</h3>
          <div ref="barChartRef" class="h-[350px]"></div>
        </div>
        <!-- Weak ranking table card -->
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <h3 class="text-[15px] font-semibold text-[#1d1d1f] mb-4">薄弱维度排行</h3>
          <div class="overflow-x-auto">
            <table class="w-full border-separate border-spacing-0 text-[13px]">
              <thead>
                <tr class="border-b border-black/[0.06]">
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">维度</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">班级均分</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">低分人数</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">低分占比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in visibleWeakRanking" :key="idx" class="border-b border-black/[0.03] hover:bg-black/[0.02] transition-colors">
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.dimension }}</td>
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.avgScore }}</td>
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.weakCount }}</td>
                  <td class="py-2.5 px-3">
                    <div class="flex items-center gap-2">
                      <div class="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
                        <div class="h-full w-[var(--progress-width)] rounded-full transition-all" :style="progressWidthStyle(row.weakRatio)" :class="row.weakRatio > 30 ? 'bg-[#c44b3f]' : 'bg-[#c49a3c]'"></div>
                      </div>
                      <span class="text-[11px] text-[#6e6e73] whitespace-nowrap">{{ row.weakRatio }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ABC Tier section -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <h3 class="text-[15px] font-semibold text-[#1d1d1f] mb-4">学生分层 (ABC)</h3>
        <!-- Custom tabs -->
        <div class="flex items-center gap-1 p-1 rounded-[12px] bg-black/[0.04] mb-4">
          <UiButton v-for="(tier, key) in data.tiers" :key="key" @click="activeTab = key"
            class="h-[32px] px-4 rounded-[9px] text-[13px] font-medium transition-all cursor-pointer border-none"
            :class="activeTab === key ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'">
            {{ key }} - {{ tier.label }} ({{ tier.count }}人)
          </UiButton>
        </div>
        <!-- Tab panels -->
        <div v-for="(tier, key) in data.tiers" :key="key" v-show="activeTab === key">
          <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table class="w-full border-separate border-spacing-0 text-[13px]">
              <thead class="sticky top-0 bg-white z-10">
                <tr class="border-b border-black/[0.06]">
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">学号</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">姓名</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">综合分</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in tier.students" :key="idx" class="border-b border-black/[0.03] hover:bg-black/[0.02] transition-colors">
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.studentId }}</td>
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.studentName }}</td>
                  <td class="py-2.5 px-3">
                    <div class="flex items-center gap-2">
                      <div class="w-full max-w-[120px] h-2 rounded-full bg-black/[0.06] overflow-hidden">
                        <div class="h-full w-[var(--progress-width)] rounded-full transition-all" :style="progressWidthStyle(Math.round(row.overallScore))" :class="row.overallScore >= 70 ? 'bg-[#6b8f6b]' : row.overallScore >= 40 ? 'bg-[#c49a3c]' : 'bg-[#c44b3f]'"></div>
                      </div>
                      <span class="text-[11px] text-[#6e6e73] whitespace-nowrap">{{ Math.round(row.overallScore) }}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3">
                    <UiButton @click="viewStudent(row.studentId)" class="text-[13px] text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] font-medium cursor-pointer bg-transparent border-none transition-colors">查看画像</UiButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="rounded-[20px] border border-dashed border-black/10 bg-white px-6 py-16 text-center">
      <div class="text-[15px] font-semibold text-[#1d1d1f]">
        {{ classList.length ? '当前教学班暂无可分析的提交数据' : '当前账号下暂无教学班' }}
      </div>
      <div class="mt-2 text-[13px] leading-6 text-[#6e6e73]">
        {{ classList.length
          ? '请先完成 PTA 数据同步；系统只会统计所选教学班及其当前课程的数据。'
          : '请先在“教学班列表”中创建或绑定教学班。' }}
      </div>
    </div>

    <!-- Student profile modal -->
    <AppModal v-model="dialogVisible" :title="'学生画像 - ' + dialogStudentName" width="960px" @close="disposeDialogCharts">
      <div class="max-h-[75vh] overflow-y-auto pr-1">
      <div v-if="dialogLoading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-[3px] border-black/10 border-t-[var(--app-primary)] rounded-full animate-spin"></div>
          <span class="text-[13px] text-[#6e6e73]">加载中...</span>
        </div>
      </div>
      <template v-else>
        <div v-if="dialogProfile.error" class="rounded-[12px] bg-[#fff3cd] border border-[#ffecb5] p-4 text-[13px] text-[#86650a]">
          {{ dialogProfile.error }}
        </div>
        <div v-else-if="hasDialogChartData" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div v-if="hasDialogRadarData" ref="dialogRadarRef" class="h-[240px] rounded-[12px] border border-[var(--app-border-soft)] bg-[var(--app-surface-muted)]"></div>
          <div v-if="hasDialogTrendData" ref="dialogTrendRef" class="h-[240px] rounded-[12px] border border-[var(--app-border-soft)] bg-[var(--app-surface-muted)]"></div>
        </div>
        <div v-if="!dialogProfile.error && dialogProfile.feedback" class="mt-3 text-[14px] leading-[1.8] bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] p-[14px_16px] rounded-[10px] border-l-4 border-l-[#6b8f6b]">{{ dialogProfile.feedback }}</div>
        <div v-if="!dialogProfile.error && dialogProfile.patterns?.length" class="mt-3 flex flex-wrap gap-2">
          <span v-for="p in dialogProfile.patterns" :key="p.tag" class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)]">{{ p.tag }}: {{ p.description }}</span>
        </div>
        <div v-if="!dialogProfile.error && !hasDialogContent" class="rounded-[12px] border border-dashed border-black/10 bg-[#f5f5f7] px-4 py-10 text-center text-sm text-[#6e6e73]">
          该学生暂无可展示的画像数据，请先同步提交与成绩数据。
        </div>
      </template>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import api from '@/api'
import { useUserStore } from '@/store'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'
import { getClassProfile, getStudentProfile } from '../../api/tap'
import AppModal from '../../components/AppModal.vue'

const userStore = useUserStore()
const loading = ref(true)
const errorMsg = ref('')
const data = ref({})
const classList = ref([])
const selectedClassId = ref(null)
const barChartRef = ref(null)
let barChartInst = null
const activeTab = ref('A')
let requestVersion = 0
const OVERVIEW_LIMIT = 6

const emptyClassProfile = () => ({
  classId: null,
  className: '',
  courseName: '',
  totalStudents: 0,
  analyzedStudents: 0,
  totalSubmissions: 0,
  dimensions: [],
  dimensionAvg: {},
  weakRanking: [],
  tiers: {
    A: { label: '优秀', count: 0, students: [] },
    B: { label: '中等', count: 0, students: [] },
    C: { label: '需关注', count: 0, students: [] }
  }
})

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, toFiniteNumber(value)))
}

function normalizeStudent(row = {}) {
  const studentId = row.studentId ?? row.student_id ?? ''
  return {
    studentId: String(studentId),
    studentName: row.studentName ?? row.student_name ?? String(studentId),
    overallScore: toFiniteNumber(row.overallScore ?? row.overall_score)
  }
}

function normalizeTier(rawTier, fallbackLabel) {
  const students = Array.isArray(rawTier?.students) ? rawTier.students.map(normalizeStudent) : []
  return {
    label: rawTier?.label || fallbackLabel,
    count: toFiniteNumber(rawTier?.count, students.length),
    students
  }
}

function normalizeClassProfile(payload) {
  const fallback = emptyClassProfile()
  const dimensions = Array.isArray(payload?.dimensions) ? payload.dimensions.map(String) : fallback.dimensions
  const rawAvg = payload?.dimensionAvg && typeof payload.dimensionAvg === 'object' ? payload.dimensionAvg : {}
  const dimensionAvg = dimensions.reduce((acc, dim) => {
    acc[dim] = toFiniteNumber(rawAvg[dim])
    return acc
  }, {})
  const weakRanking = Array.isArray(payload?.weakRanking)
    ? payload.weakRanking.map(row => ({
      dimension: String(row?.dimension ?? ''),
      avgScore: toFiniteNumber(row?.avgScore),
      weakCount: toFiniteNumber(row?.weakCount),
      weakRatio: clampPercent(row?.weakRatio)
    })).filter(row => row.dimension)
    : []

  return {
    ...fallback,
    classId: payload?.classId ?? payload?.scope?.classId ?? null,
    className: payload?.className ?? payload?.scope?.className ?? '',
    courseName: payload?.courseName ?? payload?.scope?.courseName ?? '',
    totalStudents: toFiniteNumber(payload?.totalStudents),
    analyzedStudents: toFiniteNumber(payload?.analyzedStudents),
    totalSubmissions: toFiniteNumber(payload?.totalSubmissions),
    dimensions,
    dimensionAvg,
    weakRanking,
    tiers: {
      A: normalizeTier(payload?.tiers?.A, fallback.tiers.A.label),
      B: normalizeTier(payload?.tiers?.B, fallback.tiers.B.label),
      C: normalizeTier(payload?.tiers?.C, fallback.tiers.C.label)
    }
  }
}

const selectedClass = computed(() => classList.value.find(
  cls => String(cls.id) === String(selectedClassId.value)
) || null)
const hasAnalysisData = computed(() => (
  data.value.totalSubmissions > 0
  && data.value.analyzedStudents > 0
  && data.value.dimensions.length > 0
))

// Dialog state
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogStudentName = ref('')
const dialogProfile = ref({})
const dialogRadarRef = ref(null)
const dialogTrendRef = ref(null)
const hasDialogRadarData = computed(() => {
  const radar = dialogProfile.value?.radar
  return Array.isArray(radar?.dimensions) && radar.dimensions.length > 0
    && Array.isArray(radar?.scores) && radar.scores.length > 0
})
const hasDialogTrendData = computed(() => {
  const series = dialogProfile.value?.trend?.series
  return Array.isArray(series) && series.length > 0
})
const hasDialogChartData = computed(() => hasDialogRadarData.value || hasDialogTrendData.value)
const hasDialogContent = computed(() => Boolean(
  hasDialogChartData.value || dialogProfile.value?.feedback || dialogProfile.value?.patterns?.length
))
const visibleWeakRanking = computed(() => data.value.weakRanking?.slice(0, OVERVIEW_LIMIT) || [])
let dialogRadarChart = null
let dialogTrendChart = null

function disposeDialogCharts() {
  dialogRadarChart?.dispose()
  dialogTrendChart?.dispose()
  dialogRadarChart = null
  dialogTrendChart = null
}

function tierCount(key) {
  return data.value.tiers?.[key]?.count || 0
}

function getDimensionScoreScale(values) {
  const maxValue = Math.max(...values.map(v => Number(v) || 0), 0)
  return maxValue <= 10 ? 10 : 100
}

function dimensionScoreColor(value, scale) {
  const percent = scale === 10 ? (value / 10) * 100 : value
  return percent >= 70 ? '#67C23A' : percent >= 40 ? '#E6A23C' : '#F56C6C'
}

function progressWidthStyle(value) {
  return { '--progress-width': `${clampPercent(value)}%` }
}

function isTimeoutError(error) {
  const code = String(error?.code || error?.rawError?.code || '').toUpperCase()
  const message = String(error?.friendlyMessage || error?.message || error?.rawMessage || error?.rawError?.message || '')
  return code === 'ECONNABORTED' || /timeout|timed out|超时/i.test(message)
}

function getOverviewDimensions() {
  return data.value.dimensions
    .map(dimension => ({
      dimension,
      score: toFiniteNumber(data.value.dimensionAvg?.[dimension])
    }))
    .sort((left, right) => left.score - right.score || left.dimension.localeCompare(right.dimension, 'zh-CN'))
    .slice(0, OVERVIEW_LIMIT)
}

async function fetchData() {
  const classId = selectedClassId.value
  const currentRequest = ++requestVersion
  loading.value = true
  errorMsg.value = ''
  data.value = emptyClassProfile()
  barChartInst?.dispose()
  barChartInst = null

  if (!classId) {
    loading.value = false
    return
  }

  try {
    const res = await getClassProfile(classId)
    if (currentRequest !== requestVersion) return
    const payload = res?.data || res
    if (!payload) throw new Error('后端未返回班级画像数据')
    if (payload.error) { throw new Error(getFriendlyResponseMessage(payload, '班级画像加载失败，请稍后重试')) }
    const returnedClassId = payload.classId ?? payload.scope?.classId
    if (returnedClassId != null && String(returnedClassId) !== String(classId)) {
      throw new Error('返回数据与当前教学班不一致，已停止展示')
    }
    data.value = normalizeClassProfile(payload)
    activeTab.value = ['A', 'B', 'C'].find(key => data.value.tiers?.[key]?.count > 0) || 'A'
    logger.debug('[ClassProfile] 数据加载成功:', {
      totalStudents: data.value.totalStudents,
      dimensions: data.value.dimensions,
      dimensionAvg: data.value.dimensionAvg
    })
    loading.value = false
    await nextTick()
    if (currentRequest !== requestVersion) return
    renderBar()
  } catch (e) {
    if (currentRequest !== requestVersion) return
    if (isTimeoutError(e)) {
      errorMsg.value = '班级画像计算超时，请稍后重试。'
    } else {
      errorMsg.value = getFriendlyErrorMessage(e, '班级画像加载失败，请稍后重试')
    }
    logger.warn('[ClassProfile] 班级画像加载失败', e)
  } finally {
    if (currentRequest === requestVersion) loading.value = false
  }
}

async function initializePage() {
  loading.value = true
  errorMsg.value = ''
  try {
    const classes = await api.getClassList()
    classList.value = Array.isArray(classes) ? classes : []
    const preferredId = userStore.selectedClass?.id ?? userStore.selectedClass?.classId
    const preferred = classList.value.find(cls => String(cls.id) === String(preferredId))
    selectedClassId.value = preferred?.id ?? classList.value[0]?.id ?? null
    if (selectedClass.value) {
      userStore.setSelectedClass(selectedClass.value)
    }
    await fetchData()
  } catch (e) {
    errorMsg.value = getFriendlyErrorMessage(e, '教学班列表加载失败，请稍后重试')
    loading.value = false
  }
}

function handleClassChange(value) {
  selectedClassId.value = value ?? null
  if (selectedClass.value) {
    userStore.setSelectedClass(selectedClass.value)
  }
  fetchData()
}

function renderBar() {
  barChartInst?.dispose()
  barChartInst = null
  if (!barChartRef.value) {
    logger.warn('[ClassProfile] barChartRef 未就绪')
    return
  }
  const overviewItems = getOverviewDimensions()
  if (!overviewItems.length) {
    logger.warn('[ClassProfile] 无维度数据', { dimensions: data.value.dimensions, avg: data.value.dimensionAvg })
    return
  }

  const dims = overviewItems.map(item => item.dimension)
  const values = overviewItems.map(item => item.score)
  const scoreScale = getDimensionScoreScale(values)
  const chart = echarts.init(barChartRef.value)
  barChartInst = chart

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const point = params?.[0]
        return `${point?.axisValue || ''}<br/>班级均分：${point?.value ?? '-'}分`
      }
    },
    xAxis: {
      type: 'category',
      data: dims,
      axisLabel: { fontSize: 12, interval: 0, formatter: value => String(value).length > 8 ? `${String(value).slice(0, 8)}...` : value }
    },
    yAxis: { type: 'value', min: 0, max: scoreScale, name: `均分/${scoreScale}分` },
    series: [{
      type: 'bar',
      data: values.map(v => ({
        value: v,
        itemStyle: { color: dimensionScoreColor(v, scoreScale), borderRadius: [4, 4, 0, 0] }
      })),
      barWidth: '50%',
      label: { show: true, position: 'top', formatter: '{c}', fontSize: 12, fontWeight: 600 }
    }],
    grid: { left: 50, right: 20, bottom: 30, top: 30 }
  })
}

const handleProfileResize = () => {
  barChartInst?.resize()
  dialogRadarChart?.resize()
  dialogTrendChart?.resize()
}

async function viewStudent(studentId) {
  disposeDialogCharts()
  dialogVisible.value = true
  dialogLoading.value = true
  dialogStudentName.value = studentId
  dialogProfile.value = {}
  try {
    const res = await getStudentProfile(studentId)
    const d = res?.data || res
    if (!d) throw new Error('后端未返回学生画像数据')
    if (d.error) {
      dialogProfile.value = { error: getFriendlyResponseMessage(d, '学生画像加载失败，请稍后重试') }
      return
    }
    dialogProfile.value = d
    dialogStudentName.value = d.studentName || studentId
    dialogLoading.value = false
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 280))
    if (!dialogVisible.value) return
    if (dialogRadarRef.value && hasDialogRadarData.value) {
      dialogRadarChart = echarts.init(dialogRadarRef.value)
      dialogRadarChart.setOption({
        radar: {
          indicator: d.radar.dimensions.map((dim) => ({ name: dim, max: 100 })),
          shape: 'polygon'
        },
        series: [{ type: 'radar', data: [{ value: d.radar.scores, areaStyle: { color: 'rgba(209, 138, 97,0.3)' } }] }]
      })
      dialogRadarChart.resize()
    }
    if (dialogTrendRef.value && hasDialogTrendData.value) {
      dialogTrendChart = echarts.init(dialogTrendRef.value)
      dialogTrendChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: d.trend.series.map(s => s.name), axisLabel: { rotate: 30, fontSize: 9 } },
        yAxis: { type: 'value', min: 0, max: 100 },
        series: [{ type: 'line', data: d.trend.series.map(s => s.mastery), smooth: true, areaStyle: {} }],
        grid: { left: 40, right: 10, bottom: 50, top: 20 }
      })
      dialogTrendChart.resize()
    }
  } catch (e) {
    dialogProfile.value = { error: getFriendlyErrorMessage(e, '学生画像加载失败，请稍后重试') }
  } finally {
    dialogLoading.value = false
  }
}

onMounted(() => {
  initializePage()
  window.addEventListener('resize', handleProfileResize)
})

onBeforeUnmount(() => {
  requestVersion++
  window.removeEventListener('resize', handleProfileResize)
  barChartInst?.dispose()
  disposeDialogCharts()
})
</script>
