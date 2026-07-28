<template>
  <section v-if="items.length" class="overflow-hidden rounded-xl border border-[#dbe3ef] bg-white">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8edf4] px-5 py-4">
      <div>
        <div class="flex items-center gap-2">
          <LucideIcon :name="isError ? 'bug' : 'code'" :size="18" :class="isError ? 'text-[#ef4444]' : 'text-[var(--app-primary)]'" />
          <h3 class="m-0 text-base font-semibold text-[#172033]">{{ isError ? '错误演示' : '执行演示' }}</h3>
          <span v-if="isError" class="rounded bg-[#fff1f2] px-2 py-0.5 text-xs text-[#dc2626]">{{ items.length }} 处</span>
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
          <span class="text-xs" :class="isError ? 'text-[#dc2626]' : 'text-[var(--app-primary)]'">{{ current.title }}</span>
        </div>
        <div class="overflow-hidden rounded-lg border border-[#dce3ec] bg-[#fbfcfe] font-mono text-[13px] leading-7">
          <div
            v-for="(line, index) in sourceLines"
            :key="`line-${index}`"
            class="relative grid grid-cols-[36px_1fr_auto] gap-2 border-l-[3px] px-2 transition-colors"
            :class="lineClass(index + 1)"
          >
            <span v-if="!isError && index + 1 === activeStep.line" class="pointer-events-none absolute left-0.5 top-1/2 -translate-y-1/2 text-[10px] leading-none text-[var(--app-primary)]">▶</span>
            <span class="select-none text-right text-[#9aa5b5]">{{ index + 1 }}</span>
            <code class="whitespace-pre-wrap text-[#1f2937]">{{ line || ' ' }}</code>
            <span v-if="isError && index + 1 === current.errorLine" class="font-sans text-xs font-semibold text-[#dc2626]">错误行</span>
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
          <!-- 画布：结构可视化（标量执行演示直接用下方变量盒，避免重复） -->
          <div v-if="showCanvas" class="mb-3">
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

          <!-- 调用栈（执行演示）：由源码函数范围 + 行号序列推导 -->
          <div v-if="!isError && callStack.length" class="mb-4 rounded-lg border border-[#dce3ec] bg-[#fbfcfe] p-3">
            <div class="mb-2 font-mono text-[11px] uppercase tracking-wider text-[#94a3b8]">调用栈 · call stack</div>
            <div class="flex flex-col gap-1.5">
              <div v-for="(fn, i) in callStack" :key="fn + '#' + i"
                class="flex items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors"
                :class="i === callStack.length - 1 ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] font-semibold text-[var(--app-primary)]' : 'border-[#e2e8f0] bg-white text-[#475569]'">
                <span class="text-[#94a3b8]">#{{ i }}</span><span>{{ fn }}</span>
              </div>
            </div>
          </div>

          <!-- 变量：执行演示用值盒（变化时脉冲）；错误演示保持芯片 -->
          <div v-if="!isError && hasVariables(activeStep)" class="mb-4 flex flex-wrap gap-3">
            <div v-for="(value, key) in activeStep.variables" :key="key + '=' + value" class="text-center">
              <div class="mb-1 font-mono text-[11px] text-[#64748b]">{{ key }}</div>
              <div class="code-demo-cell flex h-11 min-w-[52px] items-center justify-center rounded-lg border-[1.5px] px-3 font-mono text-lg font-bold transition-colors"
                :class="changedKeys.has(key) ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]' : 'border-[#cbd5e1] bg-white text-[#334155]'">{{ value }}</div>
            </div>
          </div>
          <div v-else-if="hasVariables(activeStep)" class="mb-4 flex flex-wrap gap-2">
            <span v-for="(value, key) in activeStep.variables" :key="key"
              class="inline-flex items-center gap-1 rounded-lg border border-[#dce3ec] bg-white px-2.5 py-1 font-mono text-xs">
              <span class="text-[#64748b]">{{ key }}</span>
              <span class="text-[#94a3b8]">=</span>
              <span class="font-semibold text-[#172033]">{{ value }}</span>
            </span>
          </div>

          <!-- 输出控制台（执行演示） -->
          <div v-if="!isError && stdoutText" class="mb-4 rounded-lg bg-[#2b2620] px-4 py-3">
            <div class="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-[#b6a789]">stdout</div>
            <div class="font-mono text-[13px] leading-relaxed text-[#f3ead9]">
              <div v-for="(l, i) in stdoutLines" :key="i + ':' + l" class="code-demo-rise whitespace-pre-wrap break-all">{{ l }}</div>
            </div>
          </div>

          <!-- 步骤控件 -->
          <div class="mt-1 flex items-center gap-2">
            <UiButton :disabled="stepIndex === 0" @click="previous" class="h-9 rounded-lg border border-[#d7dfeb] bg-white px-4 text-sm text-[#334155] disabled:opacity-40">上一步</UiButton>
            <UiButton type="primary" @click="togglePlay" class="inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm">
              <LucideIcon :name="playing ? 'pause' : 'play'" :size="18" />{{ playing ? '暂停' : '播放' }}
            </UiButton>
            <UiButton :disabled="stepIndex >= steps.length - 1" @click="next" class="h-9 rounded-lg border border-[#d7dfeb] bg-white px-4 text-sm text-[#334155] disabled:opacity-40">下一步</UiButton>
            <div v-if="!isError" class="ml-2 inline-flex overflow-hidden rounded-lg border border-[#d7dfeb]">
              <button v-for="s in speedOptions" :key="s.ms" type="button" @click="setSpeed(s.ms)" class="px-2.5 py-2 font-mono text-xs transition-colors" :class="playSpeed === s.ms ? 'bg-[var(--app-primary-soft)] font-bold text-[var(--app-primary)]' : 'bg-white text-[#64748b]'">{{ s.label }}</button>
            </div>
            <UiButton @click="reset" class="ml-auto h-9 rounded-lg border-none bg-[#f1f5f9] px-3 text-sm text-[#475569]" title="重置演示"><LucideIcon name="rotate-ccw" :size="16" /></UiButton>
          </div>

          <!-- 进度：执行演示用带「输出」标记的轨道；错误演示保持圆点 -->
          <div v-if="!isError" class="mt-4">
            <div class="relative h-2 cursor-pointer rounded-full bg-[#e8ddca]" @click="seek">
              <div class="absolute inset-y-0 left-0 rounded-full bg-[var(--app-primary)] transition-[width] duration-200" :style="{ width: fillPercent + '%' }"></div>
              <div v-for="m in outputMarkers" :key="m" class="absolute top-1/2 h-3.5 w-[3px] -translate-y-1/2 rounded-sm bg-[#4f7a52]" :style="{ left: markerLeft(m) }" title="输出"></div>
            </div>
          </div>
          <div v-else class="mt-4 flex items-center gap-1.5">
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
        <div class="rounded-lg border p-3" :class="isError ? 'border-[#fecaca] bg-[#fff7f7]' : 'border-[#dbe3ef] bg-white'">
          <div class="mb-1 text-xs font-semibold" :class="isError ? 'text-[#dc2626]' : 'text-[var(--app-primary)]'">{{ isError ? '为什么错' : '说明' }}</div>
          <p class="m-0 text-sm leading-6" :class="isError ? 'text-[#7f1d1d]' : 'text-[#334155]'">{{ current.explanation }}</p>
        </div>
        <div v-if="current.correctedCode" class="rounded-lg border border-[#bbdfc5] bg-[#f3fbf5] p-3">
          <div class="mb-1 text-xs font-semibold text-[#15803d]">{{ isError ? '如何修正' : '要点' }}</div>
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
  readonly: { type: Boolean, default: false },
  variant: { type: String, default: 'error' }
})

