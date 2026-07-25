<template>
  <div class="dash-page [display:flex] [gap:16px] [min-height:100%]">

    <!-- ====== 中间主内容区 ====== -->
    <div class="dash-center [flex:1] [min-width:0] [display:flex] [flex-direction:column] [gap:16px]">

      <!-- 模块1: 欢迎问候卡片 -->
      <div class="dash-card dash-welcome [padding:24px_28px] [display:flex] [align-items:center] [justify-content:space-between]">
        <div>
          <div class="[font-size:24px] [font-weight:700] [color:#1a1a2e] [display:flex] [align-items:center] [gap:8px]">
            <span>你好，{{ studentName }}</span>
            <span class="[width:30px] [height:30px] [border-radius:10px] [display:inline-flex] [align-items:center] [justify-content:center] [background:#fbf1eb] [color:#d18a61]">
              <LucideIcon name="sparkles" :size="16" :stroke-width="2.2" />
            </span>
          </div>
          <div class="[font-size:14px] [color:#8c959f] [margin-top:6px]">今天也要加油学习哦！</div>
        </div>
        <div class="[position:relative] [width:120px] [height:80px] [display:flex] [align-items:center] [justify-content:center] [background:linear-gradient(135deg,_#fbf1eb,_#f6e4d8)] [border-radius:12px] [border:1px_solid_#ead6c5] [color:#d18a61]">
          <LucideIcon name="book-open" :size="34" :stroke-width="2" />
          <span class="[position:absolute] [top:14px] [right:18px] [width:24px] [height:24px] [border-radius:8px] [display:flex] [align-items:center] [justify-content:center] [background:#d18a61] [color:#fff] [box-shadow:0_4px_10px_rgba(209, 138, 97,0.2)]">
            <LucideIcon name="sparkles" :size="13" :stroke-width="2.2" />
          </span>
        </div>
      </div>

      <!-- 错误条 -->
      <div v-if="loadError" class="dash-card [background:#fef2f2] [border-color:#fecaca] [padding:14px_20px] [display:flex] [align-items:center] [gap:12px]">
        <span class="[width:28px] [height:28px] [border-radius:10px] [display:flex] [align-items:center] [justify-content:center] [background:#fff] [color:#dc2626]">
          <LucideIcon name="alert-triangle" :size="16" :stroke-width="2.2" />
        </span>
        <span class="[font-size:13px] [color:#b91c1c] [flex:1]">部分数据加载失败，请稍后重试。</span>
        <UiButton class="[background:#fff] [border:1px_solid_#fecaca] [border-radius:100px] [padding:5px_16px] [font-size:12px] [color:#b91c1c] [font-weight:600] [cursor:pointer] hover:[background:#fee2e2]" @click="loadData">重试</UiButton>
      </div>

      <!-- Loading 骨架 -->
      <template v-if="loading">
        <div class="dash-card [padding:20px_24px]"><UiSkeleton :rows="4" /></div>
        <div class="dash-card [padding:20px_24px]"><UiSkeleton :rows="3" /></div>
        <div class="dash-card [padding:20px_24px]"><UiSkeleton :rows="5" /></div>
      </template>

      <template v-else>
      <!-- 模块2: 当前最紧急的实验 -->
      <div v-if="urgentExperiment" class="dash-card-urgent [padding:20px_24px]">
        <div class="[display:flex] [align-items:center] [gap:8px] [margin-bottom:16px]">
          <span class="[width:26px] [height:26px] [border-radius:50%] [background:#fbf1eb] [display:flex] [align-items:center] [justify-content:center] [color:#ac6843]">
            <LucideIcon name="flame" :size="14" :stroke-width="2.1" />
          </span>
          <span class="[font-size:13px] [font-weight:700] [color:#ac6843]">当前最紧急的实验</span>
          <span v-if="urgentCountdown" class="[font-size:12px] [color:#ac6843] [font-weight:600] [margin-left:auto] [background:#fbf1eb] [padding:3px_10px] [border-radius:100px] [display:inline-flex] [align-items:center] [gap:4px]">
            <LucideIcon name="clock" :size="12" :stroke-width="2.2" />
            {{ urgentCountdown }}
          </span>
        </div>
        <div class="[display:flex] [gap:24px]">
          <div class="[flex:1]">
            <div class="[font-size:17px] [font-weight:700] [color:#1a1a2e] [margin-bottom:6px]">
              {{ urgentExperiment.name }}
              <span v-if="urgentFailCount > 0" class="[font-size:11px] [padding:2px_10px] [border-radius:100px] [background:#fbf1eb] [color:#ac6843] [font-weight:600] [margin-left:8px] [border:1px_solid_#ead6c5]">部分测试未通过</span>
            </div>
            <div class="[font-size:12px] [color:#6b7280] [margin-bottom:8px] [line-height:1.7]">
              所属实验：{{ urgentExperiment.name }} · 题目数：{{ urgentExperiment.problemCount || 0 }} · 最近提交：{{ formatTime(urgentExperiment.submitTime) || '暂无' }}
            </div>
            <div class="[display:flex] [align-items:center] [gap:16px] [margin-bottom:14px]">
              <span class="[font-size:13px] [color:#1a1a2e]">通过率：<strong class="[color:#ac6843]">{{ urgentPassRate }}%</strong> ({{ urgentExperiment.acceptedProblemCount || 0 }}/{{ urgentExperiment.problemCount || 0 }})</span>
              <span v-if="urgentFailCount > 0" class="[font-size:13px] [color:#ac6843] [font-weight:600]">未通过 {{ urgentFailCount }} 个测试点</span>
            </div>
            <div class="[display:flex] [gap:10px]">
              <UiButton class="[background:linear-gradient(135deg,_#d18a61,_#ac6843)] text-white [border:none] [border-radius:100px] [padding:8px_22px] [font-size:13px] [font-weight:600] [cursor:pointer] [box-shadow:0_2px_6px_rgba(209,138,97,0.22)] hover:[background:linear-gradient(135deg,_#ac6843,_#8f4f31)] hover:[box-shadow:0_4px_12px_rgba(209,138,97,0.3)]" @click="nav('/student/experiment-detail/' + urgentExperiment.id)">继续修改</UiButton>
              <UiButton class="[background:#fff] [border:1px_solid_#e5e7eb] [border-radius:100px] [padding:8px_22px] [font-size:13px] [color:#6b7280] [font-weight:500] [cursor:pointer] hover:[background:#fffaf7] hover:[border-color:#ead6c5] hover:[color:#ac6843]" @click="nav('/student/experiment-detail/' + urgentExperiment.id)">查看错误详情</UiButton>
            </div>
          </div>
          <div class="[display:flex] [align-items:center] [gap:14px] [flex-shrink:0]">
            <div ref="urgentRingRef" class="[width:90px] [height:90px]"></div>
            <div class="[width:56px] [height:48px] [border-radius:12px] [display:flex] [align-items:center] [justify-content:center] [background:#fbf1eb] [border:1px_solid_#ead6c5] [color:#d18a61]">
              <LucideIcon name="clipboard-check" :size="26" :stroke-width="2" />
            </div>
          </div>
        </div>
      </div>

      <!-- 模块3: 最近未解决的错误 -->
      <div v-if="recentErrors.length" class="dash-card [padding:20px_24px]">
        <div class="dash-section-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:14px]">
          <span class="[font-size:15px] [font-weight:700] [color:#1a1a2e]">最近未解决的错误（{{ recentErrors.length }}）</span>
          <a class="[font-size:13px] [color:#d18a61] [cursor:pointer] [font-weight:600] hover:[color:#ac6843]" @click="nav('/student/wrong-notebook')">查看全部 →</a>
        </div>
        <div class="[display:flex] [flex-direction:column]">
          <div v-for="(err, i) in recentErrors" :key="err.id || i"
               class="[display:flex] [align-items:center] [gap:14px] [padding:14px_0]"
               :class="{ '[border-bottom:1px_solid_#f3f4f6]': i < recentErrors.length - 1 }">
            <span class="[flex-shrink:0] [width:36px] [height:36px] [border-radius:10px] [display:flex] [align-items:center] [justify-content:center]" :style="errIconStyle(err)">
              <LucideIcon :name="errIcon(err)" :size="18" :stroke-width="2.1" />
            </span>
            <div class="[flex:1] [min-width:0]">
              <div class="[font-size:14px] [font-weight:600] [color:#1a1a2e]">{{ err.problemTitle || '未知题目' }}
                <span class="[font-size:12px] [color:#8c959f] [font-weight:400]" v-if="err.experimentName">· {{ err.experimentName }}</span>
              </div>
              <div class="[font-size:12px] [color:#6b7280] [margin-top:2px]" v-if="errDesc(err)">{{ errDesc(err) }}</div>
              <div class="[font-size:11px] [color:#9ca3af] [margin-top:2px]">提交时间 {{ formatTime(err.lastWrongAt) }}</div>
            </div>
            <span :class="errTagClass(err)" class="[font-size:11px] [padding:3px_10px] [border-radius:100px] [font-weight:600] [flex-shrink:0] [letter-spacing:0.01em]">{{ errTagText(err) }}</span>
            <UiButton class="[background:#fff] [border:1px_solid_#e5e7eb] [border-radius:100px] [padding:5px_14px] [font-size:12px] [color:#d18a61] [cursor:pointer] [font-weight:500] hover:[background:#fbf1eb] hover:[border-color:#d18a61]" @click="nav('/student/wrong-notebook')">查看详情</UiButton>
          </div>
        </div>
      </div>

      <!-- 模块4: 今日推荐练习 -->
      <div v-if="practiceRecommendations.length" class="dash-card [padding:20px_24px]">
        <div class="dash-section-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:8px]">
          <span class="[font-size:15px] [font-weight:700] [color:#1a1a2e]">今日推荐练习（基于你的薄弱点）</span>
          <UiButton class="[background:#fff] [border:1px_solid_#e5e7eb] [border-radius:100px] [padding:5px_14px] [font-size:12px] [color:#6b7280] [cursor:pointer] [font-weight:500] hover:[background:#f9fafb] hover:[border-color:#d1d5db]" @click="refreshRecommendations" :disabled="recLoading">
            <span class="[display:inline-flex] [align-items:center] [gap:6px]">
              <span class="[display:inline-flex]" :class="{ 'dash-spin': recLoading }">
                <LucideIcon name="refresh" :size="14" :stroke-width="2.1" />
              </span>
              换一批
            </span>
          </UiButton>
        </div>
        <div class="[font-size:12px] [color:#6b7280] [margin-bottom:14px] [padding:8px_12px] [background:#fbf1eb] [border-radius:8px] [border:1px_solid_#ead6c5] [display:flex] [align-items:center] [gap:8px]">
          <span class="[display:inline-flex] [color:#d18a61]">
            <LucideIcon name="lightbulb" :size="14" :stroke-width="2.2" />
          </span>
          <span>推荐原因：{{ recReason || '根据你的学习数据，为你推荐以下针对性练习' }}</span>
        </div>
        <div class="rec-grid [display:grid] [grid-template-columns:repeat(3,_1fr)] [gap:12px]">
          <div v-for="(rec, i) in practiceRecommendations" :key="rec.problemId || rec.title || i"
               class="rec-item [padding:16px] [border:1px_solid_#eef1f5] [border-radius:12px] [cursor:pointer] [transition:all_0.2s] [background:#fafbfc] hover:[border-color:#e3bea8] hover:[background:#fff] hover:[box-shadow:0_6px_16px_rgba(209, 138, 97,0.1)]" @click="goToPractice(rec)">
            <div class="[display:flex] [align-items:center] [gap:8px] [margin-bottom:8px]">
              <span class="[font-size:11px] [padding:2px_8px] [border-radius:100px] [font-weight:600] [letter-spacing:0.02em]" :class="rec.source === 'PTA' ? '[background:#fbf1eb] [color:#d18a61]' : '[background:#fef3c7] [color:#92400e]'">{{ rec.source }}</span>
              <span class="[font-size:12px] [font-weight:500] [color:#8c959f] [margin-left:auto]">{{ rec.source === 'PTA' ? 'PTA | ' + rec.tag : (rec.tag || '推荐拓展') }}</span>
            </div>
            <div class="[font-size:11px] [padding:2px_8px] [border-radius:100px] [display:inline-block] [margin-bottom:12px] [font-weight:500]" :class="rec._diffClass">{{ rec._diffLabel }}</div>
            <div class="[font-size:14px] [font-weight:700] [color:#1a1a2e] [margin-bottom:14px] [line-height:1.4]">{{ rec.title }}</div>
            <div v-if="rec.reason" class="[font-size:12px] [color:#6b7280] [line-height:1.5] [margin-bottom:12px]">{{ rec.reason }}</div>
            <UiButton
                class="w-full text-white border-none rounded-full py-[7px] text-[12px] cursor-pointer font-semibold bg-[linear-gradient(135deg,_#d18a61,_#ac6843)] hover:bg-[linear-gradient(135deg,_#ac6843,_#8f4f31)]"
                @click.stop="goToPractice(rec)"
            >
              开始练习
            </UiButton>          </div>
        </div>
      </div>

      <!-- 模块5: 快速入口 -->
      <div class="dash-card [padding:18px_20px]">
        <div class="[font-size:15px] [font-weight:700] [color:#1a1a2e] [margin-bottom:14px]">快速入口</div>
        <div class="quick-grid [display:grid] [grid-template-columns:repeat(6,_1fr)] [gap:8px]">
          <div v-for="q in quickEntries" :key="q.label"
               class="[display:flex] [flex-direction:column] [align-items:center] [gap:8px] [padding:12px_4px] [border-radius:12px] [cursor:pointer] [transition:all_0.2s] hover:[transform:translateY(-2px)]"
               @click="nav(q.path)">
            <span class="[width:42px] [height:42px] [border-radius:12px] [display:flex] [align-items:center] [justify-content:center] [box-shadow:0_2px_6px_rgba(0,0,0,0.06)]" :style="{ background: q.bg, color: q.color }">
              <LucideIcon :name="q.iconName" :size="20" :stroke-width="2.1" />
            </span>
            <span class="[font-size:11px] [color:#4b5563] [font-weight:600]">{{ q.label }}</span>
          </div>
        </div>
      </div>
      </template>
    </div>

    <!-- ====== 右侧固定信息侧边栏 ====== -->
    <div class="dash-right [display:flex] [flex-direction:column] [gap:14px]">
      <!-- Loading 骨架 -->
      <template v-if="loading">
        <div class="dash-card [padding:18px]"><UiSkeleton :rows="5" /></div>
        <div class="dash-card [padding:18px]"><UiSkeleton :rows="4" /></div>
      </template>
      <template v-else>
      <!-- 卡片1: 本周实验日历 -->
      <div class="dash-card [padding:18px]">
        <div class="[margin-bottom:12px]">
          <div class="[font-size:15px] [font-weight:700] [color:#1a1a2e] [margin-bottom:8px]">本周实验日历</div>
          <div class="[display:flex] [gap:6px] [align-items:center] [font-size:10px] [color:#8c959f] [flex-wrap:wrap]">
            <span class="[display:inline-flex] [align-items:center] [gap:3px]"><span class="[width:7px] [height:7px] [border-radius:50%] [display:inline-block] [background:#10b981]"></span>已完成</span>
            <span class="[display:inline-flex] [align-items:center] [gap:3px]"><span class="[width:7px] [height:7px] [border-radius:50%] [display:inline-block] [background:#d18a61]"></span>进行中</span>
            <span class="[display:inline-flex] [align-items:center] [gap:3px]"><span class="[width:7px] [height:7px] [border-radius:50%] [display:inline-block] [background:#f59e0b]"></span>即将截止</span>
            <span class="[display:inline-flex] [align-items:center] [gap:3px]"><span class="[width:7px] [height:7px] [border-radius:50%] [display:inline-block] [background:#d1d5db]"></span>未开始</span>
            <span class="[display:inline-flex] [align-items:center] [gap:3px]"><span class="[width:7px] [height:7px] [border-radius:50%] [display:inline-block] [background:#ef4444]"></span>逾期</span>
          </div>
        </div>
        <div class="cal-grid [margin-bottom:14px]">
          <div class="[display:grid] [grid-template-columns:repeat(7,_1fr)] [gap:3px] [text-align:center] [margin-bottom:5px]">
            <span v-for="w in ['一','二','三','四','五','六','日']" :key="w" class="[font-size:11px] [color:#9ca3af] [padding:4px_0] [font-weight:500]">{{ w }}</span>
          </div>
          <div v-for="(row, ri) in calendarRows" :key="ri" class="[display:grid] [grid-template-columns:repeat(7,_1fr)] [gap:3px] [text-align:center] [margin-bottom:3px]">
            <div v-for="(cell, ci) in row" :key="ci"
                 class="cal-cell [aspect-ratio:1] [display:flex] [align-items:center] [justify-content:center] [border-radius:6px] [font-size:13px] [font-weight:700] [border:1px_solid_#eef1f5] [transition:all_0.15s]"
                 :class="cell.title ? '[cursor:pointer] hover:[filter:brightness(0.9)]' : '[cursor:default]'"
                 :style="cell.style"
                 :title="cell.title || ''">
              {{ cell.date }}
            </div>
          </div>
        </div>
        <template v-if="calendarEvents.length">
          <div class="[display:flex] [flex-direction:column] [gap:6px] [margin-bottom:10px]">
            <div v-for="ev in calendarEvents" :key="ev.name"
                 class="[display:flex] [align-items:center] [gap:6px] [padding:5px_8px] [border-radius:8px] [cursor:pointer] [transition:all_0.15s] hover:[background:#f9fafb]"
                 @click="nav('/student/experiments')">
              <span class="[font-size:11px] [color:#6b7280] [flex-shrink:0] [width:38px] [font-weight:500]">{{ ev.date }}</span>
              <span class="[font-size:12px] [color:#1a1a2e] [flex:1] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [font-weight:500]">{{ ev.name }}</span>
              <span class="[font-size:10px] [color:#ef4444] [font-weight:600] [flex-shrink:0]">{{ ev.countdown }}</span>
            </div>
          </div>
          <div class="[text-align:right]">
            <a class="[font-size:11px] [color:#d18a61] [cursor:pointer] [font-weight:600] hover:[color:#ac6843]" @click="nav('/student/experiments')">查看全部日程 →</a>
          </div>
        </template>
      </div>

      <!-- 卡片2: 学习数据概览 -->
      <div v-if="hasWeeklyStats" class="dash-card [padding:18px]">
        <div class="dash-section-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:12px]">
          <span class="[font-size:15px] [font-weight:700] [color:#1a1a2e]">学习数据概览（本周）</span>
          <a class="[font-size:12px] [color:#d18a61] [cursor:pointer] [font-weight:600] hover:[color:#ac6843]" @click="nav('/student/learning-analysis')">查看详情</a>
        </div>
        <div class="stats-grid [display:grid] [grid-template-columns:repeat(4,_1fr)] [gap:8px] [margin-bottom:14px]">
          <div class="[text-align:center] [padding:10px_4px] [background:linear-gradient(135deg,_#f8fafd,_#f0f4f8)] [border-radius:10px] [border:1px_solid_#eef1f5]">
            <div class="[font-size:19px] [font-weight:800] [color:#1a1a2e]">{{ weeklyStats?.experimentDone || '0/0' }}</div><div class="[font-size:10px] [color:#8c959f] [margin-top:2px] [font-weight:500]">实验完成数</div>
          </div>
          <div class="[text-align:center] [padding:10px_4px] [background:linear-gradient(135deg,_#ecfdf5,_#d1fae5)] [border-radius:10px] [border:1px_solid_#a7f3d0]">
            <div class="[font-size:19px] [font-weight:800] [color:#059669]">{{ weeklyStats?.accuracy ?? '--' }}%</div><div class="[font-size:10px] [color:#6b7280] [margin-top:2px] [font-weight:500]">正确率</div>
          </div>
          <div class="[text-align:center] [padding:10px_4px] [background:linear-gradient(135deg,_#fbf1eb,_#f1d5c2)] [border-radius:10px] [border:1px_solid_#edd0bc]">
            <div class="[font-size:19px] [font-weight:800] [color:#ac6843]">{{ weeklyStats?.submissions ?? '--' }}</div><div class="[font-size:10px] [color:#6b7280] [margin-top:2px] [font-weight:500]">提交次数</div>
          </div>
          <div class="[text-align:center] [padding:10px_4px] [background:linear-gradient(135deg,_#faf5ff,_#ede9fe)] [border-radius:10px] [border:1px_solid_#c4b5fd]">
            <div class="[font-size:19px] [font-weight:800] [color:#7c3aed]">{{ weeklyStats?.studyHours ?? '--' }}h</div><div class="[font-size:10px] [color:#6b7280] [margin-top:2px] [font-weight:500]">学习时长</div>
          </div>
        </div>
        <div class="[font-size:11px] [color:#6b7280] [margin-bottom:6px] [font-weight:600]">学习时长趋势（小时）</div>
        <div ref="weeklyChartRef" class="[height:140px] [width:100%]"></div>
      </div>

      <!-- 卡片3: 最新反馈 -->
      <div v-if="feedbackList.length" class="dash-card [padding:18px]">
        <div class="dash-section-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:10px]">
          <span class="[font-size:15px] [font-weight:700] [color:#1a1a2e]">最新反馈</span>
          <a class="[font-size:12px] [color:#d18a61] [cursor:pointer] [font-weight:600] hover:[color:#ac6843]" @click="nav('/student/ai-report')">查看全部</a>
        </div>
        <div class="[display:flex] [flex-direction:column] [gap:0]">
          <div v-for="(fb, i) in feedbackList" :key="i"
               class="[display:flex] [align-items:flex-start] [gap:10px] [padding:10px_0]"
               :class="{ '[border-bottom:1px_solid_#f3f4f6]': i < feedbackList.length - 1 }">
            <span class="[flex-shrink:0] [margin-top:1px] [width:28px] [height:28px] [border-radius:8px] [display:flex] [align-items:center] [justify-content:center]" :style="feedbackIconStyle(fb)">
              <LucideIcon :name="feedbackIconName(fb)" :size="15" :stroke-width="2.1" />
            </span>
            <div class="[flex:1]">
              <div class="[font-size:12px] [color:#1a1a2e] [line-height:1.5] [font-weight:500]">{{ fb.msg }}</div>
              <div class="[font-size:10px] [color:#9ca3af] [margin-top:2px]">{{ fb.time }}</div>
            </div>
          </div>
        </div>
      </div>
      </template>
    </div>

    <!-- 回到顶部 -->
    <transition name="fade">
      <div v-if="showBackTop" class="[position:fixed] [bottom:28px] [right:28px] [width:42px] [height:42px] [border-radius:50%] [background:#fff] [box-shadow:0_2px_12px_rgba(0,0,0,0.1)] [display:flex] [align-items:center] [justify-content:center] [cursor:pointer] [z-index:200] [border:1px_solid_#e5e7eb] [transition:all_0.2s] hover:[box-shadow:0_4px_16px_rgba(0,0,0,0.15)] hover:[transform:translateY(-2px)]" @click="scrollToTop">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2.5" stroke-linecap="round"><path d="M18 15l-6-6-6 6"/></svg>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import logger from '@/utils/logger'
