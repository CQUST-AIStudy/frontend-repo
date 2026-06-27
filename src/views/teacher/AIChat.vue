<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { messageBox } from '@/services/feedback'
import { useTeacherAiChatStore } from '../../store/teacherAiChat'
import { renderSafeMarkdown } from '@/utils/safeHtml'

const store = useTeacherAiChatStore()
const { messages, draft, loading, streaming } = storeToRefs(store)

const messagesRef = ref(null)
const textareaRef = ref(null)
const composerPlaceholder = '输入教学问题，例如：帮我给“图的遍历”设计一个 20 分钟课堂讲解结构。'

const suggestions = [
  '帮我设计一个“二叉树遍历”实验课的提问链路',
  '帮我生成“栈和队列”课堂讲解提纲',
  '帮我检索最近的 Transformer 教学应用论文',
  '帮我润色一段给学生的实验反馈'
]

const suggestionMeta = [
  { category: '实验设计', title: '搭建提问链路' },
  { category: '课堂讲解', title: '生成讲解提纲' },
  { category: '论文检索', title: '查找教学资料' },
  { category: '反馈润色', title: '优化学生反馈' }
]

const suggestionCards = computed(() =>
  suggestions.map((prompt, index) => ({
    prompt,
    ...(suggestionMeta[index] || { category: '教学助手', title: '快速提问' })
  }))
)

const statusText = computed(() => {
  if (loading.value) return '生成中'
  if (streaming.value) return '输出中'
  return '可继续提问'
})

const renderMarkdown = (text) => renderSafeMarkdown(text || '')

const lastAssistantPreview = computed(() => {
  const lastAssistant = [...messages.value].reverse().find(item => item.role === 'assistant' && item.content)
  if (!lastAssistant) return ''
  return lastAssistant.content.replace(/\s+/g, ' ').slice(0, 56)
})

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 140) + 'px'
}

