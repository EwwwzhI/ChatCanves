import { renderOverlay } from "./overlay"
import { i18nCache } from '@/utils/i18nCache'
import { setActiveSiteContext } from './site-adapters/context'
import { resolveThemeSiteAdapter } from './site-adapters/registry'
import { initTheme, initThemeBackground } from './gemini-theme'

export default defineContentScript({
  matches: ['*://gemini.google.com/*', '*://chat.deepseek.com/*'],
  runAt: 'document_idle',
  async main(ctx) {
    const adapter = resolveThemeSiteAdapter(window.location.hostname)
    if (!adapter) return

    i18nCache.initialize()
    setActiveSiteContext(adapter.getContext(window.location.hostname))

    if (adapter.mainWorldScript) {
      await injectScript(adapter.mainWorldScript as Parameters<typeof injectScript>[0], {
        keepInDom: true,
      })
    }
    await initTheme()
    await initThemeBackground()

    const ui = createIntegratedUi(ctx, {
      position: 'modal',
      anchor: 'body',
      zIndex: 9999999999,
      tag: 'div',
      append: (anchor, ui) => {
        const uiElement = ui as HTMLDivElement
        uiElement.style.zIndex = '9999999999'
        uiElement.style.position = 'fixed'
        uiElement.style.top = '0'
        anchor.appendChild(ui)
      },
      onMount: (container) => {
        renderOverlay(container)
      },
    });

    ui.mount();
  },
});
