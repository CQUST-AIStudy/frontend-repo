<template>
  <div class="h-full">
    <UiPageHeader class="p-5" title="个人信息" description="查看并维护教师账户信息、登录密码和 PTA 账号绑定。" />

    <div class="grid grid-cols-[1fr_2fr] gap-5 max-[768px]:grid-cols-1 px-5">
      <!-- Left column: Profile card -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 h-fit">
        <div class="flex flex-col items-center pb-5 border-b border-[#f0f0f0]">
          <img :src="avatarUrl" class="w-[100px] h-[100px] rounded-full object-cover border-2 border-black/[0.06]" alt="avatar" />
          <h3 class="mt-2.5 mb-1 text-lg font-semibold">{{ displayName }}</h3>
          <p class="m-0 text-sm text-[#aeaeb2]">{{ roleText }}</p>
        </div>

        <div class="mt-5">
          <div class="flex justify-between mb-4 items-center">
            <span class="text-xs font-semibold text-[#8092a6]">用户名</span>
            <span class="text-sm font-medium text-[#24384f] leading-[1.7] break-words">{{ userInfo.username }}</span>
          </div>
          <div class="flex justify-between mb-4 items-center">
            <span class="text-xs font-semibold text-[#8092a6]">角色</span>
            <span class="text-sm font-medium text-[#24384f] leading-[1.7] break-words">{{ roleText }}</span>
          </div>
          <div class="flex justify-between mb-4 items-center">
            <span class="text-xs font-semibold text-[#8092a6]">工号/学号</span>
            <span class="text-sm font-medium text-[#24384f] leading-[1.7] break-words">{{ userInfo.usernum || '未设置' }}</span>
          </div>
          <div class="flex justify-between mb-4 items-center">
            <span class="text-xs font-semibold text-[#8092a6]">电子邮箱</span>
            <span class="text-sm font-medium text-[#24384f] leading-[1.7] break-words">{{ userInfo.email || '未设置' }}</span>
          </div>
          <div class="flex justify-between mb-4 items-center">
            <span class="text-xs font-semibold text-[#8092a6]">班级</span>
            <span class="text-sm font-medium text-[#24384f] leading-[1.7] break-words">{{ userInfo.class || '未设置' }}</span>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="flex flex-col gap-5">
        <!-- PTA binding card -->
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="flex justify-between items-center mb-4 pb-2.5 border-b border-black/[0.06]">
            <span class="font-semibold text-[#1d1d1f]">绑定 PTA 账号</span>
          </div>

          <p class="mb-3 text-[13px] leading-[1.7] text-[#6e6e73]">
            绑定后，PTA 数据同步会优先使用此账号登录；在同步页面临时输入的账号密码会覆盖本次任务。
          </p>

          <div v-if="hasBoundCredential" class="mb-4 px-3 py-2.5 rounded-[10px] bg-[#e6f4ea] text-[#1e8e3e] text-[13px]">
            当前已绑定 PTA 账号：<strong>{{ ptaCredential.ptaUsername }}</strong>
          </div>
          <div v-else class="mb-4 px-3 py-2.5 rounded-[10px] bg-[#fef7e0] text-[#b26a00] text-[13px]">
            当前未绑定 PTA 账号。
          </div>

          <div class="mb-4">
            <label class="block text-[13px] font-medium text-[#6e6e73] mb-2">PTA 账号</label>
            <UiInput v-model="ptaForm.ptaUsername" type="text" placeholder="请输入教师自己的 PTA 登录账号" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm" />
          </div>
          <div class="mb-4">
            <label class="block text-[13px] font-medium text-[#6e6e73] mb-2">PTA 密码</label>
            <UiInput v-model="ptaForm.ptaPassword" type="password" placeholder="请输入 PTA 登录密码" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm" />
          </div>
          <div class="flex gap-3">
            <UiButton :disabled="savingPtaCredential" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50" @click="savePtaCredential">
              {{ savingPtaCredential ? '保存中...' : '保存绑定' }}
            </UiButton>
            <UiButton :disabled="!hasBoundCredential" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50" @click="clearPtaCredential">
              解除绑定
            </UiButton>
          </div>
        </div>

        <!-- Change password card -->
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <div class="flex justify-between items-center mb-4 pb-2.5 border-b border-black/[0.06]">
            <span class="font-semibold text-[#1d1d1f]">修改密码</span>
          </div>

          <div class="mb-4">
            <label class="block text-[13px] font-medium text-[#6e6e73] mb-2">当前密码</label>
            <UiInput v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm" />
            <p v-if="passwordErrors.oldPassword" class="text-[12px] text-[#ff3b30] mt-1.5">{{ passwordErrors.oldPassword }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-[13px] font-medium text-[#6e6e73] mb-2">新密码</label>
            <UiInput v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm" />
            <p v-if="passwordErrors.newPassword" class="text-[12px] text-[#ff3b30] mt-1.5">{{ passwordErrors.newPassword }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-[13px] font-medium text-[#6e6e73] mb-2">确认新密码</label>
            <UiInput v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm" />
            <p v-if="passwordErrors.confirmPassword" class="text-[12px] text-[#ff3b30] mt-1.5">{{ passwordErrors.confirmPassword }}</p>
          </div>
          <div class="flex gap-3">
            <UiButton :disabled="changingPassword" class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50" @click="changePassword">
              {{ changingPassword ? '修改中...' : '修改密码' }}
            </UiButton>
            <UiButton class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="resetPasswordForm">
              重置
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import axios from 'axios'
import { getUserInfo } from '../../constants/auth'
import { API_BASE_URL_WITH_SLASH } from '../../config/runtime'
import {
  clearTeacherPtaCredentials,
  getTeacherPtaCredentials,
  updateTeacherPtaCredentials
} from '../../api/tap'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../../utils/errorMessage'
import { useFormValidation } from '../../composables/useFormValidation'

const apiClient = axios.create({
  baseURL: API_BASE_URL_WITH_SLASH,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

const userInfo = computed(() => getUserInfo() || {})
const displayName = computed(() => userInfo.value.username || '教师用户')
const avatarUrl = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const roleText = computed(() => {
  const map = { teacher: '教师', student: '学生', admin: '管理员' }
  return map[userInfo.value.role] || '用户'
})

const changingPassword = ref(false)
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const ptaCredential = reactive({
  ptaUsername: '',
  bound: false,
  lastUpdated: ''
})
const ptaForm = reactive({
  ptaUsername: '',
  ptaPassword: ''
})
const savingPtaCredential = ref(false)
const hasBoundCredential = computed(() => !!ptaCredential.bound)

const validateConfirm = (value) => {
  if (value !== passwordForm.newPassword) return '两次输入的密码不一致'
  return null
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码' }],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度不能小于6位' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    { validator: validateConfirm }
  ]
}

const { errors: passwordErrors, validate: validatePasswordForm, resetFields: resetPasswordErrors } = useFormValidation(passwordRules)

async function loadPtaCredential() {
  try {
    const res = await getTeacherPtaCredentials()
    const data = res?.data || res || {}
    ptaCredential.ptaUsername = data?.ptaUsername || ''
    ptaCredential.bound = !!data?.bound
    ptaCredential.lastUpdated = data?.lastUpdated || ''
    ptaForm.ptaUsername = data?.ptaUsername || ''
    ptaForm.ptaPassword = ''
  } catch (error) {
    ptaCredential.ptaUsername = ''
    ptaCredential.bound = false
    ptaCredential.lastUpdated = ''
  }
}

async function savePtaCredential() {
  const username = ptaForm.ptaUsername.trim()
  const password = ptaForm.ptaPassword
  if (!username || !password) {
    uiMessage.warning('请输入完整的 PTA 账号和密码')
    return
  }

  savingPtaCredential.value = true
  try {
    const res = await updateTeacherPtaCredentials({
      ptaUsername: username,
      ptaPassword: password
    })
    const data = res?.data || res || {}
    ptaCredential.ptaUsername = data?.ptaUsername || username
    ptaCredential.bound = !!data?.bound
    ptaCredential.lastUpdated = data?.lastUpdated || ''
    ptaForm.ptaPassword = ''
    uiMessage.success('PTA 账号绑定已保存')
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, 'PTA 账号绑定保存失败，请稍后重试'))
  } finally {
    savingPtaCredential.value = false
  }
}

async function clearPtaCredential() {
  try {
    await messageBox.confirm(
      '解除绑定后，系统将不再自动使用此 PTA 账号进行同步。是否继续？',
      '解除 PTA 绑定',
      {
        confirmButtonText: '解除绑定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  savingPtaCredential.value = true
  try {
    await clearTeacherPtaCredentials()
    ptaCredential.ptaUsername = ''
    ptaCredential.bound = false
    ptaCredential.lastUpdated = ''
    ptaForm.ptaUsername = ''
    ptaForm.ptaPassword = ''
    uiMessage.success('PTA 账号绑定已解除')
  } catch (error) {
    uiMessage.error(getFriendlyErrorMessage(error, '解除 PTA 绑定失败，请稍后重试'))
  } finally {
    savingPtaCredential.value = false
  }
}

const changePassword = async () => {
  if (!validatePasswordForm(passwordForm)) return
  changingPassword.value = true
  try {
    const res = await apiClient.post('/api/user/password', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    const data = res.data || res
    if (data.success) {
      uiMessage.success('密码修改成功')
      resetPasswordForm()
    } else {
      uiMessage.error(getFriendlyResponseMessage(data, '密码修改失败，请检查当前密码后重试'))
    }
  } catch (e) {
    uiMessage.error(getFriendlyErrorMessage(e, '密码修改失败，请检查当前密码后重试'))
  } finally {
    changingPassword.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  resetPasswordErrors()
}

onMounted(() => {
  loadPtaCredential()
})
</script>
