export const GRAPH_CODE = 'data-structure-knowledge-graph'
export const GRAPH_VERSION = '1.3.0'
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
    complexity: null,
    codeSample: '',
    codeLang: 'cpp',
    useCases: [],
    problem: '',
    input: '',
    output: '',
    answer: '',
    tags: [],
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
      id: 'exercise-complexity-analysis',
      label: '复杂度分析练习',
      type: 'exercise',
      chapterId: 'chapter-foundation',
      summary: '通过基本操作计数与渐进分析训练大 O 表示法与递推关系。',
      properties: {
        title: '复杂度分析入门',
        definition: '考察基本操作计数、忽略常数低阶项、嵌套循环与递推关系的渐进分析。',
        difficulty: 'easy',
        estimatedMinutes: 15,
        studyTip: '先找最内层基本操作执行次数，再看外层循环规模，最后取主导项。',
        keywords: ['时间复杂度', '大O', '循环计数', '递推'],
        problem: '分析以下代码段的时间复杂度：① 单层 for 循环 n 次；② 双重循环外 n 内 n；③ i 从 1 每次翻倍到 n 的循环。分别写出大 O。',
        input: '三段代码，规模 n',
        output: '① O(n) ② O(n²) ③ O(log n)',
        answer: '① 单层循环执行 n 次基本操作 → O(n)。② 双重循环内层执行 n×n=n² 次 → O(n²)。③ i 翻倍 2^k≤n，循环次数 k=⌊log₂n⌋ → O(log n)。忽略常数与低阶项，只保留最高阶主导项。',
        tags: ['复杂度', '大O', '循环计数']
      },
      targets: ['concept-complexity', 'operation-basic-ops']
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
        keywords: ['连续内存', '随机访问', '下标', '基地址'],
        complexity: {
          access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)', space: 'O(n)'
        },
        codeLang: 'cpp',
        codeSample: '// 一维数组寻址：a[i] 的地址 = base + i * sizeof(elem)\nint a[10];\nfor (int i = 0; i < 10; ++i) a[i] = i; // O(1) 随机访问\n// 二维数组行主序：a[i][j] = base + (i * cols + j) * sizeof(elem)',
        useCases: ['顺序表的底层存储', '邻接矩阵', '哈希表开放定址桶', '堆的数组表示']
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
      prerequisites: ['structure-array'],
      related: ['operation-linear-update'],
      appliesTo: ['exercise-linear-sequential-list'],
      properties: {
        definition: '顺序表通常以数组实现，插入和删除会引发元素搬移。',
        studyTip: '重点练习插入位置合法性、容量变化和移动方向。',
        keywords: ['顺序存储', '容量', '元素搬移', '按位查找'],
        complexity: {
          access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)', space: 'O(n)'
        },
        codeLang: 'cpp',
        codeSample: '// 在第 i 个位置插入元素 e（1 起下标）\nbool insert(SqList &L, int i, int e) {\n  if (i < 1 || i > L.length + 1) return false; // 位置非法\n  if (L.length >= MaxSize) return false;        // 表满\n  for (int j = L.length; j >= i; --j)           // 后移\n    L.data[j] = L.data[j - 1];\n  L.data[i - 1] = e;\n  ++L.length;\n  return true;\n}',
        useCases: ['需要频繁随机访问、少量插删的场景', '静态查找表']
      }
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
        keywords: ['结点', '指针', '头结点', '前驱', '后继'],
        complexity: {
          access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)'
        },
        codeLang: 'cpp',
        codeSample: '// 头插法建立单链表\nvoid insertFront(ListNode* &head, int e) {\n  ListNode* node = new ListNode{e, head};\n  head = node;\n}\n// 三指针原地逆置\nvoid reverse(ListNode* &head) {\n  ListNode *pre = nullptr, *cur = head;\n  while (cur) { ListNode* nxt = cur->next; cur->next = pre; pre = cur; cur = nxt; }\n  head = pre;\n}',
        useCases: ['频繁插删的线性表', '哈希表链地址法桶', '邻接表边链']
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
        keywords: ['前驱指针', '后继指针', '双向遍历', '删除结点'],
        complexity: {
          access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)'
        },
        codeLang: 'cpp',
        codeSample: '// 在 p 结点后插入 s（双向链表）\nvoid insertAfter(Node* p, Node* s){\n  s->next = p->next;\n  s->prev = p;\n  if (p->next) p->next->prev = s;\n  p->next = s;\n}\n// 删除 p 结点\nvoid remove(Node* p){\n  p->prev->next = p->next;\n  if (p->next) p->next->prev = p->prev;\n  delete p;\n}',
        useCases: ['LRU 缓存', '浏览器前进后退', '文本编辑器撤销/重做', '需要双向遍历的链表']
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
        keywords: ['尾指针', '首尾相接', '循环访问', '边界处理'],
        complexity: {
          access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)'
        },
        codeLang: 'cpp',
        codeSample: '// 仅设尾指针的循环单链表：表头为 rear->next\n// 在表头插入（O(1)）\nvoid insertFront(Node* &rear, int e){\n  Node* s = new Node{e, nullptr};\n  if (!rear){ s->next = s; rear = s; return; }\n  s->next = rear->next;   // s 指向表头\n  rear->next = s;         // 尾指针指向新表头\n}\n// 判空：rear == nullptr',
        useCases: ['round-robin 调度', '约瑟夫环问题', '环形缓冲区', '资源轮转分配']
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
        keywords: ['原子', '子表', '递归定义', '表头', '表尾'],
        complexity: {
          head: 'O(1)', tail: 'O(1)', depth: 'O(n)', space: 'O(n)'
        },
        codeLang: 'text',
        codeSample: '// 广义表节点：tag=0 原子 / tag=1 子表\ntypedef struct GLNode {\n  int tag;\n  union { int atom; struct { GLNode *hp, *tp; } ptr; } u;\n} GLNode;\n// 取表头：u.ptr.hp；取表尾：u.ptr.tp（仍是子表）\n// 求深度：若为原子返回0，否则 1 + max(各子表深度)',
        useCases: ['Lisp/Scheme 列表', '多层嵌套结构表示', '稀疏矩阵十字链表', '符号表达式存储']
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
        keywords: ['顺序表', '插入', '删除', '边界'],
        problem: '长度为 8 的顺序表元素为 [2,5,8,12,16,23,31,45]。在第 4 个位置插入元素 10，再删除第 6 个元素，写出操作后的顺序表及各操作移动的元素个数。',
        input: '顺序表 [2,5,8,12,16,23,31,45]；插入位置 4，元素 10；删除位置 6',
        output: '插入移动 5 个元素；删除移动 2 个元素；结果 [2,5,8,10,12,23,31,45]（删除后）',
        answer: '插入第 4 位：从表尾起将第 4~8 元素后移 1 位（移动 5 个），再写入 10。删除第 6 位（此时为 16）：将第 7~8 元素前移 1 位（移动 2 个）。注意删除针对插入后的表。',
        tags: ['顺序表', '插入', '删除', '边界判断']
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
        keywords: ['链表', '逆置', '头插法', '三指针'],
        problem: '给定单链表 1→2→3→4→5→null，用三指针法（pre/cur/next）写出原地逆置的每一步指针变化，给出逆置后链表。',
        input: '1→2→3→4→5→null',
        output: '5→4→3→2→1→null',
        answer: '初始 pre=null,cur=1。循环：保存 next=cur.next，令 cur.next=pre，pre=cur，cur=next。每步后 cur 前进一步，pre 始终是已逆置段头。结束时 head=pre=5。',
        tags: ['链表', '逆置', '指针操作']
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
        keywords: ['LIFO', '栈顶', '压栈', '出栈', '括号匹配'],
        complexity: { push: 'O(1)', pop: 'O(1)', top: 'O(1)', search: 'O(n)', space: 'O(n)' },
        codeLang: 'cpp',
        codeSample: '// 顺序栈\nint stk[N], top = -1;\nvoid push(int x){ stk[++top] = x; }\nint pop(){ return stk[top--]; }\nbool empty(){ return top < 0; }',
        useCases: ['函数调用栈', '括号匹配', '表达式求值', 'DFS 非递归', '浏览器后退']
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
        keywords: ['FIFO', '队头', '队尾', '入队', '出队'],
        complexity: { enqueue: 'O(1)', dequeue: 'O(1)', front: 'O(1)', search: 'O(n)', space: 'O(n)' },
        codeLang: 'cpp',
        codeSample: '// 链队列（带头结点）\nvoid enqueue(LinkQueue &Q, int x){ Node* s=new Node{x,nullptr}; Q.rear->next=s; Q.rear=s; }\nint dequeue(LinkQueue &Q){ Node* p=Q.front->next; int e=p->data; Q.front->next=p->next; if(Q.rear==p) Q.rear=Q.front; delete p; return e; }',
        useCases: ['BFS 层次遍历', '任务调度', '打印机缓冲', '消息队列']
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
        keywords: ['next 数组', '前缀', '后缀', '失配跳转'],
        complexity: { preprocess: 'O(m)', search: 'O(n+m)', space: 'O(m)' },
        codeLang: 'cpp',
        codeSample: '// 求 next 数组（最长相等真前后缀）\nvoid getNext(char* p, int* nxt, int m){\n  nxt[0]=-1; int i=0, j=-1;\n  while(i<m){\n    if(j==-1||p[i]==p[j]) nxt[++i]=++j;\n    else j=nxt[j];\n  }\n}\n// 匹配：主串指针 i 不回退\nint kmp(char* s, char* p){\n  int n=strlen(s), m=strlen(p), nxt[m]; getNext(p,nxt,m);\n  int i=0,j=0;\n  while(i<n&&j<m){ if(j==-1||s[i]==p[j]){i++;j++;} else j=nxt[j]; }\n  return j==m? i-m : -1;\n}',
        useCases: ['文本编辑器查找', '生物序列匹配', '入侵检测特征串']
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
        keywords: ['模拟', '括号匹配', '表达式', '调度'],
        problem: '判断字符串 "((a+b)*[c-d]-(e/f))" 中的括号是否匹配；并说明栈在过程中每一步的状态（入栈/出栈/失配）。',
        input: '字符串 ((a+b)*[c-d]-(e/f))',
        output: '匹配成功',
        answer: '遇左括号入栈，遇右括号检查栈顶是否为同型左括号：是则出栈，否则失配。扫描结束栈空即匹配。本串所有括号配对正确，最终栈空。',
        tags: ['栈', '括号匹配', '模拟']
      },
      targets: ['structure-stack', 'structure-queue', 'operation-stack-queue']
    }),
    makeNode({
      id: 'exercise-string-match',
      label: '串匹配练习',
      type: 'exercise',
      chapterId: 'chapter-stack-queue-string',
      summary: '通过朴素匹配过程与 next 数组推导训练串的模式匹配。',
      properties: {
        title: '串的朴素匹配与 KMP',
        definition: '考察子串定位、匹配趟数、失配跳转和 next 数组计算。',
        difficulty: 'medium',
        estimatedMinutes: 20,
        studyTip: '先手算朴素匹配每趟起点，再求 next 数组观察失配如何跳转。',
        keywords: ['串', '模式匹配', 'KMP', 'next 数组'],
        problem: '主串 S="ababcabcacbab"，模式 T="abcac"。用朴素匹配写出从位置 0 起每次比较的起点和匹配结果；并求 T 的 next 数组。',
        input: 'S=ababcabcacbab，T=abcac',
        output: '朴素匹配成功起点为 5（0 起下标）；next=[-1,0,0,0,1]',
        answer: '朴素匹配：起点0 a==a,b==b,a≠b 失败；起点1 b≠a 失败；起点2 a≠a 失败（实际首字符a匹配但后续需重比较，按朴素算法回退主串指针）；逐位推进至起点5，T=abcac 全部匹配成功。next 数组：next[0]=-1，next[1]=0（无真前后缀），next[2]=0，next[3]=0，next[4]=1（前缀 a 与末尾 a 相等，最长相等真前后缀长度1）。',
        tags: ['串', 'KMP', 'next', '匹配']
      },
      targets: ['structure-string', 'algorithm-kmp']
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
        keywords: ['前序', '中序', '后序', '层序', '递归'],
        complexity: { time: 'O(n)', space: 'O(h)' },
        codeLang: 'cpp',
        codeSample: '// 递归遍历\nvoid preOrder(Node* p){ if(!p) return; visit(p); preOrder(p->l); preOrder(p->r); }\nvoid inOrder(Node* p){ if(!p) return; inOrder(p->l); visit(p); inOrder(p->r); }\nvoid postOrder(Node* p){ if(!p) return; postOrder(p->l); postOrder(p->r); visit(p); }\n// 层序（BFS）\nvoid levelOrder(Node* root){ queue<Node*> q; q.push(root);\n  while(!q.empty()){ Node* p=q.front(); q.pop(); visit(p); if(p->l) q.push(p->l); if(p->r) q.push(p->r); } }',
        useCases: ['表达式树求值', '序列化/反序列化', '目录遍历', '语法树分析']
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
        keywords: ['线索化', '前驱', '后继', 'tag 标志'],
        complexity: {
          build: 'O(n)', traverse: 'O(n)', space: 'O(n)'
        },
        codeLang: 'cpp',
        codeSample: '// 中序线索化：利用空指针域存前驱/后继\n// ltag=0 左孩子 / ltag=1 前驱线索；rtag 同理\nvoid inThread(Node* p, Node* &pre){\n  if (!p) return;\n  inThread(p->l, pre);\n  if (!p->l){ p->ltag = 1; p->l = pre; }     // 左空→前驱\n  if (pre && !pre->r){ pre->rtag = 1; pre->r = p; } // 右空→后继\n  pre = p;\n  inThread(p->r, pre);\n}',
        useCases: ['无栈中序遍历', '频繁前驱/后继查询', '节省栈空间遍历']
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
        keywords: ['BST', '有序性', '查找', '插入', '删除'],
        complexity: { search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', worst: 'O(n)', space: 'O(n)' },
        codeLang: 'cpp',
        codeSample: '// 查找\nNode* search(Node* p, int k){\n  while(p){ if(k==p->val) return p; p = k<p->val? p->l : p->r; }\n  return nullptr;\n}\n// 插入（递归）\nNode* insert(Node* p, int k){\n  if(!p) return new Node{k};\n  if(k<p->val) p->l=insert(p->l,k); else if(k>p->val) p->r=insert(p->r,k);\n  return p;\n}',
        useCases: ['动态有序集合', '符号表', '数据库索引（需平衡）']
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
        keywords: ['AVL', '平衡因子', 'LL', 'RR', '旋转'],
        complexity: { search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
        codeLang: 'cpp',
        codeSample: '// 右单旋（LL 型失衡）\nNode* rotateRight(Node* y){\n  Node* x=y->l; y->l=x->r; x->r=y;\n  updateHeight(y); updateHeight(x);\n  return x; // 新子树根\n}\n// 左单旋（RR 型失衡）\nNode* rotateLeft(Node* x){\n  Node* y=x->r; x->r=y->l; y->l=x;\n  updateHeight(x); updateHeight(y);\n  return y;\n}',
        useCases: ['需要严格平衡的内存索引', '教学示范平衡树']
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
        keywords: ['完全二叉树', '优先队列', '上滤', '下滤', '堆排序'],
        complexity: { build: 'O(n)', insert: 'O(log n)', extractTop: 'O(log n)', top: 'O(1)', space: 'O(n)' },
        codeLang: 'cpp',
        codeSample: '// 大根堆下滤（维护堆序）\nvoid siftDown(int a[], int i, int n){\n  while(2*i+1 < n){\n    int j=2*i+1; if(j+1<n && a[j+1]>a[j]) j++; // 较大子\n    if(a[i]>=a[j]) break;\n    swap(a[i],a[j]); i=j;\n  }\n}\n// 建堆：从最后一个内部结点起下滤\nvoid buildHeap(int a[], int n){ for(int i=n/2-1;i>=0;--i) siftDown(a,i,n); }',
        useCases: ['优先队列', '堆排序', 'Top-K', 'Dijkstra/Kruskal 的优先取边', '中位数流']
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
        keywords: ['权值', 'WPL', '前缀编码', '最优二叉树'],
        complexity: { build: 'O(n log n)', encode: 'O(n)', space: 'O(n)' },
        codeLang: 'cpp',
        codeSample: '// 借助小根堆建哈夫曼树\n// 1) n 个叶子入堆（按权值）\n// 2) 重复 n-1 次：取最小两棵合并为新树，权值=两者和，入堆\n// 3) 最终堆中剩余即哈夫曼树根\n// WPL = 所有非根结点权值之和（每个叶子贡献 权值*深度）',
        useCases: ['数据压缩（如 deflate）', '前缀编码', '归并最优方案']
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
        keywords: ['前序', '中序', '后序', '层序', '重建'],
        problem: '已知二叉树前序序列 A B D E C F G 与中序序列 D B E A F C G，画出该二叉树并写出后序序列。',
        input: '前序 ABDECFG；中序 DBEAFCG',
        output: '后序 DEBFGCA',
        answer: '前序首元素 A 为根；中序中 A 左侧 DBE 为左子树、右侧 FCG 为右子树。对左子树：前序 BDE、中序 DBE → B 为根，D 左 E 右。对右子树：前序 CFG、中序 FCG → C 为根，F 左 G 右。后序为 左→右→根：DEBFGCA。',
        tags: ['二叉树', '遍历', '重建', '前中后序']
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
        keywords: ['BST', '插入', '删除', '替代结点'],
        problem: '从空树开始依次插入 45 24 53 12 28 90，画出 BST；随后删除结点 45，写出删除后的中序序列。',
        input: '插入序列 45 24 53 12 28 90；删除 45',
        output: '删除后中序：12 24 28 53 90',
        answer: '插入后：根 45，左子树 24（左 12、右 28），右子树 53（右 90）。删除根 45（左右子树都在）：用中序后继 53 替代（或前驱 28）。以后继 53 替代后，53 原位置由其右孩子 90 接管。中序遍历仍保持升序：12 24 28 53 90。',
        tags: ['BST', '插入', '删除', '中序有序']
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
        keywords: ['建堆', '下滤', '上滤', '优先队列'],
        problem: '将序列 [4,1,3,2,16,9,10,14,8,7] 建成大根堆，写出建堆后的数组；并说明删除堆顶后的调整过程。',
        input: '[4,1,3,2,16,9,10,14,8,7]',
        output: '建堆后数组（大根堆）：[16,14,10,8,7,9,3,2,4,1]',
        answer: '从最后一个内部结点（下标 4）起依次下滤：先调整 7→16，再 2→14，… 最终 16 在堆顶。删除堆顶：把末尾 1 放到根，对根下滤：1 与较大子 14 比较→换，继续与 8 比较→换，落到原 8 位置，恢复堆序。',
        tags: ['堆', '建堆', '下滤', '优先队列']
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
        keywords: ['DFS', '递归', '回溯', 'visited', '连通分量'],
        complexity: { time: 'O(V+E)', space: 'O(V)' },
        codeLang: 'cpp',
        codeSample: '// 邻接表 DFS（递归）\nbool vis[N];\nvoid dfs(int u){\n  vis[u]=true; visit(u);\n  for(int v : adj[u]) if(!vis[v]) dfs(v);\n}',
        useCases: ['连通性判断', '环检测', '拓扑排序', '迷宫求解', '树的先序']
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
        keywords: ['BFS', '队列', '分层', '无权最短路'],
        complexity: { time: 'O(V+E)', space: 'O(V)' },
        codeLang: 'cpp',
        codeSample: '// 邻接表 BFS\nbool vis[N]; int dist[N];\nvoid bfs(int s){\n  queue<int> q; q.push(s); vis[s]=true; dist[s]=0;\n  while(!q.empty()){\n    int u=q.front(); q.pop();\n    for(int v: adj[u]) if(!vis[v]){ vis[v]=true; dist[v]=dist[u]+1; q.push(v); }\n  }\n}',
        useCases: ['无权图最短路径', '层次遍历', '社交网络最少关系', '最短变换路径']
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
        keywords: ['DAG', '入度', '依赖关系', '任务调度'],
        complexity: { time: 'O(V+E)', space: 'O(V)' },
        codeLang: 'cpp',
        codeSample: '// 入度法（Kahn）\n// 1) 计算各顶点入度，入度为 0 的入队\n// 2) 出队 u，加入拓扑序；对 u 的每条出边 (u,v)，--in[v]，若为 0 入队\n// 3) 若输出顶点数 < V，则存在环\nqueue<int> q;\nfor(int i=0;i<V;i++) if(in[i]==0) q.push(i);\nwhile(!q.empty()){ int u=q.front(); q.pop(); order.push_back(u);\n  for(int v:adj[u]) if(--in[v]==0) q.push(v); }',
        useCases: ['编译依赖排序', '课程先修排课', '任务调度', '检测死锁/环']
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
        keywords: ['Prim', 'Kruskal', '带权图', '生成树', '并查集'],
        complexity: { prim: 'O(V²) 或 O(E log V)', kruskal: 'O(E log E)', space: 'O(V+E)' },
        codeLang: 'cpp',
        codeSample: '// Kruskal：边按权排序 + 并查集判环\nsort(edges);  // 按权递增\nint mst=0, cnt=0;\nfor(auto [w,u,v]: edges){\n  if(find(u)!=find(v)){ union(u,v); mst+=w; if(++cnt==V-1) break; }\n}',
        useCases: ['网络布线最小成本', '集群连接', '电路布线']
      },
      prerequisites: ['structure-graph', 'structure-heap'],
      related: ['algorithm-shortest-path', 'structure-huffman-tree', 'structure-union-find']
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
        keywords: ['Dijkstra', 'Floyd', 'Bellman-Ford', '单源', '多源'],
        complexity: { dijkstra: 'O((V+E) log V)', floyd: 'O(V³)', bellmanFord: 'O(VE)', space: 'O(V²) 或 O(V)' },
        codeLang: 'cpp',
        codeSample: '// Dijkstra（非负权单源，堆优化）\n// dist[s]=0，其余 INF；小根堆存 (d,u)\nwhile(!pq.empty()){\n  auto [d,u]=pq.top(); pq.pop();\n  if(d>dist[u]) continue;        // 过期记录\n  for(auto [v,w]: adj[u]) if(dist[u]+w<dist[v]){\n    dist[v]=dist[u]+w; pq.push({dist[v],v});\n  }\n}',
        useCases: ['导航最短路径', '网络路由', '地图服务']
      },
      prerequisites: ['structure-graph', 'algorithm-bfs'],
      related: ['algorithm-mst', 'algorithm-dynamic-programming'],
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
        keywords: ['DFS', 'BFS', '访问序列', '队列'],
        problem: '给定无向图邻接表（按编号升序访问邻接点）：1→{2,3}，2→{1,4,5}，3→{1,5}，4→{2}，5→{2,3}。从顶点 1 出发，写出 DFS 序与 BFS 序。',
        input: '邻接表如题；起点 1',
        output: 'DFS：1 2 4 5 3；BFS：1 2 3 4 5',
        answer: 'DFS：1→2→4（无未访问邻接，回溯）→5→3。BFS：访问 1，入队 2、3；出队 2，入队 4、5；出队 3（5 已在队）；出队 4；出队 5。故 BFS=1 2 3 4 5。',
        tags: ['图', 'DFS', 'BFS', '访问序列']
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
        keywords: ['Dijkstra', 'Floyd', '松弛', '距离数组'],
        problem: '带权有向图：1→2(10)、1→4(30)、1→5(100)、2→3(50)、3→5(10)、4→3(20)、4→5(60)。用 Dijkstra 求顶点 1 到其余各点的最短距离。',
        input: '边集如题；源点 1',
        output: 'dist[1..5] = 0, 10, 50, 30, 60',
        answer: '初始 dist={0,10,∞,30,100}。选最近未定 2(10)，松弛 2→3：dist[3]=60。选 4(30)，松弛 4→3：dist[3]=min(60,30+20)=50；松弛 4→5：dist[5]=min(100,30+60)=90。选 3(50)，松弛 3→5：dist[5]=min(90,50+10)=60。最终 dist={0,10,50,30,60}。',
        tags: ['Dijkstra', '最短路径', '松弛']
      },
      targets: ['algorithm-shortest-path']
    }),

    makeNode({
      id: 'chapter-search-sort-hash',
      label: '查找、排序与哈希',
      type: 'chapter',
      summary: '整合查找表、散列表和排序算法，形成数据处理效率优化主线。',
      prerequisites: ['chapter-tree'],
      properties: {
        order: 6,
        definition: '查找关注定位目标，排序关注重排序列，哈希通过映射提升查找效率。查找排序哈希依赖线性表、二叉树（BST/堆）与递归分治等基础。',
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
        keywords: ['有序表', '随机访问', 'mid', 'O(log n)'],
        complexity: { success: 'O(log n)', fail: 'O(log n)', space: 'O(1)' },
        codeLang: 'cpp',
        codeSample: '// 闭区间写法\nint binarySearch(int a[], int n, int key){\n  int l=0, r=n-1;\n  while(l<=r){\n    int mid=l+((r-l)>>1);\n    if(a[mid]==key) return mid;\n    else if(a[mid]<key) l=mid+1;\n    else r=mid-1;\n  }\n  return -1;\n}',
        useCases: ['有序表查找', '答案二分', 'lower/upper_bound', '数据库 B+ 树内部']
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
        keywords: ['哈希函数', '装填因子', '散列地址', '查找效率'],
        complexity: { avgSearch: 'O(1)', worstSearch: 'O(n)', insert: 'O(1)', space: 'O(n)' },
        codeLang: 'cpp',
        codeSample: '// 除留余数法 + 线性探测\nint h[N], M; // M 为表长\nint hashOf(int k){ return ((k % M) + M) % M; }\nvoid insert(int k){\n  int i=hashOf(k);\n  while(h[i]!=0 && h[i]!=k) i=(i+1)%M; // 探测\n  h[i]=k;\n}',
        useCases: ['字典/Map', '缓存', '去重', '数据库哈希索引', '密码学指纹']
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
        keywords: ['稳定排序', '局部有序', '直接插入', '移动元素'],
        complexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true },
        codeLang: 'cpp',
        codeSample: 'void insertSort(int a[], int n){\n  for(int i=1;i<n;i++){\n    int t=a[i], j=i-1;\n    while(j>=0 && a[j]>t){ a[j+1]=a[j]; j--; }\n    a[j+1]=t;\n  }\n}',
        useCases: ['小规模数据', '基本有序数据', 'TimSort 的小段处理']
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
        keywords: ['相邻交换', '稳定排序', 'O(n^2)', '提前结束'],
        complexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true },
        codeLang: 'cpp',
        codeSample: 'void bubbleSort(int a[], int n){\n  for(int i=0;i<n-1;i++){\n    bool swapped=false;\n    for(int j=0;j<n-1-i;j++)\n      if(a[j]>a[j+1]){ swap(a[j],a[j+1]); swapped=true; }\n    if(!swapped) break; // 本趟无交换，已有序\n  }\n}',
        useCases: ['教学演示', '几乎有序的小数据']
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
        keywords: ['选择最小值', '交换少', '不稳定', 'O(n^2)'],
        complexity: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false },
        codeLang: 'cpp',
        codeSample: 'void selectSort(int a[], int n){\n  for(int i=0;i<n-1;i++){\n    int k=i;\n    for(int j=i+1;j<n;j++) if(a[j]<a[k]) k=j;\n    if(k!=i) swap(a[i],a[k]);\n  }\n}',
        useCases: ['交换成本高的场景', '教学']
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
        keywords: ['分治', 'partition', '枢轴', '不稳定', 'O(n log n)'],
        complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false },
        codeLang: 'cpp',
        codeSample: '// Hoare 划分\nint partition(int a[], int lo, int hi){\n  int p=a[lo];\n  while(lo<hi){\n    while(lo<hi && a[hi]>=p) hi--; a[lo]=a[hi];\n    while(lo<hi && a[lo]<=p) lo++; a[hi]=a[lo];\n  }\n  a[lo]=p; return lo;\n}\nvoid quickSort(int a[], int lo, int hi){\n  if(lo>=hi) return;\n  int m=partition(a,lo,hi);\n  quickSort(a,lo,m-1); quickSort(a,m+1,hi);\n}',
        useCases: ['通用排序（C qsort/STL sort 内核）', '求第 k 小']
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
        keywords: ['分治', '合并', '稳定排序', '额外空间'],
        complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true },
        codeLang: 'cpp',
        codeSample: '// 有序合并\nvoid merge(int a[], int lo, int mid, int hi, int tmp[]){\n  int i=lo,j=mid+1,k=lo;\n  while(i<=mid && j<=hi) tmp[k++]=a[i]<=a[j]? a[i++]:a[j++];\n  while(i<=mid) tmp[k++]=a[i++];\n  while(j<=hi) tmp[k++]=a[j++];\n  for(int x=lo;x<=hi;x++) a[x]=tmp[x];\n}',
        useCases: ['外部排序', '稳定排序需求', '链表排序', '逆序对计数']
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
        keywords: ['大根堆', '建堆', '下滤', '不稳定', 'O(n log n)'],
        complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: false },
        codeLang: 'cpp',
        codeSample: 'void heapSort(int a[], int n){\n  // 建大根堆\n  for(int i=n/2-1;i>=0;i--) siftDown(a,i,n);\n  // 反复取堆顶\n  for(int i=n-1;i>0;i--){ swap(a[0],a[i]); siftDown(a,0,i); }\n}',
        useCases: ['原地排序', '优先取最值的场景', 'Top-K']
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
        keywords: ['非比较排序', '按位', '桶', '队列', '稳定'],
        complexity: { time: 'O(d*(n+r))', space: 'O(n+r)', stable: true },
        codeLang: 'cpp',
        codeSample: '// LSD 低位优先，r 为基数（如 10）\n// 对每一位：按该位分桶（稳定分配），再顺序收集回原数组\n// 重复 d 位（最大位数）\n// 关键：桶内分配收集必须稳定，否则高位结果被破坏',
        useCases: ['定长数字排序', '字符串排序', '大数据量、关键字范围有限']
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
        keywords: ['折半查找', '有序表', 'mid', '边界'],
        problem: '有序表 [7,14,18,21,23,29,31,35,42,56]（下标 1~10）中折半查找 18 与查找 25，写出每次比较的 mid 下标与对应值，以及查找成功/失败的比较次数。',
        input: '有序表如题；关键字 18 与 25',
        output: '查找 18：比较 2 次成功（mid=5→23，mid=2→18）；查找 25：比较 3 次失败',
        answer: '查找 18：low=1,high=10,mid=5(23)→18<23 high=4；mid=2(14)→18>14 low=3；mid=3(18) 命中，共 3 次比较。查找 25：mid=5(23)→25>23 low=6；mid=8(35)→25<35 high=7；mid=6(29)→25<29 high=5，low>high 失败，共 3 次比较。（成功比较次数依赖具体路径）',
        tags: ['折半查找', '判定树', 'ASL']
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
        keywords: ['哈希', '冲突', '探测', 'ASL'],
        problem: '哈希表长 13，哈希函数 H(k)=k%13，用线性探测法处理冲突。依次插入关键字 19,14,23,1,68,20,84,27,55。画出哈希表，并求查找成功的平均查找长度 ASL。',
        input: '关键字序列 19,14,23,1,68,20,84,27,55；表长 13',
        output: 'ASL(成功) ≈ 2.0',
        answer: 'H(19)=6,H(14)=1,H(23)=10,H(1)=1→冲突→2,H(68)=3,H(20)=7,H(84)=6→冲突→7→8,H(27)=1→2→3→4,H(55)=3→4→5。各关键字比较次数：19=1,14=1,23=1,1=2,68=1,20=1,84=3,27=4,55=3，共 17 次/9 个 → ASL≈1.89。',
        tags: ['哈希表', '线性探测', '冲突', 'ASL']
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
        keywords: ['排序', '稳定性', '复杂度', '手算过程'],
        problem: '对序列 [49,38,65,97,76,13,27,49*] 分别写出快速排序（以首元素为枢轴）第一趟划分结果、归并排序第一趟两两归并结果，并指出哪些算法稳定。',
        input: '[49,38,65,97,76,13,27,49*]（49* 标记相同关键字用于判稳定性）',
        output: '快排一趟：[27,38,13,49,76,97,65,49*]；归并一趟：[38,49][65,97][13,76][27,49*]',
        answer: '稳定排序：直接插入、冒泡、归并、基数；不稳定：希尔、快排、选择、堆排。快排首趟以 49 为枢轴划分后 49 归位，左侧均 <49、右侧均 ≥49。',
        tags: ['排序对比', '稳定性', '快排', '归并']
      },
      targets: ['algorithm-insertion-sort', 'algorithm-quick-sort', 'algorithm-merge-sort', 'algorithm-heap-sort', 'algorithm-radix-sort']
    }),
    makeNode({
      id: 'structure-red-black-tree',
      label: '红黑树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '通过红黑着色与旋转维持近似平衡的二叉查找树，插删调整代价低于 AVL。',
      properties: {
        definition: '红黑树满足：根黑、红结点孩子必黑、任一结点到叶的路径黑高相同，保证最长路径不超过最短路径 2 倍。',
        studyTip: '记住五条性质，插入后按叔结点颜色分情形变色或旋转。',
        keywords: ['红黑性质', '黑高', '变色', '旋转', '近似平衡'],
        complexity: { search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
        codeLang: 'cpp',
        codeSample: '// 插入修复（红色上浮）核心情形：\n// 1) 叔红：父与叔变黑、祖父变红，问题上移到祖父\n// 2) 叔黑且当前为内侧：先对父旋转转为外侧\n// 3) 叔黑且为外侧：父变黑、祖父变红，对祖父旋转\n// 根结点最终强制涂黑',
        useCases: ['C++ STL map/set', 'Java TreeMap', 'Linux 进程调度 CFS', '内存管理']
      },
      prerequisites: ['structure-bst', 'structure-avl-tree'],
      related: ['structure-b-tree']
    }),
    makeNode({
      id: 'structure-b-tree',
      label: 'B 树 / B+ 树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '多路平衡查找树，通过增大结点扇出降低树高，适合磁盘等外存索引。',
      properties: {
        definition: 'm 阶 B 树每个结点最多 m 个孩子，所有叶结点在同一层；B+ 树数据只在叶层并用链表串联，便于范围查询。',
        studyTip: '区分 B 树与 B+ 树：B+ 树非叶仅做索引、叶层有序链；关注阶数、分裂与合并。',
        keywords: ['多路平衡', '阶', '分裂', '合并', '外存索引'],
        complexity: { search: 'O(log_m n)', insert: 'O(log_m n)', delete: 'O(log_m n)', space: 'O(n)' },
        codeLang: 'text',
        codeSample: 'B+ 树查询范围 [a,b]：\n1) 自根逐层按关键字下行定位到叶结点\n2) 在叶层找到第一个 >= a 的位置\n3) 沿叶层有序链表顺序扫描直到 > b\n相比 B 树，B+ 树范围查询无需回溯到上层。',
        useCases: ['数据库索引（MySQL InnoDB B+ 树）', '文件系统', 'KV 存储']
      },
      prerequisites: ['structure-bst'],
      related: ['structure-red-black-tree']
    }),
    makeNode({
      id: 'structure-trie',
      label: '字典树 Trie',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '以公共前缀共享路径的多叉树，按字符逐层下行，适合字符串前缀检索。',
      properties: {
        definition: 'Trie 每条边代表一个字符，从根到某结点的路径即一个前缀；结点标记是否为单词结尾。',
        studyTip: '把查找、插入都看成沿字符逐层走，关注结点的孩子映射与结束标记。',
        keywords: ['前缀树', '多叉树', '字符路径', '前缀匹配'],
        complexity: { insert: 'O(L)', search: 'O(L)', space: 'O(ALPHA*N*L)' },
        codeLang: 'cpp',
        codeSample: '// 插入与查询（小写字母）\nstruct Node{ Node* ch[26]={}; bool end=false; };\nvoid insert(Node* r, const string& s){\n  for(char c: s){ int i=c-\'a\'; if(!r->ch[i]) r->ch[i]=new Node(); r=r->ch[i]; }\n  r->end=true;\n}\nbool search(Node* r, const string& s){\n  for(char c: s){ int i=c-\'a\'; if(!r->ch[i]) return false; r=r->ch[i]; }\n  return r->end;\n}',
        useCases: ['搜索引擎前缀联想', '敏感词过滤', 'IP 路由最长前缀匹配', '拼写检查']
      },
      prerequisites: ['structure-tree', 'structure-string'],
      related: ['structure-hash-table']
    }),
    makeNode({
      id: 'structure-skip-list',
      label: '跳表',
      type: 'structure',
      chapterId: 'chapter-search-sort-hash',
      summary: '在有序链表上叠加多级索引，用随机层数实现期望 O(log n) 的查找。',
      properties: {
        definition: '跳表通过多层稀疏索引加速有序链表查找，是平衡树的概率型替代，实现更简单。',
        studyTip: '理解“高层稀疏、底层完整”，查找时自顶向下、能跳则跳。',
        keywords: ['多级索引', '随机层数', '有序链表', '期望复杂度'],
        complexity: { search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
        codeLang: 'text',
        codeSample: '查找 key：从最高层头结点开始\n1) 当右侧结点存在且 < key：右移\n2) 否则下降一层\n3) 到达底层后再右移一次即候选位置\n插入时用抛硬币决定新结点层数（期望层数 ~ 1/(1-p)）。',
        useCases: ['Redis 有序集合 ZSet', 'LevelDB MemTable', '并发有序结构']
      },
      prerequisites: ['structure-linked-list', 'concept-complexity'],
      related: ['structure-bst', 'algorithm-binary-search']
    }),
    makeNode({
      id: 'structure-union-find',
      label: '并查集',
      type: 'structure',
      chapterId: 'chapter-graph',
      summary: '维护不相交集合的合并与查询，支持近似常数时间的连通性判断。',
      properties: {
        definition: '并查集用父指针森林表示集合，配合路径压缩与按秩合并，单次操作近似 O(α(n))。',
        studyTip: '掌握 find 的路径压缩与 union 的按秩/按大小合并两项优化。',
        keywords: ['不相交集合', '路径压缩', '按秩合并', '连通分量'],
        complexity: { find: 'O(α(n))', union: 'O(α(n))', space: 'O(n)' },
        codeLang: 'cpp',
        codeSample: 'int fa[N], rnk[N];\nint find(int x){ return fa[x]==x ? x : fa[x]=find(fa[x]); } // 路径压缩\nvoid unite(int a,int b){\n  a=find(a); b=find(b); if(a==b) return;\n  if(rnk[a]<rnk[b]) swap(a,b);   // 按秩合并\n  fa[b]=a; if(rnk[a]==rnk[b]) ++rnk[a];\n}',
        useCases: ['Kruskal 判环', '连通分量统计', '等价类合并', '网络连通性']
      },
      prerequisites: ['structure-tree', 'structure-graph'],
      related: ['algorithm-mst']
    }),
    makeNode({
      id: 'algorithm-astar',
      label: 'A* 搜索',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '在 Dijkstra 基础上引入启发式估价，引导搜索更快逼近目标。',
      properties: {
        definition: 'A* 用 f(n)=g(n)+h(n) 评估结点，g 为已走代价、h 为到目标的启发式估计；h 可采纳（不高估）时保证最优。',
        studyTip: '理解可采纳性与一致性，h≡0 时 A* 退化为 Dijkstra。',
        keywords: ['启发式', '估价函数', '可采纳', '最优路径'],
        complexity: { time: 'O(E)（依赖启发式）', space: 'O(V)' },
        codeLang: 'text',
        codeSample: '优先队列按 f=g+h 取最小结点 n：\n1) n 为目标则结束\n2) 对每个邻居 m：tentative = g(n)+w(n,m)\n3) 若优于已知 g(m)：更新 g(m)、f(m)=g(m)+h(m)，记录前驱并入队\n常用启发式：网格曼哈顿/欧氏距离。',
        useCases: ['游戏寻路', '地图导航', '机器人路径规划']
      },
      prerequisites: ['algorithm-shortest-path'],
      related: ['algorithm-bfs']
    }),
    makeNode({
      id: 'algorithm-counting-sort',
      label: '计数排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '统计每个关键字出现次数并按前缀和定位，非比较的线性时间排序。',
      properties: {
        definition: '计数排序适用于关键字为小范围整数的场景，借助计数数组与前缀和实现稳定排序。',
        studyTip: '关注值域 k 与规模 n 的关系，k 远大于 n 时不适用。',
        keywords: ['非比较排序', '计数数组', '前缀和', '稳定', '线性'],
        complexity: { time: 'O(n+k)', space: 'O(n+k)', stable: '稳定' },
        codeLang: 'cpp',
        codeSample: 'void countingSort(vector<int>& a, int k){\n  vector<int> cnt(k+1,0), out(a.size());\n  for(int x: a) ++cnt[x];\n  for(int i=1;i<=k;++i) cnt[i]+=cnt[i-1];        // 前缀和\n  for(int i=a.size()-1;i>=0;--i)                 // 逆序保证稳定\n    out[--cnt[a[i]]] = a[i];\n  a = out;\n}',
        useCases: ['基数排序的子过程', '小范围整数排序', '分数/年龄统计']
      },
      prerequisites: ['structure-array'],
      related: ['algorithm-radix-sort', 'algorithm-bucket-sort']
    }),
    makeNode({
      id: 'algorithm-external-sort',
      label: '外部排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '数据量超内存时，通过归并段生成与多路归并完成磁盘文件排序。',
      properties: {
        definition: '外部排序分两阶段：生成初始归并段（置换选择可得更长段），再多路归并（败者树减少比较）。',
        studyTip: '关注归并趟数 = ⌈log_k(段数)⌉，增大归并路数 k 可减少 I/O 趟数。',
        keywords: ['归并段', '多路归并', '败者树', '置换选择', 'I/O 次数'],
        complexity: { time: 'O(n log n)', io: 'O(n·趟数)', space: 'O(内存缓冲)' },
        codeLang: 'text',
        codeSample: '两阶段流程：\n1) 读入内存可容纳的块、内部排序后写回，形成若干有序归并段\n2) k 路归并：每次从 k 个段头取最小（败者树选优）写入输出\n增大 k 减少趟数，但每趟内部比较增加，用败者树平衡。',
        useCases: ['大文件排序', '数据库 ORDER BY 落盘', '日志归并']
      },
      prerequisites: ['algorithm-merge-sort', 'structure-heap'],
      related: ['algorithm-radix-sort']
    }),
    makeNode({
      id: 'concept-stability',
      label: '排序稳定性',
      type: 'concept',
      chapterId: 'chapter-search-sort-hash',
      summary: '相等关键字在排序前后相对次序是否保持，是选择排序算法的重要依据。',
      properties: {
        definition: '稳定排序保持相等元素原有相对顺序；多关键字排序时常依赖稳定性逐级排序。',
        studyTip: '记忆口诀：稳定有“插冒归基计数”，不稳定有“选堆希快”。',
        keywords: ['稳定性', '相对次序', '多关键字', '基数排序前提'],
        useCases: ['多关键字排序', '基数排序按位稳定', '保持业务原序']
      },
      prerequisites: ['concept-complexity'],
      related: ['algorithm-radix-sort', 'algorithm-merge-sort', 'algorithm-quick-sort', 'algorithm-insertion-sort']
    }),
    makeNode({
      id: 'algorithm-dynamic-programming',
      label: '动态规划',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '将问题分解为重叠子问题，用状态转移与记忆化避免重复计算。',
      properties: {
        definition: '动态规划依赖最优子结构与重叠子问题，通过定义状态、写出转移方程、确定边界与求解顺序实现。',
        studyTip: '先定义状态含义，再写转移方程，最后确定遍历顺序与边界。',
        keywords: ['最优子结构', '重叠子问题', '状态转移', '记忆化'],
        complexity: { time: 'O(状态数×转移)', space: 'O(状态数)' },
        codeLang: 'cpp',
        codeSample: '// 0-1 背包：dp[j] 表示容量 j 的最大价值\nfor(int i=0;i<n;++i)\n  for(int j=W;j>=w[i];--j)            // 逆序保证每物品取一次\n    dp[j] = max(dp[j], dp[j-w[i]]+v[i]);\n// 答案 dp[W]',
        useCases: ['背包问题', '最长公共子序列', '编辑距离', '最短路径 Floyd']
      },
      prerequisites: ['concept-recursion', 'concept-complexity'],
      related: ['algorithm-shortest-path']
    })
  ]
}

export function getNodeTypeMeta(type) {
  return NODE_TYPES[type] || NODE_TYPES.concept
}

export function getRelationTypeMeta(type) {
  return RELATION_TYPES[type] || RELATION_TYPES.RELATED_TO
}
