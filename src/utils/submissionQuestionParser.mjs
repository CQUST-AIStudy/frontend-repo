const QUESTION_HEADING_REGEX = /(?:^|\n)\s*第\s*(\d+)\s*题\s*(?:如下)?\s*[:：]?\s*\n/g
const TEST_RESULTS_REGEX = /([\s\S]*?)((?:\|\s*测试点[\s\S]*?)+$)/

function buildStructuredQuestion(problem, fallbackNumber) {
  return {
    number: problem?.number ?? fallbackNumber,
    problemNo: problem?.problemNo ?? null,
    problemTitle: problem?.problemTitle ?? null,
    statementMd: problem?.statementMd ?? null,
    code: problem?.code ?? '',
    testResults: null,
    comment: '',
    saving: false
  }
}

function enrichWithStructuredProblem(question, problem) {
  if (!problem) return question
  return {
    ...question,
    problemNo: problem.problemNo ?? question.problemNo ?? null,
    problemTitle: problem.problemTitle ?? question.problemTitle ?? null,
    statementMd: problem.statementMd ?? question.statementMd ?? null,
    code: question.code || problem.code || ''
  }
}

function buildStructuredMap(problems) {
  const map = new Map()
  if (!Array.isArray(problems)) return map

  problems.forEach((problem, index) => {
    const number = Number(problem?.number ?? index + 1)
    if (!Number.isFinite(number) || map.has(number)) return
    map.set(number, problem)
  })

  return map
}

export function parseSubmissionQuestions({ code, problems } = {}) {
  const structuredMap = buildStructuredMap(problems)
  const hasStructured = structuredMap.size > 0
  const source = typeof code === 'string' ? code : ''

  if (!source.trim() && hasStructured) {
    return Array.from(structuredMap.entries()).map(([number, problem]) =>
      buildStructuredQuestion(problem, number)
    )
  }

  const headings = []
  let headingMatch
  while ((headingMatch = QUESTION_HEADING_REGEX.exec(source)) !== null) {
    headings.push({
      number: Number(headingMatch[1]),
      contentStart: QUESTION_HEADING_REGEX.lastIndex,
      headingStart: headingMatch.index
    })
  }

  const questions = []
  const seenNumbers = new Set()
  headings.forEach((heading, index) => {
    if (seenNumbers.has(heading.number)) return
    seenNumbers.add(heading.number)

    const nextHeading = headings[index + 1]
    let questionCode = source
      .slice(heading.contentStart, nextHeading ? nextHeading.headingStart : source.length)
      .trim()

    let testResults = null
    const resultMatch = questionCode.match(TEST_RESULTS_REGEX)
    if (resultMatch) {
      questionCode = resultMatch[1].trim()
      testResults = resultMatch[2].trim()
    }

    questions.push(enrichWithStructuredProblem({
      number: heading.number,
      problemNo: null,
      problemTitle: null,
      statementMd: null,
      code: questionCode,
      testResults,
      comment: '',
      saving: false
    }, structuredMap.get(heading.number)))
  })

  if (questions.length > 0) {
    return questions
  }

  if (hasStructured) {
    const structuredQuestions = Array.from(structuredMap.entries()).map(([number, problem]) =>
      buildStructuredQuestion(problem, number)
    )
    const hasPerQuestionCode = structuredQuestions.some(question => String(question.code || '').trim())
    if (structuredQuestions.length > 1 && hasPerQuestionCode) {
      return structuredQuestions
    }
  }

  if (source.trim()) {
    return [
      enrichWithStructuredProblem({
        number: 1,
        problemNo: null,
        problemTitle: null,
        statementMd: null,
        code: source,
        testResults: null,
        comment: '',
        saving: false
      }, structuredMap.get(1))
    ]
  }

  return []
}
