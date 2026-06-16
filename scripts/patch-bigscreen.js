const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/views/admin/ExperimentBigScreen.vue');
let content = fs.readFileSync(filePath, 'utf8');

// ============================================================
// 1. TEMPLATE: Replace screen-grid section
// ============================================================
const gridStartMarker = '      <!-- =====';
const gridEndMarker = '      </main>';

const gridStartIdx = content.indexOf('      <main class="screen-grid">');
const gridEndIdx = content.indexOf('      </main>', gridStartIdx) + '      </main>'.length;

const newGridSection = `      <!-- ===== 实验运行概览 ===== -->
      <section class="overview-grid" :aria-busy="loading">
        <div class="overview-card">
          <span class="overview-label">今日提交</span>
          <strong>{{ todaySubmissions }}</strong>
          <small>份提交</small>
        </div>
        <div class="overview-card">
          <span class="overview-label">已评分</span>
          <strong>{{ scoredCount }}</strong>
          <small>覆盖率 {{ gradingRate }}%</small>
        </div>
        <div class="overview-card">
          <span class="overview-label">平均分</span>
          <strong>{{ avgScoreDisplay }}</strong>
          <small>满分 100</small>
        </div>
        <div class="overview-card">
          <span class="overview-label">活跃实验</span>
          <strong>{{ activeExpCount }}</strong>
          <small>个进行中</small>
        </div>
        <div class="overview-card">
          <span class="overview-label">最近提交</span>
          <strong>{{ lastSubmitTime }}</strong>
          <small>最新活动</small>
        </div>
      </section>

      <!-- ===== 图表面板 ===== -->
      <main class="screen-grid">
        <!-- 完成率趋势 -->
        <section class="panel">
          <div class="panel-title">
            <span>完成率趋势</span>
            <small>近期实验提交覆盖</small>
          </div>
          <div ref="completionChartRef" class="chart"></div>
        </section>

        <!-- 成绩分布 -->
        <section class="panel">
          <div class="panel-title">
            <span>成绩分布</span>
            <small>已评分提交</small>
          </div>
          <div ref="scoreChartRef" class="chart"></div>
        </section>

        <!-- 运行阶段 -->
        <section class="panel">
          <div class="panel-title">
            <span>运行阶段</span>
            <small>未开始 / 进行中 / 已结束</small>
          </div>
          <div ref="stageChartRef" class="chart"></div>
        </section>

        <!-- 班级实验对比 (横跨3列整行) -->
        <section class="panel panel-full">
          <div class="panel-title">
            <span>班级实验对比</span>
            <small>完成率与平均成绩双指标</small>
          </div>
          <div ref="classCompareChartRef" class="chart chart-full"></div>
        </section>
      </main>`;

if (gridStartIdx > 0 && gridEndIdx > gridStartIdx) {
  // Need to include the comment line before <main>
  let start = gridStartIdx;
  // Go back to include the comment line
  const beforeMain = content.lastIndexOf('<!--', gridStartIdx);
  if (beforeMain > 0 && beforeMain > gridStartIdx - 200) {
    start = beforeMain;
  }
  content = content.slice(0, start) + newGridSection + content.slice(gridEndIdx);
  console.log('✓ Template grid section replaced');
} else {
  console.error('✗ Could not find screen-grid section');
  console.log('gridStartIdx:', gridStartIdx, 'gridEndIdx:', gridEndIdx);
}

// ============================================================
// 2. TEMPLATE: Replace alert-center section (add 实时提交动态 + 评分实验排行)
// ============================================================
// Use <section class="alert-center"> as marker to avoid encoding issues
const alertStartIdx = content.indexOf('      <section class="alert-center">');
const alertEndIdx = content.indexOf('      <!-- ===== Footer ===== -->');

