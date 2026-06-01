<template>
  <div>
    <div class="flex items-center gap-1 p-1 rounded-[12px] bg-black/[0.04]" :class="tabBarClass">
      <button v-for="tab in tabs" :key="tab.name" @click="switchTab(tab.name)" class="h-[32px] px-4 rounded-[9px] text-[13px] font-medium transition-all duration-200 cursor-pointer border-none" :class="modelValue === tab.name ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'">
        {{ tab.label }}
      </button>
    </div>
    <div class="mt-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  tabs: { type: Array, default: () => [] },
  tabBarClass: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change'])

function switchTab(name) {
  emit('update:modelValue', name)
  emit('change', name)
}
</script>
