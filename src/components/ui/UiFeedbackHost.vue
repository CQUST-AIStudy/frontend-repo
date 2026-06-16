<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed left-1/2 top-5 z-[3000] flex w-[min(420px,calc(100vw-24px))] -translate-x-1/2 flex-col gap-2">
      <TransitionGroup
        enter-active-class="transition-all duration-200"
        enter-from-class="-translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition-all duration-150"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <div
          v-for="toast in feedbackState.toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-[14px] shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
          :class="toastToneClass(toast.type)"
        >
          <span class="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" :class="toastDotClass(toast.type)"></span>
          <span class="min-w-0 flex-1 leading-relaxed">{{ toast.message }}</span>
          <UiButton type="button" circle size="small" class="!h-7 !min-h-7 !w-7 !border-transparent !bg-transparent !p-0 text-[#94a3b8] hover:!bg-[#f1f5f9] hover:text-[#0f172a]" @click="closeMessage(toast.id)">×</UiButton>
        </div>
      </TransitionGroup>
    </div>

    <div v-if="feedbackState.loadingCount > 0" class="fixed inset-0 z-[2900] flex items-center justify-center bg-[#f8fafc]/70">
      <div class="rounded-xl border border-[#e2e8f0] bg-white px-6 py-5 text-center shadow-[0_20px_48px_rgba(15,23,42,0.14)]">
        <div class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#c2703e]/20 border-t-[#c2703e]"></div>
        <div class="text-[14px] font-medium text-[#1d1d1f]">{{ feedbackState.loadingText || '加载中...' }}</div>
      </div>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="activeDialog" class="fixed inset-0 z-[3000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-[#0f172a]/45" @click="handleCancel(activeDialog)"></div>
        <div class="relative w-full max-w-[420px] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_20px_48px_rgba(15,23,42,0.18)]">
          <div class="px-6 pt-5">
            <h2 class="text-[16px] font-semibold text-[#0f172a]">{{ activeDialog.title }}</h2>
            <p class="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[#475569]">{{ activeDialog.message }}</p>
          </div>
          <div class="flex justify-end gap-3 px-6 py-5">
            <UiButton
              v-if="activeDialog.type === 'confirm'"
              type="button"
              class="h-9 px-4 text-[13px]"
              @click="handleCancel(activeDialog)"
            >
              {{ activeDialog.cancelButtonText }}
            </UiButton>
            <UiButton
              type="primary"
              class="h-9 px-4 text-[13px]"
              @click="settleDialog(activeDialog, true)"
            >
              {{ activeDialog.confirmButtonText }}
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { closeMessage, feedbackState, settleDialog } from '../../services/feedback'

const activeDialog = computed(() => feedbackState.dialogs[0])

function toastToneClass(type) {
  if (type === 'success') return 'border-[#bbf7d0] text-[#166534]'
  if (type === 'warning') return 'border-[#fed7aa] text-[#9a3412]'
  if (type === 'error') return 'border-[#fecaca] text-[#991b1b]'
  return 'border-[#dbeafe] text-[#0f172a]'
}

function toastDotClass(type) {
  if (type === 'success') return 'bg-[#16a34a]'
  if (type === 'warning') return 'bg-[#d97706]'
  if (type === 'error') return 'bg-[#dc2626]'
  return 'bg-[#c2703e]'
}

function handleCancel(dialog) {
  settleDialog(dialog, false)
}
</script>
