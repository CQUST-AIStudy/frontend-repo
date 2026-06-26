<template>
  <div class="min-h-screen min-h-dvh flex items-center justify-center p-6 bg-[#f5f5f7] overflow-x-hidden overflow-y-auto max-[768px]:items-start max-[768px]:p-4">
    <div class="w-full max-w-[920px] p-9 rounded-[24px] bg-white/95 backdrop-blur-[20px] border border-black/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.08)] max-[768px]:p-6 max-[480px]:p-5 max-[480px]:rounded-[20px]">
      <div class="mb-6 text-center">
        <h1 class="text-[28px] font-bold text-[#1d1d1f] mb-2 max-[480px]:text-[24px]">选择课程与班级</h1>
        <p class="text-[15px] text-[#6e6e73] m-0">教师端按课程组织教学班级。先进入课程，再选择当前要管理的具体班级。</p>
      </div>

      <div v-if="loading" class="py-10 text-center text-[#6e6e73] flex items-center justify-center gap-2.5">
        <Loading class="w-7 h-7 animate-spin text-[var(--app-primary)]" />
        <p class="text-[14px] m-0">正在加载教学班级...</p>
      </div>

      <template v-else>
        <template v-if="classList.length">
          <div
            v-if="selectedCourse"
            class="mb-5 flex items-center justify-between gap-4 rounded-[20px] border border-[rgba(194,112,62,0.14)] bg-[linear-gradient(135deg,rgba(194,112,62,0.10),rgba(255,255,255,0.98))] px-5 py-4 shadow-[0_10px_30px_rgba(194,112,62,0.08)] max-[640px]:flex-col max-[640px]:items-start"
          >
            <div class="min-w-0">
              <span class="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.08)]">
                COURSE
              </span>
              <p class="m-0 mt-3 text-[20px] font-bold text-[#1d1d1f] leading-tight break-words">
                {{ selectedCourse.name }}
              </p>
              <p class="m-0 mt-1 text-[13px] text-[#7a7a80]">请选择要进入的教学班级</p>
            </div>
            <UiButton
              class="h-[36px] px-4 rounded-[12px] text-sm font-medium text-[#1d1d1f] bg-white/90 hover:bg-white active:scale-[0.96] transition-all cursor-pointer border border-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
              @click="backToCourses"
            >
              返回课程列表
            </UiButton>
          </div>

          <div v-if="!selectedCourse" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              v-for="course in courseGroups"
              :key="course.key"
              type="button"
              class="text-left flex items-start gap-4 min-h-[132px] p-5 border border-black/[0.08] rounded-[18px] cursor-pointer transition-all duration-200 bg-white hover:border-[var(--app-primary)]/30 hover:bg-[rgba(194,112,62,0.02)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-primary)]/15"
              @click="selectCourse(course.key)"
            >
              <div class="w-12 h-12 grid place-items-center rounded-[14px] bg-[rgba(194,112,62,0.1)] text-[var(--app-primary)] shrink-0">
                <LucideIcon name="book-open" :size="22" />
              </div>
              <div class="flex-1 min-w-0">
                <span class="block text-[20px] font-bold text-[#1d1d1f] leading-tight break-words">{{ course.name }}</span>
                <span class="mt-2 block text-[14px] text-[#6e6e73] leading-relaxed">{{ course.classes.length }} 个班级 · {{ course.studentCount }} 名学生</span>
                <span class="mt-3 inline-flex items-center rounded-full bg-[#f4f4f6] px-3 py-1 text-xs font-semibold text-[#6e6e73]">点击查看班级</span>
              </div>
            </button>
          </div>

          <div v-else class="flex flex-wrap gap-4 mb-6 min-w-0 max-[768px]:flex-col">
            <div
              v-for="cls in selectedCourse.classes"
              :key="cls.id"
              class="flex items-start gap-3.5 min-h-[112px] p-5 border border-black/[0.08] rounded-[18px] cursor-pointer transition-all duration-200 flex-1 min-w-[280px] max-[768px]:min-w-0 hover:border-[var(--app-primary)]/30 hover:bg-[rgba(194,112,62,0.02)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              :class="selected === cls.id ? 'border-[var(--app-primary)] bg-[rgba(194,112,62,0.04)] shadow-[0_0_0_3px_rgba(194,112,62,0.12)]' : ''"
              @click="selected = cls.id"
            >
              <div class="w-12 h-12 grid place-items-center rounded-[14px] bg-[rgba(194,112,62,0.1)] text-[var(--app-primary)] font-bold text-[15px] shrink-0">班</div>
              <div class="flex-1 flex flex-col min-w-0">
                <span class="text-[20px] font-bold text-[#1d1d1f] leading-tight break-words">{{ cls.name }}</span>
                <span class="mt-2 text-[14px] text-[#6e6e73] leading-relaxed flex flex-wrap gap-2">{{ displayCourseName(cls) }} · {{ cls.studentCount || 0 }} 人</span>
              </div>
              <CircleCheckFilled v-if="selected === cls.id" class="w-5 h-5 text-[var(--app-primary)] shrink-0" />
            </div>
          </div>
        </template>

        <div v-else class="py-16 text-center">
          <div class="flex justify-center mb-4 opacity-40"><LucideIcon name="book-open" :size="48" /></div>
          <p class="text-[15px] text-[#aeaeb2] mb-5">你还没有创建任何教学班</p>
          <UiButton @click="goCreateClass" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">
            去创建教学班
          </UiButton>
        </div>
      </template>

      <div class="flex gap-3 flex-wrap">
        <UiButton
          v-if="selectedCourse"
          class="flex-1 h-[44px] px-6 rounded-[12px] text-[15px] font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none"
          @click="backToCourses"
        >
          返回课程
        </UiButton>
        <UiButton
          v-if="selectedCourse"
          :disabled="!selected"
          @click="confirmSelect"
          class="flex-1 h-[44px] px-6 rounded-[12px] text-[15px] font-medium text-white bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] shadow-[0_2px_8px_rgba(194,112,62,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100"
        >
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
import { computed, onMounted, ref } from 'vue'
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
const selectedCourseKey = ref('')

