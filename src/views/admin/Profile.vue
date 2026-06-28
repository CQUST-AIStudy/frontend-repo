<template>
  <div class="admin-profile [min-width:0] [min-height:100%]">
    <UiPageHeader
        class="my-page-header [margin-bottom:20px] [min-height:68px] [padding:0_20px] max-[768px]:[margin-bottom:16px] max-[768px]:[min-height:56px] max-[768px]:[padding:0_16px]"
        title="个人信息"
        description="查看和编辑您的个人信息"
    />

    <ui-row :gutter="20" class="[margin-bottom:20px]">
      <ui-col :span="8">
        <ui-card class="profile-card [margin-bottom:20px] [padding:20px] [border-radius:20px] [border:1px_solid_var(--app-border)] [box-shadow:var(--app-shadow-soft)]">
          <div class="profile-header [display:flex] [flex-direction:column] [align-items:center] [padding-bottom:20px] [border-bottom:1px_solid_var(--app-border-soft)] [&_h3]:[margin:10px_0_5px] [&_h3]:[font-size:18px] [&_p]:[margin:0] [&_p]:[font-size:14px] [&_p]:[color:var(--app-text-secondary)]">
            <ui-avatar :size="100" :src="userInfo.avatar" />
            <h3>{{ userInfo.name || '管理员' }}</h3>
            <p>{{ userInfo.role === 'admin' ? '系统管理员' : '未知角色' }}</p>
          </div>

          <div class="profile-info [margin-top:20px]">
            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:var(--app-text-secondary)] [margin-right:5px] [font-size:12px] [font-weight:600]">用户ID</span>
              <span class="info-value [color:var(--app-text)] [font-weight:500] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.id }}</span>
            </div>

            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:var(--app-text-secondary)] [margin-right:5px] [font-size:12px] [font-weight:600]">部门</span>
              <span class="info-value [color:var(--app-text)] [font-weight:500] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.department || '未设置' }}</span>
            </div>

            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:var(--app-text-secondary)] [margin-right:5px] [font-size:12px] [font-weight:600]">电子邮箱</span>
              <span class="info-value [color:var(--app-text)] [font-weight:500] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.email || '未设置' }}</span>
            </div>

            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:var(--app-text-secondary)] [margin-right:5px] [font-size:12px] [font-weight:600]">联系电话</span>
              <span class="info-value [color:var(--app-text)] [font-weight:500] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.phone || '未设置' }}</span>
            </div>
          </div>
        </ui-card>
      </ui-col>

      <ui-col :span="16">
        <ui-card class="form-card [margin-bottom:20px] [border-radius:22px] [border:1px_solid_var(--app-border)] [box-shadow:var(--app-shadow-soft)]">
          <template #header>
            <div class="card-header [font-weight:600] [display:flex] [justify-content:space-between] [align-items:center] [gap:12px]">
              <span>修改个人信息</span>
            </div>
          </template>

          <ui-form ref="formRef" :model="form" label-width="100px">
            <ui-form-item label="用户名">
              <ui-input v-model="form.name" placeholder="请输入用户名" />
            </ui-form-item>

            <ui-form-item label="电子邮箱">
              <ui-input v-model="form.email" placeholder="请输入电子邮箱" />
            </ui-form-item>

            <ui-form-item label="联系电话">
              <ui-input v-model="form.phone" placeholder="请输入联系电话" />
            </ui-form-item>

            <ui-form-item label="部门">
              <ui-input v-model="form.department" placeholder="请输入部门" />
            </ui-form-item>
          </ui-form>

          <div class="[display:flex] [gap:12px] [padding:0_0_0_100px] [margin-top:8px]">
            <ui-button type="primary" native-type="button" :loading="savingProfile" @click="saveProfile">保存修改</ui-button>
            <ui-button native-type="button" @click="resetForm">重置</ui-button>
          </div>
        </ui-card>

        <ui-card class="form-card [margin-bottom:20px] [border-radius:22px] [border:1px_solid_var(--app-border)] [box-shadow:var(--app-shadow-soft)]">
          <template #header>
            <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [gap:12px]">
              <span>修改密码</span>
            </div>
          </template>

          <ui-form ref="passwordFormRef" :model="passwordForm" label-width="100px">
            <ui-form-item label="当前密码">
              <ui-input v-model="passwordForm.currentPassword" type="password" show-password placeholder="请输入当前密码" />
            </ui-form-item>

            <ui-form-item label="新密码">
              <ui-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码（至少6位）" />
            </ui-form-item>

            <ui-form-item label="确认新密码">
              <ui-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
            </ui-form-item>
          </ui-form>

          <div class="[display:flex] [gap:12px] [padding:0_0_0_100px] [margin-top:8px]">
            <ui-button type="primary" native-type="button" :loading="changingPassword" @click="changePassword">修改密码</ui-button>
            <ui-button native-type="button" @click="resetPasswordForm">重置</ui-button>
          </div>
        </ui-card>

        <AppearanceSettings class="mt-[20px]" />
      </ui-col>
    </ui-row>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message as uiMessage } from '@/services/feedback'
import api from '../../api'
import { useUserStore } from '../../store'
import AppearanceSettings from '../../components/AppearanceSettings.vue'

const router = useRouter()
const userStore = useUserStore()
const savingProfile = ref(false)
const changingPassword = ref(false)

const userInfo = ref({
  name: '',
  role: 'admin',
  avatar: '',
  id: '',
  department: '',
  email: '',
  phone: ''
})

const formRef = ref(null)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  department: ''
})

const passwordFormRef = ref(null)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const applyProfile = (profile = {}) => {
  userInfo.value = {
    ...userInfo.value,
    ...profile,
    role: profile.role || 'admin'
  }
  resetForm()
  userStore.updateUserInfo({
    ...(userStore.userInfo || {}),
    ...userInfo.value
  })
}

const loadProfile = async () => {
  try {
    const response = await api.getMyProfile()
    applyProfile(response?.data || response || {})
  } catch (error) {
    uiMessage.error('加载个人资料失败')
  }
}

const saveProfile = async () => {
  savingProfile.value = true
  try {
    const response = await api.updateMyProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      department: form.department
    })
    applyProfile(response?.data || response || {})
    uiMessage.success('个人信息已更新')
  } catch (error) {
    uiMessage.error('保存个人信息失败')
  } finally {
    savingProfile.value = false
  }
}

const resetForm = () => {
  form.name = userInfo.value.name || ''
  form.email = userInfo.value.email || ''
  form.phone = userInfo.value.phone || ''
  form.department = userInfo.value.department || ''
}

const changePassword = async () => {
  if (!passwordForm.currentPassword) {
    uiMessage.warning('请输入当前密码')
    return
  }
  if (!passwordForm.newPassword) {
    uiMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    uiMessage.warning('新密码长度不能少于6位')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    uiMessage.warning('两次输入的新密码不一致')
    return
  }

  changingPassword.value = true
  try {
    const response = await api.updatePassword({
      oldPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    if (response?.success === false) {
      uiMessage.error(response.message || '密码修改失败，请检查当前密码后重试')
      return
    }
    uiMessage.success('密码修改成功，请使用新密码重新登录')
    resetPasswordForm()
    setTimeout(() => {
      userStore.logout()
      router.push('/login')
    }, 1500)
  } catch (error) {
    uiMessage.error('密码修改失败，请检查当前密码后重试')
  } finally {
    changingPassword.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

onMounted(loadProfile)
</script>
