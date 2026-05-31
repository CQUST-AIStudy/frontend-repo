<template>
  <div class="class-selector-page [min-height:100vh] [min-height:100dvh] [display:flex] [align-items:center] [justify-content:center] [padding:24px] [background:#f5f7fb] [overflow-x:hidden] [overflow-y:auto] max-[768px]:[align-items:flex-start] max-[768px]:[padding:16px]">
    <div class="selector-card [width:100%] [max-width:860px] [padding:36px] [border-radius:24px] [background:#fff] [border:1px_solid_#e6eaf2] [box-shadow:0_18px_48px_rgba(15,_23,_42,_0.08)] max-[768px]:[padding:24px] max-[480px]:[padding:20px_16px] max-[480px]:[border-radius:18px]">
      <div class="selector-header [margin-bottom:24px] [text-align:center] [&_h1]:[margin:0_0_8px] [&_h1]:[color:#1f2937] [&_h1]:[font-size:28px] [&_p]:[margin:0] [&_p]:[color:#6b7280] max-[480px]:[&_h1]:[font-size:24px]">
        <h1>选择教学班</h1>
        <p>教师端按教学班隔离管理。先选择当前教学班，或先创建新的教学班。</p>
      </div>

      <div v-if="loading" class="loading-state [padding:40px_0] [text-align:center] [color:#6b7280] [display:flex] [align-items:center] [gap:10px] [padding:18px_2px] [color:#48607c]">
        <el-icon class="is-loading" :size="30"><Loading /></el-icon>
        <p>正在加载教学班...</p>
      </div>

      <template v-else>
        <div v-if="classList.length" class="class-grid [display:grid] [grid-template-columns:repeat(auto-fit,_minmax(min(280px,_100%),_1fr))] [gap:16px] [margin-bottom:24px] max-[768px]:[grid-template-columns:1fr] [display:flex] [flex-wrap:wrap] [min-width:0]">
          <div
            v-for="cls in classList"
            :key="cls.id"
            class="class-item [display:flex] [align-items:flex-start] [gap:14px] [min-height:112px] [padding:20px_20px_18px] [border:1px_solid_#dbe2ea] [border-radius:18px] [cursor:pointer] [transition:0.2s_ease] hover:[border-color:#9fb3c8] hover:[background:#f8fbff] [&.selected]:[border-color:#2563eb] [&.selected]:[background:#eff6ff]"
            :class="{ selected: selected === cls.id }"
            @click="selected = cls.id"
          >
            <div class="class-icon [width:48px] [height:48px] [display:grid] [place-items:center] [border-radius:14px] [background:#e0ecff] [color:#1d4ed8] [font-weight:700] [flex-shrink:0]">班</div>
            <div class="class-info [flex:1] [display:flex] [flex-direction:column] [min-width:0] [flex-grow:1] [margin-bottom:15px]">
              <span class="class-name [color:#111827] [font-weight:700] [font-size:20px] [line-height:1.35] [word-break:break-word] [margin:0] [font-size:26px] [line-height:1.2] [color:#16314a]">{{ cls.name }}</span>
              <span class="class-meta [margin-top:6px] [color:#6b7280] [font-size:14px] [line-height:1.6] [word-break:break-word] [display:flex] [flex-wrap:wrap] [gap:8px] [margin-top:12px]">{{ cls.courseName || '未设置课程' }} · {{ cls.studentCount || 0 }} 人</span>
            </div>
            <el-icon v-if="selected === cls.id" class="check-icon [color:#2563eb] [font-size:20px]"><CircleCheckFilled /></el-icon>
          </div>
        </div>

        <el-empty v-else description="你还没有创建任何教学班">
          <el-button type="primary" @click="goCreateClass">去创建教学班</el-button>
        </el-empty>
      </template>

      <div class="selector-actions [display:flex] [gap:12px] [flex-wrap:wrap]">
        <el-button v-if="classList.length" type="primary" size="large" class="confirm-btn [flex:1] [border-radius:12px]" :disabled="!selected" @click="confirmSelect">
          进入当前教学班
        </el-button>
        <el-button v-if="classList.length" size="large" class="secondary-btn [flex:1] [border-radius:12px]" @click="goCreateClass">
          新建教学班
        </el-button>
      </div>
    </div>
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

