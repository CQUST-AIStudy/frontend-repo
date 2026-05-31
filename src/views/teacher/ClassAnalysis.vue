<template>
  <div class="class-analysis [height:100%] [padding:0_20px_20px]">
    <page-header
        class="my-page-header [padding:20px]"
      title="班级分析"
      :description="`${className || '班级'} - 学习情况分析`"
    >
      <el-button @click="goBack">返回列表</el-button>
    </page-header>

    <div v-if="loading" class="loading-container [display:flex] [justify-content:center] [align-items:center] [min-height:400px] [width:100%]">
      <el-skeleton class="[width:100%]" :rows="10" animated />
    </div>

    <div v-else-if="error" class="error-container [display:flex] [justify-content:center] [align-items:center] [min-height:400px] [width:100%]">
      <el-empty :description="error" :image-size="150">
        <el-button type="primary" @click="loadClassData">重试</el-button>
      </el-empty>
    </div>

    <div class="analysis-content [display:flex] [flex-direction:column] [gap:20px] [padding:10px] [background-color:#f5f7fa] [border-radius:4px] [line-height:1.6]" v-else-if="classData">
      <!-- 实验完成度-->
      <el-card class="chart-card [margin-bottom:20px] [height:400px]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [font-weight:600] [align-items:flex-start] [gap:16px] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>实验完成情况</span>
          </div>
        </template>
        <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]" ref="completionChartRef"></div>
      </el-card>

      <!-- 成绩分布 -->
      <el-card class="chart-card [margin-bottom:20px] [height:400px]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>成绩分布</span>
          </div>
        </template>
        <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]" ref="scoreChartRef"></div>
      </el-card>

      <!-- 优秀学生和学习问题-->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="info-card [height:100%] [margin-bottom:15px]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                <span>优秀学生</span>
              </div>
            </template>
            <el-table :data="classData.topStudents" class="[width:100%]">
              <el-table-column prop="id" label="学号" width="120" />
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="averageScore" label="平均分" />
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="info-card [height:100%] [margin-bottom:15px]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                <span>学习问题</span>
              </div>
            </template>
            <ul class="problem-list [padding-left:20px] [line-height:1.8]">
              <li v-for="(problem, index) in classData.learningProblems" :key="index">
                {{ problem }}
              </li>
            </ul>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 学生实验报告 -->
      <el-card class="student-reports-card [margin-top:20px]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>学生实验报告</span>
            <div class="header-actions [display:flex] [gap:8px] [align-items:center]">
              <el-select v-model="selectedExperiment" placeholder="选择实验" class="[width:220px]">
                <el-option
                  v-for="item in experimentList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
              <el-input
                v-model="studentSearchText"
                placeholder="搜索学生"
                prefix-icon="Search"
                clearable
                class="[width:200px] [margin-left:10px]"
              />
            </div>
          </div>
        </template>
        
        <div v-if="!studentList.length" class="empty-data [padding:40px_0] [display:flex] [justify-content:center] [align-items:center]">
          <el-empty description="暂无学生数据" />
        </div>
        
        <el-table v-else :data="filteredStudents" class="[width:100%]">
          <el-table-column prop="id" label="学号" width="130" />
          <el-table-column prop="name" label="姓名" width="130" />
          <el-table-column prop="class" label="班级" width="200" />
          <el-table-column prop="submitTime" label="提交时间" width="200" />
          <el-table-column prop="score" label="成绩" width="100">
            <template #default="scope">
              <span>{{ scope.row.score || '未评分' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="180">
            <template #default="scope">
              <el-button type="primary" link @click="viewReport(scope.row)">查看报告</el-button>
              <el-button type="primary" link @click="viewSubmission(scope.row)">评阅</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div v-else class="empty-container [display:flex] [justify-content:center] [align-items:center] [min-height:400px] [width:100%]">
      <el-empty description="未找到班级数据" :image-size="150">
        <el-button type="primary" @click="goBack">返回班级列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import api from '../../api'
import PageHeader from '../../components/PageHeader.vue'
import { ElMessage } from 'element-plus'

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
    ElMessage.error('获取班级分析数据失败')
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

  // 窗口大小变化时调整图表大小
  window.addEventListener('resize', () => {
    if (completionChart) completionChart.resize()
    if (scoreChart) scoreChart.resize()
  })
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
</script>


