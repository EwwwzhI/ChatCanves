import { describe, expect, it } from 'vitest'
import {
  buildCustomThemeCss,
  DEFAULT_CUSTOM_THEME_SETTINGS,
  normalizeCustomThemeSettings,
  normalizeSurfaceOpacity,
} from './customTheme'

function extractCssVariableValue(css: string, variableName: string): string | null {
  const match = css.match(new RegExp(`${variableName}:\\s*([^;]+);`))
  return match?.[1]?.trim() ?? null
}

describe('custom theme', () => {
  it('defaults surface opacity when the value is missing or invalid', () => {
    expect(normalizeCustomThemeSettings({}).surfaceOpacity).toBe(
      DEFAULT_CUSTOM_THEME_SETTINGS.surfaceOpacity,
    )
    expect(normalizeSurfaceOpacity(Number.NaN)).toBe(
      DEFAULT_CUSTOM_THEME_SETTINGS.surfaceOpacity,
    )
  })

  it('clamps surface opacity within the supported range', () => {
    expect(normalizeSurfaceOpacity(12)).toBe(35)
    expect(normalizeSurfaceOpacity(1000)).toBe(100)
    expect(normalizeCustomThemeSettings({ surfaceOpacity: 67.4 }).surfaceOpacity).toBe(67)
  })

  it('only changes Gemini chat-area surfaces when surface opacity changes', () => {
    const lowOpacityCss = buildCustomThemeCss({
      accentColor: '#4285f4',
      surfaceColor: '#4285f4',
      textColor: '#0f172a',
      surfaceOpacity: 35,
    })
    const midOpacityCss = buildCustomThemeCss({
      accentColor: '#4285f4',
      surfaceColor: '#4285f4',
      textColor: '#0f172a',
      surfaceOpacity: 50,
    })
    const highOpacityCss = buildCustomThemeCss({
      accentColor: '#4285f4',
      surfaceColor: '#4285f4',
      textColor: '#0f172a',
      surfaceOpacity: 100,
    })

    expect(
      extractCssVariableValue(lowOpacityCss, '--ccv-gemini-chat-surface-light'),
    ).not.toBe(
      extractCssVariableValue(midOpacityCss, '--ccv-gemini-chat-surface-light'),
    )
    expect(
      extractCssVariableValue(midOpacityCss, '--ccv-gemini-chat-surface-light'),
    ).not.toBe(
      extractCssVariableValue(highOpacityCss, '--ccv-gemini-chat-surface-light'),
    )
    expect(
      extractCssVariableValue(lowOpacityCss, '--ccv-gemini-chat-surface-dark-strong'),
    ).not.toBe(
      extractCssVariableValue(highOpacityCss, '--ccv-gemini-chat-surface-dark-strong'),
    )

    expect(
      extractCssVariableValue(lowOpacityCss, '--bard-color-sidenav-background-desktop'),
    ).toBe(
      extractCssVariableValue(highOpacityCss, '--bard-color-sidenav-background-desktop'),
    )
    expect(
      extractCssVariableValue(lowOpacityCss, '--gem-sys-color--surface-container'),
    ).toBe(
      extractCssVariableValue(highOpacityCss, '--gem-sys-color--surface-container'),
    )
    expect(
      extractCssVariableValue(lowOpacityCss, '--gem-sys-color--surface-container-high'),
    ).toBe(
      extractCssVariableValue(highOpacityCss, '--gem-sys-color--surface-container-high'),
    )
  })
})
