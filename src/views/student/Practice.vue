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
                  <ui-radio-button label="pta">PTA推荐</ui-radio-button>
                  <ui-radio-button label="review">复习计划</ui-radio-button>
                </ui-radio-group>
              </div>

              <div class="header-filter [display:flex] [align-items:center] [gap:10px] [&_.ui-select]:[width:150px]" v-show="activeTab === 'recommended'">
                <ui-select v-model="filterDifficulty" placeholder="难度筛选" clearable class="[width:150px]">
                  <ui-option label="简单" value="easy" />
                  <ui-option label="中等" value="medium" />
                  <ui-option label="困难" value="hard" />
                </ui-select>
              </div>
            </div>

            <!-- 复习计划 Tab -->
            <div v-if="activeTab === 'review'" class="review-plan-content [flex:1_1_auto] [min-height:0] [overflow-y:auto] [display:flex] [flex-direction:column] [gap:16px] [padding-right:4px]">
              <div class="review-curve-section" v-if="reviewSkills.length > 0">
                <div class="section-label [font-size:14px] [font-weight:600] [color:#202124] [margin-bottom:12px]">遗忘曲线概览</div>
                <div ref="curveChartRef" style="width:100%;height:280px;"></div>
              </div>

              <div class="section-label [font-size:14px] [font-weight:600] [color:#202124] [margin-bottom:8px]">待复习知识点</div>

              <ui-empty v-if="reviewSkills.length === 0" description="暂无需要复习的知识点，继续保持练习吧" />

              <ui-card v-for="skill in reviewSkills" :key="skill.dimension || skill.skillId" class="review-card [border:1px_solid_#e8eef6] [border-radius:16px] [flex-shrink:0]">
                <div class="[display:flex] [justify-content:space-between] [align-items:center]">
                  <div>
                    <div class="[font-size:15px] [font-weight:600] [color:#202124]">{{ skill.dimension || skill.skillName || '知识点' }}</div>
                    <div class="[font-size:12px] [color:#64748b] [margin-top:4px]">
                      上次练习：{{ formatLastPractice(skill.lastPracticeAt) }}
                    </div>
                  </div>
                  <div class="[display:flex] [align-items:center] [gap:10px]">
                    <div class="forgetting-indicator">
                      <div class="[font-size:12px] [color:#64748b] [text-align:center]">遗忘度</div>
                      <div class="[font-size:20px] [font-weight:700] [text-align:center]" :class="getForgettingColor(skill.forgettingScore)">
                        {{ Math.round(skill.forgettingScore || 0) }}%
                      </div>
                    </div>
                    <ui-tag size="small" :type="getReviewPriorityType(skill.forgettingScore)">
                      {{ getReviewPriorityText(skill.forgettingScore) }}
                    </ui-tag>
                  </div>
                </div>
                <div class="[margin-top:10px]">
                  <ui-progress :percentage="100 - (skill.forgettingScore || 0)" :color="getRetentionColor(skill.forgettingScore)" :stroke-width="8" />
                  <div class="[display:flex] [justify-content:space-between] [font-size:11px] [color:#94a3b8] [margin-top:4px]">
                    <span>掌握度 {{ Math.round(skill.masteryScore || 0) }}%</span>
                    <span>建议复习：{{ getNextReviewDay(skill) }}</span>
                  </div>
                </div>
              </ui-card>
            </div>

            <!-- 为我推荐 / PTA推荐 Tab -->
            <div v-else class="practice-list [flex:1_1_auto] [min-height:0] [overflow-y:auto] [display:flex] [flex-direction:column] [gap:12px] [padding-right:4px]">
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

                  <!-- 知识点标签 -->
                  <div v-if="practice.tags && practice.tags.length" class="tags-row [display:flex] [flex-wrap:wrap] [gap:6px]">
                    <span v-for="tag in practice.tags.slice(0, 4)" :key="tag" class="knowledge-tag [display:inline-block] [padding:2px_8px] [border-radius:4px] [font-size:11px] [background:#eef2ff] [color:#4338ca]">{{ tag }}</span>
                  </div>

                  <div v-if="practice.reason" class="practice-reason [color:#5f6368] [font-size:13px] [line-height:1.5]">
                    {{ practice.reason }}
                  </div>

                  <div class="practice-info [display:flex] [justify-content:flex-end] [align-items:center] [flex-wrap:wrap] [gap:6px]">
                    <!-- 来源标签 -->
                    <ui-tag v-if="getSourceLabel(practice)" size="small" :type="getSourceTagType(practice)" effect="plain">
                      {{ getSourceLabel(practice) }}
                    </ui-tag>
                    <span class="practice-number [font-size:14px] [color:#909399]" v-if="practice.number">题目 {{practice.number}}</span>
                    <ui-tag size="small" :type="difficultyType(practice.difficulty)">
                      {{ getDifficultyText(practice.difficulty) }}
                    </ui-tag>
                    <ui-tag v-if="practice.estimatedMinutes" size="small" effect="plain">
                      约{{ practice.estimatedMinutes }} 分钟
                    </ui-tag>
                    <!-- 外链跳转按钮 -->
                    <a v-if="getSourceUrl(practice)" :href="getSourceUrl(practice)" target="_blank" rel="noopener noreferrer"
                      class="source-link [display:inline-flex] [align-items:center] [gap:3px] [font-size:12px] [color:#1a73e8] [text-decoration:none] hover:[text-decoration:underline]"
                      @click.stop>
                      <span>前往题目</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                    <ui-button
                      v-if="isTrackableRecommendation(practice)"
                      text
                      type="warning"
                      @click.stop="handleDislike(practice)"
                    >
                      不感兴趣
                    </ui-button>
                    <ui-button type="primary" size="small" @click.stop="startProblem(practice)">
                      开始解答
                    </ui-button>
                  </div>
                </div>
              </ui-card>
            </div>

            <div v-if="activeTab !== 'review'" class="pagination-container [display:flex] [justify-content:flex-end] [margin-top:12px] [padding-top:8px] [border-top:1px_solid_#f0f0f0] [flex-shrink:0]">
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
                    <!-- 来源信息 -->
                    <div v-if="getSourceUrl(selectedPractice)" class="source-info [margin-bottom:12px] [padding:10px_14px] [border-radius:8px] [background:#f0fdf4] [border:1px_solid_#bbf7d0] [display:flex] [align-items:center] [justify-content:space-between]">
                      <div>
                        <span class="[font-size:12px] [color:#166534] [font-weight:500]">{{ getSourceLabel(selectedPractice) }}</span>
                        <a :href="getSourceUrl(selectedPractice)" target="_blank" rel="noopener noreferrer" class="[display:block] [font-size:12px] [color:#1a73e8] [margin-top:2px] [word-break:break-all]">
                          {{ getSourceUrl(selectedPractice) }}
                        </a>
                      </div>
                      <ui-button size="small" type="primary" plain @click="openSourceUrl(selectedPractice)">前往</ui-button>
                    </div>

                    <!-- 知识点 -->
                    <div v-if="selectedPractice.tags && selectedPractice.tags.length" class="tags-section [margin-bottom:12px]">
                      <div class="[font-size:13px] [font-weight:500] [color:#374151] [margin-bottom:6px]">相关知识点</div>
                      <div class="[display:flex] [flex-wrap:wrap] [gap:6px]">
                        <span v-for="tag in selectedPractice.tags" :key="tag" class="knowledge-tag [display:inline-block] [padding:4px_10px] [border-radius:6px] [font-size:12px] [background:#eef2ff] [color:#4338ca]">{{ tag }}</span>
                      </div>
                    </div>

                    <div v-if="selectedPractice.reason" class="recommendation-reason [margin-bottom:12px] [padding:12px] [border-radius:8px] [background:#f7faff] [border-left:4px_solid_#1a73e8]">
                      <h4>推荐理由</h4>
                      <p>{{ selectedPractice.reason }}</p>
                    </div>
                    <div v-if="selectedPractice.estimatedMinutes" class="recommendation-meta [margin-bottom:12px] [color:#5f6368] [font-size:13px]">
                      预计用时 {{ selectedPractice.estimatedMinutes }} 分钟
                    </div>

                    <!-- 遗忘曲线提示 -->
                    <div v-if="selectedPractice.forgettingScore != null && selectedPractice.forgettingScore >= 0" class="forgetting-hint [margin-bottom:12px] [padding:10px_14px] [border-radius:8px] [background:#fffbeb] [border:1px_solid_#fde68a] [font-size:13px] [color:#92400e]">
                      <span>该知识点遗忘度 {{ Math.round(selectedPractice.forgettingScore) }}%</span>
                      <span v-if="selectedPractice.forgettingScore > 50"> — 建议尽快复习</span>
                    </div>
                    <div v-else-if="selectedPractice.forgettingScore != null && selectedPractice.forgettingScore < 0" class="forgetting-hint [margin-bottom:12px] [padding:10px_14px] [border-radius:8px] [background:#eff6ff] [border:1px_solid_#bfdbfe] [font-size:13px] [color:#1e40af]">
                      <span>新知识点 — 尚未学习，推荐开始练习</span>
                    </div>

                    <div class="detail-actions [display:flex] [gap:10px] [margin-top:10px]">
                      <ui-button
                        v-if="isTrackableRecommendation(selectedPractice)"
                        type="warning"
                        plain
                        @click="handleDislike(selectedPractice)"
                      >
                        不感兴趣
                      </ui-button>
                      <ui-button v-if="getSourceUrl(selectedPractice)" plain @click="openSourceUrl(selectedPractice)">
                        前往原题
                      </ui-button>
                      <ui-button v-if="canStartPractice(selectedPractice)" type="primary" @click="startProblem(selectedPractice)">开始解答</ui-button>
                    </div>
                  </div>
                </div>
              </ui-card>

              <ui-card v-else class="empty-detail [flex:1_1_auto] [min-height:0] [display:flex] [align-items:center] [justify-content:center]">
                <div class="empty-detail-content [text-align:center] [color:#9aa0a6]">
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

                  <div class="stats-item [display:flex] [justify-content:space-between] [margin-bottom:12px]" v-if="reviewSkills.length > 0">
                    <div class="stats-label [color:#5f6368]">待复习知识点</div>
                    <div class="stats-value [font-weight:600] [color:#ea580c]">{{ reviewSkills.length }}</div>
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
    </loading-state>
    <!-- 题目详情对话框-->
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

        <div v-else>
          <div v-if="getSourceUrl(selectedPractice)" class="[margin-bottom:16px]">
            <a :href="getSourceUrl(selectedPractice)" target="_blank" rel="noopener noreferrer" class="[color:#1a73e8] [font-size:14px]">
              {{ getSourceLabel(selectedPractice) }} - {{ getSourceUrl(selectedPractice) }}
            </a>
          </div>
          <div v-if="selectedPractice.tags && selectedPractice.tags.length" class="[margin-bottom:16px]">
            <div class="[font-size:13px] [color:#5f6368] [margin-bottom:6px]">知识点：</div>
            <div class="[display:flex] [flex-wrap:wrap] [gap:6px]">
              <span v-for="tag in selectedPractice.tags" :key="tag" class="knowledge-tag [display:inline-block] [padding:4px_10px] [border-radius:6px] [font-size:12px] [background:#eef2ff] [color:#4338ca]">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="detail-actions-dialog [display:flex] [gap:10px] [margin-top:20px] [justify-content:flex-end]" v-if="canStartPractice(selectedPractice)">
          <ui-button v-if="getSourceUrl(selectedPractice)" plain @click="openSourceUrl(selectedPractice)">前往原题</ui-button>
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
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { useRouter } from 'vue-router'
import api from '@/api'
import { renderSafeMarkdown } from '@/utils/safeHtml'
import * as echarts from 'echarts'

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
const ptaPracticeSets = ref([])
const ptaLoading = ref(false)
const skillStates = ref([])
const curveChartRef = ref(null)
let chartInstance = null

