export function buildErrorAnalysisPayload(experimentId, forceRefresh) {
  return {
    experimentId,
    forceRefresh: forceRefresh === true
  }
}
