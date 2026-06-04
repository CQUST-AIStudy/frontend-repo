<template>
  <div
    class="relative isolate min-h-screen min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-cover bg-center bg-no-repeat text-white [background-image:linear-gradient(90deg,rgba(5,23,44,0.16)_0%,rgba(5,23,44,0.05)_45%,rgba(5,23,44,0.2)_100%),var(--login-bg-image),linear-gradient(124deg,#061b34_0%,#082747_47%,#0a3765_100%)] max-[720px]:[background-image:linear-gradient(124deg,#061b34_0%,#082747_47%,#0a3765_100%)]"
    :style="pageBackgroundStyle"
  >
    <div class="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,14,28,0.02),rgba(3,14,28,0.24))]"></div>
    <div class="absolute right-[clamp(32px,6vw,86px)] top-[clamp(28px,5vh,52px)] z-[2] text-[14px] font-semibold tracking-[0.12em] text-[rgba(91,190,255,0.78)] max-[720px]:hidden" aria-hidden="true">
      AI TEACHING ASSISTANT
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-x-1/2 -translate-y-2 opacity-0"
      enter-to-class="-translate-x-1/2 translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="-translate-x-1/2 translate-y-0 opacity-100"
      leave-to-class="-translate-x-1/2 -translate-y-2 opacity-0"
    >
      <div
        v-if="toast.visible"
        class="fixed left-1/2 top-6 z-50 flex min-h-10 min-w-[280px] max-w-[calc(100vw-32px)] -translate-x-1/2 items-center justify-center rounded-lg border px-4 py-2.5 text-[14px] font-medium shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
        :class="toastClass"
        role="status"
        aria-live="polite"
      >
        {{ toast.message }}
      </div>
    </Transition>

    <main class="relative z-[1] mx-auto grid min-h-screen min-h-[100dvh] w-[min(100%,1500px)] grid-cols-[minmax(420px,0.95fr)_minmax(460px,554px)] items-center gap-[142px] px-[108px] py-[46px] max-[1180px]:grid-cols-[minmax(0,1fr)] max-[1180px]:content-center max-[1180px]:gap-7 max-[720px]:flex max-[720px]:min-h-[100dvh] max-[720px]:flex-col max-[720px]:items-center max-[720px]:justify-center max-[720px]:gap-4 max-[720px]:px-3 max-[720px]:py-5 max-[360px]:py-4">
      <section class="relative flex min-h-[600px] max-w-[720px] translate-x-[2px] flex-col justify-center max-[720px]:min-h-0 max-[720px]:w-full max-[720px]:max-w-[520px] max-[720px]:translate-x-0 max-[720px]:items-center max-[720px]:text-center" aria-label="平台简介">
        <div class="absolute -top-2 right-2 text-[58px] font-bold tracking-normal text-[rgba(80,153,255,0.16)] max-[720px]:hidden" aria-hidden="true">
          &lt;/&gt;
        </div>
        <h1 class="m-0 text-[61px] font-medium leading-[1.1] tracking-normal text-[#f8fbff] [text-shadow:0_12px_30px_rgba(0,0,0,0.22)] max-[720px]:text-[28px] max-[720px]:font-[650] max-[360px]:text-[25px]">
          智能教辅平台
        </h1>
        <p class="mt-[18px] text-[24px] font-normal leading-[1.35] tracking-normal text-[rgba(226,238,251,0.82)] max-[720px]:mt-2 max-[720px]:max-w-[300px] max-[720px]:text-[13px] max-[720px]:leading-[1.45] max-[360px]:text-[12px]">
          面向程序设计实验教学的智能支持系统
        </p>
        <div class="mb-6 mt-6 h-[5px] w-[54px] rounded-full bg-[linear-gradient(90deg,#13d6ff,#3185ff)] shadow-[0_0_22px_rgba(30,178,255,0.45)] max-[720px]:mb-0 max-[720px]:mt-3 max-[720px]:h-1 max-[720px]:w-12" aria-hidden="true"></div>

        <div class="grid w-[min(100%,680px)] grid-cols-[repeat(3,max-content)] gap-[46px] max-[720px]:hidden max-[720px]:grid-cols-1 max-[720px]:gap-3.5">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="grid grid-cols-[58px_max-content] items-center gap-3.5 max-[720px]:grid-cols-[52px_minmax(0,1fr)]"
          >
            <div
              class="grid h-[58px] w-[58px] place-items-center rounded-xl border-2 bg-[rgba(var(--feature-rgb),0.1)] text-[var(--feature-color)] shadow-[0_0_28px_rgba(var(--feature-rgb),0.18),inset_0_0_18px_rgba(var(--feature-rgb),0.1)] max-[720px]:h-[52px] max-[720px]:w-[52px]"
              :class="feature.borderClass"
              :style="feature.style"
            >
              <svg
                v-if="feature.icon === 'user'"
                class="h-[30px] w-[30px] max-[720px]:h-7 max-[720px]:w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <svg
                v-else-if="feature.icon === 'checked'"
                class="h-[30px] w-[30px] max-[720px]:h-7 max-[720px]:w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                <path d="m9 14 2 2 4-4" />
              </svg>
              <svg
                v-else
                class="h-[30px] w-[30px] max-[720px]:h-7 max-[720px]:w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-5 5" />
                <path d="M19 9h-5" />
                <path d="M19 9v5" />
              </svg>
            </div>
            <div>
              <h2 class="mb-[7px] mt-0 whitespace-nowrap text-[18px] font-[560] tracking-normal text-[#f8fbff]">
                {{ feature.title }}
              </h2>
              <p class="m-0 whitespace-nowrap text-[12px] leading-[1.6] text-[rgba(202,219,238,0.72)]">
                {{ feature.description }}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section class="relative w-full max-w-[554px] translate-x-1.5 translate-y-[18px] overflow-hidden rounded-[18px] border border-[rgba(221,231,242,0.92)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.97))] px-[60px] pb-[30px] pt-10 text-slate-900 shadow-[0_28px_80px_rgba(0,10,28,0.32),inset_0_1px_0_rgba(255,255,255,0.92)] max-[1180px]:max-w-[560px] max-[720px]:mx-auto max-[720px]:max-w-[520px] max-[720px]:translate-x-0 max-[720px]:translate-y-0 max-[720px]:rounded-[24px] max-[720px]:px-4 max-[720px]:pb-4 max-[720px]:pt-5 max-[360px]:px-3.5" aria-label="账号登录">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-[130px] bg-[radial-gradient(circle_at_50%_0%,rgba(26,119,255,0.09),transparent_70%)]"></div>
        <div class="relative">
          <div class="relative mb-[34px] flex border-b-2 border-[#e7edf5] max-[720px]:mb-4" role="tablist" aria-label="账号操作">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              class="h-[52px] flex-1 text-[24px] font-[650] tracking-normal transition-colors max-[720px]:h-10 max-[720px]:text-[18px]"
              :class="activeTab === tab.value ? 'text-[#0074ff]' : 'text-[#1e293b] hover:text-[#0074ff]'"
              role="tab"
              :aria-selected="activeTab === tab.value"
              @click="setActiveTab(tab.value)"
            >
              {{ tab.label }}
            </button>
            <span
              class="absolute -bottom-0.5 left-0 h-1 w-1/2 rounded-full bg-[linear-gradient(90deg,#006cff,#1594ff)] transition-transform duration-300 ease-out motion-reduce:transition-none"
              :class="activeTab === 'register' ? 'translate-x-full' : 'translate-x-0'"
              aria-hidden="true"
            ></span>
          </div>

          <div class="overflow-hidden">
            <Transition
              mode="out-in"
              :enter-active-class="formTransitionEnterActiveClass"
              :enter-from-class="formTransitionEnterFromClass"
              enter-to-class="translate-x-0 opacity-100"
              :leave-active-class="formTransitionLeaveActiveClass"
              leave-from-class="translate-x-0 opacity-100"
              :leave-to-class="formTransitionLeaveToClass"
            >
              <form v-if="activeTab === 'login'" key="login" class="space-y-7 will-change-transform motion-reduce:transform-none max-[720px]:space-y-4" @submit.prevent="handleLogin">
                <div>
                  <label class="mb-2.5 block text-[17px] font-[650] leading-[1.2] tracking-normal text-[#17233a] max-[720px]:mb-2 max-[720px]:text-[15px]">角色</label>
                  <div class="flex w-full overflow-hidden rounded-lg border border-[#dce4ee] bg-white">
                    <button
                      v-for="role in roleOptions"
                      :key="role.value"
                      type="button"
                      class="min-h-[52px] flex-1 border-l border-[#dce4ee] text-[18px] font-[560] tracking-normal transition first:border-l-0 max-[720px]:min-h-[42px] max-[720px]:px-2 max-[720px]:text-[15px]"
                      :class="selectedRole === role.value ? 'bg-[linear-gradient(180deg,#0076ff,#0063df)] text-white shadow-[0_12px_22px_rgba(0,105,240,0.22)]' : 'bg-white text-[#344154] hover:bg-slate-50'"
                      :aria-pressed="selectedRole === role.value"
                      @click="selectRole(role.value)"
                    >
                      {{ role.label }}
                    </button>
                  </div>
                </div>

                <div>
                  <label class="mb-2.5 block text-[17px] font-[650] leading-[1.2] tracking-normal text-[#17233a] max-[720px]:mb-2 max-[720px]:text-[15px]" for="login-username">用户名</label>
                  <div :class="inputShellClass(loginErrors.username)">
                    <span class="grid h-5 w-5 shrink-0 place-items-center text-[#8a97aa]" aria-hidden="true">
                      <UserIcon />
                    </span>
                    <input
                      id="login-username"
                      v-model.trim="loginForm.username"
                      class="h-full min-h-[49px] flex-1 bg-transparent text-[17px] text-[#17233a] outline-none placeholder:text-[#9aa7b8] max-[720px]:min-h-[44px] max-[720px]:text-[16px]"
                      type="text"
                      autocomplete="username"
                      placeholder="请输入用户名"
                      @input="clearLoginFieldError('username')"
                      @blur="validateLoginField('username')"
                    />
                  </div>
                  <p v-if="loginErrors.username" class="mt-1.5 text-[12px] text-rose-500">{{ loginErrors.username }}</p>
                </div>

                <div>
                  <label class="mb-2.5 block text-[17px] font-[650] leading-[1.2] tracking-normal text-[#17233a] max-[720px]:mb-2 max-[720px]:text-[15px]" for="login-password">密码</label>
                  <div :class="inputShellClass(loginErrors.password)">
                    <span class="grid h-5 w-5 shrink-0 place-items-center text-[#8a97aa]" aria-hidden="true">
                      <LockIcon />
                    </span>
                    <input
                      id="login-password"
                      v-model="loginForm.password"
                      class="h-full min-h-[49px] flex-1 bg-transparent text-[17px] text-[#17233a] outline-none placeholder:text-[#9aa7b8] max-[720px]:min-h-[44px] max-[720px]:text-[16px]"
                      :type="showLoginPassword ? 'text' : 'password'"
                      autocomplete="current-password"
                      placeholder="请输入密码"
                      @input="clearLoginFieldError('password')"
                      @blur="validateLoginField('password')"
                    />
                    <button
                      type="button"
                      class="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#8a97aa] transition hover:bg-slate-100 hover:text-[#344154] max-[720px]:h-7 max-[720px]:w-7"
                      :aria-label="showLoginPassword ? '隐藏密码' : '显示密码'"
                      @click="showLoginPassword = !showLoginPassword"
                    >
                      <EyeIcon v-if="!showLoginPassword" />
                      <EyeOffIcon v-else />
                    </button>
                  </div>
                  <p v-if="loginErrors.password" class="mt-1.5 text-[12px] text-rose-500">{{ loginErrors.password }}</p>
                </div>

                <button
                  type="submit"
                  class="mt-2.5 flex min-h-[60px] w-full items-center justify-center gap-2 rounded-lg border-0 bg-[linear-gradient(180deg,#087cff_0%,#0062dd_100%)] text-[21px] font-[650] tracking-normal text-white shadow-[0_16px_30px_rgba(0,101,232,0.26)] transition hover:bg-[linear-gradient(180deg,#1688ff_0%,#0069eb_100%)] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70 max-[720px]:mt-1 max-[720px]:min-h-[50px] max-[720px]:text-[17px]"
                  :disabled="loading"
                >
                  <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
                  登录
                </button>

                <div class="mt-[18px] flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] leading-[1.7] text-[#5f6f83] max-[720px]:mt-3 max-[720px]:items-start max-[720px]:text-[12px] max-[720px]:leading-[1.55]">
                  <input
                    id="login-agreement"
                    v-model="agreementAccepted"
                    type="checkbox"
                    class="h-[18px] w-[18px] rounded border-[#dce4ee] text-[#087cff] accent-[#087cff] max-[720px]:mt-0.5 max-[720px]:h-4 max-[720px]:w-4"
                  />
                  <label for="login-agreement">登录即表示您已阅读并同意</label>
                  <a href="javascript:void(0)" class="font-semibold text-[#087cff]">《用户协议》</a>
                  <span>和</span>
                  <a href="javascript:void(0)" class="font-semibold text-[#087cff]">《隐私政策》</a>
                </div>
              </form>

              <form v-else key="register" class="space-y-7 will-change-transform motion-reduce:transform-none max-[720px]:space-y-4" @submit.prevent="handleRegister">
                <TextField
                  id="register-username"
                  v-model="registerForm.username"
                  label="用户名"
                  placeholder="请输入用户名"
                  autocomplete="username"
                  :error="registerErrors.username"
                  @input="clearRegisterFieldError('username')"
                  @blur="validateRegisterField('username')"
                >
                  <UserIcon />
                </TextField>

                <PasswordField
                  id="register-password"
                  v-model="registerForm.password"
                  label="密码"
                  placeholder="请输入密码"
                  autocomplete="new-password"
                  :visible="showRegisterPassword"
                  :error="registerErrors.password"
                  @toggle-visible="showRegisterPassword = !showRegisterPassword"
                  @input="clearRegisterFieldError('password')"
                  @blur="validateRegisterField('password')"
                />

                <PasswordField
                  id="register-confirmPassword"
                  v-model="registerForm.confirmPassword"
                  label="确认密码"
                  placeholder="请再次输入密码"
                  autocomplete="new-password"
                  :visible="showRegisterConfirmPassword"
                  :error="registerErrors.confirmPassword"
                  @toggle-visible="showRegisterConfirmPassword = !showRegisterConfirmPassword"
                  @input="clearRegisterFieldError('confirmPassword')"
                  @blur="validateRegisterField('confirmPassword')"
                />

                <TextField
                  id="register-usernum"
                  v-model="registerForm.usernum"
                  label="学号"
                  placeholder="请输入学号"
                  inputmode="numeric"
                  :error="registerErrors.usernum"
                  @input="clearRegisterFieldError('usernum')"
                  @blur="validateRegisterField('usernum')"
                />

                <TextField
                  id="register-classname"
                  v-model="registerForm.classname"
                  label="班级"
                  placeholder="例如：计科23"
                  :error="registerErrors.classname"
                  @input="clearRegisterFieldError('classname')"
                  @blur="validateRegisterField('classname')"
                />

                <button
                  type="submit"
                  class="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-lg border-0 bg-[linear-gradient(180deg,#087cff_0%,#0062dd_100%)] text-[21px] font-[650] tracking-normal text-white shadow-[0_16px_30px_rgba(0,101,232,0.26)] transition hover:bg-[linear-gradient(180deg,#1688ff_0%,#0069eb_100%)] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70 max-[720px]:min-h-[50px] max-[720px]:text-[17px]"
                  :disabled="loading"
                >
                  <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>
                  注册学生账号
                </button>
              </form>
            </Transition>
          </div>

          <p v-if="isDevelopment" class="mt-[18px] border-t border-[rgba(129,155,181,0.14)] pt-3.5 text-center text-[12px] text-[#8a9aab] max-[720px]:mt-3 max-[720px]:pt-2.5 max-[720px]:text-[11px]">
            开发环境已自动填充默认测试账号。
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import api from '../api'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../utils/errorMessage'
import loginTechBackground from '../assets/images/login-tech-background.png'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const tabTransitionDirection = ref('forward')
const loading = ref(false)
const selectedRole = ref('teacher')
const agreementAccepted = ref(true)
const isDevelopment = process.env.NODE_ENV === 'development'
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)
let toastTimer = null

