<template>
  <div class="experiment-tab-content [min-height:200px]">
    <ui-row :gutter="20">
      <ui-col :span="24" v-if="experiments.length === 0">
        <ui-empty description="暂无实验数据" />
      </ui-col>
      
      <ui-col
        v-for="experiment in experiments"
        :key="experiment.id"
        :xs="24"
        :sm="12"
        :lg="8"
      >
        <experiment-card :experiment="experiment" />
      </ui-col>
    </ui-row>
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


