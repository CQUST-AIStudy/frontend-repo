<template>
  <div class="min-h-screen bg-[var(--app-bg)] p-6">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-sm text-[var(--app-text-soft)]">
            <button class="flex items-center gap-1 hover:text-[var(--app-primary)]" @click="goBack">
              <LucideIcon name="arrow-left" :size="16" />返回
            </button>
            <span>/</span>
            <span>AI 助教</span>
            <span>/</span>
            <span>代码演示</span>
          </div>
          <h1 class="mt-2 text-2xl font-bold text-[var(--app-text)]">代码演示</h1>
          <p class="mt-1 text-sm text-[var(--app-text-soft)]">
            贴上你的（错误）代码和题目，AI 会真实执行并逐行可视化，编译不过则生成概念动画
          </p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[260px_1fr]">
        <!-- History sidebar -->
        <aside class="rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-3">
          <div class="mb-2 flex items-center justify-between px-1">
            <span class="text-sm font-semibold text-[var(--app-text)]">历史记录</span>
            <button class="text-xs text-[var(--app-text-soft)] hover:text-[var(--app-primary)]" @click="refreshHistory">刷新</button>
          </div>
          <div v-if="history.length === 0" class="py-8 text-center text-xs text-[var(--app-text-soft)]">暂无历史记录</div>
          <ul v-else class="space-y-1">
            <li v-for="h in history" :key="h.id">
              <div
                class="group flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 transition hover:bg-[var(--app-bg)]"
                :class="{ 'bg-[var(--app-primary-soft)]': activeId === h.id }"
                @click="loadDemo(h.id)"
              >
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm text-[var(--app-text)]" :class="{ '!text-[var(--app-primary)] font-semibold': activeId === h.id }">
                    {{ h.title || '未命名演示' }}
                  </div>
                  <div class="text-[11px] text-[var(--app-text-soft)]">{{ workflowText(h.workflow) }} · {{ formatTime(h.createdAt) }}</div>
                </div>
                <button
                  class="shrink-0 rounded px-1 text-[var(--app-text-soft)] opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                  title="删除"
                  @click.stop="del(h.id)"
                >×</button>
              </div>
            </li>
          </ul>
        </aside>

        <!-- Main -->
        <div class="space-y-6">
          <!-- Input form -->
          <div class="space-y-3 rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-4">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-[var(--app-text)]">
                代码 <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="codeInput"
                rows="10"
                placeholder="在此粘贴你的代码（支持 C；缺少 main 会自动补壳）"
                class="w-full resize-y rounded-lg border border-[var(--app-border-soft)] bg-[var(--app-bg)] p-3 font-mono text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                :disabled="loading"
              ></textarea>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-[var(--app-text)]">题目描述（可选）</label>
                <textarea
                  v-model="problemInput"
                  rows="4"
                  placeholder="贴上题目，帮助 AI 生成合适的输入并理解题意"
                  class="w-full resize-y rounded-lg border border-[var(--app-border-soft)] bg-[var(--app-bg)] p-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                  :disabled="loading"
                ></textarea>
              </div>
              <div class="space-y-3">
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-[var(--app-text)]">标准输入 stdin（可选）</label>
                  <textarea
                    v-model="stdinInput"
                    rows="2"
                    placeholder="留空则由 AI 根据题目自动生成"
                    class="w-full resize-y rounded-lg border border-[var(--app-border-soft)] bg-[var(--app-bg)] p-3 font-mono text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                    :disabled="loading"
                  ></textarea>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-[var(--app-text)]">标题（可选）</label>
                  <input
                    v-model="titleInput"
                    placeholder="留空自动取题目首行"
                    class="w-full rounded-lg border border-[var(--app-border-soft)] bg-[var(--app-bg)] p-2.5 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                    :disabled="loading"
                  />
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                :disabled="loading || !codeInput.trim()"
                @click="generate"
              >
                <LucideIcon :name="loading ? 'loader' : 'sparkles'" :size="16" :class="loading ? 'animate-spin' : ''" />
                {{ loading ? '生成中…' : '生成演示' }}
              </button>
              <span v-if="workflowLabel && !loading" class="text-xs text-[var(--app-text-soft)]">生成方式：{{ workflowLabel }}</span>
            </div>
            <div v-if="usedStdin && !loading" class="flex items-start gap-2 text-xs text-[var(--app-text-soft)]">
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
          <div v-else-if="loadError" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {{ loadError }}
          </div>

          <!-- Empty -->
          <div v-else-if="!hasDemo" class="rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-12 text-center">
            <LucideIcon name="inbox" :size="48" class="mx-auto text-[var(--app-text-soft)]" />
            <p class="mt-4 text-[var(--app-text-soft)]">填写代码后点击「生成演示」，或从左侧历史中选择一条查看</p>
          </div>

          <!-- Demo -->
          <div v-else class="space-y-6">
            <ErrorDemonstrationPlayer :demonstrations="demonstrations" variant="plain" readonly />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LucideIcon from '../../components/LucideIcon.vue'
