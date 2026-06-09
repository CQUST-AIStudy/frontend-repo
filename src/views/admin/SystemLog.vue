<template>
  <div class="system-log [min-width:0] [min-height:100%]">
    <UiPageHeader
        class="my-page-header [margin-bottom:20px] [min-height:68px] [padding:0_20px] max-[768px]:[margin-bottom:16px] max-[768px]:[min-height:56px] max-[768px]:[padding:0_16px]"
      title="系统日志"
      description="系统操作和事件记录"
    />

    <div class="system-log-content [display:flex] [flex-direction:column] [gap:20px]">
      <ui-card class="[margin-bottom:20px]">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [gap:16px] max-[900px]:[align-items:flex-start] max-[900px]:[flex-direction:column]">
            <div class="left">
              <span>日志列表</span>
            </div>
            <div class="right [display:flex] [gap:12px] [align-items:center] [justify-content:flex-end] [flex-wrap:nowrap] max-[900px]:[width:100%] max-[900px]:[justify-content:flex-start] max-[900px]:[flex-wrap:wrap]">
              <ui-input
                placeholder="搜索日志内容"
                v-model="searchKeyword"
                class="search-input log-search-input max-[900px]:[width:100%]"
                clearable
              >
                <template #prefix>
                  <ui-icon><Search /></ui-icon>
                </template>
              </ui-input>
              <ui-select v-model="logLevel" placeholder="日志级别" clearable class="level-select [width:160px] max-[900px]:[width:100%]">
                <ui-option label="全部" value="" />
                <ui-option label="信息" value="INFO" />
                <ui-option label="警告" value="WARNING" />
                <ui-option label="错误" value="ERROR" />
              </ui-select>
              <ui-button type="danger" class="[min-width:96px] [padding:0_16px] [white-space:nowrap]" @click="clearLogs">清空日志</ui-button>
              <ui-button type="primary" class="[min-width:96px] [padding:0_16px] [white-space:nowrap]" @click="exportLogs">导出日志</ui-button>
            </div>
          </div>
        </template>

        <ui-table :data="filteredLogs" :aria-busy="loading" border class="[width:100%]">
          <ui-table-column prop="timestamp" label="时间" width="180" sortable />
          <ui-table-column label="级别" width="100">
            <template #default="scope">
              <ui-tag
                :type="getLogLevelType(scope.row.level)"
                size="small"
              >
                {{ scope.row.level }}
              </ui-tag>
            </template>
          </ui-table-column>
          <ui-table-column prop="category" label="分类" width="120" />
          <ui-table-column prop="message" label="消息内容" min-width="400" show-overflow-tooltip />
          <ui-table-column prop="user" label="相关用户" width="120" />
          <ui-table-column prop="ip" label="IP地址" width="140" />
          <ui-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <ui-button type="primary" link @click="viewLogDetail(scope.row)">详情</ui-button>
            </template>
          </ui-table-column>
        </ui-table>

        <div class="pagination-container [margin-top:20px] [display:flex] [justify-content:center] [overflow-x:auto] [margin-top:10px] [text-align:right] [justify-content:flex-end] [margin-top:16px]">
          <ui-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </ui-card>
    </div>

    <!-- 日志详情对话框 -->
    <ui-dialog v-model="logDetailVisible" title="日志详情" width="60%">
      <ui-descriptions :column="1" border>
        <ui-descriptions-item label="时间">{{ selectedLog.timestamp }}</ui-descriptions-item>
        <ui-descriptions-item label="级别">
          <ui-tag :type="getLogLevelType(selectedLog.level)">{{ selectedLog.level }}</ui-tag>
        </ui-descriptions-item>
        <ui-descriptions-item label="分类">{{ selectedLog.category }}</ui-descriptions-item>
        <ui-descriptions-item label="消息内容">{{ selectedLog.message }}</ui-descriptions-item>
        <ui-descriptions-item label="相关用户">{{ selectedLog.user }}</ui-descriptions-item>
        <ui-descriptions-item label="IP地址">{{ selectedLog.ip }}</ui-descriptions-item>
        <ui-descriptions-item label="浏览器">{{ selectedLog.userAgent || '未知' }}</ui-descriptions-item>
        <ui-descriptions-item label="完整请求地址" v-if="selectedLog.url">
          {{ selectedLog.url }}
        </ui-descriptions-item>
        <ui-descriptions-item label="请求参数" v-if="selectedLog.params">
          <pre>{{ selectedLog.params }}</pre>
        </ui-descriptions-item>
        <ui-descriptions-item label="错误堆栈" v-if="selectedLog.stackTrace">
          <ui-collapse>
            <ui-collapse-item title="查看错误堆栈信息">
              <pre class="stack-trace [font-family:monospace] [white-space:pre-wrap] [background-color:#f5f5f5] [padding:10px] [border-radius:4px] [color:#666] [font-size:12px] [max-height:300px] [overflow-y:auto]">{{ selectedLog.stackTrace }}</pre>
            </ui-collapse-item>
          </ui-collapse>
        </ui-descriptions-item>
      </ui-descriptions>
    </ui-dialog>

    <!-- 清空日志确认对话框 -->
    <ui-dialog v-model="clearConfirmVisible" title="警告" width="30%">
      <span>确定要清空所有日志吗？此操作不可撤销!</span>
      <template #footer>
        <div class="dialog-footer [display:flex] [justify-content:flex-end] [gap:10px]">
          <ui-button @click="clearConfirmVisible = false">取消</ui-button>
          <ui-button type="danger" @click="confirmClearLogs">确定</ui-button>
        </div>
      </template>
    </ui-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { Search } from '@/components/ui/icons'
