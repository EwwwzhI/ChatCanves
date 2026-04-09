import type { AppearanceMode, GeminiTheme } from './appearance/types'
import type { ThemeBackgroundPatch, ThemeBackgroundSettings } from './background/types'
import type { CustomThemeSettings } from './customTheme'
import type { CustomThemeApplyOptions } from '@/entrypoints/content/site-adapters/types'
import { getActiveSiteContext, getActiveSiteKey } from '@/entrypoints/content/site-adapters/context'
import { getThemeSiteAdapterByKey } from '@/entrypoints/content/site-adapters/registry'

function getActiveThemeSiteAdapter() {
  return getThemeSiteAdapterByKey(getActiveSiteKey())
}

export async function initTheme(): Promise<void> {
  await getActiveThemeSiteAdapter().initTheme()
}

export async function applyCustomTheme(
  settings: Partial<CustomThemeSettings>,
  options?: CustomThemeApplyOptions,
) {
  return await getActiveThemeSiteAdapter().applyCustomTheme(settings, options)
}

export async function clearTheme(): Promise<void> {
  await getActiveThemeSiteAdapter().clearTheme()
}

export function getAppearanceState() {
  return getActiveThemeSiteAdapter().getAppearanceState()
}

export function setAppearanceMode(mode: AppearanceMode) {
  return getActiveThemeSiteAdapter().setAppearanceMode(mode)
}

export function subscribeSystemThemeChange(
  onChange: (theme: GeminiTheme) => void,
) {
  return getActiveThemeSiteAdapter().subscribeSystemThemeChange(onChange)
}

export async function getThemeBackgroundSettings() {
  return await getActiveThemeSiteAdapter().getThemeBackgroundSettings()
}

export async function initThemeBackground(): Promise<void> {
  await getActiveThemeSiteAdapter().initThemeBackground()
}

export async function updateThemeBackgroundSettings(
  patch: ThemeBackgroundPatch,
) {
  return await getActiveThemeSiteAdapter().updateThemeBackgroundSettings(patch)
}

export async function uploadThemeBackground(file: File) {
  return await getActiveThemeSiteAdapter().uploadThemeBackground(file)
}

export async function removeThemeBackground() {
  return await getActiveThemeSiteAdapter().removeThemeBackground()
}

export async function resolveThemeBackgroundPreviewUrl(
  settings: ThemeBackgroundSettings,
) {
  return await getActiveThemeSiteAdapter().resolveThemeBackgroundPreviewUrl(settings)
}

export function getCurrentSiteContext() {
  return getActiveSiteContext()
}

export * from './background/types'
export * from './background/welcome-greeting'
export * from './appearance/types'
export * from './customTheme'
export { ThemeBackgroundError } from './background/createService'
export {
  DEFAULT_THEME_BACKGROUND_SETTINGS,
  normalizeThemeBackgroundSettings,
} from './background/types'
export { getThemeBackgroundSettingsStorage } from './background/storage'
export {
  getThemeCustomSettingsStorage,
  getThemeKey,
  getThemeKeyStorage,
  getCustomThemeSettings,
} from './themeStorage'
export { themePresets, getPresetByKey } from './runtime'
export type { ThemePreset } from './preset/presets'
export type { CustomThemeApplyOptions } from '@/entrypoints/content/site-adapters/types'
