const fs = require('fs')
const path = require('path')

const mode = (process.argv[2] || '').trim().toLowerCase()
const projectRoot = path.resolve(__dirname, '..')
const envPath = path.join(projectRoot, '.env.local')

const localPreset = {
  VUE_APP_API_BASE_URL: '',
  VUE_APP_RAG_API_BASE_URL: '/rag',
  VUE_APP_USE_MOCK_DATA: 'true'
}

function usage() {
  console.log('Usage: node scripts/switch-api.js <local|server|status>')
  console.log('')
  console.log('local  : use vue dev-server proxy, /api -> localhost:8081')
  console.log('server : call remote backend from REMOTE_API_BASE_URL in .env.local or process env')
  console.log('status : print current .env.local API values')
}

function parseEnv(content) {
  const lines = content.split(/\r?\n/)
  const values = new Map()
  for (const line of lines) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (match) values.set(match[1], match[2])
  }
  return { lines, values }
}

function upsert(lines, key, value) {
  const assignment = `${key}=${value}`
  const index = lines.findIndex((line) => line.startsWith(`${key}=`))
  if (index >= 0) lines[index] = assignment
  else lines.push(assignment)
}

function load() {
  if (!fs.existsSync(envPath)) return { lines: [], values: new Map() }
  return parseEnv(fs.readFileSync(envPath, 'utf8'))
}

function readConfigValue(env, key) {
  return process.env[key] || env.values.get(key) || ''
}

function trimTrailingSlash(value) {
  return value.replace(/\/$/, '')
}

function buildServerPreset(env) {
  const remoteApiBaseUrl = trimTrailingSlash(readConfigValue(env, 'REMOTE_API_BASE_URL'))
  const remoteRagApiBaseUrl = trimTrailingSlash(
    readConfigValue(env, 'REMOTE_RAG_API_BASE_URL') || (remoteApiBaseUrl ? `${remoteApiBaseUrl}/api/rag` : '')
  )

  if (!remoteApiBaseUrl) {
    throw new Error('Missing REMOTE_API_BASE_URL. Add it to .env.local or set it in the process environment.')
  }

  return {
    VUE_APP_API_BASE_URL: remoteApiBaseUrl,
    VUE_APP_RAG_API_BASE_URL: remoteRagApiBaseUrl,
    VUE_APP_USE_MOCK_DATA: 'false'
  }
}

if (!mode || !['local', 'server', 'status'].includes(mode)) {
  usage()
  process.exit(mode ? 1 : 0)
}

const env = load()

if (mode === 'status') {
  console.log(`.env.local: ${envPath}`)
  console.log(`VUE_APP_API_BASE_URL=${env.values.get('VUE_APP_API_BASE_URL') || ''}`)
  console.log(`VUE_APP_RAG_API_BASE_URL=${env.values.get('VUE_APP_RAG_API_BASE_URL') || ''}`)
  console.log(`VUE_APP_USE_MOCK_DATA=${env.values.get('VUE_APP_USE_MOCK_DATA') || ''}`)
  console.log(`REMOTE_API_BASE_URL=${env.values.get('REMOTE_API_BASE_URL') ? '[set]' : ''}`)
  console.log(`REMOTE_RAG_API_BASE_URL=${env.values.get('REMOTE_RAG_API_BASE_URL') ? '[set]' : ''}`)
  process.exit(0)
}

const preset = mode === 'local' ? localPreset : buildServerPreset(env)

for (const [key, value] of Object.entries(preset)) {
  upsert(env.lines, key, value)
}

const output = env.lines.join('\n').replace(/\n*$/, '\n')
fs.writeFileSync(envPath, output, 'utf8')

console.log(`Switched frontend API mode to "${mode}".`)
console.log(`VUE_APP_API_BASE_URL=${preset.VUE_APP_API_BASE_URL}`)
console.log(`VUE_APP_RAG_API_BASE_URL=${preset.VUE_APP_RAG_API_BASE_URL}`)
console.log(`VUE_APP_USE_MOCK_DATA=${preset.VUE_APP_USE_MOCK_DATA}`)
console.log('Restart npm run serve for Vue CLI to reload .env.local.')
