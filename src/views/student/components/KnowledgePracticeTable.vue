<script setup>
import { computed } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'

const props = defineProps({
  practices: {
    type: Array,
    default: () => []
  },
  selectedNode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['start-practice'])

const sortedPractices = computed(() => {
  const selectedId = props.selectedNode?.id
  const selectedName = props.selectedNode?.label || props.selectedNode?.name
  return [...props.practices].sort((a, b) => {
    const aMatch = a.knowledgeId === selectedId || a.knowledge === selectedName
    const bMatch = b.knowledgeId === selectedId || b.knowledge === selectedName
    if (aMatch === bMatch) return 0
    return aMatch ? -1 : 1
  })
})

function difficultyText(difficulty) {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || '中等'
}

function difficultyClass(difficulty) {
  return `difficulty-${difficulty || 'medium'}`
}

function isHighlighted(item) {
  return item.knowledgeId === props.selectedNode?.id || item.knowledge === (props.selectedNode?.label || props.selectedNode?.name)
}

function startPractice(item) {
  emit('start-practice', item)
}
</script>

<template>
  <section class="practice-section" aria-label="推荐练习题目">
    <div class="section-header">
      <div>
        <h2 class="section-title">推荐练习题目</h2>
        <p class="section-desc">根据你的薄弱知识点，推荐以下练习题目</p>
      </div>
    </div>

    <ui-empty v-if="sortedPractices.length === 0" description="暂无推荐练习题目" />

    <div v-else class="practice-table-wrap">
      <table class="practice-table">
        <thead>
          <tr>
            <th>题目名称</th>
            <th>所属知识点</th>
            <th>难度</th>
            <th>通过率</th>
            <th>推荐理由</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedPractices" :key="item.id" :class="{ highlighted: isHighlighted(item) }">
            <td>
              <div class="title-cell">
                <span class="title-link">{{ item.title }}</span>
                <span v-if="isHighlighted(item)" class="match-pill">当前节点</span>
              </div>
            </td>
            <td>{{ item.knowledge }}</td>
            <td>
              <span class="difficulty-pill" :class="difficultyClass(item.difficulty)">
                {{ difficultyText(item.difficulty) }}
              </span>
            </td>
            <td>{{ item.passRate }}</td>
            <td class="reason-cell">{{ item.reason }}</td>
            <td>
              <ui-button size="small" plain @click="startPractice(item)">
                <LucideIcon name="arrow-up-right" :size="14" />
                去练习
              </ui-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="practice-cards">
      <article v-for="item in sortedPractices" :key="`card-${item.id}`" class="practice-card" :class="{ highlighted: isHighlighted(item) }">
        <div class="card-top">
          <div class="card-title">
            {{ item.title }}
            <span v-if="isHighlighted(item)" class="match-pill">当前节点</span>
          </div>
          <span class="difficulty-pill" :class="difficultyClass(item.difficulty)">
            {{ difficultyText(item.difficulty) }}
          </span>
        </div>
        <div class="card-meta">
          <span>{{ item.knowledge }}</span>
          <span>通过率 {{ item.passRate }}</span>
        </div>
        <p class="card-reason">{{ item.reason }}</p>
        <ui-button size="small" plain @click="startPractice(item)">
          <LucideIcon name="arrow-up-right" :size="14" />
          去练习
        </ui-button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.practice-section {
  padding: 18px;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  background: #fff;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.section-title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.section-desc {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.practice-table-wrap {
  overflow-x: auto;
}

.practice-table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  color: #334155;
  font-size: 13px;
}

.practice-table th {
  padding: 12px 14px;
  background: #f8fafc;
  color: #475569;
  font-weight: 800;
  text-align: left;
  white-space: nowrap;
}

.practice-table td {
  padding: 13px 14px;
  border-top: 1px solid #edf2f7;
  vertical-align: middle;
}

.practice-table tr.highlighted td {
  background: #f8fbff;
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.title-link {
  color: #1270d8;
  font-weight: 800;
}

.match-pill {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 800;
}

.difficulty-pill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.difficulty-easy {
  background: #dcfce7;
  color: #166534;
}

.difficulty-medium {
  background: #fef3c7;
  color: #92400e;
}

.difficulty-hard {
  background: #fee2e2;
  color: #991b1b;
}

.reason-cell {
  color: #64748b;
}

.practice-cards {
  display: none;
}

@media (max-width: 720px) {
  .practice-table-wrap {
    display: none;
  }

  .practice-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .practice-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border: 1px solid #edf2f7;
    border-radius: 12px;
    background: #fff;
  }

  .practice-card.highlighted {
    border-color: #bfdbfe;
    background: #f8fbff;
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .card-title {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
    color: #0f172a;
    font-size: 14px;
    font-weight: 800;
  }

  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: #64748b;
    font-size: 12px;
  }

  .card-reason {
    margin: 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
  }
}
</style>
