import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'
import './assets/styles/tailwind.css'
import './assets/styles/highlight.css'
import './utils'
import { installUiComponents } from './components/ui'
import { installUiIcons } from './components/ui/icons'
import { installFeedback } from './services/feedback'
import {
  AUTH_STORAGE_CLEARED_EVENT,
  AUTH_STORAGE_KEYS,
  USER_SCOPED_STORAGE_CLEARED_EVENT
} from './constants/auth'
import { useUserStore } from './store'
import { useStudentAiChatStore } from './store/studentAiChat'
import { useTeacherAiChatStore } from './store/teacherAiChat'
import { useThemeStore } from './store/theme'

const browserConsole = window.console
const originalError = browserConsole?.error?.bind(browserConsole)
browserConsole.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop')) {
    return
  }
  originalError?.(...args)
}

const app = createApp(App)

installUiComponents(app)
installUiIcons(app)
installFeedback(app)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

const userStore = useUserStore()
window.addEventListener(AUTH_STORAGE_CLEARED_EVENT, () => {
  userStore.resetAuthState()
  localStorage.removeItem(AUTH_STORAGE_KEYS.PINIA_USER)
})
window.addEventListener(USER_SCOPED_STORAGE_CLEARED_EVENT, () => {
  const studentChatStore = useStudentAiChatStore()
  const teacherChatStore = useTeacherAiChatStore()
  Object.keys(studentChatStore.abortControllers || {}).forEach(id => studentChatStore.stopGeneration(id))
  Object.keys(teacherChatStore.abortControllers || {}).forEach(id => teacherChatStore.stopGeneration(id))
  studentChatStore.$reset()
  teacherChatStore.$reset()
})

// 应用启动前先从 localStorage 恢复并应用外观主题，避免首屏闪烁
useThemeStore().applyTheme()

app.use(router)
app.mount('#app')