import { useExperimentStore } from '../../store'
import * as echarts from 'echarts'
import api, { apiClient } from '@/api'
import LucideIcon from '@/components/LucideIcon.vue'

const router = useRouter()
const experimentStore = useExperimentStore()
const loading = ref(true)
const loadError = ref(false)
const profileData = ref({})
const studentName = ref('')
const className = ref('')
const recentErrors = ref([])
const practiceRecommendations = ref([])
const recLoading = ref(false)
const recReason = ref('')
const showBackTop = ref(false)
const weeklyStats = ref(null)
const feedbackList = ref([])
const urgentRingRef = ref(null)
const weeklyChartRef = ref(null)
let urgentRingChart = null
let weeklyChart = null

function nav(path) { router.push(path) }

// ── 错误条目渲染辅助 ──
function errType(err) {
  const t = err.errorType || err.judgeStatus || ''
  if (t.includes('运行') || t.includes('RUNTIME')) return 'runtime'
  if (t.includes('输出') || t.includes('WRONG')) return 'wrong'
  return 'default'
}
function errIcon(err) {
  if (errType(err) === 'runtime') return 'bug'
  if (errType(err) === 'wrong') return 'circle-x'
  return 'alert-triangle'
}
function errIconStyle(err) {
  if (errType(err) === 'runtime') return { background: '#fef2f2', color: '#dc2626' }
  if (errType(err) === 'wrong') return { background: '#fff7ed', color: '#ea580c' }
  return { background: '#fef9f0', color: '#b45309' }
}
function errTagClass(err) {
  if (errType(err) === 'runtime') return '[background:#fef2f2] [color:#dc2626]'
  if (errType(err) === 'wrong') return '[background:#fff7ed] [color:#ea580c]'
  return '[background:#fef9f0] [color:#b45309]'
}
function errTagText(err) {
  if (errType(err) === 'runtime') return '运行错误'
  if (errType(err) === 'wrong') return '输出错误'
  return err.judgeStatus || '未通过'
}
function errDesc(err) {
  return err.errorMessage || err.errorDesc || err.reason || ''
}

