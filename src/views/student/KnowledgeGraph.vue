<script setup>
import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import LucideIcon from '@/components/LucideIcon.vue'
import KnowledgeGraphCanvas from './components/KnowledgeGraphCanvas.vue'
import KnowledgeMasteryStats from './components/KnowledgeMasteryStats.vue'
import KnowledgePathPanel from './components/KnowledgePathPanel.vue'
import KnowledgePracticeTable from './components/KnowledgePracticeTable.vue'
import KnowledgeNodePlayer from '@/components/KnowledgeNodePlayer.vue'
import {
  KNOWLEDGE_STATUS,
  STATUS_ORDER,
  dataSourceOptions,
  findKnowledgeNode,
  getStatusStats,
  knowledgeGraphLinks,
  knowledgeGraphNodes,
  learningPaths,
  practiceRecommendations
} from './knowledgeGraphData'

const router = useRouter()

const loading = shallowRef(false)
const errorMsg = shallowRef('')
const dataSource = shallowRef('pta')
const infoVisible = shallowRef(false)
const hoveredNodeId = shallowRef('root')
const videoVisible = shallowRef(false)
const videoNode = shallowRef(null)

const activeNode = computed(() => findKnowledgeNode(hoveredNodeId.value))
const masteryStats = computed(() => getStatusStats(knowledgeGraphNodes))
const hasGraphData = computed(() => knowledgeGraphNodes.length > 0 && knowledgeGraphLinks.length > 0)
const statusLegend = computed(() => STATUS_ORDER.map(status => ({
  status,
  ...KNOWLEDGE_STATUS[status]
})))
const videoStatus = computed(() => {
  if (!videoNode.value?.status) return null
  return KNOWLEDGE_STATUS[videoNode.value.status] || null
})
const videoDialogTitle = computed(() => {
  const name = videoNode.value?.label || videoNode.value?.name || '知识点'
  return `${name} 演示动画`
})

function handleHoverNode(node) {
  if (!node?.id) return
  hoveredNodeId.value = node.id
}

function handleLeaveNode() {
  hoveredNodeId.value = 'root'
}

function handlePlayDemo(node) {
  if (node?.type !== 'knowledge') return
  videoNode.value = node
  videoVisible.value = true
}

function openPractice(target = {}) {
  const knowledge = target.knowledge || target.label || target.name || activeNode.value?.label || activeNode.value?.name || '知识图谱'
  router.push({
    path: '/student/practice',
    query: { knowledge }
  })
}
</script>

<template>
  <div class="knowledge-graph-page">
    <div class="page-toolbar">
      <div class="page-copy">
        <h1 class="page-title">知识图谱</h1>
        <p class="page-desc">基于你的 PTA 学习数据，智能推荐知识点学习路径，帮助你查漏补缺</p>
      </div>

      <div class="page-actions">
        <ui-button plain @click="infoVisible = true">
          <LucideIcon name="book-open" :size="16" />
          图谱说明
        </ui-button>
        <label class="source-control">
          <span>数据来源：</span>
          <ui-select v-model="dataSource" class="source-select">
            <ui-option
              v-for="option in dataSourceOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ui-select>
        </label>
      </div>
    </div>

    <div v-if="loading" class="loading-panel">
      <ui-skeleton :rows="10" animated />
    </div>

    <ui-alert v-else-if="errorMsg" :title="errorMsg" type="warning" show-icon :closable="false" />

    <ui-empty v-else-if="!hasGraphData" description="暂无知识图谱数据" class="page-empty" />

    <template v-else>
      <section class="graph-board">
        <div class="graph-main">
          <div class="board-header">
            <div>
              <h2 class="board-title">C语言程序设计 知识图谱</h2>
              <p class="board-desc">点击具体知识点播放演示动画，悬停节点查看状态，滚轮缩放，拖拽画布查看全貌</p>
            </div>
            <div class="legend-list" aria-label="图谱图例">
              <span v-for="item in statusLegend" :key="item.status" class="legend-item">
                <i :style="{ backgroundColor: item.color }"></i>
                {{ item.label }}
              </span>
            </div>
          </div>

          <KnowledgeGraphCanvas
            :nodes="knowledgeGraphNodes"
            :links="knowledgeGraphLinks"
            :selected-node-id="hoveredNodeId"
            @hover-node="handleHoverNode"
            @leave-node="handleLeaveNode"
            @play-demo="handlePlayDemo"
          />
        </div>

        <KnowledgePathPanel
          :paths="learningPaths"
          :selected-node="activeNode"
          @open-practice="openPractice"
        />
      </section>

      <section class="stats-section">
        <h2 class="section-title">知识点掌握情况统计</h2>
        <KnowledgeMasteryStats :stats="masteryStats" />
      </section>

      <KnowledgePracticeTable
        :practices="practiceRecommendations"
        :selected-node="activeNode"
        @start-practice="openPractice"
      />
    </template>

    <ui-dialog v-model="infoVisible" title="知识图谱说明" width="560px">
      <div class="info-content">
        <p>本页首版使用静态演示数据呈现 C 语言程序设计知识图谱，后续可接入 PTA、能力画像与推荐服务数据。</p>
        <div class="info-legend">
          <div v-for="item in statusLegend" :key="`dialog-${item.status}`" class="info-legend-item">
            <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
            <div>
              <strong>{{ item.label }}</strong>
              <p>{{ item.count }} 个知识点，占比 {{ item.percentage }}%</p>
            </div>
          </div>
        </div>
        <p>图谱中心为课程核心，四个一级模块向外展开到具体知识点。悬停节点后，右侧路径面板和下方练习表会优先展示关联内容；点击具体知识点可打开演示动画弹窗。</p>
      </div>
    </ui-dialog>

    <ui-dialog v-model="videoVisible" :title="videoDialogTitle" width="720px">
      <div v-if="videoNode" class="video-dialog">
        <KnowledgeNodePlayer :node="videoNode" />

        <div class="video-meta">
          <div class="video-meta-item">
            <span>知识模块</span>
            <strong>{{ videoNode.parentName || '课程核心' }}</strong>
          </div>
          <div class="video-meta-item">
            <span>知识状态</span>
            <strong
              v-if="videoStatus"
              class="video-status"
              :style="{ backgroundColor: videoStatus.softColor, color: videoStatus.textColor }"
            >
              {{ videoStatus.label }}
            </strong>
            <strong v-else>暂无状态</strong>
          </div>
        </div>

        <p class="video-desc">{{ videoNode.description || '该知识点的演示动画已生成，可点击去练习巩固相关知识。' }}</p>

        <div class="video-actions">
          <ui-button plain @click="videoVisible = false">关闭</ui-button>
          <ui-button type="primary" @click="openPractice(videoNode)">
            <LucideIcon name="arrow-up-right" :size="15" />
            去练习
          </ui-button>
        </div>
      </div>
    </ui-dialog>
  </div>
