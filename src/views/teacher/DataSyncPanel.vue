<template>
  <div class="sync-panel">
    <UiPageHeader title="PTA 数据同步" description="管理 PTA 平台数据爬取、同步状态和 Cookie 维护" />

    <div v-if="cookieStatus === 'EXPIRED'" class="flex items-start gap-3 p-4 rounded-[14px] border border-[rgba(196,75,63,0.2)] bg-[rgba(196,75,63,0.06)] text-[13px] text-[#c44b3f] mb-4">
      <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
      <div>
        <div class="font-semibold mb-0.5">PTA Cookie 已过期</div>
        <div class="text-[12px] opacity-80">可以在下方更新 Cookie，也可以直接输入教师自己的 PTA 账号密码，或先去个人资料中绑定 PTA 账号后再同步。</div>
      </div>
    </div>
    <div v-if="cookieStatus === 'UNKNOWN'" class="flex items-start gap-3 p-4 rounded-[14px] border border-[rgba(196,154,60,0.2)] bg-[rgba(196,154,60,0.06)] text-[13px] text-[#c49a3c] mb-4">
      <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
      <div>
        <div class="font-semibold mb-0.5">Cookie 状态未知</div>
        <div class="text-[12px] opacity-80">爬虫服务可能未启动，或尚未检测到 Cookie。</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
      <!-- Left column -->
      <div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="text-[14px] font-semibold text-[#1d1d1f] mb-5">数据同步操作</div>
          <div class="flex gap-6 items-center flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-[13px] text-[#6e6e73]">当前教学班</span>
              <span v-if="selectedClassName" class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[#f0f0f5] text-[#1d1d1f]">{{ selectedClassName }}</span>
              <span v-else class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[rgba(196,75,63,0.08)] text-[#c44b3f]">未选择教学班</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[13px] text-[#6e6e73]">PTA 用户组</span>
              <span v-if="currentGroupLabel" class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[rgba(194,112,62,0.08)] text-[var(--app-primary)]">{{ currentGroupLabel }}</span>
              <span v-else class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[rgba(196,154,60,0.08)] text-[#c49a3c]">未设置（请在班级管理中配置 PTA 用户组名）</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[13px] text-[#6e6e73]">Cookie</span>
              <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold" :class="cookieStatus === 'OK' ? 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]' : cookieStatus === 'EXPIRED' ? 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]' : 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]'">{{ cookieStatusText }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[13px] text-[#6e6e73]">爬虫服务</span>
              <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold" :class="spiderAlive ? 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]' : 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]'">{{ spiderAlive ? '运行中' : '未启动' }}</span>
            </div>
            <div class="flex items-center gap-2" v-if="lastSync">
              <span class="text-[13px] text-[#6e6e73]">上次更新</span>
              <span class="text-[13px] text-[#1d1d1f] font-medium">{{ lastSync }}</span>
            </div>
          </div>
          <div v-if="cooldownInfo" class="flex gap-5 mt-3 flex-wrap">
            <div class="flex items-center gap-1.5 text-[12.5px]" v-for="(info, key) in cooldownInfo" :key="key">
              <svg v-if="info.allowed" class="w-3.5 h-3.5 text-[#1e8e3e]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              <svg v-else class="w-3.5 h-3.5 text-[#e37400]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
              <span class="text-[#1d1d1f] font-medium">{{ {submissions:'提交记录',exports:'导出数据'}[key] }}</span>
              <span v-if="info.allowed" class="text-[#1e8e3e]">可执行</span>
              <span v-else class="text-[#e37400]">冷却中 {{ info.remaining_human }}（上次 {{ info.last_time }}）</span>
            </div>
          </div>
          <div class="h-px bg-black/[0.06] my-5"></div>
          <div class="mb-3.5 rounded-[12px] border border-black/[0.06] bg-[#f9f9f9] px-4 py-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="min-w-0">
                <div class="text-[14px] font-semibold leading-5 text-[#1d1d1f]">同步模式</div>
                <div class="text-[12px] leading-5 text-[#6e6e73]">正常模式遵守冷却保护，强制更新会跳过冷却限制。</div>
              </div>
              <div class="inline-flex h-9 w-full rounded-[10px] bg-[#edf1f7] p-1 text-[12px] font-semibold sm:w-auto" role="group" aria-label="同步模式切换">
                <button
                  type="button"
                  class="h-7 flex-1 rounded-[8px] px-3 transition-all sm:flex-none sm:min-w-[82px]"
                  :class="!forceMode ? 'bg-white text-[var(--app-primary)] shadow-[0_1px_3px_rgba(15,23,42,0.12)]' : 'text-[#64748b] hover:text-[#1d1d1f]'"
                  :aria-pressed="!forceMode"
                  @click="forceMode = false"
                >
                  正常模式
                </button>
                <button
                  type="button"
                  class="h-7 flex-1 rounded-[8px] px-3 transition-all sm:flex-none sm:min-w-[82px]"
                  :class="forceMode ? 'bg-[#fff1f0] text-[#d93025] shadow-[0_1px_3px_rgba(217,48,37,0.12)]' : 'text-[#64748b] hover:text-[#d93025]'"
                  :aria-pressed="forceMode"
                  @click="forceMode = true"
                >
                  强制更新
                </button>
              </div>
            </div>
            <div v-if="forceMode" class="mt-2 rounded-[8px] bg-[#fff4e6] px-3 py-2 text-[12px] leading-5 text-[#d93025]">
              已开启强制更新：将跳过冷却限制，请谨慎使用以保护 PTA 平台。
            </div>
          </div>
          <!-- Sync user group panel -->
          <div class="mb-3.5 p-3.5 px-4 rounded-[10px] bg-[#f9f9f9] border border-black/[0.06]">
            <div class="flex flex-col gap-1 mb-2.5">
              <span class="text-[14px] font-semibold text-[#1d1d1f]">PTA 用户组名</span>
              <span class="text-[12px] text-[#6e6e73]">可按当前班级临时覆盖 PTA 用户组名；提交同步时会同时保存到该班级配置。</span>
            </div>
            <UiInput v-model="syncKeyword" placeholder="例如：计科25数据结构" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm" />
          </div>
          <!-- PTA credentials panel -->
          <div class="mb-3.5 p-3.5 px-4 rounded-[10px] bg-[#f9f9f9] border border-black/[0.06]">
            <div class="flex flex-col gap-1 mb-2.5">
              <span class="text-[14px] font-semibold text-[#1d1d1f]">PTA 账号凭据</span>
              <span class="text-[12px] text-[#6e6e73]">优先使用个人资料中已绑定的 PTA 账号；这里临时填写的账号密码只覆盖本次同步。若未绑定且这里留空，则只尝试当前 Cookie 会话。</span>
            </div>
            <div v-if="hasBoundPtaCredentials" class="mb-2.5 text-[12px] text-[#1e8e3e]">
              已绑定 PTA 账号：{{ boundPtaUsername }}（留空时将默认用于本次同步）
            </div>
            <div v-else class="mb-2.5 text-[12px] text-[#e37400]">
              当前未绑定 PTA 账号，本页可临时输入；留空时只会尝试现有 Cookie。
            </div>
            <div class="grid grid-cols-2 gap-3">
              <UiInput v-model="ptaUsername" placeholder="本次同步使用的 PTA 账号（可选）" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm" />
              <UiInput v-model="ptaPassword" :type="showPassword ? 'text' : 'password'" placeholder="本次同步使用的 PTA 密码（可选）" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm" />
            </div>
            <div class="flex gap-2.5 mt-3">
              <UiButton class="h-[32px] px-4 rounded-[8px] text-[12px] font-medium text-[var(--app-primary)] bg-[rgba(194,112,62,0.08)] hover:bg-[rgba(194,112,62,0.14)] active:scale-[0.96] transition-all cursor-pointer border-none" @click="submitTempCredential">提交临时账号密码</UiButton>
              <UiButton class="h-[32px] px-4 rounded-[8px] text-[12px] font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="clearTempCredential">清空临时凭据</UiButton>
            </div>
            <div v-if="tempCredentialSubmitted" class="mt-2.5 text-[12px] text-[#1e8e3e]">
              已提交临时 PTA 账号：{{ ptaUsername.trim() }}，本页后续同步将优先使用该账号。
            </div>
            <div class="mt-2.5 flex items-center gap-2 text-[12px] text-[#44536b]">
              本次预计使用：
              <span class="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-bold" :class="credentialSourceBadgeClass(plannedCredentialSource)">{{ credentialSourceText(plannedCredentialSource) }}</span>
            </div>
          </div>
          <!-- Sync actions -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between p-3 px-4 rounded-[10px] bg-[#f9f9f9] border border-black/[0.06] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div class="flex-1">
                <div class="text-[14px] font-semibold text-[#1d1d1f] mb-0.5">增量同步</div>
                <div class="text-[12px] text-[#6e6e73]">新实验全量爬取；未截止实验更新提交+导出；已截止跳过</div>
              </div>
              <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0" :disabled="!selectedClassId || !!syncLoading" @click="triggerSync('incremental')">
                <span v-if="syncLoading === 'incremental'" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else>开始同步</span>
              </UiButton>
            </div>
            <div class="flex items-center justify-between p-3 px-4 rounded-[10px] bg-[#f9f9f9] border border-black/[0.06] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div class="flex-1">
                <div class="text-[14px] font-semibold text-[#1d1d1f] mb-0.5">拉取提交记录</div>
                <div class="text-[12px] text-[#6e6e73]">拉取已有题目集的最新提交（轻量，冷却 4h）</div>
              </div>
              <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#5ac476] to-[#6b8f6b] shadow-[0_2px_8px_rgba(107,143,107,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0" :disabled="!selectedClassId || !!syncLoading" @click="triggerSync('submissions')">
                <span v-if="syncLoading === 'submissions'" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else>拉取提交</span>
              </UiButton>
            </div>
            <div class="flex items-center justify-between p-3 px-4 rounded-[10px] bg-[#f9f9f9] border border-black/[0.06] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div class="flex-1">
                <div class="text-[14px] font-semibold text-[#1d1d1f] mb-0.5">刷新导出</div>
                <div class="text-[12px] text-[#6e6e73]">重新导出成绩单/答题卡/代码（较重，冷却 24h）</div>
              </div>
              <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#ffb340] to-[#c49a3c] shadow-[0_2px_8px_rgba(196,154,60,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0" :disabled="!selectedClassId || !!syncLoading" @click="triggerSync('refresh')">
                <span v-if="syncLoading === 'refresh'" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else>刷新导出</span>
              </UiButton>
            </div>
            <div class="flex items-center justify-between p-3 px-4 rounded-[10px] bg-[#f9f9f9] border border-black/[0.06] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div class="flex-1">
                <div class="text-[14px] font-semibold text-[#1d1d1f] mb-0.5">全量同步</div>
                <div class="text-[12px] text-[#6e6e73]">增量 + 提交 + 导出，耗时较长</div>
              </div>
              <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#ff6259] to-[#c44b3f] shadow-[0_2px_8px_rgba(196,75,63,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0" :disabled="!selectedClassId || !!syncLoading" @click="triggerSync('full')">
                <span v-if="syncLoading === 'full'" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else>全量同步</span>
              </UiButton>
            </div>
          </div>
          <!-- Task progress -->
          <div v-if="currentTask" class="mt-4">
            <div class="h-px bg-black/[0.06] my-5"></div>
            <div class="flex items-center gap-2.5 mb-2 text-[13px] text-[#1d1d1f]">
              <span>任务 {{ currentTask.task_id }}</span>
              <span class="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-bold" :class="taskBadgeClass">{{ taskStatusText }}</span>
              <span v-if="currentTask.credential_source || currentTask.credentialSource" class="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-bold" :class="credentialSourceBadgeClass(currentTask.credential_source || currentTask.credentialSource)">{{ credentialSourceText(currentTask.credential_source || currentTask.credentialSource) }}</span>
              <span v-if="currentTask.force" class="text-[11px] text-[#d93025] bg-[#fce8e6] px-1.5 py-0.5 rounded">强制</span>
            </div>
            <div v-if="currentTask.status === 'RUNNING'" class="w-full h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
              <div class="h-full bg-[#c49a3c] rounded-full animate-pulse w-1/2"></div>
            </div>
            <div v-if="currentTask.status === 'SUCCESS'" class="text-[13px] text-[#1e8e3e] mt-1.5">
              新增 {{ currentTask.new_sets_count }} 个题目集，
              刷新 {{ currentTask.refreshed_count }} 个，
              提交记录 {{ currentTask.submissions_count }} 条
            </div>
            <div v-if="currentTask.skipped_cooldown && currentTask.skipped_cooldown.length" class="text-[12px] text-[#e37400] mt-1">
              跳过（冷却中）: {{ currentTask.skipped_cooldown.join('、') }}
            </div>
            <div v-if="currentTask.error" class="text-[13px] text-[#d93025] mt-1.5">{{ currentTask.error }}</div>
          </div>
        </div>

        <!-- Task history -->
        <div v-if="taskHistory.length" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mt-4">
          <div class="text-[14px] font-semibold text-[#1d1d1f] mb-4">最近同步记录</div>
          <div class="overflow-auto max-h-[240px] rounded-[10px] border border-black/[0.06]">
            <UiTable class="w-full text-[12px] border-collapse">
              <thead>
                <tr class="bg-[#f9f9fb]">
                  <th class="text-left px-3 py-2 font-medium text-[#6e6e73] border-b border-black/[0.06]">任务ID</th>
                  <th class="text-left px-3 py-2 font-medium text-[#6e6e73] border-b border-black/[0.06]">用户组</th>
                  <th class="text-left px-3 py-2 font-medium text-[#6e6e73] border-b border-black/[0.06]">模式</th>
                  <th class="text-left px-3 py-2 font-medium text-[#6e6e73] border-b border-black/[0.06]">状态</th>
                  <th class="text-left px-3 py-2 font-medium text-[#6e6e73] border-b border-black/[0.06]">来源</th>
                  <th class="text-left px-3 py-2 font-medium text-[#6e6e73] border-b border-black/[0.06]">强制</th>
                  <th class="text-left px-3 py-2 font-medium text-[#6e6e73] border-b border-black/[0.06]">创建时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in taskHistory" :key="row.task_id" class="border-b border-black/[0.04] last:border-b-0 hover:bg-[#f5f5f7]/60">
                  <td class="px-3 py-2 text-[#1d1d1f]">{{ row.task_id }}</td>
                  <td class="px-3 py-2 text-[#1d1d1f]">{{ row.group_name || row.groupName || row.group_id || row.groupId }}</td>
                  <td class="px-3 py-2"><span class="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold" :class="modeBadgeClass(row.mode)">{{ modeCn(row.mode) }}</span></td>
                  <td class="px-3 py-2"><span class="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold" :class="row.status==='SUCCESS' ? 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]' : row.status==='FAILED' ? 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]' : 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]'">{{ row.status }}</span></td>
                  <td class="px-3 py-2"><span class="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold" :class="credentialSourceBadgeClass(row.credential_source || row.credentialSource)">{{ credentialSourceText(row.credential_source || row.credentialSource) }}</span></td>
                  <td class="px-3 py-2 text-[#1d1d1f]">{{ row.force ? '是' : '' }}</td>
                  <td class="px-3 py-2 text-[#6e6e73]">{{ row.created_at }}</td>
                </tr>
              </tbody>
            </UiTable>
          </div>
        </div>

        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mt-4">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <div class="text-[14px] font-semibold text-[#1d1d1f]">LeetCode 题库抓取</div>
              <div class="text-[12px] text-[#6e6e73] mt-1">每行输入一个 LeetCode 中文站 slug，抓取后写入本地题库。</div>
            </div>
            <UiButton
              class="h-[34px] px-4 rounded-[9px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] disabled:opacity-50"
              :disabled="!leetcodeSlugText.trim() || leetcodeCrawlLoading"
              @click="crawlLeetCodeSlugs"
            >
              <span v-if="leetcodeCrawlLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              抓取入库
            </UiButton>
          </div>
          <textarea
            v-model="leetcodeSlugText"
            rows="4"
            placeholder="two-sum&#10;add-two-numbers"
            class="w-full px-4 py-3 rounded-[12px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-y"
          ></textarea>
          <div v-if="leetcodeCrawlItems.length" class="mt-4 flex flex-col gap-2">
            <div
              v-for="item in leetcodeCrawlItems"
              :key="item.slug"
              class="flex items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-[#f9f9fb] px-3 py-2 text-[12px]"
            >
              <div class="min-w-0">
                <div class="font-semibold text-[#1d1d1f] truncate">{{ item.title }}</div>
                <div class="text-[#6e6e73]">{{ item.slug }} <span v-if="item.problemId">· 本地 ID {{ item.problemId }}</span></div>
              </div>
              <span class="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-bold" :class="item.problemId ? 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]' : 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]'">
                {{ item.problemId ? '已入库' : '需检查' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Cookie management -->
      <div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="text-[14px] font-semibold text-[#1d1d1f] mb-4">Cookie 管理</div>
          <div class="text-[13px] text-[#6e6e73] mb-3">
            <p>当自动爬取因 Cookie 过期而失败时，可以手动更新 Cookie；如果教师有自己的 PTA 账号，也可以直接使用账号密码同步。</p>
          </div>
          <details class="mb-4 group">
            <summary class="text-[13px] font-medium text-[var(--app-primary)] cursor-pointer select-none hover:underline">如何获取 Cookie？</summary>
            <ol class="mt-2 pl-4 text-[12.5px] text-[#3c4043] leading-[1.8] list-decimal">
              <li>在浏览器中登录 <a href="https://pintia.cn" target="_blank" class="text-[var(--app-primary)] hover:underline">PTA 平台</a></li>
              <li>按 F12 打开开发者工具，切换到「应用」标签</li>
              <li>在左侧找到「Cookie」→「https://pintia.cn」</li>
              <li>找到 <code class="bg-[#f5f5f7] px-1 py-0.5 rounded text-[12px]">PTASession</code>，复制其值</li>
              <li>或安装「EditThisCookie」扩展，导出全部 Cookie 为 JSON</li>
            </ol>
          </details>
          <div class="h-px bg-black/[0.06] my-5"></div>
          <div class="mb-3">
            <label class="block text-[13px] font-medium text-[#1d1d1f] mb-2">Cookie JSON</label>
            <textarea v-model="cookieInput" rows="8" placeholder='粘贴 Cookie JSON 数组，格式如:
[{"name":"PTASession","value":"xxx","domain":".pintia.cn"}]' class="w-full px-4 py-3 rounded-[12px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-y min-h-[80px]"></textarea>
          </div>
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0" :disabled="!cookieInput.trim() || cookieSubmitting" @click="submitCookieHandler">
            <span v-if="cookieSubmitting" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            验证并保存 Cookie
          </UiButton>
          <div v-if="cookieResult" class="mt-3.5 flex items-center gap-1.5 px-3.5 py-2.5 rounded-[8px] text-[13px]" :class="cookieResult.valid ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'bg-[#fce8e6] text-[#d93025]'">
            <svg v-if="cookieResult.valid" class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            <svg v-else class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
            <span>{{ cookieResult.message }}</span>
          </div>
        </div>

        <!-- Frequency protection info -->
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mt-4">
          <div class="text-[14px] font-semibold text-[#1d1d1f] mb-4">频率保护策略</div>
          <div class="text-[13px]">
            <div class="flex gap-2.5 py-1.5 border-b border-black/[0.06]">
              <span class="font-semibold text-[#1d1d1f] min-w-[70px]">题目内容</span>
              <span class="text-[#6e6e73]">只爬一次，发布后不变</span>
            </div>
            <div class="flex gap-2.5 py-1.5 border-b border-black/[0.06]">
              <span class="font-semibold text-[#1d1d1f] min-w-[70px]">提交记录</span>
              <span class="text-[#6e6e73]">冷却 24 小时，拉取最新提交</span>
            </div>
            <div class="flex gap-2.5 py-1.5 border-b border-black/[0.06]">
              <span class="font-semibold text-[#1d1d1f] min-w-[70px]">导出数据</span>
              <span class="text-[#6e6e73]">冷却 24 小时，重新导出成绩单/代码</span>
            </div>
            <div class="flex gap-2.5 py-1.5">
              <span class="font-semibold text-[#1d1d1f] min-w-[70px]">API 限速</span>
              <span class="text-[#6e6e73]">令牌桶 20 请求/分钟</span>
            </div>
            <p class="text-[12px] text-[#e37400] mt-2">开启「强制更新」可跳过冷却，但请谨慎使用。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import {
  getPtaCookieStatus,
  getTeacherPtaCredentials,
  submitPtaCookie,
  triggerPtaSync
} from '../../api/tap'
import { useUserStore } from '../../store'
import axios from 'axios'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'
import {
  crawlLeetCodeProblems,
  mapClawItemToPractice
} from '../../api/leetcodeClaw'

const showPassword = ref(false)

function normalizeUrl(url) {
  return String(url || '').replace(/\/+$/, '')
}

function buildDefaultSpiderUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol || 'http:'
    const hostname = window.location.hostname || '127.0.0.1'
    return `${protocol}//${hostname}:8100`
  }
  return 'http://127.0.0.1:8100'
}

const envSpiderUrl = (typeof process !== 'undefined' && process.env && process.env.VUE_APP_SPIDER_URL)
  ? process.env.VUE_APP_SPIDER_URL
  : ''
const spiderUrl = ref(normalizeUrl(envSpiderUrl || buildDefaultSpiderUrl()))
const spiderHealthError = ref('')

function buildSpiderCandidates() {
  const candidates = []
  const push = (u) => {
    const nu = normalizeUrl(u)
    if (nu && !candidates.includes(nu)) candidates.push(nu)
  }

  push(spiderUrl.value)
  push('/spider')
  if (envSpiderUrl) push(envSpiderUrl)

  push(buildDefaultSpiderUrl())
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname
    push(`http://${host}:8100`)
  }

  push('http://localhost:8100')
  push('http://127.0.0.1:8100')
  return candidates
}

function spiderApi(path) {
  return `${spiderUrl.value}${path}`
}

const spiderRequestConfig = (options = {}) => ({
  withCredentials: false,
  ...options
})

const userStore = useUserStore()

const selectedClassName = computed(() => userStore.selectedClass?.name || '')
const selectedClassId = computed(() => {
  const id = Number(userStore.selectedClass?.id)
  return Number.isInteger(id) && id > 0 ? id : null
})
const currentKeyword = computed(() => userStore.selectedClass?.ptaGroupName || userStore.selectedClass?.pta_group_name || '')
const currentGroupId = computed(() => userStore.selectedClass?.ptaGroupId || userStore.selectedClass?.pta_group_id || '')
const currentGroupLabel = computed(() => currentKeyword.value || currentGroupId.value)

const cookieStatus = ref('UNKNOWN')
const spiderAlive = ref(false)
const lastSync = ref('')
const syncLoading = ref('')
const currentTask = ref(null)
const taskHistory = ref([])
const cookieInput = ref('')
const cookieSubmitting = ref(false)
const cookieResult = ref(null)
const forceMode = ref(false)
const cooldownInfo = ref(null)
const syncKeyword = ref('')
const ptaUsername = ref('')
const ptaPassword = ref('')
const tempCredentialSubmitted = ref(false)
const boundPtaUsername = ref('')
const hasBoundPtaCredentials = ref(false)
const leetcodeSlugText = ref('')
const leetcodeCrawlLoading = ref(false)
const leetcodeCrawlItems = ref([])
let pollTimer = null

const cookieStatusText = computed(() => {
  return { OK: '正常', EXPIRED: '已过期', UNKNOWN: '未知' }[cookieStatus.value] || cookieStatus.value
})
const taskBadgeClass = computed(() => {
  if (!currentTask.value) return 'bg-[#f0f0f5] text-[#6e6e73]'
  const s = currentTask.value.status
  if (s === 'SUCCESS') return 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]'
  if (s === 'FAILED') return 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]'
  if (s === 'RUNNING') return 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]'
  return 'bg-[#f0f0f5] text-[#6e6e73]'
})
const taskStatusText = computed(() => {
  if (!currentTask.value) return ''
  return { QUEUED:'排队中', RUNNING:'运行中', SUCCESS:'完成', FAILED:'失败' }[currentTask.value.status] || currentTask.value.status
})

