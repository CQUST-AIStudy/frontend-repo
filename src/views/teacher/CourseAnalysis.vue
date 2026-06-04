<template>
  <div class="min-w-0">
    <page-header title="课程分析" description="基于真实数据的课程整体分析和AI教学建议" />

    <div class="flex flex-col gap-5" v-loading="pageLoading">
      <!-- 总体概览 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">课程总体情况</span>
        </div>
        <div class="grid grid-cols-4 gap-5 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
          <div class="text-center py-5">
            <div class="text-[13px] text-[#6e6e73] mb-2">班级数量</div>
            <div class="text-[28px] font-bold text-[#1d1d1f]">{{ overview.classCount }}</div>
            <div class="text-[12px] text-[#aeaeb2] mt-1">共计{{ overview.classCount }}个教学班</div>
          </div>
          <div class="text-center py-5">
            <div class="text-[13px] text-[#6e6e73] mb-2">学生总数</div>
            <div class="text-[28px] font-bold text-[#1d1d1f]">{{ overview.studentCount }}</div>
            <div class="text-[12px] text-[#aeaeb2] mt-1">累计注册学生</div>
          </div>
          <div class="text-center py-5">
            <div class="text-[13px] text-[#6e6e73] mb-2">实验平均完成率</div>
            <div class="text-[28px] font-bold text-[#1d1d1f]">{{ overview.avgCompletionRate }}%</div>
            <div class="text-[12px] text-[#aeaeb2] mt-1">基于全部实验统计</div>
          </div>
          <div class="text-center py-5">
            <div class="text-[13px] text-[#6e6e73] mb-2">课程平均分</div>
            <div class="text-[28px] font-bold text-[#1d1d1f]">{{ overview.avgScore }}</div>
            <div class="text-[12px] text-[#aeaeb2] mt-1">已评分学生均分</div>
          </div>
        </div>
      </div>

      <!-- 班级对比 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">实验完成率对比</span>
        </div>
        <div class="h-[320px] w-full" ref="classComparisonChartRef"></div>
      </div>

      <!-- 实验成绩分布 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">各实验成绩分布</span>
        </div>
        <div class="h-[320px] w-full" ref="experimentScoreChartRef"></div>
      </div>

      <!-- AI教学建议 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">AI教学建议</span>
          <button :disabled="aiLoading" @click="generateAIRecommendation" class="h-[34px] px-4 rounded-[8px] text-[13px] font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.2)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-60">
            {{ aiLoading ? '生成中..' : '生成教学建议' }}
          </button>
        </div>
        <div class="flex flex-col gap-4">
          <div v-if="aiContent" class="prose prose-sm max-w-none text-[14px] leading-[1.8] text-[#1d1d1f]" v-html="renderedAiContent"></div>
          <div v-else-if="aiLoading" class="space-y-3 py-4">
            <div class="h-4 bg-black/[0.04] rounded-full animate-pulse"></div>
            <div class="h-4 bg-black/[0.04] rounded-full animate-pulse w-[90%]"></div>
            <div class="h-4 bg-black/[0.04] rounded-full animate-pulse w-[75%]"></div>
            <div class="h-4 bg-black/[0.04] rounded-full animate-pulse w-[85%]"></div>
            <div class="h-4 bg-black/[0.04] rounded-full animate-pulse w-[60%]"></div>
            <div class="h-4 bg-black/[0.04] rounded-full animate-pulse w-[80%]"></div>
            <div class="h-4 bg-black/[0.04] rounded-full animate-pulse w-[70%]"></div>
            <div class="h-4 bg-black/[0.04] rounded-full animate-pulse w-[50%]"></div>
          </div>
          <div v-else class="py-12 text-center">
            <LucideIcon name="bot" class="mx-auto mb-3 text-[#c6ccd6]" :size="42" />
            <p class="text-[14px] text-[#aeaeb2]">点击生成教学建议按钮获取AI分析结果</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import PageHeader from '../../components/PageHeader.vue'
import LucideIcon from '../../components/LucideIcon.vue'
import { buildStructuredPrompt, chatSend } from '../../api/tap'
import * as echarts from 'echarts'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import api from '../../api'

