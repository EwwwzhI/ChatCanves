export type SiteKey = 'gemini' | 'deepseek' | 'chatgpt'

export interface SiteCapabilities {
  backgroundImage: boolean
  blur: boolean
  messageGlass: boolean
  sidebarScrim: boolean
  welcomeGreetingReadability: boolean
}

export interface SiteContext {
  siteKey: SiteKey
  displayName: string
  hostname: string
  capabilities: SiteCapabilities
}
