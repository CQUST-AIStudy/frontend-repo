<template>
  <div ref="analysisContainerRef" class="learning-analysis-container">
    <UiPageHeader class="my-page-header [padding:20px]" title="个性画像" description="基于您的PTA平台提交数据的AI深度分析" />

    <loading-state :loading="loading">
      <div class="analysis-content [display:flex] [flex-direction:column] [gap:16px] [padding:0] [background-color:var(--app-bg)] [border-radius:12px] [line-height:1.6]">
        <!-- 总体概览 -->
        <ui-row :gutter="20" class="overview-row">
          <ui-col :span="6" v-for="item in overviewCards" :key="item.label">
            <ui-card shadow="hover" class="stat-card [border-radius:16px] [border:1px_solid_var(--app-border)] [box-shadow:none] hover:[box-shadow:0_4px_12px_rgba(61,_53,_41,_0.08)] [&_.ui-card__body]:[display:flex] [&_.ui-card__body]:[align-items:center] [&_.ui-card__body]:[gap:14px] [&_.ui-card__body]:[padding:18px] [background:var(--app-surface)] [flex:1] [min-width:180px]">
              <div class="stat-icon [width:44px] [height:44px] [border-radius:12px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]" :class="overviewIconClass(item)">
                <ui-icon :size="22" color="#fff"><component :is="item.icon" /></ui-icon>
              </div>
              <div class="stat-info [flex:1]">
                <div class="stat-value [font-size:22px] [font-weight:600] [color:#202124] [font-size:24px] [font-weight:bold] [color:#d18a61] [font-size:28px] [font-weight:700] [margin-bottom:5px]" :class="overviewValueClass(item)">{{ item.value }}</div>
                <div class="stat-label [font-size:13px] [color:#5f6368] [margin-top:2px] [font-size:12px] [margin-top:10px] [color:#606266] [margin-top:4px]">{{ item.label }}</div>
              </div>
            </ui-card>
          </ui-col>
        </ui-row>

        <!-- 快捷入口 -->
        <div class="quick-actions [display:flex] [gap:12px] [flex-wrap:wrap] [margin-bottom:4px]">
          <a href="https://pintia.cn" target="_blank" rel="noopener noreferrer"
             class="quick-action-btn [display:inline-flex] [align-items:center] [gap:8px] [padding:10px_20px] [border-radius:10px] [font-size:14px] [font-weight:500] [text-decoration:none] [transition:all_0.2s] [background:#e8f0fe] [color:#1a73e8] [border:1px_solid_#c2d7f6] hover:[background:#d2e3fc] hover:[border-color:#1a73e8]">
            <span style="font-size:18px">🚀</span>
            <span>PTA 平台推题</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7m10 0v10"/></svg>
          </a>
          <router-link to="/student/leetcode-search"
             class="quick-action-btn [display:inline-flex] [align-items:center] [gap:8px] [padding:10px_20px] [border-radius:10px] [font-size:14px] [font-weight:500] [text-decoration:none] [transition:all_0.2s] [background:#e6f4ea] [color:#1e8e3e] [border:1px_solid_#ceead6] hover:[background:#ceead6] hover:[border-color:#1e8e3e]">
            <span style="font-size:18px">💡</span>
            <span>薄弱强化题集</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7m10 0v10"/></svg>
          </router-link>
          <router-link to="/student/leetcode-search"
             class="quick-action-btn [display:inline-flex] [align-items:center] [gap:8px] [padding:10px_20px] [border-radius:10px] [font-size:14px] [font-weight:500] [text-decoration:none] [transition:all_0.2s] [background:#fef7e0] [color:#e37400] [border:1px_solid_#fdecc8] hover:[background:#fdecc8] hover:[border-color:#e37400]">
            <span style="font-size:18px">📝</span>
            <span>薄弱强化题集</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7m10 0v10"/></svg>
          </router-link>
        </div>

        <!-- 雷达图+ 趋势 -->
        <ui-row :gutter="20" class="chart-row [margin:0]">
          <ui-col :span="12">
            <ui-card class="chart-card [height:380px] [border-radius:16px] [border:1px_solid_var(--app-border)] [box-shadow:none]">
              <template #header><div class="card-header [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [font-size:15px] [font-weight:500] [color:var(--app-text)]"><span>知识掌握雷达图</span><span class="[font-size:11px] [font-weight:400] [color:var(--app-text-soft)]">能力维度固定 · 分值按最新提交计算</span></div></template>
              <div class="chart-container [height:292px] [width:100%] [position:relative]"><div ref="radarChartRef" class="chart [width:100%] [height:100%]"></div></div>
            </ui-card>
          </ui-col>
          <ui-col :span="12">
            <ui-card class="chart-card [height:380px] [border-radius:16px] [border:1px_solid_var(--app-border)] [box-shadow:none]">
              <template #header><div class="card-header [display:flex] [align-items:center] [font-size:15px] [font-weight:500] [color:var(--app-text)]"><span>各实验掌握度趋势</span></div></template>
              <div class="chart-container [height:292px] [width:100%] [position:relative]"><div ref="trendChartRef" class="chart [width:100%] [height:100%]"></div></div>
            </ui-card>
          </ui-col>
        </ui-row>

        <!-- 知识维度学习投入 + 提交效率分析 -->
        <ui-row :gutter="20" class="chart-row [margin:0]">
          <ui-col :span="12">
            <ui-card class="chart-card [height:380px] [border-radius:16px] [border:1px_solid_var(--app-border)] [box-shadow:none]">
              <template #header><div class="card-header [display:flex] [align-items:center] [font-size:15px] [font-weight:500] [color:var(--app-text)]"><span>知识维度学习投入占比</span></div></template>
              <div class="chart-container [height:292px] [width:100%] [position:relative]"><div ref="effortChartRef" class="chart [width:100%] [height:100%]"></div></div>
            </ui-card>
          </ui-col>
          <ui-col :span="12">
            <ui-card class="chart-card [height:380px] [border-radius:16px] [border:1px_solid_var(--app-border)] [box-shadow:none]">
              <template #header><div class="card-header [display:flex] [align-items:center] [font-size:15px] [font-weight:500] [color:var(--app-text)]"><span>提交效率分析</span></div></template>
              <div class="chart-container [height:292px] [width:100%] [position:relative]"><div ref="efficiencyChartRef" class="chart [width:100%] [height:100%]"></div></div>
            </ui-card>
          </ui-col>
        </ui-row>

        <!-- 班级对比分析 -->
        <ui-card class="chart-card [min-height:400px] [border:1px_solid_var(--app-border)]" v-if="classData && classData.experiments?.length">
          <template #header>
            <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [gap:12px]">
              <span><LucideIcon name="bar-chart" :size="18" class="mr-2" /> 班级对比分析</span>
              <div class="class-summary-chips [display:flex] [gap:8px]" v-if="classData.summary">
                <span class="summary-chip [font-size:12px] [padding:3px_10px] [border-radius:100px] [font-weight:500] [&.positive]:[background:#e6f4ea] [&.positive]:[color:#1e8e3e] [&.negative]:[background:#fce8e6] [&.negative]:[color:#d93025] [&.neutral]:[background:#f1f3f4] [&.neutral]:[color:#5f6368] [min-width:min(280px,_100%)] [display:inline-flex] [align-items:center] [gap:8px] [padding:12px_14px] [border-radius:16px] [background:rgba(244,_248,_253,_0.92)] [border:1px_solid_#e3ebf5] [color:#34475d] [line-height:1.6] [word-break:break-word]" :class="avgDiffClass">
                  {{ avgDiffText }}
                </span>
                <span class="summary-chip neutral [font-size:12px] [padding:3px_10px] [border-radius:100px] [font-weight:500] [&.positive]:[background:#e6f4ea] [&.positive]:[color:#1e8e3e] [&.negative]:[background:#fce8e6] [&.negative]:[color:#d93025] [&.neutral]:[background:#f1f3f4] [&.neutral]:[color:#5f6368] [min-width:min(280px,_100%)] [display:inline-flex] [align-items:center] [gap:8px] [padding:12px_14px] [border-radius:16px] [background:rgba(244,_248,_253,_0.92)] [border:1px_solid_#e3ebf5] [color:#34475d] [line-height:1.6] [word-break:break-word]">全{{ classData.summary.experimentCount }} 个实验</span>
              </div>
            </div>
          </template>
          <div class="class-compare-body">
            <!-- 趋势对比图 我的分vs 班级均分 -->
            <div ref="classCompareChartRef" class="[height:300px]"></div>
            <!-- 每个实验的百分位指示 -->
            <div class="percentile-row [display:flex] [flex-direction:column] [gap:6px] [margin-top:12px] [padding:0_4px]">
              <div class="pct-item [display:flex] [align-items:center] [gap:10px]" v-for="exp in classData.experiments" :key="exp.experimentId">
                <div class="pct-name [width:90px] [font-size:11px] [color:#5f6368] [text-align:right] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [flex-shrink:0]" :title="exp.name">{{ shortName(exp.name) }}</div>
                <div class="pct-bar-wrap [flex:1] [height:18px] [background:#f1f3f4] [border-radius:9px] [position:relative] [overflow:hidden]">
                  <div class="pct-bar h-full min-w-0.5 w-[var(--progress-width)] rounded-[9px] transition-[width] duration-[600ms] ease-[ease]" :class="pctColorClass(exp.percentile)" :style="progressWidthStyle(exp.percentile)"></div>
                  <span class="pct-label [position:absolute] [right:8px] [top:50%] [transform:translateY(-50%)] [font-size:10px] [font-weight:500] [color:#202124]">超过{{ exp.percentile }}%</span>
                </div>
              </div>
            </div>
          </div>
        </ui-card>

        <!-- AI智能个性画像 -->
        <ui-alert
          v-else-if="classCompareUnavailableReason"
          class="class-compare-alert"
          type="warning"
          :closable="false"
          :title="classCompareUnavailableReason"
          show-icon
        />

        <ui-card class="ai-profile-card">
          <template #header>
            <div class="[display:flex] [align-items:center] [justify-content:space-between] [gap:12px]">
              <div class="[display:flex] [align-items:center] [gap:12px]">
                <div class="[width:40px] [height:40px] [border-radius:12px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]" style="background: var(--app-primary-soft)">
                  <LucideIcon name="sparkles" :size="20" style="color: var(--app-primary)" />
                </div>
                <div>
                  <div class="[font-size:17px] [font-weight:600] [color:var(--app-text)]">AI 智能个性画像</div>
                  <div class="[font-size:11px] [color:var(--app-text-soft)] [margin-top:2px]">把分散的学习数据，整理成一眼能看懂的判断</div>
                </div>
              </div>
              <ui-tag type="success" effect="dark">基于真实数据</ui-tag>
            </div>
          </template>

          <div class="[display:flex] [flex-direction:column] [gap:16px]">
            <!-- 一句话画像 -->
            <div class="[display:flex] [align-items:center] [gap:16px] [padding:16px_20px] [border-radius:14px]" style="background: var(--app-primary-soft); border-left: 4px solid var(--app-primary)">
              <div class="[flex:1] [min-width:0]">
                <div class="[font-size:11px] [font-weight:600] [margin-bottom:6px]" style="color: var(--app-primary-strong)">一句话画像</div>
                <div class="[font-size:18px] [font-weight:700] [color:var(--app-text)] [line-height:1.4]">{{ portraitHeadline }}</div>
                <div v-if="portraitSubline" class="[font-size:12px] [color:var(--app-text-secondary)] [margin-top:4px]">{{ portraitSubline }}</div>
              </div>
            </div>

            <!-- 三列：学习特征 / 能力水平 / 提升方向 -->
            <div class="ai-profile-grid [display:grid] [grid-template-columns:1fr_1.3fr_1.1fr] [gap:16px]">

              <!-- 左：学习特征 -->
              <div class="[padding:16px] [border-radius:14px] [border:1px_solid_var(--app-border)]" style="background: var(--app-surface-muted)" v-if="profileData.patterns?.length">
                <div class="[display:flex] [align-items:center] [gap:8px] [margin-bottom:14px]">
                  <LucideIcon name="tags" :size="16" style="color: var(--app-primary)" />
                  <span class="[font-size:14px] [font-weight:600] [color:var(--app-text)]">学习特征</span>
                </div>
                <div class="[display:flex] [flex-direction:column] [gap:10px]">
                  <div v-for="p in profileData.patterns" :key="p.tag"
                    class="[display:flex] [align-items:flex-start] [gap:10px] [padding:10px_12px] [border-radius:10px] [border:1px_solid_var(--app-border)]"
                    :style="traitBgStyle(p.tag)">
                    <div class="[width:28px] [height:28px] [border-radius:50%] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]"
                         :style="{ background: traitColor(p.tag) }">
                      <LucideIcon :name="patternEmoji(p.tag)" :size="14" style="color: #fff" />
                    </div>
                    <div class="[flex:1] [min-width:0]">
                      <div class="[font-size:13px] [font-weight:600] [color:var(--app-text)]">{{ p.tag }}</div>
                      <div class="[font-size:11px] [color:var(--app-text-secondary)] [margin-top:2px]">{{ p.description }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 中：各维度能力水平 -->
              <div class="[padding:16px] [border-radius:14px] [border:1px_solid_var(--app-border)]" v-if="profileData.skillTree?.length">
                <div class="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:14px]">
                  <div class="[display:flex] [align-items:center] [gap:8px]">
                    <LucideIcon name="bar-chart" :size="16" style="color: var(--app-success)" />
                    <span class="[font-size:14px] [font-weight:600] [color:var(--app-text)]">各维度能力水平</span>
                  </div>
                  <span class="[font-size:11px] [color:var(--app-text-soft)]">平均 {{ avgMastery }} 分</span>
                </div>
                <div class="[display:flex] [flex-direction:column] [gap:12px]">
                  <div v-for="dim in profileData.skillTree" :key="dim.dimension" class="[display:flex] [align-items:center] [gap:10px]">
                    <span class="[font-size:12px] [font-weight:500] [color:var(--app-text)] [width:68px] [flex-shrink:0] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]" :title="dim.dimension">{{ dim.dimension }}</span>
                    <div class="[flex:1] [min-width:0] [height:8px] [border-radius:4px] [overflow:hidden]" style="background: #ece4d8">
                      <div class="[height:100%] [border-radius:4px] [transition:width_.6s_ease]"
                           :style="{ width: Math.min(100, Math.round(dim.avgMastery)) + '%', background: masteryColor(dim.avgMastery) }"></div>
                    </div>
                    <span class="[font-size:13px] [font-weight:700] [width:30px] [text-align:right] [flex-shrink:0]" :style="{ color: masteryColor(dim.avgMastery) }">{{ Math.round(dim.avgMastery) }}</span>
                    <span class="[font-size:10px] [font-weight:600] [width:56px] [text-align:right] [flex-shrink:0]" :style="{ color: masteryColor(dim.avgMastery) }">{{ abilityStateLabel(dim.level) }}</span>
                  </div>
                </div>
              </div>

              <!-- 右：重点提升方向 -->
              <div class="[padding:16px] [border-radius:14px] [border:1px_solid_var(--app-border)]" v-if="sortedWeaknesses.length">
                <div class="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:14px]">
                  <div class="[display:flex] [align-items:center] [gap:8px]">
                    <LucideIcon name="flag" :size="16" style="color: var(--app-danger)" />
                    <span class="[font-size:14px] [font-weight:600] [color:var(--app-text)]">重点提升方向</span>
                  </div>
                </div>
                <div class="[display:flex] [flex-direction:column] [gap:10px]">
                  <div v-for="(w, i) in sortedWeaknesses.slice(0, 3)" :key="i"
                    class="[padding:12px] [border-radius:10px] [border:1px_solid_var(--app-border)]"
                    :style="weaknessBgStyle(i)">
                    <div class="[display:flex] [align-items:center] [justify-content:space-between] [margin-bottom:6px]">
                      <div class="[display:flex] [align-items:center] [gap:8px] [min-width:0]">
                        <span class="[width:22px] [height:22px] [border-radius:50%] [display:inline-flex] [align-items:center] [justify-content:center] [font-size:11px] [font-weight:700] [color:#fff] [flex-shrink:0]"
                              :style="{ background: i === 0 ? 'var(--app-danger)' : i === 1 ? 'var(--app-warning)' : 'var(--app-text-soft)' }">{{ i + 1 }}</span>
                        <span class="[font-size:13px] [font-weight:600] [color:var(--app-text)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">{{ w.experimentName || w.dimension }}</span>
                      </div>
                      <span class="[font-size:12px] [font-weight:700] [flex-shrink:0] [margin-left:8px]" :style="{ color: masteryColor(w.mastery) }">{{ Math.round(w.mastery) }}分</span>
                    </div>
                    <div class="[font-size:11px] [color:var(--app-text-secondary)]">
                      {{ w.dimension }}<template v-if="w.evidence"> · 提交{{ w.evidence.totalSubmissions }}次 · AC{{ w.evidence.acCount }}次</template>
                    </div>
                    <router-link v-if="i === 0" to="/student/wrong-notebook"
                      class="[display:inline-flex] [align-items:center] [gap:4px] [margin-top:8px] [font-size:11px] [font-weight:600] [text-decoration:none] hover:[opacity:0.8]"
                      style="color: var(--app-primary)">
                      去错题本回炉
                      <LucideIcon name="chevron-right" :size="14" />
                    </router-link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </ui-card>

        <!-- 🤖 AI 个性化学习建议 -->
        <ui-card v-if="aiSuggestions" class="ai-suggestions-card">
          <template #header>
            <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [gap:12px]">
              <div class="ai-suggestions-title [display:flex] [align-items:center] [gap:8px] [font-weight:500] [font-size:15px] [color:#202124]">
                <ui-icon class="[font-size:20px] [color:#1a73e8]"><MagicStick /></ui-icon>
                <span>🤖 AI 个性化学习建议</span>
              </div>
              <ui-tag v-if="aiSuggestions.aiGenerated" type="success" effect="dark">AI 生成</ui-tag>
              <ui-tag v-else type="info" effect="plain">规则引擎</ui-tag>
            </div>
          </template>
          <div class="ai-suggestions-body">
            <!-- 总结语 -->
            <div v-if="aiSuggestions.summaryMessage" class="ai-summary-msg [padding:12px_16px] [background:#e6f4ea] [border-radius:10px] [margin-bottom:16px] [font-size:14px] [color:#1e8e3e] [line-height:1.7]">
              🌟 {{ aiSuggestions.summaryMessage }}
            </div>

            <!-- 薄弱知识点 -->
            <div v-if="aiSuggestions.weakPoints?.length" class="sug-section [margin-bottom:16px]">
              <h4 class="sug-section-title [font-size:14px] [font-weight:600] [color:#202124] [margin-bottom:10px]">🎯 识别的薄弱知识点</h4>
              <div class="sug-weak-list [display:flex] [gap:10px] [flex-wrap:wrap]">
                <div v-for="(wp, i) in aiSuggestions.weakPoints" :key="i"
                     class="sug-weak-card [display:flex] [align-items:center] [gap:12px] [padding:12px_16px] [background:#fff] [border:1px_solid_#fce8e6] [border-radius:10px] [flex:1] [min-width:220px]">
                  <span class="sug-weak-icon [font-size:28px]">🎯</span>
                  <div class="sug-weak-info [flex:1]">
                    <div class="sug-weak-name [font-size:14px] [font-weight:500] [color:#202124]">{{ wp.tagName }}</div>
                    <div class="sug-weak-reason [font-size:12px] [color:#5f6368] [margin-top:2px]">{{ wp.reason }}</div>
                  </div>
                  <ui-tag :type="wp.severity === 'HIGH' ? 'danger' : wp.severity === 'MEDIUM' ? 'warning' : 'info'" size="small">{{ wp.severity }}</ui-tag>
                </div>
              </div>
            </div>

            <!-- 学习计划 -->
            <div v-if="aiSuggestions.studyPlan?.length" class="sug-section [margin-bottom:16px]">
              <h4 class="sug-section-title [font-size:14px] [font-weight:600] [color:#202124] [margin-bottom:10px]">📋 个性化学习计划</h4>
              <div class="sug-plan-list [display:flex] [flex-direction:column] [gap:8px]">
                <div v-for="(item, i) in aiSuggestions.studyPlan" :key="i"
                     class="sug-plan-item [display:flex] [align-items:center] [gap:12px] [padding:10px_16px] [background:#fff] [border:1px_solid_#e8eaed] [border-radius:10px]">
                  <span class="sug-plan-num [display:inline-flex] [align-items:center] [justify-content:center] [width:28px] [height:28px] [border-radius:50%] [background:#e6f4ea] [color:#1e8e3e] [font-size:13px] [font-weight:700] [flex-shrink:0]">{{ i + 1 }}</span>
                  <div class="sug-plan-body [flex:1]">
                    <div class="sug-plan-topic [font-size:14px] [font-weight:500] [color:#202124]">{{ item.topic }}</div>
                    <div v-if="item.suggestedResources" class="sug-plan-resource [font-size:12px] [color:#5f6368] [margin-top:2px]">{{ item.suggestedResources }}</div>
                  </div>
                  <div class="sug-plan-meta [display:flex] [align-items:center] [gap:8px] [flex-shrink:0]">
                    <span class="sug-plan-priority [font-size:11px] [padding:2px_10px] [border-radius:100px] [font-weight:600]"
                          :class="{'sug-priority-high [background:#fce8e6] [color:#d93025]': item.priority === 'HIGH',
                                  'sug-priority-med [background:#fef7e0] [color:#e37400]': item.priority === 'MEDIUM',
                                  'sug-priority-low [background:#e6f4ea] [color:#1e8e3e]': item.priority === 'LOW'}">
                      {{ item.priority === 'HIGH' ? '🔴 高优' : item.priority === 'MEDIUM' ? '🟡 中优' : '🟢 低优' }}
                    </span>
                    <span v-if="item.estimatedTime" class="sug-plan-time [font-size:12px] [color:#5f6368]">⏱ {{ item.estimatedTime }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 推荐练习 -->
            <div v-if="aiSuggestions.recommendedProblems?.length" class="sug-section">
              <h4 class="sug-section-title [font-size:14px] [font-weight:600] [color:#202124] [margin-bottom:10px]">📌 薄弱强化方向</h4>
              <div class="sug-rec-list [display:flex] [gap:8px] [flex-wrap:wrap]">
                <router-link v-for="(rec, i) in aiSuggestions.recommendedProblems" :key="i" to="/student/leetcode-search"
                      class="sug-rec-chip [display:inline-block] [font-size:13px] [padding:6px_14px] [border-radius:100px] [background:#e8f0fe] [color:#1a73e8] [font-weight:500] [text-decoration:none] [cursor:pointer] hover:[background:#d2e3fc]">
                  📌 {{ rec }}
                </router-link>
              </div>
              <div class="[margin-top:10px]">
                <router-link to="/student/leetcode-search" class="[font-size:13px] [color:#1a73e8] [text-decoration:none] hover:[text-decoration:underline]">
                  👉 前往薄弱强化题集，针对性提升 →
                </router-link>
              </div>
            </div>

            <!-- 刷新按钮 -->
            <div class="sug-refresh [text-align:right] [margin-top:16px]">
              <UiButton
                class="g-outline-btn [background:#fff] [border:1px_solid_#dadce0] [border-radius:100px] [padding:6px_16px] [font-size:12px] [color:#5f6368] [cursor:pointer] hover:[background:#f8f9fa]"
                @click="fetchAiLearningSuggestions"
                :disabled="aiSuggestionsLoading"
              >
                {{ aiSuggestionsLoading ? '加载中...' : '🔄 刷新 AI 建议' }}
              </UiButton>
            </div>
          </div>
        </ui-card>

        <ui-alert
          v-else-if="aiSuggestionsError"
          class="ai-suggestions-alert"
          type="info"
          :closable="false"
          :title="aiSuggestionsError"
          show-icon
        />

        <!-- 学习方法推荐 -->
        <ui-card>
          <template #header><div class="card-header [display:flex] [align-items:center] [gap:12px]"><span><LucideIcon name="book-open" :size="18" class="mr-2" /> 学习方法推荐</span></div></template>
          <div class="method-container [display:grid] [grid-template-columns:repeat(auto-fill,_minmax(200px,_1fr))] [gap:16px]">
            <ui-card v-for="(item, index) in learningMethods" :key="index" class="method-card [text-align:center] [border-radius:16px] [border:1px_solid_#dadce0] [box-shadow:none] hover:[box-shadow:0_1px_3px_rgba(60,64,67,0.15),_0_4px_8px_rgba(60,64,67,0.08)]" shadow="hover">
              <div class="method-header [display:flex] [flex-direction:column] [align-items:center] [gap:8px] [margin-bottom:8px]">
                <ui-icon :size="24" class="method-icon [color:#1a73e8]"><component :is="item.icon" /></ui-icon>
                <h4>{{ item.title }}</h4>
              </div>
              <p>{{ item.description }}</p>
            </ui-card>
          </div>
        </ui-card>
      </div>
    </loading-state>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Reading, VideoPlay, ChatDotRound, Notebook, Connection, MagicStick } from '@/components/ui/icons'
