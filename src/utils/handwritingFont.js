const DEFAULT_HANDWRITING_FONT = 'KaiTi'

export async function ensureHandwritingFont(fontFamily = DEFAULT_HANDWRITING_FONT, fontSize = 28) {
  if (typeof window === 'undefined' || !document.fonts?.load) return

  const resolvedFont =
    !fontFamily || fontFamily === 'ZiYouLangManTi' ? DEFAULT_HANDWRITING_FONT : fontFamily

  try {
    await document.fonts.load(`${fontSize}px ${resolvedFont}`)
    await document.fonts.ready
  } catch {
    // Fall back to system fonts when the requested face is unavailable.
  }
}

export default {
  ensureHandwritingFont,
}
