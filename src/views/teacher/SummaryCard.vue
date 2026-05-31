<template>
  <div class="summary-page [min-height:100%] [font-family:-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_'Helvetica_Neue',_Arial,_sans-serif]">
    <!-- 顶部 -->
    <div class="hero [background:#fff] [border-radius:16px] [padding:28px_32px] [margin-bottom:24px] [border:1px_solid_#dadce0] [display:flex] [align-items:center]">
      <div class="hero-inner [display:flex] [align-items:center] [gap:16px]">
        <div class="hero-icon [font-size:36px]">📖</div>
        <div class="hero-text [&_h1]:[margin:0_0_4px] [&_h1]:[font-size:22px] [&_h1]:[font-weight:400] [&_h1]:[color:#202124] [&_p]:[margin:0] [&_p]:[font-size:14px] [&_p]:[color:#5f6368]">
          <h1>AI 精读卡片</h1>
          <p>支持 arXiv、DOI、粘贴文本、本地文档，一键生成结构化精读</p>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="tab-bar [display:flex] [gap:0] [margin-bottom:20px] [border-bottom:1px_solid_#dadce0]">
      <div v-for="t in tabs" :key="t.key"
        :class="['tab-item', { active: activeTab === t.key }]"
        @click="activeTab = t.key">
        <span class="tab-icon [font-size:16px]">{{ t.icon }}</span>
        <span>{{ t.label }}</span>
      </div>
    </div>

    <!-- arXiv -->
    <div v-if="activeTab === 'arxiv'" class="panel [background:#fff] [border-radius:16px] [padding:24px_28px] [border:1px_solid_#dadce0]">
      <p class="panel-desc [color:#5f6368] [font-size:13px] [margin:0_0_16px]">输入 arXiv ID，自动抓取论文全文并生成精读卡（首次抓取可能需要30-60 秒）</p>
      <div class="inline-form [display:flex] [gap:10px] [align-items:center] [flex-wrap:wrap]">
        <el-input v-model="arxivId" placeholder="例如：706.03762" class="form-input [flex:1] [min-width:200px]"
          @keydown.enter="genArxiv(false)" clearable />
        <el-button type="primary" :loading="arxivLoading" :disabled="!arxivId.trim()" @click="genArxiv(false)">
          {{ arxivLoading ? '正在抓取论文...' : '生成' }}
        </el-button>
        <el-button :loading="arxivLoading" :disabled="!arxivId.trim()" @click="genArxiv(true)">重新生成</el-button>
      </div>
      <div v-if="arxivLoading" class="loading-hint [display:flex] [align-items:center] [gap:8px] [margin-top:16px] [padding:12px_16px] [background:#e8f0fe] [border-radius:8px] [color:#1a73e8] [font-size:13px] [gap:10px] [padding:20px] [color:#8a9cb0]">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在从arXiv 抓取论文并生成精读，请耐心等待...</span>
      </div>
      <ResultBlock v-if="arxivResult" :result="arxivResult" :meta="arxivMeta" />
    </div>

    <!-- DOI -->
    <div v-if="activeTab === 'doi'" class="panel [background:#fff] [border-radius:16px] [padding:24px_28px] [border:1px_solid_#dadce0]">
      <p class="panel-desc [color:#5f6368] [font-size:13px] [margin:0_0_16px]">输入论文 DOI，通过 Crossref 获取元数据并生成精读卡</p>
      <div class="inline-form [display:flex] [gap:10px] [align-items:center] [flex-wrap:wrap]">
        <el-input v-model="doi" placeholder="例如：0.1145/3292500.3330919" class="form-input [flex:1] [min-width:200px]"
          @keydown.enter="genDoi" clearable />
        <el-button type="primary" :loading="doiLoading" :disabled="!doi.trim()" @click="genDoi">生成</el-button>
      </div>
      <ResultBlock v-if="doiResult" :result="doiResult" :meta="doiMeta" />
    </div>

    <!-- 粘贴文本 -->
    <div v-if="activeTab === 'freetext'" class="panel [background:#fff] [border-radius:16px] [padding:24px_28px] [border:1px_solid_#dadce0]">
      <p class="panel-desc [color:#5f6368] [font-size:13px] [margin:0_0_16px]">粘贴论文标题和摘要，快速生成精读卡</p>
      <el-input v-model="ftTitle" placeholder="论文标题" class="[margin-bottom:12px]" clearable />
      <el-input v-model="ftText" type="textarea" :rows="5" placeholder="粘贴摘要或正文内容.." />
      <el-button type="primary" :loading="ftLoading" :disabled="!ftTitle.trim() || !ftText.trim()"
        class="[margin-top:14px]" @click="genFreeText">生成精读卡</el-button>
      <ResultBlock v-if="ftResult" :result="ftResult" :meta="ftMeta" />
    </div>

    <!-- 文档精读 -->
    <div v-if="activeTab === 'doc'" class="panel [background:#fff] [border-radius:16px] [padding:24px_28px] [border:1px_solid_#dadce0]">
      <p class="panel-desc [color:#5f6368] [font-size:13px] [margin:0_0_16px]">对已上传的本地文档生成精读卡</p>
      <div class="inline-form [display:flex] [gap:10px] [align-items:center] [flex-wrap:wrap]">
        <el-select v-model="docId" placeholder="选择文档" :loading="docsLoading" filterable class="form-input [flex:1] [min-width:200px]">
          <el-option v-for="d in docs" :key="d.id" :value="String(d.id)"
            :label="`${d.filename} (${(d.sizeBytes/1024).toFixed(0)} KB)`" />
        </el-select>
        <el-button type="primary" :loading="docLoading" :disabled="!docId" @click="genDoc(false)">生成</el-button>
        <el-button :loading="docLoading" :disabled="!docId" @click="genDoc(true)">重新生成</el-button>
      </div>
      <ResultBlock v-if="docResult" :result="docResult" :meta="docMeta" />
    </div>

    <el-alert v-if="error" :title="error" type="error" show-icon closable
      class="[margin-top:16px]" @close="error = ''" />
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { getDocuments, summarizeArxiv, summarizeDoi, summarizeFreeText, summarizeDocument } from '../../api/tap'
import ResultBlock from './components/ResultBlock.vue'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

const route = useRoute()
const queryDocId = typeof route.query.docId === 'string' ? route.query.docId : ''
const SUMMARY_CARD_STATE_KEY = 'tap_summary_card_state_v1'
const activeTab = ref(queryDocId ? 'doc' : 'arxiv')
const error = ref('')

const tabs = [
  { key: 'arxiv', label: 'arXiv 论文', icon: '📄' },
  { key: 'doi', label: 'DOI 查询', icon: '🔗' },
  { key: 'freetext', label: '粘贴文本', icon: '📝' },
  { key: 'doc', label: '文档精读', icon: '📁' },
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