const modeCn = (m) => ({ incremental:'增量', submissions:'提交', refresh:'刷新', full:'全量' }[m] || m)
const modeBadgeClass = (m) => ({
  full: 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]',
  refresh: 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]',
  submissions: 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
  incremental: 'bg-[rgba(194,112,62,0.08)] text-[#c2703e]'
}[m] || 'bg-[#f0f0f5] text-[#6e6e73]')
const credentialSourceText = (source) => ({
  temporary: '临时账号',
  bound: '已绑定账号',
  cookie: 'Cookie'
}[String(source || '').trim().toLowerCase()] || '未知来源')
const credentialSourceBadgeClass = (source) => ({
  temporary: 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]',
  bound: 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
  cookie: 'bg-[rgba(194,112,62,0.08)] text-[#c2703e]'
}[String(source || '').trim().toLowerCase()] || 'bg-[#f0f0f5] text-[#6e6e73]')
const plannedCredentialSource = computed(() => {
  if (tempCredentialSubmitted.value && ptaUsername.value.trim() && ptaPassword.value) return 'temporary'
  if (hasBoundPtaCredentials.value) return 'bound'
  return 'cookie'
})

async function probeSpiderHealth() {
  spiderHealthError.value = ''
  for (const base of buildSpiderCandidates()) {
    try {
      const r = await axios.get(`${base}/health`, spiderRequestConfig({ timeout: 3000 }))
      if (r.status === 200) {
        spiderAlive.value = true
        spiderUrl.value = base
        return true
      }
    } catch (e) {
      spiderHealthError.value = e?.response?.data?.detail || e?.message || 'network error'
    }
  }
  spiderAlive.value = false
  return false
}

