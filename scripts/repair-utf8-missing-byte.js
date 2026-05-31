const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const root = process.cwd()
const srcRoot = path.join(root, 'src')
const dryRun = process.argv.includes('--dry-run')
const REPLACEMENT_CHAR = String.fromCharCode(0xfffd)

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
    } else if (/\.(vue|js)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

function readHeadFile(file) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  try {
    return cp.execFileSync('git', ['show', `HEAD:${rel}`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
  } catch {
    return ''
  }
}

function decodeBytes(bytes) {
  return Buffer.from(bytes).toString('utf8')
}

function isContinuation(byte) {
  return byte >= 0x80 && byte <= 0xbf
}

function readValidChar(buffer, index) {
  const b0 = buffer[index]
  if (b0 < 0x80) return [String.fromCharCode(b0), index + 1]

  let length = 0
  if (b0 >= 0xc2 && b0 <= 0xdf) length = 2
  else if (b0 >= 0xe0 && b0 <= 0xef) length = 3
  else if (b0 >= 0xf0 && b0 <= 0xf4) length = 4
  else return [REPLACEMENT_CHAR, index + 1]

  if (index + length > buffer.length) return [REPLACEMENT_CHAR, index + 1]
  for (let i = 1; i < length; i += 1) {
    if (!isContinuation(buffer[index + i])) return [REPLACEMENT_CHAR, index + 1]
  }
  const text = buffer.slice(index, index + length).toString('utf8')
  if (text.includes(REPLACEMENT_CHAR)) return [REPLACEMENT_CHAR, index + 1]
  return [text, index + length]
}

function readLookahead(buffer, index, maxChars = 8) {
  let cursor = index
  let text = ''
  while (cursor < buffer.length && text.length < maxChars) {
    const [char, next] = readValidChar(buffer, cursor)
    if (char === REPLACEMENT_CHAR) {
      break
    }
    text += char
    cursor = next
  }
  return text
}

function buildCorpus(files) {
  let corpus = ''
  for (const file of files) {
    corpus += readHeadFile(file)
    corpus += '\n'
  }
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    corpus += text.split(REPLACEMENT_CHAR).join('')
    corpus += '\n'
  }
  corpus += '请求发送失败，请稍后重试 登录已过期，请重新登录 用户名或密码不正确，请检查后重试 操作失败，请稍后重试 获取数据失败 加载失败 保存失败 生成失败 未知状态 已完成 进行中 未开始'
  return corpus
}

function buildIndexes(corpus) {
  const ngrams = new Map()
  const prefixCounts = new Map()
  for (let n = 2; n <= 6; n += 1) {
    ngrams.set(n, new Set())
  }
  for (let i = 0; i < corpus.length; i += 1) {
    const char = corpus[i]
    if (char.charCodeAt(0) > 127) {
      const bytes = Buffer.from(char)
      if (bytes.length >= 3) {
        const key = `${bytes[0]},${bytes[1]}`
        prefixCounts.set(key, (prefixCounts.get(key) || 0) + 1)
      }
    }
    for (let n = 2; n <= 6; n += 1) {
      if (i + n <= corpus.length) {
        ngrams.get(n).add(corpus.slice(i, i + n))
      }
    }
  }
  return { ngrams, prefixCounts }
}

function candidateScore(candidate, before, after, indexes, prefixKey) {
  let score = indexes.prefixCounts.get(prefixKey) || 0
  score = Math.log2(score + 1)

  for (let left = 0; left <= Math.min(5, before.length); left += 1) {
    for (let right = 0; right <= Math.min(5, after.length); right += 1) {
      const phrase = `${before.slice(before.length - left)}${candidate}${after.slice(0, right)}`
      const n = phrase.length
      if (n >= 2 && n <= 6 && indexes.ngrams.get(n)?.has(phrase)) {
        score += n * n
      }
    }
  }

  return score
}

function repairBuffer(buffer, indexes, file) {
  let output = ''
  let changed = 0
  const examples = []

  for (let i = 0; i < buffer.length; i += 1) {
    const b0 = buffer[i]
    const b1 = buffer[i + 1]
    const b2 = buffer[i + 2]

    if (b0 >= 0xe0 && b0 <= 0xef && isContinuation(b1) && b2 === 0x3f) {
      const before = output.slice(-8)
      const after = readLookahead(buffer, i + 3, 8)
      const prefixKey = `${b0},${b1}`
      let best = null

      for (let replacement = 0x80; replacement <= 0xbf; replacement += 1) {
        const candidate = decodeBytes([b0, b1, replacement])
        if (candidate.length !== 1 || candidate === REPLACEMENT_CHAR) continue
        const score = candidateScore(candidate, before, after, indexes, prefixKey)
        if (!best || score > best.score) {
          best = { candidate, replacement, score }
        }
      }

      if (best) {
        if (examples.length < 5) {
          examples.push(`${before}[${best.candidate}]${after} score=${best.score.toFixed(1)}`)
        }
        output += best.candidate
        changed += 1
        i += 2
        continue
      }
    }

    const [char, next] = readValidChar(buffer, i)
    output += char
    i = next - 1
  }

  return { text: output, changed, examples, file }
}

const files = walk(srcRoot)
const indexes = buildIndexes(buildCorpus(files))
let total = 0

for (const file of files) {
  const buffer = fs.readFileSync(file)
  if (!buffer.includes(0x3f)) continue
  const repaired = repairBuffer(buffer, indexes, file)
  if (!repaired.changed) continue
  total += repaired.changed
  console.log(`${repaired.changed} ${path.relative(root, file)}`)
  for (const example of repaired.examples) {
    console.log(`  ${example}`)
  }
  if (!dryRun) {
    fs.writeFileSync(file, repaired.text, 'utf8')
  }
}

console.log(`total=${total}`)
