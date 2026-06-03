<template>
  <div class="min-w-0">
    <UiPageHeader title="实验列表" description="管理和查看您创建的所有实验">
      <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="createExperiment">创建实验</UiButton>
    </UiPageHeader>

    <div class="mt-6 rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] p-5 min-w-0 overflow-x-auto max-[640px]:p-4 max-[640px]:rounded-2xl">
      <UiTable class="w-full text-left text-[13px]">
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
          <tr v-for="row in experiments" :key="row.id" class="border-b border-black/[0.04] transition-colors hover:bg-[rgba(0,122,255,0.03)]">
            <td class="py-3 px-3 text-[#6e6e73]">{{ row.id }}</td>
            <td class="py-3 px-3 text-[#1d1d1f] font-medium">{{ row.name }}</td>
            <td class="py-3 px-3 text-[#6e6e73]">{{ row.deadline }}</td>
            <td class="py-3 px-3 text-[#1d1d1f]">{{ row.submissionCount }}</td>
            <td class="py-3 px-3 text-[#1d1d1f]">{{ row.averageScore }}</td>
            <td class="py-3 px-3">
              <span class="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold" :class="statusClass(row.status)">{{ getStatusText(row.status) }}</span>
            </td>
            <td class="py-3 px-3">
              <a class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors" @click="viewDetail(row.id)">查看详情</a>
              <a class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors ml-3" @click="viewSubmissions(row.id)">学生提交</a>
            </td>
          </tr>
          <tr v-if="!experiments.length">
            <td colspan="7" class="py-12 text-center text-[#aeaeb2] text-sm">暂无实验数据</td>
          </tr>
        </tbody>
      </UiTable>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'

const router = useRouter()
const experiments = ref([])

const loadExperiments = async () => {
  try {
    const response = await api.getTeacherExperimentList()
    if (response?.data && Array.isArray(response.data)) experiments.value = response.data
    else if (Array.isArray(response)) experiments.value = response
    else experiments.value = response?.data?.data || []
  } catch (e) { logger.error('加载实验列表失败:', e); experiments.value = [] }
}

const getStatusText = s => ({ active: '进行中', draft: '草稿', expired: '已截止' }[s] || '未知')

function statusClass(status) {
  return {
    active: 'bg-[rgba(52,199,89,0.12)] text-[#34c759]',
    draft: 'bg-black/5 text-[#6e6e73]',
    expired: 'bg-[rgba(255,59,48,0.1)] text-[#ff3b30]'
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
