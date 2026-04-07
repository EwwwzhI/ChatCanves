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
  getThemeCustomSettingsStorage,
  getThemeKey,
  getThemeKeyStorage,
  setCustomThemeSettings,
  setThemeKey,
} from './themeStorage'

const GEMINI_SITE_KEY = 'gemini' as const

let watchersInitialized = false

async function resolveThemeCss(key: string): Promise<string | null> {
  if (key === CUSTOM_THEME_KEY) {
    const settings = await getCustomThemeSettings(GEMINI_SITE_KEY)
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

export async function initGeminiTheme(): Promise<void> {
  try {
    await syncThemeCss(await getThemeKey(GEMINI_SITE_KEY))
  } catch (error) {
    console.warn('[Theme] Failed to initialize Gemini theme:', error)
  }

  if (watchersInitialized) return
  watchersInitialized = true

  getThemeKeyStorage(GEMINI_SITE_KEY).watch((newKey) => {
    void syncThemeCss(newKey ?? '')
  })
  getThemeCustomSettingsStorage(GEMINI_SITE_KEY).watch((newSettings) => {
    if (!newSettings) return
    void getThemeKey(GEMINI_SITE_KEY).then((key) => {
      if (key === CUSTOM_THEME_KEY) {
        injectGeminiThemeOverride(buildCustomThemeCss(newSettings))
      }
    })
  })
}

export async function applyGeminiCustomTheme(
  settings: Partial<CustomThemeSettings>,
): Promise<CustomThemeSettings> {
  const normalized = await setCustomThemeSettings(
    normalizeCustomThemeSettings(settings),
    GEMINI_SITE_KEY,
  )
  injectGeminiThemeOverride(buildCustomThemeCss(normalized))
  await setThemeKey(CUSTOM_THEME_KEY, GEMINI_SITE_KEY)
  return normalized
}

export async function clearGeminiTheme(): Promise<void> {
  removeGeminiThemeOverride()
  await setThemeKey('', GEMINI_SITE_KEY)
}

export { themePresets, getPresetByKey } from './preset/presets'
