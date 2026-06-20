<template>
  <div class="screen-page">
    <div class="screen-shell">
      <!-- ===== Header ===== -->
      <header class="screen-header">
        <div>
          <div class="screen-kicker">
            数据结构课程 · 管理员大屏
          </div>
          <h1>数据结构课程实验分析大屏</h1>
        </div>
        <div class="screen-actions">
          <div class="screen-time">
            <span>{{ currentDate }}</span>
            <strong>{{ currentTime }}</strong>
          </div>
          <button class="screen-button screen-button-ghost" @click="backToAdmin">返回后台</button>
          <button class="screen-button" :disabled="loading" @click="loadScreenData">
            <span>{{ loading ? '刷新中' : '刷新' }}</span>
          </button>
        </div>
      </header>

      <!-- ===== 1. 数据结构课程总览 ===== -->
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

      <!-- ===== 2~6. 主体分析模块 ===== -->
      <main class="screen-grid">
        <!-- 2. 班级学情对比 -->
<!--        <section class="panel">-->
<!--          <div class="panel-title">-->
<!--            <span>班级学情对比</span>-->
<!--            <small>完成率、均分与低分风险对照</small>-->
<!--          </div>-->
<!--          <div class="class-summary-grid">-->
<!--            <div class="class-summary-item">-->
<!--              <span>覆盖班级</span>-->
<!--              <strong>{{ classSummary.classCount }}</strong>-->
<!--            </div>-->
<!--            <div class="class-summary-item">-->
<!--              <span>平均完成率</span>-->
<!--              <strong>{{ classSummary.avgCompletion }}%</strong>-->
<!--            </div>-->
<!--            <div class="class-summary-item">-->
<!--              <span>班级均分</span>-->
<!--              <strong>{{ classSummary.avgScore || '-' }}</strong>-->
<!--            </div>-->
<!--            <div class="class-summary-item">-->
<!--              <span>风险班级</span>-->
<!--              <strong>{{ classSummary.riskClassCount }}</strong>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="heat-grid">-->
<!--            <div-->
<!--              v-for="(item, idx) in classHeat"-->
<!--              :key="item.name"-->
<!--              class="heat-cell"-->
<!--              :style="{ '&#45;&#45;level': item.level, '&#45;&#45;i': idx }"-->
<!--            >-->
<!--              <div>-->
<!--                <strong>{{ item.name }}</strong>-->
<!--                <span>{{ item.teacherName || '未绑定教师' }} · {{ item.studentCount || 0 }} 人</span>-->
<!--              </div>-->
<!--              <div class="heat-right">-->
<!--                <b>{{ item.avgScore || 0 }}</b>-->
<!--                <span>完成率 {{ item.completionRate }}% · 低分率 {{ item.lowScoreRate }}%</span>-->
<!--                <span class="heat-bar-wrap">-->
<!--                  <span class="heat-bar" :style="{ width: item.completionRate + '%' }"></span>-->
<!--                </span>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div v-if="!classHeat.length" class="empty-state heat-empty">暂无班级学情数据</div>-->
<!--          </div>-->
<!--        </section>-->

        <!-- 3. 知识点掌握热力图 -->
<!--        <section class="panel panel-full">-->
<!--          <div class="panel-title">-->
<!--            <span>知识点掌握热力图</span>-->
<!--            <small>按班级与实验任务映射掌握度</small>-->
<!--          </div>-->
<!--          <div ref="completionChartRef" class="chart chart-heat"></div>-->
<!--        </section>-->

        <!-- 4~5. 知识点覆盖 + 难度完成情况（等分两列） -->
<!--        <div class="split-row">-->
<!--          <section class="panel">-->
<!--            <div class="panel-title">-->
<!--              <span>知识点覆盖分析</span>-->
<!--              <small>按实验覆盖率分层统计</small>-->
<!--            </div>-->
<!--            <div ref="scoreChartRef" class="chart"></div>-->
<!--          </section>-->

<!--          <section class="panel">-->
<!--            <div class="panel-title">-->
<!--              <span>实验任务难度与完成情况</span>-->
<!--              <small>任务难度指数与完成率联合分析</small>-->
<!--            </div>-->
<!--            <div ref="stageChartRef" class="chart"></div>-->
<!--          </section>-->
<!--        </div>-->

        <!-- 6. 高频未掌握知识点 -->
        <section class="panel panel-full">
          <div class="panel-title">
            <span>高频未掌握知识点</span>
            <small>结合实验、提交成绩与题目关键词定位薄弱知识点</small>
          </div>
          <div ref="classCompareChartRef" class="chart chart-wide"></div>
        </section>
      </main>

      <!-- ===== 7. 风险学生 / 风险班级预警 ===== -->
      <section class="alert-center">
        <div class="alert-header">
          <div class="alert-title-row">
            <span class="alert-title">风险学生 / 风险班级预警</span>