import { TrendCharts, DataAnalysis, Finished, List as ListIcon } from '@/components/ui/icons'
import LucideIcon from '@/components/LucideIcon.vue'
import LoadingState from '../../components/LoadingState.vue'
import * as echarts from 'echarts'
import axios from 'axios'
import api from '@/api'
import { getStudentAnalyticsOverview } from '../../api/tap'
import { API_BASE_URL } from '../../config/runtime'

const API_BASE = API_BASE_URL
const loading = ref(true)
const profileData = ref({})
const analysisContainerRef = ref(null)

const classData = ref(null)
const classCompareUnavailableReason = ref('')
const classCompareChartRef = ref(null)
let classCompareChart = null

const radarChartRef = ref(null)
const trendChartRef = ref(null)
const effortChartRef = ref(null)
const efficiencyChartRef = ref(null)
let radarChart = null, trendChart = null, effortChart = null, efficiencyChart = null
let analysisResizeObserver = null

// AI 学习建议
const aiSuggestions = ref(null)
const aiSuggestionsLoading = ref(false)
const aiSuggestionsError = ref('')

// 班级对比 computed
const avgDiffClass = computed(() => {
  const s = classData.value?.summary
  if (!s) return 'neutral'
  const diff = s.avgMyScore - s.avgClassScore
  return diff >= 5 ? 'positive' : diff <= -5 ? 'negative' : 'neutral'
})
const avgDiffText = computed(() => {
  const s = classData.value?.summary
  if (!s) return ''
  const diff = (s.avgMyScore - s.avgClassScore).toFixed(1)
  return diff >= 0 ? `高于班级均分 +${diff}` : `低于班级均分 ${diff}`
})
function shortName(name) {
  return name && name.length > 8 ? name.substring(0, 8) + '…' : name
}
function pctColorClass(p) {
  if (p >= 75) return '[background:#1e8e3e]'
  if (p >= 50) return '[background:#1a73e8]'
  if (p >= 25) return '[background:#e37400]'
  return '[background:#d93025]'
}

