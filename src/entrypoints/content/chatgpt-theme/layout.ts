import { syncChatGptThemeBackgroundHost } from './background/styleController'
import { CHATGPT_LAYOUT_ATTRS } from './selectors'

type MarkerKey = keyof typeof CHATGPT_LAYOUT_ATTRS

const MESSAGE_CONTENT_SELECTOR = [
  'p',
  'pre',
  'table',
  'ul',
  'ol',
  'li',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'code',
  'figure',
  'img',
].join(', ')

const INTERACTIVE_SELECTOR = 'button, a, [role="button"]'
const THEME_RELEVANT_ATTRIBUTES = ['class', 'data-testid', 'aria-label', 'hidden']
const NEW_CHAT_PATTERNS = [
  /new chat/i,
  /new conversation/i,
  /\u65b0\u804a\u5929/,
  /\u65b0\u5bf9\u8bdd/,
]
const SEARCH_CHAT_PATTERNS = [
  /search/i,
  /\u641c\u7d22\u804a\u5929/,
  /\u641c\u7d22/,
]

let observer: MutationObserver | null = null
let syncScheduled = false
let resizeListenerRegistered = false

function clearChatGptLayoutMarkers(): void {
  Object.values(CHATGPT_LAYOUT_ATTRS).forEach((attribute) => {
    document.querySelectorAll(`[${attribute}]`).forEach((element) => {
      element.removeAttribute(attribute)
    })
  })
}

function markElement(
  element: Element | null | undefined,
  key: MarkerKey,
): void {
  if (!(element instanceof HTMLElement)) return
  element.setAttribute(CHATGPT_LAYOUT_ATTRS[key], 'true')
}

function markElements(
  elements: Iterable<Element | null | undefined>,
  key: MarkerKey,
): void {
  const seen = new Set<Element>()
  for (const element of elements) {
    if (!(element instanceof HTMLElement) || seen.has(element)) continue
    seen.add(element)
    markElement(element, key)
  }
}

function getRect(element: Element): DOMRect {
  return element.getBoundingClientRect()
}

function getRectArea(rect: Pick<DOMRect, 'width' | 'height'>): number {
  return Math.max(rect.width, 0) * Math.max(rect.height, 0)
}

function isVisibleElement(
  element: Element | null | undefined,
): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false
  const rect = getRect(element)
  return rect.width > 0 && rect.height > 0
}

function isTransparentColor(color: string): boolean {
  const normalized = color.trim().toLowerCase()
  return normalized === ''
    || normalized === 'transparent'
    || normalized === 'rgba(0, 0, 0, 0)'
    || normalized === 'rgb(0 0 0 / 0%)'
}

function hasMeaningfulText(element: Element): boolean {
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim().length > 0
}

function normalizeLabel(element: Element): string {
  const ariaLabel = element.getAttribute('aria-label') ?? ''
  const text = element.textContent ?? ''
  return `${ariaLabel} ${text}`.replace(/\s+/g, ' ').trim().toLowerCase()
}

function matchesPattern(
  element: Element,
  patterns: readonly RegExp[],
): boolean {
  const label = normalizeLabel(element)
  return patterns.some((pattern) => pattern.test(label))
}

function getAncestorChain(element: Element): HTMLElement[] {
  const chain: HTMLElement[] = []
  let current: Element | null = element
  while (current instanceof HTMLElement) {
    chain.push(current)
    current = current.parentElement
  }
  return chain
}

function findLowestCommonAncestor(
  elements: Array<Element | null | undefined>,
): HTMLElement | null {
  const nodes = elements.filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  )
  if (nodes.length === 0) return null

  const [first, ...rest] = nodes
  const firstAncestors = getAncestorChain(first)
  return firstAncestors.find((candidate) => {
    return rest.every((node) => candidate.contains(node))
  }) ?? null
}

function findFirstBodyChildContaining(
  elements: Array<Element | null | undefined>,
): HTMLElement | null {
  if (!document.body) return null
  const nodes = elements.filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  )
  if (nodes.length === 0) return null

  return (
    Array.from(document.body.children).find((candidate) => {
      return candidate instanceof HTMLElement
        && nodes.every((node) => candidate.contains(node))
    }) as HTMLElement | null
  )
}

