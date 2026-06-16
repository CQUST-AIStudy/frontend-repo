export const GRAPH_CODE = 'data-structure-knowledge-graph'
export const GRAPH_VERSION = '1.1.0'
export const GRAPH_SOURCE = {
  system: 'frontend-repo',
  scenario: 'course-chapter-knowledge-graph',
  origin: 'frontend-only'
}

export const NODE_TYPES = {
  course: {
    label: '课程',
    color: '#1270d8',
    softColor: '#dbeafe',
    textColor: '#fff',
    icon: 'library'
  },
  chapter: {
    label: '章节',
    color: '#0f766e',
    softColor: '#ccfbf1',
    textColor: '#134e4a',
    icon: 'folder'
  },
  concept: {
    label: '概念',
    color: '#7c3aed',
    softColor: '#ede9fe',
    textColor: '#5b21b6',
    icon: 'tags'
  },
  structure: {
    label: '结构',
    color: '#ea580c',
    softColor: '#ffedd5',
    textColor: '#9a3412',
    icon: 'layout-grid'
  },
  algorithm: {
    label: '算法',
    color: '#0ea5e9',
    softColor: '#e0f2fe',
    textColor: '#075985',
    icon: 'sparkles'
  },
  operation: {
    label: '操作',
    color: '#f59e0b',
    softColor: '#fef3c7',
    textColor: '#92400e',
    icon: 'clipboard-check'
  },
  exercise: {
    label: '练习',
    color: '#ef4444',
    softColor: '#fee2e2',
    textColor: '#991b1b',
    icon: 'target'
  }
}

export const RELATION_TYPES = {
  CONTAINS: {
    label: '包含',
    color: '#94a3b8'
  },
  PREREQUISITE: {
    label: '前置',
    color: '#7c3aed'
  },
  RELATED_TO: {
    label: '相关',
    color: '#0ea5e9'
  },
  APPLIES_TO: {
    label: '应用于',
    color: '#ea580c'
  },
  TESTED_BY: {
    label: '考察于',
    color: '#ef4444'
  }
}

export const nodeTypeOptions = [
  { label: '全部类型', value: 'all' },
  ...Object.entries(NODE_TYPES).map(([value, meta]) => ({ value, label: meta.label }))
]

export const relationTypeOptions = [
  { label: '全部关系', value: 'all' },
  ...Object.entries(RELATION_TYPES).map(([value, meta]) => ({ value, label: meta.label }))
]

const makeNode = (node) => ({
  prerequisites: [],
  related: [],
  appliesTo: [],
  targets: [],
  ...node,
  properties: {
    definition: '',
    studyTip: '',
    keywords: [],
    ...(node.properties || {})
  }
})

export const courseNode = makeNode({
  id: 'course-data-structure',
  label: '数据结构',
  type: 'course',
  summary: '以抽象数据类型、存储结构、基本操作和经典算法为主线的数据结构课程知识图谱。',
  properties: {
    definition: '数据结构研究数据对象、数据关系、存储表示和在其上的操作算法。',
    focus: '课程总览',
    studyTip: '先按章节建立主干，再回到具体结构比较访问、插入、删除和查找成本。',
    keywords: ['ADT', '逻辑结构', '存储结构', '复杂度', '算法设计']
  }
})

