import logger from '@/utils/logger'
import {
  delay,
  studentInfo,
  teacherInfo,
  adminInfo,
  experimentList,
  experimentDetails,
  learningAnalysisData,
  recommendedPractices,
  teacherExperimentList,
  studentSubmissionsList,
  classList
} from '../mock'

import axios from 'axios'
import {
  clearAuthStorage,
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

axios.defaults.withCredentials = true;


const USE_MOCK_DATA = false;
const apiClient = axios.create({
  baseURL: API_BASE_URL_WITH_SLASH,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  config => config,
  error => {
    return Promise.reject(createFriendlyError(error, '请求发送失败，请稍后重试'));
  }
);

apiClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const requestUrl = error?.config?.url || ''
    const isLoginRequest = requestUrl.includes('/api/login')
    const isSessionExchangeRequest = requestUrl.includes('/api/auth/session')
    const isAuthRequest = isLoginRequest || isSessionExchangeRequest
    const fallbackMessage = error?.response?.status === 401 && isLoginRequest
      ? '用户名或密码不正确，请检查后重试'
      : '请求失败，请稍后重试'
    const friendlyError = createFriendlyError(error, fallbackMessage)

    if (error?.response?.status === 401 && isLoginRequest && friendlyError.friendlyMessage === '登录已过期，请重新登录') {
      friendlyError.message = fallbackMessage
      friendlyError.friendlyMessage = fallbackMessage
    }

    if (error?.response?.status === 401 && !isAuthRequest) {
      friendlyError.message = '登录已过期，请重新登录'
      friendlyError.friendlyMessage = friendlyError.message
      clearAuthStorage()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(friendlyError);
  }
);

const parseSubmissionCompositeId = (submissionId) => {
  if (typeof submissionId !== 'string') return null
  const separatorIndex = submissionId.lastIndexOf('-')
  if (separatorIndex <= 0 || separatorIndex >= submissionId.length - 1) return null
  return {
    studentId: submissionId.slice(0, separatorIndex),
    experimentId: submissionId.slice(separatorIndex + 1)
  }
}

const isNumericStudentId = (value) => /^\d+$/.test(String(value ?? '').trim())

const normalizeStudentId = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
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
      scope: options.scope === 'all' ? 'all' : 'class'
    }
  }
  return { classId: null, scope: 'class' }
}

const resolveTeacherClassId = (options) => {
  const normalized = normalizeTeacherClassScope(options)
  if (normalized.scope === 'all') return null
  if (normalized.classId !== null && normalized.classId !== undefined && normalized.classId !== '') {
    return isNumericClassId(normalized.classId) ? normalized.classId : null
  }
  const persistedId = getPersistedSelectedClass()?.id ?? null
  return isNumericClassId(persistedId) ? persistedId : null
}

const isNumericClassId = (value) => /^\d+$/.test(String(value ?? '').trim())

