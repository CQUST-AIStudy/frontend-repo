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

    <!-- 统一步骤播放器（图码式）：代码行 ↔ 画面 ↔ 字幕 三轨同步 -->
    <div class="grid gap-0" :class="hasCode ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)]' : 'grid-cols-1'">
      <!-- 左：代码面板，随当前步高亮 -->
      <div v-if="hasCode" class="border-b border-[#e8edf4] p-5 lg:border-b-0 lg:border-r">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-semibold text-[#172033]">代码</span>
          <span class="text-xs text-[#dc2626]">{{ current.title }}</span>
        </div>
        <div class="overflow-hidden rounded-lg border border-[#dce3ec] bg-[#fbfcfe] font-mono text-[13px] leading-7">
          <div
            v-for="(line, index) in sourceLines"
            :key="`line-${index}`"
            class="grid grid-cols-[36px_1fr_auto] gap-2 border-l-[3px] px-2 transition-colors"
            :class="lineClass(index + 1)"
          >
            <span class="select-none text-right text-[#9aa5b5]">{{ index + 1 }}</span>
            <code class="whitespace-pre-wrap text-[#1f2937]">{{ line || ' ' }}</code>
            <span v-if="index + 1 === current.errorLine" class="font-sans text-xs font-semibold text-[#dc2626]">错误行</span>
          </div>
        </div>
        <div v-if="current.correctedCode" class="mt-4 rounded-lg border border-[#bbdfc5] bg-[#f3fbf5] p-3">
          <div class="mb-1 text-xs font-semibold text-[#15803d]">要点 / 正确写法</div>
          <pre class="markdown-code-block m-0 overflow-x-auto whitespace-pre-wrap text-[13px] leading-6"><code class="hljs" v-html="highlightText(current.correctedCode)"></code></pre>
        </div>
      </div>

      <!-- 右：画布 + 旁白字幕 + 变量 + 步骤控件 -->
      <div class="p-5">
        <div class="mb-3 flex items-center justify-between gap-3">
          <span class="text-sm font-semibold text-[#172033]">{{ current.title }} <span v-if="readonly" class="font-normal text-[#8b96a8]">（只读）</span></span>
          <span v-if="steps.length" class="text-xs text-[#64748b]">第 {{ activeStep.order }} 步 / 共 {{ steps.length }} 步</span>
        </div>

        <template v-if="steps.length">
          <!-- 画布：主角 -->
          <div class="mb-3">
            <PythonTutorRenderer v-if="activeStep.state" :state="activeStep.state" :height="300" />
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

          <!-- 旁白字幕：totuma 式，居中醒目 -->
          <div class="mb-4 rounded-lg border px-4 py-3 text-center text-[15px] font-medium leading-7"
            :class="activeStep.error ? 'border-[#fecaca] bg-[#fff7f7] text-[#b91c1c]' : 'border-[#bfdbfe] bg-[#f5f9ff] text-[#1e3a8a]'">
            <LucideIcon v-if="activeStep.error" name="triangle-alert" :size="16" class="mr-1 inline align-[-3px]" />
            {{ activeStep.explanation || '—' }}
          </div>

          <!-- 变量芯片 -->
          <div v-if="hasVariables(activeStep)" class="mb-4 flex flex-wrap gap-2">
            <span v-for="(value, key) in activeStep.variables" :key="key"
              class="inline-flex items-center gap-1 rounded-lg border border-[#dce3ec] bg-white px-2.5 py-1 font-mono text-xs">
              <span class="text-[#64748b]">{{ key }}</span>
              <span class="text-[#94a3b8]">=</span>
              <span class="font-semibold text-[#172033]">{{ value }}</span>
            </span>
          </div>

          <!-- 步骤控件 -->
          <div class="mt-1 flex items-center gap-2">
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
        </template>

        <!-- 无步骤帧（如历史旧数据）时的降级展示 -->
        <div v-else class="rounded-lg border border-[#fecaca] bg-[#fff7f7] px-4 py-3 text-sm leading-6 text-[#b91c1c]">
          {{ current.explanation || '该错误演示暂无步骤动画，可在批改页重新生成。' }}
        </div>
      </div>
    </div>

    <footer class="border-t border-[#e8edf4] bg-[#fbfcfe] px-5 py-4">
      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-lg border border-[#fecaca] bg-[#fff7f7] p-3">
          <div class="mb-1 text-xs font-semibold text-[#dc2626]">为什么错</div>
          <p class="m-0 text-sm leading-6 text-[#7f1d1d]">{{ current.explanation }}</p>
        </div>
        <div v-if="current.correctedCode" class="rounded-lg border border-[#bbdfc5] bg-[#f3fbf5] p-3">
          <div class="mb-1 text-xs font-semibold text-[#15803d]">如何修正</div>
          <p class="m-0 whitespace-pre-wrap font-mono text-sm leading-6 text-[#166534]">{{ current.correctedCode }}</p>
        </div>
      </div>
    </footer>
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
const current = computed(() => items.value[activeIndex.value] || { sourceCode: '', correctedCode: '', frames: [], explanation: '' })
const steps = computed(() => current.value.frames || [])
const activeStep = computed(() => steps.value[stepIndex.value] || { order: 0, variables: {}, memory: [], explanation: '', line: 0, error: false })
const sourceLines = computed(() => String(current.value.sourceCode || '').split('\n'))
const hasCode = computed(() => String(current.value.sourceCode || '').trim().length > 0)

function hasVariables(step) {
  const vars = step?.variables
  return vars && typeof vars === 'object' && Object.keys(vars).length > 0
}

function lineClass(lineNumber) {
  const isErrorLine = lineNumber === current.value.errorLine
  const isActive = lineNumber === activeStep.value.line
  const isHighlighted = lineNumber >= current.value.highlightStartLine && lineNumber <= current.value.highlightEndLine
  if (isActive) return 'border-l-[var(--app-primary)] bg-[var(--app-primary-soft)]'
  if (isErrorLine) return 'border-l-[#ef4444] bg-[#fff1f2]'
  if (isHighlighted) return 'border-l-[var(--app-primary)] bg-[var(--app-primary-soft)]'
  return 'border-l-transparent'
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
  // 每步含旁白字幕，播放节奏放慢以便阅读
  timer = window.setInterval(() => {
    if (stepIndex.value >= steps.value.length - 1) return stop()
    stepIndex.value += 1
  }, 1600)
}

onBeforeUnmount(stop)
</script>
