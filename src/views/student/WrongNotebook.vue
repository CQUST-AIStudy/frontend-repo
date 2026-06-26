<template>
  <div class="page [display:flex] [flex-direction:column] [gap:20px]">
    <UiPageHeader title="错题本">
      <div class="[color:#475569] [font-size:13px] [margin-top:2px]">
        自动收集每次错误;连续两次 AC 标记为已掌握
      </div>
      <div class="[display:flex] [gap:10px] [margin-top:10px] [flex-wrap:wrap]">
        <ui-button :loading="loading" @click="loadAll">刷新</ui-button>
      </div>
    </UiPageHeader>

    <loading-state :loading="loading">
      <div class="content [display:flex] [flex-direction:column] [gap:20px]">
        <div class="summary-grid [display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:16px] max-[1200px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[760px]:[grid-template-columns:1fr]">
          <ui-card v-for="item in summaryCards" :key="item.label" class="summary-card [&_.ui-card__body]:[padding:18px]" shadow="hover">
            <div class="[display:flex] [flex-direction:column] [gap:6px]">
              <div class="summary-value [font-size:26px] [font-weight:700]" :style="{ color: item.color }">{{ item.value }}</div>
              <div class="summary-label [color:#475569] [font-size:13px]">{{ item.label }}</div>
              <div class="summary-tip [color:#94a3b8] [font-size:12px]">{{ item.tip }}</div>
            </div>
          </ui-card>
        </div>

        <ui-card shadow="hover" class="[border-radius:18px] [border:1px_solid_#e7edf4]">
          <template #header>
            <div class="[display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [flex-wrap:wrap]">
              <ui-radio-group v-model="activeTab" @change="onTabChange">
                <ui-radio-button label="all">全部 {{ stats.total || 0 }}</ui-radio-button>
                <ui-radio-button label="unresolved">待攻克 {{ stats.unresolved || 0 }}</ui-radio-button>
                <ui-radio-button label="resolved">已掌握 {{ stats.resolved || 0 }}</ui-radio-button>
              </ui-radio-group>
              <div class="[display:flex] [gap:8px] [flex-wrap:wrap]">
                <ui-select v-model="filters.difficulty" placeholder="难度" clearable size="small" style="width:120px" @change="reloadList">
                  <ui-option label="简单" value="Easy" />
                  <ui-option label="中等" value="Medium" />
                  <ui-option label="困难" value="Hard" />
                </ui-select>
                <ui-select v-model="filters.errorCategory" placeholder="错误类型" clearable size="small" style="width:160px" @change="reloadList">
                  <ui-option v-for="opt in errorCategoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </ui-select>
                <ui-select v-model="filters.sourceType" placeholder="来源" clearable size="small" style="width:140px" @change="reloadList">
                  <ui-option label="LeetCode" value="LEETCODE_PRACTICE" />
                  <ui-option label="PTA" value="PTA_SYNCED" />
                </ui-select>
                <ui-input v-model="filters.tag" placeholder="标签筛选" clearable size="small" style="width:140px" @change="reloadList" />
                <ui-input v-model="filters.q" placeholder="题目关键词" clearable size="small" style="width:180px" @change="reloadList" />
              </div>
            </div>
          </template>

          <div v-if="rows.length" class="list [display:flex] [flex-direction:column] [gap:14px]">
            <div
              v-for="row in rows"
              :key="row.id"
              class="row-card [background:#fff] [border:1px_solid_#e8eef6] [border-radius:16px] [padding:16px] [transition:.2s] hover:[border-color:#cbd5e1] hover:[box-shadow:0_8px_20px_rgba(15,_23,_42,_0.06)]"
            >
              <div class="[display:flex] [justify-content:space-between] [align-items:flex-start] [gap:12px] [flex-wrap:wrap]">
                <div class="[min-width:0] [flex:1]">
                  <div class="[display:flex] [align-items:center] [gap:8px] [flex-wrap:wrap] [margin-bottom:6px]">
                    <span class="title [color:#0f172a] [font-size:16px] [font-weight:700]">{{ row.problemTitle }}</span>
                    <ui-tag v-if="row.difficulty" :type="difficultyTagType(row.difficulty)" size="small" effect="plain">
                      {{ difficultyLabel(row.difficulty) }}
                    </ui-tag>
                    <ui-tag v-if="row.errorCategory" :type="errorCategoryTagType(row.errorCategory)" size="small">
                      {{ errorCategoryLabel(row.errorCategory) }}
                    </ui-tag>
                    <ui-tag size="small" effect="plain" :type="row.sourceType === 'PTA_SYNCED' ? 'info' : 'success'">
                      {{ row.sourceType === 'PTA_SYNCED' ? 'PTA' : 'LeetCode' }}
                    </ui-tag>
                    <ui-tag v-if="row.resolved" type="success" size="small">已掌握</ui-tag>
                  </div>
                  <div class="muted [color:#64748b] [font-size:12px] [display:flex] [gap:10px] [flex-wrap:wrap]">
                    <span>错误 {{ row.totalWrongCount }} 次</span>
                    <span>·</span>
                    <span>连续 AC {{ row.consecutiveAcCount }}/2</span>
                    <span>·</span>
                    <span>最后错误 {{ formatTime(row.lastWrongAt) }}</span>
                    <template v-if="row.tagsCached">
                      <span>·</span>
                      <span class="tags">标签: {{ row.tagsCached }}</span>
                    </template>
                  </div>
                  <div v-if="row.notes" class="notes [margin-top:8px] [padding:8px_10px] [background:#f8fafc] [border-radius:8px] [color:#334155] [font-size:13px] [white-space:pre-wrap]">{{ row.notes }}</div>
                </div>
                <div class="actions [display:flex] [flex-direction:column] [gap:6px] [align-items:stretch] [min-width:140px]">
                  <ui-button type="primary" size="small" @click="practice(row)">去练习</ui-button>
                  <ui-button size="small" @click="openNoteEditor(row)">笔记</ui-button>
                  <ui-button v-if="!row.resolved" size="small" plain @click="markResolved(row)">标记已掌握</ui-button>
                  <ui-button size="small" plain @click="removeRow(row)">移除</ui-button>
                </div>
              </div>

              <div v-if="row.lastWrongCode && expandedRowId === row.id" class="code-block [margin-top:10px] [background:#0f172a] [color:#e2e8f0] [border-radius:8px] [padding:10px_12px] [max-height:240px] [overflow:auto] [font-size:12px] [font-family:ui-monospace,SFMono-Regular,Menlo,monospace] [white-space:pre]">{{ row.lastWrongCode }}</div>
            </div>

            <div class="pager [display:flex] [justify-content:center] [padding-top:10px]">
              <ui-pagination
                v-model:current-page="page.current"
                v-model:page-size="page.size"
                :total="page.total"
                :page-sizes="[10, 20, 50]"
                layout="prev, pager, next, sizes, total"
                @current-change="reloadList"
                @size-change="onSizeChange"
              />
            </div>
          </div>
          <ui-empty v-else description="还没有错题记录,继续练习吧" :image-size="120" />
        </ui-card>
      </div>
    </loading-state>

    <ui-dialog v-model="noteDialog.visible" title="笔记" width="520px">
      <ui-input v-model="noteDialog.value" type="textarea" :rows="6" placeholder="记下你对这道题的反思、坑点、解题思路..." />
      <template #footer>
        <ui-button @click="noteDialog.visible = false">取消</ui-button>
        <ui-button type="primary" :loading="noteDialog.saving" @click="saveNote">保存</ui-button>
      </template>
    </ui-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message as uiMessage, messageBox } from '@/services/feedback'
