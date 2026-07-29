export const SUBMISSION_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'submitted', label: '已提交' },
  { value: 'not_started', label: '未提交' }
]

export function normalizeSubmissionStatus(item = {}) {
  const status = String(item.status || '').toLowerCase()
  const submissionStatus = String(item.submissionStatus || '').toUpperCase()

  if (
    ['completed', 'submitted', 'graded', 'rejected'].includes(status)
    || ['SUBMITTED', 'GRADED'].includes(submissionStatus)
  ) {
    return 'submitted'
  }
  return 'not_started'
}

export function getSubmissionStatusText(status) {
  return status === 'submitted' ? '已提交' : '未提交'
}
