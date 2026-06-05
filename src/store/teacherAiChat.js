import { defineStore } from 'pinia'
import { message as uiMessage } from '@/services/feedback'
import { chatSend, chatStreamSend, validateChatMessage } from '../api/tap'
import { getFriendlyErrorMessage } from '../utils/errorMessage'

const MAX_MESSAGES = 50
const PAPERS_MARKER = '<!--PAPERS:'
const DEFAULT_EMPTY_REPLY = 'AI 暂时没有返回内容。'
const DEFAULT_ERROR_MESSAGE = '请求失败，请稍后重试'
const STREAM_FIRST_CHUNK_TIMEOUT_MS = 10000

function trimMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages.slice(-MAX_MESSAGES)
}

function normalizeAssistantPayload(fullText) {
  if (!fullText) {
    return { content: '', papers: undefined }
  }

  const markerIndex = fullText.indexOf(PAPERS_MARKER)
  if (markerIndex === -1) {
    return { content: fullText, papers: undefined }
  }

  const content = fullText.slice(0, markerIndex).replace(/\s+$/, '')
  const markerEnd = fullText.indexOf('-->', markerIndex)
  if (markerEnd === -1) {
    return { content, papers: undefined }
  }

  const jsonText = fullText.slice(markerIndex + PAPERS_MARKER.length, markerEnd)
  try {
    const papers = JSON.parse(jsonText)
    return {
      content,
      papers: Array.isArray(papers) && papers.length ? papers : undefined,
    }
  } catch {
    return { content, papers: undefined }
  }
}

async function readErrorMessage(response) {
  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      const payload = await response.json()
      return getFriendlyErrorMessage({
        status: response.status,
        response: { status: response.status, data: payload },
        data: payload
      }, DEFAULT_ERROR_MESSAGE)
    }
    const text = await response.text()
    return getFriendlyErrorMessage({
      status: response.status,
      message: text
    }, DEFAULT_ERROR_MESSAGE)
  } catch {
    return getFriendlyErrorMessage(response.status, DEFAULT_ERROR_MESSAGE)
  }
}

function appendAssistantMessage(messages, content = '', papers) {
  return trimMessages([
    ...messages,
    {
      role: 'assistant',
      content,
      papers,
      createdAt: Date.now() + 1,
    }
  ])
}

function resolveReplyText(payload) {
  const reply = payload?.reply
  if (typeof reply === 'string' && reply.trim()) return reply
  return DEFAULT_EMPTY_REPLY
}

async function resolveSyncFallback(message, history) {
  const fallback = await chatSend(message, history)
  const data = fallback?.data ?? fallback
  return {
    content: resolveReplyText(data),
    papers: Array.isArray(data?.papers) && data.papers.length ? data.papers : undefined,
  }
}

export const useTeacherAiChatStore = defineStore('teacherAiChat', {
  state: () => ({
    messages: [],
    draft: '',
    loading: false,
    streaming: false,
  }),
  persist: {
    key: 'teacher_ai_chat',
    storage: sessionStorage,
    paths: ['messages', 'draft']
  },
  actions: {
    setDraft(value) {
      this.draft = value
    },

    clearMessages() {
      this.messages = []
      this.draft = ''
      this.loading = false
      this.streaming = false
    },

    async sendMessage(rawMessage) {
      if (this.loading || this.streaming) return

      const validation = validateChatMessage(rawMessage, { fieldName: '消息' })
      if (!validation.valid) {
        uiMessage.warning(validation.message)
        return
      }
      const message = validation.value

      const history = this.messages
        .slice(-10)
        .filter(item => item?.content)
        .map(item => ({ role: item.role, content: item.content }))

      this.loading = true
      this.streaming = false
      this.draft = ''
      this.messages = trimMessages([
        ...this.messages,
        { role: 'user', content: message, createdAt: Date.now() }
      ])

      let assistantIndex = -1
      let streamController = null
      let firstChunkTimer = null
      let firstChunkReceived = false

      try {
        streamController = new AbortController()
        firstChunkTimer = setTimeout(() => {
          if (!firstChunkReceived) {
            streamController.abort()
          }
        }, STREAM_FIRST_CHUNK_TIMEOUT_MS)

        const response = await chatStreamSend(message, history, {
          signal: streamController.signal,
        })
        if (!response.ok) {
          throw new Error(await readErrorMessage(response))
        }

        const reader = response.body?.getReader()
        if (!reader) {
          const fallbackResult = await resolveSyncFallback(message, history)
          this.messages = appendAssistantMessage(
            this.messages,
            fallbackResult.content,
            fallbackResult.papers,
          )
          return
        }

        const decoder = new TextDecoder()
        let fullText = ''
        let done = false

        while (!done) {
          const chunk = await reader.read()
          done = chunk.done
          if (done) break

          if (!firstChunkReceived) {
            firstChunkReceived = true
            if (firstChunkTimer) {
              clearTimeout(firstChunkTimer)
              firstChunkTimer = null
            }
          }

          fullText += decoder.decode(chunk.value, { stream: true })
          const parsed = normalizeAssistantPayload(fullText)

          if (assistantIndex === -1) {
            this.messages = appendAssistantMessage(this.messages, parsed.content, parsed.papers)
            assistantIndex = this.messages.length - 1
            this.loading = false
            this.streaming = true
          } else {
            this.messages[assistantIndex] = {
              ...this.messages[assistantIndex],
              content: parsed.content,
              papers: parsed.papers,
            }
          }
        }

        fullText += decoder.decode()
        const parsed = normalizeAssistantPayload(fullText)

        let finalContent = parsed.content?.trim()
        let finalPapers = parsed.papers

        // Stream may complete without visible text if provider chunk format changed.
        if (!finalContent) {
          try {
            const fallbackResult = await resolveSyncFallback(message, history)
            finalContent = fallbackResult.content
            finalPapers = fallbackResult.papers
          } catch {
            finalContent = DEFAULT_EMPTY_REPLY
          }
        }

        if (assistantIndex === -1) {
          this.messages = appendAssistantMessage(this.messages, finalContent, finalPapers)
        } else {
          this.messages[assistantIndex] = {
            ...this.messages[assistantIndex],
            content: finalContent,
            papers: finalPapers,
          }
        }
      } catch (error) {
        try {
          const fallbackResult = await resolveSyncFallback(message, history)
          if (assistantIndex === -1) {
            this.messages = appendAssistantMessage(
              this.messages,
              fallbackResult.content,
              fallbackResult.papers,
            )
          } else {
            this.messages[assistantIndex] = {
              ...this.messages[assistantIndex],
              content: fallbackResult.content,
              papers: fallbackResult.papers,
            }
          }
        } catch {
          const errorText = getFriendlyErrorMessage(error, DEFAULT_ERROR_MESSAGE)
          if (assistantIndex === -1) {
            this.messages = appendAssistantMessage(this.messages, errorText, undefined)
          } else {
            this.messages[assistantIndex] = {
              ...this.messages[assistantIndex],
              content: errorText,
              papers: undefined,
            }
          }
        }
      } finally {
        if (firstChunkTimer) {
          clearTimeout(firstChunkTimer)
        }
        this.loading = false
        this.streaming = false
      }
    }
  }
})