function progressWidthStyle(value) {
  return { '--progress-width': `${value}%` }
}

const overviewCards = computed(() => {
  const o = profileData.value.overview || {}
  return [
    { label: '总提交次数', value: o.totalSubmissions || 0, icon: TrendCharts, color: '#d18a61', bg: 'linear-gradient(135deg,#d18a61,#e8c4b0)' },
    { label: '通过次数', value: o.totalAc || 0, icon: Finished, color: '#67C23A', bg: 'linear-gradient(135deg,#67C23A,#95d475)' },
    { label: '总体AC率', value: (o.overallAcRate || 0) + '%', icon: DataAnalysis, color: '#E6A23C', bg: 'linear-gradient(135deg,#E6A23C,#eebe77)' },
    { label: '已参与实验', value: (o.experimentsCovered || 0) + '/' + (o.totalExperiments || 19), icon: ListIcon, color: '#909399', bg: 'linear-gradient(135deg,#909399,#b1b3b8)' }
  ]
})

function overviewIconClass(item) {
  if (item.color === '#d18a61') return '[background:linear-gradient(135deg,#d18a61,#e8c4b0)]'
  if (item.color === '#67C23A') return '[background:linear-gradient(135deg,#67C23A,#95d475)]'
  if (item.color === '#E6A23C') return '[background:linear-gradient(135deg,#E6A23C,#eebe77)]'
  return '[background:linear-gradient(135deg,#909399,#b1b3b8)]'
}

