import {
  getReadableTextColor,
  hexToRgbaString,
  normalizeCustomThemeSettings,
  normalizeSurfaceOpacity,
  type CustomThemeSettings,
} from '@/entrypoints/content/gemini-theme/customTheme'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

interface DeepSeekSurfaceTokens {
  lightSurface: string
  lightSurfaceStrong: string
  lightBorder: string
  darkSurface: string
  darkSurfaceStrong: string
  darkBorder: string
  progress: number
}

export function getDeepSeekChatSurfaceTokens(
  surfaceColor: string,
  surfaceOpacity: number,
): DeepSeekSurfaceTokens {
  const normalizedOpacity = normalizeSurfaceOpacity(surfaceOpacity)
  const progress = (normalizedOpacity - 35) / 65

  return {
    lightSurface: hexToRgbaString(
      surfaceColor,
      clamp(0.24 + (progress * 0.5), 0.24, 0.74),
    ),
    lightSurfaceStrong: hexToRgbaString(
      surfaceColor,
      clamp(0.3 + (progress * 0.54), 0.3, 0.84),
    ),
    lightBorder: hexToRgbaString(
      surfaceColor,
      clamp(0.18 + (progress * 0.12), 0.18, 0.3),
    ),
    darkSurface: hexToRgbaString(
      surfaceColor,
      clamp(0.34 + (progress * 0.46), 0.34, 0.8),
    ),
    darkSurfaceStrong: hexToRgbaString(
      surfaceColor,
      clamp(0.4 + (progress * 0.5), 0.4, 0.9),
    ),
    darkBorder: hexToRgbaString(
      surfaceColor,
      clamp(0.22 + (progress * 0.14), 0.22, 0.36),
    ),
    progress,
  }
}

