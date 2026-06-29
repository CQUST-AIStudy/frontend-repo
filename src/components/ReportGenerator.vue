<template>
  <div class="report-generator [width:100%] [margin:0_auto]">
    <ui-card class="report-card [margin-bottom:20px]">
      <template #header>
        <div class="card-header [display:flex] [align-items:center] [gap:12px] [justify-content:space-between] [align-items:flex-start] [gap:16px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
          <div class="header-left [display:flex] [align-items:center] [gap:12px] [min-width:0] [gap:14px]">
            <span>{{ isEditMode ? '编辑报告' : '预览报告' }}</span>
            <ui-button v-if="isEditMode" type="success" @click="saveEdits">保存修改</ui-button>
          </div>
          <div class="header-right [display:flex] [align-items:center] [gap:12px] [justify-content:flex-end] [min-width:0] [gap:14px]">
            <ui-button v-if="!isEditMode" type="primary" @click="toggleEditMode">编辑报告</ui-button>
            <ui-button v-else @click="cancelEdits">取消编辑</ui-button>
          </div>
        </div>
      </template>

      <div v-if="isEditMode" class="edit-mode [padding:20px]">
        <ui-form :model="editingData" label-position="top">
          <ui-divider content-position="left">基本信息</ui-divider>
          <ui-row :gutter="20">
            <ui-col :span="8">
              <ui-form-item label="课程名称">
                <ui-input v-model="editingData.courseName" />
              </ui-form-item>
            </ui-col>
            <ui-col :span="8">
              <ui-form-item label="实验项目">
                <ui-input v-model="editingData.experimentName" />
              </ui-form-item>
            </ui-col>
            <ui-col :span="8">
              <ui-form-item label="机房名称">
                <ui-input v-model="editingData.labName" />
              </ui-form-item>
            </ui-col>
          </ui-row>

          <ui-row :gutter="20">
            <ui-col :span="8">
              <ui-form-item label="上机时间">
                <ui-date-picker
                  v-model="editingData.labTime"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY/MM/DD"
                  value-format="YYYY/MM/DD"
                  class="[width:100%]"
                />
              </ui-form-item>
            </ui-col>
            <ui-col :span="8">
              <ui-form-item label="指导教师">
                <ui-input v-model="editingData.teacherName" />
              </ui-form-item>
            </ui-col>
            <ui-col :span="8">
              <ui-form-item label="上机成绩">
                <ui-input v-model="editingData.score" />
              </ui-form-item>
            </ui-col>
          </ui-row>

          <ui-row :gutter="20">
            <ui-col :span="8">
              <ui-form-item label="学生姓名">
                <ui-input v-model="editingData.studentName" />
              </ui-form-item>
            </ui-col>
            <ui-col :span="8">
              <ui-form-item label="学号">
                <ui-input v-model="editingData.studentId" />
              </ui-form-item>
            </ui-col>
            <ui-col :span="8">
              <ui-form-item label="专业班级">
                <ui-input v-model="editingData.className" />
              </ui-form-item>
            </ui-col>
          </ui-row>

          <ui-divider content-position="left">报告内容</ui-divider>
          <ui-form-item label="一、实验目的和要求">
            <ui-input v-model="editingData.purpose" type="textarea" :rows="4" />
          </ui-form-item>
          <ui-form-item label="二、实验环境">
            <ui-input v-model="editingData.requirements" type="textarea" :rows="4" />
          </ui-form-item>
          <ui-form-item label="三、实验内容">
            <ui-input v-model="editingData.tasks" type="textarea" :rows="5" />
          </ui-form-item>
          <ui-form-item label="四、实验步骤与关键代码">
            <ui-input v-model="editingData.steps" type="textarea" :rows="10" />
          </ui-form-item>
          <ui-form-item label="五、实验结果与问题分析">
            <ui-input v-model="editingData.results" type="textarea" :rows="6" />
          </ui-form-item>
          <ui-form-item label="六、实验总结">
            <ui-input v-model="editingData.summary" type="textarea" :rows="6" />
          </ui-form-item>
          <ui-form-item label="教师评语">
            <ui-input v-model="editingData.teacherComment" type="textarea" :rows="5" />
          </ui-form-item>
        </ui-form>
      </div>

      <div v-else class="report-preview [padding:20px] [background:#fff]">
        <div class="report-container [max-width:1024px] [margin:0_auto] [padding:20px] [background:#fff]">
          <div class="report-title [text-align:center] [margin-bottom:24px]">
            <div class="university-name [font-family:var(--font-page)] [font-size:30px] [font-weight:700] [color:#111827]">AI大学</div>
            <div class="report-type [font-family:var(--font-page)] [font-size:30px] [font-weight:700] [color:#111827] [margin-top:8px]">上机实验报告</div>
          </div>

          <div v-if="hasTeacherReview" class="teacher-review-banner [margin-bottom:18px] [padding:18px_20px] [border:2px_solid_#f3b8b8] [border-radius:14px] [background:linear-gradient(180deg,_#fff7f7,_#fff1f1)]">
            <div class="teacher-review-top [display:flex] [justify-content:space-between] [align-items:center] [gap:16px]">
              <div class="teacher-review-score [display:flex] [align-items:baseline] [gap:10px]">
                <span class="score-label">教师评分</span>
                <span class="score-value">{{ displayScore }}</span>
              </div>
              <div class="teacher-review-meta [font-size:13px] [color:#7f1d1d]">
                <span>教师评语已同步到报告</span>
              </div>
            </div>
            <div v-if="experimentData.teacherComment" class="teacher-comment-block handwritten-text [margin-top:14px] [padding-top:14px] [border-top:1px_dashed_rgba(185,_28,_28,_0.35)]">
              <div class="teacher-comment-label [margin-bottom:8px] [font-size:14px] [color:#991b1b] [font-weight:600]">教师评语</div>
              <pre>{{ experimentData.teacherComment }}</pre>
            </div>
          </div>

          <UiTable class="info-table [width:100%] [border-collapse:collapse] [border:2px_solid_#111827]">
            <tbody>
              <tr>
                <td class="label-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)] [width:12%]">课程名称</td>
                <td class="value-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)]" colspan="2">{{ experimentData.courseName || '课程待补充' }}</td>
                <td class="label-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)] [width:12%]">实验项目</td>
                <td class="value-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)]" colspan="2">{{ experimentData.experimentName || '实验待补充' }}</td>
              </tr>
              <tr>
                <td class="label-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)] [width:12%]">机房名称</td>
                <td class="value-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)]" colspan="2">{{ experimentData.labName || '实验机房' }}</td>
                <td class="label-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)] [width:12%]">上机时间</td>
                <td class="value-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)]" colspan="2">{{ experimentData.labTime || currentDate }}</td>
              </tr>
              <tr>
                <td class="label-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)] [width:12%]">指导教师</td>
                <td class="value-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)]" colspan="2">{{ experimentData.teacherName || '指导教师' }}</td>
                <td class="label-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)] [width:12%]">上机成绩</td>
                <td class="value-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)]" colspan="2">{{ displayScore }}</td>
              </tr>
              <tr>
                <td class="label-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)] [width:12%]">学生姓名</td>
                <td class="value-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)]">{{ experimentData.studentName || '未命名学生' }}</td>
                <td class="label-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)] [width:12%]">学号</td>
                <td class="value-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)]">{{ experimentData.studentId || '-' }}</td>
                <td class="label-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)] [width:12%]">专业班级</td>
                <td class="value-cell [border:1px_solid_#111827] [padding:12px_8px] [text-align:center] [vertical-align:middle] [font-size:15px] [font-family:var(--font-page)]">{{ experimentData.className || '-' }}</td>
              </tr>
            </tbody>
          </UiTable>

          <div class="report-content-sections [width:100%]">
            <section class="content-section [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]">
              <div class="section-title [margin-bottom:12px] [font-size:16px] [font-family:var(--font-page)] [margin:6px_0_2px] [color:#334155] [font-size:13px] [font-weight:600] [margin:0] [font-weight:500] [color:#303133]">一、实验目的和要求</div>
              <div class="section-content white-space-pre [font-size:15px] [line-height:1.8] [color:#111827] [white-space:pre-line] [color:#5f6368]">{{ experimentData.purpose || '待补充。' }}</div>
            </section>

            <section class="content-section [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]">
              <div class="section-title [margin-bottom:12px] [font-size:16px] [font-family:var(--font-page)] [margin:6px_0_2px] [color:#334155] [font-size:13px] [font-weight:600] [margin:0] [font-weight:500] [color:#303133]">二、实验环境</div>
              <div class="section-content white-space-pre [font-size:15px] [line-height:1.8] [color:#111827] [white-space:pre-line] [color:#5f6368]">{{ experimentData.requirements || '待补充。' }}</div>
            </section>

            <section class="content-section [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]">
              <div class="section-title [margin-bottom:12px] [font-size:16px] [font-family:var(--font-page)] [margin:6px_0_2px] [color:#334155] [font-size:13px] [font-weight:600] [margin:0] [font-weight:500] [color:#303133]">三、实验内容</div>
              <div class="section-content white-space-pre [font-size:15px] [line-height:1.8] [color:#111827] [white-space:pre-line] [color:#5f6368]">{{ experimentData.tasks || '待补充。' }}</div>
            </section>

            <section class="content-section [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]">
              <div class="section-title [margin-bottom:12px] [font-size:16px] [font-family:var(--font-page)] [margin:6px_0_2px] [color:#334155] [font-size:13px] [font-weight:600] [margin:0] [font-weight:500] [color:#303133]">四、实验步骤与关键代码</div>
              <div class="section-content markdown-shell [font-size:15px] [line-height:1.8] [color:#111827] [background:#fafafa] [border-radius:8px] [color:#5f6368]">
                <div v-html="processContent(experimentData.steps || '')" class="markdown-content [padding:10px] [line-height:1.6]"></div>
              </div>
            </section>

            <section class="content-section [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]">
              <div class="section-title [margin-bottom:12px] [font-size:16px] [font-family:var(--font-page)] [margin:6px_0_2px] [color:#334155] [font-size:13px] [font-weight:600] [margin:0] [font-weight:500] [color:#303133]">五、实验结果与问题分析</div>
              <div class="section-content white-space-pre [font-size:15px] [line-height:1.8] [color:#111827] [white-space:pre-line] [color:#5f6368]">{{ experimentData.results || '待补充。' }}</div>
            </section>

            <section class="content-section [border-left:2px_solid_#111827] [border-right:2px_solid_#111827] [border-bottom:1px_solid_#111827] [padding:18px_24px] last:[border-bottom:2px_solid_#111827]">
              <div class="section-title [margin-bottom:12px] [font-size:16px] [font-family:var(--font-page)] [margin:6px_0_2px] [color:#334155] [font-size:13px] [font-weight:600] [margin:0] [font-weight:500] [color:#303133]">六、实验总结</div>
              <div class="section-content white-space-pre [font-size:15px] [line-height:1.8] [color:#111827] [white-space:pre-line] [color:#5f6368]">{{ experimentData.summary || '待补充。' }}</div>
            </section>
          </div>
        </div>
      </div>
    </ui-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { message as uiMessage, messageBox } from '@/services/feedback'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ensureHandwritingFont } from '@/utils/handwritingFont'

