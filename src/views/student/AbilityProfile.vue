<template>
  <div class="ability-profile [padding:0] [font-family:var(--font-page)]">
    <div v-if="loading" class="loading-container [padding:40px] [display:flex] [justify-content:center] [align-items:center] [min-height:400px] [width:100%]">
      <ui-skeleton :rows="10" animated />
    </div>
    <ui-alert v-else-if="errorMsg" :title="errorMsg" type="warning" show-icon :closable="false" />
    <template v-else>
      <!-- 概览卡片 -->
      <ui-row :gutter="16" class="overview-row [margin-bottom:20px]">
        <ui-col :span="6" v-for="item in overviewCards" :key="item.label">
          <ui-card shadow="hover" class="stat-card [border-radius:16px] [border:1px_solid_#dadce0] [box-shadow:none] hover:[box-shadow:0_1px_3px_rgba(60,64,67,0.15),_0_4px_8px_rgba(60,64,67,0.08)] [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[align-items:center] [&_.ui-card__body]:[gap:14px] [&_.ui-card__body]:[padding:18px] [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-icon [width:48px] [height:48px] [border-radius:12px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]" :class="overviewIconClass(item)">
              <ui-icon :size="24" color="#fff"><component :is="item.icon" /></ui-icon>
            </div>
            <div class="stat-info [flex:1]">
              <div class="stat-value [font-size:24px] [font-weight:600] [color:#202124] [font-weight:bold] [color:#d18a61] [font-size:28px] [font-weight:700] [margin-bottom:5px]" :class="overviewValueClass(item)">{{ item.value }}</div>
              <div class="stat-label [font-size:13px] [color:#5f6368] [margin-top:2px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">{{ item.label }}</div>
            </div>
          </ui-card>
        </ui-col>
      </ui-row>

      <!-- 雷达图 + 趋势 -->
      <ui-row :gutter="16" class="[margin-top:16px]">
        <ui-col :span="12">
          <ui-card shadow="hover">
            <template #header><span class="card-title [font-weight:500] [font-size:15px] [color:#202124] [font-weight:600] [font-size:16px]"><LucideIcon name="target" :size="18" class="mr-2" /> 能力雷达图</span></template>
            <div ref="radarChartRef" class="chart-box [height:340px] [width:100%] [min-width:0]"></div>
          </ui-card>
        </ui-col>
        <ui-col :span="12">
          <ui-card shadow="hover">
            <template #header>
              <span class="card-title [font-weight:600] [font-size:16px] [color:#202124]"><LucideIcon name="trend" :size="18" class="mr-2" /> 学期趋势</span>
              <ui-tag :type="trendTagType" size="small" class="[margin-left:8px]" effect="dark">{{ trendText }}</ui-tag>
            </template>
            <div ref="trendChartRef" class="chart-box [height:340px] [width:100%] [min-width:0]"></div>
          </ui-card>
        </ui-col>
      </ui-row>

      <!-- AI学习建议 (全宽) -->
      <ui-card shadow="hover" class="feedback-card [margin-top:16px]">
        <template #header>
          <div class="[display:flex] [align-items:center] [justify-content:space-between]">
            <span class="card-title [font-weight:600] [font-size:16px] [color:#202124]"><LucideIcon name="bot" :size="18" class="mr-2" /> AI 学习建议</span>
            <ui-button type="primary" size="small" :loading="refreshingFeedback" @click="handleRefreshFeedback" round>
              {{ refreshingFeedback ? '分析中...' : '重新分析' }}
            </ui-button>
          </div>
        </template>
        <div v-if="refreshingFeedback" class="feedback-loading [padding:10px_0]">
          <ui-skeleton :rows="4" animated />
          <div class="feedback-loading-tip [text-align:center] [color:#5f6368] [font-size:13px] [margin-top:12px]">正在调用 DeepSeek 分析学习数据，请稍候...</div>
        </div>
        <div v-else-if="profile.feedback" class="feedback-content [font-size:14px] [line-height:1.9] [color:#202124] [background:#e6f4ea] [padding:20px_24px] [border-radius:12px] [border-left:4px_solid_#1e8e3e] [background:#f8f9fa] [padding:16px] [border-radius:8px] [border-left:4px_solid_#d18a61]" v-html="renderedFeedback"></div>
        <div v-else class="feedback-empty [padding:20px_0]">
          <ui-empty description="暂无AI分析，点击上方按钮生成" :image-size="80" />
        </div>
      </ui-card>

      <!-- 学习特征 -->
      <ui-card shadow="hover" class="[margin-top:16px]">
        <template #header><span class="card-title [font-weight:600] [font-size:16px] [color:#202124]"><LucideIcon name="tags" :size="18" class="mr-2" /> 学习特征</span></template>
        <ui-row :gutter="16">
          <ui-col :span="8" v-for="p in profile.patterns" :key="p.tag">
            <div class="pattern-card [display:flex] [gap:12px] [padding:14px] [border-radius:12px] [border:1px_solid_#e8eaed] [transition:transform_.2s] [height:100%] hover:[transform:translateX(4px)]" :class="'pattern-' + patternClass(p.tag)">
              <div class="pattern-icon [flex-shrink:0] [margin-top:2px]"><LucideIcon :name="patternEmoji(p.tag)" :size="28" /></div>
              <div class="pattern-body">
                <div class="pattern-tag-name [font-weight:500] [font-size:15px] [color:#202124]">{{ p.tag }}</div>
                <div class="pattern-desc [font-size:13px] [color:#5f6368] [margin-top:3px] [font-size:12px] [margin-top:2px]">{{ p.description }}</div>
                <div class="pattern-evidence [font-size:12px] [color:#9aa0a6] [margin-top:4px]"><LucideIcon name="bar-chart" :size="14" class="mr-1" /> {{ p.evidence }}</div>
              </div>
            </div>
          </ui-col>
        </ui-row>
      </ui-card>

      <!-- Top薄弱点 -->
      <ui-card shadow="hover" class="[margin-top:16px]">
        <template #header><span class="card-title [font-weight:600] [font-size:16px] [color:#202124]"><LucideIcon name="alert-triangle" :size="18" class="mr-2" /> Top 薄弱点</span></template>
        <ui-row :gutter="16">
          <ui-col :span="8" v-for="(w, idx) in profile.weaknesses" :key="w.experimentId">
            <div class="weakness-card [background:#fff] [border:1px_solid_#fde2e2] [border-radius:12px] [padding:16px] [position:relative] [transition:box-shadow_.2s] [height:100%] hover:[box-shadow:0_4px_12px_rgba(245,108,108,0.15)] [width:100%] [border:1px_solid_#e8eef6] [border-radius:16px] [padding:14px] [text-align:left] [cursor:pointer] [transition:.2s] hover:[border-color:#e8c4b0] hover:[box-shadow:0_10px_24px_rgba(143,_79,_49,_0.08)] hover:[transform:translateY(-1px)] [&.active]:[border-color:#e8c4b0] [&.active]:[box-shadow:0_10px_24px_rgba(143,_79,_49,_0.08)] [&.active]:[transform:translateY(-1px)]">
              <div class="weakness-rank [position:absolute] [top:-8px] [left:-8px] [width:28px] [height:28px] [background:#F56C6C] [color:#fff] [border-radius:50%] [display:flex] [align-items:center] [justify-content:center] [font-weight:700] [font-size:13px]">#{{ idx + 1 }}</div>
              <div class="weakness-header [display:flex] [align-items:center] [justify-content:space-between]">
                <span class="weakness-name [font-weight:600] [font-size:14px]">{{ w.experimentName }}</span>
                <ui-tag type="danger" size="small" effect="plain">{{ w.dimension }}</ui-tag>
              </div>
              <ui-progress :percentage="Math.round(w.mastery)" :color="masteryColor(w.mastery)" :stroke-width="12" class="[margin:10px_0]" />
              <div class="weakness-evidence [display:flex] [gap:10px] [font-size:12px] [color:#909399] [flex-wrap:wrap]">
                <span><LucideIcon name="pen" :size="14" class="mr-1" /> 提交{{ w.evidence?.totalSubmissions }}次</span>
                <span><LucideIcon name="check-mark" :size="14" class="mr-1" /> AC{{ w.evidence?.acCount }}次</span>
                <span><LucideIcon name="circle-x" :size="14" class="mr-1" /> 编译错误{{ w.evidence?.compileErrors }}</span>
              </div>
              <div v-if="w.weakQuestions?.length" class="weakness-questions [margin-top:8px] [padding-top:8px] [border-top:1px_dashed_#fde2e2]">
                <div class="q-title [font-size:12px] [color:#606266] [font-weight:600]">薄弱题目:</div>
                <div v-for="q in w.weakQuestions" :key="q.serial_number" class="q-item [font-size:12px] [color:#909399]">
                  题{{ q.serial_number }}: 尝试{{ q.attempts }}次, AC{{ q.ac_count }}次
                </div>
              </div>
            </div>
          </ui-col>
        </ui-row>
      </ui-card>

      <!-- 技能树 -->
      <ui-card shadow="hover" class="[margin-top:16px]">
        <template #header><span class="card-title [font-weight:600] [font-size:16px] [color:#202124]"><LucideIcon name="tree" :size="18" class="mr-2" /> 技能树详情</span></template>
        <div class="skill-tree [display:flex] [flex-direction:column] [gap:20px]">
          <div v-for="dim in profile.skillTree" :key="dim.dimension" class="tree-dimension [border:1px_solid_#eee] [border-radius:12px] [overflow:hidden] [transition:box-shadow_.2s] hover:[box-shadow:0_2px_12px_rgba(0,0,0,0.06)]">
            <div class="tree-dim-header [display:flex] [align-items:center] [justify-content:space-between] [padding:14px_18px] [background:#fafafa] [&.dim-good]:[background:linear-gradient(90deg,_#f0f9eb,_#fafafa)] [&.dim-medium]:[background:linear-gradient(90deg,_#fdf6ec,_#fafafa)] [&.dim-weak]:[background:linear-gradient(90deg,_#fef0f0,_#fafafa)]" :class="'dim-' + dim.level">
              <div class="dim-left [display:flex] [align-items:center] [gap:8px]">
                <span class="dim-icon"><LucideIcon :name="dimEmoji(dim.dimension)" :size="20" /></span>
                <span class="dim-name [font-size:16px] [font-weight:700] [color:#303133]">{{ dim.dimension }}</span>
                <ui-tag :type="levelTagType(dim.level)" size="small" effect="dark">{{ dim.avgMastery }}分</ui-tag>
              </div>
              <span class="dim-desc [font-size:12px] [color:#909399]">{{ dim.description }}</span>
            </div>
            <div class="tree-leaves [display:grid] [grid-template-columns:repeat(auto-fill,_minmax(240px,_1fr))] [gap:1px] [background:#f0f0f0]">
              <div v-for="c in dim.children" :key="c.experimentId"
                   class="tree-leaf [background:#fff] [padding:12px_16px] [transition:background_.15s] hover:[background:#f9f9f9]" :class="'leaf-' + c.level">
                <div class="leaf-top [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:6px]">
                  <span class="leaf-name [font-size:13px] [font-weight:600] [color:#303133]">{{ c.name }}</span>
                  <span class="leaf-score [font-size:14px] [font-weight:700]" :class="masteryColorClass(c.mastery)">{{ c.mastery }}分</span>
                </div>
                <div class="leaf-bar [height:6px] [background:#f0f0f0] [border-radius:3px] [overflow:hidden]">
                  <div class="leaf-bar-fill h-full w-[var(--progress-width)] rounded-[3px] transition-[width] duration-[600ms] ease-[ease]" :class="masteryGradientClass(c.mastery)" :style="progressWidthStyle(c.mastery)"></div>
                </div>
                <div class="leaf-bottom [display:flex] [gap:12px] [font-size:11px] [color:#909399] [margin-top:6px]" v-if="c.totalSubmissions">
                  <span>提交{{ c.totalSubmissions }}</span>
                  <span>AC{{ c.acCount }}</span>
                  <span>{{ c.questionCount }}题</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ui-card>
    </template>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import axios from 'axios'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { DataAnalysis, Finished, List as ListIcon, TrendCharts } from '@/components/ui/icons'
