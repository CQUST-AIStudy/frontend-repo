<template>
  <div class="h-full">
    <page-header
      class="p-5"
      title="创建实验"
      description="创建新的数据结构实验任务"
    >
      <button
        class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none"
        @click="goBack"
      >
        返回列表
      </button>
    </page-header>

    <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-5">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- 实验名称 -->
        <div class="flex items-start gap-4">
          <label class="w-[100px] text-sm text-[#1d1d1f] pt-2.5 text-right shrink-0">实验名称</label>
          <div class="flex-1">
            <input
              v-model="formData.name"
              type="text"
              placeholder="请输入实验名称"
              class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm"
              @blur="validateField('name', formData.name)"
            />
            <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
          </div>
        </div>

        <!-- 截止日期 -->
        <div class="flex items-start gap-4">
          <label class="w-[100px] text-sm text-[#1d1d1f] pt-2.5 text-right shrink-0">截止日期</label>
          <div class="flex-1">
            <el-date-picker
              v-model="formData.deadline"
              type="datetime"
              placeholder="选择截止日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-full"
            />
            <p v-if="errors.deadline" class="mt-1 text-xs text-red-500">{{ errors.deadline }}</p>
          </div>
        </div>

        <!-- 实验描述 -->
        <div class="flex items-start gap-4">
          <label class="w-[100px] text-sm text-[#1d1d1f] pt-2.5 text-right shrink-0">实验描述</label>
          <div class="flex-1">
            <textarea
              v-model="formData.description"
              rows="4"
              placeholder="请输入实验描述"
              class="w-full px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm resize-y"
              @blur="validateField('description', formData.description)"
            ></textarea>
            <p v-if="errors.description" class="mt-1 text-xs text-red-500">{{ errors.description }}</p>
          </div>
        </div>

        <!-- 实验要求 -->
        <div class="flex items-start gap-4">
          <label class="w-[100px] text-sm text-[#1d1d1f] pt-2.5 text-right shrink-0">实验要求</label>
          <div class="flex-1 flex flex-col gap-2.5">
            <div v-for="(req, index) in formData.requirements" :key="index" class="flex items-center gap-2.5">
              <input
                v-model="formData.requirements[index]"
                type="text"
                placeholder="请输入实验要求"
                class="flex-1 h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm"
              />
              <button
                type="button"
                class="text-sm text-red-500 hover:text-red-600 cursor-pointer bg-transparent border-none transition-colors"
                @click="removeRequirement(index)"
              >
                删除
              </button>
            </div>
            <button
              type="button"
              class="self-start text-sm text-[#007aff] hover:text-[#3898ff] cursor-pointer bg-transparent border-none transition-colors"
              @click="addRequirement"
            >
              + 添加要求
            </button>
          </div>
        </div>

        <!-- 班级选择 -->
        <div class="flex items-start gap-4">
          <label class="w-[100px] text-sm text-[#1d1d1f] pt-2.5 text-right shrink-0">班级选择</label>
          <div class="flex-1">
            <div class="flex flex-wrap gap-2 p-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] min-h-[40px]">
              <label
                v-for="item in classList"
                :key="item.id"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm cursor-pointer transition-all"
                :class="formData.classes.includes(item.id) ? 'bg-[#007aff]/10 text-[#007aff] shadow-[inset_0_0_0_1px_rgba(0,122,255,0.3)]' : 'bg-white text-[#1d1d1f] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] hover:bg-[#e8e8ed]'"
              >
                <input
                  type="checkbox"
                  :value="item.id"
                  v-model="formData.classes"
                  class="sr-only"
                />
                {{ item.name }}
              </label>
            </div>
            <p v-if="errors.classes" class="mt-1 text-xs text-red-500">{{ errors.classes }}</p>
          </div>
        </div>

        <!-- 状态 -->
        <div class="flex items-start gap-4">
          <label class="w-[100px] text-sm text-[#1d1d1f] pt-2.5 text-right shrink-0">状态</label>
          <div class="flex-1 flex items-center gap-6 pt-2">
            <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-[#1d1d1f]">
              <input
                type="radio"
                v-model="formData.status"
                value="draft"
                class="w-4 h-4 accent-[#007aff]"
              />
              保存为草稿
            </label>
            <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-[#1d1d1f]">
              <input
                type="radio"
                v-model="formData.status"
                value="active"
                class="w-4 h-4 accent-[#007aff]"
              />
              直接发布
            </label>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-4 pl-[116px]">
          <button
            type="submit"
            class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none"
          >
            创建实验
          </button>
          <button
            type="button"
            class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none"
            @click="resetForm"
          >
            重置
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../../api'
import PageHeader from '../../components/PageHeader.vue'
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

// 添加实验要求
const addRequirement = () => {
  formData.requirements.push('')
}

// 删除实验要求
const removeRequirement = (index) => {
  formData.requirements.splice(index, 1)
}

// 提交表单
const submitForm = async () => {
  const valid = validate(formData)
  if (!valid) return

  try {
    const result = await api.createExperiment(formData)
    if (result.success) {
      ElMessage.success('实验创建成功')
      router.push('/teacher/experiments')
    }
  } catch (error) {
    logger.error('创建实验失败:', error)
    ElMessage.error('创建实验失败，请稍后重试')
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
    classList.value = list.map(c => ({ id: c.id, name: c.name || c.className || `班级${c.id}` }))
  } catch (error) {
    logger.error('加载班级列表失败:', error)
  }
}

onMounted(() => {
  loadClassList()
})
</script>
