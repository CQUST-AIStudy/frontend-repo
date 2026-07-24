# Login Warm Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `/login` with a `#cb8053` warm terracotta theme while preserving every existing login, registration, validation, persistence, and navigation behavior.

**Architecture:** Keep the existing `Login.vue` component and its script logic intact. Change only template utility classes and CSS-driven decoration, with a small Node source-contract test guarding the required palette, responsive behavior, and removal of the former blue visual tokens.

**Tech Stack:** Vue 3 SFC, JavaScript, Tailwind CSS utility classes, Node.js built-in test runner, npm/Vue CLI.

## Global Constraints

- Primary color is exactly `#cb8053`; page background and primary text align with `#faf6ef` and `#3d3529`.
- Preserve login/register tabs, all form fields, three-role selection, password visibility, remember-password, agreement validation, toast/loading states, API calls, auth storage, and route destinations.
- Do not change APIs, router, stores, authentication persistence, or backend code.
- Do not add image assets, fonts, packages, or lockfile changes.
- Keep error/success semantic colors distinct from the primary palette.
- Support desktop two-column and mobile single-column layouts without horizontal overflow or clipped registration controls.

---

### Task 1: Add the Login Visual Contract Test

**Files:**
- Create: `tests/login-warm-theme.test.cjs`
- Read: `src/views/Login.vue`

**Interfaces:**
- Consumes: UTF-8 source text from `src/views/Login.vue`.
- Produces: a Node test contract requiring the approved palette, warm decorative hooks, responsive layout markers, and absence of legacy blue theme tokens.

- [ ] **Step 1: Write the failing source-contract test**

```js
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const loginPath = path.resolve(__dirname, '../src/views/Login.vue')
const source = fs.readFileSync(loginPath, 'utf8')

test('login page uses the approved warm palette', () => {
  assert.match(source, /#cb8053/i)
  assert.match(source, /#faf6ef/i)
  assert.match(source, /#3d3529/i)
  assert.doesNotMatch(source, /#(?:0074ff|006cff|1594ff|087cff|0062dd|1688ff|0069eb|13d6ff|3185ff)\b/i)
})

test('login page keeps warm decorative and responsive layout hooks', () => {
  assert.match(source, /login-decoration/)
  assert.match(source, /max-\[1180px\]:grid-cols-\[minmax\(0,1fr\)\]/)
  assert.match(source, /max-\[720px\]:overflow-y-auto/)
  assert.match(source, /max-\[720px\]:hidden/)
})

test('login and registration behavior remains wired', () => {
  assert.match(source, /@submit\.prevent="handleLogin"/)
  assert.match(source, /@submit\.prevent="handleRegister"/)
  assert.match(source, /v-for="role in roleOptions"/)
  assert.match(source, /v-model="agreementAccepted"/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/login-warm-theme.test.cjs`

Expected: FAIL because `Login.vue` still contains legacy blue tokens and lacks `login-decoration` and the mobile overflow marker.

- [ ] **Step 3: Commit the failing contract**

```bash
git add tests/login-warm-theme.test.cjs
git commit -m "test: define warm login page contract"
```

### Task 2: Replace the Desktop Login Visual System

**Files:**
- Modify: `src/views/Login.vue` (template root, brand section, feature items, form card, tabs, fields, buttons, checkboxes, links, toast classes)
- Test: `tests/login-warm-theme.test.cjs`

**Interfaces:**
- Consumes: existing component state and handlers without signature changes.
- Produces: the same DOM controls and event bindings with the warm visual palette and `login-decoration` CSS hook.

- [ ] **Step 1: Replace the page background and add CSS-only decoration**

Use the following structure at the page root while retaining `:style="pageBackgroundStyle"` for compatibility:

```vue
<div
  class="relative isolate min-h-screen min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#faf6ef] text-[#3d3529] [background-image:radial-gradient(circle_at_12%_18%,rgba(203,128,83,0.24),transparent_28%),radial-gradient(circle_at_82%_82%,rgba(107,143,107,0.12),transparent_24%),linear-gradient(135deg,#faf6ef_0%,#f5e7da_48%,#efd7c8_100%)]"
  :style="pageBackgroundStyle"
>
  <div class="login-decoration pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true"></div>
```

The decoration must remain non-interactive and low contrast. Replace the upper-right blue label with `text-[rgba(119,77,53,0.58)]`.

- [ ] **Step 2: Restyle the brand and capability area**

Apply these exact visual tokens while preserving the existing `features` loop and text:

```vue
<h1 class="m-0 text-[61px] font-semibold leading-[1.1] text-[#3d3529] [text-shadow:0_10px_28px_rgba(91,55,35,0.1)] max-[720px]:text-[28px]">
```

Use `bg-[linear-gradient(90deg,#cb8053,#a8613f)]` for the accent bar, `text-[#735c4d]` for the subtitle, and warm translucent surfaces (`rgba(255,250,245,0.68)`) for capability icons. Keep the auxiliary green only on the existing feature item that already has a distinct semantic accent.

- [ ] **Step 3: Restyle the form card and primary controls**

