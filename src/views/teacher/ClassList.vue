<template>
  <div class="min-h-full overflow-y-auto">
    <UiPageHeader
      class="mb-3"
      title="班级管理"
      description="管理教学班级、学生信息与 PTA 同步设置，首屏卡片会根据内容自动伸展。"
    >
      <UiButton
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-1.5"
        @click="openCreateDialog"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        新增班级
      </UiButton>
    </UiPageHeader>

    <!-- Cookie expired alert -->
    <div
      v-if="cookieStatus === 'EXPIRED'"
      class="mb-5 rounded-[18px] bg-[#fef7e0] border border-[#f5d76e]/40 p-4 flex items-center gap-3"
    >
      <svg class="w-5 h-5 text-[#b26a00] shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
      <div class="flex-1 flex items-center justify-between gap-3 flex-wrap text-[13px] leading-relaxed text-[#7a5200]">
        <span>PTA 登录凭证已过期。系统自动登录失败。可以手动更新Cookie，也可以在"个人资料"绑定PTA 账号，或在发起同步时临时输入账号密码。</span>
        <UiButton
          class="h-[32px] px-4 rounded-[10px] text-xs font-medium text-[#7a5200] bg-[#f5d76e]/30 hover:bg-[#f5d76e]/50 active:scale-[0.96] transition-all cursor-pointer border border-[#f5d76e]/60"
          @click="openCookieDialog"
        >更新 Cookie</UiButton>
      </div>
    </div>

    <!-- Class cards area -->
    <div class="pb-6 relative">
      <!-- Loading overlay -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-[20px] z-10">
        <div class="w-8 h-8 border-[3px] border-[var(--app-primary)]/20 border-t-[var(--app-primary)] rounded-full animate-spin"></div>
      </div>

      <!-- Empty state -->
      <div v-if="classes.length === 0 && !loading" class="flex flex-col items-center justify-center py-20 text-center">
        <svg class="w-16 h-16 text-[#c7c7cc] mb-4" viewBox="0 0 24 24" fill="none"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <p class="text-[#86868b] text-sm mb-4">暂无班级，点击上方按钮创建</p>
        <UiButton
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none"
          @click="openCreateDialog"
        >创建第一个班级</UiButton>
      </div>

      <!-- Class grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          v-for="cls in classes"
          :key="cls.id"
          class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 flex flex-col min-h-[380px] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all"
        >
          <!-- Card header -->
          <div class="flex justify-between items-start gap-3 mb-4 pb-3 border-b border-black/[0.06]">
            <div class="min-w-0 flex-1">
              <h3 class="m-0 text-[22px] leading-tight font-semibold text-[#1d1d1f] break-words">{{ displayClassName(cls) }}</h3>
              <div class="flex flex-wrap gap-2 mt-3">
                <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] text-xs font-semibold">{{ displayGrade(cls) }}</span>
                <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-[#7e9db7]/12 text-[#5c7188] text-xs font-semibold">{{ studentCountValue(cls) }} 人</span>
              </div>
            </div>
            <!-- Dropdown menu -->
            <div :ref="el => setDropdownRef(cls.id, el)" class="relative shrink-0">
              <button
                type="button"
                aria-label="班级操作"
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#dbe5f0] bg-white text-[#64748b] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-[#b8c7d6] hover:bg-[#f8fafc] hover:text-[#1f2a3d] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-primary)]/15"
                @click.stop="toggleDropdown(cls.id)"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 6.5h.01M12 12h.01M12 17.5h.01" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <Transition
                enter-active-class="transition-all duration-150 ease-out"
                enter-from-class="-translate-y-1 scale-95 opacity-0"
                enter-to-class="translate-y-0 scale-100 opacity-100"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="translate-y-0 scale-100 opacity-100"
                leave-to-class="-translate-y-1 scale-95 opacity-0"
              >
                <div
                  v-if="openDropdownId === cls.id"
                  class="absolute right-0 top-full mt-1 w-36 bg-white/95 backdrop-blur-xl rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_1px_rgba(0,0,0,0.1)] border border-black/[0.06] py-1 z-50 overflow-hidden"
                >
                  <UiButton class="w-full text-left px-4 py-2 text-sm text-[#1d1d1f] hover:bg-black/5 transition-colors cursor-pointer border-none bg-transparent" @click="editClass(cls); closeDropdown()">编辑班级</UiButton>
                  <UiButton class="w-full text-left px-4 py-2 text-sm text-[#1d1d1f] hover:bg-black/5 transition-colors cursor-pointer border-none bg-transparent" @click="manageStudents(cls); closeDropdown()">学生管理</UiButton>
                  <div class="h-px bg-black/[0.06] my-1"></div>
                  <UiButton class="w-full text-left px-4 py-2 text-sm text-[#c44b3f] hover:bg-[#c44b3f]/5 transition-colors cursor-pointer border-none bg-transparent" @click="confirmDelete(cls); closeDropdown()">删除班级</UiButton>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Summary chips -->
          <div class="flex flex-wrap gap-3 mb-4">
            <div class="inline-flex items-center gap-2 px-3.5 py-3 rounded-[16px] bg-[#f4f8fd]/90 border border-[#e3ebf5] text-[#34475d] text-sm leading-relaxed break-words min-w-[min(280px,100%)]">
              <span class="text-[#8091a5] text-xs whitespace-nowrap">班级号</span>
              <strong>{{ displayClassCode(cls) }}</strong>
              <UiButton class="text-[var(--app-primary)] text-xs hover:underline cursor-pointer border-none bg-transparent p-0" @click="copyCode(displayClassCode(cls))">复制</UiButton>
            </div>
            <div v-if="hasPtaConfig(cls)" class="inline-flex items-center gap-2 px-3.5 py-3 rounded-[16px] bg-[#f4f8fd]/90 border border-[#e3ebf5] text-[#34475d] text-sm leading-relaxed break-words min-w-[min(280px,100%)]">
              <span class="text-[#8091a5] text-xs whitespace-nowrap">PTA 同步</span>
              <span :class="syncTagClasses(cls.syncStatus)">{{ syncStatusText(cls.syncStatus) }}</span>
              <span v-if="cls.lastSyncAt" class="text-xs text-[#8b9bae]">{{ formatTime(cls.lastSyncAt) }}</span>
            </div>
          </div>

          <!-- Info grid -->
          <div class="grid grid-cols-2 gap-3.5 mb-4">
            <div class="flex flex-col gap-2 p-3.5 rounded-[18px] bg-white/80 border border-[#e8eef6] min-h-[100px]">
              <span class="text-xs font-semibold text-[#8092a6]">加入密码</span>
              <span class="font-medium text-[#24384f] text-sm leading-relaxed break-words">{{ displayJoinPassword(cls) }}</span>
            </div>
            <div class="flex flex-col gap-2 p-3.5 rounded-[18px] bg-white/80 border border-[#e8eef6] min-h-[100px]">
              <span class="text-xs font-semibold text-[#8092a6]">课程</span>
              <span class="font-medium text-[#24384f] text-sm leading-relaxed break-words">{{ displayCourseName(cls) }}</span>
            </div>
            <div class="flex flex-col gap-2 p-3.5 rounded-[18px] bg-white/80 border border-[#e8eef6] min-h-[100px]">
              <span class="text-xs font-semibold text-[#8092a6]">描述</span>
              <span class="font-medium text-[#24384f] text-sm leading-relaxed break-words">{{ displayDescription(cls) }}</span>
            </div>
            <div class="flex flex-col gap-2 p-3.5 rounded-[18px] bg-white/80 border border-[#e8eef6] min-h-[100px]">
              <span class="text-xs font-semibold text-[#8092a6]">PTA 用户组</span>
              <span class="font-medium text-[#24384f] text-sm leading-relaxed break-words">{{ displayPtaKeyword(cls) }}</span>
            </div>
          </div>

          <!-- Card actions -->
          <div class="flex justify-between gap-2.5 mt-auto flex-wrap pt-1.5">
            <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" @click="enterClassSpace(cls)">进入教学班</UiButton>
            <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="manageStudents(cls)">学生管理</UiButton>
            <UiButton
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#34a853] bg-[#e6f4ea] hover:bg-[#d4edda] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50"
              :disabled="importingMap[cls.id]"
              @click="importStudentsForClass(cls)"
            >
              <span v-if="importingMap[cls.id]" class="inline-flex items-center gap-1.5"><span class="w-3.5 h-3.5 border-2 border-[#34a853]/30 border-t-[#34a853] rounded-full animate-spin"></span>导入中...</span>
              <span v-else>导入 PTA 学生</span>
            </UiButton>
            <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="viewAnalysis(cls)">班级分析</UiButton>
            <UiButton
              v-if="hasPtaConfig(cls)"
              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#b26a00] bg-[#fef7e0] hover:bg-[#fdf0c8] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50"
              :disabled="syncingMap[cls.id] || cls.syncStatus === 'RUNNING'"
              @click="openSyncDialog(cls)"
            >
              <span v-if="syncingMap[cls.id]" class="inline-flex items-center gap-1.5"><span class="w-3.5 h-3.5 border-2 border-[#b26a00]/30 border-t-[#b26a00] rounded-full animate-spin"></span>同步中...</span>
              <span v-else>{{ cls.syncStatus === 'RUNNING' ? '同步中...' : '立即同步' }}</span>
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog 1: Create/Edit Class -->
    <AppModal v-model="classDialogVisible" :title="editingClass ? '编辑班级' : '新增班级'" width="520px">
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">班级名称 <span class="text-[#c44b3f]">*</span></label>
          <UiInput
            v-model="classForm.name"
            placeholder="例如：计算机科学与技术23 级1 班"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-[#c44b3f]">{{ errors.name }}</p>
        </div>
        <!-- Class code -->
        <div v-if="!editingClass">
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">班级号 <span class="text-[#c44b3f]">*</span></label>
          <div class="flex gap-2">
            <UiInput
              v-model="classForm.classCode"
              placeholder="唯一标识，例如CS2023-01"
              class="flex-1 h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
            />
            <UiButton class="h-10 px-4 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none whitespace-nowrap" @click="generateCode">随机生成</UiButton>
          </div>
          <p v-if="errors.classCode" class="mt-1 text-xs text-[#c44b3f]">{{ errors.classCode }}</p>
        </div>
        <!-- Join password -->
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">加入密码 <span class="text-[#c44b3f]">*</span></label>
          <UiInput
            v-model="classForm.joinPassword"
            type="password"
            placeholder="学生加入班级时需要输入"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
          <p v-if="errors.joinPassword" class="mt-1 text-xs text-[#c44b3f]">{{ errors.joinPassword }}</p>
        </div>
        <!-- Grade -->
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">年级</label>
          <UiSelect
            v-model="classForm.grade"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm appearance-none cursor-pointer"
          >
            <UiOption value="">选择年级</UiOption>
            <UiOption v-for="y in gradeOptions" :key="y" :value="y">{{ y }} 级</UiOption>
          </UiSelect>
        </div>
        <!-- Course name -->
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">课程名称</label>
          <UiInput
            v-model="classForm.courseName"
            placeholder="例如：数据结构"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
        </div>
        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">描述</label>
          <textarea
            v-model="classForm.description"
            rows="3"
            placeholder="可选，用于补充班级说明"
            class="w-full px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-y"
          ></textarea>
        </div>

        <!-- PTA divider -->
        <div class="flex items-center gap-3 pt-2">
          <span class="text-sm font-medium text-[#86868b]">PTA 数据同步</span>
          <div class="flex-1 h-px bg-black/[0.06]"></div>
        </div>

        <!-- PTA user group -->
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">PTA 用户组名</label>
          <UiInput
            v-model="classForm.ptaGroupName"
            placeholder="例如：计科23 数据结构"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
          <p class="mt-1.5 text-xs text-[#7b8ba0]">填写 PTA 用户组名后，可自动同步该用户组授权的实验数据。</p>
        </div>
        <!-- Sync toggle -->
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#dce7f2] bg-[#f8fbff] px-4 py-3">
          <div class="min-w-[128px]">
            <label class="block text-sm font-medium text-[#1d1d1f]">定时同步</label>
            <p class="mt-1 text-xs leading-relaxed text-[#7b8ba0]">{{ syncToggleHelpText }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              role="switch"
              :aria-checked="isClassSyncActive ? 'true' : 'false'"
              :aria-label="`定时同步：${syncToggleStatusText}`"
              :disabled="!canToggleClassSync"
              :class="syncSwitchClasses"
              @click="toggleClassSync"
            >
              <span :class="syncSwitchKnobClasses"></span>
            </button>
            <span :class="syncStatusBadgeClasses">{{ syncToggleStatusText }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="classDialogVisible = false">取消</UiButton>
        <UiButton
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50"
          :disabled="submitting"
          @click="submitClassForm"
        >
          <span v-if="submitting" class="inline-flex items-center gap-1.5"><span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>提交中</span>
          <span v-else>确认</span>
        </UiButton>
      </template>
    </AppModal>

    <!-- Dialog 2: Student Management -->
    <AppModal v-model="studentDialogVisible" :title="`学生管理 - ${displayClassName(currentClass || {})}`" width="720px">
      <div>
        <div class="flex justify-between gap-3 mb-4">
          <UiInput
            v-model="studentSearch"
            placeholder="搜索姓名或学号"
            class="w-full max-w-[260px] h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
          <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none whitespace-nowrap" @click="openAddStudentDialog">添加学生</UiButton>
        </div>

        <!-- Student table -->
        <div class="relative overflow-auto max-h-[420px] rounded-[12px] border border-black/[0.06]">
          <div v-if="studentsLoading" class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
            <div class="w-6 h-6 border-[3px] border-[var(--app-primary)]/20 border-t-[var(--app-primary)] rounded-full animate-spin"></div>
          </div>
          <table class="w-full text-sm border-collapse">
            <thead class="sticky top-0 bg-[#f5f5f7]/95 backdrop-blur-sm">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-[#86868b] text-xs w-14">#</th>
                <th class="text-left px-4 py-3 font-medium text-[#86868b] text-xs w-40">学号</th>
                <th class="text-left px-4 py-3 font-medium text-[#86868b] text-xs w-36">姓名</th>
                <th class="text-left px-4 py-3 font-medium text-[#86868b] text-xs">加入时间</th>
                <th class="text-left px-4 py-3 font-medium text-[#86868b] text-xs w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in filteredStudents" :key="row.id" class="border-t border-black/[0.04] hover:bg-[#f5f5f7]/50 transition-colors">
                <td class="px-4 py-3 text-[#86868b]">{{ idx + 1 }}</td>
                <td class="px-4 py-3 text-[#1d1d1f]">{{ row.studentNum }}</td>
                <td class="px-4 py-3 text-[#1d1d1f]">{{ row.studentName }}</td>
                <td class="px-4 py-3 text-[#6e6e73]">{{ formatTime(row.joinedAt) }}</td>
                <td class="px-4 py-3">
                  <UiButton class="text-[#c44b3f] text-sm hover:underline cursor-pointer border-none bg-transparent p-0" @click="confirmRemoveStudent(row)">移除</UiButton>
                </td>
              </tr>
              <tr v-if="filteredStudents.length === 0 && !studentsLoading">
                <td colspan="5" class="px-4 py-8 text-center text-[#86868b]">暂无学生数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3.5 text-[13px] text-[#7f90a4]">共{{ students.length }} 名学生</p>
      </div>
    </AppModal>

    <!-- Dialog 3: Add Student -->
    <AppModal v-model="addStudentVisible" title="添加学生" width="400px">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">姓名</label>
          <UiInput
            v-model="addStudentForm.studentName"
            placeholder="学生姓名"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">学号</label>
          <UiInput
            v-model="addStudentForm.studentNum"
            placeholder="选填"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
        </div>
      </div>
      <template #footer>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="addStudentVisible = false">取消</UiButton>
        <UiButton
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50"
          :disabled="addingStudent"
          @click="doAddStudent"
        >
          <span v-if="addingStudent" class="inline-flex items-center gap-1.5"><span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>添加中</span>
          <span v-else>确认</span>
        </UiButton>
      </template>
    </AppModal>

    <!-- Dialog 4: PTA Sync -->
    <AppModal v-model="syncDialogVisible" title="PTA 同步账号" width="480px">
      <div class="space-y-4">
        <!-- Info alert -->
        <div class="rounded-[14px] bg-[#e8f4fd] border border-[#b8dcf5]/50 p-3.5 text-[13px] text-[#1a6dab] leading-relaxed">
          优先使用个人资料中已绑定的PTA 账号；这里临时填写的账号密码只覆盖本次同步。若未绑定且这里留空，则只尝试当前Cookie 会话。
        </div>

        <!-- Bound status -->
        <div v-if="hasBoundPtaCredentials" class="rounded-[12px] bg-[#e6f4ea] p-3 text-[13px] text-[#1e8e3e]">
          已绑定PTA 账号：{{ boundPtaUsername }}（留空时将默认用于本次同步）
        </div>
        <div v-else class="rounded-[12px] bg-[#fef7e0] p-3 text-[13px] text-[#b26a00]">
          当前未绑定PTA 账号；若本次留空，则只会尝试现有 Cookie。
        </div>

        <!-- Sync user group -->
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">PTA 用户组名</label>
          <UiInput
            v-model="syncForm.ptaGroupName"
            autocomplete="off"
            placeholder="例如：计科5数据结构"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
        </div>
        <!-- PTA username -->
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">PTA 账号</label>
          <UiInput
            v-model="syncForm.ptaUsername"
            autocomplete="off"
            placeholder="本次同步使用的PTA 账号（可选）"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
        </div>
        <!-- PTA password -->
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">PTA 密码</label>
          <UiInput
            v-model="syncForm.ptaPassword"
            type="password"
            autocomplete="new-password"
            placeholder="本次同步使用的PTA 密码（可选）"
            class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
          />
        </div>

        <!-- Temp credential actions -->
        <div class="flex gap-2">
          <UiButton class="h-[34px] px-4 rounded-[10px] text-xs font-medium text-[var(--app-primary)] bg-[var(--app-primary)]/10 hover:bg-[var(--app-primary)]/15 active:scale-[0.96] transition-all cursor-pointer border-none" @click="submitSyncTempCredential">提交临时账号密码</UiButton>
          <UiButton class="h-[34px] px-4 rounded-[10px] text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="clearSyncTempCredential">清空临时凭据</UiButton>
        </div>

        <div v-if="syncTempCredentialSubmitted" class="rounded-[12px] bg-[#e6f4ea] p-3 text-[13px] text-[#1e8e3e]">
          已提交临时PTA 账号：{{ syncForm.ptaUsername.trim() }}，本次同步将优先使用该账号。
        </div>

        <!-- Credential source -->
        <div class="flex items-center gap-2 text-[13px] text-[#44536b]">
          <span>本次预计使用：</span>
          <span :class="credentialSourceClasses(plannedSyncCredentialSource)">{{ credentialSourceText(plannedSyncCredentialSource) }}</span>
        </div>
      </div>
      <template #footer>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="syncDialogVisible = false">取消</UiButton>
        <UiButton
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50"
          :disabled="syncDialogClass ? syncingMap[syncDialogClass.id] : false"
          @click="triggerSyncForClass"
        >
          <span v-if="syncDialogClass && syncingMap[syncDialogClass.id]" class="inline-flex items-center gap-1.5"><span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>同步中</span>
          <span v-else>开始同步</span>
        </UiButton>
      </template>
    </AppModal>

    <!-- Dialog 5: Cookie Update -->
    <AppModal v-model="cookieDialogVisible" title="手动更新 PTA Cookie" width="600px">
      <div class="space-y-4">
        <!-- Steps indicator -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[var(--app-primary)] text-white text-xs font-semibold flex items-center justify-center">1</span>
            <span class="text-sm font-medium text-[#1d1d1f]">获取 Cookie</span>
          </div>
          <div class="flex-1 h-px bg-black/[0.08] mx-3"></div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[var(--app-primary)] text-white text-xs font-semibold flex items-center justify-center">2</span>
            <span class="text-sm font-medium text-[#1d1d1f]">粘贴到下方</span>
          </div>
          <div class="flex-1 h-px bg-black/[0.08] mx-3"></div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#e5e5ea] text-[#86868b] text-xs font-semibold flex items-center justify-center">3</span>
            <span class="text-sm text-[#86868b]">验证生效</span>
          </div>
        </div>

        <!-- Instructions -->
        <div class="rounded-[14px] bg-[#e8f4fd] border border-[#b8dcf5]/50 p-4">
          <p class="font-semibold text-sm text-[#1a6dab] mb-2">获取步骤</p>
          <ol class="list-decimal pl-5 text-[13px] text-[#4d6077] leading-relaxed space-y-1">
            <li>打开 <a href="https://pintia.cn" target="_blank" rel="noopener noreferrer" class="text-[var(--app-primary)] hover:underline">pintia.cn</a> 并登录。</li>
            <li>按 <code class="px-1.5 py-0.5 rounded bg-black/5 text-xs">F12</code> 打开开发者工具，切换到 <code class="px-1.5 py-0.5 rounded bg-black/5 text-xs">Application</code>。</li>
            <li>在左侧找到 <code class="px-1.5 py-0.5 rounded bg-black/5 text-xs">Cookies</code>，选择 <code class="px-1.5 py-0.5 rounded bg-black/5 text-xs">https://pintia.cn</code>。</li>
            <li>复制导出的Cookie JSON，粘贴到下方输入框。</li>
          </ol>
        </div>

        <!-- Cookie textarea -->
        <textarea
          v-model="cookieInput"
          rows="8"
          placeholder='粘贴 Cookie JSON，例如：[{"name":"PTASession","value":"xxx","domain":".pintia.cn"}]'
          class="w-full px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm resize-y font-mono"
        ></textarea>

        <!-- Result -->
        <div v-if="cookieSubmitResult" :class="['rounded-[12px] p-3 text-[13px] flex items-center gap-2', cookieSubmitResult.valid ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'bg-[#fce8e6] text-[#d93025]']">
          <svg v-if="cookieSubmitResult.valid" class="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>
          <svg v-else class="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/></svg>
          {{ cookieSubmitResult.message }}
        </div>
      </div>
      <template #footer>
        <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="cookieDialogVisible = false">取消</UiButton>
        <UiButton
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50"
          :disabled="cookieSubmitting || !cookieInput.trim()"
          @click="submitCookieForm"
        >
          <span v-if="cookieSubmitting" class="inline-flex items-center gap-1.5"><span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>验证中</span>
          <span v-else>验证并保存</span>
        </UiButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import AppModal from '../../components/AppModal.vue'
import { useFormValidation } from '../../composables/useFormValidation'
import { useUserStore } from '../../store'
import api from '../../api'
import axios from 'axios'
import {
  addClassStudent,
  createTeachingClass,
  deleteTeachingClass,
  getClassStudents,
  getPtaCookieStatus,
  getTeacherPtaCredentials,
  getTeachingClasses,
  importPtaStudents,
  removeClassStudent,
  submitPtaCookie,
  triggerPtaSync,
  updateTeachingClass
} from '../../api/tap'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const classes = ref([])
const gradeOptions = ['2022', '2023', '2024', '2025', '2026', '2027']

const classDialogVisible = ref(false)
const editingClass = ref(null)
const submitting = ref(false)
const classForm = reactive({
  name: '',
  classCode: '',
  joinPassword: '',
  grade: '',
  courseName: '',
  description: '',
  ptaGroupName: '',
  syncEnabled: false
})
const classRules = {
  name: [{ required: true, message: '请输入班级名称' }],
  classCode: [{ required: true, message: '请输入班级号' }],
  joinPassword: [{ required: true, message: '请设置加入密码' }]
}
const { errors, validate, resetFields } = useFormValidation(classRules)

const syncingMap = reactive({})
const importingMap = reactive({})

const studentDialogVisible = ref(false)
const currentClass = ref(null)
const students = ref([])
const studentsLoading = ref(false)
const studentSearch = ref('')

const addStudentVisible = ref(false)
const addStudentForm = reactive({ studentName: '', studentNum: '' })
const addingStudent = ref(false)

const cookieStatus = ref('UNKNOWN')
const cookieDialogVisible = ref(false)
const cookieInput = ref('')
const cookieSubmitting = ref(false)
const cookieSubmitResult = ref(null)
const syncDialogVisible = ref(false)
const syncDialogClass = ref(null)
const syncForm = reactive({ ptaGroupName: '', ptaUsername: '', ptaPassword: '' })
const syncTempCredentialSubmitted = ref(false)
const boundPtaUsername = ref('')
const hasBoundPtaCredentials = ref(false)

// Dropdown state
const openDropdownId = ref(null)
const dropdownRefs = new Map()

const setDropdownRef = (id, el) => {
  if (el) {
    dropdownRefs.set(id, el)
  } else {
    dropdownRefs.delete(id)
  }
}

const toggleDropdown = (id) => {
  openDropdownId.value = openDropdownId.value === id ? null : id
}
const closeDropdown = () => {
  openDropdownId.value = null
}
const handleOutsideClick = (e) => {
  const dropdownEl = dropdownRefs.get(openDropdownId.value)
  if (openDropdownId.value && (!dropdownEl || !dropdownEl.contains(e.target))) {
    closeDropdown()
  }
}
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))

const extract = (res) => res?.data ?? res

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

const spiderRequestConfig = (options = {}) => ({
  withCredentials: false,
  ...options
})

async function probeSpiderHealth() {
  const candidates = []
  const push = (url) => {
    const normalized = normalizeUrl(url)
    if (normalized && !candidates.includes(normalized)) candidates.push(normalized)
  }
  push(spiderUrl.value)
  push(buildDefaultSpiderUrl())
  push('http://localhost:8100')
  push('http://127.0.0.1:8100')

  for (const base of candidates) {
    try {
      const res = await axios.get(`${base}/health`, spiderRequestConfig({ timeout: 3000 }))
      if (res.status === 200) {
        spiderUrl.value = base
        return true
      }
    } catch {
      // try next candidate
    }
  }
  return false
}

const replacementChar = String.fromCharCode(0xfffd)

const isCorruptedText = (value) => {
  const text = String(value || '').trim()
  if (!text) return true
  const mojibakeMarkers = ['鑾', '姝', '鍙', '鍚', '鐢', '鐝', '鏁', '瀹', '澶', '绾', '浣', '鎻', '鎵', '淇', '閿', '绯', '鍓', '褰', '闈', '璇']
  return text.includes('??') || text.includes(replacementChar) || mojibakeMarkers.some(marker => text.includes(marker))
}

const cleanText = (value, fallback = '未设置') => {
  const text = String(value || '').trim()
  if (!text || isCorruptedText(text)) return fallback
  return text
}

const studentCountValue = (cls) => Number(cls?.studentCount || 0)
const getPtaGroupName = (cls) => cls?.ptaGroupName || cls?.pta_group_name || ''
const getPtaGroupId = (cls) => cls?.ptaGroupId || cls?.pta_group_id || ''
const hasPtaConfig = (cls) => {
  const groupName = getPtaGroupName(cls)
  const groupId = getPtaGroupId(cls)
  return (!isCorruptedText(groupName) && !!String(groupName || '').trim()) || !!String(groupId || '').trim()
}

const displayClassCode = (cls) => cleanText(cls?.classCode, '未生成')
const displayClassName = (cls) => cleanText(cls?.name, displayClassCode(cls) === '未生成' ? '未命名班级' : `班级 ${displayClassCode(cls)}`)
const displayCourseName = (cls) => cleanText(cls?.courseName, '课程信息待补充')
const displayDescription = (cls) => cleanText(cls?.description, '暂无描述')
const displayPtaKeyword = (cls) => cleanText(getPtaGroupName(cls), '未配置')
const displayJoinPassword = (cls) => cleanText(cls?.joinPassword, '未设置')
const displayGrade = (cls) => {
  const grade = cleanText(cls?.grade, '')
  return grade ? `${grade} 级` : '未设置年级'
}

const filteredStudents = computed(() => {
  const rows = Array.isArray(students.value) ? students.value : []
  const query = String(studentSearch.value ?? '').trim().toLowerCase()
  if (!query) return rows
  return rows.filter(item =>
    String(item.studentName || '').toLowerCase().includes(query) ||
    String(item.studentNum || '').toLowerCase().includes(query)
  )
})

const resolvePtaGroupName = () => (classForm.ptaGroupName || '').trim()
const canToggleClassSync = computed(() => !!resolvePtaGroupName())
const isClassSyncActive = computed(() => canToggleClassSync.value && !!classForm.syncEnabled)
const syncToggleStatusText = computed(() => isClassSyncActive.value ? '已开启' : '已关闭')
const syncToggleHelpText = computed(() => {
  if (!canToggleClassSync.value) return '填写 PTA 用户组名后可开启定时同步。'
  return isClassSyncActive.value ? '每天凌晨自动同步一次。' : '需要时可开启自动同步。'
})
const syncSwitchClasses = computed(() => [
  'relative inline-flex h-[28px] w-[50px] shrink-0 items-center rounded-full border border-transparent p-0.5 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-[#c2703e]/15',
  canToggleClassSync.value
    ? 'cursor-pointer hover:shadow-[0_2px_8px_rgba(15,23,42,0.12)] active:scale-95'
    : 'cursor-not-allowed opacity-60',
  isClassSyncActive.value
    ? 'bg-[#22c55e] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
    : 'bg-[#d8e0ea] shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]'
])
const syncSwitchKnobClasses = computed(() => [
  'block h-[22px] w-[22px] rounded-full bg-white shadow-[0_2px_6px_rgba(15,23,42,0.24)] transition-transform duration-200 ease-out',
  isClassSyncActive.value ? 'translate-x-[22px]' : 'translate-x-0'
])
const syncStatusBadgeClasses = computed(() => [
  'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold leading-none whitespace-nowrap',
  isClassSyncActive.value
    ? 'bg-[#dcfce7] text-[#15803d]'
    : canToggleClassSync.value
      ? 'bg-[#eef2f7] text-[#64748b]'
      : 'bg-[#f1f5f9] text-[#94a3b8]'
])

function toggleClassSync() {
  if (!canToggleClassSync.value) return
  classForm.syncEnabled = !classForm.syncEnabled
}

const toSelectedClass = (cls) => ({
  id: cls.id,
  name: displayClassName(cls),
  ptaGroupId: getPtaGroupId(cls),
  ptaGroupName: getPtaGroupName(cls),
  ptaKeyword: getPtaGroupName(cls) || cls.ptaKeyword || cls.pta_keyword || ''
})

// Sync tag styling
const syncTagClasses = (status) => {
  const map = {
    SUCCESS: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#1e8e3e]',
    RUNNING: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#fef7e0] text-[#b26a00]',
    FAILED: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#fce8e6] text-[#d93025]',
    IDLE: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#f5f5f7] text-[#86868b]'
  }
  return map[status] || map.IDLE
}

// Credential source styling
const credentialSourceClasses = (source) => {
  const map = {
    temporary: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#fef7e0] text-[#b26a00]',
    bound: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#1e8e3e]',
    cookie: 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#e8f4fd] text-[#1a6dab]'
  }
  return map[String(source || '').trim().toLowerCase()] || map.cookie
}

const loadClasses = async () => {
  loading.value = true
  try {
    const res = await getTeachingClasses()
    classes.value = extract(res) || []
  } catch (error) {
    uiMessage.error(`加载班级失败：${error.message}`)
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingClass.value = null
  Object.assign(classForm, {
    name: '',
    classCode: '',
    joinPassword: '',
    grade: '',
    courseName: '',
    description: '',
    ptaGroupName: '',
    syncEnabled: false
  })
  resetFields()
  classDialogVisible.value = true
}

const editClass = (cls) => {
  editingClass.value = cls
  Object.assign(classForm, {
    name: cleanText(cls.name, ''),
    classCode: cleanText(cls.classCode, ''),
    joinPassword: cleanText(cls.joinPassword, ''),
    grade: cleanText(cls.grade, ''),
    courseName: cleanText(cls.courseName, ''),
    description: cleanText(cls.description, ''),
    ptaGroupName: cleanText(getPtaGroupName(cls), ''),
    syncEnabled: !!cls.syncEnabled
  })
  resetFields()
  classDialogVisible.value = true
}

const generateCode = () => {
  classForm.classCode = `C${Date.now().toString(36).toUpperCase().slice(-6)}`
}

const submitClassForm = async () => {
  if (!validate(classForm)) return

  submitting.value = true
  try {
    const ptaGroupName = resolvePtaGroupName()
    if (editingClass.value) {
      await updateTeachingClass(editingClass.value.id, {
        name: classForm.name,
        joinPassword: classForm.joinPassword,
        grade: classForm.grade,
        courseName: classForm.courseName,
        description: classForm.description,
        ptaGroupName,
        syncEnabled: classForm.syncEnabled
      })
      uiMessage.success('班级更新成功')
    } else {
      const res = await createTeachingClass({ ...classForm, ptaGroupName })
      const created = extract(res)
      if (created?.id) {
        userStore.setSelectedClass(toSelectedClass({
          ...created,
          ptaGroupName: created.ptaGroupName || ptaGroupName || created.name,
          ptaKeyword: created.ptaGroupName || ptaGroupName || created.ptaKeyword || ''
        }))
      }
      uiMessage.success('班级创建成功')
      if (ptaGroupName && created?.id) {
        try {
          await triggerPtaSync(created.id, { ptaGroupName })
          uiMessage.success('已自动触发PTA 数据同步')
        } catch (syncError) {
          uiMessage.warning(`班级已创建，但自动同步失败：${syncError.message || '数据同步服务可能未启动'}`)
        }
      }
    }

    classDialogVisible.value = false
    await loadClasses()
  } catch (error) {
    uiMessage.error(error.message || '保存班级失败')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (cls) => {
  messageBox.confirm(
      `确定删除班级"${displayClassName(cls)}"？此操作不可恢复，班级内学生关系也会一并删除。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteTeachingClass(cls.id)
      uiMessage.success('删除成功')
      await loadClasses()
    } catch (error) {
      uiMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const copyCode = async (code) => {
  if (!code || code === '未生成') return
  try {
    await navigator.clipboard.writeText(code)
    uiMessage.success('班级号已复制')
  } catch {
    uiMessage.warning('复制失败，请手动复制')
  }
}

const enterClassSpace = (cls) => {
  userStore.setSelectedClass(toSelectedClass(cls))
  uiMessage.success(`已切换到 ${displayClassName(cls)}`)
  router.push('/teacher/dashboard')
}

const viewAnalysis = (cls) => {
  userStore.setSelectedClass(toSelectedClass(cls))
  router.push(`/teacher/class-detailed-analysis/${cls.id}`)
}

const syncStatusText = (status) => {
  const textMap = {
    SUCCESS: '已同步',
    RUNNING: '同步中',
    FAILED: '同步失败',
    IDLE: '未同步'
  }
  return textMap[status] || '未同步'
}

const credentialSourceText = (source) => ({
  temporary: '临时账号',
  bound: '已绑定账号',
  cookie: 'Cookie'
}[String(source || '').trim().toLowerCase()] || '未知来源')

const plannedSyncCredentialSource = computed(() => {
  if (syncTempCredentialSubmitted.value && syncForm.ptaUsername.trim() && syncForm.ptaPassword) return 'temporary'
  if (hasBoundPtaCredentials.value) return 'bound'
  return 'cookie'
})

const submitSyncTempCredential = () => {
  const username = syncForm.ptaUsername.trim()
  const password = syncForm.ptaPassword
  if (!username || !password) {
    uiMessage.warning('请先输入完整的临时PTA 账号和密码，再点击提交')
    return
  }
  syncTempCredentialSubmitted.value = true
  uiMessage.success(`已提交临时PTA 账号：${username}`)
}

const clearSyncTempCredential = () => {
  syncForm.ptaUsername = ''
  syncForm.ptaPassword = ''
  syncTempCredentialSubmitted.value = false
}

const triggerSyncForClass = async () => {
  const cls = syncDialogClass.value
  if (!cls) return
  const ptaGroupName = syncForm.ptaGroupName.trim()
  const ptaGroupId = getPtaGroupId(cls)
  const draftUsername = syncForm.ptaUsername.trim()
  const draftPassword = syncForm.ptaPassword
  if (!ptaGroupName && !ptaGroupId) {
    uiMessage.warning('请输入本次同步使用的 PTA 用户组名')
    return
  }
  if ((draftUsername && !draftPassword) || (!draftUsername && draftPassword)) {
    uiMessage.warning('请输入完整的 PTA 账号和密码，或保持两项都为空。')
    return
  }
  if ((draftUsername || draftPassword) && !syncTempCredentialSubmitted.value) {
    uiMessage.warning('若要使用临时 PTA 账号，请先点击"提交临时账号密码"')
    return
  }
  const username = syncTempCredentialSubmitted.value ? draftUsername : ''
  const password = syncTempCredentialSubmitted.value ? draftPassword : ''
  syncingMap[cls.id] = true
  try {
    const spiderAlive = await probeSpiderHealth()
    const credentialSource = plannedSyncCredentialSource.value
    if (spiderAlive && credentialSource === 'cookie' && cookieStatus.value !== 'OK') {
      uiMessage.warning('当前没有有效 Cookie。请填写 PTA 账号密码并点击“提交临时账号密码”，再开始同步以打开浏览器登录。')
      return
    }

    const res = await triggerPtaSync(cls.id, {
        ptaGroupId,
        ptaGroupName,
        mode: 'incremental',
        force: true,
        ...(username ? { ptaUsername: username, ptaPassword: password } : {})
      })
    const data = extract(res) || {}
    cls.ptaGroupId = ptaGroupId
    cls.ptaGroupName = ptaGroupName
    cls.syncStatus = 'RUNNING'
    syncDialogVisible.value = false
    syncForm.ptaGroupName = ''
    clearSyncTempCredential()
    uiMessage.success(`同步任务已提交，本次使用${credentialSourceText(data?.credentialSource || data?.credential_source || plannedSyncCredentialSource.value)}`)
  } catch (error) {
    uiMessage.error(error.message || '同步失败')
  } finally {
    syncingMap[cls.id] = false
  }
}

const manageStudents = async (cls) => {
  currentClass.value = cls
  studentSearch.value = ''
  studentDialogVisible.value = true
  studentsLoading.value = true
  try {
    const res = await getClassStudents(cls.id)
    const data = extract(res)
    students.value = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.list)
          ? data.list
          : []
  } catch (error) {
    uiMessage.error(error.message || '加载学生列表失败')
  } finally {
    studentsLoading.value = false
  }
}

const importStudentsForClass = async (cls) => {
  importingMap[cls.id] = true
  try {
    const res = await importPtaStudents(cls.id)
    const data = extract(res) || {}
    const matched = Number(data.matchedStudentCount || 0)
    const created = Number(data.createdCount || 0)
    const updated = Number(data.updatedCount || 0)

    if (matched === 0) {
      uiMessage.warning(`未找到${displayClassName(cls)} 的已同步 PTA 学生数据`)
    } else {
      uiMessage.success(`已导入${created} 人，更新 ${updated} 人`)
    }

    if (currentClass.value?.id === cls.id && studentDialogVisible.value) {
      const studentRes = await getClassStudents(cls.id)
      students.value = extract(studentRes) || []
    }
    await loadClasses()
  } catch (error) {
    uiMessage.error(error.message || '导入 PTA 学生失败')
  } finally {
    importingMap[cls.id] = false
  }
}

const openAddStudentDialog = () => {
  addStudentForm.studentName = ''
  addStudentForm.studentNum = ''
  addStudentVisible.value = true
}

const doAddStudent = async () => {
  if (!addStudentForm.studentName.trim()) {
    uiMessage.warning('请输入学生姓名')
    return
  }

  if (!addStudentForm.studentNum.trim()) {
    uiMessage.warning('请输入学生账号/学号')
    return
  }

  addingStudent.value = true
  try {
    const studentListRes = await api.getStudentList()
    const studentList = extract(studentListRes) || []
    const inputStudentNum = addStudentForm.studentNum.trim()
    const matchedStudent = studentList.find(item =>
      String(item?.username || item?.studentNum || '').trim() === inputStudentNum
    )

    if (!matchedStudent) {
      uiMessage.warning('没有此学生')
      return
    }

    await addClassStudent(currentClass.value.id, { ...addStudentForm })
    uiMessage.success('添加成功')
    addStudentVisible.value = false
    const res = await getClassStudents(currentClass.value.id)
    students.value = extract(res) || []
    await loadClasses()
  } catch (error) {
    uiMessage.error(error.message || '添加学生失败')
  } finally {
    addingStudent.value = false
  }
}

const confirmRemoveStudent = (row) => {
  messageBox.confirm(`确定移除学生"${row.studentName}"吗？`, '提示', {
    confirmButtonText: '移除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await removeClassStudent(currentClass.value.id, row.id)
      students.value = students.value.filter(item => item.id !== row.id)
      uiMessage.success('已移除')
      await loadClasses()
    } catch (error) {
      uiMessage.error(error.message || '移除失败')
    }
  }).catch(() => {})
}

const formatTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN')
}

const checkCookieStatus = async () => {
  try {
    const res = await getPtaCookieStatus()
    const data = extract(res)
    cookieStatus.value = data?.status || 'UNKNOWN'
  } catch {
    cookieStatus.value = 'UNKNOWN'
  }
}

const loadBoundCredentials = async () => {
  try {
    const res = await getTeacherPtaCredentials()
    const data = extract(res) || {}
    boundPtaUsername.value = data?.ptaUsername || ''
    hasBoundPtaCredentials.value = !!data?.bound
  } catch {
    boundPtaUsername.value = ''
    hasBoundPtaCredentials.value = false
  }
}

const openSyncDialog = (cls) => {
  syncDialogClass.value = cls
  syncForm.ptaGroupName = getPtaGroupName(cls)
  clearSyncTempCredential()
  syncDialogVisible.value = true
}

const openCookieDialog = () => {
  cookieInput.value = ''
  cookieSubmitResult.value = null
  cookieDialogVisible.value = true
}

const submitCookieForm = async () => {
  cookieSubmitting.value = true
  cookieSubmitResult.value = null
  try {
    const res = await submitPtaCookie(cookieInput.value.trim())
    const data = extract(res)
    cookieSubmitResult.value = data
    if (data?.valid) {
      cookieStatus.value = 'OK'
      uiMessage.success('Cookie 更新成功，数据同步已恢复')
      setTimeout(() => {
        cookieDialogVisible.value = false
      }, 1500)
    }
  } catch (error) {
    cookieSubmitResult.value = {
      valid: false,
      message: getFriendlyErrorMessage(error, 'Cookie 提交失败，请稍后重试')
    }
  } finally {
    cookieSubmitting.value = false
  }
}

onMounted(() => {
  loadClasses()
  checkCookieStatus()
  loadBoundCredentials()
})

watch(() => [syncForm.ptaUsername, syncForm.ptaPassword], () => {
  if (syncTempCredentialSubmitted.value) {
    syncTempCredentialSubmitted.value = false
  }
})
</script>
