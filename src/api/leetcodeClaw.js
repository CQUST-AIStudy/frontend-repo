import axios from 'axios'
import { apiClient } from './index'
import { createFriendlyError } from '../utils/errorMessage'

const leetCodeClawClient = axios.create({
  baseURL: '/leetcode-claw',
  timeout: 120000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

/** 搜索 LeetCode 题库（学生端，请求 Java 后端，不直连爬虫服务） */
export function searchLeetCodeProblems({ keyword = '', difficulty = '', limit = 20, offset = 0 } = {}) {
  return apiClient.get('/api/leetcode/problems/search', {
    params: { keyword, difficulty, limit, offset }
  })
}

export function getPersonalizedLeetCodeRecommendations({ limit = 20 } = {}) {
  return apiClient.get('/api/recommendations/leetcode/sync', {
    params: { limit }
  })
}

/** 将后端 LeetCodeProblem 实体映射为前端练习卡片格式 */
function createPracticeCard(fields = {}, overrides = {}) {
  const title = fields.title || '未命名题目'
  return {
    id: fields.id,
    problemId: fields.problemId ?? fields.id ?? null,
    slug: fields.slug || '',
    number: fields.number || '',
    title,
    name: fields.name || title,
    difficulty: normalizeLeetCodeDifficulty(fields.difficulty),
    estimatedMinutes: fields.estimatedMinutes || 30,
    matchRate: fields.matchRate ?? null,
    reason: fields.reason || '',
    source: fields.source || '',
    type: fields.type || '',
    sourceUrl: fields.sourceUrl || '',
    sourceLabel: fields.sourceLabel || 'LeetCode',
    persisted: !!fields.persisted,
    warnings: fields.warnings || [],
    errors: fields.errors || [],
    ...overrides
  }
}

function toMatchRatePercent(value) {
  if (value === null || value === undefined || value === '') return null
  const score = Number(value)
  if (!Number.isFinite(score)) return null
  return Math.round(Math.max(0, Math.min(1, score)) * 100)
}

export function mapProblemToPractice(problem = {}) {
  const slug = problem.sourceKey ? problem.sourceKey.replace(/^slug:/, '') : ''
  return createPracticeCard({
    id: problem.id,
    problemId: problem.id,
    slug,
    number: problem.numericId || problem.problemCode || '',
    title: problem.titleMain || problem.titleAlt || '未命名题目',
    difficulty: problem.difficulty,
    estimatedMinutes: problem.estimatedMinutes || 30,
    reason: '来自 LeetCode 题库',
    source: 'leetcode_bank',
    type: 'leetcode_bank_problem',
    sourceUrl: problem.sourceUrl || (slug ? `https://leetcode.cn/problems/${slug}/` : ''),
    persisted: true
  })
}

export function mapRecommendationItemToPractice(item = {}) {
  const problem = item.problem || {}
  const mapped = mapProblemToPractice(problem)
  const tags = Array.isArray(problem.tags || item.tags)
    ? (problem.tags || item.tags).map(t => typeof t === 'string' ? t : t.tagName || t.name || '')
    : []
  return {
    ...mapped,
    id: problem.id || item.problemId || mapped.id,
    problemId: problem.id || item.problemId || mapped.problemId,
    matchRate: toMatchRatePercent(item.scoreNeedMatch),
    reason: item.reasonText || '来自个性化推荐',
    source: 'leetcode_recommendation',
    type: 'leetcode_problem',
    requestId: item.requestId || null,
    rankNo: item.rankNo || null,
    tags,
    forgettingScore: item.forgettingScore ?? problem.forgettingScore ?? null,
    lastPracticeAt: item.lastPracticeAt ?? problem.lastPracticeAt ?? null
  }
}

leetCodeClawClient.interceptors.response.use(
  response => response.data,
  error => Promise.reject(createFriendlyError(error, 'LeetCode 题库服务请求失败，请检查服务是否已启动'))
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
  const difficulty = normalizeLeetCodeDifficulty(problem.difficulty)
  const sourceUrl = slug ? `https://leetcode.cn/problems/${slug}/` : ''
  return createPracticeCard({
    id: problemId || slug,
    problemId,
    slug,
    number: problem.questionFrontendId || problem.questionId || slug,
    title: getProblemTitle(problem),
    difficulty,
    estimatedMinutes: difficulty === 'hard' ? 50 : difficulty === 'easy' ? 20 : 35,
    matchRate: toMatchRatePercent(item.score),
    reason: item.reason || '来自 LeetCodeClaw 关键词推荐',
    source: 'leetcode_claw',
    type: 'leetcode_claw_problem',
    sourceUrl,
    sourceLabel: 'LeetCode',
    persisted: !!item.persisted,
    warnings: item.warnings || [],
    errors: item.errors || []
  })
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

/** 全量抓取 LeetCode CN 公开题库（异步任务） */
export function crawlAllLeetCodeProblems({ persist = true, forceRefresh = false } = {}) {
  return leetCodeClawClient.post('/api/leetcode/crawl/all', {
    persist,
    forceRefresh
  })
}

/** 查询全量抓取任务进度 */
export function getCrawlJobStatus(jobId) {
  return leetCodeClawClient.get(`/api/leetcode/crawl/jobs/${encodeURIComponent(jobId)}`)
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
