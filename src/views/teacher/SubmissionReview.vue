<template>
  <div class="min-h-full">
    <!-- Page Header -->
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="$router.back()"
        class="h-[38px] w-[38px] rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-[15px] text-[#6e6e73]">返回</span>
      <span class="text-[#d1d1d6] mx-1">/</span>
      <span class="text-[17px] font-semibold text-[#1d1d1f]">评阅: {{ detail?.studentName || '' }}</span>
    </div>

    <div v-if="detail" class="mt-5">
      <!-- Score Banner -->
      <div
        class="flex items-center justify-between gap-6 p-6 px-8 rounded-[18px] mb-6 border"
        :class="{
          'bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-[#bbf7d0]': scoreLevel === 'level-good' || scoreLevel === '',
          'bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] border-[#fde68a]': scoreLevel === 'level-ok',
          'bg-gradient-to-br from-[#fef2f2] to-[#fecaca] border-[#fca5a5]': scoreLevel === 'level-low'
        }"
      >
        <div class="flex items-baseline gap-2">
          <span class="text-4xl font-bold text-[#15803d]">{{ formatScore(detail.totalScore, '暂无') }}</span>
          <span class="text-[#6e6e73]">总分</span>
        </div>
        <div class="text-[#6e6e73] flex items-center gap-3 text-sm">
          <span>学生: {{ detail.studentName }}</span>
          <span v-if="detail.className">| {{ detail.className }}</span>
          <span
            class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold"
            :class="{
              'bg-[rgba(52,199,89,0.12)] text-[#34c759]': statusTag(detail.status) === 'success',
              'bg-[rgba(255,149,0,0.1)] text-[#ff9500]': statusTag(detail.status) === 'warning',
              'bg-[rgba(255,59,48,0.1)] text-[#ff3b30]': statusTag(detail.status) === 'danger',
              'bg-black/5 text-[#6e6e73]': statusTag(detail.status) === 'info'
            }"
          >
            {{ statusText(detail.status) }}
          </span>
        </div>
      </div>

      <!-- Review Card -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-6">
        <div class="flex justify-between items-center gap-4 mb-2">
          <span class="font-semibold text-[#1d1d1f]">教师总评</span>
          <div class="flex gap-2 flex-wrap">
            <button
              @click="downloadReport"
              :disabled="downloadingReport || !detail?.hasDownloadableReport"
              class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#34c759] bg-[rgba(52,199,89,0.08)] hover:bg-[rgba(52,199,89,0.15)] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="downloadingReport" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
              下载批注报告
            </button>
            <button
              @click="generateReview"
              :disabled="generatingReview"
              class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#007aff] bg-[rgba(0,122,255,0.08)] hover:bg-[rgba(0,122,255,0.15)] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="generatingReview" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
              AI 生成总评
            </button>
            <button
              @click="saveReview"
              :disabled="!reviewEdited || savingReview"
              class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="savingReview" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
              保存总评
            </button>
            <button
              @click="publishReport"
              :disabled="publishingReport"
              class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#ff3b30] bg-[rgba(255,59,48,0.08)] hover:bg-[rgba(255,59,48,0.15)] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="publishingReport" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
              一键导入学生报告
            </button>
          </div>
        </div>
        <p class="m-0 mb-3 text-[13px] leading-relaxed text-[#6e6e73]">
          导入后会把当前总分和教师总评写入学生实验报告，学生端导出的 Word 会显示红色手写评语。
        </p>
        <p class="m-0 mb-3 text-[13px] leading-relaxed text-[#6e6e73]" v-if="detail?.hasDownloadableReport">
          当前已生成 {{ preferredReportLabel }}，可直接下载查看。
        </p>
        <textarea
          v-model="finalReview"
          rows="5"
          placeholder="点击 AI 生成总评 自动生成，或直接手动编辑教师总评。"
          @input="reviewEdited = true"
          class="w-full px-4 py-3 rounded-[12px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm resize-y min-h-[120px]"
        ></textarea>
      </div>

      <!-- Main Grid: Scores + Evidence -->
      <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        <!-- Left: Score Dimensions -->
        <div>
          <div class="text-base font-semibold text-[#1d1d1f] mb-4 pb-2 border-b-2 border-black/[0.06]">评分维度</div>
          <div
            v-for="score in detail.scores"
            :key="score.dimensionId"
            class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] mb-3 overflow-hidden transition-all duration-200 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-px"
            :class="{ 'border-l-[3px] border-l-[#f59e0b]': score.status === 'NEED_MORE_EVIDENCE' }"
          >
            <div class="flex justify-between items-center gap-4 px-5 py-3.5 bg-[#f9f9f9] border-b border-black/[0.06]">
              <span class="font-bold text-[#1d1d1f] text-base">{{ getDimName(score.dimensionId) }}</span>
              <div class="flex items-center gap-1.5">
                <span
                  v-if="score.status === 'NEED_MORE_EVIDENCE'"
                  class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[rgba(255,149,0,0.1)] text-[#ff9500]"
                >
                  证据不足
                </span>
                <span class="text-xl font-bold text-[#1d1d1f]">{{ score.score ?? '暂无' }}</span>
                <span class="text-[#aeaeb2]">/ {{ score.maxScore }}</span>
                <span class="text-[#aeaeb2] text-xs">({{ score.weight }}%)</span>
              </div>
            </div>
            <div class="px-5 py-4">
              <div v-if="score.comment" class="mb-3 mt-2">
                <div class="flex items-center gap-1 text-xs text-[#007aff] font-semibold mb-1.5">
                  <ChatDotRound class="w-3.5 h-3.5" />
                  <span>AI 评语</span>
                </div>
                <p class="text-sm leading-relaxed text-[#1d1d1f] m-0 px-3.5 py-2.5 bg-[#f9f9f9] rounded-[10px] border-l-[3px] border-l-[#007aff]">{{ score.comment }}</p>
              </div>
              <div v-else class="text-[#aeaeb2] text-[13px] mb-3">暂无评语</div>
              <button
                @click="startOverride(score)"
                class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#007aff] bg-[rgba(0,122,255,0.08)] hover:bg-[rgba(0,122,255,0.15)] active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5"
              >
                <Edit class="w-3.5 h-3.5" />
                <span>修改评分</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Evidence -->
        <div>
          <div class="text-base font-semibold text-[#1d1d1f] mb-4 pb-2 border-b-2 border-black/[0.06]">证据材料 ({{ detail.evidenceBlocks?.length || 0 }})</div>
          <div class="flex flex-col gap-2.5">
            <div v-for="eb in detail.evidenceBlocks" :key="eb.evidenceId" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-3.5">
              <div class="flex justify-between items-center gap-3 mb-2">
                <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-black/5 text-[#6e6e73]">{{ eb.evidenceId }}</span>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold"
                    :class="{
                      'bg-black/5 text-[#6e6e73]': kindType(eb.kind) === '' || kindType(eb.kind) === 'info',
                      'bg-[rgba(52,199,89,0.12)] text-[#34c759]': kindType(eb.kind) === 'success',
                      'bg-[rgba(255,149,0,0.1)] text-[#ff9500]': kindType(eb.kind) === 'warning',
                      'bg-[rgba(255,59,48,0.1)] text-[#ff3b30]': kindType(eb.kind) === 'danger'
                    }"
                  >{{ kindLabel(eb.kind) }}</span>
                  <span class="text-xs text-[#6e6e73]">页 {{ eb.page }}</span>
                </div>
              </div>
              <pre class="m-0 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#1d1d1f] bg-[#f9f9f9] rounded-[10px] p-3">{{ (eb.content || '').slice(0, 500) }}</pre>
              <div v-if="eb.confidence" class="text-xs text-[#6e6e73] mt-2">
                置信度 {{ (eb.confidence * 100).toFixed(1) }}%
              </div>
            </div>
            <!-- Empty State -->
            <div v-if="!detail.evidenceBlocks?.length" class="flex flex-col items-center justify-center py-12 text-[#aeaeb2]">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span class="text-sm">暂无证据材料</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Override Dialog (modal) -->
    <Teleport to="body">
      <div v-if="overrideVisible" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="overrideVisible = false"></div>
        <div class="relative w-[500px] max-w-[90vw] rounded-[20px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.2)] p-6 animate-[modalIn_0.2s_ease]">
          <h3 class="text-lg font-semibold text-[#1d1d1f] m-0 mb-5">修改评分</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <label class="w-[70px] text-sm text-[#6e6e73] shrink-0">新分数</label>
              <input
                v-model.number="overrideForm.newScore"
                type="number"
                :min="0"
                :max="overrideForm.maxScore"
                step="0.5"
                class="w-[120px] h-[38px] px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm"
              />
              <span class="text-[#aeaeb2] text-sm">/ {{ overrideForm.maxScore }}</span>
            </div>
            <div class="flex gap-3">
              <label class="w-[70px] text-sm text-[#6e6e73] shrink-0 pt-2.5">新评语</label>
              <textarea
                v-model="overrideForm.newComment"
                rows="3"
                placeholder="输入修改后的评语"
                class="flex-1 px-4 py-3 rounded-[12px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm resize-y min-h-[80px]"
              ></textarea>
            </div>
            <div class="flex gap-3">
              <label class="w-[70px] text-sm text-[#6e6e73] shrink-0 pt-2.5">修改原因</label>
              <textarea
                v-model="overrideForm.reason"
                rows="2"
                placeholder="说明修改原因"
                class="flex-1 px-4 py-3 rounded-[12px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm resize-y min-h-[60px]"
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="overrideVisible = false"
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none"
            >取消</button>
            <button
              @click="submitOverride"
              :disabled="overriding"
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50"
            >
              <span v-if="overriding" class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></span>
              确认修改
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Loading State -->
    <div v-if="loading" class="h-[200px] flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-[3px] border-[#007aff]/20 border-t-[#007aff] rounded-full animate-spin"></div>
        <span class="text-sm text-[#6e6e73]">加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Edit } from '@element-plus/icons-vue'
