<template>
  <div class="page [display:flex] [flex-direction:column] [gap:20px]">
    <UiPageHeader title="错题本与专项训练" description="把薄弱点转成回炉计划、专项题单和掌握度回升记录。">
      <ui-button plain @click="goPractice">推荐练习</ui-button>
      <ui-button type="primary" :loading="loading" @click="loadPageData">刷新数据</ui-button>
    </UiPageHeader>

    <loading-state :loading="loading">
      <div v-if="weaknessCards.length" class="content [display:flex] [flex-direction:column] [gap:20px]">
        <div class="summary-grid [display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:16px] max-[1200px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[760px]:[grid-template-columns:1fr]">
          <ui-card v-for="item in summaryCards" :key="item.label" class="summary-card [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[gap:14px] [&_.ui-card__body]:[align-items:center] [&_.ui-card__body]:[padding:18px]" shadow="hover">
            <div class="summary-icon [width:44px] [height:44px] [border-radius:14px] [display:flex] [align-items:center] [justify-content:center]" :class="summaryIconClass(item)">
              <ui-icon><component :is="item.icon" /></ui-icon>
            </div>
            <div>
              <div class="summary-value [font-size:24px] [font-weight:700] [color:#0f172a]">{{ item.value }}</div>
              <div class="summary-label [color:#475569] [font-size:13px]">{{ item.label }}</div>
              <div class="summary-tip [color:#64748b] [font-size:12px]">{{ item.tip }}</div>
            </div>
          </ui-card>
        </div>

        <div class="main-grid [display:grid] [grid-template-columns:minmax(320px,_360px)_minmax(0,_1fr)] [gap:20px] max-[1200px]:[grid-template-columns:1fr]">
          <ui-card class="panel [border-radius:20px] [border:1px_solid_#e7edf4]" shadow="hover">
            <template #header>
              <div class="panel-head [display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [flex-wrap:wrap]">
                <span>薄弱点总览</span>
                <ui-tag type="danger" effect="plain">{{ weaknessCards.length }} 个</ui-tag>
              </div>
            </template>

            <div class="weakness-list [display:flex] [flex-direction:column] [gap:12px]">
              <UiButton
                v-for="item in weaknessCards"
                :key="item.experimentId"
                class="weakness-card [background:#fff] [border:1px_solid_#e8eef6] [border-radius:16px] [padding:14px] [position:relative] [width:100%] [text-align:left] [cursor:pointer] [transition:.2s] hover:[border-color:#93c5fd] hover:[box-shadow:0_10px_24px_rgba(30,_64,_175,_0.08)] hover:[transform:translateY(-1px)] [&.active]:[border-color:#93c5fd] [&.active]:[box-shadow:0_10px_24px_rgba(30,_64,_175,_0.08)] [&.active]:[transform:translateY(-1px)] [display:flex] [flex-direction:column] [align-items:stretch] [justify-content:flex-start] [white-space:normal] [gap:0] [min-height:auto]"
                :class="{ active: item.experimentId === selectedWeaknessId }"
                @click="selectWeakness(item.experimentId)"
              >
                <div class="card-row [display:flex] [align-items:center] [justify-content:space-between] [gap:10px]">
                  <div class="[min-width:0] [overflow:hidden] [flex:1]">
                    <div class="title [color:#0f172a] [font-size:15px] [font-weight:700] [&.small]:[font-size:14px] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">{{ item.experimentName }}</div>
                    <div class="muted [color:#98a2b3] [font-size:12px] [color:#64748b] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">{{ item.dimension }} · 掌握度{{ item.mastery }} 分</div>
                  </div>
                  <ui-tag class="[flex-shrink:0]" :type="item.estimatedMastery >= 70 ? 'success' : item.estimatedMastery >= 50 ? 'warning' : 'danger'">
                    估算 {{ item.estimatedMastery }}
                  </ui-tag>
                </div>
                <ui-progress :percentage="item.planProgress" :stroke-width="10" class="[margin-top:10px]" />
                <div class="meta-line [display:flex] [flex-wrap:wrap] [gap:10px] [margin-top:8px] [color:#64748b] [font-size:12px]">
                  <span>计划 {{ item.completedCount }}/{{ item.targetCount || item.recommendedPracticeCount }}</span>
                  <span>错题 {{ item.weakQuestionCount }}</span>
                  <span>回炉 {{ item.acceptedReviewCount }}</span>
                </div>
              </UiButton>
            </div>

            <div class="section-title [margin-bottom:12px] [font-size:16px] [font-family:'SimSun',_serif] [margin:6px_0_2px] [color:#334155] [font-size:13px] [font-weight:600] [margin:0] [font-weight:500] [color:#303133]">最近回炉记录</div>
            <ui-timeline v-if="recentReviewRecords.length">
              <ui-timeline-item
                v-for="record in recentReviewRecords"
                :key="record.id"
                :type="record.accepted ? 'success' : 'warning'"
                :timestamp="formatTime(record.createdAt)"
              >
                <div class="title small [color:#0f172a] [font-size:15px] [font-weight:700] [&.small]:[font-size:14px]">{{ record.problemTitle }}</div>
                <div class="muted [color:#98a2b3] [font-size:12px] [color:#64748b]">{{ record.dimension || '专项训练' }} · {{ record.accepted ? '通过提交' : '已尝试' }}</div>
              </ui-timeline-item>
            </ui-timeline>
            <ui-empty v-else description="还没有回炉记录" :image-size="68" />
          </ui-card>

          <div v-if="selectedWeakness" class="detail-column [display:flex] [flex-direction:column] [gap:20px]">
            <ui-card class="panel" shadow="hover">
              <template #header>
                <div class="panel-head [display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [flex-wrap:wrap]">
                  <div>
                    <div class="title [color:#0f172a] [font-size:15px] [font-weight:700] [&.small]:[font-size:14px]">{{ selectedWeakness.experimentName }}</div>
                    <div class="muted [color:#98a2b3] [font-size:12px] [color:#64748b]">{{ selectedWeakness.dimension }} · {{ selectedWeakness.evidenceSummary }}</div>
                  </div>
                  <div class="action-row [display:flex] [align-items:center] [gap:8px] [justify-content:space-between] [gap:10px] [flex-wrap:wrap]">
                    <ui-button plain @click="resetPlan(selectedWeakness)">重置计划</ui-button>
                    <ui-button type="primary" @click="buildPlan(selectedWeakness)">
                      {{ selectedWeakness.hasPlan ? '更新计划' : '生成计划' }}
                    </ui-button>
                  </div>
                </div>
              </template>

              <div class="stats-grid [display:grid] [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:12px]">
                <div class="stat-box [background:#f8fbff] [border:1px_solid_#e6edf7] [border-radius:16px] [padding:14px] [display:flex] [flex-direction:column] [gap:8px] [color:#64748b] [font-size:12px]">
                  <span>当前掌握度</span>
                  <strong>{{ selectedWeakness.mastery }}</strong>
                </div>
                <div class="stat-box [background:#f8fbff] [border:1px_solid_#e6edf7] [border-radius:16px] [padding:14px] [display:flex] [flex-direction:column] [gap:8px] [color:#64748b] [font-size:12px]">
                  <span>估算掌握度</span>
                  <strong>{{ selectedWeakness.estimatedMastery }}</strong>
                </div>
                <div class="stat-box [background:#f8fbff] [border:1px_solid_#e6edf7] [border-radius:16px] [padding:14px] [display:flex] [flex-direction:column] [gap:8px] [color:#64748b] [font-size:12px]">
                  <span>计划完成度</span>
                  <strong>{{ selectedWeakness.planProgress }}%</strong>
                </div>
              </div>

              <div class="chip-list [display:flex] [flex-wrap:wrap] [gap:10px]" v-if="selectedWeakness.weakQuestions.length">
                <div
                  v-for="question in selectedWeakness.weakQuestions"
                  :key="question.problemId"
                  class="chip [display:inline-flex] [gap:8px] [padding:8px_12px] [border-radius:999px] [border:1px_solid_#fecaca] [background:#fff5f5] [color:#b91c1c] [font-size:12px] [&.done]:[border-color:#bbf7d0] [&.done]:[background:#effaf2] [&.done]:[color:#166534]"
                  :class="{ done: isProblemCompleted(question.problemId, selectedWeakness) }"
                >
                  <span>#{{ question.problemId }}</span>
                  <span>尝试 {{ question.attempts || 0 }}</span>
                  <span>AC {{ question.acCount || 0 }}</span>
                </div>
              </div>

              <div class="section-title [margin-bottom:12px] [font-size:16px] [font-family:'SimSun',_serif] [margin:6px_0_2px] [color:#334155] [font-size:13px] [font-weight:600] [margin:0] [font-weight:500] [color:#303133]">专项训练说明</div>
              <ui-input
                v-model="selectedPlanNote"
                type="textarea"
                :rows="3"
                resize="none"
                placeholder="记录本次专项训练要重点修正的问题。"
                @blur="savePlanNote(selectedWeakness)"
              />
            </ui-card>

            <ui-card class="panel" shadow="hover">
              <template #header>
                <div class="panel-head [display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [flex-wrap:wrap]">
                  <span>专项题单</span>
                  <ui-button type="primary" plain @click="startNextProblem(selectedWeakness)">开始下一题</ui-button>
                </div>
              </template>

              <div class="practice-list [display:flex] [flex-direction:column] [gap:12px]">
                <div
                  v-for="practice in selectedWeakness.practicePool"
                  :key="practice.problemId"
                  class="practice-card [width:100%] [border:1px_solid_#e8eef6] [border-radius:16px] [padding:14px] [background:#fff] [text-align:left] [cursor:pointer] [transition:.2s] [&.completed]:[background:#f6fff7] [&.completed]:[border-color:#bbf7d0]"
                  :class="{ completed: isProblemCompleted(practice.problemId, selectedWeakness) }"
                >
                  <div class="card-row [display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [flex-wrap:wrap]">
                    <div class="title [color:#0f172a] [font-size:15px] [font-weight:700] [&.small]:[font-size:14px]">{{ practice.displayTitle }}</div>
                    <div class="action-row [display:flex] [align-items:center] [gap:8px] [justify-content:space-between] [gap:10px] [flex-wrap:wrap] [margin-top:12px]">
                      <ui-tag size="small" :type="tagTypeForSource(practice.sourceKind)">{{ sourceLabel(practice.sourceKind) }}</ui-tag>
                      <ui-tag size="small" effect="plain">{{ difficultyLabel(practice.difficulty) }}</ui-tag>
                    </div>
                  </div>
                  <div class="muted [color:#98a2b3] [font-size:12px] [color:#64748b]">{{ practice.reasonText }}</div>
                  <div class="meta-line [display:flex] [flex-wrap:wrap] [gap:10px] [margin-top:10px] [color:#64748b] [font-size:12px]">
                    <span>题号 #{{ practice.problemId }}</span>
                    <span v-if="practice.matchRate">匹配度{{ practice.matchRate }}%</span>
                    <span v-if="practice.attempts">历史尝试 {{ practice.attempts }}</span>
                    <span v-if="practice.estimatedMinutes">建议 {{ practice.estimatedMinutes }} 分钟</span>
                  </div>
                  <div class="action-row [display:flex] [align-items:center] [gap:8px] [justify-content:space-between] [gap:10px] [flex-wrap:wrap] [margin-top:12px]">
                    <ui-button
                      size="small"
                      :type="isInPlan(selectedWeakness, practice.problemId) ? 'warning' : 'info'"
                      plain
                      @click="toggleProblemInPlan(selectedWeakness, practice.problemId)"
                    >
                      {{ isInPlan(selectedWeakness, practice.problemId) ? '移出计划' : '加入计划' }}
                    </ui-button>
                    <ui-button type="primary" size="small" @click="startProblem(selectedWeakness, practice)">开始回炉</ui-button>
                  </div>
                </div>
              </div>
            </ui-card>

            <ui-card class="panel" shadow="hover">
              <template #header>
                <div class="panel-head [display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [flex-wrap:wrap]">
                  <span>掌握度回升记录</span>
                  <ui-tag :type="selectedWeakness.estimatedMastery >= 70 ? 'success' : 'warning'">
                    估算 {{ selectedWeakness.estimatedMastery }} 分
                  </ui-tag>
                </div>
              </template>

              <div v-if="selectedWeakness.reviewRecords.length" class="recovery-list [display:flex] [flex-direction:column] [gap:12px]">
                <div v-for="record in selectedWeakness.recoveryTimeline" :key="record.id" class="recovery-item [display:flex] [align-items:center] [justify-content:space-between] [gap:14px] [padding:14px_16px] [border-radius:14px] [border:1px_solid_#e6edf5] [background:#f8fbff]">
                  <div>
                    <div class="title small [color:#0f172a] [font-size:15px] [font-weight:700] [&.small]:[font-size:14px]">{{ record.problemTitle }}</div>
                    <div class="muted [color:#98a2b3] [font-size:12px] [color:#64748b]">{{ formatTime(record.createdAt) }} · {{ record.accepted ? '通过后计入回升' : '尝试中' }}</div>
                  </div>
                  <strong class="recovery-score [color:#1d4ed8] [white-space:nowrap]">{{ record.estimatedMastery }} 分</strong>
                </div>
              </div>
              <ui-empty v-else description="完成专项题提交后，这里会开始累计。" :image-size="68" />
            </ui-card>
          </div>
        </div>
      </div>

      <ui-empty
        v-else
        description="当前还没有可用的薄弱点数据。先完成实验和练习，再回来生成专项训练。"
        :image-size="96"
      >
        <ui-button type="primary" @click="goPractice">去练习</ui-button>
      </ui-empty>
    </loading-state>
  </div>
