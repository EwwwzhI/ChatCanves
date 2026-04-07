import { renderOverlay } from "./overlay"
import { i18nCache } from '@/utils/i18nCache'
import { initTheme, initThemeBackground } from './gemini-theme'

export default defineContentScript({
  matches: ['*://gemini.google.com/*'],
  runAt: 'document_idle',
  async main(ctx) {
    i18nCache.initialize()
    await injectScript('/theme-sync-main-world.js', {
      keepInDom: true,
    })
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