function scrollToBottom() {
  nextTick(() => {
    if (!messagesRef.value) return
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

function applySuggestion(text) {
  store.setDraft(text)
  nextTick(autoResize)
}

async function clearConversation() {
  try {
    await messageBox.confirm('清空当前 AI 对话记录？', '提示', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
    store.clearMessages()
  } catch (error) {
    // User cancelled the confirmation dialog.
  }
}

async function send() {
  await store.sendMessage(draft.value)
  nextTick(autoResize)
}

function onKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}

watch(() => [messages.value.length, loading.value, streaming.value], scrollToBottom, { immediate: true })
onMounted(scrollToBottom)
</script>

<template>
  <div class="ai-chat-page">
    <section class="assistant-toolbar">
      <div class="toolbar-copy">
        <span class="toolbar-kicker">AI 助教</span>
        <h1>AI 教学对话助手</h1>
        <p>支持教学问答、论文检索、课程设计讨论。离开页面后请求会继续执行，返回本页可查看结果。</p>
      </div>

      <div class="toolbar-meta">
        <div class="meta-pill">
          <span>消息</span>
          <strong>{{ messages.length }}</strong>
        </div>
        <div class="meta-pill">
          <span>状态</span>
          <strong>{{ statusText }}</strong>
        </div>
        <UiButton
          class="clear-button"
          :disabled="loading || streaming || !messages.length"
          @click="clearConversation"
        >
          清空会话
        </UiButton>
      </div>
    </section>

    <section class="chat-workbench" :aria-busy="loading || streaming">
      <header class="chat-header">
        <div class="chat-title">
          <span class="status-dot" :class="{ active: loading || streaming }"></span>
          <div>
            <h2>教师端 AI 对话</h2>
            <p>{{ loading || streaming ? '正在生成回答，离开页面后也会继续处理。' : '可直接追问、续问或粘贴教学材料。' }}</p>
          </div>
        </div>
        <div class="session-summary">
          <span v-if="messages.length" class="session-tag">已保存本次会话</span>
          <span v-if="lastAssistantPreview" class="session-preview">{{ lastAssistantPreview }}</span>
        </div>
      </header>

      <div
        ref="messagesRef"
        class="messages-panel"
        :class="{ 'messages-panel--empty': !messages.length }"
      >
        <template v-if="messages.length">
          <div
            v-for="(msg, index) in messages"
            :key="`${msg.role}-${msg.createdAt || index}`"
            :class="['message-row', msg.role]"
          >
            <div class="message-avatar">
              <span>{{ msg.role === 'assistant' ? 'AI' : '我' }}</span>
            </div>
            <div class="message-main">
              <div class="message-meta">
                <strong>{{ msg.role === 'assistant' ? '教学助手' : '教师' }}</strong>
                <span>{{ msg.role === 'assistant' ? '回答' : '提问' }}</span>
              </div>
              <div class="message-bubble">
                <p v-if="msg.role === 'user'" class="plain-text">{{ msg.content }}</p>
                <div
                  v-else
                  class="markdown-body"
                  v-html="renderMarkdown(msg.content)"
                ></div>

                <div v-if="msg.papers?.length" class="papers-grid">
                  <a
                    v-for="(paper, paperIndex) in msg.papers"
                    :key="`${paper.link || paper.title}-${paperIndex}`"
                    :href="paper.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="paper-card"
                  >
                    <div class="paper-head">
                      <span>0{{ paperIndex + 1 }}</span>
                      <span>查看论文</span>
                    </div>
                    <strong>{{ paper.title }}</strong>
                    <p>{{ paper.authors || '作者信息暂缺' }}</p>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="message-row assistant pending-row">
            <div class="message-avatar">
              <span>AI</span>
            </div>
            <div class="message-main">
              <div class="message-meta">
                <strong>教学助手</strong>
                <span>处理中</span>
              </div>
              <div class="message-bubble pending-bubble">
                <div class="typing-line">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>正在整理答案与参考资料...</p>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="empty-workbench">
          <div class="empty-copy">
            <span>推荐提问</span>
            <h3>从一个具体教学问题开始</h3>
            <p>选择一个场景快速填入问题，也可以直接在底部输入框中粘贴材料或追问。</p>
          </div>

          <div class="suggestion-grid">
            <UiButton
              v-for="card in suggestionCards"
              :key="card.prompt"
              type="button"
              class="suggestion-card"
              @click="applySuggestion(card.prompt)"
            >
              <span class="suggestion-category">{{ card.category }}</span>
              <strong>{{ card.title }}</strong>
              <span class="suggestion-prompt">{{ card.prompt }}</span>
            </UiButton>
          </div>
        </div>
      </div>

      <div class="composer-panel">
        <div v-if="messages.length" class="quick-strip">
          <UiButton
            v-for="item in suggestions"
            :key="`quick-${item}`"
            type="button"
            class="quick-chip"
            @click="applySuggestion(item)"
          >
            {{ item }}
          </UiButton>
        </div>

        <div class="composer-box">
          <textarea
            ref="textareaRef"
            v-model="draft"
            rows="1"
            class="composer-textarea"
            :placeholder="composerPlaceholder"
            @keydown="onKeyDown"
            @input="autoResize"
          ></textarea>
          <div class="composer-actions">
            <span>Enter 发送，Shift+Enter 换行</span>
            <UiButton
              type="button"
              :disabled="!draft.trim() || loading || streaming"
              class="send-button"
              @click="send"
            >
              {{ loading || streaming ? '生成中...' : '发送问题' }}
            </UiButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ai-chat-page {
  display: flex;
  box-sizing: border-box;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  color: #1d1d1f;
}

.assistant-toolbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  backdrop-filter: blur(14px);
}

.toolbar-copy {
  min-width: 0;
}

.toolbar-kicker {
  display: none;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(194, 112, 62, 0.08);
  color: var(--app-primary);
  font-size: 12px;
  font-weight: 700;
}

.toolbar-copy h1 {
  margin: 0 0 3px;
  color: #0f172a;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0;
}

.toolbar-copy p {
  max-width: 760px;
  margin: 0;
  overflow: hidden;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.meta-pill {
  display: flex;
  min-width: auto;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #f8fafc;
}

.meta-pill span {
  color: #64748b;
  font-size: 12px;
}

.meta-pill strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.clear-button,
.send-button {
  border: none;
  background: linear-gradient(180deg, #d49068 0%, var(--app-primary) 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(194, 112, 62, 0.25);
}

.clear-button {
  min-width: 86px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  background: #e8f2ff;
  color: var(--app-primary);
  box-shadow: none;
}

.chat-workbench {
  display: flex;
  max-height: 100%;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.chat-header {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.chat-title {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 12px;
}

.status-dot {
  width: 10px;
  height: 10px;
  margin-top: 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #94a3b8;
  box-shadow: 0 0 0 6px rgba(148, 163, 184, 0.16);
}

.status-dot.active {
  background: #16a34a;
  box-shadow: 0 0 0 6px rgba(22, 163, 74, 0.14);
}

.chat-title h2 {
  margin: 0;
  color: #0f172a;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.35;
}

.chat-title p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.session-summary {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.session-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(194, 112, 62, 0.08);
  color: var(--app-primary);
  font-size: 12px;
  font-weight: 700;
}

.session-preview {
  max-width: 320px;
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.messages-panel {
  flex: 1;
  height: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px 12px;
  background:
    linear-gradient(180deg, rgba(248, 251, 255, 0.8) 0%, rgba(255, 255, 255, 0) 38%),
    #ffffff;
}

.messages-panel--empty {
  display: grid;
  align-items: center;
}

.message-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.message-row.user {
  flex-direction: row-reverse;
}

.message-avatar {
  display: flex;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #334155;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.message-row.assistant .message-avatar {
  background: linear-gradient(135deg, var(--app-primary) 0%, #5856d6 100%);
}

.message-row.user .message-avatar {
  background: linear-gradient(135deg, #0f172a 0%, #475569 100%);
}

.message-main {
  display: flex;
  max-width: min(820px, calc(100% - 52px));
  flex-direction: column;
  gap: 7px;
}

.message-row.user .message-main {
  align-items: flex-end;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
}

.message-row.user .message-meta {
  justify-content: flex-end;
}

.message-meta strong {
  color: #0f172a;
}

.message-bubble {
  width: fit-content;
  max-width: 100%;
  padding: 13px 15px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.message-row.user .message-bubble {
  border-color: rgba(194, 112, 62, 0.2);
  background: var(--app-primary);
  color: #fff;
}

.plain-text {
  margin: 0;
  line-height: 1.75;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.pending-bubble {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #64748b;
}

.pending-bubble p {
  margin: 0;
  font-size: 13px;
}

.typing-line {
  display: flex;
  gap: 6px;
}

.typing-line span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #60a5fa;
  animation: typing-bounce 0.8s infinite alternate;
}

.typing-line span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-line span:nth-child(3) {
  animation-delay: 0.4s;
}

.markdown-body {
  color: #1f2937;
  font-size: 14px;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.markdown-body :deep(p) {
  margin: 0 0 10px;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 10px 0;
  padding-left: 20px;
}

.markdown-body :deep(code) {
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.08);
  color: #1d4ed8;
  font-size: 13px;
}

.markdown-body :deep(pre) {
  margin: 12px 0;
  padding: 14px 16px;
  overflow-x: auto;
  border-radius: 8px;
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  color: #24292f;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background: transparent;
  color: inherit;
}

.markdown-body :deep(blockquote) {
  margin: 12px 0;
  padding: 10px 14px;
  border-left: 4px solid #60a5fa;
  border-radius: 10px;
  background: rgba(96, 165, 250, 0.08);
}

.markdown-body :deep(a) {
  color: #1d4ed8;
  word-break: break-all;
}

.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.paper-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(194, 112, 62, 0.16);
  border-radius: 14px;
  background: #f8fbff;
  text-decoration: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.paper-card:hover {
  border-color: rgba(194, 112, 62, 0.32);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.paper-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #64748b;
  font-size: 12px;
}

.paper-head span:first-child {
  color: var(--app-primary);
  font-weight: 800;
}

.paper-card strong {
  color: #0f172a;
  line-height: 1.5;
}

.paper-card p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.empty-workbench {
  display: grid;
  gap: 20px;
  padding: 24px 8px 28px;
}

.empty-copy {
  max-width: 680px;
}

.empty-copy span {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(107, 143, 107, 0.1);
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
}

.empty-copy h3 {
  margin: 12px 0 8px;
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
}

.empty-copy p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.suggestion-card {
  min-height: 132px;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #ffffff;
  color: #0f172a;
  text-align: left;
  white-space: normal;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
}

.suggestion-card:hover {
  border-color: rgba(194, 112, 62, 0.32);
  background: #f8fbff;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
}

.suggestion-category {
  color: var(--app-primary);
  font-size: 12px;
  font-weight: 800;
}

.suggestion-card strong {
  color: #0f172a;
  font-size: 15px;
  line-height: 1.4;
}

.suggestion-prompt {
  color: #64748b;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.55;
  white-space: normal;
}

.composer-panel {
  flex: 0 0 auto;
  padding: 0 18px 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 26%);
}

.quick-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 2px 12px;
}

.quick-chip {
  flex: 0 0 auto;
  min-height: 32px;
  padding: 7px 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  box-shadow: none;
}

.quick-chip:hover {
  border-color: rgba(194, 112, 62, 0.28);
  color: var(--app-primary);
}

.composer-box {
  padding: 13px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.composer-textarea {
  width: 100%;
  min-height: 42px;
  max-height: 140px;
  resize: none;
  border: none;
  background: transparent;
  color: #0f172a;
  font-size: 15px;
  line-height: 1.65;
  outline: none;
}

.composer-textarea::placeholder {
  color: #94a3b8;
}

.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.composer-actions span {
  color: #64748b;
  font-size: 12px;
}

.send-button {
  min-width: 108px;
  border-radius: 999px;
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

@media (max-width: 1200px) {
  .suggestion-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .assistant-toolbar,
  .chat-header {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-meta {
    width: 100%;
    flex-wrap: wrap;
  }

  .meta-pill {
    flex: 1 1 120px;
  }

  .clear-button {
    flex: 1 1 160px;
  }

  .session-summary {
    align-items: flex-start;
  }

  .session-preview {
    max-width: 100%;
    text-align: left;
  }
}

@media (max-width: 640px) {
  .ai-chat-page {
    gap: 12px;
  }

  .assistant-toolbar {
    padding: 16px;
    border-radius: 18px;
  }

  .toolbar-copy h1 {
    font-size: 20px;
  }

  .chat-workbench {
    min-height: 0;
    border-radius: 18px;
  }

  .chat-header {
    padding: 14px 16px;
  }

  .messages-panel {
    padding: 16px 14px 10px;
  }

  .message-avatar {
    width: 30px;
    height: 30px;
    border-radius: 10px;
  }

  .message-main {
    max-width: calc(100% - 42px);
  }

  .message-bubble {
    padding: 12px 13px;
    border-radius: 14px;
  }

  .empty-workbench {
    padding: 18px 0 24px;
  }

  .empty-copy h3 {
    font-size: 21px;
  }

  .suggestion-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-card {
    min-height: 112px;
  }

  .composer-panel {
    padding: 0 12px 12px;
  }

  .composer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .send-button {
    width: 100%;
  }
}
</style>