if (alertStartIdx > 0 && alertEndIdx > alertStartIdx) {
  const newAlertSection = `      <!-- ===== 预警 + 动态中心 ===== -->
      <section class="alert-center">
        <div class="alert-header">
          <div class="alert-title-row">
            <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span class="alert-title">预警与动态中心</span>
            <span class="alert-badge">{{ totalAlerts }} 项关注</span>
          </div>
          <small>实时监控学院实验教学的完成率风险、成绩风险、评分缺口、同步异常与最新动态</small>
        </div>
        <div class="alert-grid">
          <!-- 1: 低完成率班级 -->
          <div class="alert-card alert-danger">
            <div class="alert-card-head">
              <span class="alert-card-label">低完成率班级</span>
              <span class="alert-threshold">阈值 &lt; 40%</span>
            </div>
            <div class="alert-list">
              <div
                v-for="(item, idx) in lowCompletionTop5"
                :key="'lc-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.teacherName || '-' }} · {{ item.studentCount || 0 }}人</small>
                </div>
                <span class="alert-value danger">{{ item.completionRate }}%</span>
              </div>
              <div v-if="!lowCompletionTop5.length" class="alert-empty">暂无低完成率班级</div>
            </div>
          </div>

          <!-- 2: 实时提交动态 -->
          <div class="alert-card alert-info-alt">
            <div class="alert-card-head">
              <span class="alert-card-label">实时提交动态</span>
              <span class="alert-threshold">最近 5 条</span>
            </div>
            <div class="alert-list">
              <div
                v-for="(item, idx) in recentSubmissions"
                :key="'rs-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.studentName || item.userName || '未知学生' }}</strong>
                  <small>{{ item.experimentName || item.experiment_name || '实验' }} · {{ item.className || item.class_name || '-' }}</small>
                </div>
                <span class="alert-value info">{{ formatRelativeTime(item.submitTime) }}</span>
              </div>
              <div v-if="!recentSubmissions.length" class="alert-empty">暂无提交记录</div>
            </div>
          </div>

          <!-- 3: 评分实验排行 -->
          <div class="alert-card alert-warn">
            <div class="alert-card-head">
              <span class="alert-card-label">评分实验排行</span>
              <span class="alert-threshold">按平均分排序</span>
            </div>
            <div class="alert-list">
              <div
                v-for="(item, idx) in topScoreExperiments"
                :key="'ts-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.name }}</strong>
                  <small>提交 {{ item.totalCount || 0 }} 份 · 未评 {{ item.ungradedCount || 0 }}</small>
                </div>
                <span class="alert-value warn">{{ item.avgScore }}分</span>
              </div>
              <div v-if="!topScoreExperiments.length" class="alert-empty">暂无评分数据</div>
            </div>
          </div>

          <!-- 4: 同步异常 -->
          <div class="alert-card alert-critical">
            <div class="alert-card-head">
              <span class="alert-card-label">同步异常</span>
              <span class="alert-threshold">FAILED / 48h未更新</span>
            </div>
            <div class="alert-list">
              <div
                v-for="(item, idx) in syncAnomalyTop5"
                :key="'sa-' + idx"
                class="alert-row"
                :style="{ '--i': idx }"
              >
                <span class="alert-rank" :class="{ 'rank-top': idx < 3 }">{{ idx + 1 }}</span>
                <div class="alert-row-info">
                  <strong>{{ item.className }}</strong>
                  <small>{{ item.reason }}</small>
                </div>
                <span class="alert-value critical">{{ item.lastSync || '从未' }}</span>
              </div>
              <div v-if="!syncAnomalyTop5.length" class="alert-empty">暂无同步异常</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 学院实验热力（紧凑） ===== -->
      <section v-if="classHeat.length >= 4" class="heat-compact">
        <div class="panel-title">
          <span>学院实验热力</span>
          <small>按班级完成率聚合 · 显示 {{ Math.min(classHeat.length, 8) }} 个班级</small>
        </div>
        <div class="heat-compact-grid">
          <div
            v-for="(item, idx) in classHeat.slice(0, 8)"
            :key="'hc-' + item.name"
            class="heat-compact-cell"
            :style="{ '--level': item.level, '--i': idx }"
          >
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.teacherName || '未绑定教师' }}</span>
            </div>
            <div class="heat-compact-right">
              <b>{{ item.completionRate }}%</b>
              <span class="heat-bar-wrap">
                <span class="heat-bar" :style="{ width: item.completionRate + '%' }"></span>
              </span>
            </div>
          </div>
          <div v-if="!classHeat.length" class="empty-state">暂无班级实验数据</div>
        </div>
      </section>

`;

  content = content.slice(0, alertStartIdx) + newAlertSection + content.slice(alertEndIdx);
  console.log('✓ Alert center section replaced');
} else {
  console.error('✗ Could not find alert center section');
}

// ============================================================
// 3. SCRIPT: Add new computed properties before the /* ---------- Lifecycle ---------- */
// ============================================================
const lifecycleMarker = '/* ---------- Lifecycle ---------- */';
const lifecycleIdx = content.indexOf(lifecycleMarker);

