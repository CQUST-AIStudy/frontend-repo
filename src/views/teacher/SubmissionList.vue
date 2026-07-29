<template>
  <div class="min-h-full px-4 pb-5 bg-[var(--app-bg)] max-md:px-2 max-md:pb-4">
    <UiPageHeader
      class="py-6 max-md:py-4"
      title="学生提交"
      :description="headerDescription"
    >
      <template v-if="experimentId">
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="goBackToExperiment">返回实验详情</UiButton>
      </template>
    </UiPageHeader>

    <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5 mb-5">
      <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
        <h3 class="text-[13px] font-semibold text-[#334155] m-0">筛选条件</h3>
      </div>
      <div class="flex flex-wrap gap-3 items-end">
        <div v-if="!experimentId" class="flex flex-col gap-1">
          <label class="text-xs text-[#6e6e73]">实验</label>
          <UiSelect
            v-model="filterForm.experimentId"
            class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none appearance-none cursor-pointer w-[220px]"
          >
            <UiOption value="">请选择实验</UiOption>
            <UiOption
              v-for="item in experimentOptions"
              :key="item.id"
              :value="item.id"
            >{{ item.id }}: {{ item.name }}</UiOption>
          </UiSelect>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-[#6e6e73]">学生姓名</label>
          <UiInput
            v-model="filterForm.studentName"
            placeholder="请输入学生姓名"
            class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-[#6e6e73]">状态</label>
          <UiSelect
            v-model="filterForm.status"
            class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none appearance-none cursor-pointer w-[150px]"
          >
            <UiOption
              v-for="option in SUBMISSION_STATUS_OPTIONS"
              :key="option.value"
              :value="option.value"
            >{{ option.label }}</UiOption>
          </UiSelect>
        </div>

        <div class="flex gap-2 items-end">
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="applyFilter">查询</UiButton>
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="resetFilter">重置</UiButton>
        </div>
      </div>
    </div>

    <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5 mb-5">
      <div class="mb-4 flex justify-between items-center gap-2.5 flex-wrap">
        <div class="flex flex-wrap gap-2.5">
          <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-black/5 text-[#6e6e73]">总数：{{ filteredSubmissions.length }}</span>
          <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]">已提交：{{ getStatusCount('submitted') }}</span>
          <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[rgba(196,75,63,0.1)] text-[#c44b3f]">未提交：{{ getStatusCount('not_started') }}</span>
          <span v-if="selectedRows.length" class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[var(--app-primary-soft)] text-[var(--app-primary)]">已选：{{ selectedRows.length }}</span>
        </div>

        <div class="flex flex-wrap gap-2">
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5" @click="loadSubmissions">
            <Refresh class="w-4 h-4" />
            刷新
          </UiButton>
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#4cd964] to-[#34c759] shadow-[0_2px_8px_rgba(52,199,89,0.2)] hover:from-[#30d158] hover:to-[#28a745] hover:shadow-[0_2px_8px_rgba(40,167,69,0.3)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0" :disabled="!selectedRows.length" @click="batchGrade">
            <Edit class="w-4 h-4" />
            批量评分
          </UiButton>
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed" :disabled="!selectedRows.length" @click="clearSelection">
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            清空勾选
          </UiButton>
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5" @click="exportData">
            <Download class="w-4 h-4" />
            导出
          </UiButton>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table v-if="pagedSubmissions.length" class="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr class="border-b border-black/[0.06]">
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[55px]">
                <input type="checkbox" :checked="isAllSelected" class="w-4 h-4 cursor-pointer accent-[var(--app-primary)]" @change="toggleSelectAll($event)" />
              </th>
              <th v-if="!experimentId" class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">实验 ID</th>
              <th v-if="!experimentId" class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">实验名称</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">学生姓名</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">班级</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">提交时间</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] text-center">成绩</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] text-center">查重率</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] text-center">状态</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedSubmissions" :key="row.id" class="border-b border-black/[0.04] hover:bg-[rgba(194,112,62,0.03)]">
              <td class="py-3 px-3">
                <input type="checkbox" :checked="selectedRows.some(r => r.id === row.id)" class="w-4 h-4 cursor-pointer accent-[var(--app-primary)]" @change="toggleRowSelection(row, $event)" />
              </td>
              <td v-if="!experimentId" class="py-3 px-3">{{ row.experimentId }}</td>
              <td v-if="!experimentId" class="py-3 px-3 max-w-[180px] truncate">{{ row.experimentName }}</td>
              <td class="py-3 px-3">{{ row.studentName }}</td>
              <td class="py-3 px-3 max-w-[120px] truncate">{{ row.class }}</td>
              <td class="py-3 px-3">
                <span v-if="hasRealSubmitTime(row)">{{ formatDate(row.submitTime) }}</span>
              </td>
              <td class="py-3 px-3 text-center">
                <span v-if="row.score !== null" class="text-base font-bold text-[var(--app-primary)]">{{ row.score }}</span>
                <span v-else class="text-[13px] text-[#aeaeb2]">未评分</span>
              </td>
              <td class="py-3 px-3 text-center">
                <span v-if="row.plagiarismRate !== null" class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold" :class="getPlagiarismRateTagClass(row.plagiarismRate)">
                  {{ row.plagiarismRate }}%
                </span>
                <span v-else class="text-[13px] text-[#aeaeb2]">暂无</span>
              </td>
              <td class="py-3 px-3 text-center">
                <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold" :class="getStatusTagClass(row.status)">
                  {{ getStatusText(row.status) }}
                </span>
              </td>
              <td class="py-3 px-3">
                <div class="flex gap-2">
                  <UiButton class="text-[var(--app-primary)] text-sm font-medium bg-transparent border-none cursor-pointer hover:underline" @click="viewSubmissionDetail(row.id)">详情</UiButton>
                  <UiButton v-if="row.status === 'submitted' && row.score === null" class="text-[#6b8f6b] text-sm font-medium bg-transparent border-none cursor-pointer hover:underline" @click="gradeSubmission(row)">评分</UiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="py-12 text-center">
          <LucideIcon name="clipboard" class="mx-auto mb-3 text-[#c6ccd6]" :size="42" />
          <p class="text-[14px] text-[#aeaeb2]">暂无数据</p>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <AppPagination :current="currentPage" :total="filteredSubmissions.length" :page-size="pageSize" @update:current="handleCurrentChange" />
      </div>
    </div>

    <!-- Grade Dialog -->
    <div v-if="gradeDialogVisible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="gradeDialogVisible = false"></div>
      <div class="relative w-[500px] max-w-[90vw] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6">
        <h3 class="text-lg font-semibold text-[#1d1d1f] mb-5">提交评分</h3>

        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <label class="w-[100px] text-sm text-[#6e6e73] text-right shrink-0">学生姓名</label>
            <span class="text-sm text-[#1d1d1f]">{{ currentSubmission ? currentSubmission.studentName : '' }}</span>
          </div>

          <div class="flex items-center gap-3">
            <label class="w-[100px] text-sm text-[#6e6e73] text-right shrink-0">成绩</label>
            <UiInput
              v-model.number="gradeForm.score"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm w-[120px]"
            />
          </div>

          <div class="flex items-center gap-3">
            <label class="w-[100px] text-sm text-[#6e6e73] text-right shrink-0">查重率</label>
            <div class="flex items-center gap-1.5">
              <UiInput
                v-model.number="gradeForm.plagiarismRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm w-[120px]"
              />
              <span class="text-sm text-[#6e6e73]">%</span>
            </div>
          </div>

          <div class="flex gap-3">
            <label class="w-[100px] text-sm text-[#6e6e73] text-right shrink-0 pt-2.5">AI 评语</label>
            <textarea
              v-model="gradeForm.aiComment"
              rows="6"
              placeholder="请输入AI 评语"
              class="flex-1 px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 mt-6">
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="gradeDialogVisible = false">取消</UiButton>
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="submitGrade">确定</UiButton>
        </div>
      </div>
    </div>
    <!-- Batch Grade Dialog -->
    <div v-if="batchGradeDialogVisible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="batchGradeDialogVisible = false"></div>
      <div class="relative w-[520px] max-w-[90vw] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6">
        <h3 class="text-lg font-semibold text-[#1d1d1f] mb-2">批量评分</h3>
        <p class="text-[13px] text-[#6e6e73] mb-5">已选择 <span class="font-semibold text-[var(--app-primary)]">{{ selectedRows.length }}</span> 条提交记录，将统一设置以下评分信息</p>

        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <label class="w-[100px] text-sm text-[#6e6e73] text-right shrink-0">选择数量</label>
            <span class="text-sm text-[#1d1d1f] font-medium">{{ selectedRows.length }} 条记录</span>
          </div>

          <div class="flex items-center gap-3">
            <label class="w-[100px] text-sm text-[#6e6e73] text-right shrink-0">成绩</label>
            <UiInput
              v-model.number="batchGradeForm.score"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm w-[120px]"
            />
          </div>

          <div class="flex items-center gap-3">
            <label class="w-[100px] text-sm text-[#6e6e73] text-right shrink-0">查重率</label>
            <div class="flex items-center gap-1.5">
              <UiInput
                v-model.number="batchGradeForm.plagiarismRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm w-[120px]"
              />
              <span class="text-sm text-[#6e6e73]">%</span>
            </div>
          </div>

          <div class="flex gap-3">
            <label class="w-[100px] text-sm text-[#6e6e73] text-right shrink-0 pt-2.5">AI 评语</label>
            <textarea
              v-model="batchGradeForm.aiComment"
              rows="6"
              placeholder="请输入AI 评语（将应用于所有选中记录）"
              class="flex-1 px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 mt-6">
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="batchGradeDialogVisible = false">取消</UiButton>
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" :disabled="batchGrading" @click="submitBatchGrade">
            {{ batchGrading ? '提交中...' : '确定批量评分' }}
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { Download, Edit, Refresh } from '@/components/ui/icons'
import api from '../../api'
import { useUserStore } from '../../store'
import AppPagination from '../../components/AppPagination.vue'
import LucideIcon from '../../components/LucideIcon.vue'
import {
  SUBMISSION_STATUS_OPTIONS,
  getSubmissionStatusText,
  normalizeSubmissionStatus
} from './submissionListStatus.mjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const experimentId = computed(() =>
  route.params.experimentId ? Number(route.params.experimentId) : null
)
const headerDescription = computed(() =>
  experimentId.value
    ? `实验 ${experimentName.value || experimentId.value} 的学生提交`
    : '全部学生提交记录'
)

