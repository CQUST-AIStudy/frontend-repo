<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import { renderSafeMarkdown } from '@/utils/safeHtml'
import { getKnowledgeBases } from '../../api/rag'
import { formatStudentAssistantError, useStudentAiChatStore } from '../../store/studentAiChat'
import { buildQuickPromptPool, samplePrompts } from '@/utils/aiQuickPrompts'
import {
  ChatDotRound,
  Close,
  Delete,
  Document,
  Menu,
  Notebook,
  Plus,
  Reading,
  Search,
  Warning
} from '@/components/ui/icons'

const chatStore = useStudentAiChatStore()
const {
  userInput,
  isTyping,
  isAnyTyping,
  selectedCourseSpaceId,
  assistantMode,
  assistantNotice
} = storeToRefs(chatStore)

const chatContainer = ref(null)
const assistantInputRef = ref(null)
const historyQuery = ref('')
const historyVisible = ref(true)
const courseSpaces = ref([])

const modeCards = [
  {
    value: 'ai',
    title: 'AI 聊天',
    desc: '自由问答',
    icon: ChatDotRound,
    tone: 'green'
  },
  {
    value: 'rag',
    title: 'RAG 问答',
    desc: '知识库问答',
    icon: Reading,
    tone: 'purple'
  }
]

const messages = computed(() => chatStore.messages)
const conversations = computed(() => chatStore.sortedConversations)
const effectiveWebEnabled = computed(() => chatStore.effectiveWebEnabled)
const activeConversation = computed(() => chatStore.activeConversation)

const visibleMessages = computed(() => {
  return messages.value.filter((message) => {
    return message.role !== 'ai' || message.content || message.citations?.length
  })
})

const filteredConversations = computed(() => {
  const query = historyQuery.value.trim().toLowerCase()
  if (!query) return conversations.value
  return conversations.value.filter((item) => {
    const haystack = [
      item.title,
      item.messages?.map((message) => message.content).join(' ')
    ].join(' ').toLowerCase()
    return haystack.includes(query)
  })
})

const showPromptSuggestions = computed(() => {
  return !isTyping.value && !messages.value.some((message) => message.role === 'user')
})

// 预制询问：C 语言 + 数据结构杂糅主题 40 条候选池，每次空会话随机抽取 4 条
const quickPromptPool = computed(() => buildQuickPromptPool('student'))
const displayedQuickPrompts = ref([])

function refreshQuickPrompts() {
  displayedQuickPrompts.value = samplePrompts(quickPromptPool.value, 4)
}

watch(
  showPromptSuggestions,
  () => {
    if (showPromptSuggestions.value) refreshQuickPrompts()
  },
  { immediate: true }
)

const showTypingHint = computed(() => {
  const lastMessage = messages.value[messages.value.length - 1]
  return isTyping.value && lastMessage?.role === 'ai' && !lastMessage.content && !lastMessage.citations?.length
})

const canSend = computed(() => {
  if (!userInput.value.trim() || isTyping.value) return false
  if (assistantMode.value === 'rag' && !selectedCourseSpaceId.value) return false
  return true
})

const canClearConversation = computed(() => {
  return !isTyping.value && (messages.value.length > 0 || !!userInput.value.trim())
})

const currentModeCard = computed(() =>
  modeCards.find((card) => card.value === assistantMode.value) || modeCards[0]
)

const modeSummaryText = computed(() => {
  if (assistantMode.value === 'web') return '当前模式：联网搜索 + AI 回答'
  if (assistantMode.value === 'rag') {
    return effectiveWebEnabled.value
      ? '当前模式：RAG 问答 + 联网补充'
      : '当前模式：RAG 知识库问答'
  }
  return effectiveWebEnabled.value
    ? '当前模式：AI 聊天 + 联网增强'
    : '当前模式：正常 AI 聊天'
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

function formatConversationTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return `${date.getMonth() + 1}-${date.getDate()}`
}

function modeLabel(mode) {
  if (mode === 'rag') return 'RAG'
  if (mode === 'web') return '联网'
  return 'AI'
}

function lastMessagePreview(conversation) {
  if (chatStore.isConversationTyping(conversation.id)) return '正在生成...'
  const last = [...(conversation.messages || [])].reverse().find((message) => message.content)
  return last?.content || '暂无消息'
}

function conversationStatusText(conversation) {
  return chatStore.isConversationTyping(conversation.id)
    ? '正在生成'
    : formatConversationTime(conversation.updatedAt)
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
    if (!selectedCourseSpaceId.value && spaces.length > 0 && assistantMode.value === 'rag') {
      chatStore.setCourseSpace(spaces[0].id)
    }
  } catch (error) {
    const friendlyMessage = formatStudentAssistantError(error?.message, assistantMode.value)
    chatStore.setAssistantNotice(friendlyMessage)
    uiMessage.warning(friendlyMessage)
    courseSpaces.value = []
  }
}

