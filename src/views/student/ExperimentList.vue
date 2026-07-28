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

        <experiment-tab-content :experiments="filteredExperiments" />

        <!-- 底部：完成情况统计 -->
        <div class="g-bottom-row">
          <div class="g-card [min-width:0]">
            <div class="g-card-head"><span>完成情况</span></div>
            <div ref="progressChartRef" class="g-chart [height:240px] [width:100%]"></div>
            <div class="g-stats [padding:0_4px]">
              <div class="g-stat-line [display:flex] [justify-content:space-between] [padding:8px_0] [border-bottom:1px_solid_#f1f3f4] [font-size:13px] [color:#5f6368] last:[border-bottom:none]"><span>总实验数</span><span class="g-stat-v [font-weight:600] [color:#202124]">{{ allExperiments.length }}</span></div>
              <div class="g-stat-line [display:flex] [justify-content:space-between] [padding:8px_0] [border-bottom:1px_solid_#f1f3f4] [font-size:13px] [color:#5f6368] last:[border-bottom:none]"><span>已完成</span><span class="g-stat-v [color:#1e8e3e] [font-weight:600] [color:#202124]">{{ completedExperiments.length }}</span></div>
              <div class="g-stat-line [display:flex] [justify-content:space-between] [padding:8px_0] [border-bottom:1px_solid_#f1f3f4] [font-size:13px] [color:#5f6368] last:[border-bottom:none]"><span>进行中</span><span class="g-stat-v [font-weight:600] [color:#202124]">{{ inProgressExperiments.length }}</span></div>
              <div class="g-stat-line [display:flex] [justify-content:space-between] [padding:8px_0] [border-bottom:1px_solid_#f1f3f4] [font-size:13px] [color:#5f6368] last:[border-bottom:none]"><span>未开始</span><span class="g-stat-v [font-weight:600] [color:#202124]">{{ notStartedExperiments.length }}</span></div>
              <div class="g-stat-line [display:flex] [justify-content:space-between] [padding:8px_0] [border-bottom:1px_solid_#f1f3f4] [font-size:13px] [color:#5f6368] last:[border-bottom:none]">
                <span>完成率</span>
                <span class="g-stat-v [color:#1a73e8] [font-weight:600] [color:#202124]">{{ completionRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </loading-state>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import LoadingState from '../../components/LoadingState.vue'
import ExperimentTabContent from './components/ExperimentTabContent.vue'
import { useExperimentStore } from '../../store'
import * as echarts from 'echarts'

const experimentStore = useExperimentStore()
const loading = ref(true)
const activeTab = ref('all')
const progressChartRef = ref(null)
let progressChart = null

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

function initChart() {
  if (!progressChartRef.value) return
  if (progressChart) progressChart.dispose()
  progressChart = echarts.init(progressChartRef.value)
  progressChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12, color: '#5f6368' } },
    series: [{ type: 'pie', radius: ['40%', '65%'], center: ['50%', '42%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, position: 'inside', formatter: p => p.value > 0 ? p.name : '', fontSize: 11, color: '#fff' },
      data: [
        { value: completedExperiments.value.length, name: '已完成', itemStyle: { color: '#1e8e3e' } },
        { value: inProgressExperiments.value.length, name: '进行中', itemStyle: { color: '#f59e0b' } },
        { value: notStartedExperiments.value.length, name: '未开始', itemStyle: { color: '#dadce0' } }
      ]
    }]
  })
}

onMounted(async () => {
  loading.value = true
  try {
    if (!experimentStore.experimentList?.length) await experimentStore.fetchExperimentList()
    setTimeout(initChart, 300)
  } catch (e) { logger.error('加载失败:', e) }
  finally { loading.value = false }
})
onBeforeUnmount(() => { progressChart?.dispose() })
</script>