import api from '../../api'

const loading = ref(false)
const searchKeyword = ref('')
const logLevel = ref('')
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const logDetailVisible = ref(false)
const clearConfirmVisible = ref(false)
const selectedLog = ref({})
const logs = ref([])

const filteredLogs = logs

const getLogLevelType = (level) => {
  const typeMap = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'danger'
  }
  return typeMap[level] || 'info'
}

const loadLogs = async () => {
  loading.value = true
  try {
    const response = await api.getSystemLogs({
      keyword: searchKeyword.value,
      level: logLevel.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    logs.value = Array.isArray(response?.data) ? response.data : []
    total.value = Number(response?.total || logs.value.length)
  } catch (error) {
    logs.value = []
    total.value = 0
    logger.error('加载系统日志失败:', error)
    uiMessage.error('加载系统日志失败')
  } finally {
    loading.value = false
  }
}

const viewLogDetail = (log) => {
  selectedLog.value = { ...log }
  logDetailVisible.value = true
}

const clearLogs = () => {
  clearConfirmVisible.value = true
}

const confirmClearLogs = async () => {
  try {
    await api.clearSystemLogs()
    clearConfirmVisible.value = false
    currentPage.value = 1
    await loadLogs()
    uiMessage.success('日志已清空')
  } catch (error) {
    logger.error('清空系统日志失败:', error)
    uiMessage.error('清空系统日志失败')
  }
}

const exportLogs = async () => {
  try {
    const blob = await api.exportSystemLogs({
      keyword: searchKeyword.value,
      level: logLevel.value
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'system-logs.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    logger.error('导出系统日志失败:', error)
    uiMessage.error('导出系统日志失败')
  }
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadLogs()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadLogs()
}

watch([searchKeyword, logLevel], () => {
  currentPage.value = 1
  loadLogs()
})

onMounted(loadLogs)
</script>

<style scoped>
.log-search-input {
  width: 220px;
  transition: width 0.2s ease;
}

.log-search-input:focus-within {
  width: 360px;
}

@media (max-width: 900px) {
  .log-search-input,
  .log-search-input:focus-within {
    width: 100%;
  }
}
</style>