if (lifecycleIdx > 0) {
  const newComputed = `/* ---------- 实验运行概览 ---------- */
const todaySubmissions = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return submissions.value.filter(item => {
    const time = item.submitTime || item.date || item.submittedAt
    return time && new Date(time) >= today
  }).length
})

const scoredCount = computed(() => scoredSubmissions.value.length)

const avgScoreDisplay = computed(() => {
  const val = avgScore.value
  return val ? val.toFixed(1) : '-'
})

const activeExpCount = computed(() => activeExperimentCount.value)

const lastSubmitTime = computed(() => {
  const times = submissions.value
    .map(item => item.submitTime || item.date || item.submittedAt)
    .filter(Boolean)
    .map(t => new Date(t).getTime())
  if (!times.length) return '暂无'
  const latest = Math.max(...times)
  const diff = Date.now() - latest
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return mins + '分钟前'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + '小时前'
  const days = Math.floor(hours / 24)
  return days + '天前'
})

/* ---------- 实时提交动态 & 评分排行 ---------- */
const recentSubmissions = computed(() =>
  submissions.value
    .filter(s => s.submitTime || s.date || s.submittedAt)
    .sort((a, b) => {
      const ta = new Date(a.submitTime || a.date || a.submittedAt).getTime()
      const tb = new Date(b.submitTime || b.date || b.submittedAt).getTime()
      return tb - ta
    })
    .slice(0, 5)
)

const topScoreExperiments = computed(() =>
  experimentStats.value
    .filter(e => e.avgScore > 0)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)
)

function formatRelativeTime(timeStr) {
  if (!timeStr) return '-'
  const diff = Date.now() - new Date(timeStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return mins + '分钟前'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + '小时前'
  const days = Math.floor(hours / 24)
  return days + '天前'
}

`;
  content = content.slice(0, lifecycleIdx) + newComputed + content.slice(lifecycleIdx);
  console.log('✓ New computed properties added');
} else {
  console.error('✗ Could not find lifecycle marker');
}

// ============================================================
// 4. ECharts: Update font sizes (chartText calls)
// ============================================================
// chartText(11) -> chartText(12), chartText(12) -> chartText(13)
// Replace specific chartText calls
let ecEdits = 0;

