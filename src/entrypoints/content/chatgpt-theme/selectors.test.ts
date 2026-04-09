import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildChatGptCustomThemeCss } from './customTheme'
import {
  CHATGPT_FORBIDDEN_BROAD_SELECTORS,
  CHATGPT_LAYOUT_ATTRS,
  compileChatGptBackgroundCssTemplate,
} from './selectors'

describe('chatgpt selector map', () => {
  const backgroundTemplate = readFileSync(
    join(
      process.cwd(),
      'src',
      'entrypoints',
      'content',
      'chatgpt-theme',
      'background',
      'style.css',
    ),
    'utf8',
  )

  it('keeps custom theme css scoped to runtime markers', () => {
    const css = buildChatGptCustomThemeCss({})

    CHATGPT_FORBIDDEN_BROAD_SELECTORS.forEach((selector) => {
      expect(css).not.toContain(selector)
    })
    expect(css).toContain(`[${CHATGPT_LAYOUT_ATTRS.chatListSurface}="true"]`)
    expect(css).toContain(`[${CHATGPT_LAYOUT_ATTRS.assistantSurfaceNode}="true"]`)
    expect(css).toContain(`[${CHATGPT_LAYOUT_ATTRS.userBubbleNode}="true"]`)
    expect(css).toContain(`[${CHATGPT_LAYOUT_ATTRS.composerShell}="true"]`)
  })

  it('replaces background template tokens with runtime markers', () => {
    const css = compileChatGptBackgroundCssTemplate(`
      __CCV_CHATGPT_WALLPAPER_ROOT__ __CCV_CHATGPT_BOTTOM_BLOCK__ __CCV_CHATGPT_COMPOSER_INPUT__
    `)

    expect(css).toContain(`[${CHATGPT_LAYOUT_ATTRS.wallpaperRootShell}="true"]`)
    expect(css).toContain(`[${CHATGPT_LAYOUT_ATTRS.bottomWhiteBlockNode}="true"]`)
    expect(css).toContain(`[${CHATGPT_LAYOUT_ATTRS.composerInput}="true"]`)
    expect(css).not.toContain('__CCV_CHATGPT_')
  })

  it('keeps the background template free of broad selector fallbacks', () => {
    CHATGPT_FORBIDDEN_BROAD_SELECTORS.forEach((selector) => {
      expect(backgroundTemplate).not.toContain(selector)
    })
    expect(backgroundTemplate).toContain('__CCV_CHATGPT_WALLPAPER_ROOT__')
    expect(backgroundTemplate).toContain('__CCV_CHATGPT_BOTTOM_BLOCK__')
  })
})
