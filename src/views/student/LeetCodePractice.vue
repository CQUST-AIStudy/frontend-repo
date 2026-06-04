<template>
  <div class="leetcode-practice [display:flex] [height:calc(100vh_-_120px)] [gap:16px] [padding:16px] max-[1200px]:[flex-direction:column] max-[1200px]:[height:auto]">
    <!-- 题目详情区域 -->
    <div class="problem-section [flex:1] [background:white] [border-radius:8px] [padding:20px] [overflow-y:auto] [display:flex] [flex-direction:column] [min-height:0] [box-shadow:0_2px_8px_rgba(0,_0,_0,_0.1)] max-[1200px]:[flex:none]">
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
      <div v-if="!showSolution" class="problem-content [line-height:1.7] [flex:1] [min-height:0]">
        <div class="problem-description [height:100%] [font-size:14px] [color:#555] [&_pre]:[background:#f5f5f5] [&_pre]:[padding:12px] [&_pre]:[border-radius:4px] [&_pre]:[overflow-x:auto] [&_code]:[background:#f0f0f0] [&_code]:[padding:2px_4px] [&_code]:[border-radius:2px] [&_code]:[font-family:'Courier_New',_monospace]">
          <div class="content-section [margin-bottom:0] [&_h3]:[color:#1f2937] [&_h3]:[font-size:18px] [&_h3]:[margin:0_0_16px_0] [&_h3]:[padding-bottom:10px] [&_h3]:[border-bottom:2px_solid_#409eff] [border:1px_solid_#e5e7eb] [border-radius:8px] [padding:20px_24px] [min-height:100%] [background:#fff]">
            <h3>题目描述</h3>
            <div class="formatted-content [font-size:15px] [line-height:1.85] [color:#374151] [background:#f8fafc] [padding:18px_20px] [border-radius:8px] [border-left:4px_solid_#409eff] [overflow:visible]" v-html="renderedProblemText"></div>
          </div>
          
          <div class="content-section [margin-bottom:24px] [&_h3]:[color:#333] [&_h3]:[font-size:18px] [&_h3]:[margin-bottom:12px] [&_h3]:[padding-bottom:8px] [&_h3]:[border-bottom:2px_solid_#409eff] [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]" v-if="showSeparateExamples">
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
        <div v-if="showSolution" class="solution-view [flex:1] [min-height:0] [font-size:14px] [color:#374151] [&_pre]:[background:#1f2937] [&_pre]:[color:#e5e7eb] [&_pre]:[padding:16px] [&_pre]:[border-radius:8px] [&_pre]:[overflow-x:auto] [&_code]:[font-family:'Courier_New',_monospace]">
          <div class="content-section [margin-bottom:0] [&_h3]:[color:#1f2937] [&_h3]:[font-size:18px] [&_h3]:[margin:0_0_16px_0] [&_h3]:[padding-bottom:10px] [&_h3]:[border-bottom:2px_solid_#409eff] [border:1px_solid_#e5e7eb] [border-radius:8px] [padding:20px_24px] [min-height:100%] [background:#fff]">
            <h3>&#23448;&#26041;&#39064;&#35299;</h3>
            <ui-empty v-if="!hasSolutionContent" description="&#26242;&#26080;&#39064;&#35299;&#20869;&#23481;" :image-size="96" />
            <div v-else class="solution-blocks [display:flex] [flex-direction:column] [gap:16px]">
              <section v-if="renderedSolutionApproach" class="solution-card [background:#f8fafc] [border-left:4px_solid_#409eff] [border-radius:8px] [padding:18px_20px]">
                <h4 class="[margin:0_0_12px_0] [font-size:16px] [color:#111827]">&#35299;&#39064;&#24605;&#36335;</h4>
                <div class="solution-markdown [line-height:1.85]" v-html="renderedSolutionApproach"></div>
              </section>
              <section v-if="renderedSolutionComplexity" class="solution-card [background:#f0fdf4] [border-left:4px_solid_#22c55e] [border-radius:8px] [padding:18px_20px]">
                <h4 class="[margin:0_0_12px_0] [font-size:16px] [color:#111827]">&#22797;&#26434;&#24230;&#20998;&#26512;</h4>
                <div class="solution-markdown [line-height:1.85]" v-html="renderedSolutionComplexity"></div>
              </section>
              <section v-if="Object.keys(solutionCodeBlocks).length" class="solution-card [background:#f8fafc] [border:1px_solid_#e5e7eb] [border-radius:8px] [padding:18px_20px]">
                <h4 class="[margin:0_0_12px_0] [font-size:16px] [color:#111827]">&#21442;&#32771;&#20195;&#30721;</h4>
                <ui-tabs v-model="solutionLanguage" class="solution-tabs [margin-top:8px]">
                  <ui-tab-pane
                    v-for="(codeBlock, lang) in solutionCodeBlocks"
                    :key="lang"
                    :label="getLanguageLabel(lang)"
                    :name="lang"
                  >
                    <pre class="solution-code-block [background:#1f2937] [color:#e5e7eb] [padding:16px] [border-radius:8px] [overflow-x:auto] [font-family:'Courier_New',_monospace] [font-size:14px] [line-height:1.6] [margin:0]"><code>{{ codeBlock }}</code></pre>
                  </ui-tab-pane>
                </ui-tabs>
              </section>
            </div>
          </div>
        </div>
        <!-- legacy-solution-view-disabled
        <div v-if="false" class="solution-view [flex:1] [min-height:0] [font-size:14px] [color:#374151] [&_pre]:[background:#1f2937] [&_pre]:[color:#e5e7eb] [&_pre]:[padding:16px] [&_pre]:[border-radius:8px] [&_pre]:[overflow-x:auto] [&_code]:[font-family:'Courier_New',_monospace]">
          <div class="content-section [margin-bottom:0] [&_h3]:[color:#1f2937] [&_h3]:[font-size:18px] [&_h3]:[margin:0_0_16px_0] [&_h3]:[padding-bottom:10px] [&_h3]:[border-bottom:2px_solid_#409eff] [border:1px_solid_#e5e7eb] [border-radius:8px] [padding:20px_24px] [min-height:100%] [background:#fff]">
            <h3>瀹樻柟棰樿В</h3>
            <ui-empty v-if="!hasSolutionContent" description="鏆傛棤棰樿В鍐呭" :image-size="96" />
            <div v-else class="solution-blocks [display:flex] [flex-direction:column] [gap:16px]">
              <section v-if="renderedSolutionApproach" class="solution-card [background:#f8fafc] [border-left:4px_solid_#409eff] [border-radius:8px] [padding:18px_20px]">
                <h4 class="[margin:0_0_12px_0] [font-size:16px] [color:#111827]">瑙ｉ鎬濊矾</h4>
                <div class="solution-markdown [line-height:1.85]" v-html="renderedSolutionApproach"></div>
              </section>
              <section v-if="renderedSolutionComplexity" class="solution-card [background:#f0fdf4] [border-left:4px_solid_#22c55e] [border-radius:8px] [padding:18px_20px]">
                <h4 class="[margin:0_0_12px_0] [font-size:16px] [color:#111827]">澶嶆潅搴﹀垎鏋?/h4>
                <div class="solution-markdown [line-height:1.85]" v-html="renderedSolutionComplexity"></div>
              </section>
              <section v-if="Object.keys(solutionCodeBlocks).length" class="solution-card [background:#f8fafc] [border:1px_solid_#e5e7eb] [border-radius:8px] [padding:18px_20px]">
                <h4 class="[margin:0_0_12px_0] [font-size:16px] [color:#111827]">鍙傝€冧唬鐮?/h4>
                <ui-tabs v-model="solutionLanguage" class="solution-tabs [margin-top:8px]">
                  <ui-tab-pane
                    v-for="(codeBlock, lang) in solutionCodeBlocks"
                    :key="lang"
                    :label="getLanguageLabel(lang)"
                    :name="lang"
                  >
                    <pre class="solution-code-block [background:#1f2937] [color:#e5e7eb] [padding:16px] [border-radius:8px] [overflow-x:auto] [font-family:'Courier_New',_monospace] [font-size:14px] [line-height:1.6] [margin:0]"><code>{{ codeBlock }}</code></pre>
                  </ui-tab-pane>
                </ui-tabs>
              </section>
            </div>
          </div>
        </div>
        -->
      <ui-collapse v-if="false" class="solution-section [margin-top:20px]">
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
      <div v-if="runResult" class="test-input [margin-top:16px] [height:200px]">
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
import { persistClawProblemBySlug } from '../../api/leetcodeClaw'
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
    // 当前题目暂无 Java 初始化代码模板。
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