import {
  downloadSubmissionReport,
  generateFinalReview,
  getSubmissionDetail,
  overrideSubmissionScore,
  publishSubmissionReport,
  saveFinalReview,
} from '@/api/tap'

const route = useRoute()
const subId = route.params.id
const detail = ref(null)
const loading = ref(false)
const dimensions = ref({})

const finalReview = ref('')
const reviewEdited = ref(false)
const generatingReview = ref(false)
const savingReview = ref(false)
const publishingReport = ref(false)
const downloadingReport = ref(false)

const overrideVisible = ref(false)
const overriding = ref(false)
const overrideForm = ref({ dimensionId: null, newScore: 0, maxScore: 0, newComment: '', reason: '' })

const scoreLevel = computed(() => {
  const score = Number(detail.value?.totalScore)
  if (!Number.isFinite(score)) return ''
  if (score >= 80) return 'level-good'
  if (score >= 60) return 'level-ok'
  return 'level-low'
})

const preferredReportLabel = computed(() => {
  const type = detail.value?.preferredReportFileType
  return {
    annodoc: '批注版 Word',
    annopdf: '批注版 PDF',
    pdf: '评分报告 PDF',
  }[type] || '报告文件'
})

function formatScore(score, fallback = '-') {
  if (score == null || score === '') return fallback
  const num = Number(score)
  return Number.isFinite(num) ? num.toFixed(1).replace(/\.0$/, '') : score
}

