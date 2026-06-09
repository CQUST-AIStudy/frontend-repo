<template>
  <div class="h-full px-5 pb-5">
    <UiPageHeader
        class="my-page-header p-5"
      title="班级分析"
      :description="`${className || '班级'} - 学习情况分析`"
    >
      <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="goBack">返回列表</UiButton>
    </UiPageHeader>

    <div v-if="loading" class="flex justify-center items-center min-h-[400px] w-full">
      <div class="w-full space-y-4">
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-3/4"></div>
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-full"></div>
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-5/6"></div>
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-2/3"></div>
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-full"></div>
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-4/5"></div>
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-3/4"></div>
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-full"></div>
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-5/6"></div>
        <div class="h-4 bg-[#f5f5f7] rounded-[8px] animate-pulse w-2/3"></div>
      </div>
    </div>

    <div v-else-if="error" class="flex justify-center items-center min-h-[400px] w-full">
      <div class="flex flex-col items-center gap-4">
        <div class="text-5xl"><LucideIcon name="alert-triangle" :size="48" /></div>
        <p class="text-[15px] text-[#6e6e73]">{{ error }}</p>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="loadClassData">重试</UiButton>
      </div>
    </div>

    <div class="flex flex-col gap-5 p-2.5 bg-[#f5f7fa] rounded-[4px] leading-relaxed" v-else-if="classData">
      <!-- 实验完成度-->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-5 h-[400px]">
        <div class="flex justify-between items-center font-semibold gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span>实验完成情况</span>
        </div>
        <div class="h-[320px] w-full relative" ref="completionChartRef"></div>
      </div>

      <!-- 成绩分布 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-5 h-[400px]">
        <div class="flex justify-between items-center font-semibold gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span>成绩分布</span>
        </div>
        <div class="h-[320px] w-full relative" ref="scoreChartRef"></div>
      </div>

      <!-- 优秀学生和学习问题-->
      <div class="grid grid-cols-2 gap-5">
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 h-full">
          <div class="flex justify-between items-center font-semibold gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
            <span>优秀学生</span>
          </div>
          <UiTable class="w-full text-left text-[13px]">
            <thead><tr class="border-b border-black/[0.06]">
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">学号</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">姓名</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">平均分</th>
            </tr></thead>
            <tbody><tr v-for="student in classData.topStudents" :key="student.id" class="border-b border-black/[0.04] hover:bg-[rgba(0,122,255,0.03)]">
              <td class="py-3 px-3">{{ student.id }}</td>
              <td class="py-3 px-3">{{ student.name }}</td>
              <td class="py-3 px-3">{{ student.averageScore }}</td>
            </tr></tbody>
          </UiTable>
        </div>

        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 h-full">
          <div class="flex justify-between items-center font-semibold gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
            <span>学习问题</span>
          </div>
          <ul class="pl-5 leading-[1.8]">
            <li v-for="(problem, index) in classData.learningProblems" :key="index">
              {{ problem }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 学生实验报告 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mt-5">
        <div class="flex justify-between items-center font-semibold gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span>学生实验报告</span>
          <div class="flex gap-2 items-center">
            <UiSelect v-model="selectedExperiment" class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none appearance-none cursor-pointer w-[220px]">
              <UiOption value="" disabled>选择实验</UiOption>
              <UiOption
                v-for="item in experimentList"
                :key="item.id"
                :value="item.id"
              >{{ item.name }}</UiOption>
            </UiSelect>
            <UiInput
              v-model="studentSearchText"
              placeholder="搜索学生"
              class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm w-[200px] ml-2.5"
            />
          </div>
        </div>

        <div v-if="!studentList.length" class="py-10 flex flex-col items-center justify-center">
          <div class="text-5xl mb-3"><LucideIcon name="clipboard-text" :size="48" /></div>
          <p class="text-[15px] text-[#6e6e73]">暂无学生数据</p>
        </div>

        <UiTable v-else class="w-full text-left text-[13px]">
          <thead><tr class="border-b border-black/[0.06]">
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">学号</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">姓名</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">班级</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">提交时间</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">成绩</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">操作</th>
          </tr></thead>
          <tbody><tr v-for="row in filteredStudents" :key="row.id" class="border-b border-black/[0.04] hover:bg-[rgba(0,122,255,0.03)]">
            <td class="py-3 px-3">{{ row.id }}</td>
            <td class="py-3 px-3">{{ row.name }}</td>
            <td class="py-3 px-3">{{ row.class }}</td>
            <td class="py-3 px-3">{{ row.submitTime }}</td>
            <td class="py-3 px-3">{{ row.score || '未评分' }}</td>
            <td class="py-3 px-3">
              <UiButton class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors bg-transparent border-none" @click="viewReport(row)">查看报告</UiButton>
              <UiButton class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors bg-transparent border-none ml-3" @click="viewSubmission(row)">评阅</UiButton>
            </td>
          </tr></tbody>
        </UiTable>
      </div>
    </div>

    <div v-else class="flex justify-center items-center min-h-[400px] w-full">
      <div class="flex flex-col items-center gap-4">
        <div class="text-5xl"><LucideIcon name="inbox" :size="48" /></div>
        <p class="text-[15px] text-[#6e6e73]">未找到班级数据</p>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="goBack">返回班级列表</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import api from '@/api'
import { useRoute, useRouter } from 'vue-router'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import logger from '@/utils/logger'
import LucideIcon from '@/components/LucideIcon.vue'
import { message as uiMessage } from '@/services/feedback'

const route = useRoute()
const router = useRouter()
const classId = computed(() => route.params.id)
const className = ref('')
const classData = ref(null)
const loading = ref(true)
const error = ref('')

const completionChartRef = ref(null)
const scoreChartRef = ref(null)
let completionChart = null
let scoreChart = null

const handleResize = () => {
  completionChart?.resize()
  scoreChart?.resize()
}

const disposeCharts = () => {
  completionChart?.dispose()
  completionChart = null
  scoreChart?.dispose()
  scoreChart = null
}

// 实验列表
const experimentList = ref([])
const selectedExperiment = ref(null)
const studentList = ref([])
const studentSearchText = ref('')

// 根据搜索文本过滤学生
const filteredStudents = computed(() => {
  if (!studentSearchText.value) return studentList.value

  const searchText = studentSearchText.value.toLowerCase()
  return studentList.value.filter(student =>
    student.id.toLowerCase().includes(searchText) ||
    student.name.toLowerCase().includes(searchText)
  )
})

// 加载班级数据
const loadClassData = async () => {
  loading.value = true
  error.value = ''

  try {
    logger.debug('正在加载班级数据，班级ID:', classId.value)

    // 如果没有指定班级ID，先加载班级列表并选择第一个
    if (!classId.value) {
      logger.debug('未指定班级ID，尝试加载第一个班级')
      const classList = await api.getClassList()
      if (classList && classList.length > 0) {
        // 使用第一个班级的ID
        const firstClass = classList[0]
        // 更新URL，不触发新的导航
        router.replace({
          name: 'ClassAnalysis',
          params: { id: firstClass.id }
        })
        return // 路由更新会重新触发组件加载
      } else {
        error.value = '未找到任何班级'
        loading.value = false
        return
      }
    }

    // 加载班级基本信息
    const classList = await api.getClassList()
    const classInfo = classList.find(c => c.id === classId.value)
    if (classInfo) {
      className.value = classInfo.name
      logger.debug('找到班级信息:', classInfo.name)
    } else {
      logger.warn('未找到班级信息，ID:', classId.value)
    }

    // 加载班级分析数据
    logger.debug('正在请求班级分析数据...')
    const data = await api.getClassAnalysis(classId.value)
    logger.debug('班级分析数据获取成功:', data)

    if (data) {
      classData.value = data
      // 确保DOM已经更新后再初始化图表
      setTimeout(() => {
        initCharts()
      }, 100)
    } else {
      error.value = '获取到的班级数据为空'
      logger.error(error.value)
    }
  } catch (err) {
    error.value = '加载班级分析数据失败'
    logger.error('加载班级分析数据失败:', err)
    uiMessage.error('获取班级分析数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  logger.debug('开始初始化图表，DOM引用:',
              '完成率图表:', completionChartRef.value ? '已存在' : '不存在',
              '成绩图表:', scoreChartRef.value ? '已存在' : '不存在')

  // 确保DOM引用和数据都存在
  if (!completionChartRef.value || !scoreChartRef.value || !classData.value) {
    logger.error('图表DOM引用或数据不存在，无法初始化图表')
    return
  }

  disposeCharts()

  // 实验完成度图表
  try {
    // 确保数据结构完整
    if (!classData.value.experimentCompletion || !Array.isArray(classData.value.experimentCompletion)) {
      logger.error('班级数据中缺少experimentCompletion字段或格式不正确')
      classData.value.experimentCompletion = [
        { name: '暂无数据', completion: 0 }
      ]
    }

    completionChart = echarts.init(completionChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: classData.value.experimentCompletion.map(item => item.name)
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
          name: '完成率',
          type: 'bar',
          data: classData.value.experimentCompletion.map(item => item.completion),
          itemStyle: {
            color: function(params) {
              // 根据完成率设置颜色
              const value = params.value;
              if (value >= 85) return '#67C23A';
              if (value >= 70) return '#409EFF';
              if (value >= 60) return '#E6A23C';
              return '#F56C6C';
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%'
          }
        }
      ]
    }
    completionChart.setOption(option)
    logger.debug('完成率图表初始化成功')
  } catch (error) {
    logger.error('初始化完成率图表失败:', error)
  }

  // 成绩分布图表
  try {
    // 确保数据结构完整
    if (!classData.value.scoreDistribution) {
      logger.error('班级数据中缺少scoreDistribution字段')
      classData.value.scoreDistribution = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '<60': 0
      }
    }

    scoreChart = echarts.init(scoreChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'right'
      },
      series: [
        {
          name: '成绩分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: classData.value.scoreDistribution['90-100'] || 0, name: '90-100分' },
            { value: classData.value.scoreDistribution['80-89'] || 0, name: '80-89分' },
            { value: classData.value.scoreDistribution['70-79'] || 0, name: '70-79分' },
            { value: classData.value.scoreDistribution['60-69'] || 0, name: '60-69分' },
            { value: classData.value.scoreDistribution['<60'] || 0, name: '60分以下' }
          ]
        }
      ]
    }
    scoreChart.setOption(option)
    logger.debug('成绩分布图表初始化成功')
  } catch (error) {
    logger.error('初始化成绩分布图表失败', error)
  }
}