const starterLanguagePriority = ['cpp', 'c', 'java', 'python', 'javascript']

const missingStarterCodeTemplates = {
  java: `class Solution {
    // 当前题目暂无 Java 初始化代码模板。
    // 请重新通过 LeetCode 拓展入口加入练习，或切换到已有模板的语言。
}`,
  python: `class Solution:
    # 当前题目暂无 Python 初始化代码模板。
    # 请重新通过 LeetCode 拓展入口加入练习，或切换到已有模板的语言。
    pass`,
  c: `// 当前题目暂无 C 初始化代码模板。
// 请重新通过 LeetCode 拓展入口加入练习，或切换到已有模板的语言。`,
  cpp: `class Solution {
public:
    // 当前题目暂无 C++ 初始化代码模板。
    // 请重新通过 LeetCode 拓展入口加入练习，或切换到已有模板的语言。
};`,
  javascript: `// 当前题目暂无 JavaScript 初始化代码模板。
// 请重新通过 LeetCode 拓展入口加入练习，或切换到已有模板的语言。`
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

const showSeparateExamples = computed(() => false)

const renderedProblemText = computed(() => {
  return renderMarkdown(problem.value.problemText)
})

const renderedAiFeedback = computed(() => {
  return renderMarkdown(submitResult.value?.aiFeedback)
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
  return renderMarkdown(problem.value.constraints)
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
      approach: text
    }
  }
})

