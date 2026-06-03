<template>
  <div class="learning-analysis-container">
    <UiPageHeader class="my-page-header [padding:20px]" title="学习分析" description="基于您的PTA平台提交数据的AI深度分析" />

    <loading-state :loading="loading">
      <div class="analysis-content [display:flex] [flex-direction:column] [gap:20px] [padding:10px] [background-color:#f5f7fa] [border-radius:4px] [line-height:1.6]">
        <!-- 总体概览 -->
        <ui-row :gutter="20">
          <ui-col :span="6" v-for="item in overviewCards" :key="item.label">
            <ui-card shadow="hover" class="stat-card [border-radius:16px] [border:1px_solid_#dadce0] [box-shadow:none] hover:[box-shadow:0_1px_3px_rgba(60,64,67,0.15),_0_4px_8px_rgba(60,64,67,0.08)] [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[align-items:center] [&_.ui-card__body]:[gap:14px] [&_.ui-card__body]:[padding:18px] [text-align:center] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
              <div class="stat-icon [width:44px] [height:44px] [border-radius:12px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]" :class="overviewIconClass(item)">
                <ui-icon :size="22" color="#fff"><component :is="item.icon" /></ui-icon>
              </div>
              <div class="stat-info [flex:1]">
                <div class="stat-value [font-size:22px] [font-weight:600] [color:#202124] [font-size:24px] [font-weight:bold] [color:#409EFF] [font-size:28px] [font-weight:700] [margin-bottom:5px]" :class="overviewValueClass(item)">{{ item.value }}</div>
                <div class="stat-label [font-size:13px] [color:#5f6368] [margin-top:2px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">{{ item.label }}</div>
              </div>
            </ui-card>
          </ui-col>
        </ui-row>

        <ui-alert
          v-if="profileData.analyticsFallback"
          type="info"
          :closable="false"
          title="当前仅同步到实验成绩数据，掌握度图表按实验得分展示；提交效率需等待 PTA 提交明细同步后生成。"
          show-icon
        />

        <!-- 雷达图+ 趋势 -->
        <ui-row :gutter="20" class="chart-row [margin-top:0] [margin-bottom:0] [margin-bottom:20px]">
          <ui-col :span="12">
            <ui-card class="chart-card [min-height:420px] [border-radius:16px] [border:1px_solid_#dadce0] [box-shadow:none] [margin-bottom:20px] [height:400px]">
              <template #header><div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [font-size:15px] [font-weight:500] [color:#202124] [align-items:flex-start] [gap:16px] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>知识掌握雷达图</span></div></template>
              <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]"><div ref="radarChartRef" class="chart [width:100%] [height:100%]"></div></div>
            </ui-card>
          </ui-col>
          <ui-col :span="12">
            <ui-card class="chart-card [margin-bottom:20px] [height:400px]">
              <template #header><div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>各实验掌握度趋势</span></div></template>
              <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]"><div ref="trendChartRef" class="chart [width:100%] [height:100%]"></div></div>
            </ui-card>
          </ui-col>
        </ui-row>

        <!-- 实验得分对比 + 能力维度柱状图-->
        <ui-row :gutter="20" class="chart-row [margin-bottom:0] [margin-bottom:20px]">
          <ui-col :span="12">
            <ui-card class="chart-card [margin-bottom:20px] [height:400px]">
              <template #header><div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>各维度能力对比</span></div></template>
              <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]"><div ref="dimBarChartRef" class="chart [width:100%] [height:100%]"></div></div>
            </ui-card>
          </ui-col>
          <ui-col :span="12">
            <ui-card class="chart-card [margin-bottom:20px] [height:400px]">
              <template #header><div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>提交效率分析</span></div></template>
              <div class="chart-container [height:340px] [width:100%] [position:relative] [height:300px] [height:400px] [height:350px] [height:240px] [width:30vw] [height:320px]"><div ref="efficiencyChartRef" class="chart [width:100%] [height:100%]"></div></div>
            </ui-card>
          </ui-col>
        </ui-row>

        <!-- 班级对比分析 -->
        <ui-card class="chart-card [margin-top:20px] [margin-bottom:20px] [height:400px]" v-if="classData && classData.experiments?.length">
          <template #header>
            <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
              <span>📊 班级对比分析</span>
              <div class="class-summary-chips [display:flex] [gap:8px]" v-if="classData.summary">
                <span class="summary-chip [font-size:12px] [padding:3px_10px] [border-radius:100px] [font-weight:500] [&.positive]:[background:#e6f4ea] [&.positive]:[color:#1e8e3e] [&.negative]:[background:#fce8e6] [&.negative]:[color:#d93025] [&.neutral]:[background:#f1f3f4] [&.neutral]:[color:#5f6368] [min-width:min(280px,_100%)] [display:inline-flex] [align-items:center] [gap:8px] [padding:12px_14px] [border-radius:16px] [background:rgba(244,_248,_253,_0.92)] [border:1px_solid_#e3ebf5] [color:#34475d] [line-height:1.6] [word-break:break-word]" :class="avgDiffClass">
                  {{ avgDiffText }}
                </span>
                <span class="summary-chip neutral [font-size:12px] [padding:3px_10px] [border-radius:100px] [font-weight:500] [&.positive]:[background:#e6f4ea] [&.positive]:[color:#1e8e3e] [&.negative]:[background:#fce8e6] [&.negative]:[color:#d93025] [&.neutral]:[background:#f1f3f4] [&.neutral]:[color:#5f6368] [min-width:min(280px,_100%)] [display:inline-flex] [align-items:center] [gap:8px] [padding:12px_14px] [border-radius:16px] [background:rgba(244,_248,_253,_0.92)] [border:1px_solid_#e3ebf5] [color:#34475d] [line-height:1.6] [word-break:break-word]">全{{ classData.summary.experimentCount }} 个实验</span>
              </div>
            </div>
          </template>
          <div class="class-compare-body">
            <!-- 趋势对比图 我的分vs 班级均分 -->
            <div ref="classCompareChartRef" class="[height:300px]"></div>
            <!-- 每个实验的百分位指示 -->
            <div class="percentile-row [display:flex] [flex-direction:column] [gap:6px] [margin-top:12px] [padding:0_4px]">
              <div class="pct-item [display:flex] [align-items:center] [gap:10px]" v-for="exp in classData.experiments" :key="exp.experimentId">
                <div class="pct-name [width:90px] [font-size:11px] [color:#5f6368] [text-align:right] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [flex-shrink:0]" :title="exp.name">{{ shortName(exp.name) }}</div>
                <div class="pct-bar-wrap [flex:1] [height:18px] [background:#f1f3f4] [border-radius:9px] [position:relative] [overflow:hidden]">
                  <div class="pct-bar h-full min-w-0.5 w-[var(--progress-width)] rounded-[9px] transition-[width] duration-[600ms] ease-[ease]" :class="pctColorClass(exp.percentile)" :style="progressWidthStyle(exp.percentile)"></div>
                  <span class="pct-label [position:absolute] [right:8px] [top:50%] [transform:translateY(-50%)] [font-size:10px] [font-weight:500] [color:#202124]">超过{{ exp.percentile }}%</span>
                </div>
              </div>
            </div>
          </div>
        </ui-card>

        <!-- AI智能学情分析 -->
        <ui-alert
          v-else-if="classCompareUnavailableReason"
          class="class-compare-alert [margin-top:20px]"
          type="warning"
          :closable="false"
          :title="classCompareUnavailableReason"
          show-icon
        />

        <ui-card class="ai-analysis-card [margin-top:20px]">
          <template #header>
            <div class="card-header ai-header [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [align-items:flex-start] [gap:16px] [gap:10px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
              <div class="ai-title [display:flex] [align-items:center] [gap:8px] [font-weight:500] [font-size:15px] [color:#202124]">
                <ui-icon class="ai-icon-title [font-size:20px] [color:#1a73e8]"><Connection /></ui-icon>
                <span>AI智能学情分析</span>
              </div>
              <ui-tag type="success" effect="dark">基于真实数据</ui-tag>
            </div>
          </template>
          <div class="ai-analysis-content">
            <!-- 学习特征标签 -->
            <div class="section-block [margin-bottom:24px]">
              <h4>🏷️学习特征</h4>
              <div class="patterns-row [display:flex] [gap:12px] [flex-wrap:wrap]">
                <div v-for="p in profileData.patterns" :key="p.tag" class="pattern-tag-card [display:flex] [gap:10px] [padding:12px_16px] [border-radius:12px] [border:1px_solid_#e8eaed] [flex:1] [min-width:200px] [&.pat-good]:[background:#e6f4ea] [&.pat-good]:[border-color:#ceead6] [&.pat-warn]:[background:#fef7e0] [&.pat-warn]:[border-color:#feefc3] [&.pat-bad]:[background:#fce8e6] [&.pat-bad]:[border-color:#f5c6c2]" :class="patternClass(p.tag)">
                  <span class="pattern-emoji [font-size:24px]">{{ patternEmoji(p.tag) }}</span>
                  <div>
                    <div class="pattern-name [font-weight:500] [font-size:14px] [color:#202124]">{{ p.tag }}</div>
                    <div class="pattern-desc [font-size:13px] [color:#5f6368] [margin-top:3px] [font-size:12px] [margin-top:2px]">{{ p.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 能力趋势 -->
            <div class="section-block [margin-bottom:24px]">
              <h4>📊 各维度能力水平</h4>
              <div class="ability-list [display:flex] [flex-direction:column] [gap:16px]">
                <div v-for="dim in profileData.skillTree" :key="dim.dimension" class="ability-item [padding:12px_16px] [border:1px_solid_#e8eaed] [border-radius:12px]">
                  <div class="ability-header [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:8px]">
                    <span class="ability-name [font-weight:500] [font-size:14px] [color:#202124]">{{ dimEmoji(dim.dimension) }} {{ dim.dimension }}</span>
                    <div class="ability-score [display:flex] [align-items:center] [gap:8px] [font-weight:500]">
                      <span>{{ dim.avgMastery }}分</span>
                      <ui-tag size="small" :type="dim.level === 'good' ? 'success' : dim.level === 'medium' ? 'warning' : 'danger'">
                        {{ dim.level === 'good' ? '掌握良好' : dim.level === 'medium' ? '需要巩固' : '薄弱' }}
                      </ui-tag>
                    </div>
                  </div>
                  <ui-progress :percentage="Math.min(100, Math.round(dim.avgMastery))" :color="masteryColor(dim.avgMastery)" :stroke-width="12" />
                  <div class="ability-desc [font-size:12px] [color:#5f6368] [margin-top:6px]">{{ dim.description }}</div>
                </div>
              </div>
            </div>

            <!-- 薄弱点-->
            <div class="section-block [margin-bottom:24px]" v-if="profileData.weaknesses?.length">
              <h4>⚠️ 重点提升方向</h4>
              <div class="improvement-items [display:flex] [flex-direction:column] [gap:10px]">
                <div v-for="(w, i) in profileData.weaknesses" :key="i" class="improvement-item [display:flex] [align-items:center] [gap:8px] [font-size:14px] [color:#5f6368]">
                  <ui-icon class="improvement-icon [color:#e37400] [font-size:18px] [&.high-priority]:[color:#d93025]" :class="i === 0 ? 'high-priority' : ''"><Warning /></ui-icon>
                  <span>{{ w.experimentName }}（{{ w.dimension }}）掌握度仅{{ Math.round(w.mastery) }}分，建议重点练习</span>
                </div>
              </div>
            </div>
          </div>
        </ui-card>

        <!-- 学习建议 -->
        <ui-card class="[margin-top:20px]">
          <template #header><div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]"><span>📚 学习方法推荐</span></div></template>
          <div class="method-container [display:grid] [grid-template-columns:repeat(auto-fill,_minmax(200px,_1fr))] [gap:16px]">
            <ui-card v-for="(item, index) in learningMethods" :key="index" class="method-card [text-align:center] [border-radius:16px] [border:1px_solid_#dadce0] [box-shadow:none] hover:[box-shadow:0_1px_3px_rgba(60,64,67,0.15),_0_4px_8px_rgba(60,64,67,0.08)]" shadow="hover">
              <div class="method-header [display:flex] [flex-direction:column] [align-items:center] [gap:8px] [margin-bottom:8px]">
                <ui-icon :size="24" class="method-icon [color:#1a73e8]"><component :is="item.icon" /></ui-icon>
                <h4>{{ item.title }}</h4>
              </div>
              <p>{{ item.description }}</p>
            </ui-card>
          </div>
        </ui-card>
      </div>
    </loading-state>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Reading, VideoPlay, ChatDotRound, Notebook, Connection, Warning } from '@/components/ui/icons'
import { TrendCharts, DataAnalysis, Finished, List as ListIcon } from '@/components/ui/icons'
import LoadingState from '../../components/LoadingState.vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { getStudentAnalyticsOverview } from '../../api/tap'
import { API_BASE_URL } from '../../config/runtime'

const API_BASE = API_BASE_URL
const loading = ref(true)
const profileData = ref({})

const classData = ref(null)
const classCompareUnavailableReason = ref('')
const classCompareChartRef = ref(null)
let classCompareChart = null

const radarChartRef = ref(null)
const trendChartRef = ref(null)
const dimBarChartRef = ref(null)
const efficiencyChartRef = ref(null)
let radarChart = null, trendChart = null, dimBarChart = null, efficiencyChart = null

// 班级对比 computed
const avgDiffClass = computed(() => {
  const s = classData.value?.summary
  if (!s) return 'neutral'
  const diff = s.avgMyScore - s.avgClassScore
  return diff >= 5 ? 'positive' : diff <= -5 ? 'negative' : 'neutral'
})
const avgDiffText = computed(() => {
  const s = classData.value?.summary
  if (!s) return ''
  const diff = (s.avgMyScore - s.avgClassScore).toFixed(1)
  return diff >= 0 ? `高于班级均分 +${diff}` : `低于班级均分 ${diff}`
})
function shortName(name) {
  return name && name.length > 8 ? name.substring(0, 8) + '…' : name
}
function pctColorClass(p) {
  if (p >= 75) return '[background:#1e8e3e]'
  if (p >= 50) return '[background:#1a73e8]'
  if (p >= 25) return '[background:#e37400]'
  return '[background:#d93025]'
}

function progressWidthStyle(value) {
  return { '--progress-width': `${value}%` }
}

const overviewCards = computed(() => {
  const o = profileData.value.overview || {}
  return [
    { label: '总提交次数', value: o.totalSubmissions || 0, icon: TrendCharts, color: '#409EFF', bg: 'linear-gradient(135deg,#409EFF,#79bbff)' },
    { label: '通过次数', value: o.totalAc || 0, icon: Finished, color: '#67C23A', bg: 'linear-gradient(135deg,#67C23A,#95d475)' },
    { label: '总体AC率', value: (o.overallAcRate || 0) + '%', icon: DataAnalysis, color: '#E6A23C', bg: 'linear-gradient(135deg,#E6A23C,#eebe77)' },
    { label: '已参与实验', value: (o.experimentsCovered || 0) + '/' + (o.totalExperiments || 19), icon: ListIcon, color: '#909399', bg: 'linear-gradient(135deg,#909399,#b1b3b8)' }
  ]
})

function overviewIconClass(item) {
  if (item.color === '#409EFF') return '[background:linear-gradient(135deg,#409EFF,#79bbff)]'
  if (item.color === '#67C23A') return '[background:linear-gradient(135deg,#67C23A,#95d475)]'
  if (item.color === '#E6A23C') return '[background:linear-gradient(135deg,#E6A23C,#eebe77)]'
  return '[background:linear-gradient(135deg,#909399,#b1b3b8)]'
}

function overviewValueClass(item) {
  if (item.color === '#409EFF') return '[color:#409EFF]'
  if (item.color === '#67C23A') return '[color:#67C23A]'
  if (item.color === '#E6A23C') return '[color:#E6A23C]'
  return '[color:#909399]'
}

const learningMethods = [
  { icon: Reading, title: '系统学习', description: '通过教材和参考书籍系统地学习理论知识，掌握数据结构的基本概念和算法原理。' },
  { icon: Notebook, title: '动手实践', description: '多做实验和编程练习，将理论知识应用到实际问题中，加深对算法的理解。' },
  { icon: Connection, title: '知识关联', description: '将不同的数据结构和算法进行对比和关联，理解它们的优缺点和适用场景。' },
  { icon: VideoPlay, title: '观看教学视频', description: '利用在线教学资源，观看算法演示和可视化过程，帮助理解复杂概念。' },
  { icon: ChatDotRound, title: '小组讨论', description: '与同学交流学习心得和解题思路，通过讲解来加深对知识点的掌握。' }
]

function masteryColor(v) { return v >= 70 ? '#67C23A' : v >= 40 ? '#E6A23C' : '#F56C6C' }
function patternClass(tag) {
  if (tag === '稳定进步' || tag === '表现均衡') return 'pat-good'
  if (tag === '高波动型') return 'pat-warn'
  return 'pat-bad'
}
function patternEmoji(tag) {
  const map = { '稳定进步': '📈', '表现均衡': '⚖️', '高波动型': '🎢', '高重做型': '🔄', '编码基础薄弱': '🔧' }
  return map[tag] || '📋'
}
function dimEmoji(dim) {
  const map = { '线性表': '📏', '栈与队列': '📚', '树': '🌲', '图': '🕸️', '哈希': '#️⃣', '综合': '🎯' }
  return map[dim] || '📦'
}

function resolveCurrentStudentId() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.usernum || userInfo.studentId || userInfo.username || ''
  } catch {
    return ''
  }
}

