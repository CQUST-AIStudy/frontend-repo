<template>
  <div class="wrong-notebook-page">
    <UiPageHeader title="错题本" description="按知识点归档 PTA 与 LeetCode 错题，并在同一处完成针对性回炉。">
      <ui-button :loading="loading" class="warm-normal-button" @click="loadAll">刷新数据</ui-button>
    </UiPageHeader>

    <loading-state :loading="loading">
      <div class="notebook-content">
        <div class="summary-grid">
          <ui-card v-for="item in summaryCards" :key="item.label" class="summary-card" shadow="hover">
            <div class="summary-value" :style="{ color: item.color }">{{ item.value }}</div>
            <div class="summary-label">{{ item.label }}</div>
            <div class="summary-tip">{{ item.tip }}</div>
          </ui-card>
        </div>

        <ui-card class="filter-card" shadow="never">
          <div class="filter-head">
            <div>
              <div class="filter-title">只看当前需要的错题</div>
              <div class="filter-desc">筛选结果会实时重组知识点，没有错题的知识点不会显示。</div>
            </div>
            <ui-button plain size="small" class="filter-reset-button" @click="resetFilters">重置筛选</ui-button>
          </div>

          <div class="filter-content">
            <ui-radio-group v-model="activeTab" class="status-tabs" @change="onTabChange">
              <ui-radio-button label="all">全部 {{ statusCounts.total }}</ui-radio-button>
              <ui-radio-button label="unresolved">待攻克 {{ statusCounts.unresolved }}</ui-radio-button>
              <ui-radio-button label="resolved">已掌握 {{ statusCounts.resolved }}</ui-radio-button>
            </ui-radio-group>

            <div class="filter-controls">
              <ui-select v-model="filters.sourceType" class="toolbar-control" placeholder="来源" clearable size="small" @change="reloadList">
                <ui-option label="LeetCode" value="LEETCODE_PRACTICE" />
                <ui-option label="PTA" value="PTA_SYNCED" />
              </ui-select>
              <ui-select v-model="filters.difficulty" class="toolbar-control" placeholder="难度" clearable size="small" @change="reloadList">
                <ui-option label="简单" value="Easy" />
                <ui-option label="中等" value="Medium" />
                <ui-option label="困难" value="Hard" />
              </ui-select>
              <ui-select v-model="filters.errorCategory" class="toolbar-control" placeholder="错误类型" clearable size="small" @change="reloadList">
                <ui-option v-for="opt in errorCategoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </ui-select>
              <ui-input v-model="filters.q" class="toolbar-search" placeholder="搜索题目或知识点" clearable size="small" @change="reloadList" />
            </div>
          </div>
        </ui-card>

        <ui-alert
          v-if="ptaErrorState === 'error'"
          type="warning"
          :closable="false"
          title="PTA 错题知识点暂时加载失败，当前仍可查看错题本中的其他记录。"
          show-icon
        />

        <div v-if="knowledgeGroups.length && selectedGroup" class="knowledge-layout">
          <ui-card class="knowledge-sidebar" shadow="never">
            <template #header>
              <div class="panel-head">
                <div>
                  <strong>错题知识点</strong>
                  <span>仅显示有错题的知识点</span>
                </div>
                <ui-tag type="danger" effect="plain">{{ knowledgeGroups.length }} 个</ui-tag>
              </div>
            </template>

            <div class="knowledge-list">
              <button
                v-for="group in knowledgeGroups"
                :key="group.key"
                type="button"
                class="knowledge-item"
                :class="{ active: group.key === selectedGroup.key }"
                @click="selectKnowledge(group.key)"
              >
                <div class="knowledge-item__top">
                  <span class="knowledge-name">{{ group.name }}</span>
                  <span class="knowledge-count">{{ group.items.length }} 题</span>
                </div>
                <div class="knowledge-meta">
                  <span>错误 {{ group.wrongCount }} 次</span>
                  <span v-if="group.unresolvedCount">待攻克 {{ group.unresolvedCount }}</span>
                  <span v-else>本组已掌握</span>
                </div>
                <div class="knowledge-progress">
                  <i :style="{ width: `${group.progress}%` }"></i>
                </div>
              </button>
            </div>
          </ui-card>

          <div class="knowledge-detail">
            <section class="focus-banner">
              <div class="focus-copy">
                <span class="focus-eyebrow">当前知识点</span>
                <h2>{{ selectedGroup.name }}</h2>
                <p>共 {{ selectedGroup.items.length }} 道错题，累计错误 {{ selectedGroup.wrongCount }} 次。按错误频次从高到低回炉。</p>
              </div>
              <div class="focus-stats">
                <div><span>待攻克</span><strong>{{ selectedGroup.unresolvedCount }}</strong></div>
                <div><span>已掌握</span><strong>{{ selectedGroup.resolvedCount }}</strong></div>
              </div>
              <ui-button type="primary" size="large" @click="startGroupTraining(selectedGroup)">
                {{ selectedGroup.unresolvedCount ? '开始本组训练' : '再次巩固' }}
              </ui-button>
            </section>

            <ui-card class="question-panel" shadow="never">
              <template #header>
                <div class="panel-head">
                  <div>
                    <strong>{{ selectedGroup.name }}错题</strong>
                    <span>PTA 知识点与 LeetCode 标签已合并归档</span>
                  </div>
                  <div class="source-tags">
                    <ui-tag v-if="selectedGroup.ptaCount" type="info" effect="plain">PTA {{ selectedGroup.ptaCount }}</ui-tag>
                    <ui-tag v-if="selectedGroup.leetcodeCount" type="success" effect="plain">LeetCode {{ selectedGroup.leetcodeCount }}</ui-tag>
                  </div>
                </div>
              </template>

              <div class="question-list">
                <article v-for="item in selectedGroup.items" :key="item.key" class="question-card">
                  <div class="question-main">
                    <div class="question-title-row">
                      <span class="question-title">{{ item.title }}</span>
                      <ui-tag :type="item.sourceType === 'PTA_SYNCED' ? 'info' : 'success'" size="small" effect="plain">
                        {{ item.sourceType === 'PTA_SYNCED' ? 'PTA' : 'LeetCode' }}
                      </ui-tag>
                      <ui-tag v-if="item.resolved" type="success" size="small">已掌握</ui-tag>
                      <ui-tag v-if="item.difficulty" :type="difficultyTagType(item.difficulty)" size="small" effect="plain">
                        {{ difficultyLabel(item.difficulty) }}
                      </ui-tag>
                    </div>

                    <div class="question-meta">
                      <span>错误 {{ item.wrongCount }} 次</span>
                      <span v-if="item.errorCategory">{{ errorCategoryLabel(item.errorCategory) }}</span>
                      <span v-if="item.offeringTitle">{{ item.offeringTitle }}</span>
                      <span v-if="item.lastWrongAt">最后错误 {{ formatTime(item.lastWrongAt) }}</span>
                    </div>

                    <div v-if="item.notes" class="question-note">{{ item.notes }}</div>
                  </div>

                  <div class="question-actions">
                    <ui-button type="primary" size="small" @click="practiceItem(item)">{{ practiceActionLabel(item) }}</ui-button>
                    <template v-if="item.kind === 'notebook'">
                      <ui-button size="small" @click="openNoteEditor(item.row)">笔记</ui-button>
                      <ui-button v-if="!item.resolved" size="small" plain @click="markResolved(item.row)">标记掌握</ui-button>
                      <ui-button size="small" plain @click="removeRow(item.row)">移除</ui-button>
                    </template>
                  </div>
                </article>
              </div>
            </ui-card>
          </div>
        </div>

        <div v-else class="empty-box">
          <ui-empty description="当前筛选范围内没有错题知识点" :image-size="110">
            <ui-button type="primary" @click="resetFilters">查看全部错题</ui-button>
          </ui-empty>
        </div>
      </div>
    </loading-state>

    <ui-dialog v-model="noteDialog.visible" title="错题笔记" width="520px">
      <ui-input v-model="noteDialog.value" type="textarea" :rows="6" placeholder="记录坑点、错误原因和正确思路……" />
      <template #footer>
        <ui-button @click="noteDialog.visible = false">取消</ui-button>
        <ui-button type="primary" :loading="noteDialog.saving" @click="saveNote">保存</ui-button>
      </template>
    </ui-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message as uiMessage, messageBox } from '@/services/feedback'
