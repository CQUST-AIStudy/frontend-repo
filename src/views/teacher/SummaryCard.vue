<template>
  <div class="min-h-full">
    <!-- 顶部 -->
    <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-6 flex items-center max-[640px]:p-4">
      <div class="flex items-center gap-4">
        <div class="grid h-12 w-12 place-items-center rounded-2xl bg-[#fbf1eb] text-[#d18a61]">
          <LucideIcon name="book-open" :size="26" />
        </div>
        <div>
          <h1 class="m-0 mb-1 text-[22px] font-normal text-[#1d1d1f]">AI 精读卡片</h1>
          <p class="m-0 text-sm text-[#6e6e73]">支持 arXiv、DOI、粘贴文本、本地文档，一键生成结构化精读</p>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="flex gap-0 mb-5 border-b border-black/[0.06] max-[640px]:overflow-x-auto">
      <div v-for="t in tabs" :key="t.key"
        :class="[
          'flex items-center gap-2 px-4 py-3 text-sm cursor-pointer transition-all border-b-2 whitespace-nowrap shrink-0',
          activeTab === t.key
            ? 'border-[var(--app-primary)] text-[var(--app-primary)] font-medium'
            : 'border-transparent text-[#6e6e73] hover:text-[#1d1d1f]'
        ]"
        @click="activeTab = t.key">
        <LucideIcon :name="t.icon" :size="17" />
        <span>{{ t.label }}</span>
      </div>
    </div>

    <!-- arXiv -->
    <div v-if="activeTab === 'arxiv'" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 max-[640px]:p-4">
      <p class="text-[#6e6e73] text-[13px] m-0 mb-4">输入 arXiv ID，自动抓取论文全文并生成精读卡（首次抓取可能需要30-60 秒）</p>
      <div class="flex gap-2.5 items-center flex-wrap">
        <UiInput v-model="arxivId" placeholder="例如：706.03762"
          class="flex-1 min-w-[200px] w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          @keydown.enter="genArxiv(false)" />
        <UiButton :disabled="!arxivId.trim() || arxivLoading"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          @click="genArxiv(false)">
          {{ arxivLoading ? '正在抓取论文...' : '生成' }}
        </UiButton>
        <UiButton :disabled="!arxivId.trim() || arxivLoading"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          @click="genArxiv(true)">重新生成</UiButton>
      </div>
      <div v-if="arxivLoading" class="flex items-center gap-2.5 mt-4 p-4 bg-[rgba(194,112,62,0.06)] rounded-[12px] text-[13px] text-[var(--app-primary)]">
        <Loading class="w-4 h-4 animate-spin" />
        <span>正在从arXiv 抓取论文并生成精读，请耐心等待...</span>
      </div>
      <ResultBlock v-if="arxivResult" :result="arxivResult" :meta="arxivMeta" />
    </div>

    <!-- DOI -->
    <div v-if="activeTab === 'doi'" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 max-[640px]:p-4">
      <p class="text-[#6e6e73] text-[13px] m-0 mb-4">输入论文 DOI，通过 Crossref 获取元数据并生成精读卡</p>
      <div class="flex gap-2.5 items-center flex-wrap">
        <UiInput v-model="doi" placeholder="例如：0.1145/3292500.3330919"
          class="flex-1 min-w-[200px] w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          @keydown.enter="genDoi" />
        <UiButton :disabled="!doi.trim() || doiLoading"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          @click="genDoi">生成</UiButton>
      </div>
      <ResultBlock v-if="doiResult" :result="doiResult" :meta="doiMeta" />
    </div>

    <!-- 粘贴文本 -->
    <div v-if="activeTab === 'freetext'" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 max-[640px]:p-4">
      <p class="text-[#6e6e73] text-[13px] m-0 mb-4">粘贴论文标题和摘要，快速生成精读卡</p>
      <UiInput v-model="ftTitle" placeholder="论文标题"
        class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm mb-3" />
      <textarea v-model="ftText" rows="5" placeholder="粘贴摘要或正文内容.."
        class="w-full px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-y"></textarea>
      <UiButton :disabled="!ftTitle.trim() || !ftText.trim() || ftLoading"
        class="mt-3.5 h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        @click="genFreeText">生成精读卡</UiButton>
      <ResultBlock v-if="ftResult" :result="ftResult" :meta="ftMeta" />
    </div>

    <!-- 文档精读 -->
    <div v-if="activeTab === 'doc'" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 max-[640px]:p-4">
      <p class="text-[#6e6e73] text-[13px] m-0 mb-4">对已上传的本地文档生成精读卡</p>
      <div class="flex gap-2.5 items-center flex-wrap">
        <UiSelect v-model="docId"
          class="flex-1 min-w-[200px] h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none appearance-none cursor-pointer">
          <UiOption value="" disabled>选择文档</UiOption>
          <UiOption v-for="d in docs" :key="d.id" :value="String(d.id)">
            {{ d.filename }} ({{ (d.sizeBytes/1024).toFixed(0) }} KB)
          </UiOption>
        </UiSelect>
        <UiButton :disabled="!docId || docLoading"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          @click="genDoc(false)">生成</UiButton>
        <UiButton :disabled="!docId || docLoading"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          @click="genDoc(true)">重新生成</UiButton>
      </div>
      <ResultBlock v-if="docResult" :result="docResult" :meta="docMeta" />
    </div>

    <div v-if="error" class="flex items-center gap-3 p-4 rounded-[12px] bg-[rgba(196,75,63,0.08)] text-[13px] text-[#c44b3f] mt-4">
      <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
      <span class="flex-1">{{ error }}</span>
      <UiButton class="text-[#c44b3f] hover:text-[#d62d25] cursor-pointer bg-transparent border-none text-lg leading-none"
        @click="error = ''">&times;</UiButton>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@/components/ui/icons'