function feedbackTone(fb) {
  const source = `${fb.icon || ''} ${fb.type || ''} ${fb.category || ''} ${fb.msg || ''}`
  if (source.includes('AI') || source.includes('分析') || source.includes('建议')) return 'insight'
  if (source.includes('完成') || source.includes('通过') || source.includes('优秀')) return 'success'
  if (source.includes('截止') || source.includes('提醒') || source.includes('逾期')) return 'warning'
  return 'default'
}
function feedbackIconName(fb) {
  if (feedbackTone(fb) === 'insight') return 'lightbulb'
  if (feedbackTone(fb) === 'success') return 'circle-check'
  if (feedbackTone(fb) === 'warning') return 'clock'
  return 'message-square'
}
function feedbackIconStyle(fb) {
  if (feedbackTone(fb) === 'insight') return { background: '#fbf1eb', color: '#ac6843' }
  if (feedbackTone(fb) === 'success') return { background: '#ecfdf5', color: '#059669' }
  if (feedbackTone(fb) === 'warning') return { background: '#fff7ed', color: '#ea580c' }
  return { background: '#f3f4f6', color: '#6b7280' }
}

// ── 快捷入口（静态配置） ──
const quickEntries = [
  { iconName: 'clipboard-text', label: '实验列表', path: '/student/experiments', bg: 'linear-gradient(135deg,#fbf1eb,#f1d5c2)', color: '#ac6843' },
  { iconName: 'circle-x', label: '错题本', path: '/student/wrong-notebook', bg: 'linear-gradient(135deg,#fef2f2,#fce4e4)', color: '#dc2626' },
  { iconName: 'check', label: '推荐练习', path: '/student/leetcode-search', bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', color: '#059669' },
  { iconName: 'brain', label: '知识图谱', path: '/student/knowledge-graph', bg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', color: '#ea580c' },
  { iconName: 'bot', label: 'AI 学习助手', path: '/student/ai-assistant', bg: 'linear-gradient(135deg,#fbf1eb,#edd0bc)', color: '#d18a61' }
]

// ── 日历 ──
function calColor(type) {
  if (type === 'done') return { background: '#d1fae5', color: '#065f46' }
  if (type === 'progress') return { background: '#f1d5c2', color: '#8f4f31' }
  if (type === 'soon') return { background: '#fef3c7', color: '#92400e' }
  if (type === 'overdue') return { background: '#fce4e4', color: '#b91c1c' }
  return { background: '#fff', color: '#1f2937' }
}
function makeCell(date, type, title) {
  const c = calColor(type)
  return { date, cls: '', style: { background: c.background, color: c.color }, title: title || '' }
}
function buildCalendarRows(experiments) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  const rows = []
  const expMap = new Map()
  if (Array.isArray(experiments)) {
    experiments.filter(e => e.deadline).forEach(e => {
      const d = new Date(e.deadline)
      const key = d.getDate()
      if (!expMap.has(key)) expMap.set(key, [])
      expMap.get(key).push(e)
    })
  }
  for (let week = 0; week < 3; week++) {
    const row = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + week * 7 + i)
      const dateNum = d.getDate()
      const exps = expMap.get(dateNum) || []
      let type = '', title = ''
      if (exps.length) {
        const hasOverdue = exps.some(e => new Date(e.deadline) < now && e.status !== 'completed')
        const hasDone = exps.some(e => e.status === 'completed')
        const hasSoon = exps.some(e => {
          const days = Math.ceil((new Date(e.deadline) - now) / 86400000)
          return days >= 0 && days <= 2 && e.status !== 'completed'
        })
        const hasProgress = exps.some(e => e.status === 'in_progress' && !hasOverdue && !hasSoon)
        if (hasOverdue) type = 'overdue'
        else if (hasSoon) type = 'soon'
        else if (hasProgress) type = 'progress'
        else if (hasDone) type = 'done'
        title = exps.map(e => e.name).join(', ')
      }
      row.push(makeCell(dateNum, type, title))
    }
    rows.push(row)
  }
  return rows
}

