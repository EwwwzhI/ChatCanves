import { chatGptThemeSiteAdapter } from './chatgpt'
import { deepSeekThemeSiteAdapter } from './deepseek'
import { geminiThemeSiteAdapter } from './gemini'
import type { ThemeSiteAdapter } from './types'

const THEME_SITE_ADAPTERS: ThemeSiteAdapter[] = [
  geminiThemeSiteAdapter,
  deepSeekThemeSiteAdapter,
  chatGptThemeSiteAdapter,
]

export function resolveThemeSiteAdapter(
  hostname: string,
): ThemeSiteAdapter | null {
  return THEME_SITE_ADAPTERS.find(adapter => adapter.matches(hostname)) ?? null
}

export function getThemeSiteAdapterByKey(
  siteKey: ThemeSiteAdapter['siteKey'],
): ThemeSiteAdapter {
  const adapter = THEME_SITE_ADAPTERS.find(
    candidate => candidate.siteKey === siteKey,
  )

  if (!adapter) {
    throw new Error(`Unknown theme site adapter: ${siteKey}`)
  }

  return adapter
}
