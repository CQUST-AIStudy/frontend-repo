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
import { computed, onMounted, ref } from 'vue'
import { message as uiMessage } from '@/services/feedback'
import {
  crawlLeetCodeProblems,
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
</script>
