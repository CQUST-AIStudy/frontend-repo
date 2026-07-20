<template>
  <div class="app-layout app-layout--teacher flex h-screen h-dvh overflow-hidden bg-[var(--app-layout-main)]">
    <!-- Sidebar (Desktop) -->
    <UiAside
      v-if="!isMobile"
      class="app-layout-aside fixed inset-y-0 left-0 z-30 flex w-[var(--teacher-aside-width)] flex-col h-screen h-dvh overflow-hidden border-r border-[var(--app-border-soft)] bg-[var(--app-sidebar-bg)] backdrop-blur-[20px] backdrop-saturate-[180%] transition-[width] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
      :style="asideStyle"
    >
      <div class="flex items-center gap-3.5 h-[68px] px-[18px] border-b border-[var(--app-border-soft)] shrink-0">
        <img src="../../assets/logo.png" alt="Logo" class="w-[38px] h-[38px] rounded-[10px] border border-[var(--app-border-soft)] shadow-sm shrink-0" />
        <transition
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="!collapsed" class="flex flex-col gap-0.5 overflow-hidden">
            <span class="text-[11px] font-medium text-[var(--app-text-soft)] uppercase tracking-wide">教师工作台</span>
            <span class="text-base font-bold text-[var(--app-text)] tracking-normal whitespace-nowrap">智能教学平台</span>
          </div>
        </transition>
      </div>

      <nav class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-3">
        <div class="space-y-0.5" :class="{ 'items-center': collapsed }">
          <!-- Menu items rendered via menuItems data -->
          <template v-for="item in visibleMenuItems" :key="item.path || item.group">
            <!-- Single item -->
            <router-link v-if="!item.children" :to="item.path" class="nav-item group flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[13px] font-normal text-[var(--app-text-secondary)] transition-all duration-150 cursor-pointer" :class="{ 'bg-[var(--app-primary-soft)] !text-[var(--app-primary)] !font-semibold': activeMenu === item.path, 'hover:bg-[var(--app-primary-tint-8)] hover:text-[var(--app-text)]': activeMenu !== item.path }">
              <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </router-link>

            <!-- Group with children -->
            <div v-else>
              <UiButton
                class="nav-item group relative"
                :class="getGroupButtonClass(item)"
                :aria-expanded="openGroups[item.group]"
                @click="toggleGroup(item.group)"
              >
                <span class="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-transparent transition-colors duration-150" :class="{ '!bg-[var(--app-primary)]': isGroupActive(item) }"></span>
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border-soft)] bg-[var(--app-glass)] text-[var(--app-text-secondary)] transition-colors duration-150 group-hover:border-[var(--app-border-soft)] group-hover:text-[var(--app-text)]" :class="{ '!border-[var(--app-primary)]/20 !bg-[var(--app-primary)]/10 !text-[var(--app-primary)]': isGroupActive(item) || openGroups[item.group] }">
                  <component :is="item.icon" class="w-[17px] h-[17px]" />
                </span>
                <span v-if="!collapsed" class="truncate flex-1 text-left">{{ item.label }}</span>
                <span v-if="!collapsed" class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--app-primary-tint-8)] text-[var(--app-text-soft)] transition-colors duration-150 group-hover:bg-[var(--app-primary-tint-12)]" :class="{ '!bg-[var(--app-primary)]/10 !text-[var(--app-primary)]': openGroups[item.group] || isGroupActive(item) }">
                  <svg class="w-3 h-3 transition-transform duration-200" :class="{ 'rotate-90': openGroups[item.group] }" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
              </UiButton>
              <transition
                enter-active-class="max-h-[300px] overflow-hidden transition-all duration-200 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-[300px] opacity-100"
                leave-active-class="max-h-[300px] overflow-hidden transition-all duration-150 ease-in"
                leave-from-class="max-h-[300px] opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-if="openGroups[item.group] && !collapsed" class="relative mt-1 ml-[20px] pl-3 py-0.5 space-y-0.5 overflow-hidden before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-[var(--app-border-soft)]">
                  <template v-for="child in item.children" :key="child.path">
                    <router-link v-if="!child.permission || hasPermission(child.permission)" :to="child.path" class="group/child relative flex items-center h-[30px] px-2.5 rounded-md text-[12px] text-[var(--app-text-secondary)] transition-all duration-150 cursor-pointer" :class="{ 'bg-[var(--app-primary-tint-8)] !text-[var(--app-primary)] !font-semibold': isChildActive(child.path), 'hover:bg-[var(--app-primary-tint-8)] hover:text-[var(--app-text)]': !isChildActive(child.path) }">
                      <span class="absolute left-[-15px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-[var(--app-border-soft)] bg-[var(--app-surface-muted)] transition-colors" :class="{ '!border-[var(--app-primary)] !bg-[var(--app-primary)]': isChildActive(child.path), 'group-hover/child:border-[var(--app-text-soft)]': !isChildActive(child.path) }"></span>
                      <span class="truncate">{{ child.label }}</span>
                    </router-link>
                  </template>
                </div>
              </transition>
            </div>
          </template>

          <div class="h-px bg-[var(--app-border-soft)] mx-3 my-2.5"></div>

          <router-link to="/teacher/profile" class="nav-item group flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[13px] font-normal text-[var(--app-text-secondary)] transition-all duration-150 cursor-pointer" :class="{ 'bg-[var(--app-primary-soft)] !text-[var(--app-primary)] !font-semibold': activeMenu === '/teacher/profile', 'hover:bg-[var(--app-primary-tint-8)] hover:text-[var(--app-text)]': activeMenu !== '/teacher/profile' }">
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
        <UiAside v-if="mobileMenuVisible" class="app-layout-aside fixed inset-y-0 left-0 z-50 w-[300px] flex flex-col bg-[var(--app-sidebar-bg)] backdrop-blur-[24px] shadow-2xl">
          <div class="flex items-center gap-3.5 h-[68px] px-[18px] border-b border-[var(--app-border-soft)] shrink-0">
            <img src="../../assets/logo.png" alt="Logo" class="w-[38px] h-[38px] rounded-[10px] border border-[var(--app-border-soft)] shadow-sm" />
            <div class="flex flex-col gap-0.5">
              <span class="text-[11px] font-medium text-[var(--app-text-soft)] uppercase tracking-wide">教师工作台</span>
              <span class="text-base font-bold text-[var(--app-text)] tracking-normal">智能教学平台</span>
            </div>
          </div>
          <nav class="flex-1 overflow-y-auto px-2 py-3">
            <div class="space-y-0.5">
              <template v-for="item in visibleMenuItems" :key="item.path || item.group">
                <router-link v-if="!item.children" :to="item.path" class="flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[13px] text-[var(--app-text-secondary)] transition-all duration-150" :class="{ 'bg-[var(--app-primary-soft)] !text-[var(--app-primary)] !font-semibold': activeMenu === item.path, 'hover:bg-[var(--app-primary-tint-8)]': activeMenu !== item.path }" @click="closeMobileMenu">
                  <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
                  <span>{{ item.label }}</span>
                </router-link>
                <div v-else>
                  <UiButton
                    class="group relative"
                    :class="getGroupButtonClass(item)"
                    :aria-expanded="openGroups[item.group]"
                    @click="toggleGroup(item.group)"
                  >
                    <span class="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-transparent transition-colors duration-150" :class="{ '!bg-[var(--app-primary)]': isGroupActive(item) }"></span>
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border-soft)] bg-[var(--app-glass)] text-[var(--app-text-secondary)] transition-colors duration-150 group-hover:border-[var(--app-border-soft)] group-hover:text-[var(--app-text)]" :class="{ '!border-[var(--app-primary)]/20 !bg-[var(--app-primary)]/10 !text-[var(--app-primary)]': isGroupActive(item) || openGroups[item.group] }">
                      <component :is="item.icon" class="w-[17px] h-[17px]" />
                    </span>
                    <span class="flex-1 text-left">{{ item.label }}</span>
                    <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--app-primary-tint-8)] text-[var(--app-text-soft)] transition-colors duration-150 group-hover:bg-[var(--app-primary-tint-12)]" :class="{ '!bg-[var(--app-primary)]/10 !text-[var(--app-primary)]': openGroups[item.group] || isGroupActive(item) }">
                      <svg class="w-3 h-3 transition-transform duration-200" :class="{ 'rotate-90': openGroups[item.group] }" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                  </UiButton>
                  <div v-if="openGroups[item.group]" class="relative ml-[20px] mt-1 pl-3 py-0.5 space-y-0.5 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-[var(--app-border-soft)]">
                    <template v-for="child in item.children" :key="child.path">
                      <router-link v-if="!child.permission || hasPermission(child.permission)" :to="child.path" class="group/child relative flex items-center h-[30px] px-2.5 rounded-md text-[12px] text-[var(--app-text-secondary)] transition-all duration-150" :class="{ 'bg-[var(--app-primary-tint-8)] !text-[var(--app-primary)] !font-semibold': isChildActive(child.path), 'hover:bg-[var(--app-primary-tint-8)] hover:text-[var(--app-text)]': !isChildActive(child.path) }" @click="closeMobileMenu">
                        <span class="absolute left-[-15px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-[var(--app-border-soft)] bg-[var(--app-surface-muted)] transition-colors" :class="{ '!border-[var(--app-primary)] !bg-[var(--app-primary)]': isChildActive(child.path), 'group-hover/child:border-[var(--app-text-soft)]': !isChildActive(child.path) }"></span>
                        <span class="truncate">{{ child.label }}</span>
                      </router-link>
                    </template>
                  </div>
                </div>
              </template>
              <div class="h-px bg-[var(--app-border-soft)] mx-3 my-2.5"></div>
              <router-link to="/teacher/profile" class="flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[13px] text-[var(--app-text-secondary)]" :class="{ 'bg-[var(--app-primary-soft)] !text-[var(--app-primary)] !font-semibold': activeMenu === '/teacher/profile' }" @click="closeMobileMenu">
                <Setting class="w-[18px] h-[18px] shrink-0" />
                <span>个人设置</span>
              </router-link>
            </div>
          </nav>
        </UiAside>
      </transition>
    </Teleport>

    <!-- Main Area -->
    <div class="app-layout-main ml-[var(--teacher-main-margin)] flex h-screen h-dvh flex-col flex-1 min-w-0 overflow-hidden transition-[margin-left] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" :style="mainStyle">
      <!-- Header -->
      <UiHeader class="app-layout-header sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 min-h-[64px] px-6 border-b border-[var(--app-border-soft)] bg-[var(--app-glass-header)] backdrop-blur-[20px] backdrop-saturate-[180%]">
        <div class="flex items-center gap-3.5 min-w-0">
          <UiButton @click="toggleNavigation" class="inline-flex items-center justify-center w-10 h-10 rounded-[10px] text-[var(--app-text-secondary)] text-xl cursor-pointer transition-all duration-200 hover:bg-[var(--app-primary-tint-8)] hover:text-[var(--app-primary)] shrink-0" title="切换导航">
            <MenuIcon v-if="isMobile" />
            <Fold v-else />
          </UiButton>

          <div class="min-w-0 px-3.5 py-2.5 rounded-xl bg-[var(--app-glass)] border border-[var(--app-border-soft)] max-[768px]:hidden">
            <nav class="flex items-center gap-1.5 text-[13px] text-[var(--app-text-secondary)] whitespace-nowrap overflow-hidden">
              <router-link to="/teacher/dashboard" class="hover:text-[var(--app-primary)] transition-colors">首页</router-link>
              <template v-for="(item, index) in breadcrumbs" :key="index">
                <span class="text-[var(--app-text-soft)]">/</span>
                <span class="text-[var(--app-text)] font-medium truncate">{{ item }}</span>
              </template>
            </nav>
          </div>
        </div>

        <div class="flex items-center gap-3 min-w-0 shrink-0">
          <UiButton v-if="selectedClassName" @click="switchClass" class="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-[var(--app-primary-tint-8)] text-[var(--app-primary)] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[var(--app-primary-tint-15)] max-w-[min(280px,32vw)] max-[768px]:max-w-[40vw]">
            <School class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ selectedClassName }}</span>
            <ArrowDown class="w-3 h-3 shrink-0" />
          </UiButton>

          <span class="inline-flex items-center h-[30px] px-3 rounded-full text-[12px] font-bold max-[768px]:hidden" :class="teacherLevelClass">{{ teacherLevelText }}</span>

          <!-- User Dropdown -->
          <div class="relative" ref="dropdownRef">
            <UiButton @click="dropdownOpen = !dropdownOpen" class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--app-glass)] border border-[var(--app-border-soft)] cursor-pointer transition-all duration-200 hover:bg-[var(--app-primary-tint-8)]">
              <div class="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-primary-strong)] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {{ (userInfo.name || '教').slice(0, 1) }}
              </div>
              <div v-if="!isMobile" class="flex flex-col gap-0.5">
                <span class="text-[13px] font-semibold text-[var(--app-text)]">{{ userInfo.name || '教师用户' }}</span>
                <span class="text-[11px] text-[var(--app-text-secondary)]">课程教学工作台</span>
              </div>
              <ArrowDown class="w-3 h-3 text-[var(--app-text-soft)]" />
            </UiButton>

            <transition
              enter-active-class="transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
              enter-from-class="-translate-y-1 scale-[0.96] opacity-0"
              enter-to-class="translate-y-0 scale-100 opacity-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="translate-y-0 scale-100 opacity-100"
              leave-to-class="-translate-y-1 scale-[0.96] opacity-0"
            >
              <div v-if="dropdownOpen" class="absolute right-0 top-full mt-2 w-[188px] p-1.5 rounded-[14px] bg-[var(--app-surface)] backdrop-blur-[20px] border border-[var(--app-border-soft)] shadow-[var(--app-shadow)] z-50">
                <UiButton @click="handleCommand('switchClass')" class="flex !justify-start items-center gap-2.5 w-full !min-h-0 !px-3 !py-2.5 rounded-[10px] !border-transparent !bg-transparent !shadow-none text-[13px] font-medium text-[var(--app-text)] hover:!bg-[var(--app-primary-tint-8)] transition-colors text-left">
                  <School class="w-4 h-4 shrink-0 text-[var(--app-text-secondary)]" />切换教学班
                </UiButton>
                <UiButton @click="handleCommand('profile')" class="flex !justify-start items-center gap-2.5 w-full !min-h-0 !px-3 !py-2.5 rounded-[10px] !border-transparent !bg-transparent !shadow-none text-[13px] font-medium text-[var(--app-text)] hover:!bg-[var(--app-primary-tint-8)] transition-colors text-left">
                  <Setting class="w-4 h-4 shrink-0 text-[var(--app-text-secondary)]" />个人信息
                </UiButton>
                <div class="h-px bg-[var(--app-border-soft)] mx-2 my-1"></div>
                <UiButton @click="handleCommand('logout')" class="flex !justify-start items-center gap-2.5 w-full !min-h-0 !px-3 !py-2.5 rounded-[10px] !border-transparent !bg-transparent !shadow-none text-[13px] font-medium text-[var(--app-danger)] hover:!bg-[var(--app-primary-tint-8)] transition-colors text-left">
                  <SwitchButton class="w-4 h-4 shrink-0" />退出登录
                </UiButton>
              </div>
            </transition>
          </div>
        </div>
      </UiHeader>

      <!-- Content -->
      <UiMain
        class="app-layout-content flex-1 min-w-0 min-h-0 p-6 overflow-y-auto overflow-x-hidden bg-[var(--app-layout-main)]"
        :class="{
          '!box-border !h-[calc(100vh-64px)] !h-[calc(100dvh-64px)] !min-h-0 !overflow-hidden !p-4': isAiChatPage
        }"
      >
        <router-view v-slot="{ Component, route: slotRoute }">
          <transition
            mode="out-in"
            enter-active-class="transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            enter-from-class="translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <component :is="Component" :key="slotRoute.fullPath + (userStore.selectedClass?.id || '')" />
          </transition>
        </router-view>
      </UiMain>

      <!-- Footer -->
      <UiFooter v-if="!isAiChatPage" class="app-layout-footer shrink-0 text-center text-[var(--app-text-soft)] text-[12px] py-3 px-4 border-t border-[var(--app-border-soft)]">
        智能个性画像与个性化实验能力提升平台 · 教师工作空间
      </UiFooter>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { messageBox } from '@/services/feedback'