const calendarRows = computed(() => buildCalendarRows(experimentStore.experimentList))
const calendarEvents = computed(() => {
  const list = experimentStore.experimentList
  if (!Array.isArray(list)) return []
  return list.filter(e => e.deadline).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4).map(e => ({
    date: formatDateShort(e.deadline),
    name: e.name,
    countdown: countdownText(e.deadline)
  }))
})

const urgentExperiment = computed(() => {
  const list = experimentStore.experimentList
  if (!Array.isArray(list) || !list.length) return null
  const inProgress = list.filter(e => e.status === 'in_progress' || e.status === 'not_started')
  if (!inProgress.length) return list[0]
  return [...inProgress].sort((a, b) => {
    if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline)
    if (a.deadline) return -1
    if (b.deadline) return 1
    return 0
  })[0]
})

const urgentPassRate = computed(() => {
  const e = urgentExperiment.value
  if (!e || !e.problemCount) return 0
  return Math.round((e.acceptedProblemCount || 0) / e.problemCount * 100)
})

const urgentFailCount = computed(() => {
  const e = urgentExperiment.value
  if (!e) return 0
  return (e.problemCount || 0) - (e.acceptedProblemCount || 0)
})

const urgentCountdown = computed(() => {
  const e = urgentExperiment.value
  if (!e?.deadline) return ''
  return countdownText(e.deadline)
})

