/**
 * AI 助手预制询问工具
 *
 * 按 C 语言 + 数据结构杂糅主题构建候选提示词池（40 条），并随机抽取若干条展示。
 * 供学生端 AIAssistant.vue 与教师端 AIChat.vue 复用。
 */

// 学生版 40 条候选提示词（C 语言 + 数据结构杂糅，两类各约一半混合排列）
const STUDENT_PROMPT_TEMPLATES = [
  { label: '指针与数组', prompt: '请用通俗的例子讲清 C 语言里指针和数组的关系，为什么数组名很多时候会"退化"成指针？' },
  { label: '顺序表 vs 链表', prompt: '顺序表和链表各自适合什么场景？请从插入删除、随机访问、内存占用角度对比。' },
  { label: '动态内存', prompt: 'C 语言中 malloc 和 free 配对使用，常见的内存泄漏和悬垂指针问题如何避免？' },
  { label: '二叉树遍历', prompt: '前序、中序、后序遍历的核心区别是什么？给一棵小树带我手推一遍三种结果。' },
  { label: '函数传参', prompt: 'C 语言函数里"值传递"和"指针传递"有什么区别？怎样让函数修改调用方的变量？' },
  { label: '栈与队列', prompt: '栈和队列的核心区别是什么？分别举一个典型应用场景帮我理解。' },
  { label: '结构体内存对齐', prompt: 'C 语言结构体为什么会有内存对齐？`#pragma pack` 是怎么影响结构体大小的？' },
  { label: '复杂度分析', prompt: '如何分析一个算法的时间复杂度和空间复杂度？请用嵌套循环举例说明。' },
  { label: '字符串与字符数组', prompt: 'C 语言里字符串以 `\\0` 结尾，这会带来哪些常见的越界和安全问题？' },
  { label: '排序对比', prompt: '冒泡、选择、插入排序的时间复杂度都是 O(n²)，它们的稳定性与适用场景有何不同？' },
  { label: '作用域与生命周期', prompt: 'C 语言里局部变量、全局变量、static 变量的作用域和生命周期分别是什么？' },
  { label: '哈希表', prompt: '哈希表是如何解决冲突的？拉链法和开放地址法各自的优缺点？' },
  { label: '预处理宏', prompt: '#define 宏和 const 常量、inline 函数相比有哪些坑？宏为什么容易出副作用？' },
  { label: '图的存储', prompt: '邻接矩阵和邻接表各适合什么样的图？稠密图和稀疏图应该怎么选？' },
  { label: '文件读写', prompt: 'C 语言用 fopen/fread/fwrite 读写二进制文件时，有哪些容易踩的坑？' },
  { label: '递归思想', prompt: '写递归时如何确定递归终止条件和状态转移？请用阶乘和斐波那契带我入门。' },
  { label: '位运算技巧', prompt: 'C 语言的位运算有哪些实用技巧？如何用位运算快速判断奇偶、交换两数？' },
  { label: '查找算法', prompt: '二分查找的边界总是写错，有没有通用的左闭右开模板？请演示。' },
  { label: '编译与链接', prompt: 'C 程序从源码到可执行文件，编译和链接阶段分别做了什么？头文件起什么作用？' },
  { label: '链表反转', prompt: '请逐步讲解单链表反转的迭代写法和递归写法，并分析各自的空间复杂度。' },
  { label: '指针函数与回调', prompt: '函数指针怎么用？回调函数机制是如何实现"策略可替换"的？给个简单例子。' },
  { label: '堆与优先队列', prompt: '堆和优先队列是什么关系？堆排序的过程是怎样的？为什么建堆是 O(n)？' },
  { label: '调试段错误', prompt: 'C 程序运行时报段错误（segmentation fault），应该按什么思路系统排查？' },
  { label: '平衡二叉树', prompt: '为什么需要平衡二叉树？AVL 树通过什么操作维持平衡？' },
  { label: 'enum 与 #define', prompt: 'C 语言枚举和 #define 定义常量各有什么优劣？什么时候该用 enum？' },
  { label: '动态规划入门', prompt: '如何判断一道题适合用动态规划？请用"爬楼梯"带我理解状态转移方程。' },
  { label: '多文件工程', prompt: '一个 C 工程拆成多个 .c/.h 文件时，声明和定义应如何组织才不易出链接错误？' },
  { label: '并查集', prompt: '并查集的思想是什么？路径压缩和按秩合并如何提升效率？给个简单例子。' },
  { label: 'void 指针', prompt: 'C 语言的 void* 指针有什么用？为什么它常出现在通用函数（如 qsort）里？' },
  { label: '图的最短路径', prompt: 'Dijkstra 和 Bellman-Ford 算法各自适合什么场景？为什么 Dijkstra 不能处理负权边？' },
  { label: '函数递归栈溢出', prompt: 'C 语言递归太深会导致栈溢出，如何把递归改写成迭代来规避？' },
  { label: '贪心 vs DP', prompt: '贪心算法和动态规划怎么区分？请用找零钱问题对比说明。' },
  { label: 'const 与指针', prompt: 'C 语言里 `const int* p`、`int* const p`、`const int* const p` 三者有何区别？' },
  { label: '栈的实现', prompt: '用数组实现一个栈，需要处理哪些边界情况？如何做到动态扩容？' },
  { label: 'typedef 用法', prompt: 'C 语言的 typedef 有什么用？给结构体起别名时有哪些常见写法和坑？' },
  { label: '二叉搜索树', prompt: '二叉搜索树的查找、插入、删除过程是怎样的？删除节点有子树时如何处理？' },
  { label: '指针数组 vs 数组指针', prompt: '`int* arr[10]` 和 `int (*arr)[10]` 有什么区别？这种声明怎么快速读懂？' },
  { label: '考试易错点', prompt: 'C 语言和数据结构考试里，同学们最容易丢分的细节有哪些？请帮我梳理。' },
  { label: '代码可读性', prompt: 'C 语言作业里，怎样命名和拆分函数才更易读、易维护？给几条实用建议。' },
  { label: '复习计划', prompt: '请帮我制定一份两周的 C 语言+数据结构强化复习计划，覆盖核心考点。' }
]

