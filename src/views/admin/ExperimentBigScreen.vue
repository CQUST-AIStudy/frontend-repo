<template>
  <div class="screen-page">
    <div class="screen-shell">
      <!-- ===== Header ===== -->
      <header class="screen-header">
        <div>
          <div class="screen-kicker">
            <span class="kicker-dot"></span>
            学院管理员 · 实验教学运行态势
          </div>
          <h1>实验教学综合监控</h1>
        </div>
        <div class="screen-actions">
          <div class="screen-time">
            <span>{{ currentDate }}</span>
            <strong>{{ currentTime }}</strong>
          </div>
          <button class="screen-button screen-button-ghost" @click="backToAdmin">返回后台</button>
          <button class="screen-button" :disabled="loading" @click="loadScreenData">
            <Refresh class="screen-button-icon" />
            <span>{{ loading ? '刷新中' : '刷新' }}</span>
          </button>
        </div>
      </header>

      <!-- ===== 鏍稿績鎸囨爣锛氭暣浣撶姸鎬?===== -->
      <section class="metric-grid" :aria-busy="loading">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="metric-tile"
          :class="[metric.tone, { 'metric-risk': metric.risk }]"
        >
          <span class="metric-label">{{ metric.label }}</span>
          <strong>
            {{ metric.value }}
            <span v-if="metric.risk" class="risk-badge" :class="'risk-' + metric.riskLevel">
              {{ metric.risk }}
            </span>
          </strong>
          <small>{{ metric.meta }}</small>
          <div v-if="metric.progress != null" class="metric-progress">
            <div
              class="metric-progress-bar"
              :class="'progress-' + metric.riskLevel"
              :style="{ width: metric.progress + '%' }"
            ></div>
          </div>
        </div>
      </section>

      <!-- ===== 涓诲唴瀹瑰尯锛氬浘琛ㄩ潰鏉?===== -->
      <main class="screen-grid">
        <!-- 瀛﹂櫌瀹為獙鐑姏 (2琛岄珮) -->
        <section class="panel panel-map">
          <div class="panel-title">
            <span>学院实验热力</span>
            <small>按班级完成率聚合</small>
          </div>
          <div class="heat-grid">
            <div
              v-for="(item, idx) in classHeat"
              :key="item.name"
              class="heat-cell"
              :style="{ '--level': item.level, '--i': idx }"
            >
              <div>
                <strong>{{ item.name }}</strong>
                <span>{{ item.teacherName || '未绑定教师' }}</span>
              </div>
              <div class="heat-right">
                <b>{{ item.completionRate }}%</b>
                <span class="heat-bar-wrap">
                  <span class="heat-bar" :style="{ width: item.completionRate + '%' }"></span>
                </span>
              </div>
            </div>
            <div v-if="!classHeat.length" class="empty-state heat-empty">暂无班级实验数据</div>
          </div>
        </section>

        <!-- 瀹為獙瀹屾垚鐜囪秼鍔?-->
        <section class="panel">
          <div class="panel-title">
            <span>完成率趋势</span>
            <small>近期实验提交覆盖</small>
          </div>
          <div ref="completionChartRef" class="chart"></div>
        </section>

        <!-- 鎴愮哗鍒嗗竷 -->
        <section class="panel">
          <div class="panel-title">
            <span>成绩分布</span>
            <small>已评分提交</small>
          </div>
          <div ref="scoreChartRef" class="chart"></div>
        </section>

        <!-- 瀹為獙杩愯闃舵 -->
        <section class="panel">
          <div class="panel-title">
            <span>运行阶段</span>
            <small>未开始 / 进行中 / 已结束</small>
          </div>
          <div ref="stageChartRef" class="chart"></div>
        </section>

        <!-- 鐝骇瀹為獙瀵规瘮 (2鍒楀) -->
        <section class="panel panel-wide">
          <div class="panel-title">
            <span>班级实验对比</span>
            <small>完成率与平均成绩双指标</small>
          </div>
          <div ref="classCompareChartRef" class="chart chart-wide"></div>
        </section>
      </main>

      <!-- ===== 棰勮涓績 ===== -->
      <section class="alert-center">
        <div class="alert-header">
          <div class="alert-title-row">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span class="alert-title">预警中心</span>
            <span class="alert-badge">{{ totalAlerts }} 项关注</span>
          </div>
          <small>实时监控学院实验教学的完成率风险、成绩风险、评分缺口与同步异常</small>
        </div>
        <div class="alert-grid">
          <!-- Top5 1: 浣庡畬鎴愮巼鐝骇 -->
          <div class="alert-card alert-danger">
            <div class="alert-card-head">
              <span class="alert-card-label">低完成率班级</span>
              <span class="alert-threshold">阈值 &lt; 40%</span>
            </div>
            <div class="alert-list">
              <div
                v-for="(item, idx) in lowCompletionTop5"
                :key="'lc-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.teacherName || '-' }} · {{ item.studentCount || 0 }}人</small>
                </div>
                <span class="alert-value danger">{{ item.completionRate }}%</span>
              </div>
              <div v-if="!lowCompletionTop5.length" class="alert-empty">暂无低完成率班级</div>
            </div>
          </div>

          <!-- Top5 2: 浣庡垎鐜囩彮绾?-->
          <div class="alert-card alert-warn">
            <div class="alert-card-head">
              <span class="alert-card-label">低分率班级</span>
              <span class="alert-threshold">不及格占比 &gt; 30%</span>
            </div>
            <div class="alert-list">
              <div
                v-for="(item, idx) in lowScoreTop5"
                :key="'ls-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.teacherName || '-' }} · 均分 {{ item.avgScore }}</small>
                </div>
                <span class="alert-value warn">{{ item.lowScoreRate }}%</span>
              </div>
              <div v-if="!lowScoreTop5.length" class="alert-empty">暂无低分率班级</div>
            </div>
          </div>

          <!-- Top5 3: 鏈瘎鍒嗗疄楠?-->
          <div class="alert-card alert-info-alt">
            <div class="alert-card-head">
              <span class="alert-card-label">未评分实验</span>
              <span class="alert-threshold">待评分提交数</span>
            </div>
            <div class="alert-list">
              <div
                v-for="(item, idx) in ungradedTop5"
                :key="'ug-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.teacherName || '-' }} · {{ item.ungradedCount }}/{{ item.totalCount }}</small>
                </div>
                <span class="alert-value info">{{ Math.round((item.ungradedCount / Math.max(1, item.totalCount)) * 100) }}%</span>
              </div>
              <div v-if="!ungradedTop5.length" class="alert-empty">暂无未评分实验</div>
            </div>
          </div>

          <!-- Top5 4: 鍚屾寮傚父 -->
          <div class="alert-card alert-critical">
            <div class="alert-card-head">
              <span class="alert-card-label">同步异常</span>
              <span class="alert-threshold">FAILED / 48h未更新</span>
            </div>
            <div class="alert-list">
              <div
                v-for="(item, idx) in syncAnomalyTop5"
                :key="'sa-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.className }}</strong>
                  <small>{{ item.reason }}</small>
                </div>
                <span class="alert-value critical">{{ item.lastSync || '从未' }}</span>
              </div>
              <div v-if="!syncAnomalyTop5.length" class="alert-empty">暂无同步异常</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== Footer ===== -->
      <footer class="screen-footer">
        <span>鏁版嵁鏉ユ簮锛氬疄楠岀鐞?路 鐝骇绠＄悊 路 PTA 鍚屾 路 AI 鎵规敼妯″潡</span>
        <span v-if="lastUpdated">鏈€杩戞洿鏂?{{ lastUpdated }}</span>
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


