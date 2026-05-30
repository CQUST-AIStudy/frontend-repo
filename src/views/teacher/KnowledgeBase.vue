<template>
  <div class="knowledge-base-container">
    <page-header title="课程知识库" description="管理课程资料、查看 RAG 处理状态，并进行课程问答" />

    <div v-if="!selectedSpace" class="space-list-view">
      <div class="space-actions">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          创建课程空间
        </el-button>
      </div>

      <el-alert
        v-if="currentClassName"
        class="scope-alert"
        type="info"
        :closable="false"
        show-icon
      >
        <template #title>当前班级：{{ currentClassName }}</template>
        <template #default>
          <span v-if="hasClassScopedSpaces">当前仅展示绑定到该班级的课程空间，知识问答会按当前班级作用域执行。</span>
          <span v-else>当前班级还没有专属课程空间，暂时展示你名下的全部课程空间。</span>
        </template>
      </el-alert>

      <el-empty v-if="visibleSpaces.length === 0 && !loading" description="暂无课程空间，先创建一个再上传资料" />

      <el-row :gutter="20" v-loading="loading">
        <el-col v-for="space in visibleSpaces" :key="space.id" :span="8" class="space-col">
          <el-card class="space-card" shadow="hover" @click="selectSpace(space)">
            <template #header>
              <div class="card-header">
                <span class="card-title">{{ space.name }}</span>
                <div class="card-header-actions">
                  <el-tag size="small" :type="visibilityTagType(space.docVisibility)">
                    {{ visibilityLabel(space.docVisibility) }}
                  </el-tag>
                  <el-dropdown @click.stop trigger="click">
                    <el-icon class="card-more"><MoreFilled /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="editSpace(space)">编辑</el-dropdown-item>
                        <el-dropdown-item @click="confirmDeleteSpace(space)">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>

            <div class="card-body">
              <p v-if="space.term"><el-icon><Calendar /></el-icon>{{ space.term }}</p>
              <p v-if="space.courseName"><el-icon><Reading /></el-icon>{{ space.courseName }}</p>
              <p class="card-stats">模式：{{ modeLabel(space.defaultMode) }}</p>
              <p v-if="space.docVisibility === 'class'" class="card-stats">
                绑定班级：{{ (space.boundClassIds || []).length }}
              </p>
              <p class="card-stats">文档数：{{ space.docCount || 0 }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-else class="space-detail-view">
      <div class="detail-header">
        <el-button @click="backToList">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>{{ selectedSpace.name }}</h2>
        <span v-if="selectedSpace.term" class="detail-meta">{{ selectedSpace.term }}</span>
        <el-tag size="small" :type="visibilityTagType(selectedSpace.docVisibility)">
          {{ visibilityLabel(selectedSpace.docVisibility) }}
        </el-tag>
      </div>

      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="文档管理" name="docs">
          <el-card class="section-card">
            <template #header>
              <span>上传课程资料</span>
            </template>

            <el-upload
              drag
              multiple
              :auto-upload="false"
              :on-change="onFileChange"
              :file-list="pendingFiles"
              accept=".pdf,.docx,.txt,.md"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">拖拽文件到这里，或点击选择文件</div>
              <template #tip>
                <div class="el-upload__tip">支持 PDF、DOCX、TXT、Markdown，适合教材、讲义、参考资料</div>
              </template>
            </el-upload>

            <div v-if="pendingFiles.length > 0" class="upload-actions">
              <el-select v-model="uploadDocType" class="doc-type-select">
                <el-option label="教材" value="textbook" />
                <el-option label="讲义" value="lecture" />
                <el-option label="参考书" value="reference" />
                <el-option label="习题集" value="exercise" />
                <el-option label="其他" value="other" />
              </el-select>
              <el-button type="primary" @click="uploadFiles" :loading="uploading">
                上传 {{ pendingFiles.length }} 个文件
              </el-button>
            </div>
          </el-card>

          <div class="doc-summary-grid">
            <div class="doc-summary-card">
              <div class="doc-summary-label">文档总数</div>
              <div class="doc-summary-value">{{ docStatusSummary.total }}</div>
            </div>
            <div class="doc-summary-card success">
              <div class="doc-summary-label">已就绪</div>
              <div class="doc-summary-value">{{ docStatusSummary.ready }}</div>
            </div>
            <div class="doc-summary-card warning">
              <div class="doc-summary-label">处理中</div>
              <div class="doc-summary-value">{{ docStatusSummary.pending + docStatusSummary.processing }}</div>
            </div>
            <div class="doc-summary-card danger">
              <div class="doc-summary-label">失败</div>
              <div class="doc-summary-value">{{ docStatusSummary.failed }}</div>
            </div>
            <div class="doc-summary-card accent">
              <div class="doc-summary-label">总分块</div>
              <div class="doc-summary-value">{{ docStatusSummary.totalChunks }}</div>
            </div>
          </div>

          <el-card class="section-card">
            <template #header>
              <div class="doc-list-header">
                <span>文档处理结果</span>
                <div class="doc-list-actions">
                  <el-button link :loading="docsLoading" @click="loadDocuments">刷新</el-button>
                  <el-button link :loading="docActionLoading" @click="rebuildBm25IndexAction">重建 BM25</el-button>
                  <el-button type="warning" plain :loading="docActionLoading" @click="reprocessAllDocuments">
                    全部重处理
                  </el-button>
                </div>
              </div>
            </template>

            <el-empty v-if="documents.length === 0 && !docsLoading" description="暂无文档，请先上传课程资料" />

            <el-table v-else :data="documents" v-loading="docsLoading" stripe>
              <el-table-column prop="id" label="任务 ID" width="90" />
              <el-table-column prop="documentId" label="文档 ID" width="90" />
              <el-table-column prop="docType" label="类型" width="110">
                <template #default="{ row }">{{ docTypeLabel(row.docType) }}</template>
              </el-table-column>
              <el-table-column label="状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="chunkCount" label="分块数" width="100" />
              <el-table-column prop="createdAt" label="创建时间" min-width="180" />
              <el-table-column label="错误信息" min-width="220">
                <template #default="{ row }">
                  <span v-if="row.errorMessage" class="error-message">{{ row.errorMessage }}</span>
                  <span v-else class="muted-text">-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="130" fixed="right">
                <template #default="{ row }">
                  <el-button
                    size="small"
                    type="primary"
                    link
                    :loading="docRowLoadingId === row.id"
                    @click="reprocessDocument(row)"
                  >
                    重处理
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="知识问答" name="chat">
          <div class="chat-container">
            <div ref="chatMessagesRef" class="chat-messages">
              <div v-if="chatMessages.length === 0" class="chat-empty">
                <el-icon class="chat-empty-icon"><ChatDotRound /></el-icon>
                <p>向当前课程知识库提问，回答会基于已上传并处理完成的资料生成。</p>
                <div class="chat-suggestions">
                  <el-button v-for="suggestion in suggestions" :key="suggestion" size="small" round @click="askQuestion(suggestion)">
                    {{ suggestion }}
                  </el-button>
                </div>
              </div>

              <div v-for="(msg, idx) in chatMessages" :key="idx" :class="['chat-msg', msg.role]">
                <div class="msg-bubble">
                  <div v-if="msg.role === 'user'" class="msg-text">{{ msg.content }}</div>
                  <div v-else class="msg-text" v-html="renderMarkdown(msg.content)"></div>
                  <div v-if="msg.citations && msg.citations.length" class="msg-citations">
                    <span class="citation-label">引用来源：</span>
                    <el-tag v-for="citation in msg.citations" :key="citation.index" size="small" type="info" class="citation-tag">
                      [{{ citation.index }}] {{ citation.docName }} {{ citation.chapterPath }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <div v-if="chatLoading" class="chat-msg assistant">
                <div class="msg-bubble">
                  <span class="typing-indicator">AI 正在思考...</span>
                </div>
              </div>
            </div>

            <div class="chat-input-area">
              <el-input
                v-model="chatInput"
                type="textarea"
                :rows="2"
                placeholder="输入问题，例如：什么是二叉搜索树？"
                :disabled="chatLoading"
                @keydown.enter.ctrl="sendChat"
              />
              <el-button type="primary" :loading="chatLoading" :disabled="!chatInput.trim()" @click="sendChat">
                发送
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="分块标注" name="annotations">
          <el-card class="section-card">
            <template #header>
              <div class="doc-list-header">
                <span>知识分块（{{ chunks.length }}）</span>
                <el-button link :loading="chunksLoading" @click="loadChunksAndAnnotations">刷新</el-button>
              </div>
            </template>

            <el-empty v-if="chunks.length === 0 && !chunksLoading" description="暂无分块数据，请先上传并处理文档" />

            <div v-else class="chunk-list">
              <div v-for="chunk in chunks" :key="chunk.id" class="chunk-item">
                <div class="chunk-content">
                  <span class="chunk-meta">
                    [{{ chunk.id }}]
                    {{ chunk.chapterPath || '未分类' }}
                    <template v-if="chunk.pageRange"> / {{ chunk.pageRange }}</template>
                  </span>
                  <p>{{ chunk.contentPreview || '' }}</p>
                </div>
                <div class="chunk-actions">
                  <el-button size="small" type="warning" @click="addAnnotation(chunk.id, 'important')">重点</el-button>
                  <el-button size="small" type="danger" @click="addAnnotation(chunk.id, 'error_prone')">易错</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingSpace ? '编辑课程空间' : '创建课程空间'" width="520px">
      <el-form :model="spaceForm" label-width="92px">
        <el-form-item label="名称" required>
          <el-input v-model="spaceForm.name" placeholder="例如：数据结构 2025 春" />
        </el-form-item>
        <el-form-item label="学期">
          <el-input v-model="spaceForm.term" placeholder="例如：2024-2025-2" />
        </el-form-item>
        <el-form-item label="课程名">
          <el-input v-model="spaceForm.courseName" placeholder="例如：数据结构" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="spaceForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="可见范围">
          <el-select v-model="spaceForm.docVisibility" class="full-width">
            <el-option label="公开" value="public" />
            <el-option label="班级可见" value="class" />
            <el-option label="仅教师" value="private" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="spaceForm.docVisibility === 'class'" label="绑定班级">
          <el-select v-model="spaceForm.classIds" multiple collapse-tags collapse-tags-tooltip class="full-width">
            <el-option
              v-for="cls in teacherClasses"
              :key="cls.id"
              :label="`${cls.name}${cls.courseName ? ' / ' + cls.courseName : ''}`"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="默认模式">
          <el-select v-model="spaceForm.defaultMode" class="full-width">
            <el-option label="Strict" value="strict" />
            <el-option label="Open" value="open" />
          </el-select>
        </el-form-item>
        <el-form-item label="允许联网">
          <el-switch v-model="spaceForm.allowWebSearch" />
        </el-form-item>
        <el-form-item label="要求引用">
          <el-switch v-model="spaceForm.requireCitation" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="!spaceForm.name" @click="saveSpace">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Calendar, ChatDotRound, MoreFilled, Plus, Reading, UploadFilled } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import { useUserStore } from '@/store'
import {
  createAnnotation,
  createCourseSpace,
  deleteCourseSpace,
  getCourseSpaceChunks,
  getCourseSpaceDocumentStatusSummary,
  getCourseSpaces,
  getTeachingClasses,
  ragChatStream,
  rebuildCourseSpaceBm25,
  reprocessAllCourseSpaceDocuments,
  reprocessCourseSpaceDocument,
  updateCourseSpace,
  uploadCourseSpaceDocument,
} from '@/api/tap'
import { getFriendlyErrorMessage } from '@/utils/errorMessage'

const userStore = useUserStore()
const spaces = ref([])
const loading = ref(false)
const teacherClasses = ref([])
const selectedSpace = ref(null)
const activeTab = ref('docs')

const documents = ref([])
const docsLoading = ref(false)
const docStatusSummary = ref(emptyDocSummary())
const docActionLoading = ref(false)
const docRowLoadingId = ref(null)
const pendingFiles = ref([])
const uploading = ref(false)
const uploadDocType = ref('textbook')

const chunks = ref([])
const chunksLoading = ref(false)

const chatMessages = ref([])
const chatInput = ref('')
const chatLoading = ref(false)
const chatMessagesRef = ref(null)
const suggestions = ['什么是二叉搜索树？', '链表和数组的区别是什么？', 'Dijkstra 算法的时间复杂度是多少？']

const dialogVisible = ref(false)
const editingSpace = ref(null)
const saving = ref(false)

const currentClassId = computed(() => {
  const id = Number(userStore.selectedClass?.id)
  return Number.isFinite(id) && id > 0 ? id : null
})
const currentClassName = computed(() => userStore.selectedClass?.name || '')
const classScopedSpaces = computed(() => {
  if (!currentClassId.value) return []
  return spaces.value.filter(space => Array.isArray(space.boundClassIds) && space.boundClassIds.includes(currentClassId.value))
})
const hasClassScopedSpaces = computed(() => classScopedSpaces.value.length > 0)
const visibleSpaces = computed(() => hasClassScopedSpaces.value ? classScopedSpaces.value : spaces.value)
const spaceForm = ref(defaultSpaceForm())

let refreshTimer = null

function defaultSpaceForm() {
  return {
    name: '',
    term: '',
    courseName: '',
    description: '',
    defaultMode: 'strict',
    allowWebSearch: false,
    requireCitation: true,
    docVisibility: currentClassId.value ? 'class' : 'public',
    classIds: currentClassId.value ? [currentClassId.value] : [],
  }
}

function emptyDocSummary() {
  return {
    total: 0,
    ready: 0,
    processing: 0,
    pending: 0,
    failed: 0,
    totalChunks: 0,
  }
}

const modeLabel = (mode) => (mode === 'open' ? 'Open' : 'Strict')

function visibilityLabel(visibility) {
  if (visibility === 'public') return '公开'
  if (visibility === 'class') return '班级可见'
  return '仅教师'
}

function visibilityTagType(visibility) {
  if (visibility === 'public') return 'success'
  if (visibility === 'class') return 'warning'
  return 'info'
}

function statusTagType(status) {
  return { READY: 'success', PROCESSING: '', PENDING: 'warning', FAILED: 'danger' }[status] || 'info'
}

function statusLabel(status) {
  return {
    READY: '已就绪',
    PROCESSING: '处理中',
    PENDING: '等待处理',
    FAILED: '失败',
  }[status] || status
}

function docTypeLabel(docType) {
  return {
    textbook: '教材',
    lecture: '讲义',
    reference: '参考书',
    exercise: '习题集',
    faq: 'FAQ',
    other: '其他',
  }[docType] || docType || '其他'
}

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/\[(\d+)\]/g, '<sup style="color:#1a73e8;cursor:pointer">[$1]</sup>')
}