const experimentName = ref('')
const submissions = ref([])
const experimentOptions = ref([])
const tableLoading = ref(false)
const selectedRows = ref([])

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

const currentPage = ref(1)
const pageSize = ref(20)

const filterForm = reactive({
  experimentId: experimentId.value,
  studentName: '',
  status: ''
})

const gradeDialogVisible = ref(false)
const currentSubmission = ref(null)
const gradeForm = reactive({
  score: 0,
  plagiarismRate: 0,
  aiComment: ''
})

const batchGradeDialogVisible = ref(false)
const batchGrading = ref(false)
const batchGradeForm = reactive({
  score: 0,
  plagiarismRate: 0,
  aiComment: ''
})

const normalizeSubmitTime = (value) => {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  if (parsed.getFullYear() <= 2000) return null
  return raw
}

const getSubmitTimestamp = (value) => {
  const normalized = normalizeSubmitTime(value)
  if (!normalized) return -1
  return new Date(normalized).getTime()
}

const filteredSubmissions = computed(() => {
  let result = [...submissions.value]
  if (filterForm.experimentId) {
    result = result.filter((sub) => String(sub.experimentId) === String(filterForm.experimentId))
  }
  if (filterForm.studentName) {
    const keyword = filterForm.studentName.toLowerCase()
    result = result.filter((sub) => String(sub.studentName || '').toLowerCase().includes(keyword))
  }
  if (filterForm.status) {
    result = result.filter((sub) => sub.status === filterForm.status)
  }
  return result.sort((left, right) => {
    const timeDiff = getSubmitTimestamp(right.submitTime) - getSubmitTimestamp(left.submitTime)
    if (timeDiff !== 0) return timeDiff
    return String(left.studentId || '').localeCompare(String(right.studentId || ''))
  })
})

const pagedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredSubmissions.value.slice(start, start + pageSize.value)
})

watch(filteredSubmissions, () => {
  const maxPage = Math.max(1, Math.ceil(filteredSubmissions.value.length / pageSize.value))
  if (currentPage.value > maxPage) currentPage.value = maxPage
  // 筛选变化后清除跨页残留勾选
  selectedRows.value = selectedRows.value.filter(r => filteredSubmissions.value.some(f => f.id === r.id))
})

watch(experimentId, (id) => {
  filterForm.experimentId = id
  currentPage.value = 1
})

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const isAllSelected = computed(() => {
  return filteredSubmissions.value.length > 0 && selectedRows.value.length === filteredSubmissions.value.length
})

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedRows.value = [...pagedSubmissions.value]
  } else {
    selectedRows.value = []
  }
}

const clearSelection = () => {
  selectedRows.value = []
}

const toggleRowSelection = (row, event) => {
  if (event.target.checked) {
    selectedRows.value = [...selectedRows.value, row]
  } else {
    selectedRows.value = selectedRows.value.filter(r => r.id !== row.id)
  }
}

const batchGrade = () => {
  if (!selectedRows.value.length) {
    uiMessage.warning('请先选择要评分的提交记录')
    return
  }
  batchGradeForm.score = 0
  batchGradeForm.plagiarismRate = 0
  batchGradeForm.aiComment = ''
  batchGradeDialogVisible.value = true
}

