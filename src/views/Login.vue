<template>
  <div class="login-page">
    <div class="corner-brand" aria-hidden="true">AI TEACHING ASSISTANT</div>

    <main class="login-shell">
      <section class="intro-panel" aria-label="平台简介">
        <div class="intro-mark" aria-hidden="true">&lt;/&gt;</div>
        <h1>智能教辅平台</h1>
        <p class="intro-subtitle">面向程序设计实验教学的智能支持系统</p>
        <div class="title-rule" aria-hidden="true"></div>

        <div class="feature-row">
          <article class="feature-item">
            <div class="feature-icon">
              <el-icon><User /></el-icon>
            </div>
            <div>
              <h2>学习画像</h2>
              <p>多源学习证据建模</p>
            </div>
          </article>

          <article class="feature-item">
            <div class="feature-icon">
              <el-icon><DocumentChecked /></el-icon>
            </div>
            <div>
              <h2>智能批改</h2>
              <p>代码错因诊断与反馈</p>
            </div>
          </article>

          <article class="feature-item">
            <div class="feature-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div>
              <h2>个性化补弱</h2>
              <p>薄弱点定位与练习推荐</p>
            </div>
          </article>
        </div>

      </section>

      <section class="login-card" aria-label="账号登录">
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
                <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large">
                  <template #prefix>
                    <el-icon><UserFilled /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="password" label="密码">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  show-password
                  size="large"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleLogin">
                登录
              </el-button>

              <div class="agreement-row">
                <el-checkbox v-model="agreementAccepted" />
                <span>登录即表示您已阅读并同意</span>
                <a>《用户协议》</a>
                <span>和</span>
                <a>《隐私政策》</a>
              </div>
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
                <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large">
                  <template #prefix>
                    <el-icon><UserFilled /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="password" label="密码">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  show-password
                  size="large"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="confirmPassword" label="确认密码">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  show-password
                  size="large"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="usernum" label="学号">
                <el-input v-model="registerForm.usernum" placeholder="请输入学号" size="large" />
              </el-form-item>

              <el-form-item prop="classname" label="班级">
                <el-input v-model="registerForm.classname" placeholder="例如：计科23" size="large" />
              </el-form-item>

              <el-button type="primary" size="large" class="submit-btn register-btn" :loading="loading" @click="handleRegister">
                注册学生账号
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <p v-if="isDevelopment" class="dev-hint">开发环境已自动填充默认测试账号。</p>
      </section>
    </main>

  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DocumentChecked, Lock, TrendCharts, User, UserFilled } from '@element-plus/icons-vue'
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
const agreementAccepted = ref(true)
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
  if (!agreementAccepted.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }

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
  --login-shell-max-width: 1500px;
  --login-shell-pad-x: 108px;
  --login-shell-pad-y: 46px;
  --login-shell-gap: 142px;
  --login-card-width: 554px;
  --login-card-offset-x: 6px;
  --login-card-offset-y: 18px;
  --login-card-padding-x: 60px;
  --login-card-padding-y: 40px;
  --login-card-radius: 18px;
  --login-card-shadow-y: 28px;
  --login-card-shadow-blur: 80px;
  --login-input-height: 49px;
  --login-input-radius: 8px;
  --login-input-font-size: 17px;
  --login-label-font-size: 17px;
  --login-form-gap: 28px;
  --login-tab-font-size: 24px;
  --login-tab-height: 52px;
  --login-button-height: 60px;
  --login-button-font-size: 21px;
  --login-intro-offset-x: 2px;
  --login-intro-offset-y: 0px;
  --login-title-font-size: 61px;
  --login-title-weight: 500;
  --login-subtitle-font-size: 24px;
  --login-subtitle-line-height: 1.35;
  --login-title-rule-gap: 24px;
  --login-feature-offset-y: 0px;
  --login-feature-gap: 46px;
  --login-feature-icon-size: 58px;
  --login-feature-text-gap: 14px;
  --login-feature-title-size: 18px;
  --login-feature-desc-size: 12px;
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  background:
    linear-gradient(90deg, rgba(5, 23, 44, 0.16) 0%, rgba(5, 23, 44, 0.05) 45%, rgba(5, 23, 44, 0.2) 100%),
    url("../assets/images/login-tech-background.png") center center / cover no-repeat,
    linear-gradient(124deg, #061b34 0%, #082747 47%, #0a3765 100%);
  color: #fff;
}

.login-page::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: "";
  pointer-events: none;
  background: linear-gradient(180deg, rgba(3, 14, 28, 0.02), rgba(3, 14, 28, 0.24));
}

