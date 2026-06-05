import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'
import protobuf from 'highlight.js/lib/languages/protobuf'
import MarkdownIt from 'markdown-it'

hljs.registerLanguage('protobuf', protobuf)
hljs.registerAliases(['proto', 'pb'], { languageName: 'protobuf' })

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: highlightMarkdownCode
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
  return sanitizeHtml(markdown.render(text))
}
