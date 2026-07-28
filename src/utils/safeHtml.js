import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import protobuf from 'highlight.js/lib/languages/protobuf'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import xml from 'highlight.js/lib/languages/xml'
import MarkdownIt from 'markdown-it'
import { renderMarkdownWithMath } from './markdownMath.mjs'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('css', css)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('protobuf', protobuf)
hljs.registerLanguage('python', python)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('xml', xml)
hljs.registerAliases(['proto', 'pb'], { languageName: 'protobuf' })

const markdown = new MarkdownIt({
  // PTA 题面会混用 Markdown 与 <br>/<img> 等 HTML。输出仍会在
  // renderSafeMarkdown 中经过 DOMPurify 清洗，避免直接信任源 HTML。
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: highlightMarkdownCode
})

// PTA 图片 CDN 会拒绝来自非 PTA 站点的 Referer，但允许无 Referer 请求。
// 在 DOMPurify 完成清洗后统一加到 Markdown 图片和源 HTML 图片上。
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.nodeName === 'IMG') {
    node.setAttribute('referrerpolicy', 'no-referrer')
    node.setAttribute('loading', 'lazy')
    node.setAttribute('decoding', 'async')
  }
})

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char])
}

function normalizeLanguageName(language) {
  const value = String(language || '').trim().toLowerCase()
  if (!value) return ''
  const primary = value.split(/\s+/)[0]
  const aliases = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    golang: 'go',
    proto3: 'protobuf'
  }
  return aliases[primary] || primary
}

function highlightMarkdownCode(code, language) {
  const normalizedLanguage = normalizeLanguageName(language)
  const highlighted = highlightCode(code, normalizedLanguage)
  const languageClass = normalizedLanguage ? ` language-${escapeHtml(normalizedLanguage)}` : ''
  return `<pre class="markdown-code-block"><code class="hljs${languageClass}">${highlighted}</code></pre>`
}

function highlightCode(code, language) {
  const source = String(code ?? '')
  if (!source) return ''
  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(source, { language, ignoreIllegals: true }).value
    }
    return hljs.highlightAuto(source).value
  } catch {
    return escapeHtml(source)
  }
}

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(String(html ?? ''))
}

export function renderSafeMarkdown(content) {
  const text = String(content ?? '')
  if (!text) return ''
  return sanitizeHtml(renderMarkdownWithMath(text, (source) => markdown.render(source)))
}
