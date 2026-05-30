<template>
  <div class="organize-page">
    <div class="hero">
      <div class="hero-text">
        <h1>AI 智能整理</h1>
        <p>支持文档中心整理和隔离 ZIP 整理。ZIP 模式不会把文件写入文档中心，只返回整理后的结果包。</p>
      </div>
    </div>

    <div class="cards-row">
      <div class="card">
        <div class="card-head">
          <span class="card-icon">上传</span>
          <h3>上传与提交</h3>
        </div>
        <p class="card-desc">
          多文件和目录模式沿用文档中心链路。ZIP 一键整理走隔离任务，不会写入文档中心。
        </p>

        <div class="inline-form">
          <el-input v-model="folderName" placeholder="文件夹名称（可选）" style="width: 240px" />
          <el-radio-group v-model="uploadMode" size="small">
            <el-radio-button label="files">多文件</el-radio-button>
            <el-radio-button label="zip">隔离 ZIP</el-radio-button>
            <el-radio-button label="dir">目录直传</el-radio-button>
          </el-radio-group>
        </div>

        <template v-if="uploadMode === 'files'">
          <div class="inline-form" style="margin-top: 12px">
            <el-button type="primary" :loading="creating" @click="createFolder">1. 创建文档中心文件夹</el-button>
            <span v-if="currentFolderId" class="folder-tag">当前文件夹 #{{ currentFolderId }}</span>
          </div>

          <div v-if="currentFolderId" class="upload-area">
            <el-upload
              ref="uploadRef"
              v-model:file-list="fileList"
              :auto-upload="false"
              multiple
              drag
              accept=".pdf,.docx,.doc,.pptx,.txt,.md,.csv,.zip"
            >
              <div class="upload-hint">
                <p>拖拽文件到此处，或点击选择</p>
                <p class="upload-sub">支持 PDF、DOCX、PPTX、TXT、ZIP 等格式</p>
              </div>
            </el-upload>
            <el-button
              type="primary"
              style="margin-top: 12px"
              :loading="submitLoading"
              :disabled="fileList.length === 0"
              @click="uploadAndSubmit"
            >
              2. 上传并提交整理（{{ fileList.length }} 个文件）
            </el-button>
          </div>
        </template>

        <template v-else-if="uploadMode === 'zip'">
          <div class="upload-area">
            <el-alert
              type="success"
              show-icon
              :closable="false"
              title="隔离 ZIP 模式"
              description="上传的 ZIP 会直接进入临时整理任务，不会落到文档中心。"
            />
            <el-upload
              ref="zipUploadRef"
              v-model:file-list="zipFileList"
              :auto-upload="false"
              :limit="1"
              drag
              accept=".zip"
              style="margin-top: 12px"
            >
              <div class="upload-hint">
                <p>拖拽一个 ZIP 到此处，或点击选择</p>
                <p class="upload-sub">上传后直接创建隔离整理任务，完成后返回整理后的 ZIP</p>
              </div>
            </el-upload>
            <el-button
              type="primary"
              style="margin-top: 12px"
              :loading="zipSubmitLoading"
              :disabled="zipFileList.length === 0"
              @click="uploadZipAndSubmit"
            >
              ZIP 一键上传并整理
            </el-button>
          </div>
        </template>

        <template v-else>
          <div class="upload-area">
            <input
              ref="dirInputRef"
              class="hidden-dir-input"
              type="file"
              webkitdirectory
              directory
              multiple
              @change="onDirectoryChange"
            />
            <div class="inline-form">
              <el-button @click="openDirectoryPicker">选择本地目录</el-button>
              <span v-if="selectedDirName" class="folder-tag">已选择：{{ selectedDirName }}</span>
            </div>
            <p class="upload-sub" style="margin-top: 8px">
              已选 {{ dirFiles.length }} 个文件，保留原始目录结构上传到文档中心。
            </p>
            <el-button
              type="primary"
              style="margin-top: 12px"
              :loading="dirSubmitLoading"
              :disabled="dirFiles.length === 0"
              @click="uploadDirectoryAndSubmit"
            >
              目录直传并整理
            </el-button>
          </div>
        </template>
      </div>

      <div class="card">
        <div class="card-head">
          <span class="card-icon">任务</span>
          <h3>整理进度</h3>
        </div>

        <div v-if="!jobId" class="empty-hint">提交任务后会在这里展示进度、结果和下载入口。</div>

        <template v-else>
          <div class="status-bar">
            <el-tag :type="statusTypeC">{{ statusLabelC }}</el-tag>
            <el-tag size="small" :type="currentJobKind === 'zip' ? 'success' : 'info'">
              {{ currentJobKind === 'zip' ? '隔离 ZIP' : '文档中心' }}
            </el-tag>
            <span v-if="jobData?.currentStep" class="step-label">
              {{ stepLabels[jobData.currentStep] || jobData.currentStep }}
            </span>
          </div>

          <el-progress
            :percentage="jobData?.progress || 0"
            :stroke-width="10"
            :color="jobData?.status === 'FAILED' ? '#d93025' : '#1a73e8'"
            style="margin: 12px 0"
          />

          <p v-if="jobData?.stepDetail" class="step-detail">{{ jobData.stepDetail }}</p>
          <p v-if="jobData?.errorMessage" class="error-msg">{{ jobData.errorMessage }}</p>

          <template v-if="jobData?.status === 'SUCCEEDED' && resultData">
            <div class="result-summary">
              <div class="stat">
                <span class="stat-num">{{ resultData.totalFiles || 0 }}</span>
                <span class="stat-label">文件</span>
              </div>
              <div class="stat">
                <span class="stat-num">{{ resultData.reviewCount || 0 }}</span>
                <span class="stat-label">待确认</span>
              </div>
              <div class="stat">
                <span class="stat-num">{{ resultData.duplicateCount || 0 }}</span>
                <span class="stat-label">重复</span>
              </div>
            </div>

            <p class="topic-line">主题：{{ resultData.folderTopic || '未识别' }}</p>
            <div v-if="resultData.folderTags?.length" class="tag-row">
              <el-tag v-for="tag in resultData.folderTags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
            </div>

            <div v-if="resultData.files?.length" class="file-table-wrap">
              <table class="file-table">
                <thead>
                  <tr>
                    <th>原文件</th>
                    <th>目标目录</th>
                    <th>新文件名</th>
                    <th>类型</th>
                    <th>置信度</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(file, index) in resultData.files" :key="index" :class="{ 'review-row': file.reviewFlag }">
                    <td class="fname">{{ file.originalName }}</td>
                    <td>{{ file.targetFolder }}</td>
                    <td class="fname">{{ file.newFilename }}</td>
                    <td><el-tag size="small" :type="kindType(file.docKind)">{{ file.docKind || 'other' }}</el-tag></td>
                    <td>{{ formatConfidence(file.confidence) }}</td>
                    <td>
                      <el-tag v-if="file.reviewFlag" size="small" type="warning">待确认</el-tag>
                      <el-tag v-else-if="file.duplicateGroupId" size="small" type="info">重复</el-tag>
                      <el-tag v-else size="small" type="success">完成</el-tag>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <el-button type="primary" size="large" style="margin-top: 16px; width: 100%" :loading="downloading" @click="downloadZip">
              下载整理结果 ZIP
            </el-button>
          </template>

          <div v-if="jobData?.status === 'FAILED'" class="action-row">
            <el-button type="warning" :loading="retrying" @click="retryJob">重试</el-button>
          </div>
        </template>

        <div class="history-panel">
          <div class="history-head">
            <span>{{ uploadMode === 'zip' ? '隔离 ZIP 任务历史' : '文档中心整理历史' }}</span>
            <el-button text size="small" :loading="historyLoading" @click="loadHistory">刷新</el-button>
          </div>
          <div v-if="historyJobs.length === 0" class="history-empty">暂无历史任务</div>
          <div v-else class="history-list">
            <div v-for="job in historyJobs" :key="job.id" class="history-item">
              <div class="history-main">
                <div class="history-title">
                  #{{ job.id }} · {{ job.status }}
                  <el-tag size="small" :type="job.jobKind === 'zip' ? 'success' : 'info'" style="margin-left: 6px">
                    {{ job.jobKind === 'zip' ? 'ZIP' : '文档中心' }}
                  </el-tag>
                </div>
                <div class="history-sub">{{ formatTime(job.createdAt) }}</div>
              </div>
              <div class="history-actions">
                <el-button size="small" @click="openHistoryJob(job)">查看</el-button>
                <el-button size="small" type="primary" plain :disabled="!job.hasZip" @click="downloadHistoryZip(job)">
                  ZIP
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createFolder as apiCreateFolder,
  uploadFiles,
  listAgentJobs,
  submitAgentJob,
  queryAgentJob,
  retryAgentJob,
  downloadAgentJobZip,
  submitZipOrganizeJob,
  listZipOrganizeJobs,
  queryZipOrganizeJob,
  retryZipOrganizeJob,
  downloadZipOrganizeJobZip,
} from '../../api/tap'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