import { wrongNotebookApi } from '@/api/wrongNotebook'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const rows = ref([])
const ptaErrors = ref([])
const ptaErrorState = ref('idle')
const selectedKnowledgeKey = ref('')
const activeTab = ref('unresolved')

const stats = reactive({
  total: 0,
  unresolved: 0,
  resolved: 0,
  byDifficulty: {},
  byErrorCategory: {}
})

const filters = reactive({
  sourceType: '',
  errorCategory: '',
  difficulty: '',
  q: ''
})

const noteDialog = reactive({
  visible: false,
  saving: false,
  id: null,
  value: ''
})

const errorCategoryOptions = [
  { label: '答案错误', value: 'WRONG_ANSWER' },
  { label: '编译错误', value: 'COMPILE_ERROR' },
  { label: '运行错误', value: 'RUNTIME_ERROR' },
  { label: '超时', value: 'TIME_LIMIT_EXCEEDED' },
  { label: '内存超限', value: 'MEMORY_LIMIT_EXCEEDED' },
  { label: '其他', value: 'UNKNOWN' }
]

function normalizedText(value) {
  return String(value || '').trim().toLocaleLowerCase()
}

function splitKnowledgePoints(value) {
  const raw = Array.isArray(value) ? value : [value]
  return [...new Set(raw.flatMap(item => String(item || '').split(/[;,，、|>]+/))
    .map(item => item.trim())
    .filter(Boolean))]
}

