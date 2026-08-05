<template>
  <div class="rag-analytics-container">
    <header class="page-heading">
      <h1>RAG 运营面板</h1>
      <p>课程知识库问答质量监控与分析</p>
    </header>

    <div class="toolbar">
      <ui-select
        v-model="selectedSpaceId"
        placeholder="选择课程知识库"
        class="space-select"
        :disabled="spacesLoading || courseSpaces.length === 0"
        @change="handleSpaceChange"
      >
        <ui-option v-for="space in courseSpaces" :key="space.id" :label="space.name" :value="space.id" />
      </ui-select>
      <span v-if="selectedSpace" class="space-meta">
        {{ selectedSpace.courseName || selectedSpace.name }}
        <template v-if="selectedSpace.term"> / {{ selectedSpace.term }}</template>
      </span>
    </div>

    <div v-if="spacesLoading" class="empty-state">正在加载课程知识库...</div>

    <div v-else-if="courseSpaces.length === 0" class="empty-state">
      暂无可分析的课程知识库，请先创建知识库并完成问答。
    </div>

    <div v-else-if="selectedSpaceId" class="analytics-content" :aria-busy="loading">
      <div v-if="loading && !analyticsData" class="loading-line">正在加载真实统计数据...</div>

      <ui-row :gutter="16" class="stat-row">
        <ui-col v-for="card in statCards" :key="card.label" :span="6">
          <ui-card shadow="hover" class="stat-card">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-desc">{{ card.desc }}</div>
          </ui-card>
        </ui-col>
      </ui-row>

      <ui-row :gutter="16" class="section-row">
        <ui-col :span="14">
          <ui-card shadow="hover" class="panel-card">
            <template #header>
              <span>问题热榜 TOP 20</span>
            </template>
            <div v-if="!hasQuestionLogs" class="table-empty">暂无问答日志</div>
            <ui-table v-else :data="hotQuestions" stripe size="small" max-height="360">
              <ui-table-column type="index" label="#" width="50" />
              <ui-table-column prop="query" label="问题" show-overflow-tooltip />
              <ui-table-column prop="count" label="提问次数" width="110" sortable />
            </ui-table>
          </ui-card>
        </ui-col>

        <ui-col :span="10">
          <ui-card shadow="hover" class="panel-card">
            <template #header>
              <span>资料缺口提示</span>
            </template>
            <div v-if="!hasQuestionLogs" class="table-empty">暂无问答日志</div>
            <div v-else-if="resourceGaps.length === 0" class="table-empty">
              当前未发现低覆盖高频问题
            </div>
            <div v-else class="gap-list">
              <div v-for="gap in resourceGaps" :key="gap.query" class="gap-item">
                <div class="gap-query">{{ gap.query }}</div>
                <div class="gap-meta">
                  <ui-tag size="small" type="danger">提问 {{ gap.count }} 次</ui-tag>
                  <ui-tag size="small" type="warning">平均覆盖 {{ formatPercent(gap.avgCoverage) }}</ui-tag>
                </div>
              </div>
            </div>
          </ui-card>
        </ui-col>
      </ui-row>

      <ui-row :gutter="16" class="section-row">
        <ui-col :span="24">
          <ui-card shadow="hover" class="panel-card">
            <template #header>
              <span>文档引用频次</span>
            </template>
            <div v-if="!hasQuestionLogs" class="table-empty">暂无问答日志</div>
            <div v-else-if="citationList.length === 0" class="table-empty">
              暂无本地知识库文档引用
            </div>
            <ui-table v-else :data="citationList" stripe size="small" max-height="300">
              <ui-table-column type="index" label="#" width="50" />
              <ui-table-column prop="docName" label="文档名称" show-overflow-tooltip />
              <ui-table-column prop="count" label="被引用次数" width="120" sortable />
              <ui-table-column label="引用占比" width="220">
                <template #default="{ row }">
                  <ui-progress :percentage="row.percentage" :stroke-width="14" :text-inside="true" />
                </template>
              </ui-table-column>
            </ui-table>
          </ui-card>
        </ui-col>
      </ui-row>
    </div>

    <div v-else class="empty-state">{{ courseSpaces.length ? '请选择一个课程知识库查看分析数据。' : '当前课程或班级没有匹配的知识库。' }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, shallowRef } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { getCourseSpaces, getRagAnalytics } from '../../api/rag'
