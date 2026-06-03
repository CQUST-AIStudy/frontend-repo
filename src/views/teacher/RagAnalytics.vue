<template>
  <div class="rag-analytics-container [height:100%] [overflow-y:auto] [&_.ui-card]:[border-radius:16px] [&_.ui-card]:[border:0.5px_solid_rgba(0,_0,_0,_0.06)] [&_.ui-card]:[box-shadow:0_1px_3px_rgba(0,0,0,0.04)]">
    <UiPageHeader class="my-page-header [padding:0]" title="RAG 运营面板" description="课程知识库问答质量监控与分析" />

    <div class="[padding:0_20px_10px]">
      <ui-select v-model="selectedSpaceId" placeholder="选择课程空间" class="[width:300px]" @change="loadAll">
        <ui-option v-for="cs in courseSpaces" :key="cs.id" :label="cs.name" :value="cs.id" />
      </ui-select>
    </div>

    <div v-if="selectedSpaceId" class="analytics-content [min-height:400px]" :aria-busy="loading">
      <!-- 统计卡片 -->
      <ui-row :gutter="16" class="[padding:0_20px_16px]">
        <ui-col :span="6">
          <ui-card shadow="hover" class="stat-card [text-align:center] [border-radius:16px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f9f9f9,_#f5f5f7)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-label [font-size:13px] [color:#6e6e73] [margin-bottom:8px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">命中率</div>
            <div class="stat-value [font-size:28px] [font-weight:700] [color:#1d1d1f] [font-size:24px] [font-weight:bold] [color:#007aff] [margin-bottom:5px]">{{ (hitRate * 100).toFixed(1) }}%</div>
            <div class="stat-desc [font-size:12px] [color:#aeaeb2] [margin-top:6px]">coverage > 0.4 的比例</div>
          </ui-card>
        </ui-col>
        <ui-col :span="6">
          <ui-card shadow="hover" class="stat-card [text-align:center] [border-radius:16px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f9f9f9,_#f5f5f7)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-label [font-size:13px] [color:#6e6e73] [margin-bottom:8px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">联网触发率</div>
            <div class="stat-value [font-size:28px] [font-weight:700] [color:#1d1d1f] [font-size:24px] [font-weight:bold] [color:#007aff] [margin-bottom:5px]">{{ (webTriggerRate * 100).toFixed(1) }}%</div>
            <div class="stat-desc [font-size:12px] [color:#aeaeb2] [margin-top:6px]">触发联网兜底的比例</div>
          </ui-card>
        </ui-col>
        <ui-col :span="6">
          <ui-card shadow="hover" class="stat-card feedback-card [text-align:center] [border-radius:16px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f9f9f9,_#f5f5f7)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-label [font-size:13px] [color:#6e6e73] [margin-bottom:8px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">用户反馈</div>
            <div class="stat-value [font-size:28px] [font-weight:700] [color:#1d1d1f] [font-size:24px] [font-weight:bold] [color:#007aff] [margin-bottom:5px]">
              <span class="[color:#67c23a]">👍 {{ feedbackStats.thumbsUp }}</span>
              <span class="[margin:0_8px] [color:#dcdfe6]">/</span>
              <span class="[color:#f56c6c]">👎 {{ feedbackStats.thumbsDown }}</span>
            </div>
            <div class="stat-desc [font-size:12px] [color:#aeaeb2] [margin-top:6px]">全{{ feedbackStats.total }} 次问答</div>
          </ui-card>
        </ui-col>
        <ui-col :span="6">
          <ui-card shadow="hover" class="stat-card [text-align:center] [border-radius:16px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [box-shadow:0_1px_3px_rgba(0,0,0,0.04)] [transition:all_0.25s] hover:[transform:translateY(-2px)] hover:[box-shadow:0_6px_16px_rgba(0,0,0,0.08)] [padding:20px_0] [padding:20px] [background:linear-gradient(135deg,_#f9f9f9,_#f5f5f7)] [border-radius:10px] [flex:1] [min-width:180px] [padding:18px]">
            <div class="stat-label [font-size:13px] [color:#6e6e73] [margin-bottom:8px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">满意率</div>
            <div class="stat-value [font-size:28px] [font-weight:700] [color:#1d1d1f] [font-size:24px] [font-weight:bold] [color:#007aff] [margin-bottom:5px]">{{ satisfactionRate }}%</div>
            <div class="stat-desc [font-size:12px] [color:#aeaeb2] [margin-top:6px]">点赞 / (点赞+踩</div>
          </ui-card>
        </ui-col>
      </ui-row>

      <!-- 问题热榜 + 资料缺口 -->
      <ui-row :gutter="16" class="[padding:0_20px_16px]">
        <ui-col :span="14">
          <ui-card shadow="hover">
            <template #header><span>🔥 问题热榜 TOP 20</span></template>
            <ui-table :data="hotQuestions" stripe size="small" max-height="360">
              <ui-table-column type="index" label="#" width="50" />
              <ui-table-column prop="query" label="问题" show-overflow-tooltip />
              <ui-table-column prop="count" label="提问次数" width="100" sortable />
            </ui-table>
          </ui-card>
        </ui-col>
        <ui-col :span="10">
          <ui-card shadow="hover">
            <template #header><span>⚠️ 资料缺口提示</span></template>
            <div v-if="resourceGaps.length === 0" class="[text-align:center] [color:#aeaeb2] [padding:40px_0]">
              暂无资料缺口，知识库覆盖良好 🎉
            </div>
            <div v-else class="gap-list [max-height:320px] [overflow-y:auto]">
              <div v-for="(gap, idx) in resourceGaps" :key="idx" class="gap-item [padding:10px_0] [border-bottom:1px_solid_#f5f5f7] last:[border-bottom:none]">
                <div class="gap-query [font-size:14px] [color:#1d1d1f] [margin-bottom:6px]">{{ gap.query }}</div>
                <div class="gap-meta [display:flex] [gap:8px]">
                  <ui-tag size="small" type="danger">提问 {{ gap.count }} 次</ui-tag>
                  <ui-tag size="small" type="warning">平均覆盖 {{ (gap.avgCoverage * 100).toFixed(0) }}%</ui-tag>
                </div>
              </div>
            </div>
          </ui-card>
        </ui-col>
      </ui-row>

      <!-- 引用覆盖率-->
      <ui-row :gutter="16" class="[padding:0_20px_16px]">
        <ui-col :span="24">
          <ui-card shadow="hover">
            <template #header><span>📚 文档引用频次</span></template>
            <ui-table :data="citationList" stripe size="small" max-height="300">
              <ui-table-column type="index" label="#" width="50" />
              <ui-table-column prop="docName" label="文档名称" show-overflow-tooltip />
              <ui-table-column prop="count" label="被引用次数" width="120" sortable />
              <ui-table-column label="引用占比" width="200">
                <template #default="{ row }">
                  <ui-progress :percentage="row.percentage" :stroke-width="14" :text-inside="true" />
                </template>
              </ui-table-column>
            </ui-table>
          </ui-card>
        </ui-col>
      </ui-row>
    </div>

    <div v-else class="[text-align:center] [padding:80px_0] [color:#aeaeb2]">
      请先选择一个课程空间查看分析数据
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
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
    uiMessage.error('加载分析数据失败: ' + e.message)
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


