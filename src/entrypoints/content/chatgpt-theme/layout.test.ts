import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { __resetChatGptLayoutSyncForTests, syncChatGptLayoutMarkers } from './layout'
import { CHATGPT_LAYOUT_ATTRS } from './selectors'

function mockRect(
  element: Element,
  rect: Partial<DOMRect> & Pick<DOMRect, 'width' | 'height' | 'top' | 'left'>,
): void {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: rect.left,
    y: rect.top,
    bottom: rect.top + rect.height,
    right: rect.left + rect.width,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect)
}

describe('chatgpt layout markers', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app-shell">
        <aside id="sidebar">
          <div id="top-actions">
            <button id="new-chat">New chat</button>
            <button id="search-chat">Search chats</button>
          </div>
          <nav id="history">
            <a id="history-item" href="/c/test-conversation">Example thread</a>
          </nav>
        </aside>
        <main id="chat-main">
          <div id="conversation-column">
            <div id="message-list">
              <div id="assistant-root" data-message-author-role="assistant">
                <div id="assistant-panel">
                  <div id="assistant-summary">
                    <p>assistant top</p>
                  </div>
                  <div id="assistant-prose">
                    <p>assistant bottom</p>
                  </div>
                </div>
                <div id="assistant-toolbar">
                  <button>Copy</button>
                </div>
              </div>
              <div id="user-root" data-message-author-role="user">
                <div id="user-row">
                  <div id="user-bubble" style="border-radius: 24px; background: rgb(240, 240, 240);">
                    <p>user body</p>
                  </div>
                </div>
              </div>
            </div>
            <div id="composer-footer" style="background: rgb(255, 255, 255);">
              <div id="composer-shell" style="background: rgb(255, 255, 255); border-radius: 28px; border: 1px solid rgb(220, 220, 220);">
                <form id="composer-form">
                  <div>
                    <textarea id="prompt-textarea"></textarea>
                  </div>
                  <button id="send-button" data-testid="send-button" aria-label="Send">Send</button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    `

    mockRect(document.body, { left: 0, top: 0, width: 1600, height: 900 })
    mockRect(document.getElementById('app-shell')!, { left: 0, top: 0, width: 1600, height: 900 })
    mockRect(document.getElementById('sidebar')!, { left: 0, top: 0, width: 260, height: 900 })
    mockRect(document.getElementById('top-actions')!, { left: 0, top: 24, width: 220, height: 96 })
    mockRect(document.getElementById('new-chat')!, { left: 16, top: 32, width: 180, height: 36 })
    mockRect(document.getElementById('search-chat')!, { left: 16, top: 76, width: 180, height: 36 })
    mockRect(document.getElementById('history')!, { left: 0, top: 180, width: 220, height: 200 })
    mockRect(document.getElementById('history-item')!, { left: 16, top: 192, width: 180, height: 36 })
    mockRect(document.getElementById('chat-main')!, { left: 260, top: 0, width: 1340, height: 900 })
    mockRect(document.getElementById('conversation-column')!, { left: 360, top: 0, width: 860, height: 900 })
    mockRect(document.getElementById('message-list')!, { left: 420, top: 40, width: 760, height: 360 })
    mockRect(document.getElementById('assistant-root')!, { left: 420, top: 40, width: 760, height: 220 })
    mockRect(document.getElementById('assistant-panel')!, { left: 420, top: 40, width: 760, height: 180 })
    mockRect(document.getElementById('assistant-summary')!, { left: 452, top: 72, width: 700, height: 36 })
    mockRect(document.querySelector('#assistant-summary p')!, { left: 452, top: 72, width: 680, height: 24 })
    mockRect(document.getElementById('assistant-prose')!, { left: 452, top: 120, width: 700, height: 72 })
    mockRect(document.querySelector('#assistant-prose p')!, { left: 452, top: 120, width: 680, height: 48 })
    mockRect(document.getElementById('assistant-toolbar')!, { left: 452, top: 208, width: 180, height: 24 })
    mockRect(document.querySelector('#assistant-toolbar button')!, { left: 452, top: 208, width: 56, height: 24 })
    mockRect(document.getElementById('user-root')!, { left: 420, top: 260, width: 760, height: 120 })
    mockRect(document.getElementById('user-row')!, { left: 420, top: 260, width: 760, height: 120 })
    mockRect(document.getElementById('user-bubble')!, { left: 760, top: 272, width: 360, height: 72 })
    mockRect(document.querySelector('#user-bubble p')!, { left: 792, top: 292, width: 296, height: 28 })
    mockRect(document.getElementById('composer-footer')!, { left: 360, top: 700, width: 860, height: 160 })
    mockRect(document.getElementById('composer-shell')!, { left: 420, top: 720, width: 760, height: 88 })
    mockRect(document.getElementById('composer-form')!, { left: 444, top: 732, width: 712, height: 64 })
    mockRect(document.getElementById('prompt-textarea')!, { left: 468, top: 744, width: 600, height: 36 })
    mockRect(document.getElementById('send-button')!, { left: 1112, top: 744, width: 36, height: 36 })
  })

  afterEach(() => {
    __resetChatGptLayoutSyncForTests()
    vi.restoreAllMocks()
  })

  it('marks the exact sidebar, message, composer and background nodes', () => {
    syncChatGptLayoutMarkers()

    expect(document.getElementById('app-shell')?.getAttribute(CHATGPT_LAYOUT_ATTRS.wallpaperRootShell)).toBe('true')
    expect(document.getElementById('conversation-column')?.getAttribute(CHATGPT_LAYOUT_ATTRS.mainChatColumn)).toBe('true')
    expect(document.getElementById('top-actions')?.getAttribute(CHATGPT_LAYOUT_ATTRS.sidebarTopActionArea)).toBe('true')
    expect(document.getElementById('new-chat')?.getAttribute(CHATGPT_LAYOUT_ATTRS.newChatButton)).toBe('true')
    expect(document.getElementById('search-chat')?.getAttribute(CHATGPT_LAYOUT_ATTRS.searchChatButton)).toBe('true')
    expect(document.getElementById('history-item')?.getAttribute(CHATGPT_LAYOUT_ATTRS.sidebarHistoryItem)).toBe('true')
    expect(document.getElementById('message-list')?.getAttribute(CHATGPT_LAYOUT_ATTRS.chatListSurface)).toBe('true')
    expect(document.getElementById('assistant-root')?.getAttribute(CHATGPT_LAYOUT_ATTRS.assistantMessageOuter)).toBe('true')
    expect(document.getElementById('assistant-panel')?.getAttribute(CHATGPT_LAYOUT_ATTRS.assistantSurfaceNode)).toBe('true')
    expect(document.getElementById('user-bubble')?.getAttribute(CHATGPT_LAYOUT_ATTRS.userBubbleNode)).toBe('true')
    expect(document.getElementById('composer-shell')?.getAttribute(CHATGPT_LAYOUT_ATTRS.composerShell)).toBe('true')
    expect(document.getElementById('prompt-textarea')?.getAttribute(CHATGPT_LAYOUT_ATTRS.composerInput)).toBe('true')
    expect(document.getElementById('send-button')?.getAttribute(CHATGPT_LAYOUT_ATTRS.sendButton)).toBe('true')
    expect(document.getElementById('composer-footer')?.getAttribute(CHATGPT_LAYOUT_ATTRS.bottomWhiteBlockNode)).toBe('true')
  })

  it('skips an oversized chat list surface and still marks outer footer backdrops', () => {
    const messageList = document.getElementById('message-list')!
    const chatMain = document.getElementById('chat-main')!
    const footerBackdrop = document.createElement('div')
    footerBackdrop.id = 'footer-backdrop'
    footerBackdrop.setAttribute('style', 'background: rgb(255, 255, 255);')
    chatMain.appendChild(footerBackdrop)

    mockRect(messageList, { left: 420, top: 40, width: 760, height: 640 })
    mockRect(footerBackdrop, { left: 260, top: 788, width: 1340, height: 112 })

    syncChatGptLayoutMarkers()

    expect(messageList.getAttribute(CHATGPT_LAYOUT_ATTRS.chatListSurface)).toBeNull()
    expect(document.getElementById('assistant-panel')?.getAttribute(CHATGPT_LAYOUT_ATTRS.assistantSurfaceNode)).toBe('true')
    expect(footerBackdrop.getAttribute(CHATGPT_LAYOUT_ATTRS.bottomWhiteBlockNode)).toBe('true')
  })
})
