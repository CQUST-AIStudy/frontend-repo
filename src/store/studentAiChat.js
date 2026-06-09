import { defineStore } from 'pinia'
import { message as uiMessage } from '@/services/feedback'
import { buildApiUrl } from '../config/runtime'
import { normalizeSourcesForDisplay, streamRagChat } from '../api/rag'

const MAX_MESSAGES = 80

function trimMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages.slice(-MAX_MESSAGES)
}

function createMessageId(role) {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createTimeLabel() {
  return new Date().toLocaleTimeString()
}

async function readErrorMessage(response) {
  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      const payload = await response.json()
      return payload?.message || payload?.detail || payload?.error || `HTTP ${response.status}`
    }
    const text = await response.text()
    return text || `HTTP ${response.status}`
  } catch {
    return `HTTP ${response.status}`
  }
}

export function formatStudentAssistantError(message, isRagMode) {
  const raw = String(message || '')
  if (raw.includes('DASHSCOPE_API_KEY')) {
    return '后端生成模型未配置，请联系管理员配置 DASHSCOPE_API_KEY。'
  }
  if (raw.includes('RAG 生成失败') || raw.includes('生成模型') || raw.includes('DashScope')) {
    return 'AI 生成失败，请稍后重试'
  }
  if (raw.includes('timeout') || raw.includes('timed out') || raw.includes('ReadTimeout')) {
    return isRagMode
      ? '资料检索已完成，但 AI 响应超时，请稍后重试。'
      : 'AI 响应超时，请稍后重试。'
  }
  if (raw.includes('OPENAI_API_KEY') || raw.includes('AI service is not configured')) {
    return '后端 AI 服务暂未配置，请联系管理员设置 OPENAI_API_KEY。'
  }
  if (raw.includes('course space')) {
    return '当前没有可访问的课程空间，暂时无法使用智能问答。'
  }
  if (raw.includes('401')) {
    return isRagMode
      ? '当前登录状态无效，RAG 问答暂不可用。'
      : '当前登录状态无效，AI 聊天暂不可用。'
  }
  if (raw.includes('403')) {
    return isRagMode
      ? '当前账号无权使用该课程空间，RAG 问答暂不可用。'
      : '当前账号无权使用 AI 聊天。'
  }
  return isRagMode ? 'RAG 问答暂时不可用。' : 'AI 聊天暂时不可用。'
}

export const useStudentAiChatStore = defineStore('studentAiChat', {
  state: () => ({
    messages: [],
    userInput: '',
    isTyping: false,
    selectedCourseSpaceId: null,
    isOpenMode: false,
    assistantNotice: '',
  }),
  persist: {
    key: 'student_ai_chat',
    storage: sessionStorage,
    paths: ['messages', 'userInput', 'selectedCourseSpaceId', 'isOpenMode']
  },
  actions: {
    setInput(value) {
      this.userInput = value || ''
    },

    setCourseSpace(value) {
      this.selectedCourseSpaceId = value || null
    },

    setMode(value) {
      this.isOpenMode = !!value
    },

    setAssistantNotice(value) {
      this.assistantNotice = value || ''
    },

    clearMessages() {
      this.messages = []
      this.userInput = ''
      this.isTyping = false
      this.assistantNotice = ''
    },

    updateAssistantMessage(id, patch) {
      const index = this.messages.findIndex((message) => message.id === id)
      if (index < 0) return
      this.messages[index] = {
        ...this.messages[index],
        ...patch
      }
    },

    appendAssistantContent(id, content) {
      if (!content) return
      const index = this.messages.findIndex((message) => message.id === id)
      if (index < 0) return
      this.messages[index] = {
        ...this.messages[index],
        content: `${this.messages[index].content || ''}${content}`
      }
    },

    async sendMessage() {
      const text = String(this.userInput || '').trim()
      if (!text || this.isTyping) return

      this.assistantNotice = ''
      this.messages = trimMessages([
        ...this.messages,
        {
          id: createMessageId('user'),
          role: 'user',
          content: text,
          time: createTimeLabel(),
        }
      ])
      this.userInput = ''

      this.isTyping = true
      const assistantId = createMessageId('ai')
      this.messages = trimMessages([
        ...this.messages,
        {
          id: assistantId,
          role: 'ai',
          content: '',
          time: createTimeLabel(),
          citations: [],
        }
      ])

      try {
        const isRagMode = !!this.selectedCourseSpaceId
        if (isRagMode) {
          await streamRagChat({
            query: text,
            knowledgeBaseIds: [String(this.selectedCourseSpaceId)],
            mode: this.isOpenMode ? 'open' : 'strict',
            options: {
              topK: 10,
              rerankTopN: 3,
              scoreThreshold: 0,
              enableRerank: true,
              temperature: 0.7,
              maxTokens: 1024,
            },
          }, {
            onRetrieval: ({ sources }) => {
              this.updateAssistantMessage(assistantId, {
                citations: normalizeSourcesForDisplay(sources || [])
              })
            },
            onDelta: ({ content }) => {
              this.appendAssistantContent(assistantId, content || '')
            },
          })
        } else {
          const response = await fetch(buildApiUrl('/api/chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userInput: text })
          })

          if (!response.ok) {
            throw new Error(await readErrorMessage(response))
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body reader')
          }

          const decoder = new TextDecoder()
          let done = false
          while (!done) {
            const chunk = await reader.read()
            done = chunk.done
            if (chunk.value) {
              this.appendAssistantContent(
                assistantId,
                decoder.decode(chunk.value, { stream: !done })
              )
            }
          }

          const tail = decoder.decode()
          this.appendAssistantContent(assistantId, tail)
        }
      } catch (error) {
        const isRagMode = !!this.selectedCourseSpaceId
        const friendlyMessage = formatStudentAssistantError(error?.message, isRagMode)
        this.assistantNotice = friendlyMessage
        uiMessage.warning(friendlyMessage)
        const current = this.messages.find((message) => message.id === assistantId)
        if (current && !current.content) {
          this.updateAssistantMessage(assistantId, { content: friendlyMessage })
        }
      } finally {
        this.isTyping = false
      }
    }
  }
})
