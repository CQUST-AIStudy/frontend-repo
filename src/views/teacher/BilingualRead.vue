<template>
  <div class="min-h-full">
    <!-- Hero -->
    <div class="flex items-center gap-4 p-7 mb-6 rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
      <div class="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef5ff] text-[#1677ff]">
        <LucideIcon name="globe" :size="26" />
      </div>
      <div>
        <h1 class="m-0 mb-1 text-[22px] font-semibold text-[#1d1d1f]">双语对照阅读</h1>
        <p class="m-0 text-sm text-[#6e6e73]">高质量翻译，左右对照查看文档内容</p>
      </div>
    </div>

    <!-- Control Panel -->
    <div class="flex items-center gap-3 flex-wrap p-4 px-5 mb-6 rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
      <UiSelect v-model="docId" @change="onDocChange" class="flex-1 min-w-[200px] h-10 px-3.5 rounded-[10px] bg-[rgba(245,245,247,0.8)] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm text-[#1d1d1f] outline-none transition-all focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] appearance-none cursor-pointer">
        <UiOption value="" disabled>选择文档</UiOption>
        <UiOption v-for="d in docs" :key="d.id" :value="String(d.id)">{{ d.filename }} ({{ (d.sizeBytes/1024).toFixed(0) }} KB)</UiOption>
      </UiSelect>

      <UiSelect v-model="lang" class="w-[120px] h-10 px-3.5 rounded-[10px] bg-[rgba(245,245,247,0.8)] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm text-[#1d1d1f] outline-none transition-all focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] appearance-none cursor-pointer">
        <UiOption value="ZH">中文</UiOption>
        <UiOption value="EN-US">英文</UiOption>
        <UiOption value="JA">日文</UiOption>
        <UiOption value="KO">韩文</UiOption>
        <UiOption value="FR">法文</UiOption>
        <UiOption value="DE">德文</UiOption>
      </UiSelect>

      <label class="inline-flex items-center gap-2 text-sm text-[#1d1d1f] cursor-pointer select-none">
        <UiInput type="checkbox" v-model="force" class="w-4 h-4 rounded accent-[var(--app-primary)]" />
        强制重新翻译
      </label>

      <UiButton @click="translate" :disabled="!docId || loading" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:pointer-events-none">
        {{ loading ? '翻译中...' : '开始翻译' }}
      </UiButton>

      <span v-if="meta" class="text-[12px] text-[#6e6e73] bg-[#f5f5f7] px-2.5 py-1 rounded-full">{{ meta }}</span>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="flex items-start gap-3 p-4 mb-5 rounded-[14px] border border-[rgba(196,75,63,0.2)] bg-[rgba(196,75,63,0.06)]">
      <LucideIcon name="alert-triangle" class="shrink-0 text-[#c44b3f]" :size="19" />
      <div class="flex-1 text-sm text-[#c44b3f]">{{ error }}</div>
      <UiButton @click="error = ''" class="text-[#c44b3f]/60 hover:text-[#c44b3f] text-lg cursor-pointer bg-transparent border-none">×</UiButton>
    </div>

    <!-- Segments -->
    <div v-if="segments.length > 0" class="flex flex-col gap-2.5">
      <div class="flex justify-between items-center mb-3">
        <span class="text-[13px] text-[#6e6e73]">共 {{ segments.length }} 段</span>
      </div>
      <div v-for="seg in segments" :key="seg.index" class="flex items-stretch gap-0 bg-white rounded-2xl overflow-hidden border border-black/[0.06] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
        <div class="w-11 flex items-center justify-center bg-[#f9f9f9] text-[#aeaeb2] text-[13px] font-medium shrink-0 border-r border-black/[0.06]">{{ seg.index + 1 }}</div>
        <div class="flex-1 p-4 px-5">
          <div class="text-[11px] font-medium uppercase text-[var(--app-primary)] mb-2 tracking-wide">原文</div>
          <div class="text-sm leading-[1.8] text-[#1d1d1f] whitespace-pre-wrap">{{ seg.source }}</div>
        </div>
        <div class="w-px bg-black/[0.06] shrink-0"></div>
        <div class="flex-1 p-4 px-5">
          <div class="text-[11px] font-medium uppercase text-[#6b8f6b] mb-2 tracking-wide">译文</div>
          <div class="text-sm leading-[1.8] text-[#1d1d1f] whitespace-pre-wrap">{{ seg.target }}</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && segments.length === 0 && !error" class="flex flex-col items-center justify-center py-20 text-center">
      <LucideIcon name="file" class="mb-4 text-[#c6ccd6]" :size="48" />
      <p class="text-sm text-[#aeaeb2]">选择文档后点击「开始翻译」</p>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getDocuments, translateDocument } from '../../api/tap'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'
import LucideIcon from '../../components/LucideIcon.vue'

const route = useRoute()
const docId = ref(route.query.docId || '')
const lang = ref('ZH')
const force = ref(false)
const loading = ref(false)
const meta = ref('')
const segments = ref([])
const error = ref('')
const docs = ref([])
const docsLoading = ref(false)

watch(() => route.query.docId, (val) => { if (val) docId.value = val })

const onDocChange = () => {
  segments.value = []
  meta.value = ''
  error.value = ''
}

const loadDocs = async () => {
  docsLoading.value = true
  try {
    const res = await getDocuments()
    docs.value = res?.data ?? res ?? []
  } catch (e) {
    logger.error(e)
    error.value = getFriendlyErrorMessage(e, '获取文档列表失败，请稍后重试')
  }
  docsLoading.value = false
}

const translate = async () => {
  if (!docId.value) return
  loading.value = true; error.value = ''; segments.value = []
  try {
    const res = await translateDocument(docId.value, lang.value, force.value)
    const data = res?.data ?? res
    if (!data) {
      error.value = '翻译返回数据为空'
      loading.value = false
      return
    }
    const segs = data.segments ?? data.data?.segments ?? []
    if (segs.length === 0) {
      error.value = '文档没有可翻译的文本内容，请确认文档已正确上传且包含文本'
      loading.value = false
      return
    }
    meta.value = `文档：${data.path ?? docId.value} | 引擎：${data.provider ?? 'unknown'}`
    segments.value = segs
  } catch (e) {
    const msg = e.message || ''
    if (msg.includes('DEEPL_API_KEY')) {
      error.value = '翻译服务未配置 API Key，无法生成翻译结果，请联系管理员配置后重试'
    } else if (msg.includes('document not found')) {
      error.value = '文档未找到，请刷新文档列表后重试'
    } else if (msg.includes('no text to translate')) {
      error.value = '文档没有可提取的文本内容'
    } else {
      error.value = getFriendlyErrorMessage(e, '翻译失败，请稍后重试')
    }
  }
  loading.value = false
}

onMounted(loadDocs)
</script>
