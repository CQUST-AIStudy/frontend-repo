export function buildAiCommentRequest(experimentId, force) {
  return {
    url: `/api/experiments/${experimentId}/ai-comment/generate?force=${Boolean(force)}`,
    data: {},
    config: {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
}
