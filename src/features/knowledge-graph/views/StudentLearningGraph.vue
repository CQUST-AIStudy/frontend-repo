<script setup>
import { computed, onMounted, shallowRef } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import DataStructureGraphCanvas from '@/features/knowledge-graph/components/DataStructureGraphCanvas.vue'
import KnowledgeGraphDetailPanel from '@/features/knowledge-graph/components/KnowledgeGraphDetailPanel.vue'
import LearningOverviewBar from '@/features/knowledge-graph/components/LearningOverviewBar.vue'
import LearningPathPanel from '@/features/knowledge-graph/components/LearningPathPanel.vue'
import PracticeRecommendPanel from '@/features/knowledge-graph/components/PracticeRecommendPanel.vue'
import { GRAPH_CODE, rawGraph } from '@/features/knowledge-graph/dataStructureGraph'
import {
  getAncestorChain,
  getNodeContext,
  normalizeGraph
} from '@/features/knowledge-graph/graphDatabaseAdapter'
import { loadKnowledgeGraph } from '@/features/knowledge-graph/knowledgeGraphDataSource'
import { useStateForGraph } from '@/features/knowledge-graph/learningState'
import {
  buildMasteryMap,
  buildSubmissionMap
} from '@/features/knowledge-graph/studentProfileAdapter'
import { API_BASE_URL } from '@/config/runtime'
import { getTapToken } from '@/constants/auth'
import api from '@/api'
import logger from '@/utils/logger'

const router = useRouter()

const loading = shallowRef(false)
const errorMsg = shallowRef('')
const profileLoading = shallowRef(true)
const profileError = shallowRef('')
const graphData = shallowRef(rawGraph)
const dataSource = shallowRef('static')
const fallbackNotice = shallowRef('')
const profile = shallowRef({})
const selectedNodeId = shallowRef(rawGraph.course.id)
const selectedSubmissions = shallowRef([])
const submissionsLoading = shallowRef(false)
const submissionsError = shallowRef('')
const selectedSubmission = shallowRef(null)

const { state: learningState, update: updateLearningState } = useStateForGraph(GRAPH_CODE)

function profileRequestConfig() {
  const tapToken = getTapToken()
  return {
    withCredentials: true,
    headers: tapToken ? { Authorization: `Bearer ${tapToken}` } : undefined
  }
}

const normalizedGraph = computed(() => normalizeGraph(graphData.value))

const chapterChildCounts = computed(() => {
  const counts = {}
  for (const node of normalizedGraph.value.nodes) {
    if (node.chapterId) counts[node.chapterId] = (counts[node.chapterId] || 0) + 1
  }
  return counts
})

// 掌握度映射 + 学习概况
const masteryResult = computed(() => buildMasteryMap(profile.value, graphData.value, learningState.value))
const masteryMap = computed(() => masteryResult.value.masteryMap)
const overviewSummary = computed(() => masteryResult.value.summary)

// 节点 → experimentId 映射
const submissionMap = computed(() => buildSubmissionMap(profile.value, graphData.value))

const visibleNodes = computed(() => normalizedGraph.value.nodes)
const visibleRelations = computed(() => normalizedGraph.value.relations)

const selectedContext = computed(() => getNodeContext(graphData.value, selectedNodeId.value))

const selectedMasteryInfo = computed(() => masteryMap.value[selectedNodeId.value] || null)

// 提交版本链数据（传给 3D 画布渲染卫星）
const submissionTrace = computed(() => {
  if (!selectedNodeId.value || selectedSubmissions.value.length === 0) return null
  return { nodeId: selectedNodeId.value, submissions: selectedSubmissions.value }
})

