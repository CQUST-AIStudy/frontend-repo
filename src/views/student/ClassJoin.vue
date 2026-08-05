<template>
  <div class="class-join-page [display:flex] [flex-direction:column] [gap:20px]">
    <UiPageHeader
      title="教学班"
      description="加入教学班后，AI 学习助手会自动解锁该班级可访问的课程知识库和 RAG 问答空间。"
    />

    <div class="class-join-grid [display:grid] [grid-template-columns:minmax(320px,_420px)_minmax(0,_1fr)] [gap:20px] max-[960px]:[grid-template-columns:1fr]">
      <ui-card class="join-card [border-radius:16px]" shadow="hover">
        <template #header>
          <div class="card-header [display:flex] [align-items:center] [justify-content:space-between] [align-items:flex-start] [gap:16px] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>加入新班级</span>
          </div>
        </template>

        <ui-form label-position="top">
          <ui-form-item label="班级号">
            <ui-input v-model="joinForm.classCode" placeholder="例如：CS2025-01" />
          </ui-form-item>
          <ui-form-item label="加入密码">
            <ui-input
              v-model="joinForm.password"
              type="password"
              show-password
              placeholder="输入教师提供的加入密码"
            />
          </ui-form-item>
        </ui-form>

        <div class="join-actions [display:flex] [gap:12px] [margin-top:16px] [margin-bottom:12px]">
          <ui-button type="primary" :loading="joining" :disabled="!canSubmit" @click="submitJoin">
            加入班级
          </ui-button>
          <ui-button @click="goAssistant">前往 AI 助手</ui-button>
        </div>

        <div class="join-tip [color:#909399] [font-size:13px] [line-height:1.6]">
          加入成功后，AI 助手会自动展示你当前教学班有权限访问的课程空间。
        </div>
      </ui-card>

      <ui-card class="joined-card [border-radius:16px]" shadow="hover">
        <template #header>
          <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
            <span>已加入班级</span>
            <ui-button link :loading="loading" @click="loadJoinedClasses">刷新</ui-button>
          </div>
        </template>

        <ui-empty v-if="!loading && joinedClasses.length === 0" description="你还没有加入任何教学班" />

        <div v-else :aria-busy="loading" class="joined-list [display:flex] [flex-direction:column] [gap:12px] [min-height:120px]">
          <div v-for="item in joinedClasses" :key="item.id" class="joined-item [display:flex] [align-items:center] [justify-content:space-between] [gap:16px] [padding:16px] [border:1px_solid_#ebeef5] [border-radius:12px] [background:#fcfcfd]">
            <div class="joined-main [display:flex] [flex-direction:column] [gap:6px]">
              <div class="joined-title [color:#303133] [font-size:15px] [font-weight:600]">{{ item.name }}</div>
              <div class="joined-meta [display:flex] [flex-wrap:wrap] [gap:10px] [color:#909399] [font-size:13px]">
                <span v-if="item.courseName">{{ item.courseName }}</span>
                <span v-if="item.grade">{{ item.grade }}级</span>
                <span>{{ item.classCode }}</span>
              </div>
            </div>
            <div class="joined-side">
              <ui-button
                size="small"
                :type="isCurrentClass(item) ? 'primary' : 'default'"
                @click="selectCurrentClass(item)"
              >
                {{ isCurrentClass(item) ? '当前课程' : '切换到此课程' }}
              </ui-button>
            </div>
          </div>
        </div>
      </ui-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'
import { message as uiMessage } from '@/services/feedback'
import { useUserStore } from '../../store'
import { buildApiUrl } from '../../config/runtime'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const joining = ref(false)
const joinedClasses = ref([])
const joinForm = reactive({
  classCode: '',
  password: ''
})

const canSubmit = computed(() => joinForm.classCode.trim() && joinForm.password.trim())

async function loadJoinedClasses() {
  loading.value = true
  try {
    const response = await fetch(buildApiUrl('/api/student-classes'), {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()
    joinedClasses.value = Array.isArray(data) ? data : data?.data || []
    const selectedStillExists = joinedClasses.value.some(item => isCurrentClass(item))
    if (!selectedStillExists) {
      userStore.setSelectedClass(joinedClasses.value.length === 1 ? joinedClasses.value[0] : null)
    }
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '加载已加入班级失败，请稍后重试'))
  } finally {
    loading.value = false
  }
}

async function submitJoin() {
  if (!canSubmit.value || joining.value) return
  joining.value = true
  try {
    const response = await fetch(buildApiUrl('/api/student-classes/join'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classCode: joinForm.classCode.trim(),
        password: joinForm.password.trim()
      })
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(payload?.message || `HTTP ${response.status}`)
    }
    uiMessage.success('加入班级成功')
    joinForm.classCode = ''
    joinForm.password = ''
    await loadJoinedClasses()
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '加入班级失败，请检查班级码或密码后重试'))
  } finally {
    joining.value = false
  }
}

function goAssistant() {
  router.push('/student/ai-assistant')
}

function isCurrentClass(item) {
  return String(userStore.selectedClass?.id || '') === String(item?.id || '')
}

function selectCurrentClass(item) {
  userStore.setSelectedClass(item)
  uiMessage.success(`已切换到${item.courseName || item.name}`)
}

onMounted(() => {
  loadJoinedClasses()
})
</script>


