<script setup>
import { computed, onMounted, shallowRef } from 'vue'
import axios from 'axios'
import DataStructureGraphCanvas from '@/features/knowledge-graph/components/DataStructureGraphCanvas.vue'
import KnowledgeGraphDetailPanel from '@/features/knowledge-graph/components/KnowledgeGraphDetailPanel.vue'
import LearningOverviewBar from '@/features/knowledge-graph/components/LearningOverviewBar.vue'
import { GRAPH_CODE, rawGraph } from '@/features/knowledge-graph/dataStructureGraph'
import {
  getAncestorChain,
  getNodeContext,
  normalizeGraph
} from '@/features/knowledge-graph/graphDatabaseAdapter'
import { loadKnowledgeGraph } from '@/features/knowledge-graph/neo4jDataSource'
import { useStateForGraph } from '@/features/knowledge-graph/learningState'
import {
  buildMasteryMap,
  buildSubmissionMap
} from '@/features/knowledge-graph/studentProfileAdapter'
import { API_BASE_URL } from '@/config/runtime'
import { getTapToken } from '@/constants/auth'
import api from '@/api'
import logger from '@/utils/logger'

const loading = shallowRef(false)
const errorMsg = shallowRef('')
const profileLoading = shallowRef(true)
const graphData = shallowRef(rawGraph)
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
  } catch (error) {
    logger.warn('[student-graph] 加载提交记录失败', error)
    submissionsError.value = '加载提交记录失败，请稍后重试'
  } finally {
    submissionsLoading.value = false
  }
}

async function fetchProfile() {
  profileLoading.value = true
  try {
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
    profile.value = res.data?.data || res.data || {}
  } catch (error) {
    logger.warn('[student-graph] 加载学生画像失败', error)
    // 画像失败时降级为 localStorage 手动掌握度（masteryMap 为空，画布走兜底）
    profile.value = {}
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
        <span class="page-kicker">My Learning Graph</span>
        <h1 class="page-title">我的学习图谱</h1>
        <p class="page-desc">
          以你的能力画像驱动知识图谱：优势知识点上浮发光，薄弱点下沉脉冲警示。双击知识点可追溯你的代码提交版本链。
        </p>
      </div>
    </header>

    <LearningOverviewBar :summary="overviewSummary" :loading="profileLoading" />

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
          </div>
          <div class="legend-chips">
            <span class="chip good">优势</span>
            <span class="chip medium">学习中</span>
            <span class="chip weak">薄弱</span>
            <span class="chip unstarted">未学习</span>
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
  display: flex;
  align-items: stretch;
  gap: 18px;
  min-width: 0;
}

.page-kicker {
  color: #1270d8;
  font-size: 12px;
  font-weight: 850;
}

.page-title {
  margin: 4px 0 0;
  color: #0f172a;
  font-size: 26px;
  font-weight: 900;
}

.page-desc {
  max-width: 760px;
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
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
}

.graph-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.graph-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
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

.legend-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
}

.legend-chips .chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 850;
}

.chip.good { background: #dcfce7; color: #15803d; }
.chip.medium { background: #fef3c7; color: #b45309; }
.chip.weak { background: #fee2e2; color: #b91c1c; }
.chip.unstarted { background: #f1f5f9; color: #64748b; }

@media (max-width: 1180px) {
  .graph-workbench {
    grid-template-columns: 1fr;
  }
}
</style>