const ORGANIZE_STATE_KEY = 'tap_ai_organize_state_v2'

const folderName = ref('智能整理文件夹')
const uploadMode = ref('zip')
const currentFolderId = ref(null)
const currentJobKind = ref('zip')

const creating = ref(false)
const submitLoading = ref(false)
const zipSubmitLoading = ref(false)
const dirSubmitLoading = ref(false)
const historyLoading = ref(false)
const downloading = ref(false)
const retrying = ref(false)

const uploadRef = ref(null)
const zipUploadRef = ref(null)
const dirInputRef = ref(null)
const fileList = ref([])
const zipFileList = ref([])
const dirFiles = ref([])
const selectedDirName = ref('')
const historyJobs = ref([])

const jobId = ref(null)
const jobData = ref(null)
const resultData = ref(null)

let pollTimer = null

const stepLabels = {
  INGEST: '文件枚举',
  EXTRACT: '文本提取',
  CLASSIFY: 'AI 分类',
  ORGANIZE: '整理规划',
  DELIVER: '结果打包',
}

const unwrap = (res) => res?.data ?? res

const saveLocalState = () => {
  const payload = {
    folderName: folderName.value,
    uploadMode: uploadMode.value,
    currentFolderId: currentFolderId.value,
    jobId: jobId.value,
    currentJobKind: currentJobKind.value,
  }
  try {
    localStorage.setItem(ORGANIZE_STATE_KEY, JSON.stringify(payload))
  } catch {
    // ignore localStorage errors
  }
}

