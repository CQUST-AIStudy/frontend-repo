<script setup>
import { computed, ref } from 'vue'
import hljs from 'highlight.js/lib/common'
import LucideIcon from '@/components/LucideIcon.vue'
import { getNodeTypeMeta, getRelationTypeMeta } from '../graphDatabaseAdapter'
import { MASTERY_LEVELS, getMasteryMeta } from '../learningState'
import SubmissionTracePanel from './SubmissionTracePanel.vue'

const props = defineProps({
  context: {
    type: Object,
    default: null
  },
  learningState: {
    type: Object,
    default: () => ({})
  },
  // 当前节点的画像掌握度信息 { level, score, isWeak, evidence, dimension, experimentName }
  masteryInfo: {
    type: Object,
    default: null
  },
  // 提交记录列表
  submissions: {
    type: Array,
    default: () => []
  },
  submissionsLoading: { type: Boolean, default: false },
  submissionsError: { type: String, default: '' },
  selectedSubmission: { type: Object, default: null }
})

const emit = defineEmits(['update-state', 'select-submission', 'select-node'])

const context = computed(() => props.context || null)
const node = computed(() => props.context?.node || null)
const meta = computed(() => getNodeTypeMeta(node.value?.type))
const keywords = computed(() => node.value?.properties?.keywords || [])

const showAnswer = ref(false)

// 复杂度表：把 properties.complexity 的键值对转成有序行，键名映射为中文标签
const COMPLEXITY_LABELS = {
  access: '访问',
  search: '查找',
  insert: '插入',
  delete: '删除',
  timeBest: '时间(最好)',
  timeAvg: '时间(平均)',
  timeWorst: '时间(最坏)',
  time: '时间',
  space: '空间'
}

const complexityRows = computed(() => {
  const data = node.value?.properties?.complexity
  if (!data || typeof data !== 'object') return []
  return Object.entries(data)
    .filter(([, value]) => value != null && value !== '')
    .map(([key, value]) => ({ key, label: COMPLEXITY_LABELS[key] || key, value: String(value) }))
})

const codeSample = computed(() => node.value?.properties?.codeSample || '')
const codeLang = computed(() => node.value?.properties?.codeLang || 'text')

const highlightedCode = computed(() => {
  const code = codeSample.value
  if (!code) return ''
  const lang = codeLang.value
  try {
    if (lang && lang !== 'text' && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  } catch {
    // 高亮失败时回退为转义后的纯文本
    return code.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]))
  }
})

const useCases = computed(() => {
  const value = node.value?.properties?.useCases
  return Array.isArray(value) ? value.filter(Boolean) : []
})

const exercise = computed(() => {
  const p = node.value?.properties
  if (!p) return null
  if (!p.problem && !p.input && !p.output && !p.answer) return null
  return {
    problem: p.problem || '',
    input: p.input || '',
    output: p.output || '',
    answer: p.answer || '',
    tags: Array.isArray(p.tags) ? p.tags : []
  }
})

const nodeState = computed(() => {
  const id = node.value?.id
  if (!id) return null
  return props.learningState?.[id] || { mastery: 'unstarted', favorite: false, note: '' }
})

// 学习状态掌握度的可视化数据：进度条百分比 + 徽章配色
const MASTERY_VISUAL = {
  unstarted: { percent: 0, softBg: '#f1f5f9' },
  learning: { percent: 55, softBg: '#fef3c7' },
  mastered: { percent: 100, softBg: '#dcfce7' }
}

const masteryMeta = computed(() => getMasteryMeta(nodeState.value?.mastery || 'unstarted'))
const masteryColor = computed(() => masteryMeta.value.color)
const masteryLabel = computed(() => masteryMeta.value.label)
const masteryVisual = computed(() => MASTERY_VISUAL[nodeState.value?.mastery || 'unstarted'] || MASTERY_VISUAL.unstarted)
const masteryPercent = computed(() => masteryVisual.value.percent)
const masterySoftBg = computed(() => masteryVisual.value.softBg)

