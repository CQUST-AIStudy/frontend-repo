const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const ragApiPath = path.join(__dirname, '..', 'src', 'api', 'rag.js')
const source = fs.readFileSync(ragApiPath, 'utf8')

test('proxied /rag requests detect the Java-backed proxy path', () => {
  assert.match(
    source,
    /function isProxyRagRequest/,
    'rag api should detect when requests target the Java /rag proxy'
  )
})

test('proxied /rag requests skip TAP token restoration', () => {
  assert.match(
    source,
    /if \(isProxyRagRequest\(path\)\) return null/,
    'proxied /rag requests should not force TAP token restoration'
  )
})

test('proxied /rag requests rely on cookies instead of bearer headers', () => {
  assert.match(
    source,
    /if \(isProxyRagRequest\(path\)\) \{\s*return \{\s*\.\.\.options,\s*credentials: options\.credentials \|\| 'include'/,
    'proxied /rag requests should use browser cookies instead of Authorization headers'
  )
})
