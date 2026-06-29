# Student Dashboard Icon Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mixed emoji/illustration icons on the student dashboard homepage with one consistent linear icon system, without changing layout, routing, API calls, or card structure.

**Architecture:** Keep the change isolated to the existing dashboard page. Reuse the project's `LucideIcon` wrapper, convert static quick-entry icon config from emoji strings to icon names, and add small helper mappers for error and feedback icon rendering so data flow stays unchanged.

**Tech Stack:** Vue 3 SFC, existing dashboard page, `LucideIcon`, ECharts, npm build verification

---

### Task 1: Replace homepage emoji and mixed illustrations with Lucide icons

**Files:**
- Modify: `D:\AI-study\frontend-repo\AI_Ds-vue\src\views\student\Dashboard.vue`
- Test: `D:\AI-study\frontend-repo\AI_Ds-vue\src\views\student\Dashboard.vue`

- [ ] **Step 1: Update imports and static icon configuration**

```js
import LucideIcon from '@/components/LucideIcon.vue'

const quickEntries = [
  { iconName: 'clipboard-text', label: '实验列表', path: '/student/experiments', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', color: '#2563eb' },
  { iconName: 'circle-x', label: '错题本', path: '/student/wrong-notebook', bg: 'linear-gradient(135deg,#fef2f2,#fce4e4)', color: '#dc2626' },
  { iconName: 'check', label: '推荐练习', path: '/student/practice', bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', color: '#059669' },
  { iconName: 'target', label: '专项训练', path: '/student/weakness-training', bg: 'linear-gradient(135deg,#faf5ff,#ede9fe)', color: '#7c3aed' },
  { iconName: 'brain', label: '知识图谱', path: '/student/knowledge-graph', bg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', color: '#ea580c' },
  { iconName: 'bot', label: 'AI 学习助手', path: '/student/ai-assistant', bg: 'linear-gradient(135deg,#eff6ff,#bfdbfe)', color: '#3b82f6' }
]
```

- [ ] **Step 2: Replace template emoji/icon slots with `LucideIcon`**

```vue
<span class="dash-icon-chip">
  <LucideIcon name="sparkles" :size="18" />
</span>

<span class="quick-entry-icon" :style="{ background: q.bg, color: q.color }">
  <LucideIcon :name="q.iconName" :size="20" :stroke-width="2.1" />
</span>
```

- [ ] **Step 3: Add helper mappers for dynamic error and feedback icons**

```js
function errIconName(err) {
  const t = err.errorType || err.judgeStatus || ''
  if (t.includes('运行') || t.includes('RUNTIME')) return 'bug'
  if (t.includes('输出') || t.includes('WRONG')) return 'circle-x'
  return 'alert-triangle'
}

function feedbackIconName(fb) {
  const source = `${fb.icon || ''} ${fb.type || ''} ${fb.msg || ''}`
  if (source.includes('AI') || source.includes('分析') || source.includes('建议')) return 'lightbulb'
  if (source.includes('完成') || source.includes('通过')) return 'circle-check'
  if (source.includes('截止') || source.includes('提醒')) return 'clock'
  return 'message-square'
}
```

- [ ] **Step 4: Add the minimum supporting styles for icon consistency**

```css
.dash-inline-icon,
.dash-graphic-icon,
.dash-feedback-icon,
.dash-quick-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 5: Verify the page still builds**

Run: `npm run build`  
Expected: Vite production build completes successfully without Vue template or import errors.

