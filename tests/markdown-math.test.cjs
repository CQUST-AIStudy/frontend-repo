const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const mathModuleUrl = pathToFileURL(
  path.join(__dirname, '..', 'src', 'utils', 'markdownMath.mjs')
).href

test('renders inline and display LaTeX delimiters with KaTeX', async () => {
  const { renderMarkdownWithMath } = await import(mathModuleUrl)
  const source = [
    'inline $x^2$ and \\(a+b\\)',
    '',
    '$$\\frac{1}{2}$$',
    '',
    '\\[\\sum_{i=1}^{n} i\\]'
  ].join('\n')

  const html = renderMarkdownWithMath(source, value => value)

  assert.equal((html.match(/markdown-math-/g) || []).length, 4)
  assert.equal((html.match(/class="katex"/g) || []).length, 4)
})

test('does not render formulas inside inline code or fenced code', async () => {
  const { renderMarkdownWithMath } = await import(mathModuleUrl)
  const source = [
    '`$inlineCode$`',
    '',
    '```text',
    '$fencedCode$',
    '```',
    '',
    '$rendered$'
  ].join('\n')

  const html = renderMarkdownWithMath(source, value => value)

  assert.equal((html.match(/class="katex"/g) || []).length, 1)
  assert.match(html, /`\$inlineCode\$`/)
  assert.match(html, /\$fencedCode\$/)
})

test('keeps malformed formulas readable without throwing', async () => {
  const { renderMarkdownWithMath } = await import(mathModuleUrl)
  const html = renderMarkdownWithMath('$\\unsupportedCommand$', value => value)

  assert.match(html, /katex-error|unsupportedCommand/)
})