async function loadCookieStatus() {
  try {
    const res = await getPtaCookieStatus()
    const d = res?.data || res
    cookieStatus.value = d?.status || 'UNKNOWN'
    lastSync.value = d?.lastUpdated || d?.updated_at || ''
  } catch { /* ignore */ }
  await probeSpiderHealth()
}

async function loadBoundCredentials() {
  try {
    const res = await getTeacherPtaCredentials()
    const data = res?.data || res || {}
    boundPtaUsername.value = data?.ptaUsername || ''
    hasBoundPtaCredentials.value = !!data?.bound
  } catch {
    boundPtaUsername.value = ''
    hasBoundPtaCredentials.value = false
  }
}

async function loadCooldown() {
  if (!spiderAlive.value) {
    cooldownInfo.value = null
    return
  }
  const keyword = syncKeyword.value.trim() || currentKeyword.value || currentGroupId.value
  if (!selectedClassId.value) {
    uiMessage.warning('请先选择当前教学班')
    return
  }
  try {
    const r = await axios.get(spiderApi(`/cooldown/${encodeURIComponent(keyword)}`), spiderRequestConfig({ timeout: 5000 }))
    cooldownInfo.value = r.data
  } catch { /* spider not running */ }
}

async function loadTaskHistory() {
  if (!spiderAlive.value) {
    taskHistory.value = []
    return
  }
  try {
    const r = await axios.get(spiderApi('/tasks'), spiderRequestConfig({ timeout: 5000 }))
    taskHistory.value = r.data || []
  } catch { /* spider not running */ }
}