function notebookKnowledgePoints(row) {
  const tags = splitKnowledgePoints(row.tagsCached)
  return tags.length ? tags : ['其他错题']
}

function ptaKnowledgePoints(item) {
  const points = splitKnowledgePoints(item.knowledge_point || item.knowledge_leaf)
  if (points.length) return points
  const path = splitKnowledgePoints(item.knowledge_path)
  if (path.length) return [path[path.length - 1]]
  return [item.offering_title || '其他错题']
}

function findMatchingPtaError(row) {
  if (row?.sourceType !== 'PTA_SYNCED') return null
  const candidates = [normalizedText(row.problemTitle), normalizedText(row.problemSlug)].filter(Boolean)
  return ptaErrors.value.find(item => {
    const itemKeys = [normalizedText(item.problem_title), normalizedText(item.source_problem_id)].filter(Boolean)
    return candidates.some(candidate => itemKeys.includes(candidate))
  }) || null
}

const filteredNotebookRows = computed(() => {
  const query = normalizedText(filters.q)
  if (!query) return rows.value
  return rows.value.filter(row => {
    const ptaMatch = findMatchingPtaError(row)
    return [
      row.problemTitle,
      row.tagsCached,
      ptaMatch?.knowledge_point,
      ptaMatch?.knowledge_path,
      ptaMatch?.offering_title
    ].some(value => normalizedText(value).includes(query))
  })
})

const filteredPtaErrors = computed(() => {
  if (activeTab.value === 'resolved' || filters.sourceType === 'LEETCODE_PRACTICE') return []
  if (filters.errorCategory && filters.errorCategory !== 'WRONG_ANSWER' && filters.errorCategory !== 'UNKNOWN') return []
  const query = normalizedText(filters.q)
  return ptaErrors.value.filter(item => {
    if (filters.difficulty && normalizedText(difficultyLabel(item.difficulty_label)) !== normalizedText(difficultyLabel(filters.difficulty))) return false
    if (!query) return true
    return [item.problem_title, item.offering_title, item.knowledge_point, item.knowledge_path]
      .some(value => normalizedText(value).includes(query))
  })
})

