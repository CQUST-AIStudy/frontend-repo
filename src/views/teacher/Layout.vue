<template>
  <div class="teacher-layout [min-height:100vh] [min-height:100dvh] [overflow-x:hidden]">
    <el-container class="layout-container [min-height:100vh] [min-height:100dvh]">
      <el-aside v-if="!isMobile" :width="asideWidth" class="layout-aside [display:flex] [flex-direction:column] [height:100vh] [height:100dvh] [overflow:hidden] [border-right:1px_solid_rgba(126,_157,_183,_0.14)] [background:linear-gradient(180deg,_rgba(12,_31,_50,_0.94),_rgba(16,_49,_77,_0.92)),_radial-gradient(circle_at_top_left,_rgba(44,_181,_160,_0.16),_transparent_32%)] [box-shadow:inset_-1px_0_0_rgba(255,_255,_255,_0.04)] [transition:width_0.28s_ease]">
        <div class="logo-container [display:flex] [align-items:center] [gap:14px] [height:74px] [padding:0_18px] [border-bottom:1px_solid_rgba(255,_255,_255,_0.08)]">
          <img src="../../assets/logo.png" alt="Logo" class="logo [width:42px] [height:42px] [border-radius:14px] [border:1px_solid_rgba(130,_220,_255,_0.18)] [box-shadow:0_10px_24px_rgba(10,_30,_50,_0.28)]" />
          <transition name="fade-text">
            <div v-if="!collapsed" class="brand-copy [display:flex] [flex-direction:column] [gap:2px]">
              <span class="logo-kicker [color:rgba(173,_222,_255,_0.7)] [font-size:11px] [letter-spacing:0] [text-transform:uppercase]">教师工作台</span>
              <span class="logo-title [color:#f3f8fc] [font-size:16px] [font-weight:700]">智能教学平台</span>
            </div>
          </transition>
        </div>

        <div class="menu-scroll-area [flex:1] [min-height:0] [overflow:hidden] [padding:10px_8px_16px] [&_.el-scrollbar]:[height:100%] [&_.el-scrollbar__wrap]:[overflow-x:hidden]">
          <el-scrollbar>
            <el-menu
              :default-active="activeMenu"
              class="layout-menu [border-right:none] ![background:transparent] [--el-menu-bg-color:transparent] [--el-menu-text-color:rgba(222,_236,_248,_0.7)] [--el-menu-active-color:#ffffff] [--el-menu-hover-bg-color:rgba(255,_255,_255,_0.08)] [--el-menu-hover-text-color:#ffffff] [padding:0] [&_.el-menu-item]:[height:46px] [&_.el-menu-item]:[line-height:46px] [&_.el-menu-item]:[margin:4px_0] [&_.el-menu-item]:[border-radius:16px] [&_.el-menu-item]:[font-size:13px] [&_.el-menu-item]:[transition:all_0.22s_ease] [&_.el-sub-menu__title]:[height:46px] [&_.el-sub-menu__title]:[line-height:46px] [&_.el-sub-menu__title]:[margin:4px_0] [&_.el-sub-menu__title]:[border-radius:16px] [&_.el-sub-menu__title]:[font-size:13px] [&_.el-sub-menu__title]:[transition:all_0.22s_ease] [&_.el-menu-item.is-active]:![background:linear-gradient(135deg,_rgba(20,_114,_219,_0.92),_rgba(43,_181,_160,_0.88))] [&_.el-menu-item.is-active]:[box-shadow:0_14px_26px_rgba(18,_112,_216,_0.2)] [&_.el-menu-item:hover]:![background:rgba(255,_255,_255,_0.08)] [&_.el-sub-menu__title:hover]:![background:rgba(255,_255,_255,_0.08)] [&_.el-sub-menu_.el-menu]:![background:transparent] [&_.el-sub-menu_.el-menu_.el-menu-item]:[margin-left:12px] [&_.el-sub-menu_.el-menu_.el-menu-item]:![padding-left:42px] [&_.el-sub-menu_.el-menu_.el-menu-item]:[height:40px] [&_.el-sub-menu_.el-menu_.el-menu-item]:[line-height:40px] [&_.el-sub-menu_.el-menu_.el-menu-item]:[border-radius:14px] [&_.el-sub-menu_.el-menu_.el-menu-item]:[font-size:12px] [&_.el-icon]:[font-size:18px]"
              :collapse="collapsed"
              router
              :collapse-transition="false"
            >
              <el-menu-item index="/teacher/dashboard">
                <el-icon><HomeFilled /></el-icon>
                <template #title>首页总览</template>
              </el-menu-item>

              <el-sub-menu index="class-group">
                <template #title>
                  <el-icon><UserFilled /></el-icon>
                  <span>教学班管理</span>
                </template>
                <el-menu-item index="/teacher/class-list">教学班列表</el-menu-item>
                <el-menu-item index="/teacher/class-analysis">教学班分析</el-menu-item>
                <el-menu-item index="/teacher/class-profile">能力画像</el-menu-item>
              </el-sub-menu>

              <el-sub-menu index="teaching-group">
                <template #title>
                  <el-icon><Notebook /></el-icon>
                  <span>实验教学</span>
                </template>
                <el-menu-item index="/teacher/experiments">实验列表</el-menu-item>
                <el-menu-item index="/teacher/experiment-create">创建实验</el-menu-item>
                <el-menu-item index="/teacher/submissions">学生提交</el-menu-item>
                <el-menu-item index="/teacher/experiment-analytics">实验数据分析</el-menu-item>
                <el-menu-item index="/teacher/data-sync">PTA 数据同步</el-menu-item>
              </el-sub-menu>

              <el-sub-menu index="grading-group">
                <template #title>
                  <el-icon><DocumentChecked /></el-icon>
                  <span>AI 批改</span>
                </template>
                <el-menu-item index="/teacher/grading">批改中心</el-menu-item>
                <el-menu-item index="/teacher/grading/rubrics">评分标准</el-menu-item>
              </el-sub-menu>

              <el-sub-menu index="rag-group">
                <template #title>
                  <el-icon><Collection /></el-icon>
                  <span>课程知识库</span>
                </template>
                <el-menu-item index="/teacher/knowledge-base">空间与文档</el-menu-item>
                <el-menu-item index="/teacher/rag-analytics">RAG 分析</el-menu-item>
              </el-sub-menu>

              <el-sub-menu index="ai-group">
                <template #title>
                  <el-icon><ChatDotRound /></el-icon>
                  <span>AI 助教</span>
                </template>
                <el-menu-item index="/teacher/ai-chat">AI 对话</el-menu-item>
                <el-menu-item index="/teacher/class-detailed-analysis">教学建议</el-menu-item>
              </el-sub-menu>

              <el-sub-menu index="tools-group">
                <template #title>
                  <el-icon><Briefcase /></el-icon>
                  <span>教辅工具</span>
                </template>
                <el-menu-item index="/teacher/document-center">文档中心</el-menu-item>
                <el-menu-item index="/teacher/bilingual-read">双语阅读</el-menu-item>
                <el-menu-item index="/teacher/summary-card">AI 精读</el-menu-item>
                <el-menu-item index="/teacher/ai-organize">智能整理</el-menu-item>
              </el-sub-menu>

              <el-menu-item
                v-if="hasPermission(['view_course_classes', 'analyze_course_classes'])"
                index="/teacher/course-analysis"
              >
                <el-icon><DataAnalysis /></el-icon>
                <template #title>课程分析</template>
              </el-menu-item>

              <el-sub-menu v-if="hasPermission(['view_all_teachers'])" index="dept-group">
                <template #title>
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>院系管理</span>
                </template>
                <el-menu-item index="/teacher/department-teachers">教师管理</el-menu-item>
                <el-menu-item v-if="hasPermission(['analyze_all_classes'])" index="/teacher/department-analytics">
                  院系统计
                </el-menu-item>
                <el-menu-item v-if="hasPermission(['manage_teacher_ai'])" index="/teacher/teacher-ai-management">
                  AI 管理
                </el-menu-item>
              </el-sub-menu>

              <div class="menu-divider [height:1px] [background:rgba(255,255,255,0.06)] [margin:8px_12px] [background:rgba(255,_255,_255,_0.06)] [margin:10px_12px] [background:rgba(255,_255,_255,_0.08)]"></div>

              <el-menu-item index="/teacher/profile">
                <el-icon><Setting /></el-icon>
                <template #title>个人设置</template>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
        </div>
      </el-aside>

      <el-drawer
        v-model="mobileMenuVisible"
        direction="ltr"
        size="300px"
        :with-header="false"
        class="layout-drawer"
      >
        <div class="layout-aside mobile-aside [width:100%] [border-right:none]">
          <div class="logo-container">
            <img src="../../assets/logo.png" alt="Logo" class="logo" />
            <div class="brand-copy">
              <span class="logo-kicker">教师工作台</span>
              <span class="logo-title">智能教学平台</span>
            </div>
          </div>

          <div class="menu-scroll-area">
            <el-scrollbar>
              <el-menu
                :default-active="activeMenu"
                class="layout-menu"
                router
                :collapse-transition="false"
                @select="closeMobileMenu"
              >
                <el-menu-item index="/teacher/dashboard">
                  <el-icon><HomeFilled /></el-icon>
                  <template #title>首页总览</template>
                </el-menu-item>

                <el-sub-menu index="class-group">
                  <template #title>
                    <el-icon><UserFilled /></el-icon>
                    <span>教学班管理</span>
                  </template>
                  <el-menu-item index="/teacher/class-list">教学班列表</el-menu-item>
                  <el-menu-item index="/teacher/class-analysis">教学班分析</el-menu-item>
                  <el-menu-item index="/teacher/class-profile">能力画像</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="teaching-group">
                  <template #title>
                    <el-icon><Notebook /></el-icon>
                    <span>实验教学</span>
                  </template>
                  <el-menu-item index="/teacher/experiments">实验列表</el-menu-item>
                  <el-menu-item index="/teacher/experiment-create">创建实验</el-menu-item>
                  <el-menu-item index="/teacher/submissions">学生提交</el-menu-item>
                  <el-menu-item index="/teacher/experiment-analytics">实验数据分析</el-menu-item>
                  <el-menu-item index="/teacher/data-sync">PTA 数据同步</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="grading-group">
                  <template #title>
                    <el-icon><DocumentChecked /></el-icon>
                    <span>AI 批改</span>
                  </template>
                  <el-menu-item index="/teacher/grading">批改中心</el-menu-item>
                  <el-menu-item index="/teacher/grading/rubrics">评分标准</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="rag-group">
                  <template #title>
                    <el-icon><Collection /></el-icon>
                    <span>课程知识库</span>
                  </template>
                  <el-menu-item index="/teacher/knowledge-base">空间与文档</el-menu-item>
                  <el-menu-item index="/teacher/rag-analytics">RAG 分析</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="ai-group">
                  <template #title>
                    <el-icon><ChatDotRound /></el-icon>
                    <span>AI 助教</span>
                  </template>
                  <el-menu-item index="/teacher/ai-chat">AI 对话</el-menu-item>
                  <el-menu-item index="/teacher/class-detailed-analysis">教学建议</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="tools-group">
                  <template #title>
                    <el-icon><Briefcase /></el-icon>
                    <span>教辅工具</span>
                  </template>
                  <el-menu-item index="/teacher/document-center">文档中心</el-menu-item>
                  <el-menu-item index="/teacher/bilingual-read">双语阅读</el-menu-item>
                  <el-menu-item index="/teacher/summary-card">AI 精读</el-menu-item>
                  <el-menu-item index="/teacher/ai-organize">智能整理</el-menu-item>
                </el-sub-menu>

                <el-menu-item
                  v-if="hasPermission(['view_course_classes', 'analyze_course_classes'])"
                  index="/teacher/course-analysis"
                >
                  <el-icon><DataAnalysis /></el-icon>
                  <template #title>课程分析</template>
                </el-menu-item>

                <el-sub-menu v-if="hasPermission(['view_all_teachers'])" index="dept-group">
                  <template #title>
                    <el-icon><OfficeBuilding /></el-icon>
                    <span>院系管理</span>
                  </template>
                  <el-menu-item index="/teacher/department-teachers">教师管理</el-menu-item>
                  <el-menu-item v-if="hasPermission(['analyze_all_classes'])" index="/teacher/department-analytics">
                    院系统计
                  </el-menu-item>
                  <el-menu-item v-if="hasPermission(['manage_teacher_ai'])" index="/teacher/teacher-ai-management">
                    AI 管理
                  </el-menu-item>
                </el-sub-menu>

                <div class="menu-divider [height:1px] [background:rgba(255,255,255,0.06)] [margin:8px_12px] [background:rgba(255,_255,_255,_0.06)] [margin:10px_12px] [background:rgba(255,_255,_255,_0.08)]"></div>

                <el-menu-item index="/teacher/profile">
                  <el-icon><Setting /></el-icon>
                  <template #title>个人设置</template>
                </el-menu-item>
              </el-menu>
            </el-scrollbar>
          </div>
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

            <div class="header-path [min-width:0] [padding:10px_14px] [border-radius:16px] [background:rgba(255,_255,_255,_0.64)] [border:1px_solid_rgba(126,_157,_183,_0.14)]">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/teacher/dashboard' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
                  {{ item }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </div>
          </div>

          <div class="header-right [display:flex] [align-items:center] [justify-content:flex-end] [gap:12px] [min-width:0] [gap:14px]">
            <div v-if="selectedClassName" class="class-indicator [display:inline-flex] [align-items:center] [gap:8px] [min-height:40px] [padding:0_14px] [border-radius:999px] [background:linear-gradient(135deg,_rgba(18,_112,_216,_0.12),_rgba(44,_181,_160,_0.1))] [color:#1270d8] [font-size:13px] [font-weight:700] [cursor:pointer] [max-width:min(280px,_32vw)]" @click="switchClass">
              <el-icon><School /></el-icon>
              <span>{{ selectedClassName }}</span>
              <el-icon :size="12"><ArrowDown /></el-icon>
            </div>

            <span class="teacher-level-badge [min-height:34px] [padding:0_12px] [border-radius:999px] [display:inline-flex] [align-items:center] [font-size:12px] [font-weight:700]" :class="teacherLevelClass">{{ teacherLevelText }}</span>

            <el-tooltip content="全屏" placement="bottom">
              <el-icon class="header-icon [display:inline-flex] [align-items:center] [justify-content:center] [width:36px] [height:36px] [flex:0_0_36px] [cursor:pointer] [font-size:18px] [color:#5f6368] [border-radius:8px] [transition:all_0.2s] hover:[background:#f1f3f4] hover:[color:#202124] [width:40px] [height:40px] [border-radius:14px] [color:#5d7288] [transition:all_0.2s_ease] hover:[background:rgba(18,_112,_216,_0.08)] hover:[color:#1270d8]" @click="toggleFullScreen"><FullScreen /></el-icon>
            </el-tooltip>

            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info [display:flex] [align-items:center] [cursor:pointer] [padding:4px_8px] [border-radius:8px] [transition:background_0.2s] [gap:8px] hover:[background:#f1f3f4] [gap:10px] [padding:6px_10px] [border-radius:16px] [background:rgba(255,_255,_255,_0.64)] [border:1px_solid_rgba(126,_157,_183,_0.14)] [flex-shrink:0]">
                <el-avatar :size="34" :src="userInfo.avatar">
                  <span>{{ (userInfo.name || '教').slice(0, 1) }}</span>
                </el-avatar>
                <div v-if="!isMobile && !collapsed" class="user-copy [display:flex] [flex-direction:column] [gap:2px]">
                  <span class="username [font-size:14px] [color:#202124] [font-weight:500] [color:#16324a] [font-size:13px] [font-weight:700]">{{ userInfo.name || '教师用户' }}</span>
                  <span class="user-subtitle [color:#7f92a6] [font-size:11px]">课程教学工作台</span>
                </div>
                <el-icon class="arrow-icon [font-size:12px] [color:#9aa0a6] [color:#8ca0b3]"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="switchClass">
                    <el-icon><School /></el-icon>
                    切换教学班
                  </el-dropdown-item>
                  <el-dropdown-item command="profile">
                    <el-icon><Setting /></el-icon>
                    个人信息
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
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
          智能学情分析与个性化实验能力提升平台 · 教师工作空间
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
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
} from '@element-plus/icons-vue'
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
  const map = {
    department_head: '系主任',
    course_leader: '课程负责人'
  }
  return map[teacherLevel.value] || '教师'
})
const teacherLevelClass = computed(() => `level-${teacherLevel.value}`)

