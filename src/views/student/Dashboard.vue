<template>
  <div class="dash-page [display:flex] [gap:16px] [min-height:100%]">

    <!-- ====== 中间主内容区 ====== -->
    <div class="dash-center [flex:1] [min-width:0] [display:flex] [flex-direction:column] [gap:16px]">

      <!-- 模块1: 欢迎问候卡片 -->
      <div class="dash-card [background:linear-gradient(135deg,_#f8fafd_0%,_#ffffff_100%)] [border-radius:16px] [padding:24px_28px] [box-shadow:0_1px_3px_rgba(0,0,0,0.05)] [display:flex] [align-items:center] [justify-content:space-between] [border:1px_solid_#eef1f5]">
        <div>
          <div class="[font-size:24px] [font-weight:700] [color:#1a1a2e]">你好，{{ studentName }} <span style="font-size:26px">🙋</span></div>
          <div class="[font-size:14px] [color:#8c959f] [margin-top:6px]">今天也要加油学习哦！</div>
        </div>
        <div class="[width:120px] [height:80px] [display:flex] [align-items:center] [justify-content:center] [background:linear-gradient(135deg,_#eef6ff,_#e3effb)] [border-radius:12px] [border:1px_solid_#d6e6f5]">
          <svg width="72" height="60" viewBox="0 0 72 60" fill="none"><rect x="4" y="36" width="64" height="5" rx="2" fill="#c8ddf5"/><rect x="10" y="24" width="52" height="16" rx="3" fill="#3b82f6"/><rect x="14" y="26" width="44" height="3" rx="1" fill="#fff" opacity="0.6"/><rect x="14" y="31" width="30" height="3" rx="1" fill="#fff" opacity="0.35"/><circle cx="36" cy="14" r="8" fill="#fbbf8c"/><rect x="32" y="22" width="8" height="4" rx="2" fill="#fbbf8c"/><rect x="29" y="20" width="14" height="4" rx="2" fill="#2d3142"/></svg>
        </div>
      </div>

      <!-- 模块2: 当前最紧急的实验 -->
      <div class="dash-card-urgent [background:linear-gradient(135deg,_#fffbeb_0%,_#fef7ed_50%,_#fff8f0_100%)] [border-radius:16px] [padding:20px_24px] [border:1px_solid_#fde4c2] [box-shadow:0_1px_4px_rgba(245,158,11,0.06)]">
        <div class="[display:flex] [align-items:center] [gap:8px] [margin-bottom:16px]">
          <span class="[width:26px] [height:26px] [border-radius:50%] [background:#fef3c7] [display:flex] [align-items:center] [justify-content:center] [font-size:14px]">🔥</span>
          <span class="[font-size:13px] [font-weight:700] [color:#92400e]">当前最紧急的实验</span>
          <span v-if="urgentCountdown" class="[font-size:12px] [color:#b45309] [font-weight:600] [margin-left:auto] [background:#fef3c7] [padding:3px_10px] [border-radius:100px]">⏱ {{ urgentCountdown }}</span>
        </div>
        <div class="[display:flex] [gap:24px]">
          <div class="[flex:1]">
            <div class="[font-size:17px] [font-weight:700] [color:#1a1a2e] [margin-bottom:6px]">
              {{ urgentExperiment?.name || '暂无实验' }}
              <span class="[font-size:11px] [padding:2px_10px] [border-radius:100px] [background:linear-gradient(135deg,_#fef3c7,_#fde4c2)] [color:#b45309] [font-weight:600] [margin-left:8px] [border:1px_solid_#fde4c2]">部分测试未通过</span>
            </div>
            <div class="[font-size:12px] [color:#6b7280] [margin-bottom:8px] [line-height:1.7]">
              所属实验：{{ urgentExperiment?.name || '--' }} · 题目数：{{ urgentExperiment?.problemCount || 0 }} · 最近提交：{{ formatTime(urgentExperiment?.submitTime) || '暂无' }}
            </div>
            <div class="[display:flex] [align-items:center] [gap:16px] [margin-bottom:14px]">
              <span class="[font-size:13px] [color:#1a1a2e]">通过率：<strong class="[color:#b45309]">{{ urgentPassRate }}%</strong> ({{ urgentExperiment?.acceptedProblemCount || 0 }}/{{ urgentExperiment?.problemCount || 0 }})</span>
              <span class="[font-size:13px] [color:#ef4444] [font-weight:600]">未通过 {{ urgentFailCount }} 个测试点</span>
            </div>
            <div class="[display:flex] [gap:10px]">
              <UiButton class="[background:linear-gradient(135deg,_#f59e0b,_#d97706)] [color:#fff] [border:none] [border-radius:100px] [padding:8px_22px] [font-size:13px] [font-weight:600] [cursor:pointer] [box-shadow:0_2px_6px_rgba(245,158,11,0.25)] hover:[background:linear-gradient(135deg,_#d97706,_#b45309)] hover:[box-shadow:0_4px_12px_rgba(245,158,11,0.35)]" @click="nav('/student/experiment-detail/' + urgentExperiment?.id)">继续修改</UiButton>
              <UiButton class="[background:#fff] [border:1px_solid_#e5e7eb] [border-radius:100px] [padding:8px_22px] [font-size:13px] [color:#6b7280] [font-weight:500] [cursor:pointer] hover:[background:#f9fafb] hover:[border-color:#d1d5db]" @click="nav('/student/experiment-detail/' + urgentExperiment?.id)">查看错误详情</UiButton>
            </div>
          </div>
          <div class="[display:flex] [align-items:center] [gap:14px] [flex-shrink:0]">
            <div ref="urgentRingRef" class="[width:90px] [height:90px]"></div>
            <svg width="56" height="48" viewBox="0 0 56 48" fill="none"><rect x="2" y="2" width="52" height="38" rx="4" fill="#fef9f0" stroke="#fde4c2" stroke-width="1"/><rect x="8" y="8" width="40" height="24" rx="2" fill="#fff"/><path d="M22 22l3 3 6-6" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="46" cy="40" r="4" fill="#fde4c2"/></svg>
          </div>
        </div>
      </div>

      <!-- 模块3: 最近未解决的错误 -->
      <div class="dash-card [background:#fff] [border-radius:16px] [padding:20px_24px] [box-shadow:0_1px_3px_rgba(0,0,0,0.05)] [border:1px_solid_#f0f0f3]">
        <div class="dash-section-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:14px]">
          <span class="[font-size:15px] [font-weight:700] [color:#1a1a2e]">最近未解决的错误（{{ recentErrors.length }}）</span>
          <a class="[font-size:13px] [color:#3b82f6] [cursor:pointer] [font-weight:600] hover:[color:#2563eb]" @click="nav('/student/wrong-notebook')">查看全部 →</a>
        </div>
        <div class="[display:flex] [flex-direction:column]">
          <template v-if="recentErrors.length">
            <div v-for="(err, i) in recentErrors" :key="err.id || i"
                 class="[display:flex] [align-items:center] [gap:14px] [padding:14px_0]"
                 :class="{ '[border-bottom:1px_solid_#f3f4f6]': i < recentErrors.length - 1 }">
              <span class="[font-size:20px] [flex-shrink:0] [width:36px] [height:36px] [border-radius:10px] [display:flex] [align-items:center] [justify-content:center]" :class="errIconBg(err)">{{ errIcon(err) }}</span>
              <div class="[flex:1] [min-width:0]">
                <div class="[font-size:14px] [font-weight:600] [color:#1a1a2e]">{{ err.problemTitle || '未知题目' }}
                  <span class="[font-size:12px] [color:#8c959f] [font-weight:400]" v-if="err.experimentName">· {{ err.experimentName }}</span>
                </div>
                <div class="[font-size:12px] [color:#6b7280] [margin-top:2px]" v-if="errDesc(err)">{{ errDesc(err) }}</div>
                <div class="[font-size:11px] [color:#9ca3af] [margin-top:2px]">提交时间 {{ formatTime(err.lastWrongAt) }}</div>
              </div>
              <span :class="errTagClass(err)" class="[font-size:11px] [padding:3px_10px] [border-radius:100px] [font-weight:600] [flex-shrink:0] [letter-spacing:0.01em]">{{ errTagText(err) }}</span>
              <UiButton class="[background:#fff] [border:1px_solid_#e5e7eb] [border-radius:100px] [padding:5px_14px] [font-size:12px] [color:#3b82f6] [cursor:pointer] [font-weight:500] hover:[background:#eff6ff] hover:[border-color:#3b82f6]" @click="nav('/student/wrong-notebook')">查看详情</UiButton>
            </div>
          </template>
          <div v-else class="[text-align:center] [padding:20px] [color:#9ca3af] [font-size:13px]">暂无未解决的错误</div>
        </div>
      </div>

      <!-- 模块4: 今日推荐练习 -->
      <div class="dash-card [background:#fff] [border-radius:16px] [padding:20px_24px] [box-shadow:0_1px_3px_rgba(0,0,0,0.05)] [border:1px_solid_#f0f0f3]">
        <div class="dash-section-head [display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:8px]">
          <span class="[font-size:15px] [font-weight:700] [color:#1a1a2e]">今日推荐练习（基于你的薄弱点）</span>
          <UiButton class="[background:#fff] [border:1px_solid_#e5e7eb] [border-radius:100px] [padding:5px_14px] [font-size:12px] [color:#6b7280] [cursor:pointer] [font-weight:500] hover:[background:#f9fafb] hover:[border-color:#d1d5db]" @click="refreshRecommendations" :disabled="recLoading">🔄 换一批</UiButton>
        </div>
        <div class="[font-size:12px] [color:#6b7280] [margin-bottom:14px] [padding:8px_12px] [background:linear-gradient(135deg,_#f8fafd,_#f0f4ff)] [border-radius:8px] [border:1px_solid_#e8edf5]">
          💡 推荐原因：{{ recReason || '根据你的学习数据，为你推荐以下针对性练习' }}
        </div>
        <div class="[display:grid] [grid-template-columns:repeat(3,_1fr)] [gap:12px]">
          <div v-for="(rec, i) in practiceRecommendations" :key="i"
               class="[padding:16px] [border:1px_solid_#eef1f5] [border-radius:12px] [cursor:pointer] [transition:all_0.2s] [background:#fafbfc] hover:[border-color:#c8ddf5] hover:[background:#fff] hover:[box-shadow:0_4px_12px_rgba(59,130,246,0.08)]" @click="goToPractice(rec)">
            <div class="[display:flex] [align-items:center] [gap:8px] [margin-bottom:8px]">
              <span class="[font-size:11px] [padding:2px_8px] [border-radius:100px] [font-weight:600] [letter-spacing:0.02em]" :class="rec.source === 'PTA' ? '[background:#eff6ff] [color:#3b82f6]' : '[background:#fef3c7] [color:#92400e]'">{{ rec.source }}</span>
              <span class="[font-size:12px] [font-weight:500] [color:#8c959f] [margin-left:auto]">{{ rec.source === 'PTA' ? 'PTA | ' + rec.tag : rec.tag }}</span>
            </div>
            <div class="[font-size:11px] [padding:2px_8px] [border-radius:100px] [display:inline-block] [margin-bottom:12px] [font-weight:500]" :class="rec._diffClass">{{ rec._diffLabel }}</div>
            <div class="[font-size:14px] [font-weight:700] [color:#1a1a2e] [margin-bottom:14px] [line-height:1.4]">{{ rec.title }}</div>
            <UiButton class="[width:100%] [background:linear-gradient(135deg,_#3b82f6,_#2563eb)] [color:#fff] [border:none] [border-radius:100px] [padding:7px_0] [font-size:12px] [cursor:pointer] [font-weight:600] hover:[background:linear-gradient(135deg,_#2563eb,_#1d4ed8)]" @click.stop="goToPractice(rec)">开始练习</UiButton>
          </div>
        </div>
      </div>

      <!-- 模块5: 快速入口 -->
      <div class="dash-card [background:#fff] [border-radius:16px] [padding:18px_20px] [box-shadow:0_1px_3px_rgba(0,0,0,0.05)] [border:1px_solid_#f0f0f3]">
        <div class="[font-size:15px] [font-weight:700] [color:#1a1a2e] [margin-bottom:14px]">快速入口</div>
        <div class="[display:grid] [grid-template-columns:repeat(6,_1fr)] [gap:8px]">
          <div v-for="q in quickEntries" :key="q.label"
               class="[display:flex] [flex-direction:column] [align-items:center] [gap:8px] [padding:12px_4px] [border-radius:12px] [cursor:pointer] [transition:all_0.2s] hover:[transform:translateY(-2px)]"
               @click="nav(q.path)">
            <span class="[width:42px] [height:42px] [border-radius:12px] [display:flex] [align-items:center] [justify-content:center] [font-size:20px] [box-shadow:0_2px_6px_rgba(0,0,0,0.06)]" :style="{ background: q.bg, color: q.color }">{{ q.icon }}</span>
            <span class="[font-size:11px] [color:#4b5563] [font-weight:600]">{{ q.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 右侧固定信息侧边栏 ====== -->
    <div class="dash-right [width:320px] [flex-shrink:0] [display:flex] [flex-direction:column] [gap:14px]">
      <!-- 卡片1: 本周实验日历 -->
      <div class="dash-card [background:#fff] [border-radius:16px] [padding:18px] [box-shadow:0_1px_3px_rgba(0,0,0,0.05)] [border:1px_solid_#f0f0f3]">
        <div class="[margin-bottom:12px]">
          <div class="[font-size:15px] [font-weight:700] [color:#1a1a2e] [margin-bottom:8px]">本周实验日历</div>
          <div class="[display:flex] [gap:6px] [align-items:center] [font-size:10px] [color:#8c959f] [flex-wrap:wrap]">
            <span class="[display:inline-flex] [align-items:center] [gap:3px]"><span class="[width:7px] [height:7px] [border-radius:50%] [display:inline-block] [background:#10b981]"></span>已完成</span>
            <span class="[display:inline-flex] [align-items:center] [gap:3px]"><span class="[width:7px] [height:7px] [border-radius:50%] [display:inline-block] [background:#3b82f6]"></span>进行中</span>
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
          <a class="[font-size:11px] [color:#3b82f6] [cursor:pointer] [font-weight:600] hover:[color:#2563eb]" @click="nav('/student/experiments')">查看全部日程 →</a>
        </div>
      </div>

      <!-- 卡片2: 学习数据概览 -->
      <div class="dash-card [background:#fff] [border-radius:16px] [padding:18px] [box-shadow:0_1px_3px_rgba(0,0,0,0.05)] [border:1px_solid_#f0f0f3]">
        <div class="[display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:12px]">
          <span class="[font-size:15px] [font-weight:700] [color:#1a1a2e]">学习数据概览（本周）</span>
          <a class="[font-size:12px] [color:#3b82f6] [cursor:pointer] [font-weight:600] hover:[color:#2563eb]" @click="nav('/student/learning-analysis')">查看详情</a>
        </div>
        <div class="[display:grid] [grid-template-columns:repeat(4,_1fr)] [gap:8px] [margin-bottom:14px]">
          <div class="[text-align:center] [padding:10px_4px] [background:linear-gradient(135deg,_#f8fafd,_#f0f4f8)] [border-radius:10px] [border:1px_solid_#eef1f5]">
            <div class="[font-size:19px] [font-weight:800] [color:#1a1a2e]">{{ weeklyStats?.experimentDone || '0/0' }}</div><div class="[font-size:10px] [color:#8c959f] [margin-top:2px] [font-weight:500]">实验完成数</div>
          </div>
          <div class="[text-align:center] [padding:10px_4px] [background:linear-gradient(135deg,_#ecfdf5,_#d1fae5)] [border-radius:10px] [border:1px_solid_#a7f3d0]">
            <div class="[font-size:19px] [font-weight:800] [color:#059669]">{{ weeklyStats?.accuracy ?? '--' }}%</div><div class="[font-size:10px] [color:#6b7280] [margin-top:2px] [font-weight:500]">正确率</div>
          </div>
          <div class="[text-align:center] [padding:10px_4px] [background:linear-gradient(135deg,_#eff6ff,_#dbeafe)] [border-radius:10px] [border:1px_solid_#bfdbfe]">
            <div class="[font-size:19px] [font-weight:800] [color:#2563eb]">{{ weeklyStats?.submissions ?? '--' }}</div><div class="[font-size:10px] [color:#6b7280] [margin-top:2px] [font-weight:500]">提交次数</div>
          </div>
          <div class="[text-align:center] [padding:10px_4px] [background:linear-gradient(135deg,_#faf5ff,_#ede9fe)] [border-radius:10px] [border:1px_solid_#c4b5fd]">
            <div class="[font-size:19px] [font-weight:800] [color:#7c3aed]">{{ weeklyStats?.studyHours ?? '--' }}h</div><div class="[font-size:10px] [color:#6b7280] [margin-top:2px] [font-weight:500]">学习时长</div>
          </div>
        </div>
        <div class="[font-size:11px] [color:#6b7280] [margin-bottom:6px] [font-weight:600]">学习时长趋势（小时）</div>
        <div ref="weeklyChartRef" class="[height:140px] [width:100%]"></div>
      </div>

      <!-- 卡片3: 最新反馈 -->
      <div class="dash-card [background:#fff] [border-radius:16px] [padding:18px] [box-shadow:0_1px_3px_rgba(0,0,0,0.05)] [border:1px_solid_#f0f0f3]">
        <div class="[display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:10px]">
          <span class="[font-size:15px] [font-weight:700] [color:#1a1a2e]">最新反馈</span>
          <a class="[font-size:12px] [color:#3b82f6] [cursor:pointer] [font-weight:600] hover:[color:#2563eb]" @click="nav('/student/ai-report')">查看全部</a>
        </div>
        <div class="[display:flex] [flex-direction:column] [gap:0]">
          <div v-for="(fb, i) in feedbackList" :key="i"
               class="[display:flex] [align-items:flex-start] [gap:10px] [padding:10px_0]"
               :class="{ '[border-bottom:1px_solid_#f3f4f6]': i < feedbackList.length - 1 }">
            <span class="[font-size:16px] [flex-shrink:0] [margin-top:1px] [width:28px] [height:28px] [border-radius:8px] [display:flex] [align-items:center] [justify-content:center] [background:#f3f4f6]">{{ fb.icon }}</span>
            <div class="[flex:1]">
              <div class="[font-size:12px] [color:#1a1a2e] [line-height:1.5] [font-weight:500]">{{ fb.msg }}</div>
              <div class="[font-size:10px] [color:#9ca3af] [margin-top:2px]">{{ fb.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 回到顶部 -->
    <transition name="fade">
      <div v-if="showBackTop" class="[position:fixed] [bottom:28px] [right:28px] [width:42px] [height:42px] [border-radius:50%] [background:#fff] [box-shadow:0_2px_12px_rgba(0,0,0,0.1)] [display:flex] [align-items:center] [justify-content:center] [cursor:pointer] [z-index:200] [border:1px_solid_#e5e7eb] hover:[box-shadow:0_4px_16px_rgba(0,0,0,0.15)] hover:[transform:translateY(-2px)] [transition:all_0.2s]" @click="scrollToTop">
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

const router = useRouter()
const experimentStore = useExperimentStore()
const loading = ref(true)
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
function errIcon(err) {
  const t = err.errorType || err.judgeStatus || ''
  if (t.includes('运行') || t.includes('RUNTIME')) return '🐛'
  if (t.includes('输出') || t.includes('WRONG')) return '📂'
  return '📋'
}
function errIconBg(err) {
  const t = err.errorType || err.judgeStatus || ''
  if (t.includes('运行') || t.includes('RUNTIME')) return '[background:#fef2f2]'
  if (t.includes('输出') || t.includes('WRONG')) return '[background:#fff7ed]'
  return '[background:#f0f9ff]'
}
function errTagClass(err) {
  const t = err.errorType || err.judgeStatus || ''
  if (t.includes('运行') || t.includes('RUNTIME')) return '[background:#fef2f2] [color:#dc2626]'
  if (t.includes('输出') || t.includes('WRONG')) return '[background:#fff7ed] [color:#ea580c]'
  return '[background:#fef9f0] [color:#b45309]'
}
function errTagText(err) {
  const t = err.errorType || err.judgeStatus || ''
  if (t.includes('运行') || t.includes('RUNTIME')) return '运行错误'
  if (t.includes('输出') || t.includes('WRONG')) return '输出错误'
  return err.judgeStatus || '未通过'
}
function errDesc(err) {
  return err.errorMessage || err.errorDesc || err.reason || ''
}

// ── 快捷入口（静态配置） ──
const quickEntries = [
  { icon: '📋', label: '实验列表', path: '/student/experiments', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', color: '#2563eb' },
  { icon: '📕', label: '错题本', path: '/student/wrong-notebook', bg: 'linear-gradient(135deg,#fef2f2,#fce4e4)', color: '#dc2626' },
  { icon: '✅', label: '推荐练习', path: '/student/practice', bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', color: '#059669' },
  { icon: '🎯', label: '专项训练', path: '/student/weakness-training', bg: 'linear-gradient(135deg,#faf5ff,#ede9fe)', color: '#7c3aed' },
  { icon: '🧠', label: '知识图谱', path: '/student/knowledge-graph', bg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', color: '#ea580c' },
  { icon: '🤖', label: 'AI 学习助手', path: '/student/ai-assistant', bg: 'linear-gradient(135deg,#eff6ff,#bfdbfe)', color: '#3b82f6' }
]

// ── 日历 ──
function calColor(type) {
  if (type === 'done') return { background: '#d1fae5', color: '#065f46' }
  if (type === 'progress') return { background: '#dbeafe', color: '#1e40af' }
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
  if (rec.source === 'LeetCode') nav('/student/leetcode-search')
  else nav('/student/practice')
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
        items.push({ title: item.name || 'PTA 练习', source: 'PTA', tag: item.offeringId ? `7-${item.id || '?'}` : '推荐', _diffLabel: '简单', _diffClass: '[color:#059669] [background:#ecfdf5]', path: '/student/practice' })
      })
    }
    if (lcRes.status === 'fulfilled' && lcRes.value) {
      const list = Array.isArray(lcRes.value) ? lcRes.value : (lcRes.value?.items || lcRes.value?.data || [])
      list.slice(0, 3 - items.length).forEach(item => {
        const diff = item.difficulty || 'Medium'
        items.push({ title: item.title || item.name || 'LeetCode 题目', source: 'LeetCode', tag: diff, _diffLabel: '推荐拓展', _diffClass: '[color:#059669] [background:#ecfdf5]', path: '/student/leetcode-search' })
      })
    }
    if (items.length) practiceRecommendations.value = items.slice(0, 3)
  } catch (e) { logger.warn('加载推荐练习失败:', e) }
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
      label: { show: true, position: 'center', formatter: `${rate}%`, fontSize: 18, fontWeight: 'bold', color: '#f59e0b' },
      data: [
        { value: rate, name: '通过', itemStyle: { color: '#f59e0b', borderRadius: 6 } },
        { value: 100 - rate, name: '未通过', itemStyle: { color: '#fef3c7' } }
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
      lineStyle: { color: '#3b82f6', width: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0,color:'rgba(59,130,246,0.15)'},{offset:1,color:'rgba(59,130,246,0)'}]) },
      itemStyle: { color: '#3b82f6' }
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
      studentName.value = d?.username || d?.name ||
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
      const list = experimentStore.experimentList
      const arr = Array.isArray(list) ? list : []
      const done = arr.filter(e => e.status === 'completed').length
      weeklyStats.value = {
        experimentDone: `${done}/${arr.length}`,
        accuracy: profileData.value?.overview?.overallAcRate || 0,
        submissions: profileData.value?.overview?.totalSubmissions || 0,
        studyHours: profileData.value?.studyTime || 0,
        chartData: { dates: [], values: [] }
      }
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
.dash-right {
  position: sticky;
  top: 16px;
  align-self: flex-start;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}
.dash-right::-webkit-scrollbar { width: 4px; }
.dash-right::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
