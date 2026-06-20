<template>
  <div class="leetcode-bank page [display:flex] [flex-direction:column] [gap:16px]">
    <UiPageHeader
      title="LeetCode 题库管理"
      description="检查 LeetCodeClaw 服务状态，按 slug 或关键词抓取题目并写入本地题库"
    >
      <ui-button plain :loading="healthLoading" @click="loadHealth">检查服务</ui-button>
    </UiPageHeader>

    <div class="status-grid [display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:12px] max-[960px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[640px]:[grid-template-columns:1fr]">
      <ui-card v-for="item in healthCards" :key="item.label" shadow="never" class="[border-radius:16px] [border:1px_solid_#e8eef6]">
        <div class="[font-size:12px] [color:#64748b]">{{ item.label }}</div>
        <div class="[margin-top:6px] [font-size:18px] [font-weight:700]" :class="item.ok ? '[color:#1e8e3e]' : '[color:#d93025]'">
          {{ item.value }}
        </div>
      </ui-card>
    </div>

    <div class="main-grid [display:grid] [grid-template-columns:minmax(0,_1fr)_minmax(360px,_0.8fr)] [gap:16px] max-[1100px]:[grid-template-columns:1fr]">
      <ui-card shadow="never" class="[border-radius:16px] [border:1px_solid_#e8eef6]">
        <template #header>
          <div class="[display:flex] [justify-content:space-between] [align-items:center] [gap:12px]">
            <span>按 slug 抓题入库</span>
            <ui-tag effect="plain">persist=true</ui-tag>
          </div>
        </template>
        <div class="[display:flex] [flex-direction:column] [gap:12px]">
          <ui-input
            v-model="slugText"
            type="textarea"
            :rows="5"
            resize="none"
            placeholder="每行一个 slug，例如：two-sum"
          />
          <div class="[display:flex] [justify-content:flex-end] [gap:10px]">
            <ui-button plain @click="slugText = 'two-sum'">示例</ui-button>
            <ui-button type="primary" :loading="crawlLoading" @click="crawlSlugs">抓取并入库</ui-button>
          </div>
        </div>
      </ui-card>

      <ui-card shadow="never" class="[border-radius:16px] [border:1px_solid_#e8eef6]">
        <template #header>关键词推荐候选</template>
        <div class="[display:flex] [flex-direction:column] [gap:12px]">
          <ui-input v-model="keyword" placeholder="例如：动态规划、二叉树、栈" @keyup.enter="searchKeyword" />
          <div class="[display:grid] [grid-template-columns:1fr_100px] [gap:10px]">
            <ui-select v-model="difficulty" clearable placeholder="不限难度">
              <ui-option label="简单" value="Easy" />
              <ui-option label="中等" value="Medium" />
              <ui-option label="困难" value="Hard" />
            </ui-select>
            <ui-input v-model.number="limit" type="number" min="1" max="50" />
          </div>
          <ui-button type="primary" :loading="searchLoading" @click="searchKeyword">搜索候选题</ui-button>
        </div>
      </ui-card>
    </div>

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
              class="[height:100%] [border-radius:3px] [background:linear-gradient(90deg,#d49068,var(--app-primary))] [transition:width_0.6s_ease]"
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

    <ui-card shadow="never" class="[border-radius:16px] [border:1px_solid_#e8eef6]">
      <template #header>
        <div class="[display:flex] [justify-content:space-between] [align-items:center] [gap:12px]">
          <span>抓取结果</span>
          <ui-button v-if="candidateItems.length" type="primary" plain :loading="batchPersistLoading" @click="persistCandidates">
            批量入库候选题
          </ui-button>
        </div>
      </template>

      <div v-if="displayItems.length" class="[display:flex] [flex-direction:column] [gap:10px]">
        <div
          v-for="item in displayItems"
          :key="item.slug"
          class="[display:flex] [justify-content:space-between] [gap:14px] [align-items:flex-start] [padding:14px] [border:1px_solid_#eef2f7] [border-radius:12px] [background:#fff]"
        >
          <div class="[min-width:0]">
            <div class="[font-weight:700] [color:#0f172a]">{{ item.title }}</div>
            <div class="[margin-top:6px] [display:flex] [gap:8px] [flex-wrap:wrap]">
              <ui-tag size="small" :type="getDifficultyType(item.difficulty)">{{ getDifficultyText(item.difficulty) }}</ui-tag>
              <ui-tag size="small" effect="plain">{{ item.slug }}</ui-tag>
              <ui-tag v-if="item.problemId" size="small" type="success">本地 ID {{ item.problemId }}</ui-tag>
            </div>
            <p class="[margin:8px_0_0] [font-size:13px] [color:#64748b]">{{ item.reason }}</p>
            <div v-if="item.errors.length" class="[margin-top:8px] [font-size:12px] [color:#d93025]">{{ item.errors.join('；') }}</div>
          </div>
          <ui-button v-if="!item.problemId" size="small" type="primary" :loading="persistingSlug === item.slug" @click="persistOne(item)">
            入库
          </ui-button>
        </div>
      </div>
      <ui-empty v-else description="暂无抓取结果" :image-size="80" />
    </ui-card>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import {
  crawlAllLeetCodeProblems,
  crawlLeetCodeProblems,
  getCrawlJobStatus,
  getDifficultyText,
  getDifficultyType,
  getLeetCodeClawHealth,
  mapClawItemToPractice,
  persistClawProblemBySlug,
  recommendLeetCodeByKeyword
} from '../../api/leetcodeClaw'