import { getDocuments, summarizeArxiv, summarizeDoi, summarizeFreeText, summarizeDocument } from '../../api/tap'
import LucideIcon from '../../components/LucideIcon.vue'
import ResultBlock from './components/ResultBlock.vue'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

const route = useRoute()
const queryDocId = typeof route.query.docId === 'string' ? route.query.docId : ''
const SUMMARY_CARD_STATE_KEY = 'tap_summary_card_state_v1'
const activeTab = ref(queryDocId ? 'doc' : 'arxiv')
const error = ref('')

const tabs = [
  { key: 'arxiv', label: 'arXiv 论文', icon: 'file' },
  { key: 'doi', label: 'DOI 查询', icon: 'link' },
  { key: 'freetext', label: '粘贴文本', icon: 'pen' },
  { key: 'doc', label: '文档精读', icon: 'folder' },
]
const validTabs = new Set(tabs.map((tab) => tab.key))

const arxivId = ref(''); const arxivLoading = ref(false); const arxivResult = ref(''); const arxivMeta = ref('')
const doi = ref(''); const doiLoading = ref(false); const doiResult = ref(''); const doiMeta = ref('')
const ftTitle = ref(''); const ftText = ref(''); const ftLoading = ref(false); const ftResult = ref(''); const ftMeta = ref('')
const docId = ref(queryDocId || ''); const docLoading = ref(false); const docResult = ref(''); const docMeta = ref('')
const docs = ref([]); const docsLoading = ref(false)

watch(() => route.query.docId, (val) => {
  const nextDocId = typeof val === 'string' ? val : ''
  if (nextDocId) {
    docId.value = nextDocId
    activeTab.value = 'doc'
  }
})

const saveLocalState = () => {
  const payload = {
    activeTab: activeTab.value,
    arxivId: arxivId.value,
    arxivResult: arxivResult.value,
    arxivMeta: arxivMeta.value,
    doi: doi.value,
    doiResult: doiResult.value,
    doiMeta: doiMeta.value,
    ftTitle: ftTitle.value,
    ftText: ftText.value,
    ftResult: ftResult.value,
    ftMeta: ftMeta.value,
    docId: docId.value,
    docResult: docResult.value,
    docMeta: docMeta.value,
    error: error.value,
  }
  try {
    localStorage.setItem(SUMMARY_CARD_STATE_KEY, JSON.stringify(payload))
  } catch {
    // ignore localStorage errors
  }
}

