<template>
  <div class="leetcode-demo [padding:20px]">
    <page-header title="LeetCode功能演示" description="测试代码提交和AI批改功能" />
    
    <el-card class="demo-card [margin-bottom:20px] [&_h3]:[margin-bottom:20px] [&_h3]:[color:#333]">
      <h3 class="[display:flex] [align-items:center] [gap:8px]">
        <LucideIcon name="clipboard-check" :size="20" />
        功能测试
      </h3>
      
      <el-space direction="vertical" size="large" class="[width:100%]">
        <el-button @click="testAIFeedback" type="primary" size="large">
          测试AI批改反馈
        </el-button>
        
        <el-button @click="testSubmitCode" type="success" size="large" :loading="testing">
          测试代码提交
        </el-button>
      </el-space>
    </el-card>

    <!-- AI反馈演示 -->
    <el-card v-if="showDemo" class="feedback-demo [margin-top:20px] [&_h3]:[margin-bottom:20px] [&_h3]:[color:#333]">
      <h3 class="[display:flex] [align-items:center] [gap:8px]">
        <LucideIcon name="bot" :size="20" />
        AI批改反馈演示
      </h3>
      
      <div class="demo-result [max-height:70vh] [overflow-y:auto]">
        <div class="result-header [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:20px] [padding:16px] [background:#f8f9fa] [border-radius:8px] [margin-bottom:10px]">
          <div class="status accepted [display:flex] [align-items:center] [gap:8px] [font-size:18px] [font-weight:bold] [&.accepted]:[color:#67c23a] [&.rejected]:[color:#f56c6c]">
            <el-icon><Check /></el-icon>
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
          <el-descriptions title="执行详情" :column="2" border>
            <el-descriptions-item label="执行时间">120ms</el-descriptions-item>
            <el-descriptions-item label="内存消耗">暂无</el-descriptions-item>
            <el-descriptions-item label="通过用例">3 / 3</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 技能提升建议-->
        <div class="skill-suggestions [margin:20px_0] [&_h4]:[margin-bottom:12px] [&_h4]:[color:#333]">
          <h4>技能提升建议</h4>
          <el-tag
            v-for="suggestion in skillSuggestions"
            :key="suggestion"
            class="suggestion-tag [margin:4px_8px_4px_0]"
            type="info"
          >
            {{ suggestion }}
          </el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import PageHeader from '@/components/PageHeader.vue'
import LucideIcon from '@/components/LucideIcon.vue'
import { testAIFeedback as getTestFeedback } from '@/utils/testLeetCode'

const showDemo = ref(false)
const testing = ref(false)

const mockFeedback = `## AI代码评测报告

### 恭喜通过！
你的解答**完全正确**，所有测试用例都通过了！

### 代码质量分析
- **正确性*: 完美 (3/3 测试用例通过)
- **执行效率**: 良好 (平均 120ms)
- **代码风格**: 良好
- **算法复杂度*: O(n²) - 嵌套循环

### 个性化建议
**进阶挑战**:
- 尝试优化算法的时间复杂度
- 考虑使用HashMap来实现O(n)时间复杂度
- 添加注释提高代码可读性

### 推荐学习
继续挑战相关题目:
- 尝试同类型的中等难度题目
- 学习更高效的算法和数据结构`

const skillSuggestions = ref(['数组操作', '算法优化', '哈希表应用'])

const renderedFeedback = computed(() => {
  return DOMPurify.sanitize(marked(mockFeedback))
})

function testAIFeedback() {
  showDemo.value = true
  ElMessage.success('AI批改反馈演示已显示')
  
  // 调用测试工具
  const result = getTestFeedback()
  logger.debug('测试结果:', result)
}

async function testSubmitCode() {
  testing.value = true
  
  try {
    // 模拟提交过程
    ElMessage.info('正在提交代码...')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟AI批改过程
    ElMessage.info('AI正在批改中..')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 显示结果
    showDemo.value = true
    ElMessage.success('代码提交成功，AI批改完成！')
    
  } catch (error) {
    ElMessage.error('测试失败: ' + error.message)
  } finally {
    testing.value = false
  }
}
</script>

