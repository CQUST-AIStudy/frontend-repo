<template>
  <div class="flex flex-col gap-5">
    <UiPageHeader
      title="生成教学 PPT"
      description="根据课程主题、知识点和难度要求，快速生成可直接整理成课件的教学大纲。"
    />

    <div class="grid grid-cols-[minmax(320px,420px)_minmax(0,1fr)] gap-5 items-start max-[1080px]:grid-cols-1">
      <!-- Form Card -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-start gap-4 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="font-semibold text-[#1d1d1f]">生成配置</span>
        </div>

        <UiForm @submit.prevent="generatePPT" class="flex flex-col gap-5">
          <!-- PPT 主题 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#1d1d1f]">PPT 主题</label>
            <UiInput
              v-model="pptForm.title"
              type="text"
              placeholder="例如：二叉树的遍历与应用"
              class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
            />
            <span v-if="errors.title" class="text-[12px] text-red-500">{{ errors.title }}</span>
          </div>

          <!-- 课件类型 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#1d1d1f]">课件类型</label>
            <div class="flex items-center gap-1 p-1 rounded-[12px] bg-black/[0.04]">
              <label
                v-for="opt in typeOptions"
                :key="opt.value"
                class="h-[32px] px-4 rounded-[9px] text-[13px] font-medium transition-all cursor-pointer flex items-center"
                :class="pptForm.type === opt.value ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'"
              >
                <UiInput type="radio" v-model="pptForm.type" :value="opt.value" class="sr-only" />
                {{ opt.label }}
              </label>
            </div>
            <span v-if="errors.type" class="text-[12px] text-red-500">{{ errors.type }}</span>
          </div>

          <!-- 知识点 (multi-select) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#1d1d1f]">知识点</label>
            <UiSelect
              v-model="pptForm.topics"
              multiple
              class="h-[120px] px-3 py-2 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none cursor-pointer focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all"
            >
              <UiOption
                v-for="item in knowledgeTopics"
                :key="item.value"
                :value="item.value"
              >{{ item.label }}</UiOption>
            </UiSelect>
            <span class="text-[11px] text-[#86868b]">按住 Ctrl/Cmd 可多选</span>
            <span v-if="errors.topics" class="text-[12px] text-red-500">{{ errors.topics }}</span>
          </div>

          <!-- 内容难度 (KEEP ui-slider) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#1d1d1f]">内容难度</label>
            <ui-slider
              v-model="pptForm.difficulty"
              :step="1"
              :min="1"
              :max="5"
              :marks="difficultyMarks"
              show-stops
            />
          </div>

          <!-- 内容模块 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#1d1d1f]">内容模块</label>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="mod in moduleOptions"
                :key="mod.value"
                class="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#f5f5f7] cursor-pointer transition-all hover:bg-[#ededf0] has-[:checked]:bg-[rgba(194,112,62,0.08)] has-[:checked]:shadow-[inset_0_0_0_1.5px_rgba(194,112,62,0.4)]"
              >
                <UiInput type="checkbox" v-model="pptForm.includes" :value="mod.value" class="w-4 h-4 rounded accent-[var(--app-primary)]" />
                <span class="text-[13px] text-[#1d1d1f]">{{ mod.label }}</span>
              </label>
            </div>
          </div>

          <!-- 补充说明 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#1d1d1f]">补充说明</label>
            <textarea
              v-model="pptForm.notes"
              rows="4"
              placeholder="例如：偏向实验课、需要突出易错点、希望加入课堂讨论问题。"
              class="w-full px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-y"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 flex-wrap">
            <UiButton
              type="submit"
              :disabled="generating"
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100"
            >
              {{ generating ? '正在生成...' : '生成 PPT 大纲' }}
            </UiButton>
            <UiButton
              type="button"
              @click="resetForm"
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#ededf0] active:scale-[0.96] transition-all cursor-pointer border border-black/[0.06]"
            >
              重置
            </UiButton>
          </div>
        </UiForm>
      </div>

      <!-- Preview Card -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between gap-4 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="font-semibold text-[#1d1d1f]">内容预览</span>
          <UiButton
            type="button"
            :disabled="!previewSlides.length"
            @click="downloadPPT"
            class="h-[32px] px-4 rounded-[8px] text-[13px] font-medium text-[var(--app-primary)] bg-[rgba(194,112,62,0.08)] hover:bg-[rgba(194,112,62,0.12)] active:scale-[0.96] transition-all cursor-pointer border border-[rgba(194,112,62,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下载文本
          </UiButton>
        </div>

        <!-- Loading state -->
        <div v-if="generating" class="flex items-center gap-2.5 py-4 text-[#6e6e73]">
          <svg class="w-5 h-5 animate-spin text-[var(--app-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm">AI 正在生成课件内容，请稍候。</span>
        </div>

        <!-- Slides grid -->
        <div v-else-if="previewSlides.length" class="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          <article
            v-for="(slide, index) in previewSlides"
            :key="`${slide.title}-${index}`"
            class="overflow-hidden border border-black/[0.06] rounded-[14px] bg-gradient-to-b from-white to-[#f9fafb]"
          >
            <UiHeader class="px-3.5 py-2.5 border-b border-black/[0.04] text-[12px] text-[#86868b] font-medium">第 {{ index + 1 }} 页</UiHeader>
            <div class="p-4">
              <h3 class="text-[15px] font-semibold text-[#1d1d1f] mb-2">{{ slide.title }}</h3>
              <p v-if="slide.isTitle" class="m-0 text-[13px] text-[#6e6e73]">{{ pptTypeText }}</p>
              <div v-else-if="slide.isCode" class="overflow-auto rounded-[10px] bg-[#1d1d1f] text-[#f5f5f7] p-3.5">
                <pre class="m-0 text-[12px] leading-relaxed"><code>{{ slide.content }}</code></pre>
              </div>
              <div v-else class="text-[13px] text-[#424245] leading-[1.8]" v-html="formatSlideContent(slide.content)"></div>
            </div>
          </article>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
          <svg class="w-12 h-12 text-[#d2d2d7] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <p class="text-[13px] text-[#86868b]">生成后将在这里显示 PPT 大纲预览</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { message as uiMessage } from '@/services/feedback'
import { chatSend } from '../../api/tap'
import { useFormValidation } from '../../composables/useFormValidation'
import { renderSafeMarkdown } from '@/utils/safeHtml'

const generating = ref(false)
const previewSlides = ref([])

const pptForm = reactive({
  title: '',
  type: 'lecture',
  topics: [],
  difficulty: 3,
  includes: ['theory', 'examples'],
  notes: ''
})

const pptRules = {
  title: [
    { required: true, message: '请输入 PPT 主题' },
    { min: 2, max: 50, message: '主题长度保持在 2 到 50 个字符之间' }
  ],
  type: [{ required: true, message: '请选择课件类型' }],
  topics: [
    { required: true, message: '请至少选择一个知识点', validator: (val) => (!val || val.length === 0) ? '请至少选择一个知识点' : null }
  ]
}

const { errors, validate, resetFields } = useFormValidation(pptRules)

const typeOptions = [
  { value: 'lecture', label: '课堂讲授' },
  { value: 'review', label: '复习梳理' },
  { value: 'lab', label: '实验指导' }
]

const moduleOptions = [
  { value: 'theory', label: '理论讲解' },
  { value: 'examples', label: '示例代码' },
  { value: 'exercises', label: '课堂练习' },
  { value: 'applications', label: '应用场景' }
]

const difficultyMarks = {
  1: '入门',
  2: '基础',
  3: '中等',
  4: '进阶',
  5: '挑战'
}

const knowledgeTopics = [
  { value: 'array', label: '数组' },
  { value: 'linked_list', label: '链表' },
  { value: 'stack', label: '栈' },
  { value: 'queue', label: '队列' },
  { value: 'binary_tree', label: '二叉树' },
  { value: 'balanced_tree', label: '平衡树' },
  { value: 'heap', label: '堆' },
  { value: 'graph_representation', label: '图的表示' },
  { value: 'graph_traversal', label: '图的遍历' },
  { value: 'shortest_path', label: '最短路径' },
  { value: 'sorting', label: '排序算法' },
  { value: 'searching', label: '查找算法' },
  { value: 'hashing', label: '哈希' },
  { value: 'dynamic_programming', label: '动态规划' }
]

const selectedTopics = computed(() =>
  pptForm.topics.map(topic => knowledgeTopics.find(item => item.value === topic)?.label || topic)
)

const pptTypeText = computed(() => {
  const map = {
    lecture: '课堂讲授',
    review: '复习梳理',
    lab: '实验指导'
  }
  return map[pptForm.type] || '教学课件'
})

const difficultyText = computed(() => difficultyMarks[pptForm.difficulty] || '中等')

function buildPrompt() {
  const includesText = pptForm.includes.map(item => {
    const map = {
      theory: '理论讲解',
      examples: '示例代码',
      exercises: '课堂练习',
      applications: '应用场景'
    }
    return map[item] || item
  }).join('、')

  return [
    `请为我生成一份"${pptForm.title}"的数据结构课程 ${pptTypeText.value} PPT 大纲。`,
    `知识点：${selectedTopics.value.join('、')}`,
    `难度：${difficultyText.value}`,
    `需包含：${includesText}`,
    pptForm.notes ? `补充要求：${pptForm.notes}` : '',
    '',
    '输出要求：',
    '1. 使用 ---PAGE--- 分隔每一页。',
    '2. 第一页只输出标题。',
    '3. 后续页面先给页面标题，再给要点列表。',
    '4. 总页数控制在 6 到 10 页。'
  ].filter(Boolean).join('\n')
}

function parseSlides(text) {
  const pages = text
    .split(/---PAGE---/i)
    .map(item => item.trim())
    .filter(Boolean)

  if (!pages.length) return []

  return pages.map((page, index) => {
    const lines = page.split('\n').map(line => line.trim()).filter(Boolean)
    const title = lines[0]?.replace(/^#+\s*/, '') || (index === 0 ? pptForm.title : `第 ${index + 1} 页`)
    const content = lines.slice(1).join('\n')
    const isCode = content.includes('```')
    return {
      title,
      content: content.replace(/```[\w-]*/g, '').replace(/```/g, '').trim(),
      isTitle: index === 0,
      isCode
    }
  })
}

function formatSlideContent(content) {
  return renderSafeMarkdown(content)
}

async function generatePPT() {
  const valid = validate(pptForm)
  if (!valid) {
    uiMessage.error('请先完善表单信息')
    return
  }

  generating.value = true
  previewSlides.value = []

  try {
    const res = await chatSend(buildPrompt(), [])
    const data = res?.data ?? res
    const fullText = (data?.reply || '').trim()

    if (!fullText) {
      throw new Error('AI 未返回可用的 PPT 内容')
    }

    const slides = parseSlides(fullText)
    previewSlides.value = slides.length
      ? slides
      : [
          { title: pptForm.title, content: '', isTitle: true, isCode: false },
          { title: '内容', content: fullText, isTitle: false, isCode: false }
        ]

    uiMessage.success(`PPT 生成完成，共 ${previewSlides.value.length} 页`)
  } catch (error) {
    uiMessage.error(`生成失败：${error?.message || '请稍后重试'}`)
  } finally {
    generating.value = false
  }
}

function resetForm() {
  pptForm.title = ''
  pptForm.type = 'lecture'
  pptForm.topics = []
  pptForm.difficulty = 3
  pptForm.includes = ['theory', 'examples']
  pptForm.notes = ''
  resetFields()
  previewSlides.value = []
}

function downloadPPT() {
  if (!previewSlides.value.length) return

  const content = previewSlides.value
    .map((slide, index) => `===== 第 ${index + 1} 页 =====\n${slide.title}\n${slide.content || ''}`)
    .join('\n\n')

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${pptForm.title || '教学PPT大纲'}.txt`
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>
