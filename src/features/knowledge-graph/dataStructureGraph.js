export const GRAPH_CODE = 'data-structure-knowledge-graph'
export const GRAPH_VERSION = '1.0.0'
export const GRAPH_SOURCE = {
  system: 'frontend-repo',
  scenario: 'knowledge-graph-preview',
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
  properties: {},
  ...node
})

export const courseNode = makeNode({
  id: 'course-data-structure',
  label: '数据结构',
  type: 'course',
  summary: '以抽象数据类型、存储结构和典型算法为骨架的数据结构知识总图。',
  properties: {
    focus: '课程总览',
    studyTip: '先顺着章节看全貌，再回到每类结构的定义、实现和典型题型。',
    keywords: ['ADT', '存储结构', '算法', '复杂度']
  }
})

export const rawGraph = {
  metadata: {
    title: '数据结构知识图谱',
    description: '用于前端展示、筛选、详情浏览与图数据库写入预览的数据结构知识体系。',
    domain: 'computer-science'
  },
  course: courseNode,
  nodes: [
    makeNode({
      id: 'chapter-foundation',
      label: '导论与分析',
      type: 'chapter',
      summary: '建立抽象数据类型、算法分析和存储方式的统一认知。',
      properties: {
        order: 1,
        focus: '理解“是什么”和“为什么”',
        studyTip: '先抓住抽象、复杂度、存储三件事，再进入具体结构。',
        keywords: ['ADT', '复杂度', '顺序存储', '链式存储']
      }
    }),
    makeNode({
      id: 'concept-adt',
      label: '抽象数据类型',
      type: 'concept',
      chapterId: 'chapter-foundation',
      summary: '用接口与行为描述数据对象，不关心底层实现细节。',
      properties: {
        definition: 'ADT 强调逻辑结构、数据关系和基本运算。',
        studyTip: '先问“数据能做什么”，再问“数据怎么存”。',
        keywords: ['接口', '行为', '封装']
      },
      related: ['concept-storage-structure']
    }),
    makeNode({
      id: 'concept-complexity',
      label: '复杂度分析',
      type: 'concept',
      chapterId: 'chapter-foundation',
      summary: '从时间复杂度和空间复杂度评估算法效率。',
      properties: {
        definition: '通过渐进分析比较不同算法在输入规模增长时的表现。',
        studyTip: '重点掌握最好、最坏、平均三种分析视角。',
        keywords: ['O(n)', 'O(log n)', '渐进分析']
      },
      appliesTo: ['algorithm-quick-sort', 'algorithm-merge-sort', 'algorithm-binary-search']
    }),
    makeNode({
      id: 'concept-storage-structure',
      label: '存储结构',
      type: 'concept',
      chapterId: 'chapter-foundation',
      summary: '描述逻辑结构到物理内存布局之间的映射关系。',
      properties: {
        definition: '顺序存储、链式存储和索引存储是最常见的实现方式。',
        studyTip: '把“连续还是分散”与“访问还是插入”一起记。',
        keywords: ['顺序存储', '链式存储', '索引存储']
      },
      prerequisites: ['concept-adt'],
      related: ['structure-array', 'structure-linked-list']
    }),
    makeNode({
      id: 'concept-recursion',
      label: '递归思想',
      type: 'concept',
      chapterId: 'chapter-foundation',
      summary: '把问题拆成规模更小、形式相同的子问题处理。',
      properties: {
        definition: '递归依赖终止条件、递推关系和回溯过程。',
        studyTip: '先画递归树，再检查出口条件和重复计算。',
        keywords: ['终止条件', '递推', '回溯']
      },
      appliesTo: ['algorithm-quick-sort', 'algorithm-merge-sort', 'algorithm-traversal']
    }),
    makeNode({
      id: 'operation-basic-ops',
      label: '基本操作',
      type: 'operation',
      chapterId: 'chapter-foundation',
      summary: '插入、删除、查找和遍历是多数结构共享的基础操作。',
      properties: {
        definition: '这些操作决定了具体结构的访问与维护成本。',
        studyTip: '先记住操作，再去比较不同结构对这些操作的支持差异。',
        keywords: ['插入', '删除', '查找', '遍历']
      },
      related: ['structure-sequential-list', 'structure-linked-list', 'structure-stack']
    }),
    makeNode({
      id: 'chapter-linear',
      label: '线性表',
      type: 'chapter',
      summary: '顺序表、链表和广义线性结构的统一入口。',
      prerequisites: ['chapter-foundation'],
      properties: {
        order: 2,
        focus: '顺序与链式结构',
        studyTip: '比较访问效率和插入删除效率，理解线性表的核心权衡。',
        keywords: ['顺序表', '链表', '广义表']
      }
    }),
    makeNode({
      id: 'structure-array',
      label: '数组',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '以连续内存保存同类型元素，支持快速随机访问。',
      properties: {
        definition: '数组是顺序存储的典型代表，访问快、扩容成本高。',
        studyTip: '把“下标访问快”和“插入搬移多”放在一起理解。',
        keywords: ['连续内存', '随机访问', '下标']
      },
      related: ['structure-sequential-list', 'structure-string']
    }),
    makeNode({
      id: 'structure-sequential-list',
      label: '顺序表',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '用数组实现的线性表，方便按位置访问。',
      properties: {
        definition: '顺序表通常依赖连续存储空间和元素移动完成插入删除。',
        studyTip: '重点练习按位查找、插入和删除时的元素搬移。',
        keywords: ['顺序存储', '元素搬移', '容量']
      },
      prerequisites: ['concept-storage-structure'],
      appliesTo: ['exercise-linear-sequential-list']
    }),
    makeNode({
      id: 'structure-linked-list',
      label: '单链表',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '通过指针把结点串联起来，便于插入删除。',
      properties: {
        definition: '链式结构以结点和指针表示线性关系。',
        studyTip: '先会找前驱和后继，再处理指针改连线。',
        keywords: ['结点', '指针', '前驱', '后继']
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
      summary: '每个结点同时保存前驱和后继指针，便于双向遍历。',
      properties: {
        definition: '双向链表提高了定位和删除的灵活性，但额外占用指针空间。',
        studyTip: '适合需要频繁前后移动的场景。',
        keywords: ['前驱指针', '后继指针', '双向遍历']
      },
      prerequisites: ['structure-linked-list']
    }),
    makeNode({
      id: 'structure-circular-list',
      label: '循环链表',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '尾结点指回头结点，形成闭环遍历结构。',
      properties: {
        definition: '循环链表便于实现循环访问和队列类应用。',
        studyTip: '重点记住尾结点指针的处理方式。',
        keywords: ['循环访问', '尾指针', '闭环']
      },
      prerequisites: ['structure-linked-list']
    }),
    makeNode({
      id: 'structure-generalized-list',
      label: '广义表',
      type: 'structure',
      chapterId: 'chapter-linear',
      summary: '允许元素本身仍是表的递归线性结构。',
      properties: {
        definition: '广义表可表达嵌套层级，常用于递归结构建模。',
        studyTip: '从“原子”和“子表”两个角度看结构。',
        keywords: ['递归定义', '嵌套', '原子']
      },
      prerequisites: ['structure-linked-list'],
      related: ['structure-tree']
    }),
    makeNode({
      id: 'operation-linear-update',
      label: '线性表操作',
      type: 'operation',
      chapterId: 'chapter-linear',
      summary: '顺序表和链表在插入、删除、查找上的操作差异。',
      properties: {
        definition: '围绕位置、指针和元素移动形成的典型操作集合。',
        studyTip: '做题时先判断是按位操作还是按值操作。',
        keywords: ['插入', '删除', '查找']
      },
      related: ['structure-sequential-list', 'structure-linked-list']
    }),
    makeNode({
      id: 'chapter-stack-queue',
      label: '栈、队列与串',
      type: 'chapter',
      summary: '围绕受限存取的线性结构与字符序列展开。',
      prerequisites: ['chapter-linear'],
      properties: {
        order: 3,
        focus: '受限访问结构',
        studyTip: '栈看“后进先出”，队列看“先进先出”，串看字符处理。',
        keywords: ['栈', '队列', '串']
      }
    }),
    makeNode({
      id: 'structure-stack',
      label: '栈',
      type: 'structure',
      chapterId: 'chapter-stack-queue',
      summary: '只能在栈顶进行插入和删除的受限线性表。',
      properties: {
        definition: '栈遵循 LIFO 规则，常用于函数调用和表达式求值。',
        studyTip: '结合递归和括号匹配一起练习。',
        keywords: ['LIFO', '栈顶', '压栈', '出栈']
      },
      prerequisites: ['structure-linked-list', 'structure-sequential-list'],
      related: ['structure-queue'],
      appliesTo: ['exercise-stack-queue-simulation']
    }),
    makeNode({
      id: 'structure-queue',
      label: '队列',
      type: 'structure',
      chapterId: 'chapter-stack-queue',
      summary: '只能在队尾插入、队头删除的受限线性表。',
      properties: {
        definition: '队列遵循 FIFO 规则，常用于缓冲和任务调度。',
        studyTip: '把入队、出队和队头队尾指针一起记。',
        keywords: ['FIFO', '队头', '队尾', '入队', '出队']
      },
      prerequisites: ['structure-sequential-list'],
      related: ['structure-circular-queue', 'structure-deque'],
      appliesTo: ['exercise-stack-queue-simulation']
    }),
    makeNode({
      id: 'structure-circular-queue',
      label: '循环队列',
      type: 'structure',
      chapterId: 'chapter-stack-queue',
      summary: '用取模解决队列假溢出问题的典型实现。',
      properties: {
        definition: '循环队列通过环形数组提高空间利用率。',
        studyTip: '重点掌握 front、rear 和空满判定。',
        keywords: ['取模', '环形数组', '空满判定']
      },
      prerequisites: ['structure-queue']
    }),
    makeNode({
      id: 'structure-deque',
      label: '双端队列',
      type: 'structure',
      chapterId: 'chapter-stack-queue',
      summary: '允许两端都进行插入和删除的队列变体。',
      properties: {
        definition: '双端队列兼具栈和队列的一部分特性。',
        studyTip: '比较两端操作时的位置变化。',
        keywords: ['双端', '灵活访问', '变体']
      },
      prerequisites: ['structure-queue']
    }),
    makeNode({
      id: 'structure-string',
      label: '串',
      type: 'structure',
      chapterId: 'chapter-stack-queue',
      summary: '字符序列的抽象结构，强调模式匹配和子串处理。',
      properties: {
        definition: '串的核心是字符数组、模式匹配和串操作。',
        studyTip: '重点练习查找子串、替换和拼接。',
        keywords: ['字符序列', '模式匹配', '子串']
      },
      prerequisites: ['structure-array'],
      related: ['structure-sequential-list']
    }),
    makeNode({
      id: 'operation-stack-queue',
      label: '栈队列操作',
      type: 'operation',
      chapterId: 'chapter-stack-queue',
      summary: '压栈、出栈、入队、出队和括号匹配等典型操作。',
      properties: {
        definition: '这些操作是表达式求值、层序遍历和模拟系统的基础。',
        studyTip: '题目中出现“最近”“先来先服务”时优先联想该类结构。',
        keywords: ['压栈', '出栈', '入队', '出队']
      },
      related: ['structure-stack', 'structure-queue']
    }),
    makeNode({
      id: 'chapter-tree',
      label: '树与二叉树',
      type: 'chapter',
      summary: '从层次结构到二叉树、堆和搜索树的完整链路。',
      prerequisites: ['chapter-stack-queue'],
      properties: {
        order: 4,
        focus: '层次结构和遍历',
        studyTip: '先建立树的层次感，再抓住二叉树的遍历规律。',
        keywords: ['树', '二叉树', '堆', '搜索树']
      }
    }),
    makeNode({
      id: 'structure-tree',
      label: '树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '非线性层次结构，父子关系是核心。',
      properties: {
        definition: '树由结点和边组成，适合表达层级组织。',
        studyTip: '记住根、叶子、度、深度、层次这些基本概念。',
        keywords: ['层次', '根', '叶子', '深度']
      },
      prerequisites: ['concept-recursion'],
      related: ['structure-graph', 'structure-binary-tree']
    }),
    makeNode({
      id: 'structure-binary-tree',
      label: '二叉树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '每个结点最多有两个子树的树形结构。',
      properties: {
        definition: '二叉树是树的基础模型，也是多种高级结构的底座。',
        studyTip: '先会画树，再理解三种遍历和递归定义。',
        keywords: ['左子树', '右子树', '递归定义']
      },
      prerequisites: ['structure-tree'],
      related: ['algorithm-traversal', 'structure-heap', 'structure-bst']
    }),
    makeNode({
      id: 'algorithm-traversal',
      label: '二叉树遍历',
      type: 'algorithm',
      chapterId: 'chapter-tree',
      summary: '前序、中序、后序和层序遍历是二叉树的核心算法。',
      properties: {
        definition: '遍历算法体现了递归和栈/队列的配合使用。',
        studyTip: '把“访问根的时机”作为区分前中后的关键。',
        keywords: ['前序', '中序', '后序', '层序']
      },
      prerequisites: ['structure-binary-tree'],
      appliesTo: ['structure-threaded-tree', 'exercise-tree-traversal']
    }),
    makeNode({
      id: 'structure-bst',
      label: '二叉排序树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '左小右大的二叉树，用于支持有序查找。',
      properties: {
        definition: 'BST 将查找与有序性结合，是平衡树和索引的基础。',
        studyTip: '插入和删除题目常考最小/最大结点与替代结点。',
        keywords: ['有序性', '查找', '插入', '删除']
      },
      prerequisites: ['structure-binary-tree', 'algorithm-sequential-search'],
      related: ['structure-avl-tree'],
      appliesTo: ['exercise-bst-insert']
    }),
    makeNode({
      id: 'structure-avl-tree',
      label: '平衡二叉树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '通过旋转维护高度平衡的二叉搜索树。',
      properties: {
        definition: 'AVL 树通过平衡因子和旋转保持查找性能稳定。',
        studyTip: '先识别失衡类型，再选对应旋转方式。',
        keywords: ['旋转', '平衡因子', '高度平衡']
      },
      prerequisites: ['structure-bst']
    }),
    makeNode({
      id: 'structure-heap',
      label: '堆',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '满足堆序性质的完全二叉树，常用于优先队列。',
      properties: {
        definition: '堆通常用顺序存储实现，便于维护父子关系。',
        studyTip: '理解上滤、下滤和堆排序的关系。',
        keywords: ['优先队列', '完全二叉树', '上滤', '下滤']
      },
      prerequisites: ['structure-binary-tree', 'structure-sequential-list'],
      related: ['algorithm-mst', 'algorithm-shortest-path']
    }),
    makeNode({
      id: 'structure-threaded-tree',
      label: '线索二叉树',
      type: 'structure',
      chapterId: 'chapter-tree',
      summary: '利用空指针保存前驱或后继信息，提高遍历效率。',
      properties: {
        definition: '线索化能够减少遍历时的栈使用。',
        studyTip: '重点区分前驱线索和后继线索。',
        keywords: ['线索化', '前驱', '后继']
      },
      prerequisites: ['structure-binary-tree'],
      related: ['algorithm-traversal']
    }),
    makeNode({
      id: 'chapter-graph',
      label: '图',
      type: 'chapter',
      summary: '处理多对多关系的非线性结构和经典图算法。',
      prerequisites: ['chapter-tree'],
      properties: {
        order: 5,
        focus: '图的存储与遍历',
        studyTip: '先理解顶点、边和权值，再看 DFS、BFS 和最短路。',
        keywords: ['顶点', '边', '权值', '遍历']
      }
    }),
    makeNode({
      id: 'structure-graph',
      label: '图结构',
      type: 'structure',
      chapterId: 'chapter-graph',
      summary: '表达顶点与边关系的通用非线性结构。',
      properties: {
        definition: '图可以是有向图、无向图、带权图或无权图。',
        studyTip: '把“多对多关系”看成图最核心的适用场景。',
        keywords: ['有向图', '无向图', '带权图']
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
      summary: '以链式结构保存图的边信息，适合稀疏图。',
      properties: {
        definition: '邻接表节省空间，遍历某个顶点的邻边很方便。',
        studyTip: '稀疏图优先想到邻接表。',
        keywords: ['稀疏图', '链式存储', '边表']
      },
      prerequisites: ['structure-linked-list'],
      related: ['structure-graph']
    }),
    makeNode({
      id: 'structure-adjacency-matrix',
      label: '邻接矩阵',
      type: 'structure',
      chapterId: 'chapter-graph',
      summary: '用二维数组记录边关系，适合稠密图。',
      properties: {
        definition: '邻接矩阵判断边是否存在非常直接，但空间开销较大。',
        studyTip: '稠密图和快速判边常用矩阵。',
        keywords: ['稠密图', '二维数组', '判边']
      },
      prerequisites: ['structure-array'],
      related: ['structure-graph']
    }),
    makeNode({
      id: 'algorithm-dfs',
      label: '深度优先搜索',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '沿着一条路径尽可能深入地访问图或树。',
      properties: {
        definition: 'DFS 常用递归或显式栈实现。',
        studyTip: '把“先深入再回退”当作核心动作。',
        keywords: ['递归', '回溯', '栈']
      },
      prerequisites: ['structure-graph'],
      related: ['algorithm-bfs'],
      appliesTo: ['structure-graph']
    }),
    makeNode({
      id: 'algorithm-bfs',
      label: '广度优先搜索',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '按层次逐步扩展访问图或树。',
      properties: {
        definition: 'BFS 通常依赖队列维护待访问顶点。',
        studyTip: '把“先访问最近层”与队列联系起来。',
        keywords: ['队列', '分层', '最短路径']
      },
      prerequisites: ['structure-graph', 'structure-queue'],
      related: ['algorithm-dfs'],
      appliesTo: ['structure-graph']
    }),
    makeNode({
      id: 'algorithm-topological-sort',
      label: '拓扑排序',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '对有向无环图中的顶点进行线性排序。',
      properties: {
        definition: '拓扑排序用于描述依赖关系和任务执行顺序。',
        studyTip: '看到“先修关系”就想 DAG 和拓扑序。',
        keywords: ['DAG', '依赖', '入度']
      },
      prerequisites: ['algorithm-bfs', 'structure-graph'],
      appliesTo: ['structure-graph']
    }),
    makeNode({
      id: 'algorithm-mst',
      label: '最小生成树',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '在带权连通图中寻找权值总和最小的生成树。',
      properties: {
        definition: 'Prim 和 Kruskal 是最典型的两类方法。',
        studyTip: '把“连通”和“最小代价连接全部顶点”一起记。',
        keywords: ['Prim', 'Kruskal', '带权图']
      },
      prerequisites: ['structure-graph', 'structure-heap'],
      related: ['algorithm-shortest-path']
    }),
    makeNode({
      id: 'algorithm-shortest-path',
      label: '最短路径',
      type: 'algorithm',
      chapterId: 'chapter-graph',
      summary: '在图中寻找两点之间代价最小的路径。',
      properties: {
        definition: '单源最短路径和多源最短路径是常见分类。',
        studyTip: '先分清权值是否非负，再选算法。',
        keywords: ['Dijkstra', 'Floyd', 'Bellman-Ford']
      },
      prerequisites: ['structure-graph', 'algorithm-bfs'],
      related: ['algorithm-mst']
    }),
    makeNode({
      id: 'chapter-search-sort-hash',
      label: '查找、排序与哈希',
      type: 'chapter',
      summary: '把有序性、分治思想和散列映射连接成一组。',
      prerequisites: ['chapter-linear'],
      properties: {
        order: 6,
        focus: '查找、排序和映射',
        studyTip: '先看输入是否有序，再决定查找、排序或哈希路线。',
        keywords: ['查找', '排序', '哈希']
      }
    }),
    makeNode({
      id: 'algorithm-sequential-search',
      label: '顺序查找',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '逐个比较元素，适合无序结构和小规模数据。',
      properties: {
        definition: '顺序查找实现简单，但平均查找次数较高。',
        studyTip: '无序数据和少量元素时先想到它。',
        keywords: ['线性扫描', '平均性能']
      },
      prerequisites: ['structure-sequential-list'],
      appliesTo: ['structure-sequential-list', 'exercise-binary-search']
    }),
    makeNode({
      id: 'algorithm-binary-search',
      label: '折半查找',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '在有序表中不断缩小查找区间。',
      properties: {
        definition: '折半查找要求数据有序，时间复杂度为 O(log n)。',
        studyTip: '先确认有序，再确定 mid 和区间更新方式。',
        keywords: ['有序表', 'mid', '区间收缩']
      },
      prerequisites: ['structure-sequential-list', 'algorithm-sequential-search'],
      related: ['algorithm-sequential-search'],
      appliesTo: ['exercise-binary-search']
    }),
    makeNode({
      id: 'structure-hash-table',
      label: '哈希表',
      type: 'structure',
      chapterId: 'chapter-search-sort-hash',
      summary: '通过哈希函数把关键字映射到存储位置。',
      properties: {
        definition: '哈希表在查找效率与冲突处理之间寻找平衡。',
        studyTip: '把“存储位置=哈希函数结果”作为第一印象。',
        keywords: ['哈希函数', '映射', '冲突']
      },
      prerequisites: ['structure-array'],
      related: ['concept-collision', 'algorithm-sequential-search'],
      appliesTo: ['exercise-hash-table-lookup']
    }),
    makeNode({
      id: 'concept-collision',
      label: '冲突处理',
      type: 'concept',
      chapterId: 'chapter-search-sort-hash',
      summary: '哈希表中多个关键字映射到同一地址的处理方式。',
      properties: {
        definition: '开放定址和链地址法是最常见的冲突解决手段。',
        studyTip: '把“发生冲突后如何继续找位置”记清楚。',
        keywords: ['开放定址', '链地址法', '装填因子']
      },
      prerequisites: ['structure-hash-table'],
      related: ['structure-hash-table']
    }),
    makeNode({
      id: 'algorithm-insertion-sort',
      label: '插入排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '将数据分为已排序区和待排序区，逐个插入。',
      properties: {
        definition: '插入排序适合小规模或部分有序的数据。',
        studyTip: '模拟手里拿牌的过程最容易理解。',
        keywords: ['稳定', '局部有序']
      },
      prerequisites: ['concept-complexity', 'structure-array'],
      appliesTo: ['exercise-quick-sort']
    }),
    makeNode({
      id: 'algorithm-bubble-sort',
      label: '冒泡排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '通过相邻元素交换不断把最大值“冒”到末尾。',
      properties: {
        definition: '冒泡排序实现简单，但通常只适合教学理解。',
        studyTip: '关注每一趟排序后最大值的位置变化。',
        keywords: ['交换', '稳定']
      },
      prerequisites: ['structure-array', 'concept-complexity']
    }),
    makeNode({
      id: 'algorithm-selection-sort',
      label: '选择排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '每一趟选出最小或最大元素放到当前位。',
      properties: {
        definition: '选择排序交换次数少，但比较次数固定。',
        studyTip: '适合和插入排序、冒泡排序一起对比记忆。',
        keywords: ['交换少', '比较固定']
      },
      prerequisites: ['structure-array', 'concept-complexity']
    }),
    makeNode({
      id: 'algorithm-quick-sort',
      label: '快速排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '分治排序中最经典的算法之一，基于划分操作。',
      properties: {
        definition: '快速排序通常依赖递归和划分枢轴。',
        studyTip: '先理解 partition，再理解递归划分。',
        keywords: ['分治', '划分', '枢轴']
      },
      prerequisites: ['concept-recursion', 'structure-array', 'concept-complexity'],
      related: ['algorithm-merge-sort'],
      appliesTo: ['exercise-quick-sort']
    }),
    makeNode({
      id: 'algorithm-merge-sort',
      label: '归并排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '把序列分成更小部分后再合并，稳定性好。',
      properties: {
        definition: '归并排序的核心是拆分和有序合并。',
        studyTip: '适合和快速排序一起比较分治过程。',
        keywords: ['分治', '合并', '稳定']
      },
      prerequisites: ['concept-recursion', 'structure-array', 'concept-complexity'],
      related: ['algorithm-quick-sort']
    }),
    makeNode({
      id: 'algorithm-shell-sort',
      label: '希尔排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '在插入排序基础上先做分组，再逐步缩小增量。',
      properties: {
        definition: '希尔排序通过“分组插入”减少元素移动。',
        studyTip: '先理解增量序列的概念。',
        keywords: ['增量', '分组插入']
      },
      prerequisites: ['structure-array', 'algorithm-insertion-sort']
    }),
    makeNode({
      id: 'algorithm-radix-sort',
      label: '基数排序',
      type: 'algorithm',
      chapterId: 'chapter-search-sort-hash',
      summary: '按位排序的非比较型算法，适合关键字范围有限的场景。',
      properties: {
        definition: '基数排序通常借助队列完成分配与收集。',
        studyTip: '把“从低位到高位”与队列分发结合起来理解。',
        keywords: ['按位', '分配收集', '队列']
      },
      prerequisites: ['structure-array', 'structure-circular-queue'],
      appliesTo: ['exercise-quick-sort']
    }),
    makeNode({
      id: 'exercise-linear-sequential-list',
      label: '顺序表插入练习',
      type: 'exercise',
      chapterId: 'chapter-linear',
      summary: '围绕顺序表的插入位置、元素搬移和边界处理出题。',
      properties: {
        title: '顺序表插入与删除',
        difficulty: 'easy',
        estimatedMinutes: 15,
        studyTip: '按位移动元素时注意边界和空位。',
        keywords: ['插入', '删除', '边界']
      },
      targets: ['structure-sequential-list']
    }),
    makeNode({
      id: 'exercise-linked-list-reverse',
      label: '链表反转练习',
      type: 'exercise',
      chapterId: 'chapter-linear',
      summary: '通过链表结点重连巩固单链表操作。',
      properties: {
        title: '单链表逆置',
        difficulty: 'medium',
        estimatedMinutes: 20,
        studyTip: '先画出前驱、当前、后继三个指针状态。',
        keywords: ['反转', '指针']
      },
      targets: ['structure-linked-list']
    }),
    makeNode({
      id: 'exercise-stack-queue-simulation',
      label: '栈队列模拟练习',
      type: 'exercise',
      chapterId: 'chapter-stack-queue',
      summary: '用栈和队列完成表达式、括号和任务调度模拟。',
      properties: {
        title: '栈与队列综合模拟',
        difficulty: 'medium',
        estimatedMinutes: 20,
        studyTip: '遇到“最近/最先”字样先判断是哪种受限结构。',
        keywords: ['模拟', '表达式', '括号']
      },
      targets: ['structure-stack', 'structure-queue']
    }),
    makeNode({
      id: 'exercise-tree-traversal',
      label: '树遍历练习',
      type: 'exercise',
      chapterId: 'chapter-tree',
      summary: '围绕递归和遍历序列重建等题型展开。',
      properties: {
        title: '二叉树遍历',
        difficulty: 'medium',
        estimatedMinutes: 25,
        studyTip: '把访问根结点的时机写在草稿纸上。',
        keywords: ['前序', '中序', '后序']
      },
      targets: ['algorithm-traversal']
    }),
    makeNode({
      id: 'exercise-bst-insert',
      label: 'BST 插入练习',
      type: 'exercise',
      chapterId: 'chapter-tree',
      summary: '训练二叉排序树的插入路径和结点定位。',
      properties: {
        title: '二叉排序树插入',
        difficulty: 'medium',
        estimatedMinutes: 25,
        studyTip: '记住“左小右大”是走树的唯一准则。',
        keywords: ['BST', '插入', '路径']
      },
      targets: ['structure-bst']
    }),
    makeNode({
      id: 'exercise-graph-bfs',
      label: '图 BFS 练习',
      type: 'exercise',
      chapterId: 'chapter-graph',
      summary: '围绕图的分层访问与队列模拟展开。',
      properties: {
        title: '图的广度优先遍历',
        difficulty: 'hard',
        estimatedMinutes: 30,
        studyTip: '先写队列变化，再写访问序列。',
        keywords: ['BFS', '队列', '分层']
      },
      targets: ['algorithm-bfs']
    }),
    makeNode({
      id: 'exercise-shortest-path',
      label: '最短路练习',
      type: 'exercise',
      chapterId: 'chapter-graph',
      summary: '围绕权值图和最短路径更新规则出题。',
      properties: {
        title: '最短路径综合',
        difficulty: 'hard',
        estimatedMinutes: 35,
        studyTip: '先判断是单源还是多源，再选算法。',
        keywords: ['Dijkstra', 'Floyd', '路径']
      },
      targets: ['algorithm-shortest-path']
    }),
    makeNode({
      id: 'exercise-quick-sort',
      label: '快速排序练习',
      type: 'exercise',
      chapterId: 'chapter-search-sort-hash',
      summary: '围绕分治划分、递归和交换实现综合训练。',
      properties: {
        title: '快速排序',
        difficulty: 'hard',
        estimatedMinutes: 30,
        studyTip: '先记住一次 partition 后左右两边都要递归处理。',
        keywords: ['分治', '递归', 'partition']
      },
      targets: ['algorithm-quick-sort']
    }),
    makeNode({
      id: 'exercise-hash-table-lookup',
      label: '哈希查找练习',
      type: 'exercise',
      chapterId: 'chapter-search-sort-hash',
      summary: '围绕哈希地址、冲突和探测策略设计题目。',
      properties: {
        title: '哈希表查找',
        difficulty: 'hard',
        estimatedMinutes: 25,
        studyTip: '先算哈希地址，再讨论冲突处理。',
        keywords: ['哈希', '冲突', '查找']
      },
      targets: ['structure-hash-table', 'concept-collision']
    }),
    makeNode({
      id: 'exercise-binary-search',
      label: '折半查找练习',
      type: 'exercise',
      chapterId: 'chapter-search-sort-hash',
      summary: '围绕有序表的中间位置更新和边界收缩展开。',
      properties: {
        title: '折半查找',
        difficulty: 'medium',
        estimatedMinutes: 15,
        studyTip: '每次更新都检查 left、mid、right 的关系。',
        keywords: ['有序', 'mid', '边界']
      },
      targets: ['algorithm-binary-search']
    })
  ]
}

export function getNodeTypeMeta(type) {
  return NODE_TYPES[type] || NODE_TYPES.concept
}

export function getRelationTypeMeta(type) {
  return RELATION_TYPES[type] || RELATION_TYPES.RELATED_TO
}
