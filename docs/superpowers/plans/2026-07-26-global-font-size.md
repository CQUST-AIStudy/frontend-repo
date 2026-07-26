# Global Font Size Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将前端全局根基准字号统一设置为 `17px`。

**Architecture:** 仅修改全局基础样式中的 `html` 规则，让所有 `rem` 尺寸继承新的根字号；保留现有显式 `px` 尺寸，以降低布局风险。该改动不新增依赖或运行时逻辑。

**Tech Stack:** Vue 3、Tailwind CSS 4、CSS

## Global Constraints

- 根基准字号必须精确为 `17px`。
- 不修改组件中显式使用 `px` 的字号。
- 不新增字号设置面板、响应式字号切换或依赖。

---

### Task 1: 设置并验证全局根字号

**Files:**
- Modify: `src/assets/styles/tailwind.css`

**Interfaces:**
- Consumes: 浏览器根元素 `html` 的 CSS 继承机制。
- Produces: 全站 `1rem = 17px` 的基准样式。

- [ ] **Step 1: 修改全局基础样式**

在 `@layer base` 内现有 `html` 规则加入：

```css
html {
  font-size: 17px;
  background: var(--app-bg);
}
```

- [ ] **Step 2: 检查改动范围**

Run: `git diff -- src/assets/styles/tailwind.css`

Expected: 仅新增一行 `font-size: 17px;`。

- [ ] **Step 3: 构建验证**

Run: `npm run build`

Expected: 构建成功且退出码为 `0`。

- [ ] **Step 4: 提交实现**

```bash
git add src/assets/styles/tailwind.css docs/superpowers/plans/2026-07-26-global-font-size.md
git commit -m "style: increase global base font size"
```