<!--            <span class="alert-badge">{{ totalAlerts }} 项关注</span>-->
          </div>
          <small>结合低分、低完成率、待评分与同步异常，快速定位需要介入的对象</small>
        </div>
        <div class="alert-grid">
          <!-- 风险学生 -->
          <div class="alert-card alert-danger">
            <div class="alert-card-head">
              <span class="alert-card-label">风险学生</span>
              <span class="alert-threshold">最近 20 条 · 风险指数</span>
            </div>
            <div ref="riskStudentListRef" class="alert-list alert-list-scroll">
              <div
                v-for="(item, idx) in riskStudentsRows"
                :key="'rs-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.className || '-' }} · 均分 {{ item.avgScore }}</small>
                </div>
                <span class="alert-value danger">{{ item.displayRiskScore }}</span>
              </div>
              <div v-if="!riskStudentsRows.length" class="alert-empty">暂无风险学生</div>
            </div>
          </div>

          <!-- 风险班级 -->
          <div class="alert-card alert-warn">
            <div class="alert-card-head">
              <span class="alert-card-label">风险班级</span>
              <span class="alert-threshold">低完成率 / 低分率</span>
            </div>
            <div class="alert-list">
              <div
                v-for="(item, idx) in riskClassesTop5"
                :key="'rc-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.teacherName || '-' }} · 均分 {{ item.avgScore }}</small>
                </div>
                <span class="alert-value warn">{{ item.displayRiskScore }}</span>
              </div>
              <div v-if="!riskClassesTop5.length" class="alert-empty">暂无风险班级</div>
            </div>
          </div>

          <!-- Top5 3: 鏈瘎鍒嗗疄楠?-->
          <div class="alert-card alert-info-alt">
            <div class="alert-card-head">
              <span class="alert-card-label">评分实验排行</span>
              <span class="alert-threshold">均分高到低</span>
            </div>
            <div ref="scoredExperimentListRef" class="alert-list alert-list-scroll">
              <div
                v-for="(item, idx) in scoredExperimentRows"
                :key="'se-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.name }}</strong>
                  <small>提交 {{ item.totalCount || 0 }} 份 · 待评 {{ item.ungradedCount || 0 }}</small>
                </div>
                <span class="alert-value info">{{ item.avgScore.toFixed(1) }}</span>
              </div>
              <div v-if="!scoredExperimentRows.length" class="alert-empty">暂无评分实验</div>
            </div>
          </div>

          <!-- Top5 4: 鍚屾寮傚父 -->
          <div class="alert-card alert-critical">
            <div class="alert-card-head">
              <span class="alert-card-label">实时提交动态</span>
              <span class="alert-threshold">最近 20 条</span>
            </div>
            <div ref="recentSubmissionListRef" class="alert-list alert-list-scroll">
              <div
                v-for="(item, idx) in recentSubmissionRows"
                :key="'sub-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.studentName || item.userName || item.username || '未知学生' }}</strong>
                  <small>{{ item.className || item.class_name || '-' }} · {{ item.experimentName || item.experiment_name || item.name || '实验' }}</small>
                </div>
                <span class="alert-value critical">{{ formatSubmitTime(item.submitTime) }}</span>
              </div>
              <div v-if="!recentSubmissionRows.length" class="alert-empty">暂无提交记录</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== Footer ===== -->
      <footer class="screen-footer">
        <span>数据来源：课程实验列表、班级信息、学生提交、评分结果与管理员概览统计</span>
        <span v-if="lastUpdated">最近更新：{{ lastUpdated }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import api from '../../api'
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
const riskStudentListRef = ref(null)
const recentSubmissionListRef = ref(null)
const scoredExperimentListRef = ref(null)
let completionChart = null
let scoreChart = null
let stageChart = null
let classCompareChart = null
let clockTimer = null
let riskStudentScrollTimer = null
let recentSubmissionScrollTimer = null
let scoredExperimentScrollTimer = null


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

const knowledgeHeatDimensions = computed(() => ({
  classes: classProfiles.value.slice(0, 8),
  experiments: experimentStats.value.slice(0, 8)
}))

const knowledgeHeatmapData = computed(() => {
  const classRows = knowledgeHeatDimensions.value.classes
  const experimentRows = knowledgeHeatDimensions.value.experiments
  return classRows.flatMap((cls, classIndex) =>
    experimentRows.map((exp, experimentIndex) => {
      const related = submissions.value.filter(item => {
        const itemClassId = item.classId || item.class_id
        const itemClassName = item.className || item.class_name || item.classname
        const itemExperimentId = item.experimentId || item.experiment_id
        const matchClass = String(itemClassId || '') === String(cls.id || '') || itemClassName === cls.name
        const matchExperiment = String(itemExperimentId || '') === String(exp.id)
        return matchClass && matchExperiment
      })
      const scores = related
        .map(item => Number(item.score))
        .filter(item => Number.isFinite(item) && item > 0)
      const value = scores.length
        ? Math.round(average(scores))
        : Math.min(100, Math.round((related.filter(isCompleted).length / Math.max(1, cls.studentCount || 1)) * 100))
      return [experimentIndex, classIndex, value]
    })
  )
})

const coverageAnalysis = computed(() => {
  const buckets = [
    { name: '高覆盖', value: 0, color: '#22c55e' },
    { name: '中覆盖', value: 0, color: '#38bdf8' },
    { name: '待提升', value: 0, color: '#f59e0b' },
    { name: '薄弱点', value: 0, color: '#fb7185' }
  ]
  experimentStats.value.forEach(item => {
    if (item.completionRate >= 85) buckets[0].value += 1
    else if (item.completionRate >= 70) buckets[1].value += 1
    else if (item.completionRate >= 50) buckets[2].value += 1
    else buckets[3].value += 1
  })
  return buckets.filter(item => item.value > 0)
})

const difficultyRows = computed(() => {
  return experimentStats.value
    .map(item => {
      const avg = Number(item.avgScore || 0)
      const difficultyScore = Math.round(((100 - item.completionRate) * 0.55) + ((100 - avg) * 0.45))
      return {
        ...item,
        difficultyScore: Math.max(0, Math.min(100, difficultyScore))
      }
    })
    .sort((a, b) => b.difficultyScore - a.difficultyScore)
    .slice(0, 8)
})

const weakKnowledgeRows = computed(() => {
  const rows = new Map()

  experimentStats.value.forEach(item => {
    const tags = resolveKnowledgeTags(item.knowledgePoint || item.knowledge_point || item.name)
    if (!tags.length) return

    const avg = Number(item.avgScore || 0)
    const lowScoreWeight = avg > 0 ? Math.max(0, 70 - avg) * 0.8 : 0
    const lowCompletionWeight = Math.max(0, 85 - Number(item.completionRate || 0)) * 0.35
    const difficultyScore = Math.round(((100 - Number(item.completionRate || 0)) * 0.55) + ((100 - avg) * 0.45))
    const difficultyWeight = Math.max(0, difficultyScore - 45) * 0.5
    const weight = lowScoreWeight + lowCompletionWeight + difficultyWeight
    if (weight <= 0) return

    tags.forEach(tag => addKnowledgeWeakness(rows, tag, weight, {
      experiment: item.name,
      score: avg,
      completionRate: item.completionRate,
      source: '实验表现'
    }))
  })

  submissions.value.forEach(item => {
    const score = Number(item.score)
    if (!Number.isFinite(score) || score <= 0 || score >= 70) return

    const text = [
      item.knowledgePoint,
      item.knowledge_point,
      item.problemKnowledge,
      item.problem_knowledge,
      item.problemTitle,
      item.problem_title,
      item.title,
      item.experimentName,
      item.experiment_name,
      item.name
    ].filter(Boolean).join(' ')
    const tags = resolveKnowledgeTags(text)
    if (!tags.length) return

    const weight = score < 60 ? 24 + (60 - score) * 0.7 : 10 + (70 - score) * 0.4
    tags.forEach(tag => addKnowledgeWeakness(rows, tag, weight, {
      student: item.studentName || item.userName || item.username,
      className: item.className || item.class_name || item.classname,
      experiment: item.experimentName || item.experiment_name || item.name,
      score,
      source: '低分提交'
    }))
  })

  const rankedRows = Array.from(rows.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const maxValue = rankedRows[0]?.value || 0

  return rankedRows.map(item => ({
    ...item,
    rawValue: Math.round(item.value),
    value: maxValue > 0 ? Math.max(1, Math.round((item.value / maxValue) * 100)) : 0,
    detail: buildKnowledgeDetail(item)
  }))
})

/* ---------- 棰勮涓績 Top5 鏁版嵁 ---------- */
// 数据优先级：后端 riskMetrics API -> 前端 computed 计算；没有真实数据时显示空态。

const scoredExperimentRows = computed(() =>
  experimentStats.value
    .filter(item => hasText(item.name) && Number(item.avgScore) > 0)
    .map(item => ({
      ...item,
      avgScore: Number(item.avgScore),
      totalCount: Number(item.totalCount || 0),
      ungradedCount: Number(item.ungradedCount || 0)
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
)

const recentSubmissionRows = computed(() =>
  submissions.value
    .filter(item => hasText(item.submitTime) && hasText(item.studentName || item.userName || item.username) && hasText(item.experimentName || item.experiment_name || item.name) && hasText(item.className || item.class_name || item.classname))
    .slice()
    .sort((a, b) => Date.parse(b.submitTime) - Date.parse(a.submitTime))
    .slice(0, 20)
)

function normalizeRiskScoreRows(rows) {
  const maxRiskScore = rows[0]?.riskScore || 0
  return rows.map(item => ({
    ...item,
    rawRiskScore: item.riskScore,
    displayRiskScore: maxRiskScore > 0
      ? ((item.riskScore / maxRiskScore) * 100).toFixed(1)
      : '0.0'
  }))
}

const riskStudentsRows = computed(() => {
  const groups = new Map()
  submissions.value.forEach((item, index) => {
    if (!hasText(item.studentName || item.userName || item.username)) return
    const studentKey = item.studentId || item.student_id || item.userId || item.user_id || `unknown-${index}`
    const current = groups.get(String(studentKey)) || {
      id: studentKey,
      name: item.studentName || item.userName || item.username || `学生${groups.size + 1}`,
      className: item.className || item.class_name || '-',
      scores: [],
      completedCount: 0,
      totalCount: 0,
      lastSubmitTime: null
    }
    current.totalCount += 1
    if (isCompleted(item)) current.completedCount += 1
    const score = Number(item.score)
    if (Number.isFinite(score) && score > 0) current.scores.push(score)
    const submitTime = Date.parse(item.submitTime || item.date || '')
    if (!Number.isNaN(submitTime) && (!current.lastSubmitTime || submitTime > current.lastSubmitTime)) {
      current.lastSubmitTime = submitTime
    }
    groups.set(String(studentKey), current)
  })
  const rows = Array.from(groups.values())
    .map(item => {
      const avg = Math.round(average(item.scores) * 10) / 10
      const minScore = item.scores.length ? Math.min(...item.scores) : 0
      const lowScoreCount = item.scores.filter(score => score < 60).length
      const missingCount = Math.max(0, item.totalCount - item.completedCount)
      const avgPenalty = avg > 0 ? Math.max(0, 75 - avg) * 1.15 : 18
      const minScorePenalty = minScore > 0 ? Math.max(0, 60 - minScore) * 0.9 : 12
      const staleDays = item.lastSubmitTime ? Math.max(0, (Date.now() - item.lastSubmitTime) / (1000 * 60 * 60 * 24)) : 14
      const recencyPenalty = Math.min(22, staleDays * 1.8)
      const riskScore =
        lowScoreCount * 24
        + missingCount * 14
        + avgPenalty
        + minScorePenalty
        + recencyPenalty
      return {
        ...item,
        avgScore: avg || 0,
        minScore,
        lastSubmitTime: item.lastSubmitTime,
        riskScore
      }
    })
    .filter(item => item.riskScore > 0)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 20)
  return normalizeRiskScoreRows(rows)
})

const riskClassesTop5 = computed(() => {
  const rows = classProfiles.value
    .map(item => {
      const riskScore = Math.round((100 - item.completionRate) * 0.45 + item.lowScoreRate * 0.4 + Math.max(0, 60 - Number(item.avgScore || 0)) * 1.2)
      return {
        ...item,
        riskScore
      }
    })
    .filter(item => item.riskScore > 0)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
  return normalizeRiskScoreRows(rows)
})

/* ---------- Lifecycle ---------- */
onMounted(() => {
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
  startAlertAutoScroll()
  window.addEventListener('resize', resizeCharts)
  loadScreenData()
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  stopAlertAutoScroll()
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
    const submissionRows = normalizeSubmissionRows(normalizeList(unwrapSettled(submissionRes, []), ['data', 'submissions']))
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
  const classRows = knowledgeHeatDimensions.value.classes
  const experimentRows = knowledgeHeatDimensions.value.experiments
  completionChart.setOption({
    title: emptyChartTitle(classRows.length && experimentRows.length),
    tooltip: {
      position: 'top',
      formatter(params) {
        const [experimentIndex, classIndex, value] = params.data || []
        const classItem = classRows[classIndex]
        const experimentItem = experimentRows[experimentIndex]
        if (!classItem || !experimentItem) return ''
        return `<b style="font-size:14px">${classItem.name}</b><br/>`
          + `实验任务：${experimentItem.name}<br/>`
          + `掌握度：<b>${value}%</b>`
      }
    },
    grid: { left: 110, right: 24, top: 12, bottom: 56 },
    xAxis: {
      type: 'category',
      data: experimentRows.map(item => item.name),
      axisLabel: { ...chartText(11), interval: 0, rotate: 30, overflow: 'truncate', ellipsis: '...', width: 70 },
      splitArea: { show: true },
      axisLine: chartLine()
    },
    yAxis: {
      type: 'category',
      data: classRows.map(item => item.name),
      axisLabel: { ...chartText(11), overflow: 'truncate', ellipsis: '...', width: 96 },
      splitArea: { show: true },
      axisLine: chartLine()
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      textStyle: chartText(10),
      inRange: { color: ['#1e293b', '#0ea5e9', '#22c55e', '#f59e0b'] },
      show: false
    },
    series: [{
      type: 'heatmap',
      data: knowledgeHeatmapData.value,
      label: { show: true, color: '#dce8f7', fontSize: 10, formatter: ({ value }) => `${value[2]}` },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(15, 23, 42, 0.45)' } }
    }]
  })
}

function renderScoreChart() {
  if (!scoreChartRef.value) return
  scoreChart = ensureChart(scoreChart, scoreChartRef.value)
  const data = coverageAnalysis.value.map(item => ({
    name: item.name,
    value: item.value,
    itemStyle: { color: item.color }
  }))
  scoreChart.setOption({
    title: emptyChartTitle(data.length),
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: chartText(11) },
    series: [{ type: 'pie', radius: ['42%', '70%'], center: ['50%', '42%'], itemStyle: { borderColor: '#0a1628', borderWidth: 3 }, label: { color: '#dce8f7', formatter: '{b}\n{c}项' }, data }]
  })
}

function renderStageChart() {
  if (!stageChartRef.value) return
  stageChart = ensureChart(stageChart, stageChartRef.value)
  const rows = difficultyRows.value
  stageChart.setOption({
    color: ['#f97316', '#2dd4bf'],
    title: emptyChartTitle(rows.length),
    tooltip: {
      trigger: 'axis',
      formatter(params) {
        const row = rows[params[0]?.dataIndex]
        if (!row) return ''
        return `<b style="font-size:14px">${row.name}</b><br/>`
          + `难度指数：<b>${row.difficultyScore}</b><br/>`
          + `完成率：${row.completionRate}%<br/>`
          + `平均分：${row.avgScore || 0}`
      }
    },
    legend: { top: 0, right: 10, textStyle: chartText(11) },
    grid: { left: 42, right: 36, top: 36, bottom: 62 },
    xAxis: {
      type: 'category',
      data: rows.map(item => shortName(item.name)),
      axisLabel: { ...chartText(11), rotate: 30, width: 80, overflow: 'truncate', ellipsis: '...', interval: 0 },
      axisLine: chartLine(),
      axisTick: { alignWithLabel: true, lineStyle: { color: 'rgba(148,163,184,0.3)' } }
    },
    yAxis: [
      { type: 'value', max: 100, axisLabel: chartText(11), splitLine: chartSplitLine() },
      { type: 'value', max: 100, axisLabel: { ...chartText(11), formatter: '{value}%' }, splitLine: { show: false } }
    ],
    series: [
      { name: '难度指数', type: 'bar', barWidth: 18, data: rows.map(item => item.difficultyScore) },
      { name: '完成率', type: 'line', yAxisIndex: 1, smooth: true, symbolSize: 7, data: rows.map(item => item.completionRate) }
    ]
  })
}

function renderClassCompareChart() {
  if (!classCompareChartRef.value) return
  classCompareChart = ensureChart(classCompareChart, classCompareChartRef.value)
  const rows = weakKnowledgeRows.value
  classCompareChart.setOption({
    color: ['#f59e0b'],
    title: emptyChartTitle(rows.length),
    tooltip: {
      trigger: 'item',
      formatter: params => `${params.name}<br/>未掌握度：<b>${params.value}%</b><br/>原始指数：${rows[params.dataIndex]?.rawValue || 0}<br/>${rows[params.dataIndex]?.detail || ''}`
    },
    grid: { left: 96, right: 26, top: 20, bottom: 22 },
    xAxis: { type: 'value', axisLabel: chartText(11), splitLine: chartSplitLine() },
    yAxis: { type: 'category', data: rows.map(item => item.name), axisLabel: chartText(11), axisLine: chartLine() },
    series: [
      { type: 'bar', barWidth: 18, label: { show: true, position: 'right', color: '#dce8f7', fontSize: 11, formatter: '{c}' }, data: rows.map(item => item.value) }
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

function startAlertAutoScroll() {
  stopAlertAutoScroll()
  riskStudentScrollTimer = setInterval(() => scrollAlertList(riskStudentListRef.value), 3000)
  recentSubmissionScrollTimer = setInterval(() => scrollAlertList(recentSubmissionListRef.value), 3000)
  scoredExperimentScrollTimer = setInterval(() => scrollAlertList(scoredExperimentListRef.value), 3000)
}

function stopAlertAutoScroll() {
  if (riskStudentScrollTimer) clearInterval(riskStudentScrollTimer)
  if (recentSubmissionScrollTimer) clearInterval(recentSubmissionScrollTimer)
  if (scoredExperimentScrollTimer) clearInterval(scoredExperimentScrollTimer)
  riskStudentScrollTimer = null
  recentSubmissionScrollTimer = null
  scoredExperimentScrollTimer = null
}

function scrollAlertList(el) {
  if (!el || el.scrollHeight <= el.clientHeight) return
  const firstRow = el.querySelector('.alert-row')
  const step = firstRow ? firstRow.offsetHeight + 8 : 48
  const nextTop = el.scrollTop + step
  const reachedBottom = nextTop + el.clientHeight >= el.scrollHeight - 2
  el.scrollTo({ top: reachedBottom ? 0 : nextTop, behavior: 'smooth' })
}

function formatSubmitTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const pad = num => String(num).padStart(2, '0')
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function normalizeSubmissionRows(rows) {
  return rows
    .map(item => ({
      ...item,
      studentName: item.studentName || item.userName || item.username || '',
      className: item.className || item.class_name || item.classname || '',
      experimentName: item.experimentName || item.experiment_name || item.name || '',
      submitTime: item.submitTime || item.date || null
    }))
}

function resolveKnowledgeTags(text) {
  const source = String(text || '').trim()
  if (!source) return []

  const normalized = source.toLowerCase()
  const keywordMap = [
    { tag: '线性表', keywords: ['线性表', 'linear list', '顺序表', '数组'] },
    { tag: '链表', keywords: ['链表', 'linked list', '单链表', '双链表'] },
    { tag: '栈', keywords: ['栈', 'stack'] },
    { tag: '队列', keywords: ['队列', 'queue', '循环队列'] },
    { tag: '串', keywords: ['串', '字符串', 'string', 'kmp', '模式匹配'] },
    { tag: '树', keywords: ['树', 'tree', '树结构'] },
    { tag: '二叉树', keywords: ['二叉树', 'binary tree'] },
    { tag: '遍历', keywords: ['遍历', '前序', '中序', '后序', '层序'] },
    { tag: '图', keywords: ['图', 'graph', '邻接表', '邻接矩阵'] },
    { tag: '搜索', keywords: ['搜索', 'dfs', 'bfs', '深度优先', '广度优先'] },
    { tag: '排序', keywords: ['排序', 'sort', '快排', '归并', '堆排', '冒泡'] },
    { tag: '查找', keywords: ['查找', 'search', '二分', 'hash', '散列'] },
    { tag: '递归', keywords: ['递归', 'recursive'] },
    { tag: '动态规划', keywords: ['动态规划', 'dp'] }
  ]

  const matched = keywordMap
    .filter(item => item.keywords.some(keyword => normalized.includes(keyword.toLowerCase())))
    .map(item => item.tag)

  if (matched.length) return Array.from(new Set(matched))

  return source
    .split(/[、,，/|；;\s]+/)
    .map(item => item.trim())
    .filter(item => item.length >= 2 && item.length <= 12)
    .slice(0, 3)
}

function addKnowledgeWeakness(bucket, tag, value, sample) {
  if (!hasText(tag) || !Number.isFinite(value) || value <= 0) return
  const current = bucket.get(tag) || {
    name: tag,
    value: 0,
    experiments: new Set(),
    classes: new Set(),
    students: new Set(),
    samples: []
  }

  current.value += value
  if (sample?.experiment) current.experiments.add(sample.experiment)
  if (sample?.className) current.classes.add(sample.className)
  if (sample?.student) current.students.add(sample.student)
  if (sample && current.samples.length < 3) current.samples.push(sample)

  bucket.set(tag, current)
}

function buildKnowledgeDetail(item) {
  const parts = [
    `关联实验 ${item.experiments?.size || 0} 个`,
    `涉及班级 ${item.classes?.size || 0} 个`,
    `关联学生 ${item.students?.size || 0} 人`
  ]
  const sample = item.samples?.[0]
  if (sample?.experiment) {
    parts.push(`样本：${sample.experiment}${sample.score ? `，分数 ${sample.score}` : ''}`)
  }
  return parts.join('<br/>')
}

function hasText(value) {
  return String(value ?? '').trim().length > 0
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
   Design: Dark Dashboard — College Admin View
   Palette: oklch-tinted deep navy + semantic accents
   Impeccable principles:
     - Tinted neutrals via --surf-0/1/2/3, not transparency hacks
     - 4pt spacing scale
     - transform/opacity only animations
     - Staggered entrance with --i
     - color-mix for tinted alert backgrounds
============================================================ */

/* ----- Design Tokens ----- */
.screen-page {
  --surf-0: oklch(12% 0.018 250);
  --surf-1: oklch(15% 0.020 250);
  --surf-2: oklch(18% 0.022 250);
  --surf-3: oklch(22% 0.025 250);

  --text-1: oklch(96% 0.01 250);
  --text-2: oklch(80% 0.02 245);
  --text-3: oklch(65% 0.02 245);
  --text-4: oklch(50% 0.02 245);

  --teal:   oklch(65% 0.14 175);
  --sky:    oklch(65% 0.12 230);
  --amber:  oklch(65% 0.16 80);
  --rose:   oklch(55% 0.20 15);
  --violet: oklch(55% 0.18 310);
  --green:  oklch(65% 0.18 145);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  --radius: 10px;
  --radius-sm: 6px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  position: fixed; inset: 0; z-index: 5000;
  width: 100vw; height: 100vh; height: 100dvh;
  overflow: auto;
  color: var(--text-2);
  background: var(--surf-0);
  font-family: system-ui, -apple-system, sans-serif;
}

.screen-shell {
  min-height: 100vh; min-height: 100dvh;
  padding: var(--space-5);
  background:
    radial-gradient(ellipse 60% 40% at 18% 12%, oklch(35% 0.12 185 / 0.12), transparent),
    radial-gradient(ellipse 50% 35% at 82% 8%, oklch(35% 0.14 65 / 0.08), transparent),
    radial-gradient(ellipse 70% 50% at 50% 85%, oklch(28% 0.10 255 / 0.06), transparent),
    var(--surf-0);
}

/* ----- Header ----- */
.screen-header, .screen-footer {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
}

.screen-kicker {
  display: flex; align-items: center; gap: 8px;
  color: var(--sky); font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.screen-kicker::before {
  content: '';
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--teal);
  animation: live-dot 2s ease-in-out infinite;
}
@keyframes live-dot {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50%      { opacity: 1;   transform: scale(1); }
}

.screen-header h1 {
  margin: var(--space-1) 0 0;
  color: var(--text-1); font-size: 30px; font-weight: 800;
  letter-spacing: -0.02em;
}

.screen-actions { display: flex; align-items: center; gap: var(--space-3); }

.screen-time {
  display: grid; gap: 2px; text-align: right;
  color: var(--text-3); font-size: 12px;
}
.screen-time strong {
  color: var(--text-1); font-size: 22px; font-variant-numeric: tabular-nums;
}

.screen-button {
  display: inline-flex; align-items: center; gap: 8px;
  height: 38px; padding: 0 14px;
  border: 1px solid oklch(65% 0.10 200 / 0.28);
  border-radius: var(--radius-sm);
  color: var(--text-2); background: var(--surf-2);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background 150ms var(--ease-out), border-color 150ms var(--ease-out);
}
.screen-button:hover { background: var(--surf-3); border-color: oklch(65% 0.10 200 / 0.45); }
.screen-button:disabled { cursor: progress; opacity: 0.7; }
.screen-button-ghost {
  border-color: oklch(55% 0.02 245 / 0.22);
  color: var(--text-3); background: var(--surf-1);
}

/* ----- Metric Grid ----- */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.metric-tile {
  position: relative; overflow: hidden;
  min-height: 120px; padding: var(--space-4);
  border: 1px solid oklch(50% 0.02 250 / 0.16);
  border-radius: var(--radius);
  background: var(--surf-1);
  backdrop-filter: blur(4px);
  transition: border-color 200ms var(--ease-out);
}
.metric-tile:hover { border-color: oklch(60% 0.06 210 / 0.30); }

.metric-tile strong {
  display: flex; align-items: baseline; gap: 8px;
  margin: var(--space-3) 0 var(--space-2);
  color: var(--text-1); font-size: 38px; font-weight: 800; line-height: 1;
}

.metric-label {
  color: var(--text-3); font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em;
}

.metric-tile small {
  display: block; color: var(--text-4); font-size: 11px;
}

/* Risk Badge */
.risk-badge {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 11px; font-weight: 700; line-height: 1.4;
}
.risk-warn    { color: var(--amber); background: color-mix(in oklch, var(--amber) 15%, var(--surf-1)); }
.risk-danger  { color: var(--rose);  background: color-mix(in oklch, var(--rose)  15%, var(--surf-1)); }

/* Progress Bar */
.metric-progress {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--surf-3);
}
.metric-progress-bar { height: 100%; transition: width 400ms var(--ease-out); }
.progress-ok    { background: var(--green); }
.progress-warn  { background: var(--amber); }
.progress-danger { background: var(--rose); }

/* Metric Tones — top colored border */
.metric-blue   { border-top: 3px solid var(--sky); }
.metric-green  { border-top: 3px solid var(--green); }
.metric-amber  { border-top: 3px solid var(--amber); }
.metric-red    { border-top: 3px solid var(--rose); }
.metric-risk   { animation: metric-pulse 3s ease-in-out infinite; }
@keyframes metric-pulse {
  0%, 100% { border-color: oklch(50% 0.02 250 / 0.16); }
  50%      { border-color: oklch(55% 0.12 15 / 0.35); }
}

/* ----- Main Screen Grid ----- */
.screen-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1.1fr) minmax(260px, 1fr) minmax(260px, 1fr);
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.panel {
  min-width: 0; min-height: 280px; padding: var(--space-4);
  border: 1px solid oklch(50% 0.02 250 / 0.14);
  border-radius: var(--radius);
  background: var(--surf-1);
  backdrop-filter: blur(4px);
  transition: border-color 200ms var(--ease-out);
}
.panel:hover { border-color: oklch(60% 0.04 235 / 0.25); }

.panel-full { grid-column: 1 / -1; }

.split-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  grid-column: 1 / -1;
}
.split-row .panel { min-height: 260px; }

.panel-title {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-3);
}
.panel-title span {
  color: var(--text-1); font-size: 16px; font-weight: 800;
}
.panel-title small { color: var(--text-3); font-size: 13px; }

.chart { width: 100%; height: 220px; }
.chart-wide { height: 240px; }
.chart-heat { height: 380px; }

/* ----- Heat Grid ----- */
.class-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.class-summary-item {
  min-height: 64px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid oklch(50% 0.02 250 / 0.12);
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--surf-0) 78%, var(--surf-2));
}

.class-summary-item span {
  display: block;
  color: var(--text-3);
  font-size: 12px;
  font-weight: 600;
}

.class-summary-item strong {
  display: block;
  margin-top: 6px;
  color: var(--text-1);
  font-size: 24px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.heat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: var(--space-2);
  max-height: 238px;
  overflow: auto;
  padding-right: 2px;
}

.heat-cell {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);
  min-height: 70px; padding: var(--space-3);
  border: 1px solid oklch(60% 0.10 180 / calc(0.10 + var(--level) * 0.25));
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--teal) calc(6% + var(--level) * 18%), var(--surf-1));
  transition: transform 150ms var(--ease-out), border-color 150ms var(--ease-out);
  animation: cell-enter 350ms var(--ease-out) calc(var(--i, 0) * 40ms) both;
}
@keyframes cell-enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.heat-cell:hover { transform: translateY(-1px); }
.heat-cell strong { display: block; color: var(--text-1); font-size: 14px; font-weight: 700; }
.heat-cell span   { display: block; margin-top: 3px; color: var(--text-3); font-size: 12px; }

