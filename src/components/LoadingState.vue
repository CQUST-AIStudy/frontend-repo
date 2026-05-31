<template>
  <div class="g-loading-state [min-height:200px]">
    <div v-if="loading" class="g-skeleton-wrap [padding:32px]">
      <div class="g-skeleton-row [margin-bottom:20px]" v-for="i in 4" :key="i">
        <div
          class="g-skeleton-block [height:16px] [border-radius:8px] [background:linear-gradient(90deg,_#f0f0f0_25%,_#e8e8e8_50%,_#f0f0f0_75%)] [background-size:200%_100%] [animation:g-shimmer_1.5s_ease-in-out_infinite]"
          :class="skeletonWidthClasses[i - 1]"
        ></div>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script setup>
defineProps({ loading: { type: Boolean, default: false } })

const skeletonWidthClasses = [
  '[width:78%]',
  '[width:66%]',
  '[width:54%]',
  '[width:42%]',
]
</script>