function overviewValueClass(item) {
  if (item.color === '#d18a61') return '[color:#d18a61]'
  if (item.color === '#67C23A') return '[color:#67C23A]'
  if (item.color === '#E6A23C') return '[color:#E6A23C]'
  return '[color:#909399]'
}

const portraitHeadline = computed(() => {
  const patterns = profileData.value.patterns || []
  const weaknesses = profileData.value.weaknesses || []
  const steady = patterns.find(p => p.tag === '稳定进步' || p.tag === '表现均衡')
  const lead = steady ? steady.tag : (patterns[0]?.tag || '持续学习')
  if (weaknesses.length) {
    const top = [...weaknesses].sort((a, b) => a.mastery - b.mastery)[0]
    return `${lead}，但在${top.dimension || top.experimentName}上仍需加强`
  }
  return `${lead}，整体表现均衡`
})

const portraitSubline = computed(() => {
  const skillTree = profileData.value.skillTree || []
  const weaknesses = profileData.value.weaknesses || []
  const strongest = [...skillTree].sort((a, b) => b.avgMastery - a.avgMastery)[0]
  const topWeak = weaknesses.length ? [...weaknesses].sort((a, b) => a.mastery - b.mastery)[0] : null
  const parts = []
  if (strongest) parts.push(`优势是${strongest.dimension}`)
  if (topWeak) parts.push(`当前突破口是${topWeak.dimension || topWeak.experimentName}`)
  return parts.length ? parts.join('，') + '。' : ''
})