/* ---------- 鏃堕挓 & 鍩虹璁＄畻 ---------- */
const currentDate = computed(() =>
  now.value.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' })
)
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
const aggregatedScores = computed(() =>
  experiments.value
    .map(item => Number(item.averageScore ?? item.avgScore ?? item.avg_score))
    .filter(item => Number.isFinite(item) && item > 0)
)
const avgScore = computed(() =>
  average([...scoredSubmissions.value.map(item => Number(item.score)), ...aggregatedScores.value])
)
const activeExperimentCount = computed(() =>
  experiments.value.filter(item => getExperimentStage(item) === 'running').length
)
const totalSubmissionCount = computed(() => {
  if (completedSubmissions.value.length) return completedSubmissions.value.length
  return experiments.value.reduce(
    (sum, item) => sum + Number(item.submissionCount ?? item.submittedCount ?? item.submitCount ?? item.submission_count ?? 0), 0
  )
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

// 涓嶅強鏍肩巼 (score < 60)
const failRate = computed(() => {
  const allScores = [
    ...scoredSubmissions.value.map(item => Number(item.score)),
    ...aggregatedScores.value
  ].filter(s => Number.isFinite(s) && s > 0)
  if (!allScores.length) return 0
  const fails = allScores.filter(s => s < 60).length
  return Math.round((fails / allScores.length) * 100)
})

// 鍚屾寮傚父璁℃暟 (浠?dashboard.classes 涓彇)
const syncIssueCount = computed(() => {
  const dc = dashboard.value?.classes || []
  return dc.filter(c => c.attention || c.syncStatus === 'FAILED').length
})

/* ---------- 鏍稿績鎸囨爣闈㈡澘 ---------- */
const metrics = computed(() => {
  const cr = completionRate.value
  const gr = gradingRate.value
  const fr = failRate.value

  return [
    {
      label: '实验总数', value: formatNumber(experimentCount.value),
      meta: `${activeExperimentCount.value} 个进行中`, tone: 'metric-blue',
      risk: '', riskLevel: 'ok', progress: null
    },
    {
      label: '覆盖班级', value: formatNumber(classCount.value),
      meta: `${formatNumber(totalStudents.value)} 名学生`, tone: 'metric-green',
      risk: '', riskLevel: 'ok', progress: null
    },
    {
      label: '整体完成率', value: `${cr}%`,
      meta: `已提交 ${formatNumber(totalSubmissionCount.value)} 次`,
      tone: cr < 40 ? 'metric-red' : cr < 65 ? 'metric-amber' : 'metric-green',
      risk: cr < 40 ? '高风险' : cr < 65 ? '关注' : '',
      riskLevel: cr < 40 ? 'danger' : cr < 65 ? 'warn' : 'ok',
      progress: cr
    },
    {
      label: '教学质量', value: avgScore.value ? avgScore.value.toFixed(1) : '-',
      meta: `评分覆盖 ${gr}% · 不及格率 ${fr}%`,
      tone: fr > 25 ? 'metric-red' : fr > 15 ? 'metric-amber' : 'metric-green',
      risk: fr > 25 ? '超标' : fr > 15 ? '预警' : '',
      riskLevel: fr > 25 ? 'danger' : fr > 15 ? 'warn' : 'ok',
      progress: null
    }
  ]
})

/* ---------- 瀹為獙缁熻 / 鐝骇鐢诲儚 ---------- */
const experimentStats = computed(() => {
  const studentBase = Math.max(1, totalStudents.value)
  return experiments.value.map((item, index) => {
    const id = item.experimentId || item.experiment_id || item.id || index
    const related = submissions.value.filter(
      sub => String(sub.experimentId || sub.experiment_id || '') === String(id)
    )
    const completed = related.filter(isCompleted)
    const scored = related.filter(sub => Number(sub.score) > 0)
    const submissionCount = Number(item.submissionCount || item.submission_count || completed.length)
    const explicitRate = firstNumber(item.completionRate, item.completion_rate, item.submitRate, item.submissionRate)
    const explicitScore = firstNumber(item.averageScore, item.avgScore, item.avg_score)
    return {
      id,
      name: item.name || item.title || item.experimentName || item.experiment_name || `瀹為獙 ${index + 1}`,
      completionRate:
        explicitRate !== null
          ? Math.min(100, Math.round(explicitRate))
          : Math.min(100, Math.round((submissionCount / studentBase) * 100)),
      avgScore:
        explicitScore !== null ? explicitScore : average(scored.map(sub => Number(sub.score))),
      stage: getExperimentStage(item),
      ungradedCount: Math.max(0, completed.length - scored.length),
      totalCount: submissionCount
    }
  })
})

const classProfiles = computed(() => {
  const totalExp = Math.max(1, experimentCount.value)
  return classes.value.map((cls, index) => {
    const className = cls.name || cls.className || cls.class_name || cls.classname || `鐝骇 ${index + 1}`
    const related = submissions.value.filter(item => {
      const itemClassId = item.classId || item.class_id
      const itemClassName = item.className || item.class_name || item.classname
      return String(itemClassId || '') === String(cls.id || '') || itemClassName === className
    })
    const studentCount =
      Number(cls.studentCount || cls.student_count || 0) ||
      new Set(related.map(item => item.studentId || item.userId).filter(Boolean)).size
    const completed = related.filter(isCompleted)
    const scored = related.filter(item => Number(item.score) > 0)
    const denominator = Math.max(1, (studentCount || totalStudents.value || 1) * totalExp)
    const completion = Math.min(100, Math.round((completed.length / denominator) * 100))
    // 浣庡垎鐜?(score < 60)
    const allScores = scored.map(item => Number(item.score)).filter(s => Number.isFinite(s) && s > 0)
    const lowScoreRate = allScores.length ? Math.round((allScores.filter(s => s < 60).length / allScores.length) * 100) : 0
    return {
      id: cls.id || className,
      name: className,
      teacherName: cls.teacherName || cls.teacher_name || cls.teacher || cls.ownerName,
      studentCount,
      completionRate: completion,
      avgScore: Math.round(average(scored.map(item => Number(item.score))) * 10) / 10,
      lowScoreRate
    }
  })
})

const classHeat = computed(() => {
  return classProfiles.value.slice(0, 18).map(item => ({
    ...item,
    level: Math.max(0.08, Math.min(1, item.completionRate / 100))
  }))
})

/* ---------- 棰勮涓績 Top5 鏁版嵁 ---------- */
// 数据优先级：后端 riskMetrics API -> 前端 computed 计算；没有真实数据时显示空态。

// 低完成率班级 Top5
const lowCompletionTop5 = computed(() => {
  const fromApi = dashboard.value?.riskMetrics?.lowCompletionClasses
  if (Array.isArray(fromApi) && fromApi.length) return fromApi
  return classProfiles.value
    .filter(c => c.completionRate < 40)
    .sort((a, b) => a.completionRate - b.completionRate)
    .slice(0, 5)
})

// 低分率班级 Top5
const lowScoreTop5 = computed(() => {
  const fromApi = dashboard.value?.riskMetrics?.lowScoreClasses
  if (Array.isArray(fromApi) && fromApi.length) return fromApi
  const real = classProfiles.value
    .filter(c => c.lowScoreRate > 30)
    .sort((a, b) => b.lowScoreRate - a.lowScoreRate)
    .slice(0, 5)
  return real
})

// 未评分实验 Top5
const ungradedTop5 = computed(() => {
  const fromApi = dashboard.value?.riskMetrics?.ungradedExperiments
  if (Array.isArray(fromApi) && fromApi.length) return fromApi
  const real = experimentStats.value
    .filter(e => e.ungradedCount > 0)
    .sort((a, b) => b.ungradedCount - a.ungradedCount)
    .slice(0, 5)
  return real
})

// 同步异常 Top5
const syncAnomalyTop5 = computed(() => {
  const fromApi = dashboard.value?.riskMetrics?.syncAnomalies
  if (Array.isArray(fromApi) && fromApi.length) {
    return fromApi.map(item => ({
      ...item,
      lastSync: item.lastSync ? new Date(item.lastSync).toLocaleDateString('zh-CN') : null
    }))
  }
  const dc = dashboard.value?.classes || []
  const real = dc
    .filter(c => c.attention || c.syncStatus === 'FAILED')
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      className: c.name || c.className || '未命名班级',
      ptaClass: c.ptaKeyword || '',
      status: c.syncStatus || 'UNKNOWN',
      lastSync: c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleDateString('zh-CN') : null,
      reason: c.attentionReason || (c.syncStatus === 'FAILED' ? '同步失败' : '状态异常')
    }))
  return real
})

