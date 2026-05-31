<template>
  <div class="doc-center [min-height:100%] [font-family:-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_'Helvetica_Neue',_Arial,_sans-serif]">
    <!-- 顶部横幅 -->
    <div class="hero [display:flex] [align-items:center] [justify-content:space-between] [background:#fff] [border-radius:16px] [padding:28px_32px] [margin-bottom:24px] [border:1px_solid_#dadce0]">
      <div class="hero-text [&_h1]:[margin:0_0_6px] [&_h1]:[font-size:22px] [&_h1]:[font-weight:400] [&_h1]:[color:#202124] [&_p]:[margin:0] [&_p]:[font-size:14px] [&_p]:[color:#5f6368]">
        <h1>文档中心</h1>
        <p>上传、管理教学文档，一键翻译或 AI 精读</p>
      </div>
      <div class="hero-actions [display:flex] [gap:10px] [&_.el-button--primary]:[border-radius:100px]">
        <el-button type="primary" :icon="UploadFilled" @click="showUpload = true">上传文档</el-button>
        <el-button :icon="Refresh" @click="loadDocs">刷新</el-button>
        <el-button
          type="danger"
          plain
          :icon="Delete"
          :loading="clearingAll"
          :disabled="docsLoading || docs.length === 0"
          @click="handleDeleteAll"
        >
          清空全部
        </el-button>
      </div>
    </div>

    <!-- 上传抽屉 -->
    <el-drawer v-model="showUpload" title="上传文档" size="480px" :close-on-click-modal="true">
      <div class="upload-body [padding:0_4px]">
        <el-form label-position="top">
          <el-form-item label="文件夹名称">
            <el-input v-model="folderName" placeholder="例如：数据结构课件" />
          </el-form-item>
        </el-form>

        <el-upload
          drag multiple :auto-upload="false"
          :on-change="handleFileChange" :file-list="fileList"
          :on-remove="handleFileRemove" accept=".pdf,.docx,.doc,.txt"
          class="upload-dragger [margin-top:16px] [width:100%]"
        >
          <div class="upload-inner [text-align:center] [padding:28px_0]">
            <el-icon :size="40" color="#409EFF"><UploadFilled /></el-icon>
            <p class="upload-main-text [margin:10px_0_4px] [font-size:15px] [color:#202124]">拖拽文件到此处，或点击选择</p>
            <p class="upload-hint [margin:0] [font-size:12px] [color:#5f6368]">支持 PDF、DOCX、DOC、TXT，单文件最大50 MB</p>
          </div>
        </el-upload>

        <el-button
          v-if="fileList.length > 0" type="primary" :loading="uploading"
          class="upload-submit [width:100%] [margin-top:20px] [height:42px] [font-size:15px] [border-radius:100px]" @click="handleUpload"
        >
          {{ uploading ? '上传中..' : `上传 ${fileList.length} 个文件` }}
        </el-button>
        <el-alert v-if="uploadError" :title="uploadError" type="error" show-icon class="[margin-top:12px]" />
      </div>
    </el-drawer>

    <!-- 文档列表 -->
    <div class="doc-grid [display:grid] [grid-template-columns:repeat(auto-fill,_minmax(320px,_1fr))] [gap:16px]" v-loading="docsLoading">
      <el-empty v-if="docs.length === 0 && !docsLoading" description="暂无文档，点击上方「上传文档」开始" />

      <div v-for="doc in docs" :key="doc.id" class="doc-card [display:flex] [align-items:center] [gap:14px] [background:#fff] [border-radius:16px] [padding:18px_20px] [border:1px_solid_#dadce0] [transition:all_.2s] hover:[box-shadow:0_1px_3px_rgba(60,64,67,0.15),_0_4px_8px_rgba(60,64,67,0.08)] hover:[transform:translateY(-1px)]">
        <div class="doc-icon [width:48px] [height:48px] [border-radius:12px] [background:#e8f0fe] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]">
          <span class="file-ext [color:#1a73e8] [font-size:11px] [font-weight:600] [letter-spacing:.5px]">{{ getExt(doc.filename) }}</span>
        </div>
        <div class="doc-info [flex:1] [min-width:0]">
          <p class="doc-name [margin:0_0_4px] [font-size:14px] [font-weight:500] [color:#202124] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]" :title="doc.filename">{{ doc.filename }}</p>
          <p class="doc-meta [margin:0] [font-size:12px] [color:#5f6368] [&_span_+_span]:[margin-left:2px]">
            <span>{{ (doc.sizeBytes / 1024).toFixed(0) }} KB</span>
            <span v-if="doc.language">· {{ doc.language }}</span>
          </p>
        </div>
        <div class="doc-actions [display:flex] [gap:6px] [flex-shrink:0]">
          <el-tooltip content="双语翻译" placement="top">
            <el-button type="primary" :icon="Document" circle size="small" @click="goTranslate(doc.id)" />
          </el-tooltip>
          <el-tooltip content="AI 精读" placement="top">
            <el-button type="success" :icon="MagicStick" circle size="small" @click="goSummary(doc.id)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button type="danger" :icon="Delete" circle size="small"
              :loading="deleting === doc.id" @click="handleDelete(doc.id)" />
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Refresh, Document, MagicStick, Delete } from '@element-plus/icons-vue'
import { getDocuments, deleteDocument, deleteAllDocuments, createFolder, uploadFiles } from '../../api/tap'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

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
    ElMessage.success('上传成功')
    fileList.value = []; showUpload.value = false; loadDocs()
  } catch (e) { uploadError.value = getFriendlyErrorMessage(e, '文件上传失败，请稍后重试') }
  uploading.value = false
}

// 删除
const deleting = ref(null)
const handleDelete = async (id) => {
  try { await ElMessageBox.confirm('确定删除该文档？', '提示', { type: 'warning' }) } catch { return }
  deleting.value = id
  try { await deleteDocument(id); ElMessage.success('删除成功'); loadDocs() }
  catch (e) { ElMessage.error(getFriendlyErrorMessage(e, '删除失败，请稍后重试')) }
  deleting.value = null
}

const clearingAll = ref(false)
const handleDeleteAll = async () => {
  try {
    await ElMessageBox.confirm('确定清空文档中心全部文档？该操作不可恢复。', '提示', { type: 'warning' })
  } catch {
    return
  }

  clearingAll.value = true
  try {
    const res = await deleteAllDocuments()
    const data = res?.data ?? res ?? {}
    const deletedCount = Number(data.deletedCount ?? 0)
    ElMessage.success(`已清空${deletedCount} 个文档`)
    await loadDocs()
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '清空失败，请稍后重试'))
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


