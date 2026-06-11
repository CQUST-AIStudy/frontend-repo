<template>
  <div class="g-page [font-family:-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_'Helvetica_Neue',_Arial,_sans-serif]">
    <UiPageHeader title="实验详情" :description="currentExp?.name || '加载中..'">
      <UiButton class="g-outline-btn [background:#fff] [border:1px_solid_#dadce0] [border-radius:100px] [padding:8px_20px] [font-size:13px] [color:#5f6368] [font-weight:500] [cursor:pointer] [transition:all_0.2s] hover:[background:#f8f9fa] hover:[border-color:#bdc1c6]" @click="$router.push('/student/experiments')">←返回列表</UiButton>
    </UiPageHeader>

    <loading-state :loading="loading">
      <div v-if="currentExp" class="g-content [display:flex] [flex-direction:column] [gap:16px]">
        <!-- 信息条-->
        <div class="g-info-bar [display:flex] [align-items:center] [gap:20px] [padding:16px_20px] [background:#fff] [border-radius:16px] [border:1px_solid_#dadce0] [flex-wrap:wrap]">
          <span class="g-chip [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500]" :class="'c-' + currentExp.status">{{ statusText }}</span>
          <span v-if="currentExp.score" class="g-info-item [display:flex] [align-items:center] [gap:6px]">
            <span class="g-info-label [font-size:12px] [color:#5f6368]">得分</span>
            <span class="g-info-val [font-size:14px] [font-weight:500] [color:#202124] [color:#1a73e8] [font-size:18px]">{{ currentExp.score }}</span>
          </span>
          <span v-if="currentExp.deadline" class="g-info-item [display:flex] [align-items:center] [gap:6px]">
            <span class="g-info-label [font-size:12px] [color:#5f6368]">截止</span>
            <span class="g-info-val [font-size:14px] [font-weight:500] [color:#202124]">{{ currentExp.deadline }}</span>
          </span>
          <span v-if="currentExp.submitTime" class="g-info-item [display:flex] [align-items:center] [gap:6px]">
            <span class="g-info-label [font-size:12px] [color:#5f6368]">提交</span>
            <span class="g-info-val [font-size:14px] [font-weight:500] [color:#202124]">{{ currentExp.submitTime }}</span>
          </span>
          <span v-if="isCompleted && currentExp.plagiarismRate != null" class="g-info-item [display:flex] [align-items:center] [gap:6px]">
            <span class="g-info-label [font-size:12px] [color:#5f6368]">查重率</span>
            <span class="g-info-val [font-size:14px] [font-weight:500] [color:#202124]" :class="plagiarismClass">{{ currentExp.plagiarismRate }}%</span>
          </span>
        </div>

        <!-- 标签页-->
        <div class="g-card [background:#fff] [border-radius:16px] [border:1px_solid_#dadce0] [overflow:hidden]">
          <div class="g-tabs [display:flex] [border-bottom:1px_solid_#dadce0] [padding:0_20px]">
            <UiButton class="g-tab [background:none] [border:none] [padding:12px_16px] [font-size:14px] [font-weight:500] [color:#5f6368] [cursor:pointer] [border-bottom:2px_solid_transparent] [transition:all_0.2s] [&.active]:[color:#1a73e8] [&.active]:[border-bottom-color:#1a73e8] disabled:[color:#9aa0a6] disabled:[cursor:not-allowed]" :class="{ active: activeTab === 'code' }" @click="activeTab = 'code'"><LucideIcon name="code" :size="16" class="mr-1.5" /> 代码</UiButton>
            <UiButton class="g-tab [background:none] [border:none] [padding:12px_16px] [font-size:14px] [font-weight:500] [color:#5f6368] [cursor:pointer] [border-bottom:2px_solid_transparent] [transition:all_0.2s] [&.active]:[color:#1a73e8] [&.active]:[border-bottom-color:#1a73e8] disabled:[color:#9aa0a6] disabled:[cursor:not-allowed]" :class="{ active: activeTab === 'ai' }" @click="activeTab = 'ai'"><LucideIcon name="bot" :size="16" class="mr-1.5" /> AI助教点评</UiButton>
            <UiButton class="g-tab [background:none] [border:none] [padding:12px_16px] [font-size:14px] [font-weight:500] [color:#5f6368] [cursor:pointer] [border-bottom:2px_solid_transparent] [transition:all_0.2s] [&.active]:[color:#1a73e8] [&.active]:[border-bottom-color:#1a73e8] disabled:[color:#9aa0a6] disabled:[cursor:not-allowed]" :class="{ active: activeTab === 'report' }" @click="activeTab = 'report'" :disabled="!isCompleted"><LucideIcon name="clipboard-text" :size="16" class="mr-1.5" /> 实验报告</UiButton>
            <UiButton class="g-tab [background:none] [border:none] [padding:12px_16px] [font-size:14px] [font-weight:500] [color:#5f6368] [cursor:pointer] [border-bottom:2px_solid_transparent] [transition:all_0.2s] [&.active]:[color:#1a73e8] [&.active]:[border-bottom-color:#1a73e8]" :class="{ active: activeTab === 'analysis' }" @click="activeTab = 'analysis'"><LucideIcon name="search" :size="16" class="mr-1.5" /> AI 错误分析</UiButton>
          </div>

          <!-- 代码 -->
          <div v-if="activeTab === 'code'" class="g-tab-body [padding:20px]">
            <div v-if="!currentExp.code || !isCompleted" class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="file-code" :size="48" /></div>
              <div class="g-empty-text [font-size:16px] [font-weight:500] [color:#202124] [margin-bottom:6px]">暂无代码提交</div>
              <UiButton class="g-primary-btn [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:10px_24px] [font-size:14px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc]" @click="goToPTA">前往PTA平台完成实验</UiButton>
            </div>
            <div v-else>
              <div class="g-toolbar [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:12px]">
                <span class="g-toolbar-title [font-size:14px] [font-weight:500] [color:#202124]">提交代码</span>
                <UiButton class="g-outline-btn-sm [background:#fff] [border:1px_solid_#dadce0] [border-radius:100px] [padding:4px_14px] [font-size:12px] [color:#5f6368] [cursor:pointer] [transition:all_0.2s] hover:[background:#f8f9fa]" @click="copyCode">复制</UiButton>
              </div>
              <pre class="g-code [background:#1e1e2e] [color:#cdd6f4] [padding:20px] [border-radius:12px] [overflow-x:auto] [font-size:13px] [line-height:1.7] [max-height:600px] [overflow-y:auto] [white-space:pre-wrap] [word-break:break-all] [font-family:'Cascadia_Code',_'Fira_Code',_Consolas,_monospace] [margin:0]"><code>{{ currentExp.code }}</code></pre>
            </div>
          </div>

          <!-- AI点评 -->
          <div v-if="activeTab === 'ai'" class="g-tab-body [padding:20px]">
            <div class="g-toolbar [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:12px]">
              <div class="g-ai-badge [display:flex] [align-items:center] [gap:8px] [font-size:14px] [font-weight:500] [color:#202124]">
                <span class="g-ai-dot [width:8px] [height:8px] [border-radius:50%] [background:#1e8e3e] [animation:pulse_2s_infinite]"></span> AI 助教点评
                <span v-if="aiSource === 'cache'" class="g-chip c-info [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500] [background:#f1f3f4] [color:#5f6368]">已缓存</span>
                <span v-else-if="aiSource === 'deepseek'" class="g-chip c-ok [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500] [background:#e6f4ea] [color:#1e8e3e]">刚生成</span>
              </div>
              <UiButton v-if="isCompleted" class="g-primary-btn-sm [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:6px_16px] [font-size:13px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc] disabled:[background:#9aa0a6] disabled:[cursor:not-allowed]" :disabled="aiGenerating" @click="generateAiComment(true)">
                {{ aiGenerating ? '分析中...' : (hasAiComment ? '重新生成' : '生成AI点评') }}
              </UiButton>
            </div>
            <div v-if="aiGenerating" class="g-ai-loading [padding:20px_0]">
              <ui-skeleton :rows="6" animated />
              <div class="g-ai-loading-tip [display:flex] [align-items:center] [justify-content:center] [gap:8px] [color:#5f6368] [font-size:13px] [margin-top:16px]">
                <ui-icon class="is-loading"><Loading /></ui-icon>
                正在调用 DeepSeek 分析代码，预计需要10-20 秒..
              </div>
            </div>
            <div v-else-if="hasAiComment" class="g-ai-content markdown-body [background:#f8f9fa] [padding:24px] [border-radius:12px] [border:1px_solid_#e8eaed] [font-size:14px] [line-height:1.8] [color:#202124] [&_h1]:[color:#202124] [&_h1]:[margin:20px_0_10px] [&_h1]:[font-size:16px] [&_h2]:[color:#202124] [&_h2]:[margin:20px_0_10px] [&_h2]:[font-size:16px] [&_h3]:[color:#202124] [&_h3]:[margin:20px_0_10px] [&_h3]:[font-size:16px] [&_h3]:[font-size:15px] [&_p]:[margin:8px_0] [&_p]:[line-height:1.8] [&_ul]:[padding-left:20px] [&_ul]:[margin:8px_0] [&_ol]:[padding-left:20px] [&_ol]:[margin:8px_0] [&_li]:[margin:4px_0] [&_strong]:[color:#1a73e8] [&_code]:[background:#e8eaed] [&_code]:[padding:2px_6px] [&_code]:[border-radius:4px] [&_code]:[font-size:13px] [&_code]:[color:#d93025] [&_pre]:[background:#1e1e2e] [&_pre]:[color:#cdd6f4] [&_pre]:[padding:16px] [&_pre]:[border-radius:8px] [&_pre]:[overflow-x:auto] [&_pre]:[margin:10px_0] [&_pre_code]:[background:none] [&_pre_code]:[color:inherit] [&_pre_code]:[padding:0] [&_blockquote]:[border-left:4px_solid_#1a73e8] [&_blockquote]:[padding:8px_16px] [&_blockquote]:[margin:10px_0] [&_blockquote]:[background:#e8f0fe] [&_blockquote]:[border-radius:0_8px_8px_0] [&_blockquote]:[color:#5f6368]" v-html="renderedAiComment"></div>
            <div v-else class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="bot" :size="48" /></div>
              <div class="g-empty-text [font-size:16px] [font-weight:500] [color:#202124] [margin-bottom:6px]">{{ isCompleted ? '暂无AI点评' : '请先完成实验' }}</div>
              <div class="g-empty-sub [font-size:13px] [color:#5f6368] [margin-bottom:20px]">{{ isCompleted ? '点击上方按钮，AI助教将为您的代码进行专业点评' : '完成实验提交后，即可获取AI助教的代码点评' }}</div>
              <UiButton v-if="isCompleted" class="g-primary-btn [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:10px_24px] [font-size:14px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc]" @click="generateAiComment(false)">生成AI点评</UiButton>
            </div>
          </div>

          <!-- 报告 -->
          <div v-if="activeTab === 'report'" class="g-tab-body [padding:20px]">
            <div v-if="!isCompleted" class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-text [font-size:16px] [font-weight:500] [color:#202124] [margin-bottom:6px]">完成实验后可生成报告</div>
            </div>
            <div v-else class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="clipboard-check" :size="48" /></div>
              <div class="g-empty-text [font-size:16px] [font-weight:500] [color:#202124] [margin-bottom:6px]">AI实验报告生成</div>
              <div class="g-empty-sub [font-size:13px] [color:#5f6368] [margin-bottom:20px]">基于您的代码和AI点评，快速生成专业的实验报告</div>
              <UiButton class="g-primary-btn [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:10px_24px] [font-size:14px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc]" @click="$router.push('/student/ai-report')">前往AI报告生成中心</UiButton>
            </div>
          </div>

          <!-- AI 错误分析 -->
          <div v-if="activeTab === 'analysis'" class="g-tab-body [padding:20px]">
            <ErrorAnalysisPanel
              ref="errorAnalysisRef"
              :experiment-id="experimentId"
              :experiment-name="currentExp?.name || ''"
              :student-id="studentId"
              :student-name="studentName"
              :submissions="submissions"
              :auto-load="false"
              @warning-triggered="onWarningTriggered"
              @analysis-complete="onAnalysisComplete"
            />
          </div>
        </div>
      </div>
      <ui-empty v-else description="未找到该实验" />
    </loading-state>
  </div>
</template>

<script setup>
import { useExperimentStore } from '@/store'
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { Loading } from '@/components/ui/icons'
import LucideIcon from '@/components/LucideIcon.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import axios from 'axios'
import api from '@/api'
import { API_BASE_URL } from '../../config/runtime'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'
import ErrorAnalysisPanel from './components/ErrorAnalysisPanel.vue'

const API_BASE = API_BASE_URL
const route = useRoute()
const experimentStore = useExperimentStore()
const loading = ref(true)
const activeTab = ref('code')
const aiGenerating = ref(false)
const aiSource = ref('')
const localAiComment = ref('')
const submissions = ref([])
const studentId = ref('')
const studentName = ref('')
const errorAnalysisRef = ref(null)

const experimentId = computed(() => Number(route.params.id))
const currentExp = computed(() => {
  const exp = experimentStore.currentExperiment
  if (!exp) return null
  return (exp.data && typeof exp.data === 'object' && exp.data.id) ? exp.data : exp
})

const isCompleted = computed(() => currentExp.value?.status === 'completed')
const statusText = computed(() => ({ completed: '已完成', in_progress: '进行中' }[currentExp.value?.status] || '未开始'))
const plagiarismClass = computed(() => {
  const r = currentExp.value?.plagiarismRate || 0
  return r > 20 ? 'danger-text' : r > 10 ? 'warning-text' : ''
})

const aiCommentRaw = computed(() => localAiComment.value || currentExp.value?.aiComment || '')
const hasAiComment = computed(() => {
  const c = aiCommentRaw.value; return c && c.trim() && !c.includes('暂时还没有生成AI点评')
})
const renderedAiComment = computed(() => hasAiComment.value ? DOMPurify.sanitize(marked(aiCommentRaw.value)) : '')

function copyCode() {
  if (currentExp.value?.code) { navigator.clipboard.writeText(currentExp.value.code); uiMessage.success('代码已复制') }
}
function goToPTA() { uiMessage.info('请前往PTA平台完成实验') }

async function generateAiComment(force) {
  if (!isCompleted.value) return
  aiGenerating.value = true; aiSource.value = ''
  try {
    const res = await axios.post(`${API_BASE}/api/experiments/${experimentId.value}/ai-comment/generate?force=${force}`, null, { withCredentials: true })
    const data = res.data || res
    if (data.success && data.aiComment) {
      localAiComment.value = data.aiComment; aiSource.value = data.source || 'deepseek'
      if (data.source === 'deepseek') uiMessage.success('AI点评已生成')
    } else { uiMessage.warning(getFriendlyResponseMessage(data, 'AI 点评生成失败，请稍后重试')) }
  } catch (e) { uiMessage.error(getFriendlyErrorMessage(e, 'AI 点评生成失败，请稍后重试')) }
  finally { aiGenerating.value = false }
}

async function fetchSubmissions() {
  try {
    const res = await axios.get(`${API_BASE}/api/submissions?experimentId=${experimentId.value}`, { withCredentials: true })
    const data = res.data || res
    submissions.value = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  } catch (e) {
    logger.warn('获取提交记录失败:', e)
    submissions.value = []
  }
}

function resolveStudentInfo() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    studentId.value = userInfo.usernum || userInfo.studentId || userInfo.username || ''
    studentName.value = userInfo.name || userInfo.username || ''
  } catch {
    studentId.value = ''
    studentName.value = ''
  }
}

