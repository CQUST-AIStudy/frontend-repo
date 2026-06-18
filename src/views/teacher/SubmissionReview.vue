<template>
  <div class="min-h-full">
    <!-- Page Header -->
    <div class="flex items-center gap-3 mb-6">
      <UiButton
        @click="$router.back()"
        class="h-[38px] w-[38px] rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </UiButton>
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
          'bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border-[#bfdbfe]': scoreLevel === 'level-ok',
          'bg-gradient-to-br from-[#fef2f2] to-[#fecaca] border-[#fca5a5]': scoreLevel === 'level-low'
        }"
      >
        <div class="flex items-baseline gap-2">
          <span
            class="text-4xl font-bold"
            :class="{
              'text-[#15803d]': scoreLevel === 'level-good' || scoreLevel === '',
              'text-[#1d4ed8]': scoreLevel === 'level-ok',
              'text-[#dc2626]': scoreLevel === 'level-low'
            }"
          >{{ formatScore(detail.totalScore, '暂无') }}</span>
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
            <UiButton
              @click="downloadReport"
              :disabled="downloadingReport || !detail?.hasDownloadableReport"
              class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#34c759] bg-[rgba(52,199,89,0.08)] hover:bg-[rgba(52,199,89,0.15)] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="downloadingReport" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
              下载批注报告
            </UiButton>
            <UiButton
              @click="generateReview"
              :disabled="generatingReview"
              class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#007aff] bg-[rgba(0,122,255,0.08)] hover:bg-[rgba(0,122,255,0.15)] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="generatingReview" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
              AI 生成总评
            </UiButton>
            <UiButton
              @click="saveReview"
              :disabled="!reviewEdited || savingReview"
              class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="savingReview" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
              保存总评
            </UiButton>
            <UiButton
              @click="publishReport"
              :disabled="publishingReport"
              class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#ff3b30] bg-[rgba(255,59,48,0.08)] hover:bg-[rgba(255,59,48,0.15)] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="publishingReport" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
              一键导入学生报告
            </UiButton>
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

      <!-- Score Dimensions -->
      <div class="mb-5">
        <div class="text-base font-semibold text-[#1d1d1f] mb-4 pb-2 border-b-2 border-black/[0.06]">评分维度（点击筛选证据）</div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="score in detail.scores"
            :key="score.dimensionId"
            @click="activeDimFilter = activeDimFilter === score.dimensionId ? 'all' : score.dimensionId"
            class="rounded-[20px] border overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-px"
            :class="[
              score.status === 'NEED_MORE_EVIDENCE' ? 'border-l-[3px] border-l-[#f59e0b]' : 'border-black/[0.06]',
              activeDimFilter === score.dimensionId
                ? 'bg-[rgba(0,122,255,0.04)] border-[rgba(0,122,255,0.5)] shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                : 'bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
            ]"
          >
            <div class="flex justify-between items-center gap-4 px-5 py-3.5 bg-[#f9f9f9] border-b border-black/[0.06]">
              <span class="font-bold text-base" :class="activeDimFilter === score.dimensionId ? 'text-[#007aff]' : 'text-[#1d1d1f]'">{{ getDimName(score.dimensionId) }}</span>
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

              <div v-if="parseAnnotations(score.annotationsJson).length" class="mb-3">
                <div class="flex items-center gap-1 text-xs text-[#ff3b30] font-semibold mb-1.5">
                  <LucideIcon name="pen" :size="14" />
                  <span>Inline 批注</span>
                </div>
                <div class="space-y-1.5">
                  <div
                    v-for="(ann, idx) in parseAnnotations(score.annotationsJson)"
                    :key="idx"
                    class="text-xs px-3 py-2 rounded-[8px] border-l-[3px]"
                    :class="{
                      'bg-[rgba(52,199,89,0.08)] border-l-[#34c759]': ann.type === 'CHECK',
                      'bg-[rgba(255,59,48,0.08)] border-l-[#ff3b30]': ann.type === 'CROSS',
                      'bg-[rgba(255,149,0,0.08)] border-l-[#ff9500]': ann.type === 'WAVE'
                    }"
                  >
                    <span class="font-bold">{{ ann.type === 'CHECK' ? '✓' : ann.type === 'CROSS' ? '✗' : '〰' }}</span>
                    <span class="text-[#1d1d1f] ml-1 whitespace-pre-wrap">{{ ann.note }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <UiButton
                  @click.stop="startOverride(score)"
                  class="h-[32px] px-3.5 rounded-[8px] text-xs font-medium text-[#007aff] bg-[rgba(0,122,255,0.08)] hover:bg-[rgba(0,122,255,0.15)] active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5"
                >
                  <Edit class="w-3.5 h-3.5" />
                  <span>修改评分</span>
                </UiButton>
                <span class="text-xs text-[#aeaeb2]">{{ countEvidenceIds(score) }} 条关联证据</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Evidence Materials -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b-2 border-black/[0.06]">
          <div class="text-base font-semibold text-[#1d1d1f]">
            {{ activeDimFilter === 'all' ? '证据材料' : `支持「${getDimName(activeDimFilter)}」的证据` }} ({{ filteredEvidence.length }})
          </div>

          <!-- Type filter chips -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs text-[#6e6e73]">类型：</span>
            <button
              v-for="opt in kindOptions"
              :key="opt.value"
              @click="activeKindFilter = opt.value"
              class="h-[28px] px-3 rounded-full text-xs font-semibold border transition-all"
              :class="activeKindFilter === opt.value
                ? 'bg-[#007aff] text-white border-[#007aff]'
                : 'bg-white text-[#6e6e73] border-black/[0.08] hover:border-black/[0.15]'
            ">
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="columns-1 md:columns-2 xl:columns-3 gap-4">
          <div
            v-for="eb in filteredEvidence"
            :key="eb.evidenceId"
            class="break-inside-avoid rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4 mb-4 transition-all hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          >
            <!-- Dimension support tags -->
            <div v-if="evidenceDimMap.get(eb.evidenceId)?.length" class="flex flex-wrap gap-1.5 mb-2">
              <span
                v-for="(dimId, idx) in evidenceDimMap.get(eb.evidenceId)"
                :key="dimId"
                class="inline-flex items-center h-[22px] px-2.5 rounded-full text-[11px] font-bold"
                :class="dimSupportClass(idx)"
              >
                支持 · {{ getDimName(dimId) }}
              </span>
            </div>

            <div class="flex justify-between items-center gap-3 mb-2">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold"
                  :class="{
                    'bg-black/5 text-[#6e6e73]': kindType(eb.kind) === 'info',
                    'bg-[rgba(52,199,89,0.12)] text-[#34c759]': kindType(eb.kind) === 'success',
                    'bg-[rgba(255,149,0,0.1)] text-[#ff9500]': kindType(eb.kind) === 'warning',
                    'bg-[rgba(255,59,48,0.1)] text-[#ff3b30]': kindType(eb.kind) === 'danger',
                    'bg-[rgba(0,122,255,0.1)] text-[#007aff]': kindType(eb.kind) === 'image'
                  }"
                >{{ kindLabel(eb.kind) }}</span>
                <span class="text-xs text-[#6e6e73]">页 {{ eb.page }}</span>
                <span v-if="eb.locationJson" class="text-xs text-[#aeaeb2]">· {{ formatLocation(eb.locationJson) }}</span>
              </div>
              <span v-if="eb.confidence && eb.kind !== 'vlm_failed'" class="text-xs text-[#aeaeb2]">置信度 {{ (eb.confidence * 100).toFixed(1) }}%</span>
            </div>

            <pre v-if="eb.kind !== 'vlm_failed'" class="m-0 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#1d1d1f] bg-[#f9f9f9] rounded-[10px] p-3">{{ (eb.content || '').slice(0, 500) }}</pre>

            <div v-if="eb.kind === 'vlm_failed'" class="flex items-start gap-2 mt-1 text-[13px] text-[#6e6e73] bg-[#f5f5f7] rounded-[10px] p-3">
              <LucideIcon name="image" :size="16" class="shrink-0 mt-0.5 text-[#007aff]" />
              <span>该页包含图片，已作为页面上下文参与评分。如需查看原图，可下载批注报告。</span>
            </div>

            <div v-if="eb.imageKey" class="mt-3">
              <img
                :src="`/api/grading/evidence/${eb.evidenceId}/image`"
                class="w-full max-h-[200px] object-contain rounded-[12px] border border-black/[0.06] bg-[#f5f5f7] cursor-zoom-in"
                :alt="`证据图片 页 ${eb.page}`"
                loading="lazy"
                @click="previewImageUrl = `/api/grading/evidence/${eb.evidenceId}/image`"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!filteredEvidence.length" class="flex flex-col items-center justify-center py-12 text-[#aeaeb2] break-inside-avoid">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span class="text-sm">暂无匹配当前筛选条件的证据</span>
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
              <UiInput
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
            <UiButton
              @click="overrideVisible = false"
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none"
            >取消</UiButton>
            <UiButton
              @click="submitOverride"
              :disabled="overriding"
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50"
            >
              <span v-if="overriding" class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></span>
              确认修改
            </UiButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div v-if="previewImageUrl" class="fixed inset-0 z-[9999] flex items-center justify-center" @click="previewImageUrl = null">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <img :src="previewImageUrl" class="relative max-w-[90vw] max-h-[90vh] object-contain rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.4)]" @click.stop />
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
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { message as uiMessage } from '@/services/feedback'
import { ChatDotRound, Edit } from '@/components/ui/icons'
import LucideIcon from '@/components/LucideIcon.vue'
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
const previewImageUrl = ref(null)

const activeDimFilter = ref('all')
const activeKindFilter = ref('all')

const kindOptions = [
  { value: 'all', label: '全部' },
  { value: 'text', label: '文本' },
  { value: 'ocr', label: '图文识别' },
  { value: 'vlm', label: '图片解析' },
  { value: 'vlm_failed', label: '图片页' }
]

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

// 建立 evidenceId -> dimensionId 列表 的映射，用于在证据卡片上显示「支持 xx 维度」
const evidenceDimMap = computed(() => {
  const map = new Map()
  if (!detail.value?.scores) return map
  detail.value.scores.forEach(score => {
    let ids = []
    try {
      const raw = score.evidenceIdsJson
      if (raw) ids = JSON.parse(raw)
    } catch {
      ids = []
    }
    const list = Array.isArray(ids) ? ids : []
    list.forEach(id => {
      if (!map.has(id)) map.set(id, [])
      if (!map.get(id).includes(score.dimensionId)) {
        map.get(id).push(score.dimensionId)
      }
    })
  })
  return map
})

const filteredEvidence = computed(() => {
  const blocks = detail.value?.evidenceBlocks || []
  return blocks.filter(eb => {
    const dimMatch = activeDimFilter.value === 'all' || (evidenceDimMap.value.get(eb.evidenceId) || []).includes(activeDimFilter.value)
    const kindMatch = activeKindFilter.value === 'all' || eb.kind === activeKindFilter.value
    return dimMatch && kindMatch
  })
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
  return { text: 'info', ocr: 'success', vlm: 'warning', vlm_failed: 'image' }[kind] || 'info'
}

function kindLabel(kind) {
  return { text: '文本', ocr: '图文识别', vlm: '图片解析', vlm_failed: '图片页' }[kind] || kind
}

function getDimName(dimensionId) {
  return dimensions.value[dimensionId] || `维度 #${dimensionId}`
}

function countEvidenceIds(score) {
  try {
    const raw = score?.evidenceIdsJson
    if (!raw) return 0
    const ids = JSON.parse(raw)
    return Array.isArray(ids) ? ids.length : 0
  } catch {
    return 0
  }
}

function parseAnnotations(raw) {
  try {
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function formatLocation(raw) {
  try {
    if (!raw) return ''
    const loc = JSON.parse(raw)
    if (loc.paragraphIndex != null && loc.lineIndex != null) return `第 ${loc.paragraphIndex + 1} 段第 ${loc.lineIndex + 1} 行`
    if (loc.paragraphIndex != null) return `第 ${loc.paragraphIndex + 1} 段`
    if (loc.bbox) return '图片位置已记录'
    return ''
  } catch {
    return ''
  }
}

function dimSupportClass(index) {
  const styles = [
    'bg-[rgba(0,122,255,0.08)] text-[#007aff]',
    'bg-[rgba(255,149,0,0.1)] text-[#c2410c]',
    'bg-[rgba(124,58,237,0.08)] text-[#7c3aed]',
    'bg-[rgba(52,199,89,0.12)] text-[#15803d]'
  ]
  return styles[index % styles.length] || styles[0]
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
    uiMessage.success('评分已修改')
    overrideVisible.value = false
    await loadDetail()
  } catch (error) {
    uiMessage.error(error.message)
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
    uiMessage.success('总评已生成')
  } catch (error) {
    uiMessage.error(`生成总评失败: ${error.message}`)
  } finally {
    generatingReview.value = false
  }
}

async function saveReview() {
  savingReview.value = true
  try {
    await saveFinalReview(subId, finalReview.value)
    reviewEdited.value = false
    uiMessage.success('总评已保存')
  } catch (error) {
    uiMessage.error(`保存失败: ${error.message}`)
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
    uiMessage.success('已导入学生报告，学生端可直接查看和导出')
  } catch (error) {
    uiMessage.error(`导入失败: ${error.message}`)
  } finally {
    publishingReport.value = false
  }
}

async function downloadReport() {
  if (!detail.value?.hasDownloadableReport) {
    uiMessage.warning('当前还没有可下载的批注报告')
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
    uiMessage.error(`下载失败: ${error.message}`)
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
    uiMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
</script>
