<template>
  <div class="space-y-5">
    <page-header
      class="my-page-header"
      title="教师AI能力管理"
      description="查看教师与学生的AI功能使用概况"
    />

    <div class="flex flex-col gap-5 mb-10">
      <!-- 概览统计 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5">
        <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">AI使用概览</span>
          <button
            class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50"
            @click="refreshData"
            :disabled="loading"
          >
            {{ loading ? '加载中...' : '刷新数据' }}
          </button>
        </div>

        <div class="flex flex-wrap gap-4 mb-5">
          <div
            v-for="(stat, index) in statistics"
            :key="index"
            class="flex-1 min-w-[180px] text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[10px] border border-black/[0.06]"
          >
            <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ stat.value }}</div>
            <div class="text-[13px] text-[#6e6e73] mt-1">{{ stat.label }}</div>
          </div>
        </div>

        <div class="flex flex-wrap gap-5 mt-2.5">
          <div class="flex-1 min-w-[45%]">
            <h4 class="text-sm font-semibold text-[#1d1d1f] mb-2">各实验完成情况</h4>
            <div class="h-[320px] w-full relative" ref="completionChartRef"></div>
          </div>
          <div class="flex-1 min-w-[45%]">
            <h4 class="text-sm font-semibold text-[#1d1d1f] mb-2">成绩分布</h4>
            <div class="h-[320px] w-full relative" ref="scoreDistChartRef"></div>
          </div>
        </div>
      </div>

      <!-- 班级学生列表 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5">
        <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">学生实验数据</span>
          <input
            v-model="searchQuery"
            placeholder="搜索学生姓名或学号"
            class="w-[250px] h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm"
          />
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12 text-[#6e6e73] text-sm">
          加载中...
        </div>

        <div v-else class="overflow-x-auto rounded-[12px] border border-black/[0.06]">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-[#f5f5f7]/80">
                <th class="px-3 py-2.5 text-left text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">学号</th>
                <th class="px-3 py-2.5 text-left text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">姓名</th>
                <th class="px-3 py-2.5 text-left text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">班级</th>
                <th class="px-3 py-2.5 text-left text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">实验数</th>
                <th class="px-3 py-2.5 text-left text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">已完成</th>
                <th class="px-3 py-2.5 text-left text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">完成率</th>
                <th class="px-3 py-2.5 text-left text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">平均分</th>
                <th class="px-3 py-2.5 text-left text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">最高分</th>
                <th class="px-3 py-2.5 text-left text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide">最低分</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagedStudents.length === 0">
                <td colspan="9" class="px-3 py-8 text-center text-[#6e6e73]">暂无数据</td>
              </tr>
              <tr
                v-for="row in pagedStudents"
                :key="row.studentId"
                class="border-t border-black/[0.04] hover:bg-[#f5f5f7]/60 transition-colors"
              >
                <td class="px-3 py-2.5 text-[#1d1d1f]">{{ row.studentId }}</td>
                <td class="px-3 py-2.5 text-[#1d1d1f]">{{ row.studentName }}</td>
                <td class="px-3 py-2.5 text-[#1d1d1f]">{{ row.className }}</td>
                <td class="px-3 py-2.5 text-[#1d1d1f]">{{ row.experimentCount }}</td>
                <td class="px-3 py-2.5 text-[#1d1d1f]">{{ row.completedCount }}</td>
                <td class="px-3 py-2.5">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-black/[0.04] rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="row.completionRate >= 80 ? 'bg-[#34c759]' : row.completionRate >= 50 ? 'bg-[#ff9500]' : 'bg-[#ff3b30]'"
                        :style="{ width: row.completionRate + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs text-[#6e6e73] w-9 text-right">{{ row.completionRate }}%</span>
                  </div>
                </td>
                <td class="px-3 py-2.5">
                  <span :class="averageScoreClass(row.averageScore)">
                    {{ row.averageScore || '-' }}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-[#1d1d1f]">{{ row.highestScore }}</td>
                <td class="px-3 py-2.5 text-[#1d1d1f]">{{ row.lowestScore }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-end">
          <AppPagination
            :current="currentPage"
            :total="filteredStudents.length"
            :page-size="pageSize"
            @update:current="handlePageChange"
          />
        </div>
      </div>

      <!-- AI模型配置 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5">
        <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">AI模型配置</span>
        </div>

        <div class="space-y-5 max-w-xl">
          <div>
            <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">AI助手模型</label>
            <select
              v-model="modelConfig.model"
              class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="deepseek-chat">DeepSeek Chat (当前)</option>
              <option value="deepseek-coder">DeepSeek Coder</option>
            </select>
          </div>

          <!-- 高级参数折叠 -->
          <details class="group">
            <summary class="text-sm font-medium text-[#1d1d1f] cursor-pointer select-none flex items-center gap-1.5 hover:text-[#007aff] transition-colors">
              <svg class="w-3.5 h-3.5 transition-transform group-open:rotate-90" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              高级参数
            </summary>
            <div class="mt-4 space-y-4 pl-5">
              <div>
                <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">温度 (Temperature): {{ modelConfig.temperature }}</label>
                <input
                  type="range"
                  v-model.number="modelConfig.temperature"
                  min="0"
                  max="1"
                  step="0.01"
                  class="w-full h-2 bg-[#f5f5f7] rounded-full appearance-none cursor-pointer accent-[#007aff]"
                />
              </div>
              <div>
                <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">最大输出长度: {{ modelConfig.maxTokens }}</label>
                <input
                  type="range"
                  v-model.number="modelConfig.maxTokens"
                  min="100"
                  max="4000"
                  step="100"
                  class="w-full h-2 bg-[#f5f5f7] rounded-full appearance-none cursor-pointer accent-[#007aff]"
                />
              </div>
            </div>
          </details>

          <div class="pt-2">
            <button
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none"
              @click="saveModelConfig"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, reactive, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import AppPagination from '../../components/AppPagination.vue'
import api from '../../api'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const searchQuery = ref('')
const pageSize = ref(10)
const currentPage = ref(1)

const completionChartRef = ref(null)
const scoreDistChartRef = ref(null)

function averageScoreClass(score) {
  if (score >= 80) return 'text-[#34c759] font-semibold'
  if (score >= 60) return 'text-[#ff9500] font-semibold'
  return 'text-[#ff3b30] font-semibold'
}

function handlePageChange(page) {
  currentPage.value = page
}

const statistics = ref([
  { label: '学生总数', value: '-' },
  { label: '实验总数', value: '-' },
  { label: '平均完成率', value: '-' },
  { label: '班级平均分', value: '-' }
])

const allStudentData = ref([])
const studentSummary = ref([])

const modelConfig = reactive({
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2000
})

const filteredStudents = computed(() => {
  if (!searchQuery.value) return studentSummary.value
  const q = searchQuery.value.toLowerCase()
  return studentSummary.value.filter(s =>
    (s.studentName || '').toLowerCase().includes(q) ||
    String(s.studentId).includes(q)
  )
})

const pagedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStudents.value.slice(start, start + pageSize.value)
})

const refreshData = async () => {
  loading.value = true
  try {
    const [allExps, expList] = await Promise.all([
      api.getAllStudentExperiments({ scope: 'all' }),
      api.getTeacherExperimentList({ scope: 'all' })
    ])

    allStudentData.value = allExps || []
    const experiments = expList?.data || expList || []
    const totalExperiments = Array.isArray(experiments) ? experiments.length : 0

    // 按学生聚合
    const studentMap = {}
    allStudentData.value.forEach(s => {
      const id = s.studentId
      if (!studentMap[id]) {
        studentMap[id] = {
          studentId: id,
          studentName: s.studentName || '未知',
          className: s.className || '-',
          submissions: []
        }
      }
      studentMap[id].submissions.push(s)
    })

    const summaries = Object.values(studentMap).map(st => {
      const scored = st.submissions.filter(s => s.score > 0)
      const completed = st.submissions.filter(s => s.status === 'completed')
      const scores = scored.map(s => s.score)
      return {
        ...st,
        experimentCount: st.submissions.length,
        completedCount: completed.length,
        completionRate: totalExperiments > 0 ? Math.round(completed.length / totalExperiments * 100) : 0,
        averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0,
        highestScore: scores.length > 0 ? Math.max(...scores) : '-',
        lowestScore: scores.length > 0 ? Math.min(...scores) : '-'
      }
    })

    studentSummary.value = summaries.sort((a, b) => b.averageScore - a.averageScore)

    // 更新统计
    const allScored = allStudentData.value.filter(s => s.score > 0)
    const avgScore = allScored.length > 0
      ? Math.round(allScored.reduce((a, b) => a + b.score, 0) / allScored.length * 10) / 10 : 0
    const avgCompletion = summaries.length > 0
      ? Math.round(summaries.reduce((a, b) => a + b.completionRate, 0) / summaries.length) : 0

    statistics.value = [
      { label: '学生总数', value: summaries.length },
      { label: '实验总数', value: totalExperiments },
      { label: '平均完成率', value: avgCompletion + '%' },
      { label: '班级平均分', value: avgScore }
    ]

    await nextTick()
    renderCompletionChart(experiments)
    renderScoreDistChart(allScored)
  } catch (e) {
    logger.error('加载数据失败:', e)
    ElMessage.error('加载数据失败: ' + (e.message || ''))
  } finally {
    loading.value = false
  }
}

const completionChart = ref(null)
const scoreDistChart = ref(null)

const renderCompletionChart = (experiments) => {
  if (!completionChartRef.value || !Array.isArray(experiments)) return
  completionChart.value?.dispose()
  const chart = echarts.init(completionChartRef.value)
  completionChart.value = chart
  const studentCount = studentSummary.value.length || 1
  const names = experiments.map(e => e.name || '实验')
  const rates = experiments.map(e => {
    const completed = allStudentData.value.filter(s => s.experimentId === e.id && s.status === 'completed').length
    return Math.round(completed / studentCount * 100)
  })
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: names, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: 'value', max: 100, name: '完成率' },
    series: [{ type: 'bar', data: rates, itemStyle: { color: '#409EFF' }, barWidth: '50%' }],
    grid: { left: 50, right: 20, bottom: 60, top: 30 }
  })
  window.addEventListener('resize', handleResize)
}