async function sendMessage() {
  if (!canSend.value && assistantMode.value === 'rag' && !selectedCourseSpaceId.value) {
    uiMessage.warning('请先选择课程空间，再使用 RAG 模式提问。')
    return
  }
  await chatStore.sendMessage()
  resetInputHeight()
  await scrollToBottom()
}

function stopGenerating() {
  chatStore.stopGeneration()
}

function autoResize() {
  const textarea = assistantInputRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  const next = Math.min(160, textarea.scrollHeight)
  textarea.style.height = `${next}px`
}

function resetInputHeight() {
  const textarea = assistantInputRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

function useQuickPrompt(prompt) {
  chatStore.setInput(prompt)
  nextTick(() => {
    autoResize()
    assistantInputRef.value?.focus()
  })
}

function selectMode(mode) {
  chatStore.setAssistantMode(mode)
}

function toggleAssistantMode() {
  selectMode(assistantMode.value === 'ai' ? 'rag' : 'ai')
}

function toggleWeb(value) {
  chatStore.setWebEnabled(value)
}

function newConversation() {
  chatStore.createConversation()
  scrollToBottom()
}

function switchConversation(id) {
  chatStore.switchConversation(id)
  scrollToBottom()
}

async function clearConversation() {
  if (!canClearConversation.value) return
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

async function clearAllConversations() {
  if (isAnyTyping.value || conversations.value.length <= 1) return
  try {
    await messageBox.confirm('清空所有本地历史聊天记录？该操作不可恢复。', '提示', {
      confirmButtonText: '全部清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
    chatStore.clearAllConversations()
    await scrollToBottom()
  } catch {
    // 用户取消清空。
  }
}

async function removeConversation(id) {
  if (!id) return
  try {
    await messageBox.confirm('删除该会话及其聊天记录？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    chatStore.deleteConversation(id)
    await scrollToBottom()
  } catch {
    // 用户取消删除。
  }
}

function onKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault()
    sendMessage()
  }
}

watch(messages, scrollToBottom, { deep: true })
watch(isTyping, scrollToBottom)
watch(userInput, () => {
  nextTick(autoResize)
})
watch(selectedCourseSpaceId, (value) => {
  chatStore.setCourseSpace(value)
})

onMounted(() => {
  chatStore.ensureActiveConversation()
  fetchCourseSpaces()
  autoResize()
  scrollToBottom()
})
</script>

<template>
  <div class="assistant-shell">
    <aside
      class="history-panel"
      :class="{ 'history-panel--hidden': !historyVisible }"
    >
      <div class="history-head">
        <div>
          <h3>历史聊天</h3>
          <p>{{ conversations.length }} 个本地会话</p>
        </div>
        <button
          type="button"
          class="icon-button"
          title="收起历史"
          @click="historyVisible = false"
        >
          <Close />
        </button>
      </div>

      <div class="history-search">
        <Search />
        <input
          v-model="historyQuery"
          type="search"
          placeholder="搜索历史记录"
        />
      </div>

      <button type="button" class="new-chat-button" @click="newConversation">
        <Plus />
        新建对话
      </button>

      <div class="history-list">
        <button
          v-for="item in filteredConversations"
          :key="item.id"
          type="button"
          class="history-item"
          :class="{ 'history-item--active': item.id === activeConversation?.id }"
          @click="switchConversation(item.id)"
        >
          <span class="history-title-row">
            <span class="history-title">{{ item.title }}</span>
            <button
              type="button"
              class="history-remove"
              title="删除该会话"
              @click.stop="removeConversation(item.id)"
            >
              <Delete />
            </button>
          </span>
          <span class="history-preview">{{ lastMessagePreview(item) }}</span>
          <span class="history-meta">
            <span>{{ modeLabel(item.mode) }}{{ item.webEnabled ? ' · 联网' : '' }}</span>
            <span
              :class="{ 'history-status--typing': chatStore.isConversationTyping(item.id) }"
            >
              {{ conversationStatusText(item) }}
            </span>
          </span>
        </button>

        <div v-if="!filteredConversations.length" class="history-empty">
          未找到历史记录
        </div>
      </div>

      <button
        type="button"
        class="clear-all-button"
        :disabled="isAnyTyping || conversations.length <= 1"
        @click="clearAllConversations"
      >
        <Delete />
        清空所有记录
      </button>
    </aside>

    <section class="assistant-main">
      <ui-alert
        v-if="assistantNotice"
        class="assistant-alert"
        type="warning"
        :closable="false"
        :title="assistantNotice"
        show-icon
      />

      <header class="assistant-header">
        <div class="header-title">
          <button
            v-if="!historyVisible"
            type="button"
            class="icon-button history-toggle"
            title="展开历史"
            @click="historyVisible = true"
          >
            <Menu />
          </button>
          <div class="min-w-0">
            <h2>AI 学习助手</h2>
            <p>{{ modeSummaryText }}，聊天记录会自动保存到本地。</p>
          </div>
        </div>
        <ui-button
          type="button"
          :disabled="!canClearConversation"
          class="clear-button"
          @click="clearConversation"
        >
          清空当前对话
        </ui-button>
      </header>

      <div ref="chatContainer" class="chat-panel">
        <div
          v-if="showPromptSuggestions"
          class="prompt-suggestions"
        >
          <div class="suggestion-copy">
            <h3>从一个数据结构问题开始</h3>
            <p>选择一个提示词开始，或直接输入你的问题。RAG 模式会优先使用课程空间资料。</p>
          </div>

          <div class="prompt-grid">
            <button
              v-for="q in displayedQuickPrompts"
              :key="q.label"
              type="button"
              class="prompt-card"
              @click="useQuickPrompt(q.prompt)"
            >
              <strong>{{ q.label }}</strong>
              <span>{{ q.prompt }}</span>
            </button>
          </div>
        </div>

        <div
          v-for="(message, index) in visibleMessages"
          :key="message.id || index"
          class="message-row"
          :class="message.role === 'user' ? 'message-row--user' : 'message-row--ai'"
        >
          <div class="avatar">
            {{ message.role === 'user' ? '我' : 'AI' }}
          </div>
          <div class="message-main">
            <div class="message-meta">
              <strong>{{ message.role === 'user' ? '我' : 'AI 助手' }}</strong>
              <span>{{ message.time }}</span>
              <span v-if="message.role === 'ai' && message.usedWeb" class="web-badge">联网</span>
              <span
                v-if="message.role === 'ai' && message.coverageScore > 0"
                class="coverage-badge"
              >
                引用覆盖率 {{ Math.round(message.coverageScore * 100) }}%
              </span>
            </div>
            <div class="message-bubble">
              <p v-if="message.role === 'user'" class="plain-message">
                {{ message.content }}
              </p>
              <div
                v-else
                class="assistant-markdown"
                v-html="renderSafeMarkdown(message.content)"
              />

              <div
                v-if="message.citations && message.citations.length"
                class="source-list"
              >
                <div
                  v-for="cite in message.citations"
                  :key="`${message.id || index}-${cite.index}`"
                  class="source-item"
                >
                  <Document />
                  <div class="source-copy">
                    <div class="source-head">
                      <span
                        class="source-tag"
                        :class="(cite.source === 'web' || cite.url) ? 'source-tag--web' : 'source-tag--kb'"
                      >
                        {{ (cite.source === 'web' || cite.url) ? '联网' : '知识库' }}
                      </span>
                      <a
                        v-if="cite.url"
                        :href="cite.url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        [{{ cite.index }}] {{ cite.docName || '联网资料' }}
                      </a>
                      <span v-else>[{{ cite.index }}] {{ cite.docName || '引用资料' }}</span>
                    </div>
                    <small v-if="cite.chapterPath || cite.pageRange">
                      {{ [cite.chapterPath, cite.pageRange].filter(Boolean).join(' | ') }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showTypingHint" class="message-row message-row--ai">
          <div class="avatar">AI</div>
          <div class="message-main">
            <div class="message-meta">
              <strong>AI 助手</strong>
              <span>正在生成</span>
            </div>
            <div class="message-bubble typing-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <footer class="composer">
        <div class="composer-toolbar">
          <div v-if="assistantMode === 'rag'" class="course-select-wrap">
            <Notebook />
            <ui-select
              v-model="selectedCourseSpaceId"
              placeholder="选择课程空间"
              class="course-select"
            >
              <ui-option
                v-for="item in courseSpaces"
                :key="item.id"
                :label="buildCourseSpaceLabel(item)"
                :value="item.id"
              />
            </ui-select>
          </div>

          <div class="toolbar-actions">
            <button
              type="button"
              class="mode-toggle"
              :class="[`mode-toggle--${currentModeCard.tone}`, 'mode-toggle--active']"
              :title="`点击切换到 ${assistantMode === 'ai' ? 'RAG 问答' : 'AI 聊天'}`"
              @click="toggleAssistantMode"
            >
              <component :is="currentModeCard.icon" />
              <span>{{ currentModeCard.title }}</span>
            </button>

            <button
              type="button"
              class="web-button"
              :class="{ 'web-button--active': effectiveWebEnabled }"
              :disabled="assistantMode === 'web'"
              @click="toggleWeb(!effectiveWebEnabled)"
            >
              <Search />
              <span>联网搜索</span>
            </button>
          </div>
        </div>

        <textarea
          ref="assistantInputRef"
          v-model="userInput"
          class="assistant-input"
          placeholder="输入你的问题，Enter 发送，Shift + Enter 换行"
          @input="autoResize"
          @keydown="onKeyDown"
        ></textarea>

        <div class="composer-actions">
          <div class="composer-warning" :class="{ visible: assistantMode === 'rag' && !selectedCourseSpaceId }">
            <Warning />
            <span>RAG 模式需要先选择课程空间</span>
          </div>
          <ui-button
            v-if="isTyping"
            type="button"
            class="send-button stop-button"
            @click="stopGenerating"
          >
            停止生成
          </ui-button>
          <ui-button
            v-else
            type="primary"
            :disabled="!canSend"
            class="send-button"
            @click="sendMessage"
          >
            发送
          </ui-button>
        </div>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.assistant-shell {
  display: flex;
  height: 100%;
  min-height: 0;
  gap: 12px;
  overflow: hidden;
  color: #1d1d1f;
}

.history-panel {
  display: flex;
  width: 250px;
  min-width: 250px;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  border: 1px solid #e6eaf0;
  border-radius: 10px;
  background: #ffffff;
  padding: 14px;
  transition: width 0.2s ease, min-width 0.2s ease, opacity 0.2s ease;
}

.history-panel--hidden {
  width: 0;
  min-width: 0;
  padding: 0;
  border: 0;
  opacity: 0;
}

.history-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.history-head h3,
.assistant-header h2 {
  margin: 0;
  color: #1d1d1f;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.35;
}

.history-head p,
.assistant-header p {
  margin: 2px 0 0;
  color: #8b95a1;
  font-size: 12px;
  line-height: 1.5;
}

.icon-button {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  background: #fff;
  color: #667085;
  cursor: pointer;
}

.icon-button:hover {
  border-color: #bcd6ff;
  color: var(--app-primary);
}

.history-search {
  display: flex;
  height: 38px;
  align-items: center;
  gap: 8px;
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  padding: 0 10px;
  color: #8b95a1;
}

.history-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #1d1d1f;
  font-size: 13px;
}

.new-chat-button,
.clear-all-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #d7e6ff;
  border-radius: 8px;
  background: #f5f9ff;
  color: var(--app-primary);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.history-list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  min-height: 78px;
  flex-direction: column;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  padding: 9px 10px;
  text-align: left;
  cursor: pointer;
}

.history-item:hover {
  background: #f7f9fc;
}

.history-item--active {
  border-color: #cfe3ff;
  background: #eaf4ff;
}

.history-title,
.history-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.history-title {
  flex: 1;
  color: #1d1d1f;
  font-size: 13px;
  font-weight: 700;
}

.history-remove {
  display: inline-flex;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #9aa4b2;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.history-item:hover .history-remove,
.history-item--active .history-remove {
  opacity: 1;
}

.history-remove:hover {
  background: #ffe0dd;
  color: #d92d20;
}

.history-preview {
  color: #6e6e73;
  font-size: 12px;
}

.history-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #8b95a1;
  font-size: 11px;
}

.history-status--typing {
  color: var(--app-primary);
  font-weight: 700;
}

.history-empty {
  border: 1px dashed #d8dee8;
  border-radius: 8px;
  padding: 18px 10px;
  color: #8b95a1;
  text-align: center;
  font-size: 13px;
}

.clear-all-button {
  border-color: #ffe0dd;
  background: #fff7f6;
  color: #d92d20;
}

.clear-all-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.assistant-main {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e6eaf0;
  border-radius: 10px;
  background: #ffffff;
}

.assistant-alert {
  margin: 12px 12px 0;
}

.assistant-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e6eaf0;
  padding: 14px 18px;
}

.header-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.clear-button {
  min-height: 36px;
  border-radius: 8px;
  border-color: #e6eaf0;
  background: #fff;
  color: #606266;
  box-shadow: none;
}

.composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.mode-toggle,
.web-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  background: #fff;
  color: #4b5563;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.mode-toggle:hover,
.web-button:hover {
  border-color: #c7d2e0;
}

.mode-toggle--active.mode-toggle--green {
  border-color: #86efac;
  background: #f0fdf4;
  color: #16a34a;
}

.mode-toggle--active.mode-toggle--purple {
  border-color: #c4b5fd;
  background: #f5f3ff;
  color: #7c3aed;
}

.web-button--active {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #2563eb;
}

.web-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.course-select-wrap {
  display: flex;
  width: min(280px, 50%);
  align-items: center;
  gap: 8px;
  color: #7c3aed;
}

.course-select {
  width: 100%;
}

.chat-panel {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  padding: 18px;
  background:
    linear-gradient(180deg, rgba(248, 251, 255, 0.9) 0%, rgba(255, 255, 255, 0) 38%),
    #ffffff;
}

.prompt-suggestions {
  margin: auto;
  display: flex;
  width: min(860px, 100%);
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: 24px 0;
  text-align: center;
}

.suggestion-copy h3 {
  margin: 0;
  color: #1d1d1f;
  font-size: 24px;
  font-weight: 800;
}

.suggestion-copy p {
  max-width: 680px;
  margin: 10px 0 0;
  color: #6e6e73;
  font-size: 14px;
  line-height: 1.7;
}

.prompt-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.prompt-card {
  display: flex;
  min-height: 92px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  background: #fbfdff;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
}

.prompt-card:hover {
  border-color: rgba(194, 112, 62, 0.4);
  background: #f4f9ff;
}

.prompt-card strong {
  color: #1d1d1f;
  font-size: 15px;
}

.prompt-card span {
  margin-top: 10px;
  color: #6e6e73;
  font-size: 12px;
  line-height: 1.6;
}

.message-row {
  display: flex;
  gap: 10px;
}

.message-row--user {
  flex-direction: row-reverse;
}

.avatar {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--app-primary) 0%, #5856d6 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.message-row--user .avatar {
  background: #1f2937;
}

