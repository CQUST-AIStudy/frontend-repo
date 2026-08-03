<template>
  <div class="error-analysis-panel">
    <!-- 空状态：无提交记录 -->
    <div v-if="!submissions || submissions.length === 0" class="g-empty [text-align:center] [padding:48px_20px] max-[640px]:[padding:32px_16px]">
      <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="search" :size="48" /></div>
      <div class="g-empty-text [font-size:16px] [font-weight:500] [color:#202124] [margin-bottom:6px]">暂无提交记录</div>
      <div class="g-empty-sub [font-size:13px] [color:#5f6368]">请先提交代码到PTA平台，系统将自动分析错误并提供学习建议</div>
    </div>

    <!-- 有提交记录 -->
    <div v-else>
      <!-- 操作栏 -->
      <div class="g-toolbar [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:16px] [flex-wrap:wrap] [gap:12px]">
        <div class="g-toolbar-left [display:flex] [align-items:center] [gap:12px]">
          <span class="g-toolbar-title [font-size:14px] [font-weight:500] [color:#202124]">
            提交记录 ({{ submissions.length }})
          </span>
          <span v-if="errorCount > 0" class="g-chip c-warn [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500] [background:#fef7e0] [color:#e37400]">
            {{ errorCount }} 个错误
          </span>
          <span v-if="acceptedCount > 0" class="g-chip c-ok [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500] [background:#e6f4ea] [color:#1e8e3e]">
            {{ acceptedCount }} 通过
          </span>
        </div>
        <button
          class="g-primary-btn-sm [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:6px_16px] [font-size:13px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc] disabled:[background:#9aa0a6] disabled:[cursor:not-allowed]"
          :disabled="analyzing"
          @click="runAnalysis"
        >
          {{ analyzing ? '分析中...' : (hasResult ? '重新分析' : 'AI 错误分析') }}
        </button>
      </div>

      <!-- 提交记录列表 -->
      <div class="g-submission-list [margin-bottom:16px]">
        <div
          v-for="(s, idx) in submissions"
          :key="idx"
          class="g-submission-row [display:flex] [align-items:flex-start] [gap:12px] [padding:12px_16px] [background:#f8f9fa] [border-radius:8px] [margin-bottom:8px] [border:1px_solid_#e8eaed] max-[640px]:[padding:10px_12px]"
        >
          <span class="g-attempt-badge [display:inline-flex] [align-items:center] [justify-content:center] [min-width:28px] [height:28px] [border-radius:50%] [font-size:12px] [font-weight:600] [flex-shrink:0]"
            :class="'badge-' + (s.judgeStatus || 'UNKNOWN').toLowerCase()">
            {{ s.attemptNo || (idx + 1) }}
          </span>
          <div class="g-submission-info [flex:1] [min-width:0]">
            <div class="g-submission-header [display:flex] [align-items:center] [gap:8px] [flex-wrap:wrap]">
              <span class="g-status-text [font-size:13px] [font-weight:500]" :class="statusColor(s.judgeStatus)">
                {{ statusLabel(s.judgeStatus) }}
              </span>
              <span v-if="s.compiler" class="g-compiler [font-size:11px] [color:#5f6368] [background:#e8eaed] [padding:2px_8px] [border-radius:4px]">{{ s.compiler }}</span>
              <span v-if="s.problemTitle" class="g-problem-title [font-size:12px] [color:#5f6368] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">{{ s.problemTitle }}</span>
              <span v-if="s.submittedAt" class="g-submit-time [font-size:11px] [color:#9aa0a6] [margin-left:auto]">{{ formatTime(s.submittedAt) }}</span>
            </div>
            <div v-if="s.errorMessage" class="g-error-preview [margin-top:6px] [font-size:12px] [color:#d93025] [background:#fce8e6] [padding:6px_10px] [border-radius:4px] [font-family:monospace] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
              {{ s.errorMessage }}
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="analyzing" class="g-analysis-loading [padding:24px_0] [text-align:center]">
        <div class="g-skeleton-wrap [padding:20px]">
          <div class="g-skeleton-row [margin-bottom:16px]" v-for="i in 3" :key="i">
            <div class="g-skeleton-block [height:14px] [border-radius:8px] [background:linear-gradient(90deg,_#f0f0f0_25%,_#e8e8e8_50%,_#f0f0f0_75%)] [background-size:200%_100%] [animation:g-shimmer_1.5s_ease-in-out_infinite]" :style="{ width: (90 - i * 15) + '%' }"></div>
          </div>
        </div>
        <div class="g-ai-loading-tip [display:flex] [align-items:center] [justify-content:center] [gap:8px] [color:#5f6368] [font-size:13px] [margin-top:12px]">
          <span class="g-loading-spinner [width:16px] [height:16px] [border:2px_solid_#e8eaed] [border-top-color:#1a73e8] [border-radius:50%] [display:inline-block] [animation:spin_0.8s_linear_infinite]"></span>
          正在调用 AI 分析代码错误，预计需要 10-20 秒...
        </div>
      </div>

      <!-- 分析结果 -->
      <div v-if="hasResult && !analyzing" class="g-analysis-result">
        <!-- 总体评估 -->
        <div class="g-result-card [background:#fff] [border:1px_solid_#e8eaed] [border-radius:12px] [padding:20px] [margin-bottom:16px] max-[640px]:[padding:14px]">
          <div class="g-result-header [display:flex] [align-items:center] [gap:10px] [margin-bottom:12px]">
            <span class="g-result-icon [font-size:20px]">{{ severityIcon(result.severity) }}</span>
            <span class="g-result-title [font-size:15px] [font-weight:600] [color:#202124]">AI 错误分析报告</span>
            <span class="g-severity-chip [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500]"
              :class="'severity-' + (result.severity || 'LOW').toLowerCase()">
              {{ severityLabel(result.severity) }}
            </span>
          </div>
          <div class="g-assessment [font-size:14px] [line-height:1.8] [color:#202124] [background:#f8f9fa] [padding:12px_16px] [border-radius:8px]">
            {{ result.overallAssessment || '暂无评估' }}
          </div>
        </div>

        <!-- 错误类别 -->
        <div v-if="result.errorCategories && result.errorCategories.length > 0" class="g-error-categories">
          <div class="g-section-title [font-size:14px] [font-weight:600] [color:#202124] [margin-bottom:12px]">错误分类详情</div>
          <div
            v-for="(cat, ci) in result.errorCategories"
            :key="ci"
            class="g-error-category [background:#fff] [border:1px_solid_#e8eaed] [border-radius:10px] [padding:16px] [margin-bottom:12px] max-[640px]:[padding:12px]"
          >
            <div class="g-cat-header [display:flex] [align-items:center] [gap:8px] [margin-bottom:8px]">
              <span class="g-cat-type [font-size:13px] [font-weight:600] [color:#202124]">{{ cat.type }}</span>
              <span class="g-cat-count [font-size:11px] [color:#5f6368] [background:#f1f3f4] [padding:2px_8px] [border-radius:4px]">{{ cat.count }} 次</span>
              <span v-if="cat.isSystemic" class="g-systemic-badge [font-size:11px] [color:#d93025] [background:#fce8e6] [padding:2px_8px] [border-radius:4px]">系统性问题</span>
            </div>
            <div v-if="cat.rootCause" class="g-root-cause [font-size:13px] [color:#5f6368] [margin-bottom:8px]">
              <strong>根因：</strong>{{ cat.rootCause }}
            </div>
            <ul v-if="cat.specificIssues && cat.specificIssues.length > 0" class="g-issues [margin:0] [padding-left:18px] [font-size:13px] [color:#5f6368] [line-height:1.8]">
              <li v-for="(issue, ii) in cat.specificIssues" :key="ii">{{ issue }}</li>
            </ul>
            <div v-if="cat.suggestions && cat.suggestions.length > 0" class="g-suggestions [margin-top:10px] [padding-top:10px] [border-top:1px_solid_#e8eaed]">
              <div class="g-suggestion-label [font-size:12px] [font-weight:500] [color:#1a73e8] [margin-bottom:4px]">改进建议：</div>
              <ul class="g-suggestion-list [margin:0] [padding-left:18px] [font-size:13px] [color:#1a73e8] [line-height:1.8]">
                <li v-for="(sug, si) in cat.suggestions" :key="si">{{ sug }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 学习建议 -->
        <div v-if="result.learningSuggestions && result.learningSuggestions.length > 0" class="g-learning-suggestions [background:#fff] [border:1px_solid_#e8eaed] [border-radius:10px] [padding:16px] [margin-bottom:12px]">
          <div class="g-section-title [font-size:14px] [font-weight:600] [color:#202124] [margin-bottom:12px]">个性化学习建议</div>
          <div
            v-for="(ls, li) in result.learningSuggestions"
            :key="li"
            class="g-learning-item [display:flex] [align-items:flex-start] [gap:10px] [padding:10px_0] [border-bottom:1px_solid_#f1f3f4]"
            :class="{ '[border-bottom:none]': li === result.learningSuggestions.length - 1 }"
          >
            <span class="g-priority-badge [display:inline-block] [font-size:10px] [font-weight:600] [padding:2px_8px] [border-radius:4px] [flex-shrink:0] [margin-top:2px]"
              :class="'priority-' + (ls.priority || 'MEDIUM').toLowerCase()">
              {{ ls.priority }}
            </span>
            <div>
              <div class="g-learning-topic [font-size:13px] [font-weight:500] [color:#202124]">{{ ls.topic }}</div>
              <div class="g-learning-reason [font-size:12px] [color:#5f6368] [margin-top:2px]">{{ ls.reason }}</div>
              <div v-if="ls.suggestedResources" class="g-learning-resource [font-size:12px] [color:#1a73e8] [margin-top:2px]">
                {{ ls.suggestedResources }}
              </div>
            </div>
          </div>
        </div>

        <!-- 干预提示 -->
        <div v-if="result.interventionTriggered" class="g-intervention [background:#fef7e0] [border:1px_solid_#e37400] [border-radius:10px] [padding:16px] [margin-bottom:12px]">
          <div class="g-intervention-header [display:flex] [align-items:center] [gap:8px] [margin-bottom:8px]">
            <span class="g-intervention-icon [font-size:18px]"><LucideIcon name="alert-triangle" :size="18" /></span>
            <span class="g-intervention-title [font-size:14px] [font-weight:600] [color:#e37400]">教学干预建议</span>
          </div>
          <div class="g-intervention-message [font-size:13px] [color:#5f6368] [line-height:1.8]">
            {{ result.interventionMessage || '该学生可能需要教师关注和帮助。' }}
          </div>
        </div>
      </div>

      <!-- 无结果提示 -->
      <div v-if="!analyzing && !hasResult && analysisAttempted" class="g-empty [text-align:center] [padding:24px_20px] max-[640px]:[padding:20px_14px]">
        <div class="g-empty-sub [font-size:13px] [color:#5f6368]">分析失败，请稍后重试</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import api from '@/api'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import LucideIcon from '@/components/LucideIcon.vue'

const props = defineProps({
  experimentId: { type: Number, required: true },
  experimentName: { type: String, default: '' },
  studentId: { type: String, default: '' },
  studentName: { type: String, default: '' },
  submissions: { type: Array, default: () => [] },
  autoLoad: { type: Boolean, default: false }
})

const emit = defineEmits(['warning-triggered', 'analysis-complete'])

const analyzing = ref(false)
const analysisAttempted = ref(false)
const result = ref({})

const errorCount = computed(() => {
  if (!props.submissions) return 0
  return props.submissions.filter(s => {
    const st = (s.judgeStatus || '').toUpperCase()
    return st && st !== 'ACCEPTED' && st !== 'AC'
  }).length
})

const acceptedCount = computed(() => {
  if (!props.submissions) return 0
  return props.submissions.filter(s => {
    const st = (s.judgeStatus || '').toUpperCase()
    return st === 'ACCEPTED' || st === 'AC'
  }).length
})

const hasResult = computed(() => {
  return result.value && (result.value.overallAssessment || (result.value.errorCategories && result.value.errorCategories.length > 0))
})

function statusColor(status) {
  const s = (status || '').toUpperCase()
  if (s === 'ACCEPTED' || s === 'AC') return '[color:#1e8e3e]'
  if (s === 'COMPILE_ERROR' || s === 'RUNTIME_ERROR') return '[color:#d93025]'
  if (s === 'WRONG_ANSWER') return '[color:#e37400]'
  if (s === 'TIME_LIMIT_EXCEEDED' || s === 'MEMORY_LIMIT_EXCEEDED') return '[color:#f9ab00]'
  return '[color:#5f6368]'
}

function statusLabel(status) {
  const s = (status || '').toUpperCase()
  const map = {
    ACCEPTED: '通过',
    AC: '通过',
    COMPILE_ERROR: '编译错误',
    RUNTIME_ERROR: '运行错误',
    WRONG_ANSWER: '答案错误',
    TIME_LIMIT_EXCEEDED: '超时',
    MEMORY_LIMIT_EXCEEDED: '内存超限',
    UNKNOWN: '未知'
  }
  return map[s] || status || '未知'
}

function severityIcon() {
  return ''
}

function severityLabel(severity) {
  const map = { HIGH: '需关注', MEDIUM: '中等', LOW: '轻微' }
  return map[severity] || severity || '轻微'
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return isoStr
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch { return isoStr }
}

async function runAnalysis() {
  if (analyzing.value) return
  if (!props.submissions || props.submissions.length === 0) {
    uiMessage.warning('暂无提交记录，无法进行分析')
    return
  }

  analyzing.value = true
  analysisAttempted.value = true
  result.value = {}

  try {
    // 1. 先触发异步分析管线
    try {
      await api.triggerErrorAnalysis(props.experimentId)
    } catch (triggerErr) {
      logger.warn('触发异步分析失败，尝试同步分析:', triggerErr)
    }

    // 2. 构建同步分析请求
    const payload = {
      studentId: String(props.studentId || ''),
      studentName: String(props.studentName || ''),
      experimentId: Number(props.experimentId),
      experimentName: String(props.experimentName || ''),
      problemTitle: props.submissions[0]?.problemTitle || props.experimentName || '',
      submissions: props.submissions.map((s, i) => ({
        attemptNo: s.attemptNo || (i + 1),
        judgeStatus: s.judgeStatus || 'UNKNOWN',
        compiler: s.compiler || null,
        errorMessage: s.errorMessage || null,
        code: s.code || '',
        submittedAt: s.submittedAt || null,
        runtimeMs: s.runtimeMs || null,
        memoryKb: s.memoryKb || null
      }))
    }

    // 3. 调用错误分析 API
    const analysisRes = await api.analyzeError(payload)
    const analysisData = analysisRes?.data || analysisRes

    if (analysisData) {
      result.value = analysisData
      emit('analysis-complete', { error: analysisData })
    }

    // 4. 检查是否需要预警
    const compileErrors = props.submissions.filter(s => (s.judgeStatus || '').toUpperCase() === 'COMPILE_ERROR').length
    const runtimeErrors = props.submissions.filter(s => (s.judgeStatus || '').toUpperCase() === 'RUNTIME_ERROR').length
    const wrongAnswers = props.submissions.filter(s => (s.judgeStatus || '').toUpperCase() === 'WRONG_ANSWER').length
    const timeLimitExceeded = props.submissions.filter(s => (s.judgeStatus || '').toUpperCase() === 'TIME_LIMIT_EXCEEDED').length
    const accepted = props.submissions.filter(s => {
      const st = (s.judgeStatus || '').toUpperCase()
      return st === 'ACCEPTED' || st === 'AC'
    }).length

    const warningPayload = {
      studentId: String(props.studentId || ''),
      studentName: String(props.studentName || ''),
      experimentId: Number(props.experimentId),
      experimentName: String(props.experimentName || ''),
      totalSubmissions: props.submissions.length,
      acceptedCount: accepted,
      totalProblems: 1,
      compileErrors,
      runtimeErrors,
      wrongAnswers,
      timeLimitExceeded,
      lastSubmissionAt: props.submissions[props.submissions.length - 1]?.submittedAt || new Date().toISOString(),
      submissions: payload.submissions
    }

    const warningRes = await api.getWarningAnalysis(warningPayload)
    const warningData = warningRes?.data || warningRes

    if (warningData?.triggered) {
      emit('warning-triggered', warningData)
      if (warningData.warning?.warningMessage) {
        uiMessage.warning(warningData.warning.warningMessage)
      }
    }

    // 5. 如果分析成功但缺少学习建议，则单独获取
    if (analysisData && (!analysisData.learningSuggestions || analysisData.learningSuggestions.length === 0)) {
      const errorHistory = extractErrorHistory(props.submissions)
      if (errorHistory.length > 0) {
        try {
          const learningRes = await api.getLearningSuggestions({
            studentId: String(props.studentId || ''),
            studentName: String(props.studentName || ''),
            errorHistory,
            skillStates: []
          })
          const learningData = learningRes?.data || learningRes
          if (learningData?.weakPoints || learningData?.studyPlan) {
            result.value = {
              ...result.value,
              learningSuggestions: learningData.studyPlan || [],
              weakPoints: learningData.weakPoints || []
            }
          }
        } catch (learningErr) {
          logger.warn('获取学习建议失败:', learningErr)
        }
      }
    }

    if (analysisData) {
      uiMessage.success('AI 错误分析完成')
    }
  } catch (e) {
    logger.error('AI 错误分析失败:', e)
    uiMessage.error('AI 错误分析失败，请稍后重试')
    result.value = {}
  } finally {
    analyzing.value = false
  }
}

function extractErrorHistory(submissions) {
  const errorMap = {}
  for (const s of submissions) {
    const status = (s.judgeStatus || 'UNKNOWN').toUpperCase()
    if (status !== 'ACCEPTED' && status !== 'AC') {
      errorMap[status] = (errorMap[status] || 0) + 1
    }
  }
  return Object.entries(errorMap).map(([errorType, count]) => ({ errorType, count }))
}

// 自动加载：当有提交记录且 autoLoad 为 true 时自动触发分析
watch(
  () => [props.submissions, props.autoLoad],
  ([subs, auto]) => {
    if (auto && subs && subs.length > 0 && !hasResult.value && !analyzing.value) {
      runAnalysis()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.error-analysis-panel {
  min-height: 200px;
}

.g-submission-list {
  max-height: 360px;
  overflow-y: auto;
}

.badge-accepted,
.badge-ac {
  background: #e6f4ea;
  color: #1e8e3e;
}

.badge-compile_error {
  background: #fce8e6;
  color: #d93025;
}

.badge-runtime_error {
  background: #fce8e6;
  color: #d93025;
}

.badge-wrong_answer {
  background: #fef7e0;
  color: #e37400;
}

.badge-time_limit_exceeded,
.badge-memory_limit_exceeded {
  background: #fef7e0;
  color: #f9ab00;
}

.badge-unknown {
  background: #f1f3f4;
  color: #5f6368;
}

.severity-high {
  background: #fce8e6;
  color: #d93025;
}

.severity-medium {
  background: #fef7e0;
  color: #e37400;
}

.severity-low {
  background: #e6f4ea;
  color: #1e8e3e;
}

.priority-high {
  background: #fce8e6;
  color: #d93025;
}

.priority-medium {
  background: #fef7e0;
  color: #e37400;
}

.priority-low {
  background: #f1f3f4;
  color: #5f6368;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
