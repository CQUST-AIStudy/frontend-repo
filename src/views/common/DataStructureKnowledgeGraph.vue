<script setup>
import { computed, shallowRef } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'
import DataStructureGraphCanvas from '@/features/knowledge-graph/components/DataStructureGraphCanvas.vue'
import KnowledgeGraphDetailPanel from '@/features/knowledge-graph/components/KnowledgeGraphDetailPanel.vue'
import KnowledgeGraphPayloadPreview from '@/features/knowledge-graph/components/KnowledgeGraphPayloadPreview.vue'
import KnowledgeGraphToolbar from '@/features/knowledge-graph/components/KnowledgeGraphToolbar.vue'
import {
  nodeTypeOptions,
  rawGraph,
  relationTypeOptions
} from '@/features/knowledge-graph/dataStructureGraph'
import {
  getGraphStats,
  getNodeContext,
  getNodeTypeMeta,
  normalizeGraph,
  toGraphDbPayload,
  validateGraph
} from '@/features/knowledge-graph/graphDatabaseAdapter'

const loading = shallowRef(false)
const errorMsg = shallowRef('')
const searchKeyword = shallowRef('')
const nodeType = shallowRef('all')
const relationType = shallowRef('all')
const selectedNodeId = shallowRef(rawGraph.course.id)
const payloadVisible = shallowRef(false)

const normalizedGraph = computed(() => normalizeGraph(rawGraph))
const validation = computed(() => validateGraph(rawGraph))
const payload = computed(() => toGraphDbPayload(rawGraph))
const stats = computed(() => getGraphStats(rawGraph))
const hasGraphData = computed(() => normalizedGraph.value.nodes.length > 0)

const visibleNodes = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
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
    return matchesType && matchesKeyword
  })
})

const visibleNodeIds = computed(() => new Set(visibleNodes.value.map(node => node.id)))

const visibleRelations = computed(() => normalizedGraph.value.relations.filter((relation) => {
  const matchesType = relationType.value === 'all' || relation.type === relationType.value
  return matchesType && visibleNodeIds.value.has(relation.source) && visibleNodeIds.value.has(relation.target)
}))

const selectedContext = computed(() => getNodeContext(rawGraph, selectedNodeId.value))

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
  selectedNodeId.value = rawGraph.course.id
}

function showPayloadPreview() {
  payloadVisible.value = true
}
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
          <p>{{ validation.valid ? '可生成 graphCode、nodes、relations 标准写库预览 payload' : validation.errors[0] }}</p>
        </div>
      </div>
    </header>

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
      :node-type-options="nodeTypeOptions"
      :relation-type-options="relationTypeOptions"
      @reset="resetFilters"
      @preview-payload="showPayloadPreview"
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
              <p>点击节点查看前置知识、后续知识、关联练习和图数据库写入属性。</p>
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
            @select-node="selectNode"
          />
        </div>

        <KnowledgeGraphDetailPanel :context="selectedContext" />
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
