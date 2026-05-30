<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>智能教辅平台</h1>
        <p>使用账号登录系统</p>
      </div>

      <el-tabs v-model="activeTab" stretch class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            @keyup.enter="handleLogin"
          >
            <el-form-item label="角色">
              <el-radio-group v-model="selectedRole">
                <el-radio-button label="teacher">教师</el-radio-button>
                <el-radio-button label="student">学生</el-radio-button>
                <el-radio-button label="admin">管理员</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item prop="username" label="用户名">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" />
            </el-form-item>

            <el-form-item prop="password" label="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                size="large"
              />
            </el-form-item>

            <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleLogin">
              登录
            </el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            @keyup.enter="handleRegister"
          >
            <el-form-item prop="username" label="用户名">
              <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large" />
            </el-form-item>

            <el-form-item prop="password" label="密码">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                size="large"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword" label="确认密码">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
                size="large"
              />
            </el-form-item>

            <el-form-item prop="usernum" label="学号">
              <el-input v-model="registerForm.usernum" placeholder="请输入学号" size="large" />
            </el-form-item>

            <el-form-item prop="classname" label="班级">
              <el-input v-model="registerForm.classname" placeholder="例如：计科23" size="large" />
            </el-form-item>

            <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleRegister">
              注册学生账号
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <p v-if="isDevelopment" class="dev-hint">开发环境已自动填充默认测试账号。</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store'
import api from '../api'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../utils/errorMessage'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const loading = ref(false)
const selectedRole = ref('teacher')
const isDevelopment = process.env.NODE_ENV === 'development'

const defaultAccounts = isDevelopment ? {
  teacher: { username: 'teacher1', password: 'password123' },
  student: { username: 'student1', password: 'password123' },
  admin: { username: 'admin1', password: 'password123' }
} : {}

const loginForm = reactive({
  username: defaultAccounts.teacher?.username || '',
  password: defaultAccounts.teacher?.password || ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  usernum: '',
  classname: ''
})

watch(selectedRole, (role) => {
  if (!isDevelopment) return
  const account = defaultAccounts[role]
  if (!account) return
  loginForm.username = account.username
  loginForm.password = account.password
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
}

function validateConfirmPassword(_rule, value, callback) {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  usernum: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  classname: [{ required: true, message: '请输入班级', trigger: 'blur' }]
}

function handleLogin() {
  loginFormRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const result = await userStore.login(loginForm.username, loginForm.password, selectedRole.value)
      if (!(result && result.success)) {
        ElMessage.error(getFriendlyResponseMessage(result, '用户名或密码不正确，请检查后重试'))
        return
      }

      const userInfo = result.user || result.userInfo
      const targetRole = userInfo?.role || selectedRole.value
      if (targetRole === 'teacher') {
        userStore.setSelectedClass(null)
      }

      ElMessage.success('登录成功')
      if (targetRole === 'teacher') {
        await router.push('/teacher/select-class')
      } else if (targetRole === 'admin') {
        await router.push('/admin/dashboard')
      } else {
        await router.push('/student/dashboard')
      }
    } catch (error) {
      ElMessage.error(getFriendlyErrorMessage(error, '登录失败，请稍后重试'))
    } finally {
      loading.value = false
    }
  })
}

function handleRegister() {
  registerFormRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const result = await api.register({
        ...registerForm,
        role: 'student'
      })
      if (!(result && result.success)) {
        ElMessage.error(getFriendlyResponseMessage(result, '注册失败，请检查填写内容后重试'))
        return
      }

      ElMessage.success('注册成功，请登录')
      activeTab.value = 'login'
      loginForm.username = registerForm.username
      loginForm.password = ''
      registerForm.username = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.usernum = ''
      registerForm.classname = ''
    } catch (error) {
      ElMessage.error(getFriendlyErrorMessage(error, '注册失败，请稍后重试'))
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  isolation: isolate;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px clamp(24px, 6vw, 72px);
  background:
    linear-gradient(115deg, rgba(244, 249, 255, 0.5) 10%, rgba(236, 244, 252, 0.2) 38%, rgba(15, 35, 68, 0.08) 74%),
    url('../assets/images/login-background.png') center center / cover no-repeat;
}

.login-page::before,
.login-page::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -1;
}

