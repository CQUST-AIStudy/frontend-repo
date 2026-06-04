<template>
  <div class="practice-container [display:flex] [flex-direction:column] [height:100%] [min-height:0] [overflow:hidden]">
    <UiPageHeader class="my-page-header [padding:12px_16px] [flex-shrink:0]" title="推荐练习" description="根据您的学习情况和技能掌握程度AI推荐的练习内容" />

    <div class="[display:flex] [justify-content:flex-end] [margin-bottom:10px] [flex-shrink:0]">
      <ui-button type="primary" plain @click="router.push('/student/leetcode-search')">
        LeetCode 拓展找题
      </ui-button>
    </div>

    <loading-state :loading="loading" class="[flex:1_1_auto] [min-height:0] [display:flex] [flex-direction:column]">
      <div class="practice-content [flex:1_1_auto] [min-height:0] [display:flex] [flex-direction:column]">
        <div class="practice-main-grid">
          <section class="practice-list-column">
            <div class="practice-header [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:16px] [padding-bottom:12px] [border-bottom:1px_solid_#dadce0] [flex-shrink:0]">
              <div class="header-tabs">
                <ui-radio-group v-model="activeTab" size="large">
                  <ui-radio-button label="recommended">为我推荐</ui-radio-button>
                </ui-radio-group>
              </div>

              <div class="header-filter [display:flex] [align-items:center] [gap:10px] [&_.ui-select]:[width:150px]">
                <ui-select v-model="filterDifficulty" placeholder="难度筛选" clearable class="[width:150px]">
                  <ui-option label="简单" value="easy" />
                  <ui-option label="中等" value="medium" />
                  <ui-option label="困难" value="hard" />
                </ui-select>
              </div>
            </div>

            <div class="practice-list [flex:1_1_auto] [min-height:0] [overflow-y:auto] [display:flex] [flex-direction:column] [gap:12px] [padding-right:4px]">
              <ui-empty v-if="filteredPractices.length === 0" description="没有找到符合条件的练习题目" />
              <ui-card v-for="practice in currentPagePractices" :key="practice.id || practice.number" class="practice-card [cursor:pointer] [transition:all_0.3s] [border-left:3px_solid_transparent] hover:[box-shadow:0_4px_12px_rgba(0,_0,_0,_0.1)] hover:[transform:translateY(-2px)] [&.selected]:[border-left-color:#1a73e8] [&.selected]:[background-color:#e8f0fe] [width:100%] [border:1px_solid_#e8eef6] [border-radius:16px] [padding:14px] [background:#fff] [text-align:left] [transition:.2s] [&.completed]:[background:#f6fff7] [&.completed]:[border-color:#bbf7d0] [flex-shrink:0]"
                :class="{ 'selected': selectedPractice?.id === practice.id || selectedPractice?.number === practice.number }" 
                @click="selectPractice(practice)">
                <div v-if="practice.type === 'introduction'" class="introduction-card [padding:10px]">
                  <div class="introduction-title [font-size:16px] [font-weight:500] [color:#1a73e8] [margin-bottom:10px] [border-bottom:1px_solid_#dadce0] [padding-bottom:5px]">AI推荐说明</div>
                  <div class="introduction-content [color:#5f6368] [line-height:1.6]" v-html="getFormattedDescription(practice)"></div>
                </div>
                <div v-else class="practice-card-content [display:flex] [flex-direction:column] [gap:10px]">
                  <div class="practice-title [display:flex] [justify-content:space-between] [align-items:center] [font-size:16px] [font-weight:500] [color:#202124]">
                    <span>{{ practice.title || practice.name }}</span>
                    <div class="match-rate [font-size:14px] [color:#5f6368] [&_.rate]:[color:#f56c6c] [&_.rate]:[font-weight:600]" v-if="practice.matchRate">
                      匹配度<span class="rate">{{ practice.matchRate }}%</span>
                    </div>
                  </div>

                  <div v-if="practice.reason" class="practice-reason [color:#5f6368] [font-size:13px] [line-height:1.5]">
                    {{ practice.reason }}
                  </div>

                  <div class="practice-info [display:flex] [justify-content:flex-end] [align-items:center]">
                    <span class="practice-number [font-size:14px] [color:#909399] [margin-right:10px] [margin-left:10px]" v-if="practice.number">题目 {{practice.number}}</span>
                    <ui-tag size="small" :type="difficultyType(practice.difficulty)">
                      {{ getDifficultyText(practice.difficulty) }}
                    </ui-tag>
                    <ui-tag v-if="practice.estimatedMinutes" size="small" effect="plain" class="[margin-left:8px]">
                      约{{ practice.estimatedMinutes }} 分钟
                    </ui-tag>
                    <ui-button
                      v-if="isTrackableRecommendation(practice)"
                      text
                      type="warning"
                      @click.stop="handleDislike(practice)"
                      class="[margin-left:10px]"
                    >
                      不感兴趣
                    </ui-button>
                    <ui-button type="primary" size="small" @click.stop="startProblem(practice)"
                      class="[margin-left:10px]">
                      开始解答
                    </ui-button>
                  </div>
                </div>
              </ui-card>
            </div>

            <div class="pagination-container [display:flex] [justify-content:flex-end] [margin-top:12px] [padding-top:8px] [border-top:1px_solid_#f0f0f0] [flex-shrink:0]">
              <ui-pagination background layout="prev, pager, next" :total="filteredPractices.length"
                :page-size="pageSize" :current-page="currentPage" @current-change="handlePageChange" />
            </div>
          </section>

          <aside class="practice-side-column">
            <div class="practice-detail [display:flex] [flex-direction:column] [gap:16px] [flex:1_1_auto] [min-height:0]">
              <ui-card v-if="selectedPractice" class="detail-card [flex:1_1_auto] [min-height:0] [display:flex] [flex-direction:column] [overflow:hidden]">
                <template #header>
                  <div class="detail-header [display:flex] [justify-content:space-between] [align-items:center] [&_h3]:[margin:0] [&_h3]:[font-size:16px] [&_h3]:[font-weight:600] [&_h3]:[color:#202124] [gap:12px] [flex-shrink:0]">
                    <h3 class="[flex:1_1_auto] [min-width:0] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">{{ selectedPractice.title || selectedPractice.name }}</h3>
                    <div class="practice-number [font-size:13px] [color:#909399] [flex-shrink:0]" v-if="selectedPractice.number">
                      #{{ selectedPractice.number }}
                    </div>
                    <div class="difficulty-label [padding:4px_8px] [border-radius:4px] [font-size:12px] [font-weight:500] [flex-shrink:0]" :class="'difficulty-' + (selectedPractice.difficulty || 'medium')">
                      {{ getDifficultyText(selectedPractice.difficulty) }}
                    </div>
                  </div>
                </template>

                <div class="detail-content [flex:1_1_auto] [min-height:0] [overflow-y:auto] [display:flex] [flex-direction:column] [gap:12px]">
                  <div v-if="selectedPractice.type === 'introduction'" class="introduction-detail [color:#5f6368] [line-height:1.8] [padding:10px] [background-color:#f8f9fa] [border-radius:4px]">
                    <div v-html="getFormattedDescription(selectedPractice)"></div>
                  </div>
                  <div v-else>
                    <div v-if="selectedPractice.reason" class="recommendation-reason [margin-bottom:12px] [padding:12px] [border-radius:8px] [background:#f7faff] [border-left:4px_solid_#1a73e8]">
                      <h4>推荐理由</h4>
                      <p>{{ selectedPractice.reason }}</p>
                    </div>
                    <div v-if="selectedPractice.estimatedMinutes" class="recommendation-meta [margin-bottom:12px] [color:#5f6368] [font-size:13px]">
                      预计用时 {{ selectedPractice.estimatedMinutes }} 分钟
                    </div>
                    <div class="detail-actions [display:flex] [gap:10px] [margin-top:10px]" v-if="canStartPractice(selectedPractice)">
                      <ui-button
                        v-if="isTrackableRecommendation(selectedPractice)"
                        type="warning"
                        plain
                        @click="handleDislike(selectedPractice)"
                      >
                        不感兴趣
                      </ui-button>
                      <ui-button type="primary" @click="startProblem(selectedPractice)">开始解答</ui-button>
                    </div>
                  </div>
                </div>
              </ui-card>

              <ui-card v-else class="empty-detail [flex:1_1_auto] [min-height:0] [display:flex] [align-items:center] [justify-content:center]">
                <div class="empty-detail-content [text-align:center] [color:#9aa0a6]">
                  <ui-icon><Select /></ui-icon>
                  <p>请从左侧选择一道题目</p>
                </div>
              </ui-card>

              <ui-card class="stats-card [flex-shrink:0]">
                <template #header>
                  <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [gap:12px] [margin-bottom:12px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                    <span>我的练习统计</span>
                  </div>
                </template>

                <div class="stats-content [padding:4px_0]">
                  <div class="stats-item [display:flex] [justify-content:space-between] [margin-bottom:12px]">
                    <div class="stats-label [color:#5f6368]">已完成题目</div>
                    <div class="stats-value [font-weight:600] [color:#202124]">{{ completedCount }}</div>
                  </div>

                  <div class="stats-item [display:flex] [justify-content:space-between] [margin-bottom:12px]">
                    <div class="stats-label [color:#5f6368]">待完成题目</div>
                    <div class="stats-value [font-weight:600] [color:#202124]">{{ pendingCount }}</div>
                  </div>

                  <div class="stats-progress [margin-top:14px]">
                    <div class="progress-header [display:flex] [justify-content:space-between] [margin-bottom:8px] [color:#5f6368]">
                      <span>整体进度</span>
                      <span>{{ completionRate }}%</span>
                    </div>
                    <ui-progress :percentage="completionRate" />
                  </div>
                </div>
              </ui-card>
            </div>
          </aside>
        </div>
      </div>
    </loading-state>    <!-- 题目详情对话框-->
    <ui-dialog v-model="detailDialogVisible" title="题目详情" width="60%" :destroy-on-close="true">
      <div class="practice-detail-dialog [padding:0_20px]" v-if="selectedPractice">
        <div class="detail-header-dialog [display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:20px] [padding-bottom:15px] [border-bottom:1px_solid_#dadce0]">
          <h2>{{ selectedPractice.title || selectedPractice.name }}</h2>
          <div class="practice-number" v-if="selectedPractice.number">
            题目 #{{ selectedPractice.number }}
          </div>
          <ui-tag :type="difficultyType(selectedPractice.difficulty)" class="difficulty-tag [font-size:14px] [padding:6px_12px]">
            {{ getDifficultyText(selectedPractice.difficulty) }}
          </ui-tag>
        </div>

        <div class="detail-section [margin-bottom:25px]" v-if="selectedPractice.type === 'introduction'">
          <div class="section-content [font-size:15px] [line-height:1.8] [color:#111827] [color:#5f6368]" v-html="getFormattedDescription(selectedPractice)"></div>
        </div>

        <div class="detail-actions-dialog [display:flex] [gap:10px] [margin-top:20px] [justify-content:flex-end]" v-if="canStartPractice(selectedPractice)">
          <ui-button type="primary" @click="startProblem(selectedPractice)">开始解题</ui-button>
          <ui-button @click="detailDialogVisible = false">关闭</ui-button>
        </div>
        <div class="detail-actions-dialog [display:flex] [gap:10px] [margin-top:20px] [justify-content:flex-end]" v-else>
          <ui-button @click="detailDialogVisible = false">关闭</ui-button>
        </div>
      </div>
    </ui-dialog>
  </div>
</template>

<script setup>
import { useLearningStore } from '@/store'
import { computed, onMounted, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { useRouter } from 'vue-router'
import api from '@/api'
import { renderSafeMarkdown } from '@/utils/safeHtml'

const router = useRouter()
const learningStore = useLearningStore()
const loading = ref(true)
const activeTab = ref('recommended')
const filterDifficulty = ref('')
const selectedPractice = ref(null)
const currentPage = ref(1)
const pageSize = ref(4)
const detailDialogVisible = ref(false)
const completedProblemIds = ref([])
const dismissedProblemIds = ref([])
const sentFeedbackKeys = ref([])
const recommendationSessionId = ref('')

const COMPLETED_STORAGE_KEY = 'leetcode_completed_problem_ids'
const SESSION_STORAGE_KEY = 'leetcode_recommendation_session_id'

const recommendationRequestId = computed(() => learningStore.recommendedPractices?.requestId || null)

// 所有练习题目
const practices = computed(() => {
  const practicesToReturn = learningStore.recommendedPractices;

  // 检查返回数据的格式并正确处理
  if (practicesToReturn && practicesToReturn.data && Array.isArray(practicesToReturn.data)) {
    // 处理 {data: Array(14), success: true} 格式
    return practicesToReturn.data;
  } else if (Array.isArray(practicesToReturn)) {
    // 如果已经是数组，直接返回
    return practicesToReturn;
  } else {
    logger.warn('获取到的推荐题目格式异常:', practicesToReturn);
    return []; // 如果格式不符，返回空数组避免错误
  }
})

// 筛选后的练习题目
const filteredPractices = computed(() => {
  if (!practices.value || practices.value.length === 0) {
    return [] // 如果没有练习数据，返回空数组
  }

  let result = [...practices.value]

  result = result.filter(practice => !dismissedProblemIds.value.includes(getPracticeProblemId(practice)))

  // 根据标签筛选
  if (activeTab.value === 'recommended') {
    // 按匹配度排序，没有匹配度的排在后面
    result = result.sort((a, b) => {
      if ((b.matchRate || 0) === (a.matchRate || 0)) {
        return (a.id || 0) - (b.id || 0)
      }
      return (b.matchRate || 0) - (a.matchRate || 0)
    })
  }

  // 难度筛选
  if (filterDifficulty.value) {
    result = result.filter(practice => practice.difficulty === filterDifficulty.value)
  }

  return result
})

// 当前页显示的题目
const currentPagePractices = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  return filteredPractices.value.slice(startIndex, startIndex + pageSize.value)
})

