<template>
  <main class="status-page">
    <section class="status-content" :aria-labelledby="titleId">
      <div class="status-mark" aria-hidden="true">
        <WarningFilled />
      </div>
      <p class="status-code">{{ statusCode }}</p>
      <h1 :id="titleId">{{ title }}</h1>
      <p class="status-description">{{ description }}</p>

      <div class="status-actions">
        <UiButton type="primary" @click="goHome">
          <HomeFilled />
          回到首页
        </UiButton>
        <UiButton @click="goBack">
          <ArrowLeft />
          返回上一页
        </UiButton>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '../../constants/auth'
import { ArrowLeft, HomeFilled, WarningFilled } from '../../components/ui/icons'

const props = defineProps({
  statusCode: { type: [Number, String], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
})

const router = useRouter()
const titleId = computed(() => `status-title-${props.statusCode}`)

function getHomePath() {
  const role = getUserInfo()?.role
  if (role === 'teacher') return '/teacher/dashboard'
  if (role === 'student') return '/student/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  return '/login'
}

function goHome() {
  router.push(getHomePath())
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  goHome()
}
</script>

<style scoped>
.status-page {
  display: grid;
  min-height: 100vh;
  min-height: 100dvh;
  place-items: center;
  overflow: hidden;
  padding: 32px;
  color: var(--app-text);
  background-color: var(--app-bg);
  background-image:
    linear-gradient(var(--app-border-softer) 1px, transparent 1px),
    linear-gradient(90deg, var(--app-border-softer) 1px, transparent 1px);
  background-size: 32px 32px;
}

.status-content {
  width: min(100%, 680px);
  text-align: center;
}

.status-mark {
  display: inline-grid;
  width: 56px;
  height: 56px;
  margin-bottom: 20px;
  place-items: center;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  color: var(--app-primary);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-soft);
  font-size: 28px;
}

.status-code {
  margin: 0;
  color: var(--app-primary);
  font-size: clamp(64px, 12vw, 112px);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: 0;
}

h1 {
  margin: 24px 0 0;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0;
}

.status-description {
  max-width: 560px;
  margin: 14px auto 0;
  color: var(--app-text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.status-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

.status-actions :deep(.ui-button) {
  min-width: 132px;
}

@media (max-width: 520px) {
  .status-page {
    padding: 24px 16px;
  }

  .status-code {
    font-size: 64px;
  }

  h1 {
    margin-top: 18px;
    font-size: 24px;
  }

  .status-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .status-actions :deep(.ui-button) {
    width: 100%;
  }
}
</style>