import LucideIcon from '@/components/LucideIcon.vue'
import { message as uiMessage } from '@/services/feedback'
import { renderSafeMarkdown } from '@/utils/safeHtml'
import { API_BASE_URL } from '../../config/runtime'
import { getTapToken } from '../../constants/auth'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'

const API_BASE = API_BASE_URL
const loading = ref(true)
const errorMsg = ref('')
const profile = ref({})
const radarChartRef = ref(null)
const trendChartRef = ref(null)
const refreshingFeedback = ref(false)
let radarChart = null
let trendChart = null

function profileRequestConfig() {
  const tapToken = getTapToken()
  return {
    withCredentials: true,
    headers: tapToken ? { Authorization: `Bearer ${tapToken}` } : undefined
  }
}

const overviewCards = computed(() => [
  { label: '总提交次数', value: profile.value.overview?.totalSubmissions || 0, icon: TrendCharts, color: '#d18a61', bg: 'linear-gradient(135deg,#d18a61,#e8c4b0)' },
  { label: '通过次数', value: profile.value.overview?.totalAc || 0, icon: Finished, color: '#67C23A', bg: 'linear-gradient(135deg,#67C23A,#95d475)' },
  { label: '总体AC率', value: (profile.value.overview?.overallAcRate || 0) + '%', icon: DataAnalysis, color: '#E6A23C', bg: 'linear-gradient(135deg,#E6A23C,#eebe77)' },
  { label: '已参与实验', value: (profile.value.overview?.experimentsCovered || 0) + '/' + (profile.value.overview?.totalExperiments || 19), icon: ListIcon, color: '#909399', bg: 'linear-gradient(135deg,#909399,#b1b3b8)' }
])