.corner-brand {
  position: absolute;
  top: clamp(28px, 5vh, 52px);
  right: clamp(32px, 6vw, 86px);
  z-index: 2;
  color: rgba(91, 190, 255, 0.78);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.login-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(420px, 0.95fr) minmax(460px, var(--login-card-width));
  gap: var(--login-shell-gap);
  align-items: center;
  width: min(100%, var(--login-shell-max-width));
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  padding: var(--login-shell-pad-y) var(--login-shell-pad-x);
}

.intro-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 720px;
  min-height: 600px;
  transform: translate(var(--login-intro-offset-x), var(--login-intro-offset-y));
}

.intro-panel h1 {
  margin: 0;
  color: #f8fbff;
  font-size: var(--login-title-font-size);
  font-weight: var(--login-title-weight);
  line-height: 1.1;
  letter-spacing: 0;
  text-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
}

.intro-subtitle {
  margin: 18px 0 0;
  color: rgba(226, 238, 251, 0.82);
  font-size: var(--login-subtitle-font-size);
  font-weight: 400;
  line-height: var(--login-subtitle-line-height);
  letter-spacing: 0;
}

.title-rule {
  width: 54px;
  height: 5px;
  margin: 24px 0 var(--login-title-rule-gap);
  border-radius: 999px;
  background: linear-gradient(90deg, #13d6ff, #3185ff);
  box-shadow: 0 0 22px rgba(30, 178, 255, 0.45);
}

.intro-mark {
  position: absolute;
  top: -8px;
  right: 8px;
  color: rgba(80, 153, 255, 0.16);
  font-size: 58px;
  font-weight: 700;
  letter-spacing: 0;
}

.feature-row {
  display: grid;
  grid-template-columns: repeat(3, max-content);
  gap: var(--login-feature-gap);
  width: min(100%, 680px);
  margin-top: clamp(14px, 2.4vh, 26px);
  transform: translateY(var(--login-feature-offset-y));
}

.feature-item {
  display: grid;
  grid-template-columns: var(--login-feature-icon-size) max-content;
  gap: var(--login-feature-text-gap);
  align-items: center;
  min-width: 0;
}

.feature-icon {
  display: grid;
  place-items: center;
  width: var(--login-feature-icon-size);
  height: var(--login-feature-icon-size);
  border: 2px solid rgba(var(--feature-rgb), 0.82);
  border-radius: 12px;
  color: var(--feature-color);
  background: rgba(var(--feature-rgb), 0.1);
  box-shadow: 0 0 28px rgba(var(--feature-rgb), 0.18), inset 0 0 18px rgba(var(--feature-rgb), 0.1);
}

.feature-item:nth-child(1) {
  --feature-color: #18d9ff;
  --feature-rgb: 24, 217, 255;
}

.feature-item:nth-child(2) {
  --feature-color: #4d8cff;
  --feature-rgb: 77, 140, 255;
}

.feature-item:nth-child(3) {
  --feature-color: #2fe6b8;
  --feature-rgb: 47, 230, 184;
}

.feature-icon .el-icon {
  font-size: calc(var(--login-feature-icon-size) * 0.52);
}

.feature-item h2 {
  margin: 0 0 7px;
  color: #f8fbff;
  font-size: var(--login-feature-title-size);
  font-weight: 560;
  letter-spacing: 0;
  white-space: nowrap;
}

.feature-item p {
  margin: 0;
  color: rgba(202, 219, 238, 0.72);
  font-size: var(--login-feature-desc-size);
  line-height: 1.6;
  white-space: nowrap;
}

.login-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: var(--login-card-width);
  padding: var(--login-card-padding-y) var(--login-card-padding-x) 30px;
  border: 1px solid rgba(221, 231, 242, 0.92);
  border-radius: var(--login-card-radius);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.97));
  box-shadow: 0 var(--login-card-shadow-y) var(--login-card-shadow-blur) rgba(0, 10, 28, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.92);
  transform: translate(var(--login-card-offset-x), var(--login-card-offset-y));
}

.login-card::before {
  position: absolute;
  content: "";
  inset: 0 0 auto;
  height: 130px;
  background: radial-gradient(circle at 50% 0%, rgba(26, 119, 255, 0.09), transparent 70%);
  pointer-events: none;
}

.login-tabs {
  position: relative;
}

.login-tabs :deep(.el-tabs__header) {
  margin: 0 0 34px;
}

.login-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 2px;
  background: #e7edf5;
}

.login-tabs :deep(.el-tabs__active-bar) {
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, #006cff, #1594ff);
}

.login-tabs :deep(.el-tabs__item) {
  height: var(--login-tab-height);
  color: #1e293b;
  font-size: var(--login-tab-font-size);
  font-weight: 650;
  letter-spacing: 0;
}