</template>

<style scoped>
.knowledge-graph-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  color: #0f172a;
}

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-width: 0;
}

.page-copy {
  min-width: 0;
}

.page-title {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 850;
  letter-spacing: 0;
}

.page-desc {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.page-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  flex-shrink: 0;
}

.source-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 10px 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.source-select {
  width: 112px;
}

.loading-panel,
.page-empty {
  min-height: 420px;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  background: #fff;
}

.graph-board {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
  gap: 18px;
  min-width: 0;
  padding: 18px;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.05);
}

.graph-main {
  min-width: 0;
}

.board-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
  min-width: 0;
}

.board-title,
.section-title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 850;
  letter-spacing: 0;
}

.board-desc {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
}

.legend-list {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 520px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.legend-item i,
.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  background: #fff;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #334155;
  font-size: 14px;
  line-height: 1.7;
}

.info-content p {
  margin: 0;
}

.info-legend {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.info-legend-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #edf2f7;
  border-radius: 12px;
  background: #f8fafc;
}

.info-legend-item strong {
  color: #0f172a;
  font-size: 13px;
}

.info-legend-item p {
  margin-top: 3px;
  color: #64748b;
  font-size: 12px;
}

.info-legend-item .legend-dot {
  margin-top: 5px;
  flex-shrink: 0;
}

.video-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-placeholder {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 14px;
  background:
    radial-gradient(circle at 32% 28%, rgba(34, 197, 94, 0.24), transparent 30%),
    linear-gradient(135deg, #0f172a 0%, #1e3a5f 52%, #1270d8 100%);
  color: #fff;
  text-align: center;
}

.video-placeholder::after {
  position: absolute;
  inset: 0;
  content: '';
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 42px 42px;
  opacity: 0.35;
}

.video-play-mark {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border: 1px solid rgba(255, 255, 255, 0.46);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.28);
}

.video-play-mark::before {
  display: block;
  width: 0;
  height: 0;
  margin-left: 5px;
  border-top: 13px solid transparent;
  border-bottom: 13px solid transparent;
  border-left: 20px solid #fff;
  content: '';
}

.video-placeholder strong,
.video-placeholder span {
  position: relative;
  z-index: 1;
}

.video-placeholder strong {
  max-width: min(420px, 88%);
  overflow: hidden;
  font-size: 20px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-placeholder span {
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  font-weight: 700;
}

.video-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.video-meta-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 12px;
  border: 1px solid #edf2f7;
  border-radius: 12px;
  background: #f8fafc;
}

.video-meta-item span {
  flex-shrink: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.video-meta-item strong {
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-status {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  line-height: 1;
}

.video-desc {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
}

.video-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1080px) {
  .graph-board {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page-toolbar,
  .board-header {
    align-items: stretch;
    flex-direction: column;
  }

  .page-actions {
    justify-content: flex-start;
  }

  .legend-list {
    justify-content: flex-start;
  }

  .source-control {
    width: 100%;
    justify-content: space-between;
  }

  .source-select {
    width: 140px;
  }

  .info-legend {
    grid-template-columns: 1fr;
  }

  .video-meta {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .knowledge-graph-page {
    gap: 14px;
  }

  .page-title {
    font-size: 21px;
  }

  .graph-board,
  .stats-section {
    padding: 14px;
  }

  .video-actions {
    flex-direction: column-reverse;
  }

  .video-actions .ui-button {
    width: 100%;
  }
}
</style>
