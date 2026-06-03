<template>
  <div class="user-management [min-width:0] [min-height:100%]">
    <UiPageHeader
      class="my-page-header [margin-bottom:20px] [min-height:68px] [padding:0_20px] max-[768px]:[margin-bottom:16px] max-[768px]:[min-height:56px] max-[768px]:[padding:0_16px]"
      title="用户管理"
      description="管理系统用户，包括学生、教师和管理员"
    >
      <ui-button type="primary" :disabled="!userManagementReady" @click="showAddUserDialog">添加用户</ui-button>
    </UiPageHeader>

    <ui-alert
      v-if="!userManagementReady"
      class="read-only-alert [margin-bottom:20px]"
      type="warning"
      :closable="false"
      title="当前用户管理页仍是前端样例数据"
      description="后端还没有/api/users 这组真实接口，新增、编辑、重置密码、删除和启停状态暂时禁用，避免页面显示成功但数据实际上没有落库。"
      show-icon
    />

    <ui-card class="filter-card [margin-bottom:20px]">
      <ui-form :inline="true" :model="filterForm" class="filter-form">
        <ui-form-item label="用户ID">
          <ui-input v-model="filterForm.id" placeholder="输入用户ID" clearable />
        </ui-form-item>

        <ui-form-item label="用户名">
          <ui-input v-model="filterForm.name" placeholder="输入用户名" clearable />
        </ui-form-item>

        <ui-form-item label="角色">
          <ui-select v-model="filterForm.role" placeholder="选择角色" clearable>
            <ui-option label="全部" value="" />
            <ui-option label="学生" value="student" />
            <ui-option label="教师" value="teacher" />
            <ui-option label="管理员" value="admin" />
          </ui-select>
        </ui-form-item>

        <ui-form-item class="filter-actions-item">
          <div class="filter-actions">
            <ui-button type="primary" @click="applyFilter">查询</ui-button>
            <ui-button @click="resetFilter">重置</ui-button>
          </div>
        </ui-form-item>
      </ui-form>
    </ui-card>

    <ui-card class="table-card [margin-bottom:20px]">
      <div class="user-table-wrap">
        <ui-table :data="filteredUsers" border>
          <ui-table-column prop="id" label="用户ID" width="120" />
          <ui-table-column label="用户信息" min-width="220">
            <template #default="scope">
              <div class="user-cell">
                <ui-avatar :size="32" :src="scope.row.avatar" />
                <div class="user-cell__details">
                  <div class="user-cell__name">{{ scope.row.name }}</div>
                  <div class="user-cell__extra">{{ scope.row.role === 'student' ? scope.row.class : scope.row.department }}</div>
                </div>
              </div>
            </template>
          </ui-table-column>
          <ui-table-column prop="email" label="邮箱" min-width="180" />
          <ui-table-column prop="phone" label="电话" width="150" />
          <ui-table-column label="角色" width="100">
            <template #default="scope">
              <ui-tag :type="getRoleType(scope.row.role)">
                {{ getRoleText(scope.row.role) }}
              </ui-tag>
            </template>
          </ui-table-column>
          <ui-table-column label="状态" width="100">
            <template #default="scope">
              <ui-switch
                v-model="scope.row.status"
                :active-value="'active'"
                :inactive-value="'inactive'"
                :disabled="!userManagementReady"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </ui-table-column>
          <ui-table-column label="操作" width="190">
            <template #default="scope">
              <div class="table-actions">
                <ui-button type="primary" link :disabled="!userManagementReady" @click="editUser(scope.row)">编辑</ui-button>
                <ui-button type="primary" link :disabled="!userManagementReady" @click="resetPassword(scope.row)">重置密码</ui-button>
                <ui-button type="danger" link :disabled="!userManagementReady" @click="deleteUser(scope.row)">删除</ui-button>
              </div>
            </template>
          </ui-table-column>
        </ui-table>
      </div>

      <div class="pagination-container">
        <ui-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalUsers"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ui-card>

    <!-- 添加/编辑用户对话框-->
    <ui-dialog
      v-model="userDialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <ui-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="100px">
        <ui-form-item label="用户名" prop="name">
          <ui-input v-model="userForm.name" />
        </ui-form-item>

        <ui-form-item label="角色" prop="role">
          <ui-select v-model="userForm.role" placeholder="选择角色" class="[width:100%]">
            <ui-option label="学生" value="student" />
            <ui-option label="教师" value="teacher" />
            <ui-option label="管理员" value="admin" />
          </ui-select>
        </ui-form-item>

        <ui-form-item label="邮箱" prop="email">
          <ui-input v-model="userForm.email" />
        </ui-form-item>

        <ui-form-item label="电话" prop="phone">
          <ui-input v-model="userForm.phone" />
        </ui-form-item>

        <template v-if="userForm.role === 'student'">
          <ui-form-item label="班级" prop="class">
            <ui-select v-model="userForm.class" placeholder="选择班级" class="[width:100%]">
              <ui-option
                v-for="item in classList"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </ui-select>
          </ui-form-item>

          <ui-form-item label="年级" prop="grade">
            <ui-input v-model="userForm.grade" />
          </ui-form-item>
        </template>

        <template v-else>
          <ui-form-item label="部门" prop="department">
            <ui-input v-model="userForm.department" />
          </ui-form-item>

          <template v-if="userForm.role === 'teacher'">
            <ui-form-item label="职称" prop="title">
              <ui-input v-model="userForm.title" />
            </ui-form-item>
          </template>
        </template>

        <ui-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <ui-input v-model="userForm.password" type="password" show-password />
        </ui-form-item>
      </ui-form>

      <template #footer>
        <div class="dialog-footer">
          <ui-button @click="userDialogVisible = false">取消</ui-button>
          <ui-button type="primary" :disabled="!userManagementReady" @click="saveUser">确定</ui-button>
        </div>
      </template>
    </ui-dialog>

    <!-- 重置密码对话框-->
    <ui-dialog v-model="resetPasswordDialogVisible" title="重置密码" width="400px">
      <ui-form ref="resetPasswordFormRef" :model="resetPasswordForm" label-width="100px">
        <ui-form-item label="新密码" prop="password">
          <ui-input v-model="resetPasswordForm.password" type="password" show-password />
        </ui-form-item>

        <ui-form-item label="确认密码" prop="confirmPassword">
          <ui-input v-model="resetPasswordForm.confirmPassword" type="password" show-password />
        </ui-form-item>
      </ui-form>

      <template #footer>
        <div class="dialog-footer">
          <ui-button @click="resetPasswordDialogVisible = false">取消</ui-button>
          <ui-button type="primary" :disabled="!userManagementReady" @click="confirmResetPassword">确定</ui-button>
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

