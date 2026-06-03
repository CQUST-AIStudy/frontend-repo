<template>
  <div class="experiment-management [min-width:0] [min-height:100%] [&_.ui-table]:[width:100%]">
    <UiPageHeader
        class="my-page-header [padding:20px] max-[768px]:[padding:0]"
      title="实验管理"
      description="管理系统中的所有实验"
    />

    <div class="experiment-management-content [display:flex] [flex-direction:column] [gap:20px]">
      <ui-card>
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [gap:12px] [flex-wrap:wrap] [align-items:flex-start] [gap:16px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>实验列表</span>
            <ui-button type="primary" @click="openCreateDialog">添加实验</ui-button>
          </div>
        </template>

        <ui-table :data="experimentList" :aria-busy="loading" border class="[width:100%]">
          <ui-table-column prop="id" label="ID" width="80" />
          <ui-table-column prop="title" label="标题" min-width="200" />
          <ui-table-column prop="className" label="所属班级" width="150" />
          <ui-table-column prop="teacherName" label="创建教师" width="120" />
          <ui-table-column prop="deadline" label="截止日期" width="180" />
          <ui-table-column prop="submissionCount" label="提交数" width="100" />
          <ui-table-column label="状态" width="100">
            <template #default="scope">
              <ui-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </ui-tag>
            </template>
          </ui-table-column>
          <ui-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <ui-button type="primary" link @click="viewExperiment(scope.row)">查看</ui-button>
              <ui-button type="warning" link @click="editExperiment(scope.row)">编辑</ui-button>
              <ui-button type="danger" link @click="confirmDelete(scope.row)">删除</ui-button>
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
            format="YYYY-MM-DD HH:mm"
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
          <ui-button @click="createDialogVisible = false">取消</ui-button>
          <ui-button type="primary" @click="submitExperiment" :loading="submitLoading">确认</ui-button>
        </div>
      </template>
    </ui-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage, messageBox } from '@/services/feedback'
import api from '../../api'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

// 数据加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 分页参数
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 实验列表数据
const experimentList = ref([])

// 班级列表
const classList = ref([
  { id: 1, name: '计算机科学与技术1班' },
  { id: 2, name: '计算机科学与技术2班' },
  { id: 3, name: '软件工程1班' },
  { id: 4, name: '软件工程2班' }
])

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
    experimentList.value = experiments.map(exp => {
      return {
        id: exp.id,
        title: exp.name,
        className: exp.classes?.join('、') || '计算机科学1班',
        teacherName: '王老师', // 统一设置为王老师
        deadline: exp.deadline,
        submissionCount: exp.submissionCount || 0,
        status: exp.status,
        averageScore: exp.averageScore
      }
    })

    total.value = experimentList.value.length
    
    logger.debug('处理后的实验列表:', experimentList.value)
  } catch (error) {
    logger.error('加载实验列表失败:', error)
    uiMessage.error(getFriendlyErrorMessage(error, '加载实验列表失败，请稍后重试'))
    experimentList.value = []
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
  experimentForm.classId = classList.value.find(c => c.name === row.className)?.id || ''
  experimentForm.deadline = row.deadline
  experimentForm.description = '此处为实验描述示例文本，实际应从后端获取。'
  createDialogVisible.value = true
}

// 确认删除
const confirmDelete = (row) => {
  messageBox.confirm(`确定要删除实验"${row.title}"吗？此操作不可逆`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除
    setTimeout(() => {
      experimentList.value = experimentList.value.filter(item => item.id !== row.id)
      uiMessage.success('删除成功!')
    }, 500)
  }).catch(() => {})
}

// 提交实验
const submitExperiment = () => {
  experimentFormRef.value.validate((valid) => {
    if (!valid) return

    submitLoading.value = true
    // 模拟提交
    setTimeout(() => {
      submitLoading.value = false
      createDialogVisible.value = false

      if (experimentForm.id) {
        // 更新
        const index = experimentList.value.findIndex(item => item.id === experimentForm.id)
        if (index > -1) {
          const classItem = classList.value.find(c => c.id === experimentForm.classId)
          experimentList.value[index] = {
            ...experimentList.value[index],
            title: experimentForm.title,
            className: classItem ? classItem.name : '',
            deadline: experimentForm.deadline
          }
        }
        uiMessage.success('更新成功!')
      } else {
        // 创建
        const classItem = classList.value.find(c => c.id === experimentForm.classId)
        experimentList.value.unshift({
          id: Date.now(),
          title: experimentForm.title,
          className: classItem ? classItem.name : '',
          teacherName: '王老师',
          deadline: experimentForm.deadline,
          submissionCount: 0,
          status: 'draft'
        })
        uiMessage.success('创建成功!')
      }
    }, 1000)
  })
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
onMounted(() => {
  loadExperimentList()
})
</script>

