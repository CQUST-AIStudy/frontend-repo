<template>
  <div class="min-w-0">
    <UiPageHeader
        title="实验列表"
        description="管理和查看您创建的所有实验"
    >
      <UiButton
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none"
          @click="createExperiment"
      >
        创建实验
      </UiButton>
    </UiPageHeader>

    <div
        class="mt-6 rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] p-5 min-w-0 overflow-x-auto max-[640px]:p-4 max-[640px]:rounded-2xl"
    >
      <!-- 状态筛选 -->
      <div
          class="mb-4 flex w-fit items-center gap-1 rounded-xl bg-[#f5f5f7] p-1"
          role="tablist"
          aria-label="实验状态筛选"
      >
        <button
            v-for="tab in statusTabs"
            :key="tab.value"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.value"
            class="flex h-9 items-center gap-2 rounded-[9px] border-0 px-4 text-[13px] font-medium transition-all cursor-pointer"
            :class="
            activeTab === tab.value
              ? 'bg-white text-[var(--app-primary-strong)] shadow-[0_1px_4px_rgba(0,0,0,0.1)]'
              : 'bg-transparent text-[#6e6e73] hover:text-[#1d1d1f]'
          "
            @click="activeTab = tab.value"
        >
          <span>{{ tab.label }}</span>

          <span
              class="min-w-5 rounded-full bg-black/[0.05] px-1.5 py-0.5 text-center text-[11px]"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- 实验列表 -->
      <table class="w-full min-w-[950px] table-fixed text-left text-[13px]">
        <thead>
        <tr class="border-b border-black/[0.06]">
          <th
              class="w-[70px] rounded-tl-xl bg-[#f9f9f9] px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6e6e73]"
          >
            ID
          </th>

          <th
              class="w-[260px] bg-[#f9f9f9] px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6e6e73]"
          >
            实验名称
          </th>

          <th
              class="w-[165px] bg-[#f9f9f9] px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6e6e73]"
          >
            截止日期
          </th>

          <th
              class="w-[90px] bg-[#f9f9f9] px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6e6e73]"
          >
            提交数
          </th>

          <th
              class="w-[90px] bg-[#f9f9f9] px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6e6e73]"
          >
            平均分
          </th>

          <th
              class="w-[100px] bg-[#f9f9f9] px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6e6e73]"
          >
            状态
          </th>

          <th
              class="w-[180px] rounded-tr-xl bg-[#f9f9f9] px-3 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6e6e73]"
          >
            操作
          </th>
        </tr>
        </thead>

        <tbody>
        <!-- 加载状态 -->
        <tr v-if="loading">
          <td
              colspan="7"
              class="py-12 text-center text-sm text-[#86868b]"
          >
            正在加载实验列表...
          </td>
        </tr>

        <!-- 错误状态 -->
        <tr v-else-if="errorMessage">
          <td colspan="7" class="py-12 text-center">
            <div
                class="inline-flex flex-col items-center gap-3 text-sm text-[#c44b3f]"
            >
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

        <!-- 实验数据 -->
        <template v-else-if="visibleExperiments.length">
          <tr
              v-for="row in visibleExperiments"
              :key="row.rowKey"
              class="border-b border-black/[0.04] transition-colors hover:bg-[rgba(194,112,62,0.03)]"
          >
            <td class="px-3 py-3 text-[#6e6e73]">
              {{ row.displayId }}
            </td>

            <!-- 实验名称固定宽度，超长省略 -->
            <td class="min-w-0 px-3 py-3">
              <div
                  class="truncate font-medium text-[#1d1d1f]"
                  :title="row.name"
              >
                {{ row.name }}
              </div>
            </td>

            <td class="px-3 py-3 text-[#6e6e73]">
              {{ row.deadline }}
            </td>

            <td class="px-3 py-3 text-[#1d1d1f]">
              {{ row.submissionCount }}
            </td>

            <td class="px-3 py-3 text-[#1d1d1f]">
              {{ row.averageScore }}
            </td>

            <td class="px-3 py-3">
                <span
                    class="inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold"
                    :class="statusClass(row.status)"
                >
                  {{ getStatusText(row.status) }}
                </span>
            </td>

            <td class="whitespace-nowrap px-3 py-3">
              <a
                  class="cursor-pointer text-[13px] font-medium text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
                  @click="viewDetail(row.id)"
              >
                查看详情
              </a>

              <a
                  class="ml-3 cursor-pointer text-[13px] font-medium text-[var(--app-primary)] transition-colors hover:text-[var(--app-primary-strong)]"
                  @click="viewSubmissions(row.id)"
              >
                学生提交
              </a>
            </td>
          </tr>
        </template>

        <!-- 空状态 -->
        <tr v-else>
          <td
              colspan="7"
              class="py-12 text-center text-sm text-[#aeaeb2]"
          >
            {{ emptyStateText }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import logger from '@/utils/logger'
import { formatDate } from '@/utils/dateUtils'

import api from '../../api'
import { useUserStore } from '../../store'
import { getExperimentRowsByStatus } from './experimentListRows.mjs'

const router = useRouter()
const userStore = useUserStore()

const experiments = ref([])
const activeTab = shallowRef('active')
const loading = shallowRef(false)
const errorMessage = shallowRef('')

const visibleExperiments = computed(() =>
    getExperimentRowsByStatus(experiments.value, activeTab.value)
)

const statusTabs = computed(() => [
  {
    value: 'active',
    label: '进行中',
    count: experiments.value.filter(item => item.status === 'active').length
  },
  {
    value: 'expired',
    label: '已截止',
    count: experiments.value.filter(item => item.status === 'expired').length
  }
])

const emptyStateText = computed(() =>
    activeTab.value === 'active'
        ? '暂无进行中的实验'
        : '暂无已截止的实验'
)

const getSelectedClassQuery = () => {
  const selectedClass = userStore.selectedClass || {}

  return {
    classId: selectedClass.id,
    classKeyword:
        selectedClass.ptaKeyword ||
        selectedClass.pta_keyword ||
        selectedClass.classKeyword ||
        selectedClass.class_keyword ||
        selectedClass.name
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
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return String(value)
  }

  return Number.isInteger(numeric)
      ? numeric
      : Number(numeric.toFixed(1))
}

const normalizeExperiment = (item = {}, index) => {
  const id = item.id ?? item.experimentId ?? item.experiment_id
  const rawDeadline = item.deadline || item.dueDate || item.endTime
  const parsedDeadline = new Date(rawDeadline).getTime()

  return {
    id,
    rowKey:
        id ??
        `${item.name || item.experimentName || 'experiment'}-${index}`,
    displayId: id ?? '-',
    name:
        item.name ||
        item.experimentName ||
        item.title ||
        '未命名实验',
    deadline:
        formatDate(rawDeadline, 'YYYY-MM-DD HH:mm:ss') || '-',
    deadlineTimestamp: Number.isFinite(parsedDeadline)
        ? parsedDeadline
        : null,
    submissionCount: formatNumber(
        item.submissionCount ??
        item.submittedCount ??
        item.submitCount ??
        item.submission_count ??
        0
    ),
    averageScore: formatNumber(
        item.averageScore ??
        item.avgScore ??
        item.avg_score
    ),
    status: item.status || 'unknown'
  }
}

const loadExperiments = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.getTeacherExperimentList(
        getSelectedClassQuery()
    )

    if (response?.success === false) {
      throw new Error(response.message || '实验列表加载失败')
    }

    experiments.value = unwrapExperimentList(response).map(
        normalizeExperiment
    )
  } catch (error) {
    logger.error('加载实验列表失败:', error)

    experiments.value = []
    errorMessage.value = '实验列表暂时无法加载，请稍后重试'
  } finally {
    loading.value = false
  }
}

const getStatusText = status =>
    ({
      active: '进行中',
      draft: '草稿',
      expired: '已截止'
    })[status] || '未知'

const statusClass = status =>
    ({
      active: 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
      draft: 'bg-black/5 text-[#6e6e73]',
      expired: 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]'
    })[status] || 'bg-black/5 text-[#6e6e73]'

const createExperiment = () => {
  router.push('/teacher/experiment-create')
}

const viewDetail = id => {
  router.push(`/teacher/experiment-detail/${id}`)
}

const viewSubmissions = id => {
  router.push(`/teacher/submissions/${id}`)
}

onMounted(loadExperiments)
</script>

<style scoped>
.min-w-0 :deep(.ui-page-header .ui-button) {
  margin-top: 1rem;
}
</style>