const userManagementReady = true
const showReadOnlyNotice = () => {
  uiMessage.warning('用户管理真实后端尚未接通，当前页面仅保留只读展示。')
}

// 表格数据
const users = ref([
  {
    id: '2019443672',
    name: '易星贵',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    class: '计算机科学与技术1班',
    grade: '2023级',
    email: 'student1@example.com',
    phone: '暂无',
    role: 'student',
    status: 'active'
  },
  {
    id: '2023442308',
    name: '施鉴航',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    class: '计算机科学与技术1班',
    grade: '2023级',
    email: 'student1@example.com',
    phone: '暂无',
    role: 'student',
    status: 'active'
  },
  {
    id: '2023440548',
    name: '李京谕',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    class: '计算机科学与技术1班',
    grade: '2023级',
    email: 'student1@example.com',
    phone: '暂无',
    role: 'student',
    status: 'active'
  },

  {
    id: '20001',
    name: '王老师',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    department: '计算机科学与工程学院',
    title: '副教授',
    email: 'liteacher@example.com',
    phone: '13800138000',
    role: 'teacher',
    status: 'active'
  },
  {
    id: 'A2023001',
    name: '王管理',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9cpng.png',
    department: '教务处',
    email: 'admin@example.com',
    phone: '13900139000',
    role: 'admin',
    status: 'active'
  }
])

// 班级列表
const classList = ref([])

// 过滤表单
const filterForm = reactive({
  id: '',
  name: '',
  role: ''
})

// 用户表单
const userFormRef = ref(null)
const userForm = reactive({
  id: '',
  name: '',
  role: 'student',
  email: '',
  phone: '',
  class: '',
  grade: '',
  department: '',
  title: '',
  password: ''
})

// 表单验证规则
const userRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 重置密码表单
const resetPasswordFormRef = ref(null)
const resetPasswordForm = reactive({
  userId: '',
  password: '',
  confirmPassword: ''
})

// 对话框控制
const userDialogVisible = ref(false)
const resetPasswordDialogVisible = ref(false)
const dialogType = ref('add')
const currentUserId = ref('')

// 分页相关
const pageSize = ref(10)
const currentPage = ref(1)
const totalUsers = computed(() => filteredUsers.value.length)

// 过滤用户列表
const filteredUsers = computed(() => {
  let result = [...users.value]

  if (filterForm.id) {
    result = result.filter(user => String(user.id).includes(filterForm.id))
  }

  if (filterForm.name) {
    result = result.filter(user => String(user.name || '').includes(filterForm.name))
  }

  if (filterForm.role) {
    result = result.filter(user => user.role === filterForm.role)
  }

  return result
})

