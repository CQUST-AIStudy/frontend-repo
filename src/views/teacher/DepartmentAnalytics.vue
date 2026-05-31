<template>
  <div class="department-analytics [&_.el-card]:[border-radius:16px] [&_.el-card]:[border:1px_solid_#dadce0] [&_.el-card]:[box-shadow:0_1px_3px_rgba(0,0,0,0.04)]">
    <page-header
      class="my-page-header"
      title="系部分析"
      description="基于真实教学数据的系部统计分析"
    />

    <div class="analytics-content [display:flex] [flex-direction:column] [gap:20px]" v-loading="pageLoading">
      <!-- 概览卡片 -->
      <el-card class="overview-card [border-radius:20px] [border:1px_solid_#dbe5ef] [box-shadow:0_14px_34px_rgba(22,_48,_79,_0.06)]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [align-items:flex-start] [gap:16px] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>教学概览</span></div>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]">
              <div class="stat-value [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [color:#202124] [margin-bottom:5px]">{{ overview.experimentCount }}</div>
              <div class="stat-title [font-size:13px] [color:#5f6368]">实验总数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]">
              <div class="stat-value [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [color:#202124] [margin-bottom:5px]">{{ overview.classCount }}</div>
              <div class="stat-title [font-size:13px] [color:#5f6368]">班级数量</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]">
              <div class="stat-value [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [color:#202124] [margin-bottom:5px]">{{ overview.studentCount }}</div>
              <div class="stat-title [font-size:13px] [color:#5f6368]">学生总数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]">
              <div class="stat-value [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [color:#202124] [margin-bottom:5px]">{{ overview.avgScore }}</div>
              <div class="stat-title [font-size:13px] [color:#5f6368]">平均分</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <el-row :gutter="20" class="chart-row [margin-bottom:0] [margin-bottom:20px]">
        <!-- 实验完成率排行-->
        <el-col :span="12">
          <el-card class="chart-card [margin-bottom:20px] [height:400px]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>实验完成率排行</span></div>
            </template>
            <div ref="completionChartRef" class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]"></div>
          </el-card>
        </el-col>
        <!-- 成绩分布 -->
        <el-col :span="12">
          <el-card class="chart-card [margin-bottom:20px] [height:400px]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>全部学生成绩分布</span></div>
            </template>
            <div ref="gradeChartRef" class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row [margin-bottom:0] [margin-bottom:20px]">
        <!-- 各实验平均分趋势 -->
        <el-col :span="24">
          <el-card class="chart-card [margin-bottom:20px] [height:400px]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>各实验平均分趋势</span></div>
            </template>
            <div ref="trendChartRef" class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 低完成率实验预警 -->
      <el-card class="table-card [margin-bottom:20px] [margin-bottom:15px] [border-radius:8px] [overflow:hidden] [padding:10px]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>低完成率实验预警</span>
            <el-button type="primary" size="small" @click="exportReport">导出报告</el-button>
          </div>
        </template>
        <el-table :data="warningExperiments" class="[width:100%]" stripe>
          <el-table-column prop="name" label="实验名称" min-width="200" show-overflow-tooltip />
          <el-table-column label="完成率" width="120" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.completionRate < 50 ? 'danger' : 'warning'" size="small">
                {{ scope.row.completionRate }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="提交数总数" width="120" align="center">
            <template #default="scope">
              {{ scope.row.submissionCount }} / {{ overview.studentCount }}
            </template>
          </el-table-column>
          <el-table-column label="平均分" width="100" align="center">
            <template #default="scope">
              <span :class="averageScoreClass(scope.row.avgScore)">
                {{ scope.row.avgScore }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="建议" min-width="200">
            <template #default="scope">
              <span v-if="scope.row.completionRate < 30" class="[color:#F56C6C]">
                完成率极低，建议检查实验难度或延长截止时间
              </span>
              <span v-else-if="scope.row.completionRate < 50" class="[color:#E6A23C]">
                完成率偏低，建议增加辅导答疑
              </span>
              <span v-else class="[color:#909399]">
                完成率一般，可适当关注
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import api from '../../api'

function averageScoreClass(score) {
  return score < 60 ? '[color:#F56C6C]' : '[color:#303133]'
}

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
    ElMessage.error('加载数据失败')
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
        itemStyle: { color: e.rate >= 80 ? '#67C23A' : e.rate >= 60 ? '#409EFF' : e.rate >= 40 ? '#E6A23C' : '#F56C6C' }
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
        { value: ranges['80-89'], name: '80-89分', itemStyle: { color: '#409EFF' } },
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
      areaStyle: { color: 'rgba(64,158,255,0.15)' }
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
  ElMessage.success('报告导出成功')
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


