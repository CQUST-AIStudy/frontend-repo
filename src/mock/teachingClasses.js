export const mockTeachingClasses = [
  {
    id: 101,
    name: '数据结构 1 班',
    courseName: '数据结构',
    studentCount: 42,
    ptaKeyword: '数据结构1班'
  },
  {
    id: 102,
    name: '程序设计基础 2 班',
    courseName: '程序设计基础',
    studentCount: 38,
    ptaKeyword: '程序设计基础2班'
  },
  {
    id: 103,
    name: '算法设计实验班',
    courseName: '算法设计与分析',
    studentCount: 35,
    ptaKeyword: '算法设计实验班'
  }
]

export async function getMockTeachingClasses(delayMs = 350) {
  await new Promise(resolve => setTimeout(resolve, delayMs))
  return {
    success: true,
    data: mockTeachingClasses.map(item => ({ ...item }))
  }
}