.heat-right { text-align: right; }
.heat-right b { color: var(--teal); font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }

.heat-bar-wrap {
  display: block; margin-top: var(--space-1); width: 48px; height: 3px;
  border-radius: 2px; background: var(--surf-3); overflow: hidden;
}
.heat-bar { display: block; height: 100%; border-radius: 2px; background: var(--teal); transition: width 500ms var(--ease-out); }

/* ----- Alert Center ----- */
.alert-center {
  margin-top: var(--space-3);
  border: 1px solid oklch(48% 0.03 15 / 0.18);
  border-radius: var(--radius);
  background: var(--surf-1);
  padding: var(--space-4);
  backdrop-filter: blur(4px);
}

.alert-header {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
  margin-bottom: var(--space-4); padding-bottom: var(--space-3);
  border-bottom: 1px solid oklch(50% 0.02 250 / 0.12);
}

.alert-title-row { display: flex; align-items: center; gap: 10px; }

.alert-title {
  color: var(--text-1); font-size: 17px; font-weight: 800; letter-spacing: -0.01em;
}

.alert-badge {
  display: inline-block; padding: 2px 10px; border-radius: 12px;
  background: color-mix(in oklch, var(--rose) 20%, var(--surf-1));
  color: var(--rose); font-size: 12px; font-weight: 700;
}

