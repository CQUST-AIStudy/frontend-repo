<template>
  <div class="screen-page">
    <div class="screen-shell">
      <header class="screen-header">
        <div>
          <div class="screen-kicker">学院实验教学运行态势</div>
          <h1>实验教学综合大屏</h1>
        </div>
        <div class="screen-actions">
          <div class="screen-time">
            <span>{{ currentDate }}</span>
            <strong>{{ currentTime }}</strong>
          </div>
          <button class="screen-button screen-button-ghost" @click="backToAdmin">
            返回后台
          </button>
          <button class="screen-button" :disabled="loading" @click="loadScreenData">
            <Refresh class="screen-button-icon" />
            <span>{{ loading ? '刷新中' : '刷新' }}</span>
          </button>
        </div>
      </header>

      <section class="metric-grid" :aria-busy="loading">
        <div v-for="metric in metrics" :key="metric.label" class="metric-tile" :class="metric.tone">
          <span class="metric-label">{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.meta }}</small>
        </div>
      </section>

      <main class="screen-grid">
        <section class="panel panel-map">
          <div class="panel-title">
            <span>学院实验热力</span>
            <small>按班级完成率聚合</small>
          </div>
          <div class="heat-grid">
            <div
              v-for="item in classHeat"
              :key="item.name"
              class="heat-cell"
              :style="{ '--level': item.level }"
            >
              <div>
                <strong>{{ item.name }}</strong>
                <span>{{ item.teacherName || '未绑定教师' }}</span>
              </div>
              <b>{{ item.completionRate }}%</b>
            </div>
            <div v-if="!classHeat.length" class="empty-state heat-empty">暂无班级实验数据</div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <span>实验完成率趋势</span>
            <small>近期实验提交覆盖情况</small>
          </div>
          <div ref="completionChartRef" class="chart"></div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <span>成绩分布</span>
            <small>已评分提交</small>
          </div>
          <div ref="scoreChartRef" class="chart"></div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <span>实验运行阶段</span>
            <small>未开始、进行中、已结束</small>
          </div>
          <div ref="stageChartRef" class="chart"></div>
        </section>

        <section class="panel panel-wide">
          <div class="panel-title">
            <span>班级实验对比</span>
            <small>完成率与平均成绩双指标</small>
          </div>
          <div ref="classCompareChartRef" class="chart chart-wide"></div>
        </section>

        <section class="panel">
          <div class="panel-title">
            <span>重点预警</span>
            <small>低完成率、低均分、同步异常</small>
          </div>
          <div class="warning-list">
            <div v-for="item in warningItems" :key="item.id" class="warning-row" :class="item.type">
              <div>
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </div>
              <b>{{ item.value }}</b>
            </div>
            <div v-if="!warningItems.length" class="empty-state">暂无需要管理员处理的实验预警</div>
          </div>
        </section>
      </main>

      <footer class="screen-footer">
        <span>数据来源：实验管理、班级管理、PTA 同步与 AI 批改模块</span>
        <span v-if="lastUpdated">最近更新 {{ lastUpdated }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import api from '../../api'
import { Refresh } from '@/components/ui/icons'
import { message as uiMessage } from '@/services/feedback'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

const router = useRouter()
const loading = ref(false)
const classes = ref([])
const experiments = ref([])
const submissions = ref([])
const dashboard = ref({})
const experimentListMeta = ref({})
const now = ref(new Date())
const lastUpdated = ref('')

const completionChartRef = ref(null)
const scoreChartRef = ref(null)
const stageChartRef = ref(null)
const classCompareChartRef = ref(null)
let completionChart = null
let scoreChart = null
let stageChart = null
let classCompareChart = null
let clockTimer = null

const currentDate = computed(() => now.value.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' }))
const currentTime = computed(() => now.value.toLocaleTimeString('zh-CN', { hour12: false }))

const classCount = computed(() => classes.value.length || dashboard.value?.stats?.classCount || 0)
const experimentCount = computed(() => experiments.value.length || dashboard.value?.stats?.experimentCount || 0)
const totalStudents = computed(() => {
  const fromClass = classes.value.reduce((sum, item) => sum + Number(item.studentCount || item.student_count || 0), 0)
  const ids = new Set(submissions.value.map(item => item.studentId || item.student_id || item.userId).filter(Boolean))
  return fromClass || ids.size || Number(experimentListMeta.value?.studentCount || 0) || dashboard.value?.stats?.studentCount || 0
})

const completedSubmissions = computed(() => submissions.value.filter(isCompleted))
const scoredSubmissions = computed(() => submissions.value.filter(item => Number(item.score) > 0))
const aggregatedScores = computed(() => experiments.value
  .map(item => Number(item.averageScore ?? item.avgScore ?? item.avg_score))
  .filter(item => Number.isFinite(item) && item > 0)
)
const avgScore = computed(() => average([
  ...scoredSubmissions.value.map(item => Number(item.score)),
  ...aggregatedScores.value
]))
const activeExperimentCount = computed(() => experiments.value.filter(item => getExperimentStage(item) === 'running').length)
const totalSubmissionCount = computed(() => {
  if (completedSubmissions.value.length) return completedSubmissions.value.length
  return experiments.value.reduce((sum, item) => sum + Number(item.submissionCount ?? item.submittedCount ?? item.submitCount ?? item.submission_count ?? 0), 0)
})
const completionRate = computed(() => {
  const denominator = Math.max(1, totalStudents.value * Math.max(1, experimentCount.value))
  return Math.min(100, Math.round((totalSubmissionCount.value / denominator) * 100))
})
const gradingRate = computed(() => {
  const denominator = Math.max(1, totalSubmissionCount.value)
  const scoredCount = scoredSubmissions.value.length || aggregatedScores.value.length
  return Math.min(100, Math.round((scoredCount / denominator) * 100))
})

const metrics = computed(() => [
  { label: '实验总数', value: formatNumber(experimentCount.value), meta: `${activeExperimentCount.value} 个进行中`, tone: 'metric-blue' },
  { label: '覆盖班级', value: formatNumber(classCount.value), meta: `${formatNumber(totalStudents.value)} 名学生`, tone: 'metric-green' },
  { label: '整体完成率', value: `${completionRate.value}%`, meta: `已提交 ${formatNumber(totalSubmissionCount.value)} 次`, tone: 'metric-amber' },
  { label: '平均成绩', value: avgScore.value ? avgScore.value.toFixed(1) : '0.0', meta: `评分覆盖 ${gradingRate.value}%`, tone: 'metric-red' }
])

const experimentStats = computed(() => {
  const studentBase = Math.max(1, totalStudents.value)
  return experiments.value.map((item, index) => {
    const id = item.id || item.experimentId || index
    const related = submissions.value.filter(sub => String(sub.experimentId || sub.experiment_id || '') === String(id))
    const completed = related.filter(isCompleted)
    const scored = related.filter(sub => Number(sub.score) > 0)
    const submissionCount = Number(item.submissionCount || item.submission_count || completed.length)
    const explicitRate = firstNumber(item.completionRate, item.completion_rate, item.submitRate, item.submissionRate)
    const explicitScore = firstNumber(item.averageScore, item.avgScore, item.avg_score)
    return {
      id,
      name: item.name || item.title || `实验 ${index + 1}`,
      completionRate: explicitRate !== null ? Math.min(100, Math.round(explicitRate)) : Math.min(100, Math.round((submissionCount / studentBase) * 100)),
      avgScore: explicitScore !== null ? explicitScore : average(scored.map(sub => Number(sub.score))),
      stage: getExperimentStage(item)
    }
  })
})

const classProfiles = computed(() => {
  const totalExp = Math.max(1, experimentCount.value)
  return classes.value.map((cls, index) => {
    const className = cls.name || cls.className || cls.classname || `班级 ${index + 1}`
    const related = submissions.value.filter(item => {
      const itemClassId = item.classId || item.class_id
      const itemClassName = item.className || item.classname
      return String(itemClassId || '') === String(cls.id || '') || itemClassName === className
    })
    const studentCount = Number(cls.studentCount || cls.student_count || 0) || new Set(related.map(item => item.studentId || item.userId).filter(Boolean)).size
    const completed = related.filter(isCompleted)
    const scored = related.filter(item => Number(item.score) > 0)
    const denominator = Math.max(1, (studentCount || totalStudents.value || 1) * totalExp)
    const completion = Math.min(100, Math.round((completed.length / denominator) * 100))
    return {
      id: cls.id || className,
      name: className,
      teacherName: cls.teacherName || cls.teacher || cls.ownerName,
      completionRate: completion,
      avgScore: Math.round(average(scored.map(item => Number(item.score))) * 10) / 10
    }
  })
})

const classHeat = computed(() => {
  return classProfiles.value.slice(0, 18).map(item => ({
    ...item,
    level: Math.max(0.12, Math.min(1, item.completionRate / 100))
  }))
})

const warningItems = computed(() => {
  const experimentWarnings = experimentStats.value
    .filter(item => item.completionRate < 55 || (item.avgScore > 0 && item.avgScore < 65))
    .slice(0, 4)
    .map(item => ({
      id: `exp-${item.id}`,
      type: item.completionRate < 40 ? 'danger' : 'warn',
      title: item.name,
      desc: item.completionRate < 55 ? '实验完成率偏低，建议通知任课教师跟进' : '平均成绩偏低，建议复盘知识点',
      value: item.completionRate < 55 ? `${item.completionRate}%` : item.avgScore.toFixed(1)
    }))

  const syncWarnings = (dashboard.value?.classes || classes.value)
    .filter(item => item.syncStatus === 'FAILED' || item.attention)
    .slice(0, 3)
    .map(item => ({
      id: `sync-${item.id || item.name}`,
      type: 'danger',
      title: item.name || item.className || '未命名班级',
      desc: item.attentionReason || 'PTA 同步异常，需要检查 Cookie 或爬虫服务',
      value: '同步'
    }))

  return [...syncWarnings, ...experimentWarnings].slice(0, 6)
})

onMounted(() => {
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
  window.addEventListener('resize', resizeCharts)
  loadScreenData()
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  window.removeEventListener('resize', resizeCharts)
  disposeCharts()
})

async function loadScreenData() {
  loading.value = true
  try {
    const [dashboardRes, classRes, experimentRes, submissionRes] = await Promise.allSettled([
      api.getAdminDashboardOverview(),
      api.getClassList(),
      api.getTeacherExperimentList({ scope: 'all' }),
      api.getAllStudentExperiments({ scope: 'all' })
    ])

    dashboard.value = unwrapSettled(dashboardRes, {})
    const classPayload = unwrapSettled(classRes, [])
    const classRows = normalizeList(classPayload, ['data', 'classes'])
    classes.value = classRows.length ? classRows : normalizeList(dashboard.value?.classes || [], ['data', 'classes'])

    const experimentPayload = unwrapSettled(experimentRes, {})
    experimentListMeta.value = Array.isArray(experimentPayload) ? {} : experimentPayload
    experiments.value = normalizeList(experimentPayload, ['data', 'experiments'])
    submissions.value = normalizeList(unwrapSettled(submissionRes, []), ['data', 'submissions'])
    lastUpdated.value = new Date().toLocaleString('zh-CN', { hour12: false })

    await nextTick()
    renderCharts()
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '大屏数据加载失败'))
  } finally {
    loading.value = false
  }
}

