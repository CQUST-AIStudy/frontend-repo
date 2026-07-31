<template>
  <div class="min-h-screen bg-[var(--app-bg)] p-6">
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

      <div v-else-if="students.length" class="overflow-hidden rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)]">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-[var(--app-border-soft)] text-left text-xs text-[#6e6e73]">
              <th class="px-4 py-3 font-medium">学号</th>
              <th class="px-4 py-3 font-medium">姓名</th>
              <th class="px-4 py-3 font-medium">通过</th>
              <th class="px-4 py-3 font-medium">客观分</th>
              <th class="px-4 py-3 font-medium">教师评语</th>
              <th class="px-4 py-3 font-medium">状态</th>
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from '../../store'
import { message as uiMessage } from '@/services/feedback'
import LucideIcon from '../../components/LucideIcon.vue'
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

watch(selectedClassId, loadExperiments)
onMounted(loadExperiments)
</script>
