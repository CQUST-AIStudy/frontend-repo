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
        <div class="flex-1 flex items-center justify-center gap-4 relative" :class="{ 'active': true, 'completed': false }">
          <div class="w-7 h-7 rounded-[8px] bg-[#0b7cff] text-white flex items-center justify-center text-[13px] font-semibold flex-shrink-0 relative z-10 shadow-[0_4px_10px_rgba(11,124,255,0.18)]">1</div>
          <div class="w-[170px]">
            <div class="text-[13px] font-semibold text-[#0b7cff]">配置批改参数</div>
            <div class="text-[11px] text-[#9aa4b2]">选择评分标准和期望分数</div>
          </div>
          <div class="absolute top-1/2 left-[calc(50%+104px)] right-[-22px] h-px bg-[#0b7cff] -translate-y-1/2"></div>
        </div>
        <div class="flex-1 flex items-center justify-center gap-4 relative">
          <div class="w-7 h-7 rounded-[8px] bg-[#eef2f7] text-[#667085] flex items-center justify-center text-[13px] font-semibold flex-shrink-0 relative z-10">2</div>
          <div class="w-[170px]">
            <div class="text-[13px] font-semibold text-[#1d1d1f]">上传作业文件</div>
            <div class="text-[11px] text-[#9aa4b2]">支持 PDF、DOC 格式</div>
          </div>
          <div class="absolute top-1/2 left-[calc(50%+104px)] right-[-22px] h-px bg-[#e5e7eb] -translate-y-1/2"></div>
        </div>
        <div class="flex-1 flex items-center justify-center gap-4 relative">
          <div class="w-7 h-7 rounded-[8px] bg-[#eef2f7] text-[#667085] flex items-center justify-center text-[13px] font-semibold flex-shrink-0 relative z-10">3</div>
          <div class="w-[170px]">
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
              <span class="text-[#c44b3f]">*</span> 评分标准
            </label>
            <UiSelect v-model="createForm.rubricId" @change="formErrors.rubricId = ''"
              class="h-11 px-4 rounded-[10px] bg-[#f5f5f7] border text-sm outline-none appearance-none cursor-pointer text-[#1d1d1f] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/10 transition-all"
              :class="formErrors.rubricId ? 'border-[#ff3b30]' : 'border-black/[0.1]'">
              <UiOption value="" disabled selected>选择评分标准</UiOption>
              <UiOption v-for="r in rubrics" :key="r.id" :value="r.id">{{ r.name }}</UiOption>
            </UiSelect>
            <div v-if="formErrors.rubricId" class="text-[12px] text-[#ff3b30] mt-1">{{ formErrors.rubricId }}</div>
          </div>

          <!-- 教师署名 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-[13px] font-medium text-[#6e6e73]">
                <span class="text-[#c44b3f]">*</span> 教师署名
              </label>
              <button type="button" @click="sigManageOpen = true"
                class="text-[12px] text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] cursor-pointer bg-transparent border-none transition-colors">
                管理署名
              </button>
            </div>
            <div class="flex gap-2">
              <UiSelect v-model="createForm.teacherSignature" clearable @change="formErrors.teacherSignature = ''"
                placeholder="选择署名"
                class="h-11 flex-1 px-4 rounded-[10px] bg-[#f5f5f7] border text-sm outline-none appearance-none cursor-pointer text-[#1d1d1f] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/10 transition-all"
                :class="formErrors.teacherSignature ? 'border-[#ff3b30]' : 'border-black/[0.1]'">
                <UiOption v-for="s in savedSignatures" :key="s.id" :value="s.signature">{{ s.signature }}</UiOption>
              </UiSelect>
              <button type="button" @click="showNewSigInput = true"
                class="h-11 w-11 flex items-center justify-center rounded-[10px] bg-[#f5f5f7] border border-black/[0.1] text-[var(--app-primary)] hover:bg-[var(--app-primary)] hover:text-white cursor-pointer transition-all"
                title="新增署名">
                <LucideIcon name="plus" :size="18" />
              </button>
            </div>
            <div v-if="formErrors.teacherSignature" class="text-[12px] text-[#ff3b30] mt-1">{{ formErrors.teacherSignature }}</div>
            <div v-if="showNewSigInput" class="flex gap-2">
              <UiInput v-model="newSignature" maxlength="32" placeholder="输入新署名"
                class="h-10 flex-1 px-3 rounded-[10px] bg-[#f5f5f7] border border-black/[0.1] text-sm outline-none text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/10 transition-all"
                @keyup.enter="confirmNewSignature" />
              <UiButton type="primary" @click="confirmNewSignature"
                class="h-10 px-4 rounded-[10px] text-sm font-medium text-white bg-[var(--app-primary)] border-none cursor-pointer hover:bg-[#0062cc] transition-colors">
                确定
              </UiButton>
              <UiButton @click="showNewSigInput = false; newSignature = ''"
                class="h-10 px-3 rounded-[10px] text-sm font-medium text-[#6e6e73] bg-[#f5f5f7] border-none cursor-pointer hover:bg-[#e8e8ed] transition-colors">
                取消
              </UiButton>
            </div>
          </div>
        </div>

        <!-- 批次名称 -->
        <div class="flex flex-col gap-2">
          <label class="text-[13px] font-medium text-[#6e6e73]">批次名称</label>
          <UiInput v-model="createForm.batchName" maxlength="64" placeholder="例如：第三次作业（不填则自动命名）"
            class="h-11 px-4 rounded-[10px] bg-[#f5f5f7] border border-black/[0.1] text-sm outline-none text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/10 transition-all" />
        </div>

        <!-- 分数区间 - 可视化版 -->
        <div class="rounded-[12px] border border-[#e5eaf2] bg-white px-5 py-4">
          <div class="flex items-start justify-between gap-6">
            <span class="text-[13px] font-medium text-[#475467] pt-2">
              <span class="text-[#c44b3f]">*</span> 期望分数区间
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
            <span class="text-[#c44b3f]">*</span> 上传作业文件
          </label>
          <ui-upload ref="uploadRef" v-model:file-list="fileList" :auto-upload="false" :on-change="onFileChange"
                     accept=".pdf,.docx,.doc" multiple drag :on-remove="onFileRemove"
                     class="upload-flow-wrapper w-full"
                     :class="formErrors.files ? 'upload-error' : ''">
            <div class="flex items-center justify-center gap-7 px-8 py-6 w-full">
              <div class="w-16 h-16 bg-[#edf5ff] rounded-[14px] flex items-center justify-center text-[#0b7cff] shadow-[inset_0_0_0_1px_rgba(11,124,255,0.06)]">
                <LucideIcon name="cloud-upload" :size="34" />
              </div>
              <div class="min-w-0">
                <div class="text-[15px] font-semibold text-[#101828] mb-2">
                  拖拽作业文件到此处，或 <span class="text-[#0b7cff]">点击选择</span>
                </div>
                <div class="text-[13px] text-[#667085] mb-3">支持批量上传，AI 将自动识别并批改</div>
                <div class="flex flex-wrap items-center gap-2 text-[12px] text-[#667085]">
                  <span class="inline-flex h-7 items-center rounded-[7px] bg-[#eef2f6] px-3 font-medium">PDF</span>
                  <span class="inline-flex h-7 items-center rounded-[7px] bg-[#eef2f6] px-3 font-medium">DOC</span>
                  <span class="inline-flex h-7 items-center rounded-[7px] bg-[#eef2f6] px-3 font-medium">DOCX</span>
                </div>
              </div>
            </div>
          </ui-upload>
          <div v-if="formErrors.files" class="text-[12px] text-[#ff3b30] mt-2">{{ formErrors.files }}</div>

          <div v-if="fileList.length" class="mt-4">
            <div class="mb-2 flex items-center justify-between text-[13px]">
              <span class="font-medium text-[#101828]">已选文件（{{ fileList.length }} 个）</span>
              <button type="button" class="text-[#667085] hover:text-[#c44b3f]" @click="clearSelectedFiles">清空</button>
            </div>
            <div class="overflow-hidden rounded-[8px] border border-[#e4e7ec] bg-white">
              <div class="grid grid-cols-[1fr_140px_90px] items-center bg-[#f8fafc] px-4 py-2.5 text-[12px] font-medium text-[#667085]">
                <span>文件名</span>
                <span class="text-center">大小</span>
                <span class="text-center">操作</span>
              </div>
              <div v-for="file in fileList" :key="file.uid || file.name"
                class="grid grid-cols-[1fr_140px_90px] items-center border-t border-[#edf0f5] px-4 py-3 text-[13px]">
                <div class="flex min-w-0 items-center gap-2">
                  <span :class="['inline-flex h-7 min-w-8 shrink-0 items-center justify-center rounded-[4px] px-1.5 text-[8px] font-bold leading-none text-white', fileTypeBadgeClass(file)]">
                    {{ fileTypeLabel(file) }}
                  </span>
                  <span class="min-w-0 flex-1 truncate text-[#344054]">{{ file.name }}</span>
                </div>
                <span class="text-center text-[13px] text-[#344054]">{{ formatFileSize(file.size || file.raw?.size) }}</span>
                <button type="button" class="justify-self-center text-[#c44b3f] hover:text-[#d92d20]" @click="removeSelectedFile(file)">
                  <LucideIcon name="trash-2" :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 流程操作按钮 -->
        <div class="flex items-center justify-between pt-5 border-t border-[#edf0f5]">
          <UiButton @click="rubricManageOpen = true"
            class="h-11 px-5 rounded-[10px] text-[14px] font-medium text-[#344054] bg-white hover:bg-[#f8fafc] active:scale-[0.98] transition-all cursor-pointer border border-[#d0d5dd] shadow-none">
            管理评分标准
          </UiButton>
          <UiButton type="primary" @click="submitTask"
            :disabled="submitting"
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

      <!-- 批次筛选与导出工具栏 -->
      <div class="flex items-center gap-3 flex-wrap mb-4 p-3 bg-white rounded-[12px] border border-black/[0.06]">
        <UiSelect v-model="batchFilter"
          class="h-9 min-w-[220px] px-3 rounded-[8px] bg-[#f5f5f7] border border-black/[0.1] text-[13px] outline-none appearance-none cursor-pointer text-[#1d1d1f]">
          <UiOption value="">全部批次</UiOption>
          <UiOption v-for="b in batches" :key="b.batchId" :value="b.batchId">
            {{ b.name }}{{ b.displayCode ? `（${b.displayCode}）` : '' }} · {{ b.completedTaskCount }}/{{ b.taskCount }} 完成
          </UiOption>
        </UiSelect>
        <button :disabled="exportingBatch" @click="exportBatchExcelAction"
          class="h-9 px-4 rounded-[8px] bg-[#0b7cff] text-white text-[13px] font-medium border-none cursor-pointer hover:bg-[#006ee6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {{ exportingBatch ? '导出中...' : (batchFilter ? '导出批次 Excel' : '导出全部已完成 Excel') }}
        </button>
        <div class="w-px h-5 bg-[#e5e7eb]"></div>
        <span class="text-[13px] text-[#6e6e73]">已勾选 {{ selectedTaskIds.length }} 个任务</span>
        <button :disabled="!selectedTaskIds.length || exportingMerged" @click="exportSelectedExcelAction"
          class="h-9 px-4 rounded-[8px] bg-[#e8f8ed] text-[#1f9d4d] text-[13px] font-medium border-none cursor-pointer hover:bg-[#d4f5e0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {{ exportingMerged ? '导出中...' : '合并导出 Excel' }}
        </button>
        <button v-if="selectedTaskIds.length" @click="selectedTaskIds = []"
          class="h-9 px-3 rounded-[8px] bg-[#f5f5f7] text-[#6e6e73] text-[13px] font-medium border-none cursor-pointer hover:bg-[#e8e8ed] transition-colors">
          清空勾选
        </button>
        <span class="text-[12px] text-[#aeaeb2]">仅已完成的任务可勾选，导出为一个合并 Excel（概览 + 成绩汇总）</span>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12 bg-white rounded-[12px] border border-black/[0.06]">
        <svg class="animate-spin h-6 w-6 text-[var(--app-primary)]" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>

      <!-- 任务列表 -->
      <div v-else-if="displayedTasks.length > 0" class="flex flex-col gap-3">
        <div v-for="row in displayedTasks" :key="row.taskId"
          class="flex items-center gap-4 p-4 bg-white rounded-[12px] border border-black/[0.06] hover:border-[var(--app-primary)]/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
          <!-- 勾选框 -->
          <input type="checkbox" :disabled="row.status !== 'COMPLETED'"
            :checked="selectedTaskIds.includes(row.taskId)" @change="toggleSelect(row)"
            class="w-4 h-4 flex-shrink-0 accent-[#0b7cff] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            :title="row.status === 'COMPLETED' ? '勾选后可合并导出 Excel' : '仅已完成任务可勾选'" />
          <!-- 状态图标 -->
          <div class="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0"
            :class="{
              'bg-[#fff3e0] text-[#c49a3c]': row.status === 'PROCESSING',
              'bg-[#e8f8ed] text-[#30d158]': row.status === 'COMPLETED',
              'bg-[#f5f5f7] text-[#6e6e73]': row.status === 'PENDING',
              'bg-[#ffeeed] text-[#c44b3f]': row.status === 'FAILED'
            }">
            <LucideIcon v-if="row.status === 'PROCESSING'" name="loader" :size="20" />
            <LucideIcon v-else-if="row.status === 'COMPLETED'" name="check" :size="20" />
            <LucideIcon v-else-if="row.status === 'FAILED'" name="alert-triangle" :size="20" />
            <LucideIcon v-else name="clock" :size="20" />
          </div>

          <!-- 任务信息 -->
          <div class="flex-1 min-w-0">
            <div class="text-[14px] font-medium text-[#1d1d1f] mb-1 truncate">
              {{ row.batchName || row.experimentName || `批改任务 ${row.displayCode || `#${row.taskId}`}` }}
            </div>
            <div class="flex items-center gap-3 text-[12px] text-[#aeaeb2]">
              <span>{{ row.displayCode || `#${row.taskId}` }}</span>
              <span>{{ formatTime(row.createdAt) }}</span>
              <span>{{ row.totalCount }} 份作业</span>
            </div>
          </div>

          <!-- 进度 -->
          <div class="flex items-center gap-2">
            <div class="w-20 h-1 bg-[#e5e5ea] rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300"
                :style="{ width: `${row.totalCount ? Math.round((row.completedCount + row.failedCount) / row.totalCount * 100) : 0}%` }"
                :class="row.failedCount > 0 ? 'bg-[#c44b3f]' : row.status === 'COMPLETED' ? 'bg-[#30d158]' : 'bg-[var(--app-primary)]'">
              </div>
            </div>
            <span class="text-[12px] font-medium text-[#6e6e73] w-10 text-right">
              {{ row.totalCount ? Math.round((row.completedCount + row.failedCount) / row.totalCount * 100) : 0 }}%
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2">
            <button @click="$router.push(`/teacher/grading/detail/${row.taskId}`)"
              class="h-8 px-3 rounded-lg bg-[#eef5ff] text-[var(--app-primary)] text-[12px] font-medium border-none cursor-pointer hover:bg-[#e0edff] transition-colors">
              查看详情
            </button>
            <button v-if="row.failedCount > 0" @click="retryTask(row.taskId)"
              class="h-8 px-3 rounded-lg bg-[#fff3e0] text-[#c49a3c] text-[12px] font-medium border-none cursor-pointer hover:bg-[#ffe8cc] transition-colors">
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

    <!-- 评分标准管理弹窗 -->
    <AppModal v-model="rubricManageOpen" title="评分标准管理" width="900px" @close="loadRubrics">
      <RubricManager embedded @saved="loadRubrics" />
    </AppModal>

    <!-- 署名管理弹窗 -->
    <AppModal v-model="sigManageOpen" title="管理署名" width="420px">
      <div class="space-y-3">
        <div v-for="(sig, i) in savedSignatures" :key="i"
          class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] group">
          <span class="flex-1 text-[14px] text-[#1d1d1f]">{{ sig.signature }}</span>
          <button @click="removeSignature(i)"
            class="opacity-0 group-hover:opacity-100 text-[#c44b3f] hover:text-[#d92d20] cursor-pointer bg-transparent border-none transition-all">
            <LucideIcon name="x" :size="16" />
          </button>
        </div>
        <div v-if="!savedSignatures.length" class="py-6 text-center text-[13px] text-[#aeaeb2]">
          暂无保存的署名，创建批改任务时会自动保存
        </div>
        <div class="flex gap-2 pt-2">
          <UiInput v-model="newSignature" maxlength="32" placeholder="输入新署名"
            class="flex-1 h-9 px-3 rounded-[10px] bg-white border border-black/[0.1] text-sm outline-none text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/10 transition-all"
            @keyup.enter="addSignature" />
          <UiButton type="primary" @click="addSignature"
            class="h-9 px-4 rounded-[10px] text-sm font-medium text-white bg-[var(--app-primary)] border-none cursor-pointer hover:bg-[#0062cc] transition-colors">
            添加
          </UiButton>
        </div>
      </div>
      <template #footer>
        <UiButton @click="sigManageOpen = false"
          class="h-9 px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none">
          关闭
        </UiButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage, messageBox } from '@/services/feedback'
