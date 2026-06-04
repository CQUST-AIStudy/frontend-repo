import axios from 'axios'
import { createFriendlyError } from '../utils/errorMessage'

const leetCodeClawClient = axios.create({
  baseURL: '/leetcode-claw',
  timeout: 120000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

leetCodeClawClient.interceptors.response.use(
  response => response.data,
  error => Promise.reject(createFriendlyError(error, 'LeetCodeClaw 服务请求失败，请检查服务是否已启动'))
)

export function normalizeLeetCodeDifficulty(difficulty) {
  const value = String(difficulty || '').trim().toLowerCase()
  if (value === 'easy') return 'easy'
  if (value === 'hard') return 'hard'
  return 'medium'
}

export function getDifficultyText(difficulty) {
  return {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }[normalizeLeetCodeDifficulty(difficulty)]
}

export function getDifficultyType(difficulty) {
  return {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }[normalizeLeetCodeDifficulty(difficulty)]
}

export function getProblemSlug(problem = {}) {
  return problem.titleSlug || problem.sourceSlug || ''
}

export function getProblemTitle(problem = {}) {
  return problem.translatedTitle || problem.title || getProblemSlug(problem) || '未命名题目'
}

export function getPersistedProblemId(item = {}) {
  const value = item.persist?.problemId || item.problemId || item.problem?.id
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function mapClawItemToPractice(item = {}) {
  const problem = item.problem || {}
  const slug = getProblemSlug(problem)
  const problemId = getPersistedProblemId(item)
  return {
    id: problemId || slug,
    problemId,
    slug,
    number: problem.questionFrontendId || problem.questionId || slug,
    title: getProblemTitle(problem),
    name: getProblemTitle(problem),
    difficulty: normalizeLeetCodeDifficulty(problem.difficulty),
    estimatedMinutes: problem.difficulty === 'Hard' ? 50 : problem.difficulty === 'Easy' ? 20 : 35,
    matchRate: item.score ? Math.round(Number(item.score) * 100) : null,
    reason: item.reason || '来自 LeetCodeClaw 关键词推荐',
    source: 'leetcode_claw',
    type: 'leetcode_claw_problem',
    persisted: !!item.persisted,
    warnings: item.warnings || [],
    errors: item.errors || []
  }
}

export function getLeetCodeClawHealth() {
  return leetCodeClawClient.get('/health')
}

export function crawlLeetCodeProblems({ slugs, persist = true }) {
  return leetCodeClawClient.post('/api/leetcode/crawl', {
    slugs: Array.isArray(slugs) ? slugs : [slugs],
    persist
  })
}

export function recommendLeetCodeByKeyword({ keyword, limit = 10, difficulty = '', persist = false }) {
  return leetCodeClawClient.post('/api/leetcode/recommend/keyword', {
    keyword,
    limit,
    difficulty,
    persist
  })
}

export function getLeetCodeProblemBySlug(slug, { crawl = false } = {}) {
  return leetCodeClawClient.get(`/api/leetcode/problem/${encodeURIComponent(slug)}`, {
    params: { crawl }
  })
}

export async function persistClawProblemBySlug(slug) {
  const response = await crawlLeetCodeProblems({ slugs: [slug], persist: true })
  const item = Array.isArray(response?.items) ? response.items[0] : null
  const problemId = getPersistedProblemId(item)
  if (!problemId) {
    const message = item?.errors?.join('；') || response?.failed?.[0]?.error || '题目已抓取，但未返回本地题库 ID'
    throw new Error(message)
  }
  return { response, item, problemId }
}
