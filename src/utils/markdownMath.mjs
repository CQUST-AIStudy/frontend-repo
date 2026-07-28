import katex from 'katex'

const MATH_TOKEN_PREFIX = '\uE000markdown-math-'
const MATH_TOKEN_SUFFIX = '\uE001'

export function renderMarkdownWithMath(content, renderMarkdown) {
  if (typeof renderMarkdown !== 'function') {
    throw new TypeError('renderMarkdown must be a function')
  }

  const { source, formulas } = tokenizeMath(String(content ?? ''))
  const html = String(renderMarkdown(source) ?? '')

  return formulas.reduce((output, formula) => {
    const renderedFormula = renderFormula(formula.expression, formula.displayMode)
    return output.split(formula.token).join(renderedFormula)
  }, html)
}

function tokenizeMath(text) {
  const formulas = []
  let source = ''
  let index = 0

  while (index < text.length) {
    const fencedCode = readFencedCode(text, index)
    if (fencedCode) {
      source += text.slice(index, fencedCode.end)
      index = fencedCode.end
      continue
    }

    const inlineCode = readInlineCode(text, index)
    if (inlineCode) {
      source += text.slice(index, inlineCode.end)
      index = inlineCode.end
      continue
    }

    const formula = readFormula(text, index)
    if (formula) {
      const token = `${MATH_TOKEN_PREFIX}${formulas.length}${MATH_TOKEN_SUFFIX}`
      formulas.push({ ...formula, token })
      source += token
      index = formula.end
      continue
    }

    if (text[index] === '\\' && text[index + 1] === '$') {
      source += '\\$'
      index += 2
      continue
    }

    source += text[index]
    index += 1
  }

  return { source, formulas }
}

function readFencedCode(text, index) {
  if (index > 0 && text[index - 1] !== '\n') return null

  const lineEnd = findLineEnd(text, index)
  const line = text.slice(index, lineEnd)
  const match = line.match(/^[ ]{0,3}(`{3,}|~{3,})/)
  if (!match) return null

  const marker = match[1][0]
  const markerLength = match[1].length
  let cursor = lineEnd < text.length ? lineEnd + 1 : lineEnd
  const closingPattern = new RegExp(`^[ ]{0,3}${marker}{${markerLength},}[ \\t]*$`)

  while (cursor < text.length) {
    const closingLineEnd = findLineEnd(text, cursor)
    const closingLine = text.slice(cursor, closingLineEnd)
    if (closingPattern.test(closingLine)) {
      return {
        end: closingLineEnd < text.length ? closingLineEnd + 1 : closingLineEnd
      }
    }
    cursor = closingLineEnd < text.length ? closingLineEnd + 1 : closingLineEnd
  }

  return { end: text.length }
}

function readInlineCode(text, index) {
  if (text[index] !== '`') return null

  let markerLength = 1
  while (text[index + markerLength] === '`') markerLength += 1

  const marker = '`'.repeat(markerLength)
  const closingIndex = text.indexOf(marker, index + markerLength)
  return { end: closingIndex === -1 ? text.length : closingIndex + markerLength }
}

function readFormula(text, index) {
  if (text.startsWith('$$', index) && !isEscaped(text, index)) {
    const closingIndex = findUnescapedDelimiter(text, index + 2, '$$')
    if (closingIndex !== -1) {
      return {
        expression: text.slice(index + 2, closingIndex),
        displayMode: true,
        end: closingIndex + 2
      }
    }
  }

  if (text.startsWith('\\[', index) && !isEscaped(text, index)) {
    const closingIndex = findUnescapedDelimiter(text, index + 2, '\\]')
    if (closingIndex !== -1) {
      return {
        expression: text.slice(index + 2, closingIndex),
        displayMode: true,
        end: closingIndex + 2
      }
    }
  }

  if (text[index] === '$' && !text.startsWith('$$', index) && !isEscaped(text, index)) {
    const closingIndex = findUnescapedDelimiter(text, index + 1, '$')
    if (closingIndex !== -1 && !text.slice(index + 1, closingIndex).includes('\n')) {
      return {
        expression: text.slice(index + 1, closingIndex),
        displayMode: false,
        end: closingIndex + 1
      }
    }
  }

  if (text.startsWith('\\(', index) && !isEscaped(text, index)) {
    const closingIndex = findUnescapedDelimiter(text, index + 2, '\\)')
    if (closingIndex !== -1) {
      return {
        expression: text.slice(index + 2, closingIndex),
        displayMode: false,
        end: closingIndex + 2
      }
    }
  }

  return null
}

function findUnescapedDelimiter(text, start, delimiter) {
  let index = start

  while (index < text.length) {
    const delimiterIndex = text.indexOf(delimiter, index)
    if (delimiterIndex === -1) return -1
    if (!isEscaped(text, delimiterIndex)) return delimiterIndex
    index = delimiterIndex + delimiter.length
  }

  return -1
}

function isEscaped(text, index) {
  let slashCount = 0
  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) {
    slashCount += 1
  }
  return slashCount % 2 === 1
}

function findLineEnd(text, start) {
  const lineEnd = text.indexOf('\n', start)
  return lineEnd === -1 ? text.length : lineEnd
}

function renderFormula(expression, displayMode) {
  let html
  try {
    html = katex.renderToString(expression.trim(), {
      displayMode,
      output: 'htmlAndMathml',
      throwOnError: false,
      trust: false
    })
  } catch {
    html = `<span class="katex-error">${escapeHtml(expression)}</span>`
  }

  const className = displayMode ? 'markdown-math-block' : 'markdown-math-inline'
  return `<span class="${className}">${html}</span>`
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return entities[character]
  })
}
