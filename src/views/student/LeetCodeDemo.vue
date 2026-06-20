<template>
  <div class="leetcode-demo [padding:20px] [display:flex] [flex-direction:column] [gap:16px]">
    <UiPageHeader title="LeetCode 接口诊断" description="查询题目并验证当前后端运行、提交服务状态" />

    <ui-card class="query-card [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[flex-direction:column] [&_.ui-card__body]:[gap:14px]">
      <template #header>
        <div class="card-header [display:flex] [align-items:center] [justify-content:space-between] [gap:12px]">
          <span>题目查询</span>
          <ui-tag :type="problem ? 'success' : 'info'">{{ problem ? '已加载' : '未加载' }}</ui-tag>
        </div>
      </template>

      <div class="query-grid [display:grid] [grid-template-columns:minmax(160px,_1fr)_minmax(220px,_1fr)_auto] [gap:12px] max-[860px]:[grid-template-columns:1fr]">
        <ui-input v-model="problemId" placeholder="题号 / 数据库 ID / problem code" />
        <ui-input v-model="problemSlug" placeholder="LeetCode slug，例如 two-sum" />
        <div class="query-actions [display:flex] [gap:8px] [flex-wrap:wrap]">
          <ui-button type="primary" :loading="loadingProblem" @click="loadProblemById">
            <ui-icon><Search /></ui-icon>
            按题号查询
          </ui-button>
          <ui-button :loading="loadingProblem" @click="loadProblemBySlug">
            <ui-icon><Search /></ui-icon>
            按 slug 查询
          </ui-button>
        </div>
      </div>

      <ui-alert
        v-if="problemMessage"
        :title="problemMessage"
        :type="problem ? 'success' : 'warning'"
        :closable="false"
      />

      <div v-if="problem" class="problem-panel [display:grid] [grid-template-columns:minmax(0,_1.1fr)_minmax(260px,_0.9fr)] [gap:14px] max-[960px]:[grid-template-columns:1fr]">
        <section class="problem-summary [min-width:0]">
          <div class="problem-title [display:flex] [align-items:center] [gap:8px] [flex-wrap:wrap] [margin-bottom:10px]">
            <h3 class="[margin:0] [font-size:18px] [color:#0f172a]">{{ problem.title || '未命名题目' }}</h3>
            <ui-tag>{{ problem.difficulty || '未知难度' }}</ui-tag>
          </div>
          <p class="[margin:0] [color:#475569] [line-height:1.7] [white-space:pre-wrap]">{{ problem.description || problem.problemText || '后端未返回题面内容' }}</p>
        </section>

        <section class="problem-meta [display:flex] [flex-direction:column] [gap:8px] [font-size:13px] [color:#475569]">
          <div><strong>problemId：</strong>{{ problem.problemId || problem.id || '-' }}</div>
          <div><strong>numericId：</strong>{{ problem.numericId || '-' }}</div>
          <div><strong>source：</strong><a v-if="problem.sourceUrl || problem.url" :href="problem.sourceUrl || problem.url" target="_blank" rel="noreferrer">{{ problem.sourceUrl || problem.url }}</a><span v-else>-</span></div>
          <div class="[display:flex] [gap:6px] [flex-wrap:wrap]">
            <ui-tag v-for="tag in problemTags" :key="tag" size="small" effect="plain">{{ tag }}</ui-tag>
          </div>
        </section>
      </div>
    </ui-card>

    <ui-card class="judge-card [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[flex-direction:column] [&_.ui-card__body]:[gap:14px]">
      <template #header>
        <div class="card-header [display:flex] [align-items:center] [justify-content:space-between] [gap:12px]">
          <span>运行与提交</span>
          <ui-tag type="info">{{ language }}</ui-tag>
        </div>
      </template>

      <div class="judge-toolbar [display:flex] [gap:10px] [align-items:center] [flex-wrap:wrap]">
        <ui-select v-model="language" placeholder="语言" class="[min-width:160px]">
          <ui-option label="Java" value="java" />
          <ui-option label="Python" value="python" />
          <ui-option label="C++" value="cpp" />
          <ui-option label="C" value="c" />
          <ui-option label="JavaScript" value="javascript" />
        </ui-select>

        <ui-button type="primary" :disabled="!canJudge" :loading="running" @click="runCode">
          <ui-icon><VideoPlay /></ui-icon>
          运行
        </ui-button>
        <ui-button type="success" :disabled="!canJudge" :loading="submitting" @click="submitCode">
          <ui-icon><UploadFilled /></ui-icon>
          提交
        </ui-button>
      </div>

      <ui-input
        v-model="code"
        type="textarea"
        :rows="14"
        resize="none"
        placeholder="请输入要发送到后端判题接口的代码"
      />

      <ui-alert
        v-if="judgeMessage"
        :title="judgeMessage"
        :type="lastJudgeOk ? 'success' : 'warning'"
        :closable="false"
      />

      <div v-if="judgeResult" class="judge-result [display:grid] [grid-template-columns:minmax(0,_0.8fr)_minmax(0,_1.2fr)] [gap:14px] max-[960px]:[grid-template-columns:1fr]">
        <ui-descriptions title="接口返回" :column="2" border>
          <ui-descriptions-item label="success">
            <ui-tag :type="lastJudgeOk ? 'success' : 'warning'">{{ String(judgeResult.success) }}</ui-tag>
          </ui-descriptions-item>
          <ui-descriptions-item label="message">{{ judgeResult.message || '-' }}</ui-descriptions-item>
          <ui-descriptions-item label="status">{{ judgeData.status || '-' }}</ui-descriptions-item>
          <ui-descriptions-item label="score">{{ judgeData.score ?? '-' }}</ui-descriptions-item>
        </ui-descriptions>

        <div class="raw-result [min-width:0]">
          <h3 class="[margin:0_0_10px] [font-size:15px] [color:#0f172a]">原始响应</h3>
          <pre class="[margin:0] [max-height:360px] [overflow:auto] [border-radius:12px] [background:#0f172a] [padding:14px] [color:#e2e8f0] [font-size:12px] [line-height:1.6]">{{ formattedJudgeResult }}</pre>
        </div>
      </div>

      <div v-if="renderedFeedback" class="ai-feedback [border-left:4px_solid_var(--app-primary)] [background:#f8fafc] [border-radius:12px] [padding:16px] [line-height:1.7]" v-html="renderedFeedback"></div>
    </ui-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import api from '@/api'
