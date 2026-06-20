<script setup>
import { computed } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'

const props = defineProps({
  // 适配层返回的 summary
  summary: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const distribution = computed(() => props.summary?.distribution || { good: 0, medium: 0, weak: 0, unstarted: 0 })
const totalNodes = computed(() => {
  const d = distribution.value
  return (d.good || 0) + (d.medium || 0) + (d.weak || 0) + (d.unstarted || 0)
})

const segments = computed(() => {
  const d = distribution.value
  const total = totalNodes.value || 1
  return [
    { key: 'good', label: '已掌握', count: d.good || 0, color: '#22c55e', pct: ((d.good || 0) / total) * 100 },
    { key: 'medium', label: '学习中', count: d.medium || 0, color: '#f59e0b', pct: ((d.medium || 0) / total) * 100 },
    { key: 'weak', label: '薄弱', count: d.weak || 0, color: '#ef4444', pct: ((d.weak || 0) / total) * 100 },
    { key: 'unstarted', label: '未学习', count: d.unstarted || 0, color: '#94a3b8', pct: ((d.unstarted || 0) / total) * 100 }
  ].filter(s => s.count > 0)
})

const weakDims = computed(() => props.summary?.weakDims || [])
const goodDims = computed(() => props.summary?.goodDims || [])

const trendText = computed(() => {
  const d = props.summary?.trendDirection
  return d === 'up' ? '进步中 ↑' : d === 'down' ? '下降 ↓' : '平稳 →'
})

const dimIcon = (dim) => {
  const map = { '线性表': 'ruler', '栈与队列': 'library', '树': 'tree', '图': 'network', '哈希': 'hash', '综合': 'target' }
  return map[dim] || 'package'
}
</script>

<template>
  <section class="overview-bar" aria-label="学习概况">
    <div v-if="loading" class="overview-loading">
      <LucideIcon name="loader" :size="16" />
      正在加载学习画像…
    </div>

    <template v-else>
      <!-- 掌握度分布 -->
      <article class="overview-card overview-distribution">
        <div class="card-head">
          <LucideIcon name="pie-chart" :size="15" />
          <span>知识点掌握分布</span>
        </div>
        <div class="dist-bar">
          <div
            v-for="seg in segments"
            :key="seg.key"
            class="dist-seg"
            :style="{ width: seg.pct + '%', backgroundColor: seg.color }"
            :title="`${seg.label} ${seg.count}`"
          ></div>
        </div>
        <div class="dist-legend">
          <span v-for="seg in segments" :key="seg.key" class="legend-item">
            <i :style="{ backgroundColor: seg.color }"></i>
            {{ seg.label }} <strong>{{ seg.count }}</strong>
          </span>
        </div>
      </article>

      <!-- 薄弱维度 -->
      <article class="overview-card overview-weak">
        <div class="card-head weak">
          <LucideIcon name="triangle-alert" :size="15" />
          <span>薄弱维度</span>
        </div>
        <div v-if="weakDims.length" class="dim-list">
          <div v-for="d in weakDims" :key="d.dimension" class="dim-row">
            <span class="dim-name">
              <LucideIcon :name="dimIcon(d.dimension)" :size="13" />
              {{ d.dimension }}
            </span>
            <span class="dim-score weak">{{ d.score }}分</span>
          </div>
        </div>
        <p v-else class="empty-text">暂无薄弱维度，继续保持！</p>
      </article>

      <!-- 优势维度 -->
      <article class="overview-card overview-good">
        <div class="card-head good">
          <LucideIcon name="badge-check" :size="15" />
          <span>优势维度</span>
        </div>
        <div v-if="goodDims.length" class="dim-list">
          <div v-for="d in goodDims" :key="d.dimension" class="dim-row">
            <span class="dim-name">
              <LucideIcon :name="dimIcon(d.dimension)" :size="13" />
              {{ d.dimension }}
            </span>
            <span class="dim-score good">{{ d.score }}分</span>
          </div>
        </div>
        <p v-else class="empty-text">暂无突出优势</p>
      </article>

      <!-- 提交统计 -->
      <article class="overview-card overview-stat">
        <div class="card-head">
          <LucideIcon name="trending-up" :size="15" />
          <span>学习趋势</span>
        </div>
        <div class="stat-grid">
          <div class="stat-cell">
            <strong>{{ summary.totalSubmissions || 0 }}</strong>
            <span>总提交</span>
          </div>
          <div class="stat-cell">
            <strong>{{ summary.overallAcRate || 0 }}%</strong>
            <span>AC率</span>
          </div>
          <div class="stat-cell">
            <strong :class="['trend-tag', summary.trendDirection]">{{ trendText }}</strong>
            <span>趋势</span>
          </div>
        </div>
      </article>
    </template>
  </section>
</template>

<style scoped>
.overview-bar {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 12px;
}

.overview-loading {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 13px;
}

.overview-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.card-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 850;
}

.card-head.weak { color: #b91c1c; }
.card-head.good { color: #15803d; }

.dist-bar {
  display: flex;
  width: 100%;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #f1f5f9;
}

.dist-seg {
  height: 100%;
  transition: width 0.3s ease;
}

.dist-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.legend-item i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-item strong {
  color: #0f172a;
}

.dim-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.dim-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dim-name {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.dim-score {
  font-size: 12px;
  font-weight: 850;
}

.dim-score.weak { color: #ef4444; }
.dim-score.good { color: #22c55e; }

.empty-text {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 4px;
  border-radius: 6px;
  background: #f8fafc;
}

.stat-cell strong {
  color: #0f172a;
  font-size: 16px;
  font-weight: 900;
}

.stat-cell span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
}

.trend-tag.up { color: #22c55e; }
.trend-tag.down { color: #ef4444; }
.trend-tag.flat { color: #94a3b8; }

@media (max-width: 1100px) {
  .overview-bar {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .overview-bar {
    grid-template-columns: 1fr;
  }
}
</style>