const props = defineProps({
  reportData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:reportData', 'report-saved'])

const experimentData = ref({})
const editingData = ref({})
const isEditMode = ref(false)
const currentDate = new Date().toLocaleDateString()

const displayScore = computed(() => {
  const value = experimentData.value?.score
  return value === null || value === undefined || value === '' ? '' : value
})

const hasTeacherReview = computed(() => Boolean(displayScore.value || experimentData.value?.teacherComment))

const processContent = content => {
  if (!content) return ''
  const processedContent = content.replace(
    /<div class="comment-image-container" data-image="(.*?)"><\/div>/g,
    (_, imageDataUrl) => `<div class="teacher-comment-image [margin:14px_auto] [max-width:520px] [margin:10px_0] [max-width:100%]"><img src="${imageDataUrl}" alt="教师评语" /></div>`,
  )
  const html = marked.parse(processedContent)
  return DOMPurify.sanitize(html)
}

watch(
  () => props.reportData,
  newData => {
    if (newData && Object.keys(newData).length > 0) {
      experimentData.value = { ...newData }
    }
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  ensureHandwritingFont()
})

function updateReport() {
  if (props.reportData && Object.keys(props.reportData).length > 0) {
    experimentData.value = { ...props.reportData }
  }
}

defineExpose({ updateReport })

function toggleEditMode() {
  editingData.value = JSON.parse(JSON.stringify(experimentData.value || {}))
  isEditMode.value = true
}

function saveEdits() {
  experimentData.value = JSON.parse(JSON.stringify(editingData.value || {}))
  emit('update:reportData', experimentData.value)
  emit('report-saved', experimentData.value)
  isEditMode.value = false
  uiMessage.success('报告已更新')
}

function cancelEdits() {
  messageBox.confirm('未保存的修改会丢失，确定取消编辑吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '继续编辑',
    type: 'warning',
  })
    .then(() => {
      isEditMode.value = false
    })
    .catch(() => {})
}
</script>


