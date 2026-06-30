const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const parserModuleUrl = new URL(
  path.join('..', 'src', 'utils', 'submissionQuestionParser.mjs'),
  `file://${__filename.replace(/\\/g, '/')}`
)

test('submission question parser deduplicates repeated question sections', async () => {
  const { parseSubmissionQuestions } = await import(parserModuleUrl.href)

  const code = [
    '第1题：',
    'int solve1() { return 1; }',
    '',
    '第2题：',
    'int solve2() { return 2; }',
    '',
    '第1题：',
    'int solve1_repeat() { return 10; }'
  ].join('\n')

  const questions = parseSubmissionQuestions({
    code,
    problems: [
      { number: 1, problemNo: 'DS01', problemTitle: '顺序表' },
      { number: 2, problemNo: 'DS02', problemTitle: '链表' }
    ]
  })

  assert.equal(questions.length, 2)
  assert.deepEqual(
    questions.map(question => question.number),
    [1, 2]
  )
  assert.match(questions[0].code, /solve1\(\)/)
  assert.doesNotMatch(questions[0].code, /solve1_repeat/)
  assert.equal(questions[0].problemNo, 'DS01')
  assert.equal(questions[1].problemTitle, '链表')
})
