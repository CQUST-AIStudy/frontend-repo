<template>
  <div class="exp-analytics">
    <UiPageHeader
      title="实验数据分析"
      description="基于 PTA 成绩单的多维分析，包括分数分布、题目得分率、难度系数与区分度。"
    />

    <div class="mt-4 flex gap-3 items-center mb-8 flex-wrap max-[768px]:items-stretch max-[768px]:[&>*]:!w-full">
      <div v-if="classPrefixes.length > 1" class="relative w-[180px] max-[768px]:!w-full">
        <UiSelect
          v-model="selectedClass"
          class="w-full h-10 px-3 pr-8 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none appearance-none cursor-pointer"
          @change="onClassChange"
        >
          <UiOption value="">全部实验</UiOption>
          <UiOption
            v-for="prefix in classPrefixes"
            :key="prefix"
            :value="prefix"
          >{{ prefix }}</UiOption>
        </UiSelect>
      </div>

      <div v-if="!showComparison" class="relative w-[360px] max-[768px]:!w-full">
        <UiSelect
          v-model="selectedExp"
          class="w-full h-10 px-3 pr-8 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none appearance-none cursor-pointer"
          @change="loadAnalytics"
        >
          <UiOption :value="null" disabled>选择实验</UiOption>
          <UiOption
            v-for="exp in experiments"
            :key="exp.experimentId"
            :value="exp.experimentId"
          >{{ exp.name }}</UiOption>
        </UiSelect>
      </div>
      <div v-else class="flex min-h-10 w-[360px] items-center justify-between gap-3 rounded-[10px] bg-[#f5f5f7] px-3 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] max-[768px]:!w-full">
        <span class="text-[12px] font-semibold text-[#6e6e73]">对比范围</span>
        <span class="min-w-0 truncate text-sm font-medium text-[#1d1d1f]">{{ comparisonScopeLabel }}</span>
      </div>

      <UiButton
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none"
        @click="toggleComparison"
      >
        {{ showComparison ? '返回单实验分析' : '对比当前范围实验' }}
      </UiButton>

      <span class="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-medium bg-[rgba(0,122,255,0.08)] text-[#007aff] ml-auto max-[768px]:ml-0">
        {{ activeClassLabel }} / {{ experiments.length }} 个可分析实验
      </span>
    </div>

    <!-- Error alert -->
    <div
      v-if="errorMessage"
      class="flex items-start gap-3 p-4 rounded-[14px] border border-[rgba(255,59,48,0.2)] bg-[rgba(255,59,48,0.06)] mb-3"
    >
      <svg class="w-5 h-5 text-[#ff3b30] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
      <span class="text-sm text-[#ff3b30]">{{ errorMessage }}</span>
    </div>

    <!-- Warning alert -->
    <div
      v-if="filterFallback"
      class="flex items-start gap-3 p-4 rounded-[14px] border border-[rgba(255,149,0,0.2)] bg-[rgba(255,149,0,0.06)] mb-3"
    >
      <svg class="w-5 h-5 text-[#ff9500] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
      <span class="text-sm text-[#ff9500]">当前教学班没有匹配到实验前缀，已自动切换为全部实验。</span>
    </div>

    <!-- Info alert (scope) -->
    <div
      v-if="scopeDescription && !showComparison"
      class="flex items-start gap-3 p-4 rounded-[14px] border border-[rgba(0,122,255,0.2)] bg-[rgba(0,122,255,0.06)] mb-3"
    >
      <svg class="w-5 h-5 text-[#007aff] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
      <div>
        <p class="text-sm font-medium text-[#007aff]">{{ scopeTitle }}</p>
        <p class="text-xs text-[#007aff]/80 mt-0.5">{{ scopeDescription }}</p>
      </div>
    </div>

    <template v-if="showComparison">
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6" :aria-busy="compLoading">
        <div class="mb-4 flex items-start justify-between gap-4 max-[640px]:flex-col">
          <div class="min-w-0">
            <div class="text-[15px] font-semibold text-[#1d1d1f]">对比当前范围实验</div>
            <div class="mt-1 text-xs text-[#6e6e73]">{{ comparisonSummary }}</div>
          </div>
          <span class="inline-flex h-[24px] items-center rounded-full bg-[rgba(0,122,255,0.08)] px-2.5 text-[11px] font-semibold text-[#007aff]">
            平均分 / 难度 / 区分度
          </span>
        </div>
        <div v-if="compLoading" class="py-12 text-center text-[#86868b] text-sm">正在加载对比数据...</div>
        <div v-else-if="comparisonItems.length" ref="compChartRef" class="h-[340px]"></div>
        <div v-else-if="!compLoading" class="py-12 text-center text-[#aeaeb2] text-sm">暂无可对比的实验数据</div>
      </div>
    </template>

    <template v-else-if="data && data.overview && selectedExp">
      <div class="grid grid-cols-10 gap-2 max-[768px]:grid-cols-5 max-[480px]:grid-cols-2">
        <div v-for="item in kpiItems" :key="item.label" class="bg-white rounded-[12px] p-[10px_8px] text-center border border-black/[0.06] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div class="text-[20px] font-bold leading-tight" :class="kpiValueClass(item)">{{ item.value }}</div>
          <div class="text-[11px] text-[#6e6e73] mt-0.5">{{ item.label }}</div>
        </div>
      </div>

      <!-- PTA Overview Card -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mt-3">
        <div class="text-[15px] font-semibold text-[#1d1d1f] mb-4">PTA 概览统计</div>

        <div class="overflow-x-auto">
          <UiTable class="w-full border-collapse text-[12px] text-center">
            <thead>
              <tr>
                <th class="bg-[#f5f5f7] font-semibold text-[#1d1d1f] min-w-[72px] py-2 px-2 border-b border-black/[0.06]">统计项</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">总人数</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">已提交</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">有成绩</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">最高分</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">最低分</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">平均分</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">中位数</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">高位平均</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">低位平均</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">难度系数</th>
                <th class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">区分度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bg-[#f5f5f7] font-semibold text-[#1d1d1f] min-w-[72px] py-2 px-2">数值</td>
                <td class="py-2 px-2 text-[#1d1d1f]">{{ safeNumber(data.overview.totalStudents) }}</td>
                <td class="py-2 px-2 text-[#1d1d1f]">{{ safeNumber(data.overview.submittedCount) }}</td>
                <td class="py-2 px-2 text-[#1d1d1f]">{{ safeNumber(data.overview.scoredCount) }}</td>
                <td class="py-2 px-2 text-[#1d1d1f]">{{ safeNumber(data.overview.maxScore) }}</td>
                <td class="py-2 px-2 text-[#1d1d1f]">{{ safeNumber(data.overview.minScore) }}</td>
                <td class="py-2 px-2 text-[#1d1d1f]">{{ safeNumber(data.overview.avgScore) }}</td>
                <td class="py-2 px-2 text-[#1d1d1f]">{{ safeNumber(data.overview.median) }}</td>
                <td class="py-2 px-2 text-[#1d1d1f]">{{ safeNumber(data.overview.topAvg) }}</td>
                <td class="py-2 px-2 text-[#1d1d1f]">{{ safeNumber(data.overview.bottomAvg) }}</td>
                <td class="py-2 px-2" :class="difficultyClass">{{ safeNumber(data.overview.difficulty) }}</td>
                <td class="py-2 px-2" :class="discriminationClass">{{ safeNumber(data.overview.discrimination) }}</td>
              </tr>
            </tbody>
          </UiTable>

          <UiTable class="w-full border-collapse text-[12px] text-center mt-3">
            <thead>
              <tr>
                <th class="bg-[#f5f5f7] font-semibold text-[#1d1d1f] min-w-[72px] py-2 px-2 border-b border-black/[0.06]">分数段</th>
                <th v-for="segment in scoreSegments" :key="segment.label" class="py-2 px-2 text-[#6e6e73] font-medium border-b border-black/[0.06]">{{ segment.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bg-[#f5f5f7] font-semibold text-[#1d1d1f] min-w-[72px] py-2 px-2">人数</td>
                <td v-for="segment in scoreSegments" :key="`count-${segment.label}`" class="py-2 px-2 text-[#1d1d1f]">
                  {{ segment.count }}
                </td>
              </tr>
              <tr>
                <td class="bg-[#f5f5f7] font-semibold text-[#1d1d1f] min-w-[72px] py-2 px-2">比例</td>
                <td v-for="segment in scoreSegments" :key="`percent-${segment.label}`" class="py-2 px-2 text-[#1d1d1f]">
                  {{ segment.percent }}
                </td>
              </tr>
            </tbody>
          </UiTable>

          <div class="flex gap-6 mt-2 text-[11px] text-[#6e6e73] flex-wrap">
            <span>难度系数 = 1 - 平均分/ 满分，数值越大说明整体得分越低。</span>
            <span>区分度= (高位平均 - 低位平均) / 满分，通常大于 0.30 说明区分效果较好。</span>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="text-[15px] font-semibold text-[#1d1d1f] mb-4">分数分布</div>
          <div ref="distChartRef" class="h-[260px]"></div>
        </div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="text-[15px] font-semibold text-[#1d1d1f] mb-4">每题得分率</div>
          <div v-if="problemAccuracy.length" ref="accChartRef" class="h-[260px]"></div>
          <div v-else class="py-12 text-center text-[#aeaeb2] text-sm">暂无题目维度数据</div>
        </div>
      </div>

      <!-- Problem detail table -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mt-3">
        <div class="text-[15px] font-semibold text-[#1d1d1f] mb-4">题目明细</div>
        <div class="overflow-x-auto max-h-[320px] overflow-y-auto">
          <UiTable class="w-full text-left text-[12px] border-collapse">
            <thead class="sticky top-0 z-10">
              <tr class="border-b border-black/[0.06]">
                <th class="py-2.5 px-3 text-[12px] font-semibold text-[#6e6e73] bg-[#f9f9f9] w-[90px]">题号</th>
                <th class="py-2.5 px-3 text-[12px] font-semibold text-[#6e6e73] bg-[#f9f9f9] min-w-[180px]">题目</th>
                <th class="py-2.5 px-3 text-[12px] font-semibold text-[#6e6e73] bg-[#f9f9f9] w-[80px] text-center">满分</th>
                <th class="py-2.5 px-3 text-[12px] font-semibold text-[#6e6e73] bg-[#f9f9f9] w-[80px] text-center">均分</th>
                <th class="py-2.5 px-3 text-[12px] font-semibold text-[#6e6e73] bg-[#f9f9f9] min-w-[180px]">得分率</th>
                <th class="py-2.5 px-3 text-[12px] font-semibold text-[#6e6e73] bg-[#f9f9f9] w-[90px] text-center">满分人数</th>
                <th class="py-2.5 px-3 text-[12px] font-semibold text-[#6e6e73] bg-[#f9f9f9] w-[90px] text-center">零分人数</th>
                <th class="py-2.5 px-3 text-[12px] font-semibold text-[#6e6e73] bg-[#f9f9f9] w-[110px] text-center">平均得分率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in problemAccuracy" :key="row.label" class="border-b border-black/[0.04] transition-colors hover:bg-[rgba(0,122,255,0.03)]">
                <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.label }}</td>
                <td class="py-2.5 px-3 text-[#1d1d1f] truncate max-w-[240px]" :title="row.type">{{ row.type }}</td>
                <td class="py-2.5 px-3 text-[#1d1d1f] text-center">{{ row.fullScore }}</td>
                <td class="py-2.5 px-3 text-[#1d1d1f] text-center">{{ row.avgScore }}</td>
                <td class="py-2.5 px-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-3 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div
                        class="h-full w-[var(--progress-width)] rounded-full bg-[var(--progress-color)] transition-all"
                        :style="accuracyBarStyle(toPercent(row.accuracyRate))"
                      ></div>
                    </div>
                    <span class="text-[11px] text-[#6e6e73] w-[38px] text-right">{{ toPercent(row.accuracyRate) }}%</span>
                  </div>
                </td>
                <td class="py-2.5 px-3 text-[#1d1d1f] text-center">{{ row.fullMarkCount }}</td>
                <td class="py-2.5 px-3 text-[#1d1d1f] text-center">{{ row.zeroCount }}</td>
                <td class="py-2.5 px-3 text-[#1d1d1f] text-center">
                  {{ row.fullScore > 0 ? `${toPercent((row.avgScore / row.fullScore) * 100)}%` : '-' }}
                </td>
              </tr>
              <tr v-if="!problemAccuracy.length">
                <td colspan="8" class="py-12 text-center text-[#aeaeb2] text-sm">暂无题目明细数据</td>
              </tr>
            </tbody>
          </UiTable>
        </div>
      </div>
    </template>

    <div v-else-if="loading" class="p-10 flex items-center justify-center">
      <div class="animate-pulse flex flex-col gap-3 w-full">
        <div class="h-4 bg-[#f5f5f7] rounded w-3/4"></div>
        <div class="h-4 bg-[#f5f5f7] rounded w-1/2"></div>
        <div class="h-4 bg-[#f5f5f7] rounded w-5/6"></div>
        <div class="h-4 bg-[#f5f5f7] rounded w-2/3"></div>
        <div class="h-4 bg-[#f5f5f7] rounded w-4/5"></div>
        <div class="h-4 bg-[#f5f5f7] rounded w-1/3"></div>
      </div>
    </div>

    <div
      v-else-if="experiments.length"
      class="py-12 text-center text-[#aeaeb2] text-sm"
    >请选择一个实验查看分析结果</div>

    <div
      v-else
      class="py-12 text-center text-[#aeaeb2] text-sm"
    >当前没有可分析的实验数据</div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import {
  getAnalyticsExperiments,
  getClassPrefixes,
  getExperimentAnalytics,
  getExperimentComparison,
} from '../../api/tap'
import { useUserStore } from '../../store'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

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
const EXPERIMENT_LIST_ERROR_TEXT = '实验列表暂时无法加载，请稍后重试；如持续出现，请联系管理员检查数据服务。'
const EXPERIMENT_ANALYTICS_ERROR_TEXT = '实验分析结果暂时无法加载，请稍后重试；如持续出现，请联系管理员检查数据服务。'
const EXPERIMENT_COMPARISON_ERROR_TEXT = '实验横向对比暂时无法加载，请稍后重试；如持续出现，请联系管理员检查数据服务。'
const BACKEND_INTERNAL_ERROR_PATTERNS = [
  /jdbc exception/i,
  /executing sql/i,
  /illegal mix of collations/i,
  /bad sql grammar/i,
  /sqlsyntaxerrorexception/i,
  /dataaccessexception/i,
]

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
const comparisonScopeLabel = computed(() => selectedClass.value ? `${selectedClass.value} 范围` : '全部实验范围')
const comparisonSummary = computed(() => (
  `${comparisonScopeLabel.value}内共有 ${experiments.value.length} 个可分析实验，当前展示 ${comparisonItems.value.length} 个有对比指标的实验。`
))
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
    { label: '总人数', value: safeNumber(overview.totalStudents), color: '#007aff' },
    { label: '已提交', value: safeNumber(overview.submittedCount), color: '#007aff' },
    { label: '最高分', value: safeNumber(overview.maxScore), color: '#1e8e3e' },
    { label: '最低分', value: safeNumber(overview.minScore), color: '#d93025' },
    { label: '平均分', value: safeNumber(overview.avgScore), color: '#007aff' },
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

function kpiValueClass(item) {
  if (item.color === '#007aff') return '[color:#007aff]'
  if (item.color === '#1e8e3e') return '[color:#1e8e3e]'
  if (item.color === '#d93025') return '[color:#d93025]'
  if (item.color === '#e37400') return '[color:#e37400]'
  return '[color:#1d1d1f]'
}

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

function getExperimentId(item = {}) {
  return item.experimentId ?? item.id ?? item.experiment_id ?? null
}

function normalizeExperiment(item = {}, index = 0) {
  const experimentId = getExperimentId(item)
  return {
    ...item,
    experimentId,
    name: item.name || item.experimentName || item.title || `实验 ${index + 1}`,
  }
}

function normalizeExperimentList(payload) {
  return normalizeArray(payload)
    .map(normalizeExperiment)
    .filter(item => item.experimentId !== null && item.experimentId !== undefined && item.experimentId !== '')
}

function normalizeComparisonItem(item = {}, index = 0) {
  const experimentId = getExperimentId(item)
  return {
    ...item,
    experimentId,
    name: item.name || item.experimentName || item.title || `实验 ${index + 1}`,
  }
}

function alignComparisonItems(items) {
  const experimentById = new Map(experiments.value.map(item => [String(item.experimentId), item]))
  const experimentNameSet = new Set(experiments.value.map(item => String(item.name || '').trim()).filter(Boolean))
  const normalizedItems = normalizeArray(items).map(normalizeComparisonItem)
  const hasItemIds = normalizedItems.some(item => item.experimentId !== null && item.experimentId !== undefined && item.experimentId !== '')

  if (!experiments.value.length) return []

  if (hasItemIds) {
    return normalizedItems
      .filter(item => experimentById.has(String(item.experimentId)))
      .map(item => ({
        ...item,
        name: experimentById.get(String(item.experimentId))?.name || item.name,
      }))
  }

  return normalizedItems.filter(item => experimentNameSet.has(String(item.name || '').trim()))
}

function isBackendInternalError(message) {
  const text = String(message || '')
  if (!text) return false
  if (BACKEND_INTERNAL_ERROR_PATTERNS.some(pattern => pattern.test(text))) return true
  return text.length > 300 && /\b(SELECT|FROM|JOIN|WHERE|GROUP BY|ORDER BY)\b/i.test(text)
}

function getErrorText(error, fallback) {
  const message = error?.response?.data?.message || error?.message || ''
  if (!message || isBackendInternalError(message)) return fallback
  return getFriendlyErrorMessage(error, fallback)
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
  if (rate >= 60) return '#007aff'
  if (rate >= 40) return '#e37400'
  return '#d93025'
}

function accuracyBarStyle(rate) {
  return {
    '--progress-width': `${rate}%`,
    '--progress-color': accColor(rate),
  }
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
    logger.warn('加载实验班级前缀失败:', error)
  }
}