function submitTempCredential() {
  const username = ptaUsername.value.trim()
  const password = ptaPassword.value
  if (!username || !password) {
    uiMessage.warning('请先输入完整的临时 PTA 账号和密码，再点击提交')
    return
  }
  tempCredentialSubmitted.value = true
  uiMessage.success(`已提交临时 PTA 账号：${username}`)
}

function clearTempCredential() {
  ptaUsername.value = ''
  ptaPassword.value = ''
  tempCredentialSubmitted.value = false
}

async function triggerSync(mode) {
  const keyword = syncKeyword.value.trim() || currentKeyword.value
  const groupId = currentGroupId.value
  if (!selectedClassId.value) {
    uiMessage.warning('请先选择当前教学班')
    return
  }
  if (!keyword && !groupId) {
    uiMessage.warning('请先在班级管理中配置 PTA 用户组名')
    return
  }
  if ((!keyword || !String(keyword).trim()) && (!groupId || !String(groupId).trim())) {
    uiMessage.warning('请先在班级管理中配置 PTA 用户组名')
    return
  }
  await probeSpiderHealth()

  // 强制模式需二次确认
  if (forceMode.value) {
    try {
      await messageBox.confirm(
        '强制更新将跳过冷却时间限制，频繁请求可能影响 PTA 平台。确定继续？',
        '强制更新确认', { confirmButtonText: '确定强制', cancelButtonText: '取消', type: 'warning' }
      )
    } catch { return }
  }

  syncLoading.value = mode
  try {
    const draftUsername = ptaUsername.value.trim()
    const draftPassword = ptaPassword.value
    if ((draftUsername && !draftPassword) || (!draftUsername && draftPassword)) {
      uiMessage.warning('若要临时使用 PTA 账号同步，请同时填写账号和密码')
      return
    }

    if ((draftUsername || draftPassword) && !tempCredentialSubmitted.value) {
      uiMessage.warning('若要使用临时 PTA 账号，请先点击"提交临时账号密码"')
      return
    }
    const username = tempCredentialSubmitted.value ? draftUsername : ''
    const password = tempCredentialSubmitted.value ? draftPassword : ''
    if (
      spiderAlive.value &&
      plannedCredentialSource.value === 'cookie' &&
      cookieStatus.value !== 'OK'
    ) {
      uiMessage.warning('当前没有有效 Cookie。请先填写 PTA 账号密码并点击“提交临时账号密码”，再开始同步以打开浏览器登录。')
      return
    }

    const payload = {
      ptaGroupId: groupId,
      ptaGroupName: keyword,
      mode,
      force: forceMode.value,
      ...(username ? { ptaUsername: username, ptaPassword: password } : {})
    }
    const res = await triggerPtaSync(selectedClassId.value, payload)
    const r = res?.data || res

    // 冷却拦截
    if (r?.blocked) {
      uiMessage.warning(getFriendlyResponseMessage(r, '同步任务暂时无法提交，请稍后重试'))
      syncLoading.value = ''
      return
    }

    const taskId = r?.taskId || r?.task_id
    if (taskId) {
      currentTask.value = { task_id: taskId, status: 'QUEUED', new_sets_count: 0,
        refreshed_count: 0, submissions_count: 0, error: null, skipped_cooldown: [], force: forceMode.value,
        credential_source: r?.credentialSource || r?.credential_source || plannedCredentialSource.value }
      pollTaskStatus(taskId)
    } else {
      currentTask.value = {
        task_id: r?.taskId || `go-local-${Date.now()}`,
        status: r?.status === 'FAILED' ? 'FAILED' : 'SUCCESS',
        new_sets_count: 0,
        refreshed_count: 0,
        submissions_count: 0,
        error: r?.error || null,
        skipped_cooldown: [],
        force: forceMode.value,
        credential_source: r?.credentialSource || r?.credential_source || plannedCredentialSource.value
      }
    }
    uiMessage.success(`${r?.message || '任务已提交'}，本次使用${credentialSourceText(r?.credentialSource || r?.credential_source || plannedCredentialSource.value)}`)
  } catch (e) {
    uiMessage.error(getFriendlyErrorMessage(e, '同步任务提交失败，请稍后重试'))
  } finally {
    syncLoading.value = ''
  }
}

