import { ref } from 'vue'

export const TIMELINE_COLLAPSED_LIMIT = 8

const RESULT_META = {
  ACCEPTED: {
    label: '通过',
    badgeClass: 'bg-[#34c759]/10 text-[#34c759]',
    scoreClass: 'text-[#34c759]'
  },
  PARTIAL_ACCEPTED: {
    label: '部分通过',
    badgeClass: 'bg-[#ff9f0a]/10 text-[#ff9f0a]',
    scoreClass: 'text-[#ff9f0a]'
  },
  MULTIPLE_ERROR: {
    label: '多处错误',
    badgeClass: 'bg-[#ff3b30]/10 text-[#ff3b30]',
    scoreClass: 'text-[#ff3b30]'
  },
  WRONG_ANSWER: {
    label: '答案错误',
    badgeClass: 'bg-[#ff3b30]/10 text-[#ff3b30]',
    scoreClass: 'text-[#ff3b30]'
  },
  WRONG: {
    label: '答案错误',
    badgeClass: 'bg-[#ff3b30]/10 text-[#ff3b30]',
    scoreClass: 'text-[#ff3b30]'
  },
  COMPILE_ERROR: {
    label: '编译错误',
    badgeClass: 'bg-[#ff3b30]/10 text-[#ff3b30]',
    scoreClass: 'text-[#ff3b30]'
  },
  TIME_LIMIT_EXCEEDED: {
    label: '运行超时',
    badgeClass: 'bg-[#ff9f0a]/10 text-[#ff9f0a]',
    scoreClass: 'text-[#ff9f0a]'
  },
  MEMORY_LIMIT_EXCEEDED: {
    label: '内存超限',
    badgeClass: 'bg-[#ff9f0a]/10 text-[#ff9f0a]',
    scoreClass: 'text-[#ff9f0a]'
  },
  RUNTIME_ERROR: {
    label: '运行错误',
    badgeClass: 'bg-[#ff3b30]/10 text-[#ff3b30]',
    scoreClass: 'text-[#ff3b30]'
  }
}

const UNKNOWN_RESULT_META = {
  badgeClass: 'bg-[#6e6e73]/10 text-[#6e6e73]',
  scoreClass: 'text-[#6e6e73]'
}

export function getTimelineResultMeta(result) {
  const normalizedResult = result || '-'
  return RESULT_META[normalizedResult] || {
    label: normalizedResult,
    ...UNKNOWN_RESULT_META
  }
}

export function getTimelineScoreClass(source, result) {
  if (source === 'leetcode') {
    return result === 'ACCEPTED' ? 'text-[#34c759]' : 'text-[#ff3b30]'
  }
  return getTimelineResultMeta(result).scoreClass
}

export function shouldCollapseTimeline(total) {
  return total > TIMELINE_COLLAPSED_LIMIT
}

export function getTimelineToggleLabel(expanded, total) {
  return expanded ? '收起时间线' : `展开全部 ${total} 条`
}

export function createTimelineViewportState() {
  const expanded = ref(false)
  const container = ref(null)

  function scrollToTop() {
    if (container.value) container.value.scrollTop = 0
  }

  function reset() {
    expanded.value = false
    scrollToTop()
  }

  function toggle() {
    expanded.value = !expanded.value
    if (!expanded.value) scrollToTop()
  }

  return { expanded, container, toggle, reset }
}