// 仅当 weekly-stats 接口真实返回数据时显示学习数据卡片
const hasWeeklyStats = computed(() => {
  const w = weeklyStats.value
  if (!w) return false
  return w.experimentDone != null || w.accuracy != null || w.submissions != null || w.studyHours != null
})

function formatTime(t) {
  if (!t) return ''
  try {
    const d = new Date(t)
    if (isNaN(d.getTime())) return ''
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff/60000)} 分钟前`
    if (diff < 86400000) return `今天 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    if (diff < 172800000) return `昨天 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    return `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  } catch { return '' }
}

function countdownText(t) {
  if (!t) return ''
  const d = new Date(t), now = new Date()
  const days = Math.ceil((d - now) / 86400000)
  if (days < 0) return '已逾期'
  if (days === 0) {
    const hrs = Math.ceil((d - now) / 3600000)
    return hrs <= 0 ? '即将截止' : `距截止 ${hrs} 小时`
  }
  if (days === 1) {
    const hrs = Math.ceil((d - now) / 3600000)
    const mins = Math.ceil((d - now) / 60000) % 60
    return `距截止 ${hrs} 小时 ${mins} 分`
  }
  return `距截止 ${days} 天`
}

function goToPractice(rec) {
  if (rec.source !== 'LeetCode') {
    nav('/student/leetcode-search')
    return
  }

  const problemId = toPositiveId(rec.problemId)
  if (!problemId) {
    nav('/student/leetcode-search')
    return
  }

  const query = {}
  if (rec.requestId) {
    query.recommendationRequestId = rec.requestId
    query.recommendationSessionId = ensureRecommendationSessionId()
  }

  router.push({
    path: `/student/leetcode-practice/${problemId}`,
    query: Object.keys(query).length ? query : undefined
  })
}

