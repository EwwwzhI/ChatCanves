import { beforeEach, describe, expect, it } from 'vitest'
import {
  applyChatGptThemeBackgroundStyle,
  clearChatGptThemeBackgroundStyle,
} from './styleController'
import type { ThemeBackgroundResolvedState } from '@/entrypoints/content/gemini-theme/background/types'
function createState(
  overrides: Partial<ThemeBackgroundResolvedState> = {},
): ThemeBackgroundResolvedState {
  const base: ThemeBackgroundResolvedState = {
    settings: {
      version: 3,
      backgroundImageEnabled: false,
      backgroundBlurPx: 5,
      messageGlassEnabled: false,
      sidebarScrimEnabled: false,
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

describe('chatgpt background styleController', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="chatgpt-shell"></div>'
    document.documentElement.setAttribute('data-ccv-site', 'chatgpt')
    clearChatGptThemeBackgroundStyle()
  })

  it('applies renderable background state', () => {
    applyChatGptThemeBackgroundStyle(
      createState({
        settings: {
          backgroundImageEnabled: true,
          backgroundBlurPx: 11,
          imageRef: { kind: 'asset', assetId: 'asset-1' },
        } as ThemeBackgroundResolvedState['settings'],
        resolvedBackgroundUrl: 'blob:chatgpt-preview',
        isBackgroundRenderable: true,
      }),
    )

    expect(document.documentElement.getAttribute('data-gpk-bg-enabled')).toBe('true')
    expect(document.documentElement.style.getPropertyValue('--gpk-bg-blur')).toBe('11px')
    expect(document.documentElement.style.getPropertyValue('--gpk-bg-image')).toContain(
      'blob:chatgpt-preview',
    )
    expect(document.getElementById('chatcanves-chatgpt-theme-background-override')).toBeTruthy()

    const bgLayer = document.getElementById('gpk-theme-bg-layer')
    expect(bgLayer?.parentElement).toBe(document.body)
    expect(bgLayer?.style.display).toBe('block')
    expect(bgLayer?.style.backgroundImage).toContain('blob:chatgpt-preview')
  })

  it('clears style tag, root attributes and background layer', () => {
    applyChatGptThemeBackgroundStyle(createState())
    clearChatGptThemeBackgroundStyle()

    expect(document.getElementById('chatcanves-chatgpt-theme-background-override')).toBeNull()
    expect(document.getElementById('gpk-theme-bg-layer')).toBeNull()
    expect(document.documentElement.getAttribute('data-gpk-bg-enabled')).toBeNull()
    expect(document.documentElement.style.getPropertyValue('--gpk-bg-image')).toBe('')
    expect(document.documentElement.style.getPropertyValue('--gpk-bg-blur')).toBe('')
  })
})
