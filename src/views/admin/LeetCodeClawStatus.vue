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

    <!-- 全量抓取面板 -->
    <ui-card shadow="never" class="[border-radius:16px] [border:1px_solid_#e8eef6]">
      <template #header>
        <div class="[display:flex] [justify-content:space-between] [align-items:center] [gap:12px]">
          <span>全量抓取 LeetCode CN 公开题库</span>
          <ui-tag effect="plain">异步任务</ui-tag>
        </div>
      </template>
      <div class="[display:flex] [flex-direction:column] [gap:14px]">
        <p class="[margin:0] [font-size:13px] [color:#64748b] [line-height:1.6]">
          一键抓取 LeetCode 中文站所有公开题目并写入本地题库。任务在后台异步执行，可关闭页面后稍后查看进度。
          同一时间只允许一个全量任务运行。
        </p>
        <div class="[display:flex] [align-items:center] [gap:10px]">
          <ui-button
            type="danger"
            :loading="crawlAllLoading"
            :disabled="!!crawlAllJob"
            @click="startCrawlAll"
          >
            {{ crawlAllJob ? '任务进行中' : '开始全量抓取' }}
          </ui-button>
          <ui-button
            v-if="crawlAllJob && isCrawlAllFinished"
            plain
            @click="crawlAllJob = null"
          >
            清除结果
          </ui-button>
          <ui-button
            v-if="crawlAllJob && !isCrawlAllFinished"
            type="warning"
            plain
            :loading="cancelLoading"
            @click="cancelCrawlAll"
          >
            取消任务
          </ui-button>
        </div>

        <!-- 任务进度 -->
        <div v-if="crawlAllJob" class="[padding:14px] [border-radius:12px] [border:1px_solid_#eef2f7] [background:#f9f9fb]">
          <div class="[display:flex] [align-items:center] [gap:10px] [margin-bottom:12px]">
            <span class="[font-size:14px] [font-weight:700] [color:#0f172a]">
              任务 #{{ crawlAllJob.id }}
            </span>
            <ui-tag size="small" :type="crawlAllStatusType">{{ crawlAllStatusLabel }}</ui-tag>
          </div>

          <!-- 进度条 -->
          <div v-if="crawlAllJob.status === 'running'" class="w-full [height:6px] [border-radius:3px] [background:#e2e8f0] [overflow:hidden] [margin-bottom:10px]">
            <div
              class="[height:100%] [border-radius:3px] [background:linear-gradient(90deg,#3898ff,#007aff)] [transition:width_0.6s_ease]"
              :style="{ width: crawlAllProgress + '%' }"
            ></div>
          </div>

          <!-- 统计指标 -->
          <div class="[display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:10px]">
            <div class="[text-center]">
              <div class="[font-size:18px] [font-weight:800] [color:#0f172a]">{{ crawlAllJob.total }}</div>
              <div class="[font-size:11px] [color:#64748b]">总题数</div>
            </div>
            <div class="[text-center]">
              <div class="[font-size:18px] [font-weight:800] [color:#1e8e3e]">{{ crawlAllJob.succeeded }}</div>
              <div class="[font-size:11px] [color:#64748b]">成功</div>
            </div>
            <div class="[text-center]">
              <div class="[font-size:18px] [font-weight:800]" :class="crawlAllJob.failed > 0 ? '[color:#d93025]' : '[color:#64748b]'">{{ crawlAllJob.failed }}</div>
              <div class="[font-size:11px] [color:#64748b]">失败</div>
            </div>
            <div class="[text-center]">
              <div class="[font-size:18px] [font-weight:800] [color:#64748b]">{{ crawlAllJob.workers }}</div>
              <div class="[font-size:11px] [color:#64748b]">Worker</div>
            </div>
          </div>

          <!-- 失败列表 -->
          <div v-if="crawlAllJobFailedItems.length" class="[margin-top:12px]">
            <div class="[font-size:12px] [font-weight:600] [color:#d93025] [margin-bottom:6px]">
              失败题目 ({{ crawlAllJobFailedItems.length }})
            </div>
            <div class="[max-height:120px] [overflow:auto] [border:1px_solid_#fce8e6] [border-radius:8px] [background:#fff5f5] [padding:8px]">
              <div v-for="f in crawlAllJobFailedItems" :key="f.slug" class="[font-size:11px] [color:#d93025] [padding:2px_0] [border-bottom:1px_solid_#fce8e6] last:[border-bottom:0]">
                <span class="[font-weight:600]">{{ f.slug }}</span>
                <span class="[margin-left:6px] [color:#64748b]">{{ f.error }}</span>
              </div>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-if="crawlAllJob.error" class="[margin-top:10px] [font-size:12px] [color:#d93025]">
            错误：{{ crawlAllJob.error }}
          </div>
        </div>
      </div>
    </ui-card>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import LoadingState from '../../components/LoadingState.vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import {
  cancelCrawlJob,
  crawlAllLeetCodeProblems,
  getCrawlJobStatus,
  getLeetCodeClawHealth
} from '../../api/leetcodeClaw'

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