const sortedWeaknesses = computed(() => {
  const ws = profileData.value.weaknesses || []
  return [...ws].sort((a, b) => a.mastery - b.mastery)
})

const avgMastery = computed(() => {
  const tree = profileData.value.skillTree || []
  if (!tree.length) return 0
  const sum = tree.reduce((s, d) => s + (d.avgMastery || 0), 0)
  return Math.round(sum / tree.length)
})

function abilityStateLabel(level) {
  if (level === 'good') return '掌握良好'
  if (level === 'medium') return '需要巩固'
  return '薄弱'
}

function traitTone(tag) {
  if (tag === '稳定进步' || tag === '表现均衡') return 'success'
  if (tag === '高波动型') return 'warning'
  return 'danger'
}

function traitColor(tag) {
  const tone = traitTone(tag)
  if (tone === 'success') return 'var(--app-success)'
  if (tone === 'warning') return 'var(--app-warning)'
  return 'var(--app-danger)'
}

function traitBgStyle(tag) {
  const tone = traitTone(tag)
  if (tone === 'success') return { background: 'rgba(107,143,107,0.08)' }
  if (tone === 'warning') return { background: 'rgba(196,154,60,0.08)' }
  return { background: 'rgba(196,75,63,0.06)' }
}

function weaknessBgStyle(index) {
  if (index === 0) return { background: 'rgba(196,75,63,0.06)', borderColor: 'rgba(196,75,63,0.2)' }
  if (index === 1) return { background: 'rgba(196,154,60,0.06)', borderColor: 'rgba(196,154,60,0.2)' }
  return {}
}

