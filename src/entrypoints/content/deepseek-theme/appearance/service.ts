import { storage } from '#imports'
import type { AppearanceMode, AppearanceState, GeminiTheme } from '@/entrypoints/content/gemini-theme/appearance/types'

const appearanceModeStorage = storage.defineItem<AppearanceMode>(
  'sync:appearanceMode:deepseek',
  { fallback: 'system' },
)

const BODY_LIGHT_THEME_CLASS = 'light-theme'
const BODY_DARK_THEME_CLASS = 'dark-theme'
const ROOT_EFFECTIVE_THEME_ATTR = 'data-ccv-effective-theme'
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'
let currentAppearanceMode: AppearanceMode = 'system'

function getSystemThemePreference(): GeminiTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light'
}

function applyBodyTheme(theme: GeminiTheme): void {
  if (typeof document === 'undefined' || !document.body) return

  const root = document.documentElement
  const isDark = theme === 'dark'

  document.body.classList.remove(BODY_LIGHT_THEME_CLASS, BODY_DARK_THEME_CLASS, 'light', 'dark')
  document.body.classList.add(isDark ? BODY_DARK_THEME_CLASS : BODY_LIGHT_THEME_CLASS)
  document.body.classList.add(isDark ? 'dark' : 'light')

  root.classList.remove('light', 'dark')
  root.classList.add(isDark ? 'dark' : 'light')
  root.setAttribute(ROOT_EFFECTIVE_THEME_ATTR, theme)
  root.setAttribute('data-theme', theme)
  root.setAttribute('data-color-mode', theme)
  root.style.colorScheme = theme
}

async function getStoredAppearanceMode(): Promise<AppearanceMode> {
  return await appearanceModeStorage.getValue()
}

function buildAppearanceState(mode: AppearanceMode, effectiveTheme: GeminiTheme): AppearanceState {
  return {
    mode,
    effectiveTheme,
  }
}

export async function initDeepSeekAppearance(): Promise<void> {
  currentAppearanceMode = await getStoredAppearanceMode()
  const effectiveTheme = currentAppearanceMode === 'system'
    ? getSystemThemePreference()
    : currentAppearanceMode
  applyBodyTheme(effectiveTheme)
}

export function getDeepSeekAppearanceState(): AppearanceState {
  const currentTheme = document.body?.classList.contains(BODY_DARK_THEME_CLASS)
    ? 'dark'
    : document.body?.classList.contains(BODY_LIGHT_THEME_CLASS)
      ? 'light'
      : getSystemThemePreference()

  return buildAppearanceState(currentAppearanceMode, currentTheme)
}

export function setDeepSeekAppearanceMode(mode: AppearanceMode): AppearanceState {
  currentAppearanceMode = mode
  const effectiveTheme = mode === 'system' ? getSystemThemePreference() : mode
  applyBodyTheme(effectiveTheme)
  void appearanceModeStorage.setValue(mode)
  return buildAppearanceState(mode, effectiveTheme)
}

type ThemeChangeHandler = (event: MediaQueryListEvent) => void

function addMediaQueryListener(
  mediaQueryList: MediaQueryList,
  handler: ThemeChangeHandler,
): void {
  if (typeof mediaQueryList.addEventListener === 'function') {
    mediaQueryList.addEventListener('change', handler)
    return
  }
  if (typeof mediaQueryList.addListener === 'function') {
    mediaQueryList.addListener(handler)
  }
}

function removeMediaQueryListener(
  mediaQueryList: MediaQueryList,
  handler: ThemeChangeHandler,
): void {
  if (typeof mediaQueryList.removeEventListener === 'function') {
    mediaQueryList.removeEventListener('change', handler)
    return
  }
  if (typeof mediaQueryList.removeListener === 'function') {
    mediaQueryList.removeListener(handler)
  }
}

export function subscribeDeepSeekSystemThemeChange(
  onChange: (theme: GeminiTheme) => void,
): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }

  const mediaQueryList = window.matchMedia(COLOR_SCHEME_QUERY)
  const handler: ThemeChangeHandler = (event) => {
    const nextTheme = event.matches ? 'dark' : 'light'
    if (currentAppearanceMode === 'system') {
      applyBodyTheme(nextTheme)
    }
    onChange(nextTheme)
  }

  addMediaQueryListener(mediaQueryList, handler)

  return () => {
    removeMediaQueryListener(mediaQueryList, handler)
  }
}