const toast = reactive({
  visible: false,
  type: 'success',
  message: ''
})

const pageBackgroundStyle = computed(() => ({
  '--login-bg-image': `url(${loginTechBackground})`
}))

const formTransitionEnterActiveClass = computed(() => {
  return [
    'transition-[transform,opacity] duration-300 ease-out',
    'motion-reduce:transition-none motion-reduce:transform-none'
  ].join(' ')
})

const formTransitionLeaveActiveClass = computed(() => {
  return [
    'transition-[transform,opacity] duration-200 ease-in',
    'motion-reduce:transition-none motion-reduce:transform-none'
  ].join(' ')
})

const formTransitionEnterFromClass = computed(() => {
  return tabTransitionDirection.value === 'forward'
    ? 'translate-x-3 opacity-0'
    : '-translate-x-3 opacity-0'
})

const formTransitionLeaveToClass = computed(() => {
  return tabTransitionDirection.value === 'forward'
    ? '-translate-x-3 opacity-0'
    : 'translate-x-3 opacity-0'
})

const toastClass = computed(() => {
  if (toast.type === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (toast.type === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-rose-200 bg-rose-50 text-rose-700'
})

const defaultAccounts = isDevelopment
  ? {
      teacher: { username: 'teacher1', password: 'password123' },
      student: { username: 'student1', password: 'password123' },
      admin: { username: 'admin1', password: 'password123' }
    }
  : {}

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

const loginErrors = reactive({
  username: '',
  password: ''
})

const registerErrors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  usernum: '',
  classname: ''
})

