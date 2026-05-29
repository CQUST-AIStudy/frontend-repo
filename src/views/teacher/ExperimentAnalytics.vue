<template>
  <div class="exp-analytics">
    <page-header
      title="实验数据分析"
      description="基于 PTA 成绩单的多维分析，包括分数分布、题目得分率、难度系数与区分度。"
    />

    <div class="selector-bar">
      <el-select
        v-if="classPrefixes.length > 1"
        v-model="selectedClass"
        placeholder="选择班级前缀"
        clearable
        style="width: 180px"
        @change="onClassChange"
      >
        <el-option label="全部实验" value="" />
        <el-option
          v-for="prefix in classPrefixes"
          :key="prefix"
          :label="prefix"
          :value="prefix"
        />
      </el-select>

      <el-select
        v-model="selectedExp"
        placeholder="选择实验"
        filterable
        clearable
        style="width: 360px"
        @change="loadAnalytics"
      >
        <el-option
          v-for="exp in experiments"
          :key="exp.experimentId"
          :label="exp.name"
          :value="exp.experimentId"
        />
      </el-select>

      <el-button type="primary" plain @click="toggleComparison">
        {{ showComparison ? '返回单实验分析' : '实验横向对比' }}
      </el-button>

      <el-tag type="info" size="small" class="count-tag">
        {{ activeClassLabel }} / {{ experiments.length }} 个实验
      </el-tag>
    </div>

    <el-alert
      v-if="errorMessage"
      type="error"
      :closable="false"
      show-icon
      class="fallback-alert"
      :title="errorMessage"
    />

    <el-alert
      v-if="filterFallback"
      type="warning"
      :closable="false"
      show-icon
      class="fallback-alert"
      title="当前教学班没有匹配到实验前缀，已自动切换为全部实验。"
    />

    <el-alert
      v-if="scopeDescription && !showComparison"
      type="info"
      :closable="false"
      show-icon
      class="scope-alert"
      :title="scopeTitle"
      :description="scopeDescription"
    />

    <template v-if="showComparison">
      <el-card class="g-card" v-loading="compLoading">
        <template #header>
          <span>实验横向对比</span>
        </template>
        <div v-if="comparisonItems.length" ref="compChartRef" style="height: 340px"></div>
        <el-empty v-else-if="!compLoading" description="暂无可对比的实验数据" />
      </el-card>
    </template>

    <template v-else-if="data && data.overview && selectedExp">
      <div class="kpi-grid">
        <div v-for="item in kpiItems" :key="item.label" class="kpi">
          <div class="kpi-val" :style="{ color: item.color || '#202124' }">{{ item.value }}</div>
          <div class="kpi-label">{{ item.label }}</div>
        </div>
      </div>

      <el-card class="g-card compact" style="margin-top: 12px">
        <template #header>
          <span>PTA 概览统计</span>
        </template>

        <div class="pta-stats-wrapper">
          <table class="pta-table">
            <thead>
              <tr>
                <th class="pta-th-title">统计项</th>
                <th>总人数</th>
                <th>已提交</th>
                <th>有成绩</th>
                <th>最高分</th>
                <th>最低分</th>
                <th>平均分</th>
                <th>中位数</th>
                <th>高位平均</th>
                <th>低位平均</th>
                <th>难度系数</th>
                <th>区分度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="pta-td-title">数值</td>
                <td>{{ safeNumber(data.overview.totalStudents) }}</td>
                <td>{{ safeNumber(data.overview.submittedCount) }}</td>
                <td>{{ safeNumber(data.overview.scoredCount) }}</td>
                <td>{{ safeNumber(data.overview.maxScore) }}</td>
                <td>{{ safeNumber(data.overview.minScore) }}</td>
                <td>{{ safeNumber(data.overview.avgScore) }}</td>
                <td>{{ safeNumber(data.overview.median) }}</td>
                <td>{{ safeNumber(data.overview.topAvg) }}</td>
                <td>{{ safeNumber(data.overview.bottomAvg) }}</td>
                <td :class="difficultyClass">{{ safeNumber(data.overview.difficulty) }}</td>
                <td :class="discriminationClass">{{ safeNumber(data.overview.discrimination) }}</td>
              </tr>
            </tbody>
          </table>

          <table class="pta-table" style="margin-top: 12px">
            <thead>
              <tr>
                <th class="pta-th-title">分数段</th>
                <th v-for="segment in scoreSegments" :key="segment.label">{{ segment.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="pta-td-title">人数</td>
                <td v-for="segment in scoreSegments" :key="`count-${segment.label}`">
                  {{ segment.count }}
                </td>
              </tr>
              <tr>
                <td class="pta-td-title">比例</td>
                <td v-for="segment in scoreSegments" :key="`percent-${segment.label}`">
                  {{ segment.percent }}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pta-notes">
            <span>难度系数 = 1 - 平均分 / 满分，数值越大说明整体得分越低。</span>
            <span>区分度 = (高位平均 - 低位平均) / 满分，通常大于 0.30 说明区分效果较好。</span>
          </div>
        </div>
      </el-card>

      <el-row :gutter="16" style="margin-top: 12px">
        <el-col :xs="24" :sm="24" :md="12">
          <el-card class="g-card compact">
            <template #header>
              <span>分数分布</span>
            </template>
            <div ref="distChartRef" style="height: 260px"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <el-card class="g-card compact">
            <template #header>
              <span>每题得分率</span>
            </template>
            <div v-if="problemAccuracy.length" ref="accChartRef" style="height: 260px"></div>
            <el-empty v-else description="暂无题目维度数据" />
          </el-card>
        </el-col>
      </el-row>

      <el-card class="g-card compact" style="margin-top: 12px">
        <template #header>
          <span>题目明细</span>
        </template>
        <el-table :data="problemAccuracy" size="small" stripe max-height="320">
          <el-table-column prop="label" label="题号" width="90" />
          <el-table-column prop="type" label="题目" min-width="180" show-overflow-tooltip />
          <el-table-column prop="fullScore" label="满分" width="80" align="center" />
          <el-table-column prop="avgScore" label="均分" width="80" align="center" />
          <el-table-column label="得分率" min-width="180">
            <template #default="{ row }">
              <el-progress
                :percentage="toPercent(row.accuracyRate)"
                :color="accColor(toPercent(row.accuracyRate))"
                :stroke-width="12"
                :text-inside="true"
              />
            </template>
          </el-table-column>
          <el-table-column prop="fullMarkCount" label="满分人数" width="90" align="center" />
          <el-table-column prop="zeroCount" label="零分人数" width="90" align="center" />
          <el-table-column label="平均得分率" width="110" align="center">
            <template #default="{ row }">
              {{ row.fullScore > 0 ? `${toPercent((row.avgScore / row.fullScore) * 100)}%` : '-' }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <div v-else-if="loading" class="loading-wrap">
      <el-skeleton :rows="6" animated />
    </div>

    <el-empty
      v-else-if="experiments.length"
      description="请选择一个实验查看分析结果"
    />

    <el-empty
      v-else
      description="当前没有可分析的实验数据"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import PageHeader from '../../components/PageHeader.vue'
import {
  getAnalyticsExperiments,
  getClassPrefixes,
  getExperimentAnalytics,
  getExperimentComparison,
} from '../../api/tap'
import { useUserStore } from '../../store'

const SCORE_LABELS = [
  '[100,100]',
  '[90,100)',
  '[80,90)',
  '[70,80)',
  '[60,70)',
  '[50,60)',
  '[40,50)',
  '[30,40)',
  '[20,30)',
  '[10,20)',
  '[0,10)',
]

const SCORE_SHORT_LABELS = ['100', '90-99', '80-89', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9']

const userStore = useUserStore()

const experiments = ref([])
const classPrefixes = ref([])
const selectedClass = ref('')
const selectedExp = ref(null)
const data = ref(null)
const loading = ref(false)
const showComparison = ref(false)
const compLoading = ref(false)
const filterFallback = ref(false)
const comparisonItems = ref([])
const errorMessage = ref('')

const distChartRef = ref(null)
const accChartRef = ref(null)
const compChartRef = ref(null)

let distChart = null
let accChart = null
let compChart = null

const problemAccuracy = computed(() => {
  const items = data.value?.problemAccuracy
  return Array.isArray(items) ? items : []
})

const activeClassLabel = computed(() => selectedClass.value || '全部实验')
const scopeInfo = computed(() => data.value?.scope || null)

const scopeTitle = computed(() => {
  const scope = scopeInfo.value
  if (!scope) return ''
  const parts = [scope.classPrefix, scope.className, scope.courseName].filter(Boolean)
  return parts.length ? `统计范围：${parts.join(' / ')}` : '统计范围'
})

const scopeDescription = computed(() => {
  const scope = scopeInfo.value
  if (!scope) return ''
  const parts = []
  if (scope.className) parts.push(`班级：${scope.className}`)
  if (scope.courseName) parts.push(`课程：${scope.courseName}`)
  parts.push('范围：仅数据结构实验，已排除 C 语言数据')
  if (scope.rosterCount != null) parts.push(`名单人数：${safeNumber(scope.rosterCount)}`)
  if (scope.submittedCount != null) parts.push(`已提交：${safeNumber(scope.submittedCount)}`)
  if (scope.scoredCount != null) parts.push(`有成绩：${safeNumber(scope.scoredCount)}`)
  if (scope.problemCount != null) parts.push(`题目数：${safeNumber(scope.problemCount)}`)
  return parts.join(' | ')
})

const kpiItems = computed(() => {
  const overview = data.value?.overview
  if (!overview) return []

  return [
    { label: '总人数', value: safeNumber(overview.totalStudents), color: '#1a73e8' },
    { label: '已提交', value: safeNumber(overview.submittedCount), color: '#1a73e8' },
    { label: '最高分', value: safeNumber(overview.maxScore), color: '#1e8e3e' },
    { label: '最低分', value: safeNumber(overview.minScore), color: '#d93025' },
    { label: '平均分', value: safeNumber(overview.avgScore), color: '#1a73e8' },
    { label: '中位数', value: safeNumber(overview.median) },
    { label: '高位平均', value: safeNumber(overview.topAvg), color: '#1e8e3e' },
    { label: '低位平均', value: safeNumber(overview.bottomAvg), color: '#e37400' },
    {
      label: '难度系数',
      value: safeNumber(overview.difficulty),
      color: Number(overview.difficulty) > 0.5 ? '#d93025' : '#1e8e3e',
    },
    {
      label: '区分度',
      value: safeNumber(overview.discrimination),
      color: Number(overview.discrimination) >= 0.3
        ? '#1e8e3e'
        : Number(overview.discrimination) >= 0.2
          ? '#e37400'
          : '#d93025',
    },
  ]
})

const scoreSegments = computed(() => {
  const distribution = data.value?.scoreDistribution
  if (!distribution) return []

  const total = SCORE_LABELS.reduce((sum, label) => sum + Number(distribution[label] || 0), 0) || 1
  return SCORE_LABELS.map(label => {
    const count = Number(distribution[label] || 0)
    return {
      label,
      count,
      percent: `${Math.round((count / total) * 100)}%`,
    }
  })
})

const difficultyClass = computed(() => {
  const value = Number(data.value?.overview?.difficulty)
  if (!Number.isFinite(value)) return ''
  if (value > 0.5) return 'pta-danger'
  if (value > 0.3) return 'pta-warn'
  return 'pta-good'
})

const discriminationClass = computed(() => {
  const value = Number(data.value?.overview?.discrimination)
  if (!Number.isFinite(value)) return ''
  if (value >= 0.3) return 'pta-good'
  if (value >= 0.2) return 'pta-warn'
  return 'pta-danger'
})

function normalizeArray(payload) {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload)) return payload
  return []
}

function getErrorText(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback
}

function safeNumber(value) {
  if (value == null || value === '') return '-'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return Number.isInteger(numeric) ? numeric : Number(numeric.toFixed(2))
}

function toPercent(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Number(Math.max(0, Math.min(100, numeric)).toFixed(2))
}

function accColor(rate) {
  if (rate >= 80) return '#1e8e3e'
  if (rate >= 60) return '#1a73e8'
  if (rate >= 40) return '#e37400'
  return '#d93025'
}

function resolveInitialClassPrefix(prefixes) {
  if (!prefixes.length) return ''

  const candidates = [
    userStore.selectedClass?.ptaKeyword,
    userStore.selectedClass?.name,
  ]
    .filter(Boolean)
    .map(item => String(item).trim())

  for (const candidate of candidates) {
    const exact = prefixes.find(prefix => prefix === candidate)
    if (exact) return exact
  }

  for (const candidate of candidates) {
    const fuzzy = prefixes.find(prefix => candidate.includes(prefix) || prefix.includes(candidate))
    if (fuzzy) return fuzzy
  }

  return prefixes.length === 1 ? prefixes[0] : ''
}

function disposeCharts() {
  distChart?.dispose()
  accChart?.dispose()
  compChart?.dispose()
  distChart = null
  accChart = null
  compChart = null
}

function disposeDetailCharts() {
  distChart?.dispose()
  accChart?.dispose()
  distChart = null
  accChart = null
}

async function loadClassPrefixes() {
  try {
    const res = await getClassPrefixes()
    classPrefixes.value = normalizeArray(res)
    selectedClass.value = resolveInitialClassPrefix(classPrefixes.value)
  } catch (error) {
    classPrefixes.value = []
    selectedClass.value = ''
    console.warn('加载实验班级前缀失败:', error)
  }
}

async function loadExperiments({ autoSelect = true } = {}) {
  loading.value = true
  filterFallback.value = false
  errorMessage.value = ''

  try {
    let list = normalizeArray(await getAnalyticsExperiments(selectedClass.value || undefined))

    if (!list.length && selectedClass.value) {
      filterFallback.value = true
      selectedClass.value = ''
      list = normalizeArray(await getAnalyticsExperiments())
    }

    experiments.value = list

    if (!experiments.value.length) {
      selectedExp.value = null
      data.value = null
      disposeDetailCharts()
      return
    }

    const hasCurrent = experiments.value.some(item => String(item.experimentId) === String(selectedExp.value))
    if (!hasCurrent) {
      selectedExp.value = autoSelect ? experiments.value[0].experimentId : null
    }

    if (selectedExp.value) {
      await loadAnalytics()
    } else {
      data.value = null
      disposeDetailCharts()
    }

    if (showComparison.value) {
      await loadComparison()
    }
  } catch (error) {
    experiments.value = []
    selectedExp.value = null
    data.value = null
    errorMessage.value = getErrorText(error, '实验数据分析加载失败')
    disposeDetailCharts()
  } finally {
    loading.value = false
  }
}

async function loadAnalytics() {
  if (!selectedExp.value) {
    data.value = null
    disposeDetailCharts()
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const res = await getExperimentAnalytics(selectedExp.value)
    data.value = res?.data || res || null
    await nextTick()
    renderDistChart()
    renderAccChart()
  } catch (error) {
    data.value = null
    errorMessage.value = getErrorText(error, '实验分析结果加载失败')
    disposeDetailCharts()
  } finally {
    loading.value = false
  }
}

async function loadComparison() {
  compLoading.value = true
  errorMessage.value = ''
  try {
    const res = await getExperimentComparison(selectedClass.value || undefined)
    comparisonItems.value = normalizeArray(res)
    await nextTick()
    renderComparisonChart()
  } catch (error) {
    comparisonItems.value = []
    errorMessage.value = getErrorText(error, '实验横向对比加载失败')
    compChart?.dispose()
    compChart = null
  } finally {
    compLoading.value = false
  }
}

function renderDistChart() {
  if (!distChartRef.value || !data.value?.scoreDistribution) {
    distChart?.dispose()
    distChart = null
    return
  }

  distChart?.dispose()
  distChart = echarts.init(distChartRef.value)

  const distribution = data.value.scoreDistribution
  const values = SCORE_LABELS.map(label => Number(distribution[label] || 0))
  const total = values.reduce((sum, value) => sum + value, 0) || 1

  distChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const current = params[0]
        const label = SCORE_LABELS[current.dataIndex]
        return `${label}<br/>人数：${current.value}<br/>比例：${Math.round((current.value / total) * 100)}%`
      },
    },
    grid: { left: 40, right: 16, top: 20, bottom: 36 },
    xAxis: { type: 'category', data: SCORE_SHORT_LABELS, axisLabel: { fontSize: 10, rotate: 30 } },
    yAxis: { type: 'value', name: '人数', minInterval: 1 },
    series: [{
      type: 'bar',
      barWidth: '60%',
      data: values.map((value, index) => ({
        value,
        itemStyle: {
          color: index <= 1 ? '#1e8e3e' : index <= 3 ? '#1a73e8' : index <= 4 ? '#e37400' : '#d93025',
          borderRadius: [3, 3, 0, 0],
        },
      })),
      label: {
        show: true,
        position: 'top',
        fontSize: 10,
        formatter: params => (params.value > 0 ? params.value : ''),
      },
    }],
  })
}