// 从列表中选择练习题目
const selectPractice = (practice, options = {}) => {
  if (!practice) return
  selectedPractice.value = practice
  if (options.trackClick !== false) {
    void recordRecommendationFeedback(practice, 'click')
  }
}

const canStartPractice = (practice) => {
  if (!practice) return false
  if (practice.type === 'introduction') return false
  return practice.type === 'problem' ||
    practice.type === 'leetcode_problem' ||
    practice.source === 'leetcode_recommendation' ||
    !!practice.url
}

// 开始解题
const startProblem = (practice) => {
  // 如果传入了practice参数，则使用它，否则使用selectedPractice
  const currentPractice = practice || selectedPractice.value
  if (!currentPractice) return

  detailDialogVisible.value = false
  void recordRecommendationFeedback(currentPractice, 'start')

  // 跳转到内置的LeetCode练习页面
  if (currentPractice.type === 'leetcode_problem' || currentPractice.source === 'leetcode_recommendation') {
    router.push({
      path: `/student/leetcode-practice/${currentPractice.id || currentPractice.problemId}`,
      query: isTrackableRecommendation(currentPractice)
        ? {
            recommendationRequestId: currentPractice.requestId || recommendationRequestId.value,
            recommendationSessionId: recommendationSessionId.value
          }
        : undefined
    })
  } else {
    // 对于其他类型的题目，如果有URL则外部跳转
    const externalUrl = currentPractice.url
    if (externalUrl) {
      window.open(externalUrl, '_blank')
    } else {
      uiMessage.warning('该题目暂不支持在线练习')
    }
  }

  uiMessage.success(`开始解答题目 ${currentPractice.title || currentPractice.name}`)
}

