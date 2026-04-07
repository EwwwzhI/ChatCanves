# Contributing to ChatCanves

## Scope

This repository only accepts changes related to the current theme edition of ChatCanves.

In scope:

- Gemini appearance mode handling
- Custom interface accent and chat color controls
- Wallpaper rendering and persistence
- Theme panel UI and interaction
- i18n, tests, and build reliability for the theme edition

Out of scope:

- Prompt tools
- Quick follow-up
- Chat outline
- Chain prompt
- Popup-only entrypoints

## Development Flow

1. Install dependencies with `pnpm install`
2. Make changes against `main`
3. Run `pnpm compile`
4. Run `pnpm build`
5. If locale keys changed, run `pnpm check:i18n`
6. Open a pull request with a clear summary and verification notes

## Issues

Please use the current repository issue tracker:

- [github.com/EwwwzhI/ChatCanves/issues](https://github.com/EwwwzhI/ChatCanves/issues)
