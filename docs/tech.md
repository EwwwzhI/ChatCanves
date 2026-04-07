# ChatCanves Technical Overview

## Product Definition

ChatCanves is a Gemini theme extension focused on visual customization only.

Primary capabilities:

- Appearance mode sync
- Custom accent color
- Custom interface accent, chat surface, and text colors
- Wallpaper upload and persistence
- Background readability controls
- In-page slide-out settings panel

## Runtime Structure

- `src/entrypoints/content/index.tsx`
  Boots the Gemini content script, initializes i18n cache, theme sync bridge, theme state, and overlay UI.
- `src/entrypoints/content/gemini-theme`
  Owns theme storage, CSS generation, wallpaper state, and cross-tab sync behavior.
- `src/components/setting-panel`
  Renders the floating launcher and the right-side slide-out theme panel.
- `src/components/setting-panel/views/theme`
  Contains the appearance selector, custom color editor, wallpaper controls, and live preview.

## Data Model

- Browser storage keeps appearance and theme settings
- IndexedDB keeps local wallpaper assets
- Theme asset data is intentionally local-only

## Non-Goals

The repository no longer contains active product support for:

- Prompt entry tools
- Quick follow-up
- Chat outline
- Chain prompt
- Popup-driven settings surfaces
- Release badge or what's-new UI
