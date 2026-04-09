export interface CustomThemeSettings {
  accentColor: string
  surfaceColor: string
  textColor: string
  surfaceOpacity: number
}

type LegacyCustomThemeSettings = Partial<CustomThemeSettings> & {
  color?: string
}

export const CUSTOM_THEME_KEY = 'custom' as const

const DEFAULT_LIGHT_TEXT_COLOR = '#0f172a'
const DEFAULT_DARK_TEXT_COLOR = '#f8fafc'

export const DEFAULT_CUSTOM_THEME_SETTINGS: CustomThemeSettings = {
  accentColor: '#4285f4',
  surfaceColor: '#4285f4',
  textColor: DEFAULT_LIGHT_TEXT_COLOR,
  surfaceOpacity: 88,
}

export interface GeminiChatSurfaceOpacityScale {
  lightSurface: number
  lightSurfaceStrong: number
  darkSurface: number
  darkSurfaceStrong: number
}

export interface GeminiChatSurfaceTokens {
  lightSurface: string
  lightSurfaceStrong: string
  darkSurface: string
  darkSurfaceStrong: string
}

interface RgbColor {
  r: number
  g: number
  b: number
}

const WHITE: RgbColor = { r: 255, g: 255, b: 255 }
const BLACK: RgbColor = { r: 0, g: 0, b: 0 }
const HEX_COLOR_PATTERN = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i
const MIN_SURFACE_OPACITY = 35
const MAX_SURFACE_OPACITY = 100

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function interpolate(value: number, min: number, max: number): number {
  return min + (max - min) * value
}

function expandHexColor(value: string): string {
  const normalized = value.trim().toLowerCase()
  if (!normalized.startsWith('#')) {
    return `#${normalized}`
  }
  return normalized
}

export function normalizeHexColor(value: string): string {
  const prefixed = expandHexColor(value)
  if (!HEX_COLOR_PATTERN.test(prefixed)) {
    return DEFAULT_CUSTOM_THEME_SETTINGS.accentColor
  }

  if (prefixed.length === 4) {
    const [, r, g, b] = prefixed
    return `#${r}${r}${g}${g}${b}${b}`
  }

  return prefixed
}

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(expandHexColor(value))
}

export function normalizeSurfaceOpacity(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_CUSTOM_THEME_SETTINGS.surfaceOpacity
  }

  return clamp(Math.round(value), MIN_SURFACE_OPACITY, MAX_SURFACE_OPACITY)
}

export function getDefaultChatTextColor(): string {
  if (typeof document === 'undefined') {
    return DEFAULT_LIGHT_TEXT_COLOR
  }

  const root = document.body ?? document.documentElement
  if (
    root.classList.contains('dark-theme')
    || document.documentElement.classList.contains('dark-theme')
  ) {
    return DEFAULT_DARK_TEXT_COLOR
  }

  return DEFAULT_LIGHT_TEXT_COLOR
}

export function normalizeCustomThemeSettings(
  raw: LegacyCustomThemeSettings | null | undefined,
): CustomThemeSettings {
  const legacyColor = raw?.color
  const accentColor = normalizeHexColor(
    raw?.accentColor ?? legacyColor ?? DEFAULT_CUSTOM_THEME_SETTINGS.accentColor,
  )
  const surfaceColor = normalizeHexColor(
    raw?.surfaceColor ?? legacyColor ?? accentColor,
  )

  return {
    accentColor,
    surfaceColor,
    textColor: normalizeHexColor(raw?.textColor ?? getDefaultChatTextColor()),
    surfaceOpacity: normalizeSurfaceOpacity(Number(raw?.surfaceOpacity)),
  }
}

export function getGeminiChatSurfaceOpacityScale(
  surfaceOpacity: number,
): GeminiChatSurfaceOpacityScale {
  const normalizedOpacity = normalizeSurfaceOpacity(surfaceOpacity)
  const opacityProgress = (
    (normalizedOpacity - MIN_SURFACE_OPACITY)
    / (MAX_SURFACE_OPACITY - MIN_SURFACE_OPACITY)
  )

  return {
    lightSurface: interpolate(opacityProgress, 0.16, 0.78),
    lightSurfaceStrong: interpolate(opacityProgress, 0.22, 0.9),
    darkSurface: interpolate(opacityProgress, 0.28, 0.92),
    darkSurfaceStrong: interpolate(opacityProgress, 0.34, 0.96),
  }
}

