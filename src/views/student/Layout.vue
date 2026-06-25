<template>
  <div class="student-layout [width:100%] [height:100vh] [height:100dvh] [min-height:0] [overflow:hidden] max-[960px]:[min-height:100vh] max-[960px]:[min-height:100dvh] max-[960px]:[height:auto] max-[960px]:[overflow-x:hidden]">
    <ui-container class="layout-container [height:100vh] [height:100dvh] [min-height:0] max-[960px]:[min-height:100vh] max-[960px]:[min-height:100dvh] max-[960px]:[height:auto]">
      <ui-aside v-if="!isMobile" :width="asideWidth" class="layout-aside [display:flex] [flex-direction:column] [height:100vh] [height:100dvh] [background:rgba(246,_246,_248,_0.82)] [transition:width_0.3s_cubic-bezier(0.25,_0.46,_0.45,_0.94)] [overflow:hidden] [border-right:0.5px_solid_rgba(0,_0,_0,_0.06)] [backdrop-filter:blur(20px)_saturate(180%)]">
        <div class="logo-container [height:64px] [display:flex] [align-items:center] [padding:0_16px] [gap:12px] [border-bottom:0.5px_solid_rgba(0,_0,_0,_0.06)]">
          <img src="../../assets/logo.png" alt="Logo" class="logo [border-radius:10px] [border:1px_solid_rgba(0,_0,_0,_0.08)] [height:36px] [width:36px] [flex-shrink:0] [transition:all_0.3s]" />
          <transition name="fade-text">
            <span v-if="!collapsed" class="logo-title [font-size:15px] [font-weight:700] [color:#1d1d1f] [white-space:nowrap] [letter-spacing:-0.01em]">智能学习平台</span>
          </transition>
        </div>

        <ui-scrollbar class="menu-scrollbar [flex:1] [min-height:0] [height:calc(100vh_-_64px)] [height:calc(100dvh_-_64px)] [&_.ui-scrollbar__bar.is-vertical]:[width:4px] [&_.ui-scrollbar__bar.is-vertical]:[right:2px] [&_.ui-scrollbar__thumb]:[background:rgba(0,_0,_0,_0.1)] [&_.ui-scrollbar__thumb]:[border-radius:4px]">
          <nav class="[padding:8px] [display:flex] [flex-direction:column] [gap:2px]" :class="{ '[items:center]': collapsed }">
            <template v-for="item in menuItems" :key="item.path || item.group">
              <!-- Single item -->
              <router-link
                v-if="!item.children"
                :to="item.path"
                class="nav-item [display:flex] [align-items:center] [gap:10px] [height:40px] [padding:0_12px] [border-radius:8px] [text-decoration:none] [font-size:13.5px] [font-weight:400] [color:#6e6e73] [transition:all_0.2s] [position:relative]"
                :class="{
                  '[background:var(--app-primary-soft)] ![color:var(--app-primary)] ![font-weight:600] [&::before]:[content:\'\'] [&::before]:[position:absolute] [&::before]:[left:0] [&::before]:[top:50%] [&::before]:[transform:translateY(-50%)] [&::before]:[width:3px] [&::before]:[height:18px] [&::before]:[background:var(--app-primary)] [&::before]:[border-radius:0_3px_3px_0]': isItemActive(item.path),
                  'hover:[background:rgba(0,_0,_0,_0.04)] hover:[color:#1d1d1f]': !isItemActive(item.path)
                }"
              >
                <component :is="item.icon" class="[font-size:18px] [flex-shrink:0] [display:inline-flex] [align-items:center] [justify-content:center] [width:18px] [height:18px]" />
                <span v-if="!collapsed" class="[white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">{{ item.label }}</span>
              </router-link>

              <!-- Group with children -->
              <div v-else class="[width:100%]">
                <UiButton
                  class="nav-group-btn [display:flex] [align-items:center] [overflow:hidden] [font-size:13.5px] [font-weight:500] [transition:all_0.2s] [cursor:pointer] ![min-height:0] ![height:40px] ![width:100%] ![justify-content:flex-start] ![gap:10px] ![padding:0_12px] ![border-radius:8px] ![border:none] ![shadow:none]"
                  :class="getGroupButtonClass(item)"
                  @click="toggleGroup(item.group)"
                >
                  <component :is="item.icon" class="[font-size:18px] [flex-shrink:0] [display:inline-flex] [align-items:center] [justify-content:center] [width:18px] [height:18px]" />
                  <span v-if="!collapsed" class="[flex:1] [text-align:left] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">{{ item.label }}</span>
                  <svg v-if="!collapsed" class="[width:12px] [height:12px] [flex-shrink:0] [transition:transform_0.2s]" :class="{ '[transform:rotate(90deg)]': openGroups[item.group] }" viewBox="0 0 12 12" fill="none">
                    <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </UiButton>
                <transition
                  enter-active-class="[transition:all_0.2s_ease-out] [overflow:hidden]"
                  enter-from-class="[max-height:0] [opacity:0]"
                  enter-to-class="[max-height:300px] [opacity:1]"
                  leave-active-class="[transition:all_0.15s_ease-in] [overflow:hidden]"
                  leave-from-class="[max-height:300px] [opacity:1]"
                  leave-to-class="[max-height:0] [opacity:0]"
                >
                  <div
                    v-if="openGroups[item.group] && !collapsed"
                    class="[position:relative] [margin-top:2px] [margin-left:28px] [padding-left:12px] [padding-top:2px] [padding-bottom:2px] [display:flex] [flex-direction:column] [gap:1px] before:[content:''] before:[position:absolute] before:[left:0] before:[top:4px] before:[bottom:4px] before:[width:1px] before:[background:rgba(0,_0,_0,_0.08)]"
                  >
                    <router-link
                      v-for="child in item.children"
                      :key="child.path"
                      :to="child.path"
                      class="nav-child-item [display:flex] [align-items:center] [position:relative] [height:30px] [padding:0_10px] [border-radius:6px] [text-decoration:none] [font-size:12.5px] [color:#6e6e73] [transition:all_0.15s]"
                      :class="{
                        '[background:var(--app-primary-soft)] ![color:var(--app-primary)] ![font-weight:600]': isChildActive(child.path),
                        'hover:[background:rgba(0,_0,_0,_0.035)] hover:[color:#1d1d1f]': !isChildActive(child.path)
                      }"
                    >
                      <span class="[position:absolute] [left:-15px] [top:50%] [transform:translateY(-50%)] [width:6px] [height:6px] [border-radius:50%] [border:1px_solid_rgba(0,_0,_0,_0.12)] [background:#f6f6f8] [transition:all_0.15s]" :class="{ '![border-color:var(--app-primary)] ![background:var(--app-primary)]': isChildActive(child.path) }"></span>
                      <span class="[white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">{{ child.label }}</span>
                    </router-link>
                  </div>
                </transition>
              </div>
            </template>

            <div class="[height:1px] [background:rgba(0,_0,_0,_0.06)] [margin:10px_12px]"></div>

            <router-link
              to="/student/profile"
              class="nav-item [display:flex] [align-items:center] [gap:10px] [height:40px] [padding:0_12px] [border-radius:8px] [text-decoration:none] [font-size:13.5px] [font-weight:400] [color:#6e6e73] [transition:all_0.2s] [position:relative]"
              :class="{
                '[background:var(--app-primary-soft)] ![color:var(--app-primary)] ![font-weight:600] [&::before]:[content:\'\'] [&::before]:[position:absolute] [&::before]:[left:0] [&::before]:[top:50%] [&::before]:[transform:translateY(-50%)] [&::before]:[width:3px] [&::before]:[height:18px] [&::before]:[background:var(--app-primary)] [&::before]:[border-radius:0_3px_3px_0]': isItemActive('/student/profile'),
                'hover:[background:rgba(0,_0,_0,_0.04)] hover:[color:#1d1d1f]': !isItemActive('/student/profile')
              }"
            >
              <ui-icon class="[font-size:18px] [flex-shrink:0] [display:inline-flex] [align-items:center] [justify-content:center] [width:18px] [height:18px]"><Setting /></ui-icon>
              <span v-if="!collapsed" class="[white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">个人设置</span>
            </router-link>
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
        <div class="layout-aside mobile-aside [width:100%] [border-right:none]">
          <div class="logo-container">
            <img src="../../assets/logo.png" alt="Logo" class="logo" />
            <span class="logo-title">智能学习平台</span>
          </div>

          <ui-scrollbar class="menu-scrollbar">
            <nav class="[padding:8px] [display:flex] [flex-direction:column] [gap:2px]">
              <template v-for="item in menuItems" :key="item.path || item.group">
                <router-link
                  v-if="!item.children"
                  :to="item.path"
                  class="[display:flex] [align-items:center] [gap:10px] [height:40px] [padding:0_12px] [border-radius:8px] [text-decoration:none] [font-size:13.5px] [font-weight:400] [color:#6e6e73] [transition:all_0.2s]"
                  :class="{ '[background:var(--app-primary-soft)] ![color:var(--app-primary)] ![font-weight:600]': isItemActive(item.path), 'hover:[background:rgba(0,_0,_0,_0.04)]': !isItemActive(item.path) }"
                  @click="closeMobileMenu"
                >
                  <component :is="item.icon" class="[font-size:18px] [flex-shrink:0]" />
                  <span>{{ item.label }}</span>
                </router-link>

                <div v-else>
                  <UiButton
                    class="[display:flex] [align-items:center] [overflow:hidden] [font-size:13.5px] [font-weight:500] [transition:all_0.2s] [cursor:pointer] ![min-height:0] ![height:40px] ![width:100%] ![justify-content:flex-start] ![gap:10px] ![padding:0_12px] ![border-radius:8px] ![border:none] ![shadow:none]"
                    :class="getGroupButtonClass(item)"
                    @click="toggleGroup(item.group)"
                  >
                    <component :is="item.icon" class="[font-size:18px] [flex-shrink:0]" />
                    <span class="[flex:1] [text-align:left]">{{ item.label }}</span>
                    <svg class="[width:12px] [height:12px] [flex-shrink:0] [transition:transform_0.2s]" :class="{ '[transform:rotate(90deg)]': openGroups[item.group] }" viewBox="0 0 12 12" fill="none">
                      <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </UiButton>
                  <div
                    v-if="openGroups[item.group]"
                    class="[position:relative] [margin-top:2px] [margin-left:28px] [padding-left:12px] [padding-top:2px] [padding-bottom:2px] [display:flex] [flex-direction:column] [gap:1px] before:[content:''] before:[position:absolute] before:[left:0] before:[top:4px] before:[bottom:4px] before:[width:1px] before:[background:rgba(0,_0,_0,_0.08)]"
                  >
                    <router-link
                      v-for="child in item.children"
                      :key="child.path"
                      :to="child.path"
                      class="[display:flex] [align-items:center] [position:relative] [height:30px] [padding:0_10px] [border-radius:6px] [text-decoration:none] [font-size:12.5px] [color:#6e6e73] [transition:all_0.15s]"
                      :class="{ '[background:var(--app-primary-soft)] ![color:var(--app-primary)] ![font-weight:600]': isChildActive(child.path), 'hover:[background:rgba(0,_0,_0,_0.035)] hover:[color:#1d1d1f]': !isChildActive(child.path) }"
                      @click="closeMobileMenu"
                    >
                      <span class="[position:absolute] [left:-15px] [top:50%] [transform:translateY(-50%)] [width:6px] [height:6px] [border-radius:50%] [border:1px_solid_rgba(0,_0,_0,_0.12)] [background:#f6f6f8]" :class="{ '![border-color:var(--app-primary)] ![background:var(--app-primary)]': isChildActive(child.path) }"></span>
                      <span>{{ child.label }}</span>
                    </router-link>
                  </div>
                </div>
              </template>

              <div class="[height:1px] [background:rgba(0,_0,_0,_0.06)] [margin:10px_12px]"></div>

              <router-link
                to="/student/profile"
                class="[display:flex] [align-items:center] [gap:10px] [height:40px] [padding:0_12px] [border-radius:8px] [text-decoration:none] [font-size:13.5px] [font-weight:400] [color:#6e6e73] [transition:all_0.2s]"
                :class="{ '[background:var(--app-primary-soft)] ![color:var(--app-primary)] ![font-weight:600]': isItemActive('/student/profile') }"
                @click="closeMobileMenu"
              >
                <ui-icon class="[font-size:18px] [flex-shrink:0]"><Setting /></ui-icon>
                <span>个人设置</span>
              </router-link>
            </nav>
          </ui-scrollbar>
        </div>
      </ui-drawer>

      <ui-container class="layout-main student-layout-main [display:flex] [flex-direction:column] [flex:1_1_auto] [width:100%] [height:100%] [min-width:0] [min-height:0] [overflow:hidden] [background:#f8f9fa] [background:transparent]">
        <ui-header class="layout-header student-layout-header [position:relative] [z-index:80] [overflow:visible] [background:#fff] [display:flex] [align-items:center] [justify-content:space-between] [box-shadow:0_1px_2px_rgba(60,64,67,0.1)] [height:58px] [min-height:58px] [padding:8px_24px] [border-bottom:1px_solid_rgba(126,_157,_183,_0.14)] [gap:16px] [background:rgba(248,_251,_253,_0.86)] [backdrop-filter:blur(14px)] [flex-shrink:0]">
          <div class="header-left [display:flex] [align-items:center] [gap:12px] [min-width:0] [gap:14px]">
            <ui-icon class="fold-icon [display:inline-flex] [align-items:center] [justify-content:center] [width:36px] [height:36px] [flex:0_0_36px] [cursor:pointer] [font-size:20px] [color:#5f6368] [border-radius:8px] [transition:all_0.2s] hover:[background:#f1f3f4] hover:[color:#202124] [width:40px] [height:40px] [border-radius:14px] [color:#5d7288] [transition:all_0.2s_ease] hover:[background:rgba(18,_112,_216,_0.08)] hover:[color:#1270d8]" @click="toggleNavigation">
              <MenuIcon v-if="isMobile" />
              <Fold v-else />
            </ui-icon>
            <ui-breadcrumb separator="/">
              <ui-breadcrumb-item :to="{ path: '/student/dashboard' }">首页</ui-breadcrumb-item>
              <ui-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
                {{ item }}
              </ui-breadcrumb-item>
            </ui-breadcrumb>
          </div>

          <div class="header-right [display:flex] [align-items:center] [justify-content:flex-end] [gap:12px] [min-width:0] [gap:14px]">
            <ui-dropdown
              trigger="click"
              class="[z-index:90] [&>div:nth-child(2)]:![z-index:3000] [&>div:nth-child(2)]:![min-width:184px] [&>div:nth-child(2)]:![border-radius:14px] [&>div:nth-child(2)]:![border-color:rgba(126,_157,_183,_0.22)] [&>div:nth-child(2)]:![background:rgba(255,_255,_255,_0.98)] [&>div:nth-child(2)]:![box-shadow:0_18px_42px_rgba(22,_48,_79,_0.16)]"
              @command="handleCommand"
            >
              <div class="user-info [display:flex] [align-items:center] [cursor:pointer] [min-width:132px] [max-width:180px] [min-height:44px] [padding:4px_8px] [border-radius:8px] [transition:background_0.2s] [gap:8px] hover:[background:#f1f3f4] [gap:10px] [padding:6px_10px] [border-radius:16px] [background:rgba(255,_255,_255,_0.64)] [border:1px_solid_rgba(126,_157,_183,_0.14)] [flex-shrink:0] hover:[border-color:rgba(18,_112,_216,_0.28)] hover:[box-shadow:0_10px_24px_rgba(22,_48,_79,_0.08)]">
                <ui-avatar :size="34">
                  <img src="../../assets/User/Cat.jpg" alt="avatar" class="[width:100%] [height:100%] [object-fit:cover]" />
                </ui-avatar>
                <span class="username [min-width:0] [flex:1_1_auto] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [font-size:14px] [color:#202124] [font-weight:500] [color:#16324a] [font-size:13px] [font-weight:700]">{{ userInfo.name || '学生' }}</span>
                <ui-icon class="arrow-icon [font-size:12px] [color:#9aa0a6] [color:#8ca0b3]"><ArrowDown /></ui-icon>
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

        <ui-main class="layout-content student-layout-content [background:#f8f9fa] [padding:18px_24px] [min-width:0] [min-height:0] [flex:1_1_auto] [overflow-y:auto] [overflow-x:hidden] [position:relative]">
          <router-view v-slot="{ Component }">
            <transition name="page-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </ui-main>

        <ui-footer class="layout-footer student-layout-footer [text-align:center] [color:#8ca0b3] [padding:7px_16px] [font-size:12px] [line-height:18px] [background:transparent] [border-top:1px_solid_rgba(126,_157,_183,_0.12)] [flex-shrink:0]">
          智能学情分析与个性化实验能力提升平台 © 2025
        </ui-footer>
      </ui-container>
    </ui-container>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, reactive, watch } from 'vue'
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
  Menu as MenuIcon,
  SwitchButton
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
  expandedWidth: '240px',
  collapsedWidth: '64px'
})

