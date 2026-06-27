<template>
  <section v-if="items.length" class="overflow-hidden rounded-xl border border-[#dbe3ef] bg-white">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8edf4] px-5 py-4">
      <div>
        <div class="flex items-center gap-2">
          <LucideIcon name="bug" :size="18" class="text-[#ef4444]" />
          <h3 class="m-0 text-base font-semibold text-[#172033]">错误演示</h3>
          <span class="rounded bg-[#fff1f2] px-2 py-0.5 text-xs text-[#dc2626]">{{ items.length }} 处</span>
        </div>
      </div>
      <select v-if="items.length > 1" v-model="activeIndex" class="h-9 rounded-lg border border-[#d7dfeb] bg-white px-3 text-sm text-[#334155] outline-none">
        <option v-for="(demo, index) in items" :key="demo.id" :value="index">{{ index + 1 }}. {{ demo.title }}</option>
      </select>
    </header>

    <!-- PYTHON_TUTOR 工作流：代码执行可视化 -->
    <div v-if="current.workflow === 'PYTHON_TUTOR'" class="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(440px,1.05fr)]">
      <div class="border-b border-[#e8edf4] p-5 lg:border-b-0 lg:border-r">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-semibold text-[#172033]">代码（C）</span>
          <span class="text-xs text-[#dc2626]">{{ current.title }}</span>
        </div>
        <div class="overflow-hidden rounded-lg border border-[#dce3ec] bg-[#fbfcfe] font-mono text-[13px] leading-7">
          <div
            v-for="(line, index) in sourceLines"
            :key="`wrong-${index}`"
            class="grid grid-cols-[36px_1fr_auto] gap-2 border-l-[3px] px-2"
            :class="lineClass(index + 1)"
          >
            <span class="select-none text-right text-[#9aa5b5]">{{ index + 1 }}</span>
            <code class="whitespace-pre-wrap text-[#1f2937]">{{ line || ' ' }}</code>
            <span v-if="index + 1 === current.errorLine" class="font-sans text-xs font-semibold text-[#dc2626]">错误行</span>
          </div>
        </div>

        <div class="my-4 flex items-center gap-3 text-xs font-medium">
          <span class="inline-flex items-center gap-1.5 text-[#dc2626]"><span class="h-2.5 w-2.5 rounded-sm bg-[#ef4444]"></span>错误写法</span>
          <span class="inline-flex items-center gap-1.5 text-[#15803d]"><span class="h-2.5 w-2.5 rounded-sm bg-[#22c55e]"></span>正确写法</span>
        </div>
        <pre class="markdown-code-block m-0 text-[13px] leading-6"><code class="hljs" v-html="highlightText(current.correctedCode)"></code></pre>
      </div>

      <div class="p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <span class="text-sm font-semibold text-[#172033]">执行过程可视化 <span v-if="readonly" class="font-normal text-[#8b96a8]">（只读）</span></span>
          <span class="text-xs text-[#64748b]">第 {{ activeStep.order }} 步 / 共 {{ steps.length }} 步</span>
        </div>

        <div class="mb-4">
          <PythonTutorRenderer v-if="activeStep.state" :state="activeStep.state" :height="240" />
          <div v-else-if="activeStep.memory?.length" class="rounded-lg border border-[#dce3ec] bg-[#fbfcfe] p-4">
            <div class="mb-3 text-xs font-semibold text-[#475569]">内存状态</div>
            <div class="flex flex-wrap items-end gap-1.5">
              <div v-for="cell in activeStep.memory" :key="cell.label" class="text-center">
                <div class="mb-1 text-[11px] text-[#64748b]">{{ cell.label }}</div>
                <div class="flex h-12 min-w-14 items-center justify-center rounded border px-2 text-sm font-semibold transition-colors"
                  :class="cell.outOfBounds ? 'border-dashed border-[#ef4444] bg-[#fff1f2] text-[#dc2626]' : cell.active ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]' : 'border-[#cbd5e1] bg-white text-[#334155]'">
                  {{ cell.value }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4 overflow-hidden rounded-lg border border-[#dce3ec]">
          <div class="bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#475569]">变量状态（当前步）</div>
          <div v-for="(value, key) in activeStep.variables" :key="key" class="grid grid-cols-[120px_1fr] border-t border-[#edf1f6] px-3 py-2 text-sm">
            <span class="font-mono text-[#475569]">{{ key }}</span>
            <span :class="activeStep.error ? 'font-semibold text-[#dc2626]' : 'text-[#172033]'">{{ value }}</span>
          </div>
        </div>

        <div class="rounded-lg border px-4 py-3 text-sm leading-6" :class="activeStep.error ? 'border-[#fecaca] bg-[#fff7f7] text-[#b91c1c]' : 'border-[#bfdbfe] bg-[#f5f9ff] text-[#1e3a8a]'">
          <div class="mb-1 flex items-center gap-2 font-semibold">
            <LucideIcon :name="activeStep.error ? 'triangle-alert' : 'circle-check'" :size="16" />
            {{ activeStep.error ? `第 ${activeStep.order} 步发生错误` : `第 ${activeStep.order} 步执行正常` }}
          </div>
          {{ activeStep.explanation }}
        </div>

        <div class="mt-5 flex items-center gap-2">
          <UiButton :disabled="stepIndex === 0" @click="previous" class="h-9 rounded-lg border border-[#d7dfeb] bg-white px-4 text-sm text-[#334155] disabled:opacity-40">上一步</UiButton>
          <UiButton @click="togglePlay" class="inline-flex h-9 min-w-24 items-center justify-center gap-2 rounded-lg border-none bg-[var(--app-primary)] px-4 text-sm text-white">
            <LucideIcon :name="playing ? 'pause' : 'play'" :size="16" />{{ playing ? '暂停' : '播放' }}
          </UiButton>
          <UiButton :disabled="stepIndex >= steps.length - 1" @click="next" class="h-9 rounded-lg border border-[#d7dfeb] bg-white px-4 text-sm text-[#334155] disabled:opacity-40">下一步</UiButton>
          <UiButton @click="reset" class="ml-auto h-9 rounded-lg border-none bg-[#f1f5f9] px-3 text-sm text-[#475569]" title="重置演示"><LucideIcon name="rotate-ccw" :size="16" /></UiButton>
        </div>

        <div class="mt-4 flex items-center gap-1.5">
          <button v-for="(step, index) in steps" :key="step.order" type="button" @click="goTo(index)" class="h-2 flex-1 cursor-pointer rounded border-none p-0 transition-colors" :class="index <= stepIndex ? (step.error ? 'bg-[#ef4444]' : 'bg-[var(--app-primary)]') : 'bg-[#e2e8f0]'" :aria-label="`第 ${step.order} 步`"></button>
        </div>
      </div>

      <footer class="col-span-full border-t border-[#e8edf4] bg-[#fbfcfe] px-5 py-4">
        <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded-lg border border-[#fecaca] bg-[#fff7f7] p-3">
            <div class="mb-1 text-xs font-semibold text-[#dc2626]">为什么错</div>
            <p class="m-0 text-sm leading-6 text-[#7f1d1d]">{{ current.explanation }}</p>
          </div>
          <div class="rounded-lg border border-[#bbdfc5] bg-[#f3fbf5] p-3">
            <div class="mb-1 text-xs font-semibold text-[#15803d]">如何修正</div>
            <p class="m-0 whitespace-pre-wrap font-mono text-sm leading-6 text-[#166534]">{{ current.correctedCode }}</p>
          </div>
        </div>
      </footer>
    </div>

    <!-- HTML_ANIMATION 工作流：AI 生成 HTML 动画 -->
    <div v-else-if="current.workflow === 'HTML_ANIMATION'" class="p-5">
      <div v-if="htmlFrame" class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="m-0 text-base font-semibold text-[#172033]">{{ htmlFrame.title || current.title }}</h4>
          <span v-if="readonly" class="text-xs text-[#8b96a8]">只读</span>
        </div>
        <div class="relative aspect-video w-full overflow-hidden rounded-lg border border-[#dce3ec] bg-white">
          <iframe
            v-if="htmlFrame.html"
            :srcdoc="htmlFrame.html"
            class="h-full w-full border-0"
            sandbox="allow-scripts"
            title="概念动画"
          ></iframe>
        </div>
        <div v-if="htmlFrame.narration" class="rounded-lg border border-[#bfdbfe] bg-[#f5f9ff] px-4 py-3 text-sm leading-6 text-[#1e3a8a]">
          <span class="font-semibold">讲解：</span>{{ htmlFrame.narration }}
        </div>
      </div>
      <div v-else class="py-8 text-center text-sm text-[#64748b]">暂无动画内容</div>
    </div>

    <!-- RESULT_COMPARE 工作流：图文对比 -->
    <div v-else-if="current.workflow === 'RESULT_COMPARE'" class="p-5">
      <div class="mb-4 text-sm font-semibold text-[#172033]">{{ current.title }}</div>
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="frame in compareFrames" :key="frame.order" class="rounded-lg border p-4" :class="frameClass(frame.type)">
          <div class="mb-2 text-xs font-semibold uppercase tracking-wide">{{ frame.label }}</div>
          <pre class="markdown-code-block m-0 max-h-64 overflow-auto text-sm leading-6"><code class="hljs" v-html="highlightText(frame.content)"></code></pre>
        </div>
      </div>
      <div v-if="current.explanation" class="mt-4 rounded-lg border border-[#fecaca] bg-[#fff7f7] px-4 py-3 text-sm leading-6 text-[#b91c1c]">
        <span class="font-semibold">分析：</span>{{ current.explanation }}
      </div>
    </div>

    <!-- GENERIC_HIGHLIGHT 工作流：通用高亮 -->
    <div v-else class="p-5">
      <div class="mb-3 text-sm font-semibold text-[#172033]">{{ current.title }}</div>
      <div v-if="sourceLines.length" class="overflow-hidden rounded-lg border border-[#dce3ec] bg-[#fbfcfe] font-mono text-[13px] leading-7">
        <div
          v-for="(line, index) in sourceLines"
          :key="`generic-${index}`"
          class="grid grid-cols-[36px_1fr] gap-2 border-l-[3px] px-2"
          :class="lineClass(index + 1)"
        >
          <span class="select-none text-right text-[#9aa5b5]">{{ index + 1 }}</span>
          <code class="whitespace-pre-wrap text-[#1f2937]">{{ line || ' ' }}</code>
        </div>
      </div>
      <div v-if="current.explanation" class="mt-4 rounded-lg border border-[#fecaca] bg-[#fff7f7] px-4 py-3 text-sm leading-6 text-[#b91c1c]">
        {{ current.explanation }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/common'
import LucideIcon from '@/components/LucideIcon.vue'
import PythonTutorRenderer from '@/components/grading/PythonTutorRenderer.vue'

function highlightText(value) {
  const source = String(value ?? '')
  if (!source) return ''
  try {
    return hljs.highlightAuto(source).value
  } catch {
    return source
  }
}

const props = defineProps({
  demonstrations: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false }
})

const activeIndex = ref(0)
const stepIndex = ref(0)
const playing = ref(false)
let timer = null

const items = computed(() => props.demonstrations || [])
const current = computed(() => items.value[activeIndex.value] || { steps: [], sourceCode: '', correctedCode: '', frames: [], workflow: 'GENERIC_HIGHLIGHT' })
const steps = computed(() => current.value.frames || [])
const activeStep = computed(() => steps.value[stepIndex.value] || { order: 0, variables: {}, memory: [], explanation: '', line: 0, error: false })
const sourceLines = computed(() => String(current.value.sourceCode || '').split('\n'))
const htmlFrame = computed(() => {
  if (current.value.workflow !== 'HTML_ANIMATION') return null
  const frames = current.value.frames || []
  return frames[0] || null
})
const compareFrames = computed(() => {
  if (current.value.workflow !== 'RESULT_COMPARE') return []
  return current.value.frames || []
})

function lineClass(lineNumber) {
  const isErrorLine = lineNumber === current.value.errorLine
  const isHighlighted = lineNumber >= current.value.highlightStartLine && lineNumber <= current.value.highlightEndLine
  const isActive = lineNumber === activeStep.value.line
  if (isErrorLine || isActive) return 'border-l-[#ef4444] bg-[#fff1f2]'
  if (isHighlighted) return 'border-l-[var(--app-primary)] bg-[var(--app-primary-soft)]'
  return 'border-l-transparent'
}

function frameClass(type) {
  switch (type) {
    case 'expected': return 'border-[#bbdfc5] bg-[#f3fbf5]'
    case 'actual': return 'border-[#fecaca] bg-[#fff7f7]'
    case 'analysis': return 'border-[#bfdbfe] bg-[#f5f9ff]'
    default: return 'border-[#dce3ec] bg-[#fbfcfe]'
  }
}

watch(activeIndex, () => reset())
watch(items, () => {
  if (activeIndex.value >= items.value.length) activeIndex.value = 0
  reset()
})

function stop() {
  playing.value = false
  if (timer) window.clearInterval(timer)
  timer = null
}
function goTo(index) { stepIndex.value = Math.max(0, Math.min(index, steps.value.length - 1)); stop() }
function previous() { goTo(stepIndex.value - 1) }
function next() { goTo(stepIndex.value + 1) }
function reset() { stop(); stepIndex.value = 0 }
function togglePlay() {
  if (playing.value) return stop()
  if (stepIndex.value >= steps.value.length - 1) stepIndex.value = 0
  playing.value = true
  timer = window.setInterval(() => {
    if (stepIndex.value >= steps.value.length - 1) return stop()
    stepIndex.value += 1
  }, 900)
}

onBeforeUnmount(stop)
</script>