const learningMethods = [
  { icon: Reading, title: '系统学习', description: '通过教材和参考书籍系统地学习理论知识，掌握数据结构的基本概念和算法原理。' },
  { icon: Notebook, title: '动手实践', description: '多做实验和编程练习，将理论知识应用到实际问题中，加深对算法的理解。' },
  { icon: Connection, title: '知识关联', description: '将不同的数据结构和算法进行对比和关联，理解它们的优缺点和适用场景。' },
  { icon: VideoPlay, title: '观看教学视频', description: '利用在线教学资源，观看算法演示和可视化过程，帮助理解复杂概念。' },
  { icon: ChatDotRound, title: '小组讨论', description: '与同学交流学习心得和解题思路，通过讲解来加深对知识点的掌握。' }
]

function masteryColor(v) { return v >= 70 ? '#67C23A' : v >= 40 ? '#E6A23C' : '#F56C6C' }
function patternEmoji(tag) {
  const map = { '稳定进步': 'trend', '表现均衡': 'scale', '高波动型': 'trend-down', '高重做型': 'refresh', '编码基础薄弱': 'wrench' }
  return map[tag] || 'clipboard-text'
}

function resolveCurrentStudentId() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.usernum || userInfo.studentId || userInfo.username || ''
  } catch {
    return ''
  }
}

function hasRenderableProfile(data) {
  return !data?.error
    && Array.isArray(data?.radar?.dimensions)
    && data.radar.dimensions.length > 0
    && Array.isArray(data?.radar?.scores)
    && Array.isArray(data?.trend?.series)
}

async function fetchStudentAnalytics(studentId) {
  try {
    const response = await getStudentAnalyticsOverview(studentId)
    return response?.data || response || null
  } catch (error) {
    logger.warn('获取学生成绩分析降级数据失败:', error)
    return null
  }
}

function setEmptyChart(chart, message) {
  chart.setOption({
    graphic: [{
      type: 'text',
      left: 'center',
      top: 'middle',
      style: { text: message, fill: '#909399', fontSize: 14, textAlign: 'center' }
    }]
  })
}

