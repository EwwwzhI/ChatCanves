import { storage } from '#imports'
import type { SiteKey } from '@/common/site'
import {
  DEFAULT_CUSTOM_THEME_SETTINGS,
  normalizeCustomThemeSettings,
  type CustomThemeSettings,
} from './customTheme'
import { getActiveSiteKey } from '@/entrypoints/content/site-adapters/context'

const legacyThemeKeyStorage = storage.defineItem<string>('sync:themeKey', {
  fallback: '',
})

const legacyThemeCustomSettingsStorage = storage.defineItem<CustomThemeSettings>(
  'sync:themeCustomSettings',
  { fallback: DEFAULT_CUSTOM_THEME_SETTINGS },
)

const themeKeyStorageMap = {
  gemini: storage.defineItem<string | null>('sync:themeKey:gemini', {
    fallback: null,
  }),
  deepseek: storage.defineItem<string | null>('sync:themeKey:deepseek', {
    fallback: null,
  }),
  chatgpt: storage.defineItem<string | null>('sync:themeKey:chatgpt', {
    fallback: null,
  }),
} as const

const themeCustomSettingsStorageMap = {
  gemini: storage.defineItem<CustomThemeSettings | null>(
    'sync:themeCustomSettings:gemini',
    { fallback: null },
  ),
  deepseek: storage.defineItem<CustomThemeSettings | null>(
    'sync:themeCustomSettings:deepseek',
    { fallback: null },
  ),
  chatgpt: storage.defineItem<CustomThemeSettings | null>(
    'sync:themeCustomSettings:chatgpt',
    { fallback: null },
  ),
} as const

function resolveSiteKey(siteKey?: SiteKey): SiteKey {
  return siteKey ?? getActiveSiteKey()
}

export function getThemeKeyStorage(siteKey?: SiteKey) {
  return themeKeyStorageMap[resolveSiteKey(siteKey)]
}

export function getThemeCustomSettingsStorage(siteKey?: SiteKey) {
  return themeCustomSettingsStorageMap[resolveSiteKey(siteKey)]
}

async function migrateGeminiThemeKeyFromLegacy(): Promise<string> {
  const legacyValue = await legacyThemeKeyStorage.getValue()
  await themeKeyStorageMap.gemini.setValue(legacyValue)
  return legacyValue
}

async function migrateGeminiCustomThemeFromLegacy(): Promise<CustomThemeSettings> {
  const legacyValue = normalizeCustomThemeSettings(
    await legacyThemeCustomSettingsStorage.getValue(),
  )
  await themeCustomSettingsStorageMap.gemini.setValue(legacyValue)
  return legacyValue
}

export async function getThemeKey(siteKey?: SiteKey): Promise<string> {
  const resolvedSiteKey = resolveSiteKey(siteKey)
  const currentValue = await themeKeyStorageMap[resolvedSiteKey].getValue()

  if (currentValue !== null) {
    return currentValue
  }

  if (resolvedSiteKey === 'gemini') {
    return await migrateGeminiThemeKeyFromLegacy()
  }

  return ''
}

export async function setThemeKey(key: string, siteKey?: SiteKey): Promise<void> {
  const resolvedSiteKey = resolveSiteKey(siteKey)
  await themeKeyStorageMap[resolvedSiteKey].setValue(key)

  if (resolvedSiteKey === 'gemini') {
    await legacyThemeKeyStorage.setValue(key)
  }
}

export async function getCustomThemeSettings(siteKey?: SiteKey): Promise<CustomThemeSettings> {
  const resolvedSiteKey = resolveSiteKey(siteKey)
  const currentValue = await themeCustomSettingsStorageMap[resolvedSiteKey].getValue()

  if (currentValue) {
    const normalized = normalizeCustomThemeSettings(currentValue)
    return normalized
  }

  if (resolvedSiteKey === 'gemini') {
    return await migrateGeminiCustomThemeFromLegacy()
  }

  return DEFAULT_CUSTOM_THEME_SETTINGS
}

export async function setCustomThemeSettings(
  settings: Partial<CustomThemeSettings>,
  siteKey?: SiteKey,
): Promise<CustomThemeSettings> {
  const resolvedSiteKey = resolveSiteKey(siteKey)
  const normalized = normalizeCustomThemeSettings(settings)
  await themeCustomSettingsStorageMap[resolvedSiteKey].setValue(normalized)

  if (resolvedSiteKey === 'gemini') {
    await legacyThemeCustomSettingsStorage.setValue(normalized)
  }

  return normalized
}