function statusTag(status) {
  return { SCORED: 'success', NEED_MORE_EVIDENCE: 'warning', FAILED: 'danger', PENDING: 'info' }[status] || 'info'
}

function statusText(status) {
  return {
    SCORED: '已评分',
    NEED_MORE_EVIDENCE: '证据不足',
    FAILED: '失败',
    PENDING: '待处理',
  }[status] || status
}

function kindType(kind) {
  return { text: '', ocr: 'success', vlm: 'warning', vlm_failed: 'danger' }[kind] || 'info'
}

function kindLabel(kind) {
  return { text: '文本', ocr: 'OCR', vlm: 'VLM', vlm_failed: 'VLM 失败' }[kind] || kind
}

function getDimName(dimensionId) {
  return dimensions.value[dimensionId] || `维度 #${dimensionId}`
}

function startOverride(score) {
  overrideForm.value = {
    dimensionId: score.dimensionId,
    newScore: score.score || 0,
    maxScore: score.maxScore,
    newComment: score.comment || '',
    reason: '',
  }
  overrideVisible.value = true
}

async function submitOverride() {
  overriding.value = true
  try {
    await overrideSubmissionScore(subId, {
      dimensionId: overrideForm.value.dimensionId,
      newScore: overrideForm.value.newScore,
      newComment: overrideForm.value.newComment,
      reason: overrideForm.value.reason,
    })
    ElMessage.success('评分已修改')
    overrideVisible.value = false
    await loadDetail()
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    overriding.value = false
  }
}

