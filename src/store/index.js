import logger from '@/utils/logger'
import { defineStore } from 'pinia'
import api from '../api'
import { clearAuthStorage, getTapToken, setSessionToken, setTapToken, setTapUser, setUserInfo } from '../constants/auth'
import { getTeacherPermissions } from '../constants/teacherPermissions'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../utils/errorMessage'
import { MOCK_USERS, MOCK_TAP_TOKEN, MOCK_TOKEN } from '../constants/mockUsers'

// Mock 数据仅在显式声明 VUE_APP_USE_MOCK_DATA=true 且非生产构建时启用。
// 生产构建(.env.production)强制为 false；即便环境误注入 true，运行环境守卫也会拦截。
const USE_MOCK_DATA = process.env.VUE_APP_USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'production'

function normalizeUserInfo(userInfo, teacherLevel) {
  const normalized = { ...(userInfo || {}) }
  const role = String(normalized.role || '').toLowerCase()
  if (role) normalized.role = role

  if (role === 'teacher' && !Array.isArray(normalized.permissions)) {
    const level = normalized.level || teacherLevel || 'normal'
    normalized.level = level
    normalized.permissions = getTeacherPermissions(level)
  }

  return normalized
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    userInfo: null,
    loading: false,
    selectedClass: null,
  }),
  persist: {
    key: 'user',
    storage: localStorage,
    paths: ['token', 'userInfo', 'selectedClass']
  },
  actions: {
    async login(username, password, teacherLevel) {
      this.loading = true
      try {
        // Mock 模式：不调用任何真实登录 API，直接构造假用户并写入状态与存储。
        // 触发条件：构建期注入 VUE_APP_USE_MOCK_DATA=true。
        if (USE_MOCK_DATA) {
          const role = (teacherLevel || 'student').toLowerCase()
          const rawUserInfo = MOCK_USERS[role] || MOCK_USERS.student
          const userInfo = normalizeUserInfo(rawUserInfo, teacherLevel)

          this.userInfo = userInfo
          this.token = MOCK_TOKEN

          setSessionToken(this.token)
          setUserInfo(this.userInfo)
          // 写入假 TAP token / TAP user，使 getTapToken() 非空，跳过 restoreTapSession() 真实换票。
          setTapToken(MOCK_TAP_TOKEN)
          setTapUser({ userId: rawUserInfo.id, role: rawUserInfo.role, username: rawUserInfo.username })

          return { success: true, message: '登录成功（mock）', user: userInfo }
        }

        const res = await api.login(username, password, teacherLevel)
        if (!(res && res.success)) {
          return { success: false, message: getFriendlyResponseMessage(res, '用户名或密码不正确，请检查后重试'), details: res }
        }

        const rawUserInfo = res.user || res.userInfo
        if (!rawUserInfo) {
          return { success: false, message: '登录过程中出现问题，请稍后重试' }
        }
        const userInfo = normalizeUserInfo(rawUserInfo, teacherLevel)

        this.userInfo = userInfo
        this.token = res.token || 'legacy_session'

        setSessionToken(this.token)
        setUserInfo(this.userInfo)

        if (!getTapToken()) {
          try {
            const { restoreTapSession } = await import('../api/tap')
            await restoreTapSession()
          } catch (error) {
            logger.warn('TAP session 换票失败:', error.message)
          }
        }

        return { success: true, message: res.message || '登录成功', user: userInfo }
      } catch (error) {
        logger.error('登录过程中发生错误', error)
        return { success: false, message: getFriendlyErrorMessage(error, '登录失败，请稍后重试') }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.resetAuthState({ clearStorage: true })
    },

    resetAuthState({ clearStorage = false } = {}) {
      this.token = null
      this.userInfo = null
      this.selectedClass = null
      if (clearStorage) {
        clearAuthStorage()
      }
    },

    updateUserInfo(patch = {}) {
      this.userInfo = {
        ...(this.userInfo || {}),
        ...patch
      }
      setUserInfo(this.userInfo)
    },

    setSelectedClass(cls) {
      this.selectedClass = cls
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.name || state.userInfo?.username || '未登录',
    currentClassName: (state) => state.selectedClass?.name || ''
  }
})