// 方法
const renderedSolutionApproach = computed(() => {
  const content = parsedSolution.value.approach ||
    parsedSolution.value.explanation ||
    parsedSolution.value.content ||
    ''
  return renderMarkdown(content)
})

const renderedSolutionComplexity = computed(() => {
  return renderMarkdown(parsedSolution.value.complexity || '')
})

const solutionCodeBlocks = computed(() => {
  return normalizeSolutionCodeBlocks(parsedSolution.value.code)
})

const hasSolutionContent = computed(() => {
  return !!renderedSolutionApproach.value ||
    !!renderedSolutionComplexity.value ||
    Object.keys(solutionCodeBlocks.value).length > 0
})

function renderMarkdown(content) {
  const text = normalizeLeetCodeMarkdown(content)
  if (!text) return ''
  return DOMPurify.sanitize(decorateCodeBlocks(marked(renderMathExpressions(text))))
}

function normalizeLeetCodeMarkdown(content) {
  const text = String(content || '').replace(/\r\n?/g, '\n').trim()
  if (!text) return ''
  return stripBrokenMarkdownMarkers(repairNestedCodeFences(text)).trim()
}

function repairNestedCodeFences(text) {
  const lines = String(text || '').split('\n')
  const output = []
  let inFence = false

  lines.forEach((line) => {
    const fence = getMarkdownFence(line)
    const isHeading = /^#{2,6}\s+\S/.test(line)

    if (inFence && isHeading) {
      output.push('```')
      inFence = false
    }

    if (!fence) {
      output.push(line)
      return
    }

    const normalizedFence = normalizeMarkdownFenceLine(fence)
    if (!inFence) {
      output.push(normalizedFence)
      inFence = true
      return
    }

    if (fence.info) {
      output.push('```')
      output.push(normalizedFence)
      inFence = true
      return
    }

    output.push('```')
    inFence = false
  })

  if (inFence) {
    output.push('```')
  }

  return output.join('\n')
}

function getMarkdownFence(line) {
  const match = String(line || '').match(/^(```+)\s*([^`]*)$/)
  if (!match) return null
  return {
    marker: match[1],
    info: String(match[2] || '').trim()
  }
}

function normalizeMarkdownFenceLine(fence) {
  if (!fence.info) return fence.marker
  const language = normalizeMarkdownCodeLanguage(fence.info)
  return language ? `${fence.marker}${language}` : fence.marker
}

function stripBrokenMarkdownMarkers(text) {
  const lines = String(text || '').split('\n')
  let inFence = false

  return lines.map((line) => {
    if (getMarkdownFence(line)) {
      inFence = !inFence
      return line
    }
    if (inFence) return line
    return line.replace(/\*\*/g, '')
  }).join('\n')
}