.message-main {
  display: flex;
  max-width: min(760px, 78%);
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.message-row--user .message-main {
  align-items: flex-end;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b95a1;
  font-size: 11px;
}

.message-meta strong {
  color: #4b5563;
}

.web-badge {
  border-radius: 999px;
  background: #dcfce7;
  color: #16a34a;
  padding: 2px 6px;
  font-weight: 700;
}

.coverage-badge {
  border-radius: 999px;
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 6px;
  font-weight: 700;
}

.message-bubble {
  min-width: 0;
  width: fit-content;
  max-width: 100%;
  border: 1px solid #e9edf3;
  border-radius: 12px;
  border-top-left-radius: 4px;
  background: #f8fafc;
  padding: 10px 12px;
  color: #202124;
  font-size: 14px;
  line-height: 1.65;
}

.message-row--user .message-bubble {
  border-color: var(--app-primary);
  border-top-left-radius: 12px;
  border-top-right-radius: 4px;
  background: var(--app-primary);
  color: #fff;
}

.plain-message {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  border-top: 1px solid rgba(126, 157, 183, 0.2);
  padding-top: 10px;
}

.source-item {
  display: flex;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.source-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.source-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.source-tag {
  flex: 0 0 auto;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11px;
  font-weight: 700;
}

.source-tag--web {
  background: #dcfce7;
  color: #16a34a;
}

.source-tag--kb {
  background: #ede9fe;
  color: #7c3aed;
}

.source-copy a {
  color: #0b63ce;
  text-decoration: none;
  word-break: break-word;
}

.source-copy a:hover {
  text-decoration: underline;
}

.source-copy small {
  color: #8b95a1;
}

.typing-bubble {
  display: inline-flex;
  min-width: 78px;
  gap: 5px;
}

.typing-bubble span {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #8ca0b3;
  animation: typing-bounce 0.8s infinite alternate;
}

.typing-bubble span:nth-child(2) {
  animation-delay: 120ms;
}

.typing-bubble span:nth-child(3) {
  animation-delay: 240ms;
}

.composer {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #e6eaf0;
  background: #fff;
  padding: 12px 14px;
}

.composer-summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #8b95a1;
  font-size: 12px;
}

.assistant-input {
  width: 100%;
  min-height: 92px;
  resize: none;
  border: 1px solid #d8dee8;
  border-radius: 8px;
  padding: 12px 14px;
  color: #1d1d1f;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
}

.assistant-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.composer-warning {
  display: inline-flex;
  visibility: hidden;
  align-items: center;
  gap: 6px;
  color: #d97706;
  font-size: 12px;
}

.composer-warning.visible {
  visibility: visible;
}

.send-button {
  min-width: 82px;
}

.stop-button {
  border-color: #ffe0dd;
  background: #fff7f6;
  color: #d92d20;
  box-shadow: none;
}

.stop-button:hover {
  background: #ffe0dd;
}

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
  border: 1px solid #d0d7de;
  border-radius: 10px;
  background: #f6f8fa;
  color: #24292f;
}