async function refreshRecommendations() {
  recLoading.value = true
  try { await loadRecommendations() } finally { recLoading.value = false }
}

async function loadRecommendations() {
  try {
    const [ptaRes, lcRes] = await Promise.allSettled([api.getPtaPracticeSets(), api.getRecommendedPractices()])
    const items = []
    if (ptaRes.status === 'fulfilled' && ptaRes.value) {
      const list = Array.isArray(ptaRes.value) ? ptaRes.value : (ptaRes.value?.data || ptaRes.value?.items || [])
      list.slice(0, 2).forEach(item => {
        items.push({ title: item.name || 'PTA 练习', source: 'PTA', tag: item.offeringId ? `7-${item.id || '?'}` : '推荐', _diffLabel: '简单', _diffClass: '[color:#059669] [background:#ecfdf5]', path: '/student/leetcode-search' })
      })
    }
    if (lcRes.status === 'fulfilled' && lcRes.value) {
      const list = Array.isArray(lcRes.value) ? lcRes.value : (lcRes.value?.items || lcRes.value?.data || [])
      const leetcodeItems = list
        .map(item => {
          const problem = item?.problem || {}
          const title = getRecommendationTitle(item)
          if (!title) return null

          const difficulty = getRecommendationDifficulty(problem.difficulty || item.difficulty)
          const tags = getRecommendationTags(item)
          return {
            title,
            source: 'LeetCode',
            tag: tags[0] || '推荐拓展',
            _diffLabel: difficulty.label,
            _diffClass: difficulty.className,
            problemId: toPositiveId(problem.problemId || item.problemId || problem.id),
            requestId: item.requestId || null,
            reason: item.reasonText || item.reason || '',
            sourceUrl: problem.sourceUrl || item.sourceUrl || '',
            path: '/student/leetcode-search'
          }
        })
        .filter(Boolean)
        .slice(0, Math.max(0, 3 - items.length))
      items.push(...leetcodeItems)
    }
    if (items.length) practiceRecommendations.value = items.slice(0, 3)
  } catch (e) { logger.warn('加载推荐练习失败:', e) }
}

