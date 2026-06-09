# 数据结构课程 AI 教学辅助系统前端

## 项目简介
本仓库是一个面向学生、教师和管理员的前端应用，用于支撑课程实验管理、学习分析、AI 辅助教学、课程知识库、RAG 问答、PTA 数据同步以及 LeetCode 练习与抓取等功能。

项目基于 Vue 3 和 Vue CLI 构建，使用路由、状态管理、接口封装和一组自定义 UI 组件组织各业务页面。登录后会根据角色进入不同工作台，并结合路由守卫、权限和班级选择状态控制可访问页面。

## 技术栈
- Vue 3
- Vue CLI / `vue-cli-service`
- Vue Router 4
- Pinia
- Axios
- Tailwind CSS 4 / PostCSS
- ECharts
- CodeMirror 6 / `vue-codemirror`
- Markdown 解析与安全处理：`marked`、`markdown-it`、`dompurify`
- 文档与报告导出：`docx`、`jspdf`、`jspdf-autotable`、`html2canvas`、`file-saver`、`pdf-lib`

## 功能概览

### 学生端
- 首页总览、实验列表、实验详情、实验提交与结果查看
- 学情分析、AI 报告生成、AI 学习助手
- 班级加入、推荐练习
- LeetCode 搜索、LeetCode 练习、LeetCode 演示
- 错题专项训练、能力画像、个人设置

### 教师端
- 教师首页、班级列表、班级分析、班级画像
- 实验创建、实验列表、实验详情、学生提交列表、提交详情
- AI 批改中心、评分标准编辑、批改详情、提交评审
- 课程知识库、RAG 分析
- AI 对话、AI 组织、AI 推荐、教学建议
- 文档中心、双语阅读、AI 摘要卡片、PPT 生成
- 课程分析、院系教师管理、院系统计、教师 AI 管理
- PTA 数据同步、LeetCode 题库管理

### 管理员端
- 仪表盘
- 用户管理、班级管理、实验管理
- 系统日志
- LeetCodeClaw 状态查看
- 个人设置

## 运行要求
- Node.js
- npm

建议先启动后端与相关依赖服务，再启动前端：
- 业务后端：`http://localhost:8081`
- RAG 服务：`http://127.0.0.1:8001`
- 爬虫服务：`http://127.0.0.1:8100`
- LeetCodeClaw 服务：`http://127.0.0.1:10170`

## 安装与运行
```bash
npm install
npm run serve
npm run build
npm run lint
```

前端开发服务默认监听 `8080` 端口，可通过 `PORT` 覆盖：

```bash
PORT=8082 npm run serve
```

Windows PowerShell：

```powershell
$env:PORT=8082; npm run serve
```

## 本地代理配置
开发环境代理配置位于 `vue.config.js`：

```text
/api             -> http://localhost:8081
/rag             -> http://127.0.0.1:8001
/spider          -> http://127.0.0.1:8100
/leetcode-claw   -> http://127.0.0.1:10170
```

说明：
- `/spider` 会去掉前缀后转发到爬虫服务。
- `/leetcode-claw` 会去掉前缀后转发到 LeetCodeClaw 服务。
- 业务接口默认通过同源路径访问，再由开发代理转发到后端。

## 运行时配置
运行时基地址在 `src/config/runtime.js` 中统一管理，支持以下环境变量：

- `VUE_APP_API_BASE_URL`
- `VUE_APP_RAG_API_BASE_URL`

建议在本地使用 `.env.local` 或 `.env.development.local` 之类文件覆盖地址，不要把真实环境地址和敏感配置提交到仓库。

## 登录与权限流转
- 登录页支持学生、教师、管理员三种角色。
- 开发模式下会自动填充示例账号，便于本地调试。
- 学生登录后进入学生工作台。
- 教师登录后如果还未选择班级，会先进入班级选择页，再进入教师工作台。
- 管理员登录后进入管理员仪表盘。
- 路由守卫会检查登录态、角色、权限和班级选择状态，不满足条件时会重定向到对应页面。

开发模式默认示例账号：

```text
teacher / password123
student / password123
admin / password123
```

## 项目结构
```text
src/
├── api/            # 接口封装
├── assets/         # 图片、字体、样式等静态资源
├── components/     # 通用组件和 UI 基础组件
├── composables/    # 组合式逻辑
├── config/         # 运行时配置
├── constants/      # 常量与本地存储键
├── mock/           # 开发态模拟数据
├── router/         # 路由与路由守卫
├── services/       # 业务服务与消息封装
├── store/          # Pinia 状态管理
├── utils/          # 工具函数
└── views/          # 页面视图
    ├── admin/
    ├── student/
    └── teacher/
```

## 开发注意事项
- `src/main.js` 在开发模式下会自动引入 `src/mock`，便于局部调试。
- 前后端接口字段、返回值和状态码变更时，需要同步检查页面调用和类型使用。
- 教师端页面很多都依赖当前已选班级，切换班级后要重新确认页面状态。
- 生成报告、导出文档、AI 对话、RAG 检索等功能都依赖对应后端服务是否启动。
- 不要在前端仓库中提交本地环境文件、Token、Cookie 或生产服务地址。

## 常见问题

### 页面打开后又回到登录页
检查本地是否有有效登录态，并确认 `token` 与 `userInfo` 是否被正确写入浏览器存储。

### 教师端功能不可访问
先确认教师是否已选择班级，再确认当前账号是否具备对应权限。

### RAG、PTA 或 LeetCodeClaw 相关页面报错
先检查对应服务是否已启动，再确认开发代理地址是否正确。

### 前端启动正常但接口请求失败
优先检查业务后端是否运行在 `http://localhost:8081`，以及前端代理配置是否和当前环境一致。
