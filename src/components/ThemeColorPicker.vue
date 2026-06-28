<template>
  <div ref="rootRef" class="theme-color-picker relative inline-block w-full">
    <button
      ref="triggerRef"
      type="button"
      class="tcp-trigger group inline-flex w-full items-center gap-3 rounded-[10px] border px-3 py-2 text-left transition-colors"
      :style="triggerStyle"
      @click="toggle"
    >
      <span
        class="tcp-swatch inline-block h-7 w-7 shrink-0 rounded-[8px] border"
        :style="{ background: modelValue, borderColor: 'var(--app-border-strong)' }"
      />
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="tcp-label text-[14px] font-semibold leading-[1.3]">{{ label }}</span>
        <span v-if="description" class="tcp-desc mt-[2px] text-[12px] leading-[1.4]" :style="{ color: 'var(--app-text-secondary)' }">{{ description }}</span>
      </span>
      <span class="tcp-hex text-[13px] font-mono uppercase" :style="{ color: 'var(--app-text-secondary)' }">{{ modelValue }}</span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="popoverRef"
        class="tcp-popover fixed z-[2000] rounded-[12px] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
        :style="popoverStyle"
        @click.stop
      >
        <!-- 预设色板 -->
        <div class="tcp-presets mb-2 flex flex-wrap gap-1.5">
          <button
            v-for="c in presets"
            :key="c"
            type="button"
            class="h-6 w-6 rounded-[6px] border transition-transform hover:scale-110"
            :style="{ background: c, borderColor: 'var(--app-border)' }"
            :title="c"
            @click="onPreset(c)"
          />
        </div>

        <Photoshop
          :model-value="draft"
          @update:model-value="onInput"
          @ok="commit"
          @cancel="cancel"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Photoshop } from '@ckpack/vue-color'

const props = defineProps({
  modelValue: { type: String, required: true },
  label: { type: String, default: '' },
  description: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

// 常用预设色板，覆盖暖色/冷色/语义色，方便一键选取
const presets = [
  '#c2703e', '#1f7ae0', '#6b8f6b', '#c49a3c', '#c44b3f',
  '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#64748b',
  '#faf6ef', '#3d3529', '#111827', '#ffffff', '#000000'
]

const rootRef = ref(null)
const triggerRef = ref(null)
const popoverRef = ref(null)
const open = ref(false)
const draft = ref(props.modelValue)
const pos = ref({ left: 0, top: 0 })

watch(() => props.modelValue, (v) => { if (!open.value) draft.value = v })

const triggerStyle = computed(() => ({
  background: 'var(--app-surface)',
  borderColor: 'var(--app-border)'
}))

const popoverStyle = computed(() => ({
  left: pos.value.left + 'px',
  top: pos.value.top + 'px',
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)'
}))

function toggle() {
  if (open.value) {
    close()
    return
  }
  draft.value = props.modelValue
  open.value = true
  nextTick(() => {
    updatePosition()
    // 下一帧绑定外部点击关闭，避免触发本次点击
    requestAnimationFrame(() => {
      document.addEventListener('click', onOutside)
      document.addEventListener('keydown', onKeydown)
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', onScrollClose, true)
    })
  })
}

function updatePosition() {
  const trigger = triggerRef.value
  const popover = popoverRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  const gap = 8
  const margin = 8

  // 弹窗尺寸：优先用已渲染的实际尺寸，否则按 Photoshop 默认估算
  const popW = popover ? popover.offsetWidth : 480
  const popH = popover ? popover.offsetHeight : 380

  let left = rect.left
  let top = rect.bottom + gap

  // 底部溢出 → 翻到上方
  if (top + popH > window.innerHeight - margin) {
    top = rect.top - popH - gap
  }
  // 仍超出顶部 → 贴顶
  if (top < margin) {
    top = margin
  }
  // 右侧溢出 → 右对齐
  if (left + popW > window.innerWidth - margin) {
    left = rect.right - popW
  }
  // 左侧溢出 → 贴左
  if (left < margin) {
    left = margin
  }

  pos.value = { left, top }
}

function onOutside(e) {
  // 点击触发按钮不处理（由 toggle 处理），点击弹窗内部不关闭
  if (triggerRef.value && triggerRef.value.contains(e.target)) return
  if (popoverRef.value && popoverRef.value.contains(e.target)) return
  close()
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    cancel()
  }
}

// 页面滚动时直接关闭，避免定位抖动与脱离触发按钮
function onScrollClose() {
  close()
}

function close() {
  if (!open.value) return
  open.value = false
  document.removeEventListener('click', onOutside)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', onScrollClose, true)
}

// @ckpack/vue-color 的 update:modelValue 携带的是一个 color 对象（含 hex/rgba/hsv…）
function onInput(val) {
  const hex = normalizeToHex(val)
  if (hex) draft.value = hex
}

function onPreset(hex) {
  const normalized = normalizeToHex(hex) || hex
  draft.value = normalized
  emit('update:modelValue', normalized)
  close()
}

function commit() {
  const hex = normalizeToHex(draft.value) || props.modelValue
  draft.value = hex
  emit('update:modelValue', hex)
  close()
}

function cancel() {
  close()
}

function normalizeToHex(val) {
  if (!val) return null
  if (typeof val === 'string') return val
  if (val.hex) return val.hex
  if (val.hex8) return val.hex8
  if (val.rgba) {
    const { r, g, b } = val.rgba
    return '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
  }
  return null
}

onBeforeUnmount(() => {
  document.removeEventListener('click', onOutside)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', onScrollClose, true)
})
</script>
