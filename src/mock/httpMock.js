const MOCK_DELAY_MS = 80

export const USE_GLOBAL_MOCK_DATA = process.env.VUE_APP_USE_MOCK_DATA === 'true'

const today = new Date()
const isoDaysAgo = (days, hour = 9) => {
  const date = new Date(today)
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const clone = (value) => {
  if (value === null || value === undefined) return value
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value
  return JSON.parse(JSON.stringify(value))
}

const mockUsers = [
  { id: 1, username: 'demo_teacher', name: '演示教师', role: 'teacher', level: 'normal', email: 'teacher@example.com', status: 'active' },
  { id: 2, username: 'demo_student', name: '演示学生', role: 'student', usernum: 'S2024001', studentId: 'S2024001', classId: 101, className: '数据结构 1 班', email: 'student@example.com', status: 'active' },
  { id: 3, username: 'demo_admin', name: '演示管理员', role: 'admin', email: 'admin@example.com', status: 'active' },
  { id: 4, username: 'student02', name: '李同学', role: 'student', usernum: 'S2024002', studentId: 'S2024002', classId: 101, className: '数据结构 1 班', status: 'active' }
]

const mockClasses = [
  {
    id: 101,
    name: '数据结构 1 班',
    classCode: 'DS2026A',
    joinPassword: '123456',
    grade: '2024',
    courseName: '数据结构',
    description: '面向数据结构基础实验的演示班级',
    teacherName: '演示教师',
    studentCount: 42,
    ptaKeyword: '数据结构1班',
    syncEnabled: true,
    syncStatus: 'SUCCESS',
    lastSyncAt: isoDaysAgo(1, 2),
    attention: false
  },
  {
    id: 102,
    name: '程序设计基础 2 班',
    classCode: 'CP2026B',
    joinPassword: '123456',
    grade: '2024',
    courseName: '程序设计基础',
    description: '用于离线演示的程序设计班级',
    teacherName: '演示教师',
    studentCount: 38,
    ptaKeyword: '程序设计基础2班',
    syncEnabled: true,
    syncStatus: 'RUNNING',
    lastSyncAt: isoDaysAgo(2, 2),
    attention: false
  },
  {
    id: 103,
    name: '算法设计实验班',
    classCode: 'ALG2026C',
    joinPassword: '123456',
    grade: '2023',
    courseName: '算法设计与分析',
    description: '算法实验与专项训练演示数据',
    teacherName: '演示教师',
    studentCount: 35,
    ptaKeyword: '算法设计实验班',
    syncEnabled: false,
    syncStatus: 'IDLE',
    lastSyncAt: '',
    attention: true,
    attentionReason: '未开启同步'
  }
]

const mockStudents = [
  { id: 201, studentId: 'S2024001', studentNum: 'S2024001', studentName: '演示学生', name: '演示学生', classId: 101, className: '数据结构 1 班', username: 'demo_student' },
  { id: 202, studentId: 'S2024002', studentNum: 'S2024002', studentName: '李同学', name: '李同学', classId: 101, className: '数据结构 1 班', username: 'student02' },
  { id: 203, studentId: 'S2024003', studentNum: 'S2024003', studentName: '王同学', name: '王同学', classId: 102, className: '程序设计基础 2 班', username: 'student03' }
]

const mockExperiments = [
  {
    id: 1,
    name: '顺序表的基本操作',
    title: '顺序表的基本操作',
    status: 'completed',
    deadline: '2026-06-20 23:59:59',
    createdTime: '2026-06-01 09:00:00',
    submissionCount: 40,
    averageScore: 86,
    description: '实现顺序表的初始化、插入、删除与查找。',
    requirement: '补全顺序表操作函数，并通过给定测试样例。',
    report: '演示报告：顺序表实验整体完成度较高，边界条件处理仍需加强。'
  },
  {
    id: 2,
    name: '栈与队列应用',
    title: '栈与队列应用',
    status: 'in_progress',
    deadline: '2026-06-28 23:59:59',
    createdTime: '2026-06-08 09:00:00',
    submissionCount: 31,
    averageScore: 78,
    description: '使用栈完成括号匹配，使用队列模拟排队过程。',
    requirement: '完成括号匹配和循环队列两个任务。',
    report: '演示报告：栈的使用较熟练，循环队列下标取模容易出错。'
  },
  {
    id: 3,
    name: '二叉树遍历',
    title: '二叉树遍历',
    status: 'not_started',
    deadline: '2026-07-05 23:59:59',
    createdTime: '2026-06-15 09:00:00',
    submissionCount: 12,
    averageScore: 69,
    description: '完成二叉树的先序、中序、后序和层序遍历。',
    requirement: '输入扩展先序序列，输出多种遍历结果。',
    report: '演示报告：递归遍历掌握较好，层序遍历需要继续练习。'
  }
]

const mockSubmissions = [
  {
    id: 9001,
    submissionId: 9001,
    studentId: 'S2024001',
    studentName: '演示学生',
    classId: 101,
    className: '数据结构 1 班',
    experimentId: 1,
    experimentName: '顺序表的基本操作',
    submitTime: isoDaysAgo(5, 20),
    date: isoDaysAgo(5, 20),
    status: 'graded',
    score: 88,
    code: '#include <stdio.h>\nint main(){ return 0; }',
    comment: '边界条件处理较完整。'
  },
  {
    id: 9002,
    submissionId: 9002,
    studentId: 'S2024001',
    studentName: '演示学生',
    classId: 101,
    className: '数据结构 1 班',
    experimentId: 2,
    experimentName: '栈与队列应用',
    submitTime: isoDaysAgo(1, 18),
    date: isoDaysAgo(1, 18),
    status: 'submitted',
    score: 0,
    code: '#include <queue>\nint main(){ return 0; }',
    comment: ''
  },
  {
    id: 9003,
    submissionId: 9003,
    studentId: 'S2024002',
    studentName: '李同学',
    classId: 101,
    className: '数据结构 1 班',
    experimentId: 1,
    experimentName: '顺序表的基本操作',
    submitTime: isoDaysAgo(4, 19),
    date: isoDaysAgo(4, 19),
    status: 'graded',
    score: 92,
    code: '',
    comment: '实现清晰。'
  },
  {
    id: 9004,
    submissionId: 9004,
    studentId: 'S2024003',
    studentName: '王同学',
    classId: 102,
    className: '程序设计基础 2 班',
    experimentId: 2,
    experimentName: '栈与队列应用',
    submitTime: isoDaysAgo(2, 21),
    date: isoDaysAgo(2, 21),
    status: 'graded',
    score: 76,
    code: '',
    comment: '循环队列还有下标越界风险。'
  }
]

const mockSkillTree = [
  {
    dimension: '线性表',
    avgMastery: 86,
    level: 'good',
    children: [
      { experimentId: 1, name: '顺序表的基本操作', mastery: 88, score: 88, avgMastery: 88, submissions: 2, acCount: 2, totalCount: 2 }
    ]
  },
  {
    dimension: '栈与队列',
    avgMastery: 62,
    level: 'medium',
    children: [
      { experimentId: 2, name: '栈与队列应用', mastery: 62, score: 62, avgMastery: 62, submissions: 3, acCount: 1, totalCount: 3 }
    ]
  },
  {
    dimension: '树',
    avgMastery: 48,
    level: 'weak',
    children: [
      { experimentId: 3, name: '二叉树遍历', mastery: 48, score: 48, avgMastery: 48, submissions: 1, acCount: 0, totalCount: 1 }
    ]
  }
]

const mockProfile = {
  studentId: 'S2024001',
  usernum: 'S2024001',
  studentName: '演示学生',
  name: '演示学生',
  username: 'demo_student',
  classId: 101,
  className: '数据结构 1 班',
  email: 'student@example.com',
  phone: '13800000000',
  overview: {
    totalSubmissions: 18,
    totalAc: 12,
    overallAcRate: 67,
    averageScore: 81,
    completedExperiments: 2
  },
  radar: {
    dimensions: ['线性表', '栈与队列', '树', '图', '查找'],
    scores: [86, 62, 48, 58, 72]
  },
  trend: {
    direction: 'up',
    series: [
      { name: '顺序表', mastery: 76 },
      { name: '链表', mastery: 81 },
      { name: '栈队列', mastery: 62 },
      { name: '二叉树', mastery: 48 },
      { name: '查找', mastery: 72 }
    ]
  },
  skillTree: mockSkillTree,
  weaknesses: [
    { experimentId: 3, experimentName: '二叉树遍历', dimension: '树', mastery: 48, reason: '层序遍历和递归边界不稳定' },
    { experimentId: 2, experimentName: '栈与队列应用', dimension: '栈与队列', mastery: 62, reason: '循环队列取模和判满条件需要巩固' }
  ],
  patterns: [
    { tag: '稳定进步', description: '近几次实验提交质量持续提升' },
    { tag: '高波动型', description: '树结构相关题目表现波动较大' }
  ],
  feedback: '演示分析：建议优先复习树的递归遍历、层序遍历和循环队列边界条件。'
}

const mockProblems = [
  {
    id: 301,
    problemId: 301,
    numericId: '20',
    problemCode: '20',
    titleMain: '有效的括号',
    title: '有效的括号',
    titleAlt: 'Valid Parentheses',
    difficulty: 'easy',
    sourceKey: 'slug:valid-parentheses',
    sourceUrl: 'https://leetcode.cn/problems/valid-parentheses/',
    tags: ['栈', '字符串'],
    estimatedMinutes: 20
  },
  {
    id: 302,
    problemId: 302,
    numericId: '102',
    problemCode: '102',
    titleMain: '二叉树的层序遍历',
    title: '二叉树的层序遍历',
    titleAlt: 'Binary Tree Level Order Traversal',
    difficulty: 'medium',
    sourceKey: 'slug:binary-tree-level-order-traversal',
    sourceUrl: 'https://leetcode.cn/problems/binary-tree-level-order-traversal/',
    tags: ['树', '队列', '广度优先搜索'],
    estimatedMinutes: 35
  }
]

const mockWrongQuestions = [
  {
    id: 501,
    problemId: 302,
    title: '二叉树的层序遍历',
    sourceType: 'leetcode',
    difficulty: 'medium',
    errorCategory: '边界条件',
    tag: '树',
    resolved: false,
    lastWrongAt: isoDaysAgo(1, 16),
    wrongCount: 2,
    note: '空树和单节点场景需要单独处理。'
  },
  {
    id: 502,
    problemId: 301,
    title: '有效的括号',
    sourceType: 'leetcode',
    difficulty: 'easy',
    errorCategory: '栈使用',
    tag: '栈',
    resolved: true,
    lastWrongAt: isoDaysAgo(7, 15),
    wrongCount: 1,
    note: '已掌握。'
  }
]

const mockDocuments = [
  { id: 701, name: '数据结构实验指导书.pdf', filename: '数据结构实验指导书.pdf', size: 1024 * 240, status: 'READY', uploadedAt: isoDaysAgo(3, 10) },
  { id: 702, name: '栈与队列讲义.docx', filename: '栈与队列讲义.docx', size: 1024 * 90, status: 'READY', uploadedAt: isoDaysAgo(2, 11) }
]

const mockRubrics = [
  { id: 801, name: '数据结构实验评分标准', subject: '数据结构', totalScore: 100, createdAt: isoDaysAgo(10, 9) }
]

const mockGradingTasks = [
  { id: 811, name: '顺序表实验批改', status: 'COMPLETED', total: 40, finished: 40, createdAt: isoDaysAgo(2, 9) },
  { id: 812, name: '栈与队列实验批改', status: 'RUNNING', total: 31, finished: 18, createdAt: isoDaysAgo(1, 9) }
]

const mockKnowledgeBases = [
  {
    id: 'kb-demo-data-structure',
    knowledgeBaseId: 'kb-demo-data-structure',
    name: '数据结构课程知识库',
    courseId: 'DS',
    courseName: '数据结构',
    description: '离线演示知识库',
    documentCount: 2,
    status: 'READY',
    defaultMode: 'strict'
  }
]

const state = {
  classes: clone(mockClasses),
  users: clone(mockUsers),
  experiments: clone(mockExperiments),
  submissions: clone(mockSubmissions),
  documents: clone(mockDocuments),
  rubrics: clone(mockRubrics),
  gradingTasks: clone(mockGradingTasks),
  wrongQuestions: clone(mockWrongQuestions),
  knowledgeBases: clone(mockKnowledgeBases)
}

function nextId(list, base = 1000) {
  return Math.max(base, ...list.map(item => Number(item.id) || 0)) + 1
}

function parseRequestData(data) {
  if (!data) return null
  if (typeof FormData !== 'undefined' && data instanceof FormData) return {}
  if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
    return Object.fromEntries(data.entries())
  }
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }
  return data
}

