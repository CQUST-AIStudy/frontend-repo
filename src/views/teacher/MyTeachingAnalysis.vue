<template>
  <div class="min-w-0">
    <UiPageHeader title="我的教学分析" description="个人教学数据可视化分析">
      <UiButton @click="refreshData" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">刷新数据</UiButton>
    </UiPageHeader>

    <div v-if="loading" class="space-y-4 py-6">
      <div class="grid grid-cols-3 gap-5 max-[768px]:grid-cols-1">
        <div v-for="i in 3" :key="i" class="h-[100px] rounded-[16px] bg-black/[0.03] animate-pulse"></div>
      </div>
      <div class="grid grid-cols-2 gap-5 max-[768px]:grid-cols-1">
        <div v-for="i in 4" :key="i" class="h-[380px] rounded-[20px] bg-black/[0.03] animate-pulse"></div>
      </div>
    </div>

    <div v-else class="flex flex-col gap-5">
      <!-- 教学概览卡片 -->
      <div class="grid grid-cols-3 gap-5 max-[768px]:grid-cols-1">
        <div class="flex items-center gap-4 p-5 rounded-[16px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div class="w-[52px] h-[52px] rounded-full bg-[rgba(0,122,255,0.08)] flex items-center justify-center">
            <svg class="w-5 h-5 text-[#007aff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div>
            <div class="text-[13px] text-[#6e6e73]">教授班级</div>
            <div class="text-[22px] font-semibold text-[#1d1d1f] mt-1">{{ teachingData.classCounts || 0 }}班</div>
          </div>
        </div>
        <div class="flex items-center gap-4 p-5 rounded-[16px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div class="w-[52px] h-[52px] rounded-full bg-[rgba(52,199,89,0.08)] flex items-center justify-center">
            <svg class="w-5 h-5 text-[#34c759]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <div>
            <div class="text-[13px] text-[#6e6e73]">实验数量</div>
            <div class="text-[22px] font-semibold text-[#1d1d1f] mt-1">{{ teachingData.experimentCounts || 0 }}个</div>
          </div>
        </div>
        <div class="flex items-center gap-4 p-5 rounded-[16px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div class="w-[52px] h-[52px] rounded-full bg-[rgba(255,149,0,0.08)] flex items-center justify-center">
            <svg class="w-5 h-5 text-[#ff9500]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <div>
            <div class="text-[13px] text-[#6e6e73]">学生提交</div>
            <div class="text-[22px] font-semibold text-[#1d1d1f] mt-1">{{ teachingData.submissionCounts || 0 }}份</div>
          </div>
        </div>
      </div>

      <!-- 图表 2x2 -->
      <div class="grid grid-cols-2 gap-5 max-[768px]:grid-cols-1">
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.06]">
            <span class="text-[15px] font-semibold text-[#1d1d1f]">年级学生分布</span>
            <span class="text-[12px] text-[#aeaeb2]" title="不同年级学生的人数分布情况">?</span>
          </div>
          <div class="h-[280px] w-full" ref="gradeDistributionRef"></div>
        </div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.06]">
            <span class="text-[15px] font-semibold text-[#1d1d1f]">实验完成情况</span>
            <span class="text-[12px] text-[#aeaeb2]" title="各个实验的学生完成率">?</span>
          </div>
          <div class="h-[280px] w-full" ref="experimentCompletionRef"></div>
        </div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.06]">
            <span class="text-[15px] font-semibold text-[#1d1d1f]">成绩趋势分析</span>
            <span class="text-[12px] text-[#aeaeb2]" title="不同班级的成绩变化趋势">?</span>
          </div>
          <div class="h-[280px] w-full" ref="scoreTrendRef"></div>
        </div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.06]">
            <span class="text-[15px] font-semibold text-[#1d1d1f]">学生能力分析</span>
            <span class="text-[12px] text-[#aeaeb2]" title="学生在各个能力维度的表现情况">?</span>
          </div>
          <div class="h-[280px] w-full" ref="studentAbilityRef"></div>
        </div>
      </div>

      <!-- 班级列表 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5 overflow-x-auto">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">我的班级</span>
          <UiButton @click="goToClassList" class="text-[13px] font-medium text-[#007aff] hover:text-[#0056b3] transition-colors cursor-pointer bg-transparent border-none">查看所有</UiButton>
        </div>
        <UiTable class="w-full text-left text-[13px]" :aria-busy="loading">
          <thead>
            <tr class="border-b border-black/[0.06]">
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tl-xl w-[100px]">班级ID</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">班级名称</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[100px]">年级</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[100px]">学生数量</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tr-xl w-[100px]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in (teachingData.classes || [])" :key="row.id" class="border-b border-black/[0.04] transition-colors hover:bg-[rgba(0,122,255,0.03)]">
              <td class="py-3 px-3 text-[#6e6e73]">{{ row.id }}</td>
              <td class="py-3 px-3 text-[#1d1d1f] font-medium">{{ row.name }}</td>
              <td class="py-3 px-3 text-[#6e6e73]">{{ row.grade }}</td>
              <td class="py-3 px-3 text-[#1d1d1f]">{{ row.studentCount }}</td>
              <td class="py-3 px-3">
                <a class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors" @click="viewClassAnalysis(row)">查看分析</a>
              </td>
            </tr>
            <tr v-if="!(teachingData.classes || []).length">
              <td colspan="5" class="py-12 text-center text-[#aeaeb2] text-sm">暂无班级数据</td>
            </tr>
          </tbody>
        </UiTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import api from '../../api'