const classComparisonChartRef = ref(null)
const experimentScoreChartRef = ref(null)
const pageLoading = ref(true)
const aiLoading = ref(false)
const aiContent = ref('')

function truncateLabel(text, max = 24) {
  const normalized = String(text || '').trim()
  if (!normalized) return '未命名实验'
  return normalized.length > max ? `${normalized.slice(0, max)}...` : normalized
}

function buildExperimentItems(items, limit = 16) {
  const list = Array.isArray(items) ? items : []
  const visibleItems = list.slice(0, limit).map(item =>
    `${truncateLabel(item.name)}：提交${item.submissionCount} 人，均分 ${item.averageScore}`
  )
  if (list.length <= limit) {
    return visibleItems
  }
  const hiddenItems = list.slice(limit)
  const avgScore = Math.round(hiddenItems.reduce((sum, item) => sum + Number(item.averageScore || 0), 0) / hiddenItems.length)
  return [
    ...visibleItems,
    `其余 ${hiddenItems.length} 个实验已合并展示：平均分 ${avgScore}`,
  ]
}

const overview = reactive({
  classCount: 0,
  studentCount: 0,
  avgCompletionRate: 0,
  avgScore: 0
})

// 存储加载的原始数据
const classesData = ref([])
const experimentsData = ref([])
const submissionsData = ref([])

const renderedAiContent = computed(() => {
  if (!aiContent.value) return ''
  return DOMPurify.sanitize(marked.parse(aiContent.value))
})

// 加载所有数据
const loadAllData = async () => {
  pageLoading.value = true
  try {
    const [classesRes, experimentsRes, submissionsRes] = await Promise.all([
      api.getClassList(),
      api.getTeacherExperimentList({ scope: 'all' }),
      api.getAllStudentExperiments({ scope: 'all' })
    ])

    // 处理班级数据
    classesData.value = Array.isArray(classesRes) ? classesRes
      : (classesRes?.data && Array.isArray(classesRes.data) ? classesRes.data : [])

    // 处理实验数据
    let exps = []
    if (experimentsRes?.data && Array.isArray(experimentsRes.data)) exps = experimentsRes.data
    else if (Array.isArray(experimentsRes)) exps = experimentsRes
    experimentsData.value = exps

    // 处理提交数据
    submissionsData.value = Array.isArray(submissionsRes) ? submissionsRes : []

    // 计算概览
    calculateOverview()

    // 渲染图表
    await nextTick()
    initComparisonChart()
    initExperimentScoreChart()
  } catch (e) {
    logger.error('加载课程分析数据失败:', e)
  } finally {
    pageLoading.value = false
  }
}

const calculateOverview = () => {
  overview.classCount = classesData.value.length

  // 统计学生总数（去重）
  const studentIds = new Set(submissionsData.value.map(s => s.studentId))
  overview.studentCount = studentIds.size || classesData.value.reduce((sum, c) => sum + (c.studentCount || 0), 0)

  // 计算平均完成率
  const totalStudents = overview.studentCount || 1
  const totalExperiments = experimentsData.value.length || 1
  const completedCount = submissionsData.value.filter(s => s.status === 'completed').length
  overview.avgCompletionRate = Math.round((completedCount / (totalStudents * totalExperiments)) * 100)

  // 计算平均分
  const scored = submissionsData.value.filter(s => s.score > 0)
  overview.avgScore = scored.length > 0
    ? Math.round(scored.reduce((sum, s) => sum + s.score, 0) / scored.length * 10) / 10
    : 0
}

let comparisonChartInstance = null
let scoreChartInstance = null

const initComparisonChart = () => {
  if (!classComparisonChartRef.value || !experimentsData.value.length) return
  comparisonChartInstance?.dispose()
  const chart = echarts.init(classComparisonChartRef.value)
  comparisonChartInstance = chart

  const totalStudents = overview.studentCount || 1
  const expNames = experimentsData.value.map(e => e.name.length > 12 ? e.name.substring(0, 12) + '...' : e.name)
  const completionRates = experimentsData.value.map(e => {
    const count = e.submissionCount || 0
    return Math.round((count / totalStudents) * 100)
  })
  const avgScores = experimentsData.value.map(e => {
    const subs = submissionsData.value.filter(s => s.experimentId === e.id && s.score > 0)
    return subs.length > 0 ? Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length * 10) / 10 : 0
  })

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['完成率(%)', '平均分'] },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: expNames, axisLabel: { interval: 0, rotate: 30, fontSize: 11 } },
    yAxis: [
      { type: 'value', name: '百分比', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
      { type: 'value', name: '分数', min: 0, max: 100 }
    ],
    series: [
      { name: '完成率(%)', type: 'bar', data: completionRates },
      { name: '平均分', type: 'line', yAxisIndex: 1, data: avgScores, smooth: true }
    ]
  })
}