function success(data = null, extra = {}) {
  return { success: true, data, ...extra }
}

function page(content) {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: content.length
  }
}

function normalizeUserRole(payload = {}) {
  const requestedRole = String(payload.role || '').toLowerCase()
  if (requestedRole === 'student' || requestedRole === 'admin' || requestedRole === 'teacher') return requestedRole
  const username = String(payload.username || '').toLowerCase()
  if (username.includes('admin')) return 'admin'
  if (username.includes('student') || username.includes('s2024')) return 'student'
  return 'teacher'
}

function demoUser(role) {
  if (role === 'admin') return clone(state.users.find(item => item.role === 'admin'))
  if (role === 'student') return clone(state.users.find(item => item.role === 'student'))
  return clone(state.users.find(item => item.role === 'teacher'))
}

function loginResponse(payload = {}) {
  const role = normalizeUserRole(payload)
  const user = demoUser(role)
  return {
    success: true,
    message: 'Mock 登录成功',
    token: 'mock_session_token',
    user,
    userInfo: user
  }
}

function tapAuthResponse(role = 'teacher') {
  return {
    accessToken: 'mock_tap_access_token',
    tokenType: 'Bearer',
    userId: role === 'admin' ? 3 : role === 'student' ? 2 : 1,
    role,
    expiresIn: 7200
  }
}