function overviewIconClass(item) {
  if (item.color === '#d18a61') return '[background:linear-gradient(135deg,#d18a61,#e8c4b0)]'
  if (item.color === '#67C23A') return '[background:linear-gradient(135deg,#67C23A,#95d475)]'
  if (item.color === '#E6A23C') return '[background:linear-gradient(135deg,#E6A23C,#eebe77)]'
  return '[background:linear-gradient(135deg,#909399,#b1b3b8)]'
}

function overviewValueClass(item) {
  if (item.color === '#d18a61') return '[color:#d18a61]'
  if (item.color === '#67C23A') return '[color:#67C23A]'
  if (item.color === '#E6A23C') return '[color:#E6A23C]'
  return '[color:#909399]'
}

const trendText = computed(() => {
  const d = profile.value.trend?.direction
  return d === 'up' ? '↑ 进步' : d === 'down' ? '↓ 下降' : '→ 平稳'
})
const trendTagType = computed(() => {
  const d = profile.value.trend?.direction
  return d === 'up' ? 'success' : d === 'down' ? 'danger' : 'info'
})

// Markdown渲染
const renderedFeedback = computed(() => {
  if (!profile.value.feedback) return ''
  return renderSafeMarkdown(profile.value.feedback)
})

function masteryColor(v) { return v >= 70 ? '#67C23A' : v >= 40 ? '#E6A23C' : '#F56C6C' }
function masteryColorClass(v) { return v >= 70 ? '[color:#67C23A]' : v >= 40 ? '[color:#E6A23C]' : '[color:#F56C6C]' }
function masteryGradientClass(v) {
  if (v >= 70) return '[background:linear-gradient(90deg,#95d475,#67C23A)]'
  if (v >= 40) return '[background:linear-gradient(90deg,#eebe77,#E6A23C)]'
  return '[background:linear-gradient(90deg,#fab6b6,#F56C6C)]'
}
function progressWidthStyle(value) {
  return { '--progress-width': `${value}%` }
}
function levelTagType(l) { return l === 'good' ? 'success' : l === 'medium' ? 'warning' : 'danger' }
function patternClass(tag) {
  if (tag === '稳定进步' || tag === '表现均衡') return 'good'
  if (tag === '高波动型') return 'warn'
  return 'bad'
}
function patternEmoji(tag) {
  const map = { '稳定进步': 'trend', '表现均衡': 'scale', '高波动型': 'trend-down', '高重做型': 'refresh', '编码基础薄弱': 'wrench' }
  return map[tag] || 'clipboard-text'
}
function dimEmoji(dim) {
  const map = { '线性表': 'ruler', '栈与队列': 'library', '树': 'tree', '图': 'network', '哈希': 'hash', '综合': 'target' }
  return map[dim] || 'package'
}