function hasRenderableProfile(data) {
  return !data?.error
    && Array.isArray(data?.radar?.dimensions)
    && data.radar.dimensions.length > 0
    && Array.isArray(data?.radar?.scores)
    && Array.isArray(data?.trend?.series)
}

async function fetchStudentAnalytics(studentId) {
  try {
    const response = await getStudentAnalyticsOverview(studentId)
    return response?.data || response || null
  } catch (error) {
    logger.warn('获取学生成绩分析降级数据失败:', error)
    return null
  }
}

function scoreValue(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, Math.min(100, Math.round(number * 10) / 10))
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function buildProfileFromAnalytics(payload, studentId) {
  const experiments = (payload.experiments || []).map((item) => ({
    experimentId: item.experimentId,
    name: item.name || `实验${item.experimentId}`,
    mastery: scoreValue(item.myScore)
  }))
  const firstHalf = experiments.slice(0, Math.ceil(experiments.length / 2)).map((item) => item.mastery)
  const secondHalf = experiments.slice(Math.ceil(experiments.length / 2)).map((item) => item.mastery)
  const change = average(secondHalf) - average(firstHalf)
  const radarItems = experiments.length > 8 ? experiments.slice(-8) : experiments

  return {
    analyticsFallback: true,
    studentId,
    overview: {
      totalSubmissions: 0,
      totalAc: 0,
      overallAcRate: 0,
      experimentsCovered: experiments.length,
      totalExperiments: experiments.length
    },
    radar: {
      dimensions: radarItems.map((item) => shortName(item.name)),
      scores: radarItems.map((item) => item.mastery)
    },
    trend: {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'flat',
      series: experiments
    },
    skillTree: [],
    weaknesses: [],
    patterns: []
  }
}

