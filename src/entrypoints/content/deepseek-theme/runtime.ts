import {
  CUSTOM_THEME_KEY,
  normalizeCustomThemeSettings,
  type CustomThemeSettings,
} from '@/entrypoints/content/gemini-theme/customTheme'
import {
  getCustomThemeSettings,
  getThemeCustomSettingsStorage,
  getThemeKey,
  getThemeKeyStorage,
  setCustomThemeSettings,
  setThemeKey,
} from '@/entrypoints/content/gemini-theme/themeStorage'
import { buildDeepSeekCustomThemeCss } from './customTheme'
import { injectDeepSeekThemeOverride, removeDeepSeekThemeOverride } from './inject'
import { initDeepSeekAppearance } from './appearance'

const DEEPSEEK_SITE_KEY = 'deepseek' as const

let watchersInitialized = false

async function resolveThemeCss(key: string): Promise<string | null> {
  if (key !== CUSTOM_THEME_KEY) {
    return null
  }

  const settings = await getCustomThemeSettings(DEEPSEEK_SITE_KEY)
  return buildDeepSeekCustomThemeCss(settings)
}

async function syncThemeCss(key: string): Promise<void> {
  const css = await resolveThemeCss(key)
  if (css) {
    injectDeepSeekThemeOverride(css)
  } else {
    removeDeepSeekThemeOverride()
  }
}

export async function initDeepSeekTheme(): Promise<void> {
  await initDeepSeekAppearance()

  try {
    await syncThemeCss(await getThemeKey(DEEPSEEK_SITE_KEY))
  } catch (error) {
    console.warn('[Theme] Failed to initialize DeepSeek theme:', error)
  }

  if (watchersInitialized) return
  watchersInitialized = true

  getThemeKeyStorage(DEEPSEEK_SITE_KEY).watch((newKey) => {
    void syncThemeCss(newKey ?? '')
  })
  getThemeCustomSettingsStorage(DEEPSEEK_SITE_KEY).watch((newSettings) => {
    if (!newSettings) return
    void getThemeKey(DEEPSEEK_SITE_KEY).then((key) => {
      if (key === CUSTOM_THEME_KEY) {
        injectDeepSeekThemeOverride(buildDeepSeekCustomThemeCss(newSettings))
      }
    })
  })
}

export async function applyDeepSeekCustomTheme(
  settings: Partial<CustomThemeSettings>,
): Promise<CustomThemeSettings> {
  const normalized = await setCustomThemeSettings(
    normalizeCustomThemeSettings(settings),
    DEEPSEEK_SITE_KEY,
  )
  injectDeepSeekThemeOverride(buildDeepSeekCustomThemeCss(normalized))
  await setThemeKey(CUSTOM_THEME_KEY, DEEPSEEK_SITE_KEY)
  return normalized
}

export async function clearDeepSeekTheme(): Promise<void> {
  removeDeepSeekThemeOverride()
  await setThemeKey('', DEEPSEEK_SITE_KEY)
}
