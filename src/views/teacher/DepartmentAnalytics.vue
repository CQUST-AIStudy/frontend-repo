<template>
  <div class="min-w-0">
    <UiPageHeader title="系部分析" description="基于真实教学数据的系部统计分析" />

    <div class="flex flex-col gap-5" :aria-busy="pageLoading">
      <!-- 概览卡片 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">教学概览</span>
        </div>
        <div class="grid grid-cols-4 gap-5 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
          <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[10px] border border-black/[0.04]">
            <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ overview.experimentCount }}</div>
            <div class="text-[13px] text-[#6e6e73]">实验总数</div>
          </div>
          <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[10px] border border-black/[0.04]">
            <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ overview.classCount }}</div>
            <div class="text-[13px] text-[#6e6e73]">班级数量</div>
          </div>
          <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[10px] border border-black/[0.04]">
            <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ overview.studentCount }}</div>
            <div class="text-[13px] text-[#6e6e73]">学生总数</div>
          </div>
          <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[10px] border border-black/[0.04]">
            <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ overview.avgScore }}</div>
            <div class="text-[13px] text-[#6e6e73]">平均分</div>
          </div>
        </div>
      </div>

      <!-- 图表行 -->
      <div class="grid grid-cols-2 gap-5 max-[768px]:grid-cols-1">
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.06]">
            <span class="text-[15px] font-semibold text-[#1d1d1f]">实验完成率排行</span>
          </div>
          <div ref="completionChartRef" class="h-[300px] w-full"></div>
        </div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.06]">
            <span class="text-[15px] font-semibold text-[#1d1d1f]">全部学生成绩分布</span>
          </div>
          <div ref="gradeChartRef" class="h-[300px] w-full"></div>
        </div>
      </div>

      <!-- 趋势图 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">各实验平均分趋势</span>
        </div>
        <div ref="trendChartRef" class="h-[300px] w-full"></div>
      </div>

      <!-- 低完成率实验预警 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5 overflow-x-auto">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">低完成率实验预警</span>
          <UiButton @click="exportReport" class="h-[34px] px-4 rounded-[8px] text-[13px] font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.2)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">导出报告</UiButton>
        </div>
        <UiTable class="w-full text-left text-[13px]">
          <thead>
            <tr class="border-b border-black/[0.06]">
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tl-xl">实验名称</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] text-center w-[100px]">完成率</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] text-center w-[120px]">提交数/总数</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] text-center w-[100px]">平均分</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tr-xl">建议</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in warningExperiments" :key="row.name" class="border-b border-black/[0.04] transition-colors hover:bg-[rgba(194,112,62,0.03)]">
              <td class="py-3 px-3 text-[#1d1d1f] font-medium">{{ row.name }}</td>
              <td class="py-3 px-3 text-center">
                <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold" :class="row.completionRate < 50 ? 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]' : 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]'">
                  {{ row.completionRate }}%
                </span>
              </td>
              <td class="py-3 px-3 text-center text-[#6e6e73]">{{ row.submissionCount }} / {{ overview.studentCount }}</td>
              <td class="py-3 px-3 text-center" :class="row.avgScore < 60 ? 'text-[#c44b3f]' : 'text-[#1d1d1f]'">{{ row.avgScore }}</td>
              <td class="py-3 px-3">
                <span v-if="row.completionRate < 30" class="text-[#c44b3f]">完成率极低，建议检查实验难度或延长截止时间</span>
                <span v-else-if="row.completionRate < 50" class="text-[#c49a3c]">完成率偏低，建议增加辅导答疑</span>
                <span v-else class="text-[#aeaeb2]">完成率一般，可适当关注</span>
              </td>
            </tr>
            <tr v-if="!warningExperiments.length">
              <td colspan="5" class="py-12 text-center text-[#aeaeb2] text-sm">暂无预警数据</td>
            </tr>
          </tbody>
        </UiTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import * as echarts from 'echarts'
import api from '../../api'

const pageLoading = ref(true)
const completionChartRef = ref(null)
const gradeChartRef = ref(null)
const trendChartRef = ref(null)
let completionChartInst = null
let gradeChartInst = null
let trendChartInst = null

const overview = reactive({ experimentCount: 0, classCount: 0, studentCount: 0, avgScore: 0 })
const experimentsData = ref([])
const submissionsData = ref([])

const warningExperiments = computed(() => {
  const total = overview.studentCount || 1
  return experimentsData.value
    .map(e => {
      const subs = submissionsData.value.filter(s => s.experimentId === e.id && s.status === 'completed')
      const scored = subs.filter(s => s.score > 0)
      return {
        name: e.name,
        completionRate: Math.round(((e.submissionCount || subs.length) / total) * 100),
        submissionCount: e.submissionCount || subs.length,
        avgScore: scored.length > 0 ? Math.round(scored.reduce((sum, s) => sum + s.score, 0) / scored.length * 10) / 10 : 0
      }
    })
    .filter(e => e.completionRate < 70)
    .sort((a, b) => a.completionRate - b.completionRate)
})

