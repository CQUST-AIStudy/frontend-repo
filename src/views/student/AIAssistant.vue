<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import { renderSafeMarkdown } from '@/utils/safeHtml'
import { getKnowledgeBases } from '../../api/rag'
import { formatStudentAssistantError, useStudentAiChatStore } from '../../store/studentAiChat'

const chatStore = useStudentAiChatStore()
const {
  messages,
  userInput,
  isTyping,
  selectedCourseSpaceId,
  isOpenMode,
  assistantNotice
} = storeToRefs(chatStore)

const chatContainer = ref(null)
const courseSpaces = ref([])

const quickPrompts = [
  { label: '顺序表和链表', prompt: '请解释顺序表和链表的区别，并给出适用场景。' },
  { label: '树的遍历', prompt: '前序、中序、后序遍历分别是什么？如何记忆？' },
  { label: '复杂度分析', prompt: '如何分析一个算法的时间复杂度和空间复杂度？' },
  { label: '代码优化', prompt: '我应该如何优化一个查找算法？请给我常见思路。' }
]

const selectedCourseSpace = computed(() => {
  return courseSpaces.value.find((item) => String(item.id) === String(selectedCourseSpaceId.value)) || null
})

const visibleMessages = computed(() => {
  return messages.value.filter((message) => {
    return message.role !== 'ai' || message.content || message.citations?.length
  })
})

const showPromptSuggestions = computed(() => {
  return !isTyping.value && !messages.value.some((message) => message.role === 'user')
})

const showTypingHint = computed(() => {
  const lastMessage = messages.value[messages.value.length - 1]
  return isTyping.value && lastMessage?.role === 'ai' && !lastMessage.content && !lastMessage.citations?.length
})

const currentModeText = computed(() => {
  if (!selectedCourseSpaceId.value) return '普通聊天'
  return isOpenMode.value ? 'RAG 开放模式' : 'RAG 严格模式'
})

const modeTooltip = computed(() => {
  if (!selectedCourseSpaceId.value) {
    return '未选择课程空间时使用普通聊天；选择课程空间后可切换 RAG 严格/开放模式。'
  }
  return isOpenMode.value
    ? '开放模式：课程资料不足时允许补充联网检索。'
    : '严格模式：只依据课程资料回答。'
})

const modeSummaryText = computed(() => {
  return selectedCourseSpaceId.value ? '当前为 RAG 问答模式' : '当前为普通聊天模式'
})

const selectedSpaceSummary = computed(() => {
  if (!selectedCourseSpaceId.value) return '未选择课程空间时使用普通聊天'
  return `当前空间：${buildCourseSpaceLabel(selectedCourseSpace.value)}`
})

const canClearConversation = computed(() => {
  return !isTyping.value && (messages.value.length > 0 || !!userInput.value.trim())
})

function buildCourseSpaceLabel(courseSpace) {
  if (!courseSpace) return ''
  const parts = [courseSpace.courseName, courseSpace.name, courseSpace.term].filter(Boolean)
  const scope = courseSpace.docVisibility === 'class'
    ? '班级授权'
    : courseSpace.docVisibility === 'public'
      ? '公开'
      : null
  if (scope) parts.push(scope)
  return parts.join(' / ') || `课程空间 ${courseSpace.id}`
}

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

async function fetchCourseSpaces() {
  try {
    const spaces = await getKnowledgeBases()
    courseSpaces.value = spaces
    if (!selectedCourseSpaceId.value && spaces.length > 0) {
      chatStore.setCourseSpace(spaces[0].id)
    }
  } catch (error) {
    const friendlyMessage = formatStudentAssistantError(error?.message, !!selectedCourseSpaceId.value)
    chatStore.setAssistantNotice(friendlyMessage)
    uiMessage.warning(friendlyMessage)
    courseSpaces.value = []
  }
}

async function sendMessage() {
  await chatStore.sendMessage()
  await scrollToBottom()
}

function useQuickPrompt(prompt) {
  chatStore.setInput(prompt)
  nextTick(() => {
    const textarea = document.querySelector('.input-area textarea')
    if (textarea) textarea.focus()
  })
}

