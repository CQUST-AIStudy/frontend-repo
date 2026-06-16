# CQUST-AIStudy 前端

基于 Vue 3 + TypeScript + Pinia + Vue Router 4 + Tailwind CSS 4 构建的智慧教学平台前端。

---

## 快速开始

```bash
pnpm install
pnpm serve       # 开发服务器
pnpm build       # 生产构建
pnpm lint        # 代码检查
```

---

## 演示模式（Demo Mode）

为方便在无后端环境下预览页面，前端内置了演示模式，**无需真实账号密码即可登录**。

### 开启 / 关闭

在以下两个文件中将 `DEMO_MODE` 设为 `true`（开启）或 `false`（关闭）：

| 文件 | 作用 |
|------|------|
| `src/store/index.js` 第 9 行 | 登录时跳过 API 调用，注入演示用户 |
| `src/router/index.js` 第 4 行 | 跳过教师"必须先选班级"的路由拦截 |

```js
// src/store/index.js
const DEMO_MODE = true   // 改为 false 恢复正式模式

// src/router/index.js
const DEMO_MODE = true   // 改为 false 恢复正式模式
```

### 使用方式

1. 启动开发服务器后打开登录页
2. 在角色选项卡中选择目标角色（教师 / 学生 / 管理员）
3. 账号密码任意填写，点击登录即可进入对应角色主页

### 演示账号数据

| 角色 | 姓名 | 用户名 |
|------|------|--------|
| 教师 | 演示教师 | demo_teacher |
| 学生 | 演示学生 | demo_student |
| 管理员 | 演示管理员 | demo_admin |

> 演示模式下所有数据请求仍会发送到后端，只有**登录本身**和**教师班级跳转**被绕过。若后端不可用，部分页面的数据展示可能为空或报错，属正常现象。

---

## 项目结构

```
src/
├── api/            # Axios 请求封装
├── assets/         # 静态资源
├── components/     # 公共组件
├── composables/    # 组合式函数
├── constants/      # 常量与认证工具
├── router/         # 路由配置与导航守卫
├── store/          # Pinia 状态管理
├── utils/          # 工具函数
└── views/          # 页面组件
    ├── admin/      # 管理员页面
    ├── common/     # 公共页面
    ├── student/    # 学生页面
    └── teacher/    # 教师页面
```

---

## 角色与路由

| 角色 | 首页路径 | 说明 |
|------|----------|------|
| 教师 | `/teacher/dashboard` | 需先在 `/teacher/select-class` 选择班级 |
| 学生 | `/student/dashboard` | — |
| 管理员 | `/admin/dashboard` | — |