</template>

<script setup>
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { DataAnalysis, Finished, List as ListIcon, TrendCharts } from '@/components/ui/icons'
import LoadingState from '../../components/LoadingState.vue'
import { useLearningStore } from '../../store'
import { getCurrentStudentId, getUserInfo } from '../../constants/auth'
import { API_BASE_URL } from '../../config/runtime'
import {
  createEmptyWeaknessTrainingState,
  getNormalizedProblemId,
  readCompletedProblemIds,
  readWeaknessTrainingState,
  removeWeaknessTrainingPlan,
  upsertWeaknessTrainingPlan,
  writeWeaknessTrainingState
} from '../../utils/weaknessTraining'

const API_BASE = API_BASE_URL
const route = useRoute()
const router = useRouter()
const learningStore = useLearningStore()

const loading = ref(true)
const profile = ref({})
const completedProblemIds = ref([])
const trainingState = ref(createEmptyWeaknessTrainingState())
const selectedWeaknessId = ref(null)
const selectedPlanNote = ref('')

const normalizedPractices = computed(() => {
  const source = learningStore.recommendedPractices
  const rawList = Array.isArray(source?.data) ? source.data : (Array.isArray(source) ? source : [])
  return rawList.map((practice) => {
    const problemId = getNormalizedProblemId(practice?.problemId ?? practice?.id ?? practice?.number)
    if (!problemId) return null
    return {
      ...practice,
      problemId,
      displayTitle: practice.title || practice.name || `题目 ${problemId}`,
      reasonText: practice.reason || practice.description || '来自 AI 推荐题单',
      sourceKind: practice.source === 'leetcode_recommendation' ? 'recommended' : 'pool',
      launchMode: getPracticeLaunchMode(practice)
    }
  }).filter(Boolean)
})