async function clearConversation() {
  try {
    await messageBox.confirm('清空当前 AI 聊天记录和输入草稿？', '提示', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
    chatStore.clearMessages()
    await scrollToBottom()
  } catch {
    // 用户取消清空。
  }
}

watch(messages, scrollToBottom, { deep: true })
watch(isTyping, scrollToBottom)

onMounted(() => {
  fetchCourseSpaces()
  scrollToBottom()
})
</script>

<template>
  <div class="flex h-full min-h-0 bg-[#f5f7fa] p-3 max-[640px]:p-2">
    <section class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-[#e6eaf0] bg-white">
      <ui-alert
        v-if="assistantNotice"
        class="m-3 mb-0"
        type="warning"
        :closable="false"
        :title="assistantNotice"
        show-icon
      />

      <div class="flex flex-none items-center justify-between gap-3 border-b border-[#e6eaf0] px-4 py-3 max-[640px]:flex-col max-[640px]:items-stretch">
        <div class="min-w-0">
          <h2 class="m-0 text-[18px] font-bold leading-tight text-[#1d1d1f]">
            AI 学习助手
          </h2>
          <p class="m-0 mt-1 truncate text-[12px] text-[#909399]">
            已保存 {{ messages.length }} 条聊天内容，切换目录后可继续查看。
          </p>
        </div>
        <ui-button
          type="button"
          :disabled="!canClearConversation"
          class="min-h-9 rounded-[10px] border border-[#e6eaf0] bg-[#f8fafc] px-3 text-[13px] text-[#606266] shadow-none hover:border-[#ff3b30]/30 hover:text-[#ff3b30]"
          @click="clearConversation"
        >
          清空记录
        </ui-button>
      </div>

      <div
        ref="chatContainer"
        class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 max-[640px]:px-3"
      >
        <div
          v-if="showPromptSuggestions"
          class="mx-auto flex min-h-full w-full max-w-[820px] flex-1 flex-col items-center justify-center gap-6 py-8 text-center"
        >
          <div class="flex flex-col gap-2">
            <h3 class="m-0 text-[24px] font-bold leading-tight text-[#1d1d1f] max-[640px]:text-[21px]">
              从一个数据结构问题开始
            </h3>
            <p class="m-0 max-w-[680px] text-[14px] leading-7 text-[#6e6e73]">
              选择一个提示词开始，或直接输入你的问题。选择课程空间后，将使用带引用的 RAG 问答。
            </p>
          </div>

          <div class="grid w-full grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            <button
              v-for="q in quickPrompts"
              :key="q.label"
              type="button"
              class="group flex min-h-[88px] flex-col items-start justify-between rounded-[12px] border border-[#e6eaf0] bg-[#fbfdff] px-4 py-3 text-left transition-all duration-150 hover:-translate-y-[1px] hover:border-[#007aff]/40 hover:bg-[#f4f9ff] hover:shadow-[0_10px_24px_rgba(22,48,79,0.08)]"
              @click="useQuickPrompt(q.prompt)"
            >
              <span class="text-[15px] font-semibold text-[#1d1d1f] group-hover:text-[#007aff]">
                {{ q.label }}
              </span>
              <span class="mt-2 line-clamp-2 text-[12px] leading-5 text-[#6e6e73]">
                {{ q.prompt }}
              </span>
            </button>
          </div>
        </div>

        <div
          v-for="(message, index) in visibleMessages"
          :key="message.id || index"
          class="flex min-w-0"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="min-w-0 max-w-[min(760px,78%)] rounded-[12px] px-3 py-2 text-[14px] leading-[1.65] max-[640px]:max-w-[92%]"
            :class="message.role === 'user'
              ? 'rounded-tr-[4px] bg-[#007aff] text-white'
              : 'rounded-tl-[4px] border border-[#e9edf3] bg-[#f8fafc] text-[#202124]'"
          >
            <div class="mb-1 flex items-center justify-between gap-3 text-[11px] leading-none opacity-70">
              <span>{{ message.role === 'user' ? '我' : 'AI 助手' }}</span>
              <span>{{ message.time }}</span>
            </div>
            <p
              v-if="message.role === 'user'"
              class="m-0 whitespace-pre-wrap [overflow-wrap:anywhere]"
            >
              {{ message.content }}
            </p>
            <div
              v-else
              class="assistant-markdown"
              v-html="renderSafeMarkdown(message.content)"
            />

            <div
              v-if="message.citations && message.citations.length"
              class="mt-2 flex flex-col gap-1 border-t border-[rgba(126,157,183,0.2)] pt-2 text-[12px] leading-5 text-[#606266]"
            >
              <div
                v-for="cite in message.citations"
                :key="`${message.id || index}-${cite.index}`"
              >
                [{{ cite.index }}] {{ cite.docName || cite.title || '引用资料' }}
                <span v-if="cite.chapterPath"> | {{ cite.chapterPath }}</span>
                <span v-if="cite.pageRange"> | {{ cite.pageRange }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showTypingHint" class="flex min-w-0 justify-start">
          <div class="min-w-[126px] rounded-[12px] rounded-tl-[4px] border border-[#e9edf3] bg-[#f8fafc] px-3 py-2 text-[14px] leading-[1.65] text-[#202124]">
            <div class="mb-1 flex items-center justify-between gap-3 text-[11px] leading-none opacity-70">
              <span>AI 助手</span>
              <span>正在生成</span>
            </div>
            <div class="inline-flex items-center gap-1" aria-label="正在生成">
              <span class="h-[5px] w-[5px] animate-typing-bounce rounded-full bg-[#8ca0b3]"></span>
              <span class="h-[5px] w-[5px] animate-typing-bounce rounded-full bg-[#8ca0b3] [animation-delay:120ms]"></span>
              <span class="h-[5px] w-[5px] animate-typing-bounce rounded-full bg-[#8ca0b3] [animation-delay:240ms]"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="input-area flex flex-none flex-col gap-2 border-t border-[#e6eaf0] bg-white p-3">
        <div class="flex min-w-0 items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
          <div class="flex min-w-0 flex-wrap items-center gap-2 max-[760px]:flex-col max-[760px]:items-stretch">
            <ui-select
              v-model="selectedCourseSpaceId"
              placeholder="选择课程空间（可选）"
              clearable
              class="w-[280px] max-[760px]:w-full"
            >
              <ui-option
                v-for="item in courseSpaces"
                :key="item.id"
                :label="buildCourseSpaceLabel(item)"
                :value="item.id"
              />
            </ui-select>

            <div class="flex min-h-9 items-center gap-2 rounded-[10px] bg-[#f5f7fa] px-3 text-[12px] text-[#6e6e73]">
              <ui-tooltip :content="modeTooltip">
                <span class="inline-flex cursor-help items-center">
                  <ui-switch
                    v-model="isOpenMode"
                    active-text="开放"
                    inactive-text="严格"
                    size="small"
                  />
                </span>
              </ui-tooltip>
              <span class="whitespace-nowrap">{{ currentModeText }}</span>
            </div>
          </div>

          <span class="min-w-0 truncate text-[12px] text-[#909399]">
            {{ selectedSpaceSummary }}
          </span>
        </div>

        <ui-input
          v-model="userInput"
          type="textarea"
          :rows="3"
          resize="none"
          placeholder="输入你的问题，按 Ctrl + Enter 发送"
          @keyup.enter.ctrl="sendMessage"
        />

        <div class="flex items-center justify-between gap-3 text-[12px] text-[#909399] max-[640px]:items-stretch max-[640px]:flex-col">
          <span>{{ modeSummaryText }}</span>
          <ui-button
            type="primary"
            :disabled="!userInput.trim() || isTyping"
            :loading="isTyping"
            class="max-[640px]:w-full"
            @click="sendMessage"
          >
            发送
          </ui-button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.assistant-markdown {
  color: #202124;
  font-size: 14px;
  line-height: 1.72;
  overflow-wrap: anywhere;
}

.assistant-markdown :deep(p) {
  margin: 0 0 8px;
}

.assistant-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.assistant-markdown :deep(h1),
.assistant-markdown :deep(h2),
.assistant-markdown :deep(h3),
.assistant-markdown :deep(h4) {
  margin: 12px 0 8px;
  color: #111827;
  font-weight: 700;
  line-height: 1.35;
}

.assistant-markdown :deep(h1) {
  font-size: 18px;
}

.assistant-markdown :deep(h2) {
  font-size: 16px;
}

.assistant-markdown :deep(h3),
.assistant-markdown :deep(h4) {
  font-size: 15px;
}

.assistant-markdown :deep(ul),
.assistant-markdown :deep(ol) {
  margin: 8px 0;
  padding-left: 22px;
}

.assistant-markdown :deep(li) {
  margin: 3px 0;
}

.assistant-markdown :deep(blockquote) {
  margin: 10px 0;
  padding: 9px 12px;
  border-left: 3px solid #60a5fa;
  border-radius: 8px;
  background: rgba(96, 165, 250, 0.1);
  color: #475569;
}

.assistant-markdown :deep(a) {
  color: #0b63ce;
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-word;
}

.assistant-markdown :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 10px 0;
  overflow-x: auto;
  border-collapse: collapse;
}

.assistant-markdown :deep(th),
.assistant-markdown :deep(td) {
  padding: 7px 9px;
  border: 1px solid #d8dee8;
  white-space: nowrap;
}

.assistant-markdown :deep(th) {
  background: #eef3f8;
  color: #0f172a;
  font-weight: 700;
}

.assistant-markdown :deep(:not(pre) > code) {
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(15, 23, 42, 0.08);
  color: #1d4ed8;
  font-family: Consolas, "Courier New", monospace;
  font-size: 0.92em;
  word-break: break-word;
}

.assistant-markdown :deep(.markdown-code-block) {
  max-width: 100%;
  margin: 10px 0;
  padding: 0;
  overflow-x: auto;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  background: #0f172a;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.assistant-markdown :deep(.markdown-code-block code) {
  display: block;
  min-width: max-content;
  padding: 12px 14px;
  background: transparent;
  color: #e5edf7;
  font-family: Consolas, "SFMono-Regular", "Liberation Mono", Menlo, monospace;
  font-size: 13px;
  line-height: 1.62;
  overflow-wrap: normal;
  tab-size: 2;
  white-space: pre;
}

.assistant-markdown :deep(.hljs-keyword),
.assistant-markdown :deep(.hljs-selector-tag),
.assistant-markdown :deep(.hljs-built_in),
.assistant-markdown :deep(.hljs-type) {
  color: #93c5fd;
}

.assistant-markdown :deep(.hljs-string),
.assistant-markdown :deep(.hljs-regexp),
.assistant-markdown :deep(.hljs-attr),
.assistant-markdown :deep(.hljs-symbol) {
  color: #86efac;
}

.assistant-markdown :deep(.hljs-title),
.assistant-markdown :deep(.hljs-name),
.assistant-markdown :deep(.hljs-section),
.assistant-markdown :deep(.hljs-function) {
  color: #facc15;
}

.assistant-markdown :deep(.hljs-number),
.assistant-markdown :deep(.hljs-literal),
.assistant-markdown :deep(.hljs-variable),
.assistant-markdown :deep(.hljs-template-variable) {
  color: #fca5a5;
}

.assistant-markdown :deep(.hljs-comment),
.assistant-markdown :deep(.hljs-quote) {
  color: #94a3b8;
}

.assistant-markdown :deep(.hljs-meta),
.assistant-markdown :deep(.hljs-operator),
.assistant-markdown :deep(.hljs-punctuation) {
  color: #c4b5fd;
}

@media (max-width: 640px) {
  .assistant-markdown {
    font-size: 13.5px;
  }

  .assistant-markdown :deep(.markdown-code-block code) {
    padding: 10px 12px;
    font-size: 12.5px;
  }
}
</style>
