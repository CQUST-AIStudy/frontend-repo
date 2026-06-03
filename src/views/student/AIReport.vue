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
                             :disabled="experimentStore.generatingReport" @click="generateReport">
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

                  <ui-button type="primary" @click="generateWordDoc">
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
                             :disabled="experimentStore.generatingReport" @click="generateReport">
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

                <div class="experiment-code [margin-top:20px]" v-if="selectedExperiment.code">
                  <h3>实验代码</h3>
                  <pre class="code-display [background-color:#f5f7fa] [border-radius:4px] [padding:16px] [overflow-x:auto] [font-family:monospace] [line-height:1.5] [padding:15px] [font-family:'Courier_New',_monospace] [white-space:pre-wrap] [font-size:14px] [max-height:500px] [overflow-y:auto]"><code>{{ selectedExperiment.code }}</code></pre>
                </div>

                <div class="ai-comment [margin-top:20px]" v-if="selectedExperiment.aiComment">
                  <h3>AI点评</h3>
                  <div class="ai-content markdown-content [display:flex] [flex-direction:column] [gap:18px] [padding:10px_0] [padding:10px] [line-height:1.6]" v-html="renderMarkdown(selectedExperiment.aiComment)"></div>
                </div>

                <div class="report-actions [display:flex] [gap:10px] [margin-top:25px]">
<!--                  <ui-button type="primary" :loading="experimentStore.generatingReport"-->
<!--                             :disabled="experimentStore.generatingReport" @click="generateReport">-->
<!--                    <ui-icon>-->
<!--                      <Magic />-->
<!--                    </ui-icon>-->
<!--                    {{ selectedExperiment.report ? '重新生成报告' : '生成AI报告' }}-->
<!--                  </ui-button>-->

<!--                  <ui-button type="success" @click="viewReport" v-if="selectedExperiment.report">-->
<!--                    <ui-icon>-->
<!--                      <View />-->
<!--                    </ui-icon>-->
<!--                    查看报告-->
<!--                  </ui-button>-->
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

    <!-- 心得体会输入对话框-->
    <ui-dialog v-model="showExperienceDialog" title="填写实验信息" width="600px">
      <div class="experience-dialog-content [padding:10px]">

        <ui-form :model="experienceForm" label-width="100px">
          <ui-form-item label="实验机房名称">
            <ui-input v-model="labRoomName" placeholder="请输入实验机房名称，例如：计算机学院机房A101"></ui-input>
          </ui-form-item>

          <ui-form-item label="上机时间">
            <ui-date-picker v-model="labTime" type="datetime" placeholder="请选择上机时间" format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD" class="[width:100%]"></ui-date-picker>
          </ui-form-item>

          <ui-form-item label="实验心得体会">
            <ui-input v-model="experienceContent" type="textarea" :rows="8" placeholder="请在此输入您的实验心得体会.."
                      resize="none"></ui-input>
            <div class="experience-tips [display:flex] [align-items:center] [margin-top:8px] [color:#909399] [font-size:13px]">
              <ui-icon>
                <ChatLineRound />
              </ui-icon>
              <span>可以包括对实验过程的思考、遇到的困难及解决方法、对知识点的理解等内容</span>
            </div>
          </ui-form-item>
        </ui-form>
      </div>

      <template #footer>
        <span class="dialog-footer [display:flex] [justify-content:flex-end] [gap:10px]">
          <ui-button @click="cancelExperienceInput">取消</ui-button>
          <ui-button type="primary" @click="submitExperienceAndGenerateReport">提交并生成报告</ui-button>
        </span>
      </template>
    </ui-dialog>
  </div>
</template>

<script setup>
import { useExperimentStore, useUserStore } from '@/store'
import { computed, onMounted, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage, messageBox } from '@/services/feedback'
import {
  MagicStick, View, Download, Timer, Calendar, DocumentChecked, Warning,
  WarningFilled, Stopwatch, DataLine, Reading, Back, Select, ChatLineRound
} from '@/components/ui/icons'
import { DocxGenerator } from '../../utils/docxGenerator'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const experimentStore = useExperimentStore()
const userStore = useUserStore()

function renderMarkdown(text) {
  if (!text) return ''
  return DOMPurify.sanitize(marked(text))
}