export function buildDeepSeekCustomThemeCss(
  raw: Partial<CustomThemeSettings>,
): string {
  const settings = normalizeCustomThemeSettings(raw)
  const accentContrast = getReadableTextColor(settings.accentColor)
  const textMuted = hexToRgbaString(settings.textColor, 0.72)
  const {
    lightSurface,
    lightSurfaceStrong,
    lightBorder,
    darkSurface,
    darkSurfaceStrong,
    darkBorder,
    progress,
  } = getDeepSeekChatSurfaceTokens(settings.surfaceColor, settings.surfaceOpacity)
  const accentSoft = hexToRgbaString(settings.accentColor, 0.18)
  const accentMuted = hexToRgbaString(settings.accentColor, 0.28)
  const accentMutedText = hexToRgbaString(settings.accentColor, 0.82)
  const accentShadow = hexToRgbaString(
    settings.accentColor,
    clamp(0.1 + (progress * 0.08), 0.1, 0.18),
  )

  return `
:root[data-ccv-site="deepseek"] {
  --ccv-accent: ${settings.accentColor};
  --ccv-accent-contrast: ${accentContrast};
  --ccv-accent-soft: ${accentSoft};
  --ccv-chat-text: ${settings.textColor};
  --ccv-chat-text-muted: ${textMuted};
  --ccv-deepseek-assistant-surface: ${lightSurface};
  --ccv-deepseek-assistant-surface-strong: ${lightSurfaceStrong};
  --ccv-deepseek-assistant-border: ${lightBorder};
  --ccv-deepseek-user-bubble: ${lightSurfaceStrong};
  --ccv-deepseek-user-bubble-border: ${lightBorder};
  --ccv-deepseek-sidebar-panel-rgb: 255 255 255;
  --ccv-deepseek-sidebar-panel-base-alpha: 0.08;
  --ccv-deepseek-sidebar-panel-boost-alpha: 0.72;
  --ccv-deepseek-sidebar-card-rgb: 255 255 255;
  --ccv-deepseek-sidebar-card-base-alpha: 0.05;
  --ccv-deepseek-sidebar-card-boost-alpha: 0.78;
  --ccv-deepseek-sidebar-card-border-rgb: 255 255 255;
  --ccv-deepseek-sidebar-card-border-base-alpha: 0.08;
  --ccv-deepseek-sidebar-card-border-boost-alpha: 0.3;
  --ccv-deepseek-sidebar-text-rgb: 15 23 42;
  --ccv-deepseek-sidebar-text-base-alpha: 0.62;
  --ccv-deepseek-sidebar-text-boost-alpha: 0.34;
  --ccv-deepseek-sidebar-text-muted-rgb: 71 85 105;
  --ccv-deepseek-sidebar-text-muted-base-alpha: 0.44;
  --ccv-deepseek-sidebar-text-muted-boost-alpha: 0.28;
}

:root[data-ccv-site="deepseek"] body.light-theme {
  --ccv-site-surface: ${lightSurface};
  --ccv-site-surface-strong: ${lightSurfaceStrong};
  --ccv-site-border: ${lightBorder};
}

:root[data-ccv-site="deepseek"] body.dark-theme {
  --ccv-site-surface: ${darkSurface};
  --ccv-site-surface-strong: ${darkSurfaceStrong};
  --ccv-site-border: ${darkBorder};
  --ccv-deepseek-assistant-surface: ${darkSurface};
  --ccv-deepseek-assistant-surface-strong: ${darkSurfaceStrong};
  --ccv-deepseek-assistant-border: ${darkBorder};
  --ccv-deepseek-user-bubble: ${darkSurfaceStrong};
  --ccv-deepseek-user-bubble-border: ${darkBorder};
  --ccv-deepseek-sidebar-panel-rgb: 2 6 23;
  --ccv-deepseek-sidebar-panel-base-alpha: 0.14;
  --ccv-deepseek-sidebar-panel-boost-alpha: 0.68;
  --ccv-deepseek-sidebar-card-rgb: 15 23 42;
  --ccv-deepseek-sidebar-card-base-alpha: 0.12;
  --ccv-deepseek-sidebar-card-boost-alpha: 0.56;
  --ccv-deepseek-sidebar-card-border-rgb: 255 255 255;
  --ccv-deepseek-sidebar-card-border-base-alpha: 0.06;
  --ccv-deepseek-sidebar-card-border-boost-alpha: 0.18;
  --ccv-deepseek-sidebar-text-rgb: 248 250 252;
  --ccv-deepseek-sidebar-text-base-alpha: 0.7;
  --ccv-deepseek-sidebar-text-boost-alpha: 0.24;
  --ccv-deepseek-sidebar-text-muted-rgb: 226 232 240;
  --ccv-deepseek-sidebar-text-muted-base-alpha: 0.52;
  --ccv-deepseek-sidebar-text-muted-boost-alpha: 0.2;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) {
  color-scheme: light dark;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) :is(
  ._24fad49,
  .ec4f5d61,
  .fbb737a4,
  .ds-message._63c77b1:not(.d29f3d7d)
) {
  color: var(--ccv-chat-text) !important;
  border-color: var(--ccv-site-border) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) :is(
  ._24fad49,
  .ec4f5d61
) {
  background: var(--ccv-site-surface-strong) !important;
  border: 1px solid var(--ccv-site-border) !important;
  outline: none !important;
  margin-inline: auto !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ._24fad49 {
  border-radius: 24px 24px 0 0 !important;
  border-bottom-width: 0 !important;
  box-shadow: none !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ec4f5d61 {
  border-radius: 0 0 24px 24px !important;
  border-top-width: 0 !important;
  box-shadow: none !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) :is(
  ._77cefa5._3d616d3,
  ._77cefa5._9996a53,
  ._020ab5b
) {
  outline: none !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .fbb737a4 {
  background: var(--ccv-deepseek-user-bubble) !important;
  border: 1px solid var(--ccv-deepseek-user-bubble-border) !important;
  color: var(--ccv-chat-text) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1:not(.d29f3d7d) {
  background: var(--ccv-deepseek-assistant-surface) !important;
  border: 1px solid var(--ccv-deepseek-assistant-border) !important;
  border-radius: 24px !important;
  padding: 18px 22px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 12px 34px ${accentShadow} !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1:not(.d29f3d7d) :is(
  p,
  span,
  strong,
  em,
  li,
  code,
  pre,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  a,
  .ds-markdown,
  .ds-markdown-paragraph
) {
  color: var(--ccv-chat-text) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1:not(.d29f3d7d) ._245c867,
:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1:not(.d29f3d7d) ._5ab5d64 {
  color: var(--ccv-chat-text-muted) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1:not(.d29f3d7d) :is(
  ._245c867,
  ._245c867 > ._5ab5d64
) {
  background: inherit !important;
  border-bottom: 1px solid var(--ccv-deepseek-assistant-border) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1:not(.d29f3d7d) :is(
  .ds-markdown,
  .ds-markdown-paragraph,
  ._871cbca
) {
  max-width: 100% !important;
  min-width: 0 !important;
  overflow: visible !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1 .ccv-deepseek-table-scroll {
  display: block !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  box-sizing: border-box !important;
  -webkit-overflow-scrolling: touch;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1 pre {
  display: block !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  box-sizing: border-box !important;
  -webkit-overflow-scrolling: touch;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1 .ccv-deepseek-table-scroll > :is(table, [role="table"]) {
  border-collapse: collapse !important;
  width: max-content !important;
  min-width: 100% !important;
  table-layout: auto !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1 :is(
  th,
  td,
  [role="columnheader"],
  [role="cell"]
) {
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
  white-space: normal !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) textarea._27c9245.ds-scroll-area.ds-scroll-area--show-on-focus-within.d96f2d2a {
  background: transparent !important;
  box-shadow: none !important;
  color: var(--ccv-chat-text) !important;
  outline: none !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) textarea._27c9245.ds-scroll-area.ds-scroll-area--show-on-focus-within.d96f2d2a::placeholder {
  color: var(--ccv-chat-text-muted) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) :is(
  ._7780f2e,
  ._765a5cd.ds-scroll-area,
  .ds-virtual-list.ds-virtual-list--printable._2bd7b35,
  .ds-virtual-list-items,
  .ds-virtual-list-visible-items,
  ._9663006,
  .d29f3d7d.ds-message._63c77b1,
  .f8d1e4c0,
  ._0fcaa63,
  ._77cefa5._3d616d3,
  ._77cefa5._9996a53,
  ._4f9bf79,
  ._43c05b5,
  .ds-markdown,
  ._871cbca,
  .d72636e2,
  .aaff8b8f,
  ._020ab5b,
  .b13855df
) {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) :is(
  ._24fad49
):focus-within {
  border-color: var(--ccv-site-border) !important;
  box-shadow: none !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ec4f5d61:has(+ ._24fad49:focus-within),
:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ._24fad49:focus-within + .ec4f5d61,
:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ec4f5d61:focus-within {
  border-color: var(--ccv-site-border) !important;
  box-shadow: none !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) textarea._27c9245.ds-scroll-area.ds-scroll-area--show-on-focus-within.d96f2d2a:focus {
  outline: none;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) :is(
  a._546d736:hover,
  a._546d736:focus-visible,
  a._546d736[aria-current="page"],
  a._546d736[aria-selected="true"],
  a._546d736.b64fb9ae
) {
  background: var(--ccv-accent-soft) !important;
  border-color: transparent !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) :is(
  a._546d736[aria-current="page"],
  a._546d736[aria-selected="true"],
  a._546d736.b64fb9ae
) > :is(.c08e6e93, ._254829d, .ds-icon) {
  color: var(--ccv-accent) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) :is(
  button[type="submit"],
  button[class*="send"],
  button[class*="primary"],
  [role="button"][class*="send"],
  [class*="send-button"]
) {
  background: var(--ccv-accent) !important;
  border-color: var(--ccv-accent) !important;
  color: var(--ccv-accent-contrast) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ._52c986b.bd74640a.ds-icon-button {
  border-color: transparent !important;
  box-shadow: none !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ._52c986b.bd74640a.ds-icon-button:not(.ds-icon-button--disabled) {
  background: var(--ccv-accent) !important;
  border-color: var(--ccv-accent) !important;
  color: var(--ccv-accent-contrast) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ._52c986b.bd74640a.ds-icon-button:not(.ds-icon-button--disabled) :is(
  .ds-icon,
  .ds-icon svg
) {
  color: var(--ccv-accent-contrast) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ._52c986b.bd74640a.ds-icon-button.ds-icon-button--disabled {
  background: ${accentMuted} !important;
  border-color: ${hexToRgbaString(settings.accentColor, 0.18)} !important;
  color: ${accentMutedText} !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ._52c986b.bd74640a.ds-icon-button.ds-icon-button--disabled :is(
  .ds-icon,
  .ds-icon svg
) {
  color: ${accentMutedText} !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ._52c986b.bd74640a.ds-icon-button .ds-icon-button__hover-bg {
  background: transparent !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) a {
  color: var(--ccv-accent) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ::selection {
  background: ${hexToRgbaString(settings.accentColor, 0.26)};
}
`
}
