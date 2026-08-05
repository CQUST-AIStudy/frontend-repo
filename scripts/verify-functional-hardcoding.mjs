import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function readProjectFile(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8')
}

async function importProjectModule(path) {
  const source = await readProjectFile(path)
  const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  return import(url)
}

function createStorage(seed = {}) {
  const data = { ...seed }
  return {
    data,
    getItem(key) {
      return data[key] ?? null
    },
    setItem(key, value) {
      data[key] = String(value)
    },
    removeItem(key) {
      delete data[key]
    }
  }
}

const auth = await importProjectModule('src/constants/auth.js')
assert.equal(auth.getSessionState(createStorage({ token: 'legacy_session' })), 'cookie')
assert.equal(auth.getSessionState(createStorage({ auth_session_state: 'cookie' })), 'cookie')
assert.equal(auth.getSessionState(createStorage({ token: 'real-token' })), 'token')

const storage = createStorage({
  token: 'real-token',
  userInfo: '{}',
  student_ai_chat: 'student-secret',
  teacher_ai_chat: 'teacher-secret'
})
auth.clearAuthStorage(storage)
assert.deepEqual(storage.data, {})

const { filterCourseSpacesForClass } = await importProjectModule('src/utils/courseSpaceScope.js')
const spaces = [
  { id: 1, courseId: 10 },
  { id: 2, courseId: 20 },
  { id: 3, courseId: 10, boundClassIds: [8] },
  { id: 4, courseId: 20, boundClassIds: [7] }
]
assert.deepEqual(
  filterCourseSpacesForClass(spaces, { id: 7, courseId: 10 }).map(item => item.id),
  [1, 4]
)
assert.deepEqual(filterCourseSpacesForClass(spaces, null), [])

const apiSource = await readProjectFile('src/api/index.js')
const clawSource = await readProjectFile('src/api/leetcodeClaw.js')
const submissionSource = await readProjectFile('src/views/teacher/SubmissionDetail.vue')
const routerSource = await readProjectFile('src/router/index.js')

assert.doesNotMatch(apiSource, /username === ['"]admin['"]/)
assert.doesNotMatch(apiSource, /response\.token \|\| ['"]legacy_session['"]/)
assert.match(clawSource, /apiClient\.get\(['"]\/api\/leetcode\/problems\/search['"]/)
assert.match(submissionSource, /apiClient\.post\(['"]\/api\/convert-to-pdf['"]/)
assert.match(routerSource, /createWebHistory\(process\.env\.BASE_URL\)/)

console.log('Functional hardcoding audit checks passed.')
