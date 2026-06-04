<template>
  <div class="student-profile [height:100%] [min-height:0]">
    <UiPageHeader
      class="my-page-header [margin-bottom:12px] ![padding:14px_18px] ![border-radius:16px] [&_.ui-page-header]:[min-height:0]"
      title="个人信息"
      description="查看当前登录学生的基本信息、学习概况与账户安全设置。"
    />

    <loading-state :loading="loading">
      <div class="profile-layout [display:grid] [grid-template-columns:minmax(320px,_400px)_minmax(0,_1fr)] [gap:16px] [min-height:0] max-[1080px]:[grid-template-columns:1fr]">
        <section class="profile-main [display:flex] [flex-direction:column] [gap:14px] [min-height:0]">
          <ui-card class="profile-card [border-radius:18px] [border:1px_solid_#dbe5ef] [box-shadow:0_14px_34px_rgba(22,_48,_79,_0.06)] [&_.ui-card__body]:![padding:18px_20px]">
            <div class="profile-card__top [display:flex] [align-items:center] [gap:16px] [margin-bottom:14px] max-[640px]:[flex-direction:column] max-[640px]:[align-items:flex-start]">
              <ui-avatar :size="72" class="profile-card__avatar [background:linear-gradient(135deg,_#1f7ae0,_#45b2ff)] [color:#fff] [font-size:24px] [font-weight:700]">
                {{ avatarText }}
              </ui-avatar>
              <div class="profile-card__meta [min-width:0] [&_h2]:[margin:0] [&_h2]:[font-size:24px] [&_h2]:[line-height:1.2] [&_h2]:[color:#173153] [&_p]:[margin:5px_0_0] [&_p]:[color:#64809b]">
                <h2>{{ displayName }}</h2>
                <p>{{ className || '未绑定教学班' }}</p>
                <div class="profile-tags [display:flex] [gap:8px] [flex-wrap:wrap] [margin-top:10px]">
                  <ui-tag effect="plain" type="primary">学生</ui-tag>
                  <ui-tag effect="plain" type="success">{{ gradeText }}</ui-tag>
                </div>
              </div>
            </div>

            <div class="profile-info [display:grid] [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:10px] max-[640px]:[grid-template-columns:1fr]">
              <div class="info-item [display:flex] [justify-content:space-between] [gap:10px] [min-height:58px] [padding:10px_12px] [border-radius:12px] [background:#f7fbff] max-[640px]:[flex-direction:column] [align-items:center]">
                <span class="info-label [color:#6b8198] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">用户名</span>
                <span class="info-value [color:#173153] [font-weight:600] [text-align:right] [word-break:break-word] max-[640px]:[text-align:left] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7]">{{ currentUser.username || '-' }}</span>
              </div>
              <div class="info-item [display:flex] [justify-content:space-between] [gap:10px] [min-height:58px] [padding:10px_12px] [border-radius:12px] [background:#f7fbff] max-[640px]:[flex-direction:column] [align-items:center]">
                <span class="info-label [color:#6b8198] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">学号</span>
                <span class="info-value [color:#173153] [font-weight:600] [text-align:right] [word-break:break-word] max-[640px]:[text-align:left] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7]">{{ studentId || '-' }}</span>
              </div>
              <div class="info-item [display:flex] [justify-content:space-between] [gap:10px] [min-height:58px] [padding:10px_12px] [border-radius:12px] [background:#f7fbff] max-[640px]:[flex-direction:column] [align-items:center]">
                <span class="info-label [color:#6b8198] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">班级</span>
                <span class="info-value [color:#173153] [font-weight:600] [text-align:right] [word-break:break-word] max-[640px]:[text-align:left] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7]">{{ className || '-' }}</span>
              </div>
              <div class="info-item [display:flex] [justify-content:space-between] [gap:10px] [min-height:58px] [padding:10px_12px] [border-radius:12px] [background:#f7fbff] max-[640px]:[flex-direction:column] [align-items:center]">
                <span class="info-label [color:#6b8198] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">邮箱</span>
                <span class="info-value [color:#173153] [font-weight:600] [text-align:right] [word-break:break-word] max-[640px]:[text-align:left] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7]">{{ currentUser.email || '未设置' }}</span>
              </div>
              <div class="info-item [display:flex] [justify-content:space-between] [gap:10px] [min-height:58px] [padding:10px_12px] [border-radius:12px] [background:#f7fbff] max-[640px]:[flex-direction:column] [align-items:center]">
                <span class="info-label [color:#6b8198] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">手机号</span>
                <span class="info-value [color:#173153] [font-weight:600] [text-align:right] [word-break:break-word] max-[640px]:[text-align:left] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7]">{{ currentUser.phone || '未设置' }}</span>
              </div>
            </div>

            <div class="profile-actions [display:flex] [gap:10px] [flex-wrap:wrap] [margin-top:14px] [&_.ui-button]:![min-height:34px] [&_.ui-button]:![padding:7px_14px]">
              <ui-button type="primary" @click="openProfileDialog">更新展示信息</ui-button>
              <ui-button @click="openPasswordDialog">修改密码</ui-button>
            </div>
          </ui-card>

          <ui-card class="security-card [border-radius:18px] [border:1px_solid_#dbe5ef] [box-shadow:0_14px_34px_rgba(22,_48,_79,_0.06)] [&_.ui-card__header]:![padding:14px_18px_10px] [&_.ui-card__body]:![padding:14px_18px_16px]">
            <template #header>
              <div class="card-header [font-weight:700] [color:#1c3554] [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                <span>账户设置</span>
              </div>
            </template>

            <div class="setting-list [display:flex] [flex-direction:column] [gap:8px]">
              <div class="setting-item [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [padding:8px_0] [border-bottom:1px_solid_#edf2f7] last:[border-bottom:none] last:[padding-bottom:0] [&_strong]:[display:block] [&_strong]:[font-size:14px] [&_strong]:[line-height:1.4] [&_p]:[margin:3px_0_0] [&_p]:[font-size:12px] [&_p]:[line-height:1.45] [&_p]:[color:#64809b]">
                <div>
                  <strong>系统通知</strong>
                  <p>接收实验发布、截止时间和课堂更新提醒。</p>
                </div>
                <ui-switch v-model="settings.notifications" />
              </div>
              <div class="setting-item [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [padding:8px_0] [border-bottom:1px_solid_#edf2f7] last:[border-bottom:none] last:[padding-bottom:0] [&_strong]:[display:block] [&_strong]:[font-size:14px] [&_strong]:[line-height:1.4] [&_p]:[margin:3px_0_0] [&_p]:[font-size:12px] [&_p]:[line-height:1.45] [&_p]:[color:#64809b]">
                <div>
                  <strong>截止提醒</strong>
                  <p>在实验截止前推送提醒，避免漏交。</p>
                </div>
                <ui-switch v-model="settings.deadlineReminder" />
              </div>
              <div class="setting-item [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [padding:8px_0] [border-bottom:1px_solid_#edf2f7] last:[border-bottom:none] last:[padding-bottom:0] [&_strong]:[display:block] [&_strong]:[font-size:14px] [&_strong]:[line-height:1.4] [&_p]:[margin:3px_0_0] [&_p]:[font-size:12px] [&_p]:[line-height:1.45] [&_p]:[color:#64809b]">
                <div>
                  <strong>AI 反馈提示</strong>
                  <p>实验报告生成评语和学习建议时同步提醒。</p>
                </div>
                <ui-switch v-model="settings.aiFeedback" />
              </div>
            </div>
          </ui-card>
        </section>

        <section class="profile-side [display:flex] [flex-direction:column] [gap:14px] [min-height:0]">
          <ui-card class="overview-card [border-radius:18px] [border:1px_solid_#dbe5ef] [box-shadow:0_14px_34px_rgba(22,_48,_79,_0.06)] [&_.ui-card__header]:![padding:14px_20px_10px] [&_.ui-card__body]:![padding:14px_20px_18px]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                <span>学习概况</span>
              </div>
            </template>

            <div class="overview-grid [display:grid] [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:12px]">
              <div class="overview-item [min-height:88px] [padding:14px_16px] [border-radius:14px] [background:linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_100%)] [&_span]:[display:block] [&_span]:[font-size:13px] [&_span]:[color:#64809b] [&_strong]:[display:block] [&_strong]:[margin-top:10px] [&_strong]:[font-size:28px] [&_strong]:[line-height:1] [&_strong]:[color:#173153]">
                <span>实验总数</span>
                <strong>{{ stats.totalExperiments }}</strong>
              </div>
              <div class="overview-item [min-height:88px] [padding:14px_16px] [border-radius:14px] [background:linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_100%)] [&_span]:[display:block] [&_span]:[font-size:13px] [&_span]:[color:#64809b] [&_strong]:[display:block] [&_strong]:[margin-top:10px] [&_strong]:[font-size:28px] [&_strong]:[line-height:1] [&_strong]:[color:#173153]">
                <span>已完成</span>
                <strong>{{ stats.completedExperiments }}</strong>
              </div>
              <div class="overview-item [min-height:88px] [padding:14px_16px] [border-radius:14px] [background:linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_100%)] [&_span]:[display:block] [&_span]:[font-size:13px] [&_span]:[color:#64809b] [&_strong]:[display:block] [&_strong]:[margin-top:10px] [&_strong]:[font-size:28px] [&_strong]:[line-height:1] [&_strong]:[color:#173153]">
                <span>平均成绩</span>
                <strong>{{ stats.averageScore }}</strong>
              </div>
              <div class="overview-item [min-height:88px] [padding:14px_16px] [border-radius:14px] [background:linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_100%)] [&_span]:[display:block] [&_span]:[font-size:13px] [&_span]:[color:#64809b] [&_strong]:[display:block] [&_strong]:[margin-top:10px] [&_strong]:[font-size:28px] [&_strong]:[line-height:1] [&_strong]:[color:#173153]">
                <span>进行中</span>
                <strong>{{ stats.inProgressExperiments }}</strong>
              </div>
            </div>
          </ui-card>

          <ui-card class="activity-card [min-height:0] [border-radius:18px] [border:1px_solid_#dbe5ef] [box-shadow:0_14px_34px_rgba(22,_48,_79,_0.06)] [&_.ui-card__header]:![padding:14px_20px_10px] [&_.ui-card__body]:![padding:12px_20px_16px]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                <span>最近动态</span>
              </div>
            </template>

            <ui-timeline class="[max-height:360px] [overflow-y:auto] [padding-right:6px] [&_.ui-timeline-item]:[padding-bottom:2px]">
              <ui-timeline-item
                v-for="item in activityList"
                :key="`${item.title}-${item.time}`"
                :timestamp="item.time"
                :color="item.color"
              >
                <h4 class="activity-title [margin:0_0_6px] [color:#173153] [font-size:15px]">{{ item.title }}</h4>
                <p class="activity-content [margin:0] [color:#607792] [line-height:1.6]">{{ item.content }}</p>
              </ui-timeline-item>
            </ui-timeline>
          </ui-card>
        </section>
      </div>
    </loading-state>

    <ui-dialog v-model="profileDialogVisible" title="更新展示信息" width="480px">
      <ui-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="90px">
        <ui-form-item label="姓名" prop="name">
          <ui-input v-model="profileForm.name" placeholder="请输入展示姓名" />
        </ui-form-item>
        <ui-form-item label="邮箱" prop="email">
          <ui-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </ui-form-item>
        <ui-form-item label="手机号" prop="phone">
          <ui-input v-model="profileForm.phone" placeholder="请输入手机号" />
        </ui-form-item>
      </ui-form>

      <template #footer>
        <ui-button @click="profileDialogVisible = false">取消</ui-button>
        <ui-button type="primary" @click="saveProfile">保存</ui-button>
      </template>
    </ui-dialog>

    <ui-dialog v-model="passwordDialogVisible" title="修改密码" width="480px">
      <ui-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <ui-form-item label="当前密码" prop="oldPassword">
          <ui-input v-model="passwordForm.oldPassword" type="password" show-password />
        </ui-form-item>
        <ui-form-item label="新密码" prop="newPassword">
          <ui-input v-model="passwordForm.newPassword" type="password" show-password />
        </ui-form-item>
        <ui-form-item label="确认新密码" prop="confirmPassword">
          <ui-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </ui-form-item>
      </ui-form>

      <template #footer>
        <ui-button @click="passwordDialogVisible = false">取消</ui-button>
        <ui-button type="primary" :loading="submittingPassword" @click="changePassword">确认修改</ui-button>
      </template>
    </ui-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message as uiMessage } from '@/services/feedback'