const COMPLETED_STORAGE_KEY = 'leetcode_completed_problem_ids'
const SESSION_STORAGE_KEY = 'leetcode_recommendation_session_id'

const recommendationRequestId = computed(() => learningStore.recommendedPractices?.requestId || null)

// 获取来源标签
const getSourceLabel = (practice) => {
  if (!practice) return ''
  if (practice.type === 'pta_practice_set') return 'PTA'
  if (practice.sourceLabel) return practice.sourceLabel
  if (practice.source === 'leetcode_recommendation' || practice.source === 'leetcode_bank') return 'LeetCode'
  if (practice.source === 'leetcode_claw') return 'LeetCode'
  if (practice.sourceUrl && practice.sourceUrl.includes('leetcode.cn')) return 'LeetCode'
  if (practice.sourceUrl && practice.sourceUrl.includes('pintia.cn')) return 'PTA'
  return ''
}

const getSourceTagType = (practice) => {
  const label = getSourceLabel(practice)
  if (label === 'LeetCode') return 'primary'
  if (label === 'PTA') return 'success'
  return 'info'
}

// 获取来源 URL
const getSourceUrl = (practice) => {
  if (!practice) return ''
  if (practice.sourceUrl) return practice.sourceUrl
  // LeetCode 题：根据 slug 拼接
  if (practice.slug && practice.slug.replace) {
    const slug = practice.sourceKey ? practice.sourceKey.replace(/^slug:/, '') : practice.slug
    if (slug) return `https://leetcode.cn/problems/${slug}/`
  }
  // PTA 题目集
  if (practice.type === 'pta_practice_set') {
    const offeringId = practice.offeringId || practice.id
    if (offeringId) return `https://pintia.cn/problem-sets/${offeringId}`
  }
  return ''
}

