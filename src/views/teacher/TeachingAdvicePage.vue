<template>
  <div class="teaching-advice-page space-y-3">
    <UiPageHeader
      title="AI 教学建议"
      description="按实验级、班级级或课程级汇总真实提交结果、错误点和成绩分层，生成对应范围的可执行教学建议。"
    />

    <section class="rounded-[16px] border border-black/[0.06] bg-gradient-to-br from-white via-[#fffaf6] to-[#f7fbff] px-4 py-3 shadow-[0_6px_20px_rgba(31,41,55,0.05)]">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--app-primary)] text-xs font-semibold text-white">AI</span>
            <h2 class="m-0 text-base font-semibold text-[#1d1d1f]">独立教学建议工作台</h2>
            <span class="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-0.5 text-[11px] font-medium text-[#2563eb]">已从教学班分析拆分</span>
          </div>
          <p class="mt-1 text-xs leading-5 text-[#6e6e73] lg:truncate">
            当前页面只负责“下一节课怎么教、重点学生怎么跟进、哪些知识点需要补救”，班级画像与分层数据请在“教学班级分析”中查看。
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 text-xs">
          <div class="flex min-w-0 items-center gap-2 rounded-[10px] border border-black/[0.06] bg-white/85 px-3 py-2">
            <span class="text-[#8a8a8f]">当前教学班</span>
            <span class="max-w-[150px] truncate font-semibold text-[#1d1d1f]">{{ selectedClassName }}</span>
          </div>
          <div class="flex items-center gap-2 rounded-[10px] border border-black/[0.06] bg-white/85 px-3 py-2">
            <span class="text-[#8a8a8f]">可选实验</span>
            <span class="font-semibold text-[#1d1d1f]">{{ experiments.length }} 个</span>
          </div>
        </div>
      </div>
    </section>

    <div v-if="experimentLoading" class="rounded-[20px] border border-black/[0.06] bg-white/95 p-6 text-sm text-[#6e6e73]">
      正在加载当前教学班实验列表...
    </div>

    <div v-else-if="experimentError" class="rounded-[20px] border border-[#ffecb5] bg-[#fff8e1] p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-[#86650a]">实验列表加载失败</div>
          <div class="mt-1 text-xs leading-5 text-[#9a7b1f]">{{ experimentError }}</div>
        </div>
        <UiButton
          class="h-9 rounded-lg border border-[#ffecb5] bg-white px-4 text-xs font-medium text-[#86650a] hover:bg-[#fff3cd]"
          @click="loadExperiments"
        >
          重试
        </UiButton>
      </div>
    </div>

    <Transition name="class-switch" mode="out-in">
      <TeachingAdvicePanel
        :key="selectedClassId || 'no-class'"
        :class-id="selectedClassId"
        :experiments="experiments"
      />
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useUserStore } from '../../store'
import api from '../../api'
import TeachingAdvicePanel from './components/TeachingAdvicePanel.vue'
import logger from '@/utils/logger'

const userStore = useUserStore()

const experiments = ref([])
const experimentLoading = ref(false)
const experimentError = ref('')

const selectedClassId = computed(() => userStore.selectedClass?.id || '')
const selectedClassName = computed(() => userStore.selectedClass?.name || '当前教学班')

function normalizeExperimentListResponse(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

async function loadExperiments() {
  if (!selectedClassId.value) {
    experiments.value = []
    experimentError.value = ''
    return
  }

  experimentLoading.value = true
  experimentError.value = ''
  try {
    const response = await api.getTeacherExperimentList({ classId: selectedClassId.value })
    experiments.value = normalizeExperimentListResponse(response)
  } catch (error) {
    experiments.value = []
    experimentError.value = error?.message || '请稍后重试，或检查当前教学班是否已同步实验数据。'
    logger.error('加载教学建议页实验列表失败:', error)
  } finally {
    experimentLoading.value = false
  }
}

watch(selectedClassId, loadExperiments, { immediate: true })
</script>

<style scoped>
.class-switch-enter-active,
.class-switch-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.class-switch-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.class-switch-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .class-switch-enter-active,
  .class-switch-leave-active {
    transition: none;
  }
}
</style>