async function loadSpaces() {
  loading.value = true
  try {
    const res = await getCourseSpaces()
    spaces.value = res?.data || res || []
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '加载课程空间失败，请稍后重试'))
  }
  loading.value = false
}

async function loadTeachingClasses() {
  try {
    const res = await getTeachingClasses()
    teacherClasses.value = res?.data || res || []
  } catch {
    teacherClasses.value = []
  }
}

function backToList() {
  selectedSpace.value = null
  activeTab.value = 'docs'
  documents.value = []
  chunks.value = []
  chatMessages.value = []
  docStatusSummary.value = emptyDocSummary()
}

function selectSpace(space) {
  selectedSpace.value = space
  activeTab.value = 'docs'
  chatMessages.value = []
  docStatusSummary.value = emptyDocSummary()
  loadDocuments()
}

function showCreateDialog() {
  editingSpace.value = null
  spaceForm.value = defaultSpaceForm()
  dialogVisible.value = true
}

function editSpace(space) {
  editingSpace.value = space
  spaceForm.value = {
    name: space.name,
    term: space.term || '',
    courseName: space.courseName || '',
    description: space.description || '',
    defaultMode: space.defaultMode || 'strict',
    allowWebSearch: !!space.allowWebSearch,
    requireCitation: space.requireCitation !== false,
    docVisibility: space.docVisibility || 'private',
    classIds: Array.isArray(space.boundClassIds) ? [...space.boundClassIds] : [],
  }
  dialogVisible.value = true
}

