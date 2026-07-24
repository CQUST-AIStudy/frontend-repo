<template>
  <div class="admin-dashboard [min-height:100%] [min-width:0] [color:#1f2937]">
    <UiPageHeader
      class="my-page-header [margin-bottom:24px] [min-height:68px] [padding:0_20px] max-[768px]:[margin-bottom:16px] max-[768px]:[min-height:56px] max-[768px]:[padding:0_16px]"
      title="管理员控制台"
      description="统一查看 API 资源、PTA 爬虫状态和教师侧数据更新情况"
    />

    <ui-skeleton v-if="loading" :rows="12" animated />

    <div v-else class="dashboard-body [display:flex] [flex-direction:column] [gap:24px] [min-width:0] max-[640px]:[gap:14px]">
      <section class="hero-grid [display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:16px] max-[1280px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[768px]:[grid-template-columns:1fr]">
        <ui-card class="hero-card hero-card-ai [border:none] [overflow:hidden] ![background:linear-gradient(135deg,_#16324f,_#2b6f91)] ![color:#f8fafc] ![box-shadow:0_16px_36px_rgba(22,_50,_79,_0.18)] [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[flex-direction:column] [&_.ui-card__body]:[gap:12px] [&_.ui-card__body]:[min-height:150px] max-[640px]:[&_.ui-card__body]:[min-height:auto] max-[640px]:[&_.ui-card__body]:[padding:18px]" shadow="hover">
          <div class="hero-label [font-size:14px] [font-weight:600] [color:#f1d5c2]">今日 AI 请求</div>
          <div class="hero-value [font-size:34px] [font-weight:800] [line-height:1] [color:#ffffff] max-[640px]:[font-size:30px]">{{ formatNumber(stats.aiRequestsUsedToday) }}</div>
          <div class="hero-meta [font-size:13px] [font-weight:500] [color:#c7d2fe] [word-break:break-all]">上限 {{ formatNumber(stats.aiRequestsLimit) }}</div>
          <ui-progress :percentage="quotaPercent('ai')" :stroke-width="8" :show-text="false" />
        </ui-card>

        <ui-card class="hero-card hero-card-tr [border:none] [overflow:hidden] ![background:linear-gradient(135deg,_#17463a,_#247a62)] ![color:#f0fdf4] ![box-shadow:0_16px_36px_rgba(23,_70,_58,_0.18)] [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[flex-direction:column] [&_.ui-card__body]:[gap:12px] [&_.ui-card__body]:[min-height:150px] max-[640px]:[&_.ui-card__body]:[min-height:auto] max-[640px]:[&_.ui-card__body]:[padding:18px]" shadow="hover">
          <div class="hero-label [font-size:14px] [font-weight:600] [color:#dcfce7]">今日翻译字符</div>
          <div class="hero-value [font-size:34px] [font-weight:800] [line-height:1] [color:#ffffff] max-[640px]:[font-size:30px]">{{ formatNumber(stats.translationCharsUsedToday) }}</div>
          <div class="hero-meta [font-size:13px] [font-weight:500] [color:#bbf7d0] [word-break:break-all]">上限 {{ formatNumber(stats.translationCharsLimit) }}</div>
          <ui-progress :percentage="quotaPercent('translation')" :stroke-width="8" :show-text="false" status="success" />
        </ui-card>

        <ui-card class="hero-card hero-card-sync [border:none] [overflow:hidden] ![background:linear-gradient(135deg,_#5b3a16,_#9a681f)] ![color:#fff7ed] ![box-shadow:0_16px_36px_rgba(91,_58,_22,_0.18)] [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[flex-direction:column] [&_.ui-card__body]:[gap:12px] [&_.ui-card__body]:[min-height:150px] max-[640px]:[&_.ui-card__body]:[min-height:auto] max-[640px]:[&_.ui-card__body]:[padding:18px]" shadow="hover">
          <div class="hero-label [font-size:14px] [font-weight:600] [color:#ffedd5]">开启同步班级</div>
          <div class="hero-value [font-size:34px] [font-weight:800] [line-height:1] [color:#ffffff] max-[640px]:[font-size:30px]">{{ formatNumber(stats.syncEnabledClassCount) }}</div>
          <div class="hero-meta [font-size:13px] [font-weight:500] [color:#fed7aa] [word-break:break-all]">运行中 {{ formatNumber(stats.runningClassCount) }} 个</div>
          <div class="hero-chip-row [display:flex] [gap:8px] [flex-wrap:wrap]">
            <ui-tag effect="plain" type="warning">待关注 {{ formatNumber(stats.attentionClassCount) }}</ui-tag>
          </div>
        </ui-card>

        <ui-card class="hero-card hero-card-spider [border:none] [overflow:hidden] ![background:linear-gradient(135deg,_#3c234f,_#7c4ba6)] ![color:#faf5ff] ![box-shadow:0_16px_36px_rgba(60,_35,_79,_0.18)] [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[flex-direction:column] [&_.ui-card__body]:[gap:12px] [&_.ui-card__body]:[min-height:150px] max-[640px]:[&_.ui-card__body]:[min-height:auto] max-[640px]:[&_.ui-card__body]:[padding:18px]" shadow="hover">
          <div class="hero-label [font-size:14px] [font-weight:600] [color:#f3e8ff]">爬虫与 Cookie</div>
          <div class="hero-status-row [display:flex] [gap:8px] [flex-wrap:wrap]">
            <ui-tag :type="spider.healthy ? 'success' : 'danger'" effect="dark">
              {{ spider.healthy ? '爬虫在线' : '爬虫离线' }}
            </ui-tag>
            <ui-tag :type="cookieStatusType(spider.cookieStatus)" effect="plain">
              Cookie {{ cookieStatusText(spider.cookieStatus) }}
            </ui-tag>
          </div>
          <div class="hero-meta [font-size:13px] [font-weight:500] [color:#e9d5ff] [word-break:break-all]">{{ spider.baseUrl || '未配置' }}</div>
          <div class="hero-meta [font-size:13px] [font-weight:500] [color:#e9d5ff] [word-break:break-all]" v-if="spider.cookieLastUpdated">
            上次更新 {{ formatDateTime(spider.cookieLastUpdated) }}
          </div>
        </ui-card>
      </section>

      <section class="content-grid [display:grid] [grid-template-columns:minmax(0,_1.9fr)_minmax(320px,_0.95fr)] [gap:16px] [align-items:start] max-[1280px]:[grid-template-columns:1fr]">
        <div class="main-column [display:flex] [flex-direction:column] [gap:16px]">
          <ui-card class="panel-card [min-width:0] [border-radius:18px] [border:1px_solid_#e7ebf0]" shadow="never">
            <template #header>
              <div class="panel-header [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] max-[640px]:[align-items:flex-start] max-[640px]:[flex-direction:column]">
                <div>
                  <div class="panel-title [font-size:16px] [font-weight:700] [color:#1f2937]">API 资源池</div>
                  <div class="panel-desc [margin-top:4px] [font-size:12px] [color:#667085]">查看 Key 状态、来源、当日用量和更换建议</div>
                </div>
                <ui-button text @click="loadDashboard">刷新</ui-button>
              </div>
            </template>

            <div class="dashboard-table-wrap dashboard-table-wrap--api">
              <ui-table :data="apiServices" stripe>
                <ui-table-column prop="name" label="服务" min-width="120" />
                <ui-table-column label="状态" width="70">
                  <template #default="{ row }">
                    <ui-status-dot :type="serviceStatusType(row.status)" :content="serviceStatusText(row.status)" />
                  </template>
                </ui-table-column>
                <ui-table-column prop="provider" label="Provider" width="120" />
                <ui-table-column prop="model" label="模型/用途" min-width="150" />
                <ui-table-column label="Key" min-width="180">
                  <template #default="{ row }">
                    <div class="mono table-text-clip">{{ row.maskedKey || '未配置' }}</div>
                    <div class="muted table-text-wrap">{{ row.envName }} / {{ row.source }}</div>
                  </template>
                </ui-table-column>
                <ui-table-column label="今日用量" min-width="180">
                  <template #default="{ row }">
                    <div v-if="row.limit > 0">
                      {{ formatUsage(row.usedToday, row.usageUnit) }} / {{ formatUsage(row.limit, row.usageUnit) }}
                    </div>
                    <div v-else class="muted table-text-wrap">未接入统计</div>
                  </template>
                </ui-table-column>
                <ui-table-column prop="actionHint" label="建议动作" min-width="220" />
              </ui-table>
            </div>
          </ui-card>

          <ui-card class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div>
                  <div class="panel-title">教师侧数据时效性</div>
                  <div class="panel-desc">管理员可按班级查看 PTA 增量同步状态并直接触发</div>
                </div>
                <ui-button text @click="loadDashboard">刷新班级状态</ui-button>
              </div>
            </template>

            <div class="dashboard-table-wrap dashboard-table-wrap--classes">
              <ui-table :data="classes" stripe>
                <ui-table-column prop="name" label="班级" min-width="150" />
                <ui-table-column prop="teacherName" label="教师" width="130" />
                <ui-table-column prop="ptaGroupName" label="PTA 用户组" min-width="140" />
                <ui-table-column label="同步开关" width="70">
                  <template #default="{ row }">
                    <ui-tooltip :content="row.syncEnabled ? '已开启' : '未开启'" placement="top">
                      <ui-icon :class="row.syncEnabled ? 'text-[#16a34a]' : 'text-[#cbd5e1]'" class="text-[18px]">
                        <SwitchButton />
                      </ui-icon>
                    </ui-tooltip>
                  </template>
                </ui-table-column>
                <ui-table-column label="状态" width="70">
                  <template #default="{ row }">
                    <ui-status-dot :type="syncStatusType(row.syncStatus)" :content="syncStatusText(row.syncStatus)" />
                  </template>
                </ui-table-column>
                <ui-table-column label="上次成功更新" min-width="165">
                  <template #default="{ row }">
                    {{ row.lastSyncAt ? formatDateTime(row.lastSyncAt) : '未同步' }}
                  </template>
                </ui-table-column>
                <ui-table-column label="关注项" min-width="170">
                  <template #default="{ row }">
                    <ui-tag v-if="row.attention" type="warning" effect="plain">{{ row.attentionReason }}</ui-tag>
                    <span v-else class="muted table-text-wrap">正常</span>
                  </template>
                </ui-table-column>
                <ui-table-column label="操作" width="190">
                  <template #default="{ row }">
                    <div class="action-row">
                      <ui-button
                        type="primary"
                        link
                        :disabled="!row.syncEnabled || (!row.ptaGroupName && !row.ptaGroupId) || syncingClassId === row.id"
                        @click="triggerSync(row, 'incremental')"
                      >
                        增量同步
                      </ui-button>
                      <ui-button
                        type="danger"
                        link
                        :disabled="!row.syncEnabled || (!row.ptaGroupName && !row.ptaGroupId) || syncingClassId === row.id"
                        @click="confirmFullSync(row)"
                      >
                        全量同步
                      </ui-button>
                    </div>
                  </template>
                </ui-table-column>
              </ui-table>
            </div>
          </ui-card>

          <ui-card class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div>
                  <div class="panel-title">最近 PTA 任务</div>
                  <div class="panel-desc">查看增量更新了哪些题集、提交记录和导出数据</div>
                </div>
                <ui-button text @click="loadDashboard">刷新任务</ui-button>
              </div>
            </template>

            <div class="dashboard-table-wrap dashboard-table-wrap--tasks">
              <ui-table :data="recentTasks" stripe>
                <ui-table-column prop="taskId" label="任务 ID" min-width="110" />
                <ui-table-column prop="groupName" label="用户组" min-width="120" />
                <ui-table-column label="模式" width="100">
                  <template #default="{ row }">
                    <ui-tag :type="taskModeType(row.mode)" effect="plain">{{ modeText(row.mode) }}</ui-tag>
                  </template>
                </ui-table-column>
                <ui-table-column label="状态" width="70">
                  <template #default="{ row }">
                    <ui-status-dot :type="syncStatusType(row.status)" :content="syncStatusText(row.status)" />
                  </template>
                </ui-table-column>
                <ui-table-column label="增量结果" min-width="240">
                  <template #default="{ row }">
                    新题集 {{ row.newSetsCount || 0 }}，刷新 {{ row.refreshedCount || 0 }}，提交 {{ row.submissionsCount || 0 }}
                  </template>
                </ui-table-column>
                <ui-table-column label="创建时间" min-width="160">
                  <template #default="{ row }">
                    {{ formatDateTime(row.createdAt) }}
                  </template>
                </ui-table-column>
              </ui-table>
            </div>
          </ui-card>
        </div>

        <div class="side-column [display:flex] [flex-direction:column] [gap:16px]">
          <ui-card class="panel-card side-status-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div>
                  <div class="panel-title">爬虫运行状态</div>
                  <div class="panel-desc">管理员可优先处理 Cookie 失效和爬虫离线</div>
                </div>
              </div>
            </template>

            <div class="status-list [display:flex] [flex-direction:column] [gap:12px]">
              <div class="status-item [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [gap:8px]">
                <span class="status-label [color:#667085] [font-size:13px] [color:#5f6368]">爬虫服务</span>
                <ui-tag :type="spider.healthy ? 'success' : 'danger'" effect="dark">
                  {{ spider.healthy ? '在线' : '离线' }}
                </ui-tag>
              </div>
              <div class="status-item [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [gap:8px]">
                <span class="status-label [color:#667085] [font-size:13px] [color:#5f6368]">Cookie 状态</span>
                <ui-tag :type="cookieStatusType(spider.cookieStatus)" effect="plain">
                  {{ cookieStatusText(spider.cookieStatus) }}
                </ui-tag>
              </div>
              <div class="status-item [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [gap:8px]">
                <span class="status-label [color:#667085] [font-size:13px] [color:#5f6368]">Cookie 更新时间</span>
                <span>{{ spider.cookieLastUpdated ? formatDateTime(spider.cookieLastUpdated) : '未知' }}</span>
              </div>
              <div class="status-item [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [gap:8px]">
                <span class="status-label [color:#667085] [font-size:13px] [color:#5f6368]">爬虫地址</span>
                <span class="mono compact [font-family:Consolas,_'Courier_New',_monospace] [font-size:12px]">{{ spider.baseUrl || '未配置' }}</span>
              </div>
            </div>

            <ui-alert
              v-if="spider.cookieError"
              class="inline-alert [margin-top:12px]"
              type="warning"
              :closable="false"
              show-icon
              :title="spider.cookieError"
            />
            <ui-alert
              v-if="spider.healthError"
              class="inline-alert [margin-top:12px]"
              type="error"
              :closable="false"
              show-icon
              :title="spider.healthError"
            />
          </ui-card>

          <ui-card class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div>
                  <div class="panel-title">Cookie 维护</div>
                  <div class="panel-desc">管理员可直接提交新的 PTA Cookie 恢复同步</div>
                </div>
              </div>
            </template>

            <ui-form label-position="top">
              <ui-form-item label="Cookie JSON">
                <ui-input
                  v-model="cookieInput"
                  type="textarea"
                  :rows="8"
                  placeholder='例如：[{"name":"PTASession","value":"xxx","domain":".pintia.cn"}]'
                />
              </ui-form-item>
            </ui-form>
            <ui-button class="[margin-top:14px]" type="primary" :loading="cookieSubmitting" :disabled="!cookieInput.trim()" @click="submitCookieForm">
              验证并保存 Cookie
            </ui-button>
            <div v-if="cookieResult" class="cookie-result [margin-top:12px] [display:flex] [align-items:center] [gap:10px] [margin-top:14px] [gap:6px] [padding:10px_14px] [border-radius:8px] [font-size:13px] [&.valid]:[background:#e6f4ea] [&.valid]:[color:#1e8e3e] [&.invalid]:[background:#fce8e6] [&.invalid]:[color:#d93025]">
              <ui-tag :type="cookieResult.valid ? 'success' : 'danger'" effect="dark">
                {{ cookieResult.valid ? '验证成功' : '验证失败' }}
              </ui-tag>
              <span class="cookie-message [color:#344054] [font-size:13px]">{{ cookieResult.message }}</span>
            </div>
          </ui-card>

          <ui-card class="panel-card" shadow="never">
            <template #header>
              <div class="panel-header">
                <div>
                  <div class="panel-title">当日用量 Top 用户</div>
                  <div class="panel-desc">便于判断哪些教师最依赖 AI/翻译资源</div>
                </div>
              </div>
            </template>

            <div class="dashboard-table-wrap dashboard-table-wrap--compact">
              <ui-table :data="topUsers" size="small">
                <ui-table-column prop="username" label="账号" min-width="110" />
                <ui-table-column label="AI 请求" width="80">
                  <template #default="{ row }">{{ formatNumber(row.aiRequests) }}</template>
                </ui-table-column>
                <ui-table-column label="翻译字符" min-width="110">
                  <template #default="{ row }">{{ formatNumber(row.translationChars) }}</template>
                </ui-table-column>
              </ui-table>
            </div>
          </ui-card>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import api from '../../api'
