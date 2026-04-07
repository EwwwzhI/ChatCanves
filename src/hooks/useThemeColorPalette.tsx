"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Global } from "@emotion/react"
import { system } from "@/components/ui/system"
import {
  CUSTOM_THEME_KEY,
  DEFAULT_CUSTOM_THEME_SETTINGS,
  getCustomThemeSettings,
  getThemeCustomSettingsStorage,
  getThemeKeyStorage,
  getReadableTextColor,
  getThemeKey,
  hexToRgbaString,
  themePresets,
  type CustomThemeSettings,
} from "@/entrypoints/content/gemini-theme"

const ColorPaletteContext = createContext<{
  palette: string
  selectedThemeKey: string
  accentColor: string
  accentContrastColor: string
  customTheme: CustomThemeSettings
  setSelectedThemeKey: (key: string) => void
  setCustomTheme: (settings: CustomThemeSettings) => void
}>({
  palette: "blue",
  selectedThemeKey: "blue",
  accentColor: "#4285f4",
  accentContrastColor: "#ffffff",
  customTheme: DEFAULT_CUSTOM_THEME_SETTINGS,
  setSelectedThemeKey: () => { },
  setCustomTheme: () => { },
})

export function useColorPalette() {
  return useContext(ColorPaletteContext)
}

export function ColorPaletteProvider({ children }: { children: React.ReactNode }) {
  const [selectedThemeKey, setSelectedThemeKey] = useState("blue")
  const [customTheme, setCustomTheme] = useState<CustomThemeSettings>(
    DEFAULT_CUSTOM_THEME_SETTINGS,
  )

  useEffect(() => {
    const themeKeyStorage = getThemeKeyStorage()
    const themeCustomSettingsStorage = getThemeCustomSettingsStorage()

    void getThemeKey().then((key) => {
      setSelectedThemeKey(key || 'blue')
    })
    void getCustomThemeSettings().then((settings) => {
      setCustomTheme(settings)
    })

    const unwatchThemeKey = themeKeyStorage.watch((newKey) => {
      setSelectedThemeKey(newKey || 'blue')
    })
    const unwatchCustomTheme = themeCustomSettingsStorage.watch((newSettings) => {
      if (!newSettings) return
      setCustomTheme(newSettings)
    })

    return () => {
      unwatchThemeKey()
      unwatchCustomTheme()
    }
  }, [])

  const palette = selectedThemeKey === CUSTOM_THEME_KEY
    ? 'blue'
    : selectedThemeKey

  const accentColor = selectedThemeKey === CUSTOM_THEME_KEY
    ? customTheme.accentColor
    : themePresets.find((preset) => preset.key === selectedThemeKey)?.primary ?? '#4285f4'
  const accentContrastColor = getReadableTextColor(accentColor)

  return (
    <ColorPaletteContext.Provider
      value={{
        palette,
        selectedThemeKey,
        accentColor,
        accentContrastColor,
        customTheme,
        setSelectedThemeKey,
        setCustomTheme,
      }}
    >
      <Global
        styles={{
          ":host": {
            ...(system.css({ colorPalette: palette }) as any),
            "--gpk-panel-accent": accentColor,
            "--gpk-panel-accent-contrast": accentContrastColor,
            "--gpk-panel-accent-soft": hexToRgbaString(accentColor, 0.14),
            "--gpk-panel-accent-border": hexToRgbaString(accentColor, 0.32),
            "--gpk-panel-accent-strong": hexToRgbaString(accentColor, 0.52),
            "--gpk-panel-surface-color": customTheme.surfaceColor,
            "--gpk-panel-surface-soft": hexToRgbaString(customTheme.surfaceColor, 0.18),
            "--gpk-panel-surface-border": hexToRgbaString(customTheme.surfaceColor, 0.28),
            "--gpk-panel-text-color": customTheme.textColor,
          },
        }}
      />
      {children}
    </ColorPaletteContext.Provider>
  )
}
