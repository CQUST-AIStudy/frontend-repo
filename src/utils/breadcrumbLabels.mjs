const breadcrumbLabels = {
  student: {
    dashboard: '首页',
    experiments: '实验列表',
    'experiment-detail': '实验详情',
    demos: '错误演示',
    'learning-analysis': '个性画像',
    'ai-report': 'AI 报告生成',
    'ai-assistant': 'AI 学习助手',
    'class-join': '教学班级',
    practice: '推荐练习',
    'wrong-notebook': '错题本',
    'weakness-training': '专项训练',
    'knowledge-graph': '我的学习图谱',
    'leetcode-search': 'LeetCode 拓展',
    'leetcode-practice': 'LeetCode 练习',
    profile: '个人设置'
  },
  teacher: {
    dashboard: '首页总览',
    experiments: '实验列表',
    'experiment-detail': '实验详情',
    'experiment-create': '创建实验',
    submissions: '学生提交',
    'submission-detail': '提交详情',
    'class-list': '教学班列表',
    'class-analysis': '教学班分析',
    'class-detailed-analysis': '教学班分析',
    'class-profile': '能力画像',
    profile: '个人设置',
    'ai-recommendation': '教学建议',
    'generate-ppt': '生成 PPT',
    'course-analysis': '课程分析',
    'department-teachers': '教师管理',
    'department-analytics': '院系统计',
    'teacher-ai-management': 'AI 管理',
    'document-center': '文档中心',
    'bilingual-read': '双语阅读',
    'summary-card': 'AI 精读',
    'ai-chat': 'AI 对话',
    'ai-organize': '智能整理',
    grading: 'AI 批改',
    detail: '批改详情',
    submission: '提交批阅',
    demos: '错误演示',
    rubrics: '评分标准',
    'knowledge-base': '课程知识库',
    'rag-analytics': 'RAG 分析',
    'experiment-analytics': '实验数据分析',
    'data-sync': 'PTA 数据同步',
    'leetcode-bank': 'LeetCode 题库'
  },
  admin: {
    dashboard: '首页',
    'user-management': '用户管理',
    'class-management': '班级管理',
    'experiment-management': '实验管理',
    'experiment-screen': '实验大屏',
    'system-log': '系统日志',
    'leetcode-claw': 'LeetCode 采集',
    profile: '个人设置'
  }
}

export function resolveBreadcrumbs(role, path) {
  const labels = breadcrumbLabels[role] || {}
  const segments = String(path || '').split('/').filter(Boolean)
  if (segments[0] !== role) return []
  return segments.slice(1).flatMap((segment) => labels[segment] ? [labels[segment]] : [])
}
