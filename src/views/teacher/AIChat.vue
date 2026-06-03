<template>
  <div class="chat-page [min-height:calc(100vh_-_180px)] [display:flex] [flex-direction:column] [gap:18px] [color:#1f2937] max-[768px]:[gap:14px]">
    <section class="hero-panel [position:relative] [overflow:hidden] [display:grid] [grid-template-columns:minmax(0,_1.8fr)_minmax(280px,_1fr)] [gap:18px] [padding:28px_32px] [border-radius:28px] [background:radial-gradient(circle_at_top_left,_rgba(255,_255,_255,_0.72),_rgba(255,_255,_255,_0)_36%),_linear-gradient(135deg,_#f7f3ea_0%,_#ecf7f4_48%,_#eef4ff_100%)] [border:1px_solid_rgba(112,_136,_173,_0.22)] [box-shadow:0_16px_40px_rgba(68,_95,_130,_0.12)] max-[1100px]:[grid-template-columns:1fr] max-[768px]:[padding-left:16px] max-[768px]:[padding-right:16px] max-[768px]:[padding-top:20px] max-[768px]:[padding-bottom:20px] max-[768px]:[border-radius:22px]">
      <div class="hero-copy [position:relative] [z-index:1] [max-width:720px] [&_h1]:[margin:14px_0_10px] [&_h1]:[font-size:34px] [&_h1]:[line-height:1.15] [&_h1]:[font-family:'ZiYouLangManTi',_'Microsoft_YaHei',_sans-serif] [&_h1]:[letter-spacing:1px] [&_h1]:[color:#173153] [&_p]:[margin:0] [&_p]:[max-width:640px] [&_p]:[font-size:14px] [&_p]:[line-height:1.75] [&_p]:[color:#4b5b74] max-[768px]:[&_h1]:[font-size:28px]">
        <span class="hero-badge [display:inline-flex] [align-items:center] [padding:6px_12px] [border-radius:999px] [background:rgba(255,_255,_255,_0.72)] [color:#3056a1] [font-size:12px] [letter-spacing:0.08em] [text-transform:uppercase]">教师助手</span>
        <h1>AI 教学对话助手</h1>
        <p>
          支持教学问答、论文检索、课程设计讨论。切换到系统其他页面后，请求会继续执行，返回本页时会自动显示结果。
        </p>
      </div>
      <div class="hero-meta [position:relative] [z-index:1] [display:grid] [grid-template-columns:repeat(2,_minmax(0,_1fr))] [align-content:start] [gap:14px] max-[1100px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))]">
        <div class="meta-card [min-height:88px] [border-radius:20px] [border:1px_solid_rgba(104,_124,_155,_0.18)] [background:rgba(255,_255,_255,_0.74)] [backdrop-filter:blur(12px)] [display:flex] [flex-direction:column] [justify-content:center] [padding:16px_18px] [&_strong]:[margin-top:8px] [&_strong]:[font-size:22px] [&_strong]:[color:#183153]">
          <span class="meta-label [font-size:12px] [color:#6a7792]">会话消息</span>
          <strong>{{ messages.length }}</strong>
        </div>
        <div class="meta-card [min-height:88px] [border-radius:20px] [border:1px_solid_rgba(104,_124,_155,_0.18)] [background:rgba(255,_255,_255,_0.74)] [backdrop-filter:blur(12px)] [display:flex] [flex-direction:column] [justify-content:center] [padding:16px_18px] [&_strong]:[margin-top:8px] [&_strong]:[font-size:22px] [&_strong]:[color:#183153]">
          <span class="meta-label [font-size:12px] [color:#6a7792]">当前状态</span>
          <strong>{{ loading ? 'AI 生成中' : '可继续提问' }}</strong>
        </div>
        <UiButton
          class="clear-btn [min-height:88px] [border-radius:20px] [border:1px_solid_rgba(104,_124,_155,_0.18)] [background:rgba(255,_255,_255,_0.74)] [backdrop-filter:blur(12px)] [grid-column:span_2] [color:#38517c] [cursor:pointer] [transition:all_0.2s] [font-size:14px] [font-weight:500] hover:[background:rgba(255,_255,_255,_0.9)] hover:[border-color:rgba(104,_124,_155,_0.3)] disabled:[opacity:0.4] disabled:[cursor:not-allowed]"
          :disabled="loading || !messages.length"
          @click="clearConversation"
        >
          清空会话
        </UiButton>
      </div>
    </section>

    <section class="chat-shell [position:relative] [overflow:hidden] [display:flex] [flex-direction:column] [min-height:680px] [border-radius:28px] [border:1px_solid_rgba(129,_148,_174,_0.18)] [background:linear-gradient(180deg,_rgba(247,_250,_253,_0.95)_0%,_rgba(243,_247,_252,_0.98)_100%)] [box-shadow:0_22px_55px_rgba(56,_84,_122,_0.12)] max-[768px]:[min-height:620px] max-[768px]:[border-radius:22px]">
      <div class="chat-topbar [position:relative] [z-index:1] [display:flex] [justify-content:space-between] [gap:16px] [padding:24px_28px_18px] [border-bottom:1px_solid_rgba(154,_169,_191,_0.18)] max-[768px]:[padding-left:16px] max-[768px]:[padding-right:16px] max-[768px]:[flex-direction:column] max-[768px]:[align-items:flex-start]">
        <div class="topbar-title [display:flex] [gap:14px] [align-items:flex-start] [&_h2]:[margin:0] [&_h2]:[font-size:20px] [&_h2]:[color:#1d3557] [&_p]:[margin:6px_0_0] [&_p]:[color:#60708a] [&_p]:[font-size:13px]">
          <span class="topbar-dot [width:12px] [height:12px] [margin-top:7px] [border-radius:999px] [background:#8da0bc] [box-shadow:0_0_0_6px_rgba(141,_160,_188,_0.15)] [transition:all_0.25s_ease] [&.active]:[background:#2fb086] [&.active]:[box-shadow:0_0_0_8px_rgba(47,_176,_134,_0.16)]" :class="{ active: loading }"></span>
          <div>
            <h2>教师端 AI 对话</h2>
            <p>{{ loading ? '正在生成回答，离开页面后也会继续处理。' : '可直接追问、续问或粘贴教学材料。' }}</p>
          </div>
        </div>
        <div class="topbar-actions [display:flex] [flex-direction:column] [align-items:flex-end] [gap:10px] [min-width:220px] max-[1100px]:[min-width:0] max-[768px]:[align-items:flex-start]">
          <span v-if="messages.length" class="session-tag [padding:6px_12px] [border-radius:999px] [background:rgba(33,_115,_213,_0.1)] [color:#2955a6] [font-size:12px]">已保存本次会话</span>
          <span v-if="lastAssistantPreview" class="session-preview [max-width:280px] [font-size:12px] [color:#66768f] [text-align:right]">{{ lastAssistantPreview }}</span>
        </div>
      </div>

      <div ref="messagesRef" class="messages-panel [position:relative] [z-index:1] [flex:1] [overflow-y:auto] [padding:26px_28px_10px] max-[768px]:[padding-left:16px] max-[768px]:[padding-right:16px]">
        <template v-if="messages.length">
          <div
            v-for="(msg, index) in messages"
            :key="`${msg.role}-${msg.createdAt || index}`"
            :class="['message-row', msg.role]"
          >
            <div class="message-avatar [width:42px] [height:42px] [border-radius:18px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [font-size:13px] [font-weight:700] [letter-spacing:0.08em] [color:#fff] [background:linear-gradient(135deg,_#5872a5_0%,_#3651a2_100%)] [box-shadow:0_10px_20px_rgba(61,_88,_140,_0.18)]">
              <span>{{ msg.role === 'assistant' ? 'AI' : '师' }}</span>
            </div>
            <div class="message-main [display:flex] [flex-direction:column] [gap:8px] [max-width:min(820px,_calc(100%_-_70px))] max-[768px]:[max-width:calc(100%_-_56px)]">
              <div class="message-meta [display:flex] [align-items:center] [gap:10px] [font-size:12px] [color:#6b7b92] [&_strong]:[color:#22395d]">
                <strong>{{ msg.role === 'assistant' ? '教学助手' : '教师' }}</strong>
                <span>{{ msg.role === 'assistant' ? '回答' : '提问' }}</span>
              </div>
              <div class="message-bubble [border-radius:22px] [padding:16px_18px] [background:rgba(255,_255,_255,_0.92)] [border:1px_solid_rgba(128,_147,_176,_0.16)] [box-shadow:0_16px_30px_rgba(89,_111,_143,_0.08)]">
                <p v-if="msg.role === 'user'" class="plain-text [margin:0] [white-space:pre-wrap] [line-height:1.75]">{{ msg.content }}</p>
                <div v-else class="markdown-body [color:#23354c] [line-height:1.8] [font-size:14px] [&_p]:[margin:0_0_10px] [&_p:last-child]:[margin-bottom:0] [&_ul]:[padding-left:20px] [&_ul]:[margin:10px_0] [&_ol]:[padding-left:20px] [&_ol]:[margin:10px_0] [&_code]:[padding:2px_6px] [&_code]:[border-radius:6px] [&_code]:[background:rgba(36,_56,_86,_0.08)] [&_code]:[color:#234577] [&_code]:[font-size:13px] [&_pre]:[margin:12px_0] [&_pre]:[padding:14px_16px] [&_pre]:[border-radius:16px] [&_pre]:[overflow-x:auto] [&_pre]:[background:#162030] [&_pre]:[color:#eaf1ff] [&_pre_code]:[padding:0] [&_pre_code]:[background:transparent] [&_pre_code]:[color:inherit] [&_blockquote]:[margin:12px_0] [&_blockquote]:[padding:10px_14px] [&_blockquote]:[border-left:4px_solid_#80a8ea] [&_blockquote]:[background:rgba(110,_155,_243,_0.08)] [&_blockquote]:[border-radius:12px] [&_a]:[color:#295dc8] [&_a]:[word-break:break-all]" v-html="renderMarkdown(msg.content)"></div>

                <div v-if="msg.papers?.length" class="papers-grid [display:grid] [grid-template-columns:repeat(auto-fit,_minmax(220px,_1fr))] [gap:12px] [margin-top:16px]">
                  <a
                    v-for="(paper, paperIndex) in msg.papers"
                    :key="`${paper.link || paper.title}-${paperIndex}`"
                    :href="paper.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="paper-card [display:flex] [flex-direction:column] [gap:10px] [padding:14px] [border-radius:18px] [text-decoration:none] [background:linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] [border:1px_solid_rgba(126,_153,_202,_0.24)] [transition:transform_0.2s_ease,_box-shadow_0.2s_ease] hover:[transform:translateY(-2px)] hover:[box-shadow:0_12px_24px_rgba(73,_101,_149,_0.12)] [&_strong]:[color:#20365a] [&_strong]:[line-height:1.5] [&_p]:[margin:0] [&_p]:[font-size:12px] [&_p]:[color:#60708a]"
                  >
                    <div class="paper-head [display:flex] [justify-content:space-between] [gap:12px] [font-size:12px] [color:#6880a7]">
                      <span class="paper-index [font-weight:700] [color:#3057a7]">0{{ paperIndex + 1 }}</span>
                      <span class="paper-link">查看论文</span>
                    </div>
                    <strong>{{ paper.title }}</strong>
                    <p>{{ paper.authors || '作者信息暂缺' }}</p>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="message-row assistant pending-row [display:flex] [gap:14px] [margin-bottom:22px] [&.user]:[flex-direction:row-reverse]">
            <div class="message-avatar [width:42px] [height:42px] [border-radius:18px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [font-size:13px] [font-weight:700] [letter-spacing:0.08em] [color:#fff] [background:linear-gradient(135deg,_#5872a5_0%,_#3651a2_100%)] [box-shadow:0_10px_20px_rgba(61,_88,_140,_0.18)]">
              <span>AI</span>
            </div>
            <div class="message-main [display:flex] [flex-direction:column] [gap:8px] [max-width:min(820px,_calc(100%_-_70px))] max-[768px]:[max-width:calc(100%_-_56px)]">
              <div class="message-meta [display:flex] [align-items:center] [gap:10px] [font-size:12px] [color:#6b7b92] [&_strong]:[color:#22395d]">
                <strong>教学助手</strong>
                <span>处理中</span>
              </div>
              <div class="message-bubble pending-bubble [border-radius:22px] [padding:16px_18px] [background:rgba(255,_255,_255,_0.92)] [border:1px_solid_rgba(128,_147,_176,_0.16)] [box-shadow:0_16px_30px_rgba(89,_111,_143,_0.08)] [display:flex] [flex-direction:column] [gap:10px] [&_p]:[margin:0] [&_p]:[color:#60708a]">
                <div class="typing-line [display:flex] [gap:8px]">
                  <span class="typing-dot [width:9px] [height:9px] [border-radius:999px] [background:#7e98c8] [animation:typing-bounce_0.8s_infinite_alternate] [&:nth-child(2)]:[animation-delay:0.2s] [&:nth-child(3)]:[animation-delay:0.4s]"></span>
                  <span class="typing-dot [width:9px] [height:9px] [border-radius:999px] [background:#7e98c8] [animation:typing-bounce_0.8s_infinite_alternate] [&:nth-child(2)]:[animation-delay:0.2s] [&:nth-child(3)]:[animation-delay:0.4s]"></span>
                  <span class="typing-dot [width:9px] [height:9px] [border-radius:999px] [background:#7e98c8] [animation:typing-bounce_0.8s_infinite_alternate] [&:nth-child(2)]:[animation-delay:0.2s] [&:nth-child(3)]:[animation-delay:0.4s]"></span>
                </div>
                <p>正在整理答案与参考资料…</p>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="empty-panel [min-height:420px] [display:grid] [align-content:center] [gap:20px] [justify-items:center] [padding:36px_20px_48px] [text-align:center]">
          <div class="empty-orb [width:112px] [height:112px] [border-radius:50%] [background:radial-gradient(circle_at_30%_30%,_rgba(255,_255,_255,_0.95),_rgba(255,_255,_255,_0.2)_30%),_linear-gradient(135deg,_#8ec5b8_0%,_#7aa4ef_100%)] [box-shadow:inset_0_1px_12px_rgba(255,_255,_255,_0.55),_0_20px_45px_rgba(67,_106,_157,_0.18)]"></div>
          <div class="empty-copy [max-width:560px]">
            <span class="empty-label [display:inline-block] [margin-bottom:10px] [padding:6px_12px] [border-radius:999px] [background:rgba(255,_255,_255,_0.78)] [color:#47649b] [font-size:12px] [letter-spacing:0.08em] [text-transform:uppercase]">推荐提问</span>
            <h3>从一个具体教学问题开始</h3>
            <p>例如课程讲解、实验设计、知识点串讲、论文资料检索或答疑措辞优化。</p>
          </div>
          <div class="suggestion-grid [width:min(920px,_100%)] [display:grid] [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:14px]">
            <UiButton
              v-for="item in suggestions"
              :key="item"
              type="button"
              class="suggestion-card [padding:18px_18px] [border:1px_solid_rgba(123,_147,_178,_0.18)] [border-radius:20px] [background:rgba(255,_255,_255,_0.86)] [text-align:left] [color:#234066] [font-size:14px] [line-height:1.65] [cursor:pointer] [transition:transform_0.2s_ease,_box-shadow_0.2s_ease,_border-color_0.2s_ease] hover:[transform:translateY(-2px)] hover:[border-color:rgba(63,_110,_193,_0.34)] hover:[box-shadow:0_12px_24px_rgba(83,_108,_145,_0.12)]"
              @click="applySuggestion(item)"
            >
              {{ item }}
            </UiButton>
          </div>
        </div>
      </div>

      <div class="composer-panel [position:relative] [z-index:1] [padding:0_24px_24px]">
        <div class="quick-strip [display:flex] [flex-wrap:wrap] [gap:10px] [padding:0_4px_14px]">
          <UiButton
            v-for="item in suggestions"
            :key="`quick-${item}`"
            type="button"
            class="quick-chip hover:[transform:translateY(-2px)] hover:[border-color:rgba(63,_110,_193,_0.34)] hover:[box-shadow:0_12px_24px_rgba(83,_108,_145,_0.12)] [padding:9px_14px] [border-radius:999px] [border:1px_solid_rgba(123,_147,_178,_0.2)] [background:rgba(255,_255,_255,_0.8)] [color:#38547f] [cursor:pointer] [transition:transform_0.2s_ease,_box-shadow_0.2s_ease,_border-color_0.2s_ease]"
            @click="applySuggestion(item)"
          >
            {{ item }}
          </UiButton>
        </div>

        <div class="composer-box [padding:16px] [border-radius:24px] [background:rgba(255,_255,_255,_0.9)] [border:1px_solid_rgba(128,_147,_176,_0.18)] [box-shadow:0_18px_34px_rgba(84,_106,_138,_0.1)]">
          <textarea
            v-model="draft"
            rows="1"
            class="composer-textarea w-full resize-none border-none bg-transparent text-[15px] outline-none"
            :placeholder="composerPlaceholder"
            @keydown="onKeyDown"
            @input="autoResize"
            ref="textareaRef"
          ></textarea>
          <div class="composer-actions [display:flex] [justify-content:space-between] [align-items:center] [gap:14px] [padding-top:12px] [border-top:1px_solid_rgba(128,_147,_176,_0.14)]">
            <span class="composer-hint [font-size:12px] [color:#71829a]">Enter 发送，Shift+Enter 换行</span>
            <UiButton
              type="button"
              :disabled="!draft.trim() || loading"
              @click="send"
              class="h-[38px] px-5 rounded-full text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:pointer-events-none"
            >
              {{ loading ? '生成中...' : '发送问题' }}
            </UiButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { messageBox } from '@/services/feedback'
import { useTeacherAiChatStore } from '../../store/teacherAiChat'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true
})

const store = useTeacherAiChatStore()
const { messages, draft, loading } = storeToRefs(store)

const messagesRef = ref(null)
const textareaRef = ref(null)
const composerPlaceholder = '输入教学问题，例如：帮我给「图的遍历」设计一个 20 分钟课堂讲解结构。'

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 140) + 'px'
}

const suggestions = [
  '帮我设计一个"二叉树遍历"实验课的提问链路',
  '帮我生成"栈和队列"课堂讲解提纲',
  '帮我检索最近的 Transformer 教学应用论文',
  '帮我润色一段给学生的实验反馈'
]

const renderMarkdown = (text) => DOMPurify.sanitize(md.render(text || ''))

const lastAssistantPreview = computed(() => {
  const lastAssistant = [...messages.value].reverse().find(item => item.role === 'assistant' && item.content)
  if (!lastAssistant) return ''
  return lastAssistant.content.replace(/\s+/g, ' ').slice(0, 48)
})

function scrollToBottom() {
  nextTick(() => {
    if (!messagesRef.value) return
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

function applySuggestion(text) {
  store.setDraft(text)
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
}

function onKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}

watch(() => [messages.value.length, loading.value], scrollToBottom, { immediate: true })
onMounted(scrollToBottom)
</script>