function backToAdmin() {
  router.push('/admin/dashboard')
}

function renderCharts() {
  renderCompletionChart()
  renderScoreChart()
  renderStageChart()
  renderClassCompareChart()
}

function renderCompletionChart() {
  if (!completionChartRef.value) return
  completionChart = ensureChart(completionChart, completionChartRef.value)
  const rows = experimentStats.value.slice(-8)
  completionChart.setOption({
    color: ['#38bdf8'],
    title: emptyChartTitle(rows.length),
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 18, top: 24, bottom: 34 },
    xAxis: { type: 'category', data: rows.map(item => shortName(item.name)), axisLabel: chartText(11), axisLine: chartLine() },
    yAxis: { type: 'value', max: 100, axisLabel: { ...chartText(11), formatter: '{value}%' }, splitLine: chartSplitLine() },
    series: [{ type: 'line', smooth: true, symbolSize: 7, areaStyle: { color: 'rgba(56, 189, 248, 0.16)' }, data: rows.map(item => item.completionRate) }]
  })
}

function renderScoreChart() {
  if (!scoreChartRef.value) return
  scoreChart = ensureChart(scoreChart, scoreChartRef.value)
  const ranges = { '<60': 0, '60-69': 0, '70-79': 0, '80-89': 0, '90-100': 0 }
  const scoreSource = scoredSubmissions.value.length
    ? scoredSubmissions.value.map(item => Number(item.score))
    : aggregatedScores.value
  scoreSource.forEach(score => {
    if (score >= 90) ranges['90-100'] += 1
    else if (score >= 80) ranges['80-89'] += 1
    else if (score >= 70) ranges['70-79'] += 1
    else if (score >= 60) ranges['60-69'] += 1
    else ranges['<60'] += 1
  })
  const data = Object.values(ranges).some(Boolean)
    ? [
        { name: '低于 60', value: ranges['<60'] },
        { name: '60-69', value: ranges['60-69'] },
        { name: '70-79', value: ranges['70-79'] },
        { name: '80-89', value: ranges['80-89'] },
        { name: '90-100', value: ranges['90-100'] }
      ]
    : []
  scoreChart.setOption({
    color: ['#fb7185', '#f59e0b', '#22c55e', '#38bdf8', '#a78bfa'],
    title: emptyChartTitle(data.length),
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: chartText(11) },
    series: [{ type: 'pie', radius: ['46%', '70%'], center: ['50%', '43%'], itemStyle: { borderColor: '#07111f', borderWidth: 3 }, label: { color: '#dce8f7', formatter: '{b}\n{d}%' }, data }]
  })
}

