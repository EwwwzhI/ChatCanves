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
import type { CustomThemeApplyOptions } from '@/entrypoints/content/site-adapters/types'
import { buildChatGptCustomThemeCss } from './customTheme'
import { injectChatGptThemeOverride, removeChatGptThemeOverride } from './inject'
import { initChatGptAppearance, syncChatGptThemeCarrier } from './appearance'
import { initChatGptLayoutSync } from './layout'

const CHATGPT_SITE_KEY = 'chatgpt' as const

let watchersInitialized = false

async function resolveThemeCss(key: string): Promise<string | null> {
  if (key !== CUSTOM_THEME_KEY) {
    return null
  }

  const settings = await getCustomThemeSettings(CHATGPT_SITE_KEY)
  return buildChatGptCustomThemeCss(settings)
}

async function syncThemeCss(key: string): Promise<void> {
  const css = await resolveThemeCss(key)
  if (css) {
    injectChatGptThemeOverride(css)
  } else {
    removeChatGptThemeOverride()
  }
}

export async function initChatGptTheme(): Promise<void> {
  initChatGptLayoutSync()
  await initChatGptAppearance()
  syncChatGptThemeCarrier()

  try {
    await syncThemeCss(await getThemeKey(CHATGPT_SITE_KEY))
  } catch (error) {
    console.warn('[Theme] Failed to initialize ChatGPT theme:', error)
  }

  if (watchersInitialized) return
  watchersInitialized = true

  getThemeKeyStorage(CHATGPT_SITE_KEY).watch((newKey) => {
    void syncThemeCss(newKey ?? '')
  })
  getThemeCustomSettingsStorage(CHATGPT_SITE_KEY).watch((newSettings) => {
    if (!newSettings) return
    void getThemeKey(CHATGPT_SITE_KEY).then((key) => {
      if (key === CUSTOM_THEME_KEY) {
        injectChatGptThemeOverride(buildChatGptCustomThemeCss(newSettings))
      }
    })
  })

  const observer = new MutationObserver(() => {
    syncChatGptThemeCarrier()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  })
  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })
  }
}

export async function applyChatGptCustomTheme(
  settings: Partial<CustomThemeSettings>,
  options?: CustomThemeApplyOptions,
): Promise<CustomThemeSettings> {
  const normalized = normalizeCustomThemeSettings(settings)
  injectChatGptThemeOverride(buildChatGptCustomThemeCss(normalized))
  if (options?.persist === false) {
    return normalized
  }

  const persisted = await setCustomThemeSettings(
    normalized,
    CHATGPT_SITE_KEY,
  )
  await setThemeKey(CUSTOM_THEME_KEY, CHATGPT_SITE_KEY)
  return persisted
}

export async function clearChatGptTheme(): Promise<void> {
  removeChatGptThemeOverride()
  await setThemeKey('', CHATGPT_SITE_KEY)
}