const loadData = async () => {
  pageLoading.value = true
  try {
    const [classesRes, experimentsRes, submissionsRes] = await Promise.all([
      api.getClassList(),
      api.getTeacherExperimentList({ scope: 'all' }),
      api.getAllStudentExperiments({ scope: 'all' })
    ])

    const classes = Array.isArray(classesRes) ? classesRes : (classesRes?.data || [])
    let exps = []
    if (experimentsRes?.data && Array.isArray(experimentsRes.data)) exps = experimentsRes.data
    else if (Array.isArray(experimentsRes)) exps = experimentsRes
    experimentsData.value = exps
    submissionsData.value = Array.isArray(submissionsRes) ? submissionsRes : []

    overview.experimentCount = exps.length
    overview.classCount = classes.length
    const studentIds = new Set(submissionsData.value.map(s => s.studentId))
    overview.studentCount = studentIds.size || classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)
    const scored = submissionsData.value.filter(s => s.score > 0)
    overview.avgScore = scored.length > 0
      ? Math.round(scored.reduce((sum, s) => sum + s.score, 0) / scored.length * 10) / 10 : 0

    await nextTick()
    initCompletionChart()
    initGradeChart()
    initTrendChart()
  } catch (e) {
    logger.error('加载系部分析数据失败:', e)
    uiMessage.error('加载数据失败')
  } finally {
    pageLoading.value = false
  }
}

const initCompletionChart = () => {
  if (!completionChartRef.value || !experimentsData.value.length) return
  const chart = echarts.init(completionChartRef.value)
  completionChartInst = chart
  const total = overview.studentCount || 1
  const sorted = [...experimentsData.value]
    .map(e => ({ name: e.name, rate: Math.round(((e.submissionCount || 0) / total) * 100) }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10)

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: sorted.map(e => e.name.length > 10 ? e.name.substring(0, 10) + '...' : e.name),
      axisLabel: { interval: 0, rotate: 30, fontSize: 11 }
    },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{
      type: 'bar',
      data: sorted.map(e => ({
        value: e.rate,
        itemStyle: { color: e.rate >= 80 ? '#67C23A' : e.rate >= 60 ? '#d18a61' : e.rate >= 40 ? '#E6A23C' : '#F56C6C' }
      })),
      label: { show: true, position: 'top', formatter: '{c}%' }
    }]
  })
}

const initGradeChart = () => {
  if (!gradeChartRef.value) return
  const chart = echarts.init(gradeChartRef.value)
  gradeChartInst = chart
  const scored = submissionsData.value.filter(s => s.score > 0)
  const ranges = { '<60': 0, '60-69': 0, '70-79': 0, '80-89': 0, '90-100': 0 }
  scored.forEach(s => {
    if (s.score >= 90) ranges['90-100']++
    else if (s.score >= 80) ranges['80-89']++
    else if (s.score >= 70) ranges['70-79']++
    else if (s.score >= 60) ranges['60-69']++
    else ranges['<60']++
  })

  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}人({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{c}人' },
      data: [
        { value: ranges['<60'], name: '不及格', itemStyle: { color: '#F56C6C' } },
        { value: ranges['60-69'], name: '60-69分', itemStyle: { color: '#E6A23C' } },
        { value: ranges['70-79'], name: '70-79分', itemStyle: { color: '#67C23A' } },
        { value: ranges['80-89'], name: '80-89分', itemStyle: { color: '#d18a61' } },
        { value: ranges['90-100'], name: '90-100分', itemStyle: { color: '#8E44AD' } }
      ]
    }]
  })
}

const initTrendChart = () => {
  if (!trendChartRef.value || !experimentsData.value.length) return
  const chart = echarts.init(trendChartRef.value)
  trendChartInst = chart
  const expNames = experimentsData.value.map(e => e.name.length > 10 ? e.name.substring(0, 10) + '...' : e.name)
  const avgScores = experimentsData.value.map(e => {
    const subs = submissionsData.value.filter(s => s.experimentId === e.id && s.score > 0)
    return subs.length > 0 ? Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length * 10) / 10 : 0
  })

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: expNames, axisLabel: { interval: 0, rotate: 30, fontSize: 11 } },
    yAxis: { type: 'value', name: '平均分', min: 0, max: 100 },
    series: [{
      type: 'line', data: avgScores, smooth: true,
      markPoint: { data: [{ type: 'max', name: '最高' }, { type: 'min', name: '最低' }] },
      markLine: { data: [{ type: 'average', name: '平均值' }] },
      areaStyle: { color: 'rgba(209, 138, 97,0.15)' }
    }]
  })
}

const handleDeptResize = () => {
  completionChartInst?.resize()
  gradeChartInst?.resize()
  trendChartInst?.resize()
}

const exportReport = () => {
  const header = '实验名称,完成率%),提交数学生总数,平均分\n'
  const total = overview.studentCount || 1
  const rows = experimentsData.value.map(e => {
    const subs = submissionsData.value.filter(s => s.experimentId === e.id && s.score > 0)
    const avg = subs.length > 0 ? Math.round(subs.reduce((sum, s) => sum + s.score, 0) / subs.length * 10) / 10 : 0
    const rate = Math.round(((e.submissionCount || 0) / total) * 100)
    return `"${e.name}",${rate},${e.submissionCount || 0},${total},${avg}`
  }).join('\n')

  const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `系部分析报告_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  uiMessage.success('报告导出成功')
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleDeptResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleDeptResize)
  completionChartInst?.dispose()
  gradeChartInst?.dispose()
  trendChartInst?.dispose()
})
</script>


