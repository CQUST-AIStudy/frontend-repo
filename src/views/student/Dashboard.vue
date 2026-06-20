<template>
  <div class="g-dashboard [min-width:0] [font-family:var(--font-page)]">
    <UiPageHeader title="首页" description="欢迎使用数据结构课程AI辅助系统" />

    <loading-state :loading="loading">
      <div class="g-content [display:flex] [flex-direction:column] [gap:20px] [min-width:0] max-[640px]:[gap:14px]">
        <!-- 统计卡片 -->
        <div class="g-stat-row [display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:16px] max-[1180px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[640px]:[grid-template-columns:1fr]">
          <div class="g-stat-card [background:#fff] [border-radius:16px] [padding:20px] [border:1px_solid_#e5e5e7] [display:flex] [align-items:center] [gap:16px] [transition:box-shadow_0.2s,_transform_0.2s] hover:[box-shadow:0_1px_3px_rgba(60,64,67,0.15),_0_4px_8px_rgba(60,64,67,0.08)] hover:[transform:translateY(-1px)] max-[640px]:[padding:16px] max-[640px]:[border-radius:14px]" v-for="s in statCards" :key="s.label">
            <div class="g-stat-icon [width:44px] [height:44px] [border-radius:12px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]" :class="statIconClass(s)">
              <ui-icon :size="20"><component :is="s.icon" /></ui-icon>
            </div>
            <div class="g-stat-body">
              <div class="g-stat-label [font-size:12px] [color:#6e6e73] [margin-bottom:4px]">{{ s.label }}</div>
              <div class="g-stat-num [font-size:26px] [font-weight:600] [color:#1d1d1f] [line-height:1.1]">{{ s.value }}</div>
              <div class="g-stat-extra [font-size:12px] [color:#6e6e73] [margin-top:4px]" v-if="s.extra" v-html="s.extra"></div>
            </div>
          </div>
        </div>

        <!-- 图表行-->
        <div class="g-chart-row [display:grid] [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:16px] max-[1180px]:[grid-template-columns:1fr]">
          <div class="g-card g-card-half [background:#fff] [border-radius:16px] [padding:20px] [border:1px_solid_#e5e5e7] [min-width:0] max-[640px]:[padding:16px] max-[640px]:[border-radius:14px]">
            <div class="g-card-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:16px] [font-size:15px] [font-weight:500] [color:#1d1d1f] max-[640px]:[align-items:flex-start] max-[640px]:[flex-direction:column] max-[640px]:[gap:8px]">
              <span>实验完成情况</span>
              <a class="g-link [font-size:13px] [color:var(--app-primary)] [cursor:pointer] [font-weight:500] hover:[text-decoration:underline]" @click="nav('/student/experiments')">查看全部</a>
            </div>
            <div ref="progressChartRef" class="g-chart [height:280px] [width:100%] max-[640px]:[height:240px] [height:240px]"></div>
          </div>
          <div class="g-card g-card-half [background:#fff] [border-radius:16px] [padding:20px] [border:1px_solid_#e5e5e7] [min-width:0] max-[640px]:[padding:16px] max-[640px]:[border-radius:14px]">
            <div class="g-card-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:16px] [font-size:15px] [font-weight:500] [color:#1d1d1f] max-[640px]:[align-items:flex-start] max-[640px]:[flex-direction:column] max-[640px]:[gap:8px]"><span>各实验掌握度趋势</span></div>
            <div ref="scoreChartRef" class="g-chart [height:280px] [width:100%] max-[640px]:[height:240px] [height:240px]"></div>
          </div>
        </div>

        <!-- AI 功能入口 -->
        <div class="g-card [background:#fff] [border-radius:16px] [padding:20px] [border:1px_solid_#e5e5e7] max-[640px]:[padding:16px] max-[640px]:[border-radius:14px]">
          <div class="g-card-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:16px] [font-size:15px] [font-weight:500] [color:#1d1d1f] max-[640px]:[align-items:flex-start] max-[640px]:[flex-direction:column] max-[640px]:[gap:8px]"><span>AI 辅助学习中心</span></div>
          <div class="g-feature-grid [display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:12px] max-[1180px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[640px]:[grid-template-columns:1fr]">
            <div class="g-feature-item [display:flex] [align-items:center] [gap:12px] [padding:16px] [border-radius:12px] [border:1px_solid_#f5f5f7] [cursor:pointer] [transition:all_0.2s] hover:[background:#f5f5f7] hover:[border-color:#d1d1d6] hover:[box-shadow:0_1px_3px_rgba(60,64,67,0.1)]" v-for="f in features" :key="f.path" @click="nav(f.path)">
              <ui-icon class="g-feature-icon [color:var(--app-primary)] [flex-shrink:0]" :size="24"><component :is="f.icon" /></ui-icon>
              <div>
                <div class="g-feature-title [font-size:13px] [font-weight:500] [color:#1d1d1f]">{{ f.title }}</div>
                <div class="g-feature-desc [font-size:11px] [color:#6e6e73] [margin-top:2px]">{{ f.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近实验+ 薄弱点-->
        <div class="g-bottom-row [display:grid] [grid-template-columns:minmax(0,_2fr)_minmax(280px,_1fr)] [gap:16px] max-[1180px]:[grid-template-columns:1fr]">
          <div class="g-card g-card-wide [background:#fff] [border-radius:16px] [padding:20px] [border:1px_solid_#e5e5e7] [min-width:0] max-[640px]:[padding:16px] max-[640px]:[border-radius:14px]">
            <div class="g-card-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:16px] [font-size:15px] [font-weight:500] [color:#1d1d1f] max-[640px]:[align-items:flex-start] max-[640px]:[flex-direction:column] max-[640px]:[gap:8px]">
              <span>最近实验</span>
              <a class="g-link [font-size:13px] [color:var(--app-primary)] [cursor:pointer] [font-weight:500] hover:[text-decoration:underline]" @click="nav('/student/experiments')">查看全部</a>
            </div>
            <div class="g-exp-list [display:flex] [flex-direction:column]">
              <div class="g-exp-item [display:flex] [align-items:center] [gap:12px] [padding:12px_0] [border-bottom:1px_solid_#f5f5f7] [cursor:pointer] [transition:background_0.15s] [&:last-child]:[border-bottom:none] hover:[background:#f5f5f7] hover:[margin:0_-20px] hover:[padding:12px_20px] hover:[border-radius:8px]" v-for="e in recentExperiments" :key="e.id"
                   @click="nav('/student/experiment-detail/' + e.id)">
                <div class="g-exp-dot [width:8px] [height:8px] [border-radius:50%] [flex-shrink:0]" :class="'dot-' + e.status"></div>
                <div class="g-exp-info [flex:1] [min-width:0]">
                  <div class="g-exp-name [font-size:13px] [font-weight:500] [color:#1d1d1f] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">{{ e.name }}</div>
                  <div class="g-exp-meta [display:flex] [align-items:center] [gap:8px] [margin-top:3px] max-[640px]:[align-items:flex-start] max-[640px]:[flex-direction:column] max-[640px]:[gap:4px]">
                    <span class="g-exp-tag [font-size:11px] [padding:1px_8px] [border-radius:100px]" :class="'tag-' + e.status">{{ statusLabel(e.status) }}</span>
                    <span v-if="e.deadline" class="g-exp-date [font-size:11px] [color:#aeaeb2]">截止: {{ e.deadline }}</span>
                  </div>
                </div>
                <ui-icon class="g-exp-arrow [color:#aeaeb2] [flex-shrink:0]"><ArrowRight /></ui-icon>
              </div>
              <div v-if="!recentExperiments.length" class="g-empty-hint [text-align:center] [padding:24px_0] [font-size:13px] [color:#aeaeb2]">暂无实验数据</div>
            </div>
          </div>
          <div class="g-card g-card-narrow [background:#fff] [border-radius:16px] [padding:20px] [border:1px_solid_#e5e5e7] [min-width:0] max-[640px]:[padding:16px] max-[640px]:[border-radius:14px]">
            <div class="g-card-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:16px] [font-size:15px] [font-weight:500] [color:#1d1d1f] max-[640px]:[align-items:flex-start] max-[640px]:[flex-direction:column] max-[640px]:[gap:8px]"><span>薄弱知识点</span></div>
            <div v-if="profileData.weaknesses && profileData.weaknesses.length" class="g-weak-list [display:flex] [flex-direction:column] [gap:10px]">
              <div v-for="(w, i) in profileData.weaknesses" :key="i" class="g-weak-item [display:flex] [align-items:center] [gap:8px]">
                <span class="g-weak-tag [font-size:11px] [padding:2px_8px] [border-radius:100px] [background:#fce8e6] [color:#d93025] [white-space:nowrap]">{{ w.dimension }}</span>
                <span class="g-weak-text [font-size:12px] [color:#6e6e73] [flex:1] [min-width:0] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">{{ w.experimentName }}</span>
                <span class="g-weak-score [font-size:12px] [font-weight:500] [color:#1d1d1f]">{{ Math.round(w.mastery) }}分</span>
              </div>
            </div>
            <div v-else class="g-empty-hint [text-align:center] [padding:24px_0] [font-size:13px] [color:#aeaeb2]">暂无数据</div>
            <div class="g-weak-action [margin-top:16px] [text-align:center]">
              <UiButton class="g-pill-btn [background:#fff] [border:1px_solid_#e5e5e7] [border-radius:100px] [padding:8px_20px] [font-size:13px] [color:var(--app-primary)] [font-weight:500] [cursor:pointer] [transition:all_0.2s] hover:[background:#f5f5f7] hover:[border-color:var(--app-primary)]" @click="nav('/student/weakness-training')">去专项训练</UiButton>
            </div>
          </div>
        </div>
      </div>
    </loading-state>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed, onMounted, onBeforeUnmount, nextTick, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { Notebook, TrendCharts, Finished, Collection, Document, DataAnalysis, ChatDotRound, ArrowRight } from '@/components/ui/icons'
import LoadingState from '../../components/LoadingState.vue'
import { useExperimentStore } from '../../store'
import * as echarts from 'echarts'
import axios from 'axios'
import { API_BASE_URL } from '../../config/runtime'

const API_BASE = API_BASE_URL
const router = useRouter()
const experimentStore = useExperimentStore()
const loading = ref(true)
const profileData = ref({})
const progressChartRef = ref(null)
const scoreChartRef = ref(null)
let progressChart = null, scoreChart = null

function nav(path) { router.push(path) }

const features = [
  { icon: markRaw(Document), title: 'AI 实验报告', desc: '智能生成专业实验报告', path: '/student/ai-report' },
  { icon: markRaw(DataAnalysis), title: 'AI 学情分析', desc: '精准定位薄弱知识点', path: '/student/learning-analysis' },
  { icon: markRaw(ChatDotRound), title: 'AI 学习助手', desc: 'AI助手为您解答疑惑', path: '/student/ai-assistant' },
  { icon: markRaw(TrendCharts), title: '能力画像', desc: '全面了解能力分布', path: '/student/ability-profile' }
]

const stats = computed(() => {
  let list = experimentStore.experimentList; if (!Array.isArray(list)) list = []
  const completed = list.filter(e => e.status === 'completed').length
  return { total: list.length, rate: list.length ? Math.round(completed / list.length * 100) : 0 }
})

const trendHtml = computed(() => {
  const d = profileData.value.trend?.direction
  if (d === 'up') return '<span class="[color:#1e8e3e]">←进步</span>'
  if (d === 'down') return '<span class="[color:#d93025]">←下降</span>'
  return '<span class="[color:#6e6e73]">←平稳</span>'
})

const statCards = computed(() => [
  { label: '实验总数', value: stats.value.total, bg: '#e8f2ff', color: '#c2703e', icon: markRaw(Notebook), extra: `完成率${stats.value.rate}%` },
  { label: '总提交次数', value: profileData.value.overview?.totalSubmissions || 0, bg: '#e6f4ea', color: '#1e8e3e', icon: markRaw(TrendCharts), extra: `AC率 ${profileData.value.overview?.overallAcRate || 0}%` },
  { label: '通过次数', value: profileData.value.overview?.totalAc || 0, bg: '#fef7e0', color: '#e37400', icon: markRaw(Finished), extra: trendHtml.value },
  { label: '推荐练习', value: stats.value.total, bg: '#f3e8fd', color: '#8430ce', icon: markRaw(Collection), extra: null }
])

function statIconClass(item) {
  if (item.bg === '#e8f0fe') return '[background:#e8f0fe] [color:#c2703e]'
  if (item.bg === '#e6f4ea') return '[background:#e6f4ea] [color:#1e8e3e]'
  if (item.bg === '#fef7e0') return '[background:#fef7e0] [color:#e37400]'
  if (item.bg === '#f3e8fd') return '[background:#f3e8fd] [color:#8430ce]'
  return '[background:#f5f5f7] [color:#6e6e73]'
}

const recentExperiments = computed(() => {
  let list = experimentStore.experimentList; if (!Array.isArray(list)) return []
  return [...list].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5)
})

function statusLabel(s) { return s === 'completed' ? '已完成' : s === 'in_progress' ? '进行中' : '未开始' }

function initProgressChart() {
  if (!progressChartRef.value) return
  if (progressChart) progressChart.dispose()
  progressChart = echarts.init(progressChartRef.value)
  const list = experimentStore.experimentList || []
  const completed = list.filter(e => e.status === 'completed').length
  progressChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 12, color: '#6e6e73' } },
    series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '42%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, position: 'inside', formatter: p => p.value > 0 ? p.name : '', fontSize: 11, color: '#fff' },
      data: [
        { value: completed, name: '已完成', itemStyle: { color: '#1e8e3e' } },
        { value: list.length - completed, name: '未开始', itemStyle: { color: '#d1d1d6' } }
      ]
    }]
  })
}