function renderAccChart() {
  if (!accChartRef.value || !problemAccuracy.value.length) {
    accChart?.dispose()
    accChart = null
    return
  }

  accChart?.dispose()
  accChart = echarts.init(accChartRef.value)

  accChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: params => `${params[0].name}<br/>得分率：${params[0].value}%`,
    },
    grid: { left: 40, right: 16, top: 20, bottom: 36 },
    xAxis: {
      type: 'category',
      data: problemAccuracy.value.map(item => item.label),
      axisLabel: {
        fontSize: 10,
        rotate: problemAccuracy.value.length > 12 ? 30 : 0,
      },
    },
    yAxis: { type: 'value', max: 100, name: '%' },
    series: [{
      type: 'bar',
      barWidth: '60%',
      data: problemAccuracy.value.map(item => {
        const rate = toPercent(item.accuracyRate)
        return {
          value: rate,
          itemStyle: {
            color: accColor(rate),
            borderRadius: [3, 3, 0, 0],
          },
        }
      }),
      label: {
        show: problemAccuracy.value.length <= 15,
        position: 'top',
        fontSize: 10,
        formatter: '{c}%',
      },
    }],
  })
}

function renderComparisonChart() {
  if (!compChartRef.value || !comparisonItems.value.length) {
    compChart?.dispose()
    compChart = null
    return
  }

  compChart?.dispose()
  compChart = echarts.init(compChartRef.value)

  const names = comparisonItems.value.map(item => {
    const name = String(item.name || '')
    return name.length > 10 ? `${name.slice(0, 10)}...` : name
  })

  compChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均分', '难度系数', '区分度'], top: 0 },
    grid: { left: 50, right: 50, top: 36, bottom: 50 },
    xAxis: { type: 'category', data: names, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: [
      { type: 'value', name: '分数', min: 0 },
      { type: 'value', name: '系数', min: 0, max: 1 },
    ],
    series: [
      {
        name: '平均分',
        type: 'bar',
        data: comparisonItems.value.map(item => Number(item.avgScore || 0)),
        barWidth: '30%',
        itemStyle: { color: '#1a73e8', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: '难度系数',
        type: 'line',
        yAxisIndex: 1,
        data: comparisonItems.value.map(item => Number(item.difficulty || 0)),
        smooth: true,
        lineStyle: { color: '#d93025' },
        itemStyle: { color: '#d93025' },
      },
      {
        name: '区分度',
        type: 'line',
        yAxisIndex: 1,
        data: comparisonItems.value.map(item => Number(item.discrimination || 0)),
        smooth: true,
        lineStyle: { color: '#1e8e3e' },
        itemStyle: { color: '#1e8e3e' },
      },
    ],
  })
}