const renderScoreDistChart = (scored) => {
  if (!scoreDistChartRef.value) return
  scoreDistChart.value?.dispose()
  const chart = echarts.init(scoreDistChartRef.value)
  scoreDistChart.value = chart
  const dist = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 }
  scored.forEach(s => {
    if (s.score >= 90) dist['90-100']++
    else if (s.score >= 80) dist['80-89']++
    else if (s.score >= 70) dist['70-79']++
    else if (s.score >= 60) dist['60-69']++
    else dist['<60']++
  })
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: ['35%', '65%'],
      label: { show: true, formatter: '{b}: {c}' },
      data: [
        { value: dist['90-100'], name: '90-100', itemStyle: { color: '#67C23A' } },
        { value: dist['80-89'], name: '80-89', itemStyle: { color: '#409EFF' } },
        { value: dist['70-79'], name: '70-79', itemStyle: { color: '#E6A23C' } },
        { value: dist['60-69'], name: '60-69', itemStyle: { color: '#F56C6C' } },
        { value: dist['<60'], name: '<60', itemStyle: { color: '#909399' } }
      ]
    }]
  })
  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  completionChart.value?.resize()
  scoreDistChart.value?.resize()
}

const saveModelConfig = () => {
  localStorage.setItem('ai_model_config', JSON.stringify(modelConfig))
  ElMessage.success('AI模型配置已保存')
}

onMounted(() => {
  const saved = localStorage.getItem('ai_model_config')
  if (saved) { try { Object.assign(modelConfig, JSON.parse(saved)) } catch (e) { /* ignore */ } }
  refreshData()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  completionChart.value?.dispose()
  scoreDistChart.value?.dispose()
})
</script>
