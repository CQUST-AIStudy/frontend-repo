<template>
  <div class="min-h-full">
    <!-- 顶部横幅 -->
    <div class="flex items-center justify-between bg-white rounded-[16px] p-[28px_32px] mb-6 border border-black/[0.06] max-[640px]:flex-col max-[640px]:items-start max-[640px]:p-[20px] max-[640px]:gap-4">
      <div>
        <h1 class="m-0 mb-1.5 text-[22px] font-normal text-[#1d1d1f]">文档中心</h1>
        <p class="m-0 text-sm text-[#6e6e73]">上传、管理教学文档，一键翻译或 AI 精读</p>
      </div>
      <div class="flex gap-2.5 max-[640px]:flex-wrap">
        <UiButton
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5"
          @click="showUpload = true"
        >
          <UploadFilled class="w-4 h-4" />
          上传文档
        </UiButton>
        <UiButton
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5"
          @click="loadDocs"
        >
          <Refresh class="w-4 h-4" />
          刷新
        </UiButton>
        <UiButton
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#ff6259] to-[#c44b3f] shadow-[0_2px_8px_rgba(196,75,63,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          :disabled="docsLoading || docs.length === 0"
          @click="handleDeleteAll"
        >
          <svg v-if="clearingAll" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-75"/></svg>
          <Delete v-else class="w-4 h-4" />
          清空全部
        </UiButton>
      </div>
    </div>

    <!-- 上传抽屉 -->
    <AppDrawer v-model="showUpload" title="上传文档" size="450px">
      <div class="px-1">
        <!-- 文件夹名称 -->
        <div class="mb-5">
          <label class="block text-sm font-medium text-[#1d1d1f] mb-2">文件夹名称</label>
          <UiInput
            v-model="folderName"
            placeholder="例如：数据结构课件"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
        </div>

        <ui-upload
          drag multiple :auto-upload="false"
          :on-change="handleFileChange" :file-list="fileList"
          :on-remove="handleFileRemove" accept=".pdf,.docx,.doc,.txt"
          class="mt-4 w-full [&_.ui-upload]:!w-full [&_.ui-upload-dragger]:!border-2 [&_.ui-upload-dragger]:!border-dashed [&_.ui-upload-dragger]:!border-[var(--app-primary)]/30 [&_.ui-upload-dragger]:!rounded-[14px] [&_.ui-upload-dragger]:!bg-[#f5f5f7] [&_.ui-upload-dragger]:hover:!border-[var(--app-primary)]/60 [&_.ui-upload-dragger]:hover:!bg-[#fbf1eb]"
        >
          <div class="text-center py-7">
            <UploadFilled class="w-10 h-10 text-[var(--app-primary)] mx-auto" />
            <p class="mt-2.5 mb-1 text-[15px] text-[#1d1d1f]">拖拽文件到此处，或点击选择</p>
            <p class="m-0 text-xs text-[#6e6e73]">支持 PDF、DOCX、DOC、TXT，单文件最大50 MB</p>
          </div>
        </ui-upload>

        <UiButton
          v-if="fileList.length > 0"
          :disabled="uploading"
          class="w-full mt-5 h-[42px] rounded-full text-[15px] font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          @click="handleUpload"
        >
          <svg v-if="uploading" class="inline w-4 h-4 mr-1.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-75"/></svg>
          {{ uploading ? '上传中...' : `上传 ${fileList.length} 个文件` }}
        </UiButton>

        <!-- 上传错误提示 -->
        <div v-if="uploadError" class="flex items-start gap-3 p-4 rounded-[14px] border border-[rgba(196,75,63,0.2)] bg-[rgba(196,75,63,0.06)] mt-3">
          <svg class="w-5 h-5 text-[#c44b3f] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          <span class="text-sm text-[#c44b3f]">{{ uploadError }}</span>
        </div>
      </div>
    </AppDrawer>

    <!-- 文档列表 -->
    <div class="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4" :aria-busy="docsLoading">
      <!-- 空状态 -->
      <div v-if="docs.length === 0 && !docsLoading" class="col-span-full flex flex-col items-center justify-center py-20">
        <svg class="w-16 h-16 text-[#c7c7cc] mb-4" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" stroke-width="2"/>
          <path d="M22 24h20M22 32h20M22 40h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p class="text-sm text-[#6e6e73]">暂无文档，点击上方「上传文档」开始</p>
      </div>

      <!-- 文档卡片 -->
      <div
        v-for="doc in docs" :key="doc.id"
        class="flex items-center gap-3.5 bg-white rounded-[16px] p-[18px_20px] border border-black/[0.06] transition-all hover:shadow-[0_1px_3px_rgba(60,64,67,0.15),0_4px_8px_rgba(60,64,67,0.08)] hover:-translate-y-px max-[640px]:p-4"
      >
        <div class="w-12 h-12 rounded-xl bg-[#e8f0fe] flex items-center justify-center shrink-0">
          <span class="text-[var(--app-primary)] text-[11px] font-semibold tracking-wide">{{ getExt(doc.filename) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="m-0 mb-1 text-sm font-medium text-[#1d1d1f] truncate" :title="doc.filename">{{ doc.filename }}</p>
          <p class="m-0 text-xs text-[#6e6e73]">
            <span>{{ (doc.sizeBytes / 1024).toFixed(0) }} KB</span>
            <span v-if="doc.language"> · {{ doc.language }}</span>
          </p>
        </div>
        <div class="flex gap-1.5 shrink-0">
          <UiButton
            title="双语翻译"
            class="w-8 h-8 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] flex items-center justify-center hover:bg-[var(--app-primary)]/20 active:scale-90 transition-all cursor-pointer border-none"
            @click="goTranslate(doc.id)"
          >
            <Document class="w-4 h-4" />
          </UiButton>
          <UiButton
            title="AI 精读"
            class="w-8 h-8 rounded-full bg-[#6b8f6b]/10 text-[#6b8f6b] flex items-center justify-center hover:bg-[#6b8f6b]/20 active:scale-90 transition-all cursor-pointer border-none"
            @click="goSummary(doc.id)"
          >
            <MagicStick class="w-4 h-4" />
          </UiButton>
          <UiButton
            title="删除"
            class="w-8 h-8 rounded-full bg-[#c44b3f]/10 text-[#c44b3f] flex items-center justify-center hover:bg-[#c44b3f]/20 active:scale-90 transition-all cursor-pointer border-none"
            :disabled="deleting === doc.id"
            @click="handleDelete(doc.id)"
          >
            <svg v-if="deleting === doc.id" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-75"/></svg>
            <Delete v-else class="w-4 h-4" />
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage, messageBox } from '@/services/feedback'
import { UploadFilled, Refresh, Document, MagicStick, Delete } from '@/components/ui/icons'
import { getDocuments, deleteDocument, deleteAllDocuments, createFolder, uploadFiles } from '../../api/tap'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'
import AppDrawer from '../../components/AppDrawer.vue'

const router = useRouter()
const showUpload = ref(false)

// 文档列表
const docs = ref([])
const docsLoading = ref(false)

const loadDocs = async () => {
  docsLoading.value = true
  try {
    const res = await getDocuments()
    docs.value = res?.data ?? res ?? []
  } catch (e) { logger.error('获取文档列表失败:', e) }
  docsLoading.value = false
}

// 上传
const folderName = ref('我的文档')
const fileList = ref([])
const uploading = ref(false)
const uploadError = ref('')

const handleFileChange = (file) => { fileList.value.push(file) }
const handleFileRemove = (file) => { fileList.value = fileList.value.filter(f => f.uid !== file.uid) }

const handleUpload = async () => {
  if (!fileList.value.length) return
  uploading.value = true; uploadError.value = ''
  try {
    const folderRes = await createFolder(folderName.value)
    const folderId = folderRes?.data?.id ?? folderRes?.id
    if (!folderId) throw new Error('创建文件夹失败')
    await uploadFiles(folderId, fileList.value.map(f => f.raw || f))
    uiMessage.success('上传成功')
    fileList.value = []; showUpload.value = false; loadDocs()
  } catch (e) { uploadError.value = getFriendlyErrorMessage(e, '文件上传失败，请稍后重试') }
  uploading.value = false
}

// 删除
const deleting = ref(null)
const handleDelete = async (id) => {
  try { await messageBox.confirm('确定删除该文档？', '提示', { type: 'warning' }) } catch { return }
  deleting.value = id
  try { await deleteDocument(id); uiMessage.success('删除成功'); loadDocs() }
  catch (e) { uiMessage.error(getFriendlyErrorMessage(e, '删除失败，请稍后重试')) }
  deleting.value = null
}

const clearingAll = ref(false)
const handleDeleteAll = async () => {
  try {
    await messageBox.confirm('确定清空文档中心全部文档？该操作不可恢复。', '提示', { type: 'warning' })
  } catch {
    return
  }

  clearingAll.value = true
  try {
    const res = await deleteAllDocuments()
    const data = res?.data ?? res ?? {}
    const deletedCount = Number(data.deletedCount ?? 0)
    uiMessage.success(`已清空${deletedCount} 个文档`)
    await loadDocs()
  } catch (e) {
    uiMessage.error(getFriendlyErrorMessage(e, '清空失败，请稍后重试'))
  } finally {
    clearingAll.value = false
  }
}

// 工具
const getExt = (name) => (name?.split('.').pop() || 'file').toUpperCase()
const goTranslate = (docId) => router.push(`/teacher/bilingual-read?docId=${docId}`)
const goSummary = (docId) => router.push(`/teacher/summary-card?docId=${docId}`)

onMounted(loadDocs)
</script>
