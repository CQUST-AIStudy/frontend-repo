<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-[3px] border-black/10 border-t-[#007aff] rounded-full animate-spin"></div>
        <span class="text-[13px] text-[#6e6e73]">加载中...</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="errorMsg" class="rounded-[14px] bg-[#fff3cd] border border-[#ffecb5] p-4 flex items-center gap-3">
      <svg class="w-5 h-5 text-[#ff9500] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
      <div class="min-w-0 flex-1">
        <div class="text-[13px] text-[#86650a]">{{ errorMsg }}</div>
        <div class="mt-1 text-[12px] text-[#9a7b1f]">如果后端画像计算耗时较长，可以稍后重试。</div>
      </div>
      <UiButton
        class="h-[32px] px-4 rounded-[8px] text-[12px] font-medium text-[#86650a] bg-[#fff8e1] hover:bg-[#ffefb8] active:scale-[0.96] transition-all cursor-pointer border border-[#ffecb5]"
        @click="fetchData"
      >
        重试
      </UiButton>
    </div>

    <template v-else>
      <!-- Overview stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[14px] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div class="text-[24px] font-bold text-[#007aff] mb-1">{{ data.totalStudents }}</div>
          <div class="text-[12px] text-[#6e6e73] mt-2">学生总数</div>
        </div>
        <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[14px] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div class="text-[24px] font-bold text-[#34c759] mb-1">{{ tierCount('A') }}</div>
          <div class="text-[12px] text-[#6e6e73] mt-2">优秀 (≥70)</div>
        </div>
        <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[14px] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div class="text-[24px] font-bold text-[#ff9500] mb-1">{{ tierCount('B') }}</div>
          <div class="text-[12px] text-[#6e6e73] mt-2">中等 (40-69)</div>
        </div>
        <div class="text-center p-[18px] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] rounded-[14px] border border-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div class="text-[24px] font-bold text-[#ff3b30] mb-1">{{ tierCount('C') }}</div>
          <div class="text-[12px] text-[#6e6e73] mt-2">需关注 (&lt;40)</div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Bar chart card -->
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <h3 class="text-[15px] font-semibold text-[#1d1d1f] mb-4">班级各维度平均分</h3>
          <div ref="barChartRef" class="h-[350px]"></div>
        </div>
        <!-- Weak ranking table card -->
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <h3 class="text-[15px] font-semibold text-[#1d1d1f] mb-4">薄弱维度排行</h3>
          <div class="overflow-x-auto">
            <UiTable class="w-full text-[13px]">
              <thead>
                <tr class="border-b border-black/[0.06]">
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">维度</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">班级均分</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">低分人数</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">低分占比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in data.weakRanking" :key="idx" class="border-b border-black/[0.03] hover:bg-black/[0.02] transition-colors">
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.dimension }}</td>
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.avgScore }}</td>
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.weakCount }}</td>
                  <td class="py-2.5 px-3">
                    <div class="flex items-center gap-2">
                      <div class="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
                        <div class="h-full w-[var(--progress-width)] rounded-full transition-all" :style="progressWidthStyle(row.weakRatio)" :class="row.weakRatio > 30 ? 'bg-[#ff3b30]' : 'bg-[#ff9500]'"></div>
                      </div>
                      <span class="text-[11px] text-[#6e6e73] whitespace-nowrap">{{ row.weakRatio }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </div>
        </div>
      </div>

      <!-- ABC Tier section -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <h3 class="text-[15px] font-semibold text-[#1d1d1f] mb-4">学生分层 (ABC)</h3>
        <!-- Custom tabs -->
        <div class="flex items-center gap-1 p-1 rounded-[12px] bg-black/[0.04] mb-4">
          <UiButton v-for="(tier, key) in data.tiers" :key="key" @click="activeTab = key"
            class="h-[32px] px-4 rounded-[9px] text-[13px] font-medium transition-all cursor-pointer border-none"
            :class="activeTab === key ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'">
            {{ key }} - {{ tier.label }} ({{ tier.count }}人)
          </UiButton>
        </div>
        <!-- Tab panels -->
        <div v-for="(tier, key) in data.tiers" :key="key" v-show="activeTab === key">
          <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
            <UiTable class="w-full text-[13px]">
              <thead class="sticky top-0 bg-white z-10">
                <tr class="border-b border-black/[0.06]">
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">学号</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">姓名</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">综合分</th>
                  <th class="text-left py-2.5 px-3 font-medium text-[#6e6e73]">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in tier.students" :key="idx" class="border-b border-black/[0.03] hover:bg-black/[0.02] transition-colors">
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.studentId }}</td>
                  <td class="py-2.5 px-3 text-[#1d1d1f]">{{ row.studentName }}</td>
                  <td class="py-2.5 px-3">
                    <div class="flex items-center gap-2">
                      <div class="w-full max-w-[120px] h-2 rounded-full bg-black/[0.06] overflow-hidden">
                        <div class="h-full w-[var(--progress-width)] rounded-full transition-all" :style="progressWidthStyle(Math.round(row.overallScore))" :class="row.overallScore >= 70 ? 'bg-[#34c759]' : row.overallScore >= 40 ? 'bg-[#ff9500]' : 'bg-[#ff3b30]'"></div>
                      </div>
                      <span class="text-[11px] text-[#6e6e73] whitespace-nowrap">{{ Math.round(row.overallScore) }}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3">
                    <UiButton @click="viewStudent(row.studentId)" class="text-[13px] text-[#007aff] hover:text-[#0056b3] font-medium cursor-pointer bg-transparent border-none transition-colors">查看画像</UiButton>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </div>
        </div>
      </div>
    </template>

    <!-- Student profile modal -->
    <AppModal v-model="dialogVisible" :title="'学生画像 - ' + dialogStudentName" width="80%">
      <div v-if="dialogLoading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-[3px] border-black/10 border-t-[#007aff] rounded-full animate-spin"></div>
          <span class="text-[13px] text-[#6e6e73]">加载中...</span>
        </div>
      </div>
      <template v-else>
        <div v-if="dialogProfile.error" class="rounded-[12px] bg-[#fff3cd] border border-[#ffecb5] p-4 text-[13px] text-[#86650a]">
          {{ dialogProfile.error }}
        </div>
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div ref="dialogRadarRef" class="h-[300px]"></div>
          <div ref="dialogTrendRef" class="h-[300px]"></div>
        </div>
        <div v-if="!dialogProfile.error && dialogProfile.feedback" class="mt-3 text-[14px] leading-[1.8] bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] p-[14px_16px] rounded-[10px] border-l-4 border-l-[#34c759]">{{ dialogProfile.feedback }}</div>
        <div v-if="!dialogProfile.error && dialogProfile.patterns?.length" class="mt-3 flex flex-wrap gap-2">
          <span v-for="p in dialogProfile.patterns" :key="p.tag" class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[#007aff]/10 text-[#007aff]">{{ p.tag }}: {{ p.description }}</span>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'
import { getClassProfile, getStudentProfile } from '../../api/tap'
import AppModal from '../../components/AppModal.vue'

const loading = ref(true)
const errorMsg = ref('')
const data = ref({})
const barChartRef = ref(null)
let barChartInst = null
const activeTab = ref('A')

const emptyClassProfile = () => ({
  totalStudents: 0,
  dimensions: [],
  dimensionAvg: {},
  weakRanking: [],
  tiers: {
    A: { label: '优秀', count: 0, students: [] },
    B: { label: '中等', count: 0, students: [] },
    C: { label: '需关注', count: 0, students: [] }
  }
})

// Dialog state
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogStudentName = ref('')
const dialogProfile = ref({})
const dialogRadarRef = ref(null)
const dialogTrendRef = ref(null)

function tierCount(key) {
  return data.value.tiers?.[key]?.count || 0
}

function getDimensionScoreScale(values) {
  const maxValue = Math.max(...values.map(v => Number(v) || 0), 0)
  return maxValue <= 10 ? 10 : 100
}

function dimensionScoreColor(value, scale) {
  const percent = scale === 10 ? (value / 10) * 100 : value
  return percent >= 70 ? '#67C23A' : percent >= 40 ? '#E6A23C' : '#F56C6C'
}

function progressWidthStyle(value) {
  return { '--progress-width': `${value}%` }
}

function isTimeoutError(error) {
  const code = String(error?.code || error?.rawError?.code || '').toUpperCase()
  const message = String(error?.friendlyMessage || error?.message || error?.rawMessage || error?.rawError?.message || '')
  return code === 'ECONNABORTED' || /timeout|timed out|超时/i.test(message)
}

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getClassProfile()
    const d = res?.data || res
    if (!d) throw new Error('后端未返回班级画像数据')
    if (d.error) { errorMsg.value = getFriendlyResponseMessage(d, '班级画像加载失败，请稍后重试'); return }
    data.value = d
    logger.debug('[ClassProfile] 数据加载成功:', {
      totalStudents: d.totalStudents,
      dimensions: d.dimensions,
      dimensionAvg: d.dimensionAvg
    })
    await nextTick()
    setTimeout(() => renderBar(), 100)
  } catch (e) {
    if (isTimeoutError(e)) {
      data.value = emptyClassProfile()
      barChartInst?.dispose()
      barChartInst = null
      logger.warn('[ClassProfile] 班级画像请求超时，回退为空数据界面', e)
      await nextTick()
      return
    }
    errorMsg.value = getFriendlyErrorMessage(e, '班级画像加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function renderBar() {
  if (!barChartRef.value) {
    logger.warn('[ClassProfile] barChartRef 未就绪')
    return
  }
  const dims = data.value.dimensions
  const avg = data.value.dimensionAvg
  if (!dims || !avg) {
    logger.warn('[ClassProfile] 无维度数据', { dims, avg })
    return
  }

  barChartInst?.dispose()
  const chart = echarts.init(barChartRef.value)
  barChartInst = chart

  const values = dims.map(d => Number(avg[d] ?? 0))
  const scoreScale = getDimensionScoreScale(values)
  logger.debug('[ClassProfile] 渲染柱状图', { dims, values })

  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dims, axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', min: 0, max: scoreScale, name: `均分/${scoreScale}分` },
    series: [{
      type: 'bar',
      data: values.map(v => ({
        value: v,
        itemStyle: { color: dimensionScoreColor(v, scoreScale), borderRadius: [4, 4, 0, 0] }
      })),
      barWidth: '50%',
      label: { show: true, position: 'top', formatter: '{c}', fontSize: 12, fontWeight: 600 }
    }],
    grid: { left: 50, right: 20, bottom: 30, top: 30 }
  })
}