const tabs = [
  { value: 'login', label: '登录' },
  { value: 'register', label: '注册' }
]

const roleOptions = [
  { value: 'teacher', label: '教师' },
  { value: 'student', label: '学生' },
  { value: 'admin', label: '管理员' }
]

const features = [
  {
    title: '学习画像',
    description: '多源学习证据建模',
    icon: 'user',
    borderClass: 'border-[rgba(24,217,255,0.82)]',
    style: { '--feature-color': '#18d9ff', '--feature-rgb': '24,217,255' }
  },
  {
    title: '智能批改',
    description: '代码错因诊断与反馈',
    icon: 'checked',
    borderClass: 'border-[rgba(77,140,255,0.82)]',
    style: { '--feature-color': '#4d8cff', '--feature-rgb': '77,140,255' }
  },
  {
    title: '个性化补弱',
    description: '薄弱点定位与练习推荐',
    icon: 'trend',
    borderClass: 'border-[rgba(47,230,184,0.82)]',
    style: { '--feature-color': '#2fe6b8', '--feature-rgb': '47,230,184' }
  }
]

const inputShellBaseClass = 'flex min-h-[49px] items-center gap-2 rounded-lg bg-white px-[18px] transition focus-within:ring-4 max-[720px]:min-h-[44px] max-[720px]:px-3'

