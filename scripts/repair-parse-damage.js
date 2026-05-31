const fs = require('fs')

const edits = {
  'src/api/index.js': [
    ["return Promise.reject(createFriendlyError(error, '请求发送失败，请稍后重试));", "return Promise.reject(createFriendlyError(error, '请求发送失败，请稍后重试'));"],
    ["friendlyError.friendlyMessage === '登录已过期，请重新登录) {", "friendlyError.friendlyMessage === '登录已过期，请重新登录') {"],
    ["friendlyError.message = '登录已过期，请重新登录\n", "friendlyError.message = '登录已过期，请重新登录'\n"],
    ["message: getFriendlyErrorMessage(error, '登录过程中发生错误，请稍后重试),", "message: getFriendlyErrorMessage(error, '登录过程中发生错误，请稍后重试'),"],
    ["class: '计算机科学班,", "class: '计算机科学班',"],
    ["aiRemarks: '第一题评语 代码实现正确，符合题意。第二题评语: 代码实现正确，符合题意。第三题评语: 代码实现正确，符合题意。总评语：代码质量良好，符合实验要求。,", "aiRemarks: '第一题评语 代码实现正确，符合题意。第二题评语: 代码实现正确，符合题意。第三题评语: 代码实现正确，符合题意。总评语：代码质量良好，符合实验要求。',"]
  ],
  'src/store/index.js': [
    ["message: '登录成功但未获取到用户信息 }", "message: '登录成功但未获取到用户信息' }"],
    ["- 姓名：{userData.studentName || ''}", "- 姓名：${userData.studentName || ''}"],
    ["- 学号：{userData.studentId || ''}", "- 学号：${userData.studentId || ''}"],
    ["- 班级：{userData.className || ''}", "- 班级：${userData.className || ''}"],
    ["${userData.content || '待补充}", "${userData.content || '待补充'}"],
    ["${userData.experience || '待补充}", "${userData.experience || '待补充'}"],
    ["'实验代码见实验平台}", "'实验代码见实验平台'}"]
  ],
  'src/utils/chartHelpers.js': [
    ["logger.error('chartRefs蹇呴』鏄暟缁?)", "logger.error('chartRefs必须是数组')"]
  ],
  'src/utils/chartUtils.js': [
    ["logger.error('鍥捐〃瀹瑰櫒鏈壘鍒?)", "logger.error('图表容器未找到')"]
  ],
  'src/utils/resizeUtils.js': [
    ["logger.error('charts鍙傛暟蹇呴』鏄暟缁?)", "logger.error('charts参数必须是数组')"]
  ],
  'src/utils/testLeetCode.js': [
    ["skillSuggestions: ['数组操作', '算法优化', '哈希表应用]", "skillSuggestions: ['数组操作', '算法优化', '哈希表应用']"]
  ],
  'src/views/admin/ClassManagement.vue': [
    ['placeholder="例如：计算机科学与技术珀/>', 'placeholder="例如：计算机科学与技术1班" />'],
    ["name: '计算机科学与技术珀,", "name: '计算机科学与技术1班',"],
    ["message: '请输入班级名称, trigger: 'blur'", "message: '请输入班级名称', trigger: 'blur'"],
    ["message: '请选择班主任, trigger: 'change'", "message: '请选择班主任', trigger: 'change'"]
  ],
  'src/views/admin/ExperimentManagement.vue': [
    ["name: '计算机科学与技术珀 },", "name: '计算机科学与技术1班' },"],
    ["experimentForm.description = '此处为实验描述示例文本，实际应从后端获取。", "experimentForm.description = '此处为实验描述示例文本，实际应从后端获取。'"],
    ["ElMessageBox.confirm(`确定要删除实验${row.title}\"吗？此操作不可逆`, '警告', {", "ElMessageBox.confirm(`确定要删除实验“${row.title}”吗？此操作不可逆`, '警告', {"]
  ],
  'src/views/admin/Layout.vue': [
    ["const userInfo = computed(() => userStore.userInfo || { name: '管理员 })", "const userInfo = computed(() => userStore.userInfo || { name: '管理员' })"],
    ["'PTA 登录凭证已过期，自动登录重试失败。请通知相关教师在班级管理的 PTA 同步设置中手动更新Cookie，或检查爬虫服务器网络连接。,", "'PTA 登录凭证已过期，自动登录重试失败。请通知相关教师在班级管理的 PTA 同步设置中手动更新Cookie，或检查爬虫服务器网络连接。',"]
  ],
  'src/views/admin/UserManagement.vue': [
    ["ElMessage.warning('用户管理真实后端尚未接通，当前页面仅保留只读展示。)", "ElMessage.warning('用户管理真实后端尚未接通，当前页面仅保留只读展示。')"]
  ],
  'src/views/student/AIReport.vue': [
    ["'completed': '已完成,", "'completed': '已完成',"],
    ["'in_progress': '进行中,", "'in_progress': '进行中',"],
    ["'not_started': '未开始\n", "'not_started': '未开始'\n"],
    ["return statusMap[status] || '未知状态\n", "return statusMap[status] || '未知状态'\n"]
  ],
  'src/views/student/Dashboard.vue': [
    ["desc: '精准定位薄弱知识点, path: '/student/learning-analysis'", "desc: '精准定位薄弱知识点', path: '/student/learning-analysis'"]
  ],
  'src/views/student/ExperimentDetail.vue': [
    ["const statusText = computed(() => ({ completed: '已完成, in_progress: '进行中 }[currentExp.value?.status] || '未开始))", "const statusText = computed(() => ({ completed: '已完成', in_progress: '进行中' }[currentExp.value?.status] || '未开始')"]
  ],
  'src/views/student/ExperimentList.vue': [
    ["{ key: 'completed', label: '已完成, count: completedExperiments.value.length }", "{ key: 'completed', label: '已完成', count: completedExperiments.value.length }"]
  ],
  'src/views/student/Layout.vue': [
    ["ElMessageBox.confirm('确定要退出登录吗？, '提示', {", "ElMessageBox.confirm('确定要退出登录吗？', '提示', {"]
  ],
  'src/views/student/LearningAnalysis.vue': [
    ["return name && name.length > 8 ? name.substring(0, 8) + '… : name", "return name && name.length > 8 ? name.substring(0, 8) + '…' : name"]
  ],
  'src/views/student/Practice.vue': [
    ["ElMessage.warning('该题目暂不支持在线练习)", "ElMessage.warning('该题目暂不支持在线练习')"]
  ],
  'src/views/student/WeaknessTraining.vue': [
    ["{ label: '待巩固模块, value: weaknessCards.value.length, tip: '来自画像中的薄弱点, icon: DataAnalysis, bg: '#e8f0fe', color: '#1a73e8' }", "{ label: '待巩固模块', value: weaknessCards.value.length, tip: '来自画像中的薄弱点', icon: DataAnalysis, bg: '#e8f0fe', color: '#1a73e8' }"]
  ],
  'src/views/student/updateAnalysisDataHelper.js': [
    ["logger.warn('实验列表为空，无法更新分析数据);", "logger.warn('实验列表为空，无法更新分析数据');"]
  ],
  'src/views/teacher/AIRecommendation.vue': [
    ["if (!normalized) return '未命名实验\n", "if (!normalized) return '未命名实验'\n"]
  ],
  'src/views/teacher/BilingualRead.vue': [
    ["error.value = '翻译服务未配置API Key，当前使用模拟翻译模式\n", "error.value = '翻译服务未配置API Key，当前使用模拟翻译模式'\n"]
  ],
  'src/views/teacher/ClassAnalysis.vue': [
    ["logger.debug('未指定班级ID，尝试加载第一个班级)", "logger.debug('未指定班级ID，尝试加载第一个班级')"]
  ],
  'src/views/teacher/ClassDetailedAnalysis.vue': [
    ["aiAdvice.classOverview = '暂无学生数据，无法生成教学建议。\n", "aiAdvice.classOverview = '暂无学生数据，无法生成教学建议。'\n"]
  ],
  'src/views/teacher/ClassList.vue': [
    ["name: [{ required: true, message: '请输入班级名称, trigger: 'blur' }]", "name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }]"]
  ],
  'src/views/teacher/ClassProfile.vue': [
    ["logger.warn('[ClassProfile] barChartRef 未就绪)", "logger.warn('[ClassProfile] barChartRef 未就绪')"]
  ],
  'src/views/teacher/ClassSelector.vue': [
    ['>鐝?/div>', '>班</div>'],
    ["{{ cls.courseName || '鏈缃绋? }} 路 {{ cls.studentCount || 0 }} 浜?/span>", "{{ cls.courseName || '未设置课程' }} · {{ cls.studentCount || 0 }} 人</span>"],
    ['<el-empty v-else description="浣犺繕娌℃湁鍒涘缓浠讳綍鏁欏鐝?>', '<el-empty v-else description="你还没有创建任何教学班">'],
    ['>鍘诲垱寤烘暀瀛︾彮</el-button>', '>去创建教学班</el-button>']
  ],
  'src/views/teacher/CourseAnalysis.vue': [
    ["if (!normalized) return '未命名实验\n", "if (!normalized) return '未命名实验'\n"]
  ],
  'src/views/teacher/Dashboard.vue': [
    ["hint: '当前已创建实验,", "hint: '当前已创建实验',"]
  ],
  'src/views/teacher/DepartmentAnalytics.vue': [
    ["formatter: '{b}\\n{c}人 }", "formatter: '{b}\\n{c}人' }"]
  ],
  'src/views/teacher/DepartmentTeachers.vue': [
    ['label="用户名 width="140"', 'label="用户名" width="140"'],
    ['label="学生数 width="100"', 'label="学生数" width="100"']
  ],
  'src/views/teacher/DocumentCenter.vue': [
    ["throw new Error('创建文件夹失败)", "throw new Error('创建文件夹失败')"]
  ],
  'src/views/teacher/ExperimentAnalytics.vue': [
    ["const EXPERIMENT_LIST_ERROR_TEXT = '实验列表暂时无法加载，请稍后重试；如持续出现，请联系管理员检查数据服务。\n", "const EXPERIMENT_LIST_ERROR_TEXT = '实验列表暂时无法加载，请稍后重试；如持续出现，请联系管理员检查数据服务。'\n"]
  ],
  'src/views/teacher/ExperimentCreate.vue': [
    ["message: '请输入实验名称, trigger: 'blur'", "message: '请输入实验名称', trigger: 'blur'"]
  ],
  'src/views/teacher/ExperimentDetail.vue': [
    ["text: '提交状态分布,", "text: '提交状态分布',"]
  ],
  'src/views/teacher/ExperimentList.vue': [
    ["const getStatusText = s => ({ active: '进行中, draft: '草稿', expired: '已截止 }[s] || '未知')", "const getStatusText = s => ({ active: '进行中', draft: '草稿', expired: '已截止' }[s] || '未知')"]
  ],
  'src/views/teacher/GradingCenter.vue': [
    ["return { PENDING: '等待中, PROCESSING: '处理中, COMPLETED: '已完成, FAILED: '失败' }[s] || s", "return { PENDING: '等待中', PROCESSING: '处理中', COMPLETED: '已完成', FAILED: '失败' }[s] || s"]
  ],
  'src/views/teacher/MyTeachingAnalysis.vue': [
    ["const grade = match ? match[1] + '级 : '其他'", "const grade = match ? match[1] + '级' : '其他'"]
  ],
  'src/views/teacher/RagAnalytics.vue': [
    ["if (total === 0) return '—\n", "if (total === 0) return '—'\n"]
  ],
  'src/views/teacher/SubmissionDetail.vue': [
    ["content: `得分: ${s.score || '未评分} | 状态 ${s.status === 'completed' ? '已完成 : '进行中}`,", "content: `得分: ${s.score || '未评分'} | 状态 ${s.status === 'completed' ? '已完成' : '进行中'}`,"],
    ["join('、)}`", "join('、')}`"],
    ["`当前平均成绩为{Math.round(avgScore * 10) / 10}分", "`当前平均成绩为${Math.round(avgScore * 10) / 10}分"],
    ["`目前完成了{completed}/${total}个实验", "`目前完成了${completed}/${total}个实验"],
    ["title: '表现优秀，继续保持,", "title: '表现优秀，继续保持',"],
    ["const aiComment = '代码实现了基本的链表功能，包括创建、插入和遍历操作。优点是结构清晰，函数命名规范；不足之处是缺少必要的错误处理，例如内存分配失败的情况没有处理。 +\n        '建议优化内存管理，添加链表删除节点的功能，并完善错误处理机制。总体来说，这是一个良好的实现，展示了对链表基本概念的理解。", "const aiComment = '代码实现了基本的链表功能，包括创建、插入和遍历操作。优点是结构清晰，函数命名规范；不足之处是缺少必要的错误处理，例如内存分配失败的情况没有处理。' +\n        '建议优化内存管理，添加链表删除节点的功能，并完善错误处理机制。总体来说，这是一个良好的实现，展示了对链表基本概念的理解。'"],
    ["ElMessageBox.confirm('确定要重新生成AI评语吗？这将覆盖当前的评语。, '提示', {", "ElMessageBox.confirm('确定要重新生成AI评语吗？这将覆盖当前的评语。', '提示', {"],
    ["ElMessage.success('代码已复制到剪贴板)", "ElMessage.success('代码已复制到剪贴板')"],
    ["ElMessage.warning('没有报告数据可下载)", "ElMessage.warning('没有报告数据可下载')"],
    ["logger.debug('ReportGenerator组件已挂载，初始化报告数据);", "logger.debug('ReportGenerator组件已挂载，初始化报告数据');"]
  ],
  'src/views/teacher/SubmissionList.vue': [
    ["ElMessage.info('批量评分功能暂未实现。)", "ElMessage.info('批量评分功能暂未实现。')"],
    ["ElMessage.error(`加载学生提交失败：{error?.message || '未知错误'}`)", "ElMessage.error(`加载学生提交失败：${error?.message || '未知错误'}`)"],
    ["ElMessage.error('提交评分失败，请重试。)", "ElMessage.error('提交评分失败，请重试。')"]
  ],
  'src/views/teacher/SummaryCard.vue': [
    ["生成精读卡/p>", "生成精读卡</p>"],
    ["`引擎：{d.provider} | 模型：{d.model} | 字数：{d.charCountZh}`", "`引擎：${d.provider} | 模型：${d.model} | 字数：${d.charCountZh}`"],
    ["error.value = 'arXiv 论文抓取超时，请稍后重试。部分论文PDF 较大，可能需要更长时间。", "error.value = 'arXiv 论文抓取超时，请稍后重试。部分论文PDF 较大，可能需要更长时间。'"],
    ["`《{d.title}》| 引擎：{d.provider}`", "`《${d.title}》| 引擎：${d.provider}`"],
    ["`引擎：{d.provider} | 字数：{d.charCountZh}`", "`引擎：${d.provider} | 字数：${d.charCountZh}`"]
  ],
  'src/views/teacher/TeacherAIManagement.vue': [
    ["{ label: '平均完成率, value: '-' }", "{ label: '平均完成率', value: '-' }"]
  ]
}

let touched = 0
for (const [file, replacements] of Object.entries(edits)) {
  let text = fs.readFileSync(file, 'utf8')
  const before = text
  for (const [from, to] of replacements) {
    text = text.split(from).join(to)
  }
  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8')
    touched += 1
  }
}
console.log(`touched=${touched}`)
