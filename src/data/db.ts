import Dexie, { type Table } from 'dexie'
import type { ThemeAssetRow } from '@/entrypoints/content/gemini-theme/background/types'

export class ThemeExtensionDB extends Dexie {
  theme_assets!: Table<ThemeAssetRow, string>

  constructor() {
    super('gemini_extension')
    this.version(1).stores({
      chain_prompts: 'id, name, createdAt, updatedAt',
    })
    this.version(2)
      .stores({
        chain_prompts: 'id, name, createdAt, updatedAt',
        quick_follow_prompts: 'id, updatedAt',
        quick_follow_settings: 'id',
      })
      .upgrade(() => {
        // no-op: existing installations do not require data migration
      })
    this.version(3)
      .stores({
        chain_prompts: 'id, name, createdAt, updatedAt',
        quick_follow_prompts: 'id, updatedAt',
        quick_follow_settings: 'id',
        theme_assets: 'id, feature, updatedAt',
      })
      .upgrade(() => {
        // no-op: existing installations do not require data migration
      })
    this.version(4).stores({
      chain_prompts: null,
      quick_follow_prompts: null,
      quick_follow_settings: null,
      theme_assets: 'id, feature, updatedAt',
    })
    this.version(5)
      .stores({
        chain_prompts: null,
        quick_follow_prompts: null,
        quick_follow_settings: null,
        theme_assets: 'id, site, feature, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx.table<ThemeAssetRow, string>('theme_assets').toCollection().modify((row) => {
          if (!row.site) {
            row.site = 'gemini'
          }
        })
      })
  }
}

export const db = new ThemeExtensionDB()