const knowledgeGroups = computed(() => {
  const groups = new Map()
  const addItem = (knowledgeName, item) => {
    const name = String(knowledgeName || '').trim()
    if (!name) return
    const key = normalizedText(name)
    if (!groups.has(key)) {
      groups.set(key, { key, name, items: [] })
    }
    const group = groups.get(key)
    if (!group.items.some(existing => existing.key === item.key)) group.items.push(item)
  }

  for (const row of filteredNotebookRows.value) {
    const matchedPtaError = findMatchingPtaError(row)
    const item = {
      key: `notebook-${row.id}`,
      kind: 'notebook',
      row,
      title: row.problemTitle || `题目 ${row.problemId}`,
      sourceType: row.sourceType || 'LEETCODE_PRACTICE',
      wrongCount: Number(row.totalWrongCount || 0),
      resolved: !!row.resolved,
      difficulty: row.difficulty,
      errorCategory: row.errorCategory,
      lastWrongAt: row.lastWrongAt,
      notes: row.notes,
      problemId: row.problemId,
      offeringTitle: matchedPtaError?.offering_title
    }
    const points = matchedPtaError ? ptaKnowledgePoints(matchedPtaError) : notebookKnowledgePoints(row)
    points.forEach(point => addItem(point, item))
  }

  const notebookPtaKeys = new Set(filteredNotebookRows.value
    .filter(row => row.sourceType === 'PTA_SYNCED')
    .flatMap(row => [normalizedText(row.problemTitle), normalizedText(row.problemSlug)].filter(Boolean)))

  for (const raw of filteredPtaErrors.value) {
    const rawKeys = [normalizedText(raw.problem_title), normalizedText(raw.source_problem_id)].filter(Boolean)
    if (rawKeys.some(key => notebookPtaKeys.has(key))) continue
    const item = {
      key: `pta-${raw.offering_id || 'x'}-${raw.problem_id}`,
      kind: 'pta',
      raw,
      title: raw.problem_title || `PTA 题目 #${raw.source_problem_id || raw.problem_id}`,
      sourceType: 'PTA_SYNCED',
      wrongCount: Number(raw.error_count || 0),
      resolved: false,
      difficulty: raw.difficulty_label,
      offeringTitle: raw.offering_title,
      problemId: raw.problem_id
    }
    ptaKnowledgePoints(raw).forEach(point => addItem(point, item))
  }

  return [...groups.values()].map(group => {
    const items = group.items.slice().sort((a, b) => Number(a.resolved) - Number(b.resolved) || b.wrongCount - a.wrongCount)
    const resolvedCount = items.filter(item => item.resolved).length
    const unresolvedCount = items.length - resolvedCount
    return {
      ...group,
      items,
      wrongCount: items.reduce((sum, item) => sum + item.wrongCount, 0),
      resolvedCount,
      unresolvedCount,
      progress: items.length ? Math.round((resolvedCount / items.length) * 100) : 0,
      ptaCount: items.filter(item => item.sourceType === 'PTA_SYNCED').length,
      leetcodeCount: items.filter(item => item.sourceType !== 'PTA_SYNCED').length
    }
  }).filter(group => group.items.length > 0)
    .sort((a, b) => b.unresolvedCount - a.unresolvedCount || b.wrongCount - a.wrongCount || a.name.localeCompare(b.name, 'zh-CN'))
})

const selectedGroup = computed(() => {
  return knowledgeGroups.value.find(group => group.key === selectedKnowledgeKey.value) || knowledgeGroups.value[0] || null
})

const visibleItems = computed(() => {
  const items = new Map()
  knowledgeGroups.value.forEach(group => group.items.forEach(item => items.set(item.key, item)))
  return [...items.values()]
})

const standalonePtaCount = computed(() => {
  const notebookPtaKeys = new Set(rows.value
    .filter(row => row.sourceType === 'PTA_SYNCED')
    .flatMap(row => [normalizedText(row.problemTitle), normalizedText(row.problemSlug)].filter(Boolean)))
  return ptaErrors.value.filter(item => {
    const keys = [normalizedText(item.problem_title), normalizedText(item.source_problem_id)].filter(Boolean)
    return !keys.some(key => notebookPtaKeys.has(key))
  }).length
})

const statusCounts = computed(() => ({
  total: Number(stats.total || 0) + standalonePtaCount.value,
  unresolved: Number(stats.unresolved || 0) + standalonePtaCount.value,
  resolved: Number(stats.resolved || 0)
}))

const summaryCards = computed(() => [
  { label: '当前错题', value: visibleItems.value.length, tip: '当前筛选范围内', color: 'var(--app-text)' },
  { label: '待攻克', value: visibleItems.value.filter(item => !item.resolved).length, tip: '可直接开始回炉', color: 'var(--app-danger)' },
  { label: '错题知识点', value: knowledgeGroups.value.length, tip: '零错题知识点已隐藏', color: 'var(--app-primary)' },
  { label: 'PTA 错题', value: visibleItems.value.filter(item => item.sourceType === 'PTA_SYNCED').length, tip: '来自 PTA 提交与知识点元数据', color: 'var(--app-warning)' }
])

