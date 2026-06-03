<template>
  <div class="admin-profile [height:100%]">
    <UiPageHeader
        class="my-page-header [padding:20px]"
      title="个人信息"
      description="查看和编辑您的个人信息"
    />

    <ui-row :gutter="20">
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
            <div class="card-header [font-weight:600] [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
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

        <ui-card class="form-card [border-radius:22px] [border:1px_solid_#dbe4ef] [box-shadow:0_12px_32px_rgba(48,_72,_104,_0.06)] [border-radius:20px] [border:1px_solid_#dbe5ef] [box-shadow:0_12px_30px_rgba(28,_52,_84,_0.06)]">
          <template #header>
            <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
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
import { computed, onMounted, reactive, ref } from 'vue'
import { message as uiMessage } from '@/services/feedback'

// 获取用户信息
const userInfo = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  try {
    return userInfoStr ? JSON.parse(userInfoStr) : {
      name: '管理员',
      role: 'admin',
      avatar: '',
      id: '',
      department: '',
      email: '',
      phone: ''
    }
  } catch (error) {
    return {
      name: '管理员',
      role: 'admin',
      avatar: '',
      id: '',
      department: '',
      email: '',
      phone: ''
    }
  }
})

// 表单数据
const formRef = ref(null)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  department: ''
})

// 密码表单
const passwordFormRef = ref(null)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 保存个人信息
const saveProfile = () => {
  // 模拟保存操作
  uiMessage.success('个人信息已更新')

  // 更新本地存储的用户信息
  const updatedInfo = {
    ...userInfo.value,
    name: form.name,
    email: form.email,
    phone: form.phone,
    department: form.department
  }
  localStorage.setItem('userInfo', JSON.stringify(updatedInfo))
}

// 重置表单
const resetForm = () => {
  form.name = userInfo.value.name
  form.email = userInfo.value.email
  form.phone = userInfo.value.phone
  form.department = userInfo.value.department
}

// 修改密码
const changePassword = () => {
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

  // 模拟修改密码操作
  uiMessage.success('密码已成功修改')
  resetPasswordForm()
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 初始化表单数据
onMounted(() => {
  // 初始化个人信息表单
  form.name = userInfo.value.name
  form.email = userInfo.value.email
  form.phone = userInfo.value.phone
  form.department = userInfo.value.department
})
</script>


