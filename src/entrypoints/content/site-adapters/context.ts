import type { SiteContext, SiteKey } from '@/common/site'

const DEFAULT_GEMINI_CONTEXT: SiteContext = {
  siteKey: 'gemini',
  displayName: 'Gemini',
  hostname: 'gemini.google.com',
  capabilities: {
    backgroundImage: true,
    blur: true,
    messageGlass: true,
    sidebarScrim: true,
    welcomeGreetingReadability: true,
  },
}

let activeSiteContext: SiteContext = DEFAULT_GEMINI_CONTEXT

export function inferSiteKeyFromHostname(hostname: string): SiteKey {
  if (hostname === 'chatgpt.com') {
    return 'chatgpt'
  }

  if (hostname === 'chat.deepseek.com') {
    return 'deepseek'
  }

  return 'gemini'
}

export function setActiveSiteContext(siteContext: SiteContext): SiteContext {
  activeSiteContext = siteContext

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-ccv-site', siteContext.siteKey)
  }

  return activeSiteContext
}

export function getActiveSiteContext(): SiteContext {
  return activeSiteContext
}

export function getActiveSiteKey(): SiteKey {
  if (activeSiteContext) {
    return activeSiteContext.siteKey
  }

  if (typeof window !== 'undefined') {
    return inferSiteKeyFromHostname(window.location.hostname)
  }

  return 'gemini'
}
