<template>
  <div class="class-profile [&_.el-card]:[border-radius:16px] [&_.el-card]:[border:1px_solid_#dadce0] [&_.el-card]:[box-shadow:0_1px_3px_rgba(0,0,0,0.04)]">
    <div v-if="loading"><el-skeleton :rows="10" animated /></div>
    <el-alert v-else-if="errorMsg" :title="errorMsg" type="warning" show-icon :closable="false" />
    <template v-else>
      <!-- 概览 -->
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card [text-align:center] [padding:20px_0] [border-radius:16px] [border:1px_solid_#dadce0] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-value [font-size:28px] [font-weight:700] [color:#202124] [&.good]:[color:#22c55e] [&.warn]:[color:#f59e0b] [&.danger]:[color:#ef4444] [font-size:24px] [font-weight:bold] [color:#409EFF] [margin-bottom:5px]">{{ data.totalStudents }}</div>
            <div class="stat-label [font-size:13px] [color:#5f6368] [margin-top:4px] [font-size:12px] [margin-top:10px] [color:#606266]">学生总数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card [text-align:center] [padding:20px_0] [border-radius:16px] [border:1px_solid_#dadce0] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-value good [font-size:28px] [font-weight:700] [color:#202124] [&.good]:[color:#22c55e] [&.warn]:[color:#f59e0b] [&.danger]:[color:#ef4444] [font-size:24px] [font-weight:bold] [color:#409EFF] [margin-bottom:5px]">{{ tierCount('A') }}</div>
            <div class="stat-label [font-size:13px] [color:#5f6368] [margin-top:4px] [font-size:12px] [margin-top:10px] [color:#606266]">优秀 (≥0)</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card [text-align:center] [padding:20px_0] [border-radius:16px] [border:1px_solid_#dadce0] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-value warn [font-size:28px] [font-weight:700] [color:#202124] [&.good]:[color:#22c55e] [&.warn]:[color:#f59e0b] [&.danger]:[color:#ef4444] [font-size:24px] [font-weight:bold] [color:#409EFF] [margin-bottom:5px]">{{ tierCount('B') }}</div>
            <div class="stat-label [font-size:13px] [color:#5f6368] [margin-top:4px] [font-size:12px] [margin-top:10px] [color:#606266]">中等 (40-69)</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card [text-align:center] [padding:20px_0] [border-radius:16px] [border:1px_solid_#dadce0] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px] [background:linear-gradient(135deg,_#f8f9fa,_#f1f3f4)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-value danger [font-size:28px] [font-weight:700] [color:#202124] [&.good]:[color:#22c55e] [&.warn]:[color:#f59e0b] [&.danger]:[color:#ef4444] [font-size:24px] [font-weight:bold] [color:#409EFF] [margin-bottom:5px]">{{ tierCount('C') }}</div>
            <div class="stat-label [font-size:13px] [color:#5f6368] [margin-top:4px] [font-size:12px] [margin-top:10px] [color:#606266]">需关注 (&lt;40)</div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16" class="[margin-top:16px]">
        <!-- 维度柱状图-->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header><span>班级各维度平均分</span></template>
            <div ref="barChartRef" class="[height:350px]"></div>
          </el-card>
        </el-col>
        <!-- 薄弱排行 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header><span>薄弱维度排行</span></template>
            <el-table :data="data.weakRanking" stripe size="small">
              <el-table-column prop="dimension" label="维度" width="100" />
              <el-table-column prop="avgScore" label="班级均分" width="90" />
              <el-table-column prop="weakCount" label="低分人数" width="90" />
              <el-table-column label="低分占比">
                <template #default="{ row }">
                  <el-progress :percentage="row.weakRatio" :color="row.weakRatio > 30 ? '#F56C6C' : '#E6A23C'" :stroke-width="10" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- ABC分层 -->
      <el-card shadow="hover" class="[margin-top:16px]">
        <template #header><span>学生分层 (ABC)</span></template>
        <el-tabs>
          <el-tab-pane v-for="(tier, key) in data.tiers" :key="key"
                       :label="key + ' - ' + tier.label + ' (' + tier.count + '人'">
            <el-table :data="tier.students" stripe size="small" max-height="400">
              <el-table-column prop="studentId" label="学号" width="120" />
              <el-table-column prop="studentName" label="姓名" width="100" />
              <el-table-column label="综合分">
                <template #default="{ row }">
                  <el-progress :percentage="Math.round(row.overallScore)"
                               :color="row.overallScore >= 70 ? '#67C23A' : row.overallScore >= 40 ? '#E6A23C' : '#F56C6C'"
                               :stroke-width="10" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="viewStudent(row.studentId)">查看画像</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>

    <!-- 学生画像弹窗 -->
    <el-dialog v-model="dialogVisible" :title="'学生画像 - ' + dialogStudentName" width="80%" top="5vh" destroy-on-close>
      <div v-if="dialogLoading"><el-skeleton :rows="6" animated /></div>
      <template v-else>
        <el-row :gutter="16">
          <el-col :span="12">
            <div ref="dialogRadarRef" class="[height:300px]"></div>
          </el-col>
          <el-col :span="12">
            <div ref="dialogTrendRef" class="[height:300px]"></div>
          </el-col>
        </el-row>
        <div v-if="dialogProfile.feedback" class="feedback-text [margin-top:12px] [font-size:14px] [line-height:1.8] [background:linear-gradient(135deg,_#f0fdf4,_#dcfce7)] [padding:14px_16px] [border-radius:10px] [border-left:4px_solid_#22c55e]">{{ dialogProfile.feedback }}</div>
        <div v-if="dialogProfile.patterns?.length" class="[margin-top:12px]">
          <el-tag v-for="p in dialogProfile.patterns" :key="p.tag" class="[margin-right:8px]">{{ p.tag }}: {{ p.description }}</el-tag>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { API_BASE_URL } from '../../config/runtime'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'

const API_BASE = API_BASE_URL
const loading = ref(true)
const errorMsg = ref('')
const data = ref({})
const barChartRef = ref(null)
let barChartInst = null

// 弹窗
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

async function fetchData() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await axios.get(`${API_BASE}/api/profile/class`, { withCredentials: true })
    const d = res.data || res
    if (d.error) { errorMsg.value = getFriendlyResponseMessage(d, '班级画像加载失败，请稍后重试'); return }
    data.value = d
    logger.debug('[ClassProfile] 数据加载成功:', {
      totalStudents: d.totalStudents,
      dimensions: d.dimensions,
      dimensionAvg: d.dimensionAvg
    })
    await nextTick()
    // 延迟一帧确保DOM 已渲染
    setTimeout(() => renderBar(), 100)
  } catch (e) {
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
  try {
    const res = await axios.get(`${API_BASE}/api/profile/student/${studentId}`, { withCredentials: true })
    const d = res.data || res
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