const highlightPaths = computed(() => {
  const ng = normalizedGraph.value
  const node = ng.nodeMap.get(selectedNodeId.value)
  if (!node || node.type === 'course' || node.type === 'chapter') return null

  const nodeIds = new Set()
  const relationKeys = new Set()
  nodeIds.add(node.id)

  for (const ancestor of getAncestorChain(graphData.value, node.id)) {
    nodeIds.add(ancestor.id)
  }

  const collectPrereq = (id, visited) => {
    const incoming = ng.incomingByNodeId.get(id) || []
    for (const relation of incoming) {
      if (relation.type !== 'PREREQUISITE') continue
      relationKeys.add(relation.id)
      nodeIds.add(relation.source)
      if (!visited.has(relation.source)) {
        visited.add(relation.source)
        collectPrereq(relation.source, visited)
      }
    }
  }
  collectPrereq(node.id, new Set([node.id]))

  const collectNext = (id, visited) => {
    const outgoing = ng.outgoingByNodeId.get(id) || []
    for (const relation of outgoing) {
      if (relation.type !== 'PREREQUISITE') continue
      relationKeys.add(relation.id)
      nodeIds.add(relation.target)
      if (!visited.has(relation.target)) {
        visited.add(relation.target)
        collectNext(relation.target, visited)
      }
    }
  }
  collectNext(node.id, new Set([node.id]))

  for (const relation of [...(ng.incomingByNodeId.get(node.id) || []), ...(ng.outgoingByNodeId.get(node.id) || [])]) {
    if (relation.type === 'RELATED_TO' || relation.type === 'APPLIES_TO') {
      relationKeys.add(relation.id)
      nodeIds.add(relation.source)
      nodeIds.add(relation.target)
    }
  }

  return { nodeIds, relationKeys }
})

// 节点提交统计缓存：nodeId → { totalSubmissions, acCount }
const nodeSubmissionStats = shallowRef({})

// 个性化学习路径：薄弱/中等节点按 score 升序，组装"前置→当前→后续"链
const learningPaths = computed(() => {
  if (profileLoading.value) return []
  const ng = normalizedGraph.value
  const map = masteryMap.value
  const weaknesses = Array.isArray(profile.value.weaknesses) ? profile.value.weaknesses : []

  // 薄弱点证据查找：优先 experimentName，其次 dimension
  const weaknessByExp = new Map()
  const weaknessByDim = new Map()
  for (const w of weaknesses) {
    const expName = w.experimentName || w.experiment
    if (expName) weaknessByExp.set(String(expName).toLowerCase(), w)
    if (w.dimension) weaknessByDim.set(w.dimension, w)
  }

  const candidates = []
  for (const [nodeId, info] of Object.entries(map)) {
    if (info.level !== 'weak' && info.level !== 'medium') continue
    const node = ng.nodeMap.get(nodeId)
    if (!node || node.type === 'course' || node.type === 'chapter') continue
    candidates.push({ node, info })
  }

  // 按 score 升序，薄弱优先，取 Top 8
  candidates.sort((a, b) => (a.info.score ?? 0) - (b.info.score ?? 0))
  const top = candidates.slice(0, 8)

  return top.map(({ node, info }) => {
    const ctx = getNodeContext(graphData.value, node.id) || {}
    const wExp = info.experimentName ? weaknessByExp.get(String(info.experimentName).toLowerCase()) : null
    const wDim = info.dimension ? weaknessByDim.get(info.dimension) : null
    const w = wExp || wDim
    const studyTip = node.properties?.studyTip || ''
    const evidenceDetail = w?.evidence?.detail || ''
    const recommendation = evidenceDetail || studyTip || `建议优先复习「${node.label}」及其前置知识。`
    return {
      node,
      level: info.level,
      score: info.score,
      dimension: info.dimension,
      prerequisites: ctx.prerequisites || [],
      nextNodes: ctx.nextNodes || [],
      recommendation
    }
  })
})

