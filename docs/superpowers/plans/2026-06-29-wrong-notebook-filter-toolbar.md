# Wrong Notebook Filter Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the wrong notebook page filter area into a grouped toolbar that clearly separates status tabs, base filters, quick search, and reset behavior.

**Architecture:** Keep the change isolated to the existing wrong notebook page. Add one lightweight source-level regression test using Node's built-in test runner, then update the page header template, add a reset handler, and add scoped styles for the new grouped toolbar without changing list fetching APIs.

**Tech Stack:** Vue 3 SFC, existing `ui-*` components, Node `node:test`, npm build verification

---

### Task 1: Add regression coverage for grouped toolbar behavior and implement the UI

**Files:**
- Modify: `D:\AI-study\frontend-repo\AI_Ds-vue\src\views\student\WrongNotebook.vue`
- Create: `D:\AI-study\frontend-repo\AI_Ds-vue\tests\wrong-notebook-filter-toolbar.test.cjs`

- [ ] **Step 1: Write the failing regression test**

```js
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const viewPath = path.join(__dirname, '..', 'src', 'views', 'student', 'WrongNotebook.vue')
const source = fs.readFileSync(viewPath, 'utf8')

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
```

- [ ] **Step 2: Run the regression test to verify it fails**

Run: `node --test tests/wrong-notebook-filter-toolbar.test.cjs`
Expected: FAIL because the current page does not yet contain the grouped toolbar structure or `resetFilters()`.

- [ ] **Step 3: Implement the grouped toolbar layout and reset handler**

```vue
<div class="filter-toolbar">
  <div class="filter-toolbar-left">
    <ui-radio-group v-model="activeTab" @change="onTabChange">
      ...
    </ui-radio-group>
  </div>

  <div class="filter-toolbar-panel">
    <div class="filter-group">
      <div class="filter-group-label">基础筛选</div>
      ...
    </div>
    <div class="filter-group">
      <div class="filter-group-label">快速检索</div>
      ...
      <ui-button text @click="resetFilters">重置筛选</ui-button>
    </div>
  </div>
</div>

function resetFilters() {
  filters.sourceType = ''
  filters.errorCategory = ''
  filters.difficulty = ''
  filters.tag = ''
  filters.q = ''
  page.current = 1
  reloadList()
}
```

- [ ] **Step 4: Re-run the regression test to verify it passes**

Run: `node --test tests/wrong-notebook-filter-toolbar.test.cjs`
Expected: PASS with both toolbar assertions green.

- [ ] **Step 5: Run the build to verify the SFC still compiles**

Run: `npm run build`
Expected: production build completes successfully without Vue template, script, or scoped-style errors.
