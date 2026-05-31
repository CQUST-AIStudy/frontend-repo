<template>
  <div class="experiment-detail [padding:20px]">
    <page-header
        class="my-page-header [margin-bottom:20px]"
      title="实验详情"
      :description="experimentData.name || '加载中..'"
    >
      <el-button @click="goBack">返回列表</el-button>
    </page-header>

    <div class="detail-content [background:#fff] [padding:20px] [border-radius:4px] [display:flex] [flex-direction:column] [gap:15px]" v-loading="loading">
      <!-- 实验数据统计卡片 -->
      <el-row :gutter="20" class="stat-row [margin-bottom:20px]">
        <el-col :span="6">
          <el-card class="stat-card [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-value [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [color:#202124] [margin-bottom:5px]">{{ submissionStats.totalStudents }}</div>
            <div class="stat-label [font-size:14px] [color:#999] [font-size:12px] [color:#5f6368] [margin-top:10px] [color:#606266] [font-size:13px] [margin-top:4px]">学生总数</div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-value [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [color:#202124] [margin-bottom:5px]">{{ submissionStats.submittedCount }}</div>
            <div class="stat-label [font-size:14px] [color:#999] [font-size:12px] [color:#5f6368] [margin-top:10px] [color:#606266] [font-size:13px] [margin-top:4px]">已提交数量</div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-value accent-blue [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [color:#202124] [margin-bottom:5px]">{{ submissionStats.completionRate }}%</div>
            <div class="stat-label [font-size:14px] [color:#999] [font-size:12px] [color:#5f6368] [margin-top:10px] [color:#606266] [font-size:13px] [margin-top:4px]">完成率</div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [border:1px_solid_#dadce0] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-value [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [color:#202124] [margin-bottom:5px]" :class="getScoreClass(submissionStats.averageScore)">
              {{ submissionStats.averageScore || '暂无' }}
            </div>
            <div class="stat-label [font-size:14px] [color:#999] [font-size:12px] [color:#5f6368] [margin-top:10px] [color:#606266] [font-size:13px] [margin-top:4px]">平均分</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 基本信息卡片 -->
      <el-card class="detail-card [margin-bottom:20px]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [align-items:flex-start] [gap:16px] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>基本信息</span>
            <el-button type="primary" link @click="openEditDialog">编辑</el-button>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="实验名称">{{ experimentData.name }}</el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ formatDate(experimentData.deadline) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(experimentData.createdTime) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(experimentData.status)">
              {{ getStatusText(experimentData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交数">{{ submissionStats.submittedCount }}</el-descriptions-item>
          <el-descriptions-item label="平均分">
            {{ submissionStats.averageScore !== null ? submissionStats.averageScore : '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="关联班级" :span="2">
            {{ experimentData.classes ? experimentData.classes.join('、') : '所有班级' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建者">{{ experimentData.createdBy || '当前教师' }}</el-descriptions-item>
          <el-descriptions-item label="难度级别">
            <el-rate
              v-model="experimentData.difficulty"
              disabled
              show-score
              text-color="#ff9900"
            />
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 实验要求卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>实验要求</span>
            <el-button type="primary" link @click="openEditContentDialog">编辑内容</el-button>
          </div>
        </template>

        <el-empty description="实验要求暂未编辑" v-if="!experimentData.description">
          <el-button type="primary" @click="openEditContentDialog">添加实验要求</el-button>
        </el-empty>

        <div v-else class="experiment-content">
          <h3>实验描述</h3>
          <p class="experimentDescription">{{ experimentData.description }}</p>

          <h3>实验要求</h3>
          <ul class="experimentRequest [padding-left:30px]">
            <li v-for="(req, index) in experimentData.requirements" :key="index">
              {{ req }}
            </li>
          </ul>

          <h3 v-if="experimentData.attachments && experimentData.attachments.length">附件</h3>
          <ul v-if="experimentData.attachments && experimentData.attachments.length">
            <li v-for="(attachment, index) in experimentData.attachments" :key="index">
              <el-link type="primary" :href="attachment.url" target="_blank">
                {{ attachment.name }}
              </el-link>
            </li>
          </ul>
        </div>
      </el-card>

      <!-- 提交情况图表 -->
      <el-row :gutter="20" class="chart-row [margin-bottom:0] [margin-bottom:20px]">
        <el-col :span="12">
          <el-card class="chart-card [margin-bottom:20px] [height:400px]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                <span>提交情况统计</span>
              </div>
            </template>
            <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]" ref="submissionChartRef"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card [margin-bottom:20px] [height:400px]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                <span>成绩分布</span>
              </div>
            </template>
            <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]" ref="scoreChartRef"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 学生提交列表 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>学生提交情况</span>
            <div class="header-actions [display:flex] [gap:8px] [align-items:center]">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索学生姓名/班级"
                prefix-icon="Search"
                clearable
                class="[width:220px] [margin-right:10px]"
              />
              <el-button type="primary" @click="viewAllSubmissions">查看全部</el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="filteredSubmissions"
          class="[width:100%]"
          border
          stripe
          v-loading="submissionsLoading"
          max-height="500"
        >
          <el-table-column prop="studentName" label="学生姓名" width="120" sortable />
          <el-table-column prop="class" label="班级" width="160" sortable />
          <el-table-column prop="submitTime" label="提交时间" width="180" sortable>
            <template #default="scope">
              <span v-if="scope.row.submitTime">{{ formatDate(scope.row.submitTime) }}</span>
              <span v-else class="text-muted [color:#9aa0a6] [font-size:13px] [color:#909399]">未提交</span>
            </template>
          </el-table-column>
          <el-table-column label="得分" width="100" sortable>
            <template #default="scope">
              <span v-if="scope.row.score !== null && scope.row.score !== undefined"
                    :class="getScoreClass(scope.row.score)">
                {{ scope.row.score }}
              </span>
              <span v-else class="text-muted [color:#9aa0a6] [font-size:13px] [color:#909399]">未评分</span>
            </template>
          </el-table-column>
          <el-table-column label="查重率" width="100" align="center">
            <template #default="scope">
              <el-tag
                v-if="scope.row.plagiarismRate !== null && scope.row.plagiarismRate !== undefined"
                :type="getPlagiarismRateType(scope.row.plagiarismRate)"
                size="small"
              >
                {{ scope.row.plagiarismRate }}%
              </el-tag>
              <span v-else class="text-muted [color:#9aa0a6] [font-size:13px] [color:#909399]">未检测</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag
                :type="getSubmissionStatusType(scope.row.status)"
                size="small"
                effect="dark"
              >
                {{ getSubmissionStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                link
                @click="viewSubmissionDetail(scope.row.id)"
              >
                查看详情
              </el-button>
              <el-button
                type="success"
                link
                @click="gradeSubmission(scope.row)"
                v-if="scope.row.status === 'submitted'"
              >
                评分
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页器-->
        <div class="pagination-container [margin-top:20px] [display:flex] [justify-content:center] [overflow-x:auto] [margin-top:10px] [text-align:right] [justify-content:flex-end] [margin-top:16px]" v-if="allSubmissions.length > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="allSubmissions.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 编辑实验基本信息对话框-->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑实验"
      width="500px"
      destroy-on-close
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="实验名称">
          <el-input v-model="editForm.name" placeholder="请输入实验名称" />
        </el-form-item>

        <el-form-item label="截止日期">
          <el-date-picker
            v-model="editForm.deadline"
            type="datetime"
            placeholder="选择截止日期"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="[width:100%]"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="选择实验状态" class="[width:100%]">
            <el-option label="草稿" value="draft" />
            <el-option label="进行中" value="active" />
            <el-option label="已截止" value="expired" />
          </el-select>
        </el-form-item>

        <el-form-item label="关联班级">
          <el-select
            v-model="editForm.classes"
            multiple
            placeholder="选择关联班级"
            class="[width:100%]"
          >
            <el-option
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="难度级别">
          <el-rate
            v-model="editForm.difficulty"
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer [display:flex] [justify-content:flex-end] [gap:10px]">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑实验内容对话框-->
    <el-dialog
      v-model="editContentDialogVisible"
      title="编辑实验内容"
      width="700px"
      destroy-on-close
    >
      <el-form :model="contentForm" label-width="100px">
        <el-form-item label="实验描述">
          <el-input
            v-model="contentForm.description"
            type="textarea"
            :rows="5"
            placeholder="请输入实验描述"
          />
        </el-form-item>

        <el-form-item label="实验要求">
          <div v-for="(req, index) in contentForm.requirements" :key="index" class="requirement-item [display:flex] [align-items:center] [margin-bottom:10px]">
            <el-input v-model="contentForm.requirements[index]" class="requirement-input [flex:1]" />
            <el-button
              type="danger"
              circle
              @click="removeRequirement(index)"
              size="small"
              class="requirement-delete [margin-left:10px]"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button type="primary" plain @click="addRequirement">添加要求</el-button>
        </el-form-item>

        <el-form-item label="附件">
          <el-upload
            action="#"
            :auto-upload="false"
            multiple
            :limit="5"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">可上传任意类型文件，单个文件不超过0MB</div>
            </template>
          </el-upload>

          <div v-if="contentForm.attachments && contentForm.attachments.length" class="attachments-list [margin-top:10px]">
            <div v-for="(file, index) in contentForm.attachments" :key="index" class="attachment-item [display:flex] [align-items:center] [margin-bottom:10px]">
              <span>{{ file.name }}</span>
              <el-button
                type="danger"
                size="small"
                circle
                @click="removeAttachment(index)"
                class="attachment-delete [margin-left:10px]"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer [display:flex] [justify-content:flex-end] [gap:10px]">
          <el-button @click="editContentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitContentForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 评分对话框-->
    <el-dialog
      v-model="gradeDialogVisible"
      title="评分"
      width="500px"
      destroy-on-close
    >
      <el-form :model="gradeForm" label-width="100px">
        <el-form-item label="学生姓名">
          <span>{{ currentSubmission ? currentSubmission.studentName : '' }}</span>
        </el-form-item>

        <el-form-item label="得分">
          <el-input-number
            v-model="gradeForm.score"
            :min="0"
            :max="100"
            :precision="1"
            class="[width:180px]"
          />
        </el-form-item>

        <el-form-item label="查重率">
          <el-input-number
            v-model="gradeForm.plagiarismRate"
            :min="0"
            :max="100"
            :precision="1"
            class="[width:180px]"
          />
          <span class="rate-unit [margin-left:5px]">%</span>
        </el-form-item>

        <el-form-item label="AI评语">
          <el-input
            v-model="gradeForm.aiComment"
            type="textarea"
            :rows="6"
            placeholder="输入AI助教评语"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer [display:flex] [justify-content:flex-end] [gap:10px]">
          <el-button @click="gradeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGrade">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Delete } from '@element-plus/icons-vue'
import api from '../../api'
import PageHeader from '../../components/PageHeader.vue'

const route = useRoute()
const router = useRouter()

const normalizeStudentId = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const parseSubmissionCompositeId = (submissionId) => {
  if (typeof submissionId !== 'string') return null
  const separatorIndex = submissionId.lastIndexOf('-')
  if (separatorIndex <= 0 || separatorIndex >= submissionId.length - 1) return null
  return {
    studentId: submissionId.slice(0, separatorIndex),
    experimentId: Number(submissionId.slice(separatorIndex + 1))
  }
}

const experimentId = ref(Number(route.params.id))
const loading = ref(true)
const submissionsLoading = ref(false)

// 统计图表容器引用
const submissionChartRef = ref(null)
const scoreChartRef = ref(null)
let submissionChart = null
let scoreChart = null

// 实验详情数据
const experimentData = ref({
  id: experimentId.value,
  name: '加载中..',
  deadline: '',
  createdTime: '',
  status: '',
  submissionCount: 0,
  averageScore: null,
  description: '',
  requirements: [],
  classes: [],
  createdBy: '',
  difficulty: 3,  // 1-5的难度评级
  attachments: []
})

// 学生提交数据
const allSubmissions = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')

// 根据分页和搜索过滤后的提交列表
const filteredSubmissions = computed(() => {
  let result = [...allSubmissions.value]

  // 按搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => {
      return (
        (item.studentName && item.studentName.toLowerCase().includes(keyword)) ||
        (item.class && item.class.toLowerCase().includes(keyword))
      )
    })
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 提交统计
const submissionStats = reactive({
  totalStudents: 0,
  submittedCount: 0,
  completionRate: 0,
  averageScore: 0
})

// 班级列表
const syncSubmissionStats = (submissions) => {
  const studentIds = new Set(submissions.map(s => normalizeStudentId(s.studentId)))
  submissionStats.totalStudents = studentIds.size || submissions.length
  submissionStats.submittedCount = submissions.filter(sub =>
    sub.status === 'submitted' || sub.status === 'graded'
  ).length
  submissionStats.completionRate = submissionStats.totalStudents > 0
    ? Math.round((submissionStats.submittedCount / submissionStats.totalStudents) * 100)
    : 0

  const scoredSubmissions = submissions.filter(sub => sub.score !== null && sub.score !== undefined)
  const totalScore = scoredSubmissions.reduce((sum, sub) => sum + sub.score, 0)
  submissionStats.averageScore = scoredSubmissions.length > 0
    ? Math.round((totalScore / scoredSubmissions.length) * 10) / 10
    : null
}

const classList = ref([])

// 编辑相关
const editDialogVisible = ref(false)
const editContentDialogVisible = ref(false)
const editForm = reactive({
  name: '',
  deadline: '',
  status: '',
  classes: [],
  difficulty: 3
})

const contentForm = reactive({
  description: '',
  requirements: [],
  attachments: []
})

// 评分相关
const gradeDialogVisible = ref(false)
const currentSubmission = ref(null)
const gradeForm = reactive({
  score: 0,
  plagiarismRate: 0,
  aiComment: ''
})

// 获取实验详情
const loadExperimentDetail = async () => {
  loading.value = true
  try {
    // 加载实验详情数据
    const response = await api.getTeacherExperimentList()
    logger.debug('API返回的实验列表数据', response)

    let experiments = []
    // 处理不同的响应结构
    if (response && response.data && Array.isArray(response.data)) {
      // 数据在response.data 数组中
      experiments = response.data
    } else if (response && Array.isArray(response)) {
      // 响应本身就是数组
      experiments = response
    } else if (response && typeof response === 'object') {
      // 处理新的数据结构，后端返回的是{data: [...], status: 'success', ...} 格式
      if (response.data && Array.isArray(response.data)) {
        experiments = response.data
      }
    }

    logger.debug('处理后的实验数据:', experiments)
    const experiment = experiments.find(exp => exp.id === experimentId.value)

    if (experiment) {
      experimentData.value = {
        ...experiment,
        description: experiment.description || '',
        requirements: experiment.requirements || [],
        classes: experiment.classes || [],
        createdBy: experiment.createdBy || '',
        difficulty: experiment.difficulty || 3,
        attachments: experiment.attachments || []
      }
    } else {
      logger.error(`未找到ID为${experimentId.value}的实验`)
      ElMessage.warning(`未找到ID为${experimentId.value}的实验`)
    }

    // 加载班级列表（用于编辑对话框）
    const classListData = await api.getClassList()
    classList.value = classListData

    // 加载提交列表
    await loadSubmissions()

    // 初始化图表
    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    logger.error('加载实验详情失败:', error)
    ElMessage.error('加载实验详情失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 加载提交列表
const loadSubmissions = async () => {
  submissionsLoading.value = true
  try {
    // 使用api.getAllStudentExperiments获取所有学生的所有实验数据
    const allStudentExperiments = await api.getAllStudentExperiments()

    // 按实验ID过滤当前实验的提交记录
    const submissions = allStudentExperiments.filter(item =>
      item.experimentId === experimentId.value
    ).map(item => {
      // 根据status确定状态，已提交但无分数为待批阅，有分数为已批阅
      let status = 'not_started'
      if (item.status === 'completed') {
        status = Number(item.score) > 0 ? 'graded' : 'submitted'
      }

      return {
        id: `${item.studentId}-${item.experimentId}`, // 生成一个唯一标识
        experimentId: item.experimentId,
        experimentName: item.experimentName,
        studentId: normalizeStudentId(item.studentId),
        studentName: item.studentName,
        class: item.className || '未知班级',
        submitTime: item.submitTime,
        score: item.score == null ? null : Number(item.score),
        plagiarismRate: item.plagiarismRate,
        status: status
      }
    })

    allSubmissions.value = submissions

    // 计算统计数据
    syncSubmissionStats(submissions)
  } catch (error) {
    logger.error('加载提交列表失败:', error)
    ElMessage.error('加载提交列表失败: ' + (error.message || '未知错误'))
    allSubmissions.value = []
  } finally {
    submissionsLoading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initSubmissionChart()
    initScoreChart()
  })
}

// 初始化提交情况图表
const initSubmissionChart = () => {
  if (submissionChartRef.value) {
    // 如果已存在图表实例，先销毁
    if (submissionChart) {
      submissionChart.dispose()
    }

    submissionChart = echarts.init(submissionChartRef.value)

    // 计算提交状态统计
    const statusCounts = {
      submitted: allSubmissions.value.filter(sub => sub.status === 'submitted').length,
      graded: allSubmissions.value.filter(sub => sub.status === 'graded').length,
      notStarted: submissionStats.totalStudents - submissionStats.submittedCount
    }

    const option = {
      title: {
        text: '提交状态分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['未提交', '待批阅', '已批阅']
      },
      series: [
        {
          name: '提交状态',
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          data: [
            { value: statusCounts.notStarted, name: '未提交', itemStyle: {color: '#909399'} },
            { value: statusCounts.submitted, name: '待批阅', itemStyle: {color: '#E6A23C'} },
            { value: statusCounts.graded, name: '已批阅', itemStyle: {color: '#67C23A'} }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}: {c} ({d}%)'
          }
        }
      ]
    }

    submissionChart.setOption(option)

    // 窗口大小变化时重绘图表
    window.addEventListener('resize', () => {
      submissionChart && submissionChart.resize()
    })
  }
}

// 初始化成绩分布图表
const initScoreChart = () => {
  if (scoreChartRef.value) {
    // 如果已存在图表实例，先销毁
    if (scoreChart) {
      scoreChart.dispose()
    }

    scoreChart = echarts.init(scoreChartRef.value)

    // 计算成绩分布
    const scoreCounts = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '<60': 0
    }

    allSubmissions.value.forEach(sub => {
      if (sub.score !== null && sub.score !== undefined) {
        if (sub.score >= 90) scoreCounts['90-100']++
        else if (sub.score >= 80) scoreCounts['80-89']++
        else if (sub.score >= 70) scoreCounts['70-79']++
        else if (sub.score >= 60) scoreCounts['60-69']++
        else scoreCounts['<60']++
      }
    })

    const option = {
      // title: {
      //   text: '成绩分布',
      //   left: 'center'
      // },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['学生数量'],
        top: '20px'
      },
      grid: {
        top: '25%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['<60', '60-69', '70-79', '80-89', '90-100']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '学生数量',
          type: 'bar',
          data: [
            { value: scoreCounts['<60'], itemStyle: {color: '#F56C6C'} },
            { value: scoreCounts['60-69'], itemStyle: {color: '#E6A23C'} },
            { value: scoreCounts['70-79'], itemStyle: {color: '#67C23A'} },
            { value: scoreCounts['80-89'], itemStyle: {color: '#409EFF'} },
            { value: scoreCounts['90-100'], itemStyle: {color: '#8E44AD'} }
          ]
        }
      ]
    }

    scoreChart.setOption(option)

    // 窗口大小变化时重绘图表
    window.addEventListener('resize', () => {
      scoreChart && scoreChart.resize()
    })
  }
}

// 打开编辑对话框
const openEditDialog = () => {
  editForm.name = experimentData.value.name
  editForm.deadline = experimentData.value.deadline
  editForm.status = experimentData.value.status
  editForm.classes = experimentData.value.classes ? [...experimentData.value.classes] : []
  editForm.difficulty = experimentData.value.difficulty

  editDialogVisible.value = true
}

// 提交编辑表单
const submitEditForm = async () => {
  try {
    // 在实际应用中应该调用API
    // const response = await api.updateExperiment(experimentId.value, editForm)

    // 更新本地数据
    experimentData.value = {
      ...experimentData.value,
      name: editForm.name,
      deadline: editForm.deadline,
      status: editForm.status,
      classes: editForm.classes,
      difficulty: editForm.difficulty
    }

    ElMessage.success('更新成功')
    editDialogVisible.value = false
  } catch (error) {
    logger.error('更新实验失败:', error)
    ElMessage.error('更新实验失败: ' + (error.message || '未知错误'))
  }
}

// 打开编辑内容对话框
const openEditContentDialog = () => {
  contentForm.description = experimentData.value.description || ''
  contentForm.requirements = experimentData.value.requirements ? [...experimentData.value.requirements] : []
  contentForm.attachments = experimentData.value.attachments ? [...experimentData.value.attachments] : []

  editContentDialogVisible.value = true
}

// 添加要求
const addRequirement = () => {
  contentForm.requirements.push('')
}

// 移除要求
const removeRequirement = (index) => {
  contentForm.requirements.splice(index, 1)
}

// 处理文件上传
const handleFileChange = (file) => {
  // 在实际应用中应该上传到服务器
  // 这里简单模拟
  contentForm.attachments.push({
    name: file.name,
    url: URL.createObjectURL(file.raw)
  })
}

// 移除附件
const removeAttachment = (index) => {
  contentForm.attachments.splice(index, 1)
}

// 提交内容表单
const submitContentForm = async () => {
  try {
    // 在实际应用中应该调用API
    // const response = await api.updateExperimentContent(experimentId.value, contentForm)

    // 更新本地数据
    experimentData.value = {
      ...experimentData.value,
      description: contentForm.description,
      requirements: contentForm.requirements,
      attachments: contentForm.attachments
    }

    ElMessage.success('内容更新成功')
    editContentDialogVisible.value = false
  } catch (error) {
    logger.error('更新实验内容失败:', error)
    ElMessage.error('更新实验内容失败: ' + (error.message || '未知错误'))
  }
}

// 评分相关
const gradeSubmission = (submission) => {
  currentSubmission.value = submission
  gradeForm.score = submission.score || 0
  gradeForm.plagiarismRate = submission.plagiarismRate || 0
  gradeForm.aiComment = ''
  gradeDialogVisible.value = true
}

// 提交评分
const submitGrade = async () => {
  if (!currentSubmission.value) return

  try {
    // 提取学生ID和实验ID（从复合ID中）
    const submissionId = currentSubmission.value.id
    const parsedSubmissionId = parseSubmissionCompositeId(submissionId)
    const studentId = parsedSubmissionId?.studentId
    const experimentId = parsedSubmissionId?.experimentId

    // 构建评分数据
    const gradeData = {
      ...gradeForm,
      studentId,
      experimentId
    }

    // 调用API
    await api.gradeSubmission(submissionId, gradeData)

    ElMessage.success('评分成功')
    gradeDialogVisible.value = false

    // 更新本地数据
    const index = allSubmissions.value.findIndex(sub => sub.id === currentSubmission.value.id)
    if (index > -1) {
      allSubmissions.value[index] = {
        ...allSubmissions.value[index],
        score: gradeForm.score,
        plagiarismRate: gradeForm.plagiarismRate,
        status: 'graded'
      }

      // 重新计算统计数据
      syncSubmissionStats(allSubmissions.value)

      // 更新图表
      initCharts()
    }
  } catch (error) {
    logger.error('评分失败:', error)
    ElMessage.error('评分失败: ' + (error.message || '未知错误'))
  }
}

// 状态类型和文本
const getStatusType = (status) => {
  const typeMap = {
    'active': 'success',
    'draft': 'info',
    'expired': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'active': '进行中',
    'draft': '草稿',
    'expired': '已截止'
  }
  return textMap[status] || '未知状态'
}

// 提交状态类型和文本
const getSubmissionStatusType = (status) => {
  const typeMap = {
    'submitted': 'warning',
    'graded': 'success',
    'rejected': 'danger',
    'not_started': 'info'
  }
  return typeMap[status] || 'info'
}

const getSubmissionStatusText = (status) => {
  const textMap = {
    'submitted': '待批阅',
    'graded': '已批阅',
    'rejected': '已拒绝',
    'not_started': '未提交'
  }
  return textMap[status] || '未知状态'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 成绩样式 - 修复错误：确保该函数被正确定义并导出
const getScoreClass = (score) => {
  if (score === undefined || score === null) return ''
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 根据查重率获取标签类型
const getPlagiarismRateType = (rate) => {
  if (rate >= 50) return 'danger'
  if (rate >= 30) return 'warning'
  return 'success'
}

// 页面导航
const goBack = () => {
  router.push('/teacher/experiments')
}

const viewAllSubmissions = () => {
  router.push(`/teacher/submissions/${experimentId.value}`)
}

const viewSubmissionDetail = (id) => {
  router.push(`/teacher/submission-detail/${id}`)
}

// 清理图表
const cleanupCharts = () => {
  if (submissionChart) {
    submissionChart.dispose()
    submissionChart = null
  }

  if (scoreChart) {
    scoreChart.dispose()
    scoreChart = null
  }
}

onMounted(() => {
  loadExperimentDetail()
})

onBeforeUnmount(() => {
  cleanupCharts()
})

// 确保所有在模板中使用的函数都正确导出
defineExpose({
  getScoreClass,
  getStatusType,
  getStatusText,
  getSubmissionStatusType,
  getSubmissionStatusText,
  getPlagiarismRateType,
  formatDate
})
</script>


