/**
 * Neo4j 数据源（前端直连）
 *
 * 安全说明：
 * - 浏览器直连 Neo4j 会把连接凭据嵌入前端 bundle，任何用户均可在 devtools 获取。
 *   本模块仅适用于「开发环境 / 受信任内网」，不得用于公网生产。
 * - 缓解措施：使用只读账号、生产构建关闭 VUE_APP_NEO4J_ENABLED、Neo4j 服务端限制来源 IP 与 CORS。
 * - 长期方案：应由后端提供 Cypher 代理接口，前端走 axios；本任务按要求实现「直连 + 静态兜底」。
 *
 * 协议：
 * - bolt://   明文，浏览器走 WebSocket；仅内网使用。
 * - bolt+s:// / neo4j+s://   服务端证书加密（secure WebSocket）。生产内网应优先。
 * - 自签证书在浏览器可能被拒，需受信任证书或服务端关闭证书校验（不推荐）。
 *
 * CORS：Neo4j 4.x+ 浏览器直连需在 neo4j.conf 配置 server.bolt.origins 允许来源，否则 WebSocket 握手被阻断。
 */
import logger from '@/utils/logger'
import {
  GRAPH_CODE,
  GRAPH_SOURCE,
  GRAPH_VERSION,
  rawGraph
} from './dataStructureGraph'

const env = process.env || {}

export const neo4jConfig = {
  enabled: env.VUE_APP_NEO4J_ENABLED === 'true',
  url: env.VUE_APP_NEO4J_URL || 'bolt://127.0.0.1:7687',
  username: env.VUE_APP_NEO4J_USERNAME || 'neo4j',
  password: env.VUE_APP_NEO4J_PASSWORD || '',
  database: env.VUE_APP_NEO4J_DATABASE || 'neo4j'
}

let driverPromise = null

/**
 * 嵌套对象属性序列化前缀。
 * Neo4j 属性仅支持基本类型与「基本类型数组」，不支持嵌套 map（如 complexity 对象）。
 * 写库前把对象属性序列化为 `前缀 + JSON`，读回时还原，保证 round-trip 一致。
 * 种子脚本 scripts/seed-neo4j.mjs 与导出 exportUtils.js 复用同一前缀。
 */
export const JSON_PROP_PREFIX = '@@json@@:'