// 画像掌握度摘要
const masterySummary = computed(() => {
  const m = props.masteryInfo
  if (!m) return null
  const levelMap = {
    good: { label: '已掌握', color: '#22c55e', bg: '#dcfce7', icon: 'badge-check', tip: '已掌握，可挑战进阶练习' },
    medium: { label: '学习中', color: '#f59e0b', bg: '#fef3c7', icon: 'book-open', tip: '正在学习，继续巩固' },
    weak: { label: '薄弱', color: '#ef4444', bg: '#fee2e2', icon: 'triangle-alert', tip: '建议重点复习' },
    unstarted: { label: '未学习', color: '#94a3b8', bg: '#f1f5f9', icon: 'circle', tip: '尚未开始学习' }
  }
  return { ...m, meta: levelMap[m.level] || levelMap.unstarted }
})

const evidence = computed(() => props.masteryInfo?.evidence || null)

function updateMastery(event) {
  emit('update-state', { mastery: event.target.value })
}

function toggleFavorite() {
  emit('update-state', { favorite: !nodeState.value?.favorite })
}

function updateNote(event) {
  emit('update-state', { note: event.target.value })
}

// 点击关系项 → 跳转选中对应节点，联动画布与面板
function selectRelationNode(item) {
  if (!item?.id) return
  emit('select-node', item)
}

const relationGroups = computed(() => {
  if (!context.value) return []
  return [
    { title: '前置知识', icon: 'arrow-up-right', items: context.value.prerequisites },
    { title: '后续知识', icon: 'trend', items: context.value.nextNodes },
    { title: '关联知识', icon: 'link', items: context.value.relatedNodes },
    { title: '关联练习', icon: 'target', items: context.value.exercises }
  ]
})
</script>

