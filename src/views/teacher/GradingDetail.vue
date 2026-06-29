<template>
  <div class="min-h-full">
    <!-- Page Header -->
    <div class="flex items-center gap-3 mb-5">
      <UiButton
        @click="router.push('/teacher/grading')"
        class="h-[38px] w-[38px] rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </UiButton>
      <span class="text-[15px] text-[#6e6e73]">返回</span>
      <span class="text-[17px] font-semibold text-[#1d1d1f]">{{ task?.displayCode ? `批改任务 ${task.displayCode}` : `批改任务 #${taskId}` }}</span>
    </div>

    <!-- Task Overview -->
    <div v-if="task" class="flex items-center rounded-[16px] border border-black/[0.06] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)] px-6 py-4 mb-4 flex-wrap gap-y-4">
      <div class="overview-stat min-w-[110px] pr-6">
        <span class="text-[13px] text-[#6e6e73]">状态</span>
        <span
          class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold"
          :class="tagClass(statusType(task.status))"
        >{{ statusText(task.status) }}</span>
      </div>
      <div class="overview-stat min-w-[110px] px-6">
        <span class="text-[13px] text-[#6e6e73]">提交数</span>
        <span class="text-[23px] font-semibold text-[#1d1d1f]">{{ task.totalCount || 0 }}</span>
      </div>
      <div class="overview-stat min-w-[110px] px-6">
        <span class="text-[13px] text-[#6e6e73]">已批改</span>
        <span class="text-[23px] font-semibold text-[#16a34a]">{{ task.completedCount || 0 }}</span>
      </div>
      <div class="overview-stat min-w-[110px] px-6">
        <span class="text-[13px] text-[#6e6e73]">待处理</span>
        <span class="text-[23px] font-semibold text-[#ff9500]">{{ taskPendingCount }}</span>
      </div>
      <div class="overview-stat min-w-[110px] px-6">
        <span class="text-[13px] text-[#6e6e73]">平均分</span>
        <span class="text-[23px] font-semibold text-[var(--app-primary)]">{{ scoreStats.average }}</span>
      </div>
      <div class="overview-stat min-w-[110px] px-6">
        <span class="text-[13px] text-[#6e6e73]">最高分</span>
        <span class="text-[23px] font-semibold text-[#1d1d1f]">{{ scoreStats.highest }}</span>
      </div>
      <div class="overview-stat min-w-[110px] px-6">
        <span class="text-[13px] text-[#6e6e73]">最低分</span>
        <span class="text-[23px] font-semibold text-[#1d1d1f]">{{ scoreStats.lowest }}</span>
      </div>
      <div class="flex-1" />
      <UiButton
        :disabled="annotating || submissions.length === 0"
        @click="doBatchAnnotate"
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#c44b3f] bg-[rgba(196,75,63,0.08)] border border-[rgba(196,75,63,0.2)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="annotating" class="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
        生成红笔批改报告
      </UiButton>
      <UiButton
        :disabled="exportingAnnotated || submissions.length === 0"
        @click="doBatchExportAnnotated"
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#c49a3c] bg-[rgba(196,154,60,0.08)] border border-[rgba(196,154,60,0.2)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="exportingAnnotated" class="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
        导出 AI 批改报告 ZIP
      </UiButton>
      <UiButton
        @click="showExportDialog"
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none"
      >
        导出 Excel
      </UiButton>
    </div>

    <!-- Distribution and batch review -->
    <div v-if="task" class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)] gap-4 mb-4">
      <section class="rounded-[16px] border border-black/[0.06] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)] px-6 py-5 min-h-[300px]">
        <div class="text-[16px] font-semibold text-[#1d1d1f] mb-4">班级分数分布</div>
        <div class="relative h-[230px] pl-9 pt-4 pb-7">
          <span class="absolute left-0 top-0 text-[12px] text-[#6e6e73]">人数</span>
          <div class="absolute left-9 right-0 top-5 bottom-7 border-b border-[#d8dde6] bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_calc(25%_-_1px),#e5e7eb_25%)]"></div>
          <div class="relative z-[1] h-full flex items-stretch justify-around gap-5">
            <div v-for="band in scoreDistributionBands" :key="band.label" class="h-full flex-1 grid grid-rows-[1fr_24px] min-w-0">
              <div class="flex flex-col justify-end items-center min-h-0">
                <span class="text-[13px] font-semibold text-[#1d1d1f] mb-1">{{ band.count }}</span>
                <div
                  class="w-[52%] max-w-[78px] min-w-[24px] rounded-t-[3px] transition-all duration-300"
                  :class="band.highlight ? 'bg-[#22b455]' : 'bg-[#087cf0]'"
                  :style="{ height: `${band.height}%` }"
                ></div>
              </div>
              <span class="text-center pt-1 text-[12px] text-[#6e6e73]">{{ band.label }}</span>
            </div>
          </div>
          <span class="absolute right-0 bottom-0 text-[12px] text-[#6e6e73]">分数段</span>
        </div>
      </section>

      <section class="rounded-[16px] border border-black/[0.06] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)] px-6 py-5 min-h-[300px] flex flex-col">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-[16px] font-semibold text-[#1d1d1f]">批次总评</span>
            <span v-if="batchReview.status === 'GENERATING'" class="text-[11px] text-[#ff9500]">生成中</span>
            <span v-else-if="batchReview.status === 'COMPLETED'" class="text-[11px] text-[#16a34a]">已完成</span>
          </div>
          <UiButton
            v-if="batchReview.status === 'FAILED'"
            :disabled="batchReviewLoading || task.completedCount === 0"
            @click="doGenerateBatchReview"
            class="h-[32px] px-4 rounded-[8px] text-[12px] font-medium text-white bg-[var(--app-primary)] border-none cursor-pointer hover:bg-[var(--app-primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LoaderCircle v-if="batchReviewLoading" class="w-3.5 h-3.5 animate-spin" />
            重新生成
          </UiButton>
        </div>

        <div v-if="batchReview.status === 'FAILED'" class="flex-1 rounded-[10px] border border-[#ffd0cd] bg-[#fff7f6] p-4">
          <div class="flex items-center gap-2 text-[#d92d20] font-medium text-[14px] mb-2">
            <CircleAlert class="w-4 h-4 shrink-0" />
            生成失败
          </div>
          <p class="text-[13px] leading-6 text-[#8a2c25] break-words">{{ batchReview.errorMessage || '后端未返回具体错误原因' }}</p>
        </div>
        <div v-else-if="batchReview.status === 'GENERATING'" class="flex-1 flex items-center justify-center gap-2 text-[13px] text-[#6e6e73]">
          <LoaderCircle class="w-4 h-4 animate-spin" />
          正在分析本批次成绩与评语...
        </div>
        <div v-else-if="batchReview.status === 'PENDING'" class="flex-1 flex items-center justify-center text-[13px] text-[#6e6e73]">
          批改完成后将自动生成批次总评
        </div>
        <template v-else>
          <p class="text-[13px] leading-6 text-[#3f4754] mb-4 whitespace-pre-line">{{ batchReview.summary }}</p>
          <div class="border border-[#e5e7eb] rounded-[8px] overflow-hidden">
            <div class="review-insight-row">
              <CheckCircle2 class="w-4 h-4 text-[#22b455] shrink-0" />
              <span class="review-insight-label">整体表现</span>
              <span class="text-[#22a447]">{{ overallPerformanceText }}</span>
            </div>
            <div class="review-insight-row">
              <TriangleAlert class="w-4 h-4 text-[#ff9500] shrink-0" />
              <span class="review-insight-label">共性问题</span>
              <span class="text-[#e88700] line-clamp-1" :title="primaryCommonIssue">{{ primaryCommonIssue }}</span>
            </div>
            <div class="review-insight-row border-b-0">
              <Lightbulb class="w-4 h-4 text-[var(--app-primary)] shrink-0" />
              <span class="review-insight-label">教学建议</span>
              <span class="text-[var(--app-primary)] line-clamp-1" :title="primaryTeachingAdvice">{{ primaryTeachingAdvice }}</span>
            </div>
          </div>
          <div class="mt-auto pt-3 flex justify-end text-[11px] text-[#8b929d]">
            <span v-if="batchReview.generatedAt">生成时间：{{ formatGeneratedAt(batchReview.generatedAt) }}</span>
          </div>
        </template>
      </section>
    </div>

    <!-- Submissions Card -->
    <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden">
      <div class="flex items-center justify-between gap-4 px-5 pt-[18px] pb-[10px] border-b border-black/[0.06]">
        <span class="text-[16px] font-semibold text-[#1d1d1f]">提交列表</span>
        <div class="flex items-center gap-3 flex-wrap justify-end">
          <UiButton
            :disabled="publishingTask || allPublished || hasUnconfirmedMatches || scoredValues.length === 0"
            :title="hasUnconfirmedMatches ? '请先确认学生匹配' : ''"
            @click="doPublishTask"
            class="h-[32px] px-4 rounded-[8px] text-[12px] font-medium text-white bg-[#16a34a] border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >{{ allPublished ? '已全部发布' : (hasUnconfirmedMatches ? '请先确认学生匹配' : '批量发布成绩') }}</UiButton>
          <UiButton
            v-if="publishedCount > 0"
            :disabled="publishingTask"
            @click="doRevokeTask"
            class="h-[32px] px-4 rounded-[8px] text-[12px] font-medium text-[#c44b3f] bg-white border border-[#f0c9c5]"
          >批量撤回</UiButton>
          <div class="flex items-center bg-black/[0.04] rounded-[10px] p-0.5">
          <UiButton
            v-for="opt in filterOptions"
            :key="opt.value"
            @click="statusFilter = opt.value"
            class="h-[30px] px-3 rounded-[8px] text-[12px] font-medium transition-all cursor-pointer border-none"
            :class="statusFilter === opt.value ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-[#6e6e73] hover:text-[#1d1d1f]'"
          >{{ opt.label }}</UiButton>
          </div>
        </div>
      </div>

      <div class="p-5">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex gap-4 animate-pulse">
            <div class="h-4 w-16 bg-black/[0.06] rounded"></div>
            <div class="h-4 w-32 bg-black/[0.06] rounded"></div>
            <div class="h-4 w-24 bg-black/[0.06] rounded"></div>
            <div class="h-4 w-20 bg-black/[0.06] rounded"></div>
            <div class="h-4 flex-1 bg-black/[0.06] rounded"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredSubs.length === 0" class="flex flex-col items-center justify-center py-16">
          <svg class="w-16 h-16 text-[#d2d2d7] mb-4" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="12" width="48" height="40" rx="6" stroke="currentColor" stroke-width="2"/>
            <path d="M8 24h48" stroke="currentColor" stroke-width="2"/>
            <circle cx="32" cy="38" r="6" stroke="currentColor" stroke-width="2"/>
            <path d="M29 38l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p class="text-[15px] text-[#6e6e73]">暂无提交数据</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr class="border-b border-black/[0.06]">
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tl-lg">ID</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">学生</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">班级</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">状态</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">学生匹配</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">发布</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">总分</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">原始文件</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">报告</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">总评</th>
                <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] rounded-tr-lg">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredSubs" :key="row.submissionId" class="border-b border-black/[0.04] hover:bg-[rgba(194,112,62,0.03)] transition-colors">
                <td class="py-3 px-3 text-[#6e6e73]">{{ row.submissionId }}</td>
                <td class="py-3 px-3 font-medium text-[#1d1d1f] max-w-[160px] truncate">{{ row.studentName }}</td>
                <td class="py-3 px-3 text-[#6e6e73] max-w-[140px] truncate">{{ row.className }}</td>
                <td class="py-3 px-3">
                  <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold" :class="tagClass(statusType(row.status))">
                    {{ statusText(row.status) }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span :class="isMatchConfirmed(row) ? 'text-[#16a34a]' : 'text-[#c49a3c]'">
                    {{ isMatchConfirmed(row) ? '已确认' : (row.matchStatus === 'AMBIGUOUS' ? '重名待确认' : '待确认') }}
                  </span>
                </td>
                <td class="py-3 px-3" :class="row.published ? 'text-[#16a34a]' : 'text-[#8b929d]'">{{ row.published ? '已发布' : '未发布' }}</td>
                <td class="py-3 px-3">
                  <span class="font-semibold" :class="scoreClass(row.totalScore)">{{ formatScore(row.totalScore) }}</span>
                </td>
                <td class="py-3 px-3 text-[#6e6e73] max-w-[220px] truncate" :title="row.originalFilename">{{ row.originalFilename }}</td>
                <td class="py-3 px-3">
                  <span v-if="row.hasDownloadableReport" class="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-bold bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]">
                    {{ reportTypeLabel(row.preferredReportFileType) }}
                  </span>
                  <span v-else class="text-[#aeaeb2]">未生成</span>
                </td>
                <td class="py-3 px-3 max-w-[260px] truncate text-[#6e6e73]" :title="row.finalReviewComment">
                  <span v-if="row.finalReviewComment">{{ row.finalReviewComment }}</span>
                  <span v-else class="text-[#aeaeb2]">暂无</span>
                </td>
                <td class="py-3 px-3 whitespace-nowrap">
                  <UiButton
                    v-if="!isMatchConfirmed(row)"
                    @click="router.push(`/teacher/grading/submission/${row.submissionId}`)"
                    class="text-[13px] font-medium text-[#c49a3c] bg-transparent border-none mr-3"
                  >确认学生</UiButton>
                  <UiButton
                    v-else-if="!row.published && ['SCORED', 'NEED_MORE_EVIDENCE'].includes(row.status)"
                    :disabled="publishingSubmissionId === row.submissionId"
                    @click="publishOne(row)"
                    class="text-[13px] font-medium text-[#16a34a] bg-transparent border-none mr-3 disabled:opacity-50"
                  >发布成绩</UiButton>
                  <UiButton
                    v-else-if="row.published"
                    :disabled="publishingSubmissionId === row.submissionId"
                    @click="revokeOne(row)"
                    class="text-[13px] font-medium text-[#c44b3f] bg-transparent border-none mr-3 disabled:opacity-50"
                  >撤回发布</UiButton>
                  <UiButton v-if="row.hasDownloadableReport" @click="downloadReport(row)" class="text-[13px] font-medium text-[#6b8f6b] cursor-pointer hover:text-[#2da44e] transition-colors bg-transparent border-none mr-3">
                    下载报告
                  </UiButton>
                  <UiButton
                    v-if="row.status === 'FAILED'"
                    :disabled="retryingSubmissionId === row.submissionId"
                    @click="retrySubmission(row)"
                    class="text-[13px] font-medium text-[#c49a3c] cursor-pointer hover:text-[#e08600] transition-colors bg-transparent border-none mr-3"
                  >
                    <span v-if="retryingSubmissionId === row.submissionId" class="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></span>
                    重试
                  </UiButton>
                  <UiButton @click="router.push(`/teacher/grading/submission/${row.submissionId}`)" class="text-[13px] font-medium text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)] transition-colors bg-transparent border-none">
                    查看详情
                  </UiButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Export Dialog -->
    <AppModal v-model="exportVisible" title="导出成绩 Excel" width="600px">
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-[14px] font-medium text-[#1d1d1f] w-[90px]">选择学生</span>
          <label class="flex items-center gap-1.5 cursor-pointer text-[13px] text-[#1d1d1f]">
            <UiInput type="checkbox" v-model="exportSelectAll" @change="toggleSelectAll(exportSelectAll)" class="w-4 h-4 rounded accent-[var(--app-primary)]" />
            全选
          </label>
        </div>
        <div class="max-h-[280px] overflow-auto border border-black/[0.06] rounded-[12px] p-3">
          <label
            v-for="sub in submissions"
            :key="sub.submissionId"
            class="flex items-center gap-2 py-1.5 cursor-pointer text-[13px] text-[#1d1d1f] hover:bg-black/[0.02] rounded px-1"
          >
            <UiInput type="checkbox" :value="sub.submissionId" v-model="exportSelected" class="w-4 h-4 rounded accent-[var(--app-primary)]" />
            <span>{{ sub.studentName || '未知学生' }}</span>
            <span class="text-[#aeaeb2]">{{ sub.className || '' }}</span>
            <span class="ml-2 text-[#6e6e73]">{{ sub.totalScore != null ? `${formatScore(sub.totalScore)}分` : '-' }}</span>
          </label>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[14px] font-medium text-[#1d1d1f] w-[90px]">包含总评</span>
          <UiButton
            @click="exportIncludeComments = !exportIncludeComments"
            class="relative w-[44px] h-[24px] rounded-full transition-colors cursor-pointer border-none"
            :class="exportIncludeComments ? 'bg-[#6b8f6b]' : 'bg-black/[0.12]'"
          >
            <span class="absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all" :class="exportIncludeComments ? 'left-[22px]' : 'left-[2px]'"></span>
          </UiButton>
        </div>
      </div>
      <template #footer>
        <UiButton @click="exportVisible = false" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-white border border-black/[0.1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer">
          取消
        </UiButton>
        <UiButton
          :disabled="exporting || exportSelected.length === 0"
          @click="doExport"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="exporting" class="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></span>
          导出
        </UiButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CheckCircle2, CircleAlert, Lightbulb, LoaderCircle, TriangleAlert } from 'lucide-vue-next'
import { message as uiMessage } from '@/services/feedback'
import logger from '@/utils/logger'
import AppModal from '../../components/AppModal.vue'
import {
  batchGenerateAnnotatedReports,
  downloadSubmissionReport,
  exportGradingExcel,
  exportGradingTask,
  getBatchReview,
  getGradingTaskDetail,
  publishConfirmedTask,
  publishSubmission,
  revokeSubmissionPublication,
  revokeTaskPublications,
  retryGradingSubmission,
  triggerBatchReview,
} from '@/api/tap'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id

const task = ref(null)
const submissions = ref([])
const loading = ref(false)
const statusFilter = ref('')

const exportVisible = ref(false)
const exportSelected = ref([])
const exportSelectAll = ref(false)
const exportIncludeComments = ref(true)
const exporting = ref(false)
const annotating = ref(false)
const exportingAnnotated = ref(false)
const retryingSubmissionId = ref(null)
const publishingTask = ref(false)
const publishingSubmissionId = ref(null)

// ---- 批次总评 ----
const batchReview = ref({
  status: 'PENDING',
  summary: null,
  commonIssues: [],
  strengths: [],
  teachingAdvice: [],
  scoreDistribution: null,
  errorMessage: null,
  generatedAt: null,
})
const batchReviewLoading = ref(false)
const batchReviewRefreshTimer = ref(null)

const filterOptions = [
  { label: '全部', value: '' },
  { label: '已评分', value: 'SCORED' },
  { label: '失败', value: 'FAILED' },
  { label: '证据不足', value: 'NEED_MORE_EVIDENCE' },
  { label: '处理中', value: 'PROCESSING' },
]

const filteredSubs = computed(() => {
  if (!statusFilter.value) return submissions.value
  return submissions.value.filter(item => item.status === statusFilter.value)
})

const hasUnconfirmedMatches = computed(() => submissions.value.some(item => !isMatchConfirmed(item)))
const publishedCount = computed(() => submissions.value.filter(item => item.published).length)
const allPublished = computed(() => submissions.value.length > 0 && publishedCount.value === submissions.value.length)

function isMatchConfirmed(row) {
  return ['AUTO_CONFIRMED', 'MANUAL_CONFIRMED'].includes(row?.matchStatus)
}

async function doPublishTask() {
  publishingTask.value = true
  try {
    const res = await publishConfirmedTask(taskId)
    const data = res?.data || res
    uiMessage.success(`已发布 ${data.publishedCount || 0} 份成绩`)
    await loadDetail()
  } catch (error) {
    uiMessage.error(error.message || '批量发布失败')
  } finally {
    publishingTask.value = false
  }
}

async function doRevokeTask() {
  publishingTask.value = true
  try {
    await revokeTaskPublications(taskId)
    uiMessage.success('已撤回本任务发布的成绩')
    await loadDetail()
  } catch (error) {
    uiMessage.error(error.message || '撤回失败')
  } finally {
    publishingTask.value = false
  }
}

async function publishOne(row) {
  publishingSubmissionId.value = row.submissionId
  try {
    await publishSubmission(row.submissionId)
    uiMessage.success('成绩已发布给学生')
    await loadDetail()
  } catch (error) {
    uiMessage.error(error.message || '发布失败')
  } finally {
    publishingSubmissionId.value = null
  }
}

async function revokeOne(row) {
  publishingSubmissionId.value = row.submissionId
  try {
    await revokeSubmissionPublication(row.submissionId)
    uiMessage.success('已撤回发布')
    await loadDetail()
  } catch (error) {
    uiMessage.error(error.message || '撤回失败')
  } finally {
    publishingSubmissionId.value = null
  }
}

const scoredValues = computed(() => submissions.value
  .map(item => Number(item.totalScore))
  .filter(score => Number.isFinite(score)))

const scoreStats = computed(() => {
  const scores = scoredValues.value
  if (!scores.length) return { average: '-', highest: '-', lowest: '-' }
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return {
    average: average.toFixed(1),
    highest: formatScore(Math.max(...scores)),
    lowest: formatScore(Math.min(...scores)),
  }
})

const taskPendingCount = computed(() => Math.max(
  0,
  Number(task.value?.totalCount || 0)
    - Number(task.value?.completedCount || 0)
    - Number(task.value?.failedCount || 0),
))

const scoreDistributionBands = computed(() => {
  const definitions = [
    { label: '0-59', min: 0, max: 60 },
    { label: '60-69', min: 60, max: 70 },
    { label: '70-79', min: 70, max: 80 },
    { label: '80-89', min: 80, max: 90, highlight: true },
    { label: '90-100', min: 90, max: 101 },
  ]
  const counts = definitions.map(({ min, max }) => scoredValues.value.filter(score => score >= min && score < max).length)
  const maxCount = Math.max(1, ...counts)
  return definitions.map((definition, index) => ({
    ...definition,
    count: counts[index],
    height: counts[index] === 0 ? 2 : Math.max(10, (counts[index] / maxCount) * 82),
  }))
})

const overallPerformanceText = computed(() => {
  if (batchReview.value.strengths?.length) return batchReview.value.strengths[0]
  const average = Number(scoreStats.value.average)
  if (!Number.isFinite(average)) return '暂无结论'
  if (average >= 85) return '优秀'
  if (average >= 75) return '良好'
  if (average >= 60) return '基本达标'
  return '需要重点补强'
})

const primaryCommonIssue = computed(() => batchReview.value.commonIssues?.[0] || '未发现明显共性问题')
const primaryTeachingAdvice = computed(() => batchReview.value.teachingAdvice?.[0] || '暂无额外教学建议')

function tagClass(type) {
  return {
    success: 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
    warning: 'bg-[rgba(196,154,60,0.1)] text-[#c49a3c]',
    danger: 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]',
    info: 'bg-black/5 text-[#6e6e73]',
  }[type] || 'bg-black/5 text-[#6e6e73]'
}

function statusType(status) {
  return {
    PENDING: 'info',
    PROCESSING: 'warning',
    FINALIZING: 'warning',
    SCORED: 'success',
    COMPLETED: 'success',
    FAILED: 'danger',
    NEED_MORE_EVIDENCE: 'warning',
  }[status] || 'info'
}

function statusText(status) {
  return {
    PENDING: '等待中',
    PROCESSING: '处理中',
    FINALIZING: '生成资源中',
    SCORED: '已评分',
    COMPLETED: '已完成',
    FAILED: '失败',
    NEED_MORE_EVIDENCE: '证据不足',
  }[status] || status
}

function scoreClass(score) {
  if (score == null) return ''
  const num = Number(score)
  if (num >= 80) return 'text-[#6b8f6b]'
  if (num >= 60) return 'text-[#c49a3c]'
  return 'text-[#c44b3f]'
}

function formatScore(score) {
  if (score == null || score === '') return '-'
  const num = Number(score)
  return Number.isFinite(num) ? num.toFixed(1).replace(/\.0$/, '') : score
}

function reportTypeLabel(type) {
  return {
    annodoc: '批注 Word',
    annopdf: '批注 PDF',
    pdf: '评分 PDF',
  }[type] || '已生成'
}

function showExportDialog() {
  if (!submissions.value.length) {
    uiMessage.warning('暂无可导出的提交数据')
    return
  }
  exportSelected.value = submissions.value.map(item => item.submissionId)
  exportSelectAll.value = true
  exportVisible.value = true
}

function toggleSelectAll(checked) {
  exportSelected.value = checked ? submissions.value.map(item => item.submissionId) : []
}

async function doExport() {
  exporting.value = true
  try {
    const res = await exportGradingExcel(taskId, exportSelected.value, exportIncludeComments.value)
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `批改成绩-任务${taskId}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    exportVisible.value = false
    uiMessage.success('导出成功')
  } catch (error) {
    uiMessage.error(`导出失败: ${error.message}`)
  } finally {
    exporting.value = false
  }
}

async function doBatchAnnotate() {
  annotating.value = true
  try {
    const res = await batchGenerateAnnotatedReports(taskId)
    const data = res?.data || res
    uiMessage.success(`批改报告处理完成：共${data.total || 0}份，新生成${data.generated || 0}份，刷新${data.refreshed || 0}份，跳过${data.skipped || 0}份`)
    if (data.errors && data.errors.length > 0) {
      uiMessage.warning(`${data.errors.length}份生成失败，请查看后端返回信息`)
    }
    await loadDetail()
  } catch (error) {
    uiMessage.error(`生成批改报告失败: ${error.message}`)
  } finally {
    annotating.value = false
  }
}

async function doBatchExportAnnotated() {
  exportingAnnotated.value = true
  try {
    const res = await exportGradingTask(taskId)
    const blob = new Blob([res], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI批改报告-任务${taskId}.zip`
    a.click()
    URL.revokeObjectURL(url)
    uiMessage.success('批改报告 ZIP 导出成功')
  } catch (error) {
    uiMessage.error(`导出失败: ${error.message}`)
  } finally {
    exportingAnnotated.value = false
  }
}

async function downloadReport(row) {
  try {
    const res = await downloadSubmissionReport(row.submissionId)
    const blob = new Blob([res])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = resolveAnnotatedFilename(row.originalFilename, row.studentName, row.preferredReportFileType)
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    uiMessage.error(`下载失败: ${error.message}`)
  }
}

async function retrySubmission(row) {
  retryingSubmissionId.value = row.submissionId
  try {
    await retryGradingSubmission(row.submissionId)
    uiMessage.success('已提交重试任务')
    await loadDetail()
  } catch (error) {
    uiMessage.error(`重试失败: ${error.message}`)
  } finally {
    retryingSubmissionId.value = null
  }
}

function resolveAnnotatedFilename(originalFilename, studentName, reportType) {
  const ext = reportType === 'annodoc' ? 'docx' : 'pdf'
  if (!originalFilename) {
    return `${studentName || 'submission'}.${ext}`
  }
  const lower = originalFilename.toLowerCase()
  if (lower.endsWith(`.${ext}`)) {
    return originalFilename
  }
  const dot = originalFilename.lastIndexOf('.')
  return dot >= 0 ? `${originalFilename.slice(0, dot)}.${ext}` : `${originalFilename}.${ext}`
}

async function loadBatchReview() {
  try {
    const res = await getBatchReview(taskId)
    const data = res?.data || res
    if (data) {
      batchReview.value = {
        status: data.status || 'PENDING',
        summary: data.summary || null,
        commonIssues: data.commonIssues || [],
        strengths: data.strengths || [],
        teachingAdvice: data.teachingAdvice || [],
        scoreDistribution: data.scoreDistribution || null,
        errorMessage: data.errorMessage || null,
        generatedAt: data.generatedAt || null,
      }
    }
  } catch (e) {
    logger.error('加载批次总评失败:', e)
  }
}

function formatGeneratedAt(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replaceAll('/', '-')
}

async function doGenerateBatchReview() {
  batchReviewLoading.value = true
  try {
    await triggerBatchReview(taskId)
    uiMessage.success('批次总评已开始生成')
    await loadBatchReview()
    startBatchReviewPolling()
  } catch (error) {
    uiMessage.error(`生成失败: ${error.message}`)
  } finally {
    batchReviewLoading.value = false
  }
}

async function ensureBatchReviewAutoGeneration() {
  const done = ['COMPLETED', 'FAILED'].includes(task.value?.status)
  if (!done || task.value?.completedCount <= 0 || batchReview.value.status !== 'PENDING') {
    return
  }
  try {
    await triggerBatchReview(taskId)
    await loadBatchReview()
    startBatchReviewPolling()
  } catch (error) {
    logger.error('自动生成批次总评失败:', error)
  }
}

function startBatchReviewPolling() {
  if (batchReviewRefreshTimer.value) return
  batchReviewRefreshTimer.value = setInterval(async () => {
    await loadBatchReview()
    if (batchReview.value.status !== 'GENERATING') {
      clearInterval(batchReviewRefreshTimer.value)
      batchReviewRefreshTimer.value = null
    }
  }, 4000)
}

async function loadDetail() {
  loading.value = true
  try {
    const res = await getGradingTaskDetail(taskId)
    const data = res?.data || res
    task.value = data
    submissions.value = data.submissions || []
    await loadBatchReview()
    await ensureBatchReviewAutoGeneration()
  } catch (error) {
    uiMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetail()
  startBatchReviewPolling()
})

onUnmounted(() => {
  if (batchReviewRefreshTimer.value) clearInterval(batchReviewRefreshTimer.value)
})
</script>

<style scoped>
.overview-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-right: 1px solid rgba(15, 23, 42, 0.1);
}

.review-insight-row {
  min-height: 40px;
  display: grid;
  grid-template-columns: 20px 86px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
}

.review-insight-label {
  color: #596273;
}

@media (max-width: 1280px) {
  .overview-stat {
    min-width: 100px;
    padding-inline: 14px;
  }
}

@media (max-width: 768px) {
  .overview-stat {
    width: 33.333%;
    min-width: 0;
    padding-inline: 8px;
  }

  .overview-stat:nth-child(3n) {
    border-right: 0;
  }

  .review-insight-row {
    grid-template-columns: 20px 72px minmax(0, 1fr);
  }
}
</style>