const openSourceUrl = (practice) => {
  const url = getSourceUrl(practice)
  if (url) window.open(url, '_blank')
}

// 遗忘曲线相关
const reviewSkills = computed(() => {
  if (!Array.isArray(skillStates.value)) return []
  return skillStates.value
    .filter(s => s.forgettingScore > 20 || s.masteryScore < 80)
    .sort((a, b) => (b.forgettingScore || 0) - (a.forgettingScore || 0))
})

const formatLastPractice = (value) => {
  if (!value) return '暂无记录'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '暂无记录'
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getForgettingColor = (score) => {
  if (score > 60) return '[color:#dc2626]'
  if (score > 30) return '[color:#ea580c]'
  return '[color:#16a34a]'
}

const getReviewPriorityType = (score) => {
  if (score > 60) return 'danger'
  if (score > 30) return 'warning'
  return 'success'
}

const getReviewPriorityText = (score) => {
  if (score > 60) return '紧急复习'
  if (score > 30) return '建议复习'
  return '保持巩固'
}

const getRetentionColor = (forgettingScore) => {
  if (forgettingScore > 60) return '#dc2626'
  if (forgettingScore > 30) return '#ea580c'
  return '#16a34a'
}

const getNextReviewDay = (skill) => {
  if (!skill.lastPracticeAt) return '尽快'
  const lastDate = new Date(skill.lastPracticeAt)
  const mastery = skill.masteryScore || 50
  // 艾宾浩斯复习间隔：1, 2, 4, 7, 15, 30 天
  const intervals = [1, 2, 4, 7, 15, 30]
  const idx = Math.min(Math.floor(mastery / 20), intervals.length - 1)
  const nextDate = new Date(lastDate.getTime() + intervals[idx] * 24 * 60 * 60 * 1000)
  const now = new Date()
  const diffMs = nextDate - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return '立即'
  if (diffDays === 1) return '明天'
  return `${diffDays} 天后`
}

// 初始化遗忘曲线图
const initForgettingCurveChart = () => {
  nextTick(() => {
    if (!curveChartRef.value || reviewSkills.value.length === 0) return
    if (chartInstance) {
      chartInstance.dispose()
    }
    chartInstance = echarts.init(curveChartRef.value)

    // 艾宾浩斯标准遗忘曲线数据
    const days = [0, 1, 2, 3, 4, 5, 6, 7, 14, 21, 30]
    const standardRetention = [100, 44, 33, 28, 24, 21, 19, 17, 12, 10, 8]
    const series = [
      {
        name: '标准遗忘曲线',
        type: 'line',
        smooth: true,
        data: days.map((d, i) => [d, standardRetention[i]]),
        lineStyle: { color: '#94a3b8', type: 'dashed', width: 2 },
        itemStyle: { color: '#94a3b8' },
        symbol: 'none'
      }
    ]
    const topSkills = reviewSkills.value.slice(0, 5)
    const palette = ['#2563eb', '#dc2626', '#ea580c', '#7c3aed', '#0891b2']
    topSkills.forEach((skill, idx) => {
      const mastery = skill.masteryScore || 50
      const forgettingRate = (skill.forgettingScore || 0) / 100
      const retentionData = days.map(d => Math.max(0, Math.round(mastery * Math.exp(-forgettingRate * d) / 100)))
      series.push({
        name: skill.dimension || `知识点${idx + 1}`,
        type: 'line',
        smooth: true,
        data: days.map((d, i) => [d, retentionData[i]]),
        lineStyle: { color: palette[idx % palette.length], width: 2 },
        itemStyle: { color: palette[idx % palette.length] },
        symbol: 'circle',
        symbolSize: 4
      })
    })

    chartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, textStyle: { fontSize: 11 }, type: 'scroll' },
      grid: { top: 16, right: 16, bottom: 48, left: 48 },
      xAxis: { type: 'category', name: '天', data: days.map(String), axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', name: '记忆保留率 %', min: 0, max: 100, axisLabel: { fontSize: 11 } },
      series
    })
  })
}