function inputShellClass(errorMessage) {
  return [
    inputShellBaseClass,
    errorMessage
      ? 'shadow-[0_0_0_1px_#fb7185_inset] focus-within:ring-rose-100'
      : 'shadow-[0_0_0_1px_#dce4ee_inset] focus-within:shadow-[0_0_0_1px_#117eff_inset] focus-within:ring-[rgba(17,126,255,0.12)]'
  ]
}

function showToast(type, message) {
  toast.type = type
  toast.message = message
  toast.visible = true
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  toastTimer = setTimeout(() => {
    toast.visible = false
    toastTimer = null
  }, 2600)
}

function setActiveTab(tab) {
  if (activeTab.value === tab) return
  tabTransitionDirection.value = tab === 'register' ? 'forward' : 'backward'
  activeTab.value = tab
}

function clearLoginFieldError(field) {
  loginErrors[field] = ''
}

function clearRegisterFieldError(field) {
  registerErrors[field] = ''
}

function fillDefaultAccountForRole(role) {
  if (!isDevelopment) return
  const account = defaultAccounts[role]
  if (!account) return
  loginForm.username = account.username
  loginForm.password = account.password
  clearLoginFieldError('username')
  clearLoginFieldError('password')
}

function selectRole(role) {
  selectedRole.value = role
  fillDefaultAccountForRole(role)
}

