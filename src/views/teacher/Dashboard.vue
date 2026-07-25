<template>
  <div class="flex flex-col gap-[18px] max-[640px]:gap-3.5">
    <UiPageHeader
        title="教师工作台"
        :description="`欢迎回来，${displayName}。这里汇总了实验教学、学生提交与班级执行情况。`"
    >
      <div class="flex items-center gap-3 max-[640px]:gap-2">
        <UiButton
            @click="goToClasses"
            class="h-[38px] px-5 rounded-[10px] text-[14px] font-medium text-[#1d1d1f]
             bg-white/80 border border-black/[0.1] backdrop-blur-sm
             shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200
             hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]
             hover:-translate-y-px active:scale-[0.96] cursor-pointer"
        >
          教学班管理
        </UiButton>

        <UiButton
            @click="goToExperiments"
            class="h-[38px] px-5 rounded-[10px] text-[14px] font-medium text-white
             bg-gradient-to-b from-[#d49068] to-[var(--app-primary)]
             shadow-[0_2px_8px_rgba(194,112,62,0.25),0_1px_3px_rgba(194,112,62,0.15)]
             transition-all duration-200 hover:from-[#c2703e] hover:to-[#a85c30]
             hover:shadow-[0_4px_16px_rgba(194,112,62,0.35)]
             hover:-translate-y-px active:scale-[0.96] cursor-pointer border-none"
        >
          进入实验中心
        </UiButton>
      </div>
    </UiPageHeader>

    <!-- Hero Strip -->
    <div class="grid grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] gap-4 max-[1100px]:grid-cols-1">
      <div class="relative overflow-hidden min-h-[148px] p-6 rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] max-[640px]:rounded-2xl max-[640px]:p-[18px]">
        <div class="text-[12px] font-bold uppercase text-[#6e6e73]">当前教学班</div>
        <div class="max-w-[620px] mt-3.5 text-[28px] leading-[1.16] font-extrabold text-[#1d1d1f] max-[640px]:text-2xl">{{ classLabel }} 的实验、知识库和批改工作台</div>
        <div class="flex flex-wrap gap-2.5 mt-[18px]">
          <span class="inline-flex items-center h-[34px] px-3 rounded-full bg-[#f5f5f7] border border-black/[0.06] text-[var(--app-primary-strong)] text-[12px] font-bold">实验 {{ stats.experimentCount }}</span>
          <span class="inline-flex items-center h-[34px] px-3 rounded-full bg-[#f5f5f7] border border-black/[0.06] text-[var(--app-primary-strong)] text-[12px] font-bold">待处理 {{ stats.pendingSubmissions }}</span>
          <span class="inline-flex items-center h-[34px] px-3 rounded-full bg-[#f5f5f7] border border-black/[0.06] text-[var(--app-primary-strong)] text-[12px] font-bold">班级 {{ stats.classCount }}</span>
        </div>
      </div>

      <div class="relative overflow-hidden min-h-[148px] p-6 rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] max-[640px]:rounded-2xl max-[640px]:p-[18px]">
        <div class="text-[12px] font-bold uppercase text-[#6e6e73]">当前班级</div>
        <div class="mt-3.5 text-[34px] leading-[1.05] font-extrabold text-[#1d1d1f] max-[640px]:text-[30px]">{{ classLabel }}</div>
        <div class="mt-3 text-[13px] leading-[1.7] text-[#6e6e73]">切换班级后，分析面板与实验数据会自动联动。</div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 max-[640px]:gap-3">
      <div v-for="card in statCards" :key="card.label" class="flex items-center gap-4 p-5 rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 max-[640px]:rounded-[14px] max-[640px]:p-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" :class="card.iconClass">
          <component :is="card.icon" class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[12px] font-semibold text-[#6e6e73]">{{ card.label }}</span>
          <span class="text-[26px] leading-none font-bold text-[#1d1d1f] tracking-tight">{{ card.value }}</span>
          <span class="text-[12px] text-[#aeaeb2]">{{ card.hint }}</span>
        </div>
      </div>
    </div>

    <!-- Content Grid: Tables -->
    <div class="grid grid-cols-2 gap-4 max-[1100px]:grid-cols-1">
      <!-- Recent Experiments -->
      <div class="min-w-0 p-[22px] rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] max-[640px]:rounded-2xl max-[640px]:p-[18px]">
        <div class="flex items-center justify-between gap-2.5 mb-4 flex-wrap">
          <div>
            <div class="text-[18px] font-bold text-[#1d1d1f]">近期发布实验</div>
            <div class="mt-1.5 text-[13px] text-[#6e6e73] leading-relaxed">优先关注仍在进行中的实验与即将截止的任务。</div>
          </div>
          <a @click="goToExperiments" class="text-[13px] font-semibold text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)] transition-colors">查看全部</a>
        </div>
        <div class="overflow-x-auto rounded-xl">
          <table class="w-full text-left text-[13px]">
            <thead>
              <tr class="border-b border-black/[0.06]">
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">实验名称</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[128px]">截止日期</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[108px]">状态</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[90px]">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in recentExperiments" :key="row.id" class="border-b border-black/[0.04] transition-colors hover:bg-[rgba(194,112,62,0.03)]">
                <td class="py-3 px-3 text-[#1d1d1f]">{{ row.name }}</td>
                <td class="py-3 px-3 text-[#6e6e73]">{{ row.deadline }}</td>
                <td class="py-3 px-3"><span class="inline-flex items-center h-7 px-2.5 rounded-full text-[12px] font-bold" :class="statusClass(row.status)">{{ getExpStatusText(row.status) }}</span></td>
                <td class="py-3 px-3"><a @click="goToExperimentDetail(row.id)" class="text-[13px] font-semibold text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)]">详情</a></td>
              </tr>
              <tr v-if="!recentExperiments.length">
                <td colspan="4" class="py-8 text-center text-[#aeaeb2] text-[13px]">暂无实验数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Submissions -->
      <div class="min-w-0 p-[22px] rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] max-[640px]:rounded-2xl max-[640px]:p-[18px]">
        <div class="flex items-center justify-between gap-2.5 flex-wrap">
          <div>
            <div class="text-[18px] font-bold text-[#1d1d1f]">最新学生提交</div>
            <div class="mt-1.5 text-[13px] text-[#6e6e73] leading-relaxed">用于快速定位刚进入批改队列的学生作业。</div>
          </div>
          <a @click="goToSubmissions" class="text-[13px] font-semibold text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)] transition-colors">查看全部</a>
        </div>
        <div class="overflow-x-auto rounded-xl mt-4">
          <table class="w-full text-left text-[13px]">
            <thead>
              <tr class="border-b border-black/[0.06]">
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[110px]">学生</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[90px]">实验 ID</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">提交时间</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[100px]">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in recentSubmissions" :key="row.id || row.submitTime" class="border-b border-black/[0.04] transition-colors hover:bg-[rgba(194,112,62,0.03)]">
                <td class="py-3 px-3 text-[#1d1d1f] font-medium">{{ row.studentName }}</td>
                <td class="py-3 px-3 text-[#6e6e73]">{{ row.experimentId }}</td>
                <td class="py-3 px-3 text-[#6e6e73]">{{ formatSubmissionTime(row.submitTime) }}</td>
                <td class="py-3 px-3"><span class="inline-flex items-center h-7 px-2.5 rounded-full text-[12px] font-bold" :class="statusClass(row.status)">{{ getSubStatusText(row.status) }}</span></td>
              </tr>
              <tr v-if="!recentSubmissions.length">
                <td colspan="4" class="py-8 text-center text-[#aeaeb2] text-[13px]">暂无提交数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Chart Panel -->
    <div class="p-[22px] pb-3.5 rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
      <div class="flex items-center justify-between gap-2.5 flex-wrap">
        <div>
          <div class="text-[18px] font-bold text-[#1d1d1f]">实验完成率排行</div>
          <div class="mt-1.5 text-[13px] text-[#6e6e73] leading-relaxed">按实验维度估算班级完成情况，帮助你识别推进节奏较慢的内容。</div>
        </div>
        <a @click="goToClasses" class="text-[13px] font-semibold text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)] transition-colors">查看教学班</a>
      </div>
      <div ref="classChartRef" class="h-[340px] w-full min-w-0 max-[640px]:h-[280px]"></div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { computed, markRaw, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Document, DocumentChecked, Timer, UserFilled } from '@/components/ui/icons'
import api from '../../api'
import { getTeachingClasses } from '../../api/tap'
import { formatCompletionTooltip, formatSubmissionTime } from './teacherDashboardFormatters.mjs'

const router = useRouter()
const classChartRef = ref(null)
let classChart = null

const userInfo = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || '{}') || {}
  } catch {
    return {}
  }
})