function getVisibleChildren(
  element: Element | null | undefined,
): HTMLElement[] {
  if (!(element instanceof HTMLElement)) return []
  return Array.from(element.children).filter(isVisibleElement)
}

function getUnionRect(
  elements: readonly HTMLElement[],
): DOMRect | null {
  if (elements.length === 0) return null

  const rects = elements
    .map((element) => getRect(element))
    .filter((rect) => rect.width > 0 && rect.height > 0)

  if (rects.length === 0) return null

  const left = Math.min(...rects.map((rect) => rect.left))
  const top = Math.min(...rects.map((rect) => rect.top))
  const right = Math.max(...rects.map((rect) => rect.right))
  const bottom = Math.max(...rects.map((rect) => rect.bottom))

  return {
    x: left,
    y: top,
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
    toJSON: () => ({}),
  } as DOMRect
}

function getContentAnchors(root: HTMLElement): HTMLElement[] {
  const explicitAnchors = Array.from(
    root.querySelectorAll<HTMLElement>(MESSAGE_CONTENT_SELECTOR),
  ).filter(isVisibleElement)
  if (explicitAnchors.length > 0) {
    return explicitAnchors
  }

  const anchors: HTMLElement[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const current = walker.currentNode
    if (!current.textContent?.trim()) continue
    const parent = current.parentElement
    if (isVisibleElement(parent)) {
      anchors.push(parent)
    }
  }

  return Array.from(new Set(anchors))
}

function getPathWithinBoundary(
  start: HTMLElement,
  boundary: HTMLElement,
): HTMLElement[] {
  const path: HTMLElement[] = []
  let current: HTMLElement | null = start
  while (current && current !== boundary) {
    path.push(current)
    current = current.parentElement
  }
  return path
}

function hasDecoratedSurface(element: HTMLElement): boolean {
  const style = getComputedStyle(element)
  const radius = Number.parseFloat(style.borderTopLeftRadius) || 0
  return radius >= 12 || !isTransparentColor(style.backgroundColor)
}

function findFirstVisibleChildContaining(
  root: HTMLElement,
  anchor: HTMLElement | null,
): HTMLElement | null {
  if (!anchor) return null
  return getVisibleChildren(root).find((child) => child.contains(anchor)) ?? null
}

function findFirstVisibleChildContainingAll(
  root: HTMLElement,
  anchors: readonly HTMLElement[],
): HTMLElement | null {
  if (anchors.length === 0) return null
  return getVisibleChildren(root).find((child) => {
    return anchors.every((anchor) => child.contains(anchor))
  }) ?? null
}

function resolveContentAnchorGroup(root: HTMLElement): {
  anchors: HTMLElement[]
  commonAnchor: HTMLElement | null
  directChild: HTMLElement | null
} {
  const anchors = getContentAnchors(root)
  const commonAnchor = anchors.length > 0
    ? findLowestCommonAncestor(anchors) ?? anchors[0]
    : null
  const directChild = findFirstVisibleChildContainingAll(root, anchors)
    ?? findFirstVisibleChildContaining(root, commonAnchor)
    ?? getVisibleChildren(root)[0]
    ?? null

  return {
    anchors,
    commonAnchor,
    directChild,
  }
}

function resolveUserBubbleNode(root: HTMLElement): HTMLElement | null {
  const {
    commonAnchor,
    directChild,
  } = resolveContentAnchorGroup(root)
  if (!commonAnchor || !directChild) {
    return findFirstVisibleChildContaining(
      root,
      root.firstElementChild as HTMLElement | null,
    )
  }

  const scopeWidth = getRect(directChild).width
  const candidates = [
    ...getPathWithinBoundary(commonAnchor, directChild).filter(isVisibleElement),
    directChild,
  ]

  const decorated = candidates.find((candidate) => {
    const width = getRect(candidate).width
    if (width <= 0 || scopeWidth <= 0) return false
    return width < scopeWidth * 0.96 && hasDecoratedSurface(candidate)
  })
  if (decorated) return decorated

  const narrower = candidates.find((candidate) => {
    const width = getRect(candidate).width
    return width > 0 && scopeWidth > 0 && width < scopeWidth * 0.96
  })
  if (narrower) return narrower

  return directChild
}

