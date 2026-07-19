<template>
  <div class="min-h-screen bg-[var(--app-bg)] p-6">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-sm text-[var(--app-text-soft)]">
            <button
              class="flex items-center gap-1 hover:text-[var(--app-primary)]"
              @click="goBack"
            >
              <LucideIcon name="arrow-left" :size="16" />返回
            </button>
            <span>/</span>
            <span>错误演示</span>
          </div>
          <h1 class="mt-2 text-2xl font-bold text-[var(--app-text)]">
            代码错误动画演示
          </h1>
          <p class="mt-1 text-sm text-[var(--app-text-soft)]">
            通过可视化动画逐步理解代码中的问题
          </p>
        </div>
        <div v-if="loading" class="text-sm text-[var(--app-text-soft)]">加载中...</div>
      </div>

      <!-- Error -->
      <div
        v-if="loadError"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ loadError }}
      </div>

      <!-- Empty -->
      <div
        v-else-if="!loading && demonstrations.length === 0"
        class="rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-card)] p-12 text-center"
      >
        <LucideIcon name="inbox" :size="48" class="mx-auto text-[var(--app-text-soft)]" />
        <p class="mt-4 text-[var(--app-text-soft)]">暂无错误演示内容</p>
      </div>

      <!-- Demos -->
      <div v-else class="space-y-6">
        <ErrorDemonstrationPlayer
          :demonstrations="demonstrations"
          :readonly="mode === 'student'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../store'
import LucideIcon from '../../components/LucideIcon.vue'
import ErrorDemonstrationPlayer from '../../components/grading/ErrorDemonstrationPlayer.vue'
import api from '../../api'
import { getSubmissionErrorDemonstrations } from '../../api/tap/grading'

const props = defineProps({
  mode: {
    type: String,
    default: 'student' // student | teacher
  }
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const loadError = ref('')
const demonstrations = ref([])

const mode = computed(() => props.mode || (userStore.role === 'teacher' ? 'teacher' : 'student'))
const resourceId = computed(() => route.params.id || route.query.submissionId || route.query.experimentId)

async function loadDemonstrations() {
  if (!resourceId.value) {
    loadError.value = '缺少必要的参数'
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    let demos = []
    if (mode.value === 'teacher') {
      const res = await getSubmissionErrorDemonstrations(Number(resourceId.value))
      demos = res?.data || res || []
    } else {
      const res = await api.getPublishedGradingResult(Number(resourceId.value))
      const grading = res?.data || res || {}
      demos = grading.errorDemonstrations || []
    }
    demonstrations.value = Array.isArray(demos) ? demos : []
  } catch (e) {
    loadError.value = e?.message || '加载失败，请稍后重试'
    demonstrations.value = []
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push(mode.value === 'teacher' ? '/teacher/grading' : '/student/experiments')
  }
}

onMounted(() => {
  loadDemonstrations()
})
</script>
