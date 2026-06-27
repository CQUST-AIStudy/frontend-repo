<template>
  <div ref="rootRef" class="theme-color-picker relative inline-block w-full">
    <button
      type="button"
      class="tcp-trigger group inline-flex w-full items-center gap-3 rounded-[10px] border px-3 py-2 text-left transition-colors"
      :style="triggerStyle"
      @click="toggle"
    >
      <span
        class="tcp-swatch inline-block h-7 w-7 shrink-0 rounded-[8px] border"
        :style="{ background: modelValue, borderColor: 'var(--app-border-strong)' }"
      />
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="tcp-label text-[14px] font-semibold leading-[1.3]">{{ label }}</span>
        <span v-if="description" class="tcp-desc mt-[2px] text-[12px] leading-[1.4]" :style="{ color: 'var(--app-text-secondary)' }">{{ description }}</span>
      </span>
      <span class="tcp-hex text-[13px] font-mono uppercase" :style="{ color: 'var(--app-text-secondary)' }">{{ modelValue }}</span>
    </button>

    <div
      v-if="open"
      class="tcp-popover absolute right-0 top-[calc(100%+8px)] z-[1000] rounded-[12px] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
      :style="{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }"
      @click.stop
    >
      <Photoshop
        :model-value="draft"
        @update:model-value="onInput"
        @ok="commit"
        @cancel="cancel"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Photoshop } from '@ckpack/vue-color'

const props = defineProps({
  modelValue: { type: String, required: true },
  label: { type: String, default: '' },
  description: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const rootRef = ref(null)
const open = ref(false)
const draft = ref(props.modelValue)

watch(() => props.modelValue, (v) => { if (!open.value) draft.value = v })

const triggerStyle = computed(() => ({
  background: 'var(--app-surface)',
  borderColor: 'var(--app-border)'
}))

function toggle() {
  if (open.value) {
    close()
    return
  }
  draft.value = props.modelValue
  open.value = true
  // 下一帧绑定外部点击关闭，避免触发本次点击
  requestAnimationFrame(() => document.addEventListener('click', onOutside))
}

function onOutside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) close()
}

function close() {
  open.value = false
  document.removeEventListener('click', onOutside)
}

// @ckpack/vue-color 的 update:modelValue 携带的是一个 color 对象（含 hex/rgba/hsv…）
function onInput(val) {
  const hex = normalizeToHex(val)
  if (hex) draft.value = hex
}

function commit() {
  const hex = normalizeToHex(draft.value) || props.modelValue
  draft.value = hex
  emit('update:modelValue', hex)
  close()
}

function cancel() {
  close()
}

function normalizeToHex(val) {
  if (!val) return null
  if (typeof val === 'string') return val
  if (val.hex) return val.hex
  if (val.hex8) return val.hex8
  if (val.rgba) {
    const { r, g, b } = val.rgba
    return '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
  }
  return null
}

onBeforeUnmount(() => document.removeEventListener('click', onOutside))
</script>