function filterSubmissions(params = {}) {
  let rows = state.submissions
  if (params.experimentId != null && params.experimentId !== '') {
    rows = rows.filter(item => String(item.experimentId) === String(params.experimentId))
  }
  if (params.classId != null && params.classId !== '') {
    rows = rows.filter(item => String(item.classId) === String(params.classId))
  }
  return clone(rows)
}

function buildAdminDashboard() {
  return {
    stats: {
      aiRequestsUsedToday: 128,
      aiRequestsLimit: 1000,
      translationCharsUsedToday: 42600,
      translationCharsLimit: 200000,
      syncEnabledClassCount: state.classes.filter(item => item.syncEnabled).length,
      runningClassCount: state.classes.filter(item => item.syncStatus === 'RUNNING').length,
      attentionClassCount: state.classes.filter(item => item.attention).length
    },
    quota: {
      topUsers: [
        { username: 'demo_teacher', count: 56 },
        { username: 'demo_student', count: 22 }
      ]
    },
    apiServices: [
      { name: 'LLM', status: 'online', provider: 'Mock', model: 'demo-chat', maskedKey: 'mock-****', envName: 'VUE_APP_USE_MOCK_DATA', source: 'frontend', usedToday: 128, limit: 1000, usageUnit: '次', actionHint: '离线演示数据' },
      { name: 'RAG', status: 'online', provider: 'Mock', model: 'demo-rag', maskedKey: 'mock-****', envName: 'VUE_APP_USE_MOCK_DATA', source: 'frontend', usedToday: 64, limit: 1000, usageUnit: '次', actionHint: '离线演示数据' }
    ],
    spider: {
      healthy: true,
      baseUrl: 'mock://spider',
      cookieStatus: 'OK',
      cookieLastUpdated: isoDaysAgo(1, 8)
    },
    classes: clone(state.classes),
    recentTasks: [
      { id: 'task-1', className: '数据结构 1 班', mode: 'incremental', status: 'SUCCESS', createdAt: isoDaysAgo(1, 3) },
      { id: 'task-2', className: '程序设计基础 2 班', mode: 'incremental', status: 'RUNNING', createdAt: isoDaysAgo(0, 2) }
    ]
  }
}

