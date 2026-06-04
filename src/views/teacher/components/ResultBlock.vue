<template>
  <div class="result-block [margin-top:20px] [border:0.5px_solid_rgba(0,_0,_0,_0.06)] [border-radius:16px] [overflow:hidden] [background:#fff]">
    <div class="result-header [display:flex] [justify-content:space-between] [align-items:center] [padding:12px_20px] [background:#f9f9f9] [border-bottom:0.5px_solid_rgba(0,_0,_0,_0.06)] [margin-bottom:20px] [padding:16px] [border-radius:8px] [margin-bottom:10px]">
      <p v-if="meta" class="meta-text [color:#6e6e73] [font-size:12px] [margin:0]">{{ meta }}</p>
      <div class="actions [display:flex] [gap:6px]">
        <ui-button size="small" plain @click="copyText">
          <ui-icon><DocumentCopy /></ui-icon> {{ copied ? '已复制' : '复制' }}
        </ui-button>
        <ui-button size="small" plain @click="downloadMd">
          <ui-icon><Download /></ui-icon> 下载
        </ui-button>
        <ui-button size="small" plain @click="showRaw = !showRaw">
          <ui-icon><Edit /></ui-icon> {{ showRaw ? '渲染' : '源码' }}
        </ui-button>
      </div>
    </div>
    <ui-input
      v-if="showRaw"
      type="textarea"
      :model-value="result"
      readonly
      :rows="12"
      class="raw-textarea [&_.ui-textarea__inner]:[font-family:'Menlo',_'Consolas',_monospace] [&_.ui-textarea__inner]:[font-size:12px] [&_.ui-textarea__inner]:[background:#f9f9f9] [&_.ui-textarea__inner]:[border:none] [&_.ui-textarea__inner]:[border-radius:0]"
    />
    <div v-else class="markdown-body [padding:24px] [font-size:14px] [line-height:1.8] [color:#1d1d1f] [&_h1]:[margin-top:20px] [&_h1]:[margin-bottom:10px] [&_h1]:[color:#1d1d1f] [&_h1]:[font-weight:700] [&_h2]:[margin-top:20px] [&_h2]:[margin-bottom:10px] [&_h2]:[color:#1d1d1f] [&_h2]:[font-weight:700] [&_h3]:[margin-top:20px] [&_h3]:[margin-bottom:10px] [&_h3]:[color:#1d1d1f] [&_h3]:[font-weight:700] [&_h2]:[font-size:18px] [&_h2]:[padding-bottom:6px] [&_h2]:[border-bottom:2px_solid_rgba(0,_0,_0,_0.08)] [&_table]:[border-collapse:collapse] [&_table]:[width:100%] [&_table]:[margin:12px_0] [&_th]:[border:0.5px_solid_rgba(0,_0,_0,_0.06)] [&_th]:[padding:8px_12px] [&_th]:[text-align:left] [&_td]:[border:0.5px_solid_rgba(0,_0,_0,_0.06)] [&_td]:[padding:8px_12px] [&_td]:[text-align:left] [&_th]:[background:#f9f9f9] [&_th]:[font-weight:600] [&_th]:[color:#1d1d1f] [&_code]:[background:#f5f5f7] [&_code]:[padding:2px_6px] [&_code]:[border-radius:4px] [&_code]:[font-size:13px] [&_code]:[color:#007aff] [&_pre]:[background:#1d1d1f] [&_pre]:[padding:16px] [&_pre]:[border-radius:8px] [&_pre]:[overflow-x:auto] [&_pre]:[margin:12px_0] [&_pre_code]:[background:none] [&_pre_code]:[padding:0] [&_pre_code]:[color:#e5e5e7] [&_blockquote]:[border-left:4px_solid_#007aff] [&_blockquote]:[padding-left:16px] [&_blockquote]:[color:#6e6e73] [&_blockquote]:[margin:12px_0] [&_a]:[color:#007aff] [&_a]:[text-decoration:none] [&_a:hover]:[text-decoration:underline] [&_ul]:[padding-left:20px] [&_ol]:[padding-left:20px] [&_li]:[margin:4px_0]" v-html="renderedHtml"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DocumentCopy, Download, Edit } from '@/components/ui/icons'
import { renderSafeMarkdown } from '@/utils/safeHtml'

const props = defineProps({
  result: { type: String, default: '' },
  meta: { type: String, default: '' }
})

const showRaw = ref(false)
const copied = ref(false)

const renderedHtml = computed(() => renderSafeMarkdown(props.result))

const copyText = () => {
  navigator.clipboard.writeText(props.result)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const downloadMd = () => {
  const blob = new Blob([props.result], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `summary-${Date.now()}.md`; a.click()
  URL.revokeObjectURL(url)
}
</script>