import {
  ArrowDown,
  Briefcase,
  ChatDotRound,
  Collection,
  DataAnalysis,
  DocumentChecked,
  Fold,
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
  'bg-[var(--app-surface-muted)] text-[var(--app-text-secondary)]': teacherLevel.value === 'normal',
  'bg-[var(--app-primary-tint-12)] text-[var(--app-primary)]': teacherLevel.value === 'course_leader',
  'bg-[var(--app-primary-tint-8)] text-[var(--app-success)]': teacherLevel.value === 'department_head'
}))
const asideStyle = computed(() => ({ '--teacher-aside-width': asideWidth.value }))
const mainStyle = computed(() => ({ '--teacher-main-margin': isMobile.value ? '0px' : asideWidth.value }))

const activeMenu = computed(() => route.path)
const isAiChatPage = computed(() => route.path === '/teacher/ai-chat')

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

const openGroups = reactive(
  menuItems
    .filter((item) => item.children)
    .reduce((groups, item) => ({ ...groups, [item.group]: false }), {})
)

function hasPermission(permissions) {
  const userPermissions = userInfo.value?.permissions || []
  return permissions.every((p) => userPermissions.includes(p))
}

function canShowItem(item) {
  return !item.permission || hasPermission(item.permission)
}

const visibleMenuItems = computed(() =>
  menuItems.filter(canShowItem)
)

