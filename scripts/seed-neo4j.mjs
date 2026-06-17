#!/usr/bin/env node
/**
 * Neo4j 知识图谱种子脚本（Node 端，独立于浏览器直连）。
 *
 * 用途：把内置静态图谱 rawGraph（经 toGraphDbPayload 规范化）写入 Neo4j，
 *       供「数据结构课程知识图谱」连库模式加载真实数据。
 *
 * 复用契约：动态加载 ESM 的 graphDatabaseAdapter.toGraphDbPayload / validateGraph，
 *   不复制规范化与关系生成逻辑（buildRelations 自动从 prerequisites/related/... 生成关系）。
 *   因前端项目无 "type":"module"，.js 默认按 CJS 解析；故读取源码后用 data: URL 以 ESM 加载，
 *   并把 adapter 对 './dataStructureGraph' 的相对导入替换为内联 data: URL（避免改动源文件）。
 *
 * 凭据来源（优先级：CLI 参数 > 进程环境变量 > .env.local），不硬编码：
 *   --url        / VUE_APP_NEO4J_URL
 *   --username   / VUE_APP_NEO4J_USERNAME
 *   --password   / VUE_APP_NEO4J_PASSWORD
 *   --database   / VUE_APP_NEO4J_DATABASE
 *   --clear      写入前先 DETACH DELETE 当前 graphCode 的全部节点
 *
 * 用法：
 *   node scripts/seed-neo4j.mjs --url bolt://127.0.0.1:7687 --username neo4j --password secret --clear
 *   或在 .env.local 配好 VUE_APP_NEO4J_* 后：node scripts/seed-neo4j.mjs --clear
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import neo4j from 'neo4j-driver'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const kgDir = resolve(projectRoot, 'src/features/knowledge-graph')

// 嵌套对象属性需序列化（Neo4j 属性仅支持基本类型与基本类型数组）。
// 与 neo4jDataSource.js 的 JSON_PROP_PREFIX 保持一致，读回时自动还原。
const JSON_PROP_PREFIX = '@@json@@:'

function encodeProps(props) {
  const out = {}
  for (const [key, value] of Object.entries(props || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = JSON_PROP_PREFIX + JSON.stringify(value)
    } else {
      out[key] = value
    }
  }
  return out
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token === '--clear') { args.clear = true; continue }
    if (token === '--help' || token === '-h') { args.help = true; continue }
    if (token.startsWith('--')) {
      const key = token.slice(2)
      const next = argv[i + 1]
      args[key] = next && !next.startsWith('--') ? argv[++i] : 'true'
    }
  }
  return args
}

function loadEnvLocal() {
  const envPath = resolve(projectRoot, '.env.local')
  const out = {}
  if (!existsSync(envPath)) return out
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (match) out[match[1]] = match[2]
  }
  return out
}

/**
 * 以 ESM 方式动态加载 graphDatabaseAdapter，得到 toGraphDbPayload / validateGraph。
 * 项目无 "type":"module"，.js 默认按 CJS 解析；这里用 data: URL 强制 ESM，
 * 并把 adapter 内对 './dataStructureGraph' 的相对导入改写为内联 data: URL，避免改动源文件。
 */
