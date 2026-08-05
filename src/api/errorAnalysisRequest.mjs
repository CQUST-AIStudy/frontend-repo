export function buildErrorAnalysisPayload(experimentId, forceRefresh, { skipAi = true } = {}) {
  return {
    experimentId,
    forceRefresh: forceRefresh === true,
    skipAi: skipAi === true
  }
}

export function buildProblemDeepAnalysisPayload(experimentId, problemId, forceRefresh) {
  return {
    experimentId,
    problemId,
    forceRefresh: forceRefresh === true
  }
}
