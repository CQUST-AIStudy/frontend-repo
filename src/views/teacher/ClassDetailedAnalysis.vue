<template>
  <div class="h-full">
    <UiPageHeader
        class="p-5"
        :title="showDetailedAnalysis ? '班级详细分析' : '班级分析'"
        :description="showDetailedAnalysis ? `${currentClassName} - 学习情况与能力趋势` : '查看班级学生的学习情况和能力趋势'"
    >
      <UiButton v-if="showDetailedAnalysis" @click="backToWelcome"
                class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none">
        返回班级列表
      </UiButton>
    </UiPageHeader>

    <div class="px-5 pb-5 bg-[#f5f7fa] rounded-[4px] leading-relaxed">
      <!-- 欢迎页面 - 未选择班级时显示-->
      <div v-if="!showDetailedAnalysis && !loading" class="mb-8">
        <div class="rounded-xl border border-black/[0.06] bg-white/95 px-4 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.05)]">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
                <DataAnalysis class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <h2 class="text-[16px] font-semibold leading-6 text-[#1d1d1f]">班级教学分析平台</h2>
                <p class="truncate text-[13px] leading-5 text-[#6e6e73]">选择教学班级后查看学习情况、能力趋势和AI教学建议</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-[20px] font-semibold text-[#303133]">请选择要分析的班级</h2>
            <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <UiInput
                  v-model="classSearchText"
                  placeholder="搜索班级名称/课程"
                  class="h-10 w-full px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm sm:w-[320px]"
              />
              <UiSelect v-model="classSortOption"
                        class="h-10 w-full px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm cursor-pointer sm:w-[150px]">
                <UiOption value="name">按名称排序</UiOption>
                <UiOption value="studentCount">按学生数量排序</UiOption>
                <UiOption value="semester">按学期排序</UiOption>
              </UiSelect>
            </div>
          </div>

          <template v-if="filteredClasses.length">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              <div v-for="classItem in filteredClasses" :key="classItem.id"
                   class="rounded-[20px] border border-black/[0.06] bg-[radial-gradient(circle_at_top_right,rgba(26,115,232,0.08),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_14px_36px_rgba(38,61,89,0.07)] p-6 min-h-[380px] flex flex-col cursor-pointer transition-all hover:-translate-y-[5px] hover:border-[rgba(194,112,62,0.3)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                   @click="viewDetailedAnalysis(classItem)">
                <div class="flex flex-col h-full">
                  <h3 class="text-base font-semibold text-[#1d1d1f] mb-3">{{ classItem.name }}</h3>
                  <div class="flex-grow mb-4 space-y-2 text-sm text-[#6e6e73]">
                    <p><strong class="text-[#1d1d1f]">学生数量:</strong> {{ classItem.studentCount }}人</p>
                    <p><strong class="text-[#1d1d1f]">课程:</strong> {{ classItem.courseName || '数据结构' }}</p>
                    <p><strong class="text-[#1d1d1f]">学期:</strong> {{ classItem.semester || '2023-2024' }}</p>
                  </div>
                  <div class="flex justify-between gap-2.5 mt-auto pt-1.5 flex-wrap">
                    <UiButton @click.stop="viewDetailedAnalysis(classItem)"
                              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">
                      详细分析
                    </UiButton>
                    <UiButton @click.stop="quickViewAnalysis(classItem)"
                              class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none">
                      快速分析
                    </UiButton>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div v-if="!filteredClasses.length && !loading" class="flex flex-col items-center justify-center py-16 text-[#6e6e73]">
            <svg class="w-16 h-16 mb-4 text-[#d1d1d6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
            <p class="text-sm">未找到匹配的班级</p>
          </div>
        </div>
      </div>

      <!-- 班级列表 -->
      <div v-if="showDetailedAnalysis" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-5">
        <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="font-semibold text-[#1d1d1f]">我的教学班</span>
          <UiButton @click="refreshClassList"
                    class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">
            刷新
          </UiButton>
        </div>

        <div v-if="loading" class="flex justify-center items-center min-h-[400px] w-full">
          <div class="w-full space-y-4">
            <div v-for="i in 5" :key="i" class="h-5 w-[var(--progress-width)] bg-[#f5f5f7] rounded-[8px] animate-pulse" :style="progressWidthStyle(90 - i * 8)"></div>
          </div>
        </div>

        <div v-else-if="!classList.length" class="flex flex-col items-center justify-center py-10 text-[#6e6e73]">
          <svg class="w-16 h-16 mb-4 text-[#d1d1d6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
          <p class="text-sm">暂无教学班级</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
            <tr class="border-b border-black/[0.06]">
              <th class="text-left py-3 px-4 font-medium text-[#6e6e73]">班级名称</th>
              <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[120px]">学生人数</th>
              <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[180px]">课程</th>
              <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[120px]">学期</th>
              <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[200px]">操作</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in classList" :key="row.id"
                class="border-b border-black/[0.04] hover:bg-[#f5f5f7]/60 transition-colors cursor-pointer"
                @click="handleClassRowClick(row)">
              <td class="py-3 px-4 text-[#1d1d1f]">{{ row.name }}</td>
              <td class="py-3 px-4 text-[#1d1d1f]">{{ row.studentCount }}</td>
              <td class="py-3 px-4 text-[#1d1d1f]">{{ row.courseName }}</td>
              <td class="py-3 px-4 text-[#1d1d1f]">{{ row.semester }}</td>
              <td class="py-3 px-4">
                <UiButton @click.stop="quickViewAnalysis(row)" class="text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] text-sm font-medium mr-4 bg-transparent border-none cursor-pointer">快速分析</UiButton>
                <UiButton @click.stop="viewDetailedAnalysis(row)" class="text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] text-sm font-medium bg-transparent border-none cursor-pointer">详细分析</UiButton>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 班级详细分析 -->
      <div v-if="showDetailedAnalysis" class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-5">
        <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="font-semibold text-[#1d1d1f]">{{ currentClassName }} 详细分析</span>
          <UiButton @click="backToWelcome"
                    class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">
            返回班级列表
          </UiButton>
        </div>

        <!-- 班级选择 / 分析设置 -->
        <div class="rounded-[16px] border border-black/[0.06] bg-white/80 p-5 mb-5">
          <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
            <span class="font-medium text-[#1d1d1f] text-sm">分析设置</span>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <label class="text-sm text-[#6e6e73] whitespace-nowrap">实验</label>
              <UiSelect v-model="filterForm.experimentId" @change="handleClassChange"
                        class="w-[220px] h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm cursor-pointer">
                <UiOption value="">所有实验</UiOption>
                <UiOption v-for="item in experimentList" :key="item.id" :value="item.id">{{ item.name }}</UiOption>
              </UiSelect>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-sm text-[#6e6e73] whitespace-nowrap">搜索</label>
              <UiInput v-model="filterForm.search" @input="filterStudents"
                       placeholder="搜索学生姓名/学号"
                       class="w-[200px] h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(194,112,62,0.15),inset_0_0_0_1px_rgba(194,112,62,0.5)] transition-all outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <!-- 加载中状态-->
        <div v-if="loading" class="flex justify-center items-center min-h-[400px] w-full">
          <div class="w-full space-y-4">
            <div v-for="i in 10" :key="i" class="h-4 w-[var(--progress-width)] bg-[#f5f5f7] rounded-[8px] animate-pulse" :style="progressWidthStyle(95 - i * 5)"></div>
          </div>
        </div>

        <!-- 班级总览 -->
        <template v-else-if="classData">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
            <div class="rounded-[16px] border border-black/[0.06] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] p-5 text-center">
              <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ classData.studentCount }}</div>
              <div class="text-[13px] text-[#6e6e73]">学生总数</div>
            </div>
            <div class="rounded-[16px] border border-black/[0.06] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] p-5 text-center">
              <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ experimentCompletionRate }}%</div>
              <div class="text-[13px] text-[#6e6e73]">实验完成率</div>
            </div>
            <div class="rounded-[16px] border border-black/[0.06] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] p-5 text-center">
              <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ classData.averageScore || '暂无' }}</div>
              <div class="text-[13px] text-[#6e6e73]">平均分</div>
            </div>
            <div class="rounded-[16px] border border-black/[0.06] bg-gradient-to-br from-[#f9f9f9] to-[#f5f5f7] p-5 text-center">
              <div class="text-[28px] font-bold text-[#1d1d1f] mb-1">{{ riskStudentCount }}</div>
              <div class="text-[13px] text-[#6e6e73]">需关注学生</div>
            </div>
          </div>

          <!-- 学生能力分布 -->
          <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-5">
            <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
              <span class="font-semibold text-[#1d1d1f]">班级能力分布</span>
            </div>
            <div class="h-[320px] w-full" ref="abilityDistributionRef"></div>
          </div>

          <!-- 学生列表 -->
          <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-5">
            <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
              <span class="font-semibold text-[#1d1d1f]">学生列表</span>
              <UiButton @click="exportStudentData"
                        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">
                导出数据
              </UiButton>
            </div>

            <div v-if="!filteredStudents.length" class="flex flex-col items-center justify-center py-10 text-[#6e6e73]">
              <svg class="w-16 h-16 mb-4 text-[#d1d1d6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <p class="text-sm">暂无学生数据</p>
            </div>

            <div v-else class="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table class="w-full text-sm border-collapse">
                <thead class="sticky top-0 bg-white z-10">
                <tr class="border-b border-black/[0.06]">
                  <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[50px]"></th>
                  <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[120px]">学号</th>
                  <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[120px]">姓名</th>
                  <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[200px]">实验完成率</th>
                  <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[100px]">平均分</th>
                  <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[120px]">能力趋势</th>
                  <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[120px]">风险程度</th>
                  <th class="text-left py-3 px-4 font-medium text-[#6e6e73] w-[200px]">操作</th>
                </tr>
                </thead>
                <tbody>
                <template v-for="student in filteredStudents" :key="student.id">
                  <tr class="border-b border-black/[0.04] hover:bg-[#f5f5f7]/60 transition-colors">
                    <td class="py-3 px-4">
                      <UiButton @click="toggleStudentExpand(student.id)" class="w-6 h-6 rounded-full bg-black/[0.04] flex items-center justify-center hover:bg-black/[0.08] transition-colors cursor-pointer border-none">
                        <svg class="w-3 h-3 text-[#6e6e73] transition-transform" :class="expandedStudents.has(student.id) ? 'rotate-90' : ''" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </UiButton>
                    </td>
                    <td class="py-3 px-4 text-[#1d1d1f]">{{ student.id }}</td>
                    <td class="py-3 px-4 text-[#1d1d1f] font-medium">{{ student.name }}</td>
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                          <div class="h-full w-[var(--progress-width)] rounded-full bg-[var(--progress-color)] transition-all" :style="progressBarStyle(student.completionRate)"></div>
                        </div>
                        <span class="text-xs text-[#6e6e73] w-10 text-right">{{ student.completionRate }}%</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-[#1d1d1f]">{{ student.averageScore }}</td>
                    <td class="py-3 px-4">
                        <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-xs font-medium"
                              :class="student.trend === 'up' ? 'bg-[#e8f8ef] text-[#1a7f37]' : student.trend === 'down' ? 'bg-[#ffeef0] text-[#d1242f]' : 'bg-[#f0f0f5] text-[#6e6e73]'">
                          {{ student.trend === 'up' ? '上升' : student.trend === 'down' ? '下降' : '稳定' }}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <span class="inline-flex items-center h-[24px] px-2.5 rounded-full text-xs font-medium"
                              :class="getRiskLevel(student).type === 'danger' ? 'bg-[#ffeef0] text-[#d1242f]' : getRiskLevel(student).type === 'warning' ? 'bg-[#fff8e1] text-[#b45309]' : getRiskLevel(student).type === 'info' ? 'bg-[#f0f0f5] text-[#6e6e73]' : 'bg-[#e8f8ef] text-[#1a7f37]'">
                          {{ getRiskLevel(student).text }}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                      <UiButton @click="viewStudentDetail(student)" class="text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] text-sm font-medium mr-4 bg-transparent border-none cursor-pointer">查看详情</UiButton>
                      <UiButton @click="viewStudentReports(student)" class="text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] text-sm font-medium bg-transparent border-none cursor-pointer">查看报告</UiButton>
                    </td>
                  </tr>
                  <!-- Expanded row -->
                  <tr v-if="expandedStudents.has(student.id)">
                    <td colspan="8" class="p-0">
                      <div class="flex flex-wrap p-5 gap-5 bg-[#fafafa] border-b border-black/[0.04]">
                        <div class="w-[300px] h-[300px]" ref="studentRadarRefs" :data-student-id="student.id"></div>
                        <div class="flex-1 min-w-[300px]">
                          <h4 class="text-sm font-semibold text-[#1d1d1f] mb-3">实验完成情况</h4>
                          <div v-for="(exp, index) in student.experiments" :key="index" class="mb-3">
                            <div class="flex items-center gap-3">
                              <div class="flex-1">
                                <div class="h-[15px] bg-[#f5f5f7] rounded-full overflow-hidden">
                                  <div class="h-full w-[var(--progress-width)] rounded-full transition-all"
                                       :style="progressWidthStyle(exp.status === 'completed' ? 100 : exp.status === 'in_progress' ? 50 : 0)"
                                       :class="exp.status === 'completed' ? 'bg-[#6b8f6b]' : exp.status === 'in_progress' ? 'bg-[#c49a3c]' : 'bg-[#c44b3f]'">
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span class="text-xs text-[#aeaeb2] mt-1 block">
                                {{ exp.name }} - {{ exp.status === 'completed' ? '已完成' : exp.status === 'in_progress' ? '进行中' : '未开始' }}
                                {{ exp.score ? `(${exp.score}分)` : '' }}
                              </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
                </tbody>
              </table>
            </div>
          </div>

          <!-- AI教学建议 -->
          <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-5">
            <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
              <span class="font-semibold text-[#1d1d1f]">AI教学建议</span>
              <UiButton @click="generateClassTeachingAdvice" :disabled="aiAdviceLoading"
                        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                {{ aiAdviceLoading ? '生成中...' : '生成建议' }}
              </UiButton>
            </div>

            <div class="px-1 py-1">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[#5856d6] flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-[#1d1d1f]">教学建议</h3>
                  <p class="text-xs text-[#6e6e73]">针对{{ currentClassName }}的个性化教学建议</p>
                </div>
              </div>

              <div class="h-px bg-black/[0.06] my-4"></div>

              <div v-if="aiAdviceError" class="flex items-start gap-3 p-4 rounded-[12px] bg-[#fff8e1] border border-[#ffcc02]/20 mb-4">
                <svg class="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                <p class="text-sm text-[#b45309]">{{ aiAdviceError }}</p>
              </div>

              <div v-if="aiAdviceLoading" class="space-y-3">
                <div v-for="i in 8" :key="i" class="h-4 w-[var(--progress-width)] bg-[#f5f5f7] rounded-[8px] animate-pulse" :style="progressWidthStyle(90 - i * 5)"></div>
              </div>
              <div v-else-if="aiAdviceContent" class="prose prose-sm max-w-none text-[#303133] leading-[1.7]" v-html="renderedAiAdvice"></div>
              <div v-else class="flex flex-col items-center justify-center py-10 text-[#6e6e73]">
                <svg class="w-16 h-16 mb-4 text-[#d1d1d6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                <p class="text-sm">点击生成建议，基于当前班级真实数据生成教学建议</p>
              </div>
            </div>
          </div>
        </template>

        <!-- 未加载班级数据时提示 -->
        <div v-else class="flex flex-col items-center justify-center min-h-[400px] w-full text-[#6e6e73]">
          <svg class="w-20 h-20 mb-4 text-[#d1d1d6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <p class="text-sm">您可以从上方选择一个班级进行详细分析</p>
        </div>
      </div>

      <!-- 快速分析弹窗 -->
      <AppModal v-model="quickAnalysisVisible" title="班级快速分析" width="70%">
        <div v-if="quickAnalysisLoading" class="flex justify-center items-center min-h-[400px] w-full">
          <div class="w-full space-y-4">
            <div v-for="i in 5" :key="i" class="h-5 w-[var(--progress-width)] bg-[#f5f5f7] rounded-[8px] animate-pulse" :style="progressWidthStyle(90 - i * 8)"></div>
          </div>
        </div>

        <div v-else-if="quickAnalysisData">
          <div class="mb-5">
            <h3 class="text-base font-semibold text-[#1d1d1f] mb-1">{{ quickAnalysisData.className }} 快速分析</h3>
            <p class="text-sm text-[#6e6e73]">学生总数: {{ quickAnalysisData.studentCount }} | 实验完成率 {{ quickAnalysisData.completionRate }}%</p>
          </div>

          <div class="h-px bg-black/[0.06] my-4"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="h-[300px] mb-5" ref="quickChartRef"></div>
            <div>
              <h4 class="text-sm font-semibold text-[#1d1d1f] mb-2">分析摘要</h4>
              <p class="text-sm text-[#6e6e73] mb-4">{{ quickAnalysisData.summary }}</p>

              <h4 class="text-sm font-semibold text-[#1d1d1f] mb-2">主要问题</h4>
              <ul class="list-disc list-inside text-sm text-[#6e6e73] mb-4 space-y-1">
                <li v-for="(issue, index) in quickAnalysisData.issues" :key="index">{{ issue }}</li>
              </ul>

              <h4 class="text-sm font-semibold text-[#1d1d1f] mb-2">建议措施</h4>
              <ul class="list-disc list-inside text-sm text-[#6e6e73] space-y-1">
                <li v-for="(suggestion, index) in quickAnalysisData.suggestions" :key="index">{{ suggestion }}</li>
              </ul>
            </div>
          </div>
        </div>

        <template #footer>
          <UiButton @click="quickAnalysisVisible = false"
                    class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none">
            关闭
          </UiButton>
          <UiButton @click="viewDetailedAnalysis(quickAnalysisData ? quickAnalysisData.class : null)" :disabled="!quickAnalysisData"
                    class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            查看详细分析
          </UiButton>
        </template>
      </AppModal>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import {DataAnalysis} from '@/components/ui/icons'
import {marked} from 'marked'
import DOMPurify from 'dompurify'
import api from '../../api'
import {buildStructuredPrompt, chatSend, CHAT_MESSAGE_MAX_LENGTH} from '../../api/tap'
import AppModal from '../../components/AppModal.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const classList = ref([])
const experimentList = ref([])
const classData = ref(null)
const studentList = ref([])
const abilityDistributionRef = ref(null)
const studentRadarRefs = ref([])
let abilityChart = null
const studentRadarCharts = {}

// 展开的学生行
const expandedStudents = ref(new Set())
const toggleStudentExpand = (studentId) => {
  const newSet = new Set(expandedStudents.value)
  if (newSet.has(studentId)) {
    newSet.delete(studentId)
  } else {
    newSet.add(studentId)
    // 延迟初始化雷达图
    nextTick(() => {
      setTimeout(() => initStudentRadarCharts(), 200)
    })
  }
  expandedStudents.value = newSet
}

// 快速分析相关
const quickAnalysisVisible = ref(false)
const quickAnalysisLoading = ref(false)
const quickAnalysisData = ref(null)
const quickChartRef = ref(null)
let quickChart = null

// 详细分析显示控制 - 默认不显示详细分析
const showDetailedAnalysis = ref(false)

// 过滤表单
const filterForm = reactive({
  classId: '',
  experimentId: '',
  search: ''
})

// 过滤后的学生列表
const filteredStudents = ref([])

// 班级搜索和排序
const classSearchText = ref('')
const classSortOption = ref('name')

// 过滤和排序后的班级列表
const filteredClasses = computed(() => {
  let result = [...classList.value]
  if (classSearchText.value) {
    const searchText = classSearchText.value.toLowerCase()
    result = result.filter(cls =>
        (cls.name && cls.name.toLowerCase().includes(searchText)) ||
        (cls.courseName && cls.courseName.toLowerCase().includes(searchText)) ||
        (cls.semester && cls.semester.toLowerCase().includes(searchText))
    )
  }

  if (classSortOption.value === 'name') {
    result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } else if (classSortOption.value === 'studentCount') {
    result.sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
  } else if (classSortOption.value === 'semester') {
    result.sort((a, b) => (a.semester || '').localeCompare(b.semester || ''))
  }

  return result
})

// 实验完成率
const experimentCompletionRate = computed(() => {
  if (!classData.value || !studentList.value.length) return 0

  const totalExperiments = studentList.value.reduce((sum, student) => {
    return sum + (student.experiments ? student.experiments.length : 0)
  }, 0)

  const completedExperiments = studentList.value.reduce((sum, student) => {
    return sum + (student.experiments ? student.experiments.filter(exp => exp.status === 'completed').length : 0)
  }, 0)

  if (totalExperiments === 0) return 0
  return Math.round((completedExperiments / totalExperiments) * 100)
})

// 需要关注的学生数量
const riskStudentCount = computed(() => {
  if (!studentList.value) return 0
  return studentList.value.filter(s => {
    return s.completionRate < 60 || s.trend === 'down' || s.averageScore < 60
  }).length
})

// 当前班级名称
const currentClassName = computed(() => {
  if (!classData.value) return '当前班级'
  return classData.value.name
})

// AI教学建议 - 基于真实数据动态生成
const aiAdvice = reactive({
  classOverview: '',
  studentsAtRisk: [],
  teachingAdvice: []
})
const aiAdviceLoading = ref(false)
const aiAdviceContent = ref('')
const aiAdviceError = ref('')
const renderedAiAdvice = computed(() => aiAdviceContent.value ? DOMPurify.sanitize(marked.parse(aiAdviceContent.value)) : '')
const CLASS_ADVICE_PROMPT_MAX_LENGTH = CHAT_MESSAGE_MAX_LENGTH - 200

// 根据学生数据更新AI建议
const updateAiAdvice = () => {
  if (!studentList.value.length) {
    aiAdvice.classOverview = '暂无学生数据，无法生成教学建议。'
    aiAdvice.studentsAtRisk = []
    aiAdvice.teachingAdvice = []
    return
  }

  const students = studentList.value
  const avgCompletion = Math.round(students.reduce((s, st) => s + st.completionRate, 0) / students.length)
  const avgScore = Math.round(students.reduce((s, st) => s + (st.averageScore || 0), 0) / students.length)
  const downTrend = students.filter(s => s.trend === 'down').length
  const lowCompletion = students.filter(s => s.completionRate < 60)

  aiAdvice.classOverview = `该班级共${students.length}名学生，实验平均完成率${avgCompletion}%，平均分${avgScore}分。` +
      (downTrend > 0 ? `有${downTrend}名学生成绩呈下降趋势。` : '整体趋势稳定。') +
      (lowCompletion.length > 0 ? `${lowCompletion.length}名学生完成率低于60%，需要重点关注。` : '')

  const riskStudents = students
      .filter(s => s.completionRate < 60 || s.averageScore < 60 || s.trend === 'down')
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5)

  aiAdvice.studentsAtRisk = riskStudents.map(s => {
    const reasons = []
    if (s.completionRate < 60) reasons.push(`实验完成率仅${s.completionRate}%`)
    if (s.averageScore < 60) reasons.push(`平均分${s.averageScore}分，低于及格线`)
    if (s.trend === 'down') reasons.push('近期成绩呈下降趋势')
    return { name: s.name, reason: reasons.join('，') || '综合表现需关注' }
  })

  const advice = []
  if (avgCompletion < 80) advice.push('实验完成率偏低，建议加强实验提交的督促，可设置阶段性检查点')
  if (avgScore < 75) advice.push('班级平均分有提升空间，建议增加课堂练习和知识点回顾')
  if (lowCompletion.length > 3) advice.push(`有${lowCompletion.length}名学生完成率较低，建议安排课后辅导或一对一答疑`)
  if (downTrend > 2) advice.push('多名学生成绩下降，建议及时与学生沟通了解原因')
  if (avgScore >= 80) advice.push('班级整体成绩良好，可以适当增加拓展性实验内容')
  if (advice.length === 0) advice.push('班级整体表现良好，继续保持当前教学节奏')

  aiAdvice.teachingAdvice = advice
}

const summarizeStudentForPrompt = (student) => {
  const unfinished = student.experiments.filter(e => e.status !== 'completed').length
  const recentScores = student.experiments
      .filter(e => e.score > 0)
      .slice(-3)
      .map(e => `${e.name}:${e.score}`)
      .join('，') || '暂无有效成绩'
  const evidenceSummary = summarizeStudentEvidence(student)
  return `${student.name}(${student.id})：完成率${student.completionRate}%，均分${student.averageScore}，趋势${student.trend}，未完成${unfinished}项，近期成绩：${recentScores}，完成证据：${evidenceSummary}`
}

const summarizeStudentBriefForPrompt = (student) => {
  const unfinished = student.experiments.filter(e => e.status !== 'completed').length
  return `${student.name}(${student.id})：完成率${student.completionRate}%，均分${student.averageScore}，趋势${student.trend}，未完成${unfinished}项`
}

const completedEvidenceTypes = new Set(['TRANSCRIPT_SCORE', 'ANSWER_SHEET', 'SCORED_CODE'])

const evidenceLabel = (evidence) => {
  const labels = {
    TRANSCRIPT_SCORE: '成绩单有效总分',
    ANSWER_SHEET: '答题卡',
    SCORED_CODE: '得分代码',
    SUBMISSION_ATTEMPT: '提交记录尝试',
    NONE: '无完成证据'
  }
  return labels[evidence] || evidence || '无完成证据'
}

const summarizeStudentEvidence = (student) => {
  const counts = student.experiments.reduce((acc, item) => {
    const key = item.completionEvidence || 'NONE'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => `${evidenceLabel(key)}${count}项`)
      .join('，') || '无完成证据'
}

const buildExperimentEvidenceStats = (experiment, students) => {
  const rows = students
      .map(student => student.experiments.find(item => String(item.id) === String(experiment.id)))
      .filter(Boolean)
  const completed = rows.filter(item => item.status === 'completed').length
  const scored = rows.filter(item => Number(item.score || 0) > 0)
  const score = scored.length
      ? Math.round(scored.reduce((sum, item) => sum + Number(item.score || 0), 0) / scored.length)
      : 0
  const evidenceCounts = rows.reduce((acc, item) => {
    const key = item.completionEvidence || 'NONE'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const transcriptRows = rows.filter(item => item.transcriptRowPresent).length
  const answerSheetStudents = rows.filter(item => Number(item.answerSheetCount || 0) > 0).length
  const scoredCodeStudents = rows.filter(item => Number(item.scoredCodeCount || 0) > 0).length
  const attemptStudents = rows.filter(item => Number(item.submissionAttemptCount || 0) > 0).length
  const completionRate = students.length ? Math.round(completed / students.length * 100) : 0
  const evidenceText = Object.entries(evidenceCounts)
      .filter(([key, count]) => count > 0 && completedEvidenceTypes.has(key))
      .map(([key, count]) => `${evidenceLabel(key)}${count}人`)
      .join('，') || '无完成证据'
  return {
    rows,
    completed,
    score,
    completionRate,
    transcriptRows,
    answerSheetStudents,
    scoredCodeStudents,
    attemptStudents,
    evidenceText
  }
}

const buildClassTeachingAdvicePrompt = () => {
  const students = studentList.value || []
  const experiments = experimentList.value || []
  const avgCompletion = students.length
      ? Math.round(students.reduce((sum, student) => sum + Number(student.completionRate || 0), 0) / students.length)
      : 0
  const scoredStudents = students.filter(student => Number(student.averageScore || 0) > 0)
  const avgScore = scoredStudents.length
      ? Math.round(scoredStudents.reduce((sum, student) => sum + Number(student.averageScore || 0), 0) / scoredStudents.length)
      : Number(classData.value?.averageScore || 0)
  const riskStudents = students
      .filter(student => student.completionRate < 70 || student.averageScore < 60 || student.trend === 'down')
      .sort((a, b) => (a.completionRate - b.completionRate) || (a.averageScore - b.averageScore))
      .slice(0, 5)
  const experimentStats = experiments.map(experiment => {
    const stats = buildExperimentEvidenceStats(experiment, students)
    return `${experiment.name}：完成率${stats.completionRate}%，均分${stats.score}，完成${stats.completed}/${students.length}，证据${stats.evidenceText}；源数据覆盖：成绩单行${stats.transcriptRows}人，答题卡${stats.answerSheetStudents}人，得分代码${stats.scoredCodeStudents}人，提交记录尝试${stats.attemptStudents}人`
  }).slice(0, 8)
  const lowExperimentStats = experiments
      .map(experiment => ({ experiment, stats: buildExperimentEvidenceStats(experiment, students) }))
      .filter(item => item.stats.completionRate < 60)
      .sort((a, b) => a.stats.completionRate - b.stats.completionRate)
      .slice(0, 5)
      .map(({ experiment, stats }) => `${experiment.name}：完成率${stats.completionRate}%，完成${stats.completed}/${students.length}，证据${stats.evidenceText}，成绩单行${stats.transcriptRows}人，答题卡${stats.answerSheetStudents}人，得分代码${stats.scoredCodeStudents}人`)
  const evidenceTotals = students.flatMap(student => student.experiments).reduce((acc, item) => {
    const key = item.completionEvidence || 'NONE'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const evidenceTotalItems = Object.entries(evidenceTotals)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => `${evidenceLabel(key)}：${count}条`)

  const prompt = buildStructuredPrompt({
    role: '你是一位资深数据结构课程教学顾问，擅长根据班级真实提交和成绩数据给教师提供可执行建议。',
    task: `请为${currentClassName.value || '当前班级'}生成班级教学诊断与改进建议。`,
    contextSections: [
      {
        title: '班级概况',
        items: [
          `学生数：${students.length || classData.value?.studentCount || 0}`,
          `实验数：${experiments.length}`,
          `班级平均完成率：${avgCompletion}%`,
          `班级平均分：${avgScore}`,
          `需关注学生数：${riskStudents.length}`,
          '完成口径：GRADED 或SUBMITTED 才算完成；IN_PROGRESS 只代表存在提交记录尝试，不单独算完成。',
          '数据来源说明：提交记录csv 受PTA 翻页/API 限制，可能只有约200条；完成判断优先使用 PAPER_TRANSCRIPT 成绩单有效总分，其次ANSWER_SHEET 答题卡、SCORED_CODE 得分代码，提交记录只作过程证据。',
        ],
      },
      {
        title: '完成证据分布',
        items: evidenceTotalItems.length ? evidenceTotalItems : ['暂无完成证据统计'],
      },
      {
        title: '低完成率实验明细',
        items: lowExperimentStats.length ? lowExperimentStats : ['暂无明显低完成率实验'],
      },
      {
        title: '实验表现',
        items: experimentStats.length ? experimentStats : ['暂无实验统计'],
      },
      {
        title: '优先关注学生',
        items: riskStudents.length ? riskStudents.map(summarizeStudentForPrompt) : ['暂无明显高风险学生'],
      },
    ],
    instructions: [
      '先给出班级当前最主要的教学风险判断，并说明判断依据。',
      '指出最需要补救的实验或知识点方向，不要泛泛而谈。',
      '给出3到5条教师可以直接执行的课堂、课后和实验安排建议。',
      '按学生分层提出策略：高风险学生、一般学生、优秀学生分别怎么安排。',
      '如果数据不足，请明确指出缺失哪些数据以及会影响什么判断。',
    ],
    outputRequirements: [
      '使用 Markdown 输出。',
      '建议必须引用上方真实指标。',
      '不要声称看到了未提供的数据。',
    ],
  })

  if (prompt.length <= CLASS_ADVICE_PROMPT_MAX_LENGTH) {
    return prompt
  }

  const compactExperimentStats = experiments
      .map(experiment => {
        const stats = buildExperimentEvidenceStats(experiment, students)
        return `${experiment.name}：完成率${stats.completionRate}%，均分${stats.score}，完成${stats.completed}/${students.length}`
      })
      .sort((a, b) => {
        const rateA = Number((a.match(/完成率(\d+)%/) || [])[1] || 100)
        const rateB = Number((b.match(/完成率(\d+)%/) || [])[1] || 100)
        return rateA - rateB
      })
      .slice(0, 6)

  return buildStructuredPrompt({
    role: '你是一位数据结构课程教学顾问。',
    task: `请为${currentClassName.value || '当前班级'}生成简洁、可执行的班级教学诊断建议。`,
    contextSections: [
      {
        title: '班级概况',
        items: [
          `学生数：${students.length || classData.value?.studentCount || 0}`,
          `实验数：${experiments.length}`,
          `班级平均完成率：${avgCompletion}%`,
          `班级平均分：${avgScore}`,
          `需关注学生数：${riskStudents.length}`,
          '完成口径：GRADED 或 SUBMITTED 才算完成；提交记录只作过程证据。',
        ],
      },
      {
        title: '低完成率或重点实验',
        items: compactExperimentStats.length ? compactExperimentStats : ['暂无实验统计'],
      },
      {
        title: '优先关注学生',
        items: riskStudents.length ? riskStudents.slice(0, 5).map(summarizeStudentBriefForPrompt) : ['暂无明显高风险学生'],
      },
    ],
    instructions: [
      '判断班级最主要教学风险，并引用上述指标。',
      '指出优先补救的实验或能力方向。',
      '给出3到5条教师可直接执行的课堂、课后和分层辅导建议。',
    ],
    outputRequirements: [
      '使用 Markdown 输出。',
      '不要声称看到了未提供的数据。',
    ],
  }).slice(0, CLASS_ADVICE_PROMPT_MAX_LENGTH)
}

const generateClassTeachingAdvice = async () => {
  if (aiAdviceLoading.value) return
  if (!studentList.value.length) {
    aiAdviceError.value = '当前班级暂无学生实验数据，无法生成班级教学建议。'
    aiAdviceContent.value = ''
    return
  }

  aiAdviceLoading.value = true
  aiAdviceError.value = ''
  aiAdviceContent.value = ''
  try {
    const res = await chatSend(buildClassTeachingAdvicePrompt(), [])
    const data = res?.data ?? res
    const reply = String(data?.reply || '').trim()
    if (!reply) throw new Error('AI 服务未返回有效内容')
    aiAdviceContent.value = reply
  } catch (error) {
    logger.error('生成班级教学建议失败:', error)
    aiAdviceError.value = `AI 教学建议生成失败：${error?.message || '请检查后端AI 服务配置'}`
    uiMessage.warning(aiAdviceError.value)
  } finally {
    aiAdviceLoading.value = false
  }
}

// 加载班级列表
const loadClassList = async () => {
  loading.value = true
  try {
    const data = await api.getClassList()
    if (Array.isArray(data) && data.length > 0) {
      classList.value = data
    } else {
      classList.value = []
      logger.warn('loadClassList: 接口返回空数据', data)
    }
  } catch (error) {
    logger.error('加载班级列表失败:', error)
    uiMessage.error('加载班级列表失败')
    classList.value = []
  } finally {
    loading.value = false
  }
}

// 刷新班级列表
const refreshClassList = () => {
  loadClassList()
}

const normalizeExperimentListResponse = response => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

// 加载实验列表
const loadExperimentList = async () => {
  try {
    logger.debug('开始加载实验列表');
    const response = await api.getTeacherExperimentList({ classId: filterForm.classId })
    const experiments = normalizeExperimentListResponse(response)

    if (experiments.length > 0) {
      experimentList.value = experiments;
    } else {
      logger.warn('实验列表返回格式不正确', response);
      experimentList.value = [];
    }
  } catch (error) {
    logger.error('加载实验列表失败:', error)
    experimentList.value = [];
  }
}

// 处理班级行点击
const handleClassRowClick = (row) => {
  quickViewAnalysis(row)
}

// 快速查看分析
const quickViewAnalysis = async (classInfo) => {
  quickAnalysisVisible.value = true
  quickAnalysisLoading.value = true
  quickAnalysisData.value = null

  try {
    const analysisData = await api.getClassAnalysis(classInfo.id)

    let completionRate = analysisData?.completionRate || 0
    let studentCount = analysisData?.studentCount || classInfo.studentCount || 0
    let avgScore = analysisData?.averageScore || 0

    const issues = []
    const suggestions = []

    if (completionRate < 80) {
      issues.push(`实验整体完成率为${completionRate}%，部分学生未按时完成实验`)
      suggestions.push('加强实验提交的督促，设置提交提醒')
    }
    if (avgScore < 75) {
      issues.push(`班级平均分为${avgScore}分，整体成绩有待提高`)
      suggestions.push('针对薄弱知识点增加课堂讲解和练习')
    }

    const dist = analysisData?.scoreDistribution || {}
    if ((dist['<60'] || 0) > 0) {
      issues.push(`有${dist['<60']}人次成绩不及格，需要重点关注`)
      suggestions.push('为成绩较差的学生安排课后辅导或一对一答疑')
    }
    if ((dist['90-100'] || 0) > (studentCount * 0.3)) {
      suggestions.push('优秀学生较多，可以组织学习小组，以优带弱')
    }

    if (issues.length === 0) {
      issues.push('班级整体表现良好，各项指标正常')
    }
    if (suggestions.length === 0) {
      suggestions.push('继续保持当前教学节奏，适当增加拓展内容')
    }

    quickAnalysisData.value = {
      className: classInfo.name,
      studentCount: studentCount,
      completionRate: completionRate,
      summary: `${classInfo.name}共有${studentCount}名学生，实验完成率${completionRate}%，平均分${avgScore}分。`,
      issues,
      suggestions,
      class: classInfo,
      scoreDistribution: dist
    }

    nextTick(() => {
      initQuickAnalysisChart()
    })
  } catch (error) {
    logger.error('获取快速分析数据失败', error)
    uiMessage.error('获取快速分析数据失败')
  } finally {
    quickAnalysisLoading.value = false
  }
}

// 初始化快速分析图表
const initQuickAnalysisChart = () => {
  if (quickChartRef.value) {
    if (quickChart) {
      window.removeEventListener('resize', quickChart.resize);
      quickChart.dispose()
    }

    quickChart = echarts.init(quickChartRef.value)

    const dist = quickAnalysisData.value?.scoreDistribution || {}
    const pieData = [
      {value: dist['90-100'] || 0, name: '优秀(90-100)'},
      {value: dist['80-89'] || 0, name: '良好(80-89)'},
      {value: dist['70-79'] || 0, name: '及格(70-79)'},
      {value: dist['60-69'] || 0, name: '一般(60-69)'},
      {value: dist['<60'] || 0, name: '不及格(<60)'}
    ].filter(d => d.value > 0)

    if (pieData.length === 0) {
      pieData.push({value: 1, name: '暂无数据'})
    }

    const option = {
      title: {
        text: '成绩分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}人次 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '成绩分布',
          type: 'pie',
          radius: '50%',
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }

    quickChart.setOption(option)

    const debouncedResize = debounce(() => {
      if (quickChart) {
        quickChart.resize()
      }
    }, 100)

    window.addEventListener('resize', debouncedResize)
  }
}

// 查看详细分析
const viewDetailedAnalysis = (classInfo) => {
  if (!classInfo) return

  showDetailedAnalysis.value = true
  filterForm.classId = classInfo.id

  const newRoute = router.resolve({
    name: 'ClassDetailedAnalysis',
    params: {classId: classInfo.id}
  })

  router.push(newRoute)
  loadClassData()
}

// 班级变更处理
const handleClassChange = () => {
  if (filterForm.classId) {
    loadClassData()
  } else {
    classData.value = null
    studentList.value = []
    filteredStudents.value = []
  }
}

// 加载班级数据
const loadClassData = async () => {
  if (!filterForm.classId) return

  loading.value = true
  classData.value = null;
  studentList.value = [];
  filteredStudents.value = [];
  aiAdviceContent.value = '';
  aiAdviceError.value = '';

  try {
    try {
      await loadExperimentList();
    } catch (err) {
      logger.error('加载实验列表失败', err);
    }

    try {
      const data = await api.getClassAnalysis(filterForm.classId)
      classData.value = data
    } catch (err) {
      logger.error('加载班级基本信息失败:', err);
      classData.value = {
        id: filterForm.classId,
        name: classList.value.find(c => String(c.id) === String(filterForm.classId))?.name || '未知班级',
        studentCount: 0,
        averageScore: 0,
        completionRate: 0
      };
    }

    await loadStudentData()
    filterStudents()
    updateAiAdvice()
    generateClassTeachingAdvice()

    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    logger.error('加载班级数据失败:', error)
    uiMessage.error('加载班级数据失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 加载学生数据
const loadStudentData = async () => {
  try {
    let allStudentExperiments = [];
    try {
      allStudentExperiments = await api.getAllStudentExperiments({ classId: filterForm.classId });
      logger.debug('获取到的所有学生实验数据', allStudentExperiments);
    } catch (err) {
      logger.error('获取学生实验数据失败:', err);
      studentList.value = [];
      return [];
    }

    if (!Array.isArray(allStudentExperiments) || allStudentExperiments.length === 0) {
      logger.warn('没有学生实验数据');
      studentList.value = [];
      return [];
    }

    logger.debug('开始处理API返回的数据，数据条数:', allStudentExperiments.length);

    const experimentMap = {};
    allStudentExperiments.forEach(exp => {
      if (exp.experimentId && !experimentMap[exp.experimentId]) {
        experimentMap[exp.experimentId] = {
          id: exp.experimentId,
          name: exp.experimentName || `实验 ${exp.experimentId}`
        };
      }
    });
    const allExperimentTemplate = Object.values(experimentMap).sort((a, b) => a.id - b.id);
    logger.debug('从数据中提取的实验模板', allExperimentTemplate);

    const studentIds = [...new Set(allStudentExperiments.map(exp => exp.studentId))];
    logger.debug('检测到的不同学生ID:', studentIds);

    const studentGroups = {};
    studentIds.forEach(id => {
      studentGroups[id] = allStudentExperiments.filter(exp => exp.studentId === id);
    });

    const students = [];

    for (const studentId of studentIds) {
      const studentExps = studentGroups[studentId];
      if (studentExps.length === 0) continue;

      const firstExp = studentExps[0];
      const name = firstExp.studentName || `学生${studentId}`;

      const studentExperiments = allExperimentTemplate.map(tmpl => ({
        id: tmpl.id,
        name: tmpl.name,
        status: 'not_started',
        score: null,
        submitTime: null,
        submissionStatus: 'NOT_STARTED',
        completionEvidence: 'NONE',
        transcriptRowPresent: false,
        answerSheetCount: 0,
        scoredCodeCount: 0,
        submissionAttemptCount: 0,
        plagiarismRate: null
      }));

      studentExps.forEach(exp => {
        const idx = studentExperiments.findIndex(e => e.id === exp.experimentId);
        if (idx !== -1) {
          studentExperiments[idx] = {
            id: exp.experimentId,
            name: exp.experimentName || studentExperiments[idx].name,
            status: exp.status || 'completed',
            score: exp.score || null,
            submitTime: exp.submitTime || null,
            submissionStatus: exp.submissionStatus || null,
            completionEvidence: exp.completionEvidence || 'NONE',
            transcriptRowPresent: Boolean(exp.transcriptRowPresent),
            answerSheetCount: Number(exp.answerSheetCount || 0),
            scoredCodeCount: Number(exp.scoredCodeCount || 0),
            submissionAttemptCount: Number(exp.submissionAttemptCount || 0),
            plagiarismRate: exp.plagiarismRate || null
          };
        } else {
          studentExperiments.push({
            id: exp.experimentId,
            name: exp.experimentName || `实验 ${exp.experimentId}`,
            status: exp.status || 'completed',
            score: exp.score || null,
            submitTime: exp.submitTime || null,
            submissionStatus: exp.submissionStatus || null,
            completionEvidence: exp.completionEvidence || 'NONE',
            transcriptRowPresent: Boolean(exp.transcriptRowPresent),
            answerSheetCount: Number(exp.answerSheetCount || 0),
            scoredCodeCount: Number(exp.scoredCodeCount || 0),
            submissionAttemptCount: Number(exp.submissionAttemptCount || 0),
            plagiarismRate: exp.plagiarismRate || null
          });
        }
      });

      const completedCount = studentExperiments.filter(e => e.status === 'completed').length;
      const completionRate = studentExperiments.length > 0
          ? Math.round((completedCount / studentExperiments.length) * 100) : 0;

      const scoredExps = studentExperiments.filter(e => e.score > 0);
      const averageScore = scoredExps.length > 0
          ? Math.round(scoredExps.reduce((sum, e) => sum + e.score, 0) / scoredExps.length) : 0;

      const baseAbility = Math.min(100, 40 + (completionRate * 0.3) + (averageScore * 0.3));
      const abilities = {
        dataStructure: Math.min(100, Math.round(baseAbility + (averageScore > 80 ? 10 : 0))),
        algorithm: Math.min(100, Math.round(baseAbility - 3 + (averageScore > 85 ? 8 : 0))),
        programming: Math.min(100, Math.round(baseAbility + (completionRate > 80 ? 5 : 0))),
        problemSolving: Math.min(100, Math.round(baseAbility + 2)),
        teamwork: Math.min(100, Math.round(baseAbility + (completionRate > 70 ? 8 : 0)))
      };

      let trend = 'stable';
      const recentExps = studentExps
          .filter(e => e.submitTime && e.score > 0)
          .sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime))
          .slice(0, 3);

      if (recentExps.length >= 2) {
        const recentAvg = recentExps.reduce((sum, e) => sum + e.score, 0) / recentExps.length;
        if (recentAvg > averageScore + 3) trend = 'up';
        else if (recentAvg < averageScore - 5) trend = 'down';
      }

      students.push({
        id: studentId.toString(),
        realId: studentId.toString(),
        name,
        experiments: studentExperiments,
        completionRate,
        averageScore,
        abilities,
        trend
      });
    }

    logger.debug('处理完成，生成了学生数据:', students.length, '人');
    studentList.value = students;
    return students;

  } catch (error) {
    logger.error('加载学生数据失败:', error);
    uiMessage.error('加载学生数据失败: ' + (error.message || '未知错误'));
    studentList.value = [];
    return [];
  }
}

// 过滤学生列表
const filterStudents = () => {
  if (!studentList.value) {
    filteredStudents.value = []
    return
  }

  let result = [...studentList.value]

  if (filterForm.experimentId) {
    result = result.filter(student => {
      const targetExp = student.experiments.find(exp => exp.id.toString() === filterForm.experimentId.toString())
      return targetExp && targetExp.status === 'completed'
    })
  }

  if (filterForm.search) {
    const searchText = filterForm.search.toLowerCase()
    result = result.filter(student =>
        student.name.toLowerCase().includes(searchText) ||
        student.id.toLowerCase().includes(searchText)
    )
  }

  filteredStudents.value = result
}

// debounce函数
const debounce = (fn, delay) => {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(context, args)
      timer = null
    }, delay)
  }
}

// 初始化图表
const initCharts = () => {
  setTimeout(() => {
    try {
      if (abilityDistributionRef.value) {
        initAbilityDistributionChart()
      }
      setTimeout(() => {
        try {
          initStudentRadarCharts()
        } catch (error) {
          logger.error('初始化学生雷达图失败:', error)
        }
      }, 200)
    } catch (error) {
      logger.error('图表初始化过程中发生错误:', error)
    }
  }, 300)
}

// 初始化能力分布图表
const initAbilityDistributionChart = () => {
  try {
    if (!abilityDistributionRef.value) {
      logger.warn('能力分布图表容器不存在')
      return
    }

    const container = abilityDistributionRef.value
    if (container.offsetHeight === 0 || container.offsetWidth === 0) {
      logger.warn('图表容器尺寸为0，无法初始化图表')
      return
    }

    if (abilityChart) {
      try {
        window.removeEventListener('resize', abilityChart.resize);
        abilityChart.dispose()
      } catch (e) {
        logger.error('销毁旧图表实例失败:', e)
      }
    }

    try {
      abilityChart = echarts.init(container)
    } catch (e) {
      logger.error('创建图表实例失败:', e)
      return
    }

    const dataStructureScores = studentList.value.map(s => s.abilities.dataStructure)
    const algorithmScores = studentList.value.map(s => s.abilities.algorithm)
    const programmingScores = studentList.value.map(s => s.abilities.programming)
    const problemSolvingScores = studentList.value.map(s => s.abilities.problemSolving)
    const teamworkScores = studentList.value.map(s => s.abilities.teamwork)

    const option = {
      title: {
        text: '班级能力分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['优秀', '良好', '及格', '不及格'],
        top: 'bottom'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['数据结构', '算法设计', '编程能力', '问题解决', '团队协作']
      },
      yAxis: {
        type: 'value',
        name: '学生数量'
      },
      series: [
        {
          name: '优秀', type: 'bar', stack: 'total',
          emphasis: { focus: 'series' },
          data: [
            dataStructureScores.filter(s => s >= 90).length,
            algorithmScores.filter(s => s >= 90).length,
            programmingScores.filter(s => s >= 90).length,
            problemSolvingScores.filter(s => s >= 90).length,
            teamworkScores.filter(s => s >= 90).length
          ],
          itemStyle: {color: '#67C23A'}
        },
        {
          name: '良好', type: 'bar', stack: 'total',
          emphasis: { focus: 'series' },
          data: [
            dataStructureScores.filter(s => s >= 75 && s < 90).length,
            algorithmScores.filter(s => s >= 75 && s < 90).length,
            programmingScores.filter(s => s >= 75 && s < 90).length,
            problemSolvingScores.filter(s => s >= 75 && s < 90).length,
            teamworkScores.filter(s => s >= 75 && s < 90).length
          ],
          itemStyle: {color: '#409EFF'}
        },
        {
          name: '及格', type: 'bar', stack: 'total',
          emphasis: { focus: 'series' },
          data: [
            dataStructureScores.filter(s => s >= 60 && s < 75).length,
            algorithmScores.filter(s => s >= 60 && s < 75).length,
            programmingScores.filter(s => s >= 60 && s < 75).length,
            problemSolvingScores.filter(s => s >= 60 && s < 75).length,
            teamworkScores.filter(s => s >= 60 && s < 75).length
          ],
          itemStyle: {color: '#E6A23C'}
        },
        {
          name: '不及格', type: 'bar', stack: 'total',
          emphasis: { focus: 'series' },
          data: [
            dataStructureScores.filter(s => s < 60).length,
            algorithmScores.filter(s => s < 60).length,
            programmingScores.filter(s => s < 60).length,
            problemSolvingScores.filter(s => s < 60).length,
            teamworkScores.filter(s => s < 60).length
          ],
          itemStyle: {color: '#F56C6C'}
        }
      ]
    }

    abilityChart.setOption(option)

    const debouncedResize = debounce(() => {
      if (abilityChart && !abilityChart.isDisposed() && container.offsetWidth > 0 && container.offsetHeight > 0) {
        try {
          abilityChart.resize()
        } catch (e) {
          logger.error('调整图表大小失败:', e)
        }
      }
    }, 200)

    window.removeEventListener('resize', debouncedResize)
    window.addEventListener('resize', debouncedResize)
  } catch (error) {
    logger.error('初始化能力分布图表失败', error)
  }
}

// 初始化学生雷达图
const initStudentRadarCharts = () => {
  try {
    Object.values(studentRadarCharts).forEach(chart => {
      try {
        if (chart && !chart.isDisposed()) {
          window.removeEventListener('resize', chart.resize);
          chart.dispose()
        }
      } catch (e) {
        logger.error('销毁雷达图失败:', e)
      }
    })

    Object.keys(studentRadarCharts).forEach(key => {
      delete studentRadarCharts[key]
    })

    const radarElements = document.querySelectorAll('[data-student-id]')
    radarElements.forEach(el => {
      const studentId = el.getAttribute('data-student-id')
      if (!studentId) return

      const student = studentList.value.find(s => s.id === studentId)
      if (!student) return

      if (el.offsetHeight === 0 || el.offsetWidth === 0) {
        return
      }

      try {
        const chart = echarts.init(el)

        const option = {
          title: {
            text: '能力雷达图',
            left: 'center',
            top: 10,
            textStyle: { fontSize: 14 }
          },
          radar: {
            indicator: [
              {name: '数据结构', max: 100},
              {name: '算法设计', max: 100},
              {name: '编程能力', max: 100},
              {name: '问题解决', max: 100},
              {name: '团队协作', max: 100}
            ],
            radius: '60%'
          },
          series: [{
            type: 'radar',
            data: [
              {
                value: [
                  student.abilities.dataStructure,
                  student.abilities.algorithm,
                  student.abilities.programming,
                  student.abilities.problemSolving,
                  student.abilities.teamwork
                ],
                name: '能力值',
                areaStyle: { color: 'rgba(64, 158, 255, 0.6)' }
              }
            ]
          }]
        }

        chart.setOption(option)
        studentRadarCharts[studentId] = chart
      } catch (error) {
        logger.error('初始化学生雷达图失败:', error)
      }
    })

    const debouncedRadarResize = debounce(() => {
      Object.entries(studentRadarCharts).forEach(([studentId, chart]) => {
        try {
          if (chart && !chart.isDisposed()) {
            chart.resize()
          }
        } catch (e) {
          logger.error(`调整学生${studentId}雷达图大小失败`, e)
        }
      })
    }, 200)

    window.removeEventListener('resize', debouncedRadarResize)
    window.addEventListener('resize', debouncedRadarResize)
  } catch (error) {
    logger.error('初始化学生雷达图整体失败:', error)
  }
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 60) return '#409EFF'
  if (percentage >= 40) return '#E6A23C'
  return '#F56C6C'
}

const progressWidthStyle = (percentage) => ({ '--progress-width': `${percentage}%` })
const progressBarStyle = (percentage) => ({
  '--progress-width': `${percentage}%`,
  '--progress-color': getProgressColor(percentage)
})

// 获取风险等级
const getRiskLevel = (student) => {
  if (student.completionRate < 50 || student.averageScore < 50) {
    return {type: 'danger', text: '高风险'}
  }
  if (student.completionRate < 70 || student.averageScore < 60 || student.trend === 'down') {
    return {type: 'warning', text: '中风险'}
  }
  if (student.completionRate < 80 || student.averageScore < 70) {
    return {type: 'info', text: '低风险'}
  }
  return {type: 'success', text: '无风险'}
}

// 查看学生详情
const viewStudentDetail = (student) => {
  router.push({
    path: `/teacher/student-detail/${student.id}`,
    query: {
      name: student.name,
      classId: filterForm.classId,
      from: 'class-analysis'
    }
  })
}

// 查看学生报告
const viewStudentReports = (student) => {
  const completedExperiments = student.experiments.filter(e => e.status === 'completed')
  if (completedExperiments.length === 0) {
    uiMessage.warning('该学生暂无已完成的实验报告')
    return
  }

  router.push({
    name: 'SubmissionDetail',
    params: {id: student.id},
    query: {
      studentName: student.name,
      report: 'true',
      from: 'class-analysis',
      classId: filterForm.classId
    }
  })
}

// 导出学生数据
const exportStudentData = () => {
  uiMessage.success('学生数据已导出')
}

// 在组件卸载时清理图表和事件监听
onUnmounted(() => {
  logger.debug('组件卸载，清理图表实例和事件监听')

  if (abilityChart) {
    try {
      window.removeEventListener('resize', abilityChart.resize);
      abilityChart.dispose()
    } catch (e) {
      logger.error('销毁能力图表失败', e)
    }
    abilityChart = null
  }

  Object.entries(studentRadarCharts).forEach(([id, chart]) => {
    if (chart) {
      try {
        window.removeEventListener('resize', chart.resize);
        chart.dispose()
      } catch (e) {
        logger.error(`销毁学生${id}雷达图失败`, e)
      }
    }
  })

  Object.keys(studentRadarCharts).forEach(key => {
    delete studentRadarCharts[key]
  })

  if (quickChart) {
    try {
      window.removeEventListener('resize', quickChart.resize);
      quickChart.dispose()
    } catch (e) {
      logger.error('销毁快速分析图表失败', e)
    }
    quickChart = null
  }

  const noop = () => {}
  window.removeEventListener('resize', noop)
})

// 检查路由参数是否有班级ID
const classIdFromRoute = computed(() => {
  return route.params.classId || route.params.id || route.query.classId || route.query.id
})

onMounted(async () => {
  // 始终加载班级列表，确保默认页面有数据
  await loadClassList()
  const idFromRoute = classIdFromRoute.value
  if (idFromRoute) {
    logger.debug('从路由获取班级ID:', idFromRoute)
    showDetailedAnalysis.value = true
    filterForm.classId = idFromRoute.toString()
    loadClassData()
  }
})

// 返回欢迎页面
const backToWelcome = () => {
  showDetailedAnalysis.value = false
  classData.value = null

  router.push({
    name: 'ClassList'
  })
}
</script>