function decorateCodeBlocks(html) {
  return String(html || '').replace(
    /<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_match, language, codeHtml) => {
      const inferredLanguage = language ? '' : inferCodeLanguage(codeHtml)
      const normalizedLanguage = normalizeMarkdownCodeLanguage(language || inferredLanguage)
      if (!normalizedLanguage) {
        return `<pre class="md-example-block"><code>${codeHtml}</code></pre>`
      }

      const languageClass = normalizedLanguage ? ` language-${normalizedLanguage}` : ''
      const label = normalizedLanguage ? getLanguageLabel(normalizedLanguage) : 'Code'

      return [
        `<div class="md-code-block${languageClass}">`,
        '<div class="md-code-header">',
        `<span>${escapeHtml(label)}</span>`,
        '</div>',
        `<pre><code class="${languageClass.trim()}">${codeHtml}</code></pre>`,
        '</div>'
      ].join('')
    }
  )
}

function normalizeMarkdownCodeLanguage(language) {
  const value = String(language || '')
    .trim()
    .toLowerCase()
    .replace(/\s*\[\]\s*$/, '')
  const firstToken = (value.split(/\s+/)[0] || '').replace(/\[\]$/, '')
  const aliases = {
    py: 'python',
    python3: 'python',
    jsx: 'javascript',
    js: 'javascript',
    ts: 'typescript',
    cc: 'cpp',
    cxx: 'cpp',
    'c++': 'cpp'
  }

  return aliases[firstToken] || firstToken
}