.login-tabs :deep(.el-tabs__item.is-active) {
  color: #0074ff;
}

.login-tabs :deep(.el-form-item) {
  margin-bottom: var(--login-form-gap);
}

.login-tabs :deep(.el-form-item__label) {
  margin-bottom: 10px;
  color: #17233a;
  font-size: var(--login-label-font-size);
  font-weight: 650;
  line-height: 1.2;
  letter-spacing: 0;
}

.login-tabs :deep(.el-radio-group) {
  display: flex;
  width: 100%;
  overflow: hidden;
  border: 1px solid #dce4ee;
  border-radius: 8px;
  background: #fff;
}

.login-tabs :deep(.el-radio-button) {
  flex: 1;
}

.login-tabs :deep(.el-radio-button__inner) {
  width: 100%;
  min-height: 52px;
  border: 0;
  border-left: 1px solid #dce4ee;
  border-radius: 0;
  color: #344154;
  background: #fff;
  box-shadow: none;
  font-size: 18px;
  font-weight: 560;
  letter-spacing: 0;
}

.login-tabs :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 0;
  border-radius: 8px 0 0 8px;
}

.login-tabs :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 8px 8px 0;
}

.login-tabs :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: #fff;
  background: linear-gradient(180deg, #0076ff, #0063df);
  box-shadow: 0 12px 22px rgba(0, 105, 240, 0.22);
}

.login-tabs :deep(.el-input__wrapper) {
  min-height: var(--login-input-height);
  padding: 0 18px;
  border-radius: var(--login-input-radius);
  background: #fff;
  box-shadow: 0 0 0 1px #dce4ee inset;
  transition: box-shadow 0.18s ease, background 0.18s ease;
}

.login-tabs :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #117eff inset, 0 0 0 4px rgba(17, 126, 255, 0.12);
}

.login-tabs :deep(.el-input__prefix),
.login-tabs :deep(.el-input__suffix) {
  color: #8a97aa;
  font-size: 20px;
}

.login-tabs :deep(.el-input__inner) {
  color: #17233a;
  font-size: var(--login-input-font-size);
}

.login-tabs :deep(.el-input__inner::placeholder) {
  color: #9aa7b8;
}

.submit-btn {
  width: 100%;
  min-height: var(--login-button-height);
  margin-top: 10px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(180deg, #087cff 0%, #0062dd 100%);
  box-shadow: 0 16px 30px rgba(0, 101, 232, 0.26);
  font-size: var(--login-button-font-size);
  font-weight: 650;
  letter-spacing: 0;
}

.submit-btn:hover,
.submit-btn:focus {
  background: linear-gradient(180deg, #1688ff 0%, #0069eb 100%);
}

.register-btn {
  margin-top: 0;
}

.agreement-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  margin-top: 18px;
  color: #5f6f83;
  font-size: 14px;
  line-height: 1.7;
}

.agreement-row :deep(.el-checkbox) {
  height: 20px;
  margin-right: 2px;
}

.agreement-row :deep(.el-checkbox__inner) {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.agreement-row a {
  color: #087cff;
  font-weight: 600;
}

.dev-hint {
  margin: 18px 0 0;
  padding-top: 14px;
  border-top: 1px solid rgba(129, 155, 181, 0.14);
  color: #8a9aab;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 1180px) {
  .login-shell {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
    align-content: center;
  }

  .intro-panel {
    max-width: 760px;
  }

  .tech-visual {
    display: none;
  }

  .login-card {
    max-width: 560px;
  }
}

@media (max-width: 720px) {
  .login-shell {
    min-height: auto;
    padding: 28px 18px;
  }

  .intro-kicker,
  .intro-mark {
    display: none;
  }

  .intro-panel h1 {
    font-size: 34px;
  }

  .intro-subtitle {
    font-size: 17px;
  }

  .title-rule {
    margin: 18px 0 22px;
  }

  .feature-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .feature-item {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .feature-icon {
    width: 52px;
    height: 52px;
  }

  .feature-icon .el-icon {
    font-size: 28px;
  }

  .login-card {
    padding: 30px 18px 22px;
    border-radius: 16px;
  }

  .login-tabs :deep(.el-tabs__item) {
    height: 44px;
    font-size: 20px;
  }

  .login-tabs :deep(.el-form-item__label),
  .login-tabs :deep(.el-radio-button__inner) {
    font-size: 16px;
  }

  .login-tabs :deep(.el-radio-button__inner) {
    min-height: 46px;
    padding: 10px 8px;
  }

  .submit-btn {
    min-height: 54px;
    font-size: 18px;
  }
}
</style>
