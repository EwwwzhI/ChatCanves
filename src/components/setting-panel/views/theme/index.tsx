import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import {
  applyCustomTheme,
  getCustomThemeSettings,
  getCurrentSiteContext,
  getAppearanceState,
  DEFAULT_THEME_BACKGROUND_SETTINGS,
  getThemeBackgroundSettings,
  getThemeBackgroundSettingsStorage,
  normalizeThemeBackgroundSettings,
  removeThemeBackground,
  resolveThemeBackgroundPreviewUrl,
  setAppearanceMode,
  subscribeSystemThemeChange,
  ThemeBackgroundError,
  updateThemeBackgroundSettings,
  uploadThemeBackground,
  type AppearanceMode,
  type AppearanceState,
  type ThemeBackgroundResolvedState,
  type ThemeBackgroundSettings,
  type WelcomeGreetingReadabilityMode,
} from '@/entrypoints/content/gemini-theme'
import { useEvent } from '@/hooks/useEventBus'
import { AppearanceSelector } from './AppearanceSelector'
import { ColorPresets } from './ColorPresets'
import { CustomBackground } from './CustomBackground'
import { LivePreview } from './LivePreview'
import { tt } from '@/utils/i18n'
import { useColorPalette } from '@/hooks/useThemeColorPalette'
import { toaster } from '@/components/ui/toaster'

function toResolvedState(
  settings: ThemeBackgroundSettings,
  previewUrl: string | null,
): ThemeBackgroundResolvedState {
  return {
    settings,
    resolvedBackgroundUrl: previewUrl,
    isBackgroundRenderable: settings.backgroundImageEnabled && Boolean(previewUrl),
  }
}

function getBackgroundErrorMessage(error: unknown): string {
  if (error instanceof ThemeBackgroundError) {
    if (error.code === 'invalid-file-type') {
      return tt('settingPanel.theme.invalidFileType', 'Only PNG/JPG/WebP is supported')
    }
    if (error.code === 'file-too-large') {
      return tt('settingPanel.theme.fileTooLarge', 'Image size must be 5MB or less')
    }
    if (error.code === 'image-load-failed') {
      return tt('settingPanel.theme.imageLoadFailed', 'Image loading failed, please try again')
    }
  }

  if (error instanceof Error && error.message) return error.message
  return tt('settingPanel.theme.imageLoadFailed', 'Image loading failed, please try again')
}

