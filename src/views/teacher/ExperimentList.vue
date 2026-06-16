<template>
  <div class="min-w-0">
    <UiPageHeader title="实验列表" description="管理和查看您创建的所有实验">
      <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="createExperiment">创建实验</UiButton>
    </UiPageHeader>

    <div class="mt-6 rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] p-5 min-w-0 overflow-x-auto max-[640px]:p-4 max-[640px]:rounded-2xl">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr class="border-b border-black/[0.06]">
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tl-xl w-[70px]">ID</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">实验名称</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[120px]">截止日期</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[90px]">提交数</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[90px]">平均分</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[100px]">状态</th>
            <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tr-xl w-[200px]">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="py-12 text-center text-[#86868b] text-sm">正在加载实验列表...</td>
          </tr>
          <tr v-else-if="errorMessage">
            <td colspan="7" class="py-12 text-center">
              <div class="inline-flex flex-col items-center gap-3 text-sm text-[#c44b3f]">
                <span>{{ errorMessage }}</span>
                <UiButton
                  class="h-8 rounded-[9px] border border-[rgba(196,75,63,0.18)] bg-[rgba(196,75,63,0.08)] px-3 text-xs font-semibold text-[#c44b3f] transition-colors hover:bg-[rgba(196,75,63,0.12)]"
                  @click="loadExperiments"
                >
                  重新加载
                </UiButton>
              </div>
            </td>
          </tr>
          <template v-else-if="experiments.length">
            <tr v-for="row in experiments" :key="row.rowKey" class="border-b border-black/[0.04] transition-colors hover:bg-[rgba(194,112,62,0.03)]">
              <td class="py-3 px-3 text-[#6e6e73]">{{ row.displayId }}</td>
              <td class="py-3 px-3 text-[#1d1d1f] font-medium">{{ row.name }}</td>
              <td class="py-3 px-3 text-[#6e6e73]">{{ row.deadline }}</td>
              <td class="py-3 px-3 text-[#1d1d1f]">{{ row.submissionCount }}</td>
              <td class="py-3 px-3 text-[#1d1d1f]">{{ row.averageScore }}</td>
              <td class="py-3 px-3">
                <span class="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold" :class="statusClass(row.status)">{{ getStatusText(row.status) }}</span>
              </td>
              <td class="py-3 px-3">
                <a class="text-[13px] font-medium text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)] transition-colors" @click="viewDetail(row.id)">查看详情</a>
                <a class="text-[13px] font-medium text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)] transition-colors ml-3" @click="viewSubmissions(row.id)">学生提交</a>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="7" class="py-12 text-center text-[#aeaeb2] text-sm">暂无我创建的实验</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import { useUserStore } from '../../store'
import { formatDate } from '@/utils/dateUtils'

const router = useRouter()
const userStore = useUserStore()
const experiments = ref([])
const loading = shallowRef(false)
const errorMessage = shallowRef('')

const getSelectedClassQuery = () => {
  const selectedClass = userStore.selectedClass || {}
  return {
    classId: selectedClass.id,
    classKeyword: selectedClass.ptaKeyword
      || selectedClass.pta_keyword
      || selectedClass.classKeyword
      || selectedClass.class_keyword
      || selectedClass.name
  }
}

const unwrapExperimentList = response => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  if (Array.isArray(response?.experiments)) return response.experiments
  return []
}

const formatNumber = value => {
  if (value === null || value === undefined || value === '') return '-'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return Number.isInteger(numeric) ? numeric : Number(numeric.toFixed(1))
}

const normalizeExperiment = (item = {}, index) => {
  const id = item.id ?? item.experimentId ?? item.experiment_id

  return {
    id,
    rowKey: id ?? `${item.name || item.experimentName || 'experiment'}-${index}`,
    displayId: id ?? '-',
    name: item.name || item.experimentName || item.title || '未命名实验',
    deadline: formatDate(item.deadline || item.dueDate || item.endTime, 'YYYY-MM-DD HH:mm:ss') || '-',
    submissionCount: formatNumber(item.submissionCount ?? item.submittedCount ?? item.submitCount ?? item.submission_count ?? 0),
    averageScore: formatNumber(item.averageScore ?? item.avgScore ?? item.avg_score),
    status: item.status || 'unknown'
  }
}

const loadExperiments = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.getTeacherExperimentList(getSelectedClassQuery())
    if (response?.success === false) throw new Error(response.message || '实验列表加载失败')
    experiments.value = unwrapExperimentList(response).map(normalizeExperiment)
  } catch (e) {
    logger.error('加载实验列表失败:', e)
    experiments.value = []
    errorMessage.value = '实验列表暂时无法加载，请稍后重试'
  } finally {
    loading.value = false
  }
}

const getStatusText = s => ({ active: '进行中', draft: '草稿', expired: '已截止' }[s] || '未知')

function statusClass(status) {
  return {
    active: 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
    draft: 'bg-black/5 text-[#6e6e73]',
    expired: 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]'
  }[status] || 'bg-black/5 text-[#6e6e73]'
}

const createExperiment = () => router.push('/teacher/experiment-create')
const viewDetail = id => router.push(`/teacher/experiment-detail/${id}`)
const viewSubmissions = id => router.push(`/teacher/submissions/${id}`)

onMounted(loadExperiments)
</script>

<style scoped>
.min-w-0 :deep(.ui-page-header .ui-button) {
  margin-top: 1rem;
}
</style>
