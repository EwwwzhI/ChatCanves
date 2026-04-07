# ChatCanves

[English](./README.md) | [简体中文](./README.zh-CN.md)

ChatCanves is a focused browser extension for [Gemini](https://gemini.google.com) that only keeps theme and background customization.

## What It Does

- Adds a floating launcher on the right side of the Gemini page
- Opens a slide-out theme panel without relying on a browser action popup
- Supports system, light, and dark appearance modes
- Supports custom interface accent, chat surface color, and chat text color controls
- Supports custom wallpaper, blur, sidebar readability scrim, and message glass effect
- Persists theme settings locally in the browser

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

## Release Usage

If you only want to use the extension, you do not need to run `pnpm install`.

Use the GitHub Release instead:

1. Open the repository `Releases` page
2. Download the attached zip asset for the version you want
3. Extract the zip locally
4. Open `chrome://extensions`
5. Enable Developer mode
6. Click `Load unpacked`
7. Select the extracted extension directory

## Repository

- Source: [github.com/EwwwzhI/ChatCanves](https://github.com/EwwwzhI/ChatCanves)
- Issues: [github.com/EwwwzhI/ChatCanves/issues](https://github.com/EwwwzhI/ChatCanves/issues)