Use a card surface equivalent to:

```vue
class="relative w-full max-w-[554px] overflow-hidden rounded-[24px] border border-[rgba(168,97,63,0.18)] bg-[rgba(255,252,248,0.94)] text-[#3d3529] shadow-[0_28px_70px_rgba(111,67,42,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl"
```

Replace primary blue occurrences in tab labels, tab indicator, selected role, submit buttons, checkbox accents, links, input focus rings, and password-button hover states with `#cb8053` and darker `#a8613f`. Retain red error classes and green success classes.

- [ ] **Step 4: Add the decoration CSS without external assets**

Add a scoped style block if one does not exist, or append to the current scoped style block:

```css
.login-decoration {
  background-image:
    linear-gradient(rgba(203, 128, 83, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(203, 128, 83, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(90deg, #000, rgba(0, 0, 0, 0.2) 62%, transparent);
}

.login-decoration::before,
.login-decoration::after {
  position: absolute;
  content: '';
  border: 1px solid rgba(203, 128, 83, 0.2);
  border-radius: 999px;
}

.login-decoration::before {
  width: 320px;
  height: 320px;
  left: 8%;
  top: 18%;
}

.login-decoration::after {
  width: 180px;
  height: 180px;
  left: 30%;
  bottom: 12%;
}
```

- [ ] **Step 5: Run the focused test**

Run: `node --test tests/login-warm-theme.test.cjs`

Expected: PASS for the palette and behavior assertions; the responsive assertion may remain failing until Task 3.

- [ ] **Step 6: Commit the desktop restyle**

```bash
git add src/views/Login.vue
git commit -m "feat: restyle login page with warm palette"
```

### Task 3: Finish Responsive and Accessibility States

**Files:**
- Modify: `src/views/Login.vue` (responsive utilities and decoration media query)
- Test: `tests/login-warm-theme.test.cjs`

**Interfaces:**
- Consumes: warm desktop layout from Task 2.
- Produces: single-column mobile layout, scroll-safe registration form, hidden nonessential decoration, and visible focus states.

- [ ] **Step 1: Make the mobile root and main container scroll-safe**

Add `max-[720px]:overflow-y-auto` to the page root. Preserve the existing desktop grid breakpoint and ensure main keeps:

```text
max-[1180px]:grid-cols-[minmax(0,1fr)]
max-[720px]:flex
max-[720px]:min-h-[100dvh]
max-[720px]:justify-center
```

Keep the feature grid and large decorations marked `max-[720px]:hidden`; do not hide the brand heading or form card.

- [ ] **Step 2: Add visible keyboard focus and reduced-motion behavior**

Every tab, role, password toggle, submit button, checkbox, agreement link, and input shell must retain or receive a visible focus treatment based on:

```text
focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(203,128,83,0.18)]
```

Keep existing `motion-reduce:*` classes on transitions. Add this decoration rule:

```css
@media (max-width: 720px) {
  .login-decoration {
    display: none;
  }
}
```

- [ ] **Step 3: Run the complete focused contract**

Run: `node --test tests/login-warm-theme.test.cjs`

Expected: 3 tests PASS, 0 tests FAIL.

- [ ] **Step 4: Run lint on source files**

Run: `npm run lint`

Expected: exit code 0. If unrelated pre-existing lint failures occur, record their exact paths and confirm no new violation points to `src/views/Login.vue`.

- [ ] **Step 5: Commit responsive and accessibility work**

```bash
git add src/views/Login.vue tests/login-warm-theme.test.cjs
git commit -m "feat: complete responsive warm login experience"
```

### Task 4: Final Build and Repository Hygiene Verification

**Files:**
- Verify: `src/views/Login.vue`
- Verify: `tests/login-warm-theme.test.cjs`
- Verify: `.gitignore`
- Verify: `.dockerignore`

**Interfaces:**
- Consumes: completed login redesign.
- Produces: verified production build with no generated artifacts staged for commit.

- [ ] **Step 1: Run focused tests and production build**

Run: `node --test tests/login-warm-theme.test.cjs`

Expected: 3 tests PASS, 0 tests FAIL.

Run: `npm run build`

Expected: `DONE  Build complete.` and exit code 0.

- [ ] **Step 2: Inspect repository hygiene**

Run: `git status --short`

Expected: no `dist/`, logs, caches, environment files, or dependency directories are newly staged. Confirm `.gitignore` and `.dockerignore` exist and already cover build artifacts; update only if the verification discovers a concrete missing pattern created by this task.

- [ ] **Step 3: Review the final diff for scope**

Run: `git diff HEAD~2 -- src/views/Login.vue tests/login-warm-theme.test.cjs`

Expected: changes are limited to login-page presentation, responsive/accessibility classes, decoration CSS, and the visual contract test; script business logic is unchanged.

- [ ] **Step 4: Commit any verification-only ignore fix if required**

Only when Step 2 found a missing concrete pattern:

```bash
git add .gitignore .dockerignore
git commit -m "chore: ignore login build artifacts"
```

If no ignore fix is required, do not create an empty commit.
