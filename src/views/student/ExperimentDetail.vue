<template>
  <div class="g-page [font-family:var(--font-page)]">
    <UiPageHeader title="实验详情" :description="currentExp?.name || '加载中..'">
      <UiButton class="g-outline-btn [background:#fff] [border:1px_solid_#dadce0] [border-radius:100px] [padding:8px_20px] [font-size:13px] [color:#5f6368] [font-weight:500] [cursor:pointer] [transition:all_0.2s] hover:[background:#f8f9fa] hover:[border-color:#bdc1c6]" @click="$router.push('/student/experiments')">←返回列表</UiButton>
    </UiPageHeader>

    <loading-state :loading="loading">
      <div v-if="currentExp" class="g-content [display:flex] [flex-direction:column] [gap:16px]">
        <!-- 信息条-->
        <div class="g-info-bar [display:flex] [align-items:center] [gap:20px] [padding:16px_20px] [background:#fff] [border-radius:16px] [border:1px_solid_#dadce0] [flex-wrap:wrap]">
          <span class="g-chip [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500]" :class="'c-' + currentExp.status">{{ statusText }}</span>
          <span v-if="hasScore" class="g-info-item [display:flex] [align-items:center] [gap:6px]">
            <span class="g-info-label [font-size:12px] [color:#5f6368]">得分</span>
            <span class="g-info-val [font-size:14px] [font-weight:500] [color:#202124] [color:#1a73e8] [font-size:18px]">{{ currentExp.score }}</span>
          </span>
          <span v-if="currentExp.deadline" class="g-info-item [display:flex] [align-items:center] [gap:6px]">
            <span class="g-info-label [font-size:12px] [color:#5f6368]">截止</span>
            <span class="g-info-val [font-size:14px] [font-weight:500] [color:#202124]">{{ currentExp.deadline }}</span>
          </span>
          <span v-if="currentExp.submitTime" class="g-info-item [display:flex] [align-items:center] [gap:6px]">
            <span class="g-info-label [font-size:12px] [color:#5f6368]">提交</span>
            <span class="g-info-val [font-size:14px] [font-weight:500] [color:#202124]">{{ currentExp.submitTime }}</span>
          </span>
          <span v-if="isCompleted && currentExp.plagiarismRate != null" class="g-info-item [display:flex] [align-items:center] [gap:6px]">
            <span class="g-info-label [font-size:12px] [color:#5f6368]">查重率</span>
            <span class="g-info-val [font-size:14px] [font-weight:500] [color:#202124]" :class="plagiarismClass">{{ currentExp.plagiarismRate }}%</span>
          </span>
        </div>

        <section v-if="publishedGrading?.published" class="rounded-[16px] border border-[#bfe2ca] bg-[#f6fcf8] p-5">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="text-sm font-semibold text-[#1f5130]">教师批改结果</div>
              <div class="mt-2 flex items-baseline gap-2">
                <span class="text-3xl font-semibold text-[#15803d]">{{ publishedGrading.score ?? '-' }}</span>
                <span class="text-sm text-[#5f6f64]">分</span>
              </div>
              <p v-if="publishedGrading.finalReviewComment" class="mt-3 max-w-4xl whitespace-pre-line text-sm leading-7 text-[#33453a]">{{ publishedGrading.finalReviewComment }}</p>
            </div>
            <UiButton v-if="publishedGrading.hasReport" :disabled="downloadingPublishedReport" @click="downloadPublishedReport" class="h-10 rounded-lg border-none bg-[#15803d] px-5 text-sm text-white disabled:opacity-50">
              {{ downloadingPublishedReport ? '下载中...' : '下载批注报告' }}
            </UiButton>
          </div>
        </section>

        <!-- 标签页-->
        <div class="g-card [background:#fff] [border-radius:16px] [border:1px_solid_#dadce0] [overflow:hidden]">
          <div class="g-tabs [display:flex] [border-bottom:1px_solid_#dadce0] [padding:0_20px]">
            <UiButton class="g-tab [background:none] [border:none] [padding:12px_16px] [font-size:14px] [font-weight:500] [color:#5f6368] [cursor:pointer] [border-bottom:2px_solid_transparent] [transition:all_0.2s] [&.active]:[color:#1a73e8] [&.active]:[border-bottom-color:#1a73e8] disabled:[color:#9aa0a6] disabled:[cursor:not-allowed]" :class="{ active: activeTab === 'code' }" @click="activeTab = 'code'"><LucideIcon name="code" :size="16" class="mr-1.5" /> 代码</UiButton>
            <UiButton class="g-tab [background:none] [border:none] [padding:12px_16px] [font-size:14px] [font-weight:500] [color:#5f6368] [cursor:pointer] [border-bottom:2px_solid_transparent] [transition:all_0.2s] [&.active]:[color:#1a73e8] [&.active]:[border-bottom-color:#1a73e8] disabled:[color:#9aa0a6] disabled:[cursor:not-allowed]" :class="{ active: activeTab === 'ai' }" @click="activeTab = 'ai'" v-if="false"><LucideIcon name="bot" :size="16" class="mr-1.5" /> AI助教点评</UiButton>
            <UiButton class="g-tab [background:none] [border:none] [padding:12px_16px] [font-size:14px] [font-weight:500] [color:#5f6368] [cursor:pointer] [border-bottom:2px_solid_transparent] [transition:all_0.2s] [&.active]:[color:#1a73e8] [&.active]:[border-bottom-color:#1a73e8] disabled:[color:#9aa0a6] disabled:[cursor:not-allowed]" :class="{ active: activeTab === 'report' }" @click="activeTab = 'report'" :disabled="!isCompleted"><LucideIcon name="clipboard-text" :size="16" class="mr-1.5" /> 实验报告</UiButton>
            <UiButton class="g-tab [background:none] [border:none] [padding:12px_16px] [font-size:14px] [font-weight:500] [color:#5f6368] [cursor:pointer] [border-bottom:2px_solid_transparent] [transition:all_0.2s] [&.active]:[color:#1a73e8] [&.active]:[border-bottom-color:#1a73e8]" :class="{ active: activeTab === 'analysis' }" @click="activeTab = 'analysis'"><LucideIcon name="search" :size="16" class="mr-1.5" /> AI 错误分析</UiButton>
          </div>

          <!-- 代码 -->
          <div v-if="activeTab === 'code'" class="g-tab-body [padding:20px]">
            <div v-if="!currentExp.code || !isCompleted" class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="file-code" :size="48" /></div>
              <div class="g-empty-text [font-size:16px] [font-weight:500] [color:#202124] [margin-bottom:6px]">暂无代码提交</div>
              <UiButton class="g-primary-btn [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:10px_24px] [font-size:14px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc]" @click="goToPTA">前往PTA平台完成实验</UiButton>
            </div>
            <div v-else>
              <div class="g-toolbar [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:12px]">
                <span class="g-toolbar-title [font-size:14px] [font-weight:500] [color:#202124]">提交代码</span>
                <UiButton class="g-outline-btn-sm [background:#fff] [border:1px_solid_#dadce0] [border-radius:100px] [padding:4px_14px] [font-size:12px] [color:#5f6368] [cursor:pointer] [transition:all_0.2s] hover:[background:#f8f9fa]" @click="copyCode">复制</UiButton>
              </div>
              <CodeViewer :code="currentExp.code" language="cpp" maxHeight="500px" />
            </div>
          </div>

          <!-- AI点评 -->
          <div v-if="activeTab === 'ai'" class="g-tab-body [padding:20px]">
            <div class="g-toolbar [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:12px]">
              <div class="g-ai-badge [display:flex] [align-items:center] [gap:8px] [font-size:14px] [font-weight:500] [color:#202124]">
                <span class="g-ai-dot [width:8px] [height:8px] [border-radius:50%] [background:#1e8e3e] [animation:pulse_2s_infinite]"></span> AI 助教点评
                <span v-if="aiSource === 'cache'" class="g-chip c-info [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500] [background:#f1f3f4] [color:#5f6368]">已缓存</span>
                <span v-else-if="aiSource === 'deepseek'" class="g-chip c-ok [display:inline-block] [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:500] [background:#e6f4ea] [color:#1e8e3e]">刚生成</span>
              </div>
              <UiButton v-if="isCompleted" class="g-primary-btn-sm [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:6px_16px] [font-size:13px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc] disabled:[background:#9aa0a6] disabled:[cursor:not-allowed]" :disabled="aiGenerating" @click="generateAiComment(true)">
                {{ aiGenerating ? '分析中...' : (hasAiComment ? '重新生成' : '生成AI点评') }}
              </UiButton>
            </div>
            <div v-if="aiGenerating" class="g-ai-loading [padding:20px_0]">
              <ui-skeleton :rows="6" animated />
              <div class="g-ai-loading-tip [display:flex] [align-items:center] [justify-content:center] [gap:8px] [color:#5f6368] [font-size:13px] [margin-top:16px]">
                <ui-icon class="is-loading"><Loading /></ui-icon>
                正在调用 DeepSeek 分析代码，预计需要10-20 秒..
              </div>
            </div>
            <div v-else-if="hasAiComment" class="g-ai-content markdown-body [background:#f8f9fa] [padding:24px] [border-radius:12px] [border:1px_solid_#e8eaed] [font-size:14px] [line-height:1.8] [color:#202124] [&_h1]:[color:#202124] [&_h1]:[margin:20px_0_10px] [&_h1]:[font-size:16px] [&_h2]:[color:#202124] [&_h2]:[margin:20px_0_10px] [&_h2]:[font-size:16px] [&_h3]:[color:#202124] [&_h3]:[margin:20px_0_10px] [&_h3]:[font-size:16px] [&_h3]:[font-size:15px] [&_p]:[margin:8px_0] [&_p]:[line-height:1.8] [&_ul]:[padding-left:20px] [&_ul]:[margin:8px_0] [&_ol]:[padding-left:20px] [&_ol]:[margin:8px_0] [&_li]:[margin:4px_0] [&_strong]:[color:#1a73e8] [&_code]:[background:#e8eaed] [&_code]:[padding:2px_6px] [&_code]:[border-radius:4px] [&_code]:[font-size:13px] [&_code]:[color:#d93025] [&_pre]:[background:#1e1e2e] [&_pre]:[color:#cdd6f4] [&_pre]:[padding:16px] [&_pre]:[border-radius:8px] [&_pre]:[overflow-x:auto] [&_pre]:[margin:10px_0] [&_pre_code]:[background:none] [&_pre_code]:[color:inherit] [&_pre_code]:[padding:0] [&_blockquote]:[border-left:4px_solid_#1a73e8] [&_blockquote]:[padding:8px_16px] [&_blockquote]:[margin:10px_0] [&_blockquote]:[background:#e8f0fe] [&_blockquote]:[border-radius:0_8px_8px_0] [&_blockquote]:[color:#5f6368]" v-html="renderedAiComment"></div>
            <div v-else class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="bot" :size="48" /></div>
              <div class="g-empty-text [font-size:16px] [font-weight:500] [color:#202124] [margin-bottom:6px]">{{ isCompleted ? '暂无AI点评' : '请先完成实验' }}</div>
              <div class="g-empty-sub [font-size:13px] [color:#5f6368] [margin-bottom:20px]">{{ isCompleted ? '点击上方按钮，AI助教将为您的代码进行专业点评' : '完成实验提交后，即可获取AI助教的代码点评' }}</div>
              <UiButton v-if="isCompleted" class="g-primary-btn [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:10px_24px] [font-size:14px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc]" @click="generateAiComment(false)">生成AI点评</UiButton>
            </div>
          </div>

          <!-- 报告 -->
          <div v-if="activeTab === 'report'" class="g-tab-body [padding:20px]">
            <div v-if="!isCompleted" class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-text [font-size:16px] [font-weight:500] [color:#202124] [margin-bottom:6px]">完成实验后可生成报告</div>
            </div>
            <div v-else class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="clipboard-check" :size="48" /></div>
              <div class="g-empty-text [font-size:16px] [font-weight:500] [color:#202124] [margin-bottom:6px]">AI实验报告生成</div>
              <div class="g-empty-sub [font-size:13px] [color:#5f6368] [margin-bottom:20px]">基于您的代码和AI点评，快速生成专业的实验报告</div>
              <UiButton class="g-primary-btn [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:10px_24px] [font-size:14px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc]" @click="$router.push('/student/ai-report')">前往AI报告生成中心</UiButton>
            </div>
          </div>

          <!-- AI错误分析（点击触发 → 功能一：代码诊断 + 条件触发 功能二：主动干预） -->
          <div v-if="activeTab === 'analysis'" class="g-tab-body [padding:20px]">
            <!-- 未分析 / 空状态 -->
            <div v-if="!errorChecked && !errorLoading && !errorAnalysisData" class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="search" :size="48" /></div>
              <div class="g-empty-text [font-size:18px] [font-weight:500] [color:#202124] [margin-bottom:6px]">AI 错误代码分析</div>
              <div class="g-empty-sub [font-size:15px] [color:#5f6368] [margin-bottom:20px]">点击下方按钮，AI将分析您的最新提交代码</div>
              <UiButton class="g-primary-btn [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:10px_24px] [font-size:15px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc] disabled:[background:#9aa0a6]" :disabled="errorLoading" @click="runErrorAnalysis">
                {{ errorLoading ? '分析中...' : '开始分析' }}
              </UiButton>
            </div>

            <!-- 加载中 -->
            <div v-if="errorLoading" class="g-ai-loading [padding:20px_0]">
              <ui-skeleton :rows="6" animated />
              <div class="g-ai-loading-tip [display:flex] [align-items:center] [justify-content:center] [gap:8px] [color:#5f6368] [font-size:15px] [margin-top:16px]">
                <ui-icon class="is-loading"><Loading /></ui-icon>
                正在分析提交记录，预计需要10-20 秒..
              </div>
            </div>

            <!-- 分析完成 -->
            <template v-if="errorAnalysisData && !errorLoading">
              <!-- 无提交记录 -->
              <div v-if="!errorAnalysisData.latestCode && !errorAnalysisData.latestJudgeStatus && !errorAnalysisData.errorCategories?.length" class="g-empty [text-align:center] [padding:48px_20px]">
                <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="inbox" :size="48" /></div>
                <div class="g-empty-text [font-size:18px] [font-weight:500] [color:#202124] [margin-bottom:6px]">暂无提交记录</div>
                <div class="g-empty-sub [font-size:15px] [color:#5f6368]">完成PTA平台实验后可使用AI错误分析功能</div>
              </div>

              <!-- 功能一：错误代码诊断（有提交时展示） -->
              <div v-else class="g-section [margin-bottom:16px]">
                <div class="g-section-header [display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:12px]">
                  <span class="g-section-title [font-size:17px] [font-weight:500] [color:#202124]">
                    代码错误诊断
                    <span v-if="!errorAnalysisData.aiGenerated" class="g-chip c-warning [display:inline-block] [font-size:12px] [padding:2px_10px] [border-radius:100px] [font-weight:500] [background:#fef7e0] [color:#e37400] [margin-left:8px]">规则引擎</span>
                  </span>
                  <UiButton class="g-outline-btn-sm [background:#fff] [border:1px_solid_#dadce0] [border-radius:100px] [padding:4px_14px] [font-size:14px] [color:#5f6368] [cursor:pointer] [transition:all_0.2s] hover:[background:#f8f9fa]" :disabled="errorLoading" @click="runErrorAnalysis(true)">重新分析</UiButton>
                </div>

                <!-- 最新提交概况 -->
                <div v-if="errorAnalysisData.latestCode || errorAnalysisData.latestJudgeStatus" class="g-latest-submission [background:#f8f9fa] [border:1px_solid_#e8eaed] [border-radius:10px] [padding:14px_16px] [margin-bottom:14px]">
                  <div class="g-latest-header [display:flex] [align-items:center] [gap:10px] [margin-bottom:8px]">
                    <span class="g-latest-label [font-size:14px] [font-weight:500] [color:#202124]">最新提交</span>
                    <span v-if="errorAnalysisData.latestJudgeStatus" class="g-judge-badge [display:inline-block] [font-size:12px] [padding:2px_10px] [border-radius:100px] [font-weight:500]" :class="judgeBadgeClass(errorAnalysisData.latestJudgeStatus)">
                      判题结果：{{ judgeStatusLabel(errorAnalysisData.latestJudgeStatus) }}
                    </span>
                  </div>
                  <CodeViewer v-if="errorAnalysisData.latestCode" :code="errorAnalysisData.latestCode" language="cpp" maxHeight="400px" />
                </div>

                <!-- 全 AC / 无错误 正面反馈 -->
                <div v-if="!errorAnalysisData.errorCategories?.length" class="g-all-clear [background:#e6f4ea] [border:1px_solid_#a8dab5] [padding:16px_20px] [border-radius:10px] [text-align:center] [margin-bottom:14px]">
                  <div class="g-all-clear-icon [margin-bottom:8px]"><LucideIcon name="party-popper" :size="28" /></div>
                  <div class="g-all-clear-text [font-size:17px] [font-weight:500] [color:#137333] [margin-bottom:4px]">未检测到错误，所有提交均已通过！</div>
                  <div class="g-all-clear-sub [font-size:15px] [color:#3c4043]">以下是代码优化和进阶学习建议</div>
                </div>

                <!-- 总体评估 -->
                <div v-if="errorAnalysisData.overallAssessment" class="g-assessment [background:#f0f7ff] [border:1px_solid_#c2dbfe] [padding:12px_16px] [border-radius:10px] [font-size:15px] [line-height:1.8] [color:#174ea6] [margin-bottom:14px]">
                  {{ errorAnalysisData.overallAssessment }}
                </div>

                <!-- 错误分类 + 修改建议 -->
                <div v-for="(cat, idx) in errorAnalysisData.errorCategories" :key="idx" class="g-error-card [background:#fff] [border:1px_solid_#e8eaed] [border-radius:10px] [padding:14px_16px] [margin-bottom:10px]">
                  <div class="g-error-card-header [display:flex] [align-items:center] [gap:8px] [margin-bottom:8px]">
                    <span class="g-error-type-badge [display:inline-block] [font-size:12px] [padding:2px_8px] [border-radius:4px] [font-weight:500]" :class="errorBadgeClass(cat.type)">
                      {{ errorTypeLabel(cat.type) }}
                    </span>
                    <span class="g-error-count [font-size:14px] [color:#5f6368]">{{ cat.count }}次</span>
                    <span v-if="cat.isSystemic" class="g-chip c-danger [display:inline-block] [font-size:12px] [padding:1px_6px] [border-radius:100px] [font-weight:500] [background:#fce8e6] [color:#c5221f]">系统性问题</span>
                  </div>
                  <div v-if="cat.rootCause" class="g-root-cause [font-size:15px] [color:#5f6368] [margin-bottom:6px]">
                    <span class="g-label [font-weight:500] [color:#202124]">根本原因：</span>{{ cat.rootCause }}
                  </div>
                  <div v-if="cat.suggestions?.length" class="g-fix-suggestions [background:#f8f9fa] [border-radius:8px] [padding:10px_14px]">
                    <div class="g-fix-title [font-size:14px] [font-weight:500] [color:#1a73e8] [margin-bottom:6px]">修改建议</div>
                    <ul class="g-fix-list [margin:0] [padding-left:18px] [font-size:15px] [line-height:1.8] [color:#3c4043]">
                      <li v-for="(sug, si) in cat.suggestions" :key="si">{{ sug }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 分隔 + 功能二：主动干预（≥3次错误时展示） -->
              <template v-if="warningData?.triggered">
                <div class="g-section-divider [border-top:1px_solid_#e8eaed] [margin:20px_0]"></div>
                <div class="g-section [margin-bottom:16px]">
                  <div class="g-section-title [font-size:17px] [font-weight:500] [color:#202124] [margin-bottom:12px]">
                    AI 综合诊断与学习建议
                  </div>

                  <!-- 预警消息 -->
                  <div v-if="warningData.warningMessage" class="g-warning-alert [background:#fef7e0] [border:1px_solid_#f9d849] [padding:10px_16px] [border-radius:10px] [font-size:15px] [color:#5f6368] [margin-bottom:10px]">
                    {{ warningData.warningMessage }}
                  </div>

                  <!-- 预警等级 + 给教师的建议 -->
                  <div class="g-warning-meta [display:flex] [gap:12px] [margin-bottom:14px] [flex-wrap:wrap]">
                    <span class="g-level-badge [display:inline-block] [font-size:14px] [padding:3px_12px] [border-radius:100px] [font-weight:500]" :class="warningLevelClass(warningData.level)">
                      {{ warningLevelLabel(warningData.level) }}
                    </span>
                    <span v-if="warningData.teacherNote" class="g-teacher-note [font-size:14px] [color:#5f6368] [line-height:1.6]">
                      {{ warningData.teacherNote }}
                    </span>
                  </div>

                  <!-- 建议行动 -->
                  <div v-if="warningData.suggestedActions?.length" class="g-actions [background:#f8f9fa] [border-radius:8px] [padding:10px_14px] [margin-bottom:14px]">
                    <div class="g-sub-title [font-size:14px] [font-weight:500] [color:#1a73e8] [margin-bottom:6px]">建议行动</div>
                    <ul class="g-action-list [margin:0] [padding-left:18px] [font-size:15px] [line-height:1.8] [color:#3c4043]">
                      <li v-for="(act, ai) in warningData.suggestedActions" :key="ai">{{ act }}</li>
                    </ul>
                  </div>

                  <!-- 学习建议（复用 error 分析的结果） -->
                  <div v-if="errorAnalysisData.learningSuggestions?.length" class="g-learning-section [margin-top:14px]">
                    <div class="g-sub-title [font-size:14px] [font-weight:500] [color:#5f6368] [margin-bottom:8px]">学习建议</div>
                    <div v-for="(ls, idx) in errorAnalysisData.learningSuggestions" :key="'ls-'+idx" class="g-learning-item [background:#e8f0fe] [border-radius:8px] [padding:10px_14px] [margin-bottom:8px]">
                      <span class="g-priority-badge [display:inline-block] [font-size:12px] [padding:2px_8px] [border-radius:100px] [font-weight:500] [margin-right:8px]" :class="priorityBadgeClass(ls.priority)">{{ ls.priority }}</span>
                      <span class="g-topic [font-weight:500] [font-size:15px] [color:#202124]">{{ ls.topic }}</span>
                      <span v-if="ls.reason" class="g-reason [font-size:14px] [color:#5f6368] [margin-left:8px]">— {{ ls.reason }}</span>
                      <div v-if="ls.suggestedResources" class="g-resource [font-size:14px] [color:#1a73e8] [margin-top:4px] [margin-left:42px]">{{ ls.suggestedResources }}</div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- LeetCode 推荐练习入口（全 AC 和 有错误 都显示） -->
              <div class="g-leetcode-entry [margin-top:14px] [text-align:center]">
                <UiButton class="g-outline-btn [background:#fff] [border:1px_solid_#dadce0] [border-radius:100px] [padding:10px_24px] [font-size:15px] [color:#1a73e8] [font-weight:500] [cursor:pointer] [transition:all_0.2s] hover:[background:#e8f0fe] hover:[border-color:#1a73e8]" @click="router.push('/student/leetcode-search')">
                  前往 LeetCode 拓展推荐练习
                </UiButton>
              </div>
            </template>

            <!-- API 调用失败 -->
            <div v-if="errorChecked && !errorLoading && !errorAnalysisData" class="g-empty [text-align:center] [padding:48px_20px]">
              <div class="g-empty-icon [margin-bottom:12px]"><LucideIcon name="alert-triangle" :size="48" /></div>
              <div class="g-empty-text [font-size:18px] [font-weight:500] [color:#202124] [margin-bottom:6px]">分析失败</div>
              <div class="g-empty-sub [font-size:15px] [color:#5f6368] [margin-bottom:20px]">AI 错误分析服务暂时不可用，请稍后重试</div>
              <UiButton class="g-primary-btn [background:#1a73e8] [color:#fff] [border:none] [border-radius:100px] [padding:10px_24px] [font-size:15px] [font-weight:500] [cursor:pointer] [transition:background_0.2s] hover:[background:#1765cc]" :disabled="errorLoading" @click="runErrorAnalysis">重试</UiButton>
            </div>
          </div>
        </div>
      </div>
      <ui-empty v-else description="未找到该实验" />
    </loading-state>
  </div>
</template>

<script setup>
import { useExperimentStore } from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import LoadingState from '../../components/LoadingState.vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { Loading } from '@/components/ui/icons'
import LucideIcon from '@/components/LucideIcon.vue'
import CodeViewer from '@/components/CodeViewer.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import axios from 'axios'
import api from '@/api'
import { API_BASE_URL } from '../../config/runtime'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'
const API_BASE = API_BASE_URL
const route = useRoute()
const router = useRouter()
const experimentStore = useExperimentStore()
const loading = ref(true)
const activeTab = ref('code')
const aiGenerating = ref(false)
const aiSource = ref('')
const localAiComment = ref('')
const errorAnalysisData = ref(null)
const errorLoading = ref(false)
const errorChecked = ref(false)
const warningData = ref(null)
const publishedGrading = ref(null)
const downloadingPublishedReport = ref(false)

const experimentId = computed(() => Number(route.params.id))
const currentExp = computed(() => {
  const exp = experimentStore.currentExperiment
  if (!exp) return null
  return (exp.data && typeof exp.data === 'object' && exp.data.id) ? exp.data : exp
})

const isCompleted = computed(() => currentExp.value?.status === 'completed')
const hasScore = computed(() => currentExp.value?.score !== null && currentExp.value?.score !== undefined && currentExp.value?.score !== '')
const statusText = computed(() => ({ completed: '已完成', in_progress: '进行中' }[currentExp.value?.status] || '未开始'))
const plagiarismClass = computed(() => {
  const r = currentExp.value?.plagiarismRate || 0
  return r > 20 ? 'danger-text' : r > 10 ? 'warning-text' : ''
})

const aiCommentRaw = computed(() => localAiComment.value || currentExp.value?.aiComment || '')
const hasAiComment = computed(() => {
  const c = aiCommentRaw.value; return c && c.trim() && !c.includes('暂时还没有生成AI点评')
})
const renderedAiComment = computed(() => hasAiComment.value ? DOMPurify.sanitize(marked(aiCommentRaw.value)) : '')

function copyCode() {
  if (currentExp.value?.code) { navigator.clipboard.writeText(currentExp.value.code); uiMessage.success('代码已复制') }
}
function goToPTA() { uiMessage.info('请前往PTA平台完成实验') }

async function generateAiComment(force) {
  if (!isCompleted.value) return
  aiGenerating.value = true; aiSource.value = ''
  try {
    const res = await axios.post(`${API_BASE}/api/experiments/${experimentId.value}/ai-comment/generate?force=${force}`, null, { withCredentials: true })
    const data = res.data || res
    if (data.success && data.aiComment) {
      localAiComment.value = data.aiComment; aiSource.value = data.source || 'deepseek'
      if (data.source === 'deepseek') uiMessage.success('AI点评已生成')
    } else { uiMessage.warning(getFriendlyResponseMessage(data, 'AI 点评生成失败，请稍后重试')) }
  } catch (e) { uiMessage.error(getFriendlyErrorMessage(e, 'AI 点评生成失败，请稍后重试')) }
  finally { aiGenerating.value = false }
}

async function runErrorAnalysis(forceRefresh = false) {
  errorLoading.value = true
  errorChecked.value = true
  warningData.value = null
  try {
    const res = await api.analyzeError({ experimentId: experimentId.value, forceRefresh })
    if (res?.success && res.data) {
      errorAnalysisData.value = res.data
      await checkAndLoadWarning(forceRefresh)
    }
  } catch (e) {
    logger.error('错误分析失败:', e)
  } finally {
    errorLoading.value = false
  }
}

async function checkAndLoadWarning(forceRefresh = false) {
  try {
    const res = await api.getWarningAnalysis({ experimentId: experimentId.value, forceRefresh })
    if (res?.success && res.data) {
      if (res.data.triggered) {
        warningData.value = res.data
        showWarningPopup(res.data)
      }
    }
  } catch (e) {
    logger.error('预警检测失败:', e)
  }
}

function showWarningPopup(data) {
  const msg = data.warningMessage || data.interventionMessage || '检测到多次错误提交，建议查看AI分析结果'
  uiMessage.warning('AI 学习预警：' + msg)
}

// 点击 tab 时触发分析
watch(activeTab, (newTab) => {
  if (newTab === 'analysis' && !errorChecked.value) {
    runErrorAnalysis()
  }
})

// 判题状态展示
function judgeStatusLabel(status) {
  const labels = {
    ACCEPTED: '已通过', AC: '已通过',
    COMPILE_ERROR: '编译错误', RUNTIME_ERROR: '运行时错误',
    WRONG_ANSWER: '答案错误', TIME_LIMIT_EXCEEDED: '运行超时',
    MEMORY_LIMIT_EXCEEDED: '内存超限', SEGMENTATION_FAULT: '段错误',
    UNKNOWN: '未知',
  }
  return labels[status] || status
}
function judgeBadgeClass(status) {
  const classes = {
    ACCEPTED: 'c-ok [background:#e6f4ea] [color:#1e8e3e]',
    AC: 'c-ok [background:#e6f4ea] [color:#1e8e3e]',
    COMPILE_ERROR: 'c-danger [background:#fce8e6] [color:#c5221f]',
    RUNTIME_ERROR: 'c-warning [background:#fef7e0] [color:#e37400]',
    WRONG_ANSWER: 'c-info [background:#f1f3f4] [color:#5f6368]',
    TIME_LIMIT_EXCEEDED: 'c-warning [background:#fef7e0] [color:#e37400]',
    MEMORY_LIMIT_EXCEEDED: 'c-info [background:#e8f0fe] [color:#174ea6]',
  }
  return classes[status] || 'c-info [background:#f1f3f4] [color:#5f6368]'
}

function errorTypeLabel(type) {
  const labels = {
    COMPILE_ERROR: '编译错误',
    RUNTIME_ERROR: '运行时错误',
    WRONG_ANSWER: '答案错误',
    TIME_LIMIT_EXCEEDED: '运行超时',
    MEMORY_LIMIT_EXCEEDED: '内存超限',
    SEGMENTATION_FAULT: '段错误',
  }
  return labels[type] || type
}

function errorBadgeClass(type) {
  const classes = {
    COMPILE_ERROR: 'c-danger [background:#fce8e6] [color:#c5221f]',
    RUNTIME_ERROR: 'c-warning [background:#fef7e0] [color:#e37400]',
    WRONG_ANSWER: 'c-info [background:#f1f3f4] [color:#5f6368]',
    TIME_LIMIT_EXCEEDED: 'c-warning [background:#fef7e0] [color:#e37400]',
    MEMORY_LIMIT_EXCEEDED: 'c-info [background:#e8f0fe] [color:#174ea6]',
  }
  return classes[type] || 'c-info [background:#f1f3f4] [color:#5f6368]'
}

function priorityBadgeClass(severity) {
  const classes = {
    HIGH: 'c-danger [background:#fce8e6] [color:#c5221f]',
    MEDIUM: 'c-warning [background:#fef7e0] [color:#e37400]',
    LOW: 'c-info [background:#e8f0fe] [color:#174ea6]',
  }
  return classes[severity] || 'c-info'
}

function warningLevelClass(level) {
  const classes = {
    HIGH: 'c-danger [background:#fce8e6] [color:#c5221f]',
    MEDIUM: 'c-warning [background:#fef7e0] [color:#e37400]',
    LOW: 'c-info [background:#e8f0fe] [color:#174ea6]',
    OK: 'c-success [background:#e6f4ea] [color:#137333]',
  }
  return classes[level] || 'c-info'
}

function warningLevelLabel(level) {
  const labels = {
    HIGH: '高危预警',
    MEDIUM: '需要关注',
    LOW: '轻度提醒',
    OK: '表现良好',
  }
  return labels[level] || level
}

async function fetchPublishedGrading() {
  try {
    const res = await api.getPublishedGradingResult(experimentId.value)
    publishedGrading.value = res?.data || res
  } catch (error) {
    logger.warn('获取已发布批改结果失败:', error)
    publishedGrading.value = null
  }
}

async function downloadPublishedReport() {
  if (!publishedGrading.value?.submissionId) return
  downloadingPublishedReport.value = true
  try {
    const blob = await api.downloadPublishedGradingReport(publishedGrading.value.submissionId)
    const url = URL.createObjectURL(new Blob([blob]))
    const a = document.createElement('a')
    a.href = url
    a.download = publishedGrading.value.reportFilename || '教师批注报告.pdf'
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '批注报告下载失败'))
  } finally {
    downloadingPublishedReport.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await experimentStore.fetchExperimentDetail(experimentId.value)
    await fetchPublishedGrading()
    if (isCompleted.value && !hasAiComment.value) generateAiComment(false)
    // 不再自动加载错误分析，改为用户点击 tab 时触发
  } catch (e) { logger.error('加载实验详情失败:', e) }
  finally { loading.value = false }
})
</script>