// 棰勮鎬绘暟
const totalAlerts = computed(() => {
  return lowCompletionTop5.value.length + lowScoreTop5.value.length + ungradedTop5.value.length + syncAnomalyTop5.value.length
})

/* ---------- Lifecycle ---------- */
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

/* ---------- Data Loading ---------- */
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
    const submissionRows = normalizeList(unwrapSettled(submissionRes, []), ['data', 'submissions'])
    const experimentRows = normalizeList(experimentPayload, ['data', 'experiments'])
    submissions.value = submissionRows
    experiments.value = mergeExperimentRows(experimentRows, submissionRows)
    lastUpdated.value = new Date().toLocaleString('zh-CN', { hour12: false })

    await nextTick()
    renderCharts()
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '澶у睆鏁版嵁鍔犺浇澶辫触'))
  } finally {
    loading.value = false
  }
}

function backToAdmin() {
  router.push('/admin/dashboard')
}

/* ---------- ECharts ---------- */
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
    tooltip: {
      trigger: 'axis',
      formatter(params) {
        const item = rows[params[0]?.dataIndex]
        if (!item) return ''
        return `<b style="font-size:14px">${item.name}</b><br/>`
          + `完成率：<b>${item.completionRate}%</b><br/>`
          + `平均分：${item.avgScore ?? '-'}<br/>`
          + `未评分：${item.ungradedCount} 份`
      }
    },
    grid: { left: 36, right: 18, top: 24, bottom: 60 },
    xAxis: {
      type: 'category',
      data: rows.map(item => item.name),
      axisLabel: {
        ...chartText(12),
        rotate: 30,
        width: 90,
        overflow: 'truncate',
        ellipsis: '...',
        interval: 0
      },
      axisLine: chartLine(),
      axisTick: { alignWithLabel: true, lineStyle: { color: 'rgba(148,163,184,0.3)' } }
    },
    yAxis: { type: 'value', max: 100, axisLabel: { ...chartText(11), formatter: '{value}%' }, splitLine: chartSplitLine() },
    series: [{
      type: 'bar',
      barMaxWidth: 36,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color(params) {
          const rate = rows[params.dataIndex]?.completionRate ?? 0
          if (rate < 40) return '#fb7185'   // 绾㈣壊 - 浣庡畬鎴愮巼椋庨櫓
          if (rate < 60) return '#fbbf24'   // 榛勮壊 - 鍏虫敞
          return '#38bdf8'                   // 钃濊壊 - 姝ｅ父
        }
      },
      label: {
        show: true,
        position: 'top',
        color: '#dce8f7',
        fontSize: 11,
        formatter: '{c}%'
      },
      data: rows.map(item => item.completionRate)
    }]
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
        { name: '不及格 (<60)', value: ranges['<60'] },
        { name: '60-69', value: ranges['60-69'] },
        { name: '70-79', value: ranges['70-79'] },
        { name: '80-89', value: ranges['80-89'] },
        { name: '优秀 (90-100)', value: ranges['90-100'] }
      ]
    : []
  scoreChart.setOption({
    color: ['#fb7185', '#f59e0b', '#22c55e', '#38bdf8', '#a78bfa'],
    title: emptyChartTitle(data.length),
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: chartText(11) },
    series: [{ type: 'pie', radius: ['46%', '70%'], center: ['50%', '43%'], itemStyle: { borderColor: '#0a1628', borderWidth: 3 }, label: { color: '#dce8f7', formatter: '{b}\n{d}%' }, data }]
  })
}

