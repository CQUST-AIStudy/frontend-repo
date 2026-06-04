import { createRouter, createWebHistory } from 'vue-router'
import { clearAuthStorage, getSessionToken, getUserInfo } from '../constants/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/student',
    name: 'StudentLayout',
    component: () => import('../views/student/Layout.vue'),
    meta: { requiredRole: 'student' },
    redirect: '/student/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: () => import('../views/student/Dashboard.vue')
      },
      {
        path: 'experiments',
        name: 'ExperimentList',
        component: () => import('../views/student/ExperimentList.vue')
      },
      {
        path: 'experiment-detail/:id',
        name: 'ExperimentDetail',
        component: () => import('../views/student/ExperimentDetail.vue')
      },
      {
        path: 'learning-analysis',
        name: 'LearningAnalysis',
        component: () => import('../views/student/LearningAnalysis.vue')
      },
      {
        path: 'ai-assistant',
        name: 'AIAssistant',
        component: () => import('../views/student/AIAssistant.vue')
      },
      {
        path: 'class-join',
        name: 'StudentClassJoin',
        component: () => import('../views/student/ClassJoin.vue')
      },
      {
        path: 'ai-report',
        name: 'AIReport',
        component: () => import('../views/student/AIReport.vue')
      },
      {
        path: 'practice',
        name: 'Practice',
        component: () => import('../views/student/Practice.vue')
      },
      {
        path: 'leetcode-search',
        name: 'LeetCodeSearch',
        component: () => import('../views/student/LeetCodeSearch.vue')
      },
      {
        path: 'weakness-training',
        name: 'WeaknessTraining',
        component: () => import('../views/student/WeaknessTraining.vue')
      },
      {
        path: 'leetcode-practice/:id',
        name: 'LeetCodePractice',
        component: () => import('../views/student/LeetCodePractice.vue')
      },
      {
        path: 'leetcode-demo',
        name: 'LeetCodeDemo',
        component: () => import('../views/student/LeetCodeDemo.vue')
      },
      {
        path: 'ability-profile',
        name: 'AbilityProfile',
        component: () => import('../views/student/AbilityProfile.vue')
      },
      {
        path: 'profile',
        name: 'StudentProfile',
        component: () => import('../views/student/Profile.vue')
      }
    ]
  },
  {
    path: '/teacher/select-class',
    name: 'ClassSelector',
    meta: { requiredRole: 'teacher' },
    component: () => import('../views/teacher/ClassSelector.vue')
  },
  {
    path: '/teacher',
    name: 'TeacherLayout',
    component: () => import('../views/teacher/Layout.vue'),
    meta: { requiredRole: 'teacher' },
    redirect: '/teacher/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('../views/teacher/Dashboard.vue')
      },
      {
        path: 'experiments',
        name: 'TeacherExperimentList',
        component: () => import('../views/teacher/ExperimentList.vue')
      },
      {
        path: 'experiment-detail/:id',
        name: 'TeacherExperimentDetail',
        component: () => import('../views/teacher/ExperimentDetail.vue')
      },
      {
        path: 'experiment-create',
        name: 'ExperimentCreate',
        component: () => import('../views/teacher/ExperimentCreate.vue')
      },
      {
        path: 'class-list',
        name: 'ClassList',
        component: () => import('../views/teacher/ClassList.vue')
      },
      {
        path: 'class-analysis/:id?',
        name: 'ClassAnalysis',
        component: () => import('../views/teacher/ClassDetailedAnalysis.vue')
      },
      {
        path: 'class-detailed-analysis/:classId?',
        name: 'ClassDetailedAnalysis',
        component: () => import('../views/teacher/ClassDetailedAnalysis.vue')
      },
      {
        path: 'submissions/:experimentId?',
        name: 'SubmissionList',
        component: () => import('../views/teacher/SubmissionList.vue')
      },
      {
        path: 'submission-detail/:id',
        name: 'SubmissionDetail',
        component: () => import('../views/teacher/SubmissionDetail.vue')
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: () => import('../views/teacher/Profile.vue')
      },
      // 基础 AI 功能
      {
        path: 'ai-recommendation',
        name: 'AIRecommendation',
        component: () => import('../views/teacher/AIRecommendation.vue')
      },
      {
        path: 'generate-ppt',
        name: 'GeneratePPT',
        component: () => import('../views/teacher/GeneratePPT.vue')
      },
      // 课程负责人路由
      {
        path: 'course-analysis',
        name: 'CourseAnalysis',
        component: () => import('../views/teacher/CourseAnalysis.vue'),
        meta: { requiredPermissions: ['view_course_classes', 'analyze_course_classes'] }
      },
      // 系主任路由
      {
        path: 'department-teachers',
        name: 'DepartmentTeachers',
        component: () => import('../views/teacher/DepartmentTeachers.vue'),
        meta: { requiredPermissions: ['view_all_teachers'] }
      },
      {
        path: 'department-analytics',
        name: 'DepartmentAnalytics',
        component: () => import('../views/teacher/DepartmentAnalytics.vue'),
        meta: { requiredPermissions: ['analyze_all_classes'] }
      },
      // 系主任特殊 AI 管理功能
      {
        path: 'teacher-ai-management',
        name: 'TeacherAIManagement',
        component: () => import('../views/teacher/TeacherAIManagement.vue'),
        meta: { requiredPermissions: ['manage_teacher_ai'] }
      },
      // 班级能力画像
      {
        path: 'class-profile',
        name: 'ClassProfile',
        component: () => import('../views/teacher/ClassProfile.vue')
      },
      // 教辅工具 (tap-backend)
      {
        path: 'document-center',
        name: 'DocumentCenter',
        component: () => import('../views/teacher/DocumentCenter.vue')
      },
      {
        path: 'bilingual-read',
        name: 'BilingualRead',
        component: () => import('../views/teacher/BilingualRead.vue')
      },
      {
        path: 'summary-card',
        name: 'SummaryCard',
        component: () => import('../views/teacher/SummaryCard.vue')
      },
      {
        path: 'ai-chat',
        name: 'TeacherAIChat',
        component: () => import('../views/teacher/AIChat.vue')
      },
      {
        path: 'ai-organize',
        name: 'AIOrganize',
        component: () => import('../views/teacher/AIOrganize.vue')
      },
      // AI批改模块
      {
        path: 'grading',
        name: 'GradingCenter',
        component: () => import('../views/teacher/GradingCenter.vue')
      },
      {
        path: 'grading/detail/:id',
        name: 'GradingDetail',
        component: () => import('../views/teacher/GradingDetail.vue')
      },
      {
        path: 'grading/submission/:id',
        name: 'SubmissionReview',
        component: () => import('../views/teacher/SubmissionReview.vue')
      },
      {
        path: 'grading/rubrics',
        name: 'RubricEditor',
        component: () => import('../views/teacher/RubricEditor.vue')
      },
      // 课程知识库（RAG）
      {
        path: 'knowledge-base',
        name: 'KnowledgeBase',
        component: () => import('../views/teacher/KnowledgeBase.vue')
      },
      {
        path: 'rag-analytics',
        name: 'RagAnalytics',
        component: () => import('../views/teacher/RagAnalytics.vue')
      },
      // 实验数据分析
      {
        path: 'experiment-analytics',
        name: 'ExperimentAnalytics',
        component: () => import('../views/teacher/ExperimentAnalytics.vue')
      },
      // PTA 数据同步
      {
        path: 'data-sync',
        name: 'DataSync',
        component: () => import('../views/teacher/DataSyncPanel.vue')
      },
      {
        path: 'leetcode-bank',
        name: 'LeetCodeBank',
        component: () => import('../views/teacher/LeetCodeBank.vue')
      }
    ]
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../views/admin/Layout.vue'),
    meta: { requiredRole: 'admin' },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagement.vue')
      },
      {
        path: 'class-management',
        name: 'ClassManagement',
        component: () => import('../views/admin/ClassManagement.vue')
      },
      {
        path: 'experiment-management',
        name: 'ExperimentManagement',
        component: () => import('../views/admin/ExperimentManagement.vue')
      },
      {
        path: 'system-log',
        name: 'SystemLog',
        component: () => import('../views/admin/SystemLog.vue')
      },
      {
        path: 'leetcode-claw',
        name: 'LeetCodeClawStatus',
        component: () => import('../views/admin/LeetCodeClawStatus.vue')
      },
      {
        path: 'profile',
        name: 'AdminProfile',
        component: () => import('../views/admin/Profile.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const TEACHER_CLASS_SELECTOR_PATH = '/teacher/select-class'
const teacherRoutesWithoutSelectedClass = new Set(['/teacher/class-list', '/teacher/profile', '/teacher/leetcode-bank'])

function getPersistedSelectedClass() {
  try {
    const userStr = localStorage.getItem('user')
    const parsed = userStr ? JSON.parse(userStr) : null
    return parsed?.selectedClass || null
  } catch {
    return null
  }
}

function getRoleHomePath(role) {
  if (role === 'teacher') {
    return getPersistedSelectedClass() ? '/teacher/dashboard' : TEACHER_CLASS_SELECTOR_PATH
  }
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'student') return '/student/dashboard'
  return '/login'
}

function hasAllPermissions(requiredPermissions, userPermissions) {
  return requiredPermissions.every(p => userPermissions.includes(p))
}

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isLoginPage = to.path === '/login'
  const token = getSessionToken()
  const userInfo = getUserInfo()
  const userRole = userInfo?.role

  if (!token) {
    if (isLoginPage) {
      next()
      return
    }
    next('/login')
    return
  }

  if (isLoginPage) {
    const targetPath = getRoleHomePath(userRole)
    if (targetPath === '/login') {
      clearAuthStorage()
      next()
      return
    }
    next(targetPath)
    return
  }

  if (!userRole) {
    clearAuthStorage()
    next('/login')
    return
  }

  if (to.meta.requiredRole && userRole !== to.meta.requiredRole) {
    next(getRoleHomePath(userRole))
    return
  }

  if (userRole === 'teacher' && to.path.startsWith('/teacher/') && to.path !== TEACHER_CLASS_SELECTOR_PATH) {
    const selectedClass = getPersistedSelectedClass()
    if (!selectedClass && !teacherRoutesWithoutSelectedClass.has(to.path)) {
      next(TEACHER_CLASS_SELECTOR_PATH)
      return
    }
  }

  if (to.meta.requiredPermissions) {
    const userPermissions = userInfo?.permissions || []
    if (!hasAllPermissions(to.meta.requiredPermissions, userPermissions)) {
      next('/teacher/dashboard')
      return
    }
  }

  next()
})

export default router