function visibleChildren(item) {
  return (item.children || []).filter(canShowItem)
}

const activeMenuPath = computed(() => {
  const menuPaths = visibleMenuItems.value.flatMap((item) => (
    item.children ? visibleChildren(item).map((child) => child.path) : [item.path]
  )).filter(Boolean)
  return menuPaths
    .filter((path) => activeMenu.value === path || activeMenu.value.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0] || activeMenu.value
})

function isChildActive(path) {
  return activeMenuPath.value === path
}

function isGroupActive(item) {
  return visibleChildren(item).some((child) => isChildActive(child.path))
}

function getGroupButtonClass(item) {
  const active = isGroupActive(item)
  const open = openGroups[item.group]
  return [
    'flex items-center overflow-hidden text-[13px] font-medium transition-all duration-150 cursor-pointer',
    '!min-h-0 !h-[40px] !w-full !justify-start !gap-2.5 !px-2.5 !py-0 !rounded-[11px] !shadow-none',
    active
      ? '!border-[var(--app-primary)]/25 !bg-[var(--app-primary-tint-12)] !text-[var(--app-primary)]'
      : open
        ? '!border-[var(--app-border-soft)] !bg-[var(--app-glass)] !text-[var(--app-text)]'
        : '!border-[var(--app-border-soft)] !bg-[var(--app-glass-strong)] !text-[var(--app-text-secondary)] hover:!border-[var(--app-border)] hover:!bg-[var(--app-glass)] hover:!text-[var(--app-text)]'
  ]
}