const isError = computed(() => props.variant !== 'plain')

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

// ---- 执行演示（plain 变体）增强 ----
const structureKind = computed(() => activeStep.value.state?.dataStructure || '')
const hasStructure = computed(() => !!structureKind.value && structureKind.value !== 'code')
const showCanvas = computed(() => {
  const hasMemory = Array.isArray(activeStep.value.memory) && activeStep.value.memory.length > 0
  if (isError.value) return !!activeStep.value.state || hasMemory
  return hasStructure.value || hasMemory
})

// 从源码解析函数定义行范围（1-based），用于推导调用栈
const functionRanges = computed(() => {
  const lines = String(current.value.sourceCode || '').split('\n')
  const ranges = []
  let i = 0
  while (i < lines.length) {
    const raw = lines[i]
    const m = raw.match(/^[A-Za-z_][\w\s*]*\s+([A-Za-z_]\w*)\s*\([^;{}]*\)\s*\{?\s*$/)
    if (m && !/\b(if|for|while|switch|return|else|sizeof)\b/.test(raw)) {
      let j = i
      let hasBrace = raw.includes('{')
      while (!hasBrace && j + 1 < lines.length) {
        j += 1
        if (lines[j].includes('{')) hasBrace = true
        else if (lines[j].trim() !== '') break
      }
      if (hasBrace) {
        let depth = 0
        let started = false
        let k = j
        for (; k < lines.length; k += 1) {
          for (const ch of lines[k]) {
            if (ch === '{') { depth += 1; started = true }
            else if (ch === '}') depth -= 1
          }
          if (started && depth <= 0) break
        }
        ranges.push({ name: m[1], start: i + 1, end: k + 1 })
        i = k + 1
        continue
      }
    }
    i += 1
  }
  return ranges
})

function functionAt(line) {
  const ranges = functionRanges.value
  for (let i = ranges.length - 1; i >= 0; i -= 1) {
    if (line >= ranges[i].start && line <= ranges[i].end) return ranges[i].name
  }
  return null
}

// 逐帧推导调用栈（非递归浅调用准确；递归时显示当前层）
const frameStacks = computed(() => {
  const result = []
  let stack = []
  for (const f of steps.value) {
    const fn = functionAt(f.line)
    if (fn) {
      const at = stack.lastIndexOf(fn)
      stack = at === -1 ? [...stack, fn] : stack.slice(0, at + 1)
    }
    result.push([...stack])
  }
  return result
})
const callStack = computed(() => frameStacks.value[stepIndex.value] || [])

const stdoutText = computed(() => String(activeStep.value.stdout || ''))
const stdoutLines = computed(() => {
  const t = stdoutText.value.replace(/\n+$/, '')
  return t ? t.split('\n') : []
})

const changedKeys = computed(() => {
  const cur = activeStep.value.variables || {}
  const prev = (steps.value[stepIndex.value - 1] || {}).variables || {}
  const set = new Set()
  for (const k of Object.keys(cur)) {
    if (String(cur[k]) !== String(prev[k])) set.add(k)
  }
  return set
})

const outputMarkers = computed(() => {
  const arr = steps.value
  const marks = []
  for (let i = 1; i < arr.length; i += 1) {
    if (String(arr[i].stdout || '').length > String(arr[i - 1].stdout || '').length) marks.push(i)
  }
  return marks
})
const fillPercent = computed(() => {
  const n = steps.value.length
  return n <= 1 ? 0 : (stepIndex.value / (n - 1)) * 100
})
function markerLeft(i) {
  const n = steps.value.length
  return (n <= 1 ? 0 : (i / (n - 1)) * 100) + '%'
}
function seek(evt) {
  const rc = evt.currentTarget.getBoundingClientRect()
  const ratio = (evt.clientX - rc.left) / rc.width
  goTo(Math.round(ratio * (steps.value.length - 1)))
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
const playSpeed = ref(900)
const speedOptions = [{ ms: 1400, label: '0.7×' }, { ms: 900, label: '1×' }, { ms: 450, label: '2×' }]
function advance() {
  if (stepIndex.value >= steps.value.length - 1) return stop()
  stepIndex.value += 1
}
function setSpeed(ms) {
  playSpeed.value = ms
  if (playing.value) {
    if (timer) window.clearInterval(timer)
    timer = window.setInterval(advance, ms)
  }
}
function togglePlay() {
  if (playing.value) return stop()
  if (stepIndex.value >= steps.value.length - 1) stepIndex.value = 0
  playing.value = true
  timer = window.setInterval(advance, playSpeed.value)
}

onBeforeUnmount(stop)
</script>

<style scoped>
@keyframes codeDemoRise {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
.code-demo-rise { animation: codeDemoRise .4s ease both; }

@keyframes codeDemoFlash {
  0% { transform: scale(1); }
  35% { transform: scale(1.14); box-shadow: 0 0 0 5px var(--app-primary-soft); }
  100% { transform: scale(1); }
}
.code-demo-cell { animation: codeDemoFlash .5s ease; }
</style>