export function buildGeminiChatSurfaceTokens(
  surfaceColor: string,
  surfaceOpacity: number,
): GeminiChatSurfaceTokens {
  const normalizedSurfaceColor = normalizeHexColor(surfaceColor)
  const alphaScale = getGeminiChatSurfaceOpacityScale(surfaceOpacity)

  return {
    lightSurface: hexToRgbaString(normalizedSurfaceColor, alphaScale.lightSurface),
    lightSurfaceStrong: hexToRgbaString(
      normalizedSurfaceColor,
      alphaScale.lightSurfaceStrong,
    ),
    darkSurface: hexToRgbaString(normalizedSurfaceColor, alphaScale.darkSurface),
    darkSurfaceStrong: hexToRgbaString(
      normalizedSurfaceColor,
      alphaScale.darkSurfaceStrong,
    ),
  }
}

export function hexToRgb(value: string): RgbColor {
  const normalized = normalizeHexColor(value)
  const hex = normalized.slice(1)
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (channel: number) =>
    clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mixRgb(base: RgbColor, target: RgbColor, amount: number): RgbColor {
  const ratio = clamp(amount, 0, 1)
  return {
    r: base.r + (target.r - base.r) * ratio,
    g: base.g + (target.g - base.g) * ratio,
    b: base.b + (target.b - base.b) * ratio,
  }
}

function relativeLuminance({ r, g, b }: RgbColor): number {
  const transform = (channel: number) => {
    const value = channel / 255
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4
  }

  return (
    0.2126 * transform(r)
    + 0.7152 * transform(g)
    + 0.0722 * transform(b)
  )
}

export function getReadableTextColor(color: string): string {
  const luminance = relativeLuminance(hexToRgb(color))
  return luminance > 0.44 ? '#0f172a' : '#ffffff'
}

export function hexToRgbaString(color: string, alpha: number): string {
  const { r, g, b } = hexToRgb(color)
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`
}

function buildToneScale(color: string): Record<number, string> {
  const base = hexToRgb(color)
  return {
    25: rgbToHex(mixRgb(base, WHITE, 0.94)),
    50: rgbToHex(mixRgb(base, WHITE, 0.88)),
    100: rgbToHex(mixRgb(base, WHITE, 0.74)),
    200: rgbToHex(mixRgb(base, WHITE, 0.58)),
    300: rgbToHex(mixRgb(base, WHITE, 0.42)),
    400: rgbToHex(mixRgb(base, WHITE, 0.24)),
    500: rgbToHex(mixRgb(base, WHITE, 0.08)),
    600: rgbToHex(base),
    700: rgbToHex(mixRgb(base, BLACK, 0.18)),
    800: rgbToHex(mixRgb(base, BLACK, 0.34)),
    900: rgbToHex(mixRgb(base, BLACK, 0.5)),
    950: rgbToHex(mixRgb(base, BLACK, 0.64)),
    1000: rgbToHex(mixRgb(base, BLACK, 0.76)),
  }
}

function buildChatSurfaceSelectorList(): string {
  return [
    'model-response response-container>div.response-container',
    'dual-model-response',
    'input-container input-area-v2',
    'input-area-v2>div>auto-suggest>div',
    'div.query-content.edit-mode div.edit-container>mat-form-field>div.mat-mdc-text-field-wrapper',
    'intent-card>button',
  ].join(',\n')
}

function buildChatTextSelectorList(): string {
  return [
    'model-response response-container>div.response-container',
    'model-response response-container>div.response-container :is(p, span, li, strong, em, code, pre, h1, h2, h3, h4, h5, h6, a)',
    'dual-model-response',
    'dual-model-response :is(p, span, li, strong, em, code, pre, h1, h2, h3, h4, h5, h6, a)',
    'extensions-window>div.extensions-window-container',
    'saved-info-page>div.page-container>div.page-content',
    'input-container input-area-v2',
    'input-container input-area-v2 textarea',
    'input-area-v2>div>auto-suggest>div',
    'div.query-content.edit-mode div.edit-container>mat-form-field>div.mat-mdc-text-field-wrapper',
    'user-query user-query-content span.user-query-bubble-with-background',
  ].join(',\n')
}

export function buildCustomThemeCss(raw: Partial<CustomThemeSettings>): string {
  const settings = normalizeCustomThemeSettings(raw)
  const accentTones = buildToneScale(settings.accentColor)
  const surfaceTones = buildToneScale(settings.surfaceColor)
  const accentContrast = getReadableTextColor(settings.accentColor)
  const chatText = normalizeHexColor(settings.textColor)
  const chatTextMuted = hexToRgbaString(chatText, 0.76)
  const selectionColor = hexToRgbaString(settings.accentColor, 0.26)
  const chatSurfaceTokens = buildGeminiChatSurfaceTokens(
    settings.surfaceColor,
    settings.surfaceOpacity,
  )
  const defaultSurfaceOpacity = DEFAULT_CUSTOM_THEME_SETTINGS.surfaceOpacity
  const lightPanelOpacity = clamp(defaultSurfaceOpacity + 6, 42, 100)
  const lightPanelStrongOpacity = clamp(defaultSurfaceOpacity + 14, 48, 100)
  const lightSideNavOpacity = clamp(defaultSurfaceOpacity - 2, 35, 96)
  const darkPanelOpacity = clamp(defaultSurfaceOpacity + 6, 72, 100)
  const darkPanelStrongOpacity = clamp(defaultSurfaceOpacity + 12, 76, 100)
  const darkSideNavOpacity = clamp(defaultSurfaceOpacity + 10, 76, 100)
  const surfaceSelectors = buildChatSurfaceSelectorList()
  const chatTextSelectors = buildChatTextSelectorList()

  return `
:where(.theme-host) {
  --accent-25: ${accentTones[25]};
  --accent-50: ${accentTones[50]};
  --accent-100: ${accentTones[100]};
  --accent-200: ${accentTones[200]};
  --accent-300: ${accentTones[300]};
  --accent-400: ${accentTones[400]};
  --accent-500: ${accentTones[500]};
  --accent-600: ${accentTones[600]};
  --accent-700: ${accentTones[700]};
  --accent-800: ${accentTones[800]};
  --accent-900: ${accentTones[900]};
  --accent-950: ${accentTones[950]};
  --accent-1000: ${accentTones[1000]};
  --surface-25: ${surfaceTones[25]};
  --surface-50: ${surfaceTones[50]};
  --surface-100: ${surfaceTones[100]};
  --surface-200: ${surfaceTones[200]};
  --surface-300: ${surfaceTones[300]};
  --surface-400: ${surfaceTones[400]};
  --surface-500: ${surfaceTones[500]};
  --surface-600: ${surfaceTones[600]};
  --surface-700: ${surfaceTones[700]};
  --surface-800: ${surfaceTones[800]};
  --surface-900: ${surfaceTones[900]};
  --surface-950: ${surfaceTones[950]};
  --surface-1000: ${surfaceTones[1000]};
  --ccv-chat-text: ${chatText};
  --ccv-chat-text-muted: ${chatTextMuted};
  --ccv-chat-surface-border: ${hexToRgbaString(settings.surfaceColor, 0.28)};
  --ccv-gemini-chat-surface-light: ${chatSurfaceTokens.lightSurface};
  --ccv-gemini-chat-surface-light-strong: ${chatSurfaceTokens.lightSurfaceStrong};
  --ccv-gemini-chat-surface-dark: ${chatSurfaceTokens.darkSurface};
  --ccv-gemini-chat-surface-dark-strong: ${chatSurfaceTokens.darkSurfaceStrong};
  --ccv-gemini-chat-border-light: ${hexToRgbaString(settings.surfaceColor, 0.22)};
  --ccv-gemini-chat-border-dark: ${hexToRgbaString(settings.surfaceColor, 0.3)};
}

:where(.theme-host):where(.light-theme),
:root .light-theme {
  --gem-sys-color--primary: var(--accent-600);
  --bard-color-sidenav-background-desktop: color-mix(in srgb, var(--accent-50) ${lightSideNavOpacity}%, white);
  --gem-sys-color--surface-container: color-mix(in srgb, var(--surface-50) ${lightPanelOpacity}%, transparent);
  --gem-sys-color--surface-container-high: color-mix(in srgb, var(--surface-100) ${lightPanelStrongOpacity}%, transparent);
  --gem-sys-color--primary-container: color-mix(in srgb, var(--accent-100) ${lightPanelStrongOpacity}%, transparent);
  --gem-sys-color--on-primary-container: ${accentContrast};
  --gem-sys-color--on-surface: var(--accent-950);
  --bard-color-surface-dim-tmp: color-mix(in srgb, var(--surface-50) ${lightPanelStrongOpacity}%, #ffffff);
  --gem-sys-color--secondary-container: color-mix(in srgb, var(--surface-100) ${lightPanelOpacity}%, transparent);
  --gem-sys-color--on-secondary-container: var(--accent-900);
  --gem-sys-color--surface-container-low: color-mix(in srgb, var(--surface-25) ${clamp(lightPanelOpacity - 6, 35, 100)}%, transparent);
  --gem-sys-color--on-surface-variant: var(--accent-900);
  --gem-sys-color--surface-container-highest: color-mix(in srgb, var(--surface-100) ${lightPanelStrongOpacity}%, transparent);
  --gem-sys-color--outline-variant: color-mix(in srgb, var(--surface-300), transparent 34%);
  --gem-sys-color--surface-bright: color-mix(in srgb, var(--surface-50) ${lightPanelStrongOpacity}%, #ffffff);
}

:where(.theme-host):where(.light-theme) ${surfaceSelectors},
body.light-theme ${surfaceSelectors} {
  background: var(--ccv-gemini-chat-surface-light-strong) !important;
  border-color: var(--ccv-gemini-chat-border-light) !important;
}

:where(.theme-host):where(.light-theme) user-query user-query-content span.user-query-bubble-with-background,
body.light-theme user-query user-query-content span.user-query-bubble-with-background {
  background: var(--ccv-gemini-chat-surface-light) !important;
  color: var(--ccv-chat-text) !important;
}

:where(.theme-host):where(.light-theme) ${chatTextSelectors},
body.light-theme ${chatTextSelectors} {
  color: var(--ccv-chat-text) !important;
}

:where(.theme-host):where(.light-theme) input-container input-area-v2 textarea::placeholder,
body.light-theme input-container input-area-v2 textarea::placeholder {
  color: var(--ccv-chat-text-muted) !important;
}

:where(.theme-host)::selection {
  background-color: ${selectionColor};
}

:where(.theme-host):where(.light-theme) input-area-v2 button.send-button mat-icon.send-button-icon,
:where(.theme-host):where(.light-theme) input-area-v2 speech-dictation-mic-button button mat-icon {
  color: var(--accent-600);
}

:where(.theme-host):where(.dark-theme) {
  --gem-sys-color--primary: var(--accent-500);
  --bard-color-sidenav-background-desktop: color-mix(in srgb, var(--accent-950) ${darkSideNavOpacity}%, black) !important;
  --gem-sys-color--primary-container: color-mix(in srgb, var(--accent-800) ${darkPanelStrongOpacity}%, transparent);
  --gem-sys-color--surface-container: color-mix(in srgb, var(--surface-900) ${darkPanelOpacity}%, transparent);
  --gem-sys-color--surface-container-high: color-mix(in srgb, var(--surface-800) ${darkPanelStrongOpacity}%, transparent);
  --gem-sys-color--surface: color-mix(in srgb, var(--surface-950) ${darkSideNavOpacity}%, black 18%);
  --bard-color-surface-dim-tmp: color-mix(in srgb, var(--surface-950) ${darkSideNavOpacity}%, black 45%) !important;
  --gem-sys-color--surface-container-highest: color-mix(in srgb, var(--surface-800) ${darkPanelStrongOpacity}%, transparent);
  --gem-sys-color--surface-container-lowest: color-mix(in srgb, var(--surface-900) ${darkPanelOpacity}%, transparent);
  --gem-sys-color--on-surface-variant: rgba(255, 255, 255, 0.92);
  --gem-sys-color--surface-container-low: color-mix(in srgb, var(--surface-950) ${darkPanelOpacity}%, transparent);
  --gem-sys-color--surface-bright: color-mix(in srgb, var(--surface-700) ${darkPanelStrongOpacity}%, black 40%);
  --gem-sys-color--on-primary: ${accentContrast};
  --mat-slide-toggle-selected-track-color: var(--accent-500);
  --mat-slide-toggle-selected-handle-color: white;
  --gem-sys-color--on-primary-container: ${accentContrast};
  --gem-sys-color--outline-variant: color-mix(in srgb, var(--surface-800), transparent 20%);
  --gem-sys-color--secondary-container: color-mix(in srgb, var(--surface-700) ${darkPanelStrongOpacity}%, transparent);
  --gem-sys-color--on-secondary-container: var(--accent-100);
}

:where(.theme-host):where(.dark-theme) ${surfaceSelectors},
body.dark-theme ${surfaceSelectors} {
  background: var(--ccv-gemini-chat-surface-dark-strong) !important;
  border-color: var(--ccv-gemini-chat-border-dark) !important;
}

:where(.theme-host):where(.dark-theme) user-query user-query-content span.user-query-bubble-with-background,
body.dark-theme user-query user-query-content span.user-query-bubble-with-background {
  background: var(--ccv-gemini-chat-surface-dark) !important;
  color: var(--ccv-chat-text) !important;
}

:where(.theme-host):where(.dark-theme) ${chatTextSelectors},
body.dark-theme ${chatTextSelectors} {
  color: var(--ccv-chat-text) !important;
}

:where(.theme-host):where(.dark-theme) input-container input-area-v2 textarea::placeholder,
body.dark-theme input-container input-area-v2 textarea::placeholder {
  color: var(--ccv-chat-text-muted) !important;
}

:where(.theme-host):where(.dark-theme)::selection {
  background-color: var(--accent-800);
}

:where(.theme-host):where(.dark-theme) button.send-button.submit {
  background-color: var(--accent-700) !important;
}
`
}