function setEmptyChart(chart, message) {
  chart.setOption({
    graphic: [{
      type: 'text',
      left: 'center',
      top: 'middle',
      style: { text: message, fill: '#909399', fontSize: 14, textAlign: 'center' }
    }]
  })
}

async function loadData() {
  loading.value = true
  try {
    const studentId = resolveCurrentStudentId()
    let res
    try {
      res = await axios.get(`${API_BASE}/api/profile/me`, { withCredentials: true })
    } catch {
      if (studentId) {
        res = await axios.get(`${API_BASE}/api/profile/student/${studentId}`, { withCredentials: true })
      }
    }
    if (res) profileData.value = res.data || res || {}
    if (!hasRenderableProfile(profileData.value) && studentId) {
      const analyticsPayload = await fetchStudentAnalytics(studentId)
      if (analyticsPayload?.experiments?.length) {
        classData.value = analyticsPayload
        profileData.value = buildProfileFromAnalytics(analyticsPayload, studentId)
      }
    }
    loading.value = false
    await nextTick()
    // Use multiple delayed attempts to ensure DOM is fully rendered
    setTimeout(() => {
      initCharts()
      loadClassComparison()
      // Second attempt after layout stabilizes
      setTimeout(() => {
        radarChart?.resize()
        trendChart?.resize()
        dimBarChart?.resize()
        efficiencyChart?.resize()
      }, 500)
    }, 200)
  } catch (e) {
    logger.error('加载学习分析失败:', e)
    loading.value = false
  }
}