function pollTaskStatus(taskId) {
  if (!spiderAlive.value) return
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = setInterval(async () => {
    try {
      const r = await axios.get(spiderApi(`/status/${taskId}`), spiderRequestConfig({ timeout: 5000 }))
      currentTask.value = r.data
      if (r.data.status === 'SUCCESS' || r.data.status === 'FAILED') {
        clearInterval(pollTimer)
        pollTimer = null
        loadTaskHistory()
        loadCooldown()
        if (r.data.status === 'SUCCESS') uiMessage.success('数据同步完成')
        else uiMessage.error(getFriendlyResponseMessage({ error: r.data.error }, '同步失败，请稍后重试'))
      }
    } catch { /* ignore */ }
  }, 3000)
}

async function submitCookieHandler() {
  cookieSubmitting.value = true
  cookieResult.value = null
  try {
    const res = await submitPtaCookie(cookieInput.value.trim())
    const d = res?.data || res
    cookieResult.value = { valid: d?.valid, message: getFriendlyResponseMessage(d, d?.valid ? 'Cookie 有效' : 'Cookie 无效，请重新提交') }
    if (d?.valid) {
      cookieStatus.value = 'OK'
      uiMessage.success('Cookie 更新成功')
    }
  } catch (e) {
    cookieResult.value = { valid: false, message: getFriendlyErrorMessage(e, 'Cookie 提交失败，请稍后重试') }
  } finally {
    cookieSubmitting.value = false
  }
}