.alert-header small { color: var(--text-3); font-size: 12px; }

.alert-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
}

/* Alert Cards — tinted backgrounds via color-mix */
.alert-card {
  position: relative;
  border-right: 1px solid oklch(40% 0.02 250 / 0.10);
  padding: var(--space-3) var(--space-4);
  transition: background 150ms var(--ease-out);
}
.alert-card:last-child { border-right: none; }

.alert-danger  {
  border-top: 3px solid var(--rose);
  background: color-mix(in oklch, var(--rose) 8%, var(--surf-1));
}
.alert-warn    {
  border-top: 3px solid var(--amber);
  background: color-mix(in oklch, var(--amber) 8%, var(--surf-1));
}
.alert-info-alt {
  border-top: 3px solid var(--sky);
  background: color-mix(in oklch, var(--sky) 8%, var(--surf-1));
}
.alert-critical {
  border-top: 3px solid var(--violet);
  background: color-mix(in oklch, var(--violet) 8%, var(--surf-1));
}

.alert-card:hover { filter: brightness(1.08); }

.alert-card-head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  margin-bottom: var(--space-2); padding-bottom: var(--space-2);
  border-bottom: 1px solid oklch(40% 0.02 250 / 0.08);
}

.alert-card-label {
  color: var(--text-2); font-size: 14px; font-weight: 700;
}

