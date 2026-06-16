<template>
  <div class="min-h-screen min-h-dvh flex items-center justify-center p-6 bg-[#f5f5f7] overflow-x-hidden overflow-y-auto max-[768px]:items-start max-[768px]:p-4">
    <div class="w-full max-w-[860px] p-9 rounded-[24px] bg-white/95 backdrop-blur-[20px] border border-black/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.08)] max-[768px]:p-6 max-[480px]:p-5 max-[480px]:rounded-[20px]">
      <div class="mb-6 text-center">
        <h1 class="text-[28px] font-bold text-[#1d1d1f] mb-2 max-[480px]:text-[24px]">选择教学班</h1>
        <p class="text-[15px] text-[#6e6e73] m-0">教师端按教学班隔离管理。先选择当前教学班，或先创建新的教学班。</p>
      </div>

      <div v-if="loading" class="py-10 text-center text-[#6e6e73] flex items-center justify-center gap-2.5">
        <Loading class="w-7 h-7 animate-spin text-[var(--app-primary)]" />
        <p class="text-[14px] m-0">正在加载教学班...</p>
      </div>

      <template v-else>
        <div v-if="classList.length" class="flex flex-wrap gap-4 mb-6 min-w-0 max-[768px]:flex-col">
          <div
            v-for="cls in classList"
            :key="cls.id"
            class="flex items-start gap-3.5 min-h-[112px] p-5 border border-black/[0.08] rounded-[18px] cursor-pointer transition-all duration-200 flex-1 min-w-[280px] max-[768px]:min-w-0 hover:border-[var(--app-primary)]/30 hover:bg-[rgba(194,112,62,0.02)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            :class="selected === cls.id ? 'border-[var(--app-primary)] bg-[rgba(194,112,62,0.04)] shadow-[0_0_0_3px_rgba(194,112,62,0.12)]' : ''"
            @click="selected = cls.id"
          >
            <div class="w-12 h-12 grid place-items-center rounded-[14px] bg-[rgba(194,112,62,0.1)] text-[var(--app-primary)] font-bold text-[15px] shrink-0">班</div>
            <div class="flex-1 flex flex-col min-w-0">
              <span class="text-[20px] font-bold text-[#1d1d1f] leading-tight break-words">{{ cls.name }}</span>
              <span class="mt-2 text-[14px] text-[#6e6e73] leading-relaxed flex flex-wrap gap-2">{{ cls.courseName || '未设置课程' }} · {{ cls.studentCount || 0 }} 人</span>
            </div>
            <CircleCheckFilled v-if="selected === cls.id" class="w-5 h-5 text-[var(--app-primary)] shrink-0" />
          </div>
        </div>

        <div v-else class="py-16 text-center">
          <div class="flex justify-center mb-4 opacity-40"><LucideIcon name="book-open" :size="48" /></div>
          <p class="text-[15px] text-[#aeaeb2] mb-5">你还没有创建任何教学班</p>
          <UiButton @click="goCreateClass" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">
            去创建教学班
          </UiButton>
        </div>
      </template>

      <div class="flex gap-3 flex-wrap">
        <UiButton v-if="classList.length" :disabled="!selected" @click="confirmSelect" class="flex-1 h-[44px] px-6 rounded-[12px] text-[15px] font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100">
          进入当前教学班
        </UiButton>
        <UiButton v-if="classList.length" @click="goCreateClass" class="flex-1 h-[44px] px-6 rounded-[12px] text-[15px] font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none">
          新建教学班
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheckFilled, Loading } from '@/components/ui/icons'
import LucideIcon from '@/components/LucideIcon.vue'
import { useUserStore } from '../../store'
import { getTeachingClasses } from '../../api/tap'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const classList = ref([])
const selected = ref(null)

onMounted(async () => {
  if (userStore.selectedClass) {
    await router.replace('/teacher/dashboard')
    return
  }

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
  } finally {
    loading.value = false
  }
})

function confirmSelect() {
  const found = classList.value.find(item => item.id === selected.value)
  if (!found) return
  const ptaKeyword = found.ptaKeyword || found.pta_keyword || found.classKeyword || found.class_keyword || found.name
  userStore.setSelectedClass({
    id: found.id,
    name: found.name,
    ptaKeyword
  })
  router.replace('/teacher/dashboard')
}

function goCreateClass() {
  router.push('/teacher/class-list')
}
</script>

