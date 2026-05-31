<template>
  <div class="teacher-profile [height:100%]">
    <page-header class="my-page-header [padding:20px]" title="个人信息" description="查看并维护教师账户信息、登录密码和 PTA 账号绑定。" />

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="profile-card [margin-bottom:20px] [padding:20px] [border-radius:20px] [border:1px_solid_#dbe5ef] [box-shadow:0_14px_34px_rgba(22,_48,_79,_0.06)]">
          <div class="profile-header [display:flex] [flex-direction:column] [align-items:center] [padding-bottom:20px] [border-bottom:1px_solid_#f0f0f0] [&_h3]:[margin:10px_0_5px] [&_h3]:[font-size:18px] [&_p]:[margin:0] [&_p]:[font-size:14px] [&_p]:[color:#9aa0a6]">
            <el-avatar :size="100" :src="avatarUrl" />
            <h3>{{ displayName }}</h3>
            <p>{{ roleText }}</p>
          </div>

          <div class="profile-info [margin-top:20px]">
            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:#9aa0a6] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">用户名</span>
              <span class="info-value [color:#202124] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.username }}</span>
            </div>
            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:#9aa0a6] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">角色</span>
              <span class="info-value [color:#202124] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ roleText }}</span>
            </div>
            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:#9aa0a6] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">工号/学号</span>
              <span class="info-value [color:#202124] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.usernum || '未设置' }}</span>
            </div>
            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:#9aa0a6] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">电子邮箱</span>
              <span class="info-value [color:#202124] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.email || '未设置' }}</span>
            </div>
            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:#9aa0a6] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">班级</span>
              <span class="info-value [color:#202124] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.class || '未设置' }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="form-card [margin-bottom:20px] [border-radius:22px] [border:1px_solid_#dbe4ef] [box-shadow:0_12px_32px_rgba(48,_72,_104,_0.06)] [border-radius:20px] [border:1px_solid_#dbe5ef] [box-shadow:0_12px_30px_rgba(28,_52,_84,_0.06)]">
          <template #header>
            <div class="card-header [font-weight:600] [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>绑定 PTA 账号</span></div>
          </template>

          <div class="pta-hint [margin-bottom:12px] [font-size:13px] [line-height:1.7] [color:#5f6368]">
            绑定后，PTA 数据同步会优先使用此账号登录；在同步页面临时输入的账号密码会覆盖本次任务。
          </div>

          <div v-if="hasBoundCredential" class="pta-bound [margin-bottom:16px] [padding:10px_12px] [border-radius:10px] [background:#e6f4ea] [color:#1e8e3e] [font-size:13px]">
            当前已绑定 PTA 账号：<strong>{{ ptaCredential.ptaUsername }}</strong>
          </div>
          <div v-else class="pta-bound pta-bound--warning [margin-bottom:16px] [padding:10px_12px] [border-radius:10px] [background:#e6f4ea] [color:#1e8e3e] [font-size:13px] [background:#fef7e0] [color:#b26a00]">
            当前未绑定 PTA 账号。
          </div>

          <el-form label-width="110px" class="pta-form [margin-top:4px]">
            <el-form-item label="PTA 账号">
              <el-input
                v-model="ptaForm.ptaUsername"
                placeholder="请输入教师自己的 PTA 登录账号"
                clearable
              />
            </el-form-item>
            <el-form-item label="PTA 密码">
              <el-input
                v-model="ptaForm.ptaPassword"
                type="password"
                show-password
                placeholder="请输入 PTA 登录密码"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="savingPtaCredential" @click="savePtaCredential">
                保存绑定
              </el-button>
              <el-button :disabled="!hasBoundCredential" @click="clearPtaCredential">
                解除绑定
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="form-card [border-radius:22px] [border:1px_solid_#dbe4ef] [box-shadow:0_12px_32px_rgba(48,_72,_104,_0.06)] [border-radius:20px] [border:1px_solid_#dbe5ef] [box-shadow:0_12px_30px_rgba(28,_52,_84,_0.06)]">
          <template #header>
            <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>修改密码</span></div>
          </template>

          <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码（至少6位）" />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="changingPassword" @click="changePassword">修改密码</el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { getUserInfo } from '../../constants/auth'
import PageHeader from '../../components/PageHeader.vue'
import { API_BASE_URL_WITH_SLASH } from '../../config/runtime'
import {
  clearTeacherPtaCredentials,
  getTeacherPtaCredentials,
  updateTeacherPtaCredentials
} from '../../api/tap'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'

const apiClient = axios.create({
  baseURL: API_BASE_URL_WITH_SLASH,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const userInfo = computed(() => getUserInfo() || {})
const displayName = computed(() => userInfo.value.username || '教师用户')
const avatarUrl = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const roleText = computed(() => {
  const map = { teacher: '教师', student: '学生', admin: '管理员' }
  return map[userInfo.value.role] || '用户'
})

const passwordFormRef = ref(null)
const changingPassword = ref(false)
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const ptaCredential = reactive({
  ptaUsername: '',
  bound: false,
  lastUpdated: ''
})
const ptaForm = reactive({
  ptaUsername: '',
  ptaPassword: ''
})
const savingPtaCredential = ref(false)
const hasBoundCredential = computed(() => !!ptaCredential.bound)

const validateConfirm = (_rule, value, callback) => {
  if (value !== passwordForm.newPassword) callback(new Error('两次输入的密码不一致'))
  else callback()
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

async function loadPtaCredential() {
  try {
    const res = await getTeacherPtaCredentials()
    const data = res?.data || res || {}
    ptaCredential.ptaUsername = data?.ptaUsername || ''
    ptaCredential.bound = !!data?.bound
    ptaCredential.lastUpdated = data?.lastUpdated || ''
    ptaForm.ptaUsername = data?.ptaUsername || ''
    ptaForm.ptaPassword = ''
  } catch (error) {
    ptaCredential.ptaUsername = ''
    ptaCredential.bound = false
    ptaCredential.lastUpdated = ''
  }
}

async function savePtaCredential() {
  const username = ptaForm.ptaUsername.trim()
  const password = ptaForm.ptaPassword
  if (!username || !password) {
    ElMessage.warning('请输入完整的 PTA 账号和密码')
    return
  }

  savingPtaCredential.value = true
  try {
    const res = await updateTeacherPtaCredentials({
      ptaUsername: username,
      ptaPassword: password
    })
    const data = res?.data || res || {}
    ptaCredential.ptaUsername = data?.ptaUsername || username
    ptaCredential.bound = !!data?.bound
    ptaCredential.lastUpdated = data?.lastUpdated || ''
    ptaForm.ptaPassword = ''
    ElMessage.success('PTA 账号绑定已保存')
  } catch (error) {
    ElMessage.error(getFriendlyErrorMessage(error, 'PTA 账号绑定保存失败，请稍后重试'))
  } finally {
    savingPtaCredential.value = false
  }
}

async function clearPtaCredential() {
  try {
    await ElMessageBox.confirm(
      '解除绑定后，系统将不再自动使用此 PTA 账号进行同步。是否继续？',
      '解除 PTA 绑定',
      {
        confirmButtonText: '解除绑定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  savingPtaCredential.value = true
  try {
    await clearTeacherPtaCredentials()
    ptaCredential.ptaUsername = ''
    ptaCredential.bound = false
    ptaCredential.lastUpdated = ''
    ptaForm.ptaUsername = ''
    ptaForm.ptaPassword = ''
    ElMessage.success('PTA 账号绑定已解除')
  } catch (error) {
    ElMessage.error(getFriendlyErrorMessage(error, '解除 PTA 绑定失败，请稍后重试'))
  } finally {
    savingPtaCredential.value = false
  }
}

const changePassword = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    changingPassword.value = true
    try {
      const res = await apiClient.post('/api/user/password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      const data = res.data || res
      if (data.success) {
        ElMessage.success('密码修改成功')
        resetPasswordForm()
      } else {
        ElMessage.error(getFriendlyResponseMessage(data, '密码修改失败，请检查当前密码后重试'))
      }
    } catch (e) {
      ElMessage.error(getFriendlyErrorMessage(e, '密码修改失败，请检查当前密码后重试'))
    } finally {
      changingPassword.value = false
    }
  })
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

onMounted(() => {
  loadPtaCredential()
})
</script>