const getPracticeProblemId = (practice) => {
  const candidate = practice?.problemId ?? practice?.id ?? practice?.number
  const parsed = Number(candidate)
  return Number.isFinite(parsed) ? parsed : null
}

const isTrackableRecommendation = (practice) => {
  return practice?.source === 'leetcode_recommendation' &&
    !!(practice?.requestId || recommendationRequestId.value) &&
    !!getPracticeProblemId(practice)
}

const ensureRecommendationSessionId = () => {
  const existing = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (existing) {
    recommendationSessionId.value = existing
    return existing
  }
  const sessionId = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  recommendationSessionId.value = sessionId
  return sessionId
}

const loadCompletedProblemIds = () => {
  try {
    const raw = sessionStorage.getItem(COMPLETED_STORAGE_KEY)
    const ids = raw ? JSON.parse(raw) : []
    completedProblemIds.value = Array.isArray(ids) ? ids.map(item => Number(item)).filter(Number.isFinite) : []
  } catch {
    completedProblemIds.value = []
  }
}

const buildFeedbackKey = (practice, action) => {
  return [
    practice?.requestId || recommendationRequestId.value || 'no_request',
    recommendationSessionId.value || ensureRecommendationSessionId(),
    getPracticeProblemId(practice) || 'no_problem',
    action
  ].join(':')
}

