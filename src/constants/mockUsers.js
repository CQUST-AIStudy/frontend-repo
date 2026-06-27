/**
 * Mock 登录用的假用户数据。
 *
 * 仅在构建期注入 VUE_APP_USE_MOCK_DATA=true 时被 store 的 login action 消费。
 * 字段结构与后端 /api/login 返回的 user 对齐，并依据各页面实际读取的 userInfo 字段补全：
 * - 学生：name / usernum / class / className（student/Layout.vue、LearningAnalysis.vue、AbilityProfile.vue 等）
 * - 教师：name / level（permissions 由 store 的 normalizeUserInfo 依据 level 自动补全）
 * - 管理员：name / username
 * 注意：getCurrentStudentId 依次取 usernum / studentId / username / id。
 */
export const MOCK_USERS = {
  student: {
    id: 1001,
    usernum: 2024001,
    username: 'student_mock',
    name: '演示学生',
    role: 'student',
    class: '数据结构 1 班',
    className: '数据结构 1 班',
  },
  teacher: {
    id: 2001,
    username: 'teacher_mock',
    name: '演示教师',
    role: 'teacher',
    level: 'normal',
  },
  admin: {
    id: 3001,
    username: 'admin_mock',
    name: '演示管理员',
    role: 'admin',
  },
}

export const MOCK_TOKEN = 'mock_session_token'
export const MOCK_TAP_TOKEN = 'mock_tap_token'