const restoreLocalState = () => {
  try {
    const raw = localStorage.getItem(ORGANIZE_STATE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (typeof data?.folderName === 'string' && data.folderName.trim()) folderName.value = data.folderName
    if (['files', 'zip', 'dir'].includes(data?.uploadMode)) uploadMode.value = data.uploadMode
    if (['agent', 'zip'].includes(data?.currentJobKind)) currentJobKind.value = data.currentJobKind
    if (data?.currentFolderId != null) currentFolderId.value = data.currentFolderId
    if (data?.jobId != null) jobId.value = String(data.jobId)
  } catch {
    // ignore parse errors
  }
}

const normalizeHistoryItems = (items, jobKind) => {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    ...item,
    jobKind,
  }))
}

const loadHistory = async () => {
  historyLoading.value = true
  try {
    if (uploadMode.value === 'zip') {
      const res = await listZipOrganizeJobs(20)
      const data = unwrap(res)
      historyJobs.value = normalizeHistoryItems(data?.items, 'zip')
    } else {
      const res = await listAgentJobs(20)
      const data = unwrap(res)
      historyJobs.value = normalizeHistoryItems(data?.items, 'agent')
    }
  } catch {
    historyJobs.value = []
  } finally {
    historyLoading.value = false
  }
}

const formatTime = (ts) => {
  if (!ts) return '-'
  const date = new Date(ts)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

const formatConfidence = (value) => {
  const n = Number(value || 0)
  return `${Math.round(n * 100)}%`
}

const createFolder = async () => {
  creating.value = true
  try {
    const res = await apiCreateFolder(folderName.value || '智能整理文件夹')
    const data = unwrap(res)
    currentFolderId.value = data?.id ?? data?.folderId ?? null
    fileList.value = []
    saveLocalState()
    ElMessage.success('文档中心文件夹已创建')
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '创建文件夹失败，请稍后重试'))
  } finally {
    creating.value = false
  }
}

const ensureFolder = async () => {
  if (currentFolderId.value) return currentFolderId.value
  const res = await apiCreateFolder(folderName.value || '智能整理文件夹')
  const data = unwrap(res)
  const id = data?.id ?? data?.folderId
  if (!id) throw new Error('创建文件夹失败')
  currentFolderId.value = id
  saveLocalState()
  return id
}

const submitJob = async (payload, kind = 'agent') => {
  const res = kind === 'zip'
    ? await submitZipOrganizeJob(payload.file)
    : await submitAgentJob(payload.folderId)
  const data = unwrap(res)
  const id = data?.jobId ?? data?.id
  if (!id) throw new Error('任务提交失败')

  currentJobKind.value = kind
  jobId.value = String(id)
  jobData.value = null
  resultData.value = null
  saveLocalState()
  await loadHistory()
  startPolling()
}

const uploadAndSubmit = async () => {
  if (fileList.value.length === 0) return
  submitLoading.value = true
  try {
    const folderId = await ensureFolder()
    const rawFiles = fileList.value.map((file) => file.raw || file).filter(Boolean)
    await uploadFiles(folderId, rawFiles)
    await submitJob({ folderId }, 'agent')
    ElMessage.success('文档中心整理任务已提交')
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '提交失败，请稍后重试'))
  } finally {
    submitLoading.value = false
  }
}