function trimText(value) {
  return String(value ?? '').trim()
}

function buildRegisterPayload() {
  return {
    username: trimText(registerForm.username),
    password: registerForm.password,
    role: 'student',
    usernum: trimText(registerForm.usernum),
    classname: trimText(registerForm.classname)
  }
}

function validateLoginField(field) {
  if (field === 'username') {
    loginErrors.username = loginForm.username.trim() ? '' : '请输入用户名'
  }
  if (field === 'password') {
    if (!loginForm.password) {
      loginErrors.password = '请输入密码'
    } else if (loginForm.password.length < 6) {
      loginErrors.password = '密码长度不能少于 6 位'
    } else {
      loginErrors.password = ''
    }
  }
}

function validateLoginForm() {
  validateLoginField('username')
  validateLoginField('password')
  if (!agreementAccepted.value) {
    showToast('warning', '请先阅读并同意用户协议和隐私政策')
    return false
  }
  return !loginErrors.username && !loginErrors.password
}

function validateRegisterField(field) {
  if (field === 'username') {
    registerErrors.username = registerForm.username.trim() ? '' : '请输入用户名'
  }
  if (field === 'password') {
    if (!registerForm.password) {
      registerErrors.password = '请输入密码'
    } else if (registerForm.password.length < 6) {
      registerErrors.password = '密码长度不能少于 6 位'
    } else {
      registerErrors.password = ''
    }
    if (registerForm.confirmPassword) {
      validateRegisterField('confirmPassword')
    }
  }
  if (field === 'confirmPassword') {
    if (!registerForm.confirmPassword) {
      registerErrors.confirmPassword = '请再次输入密码'
    } else if (registerForm.confirmPassword !== registerForm.password) {
      registerErrors.confirmPassword = '两次输入的密码不一致'
    } else {
      registerErrors.confirmPassword = ''
    }
  }
  if (field === 'usernum') {
    registerErrors.usernum = registerForm.usernum.trim() ? '' : '请输入学号'
  }
  if (field === 'classname') {
    registerErrors.classname = registerForm.classname.trim() ? '' : '请输入班级'
  }
}

