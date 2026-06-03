import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import './assets/styles/tailwind.css'
import './utils'
import { installUiComponents } from './components/ui'
import { installUiIcons } from './components/ui/icons'
import { installFeedback } from './services/feedback'

if (process.env.NODE_ENV === 'development') {
  import('./mock')
}

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
app.use(router)
app.mount('#app')