function inferDifficultyFromAttempts(attempts) {
  const parsed = Number(attempts || 0)
  if (parsed >= 8) return 'hard'
  if (parsed >= 4) return 'medium'
  return 'easy'
}

function getPracticeLaunchMode(practice) {
  if (!practice) return 'unknown'
  if (practice.type === 'leetcode_problem' || practice.source === 'leetcode_recommendation' || practice.requestId) {
    return 'leetcode'
  }
  if (practice.url) {
    return 'external'
  }
  return 'experiment'
}

function normalizeWeakQuestion(question, weakness) {
  const problemId = getNormalizedProblemId(question?.problemId ?? question?.questionId ?? question?.serial_number ?? question?.id)
  if (!problemId) return null
  return {
    problemId,
    experimentId: getNormalizedProblemId(weakness?.experimentId),
    attempts: Number(question?.attempts || question?.attempt_count || 0),
    acCount: Number(question?.ac_count || question?.acCount || 0),
    displayTitle: question?.title || question?.name || `题目 ${problemId}`,
    difficulty: question?.difficulty || inferDifficultyFromAttempts(question?.attempts),
    estimatedMinutes: 20,
    matchRate: 100,
    sourceKind: 'weak-question',
    reasonText: `来自 ${weakness.experimentName} 的薄弱题回炉`,
    launchMode: 'experiment'
  }
}

