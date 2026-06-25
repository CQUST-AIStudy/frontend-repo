import logger from '@/utils/logger'
import axios from 'axios'
import {
  clearAuthStorage,
  getTapToken,
  setSessionToken,
  setTapToken,
  setTapUser,
  setUserInfo,
} from '../constants/auth'
import { API_BASE_URL_WITH_SLASH } from '../config/runtime'
import {
  createFriendlyError,
  getFriendlyErrorMessage
} from '../utils/errorMessage'

axios.defaults.withCredentials = true

const apiClient = axios.create({
  baseURL: API_BASE_URL_WITH_SLASH,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  config => {
    const tapToken = getTapToken()
    if (tapToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${tapToken}`
    }
    return config
  },
  error => Promise.reject(createFriendlyError(error, '请求发送失败，请稍后重试'))
)

apiClient.interceptors.response.use(
  response => response.data,
  error => {
    const requestUrl = error?.config?.url || ''
    const isLoginRequest = requestUrl.includes('/api/login')
    const isTapLoginRequest = requestUrl.includes('/api/auth/login')
    const isSessionExchangeRequest = requestUrl.includes('/api/auth/session')
    const isAuthRequest = isLoginRequest || isTapLoginRequest || isSessionExchangeRequest
    const fallbackMessage = error?.response?.status === 401 && isLoginRequest
      ? '登录失败，请检查账号密码是否正确'
      : '请求失败，请稍后重试'
    const friendlyError = createFriendlyError(error, fallbackMessage)

    if (error?.response?.status === 401 && !isAuthRequest) {
      friendlyError.message = '登录已过期，请重新登录'
      friendlyError.friendlyMessage = friendlyError.message
      clearAuthStorage()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(friendlyError)
  }
)

const trimText = (value) => String(value ?? '').trim()

const optionalTrimmedText = (value) => {
  const text = trimText(value)
  return text || null
}

const normalizeSubmitTime = (value) => {
  if (value === null || value === undefined) return null
  const raw = String(value).trim()
  if (!raw) return null
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  if (parsed.getFullYear() <= 2000) return null
  return raw
}

const sanitizeSubmissionTiming = (item = {}) => {
  const submitTime = normalizeSubmitTime(item.submitTime ?? item.date)
  return {
    ...item,
    submitTime,
    date: submitTime
  }
}

const getPersistedSelectedClass = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.selectedClass || null
  } catch {
    return null
  }
}

const normalizeTeacherClassScope = (options) => {
  if (typeof options === 'number' || typeof options === 'string') {
    return { classId: options, scope: 'class' }
  }
  if (options && typeof options === 'object') {
    return {
      classId: options.classId ?? null,
      classKeyword: options.classKeyword ?? options.ptaGroupName ?? options.ptaKeyword ?? options.class ?? null,
      scope: options.scope === 'all' ? 'all' : 'class'
    }
  }
  return { classId: null, classKeyword: null, scope: 'class' }
}

const normalizePtaKeyword = (value) => String(value || '').replace(/[\s\u3000]+/g, '').trim()

const getClassPtaKeyword = (cls) => {
  if (!cls || typeof cls !== 'object') return ''
  return cls.ptaGroupName || cls.pta_group_name || cls.ptaKeyword || cls.pta_keyword || cls.classKeyword || cls.class_keyword || cls.name || ''
}

const isNumericClassId = (value) => /^\d+$/.test(String(value ?? '').trim())

const resolveTeacherClassId = (options) => {
  const normalized = normalizeTeacherClassScope(options)
  if (normalized.scope === 'all') return null
  if (normalized.classId !== null && normalized.classId !== undefined && normalized.classId !== '') {
    return isNumericClassId(normalized.classId) ? normalized.classId : null
  }
  const persistedId = getPersistedSelectedClass()?.id ?? null
  return isNumericClassId(persistedId) ? persistedId : null
}

const resolveTeacherClassKeyword = (options) => {
  const normalized = normalizeTeacherClassScope(options)
  if (normalized.scope === 'all') return null
  if (normalized.classKeyword !== null && normalized.classKeyword !== undefined) {
    const keyword = normalizePtaKeyword(normalized.classKeyword)
    if (keyword) return keyword
  }
  const persistedClass = getPersistedSelectedClass()
  const keyword = normalizePtaKeyword(getClassPtaKeyword(persistedClass))
  return keyword || null
}

const buildTeacherClassParams = (options) => {
  const normalized = normalizeTeacherClassScope(options)
  if (normalized.scope === 'all') return { scope: 'all' }
  const classKeyword = resolveTeacherClassKeyword(options)
  if (classKeyword) return { class: classKeyword }
  const classId = resolveTeacherClassId(options)
  return classId ? { classId } : undefined
}

const buildExperimentParams = (options) => {
  if (!options) return {}
  const experimentId = options.experimentId || options.experiment_id
  const params = experimentId != null ? { experimentId: Number(experimentId) } : {}
  if (options.limit != null && options.limit !== '') {
    params.limit = Number(options.limit)
  }
  return params
}

const unwrapList = (response, keys = ['data']) => {
  if (Array.isArray(response)) return response
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key]
  }
  return []
}

const normalizeSubmissionList = (response) => unwrapList(response, ['data', 'submissions']).map(item => sanitizeSubmissionTiming(item))

export default {
  async getStudentInfo() {
    return apiClient.get('/api/profile/me')
  },

  async getTeacherInfo() {
    return apiClient.get('/api/teacher/info')
  },

  async getAdminInfo() {
    return apiClient.get('/api/admin/info')
  },

  async getMyProfile() {
    return apiClient.get('/api/profile/me')
  },

  async updateMyProfile(data) {
    return apiClient.put('/api/profile/me', data)
  },

  async updatePassword(data) {
    return apiClient.post('/api/user/password', data)
  },

  async getAdminDashboardOverview() {
    return apiClient.get('/api/admin-dashboard/overview')
  },

  async triggerAdminClassSync(classId, payload = {}) {
    return apiClient.post(`/api/admin-dashboard/classes/${classId}/sync`, payload)
  },

  async login(username, password, teacherLevel) {
    try {
      const normalizedUsername = teacherLevel === 'admin' && username === 'admin'
        ? 'admin1'
        : username
      const requestData = {
        username: normalizedUsername,
        password
      }
      if (teacherLevel) {
        requestData.role = teacherLevel
      }

      const response = await apiClient.post('/api/login', requestData, {
        withCredentials: true
      })

      if (response?.success && response.user) {
        setUserInfo(response.user)
        setSessionToken(response.token || 'legacy_session')
      }

      if (response?.success) {
        try {
          const tapResponse = await axios.post(
            `${API_BASE_URL_WITH_SLASH}api/auth/login`,
            { username: normalizedUsername, password },
            {
              withCredentials: true,
              headers: { 'Content-Type': 'application/json' }
            }
          )
          const tapData = tapResponse?.data?.data ?? tapResponse?.data
          if (tapData?.accessToken) {
            setTapToken(tapData.accessToken)
            setTapUser({
              userId: tapData.userId,
              role: tapData.role,
              username: normalizedUsername
            })
          }
        } catch (tapError) {
          logger.warn('TAP 账号登录失败:', tapError.message)
        }
      }

      return response
    } catch (error) {
      logger.error('登录请求失败:', error)
      return {
        success: false,
        message: getFriendlyErrorMessage(error, '登录失败，请稍后重试'),
        userInfo: null
      }
    }
  },

  async tryTapLogin() {
    try {
      const res = await apiClient.post('/api/auth/session', {})
      const data = res?.data ?? res
      if (data?.accessToken) {
        setTapToken(data.accessToken)
        setTapUser({
          userId: data.userId,
          role: data.role,
          username: null
        })
      }
    } catch (error) {
      logger.warn('TAP session 换票失败:', error.message)
    }
  },

  async logout() {
    return apiClient.post('/api/logout')
  },

  async register(formData) {
    try {
      return await apiClient.post('/api/register', {
        username: trimText(formData.username),
        password: formData.password,
        role: 'student',
        usernum: optionalTrimmedText(formData.usernum),
        classname: optionalTrimmedText(formData.classname)
      })
    } catch (error) {
      return {
        success: false,
        message: getFriendlyErrorMessage(error, '注册失败，请稍后重试')
      }
    }
  },

  async getExperimentList() {
    return apiClient.get('/api/experiments')
  },

  async getTeacherExperimentList(options) {
    return apiClient.get('/api/teacher/experiments', {
      params: buildTeacherClassParams(options)
    })
  },

  async getExperimentDetails(id) {
    return apiClient.get(`/api/experiments/${id}`)
  },

  async getLearningAnalysis() {
    return apiClient.get('/api/student/learning-analysis')
  },

  async getLeetCodeProblem(problemId) {
    return apiClient.get(`/api/leetcode/problem/${problemId}`)
  },

  async getLeetCodeProblemBySlug(slug) {
    return apiClient.get(`/api/leetcode/problem-by-slug/${encodeURIComponent(slug)}`)
  },

  async runLeetCodeSolution(data) {
    return apiClient.post('/api/leetcode/run', data)
  },

  async submitLeetCodeSolution(data) {
    return apiClient.post('/api/leetcode/submit', data, {
      timeout: 90000
    })
  },

  async recordLeetCodeRecommendationFeedback(data) {
    return apiClient.post('/api/recommendations/leetcode/feedback', null, {
      params: data
    })
  },

  async getRecommendedPractices() {
    return apiClient.get('/api/recommendations/leetcode/sync', {
      params: { limit: 20 }
    })
  },

  async getPtaPracticeSets() {
    return apiClient.get('/api/student/current/pta-practice-sets')
  },

  async getSkillStates() {
    return apiClient.get('/api/profile/skill-states')
  },

  async getRecommendServiceHealth() {
    return apiClient.get('/recommend/health', { timeout: 5000 }).catch(() => null)
  },

  async getErrorAnalysisHealth() {
    return apiClient.get('/api/analysis/health')
  },

  // ========== 错误分析（同步调用） ==========

  async analyzeError(payload) {
    return apiClient.post('/api/analysis/error', payload, { timeout: 60000 })
  },

  async getLearningSuggestions(payload) {
    return apiClient.post('/api/analysis/learning', payload, { timeout: 60000 })
  },

  async getWarningAnalysis(payload) {
    return apiClient.post('/api/analysis/warning', payload, { timeout: 60000 })
  },

  // ========== 错误分析（异步管线：触发 → 查询存储报告） ==========

  /** 触发异步 AI 分析管线（后台执行，立即返回） */
  async triggerErrorAnalysis(experimentId) {
    return apiClient.post(`/api/analysis/trigger/${experimentId}`, {}, { timeout: 10000 })
  },

  /** 获取已存储的 AI 分析报告（从 MySQL/Redis 读取） */
  async getStoredAnalysisReport(experimentId) {
    return apiClient.get(`/api/analysis/report/${experimentId}`)
  },

  /** 检查分析状态（前端轮询用，轻量级） */
  async checkAnalysisStatus(experimentId) {
    return apiClient.get(`/api/analysis/status/${experimentId}`)
  },

  async submitSelfAssessment(data) {
    return apiClient.post('/api/self-assessments', data)
  },

  async getStudentSubmissions(experimentId) {
    const url = experimentId
      ? `/api/submissions?experimentId=${experimentId}`
      : '/api/submissions'
    return apiClient.get(url)
  },

  async getAllStudentExperiments(options) {
    const response = await apiClient.get('/api/teacher/allStudentExperiments', {
      params: { ...buildTeacherClassParams(options), ...buildExperimentParams(options) }
    })
    const result = response.data
    if (result?.success === false) {
      throw createFriendlyError({ data: result }, result.message || '获取数据失败')
    }
    return normalizeSubmissionList(result)
  },

  async getSubmissionDetail(submissionId) {
    const response = await apiClient.get(`/api/submissions/${submissionId}`)
    if (response?.success === false) {
      throw createFriendlyError({ data: response }, response.message || '加载提交详情失败')
    }
    return sanitizeSubmissionTiming(response?.data || response)
  },

  async getClassList() {
    const response = await apiClient.get('/api/classes')
    // apiClient 拦截器已返回 response.data，即 {data: [...]}
    // unwrapList 会解包 response.data → 返回数组
    const result = unwrapList(response)
    if (!Array.isArray(result)) {
      logger.warn('getClassList 返回非数组数据:', result)
      return []
    }
    return result
  },

  async getClasses(params = {}) {
    return apiClient.get('/api/classes', { params })
  },

  async createClass(data) {
    return apiClient.post('/api/classes', data)
  },

  async updateClass(id, data) {
    return apiClient.put(`/api/classes/${id}`, data)
  },

  async deleteClass(id) {
    return apiClient.delete(`/api/classes/${id}`)
  },

  async getClassStudents(id) {
    return apiClient.get(`/api/classes/${id}/students`)
  },

  async getStudentList() {
    return apiClient.get('/api/teacher/studentList')
  },

  async getClassAnalysis(classId) {
    const allStudentExperiments = await this.getAllStudentExperiments({ classId })
    const experiments = await this.getTeacherExperimentList({ classId })
    const expList = unwrapList(experiments)
    const selectedClass = getPersistedSelectedClass()
    const selectedClassName = selectedClass && String(selectedClass.id) === String(classId)
      ? selectedClass.name
      : ''

    const classSubmissions = classId
      ? allStudentExperiments.filter(s =>
          String(s.classId ?? '') === String(classId) ||
          (selectedClassName && String(s.className || '') === selectedClassName)
        )
      : allStudentExperiments

    const studentIds = new Set(classSubmissions.map(s => s.studentId))
    const scored = classSubmissions.filter(s => Number(s.score) > 0)
    const completed = classSubmissions.filter(s => s.status === 'completed' || s.status === 'graded')

    const scoreDistribution = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 }
    scored.forEach(s => {
      const score = Number(s.score)
      if (score >= 90) scoreDistribution['90-100']++
      else if (score >= 80) scoreDistribution['80-89']++
      else if (score >= 70) scoreDistribution['70-79']++
      else if (score >= 60) scoreDistribution['60-69']++
      else scoreDistribution['<60']++
    })

    const experimentCompletion = expList.map(e => {
      const subs = classSubmissions.filter(s => String(s.experimentId) === String(e.id) && (s.status === 'completed' || s.status === 'graded'))
      return { name: e.name, completion: studentIds.size > 0 ? Math.round((subs.length / studentIds.size) * 100) : 0 }
    })

    const studentScores = {}
    scored.forEach(s => {
      if (!studentScores[s.studentId]) studentScores[s.studentId] = { name: s.studentName, scores: [] }
      studentScores[s.studentId].scores.push(Number(s.score))
    })
    const topStudents = Object.entries(studentScores)
      .map(([id, data]) => ({
        id,
        name: data.name,
        averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5)

    return {
      id: classId,
      studentCount: studentIds.size,
      averageScore: scored.length > 0 ? Math.round(scored.reduce((sum, s) => sum + Number(s.score), 0) / scored.length * 10) / 10 : 0,
      completionRate: studentIds.size > 0 && expList.length > 0
        ? Math.round((completed.length / (studentIds.size * expList.length)) * 100)
        : 0,
      scoreDistribution,
      experimentCompletion,
      topStudents
    }
  },

  async createExperiment(data) {
    return apiClient.post('/api/teacher/experiments', data)
  },

  async updateExperiment(id, data) {
    return apiClient.put(`/api/experiments/${id}`, data)
  },

  async deleteExperiment(id) {
    return apiClient.delete(`/api/experiments/${id}`)
  },

  async submitExperiment(id, data) {
    return apiClient.post(`/api/experiments/${id}/submit`, data)
  },

  async generateExperimentReport(id, data) {
    return apiClient.post(`/api/experiments/${id}/report/generate`, data)
  },

  async getExperimentReport(id) {
    return apiClient.get(`/api/experiments/${id}/report`)
  },

  async getPublishedGradingResult(experimentId) {
    return apiClient.get(`/api/student/grading-results/experiments/${experimentId}`)
  },

  async downloadPublishedGradingReport(submissionId) {
    return apiClient.get(`/api/student/grading-results/submissions/${submissionId}/report`, {
      responseType: 'blob'
    })
  },

  async getLearningTracking(submissionId) {
    const response = await apiClient.get(`/api/submissions/${submissionId}/learning-tracking`)
    if (response?.success === false) {
      throw createFriendlyError({ data: response }, response.message || '加载学情追踪失败')
    }
    return response?.data || response
  },

  async gradeSubmission(id, data) {
    return apiClient.post(`/api/submissions/${id}/grade`, data)
  },

  async saveQuestionComment(submissionId, questionIndex, comment) {
    return apiClient.post(`/api/submissions/${submissionId}/comments`, { questionIndex, comment })
  },

  async rejectSubmission(id) {
    return apiClient.post(`/api/submissions/${id}/reject`)
  },

  async getUsers(params = {}) {
    return apiClient.get('/api/users', { params })
  },

  async addUser(data) {
    return apiClient.post('/api/users', data)
  },

  async updateUser(id, data) {
    return apiClient.put(`/api/users/${id}`, data)
  },

  async deleteUser(id) {
    return apiClient.delete(`/api/users/${id}`)
  },

  async getSystemLogs(params = {}) {
    return apiClient.get('/api/system-logs', { params })
  },

  async clearSystemLogs() {
    return apiClient.delete('/api/system-logs')
  },

  async exportSystemLogs(params = {}) {
    return apiClient.get('/api/system-logs/export', {
      params,
      responseType: 'blob'
    })
  }
}

export { apiClient }