import { wrongNotebookApi } from '@/api/wrongNotebook'

const router = useRouter()
const loading = ref(false)
const rows = ref([])
const stats = reactive({ total: 0, unresolved: 0, resolved: 0, byDifficulty: {}, byErrorCategory: {} })

const activeTab = ref('unresolved')
const filters = reactive({
  resolved: false,
  sourceType: '',
  errorCategory: '',
  difficulty: '',
  tag: '',
  q: ''
})
const page = reactive({ current: 1, size: 20, total: 0 })

const expandedRowId = ref(null)

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

const summaryCards = computed(() => [
  { label: '错题总数', value: stats.total || 0, tip: '所有进入错题本的题目', color: '#0f172a' },
  { label: '待攻克', value: stats.unresolved || 0, tip: '尚未连续 AC 两次', color: '#dc2626' },
  { label: '已掌握', value: stats.resolved || 0, tip: '连续 AC 两次后自动标记', color: '#16a34a' },
  { label: '错误类型数', value: Object.keys(stats.byErrorCategory || {}).length, tip: '覆盖的错误分类', color: '#2563eb' }
])

function difficultyLabel(d) {
  if (!d) return ''
  if (/easy/i.test(d)) return '简单'
  if (/medium/i.test(d)) return '中等'
  if (/hard/i.test(d)) return '困难'
  return d
}
function difficultyTagType(d) {
  if (/easy/i.test(d)) return 'success'
  if (/medium/i.test(d)) return 'warning'
  if (/hard/i.test(d)) return 'danger'
  return 'info'
}
function errorCategoryLabel(code) {
  const map = {
    WRONG_ANSWER: '答案错误',
    COMPILE_ERROR: '编译错误',
    RUNTIME_ERROR: '运行错误',
    TIME_LIMIT_EXCEEDED: '超时',
    MEMORY_LIMIT_EXCEEDED: '内存超限',
    UNKNOWN: '其他'
  }
  return map[code] || code || ''
}
function errorCategoryTagType(code) {
  if (code === 'WRONG_ANSWER') return 'danger'
  if (code === 'COMPILE_ERROR') return 'warning'
  if (code === 'RUNTIME_ERROR') return 'info'
  if (code === 'TIME_LIMIT_EXCEEDED') return 'warning'
  if (code === 'MEMORY_LIMIT_EXCEEDED') return 'warning'
  return 'info'
}

