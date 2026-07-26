<template>
  <section class="rounded-[24px] border border-black/[0.06] bg-white/95 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] lg:p-6">
    <div class="flex flex-col gap-4 border-b border-black/[0.06] pb-5 xl:flex-row xl:items-center xl:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary)] text-sm font-bold text-white">AI</span>
          <div>
            <h2 class="text-lg font-semibold text-[#1d1d1f]">AI 助教 · 教学建议</h2>
            <p class="mt-1 text-xs leading-5 text-[#6e6e73]">给老师看的版本：先给可执行教学动作，再把数据依据折叠到后面核对。</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div class="inline-flex h-10 items-center rounded-[10px] bg-[#f1f3f5] p-1" aria-label="建议分析层级">
          <button
            v-for="item in scopeOptions"
            :key="item.value"
            type="button"
            class="h-8 min-w-[82px] rounded-[7px] border-none px-3 text-sm font-medium transition-colors"
            :class="scopeLevel === item.value ? 'bg-white text-[#1d1d1f] shadow-[0_1px_4px_rgba(0,0,0,0.12)]' : 'bg-transparent text-[#6e6e73] hover:text-[#1d1d1f]'"
            @click="scopeLevel = item.value"
          >
            {{ item.label }}
          </button>
        </div>

        <UiSelect
          v-if="scopeLevel === 'EXPERIMENT'"
          v-model="experimentId"
          placeholder="选择实验"
          class="h-10 min-w-[220px] rounded-[10px] bg-[#f5f5f7] px-3 text-sm"
        >
          <UiOption v-for="item in experiments" :key="item.id" :value="item.id">{{ item.name }}</UiOption>
        </UiSelect>

        <button
          v-if="scopeLevel !== 'EXPERIMENT'"
          type="button"
          role="switch"
          :aria-checked="includeHistory"
          class="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.08] bg-white px-3 text-sm text-[#374151]"
          @click="includeHistory = !includeHistory"
        >
          <span class="relative h-5 w-9 rounded-full transition-colors" :class="includeHistory ? 'bg-[var(--app-primary)]' : 'bg-[#d1d5db]'">
            <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" :class="includeHistory ? 'translate-x-[18px]' : 'translate-x-0.5'"></span>
          </span>
          同课程历史学期
        </button>

        <div class="flex flex-col items-stretch gap-1 sm:items-end">
          <button
            type="button"
            :disabled="generateButtonDisabled"
            :title="disabledReason || '生成教学建议'"
            class="inline-flex h-11 min-w-[148px] items-center justify-center rounded-[13px] border border-[var(--app-primary)] bg-[var(--app-primary)] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(47,111,237,0.22)] transition-all hover:bg-[var(--app-primary-strong)] active:scale-[0.96] disabled:border-[#d1d5db] disabled:bg-[#e5e7eb] disabled:text-[#6b7280] disabled:shadow-none disabled:cursor-not-allowed"
            @click="generateReport"
          >
            {{ generateButtonLabel }}
          </button>
          <span v-if="disabledReason" class="text-right text-[11px] leading-4 text-[#a15c00]">{{ disabledReason }}</span>
        </div>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-4">
      <div v-if="errorMessage" class="rounded-[12px] border border-[#f0c4bd] bg-[#fff7f5] px-4 py-3 text-sm text-[#a63d32]">
        {{ errorMessage }}
      </div>

      <div v-if="contextLoading" class="space-y-3 py-4">
        <div v-for="width in [92, 78, 84]" :key="width" class="h-4 animate-pulse rounded bg-[#f1f3f5]" :style="{ width: `${width}%` }"></div>
      </div>

      <template v-else-if="activeData">
        <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div class="min-w-0 space-y-4">
            <div v-if="false && advice" class="rounded-[22px] border border-[#d6e7ff] bg-gradient-to-br from-[#eef7ff] to-[#ecfbf4] p-4 shadow-[0_10px_28px_rgba(47,111,237,0.08)] lg:p-5">
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

            <div v-if="!advice" class="rounded-[22px] border border-dashed border-[#c7d7fe] bg-[#f8fbff] px-5 py-10 text-center">
              <h3 class="text-lg font-semibold text-[#111827]">先生成 AI 教学决策报告</h3>
              <p class="mx-auto mt-2 max-w-[680px] text-sm leading-6 text-[#6e6e73]">
                当前范围已就绪。点击生成后，页面会直接给出“核心教学问题、下一节课怎么教、分层学生怎么跟、实验/学期/课程怎么调”，不会在主区域重复堆数据。
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
              <div class="border-b border-[#dbeafe] bg-gradient-to-r from-[#eff6ff] via-white to-[#f8fafc] px-4 py-4">
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

                <article v-if="priorityKnowledgeRows.length" class="rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] p-4">
                  <div class="text-xs font-semibold text-[#1d4ed8]">优先补救知识点</div>
                  <div class="mt-3 space-y-3">
                    <div v-for="item in priorityKnowledgeRows" :key="item.knowledge" class="text-xs leading-5 text-[#374151]">
                      <div class="font-semibold text-[#1d1d1f]">{{ item.knowledge }} <span class="font-normal text-[#6e6e73]">· {{ item.confidence || 'MEDIUM' }}</span></div>
                      <p v-if="item.teachingAdvice" class="mt-1">{{ item.teachingAdvice }}</p>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div v-if="!advice && diagnosisVisible" class="rounded-[20px] border border-[#dbeafe] bg-white p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="text-base font-semibold text-[#1d1d1f]">生成前可用的真实学情信号</h3>
                  <p class="mt-1 text-xs leading-5 text-[#6e6e73]">
                    这些不是最终建议，只用于提醒老师：AI 会基于哪些做题结果、错误状态和数据质量生成判断。
                  </p>
                </div>
                <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="diagnosisReliability.className">
                  {{ diagnosisReliability.label }}
                </span>
              </div>

              <div v-if="learningDiagnosis.conclusion" class="mt-4 rounded-[16px] bg-[#f8fafc] px-4 py-3">
                <div class="text-xs font-semibold text-[#1d1d1f]">诊断结论</div>
                <p class="mt-2 text-sm leading-6 text-[#374151]">{{ learningDiagnosis.conclusion }}</p>
                <p v-if="learningDiagnosis.nextTeachingAction" class="mt-2 text-xs leading-5 text-[#2563eb]">
                  下一步：{{ learningDiagnosis.nextTeachingAction }}
                </p>
              </div>

              <div class="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <article v-if="problemErrorPointRows.length" class="rounded-[16px] border border-[#fecaca] bg-[#fffafa] px-4 py-3 lg:col-span-3">
                  <div class="text-xs font-semibold text-[#991b1b]">学生做题错误点</div>
                  <div class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div v-for="item in problemErrorPointRows" :key="`${item.problemNo}-${item.title}-${item.errorPoint}`" class="rounded-[12px] bg-white px-3 py-3 text-xs leading-5 text-[#4b5563]">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="rounded bg-[#fef2f2] px-2 py-0.5 font-mono text-[#b42318]">第 {{ item.problemNo || '-' }} 题</span>
                        <span class="font-semibold text-[#1d1d1f]">{{ item.title }}</span>
                        <span v-if="item.inferredKnowledge" class="rounded bg-white px-2 py-0.5 text-[#6b7280]">
                          {{ knowledgeSourceLabel(item) }}：{{ item.inferredKnowledge }}
                        </span>
                        <span v-if="item.difficultyLabel" class="rounded bg-[#fff7ed] px-2 py-0.5 text-[#c2410c]">
                          {{ item.difficultyLabel }}
                        </span>
                      </div>
                      <p class="mt-2">
                        <span class="font-semibold text-[#991b1b]">错误点：</span>{{ item.errorPoint }}
                      </p>
                      <p class="mt-1">
                        <span class="font-semibold text-[#1d1d1f]">主要状态：</span>{{ item.dominantStatus || 'UNKNOWN' }}
                        <span class="ml-2 text-[#8a8a8f]">影响 {{ item.affectedStudentCount || 0 }} 人，平均尝试 {{ item.averageAttempts || 0 }} 次</span>
                      </p>
                      <p class="mt-1">
                        <span class="font-semibold text-[#1d1d1f]">建议：</span>{{ item.teachingAdvice }}
                      </p>
                      <p v-if="item.validation" class="mt-1 text-[#2563eb]">复测：{{ item.validation }}</p>
                    </div>
                  </div>
                </article>

                <article v-if="knowledgeSignalRows.length" class="rounded-[16px] border border-black/[0.06] bg-[#fbfdff] px-4 py-3">
                  <div class="text-xs font-semibold text-[#1d1d1f]">推断薄弱知识点</div>
                  <div class="mt-3 space-y-2">
                    <div v-for="item in knowledgeSignalRows" :key="item.knowledge" class="text-xs leading-5 text-[#4b5563]">
                      <span class="font-medium text-[#1d1d1f]">{{ item.knowledge }}</span>
                      <span class="ml-1 text-[#8a8a8f]">· {{ item.confidence || 'MEDIUM' }}</span>
                      <p class="mt-0.5">{{ item.teachingAdvice }}</p>
                    </div>
                  </div>
                </article>

                <article v-if="errorSignalRows.length" class="rounded-[16px] border border-black/[0.06] bg-[#fbfffc] px-4 py-3">
                  <div class="text-xs font-semibold text-[#1d1d1f]">高频错误类型</div>
                  <div class="mt-3 space-y-2">
                    <div v-for="item in errorSignalRows" :key="item.status" class="text-xs leading-5 text-[#4b5563]">
                      <span class="font-mono font-semibold text-[#1d1d1f]">{{ item.status }}</span>
                      <span class="ml-1 text-[#8a8a8f]">{{ item.studentCount || 0 }} 人 / {{ item.problemCount || 0 }} 题</span>
                      <p class="mt-0.5">{{ item.teachingAdvice }}</p>
                    </div>
                  </div>
                </article>

                <article v-if="dataQualityRows.length" class="rounded-[16px] border border-[#fde68a] bg-[#fffdf5] px-4 py-3">
                  <div class="text-xs font-semibold text-[#92400e]">数据可靠性提醒</div>
                  <div class="mt-3 space-y-2">
                    <div v-for="item in dataQualityRows" :key="item.type" class="text-xs leading-5 text-[#78350f]">
                      <span class="font-medium">{{ item.message }}</span>
                      <p class="mt-0.5 text-[#8a5a00]">{{ item.action }}</p>
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
                  class="h-8 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 text-xs font-medium text-[#1d4ed8]"
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

            <article v-if="advice" id="teaching-advice-markdown-root" class="overflow-hidden rounded-[24px] border border-[#bfdbfe] bg-gradient-to-br from-[#f8fbff] via-white to-[#fffaf5] p-4 shadow-[0_14px_36px_rgba(47,111,237,0.10)]">
              <button
                v-if="false"
                type="button"
                class="flex w-full flex-wrap items-center justify-between gap-3 border-none bg-gradient-to-r from-[#f8fbff] via-white to-[#f8fafc] px-5 py-4 text-left"
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
              <div v-if="reportExpanded">
                <div class="mb-3 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    class="rounded-full border border-[#dbeafe] bg-white/90 px-3 py-1 text-xs font-medium text-[#2f6fed] shadow-sm"
                    @click.stop="copyRawAdvice"
                  >
                    {{ rawAdviceCopied ? '已复制' : '复制 Markdown' }}
                  </button>
                </div>
                <div v-if="renderedAdviceSections.length" class="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <aside class="sticky top-4 self-start space-y-3 xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto xl:pr-1">
                    <div class="rounded-[20px] border border-[#bfdbfe] bg-gradient-to-br from-[#eef5ff] via-white to-[#fff7ed] px-4 py-4 shadow-[0_10px_24px_rgba(47,111,237,0.12)]">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <div class="text-sm font-semibold text-[#1d1d1f]">报告目录</div>
                          <p class="mt-1 text-xs leading-5 text-[#2563eb]">先看结论，再看怎么教，最后核对依据。</p>
                        </div>
                        <span class="rounded-full bg-[#2f6fed] px-2.5 py-1 text-[11px] font-semibold text-white">
                          当前 {{ activeMarkdownSectionIndex + 1 }}
                        </span>
                      </div>
                      <div class="mt-3 rounded-[14px] border border-[#bfdbfe] bg-white/85 px-3 py-2 text-xs leading-5 text-[#2563eb]">
                        <span class="font-semibold">推荐阅读：</span>结论 → 怎么教 → 找谁跟进 → 分层/课程调整 → 依据核对
                      </div>
                    </div>

                    <div class="relative space-y-2 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-[#dbeafe]">
                      <button
                        v-for="section in renderedAdviceSections"
                        :key="section.key"
                        type="button"
                        class="relative w-full rounded-[18px] border px-3 py-3 text-left transition-all"
                        :class="expandedMarkdownSectionKey === section.key ? `${section.tone} shadow-[0_10px_22px_rgba(47,111,237,0.14)] ring-2 ring-inset ring-[rgba(47,111,237,0.22)]` : 'border-black/[0.06] bg-white/90 hover:border-[#bfdbfe] hover:bg-[#fbfdff]'"
                        @click="toggleMarkdownSection(section.key)"
                      >
                        <div class="flex items-start gap-3">
                          <span class="z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm" :class="section.dotClass">
                            {{ section.icon }}
                          </span>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-start justify-between gap-2">
                              <div class="min-w-0">
                                <div class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f6fed]">
                                  Level 1 · {{ section.badge }}
                                </div>
                                <h4 class="mt-0.5 truncate text-sm font-semibold text-[#1d1d1f]">{{ section.title }}</h4>
                              </div>
                            </div>
                            <p class="mt-1 compact-line-clamp-2 text-[11px] leading-4 text-[#4b5563]">{{ section.hint }}</p>

                            <div v-if="section.children?.length" class="mt-3 space-y-1.5 border-l border-dashed border-[#c7d7fe] pl-3">
                              <div
                                v-for="child in visibleMarkdownChildren(section)"
                                :key="child.key"
                                class="flex min-w-0 items-center gap-2 rounded-[10px] px-2 py-1 text-[11px]"
                                :class="expandedMarkdownSectionKey === section.key ? 'bg-white/80 text-[#374151]' : 'bg-[#f8fafc] text-[#6e6e73]'"
                              >
                                <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-[#93c5fd]"></span>
                                <span class="shrink-0 text-[10px] text-[#8a8a8f]">L2</span>
                                <span class="truncate">{{ child.title }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </aside>

                  <section v-if="activeMarkdownSection" class="space-y-3">
                    <div class="rounded-[22px] border border-[#bfdbfe] bg-gradient-to-br from-white via-[#fbfdff] to-[#fff7ed] p-4 shadow-[0_10px_24px_rgba(47,111,237,0.08)]">
                      <div class="flex flex-wrap items-center gap-2 text-[11px] text-[#6e6e73]">
                        <span class="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[#2f6fed]">原文</span>
                        <span>›</span>
                        <span class="rounded-full bg-[#f8fafc] px-2.5 py-1">{{ activeMarkdownSection.title }}</span>
                      </div>
                      <div class="flex flex-wrap items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div class="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f6fed]">
                            Level 1 · {{ activeMarkdownSection.badge }}
                          </div>
                          <h4 class="mt-1 text-lg font-semibold text-[#1d1d1f]">{{ activeMarkdownSection.title }}</h4>
                          <p class="mt-1 text-xs leading-5 text-[#6e6e73]">{{ activeMarkdownSection.hint }}</p>
                        </div>
                        <div class="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            class="rounded-full border border-[#dbeafe] bg-white px-3 py-1 text-[11px] text-[#2f6fed]"
                            @click="scrollMarkdownToTop"
                          >
                            回到目录顶部
                          </button>
                        </div>
                      </div>
                      <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_160px]">
                        <p class="rounded-[14px] bg-[#f8fafc] px-3 py-2 text-xs leading-5 text-[#4b5563]">
                          <span class="font-semibold text-[#1d1d1f]">本节摘要：</span>{{ activeMarkdownSection.preview }}
                        </p>
                        <div class="rounded-[14px] bg-[#eef5ff] px-3 py-2 text-xs leading-5 text-[#2563eb]">
                          <span class="font-semibold">阅读目标：</span>{{ activeMarkdownSection.readingGoal }}
                        </div>
                      </div>
                    </div>

                    <div v-if="isStudentFollowSection(activeMarkdownSection) && focusStudentRows.length" class="space-y-3">
                      <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div
                          v-for="stat in focusStudentStats"
                          :key="stat.key"
                          class="rounded-[16px] border px-3 py-3"
                          :class="stat.tone"
                        >
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-semibold" :class="stat.textClass">{{ stat.title }}</span>
                            <span class="text-lg font-bold" :class="stat.textClass">{{ stat.count }}</span>
                          </div>
                          <p class="mt-1 text-[11px] leading-4 text-[#6e6e73]">{{ stat.hint }}</p>
                        </div>
                      </div>

                      <section
                        v-for="group in focusStudentGroups"
                        :key="group.key"
                        class="overflow-hidden rounded-[18px] border bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
                        :class="group.borderClass"
                      >
                        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3" :class="group.headerClass">
                          <div class="flex items-center gap-3">
                            <span class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" :class="group.dotClass">{{ group.short }}</span>
                            <div>
                              <h5 class="text-sm font-semibold text-[#1d1d1f]">{{ group.title }}</h5>
                              <p class="mt-0.5 text-xs leading-5 text-[#6e6e73]">{{ group.hint }}</p>
                            </div>
                          </div>
                          <span class="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold" :class="group.textClass">
                            {{ group.students.length }} 人
                          </span>
                        </div>

                        <div class="grid grid-cols-1 gap-3 p-3 xl:grid-cols-2">
                          <article
                            v-for="student in group.students"
                            :key="student.key"
                            class="rounded-[16px] border border-black/[0.06] bg-white px-4 py-3"
                          >
                            <div class="flex flex-wrap items-start justify-between gap-3">
                              <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2">
                                  <span class="rounded-full px-2.5 py-1 text-[11px] font-bold text-white" :class="student.dotClass">
                                    {{ student.priority }}
                                  </span>
                                  <h6 class="text-sm font-semibold text-[#1d1d1f]">
                                    {{ student.studentName || '未命名学生' }}
                                    <span class="font-normal text-[#6e6e73]">{{ student.studentNo ? `· ${student.studentNo}` : '' }}</span>
                                  </h6>
                                </div>
                                <p class="mt-2 text-xs leading-5 text-[#374151]">
                                  <span class="font-semibold text-[#1d1d1f]">问题判断：</span>{{ student.reason }}
                                </p>
                              </div>
                              <div class="shrink-0 rounded-[12px] bg-[#f8fafc] px-3 py-2 text-right">
                                <div class="text-[10px] text-[#8a8a8f]">风险分</div>
                                <div class="text-base font-bold" :class="student.levelClass">{{ student.riskScore || '-' }}</div>
                              </div>
                            </div>

                            <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div class="rounded-[12px] bg-[#f8fafc] px-3 py-2">
                                <div class="text-[11px] font-semibold text-[#6e6e73]">类型</div>
                                <p class="mt-1 text-xs font-semibold text-[#1d1d1f]">{{ student.typeLabel }}</p>
                              </div>
                              <div class="rounded-[12px] bg-[#f8fafc] px-3 py-2">
                                <div class="text-[11px] font-semibold text-[#6e6e73]">数据证据</div>
                                <p class="mt-1 text-xs leading-5 text-[#1d1d1f]">{{ student.evidenceSummary }}</p>
                              </div>
                            </div>

                            <div class="mt-3 rounded-[14px] border border-[#dbeafe] bg-[#fbfdff] px-3 py-2">
                              <div class="text-[11px] font-semibold text-[#2563eb]">老师下一步直接做</div>
                              <p class="mt-1 text-xs leading-6 text-[#1d1d1f]">{{ student.suggestion }}</p>
                            </div>

                            <div class="mt-2 rounded-[14px] bg-[#f8fafc] px-3 py-2">
                              <div class="text-[11px] font-semibold text-[#6e6e73]">验收方式</div>
                              <p class="mt-1 text-xs leading-5 text-[#374151]">{{ student.validation }}</p>
                            </div>
                          </article>
                        </div>
                      </section>
                    </div>

                    <div v-else-if="activeMarkdownSection.children?.length" class="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      <article
                        v-for="child in activeMarkdownSection.children"
                        :key="child.key"
                        class="overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
                      >
                        <div class="flex items-center justify-between gap-3 border-b border-black/[0.05] bg-[#fbfdff] px-3 py-2">
                          <div class="min-w-0">
                            <div class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f6fed]">Level 2 · {{ child.badge }}</div>
                            <div class="mt-0.5 text-xs font-semibold text-[#1d1d1f]">{{ child.title }}</div>
                            <div class="mt-0.5 text-[11px] leading-4 text-[#8a8a8f]">{{ child.hint }}</div>
                          </div>
                        </div>
                        <div class="teaching-advice-markdown markdown-body max-h-[300px] overflow-y-auto px-3 py-3 pr-2 text-sm leading-7 text-[#1d1d1f]" v-html="child.html"></div>
                      </article>
                    </div>

                    <div
                      v-else
                      class="teaching-advice-markdown markdown-body max-h-[460px] overflow-y-auto rounded-[18px] border border-black/[0.06] bg-white px-4 py-4 text-sm leading-7 text-[#1d1d1f]"
                      v-html="activeMarkdownSection.html"
                    ></div>
                  </section>
                </div>
                <div
                  v-else
                  class="teaching-advice-markdown markdown-body rounded-[18px] border border-black/[0.06] bg-white px-4 py-4 text-sm leading-7 text-[#1d1d1f]"
                  v-html="renderedAdviceMarkdown"
                ></div>
              </div>
            </article>

            <div v-if="advice" class="rounded-[18px] border border-black/[0.07] bg-[#f8fafc]">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 border-none bg-transparent px-4 py-4 text-left"
                @click="evidenceExpanded = !evidenceExpanded"
              >
                <span class="text-sm font-semibold text-[#1d1d1f]">
                  {{ evidenceExpanded ? '▾' : '▸' }} 查看 AI 判断依据：数据覆盖、证据编号、原始指标
                </span>
                <span class="shrink-0 text-xs text-[#8a8a8f]">默认折叠，避免堆数据</span>
              </button>
              <div v-if="evidenceExpanded" class="border-t border-black/[0.06] bg-white px-4 py-4">
                <div class="flex flex-wrap items-center gap-3 text-xs text-[#6e6e73]">
                  <span class="font-medium text-[#1d1d1f]">数据覆盖</span>
                  <span>主要数据 {{ dataCoverage.primaryRows || 0 }} 组</span>
                  <span>辅助数据 {{ dataCoverage.secondaryRows || 0 }} 组</span>
                  <span class="rounded-full px-2 py-1 font-medium" :class="dataCoverage.status === 'AVAILABLE' ? 'bg-[#e9f7ef] text-[#18794e]' : 'bg-[#fff1e8] text-[#a14b12]'">
                    {{ dataCoverage.status === 'AVAILABLE' ? '可分析' : '数据不足' }}
                  </span>
                </div>
                <div v-if="scopeWarnings.length" class="mt-4 space-y-2">
                  <div v-for="warning in scopeWarnings" :key="warning" class="rounded-[8px] bg-[#fff8e1] px-3 py-2 text-xs leading-5 text-[#8a5a00]">
                    {{ warning }}
                  </div>
                </div>
                <div v-if="evidenceRows.length" class="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div v-for="item in evidenceRows" :key="item.evidenceId" class="rounded-[12px] border border-black/[0.07] p-4">
                    <div class="flex items-start justify-between gap-3">
                      <span class="text-sm font-medium text-[#1d1d1f]">{{ item.label }}</span>
                      <span class="shrink-0 rounded bg-[#f1f3f5] px-2 py-1 font-mono text-[11px] text-[#5f6368]">{{ item.evidenceId }}</span>
                    </div>
                    <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      <template v-for="field in displayEvidenceFields(item.value)" :key="field.key">
                        <div class="min-w-0">
                          <dt class="truncate text-[11px] text-[#8a8a8f]">{{ field.label }}</dt>
                          <dd class="mt-0.5 truncate text-xs font-medium text-[#374151]" :title="String(field.value)">{{ field.value }}</dd>
                        </div>
                      </template>
                    </dl>
                  </div>
                </div>
                <p v-else class="mt-4 text-sm text-[#8a8a8f]">当前范围暂无可引用指标。</p>
              </div>
            </div>
          </div>

          <aside class="min-w-0 space-y-5">
            <section class="rounded-[20px] border border-black/[0.07] bg-white p-5">
              <h3 class="text-base font-semibold text-[#1d1d1f]">课后重点找谁</h3>
              <p class="mt-1 text-xs leading-5 text-[#6e6e73]">只列需要老师介入的学生，并说明为什么、怎么跟进。</p>
              <div v-if="focusStudentRows.length" class="mt-4 space-y-3">
                <article
                  v-for="student in focusStudentRows"
                  :key="student.key"
                  class="rounded-[16px] border px-4 py-3"
                  :class="student.tone"
                >
                  <div class="flex items-start gap-3">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" :class="student.dotClass">{{ student.tag }}</span>
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <div class="truncate text-sm font-semibold text-[#1d1d1f]">
                          {{ student.studentNo || '未知学号' }}
                          <span v-if="student.studentName" class="font-normal text-[#6e6e73]">· {{ student.studentName }}</span>
                        </div>
                        <span class="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold" :class="student.levelClass">
                          {{ student.priority }} · {{ student.riskLevel }}
                        </span>
                      </div>
                      <p class="mt-1 compact-line-clamp-2 text-xs leading-5 text-[#6e6e73]">{{ student.reason }}</p>
                    </div>
                  </div>
                  <div v-if="student.riskSummary" class="mt-2 rounded-[10px] bg-white/70 px-3 py-1.5 text-[11px] leading-5 text-[#6e6e73]">
                    <span class="font-semibold text-[#1d1d1f]">分级依据：</span>{{ student.riskSummary }}
                  </div>
                  <div class="mt-3 rounded-[12px] bg-white/80 px-3 py-2 text-xs leading-5 text-[#374151]">
                    <span class="font-semibold text-[#1d1d1f]">下一步：</span>{{ student.suggestion }}
                  </div>
                  <details v-if="student.validation" class="mt-2 text-xs leading-5 text-[#374151]">
                    <summary class="cursor-pointer select-none text-[#2f6fed]">查看验收方式</summary>
                    <p class="mt-1">{{ student.validation }}</p>
                  </details>
                  <p v-if="student.evidenceRefs?.length" class="mt-2 font-mono text-[11px] text-[#8a8a8f]">证据：{{ joinRefs(student.evidenceRefs) }}</p>
                </article>
              </div>
              <p v-else class="mt-4 rounded-[14px] bg-[#f8fafc] px-4 py-6 text-center text-sm text-[#8a8a8f]">
                生成报告后，这里会展示 AI 判断出的重点跟进学生和具体辅导建议。
              </p>
            </section>

            <section class="rounded-[20px] border border-black/[0.07] bg-white p-5">
              <h3 class="text-base font-semibold text-[#1d1d1f]">备课提醒</h3>
              <p class="mt-1 text-xs leading-5 text-[#6e6e73]">把建议转成备课动作：讲什么、补什么、课后怎么追。</p>
              <div v-if="teacherFocusRows.length" class="mt-4 space-y-3">
                <div v-for="item in teacherFocusRows" :key="item.key" class="rounded-[16px] border border-black/[0.06] bg-[#f8fafc] px-4 py-3">
                  <div class="text-xs font-semibold text-[#1d1d1f]">{{ item.title }}</div>
                  <p class="mt-2 compact-line-clamp-2 text-xs leading-5 text-[#4b5563]">{{ item.instruction }}</p>
                  <p class="mt-2 text-[11px] leading-5 text-[#6e6e73]">
                    {{ item.when }} · {{ item.target }}
                  </p>
                </div>
              </div>
              <p v-else class="mt-4 rounded-[14px] bg-[#f8fafc] px-4 py-6 text-center text-sm text-[#8a8a8f]">
                生成后会从 AI 报告里提炼“讲什么、补什么、怎么跟进”。
              </p>
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
              <div v-if="historyExpanded" class="border-t border-black/[0.06] px-5 py-3">
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
                      <div class="mt-1 text-xs text-[#8a8a8f]">{{ report.promptVersion }} · {{ report.model || '默认模型' }}</div>
                    </div>
                    <span class="shrink-0 text-xs text-[#6e6e73]">{{ formatTime(report.createdAt) }}</span>
                  </button>
                </div>
                <p v-else class="py-5 text-sm text-[#8a8a8f]">当前班级暂无历史建议。</p>
              </div>
            </section>
          </aside>
        </div>
      </template>

      <div v-else class="rounded-[18px] border border-dashed border-black/[0.12] bg-[#fafafa] py-10 text-center text-sm text-[#8a8a8f]">
        {{ scopeLevel === 'EXPERIMENT' ? '请先选择一个实验。' : '当前班级暂时无法形成分析范围。' }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import { renderSafeMarkdown } from '@/utils/safeHtml'
import {
  generateTeachingAdvice,
  getTeachingAdviceContext,
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
const evidenceExpanded = ref(false)
const historyExpanded = ref(false)
let contextRequestId = 0

const unwrap = response => response?.data ?? response
const activeData = computed(() => activeReport.value || contextData.value)
const scope = computed(() => activeData.value?.scope || {})
const metrics = computed(() => activeData.value?.metrics || {})
const advice = computed(() => activeReport.value?.advice || null)
const teachingConclusion = computed(() => advice.value?.teachingConclusion || {})
const teachingContext = computed(() => metrics.value.teachingContext || {})
const nextTeachingPlan = computed(() => advice.value?.nextTeachingPlan || {})
const evidenceRows = computed(() => Array.isArray(metrics.value.evidence) ? metrics.value.evidence : [])
const dataCoverage = computed(() => metrics.value.dataCoverage || {})
const learningDiagnosis = computed(() => metrics.value.learningDiagnosis || {})
const problemErrorPointRows = computed(() => Array.isArray(learningDiagnosis.value.problemErrorPoints)
  ? learningDiagnosis.value.problemErrorPoints.slice(0, 4)
  : [])
const knowledgeSignalRows = computed(() => Array.isArray(learningDiagnosis.value.inferredKnowledgeSignals)
  ? learningDiagnosis.value.inferredKnowledgeSignals.slice(0, 3)
  : [])
const errorSignalRows = computed(() => Array.isArray(learningDiagnosis.value.errorTypeSignals)
  ? learningDiagnosis.value.errorTypeSignals.filter(item => item.status !== 'ACCEPTED').slice(0, 3)
  : [])
const dataQualityRows = computed(() => Array.isArray(learningDiagnosis.value.dataQualityIssues)
  ? learningDiagnosis.value.dataQualityIssues.slice(0, 2)
  : [])
const diagnosisVisible = computed(() => !!learningDiagnosis.value.conclusion || problemErrorPointRows.value.length || knowledgeSignalRows.value.length || errorSignalRows.value.length || dataQualityRows.value.length)
const diagnosisReliability = computed(() => {
  const value = String(learningDiagnosis.value.reliability || 'LOW').toUpperCase()
  if (value === 'HIGH') return { label: '数据可信度：高', className: 'bg-[#e9f7ef] text-[#18794e]' }
  if (value === 'MEDIUM') return { label: '数据可信度：中', className: 'bg-[#fff7ed] text-[#c2410c]' }
  return { label: '数据可信度：低', className: 'bg-[#f1f3f5] text-[#6b7280]' }
})
const scopeWarnings = computed(() => Array.isArray(scope.value.warnings) ? scope.value.warnings : [])
const canGenerate = computed(() => !!props.classId && (scopeLevel.value !== 'EXPERIMENT' || !!experimentId.value))
const disabledReason = computed(() => {
  if (!props.classId) return '当前班级信息缺失，无法生成'
  if (scopeLevel.value === 'EXPERIMENT' && !experimentId.value) return '请选择实验后生成'
  return ''
})
const generateButtonDisabled = computed(() => generating.value || !!disabledReason.value)
const generateButtonLabel = computed(() => {
  if (generating.value) return 'AI 分析中...'
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
  const source = aiStudents.length ? aiStudents : metricStudents
  return source.slice(0, 6).map((item, index) => {
    const merged = mergeFocusStudent(item)
    const reason = merged.reason || merged.suggestionHint || '需要结合实验表现进一步观察'
    const risk = riskTone(reason, merged)
    const suggestion = merged.teacherAction || merged.suggestion || merged.suggestionHint || ''
    const validation = merged.validation || ''
    const priority = merged.followUpPriority || risk.priority || 'P3'
    return {
      key: `${index}-${merged.studentNo || merged.studentName || 'student'}`,
      ...risk,
      studentNo: merged.studentNo || '',
      studentName: merged.studentName || '',
      reason: merged.problem || reason,
      riskLevel: merged.riskLevel || risk.riskLevel || 'LOW',
      riskScore: merged.riskScore ?? '',
      priority,
      tag: priority,
      typeLabel: focusTypeLabel(merged, reason),
      evidenceSummary: formatStudentEvidence(merged),
      riskSummary: merged.riskSummary || (Array.isArray(merged.riskReasons) ? merged.riskReasons.join('；') : ''),
      suggestion: isGenericStudentSuggestion(suggestion) ? specificStudentSuggestion(merged, reason) : suggestion,
      validation: isGenericStudentSuggestion(validation) ? specificStudentValidation(merged, reason) : (validation || specificStudentValidation(merged, reason)),
      evidenceRefs: Array.isArray(merged.evidenceRefs) ? merged.evidenceRefs : []
    }
  })
})

const contextFocusStudents = computed(() => {
  if (Array.isArray(metrics.value.focusStudents) && metrics.value.focusStudents.length) return metrics.value.focusStudents
  if (Array.isArray(teachingContext.value.studentFollowUpCandidates) && teachingContext.value.studentFollowUpCandidates.length) {
    return teachingContext.value.studentFollowUpCandidates
  }
  return []
})

const focusStudentStats = computed(() => {
  const rows = focusStudentRows.value
  return [
    {
      key: 'P1',
      title: 'P1 立即找',
      count: rows.filter(item => item.priority === 'P1').length,
      hint: '高风险，建议下次课前先处理',
      tone: 'border-[#fecaca] bg-[#fff7f7]',
      textClass: 'text-[#b42318]'
    },
    {
      key: 'P2',
      title: 'P2 本周跟',
      count: rows.filter(item => item.priority === 'P2').length,
      hint: '中风险，安排短周期纠偏',
      tone: 'border-[#fed7aa] bg-[#fffaf5]',
      textClass: 'text-[#c2410c]'
    },
    {
      key: 'P3',
      title: 'P3 观察复测',
      count: rows.filter(item => item.priority === 'P3').length,
      hint: '低风险，用小题或补交结果复核',
      tone: 'border-[#bfdbfe] bg-[#f8fbff]',
      textClass: 'text-[#1d4ed8]'
    }
  ]
})

const focusStudentGroups = computed(() => {
  const priorities = ['P1', 'P2', 'P3']
  return priorities
    .map(priority => {
      const meta = focusPriorityMeta(priority)
      return {
        key: priority,
        students: focusStudentRows.value.filter(item => item.priority === priority),
        ...meta
      }
    })
    .filter(group => group.students.length)
})

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

const fieldLabels = {
  className: '班级', experimentCount: '实验数', studentCount: '学生数', completedCount: '完成人数',
  completionRate: '完成率(%)', averageScore: '平均分', problemNo: '题号', title: '题目',
  acceptedCount: '通过人数', acceptanceRate: '通过率(%)', averageAttempts: '平均尝试次数',
  name: '实验', termName: '学期', classCount: '班级数', total: '学生总数', highRisk: '重点帮扶层',
  strong: '优秀层', regular: '常规层', excellent: '优秀层', middle: '中等层', risk: '风险层',
  incomplete: '未完成', studentNo: '学号', studentName: '姓名', reason: '原因'
}
const hiddenEvidenceFields = new Set(['evidenceId', 'classId', 'experimentId', 'templateId', 'termId'])

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
  return String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
    .replace(/[#>*_`|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 96)
}

function markdownSectionMeta(title, index) {
  const value = String(title || '')
  if (value.includes('核心') || value.includes('结论')) {
    return {
      icon: '结',
      badge: '先读',
      hint: '一句话判断主要教学问题和优先级',
      readingGoal: '看清主要问题',
      tone: 'border-[#dbeafe] bg-[#fbfdff]',
      dotClass: 'bg-[#2f6fed]'
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
    tone: 'border-black/[0.06] bg-white',
    dotClass: 'bg-[#6b7280]'
  }
}

function visibleMarkdownChildren(section) {
  const children = Array.isArray(section?.children) ? section.children : []
  if (expandedMarkdownSectionKey.value === section?.key) return children.slice(0, 5)
  return children.slice(0, 3)
}

function toggleMarkdownSection(key) {
  expandedMarkdownSectionKey.value = key
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
    'problemStateCount'
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
  return merged
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
      headerClass: 'bg-gradient-to-r from-[#fff1f2] to-white',
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
      headerClass: 'bg-gradient-to-r from-[#fff7ed] to-white',
      dotClass: 'bg-[#f97316]',
      textClass: 'text-[#c2410c]'
    }
  }
  return {
    short: '察',
    title: 'P3｜观察复测即可',
    hint: '暂不扩大干预，用一次同知识点小题或补交结果确认是否稳定。',
    borderClass: 'border-[#bfdbfe]',
    headerClass: 'bg-gradient-to-r from-[#eff6ff] to-white',
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
  if (text.includes('低分') || toNumber(item.score) < 60 || toNumber(item.averageScore) < 60) {
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
  if (text.includes('低分') || text.includes('LOW_SCORE') || toNumber(item.score) < 70 || toNumber(item.averageScore) < 70) {
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
  if (text.includes('低分') || text.includes('LOW_SCORE') || toNumber(item.score) < 70 || toNumber(item.averageScore) < 70) {
    return '重新提交或完成同类短练后，能用一句话说明原错误和修正依据。'
  }
  return '后续一次同类实验不再出现相同错误类型，并主动写出自查点。'
}

function quickActionTone(index) {
  return [
    'border-[#dce8ff] bg-[#fbfdff]',
    'border-[#d7f1e1] bg-[#fbfffc]',
    'border-[#fae7c4] bg-[#fffdf8]'
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

function knowledgeSourceLabel(item) {
  return item?.knowledgeSource === 'PTA_KNOWLEDGE_LEAF' ? '题目知识点' : '推断知识点'
}

function jumpToStudentLayer() {
  document
    .getElementById('student-layer-analysis')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollMarkdownToTop() {
  document
    .getElementById('teaching-advice-markdown-root')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

function displayEvidenceFields(value) {
  if (!value || typeof value !== 'object') return []
  return Object.entries(value)
    .filter(([key, fieldValue]) => !hiddenEvidenceFields.has(key) && fieldValue !== null && fieldValue !== undefined && typeof fieldValue !== 'object')
    .slice(0, 8)
    .map(([key, fieldValue]) => ({ key, label: fieldLabels[key] || key, value: fieldValue === '' ? '-' : fieldValue }))
}

function scopeLabel(value) {
  return scopeOptions.find(item => item.value === value)?.label || value
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

async function generateReport() {
  if (!canGenerate.value || generating.value) return
  generating.value = true
  errorMessage.value = ''
  try {
    activeReport.value = unwrap(await generateTeachingAdvice(requestPayload()))
    await loadReports()
    uiMessage.success('教学建议已生成并保存')
  } catch (error) {
    errorMessage.value = error?.message || '教学建议生成失败'
    uiMessage.warning(errorMessage.value)
    logger.error('生成可信教学建议失败:', error)
  } finally {
    generating.value = false
  }
}

function selectReport(report) {
  activeReport.value = report
}

watch(() => props.experiments, rows => {
  if (experimentId.value && !rows.some(item => String(item.id) === String(experimentId.value))) experimentId.value = ''
}, { deep: true })
watch([() => props.classId, scopeLevel, experimentId, includeHistory], loadContext, { immediate: true })
watch(() => props.classId, loadReports, { immediate: true })
watch(renderedAdviceSections, sections => {
  if (!sections.length) {
    expandedMarkdownSectionKey.value = ''
    return
  }
  if (!sections.some(item => item.key === expandedMarkdownSectionKey.value)) {
    expandedMarkdownSectionKey.value = sections[0].key
  }
}, { immediate: true })
</script>

<style scoped>
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
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.85);
  padding: 8px 10px;
  color: #374151;
}

.teaching-advice-markdown :deep(li::marker) {
  color: #2f6fed;
  font-weight: 700;
}

.teaching-advice-markdown :deep(blockquote) {
  margin: 12px 0;
  border-left: 4px solid var(--app-primary);
  border-radius: 0 12px 12px 0;
  background: #eef5ff;
  padding: 12px 14px;
  color: #4b5563;
}

.teaching-advice-markdown :deep(table) {
  width: 100%;
  margin: 12px 0;
  border-collapse: collapse;
  font-size: 13px;
}

.teaching-advice-markdown :deep(th),
.teaching-advice-markdown :deep(td) {
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 8px 10px;
  text-align: left;
}

.teaching-advice-markdown :deep(th) {
  background: #f8fafc;
}
</style>
