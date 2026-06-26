import axios from 'axios'

const knowledgeGraphClient = axios.create({
  baseURL: '/knowledge-graph',
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 获取完整知识图谱
 * @param {string} graphCode 图谱唯一标识
 * @returns {Promise<object>} { metadata, course, nodes, relations }
 */
export function fetchGraph(graphCode = 'data-structure-knowledge-graph') {
  return knowledgeGraphClient
    .get(`/api/graphs/${graphCode}`)
    .then(res => res.data)
}

/**
 * 获取图谱列表
 * @returns {Promise<array>} 图谱摘要列表
 */
export function listGraphs() {
  return knowledgeGraphClient
    .get('/api/graphs')
    .then(res => res.data)
}

/**
 * 创建图谱（全量批量写入）
 * @param {object} payload toGraphDbPayload 格式的图谱数据
 * @returns {Promise<object>} { success, graphCode, version, nodeCount, relationCount }
 */
export function saveGraph(payload) {
  return knowledgeGraphClient
    .post('/api/graphs', payload)
    .then(res => res.data)
}

/**
 * 全量覆盖更新图谱
 * @param {string} graphCode 图谱唯一标识
 * @param {object} payload toGraphDbPayload 格式的图谱数据
 * @returns {Promise<object>} { success, graphCode, version, nodeCount, relationCount }
 */
export function updateGraph(graphCode, payload) {
  return knowledgeGraphClient
    .put(`/api/graphs/${graphCode}`, payload)
    .then(res => res.data)
}

/**
 * 删除图谱
 * @param {string} graphCode 图谱唯一标识
 * @returns {Promise<object>} { success, graphCode }
 */
export function deleteGraph(graphCode) {
  return knowledgeGraphClient
    .delete(`/api/graphs/${graphCode}`)
    .then(res => res.data)
}

/**
 * 校验图谱完整性
 * @param {string} graphCode 图谱唯一标识
 * @returns {Promise<object>} { valid, errors }
 */
export function validateGraph(graphCode = 'data-structure-knowledge-graph') {
  return knowledgeGraphClient
    .get(`/api/graphs/${graphCode}/validate`)
    .then(res => res.data)
}

/**
 * 获取图谱统计信息
 * @param {string} graphCode 图谱唯一标识
 * @returns {Promise<object>} { totalNodes, totalRelations, nodeTypeCounts, ... }
 */
export function getGraphStats(graphCode = 'data-structure-knowledge-graph') {
  return knowledgeGraphClient
    .get(`/api/graphs/${graphCode}/stats`)
    .then(res => res.data)
}

export default knowledgeGraphClient
