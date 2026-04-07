/**
 * Gemini page theme service.
 * Manages applying, switching, and clearing theme CSS overrides,
 * as well as persisting the active theme key.
 */

import { injectGeminiThemeOverride, removeGeminiThemeOverride } from './inject'
import {
  buildCustomThemeCss,
  CUSTOM_THEME_KEY,
  normalizeCustomThemeSettings,
  type CustomThemeSettings,
} from './customTheme'
import { themePresets, getPresetByKey } from './preset/presets'
import {
  getCustomThemeSettings,
  getThemeKey,
  setCustomThemeSettings,
  setThemeKey,
  themeCustomSettingsStorage,
  themeKeyStorage,
} from './themeStorage'
export * from './background'
export * from './appearance'
export * from './customTheme'

export { themePresets, getPresetByKey } from './preset/presets'
export { getCustomThemeSettings, getThemeKey } from './themeStorage'
export type { ThemePreset } from './preset/presets'

let watchersInitialized = false

async function resolveThemeCss(key: string): Promise<string | null> {
  if (key === CUSTOM_THEME_KEY) {
    const settings = await getCustomThemeSettings()
    return buildCustomThemeCss(settings)
  }

  const preset = getPresetByKey(key)
  return preset?.css ?? null
}

async function syncThemeCss(key: string): Promise<void> {
  const css = await resolveThemeCss(key)
  if (css) {
    injectGeminiThemeOverride(css)
  } else {
    removeGeminiThemeOverride()
  }
}

/**
 * Apply a theme by key. Injects CSS override and persists the choice.
 * If the key is 'blue' or empty, clears any override (Gemini default).
 */
export async function applyTheme(key: string): Promise<void> {
  if (!key) {
    removeGeminiThemeOverride()
    await setThemeKey('')
    return
  }

  const css = await resolveThemeCss(key)
  if (!css) {
    removeGeminiThemeOverride()
    await setThemeKey('')
    return
  }

  injectGeminiThemeOverride(css)
  await setThemeKey(key)
}

export async function applyCustomTheme(
  settings: Partial<CustomThemeSettings>,
): Promise<CustomThemeSettings> {
  const normalized = await setCustomThemeSettings(
    normalizeCustomThemeSettings(settings),
  )
  injectGeminiThemeOverride(buildCustomThemeCss(normalized))
  await setThemeKey(CUSTOM_THEME_KEY)
  return normalized
}

/**
 * Initialize theme on page load. Reads persisted key and applies.
 * Also starts a cross-tab watcher so other tabs react to theme changes.
 */
export async function initTheme(): Promise<void> {
  try {
    await syncThemeCss(await getThemeKey())
  } catch (error) {
    console.warn('[Theme] Failed to initialize theme:', error)
  }

  if (watchersInitialized) return
  watchersInitialized = true

  themeKeyStorage.watch((newKey) => {
    void syncThemeCss(newKey ?? '')
  })
  themeCustomSettingsStorage.watch((newSettings) => {
    if (!newSettings) return
    void getThemeKey().then((key) => {
      if (key === CUSTOM_THEME_KEY) {
        injectGeminiThemeOverride(buildCustomThemeCss(newSettings))
      }
    })
  })
}

/**
 * Clear the active theme, restoring Gemini's default styling.
 */
export async function clearTheme(): Promise<void> {
  removeGeminiThemeOverride()
  await setThemeKey('')
}
