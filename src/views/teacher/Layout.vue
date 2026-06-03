<template>
  <div class="flex min-h-screen min-h-dvh overflow-x-hidden bg-[#f5f5f7]">
    <!-- Sidebar (Desktop) -->
    <UiAside
      v-if="!isMobile"
      class="fixed inset-y-0 left-0 z-30 flex w-[var(--teacher-aside-width)] flex-col h-screen h-dvh overflow-hidden border-r border-black/[0.06] bg-[rgba(246,246,248,0.82)] backdrop-blur-[20px] backdrop-saturate-[180%] transition-[width] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
      :style="asideStyle"
    >
      <div class="flex items-center gap-3.5 h-[68px] px-[18px] border-b border-black/[0.06] shrink-0">
        <img src="../../assets/logo.png" alt="Logo" class="w-[38px] h-[38px] rounded-[10px] border border-black/8 shadow-sm shrink-0" />
        <transition
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="!collapsed" class="flex flex-col gap-0.5 overflow-hidden">
            <span class="text-[11px] font-medium text-[#8e8e93] uppercase tracking-wide">教师工作台</span>
            <span class="text-base font-bold text-[#1d1d1f] tracking-tight whitespace-nowrap">智能教学平台</span>
          </div>
        </transition>
      </div>

      <nav class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-3">
        <div class="space-y-0.5" :class="{ 'items-center': collapsed }">
          <!-- Menu items rendered via menuItems data -->
          <template v-for="item in visibleMenuItems" :key="item.path || item.group">
            <!-- Single item -->
            <router-link v-if="!item.children" :to="item.path" class="nav-item group flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[13px] font-normal text-[#6e6e73] transition-all duration-150 cursor-pointer" :class="{ 'bg-[rgba(0,122,255,0.12)] !text-[#007aff] !font-semibold': activeMenu === item.path, 'hover:bg-black/[0.04] hover:text-[#1d1d1f]': activeMenu !== item.path }">
              <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </router-link>

            <!-- Group with children -->
            <div v-else>
              <UiButton @click="toggleGroup(item.group)" class="nav-item group flex items-center gap-2.5 w-full h-[38px] px-3 rounded-[10px] text-[13px] font-normal text-[#6e6e73] transition-all duration-150 cursor-pointer hover:bg-black/[0.04] hover:text-[#1d1d1f]">
                <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
                <span v-if="!collapsed" class="truncate flex-1 text-left">{{ item.label }}</span>
                <svg v-if="!collapsed" class="w-3 h-3 shrink-0 text-[#aeaeb2] transition-transform duration-200" :class="{ 'rotate-90': openGroups[item.group] }" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </UiButton>
              <transition
                enter-active-class="max-h-[300px] overflow-hidden transition-all duration-200 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-[300px] opacity-100"
                leave-active-class="max-h-[300px] overflow-hidden transition-all duration-150 ease-in"
                leave-from-class="max-h-[300px] opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-if="openGroups[item.group] && !collapsed" class="mt-0.5 ml-[30px] space-y-0.5 overflow-hidden">
                  <template v-for="child in item.children" :key="child.path">
                    <router-link v-if="!child.permission || hasPermission(child.permission)" :to="child.path" class="flex items-center h-[34px] px-3 rounded-lg text-[12px] text-[#6e6e73] transition-all duration-150 cursor-pointer" :class="{ 'bg-[rgba(0,122,255,0.1)] !text-[#007aff] !font-medium': activeMenu === child.path, 'hover:bg-black/[0.04] hover:text-[#1d1d1f]': activeMenu !== child.path }">
                      {{ child.label }}
                    </router-link>
                  </template>
                </div>
              </transition>
            </div>
          </template>

          <div class="h-px bg-black/[0.06] mx-3 my-2.5"></div>

          <router-link to="/teacher/profile" class="nav-item group flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[13px] font-normal text-[#6e6e73] transition-all duration-150 cursor-pointer" :class="{ 'bg-[rgba(0,122,255,0.12)] !text-[#007aff] !font-semibold': activeMenu === '/teacher/profile', 'hover:bg-black/[0.04] hover:text-[#1d1d1f]': activeMenu !== '/teacher/profile' }">
            <Setting class="w-[18px] h-[18px] shrink-0" />
            <span v-if="!collapsed" class="truncate">个人设置</span>
          </router-link>
        </div>
      </nav>
    </UiAside>

    <!-- Mobile Drawer Overlay -->
    <Teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-[250ms]"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-[250ms]"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="mobileMenuVisible" class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" @click="closeMobileMenu"></div>
      </transition>
      <transition
        enter-active-class="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <UiAside v-if="mobileMenuVisible" class="fixed inset-y-0 left-0 z-50 w-[300px] flex flex-col bg-[rgba(246,246,248,0.98)] backdrop-blur-[24px] shadow-2xl">
          <div class="flex items-center gap-3.5 h-[68px] px-[18px] border-b border-black/[0.06] shrink-0">
            <img src="../../assets/logo.png" alt="Logo" class="w-[38px] h-[38px] rounded-[10px] border border-black/8 shadow-sm" />
            <div class="flex flex-col gap-0.5">
              <span class="text-[11px] font-medium text-[#8e8e93] uppercase tracking-wide">教师工作台</span>
              <span class="text-base font-bold text-[#1d1d1f] tracking-tight">智能教学平台</span>
            </div>
          </div>
          <nav class="flex-1 overflow-y-auto px-2 py-3">
            <div class="space-y-0.5">
              <template v-for="item in visibleMenuItems" :key="item.path || item.group">
                <router-link v-if="!item.children" :to="item.path" class="flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[13px] text-[#6e6e73] transition-all duration-150" :class="{ 'bg-[rgba(0,122,255,0.12)] !text-[#007aff] !font-semibold': activeMenu === item.path, 'hover:bg-black/[0.04]': activeMenu !== item.path }" @click="closeMobileMenu">
                  <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
                  <span>{{ item.label }}</span>
                </router-link>
                <div v-else>
                  <UiButton @click="toggleGroup(item.group)" class="flex items-center gap-2.5 w-full h-[38px] px-3 rounded-[10px] text-[13px] text-[#6e6e73] hover:bg-black/[0.04]">
                    <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
                    <span class="flex-1 text-left">{{ item.label }}</span>
                    <svg class="w-3 h-3 text-[#aeaeb2] transition-transform duration-200" :class="{ 'rotate-90': openGroups[item.group] }" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </UiButton>
                  <div v-if="openGroups[item.group]" class="ml-[30px] mt-0.5 space-y-0.5">
                    <template v-for="child in item.children" :key="child.path">
                      <router-link v-if="!child.permission || hasPermission(child.permission)" :to="child.path" class="flex items-center h-[34px] px-3 rounded-lg text-[12px] text-[#6e6e73]" :class="{ 'bg-[rgba(0,122,255,0.1)] !text-[#007aff] !font-medium': activeMenu === child.path, 'hover:bg-black/[0.04]': activeMenu !== child.path }" @click="closeMobileMenu">{{ child.label }}</router-link>
                    </template>
                  </div>
                </div>
              </template>
              <div class="h-px bg-black/[0.06] mx-3 my-2.5"></div>
              <router-link to="/teacher/profile" class="flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[13px] text-[#6e6e73]" :class="{ 'bg-[rgba(0,122,255,0.12)] !text-[#007aff] !font-semibold': activeMenu === '/teacher/profile' }" @click="closeMobileMenu">
                <Setting class="w-[18px] h-[18px] shrink-0" />
                <span>个人设置</span>
              </router-link>
            </div>
          </nav>
        </UiAside>
      </transition>
    </Teleport>

    <!-- Main Area -->
    <div class="ml-[var(--teacher-main-margin)] flex flex-col flex-1 min-w-0 transition-[margin-left] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" :style="mainStyle">
      <!-- Header -->
      <UiHeader class="sticky top-0 z-20 flex items-center justify-between gap-4 min-h-[64px] px-6 border-b border-black/[0.06] bg-white/72 backdrop-blur-[20px] backdrop-saturate-[180%]">
        <div class="flex items-center gap-3.5 min-w-0">
          <UiButton @click="toggleNavigation" class="inline-flex items-center justify-center w-10 h-10 rounded-[10px] text-[#6e6e73] text-xl cursor-pointer transition-all duration-200 hover:bg-[rgba(0,122,255,0.08)] hover:text-[#007aff] shrink-0" title="切换导航">
            <MenuIcon v-if="isMobile" />
            <Fold v-else-if="!collapsed" />
            <Expand v-else />
          </UiButton>

          <div class="min-w-0 px-3.5 py-2.5 rounded-xl bg-white/60 border border-black/[0.06]">
            <nav class="flex items-center gap-1.5 text-[13px] text-[#6e6e73] whitespace-nowrap overflow-hidden">
              <router-link to="/teacher/dashboard" class="hover:text-[#007aff] transition-colors">首页</router-link>
              <template v-for="(item, index) in breadcrumbs" :key="index">
                <span class="text-[#aeaeb2]">/</span>
                <span class="text-[#1d1d1f] font-medium truncate">{{ item }}</span>
              </template>
            </nav>
          </div>
        </div>

        <div class="flex items-center gap-3 min-w-0 shrink-0">
          <UiButton v-if="selectedClassName" @click="switchClass" class="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-[rgba(0,122,255,0.08)] text-[#007aff] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[rgba(0,122,255,0.14)] max-w-[min(280px,32vw)]">
            <School class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ selectedClassName }}</span>
            <ArrowDown class="w-3 h-3 shrink-0" />
          </UiButton>

          <span class="inline-flex items-center h-[30px] px-3 rounded-full text-[12px] font-bold" :class="teacherLevelClass">{{ teacherLevelText }}</span>

          <UiButton @click="toggleFullScreen" class="inline-flex items-center justify-center w-9 h-9 rounded-[10px] text-[#6e6e73] text-lg cursor-pointer transition-all duration-200 hover:bg-[rgba(0,122,255,0.08)] hover:text-[#007aff]" title="全屏">
            <FullScreen />
          </UiButton>

          <!-- User Dropdown -->
          <div class="relative" ref="dropdownRef">
            <UiButton @click="dropdownOpen = !dropdownOpen" class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/60 border border-black/[0.06] cursor-pointer transition-all duration-200 hover:bg-black/[0.03]">
              <div class="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#007aff] to-[#5856d6] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {{ (userInfo.name || '教').slice(0, 1) }}
              </div>
              <div v-if="!isMobile" class="flex flex-col gap-0.5">
                <span class="text-[13px] font-semibold text-[#1d1d1f]">{{ userInfo.name || '教师用户' }}</span>
                <span class="text-[11px] text-[#6e6e73]">课程教学工作台</span>
              </div>
              <ArrowDown class="w-3 h-3 text-[#aeaeb2]" />
            </UiButton>

            <transition
              enter-active-class="transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
              enter-from-class="-translate-y-1 scale-[0.96] opacity-0"
              enter-to-class="translate-y-0 scale-100 opacity-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="translate-y-0 scale-100 opacity-100"
              leave-to-class="-translate-y-1 scale-[0.96] opacity-0"
            >
              <div v-if="dropdownOpen" class="absolute right-0 top-full mt-2 w-[180px] py-1.5 rounded-xl bg-white/95 backdrop-blur-[20px] border border-black/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] z-50">
                <UiButton @click="handleCommand('switchClass')" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-[#1d1d1f] hover:bg-black/[0.04] transition-colors text-left">
                  <School class="w-4 h-4 text-[#6e6e73]" />切换教学班
                </UiButton>
                <UiButton @click="handleCommand('profile')" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-[#1d1d1f] hover:bg-black/[0.04] transition-colors text-left">
                  <Setting class="w-4 h-4 text-[#6e6e73]" />个人信息
                </UiButton>
                <div class="h-px bg-black/[0.06] mx-3 my-1"></div>
                <UiButton @click="handleCommand('logout')" class="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-[#ff3b30] hover:bg-[rgba(255,59,48,0.06)] transition-colors text-left">
                  <SwitchButton class="w-4 h-4" />退出登录
                </UiButton>
              </div>
            </transition>
          </div>
        </div>
      </UiHeader>

      <!-- Content -->
      <UiMain class="flex-1 min-w-0 min-h-[calc(100vh-120px)] min-h-[calc(100dvh-120px)] p-6 overflow-y-auto overflow-x-hidden bg-[#f5f5f7]">
        <router-view v-slot="{ Component }">
          <transition
            mode="out-in"
            enter-active-class="transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            enter-from-class="translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </UiMain>

      <!-- Footer -->
      <UiFooter class="text-center text-[#aeaeb2] text-[12px] py-3 px-4 border-t border-black/[0.06]">
        智能学情分析与个性化实验能力提升平台 · 教师工作空间
      </UiFooter>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { messageBox } from '@/services/feedback'
import {
  ArrowDown,
  Briefcase,
  ChatDotRound,
  Collection,
  DataAnalysis,
  DocumentChecked,
  Expand,
  Fold,
  FullScreen,
  HomeFilled,
  Menu as MenuIcon,
  Notebook,
  OfficeBuilding,
  School,
  Setting,
  SwitchButton,
  UserFilled
} from '@/components/ui/icons'
import { useUserStore } from '../../store'
import { clearAuthStorage } from '../../constants/auth'
import { useResponsiveLayout } from '../../composables/useResponsiveLayout'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const {
  isMobile,
  collapsed,
  mobileMenuVisible,
  asideWidth,
  toggleNavigation,
  closeMobileMenu
} = useResponsiveLayout({
  route,
  expandedWidth: '260px',
  collapsedWidth: '76px'
})

const userInfo = computed(() => userStore.userInfo || { name: '教师用户', avatar: '' })
const selectedClassName = computed(() => userStore.selectedClass?.name || '')

const teacherLevel = computed(() => userInfo.value?.level || 'normal')
const teacherLevelText = computed(() => {
  const map = { department_head: '系主任', course_leader: '课程负责人' }
  return map[teacherLevel.value] || '教师'
})
const teacherLevelClass = computed(() => ({
  'bg-black/5 text-[#6e6e73]': teacherLevel.value === 'normal',
  'bg-[rgba(0,122,255,0.1)] text-[#007aff]': teacherLevel.value === 'course_leader',
  'bg-[rgba(52,199,89,0.1)] text-[#34c759]': teacherLevel.value === 'department_head'
}))
const asideStyle = computed(() => ({ '--teacher-aside-width': asideWidth.value }))
const mainStyle = computed(() => ({ '--teacher-main-margin': isMobile.value ? '0px' : asideWidth.value }))

const activeMenu = computed(() => route.path)

const openGroups = reactive({
  class: false,
  teaching: false,
  grading: false,
  rag: false,
  ai: false,
  tools: false,
  dept: false
})

function toggleGroup(group) {
  openGroups[group] = !openGroups[group]
}

const menuItems = [
  { path: '/teacher/dashboard', icon: HomeFilled, label: '首页总览' },
  {
    group: 'class', icon: UserFilled, label: '教学班管理',
    children: [
      { path: '/teacher/class-list', label: '教学班列表' },
      { path: '/teacher/class-analysis', label: '教学班分析' },
      { path: '/teacher/class-profile', label: '能力画像' }
    ]
  },
  {
    group: 'teaching', icon: Notebook, label: '实验教学',
    children: [
      { path: '/teacher/experiments', label: '实验列表' },
      { path: '/teacher/experiment-create', label: '创建实验' },
      { path: '/teacher/submissions', label: '学生提交' },
      { path: '/teacher/experiment-analytics', label: '实验数据分析' },
      { path: '/teacher/data-sync', label: 'PTA 数据同步' }
    ]
  },
  {
    group: 'grading', icon: DocumentChecked, label: 'AI 批改',
    children: [
      { path: '/teacher/grading', label: '批改中心' },
      { path: '/teacher/grading/rubrics', label: '评分标准' }
    ]
  },
  {
    group: 'rag', icon: Collection, label: '课程知识库',
    children: [
      { path: '/teacher/knowledge-base', label: '空间与文档' },
      { path: '/teacher/rag-analytics', label: 'RAG 分析' }
    ]
  },
  {
    group: 'ai', icon: ChatDotRound, label: 'AI 助教',
    children: [
      { path: '/teacher/ai-chat', label: 'AI 对话' },
      { path: '/teacher/class-detailed-analysis', label: '教学建议' }
    ]
  },
  {
    group: 'tools', icon: Briefcase, label: '教辅工具',
    children: [
      { path: '/teacher/document-center', label: '文档中心' },
      { path: '/teacher/bilingual-read', label: '双语阅读' },
      { path: '/teacher/summary-card', label: 'AI 精读' },
      { path: '/teacher/ai-organize', label: '智能整理' }
    ]
  },
  { path: '/teacher/course-analysis', icon: DataAnalysis, label: '课程分析', permission: ['view_course_classes', 'analyze_course_classes'] },
  {
    group: 'dept', icon: OfficeBuilding, label: '院系管理', permission: ['view_all_teachers'],
    children: [
      { path: '/teacher/department-teachers', label: '教师管理' },
      { path: '/teacher/department-analytics', label: '院系统计', permission: ['analyze_all_classes'] },
      { path: '/teacher/teacher-ai-management', label: 'AI 管理', permission: ['manage_teacher_ai'] }
    ]
  }
]

function hasPermission(permissions) {
  const userPermissions = userInfo.value?.permissions || []
  return permissions.some((p) => userPermissions.includes(p))
}

const visibleMenuItems = computed(() =>
  menuItems.filter((item) => !item.permission || hasPermission(item.permission))
)

const breadcrumbs = computed(() => {
  const pathMap = {
    dashboard: '首页总览', experiments: '实验列表', 'experiment-detail': '实验详情',
    'experiment-create': '创建实验', submissions: '学生提交', 'submission-detail': '提交详情',
    'class-list': '教学班列表', 'class-analysis': '教学班分析', 'class-profile': '能力画像',
    profile: '个人设置', 'document-center': '文档中心', 'bilingual-read': '双语阅读',
    'summary-card': 'AI 精读', 'ai-chat': 'AI 对话', 'ai-organize': '智能整理',
    grading: 'AI 批改', 'knowledge-base': '课程知识库', 'rag-analytics': 'RAG 分析',
    'course-analysis': '课程分析', 'department-teachers': '教师管理',
    'department-analytics': '院系统计', 'teacher-ai-management': 'AI 管理',
    'ai-recommendation': '教学建议', 'experiment-analytics': '实验数据分析', 'data-sync': 'PTA 数据同步'
  }
  const paths = route.path.split('/').filter(Boolean)
  return paths[0] === 'teacher' ? paths.slice(1).map((part) => pathMap[part] || part) : []
})

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

function onClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)

  const canOpenWithoutClass = route.path === '/teacher/class-list' || route.path === '/teacher/profile'
  if (!userStore.selectedClass && !canOpenWithoutClass) {
    router.replace('/teacher/select-class')
    return
  }
  if (userInfo.value.role && userInfo.value.role !== 'teacher') {
    messageBox.alert('当前账号没有教师权限，请重新登录。', '权限错误', {
      confirmButtonText: '确定',
      callback: () => { clearAuthStorage(); router.push('/login') }
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

function toggleFullScreen() {
  if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); return }
  document.exitFullscreen?.()
}

function switchClass() {
  userStore.setSelectedClass(null)
  router.push('/teacher/select-class')
}

function handleCommand(command) {
  dropdownOpen.value = false
  if (command === 'profile') { router.push('/teacher/profile'); return }
  if (command === 'switchClass') { switchClass(); return }
  if (command !== 'logout') return
  messageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    userStore.logout(); sessionStorage.clear(); clearAuthStorage(); router.push('/login')
  }).catch(() => {})
}
</script>
