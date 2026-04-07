# Setting Panel Component

Theme-only settings UI for Gemini.

## Current Behavior

- Renders a floating launcher on the right side of the page.
- Clicking the launcher opens a slide-out panel from the right.
- The panel contains a single theme settings view.
- Theme state changes emit `settings:state-changed` for components that need to react to open/close state.

## Included Features

- Appearance mode: light, dark, system
- Preset theme colors
- Custom accent color
- Interface opacity control
- Custom background image and related visual options

## Usage

```tsx
import { SettingPanel } from './components/setting-panel'

function App() {
  return <SettingPanel />
}
```

The panel manages its own open/close state. No external open event is required.

## Notes

- The component is intended to be mounted in the Gemini content overlay.
- Visual styling depends on the theme palette variables provided by the overlay provider.
- The panel no longer includes sidebar navigation, multi-page routing, popup integration, or prompt/tool modules.
