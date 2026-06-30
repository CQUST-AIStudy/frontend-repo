import { defineStore } from 'pinia'
import { message as uiMessage } from '@/services/feedback'
import { normalizeSourcesForDisplay, streamAssistantChat } from '../api/rag'

const MAX_CONVERSATIONS = 40
const MAX_MESSAGES = 120
const MAX_HISTORY_MESSAGES = 10
const DEFAULT_MODE = 'ai'

function nowIso() {
  return new Date().toISOString()
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createTimeLabel() {
  return new Date().toLocaleTimeString()
}

function normalizeMode(mode) {
  return ['ai', 'rag', 'web'].includes(mode) ? mode : DEFAULT_MODE
}

function buildConversation(seed = {}) {
  const timestamp = nowIso()
  const mode = normalizeMode(seed.mode)
  return {
    id: seed.id || createId('conversation'),
    title: seed.title || '新的对话',
    messages: Array.isArray(seed.messages) ? seed.messages.slice(-MAX_MESSAGES) : [],
    mode,
    webEnabled: mode === 'web' ? true : !!seed.webEnabled,
    selectedCourseSpaceId: seed.selectedCourseSpaceId || null,
    serverConversationId: seed.serverConversationId || null,
    createdAt: seed.createdAt || timestamp,
    updatedAt: seed.updatedAt || timestamp,
  }
}

function buildTitle(text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  if (!normalized) return '新的对话'
  return normalized.length > 22 ? `${normalized.slice(0, 22)}...` : normalized
}

function sortedConversations(conversations) {
  return [...conversations].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
}

function trimConversations(conversations) {
  return sortedConversations(conversations).slice(0, MAX_CONVERSATIONS)
}

function normalizeHistory(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message.role === 'user' || message.role === 'ai')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role === 'ai' ? 'assistant' : 'user',
      content: String(message.content || '').slice(0, 8000)
    }))
    .filter((message) => message.content.trim())
}

function normalizeLegacyState(state) {
  if (state.conversations?.length) return state
  if (!state.messages?.length && !state.userInput) return state
  const conversation = buildConversation({
    title: state.messages?.find((message) => message.role === 'user')?.content
      ? buildTitle(state.messages.find((message) => message.role === 'user').content)
      : '历史对话',
    messages: state.messages || [],
    mode: state.selectedCourseSpaceId ? 'rag' : 'ai',
    webEnabled: !!state.isOpenMode,
    selectedCourseSpaceId: state.selectedCourseSpaceId || null,
  })
  return {
    ...state,
    conversations: [conversation],
    activeConversationId: conversation.id,
    assistantMode: conversation.mode,
    webEnabled: conversation.webEnabled,
    selectedCourseSpaceId: conversation.selectedCourseSpaceId,
  }
}

export function formatStudentAssistantError(message, mode) {
  const raw = String(message || '')
  const isRagMode = mode === 'rag'
  if (raw.includes('DASHSCOPE_API_KEY')) {
    return '后端生成模型未配置，请联系管理员配置 DASHSCOPE_API_KEY。'
  }
  if (raw.includes('TAVILY_API_KEY')) {
    return '联网检索服务未配置，请联系管理员配置 TAVILY_API_KEY。'
  }
  if (raw.includes('RAG 生成失败') || raw.includes('生成模型') || raw.includes('DashScope')) {
    return 'AI 生成失败，请稍后重试。'
  }
  if (raw.includes('RAG 模式需要选择课程空间')) {
    return '请先选择课程空间，再使用 RAG 模式提问。'
  }
  if (raw.includes('timeout') || raw.includes('timed out') || raw.includes('ReadTimeout')) {
    return isRagMode
      ? '资料检索已完成，但 AI 响应超时，请稍后重试。'
      : 'AI 响应超时，请稍后重试。'
  }
  if (raw.includes('暂无可用知识库') || raw.includes('知识库不存在') || raw.includes('course space')) {
    return '当前没有可访问的课程空间，暂时无法使用 RAG 问答。'
  }
  if (raw.includes('401') || raw.includes('Missing Bearer token') || raw.includes('Invalid Bearer token')) {
    return '当前登录状态无效，AI 助手暂不可用。'
  }
  if (raw.includes('403')) {
    return isRagMode ? '当前账号无权使用该课程空间。' : '当前账号无权使用 AI 助手。'
  }
  return isRagMode ? 'RAG 问答暂时不可用。' : 'AI 助手暂时不可用。'
}

