<template>
  <div class="experiment-management [min-width:0] [min-height:100%] [&_.ui-table]:[width:100%]">
    <UiPageHeader
        class="my-page-header [margin-bottom:20px] [min-height:68px] [padding:0_20px] max-[768px]:[margin-bottom:16px] max-[768px]:[min-height:56px] max-[768px]:[padding:0_16px]"
      title="实验管理"
      description="管理系统中的所有实验"
    />

    <div class="experiment-management-content [display:flex] [flex-direction:column] [gap:20px]">
      <ui-card class="[margin-bottom:20px]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [flex-wrap:wrap]">
            <span>实验列表</span>
            <div class="[display:flex] [align-items:center] [gap:10px] [flex-wrap:wrap]">
              <ui-tag v-if="selectedExperimentCount" type="info">
                已选 {{ selectedExperimentCount }} 项
              </ui-tag>
              <ui-button
                type="danger"
                :disabled="!selectedExperimentCount || batchDeleting"
                :loading="batchDeleting && deleteMode === 'selected'"
                @click="confirmDeleteSelected"
              >
                删除所选
              </ui-button>
              <ui-button
                type="danger"
                :disabled="!experimentList.length || batchDeleting"
                :loading="batchDeleting && deleteMode === 'all'"
                @click="confirmDeleteAll"
              >
                删除全部
              </ui-button>
              <ui-button type="primary" :disabled="batchDeleting" @click="openCreateDialog">添加实验</ui-button>
            </div>
          </div>
        </template>

        <ui-table :data="experimentList" :aria-busy="loading || batchDeleting" :loading="loading || batchDeleting" row-key="id" border class="[width:100%]">
          <ui-table-column label="选择" width="80">
            <template #default="scope">
              <ui-input
                type="checkbox"
                :model-value="isExperimentSelected(scope.row)"
                :disabled="batchDeleting"
                :aria-label="`选择实验 ${scope.row.title}`"
                class="[width:16px] [height:16px]"
                @change="checked => toggleExperimentSelection(scope.row, checked)"
              />
            </template>
          </ui-table-column>
          <ui-table-column prop="id" label="ID" width="80" />
          <ui-table-column prop="title" label="标题" min-width="200" />
          <ui-table-column prop="className" label="所属班级" width="150" />
          <ui-table-column prop="teacherName" label="创建教师" width="120" />
          <ui-table-column label="截止日期" width="180">
            <template #default="scope">
              {{ formatDeadline(scope.row.deadline) }}
            </template>
          </ui-table-column>
          <ui-table-column prop="submissionCount" label="提交数" width="100" />
          <ui-table-column label="状态" width="100">
            <template #default="scope">
              <ui-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </ui-tag>
            </template>
          </ui-table-column>
          <ui-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <div class="[display:flex] [align-items:center] [gap:18px] [flex-wrap:nowrap] [white-space:nowrap]">
                <ui-button type="primary" link @click="viewExperiment(scope.row)">查看</ui-button>
                <ui-button type="warning" link @click="editExperiment(scope.row)">编辑</ui-button>
                <ui-button type="danger" link :disabled="batchDeleting" @click="confirmDelete(scope.row)">删除</ui-button>
              </div>
            </template>
          </ui-table-column>
        </ui-table>

        <div class="pagination-container [margin-top:20px] [display:flex] [justify-content:center] [overflow-x:auto] [margin-top:10px] [text-align:right] [justify-content:flex-end] [margin-top:16px]">
          <ui-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </ui-card>
    </div>

    <!-- 创建实验对话框-->
    <ui-dialog v-model="createDialogVisible" title="添加实验" width="50%">
      <ui-form :model="experimentForm" :rules="rules" ref="experimentFormRef" label-width="100px">
        <ui-form-item label="实验标题" prop="title">
          <ui-input v-model="experimentForm.title" placeholder="请输入实验标题"></ui-input>
        </ui-form-item>
        <ui-form-item label="所属班级" prop="classId">
          <ui-select v-model="experimentForm.classId" placeholder="请选择班级" class="[width:100%]">
            <ui-option
              v-for="item in classList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></ui-option>
          </ui-select>
        </ui-form-item>
        <ui-form-item label="截止日期" prop="deadline">
          <ui-date-picker
            v-model="experimentForm.deadline"
            type="datetime"
            placeholder="选择截止日期"
            format="YYYY-MM-DD HH:mm:ss"
            class="[width:100%]"
          ></ui-date-picker>
        </ui-form-item>
        <ui-form-item label="实验描述" prop="description">
          <ui-input
            v-model="experimentForm.description"
            type="textarea"
            rows="4"
            placeholder="请输入实验描述"
          ></ui-input>
        </ui-form-item>
      </ui-form>
      <template #footer>
        <div class="dialog-footer [display:flex] [justify-content:flex-end] [gap:10px]">
          <ui-button :disabled="submitLoading" @click="createDialogVisible = false">取消</ui-button>
          <ui-button type="primary" :disabled="submitLoading" :loading="submitLoading" @click="submitExperiment">确认</ui-button>
        </div>
      </template>
    </ui-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage, messageBox } from '@/services/feedback'