const recordRecommendationFeedback = async (practice, action) => {
  if (!isTrackableRecommendation(practice)) return false

  const feedbackKey = buildFeedbackKey(practice, action)
  if (sentFeedbackKeys.value.includes(feedbackKey)) {
    return true
  }

  const problemId = getPracticeProblemId(practice)
  if (!problemId) return false

  try {
    await api.recordLeetCodeRecommendationFeedback({
      requestId: practice.requestId || recommendationRequestId.value,
      problemId,
      action,
      sessionId: ensureRecommendationSessionId()
    })
    sentFeedbackKeys.value = [...sentFeedbackKeys.value, feedbackKey]
    return true
  } catch (error) {
    logger.warn('记录推荐反馈失败:', action, problemId, error)
    return false
  }
}

const trackVisiblePracticeExposure = async () => {
  for (const practice of currentPagePractices.value) {
    await recordRecommendationFeedback(practice, 'exposure')
  }
}

const markPracticeAsDismissed = (practice) => {
  const problemId = getPracticeProblemId(practice)
  if (!problemId || dismissedProblemIds.value.includes(problemId)) return
  dismissedProblemIds.value = [...dismissedProblemIds.value, problemId]

  const remaining = filteredPractices.value.filter(item => getPracticeProblemId(item) !== problemId)
  if (selectedPractice.value && getPracticeProblemId(selectedPractice.value) === problemId) {
    selectedPractice.value = remaining[0] || null
  }
}

