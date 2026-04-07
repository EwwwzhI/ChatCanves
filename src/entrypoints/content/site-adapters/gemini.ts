import type { ThemeSiteAdapter } from './types'
import { initGeminiTheme, applyGeminiCustomTheme, clearGeminiTheme } from '@/entrypoints/content/gemini-theme/runtime'
import {
  getAppearanceState,
  setAppearanceMode,
  subscribeSystemThemeChange,
} from '@/entrypoints/content/gemini-theme/appearance'
import {
  getThemeBackgroundSettings,
  initThemeBackground,
  updateThemeBackgroundSettings,
  uploadThemeBackground,
  removeThemeBackground,
  resolveThemeBackgroundPreviewUrl,
} from '@/entrypoints/content/gemini-theme/background/service'

export const geminiThemeSiteAdapter: ThemeSiteAdapter = {
  siteKey: 'gemini',
  displayName: 'Gemini',
  mainWorldScript: '/theme-sync-main-world.js',
  capabilities: {
    backgroundImage: true,
    blur: true,
    messageGlass: true,
    sidebarScrim: true,
    welcomeGreetingReadability: true,
  },
  matches: (hostname) => hostname === 'gemini.google.com',
  getContext: (hostname) => ({
    siteKey: 'gemini',
    displayName: 'Gemini',
    hostname,
    capabilities: {
      backgroundImage: true,
      blur: true,
      messageGlass: true,
      sidebarScrim: true,
      welcomeGreetingReadability: true,
    },
  }),
  initTheme: initGeminiTheme,
  applyCustomTheme: applyGeminiCustomTheme,
  clearTheme: clearGeminiTheme,
  getAppearanceState,
  setAppearanceMode,
  subscribeSystemThemeChange,
  getThemeBackgroundSettings,
  initThemeBackground,
  updateThemeBackgroundSettings,
  uploadThemeBackground,
  removeThemeBackground,
  resolveThemeBackgroundPreviewUrl,
}