import api from '../../api'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'
import { formatDate } from '@/utils/dateUtils'

// 数据加载状态
const loading = ref(false)
const submitLoading = ref(false)
const batchDeleting = ref(false)
const deleteMode = ref('')

// 分页参数
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 实验列表数据
const experimentList = ref([])
const selectedExperimentIds = ref([])
const selectedExperimentCount = computed(() => selectedExperimentIds.value.length)

// 班级列表
const classList = ref([])

const normalizeExperimentId = (id) => String(id ?? '')

const experimentIds = computed(() => experimentList.value
  .map(item => normalizeExperimentId(item.id))
  .filter(Boolean)
)

const pruneSelectedExperiments = () => {
  const existingIds = new Set(experimentIds.value)
  selectedExperimentIds.value = selectedExperimentIds.value.filter(id => existingIds.has(id))
}

const isExperimentSelected = (row) => {
  return selectedExperimentIds.value.includes(normalizeExperimentId(row.id))
}

const toggleExperimentSelection = (row, checked) => {
  const id = normalizeExperimentId(row.id)
  if (!id) return
  if (checked) {
    selectedExperimentIds.value = [...new Set([...selectedExperimentIds.value, id])]
    return
  }
  selectedExperimentIds.value = selectedExperimentIds.value.filter(item => item !== id)
}

// 加载实验列表
const loadExperimentList = async () => {
  loading.value = true
  try {
    const response = await api.getTeacherExperimentList({ scope: 'all' })
    logger.debug('API返回的实验数据', response)

    // 兼容不同的返回数据结构
    let experiments = []
    if (response.data && Array.isArray(response.data)) {
      // 如果返回的是 { data: [...] } 的结构
      experiments = response.data
    } else if (Array.isArray(response)) {
      // 如果返回的直接是数组
      experiments = response
    } else if (response && typeof response === 'object') {
      // 其他可能的情况，尝试合理处理
      if (Array.isArray(response.data)) {
        experiments = response.data
      }
    }

    // 将所有实验的创建老师统一显示为王老师"
    experimentList.value = experiments.map(exp => ({
      id: exp.id,
      title: exp.name || exp.title || '',
      classIds: exp.classIds || [],
      className: Array.isArray(exp.classes) && exp.classes.length > 0 ? exp.classes.join('、') : (exp.className || '未关联'),
      teacherId: exp.teacherId || '',
      teacherName: exp.teacherName || '未关联',
      deadline: exp.deadline,
      description: exp.description || '',
      submissionCount: exp.submissionCount || exp.submitCount || 0,
      status: exp.status,
      averageScore: exp.averageScore
    }))

    total.value = experimentList.value.length
    pruneSelectedExperiments()
    
    logger.debug('处理后的实验列表:', experimentList.value)
  } catch (error) {
    logger.error('加载实验列表失败:', error)
    uiMessage.error(getFriendlyErrorMessage(error, '加载实验列表失败，请稍后重试'))
    experimentList.value = []
    selectedExperimentIds.value = []
  } finally {
    loading.value = false
  }
}

// 创建/编辑实验对话框
const createDialogVisible = ref(false)
const experimentFormRef = ref(null)
const experimentForm = reactive({
  id: null,
  title: '',
  classId: '',
  deadline: '',
  description: ''
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入实验标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择截止日期', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入实验描述', trigger: 'blur' },
    { min: 10, message: '描述不能少于10个字符', trigger: 'blur' }
  ]
}

// 格式化截止日期
const formatDeadline = (deadline) => {
  return formatDate(deadline, 'YYYY-MM-DD HH:mm:ss') || '-'
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    'active': 'success',
    'expired': 'danger',
    'draft': 'info'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    'active': '进行中',
    'expired': '已过期',
    'draft': '草稿'
  }
  return map[status] || '未知'
}

