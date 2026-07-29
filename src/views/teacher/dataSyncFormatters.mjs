export function formatSyncTime(value) {
  if (!value) return '-'

  const match = String(value).trim().match(
    /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/
  )
  return match ? `${match[1]} ${match[2]}` : String(value)
}
