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
import type { CustomThemeApplyOptions } from '@/entrypoints/content/site-adapters/types'

const GEMINI_SITE_KEY = 'gemini' as const

let watchersInitialized = false
let queuedCustomThemeSettings = normalizeCustomThemeSettings({})
let customThemePersistPromise: Promise<CustomThemeSettings> | null = null

function isSameCustomThemeSettings(
  left: CustomThemeSettings,
  right: CustomThemeSettings,
): boolean {
  return (
    left.accentColor === right.accentColor
    && left.surfaceColor === right.surfaceColor
    && left.surfaceOpacity === right.surfaceOpacity
    && left.textColor === right.textColor
  )
}

async function persistQueuedGeminiCustomTheme(): Promise<CustomThemeSettings> {
  if (customThemePersistPromise) {
    return await customThemePersistPromise
  }

  customThemePersistPromise = (async () => {
    let persisted = queuedCustomThemeSettings

    while (true) {
      const target = queuedCustomThemeSettings
      await setCustomThemeSettings(target, GEMINI_SITE_KEY)
      await setThemeKey(CUSTOM_THEME_KEY, GEMINI_SITE_KEY)
      persisted = target

      if (isSameCustomThemeSettings(target, queuedCustomThemeSettings)) {
        return persisted
      }
    }
  })()

  try {
    return await customThemePersistPromise
  } finally {
    customThemePersistPromise = null
  }
}

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
  options?: CustomThemeApplyOptions,
): Promise<CustomThemeSettings> {
  const normalized = normalizeCustomThemeSettings(settings)
  injectGeminiThemeOverride(buildCustomThemeCss(normalized))
  if (options?.persist === false) {
    return normalized
  }

  queuedCustomThemeSettings = normalized
  return await persistQueuedGeminiCustomTheme()
}

export async function clearGeminiTheme(): Promise<void> {
  removeGeminiThemeOverride()
  await setThemeKey('', GEMINI_SITE_KEY)
}

export { themePresets, getPresetByKey } from './preset/presets'
