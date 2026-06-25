<script setup>
import { computed, onMounted, shallowRef } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'
import DataStructureGraphCanvas from '@/features/knowledge-graph/components/DataStructureGraphCanvas.vue'
import KnowledgeGraphDetailPanel from '@/features/knowledge-graph/components/KnowledgeGraphDetailPanel.vue'
import KnowledgeGraphPayloadPreview from '@/features/knowledge-graph/components/KnowledgeGraphPayloadPreview.vue'
import KnowledgeGraphToolbar from '@/features/knowledge-graph/components/KnowledgeGraphToolbar.vue'
import {
  GRAPH_CODE,
  nodeTypeOptions,
  relationTypeOptions
} from '@/features/knowledge-graph/dataStructureGraph'
import {
  getAncestorChain,
  getGraphStats,
  getNodeContext,
  getNodeTypeMeta,
  normalizeGraph,
  toGraphDbPayload,
  validateGraph
} from '@/features/knowledge-graph/graphDatabaseAdapter'
import { createEmptyKnowledgeGraph, getStaticSeedGraph, loadKnowledgeGraph } from '@/features/knowledge-graph/knowledgeGraphDataSource'
import { useStateForGraph } from '@/features/knowledge-graph/learningState'
import {
  exportGraphJSON,
  saveGraphToLocal,
  seedGraphToLocal
} from '@/features/knowledge-graph/exportUtils'
import logger from '@/utils/logger'

const loading = shallowRef(false)
const errorMsg = shallowRef('')
const fallbackNotice = shallowRef('')
const dataSource = shallowRef('empty')
const graphData = shallowRef(createEmptyKnowledgeGraph())
const searchKeyword = shallowRef('')
const nodeType = shallowRef('all')
const relationType = shallowRef('all')
const selectedNodeId = shallowRef('')
const collapsedChapterIds = shallowRef([])
const payloadVisible = shallowRef(false)
const writing = shallowRef(false)
const resultMessage = shallowRef(null)

const { state: learningState, update: updateLearningState } = useStateForGraph(GRAPH_CODE)

const normalizedGraph = computed(() => normalizeGraph(graphData.value))
const validation = computed(() => validateGraph(graphData.value))
const payload = computed(() => toGraphDbPayload(graphData.value))
const stats = computed(() => getGraphStats(graphData.value))
const hasGraphData = computed(() => normalizedGraph.value.nodes.length > 0)

const chapterOptions = computed(() => normalizedGraph.value.nodes
  .filter(node => node.type === 'chapter')
  .map(node => ({ value: node.id, label: node.label })))

const chapterChildCounts = computed(() => {
  const counts = {}
  for (const node of normalizedGraph.value.nodes) {
    if (node.chapterId) {
      counts[node.chapterId] = (counts[node.chapterId] || 0) + 1
    }
  }
  return counts
})

const visibleNodes = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  const collapsed = new Set(collapsedChapterIds.value)
  return normalizedGraph.value.nodes.filter((node) => {
    const matchesType = nodeType.value === 'all' || node.type === nodeType.value
    const text = [
      node.label,
      node.summary,
      node.properties.definition,
      node.properties.studyTip,
      ...(node.properties.keywords || [])
    ].filter(Boolean).join(' ').toLowerCase()
    const matchesKeyword = !keyword || text.includes(keyword)
    const matchesCollapse = !collapsed.has(node.chapterId) || node.type === 'chapter' || node.type === 'course'
    return matchesType && matchesKeyword && matchesCollapse
  })
})

const visibleNodeIds = computed(() => new Set(visibleNodes.value.map(node => node.id)))

const visibleRelations = computed(() => normalizedGraph.value.relations.filter((relation) => {
  const matchesType = relationType.value === 'all' || relation.type === relationType.value
  return matchesType && visibleNodeIds.value.has(relation.source) && visibleNodeIds.value.has(relation.target)
}))

const selectedContext = computed(() => getNodeContext(graphData.value, selectedNodeId.value))

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

const statCards = computed(() => [
  {
    label: '节点总数',
    value: stats.value.totalNodes,
    icon: 'network',
    color: '#1270d8',
    bg: '#dbeafe'
  },
  {
    label: '关系总数',
    value: stats.value.totalRelations,
    icon: 'link',
    color: '#0f766e',
    bg: '#ccfbf1'
  },
  {
    label: '结构节点',
    value: stats.value.structureCount,
    icon: 'layout-grid',
    color: '#ea580c',
    bg: '#ffedd5'
  },
  {
    label: '算法节点',
    value: stats.value.algorithmCount,
    icon: 'sparkles',
    color: '#0ea5e9',
    bg: '#e0f2fe'
  }
])

