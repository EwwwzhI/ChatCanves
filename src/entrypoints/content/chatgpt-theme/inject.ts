const STYLE_ID = 'chatcanves-chatgpt-theme-override'

export function injectChatGptThemeOverride(css: string): void {
  if (typeof document === 'undefined' || !document.head) return

  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }

  el.textContent = css
}

export function removeChatGptThemeOverride(): void {
  if (typeof document === 'undefined') return
  document.getElementById(STYLE_ID)?.remove()
}
