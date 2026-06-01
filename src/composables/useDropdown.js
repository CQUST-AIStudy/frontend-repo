import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useDropdown() {
  const visible = ref(false)
  const triggerRef = ref(null)
  const menuRef = ref(null)

  function toggle() {
    visible.value = !visible.value
  }

  function open() {
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  function handleClickOutside(e) {
    if (!visible.value) return
    const trigger = triggerRef.value?.$el || triggerRef.value
    const menu = menuRef.value?.$el || menuRef.value
    if (trigger && trigger.contains(e.target)) return
    if (menu && menu.contains(e.target)) return
    visible.value = false
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
  })

  return { visible, triggerRef, menuRef, toggle, open, close }
}
