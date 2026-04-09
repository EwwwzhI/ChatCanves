import type { ThemeSiteAdapter } from './types'
import {
  initChatGptTheme,
  applyChatGptCustomTheme,
  clearChatGptTheme,
} from '@/entrypoints/content/chatgpt-theme/runtime'
import {
  getChatGptAppearanceState,
  setChatGptAppearanceMode,
  subscribeChatGptSystemThemeChange,
} from '@/entrypoints/content/chatgpt-theme/appearance'
import {
  getThemeBackgroundSettings,
  initThemeBackground,
  updateThemeBackgroundSettings,
  uploadThemeBackground,
  removeThemeBackground,
  resolveThemeBackgroundPreviewUrl,
} from '@/entrypoints/content/chatgpt-theme/background/service'

export const chatGptThemeSiteAdapter: ThemeSiteAdapter = {
  siteKey: 'chatgpt',
  displayName: 'ChatGPT',
  capabilities: {
    backgroundImage: true,
    blur: true,
    messageGlass: false,
    sidebarScrim: false,
    welcomeGreetingReadability: false,
  },
  matches: (hostname) => hostname === 'chatgpt.com',
  getContext: (hostname) => ({
    siteKey: 'chatgpt',
    displayName: 'ChatGPT',
    hostname,
    capabilities: {
      backgroundImage: true,
      blur: true,
      messageGlass: false,
      sidebarScrim: false,
      welcomeGreetingReadability: false,
    },
  }),
  initTheme: initChatGptTheme,
  applyCustomTheme: applyChatGptCustomTheme,
  clearTheme: clearChatGptTheme,
  getAppearanceState: getChatGptAppearanceState,
  setAppearanceMode: setChatGptAppearanceMode,
  subscribeSystemThemeChange: subscribeChatGptSystemThemeChange,
  getThemeBackgroundSettings,
  initThemeBackground,
  updateThemeBackgroundSettings,
  uploadThemeBackground,
  removeThemeBackground,
  resolveThemeBackgroundPreviewUrl,
}
