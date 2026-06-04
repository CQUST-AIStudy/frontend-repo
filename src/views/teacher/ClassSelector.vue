<template>
  <div class="class-selector-page min-h-screen min-h-dvh overflow-x-hidden overflow-y-auto text-white">
    <div class="page-topbar">
      <div class="brand-block">
        <div class="brand-mark">AI</div>
        <span>智能教辅平台 · 教师工作台</span>
      </div>
    </div>

    <div class="bg-orb bg-orb-left" aria-hidden="true"></div>
    <div class="bg-orb bg-orb-right" aria-hidden="true"></div>
    <div class="bg-chart bg-chart-left" aria-hidden="true"></div>
    <div class="bg-chart bg-chart-right" aria-hidden="true"></div>

    <main class="relative z-10 flex min-h-[calc(100dvh-76px)] items-center justify-center px-6 py-8 max-[768px]:items-start max-[768px]:px-4">
      <section class="class-panel w-full max-w-[900px] rounded-[22px] border border-white/70 bg-white/95 px-10 py-9 text-slate-900 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-[18px] max-[768px]:px-6 max-[480px]:px-5 max-[480px]:py-7">
        <div class="text-center">
          <h1 class="m-0 text-[32px] font-bold tracking-[-0.03em] text-[#111827] max-[480px]:text-[26px]">选择教学班</h1>
          <p class="mx-auto mt-3 max-w-[620px] text-[15px] leading-7 text-slate-500 max-[480px]:text-[14px]">
            请选择当前授课班级，系统将按班级隔离实验、批改与学情数据
          </p>
        </div>

        <div v-if="loading" class="mt-8">
          <div class="status-row">
            <span></span>
            <div class="inline-flex items-center gap-3 text-[15px] text-slate-500">
              <Loading class="h-6 w-6 animate-spin text-[#1677ff]" />
              <span>正在同步教学班信息...</span>
            </div>
            <span></span>
          </div>

          <div class="mt-7 space-y-4">
            <div v-for="item in 3" :key="item" class="skeleton-class-card">
              <div class="skeleton-icon">
                <i></i>
                <i></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="skeleton-line skeleton-title"></div>
                <div class="mt-4 flex items-center gap-4 max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-2">
                  <div class="skeleton-line skeleton-meta"></div>
                  <div class="h-1 w-1 rounded-full bg-slate-300 max-[560px]:hidden"></div>
                  <div class="skeleton-line skeleton-meta short"></div>
                </div>
              </div>
              <div class="skeleton-divider"></div>
              <div class="skeleton-radio"></div>
            </div>
          </div>

          <div class="mt-6 border-t border-slate-200/80 pt-6">
            <div class="grid grid-cols-[0.78fr_1.1fr] gap-6 max-[640px]:grid-cols-1">
              <button class="selector-btn selector-btn-ghost" disabled>
                <span class="loading-dot"></span>
                <span class="skeleton-action-text"></span>
              </button>
              <button class="selector-btn selector-btn-primary" disabled>
                确认选择
                <Loading class="h-4 w-4 animate-spin opacity-70" />
              </button>
            </div>
            <p class="mt-5 flex items-center justify-center gap-2 text-[13px] text-slate-400">
              <span class="safe-icon">◇</span>
              教学班数据严格隔离，请放心选择
            </p>
          </div>
        </div>

        <template v-else>
          <div v-if="classList.length" class="mt-8 space-y-4">
            <div
              v-for="cls in classList"
              :key="cls.id"
              class="class-card"
              :class="selected === cls.id ? 'class-card-active' : ''"
              @click="selected = cls.id"
            >
              <div class="class-icon">班</div>
              <div class="min-w-0 flex-1">
                <span class="block truncate text-[18px] font-semibold text-slate-900">{{ cls.name }}</span>
                <span class="mt-2 flex flex-wrap gap-2 text-[14px] leading-6 text-slate-500">
                  {{ cls.courseName || '未设置课程' }} · {{ cls.studentCount || 0 }} 人
                </span>
              </div>
              <div class="class-card-divider"></div>
              <CircleCheckFilled v-if="selected === cls.id" class="h-6 w-6 shrink-0 text-[#1677ff]" />
              <span v-else class="class-radio"></span>
            </div>
          </div>

          <div v-else class="empty-state mt-8">
            <div class="empty-icon">班</div>
            <h2>{{ loadError ? '教学班加载失败' : '暂无教学班' }}</h2>
            <p>
              {{ loadError || '你还没有创建任何教学班，可以先创建教学班后再进入教师工作台。' }}
            </p>
            <div class="mt-6 flex justify-center gap-3 max-[480px]:flex-col">
              <button v-if="loadError" class="selector-btn selector-btn-ghost" @click="loadTeachingClasses">
                重新加载
              </button>
              <button class="selector-btn selector-btn-primary" @click="goCreateClass">
                去创建教学班
              </button>
            </div>
          </div>

          <div v-if="classList.length" class="mt-6 border-t border-slate-200/80 pt-6">
            <div class="grid grid-cols-[0.78fr_1.1fr] gap-6 max-[640px]:grid-cols-1">
              <button class="selector-btn selector-btn-ghost" @click="goCreateClass">
                新建教学班
              </button>
              <button class="selector-btn selector-btn-primary" :disabled="!selected" @click="confirmSelect">
                确认选择
              </button>
            </div>
            <p class="mt-5 flex items-center justify-center gap-2 text-[13px] text-slate-400">
              <span class="safe-icon">◇</span>
              教学班数据严格隔离，请放心选择
            </p>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheckFilled, Loading } from '@element-plus/icons-vue'
