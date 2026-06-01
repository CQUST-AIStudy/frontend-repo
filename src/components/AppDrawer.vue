<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] [&_.drawer-backdrop]:transition-opacity [&_.drawer-backdrop]:duration-300 [&_.drawer-panel]:transition-transform [&_.drawer-panel]:duration-300 [&_.drawer-panel]:ease-[cubic-bezier(0.4,0,0.2,1)]"
      :enter-from-class="drawerHiddenClass"
      enter-to-class="opacity-100 [&_.drawer-panel]:translate-x-0"
      leave-active-class="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] [&_.drawer-backdrop]:transition-opacity [&_.drawer-backdrop]:duration-300 [&_.drawer-panel]:transition-transform [&_.drawer-panel]:duration-300 [&_.drawer-panel]:ease-[cubic-bezier(0.4,0,0.2,1)]"
      leave-from-class="opacity-100 [&_.drawer-panel]:translate-x-0"
      :leave-to-class="drawerHiddenClass"
    >
      <div v-if="modelValue" class="fixed inset-0 z-[2000]">
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm drawer-backdrop" @mousedown="handleBackdropClick"></div>
        <div class="fixed inset-y-0 flex w-[var(--drawer-size)] flex-col bg-white shadow-[0_0_60px_rgba(0,0,0,0.12)] drawer-panel" :class="positionClass" :style="sizeStyle">
          <div v-if="title || $slots.header" class="flex items-center justify-between h-[64px] px-6 border-b border-black/[0.06] shrink-0">
            <slot name="header">
              <h2 class="text-[16px] font-semibold text-[#1d1d1f]">{{ title }}</h2>
            </slot>
            <button type="button" @click="close" class="w-[30px] h-[30px] rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors cursor-pointer">
              <svg class="w-3.5 h-3.5 text-[#6e6e73]" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-6">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/[0.06] shrink-0">
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
  size: { type: String, default: '400px' },
  direction: { type: String, default: 'right' },
  closeOnClickModal: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])

const positionClass = computed(() => props.direction === 'left' ? 'left-0' : 'right-0')
const drawerHiddenClass = computed(() =>
  props.direction === 'left'
    ? 'opacity-0 [&_.drawer-panel]:-translate-x-full'
    : 'opacity-0 [&_.drawer-panel]:translate-x-full'
)
const sizeStyle = computed(() => ({ '--drawer-size': props.size }))

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClick() {
  if (props.closeOnClickModal) close()
}
</script>
