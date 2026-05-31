<template>
  <div class="admin-layout [width:100%] [min-height:100vh] [min-height:100dvh] [overflow-x:hidden]">
    <el-container class="layout-container [min-height:100vh] [min-height:100dvh]">
      <el-aside v-if="!isMobile" :width="asideWidth" class="layout-aside [display:flex] [flex-direction:column] [height:100vh] [height:100dvh] [background:linear-gradient(180deg,_#1a1a2e_0%,_#202134_100%)] [transition:width_0.3s_cubic-bezier(0.4,_0,_0.2,_1)] [overflow:hidden] [border-right:1px_solid_rgba(255,255,255,0.06)]">
        <div class="logo-container [height:64px] [display:flex] [align-items:center] [padding:0_16px] [gap:12px] [border-bottom:1px_solid_rgba(255,255,255,0.08)]">
          <img src="../../assets/logo.png" alt="Logo" class="logo [border-radius:12px] [border:2px_solid_rgba(26,115,232,0.5)] [height:40px] [width:40px] [flex-shrink:0] [transition:all_0.3s]" />
          <transition name="fade-text">
            <span v-if="!collapsed" class="logo-title [font-size:15px] [font-weight:700] [color:rgba(255,255,255,0.9)] [white-space:nowrap] [letter-spacing:0]">系统管理后台</span>
          </transition>
        </div>

        <el-scrollbar class="menu-scrollbar [flex:1] [min-height:0] [height:calc(100vh_-_64px)] [height:calc(100dvh_-_64px)] [&_.el-scrollbar__bar.is-vertical]:[width:4px] [&_.el-scrollbar__bar.is-vertical]:[right:2px] [&_.el-scrollbar__thumb]:[background:rgba(255,255,255,0.15)] [&_.el-scrollbar__thumb]:[border-radius:4px]">
          <el-menu
            :default-active="activeMenu"
            class="layout-menu [border-right:none] ![background:transparent] [--el-menu-bg-color:transparent] [--el-menu-text-color:#9aa0a6] [--el-menu-active-color:#8ab4f8] [--el-menu-hover-bg-color:rgba(26,115,232,0.1)] [--el-menu-hover-text-color:#d2e3fc] [padding:8px] [&_.el-menu-item]:[border-radius:8px] [&_.el-menu-item]:[margin:2px_0] [&_.el-menu-item]:[height:44px] [&_.el-menu-item]:[line-height:44px] [&_.el-menu-item]:[font-size:13.5px] [&_.el-menu-item]:[transition:all_0.2s] [&_.el-menu-item.is-active]:![background:linear-gradient(135deg,_rgba(26,115,232,0.2),_rgba(66,133,244,0.15))] [&_.el-menu-item.is-active]:![color:#aecbfa] [&_.el-menu-item.is-active]:[font-weight:600] [&_.el-menu-item.is-active::before]:[position:absolute] [&_.el-menu-item.is-active::before]:[left:0] [&_.el-menu-item.is-active::before]:[top:50%] [&_.el-menu-item.is-active::before]:[transform:translateY(-50%)] [&_.el-menu-item.is-active::before]:[width:3px] [&_.el-menu-item.is-active::before]:[height:20px] [&_.el-menu-item.is-active::before]:[background:#8ab4f8] [&_.el-menu-item.is-active::before]:[border-radius:0_3px_3px_0] [&_.el-menu-item:hover]:![background:rgba(26,115,232,0.1)] [&_.el-icon]:[font-size:18px]"
            :collapse="collapsed"
            router
            :collapse-transition="false"
          >
            <el-menu-item index="/admin/dashboard">
              <el-icon><HomeFilled /></el-icon>
              <template #title>首页</template>
            </el-menu-item>

            <el-menu-item index="/admin/user-management">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>

            <el-menu-item index="/admin/class-management">
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>班级管理</template>
            </el-menu-item>

            <el-menu-item index="/admin/experiment-management">
              <el-icon><DocumentCopy /></el-icon>
              <template #title>实验管理</template>
            </el-menu-item>

            <el-menu-item index="/admin/system-log">
              <el-icon><DataAnalysis /></el-icon>
              <template #title>系统日志</template>
            </el-menu-item>

            <div class="menu-divider [height:1px] [background:rgba(255,255,255,0.06)] [margin:8px_12px] [background:rgba(255,_255,_255,_0.06)] [margin:10px_12px] [background:rgba(255,_255,_255,_0.08)]"></div>

            <el-menu-item index="/admin/profile">
              <el-icon><Setting /></el-icon>
              <template #title>个人设置</template>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <el-drawer
        v-model="mobileMenuVisible"
        direction="ltr"
        size="280px"
        :with-header="false"
        class="layout-drawer"
      >
        <div class="layout-aside mobile-aside [width:100%] [border-right:none]">
          <div class="logo-container">
            <img src="../../assets/logo.png" alt="Logo" class="logo" />
            <span class="logo-title">系统管理后台</span>
          </div>

          <el-scrollbar class="menu-scrollbar">
            <el-menu
              :default-active="activeMenu"
              class="layout-menu"
              router
              :collapse-transition="false"
              @select="closeMobileMenu"
            >
              <el-menu-item index="/admin/dashboard">
                <el-icon><HomeFilled /></el-icon>
                <template #title>首页</template>
              </el-menu-item>

              <el-menu-item index="/admin/user-management">
                <el-icon><User /></el-icon>
                <template #title>用户管理</template>
              </el-menu-item>

              <el-menu-item index="/admin/class-management">
                <el-icon><OfficeBuilding /></el-icon>
                <template #title>班级管理</template>
              </el-menu-item>

              <el-menu-item index="/admin/experiment-management">
                <el-icon><DocumentCopy /></el-icon>
                <template #title>实验管理</template>
              </el-menu-item>

              <el-menu-item index="/admin/system-log">
                <el-icon><DataAnalysis /></el-icon>
                <template #title>系统日志</template>
              </el-menu-item>

              <div class="menu-divider [height:1px] [background:rgba(255,255,255,0.06)] [margin:8px_12px] [background:rgba(255,_255,_255,_0.06)] [margin:10px_12px] [background:rgba(255,_255,_255,_0.08)]"></div>

              <el-menu-item index="/admin/profile">
                <el-icon><Setting /></el-icon>
                <template #title>个人设置</template>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
        </div>
      </el-drawer>

      <el-container class="layout-main [min-width:0] [background:#f8f9fa] [background:transparent]">
        <el-header class="layout-header [background:#fff] [display:flex] [align-items:center] [justify-content:space-between] [box-shadow:0_1px_2px_rgba(60,64,67,0.1)] [padding:0_24px] [height:56px] [border-bottom:1px_solid_#dadce0] [gap:16px] [box-shadow:0_1px_2px_rgba(60,_64,_67,_0.1)] [min-height:56px] [gap:18px] [min-height:78px] [padding:0_28px] [border-bottom:1px_solid_rgba(126,_157,_183,_0.14)] [background:rgba(248,_251,_253,_0.72)] [backdrop-filter:blur(14px)]">
          <div class="header-left [display:flex] [align-items:center] [gap:12px] [min-width:0] [gap:14px]">
            <el-icon class="fold-icon [display:inline-flex] [align-items:center] [justify-content:center] [width:36px] [height:36px] [flex:0_0_36px] [cursor:pointer] [font-size:20px] [color:#5f6368] [border-radius:8px] [transition:all_0.2s] hover:[background:#f1f3f4] hover:[color:#202124] [width:40px] [height:40px] [border-radius:14px] [color:#5d7288] [transition:all_0.2s_ease] hover:[background:rgba(18,_112,_216,_0.08)] hover:[color:#1270d8]" @click="toggleNavigation">
              <MenuIcon v-if="isMobile" />
              <Fold v-else-if="!collapsed" />
              <Expand v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
                {{ item }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div class="header-right [display:flex] [align-items:center] [justify-content:flex-end] [gap:12px] [min-width:0] [gap:14px]">
            <!-- PTA Cookie 过期告警 -->
            <el-tooltip v-if="ptaCookieExpired" content="PTA Cookie 已过期，数据同步暂停" placement="bottom">
              <el-badge is-dot type="danger">
                <el-icon class="header-icon [color:#ea4335] [display:inline-flex] [align-items:center] [justify-content:center] [width:36px] [height:36px] [flex:0_0_36px] [cursor:pointer] [font-size:18px] [color:#5f6368] [border-radius:8px] [transition:all_0.2s] hover:[background:#f1f3f4] hover:[color:#202124] [width:40px] [height:40px] [border-radius:14px] [color:#5d7288] [transition:all_0.2s_ease] hover:[background:rgba(18,_112,_216,_0.08)] hover:[color:#1270d8]" @click="goToCookieAlert">
                  <WarningFilled />
                </el-icon>
              </el-badge>
            </el-tooltip>

            <el-tooltip content="全屏" placement="bottom">
              <el-icon class="header-icon [display:inline-flex] [align-items:center] [justify-content:center] [width:36px] [height:36px] [flex:0_0_36px] [cursor:pointer] [font-size:18px] [color:#5f6368] [border-radius:8px] [transition:all_0.2s] hover:[background:#f1f3f4] hover:[color:#202124] [width:40px] [height:40px] [border-radius:14px] [color:#5d7288] [transition:all_0.2s_ease] hover:[background:rgba(18,_112,_216,_0.08)] hover:[color:#1270d8]" @click="toggleFullScreen">
                <FullScreen />
              </el-icon>
            </el-tooltip>

            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info [display:flex] [align-items:center] [cursor:pointer] [padding:4px_8px] [border-radius:8px] [transition:background_0.2s] [gap:8px] hover:[background:#f1f3f4] [gap:10px] [padding:6px_10px] [border-radius:16px] [background:rgba(255,_255,_255,_0.64)] [border:1px_solid_rgba(126,_157,_183,_0.14)] [flex-shrink:0]">
                <el-avatar :size="34">
                  <span>{{ (userInfo.name || '管')[0] }}</span>
                </el-avatar>
                <span class="username [font-size:14px] [color:#202124] [font-weight:500] [color:#16324a] [font-size:13px] [font-weight:700]">{{ userInfo.name || '管理员' }}</span>
                <el-icon class="arrow-icon [font-size:12px] [color:#9aa0a6] [color:#8ca0b3]"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><Setting /></el-icon> 个人信息
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="layout-content [background:#f8f9fa] [padding:24px] [min-width:0] [min-height:calc(100vh_-_120px)] [min-height:calc(100dvh_-_120px)] [overflow-y:auto] [overflow-x:hidden] [padding:24px_28px_28px] [min-height:calc(100vh_-_138px)] [min-height:calc(100dvh_-_138px)]">
          <router-view v-slot="{ Component }">
            <transition name="page-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>

        <el-footer class="layout-footer [text-align:center] [color:#9aa0a6] [padding:12px] [font-size:13px] [background:#f8f9fa] [border-top:1px_solid_#dadce0] [padding:12px_16px_18px] [color:#8ca0b3] [font-size:12px] [background:transparent]">
          智能学情分析与个性化实验能力提升平台 - 管理后台 © 2025
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store'
import {
  HomeFilled, User, OfficeBuilding, DocumentCopy, DataAnalysis,
  Setting, Fold, Expand, FullScreen, ArrowDown, SwitchButton, WarningFilled,
  Menu as MenuIcon
} from '@element-plus/icons-vue'
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
    'experiment-management': '实验管理', 'system-log': '系统日志', profile: '个人设置'
  }
  const paths = route.path.split('/').filter(Boolean)
  return paths[0] === 'admin' ? paths.slice(1).map(p => pathMap[p.split('/')[0]] || p) : []
})

