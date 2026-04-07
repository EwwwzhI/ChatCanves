import {
  getReadableTextColor,
  hexToRgbaString,
  normalizeCustomThemeSettings,
  type CustomThemeSettings,
} from '@/entrypoints/content/gemini-theme/customTheme'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function buildDeepSeekCustomThemeCss(
  raw: Partial<CustomThemeSettings>,
): string {
  const settings = normalizeCustomThemeSettings(raw)
  const opacityRatio = clamp(settings.surfaceOpacity, 35, 100) / 100
  const accentContrast = getReadableTextColor(settings.accentColor)
  const textMuted = hexToRgbaString(settings.textColor, 0.72)
  const lightSurface = hexToRgbaString(
    settings.surfaceColor,
    clamp(opacityRatio * 0.62, 0.52, 0.82),
  )
  const lightSurfaceStrong = hexToRgbaString(
    settings.surfaceColor,
    clamp(opacityRatio * 0.72, 0.62, 0.9),
  )
  const lightBorder = hexToRgbaString(settings.surfaceColor, 0.28)
  const darkSurface = hexToRgbaString(
    settings.surfaceColor,
    clamp(opacityRatio * 0.76, 0.66, 0.92),
  )
  const darkSurfaceStrong = hexToRgbaString(
    settings.surfaceColor,
    clamp(opacityRatio * 0.84, 0.72, 0.96),
  )
  const darkBorder = hexToRgbaString(settings.surfaceColor, 0.34)
  const accentSoft = hexToRgbaString(settings.accentColor, 0.18)
  const accentShadow = hexToRgbaString(settings.accentColor, 0.14)

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
  backdrop-filter: blur(18px);
  border: 1px solid var(--ccv-site-border) !important;
  outline: none !important;
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
  backdrop-filter: blur(14px);
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) .ds-message._63c77b1:not(.d29f3d7d) {
  background: var(--ccv-deepseek-assistant-surface) !important;
  border: 1px solid var(--ccv-deepseek-assistant-border) !important;
  border-radius: 24px !important;
  padding: 18px 22px !important;
  box-sizing: border-box !important;
  backdrop-filter: blur(20px);
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
  ._74c0879,
  .e1675d8b.ds-think-content._767406f,
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
  a._546d736
):hover {
  background: var(--ccv-accent-soft) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) :is(
  a._546d736[aria-current="page"],
  a._546d736._867c95b
):focus {
  background: var(--ccv-accent-soft) !important;
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

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) a {
  color: var(--ccv-accent) !important;
}

:root[data-ccv-site="deepseek"] body:is(.light-theme, .dark-theme) ::selection {
  background: ${hexToRgbaString(settings.accentColor, 0.26)};
}
`
}