function resolveAssistantSurfaceNode(root: HTMLElement): HTMLElement | null {
  const {
    commonAnchor,
    directChild,
  } = resolveContentAnchorGroup(root)

  if (!commonAnchor || !directChild) {
    return findFirstVisibleChildContaining(
      root,
      root.firstElementChild as HTMLElement | null,
    )
  }

  const rootRect = getRect(root)
  const candidates = [
    directChild,
    ...getPathWithinBoundary(commonAnchor, directChild).filter(isVisibleElement),
  ]

  const viable = candidates.filter((candidate) => {
    const rect = getRect(candidate)
    if (rect.width <= 0 || rect.height <= 0) return false
    const widthRatio = rootRect.width > 0 ? rect.width / rootRect.width : 0
    return widthRatio >= 0.58 && widthRatio <= 1.02
  })

  const decorated = viable.find((candidate) => hasDecoratedSurface(candidate))
  if (decorated) return decorated

  return viable[0] ?? directChild
}

function resolveChatListSurface(
  mainColumn: HTMLElement | null,
  messageRoots: readonly HTMLElement[],
  composerShell: HTMLElement | null,
): HTMLElement | null {
  if (!mainColumn) return null
  if (messageRoots.length === 0) return null

  const contentRect = getUnionRect(messageRoots)
  if (!contentRect) return null

  const directChild = findFirstVisibleChildContainingAll(mainColumn, messageRoots)
  const candidates = new Set<HTMLElement>()
  if (directChild && directChild !== mainColumn) {
    candidates.add(directChild)
  }

  const sharedContainer = findLowestCommonAncestor([...messageRoots])
  if (
    sharedContainer
    && sharedContainer !== mainColumn
    && mainColumn.contains(sharedContainer)
  ) {
    let current: HTMLElement | null = sharedContainer
    while (current && current !== mainColumn) {
      if (isVisibleElement(current)) {
        candidates.add(current)
      }
      current = current.parentElement
    }
  }

  const composerTop = composerShell
    ? getRect(composerShell).top
    : Number.POSITIVE_INFINITY

  return Array.from(candidates)
    .sort((left, right) => {
      return getRectArea(getRect(left)) - getRectArea(getRect(right))
    })
    .find((candidate) => {
      const rect = getRect(candidate)
      if (rect.width <= 0 || rect.height <= 0) return false

      const verticalSlack = Math.max(0, contentRect.top - rect.top)
        + Math.max(0, rect.bottom - contentRect.bottom)
      const horizontalSlack = Math.max(0, contentRect.left - rect.left)
        + Math.max(0, rect.right - contentRect.right)
      const maxVerticalSlack = Math.max(80, contentRect.height * 0.32)
      const maxHorizontalSlack = Math.max(96, contentRect.width * 0.14)

      if (verticalSlack > maxVerticalSlack) return false
      if (horizontalSlack > maxHorizontalSlack) return false
      if (rect.bottom > composerTop - 16) return false
      return true
    }) ?? null
}

function resolveMainChatColumn(
  main: HTMLElement | null,
  composerShell: HTMLElement | null,
  messageRoots: HTMLElement[],
): HTMLElement | null {
  const anchors = [composerShell, messageRoots[0], messageRoots.at(-1) ?? null]
  const lca = findLowestCommonAncestor(anchors)
  if (lca && lca !== document.body && lca !== document.documentElement) {
    return lca
  }
  return main
}

function resolveWallpaperRootShell(
  sidebar: HTMLElement | null,
  mainColumn: HTMLElement | null,
  composerShell: HTMLElement | null,
): HTMLElement | null {
  const lca = findLowestCommonAncestor([sidebar, mainColumn, composerShell])
  if (!lca) return null
  if (lca === document.body || lca === document.documentElement) {
    return findFirstBodyChildContaining([sidebar, mainColumn, composerShell]) ?? document.body
  }
  return lca
}

