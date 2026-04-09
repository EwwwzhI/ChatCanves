import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CUSTOM_THEME_SETTINGS,
  normalizeCustomThemeSettings,
  normalizeSurfaceOpacity,
} from '@/entrypoints/content/gemini-theme/customTheme'
import { buildDeepSeekCustomThemeCss } from './customTheme'

function extractCssVariableValue(css: string, variableName: string): string | null {
  const match = css.match(new RegExp(`${variableName}:\\s*([^;]+);`))
  return match?.[1]?.trim() ?? null
}

describe('deepseek custom theme', () => {
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

  it('changes DeepSeek chat and composer surfaces across the full opacity range', () => {
    const lowOpacityCss = buildDeepSeekCustomThemeCss({
      accentColor: '#4f46e5',
      surfaceColor: '#f0f0e8',
      textColor: '#111827',
      surfaceOpacity: 35,
    })
    const midOpacityCss = buildDeepSeekCustomThemeCss({
      accentColor: '#4f46e5',
      surfaceColor: '#f0f0e8',
      textColor: '#111827',
      surfaceOpacity: 50,
    })
    const highOpacityCss = buildDeepSeekCustomThemeCss({
      accentColor: '#4f46e5',
      surfaceColor: '#f0f0e8',
      textColor: '#111827',
      surfaceOpacity: 100,
    })

    expect(
      extractCssVariableValue(lowOpacityCss, '--ccv-deepseek-assistant-surface'),
    ).not.toBe(
      extractCssVariableValue(midOpacityCss, '--ccv-deepseek-assistant-surface'),
    )
    expect(
      extractCssVariableValue(midOpacityCss, '--ccv-deepseek-assistant-surface'),
    ).not.toBe(
      extractCssVariableValue(highOpacityCss, '--ccv-deepseek-assistant-surface'),
    )
    expect(
      extractCssVariableValue(lowOpacityCss, '--ccv-site-surface-strong'),
    ).not.toBe(
      extractCssVariableValue(highOpacityCss, '--ccv-site-surface-strong'),
    )
    expect(
      extractCssVariableValue(lowOpacityCss, '--ccv-deepseek-sidebar-card-base-alpha'),
    ).toBe(
      extractCssVariableValue(highOpacityCss, '--ccv-deepseek-sidebar-card-base-alpha'),
    )
  })

  it('keeps markdown tables constrained inside the message bubble', () => {
    const css = buildDeepSeekCustomThemeCss({
      accentColor: '#4f46e5',
      surfaceColor: '#f0f0e8',
      textColor: '#111827',
      surfaceOpacity: 88,
    })

    expect(css).toContain('overflow-x: auto !important;')
    expect(css).toContain('word-break: break-word !important;')
    expect(css).toContain('.ccv-deepseek-table-scroll')
  })

  it('defines dedicated sidebar selectors and tokens independent from chat surfaces', () => {
    const css = buildDeepSeekCustomThemeCss({
      accentColor: '#4f46e5',
      surfaceColor: '#f0f0e8',
      textColor: '#111827',
      surfaceOpacity: 88,
    })

    expect(css).toContain('--ccv-deepseek-sidebar-panel-rgb')
    expect(css).toContain('--ccv-deepseek-sidebar-card-rgb')
    expect(css).toContain('--ccv-deepseek-sidebar-text-rgb')
    expect(css).toContain('--ccv-deepseek-sidebar-text-muted-rgb')
    expect(css).toContain('a._546d736.b64fb9ae')
  })

  it('applies accent styling to the DeepSeek composer send button', () => {
    const css = buildDeepSeekCustomThemeCss({
      accentColor: '#4f46e5',
      surfaceColor: '#f0f0e8',
      textColor: '#111827',
      surfaceOpacity: 88,
    })

    expect(css).toContain('._52c986b.bd74640a.ds-icon-button')
    expect(css).toContain('.ds-icon-button--disabled')
    expect(css).toContain('.ds-icon-button__hover-bg')
  })

  it('keeps the think section title strip on the composer surface tone', () => {
    const css = buildDeepSeekCustomThemeCss({
      accentColor: '#4f46e5',
      surfaceColor: '#f0f0e8',
      textColor: '#111827',
      surfaceOpacity: 88,
    })

    expect(css).toContain('._245c867')
    expect(css).toContain('._245c867 > ._5ab5d64')
    expect(css).toContain('background: inherit !important;')
  })
})