const loading = ref(false)
const searchQuery = ref('')
const selectedExperiment = ref(null)
const isReportViewVisible = ref(false)
const reportData = ref({})


// 心得体会对话框相关变量
const showExperienceDialog = ref(false)
const experienceContent = ref('')
const tempUserData = ref(null) // 临时存储用户数据
const labRoomName = ref('') // 实验机房名称
const labTime = ref('') // 上机时间

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

// 获取正确的实验名称
const getCorrectExperimentName = (experiment, index) => {
  // 根据实验顺序和ID特征确定正确的实验名称

  // 方法1：基于实验在列表中的顺序（假设顺序固定）
  if (experimentStore.experimentList.length >= 3) {
    // 从experimentStore.experimentList中找出该实验的索引
    const actualIndex = experimentStore.experimentList.findIndex(exp => exp.id === experiment.id);
    if (actualIndex === 0) return '线性表的实现与应用';
    if (actualIndex === 1) return '栈与队列的实现与应用';
    if (actualIndex === 2) return '树与二叉树的实现与应用';
  }

  // 方法2：基于实验ID
  if (experiment.id) {
    const id = experiment.id.toString().toLowerCase();
    if (id.includes('stack') || id.includes('queue') || id.includes('stk')) {
      return '栈与队列的实现与应用';
    }
    if (id.includes('tree') || id.includes('bst') || id.includes('binary')) {
      return '树与二叉树的实现与应用';
    }
    if (id.includes('list') || id.includes('linear') || id.includes('array')) {
      return '线性表的实现与应用';
    }
  }

  // 方法3：基于代码内容（如果代码已加载）
  if (experiment.code) {
    const code = experiment.code.toLowerCase();
    if (code.includes('stack') || code.includes('queue') || code.includes('push') && code.includes('pop')) {
      return '栈与队列的实现与应用';
    }
    if (code.includes('tree') || code.includes('binary') || code.includes('left') && code.includes('right')) {
      return '树与二叉树的实现与应用';
    }
  }

  // 默认根据索引位置
  if (index === 0) return '线性表的实现与应用';
  if (index === 1) return '栈与队列的实现与应用';
  if (index === 2) return '树与二叉树的实现与应用';

  // 如果都无法确定，返回原始名称
  return experiment.name;
}