function findVisibleClickableCandidates(sidebar: HTMLElement): HTMLElement[] {
  return Array.from(sidebar.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR))
    .filter(isVisibleElement)
    .filter((element) => hasMeaningfulText(element))
    .sort((left, right) => {
      const leftRect = getRect(left)
      const rightRect = getRect(right)
      if (Math.abs(leftRect.top - rightRect.top) > 4) {
        return leftRect.top - rightRect.top
      }
      return leftRect.left - rightRect.left
    })
}

function findSidebarActionByPattern(
  sidebar: HTMLElement,
  patterns: readonly RegExp[],
): HTMLElement | null {
  return findVisibleClickableCandidates(sidebar).find((element) => {
    return matchesPattern(element, patterns)
  }) ?? null
}

function resolveSidebarTopActionNodes(sidebar: HTMLElement): {
  newChatButton: HTMLElement | null
  searchChatButton: HTMLElement | null
  topActionArea: HTMLElement | null
} {
  let newChatButton = findSidebarActionByPattern(sidebar, NEW_CHAT_PATTERNS)
  let searchChatButton = findSidebarActionByPattern(sidebar, SEARCH_CHAT_PATTERNS)

  const sidebarTop = getRect(sidebar).top
  const topCandidates = findVisibleClickableCandidates(sidebar).filter((candidate) => {
    return getRect(candidate).top - sidebarTop < 260
  })

  if (!newChatButton) {
    newChatButton = topCandidates[0] ?? null
  }
  if (!searchChatButton) {
    searchChatButton = topCandidates.find((candidate) => candidate !== newChatButton) ?? null
  }

  const topActionArea = findLowestCommonAncestor([newChatButton, searchChatButton])

  return {
    newChatButton,
    searchChatButton,
    topActionArea,
  }
}

function resolveSidebarHistoryItems(
  sidebar: HTMLElement,
  excludedNodes: Array<HTMLElement | null>,
): HTMLElement[] {
  const excluded = new Set(
    excludedNodes.filter((node): node is HTMLElement => node instanceof HTMLElement),
  )

  const conversationLinks = Array.from(
    sidebar.querySelectorAll<HTMLElement>('a[href^="/c/"], button[data-testid^="history-item"]'),
  ).filter(isVisibleElement)

  if (conversationLinks.length > 0) {
    return conversationLinks.filter((node) => !excluded.has(node))
  }

  const nav = sidebar.querySelector('nav')
  if (!nav) return []

  return Array.from(nav.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR))
    .filter(isVisibleElement)
    .filter((node) => !excluded.has(node))
}

function looksLikeOpaqueBackdrop(element: HTMLElement): boolean {
  const rect = getRect(element)
  if (rect.width <= 0 || rect.height <= 0) return false

  const style = getComputedStyle(element)
  return !isTransparentColor(style.backgroundColor)
    || style.backdropFilter !== 'none'
    || style.boxShadow !== 'none'
}

function hasComposerShellFrame(element: HTMLElement): boolean {
  const rect = getRect(element)
  if (rect.width <= 0 || rect.height <= 0) return false

  const style = getComputedStyle(element)
  const radius = Number.parseFloat(style.borderTopLeftRadius) || 0
  const borderWidth = Number.parseFloat(style.borderTopWidth) || 0
  return radius >= 18
    || borderWidth > 0
    || !isTransparentColor(style.backgroundColor)
    || style.boxShadow !== 'none'
    || style.backdropFilter !== 'none'
}

