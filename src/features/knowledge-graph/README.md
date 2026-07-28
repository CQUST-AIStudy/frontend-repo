# 数据结构课程知识图谱

按课程章节组织数据结构知识点（概念 / 结构 / 算法 / 操作 / 练习），支持图谱可视化、学习状态记录、导出 JSON 与 payload 预览。当前前端不再提供运行时静态图谱兜底；没有真实图谱数据时显示空状态。

## 目录结构

| 文件 | 职责 |
| --- | --- |
| `dataStructureGraph.js` | 图谱常量与节点/关系类型 UI 元数据 |
| `graphDatabaseAdapter.js` | 规范化契约：`normalizeGraph` / `validateGraph` / `getNodeContext` / `toGraphDbPayload` 等，关系由 `buildRelations` 从真实节点字段自动生成 |
| `knowledgeGraphDataSource.js` | 图谱数据源入口；未接入真实接口时返回空图谱 |
| `exportUtils.js` | 导出 JSON |
| `learningState.js` | localStorage 学习状态（掌握度 / 收藏 / 笔记），只保存用户交互状态，不作为业务图谱数据源 |
| `components/` | 画布、详情面板、工具栏、payload 预览等组件 |

## 数据源模式

- 前端只展示真实图谱接口返回的数据。
- 当前未接入可用图谱后端接口时，`loadKnowledgeGraph()` 返回空图谱，页面展示 Empty State。
- 前端不配置数据库地址、账号或密码，也不直连数据库。
- 不再以内置静态图谱、浏览器本地业务图谱或接口失败 fallback 伪造图谱数据。

## 前端行为

- 学生端「知识图谱」只读加载公共课程图谱；无数据时显示“暂无知识图谱数据”，不展示个人掌握度或学习状态。
- 公共「数据结构课程知识图谱」支持导出 JSON 与预览 payload；无数据时显示空状态。
- 保存/导入业务图谱能力需等待真实后端接口提供后再接入。

## 验证

```bash
npm run lint
npm run build
```
