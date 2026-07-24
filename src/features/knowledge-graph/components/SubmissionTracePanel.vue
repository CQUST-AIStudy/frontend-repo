<script setup>
import { computed, ref, watch } from 'vue'
import hljs from 'highlight.js/lib/common'
import LucideIcon from '@/components/LucideIcon.vue'

const props = defineProps({
  // 提交记录列表（已按时间倒序传入更佳，内部再排）
  submissions: { type: Array, default: () => [] },
  // 加载状态
  loading: { type: Boolean, default: false },
  // 错误信息
  error: { type: String, default: '' },
  // 当前选中的提交（来自 3D 卫星点击）
  selectedSubmission: { type: Object, default: null }
})

const emit = defineEmits(['select-submission'])

const expandedId = ref(null)

// 按提交时间倒序
const sortedSubmissions = computed(() => {
  const arr = [...(props.submissions || [])]
  return arr.sort((a, b) => {
    const ta = new Date(a.submitTime || a.submittedAt || a.date || 0).getTime()
    const tb = new Date(b.submitTime || b.submittedAt || b.date || 0).getTime()
    return tb - ta
  })
})

function statusMeta(sub) {
  const status = String(sub.status || sub.judgeStatus || '').toLowerCase()
  const score = Number(sub.score)
  if (status.includes('ac') || status.includes('accept') || status.includes('completed') || status.includes('graded')) {
    return { label: 'AC', color: '#22c55e', bg: '#dcfce7' }
  }
  if (status.includes('ce') || status.includes('compile') || status.includes('error')) {
    return { label: 'CE', color: '#ef4444', bg: '#fee2e2' }
  }
  if (status.includes('wa') || status.includes('wrong') || status.includes('reject')) {
    return { label: 'WA', color: '#f59e0b', bg: '#fef3c7' }
  }
  if (!Number.isNaN(score) && score >= 70) return { label: '高分', color: '#22c55e', bg: '#dcfce7' }
  if (!Number.isNaN(score) && score >= 40) return { label: '中分', color: '#f59e0b', bg: '#fef3c7' }
  if (status) return { label: sub.status, color: '#64748b', bg: '#f1f5f9' }
  return { label: '已提交', color: '#64748b', bg: '#f1f5f9' }
}

function formatTime(sub) {
  const t = sub.submitTime || sub.submittedAt || sub.date
  if (!t) return '未知时间'
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return String(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function detectLang(code) {
  const c = String(code || '')
  if (/#include\s*</.test(c)) return 'cpp'
  if (/import\s+java\./.test(c)) return 'java'
  if (/^\s*def\s+/m.test(c) || /print\(/.test(c)) return 'python'
  return 'cpp'
}

const expandedCode = computed(() => {
  const sub = sortedSubmissions.value.find(s => (s.id || s._idx) === expandedId.value)
    || props.selectedSubmission
  return sub
})

const highlightedCode = computed(() => {
  const sub = expandedCode.value
  const code = sub?.code || ''
  if (!code) return ''
  const lang = sub.codeLang || detectLang(code)
  try {
    if (lang && lang !== 'text' && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  } catch {
    return code.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]))
  }
})

function toggleExpand(sub) {
  const key = sub.id || sub._idx
  expandedId.value = expandedId.value === key ? null : key
  emit('select-submission', sub)
}

// 外部选中提交变化时同步展开
watch(() => props.selectedSubmission, (sub) => {
  if (sub) {
    expandedId.value = sub.id || sub._idx
  }
})
</script>

<template>
  <section class="submission-trace" aria-label="我的提交追溯">
    <div class="trace-title">
      <LucideIcon name="history" :size="15" />
      我的提交追溯
    </div>

    <div v-if="loading" class="trace-state">
      <LucideIcon name="loader" :size="16" />
      正在加载提交记录…
    </div>

    <div v-else-if="error" class="trace-state error">
      <LucideIcon name="triangle-alert" :size="16" />
      {{ error }}
    </div>

    <ui-empty
      v-else-if="sortedSubmissions.length === 0"
      description="该知识点暂无关联提交记录"
      class="mini-empty"
    />

    <ol v-else class="trace-timeline">
      <li
        v-for="(sub, idx) in sortedSubmissions"
        :key="sub.id || sub._idx || idx"
        :class="['trace-item', { active: expandedId === (sub.id || sub._idx) }]"
      >
        <button type="button" class="trace-head" @click="toggleExpand(sub)">
          <span class="trace-dot" :style="{ backgroundColor: statusMeta(sub).color }"></span>
          <span class="trace-rank">v{{ sortedSubmissions.length - idx }}</span>
          <span class="trace-time">{{ formatTime(sub) }}</span>
          <span
            class="trace-status"
            :style="{ color: statusMeta(sub).color, backgroundColor: statusMeta(sub).bg }"
          >
            {{ statusMeta(sub).label }}
          </span>
          <span v-if="sub.score != null" class="trace-score">得分 {{ sub.score }}</span>
        </button>

        <div v-if="expandedId === (sub.id || sub._idx)" class="trace-body">
          <dl class="trace-meta">
            <div v-if="sub.experimentName">
              <dt>实验</dt><dd>{{ sub.experimentName }}</dd>
            </div>
            <div v-if="sub.plagiarismRate != null">
              <dt>查重率</dt><dd>{{ sub.plagiarismRate }}%</dd>
            </div>
            <div v-if="sub.runtimeMs != null">
              <dt>运行时</dt><dd>{{ sub.runtimeMs }} ms</dd>
            </div>
            <div v-if="sub.memoryKb != null">
              <dt>内存</dt><dd>{{ sub.memoryKb }} KB</dd>
            </div>
          </dl>

          <p v-if="sub.aiRemarks || sub.aiFeedback" class="trace-ai">
            <LucideIcon name="sparkles" :size="13" />
            {{ sub.aiRemarks || sub.aiFeedback }}
          </p>

          <pre v-if="sub.code" class="trace-code"><code class="hljs" v-html="highlightedCode"></code></pre>
          <p v-else class="trace-no-code">该版本未保存代码内容</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.submission-trace {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trace-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 850;
}

.trace-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
}

.trace-state.error {
  background: #fef2f2;
  color: #b91c1c;
}

.mini-empty {
  min-height: 80px;
}

.trace-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.trace-item {
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.trace-item.active {
  border-color: #1270d8;
  box-shadow: 0 0 0 1px rgba(18, 112, 216, 0.15);
}

.trace-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.trace-dot {
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.trace-rank {
  flex-shrink: 0;
  min-width: 28px;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.trace-time {
  flex: 1;
  min-width: 0;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.trace-status {
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.trace-score {
  flex-shrink: 0;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
}

.trace-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 10px 12px;
  border-top: 1px dashed #edf2f7;
}

.trace-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 8px 0 0;
}

.trace-meta div {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.trace-meta dt {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
}

.trace-meta dd {
  margin: 0;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.trace-ai {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  padding: 8px 10px;
  border-radius: 6px;
  background: #fbf1eb;
  color: #8f4f31;
  font-size: 12px;
  line-height: 1.6;
}

.trace-code {
  max-height: 320px;
  margin: 0;
  overflow: auto;
  padding: 12px;
  border-radius: 8px;
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  color: #24292f;
}

.trace-code code {
  display: block;
  background: transparent;
  color: inherit;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre;
  font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
}

.trace-no-code {
  margin: 0;
  padding: 10px;
  border-radius: 6px;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 12px;
}
</style>
