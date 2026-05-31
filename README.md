# 数据结构课程 AI 测评系统前端

本项目是“数据结构课程 AI 测评系统”的前端工程，面向学生、教师和管理员提供课程实验、代码评测、学习分析、AI 辅助教学、RAG 知识库、PTA 数据同步等功能。项目基于 Vue 3 和 Vue CLI 构建，主要通过 `/api`、`/rag`、`/spider` 等代理与后端服务联动。

## 技术栈

- 前端框架：Vue 3
- 构建工具：Vue CLI / vue-cli-service
- 路由管理：Vue Router 4
- 状态管理：Pinia、pinia-plugin-persistedstate
- UI 组件：Element Plus、@element-plus/icons-vue
- 数据可视化：ECharts
- HTTP 请求：Axios
- 代码编辑器：CodeMirror 6、vue-codemirror
- 文档与导出：docx、jspdf、html2canvas、file-saver
- 样式处理：Sass、PostCSS、Tailwind CSS

## 功能模块

### 学生端

- 学生仪表盘与学习概览
- 实验列表、实验详情、代码提交与结果查看
- 学习分析、能力画像、AI 学习报告
- AI 助手、自我评估、推荐练习
- LeetCode 风格练习、薄弱项训练
- 班级加入与个人信息管理

### 教师端

- 教师仪表盘、班级选择、班级列表与班级画像
- 实验列表、实验详情、实验创建与提交查看
- 班级分析、课程分析、实验数据分析
- AI 推荐、AI 对话、AI 整理、PPT 生成
- 教学文档中心、双语阅读、总结卡片
- AI 批改中心、评分细则维护、提交评审
- 课程知识库、RAG 分析、PTA 数据同步
- 系主任相关的教师管理与院系分析能力

### 管理员端

- 管理员仪表盘
- 用户管理、班级管理、实验管理
- 系统日志与个人信息管理

## 环境要求

- Node.js
- npm
- 推荐先启动后端服务，再启动前端开发服务

默认服务约定：

```text
前端开发服务：http://localhost:8080
业务后端服务：http://localhost:8081
RAG 服务：http://127.0.0.1:8001
爬虫服务：http://127.0.0.1:8100
```

## 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run serve

# 构建生产版本
npm run build

# 运行 lint 检查
npm run lint
```

开发服务器默认监听 `8080` 端口，可通过 `PORT` 环境变量覆盖：

```bash
PORT=8082 npm run serve
```

## 代理配置

前端代理配置位于 `vue.config.js`，当前开发环境代理如下：

```text
/api    -> http://localhost:8081
/rag    -> http://127.0.0.1:8001
/spider -> http://127.0.0.1:8100
```

其中 `/spider` 会移除路径前缀后转发到爬虫服务。

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
├── router/          # 路由配置与路由守卫
├── services/        # 数据服务与业务封装
├── store/           # Pinia 状态管理
├── utils/           # 工具函数
└── views/           # 页面视图
    ├── admin/       # 管理员端页面
    ├── student/     # 学生端页面
    ├── teacher/     # 教师端页面
    └── Login.vue    # 登录页
```

## 开发注意事项

- 新增或修改接口时，需要同步检查 `src/api/`、页面调用逻辑和字段命名是否一致。
- 路由鉴权和角色入口集中在 `src/router/index.js`，调整页面入口时需要同步检查路由守卫。
- 本地开发环境会在 `process.env.NODE_ENV === 'development'` 时加载 `src/mock/`。
- 涉及图表展示时优先复用 `src/utils/chartHelpers.js`、`src/utils/chartUtils.js` 等现有工具。
- 涉及错误提示时优先复用 `src/utils/errorMessage.js` 的统一处理逻辑。
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