const displayName = computed(() => userInfo.value.name || userInfo.value.username || '教师')

const selectedClass = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.selectedClass || null
  } catch {
    return null
  }
})

const classLabel = computed(() => selectedClass.value?.name || '尚未固定')

const recentExperiments = ref([])
const allExperiments = ref([])
const recentSubmissions = ref([])
const allSubmissionRows = ref([])
const stats = reactive({
  experimentCount: 0,
  activeExperiments: 0,
  pendingSubmissions: 0,
  classCount: 0
})

const statCards = computed(() => [
  {
    label: '实验总数',
    value: stats.experimentCount,
    hint: '当前已创建实验',
    iconClass: '[background:rgba(194,_112,_62,_0.1)] [color:#c2703e]',
    icon: markRaw(Document)
  },
  {
    label: '进行中实验',
    value: stats.activeExperiments,
    hint: '需要关注课堂节奏',
    iconClass: '[background:rgba(107,_143,_107,_0.1)] [color:#6b8f6b]',
    icon: markRaw(DocumentChecked)
  },
  {
    label: '待处理提交',
    value: stats.pendingSubmissions,
    hint: '建议优先进入批改中心',
    iconClass: '[background:rgba(196,_154,_60,_0.1)] [color:#c49a3c]',
    icon: markRaw(Timer)
  },
  {
    label: '教学班数量',
    value: stats.classCount,
    hint: '可管理班级总数',
    iconClass: '[background:rgba(88,_86,_214,_0.1)] [color:#5856d6]',
    icon: markRaw(UserFilled)
  }
])

