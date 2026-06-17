const execPath = process.env.npm_execpath || ''
const userAgent = process.env.npm_config_user_agent || ''
const marker = `${execPath} ${userAgent}`.toLowerCase()

if (marker.includes('pnpm') || marker.includes('yarn')) {
  console.error('This frontend project uses npm only. Please run npm install / npm run <script>.')
  process.exit(1)
}
