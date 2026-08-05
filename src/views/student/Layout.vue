<template>
  <div class="app-layout app-layout--student student-layout [width:100%] [height:100vh] [height:100dvh] [min-height:0] [overflow:hidden] max-[960px]:[min-height:100vh] max-[960px]:[min-height:100dvh] max-[960px]:[height:auto] max-[960px]:[overflow-x:hidden]">
    <ui-container class="app-layout-container layout-container [height:100vh] [height:100dvh] [min-height:0] max-[960px]:[min-height:100vh] max-[960px]:[min-height:100dvh] max-[960px]:[height:auto]">
      <ui-aside v-if="!isMobile" :width="asideWidth" class="app-layout-aside layout-aside [display:flex] [flex-direction:column] [height:100vh] [height:100dvh] [background:var(--app-sidebar-bg)] [transition:width_0.3s_cubic-bezier(0.25,_0.46,_0.45,_0.94)] [overflow:hidden] [border-right:1px_solid_var(--app-border-soft)] [backdrop-filter:blur(16px)_saturate(140%)]">
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
              <span class="text-[11px] font-medium text-[var(--app-text-soft)] uppercase tracking-wide">学生工作台</span>
              <span class="text-base font-bold text-[var(--app-text)] tracking-normal whitespace-nowrap">智能学习平台</span>
            </div>
          </transition>
        </div>

        <ui-scrollbar class="menu-scrollbar [flex:1] [min-height:0] [height:calc(100vh_-_64px)] [height:calc(100dvh_-_64px)] [&_.ui-scrollbar__bar.is-vertical]:[width:4px] [&_.ui-scrollbar__bar.is-vertical]:[right:2px] [&_.ui-scrollbar__thumb]:[background:var(--app-border-strong)] [&_.ui-scrollbar__thumb]:[border-radius:4px]">
          <nav class="px-2 py-3" :class="{ '[&>*]:[justify-content:center]': collapsed }">
            <div class="space-y-0.5" :class="{ 'items-center': collapsed }">
              <template v-for="item in menuItems" :key="item.path || item.group">
                <!-- Single item -->
                <router-link
                  v-if="!item.children"
                  :to="item.path"
                  class="nav-item group flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[15px] font-normal text-[var(--app-text-secondary)] transition-all duration-150 cursor-pointer"
                  :class="{
                    'bg-[var(--app-primary-soft)] !text-[var(--app-primary)] !font-semibold': isItemActive(item.path),
                    'hover:bg-[var(--app-primary-tint-8)] hover:text-[var(--app-text)]': !isItemActive(item.path)
                  }"
                >
                  <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
                  <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
                </router-link>

                <!-- Group with children -->
                <div v-else>
                  <UiButton
                    class="nav-item group relative flex items-center overflow-hidden text-[15px] font-medium transition-all duration-150 cursor-pointer !min-h-0 !h-[40px] !w-full !justify-start !gap-2.5 !px-2.5 !py-0 !rounded-[11px] !shadow-none"
                    :class="getGroupButtonClass(item)"
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
                      <router-link
                        v-for="child in item.children"
                        :key="child.path"
                        :to="child.path"
                        class="group/child relative flex items-center h-[30px] px-2.5 rounded-md text-[15px] text-[var(--app-text-secondary)] transition-all duration-150 cursor-pointer"
                        :class="{
                          'bg-[var(--app-primary-tint-8)] !text-[var(--app-primary)] !font-semibold': isChildActive(child.path),
                          'hover:bg-[var(--app-primary-tint-8)] hover:text-[var(--app-text)]': !isChildActive(child.path)
                        }"
                      >
                        <span class="absolute left-[-15px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-[var(--app-border-soft)] bg-[var(--app-surface-muted)] transition-colors" :class="{ '!border-[var(--app-primary)] !bg-[var(--app-primary)]': isChildActive(child.path), 'group-hover/child:border-[var(--app-text-soft)]': !isChildActive(child.path) }"></span>
                        <span class="truncate">{{ child.label }}</span>
                      </router-link>
                    </div>
                  </transition>
                </div>
              </template>

              <div class="h-px bg-[var(--app-border-soft)] mx-3 my-2.5"></div>

              <router-link
                to="/student/profile"
                class="nav-item group flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[15px] font-normal text-[var(--app-text-secondary)] transition-all duration-150 cursor-pointer"
                :class="{
                  'bg-[var(--app-primary-soft)] !text-[var(--app-primary)] !font-semibold': isItemActive('/student/profile'),
                  'hover:bg-[var(--app-primary-tint-8)] hover:text-[var(--app-text)]': !isItemActive('/student/profile')
                }"
              >
                <ui-icon class="w-[18px] h-[18px] shrink-0"><Setting /></ui-icon>
                <span v-if="!collapsed" class="truncate">个人设置</span>
              </router-link>
            </div>
          </nav>
        </ui-scrollbar>
      </ui-aside>

      <ui-drawer
        v-model="mobileMenuVisible"
        direction="ltr"
        size="280px"
        :with-header="false"
        class="layout-drawer"
      >
        <div class="app-layout-aside layout-aside mobile-aside [width:100%] [border-right:none] flex flex-col h-full bg-[var(--app-sidebar-bg)] backdrop-blur-[24px]">
          <div class="flex items-center gap-3.5 h-[68px] px-[18px] border-b border-[var(--app-border-soft)] shrink-0">
            <img src="../../assets/logo.png" alt="Logo" class="w-[38px] h-[38px] rounded-[10px] border border-[var(--app-border-soft)] shadow-sm shrink-0" />
            <div class="flex flex-col gap-0.5">
              <span class="text-[11px] font-medium text-[var(--app-text-soft)] uppercase tracking-wide">学生工作台</span>
              <span class="text-base font-bold text-[var(--app-text)] tracking-normal whitespace-nowrap">智能学习平台</span>
            </div>
          </div>

          <ui-scrollbar class="flex-1 min-h-0">
            <nav class="px-2 py-3">
              <div class="space-y-0.5">
                <template v-for="item in menuItems" :key="item.path || item.group">
                  <router-link
                    v-if="!item.children"
                    :to="item.path"
                    class="flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[15px] text-[var(--app-text-secondary)] transition-all duration-150"
                    :class="{ 'bg-[var(--app-primary-soft)] !text-[var(--app-primary)] !font-semibold': isItemActive(item.path), 'hover:bg-[var(--app-primary-tint-8)]': !isItemActive(item.path) }"
                    @click="closeMobileMenu"
                  >
                    <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
                    <span>{{ item.label }}</span>
                  </router-link>

                  <div v-else>
                    <UiButton
                      class="group relative flex items-center overflow-hidden text-[15px] font-medium transition-all duration-150 cursor-pointer !min-h-0 !h-[40px] !w-full !justify-start !gap-2.5 !px-2.5 !py-0 !rounded-[11px] !shadow-none"
                      :class="getGroupButtonClass(item)"
                      @click="toggleGroup(item.group)"
                    >
                      <span class="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-transparent transition-colors duration-150" :class="{ '!bg-[var(--app-primary)]': isGroupActive(item) }"></span>
                      <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border-soft)] bg-[var(--app-glass)] text-[var(--app-text-secondary)] transition-colors duration-150" :class="{ '!border-[var(--app-primary)]/20 !bg-[var(--app-primary)]/10 !text-[var(--app-primary)]': isGroupActive(item) || openGroups[item.group] }">
                        <component :is="item.icon" class="w-[17px] h-[17px]" />
                      </span>
                      <span class="flex-1 text-left">{{ item.label }}</span>
                      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--app-primary-tint-8)] text-[var(--app-text-soft)] transition-colors duration-150" :class="{ '!bg-[var(--app-primary)]/10 !text-[var(--app-primary)]': openGroups[item.group] || isGroupActive(item) }">
                        <svg class="w-3 h-3 transition-transform duration-200" :class="{ 'rotate-90': openGroups[item.group] }" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </span>
                    </UiButton>
                    <div v-if="openGroups[item.group]" class="relative ml-[20px] mt-1 pl-3 py-0.5 space-y-0.5 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-[var(--app-border-soft)]">
                      <router-link
                        v-for="child in item.children"
                        :key="child.path"
                        :to="child.path"
                        class="group/child relative flex items-center h-[30px] px-2.5 rounded-md text-[15px] text-[var(--app-text-secondary)] transition-all duration-150"
                        :class="{ 'bg-[var(--app-primary-tint-8)] !text-[var(--app-primary)] !font-semibold': isChildActive(child.path), 'hover:bg-[var(--app-primary-tint-8)] hover:text-[var(--app-text)]': !isChildActive(child.path) }"
                        @click="closeMobileMenu"
                      >
                        <span class="absolute left-[-15px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-[var(--app-border-soft)] bg-[var(--app-surface-muted)] transition-colors" :class="{ '!border-[var(--app-primary)] !bg-[var(--app-primary)]': isChildActive(child.path) }"></span>
                        <span>{{ child.label }}</span>
                      </router-link>
                    </div>
                  </div>
                </template>

                <div class="h-px bg-[var(--app-border-soft)] mx-3 my-2.5"></div>

                <router-link
                  to="/student/profile"
                  class="flex items-center gap-2.5 h-[38px] px-3 rounded-[10px] text-[15px] text-[var(--app-text-secondary)]"
                  :class="{ 'bg-[var(--app-primary-soft)] !text-[var(--app-primary)] !font-semibold': isItemActive('/student/profile') }"
                  @click="closeMobileMenu"
                >
                  <ui-icon class="w-[18px] h-[18px] shrink-0"><Setting /></ui-icon>
                  <span>个人设置</span>
                </router-link>
              </div>
            </nav>
          </ui-scrollbar>
        </div>
      </ui-drawer>

      <ui-container class="layout-main student-layout-main [display:flex] [flex-direction:column] [flex:1_1_auto] [width:100%] [height:100%] [min-width:0] [min-height:0] [overflow:hidden] [background:var(--app-layout-main)]">
        <ui-header class="app-layout-header layout-header student-layout-header [position:relative] [z-index:80] [overflow:visible] [background:var(--app-glass-header)] [display:flex] [align-items:center] [justify-content:space-between] [height:64px] [min-height:64px] [padding:8px_24px] [border-bottom:1px_solid_var(--app-border-soft)] [gap:16px] [backdrop-filter:blur(14px)] [flex-shrink:0]">
          <div class="header-left [display:flex] [align-items:center] [gap:12px] [min-width:0] [gap:14px]">
            <ui-icon class="fold-icon [display:inline-flex] [align-items:center] [justify-content:center] [width:40px] [height:40px] [flex:0_0_40px] [cursor:pointer] [font-size:20px] [color:var(--app-text-secondary)] [border-radius:14px] [transition:all_0.2s_ease] hover:[background:var(--app-primary-tint-8)] hover:[color:var(--app-primary)]" @click="toggleNavigation">
              <MenuIcon v-if="isMobile" />
              <Fold v-else />
            </ui-icon>
            <ui-breadcrumb separator="/">
              <ui-breadcrumb-item :to="{ path: '/student/dashboard' }">首页</ui-breadcrumb-item>
              <ui-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
                {{ item }}
              </ui-breadcrumb-item>
            </ui-breadcrumb>
            <div class="[display:flex] [align-items:center] [gap:8px] [font-size:12px] [color:var(--app-text-secondary)] [margin-left:12px] [padding-left:12px] [border-left:1px_solid_var(--app-border-soft)] max-[768px]:hidden">
              <span>当前课程：<strong class="[color:var(--app-text)]">{{ headerCourseName }}</strong></span>
              <span class="[color:var(--app-text-soft)]">|</span>
              <span>当前班级：<strong class="[color:var(--app-text)]">{{ headerClassName }}</strong></span>
            </div>
          </div>

          <div class="header-right [display:flex] [align-items:center] [justify-content:flex-end] [gap:12px] [min-width:0] [gap:14px]">
            <ui-dropdown
              trigger="click"
              class="notification-bell [z-index:95] [&>div:nth-child(2)]:![z-index:3000] [&>div:nth-child(2)]:![min-width:320px] [&>div:nth-child(2)]:![max-width:360px] [&>div:nth-child(2)]:![border-radius:14px] [&>div:nth-child(2)]:![border-color:var(--app-border)] [&>div:nth-child(2)]:![background:var(--app-surface)] [&>div:nth-child(2)]:![box-shadow:var(--app-shadow)] [&>div:nth-child(2)]:![padding:0]"
              @command="handleNotificationCommand"
            >
              <div
                class="bell-trigger [position:relative] [display:flex] [align-items:center] [justify-content:center] [width:42px] [height:42px] [border-radius:14px] [cursor:pointer] [background:var(--app-glass)] [border:1px_solid_var(--app-border-soft)] [transition:all_0.2s] hover:[border-color:var(--app-primary-tint-50)] hover:[box-shadow:var(--app-shadow-soft)]"
                @click="onBellClick"
              >
                <ui-icon class="[font-size:18px] [color:var(--app-text-secondary)]"><Bell /></ui-icon>
                <span
                  v-if="notificationStore.unreadCount > 0"
                  class="[position:absolute] [top:3px] [right:3px] [min-width:16px] [height:16px] [padding:0_4px] [border-radius:8px] [background:#ef4444] [color:#fff] [font-size:10px] [font-weight:700] [line-height:16px] [text-align:center] [box-shadow:0_0_0_2px_var(--app-surface)]"
                >{{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}</span>
              </div>
              <template #dropdown>
                <div class="[display:flex] [flex-direction:column] [max-height:440px]">
                  <div class="[display:flex] [align-items:center] [justify-content:space-between] [padding:12px_16px] [border-bottom:1px_solid_var(--app-border-soft)]">
                    <span class="[font-size:14px] [font-weight:700] [color:var(--app-text)]">通知</span>
                    <button
                      v-if="notificationStore.unreadCount > 0"
                      type="button"
                      class="[font-size:12px] [font-weight:600] [color:var(--app-primary)] [cursor:pointer] [background:none] [border:none] [padding:0]"
                      @click="handleMarkAllRead"
                    >全部已读</button>
                  </div>
                  <div class="[flex:1_1_auto] [overflow-y:auto] [min-height:0]">
                    <div
                      v-if="!notificationStore.items.length"
                      class="[padding:30px_16px] [text-align:center] [font-size:13px] [color:var(--app-text-soft)]"
                    >暂无通知</div>
                    <ui-dropdown-item
                      v-for="item in notificationStore.items"
                      :key="item.id"
                      :command="item.id"
                      class="![display:flex] ![flex-direction:column] ![align-items:flex-start] ![gap:4px] ![padding:11px_16px] ![border-bottom:1px_solid_var(--app-border-soft)]"
                    >
                      <div class="[display:flex] [align-items:center] [gap:8px] [width:100%]">
                        <span v-if="!item.read" class="[width:7px] [height:7px] [border-radius:50%] [background:#ef4444] [flex-shrink:0]"></span>
                        <span class="[font-size:13px] [font-weight:700] [color:var(--app-text)] [flex:1_1_auto] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">{{ item.title }}</span>
                      </div>
                      <span class="[font-size:12px] [color:var(--app-text-secondary)] [line-height:1.5] [white-space:normal]">{{ item.content }}</span>
                      <span class="[font-size:11px] [color:var(--app-text-soft)]">{{ item.createdAt }}</span>
                    </ui-dropdown-item>
                  </div>
                </div>
              </template>
            </ui-dropdown>
            <ui-dropdown
              trigger="click"
              class="[z-index:90] [&>div:nth-child(2)]:![z-index:3000] [&>div:nth-child(2)]:![min-width:184px] [&>div:nth-child(2)]:![border-radius:14px] [&>div:nth-child(2)]:![border-color:var(--app-border)] [&>div:nth-child(2)]:![background:var(--app-surface)] [&>div:nth-child(2)]:![box-shadow:var(--app-shadow)]"
              @command="handleCommand"
            >
              <div class="user-info [display:flex] [align-items:center] [cursor:pointer] [min-width:132px] [max-width:180px] [min-height:44px] [padding:6px_10px] [border-radius:16px] [transition:all_0.2s] [gap:10px] [background:var(--app-glass)] [border:1px_solid_var(--app-border-soft)] [flex-shrink:0] hover:[border-color:var(--app-primary-tint-50)] hover:[box-shadow:var(--app-shadow-soft)]">
                <ui-avatar :size="34">
                  <img src="../../assets/User/Cat.jpg" alt="avatar" class="[width:100%] [height:100%] [object-fit:cover]" />
                </ui-avatar>
                <span class="username [min-width:0] [flex:1_1_auto] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [font-size:13px] [font-weight:700] [color:var(--app-text)]">{{ userInfo.realName || userInfo.name || '学生' }}</span>
                <ui-icon class="arrow-icon [font-size:12px] [color:var(--app-text-soft)]"><ArrowDown /></ui-icon>
              </div>
              <template #dropdown>
                <ui-dropdown-menu class="[display:flex] [flex-direction:column] [gap:2px] [padding:2px]">
                  <ui-dropdown-item command="profile" class="[min-height:36px] [border-radius:10px] [font-weight:600]">
                    <ui-icon><Setting /></ui-icon>
                    个人信息
                  </ui-dropdown-item>
                  <ui-dropdown-item command="logout" divided class="[min-height:36px] [border-radius:10px] [font-weight:600]">
                    <ui-icon><SwitchButton /></ui-icon>
                    退出登录
                  </ui-dropdown-item>
                </ui-dropdown-menu>
              </template>
            </ui-dropdown>
          </div>
        </ui-header>

        <ui-main class="app-layout-content layout-content student-layout-content [background:var(--app-layout-main)] [padding:24px] [min-width:0] [min-height:0] [flex:1_1_auto] [overflow-y:auto] [overflow-x:hidden] [position:relative]">
          <router-view v-slot="{ Component }">
            <transition name="page-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </ui-main>

        <ui-footer class="app-layout-footer layout-footer student-layout-footer [text-align:center] [color:var(--app-text-soft)] [padding:12px_16px] [font-size:12px] [line-height:18px] [background:transparent] [border-top:1px_solid_var(--app-border-soft)] [flex-shrink:0]">
          智能个性画像与个性化实验能力提升平台 © 2025
        </ui-footer>
      </ui-container>
    </ui-container>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import {
  HomeFilled,
  Notebook,
  ChatDotRound,
  Collection,
  Connection,
  Setting,
  Fold,
  ArrowDown,
  Bell,
  Menu as MenuIcon,
  SwitchButton
} from '@/components/ui/icons'
import { useUserStore } from '../../store'
import { useNotificationStore } from '../../store/notification'
import { useResponsiveLayout } from '../../composables/useResponsiveLayout'
import { resolveBreadcrumbs } from '../../utils/breadcrumbLabels.mjs'
import { getStudentClasses } from '../../api/tap/classes'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const {
  isMobile,
  collapsed,
  mobileMenuVisible,
  asideWidth,
  toggleNavigation,
  closeMobileMenu
} = useResponsiveLayout({
  route,
  expandedWidth: '240px',
  collapsedWidth: '64px'
})

const userInfo = computed(() => userStore.userInfo || {})

const headerCourseName = computed(() => {
  return userStore.selectedClass?.courseName || '未选择课程'
})

const headerClassName = computed(() => {
  return userStore.selectedClass?.name || userInfo.value?.class || userInfo.value?.className || '未选择班级'
})

// ── Menu data ──────────────────────────────────────────────
const menuItems = [
  { path: '/student/dashboard', icon: HomeFilled, label: '首页' },
  {
    group: 'course', icon: Notebook, label: '课程学习',
    children: [
      { path: '/student/experiments', label: '实验列表' },
      { path: '/student/class-join', label: '教学班级' },
      { path: '/student/learning-analysis', label: '个性画像' }
    ]
  },
  {
    group: 'personalized', icon: Collection, label: '个性化学习',
    children: [
      { path: '/student/leetcode-search', label: '强化薄弱题集' },
      { path: '/student/wrong-notebook', label: '错题本' }
    ]
  },
  {
    group: 'ai', icon: ChatDotRound, label: 'AI 智能助手',
    children: [
      { path: '/student/ai-assistant', label: 'AI 学习助手' },
      { path: '/student/ai-report', label: 'AI 报告生成' },
      { path: '/student/code-playground', label: '代码演示' }
    ]
  },
  {
    path: '/student/knowledge-graph', icon: Connection, label: '知识图谱'
  }
]

// ── Group expand/collapse state ────────────────────────────
const openGroups = reactive(
  menuItems
    .filter((item) => item.children)
    .reduce((groups, item) => ({ ...groups, [item.group]: false }), {})
)

function toggleGroup(group) {
  openGroups[group] = !openGroups[group]
}

// ── Active menu detection ──────────────────────────────────
const activeMenu = computed(() => {
  const path = route.path
  // Map detail pages to their parent menu path
  if (path.startsWith('/student/experiment-detail')) return '/student/experiments'
  if (path.startsWith('/student/leetcode-practice')) return '/student/leetcode-search'
  return path
})

// Flatten all leaf menu paths
const allMenuPaths = computed(() =>
  menuItems.flatMap((item) =>
    item.children ? item.children.map((child) => child.path) : [item.path]
  )
)

// Best-match active path (handles nested sub-routes)
const activeMenuPath = computed(() => {
  const paths = allMenuPaths.value
  return paths
    .filter((p) => activeMenu.value === p || activeMenu.value.startsWith(`${p}/`))
    .sort((a, b) => b.length - a.length)[0] || activeMenu.value
})

function isItemActive(path) {
  return activeMenuPath.value === path
}

function isChildActive(path) {
  return activeMenuPath.value === path
}

function isGroupActive(item) {
  return (item.children || []).some((child) => isChildActive(child.path))
}

function getGroupButtonClass(item) {
  const active = isGroupActive(item)
  const open = openGroups[item.group]
  if (active) {
    return '!border-[var(--app-primary)]/25 !bg-[var(--app-primary-tint-12)] !text-[var(--app-primary)]'
  }
  if (open) {
    return '!border-[var(--app-border-soft)] !bg-[var(--app-glass)] !text-[var(--app-text)]'
  }
  return '!border-[var(--app-border-soft)] !bg-[var(--app-glass-strong)] !text-[var(--app-text-secondary)] hover:!border-[var(--app-border)] hover:!bg-[var(--app-glass)] hover:!text-[var(--app-text)]'
}

// Auto-open the active group
const activeGroupKey = computed(() =>
  menuItems.find((item) => item.children && isGroupActive(item))?.group || ''
)

function syncActiveGroup() {
  if (activeGroupKey.value) {
    openGroups[activeGroupKey.value] = true
  }
}

watch(activeGroupKey, syncActiveGroup, { immediate: true })

// ── Breadcrumbs ────────────────────────────────────────────
const breadcrumbs = computed(() => {
  return resolveBreadcrumbs('student', route.path)
})

// ── User dropdown ──────────────────────────────────────────
function handleCommand(command) {
  if (command === 'profile') {
    router.push('/student/profile')
    return
  }
  if (command !== 'logout') return

  messageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    sessionStorage.clear()
    router.push('/login')
    uiMessage.success('已退出登录')
  }).catch(() => {})
}

