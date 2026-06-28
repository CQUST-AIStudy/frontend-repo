<template>
  <div class="app-shell [position:relative] [min-height:100vh] [min-height:100dvh] [overflow-x:hidden] [background:var(--app-bg)]">
    <router-view />
    <UiFeedbackHost />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import UiFeedbackHost from './components/ui/UiFeedbackHost.vue'
import { useThemeStore } from './store/theme'

const themeStore = useThemeStore()
// 主题状态变更时实时同步到 documentElement
watch(
  () => [themeStore.primaryColor, themeStore.bgColor, themeStore.textColor],
  () => themeStore.applyTheme()
)
</script>
