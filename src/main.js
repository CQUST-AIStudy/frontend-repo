import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import 'highlight.js/styles/github.css'
import './assets/styles/tailwind.css'
import './assets/styles/highlight.css'
import './utils'
import { installUiComponents } from './components/ui'
import { installUiIcons } from './components/ui/icons'
import { installFeedback } from './services/feedback'
import { AUTH_STORAGE_CLEARED_EVENT, AUTH_STORAGE_KEYS } from './constants/auth'
import { useUserStore } from './store'

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

app.use(router)
app.mount('#app')