import { submitPtaCookie } from '../../api/tap'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'

const loading = ref(false)
const syncingClassId = ref(null)
const cookieSubmitting = ref(false)
const cookieInput = ref('')
const cookieResult = ref(null)
const dashboard = ref({
  stats: {},
  quota: { topUsers: [] },
  apiServices: [],
  spider: {},
  classes: [],
  recentTasks: []
})

const stats = computed(() => dashboard.value.stats || {})
const apiServices = computed(() => dashboard.value.apiServices || [])
const spider = computed(() => dashboard.value.spider || {})
const classes = computed(() => dashboard.value.classes || [])
const recentTasks = computed(() => dashboard.value.recentTasks || [])
const topUsers = computed(() => dashboard.value.quota?.topUsers || [])

onMounted(() => {
  loadDashboard()
})

async function loadDashboard() {
  loading.value = true
  try {
    const res = await api.getAdminDashboardOverview()
    dashboard.value = res?.data ?? res ?? dashboard.value
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '管理员数据加载失败，请稍后重试'))
  } finally {
    loading.value = false
  }
}

async function submitCookieForm() {
  cookieSubmitting.value = true
  cookieResult.value = null
  try {
    const res = await submitPtaCookie(cookieInput.value.trim())
    const data = res?.data ?? res ?? {}
    cookieResult.value = {
      valid: !!data.valid,
      message: getFriendlyResponseMessage(data, data.valid ? 'Cookie 已更新' : 'Cookie 无效，请重新提交')
    }
    if (data.valid) {
      uiMessage.success('Cookie 更新成功')
      cookieInput.value = ''
      await loadDashboard()
    } else {
      uiMessage.warning(cookieResult.value.message)
    }
  } catch (error) {
    cookieResult.value = { valid: false, message: getFriendlyErrorMessage(error, 'Cookie 更新失败，请稍后重试') }
    uiMessage.error(cookieResult.value.message)
  } finally {
    cookieSubmitting.value = false
  }
}