// --- 全量抓取 ---
const crawlAllLoading = ref(false)
const cancelLoading = ref(false)
const crawlAllJob = ref(null)
let crawlAllPollTimer = null

const crawlAllStatusLabel = computed(() => {
  const s = crawlAllJob.value?.status
  return { queued: '排队中', running: '抓取中', succeeded: '已完成', partial_failed: '部分失败', failed: '失败', canceled: '已取消' }[s] || s || ''
})
const crawlAllStatusType = computed(() => {
  const s = crawlAllJob.value?.status
  if (s === 'succeeded') return 'success'
  if (s === 'partial_failed') return 'warning'
  if (s === 'failed' || s === 'canceled') return 'danger'
  if (s === 'running') return 'primary'
  return 'info'
})
const isCrawlAllFinished = computed(() => {
  const s = crawlAllJob.value?.status
  return s === 'succeeded' || s === 'partial_failed' || s === 'failed' || s === 'canceled'
})
const crawlAllProgress = computed(() => {
  const job = crawlAllJob.value
  if (!job || job.total <= 0) return 0
  return Math.round(((job.succeeded + job.failed) / job.total) * 100)
})
const crawlAllJobFailedItems = computed(() => crawlAllJob.value?.failed || [])

async function startCrawlAll() {
  try {
    await messageBox.confirm(
      '全量抓取将枚举 LeetCode CN 所有公开题目并逐一抓取入库，耗时较长（可能数十分钟）。确定继续？',
      '确认全量抓取',
      { confirmButtonText: '开始抓取', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }

  crawlAllLoading.value = true
  try {
    const res = await crawlAllLeetCodeProblems({ persist: true, forceRefresh: false })
    if (res?.success && res?.jobId) {
      crawlAllJob.value = { id: res.jobId, status: res.status || 'queued', total: 0, succeeded: 0, failed: 0, workers: 0, error: '' }
      pollCrawlAllJob(res.jobId)
      uiMessage.success('全量抓取任务已提交')
    } else {
      uiMessage.warning(res?.message || '任务提交失败')
    }
  } catch (error) {
    uiMessage.error(error.friendlyMessage || error.message || '全量抓取启动失败')
  } finally {
    crawlAllLoading.value = false
  }
}

function pollCrawlAllJob(jobId) {
  if (crawlAllPollTimer) clearInterval(crawlAllPollTimer)
  crawlAllPollTimer = setInterval(async () => {
    try {
      const res = await getCrawlJobStatus(jobId)
      if (res?.success && res?.job) {
        crawlAllJob.value = res.job
        if (isCrawlAllFinished.value) {
          clearInterval(crawlAllPollTimer)
          crawlAllPollTimer = null
          const s = crawlAllJob.value.status
          if (s === 'succeeded') uiMessage.success('全量抓取完成')
          else if (s === 'canceled') uiMessage.warning('全量抓取已取消')
          else if (s === 'partial_failed') uiMessage.warning(`全量抓取完成，${crawlAllJob.value.failed} 题失败`)
          else uiMessage.error('全量抓取失败：' + (crawlAllJob.value.error || '未知错误'))
        }
      }
    } catch {
      // 网络抖动，忽略
    }
  }, 3000)
}

async function cancelCrawlAll() {
  if (!crawlAllJob.value) return
  try {
    await messageBox.confirm('确定取消当前全量抓取任务？已抓取的题目不会回滚。', '取消确认', {
      confirmButtonText: '取消任务',
      cancelButtonText: '继续抓取',
      type: 'warning'
    })
  } catch {
    return
  }
  cancelLoading.value = true
  try {
    const res = await cancelCrawlJob(crawlAllJob.value.id)
    if (res?.success) {
      uiMessage.success('取消指令已发送')
      // 立即刷新一次状态
      const jobRes = await getCrawlJobStatus(crawlAllJob.value.id)
      if (jobRes?.success && jobRes?.job) {
        crawlAllJob.value = jobRes.job
      }
    } else {
      uiMessage.warning(res?.message || '取消失败')
    }
  } catch (error) {
    uiMessage.error(error.friendlyMessage || error.message || '取消失败')
  } finally {
    cancelLoading.value = false
  }
}

onMounted(loadHealth)
onBeforeUnmount(() => { if (crawlAllPollTimer) clearInterval(crawlAllPollTimer) })
</script>