// 选择实验
const selectExperiment = (experiment) => {
  // 创建一个副本并修正实验名称
  const correctedExperiment = {...experiment};
  const index = experimentStore.experimentList.findIndex(exp => exp.id === experiment.id);
  correctedExperiment.name = getCorrectExperimentName(experiment, index);

  // 检查是否有缓存的报告
  const cachedReport = localStorage.getItem(`experiment_report_${experiment.id}`)
  if (cachedReport && experiment.status === 'completed') {
    correctedExperiment.report = cachedReport;
      logger.debug(`从缓存加载实验${experiment.id}的报告`);
  }

  // 从experimentCache中获取最新数据（如果有）
  if (experimentStore.experimentCache && experimentStore.experimentCache.has(experiment.id)) {
    const cachedData = experimentStore.experimentCache.get(experiment.id).data;
    if (cachedData && cachedData.report && experiment.status === 'completed') {
      logger.debug(`从experimentCache获取实验${experiment.id}的报告`);
      correctedExperiment.report = cachedData.report;
    }
  }

  // 检查实验特殊情况- 线性表实验(ID=1)应当有报告，其他实验可能没有
  if (experiment.id === 1 && experiment.status === 'completed' && !correctedExperiment.report) {
    // 为线性表实验生成默认报告
    logger.debug('线性表实验应当有报告，正在生成默认内容');
    const userData = {
      experimentName: correctedExperiment.name,
      studentName: userStore.userInfo?.name || '学生',
      studentId: userStore.userInfo?.id || '未知学号',
      className: userStore.userInfo?.class || '未知班级'
    };
    // 使用默认的线性表报告模板
    const reportTemplate = experimentStore.generateLinearListReport;
    correctedExperiment.report = reportTemplate(correctedExperiment.name, userData);

    // 保存到本地存储
    try {
      const report = correctedExperiment.report
      localStorage.setItem(`experiment_report_${experiment.id}`, correctedExperiment.report);
      const teacherCommentMatch = report.match(/##\s*教师评语[^\n]*\n+([\s\S]+?)(?=\n##|\s*$)/i)
      if (teacherCommentMatch) reportData.value.teacherComment = teacherCommentMatch[1].trim()
    } catch (e) {
      logger.error('保存报告到本地存储失败', e);
    }
  }

  selectedExperiment.value = correctedExperiment;
  isReportViewVisible.value = false;
}

// 生成报告
const generateReport = async () => {
  if (!selectedExperiment.value || selectedExperiment.value.status !== 'completed') {
    uiMessage.warning('请先完成实验')
    return
  }

  // 准备用户数据
  const userData = {
    studentName: userStore.userInfo?.name || '学生',
    studentId: userStore.userInfo?.id || '未知学号',
    className: userStore.userInfo?.class || '未知班级',
    experimentContent:'线性表基础操作，包括顺序表的初始化、插入、删除、查找和遍历实现',
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

  // 保存用户数据到临时变量
  tempUserData.value = userData

  // 打开心得体会输入对话框
  experienceContent.value = '' // 清空之前的输入
  showExperienceDialog.value = true
}

// 取消填写心得体会
const cancelExperienceInput = () => {
  messageBox.confirm('确定要取消填写心得体会吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '返回填写',
    type: 'warning'
  }).then(() => {
    showExperienceDialog.value = false
    tempUserData.value = null
    experienceContent.value = ''
  }).catch(() => {
  })
}

// 提交心得体会并生成报告
const submitExperienceAndGenerateReport = async () => {
  if (!experienceContent.value.trim()) {
    uiMessage.warning('请填写实验心得体会')
    return
  }

  if (!tempUserData.value) {
    uiMessage.error('数据异常，请重试')
    showExperienceDialog.value = false
    return
  }

  // 添加心得体会到用户数据
  tempUserData.value.experience = experienceContent.value
  tempUserData.value.labName = labRoomName.value
  tempUserData.value.labTime = labTime.value
  tempUserData.value.courseName = "数据结构"
  tempUserData.value.teacherName = "指导教师"
  tempUserData.value.summary = experienceContent.value

  // 关闭对话框
  showExperienceDialog.value = false

  try {
    loading.value = true
    logger.debug('生成实验报告，用户数据', tempUserData.value)

    // 调用AI生成报告
    const result = await experimentStore.generateAIReport(selectedExperiment.value.id, tempUserData.value)

    if (result.success) {
      // 更新当前选中的实验报告
      selectedExperiment.value.report = result.report

      // 更新experimentList中的报告
      const experimentIndex = experimentStore.experimentList.findIndex(exp => exp.id === selectedExperiment.value.id)
      if (experimentIndex !== -1) {
        experimentStore.experimentList[experimentIndex].report = result.report
      }

      // 保存报告到本地存储
      try {
        localStorage.setItem(`experiment_report_${selectedExperiment.value.id}`, result.report)
      } catch (e) {
        logger.error('保存报告到本地存储失败', e)
      }

      // 准备报告数据
      prepareReportData()

      uiMessage.success('AI报告生成成功！')
      isReportViewVisible.value = true
    } else {
      uiMessage.error(result.message || '生成报告失败1，请稍后重试')
      logger.error('生成报告失败:', result)
    }
  } catch (error) {
    uiMessage.error('生成报告失败2，请稍后再试')
    logger.error('生成报告异常:', error)
  } finally {
    loading.value = false
    tempUserData.value = null
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
  if (!selectedExperiment.value || !selectedExperiment.value.code) return
  const regex = /第\s*(\d+)\s*题如下([\s\S]*?)(?=第\s*\d+\s*题如下|$)/g
  const code = selectedExperiment.value.code
  const questions = []
  let match
  while ((match = regex.exec(code)) !== null) {
    const questionNumber = match[1]
    let questionCode = match[2].trim()
    // 提取测试结果表格（如果有）
    const testResultsRegex = /([\s\S]*?)((?:\|\s*测试点[\s\S]*?)+$)/
    const resultMatch = questionCode.match(testResultsRegex)
    let testResults = null
    if (resultMatch) {
      questionCode = resultMatch[1].trim()
      testResults = resultMatch[2].trim()
    }
    questions.push({
      number: parseInt(questionNumber),
      code: questionCode,
      testResults
    })
  }
  parsedQuestions.value = questions
  if (questions.length === 0 && code) {
    parsedQuestions.value = [{
      number: 1,
      code: code,
      testResults: null
    }]
  }
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
  reportData.value = {
    experimentName: selectedExperiment.value.name,
    studentName: userStore.userInfo?.name || '易星贵',
    studentId: userStore.userInfo?.username || '2019443672',
    className: userStore.userInfo?.class || '计算机科学班',
    courseName: '数据结构',
    steps: '', // 由updateReportWithCode生成
    results: '', // 由updateReportWithResults生成
    submitTime: selectedExperiment.value.submitTime,
    deadline: selectedExperiment.value.deadline,
    plagiarismRate: selectedExperiment.value.plagiarismRate,
    labName: labRoomName.value || 'I301',
    labTime: labTime.value || new Date().toLocaleDateString(),
    teacherName: '张老师',
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

// 处理报告保存
// const handleReportSaved = (savedData) => {
//   // 更新本地报告内容
//   if (selectedExperiment.value && selectedExperiment.value.id) {
//     try {
//       // 将ReportGenerator组件中的结构化数据转换为Markdown格式
//       const markdownReport = generateMarkdownFromData(savedData)
//
//       // 更新当前选中的实验报告
//       selectedExperiment.value.report = markdownReport
//
//       // 更新experimentList中的报告
//       const experimentIndex = experimentStore.experimentList.findIndex(exp => exp.id === selectedExperiment.value.id)
//       if (experimentIndex !== -1) {
//         experimentStore.experimentList[experimentIndex].report = markdownReport
//       }
//
//       // 保存报告到本地存储
//       localStorage.setItem(`experiment_report_${selectedExperiment.value.id}`, markdownReport)
//
//       logger.debug('报告已保存并更新')
//     } catch (e) {
//       logger.error('保存报告时出错', e)
//     }
//   }
// }

// 将结构化数据转换为Markdown格式
// // 下载报告
// const downloadReport = async () => {
//   if (!selectedExperiment.value || !selectedExperiment.value.report) {
//     uiMessage.warning('没有找到报告内容')
//     return
//   }

//   // 显示格式选择对话框
//   messageBox.confirm(
//     '请选择导出格式',
//     '导出报告',
//     {
//       confirmButtonText: 'Word格式',
//       cancelButtonText: 'Markdown格式',
//       distinguishCancelAndClose: true,
//       type: 'info'
//     }
//   ).then(async () => {
//     // 导出Word格式
//     try {
//       // 首先确保reportData已准备好
//       if (Object.keys(reportData.value).length === 0) {
//         prepareReportData()
//       }

//       const docxGenerator = new DocxGenerator()
//       const blob = await docxGenerator.generateStandardReport(reportData.value)

//       DocxGenerator.downloadReport(blob, `${selectedExperiment.value.name}-实验报告.docx`)
//       uiMessage.success('报告下载成功')
//     } catch (error) {
//       logger.error('生成Word报告失败:', error)
//       uiMessage.error('生成Word报告失败，请稍后再试')
//     }
//   }).catch(action => {
//     if (action === 'cancel') {
//       // 导出Markdown格式
//       const blob = new Blob([selectedExperiment.value.report], { type: 'text/markdown' })
//       const link = document.createElement('a')
//       link.href = URL.createObjectURL(blob)
//       link.download = `${selectedExperiment.value.name}-实验报告.md`
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//       uiMessage.success('报告下载成功')
//     }
//   })
// }


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
  try {
    const docxGenerator = new DocxGenerator()
    const blob = await docxGenerator.generateStandardReport(reportData.value)

    DocxGenerator.downloadReport(blob, `${userStore.userInfo.id || "学号"}_${userStore.userInfo.name || "姓名"}_${selectedExperiment.value.name || '数据结构实验'}.docx`)
    uiMessage.success('报告生成成功！')
  } catch (error) {
    logger.error('生成报告时发生错误', error)
    uiMessage.error('报告生成失败，请稍后重试！')
  }
}
</script>