const typeBreakdown = computed(() => Object.entries(stats.value.nodeTypeCounts).map(([type, count]) => ({
  type,
  count,
  ...getNodeTypeMeta(type)
})))

function selectNode(node) {
  if (!node?.id) return
  selectedNodeId.value = node.id
}

function resetFilters() {
  searchKeyword.value = ''
  nodeType.value = 'all'
  relationType.value = 'all'
  collapsedChapterIds.value = []
  selectedNodeId.value = graphData.value.course.id
}

function showPayloadPreview() {
  payloadVisible.value = true
}

function notify(type, text) {
  resultMessage.value = { type, text }
}

function handleExportJson() {
  try {
    exportGraphJSON(graphData.value)
    notify('success', '已导出 JSON 文件')
  } catch (error) {
    logger.warn('[knowledge-graph] 导出 JSON 失败', error)
    notify('warning', `导出 JSON 失败：${error?.message || error}`)
  }
}

async function handleSaveLocal() {
  if (writing.value) return
  writing.value = true
  try {
    const result = await saveGraphToLocal(graphData.value)
    if (result.success) {
      notify('success', result.message || '已保存到本地')
    } else {
      notify('warning', result.message || '保存到本地失败')
    }
  } catch (error) {
    logger.warn('[knowledge-graph] 保存到本地失败', error)
    notify('warning', `保存到本地失败：${error?.message || error}`)
  } finally {
    writing.value = false
  }
}

