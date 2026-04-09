import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { __resetStorageMock } from '@/test/mocks/wxt-imports'
import {
  getChatGptAppearanceState,
  initChatGptAppearance,
  setChatGptAppearanceMode,
  subscribeChatGptSystemThemeChange,
} from './service'

type MatchMediaListener = (event: MediaQueryListEvent) => void

function createModernMatchMediaMock(initialMatches: boolean) {
  const listeners = new Set<MatchMediaListener>()
  const mediaQueryList = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn((type: string, listener: MatchMediaListener) => {
      if (type === 'change') listeners.add(listener)
    }),
    removeEventListener: vi.fn((type: string, listener: MatchMediaListener) => {
      if (type === 'change') listeners.delete(listener)
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList

  vi.spyOn(window, 'matchMedia').mockImplementation(() => mediaQueryList)

  return {
    mediaQueryList,
    emit(matches: boolean) {
      listeners.forEach((listener) => {
        listener({ matches } as MediaQueryListEvent)
      })
    },
  }
}

describe('chatgpt appearance service', () => {
  beforeEach(() => {
    __resetStorageMock()
    document.body.className = ''
    document.body.removeAttribute('data-theme')
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-color-mode')
    document.documentElement.removeAttribute('data-ccv-effective-theme')
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes system mode from the existing theme carrier', async () => {
    createModernMatchMediaMock(false)
    document.documentElement.setAttribute('data-theme', 'dark')

    await initChatGptAppearance()

    expect(getChatGptAppearanceState()).toEqual({
      mode: 'system',
      effectiveTheme: 'dark',
    })
    expect(document.documentElement.getAttribute('data-ccv-effective-theme')).toBe('dark')
  })

  it('forces light and dark modes directly in the content world', () => {
    const lightState = setChatGptAppearanceMode('light')
    expect(lightState).toEqual({ mode: 'light', effectiveTheme: 'light' })
    expect(document.body.classList.contains('light-theme')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    const darkState = setChatGptAppearanceMode('dark')
    expect(darkState).toEqual({ mode: 'dark', effectiveTheme: 'dark' })
    expect(document.body.classList.contains('dark-theme')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('uses matchMedia when switching to system mode', () => {
    createModernMatchMediaMock(true)

    const state = setChatGptAppearanceMode('system')

    expect(state).toEqual({ mode: 'system', effectiveTheme: 'dark' })
    expect(document.documentElement.getAttribute('data-ccv-effective-theme')).toBe('dark')
  })

  it('subscribes to system theme changes and updates callers', () => {
    const matchMediaMock = createModernMatchMediaMock(false)
    const onChange = vi.fn()
    setChatGptAppearanceMode('system')

    const unsubscribe = subscribeChatGptSystemThemeChange(onChange)
    matchMediaMock.emit(true)
    unsubscribe()

    expect(onChange).toHaveBeenCalledWith('dark')
    expect(document.documentElement.getAttribute('data-ccv-effective-theme')).toBe('dark')
  })
})
