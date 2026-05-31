<template>
  <div class="teacher-ai-management [&_.el-card]:[border-radius:16px] [&_.el-card]:[border:1px_solid_#dadce0] [&_.el-card]:[box-shadow:0_1px_3px_rgba(0,0,0,0.04)]">
    <page-header
      class="my-page-header"
      title="教师AI能力管理"
      description="查看教师与学生的AI功能使用概况"
    />

    <div class="management-content [display:flex] [flex-direction:column] [gap:20px] [margin-bottom:40px]">
      <!-- 概览统计 -->
      <el-card class="overview-card [border-radius:20px] [border:1px_solid_#dbe5ef] [box-shadow:0_14px_34px_rgba(22,_48,_79,_0.06)]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [align-items:flex-start] [gap:16px] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>AI使用概览</span>
            <el-button type="primary" size="small" @click="refreshData" :loading="loading">
              刷新数据
            </el-button>
          </div>
        </template>

        <div class="stats-cards [display:flex] [flex-wrap:wrap] [gap:15px] [margin-bottom:20px]">
          <div class="stat-card [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]" v-for="(stat, index) in statistics" :key="index">
            <div class="stat-value [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [color:#202124] [margin-bottom:5px]">{{ stat.value }}</div>
            <div class="stat-label [font-size:12px] [color:#5f6368] [margin-top:10px] [color:#606266] [font-size:13px] [margin-top:4px]">{{ stat.label }}</div>
          </div>
        </div>

        <div class="charts-container [display:flex] [flex-wrap:wrap] [gap:20px] [margin-top:10px]">
          <div class="chart-wrapper [flex:1] [min-width:45%]">
            <h4>各实验完成情况</h4>
            <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]" ref="completionChartRef"></div>
          </div>
          <div class="chart-wrapper [flex:1] [min-width:45%]">
            <h4>成绩分布</h4>
            <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]" ref="scoreDistChartRef"></div>
          </div>
        </div>
      </el-card>

      <!-- 班级学生列表 -->
      <el-card class="teacher-management-card">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>学生实验数据</span>
            <el-input
              v-model="searchQuery"
              placeholder="搜索学生姓名或学号"
              class="search-input [width:250px]"
              clearable
              prefix-icon="Search"
            />
          </div>
        </template>

        <el-table
          :data="pagedStudents"
          class="[width:100%]"
          border
          v-loading="loading"
        >
          <el-table-column prop="studentId" label="学号" width="130" />
          <el-table-column prop="studentName" label="姓名" width="100" />
          <el-table-column prop="className" label="班级" width="160" />
          <el-table-column prop="experimentCount" label="实验数" width="90" sortable />
          <el-table-column prop="completedCount" label="已完成" width="90" sortable />
          <el-table-column label="完成率" width="120" sortable :sort-by="row => row.completionRate">
            <template #default="{ row }">
              <el-progress :percentage="row.completionRate" :color="row.completionRate >= 80 ? '#67C23A' : row.completionRate >= 50 ? '#E6A23C' : '#F56C6C'" :stroke-width="10" />
            </template>
          </el-table-column>
          <el-table-column prop="averageScore" label="平均分" width="90" sortable>
            <template #default="{ row }">
              <span :class="averageScoreClass(row.averageScore)">
                {{ row.averageScore || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="highestScore" label="最高分" width="90" />
          <el-table-column prop="lowestScore" label="最低分" width="90" />
        </el-table>

        <div class="pagination-container [margin-top:20px] [display:flex] [justify-content:center] [overflow-x:auto] [margin-top:10px] [text-align:right] [justify-content:flex-end] [margin-top:16px]">
          <el-pagination
            layout="total, sizes, prev, pager, next"
            :total="filteredStudents.length"
            v-model:page-size="pageSize"
            v-model:current-page="currentPage"
            :page-sizes="[10, 20, 50]"
          />
        </div>
      </el-card>

      <!-- AI模型配置 -->
      <el-card class="model-config-card [margin-bottom:20px]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>AI模型配置</span></div>
        </template>
        <el-form :model="modelConfig" label-position="top">
          <el-form-item label="AI助手模型">
            <el-select v-model="modelConfig.model" class="[width:100%]">
              <el-option label="DeepSeek Chat (当前)" value="deepseek-chat" />
              <el-option label="DeepSeek Coder" value="deepseek-coder" />
            </el-select>
          </el-form-item>
          <el-collapse>
            <el-collapse-item title="高级参数" name="1">
              <el-form-item label="温度 (Temperature)">
                <el-slider v-model="modelConfig.temperature" :min="0" :max="1" :step="0.01" show-input />
              </el-form-item>
              <el-form-item label="最大输出长度">
                <el-slider v-model="modelConfig.maxTokens" :min="100" :max="4000" :step="100" show-input />
              </el-form-item>
            </el-collapse-item>
          </el-collapse>
          <el-form-item class="[margin-top:16px]">
            <el-button type="primary" @click="saveModelConfig">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, reactive, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
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
  if (score >= 80) return '[color:#67C23A]'
  if (score >= 60) return '[color:#E6A23C]'
  return '[color:#F56C6C]'
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