function hasPermission(permissions) {
  const userPermissions = userInfo.value?.permissions || []
  return permissions.some((permission) => userPermissions.includes(permission))
}

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const pathMap = {
    dashboard: '首页总览',
    experiments: '实验列表',
    'experiment-detail': '实验详情',
    'experiment-create': '创建实验',
    submissions: '学生提交',
    'submission-detail': '提交详情',
    'class-list': '教学班列表',
    'class-analysis': '教学班分析',
    'class-profile': '能力画像',
    profile: '个人设置',
    'document-center': '文档中心',
    'bilingual-read': '双语阅读',
    'summary-card': 'AI 精读',
    'ai-chat': 'AI 对话',
    'ai-organize': '智能整理',
    grading: 'AI 批改',
    'knowledge-base': '课程知识库',
    'rag-analytics': 'RAG 分析',
    'course-analysis': '课程分析',
    'department-teachers': '教师管理',
    'department-analytics': '院系统计',
    'teacher-ai-management': 'AI 管理',
    'ai-recommendation': '教学建议',
    'experiment-analytics': '实验数据分析',
    'data-sync': 'PTA 数据同步'
  }
  const paths = route.path.split('/').filter(Boolean)
  return paths[0] === 'teacher' ? paths.slice(1).map((part) => pathMap[part] || part) : []
})

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    return
  }
  document.exitFullscreen?.()
}

function switchClass() {
  userStore.setSelectedClass(null)
  router.push('/teacher/select-class')
}

function handleCommand(command) {
  if (command === 'profile') {
    router.push('/teacher/profile')
    return
  }
  if (command === 'switchClass') {
    switchClass()
    return
  }
  if (command !== 'logout') return

  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    sessionStorage.clear()
    clearAuthStorage()
    router.push('/login')
  }).catch(() => {})
}

onMounted(() => {
  const canOpenWithoutClass = route.path === '/teacher/class-list' || route.path === '/teacher/profile'
  if (!userStore.selectedClass && !canOpenWithoutClass) {
    router.replace('/teacher/select-class')
    return
  }

  if (userInfo.value.role && userInfo.value.role !== 'teacher') {
    ElMessageBox.alert('当前账号没有教师权限，请重新登录。', '权限错误', {
      confirmButtonText: '确定',
      callback: () => {
        clearAuthStorage()
        router.push('/login')
      }
    })
  }
})
</script>