function formatTime(value) {
  if (!value) return '未知'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildQueryParams() {
  const params = {
    page: Math.max(0, page.current - 1),
    size: page.size,
    sort: 'lastWrongAt',
    direction: 'desc'
  }
  if (activeTab.value === 'unresolved') params.resolved = false
  else if (activeTab.value === 'resolved') params.resolved = true
  if (filters.sourceType) params.sourceType = filters.sourceType
  if (filters.errorCategory) params.errorCategory = filters.errorCategory
  if (filters.difficulty) params.difficulty = filters.difficulty
  if (filters.tag) params.tag = filters.tag
  if (filters.q) params.q = filters.q
  return params
}

async function reloadList() {
  loading.value = true
  try {
    const payload = await wrongNotebookApi.list(buildQueryParams())
    const data = payload?.data ?? payload
    rows.value = Array.isArray(data?.content) ? data.content : []
    page.total = Number(data?.totalElements ?? rows.value.length)
  } catch (err) {
    uiMessage.error(err?.friendlyMessage || err?.message || '加载错题列表失败')
    rows.value = []
    page.total = 0
  } finally {
    loading.value = false
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
  } catch (err) {
    // silent: stats are decorative
  }
}

async function loadAll() {
  loading.value = true
  await Promise.all([reloadList(), loadStats()])
  loading.value = false
}

function onTabChange() {
  page.current = 1
  reloadList()
}

function onSizeChange(size) {
  page.size = size
  page.current = 1
  reloadList()
}

function practice(row) {
  if (!row?.problemId) {
    uiMessage.warning('该题目缺少 problemId,无法跳转')
    return
  }
  router.push({
    path: `/student/leetcode-practice/${row.problemId}`,
    query: { from: 'notebook', notebookId: row.id }
  })
}

async function markResolved(row) {
  try {
    await messageBox.confirm('确定要把这道题标记为已掌握吗?', '提示', {
      confirmButtonText: '标记',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    await wrongQuestionRetryAsResolve(row)
    uiMessage.success('已标记为已掌握')
    await loadAll()
  } catch (err) {
    uiMessage.error(err?.friendlyMessage || err?.message || '标记失败')
  }
}

async function wrongQuestionRetryAsResolve(row) {
  // The endpoint requires judgeStatus; we simulate two AC retries idempotently.
  // The service is idempotent: only one streak++ happens per call.
  await wrongNotebookApi.retry(row.id, {
    judgeStatus: 'ACCEPTED',
    code: null,
    runtimeMs: null,
    memoryKb: null
  })
  const fresh = await wrongNotebookApi.retry(row.id, {
    judgeStatus: 'ACCEPTED',
    code: null,
    runtimeMs: null,
    memoryKb: null
  })
  return fresh
}

async function removeRow(row) {
  try {
    await messageBox.confirm('确定要从错题本中移除这道题吗?(已掌握状态会保留,可再次添加)', '提示', {
      confirmButtonText: '移除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    await wrongNotebookApi.remove(row.id)
    uiMessage.success('已移除')
    await loadAll()
  } catch (err) {
    uiMessage.error(err?.friendlyMessage || err?.message || '移除失败')
  }
}

function openNoteEditor(row) {
  noteDialog.id = row.id
  noteDialog.value = row.notes || ''
  noteDialog.visible = true
}

async function saveNote() {
  if (!noteDialog.id) {
    noteDialog.visible = false
    return
  }
  noteDialog.saving = true
  try {
    await wrongNotebookApi.updateNote(noteDialog.id, noteDialog.value || '')
    uiMessage.success('笔记已保存')
    noteDialog.visible = false
    await reloadList()
  } catch (err) {
    uiMessage.error(err?.friendlyMessage || err?.message || '保存失败')
  } finally {
    noteDialog.saving = false
  }
}

onMounted(() => {
  // Default to the unresolved tab to surface actionable items first.
  activeTab.value = 'unresolved'
  filters.resolved = false
  loadAll()
})
</script>

<style scoped>
.page {
  min-height: 100%;
}
</style>