function renderStageChart() {
  if (!stageChartRef.value) return
  stageChart = ensureChart(stageChart, stageChartRef.value)
  const stages = { pending: 0, running: 0, ended: 0 }
  experiments.value.forEach(item => { stages[getExperimentStage(item)] += 1 })
  const data = experiments.value.length ? [stages.pending, stages.running, stages.ended] : []
  stageChart.setOption({
    color: ['#94a3b8', '#2dd4bf', '#f97316'],
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
    tooltip: {
      trigger: 'axis',
      formatter(params) {
        const idx = params[0]?.dataIndex
        const row = rows[idx]
        if (!row) return ''
        return `<b style="font-size:14px">${row.name}</b><br/>`
          + `完成率：<b>${row.completionRate}%</b><br/>`
          + `平均分：${row.avgScore ?? '-'}<br/>`
          + `低分率：${row.lowScoreRate ?? '-'}%`
      }
    },
    legend: { top: 0, right: 10, textStyle: chartText(11) },
    grid: { left: 42, right: 40, top: 36, bottom: 62 },
    xAxis: {
      type: 'category',
      data: rows.map(item => item.name),
      axisLabel: {
        ...chartText(12),
        rotate: 30,
        width: 80,
        overflow: 'truncate',
        ellipsis: '...',
        interval: 0
      },
      axisLine: chartLine(),
      axisTick: { alignWithLabel: true, lineStyle: { color: 'rgba(148,163,184,0.3)' } }
    },
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

/* ---------- Chart Helpers ---------- */
function ensureChart(instance, el) {
  return instance || echarts.init(el, 'dark')
}
function resizeCharts() {
  completionChart?.resize(); scoreChart?.resize(); stageChart?.resize(); classCompareChart?.resize()
}
function disposeCharts() {
  completionChart?.dispose(); scoreChart?.dispose(); stageChart?.dispose(); classCompareChart?.dispose()
}

function normalizeList(value, keys) {
  if (Array.isArray(value)) return value
  for (const key of keys) { if (Array.isArray(value?.[key])) return value[key] }
  return []
}

function mergeExperimentRows(experimentRows, submissionRows) {
  const byId = new Map()
  experimentRows.forEach((item, index) => {
    const id = getExperimentId(item, index)
    if (id == null || id === '') return
    byId.set(String(id), { ...item, id, experimentId: id })
  })
  submissionRows.forEach((item, index) => {
    const id = getExperimentId(item, index)
    if (id == null || id === '' || byId.has(String(id))) return
    byId.set(String(id), {
      id,
      experimentId: id,
      name: item.experimentName || item.experiment_name || item.name || `实验 ${byId.size + 1}`,
      className: item.className || item.class_name || '',
      submissionCount: 0,
      status: item.deadline ? undefined : 'running',
      deadline: item.deadline
    })
  })
  return Array.from(byId.values())
}

function getExperimentId(item, fallback) {
  return item?.experimentId ?? item?.experiment_id ?? item?.id ?? fallback
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
function formatNumber(value) { return Number(value || 0).toLocaleString('zh-CN') }
function shortName(value) {
  const text = String(value || '')
  return text.length > 8 ? `${text.slice(0, 8)}...` : text
}
function chartText(fontSize) { return { color: '#b8c7d9', fontSize } }
function chartLine() { return { lineStyle: { color: 'rgba(148,163,184,0.18)' } } }
function chartSplitLine() { return { lineStyle: { color: 'rgba(148,163,184,0.08)' } } }
function emptyChartTitle(length) {
  if (length) return undefined
  return { text: '鏆傛棤鏁版嵁', left: 'center', top: 'middle', textStyle: { color: '#64748b', fontSize: 14, fontWeight: 500 } }
}
</script>

<style scoped>
/* ============================================================
   Design: Dark Dashboard 鈥?瀛﹂櫌绠＄悊鍛樿瑙?   Palette: oklch-tinted deep navy + cool accents
   Inspired by Impeccable principles:
     - Tinted neutrals, not pure black
     - 4pt spacing scale
     - transform/opacity only animations
     - Staggered entrance with --i
============================================================ */

/* ----- Base ----- */
.screen-page {
  --space-xs: 6px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 20px;
  --space-xl: 28px;
  --radius: 10px;
  --radius-sm: 6px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  position: fixed; inset: 0; z-index: 5000;
  width: 100vw; height: 100vh; height: 100dvh;
  overflow: auto;
  color: #e0e8f2;
  background: oklch(12% 0.018 250);
}

.screen-shell {
  min-height: 100vh; min-height: 100dvh;
  padding: var(--space-lg);
  background:
    radial-gradient(circle at 18% 12%, oklch(35% 0.12 185 / 0.14), transparent 30%),
    radial-gradient(circle at 82% 8%, oklch(35% 0.14 65 / 0.10), transparent 26%),
    radial-gradient(circle at 50% 85%, oklch(28% 0.10 255 / 0.08), transparent 40%),
    linear-gradient(150deg, oklch(12% 0.018 250) 0%, oklch(14% 0.020 240) 45%, oklch(13% 0.022 260) 100%);
}

/* ----- Header ----- */
.screen-header, .screen-footer {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-md);
}

.screen-kicker {
  display: flex; align-items: center; gap: 8px;
  color: oklch(78% 0.08 200); font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.kicker-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: oklch(72% 0.18 185);
  box-shadow: 0 0 10px oklch(72% 0.18 185 / 0.5);
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.screen-header h1 {
  margin: 4px 0 0;
  color: oklch(96% 0.01 250);
  font-size: 30px; font-weight: 800;
  letter-spacing: -0.02em;
}

.screen-actions { display: flex; align-items: center; gap: var(--space-sm); }
.screen-time {
  display: grid; gap: 2px; text-align: right;
  color: oklch(72% 0.02 240); font-size: 12px;
}
.screen-time strong {
  color: oklch(96% 0.01 250); font-size: 22px; font-variant-numeric: tabular-nums;
}
.screen-button {
  display: inline-flex; align-items: center; gap: 8px;
  height: 38px; padding: 0 14px;
  border: 1px solid oklch(65% 0.10 200 / 0.28);
  border-radius: var(--radius-sm);
  color: oklch(90% 0.03 210);
  background: oklch(30% 0.06 210 / 0.16);
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: background 150ms var(--ease-out), border-color 150ms var(--ease-out);
}
.screen-button:hover { background: oklch(30% 0.06 210 / 0.28); border-color: oklch(65% 0.10 200 / 0.45); }
.screen-button:disabled { cursor: progress; opacity: 0.7; }
.screen-button-ghost {
  border-color: oklch(55% 0.02 245 / 0.22);
  color: oklch(78% 0.02 245);
  background: oklch(20% 0.01 250 / 0.45);
}
.screen-button-icon { width: 16px; height: 16px; }

/* ----- Metric Grid ----- */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.metric-tile {
  position: relative; overflow: hidden;
  min-height: 112px; padding: var(--space-md);
  border: 1px solid oklch(50% 0.02 250 / 0.16);
  border-radius: var(--radius);
  background: oklch(16% 0.015 250 / 0.75);
  backdrop-filter: blur(4px);
  transition: border-color 200ms var(--ease-out);
}
.metric-tile:hover { border-color: oklch(60% 0.06 210 / 0.30); }

.metric-tile strong {
  display: flex; align-items: baseline; gap: 8px;
  margin: var(--space-sm) 0 6px;
  color: oklch(96% 0.01 250);
  font-size: 32px; font-weight: 800; line-height: 1;
}

.metric-label {
  color: oklch(72% 0.02 245); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
}
.metric-tile small {
  display: block; color: oklch(68% 0.02 245); font-size: 12px;
}

/* Risk Badge */
.risk-badge {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 11px; font-weight: 700; line-height: 1.4;
}
.risk-warn  { color: #f59e0b; background: oklch(50% 0.15 80 / 0.15); }
.risk-danger { color: #fb7185; background: oklch(45% 0.18 10 / 0.15); }

/* Progress Bar */
.metric-progress {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: oklch(30% 0.02 250 / 0.5);
}
.metric-progress-bar { height: 100%; transition: width 400ms var(--ease-out); }
.progress-ok    { background: oklch(65% 0.18 145); }
.progress-warn  { background: oklch(65% 0.16 80); }
.progress-danger { background: oklch(55% 0.20 15); }

/* Metric Tones (left border indicator) */
.metric-blue   { box-shadow: inset 3px 0 0 oklch(65% 0.12 230); }
.metric-green  { box-shadow: inset 3px 0 0 oklch(65% 0.18 145); }
.metric-amber  { box-shadow: inset 3px 0 0 oklch(65% 0.16 80); }
.metric-red    { box-shadow: inset 3px 0 0 oklch(55% 0.20 15); }
.metric-risk   { animation: metric-pulse 3s ease-in-out infinite; }
@keyframes metric-pulse {
  0%, 100% { border-color: oklch(50% 0.02 250 / 0.16); }
  50% { border-color: oklch(55% 0.12 15 / 0.35); }
}

/* ----- Main Screen Grid ----- */
.screen-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1.1fr) minmax(260px, 1fr) minmax(260px, 1fr);
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.panel {
  min-width: 0; min-height: 280px; padding: var(--space-md);
  border: 1px solid oklch(50% 0.02 250 / 0.14);
  border-radius: var(--radius);
  background: oklch(16% 0.015 250 / 0.72);
  backdrop-filter: blur(4px);
  transition: border-color 200ms var(--ease-out);
}
.panel:hover { border-color: oklch(60% 0.04 235 / 0.25); }

.panel-map  { grid-row: span 2; }
.panel-wide { grid-column: span 2; }

.panel-title {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-sm);
}
.panel-title span {
  color: oklch(94% 0.01 250); font-size: 14px; font-weight: 800;
}
.panel-title small { color: oklch(68% 0.02 245); font-size: 12px; }

.chart { width: 100%; height: 220px; }
.chart-wide { height: 240px; }

/* ----- Heat Grid (Enhanced) ----- */
.heat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-xs);
}
.heat-cell {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-xs);
  min-height: 62px; padding: var(--space-sm);
  border: 1px solid oklch(60% 0.10 180 / calc(0.10 + var(--level) * 0.25));
  border-radius: var(--radius-sm);
  background: oklch(30% 0.06 180 / calc(0.06 + var(--level) * 0.18));
  transition: transform 150ms var(--ease-out), border-color 150ms var(--ease-out);
  animation: cell-enter 350ms var(--ease-out) calc(var(--i, 0) * 40ms) both;
}
@keyframes cell-enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.heat-cell:hover { transform: translateY(-1px); }
.heat-cell strong { display: block; color: oklch(96% 0.01 250); font-size: 12px; font-weight: 700; }
.heat-cell span   { display: block; margin-top: 3px; color: oklch(68% 0.02 245); font-size: 11px; }

.heat-right { text-align: right; }
.heat-right b { color: oklch(80% 0.12 175); font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; }
.heat-bar-wrap { display: block; margin-top: 4px; width: 48px; height: 3px; border-radius: 2px; background: oklch(25% 0.02 240); overflow: hidden; }
.heat-bar { display: block; height: 100%; border-radius: 2px; background: oklch(65% 0.14 175); transition: width 500ms var(--ease-out); }

/* ----- Alert Center ----- */
.alert-center {
  margin-top: var(--space-sm);
  border: 1px solid oklch(48% 0.03 15 / 0.18);
  border-radius: var(--radius);
  background: oklch(14% 0.018 250 / 0.70);
  padding: var(--space-md);
  backdrop-filter: blur(4px);
}

.alert-header {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-md);
  margin-bottom: var(--space-md); padding-bottom: var(--space-sm);
  border-bottom: 1px solid oklch(50% 0.02 250 / 0.12);
}