// 推荐练习：从薄弱/中等节点的 TESTED_BY 关系找 exercise 节点，附加真实提交统计
const practiceRecommendations = computed(() => {
  if (profileLoading.value) return []
  const ng = normalizedGraph.value
  const map = masteryMap.value
  const subMap = submissionMap.value
  const stats = nodeSubmissionStats.value
  const seen = new Set()
  const result = []

  // 按 masteryMap 薄弱优先遍历，收集其关联的 exercise
  const orderedNodes = Object.entries(map)
    .filter(([, info]) => info.level === 'weak' || info.level === 'medium')
    .sort((a, b) => (a[1].score ?? 0) - (b[1].score ?? 0))

  for (const [nodeId] of orderedNodes) {
    const ctx = getNodeContext(graphData.value, nodeId)
    if (!ctx) continue
    for (const ex of (ctx.exercises || [])) {
      if (seen.has(ex.id)) continue
      seen.add(ex.id)
      const props = ex.properties || {}
      const experimentId = subMap[nodeId] || null
      const stat = experimentId ? stats[nodeId] : null
      const hasSubmission = experimentId != null
      result.push({
        id: ex.id,
        exerciseNode: ex,
        title: props.title || ex.label,
        difficulty: props.difficulty || null,
        estimatedMinutes: props.estimatedMinutes || null,
        knowledgeLabel: ng.nodeMap.get(nodeId)?.label || '',
        reason: props.studyTip || props.definition || `针对「${ng.nodeMap.get(nodeId)?.label}」巩固训练。`,
        experimentId,
        hasSubmission,
        totalSubmissions: stat?.totalSubmissions ?? 0,
        acCount: stat?.acCount ?? 0
      })
    }
    if (result.length >= 8) break
  }
  return result
})

// 数据来源文案
const dataSourceText = computed(() => dataSource.value === 'backend' ? '后端 MySQL 图谱' : '内置静态图谱')

function selectNode(node) {
  if (!node?.id) return
  selectedNodeId.value = node.id
  loadSubmissionsForNode(node.id)
}

function handleTraceNode(node) {
  if (!node?.id) return
  selectedNodeId.value = node.id
  loadSubmissionsForNode(node.id)
}

function handleSelectSubmission(sub) {
  selectedSubmission.value = sub
}

async function loadSubmissionsForNode(nodeId) {
  selectedSubmission.value = null
  selectedSubmissions.value = []
  const experimentId = submissionMap.value[nodeId]
  if (!experimentId) {
    submissionsError.value = ''
    return
  }
  submissionsLoading.value = true
  submissionsError.value = ''
  try {
    const res = await api.getStudentSubmissions(experimentId)
    const list = Array.isArray(res?.data?.data) ? res.data.data
      : Array.isArray(res?.data) ? res.data
      : Array.isArray(res) ? res : []
    selectedSubmissions.value = list
    // 统计该节点提交情况，供练习推荐面板展示真实 AC
    updateNodeSubmissionStats(nodeId, list)
  } catch (error) {
    logger.warn('[student-graph] 加载提交记录失败', error)
    submissionsError.value = '加载提交记录失败，请稍后重试'
  } finally {
    submissionsLoading.value = false
  }
}

// 统计某节点的提交总数与 AC 数，写入缓存（供练习推荐面板展示真实通过情况）
function updateNodeSubmissionStats(nodeId, submissions) {
  if (!nodeId || !Array.isArray(submissions)) return
  let acCount = 0
  for (const sub of submissions) {
    const status = sub?.status || sub?.result || sub?.verdict || ''
    const score = sub?.score
    if (status === 'AC' || status === 'Accepted' || status === 'accepted' || Number(score) >= 100) {
      acCount += 1
    }
  }
  const next = { ...nodeSubmissionStats.value }
  next[nodeId] = { totalSubmissions: submissions.length, acCount }
  nodeSubmissionStats.value = next
}

// 跳转到练习页（复用现有 practice 路由，与 C 语言页 openPractice 一致）
function openPractice(item) {
  const knowledge = item?.knowledgeLabel || item?.exerciseNode?.label || ''
  router.push({
    path: '/student/practice',
    query: knowledge ? { knowledge } : {}
  })
}

