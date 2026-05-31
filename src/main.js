import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {
  ElAlert,
  ElAside,
  ElAvatar,
  ElBadge,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElCalendar,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElContainer,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElDivider,
  ElDrawer,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElEmpty,
  ElFooter,
  ElForm,
  ElFormItem,
  ElHeader,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElLink,
  ElLoading,
  ElLoadingDirective,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPageHeader,
  ElPagination,
  ElPopconfirm,
  ElProgress,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRate,
  ElRow,
  ElScrollbar,
  ElSelect,
  ElSkeleton,
  ElSlider,
  ElSpace,
  ElStep,
  ElSteps,
  ElSubMenu,
  ElSwitch,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElTimeline,
  ElTimelineItem,
  ElTooltip,
  ElUpload
} from 'element-plus'
import {
  ArrowDown,
  Back,
  Calendar,
  ChatLineRound,
  Check,
  CircleCheck,
  CircleCheckFilled,
  CircleClose,
  Clock,
  Close,
  Collection,
  CopyDocument,
  DataLine,
  Delete,
  Document,
  DocumentChecked,
  Download,
  Edit,
  HomeFilled,
  Loading,
  MagicStick,
  Notebook,
  Plus,
  Reading,
  Refresh,
  School,
  Search,
  Select,
  Setting,
  Stopwatch,
  Timer,
  TrendCharts,
  UploadFilled,
  User,
  UserFilled,
  View,
  Warning,
  WarningFilled
} from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/index.css'

import App from './App.vue'
import router from './router'
import './assets/styles/tailwind.css'
import { normalizeMessageOptions } from './utils/errorMessage'
import './utils'

if (process.env.NODE_ENV === 'development') {
  import('./mock')
}

const browserConsole = window['console']
const originalError = browserConsole?.error?.bind(browserConsole)
browserConsole.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop')) {
    return
  }
  originalError?.(...args)
}

const app = createApp(App)

const elementPlusComponents = [
  ElAlert,
  ElAside,
  ElAvatar,
  ElBadge,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElCalendar,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElContainer,
  ElDatePicker,
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElDivider,
  ElDrawer,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElEmpty,
  ElFooter,
  ElForm,
  ElFormItem,
  ElHeader,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElLink,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElOption,
  ElPageHeader,
  ElPagination,
  ElPopconfirm,
  ElProgress,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRate,
  ElRow,
  ElScrollbar,
  ElSelect,
  ElSkeleton,
  ElSlider,
  ElSpace,
  ElStep,
  ElSteps,
  ElSubMenu,
  ElSwitch,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElTimeline,
  ElTimelineItem,
  ElTooltip,
  ElUpload
]

const elementPlusIcons = [
  ArrowDown,
  Back,
  Calendar,
  ChatLineRound,
  Check,
  CircleCheck,
  CircleCheckFilled,
  CircleClose,
  Clock,
  Close,
  Collection,
  CopyDocument,
  DataLine,
  Delete,
  Document,
  DocumentChecked,
  Download,
  Edit,
  HomeFilled,
  Loading,
  MagicStick,
  Notebook,
  Plus,
  Reading,
  Refresh,
  School,
  Search,
  Select,
  Setting,
  Stopwatch,
  Timer,
  TrendCharts,
  UploadFilled,
  User,
  UserFilled,
  View,
  Warning,
  WarningFilled
]

elementPlusComponents.forEach((component) => {
  app.component(component.name, component)
})

elementPlusIcons.forEach((component) => {
  app.component(component.name, component)
})
if (!ElMessage.__friendlyErrorPatched) {
  const wrapMessageMethod = (methodName, fallbackMessage) => {
    const originalMethod = ElMessage[methodName]
    ElMessage[methodName] = (options = {}) => {
      return originalMethod.call(ElMessage, normalizeMessageOptions(options, fallbackMessage))
    }
  }

  wrapMessageMethod('error', '操作失败，请稍后重试')
  wrapMessageMethod('warning', '操作提醒，请稍后重试')
  Object.defineProperty(ElMessage, '__friendlyErrorPatched', { value: true })
}
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$msgbox = ElMessageBox
app.config.globalProperties.$loading = ElLoading.service
app.directive('loading', ElLoadingDirective)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.mount('#app')