async function ensureCurrentClass() {
  try {
    const response = await getStudentClasses()
    const classes = Array.isArray(response) ? response : response?.data || []
    const selectedExists = classes.some(item =>
      String(item.id) === String(userStore.selectedClass?.id || '')
    )
    if (!selectedExists) {
      userStore.setSelectedClass(classes.length === 1 ? classes[0] : null)
    }
  } catch {
    userStore.setSelectedClass(null)
  }
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    uiMessage.warning('请先登录')
    return
  }
  ensureCurrentClass()
  notificationStore.startPolling()
})

onUnmounted(() => {
  notificationStore.stopPolling()
})

// ── Notifications ──────────────────────────────────────────
function onBellClick() {
  notificationStore.fetchNotifications()
}

function handleNotificationCommand(id) {
  const item = notificationStore.items.find((n) => n.id === id)
  if (!item) return
  if (!item.read) {
    notificationStore.markRead([id])
  }
  if (item.linkExperimentId != null) {
    router.push(`/student/experiment-detail/${item.linkExperimentId}`)
  }
}

function handleMarkAllRead() {
  notificationStore.markAllRead()
}
</script>

<style scoped>
.student-layout-main {
  height: 100%;
  min-height: 0;
}

.student-layout-header {
  min-height: 64px !important;
  padding: 8px 24px !important;
}

.student-layout-content {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  padding: 24px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  position: relative !important;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
}

.student-layout-content::-webkit-scrollbar {
  width: 6px;
}

.student-layout-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 3px;
}

.student-layout-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

.student-layout-footer {
  padding: 12px 16px !important;
}

@media (max-width: 960px) {
  .student-layout-header {
    height: auto !important;
    min-height: 58px !important;
    padding: 10px 16px !important;
  }

  .student-layout-content {
    min-height: 0 !important;
    padding: 16px !important;
    overflow-y: auto !important;
  }
}
</style>