// 加载班级列表
const normalizeUsers = (payload) => {
  const list = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.users)
      ? payload.users
      : Array.isArray(payload)
        ? payload
        : []

  return list.map(user => ({
    ...user,
    id: String(user.id ?? user.usernum ?? user.username ?? ''),
    name: user.name || user.displayName || user.username || user.usernum || '',
    class: user.class || user.className || '',
    phone: user.phone || '',
    status: user.status || 'active',
    avatar: user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  }))
}

const loadUsers = async () => {
  try {
    const response = await api.getUsers()
    const nextUsers = normalizeUsers(response)
    if (nextUsers.length > 0) {
      users.value = nextUsers
    }
  } catch (error) {
    logger.error('加载用户列表失败:', error)
  }
}

const loadClassList = async () => {
  try {
    const classes = await api.getClassList()
    classList.value = classes
  } catch (error) {
    logger.error('加载班级列表失败:', error)
  }
}

// 获取角色类型和文本
const getRoleType = (role) => {
  const typeMap = {
    'student': 'info',
    'teacher': 'success',
    'admin': 'danger'
  }
  return typeMap[role] || 'info'
}

const getRoleText = (role) => {
  const textMap = {
    'student': '学生',
    'teacher': '教师',
    'admin': '管理员'
  }
  return textMap[role] || '未知'
}

// 过滤
const applyFilter = () => {
  currentPage.value = 1
}

const resetFilter = () => {
  filterForm.id = ''
  filterForm.name = ''
  filterForm.role = ''
  currentPage.value = 1
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 状态更改
const handleStatusChange = (user) => {
  if (!userManagementReady) {
    user.status = user.status === 'active' ? 'inactive' : 'active'
    showReadOnlyNotice()
    return
  }
  const status = user.status === 'active' ? '启用' : '禁用'
  uiMessage.success(`已${status}用户 ${user.name}`)
}

// 添加用户
const showAddUserDialog = () => {
  if (!userManagementReady) {
    showReadOnlyNotice()
    return
  }
  dialogType.value = 'add'
  userForm.id = ''
  userForm.name = ''
  userForm.role = 'student'
  userForm.email = ''
  userForm.phone = ''
  userForm.class = ''
  userForm.grade = ''
  userForm.department = ''
  userForm.title = ''
  userForm.password = ''
  userDialogVisible.value = true
}

// 编辑用户
const editUser = (user) => {
  if (!userManagementReady) {
    showReadOnlyNotice()
    return
  }
  dialogType.value = 'edit'
  currentUserId.value = user.id
  userForm.id = user.id
  userForm.name = user.name
  userForm.role = user.role
  userForm.email = user.email
  userForm.phone = user.phone
  userForm.class = user.class || ''
  userForm.grade = user.grade || ''
  userForm.department = user.department || ''
  userForm.title = user.title || ''
  userForm.password = ''
  userDialogVisible.value = true
}

// 保存用户
const saveUser = () => {
  if (!userManagementReady) {
    showReadOnlyNotice()
    return
  }
  userFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const payload = {
        ...userForm,
        usernum: userForm.id || userForm.usernum || '',
        className: userForm.class || ''
      }
      if (dialogType.value === 'add') {
        await api.addUser(payload)
        uiMessage.success('添加用户成功')
      } else {
        await api.updateUser(currentUserId.value, payload)
        uiMessage.success('更新用户成功')
      }
      await loadUsers()
      userDialogVisible.value = false
    } catch (error) {
      logger.error('保存用户失败:', error)
      uiMessage.error('保存用户失败')
    }
  })
}

// 重置密码
const resetPassword = (user) => {
  if (!userManagementReady) {
    showReadOnlyNotice()
    return
  }
  resetPasswordForm.userId = user.id
  resetPasswordForm.password = ''
  resetPasswordForm.confirmPassword = ''
  resetPasswordDialogVisible.value = true
}

// 确认重置密码
const confirmResetPassword = async () => {
  if (!userManagementReady) {
    showReadOnlyNotice()
    return
  }
  if (!resetPasswordForm.password) {
    uiMessage.warning('请输入新密码')
    return
  }

  if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
    uiMessage.warning('两次输入的密码不一致')
    return
  }

  try {
    await api.updateUser(resetPasswordForm.userId, { password: resetPasswordForm.password })
    uiMessage.success('密码重置成功')
    resetPasswordDialogVisible.value = false
    await loadUsers()
  } catch (error) {
    logger.error('重置密码失败:', error)
    uiMessage.error('重置密码失败')
  }
}

// 删除用户
const deleteUser = (user) => {
  if (!userManagementReady) {
    showReadOnlyNotice()
    return
  }
  messageBox.confirm(
    `确定要删除用户${user.name} 吗？此操作不可恢复。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await api.deleteUser(user.id)
      await loadUsers()
      uiMessage.success('删除用户成功')
    } catch (error) {
      logger.error('删除用户失败:', error)
      uiMessage.error('删除用户失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

onMounted(() => {
  loadUsers()
  loadClassList()
})
</script>