const health = ref(null)
const healthLoading = ref(false)
const slugText = ref('')
const crawlLoading = ref(false)
const keyword = ref('')
const difficulty = ref('')
const limit = ref(10)
const searchLoading = ref(false)
const batchPersistLoading = ref(false)
const persistingSlug = ref('')
const displayItems = ref([])
const candidateItems = ref([])

// --- 全量抓取 ---
const crawlAllLoading = ref(false)
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
          else if (s === 'partial_failed') uiMessage.warning(`全量抓取完成，${crawlAllJob.value.failed} 题失败`)
          else uiMessage.error('全量抓取失败：' + (crawlAllJob.value.error || '未知错误'))
        }
      }
    } catch {
      // 网络抖动，忽略
    }
  }, 3000)
}

const healthCards = computed(() => {
  const data = health.value || {}
  return [
    { label: '服务', value: data.service || '未检查', ok: data.success === true },
    { label: '数据库', value: data.database || '未知', ok: data.database === 'ok' },
    { label: '表结构', value: data.schema || '未知', ok: data.schema === 'ok' },
    { label: 'LeetCode', value: data.leetcode || '未知', ok: data.leetcode === 'configured' }
  ]
})

function parseSlugs() {
  return slugText.value
    .split(/[\n,，\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
}

async function loadHealth() {
  healthLoading.value = true
  try {
    health.value = await getLeetCodeClawHealth()
  } catch (error) {
    health.value = { success: false, service: '不可用', database: '未知', schema: '未知', leetcode: '未知' }
    uiMessage.error(error.friendlyMessage || error.message || 'LeetCodeClaw 服务不可用')
  } finally {
    healthLoading.value = false
  }
}

async function crawlSlugs() {
  const slugs = parseSlugs()
  if (!slugs.length) {
    uiMessage.warning('请先输入题目 slug')
    return
  }
  crawlLoading.value = true
  try {
    const res = await crawlLeetCodeProblems({ slugs, persist: true })
    displayItems.value = (res?.items || []).map(mapClawItemToPractice)
    candidateItems.value = []
    if (res?.failed?.length) {
      uiMessage.warning(`部分题目抓取失败：${res.failed.map(item => item.slug || item.error).join('，')}`)
    } else {
      uiMessage.success('题目抓取入库完成')
    }
  } catch (error) {
    uiMessage.error(error.friendlyMessage || error.message || '抓取题目失败')
  } finally {
    crawlLoading.value = false
  }
}

async function searchKeyword() {
  const value = keyword.value.trim()
  if (!value) {
    uiMessage.warning('请先输入关键词')
    return
  }
  searchLoading.value = true
  try {
    const res = await recommendLeetCodeByKeyword({
      keyword: value,
      limit: Math.min(Math.max(Number(limit.value) || 10, 1), 50),
      difficulty: difficulty.value,
      persist: false
    })
    candidateItems.value = (res?.items || []).map(mapClawItemToPractice)
    displayItems.value = candidateItems.value
    if (!displayItems.value.length) uiMessage.warning('暂未找到候选题')
  } catch (error) {
    uiMessage.error(error.friendlyMessage || error.message || '搜索候选题失败')
  } finally {
    searchLoading.value = false
  }
}

async function persistOne(item) {
  if (!item?.slug) return
  persistingSlug.value = item.slug
  try {
    const result = await persistClawProblemBySlug(item.slug)
    const mapped = mapClawItemToPractice(result.item)
    displayItems.value = displayItems.value.map(row => row.slug === item.slug ? mapped : row)
    candidateItems.value = candidateItems.value.filter(row => row.slug !== item.slug)
    uiMessage.success('题目已入库')
  } catch (error) {
    uiMessage.error(error.friendlyMessage || error.message || '题目入库失败')
  } finally {
    persistingSlug.value = ''
  }
}

async function persistCandidates() {
  const slugs = candidateItems.value.map(item => item.slug).filter(Boolean)
  if (!slugs.length) return
  batchPersistLoading.value = true
  try {
    const res = await crawlLeetCodeProblems({ slugs, persist: true })
    displayItems.value = (res?.items || []).map(mapClawItemToPractice)
    candidateItems.value = []
    uiMessage.success('候选题批量入库完成')
  } catch (error) {
    uiMessage.error(error.friendlyMessage || error.message || '批量入库失败')
  } finally {
    batchPersistLoading.value = false
  }
}

onMounted(loadHealth)
onBeforeUnmount(() => { if (crawlAllPollTimer) clearInterval(crawlAllPollTimer) })
</script>