.alert-title-row { display: flex; align-items: center; gap: 10px; }
.alert-icon {
  width: 22px; height: 22px; color: oklch(65% 0.16 30);
  filter: drop-shadow(0 0 6px oklch(55% 0.20 15 / 0.4));
}
.alert-title {
  color: oklch(94% 0.01 250); font-size: 17px; font-weight: 800; letter-spacing: -0.01em;
}
.alert-badge {
  display: inline-block; padding: 2px 10px; border-radius: 12px;
  background: oklch(40% 0.10 15 / 0.20); color: #fb7185;
  font-size: 12px; font-weight: 700;
}
.alert-header small { color: oklch(68% 0.02 245); font-size: 12px; }

.alert-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-sm);
}

/* Alert Cards */
.alert-card {
  border: 1px solid oklch(45% 0.02 250 / 0.14);
  border-radius: var(--radius-sm);
  background: oklch(16% 0.015 250 / 0.60);
  padding: var(--space-sm);
  transition: border-color 200ms var(--ease-out);
}
.alert-card:hover { border-color: oklch(55% 0.05 240 / 0.30); }

.alert-danger  { border-top: 3px solid #fb7185; }
.alert-warn    { border-top: 3px solid #f59e0b; }
.alert-info-alt { border-top: 3px solid #38bdf8; }
.alert-critical { border-top: 3px solid #e879f9; }

.alert-card-head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  margin-bottom: var(--space-xs); padding-bottom: var(--space-xs);
  border-bottom: 1px solid oklch(40% 0.02 250 / 0.10);
}
.alert-card-label {
  color: oklch(90% 0.01 250); font-size: 13px; font-weight: 700;
}
.alert-threshold {
  color: oklch(65% 0.02 245); font-size: 10px; font-weight: 600;
  padding: 1px 6px; border-radius: 3px;
  background: oklch(30% 0.02 250 / 0.4);
}

/* Alert List */
.alert-list {
  display: flex; flex-direction: column; gap: 6px;
}
.alert-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 6px;
  background: oklch(20% 0.015 250 / 0.50);
  transition: background 150ms var(--ease-out);
  animation: cell-enter 300ms var(--ease-out) calc(var(--i, 0) * 60ms) both;
}
.alert-row:hover { background: oklch(25% 0.020 250 / 0.55); }

.alert-rank {
  width: 20px; height: 20px; display: grid; place-items: center;
  border-radius: 4px; font-size: 11px; font-weight: 800; color: oklch(68% 0.02 245);
  background: oklch(25% 0.015 250);
}
.rank-top { color: #000; background: oklch(65% 0.14 80); }

.alert-row-info { flex: 1; min-width: 0; }
.alert-row-info strong {
  display: block; color: oklch(92% 0.01 250); font-size: 12px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.alert-row-info small { display: block; margin-top: 2px; color: oklch(65% 0.02 245); font-size: 11px; }

.alert-value {
  font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap;
}
.alert-value.danger   { color: #fb7185; }
.alert-value.warn     { color: #f59e0b; }
.alert-value.info     { color: #38bdf8; }
.alert-value.critical { color: #e879f9; }

.alert-empty {
  display: grid; place-items: center; min-height: 60px;
  color: oklch(55% 0.02 245); font-size: 12px;
  border: 1px dashed oklch(40% 0.02 250 / 0.20); border-radius: 6px;
}

/* ----- Empty State ----- */
.empty-state {
  display: grid; min-height: 180px; place-items: center;
  color: oklch(65% 0.02 245); border: 1px dashed oklch(45% 0.02 250 / 0.18);
  border-radius: var(--radius-sm);
}
.heat-empty { grid-column: 1 / -1; }

/* ----- Footer ----- */
.screen-footer {
  margin-top: var(--space-sm); font-size: 11px;
  color: oklch(60% 0.02 245);
}

/* ----- Responsive ----- */
@media (max-width: 1400px) {
  .alert-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 1280px) {
  .metric-grid, .screen-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .panel-map, .panel-wide { grid-column: span 2; grid-row: auto; }
  .alert-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  .screen-shell { padding: var(--space-sm); }
  .screen-header, .screen-footer { flex-direction: column; align-items: flex-start; }
  .screen-header h1 { font-size: 24px; }
  .screen-actions, .metric-grid, .screen-grid, .heat-grid, .alert-grid {
    width: 100%; grid-template-columns: 1fr;
  }
  .panel-map, .panel-wide { grid-column: auto; }
  .alert-header { flex-direction: column; align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .metric-risk { animation: none; }
  .kicker-dot { animation: none; }
  .heat-cell, .alert-row { animation: none; opacity: 1; }
}
</style>