async function handleSeedLocal() {
  if (writing.value) return
  writing.value = true
  try {
    const seedGraph = getStaticSeedGraph()
    if (!seedGraph) {
      notify('warning', '没有可用的内置图谱种子数据')
      return
    }
    const result = await seedGraphToLocal(seedGraph)
    if (!result.success) {
      notify('warning', result.message || '导入内置图谱失败')
      return
    }
    const reloaded = await loadKnowledgeGraph()
    graphData.value = reloaded.graph
    dataSource.value = reloaded.source
    fallbackNotice.value = reloaded.fallbackReason || ''
    selectedNodeId.value = reloaded.graph.course?.id || selectedNodeId.value
    notify('success', `${result.message || '已导入内置图谱'}，已刷新图谱数据`)
  } catch (error) {
    logger.warn('[knowledge-graph] 导入内置图谱失败', error)
    notify('warning', `导入内置图谱失败：${error?.message || error}`)
  } finally {
    writing.value = false
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
    dataSource.value = result.source
    fallbackNotice.value = result.fallbackReason || ''
    selectedNodeId.value = result.graph.course?.id || selectedNodeId.value
  } catch (error) {
    logger.warn('[knowledge-graph] 加载失败', error)
    errorMsg.value = '加载知识图谱失败，请稍后重试'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="data-graph-page">
    <header class="page-header">
      <div class="page-copy">
        <span class="page-kicker">Course Knowledge Graph</span>
        <h1 class="page-title">数据结构课程知识图谱</h1>
        <p class="page-desc">
          按课程章节组织导论、线性表、栈队列串、树、图、查找排序哈希等知识点，串联概念、结构、算法、操作与练习。
        </p>
      </div>
      <div class="contract-card">
        <span :class="['contract-dot', { valid: validation.valid }]"></span>
        <div>
          <strong>{{ validation.valid ? '课程图谱契约校验通过' : '课程图谱契约存在问题' }}</strong>
          <p>{{ validation.valid ? '可生成 graphCode、nodes、relations 标准图谱预览 payload' : validation.errors[0] }}</p>
        </div>
      </div>
    </header>

    <div class="source-bar">
      <span class="source-tag" :class="{ backend: dataSource === 'local' }">
        <LucideIcon :name="dataSource === 'local' ? 'database' : dataSource === 'static' ? 'book-open' : 'circle-slash'" :size="14" />
        数据来源：{{ dataSource === 'local' ? '浏览器本地' : dataSource === 'static' ? '内置初始图谱' : '暂无图谱数据' }}
      </span>
      <span v-if="fallbackNotice" class="source-notice">
        <LucideIcon name="triangle-alert" :size="14" />
        {{ fallbackNotice }}
      </span>
      <transition name="fade">
        <span v-if="resultMessage" :class="['source-result', resultMessage.type]">
          <LucideIcon :name="resultMessage.type === 'success' ? 'check' : 'triangle-alert'" :size="14" />
          {{ resultMessage.text }}
          <button type="button" class="result-close" @click="resultMessage = null">×</button>
        </span>
      </transition>
    </div>

    <section class="stats-grid" aria-label="知识图谱统计">
      <article v-for="item in statCards" :key="item.label" class="stat-card">
        <span class="stat-icon" :style="{ backgroundColor: item.bg, color: item.color }">
          <LucideIcon :name="item.icon" :size="18" />
        </span>
        <div>
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </article>
    </section>

    <KnowledgeGraphToolbar
      v-model:search-keyword="searchKeyword"
      v-model:node-type="nodeType"
      v-model:relation-type="relationType"
      v-model:collapsed-chapter-ids="collapsedChapterIds"
      :node-type-options="nodeTypeOptions"
      :relation-type-options="relationTypeOptions"
      :chapter-options="chapterOptions"
      :data-source="dataSource"
      :writing="writing"
      @reset="resetFilters"
      @preview-payload="showPayloadPreview"
      @export-json="handleExportJson"
      @save-local="handleSaveLocal"
      @seed-local="handleSeedLocal"
    />

    <div v-if="loading" class="loading-panel">
      <ui-skeleton :rows="12" animated />
    </div>

    <ui-alert v-else-if="errorMsg" :title="errorMsg" type="warning" show-icon :closable="false" />

    <ui-empty v-else-if="!hasGraphData" description="暂无知识图谱数据" class="empty-panel" />

    <template v-else>
      <ui-empty v-if="visibleNodes.length === 0" description="没有匹配当前筛选条件的节点" class="empty-panel" />

      <section v-else class="graph-workbench">
        <div class="graph-main">
          <div class="graph-topline">
            <div>
              <h2>课程章节知识体系</h2>
              <p>点击节点查看前置知识、后续知识、关联练习和本地图谱属性。</p>
            </div>
            <div class="type-breakdown" aria-label="节点类型统计">
              <span v-for="item in typeBreakdown" :key="item.type" :style="{ backgroundColor: item.softColor, color: item.textColor }">
                {{ item.label }} {{ item.count }}
              </span>
            </div>
          </div>

          <DataStructureGraphCanvas
            :nodes="visibleNodes"
            :relations="visibleRelations"
            :selected-node-id="selectedNodeId"
            :highlight-paths="highlightPaths"
            :chapter-child-counts="chapterChildCounts"
            :learning-state="learningState"
            @select-node="selectNode"
          />
        </div>

        <KnowledgeGraphDetailPanel
          :context="selectedContext"
          :learning-state="learningState"
          @update-state="handleUpdateState"
          @select-node="selectNode"
        />
      </section>
    </template>

    <KnowledgeGraphPayloadPreview
      v-model:visible="payloadVisible"
      :payload="payload"
      :validation="validation"
    />
  </div>
</template>

<style scoped>
.data-graph-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  color: #0f172a;
}

.page-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 18px;
  min-width: 0;
}

.page-copy {
  min-width: 0;
}

.page-kicker {
  color: #1270d8;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0;
}

.page-title {
  margin: 4px 0 0;
  color: #0f172a;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0;
}

.page-desc {
  max-width: 760px;
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.contract-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: min(360px, 100%);
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.contract-dot {
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ef4444;
}

.contract-dot.valid {
  background: #22c55e;
}

.contract-card strong {
  color: #0f172a;
  font-size: 13px;
}

.contract-card p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.source-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-height: 28px;
}

.source-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.source-tag.backend {
  background: #ccfbf1;
  color: #0f766e;
}

.source-notice {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
}

.source-result {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.source-result.success {
  background: #dcfce7;
  color: #15803d;
}

.source-result.warning {
  background: #fef3c7;
  color: #b45309;
}

.result-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 82px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.stat-card strong {
  display: block;
  color: #0f172a;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.stat-card span:last-child {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
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
  grid-template-columns: minmax(0, 1fr) minmax(310px, 360px);
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

.type-breakdown {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
  max-width: 520px;
}

.type-breakdown span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 850;
}

@media (max-width: 1180px) {
  .graph-workbench {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 920px) {
  .page-header {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .graph-topline {
    flex-direction: column;
  }

  .type-breakdown {
    justify-content: flex-start;
  }
}

@media (max-width: 560px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
