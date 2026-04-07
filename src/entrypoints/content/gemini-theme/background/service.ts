import {
  applyWelcomeGreetingReadabilityFromState,
  clearWelcomeGreetingReadabilityStyle,
  resolveWelcomeGreetingReadabilitySettings,
  __resetWelcomeGreetingReadabilityServiceForTests,
} from './welcome-greeting'
import {
  applyThemeBackgroundStyle,
  clearThemeBackgroundStyle,
} from './styleController'
import { createThemeBackgroundService } from './createService'

const geminiThemeBackgroundService = createThemeBackgroundService({
  siteKey: 'gemini',
  applyBackgroundStyle: applyThemeBackgroundStyle,
  clearBackgroundStyle: clearThemeBackgroundStyle,
  applyReadabilityFromState: applyWelcomeGreetingReadabilityFromState,
  clearReadabilityStyle: clearWelcomeGreetingReadabilityStyle,
  resolveReadabilitySettings: resolveWelcomeGreetingReadabilitySettings,
  resetReadabilityServiceForTests: __resetWelcomeGreetingReadabilityServiceForTests,
})

export const ThemeBackgroundError = geminiThemeBackgroundService.ThemeBackgroundError
export const getThemeBackgroundSettings = geminiThemeBackgroundService.getThemeBackgroundSettings
export const initThemeBackground = geminiThemeBackgroundService.initThemeBackground
export const removeThemeBackground = geminiThemeBackgroundService.removeThemeBackground
export const resolveThemeBackgroundPreviewUrl = geminiThemeBackgroundService.resolveThemeBackgroundPreviewUrl
export const updateThemeBackgroundSettings = geminiThemeBackgroundService.updateThemeBackgroundSettings
export const uploadThemeBackground = geminiThemeBackgroundService.uploadThemeBackground
export const validateThemeBackgroundFile = geminiThemeBackgroundService.validateThemeBackgroundFile
export const __resetThemeBackgroundServiceForTests =
  geminiThemeBackgroundService.__resetThemeBackgroundServiceForTests
