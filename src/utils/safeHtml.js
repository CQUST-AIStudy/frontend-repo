import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true
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

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(String(html ?? ''))
}

export function renderSafeMarkdown(content) {
  const text = String(content ?? '')
  if (!text) return ''
  return sanitizeHtml(markdown.render(text))
}
