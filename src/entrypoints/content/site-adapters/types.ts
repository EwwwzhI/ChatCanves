import type { SiteCapabilities, SiteContext, SiteKey } from '@/common/site'
import type { AppearanceMode, AppearanceState, GeminiTheme } from '@/entrypoints/content/gemini-theme/appearance/types'
import type { CustomThemeSettings } from '@/entrypoints/content/gemini-theme/customTheme'
import type {
  ThemeBackgroundPatch,
  ThemeBackgroundResolvedState,
  ThemeBackgroundSettings,
} from '@/entrypoints/content/gemini-theme/background/types'

export interface CustomThemeApplyOptions {
  persist?: boolean
}

export interface ThemeSiteAdapter {
  siteKey: SiteKey
  displayName: string
  capabilities: SiteCapabilities
  mainWorldScript?: string
  matches: (hostname: string) => boolean
  getContext: (hostname: string) => SiteContext
  initTheme: () => Promise<void>
  applyCustomTheme: (
    settings: Partial<CustomThemeSettings>,
    options?: CustomThemeApplyOptions,
  ) => Promise<CustomThemeSettings>
  clearTheme: () => Promise<void>
  getAppearanceState: () => AppearanceState
  setAppearanceMode: (mode: AppearanceMode) => AppearanceState
  subscribeSystemThemeChange: (onChange: (theme: GeminiTheme) => void) => () => void
  getThemeBackgroundSettings: () => Promise<ThemeBackgroundSettings>
  initThemeBackground: () => Promise<void>
  updateThemeBackgroundSettings: (
    patch: ThemeBackgroundPatch,
  ) => Promise<ThemeBackgroundResolvedState>
  uploadThemeBackground: (file: File) => Promise<ThemeBackgroundResolvedState>
  removeThemeBackground: () => Promise<ThemeBackgroundResolvedState>
  resolveThemeBackgroundPreviewUrl: (
    settings: ThemeBackgroundSettings,
  ) => Promise<string | null>
}
