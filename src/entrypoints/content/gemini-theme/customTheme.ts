export const CUSTOM_THEME_KEY = 'custom' as const

export interface CustomThemeSettings {
  color: string
  surfaceOpacity: number
}

export const DEFAULT_CUSTOM_THEME_SETTINGS: CustomThemeSettings = {
  color: '#4285f4',
  surfaceOpacity: 88,
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
    return DEFAULT_CUSTOM_THEME_SETTINGS.color
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

export function normalizeCustomThemeSettings(
  raw: Partial<CustomThemeSettings> | null | undefined,
): CustomThemeSettings {
  return {
    color: normalizeHexColor(raw?.color ?? DEFAULT_CUSTOM_THEME_SETTINGS.color),
    surfaceOpacity: normalizeSurfaceOpacity(
      raw?.surfaceOpacity ?? DEFAULT_CUSTOM_THEME_SETTINGS.surfaceOpacity,
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

export function buildCustomThemeCss(raw: Partial<CustomThemeSettings>): string {
  const settings = normalizeCustomThemeSettings(raw)
  const tones = buildToneScale(settings.color)
  const opacity = normalizeSurfaceOpacity(settings.surfaceOpacity)
  const lightPanelOpacity = clamp(opacity, 35, 100)
  const lightPanelStrongOpacity = clamp(opacity + 8, 35, 100)
  const lightSideNavOpacity = clamp(opacity - 4, 35, 100)
  const lightBubbleOpacity = clamp(opacity + 4, 35, 100)
  const darkPanelOpacity = clamp(opacity, 64, 100)
  const darkPanelStrongOpacity = clamp(opacity + 6, 70, 100)
  const darkSideNavOpacity = clamp(opacity + 10, 74, 100)
  const darkBubbleOpacity = clamp(opacity + 4, 64, 100)

  return `
:where(.theme-host) {
  --theme-25: ${tones[25]};
  --theme-50: ${tones[50]};
  --theme-100: ${tones[100]};
  --theme-200: ${tones[200]};
  --theme-300: ${tones[300]};
  --theme-400: ${tones[400]};
  --theme-500: ${tones[500]};
  --theme-600: ${tones[600]};
  --theme-700: ${tones[700]};
  --theme-800: ${tones[800]};
  --theme-900: ${tones[900]};
  --theme-950: ${tones[950]};
  --theme-1000: ${tones[1000]};
}

:where(.theme-host):where(.light-theme),
:root .light-theme {
  --gem-sys-color--primary: var(--theme-600);
  --bard-color-sidenav-background-desktop: color-mix(in srgb, var(--theme-50) ${lightSideNavOpacity}%, white);
  --gem-sys-color--surface-container: color-mix(in srgb, var(--theme-50) ${lightPanelOpacity}%, transparent);
  --gem-sys-color--surface-container-high: color-mix(in srgb, var(--theme-200) ${lightPanelStrongOpacity}%, transparent);
  --gem-sys-color--primary-container: color-mix(in srgb, var(--theme-200) ${lightPanelStrongOpacity}%, transparent);
  --gem-sys-color--on-primary-container: var(--theme-900);
  --gem-sys-color--on-surface: var(--theme-950);
  --bard-color-surface-dim-tmp: color-mix(in srgb, var(--theme-50) ${lightPanelStrongOpacity}%, #ffffff);
  --gem-sys-color--secondary-container: color-mix(in srgb, var(--theme-100) ${lightPanelOpacity}%, transparent);
  --gem-sys-color--on-secondary-container: var(--theme-800);
  --gem-sys-color--surface-container-low: color-mix(in srgb, var(--theme-50) ${clamp(lightPanelOpacity - 6, 35, 100)}%, transparent);
  --gem-sys-color--on-surface-variant: var(--theme-900);
  --gem-sys-color--surface-container-highest: color-mix(in srgb, var(--theme-100) ${lightPanelStrongOpacity}%, transparent);
  --gem-sys-color--outline-variant: color-mix(in srgb, var(--theme-300), transparent 34%);
}

:where(.theme-host):where(.light-theme) model-response response-container>div.response-container,
:where(.theme-host):where(.light-theme) dual-model-response,
:where(.theme-host):where(.light-theme) extensions-window>div.extensions-window-container,
:where(.theme-host):where(.light-theme) saved-info-page>div.page-container>div.page-content,
:where(.theme-host):where(.light-theme) input-container input-area-v2,
:where(.theme-host):where(.light-theme) input-area-v2>div>auto-suggest>div,
:where(.theme-host):where(.light-theme) div.query-content.edit-mode div.edit-container>mat-form-field>div.mat-mdc-text-field-wrapper,
:where(.theme-host):where(.light-theme) intent-card>button,
body.light-theme model-response response-container>div.response-container,
body.light-theme dual-model-response,
body.light-theme extensions-window>div.extensions-window-container,
body.light-theme saved-info-page>div.page-container>div.page-content,
body.light-theme input-container input-area-v2,
body.light-theme input-area-v2>div>auto-suggest>div,
body.light-theme div.query-content.edit-mode div.edit-container>mat-form-field>div.mat-mdc-text-field-wrapper,
body.light-theme intent-card>button {
  background: color-mix(in srgb, var(--theme-50) ${lightPanelStrongOpacity}%, transparent) !important;
  border-color: color-mix(in srgb, var(--theme-300), transparent 42%) !important;
}

:where(.theme-host):where(.light-theme) user-query user-query-content span.user-query-bubble-with-background,
body.light-theme user-query user-query-content span.user-query-bubble-with-background {
  background: color-mix(in srgb, var(--theme-100) ${lightBubbleOpacity}%, transparent) !important;
}

:where(.theme-host)::selection {
  background-color: color-mix(in srgb, var(--theme-200), transparent 10%);
}

:where(.theme-host):where(.light-theme) input-area-v2 button.send-button mat-icon.send-button-icon,
:where(.theme-host):where(.light-theme) input-area-v2 speech-dictation-mic-button button mat-icon {
  color: var(--theme-600);
}

:where(.theme-host):where(.dark-theme) {
  --gem-sys-color--primary: var(--theme-500);
  --bard-color-sidenav-background-desktop: color-mix(in srgb, var(--theme-950) ${darkSideNavOpacity}%, black) !important;
  --gem-sys-color--primary-container: color-mix(in srgb, var(--theme-800) ${darkPanelStrongOpacity}%, transparent);
  --gem-sys-color--surface-container: color-mix(in srgb, var(--theme-900) ${darkPanelOpacity}%, transparent);
  --gem-sys-color--surface-container-high: color-mix(in srgb, var(--theme-700) ${darkPanelStrongOpacity}%, transparent);
  --gem-sys-color--surface: color-mix(in srgb, var(--theme-950) ${darkSideNavOpacity}%, black 18%);
  --bard-color-surface-dim-tmp: color-mix(in srgb, var(--theme-950) ${darkSideNavOpacity}%, black 45%) !important;
  --gem-sys-color--surface-container-highest: color-mix(in srgb, var(--theme-800) ${darkPanelStrongOpacity}%, transparent);
  --gem-sys-color--surface-container-lowest: color-mix(in srgb, var(--theme-900) ${darkPanelOpacity}%, transparent);
  --gem-sys-color--on-surface-variant: rgba(255, 255, 255, 0.92);
  --gem-sys-color--surface-container-low: color-mix(in srgb, var(--theme-950) ${darkPanelOpacity}%, transparent);
  --gem-sys-color--surface-bright: color-mix(in srgb, var(--theme-700) ${darkPanelStrongOpacity}%, black 40%);
  --gem-sys-color--on-primary: #ffffff;
  --mat-slide-toggle-selected-track-color: var(--theme-500);
  --mat-slide-toggle-selected-handle-color: white;
  --gem-sys-color--on-primary-container: white;
  --gem-sys-color--outline-variant: color-mix(in srgb, var(--theme-800), transparent 20%);
  --gem-sys-color--secondary-container: color-mix(in srgb, var(--theme-700) ${darkPanelStrongOpacity}%, transparent);
  --gem-sys-color--on-secondary-container: var(--theme-100);
}

:where(.theme-host):where(.dark-theme) model-response response-container>div.response-container,
:where(.theme-host):where(.dark-theme) dual-model-response,
:where(.theme-host):where(.dark-theme) extensions-window>div.extensions-window-container,
:where(.theme-host):where(.dark-theme) saved-info-page>div.page-container>div.page-content,
:where(.theme-host):where(.dark-theme) input-container input-area-v2,
:where(.theme-host):where(.dark-theme) input-area-v2>div>auto-suggest>div,
:where(.theme-host):where(.dark-theme) div.query-content.edit-mode div.edit-container>mat-form-field>div.mat-mdc-text-field-wrapper,
:where(.theme-host):where(.dark-theme) intent-card>button,
body.dark-theme model-response response-container>div.response-container,
body.dark-theme dual-model-response,
body.dark-theme extensions-window>div.extensions-window-container,
body.dark-theme saved-info-page>div.page-container>div.page-content,
body.dark-theme input-container input-area-v2,
body.dark-theme input-area-v2>div>auto-suggest>div,
body.dark-theme div.query-content.edit-mode div.edit-container>mat-form-field>div.mat-mdc-text-field-wrapper,
body.dark-theme intent-card>button {
  background: color-mix(in srgb, var(--theme-900) ${darkPanelStrongOpacity}%, transparent) !important;
  border-color: color-mix(in srgb, var(--theme-700), transparent 26%) !important;
}

:where(.theme-host):where(.dark-theme) user-query user-query-content span.user-query-bubble-with-background,
body.dark-theme user-query user-query-content span.user-query-bubble-with-background {
  background: color-mix(in srgb, var(--theme-800) ${darkBubbleOpacity}%, transparent) !important;
}

:where(.theme-host):where(.dark-theme)::selection {
  background-color: var(--theme-800);
}

:where(.theme-host):where(.dark-theme) button.send-button.submit {
  background-color: var(--theme-700) !important;
}
`
}