async function loadExperiments({ autoSelect = true } = {}) {
  loading.value = true
  filterFallback.value = false
  errorMessage.value = ''

  try {
    let list = normalizeExperimentList(await getAnalyticsExperiments(selectedClass.value || undefined))

    if (!list.length && selectedClass.value) {
      filterFallback.value = true
      selectedClass.value = ''
      list = normalizeExperimentList(await getAnalyticsExperiments())
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

    if (!showComparison.value && selectedExp.value) {
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
    errorMessage.value = getErrorText(error, EXPERIMENT_LIST_ERROR_TEXT)
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
    errorMessage.value = getErrorText(error, EXPERIMENT_ANALYTICS_ERROR_TEXT)
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
    comparisonItems.value = alignComparisonItems(res)
  } catch (error) {
    comparisonItems.value = []
    errorMessage.value = getErrorText(error, EXPERIMENT_COMPARISON_ERROR_TEXT)
    compChart?.dispose()
    compChart = null
  } finally {
    compLoading.value = false
  }

  await nextTick()
  renderComparisonChart()
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
          color: index <= 1 ? '#1e8e3e' : index <= 3 ? '#007aff' : index <= 4 ? '#e37400' : '#d93025',
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
        itemStyle: { color: '#007aff', borderRadius: [3, 3, 0, 0] },
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
  } else if (selectedExp.value) {
    await loadAnalytics()
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
