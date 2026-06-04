<template>
  <div class="grading-center min-h-full">
    <!-- Hero -->
    <div class="bg-white rounded-2xl py-7 px-8 mb-5 border border-black/[0.06] flex items-center gap-4">
      <div class="flex items-center gap-4">
        <div class="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef5ff] text-[#1677ff]">
          <LucideIcon name="clipboard-check" :size="26" />
        </div>
        <div>
          <h1 class="m-0 mb-1 text-[22px] font-normal text-[#1d1d1f]">AI 批改中心</h1>
          <p class="m-0 text-sm text-[#6e6e73]">上传学生 PDF 作业，AI 自动评分并生成详细评语</p>
        </div>
      </div>
    </div>

    <!-- Create Task Card -->
    <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] mb-5 overflow-hidden">
      <div class="flex justify-between items-start gap-3 px-6 py-4 border-b border-black/[0.06]">
        <span class="text-base font-semibold text-[#1d1d1f]">创建批改任务</span>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5 mb-5">
          <!-- 评分标准 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#6e6e73]">评分标准</label>
            <select v-model="createForm.rubricId"
              class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none appearance-none cursor-pointer text-[#1d1d1f]">
              <option value="" disabled selected>选择评分标准</option>
              <option v-for="r in rubrics" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
          <!-- 实验ID -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#6e6e73]">实验ID</label>
            <input v-model="createForm.experimentId" placeholder="可选"
              class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:ring-2 focus:ring-[#007aff]/30" />
          </div>
          <!-- 班级ID -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#6e6e73]">班级ID</label>
            <input v-model="createForm.classId" placeholder="可选"
              class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:ring-2 focus:ring-[#007aff]/30" />
          </div>
          <!-- 教师署名 -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#6e6e73]">教师署名</label>
            <input v-model="createForm.teacherSignature" maxlength="32" placeholder="例如：张老师"
              class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] text-sm outline-none text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:ring-2 focus:ring-[#007aff]/30" />
          </div>
        </div>

        <!-- 期望分数区间 -->
        <div class="mb-5">
          <label class="text-[13px] font-medium text-[#6e6e73] mb-1.5 block">期望分数区间</label>
          <div class="max-w-[600px] px-3">
            <el-slider v-model="createForm.scoreRange" range :min="0" :max="100" :step="1"
              :marks="{ 0: '0', 75: '75', 90: '90', 99: '99', 100: '100' }" />
          </div>
          <div class="text-xs text-[#aeaeb2] mt-1">
            大多数学生的成绩应落在此区间内（{{ createForm.scoreRange[0] }} - {{ createForm.scoreRange[1] }}分），允许个别异常值
          </div>
        </div>

        <!-- 上传PDF -->
        <div class="mb-5">
          <label class="text-[13px] font-medium text-[#6e6e73] mb-1.5 block">上传PDF</label>
          <el-upload ref="uploadRef" :auto-upload="false" :on-change="onFileChange"
                     accept=".pdf,.docx,.doc" multiple drag :file-list="fileList" :on-remove="onFileRemove">
            <UploadFilled class="text-[40px] text-[#aeaeb2]" />
            <div class="text-[#6e6e73] mt-2">拖拽 PDF 文件到此处，或点击上传（最多200 份）</div>
          </el-upload>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button @click="submitTask"
            :disabled="submitting || !createForm.rubricId || fileList.length === 0"
            class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            <span v-if="submitting" class="inline-flex items-center gap-1.5">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              处理中...
            </span>
            <span v-else>开始批改({{ fileList.length }} 件)</span>
          </button>
          <button @click="$router.push('/teacher/grading/rubrics')"
            class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none">
            管理评分标准
          </button>
        </div>
      </div>
    </div>

    <!-- Task List -->
    <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] mb-5 overflow-hidden">
      <div class="flex justify-between items-center px-6 py-4 border-b border-black/[0.06]">
        <span class="text-base font-semibold text-[#1d1d1f]">批改任务列表</span>
        <button @click="loadTasks"
          class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors bg-transparent border-none inline-flex items-center gap-1">
          <Refresh class="w-4 h-4" /> 刷新
        </button>
      </div>
      <div class="p-6">
        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <svg class="animate-spin h-6 w-6 text-[#007aff]" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>

        <!-- Table -->
        <div v-else-if="tasks.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-black/[0.06]">
                <th class="py-3 px-3 text-xs font-medium text-[#6e6e73] bg-[#f9f9f9] rounded-tl-lg">ID</th>
                <th class="py-3 px-3 text-xs font-medium text-[#6e6e73] bg-[#f9f9f9]">状态</th>
                <th class="py-3 px-3 text-xs font-medium text-[#6e6e73] bg-[#f9f9f9]">进度</th>
                <th class="py-3 px-3 text-xs font-medium text-[#6e6e73] bg-[#f9f9f9]">创建时间</th>
                <th class="py-3 px-3 text-xs font-medium text-[#6e6e73] bg-[#f9f9f9] rounded-tr-lg">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tasks" :key="row.taskId" class="border-b border-black/[0.04] hover:bg-[#f5f5f7]/50 transition-colors">
                <td class="py-3 px-3 text-[13px] text-[#1d1d1f]">{{ row.taskId }}</td>
                <td class="py-3 px-3">
                  <span :class="statusTagClass(row.status)" class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold">
                    {{ statusText(row.status) }}
                  </span>
                </td>
                <td class="py-3 px-3 min-w-[180px]">
                  <div class="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
                    <div class="h-full w-[var(--progress-width)] rounded-full transition-all duration-300"
                      :style="progressWidthStyle(row.totalCount ? Math.round((row.completedCount + row.failedCount) / row.totalCount * 100) : 0)"
                      :class="row.failedCount > 0 ? 'bg-gradient-to-r from-[#ff6259] to-[#ff3b30]' : row.status === 'COMPLETED' ? 'bg-gradient-to-r from-[#30d158] to-[#28cd41]' : 'bg-gradient-to-r from-[#3898ff] to-[#007aff]'">
                    </div>
                  </div>
                  <span class="text-xs text-[#aeaeb2] mt-1 block">
                    {{ row.completedCount }}/{{ row.totalCount }} 完成
                    <span v-if="row.failedCount > 0" class="text-[#ef4444]">，{{ row.failedCount }} 失败</span>
                  </span>
                </td>
                <td class="py-3 px-3 text-[13px] text-[#6e6e73]">{{ formatTime(row.createdAt) }}</td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2 flex-wrap">
                    <button @click="$router.push(`/teacher/grading/detail/${row.taskId}`)"
                      class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors bg-transparent border-none">
                      查看详情
                    </button>
                    <button v-if="row.failedCount > 0" @click="retryTask(row.taskId)"
                      class="text-[13px] font-medium text-[#ff9500] cursor-pointer hover:text-[#cc7700] transition-colors bg-transparent border-none">
                      重试失败
                    </button>
                    <button v-if="row.status === 'COMPLETED'" @click="exportTask(row.taskId)"
                      class="text-[13px] font-medium text-[#30d158] cursor-pointer hover:text-[#1fa840] transition-colors bg-transparent border-none">
                      导出报告
                    </button>
                    <button @click="confirmDeleteTask(row.taskId)" :disabled="row.status === 'PROCESSING'"
                      class="text-[13px] font-medium text-[#ff3b30] cursor-pointer hover:text-[#cc2f26] transition-colors bg-transparent border-none disabled:opacity-40 disabled:cursor-not-allowed">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-16">
          <LucideIcon name="clipboard" class="mb-3 text-[#c6ccd6]" :size="46" />
          <p class="text-sm text-[#aeaeb2]">暂无批改任务</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Refresh } from '@element-plus/icons-vue'
import { getRubrics, getGradingTasks, createGradingTask, retryGradingTask, exportGradingTask, deleteGradingTask } from '@/api/tap'
import LucideIcon from '@/components/LucideIcon.vue'

const rubrics = ref([])
const tasks = ref([])
const loading = ref(false)
const submitting = ref(false)
const fileList = ref([])
const createForm = ref({ rubricId: null, experimentId: '', classId: '', teacherSignature: '', scoreRange: [75, 99] })
let refreshTimer = null


function statusTagClass(s) {
  const map = {
    PENDING: 'bg-[#f5f5f7] text-[#6e6e73]',
    PROCESSING: 'bg-[#fff3e0] text-[#ff9500]',
    COMPLETED: 'bg-[#e8f8ed] text-[#30d158]',
    FAILED: 'bg-[#ffeeed] text-[#ff3b30]'
  }
  return map[s] || 'bg-[#f5f5f7] text-[#6e6e73]'
}

function statusText(s) {
  return { PENDING: '等待中', PROCESSING: '处理中', COMPLETED: '已完成', FAILED: '失败' }[s] || s
}

function progressWidthStyle(value) {
  return { '--progress-width': `${value}%` }
}

function formatTime(t) {
  if (!t) return '-'
  try { return new Date(t).toLocaleString('zh-CN') } catch { return t }
}

function onFileChange(_, list) { fileList.value = list }
function onFileRemove(_, list) { fileList.value = list }

async function confirmDeleteTask(id) {
  try {
    await ElMessageBox.confirm('确定删除此批改任务？删除后不可恢复', '确认删除', {
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
    fileList.value.forEach(f => fd.append('files', f.raw))
    fd.append('rubricId', createForm.value.rubricId)
    if (createForm.value.experimentId) fd.append('experimentId', createForm.value.experimentId)
    if (createForm.value.classId) fd.append('classId', createForm.value.classId)
    if (createForm.value.teacherSignature) fd.append('teacherSignature', createForm.value.teacherSignature)
    if (createForm.value.scoreRange) {
      fd.append('scoreRangeMin', createForm.value.scoreRange[0])
      fd.append('scoreRangeMax', createForm.value.scoreRange[1])
    }
    await createGradingTask(fd)
    ElMessage.success('批改任务已创建，AI 正在处理中..')
    fileList.value = []
    createForm.value.teacherSignature = ''
    loadTasks()
  } catch (e) { ElMessage.error('创建失败: ' + e.message) }
  submitting.value = false
}

async function loadTasks() {
  loading.value = true
  try {
    const res = await getGradingTasks()
    const data = res?.data ?? res
    tasks.value = data?.content || (Array.isArray(data) ? data : [])
  } catch (e) { ElMessage.error('加载任务列表失败: ' + e.message) }
  loading.value = false
}

async function retryTask(id) {
  try {
    await retryGradingTask(id)
    ElMessage.success('重试已发起')
    loadTasks()
  } catch (e) { ElMessage.error(e.message) }
}

async function deleteTask(id) {
  try {
    await deleteGradingTask(id)
    ElMessage.success('任务已删除')
    loadTasks()
  } catch (e) { ElMessage.error('删除失败: ' + e.message) }
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
      ElMessage.warning('当前批改报告尚未生成，暂时无法导出 ZIP。')
      return
    }
    ElMessage.error(message || '导出失败')
  }
}

onMounted(async () => {
  try {
    const res = await getRubrics()
    const data = res?.data ?? res
    rubrics.value = Array.isArray(data) ? data : []
  } catch (e) { logger.error('加载评分标准失败:', e) }
  loadTasks()
  refreshTimer = setInterval(() => {
    if (tasks.value.some(t => t.status === 'PROCESSING' || t.status === 'PENDING')) loadTasks()
  }, 5000)
})

onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })
</script>