async function loadAdapter() {
  const dataPath = resolve(kgDir, 'dataStructureGraph.js')
  const adapterPath = resolve(kgDir, 'graphDatabaseAdapter.js')
  const dataSource = readFileSync(dataPath, 'utf8')
  const dataUrl = 'data:text/javascript;base64,' + Buffer.from(dataSource, 'utf8').toString('base64')

  let adapterSource = readFileSync(adapterPath, 'utf8')
  // 把 from './dataStructureGraph' 替换为内联 data: URL
  adapterSource = adapterSource.replace(
    /from\s+['"]\.\/dataStructureGraph['"]/g,
    `from '${dataUrl}'`
  )
  const adapterUrl = 'data:text/javascript;base64,' + Buffer.from(adapterSource, 'utf8').toString('base64')
  return import(adapterUrl)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(`用法: node scripts/seed-neo4j.mjs [选项]

选项:
  --url <bolt://...>      Neo4j 连接地址 (默认 VUE_APP_NEO4J_URL 或 bolt://127.0.0.1:7687)
  --username <name>       用户名 (默认 VUE_APP_NEO4J_USERNAME 或 neo4j)
  --password <pwd>        密码 (默认 VUE_APP_NEO4J_PASSWORD)
  --database <db>         数据库名 (默认 VUE_APP_NEO4J_DATABASE 或 neo4j)
  --clear                 写入前先 DETACH DELETE 当前 graphCode 的全部节点
  -h, --help              显示帮助

凭据优先级: CLI 参数 > 进程环境变量 > .env.local`)
    return
  }

  const envLocal = loadEnvLocal()
  const pick = (cliKey, envKey, fallback) =>
    args[cliKey] || process.env[envKey] || envLocal[envKey] || fallback

  const url = pick('url', 'VUE_APP_NEO4J_URL', 'bolt://127.0.0.1:7687')
  const username = pick('username', 'VUE_APP_NEO4J_USERNAME', 'neo4j')
  const password = pick('password', 'VUE_APP_NEO4J_PASSWORD', '')
  const database = pick('database', 'VUE_APP_NEO4J_DATABASE', 'neo4j')

  if (!password) {
    console.error('缺少密码。请用 --password 传入，或在 .env.local 配置 VUE_APP_NEO4J_PASSWORD。')
    process.exit(1)
  }

  console.log(`[seed] 加载静态图谱并规范化…`)
  const adapter = await loadAdapter()
  const validation = adapter.validateGraph()
  if (!validation.valid) {
    console.error('[seed] 图谱契约校验未通过：')
    for (const err of validation.errors) console.error('  - ' + err)
    process.exit(1)
  }
  const payload = adapter.toGraphDbPayload()
  const graphCode = payload.graphCode
  console.log(`[seed] graphCode=${graphCode} 节点=${payload.nodes.length} 关系=${payload.relations.length}`)

  const isSecure = url.startsWith('bolt+s') || url.startsWith('neo4j+s')
  const driver = neo4j.driver(url, neo4j.auth.basic(username, password), { encrypted: isSecure })

  try {
    await driver.verifyConnectivity()
    console.log(`[seed] 已连接 ${url} (database=${database})`)
  } catch (error) {
    console.error(`[seed] 连接失败：${error?.message || error}`)
    await driver.close()
    process.exit(1)
  }

  const session = driver.session({ database })
  try {
    if (args.clear) {
      const res = await session.run(
        'MATCH (n:KnowledgeNode { graphCode: $graphCode }) DETACH DELETE n RETURN count(n) AS c',
        { graphCode }
      )
      const deleted = res.records[0]?.get('c')?.toNumber?.() ?? 0
      console.log(`[seed] --clear 已删除 ${deleted} 个旧节点`)
    }

    // 写节点（对象属性序列化）
    const nodeRows = payload.nodes.map((node) => {
      const props = encodeProps({
        ...(node.properties || {}),
        id: node.id,
        label: node.label,
        type: node.type,
        graphCode
      })
      return { id: node.id, props }
    })
    const nodeRes = await session.executeWrite((tx) => tx.run(
      `UNWIND $rows AS row
       MERGE (n:KnowledgeNode { id: row.id, graphCode: $graphCode })
       SET n += row.props
       RETURN count(n) AS c`,
      { rows: nodeRows, graphCode }
    ))
    const nodeCount = nodeRes.records[0]?.get('c')?.toNumber?.() ?? nodeRows.length

    // 写关系（按类型分批，避免动态关系类型语法）
    const relationByType = new Map()
    for (const relation of payload.relations) {
      if (!relation.source || !relation.target || !relation.type) continue
      if (!relationByType.has(relation.type)) relationByType.set(relation.type, [])
      relationByType.get(relation.type).push({
        source: relation.source,
        target: relation.target,
        props: encodeProps(relation.properties || {})
      })
    }
    let relationCount = 0
    for (const [type, rows] of relationByType) {
      const relRes = await session.executeWrite((tx) => tx.run(
        `UNWIND $rows AS row
         MATCH (a:KnowledgeNode { id: row.source, graphCode: $graphCode })
         MATCH (b:KnowledgeNode { id: row.target, graphCode: $graphCode })
         MERGE (a)-[r:\`${type}\`]->(b)
         SET r += row.props
         RETURN count(r) AS c`,
        { rows, graphCode }
      ))
      relationCount += relRes.records[0]?.get('c')?.toNumber?.() ?? rows.length
    }

    console.log(`[seed] 完成：写入 ${nodeCount} 个节点、${relationCount} 条关系。`)
  } catch (error) {
    console.error(`[seed] 写入失败：${error?.message || error}`)
    process.exitCode = 1
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((error) => {
  console.error(`[seed] 未捕获错误：${error?.stack || error}`)
  process.exit(1)
})
