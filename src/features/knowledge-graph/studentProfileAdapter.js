/**
 * 学生画像 ↔ 知识图谱节点 映射适配层
 *
 * 作用：把后端 /api/profile/me 返回的 skillTree（能力维度→实验）与 weaknesses（薄弱点），
 * 以及 /api/submissions 返回的提交记录，映射到知识图谱节点上，供 3D 画布做掌握度浮空
 * 着色与代码追溯使用。
 *
 * 映射策略（起步采用前端关键字映射，无需后端改动）：
 * 1. 维度级：节点 label/keywords/summary 命中能力维度关键字 → 取该维度 avgMastery/level
 * 2. 实验级：exercise/structure 节点进一步命中 skillTree.children[].name（实验名）→ 取实验级 mastery（粒度更细）
 * 3. 薄弱点：命中 profile.weaknesses（按 experimentName/dimension 关键字）→ 标记 isWeak 并携带 evidence
 * 4. 后端题目完成进度：节点带 progressPercent / learningStatus 时优先使用
 * 5. 优先级：后端进度 > 技能点级 > 实验级 > 维度级 > 手动标记
 *
 * 预留：若后端在节点 properties 增加 knowledgePointId / dimensionTag 字段，优先用 ID 直匹配，关键字映射降级为兜底。
 */

// 能力维度 → 关键字表（与 MyTeachingAnalysis.vue / AbilityProfile.vue 口径一致）
const DIMENSION_KEYWORDS = {
  线性表: ['线性', '顺序', '链表', '线性表', '顺序表', '单链表', '循环链表'],
  '栈与队列': ['栈', '队列', '串', 'stack', 'queue'],
  树: ['树', 'bst', 'huffman', '二叉', '哈夫曼', 'avl', '平衡树', '堆'],
  图: ['图', 'dfs', 'bfs', 'dijkstra', '最短路径', '最小生成树', '拓扑', '邻接'],
  哈希: ['哈希', 'hash', '散列'],
  综合: []
}

// level → 默认分数（profile 未给具体 mastery 时兜底）
const LEVEL_SCORE = { good: 82, medium: 52, weak: 24, unstarted: 0, learning: 50, mastered: 88 }

/**
 * 把 level 归一化到统一枚举：good / medium / weak / unstarted
 */
function normalizeLevel(level) {
  if (level === 'good' || level === 'mastered') return 'good'
  if (level === 'medium' || level === 'learning') return 'medium'
  if (level === 'weak') return 'weak'
  return 'unstarted'
}

function scoreToLevel(score) {
  if (score == null) return 'unstarted'
  if (score >= 70) return 'good'
  if (score >= 40) return 'medium'
  return 'weak'
}

function toScore(value, level) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  return LEVEL_SCORE[level] ?? 0
}

function clampPercent(value) {
  const percent = Number(value)
  if (!Number.isFinite(percent)) return 0
  return Math.max(0, Math.min(100, Math.round(percent)))
}

function hasBackendProgress(node) {
  return Number.isFinite(Number(node?.progressPercent)) || Boolean(node?.learningStatus)
}

function progressToLevel(node) {
  const status = lower(node?.learningStatus)
  const percent = clampPercent(node?.progressPercent)
  if (['mastered', 'learned', 'completed', 'done', 'finished', '已学习'].includes(status) || percent >= 100) {
    return 'good'
  }
  if (['learning', 'in_progress', 'studying', '学习中'].includes(status) || percent > 0) {
    return 'medium'
  }
  return 'unstarted'
}

function buildProgressEntry(node, dimension) {
  const percent = clampPercent(node?.progressPercent)
  const completed = Number(node?.completedExerciseCount)
  const total = Number(node?.totalExerciseCount)
  const completedExerciseCount = Number.isFinite(completed) ? completed : 0
  const totalExerciseCount = Number.isFinite(total) ? total : 0
  const evidence = totalExerciseCount > 0
    ? {
        completedExerciseCount,
        totalExerciseCount,
        detail: `已完成 ${completedExerciseCount}/${totalExerciseCount} 个关联练习`
      }
    : null

  return {
    level: progressToLevel(node),
    score: percent,
    source: 'progress',
    dimension,
    experimentId: node?.properties?.experimentId || null,
    experimentName: node?.type === 'exercise' ? node.label : null,
    isWeak: false,
    evidence,
    learningStatus: node?.learningStatus || '',
    learningStatusLabel: node?.learningStatusLabel || ''
  }
}

function lower(s) {
  return String(s || '').toLowerCase()
}

/**
 * 收集节点用于匹配的文本：label + keywords + summary + tags
 */
function nodeMatchText(node) {
  const p = node.properties || {}
  return [
    node.label,
    node.summary,
    ...(p.keywords || []),
    ...(p.tags || []),
    p.problem
  ].filter(Boolean).join(' ')
}

function matchDimension(text) {
  const t = lower(text)
  // 按"具体→宽泛"顺序匹配，先命中具体维度（综合兜底，跳过）
  for (const [dim, keywords] of Object.entries(DIMENSION_KEYWORDS)) {
    if (dim === '综合') continue
    if (keywords.some(kw => t.includes(lower(kw)))) return dim
  }
  return null
}

