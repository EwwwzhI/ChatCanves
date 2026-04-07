import { storage } from '#imports'
import type { SiteKey } from '@/common/site'
import { getActiveSiteKey } from '@/entrypoints/content/site-adapters/context'
import {
  DEFAULT_THEME_BACKGROUND_SETTINGS,
  normalizeThemeBackgroundSettings,
  type ThemeBackgroundSettings,
} from './types'

const legacyThemeBackgroundSettingsStorage =
  storage.defineItem<ThemeBackgroundSettings>('local:themeBackgroundSettings', {
    fallback: DEFAULT_THEME_BACKGROUND_SETTINGS,
  })

const themeBackgroundSettingsStorageMap = {
  gemini: storage.defineItem<ThemeBackgroundSettings | null>(
    'local:themeBackgroundSettings:gemini',
    { fallback: null },
  ),
  deepseek: storage.defineItem<ThemeBackgroundSettings | null>(
    'local:themeBackgroundSettings:deepseek',
    { fallback: null },
  ),
} as const

function resolveSiteKey(siteKey?: SiteKey): SiteKey {
  return siteKey ?? getActiveSiteKey()
}

export function getThemeBackgroundSettingsStorage(siteKey?: SiteKey) {
  return themeBackgroundSettingsStorageMap[resolveSiteKey(siteKey)]
}

async function migrateGeminiBackgroundSettingsFromLegacy(): Promise<ThemeBackgroundSettings> {
  const legacyValue = normalizeThemeBackgroundSettings(
    await legacyThemeBackgroundSettingsStorage.getValue(),
  )
  await themeBackgroundSettingsStorageMap.gemini.setValue(legacyValue)
  return legacyValue
}

export async function getStoredThemeBackgroundSettings(
  siteKey?: SiteKey,
): Promise<ThemeBackgroundSettings> {
  const resolvedSiteKey = resolveSiteKey(siteKey)
  const currentValue = await themeBackgroundSettingsStorageMap[resolvedSiteKey].getValue()

  if (currentValue) {
    return normalizeThemeBackgroundSettings(currentValue)
  }

  if (resolvedSiteKey === 'gemini') {
    return await migrateGeminiBackgroundSettingsFromLegacy()
  }

  return DEFAULT_THEME_BACKGROUND_SETTINGS
}

export async function setStoredThemeBackgroundSettings(
  settings: ThemeBackgroundSettings,
  siteKey?: SiteKey,
): Promise<ThemeBackgroundSettings> {
  const resolvedSiteKey = resolveSiteKey(siteKey)
  const normalized = normalizeThemeBackgroundSettings(settings)

  await themeBackgroundSettingsStorageMap[resolvedSiteKey].setValue(normalized)

  if (resolvedSiteKey === 'gemini') {
    await legacyThemeBackgroundSettingsStorage.setValue(normalized)
  }

  return normalized
}
