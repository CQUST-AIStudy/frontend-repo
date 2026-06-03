<template>
  <div class="leetcode-practice [display:flex] [height:calc(100vh_-_120px)] [gap:16px] [padding:16px] max-[1200px]:[flex-direction:column] max-[1200px]:[height:auto]">
    <!-- 题目详情区域 -->
    <div class="problem-section [flex:1] [background:white] [border-radius:8px] [padding:20px] [overflow-y:auto] [box-shadow:0_2px_8px_rgba(0,_0,_0,_0.1)] max-[1200px]:[flex:none]">
      <div class="problem-header [display:flex] [justify-content:space-between] [align-items:flex-start] [margin-bottom:20px] [padding-bottom:16px] [border-bottom:1px_solid_#eee]">
        <div class="problem-title [&_h2]:[margin:0_0_8px_0] [&_h2]:[color:#333] [&_h2]:[font-size:24px]">
          <h2>{{ problem.problemCode }} {{ problem.title }}</h2>
          <ui-tag :type="difficultyType" size="large">{{ problem.difficulty }}</ui-tag>
        </div>
        <div class="problem-actions [display:flex] [gap:8px]">
          <ui-button @click="showSolution = !showSolution" type="info" plain>
            {{ showSolution ? '隐藏题解' : '查看题解' }}
          </ui-button>
          <ui-button @click="resetCode" type="warning" plain>重置代码</ui-button>
        </div>
      </div>

      <!-- 题目内容 -->
      <div class="problem-content [line-height:1.6]">
        <div class="problem-description [font-size:14px] [color:#555] [&_pre]:[background:#f5f5f5] [&_pre]:[padding:12px] [&_pre]:[border-radius:4px] [&_pre]:[overflow-x:auto] [&_code]:[background:#f0f0f0] [&_code]:[padding:2px_4px] [&_code]:[border-radius:2px] [&_code]:[font-family:'Courier_New',_monospace]">
          <div class="content-section [margin-bottom:24px] [&_h3]:[color:#333] [&_h3]:[font-size:18px] [&_h3]:[margin-bottom:12px] [&_h3]:[padding-bottom:8px] [&_h3]:[border-bottom:2px_solid_#409eff] [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]">
            <h3>题目描述</h3>
            <div class="formatted-content [font-size:14px] [color:#555] [background:#fafafa] [padding:16px] [border-radius:8px] [border-left:4px_solid_#409eff] [max-height:340px] [overflow:auto]" v-html="renderedProblemText"></div>
          </div>
          
          <div class="content-section [margin-bottom:24px] [&_h3]:[color:#333] [&_h3]:[font-size:18px] [&_h3]:[margin-bottom:12px] [&_h3]:[padding-bottom:8px] [&_h3]:[border-bottom:2px_solid_#409eff] [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]" v-if="problem.examples">
            <h3>示例</h3>
            <div class="examples-container [background:#f8f9fa] [padding:16px] [border-radius:8px]">
              <div 
                v-for="(example, index) in parsedExamples" 
                :key="index" 
                class="example-item [margin-bottom:16px] [padding:12px] [background:white] [border-radius:6px] [border:1px_solid_#e0e0e0] [&:last-child]:[margin-bottom:0] [&_h4]:[margin:0_0_8px_0] [&_h4]:[color:#409eff] [&_h4]:[font-size:14px] [background-color:#f5f7fa] [padding:10px] [border-radius:4px]"
              >
                <h4>示例 {{ index + 1 }}:</h4>
                <div class="example-content [font-family:'Courier_New',_monospace] [font-size:13px] [background-color:#f2f6fc] [padding:12px] [border-radius:4px] [font-family:'Courier_New',_Courier,_monospace] [overflow-x:auto] [margin:0] [white-space:pre-wrap] [word-wrap:break-word] [color:#5a5a5a]">
                  <div class="example-input [margin-bottom:4px] [&_code]:[background:#f0f0f0] [&_code]:[padding:2px_6px] [&_code]:[border-radius:3px] [&_code]:[color:#e74c3c]">
                    <strong>输入:</strong> <code>{{ example.input }}</code>
                  </div>
                  <div class="example-output [margin-bottom:4px] [&_code]:[background:#f0f0f0] [&_code]:[padding:2px_6px] [&_code]:[border-radius:3px] [&_code]:[color:#e74c3c]">
                    <strong>输出:</strong> <code>{{ example.output }}</code>
                  </div>
                  <div v-if="example.explanation" class="example-explanation [margin-top:8px] [font-family:-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_sans-serif] [color:#666] [font-style:italic]">
                    <strong>解释:</strong> {{ example.explanation }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="content-section [margin-bottom:24px] [&_h3]:[color:#333] [&_h3]:[font-size:18px] [&_h3]:[margin-bottom:12px] [&_h3]:[padding-bottom:8px] [&_h3]:[border-bottom:2px_solid_#409eff] [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]" v-if="problem.constraints">
            <h3>提示</h3>
            <div class="constraints-content [background:#fff3cd] [padding:12px] [border-radius:6px] [border-left:4px_solid_#ffc107] [font-size:13px]" v-html="renderedConstraints"></div>
          </div>
        </div>
      </div>

      <!-- 官方题解 -->
      <ui-collapse v-if="showSolution" class="solution-section [margin-top:20px]">
        <ui-collapse-item name="solution">
          <template #title>
            <div class="solution-title [display:flex] [align-items:center] [gap:8px] [font-weight:600] [color:#409eff]">
              <ui-icon><Document /></ui-icon>
              <span>官方题解</span>
            </div>
          </template>
          <div class="solution-content [max-height:none] [overflow:visible] [max-height:400px] [overflow-y:auto]">
            <div class="solution-approach" v-if="parsedSolution.approach">
              <h4>解题思路</h4>
              <div class="approach-content [background:#f8f9fa] [padding:16px] [border-radius:8px] [margin-bottom:16px]" v-html="parsedSolution.approach"></div>
            </div>
            
            <div class="solution-code" v-if="parsedSolution.code">
              <h4>参考代码</h4>
              <ui-tabs v-model="solutionLanguage" class="solution-tabs [margin-top:8px]">
                <ui-tab-pane 
                  v-for="(codeBlock, lang) in parsedSolution.code" 
                  :key="lang"
                  :label="getLanguageLabel(lang)" 
                  :name="lang"
                >
                  <pre class="solution-code-block [background:#2d3748] [color:#e2e8f0] [padding:16px] [border-radius:8px] [overflow-x:auto] [font-family:'Courier_New',_monospace] [font-size:14px] [line-height:1.5] [margin:0]"><code>{{ codeBlock }}</code></pre>
                </ui-tab-pane>
              </ui-tabs>
            </div>

            <div class="solution-complexity" v-if="parsedSolution.complexity">
              <h4>复杂度分析</h4>
              <div class="complexity-content [background:#e8f5e8] [padding:12px] [border-radius:6px] [border-left:4px_solid_#28a745]" v-html="parsedSolution.complexity"></div>
            </div>
          </div>
        </ui-collapse-item>
      </ui-collapse>
    </div>

    <!-- 代码编辑区域 -->
    <div class="code-section [flex:1] [background:white] [border-radius:8px] [padding:20px] [display:flex] [flex-direction:column] [box-shadow:0_2px_8px_rgba(0,_0,_0,_0.1)]">
      <div class="code-header [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:16px] [padding-bottom:12px] [border-bottom:1px_solid_#eee] [margin-bottom:15px] [padding-right:10px]">
        <div class="language-selector">
          <ui-select v-model="selectedLanguage" @change="onLanguageChange">
            <ui-option label="Java" value="java" />
            <ui-option label="Python" value="python" />
            <ui-option label="C" value="c" />
            <ui-option label="C++" value="cpp" />
            <ui-option label="JavaScript" value="javascript" />
          </ui-select>
        </div>
        <div class="code-actions [display:flex] [gap:8px] [flex-wrap:wrap]">
          <ui-button @click="runCode" :loading="running" type="primary" plain>
            运行代码
          </ui-button>
          <ui-button @click="submitCode" :loading="submitting" type="success">
            提交解答
          </ui-button>
        </div>
      </div>

      <!-- 代码编辑器 -->
      <div class="code-editor [flex:1] [border:1px_solid_#ddd] [border-radius:4px] [overflow:hidden] [cursor:text]" @click="focusEditor">
        <codemirror
          ref="editorRef"
          v-model="code"
          :extensions="editorExtensions"
          :autofocus="false"
          :tab-size="4"
          class="[height:100%]"
          @ready="onEditorReady"
        />
      </div>

      <!-- 测试用例输入 -->
      <div class="test-input [margin-top:16px] [height:200px]">
        <ui-tabs v-model="activeTab">
          <ui-tab-pane label="测试用例" name="testcase">
            <ui-input
              v-model="testInput"
              type="textarea"
              :rows="4"
              placeholder="输入测试用例，每行一个..."
            />
          </ui-tab-pane>
          <ui-tab-pane label="运行结果" name="result" v-if="runResult">
            <div class="run-result [padding:12px]">
              <div class="result-status [display:flex] [align-items:center] [gap:8px] [margin-bottom:12px] [font-weight:bold] [&.success]:[color:#67c23a] [&.error]:[color:#f56c6c]" :class="runResult.status">
                <ui-icon><Check v-if="runResult.status === 'success'" /><Close v-else /></ui-icon>
                {{ runResult.status === 'success' ? '运行成功' : '运行失败' }}
              </div>
              <div class="result-content">
                <pre>{{ runResult.output }}</pre>
              </div>
            </div>
          </ui-tab-pane>
        </ui-tabs>
      </div>
    </div>

    <!-- 提交结果弹窗 -->
    <ui-dialog
      v-model="showSubmitResult"
      title="提交结果"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="submitResult" class="submit-result [max-height:70vh] [overflow-y:auto]">
        <div class="result-header [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:20px] [padding:16px] [background:#f8f9fa] [border-radius:8px] [margin-bottom:10px]">
          <div class="status [display:flex] [align-items:center] [gap:8px] [font-size:18px] [font-weight:bold] [&.accepted]:[color:#67c23a] [&.rejected]:[color:#f56c6c]" :class="submitResult.status">
            <ui-icon><Check v-if="submitResult.accepted" /><Close v-else /></ui-icon>
            {{ submitResult.status === 'unavailable' ? '评测暂不可用' : (submitResult.accepted ? '通过' : '未通过') }}
          </div>
          <div class="score [font-size:16px] [font-weight:bold] [color:#f56c6c] [color:#409eff] [font-weight:700]" v-if="submitResult.score !== null && submitResult.score !== undefined">
            得分: {{ submitResult.score }}/100
          </div>
        </div>

        <!-- AI评测结果 -->
        <div class="ai-feedback [margin:20px_0]" v-if="submitResult.aiFeedback">
          <h3>AI 评测反馈</h3>
          <div class="feedback-content [font-size:14px] [line-height:1.9] [color:#202124] [background:#e6f4ea] [padding:20px_24px] [border-radius:12px] [border-left:4px_solid_#1e8e3e] [background:#f8f9fa] [padding:16px] [border-radius:8px] [border-left:4px_solid_#409eff]" v-html="renderedAiFeedback"></div>
        </div>

        <!-- 执行详情 -->
        <div class="execution-details [margin:20px_0]" v-if="submitResult.details">
          <ui-descriptions title="执行详情" :column="2" border>
            <ui-descriptions-item label="执行时间">
              {{ submitResult.details.runtime || '暂无' }}
            </ui-descriptions-item>
            <ui-descriptions-item label="内存消耗">
              {{ submitResult.details.memory || '暂无' }}
            </ui-descriptions-item>
            <ui-descriptions-item label="通过用例">
              {{ submitResult.details.passedCases || 0 }} / {{ submitResult.details.totalCases || 0 }}
            </ui-descriptions-item>
            <ui-descriptions-item label="错误信息" v-if="submitResult.details.error">
              <pre class="error-message [color:#f56c6c] [background:#fef0f0] [padding:8px] [border-radius:4px] [margin:0] [color:#d93025] [font-size:12px]">{{ submitResult.details.error }}</pre>
            </ui-descriptions-item>
          </ui-descriptions>
        </div>

        <!-- 技能提升建议 -->
        <div class="skill-suggestions [margin:20px_0]" v-if="submitResult.skillSuggestions">
          <h3>技能提升建议</h3>
          <ui-tag
            v-for="suggestion in submitResult.skillSuggestions"
            :key="suggestion"
            class="suggestion-tag [margin:4px_8px_4px_0]"
            type="info"
          >
            {{ suggestion }}
          </ui-tag>
        </div>
      </div>

      <template #footer>
        <ui-button @click="showSubmitResult = false">关闭</ui-button>
        <ui-button type="primary" @click="continuePractice">继续练习</ui-button>
      </template>
    </ui-dialog>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage, messageBox } from '@/services/feedback'