const openDirectoryPicker = () => {
  dirInputRef.value?.click()
}

const onDirectoryChange = (event) => {
  const files = Array.from(event?.target?.files || [])
  dirFiles.value = files
  if (files.length > 0) {
    const firstPath = files[0].webkitRelativePath || files[0].name || ''
    selectedDirName.value = firstPath.includes('/') ? firstPath.split('/')[0] : 'selected-folder'
  } else {
    selectedDirName.value = ''
  }
  if (event?.target) event.target.value = ''
}

const uploadZipAndSubmit = async () => {
  const zipRaw = zipFileList.value[0]?.raw || zipFileList.value[0]
  if (!zipRaw) return
  zipSubmitLoading.value = true
  try {
    await submitJob({ file: zipRaw }, 'zip')
    ElMessage.success('隔离 ZIP 整理任务已提交')
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, 'ZIP 提交失败，请稍后重试'))
  } finally {
    zipSubmitLoading.value = false
  }
}

const uploadDirectoryAndSubmit = async () => {
  if (dirFiles.value.length === 0) return
  dirSubmitLoading.value = true
  try {
    const folderId = await ensureFolder()
    const paths = dirFiles.value.map((file) => file.webkitRelativePath || file.name)
    await uploadFiles(folderId, dirFiles.value, paths)
    await submitJob({ folderId }, 'agent')
    ElMessage.success('目录整理任务已提交')
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '目录提交失败，请稍后重试'))
  } finally {
    dirSubmitLoading.value = false
  }
}

const queryCurrentJob = async () => {
  if (!jobId.value) return null
  try {
    const res = currentJobKind.value === 'zip'
      ? await queryZipOrganizeJob(jobId.value)
      : await queryAgentJob(jobId.value)
    const data = unwrap(res)
    jobData.value = data
    resultData.value = data?.result
      ? (typeof data.result === 'string' ? JSON.parse(data.result) : data.result)
      : null
    saveLocalState()
    return data
  } catch {
    return null
  }
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const startPolling = () => {
  stopPolling()
  queryCurrentJob()
  pollTimer = setInterval(async () => {
    const data = await queryCurrentJob()
    if (['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(data?.status)) {
      stopPolling()
      await loadHistory()
    }
  }, 2000)
}

const retryJob = async () => {
  if (!jobId.value) return
  retrying.value = true
  try {
    if (currentJobKind.value === 'zip') {
      await retryZipOrganizeJob(jobId.value)
    } else {
      await retryAgentJob(jobId.value)
    }
    resultData.value = null
    startPolling()
    ElMessage.success('任务已重新提交')
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '重试失败，请稍后重试'))
  } finally {
    retrying.value = false
  }
}

const triggerZipDownload = (blob, id) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `organized_${id}.zip`
  link.click()
  URL.revokeObjectURL(url)
}

const downloadZipByKind = async (id, kind) => {
  const res = kind === 'zip'
    ? await downloadZipOrganizeJobZip(id)
    : await downloadAgentJobZip(id)
  const blob = res instanceof Blob ? res : new Blob([res])
  triggerZipDownload(blob, id)
}

const downloadZip = async () => {
  if (!jobId.value) return
  downloading.value = true
  try {
    await downloadZipByKind(jobId.value, currentJobKind.value)
    ElMessage.success('下载完成')
  } catch (e) {
    const message = String(e?.message || '')
    if (message.includes('整理结果尚未生成') || message.includes('400')) {
      ElMessage.warning('当前整理结果尚未生成，请等待任务完成后再下载。')
    } else {
      ElMessage.error(getFriendlyErrorMessage(e, '下载失败，请稍后重试'))
    }
  } finally {
    downloading.value = false
  }
}

const openHistoryJob = async (job) => {
  if (!job?.id) return
  currentJobKind.value = job.jobKind || (uploadMode.value === 'zip' ? 'zip' : 'agent')
  jobId.value = String(job.id)
  saveLocalState()
  const data = await queryCurrentJob()
  if (['PENDING', 'RUNNING'].includes(data?.status)) {
    startPolling()
  } else {
    stopPolling()
  }
}

const downloadHistoryZip = async (job) => {
  if (!job?.id) return
  downloading.value = true
  try {
    await downloadZipByKind(job.id, job.jobKind || (uploadMode.value === 'zip' ? 'zip' : 'agent'))
  } catch (e) {
    const message = String(e?.message || '')
    if (message.includes('整理结果尚未生成') || message.includes('400')) {
      ElMessage.warning('该任务的整理结果尚未生成，暂时无法下载。')
    } else {
      ElMessage.error(getFriendlyErrorMessage(e, '下载失败，请稍后重试'))
    }
  } finally {
    downloading.value = false
  }
}

