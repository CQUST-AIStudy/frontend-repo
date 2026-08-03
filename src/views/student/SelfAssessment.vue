<template>
  <div class="self-assessment-container [height:100%]">
    <UiPageHeader
        class="my-page-header [padding:20px] max-[768px]:[padding:16px]"
      title="自我评估"
      description="评估您在每次实验中实际独立完成的部分，以获得更准确的学习分析"
    />

    <loading-state :loading="loading">
      <div class="assessment-content [display:flex] [flex-direction:column] [gap:20px]">
        <ui-alert
          type="info"
          show-icon
          :closable="false"
        >
          <template #title>
            为什么需要自我评估
          </template>
          <p>
            AI测评系统会分析您的代码和查重率，但有时需要您的主观评价来更全面地了解您的学习情况。
            通过诚实地自我评估，系统可以为您提供更准确的学习建议和个性化的练习内容。
          </p>
        </ui-alert>

        <ui-tabs v-model="activeTab" class="assessment-tabs [margin-top:20px]">
          <ui-tab-pane label="实验自评" name="experiments">
            <ui-card v-for="exp in completedExperiments" :key="exp.id" class="assessment-card [margin-bottom:20px]">
              <div class="experiment-header [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:15px] [flex-wrap:wrap] [gap:10px]">
                <h3>{{ exp.name }}</h3>
                <ui-tag type="success" size="small">已完成</ui-tag>
              </div>

              <div class="experiment-info [display:flex] [margin-bottom:20px] [flex-wrap:wrap] [gap:20px]">
                <div class="info-item [display:flex] [align-items:center]">
                  <div class="info-label [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">提交时间：</div>
                  <div class="info-value [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ exp.submitTime }}</div>
                </div>
                <div class="info-item [display:flex] [align-items:center]">
                  <div class="info-label [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">得分：</div>
                  <div class="info-value [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ exp.score }}</div>
                </div>
                <div class="info-item [display:flex] [align-items:center]">
                  <div class="info-label [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">查重率：</div>
                  <div class="info-value [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ exp.plagiarismRate }}%</div>
                </div>
              </div>

              <div class="assessment-form [border:1px_solid_#ebeef5] [border-radius:4px] [padding:20px] [background-color:#f9f9f9] [margin-bottom:15px] max-[640px]:[padding:14px]">
                <div class="completion-rate [margin-bottom:20px] [display:flex] [flex-wrap:wrap] [align-items:center]">
                  <div class="rate-label [margin-bottom:10px] [color:#606266] [font-weight:500]">独立完成比例：</div>
                  <ui-slider
                    v-model="assessmentData[exp.id].completionRate"
                    :format-tooltip="percentFormat"
                    :min="0"
                    :max="100"
                    :step="5"
                  ></ui-slider>
                  <div class="rate-value [min-width:50px] [text-align:right] [font-weight:500]">{{ assessmentData[exp.id].completionRate }}%</div>
                </div>

                <div class="difficulty-rating [margin-bottom:20px]">
                  <div class="rate-label [margin-bottom:10px] [color:#606266] [font-weight:500]">实验难度评价：</div>
                  <ui-rate
                    v-model="assessmentData[exp.id].difficultyRating"
                    :texts="difficultyTexts"
                    show-text
                  ></ui-rate>
                </div>

                <div class="content-understanding [margin-bottom:20px]">
                  <div class="rate-label [margin-bottom:10px] [color:#606266] [font-weight:500]">对知识点的理解程度：</div>
                  <ui-rate
                    v-model="assessmentData[exp.id].understandingLevel"
                    :colors="understandingColors"
                  ></ui-rate>
                </div>

                <div class="assessment-notes [margin-bottom:20px]">
                  <div class="rate-label [margin-bottom:10px] [color:#606266] [font-weight:500]">自我评价与反思：</div>
                  <ui-input
                    v-model="assessmentData[exp.id].notes"
                    type="textarea"
                    :rows="3"
                    placeholder="请简要描述您在实验过程中的收获、遇到的困难以及解决方法等.."
                  ></ui-input>
                </div>
              </div>

              <div class="save-button [margin-top:10px] [text-align:right]">
                <ui-button
                  type="primary"
                  size="small"
                  @click="saveAssessment(exp.id)"
                  :loading="savingId === exp.id"
                >保存评估</ui-button>
              </div>
            </ui-card>

            <div v-if="completedExperiments.length === 0" class="empty-state [padding:40px_0]">
              <ui-empty description="暂无可评估的实验"></ui-empty>
            </div>
          </ui-tab-pane>

          <ui-tab-pane label="知识点自评" name="knowledge">
            <ui-card class="knowledge-card [margin-bottom:20px]">
              <template #header>
                <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                  <span>数据结构知识点掌握自评</span>
                </div>
              </template>

              <div class="knowledge-assessment">
                <div v-for="(item, index) in knowledgePoints" :key="index" class="knowledge-item [display:flex] [align-items:center] [margin-bottom:15px]">
                  <div class="knowledge-name [width:200px] [padding-right:15px] [color:#303133]">{{ item.name }}</div>
                  <div class="knowledge-slider [flex:1]">
                    <ui-slider
                      v-model="knowledgeAssessment[item.key]"
                      :format-tooltip="formatKnowledgeTooltip"
                      :min="0"
                      :max="100"
                      :step="5"
                    ></ui-slider>
                  </div>
                  <div class="knowledge-level [width:60px] [text-align:right] [font-weight:500] [color:#d18a61]">{{ getKnowledgeLevel(knowledgeAssessment[item.key]) }}</div>
                </div>

                <div class="save-button knowledge-save [margin-top:10px] [text-align:right] [margin-top:30px]">
                  <ui-button
                    type="primary"
                    @click="saveKnowledgeAssessment"
                    :loading="savingKnowledge"
                  >保存知识点评估</ui-button>
                </div>
              </div>
            </ui-card>
          </ui-tab-pane>

          <ui-tab-pane label="学习习惯自评" name="habits">
            <ui-card class="habits-card [margin-bottom:20px]">
              <template #header>
                <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                  <span>学习习惯自评</span>
                </div>
              </template>

              <ui-form :model="habitsForm" label-position="top" class="habits-form [max-width:600px]">
                <ui-form-item label="每周平均学习时间（小时）">
                  <ui-input-number v-model="habitsForm.weeklyHours" :min="0" :max="100" :step="0.5"></ui-input-number>
                </ui-form-item>

                <ui-form-item label="课前预习情况">
                  <ui-radio-group v-model="habitsForm.preview">
                    <ui-radio :label="1">从不</ui-radio>
                    <ui-radio :label="2">偶尔</ui-radio>
                    <ui-radio :label="3">经常</ui-radio>
                    <ui-radio :label="4">总是</ui-radio>
                  </ui-radio-group>
                </ui-form-item>

                <ui-form-item label="课后复习情况">
                  <ui-radio-group v-model="habitsForm.review">
                    <ui-radio :label="1">从不</ui-radio>
                    <ui-radio :label="2">偶尔</ui-radio>
                    <ui-radio :label="3">经常</ui-radio>
                    <ui-radio :label="4">总是</ui-radio>
                  </ui-radio-group>
                </ui-form-item>

                <ui-form-item label="独立解决问题能力自评">
                  <ui-rate v-model="habitsForm.problemSolving" :max="5"></ui-rate>
                </ui-form-item>

                <ui-form-item label="学习方式（可多选）">
                  <ui-checkbox-group v-model="habitsForm.learningMethods">
                    <ui-checkbox label="books">教科书阅读</ui-checkbox>
                    <ui-checkbox label="videos">视频教程</ui-checkbox>
                    <ui-checkbox label="practice">编程练习</ui-checkbox>
                    <ui-checkbox label="discussion">小组讨论</ui-checkbox>
                    <ui-checkbox label="online">在线资源</ui-checkbox>
                  </ui-checkbox-group>
                </ui-form-item>

                <ui-form-item label="学习难点和挑战">
                  <ui-input
                    v-model="habitsForm.challenges"
                    type="textarea"
                    :rows="4"
                    placeholder="请描述您在数据结构学习中遇到的主要困难和挑战..."
                  ></ui-input>
                </ui-form-item>

                <ui-form-item>
                  <ui-button
                    type="primary"
                    @click="saveHabitsAssessment"
                    :loading="savingHabits"
                  >保存学习习惯评估</ui-button>
                </ui-form-item>
              </ui-form>
            </ui-card>
          </ui-tab-pane>
        </ui-tabs>
      </div>
    </loading-state>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import LoadingState from '../../components/LoadingState.vue'