const handleDislike = async (practice) => {
  const ok = await recordRecommendationFeedback(practice, 'dislike')
  if (ok) {
    markPracticeAsDismissed(practice)
    uiMessage.success('已降低该题后续推荐优先级')
  }
}

// 处理分页和显示当前页内容
const handlePageChange = (page) => {
  currentPage.value = page
  void trackVisiblePracticeExposure()
}

// 获取难度对应的样式类型
const difficultyType = (difficulty) => {
  const typeMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return typeMap[difficulty] || 'info'
}

// 获取难度的中文名称
const getDifficultyText = (difficulty) => {
  const textMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return textMap[difficulty] || '中等'
}

// 获取题目描述
const getPracticeDescription = (practice) => {
  if (!practice) return ''

  // 如果是introduction类型，直接返回content
  if (practice.type === 'introduction' && practice.content) {
    return practice.content
  }

  // 优先使用description字段
  if (practice.description !== undefined && practice.description !== '') {
    return practice.description
  }

  // 然后尝试remainingPart字段
  if (practice.remainingPart) {
    return practice.remainingPart
  }

  // 再尝试describe字段
  if (practice.describe) {
    return practice.describe
  }

  // 如果没有描述，根据ID获取默认描述
  const descriptionMap = {
    1: '给定一个单链表，请将它反转并返回反转后的链表头节点。\n\n例如，输入链表1->2->3->4->5，反转后应输出5->4->3->2->1。',
    2: '给定一个只包含字符 \'(\'，\')\'，\'{\'，\'}\'，\'[\'，\']\' 的字符串，判断字符串中的括号是否有效。有效字符串需满足：\n1. 左括号必须用相同类型的右括号闭合\n2. 左括号必须以正确的顺序闭合',
    3: '给定一个二叉树，返回其按层次遍历的节点值（即逐层地，从左到右访问所有节点）。',
    4: '实现Dijkstra算法求解图的最短路径问题。给定一个带权有向图，找出从源点到目标点的最短路径。',
    5: '实现快速排序算法，并分析其时间复杂度和空间复杂度。思考如何优化算法在不同情况下的性能。'
  }

  // 使用题目名称加默认描述
  const id = practice.id || practice.number || 0
  return descriptionMap[id] || `完成${practice.title || practice.name || '该题目'}的要求，并提交结果。`
}

// 获取格式化的描述
const getFormattedDescription = (practice) => {
  return renderSafeMarkdown(getPracticeDescription(practice))
}

// 统计数据
const completedCount = computed(() => {
  const currentIds = practices.value
    .map(item => getPracticeProblemId(item))
    .filter(Number.isFinite)
  return completedProblemIds.value.filter(id => currentIds.includes(id)).length
})

const pendingCount = computed(() => {
  return filteredPractices.value.length - completedCount.value
})

const completionRate = computed(() => {
  if (filteredPractices.value.length === 0) return 0
  return Math.round((completedCount.value / filteredPractices.value.length) * 100)
})

// 监听筛选变化
watch([activeTab, filterDifficulty], () => {
  // 切换筛选条件时，重置到第一页
  currentPage.value = 1

  // 如果有筛选后的数据，选择第一个
  if (filteredPractices.value.length > 0) {
    selectPractice(filteredPractices.value[0], { trackClick: false })
  } else {
    selectedPractice.value = null
  }
  void trackVisiblePracticeExposure()
})