async function handleRefreshFeedback() {
  refreshingFeedback.value = true
  try {
    const studentId = profile.value.studentId
    let url = `${API_BASE}/api/profile/feedback/refresh/me`
    if (studentId) url = `${API_BASE}/api/profile/feedback/refresh/${studentId}`
    const res = await axios.post(url, null, profileRequestConfig())
    const data = res.data || res
    if (data.error) { uiMessage.error(getFriendlyResponseMessage(data, '刷新失败，请稍后重试')) }
    else if (data.feedback) { profile.value.feedback = data.feedback; uiMessage.success('AI分析已更新') }
  } catch (e) { uiMessage.error(getFriendlyErrorMessage(e, '刷新失败，请稍后重试')) }
  finally { refreshingFeedback.value = false }
}

async function fetchProfile() {
  loading.value = true
  try {
    let res
    try {
      res = await axios.get(`${API_BASE}/api/profile/me`, profileRequestConfig())
    } catch {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const usernum = userInfo.usernum
      if (!usernum) { errorMsg.value = '未绑定学号，无法查看能力画像'; return }
      res = await axios.get(`${API_BASE}/api/profile/student/${usernum}`, profileRequestConfig())
    }
    const data = res.data || res
    if (data.error) { errorMsg.value = getFriendlyResponseMessage(data, '能力画像加载失败，请稍后重试'); return }
    profile.value = data
    await nextTick()
    setTimeout(() => {
      initRadar()
      initTrend()
      // Second attempt after layout stabilizes
      setTimeout(() => {
        radarChart?.resize()
        trendChart?.resize()
      }, 500)
    }, 300)
  } catch (e) { errorMsg.value = getFriendlyErrorMessage(e, '能力画像加载失败，请稍后重试') }
  finally { loading.value = false }
}