function getRecommendationTitle(item) {
  const problem = item?.problem || {}
  const title = String(problem.title || problem.titleMain || problem.titleAlt || item?.title || item?.name || '').trim()
  return title && title !== 'LeetCode 题目' ? title : ''
}

function getRecommendationTags(item) {
  const tags = item?.problem?.tags || item?.tags
  if (!Array.isArray(tags)) return []
  return tags
    .map(tag => typeof tag === 'string' ? tag.trim() : String(tag?.tagName || tag?.name || '').trim())
    .filter(Boolean)
}

function getRecommendationDifficulty(value) {
  const difficulty = String(value || '').trim().toLowerCase()
  if (difficulty === 'easy') {
    return { label: '简单', className: '[color:#059669] [background:#ecfdf5]' }
  }
  if (difficulty === 'hard') {
    return { label: '困难', className: '[color:#dc2626] [background:#fef2f2]' }
  }
  return { label: '中等', className: '[color:#b45309] [background:#fff7ed]' }
}

function toPositiveId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function ensureRecommendationSessionId() {
  if (typeof window === 'undefined') return ''
  const storageKey = 'leetcode_recommendation_session_id'
  const existing = window.sessionStorage.getItem(storageKey)
  if (existing) return existing

  const sessionId = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  window.sessionStorage.setItem(storageKey, sessionId)
  return sessionId
}

// ── 图表 ──
function initUrgentRing() {
  if (!urgentRingRef.value) return
  if (urgentRingChart) urgentRingChart.dispose()
  urgentRingChart = echarts.init(urgentRingRef.value)
  const rate = urgentExperiment.value ? urgentPassRate.value : 0
  if (!urgentExperiment.value) {
    urgentRingChart.setOption({
      series: [{ type: 'pie', radius: ['68%', '82%'], center: ['50%', '50%'], silent: true, labelLine: { show: false },
        label: { show: true, position: 'center', formatter: '--', fontSize: 18, fontWeight: 'bold', color: '#9ca3af' },
        data: [{ value: 1, itemStyle: { color: '#f3f4f6', borderRadius: 6 } }] }]
    })
    return
  }
  urgentRingChart.setOption({
    series: [{
      type: 'pie', radius: ['68%', '82%'], center: ['50%', '50%'], silent: true, labelLine: { show: false },
      label: { show: true, position: 'center', formatter: `${rate}%`, fontSize: 18, fontWeight: 'bold', color: '#d18a61' },
      data: [
        { value: rate, name: '通过', itemStyle: { color: '#d18a61', borderRadius: 6 } },
        { value: 100 - rate, name: '未通过', itemStyle: { color: '#fbf1eb' } }
      ]
    }]
  })
}