function initCharts() {
  initRadar(); initTrend(); initDimBar(); initEfficiency()
}

function initRadar() {
  if (!radarChartRef.value) return
  if (radarChart) radarChart.dispose()
  radarChart = echarts.init(radarChartRef.value)
  const r = profileData.value.radar
  if (!r?.dimensions?.length || !r?.scores?.length) {
    setEmptyChart(radarChart, '暂无知识掌握数据')
    return
  }
  radarChart.setOption({
    tooltip: { trigger: 'item' },
    radar: {
      indicator: r.dimensions.map(d => ({ name: d, max: 100 })),
      shape: 'circle', radius: '65%',
      axisName: { color: '#606266', fontSize: 13 },
      splitArea: { areaStyle: { color: ['rgba(64,158,255,0.05)', 'rgba(64,158,255,0.1)'] } }
    },
    series: [{ type: 'radar', symbol: 'circle', symbolSize: 8, data: [{
      value: r.scores, name: '掌握度',
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.5)' }, { offset: 1, color: 'rgba(64,158,255,0.1)' }]) },
      lineStyle: { color: '#409EFF', width: 2 },
      itemStyle: { color: '#409EFF', borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: p => p.value, color: '#409EFF', fontSize: 11 }
    }] }]
  })
}

function initTrend() {
  if (!trendChartRef.value) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(trendChartRef.value)
  const s = profileData.value.trend?.series
  if (!s?.length) {
    setEmptyChart(trendChart, '暂无实验趋势数据')
    return
  }
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, bottom: 60, top: 20 },
    xAxis: { type: 'category', data: s.map(x => x.name), axisLabel: { rotate: 35, fontSize: 10 } },
    yAxis: { type: 'value', min: 0, max: 100, name: '掌握度' },
    series: [{ type: 'line', data: s.map(x => x.mastery), smooth: true,
      lineStyle: { color: '#409EFF', width: 2.5 }, symbolSize: 7,
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.3)' }, { offset: 1, color: 'rgba(64,158,255,0.02)' }]) },
      markLine: { data: [{ type: 'average', name: '均值' }], lineStyle: { color: '#E6A23C', type: 'dashed' } }
    }]
  })
}

