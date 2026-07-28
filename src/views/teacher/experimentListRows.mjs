const sortableDeadline = value => Number.isFinite(value) ? value : Number.POSITIVE_INFINITY

export const getExperimentRowsByStatus = (experiments, status) => experiments
  .filter(experiment => experiment.status === status)
  .sort((left, right) => sortableDeadline(left.deadlineTimestamp) - sortableDeadline(right.deadlineTimestamp))
