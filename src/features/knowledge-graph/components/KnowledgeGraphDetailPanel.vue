<script setup>
import { computed, ref } from 'vue'
import hljs from 'highlight.js/lib/common'
import LucideIcon from '@/components/LucideIcon.vue'
import { getNodeTypeMeta, getRelationTypeMeta } from '../graphDatabaseAdapter'
import { MASTERY_LEVELS } from '../learningState'

const props = defineProps({
  context: {
    type: Object,
    default: null
  },
  learningState: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update-state'])

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

function updateMastery(event) {
  emit('update-state', { mastery: event.target.value })
}

function toggleFavorite() {
  emit('update-state', { favorite: !nodeState.value?.favorite })
}

function updateNote(event) {
  emit('update-state', { note: event.target.value })
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

      <div v-if="context.ancestorChain.length" class="breadcrumb-line">
        <span v-for="(item, index) in context.ancestorChain" :key="item.id">
          {{ item.label }}<i v-if="index < context.ancestorChain.length - 1">/</i>
        </span>
      </div>

      <section class="learning-state-section">
        <div class="relation-title">
          <LucideIcon name="bookmark" :size="15" />
          学习状态
        </div>
        <div class="state-row">
          <label class="state-field">
            <span>掌握度</span>
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
          <article v-for="item in group.items" :key="item.id" class="relation-item">
            <span :style="{ backgroundColor: getNodeTypeMeta(item.type).softColor, color: getNodeTypeMeta(item.type).textColor }">
              {{ getNodeTypeMeta(item.type).label }}
            </span>
            <strong>{{ item.label }}</strong>
          </article>
        </div>
      </section>

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
  gap: 10px;
  margin: 0;
}

.property-list div {
  padding: 10px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;
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
  padding: 12px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;
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
  padding: 12px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: #fffbeb;
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
  min-width: 0;
  padding: 9px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #fff;
}

.relation-item span {
  flex-shrink: 0;
  padding: 3px 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
}

.relation-item strong {
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-empty {
  min-height: 60px;
}
</style>