import { useUserStore } from '../../store'
import { filterCourseSpacesForClass } from '../../utils/courseSpaceScope'

const userStore = useUserStore()
const courseSpaces = ref([])
const analyticsData = ref(null)
const selectedSpaceId = shallowRef('')
const spacesLoading = shallowRef(false)
const loading = shallowRef(false)

let analyticsRequestId = 0

const selectedSpace = computed(() =>
  courseSpaces.value.find((space) => String(space.id) === String(selectedSpaceId.value)) || null
)

const summary = computed(() => {
  const data = analyticsData.value || {}
  const feedbackStats = data.feedbackStats || {}
  const citationCoverage = data.citationCoverage || {}
  const totalQuestions = Number(data.summary?.totalQuestions ?? data.logs?.length ?? 0)
  const hitCount = Number(
    data.summary?.hitCount ??
    Math.round(Number(data.hitRate || 0) * totalQuestions)
  )
  const webTriggerCount = Number(
    data.summary?.webTriggerCount ??
    Math.round(Number(data.webTriggerRate || 0) * totalQuestions)
  )
  const thumbsUp = Number(data.summary?.thumbsUp ?? feedbackStats.thumbsUp ?? 0)
  const thumbsDown = Number(data.summary?.thumbsDown ?? feedbackStats.thumbsDown ?? 0)
  const feedbackRatedTotal = Number(data.summary?.feedbackRatedTotal ?? feedbackStats.total ?? thumbsUp + thumbsDown)
  const satisfactionRate = data.summary?.satisfactionRate
  return {
    totalQuestions,
    hitCount,
    webTriggerCount,
    feedbackRatedTotal,
    thumbsUp,
    thumbsDown,
    satisfactionRate: satisfactionRate === null || satisfactionRate === undefined
      ? null
      : Number(satisfactionRate),
    citationCount: Number(data.summary?.citationCount ?? sumObjectValues(citationCoverage)),
    citedDocumentCount: Number(data.summary?.citedDocumentCount ?? Object.keys(citationCoverage).length),
  }
})

const hasQuestionLogs = computed(() => summary.value.totalQuestions > 0)

const hotQuestions = computed(() => analyticsData.value?.hotQuestions || [])
const resourceGaps = computed(() => analyticsData.value?.resourceGaps || [])

