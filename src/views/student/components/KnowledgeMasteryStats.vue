<script setup>
import LucideIcon from '@/components/LucideIcon.vue'

defineProps({
  stats: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section class="mastery-stats" aria-label="知识点掌握情况统计">
    <div v-for="item in stats" :key="item.status" class="stat-card">
      <div class="stat-icon" :style="{ backgroundColor: item.softColor, color: item.color }">
        <LucideIcon :name="item.icon" :size="18" />
      </div>
      <div class="stat-copy">
        <div class="stat-label">{{ item.label }}</div>
        <div class="stat-value">{{ item.count }}</div>
        <div class="stat-percent">占比 {{ item.percentage }}%</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mastery-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  min-height: 92px;
  padding: 18px 20px;
  border: 1px solid #edf2f7;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
}

.stat-copy {
  min-width: 0;
}

.stat-label {
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.stat-value {
  margin-top: 4px;
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.stat-percent {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

@media (max-width: 960px) {
  .mastery-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .mastery-stats {
    grid-template-columns: 1fr;
  }
}
</style>
