/**
 * AI 助手预制询问工具
 *
 * 根据课程名称构建候选提示词池（40 条），并从中随机抽取若干条展示。
 * 供学生端 AIAssistant.vue 与教师端 AIChat.vue 复用。
 */

const DEFAULT_COURSE_NAME = '数据结构'

/**
 * 规整课程名：去首尾空白；剥离尾部 "-N班"/"(N班)" 之类后缀，得到更干净的课程名。
 * 仅做轻量处理，匹配不到则原样返回。
 */
function normalizeCourseName(courseName) {
  const raw = (courseName || '').trim()
  if (!raw) return DEFAULT_COURSE_NAME
  return raw.replace(/[-—]\s*\d+\s*班\s*$/, '').replace(/[（(]\s*\d+\s*班\s*[)）]\s*$/, '').trim() || raw
}

// 学生版 40 条候选提示词模板（{course} 会被替换为课程名）
const STUDENT_PROMPT_TEMPLATES = [
  { label: '顺序表 vs 链表', prompt: '请结合「{course}」课程，解释顺序表和链表的区别，并给出适用场景。' },
  { label: '树的遍历', prompt: '在「{course}」中，前序、中序、后序遍历分别是什么？有什么好记的方法？' },
  { label: '复杂度分析', prompt: '如何分析一个「{course}」算法的时间复杂度和空间复杂度？请举例说明。' },
  { label: '查找算法优化', prompt: '我应该如何优化「{course}」里的查找算法？请给出常见思路。' },
  { label: '栈与队列', prompt: '「{course}」里栈和队列的区别是什么？各有哪些典型应用？' },
  { label: '二叉树性质', prompt: '请帮我梳理「{course}」中二叉树的常用性质，并说明如何记忆。' },
  { label: '图的最短路径', prompt: '「{course}」中求最短路径有哪些算法？它们各自适用的场景是什么？' },
  { label: '排序对比', prompt: '请对比「{course}」中常见排序算法的时间复杂度与稳定性。' },
  { label: '递归思想', prompt: '「{course}」中递归的核心思想是什么？写递归时容易忽略哪些边界？' },
  { label: '哈希表', prompt: '「{course}」里哈希表是如何解决冲突的？各种方法的优缺点？' },
  { label: '指针与引用', prompt: '学习「{course}」时，指针/引用总搞混，能否用通俗例子讲清楚？' },
  { label: '调试思路', prompt: '我在「{course}」编程题里遇到段错误，应该如何系统地定位？' },
  { label: '复习重点', prompt: '「{course}」期末复习，哪些知识点最值得花时间？请帮我列个优先级。' },
  { label: '错题复盘', prompt: '我在「{course}」某道题上反复出错，请帮我分析可能的认知盲点。' },
  { label: '应用场景', prompt: '「{course}」学的内容，在实际工程中有哪些典型应用？' },
  { label: '概念辨析', prompt: '请帮我辨析「{course}」中"栈帧"和"调用栈"这两个概念。' },
  { label: '代码可读性', prompt: '「{course}」作业里，怎样写代码才更易读、易维护？给几条建议。' },
  { label: '刷题策略', prompt: '针对「{course}」，应该如何安排刷题节奏才能稳步提升？' },
  { label: '图论入门', prompt: '「{course}」图论部分对新手太难，能否给一条由浅入深的学习路径？' },
  { label: '动态规划', prompt: '「{course}」里的动态规划，如何判断一道题该用 DP？请给判别要点。' },
  { label: '贪心 vs DP', prompt: '「{course}」中贪心算法和动态规划怎么区分？举对比例子说明。' },
  { label: '链表反转', prompt: '请逐步讲解「{course}」中单链表反转的迭代与递归写法。' },
  { label: '队列实现栈', prompt: '用两个队列实现一个栈，「{course}」里这题的核心思路是什么？' },
  { label: '二分查找', prompt: '「{course}」二分查找的边界总是写错，有什么通用模板吗？' },
  { label: '平衡树', prompt: '为什么需要平衡二叉树？「{course}」里 AVL/红黑树解决了什么问题？' },
  { label: '堆与优先队列', prompt: '「{course}」中堆和优先队列是什么关系？堆排序的过程是怎样的？' },
  { label: '并查集', prompt: '「{course}」并查集的思想和路径压缩如何理解？给个简单例子。' },
  { label: '字符串匹配', prompt: '「{course}」里 KMP 算法的 next 数组怎么手算？请一步步演示。' },
  { label: '时间复杂度估算', prompt: '给定一段「{course}」嵌套循环代码，如何快速估算它的时间复杂度？' },
  { label: '空间换时间', prompt: '「{course}」里"空间换时间"的典型例子有哪些？什么场合值得换？' },
  { label: '抽象数据类型', prompt: '「{course}」常说的 ADT（抽象数据类型）到底是什么意思？' },
  { label: '链表环检测', prompt: '如何判断单链表有环？「{course}」里快慢指针法的原理是什么？' },
  { label: '图的存储', prompt: '「{course}」中邻接矩阵和邻接表各适合什么场景？为什么？' },
  { label: '递归转迭代', prompt: '「{course}」里如何把一个递归算法改写成迭代？请给通用步骤。' },
  { label: '考试易错点', prompt: '「{course}」考试里，同学们最容易丢分的细节有哪些？' },
  { label: '伪代码转代码', prompt: '我看得懂「{course}」伪代码但写不出可运行程序，怎么克服？' },
  { label: '算法选型', prompt: '面对一个新问题，如何在「{course}」学过的结构里选合适的？' },
  { label: '学习计划', prompt: '请帮我制定一份两周的「{course}」强化学习计划。' },
  { label: '概念联系', prompt: '请用一张关系图说明「{course}」各数据结构之间的联系与转化。' },
  { label: '作业求助', prompt: '我正在做「{course}」的一道作业题卡住了，请引导我理清思路而不是直接给答案。' }
]

