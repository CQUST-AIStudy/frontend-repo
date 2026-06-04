const fs = require('fs')
const path = require('path')

const mode = (process.argv[2] || '').trim().toLowerCase()
const projectRoot = path.resolve(__dirname, '..')
const envPath = path.join(projectRoot, '.env.local')

const presets = {
  local: {
    VUE_APP_API_BASE_URL: '',
    VUE_APP_RAG_API_BASE_URL: '/rag',
    VUE_APP_USE_MOCK_DATA: 'true'
  },
  server: {
    VUE_APP_API_BASE_URL: 'http://223.109.142.152:8000',
    VUE_APP_RAG_API_BASE_URL: 'http://223.109.142.152:8000/api/rag',
    VUE_APP_USE_MOCK_DATA: 'false'
  }
}

function usage() {
  console.log('Usage: node scripts/switch-api.js <local|server|status>')
  console.log('')
  console.log('local  : use vue dev-server proxy, /api -> localhost:8081')
  console.log('server : call remote backend at http://223.109.142.152:8000')
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
  process.exit(0)
}

for (const [key, value] of Object.entries(presets[mode])) {
  upsert(env.lines, key, value)
}

const output = env.lines.join('\n').replace(/\n*$/, '\n')
fs.writeFileSync(envPath, output, 'utf8')

console.log(`Switched frontend API mode to "${mode}".`)
console.log(`VUE_APP_API_BASE_URL=${presets[mode].VUE_APP_API_BASE_URL}`)
console.log(`VUE_APP_RAG_API_BASE_URL=${presets[mode].VUE_APP_RAG_API_BASE_URL}`)
console.log(`VUE_APP_USE_MOCK_DATA=${presets[mode].VUE_APP_USE_MOCK_DATA}`)
console.log('Restart npm run serve for Vue CLI to reload .env.local.')
