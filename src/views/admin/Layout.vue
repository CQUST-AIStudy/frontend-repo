<template>
  <div class="app-layout app-layout--admin admin-layout [width:100%] [min-height:100vh] [min-height:100dvh] [overflow-x:hidden]">
    <ui-container class="app-layout-container layout-container [min-height:100vh] [min-height:100dvh]">
      <ui-aside v-if="!isMobile" :width="asideWidth" class="app-layout-aside layout-aside [display:flex] [flex-direction:column] [height:100vh] [height:100dvh] [background:var(--app-sidebar-bg)] [transition:width_0.3s_cubic-bezier(0.25,_0.46,_0.45,_0.94)] [overflow:hidden] [border-right:1px_solid_var(--app-border-soft)] [backdrop-filter:blur(16px)_saturate(140%)]">
        <div class="logo-container [height:64px] [display:flex] [align-items:center] [padding:0_16px] [gap:12px] [border-bottom:0.5px_solid_var(--app-border-soft)]">
          <img src="../../assets/logo.png" alt="Logo" class="logo [border-radius:10px] [border:1px_solid_var(--app-border-soft)] [height:36px] [width:36px] [flex-shrink:0] [transition:all_0.3s]" />
          <transition name="fade-text">
            <span v-if="!collapsed" class="logo-title [font-size:15px] [font-weight:700] [color:var(--app-text)] [white-space:nowrap] [letter-spacing:0]">系统管理后台</span>
          </transition>
        </div>

        <ui-scrollbar class="menu-scrollbar [flex:1] [min-height:0] [height:calc(100vh_-_64px)] [height:calc(100dvh_-_64px)] [&_.ui-scrollbar__bar.is-vertical]:[width:4px] [&_.ui-scrollbar__bar.is-vertical]:[right:2px] [&_.ui-scrollbar__thumb]:[background:var(--app-border-strong)] [&_.ui-scrollbar__thumb]:[border-radius:4px]">
          <ui-menu
            :default-active="activeMenu"
            class="layout-menu [border-right:none] ![background:transparent] [--ui-menu-bg-color:transparent] [--ui-menu-text-color:var(--app-text-secondary)] [--ui-menu-active-color:var(--app-primary)] [--ui-menu-hover-bg-color:var(--app-primary-tint-8)] [--ui-menu-hover-text-color:var(--app-text)] [padding:8px] [&_.ui-menu-item]:[border-radius:8px] [&_.ui-menu-item]:[margin:2px_0] [&_.ui-menu-item]:[height:40px] [&_.ui-menu-item]:[line-height:40px] [&_.ui-menu-item]:[font-size:13.5px] [&_.ui-menu-item]:[transition:all_0.2s] [&_.ui-menu-item.is-active]:![background:var(--app-primary-soft)] [&_.ui-menu-item.is-active]:![color:var(--app-primary)] [&_.ui-menu-item.is-active]:[font-weight:600] [&_.ui-menu-item.is-active::before]:[position:absolute] [&_.ui-menu-item.is-active::before]:[left:0] [&_.ui-menu-item.is-active::before]:[top:50%] [&_.ui-menu-item.is-active::before]:[transform:translateY(-50%)] [&_.ui-menu-item.is-active::before]:[width:3px] [&_.ui-menu-item.is-active::before]:[height:18px] [&_.ui-menu-item.is-active::before]:[background:var(--app-primary)] [&_.ui-menu-item.is-active::before]:[border-radius:0_3px_3px_0] [&_.ui-menu-item:hover]:![background:var(--app-primary-tint-8)] [&_.ui-icon]:[font-size:18px]"
            :collapse="collapsed"
            router
            :collapse-transition="false"
          >
            <ui-menu-item index="/admin/dashboard">
              <ui-icon><HomeFilled /></ui-icon>
              <template #title>首页</template>
            </ui-menu-item>

            <ui-menu-item index="/admin/user-management">
              <ui-icon><User /></ui-icon>
              <template #title>用户管理</template>
            </ui-menu-item>

            <ui-menu-item index="/admin/class-management">
              <ui-icon><OfficeBuilding /></ui-icon>
              <template #title>班级管理</template>
            </ui-menu-item>

            <ui-menu-item index="/admin/experiment-management">
              <ui-icon><DocumentCopy /></ui-icon>
              <template #title>实验管理</template>
            </ui-menu-item>

            <ui-menu-item index="/admin/experiment-screen">
              <ui-icon><TrendCharts /></ui-icon>
              <template #title>实验大屏</template>
            </ui-menu-item>

            <ui-menu-item index="/admin/system-log">
              <ui-icon><DataAnalysis /></ui-icon>
              <template #title>系统日志</template>
            </ui-menu-item>

            <ui-menu-item index="/admin/leetcode-claw">
              <ui-icon><DataAnalysis /></ui-icon>
              <template #title>强化薄弱题集</template>
            </ui-menu-item>

            <div class="menu-divider [height:1px] [background:var(--app-border-soft)] [margin:10px_12px]"></div>

            <ui-menu-item index="/admin/profile">
              <ui-icon><Setting /></ui-icon>
              <template #title>个人设置</template>
            </ui-menu-item>
          </ui-menu>
        </ui-scrollbar>
      </ui-aside>

      <ui-drawer
        v-model="mobileMenuVisible"
        direction="ltr"
        size="280px"
        :with-header="false"
        class="layout-drawer"
      >
        <div class="app-layout-aside layout-aside mobile-aside [width:100%] [border-right:none] flex flex-col h-full">
          <div class="flex items-center gap-3.5 h-[68px] px-[18px] border-b border-[var(--app-border-soft)] shrink-0">
            <img src="../../assets/logo.png" alt="Logo" class="w-[38px] h-[38px] rounded-[10px] border border-[var(--app-border-soft)] shadow-sm shrink-0" />
            <div class="flex flex-col gap-0.5">
              <span class="text-[11px] font-medium text-[var(--app-text-soft)] uppercase tracking-wide">管理员工作台</span>
              <span class="text-base font-bold text-[var(--app-text)] tracking-normal whitespace-nowrap">系统管理后台</span>
            </div>
          </div>

          <ui-scrollbar class="menu-scrollbar flex-1 min-h-0">
            <ui-menu
              :default-active="activeMenu"
              class="layout-menu"
              router
              :collapse-transition="false"
              @select="closeMobileMenu"
            >
              <ui-menu-item index="/admin/dashboard">
                <ui-icon><HomeFilled /></ui-icon>
                <template #title>首页</template>
              </ui-menu-item>

              <ui-menu-item index="/admin/user-management">
                <ui-icon><User /></ui-icon>
                <template #title>用户管理</template>
              </ui-menu-item>

              <ui-menu-item index="/admin/class-management">
                <ui-icon><OfficeBuilding /></ui-icon>
                <template #title>班级管理</template>
              </ui-menu-item>

              <ui-menu-item index="/admin/experiment-management">
                <ui-icon><DocumentCopy /></ui-icon>
                <template #title>实验管理</template>
              </ui-menu-item>

              <ui-menu-item index="/admin/experiment-screen">
                <ui-icon><TrendCharts /></ui-icon>
                <template #title>实验大屏</template>
              </ui-menu-item>

              <ui-menu-item index="/admin/system-log">
                <ui-icon><DataAnalysis /></ui-icon>
                <template #title>系统日志</template>
              </ui-menu-item>

              <ui-menu-item index="/admin/leetcode-claw">
                <ui-icon><DataAnalysis /></ui-icon>
                <template #title>强化薄弱题集</template>
              </ui-menu-item>

              <div class="menu-divider [height:1px] [background:var(--app-border-soft)] [margin:10px_12px]"></div>

              <ui-menu-item index="/admin/profile">
                <ui-icon><Setting /></ui-icon>
                <template #title>个人设置</template>
              </ui-menu-item>
            </ui-menu>
          </ui-scrollbar>
        </div>
      </ui-drawer>

      <ui-container class="app-layout-main layout-main [display:flex] [flex-direction:column] [flex:1_1_auto] [width:100%] [min-width:0] [background:var(--app-layout-main)]">
        <ui-header class="app-layout-header layout-header [position:relative] [z-index:2000] [overflow:visible] [background:var(--app-glass-header)] [display:flex] [align-items:center] [justify-content:space-between] [padding:0_24px] [min-height:64px] [border-bottom:1px_solid_var(--app-border-soft)] [gap:18px] [backdrop-filter:blur(14px)] max-[768px]:[padding:0_16px] max-[768px]:[min-height:58px]">
          <div class="header-left [display:flex] [align-items:center] [gap:14px] [min-width:0]">
            <ui-icon class="fold-icon [display:inline-flex] [align-items:center] [justify-content:center] [width:40px] [height:40px] [flex:0_0_40px] [cursor:pointer] [font-size:20px] [color:var(--app-text-secondary)] [border-radius:14px] [transition:all_0.2s_ease] hover:[background:var(--app-primary-tint-8)] hover:[color:var(--app-primary)]" @click="toggleNavigation">
              <MenuIcon v-if="isMobile" />
              <Fold v-else />
            </ui-icon>
            <ui-breadcrumb separator="/">
              <ui-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</ui-breadcrumb-item>
              <ui-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
                {{ item }}
              </ui-breadcrumb-item>
            </ui-breadcrumb>
          </div>

          <div class="header-right [position:relative] [z-index:2100] [overflow:visible] [display:flex] [align-items:center] [justify-content:flex-end] [gap:12px] [min-width:0] [gap:14px]">
            <!-- PTA Cookie 过期告警 -->
            <ui-tooltip v-if="ptaCookieExpired" content="PTA Cookie 已过期，数据同步暂停" placement="bottom">
              <ui-badge is-dot type="danger">
                <ui-icon class="header-icon [color:var(--app-danger)] [display:inline-flex] [align-items:center] [justify-content:center] [width:40px] [height:40px] [flex:0_0_40px] [cursor:pointer] [font-size:18px] [border-radius:14px] [transition:all_0.2s_ease] hover:[background:var(--app-primary-tint-8)] hover:[color:var(--app-primary)]" @click="goToCookieAlert">
                  <WarningFilled />
                </ui-icon>
              </ui-badge>
            </ui-tooltip>

            <ui-dropdown class="[z-index:2200]" trigger="click" @command="handleCommand">
              <div class="user-info [display:flex] [align-items:center] [cursor:pointer] [padding:6px_10px] [border-radius:16px] [transition:all_0.2s] [gap:10px] [background:var(--app-glass)] [border:1px_solid_var(--app-border-soft)] [flex-shrink:0] hover:[border-color:var(--app-primary-tint-50)] hover:[box-shadow:var(--app-shadow-soft)]">
                <ui-avatar :size="34">
                  <span>{{ (userInfo.name || '管')[0] }}</span>
                </ui-avatar>
                <span class="username [font-size:13px] [font-weight:700] [color:var(--app-text)]">{{ userInfo.name || '管理员' }}</span>
                <ui-icon class="arrow-icon [font-size:12px] [color:var(--app-text-soft)]"><ArrowDown /></ui-icon>
              </div>
              <template #dropdown>
                <ui-dropdown-menu>
                  <ui-dropdown-item command="profile">
                    <ui-icon><Setting /></ui-icon> 个人信息
                  </ui-dropdown-item>
                  <ui-dropdown-item command="logout" divided>
                    <ui-icon><SwitchButton /></ui-icon> 退出登录
                  </ui-dropdown-item>
                </ui-dropdown-menu>
              </template>
            </ui-dropdown>
          </div>
        </ui-header>

        <ui-main class="app-layout-content layout-content [background:var(--app-layout-main)] [padding:24px] [min-width:0] [min-height:calc(100vh_-_120px)] [min-height:calc(100dvh_-_120px)] [overflow-y:auto] [overflow-x:hidden]">
          <router-view v-slot="{ Component }">
            <transition name="page-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </ui-main>

        <ui-footer class="app-layout-footer layout-footer [text-align:center] [color:var(--app-text-soft)] [padding:12px_16px] [font-size:12px] [background:transparent] [border-top:1px_solid_var(--app-border-soft)]">
          智能个性画像与个性化实验能力提升平台 - 管理后台 © 2025
        </ui-footer>
      </ui-container>
    </ui-container>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { messageBox } from '@/services/feedback'
