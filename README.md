# 数据结构课程 AI 测评系统前端

本目录是“数据结构课程 AI 测评系统”的前端工程，面向学生、教师和管理员提供实验管理、代码测评、学习分析、AI 辅助教学、课程知识库、RAG 分析、PTA 数据同步和 LeetCode 风格练习等能力。

项目基于 Vue 3 与 Vue CLI 构建，开发环境通过代理与业务后端、RAG 服务、爬虫服务和 LeetCodeClaw 服务联动。

## 技术栈

- 前端框架：Vue 3
- 构建工具：Vue CLI / vue-cli-service
- 路由管理：Vue Router 4
- 状态管理：Pinia、pinia-plugin-persistedstate
- 样式方案：Tailwind CSS 4、PostCSS
- HTTP 请求：Axios
- 数据可视化：ECharts
- 代码编辑器：CodeMirror 6、vue-codemirror
- Markdown 与内容安全：marked、markdown-it、DOMPurify
- 文档和导出：docx、jspdf、jspdf-autotable、html2canvas、file-saver、pdf-lib/fontkit

## 功能模块

### 学生端

- 学生仪表盘、学习概览和能力画像。
- 实验列表、实验详情、代码提交和测评结果查看。
- 学习分析、AI 学习报告、自我评估和薄弱项训练。
- AI 助手、推荐练习、LeetCode 搜索与练习。
- 班级加入和个人信息管理。

### 教师端

- 教师仪表盘、班级选择、班级列表和班级画像。
- 实验创建、实验管理、学生提交查看和评分详情。
- 班级分析、课程分析、实验数据分析和教学分析。
- AI 推荐、AI 对话、AI 整理和 PPT 生成。
- 教学文档中心、双语阅读、总结卡片。
- AI 批改中心、评分细则维护、提交评审。
- 课程知识库、RAG 分析、PTA 数据同步。
- 课程负责人和系主任相关的教师管理、院系分析、教师 AI 管理能力。
- LeetCode 题库管理。

### 管理员端

- 管理员仪表盘。
- 用户管理、班级管理和实验管理。
- 系统日志、LeetCodeClaw 服务状态和个人信息管理。

## 环境要求

- Node.js
- npm
- 建议先启动业务后端、RAG 服务、爬虫服务和 LeetCodeClaw 服务，再启动前端开发服务。

默认服务约定：

```text
前端开发服务：http://localhost:8080
业务后端服务：http://localhost:8081
RAG 服务：http://127.0.0.1:8001
爬虫服务：http://127.0.0.1:8100
LeetCodeClaw 服务：http://127.0.0.1:10170
```

## 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务
npm run serve

# 构建生产版本
npm run build

# 运行 lint 检查
npm run lint
```

开发服务默认监听 `8080` 端口，可以通过 `PORT` 环境变量覆盖：

```bash
PORT=8082 npm run serve
```

Windows PowerShell：

```powershell
$env:PORT=8082; npm run serve
```

## 代理与运行时配置

开发环境代理配置位于 `vue.config.js`：

```text
/api            -> http://localhost:8081
/rag            -> http://127.0.0.1:8001
/spider         -> http://127.0.0.1:8100
/leetcode-claw  -> http://127.0.0.1:10170
```

说明：

- `/spider` 会移除路径前缀后转发到爬虫服务。
- `/leetcode-claw` 会移除路径前缀后转发到 LeetCodeClaw 服务。
- 业务 API 默认使用同源路径，由开发代理转发到后端服务。

运行时 API 基础地址位于 `src/config/runtime.js`：

- `VUE_APP_API_BASE_URL`：业务 API 基础地址，默认使用同源路径。
- `VUE_APP_RAG_API_BASE_URL`：RAG API 基础地址，默认值为 `/rag`。

本地环境变量文件不要提交到仓库。如需提供示例，请使用 `.env.example` 或 `.env.*.example`。

## 项目结构

```text
src/
├── api/             # 接口请求封装
├── assets/          # 静态资源、图片、字体和样式
├── components/      # 通用组件
├── composables/     # 组合式逻辑
├── config/          # 运行时配置
├── constants/       # 常量定义
├── mock/            # 开发环境模拟数据
├── router/          # 路由配置和路由守卫
├── services/        # 数据服务和业务封装
├── store/           # Pinia 状态管理
├── utils/           # 工具函数
└── views/           # 页面视图
    ├── admin/       # 管理员端页面
    ├── student/     # 学生端页面
    ├── teacher/     # 教师端页面
    └── Login.vue    # 登录页面
```

## 开发约定

- 新增或修改接口时，需要同步检查 `src/api/`、页面调用逻辑和字段命名是否一致。
- 路由鉴权和角色入口集中在 `src/router/index.js`，调整页面入口时需要同步检查路由守卫。
- 本地 mock 数据由 `src/mock/` 提供，是否启用取决于接口封装中的开关。
- 图表展示优先复用 `src/utils/chartHelpers.js`、`src/utils/chartUtils.js` 等现有工具。
- 错误提示优先复用 `src/utils/errorMessage.js` 的统一处理逻辑。
- 不要在前端硬编码密钥、Token、私有路径或生产服务地址。

## 常见问题

### 页面请求后端失败

确认业务后端已启动，并检查 `/api` 代理目标是否可访问：

```text
http://localhost:8081
```

### RAG 相关接口失败

确认 RAG 服务已启动，并检查 `/rag` 代理目标是否可访问：

```text
http://127.0.0.1:8001
```

### PTA 或爬虫相关接口失败

确认爬虫服务已启动，并检查 `/spider` 代理目标是否可访问：

```text
http://127.0.0.1:8100
```

### LeetCode 题库或服务状态失败

确认 LeetCodeClaw 服务已启动，并检查 `/leetcode-claw` 代理目标是否可访问：

```text
http://127.0.0.1:10170
```