function renderStageChart() {
  if (!stageChartRef.value) return
  stageChart = ensureChart(stageChart, stageChartRef.value)
  const stages = { pending: 0, running: 0, ended: 0 }
  experiments.value.forEach(item => { stages[getExperimentStage(item)] += 1 })
  const data = experiments.value.length ? [stages.pending, stages.running, stages.ended] : []
  stageChart.setOption({
    color: ['#94a3b8', '#14b8a6', '#f97316'],
    title: emptyChartTitle(data.length),
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 34, right: 20, top: 22, bottom: 30 },
    xAxis: { type: 'category', data: ['未开始', '进行中', '已结束'], axisLabel: chartText(11), axisLine: chartLine() },
    yAxis: { type: 'value', axisLabel: chartText(11), splitLine: chartSplitLine() },
    series: [{ type: 'bar', barWidth: 34, data }]
  })
}

function renderClassCompareChart() {
  if (!classCompareChartRef.value) return
  classCompareChart = ensureChart(classCompareChart, classCompareChartRef.value)
  const rows = classProfiles.value.slice(0, 10)
  classCompareChart.setOption({
    color: ['#2dd4bf', '#fbbf24'],
    title: emptyChartTitle(rows.length),
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 10, textStyle: chartText(11) },
    grid: { left: 42, right: 40, top: 36, bottom: 52 },
    xAxis: { type: 'category', data: rows.map(item => shortName(item.name)), axisLabel: { ...chartText(11), rotate: 18 }, axisLine: chartLine() },
    yAxis: [
      { type: 'value', max: 100, axisLabel: { ...chartText(11), formatter: '{value}%' }, splitLine: chartSplitLine() },
      { type: 'value', max: 100, axisLabel: chartText(11), splitLine: { show: false } }
    ],
    series: [
      { name: '完成率', type: 'bar', barWidth: 18, data: rows.map(item => item.completionRate) },
      { name: '平均分', type: 'line', yAxisIndex: 1, smooth: true, symbolSize: 7, data: rows.map(item => item.avgScore || 0) }
    ]
  })
}

