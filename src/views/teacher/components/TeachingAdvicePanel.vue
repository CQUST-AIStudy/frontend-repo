<template>
  <section class="rounded-[20px] border border-black/[0.06] bg-white/95 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
    <div class="flex flex-col gap-4 border-b border-black/[0.06] pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 class="text-base font-semibold text-[#1d1d1f]">可信教学建议</h2>
        <p class="mt-1 text-xs leading-5 text-[#6e6e73]">建议仅使用后端整理的数据快照，并保留指标证据与生成记录</p>
      </div>
      <UiButton
        :disabled="generating || !canGenerate"
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-[var(--app-primary)] hover:bg-[var(--app-primary-strong)] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
        @click="generateReport"
      >
        {{ generating ? '生成中...' : '生成并保存建议' }}
      </UiButton>
    </div>

    <div class="mt-5 flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="inline-flex h-10 items-center rounded-[10px] bg-[#f1f3f5] p-1" aria-label="建议分析层级">
          <button
            v-for="item in scopeOptions"
            :key="item.value"
            type="button"
            class="h-8 min-w-[88px] rounded-[7px] border-none px-3 text-sm font-medium transition-colors"
            :class="scopeLevel === item.value ? 'bg-white text-[#1d1d1f] shadow-[0_1px_4px_rgba(0,0,0,0.12)]' : 'bg-transparent text-[#6e6e73] hover:text-[#1d1d1f]'"
            @click="scopeLevel = item.value"
          >
            {{ item.label }}
          </button>
        </div>

        <UiSelect
          v-if="scopeLevel === 'EXPERIMENT'"
          v-model="experimentId"
          placeholder="选择实验"
          class="h-10 min-w-[240px] rounded-[10px] bg-[#f5f5f7] px-3 text-sm"
        >
          <UiOption v-for="item in experiments" :key="item.id" :value="item.id">{{ item.name }}</UiOption>
        </UiSelect>

        <button
          v-if="scopeLevel !== 'EXPERIMENT'"
          type="button"
          role="switch"
          :aria-checked="includeHistory"
          class="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.08] bg-white px-3 text-sm text-[#374151]"
          @click="includeHistory = !includeHistory"
        >
          <span class="relative h-5 w-9 rounded-full transition-colors" :class="includeHistory ? 'bg-[var(--app-primary)]' : 'bg-[#d1d5db]'">
            <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" :class="includeHistory ? 'translate-x-[18px]' : 'translate-x-0.5'"></span>
          </span>
          同课程历史学期
        </button>
      </div>

      <div v-if="errorMessage" class="rounded-[8px] border border-[#f0c4bd] bg-[#fff7f5] px-4 py-3 text-sm text-[#a63d32]">
        {{ errorMessage }}
      </div>

      <div v-if="contextLoading" class="space-y-3 py-4">
        <div v-for="width in [92, 78, 84]" :key="width" class="h-4 rounded bg-[#f1f3f5] animate-pulse" :style="{ width: `${width}%` }"></div>
      </div>

      <template v-else-if="activeData">
        <div class="border-y border-black/[0.06] py-4">
          <div class="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
            <div v-for="item in scopeSummary" :key="item.label" class="min-w-0">
              <div class="text-xs text-[#8a8a8f]">{{ item.label }}</div>
              <div class="mt-1 truncate text-sm font-medium text-[#1d1d1f]" :title="item.value">{{ item.value }}</div>
            </div>
          </div>
          <div v-if="scopeWarnings.length" class="mt-4 space-y-2">
            <div v-for="warning in scopeWarnings" :key="warning" class="rounded-[8px] bg-[#fff8e1] px-3 py-2 text-xs leading-5 text-[#8a5a00]">
              {{ warning }}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 text-xs text-[#6e6e73]">
          <span class="font-medium text-[#1d1d1f]">数据覆盖</span>
          <span>主要数据 {{ dataCoverage.primaryRows || 0 }} 组</span>
          <span>辅助数据 {{ dataCoverage.secondaryRows || 0 }} 组</span>
          <span class="rounded-full px-2 py-1 font-medium" :class="dataCoverage.status === 'AVAILABLE' ? 'bg-[#e9f7ef] text-[#18794e]' : 'bg-[#fff1e8] text-[#a14b12]'">
            {{ dataCoverage.status === 'AVAILABLE' ? '可分析' : '数据不足' }}
          </span>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-[#1d1d1f]">指标证据</h3>
          <div v-if="evidenceRows.length" class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div v-for="item in evidenceRows" :key="item.evidenceId" class="rounded-[8px] border border-black/[0.07] p-4">
              <div class="flex items-start justify-between gap-3">
                <span class="text-sm font-medium text-[#1d1d1f]">{{ item.label }}</span>
                <span class="shrink-0 rounded bg-[#f1f3f5] px-2 py-1 font-mono text-[11px] text-[#5f6368]">{{ item.evidenceId }}</span>
              </div>
              <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <template v-for="field in displayEvidenceFields(item.value)" :key="field.key">
                  <div class="min-w-0">
                    <dt class="truncate text-[11px] text-[#8a8a8f]">{{ field.label }}</dt>
                    <dd class="mt-0.5 truncate text-xs font-medium text-[#374151]" :title="String(field.value)">{{ field.value }}</dd>
                  </div>
                </template>
              </dl>
            </div>
          </div>
          <p v-else class="mt-3 text-sm text-[#8a8a8f]">当前范围尚无可引用指标。</p>
        </div>

        <div v-if="advice" class="border-t border-black/[0.06] pt-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="text-sm font-semibold text-[#1d1d1f]">生成结果</h3>
            <span v-if="activeReport?.createdAt" class="text-xs text-[#8a8a8f]">{{ formatTime(activeReport.createdAt) }}</span>
          </div>
          <p class="mt-3 text-sm leading-7 text-[#374151]">{{ advice.summary }}</p>

          <div v-if="advice.risks?.length" class="mt-5">
            <h4 class="text-xs font-semibold text-[#8a3c34]">风险判断</h4>
            <div class="mt-2 divide-y divide-black/[0.05] border-y border-black/[0.05]">
              <div v-for="risk in advice.risks" :key="`${risk.title}-${risk.level}`" class="flex gap-3 py-3 text-sm">
                <span class="w-16 shrink-0 font-semibold" :class="riskLevelClass(risk.level)">{{ risk.level }}</span>
                <div>
                  <div class="text-[#374151]">{{ risk.title }}</div>
                  <div class="mt-1 text-xs text-[#8a8a8f]">证据：{{ (risk.evidenceRefs || []).join('、') || '无' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="advice.actions?.length" class="mt-5">
            <h4 class="text-xs font-semibold text-[#25603f]">执行建议</h4>
            <ol class="mt-2 space-y-3">
              <li v-for="action in advice.actions" :key="`${action.priority}-${action.action}`" class="grid grid-cols-[28px_1fr] gap-3">
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf6f0] text-xs font-semibold text-[#25603f]">{{ action.priority }}</span>
                <div class="min-w-0 border-b border-black/[0.05] pb-3">
                  <div class="text-sm font-medium leading-6 text-[#1d1d1f]">{{ action.action }}</div>
                  <div class="mt-1 text-xs leading-5 text-[#6e6e73]">对象：{{ action.target }} · 证据：{{ (action.evidenceRefs || []).join('、') || '无' }}</div>
                  <div class="mt-1 text-xs leading-5 text-[#25603f]">验证指标：{{ action.successMetric }}</div>
                </div>
              </li>
            </ol>
          </div>

          <div v-if="advice.limitations?.length" class="mt-5 rounded-[8px] bg-[#f6f7f8] px-4 py-3">
            <div class="text-xs font-semibold text-[#5f6368]">数据限制</div>
            <ul class="mt-2 space-y-1 text-xs leading-5 text-[#6e6e73]">
              <li v-for="item in advice.limitations" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div v-else class="border-t border-black/[0.06] py-8 text-center text-sm text-[#8a8a8f]">
          数据范围已确认，点击“生成并保存建议”获取结构化结果。
        </div>
      </template>

      <div v-else class="py-10 text-center text-sm text-[#8a8a8f]">
        {{ scopeLevel === 'EXPERIMENT' ? '请先选择一个实验。' : '当前班级暂时无法形成分析范围。' }}
      </div>

      <div class="border-t border-black/[0.06] pt-5">
        <h3 class="text-sm font-semibold text-[#1d1d1f]">最近生成记录</h3>
        <div v-if="filteredReports.length" class="mt-3 divide-y divide-black/[0.05]">
          <button
            v-for="report in filteredReports"
            :key="report.id"
            type="button"
            class="flex w-full items-center justify-between gap-4 border-none bg-transparent py-3 text-left hover:bg-[#fafafa]"
            @click="selectReport(report)"
          >
            <div class="min-w-0">
              <div class="truncate text-sm font-medium text-[#374151]">{{ scopeLabel(report.scopeLevel) }} · {{ report.scope?.experimentName || report.scope?.className || report.scope?.courseName }}</div>
              <div class="mt-1 text-xs text-[#8a8a8f]">{{ report.promptVersion }} · {{ report.model || '默认模型' }}</div>
            </div>
            <span class="shrink-0 text-xs text-[#6e6e73]">{{ formatTime(report.createdAt) }}</span>
          </button>
        </div>
        <p v-else class="mt-3 text-sm text-[#8a8a8f]">当前班级暂无历史建议。</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import {
  generateTeachingAdvice,
  getTeachingAdviceContext,
  getTeachingAdviceReports
} from '@/api/tap'

const props = defineProps({
  classId: { type: [String, Number], required: true },
  experiments: { type: Array, default: () => [] }
})

const scopeOptions = [
  { value: 'EXPERIMENT', label: '实验级' },
  { value: 'CLASS', label: '班级级' },
  { value: 'COURSE', label: '课程级' }
]
const scopeLevel = ref('CLASS')
const experimentId = ref('')
const includeHistory = ref(false)
const contextLoading = ref(false)
const generating = ref(false)
const errorMessage = ref('')
const contextData = ref(null)
const activeReport = ref(null)
const reports = ref([])
let contextRequestId = 0

const unwrap = response => response?.data ?? response
const activeData = computed(() => activeReport.value || contextData.value)
const scope = computed(() => activeData.value?.scope || {})
const metrics = computed(() => activeData.value?.metrics || {})
const advice = computed(() => activeReport.value?.advice || null)
const evidenceRows = computed(() => Array.isArray(metrics.value.evidence) ? metrics.value.evidence : [])
const dataCoverage = computed(() => metrics.value.dataCoverage || {})
const scopeWarnings = computed(() => Array.isArray(scope.value.warnings) ? scope.value.warnings : [])
const canGenerate = computed(() => !!props.classId && (scopeLevel.value !== 'EXPERIMENT' || !!experimentId.value))
const filteredReports = computed(() => reports.value.filter(report => String(report.scope?.classId || '') === String(props.classId)).slice(0, 8))
const scopeSummary = computed(() => [
  { label: '课程', value: scope.value.courseName || '待补充' },
  { label: '学期', value: scope.value.termName || '待补充' },
  { label: '教学班', value: scope.value.className || '待补充' },
  { label: '实验', value: scope.value.experimentName || (scopeLevel.value === 'EXPERIMENT' ? '待选择' : '全部实验') }
])

const fieldLabels = {
  className: '班级', experimentCount: '实验数', studentCount: '学生数', completedCount: '完成人数',
  completionRate: '完成率(%)', averageScore: '平均分', problemNo: '题号', title: '题目',
  acceptedCount: '通过人数', acceptanceRate: '通过率(%)', averageAttempts: '平均尝试次数',
  name: '实验', termName: '学期', classCount: '班级数', total: '学生总数', highRisk: '高风险',
  strong: '优秀层', regular: '常规层'
}
const hiddenEvidenceFields = new Set(['evidenceId', 'classId', 'experimentId', 'templateId', 'termId'])

function displayEvidenceFields(value) {
  if (!value || typeof value !== 'object') return []
  return Object.entries(value)
    .filter(([key, fieldValue]) => !hiddenEvidenceFields.has(key) && fieldValue !== null && fieldValue !== undefined && typeof fieldValue !== 'object')
    .slice(0, 8)
    .map(([key, fieldValue]) => ({ key, label: fieldLabels[key] || key, value: fieldValue === '' ? '-' : fieldValue }))
}

function scopeLabel(value) {
  return scopeOptions.find(item => item.value === value)?.label || value
}

function riskLevelClass(level) {
  return level === 'HIGH' ? 'text-[#b42318]' : level === 'LOW' ? 'text-[#18794e]' : 'text-[#a15c00]'
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN')
}

function requestPayload() {
  return {
    scopeLevel: scopeLevel.value,
    classId: props.classId,
    experimentId: scopeLevel.value === 'EXPERIMENT' ? experimentId.value : null,
    includeHistory: scopeLevel.value !== 'EXPERIMENT' && includeHistory.value
  }
}

async function loadContext() {
  activeReport.value = null
  errorMessage.value = ''
  if (!canGenerate.value) {
    contextData.value = null
    return
  }
  const requestId = ++contextRequestId
  contextLoading.value = true
  try {
    const result = unwrap(await getTeachingAdviceContext(requestPayload()))
    if (requestId === contextRequestId) contextData.value = result
  } catch (error) {
    if (requestId !== contextRequestId) return
    contextData.value = null
    errorMessage.value = error?.message || '教学建议数据范围加载失败'
    logger.error('加载教学建议数据范围失败:', error)
  } finally {
    if (requestId === contextRequestId) contextLoading.value = false
  }
}

async function loadReports() {
  try {
    const result = unwrap(await getTeachingAdviceReports())
    reports.value = Array.isArray(result) ? result : []
  } catch (error) {
    logger.error('加载教学建议历史失败:', error)
  }
}

async function generateReport() {
  if (!canGenerate.value || generating.value) return
  generating.value = true
  errorMessage.value = ''
  try {
    activeReport.value = unwrap(await generateTeachingAdvice(requestPayload()))
    await loadReports()
    uiMessage.success('教学建议已生成并保存')
  } catch (error) {
    errorMessage.value = error?.message || '教学建议生成失败'
    uiMessage.warning(errorMessage.value)
    logger.error('生成可信教学建议失败:', error)
  } finally {
    generating.value = false
  }
}

function selectReport(report) {
  activeReport.value = report
}

watch(() => props.experiments, rows => {
  if (experimentId.value && !rows.some(item => String(item.id) === String(experimentId.value))) experimentId.value = ''
}, { deep: true })
watch([() => props.classId, scopeLevel, experimentId, includeHistory], loadContext, { immediate: true })
watch(() => props.classId, loadReports, { immediate: true })
</script>