<template>
  <aside class="detail-panel" aria-label="知识点详情">
    <ui-empty v-if="!node" description="请选择一个节点查看详情" />

    <template v-else>
      <div class="detail-head">
        <span class="type-icon" :style="{ backgroundColor: meta.softColor, color: meta.color }">
          <LucideIcon :name="meta.icon" :size="18" />
        </span>
        <div class="detail-title-wrap">
          <span class="type-label">{{ meta.label }}</span>
          <h2 class="detail-title">{{ node.label }}</h2>
        </div>
      </div>

      <p class="detail-summary">{{ node.summary || '暂无简介' }}</p>

      <!-- 学习画像优缺点摘要 -->
      <section v-if="masterySummary" class="mastery-summary" :style="{ backgroundColor: masterySummary.meta.bg, borderColor: masterySummary.meta.color }">
        <div class="mastery-head">
          <span class="mastery-tag" :style="{ color: masterySummary.meta.color }">
            <LucideIcon :name="masterySummary.meta.icon" :size="14" />
            {{ masterySummary.meta.label }}
          </span>
          <strong v-if="masterySummary.score != null" class="mastery-score" :style="{ color: masterySummary.meta.color }">
            {{ masterySummary.score }}分
          </strong>
        </div>
        <p class="mastery-tip">{{ masterySummary.meta.tip }}</p>
        <div v-if="masterySummary.dimension" class="mastery-dim">
          能力维度：{{ masterySummary.dimension }}
        </div>
        <div v-if="evidence" class="mastery-evidence">
          <span>提交 {{ evidence.totalSubmissions || 0 }}</span>
          <span>AC {{ evidence.acCount || 0 }}</span>
          <span v-if="evidence.compileErrors">编译错误 {{ evidence.compileErrors }}</span>
          <span v-if="evidence.wrongAnswers">答案错误 {{ evidence.wrongAnswers }}</span>
        </div>
      </section>

      <div v-if="context.ancestorChain.length" class="breadcrumb-line">
        <span v-for="(item, index) in context.ancestorChain" :key="item.id">
          {{ item.label }}<i v-if="index < context.ancestorChain.length - 1">/</i>
        </span>
      </div>

      <dl class="property-list">
        <div v-if="node.properties.definition">
          <dt>定义</dt>
          <dd>{{ node.properties.definition }}</dd>
        </div>
        <div v-if="node.properties.studyTip">
          <dt>学习建议</dt>
          <dd>{{ node.properties.studyTip }}</dd>
        </div>
        <div v-if="node.properties.difficulty">
          <dt>练习难度</dt>
          <dd>{{ node.properties.difficulty }}</dd>
        </div>
        <div v-if="node.properties.estimatedMinutes">
          <dt>建议时长</dt>
          <dd>{{ node.properties.estimatedMinutes }} 分钟</dd>
        </div>
      </dl>

      <section class="learning-state-section">
        <div class="relation-title">
          <LucideIcon name="bookmark" :size="15" />
          学习状态
        </div>
        <div class="mastery-meter">
          <div class="mastery-bar">
            <div
              class="mastery-bar-fill"
              :style="{ width: masteryPercent + '%', backgroundColor: masteryColor }"
            ></div>
          </div>
          <span class="mastery-badge" :style="{ color: masteryColor, backgroundColor: masterySoftBg }">
            {{ masteryLabel }}
          </span>
        </div>
        <div class="state-row">
          <label class="state-field">
            <span>调整掌握度</span>
            <select :value="nodeState.mastery" @change="updateMastery">
              <option v-for="option in MASTERY_LEVELS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <button
            type="button"
            :class="['favorite-btn', { active: nodeState.favorite }]"
            @click="toggleFavorite"
          >
            <LucideIcon name="star" :size="15" />
            {{ nodeState.favorite ? '已收藏' : '收藏' }}
          </button>
        </div>
        <label class="state-note">
          <span>笔记</span>
          <textarea
            :value="nodeState.note"
            rows="3"
            placeholder="记录你的学习笔记…"
            @input="updateNote"
          ></textarea>
        </label>
      </section>

      <div v-if="keywords.length" class="keyword-list">
        <span v-for="keyword in keywords" :key="keyword">{{ keyword }}</span>
      </div>

      <section v-if="complexityRows.length" class="info-section">
        <div class="relation-title">
          <LucideIcon name="gauge" :size="15" />
          复杂度
        </div>
        <table class="complexity-table">
          <tbody>
            <tr v-for="row in complexityRows" :key="row.key">
              <th>{{ row.label }}</th>
              <td><code>{{ row.value }}</code></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="codeSample" class="info-section">
        <div class="relation-title">
          <LucideIcon name="code" :size="15" />
          示例实现
          <span class="code-lang">{{ codeLang }}</span>
        </div>
        <pre class="code-block"><code class="hljs" v-html="highlightedCode"></code></pre>
      </section>

      <section v-if="useCases.length" class="info-section">
        <div class="relation-title">
          <LucideIcon name="lightbulb" :size="15" />
          应用场景
        </div>
        <div class="keyword-list usecase-list">
          <span v-for="item in useCases" :key="item">{{ item }}</span>
        </div>
      </section>

      <section v-if="exercise" class="info-section exercise-section">
        <div class="relation-title">
          <LucideIcon name="pencil-ruler" :size="15" />
          练习题
        </div>
        <p v-if="exercise.problem" class="exercise-problem">{{ exercise.problem }}</p>
        <div v-if="exercise.input" class="exercise-io">
          <span class="io-label">输入</span>
          <code>{{ exercise.input }}</code>
        </div>
        <div v-if="exercise.output" class="exercise-io">
          <span class="io-label">输出</span>
          <code>{{ exercise.output }}</code>
        </div>
        <div v-if="exercise.tags.length" class="keyword-list">
          <span v-for="tag in exercise.tags" :key="tag">{{ tag }}</span>
        </div>
        <button
          v-if="exercise.answer"
          type="button"
          class="answer-toggle"
          @click="showAnswer = !showAnswer"
        >
          <LucideIcon :name="showAnswer ? 'eye-off' : 'eye'" :size="14" />
          {{ showAnswer ? '隐藏参考答案' : '查看参考答案' }}
        </button>
        <p v-if="exercise.answer && showAnswer" class="exercise-answer">{{ exercise.answer }}</p>
      </section>

      <section v-for="group in relationGroups" :key="group.title" class="relation-section">
        <div class="relation-title">
          <LucideIcon :name="group.icon" :size="15" />
          {{ group.title }}
        </div>
        <ui-empty v-if="group.items.length === 0" description="暂无数据" class="mini-empty" />
        <div v-else class="relation-list">
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="relation-item"
            :title="`跳转到「${item.label}」`"
            @click="selectRelationNode(item)"
          >
            <span class="relation-type" :style="{ backgroundColor: getNodeTypeMeta(item.type).softColor, color: getNodeTypeMeta(item.type).textColor }">
              {{ getNodeTypeMeta(item.type).label }}
            </span>
            <strong class="relation-label">{{ item.label }}</strong>
            <LucideIcon name="chevron-right" :size="14" class="relation-arrow" />
          </button>
        </div>
      </section>

      <SubmissionTracePanel
        :submissions="submissions"
        :loading="submissionsLoading"
        :error="submissionsError"
        :selected-submission="selectedSubmission"
        @select-submission="(s) => emit('select-submission', s)"
      />

      <section class="relation-section">
        <div class="relation-title">
          <LucideIcon name="network" :size="15" />
          直接关系
        </div>
        <div class="edge-list">
          <span v-for="relation in [...context.incoming, ...context.outgoing]" :key="relation.id">
            {{ getRelationTypeMeta(relation.type).label }}
          </span>
        </div>
      </section>
    </template>
  </aside>
