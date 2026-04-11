import { afterEach, describe, expect, it } from 'vitest'
import { getActiveSiteContext, getActiveSiteKey, setActiveSiteContext } from './context'
import { resolveThemeSiteAdapter } from './registry'
import { __resetStorageMock } from '@/test/mocks/wxt-imports'
import { setThemeKey } from '@/entrypoints/content/gemini-theme/themeStorage'
import {
  getThemeKey,
  getThemeBackgroundSettings,
  updateThemeBackgroundSettings,
} from '@/entrypoints/content/gemini-theme'

const GEMINI_CONTEXT = {
  siteKey: 'gemini' as const,
  displayName: 'Gemini',
  hostname: 'gemini.google.com',
  capabilities: {
    backgroundImage: true,
    blur: true,
    messageGlass: true,
    sidebarScrim: true,
    welcomeGreetingReadability: true,
  },
}

afterEach(() => {
  setActiveSiteContext(GEMINI_CONTEXT)
  __resetStorageMock()
})

describe('theme site adapters', () => {
  it('resolves the Gemini adapter by hostname', () => {
    const adapter = resolveThemeSiteAdapter('gemini.google.com')

    expect(adapter?.siteKey).toBe('gemini')
    expect(adapter?.mainWorldScript).toBe('/theme-sync-main-world.js')
  })

  it('resolves the DeepSeek adapter by hostname', () => {
    const adapter = resolveThemeSiteAdapter('chat.deepseek.com')

    expect(adapter?.siteKey).toBe('deepseek')
    expect(adapter?.capabilities.messageGlass).toBe(true)
    expect(adapter?.capabilities.sidebarScrim).toBe(true)
    expect(adapter?.capabilities.welcomeGreetingReadability).toBe(false)
  })



  it('tracks the active site context for storage routing', () => {
    setActiveSiteContext({
      siteKey: 'deepseek',
      displayName: 'DeepSeek',
      hostname: 'chat.deepseek.com',
      capabilities: {
        backgroundImage: true,
        blur: true,
        messageGlass: false,
        sidebarScrim: false,
        welcomeGreetingReadability: false,
      },
    })

    expect(getActiveSiteKey()).toBe('deepseek')
    expect(getActiveSiteContext().displayName).toBe('DeepSeek')
  })


})
