# 数据结构课程知识图谱

按课程章节组织数据结构知识点（概念 / 结构 / 算法 / 操作 / 练习），支持 2D SVG 可视化、学习状态记录、导入导出，以及 **后端 MySQL API + 静态兜底** 两种数据源。

## 目录结构

| 文件 | 职责 |
| --- | --- |
| `dataStructureGraph.js` | 内置静态图谱数据（节点 + 关系字段），含复杂度 / 代码片段 / 应用场景 / 练习题实体 |
| `graphDatabaseAdapter.js` | 规范化契约：`normalizeGraph` / `validateGraph` / `getNodeContext` / `toGraphDbPayload` 等，关系由 `buildRelations` 从节点字段自动生成 |
| `knowledgeGraphDataSource.js` | 后端 API 数据源：加载 / 保存 / 导入种子图谱；后端负责 MySQL 持久化 |
| `exportUtils.js` | 导出 JSON、保存到后端 API |
| `learningState.js` | localStorage 学习状态（掌握度 / 收藏 / 笔记） |
| `components/` | 2D SVG 画布、详情面板、工具栏、写库预览等组件 |

## 数据源模式

- **后端 MySQL API**：前端默认请求 `/api/knowledge-graphs/{graphCode}`，通过现有 `tapClient` 携带认证信息。
- **内置静态数据**：后端接口不可用、无数据或返回结构不合法时自动回退，保证页面可浏览。

前端不配置数据库地址、账号或密码，也不直连数据库。

## 后端接口约定

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/api/knowledge-graphs/{graphCode}` | 读取图谱 |
| `PUT` | `/api/knowledge-graphs/{graphCode}` | 保存当前图谱 payload |
| `POST` | `/api/knowledge-graphs/{graphCode}/seed` | 导入内置静态图谱 payload |

保存与导入使用 `toGraphDbPayload(graph)` 输出：

```json
{
  "graphCode": "data-structure-knowledge-graph",
  "version": "...",
  "source": {},
  "metadata": {},
  "nodes": [],
  "relations": []
}
```

后端可直接返回 payload，也可使用统一响应 `{ "success": true, "data": payload }`。前端会把节点和关系归一化为当前 2D 图谱需要的结构。

## 前端行为

- 学生端「我的学习图谱」只读加载图谱，后端失败时显示回退提示。
- 公共「数据结构课程知识图谱」支持导出 JSON、预览写库 payload、保存到后端、导入种子数据。
- 保存/导入失败时仅提示失败，不会伪装成真实写库成功。

## 验证

```bash
npm run lint
npm run build
```