import { message as uiMessage } from '@/services/feedback'
import { Search, UploadFilled, VideoPlay } from '@/components/ui/icons'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const problemId = ref('')
const problemSlug = ref('')
const problem = ref(null)
const problemMessage = ref('')
const loadingProblem = ref(false)

const language = ref('java')
const code = ref('')
const running = ref(false)
const submitting = ref(false)
const judgeResult = ref(null)
const judgeMessage = ref('')

const problemTags = computed(() => Array.isArray(problem.value?.tags) ? problem.value.tags : [])
const canJudge = computed(() => !!(problem.value && code.value.trim()))
const judgeData = computed(() => judgeResult.value?.data || {})
const lastJudgeOk = computed(() => judgeResult.value?.success === true)
const formattedJudgeResult = computed(() => JSON.stringify(judgeResult.value, null, 2))
const renderedFeedback = computed(() => {
  const feedback = judgeData.value.aiFeedback || judgeData.value.feedback || ''
  return feedback ? DOMPurify.sanitize(marked(feedback)) : ''
})

function extractProblem(response) {
  if (response?.success === false) {
    return { success: false, message: response.message || '题目查询失败', data: null }
  }
  return {
    success: true,
    message: response?.message || '题目已加载',
    data: response?.data || response || null
  }
}

function applyProblem(result) {
  if (!result.success || !result.data) {
    problem.value = null
    problemMessage.value = result.message || '题目查询失败'
    return
  }

  problem.value = result.data
  problemMessage.value = result.message
  if (!code.value.trim()) {
    code.value = starterCodeForLanguage(result.data, language.value)
  }
}

function starterCodeForLanguage(item, lang) {
  const starter = item?.starterCode || {}
  return starter[lang] || starter.java || starter.python || starter.cpp || starter.c || starter.javascript || ''
}

async function loadProblemById() {
  if (!problemId.value.trim()) {
    uiMessage.warning('请输入题号或 problem code')
    return
  }

  loadingProblem.value = true
  try {
    applyProblem(extractProblem(await api.getLeetCodeProblem(problemId.value.trim())))
  } catch (error) {
    problem.value = null
    problemMessage.value = error.message || '题目查询失败'
  } finally {
    loadingProblem.value = false
  }
}

async function loadProblemBySlug() {
  if (!problemSlug.value.trim()) {
    uiMessage.warning('请输入 LeetCode slug')
    return
  }

  loadingProblem.value = true
  try {
    applyProblem(extractProblem(await api.getLeetCodeProblemBySlug(problemSlug.value.trim())))
  } catch (error) {
    problem.value = null
    problemMessage.value = error.message || '题目查询失败'
  } finally {
    loadingProblem.value = false
  }
}

function judgePayload() {
  return {
    problemId: problem.value?.problemId || problem.value?.id || problemId.value.trim(),
    code: code.value,
    language: language.value
  }
}

function applyJudgeResult(response, fallbackMessage) {
  judgeResult.value = response || { success: false, message: fallbackMessage }
  judgeMessage.value = judgeResult.value?.message || fallbackMessage
  if (judgeResult.value?.success === false) {
    uiMessage.warning(judgeMessage.value)
    return
  }
  uiMessage.success(judgeMessage.value || '接口调用成功')
}

async function runCode() {
  if (!canJudge.value) {
    uiMessage.warning('请先加载题目并填写代码')
    return
  }

  running.value = true
  try {
    applyJudgeResult(await api.runLeetCodeSolution(judgePayload()), '运行接口返回空结果')
  } catch (error) {
    applyJudgeResult({ success: false, message: error.message || '运行失败' }, '运行失败')
  } finally {
    running.value = false
  }
}

async function submitCode() {
  if (!canJudge.value) {
    uiMessage.warning('请先加载题目并填写代码')
    return
  }

  submitting.value = true
  try {
    applyJudgeResult(await api.submitLeetCodeSolution(judgePayload()), '提交接口返回空结果')
  } catch (error) {
    applyJudgeResult({ success: false, message: error.message || '提交失败' }, '提交失败')
  } finally {
    submitting.value = false
  }
}

watch(language, (nextLanguage) => {
  if (problem.value && !code.value.trim()) {
    code.value = starterCodeForLanguage(problem.value, nextLanguage)
  }
})
</script>
