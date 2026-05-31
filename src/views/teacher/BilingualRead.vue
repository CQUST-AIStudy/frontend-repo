<template>
  <div class="bilingual-page [min-height:100%] [font-family:-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_'Helvetica_Neue',_Arial,_sans-serif]">
    <!-- 顶部 -->
    <div class="hero [background:#fff] [border-radius:16px] [padding:28px_32px] [margin-bottom:24px] [border:1px_solid_#dadce0] [display:flex] [align-items:center]">
      <div class="hero-inner [display:flex] [align-items:center] [gap:16px]">
        <div class="hero-icon [font-size:36px]">🌐</div>
        <div class="hero-text [&_h1]:[margin:0_0_4px] [&_h1]:[font-size:22px] [&_h1]:[font-weight:400] [&_h1]:[color:#202124] [&_p]:[margin:0] [&_p]:[font-size:14px] [&_p]:[color:#5f6368]">
          <h1>双语对照阅读</h1>
          <p>高质量翻译，左右对照查看文档内容</p>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel [display:flex] [align-items:center] [gap:12px] [flex-wrap:wrap] [background:#fff] [border-radius:16px] [padding:16px_20px] [margin-bottom:24px] [border:1px_solid_#dadce0]">
      <el-select v-model="docId" placeholder="选择文档" :loading="docsLoading" filterable class="ctrl-select [flex:1] [min-width:200px]"
        @change="onDocChange">
        <el-option v-for="d in docs" :key="d.id" :value="String(d.id)"
          :label="`${d.filename} (${(d.sizeBytes/1024).toFixed(0)} KB)`" />
      </el-select>
      <el-select v-model="lang" class="ctrl-lang [width:120px]">
        <el-option label="中文" value="ZH" />
        <el-option label="英文" value="EN-US" />
        <el-option label="日文" value="JA" />
        <el-option label="韩文" value="KO" />
        <el-option label="法文" value="FR" />
        <el-option label="德文" value="DE" />
      </el-select>
      <el-checkbox v-model="force" label="强制重新翻译" />
      <el-button type="primary" :loading="loading" :disabled="!docId" @click="translate">
        {{ loading ? '翻译中...' : '开始翻译' }}
      </el-button>
      <span v-if="meta" class="meta-tag [font-size:12px] [color:#5f6368] [background:#f1f3f4] [padding:4px_10px] [border-radius:100px]">{{ meta }}</span>
    </div>

    <el-alert v-if="error" :title="error" type="error" show-icon closable
      class="[margin-bottom:20px]" @close="error = ''" />

    <!-- 翻译结果 -->
    <div v-if="segments.length > 0" class="segments-list [display:flex] [flex-direction:column] [gap:10px]">
      <div class="segments-header [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:12px]">
        <span class="seg-count [font-size:13px] [color:#5f6368]">全{{ segments.length }} 段</span>
      </div>
      <div v-for="seg in segments" :key="seg.index" class="seg-row [display:flex] [align-items:stretch] [gap:0] [background:#fff] [border-radius:16px] [overflow:hidden] [border:1px_solid_#dadce0] [transition:all_.2s] hover:[box-shadow:0_1px_3px_rgba(60,64,67,0.15),_0_4px_8px_rgba(60,64,67,0.08)]">
        <div class="seg-num [width:44px] [display:flex] [align-items:center] [justify-content:center] [background:#f8f9fa] [color:#9aa0a6] [font-size:13px] [font-weight:500] [flex-shrink:0] [border-right:1px_solid_#e8eaed]">{{ seg.index + 1 }}</div>
        <div class="seg-source [flex:1] [padding:16px_20px]">
          <div class="seg-label [font-size:11px] [font-weight:500] [text-transform:uppercase] [color:#1a73e8] [margin-bottom:8px] [letter-spacing:.5px] [&.target]:[color:#1e8e3e]">原文</div>
          <div class="seg-body [font-size:14px] [line-height:1.8] [color:#202124] [white-space:pre-wrap]">{{ seg.source }}</div>
        </div>
        <div class="seg-divider [width:1px] [background:#e8eaed] [flex-shrink:0]"></div>
        <div class="seg-target [flex:1] [padding:16px_20px]">
          <div class="seg-label target [font-size:11px] [font-weight:500] [text-transform:uppercase] [color:#1a73e8] [margin-bottom:8px] [letter-spacing:.5px] [&.target]:[color:#1e8e3e]">译文</div>
          <div class="seg-body [font-size:14px] [line-height:1.8] [color:#202124] [white-space:pre-wrap]">{{ seg.target }}</div>
        </div>
      </div>
    </div>

    <el-empty v-if="!loading && segments.length === 0 && !error" description="选择文档后点击「开始翻译」">
      <template #image>
        <div class="[font-size:48px]">📄</div>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getDocuments, translateDocument } from '../../api/tap'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

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
    // Handle the response - segments may be nested in data
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
      error.value = '翻译服务未配置 API Key，当前使用模拟翻译模式'
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