function ensureChart(instance, el) {
  return instance || echarts.init(el, 'dark')
}

function resizeCharts() {
  completionChart?.resize()
  scoreChart?.resize()
  stageChart?.resize()
  classCompareChart?.resize()
}

function disposeCharts() {
  completionChart?.dispose()
  scoreChart?.dispose()
  stageChart?.dispose()
  classCompareChart?.dispose()
}

function normalizeList(value, keys) {
  if (Array.isArray(value)) return value
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key]
  }
  return []
}

function unwrapSettled(result, fallback) {
  if (result.status !== 'fulfilled') return fallback
  return result.value?.data ?? result.value ?? fallback
}

function isCompleted(item) {
  const status = String(item.status || '').toLowerCase()
  return ['completed', 'graded', 'submitted', 'success'].includes(status) || Number(item.score) > 0
}

function getExperimentStage(item) {
  const status = String(item.status || item.stage || '').toLowerCase()
  if (['pending', 'draft', 'not_started'].includes(status)) return 'pending'
  if (['ended', 'finished', 'closed'].includes(status)) return 'ended'
  const nowTime = Date.now()
  const start = Date.parse(item.startTime || item.start_time || item.createdAt)
  const end = Date.parse(item.endTime || item.deadline || item.end_time)
  if (!Number.isNaN(start) && start > nowTime) return 'pending'
  if (!Number.isNaN(end) && end < nowTime) return 'ended'
  return 'running'
}