async function fetchAiLearningSuggestions() {
  aiSuggestionsLoading.value = true
  aiSuggestionsError.value = ''
  try {
    const studentId = resolveCurrentStudentId()
    if (!studentId) {
      aiSuggestionsError.value = '未识别到当前学生身份'
      return
    }

    // 构建技能状态数据（从现有 profileData 提取）
    const skillStates = []
    const skillTree = profileData.value?.skillTree || []
    for (const dim of skillTree) {
      for (const child of dim.children || []) {
        skillStates.push({
          tagName: child.name || dim.dimension,
          masteryScore: child.avgMastery || child.score || 0,
          attemptCount: child.totalSubmissions || 0
        })
      }
    }
    // 如果 skillTree 为空，使用 radar 数据
    if (!skillStates.length && profileData.value?.radar) {
      const r = profileData.value.radar
      r.dimensions?.forEach((dim, i) => {
        skillStates.push({
          tagName: dim,
          masteryScore: r.scores?.[i] || 0,
          attemptCount: 0
        })
      })
    }

    // 构建错误历史（从 weakPoints 或 experiment 数据中构建）
    const errorHistory = []
    const weaknesses = profileData.value?.weaknesses || []
    for (const w of weaknesses) {
      errorHistory.push({
        errorType: w.dimension || 'UNKNOWN',
        count: Math.max(1, Math.round((100 - w.mastery) / 10))
      })
    }
    if (!errorHistory.length) {
      aiSuggestions.value = null
      aiSuggestionsError.value = '暂无错误历史数据，暂无法生成个性化学习建议'
      return
    }

    const payload = {
      studentId,
      studentName: resolveStudentName(),
      errorHistory,
      skillStates,
      previousRemark: ''
    }

    const res = await api.getLearningSuggestions(payload)
    if (res?.success && res?.data) {
      aiSuggestions.value = res.data
    } else if (res?.code === 200 && res?.data) {
      aiSuggestions.value = res.data
    } else {
      aiSuggestions.value = null
      aiSuggestionsError.value = 'AI 学习建议暂不可用，请稍后重试'
    }
  } catch (e) {
    logger.warn('AI 学习建议获取失败:', e)
    aiSuggestions.value = null
    aiSuggestionsError.value = 'AI 学习建议暂不可用，请稍后重试'
  } finally {
    aiSuggestionsLoading.value = false
  }
}

function resolveStudentName() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.realName || userInfo.name || userInfo.username || ''
  } catch {
    return ''
  }
}

async function loadData() {
  loading.value = true
  try {
    const studentId = resolveCurrentStudentId()
    let res
    try {
      res = await axios.get(`${API_BASE}/api/profile/me`, { withCredentials: true })
    } catch {
      if (studentId) {
        res = await axios.get(`${API_BASE}/api/profile/student/${studentId}`, { withCredentials: true })
      }
    }
    if (res) profileData.value = res.data || res || {}
    if (!hasRenderableProfile(profileData.value) && studentId) {
      const analyticsPayload = await fetchStudentAnalytics(studentId)
      if (analyticsPayload?.experiments?.length) {
        classData.value = analyticsPayload
      }
    }
    loading.value = false
    await nextTick()
    // 异步加载 AI 学习建议（不阻塞页面渲染）
    fetchAiLearningSuggestions()
    // Use multiple delayed attempts to ensure DOM is fully rendered
    setTimeout(() => {
      initCharts()
      loadClassComparison()
      // Second attempt after layout stabilizes
      setTimeout(() => {
        radarChart?.resize()
        trendChart?.resize()
        effortChart?.resize()
        efficiencyChart?.resize()
      }, 500)
    }, 200)
  } catch (e) {
    logger.error('加载学习分析失败:', e)
    loading.value = false
  }
}

function initCharts() {
  initRadar(); initTrend(); initEffort(); initEfficiency()
}

function initRadar() {
  if (!radarChartRef.value) return
  if (radarChart) radarChart.dispose()
  radarChart = echarts.init(radarChartRef.value)
  const r = profileData.value.radar
  if (!r?.dimensions?.length || !r?.scores?.length) {
    setEmptyChart(radarChart, '暂无知识掌握数据')
    return
  }
  radarChart.setOption({
    tooltip: { trigger: 'item' },
    radar: {
      indicator: r.dimensions.map(d => ({ name: d, max: 100 })),
      shape: 'circle', radius: '65%',
      axisName: { color: '#606266', fontSize: 13 },
      splitArea: { areaStyle: { color: ['rgba(209, 138, 97,0.05)', 'rgba(209, 138, 97,0.1)'] } }
    },
    series: [{ type: 'radar', symbol: 'circle', symbolSize: 8, data: [{
      value: r.scores, name: '掌握度',
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(209, 138, 97,0.5)' }, { offset: 1, color: 'rgba(209, 138, 97,0.1)' }]) },
      lineStyle: { color: '#d18a61', width: 2 },
      itemStyle: { color: '#d18a61', borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: p => p.value, color: '#d18a61', fontSize: 11 }
    }] }]
  })
}

function initTrend() {
  if (!trendChartRef.value) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(trendChartRef.value)
  const s = profileData.value.trend?.series
  if (!s?.length) {
    setEmptyChart(trendChart, '暂无实验趋势数据')
    return
  }
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 16, right: 16, bottom: 16, top: 24, containLabel: true },
    xAxis: { type: 'category', data: s.map(x => x.name), axisLabel: { rotate: 35, fontSize: 10 } },
    yAxis: { type: 'value', min: 0, max: 100, name: '掌握度' },
    series: [{ type: 'line', data: s.map(x => x.mastery), smooth: true,
      lineStyle: { color: '#d18a61', width: 2.5 }, symbolSize: 7,
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(209, 138, 97,0.3)' }, { offset: 1, color: 'rgba(209, 138, 97,0.02)' }]) },
      markLine: { data: [{ type: 'average', name: '均值' }], lineStyle: { color: '#E6A23C', type: 'dashed' } }
    }]
  })
}

