<template>
  <div class="result-block [margin-top:20px] [border:1px_solid_#dadce0] [border-radius:16px] [overflow:hidden] [background:#fff]">
    <div class="result-header [display:flex] [justify-content:space-between] [align-items:center] [padding:12px_20px] [background:#f8f9fa] [border-bottom:1px_solid_#dadce0] [margin-bottom:20px] [padding:16px] [border-radius:8px] [margin-bottom:10px]">
      <p v-if="meta" class="meta-text [color:#5f6368] [font-size:12px] [margin:0]">{{ meta }}</p>
      <div class="actions [display:flex] [gap:6px]">
        <el-button size="small" plain @click="copyText">
          <el-icon><DocumentCopy /></el-icon> {{ copied ? '已复制' : '复制' }}
        </el-button>
        <el-button size="small" plain @click="downloadMd">
          <el-icon><Download /></el-icon> 下载
        </el-button>
        <el-button size="small" plain @click="showRaw = !showRaw">
          <el-icon><Edit /></el-icon> {{ showRaw ? '渲染' : '源码' }}
        </el-button>
      </div>
    </div>
    <el-input
      v-if="showRaw"
      type="textarea"
      :model-value="result"
      readonly
      :rows="12"
      class="raw-textarea [&_.el-textarea__inner]:[font-family:'Menlo',_'Consolas',_monospace] [&_.el-textarea__inner]:[font-size:12px] [&_.el-textarea__inner]:[background:#f8f9fa] [&_.el-textarea__inner]:[border:none] [&_.el-textarea__inner]:[border-radius:0]"
    />
    <div v-else class="markdown-body [padding:24px] [font-size:14px] [line-height:1.8] [color:#202124] [&_h1]:[margin-top:20px] [&_h1]:[margin-bottom:10px] [&_h1]:[color:#202124] [&_h1]:[font-weight:700] [&_h2]:[margin-top:20px] [&_h2]:[margin-bottom:10px] [&_h2]:[color:#202124] [&_h2]:[font-weight:700] [&_h3]:[margin-top:20px] [&_h3]:[margin-bottom:10px] [&_h3]:[color:#202124] [&_h3]:[font-weight:700] [&_h2]:[font-size:18px] [&_h2]:[padding-bottom:6px] [&_h2]:[border-bottom:2px_solid_#dadce0] [&_table]:[border-collapse:collapse] [&_table]:[width:100%] [&_table]:[margin:12px_0] [&_th]:[border:1px_solid_#dadce0] [&_th]:[padding:8px_12px] [&_th]:[text-align:left] [&_td]:[border:1px_solid_#dadce0] [&_td]:[padding:8px_12px] [&_td]:[text-align:left] [&_th]:[background:#f8f9fa] [&_th]:[font-weight:600] [&_th]:[color:#202124] [&_code]:[background:#f1f3f4] [&_code]:[padding:2px_6px] [&_code]:[border-radius:4px] [&_code]:[font-size:13px] [&_code]:[color:#1a73e8] [&_pre]:[background:#202124] [&_pre]:[padding:16px] [&_pre]:[border-radius:8px] [&_pre]:[overflow-x:auto] [&_pre]:[margin:12px_0] [&_pre_code]:[background:none] [&_pre_code]:[padding:0] [&_pre_code]:[color:#dadce0] [&_blockquote]:[border-left:4px_solid_#1a73e8] [&_blockquote]:[padding-left:16px] [&_blockquote]:[color:#5f6368] [&_blockquote]:[margin:12px_0] [&_a]:[color:#1a73e8] [&_a]:[text-decoration:none] [&_a:hover]:[text-decoration:underline] [&_ul]:[padding-left:20px] [&_ol]:[padding-left:20px] [&_li]:[margin:4px_0]" v-html="renderedHtml"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DocumentCopy, Download, Edit } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  result: { type: String, default: '' },
  meta: { type: String, default: '' }
})

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })
const showRaw = ref(false)
const copied = ref(false)

const renderedHtml = computed(() => md.render(props.result))

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