const handleProfileResize = () => { barChartInst?.resize() }

async function viewStudent(studentId) {
  dialogVisible.value = true
  dialogLoading.value = true
  dialogStudentName.value = studentId
  dialogProfile.value = {}
  try {
    const res = await getStudentProfile(studentId)
    const d = res?.data || res
    if (!d) throw new Error('后端未返回学生画像数据')
    if (d.error) {
      dialogProfile.value = { error: getFriendlyResponseMessage(d, '学生画像加载失败，请稍后重试') }
      return
    }
    dialogProfile.value = d
    dialogStudentName.value = d.studentName || studentId
    await nextTick()
    if (dialogRadarRef.value && d.radar) {
      const c = echarts.init(dialogRadarRef.value)
      c.setOption({
        radar: {
          indicator: d.radar.dimensions.map((dim) => ({ name: dim, max: 100 })),
          shape: 'polygon'
        },
        series: [{ type: 'radar', data: [{ value: d.radar.scores, areaStyle: { color: 'rgba(64,158,255,0.3)' } }] }]
      })
    }
    if (dialogTrendRef.value && d.trend?.series) {
      const c = echarts.init(dialogTrendRef.value)
      c.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: d.trend.series.map(s => s.name), axisLabel: { rotate: 30, fontSize: 9 } },
        yAxis: { type: 'value', min: 0, max: 100 },
        series: [{ type: 'line', data: d.trend.series.map(s => s.mastery), smooth: true, areaStyle: {} }],
        grid: { left: 40, right: 10, bottom: 50, top: 20 }
      })
    }
  } catch (e) {
    dialogProfile.value = { error: getFriendlyErrorMessage(e, '学生画像加载失败，请稍后重试') }
  } finally {
    dialogLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleProfileResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleProfileResize)
  barChartInst?.dispose()
})
</script>
