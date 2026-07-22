<template>
  <div class="ai-report-container [height:100%]">
    <UiPageHeader class="my-page-header [padding:20px]" title="AI实验报告生成中心" description="通过AI快速生成专业的数据结构实验报告" />

    <div class="report-content [margin-top:20px] [padding-bottom:60px]">
      <ui-row :gutter="20">
        <!-- 左侧实验列表 -->
        <ui-col :span="8">
          <ui-card class="experiments-card [height:80vh] [display:flex] [flex-direction:column]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [&_h3]:[margin:0] [&_h3]:[color:#202124] [align-items:flex-start] [gap:16px] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                <h3>我的实验列表</h3>
                <ui-input v-model="searchQuery" placeholder="搜索实验" clearable prefix-icon="Search" size="small" />
              </div>
            </template>

            <div class="experiment-list [height:65vh] [flex:1] [overflow-y:auto] [margin-top:10px]">
              <loading-state :loading="experimentStore.loading">
                <ui-empty v-if="filteredExperiments.length === 0" description="没有找到实验"></ui-empty>

                <div v-else class="experiment-items [display:flex] [flex-direction:column] [gap:12px]">
                  <ui-card v-for="experiment in filteredExperiments" :key="experiment.id" class="experiment-item [cursor:pointer] [transition:all_0.3s] [margin-bottom:0] [border-left:3px_solid_transparent] [border-radius:16px] hover:[transform:translateY(-2px)] hover:[box-shadow:0_4px_12px_rgba(0,_0,_0,_0.1)] [&.selected]:[border-left-color:#1a73e8] [&.selected]:[background-color:#e8f0fe]"
                           :class="{ selected: selectedExperiment && selectedExperiment.id === experiment.id }"
                           @click="selectExperiment(experiment)">
                    <div class="experiment-item-header [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:10px]">
                      <span class="experiment-name [font-weight:500] [font-size:15px] [color:#202124]">{{ experiment.name }}</span>
                      <ui-tag :type="getStatusType(experiment.status)">
                        {{ getStatusText(experiment.status) }}
                      </ui-tag>
                    </div>

                    <div class="experiment-item-info [font-size:13px] [color:#5f6368]">
                      <div class="info-row [display:flex] [align-items:center] [margin-bottom:5px]">
                        <ui-icon>
                          <Timer />
                        </ui-icon>
                        <span>截止日期：{{ experiment.deadline }}</span>
                      </div>

                      <div class="info-row [display:flex] [align-items:center] [margin-bottom:5px]">
                        <ui-icon>
                          <Calendar />
                        </ui-icon>
                        <span>提交时间：{{ experiment.submitTime || '未提交' }}</span>
                      </div>

                      <div class="info-row report-status [display:flex] [align-items:center] [margin-bottom:5px]">
                        <template v-if="experiment.report">
                          <ui-icon class="success-icon">
                            <DocumentChecked />
                          </ui-icon>
                          <span>已生成报告</span>
                        </template>
                        <template v-else>
                          <ui-icon class="warning-icon">
                            <Warning />
                          </ui-icon>
                          <span>未生成报告</span>
                        </template>
                      </div>
                    </div>
                  </ui-card>
                </div>
              </loading-state>
            </div>
          </ui-card>
        </ui-col>

        <!-- 右侧报告生成与预览-->
        <ui-col :span="16">
          <ui-card class="report-card" v-if="selectedExperiment">
            <template #header>
              <div class="report-card-header [display:flex] [justify-content:space-between] [align-items:center]">
                <div class="title-info [display:flex] [align-items:center]">
                  <h3>{{ selectedExperiment.name }}</h3>
                  <ui-tag :type="getStatusType(selectedExperiment.status)">
                    {{ getStatusText(selectedExperiment.status) }}
                  </ui-tag>
                </div>

                <div class="header-actions [display:flex] [gap:8px] [align-items:center]" v-if="selectedExperiment.status === 'completed'">
                  <ui-button type="success" @click="viewReport" v-if="selectedExperiment.report">
                    <ui-icon>
                      <View />
                    </ui-icon>
                    查看报告
                  </ui-button>
                   <ui-button type="primary" :loading="experimentStore.generatingReport"
                              :disabled="experimentStore.generatingReport || !canGenerateReport" @click="generateReport">
                    <ui-icon>
                      <MagicStick />
                    </ui-icon>
                    {{ selectedExperiment.report ? '重新生成报告' : '生成AI报告' }}
                  </ui-button>

                  <!-- <ui-button v-if="selectedExperiment.report" type="warning" @click="downloadReport">
                    <ui-icon>
                      <Download />
                    </ui-icon>
                    下载报告
                  </ui-button> -->

                  <ui-button v-if="selectedExperiment.report" type="primary" @click="generateWordDoc">
                    <ui-icon>
                      <Download />
                    </ui-icon>下载Word文档
                  </ui-button>


                </div>
              </div>
            </template>

            <loading-state :loading="loading">
              <div v-if="selectedExperiment.status !== 'completed'" class="incomplete-experiment">
                <ui-empty description="请先完成实验，再生成报告">
                  <template #image>
                    <ui-icon class="incomplete-icon [font-size:60px] [color:#909399]">
                      <WarningFilled />
                    </ui-icon>
                  </template>
                  <ui-button type="primary" @click="$router.push('/student/experiments')">前往实验页面</ui-button>
                </ui-empty>
              </div>

              <div v-else-if="!selectedExperiment.report && !isReportViewVisible" class="no-report [text-align:center] [padding:30px_20px]">
                <div v-if="!canGenerateReport" class="mb-5 rounded-xl border border-[#f3d19e] bg-[#fdf6ec] px-4 py-3 text-left text-sm text-[#b88230]">
                  {{ reportIneligibleReason }}
                </div>
                <div class="ai-feature [margin-bottom:30px]">
                  <ui-icon class="ai-feature-icon [font-size:60px] [color:#1a73e8] [margin-bottom:20px]">
                    <MagicStick />
                  </ui-icon>
                  <h2>AI实验报告智能生成</h2>
                  <p>基于您的实验代码和数据，AI可以快速生成一份完整的专业报告</p>
                </div>

                <div class="report-benefits [display:flex] [justify-content:space-around] [margin:40px_0] [flex-wrap:wrap]">
                  <div class="benefit-item [flex:1] [min-width:200px] [max-width:250px] [margin:0_10px_20px] [padding:20px] [border-radius:16px] [text-align:center] [background:#f8f9fa] [border:1px_solid_#dadce0]">
                    <ui-icon class="benefit-icon [font-size:40px] [color:#1a73e8] [margin-bottom:15px]">
                      <Stopwatch />
                    </ui-icon>
                    <h3>节省时间</h3>
                    <p>几秒钟内完成报告，专注于学习的关键部分</p>
                  </div>
                  <div class="benefit-item [flex:1] [min-width:200px] [max-width:250px] [margin:0_10px_20px] [padding:20px] [border-radius:16px] [text-align:center] [background:#f8f9fa] [border:1px_solid_#dadce0]">
                    <ui-icon class="benefit-icon [font-size:40px] [color:#1a73e8] [margin-bottom:15px]">
                      <DataLine />
                    </ui-icon>
                    <h3>专业分析</h3>
                    <p>智能分析代码，提供算法复杂度评估</p>
                  </div>
                  <div class="benefit-item [flex:1] [min-width:200px] [max-width:250px] [margin:0_10px_20px] [padding:20px] [border-radius:16px] [text-align:center] [background:#f8f9fa] [border:1px_solid_#dadce0]">
                    <ui-icon class="benefit-icon [font-size:40px] [color:#1a73e8] [margin-bottom:15px]">
                      <Reading />
                    </ui-icon>
                    <h3>规范格式</h3>
                    <p>标准格式，包含所有必要章节，可自定义修改</p>
                  </div>
                </div>

                <div class="generate-action [margin-top:30px]">
                  <ui-button type="primary" size="large" :loading="experimentStore.generatingReport"
                              :disabled="experimentStore.generatingReport || !canGenerateReport" @click="generateReport">
                    <ui-icon>
                      <MagicStick />
                    </ui-icon>
                    开始生成AI报告
                  </ui-button>
                </div>
              </div>

              <!-- 使用 ReportGenerator 组件 -->
              <div v-else-if="isReportViewVisible && selectedExperiment.report" class="report-view [padding:0]">
                <div class="view-header [padding:0_0_20px_0] [display:flex] [justify-content:flex-start]">
                  <ui-button type="info" @click="closeReportView">
                    <ui-icon>
                      <Back />
                    </ui-icon>
                    返回
                  </ui-button>
                </div>

                <report-generator :report-data="reportData" @update:report-data="handleReportDataUpdate"/>
              </div>

              <div v-else class="experiment-details [margin-top:20px]">
                <ui-descriptions title="实验信息" :column="2" border>
                  <ui-descriptions-item label="实验状态">
                    <ui-tag :type="getStatusType(selectedExperiment.status)">
                      {{ getStatusText(selectedExperiment.status) }}
                    </ui-tag>
                  </ui-descriptions-item>

                  <ui-descriptions-item label="实验得分">
                    <span class="score [font-size:16px] [font-weight:bold] [color:#f56c6c] [color:#409eff] [font-weight:700]">{{ selectedExperiment.score || '暂无' }}</span>
                  </ui-descriptions-item>

                  <ui-descriptions-item label="截止日期">
                    {{ selectedExperiment.deadline }}
                  </ui-descriptions-item>

                  <ui-descriptions-item label="提交时间">
                    {{ selectedExperiment.submitTime || '未提交' }}
                  </ui-descriptions-item>

                  <ui-descriptions-item label="查重率" :span="2">
                    <ui-progress :percentage="selectedExperiment.plagiarismRate || 0"
                                 :color="getPlagiarismColor(selectedExperiment.plagiarismRate)"></ui-progress>
                  </ui-descriptions-item>
                </ui-descriptions>

                <div class="experiment-code [margin-top:20px]" v-if="selectedExperiment.code || selectedExperiment.problems?.length">
                  <div class="[display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [margin-bottom:12px]">
                    <h3 class="[margin:0]">实验代码</h3>
                    <span v-if="parsedQuestions.length > 0" class="[font-size:12px] [color:var(--app-text-secondary)]">
                      共 {{ parsedQuestions.length }} 题
                    </span>
                  </div>

                  <div v-if="parsedQuestions.length > 0" class="[display:grid] [grid-template-columns:140px_minmax(0,1fr)] [border:1px_solid_var(--app-border-soft)] [border-radius:var(--app-radius-md)] [overflow:hidden] max-[640px]:[display:flex] max-[640px]:[flex-direction:column]">
                    <div class="[display:flex] [flex-direction:column] [gap:2px] [padding:6px] [background:var(--app-surface-muted)] [border-right:1px_solid_var(--app-border-soft)] max-[640px]:[flex-direction:row] max-[640px]:[overflow-x:auto] max-[640px]:[border-right:none] max-[640px]:[border-bottom:1px_solid_var(--app-border-soft)]" role="tablist" aria-label="实验题目">
                      <UiButton
                        :type="activeQuestionTab === 'full' ? 'primary' : 'default'"
                        size="small"
                        :aria-selected="activeQuestionTab === 'full'"
                        role="tab"
                        class="[justify-content:flex-start] [white-space:nowrap] max-[640px]:[flex:0_0_auto]"
                        @click="activeQuestionTab = 'full'"
                      >
                        完整源码
                      </UiButton>
                      <UiButton
                        v-for="(question, index) in parsedQuestions"
                        :key="`question-tab-${question.number}-${index}`"
                        :type="activeQuestionTab === String(index) ? 'primary' : 'default'"
                        size="small"
                        :aria-selected="activeQuestionTab === String(index)"
                        role="tab"
                        class="[justify-content:flex-start] [white-space:nowrap] max-[640px]:[flex:0_0_auto]"
                        @click="activeQuestionTab = String(index)"
                      >
                        第{{ question.number }}题
                      </UiButton>
                    </div>

                    <div class="[min-width:0] [padding:16px]">
                      <div v-if="activeQuestionTab === 'full'" role="tabpanel">
                        <div class="[display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [margin-bottom:12px]">
                          <span class="[font-size:14px] [font-weight:600] [color:var(--app-text)]">完整源码</span>
                          <span class="[font-size:12px] [color:var(--app-text-secondary)]">学生原始提交</span>
                        </div>
                        <CodeViewer v-if="selectedExperiment.code" :code="selectedExperiment.code" language="cpp" maxHeight="clamp(260px, 46vh, 500px)" />
                        <div v-else class="[padding:32px_16px] [text-align:center] [font-size:13px] [color:var(--app-text-secondary)]">暂无完整源码</div>
                      </div>

                      <div v-for="(question, index) in parsedQuestions" v-show="activeQuestionTab === String(index)" :key="`question-panel-${question.number}-${index}`" role="tabpanel">
                        <div v-if="question.problemTitle || question.statementMd || question.problemNo" class="[margin-bottom:16px] [padding:14px_16px] [border-radius:var(--app-radius-sm)] [background:var(--app-surface-muted)]">
                          <div class="[display:flex] [align-items:baseline] [flex-wrap:wrap] [gap:8px] [margin-bottom:8px]">
                            <span class="[font-size:14px] [font-weight:600] [color:var(--app-primary)]">第{{ question.number }}题</span>
                            <span v-if="question.problemNo" class="[font-size:12px] [color:var(--app-text-secondary)]">题号：{{ question.problemNo }}</span>
                            <span v-if="question.problemTitle" class="[font-size:14px] [font-weight:600] [color:var(--app-text)]">{{ question.problemTitle }}</span>
                          </div>
                          <div v-if="question.statementMd" class="markdown-body [font-size:13px] [line-height:1.7] [color:var(--app-text)] [&_p]:[margin:8px_0] [&_pre]:[overflow-x:auto] [&_pre]:[margin:10px_0] [&_pre]:[padding:12px] [&_pre]:[border-radius:8px] [&_pre]:[background:var(--app-surface)] [&_ul]:[padding-left:20px] [&_ol]:[padding-left:20px]" v-html="renderMarkdown(question.statementMd)"></div>
                        </div>
                        <div v-if="question.code" class="[margin-bottom:16px]">
                          <div class="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:8px]">
                            <span class="[font-size:13px] [font-weight:600] [color:var(--app-text)]">第{{ question.number }}题代码</span>
                            <span v-if="question.testResults" class="[font-size:12px] [color:var(--app-text-secondary)]">测试结果已提供</span>
                          </div>
                          <CodeViewer :code="question.code" language="cpp" maxHeight="clamp(260px, 46vh, 500px)" />
                        </div>
                        <div v-else class="[margin-bottom:16px] [padding:28px_16px] [text-align:center] [font-size:13px] [color:var(--app-text-secondary)] [border:1px_dashed_var(--app-border-soft)] [border-radius:var(--app-radius-sm)]">本题暂无代码提交</div>
                        <div v-if="question.testResults" class="[padding:12px] [overflow:auto] [border-radius:var(--app-radius-sm)] [background:var(--app-surface-muted)]">
                          <h4 class="[margin:0_0_8px] [font-size:13px] [font-weight:600] [color:var(--app-text)]">测试结果</h4>
                          <pre class="[margin:0] [white-space:pre-wrap] [font-size:12px] [line-height:1.6] [color:var(--app-text-secondary)]"><code>{{ question.testResults }}</code></pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="selectedExperiment.code" class="[margin-top:8px]"><CodeViewer :code="selectedExperiment.code" language="cpp" maxHeight="clamp(260px, 46vh, 500px)" /></div>
                  <div v-else class="[padding:32px_16px] [text-align:center] [font-size:13px] [color:var(--app-text-secondary)]">暂无代码提交</div>
                </div>

                <div class="ai-comment [margin-top:20px]" v-if="selectedExperiment.aiComment">
                  <h3>AI点评</h3>
                  <div class="ai-content markdown-content [display:flex] [flex-direction:column] [gap:18px] [padding:10px_0] [padding:10px] [line-height:1.6]" v-html="renderMarkdown(selectedExperiment.aiComment)"></div>
                </div>

              </div>
            </loading-state>
          </ui-card>

          <ui-empty v-else description="请选择一个实验">
            <template #image>
              <ui-icon class="empty-icon [font-size:60px] [color:#909399]"><Select /></ui-icon>
            </template>
          </ui-empty>
        </ui-col>
      </ui-row>
    </div>

  </div>
