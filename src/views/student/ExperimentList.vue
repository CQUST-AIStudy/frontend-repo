<template>
  <div class="g-page [min-width:0] [font-family:var(--font-page)]">
    <UiPageHeader title="实验列表" description="数据结构课程所有实验项目" />

    <loading-state :loading="loading">
      <div class="g-content [display:flex] [flex-direction:column] [gap:20px] [min-width:0] max-[640px]:[gap:14px]">
        <!-- 标签页-->
        <div class="g-tabs [display:flex] [gap:0] [border-bottom:1px_solid_#dadce0] [margin-bottom:4px] max-[640px]:[overflow-x:auto]">
          <UiButton v-for="t in tabs" :key="t.key" class="g-tab [background:none] [border:none] [padding:10px_20px] [font-size:14px] [font-weight:500] [color:#5f6368] [cursor:pointer] [border-bottom:2px_solid_transparent] [transition:all_0.2s] [&.active]:[color:#1a73e8] [&.active]:[border-bottom-color:#1a73e8] max-[640px]:[flex:1] max-[640px]:[min-width:96px] max-[640px]:[padding-inline:12px] max-[640px]:[white-space:nowrap]" :class="{ active: activeTab === t.key }"
                  @click="activeTab = t.key">
            {{ t.label }} ({{ t.count }})
          </UiButton>
        </div>

        <section class="g-progress-summary [display:flex] [align-items:center] [gap:32px] [padding:18px_22px] [background:#fff] [border:1px_solid_#ece8e1] [border-radius:12px] [box-shadow:0_2px_8px_rgba(60,47,35,0.05)] max-[768px]:[align-items:stretch] max-[768px]:[flex-direction:column] max-[768px]:[gap:18px] max-[640px]:[padding:16px]" aria-label="实验完成概览">
          <div class="g-progress-overview [flex:1] [min-width:220px] max-[768px]:[min-width:0]">
            <div class="[display:flex] [align-items:baseline] [justify-content:space-between] [gap:16px] [margin-bottom:10px]">
              <span class="[font-size:14px] [font-weight:600] [color:#3c4043]">学习进度</span>
              <strong class="[font-size:22px] [line-height:1] [color:#e98b52]">{{ completionRate }}%</strong>
            </div>
            <div class="g-progress-track [height:8px] [overflow:hidden] [background:#f2eee9] [border-radius:999px]" role="progressbar" aria-label="实验完成率" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="completionRate">
              <span class="g-progress-fill [display:block] [height:100%] [background:#e98b52] [border-radius:inherit] [transition:width_0.3s_ease]" :style="{ width: `${completionRate}%` }"></span>
            </div>
          </div>

          <div class="g-progress-stats [display:grid] [grid-template-columns:repeat(4,minmax(82px,1fr))] [min-width:440px] [border-left:1px_solid_#eee9e3] max-[768px]:[min-width:0] max-[768px]:[border-left:none] max-[768px]:[border-top:1px_solid_#eee9e3] max-[768px]:[padding-top:16px] max-[520px]:[grid-template-columns:repeat(2,minmax(0,1fr))] max-[520px]:[row-gap:16px]">
            <div class="[display:flex] [flex-direction:column] [align-items:center] [gap:5px] [padding:0_14px]">
              <span class="[font-size:12px] [color:#8a8178]">总实验数</span>
              <strong class="[font-size:20px] [line-height:1.2] [color:#3c4043]">{{ allExperiments.length }}</strong>
            </div>
            <div class="[display:flex] [flex-direction:column] [align-items:center] [gap:5px] [padding:0_14px]">
              <span class="[font-size:12px] [color:#8a8178]">已完成</span>
              <strong class="[font-size:20px] [line-height:1.2] [color:#1e8e3e]">{{ completedExperiments.length }}</strong>
            </div>
            <div class="[display:flex] [flex-direction:column] [align-items:center] [gap:5px] [padding:0_14px]">
              <span class="[font-size:12px] [color:#8a8178]">进行中</span>
              <strong class="[font-size:20px] [line-height:1.2] [color:#e59a23]">{{ inProgressExperiments.length }}</strong>
            </div>
            <div class="[display:flex] [flex-direction:column] [align-items:center] [gap:5px] [padding:0_14px]">
              <span class="[font-size:12px] [color:#8a8178]">未开始</span>
              <strong class="[font-size:20px] [line-height:1.2] [color:#9aa0a6]">{{ notStartedExperiments.length }}</strong>
            </div>
          </div>
        </section>

        <experiment-tab-content :experiments="filteredExperiments" />
      </div>
    </loading-state>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed, onMounted } from 'vue'
import LoadingState from '../../components/LoadingState.vue'
import ExperimentTabContent from './components/ExperimentTabContent.vue'
import { useExperimentStore } from '../../store'

const experimentStore = useExperimentStore()
const loading = ref(true)
const activeTab = ref('all')

const allExperiments = computed(() => {
  let list = experimentStore.experimentList; if (!Array.isArray(list)) return []; return [...list]
})
const completedExperiments = computed(() => allExperiments.value.filter(e => e.status === 'completed'))
const inProgressExperiments = computed(() => allExperiments.value.filter(e => e.status === 'in_progress'))
const notStartedExperiments = computed(() => allExperiments.value.filter(e => e.status === 'not_started'))
const completionRate = computed(() => {
  const t = allExperiments.value.length; return t ? Math.round(completedExperiments.value.length / t * 100) : 0
})

const filteredExperiments = computed(() => {
  if (activeTab.value === 'completed') return completedExperiments.value
  if (activeTab.value === 'in-progress') return inProgressExperiments.value
  if (activeTab.value === 'not-started') return notStartedExperiments.value
  return allExperiments.value
})

const tabs = computed(() => [
  { key: 'all', label: '全部', count: allExperiments.value.length },
  { key: 'completed', label: '已完成', count: completedExperiments.value.length },
  { key: 'in-progress', label: '进行中', count: inProgressExperiments.value.length },
  { key: 'not-started', label: '未开始', count: notStartedExperiments.value.length }
])

onMounted(async () => {
  loading.value = true
  try {
    if (!experimentStore.experimentList?.length) await experimentStore.fetchExperimentList()
  } catch (e) { logger.error('加载失败:', e) }
  finally { loading.value = false }
})
</script>