import LoadingState from '../../components/LoadingState.vue'
import { useUserStore } from '../../store'
import api from '../../api'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'

const userStore = useUserStore()
const loading = ref(true)
const profileDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const submittingPassword = ref(false)
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

const settings = reactive({
  notifications: true,
  deadlineReminder: true,
  aiFeedback: true
})

const stats = reactive({
  totalExperiments: 0,
  completedExperiments: 0,
  inProgressExperiments: 0,
  averageScore: 0
})

const activityList = ref([
  {
    title: '等待同步学习数据',
    content: '当前页面会优先展示最近一次登录后的本地信息，学习数据加载后会自动更新。',
    time: '刚刚',
    color: '#409eff'
  }
])

const profileForm = reactive({
  name: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const currentUser = computed(() => userStore.userInfo || {})
const displayName = computed(() => currentUser.value.name || currentUser.value.username || '学生')
const studentId = computed(() => currentUser.value.usernum || currentUser.value.id || '')
const className = computed(() => currentUser.value.class || currentUser.value.classname || '')
const gradeText = computed(() => {
  const match = String(className.value || '').match(/(\d{2}|\d{4})/)
  return match ? `${match[1]}级` : '当前学期'
})
const avatarText = computed(() => displayName.value.slice(0, 1).toUpperCase())

const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度保持在 2 到 20 个字符之间', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (_rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
    return
  }
  callback()
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

function openProfileDialog() {
  profileForm.name = currentUser.value.name || currentUser.value.username || ''
  profileForm.email = currentUser.value.email || ''
  profileForm.phone = currentUser.value.phone || ''
  profileDialogVisible.value = true
}

async function saveProfile() {
  const valid = await profileFormRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    const response = await api.updateMyProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone
    })
    const profileData = response?.data || response || {}
    userStore.updateUserInfo({
      name: profileData.name || profileForm.name,
      username: profileData.username || currentUser.value.username || profileForm.name,
      usernum: profileData.studentId || profileData.usernum || currentUser.value.usernum,
      class: profileData.className || profileData.class || currentUser.value.class,
      classname: profileData.className || profileData.class || currentUser.value.classname,
      email: profileData.email || profileForm.email,
      phone: profileData.phone || profileForm.phone
    })
    profileDialogVisible.value = false
    uiMessage.success('展示信息已更新')
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '展示信息更新失败'))
  }
}

