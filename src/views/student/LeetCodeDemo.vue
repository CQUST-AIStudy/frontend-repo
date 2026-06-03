<template>
  <div class="leetcode-demo [padding:20px]">
    <UiPageHeader title="LeetCode功能演示" description="测试代码提交和AI批改功能" />
    
    <ui-card class="demo-card [margin-bottom:20px] [&_h3]:[margin-bottom:20px] [&_h3]:[color:#333]">
      <h3>🧪 功能测试</h3>
      
      <ui-space direction="vertical" size="large" class="[width:100%]">
        <ui-button @click="testAIFeedback" type="primary" size="large">
          测试AI批改反馈
        </ui-button>
        
        <ui-button @click="testSubmitCode" type="success" size="large" :loading="testing">
          测试代码提交
        </ui-button>
      </ui-space>
    </ui-card>

    <!-- AI反馈演示 -->
    <ui-card v-if="showDemo" class="feedback-demo [margin-top:20px] [&_h3]:[margin-bottom:20px] [&_h3]:[color:#333]">
      <h3>🤖 AI批改反馈演示</h3>
      
      <div class="demo-result [max-height:70vh] [overflow-y:auto]">
        <div class="result-header [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:20px] [padding:16px] [background:#f8f9fa] [border-radius:8px] [margin-bottom:10px]">
          <div class="status accepted [display:flex] [align-items:center] [gap:8px] [font-size:18px] [font-weight:bold] [&.accepted]:[color:#67c23a] [&.rejected]:[color:#f56c6c]">
            <ui-icon><Check /></ui-icon>
            通过
          </div>
          <div class="score [font-size:16px] [font-weight:bold] [color:#409eff] [color:#f56c6c] [font-weight:700]">
            得分: 85/100
          </div>
        </div>

        <!-- AI评测结果 -->
        <div class="ai-feedback [margin:20px_0] [&_h4]:[margin-bottom:12px] [&_h4]:[color:#333]">
          <h4>AI 评测反馈</h4>
          <div class="feedback-content [background:#f8f9fa] [padding:16px] [border-radius:8px] [border-left:4px_solid_#409eff] [&_h2]:[color:#409eff] [&_h2]:[margin-top:0] [&_h3]:[color:#333] [&_h3]:[margin:16px_0_8px_0] [&_ul]:[margin:8px_0] [&_ul]:[padding-left:20px] [&_li]:[margin:4px_0] [font-size:14px] [line-height:1.9] [color:#202124] [background:#e6f4ea] [padding:20px_24px] [border-radius:12px] [border-left:4px_solid_#1e8e3e]" v-html="renderedFeedback"></div>
        </div>

        <!-- 执行详情 -->
        <div class="execution-details [margin:20px_0]">
          <ui-descriptions title="执行详情" :column="2" border>
            <ui-descriptions-item label="执行时间">120ms</ui-descriptions-item>
            <ui-descriptions-item label="内存消耗">暂无</ui-descriptions-item>
            <ui-descriptions-item label="通过用例">3 / 3</ui-descriptions-item>
          </ui-descriptions>
        </div>

        <!-- 技能提升建议-->
        <div class="skill-suggestions [margin:20px_0] [&_h4]:[margin-bottom:12px] [&_h4]:[color:#333]">
          <h4>技能提升建议</h4>
          <ui-tag
            v-for="suggestion in skillSuggestions"
            :key="suggestion"
            class="suggestion-tag [margin:4px_8px_4px_0]"
            type="info"
          >
            {{ suggestion }}
          </ui-tag>
        </div>
      </div>
    </ui-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { Check } from '@/components/ui/icons'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { testAIFeedback as getTestFeedback } from '@/utils/testLeetCode'

const showDemo = ref(false)
const testing = ref(false)

const mockFeedback = `## 🤖 AI代码评测报告

### 🎉 恭喜通过！
你的解答**完全正确**，所有测试用例都通过了！

### 📊 代码质量分析
- ✅**正确性*: 完美 (3/3 测试用例通过)
- 🚀 **执行效率**: 良好 (平均 120ms)
- 📝 **代码风格**: 良好 ⭐⭐
- 🧠 **算法复杂度*: O(n²) - 嵌套循环

### 💡 个性化建议
🌟 **进阶挑战**:
- 尝试优化算法的时间复杂度
- 考虑使用HashMap来实现O(n)时间复杂度
- 添加注释提高代码可读性

### 📚 推荐学习
继续挑战相关题目:
- 尝试同类型的中等难度题目
- 学习更高效的算法和数据结构`

const skillSuggestions = ref(['数组操作', '算法优化', '哈希表应用'])

const renderedFeedback = computed(() => {
  return DOMPurify.sanitize(marked(mockFeedback))
})

function testAIFeedback() {
  showDemo.value = true
  uiMessage.success('AI批改反馈演示已显示')
  
  // 调用测试工具
  const result = getTestFeedback()
  logger.debug('测试结果:', result)
}

async function testSubmitCode() {
  testing.value = true
  
  try {
    // 模拟提交过程
    uiMessage.info('正在提交代码...')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟AI批改过程
    uiMessage.info('AI正在批改中..')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 显示结果
    showDemo.value = true
    uiMessage.success('代码提交成功，AI批改完成！')
    
  } catch (error) {
    uiMessage.error('测试失败: ' + error.message)
  } finally {
    testing.value = false
  }
}
</script>

