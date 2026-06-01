<template>
  <div class="min-h-full">
    <!-- Hero -->
    <div class="rounded-[14px] bg-gradient-to-br from-[#007aff] to-[#4285f4] px-9 py-7 mb-6 text-white relative overflow-hidden">
      <div>
        <h1 class="m-0 mb-1 text-2xl font-bold">AI 智能整理</h1>
        <p class="m-0 text-sm opacity-90">支持文档中心整理和隔离 ZIP 整理。ZIP 模式不会把文件写入文档中心，只返回整理后的结果包。</p>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-[repeat(auto-fit,_minmax(420px,_1fr))] gap-5">
      <!-- Upload Card -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center gap-2.5 mb-2.5">
          <span class="text-sm text-[#007aff] font-bold min-w-[30px]">上传</span>
          <h3 class="m-0 text-[17px] font-semibold text-[#1d1d1f]">上传与提交</h3>
        </div>
        <p class="text-[#6e6e73] text-[13px] m-0 mb-4 leading-relaxed">
          多文件和目录模式沿用文档中心链路。ZIP 一键整理走隔离任务，不会写入文档中心。
        </p>

        <div class="flex gap-2.5 items-center flex-wrap">
          <input
            v-model="folderName"
            placeholder="文件夹名称（可选）"
            class="w-[240px] h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm"
          />
          <div class="flex rounded-[10px] overflow-hidden border border-black/10">
            <button
              v-for="mode in [{ key: 'files', label: '多文件' }, { key: 'zip', label: '隔离 ZIP' }, { key: 'dir', label: '目录直传' }]"
              :key="mode.key"
              class="h-[32px] px-3 text-xs font-medium border-none cursor-pointer transition-all"
              :class="uploadMode === mode.key ? 'bg-[#007aff] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'"
              @click="uploadMode = mode.key"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>

        <!-- Files Mode -->
        <template v-if="uploadMode === 'files'">
          <div class="flex gap-2.5 items-center flex-wrap mt-3">
            <button
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none"
              :disabled="creating"
              @click="createFolder"
            >
              <span v-if="creating" class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              1. 创建文档中心文件夹
            </button>
            <span v-if="currentFolderId" class="text-xs text-[#007aff] font-medium">当前文件夹 #{{ currentFolderId }}</span>
          </div>

          <div v-if="currentFolderId" class="mt-3.5">
            <el-upload
              ref="uploadRef"
              v-model:file-list="fileList"
              :auto-upload="false"
              multiple
              drag
              accept=".pdf,.docx,.doc,.pptx,.txt,.md,.csv,.zip"
            >
              <div class="text-center py-5">
                <p class="m-1 text-[#6e6e73] text-[13px]">拖拽文件到此处，或点击选择</p>
                <p class="text-xs text-[#aeaeb2]">支持 PDF、DOCX、PPTX、TXT、ZIP 等格式</p>
              </div>
            </el-upload>
            <button
              class="mt-3 h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              :disabled="fileList.length === 0 || submitLoading"
              @click="uploadAndSubmit"
            >
              <span v-if="submitLoading" class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              2. 上传并提交整理（{{ fileList.length }} 个文件）
            </button>
          </div>
        </template>

        <!-- ZIP Mode -->
        <template v-else-if="uploadMode === 'zip'">
          <div class="mt-3">
            <!-- Alert replacement -->
            <div class="flex items-start gap-3 rounded-[12px] bg-[rgba(52,199,89,0.08)] border border-[rgba(52,199,89,0.2)] px-4 py-3 mb-3">
              <svg class="w-5 h-5 text-[#34c759] shrink-0 mt-0.5" fill="none" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.7-5.3l5-5a.7.7 0 011 1l-5.5 5.5a.7.7 0 01-1 0l-2.5-2.5a.7.7 0 011-1l2 2z" fill="currentColor"/></svg>
              <div>
                <p class="m-0 text-sm font-medium text-[#1d1d1f]">隔离 ZIP 模式</p>
                <p class="m-0 mt-0.5 text-xs text-[#6e6e73]">上传的 ZIP 会直接进入临时整理任务，不会落到文档中心。</p>
              </div>
            </div>
            <el-upload
              ref="zipUploadRef"
              v-model:file-list="zipFileList"
              :auto-upload="false"
              :limit="1"
              drag
              accept=".zip"
            >
              <div class="text-center py-5">
                <p class="m-1 text-[#6e6e73] text-[13px]">拖拽一个 ZIP 到此处，或点击选择</p>
                <p class="text-xs text-[#aeaeb2]">上传后直接创建隔离整理任务，完成后返回整理后的 ZIP</p>
              </div>
            </el-upload>
            <button
              class="mt-3 h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              :disabled="zipFileList.length === 0 || zipSubmitLoading"
              @click="uploadZipAndSubmit"
            >
              <span v-if="zipSubmitLoading" class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              ZIP 一键上传并整理
            </button>
          </div>
        </template>

        <!-- Directory Mode -->
        <template v-else>
          <div class="mt-3">
            <input
              ref="dirInputRef"
              class="hidden"
              type="file"
              webkitdirectory
              directory
              multiple
              @change="onDirectoryChange"
            />
            <div class="flex gap-2.5 items-center flex-wrap">
              <button
                class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none"
                @click="openDirectoryPicker"
              >
                选择本地目录
              </button>
              <span v-if="selectedDirName" class="text-xs text-[#007aff] font-medium">已选择：{{ selectedDirName }}</span>
            </div>
            <p class="mt-2 text-xs text-[#aeaeb2]">
              已选 {{ dirFiles.length }} 个文件，保留原始目录结构上传到文档中心。
            </p>
            <button
              class="mt-3 h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              :disabled="dirFiles.length === 0 || dirSubmitLoading"
              @click="uploadDirectoryAndSubmit"
            >
              <span v-if="dirSubmitLoading" class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              目录直传并整理
            </button>
          </div>
        </template>
      </div>

      <!-- Progress Card -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center gap-2.5 mb-2.5">
          <span class="text-sm text-[#007aff] font-bold min-w-[30px]">任务</span>
          <h3 class="m-0 text-[17px] font-semibold text-[#1d1d1f]">整理进度</h3>
        </div>

        <div v-if="!jobId" class="text-[#aeaeb2] text-sm text-center py-10">提交任务后会在这里展示进度、结果和下载入口。</div>

        <template v-else>
          <!-- Status Tags -->
          <div class="flex items-center gap-2.5 mb-2 flex-wrap">
            <span
              class="inline-flex items-center h-[22px] px-2 rounded-full text-xs font-medium"
              :class="statusTagClass"
            >{{ statusLabelC }}</span>
            <span
              class="inline-flex items-center h-[22px] px-2 rounded-full text-xs font-medium"
              :class="currentJobKind === 'zip' ? 'bg-[rgba(52,199,89,0.12)] text-[#34c759]' : 'bg-black/5 text-[#6e6e73]'"
            >
              {{ currentJobKind === 'zip' ? '隔离 ZIP' : '文档中心' }}
            </span>
            <span v-if="jobData?.currentStep" class="text-[13px] text-[#6e6e73]">
              {{ stepLabels[jobData.currentStep] || jobData.currentStep }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="my-3">
            <div class="h-[10px] rounded-full bg-[#f5f5f7] overflow-hidden">
              <div
                class="h-full w-[var(--progress-width)] rounded-full transition-all duration-300"
                :class="jobData?.status === 'FAILED' ? 'bg-[#d93025]' : 'bg-[#007aff]'"
                :style="progressWidthStyle(jobData?.progress || 0)"
              ></div>
            </div>
          </div>

          <p v-if="jobData?.stepDetail" class="text-xs text-[#6e6e73] my-1">{{ jobData.stepDetail }}</p>
          <p v-if="jobData?.errorMessage" class="text-[13px] text-[#d93025] my-2">{{ jobData.errorMessage }}</p>

          <!-- Result Section -->
          <template v-if="jobData?.status === 'SUCCEEDED' && resultData">
            <div class="flex gap-6 my-4">
              <div class="text-center">
                <span class="block text-[28px] font-bold text-[#007aff]">{{ resultData.totalFiles || 0 }}</span>
                <span class="text-[13px] text-[#6e6e73] mt-1">文件</span>
              </div>
              <div class="text-center">
                <span class="block text-[28px] font-bold text-[#007aff]">{{ resultData.reviewCount || 0 }}</span>
                <span class="text-[13px] text-[#6e6e73] mt-1">待确认</span>
              </div>
              <div class="text-center">
                <span class="block text-[28px] font-bold text-[#007aff]">{{ resultData.duplicateCount || 0 }}</span>
                <span class="text-[13px] text-[#6e6e73] mt-1">重复</span>
              </div>
            </div>

            <p class="text-sm text-[#1d1d1f] my-2 font-medium">主题：{{ resultData.folderTopic || '未识别' }}</p>
            <div v-if="resultData.folderTags?.length" class="flex gap-1.5 flex-wrap mb-3">
              <span
                v-for="tag in resultData.folderTags"
                :key="tag"
                class="inline-flex items-center h-[22px] px-2 rounded-full text-xs font-medium bg-black/5 text-[#6e6e73]"
              >{{ tag }}</span>
            </div>

            <!-- File Table -->
            <div v-if="resultData.files?.length" class="max-h-[300px] overflow-auto border border-black/[0.06] rounded-[10px] mt-3">
              <table class="w-full border-collapse text-xs">
                <thead>
                  <tr class="bg-[#f5f5f7]">
                    <th class="text-left px-3 py-2 font-medium text-[#6e6e73]">原文件</th>
                    <th class="text-left px-3 py-2 font-medium text-[#6e6e73]">目标目录</th>
                    <th class="text-left px-3 py-2 font-medium text-[#6e6e73]">新文件名</th>
                    <th class="text-left px-3 py-2 font-medium text-[#6e6e73]">类型</th>
                    <th class="text-left px-3 py-2 font-medium text-[#6e6e73]">置信度</th>
                    <th class="text-left px-3 py-2 font-medium text-[#6e6e73]">状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(file, index) in resultData.files"
                    :key="index"
                    class="border-t border-black/[0.04] hover:bg-[#f9f9fb] transition-colors"
                    :class="{ 'bg-[rgba(255,149,0,0.04)]': file.reviewFlag }"
                  >
                    <td class="px-3 py-2 max-w-[140px] truncate">{{ file.originalName }}</td>
                    <td class="px-3 py-2">{{ file.targetFolder }}</td>
                    <td class="px-3 py-2 max-w-[140px] truncate">{{ file.newFilename }}</td>
                    <td class="px-3 py-2">
                      <span
                        class="inline-flex items-center h-[20px] px-1.5 rounded text-[11px] font-medium"
                        :class="kindTagClass(file.docKind)"
                      >{{ file.docKind || 'other' }}</span>
                    </td>
                    <td class="px-3 py-2">{{ formatConfidence(file.confidence) }}</td>
                    <td class="px-3 py-2">
                      <span v-if="file.reviewFlag" class="inline-flex items-center h-[20px] px-1.5 rounded text-[11px] font-medium bg-[rgba(255,149,0,0.1)] text-[#ff9500]">待确认</span>
                      <span v-else-if="file.duplicateGroupId" class="inline-flex items-center h-[20px] px-1.5 rounded text-[11px] font-medium bg-black/5 text-[#6e6e73]">重复</span>
                      <span v-else class="inline-flex items-center h-[20px] px-1.5 rounded text-[11px] font-medium bg-[rgba(52,199,89,0.12)] text-[#34c759]">完成</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              class="mt-4 w-full h-[42px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              :disabled="downloading"
              @click="downloadZip"
            >
              <span v-if="downloading" class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              下载整理结果 ZIP
            </button>
          </template>

          <!-- Failed Action -->
          <div v-if="jobData?.status === 'FAILED'" class="flex items-center gap-2 flex-wrap mt-3">
            <button
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#ffb340] to-[#ff9500] shadow-[0_2px_8px_rgba(255,149,0,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none"
              :disabled="retrying"
              @click="retryJob"
            >
              <span v-if="retrying" class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              重试
            </button>
          </div>
        </template>

        <!-- History Panel -->
        <div class="mt-4 pt-3 border-t border-dashed border-[#d0d7de]">
          <div class="flex justify-between items-center mb-2 text-[13px] text-[#6e6e73]">
            <span>{{ uploadMode === 'zip' ? '隔离 ZIP 任务历史' : '文档中心整理历史' }}</span>
            <button
              class="text-[13px] text-[#007aff] bg-transparent border-none cursor-pointer hover:underline"
              :disabled="historyLoading"
              @click="loadHistory"
            >
              <span v-if="historyLoading" class="inline-block w-3 h-3 border-2 border-[#007aff]/30 border-t-[#007aff] rounded-full animate-spin mr-1"></span>
              刷新
            </button>
          </div>
          <div v-if="historyJobs.length === 0" class="text-[#aeaeb2] text-xs py-1.5">暂无历史任务</div>
          <div v-else class="flex flex-col gap-2 max-h-[220px] overflow-auto">
            <div
              v-for="job in historyJobs"
              :key="job.id"
              class="flex justify-between items-center border border-black/[0.06] rounded-[8px] px-3 py-2.5 hover:bg-[#f9f9fb] transition-colors"
            >
              <div>
                <div class="text-xs text-[#1d1d1f] font-medium mb-1">
                  #{{ job.id }} · {{ job.status }}
                  <span
                    class="inline-flex items-center h-[18px] px-1.5 rounded text-[10px] font-medium ml-1.5"
                    :class="job.jobKind === 'zip' ? 'bg-[rgba(52,199,89,0.12)] text-[#34c759]' : 'bg-black/5 text-[#6e6e73]'"
                  >
                    {{ job.jobKind === 'zip' ? 'ZIP' : '文档中心' }}
                  </span>
                </div>
                <div class="text-[11px] text-[#80868b]">{{ formatTime(job.createdAt) }}</div>
              </div>
              <div class="flex gap-1.5 mt-1">
                <button
                  class="h-[28px] px-3 rounded-[8px] text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none"
                  @click="openHistoryJob(job)"
                >查看</button>
                <button
                  class="h-[28px] px-3 rounded-[8px] text-xs font-medium text-[#007aff] bg-[rgba(0,122,255,0.08)] hover:bg-[rgba(0,122,255,0.14)] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="!job.hasZip"
                  @click="downloadHistoryZip(job)"
                >ZIP</button>
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

const statusTagClass = computed(() => {
  const status = jobData.value?.status
  if (status === 'SUCCEEDED') return 'bg-[rgba(52,199,89,0.12)] text-[#34c759]'
  if (status === 'FAILED') return 'bg-[rgba(255,59,48,0.1)] text-[#ff3b30]'
  if (status === 'RUNNING') return 'bg-[rgba(0,122,255,0.1)] text-[#007aff]'
  return 'bg-black/5 text-[#6e6e73]'
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

const progressWidthStyle = (value) => ({ '--progress-width': `${value}%` })

const kindTagClass = (kind) => {
  const map = {
    paper: 'bg-[rgba(0,122,255,0.1)] text-[#007aff]',
    teaching: 'bg-[rgba(52,199,89,0.12)] text-[#34c759]',
    code: 'bg-[rgba(255,149,0,0.1)] text-[#ff9500]',
    data: 'bg-black/5 text-[#6e6e73]',
    admin: 'bg-black/5 text-[#6e6e73]',
    other: 'bg-black/5 text-[#6e6e73]',
  }
  return map[kind] || 'bg-black/5 text-[#6e6e73]'
}
</script>
