import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  applyDeepSeekThemeBackgroundStyle,
  clearDeepSeekThemeBackgroundStyle,
} from './styleController'
import type { ThemeBackgroundResolvedState } from '@/entrypoints/content/gemini-theme/background/types'

const backgroundStyleCss = readFileSync(
  join(
    process.cwd(),
    'src/entrypoints/content/deepseek-theme/background/style.css',
  ),
  'utf8',
)

function createState(
  overrides: Partial<ThemeBackgroundResolvedState> = {},
): ThemeBackgroundResolvedState {
  const base: ThemeBackgroundResolvedState = {
    settings: {
      version: 3,
      backgroundImageEnabled: false,
      backgroundBlurPx: 5,
      messageGlassEnabled: false,
      sidebarScrimEnabled: true,
      sidebarScrimIntensity: 20,
      welcomeGreetingReadabilityMode: 'auto',
      welcomeGreetingResolved: 'default',
      welcomeGreetingResolvedAssetId: null,
      imageRef: { kind: 'none' },
      updatedAt: new Date().toISOString(),
    },
    resolvedBackgroundUrl: null,
    isBackgroundRenderable: false,
  }

  return {
    ...base,
    ...overrides,
    settings: {
      ...base.settings,
      ...(overrides.settings ?? {}),
    },
  }
}

describe('deepseek background styleController', () => {
  beforeEach(() => {
    clearDeepSeekThemeBackgroundStyle()
  })

  it('applies background, message glass, and sidebar scrim state', () => {
    applyDeepSeekThemeBackgroundStyle(
      createState({
        settings: {
          backgroundImageEnabled: true,
          backgroundBlurPx: 11,
          messageGlassEnabled: true,
          sidebarScrimEnabled: true,
          sidebarScrimIntensity: 48,
          imageRef: { kind: 'asset', assetId: 'asset-1' },
        } as ThemeBackgroundResolvedState['settings'],
        resolvedBackgroundUrl: 'blob:deepseek-preview',
        isBackgroundRenderable: true,
      }),
    )

    expect(document.documentElement.getAttribute('data-gpk-bg-enabled')).toBe('true')
    expect(document.documentElement.getAttribute('data-gpk-msg-glass')).toBe('true')
    expect(document.documentElement.getAttribute('data-gpk-sidebar-scrim-enabled')).toBe(
      'true',
    )
    expect(document.documentElement.style.getPropertyValue('--gpk-bg-blur')).toBe('11px')
    expect(document.documentElement.style.getPropertyValue('--gpk-sidebar-scrim-alpha')).toBe(
      '0.48',
    )
    expect(document.documentElement.style.getPropertyValue('--gpk-bg-image')).toContain(
      'blob:deepseek-preview',
    )
    expect(document.getElementById('chatcanves-deepseek-theme-background-override')).toBeTruthy()

    const bgLayer = document.getElementById('gpk-theme-bg-layer')
    expect(bgLayer).toBeTruthy()
    expect(bgLayer?.style.display).toBe('block')
    expect(bgLayer?.style.backgroundImage).toContain('blob:deepseek-preview')

    const styleTag = document.getElementById(
      'chatcanves-deepseek-theme-background-override',
    ) as HTMLStyleElement | null
    expect(styleTag).toBeTruthy()
    expect(backgroundStyleCss).toContain('a._546d736')
    expect(backgroundStyleCss).toContain('a._546d736 > .c08e6e93')
    expect(backgroundStyleCss).toContain('.b8812f16.a2f3d50e')
    expect(backgroundStyleCss).toContain(
      '._3568175.ds-scroll-area.ds-scroll-area--show-on-focus-within',
    )
    expect(backgroundStyleCss).toContain('._77cdc67._8a693f3 > ._3098d02::before')
    expect(backgroundStyleCss).toContain('._77cdc67._8a693f3 > ._3098d02 > .f3d18f6a')
    expect(backgroundStyleCss).toContain('.ds-focus-ring')
  })

  it('clears style tag, root attributes and background layer', () => {
    applyDeepSeekThemeBackgroundStyle(createState())
    clearDeepSeekThemeBackgroundStyle()

    expect(document.getElementById('chatcanves-deepseek-theme-background-override')).toBeNull()
    expect(document.getElementById('gpk-theme-bg-layer')).toBeNull()
    expect(document.documentElement.getAttribute('data-gpk-bg-enabled')).toBeNull()
    expect(document.documentElement.getAttribute('data-gpk-msg-glass')).toBeNull()
    expect(document.documentElement.getAttribute('data-gpk-sidebar-scrim-enabled')).toBeNull()
    expect(document.documentElement.style.getPropertyValue('--gpk-bg-image')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--gpk-bg-blur')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--gpk-sidebar-scrim-alpha')).toBe(
      '',
    )
  })
})
