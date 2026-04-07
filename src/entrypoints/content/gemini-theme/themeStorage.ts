/**
 * Persistent storage for the user's selected theme key.
 * Uses WXT storage API with sync storage for cross-device persistence.
 */

import { storage } from '#imports'
import {
  DEFAULT_CUSTOM_THEME_SETTINGS,
  normalizeCustomThemeSettings,
  type CustomThemeSettings,
} from './customTheme'

/** The persisted theme key. Empty string = default (blue, no override). */
export const themeKeyStorage = storage.defineItem<string>(
  'sync:themeKey',
  { fallback: '' }
)

export const themeCustomSettingsStorage = storage.defineItem<CustomThemeSettings>(
  'sync:themeCustomSettings',
  { fallback: DEFAULT_CUSTOM_THEME_SETTINGS },
)

export const getThemeKey = () => themeKeyStorage.getValue()
export const setThemeKey = (key: string) => themeKeyStorage.setValue(key)

export async function getCustomThemeSettings(): Promise<CustomThemeSettings> {
  const raw = await themeCustomSettingsStorage.getValue()
  return normalizeCustomThemeSettings(raw)
}

export async function setCustomThemeSettings(
  settings: Partial<CustomThemeSettings>,
): Promise<CustomThemeSettings> {
  const normalized = normalizeCustomThemeSettings(settings)
  await themeCustomSettingsStorage.setValue(normalized)
  return normalized
}