const formatDate = (dateString) => {
  const normalized = normalizeSubmitTime(dateString)
  if (!normalized) return ''
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return String(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const hasRealSubmitTime = (row) => Boolean(normalizeSubmitTime(row?.submitTime))

const getPlagiarismRateType = (rate) => {
  if (rate >= 50) return 'danger'
  if (rate >= 30) return 'warning'
  return 'success'
}

const getPlagiarismRateTagClass = (rate) => {
  const type = getPlagiarismRateType(rate)
  const classMap = {
    success: 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
    warning: 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]',
    danger: 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]'
  }
  return classMap[type] || 'bg-black/5 text-[#6e6e73]'
}

const getStatusType = (status) => {
  const typeMap = {
    submitted: 'success',
    not_started: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusTagClass = (status) => {
  const type = getStatusType(status)
  const classMap = {
    success: 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
    warning: 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]',
    danger: 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]',
    info: 'bg-black/5 text-[#6e6e73]'
  }
  return classMap[type] || 'bg-black/5 text-[#6e6e73]'
}

const getStatusText = (status) => {
  return getSubmissionStatusText(status)
}

const normalizeStudentId = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const parseSubmissionCompositeId = (submissionId) => {
  if (typeof submissionId !== 'string') return null
  const separatorIndex = submissionId.lastIndexOf('-')
  if (separatorIndex <= 0 || separatorIndex >= submissionId.length - 1) return null
  return {
    studentId: submissionId.slice(0, separatorIndex),
    experimentId: Number(submissionId.slice(separatorIndex + 1))
  }
}

const getStatusPriority = (status) => {
  const priorities = {
    submitted: 2,
    not_started: 1
  }
  return priorities[status] || 0
}

const isLaterSubmission = (candidate, current) => {
  const candidateTime = getSubmitTimestamp(candidate.submitTime)
  const currentTime = getSubmitTimestamp(current.submitTime)

  if (candidateTime !== currentTime) {
    return candidateTime > currentTime
  }

  const candidateStatusPriority = getStatusPriority(candidate.status)
  const currentStatusPriority = getStatusPriority(current.status)
  if (candidateStatusPriority !== currentStatusPriority) {
    return candidateStatusPriority > currentStatusPriority
  }

  return Number(candidate.score ?? -1) > Number(current.score ?? -1)
}

const aggregateLatestSubmissions = (items) => {
  const latestSubmissionMap = new Map()

  items.forEach((item) => {
    const current = latestSubmissionMap.get(item.id)
    if (!current || isLaterSubmission(item, current)) {
      latestSubmissionMap.set(item.id, item)
    }
  })

  return Array.from(latestSubmissionMap.values())
}

const loadSubmissions = async () => {
  tableLoading.value = true
  try {
    const params = {
      ...getSelectedClassQuery(),
      ...(experimentId.value ? { experimentId: experimentId.value } : {})
    }
    const raw = await api.getAllStudentExperiments(params)
    const list = Array.isArray(raw) ? raw : raw?.data || []
    const data = list.map((item) => {
      const status = normalizeSubmissionStatus(item)
      const hasSubmission = status === 'submitted'
      const numericScore = item.score != null && !isNaN(Number(item.score))
        ? Number(item.score)
        : null
      return {
        id: `${normalizeStudentId(item.studentId)}-${item.experimentId}`,
        experimentId: Number(item.experimentId),
        experimentName: item.experimentName,
        studentId: normalizeStudentId(item.studentId),
        studentName: item.studentName,
        studentUsername: item.studentUsername,
        class: item.className,
        submitTime: normalizeSubmitTime(item.submitTime),
        score: numericScore,
        plagiarismRate: hasSubmission ? Number(item.plagiarismRate ?? 0) : null,
        status
      }
    })

    submissions.value = aggregateLatestSubmissions(data)
    if (experimentId.value) {
      const current = submissions.value.find((d) => d.experimentId === experimentId.value)
      if (current) experimentName.value = current.experimentName || ''
    }
  } catch (error) {
    logger.error('加载学生提交失败:', error)
    uiMessage.error(`加载学生提交失败：${error?.message || '未知错误'}`)
  } finally {
    tableLoading.value = false
  }
}