const initExperimentScoreChart = () => {
  if (!experimentScoreChartRef.value || !submissionsData.value.length) return
  scoreChartInstance?.dispose()
  const chart = echarts.init(experimentScoreChartRef.value)
  scoreChartInstance = chart

  const scored = submissionsData.value.filter(s => s.score > 0)
  const ranges = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 }
  scored.forEach(s => {
    if (s.score >= 90) ranges['90-100']++
    else if (s.score >= 80) ranges['80-89']++
    else if (s.score >= 70) ranges['70-79']++
    else if (s.score >= 60) ranges['60-69']++
    else ranges['<60']++
  })

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: Object.keys(ranges) },
    yAxis: { type: 'value', name: '学生人次' },
    series: [{
      type: 'bar',
      data: Object.entries(ranges).map(([, v], i) => ({
        value: v,
        itemStyle: { color: ['#F56C6C', '#E6A23C', '#67C23A', '#409EFF', '#8E44AD'][i] }
      })),
      label: { show: true, position: 'top' }
    }]
  })
}

const handleChartResize = () => {
  comparisonChartInstance?.resize()
  scoreChartInstance?.resize()
}

function buildCourseAnalysisPrompt(summary) {
  return buildStructuredPrompt({
    role: '你是一位资深的数据结构课程教学顾问，擅长从课程运行数据中识别教学风险和优化机会。',
    task: '请基于以下课程整体数据，输出详细的教学分析与改进建议。',
    contextSections: [
      {
        title: '课程整体概况',
        items: [
          `班级数量：${summary.classCount}`,
          `学生总数：${summary.studentCount}`,
          `平均完成率：${summary.avgCompletionRate}%`,
          `课程平均分：${summary.avgScore}`,
        ],
      },
      {
        title: '各实验情况',
        items: buildExperimentItems(summary.experiments),
      },
    ],
    instructions: [
      '评价课程当前整体运行状态，并说明主要判断依据。',
      '识别需要重点关注的薄弱环节或异常指标。',
      '给出教学方法调整建议，并标注优先级。',
      '给出实验设计或课程安排的优化建议。',
      '针对不同层次学生提出差异化教学策略。',
    ],
    outputRequirements: [
      '使用 Markdown 输出。',
      '先给出结论摘要，再展开说明。',
      '建议要可执行，避免泛泛而谈。',
    ],
  })
}

// AI教学建议 - 流式输出
const generateAIRecommendation = async () => {
  if (aiLoading.value) return
  aiLoading.value = true
  aiContent.value = ''

  // 构建课程数据摘要
  const summary = {
    classCount: overview.classCount,
    studentCount: overview.studentCount,
    avgCompletionRate: overview.avgCompletionRate,
    avgScore: overview.avgScore,
    experiments: experimentsData.value.map(e => ({
      name: e.name,
      submissionCount: e.submissionCount || 0,
      averageScore: e.averageScore || 0
    }))
  }

  try {
    const res = await chatSend(buildCourseAnalysisPrompt(summary), [])
    const data = res?.data ?? res
    aiContent.value = data?.reply || '暂无建议'
  } catch (e) {
    logger.error('生成AI建议失败:', e)
    const message = e?.message || '请检查后端服务是否正常运行。'
    aiContent.value = `生成 AI 建议失败：${message}`
    ElMessage.warning(message)
  } finally {
    aiLoading.value = false
  }
}

onMounted(() => {
  loadAllData()
  window.addEventListener('resize', handleChartResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleChartResize)
  comparisonChartInstance?.dispose()
  scoreChartInstance?.dispose()
})
</script>
