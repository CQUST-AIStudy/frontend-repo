<template>
  <div class="rubric-manager">
    <!-- 页面标题（仅在独立页面显示） -->
    <div v-if="!embedded" class="flex items-center gap-3 mb-5">
      <h1 class="text-[20px] font-semibold text-[#1d1d1f]">评分标准管理</h1>
    </div>

    <!-- Rubrics Card -->
    <div :class="cardClass">
      <div class="flex justify-between items-center mb-5 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3">
        <span class="text-[15px] font-medium text-[#1d1d1f]">我的评分标准</span>
        <div class="flex gap-2 items-center max-[640px]:flex-wrap">
          <UiButton @click="pickTemplate" :disabled="drafting"
            class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="drafting" class="inline-flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="8" stroke-linecap="round"/></svg>
              生成中...
            </span>
            <span v-else>模板生成</span>
          </UiButton>
          <UiButton @click="showCreate"
            class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[#c2703e] shadow-[0_2px_8px_rgba(194, 112, 62, 0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none">
            + 新建标准
          </UiButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <svg class="w-6 h-6 animate-spin text-[#c2703e]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" stroke-dasharray="50" stroke-dashoffset="12" stroke-linecap="round"/></svg>
      </div>

      <!-- Empty State -->
      <div v-else-if="!rubrics.length" class="flex flex-col items-center justify-center py-16 text-[#86868b]">
        <svg class="w-12 h-12 mb-3 text-[#d2d2d7]" viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" stroke-width="2"/><path d="M16 16h16M16 24h12M16 32h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <p class="text-sm">暂无评分标准</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto rounded-[12px] border border-black/[0.04]">
        <UiTable :data="rubrics" class="w-full text-sm" empty-text="暂无评分标准">
          <UiTableColumn prop="name" label="名称" />
          <UiTableColumn prop="subject" label="学科" width="150" />
          <UiTableColumn label="维度数" width="80">
            <template #default="{ row }">{{ row.dimensions?.length || 0 }}</template>
          </UiTableColumn>
          <UiTableColumn label="创建时间" width="180">
            <template #default="{ row }">{{ formatRubricTime(row.createdAt) }}</template>
          </UiTableColumn>
          <UiTableColumn label="操作" width="120">
            <template #default="{ row }">
              <UiButton @click="editRubric(row)" class="text-sm font-medium text-[#c2703e] hover:text-[#a85c30] bg-transparent border-none cursor-pointer transition-colors">编辑</UiButton>
            </template>
          </UiTableColumn>
        </UiTable>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <AppModal v-model="dialogVisible" :title="editingId ? '编辑评分标准' : '新建评分标准'" width="700px">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">名称</label>
          <UiInput v-model="form.name" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(var(--app-primary-rgb),0.15),inset_0_0_0_1px_rgba(var(--app-primary-rgb),0.5)] transition-all outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">学科</label>
          <UiInput v-model="form.subject" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(var(--app-primary-rgb),0.15),inset_0_0_0_1px_rgba(var(--app-primary-rgb),0.5)] transition-all outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">描述</label>
          <textarea v-model="form.description" rows="2" class="w-full px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(var(--app-primary-rgb),0.15),inset_0_0_0_1px_rgba(var(--app-primary-rgb),0.5)] transition-all outline-none text-sm resize-none"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">自定义提示</label>
          <textarea v-model="form.customPrompt" rows="3" placeholder="输入自定义评分提示词，AI 评分时会参考此内容（如：重点关注代码注释质量、要求实验数据真实等）"
            class="w-full px-3 py-2.5 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(var(--app-primary-rgb),0.15),inset_0_0_0_1px_rgba(var(--app-primary-rgb),0.5)] transition-all outline-none text-sm resize-none"></textarea>
          <p class="text-xs text-[#aeaeb2] mt-1">此提示词将作为 AI 评分的额外指导，影响所有维度的评分</p>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-5 mb-2">
        <h4 class="text-[15px] font-medium text-[#1d1d1f]">评分维度</h4>
        <span :class="[
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          weightSum === 100 ? 'bg-[rgba(107,143,107,0.1)] text-[#6b8f6b]' : 'bg-[rgba(196,75,63,0.08)] text-[#c44b3f]'
        ]">权重合计: {{ weightSum }}%</span>
      </div>

      <div v-for="(dim, i) in form.dimensions" :key="i" class="flex gap-2 mb-2 items-center max-[640px]:flex-col max-[640px]:items-stretch">
        <UiInput v-model="dim.name" placeholder="维度名称"
          class="w-[150px] h-9 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(var(--app-primary-rgb),0.15),inset_0_0_0_1px_rgba(var(--app-primary-rgb),0.5)] transition-all outline-none text-sm max-[640px]:w-full" />
        <UiInput v-model="dim.description" placeholder="描述"
          class="flex-1 h-9 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(var(--app-primary-rgb),0.15),inset_0_0_0_1px_rgba(var(--app-primary-rgb),0.5)] transition-all outline-none text-sm max-[640px]:w-full" />
        <UiInput v-model.number="dim.maxScore" type="number" min="1" max="100" placeholder="满分"
          class="w-[90px] h-9 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(var(--app-primary-rgb),0.15),inset_0_0_0_1px_rgba(var(--app-primary-rgb),0.5)] transition-all outline-none text-sm max-[640px]:w-full" />
        <UiInput v-model.number="dim.weight" type="number" min="1" max="100" placeholder="权重%"
          class="w-[90px] h-9 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(var(--app-primary-rgb),0.15),inset_0_0_0_1px_rgba(var(--app-primary-rgb),0.5)] transition-all outline-none text-sm max-[640px]:w-full" />
        <UiButton @click="form.dimensions.splice(i, 1)"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#c44b3f] bg-[rgba(196,75,63,0.08)] hover:bg-[rgba(196,75,63,0.12)] active:scale-[0.96] transition-all cursor-pointer border-none max-[640px]:w-full">删除</UiButton>
      </div>
      <UiButton @click="addDimension"
        class="w-full h-9 rounded-[10px] text-sm font-medium text-[#6e6e73] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.98] transition-all cursor-pointer border border-dashed border-black/10 mt-1">+ 添加维度</UiButton>

      <template #footer>
        <UiButton @click="dialogVisible = false"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none">取消</UiButton>
        <UiButton @click="saveRubric" :disabled="weightSum !== 100 || saving"
          class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#d49068] to-[#c2703e] shadow-[0_2px_8px_rgba(194, 112, 62, 0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
          <span v-if="saving" class="inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="8" stroke-linecap="round"/></svg>
            保存中...
          </span>
          <span v-else>保存</span>
        </UiButton>
      </template>
    </AppModal>

    <UiInput ref="templateInput" type="file" accept=".pdf,.docx,.doc" class="hidden" @change="onTemplatePicked" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { message as uiMessage } from '@/services/feedback'