function openPasswordDialog() {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

async function changePassword() {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid) return

  submittingPassword.value = true
  try {
    const data = await api.updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    if (data?.success) {
      passwordDialogVisible.value = false
      uiMessage.success('密码修改成功，请使用新密码重新登录')
      return
    }

    uiMessage.error(getFriendlyResponseMessage(data, '密码修改失败，请检查当前密码后重试'))
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '密码修改失败，请检查当前密码后重试'))
  } finally {
    submittingPassword.value = false
  }
}

async function loadProfile() {
  loading.value = true
  try {
    const [profileRes, experimentsRes] = await Promise.allSettled([
      api.getStudentInfo(),
      api.getExperimentList()
    ])

    if (profileRes.status === 'fulfilled') {
      const profileData = profileRes.value?.data || profileRes.value || {}
      userStore.updateUserInfo({
        name: profileData.studentName || profileData.name || currentUser.value.name,
        username: profileData.username || currentUser.value.username,
        usernum: profileData.studentId || currentUser.value.usernum,
        class: profileData.className || currentUser.value.class,
        classname: profileData.className || currentUser.value.classname,
        email: profileData.email || currentUser.value.email,
        phone: profileData.phone || currentUser.value.phone
      })
    }

    if (experimentsRes.status === 'fulfilled') {
      const list = experimentsRes.value?.data || experimentsRes.value || []
      if (Array.isArray(list)) {
        stats.totalExperiments = list.length
        stats.completedExperiments = list.filter(item => item.status === 'completed').length
        stats.inProgressExperiments = list.filter(item => item.status === 'in_progress').length
        const scored = list.filter(item => Number(item.score) > 0)
        stats.averageScore = scored.length
          ? Math.round(scored.reduce((sum, item) => sum + Number(item.score), 0) / scored.length)
          : 0

        activityList.value = list.slice(0, 4).map(item => ({
          title: item.name || '实验任务',
          content: item.status === 'completed'
            ? `已完成，当前成绩 ${item.score ?? '待评分'}`
            : item.status === 'in_progress'
              ? '进行中，建议继续补充报告和代码内容。'
              : '尚未开始，可前往实验列表查看要求。',
          time: item.deadline || item.createdTime || '近期',
          color: item.status === 'completed' ? '#67c23a' : item.status === 'in_progress' ? '#e6a23c' : '#909399'
        }))
      }
    }
  } catch {
    // Ignore and keep the fallback data already shown on the page.
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)
</script>


