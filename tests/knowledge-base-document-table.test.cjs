const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const knowledgeBaseViewPath = path.join(
  __dirname,
  '..',
  'src',
  'views',
  'teacher',
  'KnowledgeBase.vue'
)

const source = fs.readFileSync(knowledgeBaseViewPath, 'utf8')

test('document table does not render a duplicate raw id column', () => {
  assert.ok(
    !source.includes('<ui-table-column prop="id"'),
    'document table should not render a duplicate raw id column'
  )
})

test('status badge keeps a single-line layout in the table cell', () => {
  assert.match(
    source,
    /whitespace-nowrap/,
    'status badge should prevent Chinese labels from wrapping vertically'
  )
})

test('created time uses a formatter instead of raw ISO text', () => {
  assert.match(
    source,
    /formatDocumentTimestamp\(row\.createdAt\)/,
    'document table should format createdAt for display'
  )
})