.login-page::before {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.03) 26%, rgba(255, 255, 255, 0) 42%),
    radial-gradient(circle at 34% 60%, rgba(255, 238, 215, 0.34), transparent 24%),
    radial-gradient(circle at 76% 16%, rgba(181, 223, 255, 0.16), transparent 18%);
}

.login-page::after {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 28%, rgba(9, 27, 51, 0.12) 100%),
    linear-gradient(180deg, rgba(12, 34, 64, 0.02), rgba(12, 34, 64, 0.16));
}

.login-card {
  position: relative;
  overflow: hidden;
  width: min(100%, 440px);
  max-width: calc(100vw - 28px);
  padding: 36px 32px 26px;
  margin-inline: auto;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(248, 251, 255, 0.74) 100%);
  border: 1px solid rgba(228, 239, 249, 0.62);
  box-shadow:
    0 24px 54px rgba(26, 54, 86, 0.18),
    0 10px 24px rgba(255, 255, 255, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
}

.login-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 132px;
  background:
    linear-gradient(135deg, rgba(115, 182, 255, 0.2), rgba(255, 232, 205, 0.18) 58%, transparent 100%);
  pointer-events: none;
}

.login-card::after {
  content: "";
  position: absolute;
  top: 18px;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.12));
  pointer-events: none;
}

.login-header {
  position: relative;
  margin-bottom: 24px;
  text-align: center;
}

.login-header h1 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0;
  color: #193754;
}

.login-header p {
  margin: 0;
  color: #61788e;
  font-size: 14px;
  letter-spacing: 0;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.login-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: rgba(129, 155, 181, 0.18);
}

.login-tabs :deep(.el-tabs__nav) {
  gap: 4px;
}

.login-tabs :deep(.el-tabs__item) {
  height: 42px;
  color: #6f8194;
  font-weight: 600;
  transition: color 0.2s ease;
}

.login-tabs :deep(.el-tabs__item.is-active) {
  color: #1270d8;
}

.login-tabs :deep(.el-form-item__label) {
  font-weight: 600;
  color: #3f5b74;
}

.login-tabs :deep(.el-radio-group) {
  display: flex;
  width: 100%;
  min-width: 0;
  padding: 4px;
  border-radius: 16px;
  background: rgba(245, 249, 253, 0.88);
  box-shadow: inset 0 0 0 1px rgba(174, 198, 220, 0.18);
}

.login-tabs :deep(.el-radio-button) {
  flex: 1;
  min-width: 0;
}

.login-tabs :deep(.el-radio-button__inner) {
  width: 100%;
  min-height: 40px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #5d7288;
  box-shadow: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.login-tabs :deep(.el-radio-button:first-child .el-radio-button__inner),
.login-tabs :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 12px;
}

.login-tabs :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: #1270d8;
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 8px 18px rgba(18, 112, 216, 0.1),
    inset 0 0 0 1px rgba(18, 112, 216, 0.12);
}

.login-tabs :deep(.el-input__wrapper) {
  min-height: 48px;
  background: rgba(255, 255, 255, 0.78);
}

.login-tabs :deep(.el-input__prefix),
.login-tabs :deep(.el-input__suffix) {
  color: #8aa0b3;
}

.submit-btn {
  width: 100%;
  min-height: 48px;
  margin-top: 10px;
  border-radius: 14px;
  font-size: 15px;
  letter-spacing: 0;
  box-shadow: 0 16px 28px rgba(18, 112, 216, 0.22);
}

.dev-hint {
  margin: 18px 0 0;
  padding-top: 14px;
  border-top: 1px solid rgba(129, 155, 181, 0.14);
  text-align: center;
  color: #8a9aab;
  font-size: 12px;
}

@media (max-width: 480px) {
  .login-page {
    justify-content: center;
    padding: 20px 14px;
  }

  .login-card {
    padding: 28px 18px 20px;
    border-radius: 22px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-tabs :deep(.el-radio-button__inner) {
    font-size: 13px;
    padding-inline: 8px;
  }
}

@media (max-width: 360px) {
  .login-tabs :deep(.el-radio-group) {
    flex-direction: column;
    gap: 4px;
  }

  .login-tabs :deep(.el-radio-button__inner) {
    min-height: 36px;
  }
}
</style>