function validateRegisterForm() {
  validateRegisterField('username')
  validateRegisterField('password')
  validateRegisterField('confirmPassword')
  validateRegisterField('usernum')
  validateRegisterField('classname')
  return !registerErrors.username && !registerErrors.password && !registerErrors.confirmPassword && !registerErrors.usernum && !registerErrors.classname
}

async function handleLogin() {
  if (!validateLoginForm()) return
  loginForm.username = trimText(loginForm.username)
  loading.value = true
  try {
    const result = await userStore.login(loginForm.username, loginForm.password, selectedRole.value)
    if (!(result && result.success)) {
      showToast('error', getFriendlyResponseMessage(result, '用户名或密码不正确，请检查后重试'))
      return
    }

    const userInfo = result.user || result.userInfo
    const targetRole = userInfo?.role || selectedRole.value
    if (targetRole === 'teacher') {
      userStore.setSelectedClass(null)
    }

    showToast('success', '登录成功')
    if (targetRole === 'teacher') {
      await router.push('/teacher/select-class')
    } else if (targetRole === 'admin') {
      await router.push('/admin/dashboard')
    } else {
      await router.push('/student/dashboard')
    }
  } catch (error) {
    showToast('error', getFriendlyErrorMessage(error, '登录失败，请稍后重试'))
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (!validateRegisterForm()) return
  const payload = buildRegisterPayload()
  loading.value = true
  try {
    const result = await api.register(payload)
    if (!(result && result.success)) {
      showToast('error', getFriendlyResponseMessage(result, '注册失败，请检查填写内容后重试'))
      return
    }

    showToast('success', '注册成功，请登录')
    setActiveTab('login')
    selectedRole.value = 'student'
    loginForm.username = payload.username
    loginForm.password = ''
    registerForm.username = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.usernum = ''
    registerForm.classname = ''
    Object.keys(registerErrors).forEach((key) => {
      registerErrors[key] = ''
    })
  } catch (error) {
    showToast('error', getFriendlyErrorMessage(error, '注册失败，请稍后重试'))
  } finally {
    loading.value = false
  }
}

const TextField = defineComponent({
  props: {
    id: { type: String, required: true },
    modelValue: { type: String, required: true },
    label: { type: String, required: true },
    placeholder: { type: String, default: '' },
    autocomplete: { type: String, default: undefined },
    inputmode: { type: String, default: undefined },
    error: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'input', 'blur'],
  setup(props, { emit, slots }) {
    return () =>
      h('div', [
        h('label', { class: 'mb-2.5 block text-[17px] font-[650] leading-[1.2] tracking-normal text-[#17233a] max-[720px]:mb-2 max-[720px]:text-[15px]', for: props.id }, props.label),
        h('div', { class: inputShellClass(props.error) }, [
          slots.default
            ? h('span', { class: 'grid h-5 w-5 shrink-0 place-items-center text-[#8a97aa]', 'aria-hidden': 'true' }, slots.default())
            : null,
          h('input', {
            id: props.id,
            value: props.modelValue,
            class: 'h-full min-h-[49px] flex-1 bg-transparent text-[17px] text-[#17233a] outline-none placeholder:text-[#9aa7b8] max-[720px]:min-h-[44px] max-[720px]:text-[16px]',
            type: 'text',
            autocomplete: props.autocomplete,
            inputmode: props.inputmode,
            placeholder: props.placeholder,
            onInput: (event) => {
              emit('update:modelValue', event.target.value)
              emit('input', event)
            },
            onBlur: (event) => emit('blur', event)
          })
        ]),
        props.error ? h('p', { class: 'mt-1.5 text-[12px] text-rose-500' }, props.error) : null
      ])
  }
})

const PasswordField = defineComponent({
  props: {
    id: { type: String, required: true },
    modelValue: { type: String, required: true },
    label: { type: String, required: true },
    placeholder: { type: String, default: '' },
    autocomplete: { type: String, default: undefined },
    visible: { type: Boolean, default: false },
    error: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'input', 'blur', 'toggleVisible'],
  setup(props, { emit }) {
    return () =>
      h('div', [
        h('label', { class: 'mb-2.5 block text-[17px] font-[650] leading-[1.2] tracking-normal text-[#17233a] max-[720px]:mb-2 max-[720px]:text-[15px]', for: props.id }, props.label),
        h('div', { class: inputShellClass(props.error) }, [
          h('span', { class: 'grid h-5 w-5 shrink-0 place-items-center text-[#8a97aa]', 'aria-hidden': 'true' }, [h(LockIcon)]),
          h('input', {
            id: props.id,
            value: props.modelValue,
            class: 'h-full min-h-[49px] flex-1 bg-transparent text-[17px] text-[#17233a] outline-none placeholder:text-[#9aa7b8] max-[720px]:min-h-[44px] max-[720px]:text-[16px]',
            type: props.visible ? 'text' : 'password',
            autocomplete: props.autocomplete,
            placeholder: props.placeholder,
            onInput: (event) => {
              emit('update:modelValue', event.target.value)
              emit('input', event)
            },
            onBlur: (event) => emit('blur', event)
          }),
          h(
            'button',
            {
              type: 'button',
              class: 'grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#8a97aa] transition hover:bg-slate-100 hover:text-[#344154] max-[720px]:h-7 max-[720px]:w-7',
              'aria-label': props.visible ? '隐藏密码' : '显示密码',
              onClick: () => emit('toggleVisible')
            },
            [props.visible ? h(EyeOffIcon) : h(EyeIcon)]
          )
        ]),
        props.error ? h('p', { class: 'mt-1.5 text-[12px] text-rose-500' }, props.error) : null
      ])
  }
})

const UserIcon = createIcon('UserIcon', [
  ['path', { d: 'M20 21a8 8 0 0 0-16 0' }],
  ['circle', { cx: '12', cy: '7', r: '4' }]
])

const LockIcon = createIcon('LockIcon', [
  ['rect', { x: '4', y: '10', width: '16', height: '10', rx: '2' }],
  ['path', { d: 'M8 10V7a4 4 0 0 1 8 0v3' }]
])

const EyeIcon = createIcon('EyeIcon', [
  ['path', { d: 'M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z' }],
  ['circle', { cx: '12', cy: '12', r: '3' }]
])

const EyeOffIcon = createIcon('EyeOffIcon', [
  ['path', { d: 'm3 3 18 18' }],
  ['path', { d: 'M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.82' }],
  ['path', { d: 'M9.88 5.08A10.74 10.74 0 0 1 12 5c6 0 9.5 7 9.5 7a18.77 18.77 0 0 1-4.18 4.82' }],
  ['path', { d: 'M6.61 6.61C3.98 8.55 2.5 12 2.5 12s3.5 7 9.5 7c1.33 0 2.57-.24 3.72-.66' }]
])

function createIcon(name, children) {
  return defineComponent({
    name,
    setup() {
      return () =>
        h(
          'svg',
          {
            class: 'h-5 w-5',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '1.8',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'aria-hidden': 'true'
          },
          children.map(([tag, attrs]) => h(tag, attrs))
        )
    }
  })
}
</script>