const toggleFullScreen = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen()
  else document.exitFullscreen?.()
}

const handleCommand = (cmd) => {
  if (cmd === 'profile') router.push('/admin/profile')
  else if (cmd === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
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

const checkPtaCookie = async () => {
  try {
    const res = await getPtaCookieStatus()
    const data = res?.data ?? res
    ptaCookieExpired.value = data?.status === 'EXPIRED'
  } catch { /* 爬虫服务未启动时忽略 */ }
}

const goToCookieAlert = () => {
  ElMessageBox.alert(
    'PTA 登录凭证已过期，自动登录重试失败。请通知相关教师在「班级管理 → PTA同步设置」中手动更新 Cookie，或检查爬虫服务器网络连接。',
    'PTA Cookie 过期告警',
    { confirmButtonText: '知道了', type: 'warning' }
  )
}

onMounted(() => {
  checkPtaCookie()
  // 每5 分钟检查一次
  setInterval(checkPtaCookie, 5 * 60 * 1000)
  if (userInfo.value.role && userInfo.value.role !== 'admin') {
    ElMessageBox.alert('您没有管理员权限，请重新登录', '权限错误', {
      confirmButtonText: '确定',
      callback: () => {
        userStore.logout()
        router.push('/login')
      }
    })
  }
})
</script>


