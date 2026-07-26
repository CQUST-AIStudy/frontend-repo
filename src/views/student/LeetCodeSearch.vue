<template>
  <div class="leetcode-search page [display:flex] [flex-direction:column] [gap:16px] [height:100%] [min-height:0]">
    <UiPageHeader
      title="LeetCode 拓展练习"
      description="基于个性化推荐结果筛选 LeetCode 题目，支持关键词与难度过滤。"
    >
    </UiPageHeader>

    <ui-card shadow="never" class="[border-radius:16px] [border:1px_solid_#e8eef6]">
      <div class="search-form [display:grid] [grid-template-columns:minmax(180px,_1fr)_160px_120px_auto] [gap:12px] [align-items:end] max-[860px]:[grid-template-columns:1fr]">
        <label class="[display:flex] [flex-direction:column] [gap:6px] [font-size:13px] [color:#475569]">
          知识点关键词
          <ui-input v-model="keyword" placeholder="例如：动态规划、链表、栈" @keyup.enter="searchProblems" />
        </label>
        <label class="[display:flex] [flex-direction:column] [gap:6px] [font-size:13px] [color:#475569]">
          难度
          <ui-select v-model="difficulty" clearable placeholder="不限">
            <ui-option label="简单" value="Easy" />
            <ui-option label="中等" value="Medium" />
            <ui-option label="困难" value="Hard" />
          </ui-select>
        </label>
        <label class="[display:flex] [flex-direction:column] [gap:6px] [font-size:13px] [color:#475569]">
          数量
          <ui-input v-model.number="limit" type="number" min="1" max="50" />
        </label>
        <ui-button type="primary" :loading="loading" @click="searchProblems">筛选推荐题目</ui-button>
      </div>
    </ui-card>

    <div class="[flex:1] [min-height:0]">
      <div v-if="loading" class="search-progress-panel [min-height:360px] [display:flex] [align-items:center] [justify-content:center] [padding:32px]">
        <div class="search-progress-card [width:min(520px,_100%)] [background:white] [border:1px_solid_#e5edf7] [border-radius:16px] [padding:28px_32px] [box-shadow:0_12px_32px_rgba(15,_23,_42,_0.08)]">
          <div class="[display:flex] [align-items:center] [justify-content:space-between] [gap:16px] [margin-bottom:14px]">
            <span class="[font-size:16px] [font-weight:700] [color:#0f172a]">正在加载个性化推荐</span>
            <strong class="[font-size:24px] [color:#d18a61]">{{ searchProgress }}%</strong>
          </div>
          <div class="[height:10px] [border-radius:999px] [background:#e8f1ff] [overflow:hidden]">
            <div
              class="[height:100%] [border-radius:999px] [background:linear-gradient(90deg,_#dda784,_#ac6843)] [transition:width_0.28s_ease]"
              :style="{ width: `${searchProgress}%` }"
            ></div>
          </div>
          <div class="[margin-top:12px] [font-size:13px] [color:#64748b] [text-align:center]">
            正在为你筛选 {{ normalizedLimit }} 道个性化 LeetCode 推荐题
          </div>
        </div>
      </div>
      <div v-else-if="items.length" class="result-list [display:grid] [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:12px] max-[960px]:[grid-template-columns:1fr]">
        <ui-card
          v-for="item in items"
          :key="`${item.requestId || 'direct'}-${item.problemId || item.id || item.slug}`"
          shadow="hover"
          class="[border-radius:16px] [border:1px_solid_#e8eef6]"
        >
          <div class="[display:flex] [justify-content:space-between] [gap:12px] [align-items:flex-start]">
            <div class="[min-width:0]">
              <div class="[font-size:16px] [font-weight:700] [color:#0f172a] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                {{ item.title }}
              </div>
              <div class="[margin-top:6px] [display:flex] [gap:8px] [flex-wrap:wrap]">
                <ui-tag size="small" :type="getDifficultyType(item.difficulty)">{{ getDifficultyText(item.difficulty) }}</ui-tag>
                <ui-tag v-if="item.number" size="small" effect="plain">#{{ item.number }}</ui-tag>
                <ui-tag v-if="item.matchRate !== null" size="small" effect="plain">匹配 {{ item.matchRate }}%</ui-tag>
              </div>
            </div>
            <ui-button type="primary" size="small" @click="startPractice(item)">
              开始练习
            </ui-button>
          </div>
          <p class="[margin:12px_0_0] [font-size:13px] [line-height:1.6] [color:#64748b]">{{ item.reason }}</p>
          <div v-if="item.errors.length" class="[margin-top:10px] [font-size:12px] [color:#d93025]">
            {{ item.errors.join('；') }}
          </div>
          <div v-if="item.sourceUrl" class="[margin-top:10px] [display:flex] [align-items:center] [gap:8px]">
            <ui-tag size="small" type="primary" effect="plain">{{ item.sourceLabel || 'LeetCode' }}</ui-tag>
            <a :href="item.sourceUrl" target="_blank" rel="noopener noreferrer"
              class="[display:inline-flex] [align-items:center] [gap:3px] [font-size:12px] [color:#1a73e8] [text-decoration:none] hover:[text-decoration:underline]">
              <span>前往原题</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </ui-card>
      </div>
      <ui-empty v-else description="输入关键词或难度后，可在个性化推荐结果中进一步筛选 LeetCode 题目。" :image-size="96" />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message as uiMessage } from '@/services/feedback'