import { Check, Close, Document } from '@/components/ui/icons'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import api from '@/api'
import { getCurrentStudentId as readCurrentStudentId } from '../../constants/auth'
import {
  readWeaknessTrainingState,
  recordWeaknessTrainingReview,
  writeWeaknessTrainingState
} from '../../utils/weaknessTraining'

const route = useRoute()
const router = useRouter()
marked.setOptions({ gfm: true, breaks: true })

const COMPLETED_STORAGE_KEY = 'leetcode_completed_problem_ids'

// 响应式数据
const problem = ref({})
const selectedLanguage = ref('java')
const code = ref('')
const testInput = ref('')
const showSolution = ref(false)
const running = ref(false)
const submitting = ref(false)
const runResult = ref(null)
const submitResult = ref(null)
const showSubmitResult = ref(false)
const activeTab = ref('testcase')
const editorRef = ref(null)
const editorInstance = ref(null)
const solutionLanguage = ref('java')

// 代码模板
const codeTemplates = {
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 请在这里编写你的代码
        
    }
}`,
  python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # 请在这里编写你的代码
        pass`,
  c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // write your code here
    *returnSize = 0;
    return NULL;
}`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // 请在这里编写你的代码
        
    }
};`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // 请在这里编写你的代码
    
};`
}

// 编辑器配置
const editorExtensions = computed(() => ([
  getLanguageExtension(),
  oneDark,
  EditorView.lineWrapping
]))

// 计算属性
const difficultyType = computed(() => {
  const difficulty = problem.value.difficulty?.toLowerCase()
  switch (difficulty) {
    case 'easy': return 'success'
    case 'medium': return 'warning'
    case 'hard': return 'danger'
    default: return 'info'
  }
})

const renderedProblemText = computed(() => {
  if (!problem.value.problemText) return ''
  return DOMPurify.sanitize(marked(problem.value.problemText))
})

const renderedAiFeedback = computed(() => {
  if (!submitResult.value?.aiFeedback) return ''
  return DOMPurify.sanitize(marked(submitResult.value.aiFeedback))
})

const parsedExamples = computed(() => {
  if (!problem.value.examples) return []
  try {
    return JSON.parse(problem.value.examples)
  } catch {
    return []
  }
})

const renderedConstraints = computed(() => {
  if (!problem.value.constraints) return ''
  return DOMPurify.sanitize(marked(problem.value.constraints))
})

const parsedSolution = computed(() => {
  if (!problem.value.solutionText) return {}
  
  try {
    // 尝试解析结构化题解
    const solution = JSON.parse(problem.value.solutionText)
    return solution
  } catch {
    // 如果不是 JSON 格式，则按 markdown 处理
    const text = problem.value.solutionText
    return {
      approach: DOMPurify.sanitize(marked(text))
    }
  }
})

// 方法
function getLanguageExtension() {
  switch (selectedLanguage.value) {
    case 'java': return java()
    case 'python': return python()
    case 'c': return cpp()
    case 'cpp': return cpp()
    case 'javascript': return javascript()
    default: return javascript()
  }
}

function onLanguageChange() {
  code.value = codeTemplates[selectedLanguage.value] || ''
}

function onEditorReady(payload) {
  editorInstance.value = payload?.view || payload || null
  nextTick(() => {
    if (editorInstance.value?.focus) {
      editorInstance.value.focus()
    }
  })
}

function focusEditor() {
  if (editorInstance.value?.focus) {
    editorInstance.value.focus()
  }
}

function getCurrentStudentId() {
  return readCurrentStudentId()
}

function getLanguageLabel(lang) {
  const labels = {
    java: 'Java',
    python: 'Python',
    cpp: 'C++',
    javascript: 'JavaScript',
    c: 'C'
  }
  return labels[lang] || lang.toUpperCase()
}

function resetCode() {
  messageBox.confirm('确定要重置代码吗？未保存的修改将会丢失。', '重置代码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    code.value = codeTemplates[selectedLanguage.value] || ''
    uiMessage.success('代码已重置')
  }).catch(() => {})
}

async function runCode() {
  if (!code.value.trim()) {
    uiMessage.warning('请先编写代码')
    return
  }

  running.value = true
  try {
    const response = await api.runLeetCodeSolution({
      problemId: problem.value.id,
      code: code.value,
      language: selectedLanguage.value,
      testInput: testInput.value
    })

    if (response.success) {
      runResult.value = response.data
      activeTab.value = 'result'

      if (response.data.status === 'success') {
        uiMessage.success('代码运行成功')
      } else {
        uiMessage.error('代码运行失败')
      }
    } else {
      uiMessage.error('运行失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    logger.error('运行代码失败:', error)
    let errorMessage = '运行代码失败'
    
    if (error.response) {
      errorMessage += ': ' + (error.response.data?.message || error.response.statusText)
    } else if (error.message) {
      errorMessage += ': ' + error.message
    }
    
    uiMessage.error(errorMessage)
  } finally {
    running.value = false
  }
}

async function submitCode() {
  if (!code.value.trim()) {
    uiMessage.warning('请先编写代码')
    return
  }

  submitting.value = true
  try {
    const studentId = getCurrentStudentId()
    const response = await api.submitLeetCodeSolution({
      problemId: problem.value.id,
      code: code.value,
      language: selectedLanguage.value,
      studentId,
      recommendationRequestId: getRecommendationRequestId(),
      recommendationSessionId: getRecommendationSessionId()
    })

    if (response.success) {
      submitResult.value = response.data
      showSubmitResult.value = true
      recordTrainingReview(!!response.data.accepted)

      if (response.data.status === 'unavailable') {
        uiMessage.warning('AI 评测暂不可用，已显示备用评测结果。')
      } else if (response.data.accepted) {
        markProblemCompleted(problem.value.id)
        uiMessage.success('答案通过')
      } else {
        uiMessage.error('答案未通过，请查看详细反馈')
      }
    } else {
      uiMessage.error('提交失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    logger.error('提交代码失败:', error)
    let errorMessage = '提交代码失败'
    
    if (error.response) {
      // 服务器返回错误
      errorMessage += ': ' + (error.response.data?.message || error.response.statusText)
    } else if (error.message) {
      errorMessage += ': ' + error.message
    }
    
    uiMessage.error(errorMessage)
  } finally {
    submitting.value = false
  }
}

function continuePractice() {
  showSubmitResult.value = false
  router.push('/student/practice')
}

async function loadProblem() {
  const problemId = route.params.id
  if (!problemId) {
    uiMessage.error('题目ID不存在')
    router.push('/student/practice')
    return
  }

  try {
    const response = await api.getLeetCodeProblem(problemId)
    if (!response?.success || !response.data) {
      throw new Error(response?.message || '题目数据为空')
    }
    problem.value = response.data
    
    // 设置默认代码模板
    code.value = codeTemplates[selectedLanguage.value] || ''
    
    // 设置默认测试用例
    if (problem.value.sampleTestCases) {
      testInput.value = problem.value.sampleTestCases.join('\n')
    }
  } catch (error) {
    logger.error('加载题目失败:', error)
    uiMessage.error('加载题目失败')
    router.push('/student/practice')
  }
}

function getRecommendationRequestId() {
  const value = route.query.recommendationRequestId
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getRecommendationSessionId() {
  const value = route.query.recommendationSessionId
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getTrainingExperimentId() {
  const value = Number(route.query.trainingExperimentId)
  return Number.isFinite(value) ? value : null
}

function getTrainingDimension() {
  const value = route.query.trainingDimension
  return typeof value === 'string' ? value : ''
}

function getTrainingSource() {
  const value = route.query.trainingSource
  return typeof value === 'string' && value.trim() ? value.trim() : 'weakness_training'
}

function recordTrainingReview(accepted) {
  const experimentId = getTrainingExperimentId()
  const problemId = Number(problem.value?.id)
  const studentId = getCurrentStudentId()

  if (!experimentId || !Number.isFinite(problemId) || !studentId) return

  const nextState = recordWeaknessTrainingReview(readWeaknessTrainingState(studentId), {
    experimentId,
    problemId,
    problemTitle: problem.value?.title || `题目 ${problemId}`,
    dimension: getTrainingDimension(),
    accepted,
    source: getTrainingSource()
  })
  writeWeaknessTrainingState(nextState, studentId)
}

function markProblemCompleted(problemId) {
  const parsed = Number(problemId)
  if (!Number.isFinite(parsed)) return

  try {
    const raw = sessionStorage.getItem(COMPLETED_STORAGE_KEY)
    const existing = raw ? JSON.parse(raw) : []
    const normalized = Array.isArray(existing)
      ? existing.map(item => Number(item)).filter(Number.isFinite)
      : []

    if (!normalized.includes(parsed)) {
      normalized.push(parsed)
      sessionStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(normalized))
    }
  } catch (error) {
    logger.warn('保存完成题目记录失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadProblem()
})

watch(() => route.params.id, () => {
  loadProblem()
})
</script>



