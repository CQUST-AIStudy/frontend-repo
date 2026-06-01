<template>
  <router-link :to="`/student/experiment-detail/${experiment.id}`" class="g-exp-link [text-decoration:none] [color:inherit] [display:block] [margin-bottom:16px]">
    <div class="g-exp-card [background:rgba(255,_255,_255,_0.92)] [border-radius:12px] [padding:20px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [transition:box-shadow_0.2s,_transform_0.2s] [backdrop-filter:blur(20px)_saturate(180%)] hover:[box-shadow:0_4px_12px_rgba(0,_0,_0,_0.06)] hover:[transform:translateY(-1px)]">
      <div class="g-exp-head [display:flex] [justify-content:space-between] [align-items:flex-start] [margin-bottom:12px] [gap:8px]">
        <h3 class="g-exp-name [font-size:15px] [font-weight:500] [color:#1d1d1f] [margin:0] [line-height:1.4]">{{ experiment.name }}</h3>
        <span class="g-chip [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500] [white-space:nowrap]" :class="'c-' + experiment.status">{{ statusText }}</span>
      </div>
      <div class="g-exp-deadline [display:flex] [align-items:center] [gap:4px] [font-size:13px] [color:#6e6e73] [margin-bottom:8px]">
        <el-icon><Clock /></el-icon>
        <span>截止: {{ experiment.deadline }}</span>
      </div>
      <div v-if="experiment.status === 'completed'" class="g-exp-extra [display:flex] [flex-wrap:wrap] [gap:12px] [font-size:12px] [color:#6e6e73] [margin-bottom:8px] [&_b]:[color:#007aff]">
        <span v-if="experiment.score">得分: <b>{{ experiment.score }}</b></span>
        <span v-if="experiment.plagiarismRate != null">查重率: {{ experiment.plagiarismRate }}%</span>
        <span v-if="experiment.submitTime">{{ experiment.submitTime }}</span>
      </div>
      <div class="g-exp-action [text-align:right] [margin-top:8px]">
        <span class="g-action-link [font-size:13px] [color:#007aff] [font-weight:500]">{{ actionText }} →</span>
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