function buildLearningSuggestion() {
  return {
    suggestionId: 'mock_suggestion_1',
    weakPoints: mockProfile.weaknesses.map(item => ({
      tagName: item.dimension,
      severity: item.mastery < 50 ? 'HIGH' : 'MEDIUM',
      reason: item.reason
    })),
    studyPlan: [
      { topic: '二叉树遍历专项提升', priority: 'HIGH', suggestedResources: '教材树章节 + LeetCode 102', estimatedTime: '2小时' },
      { topic: '循环队列边界条件', priority: 'MEDIUM', suggestedResources: '实验指导书 + PTA 练习', estimatedTime: '1小时' }
    ],
    recommendedProblems: ['二叉树的层序遍历', '有效的括号'],
    summaryMessage: 'Mock 建议：优先复习树和栈队列，结合错题回炉完成专项训练。',
    aiGenerated: false
  }
}

function routeApi(path, method, payload, params, config) {
  if (path === '/api/login') return loginResponse(payload)
  if (path === '/api/auth/login') return { data: tapAuthResponse(normalizeUserRole(payload)) }
  if (path === '/api/auth/session') return { data: tapAuthResponse('teacher') }
  if (path === '/api/logout') return success(null, { message: '已退出' })
  if (path === '/api/register') return success({ id: nextId(state.users), ...payload, role: 'student' }, { message: '注册成功' })

  if (path === '/api/profile/me') return clone(mockProfile)
  if (/^\/api\/profile\/student\//.test(path)) return clone(mockProfile)
  if (path === '/api/profile/class') return success({ className: '数据结构 1 班', students: clone(mockStudents) })
  if (path === '/api/profile/skill-states') {
    return {
      skills: [
        { name: '线性表', mastery: 86, masteryScore: 86, forgettingScore: 12, lastPracticeAt: isoDaysAgo(2), level: 'good' },
        { name: '栈与队列', mastery: 62, masteryScore: 62, forgettingScore: 38, lastPracticeAt: isoDaysAgo(5), level: 'medium' },
        { name: '树', mastery: 48, masteryScore: 48, forgettingScore: 66, lastPracticeAt: isoDaysAgo(9), level: 'weak' }
      ]
    }
  }
  if (/^\/api\/profile\/feedback\/refresh/.test(path)) return { feedback: mockProfile.feedback }

  if (path === '/api/experiments') return success(clone(state.experiments))
  if (path === '/api/teacher/experiments') return success(clone(state.experiments.map(item => ({ ...item, status: item.status === 'not_started' ? 'draft' : 'active' }))))
  if (path === '/api/teacher/allStudentExperiments') return success(filterSubmissions(params))
  if (/^\/api\/experiments\/[^/]+\/report\/generate$/.test(path)) return success({ report: 'Mock AI 报告已生成：该实验整体完成度良好，建议继续关注边界条件。' }, { report: 'Mock AI 报告已生成：该实验整体完成度良好，建议继续关注边界条件。' })
  if (/^\/api\/experiments\/[^/]+\/report$/.test(path)) {
    const id = path.split('/')[3]
    const experiment = state.experiments.find(item => String(item.id) === String(id)) || state.experiments[0]
    return success({ report: experiment.report || '暂无报告' }, { report: experiment.report || '暂无报告' })
  }
  if (/^\/api\/experiments\/[^/]+\/submit$/.test(path)) return success({ id: nextId(state.submissions, 9000), ...payload }, { message: '提交成功' })
  if (/^\/api\/experiments\/[^/]+\/ai-comment\/generate$/.test(path)) return { comment: 'Mock AI 点评：思路基本正确，请补充异常输入处理。' }
  if (/^\/api\/experiments\/[^/]+$/.test(path)) {
    const id = path.split('/')[3]
    return success(clone(state.experiments.find(item => String(item.id) === String(id)) || state.experiments[0]))
  }

  if (path === '/api/submissions') return success(filterSubmissions(params))
  if (/^\/api\/submissions\/[^/]+\/grade$/.test(path)) return success({ ...payload, status: 'graded' }, { message: '评分成功' })
  if (/^\/api\/submissions\/[^/]+\/comments$/.test(path)) return success(payload, { message: '评论已保存' })
  if (/^\/api\/submissions\/[^/]+\/reject$/.test(path)) return success(null, { message: '已退回' })
  if (/^\/api\/submissions\/[^/]+$/.test(path)) {
    const id = path.split('/')[3]
    return success(clone(state.submissions.find(item => String(item.id) === String(id) || String(item.submissionId) === String(id)) || state.submissions[0]))
  }

  if (path === '/api/classes') {
    if (method === 'get') return success(clone(state.classes))
    if (method === 'post') {
      const created = { id: nextId(state.classes), studentCount: 0, syncStatus: 'IDLE', ...payload }
      state.classes.push(created)
      return success(clone(created), { message: '班级创建成功' })
    }
  }
  if (/^\/api\/classes\/[^/]+\/students$/.test(path)) {
    const classId = path.split('/')[3]
    if (method === 'get') return success(clone(mockStudents.filter(item => String(item.classId) === String(classId))))
    if (method === 'post') return success({ id: nextId(mockStudents), classId, ...payload }, { message: '添加成功' })
  }
  if (/^\/api\/classes\/[^/]+\/pta-sync/.test(path)) return success({ status: 'RUNNING', taskId: 'mock_sync_task' }, { message: '同步任务已提交' })
  if (/^\/api\/classes\/[^/]+$/.test(path)) return success(clone(state.classes.find(item => String(item.id) === path.split('/')[3]) || state.classes[0]), { message: '操作成功' })

  if (path === '/api/teacher/studentList') return success(clone(mockStudents))
  if (path === '/api/admin-dashboard/overview') return success(buildAdminDashboard())
  if (/^\/api\/admin-dashboard\/classes\/[^/]+\/sync$/.test(path)) return success({ blocked: false, message: 'Mock 同步任务已提交' })

  if (path === '/api/users') {
    if (method === 'get') return success(clone(state.users))
    if (method === 'post') {
      const created = { id: nextId(state.users), status: 'active', ...payload }
      state.users.push(created)
      return success(clone(created), { message: '用户创建成功' })
    }
  }
  if (/^\/api\/users\/[^/]+$/.test(path)) return success(payload || null, { message: '操作成功' })

  if (path === '/api/system-logs') return success(page([
    { id: 1, level: 'INFO', module: 'mock', message: 'Docker mock 模式已启用', createdAt: isoDaysAgo(0, 9) },
    { id: 2, level: 'INFO', module: 'auth', message: '演示账号登录成功', createdAt: isoDaysAgo(0, 10) }
  ]))
  if (path === '/api/system-logs/export') return mockBlob(config)

  if (path === '/api/student/learning-analysis') return clone(mockProfile)
  if (path === '/api/recommendations/leetcode/sync') {
    return {
      requestId: 'mock_recommendation',
      data: mockProblems.map((problem, index) => ({
        problem,
        problemId: problem.id,
        rankNo: index + 1,
        scoreNeedMatch: index === 0 ? 0.92 : 0.84,
        reasonText: index === 0 ? '巩固栈的基础使用' : '补强树的层序遍历'
      }))
    }
  }
  if (path === '/api/recommendations/leetcode/feedback') return success(null, { message: '反馈已记录' })
  if (path === '/api/student/current/pta-practice-sets') return success([
    { id: 'pta-1', type: 'pta_practice_set', name: '栈与队列专项练习', title: '栈与队列专项练习', offeringId: 'mock-pta-1', sourceLabel: 'PTA' }
  ])

  if (path === '/api/leetcode/problems/search') return success(clone(mockProblems))
  if (/^\/api\/leetcode\/problem-by-slug\//.test(path)) return success(clone(mockProblems[0]))
  if (/^\/api\/leetcode\/problem\//.test(path)) return success(clone(mockProblems[0]))
  if (path === '/api/leetcode/run') return success({ status: 'ACCEPTED', output: 'Mock 运行通过', runtimeMs: 12, memoryKb: 2048 })
  if (path === '/api/leetcode/submit') return success({ judgeStatus: 'ACCEPTED', status: 'ACCEPTED', score: 100, message: 'Mock 提交通过' })

  if (path === '/api/analysis/health') return success({ healthy: true })
  if (path === '/api/analysis/error') return success({ summary: 'Mock 错因分析：边界条件处理不足。', suggestions: ['补充空输入测试', '检查循环退出条件'] })
  if (path === '/api/analysis/learning') return success(buildLearningSuggestion())
  if (path === '/api/analysis/warning') return success({ level: 'LOW', message: 'Mock 预警：学习状态稳定。' })
  if (/^\/api\/analysis\/trigger\//.test(path)) return success({ taskId: 'mock_analysis_task', status: 'RUNNING' })
  if (/^\/api\/analysis\/report\//.test(path)) return success({ status: 'COMPLETED', report: 'Mock AI 分析报告：请重点关注树与队列。' })
  if (/^\/api\/analysis\/status\//.test(path)) return success({ status: 'COMPLETED' })
  if (path === '/api/self-assessments') return success(payload, { message: '自评已保存' })

  if (path === '/api/student/wrong-questions') return success(page(clone(state.wrongQuestions)))
  if (path === '/api/student/wrong-questions/stats') {
    const unresolved = state.wrongQuestions.filter(item => !item.resolved).length
    return success({
      total: state.wrongQuestions.length,
      unresolved,
      resolved: state.wrongQuestions.length - unresolved,
      byDifficulty: { easy: 1, medium: 1 },
      byErrorCategory: { 边界条件: 1, 栈使用: 1 }
    })
  }
  if (/^\/api\/student\/wrong-questions\/[^/]+\/retry$/.test(path)) return success({ judgeStatus: 'ACCEPTED', resolved: true }, { message: '练习记录已更新' })
  if (/^\/api\/student\/wrong-questions\/[^/]+$/.test(path)) return success(clone(state.wrongQuestions[0]), { message: '操作成功' })
  if (path === '/api/student/wrong-questions/record') return success({ id: nextId(state.wrongQuestions), ...payload }, { message: '错题已记录' })

  if (path === '/api/documents') return method === 'get' ? success(clone(state.documents)) : success(null, { message: '操作成功' })
  if (/^\/api\/documents\/[^/]+\/(translate|summary)$/.test(path)) return success({ text: 'Mock 文档处理结果。', summary: 'Mock 摘要：本文档介绍数据结构实验要点。' })
  if (/^\/api\/documents\/[^/]+$/.test(path)) return success(null, { message: '操作成功' })
  if (path === '/api/uploads/folders') return success({ id: nextId(state.documents), folderId: nextId(state.documents), folderName: payload?.folderName || 'Mock 文件夹' })
  if (/^\/api\/uploads\/folders/.test(path)) return success({ id: nextId(state.documents), status: 'UPLOADED', files: [] })
  if (path === '/api/zip-organize/jobs') return success({ id: 'mock_zip_job', status: 'COMPLETED' })
  if (/^\/api\/zip-organize\/jobs/.test(path)) return success({ id: 'mock_zip_job', status: 'COMPLETED', files: [] })
  if (path === '/api/tap-chat/stream') return mockSse()
  if (path === '/api/tap-chat') return success({ answer: 'Mock AI 回复：这是离线演示模式下的回答。', message: 'Mock AI 回复：这是离线演示模式下的回答。' })
  if (/^\/api\/papers\//.test(path)) return success({ summary: 'Mock 论文摘要：该论文围绕智能教学反馈展开。' })

  if (path === '/api/grading/rubrics') return method === 'get' ? success(clone(state.rubrics)) : success({ id: nextId(state.rubrics), ...payload })
  if (/^\/api\/grading\/rubrics\/draft$/.test(path)) return success({ name: 'Mock 评分标准草稿', items: [] })
  if (/^\/api\/grading\/rubrics\/[^/]+$/.test(path)) return success(clone(state.rubrics[0]), { message: '操作成功' })
  if (path === '/api/grading/tasks') return method === 'get' ? success(page(clone(state.gradingTasks))) : success({ id: nextId(state.gradingTasks), status: 'PENDING', ...payload })
  if (path === '/api/grading/batches') return success([{ id: 'batch-1', name: 'Mock 批次', taskCount: 2 }])
  if (path === '/api/grading/signatures') return method === 'get' ? success([{ id: 1, signature: '演示教师' }]) : success({ id: 2, ...payload })
  if (/^\/api\/grading\/reports\//.test(path) || /\/export/.test(path) || /\/export-excel/.test(path)) return mockBlob(config)
  if (/^\/api\/grading\/submissions\//.test(path)) return success({ id: path.split('/')[4], status: 'GRADED', score: 88, finalReviewComment: 'Mock 总评：完成度良好。' })
  if (/^\/api\/grading\/tasks\//.test(path)) return success({ id: path.split('/')[4], status: 'COMPLETED', submissions: clone(state.submissions), matchCandidates: clone(mockStudents) })

  if (/^\/api\/knowledge-graphs\//.test(path)) return routeKnowledgeGraph(path, method, payload)
  if (path === '/api/pta-cookie/status') return success({ valid: true, status: 'OK', updatedAt: isoDaysAgo(1, 8) })
  if (path === '/api/pta-cookie/update') return success({ valid: true, message: 'Mock Cookie 已更新' })
  if (path === '/api/teachers/me/pta-credentials') return success({ bound: true, username: 'mock_pta_user' })
  if (path === '/api/student-classes') return success(clone(state.classes))
  if (path === '/api/student-classes/join') return success({ joined: true, classId: 101 }, { message: '已加入班级' })
  if (path === '/api/convert-to-pdf') return mockBlob(config)

  return fallbackResponse(method, payload, config)
}

function routeKnowledgeGraph(path, method, payload) {
  const graphCode = decodeURIComponent(path.split('/')[3] || 'data-structure')
  const data = payload?.graph || payload?.data || payload || {
    graphCode,
    nodes: [],
    edges: [],
    updatedAt: isoDaysAgo(0, 9)
  }
  if (method === 'get') return success(data)
  return success(data, { message: method === 'post' ? 'Mock 图谱已导入' : 'Mock 图谱已保存' })
}

function routeRag(path, method, payload, config) {
  if (path.includes('/stream')) return mockSse(config)
  if (path.endsWith('/retrieve')) return success({ chunks: [{ content: 'Mock 检索片段：顺序表支持随机访问。', score: 0.91 }] })
  if (path.endsWith('/chat') || path.endsWith('/assistant')) return success({ answer: 'Mock 知识库回答：这是离线演示模式下的课程知识库回复。', sources: [] })
  if (path.includes('/knowledge-base/list')) return success(clone(state.knowledgeBases))
  if (/\/knowledge-base$/.test(path)) return success({ id: `kb-${Date.now()}`, ...payload })
  if (/\/documents\/status-summary$/.test(path)) return success({ READY: 2, PROCESSING: 0, FAILED: 0 })
  if (/\/documents$/.test(path)) return method === 'get' ? success(clone(state.documents)) : success({ id: nextId(state.documents), status: 'READY' })
  if (/\/chunks$/.test(path)) return success([{ id: 'chunk-1', content: 'Mock 分块内容', score: 0.9 }])
  if (/\/annotations$/.test(path)) return method === 'get' ? success([]) : success({ id: 'annotation-1', ...payload })
  if (/\/analytics/.test(path)) return success({ totalQuestions: 24, hitRate: 0.82, feedbackCount: 6, hotQuestions: [] })
  return fallbackResponse(method, payload, config)
}

function routeLeetCodeClaw(path, method, payload, config) {
  if (path === '/health') return { status: 'ok', healthy: true }
  if (path.includes('/recommend/keyword')) {
    return { items: mockProblems.map(problem => ({ problem: { titleSlug: problem.sourceKey.replace('slug:', ''), translatedTitle: problem.title, difficulty: problem.difficulty }, score: 0.9, persisted: true })) }
  }
  if (path.includes('/crawl/jobs/')) return { id: path.split('/').pop(), status: 'COMPLETED', progress: 100 }
  if (path.includes('/crawl')) return { items: mockProblems.map(problem => ({ problem: { titleSlug: problem.sourceKey.replace('slug:', ''), translatedTitle: problem.title, difficulty: problem.difficulty }, persisted: true, persist: { problemId: problem.id } })), failed: [] }
  if (path.includes('/problem/')) return { problem: { titleSlug: path.split('/').pop(), translatedTitle: mockProblems[0].title, difficulty: 'easy' }, persisted: true, persist: { problemId: mockProblems[0].id } }
  return fallbackResponse(method, payload, config)
}

function routeSpider(path, method, payload) {
  if (path === '/health') return { ok: true, status: 'OK', service: 'mock-spider' }
  if (/^\/cooldown\//.test(path)) return { keyword: decodeURIComponent(path.split('/').pop()), coolingDown: false, remainingSeconds: 0 }
  if (path === '/tasks') return { data: [{ id: 'mock_spider_task', status: 'SUCCESS', keyword: '数据结构1班', createdAt: isoDaysAgo(0, 2) }] }
  if (path === '/crawl') return { taskId: 'mock_spider_task', status: 'RUNNING', credentialSource: payload?.credential_source || 'mock' }
  if (/^\/status\//.test(path)) return { taskId: path.split('/').pop(), status: 'SUCCESS', progress: 100, message: 'Mock 同步完成' }
  return { success: true, data: null }
}

function fallbackResponse(method, payload, config) {
  if (config?.responseType === 'blob') return mockBlob(config)
  if (method === 'get') return success([])
  return success(payload || null, { message: 'Mock 操作成功' })
}

function mockBlob(config) {
  if (typeof Blob === 'undefined') {
    return success(null)
  }
  const body = 'Mock export file\n'
  return new Blob([body], { type: config?.responseType === 'blob' ? 'application/octet-stream' : 'text/plain' })
}

function mockSse() {
  return {
    __mockResponseType: 'sse',
    body: [
      'event: delta',
      'data: {"content":"Mock 流式回复：这是离线演示模式。"}',
      '',
      'event: done',
      'data: {"done":true}',
      '',
      ''
    ].join('\n')
  }
}

function resolveUrl(inputUrl = '', baseURL = '') {
  const rawUrl = String(inputUrl || '')
  const rawBase = String(baseURL || '')
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl
  if (rawBase && /^https?:\/\//i.test(rawBase)) {
    return `${rawBase.replace(/\/+$/, '')}/${rawUrl.replace(/^\/+/, '')}`
  }
  if (rawBase && rawBase !== '/' && !rawUrl.startsWith(rawBase)) {
    return `${rawBase.replace(/\/+$/, '')}/${rawUrl.replace(/^\/+/, '')}`
  }
  return rawUrl || rawBase || '/'
}

function getMockRequest(config = {}) {
  const fullUrl = resolveUrl(config.url, config.baseURL)
  const base = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'http://localhost'
  const url = new URL(fullUrl, base)
  return {
    method: String(config.method || 'get').toLowerCase(),
    path: url.pathname.replace(/\/+$/, '') || '/',
    params: { ...Object.fromEntries(url.searchParams.entries()), ...(config.params || {}) },
    payload: parseRequestData(config.data),
    url
  }
}

function stripServicePrefix(path) {
  return path
    .replace(/^\/leetcode-claw(?=\/|$)/, '')
    .replace(/^\/spider(?=\/|$)/, '')
    .replace(/^\/recommend(?=\/|$)/, '')
    .replace(/^\/error-analysis(?=\/|$)/, '')
    .replace(/^\/rag(?=\/|$)/, '') || '/'
}

function isSpiderUrl(request) {
  return request.path === '/health' ||
    /^\/(crawl|tasks|status|cooldown)(\/|$)/.test(request.path) ||
    request.url.port === '8100'
}

function shouldMockRequest(request) {
  return request.path.startsWith('/api/') ||
    request.path.startsWith('/rag') ||
    request.path.startsWith('/recommend') ||
    request.path.startsWith('/leetcode-claw') ||
    request.path.startsWith('/spider') ||
    request.path.startsWith('/error-analysis') ||
    isSpiderUrl(request)
}

export function resolveMockResponse(config = {}) {
  if (!USE_GLOBAL_MOCK_DATA) return null
  const request = getMockRequest(config)
  if (!shouldMockRequest(request)) return null

  if (request.path.startsWith('/rag')) return routeRag(stripServicePrefix(request.path), request.method, request.payload, config)
  if (request.path === '/recommend/health') return success({ healthy: true, status: 'ok' })
  if (request.path.startsWith('/recommend')) return routeApi('/api/recommendations/leetcode/sync', request.method, request.payload, request.params, config)
  if (request.path.startsWith('/leetcode-claw')) return routeLeetCodeClaw(stripServicePrefix(request.path), request.method, request.payload, config)
  if (request.path.startsWith('/spider') || isSpiderUrl(request)) return routeSpider(stripServicePrefix(request.path), request.method, request.payload)
  if (request.path.startsWith('/error-analysis')) return fallbackResponse(request.method, request.payload, config)
  return routeApi(request.path, request.method, request.payload, request.params, config)
}

function createAxiosResponse(config, data) {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: { mock: true }
  }
}

function resolveOriginalAdapter(axiosLike, originalAdapter) {
  if (typeof originalAdapter === 'function') return originalAdapter
  if (typeof axiosLike.getAdapter === 'function') return axiosLike.getAdapter(originalAdapter)
  return null
}

export function installAxiosMockAdapter(axiosLike) {
  if (!USE_GLOBAL_MOCK_DATA || !axiosLike?.defaults || axiosLike.defaults.__cqustMockInstalled) return
  const originalAdapter = axiosLike.defaults.adapter
  const resolvedOriginalAdapter = resolveOriginalAdapter(axiosLike, originalAdapter)
  axiosLike.defaults.adapter = async (config) => {
    const mockData = resolveMockResponse(config)
    if (mockData !== null) {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS))
      return createAxiosResponse(config, mockData)
    }
    if (resolvedOriginalAdapter) return resolvedOriginalAdapter(config)
    throw new Error('No axios adapter available')
  }
  axiosLike.defaults.__cqustMockInstalled = true
}

function buildFetchConfig(input, init = {}) {
  const url = typeof input === 'string'
    ? input
    : input?.url || String(input || '')
  return {
    url,
    method: init.method || input?.method || 'GET',
    data: init.body || null,
    headers: init.headers || input?.headers || {}
  }
}

function createFetchResponse(mockData) {
  if (mockData?.__mockResponseType === 'sse') {
    return new Response(mockData.body, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8' }
    })
  }
  if (typeof Blob !== 'undefined' && mockData instanceof Blob) {
    return new Response(mockData, {
      status: 200,
      headers: { 'Content-Type': mockData.type || 'application/octet-stream' }
    })
  }
  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
}

export function installFetchMockAdapter() {
  const host = typeof window !== 'undefined' ? window : globalThis
  if (!USE_GLOBAL_MOCK_DATA || !host?.fetch || host.__cqustFetchMockInstalled) return
  const originalFetch = host.fetch.bind(host)
  host.fetch = async (input, init = {}) => {
    const mockData = resolveMockResponse(buildFetchConfig(input, init))
    if (mockData !== null) {
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS))
      return createFetchResponse(mockData)
    }
    return originalFetch(input, init)
  }
  host.__cqustFetchMockInstalled = true
}
