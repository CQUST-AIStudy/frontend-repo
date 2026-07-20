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
          class="pointer-events-auto flex items-start gap-3 rounded-[var(--app-radius-lg)] border bg-[var(--app-surface)] px-4 py-3 text-[14px] text-[var(--app-text)] shadow-[var(--app-shadow)]"
          :class="toastToneClass(toast.type)"
          :role="toast.type === 'error' ? 'alert' : 'status'"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <span class="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" :class="toastDotClass(toast.type)"></span>
          <span class="min-w-0 flex-1 leading-relaxed">{{ toast.message }}</span>
          <UiButton type="button" circle size="small" aria-label="关闭消息" class="!h-7 !min-h-7 !w-7 !border-transparent !bg-transparent !p-0 text-[var(--app-text-soft)] hover:!bg-[var(--app-primary-tint-8)] hover:text-[var(--app-text)]" @click="closeMessage(toast.id)">×</UiButton>
        </div>
      </TransitionGroup>
    </div>

    <div v-if="feedbackState.loadingCount > 0" class="fixed inset-0 z-[2900] flex items-center justify-center bg-[var(--app-text)]/20" role="status" aria-live="polite" aria-busy="true">
      <div class="rounded-[var(--app-radius-lg)] border border-[var(--app-border)] bg-[var(--app-surface)] px-6 py-5 text-center shadow-[var(--app-shadow)]">
        <div class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--app-primary-tint-15)] border-t-[var(--app-primary)]" aria-hidden="true"></div>
        <div class="text-[14px] font-medium text-[var(--app-text)]">{{ feedbackState.loadingText || '加载中...' }}</div>
      </div>
    </div>

    <UiDialog
      :model-value="Boolean(activeDialog)"
      :title="activeDialog?.title"
      width="420px"
      @update:model-value="handleDialogVisibility"
    >
      <p v-if="activeDialog" class="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--app-text-secondary)]">{{ activeDialog.message }}</p>
      <template #footer>
        <UiButton
          v-if="activeDialog?.type === 'confirm'"
          type="button"
          class="h-9 px-4 text-[13px]"
          @click="handleCancel(activeDialog)"
        >
          {{ activeDialog.cancelButtonText }}
        </UiButton>
        <UiButton
          v-if="activeDialog"
          type="primary"
          class="h-9 px-4 text-[13px]"
          @click="settleDialog(activeDialog, true)"
        >
          {{ activeDialog.confirmButtonText }}
        </UiButton>
      </template>
    </UiDialog>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { closeMessage, feedbackState, settleDialog } from '../../services/feedback'

const activeDialog = computed(() => feedbackState.dialogs[0])

function toastToneClass(type) {
  if (type === 'success') return 'border-[var(--app-success)]/40'
  if (type === 'warning') return 'border-[var(--app-warning)]/40'
  if (type === 'error') return 'border-[var(--app-danger)]/40'
  return 'border-[var(--app-border)]'
}

function toastDotClass(type) {
  if (type === 'success') return 'bg-[var(--app-success)]'
  if (type === 'warning') return 'bg-[var(--app-warning)]'
  if (type === 'error') return 'bg-[var(--app-danger)]'
  return 'bg-[var(--app-primary)]'
}

function handleCancel(dialog) {
  settleDialog(dialog, false)
}

function handleDialogVisibility(visible) {
  if (!visible && activeDialog.value) handleCancel(activeDialog.value)
}
</script>
