<template>
  <div class="grading-center min-h-full">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="m-0 text-[20px] font-semibold text-[#1d1d1f] mb-1">AI 批改中心</h1>
      <p class="m-0 text-[14px] text-[#6e6e73]">上传学生作业，AI 自动评分并生成详细评语</p>
    </div>

    <!-- 流程引导卡片 -->
    <div class="bg-white rounded-[12px] border border-[#e5e7eb] shadow-[0_6px_18px_rgba(15,23,42,0.04)] mb-6 overflow-hidden">
      <!-- 流程步骤指示器 -->
      <div class="flex bg-[#fbfcfe] border-b border-[#edf0f5] px-6 py-4">
        <div class="flex-1 flex items-center gap-3 relative" :class="{ 'active': true, 'completed': false }">
          <div class="w-7 h-7 rounded-[8px] bg-[#0b7cff] text-white flex items-center justify-center text-[13px] font-semibold flex-shrink-0 relative z-10 shadow-[0_4px_10px_rgba(11,124,255,0.18)]">1</div>
          <div class="flex-1">
            <div class="text-[13px] font-semibold text-[#0b7cff]">配置批改参数</div>
            <div class="text-[11px] text-[#9aa4b2]">选择评分标准和期望分数</div>
          </div>
          <div class="absolute top-1/2 left-10 right-[-12px] h-px bg-[#d9e7ff] -translate-y-1/2"></div>
        </div>
        <div class="flex-1 flex items-center gap-3 relative">
          <div class="w-7 h-7 rounded-[8px] bg-[#eef2f7] text-[#667085] flex items-center justify-center text-[13px] font-semibold flex-shrink-0 relative z-10">2</div>
          <div class="flex-1">
            <div class="text-[13px] font-semibold text-[#1d1d1f]">上传作业文件</div>
            <div class="text-[11px] text-[#9aa4b2]">支持 PDF、DOC 格式</div>
          </div>
          <div class="absolute top-1/2 left-10 right-[-12px] h-px bg-[#e5e7eb] -translate-y-1/2"></div>
        </div>
        <div class="flex-1 flex items-center gap-3 relative">
          <div class="w-7 h-7 rounded-[8px] bg-[#eef2f7] text-[#667085] flex items-center justify-center text-[13px] font-semibold flex-shrink-0 relative z-10">3</div>
          <div class="flex-1">
            <div class="text-[13px] font-semibold text-[#1d1d1f]">AI 自动批改</div>
            <div class="text-[11px] text-[#9aa4b2]">等待 AI 处理完成</div>
          </div>
        </div>
      </div>

      <!-- 表单内容区 -->
      <div class="p-6 space-y-5">
        <!-- 配置区 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- 评分标准 -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-medium text-[#6e6e73]">
              <span class="text-[#ff3b30]">*</span> 评分标准
            </label>
            <UiSelect v-model="createForm.rubricId"
              class="h-11 px-4 rounded-[10px] bg-[#f5f5f7] border border-black/[0.1] text-sm outline-none appearance-none cursor-pointer text-[#1d1d1f] focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/10 transition-all">
              <UiOption value="" disabled selected>选择评分标准</UiOption>
              <UiOption v-for="r in rubrics" :key="r.id" :value="r.id">{{ r.name }}</UiOption>
            </UiSelect>
          </div>

          <!-- 教师署名 -->
          <div class="flex flex-col gap-2">
            <label class="text-[13px] font-medium text-[#6e6e73]">
              <span class="text-[#ff3b30]">*</span> 教师署名
            </label>
            <UiInput v-model="createForm.teacherSignature" maxlength="32" placeholder="例如：张老师"
              class="h-11 px-4 rounded-[10px] bg-[#f5f5f7] border border-black/[0.1] text-sm outline-none text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/10 transition-all" />
          </div>
        </div>

        <!-- 分数区间 - 可视化版 -->
        <div class="rounded-[12px] border border-[#e5eaf2] bg-white px-5 py-4">
          <div class="flex items-start justify-between gap-6">
            <span class="text-[13px] font-medium text-[#475467] pt-2">
              <span class="text-[#ff3b30]">*</span> 期望分数区间
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-end gap-2 mb-3">
                <input type="number" v-model.number="createForm.scoreRange[0]" min="0" max="100"
                  class="w-14 h-9 text-center bg-[#f8fbff] border border-[#cfe2ff] rounded-[8px] text-[15px] font-semibold text-[#0b7cff] outline-none focus:border-[#0b7cff] focus:ring-2 focus:ring-[#0b7cff]/10 transition-all" />
                <span class="text-[#98a2b3]">—</span>
                <input type="number" v-model.number="createForm.scoreRange[1]" min="0" max="100"
                  class="w-14 h-9 text-center bg-[#f8fbff] border border-[#cfe2ff] rounded-[8px] text-[15px] font-semibold text-[#0b7cff] outline-none focus:border-[#0b7cff] focus:ring-2 focus:ring-[#0b7cff]/10 transition-all" />
                <span class="text-[13px] text-[#667085]">分</span>
              </div>

              <!-- 自定义 Range Slider -->
              <div class="relative h-8 flex items-center mb-2">
                <div class="absolute left-0 right-0 h-1.5 bg-[#eef2f6] rounded-full"></div>
                <div class="absolute h-1.5 bg-[#0b7cff] rounded-full transition-all duration-100"
                  :style="{ left: `${createForm.scoreRange[0]}%`, width: `${createForm.scoreRange[1] - createForm.scoreRange[0]}%` }"></div>
                <div class="absolute w-4 h-4 bg-white border-[3px] border-[#0b7cff] rounded-[5px] shadow-[0_2px_7px_rgba(11,124,255,0.25)] cursor-grab active:cursor-grabbing z-10 transition-transform hover:scale-110"
                  :style="{ left: `calc(${createForm.scoreRange[0]}% - 8px)` }"
                  @mousedown="startDrag(0, $event)"
                  @touchstart="startDrag(0, $event)"></div>
                <div class="absolute w-4 h-4 bg-white border-[3px] border-[#0b7cff] rounded-[5px] shadow-[0_2px_7px_rgba(11,124,255,0.25)] cursor-grab active:cursor-grabbing z-10 transition-transform hover:scale-110"
                  :style="{ left: `calc(${createForm.scoreRange[1]}% - 8px)` }"
                  @mousedown="startDrag(1, $event)"
                  @touchstart="startDrag(1, $event)"></div>
              </div>
              <div class="flex items-start gap-2 text-[12px] text-[#667085] leading-relaxed">
                <LucideIcon name="flag" :size="14" class="text-[#0b7cff] mt-0.5 flex-shrink-0" />
                <span>AI 会参考此区间识别异常成绩，偏离区间的成绩会标记为「需复核」。</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 上传区域 - 流程化 -->
        <div>
          <label class="text-[13px] font-medium text-[#6e6e73] mb-3 block">
            <span class="text-[#ff3b30]">*</span> 上传作业文件
          </label>
          <ui-upload ref="uploadRef" v-model:file-list="fileList" :auto-upload="false" :on-change="onFileChange"
                     accept=".pdf,.docx,.doc" multiple drag :on-remove="onFileRemove"
                     class="upload-flow-wrapper w-full">
            <div class="flex flex-col items-center justify-center py-9 w-full">
              <div class="w-12 h-12 bg-[#edf5ff] rounded-[14px] flex items-center justify-center text-[#0b7cff] mb-4">
                <LucideIcon name="cloud-upload" :size="25" />
              </div>
              <div class="text-[15px] font-semibold text-[#101828] mb-2">
                拖拽作业文件到此处，或 <span class="text-[#0b7cff]">点击选择</span>
              </div>
              <div class="text-[13px] text-[#667085] mb-4">支持批量上传，AI 将自动识别并批改</div>
              <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-[#98a2b3]">
                <span class="inline-flex items-center gap-1.5 rounded-[8px] bg-[#f8fafc] px-2.5 py-1">
                  <LucideIcon name="file" :size="14" />
                  PDF / DOC / DOCX
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-[8px] bg-[#f8fafc] px-2.5 py-1">
                  <LucideIcon name="hard-drive" :size="14" />
                  单文件 ≤ 50MB
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-[8px] bg-[#f8fafc] px-2.5 py-1">
                  <LucideIcon name="users" :size="14" />
                  最多 200 份
                </span>
              </div>
            </div>
          </ui-upload>

          <div v-if="fileList.length" class="mt-4 overflow-hidden rounded-[12px] border border-[#dbe7f5] bg-white">
            <div class="flex items-center justify-between gap-3 border-b border-[#edf0f5] bg-[#f8fbff] px-4 py-3">
              <div class="flex items-center gap-2 text-[13px] font-semibold text-[#101828]">
                <LucideIcon name="files" :size="15" class="text-[#0b7cff]" />
                已选择 {{ fileList.length }} 个文件
              </div>
              <button type="button" class="text-[12px] text-[#667085] hover:text-[#ff3b30]" @click="clearSelectedFiles">
                清空
              </button>
            </div>
            <div class="divide-y divide-[#edf0f5]">
              <div v-for="file in fileList" :key="file.uid || file.name"
                class="grid grid-cols-[1fr_96px_48px] items-center gap-4 px-4 py-3 text-[13px]">
                <div class="flex min-w-0 items-center gap-2">
                  <LucideIcon name="file-text" :size="15" class="shrink-0 text-[#0b7cff]" />
                  <span class="min-w-0 flex-1 truncate text-[#344054]">{{ file.name }}</span>
                </div>
                <span class="text-right text-[12px] text-[#667085]">{{ formatFileSize(file.size || file.raw?.size) }}</span>
                <button type="button" class="justify-self-end text-[#98a2b3] hover:text-[#ff3b30]" @click="removeSelectedFile(file)">
                  <LucideIcon name="trash-2" :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 流程操作按钮 -->
        <div class="flex items-center justify-between pt-5 border-t border-[#edf0f5]">
          <UiButton @click="$router.push('/teacher/grading/rubrics')"
            class="h-11 px-5 rounded-[10px] text-[14px] font-medium text-[#344054] bg-white hover:bg-[#f8fafc] active:scale-[0.98] transition-all cursor-pointer border border-[#d0d5dd] shadow-none">
            管理评分标准
          </UiButton>
          <UiButton @click="submitTask"
            :disabled="submitting || !createForm.rubricId || fileList.length === 0"
            class="h-11 px-7 rounded-[10px] text-[14px] font-semibold text-white bg-[#0b7cff] shadow-[0_8px_18px_rgba(11,124,255,0.24)] hover:bg-[#006ee6] active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
            <span v-if="submitting" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              处理中...
            </span>
            <span v-else class="inline-flex items-center gap-2">
              <LucideIcon name="send" :size="18" />
              开始批改
            </span>
          </UiButton>
        </div>
      </div>
    </div>

    <!-- 任务历史区 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-[15px] font-semibold text-[#1d1d1f] m-0">批改历史</h3>
        <span class="text-[13px] text-[#aeaeb2]">共 {{ tasks.length }} 个任务</span>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12 bg-white rounded-[12px] border border-black/[0.06]">
        <svg class="animate-spin h-6 w-6 text-[#007aff]" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>

      <!-- 任务列表 -->
      <div v-else-if="tasks.length > 0" class="flex flex-col gap-3">
        <div v-for="row in tasks" :key="row.taskId"
          class="flex items-center gap-4 p-4 bg-white rounded-[12px] border border-black/[0.06] hover:border-[#007aff]/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <!-- 状态图标 -->
          <div class="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0"
            :class="{
              'bg-[#fff3e0] text-[#ff9500]': row.status === 'PROCESSING',
              'bg-[#e8f8ed] text-[#30d158]': row.status === 'COMPLETED',
              'bg-[#f5f5f7] text-[#6e6e73]': row.status === 'PENDING',
              'bg-[#ffeeed] text-[#ff3b30]': row.status === 'FAILED'
            }">
            <LucideIcon v-if="row.status === 'PROCESSING'" name="loader" :size="20" />
            <LucideIcon v-else-if="row.status === 'COMPLETED'" name="check" :size="20" />
            <LucideIcon v-else-if="row.status === 'FAILED'" name="alert-triangle" :size="20" />
            <LucideIcon v-else name="clock" :size="20" />
          </div>

          <!-- 任务信息 -->
          <div class="flex-1 min-w-0">
            <div class="text-[14px] font-medium text-[#1d1d1f] mb-1 truncate">
              {{ row.experimentName || `批改任务 #${row.taskId}` }}
            </div>
            <div class="flex items-center gap-3 text-[12px] text-[#aeaeb2]">
              <span>#{{ row.taskId }}</span>
              <span>{{ formatTime(row.createdAt) }}</span>
              <span>{{ row.totalCount }} 份作业</span>
            </div>
          </div>

          <!-- 进度 -->
          <div class="flex items-center gap-2">
            <div class="w-20 h-1 bg-[#e5e5ea] rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300"
                :style="{ width: `${row.totalCount ? Math.round((row.completedCount + row.failedCount) / row.totalCount * 100) : 0}%` }"
                :class="row.failedCount > 0 ? 'bg-[#ff3b30]' : row.status === 'COMPLETED' ? 'bg-[#30d158]' : 'bg-[#007aff]'">
              </div>
            </div>
            <span class="text-[12px] font-medium text-[#6e6e73] w-10 text-right">
              {{ row.totalCount ? Math.round((row.completedCount + row.failedCount) / row.totalCount * 100) : 0 }}%
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2">
            <button @click="$router.push(`/teacher/grading/detail/${row.taskId}`)"
              class="h-8 px-3 rounded-lg bg-[#eef5ff] text-[#007aff] text-[12px] font-medium border-none cursor-pointer hover:bg-[#e0edff] transition-colors">
              查看详情
            </button>
            <button v-if="row.failedCount > 0" @click="retryTask(row.taskId)"
              class="h-8 px-3 rounded-lg bg-[#fff3e0] text-[#ff9500] text-[12px] font-medium border-none cursor-pointer hover:bg-[#ffe8cc] transition-colors">
              重试失败
            </button>
            <button v-if="row.status === 'COMPLETED'" @click="exportTask(row.taskId)"
              class="h-8 px-3 rounded-lg bg-[#e8f8ed] text-[#30d158] text-[12px] font-medium border-none cursor-pointer hover:bg-[#d4f5e0] transition-colors">
              导出报告
            </button>
            <button @click="confirmDeleteTask(row.taskId)" :disabled="row.status === 'PROCESSING'"
              class="h-8 px-3 rounded-lg bg-[#f5f5f7] text-[#6e6e73] text-[12px] font-medium border-none cursor-pointer hover:bg-[#e8e8ed] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-12 bg-white rounded-[12px] border border-black/[0.06]">
        <div class="w-16 h-16 bg-[#f5f5f7] rounded-2xl flex items-center justify-center text-[#aeaeb2] mb-4">
          <LucideIcon name="clipboard" :size="32" />
        </div>
        <p class="text-[14px] text-[#aeaeb2] m-0">暂无批改任务</p>
        <p class="text-[12px] text-[#d1d5db] m-0 mt-2">上传作业文件后开始批改</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage, messageBox } from '@/services/feedback'
import { getRubrics, normalizeRubricList, getGradingTasks, createGradingTask, retryGradingTask, exportGradingTask, deleteGradingTask } from '@/api/tap'
import LucideIcon from '@/components/LucideIcon.vue'

const rubrics = ref([])
const tasks = ref([])
const loading = ref(false)
const submitting = ref(false)
const fileList = ref([])
const uploadRef = ref(null)
const createForm = ref({ rubricId: null, experimentId: '', classId: '', teacherSignature: '', scoreRange: [75, 99] })
let refreshTimer = null

// 监听分数区间变化，确保值在有效范围内
watch(() => createForm.value.scoreRange, (newVal) => {
  // 确保值在 0-100 范围内
  createForm.value.scoreRange[0] = Math.max(0, Math.min(100, newVal[0] || 0))
  createForm.value.scoreRange[1] = Math.max(0, Math.min(100, newVal[1] || 100))

  // 确保最小值不超过最大值
  if (createForm.value.scoreRange[0] > createForm.value.scoreRange[1]) {
    createForm.value.scoreRange = [createForm.value.scoreRange[1], createForm.value.scoreRange[0]]
  }
}, { deep: true })

// Range Slider 拖拽逻辑
let draggingIndex = -1
let sliderElement = null

function startDrag(index, event) {
  event.preventDefault()
  draggingIndex = index
  sliderElement = event.target.closest('.relative')

  const onMove = (e) => {
    if (draggingIndex === -1 || !sliderElement) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const rect = sliderElement.getBoundingClientRect()
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const value = Math.round(percent)

    if (draggingIndex === 0) {
      // 左手柄 - 最小值
      createForm.value.scoreRange[0] = Math.min(value, createForm.value.scoreRange[1])
    } else {
      // 右手柄 - 最大值
      createForm.value.scoreRange[1] = Math.max(value, createForm.value.scoreRange[0])
    }
  }

  const onEnd = () => {
    draggingIndex = -1
    sliderElement = null
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchmove', onMove)
  document.addEventListener('touchend', onEnd)
}


function formatTime(t) {
  if (!t) return '-'
  try { return new Date(t).toLocaleString('zh-CN') } catch { return t }
}

function normalizeUploadList(list) {
  return (Array.isArray(list) ? list : []).filter(Boolean)
}

function onFileChange(_, list) {
  fileList.value = normalizeUploadList(list)
}

function onFileRemove(_, list) {
  fileList.value = normalizeUploadList(list)
}

function removeSelectedFile(file) {
  fileList.value = fileList.value.filter(item => {
    if (item === file) return false
    if (file.uid && item.uid === file.uid) return false
    return true
  })
}

function clearSelectedFiles() {
  fileList.value = []
  uploadRef.value?.clearFiles?.()
}

function formatFileSize(size) {
  const bytes = Number(size || 0)
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function confirmDeleteTask(id) {
  try {
    await messageBox.confirm('确定删除此批改任务？删除后不可恢复', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    deleteTask(id)
  } catch {
    // user cancelled
  }
}

async function submitTask() {
  submitting.value = true
  try {
    const fd = new FormData()
    fileList.value.forEach(f => fd.append('files', f.raw || f.file || f))
    fd.append('rubricId', createForm.value.rubricId)
    if (createForm.value.experimentId) fd.append('experimentId', createForm.value.experimentId)
    if (createForm.value.classId) fd.append('classId', createForm.value.classId)
    if (createForm.value.teacherSignature) fd.append('teacherSignature', createForm.value.teacherSignature)
    if (createForm.value.scoreRange) {
      fd.append('scoreRangeMin', createForm.value.scoreRange[0])
      fd.append('scoreRangeMax', createForm.value.scoreRange[1])
    }
    await createGradingTask(fd)
    uiMessage.success('批改任务已创建，AI 正在处理中...')
    clearSelectedFiles()
    createForm.value.teacherSignature = ''
    loadTasks()
  } catch (e) { uiMessage.error('创建失败: ' + e.message) }
  submitting.value = false
}

async function loadTasks() {
  loading.value = true
  try {
    const res = await getGradingTasks()
    const data = res?.data ?? res
    tasks.value = data?.content || (Array.isArray(data) ? data : [])
  } catch (e) { uiMessage.error('加载任务列表失败: ' + e.message) }
  loading.value = false
}

async function retryTask(id) {
  try {
    await retryGradingTask(id)
    uiMessage.success('重试已发起')
    loadTasks()
  } catch (e) { uiMessage.error(e.message) }
}

async function deleteTask(id) {
  try {
    await deleteGradingTask(id)
    uiMessage.success('任务已删除')
    loadTasks()
  } catch (e) { uiMessage.error('删除失败: ' + e.message) }
}

async function exportTask(id) {
  try {
    const res = await exportGradingTask(id)
    const blob = new Blob([res], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `grading-export-${id}.zip`; a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    const message = String(e?.message || '')
    if (message.includes('Report not yet generated') || message.includes('404')) {
      uiMessage.warning('当前批改报告尚未生成，暂时无法导出 ZIP。')
      return
    }
    uiMessage.error(message || '导出失败')
  }
}

onMounted(async () => {
  try {
    const res = await getRubrics()
    rubrics.value = normalizeRubricList(res)
  } catch (e) { logger.error('加载评分标准失败:', e) }
  loadTasks()
  refreshTimer = setInterval(() => {
    if (tasks.value.some(t => t.status === 'PROCESSING' || t.status === 'PENDING')) loadTasks()
  }, 5000)
})

onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>

<style scoped>
:deep(.upload-flow-wrapper) {
  display: block !important;
  width: 100% !important;
}
:deep(.upload-flow-wrapper > div:first-of-type) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
