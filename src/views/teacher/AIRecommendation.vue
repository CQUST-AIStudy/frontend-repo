<template>
  <div class="ai-recommendation">
    <UiPageHeader
      class="my-page-header"
      title="AI 教学建议"
      description="基于课程真实数据生成教学分析。当 AI 服务异常时，页面会自动展示本地兜底建议。"
    />

    <div class="flex flex-col gap-5 mb-10 py-2.5">
      <!-- Form Card -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-start gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">分析配置</span>
          <div class="flex flex-wrap gap-2.5 text-[12px] text-[#86868b] ml-auto" v-if="courseData">
            <span>{{ courseData.studentCount }} 名学生</span>
            <span>{{ courseData.totalExperiments }} 个实验</span>
            <span>平均提交率{{ courseData.avgSubmissionRate }}%</span>
          </div>
        </div>

        <div class="pt-1">
          <div class="mb-4">
            <label class="block text-[13px] font-medium text-[#6e6e73] mb-3">分析内容</label>
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#f5f5f7] cursor-pointer transition-all hover:bg-[#ededf0] has-[:checked]:bg-[rgba(0,122,255,0.08)] has-[:checked]:shadow-[inset_0_0_0_1.5px_rgba(0,122,255,0.4)]">
                <UiInput type="checkbox" v-model="analysisForm.content" value="learning_status" class="w-4 h-4 rounded accent-[#007aff]" />
                <span class="text-[13px] text-[#1d1d1f]">学习状态分析</span>
              </label>
              <label class="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#f5f5f7] cursor-pointer transition-all hover:bg-[#ededf0] has-[:checked]:bg-[rgba(0,122,255,0.08)] has-[:checked]:shadow-[inset_0_0_0_1.5px_rgba(0,122,255,0.4)]">
                <UiInput type="checkbox" v-model="analysisForm.content" value="knowledge_points" class="w-4 h-4 rounded accent-[#007aff]" />
                <span class="text-[13px] text-[#1d1d1f]">知识点掌握情况</span>
              </label>
              <label class="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#f5f5f7] cursor-pointer transition-all hover:bg-[#ededf0] has-[:checked]:bg-[rgba(0,122,255,0.08)] has-[:checked]:shadow-[inset_0_0_0_1.5px_rgba(0,122,255,0.4)]">
                <UiInput type="checkbox" v-model="analysisForm.content" value="improvement" class="w-4 h-4 rounded accent-[#007aff]" />
                <span class="text-[13px] text-[#1d1d1f]">改进建议</span>
              </label>
              <label class="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#f5f5f7] cursor-pointer transition-all hover:bg-[#ededf0] has-[:checked]:bg-[rgba(0,122,255,0.08)] has-[:checked]:shadow-[inset_0_0_0_1.5px_rgba(0,122,255,0.4)]">
                <UiInput type="checkbox" v-model="analysisForm.content" value="course_design" class="w-4 h-4 rounded accent-[#007aff]" />
                <span class="text-[13px] text-[#1d1d1f]">课程设计优化</span>
              </label>
            </div>
          </div>

          <div class="flex items-center flex-wrap gap-3">
            <UiButton
              class="inline-flex items-center gap-2 h-[38px] px-5 rounded-[10px] bg-[#007aff] text-white text-[14px] font-medium shadow-[0_2px_8px_rgba(0,122,255,0.3)] transition-all hover:bg-[#0066d6] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
              @click="generateRecommendation"
            >
              {{ loading ? 'AI 分析中..' : '生成 AI 教学建议' }}
            </UiButton>
            <span class="text-[12px] text-[#86868b]">如果后端返回 401/500，页面会切换为本地分析结果。</span>
          </div>
        </div>
      </div>

      <!-- Data Loading Card -->
      <div v-if="dataLoading" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center gap-2.5 py-5 text-[#86868b]">
          <Loading class="w-6 h-6 animate-spin text-[#007aff]" />
          <span class="text-[14px]">正在加载课程数据...</span>
        </div>
      </div>

      <!-- Error Alert -->
      <div
        v-if="errorMessage"
        class="flex items-start gap-3 p-4 rounded-[14px] border border-[rgba(255,149,0,0.2)] bg-[rgba(255,149,0,0.06)]"
      >
        <span class="text-[#ff9500] text-lg shrink-0"><LucideIcon name="alert-triangle" :size="18" /></span>
        <div class="flex-1">
          <div class="text-[14px] font-medium text-[#ff9500]">{{ errorMessage }}</div>
          <div class="text-[13px] text-[#6e6e73] mt-1">页面已使用当前课程数据生成本地兜底建议，便于你继续查看分析结果。</div>
        </div>
      </div>

      <!-- Result Card -->
      <div v-if="aiContent || loading || errorMessage" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <div class="flex items-center gap-2.5">
            <span class="text-[15px] font-semibold text-[#1d1d1f]">AI 教学建议</span>
            <span v-if="usingFallback" class="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-medium bg-[rgba(255,149,0,0.1)] text-[#ff9500]">本地兜底</span>
          </div>
          <UiButton
            v-if="aiContent && !loading"
            class="ml-auto inline-flex items-center gap-1.5 h-[30px] px-3 rounded-[8px] border border-[#007aff]/20 text-[#007aff] text-[13px] font-medium transition-all hover:bg-[#007aff]/5 active:scale-[0.97]"
            @click="copyResult"
          >
            复制结果
          </UiButton>
        </div>

        <div class="flex flex-col gap-4 py-2.5">
          <div class="flex items-center gap-2.5">
            <div class="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#007aff] to-[#5856d6] flex items-center justify-center text-white text-[13px] font-bold shrink-0">AI</div>
            <div class="flex flex-col gap-1">
              <span class="font-bold text-[14px] text-[#1d1d1f]">教学分析助手</span>
              <span class="text-[12px] text-[#86868b]">{{ loading ? '正在整理建议...' : usingFallback ? '当前展示本地兜底分析' : '已返回模型分析结果' }}</span>
            </div>
          </div>

          <div v-if="loading" class="pt-1.5 space-y-3">
            <div class="h-4 bg-[#f5f5f7] rounded-[6px] animate-pulse w-full"></div>
            <div class="h-4 bg-[#f5f5f7] rounded-[6px] animate-pulse w-[92%]"></div>
            <div class="h-4 bg-[#f5f5f7] rounded-[6px] animate-pulse w-[85%]"></div>
            <div class="h-4 bg-[#f5f5f7] rounded-[6px] animate-pulse w-[96%]"></div>
            <div class="h-4 bg-[#f5f5f7] rounded-[6px] animate-pulse w-[78%]"></div>
            <div class="h-4 bg-[#f5f5f7] rounded-[6px] animate-pulse w-[88%]"></div>
            <div class="h-4 bg-[#f5f5f7] rounded-[6px] animate-pulse w-[70%]"></div>
          </div>
          <div v-else class="leading-[1.8] text-[14px] text-[#1d1d1f] prose prose-sm max-w-none" v-html="renderedContent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { Loading } from '@/components/ui/icons'
import LucideIcon from '@/components/LucideIcon.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import api from '../../api'
import { buildStructuredPrompt, chatSend } from '../../api/tap'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

const loading = ref(false)
const router = useRouter()
const dataLoading = ref(false)
const aiContent = ref('')
const errorMessage = ref('')
const usingFallback = ref(false)

const analysisForm = reactive({
  content: ['learning_status', 'knowledge_points', 'improvement']
})

const courseData = ref(null)

function truncateLabel(text, max = 24) {
  const normalized = String(text || '').trim()
  if (!normalized) return '未命名实验'
  return normalized.length > max ? `${normalized.slice(0, max)}...` : normalized
}

function buildExperimentItems(items, options = {}) {
  const list = Array.isArray(items) ? items : []
  const limit = options.limit || 16
  const visibleItems = list.slice(0, limit).map(item => options.mapper(item))
  if (list.length <= limit) {
    return visibleItems
  }
  const hiddenItems = list.slice(limit)
  const avgCompletionRate = Math.round(hiddenItems.reduce((sum, item) => sum + Number(item.completionRate || 0), 0) / hiddenItems.length)
  const avgScore = Math.round(hiddenItems.reduce((sum, item) => sum + Number(item.averageScore || 0), 0) / hiddenItems.length)
  return [
    ...visibleItems,
    `其余 ${hiddenItems.length} 个实验已合并展示：平均完成率 ${avgCompletionRate}%，平均分 ${avgScore}`,
  ]
}

const renderedContent = computed(() => {
  if (!aiContent.value) return ''
  return DOMPurify.sanitize(marked.parse(aiContent.value))
})

const loadCourseData = async () => {
  dataLoading.value = true
  try {
    const [expResult, subResult] = await Promise.allSettled([
      api.getTeacherExperimentList({ scope: 'all' }),
      api.getAllStudentExperiments({ scope: 'all' })
    ])

    if (expResult.status === 'rejected') {
      logger.error('加载教师实验列表失败:', expResult.reason)
    }
    if (subResult.status === 'rejected') {
      logger.error('加载学生提交数据失败:', subResult.reason)
    }

    const expRes = expResult.status === 'fulfilled' ? expResult.value : null
    const subRes = subResult.status === 'fulfilled' ? subResult.value : null

    let experiments = []
    if (Array.isArray(expRes?.data)) experiments = expRes.data
    else if (Array.isArray(expRes)) experiments = expRes

    const submissions = Array.isArray(subRes?.data) ? subRes.data : Array.isArray(subRes) ? subRes : []
    if (!experiments.length && !submissions.length && (expResult.status === 'rejected' || subResult.status === 'rejected')) {
      throw new Error('课程实验和学生提交数据均未加载成功')
    }

    const studentCountFromExp = Number(expRes?.studentCount || 0)
    const studentIds = new Set(submissions.map(item => item.studentId).filter(Boolean))
    const studentCount = studentCountFromExp || studentIds.size || 1

    const totalExperiments = experiments.length
    const avgSubmissionRate = totalExperiments > 0
      ? Math.round(experiments.reduce((sum, item) => sum + Number(item.submissionCount || 0), 0) / totalExperiments / studentCount * 100)
      : 0

    const experimentStats = experiments.map(item => ({
      name: item.name || '未命名实验',
      submissionCount: Number(item.submissionCount || 0),
      completionRate: studentCount > 0 ? Math.round((Number(item.submissionCount || 0) / studentCount) * 100) : 0,
      averageScore: Number(item.averageScore || 0)
    }))

    courseData.value = {
      studentCount,
      totalExperiments,
      avgSubmissionRate,
      experimentStats,
      lowCompletionExps: experimentStats.filter(item => item.completionRate < 70),
      lowScoreExps: experimentStats.filter(item => item.averageScore > 0 && item.averageScore < 60)
    }
  } catch (error) {
    logger.error('加载课程数据失败:', error)
    uiMessage.warning('加载课程数据失败，将使用有限信息生成建议')
  } finally {
    dataLoading.value = false
  }
}

const buildPrompt = () => {
  const sections = analysisForm.content
  const data = courseData.value
  const contextSections = []

  if (data) {
    contextSections.push({
      title: '课程概况',
      items: [
        `学生总数：${data.studentCount}`,
        `实验总数：${data.totalExperiments}`,
        `平均提交率：${data.avgSubmissionRate}%`,
      ],
    })
    contextSections.push({
      title: '各实验数据',
      items: buildExperimentItems(data.experimentStats, {
        mapper: item => `${truncateLabel(item.name)}：完成率 ${item.completionRate}%，提交 ${item.submissionCount} 人，平均分 ${item.averageScore}`,
      }),
    })
    if (data.lowCompletionExps.length) {
      contextSections.push({
        title: '低完成率实验',
        items: buildExperimentItems(data.lowCompletionExps, {
          limit: 8,
          mapper: item => `${truncateLabel(item.name)}：完成率 ${item.completionRate}%`,
        }),
      })
    }
    if (data.lowScoreExps.length) {
      contextSections.push({
        title: '低分实验',
        items: buildExperimentItems(data.lowScoreExps, {
          limit: 8,
          mapper: item => `${truncateLabel(item.name)}：平均分 ${item.averageScore}`,
        }),
      })
    }
  }

  const instructions = []
  if (sections.includes('learning_status')) instructions.push('分析课程整体学习状态、实验推进节奏和阶段性风险。')
  if (sections.includes('knowledge_points')) instructions.push('结合实验表现判断学生掌握薄弱的知识点，并说明判断依据。')
  if (sections.includes('improvement')) instructions.push('给出可执行的教学改进建议，按优先级排序，并说明预期效果。')
  if (sections.includes('course_design')) instructions.push('对实验安排、难度梯度和课程设计提出优化建议。')

  return buildStructuredPrompt({
    role: '你是一位资深高校教学顾问，擅长根据课程真实数据输出教学诊断和行动建议。',
    task: '请基于以下课程数据生成结构清晰、可执行的教学分析与建议。',
    contextSections,
    instructions,
    outputRequirements: [
      '使用 Markdown 输出。',
      '先给出结论，再展开分析。',
      '建议尽量具体，避免空泛表述。',
    ],
  })
}

const buildFallbackRecommendation = () => {
  const data = courseData.value
  if (!data) {
    return [
      '## 当前可用信息有限',
      '',
      '- 课程基础数据暂未加载完成，建议先检查实验列表和学生提交接口。',
      '- 如果 AI 服务持续报错，请确认后端鉴权和模型服务状态。',
      '- 页面保留了本地兜底逻辑，后续可再次点击生成。'
    ].join('\n')
  }

  const lowCompletionText = data.lowCompletionExps.length
    ? data.lowCompletionExps.map(item => `- ${item.name}：完成率 ${item.completionRate}%`).join('\n')
    : '- 暂无明显低完成率实验。'

  const lowScoreText = data.lowScoreExps.length
    ? data.lowScoreExps.map(item => `- ${item.name}：平均分 ${item.averageScore}`).join('\n')
    : '- 暂无明显低分实验。'

  return [
    '## 课程整体判断',
    '',
    `- 当前共覆盖${data.studentCount} 名学生、${data.totalExperiments} 个实验。`,
    `- 平均提交率约为${data.avgSubmissionRate}% 。若该数值持续偏低，优先排查实验节奏和作业说明是否清晰。`,
    '',
    '## 需要重点关注的实验',
    '',
    lowCompletionText,
    '',
    '## 成绩风险点',
    '',
    lowScoreText,
    '',
    '## 建议动作',
    '',
    '- 对低完成率实验补充操作演示或拆分为更小的阶段任务。',
    '- 对低分实验安排一次集中讲评，优先解释高频错误和评分标准。',
    '- 在下次实验发布前增加预习材料和完成示例，降低首次上手成本。',
    '- 对成绩分层明显的班级，分别准备基础巩固题和拔高题。'
  ].join('\n')
}

const formatAiErrorMessage = (error) => {
  return getFriendlyErrorMessage(error, 'AI 服务请求失败，已切换为本地分析摘要')
}

const generateRecommendation = async () => {
  if (loading.value) return
  if (!analysisForm.content.length) {
    uiMessage.warning('请至少选择一项分析内容')
    return
  }

  loading.value = true
  errorMessage.value = ''
  usingFallback.value = false
  aiContent.value = ''

  try {
    if (!courseData.value) await loadCourseData()

    const res = await chatSend(buildPrompt(), [])
    const data = res?.data ?? res
    aiContent.value = data?.reply || '暂无建议'
    uiMessage.success('AI 教学建议生成完成')
  } catch (error) {
    logger.error('生成失败:', error)
    errorMessage.value = formatAiErrorMessage(error)
    usingFallback.value = true
    aiContent.value = buildFallbackRecommendation()
    uiMessage.warning(errorMessage.value)
  } finally {
    loading.value = false
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(aiContent.value)
    uiMessage.success('已复制到剪贴板')
  } catch {
    uiMessage.warning('复制失败，请手动复制')
  }
}

onMounted(() => {
  router.replace('/teacher/class-detailed-analysis')
})
</script>
