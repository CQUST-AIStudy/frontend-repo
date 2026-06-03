<template>
  <router-link :to="`/student/experiment-detail/${experiment.id}`" class="g-exp-link">
    <div class="g-exp-card">
      <div class="g-exp-main">
        <div class="g-exp-title-row">
          <h3 class="g-exp-name">{{ experiment.name }}</h3>
          <span class="g-chip" :class="'c-' + experiment.status">{{ statusText }}</span>
        </div>

        <div class="g-exp-meta">
          <span class="g-exp-deadline">
            <ui-icon><Clock /></ui-icon>
            <span>截止: {{ experiment.deadline || '未设置' }}</span>
          </span>

          <template v-if="experiment.status === 'completed'">
            <span v-if="experiment.score">得分: <b>{{ experiment.score }}</b></span>
            <span v-if="experiment.plagiarismRate != null">查重率: {{ experiment.plagiarismRate }}%</span>
            <span v-if="experiment.submitTime">{{ experiment.submitTime }}</span>
          </template>
        </div>
      </div>

      <div class="g-exp-action">
        <span class="g-action-link">{{ actionText }} →</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { Clock } from '@/components/ui/icons'

const props = defineProps({
  experiment: {
    type: Object,
    required: true
  }
})

const statusText = computed(() => ({
  completed: '已完成',
  in_progress: '进行中',
  not_started: '未开始'
}[props.experiment.status] || '未知'))

const actionText = computed(() => ({
  completed: '查看结果',
  in_progress: '继续实验',
  not_started: '开始实验'
}[props.experiment.status] || '查看详情'))
</script>

<style scoped>
.g-exp-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.g-exp-card {
  display: flex;
  min-height: 82px;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 18px;
  border: 1px solid rgba(126, 157, 183, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 1px 2px rgba(22, 48, 79, 0.04);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.g-exp-card:hover {
  border-color: rgba(18, 112, 216, 0.24);
  box-shadow: 0 8px 20px rgba(22, 48, 79, 0.08);
  transform: translateY(-1px);
}

.g-exp-main {
  min-width: 0;
  flex: 1 1 auto;
}

.g-exp-title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.g-exp-name {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.g-chip {
  display: inline-flex;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.g-chip.c-completed {
  background: rgba(22, 163, 74, 0.1);
  color: #168a43;
}

.g-chip.c-in_progress {
  background: rgba(245, 158, 11, 0.12);
  color: #c26a00;
}

.g-chip.c-not_started {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.g-exp-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 8px;
  color: #6e6e73;
  font-size: 12px;
  line-height: 1.5;
}

.g-exp-meta b {
  color: #007aff;
  font-weight: 700;
}

.g-exp-deadline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.g-exp-action {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
}

.g-action-link {
  color: #007aff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .g-exp-card {
    min-height: 0;
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding: 13px 14px;
  }

  .g-exp-title-row {
    align-items: flex-start;
  }

  .g-exp-name {
    white-space: normal;
  }

  .g-exp-action {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
