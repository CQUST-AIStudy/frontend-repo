<template>
  <div class="login-page [position:relative] [overflow-x:hidden] [overflow-y:auto] [isolation:isolate] [min-height:100vh] [min-height:100dvh] [display:flex] [align-items:center] [justify-content:center] [padding:32px_clamp(24px,_6vw,_72px)] [background:linear-gradient(115deg,_rgba(244,_249,_255,_0.5)_10%,_rgba(236,_244,_252,_0.2)_38%,_rgba(15,_35,_68,_0.08)_74%),_url('../images/login-background.png')_center_center_/_cover_no-repeat] max-[480px]:[justify-content:center] max-[480px]:[padding:20px_14px]">
    <div class="login-card [position:relative] [overflow:hidden] [width:min(100%,_440px)] [max-width:calc(100vw_-_28px)] [padding:36px_32px_26px] [margin-inline:auto] [border-radius:28px] [background:linear-gradient(180deg,_rgba(255,_255,_255,_0.84)_0%,_rgba(248,_251,_255,_0.74)_100%)] [border:1px_solid_rgba(228,_239,_249,_0.62)] [box-shadow:0_24px_54px_rgba(26,_54,_86,_0.18),_0_10px_24px_rgba(255,_255,_255,_0.16),_inset_0_1px_0_rgba(255,_255,_255,_0.9)] [backdrop-filter:blur(18px)] max-[480px]:[padding:28px_18px_20px] max-[480px]:[border-radius:22px]">
      <div class="login-header [position:relative] [margin-bottom:24px] [text-align:center] [&_h1]:[margin:0_0_10px] [&_h1]:[font-size:30px] [&_h1]:[font-weight:700] [&_h1]:[letter-spacing:0] [&_h1]:[color:#193754] [&_p]:[margin:0] [&_p]:[color:#61788e] [&_p]:[font-size:14px] [&_p]:[letter-spacing:0] max-[480px]:[&_h1]:[font-size:24px]">
        <h1>智能教辅平台</h1>
        <p>使用账号登录系统</p>
      </div>

      <el-tabs v-model="activeTab" stretch class="login-tabs [&_.el-tabs__header]:[margin-bottom:24px] [&_.el-tabs__nav-wrap::after]:[height:1px] [&_.el-tabs__nav-wrap::after]:[background:rgba(129,_155,_181,_0.18)] [&_.el-tabs__nav]:[gap:4px] [&_.el-tabs__item]:[height:42px] [&_.el-tabs__item]:[color:#6f8194] [&_.el-tabs__item]:[font-weight:600] [&_.el-tabs__item]:[transition:color_0.2s_ease] [&_.el-tabs__item.is-active]:[color:#1270d8] [&_.el-form-item__label]:[font-weight:600] [&_.el-form-item__label]:[color:#3f5b74] [&_.el-radio-group]:[display:flex] [&_.el-radio-group]:[width:100%] [&_.el-radio-group]:[min-width:0] [&_.el-radio-group]:[padding:4px] [&_.el-radio-group]:[border-radius:16px] [&_.el-radio-group]:[background:rgba(245,_249,_253,_0.88)] [&_.el-radio-group]:[box-shadow:inset_0_0_0_1px_rgba(174,_198,_220,_0.18)] [&_.el-radio-button]:[flex:1] [&_.el-radio-button]:[min-width:0] [&_.el-radio-button__inner]:[width:100%] [&_.el-radio-button__inner]:[min-height:40px] [&_.el-radio-button__inner]:[border:none] [&_.el-radio-button__inner]:[border-radius:12px] [&_.el-radio-button__inner]:[background:transparent] [&_.el-radio-button__inner]:[color:#5d7288] [&_.el-radio-button__inner]:[box-shadow:none] [&_.el-radio-button__inner]:[font-weight:600] [&_.el-radio-button__inner]:[transition:all_0.2s_ease] [&_.el-radio-button:first-child_.el-radio-button__inner]:[border-radius:12px] [&_.el-radio-button:last-child_.el-radio-button__inner]:[border-radius:12px] [&_.el-radio-button__original-radio:checked_+_.el-radio-button__inner]:[color:#1270d8] [&_.el-radio-button__original-radio:checked_+_.el-radio-button__inner]:[background:rgba(255,_255,_255,_0.95)] [&_.el-radio-button__original-radio:checked_+_.el-radio-button__inner]:[box-shadow:0_8px_18px_rgba(18,_112,_216,_0.1),_inset_0_0_0_1px_rgba(18,_112,_216,_0.12)] [&_.el-input__wrapper]:[min-height:48px] [&_.el-input__wrapper]:[background:rgba(255,_255,_255,_0.78)] [&_.el-input__prefix]:[color:#8aa0b3] [&_.el-input__suffix]:[color:#8aa0b3] max-[480px]:[&_.el-radio-button__inner]:[font-size:13px] max-[480px]:[&_.el-radio-button__inner]:[padding-inline:8px] max-[360px]:[&_.el-radio-group]:[flex-direction:column] max-[360px]:[&_.el-radio-group]:[gap:4px] max-[360px]:[&_.el-radio-button__inner]:[min-height:36px]">
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

            <el-button type="primary" size="large" class="submit-btn [width:100%] [min-height:48px] [margin-top:10px] [border-radius:14px] [font-size:15px] [letter-spacing:0] [box-shadow:0_16px_28px_rgba(18,_112,_216,_0.22)]" :loading="loading" @click="handleLogin">
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

            <el-button type="primary" size="large" class="submit-btn [width:100%] [min-height:48px] [margin-top:10px] [border-radius:14px] [font-size:15px] [letter-spacing:0] [box-shadow:0_16px_28px_rgba(18,_112,_216,_0.22)]" :loading="loading" @click="handleRegister">
              注册学生账号
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <p v-if="isDevelopment" class="dev-hint [margin:18px_0_0] [padding-top:14px] [border-top:1px_solid_rgba(129,_155,_181,_0.14)] [text-align:center] [color:#8a9aab] [font-size:12px]">开发环境已自动填充默认测试账号。</p>
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

