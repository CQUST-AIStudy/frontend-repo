# 前端潜在 Bug 清单

> 审查范围：路由权限、登录态与用户状态、接口调用、`v-html`/Markdown 渲染、定时器与事件清理、构建结果。
> 验证时间：2026-06-04。

## 1. 未清洗 HTML / Markdown 渲染可能导致 XSS

**严重程度：高**

多个页面将接口、AI、RAG 或推荐内容转换为 HTML 后通过 `v-html` 渲染，其中部分链路没有使用 `DOMPurify.sanitize`，或允许 Markdown 原始 HTML。

证据：

- `src/views/teacher/components/ResultBlock.vue:25`：`v-html="renderedHtml"` 直接渲染。
- `src/views/teacher/components/ResultBlock.vue:39`：`new MarkdownIt({ html: true, ... })` 允许原始 HTML。
- `src/views/teacher/components/ResultBlock.vue:43`：`renderedHtml = computed(() => md.render(props.result))` 未清洗。
- `src/views/teacher/KnowledgeBase.vue:212`：知识库问答内容使用 `v-html="renderMarkdown(msg.content)"`。
- `src/views/teacher/KnowledgeBase.vue:491`：`renderMarkdown` 只做正则替换，没有 HTML 转义或清洗。
- `src/views/teacher/GeneratePPT.vue:159`：PPT 预览使用 `v-html="formatSlideContent(slide.content)"`。
- `src/views/teacher/GeneratePPT.vue:308`：`formatSlideContent` 只做字符串替换，没有清洗。
- `src/views/student/Practice.vue:38`、`101`、`178`：推荐练习说明使用 `v-html="getFormattedDescription(...)"`。
- `src/views/student/Practice.vue:482`：`getFormattedDescription` 直接拼接 HTML，没有清洗。

影响：

- AI/RAG 返回内容、上传文档解析内容、推荐练习说明或后端数据中如果包含恶意 HTML，可能在用户浏览器执行脚本。
- 教师端与学生端都涉及该风险。

建议修复：

- 封装统一的安全 Markdown 渲染函数，默认禁用原始 HTML。
- 所有 `v-html` 输出统一经过 `DOMPurify.sanitize`。
- `MarkdownIt` 默认使用 `html: false`，只有明确可信内容才允许 HTML。
- 对简单换行/粗体转换场景，先进行 HTML 转义，再追加允许的标签。

## 2. 提交详情页“下载代码”按钮不会下载

**严重程度：中**

`src/views/teacher/SubmissionDetail.vue:113` 的点击表达式为：

```vue
@click="downloadCode; fileDropdownOpen = false"
```

这里仅引用了 `downloadCode` 函数，没有执行调用。

影响：

- 用户点击“下载代码”后只会关闭下拉菜单，不会触发文件下载。

建议修复：

```vue
@click="downloadCode(); fileDropdownOpen = false"
```

或封装为明确方法，例如 `handleDownloadCode()`。

## 3. 权限判断可能放宽访问控制

**严重程度：中**

`src/router/index.js:350` 的 `hasAnyPermission` 使用 `some`：

```js
return requiredPermissions.some(p => userPermissions.includes(p))
```

但部分路由声明多个权限，例如 `src/router/index.js:172`：

```js
meta: { requiredPermissions: ['view_course_classes', 'analyze_course_classes'] }
```

影响：

- 如果业务语义是“必须同时具备所有权限”，当前逻辑会让只拥有其中一个权限的用户进入。
- 教师菜单侧边栏也有类似逻辑：`src/views/teacher/Layout.vue:379`。

建议修复：

- 明确权限数组语义：
  - 若表示“任一权限即可”，保留当前逻辑并改名为 `anyPermissions`。
  - 若表示“全部权限必须满足”，改为 `every`。
- 路由守卫与菜单显隐逻辑保持一致。

## 4. 管理端定时器未在卸载时清理

**严重程度：中**

`src/views/admin/Layout.vue:262` 在 `onMounted` 中创建定时器：

```js
setInterval(checkPtaCookie, 5 * 60 * 1000)
```

未看到对应的 `clearInterval`。

影响：

- 频繁切换/重建管理端布局时可能产生重复轮询。
- 可能造成额外接口请求和内存占用。

建议修复：

- 使用变量保存 timer id。
- 在 `onUnmounted` 或 `onBeforeUnmount` 中执行 `clearInterval`。

## 5. 学生 ID 读取字段可能与后端响应不兼容

**严重程度：中**

`src/constants/auth.js:74` 的 `getCurrentStudentId` 只读取：

```js
userInfo?.usernum ?? userInfo?.studentId
```

`src/views/student/LeetCodePractice.vue:1322` 提交 LeetCode 代码时依赖该函数：

```js
const studentId = getCurrentStudentId()
```

影响：

- 如果后端登录用户字段只返回 `id`、`student_id` 或其他命名，`studentId` 会变成 `null`。
- 可能导致 LeetCode 提交、薄弱训练记录、推荐反馈归档失败或落入匿名/错误用户桶。

建议修复：

- 与后端用户模型确认学生编号字段。
- 兼容常见字段，例如 `userInfo.usernum ?? userInfo.studentId ?? userInfo.student_id ?? userInfo.id`。
- 如无法取得有效学生 ID，应在提交前给出明确错误提示，而不是静默提交。

## 6. 401 拦截后状态源可能短暂不一致

**严重程度：中低**

项目同时维护：

- `localStorage.token`
- `localStorage.userInfo`
- Pinia 持久化的 `localStorage.user`

`src/api/index.js:72` 在非登录接口 401 时调用 `clearAuthStorage()` 并跳转登录页；该函数会清理上述认证键。但当前运行中的 Pinia store 实例不会自动同步置空，直到页面跳转或刷新。

影响：

- 在跳转前的短时间内，组件可能仍读取到旧的 `userStore.userInfo` 或 `userStore.token`。
- 如果未来改成 SPA 内部路由跳转而不是 `window.location.assign`，不一致风险会扩大。

建议修复：

- 统一认证状态来源，或在 401 拦截中通过 store action 执行登出。
- 避免 API 层直接操作多个存储源而不通知 Pinia。

## 7. 构建产物体积超限，存在加载性能风险

**严重程度：低**

`npm run build` 通过，但提示多个资源超过推荐体积：

- `fonts/ZiYouLangManTi-2.4535956f.ttf`：约 6.21 MiB。
- `login-background.png`：约 2.19 MiB。
- `img/login-tech-background.53df3a61.png`：约 1.18 MiB。
- 多个 JS chunk 超过 244 KiB。
- app 入口合计约 997 KiB。

影响：

- 首屏加载时间变长。
- 弱网环境下登录页和主应用体验变差。

建议修复：

- 字体子集化或按需加载。
- 压缩登录背景图片，优先使用 WebP/AVIF。
- 对重型页面和图表库进一步懒加载。

## 已验证结果

- `npm run build`：通过，有资源体积警告。
- `npm run lint`：通过，无 lint 错误。
- 本清单仅记录潜在 bug，未修改源码实现。

