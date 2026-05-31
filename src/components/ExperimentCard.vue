<template>
  <router-link :to="`/student/experiment-detail/${experiment.id}`" class="g-exp-link [text-decoration:none] [color:inherit] [display:block] [margin-bottom:16px]">
    <div class="g-exp-card [background:#fff] [border-radius:16px] [padding:20px] [border:1px_solid_#dadce0] [transition:box-shadow_0.2s,_transform_0.2s] hover:[box-shadow:0_1px_3px_rgba(60,64,67,0.15),_0_4px_8px_rgba(60,64,67,0.08)] hover:[transform:translateY(-2px)]">
      <div class="g-exp-head [display:flex] [justify-content:space-between] [align-items:flex-start] [margin-bottom:12px] [gap:8px]">
        <h3 class="g-exp-name [font-size:15px] [font-weight:500] [color:#202124] [margin:0] [line-height:1.4]">{{ experiment.name }}</h3>
        <span class="g-chip [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500] [white-space:nowrap]" :class="'c-' + experiment.status">{{ statusText }}</span>
      </div>
      <div class="g-exp-deadline [display:flex] [align-items:center] [gap:4px] [font-size:13px] [color:#5f6368] [margin-bottom:8px]">
        <el-icon><Clock /></el-icon>
        <span>截止: {{ experiment.deadline }}</span>
      </div>
      <div v-if="experiment.status === 'completed'" class="g-exp-extra [display:flex] [flex-wrap:wrap] [gap:12px] [font-size:12px] [color:#5f6368] [margin-bottom:8px] [&_b]:[color:#1a73e8]">
        <span v-if="experiment.score">得分: <b>{{ experiment.score }}</b></span>
        <span v-if="experiment.plagiarismRate != null">查重率: {{ experiment.plagiarismRate }}%</span>
        <span v-if="experiment.submitTime">{{ experiment.submitTime }}</span>
      </div>
      <div class="g-exp-action [text-align:right] [margin-top:8px]">
        <span class="g-action-link [font-size:13px] [color:#1a73e8] [font-weight:500]">{{ actionText }} →</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { Clock } from '@element-plus/icons-vue'

const props = defineProps({ experiment: { type: Object, required: true } })

const statusText = computed(() => ({ completed: '已完成', in_progress: '进行中', not_started: '未开始' }[props.experiment.status] || '未知'))
const actionText = computed(() => ({ completed: '查看结果', in_progress: '继续实验', not_started: '开始实验' }[props.experiment.status] || '查看详情'))
</script>


