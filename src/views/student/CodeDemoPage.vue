<template>
  <div class="min-h-screen bg-[var(--app-bg)] p-6">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-sm text-[var(--app-text-soft)]">
            <button
              class="flex items-center gap-1 hover:text-[var(--app-primary)]"
              @click="goBack"
            >
              <LucideIcon name="arrow-left" :size="16" />返回
            </button>
            <span>/</span>
            <span>代码执行演示</span>
          </div>
          <h1 class="mt-2 text-2xl font-bold text-[var(--app-text)]">
            {{ headerTitle }}
          </h1>
          <p class="mt-1 text-sm text-[var(--app-text-soft)]">
            可视化展示这段代码是如何一步步执行的
          </p>
        </div>
        <div v-if="loading" class="text-sm text-[var(--app-text-soft)]">处理中...</div>
      </div>

      <!-- Controls -->
      <div class="mb-6 rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-4">
        <label class="mb-2 block text-sm font-semibold text-[var(--app-text)]">标准输入 (stdin)</label>
        <textarea
          v-model="stdinInput"
          rows="3"
          placeholder="留空则由 AI 根据题目自动生成合适的输入；也可在此手动填写"
          class="w-full resize-y rounded-lg border border-[var(--app-border-soft)] bg-[var(--app-bg)] p-3 font-mono text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
          :disabled="loading"
        ></textarea>
        <div class="mt-3 flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="loading"
            @click="generate"
          >
            <LucideIcon :name="loading ? 'loader' : 'sparkles'" :size="16" :class="loading ? 'animate-spin' : ''" />
            {{ loading ? '生成中…' : (hasDemo ? '重新生成' : '生成演示') }}
          </button>
          <span v-if="workflowLabel && !loading" class="text-xs text-[var(--app-text-soft)]">生成方式：{{ workflowLabel }}</span>
        </div>
        <div v-if="usedStdin && !loading" class="mt-2 flex items-start gap-2 text-xs text-[var(--app-text-soft)]">
          <span class="shrink-0 pt-0.5">本次输入：</span>
          <code class="whitespace-pre-wrap break-all rounded bg-[var(--app-bg)] px-1.5 py-0.5 font-mono text-[var(--app-text)]">{{ usedStdin }}</code>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="overflow-hidden rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-10">
        <div class="flex flex-col items-center text-center">
          <div class="relative mb-5 h-14 w-14">
            <span class="absolute inset-0 rounded-full border-4 border-[var(--app-primary-soft)]"></span>
            <span class="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--app-primary)]"></span>
            <LucideIcon name="code" :size="22" class="absolute inset-0 m-auto text-[var(--app-primary)]" />
          </div>
          <p class="text-sm font-semibold text-[var(--app-text)]">{{ loadingTip }}</p>
          <p class="mt-1 text-xs text-[var(--app-text-soft)]">正在编译并逐行捕捉执行过程，首次生成可能需要十几秒…</p>
          <div class="mt-6 w-full max-w-md space-y-2.5">
            <div class="h-3 w-3/4 animate-pulse rounded bg-[var(--app-border-soft)]"></div>
            <div class="h-3 w-full animate-pulse rounded bg-[var(--app-border-soft)]" style="animation-delay:.15s"></div>
            <div class="h-3 w-5/6 animate-pulse rounded bg-[var(--app-border-soft)]" style="animation-delay:.3s"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="loadError"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ loadError }}
      </div>

      <!-- Empty -->
      <div
        v-else-if="!hasDemo"
        class="rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-12 text-center"
      >
        <LucideIcon name="inbox" :size="48" class="mx-auto text-[var(--app-text-soft)]" />
        <p class="mt-4 text-[var(--app-text-soft)]">尚未生成演示，点击上方「生成演示」开始</p>
      </div>

      <!-- Demo -->
      <div v-else class="space-y-6">
        <ErrorDemonstrationPlayer :demonstrations="demonstrations" variant="plain" readonly />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LucideIcon from '../../components/LucideIcon.vue'
import ErrorDemonstrationPlayer from '../../components/grading/ErrorDemonstrationPlayer.vue'
import api from '../../api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const loadError = ref('')
const stdinInput = ref('')
const demo = ref(null)
const workflow = ref('')
const usedStdin = ref('')

const loadingTip = ref('准备执行环境…')
const LOADING_TIPS = ['准备执行环境…', '正在编译代码…', '逐行捕捉变量状态…', '生成可视化动画…']
let tipTimer = null
function startTips() {
  stopTips()
  let idx = 0
  loadingTip.value = LOADING_TIPS[0]
  tipTimer = window.setInterval(() => {
    idx = (idx + 1) % LOADING_TIPS.length
    loadingTip.value = LOADING_TIPS[idx]
  }, 1500)
}
function stopTips() {
  if (tipTimer) {
    window.clearInterval(tipTimer)
    tipTimer = null
  }
}

const experimentId = computed(() => Number(route.params.experimentId))
const problemNo = computed(() => (route.query.problemNo != null ? String(route.query.problemNo) : ''))
const questionNumber = computed(() => route.query.number)

const hasDemo = computed(() => !!demo.value && Array.isArray(demo.value.frames) && demo.value.frames.length > 0)
const demonstrations = computed(() => (demo.value ? [demo.value] : []))

const headerTitle = computed(() => {
  const num = questionNumber.value ? `第${questionNumber.value}题 ` : ''
  const title = demo.value?.title || ''
  return `${num}${title}`.trim() || '代码执行演示'
})

const workflowLabel = computed(() => {
  if (workflow.value === 'PYTHON_TUTOR') return '真实执行'
  if (workflow.value === 'CONCEPT_STEPS') return 'AI 概念动画'
  return ''
})

function applyView(view) {
  if (!view || view.status === 'NONE') {
    demo.value = null
    workflow.value = ''
    usedStdin.value = ''
    return
  }
  demo.value = view.demonstration || null
  workflow.value = view.workflow || demo.value?.workflow || ''
  usedStdin.value = typeof view.stdin === 'string' ? view.stdin : ''
}

async function loadCached() {
  if (!experimentId.value || !problemNo.value) {
    loadError.value = '缺少必要的参数（实验或题号）'
    return
  }
  loading.value = true
  loadError.value = ''
  startTips()
  try {
    const res = await api.getCodeDemo({ experimentId: experimentId.value, problemNo: problemNo.value })
    applyView(res?.data || res)
  } catch (e) {
    loadError.value = e?.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
    stopTips()
  }
}

async function generate() {
  if (!experimentId.value || !problemNo.value) {
    loadError.value = '缺少必要的参数（实验或题号）'
    return
  }
  loading.value = true
  loadError.value = ''
  startTips()
  try {
    const res = await api.generateCodeDemo({
      experimentId: experimentId.value,
      problemNo: problemNo.value,
      stdin: stdinInput.value.trim().length ? stdinInput.value : null,
      force: true
    })
    applyView(res?.data || res)
    if (!hasDemo.value) {
      loadError.value = '生成完成，但没有可用的演示帧，请稍后重试或修改输入'
    }
  } catch (e) {
    loadError.value = e?.message || '生成失败，请稍后重试'
  } finally {
    loading.value = false
    stopTips()
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/student/ai-report')
  }
}

onMounted(() => {
  loadCached()
})

onBeforeUnmount(stopTips)
</script>