function average(values) {
  const nums = values.map(Number).filter(item => Number.isFinite(item) && item > 0)
  if (!nums.length) return 0
  return nums.reduce((sum, item) => sum + item, 0) / nums.length
}

function firstNumber(...values) {
  for (const value of values) {
    const num = Number(value)
    if (Number.isFinite(num) && num > 0) return num
  }
  return null
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('zh-CN')
}

function shortName(value) {
  const text = String(value || '')
  return text.length > 8 ? `${text.slice(0, 8)}...` : text
}

function chartText(fontSize) {
  return { color: '#b8c7d9', fontSize }
}

function chartLine() {
  return { lineStyle: { color: 'rgba(184, 199, 217, 0.22)' } }
}

function chartSplitLine() {
  return { lineStyle: { color: 'rgba(184, 199, 217, 0.12)' } }
}

function emptyChartTitle(length) {
  if (length) return undefined
  return {
    text: '暂无数据',
    left: 'center',
    top: 'middle',
    textStyle: { color: '#64748b', fontSize: 14, fontWeight: 500 }
  }
}
</script>

<style scoped>
.screen-page {
  position: fixed;
  inset: 0;
  z-index: 5000;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: auto;
  color: #e5eef9;
  background: #07111f;
}

.screen-shell {
  min-height: 100vh;
  min-height: 100dvh;
  padding: 22px;
  background:
    radial-gradient(circle at 18% 12%, rgba(20, 184, 166, 0.16), transparent 28%),
    radial-gradient(circle at 78% 8%, rgba(251, 191, 36, 0.14), transparent 24%),
    linear-gradient(135deg, #07111f 0%, #0e1726 48%, #17152a 100%);
}

.screen-header,
.screen-actions,
.panel-title,
.screen-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.screen-kicker {
  color: #7dd3fc;
  font-size: 13px;
  font-weight: 700;
}

.screen-header h1 {
  margin: 6px 0 0;
  color: #ffffff;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 0;
}

.screen-time {
  display: grid;
  gap: 4px;
  text-align: right;
  color: #9fb1c7;
  font-size: 12px;
}

.screen-time strong {
  color: #ffffff;
  font-size: 22px;
}

.screen-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(125, 211, 252, 0.28);
  border-radius: 8px;
  color: #dff6ff;
  background: rgba(14, 165, 233, 0.14);
  cursor: pointer;
}