async function generateReview() {
  generatingReview.value = true
  try {
    const res = await generateFinalReview(subId)
    const data = res?.data || res
    finalReview.value = data?.finalReviewComment || data?.data?.finalReviewComment || ''
    reviewEdited.value = false
    ElMessage.success('总评已生成')
  } catch (error) {
    ElMessage.error(`生成总评失败: ${error.message}`)
  } finally {
    generatingReview.value = false
  }
}

async function saveReview() {
  savingReview.value = true
  try {
    await saveFinalReview(subId, finalReview.value)
    reviewEdited.value = false
    ElMessage.success('总评已保存')
  } catch (error) {
    ElMessage.error(`保存失败: ${error.message}`)
  } finally {
    savingReview.value = false
  }
}

async function publishReport() {
  publishingReport.value = true
  try {
    if (reviewEdited.value) {
      await saveFinalReview(subId, finalReview.value)
      reviewEdited.value = false
    }
    await publishSubmissionReport(subId)
    await loadDetail()
    ElMessage.success('已导入学生报告，学生端可直接查看和导出')
  } catch (error) {
    ElMessage.error(`导入失败: ${error.message}`)
  } finally {
    publishingReport.value = false
  }
}

async function downloadReport() {
  if (!detail.value?.hasDownloadableReport) {
    ElMessage.warning('当前还没有可下载的批注报告')
    return
  }
  downloadingReport.value = true
  try {
    const blob = await downloadSubmissionReport(subId)
    const ext = detail.value?.preferredReportFileType === 'annodoc' ? 'docx' : 'pdf'
    const filename = detail.value?.originalFilename || `${detail.value?.studentName || 'submission'}.${ext}`
    const url = URL.createObjectURL(new Blob([blob]))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error(`下载失败: ${error.message}`)
  } finally {
    downloadingReport.value = false
  }
}

async function loadDetail() {
  loading.value = true
  try {
    const res = await getSubmissionDetail(subId)
    detail.value = res?.data || res
    finalReview.value = detail.value?.finalReviewComment || ''
    reviewEdited.value = false

    if (detail.value?.taskId) {
      try {
        const { getGradingTaskDetail, getRubricDetail } = await import('@/api/tap')
        const taskRes = await getGradingTaskDetail(detail.value.taskId)
        const taskData = taskRes?.data || taskRes
        if (taskData?.rubricId) {
          const rubricRes = await getRubricDetail(taskData.rubricId)
          const rubricData = rubricRes?.data || rubricRes
          const map = {}
          ;(rubricData?.dimensions || []).forEach(item => {
            map[item.id] = item.name
          })
          dimensions.value = map
        }
      } catch {
        dimensions.value = {}
      }
    }
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
</script>
