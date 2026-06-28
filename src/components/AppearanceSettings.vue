<template>
  <section
    class="appearance-settings appearance-card rounded-[20px] p-6 backdrop-blur-[20px]"
    :style="cardStyle"
  >
    <div class="mb-4 flex items-center justify-between border-b pb-2.5" :style="{ borderColor: 'var(--app-border)' }">
      <span class="text-[16px] font-semibold" :style="{ color: 'var(--app-text)' }">外观设置</span>
    </div>

    <p class="mb-4 text-[13px] leading-[1.7]" :style="{ color: 'var(--app-text-secondary)' }">
      自定义页面背景色、主题色与字体色，设置会自动保存并在所有端生效。
    </p>

    <!-- 背景色 -->
    <div
      class="setting-item mb-3 border-b pb-3 last:border-b-0 last:pb-0"
      :style="{ borderColor: 'var(--app-border)' }"
    >
      <ThemeColorPicker
        :model-value="themeStore.bgColor"
        label="背景颜色"
        description="页面主背景"
        @update:model-value="themeStore.setBg"
      />
    </div>

    <!-- 主题色 -->
    <div
      class="setting-item mb-3 border-b pb-3 last:border-b-0 last:pb-0"
      :style="{ borderColor: 'var(--app-border)' }"
    >
      <ThemeColorPicker
        :model-value="themeStore.primaryColor"
        label="主题颜色"
        description="按钮、链接与高亮强调色"
        @update:model-value="themeStore.setPrimary"
      />
    </div>

    <!-- 字体色 -->
    <div
      class="setting-item mb-4 border-b pb-3 last:border-b-0 last:pb-0"
      :style="{ borderColor: 'var(--app-border)' }"
    >
      <ThemeColorPicker
        :model-value="themeStore.textColor"
        label="字体颜色"
        description="页面主文字颜色"
        @update:model-value="themeStore.setText"
      />
    </div>

    <div class="flex gap-3">
      <ui-button
        type="primary"
        native-type="button"
        class="h-[38px] cursor-pointer rounded-[10px] px-5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-px active:scale-[0.96]"
        :style="{ background: 'var(--app-primary)', borderColor: 'var(--app-primary)' }"
        @click="themeStore.reset()"
      >
        恢复默认
      </ui-button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../store/theme'
import ThemeColorPicker from './ThemeColorPicker.vue'

const themeStore = useThemeStore()

const cardStyle = computed(() => ({
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  boxShadow: 'var(--app-shadow-soft)'
}))
</script>