export const useStudentAiChatStore = defineStore('studentAiChat', {
  state: () => ({
    conversations: [],
    activeConversationId: null,
    userInput: '',
    streamingConversationIds: {},
    abortControllers: {},
    assistantMode: DEFAULT_MODE,
    webEnabled: false,
    selectedCourseSpaceId: null,
    assistantNotice: '',
  }),
  persist: {
    key: 'student_ai_chat',
    storage: localStorage,
    paths: [
      'conversations',
      'activeConversationId',
      'userInput',
      'assistantMode',
      'webEnabled',
      'selectedCourseSpaceId'
    ],
    afterRestore: ({ store }) => {
      const restored = normalizeLegacyState(store.$state)
      store.$patch(restored)
      store.ensureActiveConversation()
    }
  },
  getters: {
    activeConversation(state) {
      return state.conversations.find((item) => item.id === state.activeConversationId) || null
    },
    messages() {
      return this.activeConversation?.messages || []
    },
    sortedConversations(state) {
      return sortedConversations(state.conversations)
    },
    currentMode(state) {
      return normalizeMode(state.assistantMode)
    },
    effectiveWebEnabled(state) {
      return state.assistantMode === 'web' || !!state.webEnabled
    },
    isConversationTyping(state) {
      return (conversationId) => !!conversationId && !!state.streamingConversationIds?.[conversationId]
    },
    isAnyTyping(state) {
      return Object.values(state.streamingConversationIds || {}).some(Boolean)
    },
    isTyping() {
      return this.isConversationTyping(this.activeConversationId)
    },
  },
  actions: {
    ensureActiveConversation() {
      if (this.activeConversation) return this.activeConversation
      const conversation = buildConversation({
        mode: this.assistantMode,
        webEnabled: this.effectiveWebEnabled,
        selectedCourseSpaceId: this.selectedCourseSpaceId,
      })
      this.conversations = [conversation, ...this.conversations]
      this.activeConversationId = conversation.id
      return conversation
    },

    touchConversation(id, patch = {}) {
      const index = this.conversations.findIndex((item) => item.id === id)
      if (index < 0) return null
      const current = this.conversations[index]
      const next = {
        ...current,
        ...patch,
        messages: patch.messages ? patch.messages.slice(-MAX_MESSAGES) : current.messages,
        updatedAt: nowIso(),
      }
      this.conversations[index] = next
      this.conversations = trimConversations(this.conversations)
      return next
    },

    setConversationTyping(id, value) {
      if (!id) return
      const next = { ...this.streamingConversationIds }
      if (value) {
        next[id] = true
      } else {
        delete next[id]
      }
      this.streamingConversationIds = next
    },

    setInput(value) {
      this.userInput = value || ''
    },

    setAssistantMode(mode) {
      const normalized = normalizeMode(mode)
      this.assistantMode = normalized
      if (normalized === 'web') {
        this.webEnabled = true
      }
      this.ensureActiveConversation()
      this.touchConversation(this.activeConversationId, {
        mode: normalized,
        webEnabled: normalized === 'web' ? true : this.webEnabled,
        selectedCourseSpaceId: this.selectedCourseSpaceId,
      })
    },

    setWebEnabled(value) {
      this.webEnabled = this.assistantMode === 'web' ? true : !!value
      this.ensureActiveConversation()
      this.touchConversation(this.activeConversationId, {
        webEnabled: this.webEnabled,
      })
    },

    setCourseSpace(value) {
      this.selectedCourseSpaceId = value || null
      this.ensureActiveConversation()
      this.touchConversation(this.activeConversationId, {
        selectedCourseSpaceId: this.selectedCourseSpaceId,
      })
    },

    setAssistantNotice(value) {
      this.assistantNotice = value || ''
    },

    createConversation(seed = {}) {
      const conversation = buildConversation({
        mode: seed.mode || this.assistantMode,
        webEnabled: seed.webEnabled ?? this.effectiveWebEnabled,
        selectedCourseSpaceId: seed.selectedCourseSpaceId ?? this.selectedCourseSpaceId,
        ...seed,
      })
      this.conversations = trimConversations([conversation, ...this.conversations])
      this.activeConversationId = conversation.id
      this.assistantMode = conversation.mode
      this.webEnabled = conversation.mode === 'web' ? true : !!conversation.webEnabled
      this.selectedCourseSpaceId = conversation.selectedCourseSpaceId || null
      this.userInput = ''
      this.assistantNotice = ''
      return conversation
    },

    switchConversation(id) {
      const conversation = this.conversations.find((item) => item.id === id)
      if (!conversation) return
      this.activeConversationId = conversation.id
      this.assistantMode = normalizeMode(conversation.mode)
      this.webEnabled = this.assistantMode === 'web' ? true : !!conversation.webEnabled
      this.selectedCourseSpaceId = conversation.selectedCourseSpaceId || null
      this.userInput = ''
      this.assistantNotice = ''
    },

    clearMessages() {
      const conversation = this.ensureActiveConversation()
      if (this.isConversationTyping(conversation.id)) return
      this.touchConversation(conversation.id, {
        title: '新的对话',
        messages: [],
        serverConversationId: null,
      })
      this.userInput = ''
      this.setConversationTyping(conversation.id, false)
      this.assistantNotice = ''
    },

    clearAllConversations() {
      if (this.isAnyTyping) return
      const conversation = buildConversation({
        mode: DEFAULT_MODE,
        webEnabled: false,
        selectedCourseSpaceId: null,
      })
      this.conversations = [conversation]
      this.activeConversationId = conversation.id
      this.assistantMode = DEFAULT_MODE
      this.webEnabled = false
      this.selectedCourseSpaceId = null
      this.userInput = ''
      this.streamingConversationIds = {}
      this.assistantNotice = ''
    },

    updateAssistantMessageInConversation(conversationId, id, patch) {
      const conversation = this.conversations.find((item) => item.id === conversationId)
      if (!conversation) return
      const index = conversation.messages.findIndex((message) => message.id === id)
      if (index < 0) return
      const messages = [...conversation.messages]
      messages[index] = {
        ...messages[index],
        ...patch
      }
      this.touchConversation(conversation.id, { messages })
    },

    appendAssistantContentInConversation(conversationId, id, content) {
      if (!content) return
      const conversation = this.conversations.find((item) => item.id === conversationId)
      if (!conversation) return
      const index = conversation.messages.findIndex((message) => message.id === id)
      if (index < 0) return
      const messages = [...conversation.messages]
      messages[index] = {
        ...messages[index],
        content: `${messages[index].content || ''}${content}`
      }
      this.touchConversation(conversation.id, { messages })
    },

    updateAssistantMessage(id, patch) {
      this.updateAssistantMessageInConversation(this.activeConversationId, id, patch)
    },

    appendAssistantContent(id, content) {
      this.appendAssistantContentInConversation(this.activeConversationId, id, content)
    },

    buildAssistantPayload(text, conversation, userMessageId) {
      const mode = this.currentMode
      const enableWebSearch = mode === 'web' || this.webEnabled
      const history = normalizeHistory(
        conversation.messages.filter((message) => message.id !== userMessageId)
      )
      return {
        query: text,
        mode,
        enableWebSearch,
        knowledgeBaseIds: mode === 'rag' && this.selectedCourseSpaceId
          ? [String(this.selectedCourseSpaceId)]
          : [],
        conversationId: conversation.serverConversationId || null,
        history,
        options: {
          topK: 10,
          rerankTopN: 3,
          scoreThreshold: 0,
          enableRerank: true,
          temperature: 0.7,
          maxTokens: 1024,
        },
      }
    },

    async sendMessage() {
      const text = String(this.userInput || '').trim()
      if (!text) return

      const mode = this.currentMode
      if (mode === 'rag' && !this.selectedCourseSpaceId) {
        const tip = '请先选择课程空间，再使用 RAG 模式提问。'
        this.assistantNotice = tip
        uiMessage.warning(tip)
        return
      }

      this.assistantNotice = ''
      const conversation = this.ensureActiveConversation()
      const conversationId = conversation.id
      if (this.isConversationTyping(conversationId)) return

      const userMessage = {
        id: createId('user'),
        role: 'user',
        content: text,
        time: createTimeLabel(),
        mode,
        webEnabled: this.effectiveWebEnabled,
      }
      const assistantId = createId('ai')
      const assistantMessage = {
        id: assistantId,
        role: 'ai',
        content: '',
        time: createTimeLabel(),
        citations: [],
        mode,
        webEnabled: this.effectiveWebEnabled,
        usedWeb: false,
        effectiveMode: mode,
      }
      const isFirstUserMessage = !conversation.messages.some((message) => message.role === 'user')
      const messages = [...conversation.messages, userMessage, assistantMessage]
      this.touchConversation(conversation.id, {
        title: isFirstUserMessage ? buildTitle(text) : conversation.title,
        mode,
        webEnabled: this.effectiveWebEnabled,
        selectedCourseSpaceId: this.selectedCourseSpaceId,
        messages,
      })
      this.userInput = ''
      this.setConversationTyping(conversationId, true)

      const active = this.conversations.find((item) => item.id === conversationId) || conversation
      const payload = this.buildAssistantPayload(text, active, userMessage.id)

      await this.streamAssistantResponse({ conversationId, assistantId, payload, mode })
    },

    // 共用的流式生成逻辑：供 sendMessage 与 retryAssistantMessage 复用。
    async streamAssistantResponse({ conversationId, assistantId, payload, mode }) {
      const controller = new AbortController()
      this.abortControllers = { ...this.abortControllers, [conversationId]: controller }
      try {
        await streamAssistantChat(payload, {
          signal: controller.signal,
          onRetrieval: ({ sources, usedWeb, effectiveMode, coverageScore }) => {
            this.updateAssistantMessageInConversation(conversationId, assistantId, {
              citations: normalizeSourcesForDisplay(sources || []),
              usedWeb: !!usedWeb,
              effectiveMode: effectiveMode || mode,
              coverageScore: coverageScore ?? 0,
            })
          },
          onDelta: ({ content }) => {
            this.appendAssistantContentInConversation(conversationId, assistantId, content || '')
          },
          onDone: ({ conversationId: serverConversationId, usedWeb, effectiveMode }) => {
            const current = this.conversations.find((item) => item.id === conversationId)
            if (current) {
              this.touchConversation(current.id, {
                serverConversationId: serverConversationId || current.serverConversationId,
              })
            }
            this.updateAssistantMessageInConversation(conversationId, assistantId, {
              usedWeb: !!usedWeb,
              effectiveMode: effectiveMode || mode,
            })
          },
        })
      } catch (error) {
        const aborted = controller.signal.aborted
          || error?.name === 'AbortError'
          || /aborted/i.test(String(error?.message || ''))
        if (aborted) {
          // 用户主动停止：保留已流式输出的内容，不弹错误提示。
        } else {
          const friendlyMessage = formatStudentAssistantError(error?.message, mode)
          if (this.activeConversationId === conversationId) {
            this.assistantNotice = friendlyMessage
          }
          uiMessage.warning(friendlyMessage)
          const target = this.conversations.find((item) => item.id === conversationId)
          const current = target?.messages.find((message) => message.id === assistantId)
          if (current && !current.content) {
            this.updateAssistantMessageInConversation(conversationId, assistantId, { content: friendlyMessage })
          }
        }
      } finally {
        const nextControllers = { ...this.abortControllers }
        delete nextControllers[conversationId]
        this.abortControllers = nextControllers
        this.setConversationTyping(conversationId, false)
      }
    },

    // 原位重新生成指定 AI 回复：清空其内容，用对应的上一条用户问题重新流式生成。
    async retryAssistantMessage(assistantId) {
      if (!assistantId) return
      const conversation = this.conversations.find((item) =>
        item.messages.some((message) => message.id === assistantId))
      if (!conversation) return
      const conversationId = conversation.id
      if (this.isConversationTyping(conversationId)) return

      const messages = conversation.messages
      const aiIndex = messages.findIndex((message) => message.id === assistantId)
      if (aiIndex < 0) return
      const aiMessage = messages[aiIndex]
      if (aiMessage.role !== 'ai') return

      let userIndex = -1
      for (let i = aiIndex - 1; i >= 0; i--) {
        if (messages[i].role === 'user') { userIndex = i; break }
      }
      if (userIndex < 0) {
        uiMessage.warning('未找到对应的问题，无法重试。')
        return
      }
      const userMessage = messages[userIndex]
      const text = String(userMessage.content || '').trim()
      if (!text) return

      this.updateAssistantMessageInConversation(conversationId, assistantId, {
        content: '',
        citations: [],
        usedWeb: false,
        effectiveMode: aiMessage.mode,
        coverageScore: 0,
      })
      this.assistantNotice = ''
      this.setConversationTyping(conversationId, true)

      const mode = aiMessage.mode || this.currentMode
      const enableWebSearch = mode === 'web' || !!aiMessage.webEnabled
      const historyMessages = messages.slice(0, userIndex)
      const payload = {
        query: text,
        mode,
        enableWebSearch,
        knowledgeBaseIds: mode === 'rag' && conversation.selectedCourseSpaceId
          ? [String(conversation.selectedCourseSpaceId)]
          : [],
        conversationId: conversation.serverConversationId || null,
        history: normalizeHistory(historyMessages),
        options: {
          topK: 10,
          rerankTopN: 3,
          scoreThreshold: 0,
          enableRerank: true,
          temperature: 0.7,
          maxTokens: 1024,
        },
      }

      await this.streamAssistantResponse({ conversationId, assistantId, payload, mode })
    },

    stopGeneration(conversationId = this.activeConversationId) {
      const controller = this.abortControllers?.[conversationId]
      if (controller) {
        try {
          controller.abort()
        } catch {
          // 忽略中断异常。
        }
      }
      this.setConversationTyping(conversationId, false)
    },

    deleteConversation(conversationId) {
      if (!conversationId) return
      const conversation = this.conversations.find((item) => item.id === conversationId)
      if (!conversation) return
      if (this.isConversationTyping(conversationId)) {
        this.stopGeneration(conversationId)
      }
      let next = this.conversations.filter((item) => item.id !== conversationId)
      if (this.activeConversationId === conversationId) {
        if (next.length > 0) {
          this.switchConversation(next[0].id)
        } else {
          const fresh = buildConversation({
            mode: this.assistantMode,
            webEnabled: this.effectiveWebEnabled,
            selectedCourseSpaceId: this.selectedCourseSpaceId,
          })
          next = [fresh]
          this.activeConversationId = fresh.id
          this.userInput = ''
          this.assistantNotice = ''
        }
      }
      this.conversations = trimConversations(next)
    },
  }
})