function initScoreChart() {
  if (!scoreChartRef.value) return
  if (scoreChart) scoreChart.dispose()
  const series = profileData.value.trend?.series
  if (!series || !series.length) return
  scoreChart = echarts.init(scoreChartRef.value)
  scoreChart.setOption({
    tooltip: { trigger: 'axis', formatter: params => params[0].name + '<br/>掌握度 ' + params[0].value + '分' },
    grid: { left: 45, right: 16, bottom: 55, top: 16 },
    xAxis: { type: 'category', data: series.map(x => x.name), axisLabel: { rotate: 35, fontSize: 10, color: '#6e6e73' }, axisLine: { lineStyle: { color: '#e5e5e7' } } },
    yAxis: { type: 'value', min: 0, max: 100, splitLine: { lineStyle: { type: 'dashed', color: '#e5e5e7' } }, axisLabel: { fontSize: 11, color: '#6e6e73' } },
    series: [{ type: 'line', data: series.map(x => x.mastery), smooth: true, symbolSize: 6,
      lineStyle: { color: '#c2703e', width: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(26,115,232,0.15)' }, { offset: 1, color: 'rgba(26,115,232,0.01)' }]) },
      itemStyle: { color: '#c2703e', borderColor: '#fff', borderWidth: 2 },
      markLine: { data: [{ type: 'average', label: { formatter: '均值{c}', fontSize: 10 } }], lineStyle: { color: '#e37400', type: 'dashed', width: 1 } }
    }]
  })
}

async function loadData() {
  loading.value = true
  try {
    await experimentStore.fetchExperimentList()
    try {
      const res = await axios.get(`${API_BASE}/api/profile/me`, { withCredentials: true })
      profileData.value = res.data || res || {}
    } catch {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      if (userInfo.usernum) {
        const res = await axios.get(`${API_BASE}/api/profile/student/${userInfo.usernum}`, { withCredentials: true })
        profileData.value = res.data || res || {}
      }
    }
    loading.value = false
    await nextTick()
    setTimeout(() => { initProgressChart(); initScoreChart() }, 200)
  } catch (e) { logger.error('Dashboard loadData error:', e); loading.value = false }
}

function handleResize() { progressChart?.resize(); scoreChart?.resize() }
onMounted(() => { loadData(); window.addEventListener('resize', handleResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', handleResize); progressChart?.dispose(); scoreChart?.dispose() })
</script>