</template>

<script setup>
import { useExperimentStore, useUserStore } from '@/store'
import { computed, onMounted, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import {
  MagicStick, View, Download, Timer, Calendar, DocumentChecked, Warning,
  WarningFilled, Stopwatch, DataLine, Reading, Back, Select
} from '@/components/ui/icons'
import { DocxGenerator } from '../../utils/docxGenerator'
import { renderSafeMarkdown } from '@/utils/safeHtml'
import { parseSubmissionQuestions } from '@/utils/submissionQuestionParser.mjs'
import CodeViewer from '@/components/CodeViewer.vue'
import ReportGenerator from '@/components/ReportGenerator.vue'

const experimentStore = useExperimentStore()
const userStore = useUserStore()

function renderMarkdown(text) {
  return renderSafeMarkdown(text)
}

const loading = ref(false)
const searchQuery = ref('')
const selectedExperiment = ref(null)
const isReportViewVisible = ref(false)
const reportData = ref({})
const activeQuestionTab = ref('0')

const canGenerateReport = computed(() => {
  if (!selectedExperiment.value || selectedExperiment.value.status !== 'completed') return false
  if (selectedExperiment.value.aiReportEligible === false) return false
  return Boolean(String(selectedExperiment.value.code || '').trim())
})

const reportIneligibleReason = computed(() => selectedExperiment.value?.aiReportIneligibleReason
  || '该实验尚无本平台 OJ 代码提交。请先在实验页面完成并提交代码，再生成 AI 报告。')


// 过滤后的实验列表
const filteredExperiments = computed(() => {
  if (!experimentStore.experimentList) return []

  return experimentStore.experimentList
      .filter(exp => {
        if (!searchQuery.value) return true
        return exp.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      })
      .sort((a, b) => {
        // 已完成的实验排在前面
        if (a.status === 'completed' && b.status !== 'completed') return -1
        if (a.status !== 'completed' && b.status === 'completed') return 1

        // 其次按照截止日期排序（近的在前）
        return new Date(a.deadline) - new Date(b.deadline)
      })
})

// 状态文本
const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'not_started': '未开始'
  }
  return statusMap[status] || '未知状态'
}

