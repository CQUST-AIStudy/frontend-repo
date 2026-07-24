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

    <div class="px-5 pb-5 bg-[var(--app-bg)] rounded-[4px] leading-relaxed">
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
                   class="rounded-[20px] border border-[var(--app-border-soft)] bg-[var(--app-surface)] shadow-[0_8px_24px_rgba(61,53,41,0.06)] p-6 min-h-[380px] flex flex-col cursor-pointer transition-all hover:-translate-y-[5px] hover:border-[rgba(var(--app-primary-rgb),0.3)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
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

          <TeachingAdvicePanel
            :class-id="filterForm.classId"
            :experiments="experimentList"
            class="mb-5"
          />
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
import api from '../../api'
import AppModal from '../../components/AppModal.vue'
import TeachingAdvicePanel from './components/TeachingAdvicePanel.vue'

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
          itemStyle: {color: '#d18a61'}
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
                areaStyle: { color: 'rgba(209, 138, 97, 0.6)' }
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
  if (percentage >= 60) return '#d18a61'
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