function onWarningTriggered(warningData) {
  logger.info('学生触发了教学干预预警:', warningData)
}

function onAnalysisComplete(result) {
  logger.info('错误分析完成:', result?.error?.analysisId)
}

/** 当学生有提交记录时，自动触发 AI 错误分析管线 */
async function autoTriggerAnalysisIfNeeded() {
  if (!submissions.value.length) return
  try {
    // 先检查是否已有存储的报告
    const statusRes = await api.checkAnalysisStatus(experimentId.value)
    if (statusRes?.success && statusRes?.ready) {
      // 已有报告，ErrorAnalysisPanel 会自动加载
      return
    }
    // 没有报告 → 触发异步管线
    api.triggerErrorAnalysis(experimentId.value).catch(() => { /* fire-and-forget */ })
    uiMessage.info('AI 错误分析已在后台启动，分析完成后可在此查看')
  } catch { /* analysis trigger is best-effort, don't block page load */ }
}

onMounted(async () => {
  loading.value = true
  resolveStudentInfo()
  try {
    await experimentStore.fetchExperimentDetail(experimentId.value)
    await fetchSubmissions()
    if (isCompleted.value && !hasAiComment.value) generateAiComment(false)
    // 自动触发分析（如果有提交记录但还没有报告）
    autoTriggerAnalysisIfNeeded()
  } catch (e) { logger.error('加载实验详情失败:', e) }
  finally { loading.value = false }
})
</script>