function initRadar() {
  if (!radarChartRef.value || !profile.value.radar) return
  if (radarChart) radarChart.dispose()
  radarChart = echarts.init(radarChartRef.value)
  const r = profile.value.radar
  radarChart.setOption({
    tooltip: { trigger: 'item' },
    radar: {
      indicator: r.dimensions.map(d => ({ name: d, max: 100 })),
      shape: 'polygon', radius: '65%',
      axisName: { color: '#333', fontSize: 13, fontWeight: 'bold' },
      splitArea: { areaStyle: { color: ['rgba(209, 138, 97,0.05)', 'rgba(209, 138, 97,0.1)'] } },
      splitLine: { lineStyle: { color: '#ddd' } }, axisLine: { lineStyle: { color: '#ccc' } }
    },
    series: [{ type: 'radar', symbol: 'circle', symbolSize: 6, data: [{
      value: r.scores, name: '能力值',
      areaStyle: { color: 'rgba(209, 138, 97,0.25)' }, lineStyle: { color: '#d18a61', width: 2 },
      itemStyle: { color: '#d18a61', borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: p => p.value + '', color: '#d18a61', fontSize: 11 }
    }] }]
  })
}

function initTrend() {
  if (!trendChartRef.value || !profile.value.trend?.series?.length) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(trendChartRef.value)
  const s = profile.value.trend.series
  trendChart.setOption({
    tooltip: { trigger: 'axis', formatter: params => params[0].name + '<br/>掌握度: ' + params[0].value + '分' },
    xAxis: { type: 'category', data: s.map(x => x.name), axisLabel: { rotate: 35, fontSize: 10, color: '#666' }, axisLine: { lineStyle: { color: '#ddd' } } },
    yAxis: { type: 'value', min: 0, max: 100, name: '掌握度', nameTextStyle: { color: '#999' }, splitLine: { lineStyle: { type: 'dashed', color: '#eee' } } },
    series: [{ type: 'line', data: s.map(x => x.mastery), smooth: true,
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(209, 138, 97,0.3)' }, { offset: 1, color: 'rgba(209, 138, 97,0.02)' }]) },
      lineStyle: { color: '#d18a61', width: 2.5 }, itemStyle: { color: '#d18a61', borderColor: '#fff', borderWidth: 2 }, symbolSize: 7,
      markLine: { data: [{ type: 'average', name: '平均', label: { formatter: '均值 {c}' } }], lineStyle: { color: '#E6A23C', type: 'dashed' } }
    }],
    grid: { left: 50, right: 20, bottom: 55, top: 35 }
  })
}

function handleResize() { radarChart?.resize(); trendChart?.resize() }
onMounted(() => { fetchProfile(); window.addEventListener('resize', handleResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', handleResize); radarChart?.dispose(); trendChart?.dispose() })
</script>


