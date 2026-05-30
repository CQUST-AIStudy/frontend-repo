import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

export function useResponsiveLayout(options = {}) {
  const breakpoint = options.breakpoint ?? 960
  const expandedWidth = options.expandedWidth ?? '240px'
  const collapsedWidth = options.collapsedWidth ?? '64px'

  const collapsed = shallowRef(Boolean(options.initialCollapsed))
  const isMobile = shallowRef(false)
  const mobileMenuVisible = shallowRef(false)
  let mediaQuery = null

  const syncViewport = (matches) => {
    isMobile.value = matches
    if (!matches) {
      mobileMenuVisible.value = false
    }
  }

  const handleMediaChange = (event) => {
    syncViewport(event.matches)
  }

  const asideWidth = computed(() => (collapsed.value ? collapsedWidth : expandedWidth))

  const closeMobileMenu = () => {
    mobileMenuVisible.value = false
  }

  const toggleNavigation = () => {
    if (isMobile.value) {
      mobileMenuVisible.value = !mobileMenuVisible.value
      return
    }

    collapsed.value = !collapsed.value
  }

  if (options.route) {
    watch(() => options.route.path, closeMobileMenu)
  }

  const canUseMatchMedia = () => (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  )

  const createMediaQuery = () => {
    if (!canUseMatchMedia()) return null
    return window.matchMedia(`(max-width: ${breakpoint}px)`)
  }

  mediaQuery = createMediaQuery()
  if (mediaQuery) {
    syncViewport(mediaQuery.matches)
  }

  onMounted(() => {
    if (!mediaQuery) {
      mediaQuery = createMediaQuery()
    }
    if (!mediaQuery) return

    syncViewport(mediaQuery.matches)

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange)
      return
    }

    mediaQuery.addListener(handleMediaChange)
  })

  onBeforeUnmount(() => {
    if (!mediaQuery) return

    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleMediaChange)
      return
    }

    mediaQuery.removeListener(handleMediaChange)
  })

  return {
    isMobile,
    collapsed,
    mobileMenuVisible,
    asideWidth,
    toggleNavigation,
    closeMobileMenu
  }
}