async function fetchProfile() {
  profileLoading.value = true
  profileError.value = ''
  try {
    // 画像主接口（含 skillTree / weaknesses / overview）
    let res
    try {
      res = await axios.get(`${API_BASE_URL}/api/profile/me`, profileRequestConfig())
    } catch {
      // 降级：用学号请求
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const usernum = userInfo.usernum || userInfo.studentId
      if (usernum) {
        res = await axios.get(`${API_BASE_URL}/api/profile/student/${usernum}`, profileRequestConfig())
      } else {
        throw new Error('no student id')
      }
    }
    const profileData = res.data?.data || res.data || {}

    // 并行拉取更细粒度的技能点掌握度（/api/profile/skill-states），失败不阻塞
    try {
      const skillRes = await axios.get(`${API_BASE_URL}/api/profile/skill-states`, profileRequestConfig())
      const skillBody = skillRes.data?.data ?? skillRes.data
      const skills = Array.isArray(skillBody?.skills) ? skillBody.skills
        : Array.isArray(skillBody) ? skillBody : []
      if (skills.length) profileData.skillStates = skills
    } catch (skillErr) {
      logger.warn('[student-graph] 加载技能点掌握度失败（降级到维度/实验级映射）', skillErr)
    }

    profile.value = profileData
  } catch (error) {
    logger.warn('[student-graph] 加载学生画像失败', error)
    // 画像失败时降级为 localStorage 手动掌握度（masteryMap 为空，画布走兜底）
    profile.value = {}
    profileError.value = '能力画像加载失败，掌握度展示为默认值，图谱仍可浏览'
  } finally {
    profileLoading.value = false
  }
}

function handleUpdateState(patch) {
  if (!selectedNodeId.value) return
  updateLearningState(selectedNodeId.value, patch)
}

onMounted(async () => {
  loading.value = true
  try {
    const result = await loadKnowledgeGraph()
    graphData.value = result.graph
    dataSource.value = result.source || 'static'
    fallbackNotice.value = result.fallbackReason || ''
    selectedNodeId.value = result.graph.course?.id || selectedNodeId.value
  } catch (error) {
    logger.warn('[student-graph] 加载图谱失败', error)
    errorMsg.value = '加载知识图谱失败，请稍后重试'
  } finally {
    loading.value = false
  }
  fetchProfile()
})
</script>