import { useExperimentStore, useLearningStore } from '../../store'

const experimentStore = useExperimentStore()
const learningStore = useLearningStore()
const loading = ref(true)
const activeTab = ref('experiments')
const savingId = ref(null)
const savingKnowledge = ref(false)
const savingHabits = ref(false)

// 获取已完成的实验列表
const completedExperiments = computed(() => {
  // 确保experimentList是数组，如果不是则返回空数组
  const experimentList = Array.isArray(experimentStore.experimentList) 
    ? experimentStore.experimentList 
    : (experimentStore.experimentList && experimentStore.experimentList.data || []);
  
  return experimentList.filter(exp => exp && exp.status === 'completed');
})

// 实验自评数据
const assessmentData = reactive({})

// 知识点列表
const knowledgePoints = [
  { key: 'linearList', name: '线性表 (顺序表、链表' },
  { key: 'stack', name: '栈与栈的应用' },
  { key: 'queue', name: '队列与队列的应用' },
  { key: 'tree', name: '树与二叉树' },
  { key: 'graph', name: '图与图算法' },
  { key: 'search', name: '查找算法' },
  { key: 'sort', name: '排序算法' },
  { key: 'hash', name: '哈希表' },
  { key: 'complexity', name: '算法复杂度分析' }
]

// 知识点自评数据
const knowledgeAssessment = reactive({
  linearList: 80,
  stack: 75,
  queue: 70,
  tree: 60,
  graph: 40,
  search: 65,
  sort: 70,
  hash: 50,
  complexity: 65
})