const activeGroupKey = computed(() =>
  visibleMenuItems.value.find((item) => item.children && isGroupActive(item))?.group || ''
)

function syncActiveGroup() {
  if (activeGroupKey.value) {
    openGroups[activeGroupKey.value] = true
  }
}

function toggleGroup(group) {
  openGroups[group] = !openGroups[group]
}

watch(activeGroupKey, syncActiveGroup, { immediate: true })

const breadcrumbs = computed(() => {
  const pathMap = {
    dashboard: '首页总览', experiments: '实验列表', 'experiment-detail': '实验详情',
    'experiment-create': '创建实验', submissions: '学生提交', 'submission-detail': '提交详情',
    'class-list': '教学班列表', 'class-analysis': '教学班分析', 'class-profile': '能力画像',
    profile: '个人设置', 'document-center': '文档中心', 'bilingual-read': '双语阅读',
    'summary-card': 'AI 精读', 'ai-chat': 'AI 对话', 'ai-organize': '智能整理',
    'knowledge-graph': '知识图谱',
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

  const canOpenWithoutClass = ['/teacher/class-list', '/teacher/profile', '/teacher/leetcode-bank'].includes(route.path)
  if (!userStore.selectedClass && !canOpenWithoutClass) {
    router.replace('/teacher/select-class')
    return
  }
  if (userInfo.value.role && userInfo.value.role !== 'teacher') {
    messageBox.alert('当前账号没有教师权限，请重新登录。', '权限错误', {
      confirmButtonText: '确定',
      callback: () => { userStore.logout(); sessionStorage.clear(); router.push('/login') }
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

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
    userStore.logout(); sessionStorage.clear(); router.push('/login')
  }).catch(() => {})
}
</script>