function extractList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  if (Array.isArray(response?.rows)) return response.rows
  if (Array.isArray(response?.items)) return response.items
  return []
}

function getTimeValue(value) {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function getExperimentStatus(item = {}) {
  if (item.status) return item.status
  const deadlineTime = getTimeValue(item.deadline)
  if (!deadlineTime) return 'draft'
  return Date.now() > deadlineTime ? 'expired' : 'active'
}

function normalizeExperiment(item = {}) {
  return {
    ...item,
    id: item.id ?? item.experimentId ?? item.experiment_id,
    name: item.name || item.experimentName || item.title || `Experiment ${item.experimentId || ''}`.trim(),
    deadline: item.deadline || item.endTime || item.end_time || '',
    createdTime: item.createdTime || item.createdAt || item.created_at || '',
    submissionCount: Number(item.submissionCount ?? item.submittedCount ?? 0),
    status: getExperimentStatus(item)
  }
}

function sortExperiments(experiments) {
  return [...experiments].sort((a, b) => {
    const createdDiff = getTimeValue(b.createdTime) - getTimeValue(a.createdTime)
    if (createdDiff) return createdDiff
    const deadlineDiff = getTimeValue(b.deadline) - getTimeValue(a.deadline)
    if (deadlineDiff) return deadlineDiff
    return Number(b.id || 0) - Number(a.id || 0)
  })
}

function applyExperimentList(experiments) {
  const normalized = sortExperiments(experiments.map(normalizeExperiment).filter((item) => item.id))
  allExperiments.value = normalized
  recentExperiments.value = normalized.slice(0, 4)
  stats.experimentCount = normalized.length
  stats.activeExperiments = normalized.filter((item) => item.status === 'active').length
}

function normalizeSubmissionStatus(item = {}) {
  if (item.status === 'completed') {
    return Number(item.score) > 0 ? 'graded' : 'submitted'
  }
  if (['submitted', 'graded', 'rejected', 'not_started'].includes(item.status)) {
    return item.status
  }
  return 'not_started'
}

function deriveExperimentsFromSubmissions(rows) {
  const byExperiment = new Map()
  rows.forEach((row) => {
    const id = row.experimentId ?? row.experiment_id
    if (!id) return
    const current = byExperiment.get(id) || {
      id,
      name: row.experimentName || row.name || `Experiment ${id}`,
      deadline: row.deadline || '',
      createdTime: '',
      submissionCount: 0
    }
    if (row.experimentName) current.name = row.experimentName
    if (row.deadline && !current.deadline) current.deadline = row.deadline
    const status = normalizeSubmissionStatus(row)
    if (['submitted', 'graded', 'rejected'].includes(status)) {
      current.submissionCount += 1
    }
    byExperiment.set(id, current)
  })
  return Array.from(byExperiment.values())
}

function syncExperimentsFromSubmissions() {
  if (allExperiments.value.length > 0) return
  const derived = deriveExperimentsFromSubmissions(allSubmissionRows.value)
  if (derived.length > 0) {
    applyExperimentList(derived)
  }
}

async function loadExperiments() {
  try {
    const response = await api.getTeacherExperimentList()
    applyExperimentList(extractList(response))
  } catch (error) {
    logger.error('加载实验列表失败:', error)
    applyExperimentList([])
  }
}

async function loadSubmissions() {
  try {
    const all = await api.getAllStudentExperiments()
    const rows = extractList(all)
    allSubmissionRows.value = rows
    const formatted = rows.map((item) => ({
      id: `${item.studentId}-${item.experimentId}`,
      experimentId: item.experimentId,
      studentName: item.studentName,
      submitTime: item.submitTime,
      status: normalizeSubmissionStatus(item)
    }))
    const sorted = formatted
      .filter((item) => ['submitted', 'graded', 'rejected'].includes(item.status))
      .sort((a, b) => getTimeValue(b.submitTime) - getTimeValue(a.submitTime))

    recentSubmissions.value = sorted.slice(0, 5)
    stats.pendingSubmissions = formatted.filter((item) => item.status === 'submitted').length
  } catch (error) {
    logger.error('加载提交列表失败:', error)
  }
}

async function loadClassCount() {
  try {
    const classes = await getTeachingClasses()
    stats.classCount = (Array.isArray(classes) ? classes : (classes?.data || [])).length
  } catch (error) {
    logger.error('加载教学班数量失败', error)
  }
}

function getExpStatusText(status) {
  return {
    active: '进行中',
    draft: '草稿',
    expired: '已截止'
  }[status] || '未知'
}

function getSubStatusText(status) {
  return {
    submitted: '待批改',
    graded: '已批改',
    rejected: '已驳回',
    not_started: '未开始'
  }[status] || '未知'
}

function statusClass(status) {
  const map = {
    active: 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
    graded: 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
    draft: 'bg-black/5 text-[#6e6e73]',
    not_started: 'bg-black/5 text-[#6e6e73]',
    expired: 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]',
    rejected: 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]',
    submitted: 'bg-[rgba(196,154,60,0.12)] text-[#c49a3c]'
  }
  return map[status] || 'bg-black/5 text-[#6e6e73]'
}