export function ThemeSettingsView() {
  const siteContext = useMemo(() => getCurrentSiteContext(), [])
  const backgroundSettingsStorage = useMemo(
    () => getThemeBackgroundSettingsStorage(siteContext.siteKey),
    [siteContext.siteKey],
  )
  const {
    setSelectedThemeKey,
    customTheme,
    setCustomTheme,
    accentColor,
  } = useColorPalette()
  const [appearanceState, setAppearanceState] = useState<AppearanceState>(() => getAppearanceState())
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [backgroundState, setBackgroundState] = useState<ThemeBackgroundResolvedState | null>(null)
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(true)

  useEvent('settings:state-changed', (data) => {
    setIsPanelOpen(data.open)
  })

  const loadBackgroundState = useCallback(async () => {
    setIsBackgroundLoading(true)
    try {
      const nextCustomTheme = await getCustomThemeSettings()
      setCustomTheme(nextCustomTheme)
      const settings = await getThemeBackgroundSettings()
      const previewUrl = await resolveThemeBackgroundPreviewUrl(settings)
      setBackgroundState(toResolvedState(settings, previewUrl))
    } catch (error) {
      toaster.create({ type: 'error', title: getBackgroundErrorMessage(error) })
    } finally {
      setIsBackgroundLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBackgroundState()
  }, [loadBackgroundState])

  useEffect(() => {
    const unwatch = backgroundSettingsStorage.watch(async (newSettings) => {
      if (!newSettings) return
      try {
        const normalizedSettings = normalizeThemeBackgroundSettings(newSettings)
        const previewUrl = await resolveThemeBackgroundPreviewUrl(normalizedSettings)
        setBackgroundState(toResolvedState(normalizedSettings, previewUrl))
      } catch {
        // silently ignore watcher-triggered errors; initial load already handles error state
      }
    })
    return unwatch
  }, [backgroundSettingsStorage])

  useEffect(() => {
    if (!isPanelOpen || appearanceState.mode !== 'system') {
      return
    }

    const unsubscribe = subscribeSystemThemeChange(() => {
      setAppearanceState(setAppearanceMode('system'))
    })

    return unsubscribe
  }, [appearanceState.mode, isPanelOpen])

  const handleApplyCustomTheme = useCallback(
    async (
      partialSettings: {
        accentColor?: string
        surfaceColor?: string
        textColor?: string
      },
    ) => {
      const nextSettings = await applyCustomTheme({
        ...customTheme,
        ...partialSettings,
      })
      setCustomTheme(nextSettings)
      setSelectedThemeKey('custom')
    },
    [customTheme, setCustomTheme, setSelectedThemeKey],
  )

  const handleAppearanceChange = useCallback((mode: AppearanceMode) => {
    const state = setAppearanceMode(mode)
    setAppearanceState(state)
  }, [])

  const handleToggleBackground = useCallback(async (enabled: boolean) => {
    try {
      const state = await updateThemeBackgroundSettings({
        backgroundImageEnabled: enabled,
      })
      setBackgroundState(state)
    } catch (error) {
      toaster.create({ type: 'error', title: getBackgroundErrorMessage(error) })
    }
  }, [])

  const handleBlurChange = useCallback(async (value: number) => {
    try {
      const state = await updateThemeBackgroundSettings({ backgroundBlurPx: value })
      setBackgroundState(state)
    } catch (error) {
      toaster.create({ type: 'error', title: getBackgroundErrorMessage(error) })
    }
  }, [])

  const handleToggleSidebarScrim = useCallback(async (enabled: boolean) => {
    try {
      const state = await updateThemeBackgroundSettings({
        sidebarScrimEnabled: enabled,
      })
      setBackgroundState(state)
    } catch (error) {
      toaster.create({ type: 'error', title: getBackgroundErrorMessage(error) })
    }
  }, [])

  const handleSidebarScrimIntensityChange = useCallback(async (value: number) => {
    try {
      const state = await updateThemeBackgroundSettings({
        sidebarScrimIntensity: value,
      })
      setBackgroundState(state)
    } catch (error) {
      toaster.create({ type: 'error', title: getBackgroundErrorMessage(error) })
    }
  }, [])

  const handleToggleMessageGlass = useCallback(async (enabled: boolean) => {
    try {
      const state = await updateThemeBackgroundSettings({
        messageGlassEnabled: enabled,
      })
      setBackgroundState(state)
    } catch (error) {
      toaster.create({ type: 'error', title: getBackgroundErrorMessage(error) })
    }
  }, [])

  const handleWelcomeGreetingReadabilityModeChange = useCallback(
    async (mode: WelcomeGreetingReadabilityMode) => {
      try {
        const state = await updateThemeBackgroundSettings({
          welcomeGreetingReadabilityMode: mode,
        })
        setBackgroundState(state)
      } catch (error) {
        toaster.create({ type: 'error', title: getBackgroundErrorMessage(error) })
      }
    },
    [],
  )

  const handleUploadFile = useCallback(async (file: File) => {
    try {
      const state = await uploadThemeBackground(file)
      setBackgroundState(state)
    } catch (error) {
      toaster.create({ type: 'error', title: getBackgroundErrorMessage(error) })
      throw error
    }
  }, [])

  const handleRemoveImage = useCallback(async () => {
    try {
      const state = await removeThemeBackground()
      setBackgroundState(state)
    } catch (error) {
      toaster.create({ type: 'error', title: getBackgroundErrorMessage(error) })
      throw error
    }
  }, [])

  const previewState = useMemo(
    () => backgroundState ?? {
      settings: DEFAULT_THEME_BACKGROUND_SETTINGS,
      resolvedBackgroundUrl: null,
      isBackgroundRenderable: false,
    },
    [backgroundState],
  )
  return (
    <Box
      position="relative"
      height="100%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      data-view="theme-settings"
    >
      <Box
        flex="1"
        minH="0"
        overflowY="auto"
        pr={1}
      >
        <VStack align="stretch" gap={5}>
          <Box>
            <LivePreview
              backgroundEnabled={previewState.settings.backgroundImageEnabled}
              backgroundUrl={previewState.resolvedBackgroundUrl}
              blurPx={previewState.settings.backgroundBlurPx}
              sidebarScrimEnabled={
                siteContext.capabilities.sidebarScrim
                && previewState.settings.sidebarScrimEnabled
              }
              sidebarScrimIntensity={previewState.settings.sidebarScrimIntensity}
              messageGlassEnabled={
                siteContext.capabilities.messageGlass
                && previewState.settings.messageGlassEnabled
              }
              accentColor={accentColor}
              surfaceColor={customTheme.surfaceColor}
              textColor={customTheme.textColor}
            />
          </Box>

          <AppearanceSelector
            value={appearanceState.mode}
            onChange={handleAppearanceChange}
            isLoading={false}
          />
          <ColorPresets
            accentColor={customTheme.accentColor}
            surfaceColor={customTheme.surfaceColor}
            textColor={customTheme.textColor}
            onApplyCustomTheme={handleApplyCustomTheme}
            isLoading={false}
          />
          <CustomBackground
            capabilities={siteContext.capabilities}
            state={backgroundState}
            isLoading={isBackgroundLoading}
            onToggleBackground={handleToggleBackground}
            onBlurChange={handleBlurChange}
            onToggleSidebarScrim={handleToggleSidebarScrim}
            onSidebarScrimIntensityChange={handleSidebarScrimIntensityChange}
            onToggleMessageGlass={handleToggleMessageGlass}
            onWelcomeGreetingReadabilityModeChange={
              handleWelcomeGreetingReadabilityModeChange
            }
            onUploadFile={handleUploadFile}
            onRemoveImage={handleRemoveImage}
          />
        </VStack>
      </Box>
    </Box>
  )
}

ThemeSettingsView.displayName = 'ThemeSettingsView'
