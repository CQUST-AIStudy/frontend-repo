# 数据结构课程知识图谱

按课程章节组织数据结构知识点（概念 / 结构 / 算法 / 操作 / 练习），支持 3D 可视化、学习状态记录、导入导出，以及 **Neo4j 直连 + 静态兜底** 两种数据源。

## 目录结构

| 文件 | 职责 |
| --- | --- |
| `dataStructureGraph.js` | 内置静态图谱数据（节点 + 关系字段），含复杂度 / 代码片段 / 应用场景 / 练习题实体 |
| `graphDatabaseAdapter.js` | 规范化契约：`normalizeGraph` / `validateGraph` / `getNodeContext` / `toGraphDbPayload` 等，关系由 `buildRelations` 从节点字段自动生成 |
| `neo4jDataSource.js` | Neo4j 直连：加载 / 写入 / 连接探测，含对象属性 JSON 序列化（`encodeGraphProps` / `decodeGraphProps`） |
| `exportUtils.js` | 导出 JSON / Cypher、写入 Neo4j |
| `learningState.js` | localStorage 学习状态（掌握度 / 收藏 / 笔记） |
| `components/` | 3D 画布、详情面板、工具栏、写库预览等组件 |

## 数据源模式

- **内置静态数据（默认）**：无需任何配置，开箱即用。
- **Neo4j**：配置 `.env.local` 后启用，优先从 Neo4j 加载；连接失败 / 未导入数据时自动回退静态数据。

> 安全说明：浏览器直连 Neo4j 会把凭据打进前端 bundle，**仅适用于开发环境 / 受信任内网**，不得用于公网生产。生产应由后端提供 Cypher 代理接口。

## `.env.local` 配置

在 `frontend-repo/.env.local`（已被 gitignore，不会提交）中添加：

```dotenv
# 是否启用 Neo4j 直连（true 时前端优先连库）
VUE_APP_NEO4J_ENABLED=true
# bolt:// 明文（内网）；bolt+s:// / neo4j+s:// 加密（推荐）
VUE_APP_NEO4J_URL=bolt://127.0.0.1:7687
VUE_APP_NEO4J_USERNAME=neo4j
VUE_APP_NEO4J_PASSWORD=你的密码
VUE_APP_NEO4J_DATABASE=neo4j
```

修改后需重启 `npm run serve` 让 Vue CLI 重新加载环境变量。

## 装载真实数据到 Neo4j

两种方式，任选其一：

### 方式一：命令行种子脚本（推荐，适合初始化 / CI）

```bash
# 凭据优先级：CLI 参数 > 进程环境变量 > .env.local
npm run seed:neo4j -- --clear

# 或显式传参
node scripts/seed-neo4j.mjs --url bolt://127.0.0.1:7687 --username neo4j --password 你的密码 --clear
```

- `--clear`：写入前先 `DETACH DELETE` 当前 graphCode 的全部节点（幂等重置）。
- `--help`：查看全部参数。
- 脚本复用 `toGraphDbPayload`（与前端同一契约），节点 label 为 `KnowledgeNode`，关系类型 `CONTAINS / PREREQUISITE / RELATED_TO / APPLIES_TO / TESTED_BY`。

### 方式二：前端一键导入（适合连库后快速装载）

1. 配好 `.env.local` 并 `npm run serve`。
2. 打开「数据结构课程知识图谱」页面，确认顶部数据来源已是 Neo4j。
3. 工具栏点击 **导入种子数据** → 把内置静态图谱全量写入 Neo4j 并刷新页面。

> 「写入 Neo4j」与「导入种子数据」都走 `writeKnowledgeGraph`，区别仅在数据来源（当前图谱 vs 内置静态图谱）。

## 嵌套对象属性的序列化

Neo4j 属性仅支持基本类型与「基本类型数组」，不支持嵌套 map。`complexity` 这类对象字段写库前会被序列化为 `@@json@@:<JSON>` 字符串（`JSON_PROP_PREFIX`），读回时由 `decodeGraphProps` 自动还原。种子脚本、前端写库、Cypher 导出三处保持同一前缀，保证 round-trip 一致。

## CORS / 连接排查

- Neo4j 4.x+ 浏览器直连需在 `neo4j.conf` 配置允许来源，否则 WebSocket 握手被阻断：
  ```
  server.bolt.listen_address=0.0.0.0:7687
  # 按需放开浏览器来源
  dbms.security.allow_csv_import_from_file_urls=true
  ```
- 自签证书在浏览器可能被拒，加密连接需受信任证书。
- 连接失败时页面会显示「已回退到内置静态数据」提示，可在浏览器 devtools 查看 `[neo4j]` 日志。

## 验证

```bash
npm run lint
npm run build
```
