<template>
  <div class="rag-analytics-container [height:100%] [overflow-y:auto] [&_.el-card]:[border-radius:16px] [&_.el-card]:[border:0.5px_solid_rgba(0,_0,_0,_0.06)] [&_.el-card]:[box-shadow:0_1px_3px_rgba(0,0,0,0.04)]">
    <page-header class="my-page-header [padding:0]" title="RAG 运营面板" description="课程知识库问答质量监控与分析" />

    <div class="[padding:0_20px_10px]">
      <el-select v-model="selectedSpaceId" placeholder="选择课程空间" class="[width:300px]" @change="loadAll">
        <el-option v-for="cs in courseSpaces" :key="cs.id" :label="cs.name" :value="cs.id" />
      </el-select>
    </div>

    <div v-if="selectedSpaceId" class="analytics-content [min-height:400px]" v-loading="loading">
      <!-- 统计卡片 -->
      <el-row :gutter="16" class="[padding:0_20px_16px]">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card [text-align:center] [border-radius:16px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f9f9f9,_#f5f5f7)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-label [font-size:13px] [color:#6e6e73] [margin-bottom:8px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">命中率</div>
            <div class="stat-value [font-size:28px] [font-weight:700] [color:#1d1d1f] [font-size:24px] [font-weight:bold] [color:#007aff] [margin-bottom:5px]">{{ (hitRate * 100).toFixed(1) }}%</div>
            <div class="stat-desc [font-size:12px] [color:#aeaeb2] [margin-top:6px]">coverage > 0.4 的比例</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card [text-align:center] [border-radius:16px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f9f9f9,_#f5f5f7)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-label [font-size:13px] [color:#6e6e73] [margin-bottom:8px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">联网触发率</div>
            <div class="stat-value [font-size:28px] [font-weight:700] [color:#1d1d1f] [font-size:24px] [font-weight:bold] [color:#007aff] [margin-bottom:5px]">{{ (webTriggerRate * 100).toFixed(1) }}%</div>
            <div class="stat-desc [font-size:12px] [color:#aeaeb2] [margin-top:6px]">触发联网兜底的比例</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card feedback-card [text-align:center] [border-radius:16px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f9f9f9,_#f5f5f7)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-label [font-size:13px] [color:#6e6e73] [margin-bottom:8px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">用户反馈</div>
            <div class="stat-value [font-size:28px] [font-weight:700] [color:#1d1d1f] [font-size:24px] [font-weight:bold] [color:#007aff] [margin-bottom:5px]">
              <span class="inline-flex items-center justify-center gap-1 [color:#67c23a]">
                <LucideIcon name="thumbs-up" :size="20" />
                {{ feedbackStats.thumbsUp }}
              </span>
              <span class="[margin:0_8px] [color:#dcdfe6]">/</span>
              <span class="inline-flex items-center justify-center gap-1 [color:#f56c6c]">
                <LucideIcon name="thumbs-down" :size="20" />
                {{ feedbackStats.thumbsDown }}
              </span>
            </div>
            <div class="stat-desc [font-size:12px] [color:#aeaeb2] [margin-top:6px]">全{{ feedbackStats.total }} 次问答</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card [text-align:center] [border-radius:16px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f9f9f9,_#f5f5f7)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-label [font-size:13px] [color:#6e6e73] [margin-bottom:8px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">满意率</div>
            <div class="stat-value [font-size:28px] [font-weight:700] [color:#1d1d1f] [font-size:24px] [font-weight:bold] [color:#007aff] [margin-bottom:5px]">{{ satisfactionRate }}%</div>
            <div class="stat-desc [font-size:12px] [color:#aeaeb2] [margin-top:6px]">点赞 / (点赞+踩</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 问题热榜 + 资料缺口 -->
      <el-row :gutter="16" class="[padding:0_20px_16px]">
        <el-col :span="14">
          <el-card shadow="hover">
            <template #header>
              <span class="inline-flex items-center gap-2">
                <LucideIcon name="flame" class="text-[#ff9500]" :size="18" />
                问题热榜 TOP 20
              </span>
            </template>
            <el-table :data="hotQuestions" stripe size="small" max-height="360">
              <el-table-column type="index" label="#" width="50" />
              <el-table-column prop="query" label="问题" show-overflow-tooltip />
              <el-table-column prop="count" label="提问次数" width="100" sortable />
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="hover">
            <template #header>
              <span class="inline-flex items-center gap-2">
                <LucideIcon name="alert-triangle" class="text-[#ff9500]" :size="18" />
                资料缺口提示
              </span>
            </template>
            <div v-if="resourceGaps.length === 0" class="[text-align:center] [color:#aeaeb2] [padding:40px_0]">
              暂无资料缺口，知识库覆盖良好
            </div>
            <div v-else class="gap-list [max-height:320px] [overflow-y:auto]">
              <div v-for="(gap, idx) in resourceGaps" :key="idx" class="gap-item [padding:10px_0] [border-bottom:1px_solid_#f5f5f7] last:[border-bottom:none]">
                <div class="gap-query [font-size:14px] [color:#1d1d1f] [margin-bottom:6px]">{{ gap.query }}</div>
                <div class="gap-meta [display:flex] [gap:8px]">
                  <el-tag size="small" type="danger">提问 {{ gap.count }} 次</el-tag>
                  <el-tag size="small" type="warning">平均覆盖 {{ (gap.avgCoverage * 100).toFixed(0) }}%</el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 引用覆盖率-->
      <el-row :gutter="16" class="[padding:0_20px_16px]">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <span class="inline-flex items-center gap-2">
                <LucideIcon name="library" class="text-[#1677ff]" :size="18" />
                文档引用频次
              </span>
            </template>
            <el-table :data="citationList" stripe size="small" max-height="300">
              <el-table-column type="index" label="#" width="50" />
              <el-table-column prop="docName" label="文档名称" show-overflow-tooltip />
              <el-table-column prop="count" label="被引用次数" width="120" sortable />
              <el-table-column label="引用占比" width="200">
                <template #default="{ row }">
                  <el-progress :percentage="row.percentage" :stroke-width="14" :text-inside="true" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-else class="[text-align:center] [padding:80px_0] [color:#aeaeb2]">
      请先选择一个课程空间查看分析数据
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed, onMounted } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import LucideIcon from '../../components/LucideIcon.vue'
import { ElMessage } from 'element-plus'
import {
  getCourseSpaces,
  getHotQuestions,
  getHitRate,
  getCitationCoverage,
  getWebTriggerRate,
  getFeedbackStats,
  getResourceGaps
} from '../../api/rag'

const courseSpaces = ref([])
const selectedSpaceId = ref(null)
const loading = ref(false)

const hotQuestions = ref([])
const hitRate = ref(0)
const webTriggerRate = ref(0)
const feedbackStats = ref({ thumbsUp: 0, thumbsDown: 0, total: 0 })
const resourceGaps = ref([])
const citationCoverage = ref({})

const citationList = computed(() => {
  const entries = Object.entries(citationCoverage.value).map(([docName, count]) => ({ docName, count }))
  entries.sort((a, b) => b.count - a.count)
  const maxCount = entries.length > 0 ? entries[0].count : 1
  return entries.map(e => ({ ...e, percentage: Math.round((e.count / maxCount) * 100) }))
})

const satisfactionRate = computed(() => {
  const total = feedbackStats.value.thumbsUp + feedbackStats.value.thumbsDown
  if (total === 0) return '—'
  return ((feedbackStats.value.thumbsUp / total) * 100).toFixed(1)
})

const extract = (res) => res?.data ?? res

const loadAll = async () => {
  if (!selectedSpaceId.value) return
  loading.value = true
  try {
    const id = selectedSpaceId.value
    const [hq, hr, cc, wt, fb, rg] = await Promise.all([
      getHotQuestions(id),
      getHitRate(id),
      getCitationCoverage(id),
      getWebTriggerRate(id),
      getFeedbackStats(id),
      getResourceGaps(id)
    ])
    hotQuestions.value = extract(hq) || []
    hitRate.value = extract(hr)?.hitRate ?? 0
    citationCoverage.value = extract(cc) || {}
    webTriggerRate.value = extract(wt)?.webTriggerRate ?? 0
    feedbackStats.value = extract(fb) || { thumbsUp: 0, thumbsDown: 0, total: 0 }
    resourceGaps.value = extract(rg) || []
  } catch (e) {
    ElMessage.error('加载分析数据失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await getCourseSpaces()
    courseSpaces.value = Array.isArray(res) ? res : (res?.data || [])
  } catch (e) {
    logger.warn('获取课程空间失败', e)
  }
})
</script>