.screen-button:disabled {
  cursor: progress;
  opacity: 0.7;
}

.screen-button-ghost {
  border-color: rgba(148, 163, 184, 0.24);
  color: #cbd5e1;
  background: rgba(15, 23, 42, 0.54);
}

.screen-button-icon {
  width: 16px;
  height: 16px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.metric-tile,
.panel {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: rgba(7, 17, 31, 0.72);
}

.metric-tile {
  min-height: 112px;
  padding: 16px;
}

.metric-label,
.metric-tile small,
.panel-title small,
.warning-row span,
.heat-cell span,
.screen-footer {
  color: #9fb1c7;
}

.metric-tile strong {
  display: block;
  margin: 12px 0 8px;
  color: #ffffff;
  font-size: 34px;
  line-height: 1;
}

.metric-blue { box-shadow: inset 3px 0 0 #38bdf8; }
.metric-green { box-shadow: inset 3px 0 0 #22c55e; }
.metric-amber { box-shadow: inset 3px 0 0 #f59e0b; }
.metric-red { box-shadow: inset 3px 0 0 #fb7185; }

.screen-grid {
  display: grid;
  grid-template-columns: minmax(300px, 1.1fr) minmax(300px, 1fr) minmax(300px, 1fr);
  gap: 14px;
  margin-top: 14px;
}

.panel {
  min-width: 0;
  min-height: 290px;
  padding: 16px;
}

.panel-map {
  grid-row: span 2;
}

.panel-wide {
  grid-column: span 2;
}

.panel-title {
  margin-bottom: 12px;
}

.panel-title span {
  color: #f8fafc;
  font-size: 15px;
  font-weight: 800;
}

.panel-title small {
  font-size: 12px;
}

.chart {
  width: 100%;
  height: 230px;
}

.chart-wide {
  height: 250px;
}

.heat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.heat-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 68px;
  padding: 12px;
  border: 1px solid rgba(45, 212, 191, calc(0.12 + var(--level) * 0.3));
  border-radius: 8px;
  background: rgba(20, 184, 166, calc(0.07 + var(--level) * 0.2));
}

.heat-cell strong,
.warning-row strong {
  display: block;
  color: #f8fafc;
  font-size: 13px;
}

.heat-cell span,
.warning-row span {
  display: block;
  margin-top: 5px;
  font-size: 12px;
}

.heat-cell b {
  color: #99f6e4;
  font-size: 20px;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.warning-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 58px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.72);
}

.warning-row.warn {
  border-left: 3px solid #f59e0b;
}

.warning-row.danger {
  border-left: 3px solid #fb7185;
}

.warning-row b {
  color: #ffffff;
  font-size: 18px;
}

.empty-state {
  display: grid;
  min-height: 180px;
  place-items: center;
  color: #9fb1c7;
  border: 1px dashed rgba(148, 163, 184, 0.22);
  border-radius: 8px;
}

.heat-empty {
  grid-column: 1 / -1;
}

.screen-footer {
  margin-top: 14px;
  font-size: 12px;
}

@media (max-width: 1280px) {
  .metric-grid,
  .screen-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-map,
  .panel-wide {
    grid-column: span 2;
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .screen-shell {
    padding: 16px;
  }

  .screen-header,
  .screen-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .screen-header h1 {
    font-size: 26px;
  }

  .screen-actions,
  .metric-grid,
  .screen-grid,
  .heat-grid {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .panel-map,
  .panel-wide {
    grid-column: auto;
  }
}
</style>