.alert-threshold {
  color: var(--text-4); font-size: 11px; font-weight: 600;
  padding: 1px 6px; border-radius: 3px;
  background: var(--surf-3);
}

/* Alert List */
.alert-list {
  display: flex; flex-direction: column; gap: var(--space-2);
}

.alert-list-scroll {
  max-height: 224px;
  overflow: auto;
  padding-right: 2px;
  scroll-behavior: smooth;
}

.alert-row {
  display: flex; align-items: center; gap: 10px;
  padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--surf-0) 85%, var(--surf-2));
  transition: background 150ms var(--ease-out);
  animation: cell-enter 300ms var(--ease-out) calc(var(--i, 0) * 60ms) both;
}
.alert-row:hover { background: var(--surf-2); }

.alert-rank {
  width: 20px; height: 20px; display: grid; place-items: center;
  border-radius: 4px; font-size: 11px; font-weight: 800;
  color: var(--text-4); background: var(--surf-3);
}
.rank-top { color: #000; background: var(--amber); }

.alert-row-info { flex: 1; min-width: 0; }
.alert-row-info strong {
  display: block; color: var(--text-2); font-size: 13px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.alert-row-info small { display: block; margin-top: 2px; color: var(--text-3); font-size: 12px; }

.alert-value {
  font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap;
}
.alert-value.danger   { color: var(--rose); }
.alert-value.warn     { color: var(--amber); }
.alert-value.info     { color: var(--sky); }
.alert-value.critical { color: var(--violet); }

.alert-empty {
  display: grid; place-items: center; min-height: 60px;
  color: var(--text-4); font-size: 12px;
  border: 1px dashed oklch(40% 0.02 250 / 0.20); border-radius: var(--radius-sm);
}

/* ----- Empty State ----- */
.empty-state {
  display: grid; min-height: 180px; place-items: center;
  color: var(--text-3); border: 1px dashed oklch(45% 0.02 250 / 0.18);
  border-radius: var(--radius-sm);
}

.heat-empty { grid-column: 1 / -1; }

/* ----- Footer ----- */
.screen-footer {
  margin-top: var(--space-3); font-size: 11px;
  color: var(--text-4);
}

/* ----- Responsive ----- */
@media (max-width: 1400px) {
  .alert-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .alert-card:nth-child(2) { border-right: none; }
}
@media (max-width: 1280px) {
  .metric-grid, .screen-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .panel-full, .split-row { grid-column: 1 / -1; }
  .alert-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .alert-card:nth-child(2) { border-right: none; }
}
@media (max-width: 768px) {
  .screen-shell { padding: var(--space-3); }
  .screen-header, .screen-footer { flex-direction: column; align-items: flex-start; }
  .screen-header h1 { font-size: 24px; }
  .screen-actions, .metric-grid, .screen-grid, .heat-grid, .alert-grid {
    width: 100%; grid-template-columns: 1fr;
  }
  .panel-full, .split-row { grid-column: auto; }
  .split-row, .class-summary-grid { grid-template-columns: 1fr; }
  .alert-header { flex-direction: column; align-items: flex-start; }
  .alert-card { border-right: none; }
}

@media (prefers-reduced-motion: reduce) {
  .metric-risk { animation: none; }
  .heat-cell, .alert-row { animation: none; opacity: 1; }
  .screen-kicker::before { animation: none; opacity: 1; }
}
</style>