import { useUserStore } from '../../store'
import { getTeachingClasses } from '../../api/tap'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const classList = ref([])
const selected = ref(null)
const loadError = ref('')

onMounted(async () => {
  if (userStore.selectedClass) {
    await router.replace('/teacher/dashboard')
    return
  }

  await loadTeachingClasses()
})

async function loadTeachingClasses() {
  loading.value = true
  loadError.value = ''

  try {
    const res = await getTeachingClasses()
    const list = res?.data || res || []
    classList.value = Array.isArray(list) ? list : []
    if (classList.value.length === 1) {
      selected.value = classList.value[0].id
    }
  } catch (error) {
    logger.warn('加载教学班失败:', error)
    classList.value = []
    loadError.value = '暂时无法同步教学班信息，请检查后端服务或稍后重试。'
  } finally {
    loading.value = false
  }
}

function confirmSelect() {
  const found = classList.value.find(item => item.id === selected.value)
  if (!found) return
  userStore.setSelectedClass({
    id: found.id,
    name: found.name,
    ptaKeyword: found.ptaKeyword || found.name
  })
  router.replace('/teacher/dashboard')
}

function goCreateClass() {
  router.push('/teacher/class-list')
}
</script>

<style scoped>
.class-selector-page {
  position: relative;
  background:
    radial-gradient(circle at 16% 26%, rgba(28, 128, 255, 0.24), transparent 22%),
    radial-gradient(circle at 84% 74%, rgba(16, 137, 255, 0.24), transparent 22%),
    linear-gradient(135deg, #03162d 0%, #052447 46%, #063467 100%);
}

.class-selector-page::before {
  content: "";
  position: absolute;
  inset: 76px 0 0;
  opacity: 0.65;
  background-image:
    linear-gradient(rgba(77, 155, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(77, 155, 255, 0.08) 1px, transparent 1px),
    radial-gradient(circle at 8% 22%, rgba(66, 164, 255, 0.46) 0 4px, transparent 5px),
    radial-gradient(circle at 86% 18%, rgba(66, 164, 255, 0.42) 0 4px, transparent 5px),
    radial-gradient(circle at 92% 58%, rgba(66, 164, 255, 0.38) 0 4px, transparent 5px);
  background-size: 64px 64px, 64px 64px, 420px 420px, 520px 520px, 460px 460px;
}

.page-topbar {
  position: relative;
  z-index: 20;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid rgba(144, 190, 255, 0.22);
  background: rgba(3, 20, 42, 0.48);
  backdrop-filter: blur(18px);
}

.brand-block {
  display: flex;
  align-items: center;
}

.brand-block {
  gap: 14px;
  color: #f8fbff;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(103, 184, 255, 0.56);
  clip-path: polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
  color: #f8fbff;
  font-size: 16px;
  font-weight: 800;
  background: rgba(21, 76, 137, 0.44);
}

.bg-orb,
.bg-chart {
  position: absolute;
  pointer-events: none;
}

.bg-orb-left {
  width: 270px;
  height: 220px;
  left: -80px;
  top: 140px;
  border: 1px solid rgba(67, 155, 255, 0.18);
  opacity: 0.7;
  clip-path: polygon(15% 25%, 47% 7%, 84% 32%, 72% 82%, 28% 84%);
}

.bg-orb-right {
  width: 320px;
  height: 260px;
  right: -88px;
  top: 90px;
  border: 1px solid rgba(67, 155, 255, 0.14);
  opacity: 0.7;
  clip-path: polygon(24% 8%, 84% 18%, 92% 74%, 36% 88%, 8% 42%);
}

.bg-chart-left {
  left: 32px;
  bottom: 70px;
  width: 260px;
  height: 170px;
  opacity: 0.28;
  background: linear-gradient(to top, rgba(48, 154, 255, 0.9), rgba(48, 154, 255, 0.16));
  clip-path: polygon(0 100%, 0 58%, 8% 58%, 8% 100%, 14% 100%, 14% 46%, 22% 46%, 22% 100%, 28% 100%, 28% 32%, 36% 32%, 36% 100%, 42% 100%, 42% 18%, 50% 18%, 50% 100%, 56% 100%, 56% 0, 64% 0, 64% 100%, 100% 100%);
}

.bg-chart-right {
  right: 48px;
  bottom: 90px;
  width: 310px;
  height: 210px;
  opacity: 0.22;
  border-bottom: 2px solid rgba(53, 162, 255, 0.55);
  background: linear-gradient(145deg, transparent 0 42%, rgba(40, 151, 255, 0.4) 42% 44%, transparent 44% 100%);
}

.class-panel {
  position: relative;
}

.class-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.95), rgba(238, 245, 255, 0.52));
}