async function saveSpace() {
  if (!spaceForm.value.name) return
  if (spaceForm.value.docVisibility === 'class' && spaceForm.value.classIds.length === 0) {
    ElMessage.warning('班级可见模式下至少需要绑定一个班级')
    return
  }

  saving.value = true
  try {
    if (editingSpace.value) {
      await updateCourseSpace(editingSpace.value.id, spaceForm.value)
      ElMessage.success('课程空间已更新')
    } else {
      await createCourseSpace(spaceForm.value)
      ElMessage.success('课程空间已创建')
    }
    dialogVisible.value = false
    await loadSpaces()
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '保存课程空间失败，请稍后重试'))
  }
  saving.value = false
}

async function confirmDeleteSpace(space) {
  try {
    await ElMessageBox.confirm(`确定删除“${space.name}”吗？`, '确认删除', { type: 'warning' })
    await deleteCourseSpace(space.id)
    ElMessage.success('课程空间已删除')
    if (selectedSpace.value?.id === space.id) {
      backToList()
    }
    await loadSpaces()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(getFriendlyErrorMessage(e, '删除课程空间失败，请稍后重试'))
  }
}

async function loadDocuments() {
  if (!selectedSpace.value) return
  docsLoading.value = true
  try {
    const res = await getCourseSpaceDocumentStatusSummary(selectedSpace.value.id)
    const payload = res?.data || res || {}
    const counts = payload.counts || {}
    documents.value = payload.documents || []
    docStatusSummary.value = {
      total: Number(counts.total || 0),
      ready: Number(counts.ready || 0),
      processing: Number(counts.processing || 0),
      pending: Number(counts.pending || 0),
      failed: Number(counts.failed || 0),
      totalChunks: Number(counts.totalChunks || 0),
    }
  } catch (e) {
    documents.value = []
    docStatusSummary.value = emptyDocSummary()
    ElMessage.error(getFriendlyErrorMessage(e, '加载文档状态失败，请稍后重试'))
  }
  docsLoading.value = false
}

