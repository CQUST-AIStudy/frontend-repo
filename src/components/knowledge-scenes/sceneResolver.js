export function resolveSceneType(nodeId = '', nodeName = '') {
  const id = String(nodeId).toLowerCase()
  const name = String(nodeName).toLowerCase()

  if (id === 'linked-list' || name.includes('链表')) return 'linked-list'
  if (id.includes('array') || name.includes('数组') || id === 'sort-search') return 'array'
  if (id.includes('pointer') || name.includes('指针')) return 'pointer'
  if (id === 'parameter' || name.includes('参数传递')) return 'parameter'
  if (id.includes('function') || name.includes('函数') || id === 'recursion' || id === 'scope' || name.includes('递归') || name.includes('作用域')) return 'function'
  if (id === 'control-statement' || id === 'operator' || id === 'expression' || name.includes('控制') || name.includes('运算符') || name.includes('表达式')) return 'control-flow'
  if (id === 'string-process' || id === 'char-array' || name.includes('字符串') || name.includes('字符')) return 'string'
  if (id === 'struct' || name.includes('结构体')) return 'struct'
  if (id === 'data-type' || id === 'constant-variable' || name.includes('变量') || name.includes('常量') || name.includes('类型')) return 'variables'
  if (id === 'input-output' || name.includes('输入') || name.includes('输出')) return 'io'
  if (id === 'dynamic-memory' || id === 'file-operation' || name.includes('内存') || name.includes('文件')) return 'memory'
  return 'concept'
}

export function getSceneDuration(sceneType) {
  switch (sceneType) {
    case 'linked-list': return 8
    case 'array': return 8
    case 'pointer': return 7
    case 'parameter': return 7
    case 'function': return 7
    case 'control-flow': return 6
    case 'string': return 6
    case 'struct': return 6
    case 'variables': return 6
    case 'io': return 6
    case 'memory': return 6
    default: return 6
  }
}