function resolveComposerShellNode(
  composerInput: HTMLElement | null,
  boundary: HTMLElement | null,
): HTMLElement | null {
  if (!composerInput) return null

  const inputRect = getRect(composerInput)
  const candidates: HTMLElement[] = []
  let current = composerInput.parentElement
  while (current && current !== boundary) {
    if (isVisibleElement(current)) {
      candidates.push(current)
    }
    current = current.parentElement
  }

  const roundedShellCandidates = candidates.filter((candidate) => {
    const rect = getRect(candidate)
    const radius = Number.parseFloat(getComputedStyle(candidate).borderTopLeftRadius) || 0
    return rect.width >= inputRect.width * 1.05
      && rect.height >= Math.max(inputRect.height * 1.5, 48)
      && radius >= 18
  })
  if (roundedShellCandidates.length > 0) {
    return roundedShellCandidates.at(-1) ?? null
  }

  const shellCandidates = candidates.filter((candidate) => {
    const rect = getRect(candidate)
    return rect.width >= inputRect.width * 1.05
      && rect.height >= Math.max(inputRect.height * 1.5, 48)
      && hasComposerShellFrame(candidate)
  })
  if (shellCandidates.length > 0) {
    return shellCandidates[0] ?? null
  }

  const decoratedCandidates = candidates.filter((candidate) => {
    const rect = getRect(candidate)
    return rect.width >= inputRect.width * 1.05
      && rect.height >= Math.max(inputRect.height * 1.5, 48)
      && looksLikeOpaqueBackdrop(candidate)
  })
  if (decoratedCandidates.length > 0) {
    return decoratedCandidates.at(-1) ?? null
  }

  return composerInput.closest('form')
}

function resolveBottomBlockNodes(
  composerShell: HTMLElement | null,
  mainColumn: HTMLElement | null,
  wallpaperRootShell: HTMLElement | null,
): HTMLElement[] {
  if (!composerShell || !mainColumn) return []

  const nodes = new Set<HTMLElement>()
  let current = composerShell.parentElement
  while (current && current !== mainColumn) {
    if (looksLikeOpaqueBackdrop(current)) {
      nodes.add(current)
    }
    current = current.parentElement
  }

  const composerRect = getRect(composerShell)
  const mainRect = getRect(mainColumn)
  const bandTop = composerRect.top - 40
  const bandBottom = mainRect.bottom + 8
  const minimumWidth = Math.min(mainRect.width * 0.72, composerRect.width * 0.92)

  Array.from(
    mainColumn.querySelectorAll<HTMLElement>('div, section, footer, form'),
  )
    .filter((candidate) => candidate !== composerShell)
    .filter(isVisibleElement)
    .filter((candidate) => !composerShell.contains(candidate))
    .filter(looksLikeOpaqueBackdrop)
    .forEach((candidate) => {
      const rect = getRect(candidate)
      const overlapsBottomBand = rect.bottom >= bandTop && rect.top <= bandBottom
      const isWideEnough = rect.width >= minimumWidth
      const isRelevantHeight = rect.height >= 28
      const spansComposerRegion = rect.bottom >= composerRect.top - 16
        && rect.top <= composerRect.bottom + 48
      const reachesColumnBottom = rect.bottom >= mainRect.bottom - 12

      if (
        overlapsBottomBand
        && isWideEnough
        && isRelevantHeight
        && (spansComposerRegion || reachesColumnBottom)
      ) {
        nodes.add(candidate)
      }
    })

  const bottomScope = wallpaperRootShell instanceof HTMLElement
    ? wallpaperRootShell
    : mainColumn.parentElement

  if (bottomScope instanceof HTMLElement) {
    Array.from(
      bottomScope.querySelectorAll<HTMLElement>('div, section, footer, form, main'),
    )
      .filter((candidate) => candidate !== mainColumn && candidate !== composerShell)
      .filter(isVisibleElement)
      .filter(looksLikeOpaqueBackdrop)
      .forEach((candidate) => {
        const rect = getRect(candidate)
        const overlapsBottomBand = rect.bottom >= bandTop && rect.top <= bandBottom
        const isWideEnough = rect.width >= mainRect.width * 0.82
        const sitsBelowChat = rect.bottom >= composerRect.top
        const reachesBottom = rect.bottom >= mainRect.bottom - 12

        if (overlapsBottomBand && isWideEnough && sitsBelowChat && reachesBottom) {
          nodes.add(candidate)
        }
      })
  }

  return Array.from(nodes)
}

function resolveSendButton(composerShell: HTMLElement | null): HTMLElement | null {
  if (!composerShell) return null

  return composerShell.querySelector<HTMLElement>(
    'button[data-testid="send-button"], button[aria-label*="send" i]',
  )
}