watch(uploadMode, async (mode) => {
  currentJobKind.value = mode === 'zip' ? 'zip' : 'agent'
  saveLocalState()
  await loadHistory()
})

onMounted(async () => {
  restoreLocalState()
  if (!['agent', 'zip'].includes(currentJobKind.value)) {
    currentJobKind.value = uploadMode.value === 'zip' ? 'zip' : 'agent'
  }
  await loadHistory()
  if (jobId.value) {
    const data = await queryCurrentJob()
    if (['PENDING', 'RUNNING'].includes(data?.status)) {
      startPolling()
    }
  }
})

onUnmounted(stopPolling)

const statusTypeC = computed(() => {
  const status = jobData.value?.status
  if (status === 'SUCCEEDED') return 'success'
  if (status === 'FAILED') return 'danger'
  if (status === 'RUNNING') return ''
  return 'info'
})

const statusLabelC = computed(() => {
  const labels = {
    PENDING: '排队中',
    RUNNING: '执行中',
    SUCCEEDED: '已完成',
    FAILED: '失败',
    CANCELLED: '已取消',
  }
  return labels[jobData.value?.status] || jobData.value?.status || '-'
})

const kindType = (kind) => {
  const map = {
    paper: '',
    teaching: 'success',
    code: 'warning',
    data: 'info',
    admin: 'info',
    other: 'info',
  }
  return map[kind] || 'info'
}
</script>

<style scoped>
.organize-page { min-height: 100%; }
.hero {
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  border-radius: 14px;
  padding: 28px 36px;
  margin-bottom: 24px;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.hero::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}
.hero-text h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; }
.hero-text p { margin: 0; font-size: 14px; opacity: 0.9; }

.cards-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 20px; }
.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #dadce0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.card-icon { font-size: 14px; color: #1a73e8; font-weight: 700; min-width: 30px; }
.card-head h3 { margin: 0; font-size: 17px; font-weight: 600; color: #202124; }
.card-desc { color: #5f6368; font-size: 13px; margin: 0 0 16px; line-height: 1.6; }
.inline-form { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.upload-area { margin-top: 14px; }
.hidden-dir-input { display: none; }
.folder-tag { font-size: 12px; color: #1a73e8; font-weight: 500; }
.upload-hint { text-align: center; padding: 20px; }
.upload-hint p { margin: 4px 0; color: #5f6368; font-size: 13px; }
.upload-sub { font-size: 12px; color: #9aa0a6; }
.empty-hint { color: #9aa0a6; font-size: 14px; text-align: center; padding: 40px 0; }

.status-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
.step-label { font-size: 13px; color: #5f6368; }
.step-detail { font-size: 12px; color: #5f6368; margin: 4px 0; }
.error-msg { font-size: 13px; color: #d93025; margin: 8px 0; }

.result-summary { display: flex; gap: 24px; margin: 16px 0; }
.stat { text-align: center; }
.stat-num { display: block; font-size: 28px; font-weight: 700; color: #1a73e8; }
.stat-label { font-size: 12px; color: #5f6368; }
.topic-line { font-size: 14px; color: #202124; margin: 8px 0; font-weight: 500; }
.tag-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }

.file-table-wrap { max-height: 300px; overflow: auto; border: 1px solid #e8eaed; border-radius: 10px; margin-top: 12px; }
.file-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.file-table th { background: #f8f9fa; padding: 8px 10px; text-align: left; color: #5f6368; font-weight: 500; position: sticky; top: 0; }
.file-table td { padding: 6px 10px; border-top: 1px solid #e8eaed; }
.file-table .fname { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.review-row { background: #fef7e0; }
.action-row { margin-top: 12px; display: flex; gap: 10px; }
.history-panel { margin-top: 16px; padding-top: 12px; border-top: 1px dashed #d0d7de; }
.history-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; color: #5f6368; }
.history-empty { color: #9aa0a6; font-size: 12px; padding: 6px 0; }
.history-list { display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow: auto; }
.history-item { display: flex; justify-content: space-between; align-items: center; border: 1px solid #e8eaed; border-radius: 8px; padding: 8px; gap: 8px; }
.history-title { font-size: 12px; color: #202124; font-weight: 600; }
.history-sub { font-size: 11px; color: #80868b; margin-top: 2px; }
.history-actions { display: flex; gap: 6px; }
</style>
