import { defineStore } from 'pinia'
import logger from '@/utils/logger'

// 默认外观配置（与 tailwind.css :root 中的浅色基调一致）
export const DEFAULT_THEME = Object.freeze({
  mode: 'light',
  primaryColor: '#c2703e',
  bgColor: '#faf6ef',
  textColor: '#3d3529'
})

// hex(#rrggbb / #rgb) → [r, g, b]
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('')
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

// 将两个颜色按比例混合，amount 越大越靠近 mixColor
function mixHex(color, mixColor, amount) {
  const a = hexToRgb(color)
  const b = hexToRgb(mixColor)
  if (!a || !b) return color
  const t = Math.min(1, Math.max(0, amount))
  const mix = a.map((ch, i) => Math.round(ch + (b[i] - ch) * t))
  return '#' + mix.map((ch) => ch.toString(16).padStart(2, '0')).join('')
}

function toHex(color) {
  const rgb = hexToRgb(color)
  return rgb ? '#' + rgb.map((ch) => ch.toString(16).padStart(2, '0')).join('') : null
}

export const useThemeStore = defineStore('theme', {
  state: () => ({ ...DEFAULT_THEME }),
  persist: {
    key: 'theme',
    storage: localStorage,
    paths: ['mode', 'primaryColor', 'bgColor', 'textColor']
  },
  getters: {
    isDark: (state) => state.mode === 'dark'
  },
  actions: {
    setMode(mode) {
      this.mode = mode === 'dark' ? 'dark' : 'light'
      this.applyTheme()
    },
    toggleMode() {
      this.setMode(this.mode === 'dark' ? 'light' : 'dark')
    },
    setPrimary(color) {
      this.primaryColor = toHex(color) || DEFAULT_THEME.primaryColor
      this.applyTheme()
    },
    setBg(color) {
      this.bgColor = toHex(color) || DEFAULT_THEME.bgColor
      this.applyTheme()
    },
    setText(color) {
      this.textColor = toHex(color) || DEFAULT_THEME.textColor
      this.applyTheme()
    },
    reset() {
      this.mode = DEFAULT_THEME.mode
      this.primaryColor = DEFAULT_THEME.primaryColor
      this.bgColor = DEFAULT_THEME.bgColor
      this.textColor = DEFAULT_THEME.textColor
      this.applyTheme()
    },
    /**
     * 将当前主题状态同步到 document.documentElement：
     * - 切换 .dark 类（深色模式）
     * - 始终注入用户主题色及其派生档位
     * - 仅浅色模式注入用户自定义背景色/字体色；深色模式移除这两项内联变量，
     *   让 tailwind.css 中 .dark 块的预设深色调色板生效。
     */
    applyTheme() {
      if (typeof document === 'undefined') return
      const root = document.documentElement
      try {
        root.classList.toggle('dark', this.mode === 'dark')

        const primary = toHex(this.primaryColor) || DEFAULT_THEME.primaryColor
        const primaryRgb = hexToRgb(primary)
        root.style.setProperty('--app-primary', primary)
        // 同步覆盖 Tailwind @theme 令牌，使 bg-app-primary 等工具类跟随
        root.style.setProperty('--color-app-primary', primary)
        if (primaryRgb) {
          root.style.setProperty('--app-primary-rgb', primaryRgb.join(', '))
          // 派生档位：strong 加深、soft 转为半透明叠加
          root.style.setProperty('--app-primary-strong', mixHex(primary, '#000000', 0.18))
          root.style.setProperty('--app-primary-soft', `rgba(${primaryRgb.join(', ')}, 0.12)`)
          root.style.setProperty('--ui-color-primary', primary)
          root.style.setProperty('--ui-color-primary-dark-2', mixHex(primary, '#000000', 0.18))
          root.style.setProperty('--ui-color-primary-light-3', mixHex(primary, '#ffffff', 0.3))
          root.style.setProperty('--ui-color-primary-light-5', mixHex(primary, '#ffffff', 0.55))
          root.style.setProperty('--ui-color-primary-light-7', mixHex(primary, '#ffffff', 0.75))
          root.style.setProperty('--ui-color-primary-light-9', mixHex(primary, '#ffffff', 0.92))
        }

        // 背景色：仅浅色模式注入；深色模式交给 .dark 预设
        if (this.mode === 'light') {
          const bg = toHex(this.bgColor) || DEFAULT_THEME.bgColor
          root.style.setProperty('--app-bg', bg)
          root.style.setProperty('--color-app-bg', bg)
          root.style.setProperty('--app-layout-main', bg)

          const text = toHex(this.textColor) || DEFAULT_THEME.textColor
          root.style.setProperty('--app-text', text)
          root.style.setProperty('--color-app-text', text)
          root.style.setProperty('--ui-text-color-primary', text)
        } else {
          root.style.removeProperty('--app-bg')
          root.style.removeProperty('--color-app-bg')
          root.style.removeProperty('--app-layout-main')
          root.style.removeProperty('--app-text')
          root.style.removeProperty('--color-app-text')
          root.style.removeProperty('--ui-text-color-primary')
        }
      } catch (error) {
        logger.warn('应用主题失败:', error?.message || error)
      }
    }
  }
})