watch(knowledgeGroups, (groups) => {
  if (!groups.some(group => group.key === selectedKnowledgeKey.value)) {
    selectedKnowledgeKey.value = groups[0]?.key || ''
  }
}, { immediate: true })

function buildQueryParams(pageIndex = 0) {
  const params = { page: pageIndex, size: 100, sort: 'lastWrongAt', direction: 'desc' }
  if (activeTab.value === 'unresolved') params.resolved = false
  if (activeTab.value === 'resolved') params.resolved = true
  if (filters.sourceType) params.sourceType = filters.sourceType
  if (filters.errorCategory) params.errorCategory = filters.errorCategory
  if (filters.difficulty) params.difficulty = filters.difficulty
  return params
}

async function reloadList(manageLoading = true) {
  if (manageLoading) loading.value = true
  try {
    const collected = []
    let pageIndex = 0
    let total = 0
    do {
      const payload = await wrongNotebookApi.list(buildQueryParams(pageIndex))
      const data = payload?.data ?? payload
      const content = Array.isArray(data?.content) ? data.content : []
      collected.push(...content)
      total = Number(data?.totalElements ?? collected.length)
      pageIndex += 1
      if (!content.length) break
    } while (collected.length < total && pageIndex < 10)
    rows.value = collected
  } catch (error) {
    rows.value = []
    uiMessage.error(error?.friendlyMessage || error?.message || '加载错题列表失败')
  } finally {
    if (manageLoading) loading.value = false
  }
}

async function loadStats() {
  try {
    const payload = await wrongNotebookApi.stats()
    const data = payload?.data ?? payload
    stats.total = Number(data?.total ?? 0)
    stats.unresolved = Number(data?.unresolved ?? 0)
    stats.resolved = Number(data?.resolved ?? 0)
    stats.byDifficulty = data?.byDifficulty || {}
    stats.byErrorCategory = data?.byErrorCategory || {}
  } catch {
    // 统计失败不阻断错题列表。
  }
}

async function loadPtaErrors() {
  ptaErrorState.value = 'loading'
  try {
    const classId = userStore.selectedClass?.id ?? userStore.selectedClass?.classId
    const response = await wrongNotebookApi.ptaErrors({
      minErrors: 1,
      ...(classId ? { classId } : {})
    })
    const data = response?.data ?? response ?? {}
    ptaErrors.value = Array.isArray(data.items) ? data.items : []
    ptaErrorState.value = 'loaded'
  } catch {
    ptaErrors.value = []
    ptaErrorState.value = 'error'
  }
}

async function loadAll() {
  loading.value = true
  try {
    await Promise.all([reloadList(false), loadStats(), loadPtaErrors()])
  } finally {
    loading.value = false
  }
}

function selectKnowledge(key) {
  selectedKnowledgeKey.value = key
}

function onTabChange() {
  reloadList()
}

function resetFilters() {
  activeTab.value = 'unresolved'
  filters.sourceType = ''
  filters.errorCategory = ''
  filters.difficulty = ''
  filters.q = ''
  reloadList()
}

function startGroupTraining(group) {
  const item = group.items.find(candidate => !candidate.resolved) || group.items[0]
  if (!item) return
  practiceItem(item)
}

function practiceItem(item) {
  if (item.kind === 'pta') {
    ptaPractice(item.raw)
    return
  }
  practice(item.row)
}

function practiceActionLabel(item) {
  if (item?.kind !== 'pta') return '开始回炉'
  return hasPtaDirectUrl(item.raw) ? '前往 PTA 作答' : '查看原实验'
}

function hasPtaDirectUrl(item) {
  return /^\d+$/.test(String(item?.pta_problem_set_id || '').trim())
    && /^\d+$/.test(String(item?.source_problem_id || '').trim())
}

function practice(row) {
  if (!row?.problemId) {
    uiMessage.warning('该题目缺少 problemId，无法跳转')
    return
  }
  router.push({
    path: `/student/leetcode-practice/${row.problemId}`,
    query: { from: 'notebook', notebookId: row.id }
  })
}

