<template>
  <div class="h-full">
    <UiPageHeader class="p-5" title="学生提交详情" :description="`${studentName} 的实验提交`">
      <UiButton @click="goBack" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-white border border-black/[0.1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer flex items-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/></svg>
        返回提交列表
      </UiButton>
    </UiPageHeader>

    <div class="flex flex-col gap-5 relative" :class="{ 'opacity-50 pointer-events-none': loading }">
      <!-- Loading overlay -->
      <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-[3px] border-[var(--app-primary)]/20 border-t-[var(--app-primary)] rounded-full animate-spin"></div>
          <span class="text-sm text-[#6e6e73]">加载中...</span>
        </div>
      </div>

      <div class="grid grid-cols-[280px_1fr] gap-5">
        <!-- 左侧区域：学生信息、统计数据及小卡片 -->
        <div class="flex flex-col gap-4">
          <!-- 学生基本信息卡片 -->
          <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
            <div class="flex items-center gap-5">
              <div class="text-center">
                <img class="w-20 h-20 rounded-full object-cover border border-black/[0.06]"
                     :src="submission.studentAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                     alt="avatar" />
              </div>
              <div class="flex flex-col gap-1">
                <h3 class="m-0 text-lg font-semibold text-[#1d1d1f]">{{ submission.studentName }}</h3>
                <div class="text-sm text-[#6e6e73]">
                  <span class="font-medium mr-1">学号：</span>
                  <span>{{ submission.studentId }}</span>
                </div>
                <div class="text-sm text-[#6e6e73]">
                  <span class="font-medium mr-1">班级：</span>
                  <span>{{ submission.class }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 统计数据卡片 -->
          <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
            <div class="grid grid-cols-1 gap-3">
              <div class="bg-[#f7f9fc] rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div class="text-[13px] text-[#6e6e73] mb-1">上机成绩评分</div>
                <div class="text-[28px] font-bold text-[#1d1d1f]" :class="{ 'text-[var(--app-primary)]': submission.status === 'graded' }">
                  {{ submission.score !== null ? submission.score : '未评分' }}
                </div>
              </div>
              <div class="bg-[#f7f9fc] rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div class="text-[13px] text-[#6e6e73] mb-1">查重率</div>
                <div class="text-[28px] font-bold" :class="{
                  'text-[#6b8f6b]': submission.plagiarismRate < 15,
                  'text-[#c49a3c]': submission.plagiarismRate >= 15 && submission.plagiarismRate < 30,
                  'text-[#c44b3f]': submission.plagiarismRate >= 30
                }">
                  {{ submission.plagiarismRate !== null ? `${submission.plagiarismRate}%` : '未检测' }}
                </div>
              </div>
              <div v-if="submitDisplayTime" class="bg-[#f7f9fc] rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div class="text-[13px] text-[#6e6e73] mb-1">提交时间</div>
                <div class="text-lg font-bold text-[#1d1d1f]">{{ submitDisplayTime }}</div>
              </div>
            </div>
          </div>

          <!-- 操作按钮卡片 -->
          <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
            <div class="flex flex-col gap-3">
              <UiButton @click="openGradeDialog" class="w-full h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none flex items-center justify-center gap-2">
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z"/></svg>
                {{ submission.status === 'graded' ? '重新评分' : '评分' }}
              </UiButton>
            </div>
          </div>
        </div>

        <!-- 右侧区域：代码和报告内容 -->
        <div class="flex flex-col">
          <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 min-h-[80vh] mb-[50px]">
            <!-- Custom Tabs -->
            <div class="flex items-center gap-1 p-1 bg-black/[0.04] rounded-[10px] w-fit mb-6">
              <UiButton
                v-for="tab in mainTabs"
                :key="tab.name"
                @click="activeTab = tab.name"
                class="px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-none"
                :class="activeTab === tab.name ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-transparent text-[#6e6e73] hover:text-[#1d1d1f]'"
              >
                {{ tab.label }}
              </UiButton>
            </div>

            <!-- 代码 Tab -->
            <div v-show="activeTab === 'code'">
              <div class="flex justify-between items-center mb-4 pb-3 border-b border-black/[0.06]">
                <h3 class="text-base font-semibold text-[#1d1d1f] m-0">实验代码</h3>
                <div class="flex gap-2 flex-wrap">
                  <UiButton @click="copyCode" class="h-[34px] px-4 rounded-[8px] text-[13px] font-medium text-[#6e6e73] bg-black/[0.04] border-none hover:bg-black/[0.08] active:scale-[0.96] transition-all cursor-pointer flex items-center gap-1.5">
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z"/><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z"/></svg>
                    复制代码
                  </UiButton>
                  <div class="relative" ref="fileDropdownRef">
                    <UiButton @click="fileDropdownOpen = !fileDropdownOpen" class="h-[34px] px-4 rounded-[8px] text-[13px] font-medium text-[#6b8f6b] bg-[#6b8f6b]/10 border-none hover:bg-[#6b8f6b]/15 active:scale-[0.96] transition-all cursor-pointer flex items-center gap-1.5">
                      <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5z"/></svg>
                      文件操作
                      <svg class="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M3 5l3 3 3-3"/></svg>
                    </UiButton>
                    <div v-show="fileDropdownOpen" class="absolute right-0 top-full mt-1 bg-white rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-black/[0.06] py-1 z-20 min-w-[140px]">
                      <UiButton @click="handleDownloadCode" class="w-full px-4 py-2 text-left text-[13px] text-[#1d1d1f] hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#6e6e73]" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"/><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/></svg>
                        下载代码
                      </UiButton>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 题目列表显示 -->
              <div v-if="submission.code">
                <!-- Question sub-tabs (left position) -->
                <div class="flex border border-black/[0.06] rounded-xl overflow-hidden mb-5">
                  <div class="flex flex-col border-r border-black/[0.06] bg-[#f9f9fb] min-w-[100px]">
                    <UiButton
                      @click="activeQuestionTab = 'full'"
                      class="px-4 py-2.5 text-[13px] font-medium text-left border-none cursor-pointer transition-all"
                      :class="activeQuestionTab === 'full' ? 'bg-white text-[var(--app-primary)] shadow-[inset_3px_0_0_var(--app-primary)]' : 'bg-transparent text-[#6e6e73] hover:bg-white/60'"
                    >完整源码</UiButton>
                    <UiButton
                      v-for="(question, index) in parsedQuestions"
                      :key="index"
                      @click="activeQuestionTab = String(index)"
                      class="px-4 py-2.5 text-[13px] font-medium text-left border-none cursor-pointer transition-all"
                      :class="activeQuestionTab === String(index) ? 'bg-white text-[var(--app-primary)] shadow-[inset_3px_0_0_var(--app-primary)]' : 'bg-transparent text-[#6e6e73] hover:bg-white/60'"
                    >第{{ question.number }}题</UiButton>
                  </div>
                  <div class="flex-1 p-4 overflow-auto">
                    <!-- Full source panel -->
                    <div v-show="activeQuestionTab === 'full'">
                      <pre class="bg-[#f5f7fa] rounded-lg p-4 overflow-x-auto font-mono leading-relaxed text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto m-0"><code>{{ submission.code }}</code></pre>
                    </div>
                    <!-- Per-question panels -->
                    <div v-for="(question, index) in parsedQuestions" :key="'q'+index" v-show="activeQuestionTab === String(index)">
                      <pre class="bg-[#f5f7fa] rounded-lg p-4 overflow-x-auto font-mono leading-relaxed text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto m-0"><code>{{ question.code }}</code></pre>

                      <div v-if="question.testResults" class="mt-4 p-3 bg-[#f8f8f8] rounded-lg">
                        <h4 class="text-sm font-semibold text-[#1d1d1f] m-0 mb-2">测试结果</h4>
                        <pre class="m-0 whitespace-pre-wrap break-words text-[13px] leading-[1.6] font-mono text-[#1d1d1f]">{{ formatTestResults(question.testResults) }}</pre>
                      </div>

                      <!-- Divider with label -->
                      <div class="flex items-center gap-3 my-5">
                        <span class="text-[13px] font-medium text-[#6e6e73]">教师评语</span>
                        <div class="flex-1 h-px bg-black/[0.06]"></div>
                      </div>

                      <!-- 评语编辑区 -->
                      <div class="py-2" ref="commentDivs">
                        <textarea
                          v-model="question.comment"
                          @input="updateQuestionComment(index, $event.target.value)"
                          rows="3"
                          placeholder="请输入对本题的评语.."
                          class="w-full px-4 py-3 rounded-[10px] border border-black/[0.1] bg-white text-sm text-[#1d1d1f] placeholder-[#aeaeb2] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20 focus:border-[var(--app-primary)] transition-all"
                        ></textarea>
                        <div class="flex justify-end mt-2">
                          <UiButton
                            @click="saveQuestionComment(index)"
                            :disabled="question.saving"
                            class="h-[32px] px-4 rounded-[8px] text-[13px] font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span v-if="question.saving" class="flex items-center gap-1.5">
                              <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              保存中...
                            </span>
                            <span v-else>保存评语</span>
                          </UiButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else class="flex flex-col items-center justify-center py-16 text-[#aeaeb2]">
                <svg class="w-12 h-12 mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                <span class="text-sm">暂无代码提交</span>
              </div>

              <!-- 代码运行结果 -->
              <div v-if="codeResult" class="mt-5 pt-4 border-t border-black/[0.06]">
                <div class="flex justify-between items-center mb-3 p-4 bg-[#f9f9fb] rounded-xl">
                  <h3 class="text-base font-semibold text-[#1d1d1f] m-0">运行结果</h3>
                  <span
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="codeResult.success ? 'bg-[#6b8f6b]/10 text-[#6b8f6b]' : 'bg-[#c44b3f]/10 text-[#c44b3f]'"
                  >{{ codeResult.success ? '运行成功' : '运行失败' }}</span>
                </div>
                <pre class="bg-[#f5f7fa] rounded-lg p-4 font-mono max-h-[200px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed m-0">{{ codeResult.output }}</pre>
              </div>
            </div>

            <!-- 实验报告 Tab -->
            <div v-show="activeTab === 'report'">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-base font-semibold text-[#1d1d1f] m-0">实验报告</h3>
                <div class="flex gap-2 mt-0">
                  <div class="relative" ref="reportDropdownRef">
                    <UiButton @click="reportDropdownOpen = !reportDropdownOpen" class="h-[34px] px-4 rounded-[8px] text-[13px] font-medium text-[#6b8f6b] bg-[#6b8f6b]/10 border-none hover:bg-[#6b8f6b]/15 active:scale-[0.96] transition-all cursor-pointer flex items-center gap-1.5">
                      <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"/><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"/></svg>
                      下载报告
                      <svg class="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M3 5l3 3 3-3"/></svg>
                    </UiButton>
                    <div v-show="reportDropdownOpen" class="absolute right-0 top-full mt-1 bg-white rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-black/[0.06] py-1 z-20 min-w-[160px]">
                      <UiButton @click="downloadWordDoc(); reportDropdownOpen = false" class="w-full px-4 py-2 text-left text-[13px] text-[#1d1d1f] hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#6e6e73]" viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5z"/></svg>
                        下载 Word 文档
                      </UiButton>
                      <UiButton @click="downloadPDF(); reportDropdownOpen = false" class="w-full px-4 py-2 text-left text-[13px] text-[#1d1d1f] hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#6e6e73]" viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5z"/></svg>
                        下载 PDF 文档
                      </UiButton>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="submission.report" class="max-w-[1024px] mx-auto p-5 bg-white">
                <report-generator :report-data="reportData" @update:report-data="handleReportDataUpdate" ref="reportGeneratorRef" />
              </div>
              <div v-else class="flex flex-col items-center justify-center py-16 text-[#aeaeb2]">
                <svg class="w-12 h-12 mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                <span class="text-sm">学生未提交实验报告</span>
              </div>
            </div>

            <!-- 学生表现 Tab -->
            <div v-show="activeTab === 'performance'">
              <div class="mb-5">
                <h3 class="text-base font-semibold text-[#1d1d1f] m-0">学习表现分析</h3>
              </div>

              <div class="grid grid-cols-2 gap-5 mb-5">
                <div class="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
                  <div class="text-sm font-medium text-[#6e6e73] mb-3">实验成绩趋势</div>
                  <div class="h-[320px] w-full" ref="scoreChartContainer"></div>
                </div>
                <div class="rounded-[16px] border border-black/[0.06] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
                  <div class="text-sm font-medium text-[#6e6e73] mb-3">实验完成情况</div>
                  <div class="h-[320px] w-full" ref="completionChartContainer"></div>
                </div>
              </div>

              <!-- 综合表现评估 -->
              <div class="rounded-[16px] border border-black/[0.06] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div class="flex items-center justify-between mb-5 pb-3 border-b border-black/[0.06]">
                  <span class="text-sm font-semibold text-[#1d1d1f]">综合表现评估</span>
                </div>

                <!-- Descriptions as key-value grid -->
                <div class="grid grid-cols-3 gap-4 mb-5">
                  <div class="bg-[#f9f9fb] rounded-xl p-4">
                    <div class="text-[12px] text-[#6e6e73] mb-1">平均成绩</div>
                    <div class="text-lg font-semibold" :class="getScoreClass(studentPerformance.averageScore)">{{ studentPerformance.averageScore }}</div>
                  </div>
                  <div class="bg-[#f9f9fb] rounded-xl p-4">
                    <div class="text-[12px] text-[#6e6e73] mb-1">实验完成率</div>
                    <div class="text-lg font-semibold text-[#1d1d1f]">{{ studentPerformance.completionRate }}%</div>
                  </div>
                  <div class="bg-[#f9f9fb] rounded-xl p-4">
                    <div class="text-[12px] text-[#6e6e73] mb-1">班级排名</div>
                    <div class="text-lg font-semibold text-[#1d1d1f]">第{{ studentPerformance.classRank }} 名</div>
                  </div>
                  <div class="bg-[#f9f9fb] rounded-xl p-4">
                    <div class="text-[12px] text-[#6e6e73] mb-1">作业提交及时性</div>
                    <div class="flex items-center gap-0.5 mt-1">
                      <template v-for="i in 5" :key="'p'+i">
                        <svg class="w-4 h-4" :class="i <= Math.round(studentPerformance.punctuality) ? 'text-[#c49a3c]' : 'text-black/10'" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      </template>
                      <span class="text-xs text-[#6e6e73] ml-1">{{ studentPerformance.punctuality }}</span>
                    </div>
                  </div>
                  <div class="bg-[#f9f9fb] rounded-xl p-4">
                    <div class="text-[12px] text-[#6e6e73] mb-1">代码质量评分</div>
                    <div class="flex items-center gap-0.5 mt-1">
                      <template v-for="i in 5" :key="'cq'+i">
                        <svg class="w-4 h-4" :class="i <= Math.round(studentPerformance.codeQuality) ? 'text-[#c49a3c]' : 'text-black/10'" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      </template>
                      <span class="text-xs text-[#6e6e73] ml-1">{{ studentPerformance.codeQuality }}</span>
                    </div>
                  </div>
                  <div class="bg-[#f9f9fb] rounded-xl p-4">
                    <div class="text-[12px] text-[#6e6e73] mb-1">沟通参与度</div>
                    <div class="flex items-center gap-0.5 mt-1">
                      <template v-for="i in 5" :key="'pa'+i">
                        <svg class="w-4 h-4" :class="i <= Math.round(studentPerformance.participation) ? 'text-[#c49a3c]' : 'text-black/10'" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      </template>
                      <span class="text-xs text-[#6e6e73] ml-1">{{ studentPerformance.participation }}</span>
                    </div>
                  </div>
                </div>

                <!-- AI点评 -->
                <div class="mt-5">
                  <h4 class="text-sm font-semibold text-[#1d1d1f] mb-2">AI助教点评</h4>
                  <div class="p-4 bg-[#f5f7fa] rounded-xl leading-relaxed text-sm text-[#1d1d1f]" v-html="renderMarkdown(submission.aiRemarks)"></div>
                </div>

                <!-- Divider -->
                <div class="my-6 h-px bg-black/[0.06]"></div>

                <!-- 学习建议 -->
                <div>
                  <h4 class="text-sm font-semibold text-[#1d1d1f] mb-3">学习建议</h4>
                  <div v-if="learningRecommendations.length > 0" class="flex flex-col gap-2">
                    <div v-for="(rec, index) in learningRecommendations" :key="index" class="border border-black/[0.06] rounded-xl overflow-hidden">
                      <UiButton
                        @click="rec.expanded = !rec.expanded"
                        class="w-full px-4 py-3 flex items-center justify-between bg-[#f9f9fb] hover:bg-[#f0f0f5] transition-colors cursor-pointer border-none text-left"
                      >
                        <span class="text-[13px] font-medium text-[#1d1d1f]">{{ rec.title }}</span>
                        <svg class="w-4 h-4 text-[#6e6e73] transition-transform" :class="{ 'rotate-180': rec.expanded }" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                      </UiButton>
                      <div v-show="rec.expanded" class="px-4 py-3">
                        <p class="text-sm text-[#424245] m-0">{{ rec.content }}</p>
                        <div v-if="rec.resources && rec.resources.length" class="mt-3">
                          <h5 class="text-xs font-semibold text-[#6e6e73] mb-1">推荐资源：</h5>
                          <ul class="list-disc pl-4 m-0">
                            <li v-for="(resource, rIndex) in rec.resources" :key="rIndex" class="text-sm">
                              <a :href="resource.url" target="_blank" class="text-[var(--app-primary)] hover:underline">{{ resource.name }}</a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="flex flex-col items-center justify-center py-10 text-[#aeaeb2]">
                    <span class="text-sm">暂无学习建议，请点击'生成综合评估报告'生成</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 学情追踪 Tab -->
            <div v-if="tabLoaded.tracking">
              <div v-show="activeTab === 'tracking'">
                <LearningTracking
                  :student-id="submission.studentId"
                  :experiment-id="submission.experimentId"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 评分对话框 -->
    <AppModal v-model="gradeDialogVisible" title="评分" width="500px">
      <div class="flex flex-col gap-5">
        <div class="grid grid-cols-[100px_1fr] items-center gap-y-4">
          <span class="text-sm text-[#6e6e73]">学生</span>
          <span class="text-sm text-[#1d1d1f]">{{ submission.studentName }}</span>

          <span class="text-sm text-[#6e6e73]">实验名称</span>
          <span class="text-sm text-[#1d1d1f]">{{ submission.experimentName }}</span>

          <span class="text-sm text-[#6e6e73]">上机成绩得分</span>
          <div class="flex items-center gap-2">
            <UiInput
              type="number"
              v-model.number="gradeForm.score"
              :min="0"
              :max="100"
              step="0.1"
              class="w-[120px] h-[36px] px-3 rounded-[8px] border border-black/[0.1] bg-white text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20 focus:border-[var(--app-primary)] transition-all"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <UiButton @click="gradeDialogVisible = false" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-black/[0.04] border-none hover:bg-black/[0.08] active:scale-[0.96] transition-all cursor-pointer">取消</UiButton>
        <UiButton @click="submitGrade" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">提交评分</UiButton>
      </template>
    </AppModal>

    <!-- 历史代码对话框 -->
    <AppModal v-model="historyCodeVisible" :title="selectedHistory ? selectedHistory.title : '历史代码'" width="70%">
      <div v-if="selectedHistory">
        <div class="mb-4 pb-4 border-b border-black/[0.06]">
          <div class="text-sm text-[#1d1d1f]"><strong>提交时间：</strong>{{ selectedHistory.time }}</div>
          <div class="text-sm text-[#1d1d1f] mt-1"><strong>描述：</strong>{{ selectedHistory.content }}</div>
        </div>
        <pre class="bg-[#f5f7fa] rounded-lg p-4 overflow-x-auto font-mono leading-relaxed text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto m-0"><code>{{ selectedHistory.code }}</code></pre>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage, loading as uiLoading } from '@/services/feedback'
import api from '../../api'
import AppModal from '../../components/AppModal.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import * as echarts from 'echarts/core'
import axios from 'axios'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import ReportGenerator from '../../components/ReportGenerator.vue'
import LearningTracking from './components/LearningTracking.vue'
import { DocxGenerator } from '../../utils/docxGenerator'
import html2canvas from 'html2canvas';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  BarChart,
  PieChart,
  CanvasRenderer
])

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const activeTab = ref('code')
const submissionId = computed(() => String(route.params.id))
const submission = ref({})
const tabLoaded = ref({ code: true, report: false, performance: false, tracking: false })

// Tab definitions
const mainTabs = [
  { name: 'code', label: '代码' },
  { name: 'report', label: '实验报告' },
  { name: 'performance', label: '学生表现' },
  { name: 'tracking', label: '学情追踪' }
]

// Dropdown states
const fileDropdownOpen = ref(false)
const fileDropdownRef = ref(null)
const reportDropdownOpen = ref(false)
const reportDropdownRef = ref(null)

const normalizeStudentId = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const normalizeSubmitTime = (value) => {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  if (parsed.getFullYear() <= 2000) return null
  return raw
}

const formatDateTime = (value) => {
  const normalized = normalizeSubmitTime(value)
  if (!normalized) return ''
  const date = new Date(normalized)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const studentName = computed(() => submission.value?.studentName || '')
const submitDisplayTime = computed(() =>
  formatDateTime(submission.value?.submitTime || submission.value?.date)
)
const codeResult = ref(null)
const scoreChartContainer = ref(null)
const completionChartContainer = ref(null)
let scoreChart = null
let completionChart = null

const disposeCharts = () => {
  scoreChart?.dispose()
  scoreChart = null
  completionChart?.dispose()
  completionChart = null
}

// 题目解析相关
const activeQuestionTab = ref('full')
const parsedQuestions = ref([])

// 评分相关
const gradeDialogVisible = ref(false)
const gradeForm = reactive({
  score: 0,
  plagiarismRate: 0,
  aiComment: '',
  teacherComment: ''
})

// 历史记录相关
const submissionHistory = ref([])
const historyCodeVisible = ref(false)
const selectedHistory = ref(null)

// 学生表现
const studentPerformance = reactive({
  averageScore: 0,
  completionRate: 0,
  classRank: '-',
  punctuality: 0,
  codeQuality: 0,
  participation: 0,
  aiAnalysis: ''
})

// 学习建议
const learningRecommendations = ref([])

// 报告相关
const reportData = ref({})
const reportGeneratorRef = ref(null)

// 解析提交代码，按题目分割
const parseQuestionCode = () => {
  parsedQuestions.value = []
  if (!submission.value || !submission.value.code) return

  const code = submission.value.code
  const questions = []
  const headingRegex = /(?:^|\n)\s*第\s*(\d+)\s*题\s*(?:如下)?\s*[:：]?\s*\n/g
  const headings = []

  let headingMatch
  while ((headingMatch = headingRegex.exec(code)) !== null) {
    headings.push({
      number: Number(headingMatch[1]),
      contentStart: headingRegex.lastIndex,
      headingStart: headingMatch.index
    })
  }

  headings.forEach((heading, index) => {
    const nextHeading = headings[index + 1]
    let questionCode = code
      .slice(heading.contentStart, nextHeading ? nextHeading.headingStart : code.length)
      .trim()

    const testResultsRegex = /([\s\S]*?)((?:\|\s*测试点[\s\S]*?)+$)/
    const resultMatch = questionCode.match(testResultsRegex)

    let testResults = null
    if (resultMatch) {
      questionCode = resultMatch[1].trim()
      testResults = resultMatch[2].trim()
    }

    questions.push({
      number: heading.number,
      code: questionCode,
      testResults,
      comment: '',
      saving: false
    })
  })

  parsedQuestions.value = questions
  activeQuestionTab.value = code ? 'full' : activeQuestionTab.value

  if (questions.length === 0 && code) {
    parsedQuestions.value = [{
      number: 1,
      code: code,
      testResults: null,
      comment: '',
      saving: false
    }]
  }
}

const formatTestResults = (resultsText) => {
  if (!resultsText) return ''
  return String(resultsText)
}

const updateQuestionComment = (index, comment) => {
  parsedQuestions.value[index].comment = comment
  updateReportWithComments()
}

const renderMarkdown = (text) => {
  if (!text) return ''
  const rawHtml = marked.parse(text)
  return DOMPurify.sanitize(rawHtml)
}

const splitAiRemarksToQuestions = () => {
  const aiRemarks = submission.value.aiRemarks || '';
  const questionRegex = /题目\s*([123456789\d]+)[:：]([\s\S]*?)(?=题目[123456789\d]+[:：]|总体评估|$)/g;
  const summaryRegex = /总体评估([\s\S]*)$/;
  let match;
  let questionComments = [];
  while ((match = questionRegex.exec(aiRemarks)) !== null) {
    questionComments.push(match[2].trim());
  }
  const summaryMatch = aiRemarks.match(summaryRegex);
  if (summaryMatch) {
    submission.value.aiRemarks = summaryMatch[1].trim();
  } else {
    submission.value.aiRemarks = '';
  }
  parsedQuestions.value.forEach((q, i) => {
    if (questionComments[i]) q.comment = questionComments[i];
  });
};

const createCommentPreviewElement = (comment, imageWidth) => {
  const commentContainer = document.createElement('div');
  commentContainer.className = 'teacher-comment-preview absolute -left-[9999px] -top-[9999px] w-[var(--comment-preview-width)] bg-white';
  commentContainer.style.setProperty('--comment-preview-width', `${imageWidth}px`);

  const panel = document.createElement('div');
  panel.className = 'box-border w-full border border-[#ddd] bg-[#f9f9f9] p-[15px]';

  const title = document.createElement('h3');
  title.className = 'mb-[1em] mt-0 border-b border-[#eee] pb-2 text-[16px] text-red-600';
  title.textContent = '\u6559\u5e08\u8bc4\u8bed\uff1a';

  const body = document.createElement('div');
  body.className = 'whitespace-pre-wrap text-[14px] leading-[1.5] text-red-600';
  body.textContent = comment || '';

  panel.append(title, body);
  commentContainer.appendChild(panel);
  return commentContainer;
};

const captureCommentPreview = async (commentContainer, imageWidth, logging) => {
  await ensureFontsLoaded();
  document.body.appendChild(commentContainer);
  const canvas = await html2canvas(commentContainer, {
    ['backgroundColor']: '#ffffff',
    scale: 2,
    logging,
    useCORS: true,
    ['width']: imageWidth,
    timeout: 1000
  });
  document.body.removeChild(commentContainer);
  return canvas;
};

const generateCommentImage = async (question) => {
  const viewportWidth = window.innerWidth;
  const imageWidth = Math.min(viewportWidth * 0.15, 500);
  const commentContainer = createCommentPreviewElement(question.comment, imageWidth);
  const canvas = await captureCommentPreview(commentContainer, imageWidth, false);
  question.commentImage = canvas.toDataURL('image/png', 1.0);
  question.commentImageWidth = imageWidth;
};

const saveQuestionComment = async (index) => {
  const question = parsedQuestions.value[index];

  if (!question.saving) {
    question.saving = true;
  }

  try {
    await api.saveQuestionComment(submissionId.value, index, question.comment);

    const viewportWidth = window.innerWidth;
    const imageWidth = Math.min(viewportWidth * 0.1, 500);
    const commentContainer = createCommentPreviewElement(question.comment, imageWidth);
    const canvas = await captureCommentPreview(commentContainer, imageWidth, true);

    const imageDataUrl = canvas.toDataURL('image/png', 1.0);
    question.commentImage = imageDataUrl;
    question.commentImageWidth = imageWidth;

    updateReportWithComments();
      uiMessage.success(`第${question.number}题评语保存成功`);
  } catch (error) {
    logger.error('保存评语失败:', error);
      uiMessage.error(`第${question.number}题评语保存失败 ${error.message}`);
  } finally {
    question.saving = false;
  }
};

const ensureFontsLoaded = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
};

const updateReportWithComments = () => {
  if (!reportData.value) {
    prepareReportData();
  }

  let stepsContent = '';
  parsedQuestions.value.forEach((question) => {
      stepsContent += `### 第${question.number}题\n\n`;
    stepsContent += '```c\n' + question.code + '\n```\n\n';

    if (question.commentImage) {
      stepsContent += `<div class="comment-image-container" data-image="${question.commentImage}"></div>\n\n`;
    }
    else if (question.comment) {
        stepsContent += `**教师评语**：${question.comment}\n\n`;
    }
  });

  reportData.value.steps = stepsContent;

  if (activeTab.value === 'report' && reportGeneratorRef.value &&
      typeof reportGeneratorRef.value.updateReport === 'function') {
    nextTick(() => {
      reportGeneratorRef.value.updateReport();
    });
  }
};

const getScoreClass = (score) => {
  if (!score) return ''
  if (score >= 90) return 'text-[#6b8f6b]'
  if (score >= 80) return 'text-[#c2703e]'
  if (score >= 60) return 'text-[#c49a3c]'
  return 'text-[#c44b3f]'
}

const loadSubmissionDetail = async () => {
  loading.value = true
  try {
    const data = await api.getSubmissionDetail(submissionId.value)
    submission.value = {
      ...data,
      studentId: normalizeStudentId(data?.studentId),
      submitTime: normalizeSubmitTime(data?.submitTime || data?.date),
      date: normalizeSubmitTime(data?.submitTime || data?.date)
    }
    gradeForm.score = submission.value.score || 0
    gradeForm.plagiarismRate = submission.value.plagiarismRate || 0
    gradeForm.aiComment = submission.value.aiComment || ''
    gradeForm.teacherComment = submission.value.teacherComment || ''
    parseQuestionCode()

    splitAiRemarksToQuestions();

    for (const q of parsedQuestions.value) {
      if (q.comment) {
        await generateCommentImage(q);
      }
    }

    prepareReportData()
    loadSubmissionHistory()
    loadLearningRecommendations()
    loadStudentPerformance()
    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    logger.error('加载提交详情失败:', error)
  } finally {
    loading.value = false
  }
}

const loadSubmissionHistory = async () => {
  try {
    const allData = await api.getAllStudentExperiments()
    const studentId = submission.value.studentId
    if (!allData || !studentId) {
      submissionHistory.value = []
      return
    }
    const studentSubs = allData
      .filter(s => String(s.studentId) === String(studentId))
      .map(s => ({
        ...s,
        submitTime: normalizeSubmitTime(s.submitTime || s.date)
      }))
      .sort((a, b) => {
        const left = a.submitTime ? new Date(a.submitTime).getTime() : -1
        const right = b.submitTime ? new Date(b.submitTime).getTime() : -1
        return right - left
      })

    submissionHistory.value = studentSubs.map((s, idx) => ({
      time: s.submitTime || s.date || '未知时间',
      type: s.status === 'completed' ? 'submit' : 'edit',
      title: s.experimentName || `实验${idx + 1}`,
      content: `得分: ${s.score || '未评分'} | 状态: ${s.status === 'completed' ? '已完成' : '进行中'}`,
      code: null
    }))
    submissionHistory.value = submissionHistory.value.map(item => ({
      ...item,
      time: formatDateTime(item.time)
    }))
  } catch (error) {
    logger.error('加载提交历史失败:', error)
    submissionHistory.value = []
  }
}

const loadLearningRecommendations = async () => {
  try {
    const allData = await api.getAllStudentExperiments()
    const studentId = submission.value.studentId
    if (!allData || !studentId) { learningRecommendations.value = []; return }

    const studentSubs = allData.filter(s => String(s.studentId) === String(studentId))
    const scored = studentSubs.filter(s => s.score > 0)
    const avgScore = scored.length > 0 ? scored.reduce((a, b) => a + b.score, 0) / scored.length : 0
    const lowScoreExps = scored.filter(s => s.score < 70)

    const recs = []
    if (lowScoreExps.length > 0) {
      recs.push({
        title: '薄弱实验需要加强',
        content: `以下实验得分较低，建议重点复习：${lowScoreExps.map(s => s.experimentName + '(' + s.score + '分)').join('、')}`,
        resources: [],
        expanded: false
      })
    }
    if (avgScore < 80 && avgScore > 0) {
      recs.push({
        title: '提升整体成绩',
        content: `当前平均成绩为${Math.round(avgScore * 10) / 10}分，建议多做练习题巩固基础知识，争取将平均分提升到80分以上。`,
        resources: [],
        expanded: false
      })
    }
    const completed = studentSubs.filter(s => s.status === 'completed').length
    const total = studentSubs.length
    if (total > 0 && completed / total < 0.8) {
      recs.push({
        title: '提高实验完成率',
        content: `目前完成了${completed}/${total}个实验（${Math.round(completed / total * 100)}%），建议尽快完成未提交的实验。`,
        resources: [],
        expanded: false
      })
    }
    if (recs.length === 0) {
      recs.push({
        title: '表现优秀，继续保持',
        content: `该学生各项实验完成情况良好，平均成绩${Math.round(avgScore * 10) / 10}分，建议继续保持并挑战更高难度的题目。`,
        resources: [],
        expanded: false
      })
    }
    learningRecommendations.value = recs
  } catch (error) {
    logger.error('加载学习建议失败:', error)
    learningRecommendations.value = []
  }
}

const loadStudentPerformance = async () => {
  try {
    const allData = await api.getAllStudentExperiments()
    const studentId = submission.value.studentId
    if (!allData || !studentId) return

    const studentSubs = allData.filter(s => String(s.studentId) === String(studentId))
    const scored = studentSubs.filter(s => s.score > 0)
    const completed = studentSubs.filter(s => s.status === 'completed')
    const total = studentSubs.length

    studentPerformance.averageScore = scored.length > 0
      ? Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length * 10) / 10 : 0

    studentPerformance.completionRate = total > 0 ? Math.round(completed.length / total * 100) : 0

    const studentScores = {}
    allData.filter(s => s.score > 0).forEach(s => {
      const studentKey = normalizeStudentId(s.studentId)
      if (!studentScores[studentKey]) studentScores[studentKey] = []
      studentScores[studentKey].push(s.score)
    })
    const rankings = Object.entries(studentScores)
      .map(([id, scores]) => ({ id, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
      .sort((a, b) => b.avg - a.avg)
    const rank = rankings.findIndex(r => String(r.id) === String(studentId))
    studentPerformance.classRank = rank >= 0 ? rank + 1 : '-'

    studentPerformance.punctuality = Math.min(5, Math.round(studentPerformance.completionRate / 20 * 10) / 10)
    studentPerformance.codeQuality = Math.min(5, Math.round(studentPerformance.averageScore / 20 * 10) / 10)
    studentPerformance.participation = Math.min(5, Math.round(studentSubs.length / Math.max(1, new Set(allData.map(s => s.experimentId)).size) * 5 * 10) / 10)

    updatePerformanceCharts(studentSubs, allData)
  } catch (error) {
    logger.error('加载学生表现数据失败:', error)
  }
}

const updatePerformanceCharts = (studentSubs, allData) => {
  const scored = studentSubs.filter(s => s.score > 0).sort((a, b) => {
    const nameA = a.experimentName || ''
    const nameB = b.experimentName || ''
    return nameA.localeCompare(nameB, 'zh')
  })

  const expAvgs = {}
  allData.filter(s => s.score > 0).forEach(s => {
    const name = s.experimentName || '未知'
    if (!expAvgs[name]) expAvgs[name] = []
    expAvgs[name].push(s.score)
  })

  if (scoreChartContainer.value && scoreChart) {
    const labels = scored.map(s => s.experimentName || '实验')
    const scores = scored.map(s => s.score)
    const classAvg = labels.map(name => {
      const arr = expAvgs[name]
      return arr ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
    })
    scoreChart.setOption({
      xAxis: { data: labels },
      series: [
        { name: '成绩', data: scores },
        { name: '班级平均', data: classAvg }
      ]
    })
  }

  if (completionChartContainer.value && completionChart) {
    const completed = studentSubs.filter(s => s.status === 'completed').length
    const pending = studentSubs.length - completed
    const allExpCount = new Set(allData.map(s => s.experimentId)).size
    const notSubmitted = Math.max(0, allExpCount - studentSubs.length)
    completionChart.setOption({
      series: [{
        data: [
          { value: completed, name: '已完成', itemStyle: { color: '#67C23A' } },
          { value: pending, name: '进行中', itemStyle: { color: '#E6A23C' } },
          { value: notSubmitted, name: '未提交', itemStyle: { color: '#F56C6C' } }
        ]
      }]
    })
  }
}

const initCharts = () => {
  disposeCharts()

  if (scoreChartContainer.value) {
    scoreChart = echarts.init(scoreChartContainer.value)
    const scoreOption = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['实验1', '实验2', '实验3', '当前实验', '实验5']
      },
      yAxis: { type: 'value', name: '分数', min: 0, max: 100 },
      series: [
        {
          name: '成绩',
          type: 'line',
          data: [82, 88, 75, submission.value.score || 0, null],
          markPoint: {
            data: [
              { type: 'max', name: '最高分' },
              { type: 'min', name: '最低分' }
            ]
          }
        },
        {
          name: '班级平均',
          type: 'line',
          data: [75, 78, 72, 80, null],
          lineStyle: { type: 'dashed' }
        }
      ]
    }
    scoreChart.setOption(scoreOption)
  }

  if (completionChartContainer.value) {
    completionChart = echarts.init(completionChartContainer.value)
    const completionOption = {
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['按时完成', '逾期完成', '未完成']
      },
      series: [
        {
          name: '完成情况',
          type: 'pie',
          radius: '70%',
          center: ['50%', '60%'],
          data: [
            { value: 4, name: '按时完成', itemStyle: { color: '#67C23A' } },
            { value: 1, name: '逾期完成', itemStyle: { color: '#E6A23C' } },
            { value: 0, name: '未完成', itemStyle: { color: '#F56C6C' } }
          ],
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
    completionChart.setOption(completionOption)
  }
}

const goBack = () => {
  router.go(-1)
}

const openGradeDialog = () => {
  gradeDialogVisible.value = true
}

const submitGrade = async () => {
  try {
    submission.value = {
      ...submission.value,
      score: gradeForm.score,
      plagiarismRate: gradeForm.plagiarismRate,
      aiComment: gradeForm.aiComment,
      teacherComment: gradeForm.teacherComment,
      status: 'graded'
    }

    if (reportData.value) {
      reportData.value.score = gradeForm.score;
    } else {
      prepareReportData();
    }

    updateReportWithComments();

    if (activeTab.value === 'report' && reportGeneratorRef.value) {
      nextTick(() => {
        if (typeof reportGeneratorRef.value.updateReport === 'function') {
          reportGeneratorRef.value.updateReport();
        }
      });
    }

    gradeDialogVisible.value = false
    uiMessage.success('评分成功')
  } catch (error) {
    logger.error('评分失败:', error)
    uiMessage.error('评分失败，请稍后重试')
  }
}

const prepareReportData = () => {
  if (!submission.value) return

  reportData.value = {
    experimentName: submission.value.experimentName || '数据结构实验',
    studentName: submission.value.studentName || '未知',
    studentId: submission.value.studentId || '未知学号',
    className: submission.value.class || '未知班级',
    courseName: '数据结构',
    score: submission.value.score !== null && submission.value.score !== undefined
        ? Number(submission.value.score) : null,
    teacherName: '指导教师',
    labName: '计算机实验室',
    labTime: new Date().toLocaleDateString(),
  }

  if (submission.value.report) {
    try {
      const report = submission.value.report

      const purposeMatch = report.match(/##?\s*实验目的[^\n]*\n+([\s\S]+?)(?=##)/i)
      if (purposeMatch) reportData.value.purpose = purposeMatch[1].trim()

      const requirementsMatch = report.match(/##?\s*实验环境[^\n]*\n+([\s\S]+?)(?=##)/i)
      if (requirementsMatch) reportData.value.requirements = requirementsMatch[1].trim()

      const tasksMatch = report.match(/##?\s*实验内容[^\n]*\n+([\s\S]+?)(?=##)/i) ||
          report.match(/##?\s*实验任务[^\n]*\n+([\s\S]+?)(?=##)/i)
      if (tasksMatch) reportData.value.tasks = tasksMatch[1].trim()

      const resultsMatch = report.match(/##?\s*实验结果[^\n]*\n+([\s\S]+?)(?=##)/i)
      if (resultsMatch) reportData.value.results = resultsMatch[1].trim()

      const summaryMatch = report.match(/##?\s*实验总结[^\n]*\n+([\s\S]+?)(?=$)/i) ||
          report.match(/##?\s*心得体会[^\n]*\n+([\s\S]+?)(?=$)/i)
      if (summaryMatch) reportData.value.summary = summaryMatch[1].trim()
    } catch (e) {
      logger.error('解析报告内容失败:', e)
    }
  }

  if (parsedQuestions.value.length > 0) {
    updateReportWithComments()
  }
}

const handleReportDataUpdate = (newData) => {
  reportData.value = newData
}

const copyCode = () => {
  navigator.clipboard.writeText(submission.value.code)
      .then(() => {
        uiMessage.success('代码已复制到剪贴板')
      })
      .catch(() => {
        uiMessage.error('复制失败，请手动复制')
      })
}

const downloadCode = () => {
  if (!submission.value?.code) {
    uiMessage.warning('暂无代码可下载')
    return
  }
  const blob = new Blob([submission.value.code], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${submission.value.experimentName}_${submission.value.studentName}.c`
  link.click()
  URL.revokeObjectURL(link.href)
}

const handleDownloadCode = () => {
  downloadCode()
  fileDropdownOpen.value = false
}

const downloadWordDoc = async () => {
  if (!reportData.value) {
    uiMessage.warning('没有报告数据可下载')
    return
  }

  try {
    const exportData = { ...reportData.value }

    if (submission.value.score !== undefined && submission.value.score !== null) {
      exportData.score = String(submission.value.score)
    }

    if (submission.value.teacherComment) {
      exportData.teacherComment = submission.value.teacherComment
    }

    updateReportWithComments()

    const docxGenerator = new DocxGenerator()
    const blob = await docxGenerator.generateStandardReport(exportData)

    const fileName = `${submission.value.studentId}_${submission.value.studentName}_${submission.value.experimentName}.docx`
    DocxGenerator.downloadReport(blob, fileName)

    uiMessage.success('Word文档下载成功')
  } catch (error) {
    logger.error('生成Word文档失败:', error)
    uiMessage.error('生成Word文档失败，请稍后重试')
  }
}

const downloadPDF = async () => {
  try {
    const loadingInstance = uiLoading.service({
      lock: true,
      text: 'PDF生成中，请稍候..',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    const exportData = { ...reportData.value };

    if (submission.value.score !== undefined && submission.value.score !== null) {
      exportData.score = String(submission.value.score);
    }

    if (submission.value.teacherComment) {
      exportData.teacherComment = submission.value.teacherComment;
    }

    const docxGenerator = new DocxGenerator();
    const wordBlob = await docxGenerator.generateStandardReport(exportData);

    const formData = new FormData();
    formData.append('wordFile', new Blob([wordBlob]), 'report.docx');

    const response = await axios.post('/api/convert-to-pdf', formData, {
      responseType: 'blob',
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    loadingInstance.close();

    const fileName = `${submission.value.studentId}_${submission.value.studentName}_${submission.value.experimentName}.pdf`;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    uiMessage.success('PDF文档下载成功');
  } catch (error) {
    logger.error('生成PDF文档失败:', error);
    uiMessage.error('生成PDF文档失败，请稍后重试');

    const loadingInstance = uiLoading.service();
    loadingInstance.close();
  }
}

const handleResize = () => {
  scoreChart?.resize()
  completionChart?.resize()
}

// Close dropdowns on outside click
const handleDocumentClick = (e) => {
  if (fileDropdownRef.value && !fileDropdownRef.value.contains(e.target)) {
    fileDropdownOpen.value = false
  }
  if (reportDropdownRef.value && !reportDropdownRef.value.contains(e.target)) {
    reportDropdownOpen.value = false
  }
}

onMounted(() => {
  loadSubmissionDetail()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleDocumentClick)

  let reportComponentInitialized = false;

  watch(() => activeTab.value, (newTab) => {
    // 标记 Tab 已加载（用于 v-if 懒加载）
    tabLoaded.value[newTab] = true

    if (newTab === 'report' && submission.value) {
      prepareReportData();

      nextTick(() => {
        if (reportGeneratorRef.value && typeof reportGeneratorRef.value.updateReport === 'function') {
          reportGeneratorRef.value.updateReport();
          reportComponentInitialized = true;
        } else {
          setTimeout(() => {
            if (reportGeneratorRef.value && typeof reportGeneratorRef.value.updateReport === 'function') {
              reportGeneratorRef.value.updateReport();
              reportComponentInitialized = true;
            }
          }, 500);
        }
      });
    }
  }, { immediate: true });

  watch(() => submission.value.score, (newScore) => {
    if (reportData.value) {
      reportData.value.score = newScore;
      if (activeTab.value === 'report' && reportGeneratorRef.value) {
        nextTick(() => {
          if (typeof reportGeneratorRef.value.updateReport === 'function') {
            reportGeneratorRef.value.updateReport();
          }
        });
      }
    }
  });

  watch(() => reportGeneratorRef.value, (newRef) => {
    if (newRef && !reportComponentInitialized && activeTab.value === 'report' && reportData.value) {
      nextTick(() => {
        if (typeof newRef.updateReport === 'function') {
          newRef.updateReport();
          reportComponentInitialized = true;
        }
      });
    }
  });

  watch(() => parsedQuestions.value, () => {
    if (parsedQuestions.value.length > 0) {
      updateReportWithComments();
    }
  }, { deep: true });
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleDocumentClick)
  disposeCharts()
})
</script>
