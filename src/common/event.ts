export const GEM_EXT_EVENTS = {
  THEME_APPEARANCE_APPLY: 'gem-ext:theme-appearance-apply',
} as const

export interface AppEvents {
  'settings:state-changed': {
    open: boolean
  };
}
