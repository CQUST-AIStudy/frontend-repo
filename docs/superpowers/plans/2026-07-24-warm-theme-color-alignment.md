# Warm Theme Color Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align primary-purpose frontend accents with the warm `#d18a61` theme while retaining meaningful status, syntax, illustration, and multi-series colors.

**Architecture:** Extend the existing CSS custom-property theme contract, then replace page-level primary blues with those tokens. Add a source audit test that rejects known primary-blue literals outside a small semantic allowlist, and use a shared warm chart palette for repeated chart roles.

**Tech Stack:** Vue 3, Pinia, Tailwind CSS 4, ECharts 5, Node.js built-in test runner, Vue CLI.

## Global Constraints

- `#d18a61` is the current primary visual reference.
- Success, warning, and danger retain their existing green, yellow, and red semantic colors.
- Syntax highlighting, code editor themes, and domain-meaningful illustration colors are not mechanically recolored.
- No layout, typography, component behavior, dependency, or backend contract changes.

---

### Task 1: Theme Contract and Color Audit

**Files:**
- Modify: `src/store/theme.js`
- Modify: `src/assets/styles/tailwind.css`
- Create: `src/utils/themeColors.js`
- Create: `tests/theme-color-alignment.test.cjs`

**Interfaces:**
- Produces: CSS tokens `--app-primary`, `--app-primary-strong`, `--app-primary-soft`, and tint variables.
- Produces: `APP_CHART_COLORS` and `getThemePrimaryColor()` for chart configurations.

- [ ] **Step 1: Add a failing source audit test**

Create a Node test that recursively reads `src`, flags `#409eff`, `#2563eb`, `#3b82f6`, `#1677ff`, and primary-purpose `blue-*` utilities, and exempts only `assets/styles/highlight.css`, editor theme code, and `components/knowledge-scenes/VariablesScene.vue`.

```js
const PRIMARY_BLUE = /#(?:409eff|2563eb|3b82f6|1677ff)\b|(?:text|bg|border)-(?:blue)-\d+/i
assert.deepEqual(findViolations(PRIMARY_BLUE, ALLOWLIST), [])
```

- [ ] **Step 2: Verify the audit fails on current sources**

Run: `node --test tests/theme-color-alignment.test.cjs`

Expected: FAIL and list current blue occurrences in application UI files.

- [ ] **Step 3: Align the default theme and add shared chart colors**

Set `DEFAULT_THEME.primaryColor` and matching root/Tailwind primary defaults to `#d18a61`. Export a theme-aware chart primary resolver plus a fixed supporting palette:

```js
export const APP_CHART_COLORS = ['#d18a61', '#6b8f6b', '#c49a3c', '#8b728e', '#c44b3f']

export function getThemePrimaryColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--app-primary').trim() || '#d18a61'
}
```

- [ ] **Step 4: Replace global interaction blues with theme tokens**

