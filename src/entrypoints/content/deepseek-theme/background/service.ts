import type {
  ThemeAssetRow,
  ThemeBackgroundResolvedState,
  ThemeBackgroundSettings,
} from '@/entrypoints/content/gemini-theme/background/types'
import { createThemeBackgroundService } from '@/entrypoints/content/gemini-theme/background/createService'
import {
  applyDeepSeekThemeBackgroundStyle,
  clearDeepSeekThemeBackgroundStyle,
} from './styleController'

async function resolveDeepSeekReadabilitySettings(
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

function applyDeepSeekReadabilityFromState(_state: ThemeBackgroundResolvedState): void {
  // DeepSeek v1 does not expose a stable welcome greeting surface.
}

function clearDeepSeekReadabilityStyle(): void {
  // DeepSeek v1 does not expose a stable welcome greeting surface.
}

function resetDeepSeekReadabilityServiceForTests(): void {
  // no-op
}

const deepSeekThemeBackgroundService = createThemeBackgroundService({
  siteKey: 'deepseek',
  applyBackgroundStyle: applyDeepSeekThemeBackgroundStyle,
  clearBackgroundStyle: clearDeepSeekThemeBackgroundStyle,
  applyReadabilityFromState: applyDeepSeekReadabilityFromState,
  clearReadabilityStyle: clearDeepSeekReadabilityStyle,
  resolveReadabilitySettings: resolveDeepSeekReadabilitySettings,
  resetReadabilityServiceForTests: resetDeepSeekReadabilityServiceForTests,
})

export const ThemeBackgroundError = deepSeekThemeBackgroundService.ThemeBackgroundError
export const getThemeBackgroundSettings = deepSeekThemeBackgroundService.getThemeBackgroundSettings
export const initThemeBackground = deepSeekThemeBackgroundService.initThemeBackground
export const removeThemeBackground = deepSeekThemeBackgroundService.removeThemeBackground
export const resolveThemeBackgroundPreviewUrl = deepSeekThemeBackgroundService.resolveThemeBackgroundPreviewUrl
export const updateThemeBackgroundSettings = deepSeekThemeBackgroundService.updateThemeBackgroundSettings
export const uploadThemeBackground = deepSeekThemeBackgroundService.uploadThemeBackground
export const validateThemeBackgroundFile = deepSeekThemeBackgroundService.validateThemeBackgroundFile
export const __resetThemeBackgroundServiceForTests =
  deepSeekThemeBackgroundService.__resetThemeBackgroundServiceForTests
