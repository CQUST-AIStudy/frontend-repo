<template>
  <div class="code-viewer" :style="{ maxHeight: maxHeight || 'none' }">
    <div class="code-viewer__toolbar">
      <span class="code-viewer__lang">{{ langLabel }}</span>
      <button class="code-viewer__copy" @click="copyCode" :title="copied ? '已复制' : '复制代码'">
        <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34a853" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{{ copied ? '已复制' : '复制' }}</span>
      </button>
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
})

const copied = ref(false)

const langLabel = computed(() => {
  const labels = { c: 'C', cpp: 'C++', java: 'Java', python: 'Python', javascript: 'JavaScript', sql: 'SQL', json: 'JSON', xml: 'XML', css: 'CSS', bash: 'Bash' }
  return labels[props.language] || props.language || 'code'
})

// ── 语法高亮色（内联注入，不依赖外部 CSS） ──
const COLOR = {
  keyword:  '#ff79c6',  // int return if for while
  type:     '#8be9fd',  // 类型 / 内置函数
  string:   '#f1fa8c',  // "hello"
  number:   '#bd93f9',  // 123
  func:     '#50fa7b',  // 函数名
  meta:     '#ffb86c',  // #include
  comment:  '#6272a4',  // //
  plain:    '#e8e8e8',  // 默认
}

function hljsToInline(html) {
  const map = {
    keyword:   COLOR.keyword,
    'selector-tag': COLOR.keyword,
    tag:       COLOR.keyword,
    'built_in': COLOR.type,
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
    deletion:  '#ff5555',
  }
  // Match <span class="hljs-xxx..."> and inject style
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
    // fallback
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
  background: #1e1e2e;
  border-radius: 10px;
  overflow: hidden;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
  border: 1px solid #2d2d3f;
}

.code-viewer__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #252537;
  border-bottom: 1px solid #2d2d3f;
}

.code-viewer__lang {
  font-size: 11px;
  color: #8b8ba0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.code-viewer__copy {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid #3d3d55;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 11px;
  color: #8b8ba0;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.code-viewer__copy:hover {
  background: #353550;
  color: #c0c0d0;
  border-color: #505070;
}

.code-viewer__body {
  overflow: auto;
  max-height: v-bind(maxHeight);
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
  background: rgba(255,255,255,0.03);
}

.code-viewer__gutter {
  user-select: none;
  text-align: right;
  padding: 0 12px 0 8px;
  color: #858585;
  font-size: 12px;
  min-width: 44px;
  width: 1%;
  white-space: nowrap;
  vertical-align: top;
  border-right: 1px solid #2d2d3f;
  background: #1a1a2a;
}
.code-viewer__gutter::before {
  content: attr(data-line);
}

.code-viewer__content {
  padding: 0 14px;
  white-space: pre;
  vertical-align: top;
  width: 99%;
  color: #e8e8e8;
}

.code-viewer__empty {
  padding: 24px;
  text-align: center;
  color: #5f5f78;
  font-size: 13px;
}
</style>