import { getRubrics, normalizeRubricList, getGradingTasks, createGradingTask, retryGradingTask, exportGradingTask, deleteGradingTask, getTeacherSignatures, addTeacherSignature, deleteTeacherSignature, normalizeSignatureList, getGradingBatches, exportGradingBatchExcel, exportMergedGradingExcel } from '@/api/tap'
import LucideIcon from '@/components/LucideIcon.vue'
import AppModal from '@/components/AppModal.vue'
import RubricManager from '@/components/RubricManager.vue'

const rubrics = ref([])
const tasks = ref([])
const loading = ref(false)
const submitting = ref(false)
const fileList = ref([])
const uploadRef = ref(null)
const createForm = ref({ rubricId: null, experimentId: '', classId: '', teacherSignature: '', scoreRange: [75, 99], batchName: '' })
const formErrors = ref({ rubricId: '', teacherSignature: '', files: '' })
let refreshTimer = null

// ---- 批次与多选导出 ----
const batches = ref([]) // [{batchId, displayCode, name, taskCount, completedTaskCount, createdAt}]
const batchFilter = ref('')
const selectedTaskIds = ref([])
const exportingBatch = ref(false)
const exportingMerged = ref(false)

const displayedTasks = computed(() => {
  if (!batchFilter.value) return tasks.value
  return tasks.value.filter(t => t.batchId === batchFilter.value)
})