function ptaPractice(item) {
  const problemSetId = String(item?.pta_problem_set_id || '').trim()
  const sourceProblemId = String(item?.source_problem_id || '').trim()
  if (hasPtaDirectUrl(item)) {
    const url = `https://pintia.cn/problem-sets/${encodeURIComponent(problemSetId)}/exam/problems/${encodeURIComponent(sourceProblemId)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  if (item?.offering_id) {
    router.push({
      path: `/student/experiment-detail/${item.offering_id}`,
      query: { problemNo: item.problem_no || sourceProblemId || undefined }
    })
    return
  }
  router.push('/student/experiments')
}

async function markResolved(row) {
  try {
    await messageBox.confirm('确定要把这道题标记为已掌握吗？', '提示', {
      confirmButtonText: '标记', cancelButtonText: '取消', type: 'warning'
    })
  } catch {
    return
  }
  try {
    await wrongNotebookApi.retry(row.id, { judgeStatus: 'ACCEPTED', code: null, runtimeMs: null, memoryKb: null })
    await wrongNotebookApi.retry(row.id, { judgeStatus: 'ACCEPTED', code: null, runtimeMs: null, memoryKb: null })
    uiMessage.success('已标记为已掌握')
    await loadAll()
  } catch (error) {
    uiMessage.error(error?.friendlyMessage || error?.message || '标记失败')
  }
}

async function removeRow(row) {
  try {
    await messageBox.confirm('确定要从错题本中移除这道题吗？', '提示', {
      confirmButtonText: '移除', cancelButtonText: '取消', type: 'warning'
    })
  } catch {
    return
  }
  try {
    await wrongNotebookApi.remove(row.id)
    uiMessage.success('已移除')
    await loadAll()
  } catch (error) {
    uiMessage.error(error?.friendlyMessage || error?.message || '移除失败')
  }
}

function openNoteEditor(row) {
  noteDialog.id = row.id
  noteDialog.value = row.notes || ''
  noteDialog.visible = true
}

async function saveNote() {
  if (!noteDialog.id) return
  noteDialog.saving = true
  try {
    await wrongNotebookApi.updateNote(noteDialog.id, noteDialog.value || '')
    uiMessage.success('笔记已保存')
    noteDialog.visible = false
    await reloadList()
  } catch (error) {
    uiMessage.error(error?.friendlyMessage || error?.message || '保存失败')
  } finally {
    noteDialog.saving = false
  }
}

function difficultyLabel(value) {
  if (!value) return ''
  if (/easy|简单/i.test(value)) return '简单'
  if (/medium|中等/i.test(value)) return '中等'
  if (/hard|困难/i.test(value)) return '困难'
  return value
}

function difficultyTagType(value) {
  const label = difficultyLabel(value)
  if (label === '简单') return 'success'
  if (label === '中等') return 'warning'
  if (label === '困难') return 'danger'
  return 'info'
}

function errorCategoryLabel(code) {
  return {
    WRONG_ANSWER: '答案错误',
    COMPILE_ERROR: '编译错误',
    RUNTIME_ERROR: '运行错误',
    TIME_LIMIT_EXCEEDED: '超时',
    MEMORY_LIMIT_EXCEEDED: '内存超限',
    UNKNOWN: '其他'
  }[code] || code || ''
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const diff = Date.now() - date.getTime()
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(loadAll)
</script>

<style scoped>
.wrong-notebook-page,
.notebook-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
}

.summary-card :deep(.ui-card__body) {
  padding: 18px;
}

.summary-value {
  font-size: 26px;
  font-weight: 700;
}

.summary-label {
  margin-top: 5px;
  color: var(--app-text);
  font-size: 13px;
  font-weight: 600;
}

.summary-tip {
  margin-top: 4px;
  color: var(--app-text-secondary);
  font-size: 11px;
}

.filter-card,
.knowledge-sidebar,
.question-panel {
  border: 1px solid var(--app-border);
  border-radius: 18px;
  background: var(--app-surface);
}

.filter-card :deep(.ui-card__body) {
  padding: 18px;
}

.filter-head,
.filter-content,
.panel-head,
.knowledge-item__top,
.question-title-row,
.question-actions,
.source-tags {
  display: flex;
  align-items: center;
}

.filter-head,
.panel-head,
.knowledge-item__top {
  justify-content: space-between;
  gap: 12px;
}

.filter-title {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 700;
}

.filter-desc,
.panel-head span {
  margin-top: 3px;
  color: var(--app-text-secondary);
  font-size: 11px;
}

.filter-content {
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--app-border);
}

.status-tabs,
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-tabs :deep(.ui-radio-button__inner) {
  min-width: 82px;
  padding: 8px 14px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  background: var(--app-surface);
  color: var(--app-text-secondary);
  box-shadow: none;
}

.status-tabs :deep(.ui-radio-button__orig-radio:checked + .ui-radio-button__inner) {
  border-color: var(--app-primary);
  background: var(--app-primary);
  color: #fff;
  box-shadow: none;
}

.status-tabs :deep(.ui-radio-button:first-child .ui-radio-button__inner),
.status-tabs :deep(.ui-radio-button:last-child .ui-radio-button__inner) {
  border-radius: 999px;
}

.toolbar-control {
  width: 140px;
}

.toolbar-search {
  width: 230px;
}

.knowledge-layout {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.knowledge-sidebar :deep(.ui-card__header),
.question-panel :deep(.ui-card__header) {
  padding: 16px 18px;
}

.panel-head > div:first-child {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel-head strong {
  color: var(--app-text);
  font-size: 15px;
}

.knowledge-list,
.question-list,
.knowledge-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge-item {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background: var(--app-surface);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}

.knowledge-item:hover,
.knowledge-item.active {
  border-color: var(--app-primary);
  background: var(--app-primary-soft);
}

.knowledge-item.active {
  box-shadow: inset 3px 0 0 var(--app-primary);
}

.knowledge-name {
  overflow: hidden;
  color: var(--app-text);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.knowledge-count,
.knowledge-meta {
  color: var(--app-text-secondary);
  font-size: 11px;
}

.knowledge-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.knowledge-progress {
  height: 5px;
  margin-top: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--app-border);
}

.knowledge-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--app-success);
}

.focus-banner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 22px;
  align-items: center;
  padding: 20px 22px;
  border: 1px solid color-mix(in srgb, var(--app-primary) 30%, var(--app-border));
  border-left: 5px solid var(--app-primary);
  border-radius: 16px;
  background: var(--app-primary-soft);
}

.focus-copy h2 {
  margin: 5px 0;
  color: var(--app-text);
  font-size: 22px;
}

.focus-copy p {
  margin: 0;
  color: var(--app-text-secondary);
  font-size: 12px;
}

.focus-eyebrow {
  color: var(--app-primary-strong);
  font-size: 11px;
  font-weight: 700;
}

.focus-stats {
  display: flex;
  gap: 18px;
}

.focus-stats div {
  display: flex;
  min-width: 64px;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.focus-stats span {
  color: var(--app-text-secondary);
  font-size: 10px;
}

.focus-stats strong {
  color: var(--app-text);
  font-size: 22px;
}

.source-tags,
.question-title-row,
.question-actions {
  flex-wrap: wrap;
  gap: 7px;
}

.question-card {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 15px 16px;
  border: 1px solid var(--app-border);
  border-radius: 14px;
  background: var(--app-surface);
}

.question-main {
  min-width: 0;
  flex: 1;
}

.question-title {
  overflow: hidden;
  color: var(--app-text);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 8px;
  color: var(--app-text-secondary);
  font-size: 11px;
}

.question-note {
  margin-top: 9px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--app-surface-muted);
  color: var(--app-text-secondary);
  font-size: 12px;
  white-space: pre-wrap;
}

.question-actions {
  align-content: flex-start;
  justify-content: flex-end;
  min-width: 110px;
}

.empty-box {
  padding: 30px;
  border: 1px dashed var(--app-border);
  border-radius: 16px;
  background: var(--app-surface-muted);
}

.warm-normal-button,
.filter-reset-button {
  border-color: var(--app-border);
  background: var(--app-surface);
  color: var(--app-primary);
  font-weight: 600;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-content,
  .focus-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-content {
    display: flex;
  }

  .focus-banner {
    display: flex;
  }
}

@media (max-width: 900px) {
  .knowledge-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .knowledge-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .summary-grid,
  .knowledge-list {
    grid-template-columns: minmax(0, 1fr);
  }

  .filter-head,
  .question-card {
    flex-direction: column;
  }

  .toolbar-control,
  .toolbar-search,
  .filter-reset-button {
    width: 100%;
  }

  .question-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