function collectMessageRoots(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-message-author-role]'),
  ).filter(isVisibleElement)
}

function applyChatGptLayoutMarkers(): void {
  clearChatGptLayoutMarkers()

  const sidebar = document.querySelector('aside')
  const main = document.querySelector('main')
  const composerInput = document.getElementById('prompt-textarea')
  const composerForm = composerInput?.closest('form') ?? null
  const messageRoots = collectMessageRoots()
  const initialMainColumn = resolveMainChatColumn(main, composerForm, messageRoots)
  const composerShell = resolveComposerShellNode(composerInput, initialMainColumn)
  const mainColumn = resolveMainChatColumn(
    main,
    composerShell ?? composerForm,
    messageRoots,
  )
  const chatListSurface = resolveChatListSurface(
    mainColumn,
    messageRoots,
    composerShell ?? composerForm,
  )
  const wallpaperRootShell = resolveWallpaperRootShell(
    sidebar,
    mainColumn,
    composerShell ?? composerForm,
  )

  markElement(wallpaperRootShell, 'wallpaperRootShell')
  markElement(sidebar, 'sidebarRoot')
  markElement(mainColumn, 'mainChatColumn')
  markElement(chatListSurface, 'chatListSurface')
  markElement(composerShell ?? composerForm, 'composerShell')
  markElement(composerInput, 'composerInput')
  markElement(resolveSendButton(composerShell ?? composerForm), 'sendButton')

  if (sidebar instanceof HTMLElement) {
    const { newChatButton, searchChatButton, topActionArea } =
      resolveSidebarTopActionNodes(sidebar)
    markElement(topActionArea, 'sidebarTopActionArea')
    markElement(newChatButton, 'newChatButton')
    markElement(searchChatButton, 'searchChatButton')
    markElements(
      resolveSidebarHistoryItems(sidebar, [newChatButton, searchChatButton]),
      'sidebarHistoryItem',
    )
  }

  messageRoots.forEach((root) => {
    const role = root.getAttribute('data-message-author-role')
    if (role === 'assistant') {
      markElement(root, 'assistantMessageOuter')
      markElement(resolveAssistantSurfaceNode(root), 'assistantSurfaceNode')
      return
    }
    if (role === 'user') {
      markElement(resolveUserBubbleNode(root), 'userBubbleNode')
    }
  })

  markElements(
    resolveBottomBlockNodes(
      composerShell ?? composerForm,
      mainColumn,
      wallpaperRootShell,
    ),
    'bottomWhiteBlockNode',
  )
}

function queueLayoutSync(): void {
  if (syncScheduled) return
  syncScheduled = true

  requestAnimationFrame(() => {
    syncScheduled = false
    applyChatGptLayoutMarkers()
    syncChatGptThemeBackgroundHost()
  })
}

export function syncChatGptLayoutMarkers(): void {
  applyChatGptLayoutMarkers()
  syncChatGptThemeBackgroundHost()
}

export function initChatGptLayoutSync(): void {
  if (typeof document === 'undefined' || !document.body) return

  syncChatGptLayoutMarkers()

  if (!observer) {
    observer = new MutationObserver((mutations) => {
      const hasRelevantMutation = mutations.some((mutation) => {
        if (mutation.type === 'childList') {
          return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0
        }
        return mutation.type === 'attributes'
      })
      if (hasRelevantMutation) {
        queueLayoutSync()
      }
    })
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: THEME_RELEVANT_ATTRIBUTES,
    })
  }

  if (!resizeListenerRegistered) {
    window.addEventListener('resize', queueLayoutSync)
    resizeListenerRegistered = true
  }
}

export function __resetChatGptLayoutSyncForTests(): void {
  observer?.disconnect()
  observer = null
  syncScheduled = false

  if (resizeListenerRegistered) {
    window.removeEventListener('resize', queueLayoutSync)
    resizeListenerRegistered = false
  }

  if (typeof document !== 'undefined') {
    clearChatGptLayoutMarkers()
  }
}
