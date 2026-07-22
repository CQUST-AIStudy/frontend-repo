<template>
  <div class="code-viewer">
    <div class="code-viewer__toolbar">
      <span class="code-viewer__lang">{{ langLabel }}</span>
      <div class="code-viewer__toolbar-right">
        <slot name="toolbar-extra"></slot>
        <button v-if="!hideCopy" class="code-viewer__copy" @click="copyCode" :title="copied ? '已复制' : '复制代码'">
          <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34a853" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{{ copied ? '已复制' : '复制' }}</span>
        </button>
      </div>
    </div>
    <div class="code-viewer__body">
      <table class="code-viewer__table">
        <tbody>
          <tr v-for="(line, idx) in lines" :key="idx" class="code-viewer__line">
            <td class="code-viewer__gutter" :data-line="idx + 1"></td>
            <td class="code-viewer__content" v-html="line"></td>
          </tr>
        </tbody>
      </table>
      <div v-if="!code" class="code-viewer__empty">（空代码）</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import hljs from 'highlight.js/lib/core'

const props = defineProps({
  code: { type: String, default: '' },
  language: { type: String, default: 'cpp' },
  maxHeight: { type: String, default: '400px' },
  hideCopy: { type: Boolean, default: false },
})

const copied = ref(false)

const langLabel = computed(() => {
  const labels = { c: 'C', cpp: 'C++', java: 'Java', python: 'Python', javascript: 'JavaScript', sql: 'SQL', json: 'JSON', xml: 'XML', css: 'CSS', bash: 'Bash' }
  return labels[props.language] || props.language || 'code'
})

// ── 浅色主题语法高亮色（GitHub Light 风格） ──
const COLOR = {
  keyword:  '#cf222e',  // int return if for while — 红色
  type:     '#8250df',  // 类型 / 类名 — 紫色
  string:   '#0a3069',  // "hello" — 深蓝
  number:   '#0550ae',  // 123 — 蓝色
  func:     '#8250df',  // 函数名 — 紫色
  meta:     '#cf222e',  // #include — 红色
  comment:  '#6e7781',  // // — 灰色
  builtin:  '#0550ae',  // 内置函数 — 蓝色
  plain:    '#24292f',  // 默认文字 — 深灰
}

function hljsToInline(html) {
  const map = {
    keyword:   COLOR.keyword,
    'selector-tag': COLOR.keyword,
    tag:       COLOR.keyword,
    'built_in': COLOR.builtin,
    type:      COLOR.type,
    class:     COLOR.type,
    name:      COLOR.type,
    string:    COLOR.string,
    symbol:    COLOR.string,
    addition:  COLOR.string,
    regexp:    COLOR.string,
    number:    COLOR.number,
    literal:   COLOR.number,
    variable:  COLOR.number,
    'template-variable': COLOR.number,
    title:     COLOR.func,
    function:  COLOR.func,
    attr:      COLOR.func,
    attribute: COLOR.func,
    'selector-attr':  COLOR.func,
    'selector-pseudo': COLOR.func,
    'selector-class': COLOR.func,
    meta:      COLOR.meta,
    doctag:    COLOR.meta,
    comment:   COLOR.comment,
    quote:     COLOR.comment,
    deletion:  '#cf222e',
  }
  return html.replace(/<span class="hljs-([a-z_-]+)(?:\s[^"]*)?"/g, (full, token) => {
    const c = map[token]
    return c ? `${full.slice(0, -1)} style="color:${c}"` : full
  })
}

const lines = computed(() => {
  if (!props.code) return []
  try {
    const lang = hljs.getLanguage(props.language) ? props.language : undefined
    const result = lang
      ? hljs.highlight(props.code, { language: lang, ignoreIllegals: true })
      : hljs.highlightAuto(props.code)
    return hljsToInline(result.value).split('\n')
  } catch {
    return props.code.split('\n').map(l =>
      l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
  }
})

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = props.code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<style scoped>
.code-viewer {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, 'SF Mono', monospace;
  font-size: 13.5px;
  line-height: 1.7;
  border: 1px solid #d0d7de;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.code-viewer__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f6f8fa;
  border-bottom: 1px solid #d0d7de;
}

.code-viewer__toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-viewer__lang {
  font-size: 11px;
  color: #57606a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.code-viewer__copy {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 11px;
  color: #57606a;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.code-viewer__copy:hover {
  background: #f3f4f6;
  color: #24292f;
  border-color: #afb8c1;
}

.code-viewer__body {
  overflow: auto;
  max-height: v-bind(maxHeight);
  min-height: 0;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  padding: 0;
}

.code-viewer__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.code-viewer__line {
  transition: background 0.1s;
}
.code-viewer__line:hover {
  background: #f6f8fa;
}

.code-viewer__gutter {
  user-select: none;
  text-align: right;
  padding: 0 12px 0 12px;
  color: #8c959f;
  font-size: 12px;
  min-width: 48px;
  width: 1%;
  white-space: nowrap;
  vertical-align: top;
  border-right: 1px solid #d0d7de;
  background: #f6f8fa;
}
.code-viewer__gutter::before {
  content: attr(data-line);
}

.code-viewer__content {
  padding: 0 16px;
  white-space: pre;
  vertical-align: top;
  width: 99%;
  color: #24292f;
}

.code-viewer__empty {
  padding: 32px;
  text-align: center;
  color: #8c959f;
  font-size: 13px;
}
</style>
