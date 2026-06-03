<template>
  <div class="app-shell [position:relative] [min-height:100vh] [min-height:100dvh] [overflow-x:hidden] [background:var(--app-bg)]">
    <router-view />
    <UiFeedbackHost />
  </div>
</template>

<script setup>
import UiFeedbackHost from './components/ui/UiFeedbackHost.vue'
</script>
