<template>
  <div class="p-5">
    <UiPageHeader
      class="mb-5"
      title="实验详情"
      :description="experimentData.name || '加载中...'"
    >
      <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="goBack">返回列表</UiButton>
    </UiPageHeader>

    <div v-if="loading" class="flex flex-col gap-4">
      <div class="grid grid-cols-4 gap-5 max-[768px]:grid-cols-2">
        <div v-for="i in 4" :key="i" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="h-7 w-16 mx-auto rounded-lg bg-[#f5f5f7] animate-pulse mb-2"></div>
          <div class="h-4 w-12 mx-auto rounded bg-[#f5f5f7] animate-pulse"></div>
        </div>
      </div>
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="h-5 w-24 rounded bg-[#f5f5f7] animate-pulse mb-4"></div>
        <div class="space-y-3">
          <div class="h-4 w-full rounded bg-[#f5f5f7] animate-pulse"></div>
          <div class="h-4 w-3/4 rounded bg-[#f5f5f7] animate-pulse"></div>
          <div class="h-4 w-1/2 rounded bg-[#f5f5f7] animate-pulse"></div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col gap-5">
      <!-- 实验数据统计卡片 -->
      <div class="grid grid-cols-4 gap-5 max-[768px]:grid-cols-2">
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 text-center">
          <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ submissionStats.totalStudents }}</div>
          <div class="text-[13px] text-[#6e6e73] mt-1">学生总数</div>
        </div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 text-center">
          <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ submissionStats.submittedCount }}</div>
          <div class="text-[13px] text-[#6e6e73] mt-1">已提交数量</div>
        </div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 text-center">
          <div class="text-[28px] font-bold text-[var(--app-primary)] mb-1">{{ submissionStats.completionRate }}%</div>
          <div class="text-[13px] text-[#6e6e73] mt-1">完成率</div>
        </div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 text-center">
          <div class="text-[28px] font-bold mb-1" :class="getScoreClass(submissionStats.averageScore)">
            {{ submissionStats.averageScore || '暂无' }}
          </div>
          <div class="text-[13px] text-[#6e6e73] mt-1">平均分</div>
        </div>
      </div>

      <!-- 基本信息卡片 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">基本信息</span>
          <UiButton class="text-[13px] font-medium text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)] transition-colors bg-transparent border-none" @click="openEditDialog">编辑</UiButton>
        </div>
        <div class="grid grid-cols-2 gap-x-8 gap-y-4 max-[768px]:grid-cols-1">
          <div class="flex items-baseline gap-3">
            <span class="text-[13px] text-[#6e6e73] shrink-0 w-[80px]">实验名称</span>
            <span class="text-[14px] text-[#1d1d1f]">{{ experimentData.name }}</span>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-[13px] text-[#6e6e73] shrink-0 w-[80px]">截止日期</span>
            <span class="text-[14px] text-[#1d1d1f]">{{ formatDate(experimentData.deadline) }}</span>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-[13px] text-[#6e6e73] shrink-0 w-[80px]">创建时间</span>
            <span class="text-[14px] text-[#1d1d1f]">{{ formatDate(experimentData.createdTime) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[13px] text-[#6e6e73] shrink-0 w-[80px]">状态</span>
            <span class="text-[12px] font-medium px-2.5 py-0.5 rounded-full" :class="getTagClass(experimentData.status)">
              {{ getStatusText(experimentData.status) }}
            </span>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-[13px] text-[#6e6e73] shrink-0 w-[80px]">提交数</span>
            <span class="text-[14px] text-[#1d1d1f]">{{ submissionStats.submittedCount }}</span>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-[13px] text-[#6e6e73] shrink-0 w-[80px]">平均分</span>
            <span class="text-[14px] text-[#1d1d1f]">{{ submissionStats.averageScore !== null ? submissionStats.averageScore : '暂无' }}</span>
          </div>
          <div class="flex items-baseline gap-3 col-span-2 max-[768px]:col-span-1">
            <span class="text-[13px] text-[#6e6e73] shrink-0 w-[80px]">关联班级</span>
            <span class="text-[14px] text-[#1d1d1f]">{{ experimentData.classes ? experimentData.classes.join('、') : '所有班级' }}</span>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-[13px] text-[#6e6e73] shrink-0 w-[80px]">创建者</span>
            <span class="text-[14px] text-[#1d1d1f]">{{ experimentData.createdBy || '当前教师' }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[13px] text-[#6e6e73] shrink-0 w-[80px]">难度级别</span>
            <ui-rate v-model="experimentData.difficulty" disabled show-score text-color="#ff9900" />
          </div>
        </div>
      </div>

      <!-- 实验要求卡片 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">实验要求</span>
          <UiButton class="text-[13px] font-medium text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)] transition-colors bg-transparent border-none" @click="openEditContentDialog">编辑内容</UiButton>
        </div>

        <div v-if="!experimentData.description" class="flex flex-col items-center justify-center py-12 text-center">
          <svg class="w-16 h-16 text-[#d2d2d7] mb-4" fill="none" viewBox="0 0 64 64"><rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" stroke-width="2"/><path d="M20 28h24M20 34h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <p class="text-[14px] text-[#6e6e73] mb-4">实验要求暂未编辑</p>
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="openEditContentDialog">添加实验要求</UiButton>
        </div>

        <div v-else class="space-y-4">
          <div>
            <h3 class="text-[14px] font-semibold text-[#1d1d1f] mb-2">实验描述</h3>
            <p class="text-[14px] text-[#424245] leading-relaxed">{{ experimentData.description }}</p>
          </div>
          <div>
            <h3 class="text-[14px] font-semibold text-[#1d1d1f] mb-2">实验要求</h3>
            <ul class="pl-5 space-y-1.5">
              <li v-for="(req, index) in experimentData.requirements" :key="index" class="text-[14px] text-[#424245]">{{ req }}</li>
            </ul>
          </div>
          <div v-if="experimentData.attachments && experimentData.attachments.length">
            <h3 class="text-[14px] font-semibold text-[#1d1d1f] mb-2">附件</h3>
            <ul class="space-y-1.5">
              <li v-for="(attachment, index) in experimentData.attachments" :key="index">
                <a :href="attachment.url" target="_blank" class="text-[13px] font-medium text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] transition-colors underline">{{ attachment.name }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 提交情况图表 -->
      <div class="grid grid-cols-2 gap-5 max-[768px]:grid-cols-1">
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 h-[400px]">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
            <span class="text-[15px] font-semibold text-[#1d1d1f]">提交情况统计</span>
          </div>
          <div class="h-[300px] w-full" ref="submissionChartRef"></div>
        </div>
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 h-[400px]">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
            <span class="text-[15px] font-semibold text-[#1d1d1f]">成绩分布</span>
          </div>
          <div class="h-[300px] w-full" ref="scoreChartRef"></div>
        </div>
      </div>

      <!-- 学生提交列表 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">学生提交情况</span>
          <div class="flex gap-2 items-center">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2]" fill="none" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <UiInput
                v-model="searchKeyword"
                placeholder="搜索学生姓名/班级"
                class="w-[220px] h-10 pl-9 pr-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
              />
            </div>
            <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="viewAllSubmissions">查看全部</UiButton>
          </div>
        </div>

        <div v-if="submissionsLoading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-12 rounded-lg bg-[#f5f5f7] animate-pulse"></div>
        </div>

        <div v-else-if="filteredSubmissions.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
          <svg class="w-16 h-16 text-[#d2d2d7] mb-4" fill="none" viewBox="0 0 64 64"><rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" stroke-width="2"/><path d="M20 28h24M20 34h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <p class="text-[14px] text-[#6e6e73]">暂无提交记录</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-black/[0.06]">
                <th class="text-left py-3 px-3 text-[12px] font-medium text-[#6e6e73] uppercase tracking-wide">学生姓名</th>
                <th class="text-left py-3 px-3 text-[12px] font-medium text-[#6e6e73] uppercase tracking-wide">班级</th>
                <th class="text-left py-3 px-3 text-[12px] font-medium text-[#6e6e73] uppercase tracking-wide">提交时间</th>
                <th class="text-left py-3 px-3 text-[12px] font-medium text-[#6e6e73] uppercase tracking-wide">得分</th>
                <th class="text-center py-3 px-3 text-[12px] font-medium text-[#6e6e73] uppercase tracking-wide">查重率</th>
                <th class="text-center py-3 px-3 text-[12px] font-medium text-[#6e6e73] uppercase tracking-wide">状态</th>
                <th class="text-right py-3 px-3 text-[12px] font-medium text-[#6e6e73] uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredSubmissions" :key="row.id" class="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors">
                <td class="py-3 px-3 text-[14px] text-[#1d1d1f]">{{ row.studentName }}</td>
                <td class="py-3 px-3 text-[14px] text-[#1d1d1f]">{{ row.class }}</td>
                <td class="py-3 px-3 text-[14px] text-[#1d1d1f]">
                  <span v-if="row.submitTime">{{ formatDate(row.submitTime) }}</span>
                  <span v-else class="text-[13px] text-[#aeaeb2]">未提交</span>
                </td>
                <td class="py-3 px-3 text-[14px]">
                  <span v-if="row.score !== null && row.score !== undefined" :class="getScoreClass(row.score)">{{ row.score }}</span>
                  <span v-else class="text-[13px] text-[#aeaeb2]">未评分</span>
                </td>
                <td class="py-3 px-3 text-center">
                  <span v-if="row.plagiarismRate !== null && row.plagiarismRate !== undefined"
                    class="text-[12px] font-medium px-2.5 py-0.5 rounded-full"
                    :class="getPlagiarismTagClass(row.plagiarismRate)">
                    {{ row.plagiarismRate }}%
                  </span>
                  <span v-else class="text-[13px] text-[#aeaeb2]">未检测</span>
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="text-[12px] font-medium px-2.5 py-0.5 rounded-full"
                    :class="getSubmissionTagClass(row.status)">
                    {{ getSubmissionStatusText(row.status) }}
                  </span>
                </td>
                <td class="py-3 px-3 text-right">
                  <UiButton class="text-[13px] font-medium text-[var(--app-primary)] cursor-pointer hover:text-[var(--app-primary-strong)] transition-colors bg-transparent border-none mr-3" @click="viewSubmissionDetail(row.id)">查看详情</UiButton>
                  <UiButton v-if="row.status === 'submitted'" class="text-[13px] font-medium text-[#6b8f6b] cursor-pointer hover:text-[#248a3d] transition-colors bg-transparent border-none" @click="gradeSubmission(row)">评分</UiButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AppPagination
          v-if="allSubmissions.length > pageSize"
          :current="currentPage"
          :total="allSubmissions.length"
          :page-size="pageSize"
          @update:current="handleCurrentChange"
        />
      </div>

    <!-- 编辑实验基本信息对话框 -->
    <AppModal v-model="editDialogVisible" title="编辑实验" width="500px">
      <div class="space-y-5">
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">实验名称</label>
          <UiInput v-model="editForm.name" placeholder="请输入实验名称" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm" />
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">截止日期</label>
          <ui-date-picker
            v-model="editForm.deadline"
            type="datetime"
            placeholder="选择截止日期"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="!w-full"
          />
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">状态</label>
          <UiSelect v-model="editForm.status" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm appearance-none cursor-pointer">
            <UiOption value="draft">草稿</UiOption>
            <UiOption value="active">进行中</UiOption>
            <UiOption value="expired">已截止</UiOption>
          </UiSelect>
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">关联班级</label>
          <UiSelect v-model="editForm.classes" multiple class="w-full min-h-[80px] px-3 py-2 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm">
            <UiOption v-for="cls in classList" :key="cls.id" :value="cls.id">{{ cls.name }}</UiOption>
          </UiSelect>
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">难度级别</label>
          <ui-rate v-model="editForm.difficulty" show-score text-color="#ff9900" />
        </div>
      </div>
      <template #footer>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="editDialogVisible = false">取消</UiButton>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="submitEditForm">确定</UiButton>
      </template>
    </AppModal>

    <!-- 编辑实验内容对话框 -->
    <AppModal v-model="editContentDialogVisible" title="编辑实验内容" width="700px">
      <div class="space-y-5">
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">实验描述</label>
          <textarea
            v-model="contentForm.description"
            rows="5"
            placeholder="请输入实验描述"
            class="w-full px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-y"
          ></textarea>
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">实验要求</label>
          <div v-for="(req, index) in contentForm.requirements" :key="index" class="flex items-center gap-2 mb-2.5">
            <UiInput v-model="contentForm.requirements[index]" class="flex-1 h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm" />
            <UiButton class="w-8 h-8 rounded-full bg-[rgba(196,75,63,0.1)] text-[#c44b3f] flex items-center justify-center hover:bg-[rgba(196,75,63,0.2)] transition-colors cursor-pointer border-none shrink-0" @click="removeRequirement(index)">
              <Delete class="w-3.5 h-3.5" />
            </UiButton>
          </div>
          <UiButton class="h-[34px] px-4 rounded-[10px] text-[13px] font-medium text-[var(--app-primary)] bg-[rgba(194,112,62,0.08)] hover:bg-[rgba(194,112,62,0.14)] active:scale-[0.96] transition-all cursor-pointer border-none" @click="addRequirement">添加要求</UiButton>
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">附件</label>
          <ui-upload
            action="#"
            :auto-upload="false"
            multiple
            :limit="5"
            :on-change="handleFileChange"
          >
            <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">选择文件</UiButton>
            <template #tip>
              <div class="text-[12px] text-[#aeaeb2] mt-2">可上传任意类型文件，单个文件不超过10MB</div>
            </template>
          </ui-upload>
          <div v-if="contentForm.attachments && contentForm.attachments.length" class="mt-3 space-y-2">
            <div v-for="(file, index) in contentForm.attachments" :key="index" class="flex items-center gap-2">
              <span class="text-[14px] text-[#1d1d1f]">{{ file.name }}</span>
              <UiButton class="w-6 h-6 rounded-full bg-[rgba(196,75,63,0.1)] text-[#c44b3f] flex items-center justify-center hover:bg-[rgba(196,75,63,0.2)] transition-colors cursor-pointer border-none shrink-0" @click="removeAttachment(index)">
                <Delete class="w-3 h-3" />
              </UiButton>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="editContentDialogVisible = false">取消</UiButton>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="submitContentForm">确定</UiButton>
      </template>
    </AppModal>

    <!-- 评分对话框 -->
    <AppModal v-model="gradeDialogVisible" title="评分" width="500px">
      <div class="space-y-5">
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">学生姓名</label>
          <span class="text-[14px] text-[#1d1d1f]">{{ currentSubmission ? currentSubmission.studentName : '' }}</span>
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">得分</label>
          <UiInput
            v-model.number="gradeForm.score"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="w-[180px] h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">查重率</label>
          <div class="flex items-center gap-2">
            <UiInput
              v-model.number="gradeForm.plagiarismRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="w-[180px] h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
            />
            <span class="text-[14px] text-[#6e6e73]">%</span>
          </div>
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#6e6e73] mb-1.5">AI评语</label>
          <textarea
            v-model="gradeForm.aiComment"
            rows="6"
            placeholder="输入AI助教评语"
            class="w-full px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-y"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="gradeDialogVisible = false">取消</UiButton>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="submitGrade">确定</UiButton>
      </template>
    </AppModal>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import * as echarts from 'echarts'
import { Delete } from '@/components/ui/icons'
import api from '../../api'
import { useUserStore } from '../../store'
import AppModal from '../../components/AppModal.vue'
import AppPagination from '../../components/AppPagination.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const normalizeStudentId = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const parseSubmissionCompositeId = (submissionId) => {
  if (typeof submissionId !== 'string') return null
  const separatorIndex = submissionId.lastIndexOf('-')
  if (separatorIndex <= 0 || separatorIndex >= submissionId.length - 1) return null
  return {
    studentId: submissionId.slice(0, separatorIndex),
    experimentId: Number(submissionId.slice(separatorIndex + 1))
  }
}

const experimentId = ref(Number(route.params.id))
const loading = ref(true)
const submissionsLoading = ref(false)

// 统计图表容器引用
const submissionChartRef = ref(null)
const scoreChartRef = ref(null)
let submissionChart = null
let scoreChart = null

// 实验详情数据
const experimentData = ref({
  id: experimentId.value,
  name: '加载中...',
  deadline: '',
  createdTime: '',
  status: '',
  submissionCount: 0,
  averageScore: null,
  description: '',
  requirements: [],
  classes: [],
  createdBy: '',
  difficulty: 3,
  attachments: []
})

// 学生提交数据
const allSubmissions = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')

// 根据分页和搜索过滤后的提交列表
const filteredSubmissions = computed(() => {
  let result = [...allSubmissions.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => {
      return (
        (item.studentName && item.studentName.toLowerCase().includes(keyword)) ||
        (item.class && item.class.toLowerCase().includes(keyword))
      )
    })
  }

  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})


const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 提交统计
const submissionStats = reactive({
  totalStudents: 0,
  submittedCount: 0,
  completionRate: 0,
  averageScore: 0
})

// 班级列表
const syncSubmissionStats = (submissions) => {
  const studentIds = new Set(submissions.map(s => normalizeStudentId(s.studentId)))
  submissionStats.totalStudents = studentIds.size || submissions.length
  submissionStats.submittedCount = submissions.filter(sub =>
    sub.status === 'submitted' || sub.status === 'graded'
  ).length
  submissionStats.completionRate = submissionStats.totalStudents > 0
    ? Math.round((submissionStats.submittedCount / submissionStats.totalStudents) * 100)
    : 0

  const scoredSubmissions = submissions.filter(sub => sub.score !== null && sub.score !== undefined)
  const totalScore = scoredSubmissions.reduce((sum, sub) => sum + sub.score, 0)
  submissionStats.averageScore = scoredSubmissions.length > 0
    ? Math.round((totalScore / scoredSubmissions.length) * 10) / 10
    : null
}

const classList = ref([])

const syncClassListFromSelectedClass = () => {
  const selectedClass = userStore.selectedClass
  classList.value = selectedClass?.id
    ? [{
        id: selectedClass.id,
        name: selectedClass.name || selectedClass.ptaKeyword || '当前班级',
        ptaKeyword: selectedClass.ptaKeyword
          || selectedClass.pta_keyword
          || selectedClass.classKeyword
          || selectedClass.class_keyword
          || selectedClass.name
      }]
    : []
}

// 编辑相关
const editDialogVisible = ref(false)
const editContentDialogVisible = ref(false)
const editForm = reactive({
  name: '',
  deadline: '',
  status: '',
  classes: [],
  difficulty: 3
})

const contentForm = reactive({
  description: '',
  requirements: [],
  attachments: []
})

// 评分相关
const gradeDialogVisible = ref(false)
const currentSubmission = ref(null)
const gradeForm = reactive({
  score: 0,
  plagiarismRate: 0,
  aiComment: ''
})

// Tag class helpers
const getTagClass = (status) => {
  const classMap = {
    'active': 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
    'draft': 'bg-black/5 text-[#6e6e73]',
    'expired': 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]'
  }
  return classMap[status] || 'bg-black/5 text-[#6e6e73]'
}

const getSubmissionTagClass = (status) => {
  const classMap = {
    'submitted': 'bg-[rgba(196,154,60,0.12)] text-[#c49a3c]',
    'graded': 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]',
    'rejected': 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]',
    'not_started': 'bg-black/5 text-[#6e6e73]'
  }
  return classMap[status] || 'bg-black/5 text-[#6e6e73]'
}

const getPlagiarismTagClass = (rate) => {
  if (rate >= 50) return 'bg-[rgba(196,75,63,0.1)] text-[#c44b3f]'
  if (rate >= 30) return 'bg-[rgba(196,154,60,0.12)] text-[#c49a3c]'
  return 'bg-[rgba(107,143,107,0.12)] text-[#6b8f6b]'
}

// 获取实验详情
const loadExperimentDetail = async () => {
  loading.value = true
  try {
    const response = await api.getTeacherExperimentList()
    logger.debug('API返回的实验列表数据', response)

    let experiments = []
    if (response && response.data && Array.isArray(response.data)) {
      experiments = response.data
    } else if (response && Array.isArray(response)) {
      experiments = response
    } else if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        experiments = response.data
      }
    }

    logger.debug('处理后的实验数据:', experiments)
    const experiment = experiments.find(exp => exp.id === experimentId.value)

    if (experiment) {
      experimentData.value = {
        ...experiment,
        description: experiment.description || '',
        requirements: experiment.requirements || [],
        classes: experiment.classes || [],
        createdBy: experiment.createdBy || '',
        difficulty: experiment.difficulty || 3,
        attachments: experiment.attachments || []
      }
    } else {
      logger.error(`未找到ID为${experimentId.value}的实验`)
      uiMessage.warning(`未找到ID为${experimentId.value}的实验`)
    }

    syncClassListFromSelectedClass()

    await loadSubmissions()

    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    logger.error('加载实验详情失败:', error)
    uiMessage.error('加载实验详情失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 加载提交列表
const loadSubmissions = async () => {
  submissionsLoading.value = true
  try {
    const allStudentExperiments = await api.getAllStudentExperiments({ experimentId: experimentId.value })

    const submissions = allStudentExperiments.filter(item =>
      item.experimentId === experimentId.value
    ).map(item => {
      let status = 'not_started'
      if (item.status === 'completed') {
        status = Number(item.score) > 0 ? 'graded' : 'submitted'
      }

      return {
        id: `${item.studentId}-${item.experimentId}`,
        experimentId: item.experimentId,
        experimentName: item.experimentName,
        studentId: normalizeStudentId(item.studentId),
        studentName: item.studentName,
        class: item.className || '未知班级',
        submitTime: item.submitTime,
        score: item.score == null ? null : Number(item.score),
        plagiarismRate: item.plagiarismRate,
        status: status
      }
    })

    allSubmissions.value = submissions
    syncSubmissionStats(submissions)
  } catch (error) {
    logger.error('加载提交列表失败:', error)
    uiMessage.error('加载提交列表失败: ' + (error.message || '未知错误'))
    allSubmissions.value = []
  } finally {
    submissionsLoading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initSubmissionChart()
    initScoreChart()
  })
}

const initSubmissionChart = () => {
  if (submissionChartRef.value) {
    if (submissionChart) {
      submissionChart.dispose()
    }

    submissionChart = echarts.init(submissionChartRef.value)

    const statusCounts = {
      submitted: allSubmissions.value.filter(sub => sub.status === 'submitted').length,
      graded: allSubmissions.value.filter(sub => sub.status === 'graded').length,
      notStarted: submissionStats.totalStudents - submissionStats.submittedCount
    }

    const option = {
      title: { text: '提交状态分布', left: 'center' },
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left', data: ['未提交', '待批阅', '已批阅'] },
      series: [{
        name: '提交状态',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        data: [
          { value: statusCounts.notStarted, name: '未提交', itemStyle: {color: '#909399'} },
          { value: statusCounts.submitted, name: '待批阅', itemStyle: {color: '#E6A23C'} },
          { value: statusCounts.graded, name: '已批阅', itemStyle: {color: '#67C23A'} }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        },
        label: { formatter: '{b}: {c} ({d}%)' }
      }]
    }

    submissionChart.setOption(option)
  }
}

const initScoreChart = () => {
  if (scoreChartRef.value) {
    if (scoreChart) {
      scoreChart.dispose()
    }

    scoreChart = echarts.init(scoreChartRef.value)

    const scoreCounts = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 }

    allSubmissions.value.forEach(sub => {
      if (sub.score !== null && sub.score !== undefined) {
        if (sub.score >= 90) scoreCounts['90-100']++
        else if (sub.score >= 80) scoreCounts['80-89']++
        else if (sub.score >= 70) scoreCounts['70-79']++
        else if (sub.score >= 60) scoreCounts['60-69']++
        else scoreCounts['<60']++
      }
    })

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['学生数量'], top: '20px' },
      grid: { top: '25%', left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: ['<60', '60-69', '70-79', '80-89', '90-100'] },
      yAxis: { type: 'value' },
      series: [{
        name: '学生数量',
        type: 'bar',
        data: [
          { value: scoreCounts['<60'], itemStyle: {color: '#F56C6C'} },
          { value: scoreCounts['60-69'], itemStyle: {color: '#E6A23C'} },
          { value: scoreCounts['70-79'], itemStyle: {color: '#67C23A'} },
          { value: scoreCounts['80-89'], itemStyle: {color: '#409EFF'} },
          { value: scoreCounts['90-100'], itemStyle: {color: '#8E44AD'} }
        ]
      }]
    }

    scoreChart.setOption(option)
  }
}

// 打开编辑对话框
const openEditDialog = () => {
  editForm.name = experimentData.value.name
  editForm.deadline = experimentData.value.deadline
  editForm.status = experimentData.value.status
  editForm.classes = experimentData.value.classes ? [...experimentData.value.classes] : []
  editForm.difficulty = experimentData.value.difficulty
  editDialogVisible.value = true
}

// 提交编辑表单
const submitEditForm = async () => {
  try {
    experimentData.value = {
      ...experimentData.value,
      name: editForm.name,
      deadline: editForm.deadline,
      status: editForm.status,
      classes: editForm.classes,
      difficulty: editForm.difficulty
    }
    uiMessage.success('更新成功')
    editDialogVisible.value = false
  } catch (error) {
    logger.error('更新实验失败:', error)
    uiMessage.error('更新实验失败: ' + (error.message || '未知错误'))
  }
}

// 打开编辑内容对话框
const openEditContentDialog = () => {
  contentForm.description = experimentData.value.description || ''
  contentForm.requirements = experimentData.value.requirements ? [...experimentData.value.requirements] : []
  contentForm.attachments = experimentData.value.attachments ? [...experimentData.value.attachments] : []
  editContentDialogVisible.value = true
}

const addRequirement = () => {
  contentForm.requirements.push('')
}

const removeRequirement = (index) => {
  contentForm.requirements.splice(index, 1)
}

const handleFileChange = (file) => {
  contentForm.attachments.push({
    name: file.name,
    url: URL.createObjectURL(file.raw)
  })
}

const removeAttachment = (index) => {
  contentForm.attachments.splice(index, 1)
}

const submitContentForm = async () => {
  try {
    experimentData.value = {
      ...experimentData.value,
      description: contentForm.description,
      requirements: contentForm.requirements,
      attachments: contentForm.attachments
    }
    uiMessage.success('内容更新成功')
    editContentDialogVisible.value = false
  } catch (error) {
    logger.error('更新实验内容失败:', error)
    uiMessage.error('更新实验内容失败: ' + (error.message || '未知错误'))
  }
}

// 评分相关
const gradeSubmission = (submission) => {
  currentSubmission.value = submission
  gradeForm.score = submission.score || 0
  gradeForm.plagiarismRate = submission.plagiarismRate || 0
  gradeForm.aiComment = ''
  gradeDialogVisible.value = true
}

const submitGrade = async () => {
  if (!currentSubmission.value) return

  try {
    const submissionId = currentSubmission.value.id
    const parsedSubmissionId = parseSubmissionCompositeId(submissionId)
    const studentId = parsedSubmissionId?.studentId
    const expId = parsedSubmissionId?.experimentId

    const gradeData = {
      ...gradeForm,
      studentId,
      experimentId: expId
    }

    await api.gradeSubmission(submissionId, gradeData)

    uiMessage.success('评分成功')
    gradeDialogVisible.value = false

    const index = allSubmissions.value.findIndex(sub => sub.id === currentSubmission.value.id)
    if (index > -1) {
      allSubmissions.value[index] = {
        ...allSubmissions.value[index],
        score: gradeForm.score,
        plagiarismRate: gradeForm.plagiarismRate,
        status: 'graded'
      }
      syncSubmissionStats(allSubmissions.value)
      initCharts()
    }
  } catch (error) {
    logger.error('评分失败:', error)
    uiMessage.error('评分失败: ' + (error.message || '未知错误'))
  }
}

// 状态类型和文本
const getStatusType = (status) => {
  const typeMap = { 'active': 'success', 'draft': 'info', 'expired': 'danger' }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = { 'active': '进行中', 'draft': '草稿', 'expired': '已截止' }
  return textMap[status] || '未知状态'
}

const getSubmissionStatusType = (status) => {
  const typeMap = { 'submitted': 'warning', 'graded': 'success', 'rejected': 'danger', 'not_started': 'info' }
  return typeMap[status] || 'info'
}

const getSubmissionStatusText = (status) => {
  const textMap = { 'submitted': '待批阅', 'graded': '已批阅', 'rejected': '已拒绝', 'not_started': '未提交' }
  return textMap[status] || '未知状态'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const getScoreClass = (score) => {
  if (score === undefined || score === null) return ''
  if (score >= 90) return 'font-semibold text-[#8E44AD]'
  if (score >= 80) return 'font-semibold text-[#409EFF]'
  if (score >= 60) return 'font-semibold text-[#67C23A]'
  return 'font-semibold text-[#F56C6C]'
}

const getPlagiarismRateType = (rate) => {
  if (rate >= 50) return 'danger'
  if (rate >= 30) return 'warning'
  return 'success'
}

// 页面导航
const goBack = () => {
  router.push('/teacher/experiments')
}

const viewAllSubmissions = () => {
  router.push(`/teacher/submissions/${experimentId.value}`)
}

const viewSubmissionDetail = (id) => {
  router.push(`/teacher/submission-detail/${id}`)
}

const cleanupCharts = () => {
  if (submissionChart) { submissionChart.dispose(); submissionChart = null }
  if (scoreChart) { scoreChart.dispose(); scoreChart = null }
}

const handleChartsResize = () => {
  submissionChart?.resize()
  scoreChart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleChartsResize)
  loadExperimentDetail()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleChartsResize)
  cleanupCharts()
})

defineExpose({
  getScoreClass,
  getStatusType,
  getStatusText,
  getSubmissionStatusType,
  getSubmissionStatusText,
  getPlagiarismRateType,
  formatDate
})
</script>