/**
 * 构建 nodeId → 掌握度信息 的映射
 * @param {object} profile /api/profile/me 返回体（可附带 skillStates: skills[] 来自 /api/profile/skill-states）
 * @param {object} graph loadKnowledgeGraph 返回的图谱 { course, nodes }
 * @param {object} manualState 可选，localStorage 手动标记 { [nodeId]: { mastery } } 作为兜底叠加
 * @returns {object} { masteryMap, dimensionMap, summary }
 */
export function buildMasteryMap(profile, graph, manualState = {}) {
  const masteryMap = {}
  const dimensionMap = {} // nodeId → 维度名

  if (!graph) return { masteryMap, dimensionMap, summary: buildSummary(profile, masteryMap) }

  const skillTree = Array.isArray(profile?.skillTree) ? profile.skillTree : []
  const weaknesses = Array.isArray(profile?.weaknesses) ? profile.weaknesses : []
  const skillStates = Array.isArray(profile?.skillStates) ? profile.skillStates : []

  // 维度 → { avgMastery, level, children }
  const dimIndex = new Map()
  for (const dim of skillTree) {
    if (!dim?.dimension) continue
    dimIndex.set(dim.dimension, dim)
  }

  // 实验名 → { mastery, level, dimension, experimentId }（实验级粒度）
  const expIndex = new Map()
  const expNameNormIndex = new Map() // 归一化名 → 实验
  for (const dim of skillTree) {
    const children = Array.isArray(dim.children) ? dim.children : []
    for (const child of children) {
      if (!child?.name) continue
      expIndex.set(lower(child.name), { ...child, dimension: dim.dimension })
      expNameNormIndex.set(normalizeName(child.name), { ...child, dimension: dim.dimension })
    }
  }

  // 技能点（skill-states）索引：归一化名 → { mastery, level, rawName }
  // skill-states 是更细粒度的知识点掌握度，优先级最高。
  // 兼容字段：name / skillName / knowledgePoint / point；mastery / score / value；level / status
  const skillByName = new Map()
  const skillByNorm = new Map()
  for (const skill of skillStates) {
    if (!skill || typeof skill !== 'object') continue
    const name = skill.name || skill.skillName || skill.knowledgePoint || skill.point || skill.label
    if (!name) continue
    const entry = {
      mastery: skill.mastery ?? skill.score ?? skill.value,
      level: skill.level || skill.status,
      dimension: skill.dimension || skill.dimensionName || null,
      rawName: String(name)
    }
    skillByName.set(lower(name), entry)
    skillByNorm.set(normalizeName(name), entry)
  }

  // 薄弱点索引：按 experimentName 与 dimension 建立命中
  const weaknessByExp = new Map()
  const weaknessByDim = new Map()
  for (const w of weaknesses) {
    const expName = w.experimentName || w.experiment
    if (expName) weaknessByExp.set(lower(expName), w)
    if (w.dimension) weaknessByDim.set(w.dimension, w)
  }

  const nodes = Array.isArray(graph.nodes) ? graph.nodes : []
  for (const node of nodes) {
    if (node.type === 'course') continue

    const text = nodeMatchText(node)
    const dim = matchDimension(text)
    if (dim) dimensionMap[node.id] = dim

    let result = null

    // ① 后端自动进度：由题目完成记录计算，优先级最高
    if (hasBackendProgress(node)) {
      result = buildProgressEntry(node, dim)
    }

    // ② 知识点级匹配（skill-states）：后端进度缺失时使用
    // 先用节点 label 精确匹配，再用 keywords 逐个尝试
    const tryMatchSkill = (raw) => {
      if (!raw) return null
      return skillByName.get(lower(raw)) || skillByNorm.get(normalizeName(raw)) || null
    }
    const labelSkill = tryMatchSkill(node.label)
    const keywordSkill = !labelSkill
      ? (node.properties?.keywords || []).map(tryMatchSkill).find(Boolean)
      : null
    const matchedSkill = labelSkill || keywordSkill
    if (!result && matchedSkill) {
      const rawLevel = matchedSkill.level || scoreToLevel(matchedSkill.mastery)
      const level = normalizeLevel(rawLevel)
      result = {
        level,
        score: toScore(matchedSkill.mastery, level),
        source: 'skill',
        dimension: matchedSkill.dimension || dim,
        experimentId: null,
        experimentName: matchedSkill.rawName,
        isWeak: false,
        evidence: null
      }
    }

    // ③ 实验级匹配（仅 exercise/structure/operation/algorithm 优先尝试实验名命中）
    const structuralTypes = ['exercise', 'structure', 'operation', 'algorithm']
    if (!result && structuralTypes.includes(node.type)) {
      const byExact = expIndex.get(lower(node.label))
      const byNorm = !byExact ? expNameNormIndex.get(normalizeName(node.label)) : null
      const matched = byExact || byNorm
      if (matched) {
        const level = normalizeLevel(matched.level || scoreToLevel(matched.mastery))
        result = {
          level,
          score: toScore(matched.mastery, level),
          source: 'experiment',
          dimension: matched.dimension || dim,
          experimentId: matched.experimentId || null,
          experimentName: matched.name || node.label,
          isWeak: false,
          evidence: null
        }
      }
    }

    // ④ 维度级匹配
    if (!result && dim && dimIndex.has(dim)) {
      const d = dimIndex.get(dim)
      const level = normalizeLevel(d.level || scoreToLevel(d.avgMastery))
      result = {
        level,
        score: toScore(d.avgMastery, level),
        source: 'dimension',
        dimension: dim,
        experimentId: null,
        experimentName: null,
        isWeak: false,
        evidence: null
      }
    }

    // ⑤ 薄弱点叠加：画像来源可降级为 weak；后端进度不覆盖自动状态
    if (result) {
      const wExp = result.experimentName ? weaknessByExp.get(lower(result.experimentName)) : null
      const wDim = result.dimension ? weaknessByDim.get(result.dimension) : null
      const w = wExp || wDim
      if (w && result.source === 'progress') {
        result.isWeak = true
        if (!result.evidence) result.evidence = w.evidence || null
      } else if (w) {
        result.isWeak = true
        result.level = 'weak'
        result.score = Math.min(result.score, toScore(null, 'weak'))
        result.evidence = w.evidence || null
      }
    }

    // ⑥ 手动标记兜底（profile 未命中但 localStorage 有标记）
    if (!result) {
      const manual = manualState?.[node.id]
      if (manual?.mastery && manual.mastery !== 'unstarted') {
        const level = normalizeLevel(manual.mastery)
        result = {
          level,
          score: toScore(null, level),
          source: 'manual',
          dimension: dim,
          experimentId: null,
          experimentName: null,
          isWeak: level === 'weak',
          evidence: null
        }
      }
    }

    if (result) masteryMap[node.id] = result
  }

  return { masteryMap, dimensionMap, summary: buildSummary(profile, masteryMap) }
}

