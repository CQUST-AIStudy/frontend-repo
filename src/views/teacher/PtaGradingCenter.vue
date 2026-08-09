<template>
  <div class="min-h-screen bg-[var(--app-bg)] p-6 max-[640px]:p-4">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="m-0 text-[20px] font-semibold text-[#1d1d1f] mb-1">PTA 批改</h1>
        <p class="m-0 text-[14px] text-[#6e6e73]">基于 PTA 客观判题结果评分，AI 生成教师评语，可批量发布给学生</p>
      </div>

      <!-- 选择题集(实验) -->
      <div class="mb-5 rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-4">
        <div class="flex flex-wrap items-end gap-4">
          <div class="min-w-[140px]">
            <label class="mb-1.5 block text-xs font-medium text-[#6e6e73]">当前教学班</label>
            <div class="h-9 flex items-center px-3 rounded-lg bg-[var(--app-bg)] text-sm text-[var(--app-text)] font-medium">
              {{ selectedClassName }}
            </div>
          </div>
          <div class="min-w-[240px] flex-1">
            <label class="mb-1.5 block text-xs font-medium text-[#6e6e73]">题集 / 实验</label>
            <select
              v-model="selectedOfferingId"
              class="h-9 w-full rounded-lg border border-[var(--app-border-soft)] bg-[var(--app-bg)] px-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
              :disabled="loadingExperiments"
              @change="onOfferingChange"
            >
              <option value="">{{ loadingExperiments ? '加载中…' : '请选择题集' }}</option>
              <option v-for="exp in experiments" :key="expId(exp)" :value="expId(exp)">{{ expName(exp) }}</option>
            </select>
          </div>
          <button
            class="h-9 px-4 rounded-lg bg-[var(--app-primary)] text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!selectedOfferingId || loading"
            @click="loadPreview"
          >
            {{ loading ? '加载中…' : '加载学生' }}
          </button>
        </div>
      </div>

      <!-- 操作栏 -->
      <div v-if="students.length" class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] px-4 py-3">
        <span class="text-sm text-[var(--app-text-soft)]">共 {{ students.length }} 名学生</span>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="generating"
          @click="generate"
        >
          <LucideIcon :name="generating ? 'loader' : 'sparkles'" :size="15" :class="generating ? 'animate-spin' : ''" />
          {{ generating ? 'AI 生成中…' : '批量生成 AI 评语' }}
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-[#e8f8ed] px-4 py-2 text-sm font-semibold text-[#30d158] transition hover:bg-[#d4f5e0] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="publishing || !hasAnyComment"
          @click="publish"
        >
          <LucideIcon :name="publishing ? 'loader' : 'send'" :size="15" :class="publishing ? 'animate-spin' : ''" />
          {{ publishing ? '发布中…' : '发布给学生' }}
        </button>
        <span v-if="tip" class="text-xs text-[var(--app-text-soft)]">{{ tip }}</span>
      </div>

      <!-- 学生列表 -->
      <div v-if="loadError" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ loadError }}</div>

      <div v-else-if="students.length" class="overflow-x-auto rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)]">
        <table class="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-[var(--app-border-soft)] text-left text-xs text-[#6e6e73]">
              <th class="px-4 py-3 font-medium">学号</th>
              <th class="px-4 py-3 font-medium">姓名</th>
              <th class="px-4 py-3 font-medium">通过</th>
              <th class="px-4 py-3 font-medium">客观分</th>
              <th class="px-4 py-3 font-medium">教师评语</th>
              <th class="px-4 py-3 font-medium">状态</th>
              <th class="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in students" :key="s.studentNo" class="border-b border-[var(--app-border-soft)] last:border-0 align-top">
              <td class="px-4 py-3 font-mono text-[13px] text-[var(--app-text)]">{{ s.studentNo }}</td>
              <td class="px-4 py-3 text-[var(--app-text)]">{{ s.studentName || '-' }}</td>
              <td class="px-4 py-3 text-[var(--app-text-soft)]">{{ s.acceptedCount }}/{{ s.problemCount }}</td>
              <td class="px-4 py-3 font-semibold text-[var(--app-text)]">{{ fmtScore(s.score) }}</td>
              <td class="px-4 py-3 max-w-[420px]">
                <span v-if="s.comment" class="whitespace-pre-wrap text-[13px] leading-6 text-[var(--app-text)]">{{ s.comment }}</span>
                <span v-else class="text-xs text-[var(--app-text-soft)]">未生成</span>
              </td>
              <td class="px-4 py-3">
                <span v-if="s.published" class="rounded-full bg-[#e8f8ed] px-2 py-0.5 text-[11px] text-[#30d158]">已发布</span>
                <span v-else-if="s.comment" class="rounded-full bg-[#eef5ff] px-2 py-0.5 text-[11px] text-[var(--app-primary)]">待发布</span>
                <span v-else class="rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[11px] text-[#8a8a8f]">未批改</span>
              </td>
              <td class="px-4 py-3">
                <button
                  class="rounded-lg border border-[var(--app-border-soft)] px-2.5 py-1 text-[12px] text-[var(--app-primary)] transition hover:bg-[#fbf1eb]"
                  @click="openDetail(s)"
                >查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="!loading && selectedOfferingId" class="rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-12 text-center">
        <LucideIcon name="inbox" :size="44" class="mx-auto text-[var(--app-text-soft)]" />
        <p class="mt-4 text-[var(--app-text-soft)]">该题集下暂无学生 PTA 数据，请先在「PTA 数据同步」中同步</p>
      </div>

      <div v-else-if="!selectedOfferingId" class="rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-12 text-center">
        <LucideIcon name="clipboard" :size="44" class="mx-auto text-[var(--app-text-soft)]" />
        <p class="mt-4 text-[var(--app-text-soft)]">选择一个题集，加载学生的 PTA 判题结果进行批改</p>
      </div>
    </div>

    <!-- 学生详情弹窗：每题判题状态 + 代码 + 题面 -->
    <div v-if="detailStudent" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="detailStudent = null">
      <div class="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between border-b border-[var(--app-border-soft)] px-6 py-4">
          <div>
            <div class="text-[16px] font-semibold text-[#1d1d1f]">
              {{ detailStudent.studentName || '-' }}
              <span class="ml-2 font-mono text-[12px] font-normal text-[#6e6e73]">{{ detailStudent.studentNo }}</span>
            </div>
            <div class="mt-1 text-[12px] text-[#6e6e73]">
              通过 {{ detailData?.acceptedCount ?? '-' }}/{{ detailData?.problemCount ?? '-' }} 题 · 客观分 {{ fmtScore(detailData?.score) }}
            </div>
          </div>
          <button class="rounded-lg px-2 py-1 text-[#6e6e73] transition hover:bg-[#f5f5f7]" @click="detailStudent = null">✕</button>
        </div>
        <div class="overflow-y-auto px-6 py-4">
          <div v-if="detailLoading" class="py-10 text-center text-sm text-[#6e6e73]">加载中…</div>
          <template v-else-if="detailData">
            <div v-if="detailData.comment" class="mb-4 rounded-lg bg-[#fbf1eb] px-4 py-3 text-[13px] leading-6 text-[#8a5a3b]">
              <span class="font-medium">教师评语：</span>{{ detailData.comment }}
            </div>
            <div v-for="(p, i) in detailData.problems || []" :key="i" class="mb-4 rounded-xl border border-[var(--app-border-soft)] p-4">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[14px] font-semibold text-[#1d1d1f]">{{ i + 1 }}. {{ p.title || p.problemNo }}</span>
                <span v-if="p.accepted" class="rounded-full bg-[#e8f8ed] px-2 py-0.5 text-[11px] text-[#30d158]">通过</span>
                <span v-else-if="p.status" class="rounded-full bg-[#fdecea] px-2 py-0.5 text-[11px] text-[#c44b3f]">未通过 · {{ p.status }}</span>
                <span v-else class="rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[11px] text-[#8a8a8f]">未提交</span>
                <span class="ml-auto text-[12px] text-[#6e6e73]">得分 {{ p.bestScore ?? '-' }} / {{ p.maxScore ?? '-' }}</span>
              </div>
              <details v-if="p.statement" class="mt-2">
                <summary class="cursor-pointer text-[12px] text-[var(--app-primary)]">查看题面</summary>
                <div class="markdown-body mt-2 max-h-[320px] overflow-auto rounded-lg bg-[#f8f9fa] p-3 text-[13px] leading-[1.7] text-[#1d1d1f] [&_p]:[margin:8px_0] [&_code]:[background:#e8eaed] [&_code]:[padding:2px_6px] [&_code]:[border-radius:4px] [&_code]:[font-size:12px] [&_code]:[color:#d93025] [&_pre]:[background:#f6f8fa] [&_pre]:[color:#24292f] [&_pre]:[padding:12px] [&_pre]:[border-radius:8px] [&_pre]:[overflow-x:auto] [&_pre]:[margin:10px_0] [&_pre_code]:[background:none] [&_pre_code]:[color:inherit] [&_pre_code]:[padding:0] [&_ul]:[padding-left:20px] [&_ol]:[padding-left:20px] [&_li]:[margin:4px_0]" v-html="renderSafeMarkdown(p.statement)"></div>
              </details>
              <pre v-if="p.code" class="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-lg bg-[#0f172a] p-3 font-mono text-[12px] leading-5 text-[#e2e8f0]">{{ p.code }}</pre>
              <p v-else class="mt-2 text-[12px] text-[#8a8a8f]">该生本题未提交代码</p>
            </div>
            <section v-if="detailData.studentReflection" class="mt-6 rounded-xl border border-[#eadfd7] bg-[#fffaf7] p-5">
              <div class="mb-3 flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-2 text-[15px] font-semibold text-[#3f3028]">
                  <LucideIcon name="pen" :size="17" class="text-[var(--app-primary)]" />
                  学生心得体会
                </div>
              </div>
              <p v-if="detailData.studentReflection.content" class="m-0 whitespace-pre-wrap text-[13px] leading-7 text-[#4d433e]">
                {{ detailData.studentReflection.content }}
              </p>
            </section>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from '../../store'
import { message as uiMessage } from '@/services/feedback'
import LucideIcon from '../../components/LucideIcon.vue'
import { renderSafeMarkdown } from '@/utils/safeHtml'
import api from '../../api'

const userStore = useUserStore()

const experiments = ref([])
const loadingExperiments = ref(false)
const selectedOfferingId = ref('')
const students = ref([])
const loading = ref(false)
const generating = ref(false)
const publishing = ref(false)
const loadError = ref('')
const tip = ref('')
const detailStudent = ref(null)
const detailData = ref(null)
const detailLoading = ref(false)

const selectedClassId = computed(() => userStore.selectedClass?.id || '')
const selectedClassName = computed(() => userStore.selectedClass?.name || '当前教学班')
const hasAnyComment = computed(() => students.value.some(s => s.comment))

function expId(exp) {
  return exp?.id ?? exp?.offeringId ?? exp?.experimentId
}
function expName(exp) {
  return exp?.name || exp?.title || exp?.experimentName || `题集 ${expId(exp)}`
}
function fmtScore(v) {
  if (v == null) return '-'
  const n = Number(v)
  return Number.isNaN(n) ? String(v) : n.toFixed(1)
}

function normalizeList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

async function loadExperiments() {
  students.value = []
  selectedOfferingId.value = ''
  if (!selectedClassId.value) {
    experiments.value = []
    return
  }
  loadingExperiments.value = true
  try {
    const res = await api.getTeacherExperimentList({ classId: selectedClassId.value })
    experiments.value = normalizeList(res)
  } catch (e) {
    experiments.value = []
  } finally {
    loadingExperiments.value = false
  }
}

function onOfferingChange() {
  students.value = []
  loadError.value = ''
  tip.value = ''
}

async function loadPreview() {
  if (!selectedOfferingId.value) return
  loading.value = true
  loadError.value = ''
  tip.value = ''
  try {
    const res = await api.previewPtaGrading(Number(selectedOfferingId.value))
    const data = res?.data || res
    students.value = Array.isArray(data?.students) ? data.students : []
  } catch (e) {
    loadError.value = e?.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function generate() {
  if (!selectedOfferingId.value) return
  generating.value = true
  tip.value = ''
  try {
    const res = await api.generatePtaGrading(Number(selectedOfferingId.value), false)
    const data = res?.data || res
    tip.value = `已生成 ${data?.generated ?? 0}/${data?.total ?? 0} 条评语`
    await loadPreview()
  } catch (e) {
    uiMessage.error(e?.message || 'AI 评语生成失败')
  } finally {
    generating.value = false
  }
}

async function publish() {
  if (!selectedOfferingId.value) return
  publishing.value = true
  try {
    const res = await api.publishPtaGrading(Number(selectedOfferingId.value))
    const data = res?.data || res
    uiMessage.success(`已发布 ${data?.published ?? 0} 名学生的批改结果`)
    await loadPreview()
  } catch (e) {
    uiMessage.error(e?.message || '发布失败')
  } finally {
    publishing.value = false
  }
}

async function openDetail(s) {
  detailStudent.value = s
  detailData.value = null
  detailLoading.value = true
  try {
    const res = await api.ptaStudentDetail(Number(selectedOfferingId.value), s.studentId)
    detailData.value = res?.data || res
  } catch (e) {
    uiMessage.error(e?.message || '加载学生详情失败')
    detailStudent.value = null
  } finally {
    detailLoading.value = false
  }
}

watch(selectedClassId, loadExperiments)
onMounted(loadExperiments)
</script>
