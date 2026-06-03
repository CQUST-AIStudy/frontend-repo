<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] [&>div:last-child]:transition-all [&>div:last-child]:duration-[250ms] [&>div:last-child]:ease-[cubic-bezier(0.4,0,0.2,1)]"
      enter-from-class="opacity-0 [&>div:last-child]:translate-y-[10px] [&>div:last-child]:scale-95 [&>div:last-child]:opacity-0"
      enter-to-class="opacity-100 [&>div:last-child]:translate-y-0 [&>div:last-child]:scale-100 [&>div:last-child]:opacity-100"
      leave-active-class="transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] [&>div:last-child]:transition-all [&>div:last-child]:duration-[250ms] [&>div:last-child]:ease-[cubic-bezier(0.4,0,0.2,1)]"
      leave-from-class="opacity-100 [&>div:last-child]:translate-y-0 [&>div:last-child]:scale-100 [&>div:last-child]:opacity-100"
      leave-to-class="opacity-0 [&>div:last-child]:translate-y-[10px] [&>div:last-child]:scale-95 [&>div:last-child]:opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @mousedown="handleBackdropClick"></div>
        <div class="relative w-full max-w-[var(--modal-width)] bg-white rounded-[20px] shadow-[0_24px_80px_rgba(0,0,0,0.18),0_0_1px_rgba(0,0,0,0.1)] overflow-hidden" :style="modalStyle">
          <div v-if="title || $slots.header" class="flex items-center justify-between px-7 pt-6 pb-0">
            <slot name="header">
              <h2 class="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">{{ title }}</h2>
            </slot>
            <UiButton v-if="showClose" type="button" @click="close" class="w-[30px] h-[30px] rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors cursor-pointer">
              <svg class="w-3.5 h-3.5 text-[#6e6e73]" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </UiButton>
          </div>
          <div class="px-7 py-5">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-7 pb-6 pt-0">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '520px' },
  showClose: { type: Boolean, default: true },
  closeOnClickModal: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])
const modalStyle = computed(() => ({ '--modal-width': props.width }))

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClick() {
  if (props.closeOnClickModal) close()
}
</script>