function initDimBar() {
  if (!dimBarChartRef.value) return
  if (dimBarChart) dimBarChart.dispose()
  dimBarChart = echarts.init(dimBarChartRef.value)
  const r = profileData.value.radar
  if (!r?.dimensions?.length || !r?.scores?.length) {
    setEmptyChart(dimBarChart, '暂无维度能力数据')
    return
  }
  dimBarChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 80, right: 20, bottom: 20, top: 20 },
    xAxis: { type: 'value', max: 100 },
    yAxis: { type: 'category', data: [...r.dimensions].reverse() },
    series: [{ type: 'bar', data: [...r.scores].reverse().map((v) => ({
      value: v, itemStyle: { color: v >= 70 ? '#67C23A' : v >= 40 ? '#E6A23C' : '#F56C6C', borderRadius: [0, 4, 4, 0] }
    })), barWidth: 20, label: { show: true, position: 'right', formatter: '{c}分' } }]
  })
}

function initEfficiency() {
  if (!efficiencyChartRef.value) return
  if (efficiencyChart) efficiencyChart.dispose()
  efficiencyChart = echarts.init(efficiencyChartRef.value)
  // 从skillTree提取每个实验的提交数和AC数
  const items = []
  for (const dim of profileData.value.skillTree || []) {
    for (const c of dim.children || []) {
      if (c.totalSubmissions) items.push({ name: c.name, total: c.totalSubmissions, ac: c.acCount || 0 })
    }
  }
  if (!items.length) {
    setEmptyChart(efficiencyChart, '暂无提交明细，无法计算效率')
    return
  }
  efficiencyChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['总提交', 'AC次数'], bottom: 0 },
    grid: { left: 50, right: 20, bottom: 40, top: 20 },
    xAxis: { type: 'category', data: items.map(x => x.name), axisLabel: { rotate: 40, fontSize: 10 } },
    yAxis: { type: 'value' },
    series: [
      { name: '总提交', type: 'bar', data: items.map(x => x.total), itemStyle: { color: '#409EFF' }, barWidth: 12 },
      { name: 'AC次数', type: 'bar', data: items.map(x => x.ac), itemStyle: { color: '#67C23A' }, barWidth: 12 }
    ]
  })
}

