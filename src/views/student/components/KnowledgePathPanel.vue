<script setup>
import { computed } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'
import { KNOWLEDGE_STATUS } from '../knowledgeLearningData'

const props = defineProps({
  paths: {
    type: Array,
    default: () => []
  },
  selectedNode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['open-practice'])

const selectedStatus = computed(() => {
  if (!props.selectedNode?.status) return null
  return KNOWLEDGE_STATUS[props.selectedNode.status] || null
})

function statusMeta(status) {
  return KNOWLEDGE_STATUS[status] || KNOWLEDGE_STATUS.unlearned
}

function openPractice(item) {
  emit('open-practice', item)
}
</script>

<template>
  <aside class="path-panel" aria-label="智能推荐学习路径">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">智能推荐学习路径</h2>
        <p class="panel-desc">基于你的学习情况，为你推荐优先学习的知识点</p>
      </div>
    </div>

    <div v-if="selectedNode" class="selected-node">
      <div class="selected-copy">
        <span class="selected-label">当前查看</span>
        <strong>{{ selectedNode.label || selectedNode.name }}</strong>
      </div>
      <span
        v-if="selectedStatus"
        class="selected-badge"
        :style="{ backgroundColor: selectedStatus.softColor, color: selectedStatus.textColor }"
      >
        {{ selectedStatus.label }}
      </span>
    </div>

    <ui-empty v-if="paths.length === 0" description="暂无推荐学习路径" class="path-empty" />

    <div v-else class="path-list">
      <article v-for="item in paths" :key="item.knowledgeId" class="path-item">
        <div class="path-rank">{{ item.rank }}</div>
        <div class="path-body">
          <div class="path-topline">
            <h3 class="path-name">{{ item.knowledge }}</h3>
            <span
              class="path-status"
              :style="{ backgroundColor: statusMeta(item.status).softColor, color: statusMeta(item.status).textColor }"
            >
              {{ statusMeta(item.status).label }}
            </span>
          </div>
          <p class="path-reason">{{ item.recommendation }}</p>
          <div class="path-meta">
            <span>推荐题目：{{ item.exerciseCount }} 题</span>
            <span>掌握度：{{ item.mastery }}%</span>
          </div>
        </div>
        <ui-button size="small" plain class="path-action" @click="openPractice(item)">
          <LucideIcon name="arrow-up-right" :size="14" />
          去练习
        </ui-button>
      </article>
    </div>

    <ui-button class="full-path-btn" plain @click="openPractice({ knowledge: '完整学习路径' })">
      查看完整学习路径
    </ui-button>
  </aside>
</template>

<style scoped>
.path-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  padding: 18px;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  background: #fff;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.panel-desc {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.selected-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fbff;
}

.selected-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.selected-label {
  color: #64748b;
  font-size: 11px;
}

.selected-copy strong {
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-badge,
.path-status {
  flex-shrink: 0;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.selected-badge {
  padding: 6px 8px;
}

.path-list {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.path-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-width: 0;
  padding: 13px;
  border: 1px solid #edf2f7;
  border-radius: 12px;
  background: #fff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.path-item:hover {
  border-color: #bfdbfe;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.08);
}

.path-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.path-body {
  min-width: 0;
}

.path-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.path-name {
  overflow: hidden;
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path-status {
  padding: 5px 7px;
}

.path-reason {
  display: -webkit-box;
  overflow: hidden;
  margin: 7px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.path-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  color: #64748b;
  font-size: 11px;
}

.path-action {
  align-self: center;
  white-space: nowrap;
}

.full-path-btn {
  margin-top: 14px;
  width: 100%;
}

.path-empty {
  min-height: 180px;
}

@media (max-width: 560px) {
  .path-item {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .path-action {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