const restoreLocalState = () => {
  try {
    const raw = localStorage.getItem(SUMMARY_CARD_STATE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)

    if (!queryDocId && typeof data?.activeTab === 'string' && validTabs.has(data.activeTab)) activeTab.value = data.activeTab
    if (typeof data?.arxivId === 'string') arxivId.value = data.arxivId
    if (typeof data?.arxivResult === 'string') arxivResult.value = data.arxivResult
    if (typeof data?.arxivMeta === 'string') arxivMeta.value = data.arxivMeta
    if (typeof data?.doi === 'string') doi.value = data.doi
    if (typeof data?.doiResult === 'string') doiResult.value = data.doiResult
    if (typeof data?.doiMeta === 'string') doiMeta.value = data.doiMeta
    if (typeof data?.ftTitle === 'string') ftTitle.value = data.ftTitle
    if (typeof data?.ftText === 'string') ftText.value = data.ftText
    if (typeof data?.ftResult === 'string') ftResult.value = data.ftResult
    if (typeof data?.ftMeta === 'string') ftMeta.value = data.ftMeta
    if (!queryDocId && typeof data?.docId === 'string') docId.value = data.docId
    if (typeof data?.docResult === 'string') docResult.value = data.docResult
    if (typeof data?.docMeta === 'string') docMeta.value = data.docMeta
    if (typeof data?.error === 'string') error.value = getFriendlyErrorMessage(data.error, '摘要生成失败，请稍后重试')
  } catch {
    // ignore parse errors
  }
}

let persistTimer = null
const scheduleSaveLocalState = () => {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    persistTimer = null
    saveLocalState()
  }, 120)
}

watch(
  [activeTab, arxivId, arxivResult, arxivMeta, doi, doiResult, doiMeta, ftTitle, ftText, ftResult, ftMeta, docId, docResult, docMeta, error],
  scheduleSaveLocalState
)

const loadDocs = async () => {
  docsLoading.value = true
  try { const res = await getDocuments(); docs.value = res?.data ?? res ?? [] } catch (e) { logger.error(e) }
  docsLoading.value = false
}

const unwrap = (res) => res?.data ?? res

const genArxiv = async (force) => {
  const id = arxivId.value.trim()
  if (!id) return
  arxivLoading.value = true; error.value = ''; arxivResult.value = ''
  try {
    const d = unwrap(await summarizeArxiv(id, force))
    arxivResult.value = d?.markdown ?? ''
  arxivMeta.value = d ? `引擎：${d.provider} | 模型：${d.model} | 字数：${d.charCountZh}` : ''
  } catch (e) {
    const msg = e.message || ''
    if (msg.includes('timeout') || msg.includes('Timeout') || msg.includes('ECONNABORTED')) {
      error.value = 'arXiv 论文抓取超时，请稍后重试。部分论文 PDF 较大，可能需要更长时间。'
    } else {
      error.value = getFriendlyErrorMessage(e, 'arXiv 摘要生成失败，请稍后重试')
    }
  }
  arxivLoading.value = false
}

const genDoi = async () => {
  if (!doi.value.trim()) return; doiLoading.value = true; error.value = ''
  try {
    const d = unwrap(await summarizeDoi(doi.value.trim()))
    doiResult.value = d?.markdown ?? ''
  doiMeta.value = d ? `《${d.title}》| 引擎：${d.provider}` : ''
  } catch (e) { error.value = getFriendlyErrorMessage(e, 'DOI 摘要生成失败，请稍后重试') }
  doiLoading.value = false
}

const genFreeText = async () => {
  if (!ftTitle.value.trim() || !ftText.value.trim()) return; ftLoading.value = true; error.value = ''
  try {
    const d = unwrap(await summarizeFreeText(ftTitle.value.trim(), ftText.value.trim()))
    ftResult.value = d?.markdown ?? ''
  ftMeta.value = d ? `引擎：${d.provider} | 字数：${d.charCountZh}` : ''
  } catch (e) { error.value = getFriendlyErrorMessage(e, '文本摘要生成失败，请稍后重试') }
  ftLoading.value = false
}

const genDoc = async (force) => {
  if (!docId.value) return; docLoading.value = true; error.value = ''
  try {
    const d = unwrap(await summarizeDocument(docId.value, force))
    docResult.value = d?.markdown ?? ''
  docMeta.value = d ? `引擎：${d.provider} | 模型：${d.model}` : ''
  } catch (e) { error.value = getFriendlyErrorMessage(e, '文档摘要生成失败，请稍后重试') }
  docLoading.value = false
}

onMounted(() => {
  restoreLocalState()
  loadDocs()
})

onUnmounted(() => {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = null
})
</script>


