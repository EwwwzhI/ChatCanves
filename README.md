# ChatCanves

[English](./README.md) | [简体中文](./README.zh-CN.md)

ChatCanves is a focused browser extension for [Gemini](https://gemini.google.com) and [DeepSeek](https://chat.deepseek.com) that keeps only theme and background customization.

Current version: `0.2.0`

## Features

- Supports both Gemini and DeepSeek web chat
- Opens from a floating launcher on the right side of the page
- Uses a slide-out theme panel instead of a browser action popup
- Supports system, light, and dark appearance modes
- Supports custom interface accent, chat surface color, and chat text color
- Supports custom wallpaper upload, blur, sidebar readability scrim, and message glass
- Stores theme settings locally and keeps Gemini and DeepSeek settings separate

## Install From Release

If you only want to use the extension, use the packaged release:

1. Open the repository `Releases` page
2. Download the zip asset for the version you want
3. Extract it locally
4. Open `chrome://extensions`
5. Enable `Developer mode`
6. Click `Load unpacked`
7. Select the extracted extension directory

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
3. Enable `Developer mode`
4. Click `Load unpacked`
5. Select `.output/chrome-mv3`

## Notes

- ChatCanves is currently built for `gemini.google.com` and `chat.deepseek.com`
- Theme settings are stored per site, so changes on Gemini do not overwrite DeepSeek
- Wallpaper assets are stored locally in the browser

## Repository

- Source: [github.com/EwwwzhI/ChatCanves](https://github.com/EwwwzhI/ChatCanves)
- Issues: [github.com/EwwwzhI/ChatCanves/issues](https://github.com/EwwwzhI/ChatCanves/issues)