// 所有练习题目
const practices = computed(() => {
  if (activeTab.value === 'pta') {
    return ptaPracticeSets.value || []
  }
  const practicesToReturn = learningStore.recommendedPractices;

  // 检查返回数据的格式并正确处理
  if (practicesToReturn && practicesToReturn.data && Array.isArray(practicesToReturn.data)) {
    return practicesToReturn.data;
  } else if (Array.isArray(practicesToReturn)) {
    return practicesToReturn;
  } else {
    logger.warn('获取到的推荐题目格式异常:', practicesToReturn);
    return [];
  }
})

// 筛选后的练习题目
const filteredPractices = computed(() => {
  if (!practices.value || practices.value.length === 0) {
    return []
  }

  let result = [...practices.value]

  result = result.filter(practice => !dismissedProblemIds.value.includes(getPracticeProblemId(practice)))

  // 根据标签筛选
  if (activeTab.value === 'recommended') {
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
  if (practice.type === 'pta_practice_set') return true
  return practice.type === 'problem' ||
    practice.type === 'leetcode_problem' ||
    practice.source === 'leetcode_recommendation' ||
    !!practice.url
}

// 开始解题
const startProblem = (practice) => {
  const currentPractice = practice || selectedPractice.value
  if (!currentPractice) return

  detailDialogVisible.value = false
  void recordRecommendationFeedback(currentPractice, 'start')

  // PTA 推荐题目集：跳转到实验详情页
  if (currentPractice.type === 'pta_practice_set') {
    const targetId = currentPractice.offeringId || currentPractice.id
    router.push(`/student/experiment-detail/${targetId}`)
    uiMessage.success(`开始做推荐题目集：${currentPractice.title || currentPractice.name}`)
    return
  }

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
    const externalUrl = currentPractice.url || getSourceUrl(currentPractice)
    if (externalUrl) {
      window.open(externalUrl, '_blank')
    } else {
      uiMessage.warning('该题目暂不支持在线练习')
    }
  }

  uiMessage.success(`开始解答题目 ${currentPractice.title || currentPractice.name}`)
}

// 获取 PTA 推荐题目集
const fetchPtaPracticeSets = async () => {
  if (ptaLoading.value) return
  ptaLoading.value = true
  try {
    const res = await api.getPtaPracticeSets()
    const body = res.data || res
    const data = body.data || body || []
    const rawSets = Array.isArray(data) ? data : []
    // 为 PTA 题目集补充 URL
    ptaPracticeSets.value = rawSets.map(item => ({
      ...item,
      sourceUrl: item.sourceUrl || (item.offeringId || item.id ? `https://pintia.cn/problem-sets/${item.offeringId || item.id}` : ''),
      sourceLabel: 'PTA'
    }))
    if (ptaPracticeSets.value.length > 0 && !selectedPractice.value) {
      selectPractice(ptaPracticeSets.value[0], { trackClick: false })
    }
  } catch (error) {
    logger.error('获取PTA推荐题目集失败:', error)
    ptaPracticeSets.value = []
  } finally {
    ptaLoading.value = false
  }
}

// 获取技能状态（遗忘曲线）
const fetchSkillStates = async () => {
  try {
    const res = await api.getSkillStates()
    // Java 后端返回 {success: true, skills: [...]}，axios 拦截器已解包 response.data
    const body = res || {}
    const skills = body.skills || body.data?.skills || []
    skillStates.value = Array.isArray(skills) ? skills : []
  } catch (error) {
    logger.warn('获取技能状态失败:', error)
    skillStates.value = []
  }
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

const handlePageChange = (page) => {
  currentPage.value = page
  if (activeTab.value === 'recommended') {
    void trackVisiblePracticeExposure()
  }
}

// 监听标签切换
watch(activeTab, (newTab) => {
  currentPage.value = 1
  if (newTab === 'pta') {
    if (ptaPracticeSets.value.length === 0 && !ptaLoading.value) {
      void fetchPtaPracticeSets()
    }
    if (ptaPracticeSets.value.length > 0) {
      selectPractice(ptaPracticeSets.value[0], { trackClick: false })
    } else if (!ptaLoading.value) {
      selectedPractice.value = null
    }
  } else if (newTab === 'review') {
    selectedPractice.value = null
    initForgettingCurveChart()
  } else {
    const list = practices.value || []
    if (list.length > 0) {
      selectPractice(list[0], { trackClick: false })
    } else {
      selectedPractice.value = null
    }
    void trackVisiblePracticeExposure()
  }
})

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
  if (practice.type === 'introduction' && practice.content) return practice.content
  if (practice.description !== undefined && practice.description !== '') return practice.description
  if (practice.remainingPart) return practice.remainingPart
  if (practice.describe) return practice.describe

  const descriptionMap = {
    1: '给定一个单链表，请将它反转并返回反转后的链表头节点。',
    2: '给定一个只包含括号字符的字符串，判断字符串中的括号是否有效。',
    3: '给定一个二叉树，返回其按层次遍历的节点值。',
    4: '实现Dijkstra算法求解图的最短路径问题。',
    5: '实现快速排序算法，并分析其时间复杂度和空间复杂度。'
  }
  const id = practice.id || practice.number || 0
  return descriptionMap[id] || `完成${practice.title || practice.name || '该题目'}的要求，并提交结果。`
}

const getFormattedDescription = (practice) => {
  return renderSafeMarkdown(getPracticeDescription(practice))
}

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

watch([activeTab, filterDifficulty], () => {
  currentPage.value = 1
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

    if (!learningStore.analysisData) {
      await learningStore.fetchLearningAnalysis()
    }

    // 并行获取推荐练习和技能状态
    await Promise.all([
      learningStore.fetchRecommendedPractices(),
      fetchSkillStates()
    ])

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

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
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
.practice-info :deep(.ui-tag),
.practice-info .source-link {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.practice-info :deep(.ui-button) {
  min-height: 32px;
  padding: 6px 12px;
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #1a73e8;
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

.knowledge-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: #eef2ff;
  color: #4338ca;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.review-card :deep(.ui-card__body) {
  padding: 14px 16px !important;
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

.difficulty-easy {
  background: #dcfce7;
  color: #166534;
}

.difficulty-medium {
  background: #fef3c7;
  color: #92400e;
}

.difficulty-hard {
  background: #fee2e2;
  color: #991b1b;
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