const router = useRouter()
const loading = ref(false)
const teachingData = ref({
  classCounts: 0,
  experimentCounts: 0,
  submissionCounts: 0,
  classes: [],
  gradeDistribution: {},
  experimentCompletion: [],
  scoreTrend: [],
  studentAbilities: {}
})

// Chart refs
const gradeDistributionRef = ref(null)
const experimentCompletionRef = ref(null)
const scoreTrendRef = ref(null)
const studentAbilityRef = ref(null)

// Chart instances
let gradeDistributionChart = null
let experimentCompletionChart = null
let scoreTrendChart = null
let studentAbilityChart = null

// 获取教学数据（全部从真实API获取）
const fetchTeachingData = async () => {
  loading.value = true
  try {
    // 并行获取班级列表、实验列表、所有学生提交数据
    const [classList, expListRes, allSubmissions] = await Promise.all([
      api.getClassList().catch(() => []),
      api.getTeacherExperimentList({ scope: 'all' }).catch(() => ({ data: [] })),
      api.getAllStudentExperiments({ scope: 'all' }).catch(() => [])
    ])

    const myClasses = Array.isArray(classList) ? classList : (classList?.data || [])
    const expList = Array.isArray(expListRes) ? expListRes : (expListRes?.data || expListRes || [])
    const submissions = Array.isArray(allSubmissions) ? allSubmissions : []

    // 计算年级分布（从班级名称提取年级信息）
    const gradeDistribution = {}
    myClasses.forEach(cls => {
      const name = cls.name || cls.className || ''
      // 从班级名中提取年级，如计科23" →"23级
      const match = name.match(/(\d{2})/)
      const grade = match ? match[1] + '级' : '其他'
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + (cls.studentCount || 0)
    })

    // 从真实提交数据计算实验完成情况
    const studentIds = new Set(submissions.map(s => s.studentId || s.student_id))
    const totalStudents = studentIds.size || 1
    const expCompletionMap = {}
    submissions.forEach(s => {
      const eName = s.experimentName || s.experiment_name || ('实验' + (s.experimentId || s.experiment_id))
      if (!expCompletionMap[eName]) expCompletionMap[eName] = new Set()
      expCompletionMap[eName].add(s.studentId || s.student_id)
    })
    const experimentCompletion = Object.entries(expCompletionMap).map(([name, students]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '…' : name,
      completion: Math.round(students.size / totalStudents * 100)
    })).slice(0, 10) // 最多显示10个

    // 从真实数据计算成绩趋势（按实验分组，按班级统计平均分）
    const classNames = [...new Set(submissions.map(s => s.className || s.class_name).filter(Boolean))]
    const expNames = [...new Set(submissions.map(s => s.experimentName || s.experiment_name).filter(Boolean))]
    const scoreTrend = expNames.slice(0, 8).map(eName => {
      const row = { time: eName.length > 8 ? eName.substring(0, 8) + '…' : eName }
      classNames.forEach(cName => {
        const classExpSubs = submissions.filter(s =>
          (s.experimentName || s.experiment_name) === eName &&
          (s.className || s.class_name) === cName &&
          (s.score || 0) > 0
        )
        row[cName] = classExpSubs.length > 0
          ? Math.round(classExpSubs.reduce((sum, s) => sum + (s.score || 0), 0) / classExpSubs.length)
          : null
      })
      return row
    })

    // 从真实数据计算学生能力维度（基于提交情况的统计）
    const totalSubs = submissions.length
    const acSubs = submissions.filter(s => s.status === 'completed' || s.situation === 'C').length
    const acRate = totalSubs > 0 ? Math.round(acSubs / totalSubs * 100) : 0
    // 按实验类型分组统计能力
    const dimMap = { '线性表': [], '栈与队列': [], '树': [], '图': [], '哈希': [], '综合': [] }
    submissions.forEach(s => {
      const eName = (s.experimentName || s.experiment_name || '').toLowerCase()
      const isAc = s.status === 'completed' || s.situation === 'C'
      if (eName.includes('链表') || eName.includes('线性') || eName.includes('顺序')) dimMap['线性表'].push(isAc)
      else if (eName.includes('栈') || eName.includes('队列')) dimMap['栈与队列'].push(isAc)
      else if (eName.includes('树') || eName.includes('bst') || eName.includes('huffman')) dimMap['树'].push(isAc)
      else if (eName.includes('图') || eName.includes('dfs') || eName.includes('bfs') || eName.includes('dijkstra')) dimMap['图'].push(isAc)
      else if (eName.includes('哈希') || eName.includes('hash')) dimMap['哈希'].push(isAc)
      else dimMap['综合'].push(isAc)
    })

    const studentAbilities = Object.entries(dimMap)
      .filter(([, arr]) => arr.length > 0)
      .map(([name, arr]) => ({
        name,
        value: Math.round(arr.filter(Boolean).length / arr.length * 100)
      }))
    if (studentAbilities.length === 0) {
      studentAbilities.push({ name: '整体', value: acRate })
    }

    teachingData.value = {
      classCounts: myClasses.length,
      classes: myClasses,
      experimentCounts: expList.length || expNames.length,
      submissionCounts: totalSubs,
      gradeDistribution,
      experimentCompletion,
      scoreTrend,
      studentAbilities
    }

    setTimeout(() => { initCharts() }, 100)
  } catch (err) {
    logger.error('获取教学数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  // 确保DOM引用已经可用
  if (!gradeDistributionRef.value || !experimentCompletionRef.value ||
      !scoreTrendRef.value || !studentAbilityRef.value) {
    logger.error('图表容器未找到')
    return
  }

  // 清理已有图表
  if (gradeDistributionChart) gradeDistributionChart.dispose()
  if (experimentCompletionChart) experimentCompletionChart.dispose()
  if (scoreTrendChart) scoreTrendChart.dispose()
  if (studentAbilityChart) studentAbilityChart.dispose()

  // 年级分布图表
  initGradeDistributionChart()

  // 实验完成情况
  initExperimentCompletionChart()

  // 成绩趋势
  initScoreTrendChart()

  // 学生能力雷达图
  initStudentAbilityChart()

  // 窗口大小变化时调整图表大小
  window.addEventListener('resize', resizeCharts)
}

// 年级分布图表
const initGradeDistributionChart = () => {
  if (!teachingData.value.gradeDistribution) return

  gradeDistributionChart = echarts.init(gradeDistributionRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '年级分布',
        type: 'pie',
        radius: ['40%', '65%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: Object.keys(teachingData.value.gradeDistribution).map(grade => ({
          name: grade,
          value: teachingData.value.gradeDistribution[grade]
        }))
      }
    ]
  }
  gradeDistributionChart.setOption(option)
}

