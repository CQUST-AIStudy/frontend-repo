export function findFirstHealthyCandidate(candidates, probe) {
  if (!candidates.length) return Promise.resolve(null)

  return new Promise((resolve) => {
    let remaining = candidates.length
    let settled = false

    const finishAttempt = (candidate, healthy) => {
      if (settled) return
      if (healthy) {
        settled = true
        resolve(candidate)
        return
      }
      remaining -= 1
      if (remaining === 0) resolve(null)
    }

    for (const candidate of candidates) {
      Promise.resolve()
        .then(() => probe(candidate))
        .then(
          healthy => finishAttempt(candidate, healthy),
          () => finishAttempt(candidate, false)
        )
    }
  })
}