function initWeeklyChart() {
  if (!weeklyChartRef.value) return
  if (weeklyChart) weeklyChart.dispose()
  weeklyChart = echarts.init(weeklyChartRef.value)
  const chartData = weeklyStats.value?.chartData || { dates: [], values: [] }
  const dates = chartData.dates?.length ? chartData.dates : []
  const data = chartData.values?.length ? chartData.values : []
  weeklyChart.setOption({
    tooltip: { trigger: 'axis', formatter: p => `${p[0].name}<br/>学习时长 ${p[0].value}h` },
    grid: { left: 32, right: 8, bottom: 20, top: 6 },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 9, color: '#9ca3af', rotate: 30 }, axisLine: { lineStyle: { color: '#e5e7eb' } } },
    yAxis: { type: 'value', min: 0, name: 'h', splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } }, axisLabel: { fontSize: 9, color: '#9ca3af' } },
    series: [{
      type: 'line', data: data, smooth: true, symbolSize: 4,
      lineStyle: { color: '#d18a61', width: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0,color:'rgba(209, 138, 97,0.15)'},{offset:1,color:'rgba(209, 138, 97,0)'}]) },
      itemStyle: { color: '#d18a61' }
    }]
  })
}

function handleScroll() { showBackTop.value = window.scrollY > 300 }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
function formatDateShort(t) {
  if (!t) return ''
  try { const d = new Date(t); return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` } catch { return '' }
}

async function loadData() {
  loading.value = true
  loadError.value = false
  try {
    await experimentStore.fetchExperimentList()
    const [profileRes, wrongRes, weeklyRes, feedbackRes] = await Promise.allSettled([
      api.getMyProfile(),
      apiClient.get('/api/student/wrong-questions', { params: { limit: 3, offset: 0 } }),
      apiClient.get('/api/student/dashboard/weekly-stats').catch(() => null),
      apiClient.get('/api/student/dashboard/feedback').catch(() => null)
    ])
    if (profileRes.status === 'fulfilled' && profileRes.value) {
      const d = profileRes.value?.data || profileRes.value || {}
      profileData.value = d
      studentName.value = d?.realName || d?.studentName || d?.username || d?.name ||
        JSON.parse(localStorage.getItem('userInfo') || '{}')?.realName ||
        JSON.parse(localStorage.getItem('userInfo') || '{}')?.username || ''
      className.value = d?.class || d?.className ||
        JSON.parse(localStorage.getItem('userInfo') || '{}')?.class || ''
    }
    if (wrongRes.status === 'fulfilled' && wrongRes.value) {
      const wdata = wrongRes.value?.data || wrongRes.value || {}
      const wlist = Array.isArray(wdata) ? wdata : (wdata?.items || wdata?.records || wdata?.data || [])
      recentErrors.value = wlist.slice(0, 3)
    }
    if (weeklyRes.status === 'fulfilled' && weeklyRes.value) {
      weeklyStats.value = weeklyRes.value?.data || weeklyRes.value || null
    } else {
      weeklyStats.value = null
    }
    if (feedbackRes.status === 'fulfilled' && feedbackRes.value) {
      const fdata = feedbackRes.value?.data || feedbackRes.value || {}
      const flist = Array.isArray(fdata) ? fdata : (fdata?.items || fdata?.data || [])
      feedbackList.value = flist.slice(0, 3)
    }
    await loadRecommendations()
    loading.value = false
    await nextTick()
    setTimeout(() => { initUrgentRing(); initWeeklyChart() }, 300)
  } catch (e) {
    logger.error('Dashboard loadData error:', e)
    loadError.value = true
    loading.value = false
    await nextTick()
    setTimeout(() => { initUrgentRing(); initWeeklyChart() }, 300)
  }
}

function handleResize() { urgentRingChart?.resize(); weeklyChart?.resize() }
onMounted(() => { loadData(); window.addEventListener('scroll', handleScroll); window.addEventListener('resize', handleResize) })
onBeforeUnmount(() => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('resize', handleResize); urgentRingChart?.dispose(); weeklyChart?.dispose() })
</script>

<style scoped>
/* 统一卡片基类 */
.dash-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0f0f3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.dash-welcome {
  background: linear-gradient(135deg, #fbfdff 0%, #ffffff 100%);
  border: 1px solid #eef1f5;
}
.dash-card-urgent {
  background: linear-gradient(135deg, #fffaf7 0%, #fbf1eb 100%);
  border-radius: 16px;
  border: 1px solid #ead6c5;
  box-shadow: 0 1px 4px rgba(209, 138, 97, 0.08);
}

.dash-right {
  width: 100%;
  position: sticky;
  top: 16px;
  align-self: flex-start;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}
.dash-right::-webkit-scrollbar { width: 4px; }
.dash-right::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

.dash-spin {
  animation: dash-spin 0.9s linear infinite;
}

@keyframes dash-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 响应式：窄屏右侧栏堆叠到主内容下方 */
@media (min-width: 1101px) {
  .dash-right { width: 320px; flex-shrink: 0; }
}
@media (max-width: 1100px) {
  .dash-page { flex-direction: column; }
  .dash-right { position: static; max-height: none; }
  .rec-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
@media (max-width: 760px) {
  .rec-grid { grid-template-columns: 1fr !important; }
  .quick-grid { grid-template-columns: repeat(3, 1fr) !important; }
  .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
</style>
