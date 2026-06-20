<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1.5 mt-5">
    <UiButton @click="goTo(current - 1)" :disabled="current <= 1" :class="[paginationButtonClass, { 'opacity-40 cursor-not-allowed': current <= 1 }]">
      <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </UiButton>
    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="w-[34px] h-[34px] flex items-center justify-center text-[#aeaeb2] text-sm">...</span>
      <UiButton v-else @click="goTo(page)" :class="[paginationButtonClass, page === current ? 'bg-[#c2703e] text-white shadow-[0_2px_8px_rgba(194, 112, 62, 0.3)]' : '']">
        {{ page }}
      </UiButton>
    </template>
    <UiButton @click="goTo(current + 1)" :disabled="current >= totalPages" :class="[paginationButtonClass, { 'opacity-40 cursor-not-allowed': current >= totalPages }]">
      <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </UiButton>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 }
})

const emit = defineEmits(['update:current', 'change'])

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))
const paginationButtonClass = 'flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border-none bg-transparent text-[13px] font-medium text-[#1d1d1f] transition-all duration-150 cursor-pointer hover:enabled:bg-black/[0.04]'

const visiblePages = computed(() => {
  const pages = []
  const t = totalPages.value
  const c = props.current
  if (t <= 7) {
    for (let i = 1; i <= t; i++) pages.push(i)
  } else {
    pages.push(1)
    if (c > 3) pages.push('...')
    const start = Math.max(2, c - 1)
    const end = Math.min(t - 1, c + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (c < t - 2) pages.push('...')
    pages.push(t)
  }
  return pages
})

function goTo(page) {
  if (page < 1 || page > totalPages.value || page === props.current) return
  emit('update:current', page)
  emit('change', page)
}
</script>