export const rawGraph = {
  metadata: {
    title: '数据结构课程知识图谱',
    description: '按课程章节组织的数据结构知识体系，覆盖概念、结构、算法、操作与练习节点，可用于前端展示、筛选、详情浏览与图数据库写入预览。',
    domain: 'computer-science',
    architecture: 'course-chapter',
    audience: 'student-and-teacher'
  },
  course: courseNode,
  nodes: [
    makeNode({
      id: 'chapter-foundation',
      label: '导论与复杂度',
      type: 'chapter',
      summary: '建立抽象数据类型、逻辑结构、存储结构和复杂度分析的课程基础。',
      properties: {
        order: 1,
        definition: '导论章节回答数据结构学什么、如何描述数据对象、如何评价算法效率。',
        focus: '抽象建模与效率分析',
        studyTip: '先把“逻辑关系”和“物理存储”分开，再用复杂度比较不同实现方案。',
        keywords: ['ADT', '逻辑结构', '存储结构', '时间复杂度', '空间复杂度']
      }
    }),
    makeNode({
      id: 'concept-adt',
      label: '抽象数据类型',
      type: 'concept',
      chapterId: 'chapter-foundation',
      summary: '用数据对象、数据关系和基本运算描述问题，不绑定具体实现。',
      properties: {
        definition: 'ADT 强调“数据能做什么”，隐藏顺序、链式等底层实现细节。',
        studyTip: '学习每种结构时先写清楚允许哪些操作，再讨论这些操作如何实现。',
        keywords: ['数据对象', '数据关系', '基本运算', '封装']
      },
      related: ['concept-logical-structure', 'concept-storage-structure']
    }),
    makeNode({
      id: 'concept-logical-structure',
      label: '逻辑结构',
      type: 'concept',
      chapterId: 'chapter-foundation',
      summary: '从元素关系角度描述线性、树形、图状和集合结构。',
      properties: {
        definition: '逻辑结构关注元素之间的一对一、一对多、多对多或无显式关系。',
        studyTip: '看到题目先判断关系形态，再选择线性表、树或图等结构。',
        keywords: ['线性结构', '树形结构', '图结构', '集合']
      },
      prerequisites: ['concept-adt'],
      related: ['structure-sequential-list', 'structure-tree', 'structure-graph']
    }),
    makeNode({
      id: 'concept-storage-structure',
      label: '存储结构',
      type: 'concept',
      chapterId: 'chapter-foundation',
      summary: '描述逻辑结构映射到内存时采用的顺序、链式、索引或散列方式。',
      properties: {
        definition: '存储结构决定访问、插入、删除和空间开销的主要差异。',
        studyTip: '把“连续还是分散”“直接定位还是逐步查找”作为比较入口。',
        keywords: ['顺序存储', '链式存储', '索引存储', '散列存储']
      },
      prerequisites: ['concept-logical-structure'],
      related: ['structure-array', 'structure-linked-list', 'structure-hash-table']
    }),
    makeNode({
      id: 'concept-complexity',
      label: '复杂度分析',
      type: 'concept',
      chapterId: 'chapter-foundation',
      summary: '用渐进时间复杂度和空间复杂度评估算法随输入规模增长时的成本。',
      properties: {
        definition: '复杂度分析关注规模增长趋势，常用 O、Omega、Theta 表达上界、下界和紧确界。',
        studyTip: '做题时先找基本操作执行次数，再忽略常数项和低阶项。',
        keywords: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', '渐进分析']
      },
      appliesTo: ['algorithm-binary-search', 'algorithm-quick-sort', 'algorithm-merge-sort', 'algorithm-shortest-path']
    }),
    makeNode({
      id: 'concept-recursion',
      label: '递归与分治',
      type: 'concept',
      chapterId: 'chapter-foundation',
      summary: '把问题拆成规模更小、形式相同的子问题，并通过终止条件收敛。',
      properties: {
        definition: '递归依赖出口条件、递推关系和回溯过程，分治强调拆分、求解和合并。',
        studyTip: '先写出口，再画调用树；遇到排序和树遍历时特别关注递归边界。',
        keywords: ['终止条件', '递归树', '回溯', '分治']
      },
      prerequisites: ['concept-complexity'],
      appliesTo: ['algorithm-tree-traversal', 'algorithm-quick-sort', 'algorithm-merge-sort', 'algorithm-dfs']
    }),
    makeNode({
      id: 'operation-basic-ops',
      label: '基本操作模型',
      type: 'operation',
      chapterId: 'chapter-foundation',
      summary: '插入、删除、查找、访问、遍历和更新是贯穿全课程的操作坐标。',
      properties: {
        definition: '基本操作模型用于比较不同结构在同一任务上的效率和实现复杂度。',
        studyTip: '每学一个结构都写出这些操作的最好、最坏和平均成本。',
        keywords: ['插入', '删除', '查找', '遍历', '更新']
      },
      related: ['structure-sequential-list', 'structure-linked-list', 'structure-hash-table']
    }),

    makeNode({
      id: 'chapter-linear',
      label: '线性表',
      type: 'chapter',
      summary: '围绕一对一关系展开顺序表、链表及其变体的实现和操作。',
      prerequisites: ['chapter-foundation'],
      properties: {
        order: 2,
        definition: '线性表是由同类型元素构成的有限序列，除首尾外每个元素有唯一前驱和后继。',
        focus: '顺序存储与链式存储的权衡',
        studyTip: '用“随机访问”和“局部插删”两条线比较顺序表与链表。',
        keywords: ['线性表', '顺序表', '链表', '前驱', '后继']
      }
    }),
    makeNode({
      id: 'structure-array',
      label: '数组',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '以连续内存保存同类型元素，支持下标随机访问。',
      properties: {
        definition: '数组通过基地址和下标偏移直接定位元素，是顺序存储的基础。',
        studyTip: '记住随机访问快，但中间插入删除通常需要移动元素。',
        keywords: ['连续内存', '随机访问', '下标', '基地址']
      },
      prerequisites: ['concept-storage-structure'],
      related: ['structure-sequential-list', 'structure-string']
    }),
    makeNode({
      id: 'structure-sequential-list',
      label: '顺序表',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '用一段连续空间存储线性表元素，按位置访问效率高。',
      properties: {
        definition: '顺序表通常以数组实现，插入和删除会引发元素搬移。',
        studyTip: '重点练习插入位置合法性、容量变化和移动方向。',
        keywords: ['顺序存储', '容量', '元素搬移', '按位查找']
      },
      prerequisites: ['structure-array'],
      related: ['operation-linear-update'],
      appliesTo: ['exercise-linear-sequential-list']
    }),
    makeNode({
      id: 'structure-linked-list',
      label: '单链表',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '通过结点和指针串联元素，适合频繁插入和删除。',
      properties: {
        definition: '单链表的每个结点保存数据域和后继指针，访问第 i 个元素需从头遍历。',
        studyTip: '画清楚 pre、cur、next 三个指针，先保留后继再改指向。',
        keywords: ['结点', '指针', '头结点', '前驱', '后继']
      },
      prerequisites: ['structure-sequential-list'],
      related: ['structure-doubly-linked-list', 'structure-circular-list'],
      appliesTo: ['exercise-linked-list-reverse']
    }),
    makeNode({
      id: 'structure-doubly-linked-list',
      label: '双向链表',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '每个结点同时保存前驱和后继指针，便于双向遍历和删除。',
      properties: {
        definition: '双向链表用两个方向的链接提升操作灵活性，但增加指针空间成本。',
        studyTip: '插入删除时按四条指针更新检查，避免前后链接断裂。',
        keywords: ['前驱指针', '后继指针', '双向遍历', '删除结点']
      },
      prerequisites: ['structure-linked-list'],
      related: ['structure-circular-list']
    }),
    makeNode({
      id: 'structure-circular-list',
      label: '循环链表',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '尾结点重新指向首结点或头结点，形成可循环访问的链式结构。',
      properties: {
        definition: '循环链表把线性链表首尾相接，常配合尾指针提升队列类操作效率。',
        studyTip: '重点区分空表、单结点表和尾结点回连的边界。',
        keywords: ['尾指针', '首尾相接', '循环访问', '边界处理']
      },
      prerequisites: ['structure-linked-list'],
      related: ['structure-circular-queue']
    }),
    makeNode({
      id: 'structure-generalized-list',
      label: '广义表',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '元素既可以是原子，也可以是子表，适合表达嵌套结构。',
      properties: {
        definition: '广义表是线性表的递归扩展，可用表头和表尾分解描述。',
        studyTip: '从长度、深度、表头、表尾四个角度分析题目。',
        keywords: ['原子', '子表', '递归定义', '表头', '表尾']
      },
      prerequisites: ['structure-linked-list', 'concept-recursion'],
      related: ['structure-tree']
    }),
    makeNode({
      id: 'operation-linear-update',
      label: '线性表操作',
      type: 'operation',
      chapterId: 'chapter-linear',
      summary: '围绕初始化、插入、删除、查找、合并和逆置展开的线性表操作集合。',
      properties: {
        definition: '线性表操作的核心是定位元素位置，并维护元素顺序或链式连接关系。',
        studyTip: '顺序表看移动范围，链表看前驱结点和指针改连。',
        keywords: ['初始化', '插入', '删除', '查找', '逆置']
      },
      prerequisites: ['operation-basic-ops'],
      related: ['structure-sequential-list', 'structure-linked-list']
    }),
    makeNode({
      id: 'exercise-linear-sequential-list',
      label: '顺序表插入删除练习',
      type: 'exercise',
      chapterId: 'chapter-linear',
      summary: '通过插入、删除和边界条件训练顺序表的元素移动过程。',
      properties: {
        title: '顺序表插入与删除',
        definition: '考察按位置操作、合法性判断、移动方向和长度维护。',
        difficulty: 'easy',
        estimatedMinutes: 15,
        studyTip: '先判断下标范围，再从最后一个需要移动的元素开始处理。',
        keywords: ['顺序表', '插入', '删除', '边界']
      },
      targets: ['structure-sequential-list', 'operation-linear-update']
    }),
    makeNode({
      id: 'exercise-linked-list-reverse',
      label: '链表逆置练习',
      type: 'exercise',
      chapterId: 'chapter-linear',
      summary: '通过头插法、三指针法或递归方式训练链表结点重连。',
      properties: {
        title: '单链表逆置',
        definition: '考察链表遍历、前驱保存、后继保存和指针方向调整。',
        difficulty: 'medium',
        estimatedMinutes: 20,
        studyTip: '每改一次 next 前先保存原来的后继结点。',
        keywords: ['链表', '逆置', '头插法', '三指针']
      },
      targets: ['structure-linked-list', 'operation-linear-update']
    }),

    makeNode({
      id: 'chapter-stack-queue-string',
      label: '栈、队列与串',
      type: 'chapter',
      summary: '学习受限线性结构和字符序列处理，连接递归、表达式、缓冲和模式匹配。',
      prerequisites: ['chapter-linear'],
      properties: {
        order: 3,
        definition: '栈和队列限制插入删除端点，串强调字符序列和模式匹配操作。',
        focus: '受限访问与典型应用',
        studyTip: '栈看最近依赖，队列看到达顺序，串看匹配过程。',
        keywords: ['栈', '队列', '串', '受限线性表', '模式匹配']
      }
    }),
    makeNode({
      id: 'structure-stack',
      label: '栈',
      type: 'structure',
      chapterId: 'chapter-stack-queue-string',
      summary: '只允许在栈顶插入和删除的后进先出结构。',
      properties: {
        definition: '栈遵循 LIFO 规则，可用顺序表或链表实现。',
        studyTip: '把函数调用、括号匹配和表达式求值都映射为“最近未完成任务”。',
        keywords: ['LIFO', '栈顶', '压栈', '出栈', '括号匹配']
      },
      prerequisites: ['structure-sequential-list', 'structure-linked-list'],
      related: ['structure-queue'],
      appliesTo: ['exercise-stack-queue-simulation']
    }),
    makeNode({
      id: 'structure-queue',
      label: '队列',
      type: 'structure',
      chapterId: 'chapter-stack-queue-string',
      summary: '只允许队尾插入、队头删除的先进先出结构。',
      properties: {
        definition: '队列遵循 FIFO 规则，常用于缓冲、调度和层次遍历。',
        studyTip: '理解 front、rear 的含义，再处理入队和出队后的指针变化。',
        keywords: ['FIFO', '队头', '队尾', '入队', '出队']
      },
      prerequisites: ['structure-sequential-list'],
      related: ['structure-circular-queue', 'structure-deque'],
      appliesTo: ['algorithm-bfs', 'exercise-stack-queue-simulation']
    }),
    makeNode({
      id: 'structure-circular-queue',
      label: '循环队列',
      type: 'structure',
      chapterId: 'chapter-stack-queue-string',
      summary: '用取模把顺序队列空间首尾相接，解决假溢出问题。',
      properties: {
        definition: '循环队列通常通过牺牲一个单元或设置 size 标记区分空满。',
        studyTip: '牢记队头队尾下标更新都使用取模，并单独说明空满判定规则。',
        keywords: ['取模', '环形数组', '假溢出', '空满判定']
      },
      prerequisites: ['structure-queue'],
      related: ['structure-circular-list', 'algorithm-radix-sort']
    }),
    makeNode({
      id: 'structure-deque',
      label: '双端队列',
      type: 'structure',
      chapterId: 'chapter-stack-queue-string',
      summary: '两端都允许插入和删除的队列变体。',
      properties: {
        definition: '双端队列兼具栈和队列特征，适合滑动窗口和两端调度。',
        studyTip: '把四种端点操作列成表，再判断受限输入或受限输出变体。',
        keywords: ['双端', '滑动窗口', '受限输入', '受限输出']
      },
      prerequisites: ['structure-queue'],
      related: ['structure-stack']
    }),
    makeNode({
      id: 'structure-string',
      label: '串',
      type: 'structure',
      chapterId: 'chapter-stack-queue-string',
      summary: '由零个或多个字符组成的有限序列，重点关注子串、定位和匹配。',
      properties: {
        definition: '串是一种特殊线性表，元素类型固定为字符，常见操作包括求长、复制、连接、求子串和匹配。',
        studyTip: '朴素匹配先会手算，再学习 KMP 的 next 数组含义。',
        keywords: ['字符序列', '子串', '模式匹配', 'KMP']
      },
      prerequisites: ['structure-array'],
      related: ['algorithm-kmp', 'structure-sequential-list']
    }),
    makeNode({
      id: 'algorithm-kmp',
      label: 'KMP 模式匹配',
      type: 'algorithm',
      chapterId: 'chapter-stack-queue-string',
      summary: '利用模式串自身的前后缀信息减少回退的字符串匹配算法。',
      properties: {
        definition: 'KMP 通过 next 或 prefix 表决定失配后的移动位置，使主串指针不回退。',
        studyTip: '先理解最长相等前后缀，再用表格模拟失配跳转。',
        keywords: ['next 数组', '前缀', '后缀', '失配跳转']
      },
      prerequisites: ['structure-string'],
      related: ['algorithm-sequential-search']
    }),
    makeNode({
      id: 'operation-stack-queue',
      label: '栈队列操作',
      type: 'operation',
      chapterId: 'chapter-stack-queue-string',
      summary: '压栈、出栈、入队、出队、取栈顶和取队头等受限结构基本操作。',
      properties: {
        definition: '栈队列操作围绕端点约束展开，关键是维护边界和空满状态。',
        studyTip: '每次操作后立即更新长度、栈顶或队头队尾位置。',
        keywords: ['压栈', '出栈', '入队', '出队', '空满判定']
      },
      prerequisites: ['operation-basic-ops'],
      related: ['structure-stack', 'structure-queue']
    }),
    makeNode({
      id: 'exercise-stack-queue-simulation',
      label: '栈队列模拟练习',
      type: 'exercise',
      chapterId: 'chapter-stack-queue-string',
      summary: '通过括号匹配、表达式求值和排队调度巩固栈队列使用场景。',
      properties: {
        title: '栈与队列综合模拟',
        definition: '考察受限线性结构的入出顺序、边界状态和应用建模。',
        difficulty: 'medium',
        estimatedMinutes: 20,
        studyTip: '看到“最近匹配”优先考虑栈，看到“按到达顺序处理”优先考虑队列。',
        keywords: ['模拟', '括号匹配', '表达式', '调度']
      },
      targets: ['structure-stack', 'structure-queue', 'operation-stack-queue']
    }),

    makeNode({
      id: 'chapter-tree',
      label: '树与二叉树',
      type: 'chapter',
      summary: '从层次关系、二叉树性质、遍历算法到搜索树、堆和哈夫曼树。',
      prerequisites: ['chapter-stack-queue-string'],
      properties: {
        order: 4,
        definition: '树是一对多的非线性结构，二叉树是最常用的树形计算模型。',
        focus: '层次关系、递归遍历和有序树结构',
        studyTip: '先掌握术语和遍历，再学习 BST、堆、AVL 等特化结构。',
        keywords: ['树', '二叉树', '遍历', 'BST', '堆']
      }
    }),
    makeNode({
      id: 'structure-tree',
      label: '树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '表达层次关系的非线性结构，由结点和边组成。',
      properties: {
        definition: '树中除根结点外每个结点有唯一父结点，可用孩子、兄弟或双亲表示法存储。',
        studyTip: '记住根、叶子、度、层次、高度、森林这些术语。',
        keywords: ['根', '叶子', '度', '层次', '森林']
      },
      prerequisites: ['concept-recursion'],
      related: ['structure-binary-tree', 'structure-graph']
    }),
    makeNode({
      id: 'structure-binary-tree',
      label: '二叉树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '每个结点最多有两个子树，是多种树形算法的基础模型。',
      properties: {
        definition: '二叉树由左子树和右子树递归定义，常见形态包括满二叉树、完全二叉树和平衡树。',
        studyTip: '把性质、存储、遍历三部分串起来学习。',
        keywords: ['左子树', '右子树', '完全二叉树', '递归定义']
      },
      prerequisites: ['structure-tree'],
      related: ['algorithm-tree-traversal', 'structure-heap', 'structure-bst']
    }),
    makeNode({
      id: 'algorithm-tree-traversal',
      label: '二叉树遍历',
      type: 'algorithm',
      chapterId: 'chapter-tree',
      summary: '前序、中序、后序和层序遍历构成树算法的基本框架。',
      properties: {
        definition: '深度优先遍历可递归或借助栈实现，层序遍历通常借助队列实现。',
        studyTip: '判断前中后序只看“访问根结点”的时机。',
        keywords: ['前序', '中序', '后序', '层序', '递归']
      },
      prerequisites: ['structure-binary-tree', 'concept-recursion'],
      appliesTo: ['structure-threaded-tree', 'exercise-tree-traversal']
    }),
    makeNode({
      id: 'structure-threaded-tree',
      label: '线索二叉树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '利用二叉树空指针保存遍历前驱或后继，提高遍历效率。',
      properties: {
        definition: '线索二叉树把空左指针或空右指针改造成前驱、后继线索。',
        studyTip: '先确定是哪一种遍历序列的线索，再判断 tag 标志。',
        keywords: ['线索化', '前驱', '后继', 'tag 标志']
      },
      prerequisites: ['algorithm-tree-traversal'],
      related: ['structure-binary-tree']
    }),
    makeNode({
      id: 'structure-bst',
      label: '二叉排序树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '满足左子树小于根、右子树大于根的有序二叉树。',
      properties: {
        definition: 'BST 把有序查找过程嵌入树结构，平均查找长度取决于树形高度。',
        studyTip: '插入按查找失败位置挂接，删除重点处理左右子树都存在的情况。',
        keywords: ['BST', '有序性', '查找', '插入', '删除']
      },
      prerequisites: ['structure-binary-tree', 'algorithm-binary-search'],
      related: ['structure-avl-tree'],
      appliesTo: ['exercise-bst-insert']
    }),
    makeNode({
      id: 'structure-avl-tree',
      label: '平衡二叉树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '通过旋转维护左右子树高度差，保证查找性能稳定。',
      properties: {
        definition: 'AVL 树要求任意结点左右子树高度差绝对值不超过 1。',
        studyTip: '先识别 LL、RR、LR、RL 失衡类型，再选择单旋或双旋。',
        keywords: ['AVL', '平衡因子', 'LL', 'RR', '旋转']
      },
      prerequisites: ['structure-bst'],
      related: ['structure-heap']
    }),
    makeNode({
      id: 'structure-heap',
      label: '堆',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '满足堆序性质的完全二叉树，常用于优先队列和堆排序。',
      properties: {
        definition: '堆通常用数组存储，父子下标关系可直接计算。',
        studyTip: '把建堆、上滤、下滤和删除堆顶连成一套流程。',
        keywords: ['完全二叉树', '优先队列', '上滤', '下滤', '堆排序']
      },
      prerequisites: ['structure-binary-tree', 'structure-array'],
      related: ['algorithm-heap-sort', 'algorithm-mst']
    }),
    makeNode({
      id: 'structure-huffman-tree',
      label: '哈夫曼树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '带权路径长度最小的二叉树，用于构造最优前缀编码。',
      properties: {
        definition: '哈夫曼树通过反复合并权值最小的两棵树得到最优编码树。',
        studyTip: '每一步都选最小两个权值合并，最后再从根到叶分配编码。',
        keywords: ['权值', 'WPL', '前缀编码', '最优二叉树']
      },
      prerequisites: ['structure-binary-tree', 'structure-heap'],
      related: ['algorithm-mst']
    }),
    makeNode({
      id: 'exercise-tree-traversal',
      label: '树遍历练习',
      type: 'exercise',
      chapterId: 'chapter-tree',
      summary: '通过遍历序列、递归过程和层序队列训练二叉树遍历。',
      properties: {
        title: '二叉树遍历与重建',
        definition: '考察前中后序判断、递归边界、遍历序列重建和层序访问。',
        difficulty: 'medium',
        estimatedMinutes: 25,
        studyTip: '前序确定根，中序切左右子树，再递归处理。',
        keywords: ['前序', '中序', '后序', '层序', '重建']
      },
      targets: ['algorithm-tree-traversal', 'structure-binary-tree']
    }),
    makeNode({
      id: 'exercise-bst-insert',
      label: 'BST 插入练习',
      type: 'exercise',
      chapterId: 'chapter-tree',
      summary: '训练二叉排序树的查找路径、插入位置和删除替代结点。',
      properties: {
        title: '二叉排序树插入与删除',
        definition: '考察左小右大的查找路径、叶子插入和删除重接。',
        difficulty: 'medium',
        estimatedMinutes: 25,
        studyTip: '每一步只比较当前结点，严格按小走左、大走右推进。',
        keywords: ['BST', '插入', '删除', '替代结点']
      },
      targets: ['structure-bst']
    }),
    makeNode({
      id: 'exercise-heap-adjust',
      label: '堆调整练习',
      type: 'exercise',
      chapterId: 'chapter-tree',
      summary: '通过建堆、插入、删除堆顶和下滤过程理解堆结构。',
      properties: {
        title: '堆的建立与调整',
        definition: '考察完全二叉树数组下标、堆序性质和上下滤过程。',
        difficulty: 'medium',
        estimatedMinutes: 20,
        studyTip: '删除堆顶后把最后一个元素放到根，再一路下滤恢复堆序。',
        keywords: ['建堆', '下滤', '上滤', '优先队列']
      },
      targets: ['structure-heap']
    }),

    makeNode({
      id: 'chapter-graph',
      label: '图',
      type: 'chapter',
      summary: '处理多对多关系，覆盖图的存储、遍历、拓扑排序、最小生成树和最短路径。',
      prerequisites: ['chapter-tree'],
      properties: {
        order: 5,
        definition: '图由顶点和边构成，可表示任意复杂关系网络。',
        focus: '图存储、图遍历和带权图算法',
        studyTip: '先判断有向/无向、带权/无权、稀疏/稠密，再选存储和算法。',
        keywords: ['顶点', '边', '有向图', '带权图', '连通性']
      }
    }),
    makeNode({
      id: 'structure-graph',
      label: '图结构',
      type: 'structure',
      chapterId: 'chapter-graph',
      summary: '表达顶点之间任意关系的非线性结构。',
      properties: {
        definition: '图可以分为有向图、无向图、带权图、无权图，核心问题包括遍历、连通和路径。',
        studyTip: '读题时先抽象顶点和边，再决定边是否有方向和权值。',
        keywords: ['顶点', '边', '邻接', '连通', '路径']
      },
      prerequisites: ['structure-tree', 'structure-queue'],
      related: ['structure-adjacency-list', 'structure-adjacency-matrix'],
      appliesTo: ['algorithm-dfs', 'algorithm-bfs', 'algorithm-topological-sort', 'algorithm-mst', 'algorithm-shortest-path']
    }),
    makeNode({
      id: 'structure-adjacency-list',
      label: '邻接表',
      type: 'structure',
      chapterId: 'chapter-graph',
      summary: '以顶点表和边表保存图的邻接关系，适合稀疏图。',
      properties: {
        definition: '邻接表为每个顶点维护相邻边链表，空间复杂度通常为 O(V + E)。',
        studyTip: '稀疏图、需要遍历某点所有邻边时优先考虑邻接表。',
        keywords: ['稀疏图', '顶点表', '边表', 'O(V+E)']
      },
      prerequisites: ['structure-linked-list', 'structure-graph'],
      related: ['structure-adjacency-matrix']
    }),
    makeNode({
      id: 'structure-adjacency-matrix',
      label: '邻接矩阵',
      type: 'structure',
      chapterId: 'chapter-graph',
      summary: '用二维数组记录顶点之间是否有边或边权，适合稠密图。',
      properties: {
        definition: '邻接矩阵可 O(1) 判断两点是否相邻，但空间复杂度为 O(V^2)。',
        studyTip: '稠密图、快速判边和 Floyd 算法场景优先想到矩阵。',
        keywords: ['稠密图', '二维数组', '判边', 'O(V^2)']
      },
      prerequisites: ['structure-array', 'structure-graph'],
      related: ['structure-adjacency-list']
    }),
    makeNode({
      id: 'algorithm-dfs',
      label: '深度优先搜索',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '沿一条路径尽可能深入，无法继续时回溯的图遍历算法。',
      properties: {
        definition: 'DFS 可用递归或显式栈实现，常用于连通性、环检测和拓扑相关问题。',
        studyTip: '维护 visited 集合，注意递归返回时的回溯状态。',
        keywords: ['DFS', '递归', '回溯', 'visited', '连通分量']
      },
      prerequisites: ['structure-graph', 'concept-recursion'],
      related: ['algorithm-bfs'],
      appliesTo: ['exercise-graph-bfs']
    }),
    makeNode({
      id: 'algorithm-bfs',
      label: '广度优先搜索',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '按距离或层次逐步扩展访问顶点的图遍历算法。',
      properties: {
        definition: 'BFS 借助队列维护待访问顶点，常用于无权图最短路径和层次遍历。',
        studyTip: '每次出队访问一个顶点，再把未访问邻接点入队。',
        keywords: ['BFS', '队列', '分层', '无权最短路']
      },
      prerequisites: ['structure-graph', 'structure-queue'],
      related: ['algorithm-dfs', 'algorithm-shortest-path'],
      appliesTo: ['exercise-graph-bfs']
    }),
    makeNode({
      id: 'algorithm-topological-sort',
      label: '拓扑排序',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '对有向无环图进行满足依赖顺序的线性排序。',
      properties: {
        definition: '拓扑排序常通过入度为 0 的顶点队列或 DFS 完成。',
        studyTip: '看到先修、依赖、任务顺序时先判断是否为 DAG。',
        keywords: ['DAG', '入度', '依赖关系', '任务调度']
      },
      prerequisites: ['algorithm-bfs', 'structure-graph'],
      related: ['algorithm-critical-path']
    }),
    makeNode({
      id: 'algorithm-critical-path',
      label: '关键路径',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '在 AOE 网中找出决定工程最短完成时间的活动路径。',
      properties: {
        definition: '关键路径通过事件最早/最迟发生时间和活动时间差判断关键活动。',
        studyTip: '先做拓扑序，再从前向后算最早时间、从后向前算最迟时间。',
        keywords: ['AOE 网', '最早时间', '最迟时间', '关键活动']
      },
      prerequisites: ['algorithm-topological-sort'],
      related: ['algorithm-shortest-path']
    }),
    makeNode({
      id: 'algorithm-mst',
      label: '最小生成树',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '在连通带权无向图中选出连接所有顶点且权值和最小的边集。',
      properties: {
        definition: 'Prim 从顶点集合扩展，Kruskal 按边权递增选择且避免成环。',
        studyTip: 'Prim 适合稠密图，Kruskal 更容易和边排序、并查集联系。',
        keywords: ['Prim', 'Kruskal', '带权图', '生成树', '并查集']
      },
      prerequisites: ['structure-graph', 'structure-heap'],
      related: ['algorithm-shortest-path', 'structure-huffman-tree']
    }),
    makeNode({
      id: 'algorithm-shortest-path',
      label: '最短路径',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '在带权或无权图中寻找从一个或多个源点到目标点的最小代价路径。',
      properties: {
        definition: '常见算法包括 BFS、Dijkstra、Floyd 和 Bellman-Ford，选择取决于权值和源点数量。',
        studyTip: '先判断是否带权、权值是否非负、是单源还是多源。',
        keywords: ['Dijkstra', 'Floyd', 'Bellman-Ford', '单源', '多源']
      },
      prerequisites: ['structure-graph', 'algorithm-bfs'],
      related: ['algorithm-mst'],
      appliesTo: ['exercise-shortest-path']
    }),
    makeNode({
      id: 'exercise-graph-bfs',
      label: '图遍历练习',
      type: 'exercise',
      chapterId: 'chapter-graph',
      summary: '围绕 DFS/BFS 访问序列、队列变化和连通分量展开训练。',
      properties: {
        title: '图的深度与广度优先遍历',
        definition: '考察 visited 标记、邻接点顺序、栈队列变化和遍历序列。',
        difficulty: 'hard',
        estimatedMinutes: 30,
        studyTip: '手算时每一步写出当前访问点、队列或递归栈状态。',
        keywords: ['DFS', 'BFS', '访问序列', '队列']
      },
      targets: ['algorithm-dfs', 'algorithm-bfs', 'structure-graph']
    }),
    makeNode({
      id: 'exercise-shortest-path',
      label: '最短路练习',
      type: 'exercise',
      chapterId: 'chapter-graph',
      summary: '围绕权值图、距离数组和路径松弛规则训练最短路径算法。',
      properties: {
        title: '最短路径综合',
        definition: '考察 Dijkstra/Floyd 的状态更新、路径选择和算法适用条件。',
        difficulty: 'hard',
        estimatedMinutes: 35,
        studyTip: '先确认图和权值条件，再选择算法并逐轮更新距离表。',
        keywords: ['Dijkstra', 'Floyd', '松弛', '距离数组']
      },
      targets: ['algorithm-shortest-path']
    }),

    makeNode({
      id: 'chapter-search-sort-hash',
      label: '查找、排序与哈希',
      type: 'chapter',
      summary: '整合查找表、散列表和排序算法，形成数据处理效率优化主线。',
      prerequisites: ['chapter-linear'],
      properties: {
        order: 6,
        definition: '查找关注定位目标，排序关注重排序列，哈希通过映射提升查找效率。',
        focus: '有序性、映射和排序策略',
        studyTip: '先判断数据是否有序、是否频繁更新、是否需要稳定排序。',
        keywords: ['查找', '排序', '哈希', '有序表', '稳定性']
      }
    }),
    makeNode({
      id: 'algorithm-sequential-search',
      label: '顺序查找',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '逐个比较元素直到找到目标或扫描结束。',
      properties: {
        definition: '顺序查找适合无序表、小规模数据或链式存储结构。',
        studyTip: '重点会计算查找成功和失败时的平均查找长度。',
        keywords: ['线性扫描', 'ASL', '无序表', '哨兵']
      },
      prerequisites: ['structure-sequential-list'],
      related: ['algorithm-binary-search']
    }),
    makeNode({
      id: 'algorithm-binary-search',
      label: '折半查找',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '在有序顺序表中不断缩小查找区间。',
      properties: {
        definition: '折半查找要求数据有序且支持随机访问，时间复杂度为 O(log n)。',
        studyTip: '每轮都明确 left、mid、right 的更新，避免死循环。',
        keywords: ['有序表', '随机访问', 'mid', 'O(log n)']
      },
      prerequisites: ['algorithm-sequential-search', 'structure-array'],
      appliesTo: ['exercise-binary-search']
    }),
    makeNode({
      id: 'structure-hash-table',
      label: '哈希表',
      type: 'structure',
      chapterId: 'chapter-search-sort-hash',
      summary: '通过哈希函数把关键字映射到存储地址，实现高效查找。',
      properties: {
        definition: '哈希表的效率取决于哈希函数、冲突处理策略和装填因子。',
        studyTip: '先算哈希地址，再按指定冲突策略继续探测或挂链。',
        keywords: ['哈希函数', '装填因子', '散列地址', '查找效率']
      },
      prerequisites: ['concept-storage-structure', 'structure-array'],
      related: ['concept-collision'],
      appliesTo: ['exercise-hash-table-lookup']
    }),
    makeNode({
      id: 'concept-collision',
      label: '冲突处理',
      type: 'concept',
      chapterId: 'chapter-search-sort-hash',
      summary: '处理多个关键字映射到同一哈希地址的问题。',
      properties: {
        definition: '常见冲突处理包括开放定址法、链地址法、再哈希法和公共溢出区。',
        studyTip: '开放定址要按探测序列继续找空位，链地址法要在桶内链表中查找。',
        keywords: ['开放定址', '链地址法', '线性探测', '二次探测']
      },
      prerequisites: ['structure-hash-table'],
      related: ['structure-linked-list']
    }),
    makeNode({
      id: 'algorithm-insertion-sort',
      label: '插入排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '将待排序元素逐个插入到已有序区间。',
      properties: {
        definition: '插入排序稳定，适合小规模或基本有序数据。',
        studyTip: '关注比较和移动的顺序，理解为什么基本有序时效率较高。',
        keywords: ['稳定排序', '局部有序', '直接插入', '移动元素']
      },
      prerequisites: ['structure-array', 'concept-complexity'],
      related: ['algorithm-shell-sort']
    }),
    makeNode({
      id: 'algorithm-bubble-sort',
      label: '冒泡排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '通过相邻元素交换，把最大或最小元素逐趟移动到最终位置。',
      properties: {
        definition: '冒泡排序稳定，实现简单，但平均和最坏时间复杂度为 O(n^2)。',
        studyTip: '每一趟结束后确认一个元素归位，并可用交换标志提前结束。',
        keywords: ['相邻交换', '稳定排序', 'O(n^2)', '提前结束']
      },
      prerequisites: ['structure-array', 'concept-complexity'],
      related: ['algorithm-selection-sort']
    }),
    makeNode({
      id: 'algorithm-selection-sort',
      label: '选择排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '每趟选择最小或最大元素放到当前有序区边界。',
      properties: {
        definition: '选择排序比较次数固定，交换次数少，但通常不稳定。',
        studyTip: '与冒泡排序对比：选择排序减少交换，冒泡排序通过相邻交换推进。',
        keywords: ['选择最小值', '交换少', '不稳定', 'O(n^2)']
      },
      prerequisites: ['structure-array', 'concept-complexity'],
      related: ['algorithm-bubble-sort']
    }),
    makeNode({
      id: 'algorithm-shell-sort',
      label: '希尔排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '按增量分组进行插入排序，再逐步缩小增量。',
      properties: {
        definition: '希尔排序是插入排序的改进，通过先让数据大体有序减少移动。',
        studyTip: '手算时按增量分组，不要把不同组的数据混在一起比较。',
        keywords: ['增量序列', '分组插入', '不稳定', '缩小增量']
      },
      prerequisites: ['algorithm-insertion-sort'],
      related: ['algorithm-insertion-sort']
    }),
    makeNode({
      id: 'algorithm-quick-sort',
      label: '快速排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '基于划分和递归的高效分治排序算法。',
      properties: {
        definition: '快速排序选取枢轴，将序列划分为较小和较大两部分后递归排序。',
        studyTip: '先掌握一趟 partition，再分析递归区间和最坏情况。',
        keywords: ['分治', 'partition', '枢轴', '不稳定', 'O(n log n)']
      },
      prerequisites: ['concept-recursion', 'structure-array', 'concept-complexity'],
      related: ['algorithm-merge-sort', 'algorithm-insertion-sort'],
      appliesTo: ['exercise-sort-comparison']
    }),
    makeNode({
      id: 'algorithm-merge-sort',
      label: '归并排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '将序列递归拆分后再合并有序子序列。',
      properties: {
        definition: '归并排序稳定，时间复杂度稳定为 O(n log n)，但需要额外空间。',
        studyTip: '重点理解有序合并过程和递归拆分边界。',
        keywords: ['分治', '合并', '稳定排序', '额外空间']
      },
      prerequisites: ['concept-recursion', 'structure-array', 'concept-complexity'],
      related: ['algorithm-quick-sort']
    }),
    makeNode({
      id: 'algorithm-heap-sort',
      label: '堆排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '借助堆结构反复取出堆顶元素完成排序。',
      properties: {
        definition: '堆排序利用完全二叉树的堆序性质，时间复杂度为 O(n log n)，通常不稳定。',
        studyTip: '先建大根堆，再把堆顶与末尾交换并缩小堆范围。',
        keywords: ['大根堆', '建堆', '下滤', '不稳定', 'O(n log n)']
      },
      prerequisites: ['structure-heap', 'concept-complexity'],
      related: ['algorithm-selection-sort'],
      appliesTo: ['exercise-sort-comparison']
    }),
    makeNode({
      id: 'algorithm-radix-sort',
      label: '基数排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '按关键字各位进行分配和收集的非比较排序。',
      properties: {
        definition: '基数排序适合关键字位数固定、范围可控的数据，常借助队列完成桶分配。',
        studyTip: '按低位到高位或高位到低位处理时，保持每一轮收集顺序稳定。',
        keywords: ['非比较排序', '按位', '桶', '队列', '稳定']
      },
      prerequisites: ['structure-circular-queue', 'structure-array'],
      related: ['algorithm-bucket-sort']
    }),
    makeNode({
      id: 'algorithm-bucket-sort',
      label: '桶排序思想',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '把数据分配到多个桶中分别处理，再按桶顺序收集。',
      properties: {
        definition: '桶排序思想常与计数排序、基数排序一起理解，依赖数据分布特征。',
        studyTip: '先判断数据范围和分布是否适合分桶，再考虑桶内排序方式。',
        keywords: ['桶', '分布', '计数排序', '非比较排序']
      },
      prerequisites: ['structure-array'],
      related: ['algorithm-radix-sort']
    }),
    makeNode({
      id: 'exercise-binary-search',
      label: '折半查找练习',
      type: 'exercise',
      chapterId: 'chapter-search-sort-hash',
      summary: '围绕有序表、区间收缩和边界条件训练折半查找。',
      properties: {
        title: '折半查找边界训练',
        definition: '考察有序前提、mid 计算、查找成功/失败路径和比较次数。',
        difficulty: 'medium',
        estimatedMinutes: 15,
        studyTip: '每轮更新后检查区间是否仍然有效。',
        keywords: ['折半查找', '有序表', 'mid', '边界']
      },
      targets: ['algorithm-binary-search']
    }),
    makeNode({
      id: 'exercise-hash-table-lookup',
      label: '哈希查找练习',
      type: 'exercise',
      chapterId: 'chapter-search-sort-hash',
      summary: '围绕哈希地址计算、冲突处理和查找长度训练散列表。',
      properties: {
        title: '哈希表查找与冲突处理',
        definition: '考察哈希函数、开放定址、链地址法、装填因子和平均查找长度。',
        difficulty: 'hard',
        estimatedMinutes: 25,
        studyTip: '先按哈希函数算初始地址，再严格沿冲突处理规则推进。',
        keywords: ['哈希', '冲突', '探测', 'ASL']
      },
      targets: ['structure-hash-table', 'concept-collision']
    }),
    makeNode({
      id: 'exercise-sort-comparison',
      label: '排序综合练习',
      type: 'exercise',
      chapterId: 'chapter-search-sort-hash',
      summary: '比较插入、交换、选择、归并、快速、堆和基数排序的过程与性质。',
      properties: {
        title: '排序算法过程与性质比较',
        definition: '考察时间复杂度、空间复杂度、稳定性、适用场景和手算排序过程。',
        difficulty: 'hard',
        estimatedMinutes: 30,
        studyTip: '建立排序算法对照表，题目问“稳定/不稳定”“最好/最坏”时直接定位。',
        keywords: ['排序', '稳定性', '复杂度', '手算过程']
      },
      targets: ['algorithm-insertion-sort', 'algorithm-quick-sort', 'algorithm-merge-sort', 'algorithm-heap-sort', 'algorithm-radix-sort']
    })
  ]
}

export function getNodeTypeMeta(type) {
  return NODE_TYPES[type] || NODE_TYPES.concept
}

export function getRelationTypeMeta(type) {
  return RELATION_TYPES[type] || RELATION_TYPES.RELATED_TO
}