export const useExperimentStore = defineStore('experiment', {
  state: () => ({
    experimentList: [],
    currentExperiment: null,
    loading: false,
    generatingReport: false,
    experimentCache: new Map()
  }),
  actions: {
    async fetchExperimentList() {
      this.loading = true
      try {
        const response = await api.getExperimentList()
        if (response?.data && Array.isArray(response.data)) {
          this.experimentList = response.data
        } else if (Array.isArray(response)) {
          this.experimentList = response
        } else {
          this.experimentList = []
        }
      } catch (error) {
        logger.error('获取实验列表失败:', error)
        this.experimentList = []
      } finally {
        this.loading = false
      }
    },

    async fetchExperimentDetail(id) {
      if (this.experimentCache.has(id)) {
        this.currentExperiment = this.experimentCache.get(id)
        return this.currentExperiment
      }

      this.loading = true
      try {
        const response = await api.getExperimentDetails(id)
        this.currentExperiment = response?.data || response || null
        if (this.currentExperiment) {
          this.experimentCache.set(id, this.currentExperiment)
        }
        return this.currentExperiment
      } catch (error) {
        logger.error(`获取实验 ${id} 详情失败:`, error)
        return null
      } finally {
        this.loading = false
      }
    },

    getExperimentDetailsById(id) {
      return this.experimentCache.get(id)
    },

    applyExperimentReport(experimentId, report, data = {}) {
      const experimentIndex = this.experimentList.findIndex(exp => String(exp.id) === String(experimentId))
      if (experimentIndex !== -1) {
        this.experimentList[experimentIndex] = {
          ...this.experimentList[experimentIndex],
          report,
          reportData: data
        }
      }

      if (this.currentExperiment && String(this.currentExperiment.id) === String(experimentId)) {
        this.currentExperiment = {
          ...this.currentExperiment,
          report,
          reportData: data
        }
      }

      if (this.experimentCache.has(experimentId)) {
        const cached = this.experimentCache.get(experimentId)
        this.experimentCache.set(experimentId, {
          ...cached,
          report,
          reportData: data
        })
      }
    },

    normalizeReportResponse(response) {
      if (response?.success === false) {
        return {
          success: false,
          message: response.message || 'AI 报告生成失败',
          report: '',
          data: null
        }
      }

      const data = response?.data || {}
      const report = response?.report || data.report || ''
      return {
        success: true,
        message: response?.message || '',
        report,
        data
      }
    },

    async fetchExperimentReport(experimentId) {
      try {
        const response = await api.getExperimentReport(experimentId)
        const result = this.normalizeReportResponse(response)
        if (result.success && result.report) {
          this.applyExperimentReport(experimentId, result.report, result.data)
        }
        return result
      } catch (error) {
        logger.error(`获取实验 ${experimentId} 报告失败:`, error)
        return {
          success: false,
          message: getFriendlyErrorMessage(error, '获取报告失败'),
          report: '',
          data: null
        }
      }
    },

    async generateAIReport(experimentId, userData) {
      this.generatingReport = true
      try {
        const response = await api.generateExperimentReport(experimentId, userData)
        const result = this.normalizeReportResponse(response)
        if (result.success && result.report) {
          this.applyExperimentReport(experimentId, result.report, result.data)
        }
        return result
      } catch (error) {
        logger.error(`生成实验 ${experimentId} 报告失败:`, error)
        return {
          success: false,
          message: getFriendlyErrorMessage(error, 'AI 报告生成失败'),
          report: '',
          data: null
        }
      } finally {
        this.generatingReport = false
      }
    },
  },
  getters: {
    completedExperiments: (state) => {
      const expList = Array.isArray(state.experimentList) ? state.experimentList : []
      return expList.filter(exp => exp.status === 'completed')
    },
    inProgressExperiments: (state) => {
      const expList = Array.isArray(state.experimentList) ? state.experimentList : []
      return expList.filter(exp => exp.status === 'in_progress')
    },
    notStartedExperiments: (state) => {
      const expList = Array.isArray(state.experimentList) ? state.experimentList : []
      return expList.filter(exp => exp.status === 'not_started')
    }
  }
})

export const useLearningStore = defineStore('learning', {
  state: () => ({}),
  actions: {
    async submitSelfAssessment(data) {
      return api.submitSelfAssessment(data)
    }
  }
})