function getCompletionColor(rate) {
  if (rate >= 90) return '#1d8f6a'
  if (rate >= 75) return '#1270d8'
  if (rate >= 60) return '#c57b1d'
  return '#d04c45'
}

function initClassChart() {
  if (!classChartRef.value || !allExperiments.value.length) return

  const studentCount = allExperiments.value.reduce((max, item) => Math.max(max, item.submissionCount || 0), 0) || 49
  const chartData = allExperiments.value
    .map((item) => ({
      name: item.name,
      rate: studentCount > 0 ? Math.round((item.submissionCount || 0) / studentCount * 100) : 0
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10)

  classChart?.dispose()
  classChart = echarts.init(classChartRef.value)
  classChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: formatCompletionTooltip
    },
    grid: { left: '3%', right: '4%', bottom: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chartData.map((item) => item.name.length > 10 ? `${item.name.slice(0, 10)}...` : item.name),
      axisLabel: { interval: 0, rotate: 28, fontSize: 11, color: '#5d7288' },
      axisLine: { lineStyle: { color: 'rgba(129, 155, 181, 0.28)' } }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#5d7288' },
      splitLine: { lineStyle: { color: 'rgba(129, 155, 181, 0.14)', type: 'dashed' } }
    },
    series: [{
      name: '完成率',
      type: 'bar',
      barMaxWidth: 36,
      itemStyle: { borderRadius: [10, 10, 0, 0] },
      data: chartData.map((item) => ({
        value: item.rate,
        fullName: item.name,
        itemStyle: { color: getCompletionColor(item.rate) }
      })),
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        fontSize: 11,
        color: '#5d7288'
      }
    }]
  })
}

function goToExperiments() {
  router.push('/teacher/experiments')
}

function goToExperimentDetail(id) {
  router.push(`/teacher/experiment-detail/${id}`)
}

function goToSubmissions() {
  router.push('/teacher/submissions')
}

function goToClasses() {
  router.push('/teacher/class-list')
}

function handleResize() {
  classChart?.resize()
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await Promise.all([loadExperiments(), loadSubmissions(), loadClassCount()])
  syncExperimentsFromSubmissions()
  setTimeout(initClassChart, 0)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  classChart?.dispose()
})
</script>

