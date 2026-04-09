import type {
  ThemeAssetRow,
  ThemeBackgroundResolvedState,
  ThemeBackgroundSettings,
} from '@/entrypoints/content/gemini-theme/background/types'
import { createThemeBackgroundService } from '@/entrypoints/content/gemini-theme/background/createService'
import {
  applyChatGptThemeBackgroundStyle,
  clearChatGptThemeBackgroundStyle,
} from './styleController'

async function resolveChatGptReadabilitySettings(
  options: {
    settings: ThemeBackgroundSettings
    asset: ThemeAssetRow | null
    forceRecompute?: boolean
  },
): Promise<ThemeBackgroundSettings> {
  return {
    ...options.settings,
    welcomeGreetingResolved: 'default',
    welcomeGreetingResolvedAssetId: null,
  }
}

function applyChatGptReadabilityFromState(_state: ThemeBackgroundResolvedState): void {
  // ChatGPT v1 does not expose a stable welcome greeting surface.
}

function clearChatGptReadabilityStyle(): void {
  // ChatGPT v1 does not expose a stable welcome greeting surface.
}

function resetChatGptReadabilityServiceForTests(): void {
  // no-op
}

const chatGptThemeBackgroundService = createThemeBackgroundService({
  siteKey: 'chatgpt',
  applyBackgroundStyle: applyChatGptThemeBackgroundStyle,
  clearBackgroundStyle: clearChatGptThemeBackgroundStyle,
  applyReadabilityFromState: applyChatGptReadabilityFromState,
  clearReadabilityStyle: clearChatGptReadabilityStyle,
  resolveReadabilitySettings: resolveChatGptReadabilitySettings,
  resetReadabilityServiceForTests: resetChatGptReadabilityServiceForTests,
})

export const ThemeBackgroundError = chatGptThemeBackgroundService.ThemeBackgroundError
export const getThemeBackgroundSettings = chatGptThemeBackgroundService.getThemeBackgroundSettings
export const initThemeBackground = chatGptThemeBackgroundService.initThemeBackground
export const removeThemeBackground = chatGptThemeBackgroundService.removeThemeBackground
export const resolveThemeBackgroundPreviewUrl = chatGptThemeBackgroundService.resolveThemeBackgroundPreviewUrl
export const updateThemeBackgroundSettings = chatGptThemeBackgroundService.updateThemeBackgroundSettings
export const uploadThemeBackground = chatGptThemeBackgroundService.uploadThemeBackground
export const validateThemeBackgroundFile = chatGptThemeBackgroundService.validateThemeBackgroundFile
export const __resetThemeBackgroundServiceForTests =
  chatGptThemeBackgroundService.__resetThemeBackgroundServiceForTests