<template>
  <div class="student-graph-page">
    <header class="page-header">
      <div class="page-copy">
        <div class="page-title-row">
          <span class="page-kicker">My Learning Graph</span>
          <h1 class="page-title">我的学习图谱</h1>
        </div>
        <p class="page-desc">
          以你的能力画像驱动知识图谱：优势知识点上浮发光，薄弱点下沉脉冲警示。双击知识点可追溯你的代码提交版本链。
        </p>
      </div>
    </header>

    <LearningOverviewBar :summary="overviewSummary" :loading="profileLoading" />

    <ui-alert v-if="fallbackNotice" :title="fallbackNotice" type="warning" show-icon :closable="false" />

    <ui-alert v-if="profileError" :title="profileError" type="warning" show-icon :closable="false" />

    <div v-if="loading" class="loading-panel">
      <ui-skeleton :rows="12" animated />
    </div>

    <ui-alert v-else-if="errorMsg" :title="errorMsg" type="warning" show-icon :closable="false" />

    <ui-empty v-else-if="visibleNodes.length === 0" description="暂无知识图谱数据" class="empty-panel" />

    <section v-else class="graph-workbench">
      <div class="graph-main">
        <div class="graph-topline">
          <div>
            <h2>个人知识掌握立体图谱</h2>
            <p>节点高度与辉光由掌握度驱动，红色脉冲标识薄弱知识点。</p>
            <span class="data-source-hint">图谱来源：{{ dataSourceText }} · 掌握度来自实时能力画像</span>
          </div>
          <div class="legend-chips">
            <span class="chip good"><i></i>优势</span>
            <span class="chip medium"><i></i>学习中</span>
            <span class="chip weak"><i></i>薄弱</span>
            <span class="chip unstarted"><i></i>未学习</span>
          </div>
        </div>

        <DataStructureGraphCanvas
          :nodes="visibleNodes"
          :relations="visibleRelations"
          :selected-node-id="selectedNodeId"
          :highlight-paths="highlightPaths"
          :chapter-child-counts="chapterChildCounts"
          :learning-state="learningState"
          :mastery-map="masteryMap"
          :submission-trace="submissionTrace"
          @select-node="selectNode"
          @trace-node="handleTraceNode"
          @select-submission="handleSelectSubmission"
        />
      </div>

      <KnowledgeGraphDetailPanel
        :context="selectedContext"
        :learning-state="learningState"
        :mastery-info="selectedMasteryInfo"
        :submissions="selectedSubmissions"
        :submissions-loading="submissionsLoading"
        :submissions-error="submissionsError"
        :selected-submission="selectedSubmission"
        @update-state="handleUpdateState"
        @select-submission="handleSelectSubmission"
        @select-node="selectNode"
      />
    </section>

    <LearningPathPanel
      :paths="learningPaths"
      :loading="profileLoading"
      @select-node="selectNode"
    />

    <PracticeRecommendPanel
      :practices="practiceRecommendations"
      :loading="profileLoading"
      @select-node="selectNode"
      @start-practice="openPractice"
    />
  </div>
</template>

<style scoped>
.student-graph-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  color: #0f172a;
}

.page-header {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 18px;
  min-width: 0;
  padding: 12px 18px;
  overflow: hidden;
  border: 1px solid #dbe7f5;
  border-radius: 16px;
  background: linear-gradient(135deg, #f4f9ff 0%, #ffffff 55%, #eef4ff 100%);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.page-header::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -30px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(18, 112, 216, 0.10), transparent 70%);
  pointer-events: none;
}

.page-copy {
  position: relative;
  z-index: 1;
}

.page-title-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
}

.page-kicker {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(18, 112, 216, 0.1);
  color: #1270d8;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.04em;
}

.page-title {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.page-desc {
  max-width: 760px;
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.55;
}

.loading-panel,
.empty-panel {
  min-height: 420px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.graph-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
  gap: 16px;
  min-width: 0;
  align-items: stretch;
  /* 限高 + 等高：让左右两列等高于工作区，避免右侧面板过高撑开行高导致画布下方留白 */
  height: clamp(560px, calc(100vh - 320px), 860px);
}

.graph-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
}

/* 3D 画布填满左列高度，与右侧等高，消除下方空白 */
.graph-main :deep(.graph-canvas-shell) {
  flex: 1 1 auto;
  min-height: 0;
}

.graph-main :deep(.graph-stage) {
  min-height: 0;
}

.graph-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.graph-topline h2 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 900;
}

.graph-topline p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
}

.data-source-hint {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.legend-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
}

.legend-chips .chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 850;
}

.legend-chips .chip i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.chip.good { background: #dcfce7; color: #15803d; }
.chip.medium { background: #fef3c7; color: #b45309; }
.chip.weak { background: #fee2e2; color: #b91c1c; }
.chip.unstarted { background: #f1f5f9; color: #64748b; }

@media (max-width: 1180px) {
  .graph-workbench {
    grid-template-columns: 1fr;
    height: auto;
  }

  /* 单列布局取消限高，恢复画布默认最小高度，避免移动端被挤压 */
  .graph-main :deep(.graph-canvas-shell) {
    flex: 0 0 auto;
    min-height: 640px;
  }

  .graph-main :deep(.graph-stage) {
    min-height: 620px;
  }
}
</style>
