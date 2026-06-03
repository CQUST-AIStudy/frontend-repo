<template>
  <div class="experiment-tab-content">
    <ui-empty v-if="experiments.length === 0" description="暂无实验数据" />

    <experiment-card
      v-for="experiment in experiments"
      :key="experiment.id"
      :experiment="experiment"
    />
  </div>
</template>

<script setup>
import ExperimentCard from '../../../components/ExperimentCard.vue'

defineProps({
  experiments: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.experiment-tab-content {
  display: flex;
  min-height: 200px;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 640px) {
  .experiment-tab-content {
    gap: 8px;
  }
}
</style>
