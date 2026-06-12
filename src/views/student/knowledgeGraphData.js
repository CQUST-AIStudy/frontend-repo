export const KNOWLEDGE_STATUS = {
  good: {
    label: '掌握良好',
    color: '#22c55e',
    softColor: '#dcfce7',
    textColor: '#166534',
    icon: 'check'
  },
  medium: {
    label: '掌握中等',
    color: '#facc15',
    softColor: '#fef3c7',
    textColor: '#92400e',
    icon: 'loader'
  },
  weak: {
    label: '掌握薄弱',
    color: '#ff4d4f',
    softColor: '#fee2e2',
    textColor: '#991b1b',
    icon: 'triangle-alert'
  },
  unlearned: {
    label: '未学习',
    color: '#9ca3af',
    softColor: '#f1f5f9',
    textColor: '#475569',
    icon: 'inbox'
  }
}

export const STATUS_ORDER = ['good', 'medium', 'weak', 'unlearned']

export const dataSourceOptions = [
  { label: 'PTA', value: 'pta' },
  { label: '静态演示数据', value: 'demo' }
]

const knowledgeGroups = [
  {
    id: 'basic',
    name: '基础语法',
    status: 'good',
    x: -295,
    y: -145,
    children: [
      { id: 'data-type', name: '数据类型', status: 'good', x: -410, y: -235 },
      { id: 'constant-variable', name: '变量与常量', status: 'good', x: -285, y: -290 },
      { id: 'expression', name: '表达式', status: 'good', x: -430, y: -95 },
      { id: 'input-output', name: '输入输出', status: 'good', x: -310, y: -45 },
      { id: 'operator', name: '运算符', status: 'good', x: -180, y: -225 },
      { id: 'control-statement', name: '控制语句', status: 'good', x: -165, y: -95 }
    ]
  },
  {
    id: 'function',
    name: '函数与模块',
    status: 'good',
    x: 275,
    y: -145,
    children: [
      { id: 'function-definition', name: '函数定义', status: 'weak', x: 185, y: -255 },
      { id: 'parameter', name: '参数传递', status: 'weak', x: 320, y: -275 },
      { id: 'recursion', name: '递归调用', status: 'medium', x: 405, y: -165 },
      { id: 'scope', name: '作用域', status: 'medium', x: 360, y: -45 }
    ]
  },
  {
    id: 'array-string',
    name: '数组与字符串',
    status: 'weak',
    x: 275,
    y: 165,
    children: [
      { id: 'one-d-array', name: '一维数组', status: 'weak', x: 410, y: 90 },
      { id: 'two-d-array', name: '二维数组', status: 'weak', x: 420, y: 230 },
      { id: 'char-array', name: '字符数组', status: 'medium', x: 270, y: 285 },
      { id: 'string-process', name: '字符串处理', status: 'medium', x: 155, y: 215 },
      { id: 'sort-search', name: '排序查找', status: 'medium', x: 155, y: 95 },
      { id: 'array-application', name: '数组应用', status: 'medium', x: 300, y: 55 }
    ]
  },
  {
    id: 'pointer-struct',
    name: '指针与结构体',
    status: 'unlearned',
    x: -275,
    y: 165,
    children: [
      { id: 'pointer-basic', name: '指针基础', status: 'weak', x: -415, y: 90 },
      { id: 'pointer-function', name: '指针与函数', status: 'unlearned', x: -430, y: 225 },
      { id: 'pointer-array', name: '指针与数组', status: 'unlearned', x: -300, y: 285 },
      { id: 'struct', name: '结构体', status: 'unlearned', x: -160, y: 235 },
      { id: 'linked-list', name: '链表基础', status: 'unlearned', x: -155, y: 105 },
      { id: 'file-operation', name: '文件操作', status: 'unlearned', x: -250, y: 45 },
      { id: 'dynamic-memory', name: '动态内存', status: 'unlearned', x: -365, y: 155 }
    ]
  }
]