import {
  getDifficultyText,
  getDifficultyType,
  getPersonalizedLeetCodeRecommendations,
  mapProblemToPractice,
  mapRecommendationItemToPractice,
  searchLeetCodeProblems
} from '../../api/leetcodeClaw'

const route = useRoute()
const router = useRouter()
const keyword = ref(String(route.query.keyword || ''))
const difficulty = ref('')
const limit = ref(5)
const loading = ref(false)
const searchProgress = ref(0)
const progressTimer = ref(null)
const items = ref([])

const RECOMMENDATION_SESSION_STORAGE_KEY = 'leetcode_recommendation_session_id'
const SEARCH_PROGRESS_CAP = 94
const normalizedLimit = computed(() => Math.min(Math.max(Number(limit.value) || 5, 1), 50))

async function searchProblems() {
  const value = keyword.value.trim()
  const requestLimit = normalizedLimit.value
  limit.value = requestLimit
  loading.value = true
  startSearchProgress()
  try {
    const res = await getPersonalizedLeetCodeRecommendations({
      limit: requestLimit
    })
    finishSearchProgress()

    const requestId = res?.requestId || null
    const recommendationItems = Array.isArray(res?.items) ? res.items : []
    items.value = recommendationItems
      .map(item => mapRecommendationItemToPractice({
        ...item,
        requestId: item.requestId || requestId
      }))
      .filter(item => matchesPersonalizedFilters(item, value, difficulty.value))

    if (!items.value.length) {
      const fallbackItems = await loadProblemBankFallback(value, requestLimit)
      items.value = fallbackItems
      uiMessage.warning(fallbackItems.length
        ? '当前个性化推荐中没有匹配题目，已展示题库筛选结果。'
        : '暂未获取到符合条件的 LeetCode 题目。')
    }
  } catch (error) {
    try {
      const fallbackItems = await loadProblemBankFallback(value, requestLimit)
      items.value = fallbackItems
      if (fallbackItems.length) {
        finishSearchProgress()
        uiMessage.warning('个性化推荐服务暂不可用，已展示题库筛选结果。')
      } else {
        uiMessage.error(error.friendlyMessage || error.message || '加载个性化推荐失败')
      }
    } catch {
      items.value = []
      uiMessage.error(error.friendlyMessage || error.message || '加载个性化推荐失败')
    }
  } finally {
    stopSearchProgress()
    loading.value = false
  }
}

async function loadProblemBankFallback(keywordValue, requestLimit) {
  const response = await searchLeetCodeProblems({
    keyword: keywordValue,
    difficulty: difficulty.value,
    limit: requestLimit,
    offset: 0
  })
  const rows = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.items)
      ? response.items
      : Array.isArray(response)
        ? response
        : []
  return rows.map(mapProblemToPractice)
}

function matchesPersonalizedFilters(item, keywordValue, difficultyValue) {
  const normalizedKeyword = String(keywordValue || '').trim().toLowerCase()
  const normalizedDifficulty = String(difficultyValue || '').trim().toLowerCase()
  const title = String(item?.title || item?.name || '').toLowerCase()
  const reason = String(item?.reason || '').toLowerCase()
  const number = String(item?.number || '').toLowerCase()
  const itemDifficulty = String(item?.difficulty || '').toLowerCase()

  const matchesKeyword = !normalizedKeyword ||
    title.includes(normalizedKeyword) ||
    reason.includes(normalizedKeyword) ||
    number.includes(normalizedKeyword)
  const matchesDifficulty = !normalizedDifficulty || itemDifficulty === normalizedDifficulty

  return matchesKeyword && matchesDifficulty
}

function startSearchProgress() {
  stopSearchProgress()
  searchProgress.value = getRandomInteger(6, 13)
  scheduleSearchProgressTick()
}

function scheduleSearchProgressTick() {
  progressTimer.value = window.setTimeout(() => {
    if (searchProgress.value >= SEARCH_PROGRESS_CAP) {
      progressTimer.value = null
      return
    }

    const step = Math.min(getProgressStep(searchProgress.value), SEARCH_PROGRESS_CAP - searchProgress.value)
    searchProgress.value += step
    scheduleSearchProgressTick()
  }, getRandomInteger(220, 520))
}

function getProgressStep(currentProgress) {
  if (currentProgress < 40) return getRandomInteger(3, 9)
  if (currentProgress < 75) return getRandomInteger(2, 6)
  return getRandomInteger(1, 3)
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function finishSearchProgress() {
  searchProgress.value = 100
}

function stopSearchProgress() {
  if (progressTimer.value) {
    window.clearTimeout(progressTimer.value)
    progressTimer.value = null
  }
}

async function startPractice(item) {
  if (!item?.id) return
  uiMessage.success('正在进入练习...')
  router.push({
    path: `/student/leetcode-practice/${item.id}`,
    query: item.requestId
      ? {
          recommendationRequestId: item.requestId,
          recommendationSessionId: ensureRecommendationSessionId()
        }
      : undefined
  })
}

function ensureRecommendationSessionId() {
  const existing = sessionStorage.getItem(RECOMMENDATION_SESSION_STORAGE_KEY)
  if (existing) {
    return existing
  }
  const sessionId = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  sessionStorage.setItem(RECOMMENDATION_SESSION_STORAGE_KEY, sessionId)
  return sessionId
}

searchProblems()

onBeforeUnmount(() => {
  stopSearchProgress()
})
</script>