// 状态类型
const getStatusType = (status) => {
  const typeMap = {
    'completed': 'success',
    'in_progress': 'warning',
    'not_started': 'info'
  }
  return typeMap[status] || 'info'
}

// 查重率颜色
const getPlagiarismColor = (rate) => {
  if (rate < 10) return '#67c23a'
  if (rate < 20) return '#e6a23c'
  return '#f56c6c'
}

// 选择实验
const selectExperiment = async (experiment) => {
  selectedExperiment.value = { ...experiment }
  reportData.value = {}
  isReportViewVisible.value = false
  activeQuestionTab.value = '0'
  parsedQuestions.value = []
  parseQuestionCode()

  if (experiment.status !== 'completed') {
    return
  }

  loading.value = true
  try {
    const result = await experimentStore.fetchExperimentReport(experiment.id)
    if (result.success && result.report && selectedExperiment.value?.id === experiment.id) {
      selectedExperiment.value = {
        ...selectedExperiment.value,
        report: result.report,
        reportData: result.data
      }
      return
    }

    if (selectedExperiment.value?.id === experiment.id) {
      selectedExperiment.value = {
        ...selectedExperiment.value,
        report: ''
      }
    }
  } catch (error) {
    logger.error(`加载实验 ${experiment.id} 报告失败:`, error)
    uiMessage.warning('报告加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 生成报告
const generateReport = async () => {
  if (!selectedExperiment.value || selectedExperiment.value.status !== 'completed') {
    uiMessage.warning('请先完成实验')
    return
  }
  if (!canGenerateReport.value) {
    uiMessage.warning(reportIneligibleReason.value)
    return
  }

  // 准备用户数据
  const userData = {
    studentName: userStore.userInfo?.realName || userStore.userInfo?.name || userStore.userInfo?.username || '',
    studentId: userStore.userInfo?.usernum || userStore.userInfo?.username || userStore.userInfo?.id || '',
    className: userStore.userInfo?.class || userStore.userInfo?.classname || '',
    experimentContent: selectedExperiment.value.description || selectedExperiment.value.content || '',
    // 传递完整的实验详情
    experimentName: selectedExperiment.value.name,
    experimentId: selectedExperiment.value.id,
    code: selectedExperiment.value.code,
    score: selectedExperiment.value.score,
    teacherComment: selectedExperiment.value.teacherComment || '',
    submitTime: selectedExperiment.value.submitTime,
    deadline: selectedExperiment.value.deadline,
    plagiarismRate: selectedExperiment.value.plagiarismRate,
    aiComment: selectedExperiment.value.aiComment
  }

  // 直接生成报告，无需填写额外信息
  userData.courseName = "数据结构"
  userData.teacherName = selectedExperiment.value.teacherName || ''
  userData.summary = ''

  try {
    loading.value = true
    logger.debug('生成实验报告，用户数据', userData)

    // 调用AI生成报告
    const result = await experimentStore.generateAIReport(selectedExperiment.value.id, userData)

    if (result.success && result.report) {
      // 更新当前选中的实验报告
      selectedExperiment.value.report = result.report
      selectedExperiment.value.reportData = result.data

      // 更新experimentList中的报告
      const experimentIndex = experimentStore.experimentList.findIndex(exp => exp.id === selectedExperiment.value.id)
      if (experimentIndex !== -1) {
        experimentStore.experimentList[experimentIndex] = {
          ...experimentStore.experimentList[experimentIndex],
          report: result.report,
          reportData: result.data
        }
      }

      // 准备报告数据
      prepareReportData()

      uiMessage.success('AI报告生成成功！')
      isReportViewVisible.value = true
    } else {
      uiMessage.error(result.message || '生成报告失败，请稍后重试')
      logger.error('生成报告失败:', result)
    }
  } catch (error) {
      uiMessage.error(error?.friendlyMessage || error?.response?.data?.message || '生成报告失败，请稍后再试')
    logger.error('生成报告异常:', error)
  } finally {
    loading.value = false
  }
}

// 查看报告
const viewReport = () => {
  if (!selectedExperiment.value || !selectedExperiment.value.report) {
    uiMessage.warning('没有找到报告内容')
    return
  }

  // 准备报告数据
  prepareReportData()

  isReportViewVisible.value = true
}

// 题目分割与steps生成相关
const parsedQuestions = ref([])

// 解析实验代码为题目数组
const parseQuestionCode = () => {
  parsedQuestions.value = parseSubmissionQuestions({
    code: selectedExperiment.value?.code,
    problems: selectedExperiment.value?.problems
  })
  activeQuestionTab.value = '0'
}

// 生成steps内容（只包含代码，不包含测试结果）
const updateReportWithCode = () => {
  if (!reportData.value) return
  let stepsContent = ''
  parsedQuestions.value.forEach((question) => {
    stepsContent += `### 第${question.number}题\n\n`
    stepsContent += '```c\n' + question.code + '\n```\n\n'
    // 不再在这里插入测试结果
  })
  reportData.value.steps = stepsContent
}

// 生成results内容（只包含测试结果，集中展示）
const updateReportWithResults = () => {
  if (!reportData.value) return
  let resultsContent = ''
  parsedQuestions.value.forEach((question) => {
    if (question.testResults) {
      resultsContent += `#### 第${question.number}题测试结果\n\n${question.testResults}\n\n`
    }
  })
  reportData.value.results = resultsContent
}

// 修改prepareReportData，调用分题和steps、results生成
const prepareReportData = () => {
  if (!selectedExperiment.value) return
  parseQuestionCode()
  const profile = userStore.userInfo || {}
  const reportMeta = selectedExperiment.value.reportData || {}
  reportData.value = {
    experimentName: selectedExperiment.value.name,
    studentName: reportMeta.studentName || profile.realName || profile.name || profile.username || '',
    studentId: reportMeta.studentId || profile.usernum || profile.username || profile.id || '',
    className: profile.class || profile.classname || '',
    courseName: '数据结构',
    steps: '', // 由updateReportWithCode生成
    results: '', // 由updateReportWithResults生成
    submitTime: selectedExperiment.value.submitTime,
    deadline: selectedExperiment.value.deadline,
    plagiarismRate: selectedExperiment.value.plagiarismRate,
    labName: reportMeta.labName || reportMeta.labRoomName || selectedExperiment.value.labName || selectedExperiment.value.labRoomName || '',
	labTime: reportMeta.labTime || selectedExperiment.value.labTime || '',
    teacherName: selectedExperiment.value.teacherName || '',
  }
  // 提取其他章节
  if (selectedExperiment.value.report) {
    try {
      const report = selectedExperiment.value.report
      const purposeMatch = report.match(/##?\s*实验目的[^\n]*\n+([\s\S]+?)(?=##)/i)
      if (purposeMatch) reportData.value.purpose = purposeMatch[1].trim()
      const requirementsMatch = report.match(/##?\s*实验环境[^\n]*\n+([\s\S]+?)(?=##)/i)
      if (requirementsMatch) reportData.value.requirements = requirementsMatch[1].trim()
      const tasksMatch = report.match(/##?\s*实验内容[^\n]*\n+([\s\S]+?)(?=##)/i) ||
        report.match(/##?\s*实验任务[^\n]*\n+([\s\S]+?)(?=##)/i)
      if (tasksMatch) reportData.value.tasks = tasksMatch[1].trim()
      const summaryMatch = report.match(/##?\s*实验总结[^\n]*\n+([\s\S]+?)(?=$)/i) ||
        report.match(/##?\s*心得体会[^\n]*\n+([\s\S]+?)(?=$)/i)
      if (summaryMatch) reportData.value.summary = summaryMatch[1].trim()
    } catch (e) {
      logger.error('解析报告内容失败:', e)
    }
  }
  // 生成steps和results
  if (parsedQuestions.value.length > 0) {
    updateReportWithCode()
    updateReportWithResults()
  } else if (selectedExperiment.value.code) {
    reportData.value.steps = '```c\n' + selectedExperiment.value.code + '\n```'
    reportData.value.results = ''
  }
}

// 关闭报告预览
const closeReportView = () => {
  isReportViewVisible.value = false
}

// 处理报告数据更新
const handleReportDataUpdate = (newData) => {
  reportData.value = newData
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    // 加载实验列表
    if (experimentStore.experimentList.length === 0) {
      await experimentStore.fetchExperimentList()
    }
  } catch (error) {
    logger.error(error)
  } finally {
    loading.value = false
  }
})

// 生成并下载Word文档
const generateWordDoc = async () => {
  if (!selectedExperiment.value?.report) {
    uiMessage.warning('没有可下载的报告')
    return
  }

  try {
    if (Object.keys(reportData.value || {}).length === 0) {
      prepareReportData()
    }
    const profile = userStore.userInfo || {}
    const docxGenerator = new DocxGenerator()
    const blob = await docxGenerator.generateStandardReport(reportData.value)

    DocxGenerator.downloadReport(blob, `${profile.usernum || profile.username || profile.id || "学号"}_${profile.name || profile.username || "姓名"}_${selectedExperiment.value.name || '数据结构实验'}.docx`)
    uiMessage.success('报告生成成功！')
  } catch (error) {
    logger.error('生成报告时发生错误', error)
    uiMessage.error('报告生成失败，请稍后重试！')
  }
}
</script>


