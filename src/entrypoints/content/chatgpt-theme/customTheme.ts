import {
  getReadableTextColor,
  hexToRgbaString,
  normalizeCustomThemeSettings,
  type CustomThemeSettings,
} from '@/entrypoints/content/gemini-theme/customTheme'
import { CHATGPT_LAYOUT_SELECTORS } from './selectors'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function buildChatGptCustomThemeCss(
  raw: Partial<CustomThemeSettings>,
): string {
  const selectors = CHATGPT_LAYOUT_SELECTORS
  const settings = normalizeCustomThemeSettings(raw)
  const opacityRatio = clamp(settings.surfaceOpacity, 35, 100) / 100
  const accentContrast = getReadableTextColor(settings.accentColor)
  const textMuted = hexToRgbaString(settings.textColor, 0.72)
  const lightSurface = hexToRgbaString(
    settings.surfaceColor,
    clamp(opacityRatio * 0.64, 0.5, 0.84),
  )
  const lightSurfaceStrong = hexToRgbaString(
    settings.surfaceColor,
    clamp(opacityRatio * 0.76, 0.6, 0.92),
  )
  const lightBorder = hexToRgbaString(settings.surfaceColor, 0.24)
  const darkSurface = hexToRgbaString(
    settings.surfaceColor,
    clamp(opacityRatio * 0.78, 0.64, 0.92),
  )
  const darkSurfaceStrong = hexToRgbaString(
    settings.surfaceColor,
    clamp(opacityRatio * 0.86, 0.72, 0.96),
  )
  const darkBorder = hexToRgbaString(settings.surfaceColor, 0.34)
  const accentSoft = hexToRgbaString(settings.accentColor, 0.16)

  return `
:root[data-ccv-site="chatgpt"] {
  --ccv-accent: ${settings.accentColor};
  --ccv-accent-contrast: ${accentContrast};
  --ccv-accent-soft: ${accentSoft};
  --ccv-chat-text: ${settings.textColor};
  --ccv-chat-text-muted: ${textMuted};
}

:root[data-ccv-site="chatgpt"][data-ccv-effective-theme="light"] {
  --ccv-chatgpt-surface: ${lightSurface};
  --ccv-chatgpt-surface-strong: ${lightSurfaceStrong};
  --ccv-chatgpt-border: ${lightBorder};
}

:root[data-ccv-site="chatgpt"][data-ccv-effective-theme="dark"] {
  --ccv-chatgpt-surface: ${darkSurface};
  --ccv-chatgpt-surface-strong: ${darkSurfaceStrong};
  --ccv-chatgpt-border: ${darkBorder};
}

:root[data-ccv-site="chatgpt"] body {
  color-scheme: light dark;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.sidebarRoot},
  ${selectors.sidebarTopActionArea},
  ${selectors.assistantMessageOuter},
  ${selectors.assistantSurfaceNode},
  ${selectors.chatListSurface},
  ${selectors.bottomWhiteBlockNode}
) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.newChatButton},
  ${selectors.searchChatButton},
  ${selectors.sidebarHistoryItem},
  ${selectors.userBubbleNode},
  ${selectors.composerShell}
) {
  background: var(--ccv-chatgpt-surface-strong) !important;
  border: 1px solid var(--ccv-chatgpt-border) !important;
  box-shadow: none !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.newChatButton},
  ${selectors.searchChatButton},
  ${selectors.sidebarHistoryItem}
) {
  border-radius: 18px !important;
}

:root[data-ccv-site="chatgpt"] ${selectors.chatListSurface} {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.userBubbleNode},
  ${selectors.composerShell}
) {
  border-radius: 28px !important;
  min-width: 0 !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  color: var(--ccv-chat-text) !important;
}

:root[data-ccv-site="chatgpt"] ${selectors.userBubbleNode} {
  background: var(--ccv-chatgpt-surface-strong) !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.mainChatColumn},
  ${selectors.bottomWhiteBlockNode}
) {
  background: var(--ccv-chatgpt-surface) !important;
  border: 1px solid var(--ccv-chatgpt-border) !important;
  border-radius: 28px !important;
  box-sizing: border-box !important;
  color: var(--ccv-chat-text) !important;
  box-shadow: none !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.sidebarRoot},
  ${selectors.newChatButton},
  ${selectors.searchChatButton},
  ${selectors.sidebarHistoryItem}
) :is(a, button, span, div, p, input) {
  color: var(--ccv-chat-text);
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.newChatButton},
  ${selectors.searchChatButton},
  ${selectors.sidebarHistoryItem}
):hover {
  background: var(--ccv-accent-soft) !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.userBubbleNode}
) :is(pre, table) {
  max-width: 100% !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.userBubbleNode}
) pre {
  overflow: auto !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.mainChatColumn},
  ${selectors.assistantSurfaceNode},
  ${selectors.userBubbleNode}
) :is(
  p,
  span,
  li,
  strong,
  em,
  code,
  pre,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  th,
  td,
  a
) {
  color: inherit !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.mainChatColumn},
  ${selectors.assistantSurfaceNode},
  ${selectors.userBubbleNode}
) :is(pre, table) {
  max-width: 100% !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.mainChatColumn},
  ${selectors.assistantSurfaceNode},
  ${selectors.userBubbleNode}
) pre {
  overflow: auto !important;
}

:root[data-ccv-site="chatgpt"] ${selectors.composerShell} {
  background: var(--ccv-chatgpt-surface-strong) !important;
  border: 1px solid var(--ccv-chatgpt-border) !important;
  color: var(--ccv-chat-text) !important;
  box-shadow: none !important;
}

:root[data-ccv-site="chatgpt"] ${selectors.composerShell} :is(
  div,
  section,
  footer
) {
  background: transparent !important;
  box-shadow: none !important;
}

:root[data-ccv-site="chatgpt"] ${selectors.composerInput} {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: var(--ccv-chat-text) !important;
  box-shadow: none !important;
}

:root[data-ccv-site="chatgpt"] ${selectors.composerInput}::placeholder {
  color: var(--ccv-chat-text-muted) !important;
}

:root[data-ccv-site="chatgpt"] ${selectors.sendButton} {
  background: var(--ccv-accent) !important;
  border-color: var(--ccv-accent) !important;
  color: var(--ccv-accent-contrast) !important;
}

:root[data-ccv-site="chatgpt"] :is(
  ${selectors.mainChatColumn},
  ${selectors.userBubbleNode},
  ${selectors.newChatButton},
  ${selectors.searchChatButton},
  ${selectors.sidebarHistoryItem}
) a {
  color: var(--ccv-accent) !important;
}

:root[data-ccv-site="chatgpt"] ::selection {
  background: ${hexToRgbaString(settings.accentColor, 0.26)};
}
`
}