import { getRubrics, normalizeRubricList, createRubric, updateRubric, getRubricDetail, draftRubricFromTemplate } from '@/api/tap'
import { formatDate } from '@/utils/dateUtils'
import logger from '@/utils/logger'
import AppModal from './AppModal.vue'

const props = defineProps({
  embedded: { type: Boolean, default: false }
})

const emit = defineEmits(['saved'])

const rubrics = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const drafting = ref(false)
const editingId = ref(null)
const templateInput = ref(null)

const form = ref({ name: '', subject: '', description: '', customPrompt: '', dimensions: [] })

const weightSum = computed(() => form.value.dimensions.reduce((s, d) => s + (d.weight || 0), 0))

const formatRubricTime = value => formatDate(value, 'YYYY-MM-DD HH:mm:ss') || '-'

const cardClass = computed(() =>
  props.embedded
    ? ''
    : 'rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 max-[640px]:p-4'
)

async function loadRubrics() {
  loading.value = true
  try {
    const res = await getRubrics()
    rubrics.value = normalizeRubricList(res)
  } catch (e) {
    logger.error('[RubricManager] loadRubrics error:', e)
    uiMessage.error(e.message)
  }
  loading.value = false
}

function showCreate() {
  editingId.value = null
  form.value = { name: '', subject: '', description: '', customPrompt: '', dimensions: [
    { name: '代码正确性', description: '代码能否正确运行', maxScore: 20, weight: 40 },
    { name: '实验分析', description: '分析是否深入', maxScore: 15, weight: 30 },
    { name: '报告规范', description: '格式是否规范', maxScore: 15, weight: 30 },
  ]}
  dialogVisible.value = true
}

function pickTemplate() {
  templateInput.value?.click()
}

async function onTemplatePicked(event) {
  const file = event?.target?.files?.[0]
  if (!file) return
  drafting.value = true
  try {
    const res = await draftRubricFromTemplate(file)
    const draft = res?.data || res
    editingId.value = null
    form.value = {
      name: draft?.name || '',
      subject: draft?.subject || '',
      description: draft?.description || '',
      customPrompt: draft?.customPrompt || '',
      dimensions: (draft?.dimensions || []).map(d => ({
        name: d.name,
        description: d.description,
        maxScore: Number(d.maxScore || 10),
        weight: Number(d.weight || 0)
      }))
    }
    dialogVisible.value = true
    uiMessage.success('已根据模板生成评分标准草案')
  } catch (e) {
    uiMessage.error(e.message || '模板生成失败')
  } finally {
    drafting.value = false
    if (event?.target) event.target.value = ''
  }
}

async function editRubric(row) {
  try {
    const res = await getRubricDetail(row.id)
    const r = res?.data ?? res ?? row
    editingId.value = r.id
    form.value = { name: r.name, subject: r.subject, description: r.description,
      customPrompt: r.customPrompt || '',
      dimensions: (r.dimensions || []).map(d => ({ name: d.name, description: d.description, maxScore: d.maxScore, weight: d.weight }))
    }
    dialogVisible.value = true
  } catch (e) { uiMessage.error(e.message) }
}

function addDimension() {
  form.value.dimensions.push({ name: '', description: '', maxScore: 10, weight: 0 })
}

async function saveRubric() {
  saving.value = true
  try {
    if (editingId.value) {
      await updateRubric(editingId.value, form.value)
      uiMessage.success('更新成功')
    } else {
      await createRubric(form.value)
      uiMessage.success('创建成功')
    }
    dialogVisible.value = false
    await loadRubrics()
    emit('saved')
  } catch (e) { uiMessage.error(e.message) }
  saving.value = false
}

onMounted(loadRubrics)
</script>