function onFileChange(_file, fileList) {
  pendingFiles.value = fileList
}

async function uploadFiles() {
  if (!selectedSpace.value || pendingFiles.value.length === 0) return
  uploading.value = true
  let successCount = 0
  let failCount = 0

  for (const file of pendingFiles.value) {
    try {
      await uploadCourseSpaceDocument(selectedSpace.value.id, file.raw, uploadDocType.value)
      successCount += 1
    } catch {
      failCount += 1
    }
  }

  uploading.value = false
  pendingFiles.value = []

  if (successCount) ElMessage.success(`成功上传 ${successCount} 个文件`)
  if (failCount) ElMessage.warning(`${failCount} 个文件上传失败`)
  await loadDocuments()
}

async function reprocessAllDocuments() {
  if (!selectedSpace.value) return
  try {
    await ElMessageBox.confirm('确定重新处理当前课程空间下所有可重跑文档吗？', '确认操作', { type: 'warning' })
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(getFriendlyErrorMessage(e, '上传文档失败，请稍后重试'))
    return
  }

  docActionLoading.value = true
  try {
    const res = await reprocessAllCourseSpaceDocuments(selectedSpace.value.id)
    const data = res?.data || res || {}
    ElMessage.success(`已加入重处理队列：${data.requestedCount || 0} 个文档`)
    await loadDocuments()
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '文档重新处理失败，请稍后重试'))
  }
  docActionLoading.value = false
}

