<template>
  <div class="dashboard-page [display:flex] [flex-direction:column] [gap:18px] max-[640px]:[gap:14px]">
    <page-header title="教师工作台" :description="`欢迎回来，${displayName}。这里汇总了实验教学、学生提交与班级执行情况。`">
      <el-button @click="goToClasses">教学班管理</el-button>
      <el-button type="primary" @click="goToExperiments">进入实验中心</el-button>
    </page-header>

    <div class="hero-strip [display:grid] [grid-template-columns:minmax(0,_1.4fr)_minmax(280px,_0.6fr)] [gap:16px] max-[1100px]:[grid-template-columns:1fr]">
      <div class="hero-card hero-card--wide [position:relative] [overflow:hidden] [min-height:148px] [padding:24px_26px] [border-radius:24px] [border:1px_solid_rgba(126,_157,_183,_0.2)] [background:linear-gradient(135deg,_#10355a_0%,_#0b5e95_62%,_#0f766e_100%)] [box-shadow:0_18px_38px_rgba(25,_53,_83,_0.16)] [color:#f7fbff] max-[640px]:[border-radius:18px] max-[640px]:[padding:18px]">
        <div class="hero-kicker [font-size:12px] [font-weight:700] [letter-spacing:0] [text-transform:uppercase] [color:#dcecff]">当前教学班</div>
        <div class="hero-title [max-width:620px] [margin-top:14px] [color:#ffffff] [font-size:28px] [line-height:1.16] [letter-spacing:0] [font-weight:800] [text-shadow:0_1px_2px_rgba(0,_0,_0,_0.22)] max-[640px]:[font-size:24px]">{{ classLabel }} 的实验、知识库和批改工作台</div>
        <div class="hero-meta [display:flex] [flex-wrap:wrap] [gap:10px] [margin-top:18px] [&_span]:[min-height:34px] [&_span]:[padding:0_12px] [&_span]:[border-radius:999px] [&_span]:[display:inline-flex] [&_span]:[align-items:center] [&_span]:[background:rgba(255,_255,_255,_0.18)] [&_span]:[border:1px_solid_rgba(255,_255,_255,_0.26)] [&_span]:[color:#f7fbff] [&_span]:[font-size:12px] [&_span]:[font-weight:700]">
          <span>实验 {{ stats.experimentCount }}</span>
          <span>待处理{{ stats.pendingSubmissions }}</span>
          <span>班级 {{ stats.classCount }}</span>
        </div>
      </div>

      <div class="hero-card hero-card--compact [position:relative] [overflow:hidden] [min-height:148px] [padding:24px_26px] [border-radius:24px] [border:1px_solid_rgba(126,_157,_183,_0.18)] [background:linear-gradient(135deg,_rgba(255,_255,_255,_0.9),_rgba(241,_248,_252,_0.86)),_radial-gradient(circle_at_top_right,_rgba(18,_112,_216,_0.12),_transparent_36%)] [box-shadow:0_18px_38px_rgba(25,_53,_83,_0.08)] max-[640px]:[border-radius:18px] max-[640px]:[padding:18px]">
        <div class="hero-kicker [font-size:12px] [font-weight:700] [letter-spacing:0] [text-transform:uppercase] [color:#39536c]">当前班级</div>
        <div class="hero-number [margin-top:14px] [color:#16324a] [font-size:34px] [line-height:1.05] [letter-spacing:0] [font-weight:800] max-[640px]:[font-size:30px]">{{ classLabel }}</div>
        <div class="hero-desc [margin-top:12px] [color:#5d7288] [font-size:13px] [line-height:1.7]">切换班级后，分析面板与实验数据会自动联动。</div>
      </div>
    </div>

    <div class="stats-grid [display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:16px] max-[1100px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[640px]:[grid-template-columns:1fr] max-[640px]:[gap:12px] [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:12px]">
      <div v-for="card in statCards" :key="card.label" class="stat-card [display:flex] [align-items:center] [gap:16px] [padding:20px] [border-radius:20px] [border:1px_solid_rgba(126,_157,_183,_0.22)] [background:#ffffff] [box-shadow:0_14px_28px_rgba(24,_50,_78,_0.08)] max-[640px]:[border-radius:18px] max-[640px]:[padding:18px] [text-align:center] [padding:20px_0] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]">
        <div class="stat-icon [width:48px] [height:48px] [border-radius:16px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]" :class="card.iconClass">
          <el-icon :size="20"><component :is="card.icon" /></el-icon>
        </div>
        <div class="stat-main [display:flex] [flex-direction:column] [gap:4px]">
          <span class="stat-label [color:#5d7288] [font-size:12px] [font-weight:600] [color:#5f6368] [margin-top:10px] [color:#606266] [font-size:13px] [margin-top:4px]">{{ card.label }}</span>
          <span class="stat-value [color:#16324a] [font-size:28px] [line-height:1] [font-weight:800] [letter-spacing:0] [font-size:24px] [font-weight:bold] [color:#409EFF] [font-weight:700] [color:#202124] [margin-bottom:5px]">{{ card.value }}</span>
          <span class="stat-hint [color:#92a2b2] [font-size:12px]">{{ card.hint }}</span>
        </div>
      </div>
    </div>

    <div class="content-grid [display:grid] [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:16px] max-[1100px]:[grid-template-columns:1fr]">
      <div class="panel-card [min-width:0] [padding:22px] [border-radius:24px] [border:1px_solid_rgba(126,_157,_183,_0.22)] [background:#ffffff] [box-shadow:0_16px_34px_rgba(24,_50,_78,_0.09)] [&_.el-table]:[--el-table-border-color:rgba(126,_157,_183,_0.18)] [&_.el-table]:[--el-table-header-bg-color:#f1f7fb] [&_.el-table]:[background:#ffffff] [&_.el-table_th]:[background:#f1f7fb] [&_.el-table_th]:[font-weight:700] [&_.el-table_th]:[color:#304a62] [&_.el-table_td]:[background:#ffffff] [&_.el-table_td]:[color:#22384d] max-[640px]:[border-radius:18px] max-[640px]:[padding:18px]">
        <div class="panel-head [display:flex] [align-items:flex-start] [justify-content:space-between] [gap:16px] [margin-bottom:16px] max-[640px]:[align-items:flex-start] max-[640px]:[flex-direction:column] max-[640px]:[gap:8px] [align-items:center] [gap:10px] [flex-wrap:wrap]">
          <div>
            <div class="panel-title [color:#16324a] [font-size:18px] [font-weight:700]">近期发布实验</div>
            <div class="panel-desc [margin-top:6px] [color:#6e8297] [font-size:13px] [line-height:1.6]">优先关注仍在进行中的实验与即将截止的任务。</div>
          </div>
          <a class="panel-link [color:#1270d8] [font-size:13px] [font-weight:700] [cursor:pointer]" @click="goToExperiments">查看全部</a>
        </div>
        <el-table :data="recentExperiments" size="small" class="teacher-dashboard-table [width:100%]">
          <el-table-column prop="name" label="实验名称" min-width="180" />
          <el-table-column prop="deadline" label="截止日期" width="128" />
          <el-table-column label="状态" width="108">
            <template #default="{ row }">
              <span class="status-chip [display:inline-flex] [align-items:center] [min-height:28px] [padding:0_10px] [border-radius:999px] [font-size:12px] [font-weight:700]" :class="`status-${row.status}`">{{ getExpStatusText(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90">
            <template #default="{ row }">
              <a class="panel-link" @click="goToExperimentDetail(row.id)">详情</a>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="panel-card [min-width:0] [padding:22px] [border-radius:24px] [border:1px_solid_rgba(126,_157,_183,_0.22)] [background:#ffffff] [box-shadow:0_16px_34px_rgba(24,_50,_78,_0.09)] [&_.el-table]:[--el-table-border-color:rgba(126,_157,_183,_0.18)] [&_.el-table]:[--el-table-header-bg-color:#f1f7fb] [&_.el-table]:[background:#ffffff] [&_.el-table_th]:[background:#f1f7fb] [&_.el-table_th]:[font-weight:700] [&_.el-table_th]:[color:#304a62] [&_.el-table_td]:[background:#ffffff] [&_.el-table_td]:[color:#22384d] max-[640px]:[border-radius:18px] max-[640px]:[padding:18px]">
        <div class="panel-head [display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [flex-wrap:wrap]">
          <div>
            <div class="panel-title">最新学生提交</div>
            <div class="panel-desc">用于快速定位刚进入批改队列的学生作业。</div>
          </div>
          <a class="panel-link" @click="goToSubmissions">查看全部</a>
        </div>
        <el-table :data="recentSubmissions" size="small" class="teacher-dashboard-table [width:100%]">
          <el-table-column prop="studentName" label="学生" width="110" />
          <el-table-column prop="experimentId" label="实验 ID" width="90" />
          <el-table-column prop="submitTime" label="提交时间" min-width="150" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <span class="status-chip" :class="`status-${row.status}`">{{ getSubStatusText(row.status) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="panel-card panel-card--chart [padding-bottom:14px]">
      <div class="panel-head [display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [flex-wrap:wrap]">
        <div>
          <div class="panel-title">实验完成率排行</div>
          <div class="panel-desc">按实验维度估算班级完成情况，帮助你识别推进节奏较慢的内容。</div>
        </div>
        <a class="panel-link" @click="goToClasses">查看教学班</a>
      </div>
      <div ref="classChartRef" class="chart-box [height:340px] [width:100%] [min-width:0]"></div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { computed, markRaw, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Document, DocumentChecked, Timer, UserFilled } from '@element-plus/icons-vue'
import api from '../../api'
import PageHeader from '../../components/PageHeader.vue'
import { getTeachingClasses } from '../../api/tap'

const router = useRouter()
const classChartRef = ref(null)
let classChart = null

const userInfo = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || '{}') || { name: '教师用户' }
  } catch {
    return { name: '教师用户' }
  }
})

const displayName = computed(() => userInfo.value.name || '教师')

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
    iconClass: '[background:#ddecff] [color:#1270d8]',
    icon: markRaw(Document)
  },
  {
    label: '进行中实验',
    value: stats.activeExperiments,
    hint: '需要关注课堂节奏',
    iconClass: '[background:#dff5ec] [color:#1d8f6a]',
    icon: markRaw(DocumentChecked)
  },
  {
    label: '待处理提交',
    value: stats.pendingSubmissions,
    hint: '建议优先进入批改中心',
    iconClass: '[background:#fff1dc] [color:#c57b1d]',
    icon: markRaw(Timer)
  },
  {
    label: '教学班数量',
    value: stats.classCount,
    hint: '可管理班级总数',
    iconClass: '[background:#e7ecff] [color:#5369d8]',
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

function syncExperimentFallback() {
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
      formatter: (params) => `${params[0].name}<br/>完成率：${params[0].value}%`
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
  syncExperimentFallback()
  setTimeout(initClassChart, 0)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  classChart?.dispose()
})
</script>