function initEffort() {
  if (!effortChartRef.value) return
  if (effortChart) effortChart.dispose()
  effortChart = echarts.init(effortChartRef.value)
  const items = (profileData.value.skillTree || [])
    .map(dim => {
      const children = dim.children || []
      return {
        name: dim.dimension || '未分类',
        value: children.reduce((sum, child) => sum + (Number(child.totalSubmissions) || 0), 0),
        acCount: children.reduce((sum, child) => sum + (Number(child.acCount) || 0), 0),
        questionCount: children.reduce((sum, child) => sum + (Number(child.questionCount) || 0), 0)
      }
    })
    .filter(item => item.value > 0)
  if (!items.length) {
    setEmptyChart(effortChart, '暂无学习投入数据')
    return
  }
  effortChart.setOption({
    color: ['#d18a61', '#67C23A', '#E6A23C', '#6b8fa3', '#9b7eaa', '#c46b5e'],
    tooltip: {
      trigger: 'item',
      formatter(params) {
        const item = params.data
        return `${item.name}<br/>提交次数：${item.value}次（${params.percent}%）<br/>AC次数：${item.acCount}次<br/>练习题数：${item.questionCount}题`
      }
    },
    legend: { orient: 'vertical', right: 16, top: 'middle', itemWidth: 12, itemHeight: 12 },
    series: [{
      name: '提交次数',
      type: 'pie',
      radius: ['38%', '66%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 5 },
      label: { color: '#606266', fontSize: 11, formatter: '{b}\n{c}次 ({d}%)' },
      labelLine: { length: 10, length2: 8 },
      data: items
    }],
    media: [{
      query: { maxWidth: 520 },
      option: {
        legend: { orient: 'horizontal', left: 'center', right: 'auto', top: 'auto', bottom: 0 },
        series: [{ center: ['50%', '40%'], radius: ['30%', '53%'], label: { show: false } }]
      }
    }]
  })
}

function initEfficiency() {
  if (!efficiencyChartRef.value) return
  if (efficiencyChart) efficiencyChart.dispose()
  efficiencyChart = echarts.init(efficiencyChartRef.value)
  // 从skillTree提取每个实验的提交数和AC数
  const items = []
  for (const dim of profileData.value.skillTree || []) {
    for (const c of dim.children || []) {
      if (c.totalSubmissions) items.push({ name: c.name, total: c.totalSubmissions, ac: c.acCount || 0 })
    }
  }
  if (!items.length) {
    setEmptyChart(efficiencyChart, '暂无提交明细，无法计算效率')
    return
  }
  efficiencyChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['总提交', 'AC次数'], bottom: 0 },
    grid: { left: 16, right: 16, bottom: 32, top: 16, containLabel: true },
    xAxis: { type: 'category', data: items.map(x => x.name), axisLabel: { rotate: 40, fontSize: 10 } },
    yAxis: { type: 'value' },
    series: [
      { name: '总提交', type: 'bar', data: items.map(x => x.total), itemStyle: { color: '#d18a61' }, barWidth: 12 },
      { name: 'AC次数', type: 'bar', data: items.map(x => x.ac), itemStyle: { color: '#67C23A' }, barWidth: 12 }
    ]
  })
}

function resolveClassCompareError(error) {
  const message = String(error?.message || error || '')
  if (message.includes('student role required') || message.includes('403')) {
    return '班级对比接口当前要求学生角色会话，已自动降级为仅展示个人学习分析。'
  }
  if (message.includes('401')) {
    return '班级对比接口当前登录状态不可用，已自动降级为仅展示个人学习分析。'
  }
  return '班级对比数据暂时不可用，页面已自动降级为仅展示个人学习分析。'
}

async function loadClassComparison() {
  classCompareUnavailableReason.value = ''
  classData.value = null
  try {
    const studentId = resolveCurrentStudentId()
    if (!studentId) {
      classCompareUnavailableReason.value = '未识别到当前学生身份，暂不加载班级对比数据。'
      return
    }
    const res = await getStudentAnalyticsOverview(studentId)
    const payload = res?.data || res
    if (!payload?.experiments?.length) {
      classCompareUnavailableReason.value = '班级对比暂无可展示数据。'
      return
    }
    classData.value = payload
    await nextTick()
    setTimeout(() => initClassCompareChart(), 100)
  } catch (e) {
    classCompareUnavailableReason.value = resolveClassCompareError(e)
    logger.warn('班级对比数据加载失败:', e)
  }
}

function initClassCompareChart() {
  if (!classCompareChartRef.value || !classData.value?.experiments?.length) return
  classCompareChart?.dispose()
  classCompareChart = echarts.init(classCompareChartRef.value)
  const exps = classData.value.experiments
  const names = exps.map(e => e.name.length > 10 ? e.name.substring(0, 10) + '…' : e.name)
  classCompareChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['我的得分', '班级均分', '班级中位数'], top: 0 },
    grid: { left: 16, right: 16, bottom: 20, top: 36, containLabel: true },
    xAxis: { type: 'category', data: names, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: 'value', name: '分数' },
    series: [
      { name: '我的得分', type: 'bar', data: exps.map(e => e.myScore), barWidth: '22%',
        itemStyle: { color: '#1a73e8', borderRadius: [3, 3, 0, 0] },
        label: { show: exps.length <= 10, position: 'top', fontSize: 10 } },
      { name: '班级均分', type: 'line', data: exps.map(e => e.classAvg), smooth: true,
        lineStyle: { color: '#e37400', width: 2, type: 'dashed' },
        itemStyle: { color: '#e37400' }, symbol: 'circle', symbolSize: 6 },
      { name: '班级中位数', type: 'line', data: exps.map(e => e.classMedian), smooth: true,
        lineStyle: { color: '#9aa0a6', width: 1.5, type: 'dotted' },
        itemStyle: { color: '#9aa0a6' }, symbol: 'diamond', symbolSize: 5 }
    ]
  })
}

function handleResize() { radarChart?.resize(); trendChart?.resize(); effortChart?.resize(); efficiencyChart?.resize(); classCompareChart?.resize() }
onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
  if (typeof ResizeObserver !== 'undefined' && analysisContainerRef.value) {
    analysisResizeObserver = new ResizeObserver(handleResize)
    analysisResizeObserver.observe(analysisContainerRef.value)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  analysisResizeObserver?.disconnect()
  radarChart?.dispose(); trendChart?.dispose(); effortChart?.dispose(); efficiencyChart?.dispose(); classCompareChart?.dispose()
})
</script>

<style scoped>
@media (max-width: 768px) {
  .overview-row {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
  }

  .overview-row :deep(.ui-col) {
    grid-column: span 1 / span 1 !important;
  }

  .overview-row .stat-card {
    min-width: 0 !important;
  }

  .chart-row {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 16px !important;
  }

  .chart-row :deep(.ui-col) {
    grid-column: span 1 / span 1 !important;
  }
}

@media (max-width: 1024px) {
  .ai-profile-grid {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}
</style>