async function reprocessDocument(row) {
  if (!selectedSpace.value || !row?.id) return
  docRowLoadingId.value = row.id
  try {
    const res = await reprocessCourseSpaceDocument(selectedSpace.value.id, row.id)
    const data = res?.data || res || {}
    ElMessage.success(data.queued ? '文档已加入重处理队列' : '该文档当前正在处理中')
    await loadDocuments()
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '批量处理失败，请稍后重试'))
  }
  docRowLoadingId.value = null
}

async function rebuildBm25IndexAction() {
  if (!selectedSpace.value) return
  docActionLoading.value = true
  try {
    await rebuildCourseSpaceBm25(selectedSpace.value.id)
    ElMessage.success('BM25 索引已重建')
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '检索索引重建失败，请稍后重试'))
  }
  docActionLoading.value = false
}

async function loadChunksAndAnnotations() {
  if (!selectedSpace.value) return
  chunksLoading.value = true
  try {
    const res = await getCourseSpaceChunks(selectedSpace.value.id)
    chunks.value = res?.data || res || []
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '加载分块失败，请稍后重试'))
  }
  chunksLoading.value = false
}

async function addAnnotation(chunkId, type) {
  if (!selectedSpace.value) return
  try {
    await createAnnotation(selectedSpace.value.id, { chunkId, annotationType: type, note: '' })
    ElMessage.success('标注已添加')
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '保存批注失败，请稍后重试'))
  }
}

