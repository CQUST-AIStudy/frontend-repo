<script setup>
import LucideIcon from '@/components/LucideIcon.vue'

defineProps({
  // 练习推荐数组，由父组件 computed 生成
  practices: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['select-node', 'start-practice'])

const DIFFICULTY_META = {
  easy: { label: '简单', color: '#22c55e', bg: '#dcfce7' },
  medium: { label: '中等', color: '#f59e0b', bg: '#fef3c7' },
  hard: { label: '困难', color: '#ef4444', bg: '#fee2e2' }
}

const difficultyMeta = (d) => DIFFICULTY_META[d] || { label: d || '-', color: '#94a3b8', bg: '#f1f5f9' }

function selectNode(node) {
  if (!node?.id) return
  emit('select-node', node)
}

function startPractice(item) {
  emit('start-practice', item)
}
</script>

<template>
  <section class="practice-panel">
    <div class="panel-head">
      <LucideIcon name="target" :size="15" />
      <span>推荐练习</span>
      <em class="panel-hint">围绕薄弱知识点匹配题目与真实通过情况</em>
    </div>

    <div v-if="loading" class="panel-loading">
      <ui-skeleton :rows="6" animated />
    </div>

    <ui-empty v-else-if="!practices.length" description="暂无推荐练习，已无薄弱知识点" class="panel-empty" />

    <ul v-else class="practice-list">
      <li v-for="item in practices" :key="item.id" class="practice-item">
        <div class="practice-main">
          <button type="button" class="practice-title" @click="selectNode(item.exerciseNode)">
            {{ item.title || item.exerciseNode?.label || '练习题' }}
          </button>
          <div class="practice-meta">
            <span class="diff-tag" :style="{ color: difficultyMeta(item.difficulty).color, backgroundColor: difficultyMeta(item.difficulty).bg }">
              {{ difficultyMeta(item.difficulty).label }}
            </span>
            <span v-if="item.estimatedMinutes" class="meta-tag">{{ item.estimatedMinutes }} 分钟</span>
            <span v-if="item.knowledgeLabel" class="meta-tag knowledge">{{ item.knowledgeLabel }}</span>
          </div>
          <p v-if="item.reason" class="practice-reason">{{ item.reason }}</p>
        </div>

        <div class="practice-side">
          <div v-if="item.hasSubmission" class="ac-stat" :title="`提交 ${item.totalSubmissions} 次，AC ${item.acCount} 次`">
            <strong>{{ item.acCount }}</strong>
            <span>/ {{ item.totalSubmissions }}</span>
            <em>AC</em>
          </div>
          <div v-else-if="item.totalSubmissions === 0 && item.hasSubmission === false" class="ac-stat none" title="尚未提交">
            <em>未练习</em>
          </div>
          <button type="button" class="start-btn" @click="startPractice(item)">
            <LucideIcon name="arrow-up-right" :size="14" />
            去练习
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.practice-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 850;
}

.panel-head em {
  margin-left: auto;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  font-style: normal;
}

.panel-loading,
.panel-empty {
  min-height: 180px;
}

.practice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.practice-item {
  display: flex;
  gap: 14px;
  padding: 13px 14px;
  border: 1px solid #edf2f7;
  border-radius: 12px;
  background: #f8fafc;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.practice-item:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  background: #fff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.practice-main {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  flex: 1;
}

.practice-title {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: transparent;
  color: #0f172a;
  font-size: 14px;
  font-weight: 850;
  text-align: left;
  cursor: pointer;
}

.practice-title:hover {
  color: #1270d8;
}

.practice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.diff-tag,
.meta-tag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 850;
}

.meta-tag {
  background: #f1f5f9;
  color: #475569;
}

.meta-tag.knowledge {
  background: #eff6ff;
  color: #1d4ed8;
}

.practice-reason {
  margin: 0;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.6;
}

.practice-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
}

.ac-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
}

.ac-stat strong {
  color: #22c55e;
  font-size: 18px;
  font-weight: 900;
}

.ac-stat span {
  color: #94a3b8;
  font-size: 12px;
}

.ac-stat em {
  margin-left: 3px;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  font-style: normal;
}

.ac-stat.none em {
  color: #94a3b8;
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #1270d8;
  border-radius: 8px;
  background: linear-gradient(135deg, #1270d8, #0f5fb8);
  color: #fff;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(18, 112, 216, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.start-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(18, 112, 216, 0.32);
}
</style>