function resolveClassCompareError(error) {
  const message = String(error?.message || error || '')
  if (message.includes('student role required') || message.includes('403')) {
    return '班级对比接口当前要求学生角色会话，已自动降级为仅展示个人学习分析。'
  }
  if (message.includes('401')) {
    return '班级对比接口当前登录状态不可用，已自动降级为仅展示个人学习分析。'
  }
  return '班级对比数据暂时不可用，页面已自动降级为仅展示个人学习分析。'
}

async function loadClassComparison() {
  classCompareUnavailableReason.value = ''
  classData.value = null
  try {
    const studentId = resolveCurrentStudentId()
    if (!studentId) {
      classCompareUnavailableReason.value = '未识别到当前学生身份，暂不加载班级对比数据。'
      return
    }
    const res = await getStudentAnalyticsOverview(studentId)
    const payload = res?.data || res
    if (!payload?.experiments?.length) {
      classCompareUnavailableReason.value = '班级对比暂无可展示数据。'
      return
    }
    classData.value = payload
    await nextTick()
    setTimeout(() => initClassCompareChart(), 100)
  } catch (e) {
    classCompareUnavailableReason.value = resolveClassCompareError(e)
    logger.warn('班级对比数据加载失败:', e)
  }
}

function initClassCompareChart() {
  if (!classCompareChartRef.value || !classData.value?.experiments?.length) return
  classCompareChart?.dispose()
  classCompareChart = echarts.init(classCompareChartRef.value)
  const exps = classData.value.experiments
  const names = exps.map(e => e.name.length > 10 ? e.name.substring(0, 10) + '…' : e.name)
  classCompareChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['我的得分', '班级均分', '班级中位数'], top: 0 },
    grid: { left: 50, right: 20, bottom: 55, top: 36 },
    xAxis: { type: 'category', data: names, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: 'value', name: '分数' },
    series: [
      { name: '我的得分', type: 'bar', data: exps.map(e => e.myScore), barWidth: '22%',
        itemStyle: { color: '#1a73e8', borderRadius: [3, 3, 0, 0] },
        label: { show: exps.length <= 10, position: 'top', fontSize: 10 } },
      { name: '班级均分', type: 'line', data: exps.map(e => e.classAvg), smooth: true,
        lineStyle: { color: '#e37400', width: 2, type: 'dashed' },
        itemStyle: { color: '#e37400' }, symbol: 'circle', symbolSize: 6 },
      { name: '班级中位数', type: 'line', data: exps.map(e => e.classMedian), smooth: true,
        lineStyle: { color: '#9aa0a6', width: 1.5, type: 'dotted' },
        itemStyle: { color: '#9aa0a6' }, symbol: 'diamond', symbolSize: 5 }
    ]
  })
}

function handleResize() { radarChart?.resize(); trendChart?.resize(); dimBarChart?.resize(); efficiencyChart?.resize(); classCompareChart?.resize() }
onMounted(() => { loadData(); window.addEventListener('resize', handleResize) })
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  radarChart?.dispose(); trendChart?.dispose(); dimBarChart?.dispose(); efficiencyChart?.dispose(); classCompareChart?.dispose()
})
</script>