</template>

<style scoped>
.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  height: 100%;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border-radius: 8px;
}

.detail-title-wrap {
  min-width: 0;
}

.type-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.detail-title {
  overflow: hidden;
  margin: 3px 0 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-summary {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
}

.mastery-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 1px solid;
  border-radius: 8px;
}

.mastery-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mastery-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 850;
}

.mastery-score {
  font-size: 16px;
  font-weight: 900;
}

.mastery-tip {
  margin: 0;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.mastery-dim {
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.mastery-evidence {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 2px;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
}

.breadcrumb-line {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.breadcrumb-line i {
  margin-left: 4px;
  color: #cbd5e1;
  font-style: normal;
}

.property-list {
  display: flex;
  flex-direction: column;
  margin: 0;
}

.property-list div {
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  background: transparent;
}

.property-list div:last-child {
  border-bottom: 0;
}

.property-list dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.property-list dd {
  margin: 5px 0 0;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.6;
}

.keyword-list,
.edge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.keyword-list span,
.edge-list span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.learning-state-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  border: 0;
  background: transparent;
}

.mastery-meter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mastery-bar {
  flex: 1;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #f1f5f9;
}

.mastery-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.mastery-badge {
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 850;
}

.state-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.state-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.state-field span {
  flex-shrink: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.state-field select {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.favorite-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.favorite-btn.active {
  border-color: #f59e0b;
  background: #fef3c7;
  color: #b45309;
}

.state-note {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.state-note span {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.state-note textarea {
  width: 100%;
  min-height: 64px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
}

.relation-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.complexity-table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border: 1px solid #edf2f7;
  border-radius: 8px;
}

.complexity-table tr:nth-child(even) {
  background: #f8fafc;
}

.complexity-table th {
  width: 92px;
  padding: 6px 10px;
  border-right: 1px solid #edf2f7;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-align: left;
}

.complexity-table td {
  padding: 6px 10px;
}

.complexity-table code {
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.code-lang {
  margin-left: auto;
  padding: 1px 7px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.code-block {
  max-height: 320px;
  margin: 0;
  overflow: auto;
  padding: 12px;
  border-radius: 8px;
  background: #0f172a;
}

.code-block code {
  display: block;
  background: transparent;
  color: #e2e8f0;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre;
  font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
}

.usecase-list span {
  background: #eff6ff;
  color: #1d4ed8;
}

.exercise-section {
  padding: 0;
  border: 0;
  background: transparent;
}

.exercise-problem {
  margin: 0;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.7;
}

.exercise-io {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.exercise-io .io-label {
  flex-shrink: 0;
  color: #92400e;
  font-size: 12px;
  font-weight: 800;
}

.exercise-io code {
  overflow-wrap: anywhere;
  color: #0f172a;
  font-size: 12px;
}

.answer-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 5px 10px;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  background: #fff;
  color: #b45309;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.exercise-answer {
  margin: 0;
  padding: 10px;
  border-radius: 6px;
  background: #fff;
  color: #334155;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.relation-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 850;
}

.relation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.relation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 9px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.relation-item:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.relation-item:hover .relation-arrow {
  color: var(--app-primary, #1270d8);
}

.relation-type {
  flex-shrink: 0;
  padding: 3px 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
}

.relation-label {
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relation-arrow {
  flex-shrink: 0;
  margin-left: auto;
  color: #94a3b8;
  transition: color 0.15s ease;
}

.mini-empty {
  min-height: 60px;
}
</style>