In `tailwind.css`, change editor-independent focus, selection, border, and background rules from blue literals to `var(--app-primary)`, `var(--app-primary-tint-12)`, and `var(--app-focus-ring)`.

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/theme-color-alignment.test.cjs`

Expected: Remaining failures name only page files handled by Tasks 2 and 3; theme files no longer fail.

- [ ] **Step 6: Commit**

```bash
git add src/store/theme.js src/assets/styles/tailwind.css src/utils/themeColors.js tests/theme-color-alignment.test.cjs
git commit -m "test: define warm theme color contract"
```

### Task 2: Student-Facing Primary Accents

**Files:**
- Modify: student view files reported by `tests/theme-color-alignment.test.cjs`, including `AbilityProfile.vue`, `AIAssistant.vue`, `AIReport.vue`, `Dashboard.vue`, `LearningAnalysis.vue`, `LeetCodePractice.vue`, `LeetCodeSearch.vue`, `Practice.vue`, and `SelfAssessment.vue`.

**Interfaces:**
- Consumes: CSS primary tokens and `APP_CHART_COLORS` / `getThemePrimaryColor()` from Task 1.
- Produces: theme-following student controls, emphasis states, and charts.

- [ ] **Step 1: Replace interactive and decorative primary blues**

Use arbitrary Tailwind values backed by variables, for example:

```html
class="text-[var(--app-primary)] hover:text-[var(--app-primary-strong)]"
class="bg-[var(--app-primary-soft)] border-[var(--app-primary)]"
```

For scoped CSS, use the same variables directly. Preserve green/red/yellow status branches.

- [ ] **Step 2: Convert student single-series charts and palettes**

Use `getThemePrimaryColor()` for a single emphasized series and `APP_CHART_COLORS` for multi-series charts. Convert hard-coded blue alpha fills to `rgba(var(--app-primary-rgb), 0.25)` where CSS accepts it; in JavaScript, derive the fill from the resolved primary color or use the chart palette with opacity.

- [ ] **Step 3: Run the source audit**

Run: `node --test tests/theme-color-alignment.test.cjs`

Expected: No violations under `src/views/student`; any remaining failures are teacher view files.

- [ ] **Step 4: Commit**

```bash
git add src/views/student
git commit -m "style: align student views with warm theme"
```

### Task 3: Teacher-Facing Primary Accents and Charts

**Files:**
- Modify: teacher view files reported by `tests/theme-color-alignment.test.cjs`, including `AIChat.vue`, `BilingualRead.vue`, `ClassAnalysis.vue`, `ClassDetailedAnalysis.vue`, `ClassList.vue`, `CourseAnalysis.vue`, `DepartmentAnalytics.vue`, `ExperimentDetail.vue`, `GradingCenter.vue`, `KnowledgeBase.vue`, `MyTeachingAnalysis.vue`, `SubmissionReview.vue`, `SummaryCard.vue`, and `TeacherAIManagement.vue`.

**Interfaces:**
- Consumes: CSS primary tokens and shared chart helpers from Task 1.
- Produces: theme-following teacher controls, document badges, score accents, and charts.

- [ ] **Step 1: Replace teacher interaction blues**

Convert action links, info panels used as general emphasis, button borders, selected states, and decorative icons to primary variables. Keep true status colors unchanged.

- [ ] **Step 2: Update teacher chart roles**

Use primary color for the emphasized or 60-79 score band and the coordinated shared palette for multiple score bands. Keep green for high/success, yellow for warning, and red for low/danger.

- [ ] **Step 3: Make the audit pass**

Run: `node --test tests/theme-color-alignment.test.cjs`

Expected: PASS with zero unapproved primary-blue occurrences.

- [ ] **Step 4: Commit**

```bash
git add src/views/teacher
git commit -m "style: align teacher views with warm theme"
```

### Task 4: Regression Verification

**Files:**
- Modify only files needed to correct verification findings.

**Interfaces:**
- Consumes: completed theme alignment.
- Produces: buildable frontend with visually coherent representative pages.

- [ ] **Step 1: Run the full test set**

Run: `node --test tests/*.test.cjs`

Expected: all tests PASS.

- [ ] **Step 2: Run lint and production build**

Run: `npm run lint`

Expected: exit code 0 with no new lint errors.

Run: `npm run build`

Expected: exit code 0 and production assets generated successfully.

- [ ] **Step 3: Visually inspect representative routes**

Start the existing frontend dev server and inspect at desktop and mobile widths: student dashboard, ability profile, LeetCode search/practice, teacher class analysis, knowledge base, and AI management. Confirm no unrelated primary blue remains, controls remain readable, chart series remain distinguishable, and statuses retain their semantics.

- [ ] **Step 4: Re-run focused verification after any correction**

Run: `node --test tests/theme-color-alignment.test.cjs && npm run build`

Expected: both commands exit successfully.

- [ ] **Step 5: Commit verification corrections, if any**

```bash
git add src tests
git commit -m "fix: resolve warm theme visual regressions"
```