// 返回班级列表
const goBack = () => {
  router.push('/teacher/class-list')
}

// 加载实验列表
const normalizeExperimentListResponse = response => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

const loadExperimentList = async () => {
  try {
    const response = await api.getTeacherExperimentList({ classId: classId.value })
    const experiments = normalizeExperimentListResponse(response)
    experimentList.value = experiments

    // 如果有实验，默认选中第一个
    if (experiments.length > 0 && !selectedExperiment.value) {
      selectedExperiment.value = experiments[0].id
    }
  } catch (error) {
    logger.error('加载实验列表失败:', error)
    experimentList.value = []
  }
}

// 加载学生提交
const loadStudentSubmissions = async () => {
  if (!selectedExperiment.value) return

  try {
    const data = await api.getStudentSubmissions(selectedExperiment.value)
    // 过滤出当前班级的学生提交
    studentList.value = data.filter(submission =>
      submission.class === className.value ||
      (classData.value && classData.value.name && submission.class === classData.value.name)
    )
  } catch (error) {
    logger.error('加载学生提交失败:', error)
    studentList.value = []
  }
}

// 查看学生报告
const viewReport = (student) => {
  router.push({
    path: `/teacher/submission-detail/${student.id}`,
    query: {
      report: 'true',
      from: 'class-analysis',
      classId: classId.value
    }
  })
}

// 评阅学生提交
const viewSubmission = (student) => {
  router.push({
    path: `/teacher/submission-detail/${student.id}`,
    query: {
      from: 'class-analysis',
      classId: classId.value
    }
  })
}

// 监听实验选择变化
watch(selectedExperiment, () => {
  loadStudentSubmissions()
})

onMounted(() => {
  window.addEventListener('resize', handleResize)

  loadClassData()

  // 加载实验列表
  loadExperimentList()

  // 模拟加载学生列表数据
  // 实际项目中应该基于selectedExperiment获取对应实验的学生提交
  // 这里仅为示例
  api.getStudentSubmissions().then(data => {
    studentList.value = data
  }).catch(err => {
    logger.error('加载学生提交列表失败:', err)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})
</script>
