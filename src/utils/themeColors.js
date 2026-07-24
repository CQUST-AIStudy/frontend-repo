export const APP_CHART_COLORS = Object.freeze([
  '#d18a61',
  '#6b8f6b',
  '#c49a3c',
  '#8b728e',
  '#c44b3f'
])

export function getThemePrimaryColor() {
  if (typeof document === 'undefined') return APP_CHART_COLORS[0]

  return getComputedStyle(document.documentElement)
    .getPropertyValue('--app-primary')
    .trim() || APP_CHART_COLORS[0]
}