// 教师版 40 条候选提示词（C 语言教学 + 数据结构教学杂糅）
const TEACHER_PROMPT_TEMPLATES = [
  { label: '指针难点突破', prompt: '学生在 C 语言指针上普遍吃力，请设计一套由浅入深的讲解策略，含生活化比喻。' },
  { label: '实验设计', prompt: '帮我设计一节"二叉树遍历"实验课的分层提问链路，照顾不同水平学生。' },
  { label: '内存管理教学', prompt: '如何向学生讲清 C 语言 malloc/free 的配对使用与常见内存错误？给教学脚本。' },
  { label: '课堂讲解', prompt: '帮我生成"栈和队列"的课堂讲解提纲，含板书要点和提问设计。' },
  { label: '数组越界错题', prompt: '学生在数组越界题上常犯哪些错误？如何针对性讲解并设计防错练习？' },
  { label: '错误分析', prompt: '学生在链表反转题上常犯哪些错误？如何针对性讲解并给出诊断清单？' },
  { label: '函数传参讲解', prompt: '如何向学生讲清 C 语言值传递与指针传递的本质区别？请设计对比示例。' },
  { label: '反馈润色', prompt: '帮我润色一段给学生的实验反馈，语气鼓励且具体，含可执行的改进建议。' },
  { label: '预处理宏易错点', prompt: '请归纳 #define 宏使用中学生最常踩的 5 个坑，并给配套练习。' },
  { label: '命题出题', prompt: '请为 C 语言+数据结构期中考试命制 5 道不同难度、覆盖核心考点的题目。' },
  { label: '结构体内存对齐', prompt: '结构体内存对齐是难点，请设计一节 20 分钟的微课讲解流程。' },
  { label: '排序算法对比', prompt: '请设计"四种排序算法对比"的课堂活动，含可视化演示流程和提问。' },
  { label: '字符串与字符数组', prompt: '学生常混淆 C 语言字符串与字符数组，如何用一组对比案例讲透？' },
  { label: '学情分析', prompt: '根据近期 C 语言+数据结构作业提交情况，帮我总结班级共性薄弱点。' },
  { label: '文件 IO 教学', prompt: 'C 语言文件读写教学如何组织？请给一个由读文本到写二进制的递进任务。' },
  { label: '复习提纲', prompt: '帮我整理一份 C 语言+数据结构期末复习提纲，标注重点与易错点。' },
  { label: '递归难点突破', prompt: '递归是教学难点，请给一套从画调用栈到改写迭代的突破方案。' },
  { label: '实验报告评分', prompt: '为数据结构实验报告制定一份清晰的评分量规（rubric），含分项细则。' },
  { label: '位运算教学', prompt: '位运算学生觉得抽象，请设计贴近底层存储的讲解与配套练习。' },
  { label: '课堂导入', prompt: '为"图的最短路径"设计一个贴近生活的课堂导入，激发学生兴趣。' },
  { label: '编译链接讲解', prompt: '如何向学生讲清 C 程序的编译与链接过程？请用一次命令行演示串联。' },
  { label: '互动提问', prompt: '课堂上可以用哪些开放式问题引导学生主动思考指针与内存的关系？' },
  { label: '调试示范', prompt: '请设计一次课堂调试示范，用 gdb/打印法定位一个段错误，含讲评要点。' },
  { label: '错题归因', prompt: '帮我把本次数据结构作业的典型错误按知识模块归类并给讲评建议。' },
  { label: '函数指针与回调', prompt: '如何向学生讲清函数指针与回调机制？请用 qsort 的比较函数做案例。' },
  { label: '堆与优先队列', prompt: '请设计"堆与优先队列"的课堂讲解，含建堆过程演示与复杂度分析。' },
  { label: '多文件工程组织', prompt: 'C 语言多文件工程如何组织 .c/.h？请给一份教学示例与常见链接错误清单。' },
  { label: '可视化演示', prompt: '为"动态规划"设计一个课堂可视化演示流程，展示状态转移过程。' },
  { label: '作业布置', prompt: '为本周 C 语言+数据结构内容设计一份分层作业清单（基础/进阶/挑战）。' },
  { label: '学困生辅导', prompt: 'C 语言基础薄弱的学生应从哪里入手补强？请给一份针对性方案。' },
  { label: 'void 指针讲解', prompt: '如何讲清 void* 的用途与限制？请结合通用数据结构（如泛型栈）举例。' },
  { label: '并查集教学', prompt: '并查集思想较抽象，请设计一个由合并集合到路径压缩的递进教学案例。' },
  { label: '课堂小结', prompt: '为本节 C 语言课写一段 2 分钟的课堂小结话术，呼应重点。' },
  { label: '项目化任务', prompt: '设计一个小型项目化任务，综合运用 C 语言与多种数据结构（如简易通讯录）。' },
  { label: 'const 与指针', prompt: '请设计一组对比练习，帮学生区分 const 修饰指针的几种写法。' },
  { label: '预习导学', prompt: '为下一节"树"设计一份预习导学单，含前置概念自测。' },
  { label: '二叉搜索树', prompt: '请设计"二叉搜索树"删除节点的教学讲解，重点突破双子树情况。' },
  { label: '学情预警', prompt: '根据提交数据，哪些学生可能在 C 语言+数据结构掉队？如何早干预？' },
  { label: '考核方式', prompt: 'C 语言+数据结构过程性考核可以怎么设计才更公平有效？请给建议。' },
  { label: '复习课设计', prompt: '设计一节期末复习课，含知识梳理+典型题+互动，覆盖两门课核心。' }
]

/**
 * 按角色构建候选提示词池。
 * @param {'student'|'teacher'} role 角色
 * @returns {Array<{label:string,prompt:string}>}
 */
export function buildQuickPromptPool(role) {
  const templates = role === 'teacher' ? TEACHER_PROMPT_TEMPLATES : STUDENT_PROMPT_TEMPLATES
  return templates.map((item) => ({ label: item.label, prompt: item.prompt }))
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
