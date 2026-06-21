<script setup>
import LucideIcon from '@/components/LucideIcon.vue'
import { getNodeTypeMeta } from '../graphDatabaseAdapter'

defineProps({
  // 学习路径数组，由父组件 computed 生成
  paths: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['select-node'])

const LEVEL_META = {
  good: { label: '已掌握', color: '#22c55e', bg: '#dcfce7' },
  medium: { label: '学习中', color: '#f59e0b', bg: '#fef3c7' },
  weak: { label: '薄弱', color: '#ef4444', bg: '#fee2e2' },
  unstarted: { label: '未学习', color: '#94a3b8', bg: '#f1f5f9' }
}

const levelMeta = (level) => LEVEL_META[level] || LEVEL_META.unstarted

function selectNode(node) {
  if (!node?.id) return
  emit('select-node', node)
}
</script>

<template>
  <section class="path-panel">
    <div class="panel-head">
      <LucideIcon name="route" :size="15" />
      <span>个性化学习路径</span>
      <em class="panel-hint">按掌握度从低到高排序，点击节点定位画布</em>
    </div>

    <div v-if="loading" class="panel-loading">
      <ui-skeleton :rows="6" animated />
    </div>

    <ui-empty v-else-if="!paths.length" description="暂无薄弱知识点，学习路径已覆盖" class="panel-empty" />

    <ol v-else class="path-list">
      <li v-for="(path, index) in paths" :key="path.node.id" class="path-item">
        <div class="path-rank">{{ index + 1 }}</div>

        <div class="path-body">
          <div class="path-chain">
            <span
              v-for="pre in path.prerequisites"
              :key="`pre-${pre.id}`"
              class="chain-node pre"
              :title="`前置：${pre.label}`"
              @click="selectNode(pre)"
            >{{ pre.label }}</span>
            <span class="chain-sep">→</span>
            <button type="button" class="chain-node current" @click="selectNode(path.node)">
              <i :style="{ backgroundColor: getNodeTypeMeta(path.node.type).softColor, color: getNodeTypeMeta(path.node.type).textColor }"></i>
              {{ path.node.label }}
            </button>
            <template v-if="path.nextNodes.length">
              <span class="chain-sep">→</span>
              <span
                v-for="nxt in path.nextNodes"
                :key="`next-${nxt.id}`"
                class="chain-node next"
                :title="`后续：${nxt.label}`"
                @click="selectNode(nxt)"
              >{{ nxt.label }}</span>
            </template>
          </div>

          <div class="path-meta">
            <span class="level-tag" :style="{ color: levelMeta(path.level).color, backgroundColor: levelMeta(path.level).bg }">
              {{ levelMeta(path.level).label }}
            </span>
            <span v-if="path.score != null" class="score-tag">{{ path.score }}分</span>
            <span v-if="path.dimension" class="dim-tag">{{ path.dimension }}</span>
          </div>

          <p v-if="path.recommendation" class="path-tip">{{ path.recommendation }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.path-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  background: #fff;
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

.path-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.path-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #edf2f7;
  border-radius: 10px;
  background: #f8fafc;
}

.path-rank {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1270d8;
  color: #fff;
  font-size: 13px;
  font-weight: 900;
}

.path-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.path-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.chain-node {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.chain-node:hover {
  border-color: #94a3b8;
}

.chain-node.pre {
  color: #64748b;
}

.chain-node.current {
  border-color: #1270d8;
  background: #eff6ff;
  color: #0f172a;
  font-weight: 850;
}

.chain-node.current i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chain-node.next {
  color: #64748b;
}

.chain-sep {
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 800;
}

.path-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.level-tag,
.score-tag,
.dim-tag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 850;
}

.score-tag {
  background: #f1f5f9;
  color: #0f172a;
}

.dim-tag {
  background: #eff6ff;
  color: #1d4ed8;
}

.path-tip {
  margin: 0;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.6;
}
</style>
