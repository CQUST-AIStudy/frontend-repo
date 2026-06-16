<template>
  <div class="flex h-[calc(100dvh-168px)] min-w-0 flex-col overflow-hidden max-[1180px]:h-auto max-[1180px]:overflow-visible">
    <header class="mb-3 flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white/85 px-5 py-3 shadow-[0_3px_12px_rgba(0,0,0,0.04)] backdrop-blur-[20px] max-[640px]:flex-col max-[640px]:items-stretch">
      <div class="min-w-0">
        <p class="text-[12px] font-semibold text-[var(--app-primary)]">实验教学</p>
        <h1 class="mt-0.5 text-[21px] font-bold leading-tight text-[#1d1d1f]">创建实验</h1>
        <p class="mt-1 text-[13px] leading-relaxed text-[#6e6e73]">创建数据结构实验任务，设置班级范围与发布状态。</p>
      </div>
      <UiButton
        class="h-9 shrink-0 rounded-[10px] border border-black/[0.08] bg-white px-4 text-sm font-medium text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:bg-[#f5f5f7] active:scale-[0.96] max-[640px]:w-full"
        @click="goBack"
      >
        返回列表
      </UiButton>
    </header>

    <UiForm
      @submit.prevent="submitForm"
      class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-4 overflow-hidden max-[1180px]:grid-cols-1 max-[1180px]:overflow-visible"
    >
      <section class="min-h-0 min-w-0 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white/95 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] max-[1180px]:overflow-visible max-[640px]:p-4">
        <div class="mb-4">
          <p class="text-[12px] font-semibold text-[var(--app-primary)]">基础信息</p>
          <h2 class="mt-0.5 text-[19px] font-bold text-[#1d1d1f]">实验内容</h2>
          <p class="mt-1 text-[13px] leading-relaxed text-[#6e6e73]">填写学生可见的任务名称、截止时间和实验说明。</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="mb-1.5 block text-[13px] font-semibold text-[#1d1d1f]">实验名称</label>
            <UiInput
              v-model="formData.name"
              type="text"
              placeholder="请输入实验名称"
              class="h-10 w-full rounded-[12px] border border-black/[0.08] bg-white px-3.5 text-sm text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all placeholder:text-[#9aa4b2] focus:border-[var(--app-primary)] focus:shadow-[0_0_0_4px_rgba(194,112,62,0.12)]"
              @blur="validateField('name', formData.name)"
            />
            <p v-if="errors.name" class="mt-1.5 text-xs text-[#c44b3f]">{{ errors.name }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-[13px] font-semibold text-[#1d1d1f]">截止日期</label>
            <UiDatePicker
              v-model="formData.deadline"
              type="datetime"
              placeholder="选择截止日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-full"
            />
            <p v-if="errors.deadline" class="mt-1.5 text-xs text-[#c44b3f]">{{ errors.deadline }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-[13px] font-semibold text-[#1d1d1f]">实验描述</label>
            <textarea
              v-model="formData.description"
              rows="4"
              placeholder="请输入实验描述"
              class="w-full resize-y rounded-[12px] border border-black/[0.08] bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all placeholder:text-[#9aa4b2] focus:border-[var(--app-primary)] focus:shadow-[0_0_0_4px_rgba(194,112,62,0.12)]"
              @blur="validateField('description', formData.description)"
            ></textarea>
            <p v-if="errors.description" class="mt-1.5 text-xs text-[#c44b3f]">{{ errors.description }}</p>
          </div>
        </div>

        <div class="mt-5 border-t border-black/[0.06] pt-4">
          <div class="mb-3 flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-stretch">
            <div class="min-w-0">
              <p class="text-[12px] font-semibold text-[var(--app-primary)]">任务要求</p>
              <h2 class="mt-0.5 text-[18px] font-bold text-[#1d1d1f]">实验要求</h2>
            </div>
            <UiButton
              type="button"
              class="h-9 rounded-[10px] border border-[var(--app-primary)]/20 bg-[var(--app-primary)]/10 px-3 text-[13px] font-semibold text-[var(--app-primary)] transition-colors hover:bg-[var(--app-primary)]/15"
              @click="addRequirement"
            >
              <Plus class="h-4 w-4" />
              添加要求
            </UiButton>
          </div>

          <div class="space-y-2.5">
            <div
              v-for="(req, index) in formData.requirements"
              :key="index"
              class="flex items-center gap-2.5 rounded-[13px] border border-black/[0.06] bg-[#fbfbfd] p-2.5 transition-colors focus-within:border-[var(--app-primary)]/45 focus-within:bg-white"
            >
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary)]/10 text-[12px] font-bold text-[var(--app-primary)]">
                {{ index + 1 }}
              </span>
              <UiInput
                v-model="formData.requirements[index]"
                type="text"
                placeholder="请输入实验要求"
                class="h-9 min-w-0 flex-1 rounded-[10px] border border-transparent bg-white px-3 text-sm text-[#1d1d1f] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-all placeholder:text-[#9aa4b2] focus:shadow-[0_0_0_4px_rgba(194,112,62,0.12),inset_0_0_0_1px_rgba(194,112,62,0.45)]"
              />
              <UiButton
                type="button"
                class="h-8 w-8 shrink-0 rounded-[10px] border border-transparent bg-transparent px-0 text-[#c44b3f] transition-colors hover:bg-[rgba(196,75,63,0.08)]"
                title="删除"
                @click="removeRequirement(index)"
              >
                <Delete class="h-4 w-4" />
              </UiButton>
            </div>
          </div>
        </div>
      </section>

      <aside class="min-h-0 min-w-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-white/95 shadow-[0_4px_16px_rgba(0,0,0,0.06)] max-[1180px]:overflow-visible">
        <div class="flex h-full min-h-0 flex-col max-[1180px]:h-auto">
          <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 max-[1180px]:overflow-visible">
            <section>
              <p class="text-[12px] font-semibold text-[var(--app-primary)]">发布范围</p>
              <h2 class="mt-0.5 text-[18px] font-bold text-[#1d1d1f]">班级选择</h2>

              <div class="mt-3 grid gap-2">
                <label
                  v-for="item in classList"
                  :key="item.id"
                  class="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-[12px] border px-3 py-2 text-sm transition-all"
                  :class="formData.classes.includes(item.id) ? 'border-[var(--app-primary)]/45 bg-[var(--app-primary)]/10 text-[var(--app-primary)] shadow-[0_0_0_3px_rgba(194,112,62,0.08)]' : 'border-black/[0.08] bg-white text-[#1d1d1f] hover:border-[var(--app-primary)]/25 hover:bg-[#f8fbff]'"
                >
                  <span class="min-w-0 truncate font-medium">{{ item.name }}</span>
                  <span class="h-4 w-4 rounded-full border transition-colors" :class="formData.classes.includes(item.id) ? 'border-[var(--app-primary)] bg-[var(--app-primary)] shadow-[inset_0_0_0_3px_white]' : 'border-black/20 bg-white'"></span>
                  <UiInput
                    v-model="formData.classes"
                    type="checkbox"
                    :value="item.id"
                    class="sr-only"
                  />
                </label>

                <div v-if="!classList.length" class="rounded-[12px] border border-dashed border-black/[0.12] bg-[#f5f5f7] px-4 py-5 text-center text-[13px] text-[#6e6e73]">
                  暂无可选班级
                </div>
              </div>
              <p v-if="errors.classes" class="mt-1.5 text-xs text-[#c44b3f]">{{ errors.classes }}</p>
            </section>

            <section class="border-t border-black/[0.06] pt-4">
              <p class="text-[12px] font-semibold text-[var(--app-primary)]">发布设置</p>
              <h2 class="mt-0.5 text-[18px] font-bold text-[#1d1d1f]">状态</h2>

              <div class="mt-3 grid gap-2.5">
                <button
                  type="button"
                  class="rounded-[14px] border p-3.5 text-left transition-all"
                  :class="formData.status === 'draft' ? 'border-[var(--app-primary)]/45 bg-[var(--app-primary)]/10 shadow-[0_0_0_3px_rgba(194,112,62,0.08)]' : 'border-black/[0.08] bg-white hover:border-[var(--app-primary)]/25 hover:bg-[#f8fbff]'"
                  :aria-pressed="formData.status === 'draft'"
                  @click="setStatus('draft')"
                >
                  <span class="block text-sm font-bold text-[#1d1d1f]">保存为草稿</span>
                  <span class="mt-1 block text-[12px] leading-relaxed text-[#6e6e73]">暂不对学生发布，可稍后继续编辑。</span>
                </button>

                <button
                  type="button"
                  class="rounded-[14px] border p-3.5 text-left transition-all"
                  :class="formData.status === 'active' ? 'border-[#6b8f6b]/45 bg-[rgba(107,143,107,0.1)] shadow-[0_0_0_3px_rgba(107,143,107,0.08)]' : 'border-black/[0.08] bg-white hover:border-[#6b8f6b]/25 hover:bg-[#f8fff9]'"
                  :aria-pressed="formData.status === 'active'"
                  @click="setStatus('active')"
                >
                  <span class="block text-sm font-bold text-[#1d1d1f]">直接发布</span>
                  <span class="mt-1 block text-[12px] leading-relaxed text-[#6e6e73]">创建后学生可立即查看并提交。</span>
                </button>
              </div>
            </section>

            <section class="rounded-[16px] bg-[#1d1d1f] p-4 text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
              <p class="text-[12px] font-semibold text-white/55">创建摘要</p>
              <div class="mt-3 grid gap-2.5 text-[13px]">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-white/58">已选班级</span>
                  <span class="font-semibold">{{ formData.classes.length }} 个</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span class="text-white/58">要求条目</span>
                  <span class="font-semibold">{{ formData.requirements.length }} 条</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span class="text-white/58">发布状态</span>
                  <span class="font-semibold">{{ formData.status === 'active' ? '直接发布' : '草稿' }}</span>
                </div>
              </div>
            </section>
          </div>

          <section class="shrink-0 border-t border-black/[0.06] bg-white/95 p-4">
            <div class="flex gap-3 max-[640px]:flex-col">
              <UiButton
                type="submit"
                class="h-10 flex-1 rounded-[12px] border-none bg-gradient-to-b from-[#d49068] to-[var(--app-primary)] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(194,112,62,0.28)] transition-all hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(194,112,62,0.34)] active:scale-[0.98]"
              >
                创建实验
              </UiButton>
              <UiButton
                type="button"
                class="h-10 rounded-[12px] border border-black/[0.08] bg-[#f5f5f7] px-5 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-[#e8e8ed]"
                @click="resetForm"
              >
                重置
              </UiButton>
            </div>
          </section>
        </div>
      </aside>
    </UiForm>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { Delete, Plus } from '@/components/ui/icons'
import logger from '@/utils/logger'
import { message as uiMessage } from '@/services/feedback'
import api from '../../api'
import { useFormValidation } from '../../composables/useFormValidation'

const router = useRouter()
const classList = ref([])

// 表单数据
const formData = reactive({
  name: '',
  deadline: '',
  description: '',
  requirements: [''],
  classes: [],
  status: 'draft'
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入实验名称' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符' }
  ],
  deadline: [
    { required: true, message: '请选择截止日期' }
  ],
  description: [
    { required: true, message: '请输入实验描述' }
  ],
  classes: [
    { required: true, message: '请选择班级' }
  ]
}

const { errors, validate, validateField: _validateField, resetFields } = useFormValidation(rules)

const validateField = (field, value) => {
  _validateField(field, value, formData)
}

const normalizePtaKeyword = (value) => String(value || '').replace(/[\s\u3000]+/g, '').trim()

// 添加实验要求
const addRequirement = () => {
  formData.requirements.push('')
}

// 删除实验要求
const removeRequirement = (index) => {
  formData.requirements.splice(index, 1)
}

const setStatus = (status) => {
  formData.status = status
}

// 提交表单
const submitForm = async () => {
  const valid = validate(formData)
  if (!valid) return

  try {
    const selectedKeywords = classList.value
      .filter(item => formData.classes.some(classId => String(classId) === String(item.id)))
      .map(item => normalizePtaKeyword(item.ptaKeyword || item.name || ''))
      .filter(Boolean)
    const payload = {
      ...formData,
      class: Array.from(new Set(selectedKeywords)).join(',')
    }
    const result = await api.createExperiment(payload)
    if (result.success) {
      uiMessage.success('实验创建成功')
      router.push('/teacher/experiments')
    }
  } catch (error) {
    logger.error('创建实验失败:', error)
    uiMessage.error('创建实验失败，请稍后重试')
  }
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.deadline = ''
  formData.description = ''
  formData.requirements = ['']
  formData.classes = []
  formData.status = 'draft'
  resetFields()
}

// 返回列表
const goBack = () => {
  router.push('/teacher/experiments')
}

// 获取班级列表
const loadClassList = async () => {
  try {
    const classes = await api.getClassList()
    const list = Array.isArray(classes) ? classes : (classes?.data || [])
    classList.value = list.map(c => ({
      id: c.id,
      name: c.name || c.className || `班级${c.id}`,
      ptaKeyword: normalizePtaKeyword(c.ptaKeyword || c.pta_keyword || c.name || c.className || '')
    }))
  } catch (error) {
    logger.error('加载班级列表失败:', error)
  }
}

onMounted(() => {
  loadClassList()
})
</script>