function matchesWeakness(practice, weakness) {
  const haystack = [
    practice.displayTitle,
    practice.reasonText,
    ...(Array.isArray(practice.tags) ? practice.tags : [])
  ].filter(Boolean).join(' ').toLowerCase()

  return [weakness.dimension, weakness.experimentName]
    .filter(Boolean)
    .some(keyword => haystack.includes(String(keyword).toLowerCase()))
}

function dedupePractices(list) {
  const seen = new Set()
  return list.filter((item) => {
    if (!item?.problemId || seen.has(item.problemId)) return false
    seen.add(item.problemId)
    return true
  })
}

function getDefaultPlanIds(weakness, practicePool) {
  return dedupePractices(
    practicePool.map(item => ({ problemId: item.problemId }))
  ).map(item => item.problemId).slice(0, 4)
}

const weaknessCards = computed(() => {
  const completedSet = new Set(completedProblemIds.value)
  const practiceMap = new Map(normalizedPractices.value.map(item => [item.problemId, item]))
  const rawWeaknesses = Array.isArray(profile.value?.weaknesses) ? profile.value.weaknesses : []

  return rawWeaknesses.map((weakness) => {
    const experimentId = getNormalizedProblemId(weakness?.experimentId)
    const weakQuestions = Array.isArray(weakness?.weakQuestions)
      ? weakness.weakQuestions.map(item => normalizeWeakQuestion(item, weakness)).filter(Boolean)
      : []

    const exactMatches = weakQuestions.map((question) => {
      const matched = practiceMap.get(question.problemId)
      return matched ? {
        ...matched,
        ...question,
        displayTitle: matched.displayTitle || question.displayTitle,
        difficulty: matched.difficulty || question.difficulty,
        estimatedMinutes: matched.estimatedMinutes || question.estimatedMinutes,
        attempts: question.attempts,
        acCount: question.acCount,
        sourceKind: 'weak-question',
        reasonText: question.reasonText,
        launchMode: getPracticeLaunchMode(matched)
      } : null
    }).filter(practice => practice?.launchMode === 'leetcode')
    const relatedPractices = normalizedPractices.value
      .filter(practice => practice.launchMode === 'leetcode')
      .filter(practice => !weakQuestions.some(question => question.problemId === practice.problemId))
      .filter(practice => matchesWeakness(practice, weakness))
      .slice(0, 6)
    const fallbackPractices = normalizedPractices.value
      .filter(practice => practice.launchMode === 'leetcode')
      .filter(practice => !exactMatches.some(item => item.problemId === practice.problemId))
      .filter(practice => !relatedPractices.some(item => item.problemId === practice.problemId))
      .slice(0, 8)

    const practicePool = dedupePractices([...exactMatches, ...relatedPractices, ...fallbackPractices]).slice(0, 8)
    const existingPlan = trainingState.value.plans?.[experimentId] || null
    const selectedProblemIds = existingPlan?.selectedProblemIds?.length
      ? existingPlan.selectedProblemIds
      : getDefaultPlanIds({ weakQuestions }, practicePool)

    const reviewRecords = (trainingState.value.reviewLog || [])
      .filter(record => Number(record.experimentId) === experimentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const acceptedProblemIds = new Set(reviewRecords.filter(item => item.accepted).map(item => getNormalizedProblemId(item.problemId)).filter(Number.isFinite))
    const completedCount = selectedProblemIds.filter(id => completedSet.has(id) || acceptedProblemIds.has(id)).length
    const acceptedReviewCount = reviewRecords.filter(item => item.accepted).length
    const targetCount = selectedProblemIds.length || practicePool.length
    const estimatedMastery = Math.min(100, Math.round((Number(weakness.mastery || 0) + acceptedReviewCount * 6) * 10) / 10)
    const recoveryTimeline = [...reviewRecords].reverse().map((record, index, arr) => ({
      ...record,
      estimatedMastery: Math.min(100, Math.round((Number(weakness.mastery || 0) + arr.slice(0, index + 1).filter(item => item.accepted).length * 6) * 10) / 10)
    })).reverse()

    return {
      ...weakness,
      experimentId,
      mastery: Math.round(Number(weakness?.mastery || 0)),
      weakQuestions,
      weakQuestionCount: weakQuestions.length,
      practicePool,
      recommendedPracticeCount: practicePool.length,
      selectedProblemIds,
      completedCount,
      targetCount,
      planProgress: targetCount ? Math.min(100, Math.round((completedCount / targetCount) * 100)) : 0,
      acceptedReviewCount,
      estimatedMastery,
      reviewRecords,
      recoveryTimeline,
      hasPlan: !!existingPlan,
      planNote: existingPlan?.note || '',
      evidenceSummary: `总提交${Number(weakness?.evidence?.totalSubmissions || 0)} 次，错误提交 ${Number(weakness?.evidence?.wrongAnswers || 0)} 次`
    }
  })
})

const selectedWeakness = computed(() => {
  if (!weaknessCards.value.length) return null
  return weaknessCards.value.find(item => item.experimentId === selectedWeaknessId.value) || weaknessCards.value[0]
})

const recentReviewRecords = computed(() => {
  return (trainingState.value.reviewLog || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
})

const summaryCards = computed(() => {
  const activePlanCount = Object.keys(trainingState.value.plans || {}).length
  const acceptedReviewCount = (trainingState.value.reviewLog || []).filter(record => record.accepted).length
  const recoveredCount = weaknessCards.value.filter(item => item.estimatedMastery >= 70).length
  const totalPlanProblems = weaknessCards.value.reduce((sum, item) => sum + item.targetCount, 0)
  return [
    { label: '待巩固模块', value: weaknessCards.value.length, tip: '来自画像中的薄弱点', icon: DataAnalysis, bg: '#e8f0fe', color: '#1a73e8' },
    { label: '已建专项计划', value: activePlanCount, tip: `累计题量 ${totalPlanProblems}`, icon: ListIcon, bg: '#eef8e8', color: '#1e8e3e' },
    { label: '完成回炉题', value: acceptedReviewCount, tip: '以提交通过为准', icon: Finished, bg: '#fff5e8', color: '#e37400' },
    { label: '回升中的模块', value: recoveredCount, tip: '估算掌握度达到70+', icon: TrendCharts, bg: '#f3e8fd', color: '#7c3aed' }
  ]
})

function summaryIconClass(item) {
  if (item.bg === '#e8f0fe') return '[background:#e8f0fe] [color:#1a73e8]'
  if (item.bg === '#eef8e8') return '[background:#eef8e8] [color:#1e8e3e]'
  if (item.bg === '#fff5e8') return '[background:#fff5e8] [color:#e37400]'
  if (item.bg === '#f3e8fd') return '[background:#f3e8fd] [color:#7c3aed]'
  return '[background:#f1f5f9] [color:#475569]'
}

watch(selectedWeakness, (value) => {
  selectedPlanNote.value = value?.planNote || ''
}, { immediate: true })

function persistTrainingState(nextState) {
  trainingState.value = nextState
  writeWeaknessTrainingState(nextState, getCurrentStudentId())
}

function selectWeakness(experimentId) {
  selectedWeaknessId.value = getNormalizedProblemId(experimentId)
  router.replace({ query: { ...route.query, experimentId: String(selectedWeaknessId.value) } })
}

function isInPlan(weakness, problemId) {
  return weakness.selectedProblemIds.includes(problemId)
}

function isProblemCompleted(problemId, weakness) {
  const normalizedProblemId = getNormalizedProblemId(problemId)
  if (!normalizedProblemId) return false
  if (completedProblemIds.value.includes(normalizedProblemId)) return true
  return weakness.reviewRecords.some(record => record.accepted && getNormalizedProblemId(record.problemId) === normalizedProblemId)
}

function buildPlan(weakness) {
  const nextState = upsertWeaknessTrainingPlan(trainingState.value, {
    experimentId: weakness.experimentId,
    experimentName: weakness.experimentName,
    dimension: weakness.dimension,
    masterySnapshot: weakness.mastery,
    selectedProblemIds: weakness.selectedProblemIds?.length ? weakness.selectedProblemIds : getDefaultPlanIds(weakness, weakness.practicePool),
    note: trainingState.value.plans?.[weakness.experimentId]?.note || `优先回炉 ${weakness.dimension} 相关题目，重点修正高频错误。`,
    status: 'active'
  })
  persistTrainingState(nextState)
  selectedWeaknessId.value = weakness.experimentId
  uiMessage.success('专项训练计划已更新')
}

function resetPlan(weakness) {
  persistTrainingState(removeWeaknessTrainingPlan(trainingState.value, weakness.experimentId))
  selectedPlanNote.value = ''
  uiMessage.success('已重置该薄弱点的专项计划')
}

function toggleProblemInPlan(weakness, problemId) {
  const currentPlan = trainingState.value.plans?.[weakness.experimentId]
  const currentIds = Array.isArray(currentPlan?.selectedProblemIds) ? [...currentPlan.selectedProblemIds] : [...weakness.selectedProblemIds]
  const normalizedProblemId = getNormalizedProblemId(problemId)
  if (!normalizedProblemId) return
  const nextIds = currentIds.includes(normalizedProblemId)
    ? currentIds.filter(item => item !== normalizedProblemId)
    : [...currentIds, normalizedProblemId]
  persistTrainingState(upsertWeaknessTrainingPlan(trainingState.value, {
    experimentId: weakness.experimentId,
    experimentName: weakness.experimentName,
    dimension: weakness.dimension,
    masterySnapshot: weakness.mastery,
    selectedProblemIds: nextIds,
    note: currentPlan?.note || selectedPlanNote.value || ''
  }))
}

function savePlanNote(weakness) {
  if (!weakness) return
  const currentPlan = trainingState.value.plans?.[weakness.experimentId]
  persistTrainingState(upsertWeaknessTrainingPlan(trainingState.value, {
    experimentId: weakness.experimentId,
    experimentName: weakness.experimentName,
    dimension: weakness.dimension,
    masterySnapshot: weakness.mastery,
    selectedProblemIds: currentPlan?.selectedProblemIds?.length ? currentPlan.selectedProblemIds : weakness.selectedProblemIds,
    note: selectedPlanNote.value
  }))
}

function startProblem(weakness, practice) {
  const mode = getPracticeLaunchMode(practice)
  if (!practice?.problemId || mode !== 'leetcode') {
    uiMessage.warning('该专项练习题当前未关联到力扣题库')
    return
  }
  if (!trainingState.value.plans?.[weakness.experimentId]) {
    buildPlan(weakness)
  }
  router.push({
    path: `/student/leetcode-practice/${practice.problemId}`,
    query: {
      trainingExperimentId: String(weakness.experimentId),
      trainingDimension: weakness.dimension || '',
      trainingSource: 'weakness_training',
      ...(practice.requestId ? { recommendationRequestId: practice.requestId } : {})
    }
  })
}

function startNextProblem(weakness) {
  const nextPractice = weakness.practicePool.find(practice => isInPlan(weakness, practice.problemId) && !isProblemCompleted(practice.problemId, weakness))
    || weakness.practicePool.find(practice => !isProblemCompleted(practice.problemId, weakness))
  if (!nextPractice) {
    uiMessage.success('这个专项计划里的题目已经完成，可以切换到下一个薄弱点。')
    return
  }
  startProblem(weakness, nextPractice)
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function difficultyLabel(difficulty) {
  return { easy: '简单', medium: '中等', hard: '困难' }[difficulty] || '中等'
}

function sourceLabel(sourceKind) {
  return { 'weak-question': '错题回炉', recommended: 'AI 推荐', pool: '训练补充' }[sourceKind] || '专项题'
}

function tagTypeForSource(sourceKind) {
  return { 'weak-question': 'danger', recommended: 'primary', pool: 'info' }[sourceKind] || 'info'
}

function goPractice() {
  router.push('/student/practice')
}

async function fetchProfile() {
  try {
    const response = await axios.get(`${API_BASE}/api/profile/me`, { withCredentials: true })
    return response.data || response || {}
  } catch {
    const userInfo = getUserInfo()
    if (!userInfo?.usernum) return {}
    const response = await axios.get(`${API_BASE}/api/profile/student/${userInfo.usernum}`, { withCredentials: true })
    return response.data || response || {}
  }
}

async function loadPageData() {
  loading.value = true
  try {
    completedProblemIds.value = readCompletedProblemIds()
    trainingState.value = readWeaknessTrainingState(getCurrentStudentId())
    if (!learningStore.recommendedPractices || !normalizedPractices.value.length) {
      await learningStore.fetchRecommendedPractices()
    }
    profile.value = await fetchProfile()
    const queryExperimentId = getNormalizedProblemId(route.query.experimentId)
    if (queryExperimentId) {
      selectedWeaknessId.value = queryExperimentId
    } else if (!selectedWeaknessId.value && Array.isArray(profile.value?.weaknesses) && profile.value.weaknesses.length) {
      selectedWeaknessId.value = getNormalizedProblemId(profile.value.weaknesses[0].experimentId)
    }
  } catch (error) {
    logger.error('加载专项训练数据失败:', error)
    uiMessage.error('加载专项训练数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPageData()
})
</script>


