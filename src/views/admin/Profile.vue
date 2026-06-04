<template>
  <div class="admin-profile [min-width:0] [min-height:100%]">
    <UiPageHeader
        class="my-page-header [margin-bottom:20px] [min-height:68px] [padding:0_20px] max-[768px]:[margin-bottom:16px] max-[768px]:[min-height:56px] max-[768px]:[padding:0_16px]"
      title="个人信息"
      description="查看和编辑您的个人信息"
    />

    <ui-row :gutter="20" class="[margin-bottom:20px]">
      <ui-col :span="8">
        <ui-card class="profile-card [margin-bottom:20px] [padding:20px] [border-radius:20px] [border:1px_solid_#dbe5ef] [box-shadow:0_14px_34px_rgba(22,_48,_79,_0.06)]">
          <div class="profile-header [display:flex] [flex-direction:column] [align-items:center] [padding-bottom:20px] [border-bottom:1px_solid_#f0f0f0] [&_h3]:[margin:10px_0_5px] [&_h3]:[font-size:18px] [&_p]:[margin:0] [&_p]:[font-size:14px] [&_p]:[color:#909399]">
            <ui-avatar :size="100" :src="userInfo.avatar" />
            <h3>{{ userInfo.name }}</h3>
            <p>{{ userInfo.role === 'admin' ? '系统管理员' : '未知角色' }}</p>
          </div>

          <div class="profile-info [margin-top:20px]">
            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:#909399] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">用户ID</span>
              <span class="info-value [color:#303133] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.id }}</span>
            </div>

            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:#909399] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">部门</span>
              <span class="info-value [color:#303133] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.department }}</span>
            </div>

            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:#909399] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">电子邮箱</span>
              <span class="info-value [color:#303133] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.email }}</span>
            </div>

            <div class="info-item [display:flex] [justify-content:space-between] [margin-bottom:15px] [align-items:center]">
              <span class="info-label [color:#909399] [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">联系电话</span>
              <span class="info-value [color:#303133] [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ userInfo.phone }}</span>
            </div>
          </div>
        </ui-card>
      </ui-col>

      <ui-col :span="16">
        <ui-card class="form-card [margin-bottom:20px] [border-radius:22px] [border:1px_solid_#dbe4ef] [box-shadow:0_12px_32px_rgba(48,_72,_104,_0.06)] [border-radius:20px] [border:1px_solid_#dbe5ef] [box-shadow:0_12px_30px_rgba(28,_52,_84,_0.06)]">
          <template #header>
            <div class="card-header [font-weight:600] [display:flex] [justify-content:space-between] [align-items:center] [gap:12px]">
              <span>修改个人信息</span>
            </div>
          </template>

          <ui-form ref="formRef" :model="form" label-width="100px">
            <ui-form-item label="用户名">
              <ui-input v-model="form.name" />
            </ui-form-item>

            <ui-form-item label="电子邮箱">
              <ui-input v-model="form.email" />
            </ui-form-item>

            <ui-form-item label="联系电话">
              <ui-input v-model="form.phone" />
            </ui-form-item>

            <ui-form-item label="部门">
              <ui-input v-model="form.department" />
            </ui-form-item>

            <ui-form-item>
              <ui-button type="primary" @click="saveProfile">保存修改</ui-button>
              <ui-button @click="resetForm">重置</ui-button>
            </ui-form-item>
          </ui-form>
        </ui-card>

        <ui-card class="form-card [margin-bottom:20px] [border-radius:22px] [border:1px_solid_#dbe4ef] [box-shadow:0_12px_32px_rgba(48,_72,_104,_0.06)] [border-radius:20px] [border:1px_solid_#dbe5ef] [box-shadow:0_12px_30px_rgba(28,_52,_84,_0.06)]">
          <template #header>
            <div class="card-header [display:flex] [justify-content:space-between] [align-items:center] [gap:12px]">
              <span>修改密码</span>
            </div>
          </template>

          <ui-form ref="passwordFormRef" :model="passwordForm" label-width="100px">
            <ui-form-item label="当前密码">
              <ui-input v-model="passwordForm.currentPassword" type="password" show-password />
            </ui-form-item>

            <ui-form-item label="新密码">
              <ui-input v-model="passwordForm.newPassword" type="password" show-password />
            </ui-form-item>

            <ui-form-item label="确认新密码">
              <ui-input v-model="passwordForm.confirmPassword" type="password" show-password />
            </ui-form-item>

            <ui-form-item>
              <ui-button type="primary" @click="changePassword">修改密码</ui-button>
              <ui-button @click="resetPasswordForm">重置</ui-button>
            </ui-form-item>
          </ui-form>
        </ui-card>
      </ui-col>
    </ui-row>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message as uiMessage } from '@/services/feedback'
import api from '../../api'
import { useUserStore } from '../../store'

const userStore = useUserStore()
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
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    uiMessage.warning('两次输入的新密码不一致')
    return
  }

  try {
    const response = await api.updatePassword({
      oldPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    if (response?.success === false) {
      uiMessage.error(response.message || '密码修改失败')
      return
    }
    uiMessage.success('密码已成功修改')
    resetPasswordForm()
  } catch (error) {
    uiMessage.error('密码修改失败，请检查当前密码后重试')
  }
}

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

onMounted(loadProfile)
</script>