// 实验完成情况图表
const initExperimentCompletionChart = () => {
  if (!teachingData.value.experimentCompletion) return

  experimentCompletionChart = echarts.init(experimentCompletionRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}%'
    },
    grid: {
      top: '5%',
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: teachingData.value.experimentCompletion.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        type: 'bar',
        data: teachingData.value.experimentCompletion.map(item => ({
          value: item.completion,
        itemStyle: {
            color: item.completion >= 80 ? '#67C23A' :
                  item.completion >= 60 ? '#409EFF' : '#F56C6C'
        }
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
      }
    ]
  }
  experimentCompletionChart.setOption(option)
}

// 成绩趋势图表
const initScoreTrendChart = () => {
  if (!teachingData.value.scoreTrend) return

  scoreTrendChart = echarts.init(scoreTrendRef.value)

  // 从数据中提取班级和时间点
  const classes = Object.keys(teachingData.value.scoreTrend[0]).filter(key => key !== 'time')
  const times = teachingData.value.scoreTrend.map(item => item.time)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: classes,
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      top: '5%',
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: times
    },
    yAxis: {
      type: 'value',
      min: 60,
      max: 100,
      axisLabel: {
        formatter: '{value}分'
      }
    },
    series: classes.map(className => ({
      name: className,
      type: 'line',
      smooth: true,
      data: teachingData.value.scoreTrend.map(item => item[className])
        }))
      }

  scoreTrendChart.setOption(option)
}

// 学生能力雷达图
const initStudentAbilityChart = () => {
  if (!teachingData.value.studentAbilities) return

  studentAbilityChart = echarts.init(studentAbilityRef.value)

  const abilities = teachingData.value.studentAbilities
  const option = {
    tooltip: {},
    radar: {
      indicator: abilities.map(ability => ({
        name: ability.name,
        max: 100
      })),
      radius: '65%',
      center: ['50%', '55%']
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: abilities.map(ability => ability.value),
            name: '能力分布',
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.6)'
            }
          }
        ]
      }
    ]
  }

  studentAbilityChart.setOption(option)
}

// 窗口大小变化时重新调整图表大小
const resizeCharts = () => {
  if (gradeDistributionChart) gradeDistributionChart.resize()
  if (experimentCompletionChart) experimentCompletionChart.resize()
  if (scoreTrendChart) scoreTrendChart.resize()
  if (studentAbilityChart) studentAbilityChart.resize()
}

// 刷新数据
const refreshData = () => {
  fetchTeachingData()
}

// 前往班级分析页面
const viewClassAnalysis = (classInfo) => {
  router.push(`/teacher/class-analysis/${classInfo.id}`)
}

// 前往班级列表页面
const goToClassList = () => {
  router.push('/teacher/class-list')
}

onMounted(() => {
  fetchTeachingData()
})
</script>