function askQuestion(question) {
  chatInput.value = question
  sendChat()
}

async function sendChat() {
  const question = chatInput.value.trim()
  if (!question || !selectedSpace.value || chatLoading.value) return

  chatMessages.value.push({ role: 'user', content: question })
  chatInput.value = ''
  chatLoading.value = true
  scrollToBottom()

  try {
    const resp = await ragChatStream(selectedSpace.value.id, question, 'strict', {
      classId: currentClassId.value,
      className: currentClassName.value,
    })
    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    const messageIndex = chatMessages.value.length
    chatMessages.value.push({ role: 'assistant', content: '', citations: [] })

    let done = false
    while (!done) {
      const readResult = await reader.read()
      done = readResult.done
      if (done) break
      const chunk = decoder.decode(readResult.value, { stream: true })
      fullText += chunk

      const citationMatch = fullText.match(/<!--CITATIONS:(.+?)-->/)
      if (citationMatch) {
        try {
          chatMessages.value[messageIndex].citations = JSON.parse(citationMatch[1])
        } catch {
          // ignore malformed citation marker
        }
        chatMessages.value[messageIndex].content = fullText.replace(/\n\n<!--CITATIONS:.+?-->/, '')
      } else {
        chatMessages.value[messageIndex].content = fullText
      }
      scrollToBottom()
    }
  } catch (e) {
    chatMessages.value.push({ role: 'assistant', content: `网络错误: ${e.message}` })
  }

  chatLoading.value = false
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    const el = chatMessagesRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(activeTab, async (tab) => {
  if (!selectedSpace.value) return
  if (tab === 'docs') {
    await loadDocuments()
  } else if (tab === 'annotations' && chunks.value.length === 0) {
    await loadChunksAndAnnotations()
  }
})

watch(visibleSpaces, (nextSpaces) => {
  if (!selectedSpace.value) return
  const stillVisible = nextSpaces.some(space => space.id === selectedSpace.value.id)
  if (!stillVisible) {
    backToList()
  }
}, { deep: true })

onMounted(() => {
  loadSpaces()
  loadTeachingClasses()
  refreshTimer = setInterval(() => {
    if (!selectedSpace.value) return
    const hasActiveTasks = documents.value.some((doc) => doc.status === 'PROCESSING' || doc.status === 'PENDING')
    if (hasActiveTasks) {
      loadDocuments()
    }
  }, 5000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.knowledge-base-container {
  padding: 0;
}

.space-actions {
  margin-bottom: 20px;
}

.scope-alert {
  margin-bottom: 20px;
  border-radius: 16px;
}

.space-col {
  margin-bottom: 20px;
}

.space-card {
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border-radius: 16px;
  border: 1px solid #dadce0;
}

.space-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
  color: #202124;
}

.card-more {
  cursor: pointer;
  font-size: 18px;
  color: #9aa0a6;
}

.card-body p {
  margin: 6px 0;
  color: #3c4043;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-stats {
  color: #6b7280 !important;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-header h2 {
  margin: 0;
  font-size: 20px;
  color: #202124;
}

.detail-meta {
  color: #5f6368;
  font-size: 14px;
  background: #f1f3f4;
  padding: 2px 10px;
  border-radius: 999px;
}

.detail-tabs {
  margin-top: 16px;
}

.section-card {
  margin-bottom: 16px;
}

.upload-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.doc-type-select {
  width: 160px;
}

.doc-summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.doc-summary-card {
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  border: 1px solid #dbe5f0;
}

.doc-summary-card.success {
  background: linear-gradient(135deg, #effaf3, #dcfce7);
}

.doc-summary-card.warning {
  background: linear-gradient(135deg, #fff8eb, #fef3c7);
}

.doc-summary-card.danger {
  background: linear-gradient(135deg, #fff1f2, #ffe4e6);
}

.doc-summary-card.accent {
  background: linear-gradient(135deg, #eef6ff, #dbeafe);
}

.doc-summary-label {
  font-size: 13px;
  color: #6b7280;
}

.doc-summary-value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.doc-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.doc-list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-message {
  color: #d93025;
  font-size: 12px;
}

.muted-text {
  color: #9aa0a6;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 520px;
  border: 1px solid #dadce0;
  border-radius: 16px;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8fafc;
}

.chat-empty {
  text-align: center;
  padding: 64px 20px;
  color: #6b7280;
}

.chat-empty-icon {
  font-size: 48px;
  color: #c3cad6;
}

.chat-suggestions {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.chat-msg {
  margin-bottom: 12px;
  display: flex;
}

.chat-msg.user {
  justify-content: flex-end;
}

.chat-msg.assistant {
  justify-content: flex-start;
}

.msg-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.7;
}

.chat-msg.user .msg-bubble {
  background: #1a73e8;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-msg.assistant .msg-bubble {
  background: #fff;
  color: #202124;
  border: 1px solid #e8eaed;
  border-bottom-left-radius: 4px;
}

.msg-citations {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e8eaed;
}

.citation-label {
  font-size: 12px;
  color: #6b7280;
  margin-right: 4px;
}

.citation-tag {
  margin: 2px;
}

.typing-indicator {
  color: #6b7280;
  font-style: italic;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e8eaed;
  align-items: flex-end;
}

.chat-input-area .el-textarea {
  flex: 1;
}

.chunk-list {
  max-height: 520px;
  overflow-y: auto;
}

.chunk-item {
  padding: 14px 4px;
  border-bottom: 1px solid #eef2f7;
}

.chunk-meta {
  font-size: 12px;
  color: #6b7280;
}

.chunk-content p {
  margin: 8px 0;
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
}

.chunk-actions {
  display: flex;
  gap: 8px;
}

.full-width {
  width: 100%;
}

.knowledge-base-container :deep(.el-card) {
  border-radius: 16px;
  border: 1px solid #dadce0;
}

@media (max-width: 1200px) {
  .doc-summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .doc-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .doc-list-header,
  .detail-header,
  .upload-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .doc-list-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .doc-summary-grid {
    grid-template-columns: 1fr;
  }

  .msg-bubble {
    max-width: 92%;
  }
}
</style>
