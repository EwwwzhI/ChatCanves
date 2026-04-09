import { storage } from '#imports'
import type { AppearanceMode, AppearanceState, GeminiTheme } from '@/entrypoints/content/gemini-theme/appearance/types'
import { CHATGPT_THEME_CARRIER_CANDIDATE_SELECTORS } from '../selectors'

const appearanceModeStorage = storage.defineItem<AppearanceMode>(
  'sync:appearanceMode:chatgpt',
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

function detectExistingTheme(): GeminiTheme | null {
  const root = document.documentElement
  const body = document.body
  const carriers = [
    ...CHATGPT_THEME_CARRIER_CANDIDATE_SELECTORS
      .map((selector) => document.querySelector<HTMLElement>(selector))
      .filter((element): element is HTMLElement => element instanceof HTMLElement),
    root,
    ...(body ? [body] : []),
  ]

  for (const carrier of carriers) {
    const candidates = [
      carrier.getAttribute('data-theme'),
      carrier.getAttribute('data-color-mode'),
    ]
    if (candidates.includes('dark')) return 'dark'
    if (candidates.includes('light')) return 'light'
    if (carrier.classList.contains('dark')) return 'dark'
    if (carrier.classList.contains('light')) return 'light'
  }

  return null
}

function applyBodyTheme(theme: GeminiTheme): void {
  if (typeof document === 'undefined' || !document.body) return

  const root = document.documentElement
  const body = document.body
  const isDark = theme === 'dark'
  const currentEffectiveTheme = root.getAttribute(ROOT_EFFECTIVE_THEME_ATTR)

  if (
    currentEffectiveTheme === theme
    && root.getAttribute('data-theme') === theme
    && body.getAttribute('data-theme') === theme
    && body.classList.contains(isDark ? BODY_DARK_THEME_CLASS : BODY_LIGHT_THEME_CLASS)
  ) {
    return
  }

  body.classList.remove(BODY_LIGHT_THEME_CLASS, BODY_DARK_THEME_CLASS, 'light', 'dark')
  body.classList.add(isDark ? BODY_DARK_THEME_CLASS : BODY_LIGHT_THEME_CLASS)
  body.classList.add(isDark ? 'dark' : 'light')

  root.classList.remove('light', 'dark')
  root.classList.add(isDark ? 'dark' : 'light')

  root.setAttribute(ROOT_EFFECTIVE_THEME_ATTR, theme)
  root.setAttribute('data-theme', theme)
  root.setAttribute('data-color-mode', theme)
  body.setAttribute('data-theme', theme)
  body.setAttribute('data-color-mode', theme)
  root.style.colorScheme = theme
  body.style.colorScheme = theme
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

export function syncChatGptThemeCarrier(): void {
  const effectiveTheme = currentAppearanceMode === 'system'
    ? detectExistingTheme() ?? getSystemThemePreference()
    : currentAppearanceMode

  applyBodyTheme(effectiveTheme)
}

export async function initChatGptAppearance(): Promise<void> {
  currentAppearanceMode = await getStoredAppearanceMode()
  syncChatGptThemeCarrier()
}

export function getChatGptAppearanceState(): AppearanceState {
  const currentTheme = document.documentElement.getAttribute(ROOT_EFFECTIVE_THEME_ATTR) === 'dark'
    ? 'dark'
    : document.documentElement.getAttribute(ROOT_EFFECTIVE_THEME_ATTR) === 'light'
      ? 'light'
      : detectExistingTheme() ?? getSystemThemePreference()

  return buildAppearanceState(currentAppearanceMode, currentTheme)
}

export function setChatGptAppearanceMode(mode: AppearanceMode): AppearanceState {
  currentAppearanceMode = mode
  const effectiveTheme = mode === 'system'
    ? getSystemThemePreference()
    : mode
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

export function subscribeChatGptSystemThemeChange(
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
