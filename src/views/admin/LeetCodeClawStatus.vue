<template>
  <div class="leetcode-claw-status page [display:flex] [flex-direction:column] [gap:16px]">
    <UiPageHeader
      title="LeetCodeClaw 服务状态"
      description="检查 LeetCodeClaw 抓题服务、数据库连接和题库表结构是否可用"
    >
      <ui-button type="primary" :loading="loading" @click="loadHealth">刷新状态</ui-button>
    </UiPageHeader>

    <loading-state :loading="loading">
      <div class="status-grid [display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:14px] max-[960px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[640px]:[grid-template-columns:1fr]">
        <ui-card v-for="item in cards" :key="item.label" shadow="never" class="[border-radius:16px] [border:1px_solid_#e8eef6]">
          <div class="[font-size:13px] [color:#64748b]">{{ item.label }}</div>
          <div class="[margin-top:8px] [font-size:22px] [font-weight:800]" :class="item.ok ? '[color:#1e8e3e]' : '[color:#d93025]'">
            {{ item.value }}
          </div>
          <div class="[margin-top:8px] [font-size:12px] [line-height:1.6] [color:#64748b]">{{ item.tip }}</div>
        </ui-card>
      </div>

      <ui-card shadow="never" class="[margin-top:16px] [border-radius:16px] [border:1px_solid_#e8eef6]">
        <template #header>原始响应</template>
        <pre class="[margin:0] [padding:14px] [border-radius:12px] [background:#0f172a] [color:#e2e8f0] [font-size:13px] [overflow:auto]">{{ formattedHealth }}</pre>
      </ui-card>
    </loading-state>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import LoadingState from '../../components/LoadingState.vue'
import { message as uiMessage } from '@/services/feedback'
import { getLeetCodeClawHealth } from '../../api/leetcodeClaw'

const loading = ref(false)
const health = ref(null)

const cards = computed(() => {
  const data = health.value || {}
  return [
    {
      label: '服务',
      value: data.service || '未检查',
      ok: data.success === true,
      tip: '接口 /health 是否返回 success=true'
    },
    {
      label: '数据库',
      value: data.database || '未知',
      ok: data.database === 'ok',
      tip: '用于判断是否能写入主项目 MySQL 题库'
    },
    {
      label: '表结构',
      value: data.schema || '未知',
      ok: data.schema === 'ok',
      tip: '用于判断 leetcode_problem_bank 与 tag 表字段是否匹配'
    },
    {
      label: '上游',
      value: data.leetcode || '未知',
      ok: data.leetcode === 'configured',
      tip: '用于判断 LeetCode 中文站抓取配置是否就绪'
    }
  ]
})

const formattedHealth = computed(() => JSON.stringify(health.value || {}, null, 2))

async function loadHealth() {
  loading.value = true
  try {
    health.value = await getLeetCodeClawHealth()
  } catch (error) {
    health.value = {
      success: false,
      service: 'unavailable',
      message: error.friendlyMessage || error.message || 'LeetCodeClaw 服务不可用'
    }
    uiMessage.error(health.value.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadHealth)
</script>