// 学习习惯自评表单
const habitsForm = reactive({
  weeklyHours: 8,
  preview: 2,
  review: 3,
  problemSolving: 3,
  learningMethods: ['books', 'practice'],
  challenges: ''
})

// 难度评价文本
const difficultyTexts = ['非常简单', '简单', '一般', '有挑战', '非常困难']

// 理解程度颜色
const understandingColors = ['#F56C6C', '#E6A23C', '#E6A23C', '#67C23A', '#67C23A']

// 格式化百分比
const percentFormat = (val) => {
  return val + '%'
}

// 格式化知识点提示
const formatKnowledgeTooltip = (val) => {
  return `掌握度 ${val}%`
}

// 获取知识掌握程度文本
const getKnowledgeLevel = (val) => {
  if (val >= 90) return '精通'
  if (val >= 75) return '熟练'
  if (val >= 60) return '一般'
  if (val >= 40) return '基础'
  return '不熟悉'
}

// 初始化自评数据
const initAssessmentData = () => {
  // 添加安全检查
  if (!completedExperiments.value || !Array.isArray(completedExperiments.value)) {
    return;
  }
  
  completedExperiments.value.forEach(exp => {
    if (exp && exp.id && !assessmentData[exp.id]) {
      assessmentData[exp.id] = {
        completionRate: exp.plagiarismRate ? 100 - Math.min(exp.plagiarismRate * 2, 50) : 100, // 基于查重率的初始推荐值
        difficultyRating: 3,
        understandingLevel: 3,
        notes: ''
      }
    }
  })
}

// 保存实验自评
const saveAssessment = async (expId) => {
  savingId.value = expId
  try {
    const response = await learningStore.submitSelfAssessment({
      experimentId: expId,
      ...assessmentData[expId]
    })

    if (response.success) {
      uiMessage.success('评估保存成功')
    } else {
      uiMessage.error('保存失败，请重试')
    }
  } catch (error) {
    uiMessage.error('发生错误，请重试')
    logger.error(error)
  } finally {
    savingId.value = null
  }
}

// 保存知识点自评
const saveKnowledgeAssessment = async () => {
  savingKnowledge.value = true
  try {
    const response = await learningStore.submitSelfAssessment({
      type: 'knowledge',
      assessment: knowledgeAssessment
    })

    if (response.success) {
      uiMessage.success('知识点评估保存成功')
    } else {
      uiMessage.error('保存失败，请重试')
    }
  } catch (error) {
    uiMessage.error('发生错误，请重试')
    logger.error(error)
  } finally {
    savingKnowledge.value = false
  }
}

// 保存学习习惯自评
const saveHabitsAssessment = async () => {
  savingHabits.value = true
  try {
    const response = await learningStore.submitSelfAssessment({
      type: 'habits',
      assessment: habitsForm
    })

    if (response.success) {
      uiMessage.success('学习习惯评估保存成功')
    } else {
      uiMessage.error('保存失败，请重试')
    }
  } catch (error) {
    uiMessage.error('发生错误，请重试')
    logger.error(error)
  } finally {
    savingHabits.value = false
  }
}

// 初始化页面
onMounted(async () => {
  loading.value = true
  try {
    // 检查实验列表是否已加载
    const hasExperiments = experimentStore.experimentList && 
      ((Array.isArray(experimentStore.experimentList) && experimentStore.experimentList.length > 0) ||
       (experimentStore.experimentList.data && Array.isArray(experimentStore.experimentList.data) && experimentStore.experimentList.data.length > 0));
    
    if (!hasExperiments) {
      await experimentStore.fetchExperimentList()
      logger.debug("获取实验列表:", experimentStore.experimentList)
    }

    // 延迟执行，确保数据已更新到视图
    setTimeout(() => {
      initAssessmentData()
      loading.value = false
    }, 100)
  } catch (error) {
    logger.error("加载自评数据时出错", error)
    uiMessage.error("加载数据失败，请刷新页面重试")
    loading.value = false
  }
})
</script>


