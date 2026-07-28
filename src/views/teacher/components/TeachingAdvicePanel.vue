<template>
  <section class="teaching-advice-shell rounded-[18px] border border-black/[0.06] bg-white/95 px-4 py-3.5 shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
    <div class="shrink-0 flex flex-col gap-3 border-b border-black/[0.06] pb-3 xl:flex-row xl:items-center xl:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-2.5">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-primary)] text-xs font-bold text-white">AI</span>
          <div>
            <h2 class="text-base font-semibold text-[#1d1d1f]">AI 助教 · 教学建议</h2>
            <p class="mt-0.5 text-xs leading-4 text-[#6e6e73]">先给可执行教学动作，数据依据放在后面核对。</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div class="inline-flex h-9 items-center rounded-[9px] bg-[#eef2f7] p-1 shadow-inner shadow-black/[0.04]" aria-label="建议分析层级">
          <button
            v-for="item in scopeOptions"
            :key="item.value"
            type="button"
            class="h-7 min-w-[70px] rounded-[6px] border-none px-2.5 text-xs font-semibold transition-all duration-200 ease-out"
            :class="scopeLevel === item.value ? 'translate-y-[-1px] bg-white text-[#1d1d1f] shadow-[0_3px_8px_rgba(15,23,42,0.14)]' : 'bg-transparent text-[#64748b] hover:bg-white/55 hover:text-[#1d1d1f]'"
            @click="changeScope(item.value)"
          >
            {{ item.label }}
          </button>
        </div>

        <UiSelect
          v-if="scopeLevel === 'EXPERIMENT'"
          v-model="experimentId"
          placeholder="选择实验"
          class="h-9 min-w-[200px] rounded-[9px] bg-[#f5f5f7] px-3 text-xs"
        >
          <UiOption v-for="item in experiments" :key="item.id" :value="item.id">{{ item.name }}</UiOption>
        </UiSelect>

        <button
          v-if="scopeLevel !== 'EXPERIMENT'"
          type="button"
          role="switch"
          :aria-checked="includeHistory"
          class="inline-flex h-9 items-center gap-2.5 rounded-[9px] border border-[#d7dee8] bg-white px-3 text-xs font-medium text-[#334155] shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:border-[#b8c7dc] hover:bg-[#f8fafc]"
          @click="includeHistory = !includeHistory"
        >
          <span class="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ease-out" :class="includeHistory ? 'bg-[var(--app-primary)]' : 'bg-[#cbd5e1]'">
            <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_4px_rgba(15,23,42,0.22)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]" :class="includeHistory ? 'translate-x-4' : 'translate-x-0'"></span>
          </span>
          <span class="shrink-0 leading-none">同课程历史学期</span>
        </button>

        <span v-if="disabledReason" class="rounded-full bg-[#fff7ed] px-3 py-1.5 text-right text-[11px] leading-4 text-[#a15c00]">{{ disabledReason }}</span>
      </div>
    </div>

    <div class="teaching-advice-body mt-3.5 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div v-if="errorMessage" class="rounded-[12px] border border-[#f0c4bd] bg-[#fff7f5] px-4 py-3 text-sm text-[#a63d32]">
        {{ errorMessage }}
      </div>

      <div v-if="reportGateMessage" class="rounded-[14px] border border-[#f0c4bd] bg-[#fff7f5] px-4 py-3 text-sm leading-6 text-[#a63d32] shadow-[0_6px_16px_rgba(166,61,50,0.06)]">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="font-semibold">这份教学建议没有通过质量门禁</div>
            <p class="mt-1 text-xs leading-5 text-[#8a3a32]">{{ reportGateMessage }}</p>
          </div>
          <button
            type="button"
            :disabled="generateButtonDisabled"
            class="inline-flex h-8 shrink-0 items-center justify-center rounded-[9px] border border-[#f0c4bd] bg-white px-3 text-xs font-semibold text-[#a63d32] transition-all hover:bg-[#fff1ee] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            @click="generateReport"
          >
            重新生成
          </button>
        </div>
      </div>

      <div v-if="contextLoading" class="space-y-3 py-4">
        <div v-for="width in [92, 78, 84]" :key="width" class="h-4 animate-pulse rounded bg-[#f1f3f5]" :style="{ width: `${width}%` }"></div>
      </div>

      <template v-else-if="activeData">
        <div
          class="grid h-full min-h-0 grid-cols-1 gap-5"
          :class="{ 'xl:grid-cols-[minmax(0,1fr)_360px]': advice && focusPanelOpen }"
        >
          <div class="min-w-0 min-h-0 flex flex-col space-y-4">
            <section v-if="!advice && scopePreviewRows.length" class="rounded-[18px] border border-[#f2d49b] bg-[#fffaf0] px-4 py-3.5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-sm font-bold text-[#111827]">{{ currentScopeTitle }}数据预览</h3>
                    <span class="rounded-full bg-[#fff7e6] px-2.5 py-1 text-[11px] font-semibold text-[#a15c00]">{{ scopeDescription }}</span>
                  </div>
                  <p class="mt-1 text-xs leading-5 text-[#64748b]">生成按钮会基于这组范围数据生成对应层级的教学建议。</p>
                </div>
                <span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#64748b]">{{ activeScopeLevelLabel }}</span>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                <div v-for="item in scopePreviewRows" :key="item.key" class="rounded-[12px] border border-white bg-white px-3 py-2">
                  <div class="text-[11px] font-medium text-[#64748b]">{{ item.label }}</div>
                  <div class="mt-1 text-base font-bold text-[#111827]">{{ item.value }}</div>
                  <div class="mt-0.5 truncate text-[10px] text-[#94a3b8]" :title="item.hint">{{ item.hint }}</div>
                </div>
              </div>
            </section>

            <div v-if="false && advice" class="rounded-[22px] border border-[#f2d49b] bg-[#fffaf0] p-4 shadow-[0_10px_28px_rgba(180,120,40,0.08)] lg:p-5">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="min-w-0">
                  <div class="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#991b1b]">
                    <span class="h-2 w-2 rounded-full bg-[#ef4444]"></span>
                    老师先看这里
                  </div>
                  <h3 class="mt-4 compact-line-clamp-2 text-[22px] font-bold leading-tight text-[#111827] lg:text-[24px]">{{ teachingConclusion.problem || adviceSummary }}</h3>
                  <div class="mt-3 max-w-[820px] text-sm leading-6 text-[#374151] lg:text-[15px]">
                    <p class="compact-line-clamp-2">{{ adviceSummary }}</p>
                    <button
                      v-if="hasConclusionDetails"
                      type="button"
                      class="mt-3 rounded-full border border-[#c7d7fe] bg-white/80 px-3 py-1 text-xs font-medium text-[#2f6fed]"
                      @click="conclusionExpanded = !conclusionExpanded"
                    >
                      {{ conclusionExpanded ? '收起原因与影响' : '展开原因与影响' }}
                    </button>
                    <div v-if="conclusionExpanded" class="mt-3 space-y-2 rounded-[14px] bg-white/75 px-4 py-3 text-xs leading-6 text-[#4b5563]">
                      <p v-if="teachingConclusion.cause"><span class="font-semibold text-[#111827]">可能原因：</span>{{ teachingConclusion.cause }}</p>
                      <p v-if="teachingConclusion.impact"><span class="font-semibold text-[#111827]">教学影响：</span>{{ teachingConclusion.impact }}</p>
                    </div>
                  </div>
                </div>
                <div class="shrink-0 rounded-[18px] bg-white/85 px-5 py-4 text-center shadow-sm">
                  <div class="text-xs text-[#8a8a8f]">处理优先级</div>
                  <div class="mt-2 text-2xl font-bold" :class="priorityBadge.className">{{ priorityBadge.label }}</div>
                  <div class="mt-1 text-xs text-[#8a8a8f]">{{ priorityBadge.hint }}</div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-[#6e6e73] md:grid-cols-4">
                <div v-for="item in scopeSummary" :key="item.label" class="min-w-0 rounded-[12px] bg-white/75 px-3 py-2">
                  <div>{{ item.label }}</div>
                  <div class="mt-1 truncate font-semibold text-[#1d1d1f]" :title="item.value">{{ item.value }}</div>
                </div>
              </div>
            </div>

            <div v-if="!advice" class="rounded-[22px] border border-dashed border-[#f2d49b] bg-[#fffaf0] px-5 py-10 text-center">
              <h3 class="text-lg font-semibold text-[#111827]">{{ activeReportGenerating ? 'AI 正在生成教学建议' : (reportGateMessage ? '请重新生成通过质量门禁的报告' : '先生成 AI 教学决策报告') }}</h3>
              <p class="mx-auto mt-2 max-w-[680px] text-sm leading-6 text-[#6e6e73]">
                {{ activeReportGenerating ? '后端已经保存生成任务，正在调用 AI 整理“核心教学问题、下一节课怎么教、分层学生怎么跟、实验/学期/课程怎么调”。页面会自动刷新结果。' : (reportGateMessage || '当前范围已就绪。点击生成后，页面会直接给出“核心教学问题、下一节课怎么教、分层学生怎么跟、实验/学期/课程怎么调”，不会在主区域重复堆数据。') }}
              </p>
              <button
                type="button"
                :disabled="generateButtonDisabled"
                class="mt-5 inline-flex h-11 min-w-[148px] items-center justify-center rounded-[13px] border border-[var(--app-primary)] bg-[var(--app-primary)] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(47,111,237,0.20)] transition-all hover:bg-[var(--app-primary-strong)] active:scale-[0.96] disabled:border-[#d1d5db] disabled:bg-[#e5e7eb] disabled:text-[#6b7280] disabled:shadow-none disabled:cursor-not-allowed"
                @click="generateReport"
              >
                {{ generateButtonLabel }}
              </button>
              <p v-if="disabledReason" class="mt-2 text-xs text-[#a15c00]">{{ disabledReason }}</p>
            </div>

            <div v-if="false && advice" class="overflow-hidden rounded-[22px] border border-[#c7d7fe] bg-[#fbfdff] shadow-[0_10px_26px_rgba(47,111,237,0.06)]">
              <div class="border-b border-[#f2d49b] bg-[#fffaf0] px-4 py-4">
                <div class="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f6fed]">Teaching Workflow</div>
                    <h3 class="mt-1 text-base font-semibold text-[#1d1d1f]">下一步教学执行清单</h3>
                    <p class="mt-1 text-xs leading-5 text-[#6e6e73]">只保留老师要执行的结构化建议：先讲什么、盯谁、收什么、怎么验收。</p>
                  </div>
                  <span class="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#2f6fed]">主阅读区</span>
                </div>
              </div>

              <div class="px-4 py-4">
                <div v-if="teacherQueueSummary.length" class="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  <div
                    v-for="item in teacherQueueSummary"
                    :key="item.label"
                    class="min-w-0 rounded-[14px] border border-white bg-white px-3 py-2 text-xs shadow-[0_4px_12px_rgba(15,23,42,0.04)]"
                  >
                    <div class="text-[#8a8a8f]">{{ item.label }}</div>
                    <div class="mt-1 compact-line-clamp-2 font-semibold leading-5 text-[#1d1d1f]">{{ item.value }}</div>
                  </div>
                </div>

                <div v-if="teachingQueueRows.length" class="mt-3 space-y-2.5">
                  <article
                    v-for="item in teachingQueueRows"
                    :key="item.key"
                    class="rounded-[18px] border bg-white p-3 shadow-[0_6px_16px_rgba(47,111,237,0.06)] lg:p-4"
                    :class="item.tone"
                  >
                    <div class="grid grid-cols-1 gap-3 xl:grid-cols-[132px_minmax(0,1fr)]">
                      <div class="flex items-center gap-2 xl:items-start">
                        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" :class="item.dotClass">
                          {{ item.badge }}
                        </span>
                        <div>
                          <div class="text-sm font-semibold text-[#1d1d1f]">{{ item.title }}</div>
                          <div v-if="item.duration" class="mt-0.5 text-[11px] text-[#8a8a8f]">{{ item.duration }}</div>
                        </div>
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-semibold leading-6 text-[#1d1d1f]">{{ item.action }}</p>
                        <div class="mt-2 grid grid-cols-1 gap-2 text-xs leading-5 md:grid-cols-2">
                          <div class="rounded-[12px] bg-[#f8fafc] px-3 py-2">
                            <span class="font-semibold text-[#374151]">用：</span>{{ item.material }}
                          </div>
                          <div class="rounded-[12px] bg-[#f8fafc] px-3 py-2">
                            <span class="font-semibold text-[#374151]">盯：</span>{{ item.target }}
                          </div>
                          <div class="rounded-[12px] bg-[#f8fafc] px-3 py-2">
                            <span class="font-semibold text-[#374151]">收：</span>{{ item.deliverable }}
                          </div>
                          <div class="rounded-[12px] bg-[#f8fafc] px-3 py-2">
                            <span class="font-semibold text-[#374151]">查：</span>{{ item.checkMethod }}
                          </div>
                        </div>
                        <details v-if="item.reason || item.evidenceRefs.length" class="mt-2 text-xs leading-5 text-[#4b5563]">
                          <summary class="cursor-pointer select-none text-[#2f6fed]">为什么这样排</summary>
                          <p v-if="item.reason" class="mt-1">{{ item.reason }}</p>
                          <p v-if="item.evidenceRefs.length" class="mt-1 font-mono text-[11px] text-[#8a8a8f]">证据：{{ joinRefs(item.evidenceRefs) }}</p>
                        </details>
                      </div>
                    </div>
                  </article>
                </div>
                <div v-else-if="teacherActionCards.length" class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <article
                    v-for="(item, index) in teacherActionCards"
                    :key="item.title"
                    class="rounded-[18px] border bg-white p-4 shadow-[0_6px_16px_rgba(47,111,237,0.06)]"
                    :class="quickActionTone(index)"
                  >
                    <div class="flex items-center gap-2">
                      <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" :class="quickActionDot(index)">
                        {{ index + 1 }}
                      </span>
                      <span class="text-xs font-semibold text-[#2f6fed]">{{ item.title }}</span>
                    </div>
                    <p class="mt-3 compact-line-clamp-2 text-sm font-semibold leading-6 text-[#1d1d1f]">{{ item.main }}</p>
                    <details v-if="item.detail" class="mt-2 text-xs leading-5 text-[#4b5563]">
                      <summary class="cursor-pointer select-none text-[#2f6fed]">看依据</summary>
                      <p class="mt-1">{{ item.detail }}</p>
                    </details>
                  </article>
                </div>
                <div v-else class="mt-3 rounded-[16px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm leading-6 text-[#92400e]">
                  AI 暂未返回“下一步怎么教”的结构化步骤。请重新生成，或查看下方判断依据和原始返回。
                </div>
              </div>
            </div>

            <div v-if="false && advice" class="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <article v-for="item in differentiatedRows" :key="item.title" class="rounded-[18px] border border-black/[0.07] bg-white p-4 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <div class="text-sm font-semibold text-[#1d1d1f]">{{ item.title }}</div>
                <p class="mt-2 compact-line-clamp-3 text-xs leading-6 text-[#4b5563]">{{ item.text }}</p>
              </article>
            </div>

            <div v-if="false && advice && (priorityProblemRows.length || priorityKnowledgeRows.length)" class="rounded-[20px] border border-black/[0.07] bg-white">
              <button
                type="button"
                class="flex w-full flex-wrap items-center justify-between gap-3 border-none bg-transparent px-5 py-4 text-left"
                @click="diagnosisExpanded = !diagnosisExpanded"
              >
                <div>
                  <h3 class="text-base font-semibold text-[#1d1d1f]">为什么这样教：题目 / 知识点依据</h3>
                  <p class="mt-1 text-xs leading-5 text-[#6e6e73]">主页面先看结论；需要核对时再展开错题、知识点、题干摘要。</p>
                </div>
                <span class="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#6e6e73]">
                  {{ diagnosisExpanded ? '收起依据' : '展开依据' }}
                </span>
              </button>
              <div class="flex flex-wrap gap-2 px-5 pb-4">
                <span
                  v-for="item in priorityPreviewBadges"
                  :key="item"
                  class="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#374151]"
                >
                  {{ item }}
                </span>
              </div>
              <div v-if="diagnosisExpanded" class="grid grid-cols-1 gap-3 border-t border-black/[0.06] px-5 py-4 lg:grid-cols-2">
                <article v-if="priorityProblemRows.length" class="rounded-[16px] border border-[#fecaca] bg-[#fffafa] p-4">
                  <div class="text-xs font-semibold text-[#991b1b]">高优先级错题</div>
                  <div class="mt-3 space-y-3">
                    <div v-for="item in priorityProblemRows" :key="`${item.problemNo}-${item.title}`" class="text-xs leading-5 text-[#4b5563]">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="rounded bg-[#fef2f2] px-2 py-0.5 font-mono text-[#b42318]">第 {{ item.problemNo || '-' }} 题</span>
                        <span class="font-semibold text-[#1d1d1f]">{{ item.title }}</span>
                      </div>
                      <p v-if="item.errorPoint" class="mt-1"><span class="font-semibold text-[#991b1b]">错误点：</span>{{ item.errorPoint }}</p>
                      <p v-if="item.teachingAdvice" class="mt-1"><span class="font-semibold text-[#1d1d1f]">怎么教：</span>{{ item.teachingAdvice }}</p>
                      <p v-if="item.problemStatementSummary" class="mt-1 text-[#6b7280]">题面摘要：{{ item.problemStatementSummary }}</p>
                    </div>
                  </div>
                </article>

                <article v-if="priorityKnowledgeRows.length" class="rounded-[16px] border border-[#f2d49b] bg-[#fff7e6] p-4">
                  <div class="text-xs font-semibold text-[#a15c00]">优先补救知识点</div>
                  <div class="mt-3 space-y-3">
                    <div v-for="item in priorityKnowledgeRows" :key="item.knowledge" class="text-xs leading-5 text-[#374151]">
                      <div class="font-semibold text-[#1d1d1f]">{{ item.knowledge }} <span class="font-normal text-[#6e6e73]">· {{ item.confidence || 'MEDIUM' }}</span></div>
                      <p v-if="item.teachingAdvice" class="mt-1">{{ item.teachingAdvice }}</p>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div v-if="false && advice && hasStudentLayerSummary" class="rounded-[20px] border border-black/[0.07] bg-white p-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 class="text-base font-semibold text-[#1d1d1f]">学生分层怎么用</h3>
                  <p class="mt-1 text-xs leading-5 text-[#6e6e73]">分层数据前面已经有图，这里只保留教学动作和跳转入口。</p>
                </div>
                <button
                  type="button"
                  class="h-8 rounded-full border border-[#f2d49b] bg-[#fff7e6] px-3 text-xs font-medium text-[#a15c00]"
                  @click="jumpToStudentLayer"
                >
                  跳转到分层分析
                </button>
              </div>
              <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div class="rounded-[14px] bg-[#fef2f2] px-4 py-3">
                  <div class="text-xs font-semibold text-[#991b1b]">重点帮扶层 {{ studentLayerSummary.supportCount ?? '-' }} 人</div>
                  <p class="mt-2 compact-line-clamp-2 text-xs leading-5 text-[#4b5563]">{{ studentLayerSummary.supportAction || studentLayerSummary.support }}</p>
                </div>
                <div class="rounded-[14px] bg-[#fff7ed] px-4 py-3">
                  <div class="text-xs font-semibold text-[#c2410c]">中等提升层 {{ studentLayerSummary.improveCount ?? '-' }} 人</div>
                  <p class="mt-2 compact-line-clamp-2 text-xs leading-5 text-[#4b5563]">{{ studentLayerSummary.improveAction || studentLayerSummary.improve }}</p>
                </div>
                <div class="rounded-[14px] bg-[#ecfdf5] px-4 py-3">
                  <div class="text-xs font-semibold text-[#047857]">拓展提升层 {{ studentLayerSummary.extendCount ?? '-' }} 人</div>
                  <p class="mt-2 compact-line-clamp-2 text-xs leading-5 text-[#4b5563]">{{ studentLayerSummary.extendAction || studentLayerSummary.extend }}</p>
                </div>
              </div>
            </div>

            <div v-if="false && advice" class="rounded-[20px] border border-black/[0.07] bg-white p-5">
              <h3 class="text-base font-semibold text-[#1d1d1f]">实验 / 学期 / 课程怎么调</h3>
              <div class="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div v-for="item in adjustmentRows" :key="item.title" class="rounded-[16px] bg-[#f8fafc] px-4 py-3">
                  <div class="text-xs font-semibold text-[#1d1d1f]">{{ item.title }}</div>
                  <p class="mt-2 compact-line-clamp-3 text-xs leading-5 text-[#4b5563]">{{ item.text }}</p>
                </div>
              </div>
            </div>

            <article v-if="advice" id="teaching-advice-markdown-root" ref="reportRootRef" class="teaching-advice-report min-h-0 flex-1 overflow-hidden rounded-[24px] border border-[#eadfce] bg-white p-4 shadow-[0_16px_38px_rgba(92,74,52,0.10)]">
              <button
                v-if="false"
                type="button"
                class="flex w-full flex-wrap items-center justify-between gap-3 border-none bg-[#fffaf0] px-5 py-4 text-left"
                @click="reportExpanded = !reportExpanded"
              >
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-base font-semibold text-[#1d1d1f]">完整 AI 建议原文</h3>
                    <span class="rounded-full bg-[#eef5ff] px-2.5 py-1 text-[11px] font-medium text-[#2f6fed]">主展示区</span>
                    <span v-if="renderedAdviceSections.length" class="rounded-full bg-[#f8fafc] px-2.5 py-1 text-[11px] text-[#6e6e73]">
                      {{ renderedAdviceSections.length }} 个一级目录 · {{ markdownOutlineSummary.childCount }} 个二级子项
                    </span>
                  </div>
                  <p class="mt-1 text-xs leading-5 text-[#8a8a8f]">保留这块作为主要阅读内容：左侧目录定位，右侧按层级查看 AI 返回的教学建议。</p>
                </div>
                <span class="rounded-full bg-[#eef5ff] px-3 py-1 text-xs text-[#2f6fed]">
                  {{ reportExpanded ? '收起原文' : '展开原文' }}
                </span>
              </button>
              <div v-if="reportExpanded" class="teaching-advice-report-body min-h-0 flex-1">
                <div class="mb-3 flex flex-wrap items-center justify-end gap-2">
                  <button
                    v-if="advice"
                    type="button"
                    :disabled="!focusStudentTotal"
                    :aria-expanded="focusPanelOpen"
                    class="focus-panel-toggle inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#9a5a16] shadow-[0_4px_12px_rgba(92,74,52,0.08)] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:border-[#dfc79f] hover:bg-[#fffaf3] hover:shadow-[0_8px_18px_rgba(92,74,52,0.13)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:bg-[#f8fafc] disabled:text-[#9ca3af] disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                    @click.stop="toggleFocusPanel"
                  >
                    <span class="focus-panel-toggle-dot h-1.5 w-1.5 rounded-full" :class="focusPanelOpen ? 'bg-[#d97706]' : 'bg-[#f6c56d]'"></span>
                    <span>{{ focusPanelOpen ? '收起重点学生' : `重点学生 ${focusStudentTotal} 人` }}</span>
                    <span class="focus-panel-toggle-arrow text-[11px]" :class="{ 'is-open': focusPanelOpen }">⌄</span>
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-[#eadfce] bg-white px-3 py-1 text-xs font-medium text-[#6b5a45] shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#dfc79f] hover:bg-[#fffaf3] hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                    @click.stop="copyRawAdvice"
                  >
                    {{ rawAdviceCopied ? '已复制' : '复制 Markdown' }}
                  </button>
                </div>
                <div v-if="renderedAdviceSections.length" class="teaching-advice-report-grid relative grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[286px_minmax(0,1fr)]">
                  <aside ref="markdownOutlineRef" class="teaching-advice-outline min-w-0 self-start space-y-2.5 xl:pr-1">
                    <div class="rounded-[16px] border border-[#eadfce] bg-white px-3.5 py-3 shadow-[0_10px_24px_rgba(92,74,52,0.08)]">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <div class="text-[15px] font-bold text-[#111827]">报告目录</div>
                          <p class="mt-1 text-xs font-semibold leading-5 text-[#6b5a45]">结论优先，动作跟上，依据后核。</p>
                        </div>
                        <span
                          class="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#c7781e] px-2 text-xs font-bold text-white shadow-sm transition-colors duration-200"
                        >
                          {{ activeMarkdownSectionIndex + 1 }}
                        </span>
                      </div>
                      <div class="mt-2 rounded-[12px] border border-[#eadfce] bg-[#fffaf3] px-3 py-2 text-xs font-semibold leading-5 text-[#8a5b22]">
                        结论 → 怎么教 → 找谁跟进 → 依据核对
                      </div>
                    </div>

                    <div class="relative space-y-2 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-[#e9dfd2]">
                      <button
                        v-for="section in renderedAdviceSections"
                        :key="section.key"
                        type="button"
                        class="relative w-full rounded-[16px] border px-3 py-3 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]"
                        :class="expandedMarkdownSectionKey === section.key ? `${section.tone} shadow-[0_12px_26px_rgba(92,74,52,0.11)] ring-2 ring-inset ring-[rgba(180,120,40,0.18)]` : 'border-[#eadfce] bg-white hover:border-[#dfc79f] hover:bg-[#fffdf8]'"
                        @click="toggleMarkdownSection(section.key)"
                      >
                        <div class="flex items-start gap-3">
                          <span class="z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm" :class="section.dotClass">
                            {{ section.icon }}
                          </span>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-start justify-between gap-2">
                              <div class="min-w-0">
                                <div class="text-[11px] font-bold text-[#8a5b22]">
                                  {{ activeMarkdownSectionIndexFor(section.key) + 1 }} · {{ section.badge }}
                                </div>
                                <h4 class="mt-1 truncate text-sm font-bold text-[#111827]">{{ section.title }}</h4>
                              </div>
                            </div>
                            <p class="mt-1 text-xs font-medium leading-5 text-[#475569]">{{ section.hint }}</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </aside>

                  <Transition name="report-section" mode="out-in">
                  <section
                    v-if="activeMarkdownSection"
                    :key="activeMarkdownSection.key"
                    ref="markdownContentRef"
                    class="teaching-advice-content min-h-0 min-w-0 space-y-3"
                    @scroll="handleMarkdownScroll"
                  >
                    <div class="rounded-[18px] border border-[#eadfce] bg-white p-4 shadow-[0_10px_24px_rgba(92,74,52,0.08)]">
                      <div class="flex flex-wrap items-center gap-2 text-xs font-medium text-[#4b5563]">
                        <span class="rounded-full bg-[#fff7ed] px-2.5 py-1 font-semibold text-[#9a5a16]">AI 建议</span>
                        <span>›</span>
                        <span class="rounded-full bg-[#f3f6fb] px-2.5 py-1 text-[#374151]">{{ activeMarkdownSection.title }}</span>
                      </div>
                      <div class="flex flex-wrap items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div class="mt-3 text-[11px] font-bold text-[#8a5b22]">
                            {{ activeMarkdownSectionIndex + 1 }} · {{ activeMarkdownSection.badge }}
                          </div>
                          <h4 class="mt-1 text-xl font-bold text-[#111827]">{{ activeMarkdownSection.title }}</h4>
                          <p class="mt-1 text-sm font-medium leading-6 text-[#475569]">{{ activeMarkdownSection.hint }}</p>
                        </div>
                        <div class="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            class="rounded-full border border-[#eadfce] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b5a45] shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#dfc79f] hover:bg-[#fffaf3] hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                            @click="scrollMarkdownToTop"
                          >
                            回到目录顶部
                          </button>
                        </div>
                      </div>
                      <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_188px]">
                        <p class="advice-soft-card rounded-[14px] px-4 py-3 text-sm font-medium leading-6 text-[#334155]">
                          <span class="font-semibold text-[#1d1d1f]">本节摘要：</span>{{ activeMarkdownSection.preview }}
                        </p>
                        <div class="advice-soft-card advice-soft-card-accent rounded-[14px] px-4 py-3 text-sm font-semibold leading-6 text-[#7b4f17]">
                          {{ activeMarkdownSection.readingGoal }}
                        </div>
                      </div>
                    </div>

                    <div v-if="isStudentFollowSection(activeMarkdownSection) && focusStudentRows.length" class="space-y-3">
                      <div class="advice-soft-card flex flex-wrap items-center justify-between gap-2 rounded-[14px] px-4 py-2.5 text-xs font-medium text-[#6b5a45]">
                        <span v-if="focusStudentRosterComplete">已展示全部 {{ focusStudentTotal }} 名重点学生，并按问题严重程度分为 P1/P2/P3。</span>
                        <span v-else>当前历史报告只保存了 {{ focusStudentRows.length }} / {{ focusStudentTotal }} 人，重新生成后可查看完整名单。</span>
                        <span class="rounded-full bg-white px-2.5 py-1 font-semibold">AI 深度分析 {{ focusStudentAiAnalyzedCount }} 人</span>
                      </div>
                      <div class="grid grid-cols-1 gap-3 p-1 sm:grid-cols-2 xl:grid-cols-4">
                        <button
                          v-for="stat in focusStudentFilterStats"
                          :key="stat.key"
                          type="button"
                          :aria-pressed="selectedFocusPriority === stat.key"
                          aria-controls="focus-student-group-list"
                          :disabled="stat.count === 0"
                          class="rounded-[16px] border px-3.5 py-3 text-left transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          :class="[
                            stat.tone,
                            selectedFocusPriority === stat.key
                              ? stat.activeClass
                              : 'hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)] active:translate-y-0 active:scale-[0.99]'
                          ]"
                          @click="selectFocusPriority(stat.key)"
                        >
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-semibold" :class="stat.textClass">{{ stat.title }}</span>
                            <span class="text-lg font-bold" :class="stat.textClass">{{ stat.count }}</span>
                          </div>
                          <p class="mt-1 text-xs font-medium leading-5 text-[#4b5563]">{{ stat.hint }}</p>
                        </button>
                      </div>

                      <TransitionGroup id="focus-student-group-list" name="focus-filter" tag="div" class="space-y-3">
                      <section
                        v-for="group in visibleFocusStudentGroups"
                        :key="group.key"
                        class="overflow-hidden rounded-[18px] border bg-white shadow-[0_8px_18px_rgba(100,116,139,0.08)]"
                        :class="group.borderClass"
                      >
                        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3" :class="group.headerClass">
                          <div class="flex items-center gap-3">
                            <span class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" :class="group.dotClass">{{ group.short }}</span>
                            <div>
                              <h5 class="text-sm font-semibold text-[#1d1d1f]">{{ group.title }}</h5>
                              <p class="mt-0.5 text-xs font-medium leading-5 text-[#4b5563]">{{ group.hint }}</p>
                            </div>
                          </div>
                          <span class="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold" :class="group.textClass">
                            {{ group.totalCount > group.students.length ? `展示 ${group.students.length} / 共 ${group.totalCount}` : `${group.totalCount} 人` }}
                          </span>
                        </div>

                        <div class="teaching-advice-student-list grid grid-cols-1 gap-3 p-3 xl:grid-cols-2">
                          <article
                            v-for="student in group.students"
                            :key="student.key"
                            class="advice-soft-card rounded-[16px] px-4 py-3"
                          >
                            <div class="flex flex-wrap items-start justify-between gap-3">
                              <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2">
                                  <span class="rounded-full px-2.5 py-1 text-[11px] font-bold text-white" :class="student.dotClass">
                                    {{ student.priority }}
                                  </span>
                                  <span v-if="student.aiAnalyzed" class="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#9a5a16]">AI 详析</span>
                                  <h6 class="text-sm font-semibold text-[#1d1d1f]">
                                    {{ student.studentName || '未命名学生' }}
                                    <span class="font-normal text-[#6e6e73]">{{ student.studentNo ? `· ${student.studentNo}` : '' }}</span>
                                  </h6>
                                </div>
                                <p class="mt-2 text-sm font-medium leading-6 text-[#374151]">
                                  <span class="font-semibold text-[#1d1d1f]">问题判断：</span>{{ student.reason }}
                                </p>
                              </div>
                              <div class="shrink-0 rounded-[12px] bg-[#f8fafc] px-3 py-2 text-right">
                                <div class="text-[11px] font-semibold text-[#64748b]">风险分</div>
                                <div class="text-base font-bold" :class="student.levelClass">{{ student.riskScore || '-' }}</div>
                              </div>
                            </div>

                            <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div class="rounded-[12px] border border-[#e8edf5] bg-[#f9fbfd] px-3 py-2">
                                <div class="text-[11px] font-semibold text-[#64748b]">类型</div>
                                <p class="mt-1 text-xs font-semibold text-[#1d1d1f]">{{ student.typeLabel }}</p>
                              </div>
                              <div class="rounded-[12px] border border-[#e8edf5] bg-[#f9fbfd] px-3 py-2">
                                <div class="text-[11px] font-semibold text-[#64748b]">数据证据</div>
                                <p class="mt-1 text-xs leading-5 text-[#1d1d1f]">{{ student.evidenceSummary }}</p>
                              </div>
                            </div>

                            <div class="mt-3 rounded-[14px] border border-[#eadfce] bg-[#fffaf3] px-3 py-2 shadow-[0_4px_12px_rgba(92,74,52,0.06)]">
                              <div class="text-[11px] font-semibold text-[#9a5a16]">老师下一步直接做</div>
                              <p class="mt-1 text-sm font-medium leading-6 text-[#1d1d1f]">{{ student.suggestion }}</p>
                            </div>

                            <div class="mt-2 rounded-[14px] border border-[#e8edf5] bg-[#f9fbfd] px-3 py-2">
                              <div class="text-[11px] font-semibold text-[#64748b]">验收方式</div>
                              <p class="mt-1 text-xs font-medium leading-5 text-[#374151]">{{ student.validation }}</p>
                            </div>
                          </article>
                        </div>
                      </section>
                      </TransitionGroup>
                    </div>

                    <div v-else-if="activeMarkdownSection.children?.length" class="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      <article
                        v-for="child in activeMarkdownSection.children"
                        :key="child.key"
                        class="overflow-hidden rounded-[16px] border border-[#eadfce] bg-white shadow-[0_8px_18px_rgba(100,116,139,0.08)]"
                      >
                        <div class="flex items-center justify-between gap-3 border-b border-[#eadfce] bg-[#fffdf8] px-3 py-2">
                          <div class="min-w-0">
                            <div class="text-[10px] font-semibold text-[#8a5b22]">{{ child.badge }}</div>
                            <div class="mt-0.5 text-xs font-semibold text-[#1d1d1f]">{{ child.title }}</div>
                            <div class="mt-0.5 text-xs font-medium leading-5 text-[#4b5563]">{{ child.hint }}</div>
                          </div>
                        </div>
                        <div class="teaching-advice-markdown markdown-body max-h-[300px] overflow-y-auto bg-white px-3 py-3 pr-2 text-sm leading-7 text-[#1d1d1f]" v-html="child.html"></div>
                      </article>
                    </div>

                    <div
                      v-else
                      class="teaching-advice-markdown markdown-body max-h-[460px] overflow-y-auto rounded-[18px] border border-[#eadfce] bg-white px-4 py-4 text-sm leading-7 text-[#1d1d1f] shadow-[0_8px_18px_rgba(100,116,139,0.08)]"
                      v-html="activeMarkdownSection.html"
                    ></div>
                  </section>
                  </Transition>
                  <Transition name="back-top">
                    <button
                      v-if="showBackToTop"
                      type="button"
                      class="teaching-advice-back-top absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-white text-base font-bold text-[#8a5b22] shadow-[0_10px_24px_rgba(92,74,52,0.16)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#dfc79f] hover:bg-[#fffaf3] hover:shadow-[0_14px_28px_rgba(92,74,52,0.20)] active:translate-y-0 active:scale-[0.96]"
                      title="回到顶部"
                      aria-label="回到顶部"
                      @click="scrollMarkdownToTop"
                    >
                      ↑
                    </button>
                  </Transition>
                </div>
                <div
                  v-else
                  class="teaching-advice-markdown markdown-body rounded-[18px] border border-[#eadfce] bg-white px-4 py-4 text-sm leading-7 text-[#1d1d1f] shadow-[0_8px_18px_rgba(100,116,139,0.08)]"
                  v-html="renderedAdviceMarkdown"
                ></div>
              </div>
            </article>

          </div>

          <Transition name="focus-panel">
          <aside
            v-if="advice && focusPanelOpen"
            ref="focusPanelRef"
            class="teaching-advice-side-panel min-w-0 min-h-0 space-y-4 overflow-y-auto xl:max-h-[calc(100vh-150px)] xl:pr-1"
            @scroll="handleFocusPanelScroll"
          >
            <section class="overflow-visible rounded-[18px] border border-[#cbd5e1] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
              <button
                type="button"
                class="group flex w-full items-center justify-between gap-4 border-none bg-transparent px-5 py-4 text-left transition-colors duration-200 hover:bg-[#fffdf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d97706]"
                :aria-expanded="focusFollowExpanded"
                aria-controls="focus-follow-content"
                @click="toggleFocusFollow"
              >
                <span class="min-w-0">
                  <span class="block text-sm font-semibold text-[#1d1d1f]">课后重点找谁</span>
                  <span class="mt-1 block text-xs leading-5 text-[#6e6e73]">按严重程度分类，优先处理最需要介入的学生</span>
                </span>
                <span class="flex shrink-0 items-center gap-2">
                  <span class="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-semibold text-[#9a5a16]">
                    {{ selectedFocusPriority === 'ALL' ? `${focusStudentTotal} 人` : `${selectedFocusPriority} · ${visibleFocusStudentRows.length} 人` }}
                  </span>
                  <span
                    aria-hidden="true"
                    class="sidebar-chevron flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f6fb] text-sm font-semibold text-[#4b5563] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:bg-[#e8eef7]"
                    :class="focusFollowExpanded ? 'rotate-180' : ''"
                  >⌄</span>
                </span>
              </button>

              <Transition name="sidebar-accordion">
              <div v-if="focusFollowExpanded" id="focus-follow-content" class="sidebar-accordion-shell">
                <div class="sidebar-accordion-inner border-t border-black/[0.06] px-4 pb-4 pt-3">
                <div class="grid grid-cols-2 gap-2" aria-label="重点学生分类">
                  <button
                    v-for="stat in focusStudentFilterStats"
                    :key="`sidebar-${stat.key}`"
                    type="button"
                    :aria-pressed="selectedFocusPriority === stat.key"
                    aria-controls="sidebar-focus-student-list"
                    :disabled="stat.count === 0"
                    class="flex min-h-[58px] items-center justify-between gap-2 rounded-[12px] border px-3 py-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-45"
                    :class="[
                      stat.tone,
                      selectedFocusPriority === stat.key
                        ? stat.activeClass
                        : 'hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(15,23,42,0.07)] active:translate-y-0 active:scale-[0.98]'
                    ]"
                    @click="selectFocusPriority(stat.key)"
                  >
                    <span class="text-[11px] font-semibold leading-4 sm:text-xs" :class="stat.textClass">{{ stat.title }}</span>
                    <span class="text-base font-bold" :class="stat.textClass">{{ stat.count }}</span>
                  </button>
                </div>

                <p class="mt-3 rounded-[12px] border border-[#eadfce] bg-[#fffdf8] px-3 py-2 text-xs font-medium leading-5 text-[#6b5a45]">
                  {{ focusStudentRosterComplete
                    ? `已加载全部 ${focusStudentTotal} 人，其中 ${focusStudentAiAnalyzedCount} 人含 AI 深度建议，其余人员依据数据库做题结果生成跟进动作。`
                    : `当前历史报告仅包含 ${focusStudentRows.length} / ${focusStudentTotal} 人，重新生成后可查看完整名单。` }}
                </p>
                <TransitionGroup
                  v-if="visibleFocusStudentRows.length"
                  id="sidebar-focus-student-list"
                  name="focus-filter"
                  tag="div"
                  class="teaching-advice-side-list teaching-advice-popover-list mt-3 space-y-3 overflow-visible pb-28 pr-1"
                >
                <article
                  v-for="student in visibleFocusStudentRows"
                  :key="student.key"
                  class="student-card relative cursor-pointer rounded-[16px] border px-3.5 py-3 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                  :class="student.tone"
                  @mouseenter="showStudentActionPopover(student, $event)"
                  @focusin="showStudentActionPopover(student, $event)"
                  @mouseleave="hideStudentActionPopover"
                  @focusout="hideStudentActionPopover"
                  @click="toggleFocusStudentDetail(student.key)"
                >
                  <div class="student-card-readable transition-all duration-200 ease-out">
                    <div class="flex items-start gap-3">
                      <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" :class="student.dotClass">{{ student.tag }}</span>
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <div class="min-w-0 truncate text-sm font-semibold text-[#1d1d1f]">
                            {{ student.studentNo || '未知学号' }}
                            <span v-if="student.studentName" class="font-normal text-[#6e6e73]">· {{ student.studentName }}</span>
                          </div>
                          <span class="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold" :class="student.levelClass">
                            {{ student.priority }} · {{ student.riskLevel }}
                          </span>
                        </div>
                        <p
                          class="mt-1 text-xs leading-5 transition-colors duration-200"
                          :class="expandedFocusStudentKey === student.key ? 'whitespace-normal break-words text-[#4b5563]' : 'compact-line-clamp-2 text-[#6e6e73]'"
                        >
                          <span class="font-semibold text-[#1d1d1f]">卡点：</span>{{ student.stuckPoint || student.reason }}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="mt-2 inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-[11px] font-medium text-[#8a5b22] transition-all duration-200 ease-out hover:border-[#dfc79f] hover:bg-white/80 active:scale-[0.97]"
                      :aria-expanded="expandedFocusStudentKey === student.key"
                      @click.stop="toggleFocusStudentDetail(student.key)"
                    >
                      {{ expandedFocusStudentKey === student.key ? '收起详情' : '查看详情' }}
                      <span>{{ expandedFocusStudentKey === student.key ? '▲' : '▼' }}</span>
                    </button>
                    <Transition name="detail-fade">
                    <div v-if="expandedFocusStudentKey === student.key" class="mt-2 space-y-2.5 rounded-[13px] border border-[#eadfce] bg-white px-3.5 py-3 text-xs leading-6 text-[#334155] shadow-[0_6px_16px_rgba(92,74,52,0.08)]">
                      <p v-if="student.problemTitle"><span class="font-semibold text-[#1d1d1f]">定位题目：</span>第 {{ student.problemNo || '-' }} 题“{{ student.problemTitle }}”</p>
                      <p v-if="student.hasSpecificKnowledge"><span class="font-semibold text-[#1d1d1f]">薄弱知识点：</span>{{ student.knowledgeSourceText }}“{{ student.inferredKnowledge }}”<span v-if="student.knowledgeConfidence">（置信度 {{ student.knowledgeConfidence }}）</span></p>
                      <p v-if="student.errorPoint"><span class="font-semibold text-[#1d1d1f]">具体错误点：</span>{{ student.errorPoint }}<span v-if="student.problemStatus">（{{ student.problemStatus }}）</span></p>
                      <p v-if="student.problem"><span class="font-semibold text-[#1d1d1f]">具体问题：</span>{{ student.problem }}</p>
                      <p v-if="student.cause"><span class="font-semibold text-[#1d1d1f]">卡住原因：</span>{{ student.cause }}</p>
                      <p v-if="student.followUpType"><span class="font-semibold text-[#1d1d1f]">问题类型：</span>{{ student.followUpType }}</p>
                      <p v-if="student.studentPortraitSummary"><span class="font-semibold text-[#1d1d1f]">画像摘要：</span>{{ student.studentPortraitSummary }}</p>
                      <p v-if="student.abilityTrendLabel"><span class="font-semibold text-[#1d1d1f]">趋势判断：</span>{{ student.abilityTrendLabel }}</p>
                      <p v-if="student.riskSummary"><span class="font-semibold text-[#1d1d1f]">分级依据：</span>{{ student.riskSummary }}</p>
                      <p v-if="student.evidenceSummary"><span class="font-semibold text-[#1d1d1f]">数据证据：</span>{{ student.evidenceSummary }}</p>
                      <p v-if="student.validation"><span class="font-semibold text-[#1d1d1f]">验收方式：</span>{{ student.validation }}</p>
                      <p v-if="student.evidenceRefs?.length" class="font-mono text-[11px] text-[#64748b]">证据：{{ joinRefs(student.evidenceRefs) }}</p>
                    </div>
                    </Transition>
                  </div>
                </article>
                </TransitionGroup>
                <p v-else class="mt-3 rounded-[14px] bg-[#f8fafc] px-4 py-6 text-center text-sm text-[#8a8a8f]">
                  当前分类暂无重点学生。
                </p>
                </div>
              </div>
              </Transition>
            </section>

            <section class="overflow-hidden rounded-[18px] border border-[#eadfce] bg-white shadow-[0_8px_18px_rgba(92,74,52,0.06)]">
              <button
                type="button"
                class="group flex w-full items-center justify-between gap-4 border-none bg-transparent px-5 py-4 text-left transition-colors duration-200 hover:bg-[#fffdf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d97706]"
                :aria-expanded="prepReminderExpanded"
                aria-controls="prep-reminder-content"
                @click="prepReminderExpanded = !prepReminderExpanded"
              >
                <span class="min-w-0">
                  <span class="block text-sm font-semibold text-[#1d1d1f]">备课提醒</span>
                  <span class="mt-1 block text-xs leading-5 text-[#6e6e73]">讲什么、补什么、课后怎么追</span>
                </span>
                <span class="flex shrink-0 items-center gap-2">
                  <span class="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-semibold text-[#9a5a16]">{{ teacherFocusRows.length }} 项</span>
                  <span
                    aria-hidden="true"
                    class="sidebar-chevron flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f6fb] text-sm font-semibold text-[#4b5563] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:bg-[#e8eef7]"
                    :class="prepReminderExpanded ? 'rotate-180' : ''"
                  >⌄</span>
                </span>
              </button>
              <Transition name="sidebar-accordion">
              <div v-if="prepReminderExpanded" id="prep-reminder-content" class="sidebar-accordion-shell">
                <div class="sidebar-accordion-inner border-t border-black/[0.06] px-4 pb-4 pt-3">
                <div v-if="teacherFocusRows.length" class="teaching-advice-side-list space-y-3 pr-1">
                  <div v-for="item in teacherFocusRows" :key="item.key" class="rounded-[14px] border border-[#eadfce] bg-[#fffdf8] px-4 py-3">
                    <div class="text-xs font-semibold text-[#8a5b22]">{{ item.title }}</div>
                    <p class="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-[#374151]">{{ item.instruction }}</p>
                    <p class="mt-2 whitespace-pre-wrap break-words text-[11px] font-medium leading-5 text-[#6e6e73]">
                      {{ item.when }} · {{ item.target }}
                    </p>
                  </div>
                </div>
                <p v-else class="rounded-[14px] bg-[#f8fafc] px-4 py-6 text-center text-sm text-[#8a8a8f]">
                  生成后会从 AI 报告里提炼“讲什么、补什么、怎么跟进”。
                </p>
                </div>
              </div>
              </Transition>
            </section>

            <section class="rounded-[20px] border border-black/[0.07] bg-white">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 border-none bg-transparent px-5 py-4 text-left"
                @click="historyExpanded = !historyExpanded"
              >
                <span class="text-sm font-semibold text-[#1d1d1f]">{{ historyExpanded ? '▾' : '▸' }} 历史建议报告</span>
                <span class="text-xs text-[#8a8a8f]">{{ filteredReports.length }} 条</span>
              </button>
              <Transition name="sidebar-accordion">
              <div v-if="historyExpanded" class="sidebar-accordion-shell">
                <div class="sidebar-accordion-inner border-t border-black/[0.06] px-5 py-3">
                <div v-if="filteredReports.length" class="divide-y divide-black/[0.05]">
                  <button
                    v-for="report in filteredReports"
                    :key="report.id"
                    type="button"
                    class="flex w-full items-center justify-between gap-4 border-none bg-transparent py-3 text-left hover:bg-[#fafafa]"
                    @click="selectReport(report)"
                  >
                    <div class="min-w-0">
                      <div class="truncate text-sm font-medium text-[#374151]">
                        {{ scopeLabel(report.scopeLevel) }} · {{ report.scope?.experimentName || report.scope?.className || report.scope?.courseName }}
                      </div>
                      <div class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#8a8a8f]">
                        <span>{{ report.promptVersion }} · {{ report.model || '默认模型' }}</span>
                        <span
                          v-if="reportQualityLabel(report)"
                          class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                          :class="reportQualityClass(report)"
                        >
                          {{ reportQualityLabel(report) }}
                        </span>
                      </div>
                    </div>
                    <span class="shrink-0 text-xs text-[#6e6e73]">{{ formatTime(report.createdAt) }}</span>
                  </button>
                </div>
                <p v-else class="py-5 text-sm text-[#8a8a8f]">当前班级暂无历史建议。</p>
                </div>
              </div>
              </Transition>
            </section>
          </aside>
          </Transition>
          <Transition name="back-top">
            <button
              v-if="advice && focusPanelOpen && showFocusBackToTop"
              type="button"
              class="teaching-advice-side-back-top fixed bottom-6 right-6 z-[80] flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-white text-base font-bold text-[#8a5b22] shadow-[0_10px_24px_rgba(92,74,52,0.18)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#dfc79f] hover:bg-[#fffaf3] hover:shadow-[0_14px_28px_rgba(92,74,52,0.22)] active:translate-y-0 active:scale-[0.96]"
              title="回到重点学生顶部"
              aria-label="回到重点学生顶部"
              @click="scrollFocusPanelToTop"
            >
              ↑
            </button>
          </Transition>
        </div>
      </template>

      <div v-else class="rounded-[18px] border border-dashed border-black/[0.12] bg-[#fafafa] py-10 text-center text-sm text-[#8a8a8f]">
        {{ scopeLevel === 'EXPERIMENT' ? '请先选择一个实验。' : '当前班级暂时无法形成分析范围。' }}
      </div>
    </div>

    <Transition name="student-popover">
      <div
        v-if="studentActionPopover.visible"
        class="student-action-floating-popover"
        :style="studentActionPopover.style"
      >
        <div class="text-[11px] font-bold text-[#c2410c]">下一步</div>
        <p class="mt-1 text-sm font-medium leading-6 text-[#3f2f22]">{{ studentActionPopover.student?.suggestion }}</p>
        <div class="mt-2 text-[11px] font-semibold text-[#9a3412]">移开鼠标后收起</div>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { renderSafeMarkdown } from '@/utils/safeHtml'
import {
  generateTeachingAdvice,
  getTeachingAdviceContext,
  getTeachingAdviceReport,
  getTeachingAdviceReports
} from '@/api/tap'

const props = defineProps({
  classId: { type: [String, Number], required: true },
  experiments: { type: Array, default: () => [] }
})

const scopeOptions = [
  { value: 'EXPERIMENT', label: '实验级' },
  { value: 'CLASS', label: '班级级' },
  { value: 'COURSE', label: '课程级' }
]
const scopeLevel = ref('CLASS')
const experimentId = ref('')
const includeHistory = ref(false)
const contextLoading = ref(false)
const generating = ref(false)
const errorMessage = ref('')
const contextData = ref(null)
const activeReport = ref(null)
const reports = ref([])
const conclusionExpanded = ref(false)
const diagnosisExpanded = ref(false)
const reportExpanded = ref(true)
const rawAdviceCopied = ref(false)
const expandedMarkdownSectionKey = ref('')
const reportRootRef = ref(null)
const markdownOutlineRef = ref(null)
const markdownContentRef = ref(null)
const showBackToTop = ref(false)
const focusPanelRef = ref(null)
const showFocusBackToTop = ref(false)
const focusPanelOpen = ref(false)
const focusFollowExpanded = ref(false)
const prepReminderExpanded = ref(false)
const expandedFocusStudentKey = ref('')
const selectedFocusPriority = ref('ALL')
const historyExpanded = ref(false)
const studentActionPopover = ref({
  visible: false,
  student: null,
  style: {}
})
let contextRequestId = 0
let generationRequestId = 0
let componentUnmounted = false

const unwrap = response => response?.data ?? response
const activeData = computed(() => activeReport.value || contextData.value)
const scope = computed(() => activeData.value?.scope || {})
const metrics = computed(() => activeData.value?.metrics || {})
const rawAdvice = computed(() => activeReport.value?.advice || null)
const reportGateMessage = computed(() => reportGateMessageFor(activeReport.value))
const advice = computed(() => reportGateMessage.value ? null : rawAdvice.value)
const activeReportStatus = computed(() => String(activeReport.value?.status || '').toUpperCase())
const activeReportGenerating = computed(() => activeReportStatus.value === 'GENERATING')
const activeScopeLevel = computed(() => String(activeReport.value?.scopeLevel || scope.value.level || '').toUpperCase())
const activeScopeLevelLabel = computed(() => scopeLabel(activeScopeLevel.value || scopeLevel.value))
const currentScopeTitle = computed(() => {
  if (scopeLevel.value === 'EXPERIMENT') return scope.value.experimentName || '当前实验'
  if (scopeLevel.value === 'COURSE') return scope.value.courseName || '当前课程'
  return scope.value.className || '当前教学班'
})
const scopeDescription = computed(() => {
  if (scopeLevel.value === 'EXPERIMENT') return '只统计当前实验的提交、题目和错误点'
  if (scopeLevel.value === 'COURSE') return '汇总同课程同学期下的多个教学班'
  return '只统计当前教学班的实验和学生表现'
})
const scopePreviewRows = computed(() => {
  const distribution = metrics.value.scoreDistribution || {}
  const displayedFocusCount = Array.isArray(metrics.value.focusStudents) ? metrics.value.focusStudents.length : 0
  const focusCountValue = Number(metrics.value.focusStudentTotal)
  const focusCount = Number.isFinite(focusCountValue) ? Math.max(focusCountValue, displayedFocusCount) : displayedFocusCount
  const problemRows = Array.isArray(metrics.value.problemErrorPoints) ? metrics.value.problemErrorPoints : []
  const studentCount = Number(distribution.total || 0)
  if (scopeLevel.value === 'EXPERIMENT') {
    const problemCount = Array.isArray(metrics.value.problemPerformance) ? metrics.value.problemPerformance.length : 0
    const peerCount = Array.isArray(metrics.value.classComparison) ? metrics.value.classComparison.length : 0
    return [
      { key: 'students', label: '涉及学生', value: studentCount || '-', hint: '当前实验有提交记录的学生' },
      { key: 'problems', label: '实验题目', value: problemCount || '-', hint: '当前实验题目数量' },
      { key: 'errorPoints', label: '已定位错误点', value: problemRows.length || '-', hint: '基于提交状态和错误证据' },
      { key: 'classes', label: '对比班级', value: peerCount || '-', hint: '同实验的班级表现对比' }
    ]
  }
  if (scopeLevel.value === 'COURSE') {
    const classCount = Array.isArray(metrics.value.classComparison) ? metrics.value.classComparison.length : 0
    const experimentCount = Array.isArray(metrics.value.experimentSummary) ? metrics.value.experimentSummary.length : 0
    return [
      { key: 'classes', label: '覆盖班级', value: classCount || '-', hint: '同课程同学期的教学班' },
      { key: 'experiments', label: '课程实验', value: experimentCount || '-', hint: '按实验模板汇总' },
      { key: 'focus', label: '重点学生', value: focusCount || '-', hint: '跨班级风险分层后的学生' },
      { key: 'errorPoints', label: '高频错误点', value: problemRows.length || '-', hint: '跨班级合并后的错误证据' }
    ]
  }
  const experimentCount = Array.isArray(metrics.value.experiments) ? metrics.value.experiments.length : 0
  return [
    { key: 'experiments', label: '班级实验', value: experimentCount || '-', hint: '当前教学班已布置实验' },
    { key: 'students', label: '参与学生', value: studentCount || '-', hint: '当前班级有成绩或提交记录的学生' },
    { key: 'focus', label: '重点学生', value: focusCount || '-', hint: '按风险等级筛选' },
    { key: 'errorPoints', label: '错误点', value: problemRows.length || '-', hint: '当前班级提交中的具体错误证据' }
  ]
})
const teachingConclusion = computed(() => advice.value?.teachingConclusion || {})
const teachingContext = computed(() => metrics.value.teachingContext || {})
const nextTeachingPlan = computed(() => advice.value?.nextTeachingPlan || {})
const dataCoverage = computed(() => metrics.value.dataCoverage || {})
const learningDiagnosis = computed(() => metrics.value.learningDiagnosis || {})
const problemErrorPointRows = computed(() => Array.isArray(learningDiagnosis.value.problemErrorPoints)
  ? learningDiagnosis.value.problemErrorPoints.slice(0, 4)
  : [])
const knowledgeSignalRows = computed(() => Array.isArray(learningDiagnosis.value.inferredKnowledgeSignals)
  ? learningDiagnosis.value.inferredKnowledgeSignals.slice(0, 3)
  : [])
const canGenerate = computed(() => !!props.classId && (scopeLevel.value !== 'EXPERIMENT' || !!experimentId.value))
const disabledReason = computed(() => {
  if (!props.classId) return '当前班级信息缺失，无法生成'
  if (scopeLevel.value === 'EXPERIMENT' && !experimentId.value) return '请选择实验后生成'
  return ''
})
const generateButtonDisabled = computed(() => generating.value || activeReportGenerating.value || !!disabledReason.value)
const generateButtonLabel = computed(() => {
  if (generating.value || activeReportGenerating.value) return 'AI 生成中...'
  return disabledReason.value || '生成教学建议'
})
const filteredReports = computed(() => reports.value.filter(report => String(report.scope?.classId || '') === String(props.classId)).slice(0, 8))
const scopeSummary = computed(() => [
  { label: '课程', value: scope.value.courseName || '待补充' },
  { label: '学期', value: scope.value.termName || '待补充' },
  { label: '教学班', value: scope.value.className || '待补充' },
  { label: '实验', value: scope.value.experimentName || (scopeLevel.value === 'EXPERIMENT' ? '待选择' : '全部实验') }
])

const adviceSummary = computed(() => {
  if (advice.value?.summary) return advice.value.summary
  if (dataCoverage.value.status === 'AVAILABLE') return '当前范围的数据已就绪，点击“生成教学建议”后，AI 会优先给出下节课动作、重点学生跟进和实验/课程调整建议。'
  return '当前数据覆盖不足，建议先补齐提交、评分或实验同步数据后再生成教学建议。'
})

const priorityBadge = computed(() => {
  const priority = String(teachingConclusion.value?.priority || '').toUpperCase()
  if (priority === 'HIGH') return { label: '高', hint: '下节课优先处理', className: 'text-[#b42318]' }
  if (priority === 'LOW') return { label: '低', hint: '按计划跟进', className: 'text-[#18794e]' }
  return { label: '中', hint: '需要短练验证', className: 'text-[#a15c00]' }
})
const hasConclusionDetails = computed(() => !!teachingConclusion.value?.cause || !!teachingConclusion.value?.impact)

function reportGateMessageFor(report) {
  if (!report) return ''
  const status = String(report.status || '').toUpperCase()
  if (status === 'GENERATING') return ''
  if (status && status !== 'COMPLETED') {
    return report.errorMessage || '后端已将该报告标记为生成失败，未作为正式教学建议放行。'
  }
  if (!report.advice && report.qualityStatus === 'PASS') return ''
  if (!isSupportedPromptVersion(report.promptVersion)) {
    return `该历史报告由 ${report.promptVersion || '旧版提示词'} 生成，未按当前质量门禁校验。请重新生成后再给教师查看。`
  }
  const gate = report.advice?.qualityGate
  if (gate?.status !== 'PASS') {
    return '该报告没有服务端质量门禁通过标记，不能按正式教学建议展示。请重新生成。'
  }
  const clientIssue = clientAdviceIssue(report.advice)
  return clientIssue
}

function isSupportedPromptVersion(version) {
  const match = String(version || '').match(/teaching-advice-v(\d+)/)
  return !!match && Number(match[1]) >= 9
}

function clientAdviceIssue(value) {
  if (!value) return '报告内容为空，不能展示。'
  const requiredTexts = [
    ['summary', value.summary],
    ['teachingConclusion.problem', value.teachingConclusion?.problem],
    ['teachingConclusion.cause', value.teachingConclusion?.cause],
    ['teachingConclusion.impact', value.teachingConclusion?.impact]
  ]
  for (const [label, text] of requiredTexts) {
    if (!clientCompleteSentence(text)) return `${label} 不是完整句，已阻断展示。`
  }
  const steps = Array.isArray(value.nextTeachingPlan?.steps) ? value.nextTeachingPlan.steps : []
  if (steps.length < 3) return '下一节课教学步骤少于 3 步，已阻断展示。'
  for (let index = 0; index < Math.min(3, steps.length); index += 1) {
    const item = steps[index]
    if (!clientCompleteSentence(item.teacherAction || item.howToTeach)) return `第 ${index + 1} 步教师动作不完整，已阻断展示。`
    if (!clientCompleteSentence(item.studentTask)) return `第 ${index + 1} 步学生任务不完整，已阻断展示。`
    if (!clientCompleteSentence(item.successMetric || item.expectedChange)) return `第 ${index + 1} 步验收方式不完整，已阻断展示。`
  }
  const markdown = String(value.markdown || '')
  const requiredSections = ['核心教学结论', '下一节课怎么教', '分层教学安排', '重点学生跟进', '实验/学期/课程调整', '依据与局限']
  const missing = requiredSections.find(item => !markdown.includes(item))
  if (missing) return `Markdown 缺少“${missing}”部分，已阻断展示。`
  const sections = parseMarkdownSections(markdown)
  if (!sections.length) return 'Markdown 无法解析成报告目录，已阻断展示。'
  const broken = sections.find(section => !clientCompleteSentence(section.preview))
  if (broken) return `“${broken.title}”不是完整句，已阻断展示。`
  return ''
}

function clientCompleteSentence(value) {
  let text = String(value || '')
    .replace(/[#>*_`|]+/g, ' ')
    .replaceAll('[', ' ')
    .replaceAll(']', ' ')
    .replaceAll('(', ' ')
    .replaceAll(')', ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length < 6) return false
  if (/[：:]\s*$/.test(text)) return false
  while (text && '）)】]》"\'”’'.includes(text[text.length - 1])) {
    text = text.slice(0, -1).trim()
  }
  return /[。！？!?.；;]$/.test(text)
}

function reportQualityLabel(report) {
  const status = String(report?.status || '').toUpperCase()
  if (status === 'GENERATING') return '生成中'
  if (status && status !== 'COMPLETED') return '失败'
  if (!isSupportedPromptVersion(report?.promptVersion)) return '旧版'
  if (report?.advice?.qualityGate?.status === 'PASS' || report?.qualityStatus === 'PASS') return '已校验'
  return '未校验'
}

function reportQualityClass(report) {
  const label = reportQualityLabel(report)
  if (label === '已校验') return 'bg-[#ecfdf3] text-[#18794e]'
  if (label === '生成中') return 'bg-[#eff6ff] text-[#2563eb]'
  if (label === '失败') return 'bg-[#fff1f1] text-[#b42318]'
  return 'bg-[#fff7ed] text-[#c2410c]'
}

const quickActionRows = computed(() => {
  const rows = Array.isArray(advice.value?.quickActions) && advice.value.quickActions.length
    ? advice.value.quickActions
    : normalizeActions(advice.value?.actions)
  return rows.slice(0, 3).map((item, index) => ({
    key: `${index}-${item.title || item.action || item.target || 'action'}`,
    title: item.title || item.action || '执行一项针对性教学动作',
    target: item.target || '当前分析范围',
    when: item.when || '',
    successMetric: item.successMetric || '',
    evidenceRefs: Array.isArray(item.evidenceRefs) ? item.evidenceRefs : []
  }))
})

const teacherFocusRows = computed(() => {
  const source = Array.isArray(advice.value?.teacherFocus) && advice.value.teacherFocus.length
    ? advice.value.teacherFocus
    : quickActionRows.value.map(item => ({
        title: item.title,
        instruction: item.title,
        target: item.target,
        when: item.when,
        successMetric: item.successMetric,
        evidenceRefs: item.evidenceRefs
      }))
  return source.slice(0, 3).map((item, index) => ({
    key: `${index}-${item.title || item.instruction || 'focus'}`,
    title: item.title || '教师重点动作',
    instruction: item.instruction || item.action || item.title || '执行针对性讲解和短练复测',
    target: item.target || '当前分析范围',
    when: item.when || '下节课',
    successMetric: item.successMetric || '',
    evidenceRefs: Array.isArray(item.evidenceRefs) ? item.evidenceRefs : []
  }))
})

const nextTeachingStepRows = computed(() => {
  const structuredSteps = Array.isArray(nextTeachingPlan.value?.steps) ? nextTeachingPlan.value.steps : []
  const legacySteps = Array.isArray(advice.value?.nextClassPlan) ? advice.value.nextClassPlan : []
  const source = structuredSteps.length
    ? structuredSteps
    : legacySteps.map(item => ({
        title: item.title || `第 ${item.step || ''} 步`,
        duration: item.duration,
        teacherAction: item.teacherAction,
        reason: item.reason,
        howToTeach: item.howToTeach || item.teacherAction,
        studentTask: item.studentTask,
        successMetric: item.successMetric || item.expectedChange,
        evidenceRefs: item.evidenceRefs
      }))
  return source.slice(0, 3).map((item, index) => ({
    key: `${index}-${item.title || item.step || index}-${item.teacherAction || 'plan'}`,
    title: item.title || `第 ${item.step || index + 1} 步`,
    duration: item.duration || '',
    teacherAction: item.teacherAction || '',
    reason: item.reason || '',
    howToTeach: item.howToTeach || '',
    studentTask: item.studentTask || '',
    successMetric: item.successMetric || item.expectedChange || '',
    material: item.material || '',
    targetStudents: item.targetStudents || '',
    deliverable: item.deliverable || '',
    checkMethod: item.checkMethod || '',
    evidenceRefs: Array.isArray(item.evidenceRefs) ? item.evidenceRefs : []
  }))
})

const teachingQueueRows = computed(() => {
  const badges = ['讲', '练', '收']
  const titles = ['先处理最大卡点', '当堂复测迁移', '课后闭环验收']
  return nextTeachingStepRows.value.slice(0, 3).map((item, index) => ({
    key: item.key,
    badge: badges[index] || index + 1,
    title: titles[index] || item.title,
    duration: item.duration,
    action: item.teacherAction || item.howToTeach || item.studentTask || '执行该步骤的教学动作',
    material: item.material || materialFallback(index),
    target: item.targetStudents || targetFallback(index),
    deliverable: item.deliverable || deliverableFallback(index, item),
    checkMethod: item.checkMethod || item.successMetric || '看学生是否能独立完成同类任务并说出自查点',
    reason: item.reason,
    evidenceRefs: item.evidenceRefs,
    tone: quickActionTone(index),
    dotClass: quickActionDot(index)
  }))
})

const teacherQueueSummary = computed(() => {
  if (!teachingQueueRows.value.length) return []
  const firstProblem = priorityProblemRows.value[0] || {}
  const firstStep = teachingQueueRows.value[0] || {}
  const secondStep = teachingQueueRows.value[1] || {}
  const thirdStep = teachingQueueRows.value[2] || {}
  const problem = firstProblem.title
    ? `第 ${firstProblem.problemNo || '-'} 题：${firstProblem.title}`
    : firstStep.material || '优先错题'
  const weakness = firstProblem.errorPoint || firstProblem.inferredKnowledge || priorityKnowledgeRows.value[0]?.knowledge || '薄弱点待核对'
  return [
    { label: '先讲', value: problem },
    { label: '卡点', value: weakness },
    { label: '盯人', value: secondStep.target || firstStep.target || '风险学生' },
    { label: '收取', value: thirdStep.deliverable || secondStep.deliverable || '短练结果' }
  ]
})

const teacherActionCards = computed(() => {
  return nextTeachingStepRows.value.slice(0, 3).map((item, index) => ({
    title: ['先讲什么', '马上练什么', '怎么判断有效'][index] || item.title,
    main: item.teacherAction || item.studentTask || item.successMetric,
    detail: item.targetStudents || item.deliverable || item.checkMethod || item.reason || item.howToTeach || item.successMetric || 'AI 已返回该步骤，但未拆出单独说明，请查看下方完整步骤。'
  })).filter(item => item.main)
})

const priorityProblemRows = computed(() => {
  const source = Array.isArray(advice.value?.priorityProblems) && advice.value.priorityProblems.length
    ? advice.value.priorityProblems
    : Array.isArray(teachingContext.value.priorityProblems)
      ? teachingContext.value.priorityProblems
      : problemErrorPointRows.value
  return source.slice(0, 3)
})

const priorityPreviewBadges = computed(() => {
  const problemBadges = priorityProblemRows.value
    .slice(0, 2)
    .map(item => `第 ${item.problemNo || '-'} 题：${item.errorPoint || item.title || '高频错题'}`)
  const knowledgeBadges = priorityKnowledgeRows.value
    .slice(0, 2)
    .map(item => `${item.confidence || 'MEDIUM'}：${item.knowledge || '薄弱知识点'}`)
  return [...problemBadges, ...knowledgeBadges].slice(0, 4)
})

const priorityKnowledgeRows = computed(() => {
  const source = Array.isArray(advice.value?.priorityKnowledgePoints) && advice.value.priorityKnowledgePoints.length
    ? advice.value.priorityKnowledgePoints
    : Array.isArray(teachingContext.value.priorityKnowledgePoints)
      ? teachingContext.value.priorityKnowledgePoints
      : knowledgeSignalRows.value
  return source.slice(0, 3)
})

const studentLayerSummary = computed(() => {
  if (advice.value?.studentLayerActions && typeof advice.value.studentLayerActions === 'object') return advice.value.studentLayerActions
  if (teachingContext.value.studentLayerSummary && typeof teachingContext.value.studentLayerSummary === 'object') return teachingContext.value.studentLayerSummary
  return {}
})
const hasStudentLayerSummary = computed(() => Object.keys(studentLayerSummary.value).length > 0)

const differentiatedRows = computed(() => {
  const value = advice.value?.differentiatedTeaching || {}
  return [
    { title: '重点帮扶层怎么教', text: value.support || '先用最小样例确认基础步骤、实验环境和提交问题。' },
    { title: '中等提升层怎么教', text: value.improve || '用报告分析和代码自查清单补迁移能力。' },
    { title: '拓展提升层怎么教', text: value.extend || '安排优化结构、异常样例和原理解释任务。' }
  ]
})

const adjustmentRows = computed(() => [
  { title: '本实验', text: advice.value?.experimentAdjustment || '把薄弱步骤拆成示例、短练、复盘。' },
  { title: '本学期', text: advice.value?.termAdjustment || '用短练复测跟踪薄弱学生是否改善。' },
  { title: '课程整体', text: advice.value?.courseAdjustment || '前移基础步骤、调试方法和报告分析要求。' }
])

const focusStudentRows = computed(() => {
  const aiStudents = Array.isArray(advice.value?.focusStudents) ? advice.value.focusStudents : []
  const metricStudents = contextFocusStudents.value
  const source = [...aiStudents, ...metricStudents]
  const aiStudentKeys = new Set(aiStudents.map(item => String(item?.studentNo || item?.studentName || '').trim()).filter(Boolean))
  const rowsByKey = new Map()

  for (const item of source) {
    const merged = mergeFocusStudent(item)
    const reason = merged.reason || merged.suggestionHint || '需要结合实验表现进一步观察'
    const risk = riskTone(reason, merged)
    const suggestion = merged.teacherAction || merged.suggestion || merged.suggestionHint || ''
    const validation = merged.validation || ''
    const priority = merged.followUpPriority || risk.priority || 'P3'
    const row = {
      key: `${merged.studentNo || merged.studentName || 'student'}-${priority}`,
      ...risk,
      studentNo: merged.studentNo || '',
      studentName: merged.studentName || '',
      reason: buildStudentProblemJudgment(merged, reason),
      stuckPoint: buildStudentStuckPoint(merged, reason),
      riskLevel: merged.riskLevel || risk.riskLevel || 'LOW',
      riskScore: merged.riskScore ?? '',
      score: merged.score ?? '',
      averageScore: merged.averageScore ?? '',
      completionRate: merged.completionRate ?? '',
      lowestScore: merged.lowestScore ?? '',
      failedProblemCount: merged.failedProblemCount ?? '',
      averageAttempts: merged.averageAttempts ?? '',
      incompleteExperimentCount: merged.incompleteExperimentCount ?? '',
      acceptedProblemCount: merged.acceptedProblemCount ?? '',
      problemCount: merged.problemCount ?? '',
      followUpType: merged.followUpType || '',
      problemNo: merged.problemNo || '',
      problemTitle: merged.problemTitle || '',
      inferredKnowledge: merged.inferredKnowledge || '',
      hasSpecificKnowledge: !!merged.inferredKnowledge && merged.inferredKnowledge !== '待人工确认',
      knowledgePath: merged.knowledgePath || '',
      knowledgeSource: merged.knowledgeSource || '',
      knowledgeSourceText: String(merged.knowledgeSource || '').toUpperCase() === 'PTA_KNOWLEDGE_LEAF' ? '题目知识点' : '推断知识点',
      knowledgeConfidence: merged.knowledgeConfidence || '',
      problemStatus: merged.problemStatus || '',
      problemAttempts: merged.problemAttempts ?? '',
      errorPoint: merged.errorPoint || '',
      problem: merged.problem || '',
      cause: merged.cause || '',
      studentPortraitSummary: merged.studentPortraitSummary || '',
      abilityTrendLabel: merged.abilityTrendLabel || '',
      riskReasons: Array.isArray(merged.riskReasons) ? merged.riskReasons : [],
      priority,
      tag: priority,
      typeLabel: focusTypeLabel(merged, reason),
      evidenceSummary: formatStudentEvidence(merged),
      riskSummary: merged.riskSummary || (Array.isArray(merged.riskReasons) ? merged.riskReasons.join('；') : ''),
      suggestion: isGenericStudentSuggestion(suggestion) ? specificStudentSuggestion(merged, reason) : suggestion,
      validation: isGenericStudentSuggestion(validation) ? specificStudentValidation(merged, reason) : (validation || specificStudentValidation(merged, reason)),
      evidenceRefs: Array.isArray(merged.evidenceRefs) ? merged.evidenceRefs : [],
      aiAnalyzed: aiStudentKeys.has(String(merged.studentNo || merged.studentName || '').trim())
    }
    const rowKey = row.studentNo || row.studentName || row.key
    const existing = rowsByKey.get(rowKey)
    if (!existing) {
      rowsByKey.set(rowKey, row)
    } else {
      rowsByKey.set(rowKey, {
        ...row,
        ...existing,
        evidenceRefs: Array.from(new Set([...(existing.evidenceRefs || []), ...(row.evidenceRefs || [])]))
      })
    }
  }

  return Array.from(rowsByKey.values()).sort((left, right) => {
    const priorityOrder = { P1: 0, P2: 1, P3: 2 }
    const priorityDiff = (priorityOrder[left.priority] ?? 3) - (priorityOrder[right.priority] ?? 3)
    if (priorityDiff !== 0) return priorityDiff
    const riskDiff = toNumber(right.riskScore) - toNumber(left.riskScore)
    if (riskDiff !== 0) return riskDiff
    const scoreDiff = toNumber(left.averageScore) - toNumber(right.averageScore)
    if (scoreDiff !== 0) return scoreDiff
    return String(left.studentNo || left.studentName || '').localeCompare(String(right.studentNo || right.studentName || ''))
  })
})

const contextFocusStudents = computed(() => {
  const source = [
    ...(Array.isArray(metrics.value.focusStudentRoster) ? metrics.value.focusStudentRoster : []),
    ...(Array.isArray(metrics.value.focusStudents) ? metrics.value.focusStudents : []),
    ...(Array.isArray(teachingContext.value.studentFollowUpCandidates) ? teachingContext.value.studentFollowUpCandidates : [])
  ]
  const rowsByKey = new Map()
  for (const item of source) {
    const studentNo = String(item?.studentNo || '').trim()
    const studentName = String(item?.studentName || '').trim()
    const key = studentNo || studentName || `${rowsByKey.size}`
    const existing = rowsByKey.get(key) || {}
    rowsByKey.set(key, { ...existing, ...item })
  }
  return Array.from(rowsByKey.values())
})

const focusStudentTotal = computed(() => {
  const value = Number(metrics.value.focusStudentTotal)
  return Number.isFinite(value) ? Math.max(value, focusStudentRows.value.length) : focusStudentRows.value.length
})

const focusStudentAiLimit = computed(() => {
  const value = Number(metrics.value.focusStudentAiLimit ?? metrics.value.focusStudentDisplayLimit)
  return Number.isFinite(value) && value > 0 ? value : 12
})

const focusStudentHasMore = computed(() => focusStudentTotal.value > focusStudentRows.value.length)
const focusStudentRosterComplete = computed(() => focusStudentTotal.value > 0 && !focusStudentHasMore.value)
const focusStudentAiAnalyzedCount = computed(() => {
  if (advice.value && Array.isArray(advice.value.focusStudents)) {
    return Math.min(advice.value.focusStudents.length, focusStudentRows.value.length)
  }
  const value = Number(metrics.value.focusStudentAiAnalyzed)
  if (Number.isFinite(value) && value >= 0) return Math.min(value, focusStudentTotal.value)
  return Math.min(focusStudentAiLimit.value, focusStudentRows.value.length)
})

const focusStudentPriorityCounts = computed(() => {
  const counts = metrics.value.focusStudentPriorityCounts
  if (!counts || typeof counts !== 'object') return null
  return {
    P1: Math.max(0, Number(counts.P1) || 0),
    P2: Math.max(0, Number(counts.P2) || 0),
    P3: Math.max(0, Number(counts.P3) || 0)
  }
})

const focusStudentStats = computed(() => {
  const rows = focusStudentRows.value
  const counts = focusStudentPriorityCounts.value
  return [
    {
      key: 'P1',
      title: 'P1 立即找',
      count: counts?.P1 ?? rows.filter(item => item.priority === 'P1').length,
      hint: '高风险，建议下次课前先处理',
      tone: 'border-[#fecaca] bg-[#fff7f7]',
      textClass: 'text-[#b42318]',
      activeClass: 'ring-2 ring-[#ef4444] ring-offset-1 shadow-[0_8px_18px_rgba(239,68,68,0.15)]'
    },
    {
      key: 'P2',
      title: 'P2 本周跟',
      count: counts?.P2 ?? rows.filter(item => item.priority === 'P2').length,
      hint: '中风险，安排短周期纠偏',
      tone: 'border-[#fed7aa] bg-[#fffaf5]',
      textClass: 'text-[#c2410c]',
      activeClass: 'ring-2 ring-[#f97316] ring-offset-1 shadow-[0_8px_18px_rgba(249,115,22,0.14)]'
    },
    {
      key: 'P3',
      title: 'P3 观察复测',
      count: counts?.P3 ?? rows.filter(item => item.priority === 'P3').length,
      hint: '低风险，用小题或补交结果复核',
      tone: 'border-[#bfdbfe] bg-[#f8fbff]',
      textClass: 'text-[#1d4ed8]',
      activeClass: 'ring-2 ring-[#3b82f6] ring-offset-1 shadow-[0_8px_18px_rgba(59,130,246,0.14)]'
    }
  ]
})

const focusStudentFilterStats = computed(() => [
  {
    key: 'ALL',
    title: '全部重点学生',
    count: focusStudentTotal.value,
    hint: '查看完整风险名单',
    tone: 'border-[#eadfce] bg-[#fffdf8]',
    textClass: 'text-[#8a5b22]',
    activeClass: 'ring-2 ring-[#c7781e] ring-offset-1 shadow-[0_8px_18px_rgba(92,74,52,0.12)]'
  },
  ...focusStudentStats.value
])

const focusStudentGroups = computed(() => {
  const priorities = ['P1', 'P2', 'P3']
  return priorities
    .map(priority => {
      const meta = focusPriorityMeta(priority)
      return {
        key: priority,
        students: focusStudentRows.value.filter(item => item.priority === priority),
        totalCount: focusStudentPriorityCounts.value?.[priority]
          ?? focusStudentRows.value.filter(item => item.priority === priority).length,
        ...meta
      }
    })
    .filter(group => group.students.length)
})

const visibleFocusStudentGroups = computed(() => selectedFocusPriority.value === 'ALL'
  ? focusStudentGroups.value
  : focusStudentGroups.value.filter(group => group.key === selectedFocusPriority.value))

const visibleFocusStudentRows = computed(() => selectedFocusPriority.value === 'ALL'
  ? focusStudentRows.value
  : focusStudentRows.value.filter(student => student.priority === selectedFocusPriority.value))

const adviceMarkdown = computed(() => {
  if (advice.value?.markdown) return advice.value.markdown
  if (!advice.value) return ''
  return buildLegacyMarkdown(advice.value)
})
const renderedAdviceMarkdown = computed(() => renderSafeMarkdown(adviceMarkdown.value))
const renderedAdviceSections = computed(() => parseMarkdownSections(adviceMarkdown.value))
const activeMarkdownSection = computed(() => {
  if (!renderedAdviceSections.value.length) return null
  return renderedAdviceSections.value.find(item => item.key === expandedMarkdownSectionKey.value) || renderedAdviceSections.value[0]
})
const activeMarkdownSectionIndex = computed(() => {
  if (!activeMarkdownSection.value) return 0
  const index = renderedAdviceSections.value.findIndex(item => item.key === activeMarkdownSection.value.key)
  return index >= 0 ? index : 0
})
const markdownOutlineSummary = computed(() => {
  const childCount = renderedAdviceSections.value.reduce((sum, item) => sum + (item.children?.length || 0), 0)
  return { childCount }
})

function normalizeActions(rows) {
  return Array.isArray(rows)
    ? rows.map(item => ({ ...item, title: item.action, when: item.when || '' }))
    : []
}

function firstPriorityProblem() {
  return priorityProblemRows.value[0] || {}
}

function problemMaterialText() {
  const problem = firstPriorityProblem()
  if (problem.title) return `第 ${problem.problemNo || '-'} 题《${problem.title}》`
  if (problem.errorPoint) return `围绕错误点：${problem.errorPoint}`
  return 'AI 识别出的最高优先级错题/薄弱环节'
}

function focusTargetText() {
  if (focusStudentRows.value.length) {
    const students = focusStudentRows.value.slice(0, 3).map(item => item.studentName || item.studentNo).filter(Boolean)
    return students.length ? `${students.join('、')} 等重点学生` : 'AI 标记的重点跟进学生'
  }
  const supportCount = studentLayerSummary.value.supportCount
  if (supportCount !== undefined && supportCount !== null) return `重点帮扶层 ${supportCount} 人`
  return '未完成、低分或该题未通过学生'
}

function materialFallback(index) {
  if (index === 0) return problemMaterialText()
  if (index === 1) return priorityKnowledgeRows.value[0]?.knowledge ? `同知识点短练：${priorityKnowledgeRows.value[0].knowledge}` : '同知识点最小变式题'
  return '补交记录、短练结果和错因表'
}

function targetFallback(index) {
  if (index === 0) return '全班先听，重点看该题未通过学生'
  return focusTargetText()
}

function deliverableFallback(index, item) {
  if (item.studentTask) return item.studentTask
  if (index === 0) return '输入条件、关键判断步骤、1 个边界样例'
  if (index === 1) return '关键判断条件、一次提交截图、1 个自查点'
  return '有效补交截图或“错因—修改—验证”三列表'
}

function buildLegacyMarkdown(value) {
  const lines = ['## 核心教学结论', '', value.summary || '已生成教学建议。', '']
  if (Array.isArray(value.actions) && value.actions.length) {
    lines.push('## 下一节课怎么教', '')
    value.actions.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.action || '执行一项针对性教学动作'}。${item.successMetric ? `验证：${item.successMetric}。` : ''}`)
    })
    lines.push('')
  }
  if (Array.isArray(value.limitations) && value.limitations.length) {
    lines.push('## 局限性', '')
    value.limitations.forEach(item => lines.push(`- ${item}`))
  }
  return lines.join('\n')
}

function parseMarkdownSections(markdown) {
  const value = String(markdown || '').trim()
  if (!value) return []
  const lines = value.split(/\r?\n/)
  const sections = []
  let current = null
  const pushCurrent = () => {
    if (!current) return
    const body = current.lines.join('\n').trim()
    if (!body) return
    const meta = markdownSectionMeta(current.title, sections.length)
    sections.push({
      key: `${sections.length}-${current.title}`,
      order: sections.length,
      title: current.title,
      preview: summarizeSectionText(body),
      children: buildMarkdownChildren(current.title, body, sections.length),
      html: renderSafeMarkdown(body),
      ...meta
    })
  }

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+?)\s*$/)
    if (match) {
      pushCurrent()
      current = { title: match[2].trim(), lines: [] }
      continue
    }
    if (!current) current = { title: 'AI 建议摘要', lines: [] }
    current.lines.push(line)
  }
  pushCurrent()
  return sections
}

function buildMarkdownChildren(sectionTitle, body, sectionIndex) {
  const blocks = splitMarkdownBlocks(body)
  if (!blocks.length) return []
  const title = String(sectionTitle || '')
  return blocks.map((block, index) => {
    const meta = markdownChildMeta(title, block, index)
    return {
      key: `${sectionIndex}-${index}-${meta.title}`,
      order: index,
      title: meta.title,
      hint: meta.hint,
      badge: meta.badge,
      html: renderSafeMarkdown(block)
    }
  })
}

function splitMarkdownBlocks(body) {
  const text = String(body || '').trim()
  if (!text) return []
  const blocks = []
  let current = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      if (current.length) {
        blocks.push(current.join('\n').trim())
        current = []
      }
      continue
    }
    const isListItem = /^\s*(?:\d+[.)]|[-*])\s+/.test(line)
    const currentIsListItem = current.length > 0 && /^\s*(?:\d+[.)]|[-*])\s+/.test(current[0])
    if (isListItem && current.length && currentIsListItem) {
      blocks.push(current.join('\n').trim())
      current = [line]
      continue
    }
    current.push(line)
  }
  if (current.length) blocks.push(current.join('\n').trim())
  return blocks.filter(Boolean)
}

function markdownChildMeta(sectionTitle, block, index) {
  const normalized = String(block || '').trim()
  const section = String(sectionTitle || '')
  const firstLine = normalized.split(/\r?\n/)[0] || ''
  const plain = summarizeSectionText(normalized)
  if (/^\d+[.)]\s*/.test(firstLine)) {
    return {
      title: `步骤 ${index + 1}`,
      hint: section.includes('怎么教') ? '课堂顺序中的一个具体动作' : '原文中的步骤项',
      badge: '步骤'
    }
  }
  if (/^[-*]\s*/.test(firstLine)) {
    if (section.includes('学生')) {
      return { title: `学生 ${index + 1}`, hint: '课后跟进对象', badge: '学生' }
    }
    if (section.includes('分层')) {
      return { title: `分层 ${index + 1}`, hint: '不同层次的教学动作', badge: '分层' }
    }
    return { title: `要点 ${index + 1}`, hint: '正文中的一个子项', badge: '要点' }
  }
  if (firstLine.startsWith('>')) {
    return { title: '依据说明', hint: '证据与局限的补充解释', badge: '依据' }
  }
  if (section.includes('核心') || section.includes('结论')) {
    if (index === 0) return { title: '结论', hint: '本次建议的核心判断', badge: '结论' }
    if (index === 1) return { title: '原因', hint: '为什么会出现这个问题', badge: '原因' }
    if (index === 2) return { title: '影响', hint: '不处理会影响什么', badge: '影响' }
  }
  if (section.includes('调整')) {
    const labels = ['本实验', '本学期', '课程整体']
    return { title: labels[index] || `调整 ${index + 1}`, hint: '不同时间尺度的调整建议', badge: '调整' }
  }
  if (section.includes('依据') || section.includes('局限')) {
    const labels = ['依据', '局限']
    return { title: labels[index] || `说明 ${index + 1}`, hint: '可核对的证据或边界', badge: '核对' }
  }
  return {
    title: plain ? plain.slice(0, 18) : `内容 ${index + 1}`,
    hint: '当前分类下的一个子要点',
    badge: '内容'
  }
}

function summarizeSectionText(text) {
  const value = String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
    .replace(/(^|\n)\s*(?:[-*]|\d+[.)])\s+/g, '$1')
    .replace(/\s+-\s+/g, ' ')
    .replace(/[#>*_`|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!value) return ''

  const sentences = value.match(/[^。！？!?]+[。！？!?]/g) || []
  if (!sentences.length) return value

  let summary = ''
  for (const sentence of sentences) {
    const next = `${summary}${sentence.trim()}`
    if (summary && next.length > 160) break
    summary = next
    if (summary.length >= 72) break
  }
  return summary || sentences[0].trim()
}

function markdownSectionMeta(title, index) {
  const value = String(title || '')
  if (value.includes('核心') || value.includes('结论')) {
    return {
      icon: '结',
      badge: '先读',
      hint: '一句话判断主要教学问题和优先级',
      readingGoal: '看清主要问题',
      tone: 'border-[#eadfce] bg-[#fffdf8]',
      dotClass: 'bg-[#c7781e]'
    }
  }
  if (value.includes('下一') || value.includes('怎么教')) {
    return {
      icon: '教',
      badge: '课堂',
      hint: '按课堂顺序看教师动作、学生任务和验收方式',
      readingGoal: '照着安排下一节',
      tone: 'border-[#dcfce7] bg-[#fbfffc]',
      dotClass: 'bg-[#16a34a]'
    }
  }
  if (value.includes('分层')) {
    return {
      icon: '层',
      badge: '分组',
      hint: '区分重点帮扶、中等提升和拓展提升',
      readingGoal: '决定分层任务',
      tone: 'border-[#ffedd5] bg-[#fffaf5]',
      dotClass: 'bg-[#f97316]'
    }
  }
  if (value.includes('学生')) {
    return {
      icon: '生',
      badge: '跟进',
      hint: '把重点学生转成课后干预动作',
      readingGoal: '确定课后找谁',
      tone: 'border-[#fee2e2] bg-[#fffafa]',
      dotClass: 'bg-[#ef4444]'
    }
  }
  if (value.includes('实验') || value.includes('学期') || value.includes('课程') || value.includes('调整')) {
    return {
      icon: '调',
      badge: '改进',
      hint: '沉淀到实验、学期和课程节奏调整',
      readingGoal: '调整教学节奏',
      tone: 'border-[#e9d5ff] bg-[#fcfaff]',
      dotClass: 'bg-[#8b5cf6]'
    }
  }
  if (value.includes('依据') || value.includes('局限')) {
    return {
      icon: '据',
      badge: '核对',
      hint: '查看证据编号、数据边界和可采信范围',
      readingGoal: '核对数据来源',
      tone: 'border-[#e5e7eb] bg-[#f8fafc]',
      dotClass: 'bg-[#64748b]'
    }
  }
  return {
    icon: String(index + 1),
    badge: '补充',
    hint: 'AI 原文中的补充说明',
    readingGoal: '补充阅读',
    tone: 'border-[#e6edf7] bg-white',
    dotClass: 'bg-[#6b7280]'
  }
}

function toggleMarkdownSection(key) {
  expandedMarkdownSectionKey.value = key
  resetMarkdownScroll()
}

function toggleFocusStudentDetail(key) {
  expandedFocusStudentKey.value = expandedFocusStudentKey.value === key ? '' : key
  hideStudentActionPopover()
}

function toggleFocusFollow() {
  focusFollowExpanded.value = !focusFollowExpanded.value
  hideStudentActionPopover()
  showFocusBackToTop.value = false
  if (!focusFollowExpanded.value) expandedFocusStudentKey.value = ''
}

function toggleFocusPanel() {
  focusPanelOpen.value = !focusPanelOpen.value
  hideStudentActionPopover()
  showFocusBackToTop.value = false
  if (!focusPanelOpen.value) {
    focusFollowExpanded.value = false
    prepReminderExpanded.value = false
    expandedFocusStudentKey.value = ''
  }
}

function selectFocusPriority(priority) {
  selectedFocusPriority.value = priority
  expandedFocusStudentKey.value = ''
  hideStudentActionPopover()
  showFocusBackToTop.value = false
  nextTick(() => {
    const el = focusPanelRef.value
    if (el) el.scrollTop = 0
  })
}

function showStudentActionPopover(student, event) {
  if (typeof window === 'undefined') return
  if (expandedFocusStudentKey.value === student?.key) {
    hideStudentActionPopover()
    return
  }
  const target = event?.currentTarget
  const rect = target?.getBoundingClientRect?.()
  if (!rect) return

  const width = 280
  const gap = 14
  const pagePadding = 12
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1440
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 900
  const rawLeft = rect.left - width - gap
  const left = Math.max(pagePadding, Math.min(rawLeft, viewportWidth - width - pagePadding))
  const top = Math.max(pagePadding, Math.min(rect.top + 4, viewportHeight - 190))
  const arrowTop = Math.max(24, Math.min(rect.top + rect.height / 2 - top, 118))

  studentActionPopover.value = {
    visible: true,
    student,
    style: {
      left: `${Math.round(left)}px`,
      top: `${Math.round(top)}px`,
      width: `${width}px`,
      '--student-popover-arrow-top': `${Math.round(arrowTop)}px`
    }
  }
}

function hideStudentActionPopover() {
  studentActionPopover.value = {
    visible: false,
    student: null,
    style: {}
  }
}

function mergeFocusStudent(item) {
  const aiStudent = item && typeof item === 'object' ? item : {}
  const studentNo = String(aiStudent.studentNo || '').trim()
  const studentName = String(aiStudent.studentName || '').trim()
  const metricStudent = contextFocusStudents.value.find(row => {
    const rowNo = String(row?.studentNo || '').trim()
    const rowName = String(row?.studentName || '').trim()
    return (studentNo && rowNo === studentNo) || (!studentNo && studentName && rowName === studentName)
  }) || {}
  const merged = { ...metricStudent, ...aiStudent }
  for (const key of [
    'riskScore',
    'riskReasons',
    'riskSummary',
    'studentPortraitRiskLevel',
    'studentPortraitRiskLabel',
    'studentPortraitSummary',
    'abilityTrend',
    'abilityTrendLabel',
    'recentAverageScore',
    'recentScoreCount',
    'completionRate',
    'averageScore',
    'lowestScore',
    'experimentCount',
    'riskExperimentCount',
    'incompleteExperimentCount',
    'lowScoreExperimentCount',
    'acceptedProblemCount',
    'problemCount',
    'failedProblemCount',
    'averageAttempts',
    'problemStateCount',
    'problemNo',
    'problemTitle',
    'problemStatementSummary',
    'inferredKnowledge',
    'knowledgePath',
    'knowledgeSource',
    'knowledgeConfidence',
    'problemStatus',
    'problemAttempts',
    'problemBestScore',
    'errorPoint'
  ]) {
    if (!hasValue(aiStudent[key]) && hasValue(metricStudent[key])) {
      merged[key] = metricStudent[key]
    }
  }
  for (const key of ['riskLevel', 'followUpPriority', 'followUpType', 'followUpGroup']) {
    if ((!hasValue(aiStudent[key]) || aiStudent[key] === 'LOW' || aiStudent[key] === 'P3') && hasValue(metricStudent[key])) {
      merged[key] = metricStudent[key]
    }
  }
  if ((!Array.isArray(aiStudent.evidenceRefs) || !aiStudent.evidenceRefs.length) && Array.isArray(metricStudent.evidenceRefs)) {
    merged.evidenceRefs = metricStudent.evidenceRefs
  }
  if (hasValue(metricStudent.problem) && hasValue(metricStudent.problemTitle) && isGenericKnowledgeProblem(aiStudent.problem)) {
    merged.problem = metricStudent.problem
  }
  if (hasValue(metricStudent.cause) && hasValue(metricStudent.problemTitle) && isGenericKnowledgeProblem(aiStudent.cause)) {
    merged.cause = metricStudent.cause
  }
  return merged
}

function isGenericKnowledgeProblem(value) {
  const text = String(value || '').trim()
  if (!text) return true
  return text.includes('关键题/知识点') ||
    text.includes('关键知识点没有打通') ||
    text.includes('某个核心知识点') ||
    text.includes('需要定位') ||
    text.includes('进一步观察')
}

function isStudentFollowSection(section) {
  const title = String(section?.title || '')
  const badge = String(section?.badge || '')
  const readingGoal = String(section?.readingGoal || '')
  return badge === '跟进' ||
    title.includes('重点学生') ||
    title.includes('学生跟进') ||
    title.includes('找谁') ||
    readingGoal.includes('课后找谁')
}

function focusPriorityMeta(priority) {
  if (priority === 'P1') {
    return {
      short: '急',
      title: 'P1｜下次课前必须先找',
      hint: '先确认是否缺交、关键题完全卡住或多个风险叠加，不能等到期末再补。',
      borderClass: 'border-[#fecaca]',
      headerClass: 'bg-[#fff1f2]',
      dotClass: 'bg-[#ef4444]',
      textClass: 'text-[#b42318]'
    }
  }
  if (priority === 'P2') {
    return {
      short: '跟',
      title: 'P2｜本周安排一次短跟进',
      hint: '不是简单催交，要用一次代码/错题复盘确认具体卡点。',
      borderClass: 'border-[#fed7aa]',
      headerClass: 'bg-[#fff7ed]',
      dotClass: 'bg-[#f97316]',
      textClass: 'text-[#c2410c]'
    }
  }
  return {
    short: '察',
    title: 'P3｜观察复测即可',
    hint: '暂不扩大干预，用一次同知识点小题或补交结果确认是否稳定。',
    borderClass: 'border-[#bfdbfe]',
    headerClass: 'bg-[#eff6ff]',
    dotClass: 'bg-[#3b82f6]',
    textClass: 'text-[#1d4ed8]'
  }
}

function focusTypeLabel(item, reason = '') {
  const text = `${item?.followUpType || ''}${item?.followUpGroup || ''}${reason || ''}${item?.problem || ''}`
  if (text.includes('INCOMPLETE') || text.includes('SUBMISSION_BLOCKED') || text.includes('未完成') || text.includes('未提交')) return '未完成 / 提交链路'
  if (text.includes('REPEATED_FAILED_ATTEMPTS') || text.includes('反复')) return '反复提交失败'
  if (text.includes('PROBLEM_NOT_PASSED') || text.includes('关键题') || text.includes('未完全通过')) return '关键题未通过'
  if (text.includes('LOW_SCORE') || text.includes('低分')) return '低分风险'
  if (text.includes('VOLATILE') || text.includes('波动')) return '表现波动'
  return '需人工复核'
}

function formatStudentEvidence(item) {
  const parts = []
  if (item?.studentPortraitRiskLabel) parts.push(`画像${item.studentPortraitRiskLabel}`)
  if (hasValue(item?.score)) parts.push(`本次 ${formatMetric(item.score)} 分`)
  if (hasValue(item?.completionRate)) parts.push(`完成率 ${formatMetric(item.completionRate)}%`)
  if (hasValue(item?.averageScore)) parts.push(`均分 ${formatMetric(item.averageScore)}`)
  if (item?.abilityTrendLabel) parts.push(`趋势${item.abilityTrendLabel}`)
  if (hasValue(item?.recentAverageScore) && Number(item.recentAverageScore) > 0) parts.push(`近三次 ${formatMetric(item.recentAverageScore)}`)
  if (hasValue(item?.lowestScore)) parts.push(`最低 ${formatMetric(item.lowestScore)}`)
  if (hasValue(item?.acceptedProblemCount) && hasValue(item?.problemCount)) {
    parts.push(`通过 ${item.acceptedProblemCount}/${item.problemCount} 题`)
  }
  if (hasValue(item?.failedProblemCount) && Number(item.failedProblemCount) > 0) parts.push(`未过题 ${item.failedProblemCount} 个`)
  if (hasValue(item?.averageAttempts) && Number(item.averageAttempts) > 0) parts.push(`均尝试 ${formatMetric(item.averageAttempts)} 次`)
  if (hasValue(item?.incompleteExperimentCount) && Number(item.incompleteExperimentCount) > 0) parts.push(`未完成 ${item.incompleteExperimentCount} 次`)
  if (hasValue(item?.lowScoreExperimentCount) && Number(item.lowScoreExperimentCount) > 0) parts.push(`低分 ${item.lowScoreExperimentCount} 次`)
  if (parts.length) return parts.slice(0, 4).join('；')
  if (item?.riskSummary) return item.riskSummary
  if (Array.isArray(item?.riskReasons) && item.riskReasons.length) return item.riskReasons.slice(0, 2).join('；')
  return '暂无明确数值，需结合提交记录核对'
}

function studentWeakPointDetails(item) {
  const problemNo = String(item?.problemNo || '').trim()
  const problemTitle = String(item?.problemTitle || '').trim()
  const knowledge = String(item?.inferredKnowledge || '').trim()
  const errorPoint = String(item?.errorPoint || '').trim()
  const source = String(item?.knowledgeSource || '').trim().toUpperCase()
  const status = String(item?.problemStatus || '').trim().toUpperCase()
  const attempts = toNumber(item?.problemAttempts)
  const hasProblem = !!problemTitle && problemTitle !== '未知题目'
  const hasKnowledge = !!knowledge && knowledge !== '待人工确认'
  const problemLabel = hasProblem ? `第 ${problemNo || '-'} 题“${problemTitle}”` : ''
  const knowledgeLabel = hasKnowledge
    ? `${source === 'PTA_KNOWLEDGE_LEAF' ? '题目知识点' : '推断知识点'}“${knowledge}”`
    : ''
  const location = [problemLabel, knowledgeLabel, errorPoint ? `错误点“${errorPoint}”` : ''].filter(Boolean).join('，')
  const evidence = [status ? `状态 ${status}` : '', attempts > 0 ? `该题尝试 ${formatMetric(attempts)} 次` : ''].filter(Boolean).join('，')
  return { hasProblem, hasKnowledge, problemLabel, knowledgeLabel, knowledge, errorPoint, status, attempts, location, evidence }
}

function buildStudentProblemJudgment(item, fallbackReason = '') {
  const reason = String(fallbackReason || '').trim()
  const group = String(item?.followUpGroup || '').toUpperCase()
  const type = String(item?.followUpType || '').toUpperCase()
  const trendLabel = String(item?.abilityTrendLabel || '').trim()
  const portraitLabel = String(item?.studentPortraitRiskLabel || '').trim()
  const completionRate = toNumber(item?.completionRate)
  const averageScore = toNumber(item?.averageScore)
  const lowestScore = toNumber(item?.lowestScore)
  const score = toNumber(item?.score)
  const accepted = toNumber(item?.acceptedProblemCount)
  const total = toNumber(item?.problemCount)
  const failed = toNumber(item?.failedProblemCount)
  const attempts = toNumber(item?.averageAttempts)
  const incomplete = toNumber(item?.incompleteExperimentCount)
  const acceptedRate = accepted > 0 && total > 0 ? Math.round((accepted / total) * 100) : 0
  const weakPoint = studentWeakPointDetails(item)
  const evidenceParts = []

  if (hasValue(item?.score)) evidenceParts.push(`本次 ${formatMetric(score)} 分`)
  if (hasValue(item?.averageScore)) evidenceParts.push(`均分 ${formatMetric(averageScore)}`)
  if (hasValue(item?.completionRate)) evidenceParts.push(`完成率 ${formatMetric(completionRate)}%`)
  if (accepted > 0 && total > 0) evidenceParts.push(`通过 ${formatMetric(accepted)}/${formatMetric(total)} 题（${acceptedRate}%）`)
  if (failed > 0) evidenceParts.push(`未过题 ${formatMetric(failed)} 个`)
  if (attempts > 0) evidenceParts.push(`均尝试 ${formatMetric(attempts)} 次`)
  if (incomplete > 0) evidenceParts.push(`未完成 ${formatMetric(incomplete)} 次`)
  if (lowestScore > 0) evidenceParts.push(`最低 ${formatMetric(lowestScore)} 分`)
  if (trendLabel) evidenceParts.push(`趋势${trendLabel}`)
  if (portraitLabel) evidenceParts.push(`画像${portraitLabel}`)
  const evidence = evidenceParts.slice(0, 4).join('，')
  const evidenceText = evidence ? `，依据是：${evidence}` : ''

  const hasLowScore = (hasValue(item?.score) && score < 70) || (hasValue(item?.averageScore) && averageScore < 70)
  const hasVeryLowScore = (hasValue(item?.score) && score < 60) || (hasValue(item?.averageScore) && averageScore < 60)
  const hasWeakCompletion = hasValue(item?.completionRate) && completionRate > 0 && completionRate < 80
  const hasProblemGap = total > 0 && accepted < total

  if (group === 'SUBMISSION_BLOCKED' || type === 'INCOMPLETE' || reason.includes('未完成') || reason.includes('未提交')) {
    return `判断为“提交链路/未完成”优先${evidenceText}。先核对是否缺交、账号同步或提交路径卡住，再决定是否补讲知识点。`
  } else if (group === 'REPEATED_FAILED_ATTEMPTS' || attempts >= 3 || reason.includes('反复') || reason.includes('尝试')) {
    if (weakPoint.hasProblem) {
      return `具体卡在${weakPoint.location}${evidenceText}。${weakPoint.evidence || '该题反复提交仍未通过'}，应直接核对最后一次失败代码。`
    }
    return `确认存在反复尝试未通过${evidenceText}，但数据库没有匹配到具体题目和知识点；请先同步题目明细，不能笼统写成“关键知识点没打通”。`
  } else if (group === 'PROBLEM_NOT_PASSED' || type === 'PROBLEM_NOT_PASSED' || reason.includes('关键题') || reason.includes('未完全通过')) {
    if (weakPoint.hasProblem) {
      return `具体卡在${weakPoint.location}${evidenceText}。${weakPoint.evidence || '该题尚未通过'}，教师应围绕这个错误点讲解并布置同知识点变式题。`
    }
    return `确认有未通过题${evidenceText}，但当前报告缺少题号、题名和知识点映射；需要重新生成报告补齐题目明细，不能让教师自行猜测。`
  } else if (
    group === 'LOW_SCORE' ||
    type === 'LOW_SCORE' ||
    reason.includes('低分') ||
    hasLowScore
  ) {
    const label = hasVeryLowScore ? '基础断点比较明显' : '基础不稳但仍可短练纠偏'
    return `判断为“${label}”${evidenceText}。优先从最低分题或最近一次低分实验切入，让学生写清“错因—修改—验证”，避免泛泛重做。`
  } else if (hasProblemGap) {
    if (weakPoint.hasProblem) return `具体卡在${weakPoint.location}${evidenceText}。请直接用该题最后一次代码定位并复测。`
    return `确认题目通过率不足${evidenceText}，但当前报告未带回具体题目和知识点，需要重新生成后再给出教学结论。`
  } else if (hasWeakCompletion) {
    return `判断为“完成稳定性不足”${evidenceText}。先查是否存在拖交、漏交或实验步骤断点，再用一次短任务确认能否独立完成。`
  } else if (trendLabel || portraitLabel) {
    return `判断为“波动观察”${evidenceText}。先看最近几次实验是持续下滑还是偶发波动，再决定是否升级为 P2/P1 跟进。`
  }

  if (reason) return `${reason}${evidenceText ? `（${evidence}）` : ''}`
  return `需要结合最近的提交、成绩和错题记录进一步判断${evidenceText}。`
}

function buildStudentStuckPoint(item, fallbackReason = '') {
  const followUpType = String(item?.followUpType || '').toUpperCase()
  const reason = String(fallbackReason || '').trim()
  const problem = String(item?.problem || '').trim()
  const cause = String(item?.cause || '').trim()
  const score = toNumber(item?.score)
  const averageScore = toNumber(item?.averageScore)
  const completionRate = toNumber(item?.completionRate)
  const attempts = toNumber(item?.averageAttempts)
  const failed = toNumber(item?.failedProblemCount)
  const accepted = toNumber(item?.acceptedProblemCount)
  const total = toNumber(item?.problemCount)
  const weakPoint = studentWeakPointDetails(item)

  if (weakPoint.hasProblem) {
    return `卡在${weakPoint.location}${weakPoint.evidence ? `（${weakPoint.evidence}）` : ''}`
  }

  if (problem && !isGenericKnowledgeProblem(problem)) return problem

  if (followUpType === 'INCOMPLETE' || reason.includes('未完成') || reason.includes('未提交')) {
    const bits = []
    if (completionRate > 0 && completionRate < 80) bits.push(`完成率 ${formatMetric(completionRate)}%`)
    if (cause) bits.push(cause)
    return `卡在提交链路：${bits.length ? bits.join('，') : '缺交、PTA 同步或环境配置'}`
  }

  if (followUpType === 'REPEATED_FAILED_ATTEMPTS' || attempts >= 3 || reason.includes('反复') || reason.includes('尝试')) {
    const bits = []
    if (attempts > 0) bits.push(`平均尝试 ${formatMetric(attempts)} 次`)
    if (cause) bits.push(cause)
    return `卡在反复调试后仍未打通：${bits.length ? bits.join('，') : '边界样例、关键分支或调试顺序'}`
  }

  if (followUpType === 'PROBLEM_NOT_PASSED' || reason.includes('关键题') || reason.includes('未完全通过') || (total > 0 && accepted < total)) {
    const bits = []
    if (total > 0 && accepted < total) bits.push(`只通过 ${formatMetric(accepted)}/${formatMetric(total)} 题`)
    if (failed > 0) bits.push(`还有 ${formatMetric(failed)} 个题目未过`)
    if (cause) bits.push(cause)
    return `存在未通过题，但题号、题名和知识点数据缺失：${bits.length ? bits.join('，') : '请重新生成报告以补齐题目明细'}`
  }

  if (followUpType === 'LOW_SCORE' || reason.includes('低分') || (hasValue(item?.score) && score > 0 && score < 70) || (hasValue(item?.averageScore) && averageScore > 0 && averageScore < 70)) {
    const bits = []
    if (score > 0) bits.push(`本次 ${formatMetric(score)} 分`)
    if (averageScore > 0) bits.push(`均分 ${formatMetric(averageScore)}`)
    if (cause) bits.push(cause)
    return `卡在基础步骤不稳：${bits.length ? bits.join('，') : '最低分题、核心步骤或报告分析'}`
  }

  if (completionRate > 0 && completionRate < 80) {
    return `卡在完成稳定性不足：完成率 ${formatMetric(completionRate)}%，需要先核对拖交、漏交或实验流程断点。`
  }

  return reason || '卡点暂未收敛到具体步骤，建议结合提交记录和错题进一步定位。'
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== ''
}

function formatMetric(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return value
  return Number.isInteger(number) ? String(number) : number.toFixed(1)
}

function riskTone(reason, item) {
  const riskLevel = String(item?.riskLevel || '').toUpperCase()
  const priority = item?.followUpPriority || (riskLevel === 'HIGH' ? 'P1' : riskLevel === 'MEDIUM' ? 'P2' : 'P3')
  if (riskLevel === 'HIGH') {
    return { tag: 'P1', priority, riskLevel, levelClass: 'text-[#b42318]', tone: 'border-[#fecaca] bg-[#fef2f2]', dotClass: 'bg-[#ef4444]' }
  }
  if (riskLevel === 'MEDIUM') {
    return { tag: 'P2', priority, riskLevel, levelClass: 'text-[#c2410c]', tone: 'border-[#fed7aa] bg-[#fff7ed]', dotClass: 'bg-[#f97316]' }
  }
  const text = `${reason || ''}${item.score || ''}${item.averageScore || ''}${item.followUpType || ''}`
  if (text.includes('未完成') || text.includes('未提交') || text.includes('缺')) {
    return { tag: 'P2', priority: 'P2', riskLevel: 'MEDIUM', levelClass: 'text-[#c2410c]', tone: 'border-[#fed7aa] bg-[#fff7ed]', dotClass: 'bg-[#f97316]' }
  }
  if (text.includes('低分') || (hasValue(item.score) && toNumber(item.score) < 60) || (hasValue(item.averageScore) && toNumber(item.averageScore) < 60)) {
    return { tag: 'P2', priority: 'P2', riskLevel: 'MEDIUM', levelClass: 'text-[#c2410c]', tone: 'border-[#fed7aa] bg-[#fff7ed]', dotClass: 'bg-[#f97316]' }
  }
  return { tag: 'P3', priority, riskLevel: riskLevel || 'LOW', levelClass: 'text-[#1d4ed8]', tone: 'border-[#bfdbfe] bg-[#eff6ff]', dotClass: 'bg-[#3b82f6]' }
}

function isGenericStudentSuggestion(text) {
  if (!text) return true
  return text.includes('短周期跟进') ||
    text.includes('基础知识、实验环境和报告分析') ||
    text.includes('同类最小任务') ||
    text.includes('关键步骤和自查点')
}

function specificStudentSuggestion(item, reason = '') {
  const text = `${reason || ''}${item.problem || ''}${item.followUpType || ''}`
  const scoreText = item.score || item.averageScore
  if (text.includes('未完成') || text.includes('未提交') || text.includes('INCOMPLETE')) {
    return '先让学生现场打开实验提交页和 PTA 记录：无提交就补交一个最小可运行样例；有提交但不同步就核对账号绑定；若卡题就指定最低通过率题重做 1 次。'
  }
  if (text.includes('REPEATED_FAILED_ATTEMPTS') || text.includes('反复尝试')) {
    return '让学生同时打开最后一次失败提交和最接近通过的提交，只追问一个关键分支或边界样例，再做 1 道同知识点最小变式题。'
  }
  if (text.includes('关键题') || text.includes('未完全通过') || text.includes('PROBLEM_NOT_PASSED')) {
    return `让学生拿出未通过题的最后一次代码，先说清输入、输出和关键判断条件，再做 1 道同知识点最小变式题。${scoreText ? `当前分数参考：${scoreText}。` : ''}`
  }
  if (text.includes('低分') || text.includes('LOW_SCORE') || (hasValue(item.score) && toNumber(item.score) < 70) || (hasValue(item.averageScore) && toNumber(item.averageScore) < 70)) {
    return '选最低分实验的一道代表题，让学生复述解题步骤，并补一张“错因—修改—验证”三列表，不再只要求笼统重做。'
  }
  return '抽查最近一次波动实验，让学生对比一次成功提交和一次失败提交的差异，再补一个边界样例确认是否稳定。'
}

function specificStudentValidation(item, reason = '') {
  const text = `${reason || ''}${item.problem || ''}${item.followUpType || ''}`
  if (text.includes('未完成') || text.includes('未提交') || text.includes('INCOMPLETE')) {
    return '下一次实验前补齐一次有效提交，并能说清自己卡在“环境、提交、题目步骤”中的哪一类。'
  }
  if (text.includes('REPEATED_FAILED_ATTEMPTS') || text.includes('反复尝试')) {
    return '能指出失败提交里的一个具体错误，并在同知识点小题中一次通过或明显减少尝试次数。'
  }
  if (text.includes('关键题') || text.includes('未完全通过') || text.includes('PROBLEM_NOT_PASSED')) {
    return '当场完成 1 道同知识点小题，并指出原题中 1 个具体自查点。'
  }
  if (text.includes('低分') || text.includes('LOW_SCORE') || (hasValue(item.score) && toNumber(item.score) < 70) || (hasValue(item.averageScore) && toNumber(item.averageScore) < 70)) {
    return '重新提交或完成同类短练后，能用一句话说明原错误和修正依据。'
  }
  return '后续一次同类实验不再出现相同错误类型，并主动写出自查点。'
}

function quickActionTone(index) {
  return [
    'border-[#dce8ff] bg-[#fbfdff]',
    'border-[#d7f1e1] bg-[#fbfffc]',
    'border-[#eadfce] bg-[#fffdf8]'
  ][index % 3]
}

function quickActionDot(index) {
  return ['bg-[#2f6fed]', 'bg-[#1f8f5f]', 'bg-[#f59e0b]'][index % 3]
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function joinRefs(refs) {
  return Array.isArray(refs) && refs.length ? refs.join('、') : '暂无'
}

function activeMarkdownSectionIndexFor(key) {
  const index = renderedAdviceSections.value.findIndex(item => item.key === key)
  return index >= 0 ? index : 0
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function handleMarkdownScroll(event) {
  showBackToTop.value = Number(event?.target?.scrollTop || 0) > 240
}

function handleFocusPanelScroll(event) {
  hideStudentActionPopover()
  showFocusBackToTop.value = Number(event?.target?.scrollTop || 0) > 220
}

function resetMarkdownScroll() {
  showBackToTop.value = false
  nextTick(() => {
    const el = markdownContentRef.value
    if (el) el.scrollTop = 0
  })
}

function jumpToStudentLayer() {
  document
    .getElementById('student-layer-analysis')
    ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

function scrollElementToTop(el) {
  if (!el) return false
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
  if (typeof el.scrollTo === 'function') {
    el.scrollTo({ top: 0, behavior })
  } else {
    el.scrollTop = 0
  }
  return true
}

function scrollMarkdownToTop() {
  let scrolled = false
  const contentEl = markdownContentRef.value

  scrolled = scrollElementToTop(contentEl) || scrolled
  scrolled = scrollElementToTop(markdownOutlineRef.value) || scrolled

  contentEl
    ?.querySelectorAll?.('.teaching-advice-markdown, .markdown-body')
    ?.forEach(node => {
      scrolled = scrollElementToTop(node) || scrolled
    })

  if (!scrolled) {
    const root = reportRootRef.value || document.getElementById('teaching-advice-markdown-root')
    root?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }
  showBackToTop.value = false
}

function scrollFocusPanelToTop() {
  hideStudentActionPopover()
  const el = focusPanelRef.value
  if (el) {
    el.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    showFocusBackToTop.value = false
  }
}

async function copyRawAdvice() {
  const text = adviceMarkdown.value || ''
  if (!text) return
  try {
    await navigator.clipboard?.writeText(text)
    rawAdviceCopied.value = true
    window.setTimeout(() => {
      rawAdviceCopied.value = false
    }, 1600)
  } catch {
    rawAdviceCopied.value = false
  }
}

function scopeLabel(value) {
  return scopeOptions.find(item => item.value === value)?.label || value
}

function changeScope(nextLevel) {
  if (scopeLevel.value === nextLevel) return
  scopeLevel.value = nextLevel
  activeReport.value = null
  contextData.value = null
  focusPanelOpen.value = false
  focusFollowExpanded.value = false
  prepReminderExpanded.value = false
  expandedFocusStudentKey.value = ''
  selectedFocusPriority.value = 'ALL'
  errorMessage.value = ''
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN')
}

function requestPayload() {
  return {
    scopeLevel: scopeLevel.value,
    classId: props.classId,
    experimentId: scopeLevel.value === 'EXPERIMENT' ? experimentId.value : null,
    includeHistory: scopeLevel.value !== 'EXPERIMENT' && includeHistory.value
  }
}

async function loadContext() {
  activeReport.value = null
  contextData.value = null
  focusPanelOpen.value = false
  focusFollowExpanded.value = false
  prepReminderExpanded.value = false
  expandedFocusStudentKey.value = ''
  selectedFocusPriority.value = 'ALL'
  errorMessage.value = ''
  if (!canGenerate.value) {
    contextData.value = null
    return
  }
  const requestId = ++contextRequestId
  contextLoading.value = true
  try {
    const result = unwrap(await getTeachingAdviceContext(requestPayload()))
    if (requestId === contextRequestId) contextData.value = result
  } catch (error) {
    if (requestId !== contextRequestId) return
    contextData.value = null
    errorMessage.value = error?.message || '教学建议数据范围加载失败'
    logger.error('加载教学建议数据范围失败:', error)
  } finally {
    if (requestId === contextRequestId) contextLoading.value = false
  }
}

async function loadReports() {
  try {
    const result = unwrap(await getTeachingAdviceReports())
    reports.value = Array.isArray(result) ? result : []
  } catch (error) {
    logger.error('加载教学建议历史失败:', error)
  }
}

function sleep(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

async function pollGeneratedReport(reportId, requestId) {
  if (!reportId) return null
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (componentUnmounted || requestId !== generationRequestId) return null
    const report = unwrap(await getTeachingAdviceReport(reportId))
    if (componentUnmounted || requestId !== generationRequestId) return null
    activeReport.value = report
    const status = String(report?.status || '').toUpperCase()
    if (status === 'COMPLETED') return report
    if (status === 'FAILED') throw new Error(report?.errorMessage || '教学建议生成失败')
    await sleep(2500)
  }
  return activeReport.value
}

async function generateReport() {
  if (!canGenerate.value || generating.value) return
  const requestId = ++generationRequestId
  generating.value = true
  focusPanelOpen.value = false
  focusFollowExpanded.value = false
  prepReminderExpanded.value = false
  expandedFocusStudentKey.value = ''
  selectedFocusPriority.value = 'ALL'
  errorMessage.value = ''
  try {
    const generatedReport = unwrap(await generateTeachingAdvice(requestPayload()))
    const returnedLevel = String(generatedReport?.scopeLevel || generatedReport?.scope?.level || '').toUpperCase()
    if (returnedLevel && returnedLevel !== scopeLevel.value) {
      throw new Error(`接口返回了${scopeLabel(returnedLevel)}报告，当前选择的是${scopeLabel(scopeLevel.value)}，已阻止显示旧范围结果`)
    }
    activeReport.value = generatedReport
    if (String(generatedReport?.status || '').toUpperCase() === 'GENERATING') {
      uiMessage.success('教学建议已进入后台生成，页面会自动刷新结果')
      await loadReports()
      const completedReport = await pollGeneratedReport(generatedReport.id, requestId)
      if (completedReport && String(completedReport.status || '').toUpperCase() === 'COMPLETED') {
        await loadReports()
        uiMessage.success('教学建议已生成并保存')
      } else if (!componentUnmounted && requestId === generationRequestId) {
        await loadReports()
        uiMessage.warning('教学建议仍在后台生成，可稍后从历史报告打开')
      }
      return
    }
    await loadReports()
    uiMessage.success('教学建议已生成并保存')
  } catch (error) {
    if (requestId !== generationRequestId) return
    errorMessage.value = error?.message || '教学建议生成失败'
    uiMessage.warning(errorMessage.value)
    logger.error('生成可信教学建议失败:', error)
    await loadReports()
  } finally {
    generating.value = false
  }
}

async function selectReport(report) {
  if (!report?.id) return
  activeReport.value = report
  focusPanelOpen.value = false
  focusFollowExpanded.value = false
  prepReminderExpanded.value = false
  expandedFocusStudentKey.value = ''
  selectedFocusPriority.value = 'ALL'
  try {
    const detail = unwrap(await getTeachingAdviceReport(report.id))
    activeReport.value = detail
  } catch (error) {
    errorMessage.value = error?.message || '历史教学建议详情加载失败'
    uiMessage.warning(errorMessage.value)
    logger.error('加载教学建议详情失败:', error)
  }
}

watch(() => props.experiments, rows => {
  if (experimentId.value && !rows.some(item => String(item.id) === String(experimentId.value))) experimentId.value = ''
}, { deep: true })
watch([() => props.classId, scopeLevel, experimentId, includeHistory], loadContext, { immediate: true })
watch(() => props.classId, loadReports, { immediate: true })
watch(renderedAdviceSections, sections => {
  if (!sections.length) {
    expandedMarkdownSectionKey.value = ''
    showBackToTop.value = false
    return
  }
  if (!sections.some(item => item.key === expandedMarkdownSectionKey.value)) {
    expandedMarkdownSectionKey.value = sections[0].key
    resetMarkdownScroll()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  componentUnmounted = true
  generationRequestId += 1
})
</script>

<style scoped>
.teaching-advice-shell {
  display: flex;
  height: calc(100vh - 118px);
  min-height: 680px;
  max-height: 1000px;
  flex-direction: column;
  overflow: hidden;
  border-color: rgba(160, 132, 92, 0.16);
  background: #faf8f3 !important;
  color: #1f2937;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.teaching-advice-body {
  min-height: 0;
}

.teaching-advice-report {
  position: relative;
  display: flex;
  flex-direction: column;
  border-color: #eadfce !important;
  background: #ffffff !important;
  transition:
    filter 240ms ease,
    opacity 240ms ease;
}

.teaching-advice-report-body {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.teaching-advice-report-grid {
  height: 100%;
  min-height: 0;
}

.teaching-advice-outline,
.teaching-advice-content,
.teaching-advice-side-panel {
  max-height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.teaching-advice-content {
  height: 100%;
  padding-right: 4px;
}

.teaching-advice-outline {
  scrollbar-color: rgba(148, 163, 184, 0.7) rgba(241, 245, 249, 0.85);
  scrollbar-width: thin;
}

.teaching-advice-content {
  scrollbar-color: rgba(82, 137, 211, 0.82) rgba(235, 242, 252, 0.9);
  scrollbar-width: thin;
}

.teaching-advice-side-panel {
  position: relative;
  z-index: 10;
  scrollbar-color: rgba(82, 137, 211, 0.72) rgba(235, 242, 252, 0.86);
  scrollbar-width: thin;
}

.teaching-advice-markdown {
  scrollbar-color: rgba(82, 137, 211, 0.72) rgba(235, 242, 252, 0.86);
  scrollbar-width: thin;
}

.teaching-advice-outline::-webkit-scrollbar,
.teaching-advice-content::-webkit-scrollbar,
.teaching-advice-side-panel::-webkit-scrollbar,
.teaching-advice-markdown::-webkit-scrollbar {
  width: 8px;
}

.teaching-advice-outline::-webkit-scrollbar-track,
.teaching-advice-content::-webkit-scrollbar-track,
.teaching-advice-side-panel::-webkit-scrollbar-track,
.teaching-advice-markdown::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.8);
}

.teaching-advice-outline::-webkit-scrollbar-thumb,
.teaching-advice-content::-webkit-scrollbar-thumb,
.teaching-advice-side-panel::-webkit-scrollbar-thumb,
.teaching-advice-markdown::-webkit-scrollbar-thumb {
  border: 2px solid rgba(241, 245, 249, 0.8);
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.75);
}

.teaching-advice-content::-webkit-scrollbar-track {
  background: rgba(235, 242, 252, 0.9);
}

.teaching-advice-content::-webkit-scrollbar-thumb {
  border-color: rgba(235, 242, 252, 0.9);
  background: rgba(82, 137, 211, 0.82);
}

.teaching-advice-side-panel::-webkit-scrollbar-track {
  background: rgba(235, 242, 252, 0.86);
}

.teaching-advice-side-panel::-webkit-scrollbar-thumb {
  border-color: rgba(235, 242, 252, 0.86);
  background: rgba(82, 137, 211, 0.72);
}

.teaching-advice-outline::-webkit-scrollbar-thumb:hover,
.teaching-advice-content::-webkit-scrollbar-thumb:hover,
.teaching-advice-side-panel::-webkit-scrollbar-thumb:hover,
.teaching-advice-markdown::-webkit-scrollbar-thumb:hover {
  background: rgba(47, 111, 237, 0.86);
}

.teaching-advice-markdown::-webkit-scrollbar-track {
  background: rgba(235, 242, 252, 0.86);
}

.teaching-advice-markdown::-webkit-scrollbar-thumb {
  border-color: rgba(235, 242, 252, 0.86);
  background: rgba(82, 137, 211, 0.72);
}

.advice-soft-card {
  border: 1px solid #eadfce;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 8px 18px rgba(92, 74, 52, 0.06);
}

.advice-soft-card-accent {
  border-color: #eadfce;
  background: #fffaf3;
  color: #7b4f17 !important;
}

.student-action-floating-popover {
  position: fixed;
  z-index: 90;
  border: 1px solid #ead3ad;
  border-right-color: #c7781e;
  border-radius: 16px;
  background: #fff8e8;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.92) inset,
    0 18px 36px rgba(120, 72, 20, 0.14);
  padding: 14px 15px;
  pointer-events: none;
  color: #2f2419;
}

.student-action-floating-popover::before,
.student-action-floating-popover::after {
  position: absolute;
  top: var(--student-popover-arrow-top, 42px);
  width: 0;
  height: 0;
  content: '';
  transform: translateY(-50%);
}

.student-action-floating-popover::before {
  right: -11px;
  border-bottom: 10px solid transparent;
  border-left: 11px solid #c7781e;
  border-top: 10px solid transparent;
}

.student-action-floating-popover::after {
  right: -9px;
  border-bottom: 9px solid transparent;
  border-left: 10px solid #fff8e8;
  border-top: 9px solid transparent;
}

.student-card {
  isolation: isolate;
  transform-origin: center;
  will-change: transform, box-shadow;
}

.student-card:hover,
.student-card:focus-within {
  z-index: 50;
  outline: 1px solid rgba(255, 255, 255, 0.94);
  transform: translateY(-2px);
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.96),
    0 0 0 5px rgba(204, 137, 48, 0.10),
    0 12px 26px rgba(15, 23, 42, 0.12);
}

.student-card:hover .student-card-readable,
.student-card:focus-within .student-card-readable {
  opacity: 1;
  filter: none;
}

.student-card-readable p {
  text-rendering: geometricPrecision;
}

.student-card-readable p span.font-semibold {
  color: #111827;
  font-weight: 700;
}

.teaching-advice-body:has(.student-card:hover) .teaching-advice-report {
  opacity: 1;
  filter: none;
  transition:
    filter 240ms ease,
    opacity 240ms ease;
}

.teaching-advice-body:has(.student-card:hover) .teaching-advice-side-panel {
  opacity: 1;
  filter: none;
}

.student-popover-enter-active,
.student-popover-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.student-popover-enter-from,
.student-popover-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.back-top-enter-active,
.back-top-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.back-top-enter-from,
.back-top-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.92);
}

.report-section-enter-active,
.report-section-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.report-section-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.report-section-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.focus-panel-toggle {
  will-change: transform, box-shadow, background-color;
}

.focus-panel-toggle-dot {
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.08);
  transition:
    background-color 260ms ease,
    box-shadow 260ms ease,
    transform 260ms ease;
}

.focus-panel-toggle:hover .focus-panel-toggle-dot {
  transform: scale(1.16);
  box-shadow: 0 0 0 5px rgba(217, 119, 6, 0.12);
}

.focus-panel-toggle-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  transition:
    transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 220ms ease;
}

.focus-panel-toggle-arrow.is-open {
  transform: rotate(180deg);
}

.focus-panel-enter-active,
.focus-panel-leave-active {
  transition:
    opacity 280ms ease,
    transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.focus-panel-enter-from,
.focus-panel-leave-to {
  opacity: 0;
  transform: translateX(18px) scale(0.985);
}

.sidebar-accordion-enter-active,
.sidebar-accordion-leave-active {
  overflow: hidden;
  transition:
    grid-template-rows 430ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms ease;
}

.sidebar-accordion-enter-from,
.sidebar-accordion-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.sidebar-accordion-enter-to,
.sidebar-accordion-leave-from {
  grid-template-rows: 1fr;
  opacity: 1;
}

.sidebar-accordion-shell {
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
}

.sidebar-accordion-inner {
  min-height: 0;
  overflow: hidden;
  transform-origin: right top;
  will-change: transform, opacity;
  transition:
    transform 430ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms ease;
}

.sidebar-accordion-enter-from .sidebar-accordion-inner,
.sidebar-accordion-leave-to .sidebar-accordion-inner {
  transform: translateX(18px);
  opacity: 0;
}

.sidebar-accordion-enter-to .sidebar-accordion-inner,
.sidebar-accordion-leave-from .sidebar-accordion-inner {
  transform: translateX(0);
  opacity: 1;
}

.detail-fade-enter-active,
.detail-fade-leave-active {
  overflow: hidden;
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    max-height 180ms ease;
}

.detail-fade-enter-from,
.detail-fade-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}

.detail-fade-enter-to,
.detail-fade-leave-from {
  max-height: 220px;
  opacity: 1;
  transform: translateY(0);
}

.focus-filter-enter-active,
.focus-filter-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.focus-filter-enter-from,
.focus-filter-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .report-section-enter-active,
  .report-section-leave-active,
  .focus-panel-enter-active,
  .focus-panel-leave-active,
  .sidebar-accordion-enter-active,
  .sidebar-accordion-leave-active,
  .detail-fade-enter-active,
  .detail-fade-leave-active,
  .focus-filter-enter-active,
  .focus-filter-leave-active,
  .student-popover-enter-active,
  .student-popover-leave-active,
  .back-top-enter-active,
  .back-top-leave-active {
    transition: none;
  }

  .sidebar-chevron {
    transition: none;
  }
}

@media (max-width: 1279px) {
  .teaching-advice-shell {
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .teaching-advice-body,
  .teaching-advice-report,
  .teaching-advice-report-body,
  .teaching-advice-report-grid {
    overflow: visible;
  }

  .teaching-advice-outline,
  .teaching-advice-content,
  .teaching-advice-side-panel {
    max-height: none;
    overflow: visible;
  }

  .teaching-advice-content {
    height: auto;
    padding-right: 0;
  }
}

.compact-line-clamp-2,
.compact-line-clamp-3 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.compact-line-clamp-2 {
  -webkit-line-clamp: 2;
}

.compact-line-clamp-3 {
  -webkit-line-clamp: 3;
}

.teaching-advice-markdown :deep(h1),
.teaching-advice-markdown :deep(h2),
.teaching-advice-markdown :deep(h3) {
  margin: 18px 0 10px;
  color: #111827;
  font-weight: 700;
  line-height: 1.35;
}

.teaching-advice-markdown :deep(h1:first-child),
.teaching-advice-markdown :deep(h2:first-child),
.teaching-advice-markdown :deep(h3:first-child) {
  margin-top: 0;
}

.teaching-advice-markdown :deep(h2) {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 18px;
}

.teaching-advice-markdown :deep(h3) {
  font-size: 15px;
}

.teaching-advice-markdown :deep(p),
.teaching-advice-markdown :deep(ul),
.teaching-advice-markdown :deep(ol) {
  margin: 10px 0;
}

.teaching-advice-markdown :deep(p:first-child),
.teaching-advice-markdown :deep(ul:first-child),
.teaching-advice-markdown :deep(ol:first-child) {
  margin-top: 0;
}

.teaching-advice-markdown :deep(p:last-child),
.teaching-advice-markdown :deep(ul:last-child),
.teaching-advice-markdown :deep(ol:last-child) {
  margin-bottom: 0;
}

.teaching-advice-markdown :deep(ul),
.teaching-advice-markdown :deep(ol) {
  padding-left: 0;
  list-style-position: inside;
}

.teaching-advice-markdown :deep(li) {
  margin: 8px 0;
  border: 1px solid #eadfce;
  border-radius: 12px;
  background: #fffdf8;
  padding: 8px 10px;
  color: #374151;
  box-shadow: 0 3px 10px rgba(92, 74, 52, 0.04);
}

.teaching-advice-markdown :deep(li::marker) {
  color: #c7781e;
  font-weight: 700;
}

.teaching-advice-markdown :deep(blockquote) {
  margin: 12px 0;
  border: 1px solid #eadfce;
  border-left: 4px solid #c7781e;
  border-radius: 12px;
  background: #fffaf3;
  padding: 12px 14px;
  color: #334155;
  box-shadow: 0 5px 14px rgba(92, 74, 52, 0.06);
}

.teaching-advice-markdown :deep(table) {
  width: 100%;
  margin: 12px 0;
  border-collapse: collapse;
  border: 1px solid #eadfce;
  border-radius: 12px;
  overflow: hidden;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.06);
}

.teaching-advice-markdown :deep(th),
.teaching-advice-markdown :deep(td) {
  border: 1px solid #eadfce;
  padding: 8px 10px;
  text-align: left;
}

.teaching-advice-markdown :deep(th) {
  background: #f8fafc;
}
</style>
