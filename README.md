# ChatCanves

ChatCanves is a focused browser extension for [Gemini](https://gemini.google.com) that only keeps theme and background customization.

## What It Does

- Adds a floating launcher on the right side of the Gemini page
- Opens a slide-out theme panel without relying on a browser action popup
- Supports system, light, and dark appearance modes
- Supports custom accent color, visual color picking, and interface opacity
- Supports custom wallpaper, blur, sidebar readability scrim, and message glass effect
- Persists theme settings locally in the browser

## Current Product Scope

This repository is intentionally trimmed to the theme edition only.

Removed modules:

- Prompt entrance
- Quick follow-up
- Chat outline
- Chain prompt
- Popup surface
- What's new and badge flows
- Stuff page enhancements

## Local Development

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm compile
pnpm check:i18n
pnpm test:run
pnpm build
```

## Load In Chrome

1. Run `pnpm build`
2. Open `chrome://extensions`
3. Enable Developer mode
4. Click `Load unpacked`
5. Select `.output/chrome-mv3`

## Repository

- Source: [github.com/EwwwzhI/ChatCanves](https://github.com/EwwwzhI/ChatCanves)
- Issues: [github.com/EwwwzhI/ChatCanves/issues](https://github.com/EwwwzhI/ChatCanves/issues)