function parseLeetCodeSlugs() {
  return leetcodeSlugText.value
    .split(/[\n,，\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
}

async function crawlLeetCodeSlugs() {
  const slugs = parseLeetCodeSlugs()
  if (!slugs.length) {
    uiMessage.warning('请先输入 LeetCode 题目 slug')
    return
  }

  leetcodeCrawlLoading.value = true
  try {
    const res = await crawlLeetCodeProblems({ slugs, persist: true })
    leetcodeCrawlItems.value = (res?.items || []).map(mapClawItemToPractice)
    if (res?.failed?.length) {
      uiMessage.warning(`部分题目抓取失败：${res.failed.map(item => item.slug || item.error).join('，')}`)
    } else {
      uiMessage.success('LeetCode 题目抓取入库完成')
    }
  } catch (error) {
    uiMessage.error(error.friendlyMessage || error.message || 'LeetCode 题目抓取失败')
  } finally {
    leetcodeCrawlLoading.value = false
  }
}

onMounted(() => {
  syncKeyword.value = currentKeyword.value
  clearTempCredential()
  setTimeout(() => clearTempCredential(), 300)
  loadCookieStatus().then(() => {
    loadTaskHistory()
    loadCooldown()
  })
  loadBoundCredentials()
})
watch(currentKeyword, value => {
  syncKeyword.value = value || ''
})
watch([ptaUsername, ptaPassword], () => {
  if (tempCredentialSubmitted.value) {
    tempCredentialSubmitted.value = false
  }
})
onBeforeUnmount(() => { if (pollTimer) clearInterval(pollTimer) })
</script>