async function triggerSync(row, mode, force = false) {
  syncingClassId.value = row.id
  try {
    const res = await api.triggerAdminClassSync(row.id, { mode, force })
    const data = res?.data ?? res ?? {}
    if (data.blocked) {
      uiMessage.warning(getFriendlyResponseMessage(data, '任务被系统拦截，请稍后重试'))
    } else {
      uiMessage.success(data.message || `${row.name} 已提交${modeText(mode)}`)
    }
    await loadDashboard()
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '同步触发失败，请稍后重试'))
  } finally {
    syncingClassId.value = null
  }
}

async function confirmFullSync(row) {
  try {
    await messageBox.confirm(
      `确认对班级“${row.name}”执行全量同步？该操作会重新抓取内容、提交记录和导出数据。`,
      '全量同步确认',
      {
        confirmButtonText: '确认同步',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await triggerSync(row, 'full', true)
  } catch (error) {
    void error
  }
}

function quotaPercent(kind) {
  if (kind === 'ai') {
    return percent(stats.value.aiRequestsUsedToday, stats.value.aiRequestsLimit)
  }
  return percent(stats.value.translationCharsUsedToday, stats.value.translationCharsLimit)
}

function percent(used, limit) {
  if (!limit || limit <= 0) return 0
  return Math.min(100, Math.round((Number(used || 0) / Number(limit)) * 100))
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('zh-CN')
}

function formatUsage(value, unit) {
  if (unit === 'chars') return `${formatNumber(value)} 字`
  if (unit === 'requests') return `${formatNumber(value)} 次`
  return formatNumber(value)
}

function formatDateTime(value) {
  if (!value) return '未知'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function serviceStatusType(status) {
  if (status === 'OK') return 'success'
  if (status === 'WARN') return 'warning'
  if (status === 'CRITICAL') return 'danger'
  return 'info'
}

function serviceStatusText(status) {
  return {
    OK: '正常',
    WARN: '预警',
    CRITICAL: '紧急',
    MISSING: '缺失'
  }[status] || status
}

function syncStatusType(status) {
  return {
    SUCCESS: 'success',
    RUNNING: 'warning',
    FAILED: 'danger',
    IDLE: 'info',
    QUEUED: 'info'
  }[status] || 'info'
}

function syncStatusText(status) {
  return {
    SUCCESS: '成功',
    RUNNING: '运行中',
    FAILED: '失败',
    IDLE: '空闲',
    QUEUED: '排队中'
  }[status] || status || '未知'
}

function cookieStatusType(status) {
  return {
    OK: 'success',
    EXPIRED: 'danger',
    UNKNOWN: 'warning'
  }[status] || 'info'
}

function cookieStatusText(status) {
  return {
    OK: '正常',
    EXPIRED: '已过期',
    UNKNOWN: '未知'
  }[status] || status || '未知'
}

function modeText(mode) {
  return {
    incremental: '增量',
    submissions: '提交',
    refresh: '刷新导出',
    full: '全量'
  }[mode] || mode
}

function taskModeType(mode) {
  return {
    incremental: 'primary',
    submissions: 'success',
    refresh: 'warning',
    full: 'danger'
  }[mode] || 'info'
}
</script>