// 教师版 40 条候选提示词模板
const TEACHER_PROMPT_TEMPLATES = [
  { label: '实验设计', prompt: '帮我设计一节「{course}」二叉树遍历实验课的分层提问链路。' },
  { label: '课堂讲解', prompt: '帮我生成「{course}」"栈和队列"的课堂讲解提纲。' },
  { label: '错误分析', prompt: '学生在「{course}」链表反转题上常犯哪些错误？如何针对性讲解？' },
  { label: '反馈润色', prompt: '帮我润色一段给学生的「{course}」实验反馈，语气鼓励且具体。' },
  { label: '命题出题', prompt: '请为「{course}」期中考试命制 5 道不同难度、覆盖核心章节的题目。' },
  { label: '教学难点', prompt: '「{course}」中"递归"是教学难点，请给一套循序渐进的讲解策略。' },
  { label: '学情分析', prompt: '根据近期「{course}」作业提交情况，帮我总结班级共性薄弱点。' },
  { label: '课堂导入', prompt: '为「{course}」"图的最短路径"设计一个贴近生活的课堂导入。' },
  { label: '习题讲解', prompt: '请帮我梳理「{course}」某道高频错题的讲评要点和板书思路。' },
  { label: '分层任务', prompt: '为「{course}」实验设计基础/进阶/挑战三层任务，照顾不同水平学生。' },
  { label: '概念辨析讲解', prompt: '如何向学生讲清「{course}」中"指针"与"引用"的区别？' },
  { label: '复习提纲', prompt: '帮我整理一份「{course}」期末复习提纲，标注重点与易错点。' },
  { label: '实验报告评分', prompt: '为「{course}」实验报告制定一份清晰的评分量规（rubric）。' },
  { label: '互动提问', prompt: '「{course}」课堂上，可以用哪些开放式问题引导学生主动思考？' },
  { label: '代码评讲', prompt: '请帮我评讲一段学生提交的「{course}」代码，指出可优化处。' },
  { label: '作业布置', prompt: '为「{course}」本周内容设计一份分层作业清单。' },
  { label: '知识点串联', prompt: '如何在「{course}」一节课里把"栈"和"递归"自然串联起来？' },
  { label: '学困生辅导', prompt: '「{course}」基础薄弱的学生，应该从哪里入手补强？给个方案。' },
  { label: '进度调整', prompt: '「{course}」教学进度偏慢，如何在保证理解的前提下合理提速？' },
  { label: '可视化演示', prompt: '为「{course}」"排序算法"设计一个课堂可视化演示流程。' },
  { label: '易错点归纳', prompt: '请归纳「{course}」"指针与内存"部分学生最常踩的 5 个坑。' },
  { label: '案例驱动', prompt: '用一个工程案例把「{course}」"哈希表"讲透彻，请给教学脚本。' },
  { label: '小测设计', prompt: '设计一份 15 分钟的「{course}」随堂小测，覆盖上周内容。' },
  { label: '答疑话术', prompt: '学生问"「{course}」学这些有什么用"，我该怎么回答更有说服力？' },
  { label: '对比教学', prompt: '请设计"顺序表 vs 链表"的对比教学活动，含板书与提问。' },
  { label: '项目化任务', prompt: '为「{course}」设计一个小型项目化任务，综合运用多种数据结构。' },
  { label: '错题归因', prompt: '帮我把「{course}」本次作业的典型错误按知识模块归类并给讲评建议。' },
  { label: '课堂小结', prompt: '为「{course}」本节课写一段 2 分钟的课堂小结话术。' },
  { label: '预习导学', prompt: '为「{course}」下一节"树"设计一份预习导学单。' },
  { label: '考核方式', prompt: '「{course}」过程性考核可以怎么设计才更公平有效？' },
  { label: '难点突破', prompt: '「{course}」"动态规划"学生普遍反映难，请给一套突破方案。' },
  { label: '分组讨论', prompt: '设计一个「{course}」分组讨论任务，明确角色与产出要求。' },
  { label: '教学反思', prompt: '帮我写一段「{course}」本周教学反思，聚焦学生反馈。' },
  { label: '知识点地图', prompt: '请绘制「{course}」整学期知识点地图，标注先后依赖关系。' },
  { label: '习题变式', prompt: '基于一道「{course}」经典题，生成 3 个层层递进的变式题。' },
  { label: '实验指导书', prompt: '帮我起草「{course}」下一个实验的指导书框架（含目标/步骤/验收）。' },
  { label: '学情预警', prompt: '根据提交数据，哪些学生可能在「{course}」掉队？如何早干预？' },
  { label: '概念可视化', prompt: '用比喻把「{course}」"栈"讲清楚，给一段课堂话术。' },
  { label: '复习课设计', prompt: '设计一节「{course}」期末复习课，含知识梳理+典型题+互动。' },
  { label: '教学目标', prompt: '为「{course}」下一节课写一份可测量的教学目标（知识/能力/素养）。' }
]

function fillTemplate(template, courseName) {
  return template.prompt.replace(/\{course\}/g, courseName)
}

/**
 * 按角色构建候选提示词池。
 * @param {string} courseName 课程名称（为空时兜底为"数据结构"）
 * @param {'student'|'teacher'} role 角色
 * @returns {Array<{label:string,prompt:string}>}
 */
export function buildQuickPromptPool(courseName, role) {
  const course = normalizeCourseName(courseName)
  const templates = role === 'teacher' ? TEACHER_PROMPT_TEMPLATES : STUDENT_PROMPT_TEMPLATES
  return templates.map((item) => ({ label: item.label, prompt: fillTemplate(item, course) }))
}

/**
 * 从提示词池中不重复随机抽取 count 条。
 * 使用 Fisher-Yates 部分洗牌；count 大于池长度时返回全部（已洗牌）。
 * @param {Array<{label:string,prompt:string}>} pool
 * @param {number} count 默认 4
 * @returns {Array<{label:string,prompt:string}>}
 */
export function samplePrompts(pool, count = 4) {
  const arr = Array.isArray(pool) ? pool.slice() : []
  const n = Math.min(Math.max(count, 0), arr.length)
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (arr.length - i))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, n)
}