export const knowledgeGraphRoot = {
  id: 'root',
  name: 'C语言\n程序设计',
  label: 'C语言程序设计',
  status: 'core',
  type: 'root',
  x: 0,
  y: 0,
  symbolSize: 92,
  description: '课程核心能力，覆盖 C 语言基础、函数、数组字符串、指针与结构体。'
}

export const knowledgeGraphNodes = [
  knowledgeGraphRoot,
  ...knowledgeGroups.flatMap(group => [
    {
      ...group,
      type: 'group',
      symbolSize: 68,
      description: `${group.name}知识模块`
    },
    ...group.children.map(child => ({
      ...child,
      parentId: group.id,
      parentName: group.name,
      type: 'knowledge',
      symbolSize: 42,
      description: `${group.name}下的${child.name}知识点`
    }))
  ])
]

export const knowledgeGraphLinks = knowledgeGroups.flatMap(group => [
  { source: 'root', target: group.id },
  ...group.children.map(child => ({ source: group.id, target: child.id }))
])

export const learningPaths = [
  {
    rank: 1,
    knowledgeId: 'function-definition',
    knowledge: '函数定义',
    status: 'weak',
    exerciseCount: 5,
    mastery: 30,
    recommendation: '先补齐函数声明、返回值和形参设计，再做小函数拆分训练。'
  },
  {
    rank: 2,
    knowledgeId: 'one-d-array',
    knowledge: '一维数组',
    status: 'weak',
    exerciseCount: 4,
    mastery: 38,
    recommendation: '重点练习下标边界、遍历统计和数组元素更新。'
  },
  {
    rank: 3,
    knowledgeId: 'two-d-array',
    knowledge: '二维数组',
    status: 'weak',
    exerciseCount: 3,
    mastery: 45,
    recommendation: '用行列遍历、矩阵求和和转置题巩固嵌套循环。'
  },
  {
    rank: 4,
    knowledgeId: 'pointer-basic',
    knowledge: '指针基础',
    status: 'weak',
    exerciseCount: 3,
    mastery: 60,
    recommendation: '先理解地址、解引用和指针变量，再进入数组指针关系。'
  },
  {
    rank: 5,
    knowledgeId: 'recursion',
    knowledge: '递归调用',
    status: 'medium',
    exerciseCount: 2,
    mastery: 70,
    recommendation: '通过阶乘、斐波那契和递归遍历理解出口条件。'
  }
]

export const practiceRecommendations = [
  {
    id: '7-1',
    title: '7-1 输出学生成绩',
    knowledgeId: 'control-statement',
    knowledge: '控制语句',
    difficulty: 'easy',
    passRate: '75.3%',
    reason: '针对分支判断和输出格式进行基础巩固。'
  },
  {
    id: '7-5',
    title: '7-5 使用函数求最大值',
    knowledgeId: 'function-definition',
    knowledge: '函数定义',
    difficulty: 'medium',
    passRate: '62.1%',
    reason: '提升函数定义、参数传递和返回值设计能力。'
  },
  {
    id: '7-8',
    title: '7-8 二维数组的应用',
    knowledgeId: 'two-d-array',
    knowledge: '二维数组',
    difficulty: 'medium',
    passRate: '58.7%',
    reason: '强化二维数组遍历、行列索引和统计逻辑。'
  },
  {
    id: '7-12',
    title: '7-12 指针与函数综合',
    knowledgeId: 'pointer-basic',
    knowledge: '指针基础',
    difficulty: 'hard',
    passRate: '45.2%',
    reason: '综合提升指针传参和函数拆分能力。'
  }
]

export function getStatusStats(nodes = knowledgeGraphNodes) {
  const countableNodes = nodes.filter(node => STATUS_ORDER.includes(node.status))
  const total = countableNodes.length || 1

  return STATUS_ORDER.map(status => {
    const count = countableNodes.filter(node => node.status === status).length
    return {
      status,
      ...KNOWLEDGE_STATUS[status],
      count,
      percentage: Math.round((count / total) * 100)
    }
  })
}

export function findKnowledgeNode(nodeId) {
  return knowledgeGraphNodes.find(node => node.id === nodeId) || knowledgeGraphRoot
}