async function loadBatches() {
  try {
    const res = await getGradingBatches()
    const data = res?.data ?? res
    batches.value = data?.content || []
  } catch (e) { logger.error('加载批次列表失败:', e) }
}

function toggleSelect(row) {
  const id = row.taskId
  if (selectedTaskIds.value.includes(id)) {
    selectedTaskIds.value = selectedTaskIds.value.filter(x => x !== id)
  } else {
    selectedTaskIds.value = [...selectedTaskIds.value, id]
  }
}

function downloadExcelBlob(data, filename) {
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

async function readExportError(e) {
  try {
    const data = e?.response?.data
    if (data instanceof Blob) {
      const text = await data.text()
      const json = JSON.parse(text)
      if (json?.message) return json.message
    }
  } catch { /* fall through */ }
  return e?.message || '导出失败'
}

async function exportBatchExcelAction() {
  exportingBatch.value = true
  try {
    if (batchFilter.value) {
      const batch = batches.value.find(b => b.batchId === batchFilter.value)
      const res = await exportGradingBatchExcel(batchFilter.value)
      const code = batch?.displayCode || batchFilter.value
      downloadExcelBlob(res, `批改成绩-批次${code}.xlsx`)
      uiMessage.success('批次 Excel 已导出')
    } else {
      // 全部批次：导出当前列表中所有已完成任务的合并 Excel
      const completedIds = tasks.value.filter(t => t.status === 'COMPLETED').map(t => t.taskId)
      if (!completedIds.length) {
        uiMessage.warning('当前没有已完成的批改任务可导出')
        exportingBatch.value = false
        return
      }
      const res = await exportMergedGradingExcel(completedIds)
      const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
      downloadExcelBlob(res, `批改成绩-全部已完成-${stamp}.xlsx`)
      uiMessage.success('全部已完成任务的 Excel 已导出')
    }
  } catch (e) {
    uiMessage.error(await readExportError(e))
  }
  exportingBatch.value = false
}

async function exportSelectedExcelAction() {
  if (!selectedTaskIds.value.length) return
  exportingMerged.value = true
  try {
    const res = await exportMergedGradingExcel(selectedTaskIds.value)
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
    downloadExcelBlob(res, `批改成绩-合并导出-${stamp}.xlsx`)
    uiMessage.success('合并 Excel 已导出')
  } catch (e) {
    uiMessage.error(await readExportError(e))
  }
  exportingMerged.value = false
}
// ---- 批次与多选导出结束 ----

// ---- 署名管理 ----
const savedSignatures = ref([]) // [{id, signature, createdAt}]
const sigManageOpen = ref(false)
const rubricManageOpen = ref(false)
const showNewSigInput = ref(false)
const newSignature = ref('')

async function loadSignatures() {
  try {
    const res = await getTeacherSignatures()
    savedSignatures.value = normalizeSignatureList(res)
  } catch (e) { logger.error('加载署名失败:', e) }
}

async function confirmNewSignature() {
  const sig = newSignature.value.trim()
  if (!sig) return
  try {
    await addTeacherSignature(sig)
    await loadSignatures()
    createForm.value.teacherSignature = sig
    formErrors.value.teacherSignature = ''
  } catch (e) {
    uiMessage.error(e.message || '添加署名失败')
  }
  newSignature.value = ''
  showNewSigInput.value = false
}

async function addSignature() {
  const sig = newSignature.value.trim()
  if (!sig) return
  try {
    await addTeacherSignature(sig)
    await loadSignatures()
    newSignature.value = ''
    uiMessage.success('署名已添加')
  } catch (e) {
    uiMessage.error(e.message || '添加署名失败')
  }
}

async function removeSignature(index) {
  const sig = savedSignatures.value[index]
  if (!sig?.id) return
  try {
    await deleteTeacherSignature(sig.id)
    await loadSignatures()
    if (createForm.value.teacherSignature === sig.signature) {
      createForm.value.teacherSignature = ''
    }
    uiMessage.success('署名已删除')
  } catch (e) {
    uiMessage.error(e.message || '删除署名失败')
  }
}
// ---- 署名管理结束 ----

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
  if (fileList.value.length > 0) formErrors.value.files = ''
}