import ErrorDemonstrationPlayer from '../../components/grading/ErrorDemonstrationPlayer.vue'
import api from '../../api'

const router = useRouter()

const loading = ref(false)
const loadError = ref('')
const codeInput = ref('')
const problemInput = ref('')
const stdinInput = ref('')
const titleInput = ref('')

const demo = ref(null)
const workflow = ref('')
const usedStdin = ref('')
const history = ref([])
const activeId = ref(null)

const loadingTip = ref('准备执行环境…')
const LOADING_TIPS = ['准备执行环境…', '正在编译代码…', '逐行捕捉变量状态…', '生成可视化动画…']
let tipTimer = null
let pollTimer = null
function stopPoll() {
  if (pollTimer) {
    window.clearTimeout(pollTimer)
    pollTimer = null
  }
}
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

const hasDemo = computed(() => !!demo.value && Array.isArray(demo.value.frames) && demo.value.frames.length > 0)
const demonstrations = computed(() => (demo.value ? [demo.value] : []))

const workflowLabel = computed(() => workflowText(workflow.value))

function workflowText(w) {
  if (w === 'PYTHON_TUTOR') return '真实执行'
  if (w === 'CONCEPT_STEPS') return 'AI 概念动画'
  return ''
}

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch (e) {
    return String(iso)
  }
}

function applyView(view) {
  if (!view) {
    demo.value = null
    workflow.value = ''
    usedStdin.value = ''
    return
  }
  demo.value = view.demonstration || null
  workflow.value = view.workflow || demo.value?.workflow || ''
  usedStdin.value = typeof view.stdin === 'string' ? view.stdin : ''
}

async function refreshHistory() {
  try {
    const res = await api.getPlaygroundHistory()
    const data = res?.data || res
    history.value = Array.isArray(data?.items) ? data.items : []
  } catch (e) {
    // 历史加载失败不阻塞主流程
  }
}

async function generate() {
  if (!codeInput.value.trim()) {
    loadError.value = '请填写代码'
    return
  }
  loading.value = true
  loadError.value = ''
  startTips()
  try {
    const res = await api.generatePlaygroundDemo({
      title: titleInput.value.trim() || null,
      problemMd: problemInput.value.trim() || null,
      code: codeInput.value,
      stdin: stdinInput.value.trim().length ? stdinInput.value : null
    })
    const view = res?.data || res
    activeId.value = view?.id ?? null
    // 后端异步生成：先返回 PROCESSING 记录，轮询详情直到 COMPLETED/FAILED
    const finalView = view?.status === 'PROCESSING' && view?.id != null
      ? await pollUntilDone(view.id)
      : view
    applyView(finalView)
    if (finalView?.status === 'FAILED') {
      loadError.value = '生成失败，请稍后重试或修改输入'
    } else if (!hasDemo.value) {
      loadError.value = '生成完成，但没有可用的演示帧，请稍后重试或修改输入'
    }
    await refreshHistory()
  } catch (e) {
    loadError.value = e?.message || '生成失败，请稍后重试'
  } finally {
    loading.value = false
    stopTips()
  }
}

// 轮询异步生成结果：每 2s 拉取一次详情，直到状态不再是 PROCESSING（最长约 150s）
function pollUntilDone(id) {
  const POLL_INTERVAL = 2000
  const MAX_POLLS = 75
  return new Promise((resolve, reject) => {
    let count = 0
    const tick = async () => {
      count += 1
      try {
        const res = await api.getPlaygroundDemo(id)
        const view = res?.data || res
        if (view?.status !== 'PROCESSING') {
          pollTimer = null
          resolve(view)
          return
        }
        if (count >= MAX_POLLS) {
          pollTimer = null
          resolve(view)
          return
        }
      } catch (e) {
        if (count >= MAX_POLLS) {
          pollTimer = null
          reject(e)
          return
        }
      }
      pollTimer = window.setTimeout(tick, POLL_INTERVAL)
    }
    tick()
  })
}

async function loadDemo(id) {
  loading.value = true
  loadError.value = ''
  startTips()
  try {
    const res = await api.getPlaygroundDemo(id)
    let view = res?.data || res
    // 历史记录可能仍在异步生成中，同样轮询等待完成
    if (view?.status === 'PROCESSING') {
      view = await pollUntilDone(id)
    }
    applyView(view)
    activeId.value = id
    if (view?.status === 'FAILED') {
      loadError.value = '该演示生成失败，请重新生成'
    }
  } catch (e) {
    loadError.value = e?.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
    stopTips()
  }
}

async function del(id) {
  try {
    await api.deletePlaygroundDemo(id)
    if (activeId.value === id) {
      stopPoll()
      demo.value = null
      workflow.value = ''
      usedStdin.value = ''
      activeId.value = null
    }
    await refreshHistory()
  } catch (e) {
    loadError.value = e?.message || '删除失败，请稍后重试'
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/student/ai-assistant')
  }
}

onMounted(refreshHistory)
onBeforeUnmount(() => {
  stopTips()
  stopPoll()
})
</script>
