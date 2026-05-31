<template>
  <div class="submission-list [min-width:0] [min-height:100%] [padding:0_16px_20px] [background-color:#f5f7fa] max-[768px]:[padding:0_8px_16px]">
    <page-header
      class="my-page-header [padding:24px_0] max-[768px]:[padding:16px_0]"
      title="学生提交"
      :description="headerDescription"
    >
      <template v-if="experimentId">
        <el-button @click="goBackToExperiment">返回实验详情</el-button>
      </template>
    </page-header>

    <el-card class="filter-card [margin-bottom:20px] [border-radius:8px] [overflow:hidden]" shadow="hover">
      <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
        <h3 class="section-title [margin-bottom:12px] [font-size:16px] [font-family:'SimSun',_serif] [margin:6px_0_2px] [color:#334155] [font-size:13px] [font-weight:600] [margin:0] [font-weight:500] [color:#303133]">筛选条件</h3>
      </div>
      <el-form :inline="true" :model="filterForm" class="filter-form [display:flex] [flex-wrap:wrap] [gap:10px]">
        <el-form-item v-if="!experimentId" label="实验">
          <el-select
            v-model="filterForm.experimentId"
            placeholder="请选择实验"
            clearable
            class="[width:220px]"
          >
            <el-option
              v-for="item in experimentOptions"
              :key="item.id"
              :label="`${item.id}: ${item.name}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="学生姓名">
          <el-input
            v-model="filterForm.studentName"
            placeholder="请输入学生姓名"
            clearable
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="请选择状态"
            clearable
            class="[width:150px]"
          >
            <el-option label="全部" value="" />
            <el-option label="已提交" value="submitted" />
            <el-option label="已评分" value="graded" />
            <el-option label="已退回" value="rejected" />
            <el-option label="未开始" value="not_started" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="applyFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card [margin-bottom:20px] [margin-bottom:15px] [border-radius:8px] [overflow:hidden] [padding:10px]">
      <div class="table-operations [margin-bottom:16px] [display:flex] [justify-content:space-between] [align-items:center] [gap:10px]">
        <div class="table-stats [display:flex] [flex-wrap:wrap] [gap:10px]">
          <el-tag type="info" effect="plain">总数：{{ filteredSubmissions.length }}</el-tag>
          <el-tag type="success" effect="plain">已评分：{{ getStatusCount('graded') }}</el-tag>
          <el-tag type="warning" effect="plain">已提交：{{ getStatusCount('submitted') }}</el-tag>
          <el-tag type="danger" effect="plain">未开始：{{ getStatusCount('not_started') }}</el-tag>
        </div>

        <div class="table-actions [display:flex] [flex-wrap:wrap] [gap:8px]">
          <el-button type="primary" size="small" @click="loadSubmissions">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="success" size="small" :disabled="!selectedRows.length" @click="batchGrade">
            <el-icon><Edit /></el-icon>
            批量评分
          </el-button>
          <el-button type="info" size="small" @click="exportData">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <el-table
        :data="pagedSubmissions"
        border
        stripe
        highlight-current-row
        v-loading="tableLoading"
        class="[width:100%]"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="!experimentId" prop="experimentId" label="实验 ID" width="110" />
        <el-table-column
          v-if="!experimentId"
          prop="experimentName"
          label="实验名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="studentName" label="学生姓名" width="140" />
        <el-table-column prop="class" label="班级" min-width="120" show-overflow-tooltip />

        <el-table-column prop="submitTime" label="提交时间" width="170" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="hasRealSubmitTime(row)">{{ formatDate(row.submitTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="成绩" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.score !== null" class="score [font-size:16px] [font-weight:bold] [color:#f56c6c] [color:#409eff] [font-weight:700]">{{ row.score }}</span>
            <span v-else class="text-muted [color:#9aa0a6] [font-size:13px] [color:#909399]">未评分</span>
          </template>
        </el-table-column>

        <el-table-column label="查重率" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.plagiarismRate !== null" :type="getPlagiarismRateType(row.plagiarismRate)" size="small">
              {{ row.plagiarismRate }}%
            </el-tag>
            <span v-else class="text-muted [color:#9aa0a6] [font-size:13px] [color:#909399]">暂无</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="dark">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewSubmissionDetail(row.id)">详情</el-button>
            <el-button v-if="row.status === 'submitted'" type="success" link @click="gradeSubmission(row)">评分</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container [margin-top:20px] [display:flex] [justify-content:center] [overflow-x:auto] [margin-top:10px] [text-align:right] [justify-content:flex-end] [margin-top:16px]">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredSubmissions.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="gradeDialogVisible" title="提交评分" width="500px">
      <el-form :model="gradeForm" label-width="120px">
        <el-form-item label="学生姓名">
          <span>{{ currentSubmission ? currentSubmission.studentName : '' }}</span>
        </el-form-item>

        <el-form-item label="成绩">
          <el-input-number v-model="gradeForm.score" :min="0" :max="100" :precision="1" />
        </el-form-item>

        <el-form-item label="查重率">
          <el-input-number v-model="gradeForm.plagiarismRate" :min="0" :max="100" :precision="1" />
          <span class="rate-unit [margin-left:5px]">%</span>
        </el-form-item>

        <el-form-item label="AI 评语">
          <el-input
            v-model="gradeForm.aiComment"
            type="textarea"
            :rows="6"
            placeholder="请输入AI 评语"
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, Edit, Refresh } from '@element-plus/icons-vue'
import api from '../../api'
import PageHeader from '../../components/PageHeader.vue'

const route = useRoute()
const router = useRouter()

const experimentId = computed(() =>
  route.params.experimentId ? Number(route.params.experimentId) : null
)
const headerDescription = computed(() =>
  experimentId.value
    ? `实验 ${experimentName.value || experimentId.value} 的学生提交`
    : '全部学生提交记录'
)

const experimentName = ref('')
const submissions = ref([])
const experimentOptions = ref([])
const tableLoading = ref(false)
const selectedRows = ref([])

const currentPage = ref(1)
const pageSize = ref(20)

const filterForm = reactive({
  experimentId: experimentId.value,
  studentName: '',
  status: ''
})

const gradeDialogVisible = ref(false)
const currentSubmission = ref(null)
const gradeForm = reactive({
  score: 0,
  plagiarismRate: 0,
  aiComment: ''
})

const normalizeSubmitTime = (value) => {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  if (parsed.getFullYear() <= 2000) return null
  return raw
}

const getSubmitTimestamp = (value) => {
  const normalized = normalizeSubmitTime(value)
  if (!normalized) return -1
  return new Date(normalized).getTime()
}

const filteredSubmissions = computed(() => {
  let result = [...submissions.value]
  if (filterForm.experimentId) {
    result = result.filter((sub) => sub.experimentId === filterForm.experimentId)
  }
  if (filterForm.studentName) {
    const keyword = filterForm.studentName.toLowerCase()
    result = result.filter((sub) => String(sub.studentName || '').toLowerCase().includes(keyword))
  }
  if (filterForm.status) {
    result = result.filter((sub) => sub.status === filterForm.status)
  }
  return result.sort((left, right) => {
    const timeDiff = getSubmitTimestamp(right.submitTime) - getSubmitTimestamp(left.submitTime)
    if (timeDiff !== 0) return timeDiff
    return String(left.studentId || '').localeCompare(String(right.studentId || ''))
  })
})

const pagedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredSubmissions.value.slice(start, start + pageSize.value)
})

watch(filteredSubmissions, () => {
  const maxPage = Math.max(1, Math.ceil(filteredSubmissions.value.length / pageSize.value))
  if (currentPage.value > maxPage) currentPage.value = maxPage
})

watch(experimentId, (id) => {
  filterForm.experimentId = id
  currentPage.value = 1
})

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const batchGrade = () => {
  ElMessage.info('批量评分功能暂未实现。')
}

const formatDate = (dateString) => {
  const normalized = normalizeSubmitTime(dateString)
  if (!normalized) return ''
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return String(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const hasRealSubmitTime = (row) => Boolean(normalizeSubmitTime(row?.submitTime))

const getPlagiarismRateType = (rate) => {
  if (rate >= 50) return 'danger'
  if (rate >= 30) return 'warning'
  return 'success'
}

const getStatusType = (status) => {
  const typeMap = {
    submitted: 'warning',
    graded: 'success',
    rejected: 'danger',
    not_started: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    submitted: '已提交',
    graded: '已评分',
    rejected: '已退回',
    not_started: '未开始'
  }
  return textMap[status] || '未知'
}

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

const normalizeStatus = (item) => {
  if (item.status === 'completed') {
    return Number(item.score) > 0 ? 'graded' : 'submitted'
  }
  if (['submitted', 'graded', 'rejected', 'not_started'].includes(item.status)) {
    return item.status
  }
  return 'not_started'
}

const loadSubmissions = async () => {
  tableLoading.value = true
  try {
    const raw = await api.getAllStudentExperiments()
    const list = Array.isArray(raw) ? raw : raw?.data || []
    const data = list.map((item) => {
      const status = normalizeStatus(item)
      const hasSubmission = status === 'submitted' || status === 'graded' || status === 'rejected'
      return {
        id: `${normalizeStudentId(item.studentId)}-${item.experimentId}`,
        experimentId: item.experimentId,
        experimentName: item.experimentName,
        studentId: normalizeStudentId(item.studentId),
        studentName: item.studentName,
        studentUsername: item.studentUsername,
        class: item.className,
        submitTime: normalizeSubmitTime(item.submitTime),
        score: status === 'graded' ? Number(item.score) : null,
        plagiarismRate: hasSubmission ? Number(item.plagiarismRate ?? 0) : null,
        status
      }
    })

    submissions.value = data
    if (experimentId.value) {
      const current = data.find((d) => d.experimentId === experimentId.value)
      if (current) experimentName.value = current.experimentName || ''
    }
  } catch (error) {
    logger.error('加载学生提交失败:', error)
    ElMessage.error(`加载学生提交失败：${error?.message || '未知错误'}`)
  } finally {
    tableLoading.value = false
  }
}

const loadExperimentOptions = async () => {
  try {
    const res = await api.getTeacherExperimentList()
    if (Array.isArray(res)) {
      experimentOptions.value = res
    } else if (Array.isArray(res?.data)) {
      experimentOptions.value = res.data
    } else {
      experimentOptions.value = []
    }
  } catch (error) {
    logger.error('加载实验列表失败:', error)
    experimentOptions.value = []
  }
}

const applyFilter = () => {
  currentPage.value = 1
}

const resetFilter = () => {
  filterForm.experimentId = experimentId.value
  filterForm.studentName = ''
  filterForm.status = ''
  currentPage.value = 1
}

const viewSubmissionDetail = (id) => {
  router.push(`/teacher/submission-detail/${id}`)
}

const gradeSubmission = (submission) => {
  currentSubmission.value = submission
  gradeForm.score = 0
  gradeForm.plagiarismRate = 0
  gradeForm.aiComment = ''
  gradeDialogVisible.value = true
}

const submitGrade = async () => {
  if (!currentSubmission.value) return

  try {
    const submissionId = currentSubmission.value.id
    const parsedSubmissionId = parseSubmissionCompositeId(submissionId)
    const studentId = parsedSubmissionId?.studentId
    const expId = parsedSubmissionId?.experimentId

    const gradeData = {
      score: Number(gradeForm.score),
      plagiarismRate: Number(gradeForm.plagiarismRate),
      aiComment: gradeForm.aiComment,
      studentId,
      experimentId: expId
    }

    await api.gradeSubmission(submissionId, gradeData)
    ElMessage.success('评分提交成功。')
    gradeDialogVisible.value = false

    const index = submissions.value.findIndex((sub) => sub.id === submissionId)
    if (index > -1) {
      submissions.value[index] = {
        ...submissions.value[index],
        score: Number(gradeForm.score),
        plagiarismRate: Number(gradeForm.plagiarismRate),
        status: 'graded'
      }
    }
  } catch (error) {
    logger.error('提交评分失败:', error)
    ElMessage.error('提交评分失败，请重试。')
  }
}

const goBackToExperiment = () => {
  router.push(`/teacher/experiment-detail/${experimentId.value}`)
}

const getStatusCount = (status) =>
  filteredSubmissions.value.filter((item) => item.status === status).length

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

const exportData = () => {
  const header = [
    '实验 ID',
    '实验名称',
    '学号',
    '学生姓名',
    '班级',
    '提交时间',
    '成绩',
    '查重率',
    '状态'
  ]
  const rows = filteredSubmissions.value.map((item) => [
    item.experimentId,
    item.experimentName,
    item.studentId,
    item.studentName,
    item.class,
    item.submitTime || '',
    item.score ?? '',
    item.plagiarismRate ?? '',
    getStatusText(item.status)
  ])

  const csvContent = [header, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `student_submissions_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功。')
}

onMounted(async () => {
  await loadSubmissions()
  if (!experimentId.value) {
    await loadExperimentOptions()
  }
})
</script>


