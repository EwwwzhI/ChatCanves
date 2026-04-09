export interface ChatGptLayoutSelectors {
  wallpaperRootShell: string
  sidebarRoot: string
  sidebarTopActionArea: string
  newChatButton: string
  searchChatButton: string
  sidebarHistoryItem: string
  mainChatColumn: string
  chatListSurface: string
  assistantMessageOuter: string
  assistantSurfaceNode: string
  userBubbleNode: string
  composerShell: string
  composerInput: string
  sendButton: string
  bottomWhiteBlockNode: string
}

export const CHATGPT_LAYOUT_ATTRS = {
  wallpaperRootShell: 'data-ccv-chatgpt-wallpaper-root',
  sidebarRoot: 'data-ccv-chatgpt-sidebar-root',
  sidebarTopActionArea: 'data-ccv-chatgpt-sidebar-top',
  newChatButton: 'data-ccv-chatgpt-new-chat',
  searchChatButton: 'data-ccv-chatgpt-search-chat',
  sidebarHistoryItem: 'data-ccv-chatgpt-history-item',
  mainChatColumn: 'data-ccv-chatgpt-main-column',
  chatListSurface: 'data-ccv-chatgpt-chat-list-surface',
  assistantMessageOuter: 'data-ccv-chatgpt-assistant-outer',
  assistantSurfaceNode: 'data-ccv-chatgpt-assistant-surface',
  userBubbleNode: 'data-ccv-chatgpt-user-bubble',
  composerShell: 'data-ccv-chatgpt-composer-shell',
  composerInput: 'data-ccv-chatgpt-composer-input',
  sendButton: 'data-ccv-chatgpt-send-button',
  bottomWhiteBlockNode: 'data-ccv-chatgpt-bottom-block',
} as const

function markerSelector(attribute: string): string {
  return `[${attribute}="true"]`
}

export const CHATGPT_LAYOUT_SELECTORS: ChatGptLayoutSelectors = {
  wallpaperRootShell: markerSelector(CHATGPT_LAYOUT_ATTRS.wallpaperRootShell),
  sidebarRoot: markerSelector(CHATGPT_LAYOUT_ATTRS.sidebarRoot),
  sidebarTopActionArea: markerSelector(CHATGPT_LAYOUT_ATTRS.sidebarTopActionArea),
  newChatButton: markerSelector(CHATGPT_LAYOUT_ATTRS.newChatButton),
  searchChatButton: markerSelector(CHATGPT_LAYOUT_ATTRS.searchChatButton),
  sidebarHistoryItem: markerSelector(CHATGPT_LAYOUT_ATTRS.sidebarHistoryItem),
  mainChatColumn: markerSelector(CHATGPT_LAYOUT_ATTRS.mainChatColumn),
  chatListSurface: markerSelector(CHATGPT_LAYOUT_ATTRS.chatListSurface),
  assistantMessageOuter: markerSelector(CHATGPT_LAYOUT_ATTRS.assistantMessageOuter),
  assistantSurfaceNode: markerSelector(CHATGPT_LAYOUT_ATTRS.assistantSurfaceNode),
  userBubbleNode: markerSelector(CHATGPT_LAYOUT_ATTRS.userBubbleNode),
  composerShell: markerSelector(CHATGPT_LAYOUT_ATTRS.composerShell),
  composerInput: markerSelector(CHATGPT_LAYOUT_ATTRS.composerInput),
  sendButton: markerSelector(CHATGPT_LAYOUT_ATTRS.sendButton),
  bottomWhiteBlockNode: markerSelector(CHATGPT_LAYOUT_ATTRS.bottomWhiteBlockNode),
}

const BACKGROUND_TEMPLATE_TOKENS = {
  wallpaperRootShell: '__CCV_CHATGPT_WALLPAPER_ROOT__',
  sidebarRoot: '__CCV_CHATGPT_SIDEBAR_ROOT__',
  sidebarTopActionArea: '__CCV_CHATGPT_SIDEBAR_TOP__',
  newChatButton: '__CCV_CHATGPT_NEW_CHAT__',
  searchChatButton: '__CCV_CHATGPT_SEARCH_CHAT__',
  sidebarHistoryItem: '__CCV_CHATGPT_HISTORY_ITEM__',
  mainChatColumn: '__CCV_CHATGPT_MAIN_COLUMN__',
  chatListSurface: '__CCV_CHATGPT_CHAT_LIST_SURFACE__',
  assistantMessageOuter: '__CCV_CHATGPT_ASSISTANT_OUTER__',
  assistantSurfaceNode: '__CCV_CHATGPT_ASSISTANT_SURFACE__',
  userBubbleNode: '__CCV_CHATGPT_USER_BUBBLE__',
  composerShell: '__CCV_CHATGPT_COMPOSER_SHELL__',
  composerInput: '__CCV_CHATGPT_COMPOSER_INPUT__',
  sendButton: '__CCV_CHATGPT_SEND_BUTTON__',
  bottomWhiteBlockNode: '__CCV_CHATGPT_BOTTOM_BLOCK__',
} as const

export const CHATGPT_FORBIDDEN_BROAD_SELECTORS = [
  'body > div',
  'main > div',
  '[class*="bg-token-"]',
] as const

export function compileChatGptBackgroundCssTemplate(template: string): string {
  const replacements = Object.entries(BACKGROUND_TEMPLATE_TOKENS).map(([key, token]) => {
    const selectorKey = key as keyof ChatGptLayoutSelectors
    return [token, CHATGPT_LAYOUT_SELECTORS[selectorKey]] as const
  })

  return replacements.reduce(
    (css, [token, selector]) => css.split(token).join(selector),
    template,
  )
}

export const CHATGPT_THEME_CARRIER_CANDIDATE_SELECTORS = [
  CHATGPT_LAYOUT_SELECTORS.wallpaperRootShell,
  CHATGPT_LAYOUT_SELECTORS.mainChatColumn,
  CHATGPT_LAYOUT_SELECTORS.chatListSurface,
] as const