function inferCodeLanguage(codeHtml) {
  const code = decodeHtmlEntities(codeHtml)

  if (/class\s+Solution\s*:|def\s+\w+\s*\(/.test(code)) return 'python'
  if (/public\s+class|public\s+\w+|int\[\]|String\[\]/.test(code)) return 'java'
  if (/#include\s*<|vector\s*<|std::|class\s+Solution\s*\{[\s\S]*public:/.test(code)) return 'cpp'
  if (/function\s+\w*|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|=>/.test(code)) return 'javascript'
  if (/#include\s*<|printf\s*\(|malloc\s*\(/.test(code)) return 'c'

  return ''
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function renderMathExpressions(text) {
  let output = ''
  let index = 0

  while (index < text.length) {
    if (text[index] === '\\' && text[index + 1] === '$') {
      output += '$'
      index += 2
      continue
    }

    if (text.startsWith('$$', index)) {
      const end = findMathDelimiter(text, index + 2, '$$')
      if (end === -1) {
        output += text.slice(index)
        break
      }

      output += `\n<div class="math-block">${formatMathExpression(text.slice(index + 2, end))}</div>\n`
      index = end + 2
      continue
    }

    if (text[index] === '$') {
      const end = findMathDelimiter(text, index + 1, '$')
      if (end === -1) {
        output += text[index]
        index += 1
        continue
      }

      output += `<span class="math-inline">${formatMathExpression(text.slice(index + 1, end))}</span>`
      index = end + 1
      continue
    }

    output += text[index]
    index += 1
  }

  return output
}

function findMathDelimiter(text, start, delimiter) {
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === '\\') {
      index += 1
      continue
    }

    if (delimiter === '$$' && text.startsWith('$$', index)) {
      return index
    }

    if (delimiter === '$' && text[index] === '$' && !text.startsWith('$$', index)) {
      return index
    }
  }

  return -1
}

function formatMathExpression(value) {
  const replacements = {
    '\\\\log': 'log',
    '\\\\ln': 'ln',
    '\\\\leq': '≤',
    '\\\\geq': '≥',
    '\\\\neq': '≠',
    '\\\\times': '×',
    '\\\\cdot': '·',
    '\\\\infty': '∞',
    '\\\\left': '',
    '\\\\right': '',
    '\\\\theta': 'θ',
    '\\\\Theta': 'Θ',
    '\\\\alpha': 'α',
    '\\\\beta': 'β'
  }

  let expression = String(value || '').trim()
  Object.entries(replacements).forEach(([source, target]) => {
    expression = expression.replace(new RegExp(source, 'g'), target)
  })

  expression = expression
    .replace(/\\[,;:!]/g, ' ')
    .replace(/\\([{}()[\]])/g, '$1')
    .replace(/\\/g, '')

  return escapeHtml(expression)
    .replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>')
    .replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>')
    .replace(/_([A-Za-z0-9+-]+)/g, '<sub>$1</sub>')
    .replace(/\^([A-Za-z0-9+-]+)/g, '<sup>$1</sup>')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeSolutionCodeBlocks(codeValue) {
  if (!codeValue) return {}

  if (typeof codeValue === 'string') {
    return { [selectedLanguage.value]: codeValue }
  }

  if (Array.isArray(codeValue)) {
    return codeValue.reduce((blocks, item, index) => {
      if (item === null || item === undefined) return blocks
      blocks[`code${index + 1}`] = String(item)
      return blocks
    }, {})
  }

  if (typeof codeValue === 'object') {
    return Object.entries(codeValue).reduce((blocks, [lang, value]) => {
      if (value === null || value === undefined) return blocks
      blocks[lang] = String(value)
      return blocks
    }, {})
  }

  return {}
}

function getInitialCode(language = selectedLanguage.value) {
  const normalizedLanguage = normalizeStarterLanguage(language)
  return getProblemStarterCode(language) ||
    missingStarterCodeTemplates[normalizedLanguage] ||
    codeTemplates[language] ||
    ''
}

function getProblemStarterCode(language) {
  const normalizedLanguage = normalizeStarterLanguage(language)
  if (!normalizedLanguage) return ''

  const starterCode = problem.value?.starterCode
  if (starterCode && typeof starterCode === 'object') {
    const directCode = String(starterCode[normalizedLanguage] || '').trim()
    if (directCode) return directCode
  }

  const snippets = Array.isArray(problem.value?.codeSnippets) ? problem.value.codeSnippets : []
  const matchedSnippet = snippets.find(snippet =>
    normalizeStarterLanguage(snippet?.langSlug || snippet?.lang) === normalizedLanguage &&
    String(snippet?.code || '').trim()
  )
  return matchedSnippet ? String(matchedSnippet.code).trim() : ''
}

function chooseInitialLanguage() {
  return starterLanguagePriority.find(language => getProblemStarterCode(language)) || selectedLanguage.value
}

function normalizeStarterLanguage(value) {
  switch (String(value || '').trim().toLowerCase()) {
    case 'java': return 'java'
    case 'python':
    case 'python3':
    case 'py':
      return 'python'
    case 'c': return 'c'
    case 'cpp':
    case 'c++':
    case 'cc':
    case 'cxx':
      return 'cpp'
    case 'javascript':
    case 'js':
      return 'javascript'
    default:
      return ''
  }
}

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
  code.value = getInitialCode(selectedLanguage.value)
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
    code.value = getInitialCode(selectedLanguage.value)
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
  const slug = typeof route.query.slug === 'string' ? route.query.slug.trim() : ''
  if (slug && !route.params.id) {
    try {
      uiMessage.info('正在从 LeetCodeClaw 抓取题目并写入本地题库')
      const result = await persistClawProblemBySlug(slug)
      router.replace({
        path: `/student/leetcode-practice/${result.problemId}`,
        query: {
          ...route.query,
          slug: undefined
        }
      })
      return
    } catch (error) {
      logger.error('LeetCodeClaw 抓题入库失败:', error)
      uiMessage.error(error.friendlyMessage || error.message || 'LeetCodeClaw 抓题入库失败')
      router.push('/student/leetcode-search')
      return
    }
  }

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
    if (slug && !isSameProblemSlug(response.data, slug)) {
      await redirectToProblemBySlug(slug)
      return
    }

    problem.value = response.data
    selectedLanguage.value = chooseInitialLanguage()
    
    // 设置默认代码模板
    code.value = getInitialCode(selectedLanguage.value)
    
    // 设置默认测试用例
    testInput.value = normalizeSampleTestCases(problem.value.sampleTestCases)
  } catch (error) {
    logger.error('加载题目失败:', error)
    uiMessage.error('加载题目失败')
    router.push('/student/practice')
  }
}

function normalizeSampleTestCases(sampleTestCases) {
  if (Array.isArray(sampleTestCases)) {
    return sampleTestCases
      .filter(item => item !== null && item !== undefined)
      .map(item => String(item))
      .join('\n')
  }

  if (typeof sampleTestCases === 'string') {
    return sampleTestCases
  }

  return ''
}

function getProblemSlug(problemData) {
  const sourceKey = String(problemData?.sourceKey || '')
  if (sourceKey.startsWith('slug:')) {
    return sourceKey.slice('slug:'.length)
  }

  const sourceUrl = String(problemData?.sourceUrl || '')
  const match = sourceUrl.match(/\/problems\/([^/?#]+)\/?/)
  return match?.[1] || ''
}

function isSameProblemSlug(problemData, slug) {
  return getProblemSlug(problemData).toLowerCase() === String(slug || '').toLowerCase()
}

async function redirectToProblemBySlug(slug) {
  try {
    let response = await api.getLeetCodeProblemBySlug(slug)

    if (!response?.success || !response.data?.id) {
      await persistClawProblemBySlug(slug)
      response = await api.getLeetCodeProblemBySlug(slug)
    }

    if (!response?.success || !response.data?.id) {
      throw new Error(response?.message || '题目已入库，但主服务暂未查到该题')
    }

    router.replace({
      path: `/student/leetcode-practice/${response.data.id}`,
      query: { ...route.query, slug }
    })
  } catch (error) {
    logger.error('按 slug 校准 LeetCode 题目失败:', error)
    uiMessage.error(error.friendlyMessage || error.message || '加载题目失败')
    router.push('/student/leetcode-search')
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

<style scoped>
:deep(.math-inline) {
  display: inline-flex;
  align-items: baseline;
  max-width: 100%;
  margin: 0 2px;
  padding: 1px 5px;
  border-radius: 4px;
  background: #eef2f7;
  color: #1f2937;
  font-family: "Cambria Math", "Times New Roman", serif;
  font-style: italic;
  line-height: 1.35;
  white-space: nowrap;
}

:deep(.math-inline sub),
:deep(.math-inline sup),
:deep(.math-block sub),
:deep(.math-block sup) {
  font-size: 0.72em;
  line-height: 0;
}

:deep(.math-block) {
  margin: 12px 0;
  padding: 12px 16px;
  border-radius: 8px;
  background: #eef6ff;
  color: #1d4ed8;
  font-family: "Cambria Math", "Times New Roman", serif;
  font-style: italic;
  line-height: 1.6;
  text-align: center;
  overflow-x: auto;
}

:deep(.solution-markdown p),
:deep(.formatted-content p),
:deep(.constraints-content p),
:deep(.feedback-content p) {
  margin: 0 0 12px;
}

:deep(.solution-markdown),
:deep(.formatted-content),
:deep(.constraints-content),
:deep(.feedback-content) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

:deep(.md-example-block) {
  margin: 14px 0 22px;
  padding: 14px 18px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #4b5563;
  overflow-x: auto;
  white-space: pre-wrap;
}

:deep(.md-example-block code) {
  display: block;
  padding: 0;
  background: transparent;
  color: inherit;
  font-family: "Courier New", Consolas, monospace;
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
}

:deep(.md-code-block) {
  margin: 22px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #263244;
  background: #111827;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
}

:deep(.md-code-block + .md-code-block) {
  margin-top: 28px;
}

:deep(.md-code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 0 14px;
  background: #0f172a;
  border-bottom: 1px solid rgba(148, 163, 184, 0.24);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

:deep(.md-code-header span) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

:deep(.md-code-header span::before) {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
}

:deep(.md-code-block pre) {
  margin: 0;
  padding: 18px 20px;
  overflow-x: auto;
  background: #1f2937;
  color: #e5e7eb;
  font-size: 14px;
  line-height: 1.72;
  tab-size: 4;
}

:deep(.md-code-block code) {
  display: block;
  min-width: max-content;
  font-family: "JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace;
  white-space: pre;
}

:deep(.md-code-block.language-python .md-code-header span::before) {
  background: #3776ab;
}

:deep(.md-code-block.language-java .md-code-header span::before) {
  background: #f97316;
}

:deep(.md-code-block.language-cpp .md-code-header span::before),
:deep(.md-code-block.language-c .md-code-header span::before) {
  background: #60a5fa;
}

:deep(.md-code-block.language-javascript .md-code-header span::before),
:deep(.md-code-block.language-typescript .md-code-header span::before) {
  background: #facc15;
}

:deep(.solution-card .md-code-block:first-child),
:deep(.solution-markdown .md-code-block:first-child) {
  margin-top: 12px;
}

:deep(.solution-card .md-code-block:last-child),
:deep(.solution-markdown .md-code-block:last-child) {
  margin-bottom: 0;
}
</style>



