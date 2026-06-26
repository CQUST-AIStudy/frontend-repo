<script setup>
import { computed } from 'vue'
import LucideIcon from '@/components/LucideIcon.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  payload: {
    type: Object,
    default: null
  },
  validation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const payloadText = computed(() => JSON.stringify(props.payload || {}, null, 2))
const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value)
})
</script>

<template>
  <ui-dialog
    v-model="dialogVisible"
    title="图谱 Payload 预览"
    width="760px"
  >
    <div class="payload-preview">
      <div class="preview-alert" :class="{ valid: validation?.valid }">
        <LucideIcon :name="validation?.valid ? 'check' : 'triangle-alert'" :size="18" />
        <span v-if="validation?.valid">数据契约校验通过。当前为前端本地保存使用的图谱数据预览。</span>
        <span v-else>数据契约存在问题，请先修复后再保存到本地。</span>
      </div>

      <ul v-if="validation?.errors?.length" class="error-list">
        <li v-for="error in validation.errors" :key="error">{{ error }}</li>
      </ul>

      <pre>{{ payloadText }}</pre>
    </div>
  </ui-dialog>
</template>

<style scoped>
.payload-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 13px;
  font-weight: 800;
}

.preview-alert.valid {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

.error-list {
  margin: 0;
  padding: 10px 12px 10px 28px;
  border-radius: 8px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 13px;
  line-height: 1.6;
}

pre {
  max-height: 520px;
  overflow: auto;
  margin: 0;
  padding: 14px;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12px;
  line-height: 1.6;
}
</style>