.class-panel > * {
  position: relative;
  z-index: 1;
}

.status-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 22px;
}

.status-row > span {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.45));
}

.status-row > span:last-child {
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.45), transparent);
}

.skeleton-class-card,
.class-card {
  min-height: 100px;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 18px 22px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
}

.skeleton-icon,
.class-icon {
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(22, 119, 255, 0.12), rgba(22, 119, 255, 0.05));
  color: #1677ff;
  font-size: 18px;
  font-weight: 800;
}

.skeleton-icon {
  position: relative;
}

.skeleton-icon i {
  position: absolute;
  display: block;
  border-radius: 999px;
  background: rgba(83, 137, 218, 0.34);
}

.skeleton-icon i:first-child {
  width: 13px;
  height: 13px;
  left: 18px;
  top: 18px;
}

.skeleton-icon i:last-child {
  width: 32px;
  height: 14px;
  left: 13px;
  bottom: 14px;
  border-radius: 18px 18px 8px 8px;
}

.skeleton-line,
.skeleton-action-text {
  position: relative;
  overflow: hidden;
  border-radius: 999px;
  background: linear-gradient(90deg, #e7edf6 0%, #cfd9eb 42%, #eef3fa 72%, #e7edf6 100%);
  background-size: 240% 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
}

.skeleton-title {
  height: 18px;
  width: min(74%, 520px);
}

.skeleton-meta {
  height: 16px;
  width: min(35%, 210px);
}

.skeleton-meta.short {
  width: min(22%, 140px);
}

.skeleton-divider,
.class-card-divider {
  width: 1px;
  height: 46px;
  background: rgba(203, 213, 225, 0.68);
}

.skeleton-radio,
.class-radio {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 999px;
  border: 2px solid #cbd5e1;
}

.class-card {
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.class-card:hover {
  transform: translateY(-1px);
  border-color: rgba(22, 119, 255, 0.32);
  background: rgba(248, 251, 255, 0.95);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

.class-card-active {
  border-color: rgba(22, 119, 255, 0.72);
  background: rgba(239, 246, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.12), 0 18px 42px rgba(15, 23, 42, 0.08);
}

.selector-btn {
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 16px;
  font-weight: 700;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.selector-btn:not(:disabled) {
  cursor: pointer;
}

.selector-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.selector-btn-primary {
  color: white;
  background: linear-gradient(180deg, #2288ff 0%, #0b6fe9 100%);
  box-shadow: 0 16px 34px rgba(22, 119, 255, 0.22);
}

.selector-btn-primary:disabled {
  color: rgba(255, 255, 255, 0.8);
  background: linear-gradient(180deg, #d4dce8 0%, #c3ccd9 100%);
  box-shadow: none;
  cursor: not-allowed;
}

.selector-btn-ghost {
  color: #526276;
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(148, 163, 184, 0.42);
}

.selector-btn-ghost:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.loading-dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid #cbd5e1;
  border-top-color: #8da2c4;
}

.skeleton-action-text {
  width: 150px;
  height: 14px;
}

.safe-icon {
  color: #94a3b8;
  font-size: 16px;
}

.empty-state {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 1px dashed rgba(148, 163, 184, 0.36);
  background: rgba(248, 251, 255, 0.7);
  text-align: center;
  padding: 34px 20px;
}

.empty-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
  font-weight: 800;
}

.empty-state h2 {
  margin: 18px 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: #172033;
}

.empty-state p {
  max-width: 440px;
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.8;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -120% 0;
  }
}

@media (max-width: 768px) {
  .page-topbar {
    height: auto;
    min-height: 72px;
    padding: 14px 18px;
    align-items: flex-start;
    gap: 14px;
  }

  .brand-block {
    font-size: 17px;
  }

  .assistant-block span {
    display: none;
  }

  .assistant-logo {
    width: 44px;
    height: 44px;
  }

  .class-selector-page::before {
    inset: 72px 0 0;
  }
}

@media (max-width: 560px) {
  .skeleton-class-card,
  .class-card {
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
  }

  .skeleton-divider,
  .class-card-divider {
    display: none;
  }

  .skeleton-radio,
  .class-radio {
    margin-top: 12px;
  }

  .skeleton-title {
    width: 92%;
  }

  .skeleton-meta,
  .skeleton-meta.short {
    width: 76%;
  }
}
</style>