const citationList = computed(() => {
  const coverage = analyticsData.value?.citationCoverage || {}
  const total = sumObjectValues(coverage)
  return Object.entries(coverage)
    .map(([docName, count]) => ({
      docName,
      count: Number(count || 0),
      percentage: total ? Math.round((Number(count || 0) / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
})

const statCards = computed(() => [
  {
    label: '问答总数',
    value: `${summary.value.totalQuestions}`,
    desc: selectedSpace.value ? `${selectedSpace.value.name} 的真实问答日志` : '当前知识库问答日志',
  },
  {
    label: '命中率',
    value: formatRate(summary.value.hitCount, summary.value.totalQuestions),
    desc: `命中 ${summary.value.hitCount} / ${summary.value.totalQuestions} 次`,
  },
  {
    label: '联网触发率',
    value: formatRate(summary.value.webTriggerCount, summary.value.totalQuestions),
    desc: `联网 ${summary.value.webTriggerCount} / ${summary.value.totalQuestions} 次`,
  },
  {
    label: '反馈满意度',
    value: summary.value.feedbackRatedTotal ? formatPercent(summary.value.satisfactionRate) : '暂无反馈',
    desc: `已反馈 ${summary.value.feedbackRatedTotal} / ${summary.value.totalQuestions} 条，赞 ${summary.value.thumbsUp} / 踩 ${summary.value.thumbsDown}`,
  },
])

function sumObjectValues(value) {
  return Object.values(value).reduce((total, item) => total + Number(item || 0), 0)
}

function formatRate(count, total) {
  if (!total) return '0.0%'
  return formatPercent(count / total)
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0.0%'
  return `${(Number(value) * 100).toFixed(1)}%`
}

function normalizeResponse(response) {
  return response?.data ?? response ?? {}
}

async function loadSpaces() {
  spacesLoading.value = true
  try {
    const res = await getCourseSpaces()
    const spaces = Array.isArray(res) ? res : (res?.data || [])
    courseSpaces.value = filterCourseSpacesForClass(spaces, userStore.selectedClass)
    const firstSpace = courseSpaces.value[0]
    selectedSpaceId.value = firstSpace ? String(firstSpace.id) : ''
    if (selectedSpaceId.value) {
      await loadAnalytics(selectedSpaceId.value)
    } else {
      analyticsData.value = null
    }
  } catch (error) {
    courseSpaces.value = []
    selectedSpaceId.value = ''
    analyticsData.value = null
    logger.warn('获取课程知识库失败', error)
    uiMessage.error('加载课程知识库失败，请稍后重试')
  } finally {
    spacesLoading.value = false
  }
}

async function loadAnalytics(spaceId) {
  if (!spaceId) {
    analyticsData.value = null
    return
  }
  const requestId = ++analyticsRequestId
  loading.value = true
  try {
    const res = await getRagAnalytics(spaceId)
    if (requestId !== analyticsRequestId) return
    analyticsData.value = normalizeResponse(res)
  } catch (error) {
    if (requestId !== analyticsRequestId) return
    analyticsData.value = null
    logger.warn('加载 RAG 分析数据失败', error)
    uiMessage.error('加载分析数据失败，请稍后重试或检查课程知识库配置')
  } finally {
    if (requestId === analyticsRequestId) {
      loading.value = false
    }
  }
}

function handleSpaceChange() {
  loadAnalytics(selectedSpaceId.value)
}

onMounted(loadSpaces)
</script>

<style scoped>
.rag-analytics-container {
  height: 100%;
  overflow-y: auto;
  color: #0f172a;
}

.rag-analytics-container :deep(.ui-card) {
  border: 0.5px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.page-heading {
  padding: 18px 20px;
}

.page-heading h1 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0;
}

.page-heading p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 10px;
}

.space-select {
  width: 360px;
  max-width: 100%;
}

.space-meta {
  min-width: 0;
  overflow: hidden;
  color: #64748b;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.analytics-content {
  min-height: 400px;
}

.loading-line {
  margin: 0 20px 12px;
  color: #64748b;
  font-size: 13px;
}

.stat-row,
.section-row {
  padding: 0 20px 16px;
}

.stat-card {
  min-height: 154px;
  padding: 18px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  text-align: center;
  transition: box-shadow 0.25s, transform 0.25s;
}

.stat-card:hover {
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.stat-label {
  margin-top: 4px;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 13px;
}

.stat-value {
  margin-bottom: 6px;
  color: var(--app-primary);
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.stat-desc {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

.panel-card {
  min-height: 240px;
}

.table-empty,
.empty-state {
  display: flex;
  min-height: 160px;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
}

.empty-state {
  min-height: 320px;
}

.gap-list {
  max-height: 320px;
  overflow-y: auto;
}

.gap-item {
  padding: 10px 0;
  border-bottom: 1px solid #eef2f7;
}

.gap-item:last-child {
  border-bottom: none;
}

.gap-query {
  margin-bottom: 6px;
  color: #1d1d1f;
  font-size: 14px;
  line-height: 1.5;
}

.gap-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 900px) {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .space-select {
    width: 100%;
  }
}
</style>