export default {
  async getStudentInfo() {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(300)
      return studentInfo
    }
    return apiClient.get('/api/profile/me')
  },

  async getTeacherInfo() {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(300)
      return teacherInfo
    }
    return apiClient.get('/api/teacher/info')
  },

  async getAdminInfo() {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(300)
      return adminInfo
    }
    return apiClient.get('/api/admin/info')
  },

  async getAdminDashboardOverview() {
    return apiClient.get('/api/admin-dashboard/overview')
  },

  async triggerAdminClassSync(classId, payload = {}) {
    return apiClient.post(`/api/admin-dashboard/classes/${classId}/sync`, payload)
  },

  async login(username, password, teacherLevel) {
    if (
      // process.env.NODE_ENV === 'development' &&
      USE_MOCK_DATA) {
      logger.debug('开发环境登录，用户名：', username, '教师级别:', teacherLevel)
      await delay(1000)

      let userInfo = null
      let token = null
      let success = true
      let message = '登录成功'

      try {

        if (username === 'student' && password === 'password123') {
          userInfo = {
            id: 'S2023001',
            name: '张三',
            role: 'student',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          }
          token = 'student_token_xxx'

        } else if (username === 'teacher' && password === 'password123') {
          userInfo = {
            id: 'T2023001',
            name: '李教授',
            role: 'teacher',
            level: teacherLevel || 'normal',
            permissions: getTeacherPermissions(teacherLevel || 'normal'),
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          }
          token = 'teacher_token_xxx'

        } else if (username === 'admin' && password === 'password123') {
          userInfo = {
            id: 'A2023001',
            name: '管理员',
            role: 'admin',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          }
          token = 'admin_token_xxx'

        } else {
          success = false
          message = '用户名或密码错误'
        }

        if (success) {
          try {
            setSessionToken(token)
            setUserInfo(userInfo)
            logger.debug('登录信息已保存到 localStorage')
          } catch (e) {
            logger.error('保存登录信息失败:', e)
          }
        }
        logger.debug('用户信息:', userInfo)
        return { success, message, userInfo, token }
      } catch (error) {
        logger.error('登录过程中发生错误', error)
        return {
          success: false,
          message: getFriendlyErrorMessage(error, '登录过程中发生错误，请稍后重试'),
          userInfo: null,
          token: null
        }
      }
    }

    try {
      logger.debug('发送登录请求（详细）', {
        username: username,
        password: '***',
        role: teacherLevel,
        url: '/api/login'
      });

      const normalizedUsername = teacherLevel === 'admin' && username === 'admin'
        ? 'admin1'
        : username;

      const requestData = {
        username: normalizedUsername,
        password: password
      };

      if (teacherLevel) {
        requestData.role = teacherLevel;
      }

      const config = {
        withCredentials: true
      };

      const response = await apiClient.post('/api/login', requestData, config);
      logger.debug('登录原始响应:', response);

      if (response) {
        if (response.success) {
          try {
            const userInfo = response.user;
            if (userInfo) {

              setUserInfo(userInfo);
              logger.debug('用户信息已保存到 localStorage');

              const token = 'legacy_session';
              setSessionToken(token);
            }
          } catch (e) {
            logger.error('保存用户信息失败:', e);
          }

          this.tryTapLogin();
        } else {
          logger.warn('登录响应显示失败:', response.message);
        }
      }

      return response;
    } catch (error) {
      logger.error('API登录请求失败（详细）:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        success: false,
        message: getFriendlyErrorMessage(error, '登录失败，请稍后重试'),
        userInfo: null
      };
    }
  },

  async tryTapLogin() {
    try {
      const res = await apiClient.post('/api/auth/session', {});
      const data = res?.data ?? res;
      if (data?.accessToken) {
        setTapToken(data.accessToken);
        setTapUser({
          userId: data.userId,
          role: data.role,
          username: null
        });
        logger.debug('TAP session 换票成功');
      }
    } catch (e) {
      logger.warn('TAP session 换票失败（可忽略）', e.message);
    }
  },

  async logout() {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(300)
      return { success: true }
    }
    return apiClient.post('/api/logout')
  },

  async register(formData) {
    try {
      const response = await apiClient.post('/api/register', {
        username: formData.username,
        password: formData.password,
        role: 'student',
        usernum: formData.usernum || null,
        classname: formData.classname || null
      })
      return response
    } catch (error) {
      return {
        success: false,
        message: getFriendlyErrorMessage(error, '注册失败，请稍后重试')
      }
    }
  },

  async getExperimentList() {

    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(500)
      return experimentList
    }
    try {
      logger.debug('正在发送获取实验列表请求..');
      const config = {
        withCredentials: true
      };
      const response = await apiClient.get('/api/experiments', config);
      logger.debug('从后端的 response:', response);
      return response;
    } catch (error) {
      logger.error('获取实验列表失败:', error);
      throw error;
    }
  },

  async getExperiments() {

    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(500)
      return experimentList
    }
    try {
      logger.debug('正在发送获取实验列表请求..');
      const config = {
        withCredentials: true
      };
      const response = await apiClient.get('/api/experiments1', config);
      logger.debug('从后端的 response:', response);
      return response;
    } catch (error) {
      logger.error('获取实验列表失败:', error);
      throw error;
    }
  },

  async getTeacherExperimentList(options) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(500)
      logger.debug('使用模拟数据返回教师实验列表');
      return teacherExperimentList
    }

    try {
      logger.debug('正在发送获取教师实验列表请求..');
      const classId = resolveTeacherClassId(options)
      const config = {
        withCredentials: true,
        params: classId ? { classId } : undefined
      };
      const response = await apiClient.get('/api/teacher/experiments', config);
      logger.debug('从后端获取的教师实验列表:', response);
      return response;
    } catch (error) {
      logger.error('获取教师实验列表失败:', error);
      throw error;
    }
  },

  async getExperimentDetails(id) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(700)
      return experimentDetails
    }
    try {
      logger.debug('正在发送获取实验详情请求..');
      const response = await apiClient.get(`/api/experiments/${id}`);
      logger.debug('从后端的实验详情 response:', response);

      if (response.success && !response.data && typeof response === 'object') {
        return {
          success: response.success,
          data: response
        };
      }

      return response;
    } catch (error) {
      logger.error('获取实验详情失败:', error);
      throw error;
    }
  },

  async getLearningAnalysis() {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(800)
      return learningAnalysisData
    }
    try {
      logger.debug('正在发送获取学习分析请求..');
      const response = await apiClient.get('/api/student/learning-analysis')
      logger.debug('从后端获取的学习分析 response:', response);

      if (response.success && !response.data && typeof response === 'object') {
        return {
          success: response.success,
          data: response
        };
      }

      return response;
    } catch (error) {
      logger.error('获取学习分析失败:', error);
      throw error;
    }
  },

  async getLeetCodeProblem(problemId) {
    return apiClient.get(`/api/leetcode/problem/${problemId}`)
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
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(500)
      return recommendedPractices
    }

    return apiClient.get('/api/current/recommendedPractices')
  },

  async submitSelfAssessment(data) {
    return apiClient.post('/api/self-assessments', data)
  },

  async getStudentSubmissions(experimentId) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(600)
      if (experimentId) {
        return studentSubmissionsList.filter(s => s.experimentId === experimentId)
      }
      return studentSubmissionsList
    }

    const url = experimentId
      ? `/api/submissions?experimentId=${experimentId}`
      : '/api/submissions';

    return apiClient.get(url);
  },

  async getAllStudentExperiments(options) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(600)
      return studentSubmissionsList
    }

    try {
      logger.debug('正在获取所有学生实验数据..');
      const classId = resolveTeacherClassId(options)
      const response = await apiClient.get('/api/teacher/allStudentExperiments', {
        params: classId ? { classId } : undefined
      });
      logger.debug('获取到所有学生实验数据', response);

      if (response.success) {
        const list = Array.isArray(response.data) ? response.data : []
        return list.map(item => sanitizeSubmissionTiming(item))
      } else {
        throw createFriendlyError({ data: response }, '获取数据失败');
      }
    } catch (error) {
      logger.error('获取所有学生实验数据失败', error);
      throw error;
    }
  },

  async getSubmissionDetail(submissionId) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(600)

      logger.debug('使用模拟数据返回提交详情，提交ID:', submissionId);
      return {
        id: submissionId,
        studentId: '2019443672',
        studentName: '易星贵',
        experimentId: 'exp001',
        experimentName: '线性表实验',
        status: 'submitted',
        score: null,
        code: `第 1 题如下：
//// 创建空的顺序表
List MakeEmpty()
{
  List list = malloc(sizeof(struct LNode));
  list->Last = -1;
  return list;
}

// 元素 X 插入位置 P
bool Insert(List L, ElementType X, Position P)
{
  if (L->Last >= MAXSIZE - 1) {
    printf("FULL");
    return false;
  }
  if (P < 0 || P > L->Last + 1) {
    printf("ILLEGAL POSITION");
    return false;
  }
  for (int i = L->Last; i >= P; i--) {
    L->Data[i + 1] = L->Data[i];
  }
  L->Data[P] = X;
  L->Last++;
  return true;
}

| 测试点 | 结果 | 测试点得分 | 耗时 | 内存 |
| --- | --- | --- | --- | --- |
| 0 | 答案正确 | 15 | 1.00 ms | 364 KB |
| 1 | 答案正确 | 15 | 2.00 ms | 356 KB |
| 2 | 答案正确 | 10 | 1.00 ms | 364 KB |

第 2 题如下：
List Delete(List L, ElementType minD, ElementType maxD)
{
  for (int i = 0; i <= L->Last; i++) {
    if (L->Data[i] > minD && L->Data[i] < maxD) {
      for (int j = i; j < L->Last; j++) {
        L->Data[j] = L->Data[j + 1];
      }
      L->Last--;
      i--;
    }
  }
  return L;
}

| 测试点 | 结果 | 测试点得分 | 耗时 | 内存 |
| --- | --- | --- | --- | --- |
| 0 | 答案正确 | 15 | 1.00 ms | 364 KB |
| 1 | 答案正确 | 15 | 2.00 ms | 356 KB |
| 2 | 答案正确 | 10 | 1.00 ms | 364 KB |

第 3 题如下：
void Del_negative(SqList* L)
{
  int x = 0;
  for (int i = 0; i < L->length; i++) {
    if (L->items[i] < 0) {
      SqListDelete(L, i + 1, &x);
      i--;
    }
  }
}

| 测试点 | 结果 | 测试点得分 | 耗时 | 内存 |
| --- | --- | --- | --- | --- |
| 0 | 答案正确 | 15 | 1.00 ms | 364 KB |
| 1 | 答案正确 | 15 | 2.00 ms | 356 KB |
| 2 | 答案正确 | 10 | 1.00 ms | 364 KB |`,
        plagiarismRate: 0.05,
        class: '计算机科学1班',
        report: `# 线性表实验报告\n\n## 实验目的\n实现顺序表的基本操作\n实现链表的基本操作\n完成示例应用程序\n撰写实验报告分析性能\n\n## 实验环境\nVisual Studio Code, JavaScript\n\n## 实验内容\n实验内容：线性表基础操作，包括顺序表的初始化、插入、删除、查找和遍历实现，包括增删改查等功能。\n\n## 实验步骤\n1. 首先定义线性表的结构\n2. 实现增加元素的方法\n3. 实现删除元素的方法\n4. 实现查找元素的方法\n\n## 实验结果\n成功实现了线性表的各项功能，测试通过。\n\n## 实验总结\n通过本次实验，我深入理解了线性表的工作原理和实现方法。`,
        aiRemarks: '第一题评语: 代码实现正确，符合题意。第二题评语: 代码实现正确，符合题意。第三题评语: 代码实现正确，符合题意。总评语：代码质量良好，符合实验要求。',
        date: '2024-04-04',
      }
    }

    try {
      logger.debug('正在获取提交详情...');
      const response = await apiClient.get(`/api/submissions/${submissionId}`);
      logger.debug('getSubmissionDetail response:', response);
      if (response && response.success === false) {
        throw createFriendlyError({ data: response }, '加载提交详情失败')
      }
      Object.assign(response, sanitizeSubmissionTiming(response))

      const parsedSubmissionId = parseSubmissionCompositeId(submissionId)
      if (parsedSubmissionId) {
        const { studentId, experimentId } = parsedSubmissionId
        response.id = response.id || submissionId
        response.studentId = normalizeStudentId(response.studentId || studentId)
        response.experimentId = response.experimentId || experimentId

        if (!response?.code && isNumericStudentId(studentId)) {
          try {
            const codeRes = await apiClient.get(`/api/student/code/${studentId}/${experimentId}`)
            if (codeRes?.success && codeRes?.code?.code) {
              response.code = codeRes.code.code
            }
          } catch (e) {
            logger.warn('Fallback code query failed:', e)
          }
        }

        if (!response?.studentName || !response?.studentId || !response?.experimentName) {
          try {
            const classId = resolveTeacherClassId()
            const allRes = await apiClient.get('/api/teacher/allStudentExperiments', {
              params: classId ? { classId } : undefined
            })
            const allList = Array.isArray(allRes) ? allRes : allRes?.data || []
            const matched = allList.find(item =>
              String(item.studentId) === String(studentId) &&
              String(item.experimentId) === String(experimentId)
            )
            if (matched) {
              response.studentId = normalizeStudentId(response.studentId || matched.studentId)
              response.studentName = response.studentName || matched.studentName
              response.experimentId = response.experimentId || matched.experimentId
              response.experimentName = response.experimentName || matched.experimentName
              response.class = response.class || matched.className
              response.submitTime = response.submitTime || normalizeSubmitTime(matched.submitTime) || null
              response.date = response.date || response.submitTime || null
              if (response.score === null || response.score === undefined) {
                response.score = matched.score > 0 ? matched.score : null
              }
            }
          } catch (e) {
            logger.warn('Fallback student/experiment merge failed:', e)
          }
        }
      }

      if (response?.studentId !== undefined && response?.studentId !== null) {
        response.studentId = normalizeStudentId(response.studentId)
      }
      Object.assign(response, sanitizeSubmissionTiming(response))

      return response;
    } catch (error) {
      logger.error('获取提交详情失败:', error);
      throw error;
    }
  },

  async getClassList() {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(500)
      return classList
    }

    try {
      logger.debug('正在获取班级列表...');
      try {
        const unifiedResponse = await apiClient.get('/api/classes', {
          validateStatus: status => status < 500
        });
        if (unifiedResponse?.code === 401 || unifiedResponse?.status === 401) {
          throw new Error('统一班级接口未认证');
        }
        const unifiedClasses = Array.isArray(unifiedResponse?.data)
          ? unifiedResponse.data
          : Array.isArray(unifiedResponse)
            ? unifiedResponse
            : [];
        if (unifiedClasses.length > 0) {
          return unifiedClasses;
        }
      } catch (unifiedError) {
        logger.warn('统一班级接口不可用，回退到教师班级接口', unifiedError?.message || unifiedError);
      }

      const response = await apiClient.get('/api/teacher/class');
      logger.debug('获取到班级列表数据', response);

      if (response && !Array.isArray(response)) {
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }

        const persistedClass = getPersistedSelectedClass()
        if (persistedClass?.id && isNumericClassId(persistedClass.id)) {
          return [{
            ...response,
            id: persistedClass.id,
            name: persistedClass.name || response.name,
            ptaKeyword: persistedClass.ptaKeyword || response.ptaKeyword || response.name
          }];
        }

        return [response];
      }

      return response;
    } catch (error) {
      logger.error('获取班级列表失败:', error);
      throw error;
    }
  },

  async getStudentList() {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(500);
      return {
        students: [
          {
            student_id: 2019443672,
            username: "2019443672",
            password: "password123",
            name: "易星贵",
            class_name: "计算机科学1班",
            createdAt: "2025-04-16T02:34:06.000+00:00"
          },
          {
            student_id: 2019444338,
            username: "2019444338",
            password: "password123",
            name: "张峻豪",
            class_name: "计算机科学1班",
            createdAt: "2025-04-16T02:34:06.000+00:00"
          },
          {
            student_id: 2020444155,
            username: "2020444155",
            password: "password123",
            name: "陈华金",
            class_name: "计算机科学1班",
            createdAt: "2025-04-16T02:34:06.000+00:00"
          },
          {
            student_id: 2020444227,
            username: "2020444227",
            password: "password123",
            name: "彭科望",
            class_name: "计算机科学1班",
            createdAt: "2025-04-16T02:34:06.000+00:00"
          }
        ]
      };
    }

    try {
      logger.debug('正在获取学生列表...');
      const response = await apiClient.get('/api/teacher/studentList');
      logger.debug('获取到学生列表数据', response);
      return response;
    } catch (error) {
      logger.error('获取学生列表失败:', error);
      throw error;
    }
  },

  async getClassAnalysis(classId) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(800);
      return {
        id: classId, name: '计算机科学1班', studentCount: 49, grade: '2023级',
        teacherName: '王老师', averageScore: 87, completionRate: 75
      };
    }

    try {
      const allStudentExperiments = await this.getAllStudentExperiments({ classId });
      const experiments = await this.getTeacherExperimentList({ classId });
      const expList = experiments?.data || experiments || [];
      const selectedClass = getPersistedSelectedClass()
      const selectedClassName = selectedClass && String(selectedClass.id) === String(classId)
        ? selectedClass.name
        : ''

      const classSubmissions = classId
        ? allStudentExperiments.filter(s =>
            String(s.classId ?? '') === String(classId) ||
            (selectedClassName && String(s.className || '') === selectedClassName)
          )
        : allStudentExperiments;

      const studentIds = new Set(classSubmissions.map(s => s.studentId));
      const scored = classSubmissions.filter(s => s.score > 0);
      const completed = classSubmissions.filter(s => s.status === 'completed');

      const scoreDistribution = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 };
      scored.forEach(s => {
        if (s.score >= 90) scoreDistribution['90-100']++;
        else if (s.score >= 80) scoreDistribution['80-89']++;
        else if (s.score >= 70) scoreDistribution['70-79']++;
        else if (s.score >= 60) scoreDistribution['60-69']++;
        else scoreDistribution['<60']++;
      });

      const experimentCompletion = (Array.isArray(expList) ? expList : []).map(e => {
        const subs = classSubmissions.filter(s => s.experimentId === e.id && s.status === 'completed');
        return { name: e.name, completion: studentIds.size > 0 ? Math.round((subs.length / studentIds.size) * 100) : 0 };
      });

      const studentScores = {};
      scored.forEach(s => {
        if (!studentScores[s.studentId]) studentScores[s.studentId] = { name: s.studentName, scores: [] };
        studentScores[s.studentId].scores.push(s.score);
      });
      const topStudents = Object.entries(studentScores)
        .map(([id, data]) => ({
          id, name: data.name,
          averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5);

      return {
        id: classId,
        studentCount: studentIds.size,
        averageScore: scored.length > 0 ? Math.round(scored.reduce((sum, s) => sum + s.score, 0) / scored.length * 10) / 10 : 0,
        completionRate: studentIds.size > 0 && expList.length > 0
          ? Math.round((completed.length / (studentIds.size * expList.length)) * 100) : 0,
        scoreDistribution,
        experimentCompletion,
        topStudents
      };
    } catch (error) {
      logger.error('获取班级分析数据失败:', error);
      throw error;
    }
  },

  async createExperiment(data) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(800)
      return { success: true, id: Date.now() }
    }
    return apiClient.post('/api/experiments', data)
  },

  async updateExperiment(id, data) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(700)
      return { success: true }
    }
    return apiClient.put(`/api/experiments/${id}`, data)
  },

  async submitExperiment(id, data) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(600)
      return { success: true, id: Date.now() }
    }
    return apiClient.post(`/api/experiments/${id}/submit`, data)
  },
  async gradeSubmission(id, data) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(500)
      return { success: true }
    }
    return apiClient.post(`/api/submissions/${id}/grade`, data)
  },

  async saveQuestionComment(submissionId, questionIndex, comment) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(300)
      return { success: true }
    }
    return apiClient.post(`/api/submissions/${submissionId}/comments`, { questionIndex, comment })
  },

  async rejectSubmission(id) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(500)
      return { success: true }
    }
    return apiClient.post(`/api/submissions/${id}/reject`)
  },

  async getUsers(params = {}) {
    return apiClient.get('/api/users', { params })
  },

  async addUser(data) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(800)
      return { success: true, id: `${data.role.charAt(0).toUpperCase()}${Date.now().toString().slice(-7)}` }
    }
    return apiClient.post('/api/users', data)
  },

  async updateUser(id, data) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(700)
      return { success: true }
    }
    return apiClient.put(`/api/users/${id}`, data)
  },

  async deleteUser(id) {
    if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
      await delay(500)
      return { success: true }
    }
    return apiClient.delete(`/api/users/${id}`)
  }
}

function getTeacherPermissions(level) {
  switch (level) {
    case 'department_head':
      return [
        'view_all_courses',
        'view_all_teachers',
        'view_all_classes',
        'manage_department',
        'generate_teaching_ppt',
        'analyze_all_classes',
        ...getTeacherPermissions('course_leader')
      ]
    case 'course_leader':
      return [
        'manage_course_experiments',
        'view_course_teachers',
        'view_course_classes',
        'analyze_course_classes',
        ...getTeacherPermissions('normal')
      ]
    case 'normal':
    default:
      return [
        'view_own_classes',
        'manage_own_experiments',
        'view_student_reports',
        'analyze_own_classes',
        'ai_teaching_recommendation'
      ]
  }
}


