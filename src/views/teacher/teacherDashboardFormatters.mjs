function pad(value) {
  return String(value).padStart(2, '0')
}

export function formatSubmissionTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatCompletionTooltip(params = []) {
  const item = params[0]?.data
  if (!item) return ''
  return `${item.fullName}<br/>完成率：${item.value}%`
}