.assistant-markdown :deep(.markdown-code-block code) {
  display: block;
  min-width: max-content;
  padding: 12px 14px;
  background: transparent;
  color: inherit;
  font-family: Consolas, "SFMono-Regular", "Liberation Mono", Menlo, monospace;
  font-size: 13px;
  line-height: 1.62;
  overflow-wrap: normal;
  tab-size: 2;
  white-space: pre;
}

@keyframes typing-bounce {
  0% {
    opacity: 0.35;
    transform: translateY(0);
  }

  100% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

@media (max-width: 1080px) {
  .assistant-shell {
    position: relative;
  }

  .history-panel {
    position: absolute;
    inset: 0 auto 0 0;
    z-index: 20;
    box-shadow: 0 18px 42px rgba(22, 48, 79, 0.18);
  }

  .mode-grid {
    grid-template-columns: 1fr;
  }

  .mode-options {
    align-items: stretch;
    flex-direction: column;
  }

  .course-select-wrap {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .assistant-shell {
    gap: 0;
  }

  .assistant-header,
  .mode-panel,
  .composer {
    padding-left: 12px;
    padding-right: 12px;
  }

  .assistant-header {
    align-items: stretch;
    flex-direction: column;
  }

  .clear-button {
    width: 100%;
  }

  .chat-panel {
    padding: 14px 12px;
  }

  .prompt-grid {
    grid-template-columns: 1fr;
  }

  .message-main {
    max-width: calc(100% - 44px);
  }

  .composer-summary,
  .composer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .composer-warning {
    visibility: visible;
    min-height: 18px;
  }

  .send-button {
    width: 100%;
  }
}
</style>