function onClassChange() {
  loadExperiments()
}

function toggleComparison() {
  showComparison.value = !showComparison.value
}

function handleResize() {
  distChart?.resize()
  accChart?.resize()
  compChart?.resize()
}

watch(showComparison, async value => {
  if (value) {
    await loadComparison()
  }
})

onMounted(async () => {
  await loadClassPrefixes()
  await loadExperiments()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})
</script>

<style scoped>
.exp-analytics {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.selector-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.count-tag {
  margin-left: auto;
}

.fallback-alert,
.scope-alert {
  margin-bottom: 12px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 8px;
}

.kpi {
  background: #fff;
  border-radius: 8px;
  padding: 10px 8px;
  text-align: center;
  border: 1px solid #e8eaed;
  transition: box-shadow 0.2s;
}

.kpi:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.kpi-val {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.kpi-label {
  font-size: 11px;
  color: #5f6368;
  margin-top: 2px;
}

.g-card {
  border-radius: 8px;
  border: 1px solid #dadce0;
}

.g-card.compact :deep(.el-card__header) {
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
}

.g-card.compact :deep(.el-card__body) {
  padding: 8px 12px;
}

.g-card :deep(.el-table th) {
  font-weight: 500;
  color: #5f6368;
  font-size: 12px;
}

.g-card :deep(.el-table td) {
  font-size: 12px;
  color: #202124;
}

.pta-stats-wrapper {
  overflow-x: auto;
}

.pta-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: center;
}

.pta-table th,
.pta-table td {
  border: 1px solid #e8eaed;
  padding: 6px 8px;
  white-space: nowrap;
}

.pta-table thead th {
  background: #f8f9fa;
  color: #5f6368;
  font-weight: 500;
}

.pta-th-title,
.pta-td-title {
  background: #f1f3f4;
  font-weight: 600;
  color: #202124;
  min-width: 72px;
}

.pta-table tbody td {
  color: #202124;
  font-weight: 500;
}

.pta-good {
  color: #1e8e3e;
  font-weight: 700;
}

.pta-warn {
  color: #e37400;
  font-weight: 700;
}

.pta-danger {
  color: #d93025;
  font-weight: 700;
}

.pta-notes {
  display: flex;
  gap: 24px;
  margin-top: 8px;
  font-size: 11px;
  color: #5f6368;
  flex-wrap: wrap;
}

.loading-wrap {
  padding: 40px;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 768px) {
  .selector-bar {
    align-items: stretch;
  }

  .selector-bar > * {
    width: 100% !important;
  }

  .count-tag {
    margin-left: 0;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .pta-notes {
    gap: 8px;
  }
}
</style>