// renderCompletionChart: chartText(12) -> chartText(13), chartText(11) -> chartText(12)
content = content.replace(/axisLabel:\s*\{\s*\.\.\.chartText\(12\)/g, (match) => {
  ecEdits++; return match.replace('12', '13');
});
content = content.replace(/axisLabel:\s*\{\s*\.\.\.chartText\(11\),\s*formatter:\s*'\{value\}%'/g, (match) => {
  ecEdits++; return match.replace('chartText(11)', 'chartText(12)');
});
// fontSize: 11 -> 12 in label
content = content.replace(/fontSize:\s*11,\s*\n\s*formatter:\s*'\{c\}%'/g, (match) => {
  ecEdits++; return match.replace('fontSize: 11', 'fontSize: 12');
});

// renderScoreChart: chartText(11) -> chartText(12)
content = content.replace(/legend:\s*\{\s*bottom:\s*0,\s*textStyle:\s*chartText\(11\)\s*\}/g, (match) => {
  ecEdits++; return match.replace('chartText(11)', 'chartText(12)');
});

// renderStageChart: chartText(11) -> chartText(12) (3 occurrences)
const stageChartTextCount = (content.match(/chartText\(11\)/g) || []).length;
content = content.replace(/chartText\(11\)/g, 'chartText(12)');

// renderClassCompareChart: chartText(12) -> chartText(13), chartText(11) -> chartText(12)
const remaining12 = (content.match(/chartText\(12\)/g) || []).length;
content = content.replace(/chartText\(12\)/g, 'chartText(13)');

ecEdits += stageChartTextCount + remaining12;

// tooltip formatter font-size:14px -> 15px
content = content.replace(/font-size:14px/g, 'font-size:15px');

// emptyChartTitle fontSize: 14 -> 15
content = content.replace(/fontSize:\s*14,\s*filter/g, 'fontSize: 15, filter');
content = content.replace(/fontSize:\s*14,\s*fontWeight/g, 'fontSize: 15, fontWeight');

console.log('✓ ECharts font sizes updated (' + ecEdits + ' edits)');

// ============================================================
// 5. STYLE: Update CSS font sizes and chart heights
// ============================================================
const styleEdits = [];

// Chart heights
content = content.replace('.chart { width: 100%; height: 220px; }', '.chart { width: 100%; height: 250px; }');
content = content.replace('.chart-wide { height: 240px; }', '.chart-full { height: 320px; }');
styleEdits.push('chart heights');

// .panel min-height: 280px -> 300px
content = content.replace('min-height: 280px; padding: var(--space-md);\n  border: 1px solid oklch(50% 0.02 250 / 0.14);\n  border-radius: var(--radius);\n  background: oklch(16% 0.015 250 / 0.72);', 'min-height: 300px; padding: var(--space-md);\n  border: 1px solid oklch(50% 0.02 250 / 0.14);\n  border-radius: var(--radius);\n  background: oklch(16% 0.015 250 / 0.72);');

// Font size increases
const fontReplacements = [
  ['.screen-kicker {', 'font-size: 13px;', 'font-size: 14px;'],
  ['screen-header h1', 'font-size: 30px;', 'font-size: 32px;'],
  ['.screen-time {', 'font-size: 12px;', 'font-size: 13px;'],
  ['.screen-time strong {', 'font-size: 22px;', 'font-size: 23px;'],
  ['.screen-button {', 'font-size: 13px;', 'font-size: 14px;'],
  ['.metric-label {', 'font-size: 12px;', 'font-size: 13px;'],
  ['.metric-tile strong {', 'font-size: 32px;', 'font-size: 33px;'],
  ['.metric-tile small {', 'font-size: 12px;', 'font-size: 13px;'],
  ['.risk-badge {', 'font-size: 11px;', 'font-size: 12px;'],
  ['.panel-title span {', 'font-size: 14px;', 'font-size: 15px;'],
  ['.panel-title small {', 'font-size: 12px;', 'font-size: 13px;'],
  ['.heat-cell strong {', 'font-size: 12px;', 'font-size: 13px;'],
  ['.heat-cell span', 'font-size: 11px;', 'font-size: 12px;'],
  ['.heat-right b {', 'font-size: 18px;', 'font-size: 20px;'],
  ['.alert-title {', 'font-size: 17px;', 'font-size: 18px;'],
  ['.alert-badge {', 'font-size: 12px;', 'font-size: 13px;'],
  ['.alert-card-label {', 'font-size: 13px;', 'font-size: 14px;'],
  ['.alert-threshold {', 'font-size: 10px;', 'font-size: 11px;'],
  ['.alert-rank {', 'font-size: 11px;', 'font-size: 12px;'],
  ['.alert-row-info strong {', 'font-size: 12px;', 'font-size: 13px;'],
  ['.alert-row-info small {', 'font-size: 11px;', 'font-size: 12px;'],
  ['.alert-value {', 'font-size: 15px;', 'font-size: 16px;'],
  ['.alert-empty {', 'font-size: 12px;', 'font-size: 13px;'],
  ['.screen-footer {', 'font-size: 11px;', 'font-size: 12px;'],
];

let fontEdits = 0;
for (const [selector, oldVal, newVal] of fontReplacements) {
  // Only replace the first occurrence that matches the context
  const regex = new RegExp(oldVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  if (matches) {
    content = content.replace(regex, newVal);
    fontEdits += matches.length;
  }
}
console.log('✓ CSS font sizes updated (' + fontEdits + ' changes)');

// ============================================================
// 6. STYLE: Update screen-grid, remove panel-map/panel-wide, add new styles
// ============================================================
// Replace .panel-map and .panel-wide styles
content = content.replace(
  '.panel-map  { grid-row: span 2; }\n.panel-wide { grid-column: span 2; }',
  '.panel-full { grid-column: span 3; }'
);

// Update screen-grid to remove dependency on panel-map row span
// Keep the same 3-column grid

// Add new styles before the /* ----- Alert Center ----- */
const alertCenterCssIdx = content.indexOf('/* ----- Alert Center ----- */');
if (alertCenterCssIdx > 0) {
  const newStyles = `/* ----- Overview Grid ----- */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.overview-card {
  position: relative; overflow: hidden;
  min-height: 90px; padding: var(--space-sm) var(--space-md);
  border: 1px solid oklch(50% 0.02 250 / 0.16);
  border-radius: var(--radius);
  background: oklch(16% 0.015 250 / 0.72);
  backdrop-filter: blur(4px);
  transition: border-color 200ms var(--ease-out);
  box-shadow: inset 3px 0 0 oklch(65% 0.14 175);
}
.overview-card:nth-child(2) { box-shadow: inset 3px 0 0 oklch(65% 0.12 230); }
.overview-card:nth-child(3) { box-shadow: inset 3px 0 0 oklch(65% 0.16 80); }
.overview-card:nth-child(4) { box-shadow: inset 3px 0 0 oklch(65% 0.18 145); }
.overview-card:nth-child(5) { box-shadow: inset 3px 0 0 oklch(60% 0.10 280); }
.overview-card:hover { border-color: oklch(60% 0.06 210 / 0.30); }

.overview-label {
  color: oklch(72% 0.02 245); font-size: 12px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.overview-card strong {
  display: block; margin: 6px 0 4px;
  color: oklch(96% 0.01 250);
  font-size: 28px; font-weight: 800; line-height: 1;
}
.overview-card small {
  display: block; color: oklch(68% 0.02 245); font-size: 12px;
}

/* ----- Heat Compact (replaces old panel-map) ----- */
.heat-compact {
  margin-top: var(--space-sm);
  padding: var(--space-md);
  border: 1px solid oklch(50% 0.02 250 / 0.14);
  border-radius: var(--radius);
  background: oklch(16% 0.015 250 / 0.72);
  backdrop-filter: blur(4px);
}

.heat-compact-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.heat-compact-cell {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-xs);
  min-height: 56px; padding: 10px 12px;
  border: 1px solid oklch(60% 0.10 180 / calc(0.10 + var(--level) * 0.25));
  border-radius: var(--radius-sm);
  background: oklch(30% 0.06 180 / calc(0.06 + var(--level) * 0.18));
  transition: transform 150ms var(--ease-out), border-color 150ms var(--ease-out);
  animation: cell-enter 350ms var(--ease-out) calc(var(--i, 0) * 40ms) both;
}
.heat-compact-cell:hover { transform: translateY(-1px); }
.heat-compact-cell strong { display: block; color: oklch(96% 0.01 250); font-size: 13px; font-weight: 700; }
.heat-compact-cell span { display: block; margin-top: 3px; color: oklch(68% 0.02 245); font-size: 12px; }

.heat-compact-right { text-align: right; }
.heat-compact-right b { color: oklch(80% 0.12 175); font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; }

`;

  content = content.slice(0, alertCenterCssIdx) + newStyles + content.slice(alertCenterCssIdx);
  console.log('✓ New CSS styles added');
}

// ============================================================
// 7. RESPONSIVE: Update media queries
// ============================================================
// Add responsive rules for overview-grid and heat-compact-grid
content = content.replace(
  '@media (max-width: 1400px) {\n  .alert-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n}',
  `@media (max-width: 1400px) {
  .alert-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .overview-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .heat-compact-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}`
);

content = content.replace(
  '@media (max-width: 1280px) {\n  .metric-grid, .screen-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n  .panel-map, .panel-wide { grid-column: span 2; grid-row: auto; }\n  .alert-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n}',
  `@media (max-width: 1280px) {
  .metric-grid, .screen-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .panel-full { grid-column: span 2; }
  .overview-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .alert-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .heat-compact-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}`
);

content = content.replace(
  '@media (max-width: 768px) {\n  .screen-shell { padding: var(--space-sm); }\n  .screen-header, .screen-footer { flex-direction: column; align-items: flex-start; }\n  .screen-header h1 { font-size: 24px; }\n  .screen-actions, .metric-grid, .screen-grid, .heat-grid, .alert-grid {\n    width: 100%; grid-template-columns: 1fr;\n  }\n  .panel-map, .panel-wide { grid-column: auto; }\n  .alert-header { flex-direction: column; align-items: flex-start; }\n}',
  `@media (max-width: 768px) {
  .screen-shell { padding: var(--space-sm); }
  .screen-header, .screen-footer { flex-direction: column; align-items: flex-start; }
  .screen-header h1 { font-size: 24px; }
  .screen-actions, .metric-grid, .screen-grid, .heat-grid, .alert-grid {
    width: 100%; grid-template-columns: 1fr;
  }
  .panel-full { grid-column: auto; }
  .overview-grid, .heat-compact-grid { grid-template-columns: 1fr; }
  .alert-header { flex-direction: column; align-items: flex-start; }
}`
);

// Update heat-empty style
content = content.replace(
  '.heat-empty { grid-column: 1 / -1; }',
  ''
);

console.log('✓ Responsive styles updated');

// ============================================================
// WRITE BACK
// ============================================================
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ All changes applied successfully to ' + filePath);