// 初始化组件
onMounted(async () => {
  loading.value = true
  try {
    ensureRecommendationSessionId()
    loadCompletedProblemIds()

    // 确保分析数据已加载
    if (!learningStore.analysisData) {
      await learningStore.fetchLearningAnalysis()
    }

    // 获取推荐练习
    await learningStore.fetchRecommendedPractices()

    // 如果有练习数据，默认选中第一个
    if (filteredPractices.value.length > 0) {
      selectPractice(filteredPractices.value[0], { trackClick: false })
    }
    await trackVisiblePracticeExposure()

  } catch (error) {
    logger.error('加载推荐练习失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.practice-container {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.practice-container > .my-page-header {
  margin-bottom: 10px !important;
  padding: 10px 16px !important;
  border-radius: 16px !important;
}

.practice-container > :deep(.g-loading-state) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.practice-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.practice-main-grid {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
  gap: 18px;
  height: 100%;
  min-height: 0;
  width: 100%;
}

.practice-list-column,
.practice-side-column {
  display: flex !important;
  flex-direction: column !important;
  width: auto !important;
  min-width: 0;
  max-width: none !important;
  min-height: 0;
  padding: 0 !important;
}

.practice-header {
  gap: 12px;
  margin-bottom: 10px !important;
  padding-bottom: 10px !important;
}

.practice-list {
  gap: 10px !important;
  min-height: 0;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.practice-card {
  border-radius: 14px !important;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05) !important;
}

.practice-card:hover {
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.09) !important;
}

.practice-card :deep(.ui-card__body) {
  padding: 14px 16px !important;
}

.practice-card-content {
  gap: 8px !important;
}

.practice-title {
  gap: 12px;
  font-size: 15px !important;
  font-weight: 600 !important;
}

.practice-title > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.practice-reason {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.practice-info {
  gap: 8px;
  flex-wrap: wrap;
}

.practice-info .practice-number,
.practice-info :deep(.ui-button),
.practice-info :deep(.ui-tag) {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.practice-info :deep(.ui-button) {
  min-height: 32px;
  padding: 6px 12px;
}

.practice-container .pagination-container {
  margin-top: 10px !important;
  padding-top: 8px !important;
  padding-bottom: 0 !important;
  overflow-x: visible !important;
}

.practice-detail {
  display: grid !important;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 12px !important;
  height: 100%;
  min-height: 0;
}

.detail-card,
.empty-detail {
  min-height: 0;
}

.detail-card :deep(.ui-card__header) {
  padding: 14px 18px 12px !important;
}

.detail-card :deep(.ui-card__body) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  padding: 14px 18px !important;
  overflow: hidden;
}

.detail-content {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.recommendation-reason {
  margin-bottom: 10px !important;
  padding: 10px 12px !important;
}

.recommendation-reason h4,
.recommendation-reason p {
  margin: 0;
}

.recommendation-reason p {
  margin-top: 6px;
  line-height: 1.55;
}

.stats-card :deep(.ui-card__header) {
  padding: 14px 18px 10px !important;
}

.stats-card :deep(.ui-card__body) {
  padding: 14px 18px 16px !important;
}

.stats-card .card-header {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
  border-bottom: 0 !important;
}

.stats-content {
  padding: 0 !important;
}

.stats-item {
  margin-bottom: 10px !important;
}

.stats-progress {
  margin-top: 10px !important;
}

@media (max-width: 960px) {
  .practice-container {
    min-height: calc(100dvh - 120px);
    overflow: visible;
  }

  .practice-content {
    overflow: visible;
  }

  .practice-main-grid {
    display: flex !important;
    flex-direction: column;
    height: auto;
  }

  .practice-side-column {
    margin-top: 12px;
  }

  .practice-list {
    max-height: 48dvh;
    min-height: 260px;
  }

  .practice-detail {
    height: auto;
  }

  .detail-card {
    max-height: 44dvh;
  }
}

@media (max-width: 640px) {
  .practice-container > .my-page-header {
    margin-bottom: 8px !important;
    padding: 10px 12px !important;
  }

  .practice-header {
    align-items: stretch !important;
    flex-direction: column;
  }

  .header-filter,
  .header-filter :deep(.ui-select) {
    width: 100% !important;
  }

  .practice-card :deep(.ui-card__body),
  .detail-card :deep(.ui-card__body),
  .stats-card :deep(.ui-card__body) {
    padding: 12px !important;
  }

  .practice-info {
    justify-content: flex-start !important;
  }
}
</style>