/**
 * 归一化实验名用于模糊匹配：去除"实验X："等前缀、空格、标点
 */
function normalizeName(name) {
  return lower(name)
    .replace(/实验[一二三四五六七八九十0-9]*[：:、-]*/g, '')
    .replace(/[\s\-_：:、.,，。()（）]/g, '')
    .trim()
}

/**
 * 构建 nodeId → experimentId 映射，用于点击节点拉取提交记录
 */
export function buildSubmissionMap(profile, graph) {
  const map = {}
  if (!graph) return map
  const skillTree = Array.isArray(profile?.skillTree) ? profile.skillTree : []
  const expByName = new Map()
  const expByNorm = new Map()
  for (const dim of skillTree) {
    for (const child of (dim.children || [])) {
      if (!child?.name) continue
      expByName.set(lower(child.name), child)
      expByNorm.set(normalizeName(child.name), child)
    }
  }
  for (const node of (graph.nodes || [])) {
    const directExperimentId = node.properties?.experimentId
    if (directExperimentId != null && directExperimentId !== '') {
      map[node.id] = directExperimentId
      continue
    }
    if (!['exercise', 'structure', 'operation', 'algorithm'].includes(node.type)) continue
    const matched = expByName.get(lower(node.label)) || expByNorm.get(normalizeName(node.label))
    if (matched?.experimentId) map[node.id] = matched.experimentId
  }
  return map
}

/**
 * 汇总学习概况：掌握度分布、Top 优缺点维度、提交统计
 */
function buildSummary(profile, masteryMap) {
  const distribution = { good: 0, medium: 0, weak: 0, unstarted: 0 }
  for (const id of Object.keys(masteryMap)) {
    const lv = masteryMap[id].level
    distribution[lv] = (distribution[lv] || 0) + 1
  }
  // 未命中的节点数（总数 - 已映射）
  const overview = profile?.overview || {}

  // 维度级优缺点（来自 skillTree 的 level）
  const skillTree = Array.isArray(profile.skillTree) ? profile.skillTree : []
  const weakDims = skillTree
    .filter(d => normalizeLevel(d.level) === 'weak')
    .map(d => ({ dimension: d.dimension, score: toScore(d.avgMastery, d.level) }))
    .sort((a, b) => a.score - b.score)
  const goodDims = skillTree
    .filter(d => normalizeLevel(d.level) === 'good')
    .map(d => ({ dimension: d.dimension, score: toScore(d.avgMastery, d.level) }))
    .sort((a, b) => b.score - a.score)

  return {
    distribution,
    totalSubmissions: overview.totalSubmissions || 0,
    totalAc: overview.totalAc || 0,
    overallAcRate: overview.overallAcRate || 0,
    experimentsCovered: overview.experimentsCovered || 0,
    totalExperiments: overview.totalExperiments || 0,
    weakDims: weakDims.slice(0, 3),
    goodDims: goodDims.slice(0, 3),
    trendDirection: profile?.trend?.direction || 'flat'
  }
}

export { normalizeLevel, scoreToLevel, DIMENSION_KEYWORDS }