const userInfo = computed(() => userStore.userInfo || {})

// ── Menu data ──────────────────────────────────────────────
const menuItems = [
  { path: '/student/dashboard', icon: HomeFilled, label: '首页' },
  {
    group: 'course', icon: Notebook, label: '课程学习',
    children: [
      { path: '/student/experiments', label: '实验列表' },
      { path: '/student/class-join', label: '教学班级' },
      { path: '/student/learning-analysis', label: '学情分析' }
    ]
  },
  {
    group: 'ai', icon: ChatDotRound, label: 'AI 智能助手',
    children: [
      { path: '/student/ai-assistant', label: 'AI 学习助手' },
      { path: '/student/ai-report', label: 'AI 报告生成' }
    ]
  },
  {
    group: 'practice', icon: Collection, label: '能力提升',
    children: [
      { path: '/student/practice', label: '推荐练习' },
      { path: '/student/leetcode-search', label: 'LeetCode 拓展' },
      { path: '/student/wrong-notebook', label: '错题本' },
      { path: '/student/weakness-training', label: '专项训练' }
    ]
  },
  {
    group: 'knowledge', icon: Connection, label: '知识体系',
    children: [
      { path: '/student/knowledge-graph', label: '我的学习图谱' }
    ]
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
    return '![border-color:rgba(var(--app-primary-rgb),_0.25)] ![background:rgba(var(--app-primary-rgb),_0.09)] ![color:var(--app-primary)]'
  }
  if (open) {
    return '![border-color:rgba(0,_0,_0,_0.08)] ![background:rgba(255,_255,_255,_0.75)] ![color:#1d1d1f]'
  }
  return '![border-color:rgba(0,_0,_0,_0.06)] ![background:rgba(255,_255,_255,_0.45)] ![color:#5f6368] hover:![border-color:rgba(0,_0,_0,_0.1)] hover:![background:rgba(255,_255,_255,_0.75)] hover:![color:#1d1d1f]'
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
  const pathMap = {
    dashboard: '首页',
    experiments: '实验列表',
    'experiment-detail': '实验详情',
    'learning-analysis': '学情分析',
    'ai-report': 'AI 报告生成',
    'ai-assistant': 'AI 学习助手',
    'class-join': '教学班级',
    practice: '推荐练习',
    'wrong-notebook': '错题本',
    'weakness-training': '专项训练',
    'ability-profile': '能力画像',
    'knowledge-learning': '我的学习图谱',
    'knowledge-graph': '我的学习图谱',
    'leetcode-search': 'LeetCode 拓展',
    'leetcode-practice': 'LeetCode 练习',
    profile: '个人设置'
  }
  const paths = route.path.split('/').filter(Boolean)
  return paths[0] === 'student' ? paths.slice(1).map((part) => pathMap[part] || part) : []
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

onMounted(() => {
  if (userStore.isLoggedIn) return
  router.push('/login')
  uiMessage.warning('请先登录')
})
</script>

<style scoped>
.student-layout-main {
  height: 100%;
  min-height: 0;
}

.student-layout-header {
  min-height: 58px !important;
  padding: 8px 24px !important;
}

.student-layout-content {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  padding: 18px 24px !important;
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
  padding: 7px 16px !important;
}

@media (max-width: 960px) {
  .student-layout-header {
    height: auto !important;
    min-height: 56px !important;
    padding: 10px 16px !important;
  }

  .student-layout-content {
    min-height: 0 !important;
    padding: 14px !important;
    overflow-y: auto !important;
  }
}
</style>