// 打开创建对话框
const openCreateDialog = () => {
  // 重置表单
  if (experimentFormRef.value) {
    experimentFormRef.value.resetFields()
  }
  experimentForm.id = null
  createDialogVisible.value = true
}

// 查看实验
const viewExperiment = (row) => {
  uiMessage.info(`查看实验: ${row.title}`)
}

// 编辑实验
const editExperiment = (row) => {
  experimentForm.id = row.id
  experimentForm.title = row.title
  experimentForm.classId = Array.isArray(row.classIds) && row.classIds.length > 0 ? row.classIds[0] : ''
  experimentForm.deadline = row.deadline
  experimentForm.description = row.description || ''
  createDialogVisible.value = true
}

// 确认删除
const confirmDelete = (row) => {
  messageBox.confirm(`确定要删除实验 "${row.title}" 吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await api.deleteExperiment(row.id)
      selectedExperimentIds.value = selectedExperimentIds.value.filter(id => id !== normalizeExperimentId(row.id))
      await loadExperimentList()
      uiMessage.success('删除成功')
    } catch (error) {
      logger.error('删除实验失败:', error)
      uiMessage.error(getFriendlyErrorMessage(error, '删除实验失败，请稍后重试'))
    }
  }).catch(() => {})
}

const deleteExperiments = async (targetRows, mode) => {
  if (!targetRows.length || batchDeleting.value) return

  batchDeleting.value = true
  deleteMode.value = mode
  const failed = []

  for (const row of targetRows) {
    try {
      await api.deleteExperiment(row.id)
    } catch (error) {
      failed.push({ row, error })
      logger.error('删除实验失败:', row, error)
    }
  }

  try {
    await loadExperimentList()
  } finally {
    batchDeleting.value = false
    deleteMode.value = ''
  }

  if (failed.length) {
    const successCount = targetRows.length - failed.length
    uiMessage.error(`删除完成：成功 ${successCount} 个，失败 ${failed.length} 个`)
    return
  }

  selectedExperimentIds.value = []
  uiMessage.success(`删除成功，共删除 ${targetRows.length} 个实验`)
}

const confirmDeleteSelected = () => {
  const selectedIds = new Set(selectedExperimentIds.value)
  const targetRows = experimentList.value.filter(row => selectedIds.has(normalizeExperimentId(row.id)))
  if (!targetRows.length) {
    uiMessage.warning('请先选择要删除的实验')
    return
  }

  messageBox.confirm(`确定要删除选中的 ${targetRows.length} 个实验吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => deleteExperiments(targetRows, 'selected')).catch(() => {})
}

const confirmDeleteAll = () => {
  const targetRows = [...experimentList.value]
  if (!targetRows.length) {
    uiMessage.warning('当前没有可删除的实验')
    return
  }

  messageBox.confirm(`确定要删除全部 ${targetRows.length} 个实验吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => deleteExperiments(targetRows, 'all')).catch(() => {})
}

// 提交实验
const submitExperiment = async () => {
  if (submitLoading.value) return

  submitLoading.value = true
  try {
    const valid = await experimentFormRef.value?.validate().catch(() => false)
    if (!valid) return

    const payload = {
      name: experimentForm.title,
      title: experimentForm.title,
      classId: experimentForm.classId,
      classIds: experimentForm.classId ? [experimentForm.classId] : [],
      deadline: experimentForm.deadline,
      description: experimentForm.description
    }
    if (experimentForm.id) {
      await api.updateExperiment(experimentForm.id, payload)
      uiMessage.success('更新成功')
    } else {
      await api.createExperiment(payload)
      uiMessage.success('创建成功')
    }
    createDialogVisible.value = false
    await loadExperimentList()
  } catch (error) {
    logger.error('保存实验失败:', error)
    uiMessage.error(getFriendlyErrorMessage(error, '保存实验失败，请稍后重试'))
  } finally {
    submitLoading.value = false
  }
}

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  // 在实际项目中，这里应该重新加载对应页数据
}

// 每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  // 在实际项目中，这里应该重新加载对应页数据
}

// 初始化加载数据
const loadClassList = async () => {
  try {
    classList.value = await api.getClassList()
  } catch (error) {
    classList.value = []
    logger.error('加载班级列表失败:', error)
  }
}

// 初始化加载数据
onMounted(() => {
  loadClassList()
  loadExperimentList()
})
</script>

