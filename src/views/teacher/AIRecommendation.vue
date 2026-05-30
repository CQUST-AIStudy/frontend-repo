<template>
  <div class="ai-recommendation">
    <page-header
      class="my-page-header"
      title="AI 教学建议"
      description="基于课程真实数据生成教学分析。当 AI 服务异常时，页面会自动展示本地兜底建议。"
    />

    <div class="recommendation-content">
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <span>分析配置</span>
            <div class="stat-strip" v-if="courseData">
              <span>{{ courseData.studentCount }} 名学生</span>
              <span>{{ courseData.totalExperiments }} 个实验</span>
              <span>平均提交率 {{ courseData.avgSubmissionRate }}%</span>
            </div>
          </div>
        </template>

        <el-form :model="analysisForm" label-position="top" class="analysis-form">
          <el-form-item label="分析内容">
            <el-checkbox-group v-model="analysisForm.content" class="checkbox-grid">
              <el-checkbox label="learning_status">学习状态分析</el-checkbox>
              <el-checkbox label="knowledge_points">知识点掌握情况</el-checkbox>
              <el-checkbox label="improvement">改进建议</el-checkbox>
              <el-checkbox label="course_design">课程设计优化</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <div class="form-actions">
            <el-button type="primary" :loading="loading" @click="generateRecommendation">
              {{ loading ? 'AI 分析中...' : '生成 AI 教学建议' }}
            </el-button>
            <span class="form-hint">如果后端返回 401/500，页面会切换为本地分析结果。</span>
          </div>
        </el-form>
      </el-card>

      <el-card v-if="dataLoading" class="result-card">
        <div class="loading-hint">
          <el-icon class="is-loading" :size="24"><Loading /></el-icon>
          <span>正在加载课程数据...</span>
        </div>
      </el-card>

      <el-alert
        v-if="errorMessage"
        class="error-alert"
        :title="errorMessage"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <span>页面已使用当前课程数据生成本地兜底建议，便于你继续查看分析结果。</span>
        </template>
      </el-alert>

      <el-card v-if="aiContent || loading || errorMessage" class="result-card">
        <template #header>
          <div class="card-header">
            <div class="result-title">
              <span>AI 教学建议</span>
              <el-tag v-if="usingFallback" type="warning" size="small" effect="plain">本地兜底</el-tag>
            </div>
            <el-button v-if="aiContent && !loading" type="primary" plain size="small" @click="copyResult">
              复制结果
            </el-button>
          </div>
        </template>

        <div class="ai-content">
          <div class="ai-header">
            <el-avatar :size="38">AI</el-avatar>
            <div class="ai-header__text">
              <span class="ai-name">教学分析助手</span>
              <span class="ai-subtitle">{{ loading ? '正在整理建议...' : usingFallback ? '当前展示本地兜底分析' : '已返回模型分析结果' }}</span>
            </div>
          </div>

          <div v-if="loading" class="loading-block">
            <el-skeleton :rows="7" animated />
          </div>
          <div v-else class="ai-text" v-html="renderedContent"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import api from '../../api'
import { buildStructuredPrompt, chatSend } from '../../api/tap'
import PageHeader from '../../components/PageHeader.vue'
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
      console.error('加载教师实验列表失败:', expResult.reason)
    }
    if (subResult.status === 'rejected') {
      console.error('加载学生提交数据失败:', subResult.reason)
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
    console.error('加载课程数据失败:', error)
    ElMessage.warning('加载课程数据失败，将使用有限信息生成建议')
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
    `- 当前共覆盖 ${data.studentCount} 名学生、${data.totalExperiments} 个实验。`,
    `- 平均提交率约为 ${data.avgSubmissionRate}% 。若该数值持续偏低，优先排查实验节奏和作业说明是否清晰。`,
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
    ElMessage.warning('请至少选择一项分析内容')
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
    ElMessage.success('AI 教学建议生成完成')
  } catch (error) {
    console.error('生成失败:', error)
    errorMessage.value = formatAiErrorMessage(error)
    usingFallback.value = true
    aiContent.value = buildFallbackRecommendation()
    ElMessage.warning(errorMessage.value)
  } finally {
    loading.value = false
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(aiContent.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.warning('复制失败，请手动复制')
  }
}

onMounted(() => {
  router.replace('/teacher/class-detailed-analysis')
})
</script>

<style scoped>
.recommendation-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.form-card,
.result-card {
  border-radius: 22px;
  border: 1px solid #dbe4ef;
  box-shadow: 0 12px 32px rgba(48, 72, 104, 0.06);
}

.analysis-form {
  padding-top: 4px;
}

.stat-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #6e8097;
  font-size: 12px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.form-hint {
  font-size: 12px;
  color: #7a8da5;
}

.loading-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  color: #8a9cb0;
}

.error-alert {
  border-radius: 18px;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-header__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-name {
  font-weight: 700;
  color: #1d3557;
}

.ai-subtitle {
  font-size: 12px;
  color: #7b8ea5;
}

.loading-block {
  padding-top: 6px;
}

.ai-text {
  line-height: 1.9;
  color: #1f344c;
  font-size: 14px;
}

.ai-text :deep(h1),
.ai-text :deep(h2),
.ai-text :deep(h3),
.ai-text :deep(h4) {
  margin: 20px 0 10px;
  color: #18314d;
}

.ai-text :deep(p) {
  margin: 0 0 10px;
}

.ai-text :deep(ul),
.ai-text :deep(ol) {
  padding-left: 20px;
}

.ai-text :deep(li) {
  margin-bottom: 6px;
}

.ai-text :deep(code) {
  padding: 2px 6px;
  border-radius: 6px;
  background: #f4f7fb;
  color: #275187;
  font-size: 13px;
}

.ai-text :deep(blockquote) {
  margin: 12px 0;
  padding: 10px 14px;
  border-left: 4px solid #4d8be6;
  background: rgba(77, 139, 230, 0.08);
  border-radius: 10px;
}

@media (max-width: 768px) {
  .checkbox-grid {
    grid-template-columns: 1fr;
  }
}
</style>
