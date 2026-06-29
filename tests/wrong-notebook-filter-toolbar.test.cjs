const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const wrongNotebookViewPath = path.join(
  __dirname,
  '..',
  'src',
  'views',
  'student',
  'WrongNotebook.vue'
)

const source = fs.readFileSync(wrongNotebookViewPath, 'utf8')

test('wrong notebook toolbar renders grouped filter sections and a reset action', () => {
  assert.match(source, /filter-toolbar/, 'toolbar wrapper should exist')
  assert.match(source, /基础筛选/, 'toolbar should label the base filter group')
  assert.match(source, /快速检索/, 'toolbar should label the quick search group')
  assert.match(source, /重置筛选/, 'toolbar should expose a reset action')
})

test('wrong notebook reset handler clears all non-tab filters and resets pagination', () => {
  assert.match(source, /function resetFilters\(\)/, 'reset handler should exist')
  assert.match(source, /filters\.sourceType = ''/, 'reset should clear source filter')
  assert.match(source, /filters\.errorCategory = ''/, 'reset should clear error category filter')
  assert.match(source, /filters\.difficulty = ''/, 'reset should clear difficulty filter')
  assert.match(source, /filters\.tag = ''/, 'reset should clear tag filter')
  assert.match(source, /filters\.q = ''/, 'reset should clear keyword filter')
  assert.match(source, /page\.current = 1/, 'reset should jump back to the first page')
  assert.match(source, /reloadList\(\)/, 'reset should reload the list')
})