const courseGroups = computed(() => {
  const groups = new Map()
  for (const cls of classList.value) {
    const courseName = displayCourseName(cls)
    const key = courseName.toLowerCase()
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name: courseName,
        classes: [],
        studentCount: 0
      })
    }
    const group = groups.get(key)
    group.classes.push(cls)
    group.studentCount += Number(cls.studentCount || 0)
  }
  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
})

const selectedCourse = computed(() => {
  if (!selectedCourseKey.value) return null
  return courseGroups.value.find(course => course.key === selectedCourseKey.value) || null
})

onMounted(async () => {
  if (userStore.selectedClass) {
    await router.replace('/teacher/dashboard')
    return
  }

  try {
    const res = await getTeachingClasses()
    const list = res?.data || res || []
    classList.value = Array.isArray(list) ? list : []
  } catch (error) {
    logger.warn('加载教学班失败:', error)
    classList.value = []
  } finally {
    loading.value = false
  }
})

function displayCourseName(cls) {
  const name = String(cls?.courseName || '').trim()
  return name || '未设置课程'
}

function selectCourse(courseKey) {
  selectedCourseKey.value = courseKey
  selected.value = null
  const course = courseGroups.value.find(item => item.key === courseKey)
  if (course?.classes.length === 1) {
    selected.value = course.classes[0].id
  }
}

function backToCourses() {
  selectedCourseKey.value = ''
  selected.value = null
}

function confirmSelect() {
  const found = classList.value.find(item => item.id === selected.value)
  if (!found) return
  const ptaGroupId = found.ptaGroupId || found.pta_group_id || ''
  const ptaGroupName = found.ptaGroupName || found.pta_group_name || ''
  userStore.setSelectedClass({
    id: found.id,
    name: found.name,
    ptaGroupId,
    ptaGroupName,
    ptaKeyword: ptaGroupName || found.ptaKeyword || found.pta_keyword || ''
  })
  router.replace('/teacher/dashboard')
}

function goCreateClass() {
  router.push('/teacher/class-list')
}
</script>