export function encodeGraphProps(props) {
  const out = {}
  for (const [key, value] of Object.entries(props || {})) {
    out[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? JSON_PROP_PREFIX + JSON.stringify(value)
      : value
  }
  return out
}

export function decodeGraphProps(props) {
  const out = {}
  for (const [key, value] of Object.entries(props || {})) {
    if (typeof value === 'string' && value.startsWith(JSON_PROP_PREFIX)) {
      try {
        out[key] = JSON.parse(value.slice(JSON_PROP_PREFIX.length))
      } catch {
        out[key] = value
      }
    } else {
      out[key] = value
    }
  }
  return out
}

function isSecureScheme(url) {
  return typeof url === 'string' && (url.startsWith('bolt+s') || url.startsWith('neo4j+s'))
}

/**
 * 懒加载 Neo4j 驱动单例（动态导入，未启用时不进主 bundle）。
 * @returns {Promise<object|null>} driver 或 null
 */
async function getDriver() {
  if (!neo4jConfig.enabled) return null
  if (!driverPromise) {
    driverPromise = (async () => {
      try {
        const neo4j = await import('neo4j-driver')
        const driver = neo4j.driver(
          neo4jConfig.url,
          neo4j.auth.basic(neo4jConfig.username, neo4jConfig.password),
          { encrypted: isSecureScheme(neo4jConfig.url) }
        )
        return driver
      } catch (error) {
        logger.warn('[neo4j] 驱动初始化失败', error)
        driverPromise = null
        throw error
      }
    })()
  }
  return driverPromise
}

/**
 * 探测连接可用性，不抛错。
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function probeConnection() {
  if (!neo4jConfig.enabled) return { ok: false, error: 'Neo4j 未启用' }
  try {
    const driver = await getDriver()
    if (!driver) return { ok: false, error: '驱动未初始化' }
    await driver.verifyConnectivity()
    return { ok: true }
  } catch (error) {
    logger.warn('[neo4j] 连接探测失败', error)
    return { ok: false, error: error?.message || String(error) }
  }
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (value == null) return []
  return Array.from(value)
}

/**
 * 将 Neo4j 节点属性映射回 rawGraph 节点结构（与 dataStructureGraph.js 的 makeNode 契约一致）。
 * 不预先构建 relations，交给 normalizeGraph.buildRelations 自动从 prerequisites/related/appliesTo/targets/chapterId 生成。
 */
function mapNeo4jNode(record) {
  const n = record || {}
  const properties = decodeGraphProps({ ...(n.properties || {}) })
  return {
    id: String(n.id ?? properties.id ?? '').trim(),
    label: String(properties.label ?? n.label ?? '').trim(),
    type: String(properties.type ?? 'concept').trim(),
    chapterId: properties.chapterId ? String(properties.chapterId) : null,
    summary: properties.summary || '',
    prerequisites: toArray(properties.prerequisites).map(String),
    related: toArray(properties.related).map(String),
    appliesTo: toArray(properties.appliesTo).map(String),
    targets: toArray(properties.targets).map(String),
    properties: {
      definition: properties.definition || '',
      studyTip: properties.studyTip || '',
      keywords: toArray(properties.keywords),
      ...properties
    }
  }
}

function emptyGraph() {
  return {
    metadata: {
      title: GRAPH_SOURCE.scenario,
      description: '从 Neo4j 加载的数据结构知识图谱',
      domain: 'computer-science',
      architecture: GRAPH_SOURCE.scenario,
      audience: 'student-and-teacher'
    },
    course: null,
    nodes: []
  }
}

/**
 * 从 Neo4j 查询知识点并映射回 rawGraph 结构。
 * 节点 label：KnowledgeNode；关系类型：CONTAINS/PREREQUISITE/RELATED_TO/APPLIES_TO/TESTED_BY。
 * @returns {Promise<object|null>} 映射后的 graph，未启用/失败/空时返回 null
 */
export async function fetchKnowledgeGraph() {
  if (!neo4jConfig.enabled) return null
  const driver = await getDriver()
  if (!driver) return null

  const session = driver.session({ database: neo4jConfig.database })
  try {
    const result = await session.run(
      'MATCH (n:KnowledgeNode) WHERE n.graphCode = $graphCode RETURN n',
      { graphCode: GRAPH_CODE }
    )

    if (!result.records || result.records.length === 0) {
      logger.warn('[neo4j] 未查询到 graphCode 对应节点，回退静态数据')
      return null
    }

    const graph = emptyGraph()
    for (const record of result.records) {
      const node = mapNeo4jNode(record.get('n'))
      if (!node.id || !node.label) continue
      if (node.type === 'course') {
        graph.course = node
      } else {
        graph.nodes.push(node)
      }
    }

    if (!graph.course) {
      logger.warn('[neo4j] 未找到 course 根节点，回退静态数据')
      return null
    }

    return graph
  } catch (error) {
    logger.warn('[neo4j] 查询知识点失败，回退静态数据', error)
    return null
  } finally {
    await session.close()
  }
}

/**
 * 加载知识图谱：Neo4j 优先，失败/空/未启用自动回退静态 rawGraph。
 * @returns {Promise<{ source: 'neo4j'|'static', graph: object }>}
 */
export async function loadKnowledgeGraph() {
  if (!neo4jConfig.enabled) {
    return { source: 'static', graph: rawGraph }
  }
  try {
    const graph = await fetchKnowledgeGraph()
    if (graph && graph.course && graph.nodes.length > 0) {
      return { source: 'neo4j', graph }
    }
  } catch (error) {
    logger.warn('[neo4j] 加载失败，回退静态数据', error)
  }
  return { source: 'static', graph: rawGraph }
}

/**
 * 将写库 payload 写入 Neo4j。
 * @param {object} payload toGraphDbPayload 产出的 { graphCode, nodes[], relations[] }
 * @returns {Promise<{ success: boolean, mode: string, written?: boolean, counts?: object, message?: string, error?: string }>}
 */
export async function writeKnowledgeGraph(payload) {
  if (!neo4jConfig.enabled) {
    return {
      success: false,
      mode: 'preview',
      message: 'Neo4j 未启用，当前仅支持前端预览模式。',
      payload
    }
  }

  const driver = await getDriver()
  if (!driver) {
    return {
      success: false,
      mode: 'preview',
      message: 'Neo4j 驱动初始化失败，回退预览模式。',
      payload
    }
  }

  const graphCode = payload?.graphCode || GRAPH_CODE
  const nodes = Array.isArray(payload?.nodes) ? payload.nodes : []
  const relations = Array.isArray(payload?.relations) ? payload.relations : []
  const session = driver.session({ database: neo4jConfig.database })

  try {
    const nodeCount = await session.executeWrite(async (tx) => {
      const cleaned = nodes.map((node) => {
        const props = encodeGraphProps({
          ...(node.properties || {}),
          id: node.id,
          label: node.label,
          type: node.type,
          graphCode
        })
        return { id: node.id, props }
      })
      const result = await tx.run(
        `UNWIND $rows AS row
         MERGE (n:KnowledgeNode { id: row.id, graphCode: $graphCode })
         SET n += row.props
         RETURN count(n) AS c`,
        { rows: cleaned, graphCode }
      )
      return result.records[0]?.get('c')?.toNumber?.() ?? cleaned.length
    })

    // 关系按类型分批，避免动态关系类型语法问题
    const relationByType = new Map()
    for (const relation of relations) {
      if (!relation?.source || !relation?.target || !relation?.type) continue
      if (!relationByType.has(relation.type)) relationByType.set(relation.type, [])
      relationByType.get(relation.type).push({
        source: relation.source,
        target: relation.target,
        props: encodeGraphProps(relation.properties || {})
      })
    }

    let relationCount = 0
    for (const [type, rows] of relationByType) {
      await session.executeWrite(async (tx) => {
        const result = await tx.run(
          `UNWIND $rows AS row
           MATCH (a:KnowledgeNode { id: row.source, graphCode: $graphCode })
           MATCH (b:KnowledgeNode { id: row.target, graphCode: $graphCode })
           MERGE (a)-[r:\`${type}\`]->(b)
           SET r += row.props
           RETURN count(r) AS c`,
          { rows, graphCode }
        )
        relationCount += result.records[0]?.get('c')?.toNumber?.() ?? rows.length
      })
    }

    return {
      success: true,
      mode: 'neo4j',
      written: true,
      counts: { nodes: nodeCount, relations: relationCount },
      message: `已写入 ${nodeCount} 个节点、${relationCount} 条关系到 Neo4j。`
    }
  } catch (error) {
    logger.warn('[neo4j] 写入失败', error)
    return {
      success: false,
      mode: 'neo4j',
      written: false,
      error: error?.message || String(error),
      message: `写入 Neo4j 失败：${error?.message || error}`
    }
  } finally {
    await session.close()
  }
}

export { GRAPH_CODE, GRAPH_VERSION, GRAPH_SOURCE }
