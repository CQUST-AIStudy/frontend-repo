<template>
  <div class="page-header">
    <div class="page-header__body">
      <div class="page-header__text">
        <div class="page-header__eyebrow">教学智能平台</div>
        <h1 class="page-header__title">{{ title }}</h1>
        <p v-if="description" class="page-header__desc">{{ description }}</p>
      </div>
      <div v-if="$slots.default" class="page-header__extra">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