function onFileRemove(_, list) {
  fileList.value = normalizeUploadList(list)
  if (fileList.value.length === 0) formErrors.value.files = '请上传作业文件'
}

function removeSelectedFile(file) {
  fileList.value = fileList.value.filter(item => {
    if (item === file) return false
    if (file.uid && item.uid === file.uid) return false
    return true
  })
  if (fileList.value.length === 0) formErrors.value.files = '请上传作业文件'
}

function clearSelectedFiles() {
  fileList.value = []
  formErrors.value.files = ''
  uploadRef.value?.clearFiles?.()
}

function formatFileSize(size) {
  const bytes = Number(size || 0)
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function getUploadFileName(file) {
  return String(file?.name || file?.raw?.name || file?.file?.name || '')
}

function fileTypeLabel(file) {
  const name = getUploadFileName(file)
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : ''
  if (ext === 'pdf') return 'PDF'
  if (ext === 'doc') return 'DOC'
  if (ext === 'docx') return 'DOCX'
  return ext ? ext.toUpperCase().slice(0, 5) : 'FILE'
}

function fileTypeBadgeClass(file) {
  const type = fileTypeLabel(file)
  if (type === 'PDF') return 'bg-[#c44b3f]'
  if (type === 'DOC' || type === 'DOCX') return 'bg-[#2563eb]'
  return 'bg-[#667085]'
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

function validateForm() {
  formErrors.value = { rubricId: '', teacherSignature: '', files: '' }
  let valid = true
  if (!createForm.value.rubricId) {
    formErrors.value.rubricId = '请选择评分标准'
    valid = false
  }
  if (!createForm.value.teacherSignature?.trim()) {
    formErrors.value.teacherSignature = '请选择教师署名'
    valid = false
  }
  if (fileList.value.length === 0) {
    formErrors.value.files = '请上传作业文件'
    valid = false
  }
  return valid
}

async function submitTask() {
  if (!validateForm()) {
    uiMessage.error('请完善必填项后再开始批改')
    return
  }
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
    if (createForm.value.batchName?.trim()) {
      fd.append('batchName', createForm.value.batchName.trim())
    }
    await createGradingTask(fd)
    uiMessage.success('批改任务已创建，AI 正在处理中...')
    clearSelectedFiles()
    createForm.value.teacherSignature = ''
    createForm.value.batchName = ''
    loadTasks()
    loadBatches()
  } catch (e) { uiMessage.error('创建失败: ' + e.message) }
  submitting.value = false
}

async function loadTasks() {
  loading.value = true
  try {
    const res = await getGradingTasks()
    const data = res?.data ?? res
    tasks.value = data?.content || (Array.isArray(data) ? data : [])
    const completedIds = new Set(tasks.value.filter(t => t.status === 'COMPLETED').map(t => t.taskId))
    selectedTaskIds.value = selectedTaskIds.value.filter(id => completedIds.has(id))
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
    loadBatches()
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

async function loadRubrics() {
  try {
    const res = await getRubrics()
    rubrics.value = normalizeRubricList(res)
  } catch (e) { logger.error('加载评分标准失败:', e) }
}

onMounted(() => {
  loadRubrics()
  loadSignatures()
  loadTasks()
  loadBatches()
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
  min-height: 142px;
  border-color: #8ec5ff !important;
  border-style: dashed !important;
  border-width: 1.5px !important;
  border-radius: 14px !important;
  background: #fff !important;
  padding: 0 !important;
}
:deep(.upload-flow-wrapper > div:first-of-type:hover) {
  border-color: #0b7cff !important;
  background: #f8fbff !important;
}
:deep(.upload-flow-wrapper.upload-error > div:first-of-type) {
  border-color: #ff3b30 !important;
  background: #fff5f5 !important;
}
</style>
