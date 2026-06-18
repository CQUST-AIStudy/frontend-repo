<template>
  <div class="min-h-full">
    <!-- Page Header -->
    <div class="flex items-center gap-3 mb-5">
      <UiButton
        @click="router.push('/teacher/grading')"
        class="h-[38px] w-[38px] rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </UiButton>
      <span class="text-[15px] text-[#6e6e73]">返回</span>
      <span class="text-[17px] font-semibold text-[#1d1d1f]">{{ task?.displayCode ? `批改任务 ${task.displayCode}` : `批改任务 #${taskId}` }}</span>
    </div>

    <!-- Batch Review Card -->
    <div v-if="task" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden mb-5">
      <div class="flex items-center justify-between gap-4 px-5 pt-[18px] pb-[10px] border-b border-black/[0.06]">
        <div class="flex items-center gap-2">
          <span class="text-[16px] font-semibold text-[#1d1d1f]">AI 批次总评</span>
          <span
            v-if="batchReview.status === 'GENERATING'"
            class="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold bg-[rgba(255,149,0,0.1)] text-[#ff9500]"
          >生成中</span>
          <span
            v-else-if="batchReview.status === 'COMPLETED'"
            class="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold bg-[rgba(52,199,89,0.12)] text-[#34c759]"
          >已完成</span>
          <span
            v-else-if="batchReview.status === 'FAILED'"
            class="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold bg-[rgba(255,59,48,0.1)] text-[#ff3b30]"
          >失败</span>
        </div>
        <div class="flex items-center gap-2">
          <UiButton
            v-if="batchReview.status === 'FAILED'"
            :disabled="batchReview.status === 'GENERATING' || task.completedCount === 0"
            @click="doGenerateBatchReview"
            class="h-[32px] px-4 rounded-[8px] text-[12px] font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] border-none cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span v-if="batchReviewLoading" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></span>
            重试生成
          </UiButton>
        </div>
      </div>
      <div class="p-5">
        <div v-if="batchReview.status === 'PENDING' || batchReview.status === 'FAILED'" class="text-[13px] text-[#6e6e73]">
          {{ batchReview.status === 'FAILED' ? '生成失败，可点击右上角按钮重试。' : '批改完成后会自动生成批次总评，无需手动操作。' }}
        </div>
        <div v-else-if="batchReview.status === 'GENERATING'" class="flex items-center gap-2 text-[13px] text-[#6e6e73]">
          <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          AI 正在分析全班成绩，请稍候...
        </div>
        <div v-else class="space-y-4">
          <div v-if="batchReview.summary" class="text-[14px] text-[#1d1d1f] leading-relaxed bg-[#f9f9fb] rounded-[10px] p-3">{{ batchReview.summary }}</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="rounded-[12px] border border-[#e5e7eb] p-3">
              <div class="text-[12px] font-semibold text-[#6e6e73] mb-2">常见薄弱点</div>
              <ul v-if="batchReview.commonIssues?.length" class="list-disc list-inside text-[13px] text-[#1d1d1f] space-y-1">
                <li v-for="(item, i) in batchReview.commonIssues" :key="i">{{ item }}</li>
              </ul>
              <div v-else class="text-[13px] text-[#aeaeb2]">暂无</div>
            </div>
            <div class="rounded-[12px] border border-[#e5e7eb] p-3">
              <div class="text-[12px] font-semibold text-[#6e6e73] mb-2">整体优势</div>
              <ul v-if="batchReview.strengths?.length" class="list-disc list-inside text-[13px] text-[#1d1d1f] space-y-1">
                <li v-for="(item, i) in batchReview.strengths" :key="i">{{ item }}</li>
              </ul>
              <div v-else class="text-[13px] text-[#aeaeb2]">暂无</div>
            </div>
            <div class="rounded-[12px] border border-[#e5e7eb] p-3">
              <div class="text-[12px] font-semibold text-[#6e6e73] mb-2">教学建议</div>
              <ul v-if="batchReview.teachingAdvice?.length" class="list-disc list-inside text-[13px] text-[#1d1d1f] space-y-1">
                <li v-for="(item, i) in batchReview.teachingAdvice" :key="i">{{ item }}</li>
              </ul>
              <div v-else class="text-[13px] text-[#aeaeb2]">暂无</div>
            </div>
          </div>
          <div v-if="batchReview.scoreDistribution" class="rounded-[12px] border border-[#e5e7eb] p-3">
            <div class="flex items-center justify-between mb-3">
              <div class="text-[12px] font-semibold text-[#6e6e73]">得分分布</div>
              <div class="text-[12px] text-[#6e6e73]">
                平均 {{ batchReview.scoreDistribution.average }} 分 · 中位 {{ batchReview.scoreDistribution.median }} 分 · 共 {{ batchReview.scoreDistribution.count }} 人
              </div>
            </div>
            <div class="flex items-end gap-1 h-28">
              <div
                v-for="(bin, i) in batchReview.scoreDistribution.bins"
                :key="i"
                class="flex-1 bg-[#0b7cff]/80 hover:bg-[#0b7cff] rounded-t-[4px] min-w-[16px] transition-all relative group"
                :style="{ height: maxBinCount ? `${Math.max(4, (bin.count / maxBinCount) * 100)}%` : '4px' }"
              >
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] text-[#1d1d1f] opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {{ bin.minInclusive }}-{{ bin.maxExclusive - 1 }}分：{{ bin.count }}人
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Overview -->
    <div v-if="task" class="flex items-center gap-6 rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5 px-6 mb-5 flex-wrap">
      <div class="flex flex-col gap-1 py-[18px] px-4 rounded-[16px] bg-gradient-to-b from-[#f7fbff] to-[#eef6ff]">
        <span class="text-[13px] text-[#6e6e73]">状态</span>
        <span
          class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold"
          :class="tagClass(statusType(task.status))"
        >{{ statusText(task.status) }}</span>
      </div>
      <div class="flex flex-col gap-1 py-[18px] px-4 rounded-[16px] bg-gradient-to-b from-[#f7fbff] to-[#eef6ff]">
        <span class="text-[28px] font-bold text-[#1d1d1f]">{{ task.totalCount || 0 }}</span>
        <span class="text-[13px] text-[#6e6e73]">总数</span>
      </div>
      <div class="flex flex-col gap-1 py-[18px] px-4 rounded-[16px] bg-gradient-to-b from-[#f7fbff] to-[#eef6ff]">
        <span class="text-[28px] font-bold text-[#16a34a]">{{ task.completedCount || 0 }}</span>
        <span class="text-[13px] text-[#6e6e73]">已完成</span>
      </div>
      <div class="flex flex-col gap-1 py-[18px] px-4 rounded-[16px] bg-gradient-to-b from-[#f7fbff] to-[#eef6ff]">
        <span class="text-[28px] font-bold text-[#ef4444]">{{ task.failedCount || 0 }}</span>
        <span class="text-[13px] text-[#6e6e73]">失败</span>
      </div>
      <div class="flex-1" />
      <UiButton
        :disabled="annotating || submissions.length === 0"
        @click="doBatchAnnotate"
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#ff3b30] bg-[rgba(255,59,48,0.08)] border border-[rgba(255,59,48,0.2)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="annotating" class="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
        生成红笔批改报告
      </UiButton>
      <UiButton
        :disabled="exportingAnnotated || submissions.length === 0"
        @click="doBatchExportAnnotated"
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#ff9500] bg-[rgba(255,149,0,0.08)] border border-[rgba(255,149,0,0.2)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="exportingAnnotated" class="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
        导出 AI 批改报告 ZIP
      </UiButton>
      <UiButton
        @click="showExportDialog"
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none"
      >
        导出 Excel
      </UiButton>
    </div>

    <!-- Submissions Card -->
    <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden">
      <div class="flex items-center justify-between gap-4 px-5 pt-[18px] pb-[10px] border-b border-black/[0.06]">
        <span class="text-[16px] font-semibold text-[#1d1d1f]">提交列表</span>
        <div class="flex items-center bg-black/[0.04] rounded-[10px] p-0.5">
          <UiButton
            v-for="opt in filterOptions"
            :key="opt.value"
            @click="statusFilter = opt.value"
            class="h-[30px] px-3 rounded-[8px] text-[12px] font-medium transition-all cursor-pointer border-none"
            :class="statusFilter === opt.value ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-[#6e6e73] hover:text-[#1d1d1f]'"
          >{{ opt.label }}</UiButton>
        </div>
      </div>

      <div class="p-5">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex gap-4 animate-pulse">
            <div class="h-4 w-16 bg-black/[0.06] rounded"></div>
            <div class="h-4 w-32 bg-black/[0.06] rounded"></div>
            <div class="h-4 w-24 bg-black/[0.06] rounded"></div>
            <div class="h-4 w-20 bg-black/[0.06] rounded"></div>
            <div class="h-4 flex-1 bg-black/[0.06] rounded"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredSubs.length === 0" class="flex flex-col items-center justify-center py-16">
          <svg class="w-16 h-16 text-[#d2d2d7] mb-4" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="12" width="48" height="40" rx="6" stroke="currentColor" stroke-width="2"/>
            <path d="M8 24h48" stroke="currentColor" stroke-width="2"/>
            <circle cx="32" cy="38" r="6" stroke="currentColor" stroke-width="2"/>
            <path d="M29 38l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p class="text-[15px] text-[#6e6e73]">暂无提交数据</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr class="border-b border-black/[0.06]">
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tl-lg">ID</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">学生</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">班级</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">状态</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">总分</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">原始文件</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">报告</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">总评</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tr-lg">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredSubs" :key="row.submissionId" class="border-b border-black/[0.04] hover:bg-[rgba(0,122,255,0.03)] transition-colors">
                <td class="py-3 px-3 text-[#6e6e73]">{{ row.submissionId }}</td>
                <td class="py-3 px-3 font-medium text-[#1d1d1f] max-w-[160px] truncate">{{ row.studentName }}</td>
                <td class="py-3 px-3 text-[#6e6e73] max-w-[140px] truncate">{{ row.className }}</td>
                <td class="py-3 px-3">
                  <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold" :class="tagClass(statusType(row.status))">
                    {{ statusText(row.status) }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span class="font-semibold" :class="scoreClass(row.totalScore)">{{ formatScore(row.totalScore) }}</span>
                </td>
                <td class="py-3 px-3 text-[#6e6e73] max-w-[220px] truncate" :title="row.originalFilename">{{ row.originalFilename }}</td>
                <td class="py-3 px-3">
                  <span v-if="row.hasDownloadableReport" class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[rgba(52,199,89,0.12)] text-[#34c759]">
                    {{ reportTypeLabel(row.preferredReportFileType) }}
                  </span>
                  <span v-else class="text-[#aeaeb2]">未生成</span>
                </td>
                <td class="py-3 px-3 max-w-[260px] truncate text-[#6e6e73]" :title="row.finalReviewComment">
                  <span v-if="row.finalReviewComment">{{ row.finalReviewComment }}</span>
                  <span v-else class="text-[#aeaeb2]">暂无</span>
                </td>
                <td class="py-3 px-3 whitespace-nowrap">
                  <UiButton v-if="row.hasDownloadableReport" @click="downloadReport(row)" class="text-[13px] font-medium text-[#34c759] cursor-pointer hover:text-[#2da44e] transition-colors bg-transparent border-none mr-3">
                    下载报告
                  </UiButton>
                  <UiButton
                    v-if="row.status === 'FAILED'"
                    :disabled="retryingSubmissionId === row.submissionId"
                    @click="retrySubmission(row)"
                    class="text-[13px] font-medium text-[#ff9500] cursor-pointer hover:text-[#e08600] transition-colors bg-transparent border-none mr-3"
                  >
                    <span v-if="retryingSubmissionId === row.submissionId" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></span>
                    重试
                  </UiButton>
                  <UiButton @click="router.push(`/teacher/grading/submission/${row.submissionId}`)" class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors bg-transparent border-none">
                    查看详情
                  </UiButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Export Dialog -->
    <AppModal v-model="exportVisible" title="导出成绩 Excel" width="600px">
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-[14px] font-medium text-[#1d1d1f] w-[90px]">选择学生</span>
          <label class="flex items-center gap-1.5 cursor-pointer text-[13px] text-[#1d1d1f]">
            <UiInput type="checkbox" v-model="exportSelectAll" @change="toggleSelectAll(exportSelectAll)" class="w-4 h-4 rounded accent-[#007aff]" />
            全选
          </label>
        </div>
        <div class="max-h-[280px] overflow-auto border border-black/[0.06] rounded-[12px] p-3">
          <label
            v-for="sub in submissions"
            :key="sub.submissionId"
            class="flex items-center gap-2 py-1.5 cursor-pointer text-[13px] text-[#1d1d1f] hover:bg-black/[0.02] rounded px-1"
          >
            <UiInput type="checkbox" :value="sub.submissionId" v-model="exportSelected" class="w-4 h-4 rounded accent-[#007aff]" />
            <span>{{ sub.studentName || '未知学生' }}</span>
            <span class="text-[#aeaeb2]">{{ sub.className || '' }}</span>
            <span class="ml-2 text-[#6e6e73]">{{ sub.totalScore != null ? `${formatScore(sub.totalScore)}分` : '-' }}</span>
          </label>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[14px] font-medium text-[#1d1d1f] w-[90px]">包含总评</span>
          <UiButton
            @click="exportIncludeComments = !exportIncludeComments"
            class="relative w-[44px] h-[24px] rounded-full transition-colors cursor-pointer border-none"
            :class="exportIncludeComments ? 'bg-[#34c759]' : 'bg-black/[0.12]'"
          >
            <span class="absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all" :class="exportIncludeComments ? 'left-[22px]' : 'left-[2px]'"></span>
          </UiButton>
        </div>
      </div>
      <template #footer>
        <UiButton @click="exportVisible = false" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-white border border-black/[0.1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer">
          取消
        </UiButton>
        <UiButton
          :disabled="exporting || exportSelected.length === 0"
          @click="doExport"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="exporting" class="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
          导出
        </UiButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { message as uiMessage } from '@/services/feedback'
import logger from '@/utils/logger'
import AppModal from '../../components/AppModal.vue'
import {
  batchGenerateAnnotatedReports,
  downloadSubmissionReport,
  exportGradingExcel,
  exportGradingTask,
  getBatchReview,
  getGradingTaskDetail,
  retryGradingSubmission,
  triggerBatchReview,
} from '@/api/tap'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id

const task = ref(null)
const submissions = ref([])
const loading = ref(false)
const statusFilter = ref('')

const exportVisible = ref(false)
const exportSelected = ref([])
const exportSelectAll = ref(false)
const exportIncludeComments = ref(true)
const exporting = ref(false)
const annotating = ref(false)
const exportingAnnotated = ref(false)
const retryingSubmissionId = ref(null)

// ---- 批次总评 ----
const batchReview = ref({ status: 'PENDING', summary: null, commonIssues: [], strengths: [], teachingAdvice: [], scoreDistribution: null })
const batchReviewLoading = ref(false)
const batchReviewRefreshTimer = ref(null)

const filterOptions = [
  { label: '全部', value: '' },
  { label: '已评分', value: 'SCORED' },
  { label: '失败', value: 'FAILED' },
  { label: '证据不足', value: 'NEED_MORE_EVIDENCE' },
  { label: '处理中', value: 'PROCESSING' },
]

const filteredSubs = computed(() => {
  if (!statusFilter.value) return submissions.value
  return submissions.value.filter(item => item.status === statusFilter.value)
})

function tagClass(type) {
  return {
    success: 'bg-[rgba(52,199,89,0.12)] text-[#34c759]',
    warning: 'bg-[rgba(255,149,0,0.1)] text-[#ff9500]',
    danger: 'bg-[rgba(255,59,48,0.1)] text-[#ff3b30]',
    info: 'bg-black/5 text-[#6e6e73]',
  }[type] || 'bg-black/5 text-[#6e6e73]'
}

function statusType(status) {
  return {
    PENDING: 'info',
    PROCESSING: 'warning',
    SCORED: 'success',
    COMPLETED: 'success',
    FAILED: 'danger',
    NEED_MORE_EVIDENCE: 'warning',
  }[status] || 'info'
}

function statusText(status) {
  return {
    PENDING: '等待中',
    PROCESSING: '处理中',
    SCORED: '已评分',
    COMPLETED: '已完成',
    FAILED: '失败',
    NEED_MORE_EVIDENCE: '证据不足',
  }[status] || status
}

function scoreClass(score) {
  if (score == null) return ''
  const num = Number(score)
  if (num >= 80) return 'text-[#34c759]'
  if (num >= 60) return 'text-[#ff9500]'
  return 'text-[#ff3b30]'
}

function formatScore(score) {
  if (score == null || score === '') return '-'
  const num = Number(score)
  return Number.isFinite(num) ? num.toFixed(1).replace(/\.0$/, '') : score
}

function reportTypeLabel(type) {
  return {
    annodoc: '批注 Word',
    annopdf: '批注 PDF',
    pdf: '评分 PDF',
  }[type] || '已生成'
}

function showExportDialog() {
  if (!submissions.value.length) {
    uiMessage.warning('暂无可导出的提交数据')
    return
  }
  exportSelected.value = submissions.value.map(item => item.submissionId)
  exportSelectAll.value = true
  exportVisible.value = true
}

function toggleSelectAll(checked) {
  exportSelected.value = checked ? submissions.value.map(item => item.submissionId) : []
}

async function doExport() {
  exporting.value = true
  try {
    const res = await exportGradingExcel(taskId, exportSelected.value, exportIncludeComments.value)
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `批改成绩-任务${taskId}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    exportVisible.value = false
    uiMessage.success('导出成功')
  } catch (error) {
    uiMessage.error(`导出失败: ${error.message}`)
  } finally {
    exporting.value = false
  }
}

async function doBatchAnnotate() {
  annotating.value = true
  try {
    const res = await batchGenerateAnnotatedReports(taskId)
    const data = res?.data || res
    uiMessage.success(`批改报告处理完成：共${data.total || 0}份，新生成${data.generated || 0}份，刷新${data.refreshed || 0}份，跳过${data.skipped || 0}份`)
    if (data.errors && data.errors.length > 0) {
      uiMessage.warning(`${data.errors.length}份生成失败，请查看后端返回信息`)
    }
    await loadDetail()
  } catch (error) {
    uiMessage.error(`生成批改报告失败: ${error.message}`)
  } finally {
    annotating.value = false
  }
}

async function doBatchExportAnnotated() {
  exportingAnnotated.value = true
  try {
    const res = await exportGradingTask(taskId)
    const blob = new Blob([res], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI批改报告-任务${taskId}.zip`
    a.click()
    URL.revokeObjectURL(url)
    uiMessage.success('批改报告 ZIP 导出成功')
  } catch (error) {
    uiMessage.error(`导出失败: ${error.message}`)
  } finally {
    exportingAnnotated.value = false
  }
}

async function downloadReport(row) {
  try {
    const res = await downloadSubmissionReport(row.submissionId)
    const blob = new Blob([res])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = resolveAnnotatedFilename(row.originalFilename, row.studentName, row.preferredReportFileType)
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    uiMessage.error(`下载失败: ${error.message}`)
  }
}

async function retrySubmission(row) {
  retryingSubmissionId.value = row.submissionId
  try {
    await retryGradingSubmission(row.submissionId)
    uiMessage.success('已提交重试任务')
    await loadDetail()
  } catch (error) {
    uiMessage.error(`重试失败: ${error.message}`)
  } finally {
    retryingSubmissionId.value = null
  }
}

function resolveAnnotatedFilename(originalFilename, studentName, reportType) {
  const ext = reportType === 'annodoc' ? 'docx' : 'pdf'
  if (!originalFilename) {
    return `${studentName || 'submission'}.${ext}`
  }
  const lower = originalFilename.toLowerCase()
  if (lower.endsWith(`.${ext}`)) {
    return originalFilename
  }
  const dot = originalFilename.lastIndexOf('.')
  return dot >= 0 ? `${originalFilename.slice(0, dot)}.${ext}` : `${originalFilename}.${ext}`
}

const maxBinCount = computed(() => {
  if (!batchReview.value.scoreDistribution?.bins) return 0
  return Math.max(...batchReview.value.scoreDistribution.bins.map(b => b.count || 0))
})

async function loadBatchReview() {
  try {
    const res = await getBatchReview(taskId)
    const data = res?.data || res
    if (data) {
      batchReview.value = {
        status: data.status || 'PENDING',
        summary: data.summary || null,
        commonIssues: data.commonIssues || [],
        strengths: data.strengths || [],
        teachingAdvice: data.teachingAdvice || [],
        scoreDistribution: data.scoreDistribution || null,
      }
    }
  } catch (e) {
    logger.error('加载批次总评失败:', e)
  }
}

async function doGenerateBatchReview() {
  batchReviewLoading.value = true
  try {
    await triggerBatchReview(taskId)
    uiMessage.success('批次总评已开始生成')
    await loadBatchReview()
    startBatchReviewPolling()
  } catch (error) {
    uiMessage.error(`生成失败: ${error.message}`)
  } finally {
    batchReviewLoading.value = false
  }
}

async function ensureBatchReviewAutoGeneration() {
  const done = ['COMPLETED', 'FAILED'].includes(task.value?.status)
  if (!done || task.value?.completedCount <= 0 || batchReview.value.status !== 'PENDING') {
    return
  }
  try {
    await triggerBatchReview(taskId)
    await loadBatchReview()
    startBatchReviewPolling()
  } catch (error) {
    logger.error('自动生成批次总评失败:', error)
  }
}

function startBatchReviewPolling() {
  if (batchReviewRefreshTimer.value) return
  batchReviewRefreshTimer.value = setInterval(async () => {
    await loadBatchReview()
    if (batchReview.value.status !== 'GENERATING') {
      clearInterval(batchReviewRefreshTimer.value)
      batchReviewRefreshTimer.value = null
    }
  }, 4000)
}

async function loadDetail() {
  loading.value = true
  try {
    const res = await getGradingTaskDetail(taskId)
    const data = res?.data || res
    task.value = data
    submissions.value = data.submissions || []
    await loadBatchReview()
    await ensureBatchReviewAutoGeneration()
  } catch (error) {
    uiMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetail()
  startBatchReviewPolling()
})

onUnmounted(() => {
  if (batchReviewRefreshTimer.value) clearInterval(batchReviewRefreshTimer.value)
})
</script>