import { useUserStore } from '../../store'
import {
  HomeFilled, User, OfficeBuilding, DocumentCopy, DataAnalysis,
  Setting, Fold, ArrowDown, SwitchButton, WarningFilled,
  Menu as MenuIcon, TrendCharts
} from '@/components/ui/icons'
import { getPtaCookieStatus } from '../../api/tap'
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
  expandedWidth: '240px',
  collapsedWidth: '64px'
})

const userInfo = computed(() => userStore.userInfo || { name: '管理员' })

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const pathMap = {
    dashboard: '首页', 'user-management': '用户管理', 'class-management': '班级管理',
    'experiment-management': '实验管理', 'experiment-screen': '实验大屏', 'system-log': '系统日志', profile: '个人设置',
    'knowledge-graph': '知识图谱'
  }
  const paths = route.path.split('/').filter(Boolean)
  return paths[0] === 'admin' ? paths.slice(1).map(p => pathMap[p.split('/')[0]] || p) : []
})

const handleCommand = (cmd) => {
  if (cmd === 'profile') router.push('/admin/profile')
  else if (cmd === 'logout') {
    messageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    }).then(() => {
      userStore.logout()
      sessionStorage.clear()
      router.push('/login')
    }).catch(() => {})
  }
}

// --- PTA Cookie 告警 ---
const ptaCookieExpired = ref(false)
let ptaCookieTimer = null

const checkPtaCookie = async () => {
  try {
    const res = await getPtaCookieStatus()
    const data = res?.data ?? res
    ptaCookieExpired.value = data?.status === 'EXPIRED'
  } catch { /* 爬虫服务未启动时忽略 */ }
}

const goToCookieAlert = () => {
  messageBox.alert(
    'PTA 登录凭证已过期，自动登录重试失败。请通知相关教师在「班级管理 → PTA同步设置」中手动更新 Cookie，或检查爬虫服务器网络连接。',
    'PTA Cookie 过期告警',
    { confirmButtonText: '知道了', type: 'warning' }
  )
}

onMounted(() => {
  checkPtaCookie()
  // 每5 分钟检查一次
  ptaCookieTimer = setInterval(checkPtaCookie, 5 * 60 * 1000)
  if (userInfo.value.role && userInfo.value.role !== 'admin') {
    messageBox.alert('您没有管理员权限，请重新登录', '权限错误', {
      confirmButtonText: '确定',
      callback: () => {
        userStore.logout()
        sessionStorage.clear()
        router.push('/login')
      }
    })
  }
})

onUnmounted(() => {
  if (ptaCookieTimer) {
    clearInterval(ptaCookieTimer)
    ptaCookieTimer = null
  }
})
</script>