const loadExperimentOptions = async () => {
  try {
    const res = await api.getTeacherExperimentList(getSelectedClassQuery())
    if (Array.isArray(res)) {
      experimentOptions.value = res
    } else if (Array.isArray(res?.data)) {
      experimentOptions.value = res.data
    } else {
      experimentOptions.value = []
    }
  } catch (error) {
    logger.error('加载实验列表失败:', error)
    experimentOptions.value = []
  }
}

const applyFilter = () => {
  currentPage.value = 1
}

const resetFilter = () => {
  filterForm.experimentId = experimentId.value
  filterForm.studentName = ''
  filterForm.status = ''
  currentPage.value = 1
}

const viewSubmissionDetail = (id) => {
  router.push(`/teacher/submission-detail/${id}`)
}

const gradeSubmission = (submission) => {
  currentSubmission.value = submission
  gradeForm.score = 0
  gradeForm.plagiarismRate = 0
  gradeForm.aiComment = ''
  gradeDialogVisible.value = true
}

const submitGrade = async () => {
  if (!currentSubmission.value) return

  try {
    const submissionId = currentSubmission.value.id
    const parsedSubmissionId = parseSubmissionCompositeId(submissionId)
    const studentId = parsedSubmissionId?.studentId
    const expId = parsedSubmissionId?.experimentId

    const gradeData = {
      score: Number(gradeForm.score),
      plagiarismRate: Number(gradeForm.plagiarismRate),
      aiComment: gradeForm.aiComment,
      studentId,
      experimentId: expId
    }

    const res = await api.gradeSubmission(submissionId, gradeData)
    if (res && res.success === false) {
      uiMessage.error(res.message || '评分提交失败')
      return
    }
    uiMessage.success('评分提交成功。')
    gradeDialogVisible.value = false

    const index = submissions.value.findIndex((sub) => sub.id === submissionId)
    if (index > -1) {
      submissions.value[index] = {
        ...submissions.value[index],
        score: Number(gradeForm.score),
        plagiarismRate: Number(gradeForm.plagiarismRate),
        status: 'submitted'
      }
    }
  } catch (error) {
    logger.error('提交评分失败:', error)
    uiMessage.error('提交评分失败，请重试。')
  }
}

const submitBatchGrade = async () => {
  if (!selectedRows.value.length) return

  batchGrading.value = true
  try {
    const submissionIds = selectedRows.value.map(row => row.id)
    const res = await api.batchGradeSubmissions({
      submissionIds,
      score: Number(batchGradeForm.score),
      plagiarismRate: Number(batchGradeForm.plagiarismRate),
      aiComment: batchGradeForm.aiComment
    })
    // 检查后端返回结果
    if (res && res.success === false) {
      uiMessage.error(res.message || '批量评分失败')
      if (res.errors && res.errors.length) {
        logger.error('批量评分错误详情:', res.errors)
      }
      return
    }
    const processed = res?.processed ?? submissionIds.length
    const failed = res?.failed ?? 0
    if (failed > 0) {
      uiMessage.warning(`批量评分部分成功：${processed} 条成功，${failed} 条失败`)
      logger.warn('批量评分部分失败:', res?.errors)
    } else {
      uiMessage.success(`批量评分成功，共处理 ${processed} 条记录。`)
    }
    batchGradeDialogVisible.value = false
    selectedRows.value = []
    await loadSubmissions()
  } catch (error) {
    logger.error('批量评分失败:', error)
    uiMessage.error('批量评分失败，请重试。')
  } finally {
    batchGrading.value = false
  }
}

const goBackToExperiment = () => {
  router.push(`/teacher/experiment-detail/${experimentId.value}`)
}

const getStatusCount = (status) =>
  filteredSubmissions.value.filter((item) => item.status === status).length

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

const exportData = () => {
  const header = [
    '实验 ID',
    '实验名称',
    '学号',
    '学生姓名',
    '班级',
    '提交时间',
    '成绩',
    '查重率',
    '状态'
  ]
  const rows = filteredSubmissions.value.map((item) => [
    item.experimentId,
    item.experimentName,
    item.studentId,
    item.studentName,
    item.class,
    item.submitTime || '',
    item.score ?? '',
    item.plagiarismRate ?? '',
    getStatusText(item.status)
  ])

  const csvContent = [header, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `student_submissions_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  uiMessage.success('导出成功。')
}

onMounted(async () => {
  await loadSubmissions()
  if (!experimentId.value) {
    await loadExperimentOptions()
  }
})
</script>
