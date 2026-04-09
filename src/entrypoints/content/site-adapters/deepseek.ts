import type { ThemeSiteAdapter } from './types'
import {
  initDeepSeekTheme,
  applyDeepSeekCustomTheme,
  clearDeepSeekTheme,
} from '@/entrypoints/content/deepseek-theme/runtime'
import {
  getDeepSeekAppearanceState,
  setDeepSeekAppearanceMode,
  subscribeDeepSeekSystemThemeChange,
} from '@/entrypoints/content/deepseek-theme/appearance'
import {
  getThemeBackgroundSettings,
  initThemeBackground,
  updateThemeBackgroundSettings,
  uploadThemeBackground,
  removeThemeBackground,
  resolveThemeBackgroundPreviewUrl,
} from '@/entrypoints/content/deepseek-theme/background/service'

export const deepSeekThemeSiteAdapter: ThemeSiteAdapter = {
  siteKey: 'deepseek',
  displayName: 'DeepSeek',
  capabilities: {
    backgroundImage: true,
    blur: true,
    messageGlass: true,
    sidebarScrim: true,
    welcomeGreetingReadability: false,
  },
  matches: (hostname) => hostname === 'chat.deepseek.com',
  getContext: (hostname) => ({
    siteKey: 'deepseek',
    displayName: 'DeepSeek',
    hostname,
    capabilities: {
      backgroundImage: true,
      blur: true,
      messageGlass: true,
      sidebarScrim: true,
      welcomeGreetingReadability: false,
    },
  }),
  initTheme: initDeepSeekTheme,
  applyCustomTheme: applyDeepSeekCustomTheme,
  clearTheme: clearDeepSeekTheme,
  getAppearanceState: getDeepSeekAppearanceState,
  setAppearanceMode: setDeepSeekAppearanceMode,
  subscribeSystemThemeChange: subscribeDeepSeekSystemThemeChange,
  getThemeBackgroundSettings,
  initThemeBackground,
  updateThemeBackgroundSettings,
  uploadThemeBackground,
  removeThemeBackground,
  resolveThemeBackgroundPreviewUrl,
}
